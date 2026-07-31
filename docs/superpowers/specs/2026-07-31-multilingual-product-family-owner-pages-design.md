# Chixiang Motor 多语言产品家族 Owner 页面统一设计

日期：2026-07-31  
分支：`feature/multilingual-product-family-owner-pages`

## 1. 目标

统一英语、西班牙语、葡萄牙语、俄语和阿拉伯语中的 CG、CB、卧式发动机、发动机配件四类产品家族页面，使客户、搜索引擎和 AI 能在不依赖 JavaScript 的情况下理解：

- 页面代表哪个产品家族；
- 当前公开供应范围；
- 已批准的型号、配置和应用；
- 哪些适配或数值必须在询价时确认；
- 如何进入 B2B 询盘流程。

本阶段完成内容和实体表达收口，不进行视觉改版。20 个页面全部完成后，统一提交 Preview 给网站所有者验收。

## 2. 页面范围

每种语言包含四个产品家族页面，共 20 页：

| 语言 | CG | CB | 卧式发动机 | 发动机配件 |
| --- | --- | --- | --- | --- |
| EN | `/en/cg-engine` | `/en/cb-engine` | `/en/horizontal-engine` | `/en/engine-parts` |
| ES | `/es/motor-cg` | `/es/motor-cb` | `/es/motor-horizontal` | `/es/repuestos-motor` |
| PT | `/pt/motor-cg` | `/pt/motor-cb` | `/pt/motor-horizontal` | `/pt/pecas-de-motor` |
| RU | `/ru/dvigatel-cg` | `/ru/dvigatel-cb` | `/ru/gorizontalnyj-dvigatel` | `/ru/zapchasti-dvigatelya` |
| AR | `/ar/cg-engine` | `/ar/cb-engine` | `/ar/horizontal-engine` | `/ar/engine-parts` |

英语 CG、英语卧式和俄罗斯卧式页面已具备较完整内容。本轮把它们作为事实和结构参考，只做必要同步，不为追求一致而破坏已有有效表达或俄罗斯询盘路径。

## 3. 内容来源与事实边界

公开内容只允许来自以下已批准来源：

1. `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv` 中 `APPROVED_PUBLIC` 且 `PUBLIC` 的记录；
2. `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv` 中允许公开的公司事实；
3. 已合并并经所有者批准的英语 Owner 页面和俄罗斯卧式型号治理结果；
4. 当前页面中与上述来源一致、且没有被事实治理否定的可见内容。

以下内容不得推断或补写：

- 未批准的实际排量、缸径、行程、功率、扭矩、安装尺寸或寿命；
- 通用适配、无条件替换、固定交期或运输承诺；
- 未批准的价格、MOQ、库存、证书编号或市场需求结论；
- 把 YX 市场参考名称写成 CHIXIANG 品牌或制造商身份；
- 把未来摩托车、CKD 或 SKD 项目写成当前产品供应。

## 4. 页面职责

### 4.1 CG 页面

解释 CG 发动机家族、风冷和已批准水冷配置、挡位/倒挡配置与应用边界。型号级数值只引用已批准记录。平衡轴、Tsunami、HW Water 和自动离合水冷属于家族或配置关系，不生成独立页面，也不被描述为全部型号的默认配置。

### 4.2 CB 页面

解释 CB150、CB200-C、CB250 的已批准公开范围和街车/越野应用方向。缺失的缸径、行程、点火和具体适配继续留空，不从行业常见数据推断。

### 4.3 卧式发动机页面

使用 CX 正式型号作为产品身份，YX 只作为俄罗斯及相关市场搜索参考：

- `CX152FMH` / `YX152FMH` / `YX110-class`；
- `CX153FMI` / `YX153FMI` / `YX125-class`；
- `CX154FMI` / `YX154FMI` / `YX125-class`；
- `CX1P56FMJ` / `YX1P56FMJ` / `YX140-class`；
- `CX1P60FMJ` / `YX1P60FMJ` / `YX150-class` / `W150-2`。

