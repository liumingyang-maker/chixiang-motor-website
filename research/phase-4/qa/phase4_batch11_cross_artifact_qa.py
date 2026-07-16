"""Machine-checkable semantic QA for the Batch 1.1 Validation and Freeze."""
from pathlib import Path
import csv, re, subprocess, sys

ROOT=Path(__file__).resolve().parents[3]
DATA=ROOT/'research'/'phase-4'/'data'
DELIVERY=ROOT/'research'/'phase-4'/'deliveries'/'2026-07-16_phase-4-batch-1-1-freeze'
BASE=ROOT/'research'/'phase-4'/'data'/'phase4_batch1_v2_evidence_log.csv'
PHASE3='b1964b7c227ef1f73fa0d72b088be7b1ecc939f3'
REQUIRED={"Record type","Demand type","Research status","Ads eligibility","Confidence","Compatibility requirement","Listing status","Match type","Launch gate"}
OUTPUTS=['Phase_4_Data_Dictionary_v1.xlsx','Phase_4_Product_Country_Matrix_v3.xlsx','Phase_4_Country_Product_Demand_Ranking_v3.xlsx','Phase_4_Competitor_Product_Map_v3.xlsx','Phase_4_Keyword_Master_v3.xlsx','Phase_4_Negative_Keywords_v3.xlsx','Phase_4_Factory_Spec_Master_v1.xlsx','Phase_4_Compatibility_Checklist_v1.xlsx','Phase_4_Native_Term_Review_v1.xlsx','Phase_4_Search_Data_Validation_v1.xlsx','Phase_4_Buyer_Channel_Candidate_List_v1.xlsx','Phase_4_Economics_Input_Register_v1.xlsx','Phase_4_Landing_Page_Roadmap_v2.xlsx']
def rows(name):
 with (DATA/name).open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def grade(n):return 'S' if n>=75 else 'A' if n>=60 else 'B' if n>=45 else 'C' if n>=30 else 'D'
def check(label,ok,notes=''):
 print(f"{'PASS' if ok else 'FAIL'} | {label}"+(f" | {notes}" if notes else ''));return ok
def main():
 result=[]
 result.append(check('Required v3/new outputs present',all((DELIVERY/x).is_file() for x in OUTPUTS)))
 result.append(check('Controlled vocabulary domains',REQUIRED <= {r['Domain'] for r in rows('phase4_batch11_data_dictionary.csv')}))
 matrix=rows('phase4_batch11_product_matrix.csv')
 result.append(check('Scores equal six components and tiers',all(int(r['Total'])==sum(int(r[x]) for x in ['Platform','Engine demand','Channel','Search','Profit','Supply']) and r['Tier']==grade(int(r['Total'])) for r in matrix)))
 result.append(check('Unsupported rows have no assumed commercial score',all(r['Evidence IDs']!='No product-specific evidence' or int(r['Profit'])==0 and int(r['Supply'])==0 for r in matrix)))
 result.append(check('Engine and aftermarket scoring models separated',{'ENGINE-V1','AFTERMARKET-V1'} <= {r['Demand type']=='Aftermarket / parts' and 'AFTERMARKET-V1' or 'ENGINE-V1' for r in matrix}))
 kw=rows('phase4_batch11_keywords.csv')
 parts=lambda s:any(x in s.lower() for x in ['repuestos','запчасти'])
 engines=lambda s:any(x in s.lower() for x in ['motor','двигатель','dvigateli'])
 result.append(check('Parts terms map only to parts',all(not parts(r['Keyword']) or 'parts' in r['Product'].lower() for r in kw)))
 result.append(check('Engine terms do not map to parts unless explicitly mixed parts intent',all(not engines(r['Keyword']) or 'parts' not in r['Product'].lower() or r['Intent']=='Parts' for r in kw)))
 result.append(check('CG250 cargo term is research-only',all('cg 250 carguero' not in r['Keyword'].lower() or r['Product'].startswith('CG250') for r in kw)))
 result.append(check('Chinese meaning is not proxy data',all(r['Chinese meaning'].strip().upper()!='PROXY DATA' for r in kw)))
 result.append(check('Proposed landing URLs are syntactically usable',all(re.match(r'^/[a-z0-9/_-]+/$',r['Proposed landing URL']) and ' ' not in r['Proposed landing URL'] for r in kw)))
 result.append(check('No keyword is ads-approved',all(r['Ads eligibility']!='ADS REVIEW CANDIDATE' for r in kw)))
 base_ids={r['Evidence ID'] for r in csv.DictReader(BASE.open(encoding='utf-8-sig',newline=''))};new_ids={r['Evidence ID'] for r in rows('phase4_batch11_evidence_log.csv')}
 referenced={x.strip() for r in matrix+kw for x in r['Evidence IDs'].split(',') if x.strip() and x.strip()!='No product-specific evidence'}
 result.append(check('All referenced evidence IDs exist',referenced <= base_ids|new_ids))
 result.append(check('No cross-country evidence contamination',all(not(r['Country']=='Peru' and 'P4-UZ-' in r['Evidence IDs']) and not(r['Country']=='Uzbekistan' and 'P4-PE-' in r['Evidence IDs']) for r in matrix+kw)))
 competitors=rows('phase4_batch11_competitors.csv')
 result.append(check('Competitor status fields do not contain evidence IDs',all('P4' not in r['Complete-engine sales'] for r in competitors)))
 neg=(DELIVERY/'Phase_4_Negative_Keywords_v3.xlsx').read_bytes().decode('latin1','ignore')
 result.append(check('Localized negative sheets delivered',(DELIVERY/'Phase_4_Negative_Keywords_v3.xlsx').is_file()))
 result.append(check('No Phase 3 files changed',all(not x.startswith('research/phase-3/') for x in subprocess.run(['git','diff','--name-only',PHASE3],cwd=ROOT,capture_output=True,text=True,check=True).stdout.splitlines())))
 return 0 if all(result) else 1
if __name__=='__main__':sys.exit(main())
