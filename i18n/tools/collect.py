import json, os, re, sys, collections
sys.path.insert(0, os.path.dirname(__file__))
from segs import units, key_of
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
def src_of(rel):
    o = os.path.join(ROOT, 'overrides', rel)
    return open(o if os.path.isfile(o) else os.path.join(ROOT, rel), encoding='utf-8').read()
pages = [l.strip() for l in open(os.path.join(os.path.dirname(__file__), 'pages.txt')) if l.strip()]
cnt = collections.Counter(); where = collections.defaultdict(list)
def add(rel, us):
    for u in us:
        k = key_of(u)
        if not re.search('[A-Za-z]', re.sub(r'</?\d+/?>', '', k)): continue
        cnt[k] += 1
        if rel not in where[k]: where[k].append(rel)
for rel in pages:
    add(rel, units(src_of(rel), skip_header=False))
keys = list(cnt)
json.dump({'keys': keys, 'where': where}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'strings_en.json'), 'w'), ensure_ascii=False, indent=0)
print(len(keys), sum(len(k) for k in keys), sum(cnt.values()))
