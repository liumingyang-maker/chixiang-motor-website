from xml.etree import ElementTree as ET
from pathlib import Path
import subprocess
import tempfile
import os

root = Path(__file__).resolve().parents[1]

def git_show(rev, path):
    return subprocess.check_output(['git', 'show', f'{rev}:{path}'], cwd=root)

def write_tmp(data, name):
    p = Path(tempfile.gettempdir()) / name
    p.write_bytes(data)
    return p

base_path = write_tmp(git_show('b5acee0', 'sitemap.xml'), 'chixiang-sitemap-base.xml')
head_path = write_tmp(git_show('HEAD', 'sitemap.xml'), 'chixiang-sitemap-head.xml')

def urls(path):
    raw = Path(path).read_bytes()
    if raw.startswith(b'\xef\xbb\xbf'):
        raw = raw[3:]
    text = raw.decode('utf-8')
    # normalize declaration if needed
    if 'encoding="UTF-8"' in text[:80] or "encoding='UTF-8'" in text[:80]:
        pass
    root_el = ET.fromstring(text)
    items = []
    for node in root_el.findall('{*}url'):
        loc = node.find('{*}loc')
        if loc is not None and loc.text:
            items.append(loc.text.strip())
    return items

old = urls(base_path)
new = urls(head_path)
added = sorted(set(new) - set(old))
removed = sorted(set(old) - set(new))
duplicates = sorted({u for u in new if new.count(u) > 1})
print('OLD_COUNT', len(old))
print('NEW_COUNT', len(new))
print('ADDED', len(added))
for u in added:
    print(' ', u)
print('REMOVED', len(removed), removed)
print('DUPLICATES', len(duplicates), duplicates)
assert not removed, f'Unexpected removed URLs: {removed}'
assert not duplicates, f'Duplicate URLs: {duplicates}'
assert len(added) == 18, f'Expected 18 added URLs, saw {len(added)}'
assert all(u.startswith('https://chixiangmotor.com/zh-cn/') for u in added)
print('URL_DIFF_OK')
