#!/usr/bin/env python3
"""Build the complete Phase 4 v6 delivery from frozen sources plus Colombia SSOT."""
from __future__ import annotations

import csv
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
P4 = ROOT / "research" / "phase-4"
SRC = P4 / "data" / "phase4_v6_source"
OUT = P4 / "deliveries" / "2026-07-16_phase-4-v6-final"
BUILD = P4 / "data" / "phase4_v6_build.json"
COUNTRIES = ["Peru", "Uzbekistan", "Ecuador", "Tanzania", "Russia", "Colombia"]
FROZEN = {
    "research/phase-4/data/phase4_batch11_product_matrix.csv": "4d2913523fc6dd412247b4fc45377bb2775e5a88fa31b5d5e466377198d67423",
    "research/phase-4/data/phase4_batch11_keywords.csv": "cc64c21e903e66874b74c06eab0a2b68e7d968e6c959f408b48aefbdcecb0d80",
    "research/phase-4/data/phase4_batch11_competitors.csv": "1e88626ea8711ce8caa0548e4bc06be1eddcce8c37181c170ec6f94e2944f633",
    "research/phase-4/data/phase4_batch11_evidence_log.csv": "5abd7b59dd16f1b6f6306ae6c3ce2ef3bc3a587b0075ea9632ef71c7c70176de",
    "research/phase-4/batch-2/data/phase4_batch2_matrix.csv": "017b931da738a0a234eaeb359a7c4b8028c2b9dc7a764b5870bcb2b9e76aaea6",
    "research/phase-4/batch-2/data/phase4_batch2_keywords.csv": "a70a9523449e979da3002407f71dc061cb4d03e1918bb1fd2629378902590bd9",
    "research/phase-4/batch-2/data/phase4_batch2_competitors.csv": "0da1145f056fe7910708dd4fca15ad5c55a7ed01fa7029fa8c7d7761c171afcb",
    "research/phase-4/batch-2/data/phase4_batch2_evidence_log.csv": "b3d166ea93815b65868ce15b1bab530e279c0112185ae3da443a1a2199cca60c",
    "research/phase-4/batch-3/data/russia_matrix.csv": "884b03dda5f7c79c7c30d50fee5816e2ccb5e8786f1e4d92cadb173dd3f00267",
    "research/phase-4/batch-3/data/russia_evidence.csv": "d1454df5f639505499a82facf929e870b200c86d6929d2ed522122a569897d09",
}


