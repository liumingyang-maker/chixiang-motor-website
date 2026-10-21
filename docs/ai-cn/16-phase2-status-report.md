# 第二阶段回报（百度 / AI 基线 / 信息统一）

日期：2026-10-21 · 分支 `codex/phase2-search-ai-baseline`（基线 `b47b74e`）  
性质：文档与清单交付；**不改生产页面逻辑**。合并须 Draft PR 批准。

## 已完成

| 项 | 交付 |
| --- | --- |
| P0-1 生产审计 | `11-production-search-audit.md`：18 中文 URL 全 200、无 noindex、sitemap 18 条、robots Allow |
| 跨语言实况 | **`/en/products` 现网已无 `100–125`**（检索为缓存）；`/en/horizontal` `110–150`；RU 无 50–125 / 无 SLA / CCC 按型号 |
| P0-2 百度 | `12-baidu-verify-submit.md`：验证三方式 + 10+8 URL 清单 + 状态字段表 |
| P0-3 AI 基线 | `13-ai-baseline-results.md` + `13-ai-baseline-raw.csv`（15 盲测题 + 2 品牌对照） |
| P1 1688 | `14-1688-publication-check.md`：可粘贴简介 + 发布记录表 |
| P1 名录 | `15-directory-correction-log.md`：字段对照 + 工单表 |

## 待人工

- 百度登录验证与提交（负责人）  
- 1688 简介发布（店铺管理员）  
- 第三方名录工单（授权人员）  
- 豆包/DeepSeek/千问/元宝 App 盲测（发回原始答复即可）  

## 无法验证

- 中国大陆网络路径抽测  
- 百度收录/索引真实状态（须平台）  
- 各 AI App 自动化访问  

## 风险与建议

1. **不要**把「URL 提交成功」写成「已收录/会推荐」。  
2. 首轮盲测有数据后再定主推词（卧机 / CG250 水冷 / 重庆工厂）。  
3. 合并本 PR 仍会触发生产部署（仅文档，风险低）；仍走批准流程。  
