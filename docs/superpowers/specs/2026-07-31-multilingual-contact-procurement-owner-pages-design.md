# Chixiang Motor 多语言 Contact／采购询盘 Owner 页面治理设计

日期：2026-07-31  
分支：`feature/multilingual-contact-procurement-owner-pages`  
状态：设计已批准，等待书面规范复核

## 1. 目标

把英语、西班牙语、葡萄牙语、俄语和阿拉伯语的五个 Contact 页面，从普通“联系我们”页面升级为事实受控的 B2B 采购询盘入口：

- 让采购商明确知道 Chixiang Motor 当前供应发动机和发动机配件，而不是整车；
- 让采购商提交足够的选型与报价信息；
- 让站内表单成为第一转化路径；
- 保留 Email、WeChat、WhatsApp 和电话作为主动选择的补充渠道；
- 不公开未经产品／市场单独批准的价格、MOQ、样品、运输或交期数字；
- 保持现有 Worker、Turnstile、邮件、Google Ads 和 Yandex Metrica 成功后转化链路不变。

本阶段属于内容、采购路径和事实治理，不进行页面视觉改版。

## 2. 页面范围

| 语言 | 正式 URL | 源文件 |
| --- | --- | --- |
| English | `/en/contact` | `en/contact.html` |
| Español | `/es/contacto` | `es/contacto.html` |
| Português | `/pt/contato` | `pt/contato.html` |
| Русский | `/ru/kontakty` | `ru/kontakty.html` |
| العربية | `/ar/contact` | `ar/contact.html` |

五个页面继续作为各自语言中的唯一 `ContactPage` Owner。国家广告落地页继续负责市场专属政策和转化表达，不与 Contact 页面争夺市场页面 Owner 身份。

## 3. 事实与公开边界

页面只允许发布以下已确认事实：

- 品牌：`CHIXIANG MOTOR`；
- 当前供应：摩托车发动机、货运三轮车发动机、ATV／越野用途发动机和发动机配件；
- 当前产品家族：CG、CB、卧式发动机及发动机配件；
- 能力：批量采购、OEM／ODM 沟通、型号和应用匹配；
- 联系邮箱：`chixiangmotor@163.com`；
- 联系电话／WhatsApp：`+86 19008225410`；
- 工厂所在地：Chongqing, China；
- WeChat 作为主动补充联系方式保留。

以下内容不得在五个通用 Contact 页面公开：

- 全站统一 MOQ、样品数量、试单数量或混批门槛；
- 固定价格、折扣、库存、交期、运输天数或物流承诺；
- 把未来摩托车 CKD／SKD 项目写成当前可订购产品；
- 把完整摩托车、完整货运三轮车或完整 ATV 写成当前供应；
- 未批准的具体发动机排量、缸径、行程、功率、扭矩或适配承诺；
- Offer、Review、AggregateRating 或其他没有事实依据的结构化数据。

市场专属数字继续只由对应落地页拥有。例如俄罗斯卧式发动机页面已经批准的样品和正式订单门槛，不扩展成通用公司政策。

## 4. B2B 采购表单

五个页面使用一致的字段合同和各自语言的自然文案。

### 4.1 必填字段

- `name`：联系人姓名；
- `company`：公司／采购组织；
- `contact`：业务联系方式，可填写 Email、WeChat、WhatsApp 或电话；
- `country`：目标国家／市场；
- `product_interest`：产品家族；
- `quantity`：预计采购数量，可填写混合型号数量说明；
- `application`：摩托车、货运三轮车、ATV／越野、替换维修、装配项目或其他应用。

### 4.2 可选字段

- `email`：单独的回复邮箱；
- `requirements`：型号、发动机代码、配置、车辆、OEM／ODM 和其他要求。

### 4.3 产品选项

产品下拉框只包含当前可公开供应范围：

1. Horizontal engine series；
2. CG engine series；
3. CB engine series；
4. Engine parts；
5. Multiple engine families／Need recommendation。

删除当前页面中的 `Motorcycles`、`Tricycles` 和其他会被理解为完整车辆现货的选项。货运三轮车只作为发动机应用出现在 `application` 字段中。

### 4.4 表单技术合同

- `method="POST"`；
- `action="/api/contact"`；
- 保留 honeypot；
- 保留 Turnstile 动态挂载；
- 添加稳定的 `source_form`，分别标记五个通用 Contact 页面；
- 保留 `page_url`、`site_language` 和广告归因字段的现有自动补充；
- 不修改 `workers/contact-api/**` 的校验、邮件或响应合同；
- 不修改成功后 `gtag_report_conversion()` 以及 Yandex 对 `/api/contact` 2xx 的监听条件；
- 重复点击期间仍只允许一个请求。

## 5. 联系方式优先级

所有语言都遵循：

1. 站内采购询盘表单；
2. Email；
3. 当地适用的主动即时沟通渠道；
4. 电话。

具体顺序：

| 语言 | 补充渠道顺序 |
| --- | --- |
| EN | Email → WeChat → WhatsApp → Phone |
| RU | Email → WeChat → WhatsApp → Phone |
| ES | Email → WhatsApp → WeChat → Phone |
| PT | Email → WhatsApp → WeChat → Phone |
| AR | Email → WhatsApp → WeChat → Phone |

