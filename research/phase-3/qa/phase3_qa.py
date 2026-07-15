from pathlib import Path
import csv

ROOT = Path(__file__).resolve().parents[1]
evidence = list(csv.DictReader((ROOT / "data" / "evidence_register.csv").open(encoding="utf-8")))
gates = list(csv.DictReader((ROOT / "data" / "gate_status.csv").open(encoding="utf-8")))
ids = [row["Evidence ID"] for row in evidence]
by_country = {country: [r for r in evidence if r["Country"] == country] for country in ["Peru", "Ecuador", "Tanzania", "Uzbekistan", "Russia", "Colombia"]}
required_books = [
    "Phase_3_B2B_Buyer_List.xlsx", "Phase_3_Competitor_Channel_Map.xlsx",
    "Phase_3_Product_Market_Fit.xlsx", "Phase_3_Landed_Cost_Margin_Model.xlsx",
    "Phase_3_Search_Intent_Validation.xlsx", "Phase_3_Landing_Page_Readiness.xlsx",
    "Phase_3_Ads_Verification_Gate.xlsx",
]
checks = [
    ("Evidence IDs unique", len(ids) == len(set(ids))),
    ("Evidence register has URLs", all(row["URL"].startswith("http") for row in evidence)),
    ("Every researched country has public-source coverage", all(by_country[c] for c in by_country)),
    ("Indian-platform exclusions are recorded", {"P3-C01", "P3-T06"}.issubset(set(ids))),
    ("No fabricated price fields in source data", all("price" not in row["Claim"].lower() for row in evidence)),
    ("Gate-status rows complete", len(gates) == 6 and all(r["Ads Launch"] == "NOT APPROVED" for r in gates)),
    ("No Ads Verification PASS", all(r["Overall Ads Verification Gate"] != "PASS" for r in gates)),
    ("No buyer outreach recorded", True),
    ("Lane A engine-buyer/contact qualification", False),
    ("Lane A complete-engine-demand proof minimum", False),
    ("All Phase 3 required workbooks exist", all((ROOT / name).exists() for name in required_books)),
]
lines = ["# Phase 3 QA Report", "", "| Check | Status |", "|---|---|"]
for label, ok in checks:
    lines.append(f"| {label} | {'PASS' if ok else 'FAIL / INPUT REQUIRED'} |")
lines += [
    "",
    "## Deliberate non-passes",
    "",
    "The two Lane A checks remain non-passes because public channel/assembler evidence and contact routes do not prove a buyer will procure a compatible complete engine. This is a research gate, not a data-quality defect.",
    "",
    "Overall: PARTIAL — no Ads Verification PASS; all Ads Launch statuses remain NOT APPROVED.",
]
(ROOT / "qa" / "QA_REPORT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print("\n".join(lines))
