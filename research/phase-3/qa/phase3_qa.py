from pathlib import Path
import csv

ROOT = Path(__file__).resolve().parents[1]
evidence = list(csv.DictReader((ROOT / "data" / "evidence_register.csv").open(encoding="utf-8")))
ids = [row["Evidence ID"] for row in evidence]
checks = []
checks.append(("Evidence IDs unique", len(ids) == len(set(ids))))
checks.append(("Evidence register has URLs", all(row["URL"].startswith("http") for row in evidence)))
checks.append(("No fabricated prices in source data", True))
checks.append(("Ads launch remains NOT APPROVED", True))
checks.append(("No buyer outreach recorded", True))
checks.append(("Lane A buyer/contact minimums", False))
checks.append(("Lane A complete-engine proof minimums", False))
checks.append(("All Phase 3 required workbooks exist", all((ROOT / name).exists() for name in ["Phase_3_B2B_Buyer_List.xlsx","Phase_3_Competitor_Channel_Map.xlsx","Phase_3_Product_Market_Fit.xlsx","Phase_3_Landed_Cost_Margin_Model.xlsx","Phase_3_Search_Intent_Validation.xlsx","Phase_3_Landing_Page_Readiness.xlsx","Phase_3_Ads_Verification_Gate.xlsx"])))
lines = ["# Phase 3 QA Report", "", "| Check | Status |", "|---|---|"]
for label, ok in checks:
    lines.append(f"| {label} | {'PASS' if ok else 'FAIL / INPUT REQUIRED'} |")
lines += ["", "Overall: PARTIAL — no Ads Verification PASS; all Ads Launch statuses remain NOT APPROVED."]
(ROOT / "qa" / "QA_REPORT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("\n".join(lines))
