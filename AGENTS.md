# Chixiang Motor 网站协作契约（v2.0）

`FOUNDATION_CONTRACT: v2.0 (SSOT + GEO_GROWTH_ENABLED)`

本契约替代 2026-08-01 初代静态冻结基线（PR #26 `08c446ead90db58e00a71095d5ba1f71756d1c7f`），
在保留技术底座与真实转化护栏的前提下，全面服务 **B2B GEO（生成式引擎优化）与 SEO 长期增长**。
历史收口归档仍保留于 `docs/geo-entity/FOUNDATION_CLOSURE_AND_FREEZE.md` 供追溯。

---

## 第一层：永久硬底座（锁协议与行为不变量，不再锁文件 SHA-256 哈希）

以下技术与转化不变量在任何页面、样式或内容升级中都不得破坏：

1. **域规范与路由**：`https://chixiangmotor.com` 为唯一正式域（non-www）；HTTP/www 统一 301 至规范域；保持 clean URL、自引用 canonical、`hreflang`（含 `x-default`）与 `sitemap.xml` / `robots.txt` 一致性。
2. **页面语义骨架**：每个可索引页面有且仅有一个可见主 `<h1>`、清晰的 Owner 定位、可见面包屑与匹配 `BreadcrumbList`；稳定 Schema 锚点 ID（`https://chixiangmotor.com/#organization`、`https://chixiangmotor.com/#website`）保持不变。
3. **询盘与真实转化归因**：`/api/contact`、Cloudflare Worker 字段白名单、Turnstile 验证与成功/失败反馈语义保持安全可靠；Google Ads 与 Yandex Metrica 线索转化仅在 Worker 返回 `2xx` 确认成功后单次触发，禁止将普通按钮点击算作表单线索。
4. **多端可用性基线**：核心桌面与移动端视口（`390px`、`768px`、`1024px`、`1440px`、`1920px`）零横向溢出；不因视觉改版明显恶化 LCP、CLS 或可访问性。

---

## 第二层：受控单一事实源（SSOT）与统一商业口径

全站 HTML、多语种文案、JSON-LD 结构化数据与 `llms.txt` / `llms-full.txt` 必须严格同步并服从以下唯一事实源（升级事实数据时同步更新台账与 `tests/`，禁止文本与参数各自漂移）：

- **唯一对外实体口径**：`CHIXIANG MOTOR`（`Chongqing Chixiang Motorcycle Manufacturing Co., Ltd.` / 重庆驰翔摩托车制造有限公司）为唯一品牌与制造实体；不再在公开产品页与 About 页面展示三主体拆分或防御性免责文案；仅在页脚或贸易条款保留克制的出口执行说明（*"Export documentation and logistics are executed through Chixiang's designated export division."*）。
- **标准工厂与联系事实**（见 `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`）：
  - 行业经验始于 2003 年，现公司注册于 2007 年；
  - 工厂与注册地址：`No. 1-2, Building 7, No. 1000 Gaoteng Avenue, Hangu Town, Jiulongpo District, Chongqing, China`；
  - 月产能：`10,000+ units/month`；
  - 质检能力：`100% pre-shipment hot and cold bench testing`（全检出厂冷热机测试 + 双实验室测功机/尾气/金相检验，不再使用未审计 `99% first-pass yield`）；
  - 联系渠道：`chixiangmotor@163.com`、`+86 19008225410`（Tel / WhatsApp）。
- **标准 B2B 批发政策口径**：
  - 整机标准起订量 `50 units`（支持多型号混批装柜）；常规配置交期约 `10 working days`；标准出口贸易条款 `FOB Guangzhou`（支持中国其他主要港口按单协商）；到港后 `60-day warranty`（经序列号与图文核实确属制造/装配不良，随下次货柜免费补发对应配件）；出口单证与装箱清单按订单 BOM / PI 确认。
- **产品事实源与已核定参数**（见 `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`）：
  - CG200 风冷统一口径：`10 kW @ 7,500 rpm`、`13.5 N·m @ 6,500 rpm`；
  - 卧机系列保留公开 `CX152FMH-5B`（106.7 ml / 52.4×49.5 mm）、`CX152FMH-6`（107 ml）、`CX152FMH-5B (130)`（123.67 ml / 54×54 mm 商业系列代号）、`CX1P56FMJ`（140 ml / 56×57 mm）、`CX1P60FMJ`（149.8 ml / 60×53 mm，缸头内置油道）；
  - Bajaj / TVS 整机与配件明确为原厂同级替代与配件交叉对照（不得编造未实测功率/扭矩或虚假 OEM 编号）；
  - HW Water 统一 `1.5 L` 机油、20 滚子超越离合、18 级直流磁电机（英文中性表述 `high-output magneto`）、标准 5 档前进（支持外置倒挡箱）。