def rows(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify_frozen() -> None:
    bad = [name for name, digest in FROZEN.items() if sha(ROOT / name) != digest]
    if bad:
        raise SystemExit("Frozen source checksum mismatch: " + ", ".join(bad))


def matrix_rows() -> list[dict]:
    out = []
    for path in [P4 / "data/phase4_batch11_product_matrix.csv", P4 / "batch-2/data/phase4_batch2_matrix.csv", P4 / "batch-3/data/russia_matrix.csv"]:
        for r in rows(path):
            scores = [int(r[k]) for k in ["Platform", "Engine demand", "Channel", "Search", "Profit", "Supply"]]
            out.append({
                "Country": r["Country"], "Product": r["Product"], "scores": scores,
                "Demand type": r.get("Demand type", "Engine"), "Evidence IDs": r.get("Evidence IDs", "No product-specific evidence"),
                "Rationale": r.get("Rationale", "Frozen baseline; see batch evidence log."),
                "Market confidence": r.get("Market confidence", "Low"), "Engine confidence": r.get("Engine confidence", "Low"),
                "Compatibility confidence": r.get("Compatibility confidence", "Low"), "Application": r.get("Application", "Frozen baseline"),
                "Launch eligibility": r.get("Launch eligibility", "VALIDATE FIT")
            })
    for r in rows(SRC / "colombia_products.csv"):
        out.append({
            "Country": r["Country"], "Product": r["Product"],
            "scores": [int(r[k]) for k in ["Platform", "Engine demand", "Channel", "Search", "Profit", "Supply"]],
            **{k: r[k] for k in ["Demand type", "Evidence IDs", "Rationale", "Market confidence", "Engine confidence", "Compatibility confidence", "Application", "Launch eligibility"]}
        })
    return out


def keyword_rows() -> list[dict]:
    out = []
    for r in rows(P4 / "data/phase4_batch11_keywords.csv"):
        out.append({"Country": r["Country"], "Language": r["Language"], "Keyword": r["Keyword"], "Chinese meaning": r["Chinese meaning"], "Product": r["Product"], "Intent": r["Intent"], "Demand level": r["Estimated demand level"], "Search source": "PROXY DATA", "Status": r["Research status"], "Ad group": r["Ad group"], "Landing page": r["Proposed landing URL"], "Ads Launch": "NOT APPROVED", "Evidence IDs": r["Evidence IDs"]})
    for r in rows(P4 / "batch-2/data/phase4_batch2_keywords.csv"):
        out.append({"Country": r["Country"], "Language": r["Language"], "Keyword": r["Keyword"], "Chinese meaning": r["Chinese meaning"], "Product": r["Product"], "Intent": r["Intent"], "Demand level": r["Estimated demand level"], "Search source": "PROXY DATA", "Status": r["Keyword status"], "Ad group": r["Ad group"], "Landing page": r["Landing page"], "Ads Launch": "NOT APPROVED", "Evidence IDs": r["Evidence IDs"]})
    ru_seeds = [
        ("двигатель YX 140 1P56FMJ", "YX140/1P56FMJ发动机", "Lower-mounted horizontal 140", "P4-RU-01,P4-RU-02"),
        ("двигатель 140 кубов питбайк", "140cc越野摩托发动机", "Honda-style horizontal 140", "P4-RU-01,P4-RU-03"),
        ("двигатель 152FMI Альфа Дельта", "152FMI Alpha/Delta发动机", "Honda-style horizontal 125", "P4-RU-04,P4-RU-05"),
        ("двигатель 139FMB 110", "139FMB 110发动机", "Honda-style horizontal 110", "P4-RU-05,P4-RU-06"),
        ("запчасти двигателя Альфа", "Alpha发动机零件", "Engine parts / spares pack", "P4-RU-06"),
        ("поставщик двигателей питбайк", "越野摩托发动机供应商", "Lower-mounted horizontal 140", "P4-RU-01,P4-RU-02")]
    mods = ["", " купить", " оптом", " поставщик", " дилер", " Россия", " каталог", " для питбайка", " цена", " импорт"]
    for seed, zh, product, ev in ru_seeds:
        for i, mod in enumerate(mods):
            out.append({"Country":"Russia","Language":"Russian","Keyword":seed+mod,"Chinese meaning":zh,"Product":product,"Intent":"B2B/research","Demand level":"Medium" if i < 5 else "Low","Search source":"PROXY DATA","Status":"Retained" if i < 5 else "Research only","Ad group":"RU | Engine Research | Yandex","Landing page":"/ru/russia/","Ads Launch":"NOT APPROVED","Evidence IDs":ev})
    manifest = json.loads((SRC / "phase4_v6_manifest.json").read_text(encoding="utf-8"))
    mods = manifest["keyword_expansion_modifiers"]
    for r in rows(SRC / "colombia_keywords.csv"):
        for i, mod in enumerate(mods):
            status = r["Status rule"] if i < 7 else "Raw candidate"
            out.append({"Country":"Colombia","Language":"Spanish","Keyword":r["Seed"]+mod,"Chinese meaning":r["Chinese meaning"],"Product":r["Product"],"Intent":r["Intent"],"Demand level":r["Demand level"],"Search source":"PROXY DATA","Status":status,"Ad group":r["Ad group"],"Landing page":r["Landing page"],"Ads Launch":"NOT APPROVED","Evidence IDs":r["Evidence IDs"]})
    return out


def evidence_rows() -> list[dict]:
    output = []
    specs = [
        (P4 / "data/phase4_evidence_log.csv", {"Product scope":"Used in output", "Evidence type":"Evidence type", "Claim":"Claim", "URL":"URL", "Publisher":"Publisher", "Reliability":"Reliability", "Limitations":"Limitations", "Score use":"Used in output"}),
        (P4 / "batch-2/data/phase4_batch2_evidence_log.csv", {"Product scope":"Product scope", "Evidence type":"Evidence type", "Claim":"Claim supported", "URL":"URL", "Publisher":"Publisher", "Reliability":"Reliability", "Limitations":"Limitations", "Score use":"Used in score component"}),
        (P4 / "batch-3/data/russia_evidence.csv", {"Product scope":"Product", "Evidence type":"Evidence type", "Claim":"Claim", "URL":"URL", "Publisher":"Publisher", "Reliability":"Reliability", "Limitations":"Limitations", "Score use":"Score use"}),
        (SRC / "colombia_evidence.csv", {"Product scope":"Product scope", "Evidence type":"Evidence type", "Claim":"Claim", "URL":"URL", "Publisher":"Publisher", "Reliability":"Reliability", "Limitations":"Limitations", "Score use":"Score use"}),]
    for path, mapping in specs:
        for r in rows(path):
            output.append({"Evidence ID":r["Evidence ID"],"Country":r["Country"],**{k:r.get(v,"") for k,v in mapping.items()},"Access date":r.get("Access date","2026-07-16")})
    return output


def write_docs(data: dict) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    top = data["ranking"]
    top_lines = "\n".join(
        f"- {c}: " + ", ".join(
            f'{x["Product"]} ({x["Total"]}/{x["Tier"]}' + (", zero-score placeholder" if x["Total"] == 0 else "") + ")"
            for x in top if x["Country"] == c
        ) for c in COUNTRIES
    )
    conclusion = "Complete-engine demand is not verified from the available public evidence."
    required = "No independently verified complete-engine demand was found after bounded research.\n\nThis does not prove that no demand exists; it means the available public evidence is insufficient."
    (OUT / "Phase_4_Executive_Summary_v6.md").write_text(f"# Phase 4 v6 Executive Summary\n\nSix-country research closeout. Ads Launch remains **NOT APPROVED**.\n\n## Country Top 3 engine directions\n\n{top_lines}\n\n## Colombia\n\n{conclusion}\n\n{required}\n\nPrimary route: **SEO / distributor development**. Paid complete-engine search: **Not recommended**.\n", encoding="utf-8")
    (OUT / "Phase_4_Data_Gaps_v6.md").write_text("# Phase 4 v6 Data Gaps\n\n- Factory specifications and exact interface compatibility: INPUT REQUIRED.\n- Native-language review: INPUT REQUIRED.\n- Keyword Planner / Wordstat search data and CPC: INPUT REQUIRED.\n- Buyer validation: INPUT REQUIRED; no buyers contacted.\n- Factory price, freight, landed cost and margin: INPUT REQUIRED.\n- Colombia complete-engine demand: NOT VERIFIED from available public evidence.\n- Production tracking and ad account readiness: NOT TESTED.\n", encoding="utf-8")
    (OUT / "Colombia_README.md").write_text(f"# Colombia — evidence-limited closeout\n\n{conclusion}\n\n{required}\n\n## Route\n\n- First channel: SEO / distributor development.\n- Aftermarket: parts / platform qualification.\n- Paid complete-engine search: Not recommended.\n- Ads Launch: NOT APPROVED.\n\nTop 3 engine directions are relative research priorities, not verified demand: CG125 air-cooled, CG150 air-cooled, CG200 air-cooled. Aftermarket offer: engine parts / spares pack.\n", encoding="utf-8")
    (OUT / "Phase_4_Codex_Implementation_Instructions_v6.md").write_text("# Phase 4 v6 Implementation Instructions\n\nThis is a research design package, not launch authorization. Keep all campaigns DESIGN ONLY / NOT RECOMMENDED and Ads Launch NOT APPROVED. Before Phase 5, obtain factory specifications, model-level compatibility, native-language review, real search data, buyer validation, landed-cost inputs and production tracking approval. Do not modify production pages from this package.\n", encoding="utf-8")
    (OUT / "Phase_4_Final_Handoff.md").write_text("# Phase 4 v6 Final Handoff\n\nScope: Peru, Uzbekistan, Ecuador, Tanzania, Russia and Colombia. Colombia is closed as evidence-limited; absence of positive proof did not block delivery. The folder contains only the 15 newly generated v6 deliverables. Frozen first-five-country sources were checksum-verified before generation.\n\nNo ads launched.\nNo buyers contacted.\nNo production inquiries submitted.\nNo production website changes.\nAds Launch remains NOT APPROVED.\n", encoding="utf-8")
    fields = ["Evidence ID","Country","Product scope","Evidence type","Claim","URL","Publisher","Access date","Reliability","Limitations","Score use"]
    with (OUT / "phase4_evidence_log.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(data["evidence"])


def main() -> None:
    verify_frozen()
    matrix = matrix_rows()
    ranking = []
    for country in COUNTRIES:
        candidates = [r for r in matrix if r["Country"] == country and r["Demand type"].lower().startswith("engine")]
        candidates.sort(key=lambda r: sum(r["scores"]), reverse=True)
        for rank, r in enumerate(candidates[:3], 1):
            ranking.append({"Country":country,"Rank":rank,"Product":r["Product"],"Total":sum(r["scores"]),"Tier":"S" if sum(r["scores"])>=75 else "A" if sum(r["scores"])>=60 else "B" if sum(r["scores"])>=45 else "C" if sum(r["scores"])>=30 else "D","Evidence IDs":r["Evidence IDs"],"Market confidence":r["Market confidence"],"Engine confidence":r["Engine confidence"],"Compatibility confidence":r["Compatibility confidence"]})
    data = {"countries":COUNTRIES,"matrix":matrix,"ranking":ranking,"keywords":keyword_rows(),"evidence":evidence_rows(),"colombia_negatives":rows(SRC/"colombia_negatives.csv"),"colombia_competitors":rows(SRC/"colombia_competitors.csv"),"colombia_campaigns":rows(SRC/"colombia_campaigns.csv"),"colombia_landing":rows(SRC/"colombia_landing_page.csv"),"frozen_checksums":FROZEN}
    BUILD.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    write_docs(data)
    node = Path(os.environ.get("CODEX_NODE_PATH", str(Path.home()/".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe")))
    subprocess.run([str(node), str(P4/"scripts/build_phase4_v6_workbooks.mjs")], cwd=ROOT, check=True)
    subprocess.run([sys.executable, str(P4/"qa/phase4_v6_qa.py")], cwd=ROOT, check=True)


if __name__ == "__main__":
    main()
