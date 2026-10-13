"""python3 validate.py NN : check out/chunkNN_part*.json against chunks/chunkNN.json"""
import glob, json, re, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
PH = re.compile(r'<(/?)(\d+)(/?)>')
n = int(sys.argv[1])
src = {str(e['id']): e['en'] for e in json.load(open('chunks/chunk%02d.json' % n))}
got, errs = {}, []
for f in sorted(glob.glob('out/chunk%02d_part*.json' % n)):
    try:
        got.update({str(k): v for k, v in json.load(open(f, encoding='utf-8')).items()})
    except Exception as e:
        errs.append('%s: invalid JSON (%s)' % (f, e))
for i, en in src.items():
    if i not in got:
        errs.append('missing id %s' % i)
        continue
    ar = got[i]
    if not isinstance(ar, str) or not ar.strip():
        errs.append('id %s: empty' % i)
        continue
    if sorted(PH.findall(en)) != sorted(PH.findall(ar)):
        errs.append('id %s: placeholders differ  en=%s  ar=%s' % (i, [m.group(0) for m in PH.finditer(en)], [m.group(0) for m in PH.finditer(ar)]))
    if '—' in ar or ' – ' in ar:
        errs.append('id %s: contains an em/en dash' % i)
    plain = PH.sub('', en)
    if len(re.findall(r'[A-Za-z]{4,}', plain)) >= 5 and not re.search('[؀-ۿ]', ar):
        errs.append('id %s: looks untranslated' % i)
extra = set(got) - set(src)
if extra:
    errs.append('unknown ids: %s' % sorted(extra)[:20])
print('\n'.join(errs[:80]) if errs else 'OK', '' if not errs else '\n(%d problems)' % len(errs))
