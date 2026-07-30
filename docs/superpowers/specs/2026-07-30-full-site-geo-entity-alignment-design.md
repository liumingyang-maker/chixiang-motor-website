# Chixiang Motor Phase 6.1B 全站实体内容对齐设计

日期：2026-07-30  
状态：范围已获用户批准，等待书面规格复核

## 1. 目标

Phase 6.1B 将 EN、RU、ES、PT、AR 五种语言的全部 51 个 canonical 页面纳入同一份逐页变更矩阵。每个页面必须明确标记为“需要事实修正”“需要实体增强”“需要翻译同步”或“仅验证”，但纳入规划不等于强制修改。

本阶段先建立可执行的全站内容计划，再进入 Phase 6.1C 本地实施。实施只产生本地代码、测试结果和预览图，不推送、不创建线上预览部署、不合并，也不部署正式网站。

## 2. 已批准决策

1. 正式页面全部纳入规划，不只处理英文核心页。
2. 五种语言必须共享同一事实口径，型号代码、排量、配置和商业政策不能因翻译发生变化。
3. 不新增国家页面、不新增产品 URL、不重构网站、不改变现有视觉系统。
4. 广告标签、Yandex Metrica、Google Ads、Turnstile、表单 Worker 和成功回调逻辑保持不变。
5. 实施完成后先提供本地预览图和测试证据，由用户审核后再决定是否推送或创建 PR。

## 3. 页面范围

### 3.1 Sitemap 中的 51 个正式页面

九组跨语言页面各包含 EN、RU、ES、PT、AR 版本，共 45 页：

- 首页；
- About；
- Products；
- News；
- Contact；
- CG engine；
- CB engine；
- Horizontal engine；
- Engine parts。

六个单独页面：

- 英文采购指南；
- 英文风冷与水冷对比；
- 俄罗斯市场页；
- 中亚市场页；
- 秘鲁市场页；
- 哥伦比亚市场页。

逐页矩阵必须恰好覆盖以上 51 个 canonical URL，每个 URL 只能出现一次。

### 3.2 非 canonical 工具页面

`/en/product-detail?series=...` 等 `noindex` 工具内容不进入 GEO 扩写，也不重新加入 sitemap。它们只接受事实纠错和链接一致性处理，防止继续向用户展示已确认错误的 HW 倒挡、磁电机或家族命名。

### 3.3 不作为内容页处理的文件

以下文件只做回归验证，不进入实体内容改写：

- `/robots.txt`；
- `/sitemap.xml`；
- Yandex 验证文件；
- `_headers`、`_redirects`；
- 图片、CSS、JavaScript 静态资源；
- `/api/*` 和联系表单 Worker。

## 4. 事实来源与公开边界

### 4.1 权威顺序

页面计划只能引用：

1. `COMPANY_FACT_PACK.csv` 中的 `APPROVED_PUBLIC` 记录；
2. `ENGINE_SPEC_MASTER.csv` 中已获所有者批准且适用范围明确的记录；
3. Phase 6.0 审计和公开资料只能提供背景与证据，不能覆盖所有者批准值；
4. 仍为 `CONFLICTING`、`UNKNOWN` 或 `PENDING_REVIEW` 的事实不得生成新公开声明。

### 4.2 家族级事实

现有 `FAMILY_INTAKE` 规则只能收集线索，不能直接公开成型号规格。为允许发布已经确认的家族卖点，Phase 6.1B 在事实源中增加 `FAMILY` 记录范围：

- `FAMILY` 可以在型号代码为空时保存家族级定位、统一配置和适用边界；
- `FAMILY` 只有在所有者明确确认适用范围、公开措辞和限制后才能标记为 `APPROVED_PUBLIC`；
- 家族记录不能补写单个型号的排量、缸径行程、功率、扭矩、安装尺寸或通用适配；
- 仍缺资料的家族继续保留为 `FAMILY_INTAKE` 和内部记录。

首轮候选转换仅包括已有所有者说明的四个家族：

1. CG balance-shaft；
2. Tsunami water-cooled；
3. HW Water；
4. Automatic-clutch water-cooled。

每条必须先形成中文批准措辞和跨语言安全表达，再进入页面矩阵。

### 4.3 当前明确口径

