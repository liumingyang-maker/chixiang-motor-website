import os, re, pathlib
cjk = re.compile(r'[一-鿿]')
# 1) remaining bad image paths on disk
bad = []
for dp, dn, fn in os.walk('images'):
    for f in fn:
        rel = os.path.join(dp, f).replace('\\', '/')
        if cjk.search(rel) or '微信图片' in rel or ' ' in rel:
            bad.append(rel)
print('REMAINING_BAD_IMAGE_PATHS', len(bad))
for b in bad:
    print('  ', b)

# 2) residual CJK image refs in text files
exts = {'.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt', '.md', '.csv'}
hits = []
pat = re.compile(r'images/[^\s"\'<>)]+')
for dp, dn, fn in os.walk('.'):
    if any(x in dp for x in ['.git', 'node_modules', '_gpt_review', '.playwright']):
        continue
    for f in fn:
        if os.path.splitext(f)[1].lower() not in exts:
            continue
        p = os.path.join(dp, f).replace('\\', '/')
        t = open(p, encoding='utf-8', errors='replace').read()
        for m in pat.finditer(t):
            s = m.group(0)
            if cjk.search(s):
                hits.append((p, s[:80]))
print('RESIDUAL_CJK_IMAGE_REFS', len(hits))
for h in hits[:30]:
    print('  ', h[0], '|', h[1])

# 3) broken refs: every images/... token in html/js must exist on disk (raw or decoded)
import urllib.parse
missing = []
token = re.compile(r'(?:\.\./)*(?:/)?images/[^\s"\'<>)]+')
for dp, dn, fn in os.walk('.'):
    if any(x in dp for x in ['.git', 'node_modules', '_gpt_review', '.playwright']):
        continue
    for f in fn:
        if os.path.splitext(f)[1].lower() not in exts:
            continue
        p = os.path.join(dp, f).replace('\\', '/')
        t = open(p, encoding='utf-8', errors='replace').read()
        for m in token.finditer(t):
            raw = m.group(0)
            # normalize to repo-relative
            rel = raw
            while rel.startswith('../'):
                rel = rel[3:]
            rel = rel.lstrip('./').lstrip('/')
            # strip query/hash
            rel = rel.split('?')[0].split('#')[0]
            if not rel.startswith('images/'):
                continue
            fp = urllib.parse.unquote(rel)
            if not os.path.exists(fp):
                missing.append((p, raw[:90], fp))
print('MISSING_IMAGE_REFS', len(missing))
for m in missing[:30]:
    print('  ', m[0], '|', m[1], '->', m[2])
