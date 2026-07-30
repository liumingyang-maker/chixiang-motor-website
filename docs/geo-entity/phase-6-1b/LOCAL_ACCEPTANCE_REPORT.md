# Phase 6.1B GEO 实体内容对齐：本地验收报告

日期：2026-07-30  
分支：`feature/geo-entity-owner-pages`  
实施验收节点：`14c6e23`  
状态：本地实施与自动验收完成，等待网站所有者审核预览；未推送、未创建 PR、未合并、未部署。

## 1. 验收结论

本阶段在不新增 canonical 页面、不改变 URL 结构、不改变广告和询盘转化逻辑的前提下，完成了公司、发动机家族和市场页面的事实对齐。

- `sitemap.xml` 的 51 个 canonical 页面全部进入逐页矩阵。
- 48 个页面发生事实、翻译、hreflang 或预览阶段资源修正，标记为 `CHANGED`。
- 3 个页面完成核验但没有制造无必要改动，标记为 `VERIFIED_NO_CHANGE`：
  - `en/cb-engine.html`
  - `en/engine-parts.html`
  - `ru/russia/index.html`
- `en/product-detail.html` 继续作为 `noindex` 查询工具，不进入 sitemap；其中的发动机家族说明已限制在批准事实范围内。

## 2. 本地提交记录

本次实施从已批准设计和执行计划之后形成以下本地提交：

| Commit | 内容 |
|---|---|
| `b749733` | 批准并固化四个发动机家族的公开边界 |
| `c6716b3` | 建立 51 页精确变更矩阵 |
| `80ae5c4` | 五语言公司身份与时间线对齐 |
| `06deb88` | 五语言发动机家族事实对齐 |
| `5a4567e` | 市场落地页事实对齐 |
| `9e0271b` | 增加全站实体、hreflang、跟踪保护回归验收 |
| `429f3b2` | 修复 RTL 联系页隐藏字段造成的离屏画布 |
| `fc9305b` | 恢复四个卧式产品 owner 页的现有 WebP 主图 |
| `d668bd8` | 增加真实设备视口的本地全站截图工具 |
| `9437a1f` | 将页面矩阵链接到最终预览目录 |
| `14c6e23` | 将预览阶段修正同步回变更记录与最终统计 |

上述提交只存在于本地分支。

## 3. 事实变更摘要

### 公司实体

- 五语言统一表达为：自 2003 年起拥有行业经验；当前公司于 2007 年注册。
- 不再把当前公司写成“成立于 2003 年”。
- 公开证书名称收敛为 `ISO 9001`，不发布未经确认的具体版本号。
- 英文首页现有 Organization Schema 的 `foundingDate` 修正为 2007，Logo URL 修正为已存在的 WebP；Schema 类型、结构和加载方式未改。

### 产品实体

- HW Water 为主名称；Hanwei、CG Heavy 只作为同家族别名。
- HW Water 全家族公开配置：1.5 L 机油容量、20 滚子离合、高输出磁电机、无内置倒挡。
- 中文事实源保留所有者术语 `18级磁电机`；多语言公开页不误写成 `18-pole` 或 `18极`。
- `CG150B` 修正为 `CG150SB`。
- CG 挡位、平衡轴、海啸水冷、自动离合水冷等内容只使用已批准的家族级描述，不推断未批准型号规格。

### 市场实体

- 秘鲁、哥伦比亚、俄罗斯和中亚继续保留各自既有 B2B、MOQ、物流和联系方式策略。
- 中亚公开主名称从 `CG Heavy` 对齐为 `HW Water`，并移除错误的 18 极推断。
- 俄罗斯卧式广告页补齐五语言 hreflang 互链；Google Ads、Yandex、表单和转化路径未改。

## 4. 预览阶段发现并修复的问题

### RTL 联系页横向画布

阿拉伯语联系页原来的反垃圾字段使用 `left:-9999px`，在 RTL 页面中形成约 11,000px 的离屏画布。四个翻译联系页改为裁剪式隐藏类后，阿拉伯语页的 `scrollWidth` 与真实视口宽度一致。字段名、表单合同、提交处理器和反垃圾判断不变。

