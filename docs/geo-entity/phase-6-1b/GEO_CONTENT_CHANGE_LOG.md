# GEO 实体内容对齐变更记录

日期：2026-07-30  
分支：`feature/geo-entity-owner-pages`  
范围：51 个 sitemap canonical 页面 + 1 个 `noindex` 产品查询工具页

## 结果概览

- 51 个 canonical 页面全部进入逐页矩阵。
- 48 个页面有事实、翻译或预览阶段发现的资源修正，标记为 `CHANGED`。
- 3 个页面完成核验但不需要为了凑数修改，标记为 `VERIFIED_NO_CHANGE`。
- `en/product-detail.html` 仍是 `noindex` 查询工具，不进入 sitemap；其家族内容按已批准事实收窄。
- 152FMH 型号与排量映射仍保持待确认，没有在本次修改中推断或补写。

## 公司事实

五种语言统一采用以下时间线含义：2003 年起的行业经验；当前公司于 2007 年注册。原来会被理解为“当前公司成立于 2003 年”的 Title、Description、H1、正文、统计卡和页脚已修正。

主要文件：

- 英语：`en/index.html`、`en/about.html`、`en/products.html`、`en/news.html`、`en/contact.html`、两篇采购指南。
- 西语：`es/index.html`、`es/about.html`、`es/products.html`、`es/news.html`、`es/contacto.html` 及产品系列页。
- 葡语：`pt/index.html`、`pt/about.html`、`pt/products.html`、`pt/news.html`、`pt/contato.html` 及产品系列页。
- 俄语：`ru/index.html`、`ru/about.html`、`ru/products.html`、`ru/news.html`、`ru/kontakty.html` 及产品系列页。
- 阿语：`ar/index.html`、`ar/about.html`、`ar/news.html`、`ar/contact.html` 及产品系列页。

同时完成：

- `ISO 9001-2000` 收窄为不带未获批版本号的 `ISO 9001`。
- 旧 `/images/logo.png` 结构化数据引用改为已批准的 `/images/logo.webp`。
- 英文首页现有 Organization 结构化数据中的注册年份事实由 2003 改为 2007；Schema 类型、结构和加载方式未改变。

## 产品事实

主要文件：

- 五种语言目录：`en/products.html`、`es/products.html`、`pt/products.html`、`ru/products.html`、`ar/products.html`。
- 五种语言 CG owner 页面：`en/cg-engine.html`、`es/motor-cg.html`、`pt/motor-cg.html`、`ru/dvigatel-cg.html`、`ar/cg-engine.html`。
- 查询工具：`en/product-detail.html`。
- 采购指南：`en/how-to-choose-motorcycle-engine-manufacturer-china.html`。

已对齐事实：

- HW Water 为主名称；Hanwei、CG Heavy 只作为同家族别名。
- HW Water 全家族公开配置为 1.5 L 机油容量、20 滚子离合、高输出磁电机、无内置倒挡。
- 删除 `18-pole`、内置倒挡、`no slipping`、`eliminates overheating` 等错误或过度绝对化表述。
- `CG150B` 更正为 `CG150SB`。
- CG 水冷的内置倒挡改为按订单选择的配置，不再写成全系列标配。
- 平衡轴只宣传“帮助降低单缸振动并改善运行平顺性”，删除寿命翻倍和绝对化顺滑表述。
- 海啸系列描述散热鳍片、加大机油容量、散热、耐久与持续负载稳定性，不补写未批准的具体油量。
- 自动离合水冷系列只保留 CG150、CG175，并明确与内置倒挡配置家族并列。
- 四个家族记录不再在查询工具或隐藏表格中冒充独立型号规格；未知的型号级排量、缸径行程、功率、安装尺寸继续留空或要求询价前确认。

## 市场事实

主要文件：

- `js/latam-cg-products.js`
- `js/central-asia-data.js`
- `es/peru/index.html`
- `es/colombia/index.html`
- `ru/central-asia/index.html`
- `ru/gorizontalnyj-dvigatel.html`

已对齐事实：

- 拉美共享数据使用 `CG150SB`，并将 HW Water 的倒挡、1.5 L、20 滚子离合和高输出磁电机说明统一。
- 中亚页面和数据源将 `CG Heavy` 主名称统一为 `HW Water`，删除 18 极/18-pole 推断并保留中文事实源中的 `18级磁电机` 术语边界。
- 秘鲁、哥伦比亚、俄罗斯和中亚继续保留各自原有 B2B、MOQ、物流和联系方式策略；没有把一个国家的政策复制到另一个国家。
- 俄罗斯卧式页面补齐既有五语言产品家族的 hreflang 互链，不改变该页的广告或转化路径。

## 预览阶段修正

- 五语言卧式产品家族中，英语、西语、葡语和阿拉伯语页面原来引用不存在的同名 `.png`；已改为仓库中现有的 `.webp`，恢复主图和卡片图，不新增素材或布局。
- 阿拉伯语联系页的反垃圾隐藏字段原来在 RTL 布局中产生约 11,000px 的离屏画布；四个翻译联系页统一使用裁剪式隐藏类，字段名称、提交合同和反垃圾判断保持不变。
- 本地截图脚本通过浏览器设备模拟强制真实 390×844、768×1024、1024×1366 和 1440×1000 视口，避免 Windows Edge 最小窗口宽度导致的错误裁图。

## 仅核验页面

以下 canonical 页面已核验，但没有制造无必要的内容改动：

- `en/cb-engine.html`
- `en/engine-parts.html`
- `ru/russia/index.html`

它们的 canonical、H1、hreflang 或现有市场转化集成由自动测试覆盖。

## 明确未改变的边界

- 没有改变可见页面设计、视觉系统或 URL 结构；CSS 仅新增不可见反垃圾字段的安全隐藏规则。
- 没有新增或删除 canonical URL；`sitemap.xml` 和 `robots.txt` 行为未改变。
- 没有改变 Google Ads、Yandex Metrica、WhatsApp 转化或成功提交后的转化触发逻辑。
- 没有改变任何表单字段合同、提交处理器、Turnstile、`/api/contact`、Cloudflare Worker 或邮件逻辑。
- 没有改变 Schema 类型、Schema 生成方式或加载行为；只修正了现有 Organization 数据中的注册年份事实与 Logo URL。
- 没有部署、推送、创建 PR 或合并。本阶段只生成本地代码和预览证据，等待网站所有者审核。

## 自动验收边界

- 所有 51 个 canonical 文件必须各有 1 个 H1 和 self-canonical。
- 九个五语言共享页面组必须保留完整 hreflang 与 x-default。
- 公共内容不得出现 `CG150B`、`18-pole magneto`、`18极磁电机` 或当前公司“2003 年成立”的错误表达。
- HW Water 不得出现内置倒挡声明。
- 跟踪、表单和 Worker 核心文件使用 SHA-256 固定，任何字节变化都会使回归测试失败。
