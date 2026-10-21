# 02 路由与 SEO 对照表

## 中文 URL（生产 clean URL）

| 工作包 | URL | 对应英文 | title 要点 |
| --- | --- | --- | --- |
| Z01 | `/zh-cn/` | `/en/` | 重庆摩托车发动机厂家 |
| Z02 | `/zh-cn/products` | `/en/products` | 发动机产品总览 |
| Z03 | `/zh-cn/horizontal-engine` | `/en/horizontal-engine` | 110–150 卧机 |
| Z04 | `/zh-cn/cg-engine` | `/en/cg-engine` | CG 风冷/水冷 |
| Z05 | `/zh-cn/cargo-tricycle-engine` | （主题页） | 三轮动力采购 |
| Z06 | `/zh-cn/about` | `/en/about` | 关于重庆驰翔 |
| Z07 | `/zh-cn/factory` | （About 扩展） | 工厂与检测 |
| Z08 | `/zh-cn/evidence` | （新增） | 公开证据中心 |
| Z09 | `/zh-cn/domestic-wholesale` | （About/Contact 扩展） | 国内采购/1688 |
| Z10 | `/zh-cn/contact` | `/en/contact` | 联系询价 |
| Z11 | `/zh-cn/cb-engine` | `/en/cb-engine` | CB 系列 |
| Z12 | `/zh-cn/ac320-atv-engine` | `/en/ac320-atv-engine` | AC320 |
| Z13 | `/zh-cn/engine-parts` | `/en/engine-parts` | 配件 |
| Z14–17 | `/zh-cn/guides/...` | （知识文章） | 采购指南 |

## SEO 约定

- `<html lang="zh-CN">`；canonical 自指；hreflang 仅真实成对页。
- 英文核心页已加 `hreflang="zh-CN"`。
- 根 `/` 仍 301 `/en/`；不按 IP/UA 强制跳语种。
- sitemap 含 18 条中文 URL；robots 仍 `Allow: /`。
- 实体图由 `apply-site-entity-schema.js` 生成（`data-site-entity-graph`）。