### 卧式发动机主图缺失

英语、西语、葡语和阿拉伯语卧式系列页引用了不存在的同名 `.png`。仓库内实际文件为 `.webp`，现已改为现有 WebP 路径，主图和相关卡片图恢复。没有新增或替换用户素材。

### 手机截图视口校准

Windows Edge 的 `--window-size=390,844` 实际会产生大于 390px 的内部排版视口，导致旧截图右侧被错误裁掉。最终截图工具改用浏览器调试协议设置设备指标，并在保存前同时校验浏览器布局视口和 PNG 尺寸。

## 5. 自动测试结果

最终全量验证结果：

| 测试 | 结果 |
|---|---:|
| 网站 Node 测试 | 166 / 166 PASS |
| Contact Worker 测试 | 13 / 13 PASS |
| `git diff --check` | PASS，退出码 0 |
| 51 页矩阵覆盖与预览路径 | PASS |
| H1、自 canonical、九组五语言 hreflang | PASS |
| 跟踪、表单与 Worker 字节保护 | PASS |

Worker 测试会主动模拟“发件域名未启用”的失败场景，因此日志中出现一次 `Sender domain is not enabled` 是预期测试输出；对应测试通过，不代表线上发送故障。

## 6. 受保护文件

以下核心文件与实施前 SHA-256 完全一致：

| 文件 | SHA-256 |
|---|---|
| `workers/contact-api/src/index.mjs` | `D24CF2D2DC596265D57C9011909E2A0CF567FC8A2D1EEE816F4C97F46C151C42` |
| `js/main.js` | `D685FEFC94AE57B27E470335B315D8CFACF8B8F6DE56E3DB8EEBFBC391227BA8` |
| `js/yandex-metrica.js` | `7FF3C32D95E7672476CB33F4B3B3EE90880A5DCEEB6CA1C9AF342CA3D59F9608` |
| `js/yandex-metrika.js` | `14F540301683170BA4BA807FEAF033791E74F68603A2394845E01C29BD107CCB` |

因此本阶段没有修改 Google Ads、Yandex Metrica、成功提交后的转化回调、Turnstile、邮件发送或 Worker 逻辑。

## 7. 本地预览证据

正式输出目录：`outputs/phase-6-1b-preview/`

| 视口 | 数量 |
|---|---:|
| 1440×1000 桌面 | 51 |
| 390×844 手机 | 51 |
| 768×1024 平板（5 个重点市场页） | 5 |
| 1024×1366 平板（5 个重点市场页） | 5 |
| 总计 | 112 |

另外生成 5 张语言桌面联系表：

- [English contact sheet](../../../outputs/phase-6-1b-preview/contact-sheets/en-desktop-contact-sheet.png)
- [Russian contact sheet](../../../outputs/phase-6-1b-preview/contact-sheets/ru-desktop-contact-sheet.png)
- [Spanish contact sheet](../../../outputs/phase-6-1b-preview/contact-sheets/es-desktop-contact-sheet.png)
- [Portuguese contact sheet](../../../outputs/phase-6-1b-preview/contact-sheets/pt-desktop-contact-sheet.png)
- [Arabic contact sheet](../../../outputs/phase-6-1b-preview/contact-sheets/ar-desktop-contact-sheet.png)

截图检查结果：

- 112 张尺寸与目标视口完全一致。
- 0 张小于 10 KB。
- 0 张近似纯色或空白图。
- 五语言桌面总览和手机总览已逐组检查。
- 五个重点市场页的 390、768、1024 和 1440 首屏均已检查。
- 本地预览服务器已停止。

## 8. 已知未解决项

`152FMH` 型号与排量映射仍存在来源冲突。本阶段继续保留为 `PENDING`，没有推断、补写或修改其具体排量关系。后续必须以工厂批准的规格主表为准再调整。

## 9. 外部状态确认

截至本报告生成时：

- 未运行 `git push`。
- 未创建 Pull Request。
- 未合并任何分支。
- 未运行 Cloudflare、Wrangler 或其他部署命令。
- 未修改生产环境。

下一步只应由网站所有者审核本地预览；收到明确批准后，再单独执行推送和 Preview 部署流程。
