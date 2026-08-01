# Chixiang Motor 网站协作规则

`FOUNDATION_STATUS: FROZEN`

当前 Foundation 基线以 `main` 的 PR #26 合并提交
`08c446ead90db58e00a71095d5ba1f71756d1c7f` 为准；详细验收与事实来源见
`docs/geo-entity/FOUNDATION_CLOSURE_AND_FREEZE.md`。

## 已冻结的基础契约

以下内容不得在普通页面改版中顺手重构或替换：

- 正式域、根路径重定向、clean URL、canonical、hreflang、Sitemap 与 robots；
- 页面 Owner 关系、原始 HTML 中的主要 H1、面包屑和 stable Schema IDs；
- `/api/contact`、Cloudflare Worker、Turnstile、表单字段与成功/失败语义；
- 只有 Worker 确认提交成功后才触发的 Google Ads 与 Yandex 转化；
- 已批准的公司事实、产品事实、型号命名与商业政策；
- 尚未确认的事实继续留空，尤其不得猜测 152FMH 的实际排量、缸径和行程。

修改上述内容必须同时满足：explicit user approval（用户明确批准）、可追溯的新证据、
separate PR（独立 PR）、相应自动化测试、Preview 验收和明确回滚方案。

## 下一阶段允许的工作

下一阶段是 visual redesign（页面外观改版）。可以调整布局、视觉层级、颜色、字体、
图片、响应式样式和组件外观，但必须保持：

- URL、canonical、hreflang、H1 主题、Schema ID 和实体 Owner 不变；
- 表单 action、字段名、Turnstile、Worker 与成功后转化逻辑不变；
- Google Ads、Yandex Metrica 及其已批准事件语义不变；
- 390px、768px、1024px 关键视口无横向溢出；
- 不因视觉改版明显恶化 LCP、CLS 或可访问性。

每批外观修改先提供 Preview，按页面验收；未经用户明确指令不得合并到 `main`。
