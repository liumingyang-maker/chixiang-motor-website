# 00 现状审计 — 驰翔官网（2026-10-21）

## 1. 技术栈（与任务书假设的差异）

| 任务书假设 | 实际仓库 | 处置 |
| --- | --- | --- |
| Astro | **静态 HTML/CSS/JS + Node 生成器** | 沿用静态站；中文页直接输出 HTML，不引入 Astro |
| package manager / build | 无 npm build；`node --test tests/*.test.js` + 三生成器 `--check` | 保持 |
| 部署 | Cloudflare Workers + static assets（`wrangler.toml` / `workers/site-router.mjs`） | 不改 Worker/WAF |
| 多语言 | 目录式：`en/` `es/` `pt/` `ru/` `ar/`，文件如 `en/cg-engine.html` | 新增 `zh-cn/` |

## 2. 现有语言与路由

- 根 `/` → 301 `/en/`（保持）。
- Clean URL 由 Worker 规范化；`sitemap.xml` 已是 clean URL。
- 产品家族页由 `scripts/apply-product-family-owner-content.js` 注入；Contact 由 `apply-contact-procurement-owner-content.js`。
- 冻结：`AGENTS.md` Foundation 契约、`js/main.js`、`workers/*`、sitemap 规则（改 sitemap 需同步 invariants）。

## 3. 关键页面基线

| 路径 | 状态 |
| --- | --- |
| `en/index|products|about|contact|cg-engine|cb-engine|horizontal-engine|engine-parts|ac320-atv-engine` | 已批准内容与事实 |
| `images/factory-showcase/factory-1..6.webp` 等 | 可复用工厂图 |
| `en/about` 1688 / ISO / CCC | 已有审慎口径，可译写 |
| `ru/index.html` | **仍有 24 小时 SLA**（见 03） |
| `en/product-detail.html` | 工具页仍有 `100–125cc` 标签（见 03） |

## 4. SEO 现状

- 每页 `lang` + 自指 canonical + 五语 hreflang + `x-default`→`/en/`。
- `robots.txt`：`Allow: /` + Sitemap。
- 结构化数据：Organization/WebSite/Breadcrumb/FAQPage（生成器维护）。

## 5. 本轮改动面

1. 新增 `zh-cn/**` 页面与指南（Z01–Z17）。
2. `docs/ai-cn/**` 台账与报告。
3. 现有语言 head 增加 `zh-CN` alternate（仅成对页）；语言切换增加「简体中文」。
4. 修正 RU 24h SLA 等跨语言错误。
5. sitemap 增加中文 URL；测试守住事实与禁词。
6. **不改** Worker/WAF/表单契约/301/根路径行为。

## 6. 保留功能（不得回归）

询盘表单与 Turnstile、广告/统计、P1 301、家族锚点（含 PR #47 九型号）、水冷采购说明、三主体表述、CKD 筹备中边界。
