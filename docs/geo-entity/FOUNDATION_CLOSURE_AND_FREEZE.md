# Chixiang Motor Foundation 最终收口与冻结

**日期：** 2026-08-01

**状态：** `FOUNDATION_STATUS: FROZEN`

**生产基线：** PR #26，merge commit `08c446ead90db58e00a71095d5ba1f71756d1c7f`

## 1. 最终结论

网站基础架构、SEO/GEO 技术信号、核心实体归属、询盘链路和安全转化条件已经达到
可冻结状态。后续可以进入 visual redesign（页面外观改版），不再为了“继续做内功”
反复改变域名、URL、canonical、Sitemap、表单、追踪或实体 Owner 结构。

“冻结”不等于永远禁止修复。若出现真实故障、平台规则变化或新的已批准事实，仍可通过
独立 PR 修改；但必须有证据、测试、Preview 和用户明确批准。

## 2. 生产验收快照

| 检查项 | 2026-08-01 结果 |
| --- | --- |
| 四种域名/协议入口 | 均 301 到 `https://chixiangmotor.com/en/` |
| `robots.txt` | HTTP 200，声明正式 Sitemap |
| `sitemap.xml` | HTTP 200；51 canonical URL；0 个 www、`.html`、参数或重复 URL |
| Contact Owner 页面 | EN、ES、PT、RU、AR 共 5 页均 HTTP 200，自引用 canonical 正确 |
| Contact 页面结构 | 每页 1 个 H1，包含采购字段、Turnstile 容器和 `ContactPage` 数据 |
| 移动端抽查 | 英文 Contact 页面约 390px 视口无横向溢出，表单和提交按钮可见 |
| PR #26 合并前测试 | 网站 240/240；Worker 13/13；总计 253/253 |
| 收口 PR 最终测试 | 网站 244/244；Worker 13/13；总计 257/257；两个生成器均 0 漂移 |

本轮生产冒烟检查没有再次提交真实询盘，避免额外发送测试邮件；此前销售邮箱收件、
Google Ads 成功提交事件和 Yandex lead goal 已有人工验证记录。

## 3. 当前事实来源优先级

后续文案、页面和 Schema 发生冲突时，按以下顺序处理：

1. 本文件：阶段状态、冻结边界与例外流程；
2. `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`：公司公开事实；
3. `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`：发动机规格与可公开字段；
4. `docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv` 与
   `scripts/site-entity-manifest.js`：页面 Owner、实体映射和 stable Schema IDs；
5. `docs/superpowers/specs/2026-07-30-b2b-landing-page-standard-design.md`：
   B2B landing-page standard；
6. `GEO_ENTITY_AUDIT.md` 与 `GEO_ENTITY_MATRIX.csv`：保留为历史发现快照，不覆盖后来
   已由用户批准的 Fact Pack 和页面实施结果。

Made-in-China 等非本公司维护的第三方资料不作为 Chixiang 官方事实来源。

## 4. 已完成并冻结的“内功”

- 单一正式域、HTTP/HTTPS 与 www/non-www 301 规则；
- 根路径到英文首页的入口规则、clean URL、canonical、hreflang；
- 51 个正式 URL 的 Sitemap 与 robots 配置；
- 多语言公司、产品家族、市场和 Contact Owner 页面；
- 原始 HTML 的核心实体内容、H1、站内链接、可见面包屑；
- 安全的 Organization、WebSite、WebPage、BreadcrumbList、ContactPage 等 Schema；
- 公司事实表、发动机规格表、页面变更矩阵及证据分级；
- B2B 广告落地页规范、采购筛选和站内询盘优先原则；
- Contact 表单、Turnstile、Worker、成功/失败提示及多语言字段；
- 仅在 Worker 确认成功后触发一次的 Google Ads / Yandex 转化；
- 重点广告页的移动端溢出修复和秘鲁图片体积优化。

## 5. 明确保留为空或暂不实施的内容

- 152FMH 的 actual displacement（实际排量）、bore（缸径）和 stroke（行程）尚未统一
  确认，不得猜测或在官网公开具体数字；
- 没有可验证的价格、库存和购买条件，因此不添加 `Offer`；
- 没有公开、可核验的客户评价或评分，因此不添加 `Review` 或 `AggregateRating`；
- 不批量生成薄弱型号页、国家页或只替换关键词的重复页面；
- 未经单独批准，不把 MOQ、样品数量、混批、运费或交期写成全站统一承诺。

## 6. 不阻塞页面外观阶段的持续观察

以下项目需要观察，但不是继续重构 Foundation 的理由：

- Lighthouse：外观改版后对关键模板做三次移动端测试并取中位数；
- GSC：观察 Sitemap、Google 选择的 canonical、抓取与索引变化；
- Yandex Webmaster：观察 non-www 站点重新抓取和可搜索页面；
- 真实用户 INP/LCP：有足够 CrUX 或平台数据后再判断；
- Google Ads / Yandex：继续核对真实有效询盘的后台入账，而不是把按钮点击算作 lead。

GSC 和 Yandex 的重新计算通常是异步过程，应按 7–28 天观察，不作为视觉改版 PR 的
即时阻塞条件。

## 7. Foundation 变更例外流程

任何触及冻结契约的修改必须：

1. 说明真实问题或新证据；
2. 获得用户明确批准；
3. 使用独立分支和独立 PR，不混入页面外观改版；
4. 增加或更新回归测试；
5. 提供 Preview、生产验收方法和回滚方案；
6. 未经明确指令不得合并。

## 8. 下一阶段交接

下一阶段正式转为页面外观与转化体验优化。设计可以大胆改善视觉，但底层 URL、事实、
实体关系、表单和转化条件保持稳定。这样每次验收关注“页面是否更清楚、更可信、手机端
是否更好用”，而不是重新争论网站基础结构。
