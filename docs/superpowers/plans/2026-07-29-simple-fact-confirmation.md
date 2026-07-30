# Chixiang Motor 46 条事实个人确认表实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从现有两份事实 CSV 生成一份只供唯一审核人填写的 46 条简化确认工作簿。

**Architecture:** CSV 继续作为完整事实源；临时 JavaScript 构建器使用 `@oai/artifact-tool` 读取 25 条公司事实和 21 条发动机记录，压缩成四列审核界面。每个“确认项目”单元格使用评论保存稳定记录 ID，用户界面不增加 ID 列；用户填写结果后再由 Codex 回写 CSV。

**Tech Stack:** PowerShell、Bundled Node.js、`@oai/artifact-tool`、XLSX

---

## 文件结构

- Read: `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`
- Read: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`
- Read: `docs/superpowers/specs/2026-07-29-simple-fact-confirmation-design.md`
- Create temporarily: `C:/Users/97020/AppData/Local/Temp/codex-simple-fact-confirmation/build_simple_fact_confirmation.mjs`
- Create: `C:/Users/97020/Documents/Codex/2026-07-27/files-mentioned-by-the-user-pr/outputs/phase-6-1a-simple-confirmation/CHIXIANG_46_FACTS_CONFIRMATION.xlsx`

构建器和渲染预览只保留在临时目录，不提交 Git，不放入最终输出目录。

### Task 1: 校验数据源与转换规则

**Files:**
- Verify: `docs/geo-entity/fact-calibration/COMPANY_FACT_PACK.csv`
- Verify: `docs/geo-entity/fact-calibration/ENGINE_SPEC_MASTER.csv`

- [ ] **Step 1: 验证记录数量和唯一 ID**

Run:

```powershell
$company = Import-Csv -Encoding UTF8 docs\geo-entity\fact-calibration\COMPANY_FACT_PACK.csv
$engine = Import-Csv -Encoding UTF8 docs\geo-entity\fact-calibration\ENGINE_SPEC_MASTER.csv
if ($company.Count -ne 25) { throw "Expected 25 company facts" }
if ($engine.Count -ne 21) { throw "Expected 21 engine records" }
if (($company | Group-Object fact_id | Where-Object Count -gt 1).Count) { throw "Duplicate fact_id" }
if (($engine | Group-Object spec_id | Where-Object Count -gt 1).Count) { throw "Duplicate spec_id" }
```

Expected: exit code 0。

- [ ] **Step 2: 固定用户选择枚举**

构建器必须使用以下四项，顺序不变：

```javascript
const decisionOptions = [
  "保留当前值",
  "修改，以备注为准",
  "不公开",
  "暂不确定",
];
```

- [ ] **Step 3: 固定当前值压缩函数**

公司事实使用：

```javascript
function companyCurrent(row) {
  const current = String(row.current_website_value || "").trim();
  const other = String(row.other_source_values || "").trim();
  if (current && other) return `官网/当前：${current}\n其他来源：${other}`;
  if (current) return current;
  if (other) return `当前没有官网值\n其他来源：${other}`;
  return "当前没有公开值";
}
```

发动机记录使用：

```javascript
function engineCurrent(row) {
  const model = String(row.model_code || "").trim() || "尚未确定型号代码";
  const website = String(row.current_website_values || "").trim() || "当前没有完整公开规格";
  const caution = String(row.conflict_summary || "").trim();
  const scopeNote = row.record_scope === "FAMILY_INTAKE"
    ? "家族资料，尚不是批准型号规格。"
    : "";
  return [
    `型号：${model}；家族：${row.family}`,
    website,
    scopeNote,
    caution ? `提示：${caution}` : "",
  ].filter(Boolean).join("\n");
}
```

### Task 2: 构建个人确认工作簿

**Files:**
- Create temporarily: `C:/Users/97020/AppData/Local/Temp/codex-simple-fact-confirmation/build_simple_fact_confirmation.mjs`
- Create: `C:/Users/97020/Documents/Codex/2026-07-27/files-mentioned-by-the-user-pr/outputs/phase-6-1a-simple-confirmation/CHIXIANG_46_FACTS_CONFIRMATION.xlsx`

- [ ] **Step 1: 加载工作区依赖**

调用 `codex_app__load_workspace_dependencies`，只使用返回的 Node.js 和 `node_modules`。在临时目录创建指向该 `node_modules` 的 Windows Junction，不安装包、不读取包内部源码。

- [ ] **Step 2: 创建三张工作表**

构建器创建：

```javascript
const workbook = Workbook.create();
const instructions = workbook.worksheets.add("填写说明");
const companySheet = workbook.worksheets.add("公司事实");
const engineSheet = workbook.worksheets.add("发动机规格");
```

`填写说明`只说明四种选择和回传方式。`公司事实`写 25 行，`发动机规格`写 21 行。

- [ ] **Step 3: 写入恰好四个可见列**

两张确认表写入：

```javascript
const visibleHeaders = ["确认项目", "当前值", "你的选择", "备注"];
```

公司事实的“确认项目”使用 `field_name_zh`；发动机规格使用 `marketing_name`，为空时使用 `family`。

- [ ] **Step 4: 保存稳定 ID 映射**

先设置评论作者：

```javascript
workbook.comments.setSelf({ displayName: "Codex" });
```

每个“确认项目”单元格添加评论：

```javascript
workbook.comments.addThread(
  { cell: sheet.getRange(`A${rowNumber}`) },
  `record_id=${recordId}`,
);
```

公司记录使用 `fact_id`，发动机记录使用 `spec_id`。不新增可见 ID 列，不按行号回写。

- [ ] **Step 5: 添加下拉菜单和输入样式**

对 `你的选择` 列应用：

```javascript
sheet.getRange(`C2:C${lastRow}`).dataValidation = {
  rule: { type: "list", values: decisionOptions },
};
```

`C:D` 使用浅黄色。证据状态为 `CONFLICTING` 或 `UNKNOWN` 的行，`B` 使用浅红色；其他行保持白色或轻度分栏色。冻结第一行、启用筛选、自动换行，表头使用深蓝色。

- [ ] **Step 6: 导出唯一最终文件**

使用：

```javascript
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
```

最终输出目录只保留 `CHIXIANG_46_FACTS_CONFIRMATION.xlsx`。

### Task 3: 验证工作簿结构与交互

**Files:**
- Verify: `C:/Users/97020/Documents/Codex/2026-07-27/files-mentioned-by-the-user-pr/outputs/phase-6-1a-simple-confirmation/CHIXIANG_46_FACTS_CONFIRMATION.xlsx`

- [ ] **Step 1: 重新导入 XLSX**

使用：

```javascript
const imported = await SpreadsheetFile.importXlsx(await FileBlob.load(outputPath));
```

验证工作表顺序恰好为：

```text
填写说明
公司事实
发动机规格
```

- [ ] **Step 2: 验证行列数量**

要求：

```text
公司事实：A1:D26
发动机规格：A1:D22
```

两张确认表各有四个可见列，数据总数为 46。

- [ ] **Step 3: 验证选择和 ID**

检查 C 列的 46 个输入单元格均使用相同四项下拉菜单。使用 workbook 的 thread inspect 或评论集合验证 46 个 `record_id=` 评论，且 ID 与两份 CSV 一一对应。

- [ ] **Step 4: 扫描错误**

扫描全部已使用单元格，不得出现：

```text
#REF!
#DIV/0!
#VALUE!
#NAME?
#N/A
```

- [ ] **Step 5: 检查 XLSX 签名和输出目录**

文件前四字节必须为 `50 4B 03 04`。输出目录必须只有一个 `.xlsx` 文件，没有预览图、构建器或 inspect sidecar。

### Task 4: 渲染检查和项目安全验证

**Files:**
- Verify: `C:/Users/97020/Documents/Codex/2026-07-27/files-mentioned-by-the-user-pr/outputs/phase-6-1a-simple-confirmation/CHIXIANG_46_FACTS_CONFIRMATION.xlsx`
- Verify: repository scope

- [ ] **Step 1: 渲染三张工作表**

将三张工作表渲染到临时目录。检查标题、中文、四列布局、换行、冲突红色提示、黄色输入区、下拉标记和无裁切。发现严重问题时只修改临时构建器并重新导出。

- [ ] **Step 2: 确认仓库变更范围**

Run:

```powershell
git status --short
git diff --check
```

除本设计文档和本计划文档外，本任务不新增网站生产文件变更。工作簿在 `outputs` 目录，不提交仓库。

- [ ] **Step 3: 运行现有回归测试**

Run:

```powershell
$node = 'C:\Users\97020\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$siteTests = Get-ChildItem tests -Filter '*.test.js' -File | Select-Object -ExpandProperty FullName
& $node --test $siteTests
$workerTests = Get-ChildItem workers\contact-api\test -Filter '*.test.mjs' -File | Select-Object -ExpandProperty FullName
& $node --test $workerTests
```

Expected: 151 个网站测试和 13 个 Worker 测试通过。

- [ ] **Step 4: 交付填写说明**

交付时只告诉用户：打开两张确认表，在黄色 `你的选择` 和 `备注` 中填写，完成后把同一个 Excel 发回。不要要求用户阅读完整证据工作簿。
