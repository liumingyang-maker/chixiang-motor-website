# WhatsApp Click Conversion Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record every user-initiated click on a site `wa.me` link as the secondary Google Ads conversion `WhatsApp 点击` without disrupting WhatsApp navigation or the existing form conversion.

**Architecture:** Add a small, isolated reporting helper and one delegated document click listener inside the existing shared `js/main.js`. Exercise the real script through Node's built-in test runner and a minimal fake DOM, so the behavior is verified without adding third-party dependencies.

**Tech Stack:** Static HTML, browser JavaScript, Google Ads `gtag`, Node.js `node:test`, Node.js `vm`.

---

## File structure

- Modify `js/main.js`: own the site-wide WhatsApp click listener and Google Ads event emission.
- Create `tests/whatsapp-conversion.test.js`: execute `js/main.js` in a minimal DOM harness and verify event emission and failure safety.

### Task 1: Add tested site-wide WhatsApp conversion reporting

**Files:**
- Modify: `js/main.js:8-25`
- Create: `tests/whatsapp-conversion.test.js`

- [ ] **Step 1: Write the failing behavior test**

Create `tests/whatsapp-conversion.test.js` with:

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'main.js'), 'utf8');
const whatsappSendTo = 'AW-16777656395/bovKCKOx088cEMvwmsA-';

function boot(gtag) {
  const listeners = new Map();
  const document = {
    readyState: 'loading',
    body: { style: {} },
    documentElement: { lang: 'en' },
    addEventListener(type, handler) {
      const handlers = listeners.get(type) || [];
      handlers.push(handler);
      listeners.set(type, handlers);
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    createElement() { return {}; },
    head: { appendChild() {} }
  };
  const window = {
    location: { search: '', pathname: '/', href: 'https://example.com/' },
    addEventListener() {},
    innerHeight: 900
  };
  if (gtag !== undefined) window.gtag = gtag;

  vm.runInNewContext(source, {
    document,
    window,
    URLSearchParams,
    console,
    setTimeout,
    clearTimeout
  });
  const readyHandlers = listeners.get('DOMContentLoaded') || [];
  assert.equal(readyHandlers.length, 1);
  readyHandlers[0]();
  return listeners.get('click') || [];
}

function whatsappTarget() {
  return {
    closest(selector) {
      assert.equal(selector, 'a[href*="wa.me/"]');
      return { href: 'https://wa.me/8619008225410' };
    }
  };
}

test('reports one WhatsApp conversion without blocking navigation', () => {
  const calls = [];
  const clickHandlers = boot((...args) => calls.push(args));
  assert.equal(clickHandlers.length, 1, 'expected one delegated WhatsApp click listener');
  let prevented = false;
  clickHandlers[0]({ target: whatsappTarget(), preventDefault() { prevented = true; } });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'event');
  assert.equal(calls[0][1], 'conversion');
  assert.equal(calls[0][2].send_to, whatsappSendTo);
  assert.equal(prevented, false);
});

test('ignores non-WhatsApp clicks', () => {
  const calls = [];
  const clickHandlers = boot((...args) => calls.push(args));
  clickHandlers[0]({ target: { closest() { return null; } } });
  assert.equal(calls.length, 0);
});

test('preserves clicks when gtag is missing or throws', () => {
  const missingHandlers = boot(undefined);
  assert.doesNotThrow(() => missingHandlers[0]({ target: whatsappTarget() }));
  const throwingHandlers = boot(() => { throw new Error('blocked'); });
  assert.doesNotThrow(() => throwingHandlers[0]({ target: whatsappTarget() }));
});

test('keeps the existing form conversion destination', () => {
  assert.match(source, /AW-16777656395\/Om_nCMCV4swcEMvwmsA-/);
});
```

- [ ] **Step 2: Run the test and verify that it fails before implementation**

Run:

```powershell
node --test tests/whatsapp-conversion.test.js
```

Expected: FAIL in `reports one WhatsApp conversion without blocking navigation` because no delegated WhatsApp click listener exists.

- [ ] **Step 3: Add the minimal implementation**

In `js/main.js`, immediately after the existing form `gtag_report_conversion` helper, add:

```javascript
    function reportWhatsAppConversion() {
      if (typeof window.gtag !== 'function') return;

      try {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-16777656395/bovKCKOx088cEMvwmsA-'
        });
      } catch (error) {
        // Tracking must never prevent the visitor from opening WhatsApp.
      }
    }

    document.addEventListener('click', function(event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') return;
      if (!target.closest('a[href*="wa.me/"]')) return;

      reportWhatsAppConversion();
    });
```

Do not add inline handlers to HTML. Do not modify the existing form conversion destination.

- [ ] **Step 4: Run automated syntax and behavior checks**

Run:

```powershell
node --check js/main.js
node --test tests/whatsapp-conversion.test.js
```

Expected: syntax check exits 0 and all four tests pass.

- [ ] **Step 5: Verify repository-wide coverage and absence of inline duplication**

Run:

```powershell
$html = Get-ChildItem -Recurse -Filter *.html
$contentPages = $html | Where-Object {
  Select-String -LiteralPath $_.FullName -Pattern 'wa\.me/' -Quiet
}
$withoutMain = $contentPages | Where-Object {
  -not (Select-String -LiteralPath $_.FullName -Pattern 'js/main\.js' -Quiet)
}
"WHATSAPP_PAGES=$($contentPages.Count)"
"WHATSAPP_PAGES_WITHOUT_MAIN_JS=$($withoutMain.Count)"
rg -n "bovKCKOx088cEMvwmsA-|reportWhatsAppConversion" --glob "*.html"
```

Expected: `WHATSAPP_PAGES_WITHOUT_MAIN_JS=0`; the final `rg` command returns no HTML matches.

- [ ] **Step 6: Review the exact diff**

Run:

```powershell
git diff --check
git diff -- js/main.js tests/whatsapp-conversion.test.js
```

Expected: no whitespace errors; the diff contains only the isolated listener/helper and its tests.

- [ ] **Step 7: Commit the verified implementation**

Run:

```powershell
git add js/main.js tests/whatsapp-conversion.test.js
git commit -m "feat: track WhatsApp clicks in Google Ads"
```

Expected: one commit containing only the implementation and test files. Do not push or deploy in this task.

### Task 2: Prepare deployment verification handoff

**Files:**
- Verify only: `js/main.js`
- Verify only: `tests/whatsapp-conversion.test.js`

- [ ] **Step 1: Confirm the worktree is clean and record the commit**

Run:

```powershell
git status --short
git log -1 --oneline
```

Expected: clean status and the latest commit message `feat: track WhatsApp clicks in Google Ads`.

- [ ] **Step 2: Report the controlled deployment boundary**

Report that local implementation is verified but not yet pushed. After explicit deployment approval, push the commit, wait for Cloudflare Pages to publish it, then use Google Tag Assistant to click a live WhatsApp button and confirm destination `AW-16777656395/bovKCKOx088cEMvwmsA-` is received once.
