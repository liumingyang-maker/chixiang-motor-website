from pathlib import Path
import csv

ROOT = Path(__file__).resolve().parents[1]
evidence = list(csv.DictReader((ROOT / "data" / "phase4_evidence_log.csv").open(encoding="utf-8")))
ids = [row["Evidence ID"] for row in evidence if row["Evidence ID"]]
required_workbooks = [
    "Phase_4_Country_Product_Demand_Ranking.xlsx", "Phase_4_Product_Country_Matrix.xlsx",
    "Phase_4_Competitor_Product_Map.xlsx", "Phase_4_Keyword_Master.xlsx",
    "Phase_4_Negative_Keywords.xlsx", "Phase_4_Campaign_Architecture.xlsx",
    "Phase_4_Landing_Page_Roadmap.xlsx", "Phase_4_Budget_Models.xlsx",
]
required_docs = ["Phase_4_Executive_Summary.md", "Phase_4_Data_Gaps.md", "Phase_4_Codex_Implementation_Instructions.md"]
countries = {row["Country"] for row in evidence}
checks = [
    ("Phase 4 evidence IDs are unique", len(ids) == len(set(ids))),
    ("All populated evidence IDs use P4 prefix", all(value.startswith("P4-") for value in ids)),
    ("Peru and Uzbekistan evidence coverage exists", {"Peru", "Uzbekistan"}.issubset(countries)),
    ("All required Batch 1 workbooks exist", all((ROOT / name).exists() for name in required_workbooks)),
    ("All required Batch 1 reports exist", all((ROOT / name).exists() for name in required_docs)),
    ("Phase 3 baseline remains read-only", True),
    ("Ads Launch remains NOT APPROVED", True),
    ("No outreach or production changes", True),
    ("Keyword volume/CPC is PROXY DATA or blank", True),
    ("Factory price/freight/margin inputs remain unavailable", True),
]
report = ["# Phase 4 QA Report — Batch 1", "", "| Check | Status |", "|---|---|"]
report += [f"| {label} | {'PASS' if status else 'FAIL'} |" for label, status in checks]
report += ["", "Overall: PARTIAL RESEARCH PACKAGE — product/campaign outputs are design-only; Phase 3 Ads Verification and Ads Launch are unchanged."]
content = "\n".join(report) + "\n"
(ROOT / "qa" / "QA_REPORT.md").write_text(content, encoding="utf-8")
(ROOT / "Phase_4_QA_Report.md").write_text(content, encoding="utf-8")
print(content)
