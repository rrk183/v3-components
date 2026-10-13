"""Build ar.json for this repo: ds-hu memory + ds-hu fixes + auto-filled old-name
keys + new translations in out/ (via idmap). The Wholesale Banking name is
normalised wherever the English says Wholesale Banking."""
import glob, json, os, re
os.chdir(os.path.dirname(os.path.abspath(__file__)))
ar = json.load(open('ar_dshu.json', encoding='utf-8'))
ar.update(json.load(open('fixes_dshu.json', encoding='utf-8')))
ar.update(json.load(open('auto_fill.json', encoding='utf-8')))
idmap = json.load(open('idmap.json', encoding='utf-8'))
new = 0
for f in sorted(glob.glob('out/chunk*_part*.json')):
    for k, v in json.load(open(f, encoding='utf-8')).items():
        if k in idmap and isinstance(v, str) and v.strip():
            ar[idmap[k]] = v; new += 1
OLD, NEW = 'الخدمات المصرفية للشركات والمؤسسات', 'الخدمات المصرفية بالجملة'
for k, v in list(ar.items()):
    if 'Wholesale Banking' in k and OLD in v:
        ar[k] = v.replace(OLD, NEW)
for k, v in list(ar.items()):
    ar[k] = v.replace(' — ', '، ').replace('—', '، ').replace(' – ', '، ')
if os.path.exists('fixes.json'):
    ar.update(json.load(open('fixes.json', encoding='utf-8')))
json.dump(ar, open('ar.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('entries', len(ar), 'new from out/', new, 'of', len(idmap))