- **不可逾越的真实红线**：
  1. 严禁编造未入主事实表的机型参数、虚假 OEM 编号、未见原件的证书编号或全系认证承诺；
  2. 严禁使用无法自证的最高级营销词（`Top 10` / `#1` / `Global Leader`）或无依据响应时效承诺（如 `within 24 hours`）；
  3. 严禁将筹备中的整车或 CKD/SKD 项目标为现货或发布 `Offer` / `InStock` / `AggregateRating` / `Review` 结构化数据。

---

## 第三层：允许演进与 GEO / SEO 主动增长准则（v2.1 国际 6 语全矩阵与中文归档规范）

在严格满足第一层与第二层的前提下，鼓励按分支与验收门禁持续推进：

1. **有效公开语言矩阵与 `/zh-cn/` 隐藏归档政策**：
   - 网站公开面向全球 B2B 出口的活跃语种严格为 **6 语种：`EN / FR / ES / PT / RU / AR`**。
   - `/zh-cn/` 中文目录已退出公开展示与搜索引擎索引（通过 `.assetsignore` 禁止上传 CDN 静态资源、`workers/site-router.mjs` 对 `/zh-cn` 与 `/zh-cn/*` 返回 `410 Gone` + `X-Robots-Tag: noindex, nofollow, noarchive`、并从 `sitemap.xml`、`hreflang`、语言切换器与 `llms.txt` 全量移除）；本地保留作历史存档，未经用户明确指令不得重新公开。
2. **英文主改动的全语种区域化同步硬规则（EN-First Regionalized Transcreation Gate）**：
   - 凡在 `/en/` 新增页面或实质性修改产品参数、买家指南、证据/质检页及核心转化模块，**必须在同一变更批次内同步更新并适配其余全部 5 个语种（`FR / ES / PT / RU / AR`）**，保持 6 语种 **100% 页面对等（Parity）**、双向 `hreflang`（含 `x-default` 指向 `/en/`）及 `sitemap.xml` 同步闭环。
   - **严禁直译/机翻**：每轮多语种同步必须参照 `data/i18n/regional-slang-glossary.json`（及必要时的实时地区术语检索），将文案**区域化改写（Transcreation）**为目标市场汽摩配维修店、进口商与港口清关惯用行话（如 FR `moto-cargo / tricycle à eau / tiges de culbuteurs / Adjamé / BESC`、ES `varillero / cadenillero / carguero / SUNAT-DIAN`、PT `motor de vareta / kupapata / CNCA-ARCCLA`、RU `штанговый / цепные моторы / Альфа-Дельта / полуавтомат / под трицикл`、AR `موتور أسياخ / موتور كاتينة / تروسيكل تبريد مياه / التوفيقية / ACID-CargoX`），同时保证底层工程数值与批发条款 100% 锁定不变。
3. **GEO 机器可读层深化**：持续完善 `Product` + `PropertyValue`（`additionalProperty`）工程规格、`FAQPage`、`Article`/`TechArticle` 结构化数据，以及 `llms.txt` / `llms-full.txt` 与全站 6 语种核心参数/条款的自动化一致性校验。
4. **Visual Redesign 与 B2B 转化体验**：允许全面升级视觉层级、产品矩阵排版、移动端规格表交互及“选中型号一键带参跳转询盘”，每批外观调整先本地/Preview 多端验收后再发布。
5. **高意图内容持续扩张**：允许基于真实搜索/业务需求在 `EN` 发起高价值对比指南、区域市场或细分机型专页并同步覆盖 `FR / ES / PT / RU / AR`（禁止批量空壳复制；新页面须具备唯一核心词、差异化参数与证据，并自动闭环 `sitemap.xml` 与 `hreflang`）。

## 协作与发布纪律

- 所有非微调变更在独立分支开发，提交说明关联测试与 Preview 结果；
- **未经用户明确指令，不得自行合并或推送至 `main` 并发布生产环境。**
