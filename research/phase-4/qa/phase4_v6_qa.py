#!/usr/bin/env python3
"""Deterministic QA gate for the six-country Phase 4 v6 delivery."""
from __future__ import annotations

import csv
import json
import re
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
P4 = ROOT / "research/phase-4"
OUT = P4 / "deliveries/2026-07-16_phase-4-v6-final"
DATA = json.loads((P4 / "data/phase4_v6_build.json").read_text(encoding="utf-8"))
SRC = P4 / "data/phase4_v6_source"
COUNTRIES = {"Peru","Uzbekistan","Ecuador","Tanzania","Russia","Colombia"}
EXPECTED = {
"Phase_4_Final_Handoff.md","Phase_4_Country_Product_Demand_Ranking_v6.xlsx","Phase_4_Product_Country_Matrix_v6.xlsx","Phase_4_Competitor_Product_Map_v6.xlsx","Phase_4_Keyword_Master_v6.xlsx","Phase_4_Negative_Keywords_v6.xlsx","Phase_4_Campaign_Architecture_v6.xlsx","Phase_4_Landing_Page_Roadmap_v6.xlsx","Phase_4_Budget_Models_v6.xlsx","Phase_4_Executive_Summary_v6.md","Phase_4_Data_Gaps_v6.md","Phase_4_QA_Report_v6.md","phase4_evidence_log.csv","Colombia_README.md","Phase_4_Codex_Implementation_Instructions_v6.md"}
checks=[]
def check(name, ok, detail): checks.append((name, bool(ok), detail))
def csvrows(path):
    with path.open(encoding="utf-8-sig",newline="") as f:return list(csv.DictReader(f))
def xtext(path):
    with zipfile.ZipFile(path) as z:return "\n".join(z.read(n).decode("utf-8",errors="ignore") for n in z.namelist() if n.endswith(".xml"))

matrix=DATA["matrix"]; kws=DATA["keywords"]; ev=DATA["evidence"]
co=[r for r in matrix if r["Country"]=="Colombia"]
co_kw=[r for r in kws if r["Country"]=="Colombia"]
co_neg=csvrows(SRC/"colombia_negatives.csv")
co_ev=csvrows(SRC/"colombia_evidence.csv")
eids={r["Evidence ID"] for r in ev}

check("01 six countries in matrix",{r["Country"] for r in matrix}==COUNTRIES,", ".join(sorted({r["Country"] for r in matrix})))
check("02 six countries in ranking",{r["Country"] for r in DATA["ranking"]}==COUNTRIES,"six present")
check("03 three engine ranks per country",all(sum(1 for r in DATA["ranking"] if r["Country"]==c)==3 for c in COUNTRIES),"18 rows")
check("04 top 3 excludes parts",all("parts" not in r["Product"].lower() for r in DATA["ranking"]),"engine-only")
check("05 Colombia source products present",len(co)>=13,f"{len(co)} rows")
check("06 Colombia engine demand capped",all(r["scores"][1]<=2 for r in co),"0-2 only")
check("07 Colombia profit zero",all(r["scores"][4]==0 for r in co),"all zero")
check("08 Colombia supply zero",all(r["scores"][5]==0 for r in co),"all zero")
check("09 Colombia compatibility low/input",all(r["Compatibility confidence"] in {"Low","Not applicable","Part-number-specific"} for r in co),"bounded")
check("10 Colombia aftermarket separate",any(r["Demand type"].startswith("Aftermarket") for r in co),"separate row")
check("11 Colombia top 3 expected",[r["Product"] for r in DATA["ranking"] if r["Country"]=="Colombia"]==["CG125 air-cooled","CG150 air-cooled","CG200 air-cooled"],"relative directions")
check("12 total arithmetic",all(sum(r["scores"])>=0 and len(r["scores"])==6 for r in matrix),"six components")
check("13 score component bounds",all(0<=r["scores"][0]<=30 and 0<=r["scores"][1]<=20 and all(0<=x<=15 for x in r["scores"][2:4]) and all(0<=x<=10 for x in r["scores"][4:]) for r in matrix),"valid bounds")
check("14 Colombia raw candidates",len(co_kw)>=120,f"{len(co_kw)}")
check("15 Colombia retained/research 50-100",50<=sum(r["Status"] in {"Retained","Research only"} for r in co_kw)<=100,str(sum(r["Status"] in {"Retained","Research only"} for r in co_kw)))
check("16 Colombia negatives >=40",len(co_neg)>=40,str(len(co_neg)))
check("17 Colombia keyword language",all(r["Language"]=="Spanish" for r in co_kw),"Spanish")
check("18 proxy demand labels",all(r["Demand level"] in {"High","Medium","Low","Unknown"} for r in kws),"categorical")
check("19 proxy search source",all(r["Search source"]=="PROXY DATA" for r in kws),"no tool metrics")
check("20 no numeric CPC fields",all("CPC" not in r or not r.get("CPC") for r in kws),"blank/not modeled")
check("21 all keyword ads unapproved",all(r["Ads Launch"]=="NOT APPROVED" for r in kws),"all countries")
check("22 Colombia complete-engine terms research",all(r["Status"] in {"Research only","Raw candidate"} for r in co_kw if "Complete-engine" in r["Intent"]),"not commercial retained")
check("23 parts map to aftermarket",all("parts" in r["Product"].lower() for r in co_kw if "repuestos" in r["Keyword"].lower() and "AKT" not in r["Keyword"]),"parts mapping")
check("24 Colombia evidence count",len(co_ev)==15,str(len(co_ev)))
check("25 Colombia evidence IDs unique",len({r["Evidence ID"] for r in co_ev})==len(co_ev),"unique")
check("26 all referenced evidence IDs exist",all(x in eids for r in matrix for x in r["Evidence IDs"].split(",") if x.startswith("P4-")),"matrix references")
check("27 no cross-country evidence contamination",all(all(x.startswith({"Peru":"P4-PE-","Uzbekistan":"P4-UZ-","Ecuador":"P4-EC-","Tanzania":"P4-TZ-","Russia":"P4-RU-","Colombia":"P4-CO-"}[r["Country"]]) for x in r["Evidence IDs"].split(",") if x.startswith("P4-")) for r in matrix),"country prefixes")
check("28 parts not scored as engine demand in Colombia",all(r["scores"][1]==0 for r in co if r["Demand type"].startswith("Aftermarket")),"zero engine demand")
check("29 marketplace not national proof",all("national demand" in r["Limitations"] or "Parts" in r["Evidence type"] or r["Evidence ID"]!="P4-CO-08" for r in co_ev),"P4-CO-08 limited")
campaigns=csvrows(SRC/"colombia_campaigns.csv")
check("30 Colombia four allowed campaigns",len(campaigns)==4,"four rows")
check("31 no Colombia paid approval",all(r["Campaign status"] in {"DESIGN ONLY","NOT RECOMMENDED"} and r["Ads Launch"]=="NOT APPROVED" for r in campaigns),"no approval")
check("32 SEO distributor route present",any(r["Campaign"]=="CO | Parts / Distributor | SEO" for r in campaigns),"present")
check("33 landing URL correct",all(r["Landing page"]=="/es/colombia/" for r in campaigns),"/es/colombia/")
landing=csvrows(SRC/"colombia_landing_page.csv")[0]
check("34 landing compatibility disclaimer",all(x in landing["Compatibility disclaimer"] for x in ["AKT","Bajaj","TVS","Hero"]),"brands named without promise")
check("35 landing technical intake",all(x in landing["WhatsApp prefill"] for x in ["foto","código","cantidad"]),"qualification fields")
required="No independently verified complete-engine demand was found after bounded research."
required2="This does not prove that no demand exists; it means the available public evidence is insufficient."
summary=(OUT/"Phase_4_Executive_Summary_v6.md").read_text(encoding="utf-8")
coread=(OUT/"Colombia_README.md").read_text(encoding="utf-8")
check("36 required Colombia statement",required in summary and required in coread,"present twice")
check("37 insufficiency caveat",required2 in summary and required2 in coread,"present twice")
check("38 Ads Launch statement",all("NOT APPROVED" in (OUT/n).read_text(encoding="utf-8") for n in ["Phase_4_Executive_Summary_v6.md","Phase_4_Final_Handoff.md","Colombia_README.md"]),"consistent")
check("39 eight workbooks exist",len(list(OUT.glob("*.xlsx")))==8,str(len(list(OUT.glob("*.xlsx")))))
for i,path in enumerate(sorted(OUT.glob("*.xlsx")),40):
    text=xtext(path); check(f"{i:02d} {path.name} no formula errors",not any(e in text for e in ["#REF!","#DIV/0!","#VALUE!","#NAME?","#N/A"]),"clean XML")
