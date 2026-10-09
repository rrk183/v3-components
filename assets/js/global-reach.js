/* =========================================================
   GLOBAL REACH - scroll-driven canvas network map
   Ported from global-reach-scroll.html. Element IDs are gr-*
   prefixed and the portrait state class is gr-is-portrait so
   nothing collides with the page's scoped DS. Logic unchanged.
   ========================================================= */
(function(){
  /* ---------- land dots (hex grid, pre-baked from Natural Earth 50m) ---------- */
  const GRID={x0:465.72,y0:-67.2,s:11,dy:9.526};
  const ROWS=["00000000000000000000000000000000000000000","ffe00000000000000000000000000000000000000","ffec0000000000000000000000000000000000000","ffffc0000000000a6380200e00000000000000000","fffd0000057e00000000000f80000000000000000","fff800000fc000000000000070000000000000000","fffe0000039800000000000008000000000000000","fff2000000000000006000007b800000000000000","fffe0000000000000e00003fffc0001d800000000","fff4000000000000300000ffff400000000000000","ffe800000000000030000ffffcdc6802000000000","fff0000000000000c01c2ffffffff80f800000000","ffd8000000000000e03d3bfffffffdeff80000c00","ffa00000003f8000083dffffffffffffffc000000","ffe00000007ff802039d7fffffffffffffffbf000","f800000003fffe33fffdffffffffffffffffffc00","f800000003ffdf97fffdfffffffffffffffffff80","a01a800007fff0ffffffffffffffffffffffff7e4","000fe0000fe3f4ffffffffffffffffffffffff1c2","000f00003fcffbfffffffffffffffffffffffe000","000000007f1fffffffffffffffffffffffffff000","00000001ff3fffffffffffffffffffffff37f0000","00000010ff1fffffffffffffffffffffff07e0000","00000001ff81fffffffffffffffffffffc1000000","00000000cf0ffffffffffffffffffffc003000000","000000c02e8ffffffffffffffffffff000f000000","000000c0371ffffffffffffffffffff000f800000","000000e0303fffffffffffffffffffc001e000000","0000033025ffffffffffffffffffffe000e000000","000006f0fffffffffffffffffffffffa01c000008","00000779fffffffffffffffffffffffe00c000080","0000007bfffffffffffffffffffffffa000000000","00000087fffffffffffffffffffffffb010000000","0000001ffffffffffffffffffffffff8000000000","0000007ffffffffffffffffffffffffa000000000","0000003ffffff9ffffffffffffffffe2000000000","0000001fffff93fc7fffffffffffffe0000000000","0000001ff3ff17f1ffffffffffffffc0400000000","0000001f99ff01f9ffffffffffffffc3400000000","000007fc18fe00f8fffffffffffffc0e000000000","000003fc263f387cfffffffffffffc00000000000","000003f04370fffcfffffffffffef808000000000","000003f02133fffc7ffffffffffe9004000000000","000003e00033fff87ffffffffff83008000000000","000003e00611fffe7ffffffffffd880c000000000","0000010fe010affffffffffffffe1838000000000","0000009ff00c17fffffffffffffe18f8000000000","000001ffe0000ffffffffffffffe0240000000000","000003fff0000fffffffffffffff0200000000000","000007fffc700fffffffffffffff0200000000000","000007ffff3f7fffffffffffffff0200000000000","000007fffffffffbffffffffffff0000000000000","000007fffffffff9ffffffffffff0000000000000","00001fffffffeff9fffffffffffe0000000000000","00001ffffffff7fe6ffffffffffe0000000000000","00003fffffffe7fc3ffffffffffc0000000000000","00003ffffffff3ff201ffffffffc0000000000000","00007ffffffff3fff01ffffffff90000000000000","00007ffffffff9fff807ffffffe10000000000000","0000fffffffff9fff80fff1ffd800000000000000","00007ffffffffcfff803ff0ffc000000000000000","0000fffffffff8fff003fc0ff9000000000000000","00007ffffffffc7fe001fc07f9018000000000000","0000fffffffffe7fc003f807f8010000000000000","00007ffffffffe3f0001f000fe018000000000000","0000fffffffffe7e0001e001fe010000000000000","00007fffffffffbc0000e000ff010000000000000","0000ffffffffffa00001e000fe010000000000000","00007fffffffffc00000e0009f002000000000000","00007fffffffffce0000e0001c000000000000000","00001ffffffffffe0000600084004000000000000","00001ffffffffffc0000500080002000000000000","00001ffffffffffe0000180000003000000000000","00000ffffffffffc0000100040084000000000000","000007f0fffffffc00000000600c0000000000000","00000200bffffff80000000260180000000000000","000000001ffffff800000001b0380000000000000","000000003fffffe000000001a0780800000000000","000000001fffffe000000000e1fc2800000000000","000000003fffffc000000000e1fa0800000000000","000000003fffff800000000070f80100000000000","000000003fffff000000000078f30160000000000","000000001fffff00000000003efa81bc080000000","800000001ffffe0000000000380301fe000000000","c00000000ffffe00000000000800001f800000000","e000000007fffc00000000000000009f900000000","f000000007fffe000000000003e0000fc08000000","f000000007fffe000000000000e0001e408000000","f000000007fffe000000000000002002201000000","e000000007fffe000000000000000000300000000","c000000003ffff000000000000000102000000000","8000000007ffff0000000000000003c2000000000","8000000007ffff0600000000000003c2000000000","800000000fffff040000000000001787000000000","800000000fffff0c0000000000003fc3800100000","800000000ffffe3c0000000000007fe7000001000","800000000ffffc1c0000000000007fff800080000","000000000ffff83c000000000000ffff800080000","8000000007fff01c000000000000ffffc00000000","0000000007fff03800000000000fffffc00400000","0000000003fff83800000000001fffffe00000000","0000000003fff03800000000003ffffff00000000","0000000003fff83800000000001ffffff80000000","0000000003ffe03000000000003ffffffc0000000","0000000003ffe00000000000001ffffffc0000000","0000000003ffc00000000000003ffffff80000000","0000000001ffe00000000000001ffffffc0000000","0000000001ff800000000000001ffffffc0000000","0000000000ff800000000000000ffffffc0000000","0000000000ff000000000000001ffffff80000000","00000000007f000000000000000fe07ff80000000","0000000000fc000000000000001f807ff00000000","000000000040000000000000000c004ff00000000","0000000000000000000000000000002ff00010000","00000000000000000000000000000007f00000000","00000000000000000000000000000007e0000e000","00000000000000000000000000000000000006000","0000000000000000000000000000000000000c000","00000000000000000000000000000000a00014000","00000000000000000000000000000000c00030000","00000000000000000000000000000000400030000","000000000000000000000000000000000000c0000","000000000000000000000000000000000000c0000","00000000000000000000000000000000000180000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000080000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000","00000000000000000000000000000000000000000"];
  const DOTS=[];   /* land cells (bright) */
  const GALL=[];   /* every cell incl. ocean (faint underlay so the map fills the margins) */
  ROWS.forEach((row,r)=>{
    const off=r%2?GRID.s/2:0;
    for(let i=0;i<row.length;i++){
      const n=parseInt(row[i],16);
      for(let b=0;b<4;b++){
        const x=GRID.x0+off+(i*4+b)*GRID.s, y=GRID.y0+r*GRID.dy;
        GALL.push(x,y);
        if(n&(8>>b)) DOTS.push(x,y);
      }
    }
  });

  /* ---------- projection (world space = the 1920x1080 end frame) ---------- */
  const P=(lon,lat)=>[1190+(lon-55.3)*7.6, 462-(lat-25.2)*9];
  const C={
    dubai:    {n:'Dubai',    p:P(55.27,25.20), lab:[22,-20,'left'], labTall:[0,-24,'center'], hub:1},
    london:   {n:'London',   p:P(-0.13,51.51), lab:[-18,-2,'right'], labTall:[0,-22,'center']},
    cairo:    {n:'Cairo',    p:P(31.24,30.04), lab:[-16,6,'right']},
    riyadh:   {n:'Riyadh',   p:P(46.68,24.71), lab:[-44,26,'center']},
    mumbai:   {n:'Mumbai',   p:P(72.88,19.08), lab:[46,26,'center']},
    singapore:{n:'Singapore',p:P(103.82,1.35), lab:[0,28,'center']},
    shanghai: {n:'Shanghai', p:P(121.47,31.23),lab:[-16,-2,'right']},
    tokyo:    {n:'Tokyo',    p:P(139.69,35.69),lab:[4,-22,'center']}
  };
  /* arcs: from, to, start (s), duration (s), bow, bow side */
  const ARCS=[
    ['dubai','london',   3.7,1.5,.30,'n'],
    ['dubai','cairo',    4.0,1.1,.26,'n'],
    ['dubai','riyadh',   4.25,.8,.30,'n'],
    ['dubai','mumbai',   4.5,1.0,.24,'n'],
    ['dubai','singapore',4.8,1.7,.22,'n'],
    ['singapore','shanghai',7.0,1.3,.14,'w'],
    ['singapore','tokyo',   7.3,1.5,.20,'w']
  ].map(([a,b,t0,d,bow,side])=>{
    const A=C[a].p,B=C[b].p,mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2;
    const dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy);
    let nx=-dy/L,ny=dx/L;
    if((side==='n'&&ny>0)||(side==='w'&&nx>0)||(side==='e'&&nx<0)){nx=-nx;ny=-ny}
    return {a,b,t0,d,A,B,Q:[mx+nx*L*bow,my+ny*L*bow]};
  });
  const ARRIVE={dubai:3.0}; ARCS.forEach(r=>ARRIVE[r.b]=r.t0+r.d);

  /* ---------- layouts: each camera pins Dubai at screen (x,y) with zoom k ---------- */
  const LAYOUT={
    wide:{W:1920,H:1080,label:20,hubLabel:25,
      cam:{k:1.75,x:960,y:560},
      moves:[[3.3,5.2,{k:1.37,x:832,y:557}],[9.4,11.2,{k:1,x:1190,y:462}]]},
    tall:{W:1080,H:1500,label:24,hubLabel:30,
      cam:{k:1.4,x:540,y:760},
      moves:[[3.3,5.2,{k:.9,x:445,y:800}],[9.4,11.2,{k:.84,x:430,y:800}]]}
  };

  /* ---------- timeline (seconds) ---------- */
  const T={introIn:[0,.9],introOut:[2.6,3.3],mapUp:[2.4,3.4],
    eyebrow:10.3,title:10.5,body:10.8,stats:[11.6,11.9,12.2,12.5],END:13.6};

  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const prog=(t,a,b)=>clamp((t-a)/(b-a));
  const eOut=x=>1-Math.pow(1-x,3);
  const eIO=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
  const lerp=(a,b,x)=>a+(b-a)*x;

  const reach=document.getElementById('gr-reach'),frame=document.getElementById('gr-frame'),
        stage=document.getElementById('gr-stage'),cv=document.getElementById('gr-map'),
        ctx=cv.getContext('2d'),hint=document.getElementById('gr-hint'),pin=reach.parentElement;
  const anim={};document.querySelectorAll('.gr-wrap [data-anim]').forEach(el=>anim[el.dataset.anim]=el);

  // lite = touch / small screens: drop the expensive per-frame effects and idle
  // the loop when the scrub is settled, so the main thread stays free (smooth
  // fixed header + no stutter on mobile / foldables).
  const lite = matchMedia('(pointer:coarse)').matches || Math.min(innerWidth,innerHeight)<820;

  // scale = the 16:9 stage (copy/stats); mscale/mox/moy = the full-bleed map
  // canvas, which COVERS the whole pinned viewport so the dotted map reaches
  // every edge (no pillarbox bands on wide desktops).
  let L=LAYOUT.wide,scale=1,dpr=1,mscale=1,mox=0,moy=0,pw=0,ph=0;
  function layout(){
    const portrait=frame.parentElement.clientWidth<760 && window.innerHeight>window.innerWidth;
    reach.classList.toggle('gr-is-portrait',portrait);
    L=portrait?LAYOUT.tall:LAYOUT.wide;
    scale=frame.clientWidth/L.W;
    /* portrait fills the phone screen: stage height follows the viewport,
       and the map is centred between the copy (ends ~560) and the stats block (~480 tall) */
    if(portrait){
      /* stage height tracks the frame exactly (no floor) so the composition fills
         the viewport without clipping the bottom stats row on near-square foldables */
      L.H=Math.max(1180,Math.round(L.W*frame.clientHeight/frame.clientWidth));
      /* the copy, map and stats compose inside a band capped at 1900 units, centred
         in the screen, so tall phones don't push copy and stats to opposite edges;
         short screens (foldables, small phones) set the type a step smaller */
      const HC=Math.min(L.H,1900);
      stage.style.setProperty('--gr-pad',Math.round((L.H-HC)/2)+'px');
      stage.style.setProperty('--gr-t',Math.max(.74,Math.min(1,HC/1900)).toFixed(3));
      /* centre the city cluster in the band between copy and stats, and shrink it
         on short screens (foldables) so its labels clear both; tall phones ~1 */
      L.kScale=Math.max(.5,Math.min(1,HC/2100));
      /* the copy always starts clear of the fixed site header */
      const hdr=(document.querySelector('.cmp-site-header')||{}).offsetHeight||64;
      const topU=Math.max(110+Math.round((L.H-HC)/2),Math.round((hdr+28)/scale));
      stage.style.setProperty('--gr-top',topU+'px');
      L.dy=Math.round(L.H/2-805+Math.max(0,topU-110-(L.H-HC)/2)/2);
      stage.style.height=L.H+'px';
    }else{L.kScale=1;stage.style.height='';}
    stage.style.transform=`scale(${scale})`;
    dpr=Math.min(window.devicePixelRatio||1,lite?1.5:2);
    /* map canvas fills the whole pinned viewport; the design frame (L.W x L.H)
       is cover-scaled and centred into it so the map bleeds to every edge */
    pw=pin.clientWidth;ph=pin.clientHeight;
    /* landscape layout: scale by WIDTH so the end frame always shows every city
       (cover-scaling on viewports taller than 16:9, e.g. tablets, cropped Shanghai
       and Tokyo off the right edge); the extra height is filled by the ocean-dot
       underlay. Portrait keeps cover, its layout is composed for tall screens. */
    mscale=L===LAYOUT.tall?Math.max(pw/L.W,ph/L.H):pw/L.W;
    mox=(pw-L.W*mscale)/2;moy=(ph-L.H*mscale)/2;
    cv.width=Math.round(pw*dpr);cv.height=Math.round(ph*dpr);
    draw(now());
  }

  const mix=(a,b,x)=>({k:lerp(a.k,b.k,x),x:lerp(a.x,b.x,x),y:lerp(a.y,b.y,x)});
  function camera(t){
    let c=L.cam,from=L.cam;
    L.moves.forEach(([t0,t1,to])=>{if(t>=t0){c=mix(from,to,eIO(prog(t,t0,t1)))}from=to});
    const D=C.dubai.p,k=c.k*(L.kScale||1);   /* kScale shrinks the cluster on short portraits */
    return {k,tx:c.x-D[0]*k,ty:c.y+(L.dy||0)-D[1]*k};
  }

  function qpt(r,u){const v=1-u;return[v*v*r.A[0]+2*v*u*r.Q[0]+u*u*r.B[0], v*v*r.A[1]+2*v*u*r.Q[1]+u*u*r.B[1]]}

  /* canvas palette: RGB triplets read from --gr-* tokens on .gr-wrap so the map
     follows the section's surface (library Surface control). Unset tokens fall
     back to the original navy-ground values, so the default render is unchanged. */
  const wrap=reach.closest('.gr-wrap')||document.documentElement;
  const PAL_DEF={ocean:'130,160,220',land:'150,180,228',landA:'1',arc:'58,118,255',glow:'120,165,255',glowEdge:'47,109,255',glowLite:'96,150,240',ring:'110,160,255',node:'58,118,255',core:'255,255,255',label:'255,255,255',head:'207,224,255'};
  let pal=PAL_DEF;
  function readPal(){
    const cs=getComputedStyle(wrap),o={};
    Object.keys(PAL_DEF).forEach(k=>{o[k]=cs.getPropertyValue('--gr-'+k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())).trim()||PAL_DEF[k]});
    o.landA=parseFloat(o.landA)||1;pal=o;
  }
  readPal();
  /* Arabic pages (lang="ar" on the section or <html>): city labels in Arabic, Tajawal type */
  const AR=/^ar\b/i.test(((reach.closest('[lang]')||document.documentElement).getAttribute('lang')||''));
  const AR_N={dubai:'دبي',london:'لندن',cairo:'القاهرة',riyadh:'الرياض',mumbai:'مومباي',singapore:'سنغافورة',shanghai:'شنغهاي',tokyo:'طوكيو'};
  if(AR)Object.keys(AR_N).forEach(k=>{if(C[k])C[k].n=AR_N[k]});
  const FONT=AR?"'Tajawal','Plus Jakarta Sans',sans-serif":"'Plus Jakarta Sans',sans-serif";
  new MutationObserver(()=>{readPal();draw(now())}).observe(wrap,{attributes:true,attributeFilter:['class','data-theme']});

  function glowDot(x,y,rad,alpha){
    if(lite){ctx.fillStyle=`rgba(${pal.glowLite},${(alpha*.5).toFixed(3)})`;ctx.beginPath();ctx.arc(x,y,rad*.7,0,7);ctx.fill();return}
    const g=ctx.createRadialGradient(x,y,0,x,y,rad);
    g.addColorStop(0,`rgba(${pal.glow},${alpha})`);g.addColorStop(1,`rgba(${pal.glowEdge},0)`);
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rad,0,7);ctx.fill();
  }

  function draw(t){
    const cam=camera(t),S=(p)=>[p[0]*cam.k+cam.tx,p[1]*cam.k+cam.ty];
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);
    ctx.setTransform(mscale*dpr,0,0,mscale*dpr,mox*dpr,moy*dpr);
    /* design-space bounds that are actually on the (cover-cropped) canvas */
    const cx0=-mox/mscale-4,cx1=(pw-mox)/mscale+4,cy0=-moy/mscale-4,cy1=(ph-moy)/mscale+4;

    /* soft light that follows Dubai */
    const hub=S(C.dubai.p);
    pin.style.setProperty('--gx',((hub[0]*mscale+mox)/pw*100).toFixed(1)+'%');
    pin.style.setProperty('--gy',((hub[1]*mscale+moy)/ph*100).toFixed(1)+'%');

    /* land dots, bucketed by alpha to keep fillStyle changes low */
    const mapA=lerp(.28,1,eIO(prog(t,...T.mapUp)));
    const r=1.55*Math.pow(cam.k,.75),sig2=2*Math.pow((L.W<L.H?1000:620)*Math.max(1,cam.k*.8),2),B=10,paths=[];
    for(let i=0;i<B;i++)paths.push(new Path2D());
    /* faint full-grid underlay (ocean + land) so the dotted map reaches both
       margins instead of floating in the centre; land dots overlay brighter */
    const bg=new Path2D(),bgStep=lite?4:2;   /* half the ocean dots on touch devices */
    for(let i=0;i<GALL.length;i+=bgStep){
      const x=GALL[i]*cam.k+cam.tx,y=GALL[i+1]*cam.k+cam.ty;
      if(x<cx0||y<cy0||x>cx1||y>cy1)continue;
      bg.moveTo(x+r,y);bg.arc(x,y,r,0,6.2832);
    }
    ctx.fillStyle=`rgba(${pal.ocean},${(.05*mapA).toFixed(3)})`;ctx.fill(bg);
    for(let i=0;i<DOTS.length;i+=2){
      const x=DOTS[i]*cam.k+cam.tx,y=DOTS[i+1]*cam.k+cam.ty;
      if(x<cx0||y<cy0||x>cx1||y>cy1)continue;
      const d2=(x-hub[0])**2+(y-hub[1])**2;
      const a=.12+.88*Math.exp(-d2/sig2);
      const bi=Math.min(B-1,Math.floor(a*B));
      paths[bi].moveTo(x+r,y);paths[bi].arc(x,y,r,0,6.2832);
    }
    for(let i=0;i<B;i++){ctx.fillStyle=`rgba(${pal.land},${((i+.5)/B*.5*mapA*pal.landA).toFixed(3)})`;ctx.fill(paths[i])}

    /* arcs */
    ctx.lineCap='round';
    ARCS.forEach(rc=>{
      const u=eOut(prog(t,rc.t0,rc.t0+rc.d));if(u<=0)return;
      const N=64,n=Math.max(2,Math.ceil(N*u));
      ctx.beginPath();
      for(let i=0;i<=n;i++){const q=S(qpt(rc,Math.min(u,i/N)));i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}
      if(!lite){ctx.shadowColor=`rgba(${pal.glowEdge},.9)`;ctx.shadowBlur=10;}   /* shadowBlur is costly: desktop only */
      ctx.strokeStyle=`rgba(${pal.arc},.95)`;ctx.lineWidth=2.2;ctx.stroke();
      ctx.shadowBlur=0;
      if(u<1){const h=S(qpt(rc,u));glowDot(h[0],h[1],18,.85);ctx.fillStyle=`rgb(${pal.head})`;ctx.beginPath();ctx.arc(h[0],h[1],2.6,0,7);ctx.fill()}
      /* travelling light packets once the story has finished */
      if(t>T.END){
        const per=5.5,ph=((t-T.END+ARCS.indexOf(rc)*.8)%per)/per;
        if(ph<.45){const w=ph/.45,q=S(qpt(rc,eIO(w)));glowDot(q[0],q[1],10,.7*Math.sin(w*Math.PI))}
      }
    });

    /* city nodes + labels */
    ctx.textBaseline='middle';
    Object.keys(C).forEach(key=>{
      const c=C[key],ta=ARRIVE[key];if(t<ta)return;
      const a=eOut(prog(t,ta,ta+.5)),[x,y]=S(c.p);
      /* arrival ripple */
      const rp=prog(t,ta,ta+1.1);
      if(rp>0&&rp<1){ctx.strokeStyle=`rgba(${pal.ring},${.7*(1-rp)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,4+rp*(c.hub?34:22),0,7);ctx.stroke()}
      /* idle pulse on the hub */
      if(c.hub&&t>T.END){const ip=((t-T.END)%3)/3;ctx.strokeStyle=`rgba(${pal.ring},${.45*(1-ip)})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,5+ip*26,0,7);ctx.stroke()}
      glowDot(x,y,c.hub?20:12,.6*a);
      ctx.fillStyle=`rgba(${pal.node},${a})`;ctx.beginPath();ctx.arc(x,y,c.hub?5.5:4,0,7);ctx.fill();
      ctx.fillStyle=`rgba(${pal.core},${a})`;ctx.beginPath();ctx.arc(x,y,c.hub?2.6:1.9,0,7);ctx.fill();
      const fs=c.hub?L.hubLabel:L.label,k=L===LAYOUT.tall?1.5:1;
      ctx.font=`${c.hub?600:500} ${fs}px ${FONT}`;
      const lb=(L===LAYOUT.tall&&c.labTall)||c.lab;
      ctx.textAlign=lb[2];
      ctx.fillStyle=`rgba(${pal.label},${.94*a})`;
      ctx.fillText(c.n,x+lb[0]*k,y+lb[1]*k+(1-a)*6);
    });

    /* HTML copy, driven by the same clock */
    const inA=eOut(prog(t,...T.introIn)),outA=eIO(prog(t,...T.introOut));
    set('intro',inA*(1-outA),(1-inA)*18-outA*10,outA*6);
    [['eyebrow',T.eyebrow],['title',T.title],['body',T.body]].forEach(([k,t0])=>{const x=eOut(prog(t,t0,t0+.9));set(k,x,(1-x)*22)});
    T.stats.forEach((t0,i)=>{
      const x=eOut(prog(t,t0,t0+.9));set('stat'+i,Math.min(1,x*1.4),(1-x)*18);
      anim['stat'+i].firstElementChild.style.transform=`scaleX(${eIO(prog(t,t0-.2,t0+.8))})`;
    });
  }
  function set(k,o,y,blur){
    const el=anim[k];el.style.opacity=o.toFixed(3);
    el.style.transform=(k==='intro'?'translateY(-50%) ':'')+`translateY(${y.toFixed(1)}px)`;
    el.style.filter=blur?`blur(${blur.toFixed(1)}px)`:'';
  }

  /* ---------- clock: scroll position drives the timeline ---------- */
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q=new URLSearchParams(location.search),fixedT=q.has('t')?parseFloat(q.get('t')):null;
  const track=document.getElementById('gr-scrub'),T0=1.0;   /* open on the intro line, already visible */
  let shown=T0,endAt=0,raf=0,visible=false;
  function target(){
    const r=track.getBoundingClientRect(),run=r.height-innerHeight;
    return lerp(T0,T.END,clamp(-r.top/run));
  }
  function now(){return fixedT!==null?fixedT:reduce?T.END:shown}
  function step(){
    raf=0;
    const goal=target(),moving=Math.abs(goal-shown)>=.002;
    shown=moving?shown+(goal-shown)*.14:goal;    /* eased follow keeps the scrub smooth on wheel steps */
    let t=shown;
    /* ambient light packets run in real time after the story — desktop only; on
       touch devices we idle the loop once settled so the main thread stays free */
    const ambient=!lite&&shown>=T.END;
    if(ambient){if(!endAt)endAt=performance.now();t=T.END+.001+(performance.now()-endAt)/1000}else endAt=0;
    draw(t);
    if(hint)hint.style.opacity=clamp(1-(shown-T0)/.6).toFixed(2);
    if(visible&&!reduce&&fixedT===null&&(moving||ambient))raf=requestAnimationFrame(step);
  }
  function kick(){if(visible&&!raf&&!reduce&&fixedT===null)raf=requestAnimationFrame(step)}
  new IntersectionObserver(es=>es.forEach(e=>{
    visible=e.isIntersecting;
    if(visible)kick();else if(raf){cancelAnimationFrame(raf);raf=0}
  })).observe(track);
  addEventListener('scroll',kick,{passive:true});
  if(window.DS&&window.DS.lenis&&window.DS.lenis.on)window.DS.lenis.on('scroll',kick);
  if(hint&&(reduce||fixedT!==null))hint.style.display='none';
  addEventListener('resize',function(){layout();kick();});
  (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{layout();draw(now())});
  layout();
})();
