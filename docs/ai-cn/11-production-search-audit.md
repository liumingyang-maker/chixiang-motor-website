# 11 生产搜索审计（P0-1）

审计时间：2026-10-21（UTC）  
生产 merge：`b47b74e` · 审计工具：Python urllib 单路径 GET（非中国大陆网络）  
说明：中国大陆网络可达性待负责人协助抽测；单点外部工具失败不等于生产不可达。

## 1. 18 个中文 URL

| URL | HTTP | 最终 URL | lang=zh-CN | canonical 自指 | X-Robots-Tag | noindex meta | H1 | 结果 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/zh-cn/` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/products` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/horizontal-engine` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/cg-engine` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/cargo-tricycle-engine` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/about` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/factory` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/evidence` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/domestic-wholesale` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/contact` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/cb-engine` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/ac320-atv-engine` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/engine-parts` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/guides/` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/guides/cg250-water-cooled-selection` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/guides/horizontal-engine-buying-checklist` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/guides/how-to-verify-engine-factory` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |
| `/zh-cn/guides/engine-fitment-checklist` | 200 | 同左 | ✓ | ✓ | 空 | 无 | ✓ | PASS |

无 404/5xx；正文含中文 H1/可见内容。

## 2. 原语言与基础文件

| 项 | 结果 |
| --- | --- |
| `/en/` `/ru/` | 200，无 noindex |
| `robots.txt` | `User-agent: *` / `Allow: /` / Sitemap 声明 ✓ |
| `sitemap.xml` | 200；中文 URL **18** 条；无 Preview 域名 |
| 生产 `X-Robots-Tag` | **空**（预览 noindex 未带入生产）✓ |

## 3. 跨语言排量 / CCC（实时生产，非搜索快照）

| 检查 | 结果 | 说明 |
| --- | --- | --- |
| `/en/products` 是否仍有 `100–125` | **否** | 现网 HTML 已是 `110–150`；检索摘要为**缓存旧版** |
| `/en/horizontal-engine` `110–150` | 是 | 一致 |
| `/ru/` `50–125cc` | **否** | 本轮 PR48 已改 |
| `/ru/` 泛化 `CCC Certified` | 否 | 现为按型号口径 |
| `/ru/` 24h SLA | **否**（假阳性为 SVG `viewBox 24`） | SLA 文案已删 |

**结论：无需因 `100–125` 再改 `/en/products`；属搜索缓存。**

## 4. 表单与转化链路

| 项 | 状态 | 证据 |
| --- | --- | --- |
| `/zh-cn/contact` 表单结构 | PASS | `action=/api/contact`、honeypot、必填字段 |
| 1688 链接 | PASS | `shop7p518ep539950.1688.com` |
| 电话 `tel:` | PASS | `+86 19008225410` |
| 误标微信二维码 | PASS | 已移除 |
| 真实邮件送达 | **PASS（Owner 确认）** | 见 PR48 发布记录；Turnstile 自动化不可代测 |

## 5. Cloudflare / 抓取

- Preview：`X-Robots-Tag: noindex`（隔离）  
- 生产：无 noindex  
- 未改 WAF；**禁止**仅凭 UA=Baiduspider 全局放行。是否影响合规抓取需站长平台反馈后再评估。

## 6. 待人工

- 中国大陆网络路径抽检（负责人）  
- 百度资源平台登录验证与提交（见 `12-baidu-verify-submit.md`）  
