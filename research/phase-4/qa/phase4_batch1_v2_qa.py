"""Offline structural QA for the Phase 4 Batch 1 correction package.

This audit validates deliverable structure and traceability.  It does not
turn proxy demand signals into a commercial approval or an Ads Launch decision.
"""
from __future__ import annotations

import csv
import subprocess
import sys
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
PACKAGE = ROOT / "research" / "phase-4" / "deliveries" / "2026-07-16_phase-4-batch-1-corrected"
EVIDENCE = ROOT / "research" / "phase-4" / "data" / "phase4_batch1_v2_evidence_log.csv"
BASELINE = "b1964b7c227ef1f73fa0d72b088be7b1ecc939f3"
REQUIRED = [
    "Phase_4_Country_Product_Demand_Ranking_v2.xlsx",
    "Phase_4_Product_Country_Matrix_v2.xlsx",
    "Phase_4_Competitor_Product_Map_v2.xlsx",
    "Phase_4_Keyword_Master_v2.xlsx",
    "Phase_4_Negative_Keywords_v2.xlsx",
    "Phase_4_Campaign_Architecture_v2.xlsx",
    "Phase_4_Landing_Page_Roadmap_v2.xlsx",
    "Phase_4_Budget_Models_v2.xlsx",
    "phase4_batch1_v2_evidence_log.csv",
    "Phase_4_Executive_Summary_v2.md",
    "Phase_4_Data_Gaps_v2.md",
    "Phase_4_Batch_1_Corrected_Handoff.md",
]


def strings(path: Path) -> str:
    with zipfile.ZipFile(path) as book:
        return "\n".join(book.read(name).decode("utf-8", "replace") for name in book.namelist())


def check(label: str, condition: bool, detail: str = "") -> bool:
    print(f"{'PASS' if condition else 'FAIL'} | {label}" + (f" | {detail}" if detail else ""))
    return condition


def main() -> int:
    results: list[bool] = []
    results.append(check("Required package files", all((PACKAGE / f).is_file() for f in REQUIRED)))

    with EVIDENCE.open(encoding="utf-8-sig", newline="") as f:
        evidence_rows = list(csv.DictReader(f))
    ids = [row["Evidence ID"] for row in evidence_rows]
    results.append(check("Evidence IDs are unique P4 IDs", len(ids) == len(set(ids)) and all(i.startswith("P4-") for i in ids), f"{len(ids)} IDs"))
    results.append(check("Peru/Uzbekistan evidence is country-scoped", all(i.startswith(("P4-PE-", "P4-UZ-")) for i in ids)))

    matrix = strings(PACKAGE / "Phase_4_Product_Country_Matrix_v2.xlsx")
    results.append(check("Six-component total formulas", matrix.count("<x:f>SUM(") >= 20 and "Platform / vehicle fit (0-30)" in matrix))
    results.append(check("Confidence dimensions separated", all(term in matrix for term in ["Market-direction confidence", "Complete-engine-demand confidence", "Compatibility confidence"])))
    results.append(check("No cross-country matrix evidence", "P4-UZ-" not in matrix[matrix.find("Peru"):matrix.find("Uzbekistan")] if "Peru" in matrix and "Uzbekistan" in matrix else False))

    ranking = strings(PACKAGE / "Phase_4_Country_Product_Demand_Ranking_v2.xlsx")
    results.append(check("Engine and aftermarket rankings separated", "Engine Demand Ranking" in ranking and "Aftermarket Offers" in ranking and "Engine parts / spares pack" in ranking))

    keywords = strings(PACKAGE / "Phase_4_Keyword_Master_v2.xlsx")
    results.append(check("Keyword product/ad-group/landing mappings", all(term in keywords for term in ["Product", "Ad group", "Landing page", "Chinese meaning"])))
    results.append(check("Keyword meanings are not proxy labels", "Chinese meaning" in keywords and "PROXY DATA" in keywords))
    results.append(check("Proxy demand tiers provided", all(term in keywords for term in ["High", "Medium", "Low", "PROXY DATA"])))

    negatives = strings(PACKAGE / "Phase_4_Negative_Keywords_v2.xlsx")
    results.append(check("Spanish and Russian localized negatives", all(term in negatives for term in ["gratis", "moto usada", "\u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e", "\u0431/\u0443"])))

    competitors = strings(PACKAGE / "Phase_4_Competitor_Product_Map_v2.xlsx")
    results.append(check("Competitor roles are separated", all(term in competitors for term in ["Competitor brand", "Importer", "Marketplace/channel"])))

    campaigns = strings(PACKAGE / "Phase_4_Campaign_Architecture_v2.xlsx")
    results.append(check("Campaigns remain design-only and not approved", "DESIGN ONLY" in campaigns and "NOT APPROVED" in campaigns))

    try:
        changed = subprocess.run(["git", "diff", "--name-only", BASELINE], cwd=ROOT, capture_output=True, text=True, check=True).stdout.splitlines()
        results.append(check("Phase 3 research remains untouched", all(not p.startswith("research/phase-3/") for p in changed)))
    except Exception as exc:
        results.append(check("Phase 3 research remains untouched", False, str(exc)))

    overall = all(results)
    print(f"OVERALL: {'PASS' if overall else 'FAIL'}")
    return 0 if overall else 1


if __name__ == "__main__":
    sys.exit(main())
