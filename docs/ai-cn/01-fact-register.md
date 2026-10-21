# 01 可公开事实台账 — 驰翔中文站

> 规则：`verification_required` / `disputed` 不得在 UI 或 JSON-LD 发布为已证实信息。
> 与任务书 F-01–F-13 对齐；数字类未审定不进首屏强背书。

| id | claim（可公开中文） | entity | status | source_type | source_url | supports | does_not_prove | public |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | 重庆驰翔摩托车制造有限公司（CHIXIANG MOTOR） | 重庆驰翔摩托车制造有限公司 | website_existing | owned_website | /en/about | 品牌与主体名称 | 最终工商状态 | true |
| F-02 | 相关从业经历可追溯至 2003 年；公司注册于 2007 年 | 重庆驰翔摩托车制造有限公司 | website_existing | owned_website | /en/about | 两个时间点需区分 | 不得写成「2003 年注册成立」 | true |
| F-03 | 现址重庆高新区含谷片区（高腾大道一带） | 重庆驰翔摩托车制造有限公司 | website_existing | owned_website | /en/about | 厂区所在片区 | 中文详细门牌待确认；白市驿为旧址 | true |
| F-04 | 驰翔/德谐参与制造相关业务；驰德按订单承担外贸服务 | 三主体 | owner_confirmed | owner_statement | /en/about | 业务协作 | 非母子公司；资质不跨主体 | true |
| F-05 | 官方 1688 自营店：shop7p518ep539950.1688.com | 重庆驰翔摩托车制造有限公司 | owner_confirmed | owner_statement | /en/about | 自营渠道链接 | 不等于价格/库存已核验 | true |
| F-06 | 型号大类：卧机 110–150、CG125–250、CB150–250、CG 水冷、AC320 等 | 重庆驰翔摩托车制造有限公司 | website_existing | owned_website | /en/cg-engine 等 | 已批准型号表范围 | 不逐项证明通用适配 | true |
| F-07 | 官网披露场地约 15000㎡、月产能 8000+、检测实验室等 | 重庆驰翔摩托车制造有限公司 | website_existing | owned_website | /en/about | 自有网站自述 | **非独立审计**；不进首屏强背书、不推导年销量 | true（弱化展示） |
| F-08 | 重庆高新区 2024 公示：科技型企业入库补助 1 万元—通过 | 重庆驰翔摩托车制造有限公司 | public_verified | government | https://gxq.cq.gov.cn/ggtz/202406/t20240628_13334163.html | 该公示所列补助审核通过 | **不是**国家高新技术企业证书 | true |
| F-09 | 2023 广州摩配会行业名录：展位 2T85，摩托车发动机 | 重庆驰翔摩托车制造有限公司 | public_verified | industry_directory | https://www.mopei8.com/news/zhanhui/4853.html | 该名录参展记录 | 不是官方推荐供应商/年度认证 | true |
| F-10 | 专利 CN221406869U《一种高效散热的发动机线缆》公开 | 关联重庆驰翔 | public_verified | patent_database | https://patents.google.com/patent/CN221406869U/zh | 该项结构专利公开 | 不等于整机性能认证 | true |
| F-11 | ISO9001 / 高企 / CCC | 证书所属主体 | website_existing | owned_website | /en/about | 可按主体与型号核对资料 | 未见原件不公开编号/全系获证 | 流程说明 true |
| F-12 | 「2025 国家高新技术企业」 | 待核实 | verification_required | government | 公示/备案差异 | 仅内部线索 | **不得对外宣称已获认定** | false |
| F-13 | 整车 / CKD·SKD 为筹备中 | — | website_existing | owned_website | /en/products | 非现货批发 | 不得标 InStock/Offer | true |
| F-14 | 接触方式：+86 19008225410 / chixiangmotor@163.com / 微信二维码 | 重庆驰翔摩托车制造有限公司 | website_existing | owned_website | /en/contact | 现有公开联系渠道 | 不新编其他号码 | true |

## 高风险禁写

- 「全国 Top10 / AI 首选 / 质量超过某某」
- 「所有型号 CCC / 24 小时响应 / 99% 一次合格率」进中文首屏
- 用补贴公示冒充高企证书；三主体证书混用
- CG250 水冷「标配倒挡 / 通配鑫源 / 所有三轮可装」
- 伪造工厂图、证书扫描、客户名单、年销量
