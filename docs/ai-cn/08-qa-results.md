# 08 质检结果

## 自动化

| 命令 | 结果 |
| --- | --- |
| `node --test tests/*.test.js` | **401 / 401 通过**（含 16 条 `zh-cn-content-quality`） |
| `node scripts/apply-product-family-owner-content.js --check` | 0 drift |
| `node scripts/apply-contact-procurement-owner-content.js --check` | 0 drift |
| `node scripts/apply-site-entity-schema.js --check` | 0 drift |

## 任务书用例映射

| 用例 | 结果 |
| --- | --- |
| C01–C14 | 见 `tests/zh-cn-content-quality.test.js`，全部通过 |
| 俄语 24h SLA | C11 通过（已删除） |
| CKD 非现货 | C14 通过 |
| 证据三链 | C06 通过 |
| 高企不当已获认定 | C07 通过 |

## 浏览器/预览

- 本地静态检查：HTML 源码可读、导航/表单/外链存在。  
- **Cloudflare Preview**：待 PR 创建后核验 URL。  
- 375/1280 视口截图：预览环境补测。

## 未测

- 真实表单 POST 到 `/api/contact`（沿用原契约，未改后端）。  
- 百度/Bing 收录（需账号）。  
- 豆包/DeepSeek 真实问答基线（见 10 模板，需人工测）。
