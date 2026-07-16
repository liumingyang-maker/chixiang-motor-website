import csv, subprocess, sys, zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
DATA=ROOT/'research/phase-4/batch-2/data'
OUT=ROOT/'research/phase-4/deliveries/2026-07-16_phase-4-batch-2-ecuador-tanzania'
BASE='373971c2ebbf202f78e9f9f76af97eb58a2a6529'
COUNTRIES=('Ecuador','Tanzania')
INDIAN=('Bajaj','TVS','Hero','Boxer','Piaggio','Mahindra','Royal Enfield')

def rows(name):
    with (DATA/name).open(encoding='utf-8-sig', newline='') as f: return list(csv.DictReader(f))
def check(label, value):
    print(f"{'PASS' if value else 'FAIL'} | {label}")
    return value
def refs(records):
    return {v.strip() for r in records for v in r.get('Evidence IDs','').split(',') if v.strip() and v.strip()!='No product-specific evidence'}
def xlsx_text(name):
    with zipfile.ZipFile(OUT/name) as archive:
        return ''.join(archive.read(n).decode('utf-8','replace') for n in archive.namelist() if n.endswith('.xml'))

def main():
    result=[]
    required=['Phase_4_Country_Product_Demand_Ranking_v4.xlsx','Phase_4_Product_Country_Matrix_v4.xlsx','Phase_4_Competitor_Product_Map_v4.xlsx','Phase_4_Keyword_Master_v4.xlsx','Phase_4_Negative_Keywords_v4.xlsx','Phase_4_Campaign_Architecture_v4.xlsx','Phase_4_Landing_Page_Roadmap_v4.xlsx','Phase_4_Budget_Models_v4.xlsx','Phase_4_Executive_Summary_v4.md','Phase_4_Data_Gaps_v4.md','Phase_4_QA_Report_v4.md','Phase_4_Batch_2_Handoff.md','phase4_batch2_evidence_log.csv','Ecuador_README.md','Tanzania_README.md']
    result.append(check('01 Required deliverables exist', all((OUT/p).is_file() for p in required)))
    m=rows('phase4_batch2_matrix.csv'); k=rows('phase4_batch2_keywords.csv'); n=rows('phase4_batch2_negatives.csv'); c=rows('phase4_batch2_competitors.csv'); e=rows('phase4_batch2_evidence_log.csv')
    result.append(check('02 Total equals six components', all(sum(int(r[x]) for x in ['Platform','Engine demand','Channel','Search','Profit','Supply'])==int(r['Total']) for r in m)))
    result.append(check('03 Top 3 only engines', all(len(sorted([r for r in m if r['Country']==country and r['Demand type']=='Engine'], key=lambda r:int(r['Total']), reverse=True)[:3])==3 and all('parts' not in r['Product'].lower() for r in sorted([r for r in m if r['Country']==country and r['Demand type']=='Engine'], key=lambda r:int(r['Total']), reverse=True)[:3]) for country in COUNTRIES)))
    result.append(check('04 Aftermarket separated', all(any(r['Country']==country and r['Demand type']=='Aftermarket / parts' for r in m) for country in COUNTRIES)))
    evidence={r['Evidence ID'] for r in e}; all_records=m+k+c
    result.append(check('05 All Evidence IDs exist', refs(all_records)<=evidence))
    result.append(check('06 No cross-country Evidence ID contamination', all(not(r['Country']=='Ecuador' and 'P4-TZ-' in r.get('Evidence IDs','')) and not(r['Country']=='Tanzania' and 'P4-EC-' in r.get('Evidence IDs','')) for r in all_records)))
    result.append(check('07 Evidence limitations respected', all(int(r['Engine demand'])==0 for r in m if 'parts' in r['Product'].lower() or 'No product-specific evidence' in r['Evidence IDs'])))
    result.append(check('08 Unsupported commercial scores are zero', all(int(r['Profit'])==0 and int(r['Supply'])==0 for r in m)))
    result.append(check('09 Three confidence fields present', all(r['Market confidence'] and r['Engine confidence'] and r['Compatibility confidence'] for r in m)))
    result.append(check('10 Keyword/product/ad group/landing consistency', all(r['Product'] and r['Ad group'] and r['Landing page'] and ((r['Country']=='Ecuador' and r['Landing page']=='/es/ecuador/') or (r['Country']=='Tanzania' and r['Landing page']=='/en/tanzania/')) for r in k)))
    result.append(check('11 Chinese meanings are separated from proxy data', all(r['Chinese meaning']!='PROXY DATA' and r['Search-volume source']=='PROXY DATA' for r in k)))
    result.append(check('12 Local negative keywords exist', all(sum(r['Country']==country for r in n)>=30 for country in COUNTRIES)))
    result.append(check('13 Tanzania Indian platforms isolated and Swahili is review-gated', all(any(r['Country']=='Tanzania' and r['Keyword']==term and r['Level']=='Ad group' for r in n) for term in INDIAN) and any(r['Country']=='Tanzania' and r['Language']=='Swahili' and r['Confidence']=='Native review required' for r in k)))
    result.append(check('14 Ecuador keywords are not Peru copies', all('peru' not in r['Keyword'].lower() and 'uzbek' not in r['Keyword'].lower() for r in k if r['Country']=='Ecuador')))
    result.append(check('15 No invented search volume, CPC or profit', all(r['CPC/range']=='' for r in k) and all(int(r['Profit'])==0 for r in m)))
    campaign_text=xlsx_text('Phase_4_Campaign_Architecture_v4.xlsx')
    result.append(check('16 Campaigns remain DESIGN ONLY', 'DESIGN ONLY' in campaign_text))
    result.append(check('17 Ads Launch remains NOT APPROVED', 'NOT APPROVED' in campaign_text and all(r['Ads Launch']=='NOT APPROVED' for r in k)))
    changed=subprocess.run(['git','diff','--name-only',BASE],cwd=ROOT,capture_output=True,text=True,check=True).stdout.splitlines()
    result.append(check('18 Phase 3 unchanged', all(not p.startswith('research/phase-3/') for p in changed)))
    result.append(check('19 Peru/Uzbekistan Batch 1.1 unchanged', all('batch-1-1' not in p and '2026-07-16_phase-4-batch-1-1' not in p for p in changed)))
    result.append(check('20 Workbooks contain no formula error tokens', all(not any(token in xlsx_text(name) for token in ('#REF!','#DIV/0!','#VALUE!','#NAME?','#N/A')) for name in required if name.endswith('.xlsx'))))
    result.append(check('21 Cross-table evidence semantics align', refs(all_records)<=evidence and all(r['Record type']!='Marketplace/channel' or 'Marketplace' not in r['Entity'] for r in c)))
    result.append(check('22 Score/evidence/keyword/campaign/page semantic status', all(r['Evidence IDs']!='No product-specific evidence' or int(r['Total'])==0 for r in m) and 'No compatibility or replacement claim' in xlsx_text('Phase_4_Landing_Page_Roadmap_v4.xlsx')))
    return 0 if all(result) else 1

if __name__=='__main__': sys.exit(main())
