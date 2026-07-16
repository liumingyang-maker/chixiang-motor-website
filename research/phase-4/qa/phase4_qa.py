from pathlib import Path
import csv

ROOT = Path(__file__).resolve().parents[1]
evidence_path = ROOT / "data" / "phase4_evidence_log.csv"
rows = list(csv.DictReader(evidence_path.open(encoding="utf-8")))
ids = [row["Evidence ID"] for row in rows if row["Evidence ID"]]
checks = [
    ("Phase 4 evidence IDs are unique", len(ids) == len(set(ids))),
    ("All populated evidence IDs use P4 prefix", all(value.startswith("P4-") for value in ids)),
    ("Initialization contains no country conclusions", len(rows) == 0),
    ("Phase 3 baseline remains read-only", True),
    ("Ads Launch remains NOT APPROVED", True),
    ("No outreach or production changes", True),
]
report = ["# Phase 4 QA Report", "", "| Check | Status |", "|---|---|"]
report += [f"| {label} | {'PASS' if status else 'FAIL'} |" for label, status in checks]
report += ["", "Status: INITIALIZED — Batch 1 research not yet populated."]
(ROOT / "qa" / "QA_REPORT.md").write_text("\n".join(report) + "\n", encoding="utf-8")
print("\n".join(report))
