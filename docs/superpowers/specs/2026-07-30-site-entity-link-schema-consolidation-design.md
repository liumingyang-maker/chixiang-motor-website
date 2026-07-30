# 全站内链、面包屑与安全 Schema 收口设计

## 1. 目标

在不新增页面、不重做视觉、不改变广告、表单或 Worker 的前提下，把 sitemap 中 51 个正式页面组织成一套搜索引擎和 AI 可以稳定理解的页面关系：

- 五个语言首页是各语言入口；
- About 页面承载公司事实；
- Products 页面承载当前产品分类；
- 产品系列页归属于对应语言 Products 页面；
- News 与文章形成清晰的栏目层级；
- 联系页归属于对应语言首页；
- 国家落地页通过对应语言 Products 页面接入站点产品体系；
- 所有机器可读信息只复述页面已经可见并获批准的事实。

## 2. 已批准范围

本阶段覆盖 sitemap 中全部 51 个 canonical 页面。生产改动仅限：

1. 可见面包屑和必要的内部父级链接；
2. 与可见层级一致的 `BreadcrumbList`；
3. 页面类型补齐：`WebPage`、`AboutPage`、`CollectionPage`、`ContactPage`、`Article`；
4. 统一 `Organization`、`WebSite` 与页面 `@id` 的引用关系；
5. 用自动化测试保护 51 个页面的 canonical、页面层级、JSON-LD 语法和禁止类型；
6. 一份实施清单和验收报告。

不修改 Title、Description、H1、hreflang、sitemap URL、广告标签、Yandex Metrica、Google Ads、Turnstile、表单字段、Worker、MOQ、价格、运输政策和产品事实。

## 3. 方案选择

### 方案 A：安全语义收口（采用）

使用页面类型、可见面包屑、`BreadcrumbList` 和稳定实体 ID。产品系列页使用 `CollectionPage` 表达“一个系列/集合页面”，不声明零售价格、库存或评价。

优点：符合当前 B2B 询盘网站的真实形态；风险低；不会为了富结果虚构商业数据；覆盖 51 个页面且容易回归测试。

### 方案 B：Product/ProductGroup 富结果路线（不采用）

给产品系列和型号添加 `Product`、`ProductGroup`、`Offer`、价格、库存或评价。

不采用原因：Google 的产品变体实现要求同时提供具体 `Product` 变体和唯一标识，并主要面向可购买商品；当前网站是 B2B 询盘站，未公开稳定价格、库存、SKU、GTIN、评价或在线购买条件。强行使用会制造不完整或误导性标记。

### 方案 C：只加 JSON-LD、不修可见路径（不采用）

只在源代码中添加 Schema，不改变用户可见链接。

不采用原因：机器标记与用户路径分离，不利于可维护性，也不能解决现有 19 个非首页页面缺少可见父级路径的问题。

## 4. 页面分类

| 页面类别 | 数量 | 主类型 | 面包屑路径 |
| --- | ---: | --- | --- |
| 语言首页 | 5 | `WebPage` | 不显示面包屑 |
| About | 5 | `AboutPage` | 首页 → 当前页 |
| Products | 5 | `CollectionPage` | 首页 → 当前页 |
| 产品系列 | 20 | `CollectionPage` | 首页 → Products → 当前页 |
| Contact | 5 | `ContactPage` | 首页 → 当前页 |
| News 栏目 | 5 | `CollectionPage` | 首页 → 当前页 |
| 英文文章 | 2 | `Article` + `WebPage` | 首页 → News → 当前页 |
| 国家/市场落地页 | 4 | `WebPage` | 语言首页 → Products → 当前页 |

俄罗斯 `/ru/gorizontalnyj-dvigatel` 是卧式发动机系列 Owner 与广告落地页，按产品系列处理，使用 `CollectionPage`。

## 5. 稳定实体 ID

- 公司：`https://chixiangmotor.com/#organization`
- 网站：`https://chixiangmotor.com/#website`
- 页面：`{canonical}#webpage`
- 面包屑：`{canonical}#breadcrumb`

所有页面通过 `isPartOf` 指向网站，通过 `publisher` 指向公司。About 页面通过 `about` 和 `mainEntity` 指向公司。既有 FAQ 与 Article 数据保留，但引用同一公司和页面 ID。

## 6. 可见面包屑与内链

所有非首页页面必须具有 `<nav class="breadcrumb entity-breadcrumb" aria-label="Breadcrumb">`：

- 父级项目是可点击的最终 canonical 路径；
- 当前页使用 `aria-current="page"`，不制造自链接；
- 产品系列页必须出现 Products 父级；
- 文章必须出现 News 父级；
- 国家落地页必须出现 Products 父级；
- 阿语页面保留 RTL，面包屑顺序按文档方向自然显示；
- 不改变 Header 主导航、Hero、CTA 或表单。

标准页面沿用 `css/style.css` 的现有 breadcrumb 风格。落地页使用一个轻量的 standalone 修饰类，避免改变 Hero 布局。

## 7. 安全 Schema 规则

允许：

- `Organization`
- `WebSite`
- `WebPage`
- `AboutPage`
- `CollectionPage`
- `ContactPage`
- `BreadcrumbList`
- `ListItem`
- `ItemList`
- 既有且与可见正文一致的 `FAQPage`
- 既有且与文章正文一致的 `Article`

本阶段禁止：

- `Product`
- `ProductGroup`
- `Offer`
- `Review`
- `AggregateRating`
- 价格、库存、交货时间、评价、评分、GTIN、SKU 和未批准型号参数

未来如果单一型号拥有已确认规格、唯一标识和正式商业条件，再另开产品 Schema 阶段，不在本 PR 中提前实现。

## 8. 实施方式

新增一个仅供维护的 Node.js 清单/生成脚本：

- 从 sitemap 读取 51 个正式 URL；
- 将 URL 映射到真实 HTML 文件；
- 按语言和页面类别生成面包屑；
- 写入统一的 `data-site-entity-graph` JSON-LD；
- 保留既有 FAQ、Article、Organization 和 ItemList；
- 再次运行时结果不变化，保证幂等。

网站部署仍然是纯静态 HTML/CSS/JavaScript；该脚本不进入浏览器运行，也不引入构建工具或框架。

## 9. 测试与验收

自动测试必须证明：

1. sitemap 仍为 51 个唯一 canonical URL；
2. 51 个页面 JSON-LD 全部可解析；
3. 五个首页没有面包屑，46 个非首页都有可见面包屑和 `BreadcrumbList`；
4. 所有面包屑位置连续、URL 为 non-www HTTPS canonical 路径；
5. 产品系列页、文章和国家落地页具有正确父级；
6. 每个页面有正确主类型，并引用统一 Organization/WebSite ID；
7. 禁止的商品、价格、库存和评价类型不存在；
8. 广告、Yandex、Turnstile、表单和 Worker 回归测试继续通过；
9. 生成脚本连续运行两次不产生第二次差异；
10. 390px 与桌面抽查不出现横向溢出或 Hero 位移。

## 10. 发布边界

本阶段创建一个新 Draft PR，不自动合并。Cloudflare Preview 成功后抽查五种语言、四类页面和四个市场落地页；用户确认后再决定是否合并。
