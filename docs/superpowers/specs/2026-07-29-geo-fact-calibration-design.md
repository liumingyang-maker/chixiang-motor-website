# Chixiang Motor Phase 6.1A 事实校准设计

日期：2026-07-29

状态：已获用户批准，等待书面规格复核

## 1. 目标

Phase 6.1A 将 Phase 6.0 实体审计中分散的公司事实、发动机规格、来源、冲突和批准责任整理成两套可填写、可追踪、可审批的事实包：

1. `Company Fact Pack`：统一公司身份、品牌、地址、工厂、产能、认证和公开介绍。
2. `Engine Specification Master`：统一产品家族、型号、配置、规格、应用边界和公开措辞。

本阶段的成果是内部事实治理工具，不是网站内容，也不表示搜索引擎或 AI 已认可其中的记录。完成本阶段后，只有经过批准的事实才能进入 Phase 6.1B/6.1C 页面修改。

## 2. 核心原则

### 2.1 证据预填，不代替业务审批

- 预填官网、仓库、Phase 6.0 审计和可追溯公开来源中已经出现的值。
- 同一字段存在多个值时并列保留来源和值，不由 Codex 擅自选择。
- 无证据字段保持空值，并使用 `UNKNOWN` 或 `PENDING_REVIEW` 明确状态。
- GPT、搜索摘要、行业惯例和型号经验不能成为已确认事实。
- 最终批准值、公开措辞、批准人和批准日期由用户、公司管理人员或工厂技术人员确认。

### 2.2 证据状态与批准状态分离

证据状态只说明来源质量：

- `VERIFIED`
- `SUPPORTED`
- `CONFLICTING`
- `UNKNOWN`

批准状态只说明能否被组织采用：

- `PENDING_REVIEW`
- `APPROVED_PUBLIC`
- `APPROVED_INTERNAL_ONLY`
- `REJECTED`
- `RETIRED`

`APPROVED_PUBLIC` 必须同时具备最终批准值、可追溯证据、审核人和审核日期，并且证据状态不能为 `CONFLICTING` 或 `UNKNOWN`。

### 2.3 一项事实一个稳定记录

- 公司事实以一个字段或一项可独立批准的声明为一行。
- 发动机规格以一个实际可销售型号和配置为一行。
- 同一型号的启动、离合器、倒挡或冷却配置不同，必须拆成独立配置记录或明确配置差异，不能用一个笼统行覆盖全部产品。
- 每行使用稳定 ID，后续页面、Schema 和销售资料通过 ID 引用事实。

## 3. 交付结构

### 3.1 仓库内可版本控制的事实源

创建目录：

```text
docs/geo-entity/fact-calibration/
```

包含：

```text
FACT_CALIBRATION_GUIDE.md
COMPANY_FACT_PACK.csv
ENGINE_SPEC_MASTER.csv
```

CSV 是可审计和可比较的事实源。Markdown 说明审核责任、字段含义、状态规则、批准流程和安全边界。

### 3.2 面向人工审核的工作簿

输出目录：

```text
outputs/phase-6-1a-fact-calibration/
```

只导出：

```text
COMPANY_FACT_PACK.xlsx
ENGINE_SPEC_MASTER.xlsx
```

每个工作簿由相应 CSV 生成，Excel 不是第二套事实源。人工填写后的批准结果必须回写 CSV，才能进入后续页面实施。

## 4. Company Fact Pack 数据模型

`COMPANY_FACT_PACK.csv` 固定使用以下字段：

```text
fact_id
category
field_name_zh
field_name_en
current_website_value
other_source_values
candidate_master_value
approved_public_wording_zh
approved_public_wording_en
evidence_status
approval_status
visibility
evidence_sources
conflict_summary
affected_pages
review_owner_role
approved_by
approved_date
last_verified
notes
```

首轮至少覆盖：

- 法定中文名、法定英文名和品牌名；
- 允许使用的品牌别名；
- 成立时间；
- 注册地址和实际工厂地址；
- 工厂面积、员工数量和月产能；
- 一次合格率或其他质量指标；
- 出口国家数量；
- ISO、CCC 和其他认证；
- OEM/ODM、研发、检测、混批和配件支持能力；
- 官方 Logo、网站、邮箱、电话及社交资料；
- 公司短介绍和长介绍的批准措辞。

认证记录必须包含证书名称、编号或内部证据编号、适用主体、适用范围、签发机构、有效期和允许公开的措辞。证书图片或营业执照扫描件不进入 Git。

## 5. Engine Specification Master 数据模型

`ENGINE_SPEC_MASTER.csv` 固定使用以下字段：

```text
spec_id
family
model_code
marketing_name
aliases
configuration
nominal_displacement_cc
actual_displacement_cc
bore_mm
stroke_mm
cooling
start_method
clutch
gear_pattern
reverse_configuration
ignition
applications
fit_limitations
oem_options
current_website_values
candidate_master_values
evidence_status
approval_status
visibility
evidence_sources
conflict_summary
affected_pages
review_owner_role
approved_by
approved_date
last_verified
notes
```

首轮预填 Phase 6.0 已登记的 CG、CB、Horizontal、water-cooled/heavy-duty、Hanwei/HW 和 AC320 家族及其已出现型号。152FMH、153FMI、154FMI、1P56FMJ、CG150B/CG150SB 等冲突项只记录当前各来源说法和冲突，不填行业经验推断值。

