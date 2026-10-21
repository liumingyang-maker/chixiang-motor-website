# 2026-10-21 实现报告 — 中文站 + 证据中心 + AI 可发现性

## 1. 基线与分支

| 项 | 值 |
| --- | --- |
| 基线 commit | `b5acee0`（main，含 PR #47） |
| 工作分支 | `codex/zh-cn-evidence-center` |
| 技术调整 | **非 Astro**：沿用静态 HTML + 生成器 + Cloudflare Workers |
| PR | 见提交后链接（**Draft，待批准，不合并**） |

## 2. 交付页面（18）

| URL | 标题摘要 | 英文对应 |
| --- | --- | --- |
| `/zh-cn/` | 重庆摩托车及货运三轮车发动机制造与供应 | `/en/` |
| `/zh-cn/products` | 在售系列 + CKD 筹备隔离 | `/en/products` |
| `/zh-cn/horizontal-engine` | 五款 CX 卧机 + 采购清单 | `/en/horizontal-engine` |
| `/zh-cn/cg-engine` | CG 风冷/水冷表 + 倒挡限定 | `/en/cg-engine` |
| `/zh-cn/cargo-tricycle-engine` | 三轮动力核对清单 | 主题页 |
| `/zh-cn/about` | 三主体 + 2003/2007 区分 | `/en/about` |
| `/zh-cn/factory` | 车间实拍 + 流程边界 | About 扩展 |
| `/zh-cn/evidence` | 三公开来源证据中心 | **新增** |
| `/zh-cn/domestic-wholesale` | 1688 + 国内联系 | **新增** |
| `/zh-cn/contact` | 国内询价表单 | `/en/contact` |
| `/zh-cn/cb-engine` | CB150/200-C/250 | `/en/cb-engine` |
| `/zh-cn/ac320-atv-engine` | AC320 287.2cc 专页 | `/en/ac320-atv-engine` |
| `/zh-cn/engine-parts` | 配件按型号/订单 | `/en/engine-parts` |
| `/zh-cn/guides/` | 指南索引 | — |
| `/zh-cn/guides/cg250-water-cooled-selection` | CG250 水冷选型 | — |
| `/zh-cn/guides/horizontal-engine-buying-checklist` | 卧机采购清单 | — |
| `/zh-cn/guides/how-to-verify-engine-factory` | 核实工厂方法 | — |
| `/zh-cn/guides/engine-fitment-checklist` | 同排量≠互换 | — |

## 3. 公开证据（真实来源）

| ID | 来源 | 证明 | 不代表 |
| --- | --- | --- | --- |
| F-08 | gxq.cq.gov.cn 2024-06-28 公示 | 科技型企业入库补助—通过 | 高企证书 |
| F-09 | mopei8.com 2023-10-29 名录 | 展位 2T85、发动机类 | 官方推荐 |
| F-10 | Google Patents CN221406869U | 线缆散热结构专利公开 | 整机性能认证 |

F-12（2025 高企）**未**对外发布。

## 4. 未认证 / 待确认

- 产能、面积、合格率、出口国别：仅 `website_existing`，未进首屏强背书  
- ISO/CCC/高企编号：不公开，只保留核对流程  
- 152FMH 实际排量/缸径行程：继续留空  

## 5. 跨语言修复

- `ru/index.html`：删除「24 小时回复」SLA  
- 英文 9 个核心页增加 `hreflang="zh-CN"`  

## 6. SEO / 抓取

- sitemap +18 中文 URL；robots 仍全站 Allow  
- 实体图由 `apply-site-entity-schema.js` 幂等生成  
- 中文测试 C01–C14 通过；全站 **401/401**  

## 7. 未完成及理由

| 项 | 理由 |
| --- | --- |
| Preview 浏览器截图矩阵 | 需 PR 预览部署后补 |
| 百度/Bing 验证提交 | 需账号与授权 |
| 1688 简介上线 | 需人工粘贴 |
| 目录纠错提交 | 需人工工单 |
| AI 问答基线实测 | 需上线后人工在各 App 测 |

## 8. 最短授权清单

见 `docs/ai-cn/09-manual-approval-needed.md`。**合并前须负责人批准。**