WhatsApp 浮动入口可以保留，以维持已有主动点击路径和点击跟踪，但不得继续作为 Contact 页面 Hero、正文或手机底栏的第一按钮。手机底栏的第一按钮指向本页表单，第二按钮使用 Email。

## 6. 失败与成功行为

五个通用 Contact 表单都设置 `data-whatsapp-fallback="false"`：

- 验证失败：留在页面并显示本地化错误；
- Turnstile 失败：不提交、不记录转化；
- 网络失败：保留用户填写内容，显示 Email 备用方式，不自动打开 WhatsApp；
- Worker 错误或邮件发送失败：显示错误，不记录转化；
- Worker 返回 2xx：显示成功提示、清空表单并触发一次既有转化；
- 待处理期间重复点击：不创建第二次请求或第二次转化。

这项规则确保“补充渠道”由用户主动选择，而不是在表单失败时强制跳转。

## 7. 原始 HTML、SEO 与 GEO

每个页面在原始 HTML 中直接包含：

- 唯一 H1；
- 当前供应范围；
- B2B 采购说明；
- 报价需要的信息清单；
- 当前产品家族链接；
- 联系方式优先级；
- 表单字段与本地化标签；
- 明确的采购事实边界。

Title 和 Description 使用自然的 B2B 采购语言，但不堆砌型号或市场关键词。Canonical、hreflang 和现有干净 URL 不变。

每个页面继续使用安全的：

- `ContactPage`；
- `Organization` 引用；
- `WebSite` 引用；
- `BreadcrumbList`。

Schema 只复述页面可见内容。不得添加 `Product`、`ProductGroup`、`Offer`、`Review` 或 `AggregateRating`。

## 8. 页面结构与视觉边界

保留现有 Header、Footer、两栏 Contact 布局、颜色、字体、按钮体系和响应式断点。

允许的可见调整：

- 替换 H1 下方的采购说明；
- 把正文第一动作改为站内表单；
- 重排现有联系方式；
- 增加 B2B 报价资料清单；
- 替换表单字段和本地化文案；
- 删除误导性的完整车辆产品选项；
- 删除英语页没有实际地图功能的 `[Google Map ...]` 占位内容，改为使用同一区块展示已批准的报价资料清单；
- 调整手机底栏的按钮顺序和目标；
- 为新增字段补充现有设计体系中的最少 CSS。

本阶段不允许：

- 重做 Hero、Header、Footer 或表单卡片视觉；
- 新增动画、地图服务、聊天插件或第三方表单；
- 更改图片风格、页面颜色或品牌系统；
- 修改国家落地页；
- 引入 React、Next.js、GTM 或新构建工具。

## 9. 实施结构

采用“共享数据合同 + 每页原始 HTML”的方式：

- 一个 Node.js manifest 记录五个路由、语言、字段标签、产品／应用选项、联系方式顺序和本地化状态文案；
- 一个确定性脚本把受管理的 Contact Owner 区块写入五个 HTML 文件；
- 表单和实体内容直接存在于各自 HTML 中，不依赖 JavaScript 后填充；
- 俄语和阿拉伯语可使用 Unicode 或现有实体编码，但生成结果必须可读且阿拉伯语保持 RTL；
- 脚本提供 `--check`，确保生成内容无漂移；
- 现有 `js/main.js`、Yandex 脚本和 Worker 作为受保护文件，不为本阶段重构。

## 10. 测试与验收

### 10.1 自动测试

新增合同测试，验证：

- 五个页面全部存在于 Sitemap；
- 每页恰好一个 H1；
- 字段名、必填状态、产品选项和应用选项一致；
- 不再出现完整摩托车／完整三轮车当前供应选项；
- 不出现通用 MOQ、价格、交期或未批准规格；
- `data-whatsapp-fallback="false"` 存在；
- 表单、Turnstile、Worker 和转化所需合同保留；
- ContactPage、面包屑和内部链接有效；
- 俄罗斯渠道顺序正确；
- 阿拉伯语 RTL 与 honeypot 不产生横向溢出；
- 生成器第二次执行无差异。

同时运行：

- 全部网站 Node 测试；
- 全部 Contact Worker 测试；
- Google 成功后转化测试；
- Yandex 成功后目标测试；
- WhatsApp 主动点击测试；
- sitemap、canonical、hreflang、Schema 和实体图测试；
- `git diff --check`。

### 10.2 浏览器验收

五个页面分别检查：

- `390×844`；
- `768×1024`；
- `1440×1000`。

检查 H1、两栏／单栏切换、表单字段、选择框、状态提示、手机底栏、渠道顺序、阿拉伯语 RTL、无横向溢出和无控制台错误。

### 10.3 Preview 交付

一个 PR 统一修改五个页面，但提供五个独立 Preview URL。PR 不自动合并。

## 11. 非目标

- 不修改四个国家市场落地页；
- 不新增国家页、产品页或新闻文章；
- 不统一市场专属 MOQ；
- 不调整广告预算或广告系列；
- 不做生产真实询盘提交；
- 不进行页面视觉重做；
- 不解决本阶段之外的 Lighthouse 或搜索引擎收录观察项。

## 12. 回滚

PR 合并前可直接关闭，不影响生产。合并后如需整体撤销，使用一次 `git revert <merge-commit>`。不要单独回退某个语言页面，以免表单字段、联系方式顺序和 Schema 再次分裂。