页面可说明脚启动、电启动、手动/半自动离合和补充倒挡配置，但不得公开仍为空白的实际排量、缸径或行程。俄罗斯页面保留站内表单优先、Email/WeChat/WhatsApp 补充的既有转化路径。

### 4.4 发动机配件页面

作为发动机配件家族 Owner，说明当前可供应的备件类别、批量采购、与发动机型号/配置核对的必要性。没有事实依据时不写具体材料、寿命、原厂等级、通用兼容或库存承诺。

## 5. 统一内容骨架

保持现有视觉样式和页面组件，只保证每页在原始 HTML 中具备以下语义内容：

1. 唯一、明确的 H1；
2. 产品家族定位和 B2B 供应说明；
3. 已批准型号或家族配置；
4. 适用场景及明确的适配边界；
5. 采购前需要确认的信息；
6. 指向 Products、About、Contact 和相关产品家族的有效内链；
7. 与页面语言一致的询盘 CTA；
8. 现有可见面包屑和安全实体 Schema 保持同步。

“统一”指信息职责、事实边界和采购路径统一，不要求逐句翻译或页面字数完全相同。各语言可以使用自然的本地 B2B 表达。

## 6. SEO 与 GEO 规则

- H1、首段、核心家族说明和采购边界直接写入 HTML，不通过 JavaScript 后填充；
- Title、Description、canonical、hreflang 和现有 URL 不改变，除非发现明确错误；
- 每页只负责一个产品家族，不与 Products 总目录或国家落地页争夺 Owner 身份；
- Products 页负责总目录，产品家族页负责产品定义和选择，国家页负责市场场景和转化；
- JSON-LD 只能复述可见且已批准的内容；
- 继续禁止新增 `Product`、`ProductGroup`、`Offer`、`Review`、`AggregateRating`；
- 不为关键词覆盖新增薄页面或重复型号页。

## 7. 视觉与交互边界

本阶段不改：

- 页面总体布局、Hero 设计、产品卡样式或颜色系统；
- 图片资产和图片构图；
- Header、Footer、移动菜单、表单交互；
- Google Ads、Yandex Metrica、Turnstile、Worker 或转换回调；
- 国家广告落地页设计。

允许的可见变化仅限内容增删、标题层级、已有区块中的文字、表格内容和必要的内部链接。页面视觉改版另开独立阶段和 PR。

## 8. 实施方式

- 从合并后的 `main` 创建一个独立分支；
- 一次完成 20 页，不要求中途逐页审批；
- 使用测试约束事实来源、页面覆盖、链接、语言、Schema 和禁止声明；
- 优先采用可重复的数据/生成规则，避免五种语言手工漂移；
- 不自动合并最终 PR。

## 9. 验收标准

### 自动验收

- 20 个页面全部存在且继续位于 sitemap；
- 每页恰好一个 H1，核心内容存在于原始 HTML；
- 已批准型号和配置没有被错误翻译或扩张；
- 禁止声明、未来产品、虚构商业数据和禁用 Schema 不出现；
- canonical、hreflang、面包屑、内部链接和安全 Schema 保持有效；
- 全量网站与 Worker 测试通过；
- 生成器无漂移，`git diff --check` 通过。

### 浏览器验收

- 20 个独立 Cloudflare Preview 链接全部可访问；
- 390×844 与桌面宽度下无横向溢出；
- H1、表格、CTA、面包屑和 RTL 阿拉伯语正常；
- 俄罗斯卧式表单和现有联系方式不受影响。

### 所有者验收

全部页面完成后一次性提供：

- 20 个 Preview 链接；
- 页面变更摘要；
- 自动测试和浏览器抽查结果；
- 仍然没有公开的未知字段清单。

未经所有者最终明确批准，不合并本阶段 PR。

## 10. 回滚

PR 合并前可直接关闭，不影响正式网站。合并后如需整体撤销，使用一次 `git revert <merge-commit>`，避免单独删除某种语言或某个生成区块造成事实和 Schema 再次分裂。