- 公司自 2003 年起从事相关行业，当前公司于 2007 年注册；不再写“公司成立于 2003 年”。
- 唯一批准 Logo 为 `/images/logo.webp`。
- ISO 9001 只使用不含版本、编号、范围或有效期的通用声明。
- CCC 只说明可提供具有 CCC 认证的产品，不泛化为所有产品。
- `CG150B` 是录入错误，统一使用 `CG150SB`。
- CG 可按订单提供国际挡、循环挡和内置倒挡配置；具体用途表述保持为常见应用，不写通用适配保证。
- 平衡轴配置可谨慎表述为有助于降低单缸发动机振动、改善持续运行平顺性，不写量化降幅。
- Tsunami 是 CG 水冷平台的强化方向，重点描述双重散热、散热鳍片、加大机油容量、润滑与耐久性；未确认的具体升数不写。
- HW Water、Hanwei 和 CG Heavy 为同一家族，通常使用 `HW Water`。
- HW200、HW250、HW300、HW350 全部采用 1.5 L 机油容量、18级磁电机和 20 滚子离合器，且无内置倒挡。
- “18级”是网站所有者指定术语，不能改写成“18极”。英文技术名称确认前，对外英文使用不改变含义的中性表达 `high-output magneto`，不继续使用 `18-pole magneto`。
- Automatic-clutch water-cooled 与内置倒挡系列并列；只有 CG150 和 CG175，实际排量沿用相应 CG 款，不自行补写未确认数值。
- 俄罗斯卧式发动机的正式 CX 型号、YX 市场参考名称、启动、离合、倒挡及 150 cm³ 缸头油冷口径，统一遵循 `2026-07-30-russia-horizontal-cx-yx-model-governance-design.md`。未获网站所有者确认的实际排量、缸径和行程不得从同行资料复制为 CHIXIANG 规格。

## 5. 逐页变更矩阵

创建：

```text
docs/geo-entity/phase-6-1b/PAGE_CHANGE_MATRIX.csv
```

固定字段：

```text
page_id,url,source_file,language,page_type,entity_owner,change_class,source_fact_ids,current_claims,approved_replacement,translation_status,tracking_risk,form_risk,visual_risk,tests,preview_desktop,preview_mobile,decision,notes
```

`change_class` 只允许：

- `FACT_FIX`：删除或更正明确错误；
- `OWNER_ENHANCEMENT`：强化页面负责的公司、产品、应用或市场实体；
- `TRANSLATION_SYNC`：同步其他语言已批准内容；
- `VERIFY_ONLY`：不修改内容，只做回归验证；
- `UTILITY_FIX`：只修正 noindex 工具内容；
- `EXCLUDED`：非内容文件，仅记录排除原因。

同一页面可以有多个具体动作，但矩阵中仍只占一行；动作使用稳定事实 ID 关联，不能复制无来源的新事实。

## 6. 页面分组和实施顺序

所有页面在 Phase 6.1B 同时完成规划；Phase 6.1C 按风险分批实施。

### 第一批：明确事实错误

- 公司成立年份与注册年份；
- 错误 Logo 引用；
- `CG150B`；
- HW 内置倒挡；
- `18-pole magneto`；
- HW、Hanwei、CG Heavy 命名不一致；
- 其他由批准事实直接证明的冲突。

### 第二批：跨语言实体 Owner 页面

- 五种语言首页；
- 五种语言 About；
- 五种语言 Products；
- 五种语言 CG、CB、Horizontal 和 Engine Parts 页面。

### 第三批：市场和广告落地页

- `/ru/russia/`；
- `/ru/central-asia/`；
- `/ru/gorizontalnyj-dvigatel`；
- `/es/peru/`；
- `/es/colombia/`。

该批只修改事实和实体表达，不改变现有广告标签、表单优先级、MOQ、联系渠道或转化事件。

### 第四批：News、Contact、指南和仅验证页面

- 五种语言 News；
- 五种语言 Contact；
- 两个英文指南；
- 无需内容修改但必须完成 canonical、hreflang、移动端和链接回归检查的页面。

## 7. 翻译策略

1. 中文批准事实作为业务含义基准，英文作为跨语言内容母版；型号代码和数字不翻译。
2. 俄语、西班牙语、葡萄牙语和阿拉伯语分别保存目标语言文案，不在运行时自动翻译。
3. 国家页保留当地采购语境，不能把俄罗斯 MOQ、秘鲁市场方向或中亚物流说明复制到其他国家。
4. 没有确认技术对应词时使用中性功能描述，不伪造术语。`18级磁电机` 的英文暂用 `high-output magneto`，不使用 `18-pole`。
5. 阿拉伯语页面必须继续保持 RTL；文案变长后检查按钮、卡片和数字方向。

