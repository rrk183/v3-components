import re
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
def errors(s):
    s=re.sub(r'<script\b.*?</script>|<style\b.*?</style>|<!--.*?-->','',s,flags=re.S)
    st=[];err=0
    for m in re.finditer(r'<(/?)([a-zA-Z][\w:-]*)[^>]*?(/?)>',s):
        c,n,sc=m.group(1),m.group(2).lower(),m.group(3)
        if n in VOID or sc: continue
        if not c: st.append(n)
        else:
            if st and st[-1]==n: st.pop()
            elif n in st:
                while st[-1]!=n: st.pop(); err+=1
                st.pop()
            else: err+=1
    return err+len(st)
