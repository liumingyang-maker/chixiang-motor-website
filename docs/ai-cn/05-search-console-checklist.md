# 05 搜索平台验证清单（账号动作需授权）

## 百度搜索资源平台

1. 打开 https://ziyuan.baidu.com/ 并登录企业百度账号  
2. 用户中心 → 站点管理 → 添加网站：`https://chixiangmotor.com`  
3. 验证方式：HTML 标签或文件验证（文件放到仓库根目录后走正常 PR）  
4. 验证通过后提交：  
   - Sitemap：`https://chixiangmotor.com/sitemap.xml`  
   - 手动/普通收录首批 URL：  
     `https://chixiangmotor.com/zh-cn/`  
     `https://chixiangmotor.com/zh-cn/products`  
     `https://chixiangmotor.com/zh-cn/cg-engine`  
     `https://chixiangmotor.com/zh-cn/evidence`  
     `https://chixiangmotor.com/zh-cn/domestic-wholesale`  
     `https://chixiangmotor.com/zh-cn/contact`  

> 推送成功 ≠ 保证索引/排名。见 https://ziyuan.baidu.com/college/articleinfo?id=267&page=2

## 其他

| 平台 | 动作 | 备注 |
| --- | --- | --- |
| Bing Webmaster | 验证 + Sitemap + URL 提交 | ChatGPT 联网常吃 Bing |
| Google Search Console | 验证 + Sitemap + Request Indexing | 海外采购商 |
| Yandex | 已有验证文件，补交 sitemap | 俄语市场 |
| 字节/豆包 | 无成熟手动入口；依赖 Bytespider（已 200） | 等自然抓取 |

## 待办

- [ ] 负责人提供百度验证 token / 允许放置验证文件  
- [ ] 上线后第 30/60/90 天记录收录与 AI 引用（见 10）
