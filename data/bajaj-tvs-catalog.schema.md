# Bajaj / TVS 产品数据模型说明（bajaj-tvs-catalog.json）

> 唯一产品数据源。分类页、品牌页、车型聚合表与产品详情页均由 `scripts/render-bajaj-tvs-catalog.js` 从本文件生成。
> 禁止在 HTML 中手写产品参数。没有真实资料的字段留空或省略，前台不展示。

## 顶层结构

| 键 | 必填 | 类型 | 说明 |
|---|---|---|---|
| `version` | 是 | number | 数据结构版本（当前为 `1`） |
| `updated` | 是 | string | 数据更新日期（`YYYY-MM-DD`） |
| `brands` | 是 | object[] | 车型品牌（`bajaj` / `tvs`） |
| `categories` | 是 | object[] | 产品类别（`crankcases` / `engine-covers` / `complete-engines` 等） |
| `model_hubs` | 否 | object[] | **车型聚合配件表（Model Hub）**：按车型聚合多款核心配件及 OEM 原厂参考料号，避免一物一页造成 Thin Content |
| `products` | 是 | object[] | 独立整机或核心总成记录数组。当前为空：无真实产品资料，不生成虚构产品 |

## `model_hubs` 记录字段（按车型聚合核心配件 + OEM 料号表）

| 字段 | 必填 | 类型 | 说明 |
|---|---|---|---|
| `id` | 是 | string | 唯一车型聚合 ID（kebab-case，如 `bajaj-pulsar-150`） |
| `brand` | 是 | string | 所属品牌：`bajaj` 或 `tvs` |
| `model_name_en` | 是 | string | 英文车型名（如 `Bajaj Pulsar 150 (DTS-i)`） |
| `model_name_zh` | 是 | string | 中文车型名（如 `Bajaj Pulsar 150 (DTS-i)`） |
| `displacement_cc` | 否 | string/number | 标称排量（如 `149cc` 或 `150`） |
| `engine_code` | 否 | string | 发动机代码（仅填已核实代码） |
| `summary_en` | 否 | string | 英文车型说明（如材质/硬度及混装出货说明） |
| `summary_zh` | 否 | string | 中文车型说明 |
| `core_parts` | 是 | object[] | 该车型聚合展示的多款核心配件列表（见下表） |
| `public` | 是 | boolean | 是否公开渲染（`false` 时不在前台生成表格） |

### `model_hubs[].core_parts[]` 子字段

| 字段 | 必填 | 类型 | 说明 |
|---|---|---|---|
| `part_name_en` | 是 | string | 配件英文名称（如 `Left Crankcase`, `Clutch Cover`） |
| `part_name_zh` | 是 | string | 配件中文名称 |
| `category` | 否 | string | 所属分类（如 `crankcases`, `engine-covers`, `complete-engines`） |
| `chixiang_pn` | 否 | string | 驰翔内部料号 |
| `oem_ref` | 否 | string | 原厂 OEM 参考料号（如 `DH101234`） |
| `material_spec` | 否 | string | 材质/硬度/工艺规格（如 `ADC12 Aluminum / HV >= ...`） |
| `notes_en` | 否 | string | 英文补充说明（如接口/版本备注） |
| `notes_zh` | 否 | string | 中文补充说明 |

## `products` 记录字段（整机 / 核心独立产品）

| 字段 | 必填 | 类型 | 说明 |
|---|---|---|---|
| `id` | 是 | string | 唯一产品 ID（kebab-case，用于路由与询价关联） |
| `name_en` | 是 | string | 英文名称 |
| `name_zh` | 是 | string | 中文名称 |
| `part_number` | 否 | string | 驰翔料号（如有） |
| `oem_part_numbers` | 否 | string[] | 对应的原厂 OEM 参考料号列表（如有，如 `["DH101234", "DH101235"]`） |
| `category` | 是 | string | 类别 id：`crankcases` / `engine-covers` / `complete-engines` / 其他已登记类别 |
| `subcategory` | 否 | string | 子类别 id（如 `clutch-cover`、`left-crankcase`） |
| `product_brand` | 否 | string | 产品本身品牌（默认 `CHIXIANG MOTOR`），非适配品牌 |
| `vehicle_brands` | 是 | string[] | 适配车辆品牌：`bajaj` / `tvs` |
| `models` | 否 | object[] | 适配车型 `{ "name": "Pulsar 150", "versions": ["DTS-i 2015-2019"] }`，无资料则空数组 |
| `engine_codes` | 否 | string[] | 发动机代码（如 DTS-i、ET-Fi 等，仅填已核实代码） |
| `photos` | 否 | object[] | 真实产品照片 `{ "src": "images/bajaj-tvs/...", "alt_en": "...", "alt_zh": "...", "view": "outer" }` |
| `photo_views` | 否 | string[] | 建议拍摄角度：outer / inner / mating / mounting / interface |
| `delivery_form` | 否 | string | 交付形态：`casting` / `machined` / `assembly`（毛坯/机加工/组件），中英文展示见生成器词典 |
| `specs` | 否 | object | 尺寸及接口、材质、硬度等技术参数。键为机器可读名，值含 `{ "label_en", "label_zh", "value" }` |
| `included_accessories` | 否 | object[] | 随附配件 `{ "name_en", "name_zh" }` |
| `related_products` | 否 | string[] | 相关产品 id |
| `public` | 是 | boolean | 是否允许进入公开目录。`false` 时任何页面不渲染 |

## 渲染规则

1. `public !== true` 的产品或车型聚合记录不渲染、不生成详情页、不出现在 sitemap。
2. 没有资料的字段**不渲染对应区块**（不显示 “N/A”“开发中”“即将上市”“样件验证”）。
3. **不搞一物一页**：小件/易损件与跨参考 OEM 料号统一通过 `model_hubs` 在车型聚合区块中以结构化表格集中呈现，仅整机或核心总成在有完整图文与规格时生成独立详情页。
4. 详情页路径：
   - 英文：`/en/bajaj-tvs-engines-parts/<id>`（源文件 `en/bajaj-tvs-engines-parts/<id>.html`）
   - 中文：`/zh-cn/bajaj-tvs-engines-parts/<id>/`（源文件 `zh-cn/bajaj-tvs-engines-parts/<id>.html`）
5. 询价按钮携带上下文查询参数（`btv_part` / `btv_brand` / `btv_pn` / `btv_src`），由联系页脚本预填到既有表单字段（`product_interest=parts`、`requirements`、`source_form`、`source_cta`），不新增后端字段。

## 禁止事项

- 禁止编造照片、型号、料号、适配结果、库存、价格、质保、交期、起订量。
- 禁止把 CG / CB / 卧机参数复制到 Bajaj / TVS 产品。
- 禁止为没有资料的产品生成详情页。
