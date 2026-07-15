# 落地页交接与安全发布规范

本规范用于维护驰翔摩托的独立国家/区域广告落地页。当前已上线页面：

- 秘鲁：`/es/peru/`
- 哥伦比亚：`/es/colombia/`

## 1. 不可违反的边界

- 不得覆盖 `ru/`、`ru/central-asia/`、`ru/dvigateli-dlya-uzbekistana.html` 或现有 `es/` 官网页面。
- 国家页必须位于独立路径，例如 `es/<country>/index.html`；不得把广告页直接写进 `es/index.html`。
- 不引入 React、Vue、构建工具或第三方前端框架。保持静态 HTML、CSS 和原生 JavaScript。
- 不编造 MOQ、交期、质保、认证、物流时效、技术参数或非真实工厂/客户图片。
- 排量统一使用 `cc`，例如 `150 cc`；不要写 `cm3` 或 `cm³`。
- 不复制 Google Ads、GA、Turnstile 或表单提交代码。现有公共逻辑由 `js/main.js` 处理。

## 2. 文件职责

| 位置 | 职责 |
| --- | --- |
| `es/peru/index.html` | 秘鲁独立页结构、SEO、表单骨架和模块锚点。 |
| `es/colombia/index.html` | 哥伦比亚独立页结构、SEO、表单骨架和模块锚点。 |
| `css/latam-cg-landing.css` | 仅限拉美落地页的视觉和响应式样式。 |
| `js/latam-cg-products.js` | 已核验的产品、图库和工厂图片共用数据。 |
| `js/latam-cg-peru-data.js` | 秘鲁市场文案、产品顺序和 WhatsApp 模板。 |
| `js/latam-cg-colombia-data.js` | 哥伦比亚市场文案、产品顺序和 WhatsApp 模板。 |
| `js/latam-cg-landing.js` | 渲染、手风琴、图库、导航、表单摘要及 WhatsApp 上下文。 |
| `tests/latam-cg-*.test.js` | 路由、资产、表单、SEO 和交互回归测试。 |

## 3. 修改规则

1. **市场文案或产品选择**：优先修改对应市场数据文件，不要在 HTML 和 JavaScript 多处硬编码。
2. **共用产品、图片或参数**：只在 `js/latam-cg-products.js` 更新，并确认每个引用的本地文件真实存在。
3. **版式**：只在 `css/latam-cg-landing.css` 增加页面作用域内的选择器；不要修改全局 `css/style.css`，除非改动同时经过全站回归验证。
4. **新国家页面**：复制已批准的市场页结构，新增 `js/latam-cg-<country>-data.js`，填写独立 canonical、`hreflang`、市场数据、预填国家和来源代码。然后为页面添加测试和 sitemap 条目。
5. **表单**：保留 `name`、`contact`、`country`、`application`、`product_interest`、`displacement`、`quantity`、`vehicle`、`engine_code`、`email`、`requirements`、`market`、`source_form` 字段。隐藏的 `message` 由 `latam-cg-landing.js` 自动汇总，不能删除。
6. **WhatsApp**：一律使用 `data-whatsapp-link` 和 `data-source`。不要硬编码号码或链接；产品、国家、应用场景和 UTM/GCLID 由脚本带入。
7. **无障碍与响应式**：交互控件必须保留焦点状态、`aria-expanded`/`aria-controls`；移动端 0–767px、平板 768–1199px、桌面 ≥1200px。禁止页面级横向滚动。
8. **SEO**：已批准上线的页面必须使用 `index,follow`、自指 canonical 和 `sitemap.xml` 条目。未批准的预览页必须为 `noindex,nofollow`，且不得写入 sitemap。

## 4. 每次修改的标准流程

1. 从最新 `main` 创建功能分支：`git switch main`、`git pull --ff-only`、`git switch -c feature/<country>-landing-update`。
2. 只修改本任务关联文件；先检查 `git status --short`，不得混入他人未提交的变更。
3. 运行验证：

   ```powershell
   node --test tests/*.test.js
   git diff --check
   ```

4. 本地预览：

   ```powershell
   npx --yes serve -l 4175
   ```

   分别检查 390px、768px、1024px、1440px。至少检查：标题未被导航遮挡、无横向滚动、产品展开唯一、表单不被移动 CTA 覆盖、WhatsApp 带入正确上下文。
5. 完成后仅提交相关文件，提交说明使用英文动词开头，例如 `feat: add Ecuador landing page` 或 `fix: improve Peru quote form`。
6. 先推送功能分支供审核；只有负责人确认后才合并/快进到 `main`。

## 5. 上线与回退

本仓库由 **Cloudflare Pages** 从 GitHub `main` 自动发布。框架为 None，构建命令为空，输出目录为仓库根目录。

### 上线

```powershell
git switch main
git merge --ff-only feature/<branch>
git push origin main
```

随后在 Cloudflare Pages 部署记录中确认生产部署成功，并访问对应正式 URL 检查首屏、表单、Turnstile 和 WhatsApp。

### 回退

禁止使用 `git reset --hard`、强推或删除历史。若上线后需要撤回：

```powershell
git revert <发布提交SHA>
git push origin main
```

如需完整恢复基线，请使用桌面备份中的 Git bundle 或源码 ZIP；操作步骤见 `docs/SPANISH_LANDING_RELEASE_RESTORE.md`。

## 6. 当前基线

西语落地页发布基线以 Git 标签 `release/spanish-peru-colombia-2026-07-15` 为准。任何后续改动先从该基线或最新 `main` 创建新分支。
