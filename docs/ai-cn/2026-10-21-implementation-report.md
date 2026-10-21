# 2026-10-21 实现报告（修订版 · PR #48 合并前补测）

> 回应《驰翔 PR48 正式合并前审核及 MiMo 修复指令》§3。**未合并、未上线。**

## 1. 最终 HEAD

| 项 | 值 |
| --- | --- |
| PR | https://github.com/liumingyang-maker/chixiang-motor-website/pull/48 （Draft） |
| 分支 | `codex/zh-cn-evidence-center` |
| 提交 | `d2c85d2` 功能主提交 → `e0711b5` Sitemap 白名单收紧 + 区间标签 → `（whitespace）` |
| 基线 | `b5acee0` |
| `git diff --check` | **exit 0**（已清尾随空白） |
| 未提交工作区 | 仅本地一次性脚本（未入 PR）；**无未提交业务改动** |

`git diff --stat b5acee0..HEAD`：52+ files，约 +3600/−30 行（以推送 SHA 为准）。

## 2. `String to replace not found` 闭环说明

- **发生时间**：开发过程（写 `tests/site-optimization-invariants.test.js` 时）。  
- **原因**：`stripA1SitemapEntry` 与 `test('sitemap matches baseline…')` 之间隔了 `test('frozen files…')`，一次**跨非相邻块**的 `old_string` 替换失败。  
- **是否在 `d2c85d2` 之后**：否，属提交前编辑尝试；`d2c85d2` 已含可用的 strip 函数。  
- **最终修复提交**：`e0711b5` 将白名单从「任意 `/zh-cn/`」收紧为 **18 条精确 URL**，并断言数量=18 且集合 ⊆ 白名单。  
- **原基线保护仍在**：`stripA1SitemapEntry` 仍剥离 AC320 后与 `frozenBaseline` 逐字比对；冻结文件门禁保留（sitemap / site-entity-manifest 为受控例外）。

### Sitemap URL 差异（XML 解析）

`node/`python 脚本 `scripts/check-sitemap-url-diff.py`（基线 `b5acee0` vs HEAD）：

- OLD_COUNT **53** → NEW_COUNT **71**
- ADDED **18**（全部 `https://chixiangmotor.com/zh-cn/...`）
- REMOVED **0** · DUPLICATES **0**
- 结果：`URL_DIFF_OK`

## 3. 最终 HEAD 测试（可复现）

```text
node --test tests/*.test.js
→ tests 401 · pass 401 · fail 0 · exit 0

node --test workers/contact-api/test/*.test.mjs
→ tests 13 · pass 13 · fail 0

node scripts/apply-product-family-owner-content.js --check → 0
node scripts/apply-contact-procurement-owner-content.js --check → 0
node scripts/apply-site-entity-schema.js --check → 0
```

（401 含新增 `zh-cn-content-quality` 16 条；与上一版数量相同，因加固断言并入既有用例。）

## 4. Preview 验收

| 项 | 值 |
| --- | --- |
| Build | `cdfd0047-9b4b-4f53-9597-d6d98dfceaeb` success |
| Version | `712eb37a-43ff-421c-b116-3bd1e257476e` |
| Preview URL | https://712eb37a-chixiang-motor-website.970201665.workers.dev |
| Alias | https://codex-zh-cn-evidence-center-chixiang-motor-website.970201665.workers.dev |
| 索引 | 响应头 `x-robots-tag: noindex`（预览不可索引）✓ |

### HTTP 抽样（Preview）

18 个中文 URL **全部 200**；`/en/` `/ru/` `/robots.txt` `/sitemap.xml` 200。

### SEO 抽样

- `<html lang="zh-CN">` ✓ · 自指 canonical ✓ · 首页链到 `/zh-cn/evidence` ✓  
- 证据页含 gxq.cq.gov.cn / mopei8.com / CN221406869U ✓  

### 截图（375 / 1280，均 **无整页横向溢出**）

见审阅包 `PR48-REVIEW-PACK/screenshots/`：zh-home、horizontal、cg、cargo、evidence、wholesale、contact × 两视口 = 14 张。

## 5. 询价表单（结构核验，未向生产发信）

| 检查 | 结果 |
| --- | --- |
| `action=/api/contact` | ✓ |
| name / contact / country / requirements | ✓ |
| honeypot | ✓（源码可见） |
| Turnstile | **运行时由 main.js 注入**（源码无静态字段，与现网一致） |
| 强制 WhatsApp | **无** |
| 1688 链接 | ✓ shop7p518ep539950.1688.com |

未做真实 POST（避免生产测试询盘）；沿用原 Worker/反垃圾契约。

## 6. 跨语言检查表

| 语种 | 问题 | 状态 |
| --- | --- | --- |
| RU `ru/index.html` | 24h SLA | **已删**（C11 断言） |
| RU CCC | 「CCC by approved model」 | **已是按型号限定**，无需再改 |
| RU 卧机 50–125/100–125 | 未发现 | OK |
| EN `product-detail` 标签 `100–125cc` | 旧区间 | **已改** `110–150cc`（`e0711b5`）+ 测试断言 |
| ES/PT/AR | 未发现 24h/泛化 CCC/旧区间 | OK（抽样） |
| 全站 | `CCC Certified` 无 | OK |

## 7. 证据三条（预览可点开）

| 证据 | 主体 | 页面锚点 | 来源 |
| --- | --- | --- | --- |
| 高新区 2024 补助公示 | 重庆驰翔摩托车制造有限公司 | `#ev-gxq-2024` | gxq.cq.gov.cn |
| 2023 摩配会 2T85 | 同上 | `#ev-mopei-2023` | mopei8.com |
| 专利 CN221406869U | 权利人关联驰翔 | `#ev-patent-cn221406869u` | Google Patents |

文案均含「证明 / 不代表」。高企编号、ISO/CCC 编号 **继续不公开**。

## 8. 仍需人工（不阻塞本次代码验收）

| 事项 | 影响上线？ |
| --- | --- |
| 合并 PR #48 | **是**（需负责人批准） |
| 百度验证 token | 否 |
| 1688 简介粘贴 | 否 |
| 目录纠错工单 | 否 |
| 产能/证书编号放开 | 否（默认不放开） |

## 9. 合并门槛自检

- [x] HEAD 已提交；`git diff --check` 0  
- [x] Sitemap 冻结测试允许**精确 18 URL**  
- [x] Preview 浏览器 + 移动端截图  
- [x] 18 页 / 证据 / 语言切换正常；外语不退化  
- [x] RU SLA 已处理；CCC 限定；区间标签已修  
- [x] 证据链接准确；三主体/证书不越界  
- [x] Preview `noindex`；生产配置未改  
- [ ] **负责人明确批准合并** ← 等待中  
