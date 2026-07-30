import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDir, '..');
const outputRoot = path.join(root, 'outputs', 'phase-6-1b-preview');
const safeParent = `${path.join(root, 'outputs')}${path.sep}`;
if (!outputRoot.startsWith(safeParent)) throw new Error(`unsafe output path: ${outputRoot}`);

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
if (!fs.existsSync(edge)) throw new Error(`Microsoft Edge not found: ${edge}`);

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });
const profile = path.join(outputRoot, '.edge-profile');

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (urls.length !== 51) throw new Error(`expected 51 sitemap URLs, got ${urls.length}`);

const tabletPaths = new Set([
  '/ru/russia/',
  '/ru/central-asia/',
  '/ru/gorizontalnyj-dvigatel',
  '/es/peru/',
  '/es/colombia/'
]);
const baseViewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 }
];
const tabletViewports = [
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-1024', width: 1024, height: 1366 }
];

function sourceFor(pathname) {
  return pathname.endsWith('/') ? `${pathname.slice(1)}index.html` : `${pathname.slice(1)}.html`;
}

function slugFor(pathname) {
  const clean = pathname.replace(/^\/+|\/+$/g, '') || 'root';
  return clean.replaceAll('/', '__');
}

async function waitForFile(file, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(file)) return;
    await delay(100);
  }
  throw new Error(`timed out waiting for ${file}`);
}

async function openWebSocket(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    const timeout = setTimeout(() => reject(new Error(`timed out opening ${url}`)), 15000);
    socket.addEventListener('open', () => {
      clearTimeout(timeout);
      resolve(socket);
    }, { once: true });
    socket.addEventListener('error', () => {
      clearTimeout(timeout);
      reject(new Error(`failed to open ${url}`));
    }, { once: true });
  });
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.waiters = new Map();
    socket.addEventListener('message', (event) => this.handleMessage(event));
  }

  handleMessage(event) {
    const raw = typeof event.data === 'string' ? event.data : Buffer.from(event.data).toString('utf8');
    const message = JSON.parse(raw);
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timeout);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result ?? {});
      return;
    }

    const key = `${message.sessionId ?? ''}:${message.method}`;
    const waiter = this.waiters.get(key);
    if (!waiter) return;
    this.waiters.delete(key);
    clearTimeout(waiter.timeout);
    waiter.resolve(message.params ?? {});
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    const message = { id, method, params };
    if (sessionId) message.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, 30000);
      this.pending.set(id, { resolve, reject, timeout });
      this.socket.send(JSON.stringify(message));
    });
  }

  waitFor(method, sessionId, timeoutMs = 30000) {
    const key = `${sessionId ?? ''}:${method}`;
    if (this.waiters.has(key)) throw new Error(`duplicate CDP waiter: ${key}`);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.waiters.delete(key);
        reject(new Error(`CDP event timed out: ${method}`));
      }, timeoutMs);
      this.waiters.set(key, { resolve, reject, timeout });
    });
  }
}

const edgeProcess = spawn(edge, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-networking',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  'about:blank'
], { stdio: 'ignore', windowsHide: true });

let cdp;
let targetId;
let captured = 0;
try {
  const devToolsPortFile = path.join(profile, 'DevToolsActivePort');
  await waitForFile(devToolsPortFile);
  const [port, browserPath] = fs.readFileSync(devToolsPortFile, 'utf8').trim().split(/\r?\n/);
  if (!port || !browserPath) throw new Error('invalid DevToolsActivePort file');
  const socket = await openWebSocket(`ws://127.0.0.1:${port}${browserPath}`);
  cdp = new CdpClient(socket);

  ({ targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' }));
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Network.enable', {}, sessionId);
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }, sessionId);

  for (const rawUrl of urls) {
    const pathname = new URL(rawUrl).pathname;
    const source = sourceFor(pathname);
    if (!fs.existsSync(path.join(root, source))) throw new Error(`missing source: ${source}`);
    const language = pathname.split('/').filter(Boolean)[0];
    const targetDir = path.join(outputRoot, language);
    fs.mkdirSync(targetDir, { recursive: true });
    const viewports = tabletPaths.has(pathname) ? [...baseViewports, ...tabletViewports] : baseViewports;

    for (const viewport of viewports) {
      const target = path.join(targetDir, `${slugFor(pathname)}--${viewport.name}.png`);
      const localUrl = `http://127.0.0.1:8123/${source.replaceAll('\\', '/')}`;
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.width < 600,
        screenWidth: viewport.width,
        screenHeight: viewport.height,
        dontSetVisibleSize: false
      }, sessionId);
      const loaded = cdp.waitFor('Page.loadEventFired', sessionId);
      await cdp.send('Page.navigate', { url: localUrl }, sessionId);
      await loaded;
      await delay(1200);

      const metrics = await cdp.send('Page.getLayoutMetrics', {}, sessionId);
      const layout = metrics.cssLayoutViewport ?? metrics.layoutViewport;
      if (Math.round(layout.clientWidth) !== viewport.width || Math.round(layout.clientHeight) !== viewport.height) {
        throw new Error(`${pathname}:${viewport.name}: expected ${viewport.width}x${viewport.height}, got ${layout.clientWidth}x${layout.clientHeight}`);
      }

      const { data } = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
        clip: { x: 0, y: 0, width: viewport.width, height: viewport.height, scale: 1 }
      }, sessionId);
      const image = Buffer.from(data, 'base64');
      if (image.length < 10000) throw new Error(`suspicious screenshot ${target}: ${image.length} bytes`);
      if (image.readUInt32BE(16) !== viewport.width || image.readUInt32BE(20) !== viewport.height) {
        throw new Error(`${target}: PNG dimensions do not match viewport`);
      }
      fs.writeFileSync(target, image);
      captured += 1;
    }
  }

  await cdp.send('Target.closeTarget', { targetId });
  if (captured !== 112) throw new Error(`expected 112 screenshots, got ${captured}`);
  console.log(`captured ${captured} screenshots in ${outputRoot}`);
} finally {
  if (cdp) await cdp.send('Browser.close').catch(() => {});
  if (!edgeProcess.killed) edgeProcess.kill();
  await delay(300);
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