## 8. 网站修改边界

允许：

- 修改可见文字、Meta、H1/H2、FAQ 和产品卡中的已批准事实；
- 修正内部链接和错误家族名称；
- 必要时将纯 JavaScript 注入的核心实体文字移入原始 HTML；
- 增加仅用于事实一致性和回归保护的测试。

禁止：

- 新增 URL 或恢复参数页索引；
- 改版 Header、Hero、按钮、页脚或颜色系统；
- 修改表单字段、提交端点、Turnstile、Worker 或邮件逻辑；
- 修改 Google Ads、Yandex Metrica 或转化触发条件；
- 修改 robots、sitemap、redirect 或 canonical 架构，除非测试发现本轮引入回归；
- 将宗申公开材料写成 Chixiang 与宗申存在授权、代工或品牌关系的证明。

## 9. 测试设计

### 9.1 内容与实体测试

- 51 个 canonical URL 在矩阵中恰好出现一次；
- 所有 `FACT_FIX` 和 `OWNER_ENHANCEMENT` 都引用至少一个批准事实 ID；
- 公开 HTML 不再出现 HW 内置倒挡或 `18-pole magneto`；
- HW 只使用 `HW Water` 作为主要家族名，Hanwei 和 CG Heavy 只作为别名；
- `CG150B` 不再作为型号出现；
- 卧式发动机按已批准的 CX/YX 双名称和配置规则公开；未批准的实际排量、缸径和行程保持不公开。

### 9.2 SEO 与语言测试

- canonical、hreflang 和 sitemap URL 保持一致；
- 每个页面仍只有一个主要 H1；
- Title 和 Description 不因同步而重复；
- RTL 页面方向和数字显示正常；
- noindex 工具页继续 noindex 且不进入 sitemap。

### 9.3 转化保护

- 现有 151 项网站测试和 13 项 Worker 测试必须全部通过；
- 对广告脚本、Metrica、Turnstile、表单端点和成功回调做文件级或 DOM 断言；
- 表单成功、失败、验证失败和重复提交行为保持不变；
- 本阶段不发送真实询盘，除非用户另行明确授权。

### 9.4 移动端与视觉回归

- 每个实际修改页面生成 1440 px 桌面图和 390×844 手机图；
- 俄罗斯、秘鲁、哥伦比亚和中亚市场页额外生成 768×1024 与 1024×1366 图；
- 检查横向溢出、按钮裁切、产品卡、表单、固定按钮和 RTL；
- 每种语言生成一张缩略图总览，并保留每个页面的独立原图。

## 10. 预览与交付

本地输出：

```text
outputs/phase-6-1b-preview/
  en/
  ru/
  es/
  pt/
  ar/
  contact-sheets/
  test-results/
```

预览图以 URL 对应的稳定文件名保存。用户可先看各语言总览，再打开任意页面的桌面或手机原图。

在用户审核预览图以前：

- 不推送实施分支；
- 不创建会触发 Cloudflare 构建的 PR；
- 不合并；
- 不部署。

## 11. Git 与提交策略

1. 当前 `docs/geo-fact-calibration` 分支只保存事实校准和设计文档。
2. 设计和事实 PR 完成后，Phase 6.1C 使用独立本地分支 `feature/geo-entity-owner-pages`。
3. 实施按四批内容拆成小 commit，确保可以单独回滚。
4. 本地测试和预览通过后才向用户报告；是否推送、创建 PR 或触发 Cloudflare Preview 由用户另行决定。

## 12. 验收标准

- 51 个 canonical 页面全部进入矩阵且无重复、无遗漏；
- 所有修改均能回溯到批准事实；
- 所有语言保持同一事实口径；
- 明确错误从公开内容中删除；
- 未确认事实继续显示为待确认，不被推断；
- 设计、URL、广告、表单和转化逻辑不变；
- 全部自动化测试通过；
- 每个修改页面具有桌面和手机预览；
- 没有发生 push、PR、merge 或 deployment。

## 13. 阶段边界

本设计不授权新增 Schema、产品实体 URL、国家页面、博客、广告活动或预算调整。Schema、独立产品页和广告扩量继续放在可见内容统一、业务闭环验证和用户预览批准之后。
