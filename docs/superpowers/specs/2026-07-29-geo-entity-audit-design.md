# Chixiang Motor GEO Entity Audit Design

日期：2026-07-29

状态：已批准执行

## 1. 目标

Phase 6.0 建立一个可审计的 Chixiang Motor 数字实体模型，为后续页面内容、内部链接、Schema、多语言一致性、AI 引用和广告落地提供事实基础。

本阶段不是寻找理由新增页面，也不以页面数量作为成果。审计必须允许得出 `DO_NOT_BUILD_YET`、`NEEDS_EVIDENCE` 或继续由现有系列页承载的结论。

## 2. 已选择的方法

采用“证据优先的混合审计”：

1. 以正式网站、仓库静态内容和已合并 Foundation 报告作为当前事实基线。
2. 使用仓库中的 Phase 5 研究资料作为内部参考，但保留其原始证据等级和数据缺口。
3. 仅在需要补充或核对事实时使用可引用的公开来源，并记录 URL、发布日期或访问日期。
4. 不使用客户聊天原文、个人信息、原始销售记录或未脱敏广告后台导出。
5. 私有商业数据未来只能以站主提供的汇总事实加入，标记为 `PRIVATE`，不能直接转写为公开页面声明。

未采用的方法：

- 纯网站盘点：速度快，但无法区分商业优先级与内容完整度。
- 关键词先行批量建页：容易把搜索词误当实体并制造薄页面。
- 固定权重总分：当前数据不足，百分比权重会制造伪精确结论。

## 3. 范围

### 3.1 实体类型

- `ORGANIZATION`：法定公司实体。
- `BRAND`：CHIXIANG MOTOR / Chixiang Motor 品牌。
- `PRODUCT_FAMILY`：CG、CB、Horizontal、Water-cooled/Heavy-duty、Engine Parts 等产品家族。
- `PRODUCT_MODEL`：CG150、CG200、152FMH、153FMI、154FMI、1P56FMJ 等具体型号；只有页面和资料真实出现的型号才进入矩阵。
- `APPLICATION`：Motorcycle、Cargo Tricycle、ATV、Pit Bike、Enduro、Replacement、Assembly Project 等用途。
- `MARKET`：Russia、Central Asia、Uzbekistan、Peru、Colombia 等已有页面或研究资料覆盖的市场。
- `CAPABILITY`：Manufacturing、OEM/ODM、Testing、Mixed Models、Parts Support 等可公开证明的能力。
- `COMMERCIAL_POLICY`：MOQ、样品、正式订单、货代交付和联系方式优先级等公开采购政策。

### 3.2 页面范围

- 五个语言入口：English、Russian、Spanish、Portuguese、Arabic。
- 英文公司、产品家族、应用/文章与联系页面。
- 俄罗斯市场、俄罗斯卧式发动机和中亚页面。
- 秘鲁和哥伦比亚页面。
- `en/product-detail` 仅作为 `NOINDEX_UTILITY` 审计，不把参数变体视为已建立的独立产品实体。
- Sitemap 中的其他正式页面用于补充公司、产品、应用和语言一致性证据。

### 3.3 非目标

- 不修改 HTML、CSS、JavaScript、Worker、Schema、Sitemap、robots、广告或分析代码。
- 不创建新国家页、型号页、博客、FAQ 或重定向。
- 不登录 Google Ads、Yandex、GSC、Webmaster、CRM 或邮箱。
- 不把广告平台入账、邮件送达或 Lighthouse 待验证项伪装成审计 PASS。
- 不保证任何搜索引擎或 AI 平台的排名、引用或收录。

## 4. 证据模型

### 4.1 事实状态

| 状态 | 使用条件 |
| --- | --- |
| `VERIFIED` | 当前正式页面、公司官方资料、有效证书或一致的仓库事实可以直接证明，且没有未解决冲突。 |
| `SUPPORTED` | 有至少一项可信公开/内部参考与另一项一致证据支持，但仍缺少直接商业验证或完整产品资料。 |
| `HYPOTHESIS` | 基于市场、产品或搜索逻辑的合理推断，不能写成确定事实。 |
| `UNKNOWN` | 没有足够证据，或现有材料无法回答。 |
| `CONFLICTING` | 两个或以上来源对同一属性给出不一致值，必须先解决。 |

`VERIFIED` 不是“有人在文档里写过”。它要求来源可以定位、复查并支持该字段的准确含义。

### 4.2 证据可见性

| 状态 | 含义 |
| --- | --- |
| `PUBLIC` | 可在正式网站或公开来源引用。 |
| `INTERNAL_REFERENCE` | 仓库研究或内部交接材料，可用于决策，但不能自动成为公开声明。 |
| `PRIVATE` | 站主未来提供的脱敏销售/询盘汇总；本轮不读取。 |
| `ASSUMPTION` | 没有来源的推断，只能与 `HYPOTHESIS` 或 `UNKNOWN` 配合。 |

每条支持核心结论的证据必须记录来源路径或 URL、证据摘要、访问/验证日期和适用实体。

## 5. 商业价值与实体准备度

不计算百分比总分。

### 5.1 商业价值

- `HIGH`：有直接业务证据，或多个独立证据表明其与当前重点市场/采购路径高度相关。
- `MEDIUM`：有合理需求证据，但缺少真实询盘、销售或稳定广告信号。
- `LOW`：现有证据表明优先级低或与当前产品战略关系弱。
- `UNKNOWN`：缺少足够信息。