check("48 formula workbook contains SUM",'SUM(' in xtext(OUT/"Phase_4_Product_Country_Matrix_v6.xlsx"),"formula present")
check("49 output evidence log exists",(OUT/"phase4_evidence_log.csv").exists(),"present")
check("50 evidence log contains six countries",{r["Country"] for r in csvrows(OUT/"phase4_evidence_log.csv")}==COUNTRIES,"six countries")
check("51 no invented metric labels",not re.search(r"search volume\s*[:=]\s*\d|CPC\s*[:=]\s*\d|market share\s*[:=]\s*\d",summary,re.I),"none")
check("52 frozen checksums verified by builder",len(DATA["frozen_checksums"])==10,"10 files")
diff=subprocess.run(["git","diff","--name-only","0a66be29a585f966f8842a23226cc85886e76a09"],cwd=ROOT,text=True,capture_output=True,check=True).stdout.splitlines()
check("53 Phase 3 untouched",not any(x.startswith("research/phase-3/") for x in diff),"no Phase 3 diff")
check("54 production site untouched",not any(not x.startswith("research/phase-4/") for x in diff),"Phase 4 only")
check("55 main not checked out",subprocess.run(["git","branch","--show-current"],cwd=ROOT,text=True,capture_output=True,check=True).stdout.strip()=="research/phase-4-batch-4-colombia","correct branch")
check("56 no production actions",all(x in (OUT/"Phase_4_Final_Handoff.md").read_text(encoding="utf-8") for x in ["No ads launched.","No buyers contacted.","No production inquiries submitted.","No production website changes."]),"explicit")

failed=[x for x in checks if not x[1]]
lines=["# Phase 4 v6 QA Report","",f"Result: **{'PASS' if not failed else 'FAIL'}**",f"Checks: {len(checks)}; Passed: {len(checks)-len(failed)}; Failed: {len(failed)}","","## Checks",""]
lines += [f"- {'PASS' if ok else 'FAIL'} — {name}: {detail}" for name,ok,detail in checks]
lines += ["","## Gate","","All generated files remain research/design artifacts. Ads Launch remains NOT APPROVED."]
(OUT/"Phase_4_QA_Report_v6.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
if failed: raise SystemExit("QA failed: "+", ".join(x[0] for x in failed))
print(f"PASS: {len(checks)} checks")
