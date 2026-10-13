import glob, json, re, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
idmap = json.load(open('idmap.json'))
ar = {}
for f in sorted(glob.glob('out/chunk*_part*.json')):
    for k, v in json.load(open(f, encoding='utf-8')).items():
        if k in idmap and isinstance(v, str) and v.strip():
            v = v.replace(' — ', '، ').replace('—', '، ').replace(' – ', '، ')
            ar[idmap[k]] = v
if os.path.exists('fixes.json'):
    for k, v in json.load(open('fixes.json', encoding='utf-8')).items():
        ar[k] = v.replace(' — ', '، ').replace('—', '، ')
json.dump(ar, open('ar.json', 'w'), ensure_ascii=False, indent=0)
print(len(ar), 'of', len(idmap))