### 5.2 实体准备度

- `READY`：有稳定名称、父级关系、规格/属性、应用、图片、采购信息和可引用证据；现有或候选页面能够提供独立价值。
- `NEEDS_CONTENT`：实体真实存在，但页面信息不足或与父级页面差异不够。
- `NEEDS_EVIDENCE`：商业主张、应用或市场关系缺少公开证据。
- `CONFLICTING`：关键属性冲突。
- `UTILITY_ONLY`：当前仅适合作为查询工具或组件，不应索引。

商业价值与准备度分别判断。`HIGH + NEEDS_EVIDENCE` 不能自动进入建页；`MEDIUM + READY` 可能更适合先增强现有页面。

## 6. 实体归属模型

每个实体定义三类页面关系：

- `OWNER`：完整定义实体、属性、父子关系和主要采购意义的正式页面。
- `SUPPORTING`：说明实体在特定语言、应用或市场中的情境，不复制 Owner 的完整意图。
- `MENTION`：只用于范围说明或内链，不承担实体排名目标。

一个实体可以有多语言本地化 Owner，但每种语言和搜索意图只能有一个明确 Owner。家族页可以暂时拥有具体型号；这不代表该型号已经具备独立页面资格。

页面竞争只有在多个可索引页面面向相同语言、相同实体和相同搜索意图时成立。正常的跨语言页面和市场情境页不自动构成竞争。

## 7. 实体矩阵结构

`GEO_ENTITY_MATRIX.csv` 一行代表一个规范实体，不按网页重复建立实体。字段固定为：

```text
entity_id
entity_type
preferred_name
aliases
languages
parent_entity
applications
candidate_markets
evidence_status
evidence_visibility
evidence_sources
last_verified
owner_url
supporting_urls
mention_urls
current_index_status
commercial_value
entity_readiness
content_gaps
conflicts
recommended_action
decision_reason
```

多值字段使用 ` | ` 分隔；URL 使用正式 HTTPS non-www 路径。空值不能被理解为否定事实，必须在 `content_gaps` 或 `decision_reason` 说明是否未知。

`recommended_action` 只允许：

- `KEEP`
- `ENHANCE_EXISTING`
- `BUILD_NEW`
- `MERGE`
- `NOINDEX_UTILITY`
- `DO_NOT_BUILD_YET`
- `NEEDS_EVIDENCE`

## 8. 审计流程

1. 从 Sitemap、正式 HTML、共享数据脚本和现有报告生成页面清单。
2. 提取公司名、品牌、产品名/型号、应用、市场、能力和采购政策候选项。
3. 规范化同义词、语言名称和父子关系，分配稳定 `entity_id`。
4. 为每个实体建立证据登记，区分公开事实、内部参考、假设和冲突。
5. 识别现有 Owner、Supporting 和 Mention 页面；检查同语言/同意图竞争。
6. 分别判断商业价值和实体准备度，不计算总分。
7. 给出保留、增强、新建、合并、工具页或暂不建设决定。
8. 将高风险冲突、未知事实和待站主确认项写入审计报告。
9. 对 Markdown 与 CSV 做交叉校验，确保实体数量、状态和页面决定一致。

## 9. 交付物

### `GEO_ENTITY_AUDIT.md`

包含：

- 执行摘要和 Foundation 边界。
- 方法、来源和证据等级。
- 公司/品牌实体结论。
- 产品家族和型号关系。
- 应用实体关系。
- 市场实体及证据状态。
- 能力与采购政策一致性。
- 实体 Owner/Supporting/Mention 页面映射。
- 冲突、未知项与不可公开声明清单。
- 页面决策清单。
- Phase 6.1 候选范围，但不实施页面。

### `GEO_ENTITY_MATRIX.csv`

作为机器可读和可版本控制的实体事实表，遵守第 7 节字段与枚举。

### 可读表格副本

使用同一 CSV 数据生成经过格式化和视觉检查的 `.xlsx` 副本，便于站主筛选和审阅；CSV 仍是仓库中的事实源。

## 10. 验收标准

1. 所有矩阵实体具有稳定 ID、类型、名称、证据状态、准备度和决定。
2. 所有 `VERIFIED`/`SUPPORTED` 核心结论可追溯到明确路径或 URL。
3. 所有市场—产品关系均区分事实、支持性证据和假设。
4. 每个可索引核心实体有明确 Owner，或明确写出 Owner 缺失。
5. `en/product-detail` 保持 `NOINDEX_UTILITY`，参数变体不被计算为独立索引实体。
6. 私有客户数据、个人信息、Secret 和未脱敏后台数据为 0。
7. 报告与 CSV 的实体数量、行动枚举和关键状态一致。
8. 页面决策可以包含任意数量候选，但 Phase 6.0 不修改页面。
9. 未知和冲突不被自动升级为公开事实。
10. 审计能够明确列出哪些页面现在不应该建设。

## 11. 后续边界

Phase 6.1 根据本审计决定第一批 `ENHANCE_EXISTING` 或 `BUILD_NEW` 项目。实施批次可以控制在 3–5 个页面，但审计本身不受此数量限制。

Lighthouse、销售邮箱确认、Google/Yandex 平台转化入账和 7–28 天索引观察继续作为独立生产验证任务，不混入实体审计结论。
