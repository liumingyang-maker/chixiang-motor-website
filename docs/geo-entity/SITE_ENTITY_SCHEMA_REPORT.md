# Chixiang Motor 全站内链、面包屑与安全 Schema 收口报告

日期：2026-07-30

分支：`feature/site-entity-link-schema-consolidation`

范围：`sitemap.xml` 中 51 个 canonical 页面

## 1. 实施结论

- 51 个正式页面全部接入同一个页面关系清单和可重复运行的生成器。
- 5 个语言首页保留为语言入口，不显示面包屑。
- 其余 46 个页面新增可见、可换行、键盘可访问的面包屑。
- 46 个可见面包屑均有一一对应的 `BreadcrumbList`。
- 所有正式页面统一引用：
  - 企业实体：`https://chixiangmotor.com/#organization`
  - 网站实体：`https://chixiangmotor.com/#website`
  - 页面实体：`<canonical URL>#webpage`
  - 面包屑实体：`<canonical URL>#breadcrumb`
- 没有修改广告、表单、Turnstile、Cloudflare Worker、CTA 逻辑、URL 或产品事实。

## 2. 页面类型

| Schema 页面类型 | 数量 | 用途 |
| --- | ---: | --- |
| `CollectionPage` | 30 | Products、News 和产品家族页面 |
| `AboutPage` | 5 | 五种语言 About 页面 |
| `ContactPage` | 5 | 五种语言 Contact 页面 |
| `WebPage` | 11 | 五个语言首页、两篇文章载体、四个市场页 |

现有两篇英文文章继续保留各自的 `Article` 数据；现有 `FAQPage`、`Organization` 和当前产品目录 `ItemList` 在不冲突时继续保留。

## 3. 面包屑层级

- About、Contact、News、Products：语言首页 → 当前页面。
- 产品家族和市场页：语言首页 → Products → 当前页面。
- 英文文章：英文首页 → News → 当前文章。
- 页面最后一级使用 `aria-current="page"`，不生成重复链接。
- 阿拉伯语页面保持 `dir="rtl"`，面包屑允许自然换行。

## 4. 安全边界

本阶段明确禁止在 51 个正式页面中新增以下类型：

- `Product`
- `ProductGroup`
- `Offer`
- `Review`
- `AggregateRating`

原因：当前网站是 B2B 询盘站，没有稳定公开价格、库存、SKU/GTIN、真实公开评论或直接购买闭环。为了富结果补写这些字段会产生不真实的商业信号。

Products 页可见内容可以继续说明未来摩托车/CKD/SKD 计划，但当前供应目录的结构化数据不会把未来计划当成当前可售产品。

## 5. 修改范围

- `scripts/site-entity-manifest.js`：维护 51 页角色、语言、页面类型和面包屑关系。
- `scripts/apply-site-entity-schema.js`：生成可见面包屑和安全 JSON-LD，并提供 `--check` 漂移检测。
- `tests/site-entity-navigation-schema.test.js`：保护页面数量、Schema 类型、稳定 ID、面包屑、禁止类型、CSS 和治理矩阵。
- `css/style.css`：仅新增 `.entity-breadcrumb` 相关样式。
- 51 个 sitemap HTML 文件：写入生成结果。
- `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv`：51 行全部增加 `site entity link/schema contract` 验证标记。

## 6. 自动验证

```powershell
node scripts/apply-site-entity-schema.js --check
node --test tests/site-entity-navigation-schema.test.js tests/foundation-mobile.test.js tests/multilingual-core-owner-pages.test.js
node --test tests/*.test.js workers/contact-api/test/*.test.mjs
```

截至本报告生成时：

- 生成器漂移检查：`0 canonical pages need updates`
- 专项测试：39/39 通过
- 全量网站与 Worker 测试：233/233 通过

## 7. 预览验收

已在本地真实浏览器中使用桌面 `1440×900` 与手机 `390×844` 检查：

- `/en/about`
- `/en/cg-engine`
- `/ru/gorizontalnyj-dvigatel`
- `/ru/russia/`
- `/ru/central-asia/`
- `/es/peru/`
- `/es/colombia/`
- `/ar/products`

结果：

- 8 个代表页面在两个尺寸下均满足 `scrollWidth === clientWidth`，无横向溢出。
- 8 个面包屑均可见；手机端计算样式均为 `flex-wrap: wrap`，没有裁切。
- `/ar/products` 保持 `dir="rtl"`，面包屑方向正常。
- 俄罗斯与西语市场页的表单仍存在；本阶段没有修改表单、CTA 或跟踪代码。

Pull Request 建立后仍需在 Cloudflare Preview 重复抽查同一组页面，以确认部署环境与本地结果一致。

## 8. 回滚

PR 合并前可直接关闭 PR，不影响正式网站。合并后如需整体撤销，使用：

```powershell
git revert <本 PR 的 merge commit>
```

不要单独删除 JSON-LD 或面包屑 HTML；应整体回滚，以保持可见层级、结构化数据和测试契约一致。
