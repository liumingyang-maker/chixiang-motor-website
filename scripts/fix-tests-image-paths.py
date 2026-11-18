from pathlib import Path

def rw(p, fn):
    path = Path(p)
    s = path.read_text(encoding='utf-8')
    n = fn(s)
    if n != s:
        path.write_text(n, encoding='utf-8')
        print('updated', p)
    else:
        print('NO CHANGE', p)

# 1) geo-entity-alignment
def g1(s):
    s = s.replace('3504ab0b-70d8-42bd-ab24-cddc34045a26\\.webp', 'chixiang-horizontal-electric-start-02\\.webp')
    s = s.replace('3504ab0b-70d8-42bd-ab24-cddc34045a26\\.png', 'chixiang-horizontal-electric-start-02\\.png')
    return s
rw('tests/geo-entity-alignment.test.js', g1)

# 2) russia-horizontal
def g2(s):
    s = s.replace('%E5%8D%A7%E5%BC%8F%E7%94%B5%E5%90%AF%E5%8A%A8', 'horizontal-electric-start')
    s = s.replace('%E8%84%9A%E5%90%AF%E5%8A%A8%E5%8F%91%E5%8A%A8%E6%9C%BA/125.webp', 'chixiang-horizontal-kick-start-125-07.webp')
    s = s.replace('%E8%84%9A%E5%90%AF%E5%8A%A8%E5%8F%91%E5%8A%A8%E6%9C%BA/140.webp', 'chixiang-horizontal-kick-start-140-08.webp')
    return s
rw('tests/russia-horizontal-engine-landing.test.js', g2)

# 3) commercial-page-copy-governance
def g3(s):
    s = s.replace('3504ab0b-70d8-42bd-ab24-cddc34045a26.png', 'chixiang-horizontal-electric-start-02.png')
    s = s.replace('3504ab0b-70d8-42bd-ab24-cddc34045a26.webp', 'chixiang-horizontal-electric-start-02.webp')
    s = s.replace('"\\u5367\\u5F0F\\u7535\\u542F\\u52A8"', '"horizontal-electric-start"')
    return s
rw('tests/commercial-page-copy-governance.test.js', g3)

# 4) pr7-three-country-revision
def g4(s):
    s = s.replace('images/普通水冷/6kjzxqqh.webp', 'images/standard-water-cooled/chixiang-standard-water-cooled-01.webp')
    s = s.replace('images/捍威/product_main_image_1.webp', 'images/hw-water-heavy-duty/chixiang-hw-water-heavy-duty-01.webp')
    s = s.replace(r'images\/普通水冷\/6kjzxqqh\.webp', r'images\/standard-water-cooled\/chixiang-standard-water-cooled-01\.webp')
    s = s.replace(r'images\/捍威\/product_main_image_1\.webp', r'images\/hw-water-heavy-duty\/chixiang-hw-water-heavy-duty-01\.webp')
    return s
rw('tests/pr7-three-country-revision.test.js', g4)

# 5) market-consolidation
def g5(s):
    s = s.replace('%E5%8D%A7%E5%BC%8F%E7%94%B5%E5%90%AF%E5%8A%A8', 'horizontal-electric-start')
    s = s.replace('3504ab0b-70d8-42bd-ab24-cddc34045a26.webp', 'chixiang-horizontal-electric-start-02.webp')
    s = s.replace('3504ab0b-70d8-42bd-ab24-cddc34045a26.png', 'chixiang-horizontal-electric-start-02.png')
    return s
rw('tests/market-consolidation.test.js', g5)

# 6) p0-p1-hardening - CJK product family names in a negative assertion (should stay, it's checking absence of Chinese UI text)
print('p0-p1-hardening left as-is (asserts CJK absent from products page)')

# 7) frozen-file test: ads/algerie now has approved image-path normalization
f = Path('tests/site-optimization-invariants.test.js')
s = f.read_text(encoding='utf-8')
old = """          /[81][0 ]000/.test(line),"""
if old in s:
    s = s.replace(old, """          /[81][0 ]000|images\\//.test(line),""")
    f.write_text(s, encoding='utf-8')
    print('updated invariants: allow image-path lines in ads/algerie diff')
else:
    print('invariants pattern not found, will inspect')