数值字段必须保存为数字；型号代码、挡位表达和配置名称保存为文本。未知值保持空白，并通过 `evidence_status`、`approval_status` 和 `conflict_summary` 解释原因。

## 6. 工作簿设计

### 6.1 Company Fact Pack 工作簿

工作表：

1. `审核说明`：审核流程、状态定义、公开条件和安全提示。
2. `公司事实`：完整事实表，可筛选、冻结标题、状态着色。
3. `冲突清单`：公式或筛选生成 `CONFLICTING`、`UNKNOWN` 和待批准记录。
4. `证据登记`：去重后的来源 URL、仓库路径、来源类型、访问日期和适用事实 ID。
5. `状态汇总`：总数、证据状态、批准状态和公开准备度。
6. `字段字典`：每个字段的含义、数据类型和填写规则。

### 6.2 Engine Specification Master 工作簿

工作表：

1. `审核说明`。
2. `发动机规格`：完整规格表。
3. `冲突清单`：重点展示 Horizontal、型号别名、排量和配置冲突。
4. `证据登记`。
5. `状态汇总`：按家族、证据状态、批准状态统计。
6. `字段字典`。

工作簿不使用宏、外部数据连接或隐藏业务逻辑。统计采用简单、可审计的公式；原始数据与派生汇总分开。

## 7. 预填策略

### 7.1 公司事实

- 从 `/en/`、`/en/about`、本地多语言 About 页面、Organization JSON-LD 和 Phase 6.0 证据矩阵预填官网值。
- 将 2003/2007、Hangu/Gaoteng/Baishiyi/Jiuli、Logo URL、ISO/CCC、8,000 台/月、99%、15,000 m²、50+ 国家等问题放入冲突清单。
- 第三方平台信息只能作为冲突证据，不能自动覆盖公司批准值。

### 7.2 发动机规格

- 从英文家族页、俄罗斯卧式落地页、共享产品数据脚本和 Phase 6.0 矩阵预填当前说法。
- 同一个字段的不同来源使用 `来源=值` 形式并列记录。
- 不从型号代码反推排量，不从图片推断配置，不把市场页面的营销描述升级为工厂规格。
- 应用和适配字段必须区分“常见使用场景”与“已验证适配”。

## 8. 审核流程与责任

1. Codex 预填可追溯值并标记冲突。
2. 公司负责人审核身份、地址、产能、认证、品牌和公开介绍。
3. 工厂技术负责人审核型号、排量、缸径行程、启动、离合器、倒挡、冷却和适用边界。
4. 销售负责人审核 MOQ、样品、OEM、混批、物流和联系方式政策的适用范围。
5. 批准人填写最终值、公开措辞、批准状态和日期。
6. Codex 将批准结果回写 CSV，运行一致性检查并生成页面变更清单。

本阶段可以在没有解决全部事实的情况下结束，但所有未解决项必须继续显示为冲突或未知，不能被静默删除。

## 9. 校验规则

### 9.1 通用校验

- CSV 标题顺序准确，ID 唯一，枚举合法，日期使用 `YYYY-MM-DD`。
- 预填事实必须有来源；未知项不得伪造候选值。
- `APPROVED_PUBLIC` 必须有批准值、证据、审核人和审核日期。
- `APPROVED_PUBLIC` 不能与 `CONFLICTING` 或 `UNKNOWN` 同时出现。
- 不允许使用 `www` 旧域、失效页面或无来源的搜索摘要作为唯一证据。
- 不包含个人身份信息、Secret、原始客户聊天、原始销售记录或证件扫描件。

### 9.2 发动机专用校验

- `spec_id` 唯一；同一型号的不同配置具有可区分的配置 ID。
- 数值字段若非空必须为有效非负数。
- 缸径、行程和排量不能从型号名称自动计算。
- 型号、别名和市场营销名称必须分列。
- 未验证适配不能写成兼容保证。

### 9.3 工作簿校验

- 每张工作表均进行渲染和视觉检查。
- 汇总公式与 CSV 行数及状态计数一致。
- 扫描 `#REF!`、`#DIV/0!`、`#VALUE!`、`#NAME?` 和 `#N/A`。
- 输出目录只保留两个最终 XLSX，不导出多余版本。

## 10. 安全边界

- 网站 HTML、CSS、JavaScript、Worker、Schema、Sitemap、robots、广告和分析代码修改为零。
- 不登录政府系统、B2B 平台后台、广告平台、邮箱、CRM 或云存储。
- 不把营业执照、证书原件、身份证、私人手机号或私人邮箱提交到仓库。
- 私密证据只记录受控证据编号或由用户批准的安全位置，不在公开措辞中复制。
- 工作簿中的 `APPROVED_INTERNAL_ONLY` 内容不得进入后续公开页面。

## 11. 分支与阶段边界

使用分支：

```text
docs/geo-fact-calibration
```

该分支基于 Phase 6.0 审计提交，保持与生产代码隔离。未经新指令不推送、不创建 PR、不合并。

Phase 6.1A 完成条件是：两套事实源与工作簿结构正确、现有证据已预填、冲突可见、审核流程可执行。它不要求公司和工厂在本轮立即解决所有事实，也不授权修改网站。

Phase 6.1B 只能根据已批准事实生成页面变更计划；Phase 6.1C 才能在独立 PR 中修改 Owner 页面；Schema 继续位于可见内容统一之后。
