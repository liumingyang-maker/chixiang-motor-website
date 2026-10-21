# 12 百度搜索资源平台验证与提交（P0-2）

状态：**方案与操作清单已就绪；平台登录/验证/提交需负责人操作。MiMo 未登录百度、未提交任何 URL。**

官方入口：

- 搜索资源平台：https://ziyuan.baidu.com/
- 普通收录 / URL 提交：https://ziyuan.baidu.com/linksubmit/index
- 工具说明：https://ziyuan.baidu.com/college/articleinfo?id=3076

## 1. 负责人操作步骤（约 10 分钟）

1. 打开 https://ziyuan.baidu.com/ 并登录企业百度账号。  
2. **用户中心 → 站点管理 → 添加网站**：`https://chixiangmotor.com`  
3. 选择验证方式（三选一，以平台实时选项为准）：  
   - **HTML 标签**：把平台生成的 `<meta name="baidu-site-verification" content="…">` 发给 MiMo，走 Draft PR 合并；**内容以平台实时值为准，禁止杜撰**。  
   - **HTML 文件**：下载平台生成的 `xxx.html` 发给 MiMo，放到站点根目录后走 Draft PR。  
   - **CNAME**：在 Cloudflare DNS 加平台要求的解析；勿覆盖现有生产记录。  
4. 验证通过后：  
   - **Sitemap** 提交：`https://chixiangmotor.com/sitemap.xml`  
   - **普通收录 → 手动提交** 优先 URL（见下）  
5. 记录：验证方式、验证时间、提交时间、平台提示原文、截图（勿含账号密码）。

## 2. 首批优先 URL（10 条）

1. `https://chixiangmotor.com/zh-cn/`  
2. `https://chixiangmotor.com/zh-cn/products`  
3. `https://chixiangmotor.com/zh-cn/horizontal-engine`  
4. `https://chixiangmotor.com/zh-cn/cg-engine`  
5. `https://chixiangmotor.com/zh-cn/cargo-tricycle-engine`  
6. `https://chixiangmotor.com/zh-cn/factory`  
7. `https://chixiangmotor.com/zh-cn/evidence`  
8. `https://chixiangmotor.com/zh-cn/domestic-wholesale`  
9. `https://chixiangmotor.com/zh-cn/contact`  
10. `https://chixiangmotor.com/zh-cn/guides/cg250-water-cooled-selection`  

其后补齐其余 8 条（cb / ac320 / parts / guides 索引与另 3 篇指南）。

## 3. 状态字段（务必分开记）

| 字段 | 含义 |
| --- | --- |
| 提交成功 | 平台受理 URL |
| 被抓取 | 平台抓取诊断/日志显示已抓 |
| 被索引 | site: 或流量里可检索到 |

**提交成功 ≠ 索引 ≠ AI 推荐。**

## 4. 复查节奏

- 第 7 / 14 / 30 天看抓取与收录  
- 不要每天重复提交同一批 URL  
- 若提示抓取异常：记错误原文 + 时间，核对 robots / 重定向 / WAF / 国内可达性；**未核实前不关防护**

## 5. 操作记录表（人工填写）

| 日期 | 动作 | 结果/提示 | 截图 | 下次复查 |
| --- | --- | --- | --- | --- |
|  | 添加站点 |  |  |  |
|  | 完成验证 |  |  |  |
|  | 提交 sitemap |  |  |  |
|  | 手动提交 10 URL |  |  |  |
|  | 补齐 18 URL |  |  |  |

**禁止**把百度账号密码、token 提交进仓库。
