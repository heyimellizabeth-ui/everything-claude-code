#!/usr/bin/env node
'use strict';

/**
 * Design Studio — style analyzer
 *
 * Scans projects/club-kudt/ and projects/source-sites/ for design elements,
 * then writes projects/design-studio/catalog.js (window.CATALOG) and catalog.json.
 *
 * Usage: node scripts/studio/analyze-styles.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SOURCE_SITES_DIR = path.join(ROOT, 'projects', 'source-sites');
const CLUB_KUDT_DIR = path.join(ROOT, 'projects', 'club-kudt');
const OUTPUT_DIR = path.join(ROOT, 'projects', 'design-studio');

// ─── Hardcoded Club KUDT element catalog ─────────────────────────────────────
// Each element has: id, category, name, description, source, tags, previewHtml, snippet

const CLUB_KUDT_ELEMENTS = [
  {
    id: 'cursor-custom',
    category: 'interactive',
    name: 'Custom Cursor',
    description: 'Expanding circle that tracks the mouse and shows context labels (TICKETS, FOLLOW, VIEW) when hovering specific elements.',
    source: 'club-kudt',
    tags: ['cursor', 'mouse', 'hover', 'interactive'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box;cursor:none}
body{background:#0D0D0D;color:#F5F0E8;font-family:'Courier New',monospace;height:100%;display:flex;align-items:center;justify-content:center;min-height:180px}
.cursor{position:fixed;width:14px;height:14px;background:#E8415A;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);transition:width .2s,height .2s,background .2s;z-index:9999}
.cursor.expand{width:56px;height:56px;background:rgba(232,65,90,0.15);border:1px solid #E8415A}
.cursor-label{position:fixed;font-size:9px;letter-spacing:2px;color:#E8415A;pointer-events:none;transform:translate(-50%,-50%);opacity:0;transition:opacity .2s;z-index:10000}
.cursor.expand .cursor-label{opacity:1}
.demo{text-align:center;padding:24px}
.demo p{font-size:11px;letter-spacing:2px;color:#888070;margin-bottom:16px}
.hover-me{display:inline-block;padding:10px 20px;border:1px solid #E8415A;color:#E8415A;font-size:11px;letter-spacing:2px}
</style></head><body>
<div class="cursor" id="c"><span class="cursor-label">VIEW</span></div>
<div class="demo"><p>MOVE CURSOR OVER ELEMENT</p><div class="hover-me" id="h">HOVER ME</div></div>
<script>
const c=document.getElementById('c');
document.addEventListener('mousemove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px'});
document.getElementById('h').addEventListener('mouseenter',()=>c.classList.add('expand'));
document.getElementById('h').addEventListener('mouseleave',()=>c.classList.remove('expand'));
</script></body></html>`,
    snippet: `<!-- Custom Cursor HTML -->\n<div class="cursor" id="cursor"><span class="cursor-label"></span></div>\n\n/* CSS */\n* { cursor: none; }\n.cursor { position: fixed; width: 14px; height: 14px; background: var(--accent); border-radius: 50%; pointer-events: none; transform: translate(-50%,-50%); transition: width .2s, height .2s; z-index: 9999; }\n.cursor.expand { width: 56px; height: 56px; background: rgba(232,65,90,0.15); border: 1px solid var(--accent); }\n\n// JS\nconst cursor = document.getElementById('cursor');\ndocument.addEventListener('mousemove', e => {\n  cursor.style.left = e.clientX + 'px';\n  cursor.style.top = e.clientY + 'px';\n});`
  },
  {
    id: 'particles-canvas',
    category: 'hero',
    name: 'Canvas Particle System',
    description: '80 animated particles on a dark canvas with wrap-around physics. Ideal for hero backgrounds.',
    source: 'club-kudt',
    tags: ['particles', 'canvas', 'hero', 'animation', 'background'],
    previewHtml: `<!DOCTYPE html><html><head><style>*{margin:0;padding:0}body{background:#0D0D0D;overflow:hidden}canvas{display:block}</style></head><body>
<canvas id="c"></canvas>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
c.width=window.innerWidth||300;c.height=window.innerHeight||180;
const P=Array.from({length:40},()=>({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,r:Math.random()*2+.5}));
function draw(){
ctx.fillStyle='rgba(13,13,13,0.15)';ctx.fillRect(0,0,c.width,c.height);
P.forEach(p=>{
  p.x+=p.vx;p.y+=p.vy;
  if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;
  if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;
  ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(232,65,90,0.6)';ctx.fill();
});
requestAnimationFrame(draw);}
draw();
</script></body></html>`,
    snippet: `<canvas id="particles"></canvas>\n\n// JS\nconst canvas = document.getElementById('particles');\nconst ctx = canvas.getContext('2d');\nconst particles = Array.from({length: 80}, () => ({\n  x: Math.random() * canvas.width,\n  y: Math.random() * canvas.height,\n  vx: (Math.random() - 0.5) * 0.6,\n  vy: (Math.random() - 0.5) * 0.6,\n  r: Math.random() * 2 + 0.5\n}));\nfunction animate() {\n  ctx.fillStyle = 'rgba(13,13,13,0.15)';\n  ctx.fillRect(0, 0, canvas.width, canvas.height);\n  particles.forEach(p => {\n    p.x += p.vx; p.y += p.vy;\n    if (p.x < 0) p.x = canvas.width;\n    if (p.x > canvas.width) p.x = 0;\n    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);\n    ctx.fillStyle = 'rgba(232,65,90,0.6)'; ctx.fill();\n  });\n  requestAnimationFrame(animate);\n}\nanimate();`
  },
  {
    id: 'glitch-text',
    category: 'typography',
    name: 'SVG Glitch Text Effect',
    description: 'Animated glitch effect using SVG feTurbulence + feDisplacementMap. Subtle idle state, dramatic on hover.',
    source: 'club-kudt',
    tags: ['glitch', 'text', 'svg', 'filter', 'animation'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;display:flex;align-items:center;justify-content:center;min-height:180px;font-family:'Courier New',monospace}
.glitch{font-size:48px;font-weight:900;letter-spacing:8px;color:#F5F0E8;filter:url(#glitch);cursor:default;user-select:none}
@keyframes turbulence{0%,100%{attr(seed,0)}50%{attr(seed,5)}}
</style>
<svg width="0" height="0"><defs><filter id="glitch"><feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="0" result="noise" id="turb"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="disp"/></filter></defs></svg>
</head><body>
<div class="glitch" id="g">STUDIO</div>
<script>
const turb=document.getElementById('turb'),disp=document.getElementById('disp'),g=document.getElementById('g');
let t=0,active=false;
function idle(){turb.setAttribute('seed',Math.sin(t)*3);t+=0.02;if(!active)requestAnimationFrame(idle);}
function glitch(){
  active=true;let s=0;
  const iv=setInterval(()=>{
    s+=1;turb.setAttribute('seed',s);disp.setAttribute('scale',12);
    if(s>20){clearInterval(iv);disp.setAttribute('scale',0);active=false;requestAnimationFrame(idle);}
  },30);
}
g.addEventListener('mouseenter',glitch);
idle();
</script></body></html>`,
    snippet: `<svg width="0" height="0"><defs><filter id="glitch-filter"><feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="0" result="noise" id="turb"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" id="disp"/></filter></defs></svg>\n\n.glitch-text { filter: url(#glitch-filter); }\n\n// JS — hover to trigger\nconst turb = document.getElementById('turb');\nconst disp = document.getElementById('disp');\nelement.addEventListener('mouseenter', () => {\n  let seed = 0;\n  const iv = setInterval(() => {\n    turb.setAttribute('seed', seed++);\n    disp.setAttribute('scale', 12);\n    if (seed > 20) { clearInterval(iv); disp.setAttribute('scale', 0); }\n  }, 30);\n});`
  },
  {
    id: 'magnetic-button',
    category: 'interactive',
    name: 'Magnetic CTA Button',
    description: 'Button that pulls toward the cursor within an 80px radius, creating a tactile attraction effect.',
    source: 'club-kudt',
    tags: ['button', 'magnetic', 'mouse', 'cta', 'interactive'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;cursor:none}
body{background:#0D0D0D;display:flex;align-items:center;justify-content:center;min-height:180px;font-family:'Courier New',monospace}
.cursor{position:fixed;width:10px;height:10px;background:#E8415A;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);z-index:9999}
.btn{position:relative;padding:14px 32px;background:transparent;border:1px solid #E8415A;color:#E8415A;font-family:'Courier New',monospace;font-size:12px;letter-spacing:3px;cursor:none;transition:transform .15s ease,background .2s;will-change:transform}
.btn:hover{background:rgba(232,65,90,0.08)}
p{position:absolute;bottom:16px;width:100%;text-align:center;font-size:10px;letter-spacing:2px;color:#888070;font-family:'Courier New',monospace}
</style></head><body>
<div class="cursor" id="c"></div>
<button class="btn" id="btn">GET TICKETS</button>
<p>MOVE CURSOR NEAR BUTTON</p>
<script>
const c=document.getElementById('c'),btn=document.getElementById('btn');
document.addEventListener('mousemove',e=>{
  c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';
  const r=btn.getBoundingClientRect();
  const cx=r.left+r.width/2,cy=r.top+r.height/2;
  const dx=e.clientX-cx,dy=e.clientY-cy;
  const dist=Math.sqrt(dx*dx+dy*dy);
  if(dist<80){
    const pull=1-dist/80;
    btn.style.transform='translate('+(dx*pull*0.3)+'px,'+(dy*pull*0.3)+'px)';
  } else {
    btn.style.transform='translate(0,0)';
  }
});
</script></body></html>`,
    snippet: `// Magnetic button JS\nfunction initMagnetic(el, radius = 80, strength = 0.3) {\n  document.addEventListener('mousemove', e => {\n    const r = el.getBoundingClientRect();\n    const cx = r.left + r.width / 2;\n    const cy = r.top + r.height / 2;\n    const dx = e.clientX - cx;\n    const dy = e.clientY - cy;\n    const dist = Math.sqrt(dx*dx + dy*dy);\n    if (dist < radius) {\n      const pull = 1 - dist / radius;\n      el.style.transform = \`translate(\${dx*pull*strength}px, \${dy*pull*strength}px)\`;\n    } else {\n      el.style.transform = 'translate(0,0)';\n    }\n  });\n}`
  },
  {
    id: 'tilt-card',
    category: 'interactive',
    name: '3D Tilt Card',
    description: 'Card with real-time perspective tilt based on cursor position. ±8° rotation on X and Y axes.',
    source: 'club-kudt',
    tags: ['card', 'tilt', '3d', 'perspective', 'mouse'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;cursor:none;box-sizing:border-box}
body{background:#0D0D0D;display:flex;align-items:center;justify-content:center;min-height:180px;font-family:'Courier New',monospace}
.cursor{position:fixed;width:10px;height:10px;background:#E8415A;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%);z-index:9999}
.card{width:200px;padding:20px;background:#1A1A1A;border:1px solid #2A2A2A;will-change:transform;transform-style:preserve-3d;transition:transform .1s ease,border-color .2s;perspective:1000px}
.card:hover{border-color:#E8415A}
.card-label{font-size:9px;letter-spacing:3px;color:#888070;margin-bottom:8px}
.card-title{font-size:16px;color:#F5F0E8;letter-spacing:2px}
.card-num{font-size:28px;color:#E8415A;margin-top:8px;opacity:.4}
</style></head><body>
<div class="cursor" id="c"></div>
<div class="card" id="card"><div class="card-label">UPCOMING</div><div class="card-title">PRIDE NIGHT</div><div class="card-num">001</div></div>
<script>
const c=document.getElementById('c'),card=document.getElementById('card');
document.addEventListener('mousemove',e=>{
  c.style.left=e.clientX+'px';c.style.top=e.clientY+'px';
  const r=card.getBoundingClientRect();
  if(e.clientX>r.left-20&&e.clientX<r.right+20&&e.clientY>r.top-20&&e.clientY<r.bottom+20){
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform='perspective(1000px) rotateY('+(x*16)+'deg) rotateX('+(-y*16)+'deg)';
  } else {
    card.style.transform='perspective(1000px) rotateY(0) rotateX(0)';
  }
});
</script></body></html>`,
    snippet: `// 3D tilt card JS\nfunction initTilt(el, maxDeg = 8) {\n  el.addEventListener('mousemove', e => {\n    const r = el.getBoundingClientRect();\n    const x = (e.clientX - r.left) / r.width - 0.5;\n    const y = (e.clientY - r.top) / r.height - 0.5;\n    el.style.transform = \`perspective(1000px) rotateY(\${x * maxDeg * 2}deg) rotateX(\${-y * maxDeg * 2}deg)\`;\n  });\n  el.addEventListener('mouseleave', () => {\n    el.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';\n  });\n}\n\n.card { transition: transform .1s ease; will-change: transform; }`
  },
  {
    id: 'preloader',
    category: 'animations',
    name: 'Word Reveal Preloader',
    description: 'Sequential word reveals with a sliding bar: "Queer." → "Alkmaar." → "KUDT." Auto-plays then exits.',
    source: 'club-kudt',
    tags: ['preloader', 'loading', 'animation', 'reveal', 'entrance'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;font-family:'Courier New',monospace;overflow:hidden;min-height:180px}
.preloader{position:absolute;inset:0;background:#0D0D0D;display:flex;align-items:center;justify-content:center;z-index:100}
.word-wrap{overflow:hidden;position:relative;height:48px;margin-bottom:8px}
.word{font-size:32px;font-weight:900;color:#F5F0E8;letter-spacing:4px;transform:translateY(100%);transition:transform .4s cubic-bezier(.77,0,.175,1)}
.word.show{transform:translateY(0)}
.bar{height:2px;background:#E8415A;transform:scaleX(0);transform-origin:left;transition:transform .4s ease}
.bar.go{transform:scaleX(1)}
</style></head><body>
<div class="preloader" id="p">
<div>
  <div class="word-wrap"><div class="word" id="w1">Queer.</div></div>
  <div class="bar" id="b1"></div>
</div>
</div>
<script>
const words=['Queer.','Alkmaar.','STUDIO.'];
let i=0;
const w=document.getElementById('w1'),b=document.getElementById('b1'),p=document.getElementById('p');
function next(){
  if(i>=words.length){p.style.opacity='0';p.style.transition='opacity .5s';setTimeout(()=>p.remove(),500);return;}
  w.textContent=words[i];w.classList.remove('show');b.classList.remove('go');
  setTimeout(()=>{w.classList.add('show');b.classList.add('go');},50);
  i++;setTimeout(next,800);
}
next();
</script></body></html>`,
    snippet: `<!-- Preloader HTML -->\n<div class="preloader" id="preloader">\n  <div class="word-wrap"><div class="word" id="preloader-word"></div></div>\n  <div class="bar" id="preloader-bar"></div>\n</div>\n\n// JS — cycle words then remove\nconst words = ['Queer.', 'Alkmaar.', 'KUDT.'];\nlet idx = 0;\nfunction cycleWord() {\n  if (idx >= words.length) { document.getElementById('preloader').remove(); return; }\n  const w = document.getElementById('preloader-word');\n  w.textContent = words[idx++];\n  w.classList.add('show');\n  setTimeout(cycleWord, 800);\n}\ncycleWord();`
  },
  {
    id: 'marquee-ticker',
    category: 'animations',
    name: 'Infinite Marquee Ticker',
    description: 'Continuously scrolling red band with rotating stats. CSS-only infinite animation.',
    source: 'club-kudt',
    tags: ['marquee', 'ticker', 'scroll', 'text', 'banner'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;display:flex;align-items:center;justify-content:center;min-height:180px;overflow:hidden;font-family:'Courier New',monospace}
.ticker{width:100%;background:#E8415A;padding:10px 0;overflow:hidden;white-space:nowrap}
.ticker-inner{display:inline-block;animation:ticker 15s linear infinite}
.ticker-inner span{display:inline-block;padding:0 24px;font-size:11px;letter-spacing:3px;color:#0D0D0D;font-weight:700}
.ticker-inner .dot{color:rgba(13,13,13,0.4)}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
</style></head><body>
<div class="ticker"><div class="ticker-inner">
<span>780+ ATTENDEES</span><span class="dot">✦</span>
<span>EST. 2022</span><span class="dot">✦</span>
<span>ALKMAAR</span><span class="dot">✦</span>
<span>QUEER SPACE</span><span class="dot">✦</span>
<span>140 BPM</span><span class="dot">✦</span>
<span>780+ ATTENDEES</span><span class="dot">✦</span>
<span>EST. 2022</span><span class="dot">✦</span>
<span>ALKMAAR</span><span class="dot">✦</span>
<span>QUEER SPACE</span><span class="dot">✦</span>
<span>140 BPM</span><span class="dot">✦</span>
</div></div>
</body></html>`,
    snippet: `.ticker { background: var(--accent); padding: 10px 0; overflow: hidden; white-space: nowrap; }\n.ticker-inner { display: inline-block; animation: ticker 30s linear infinite; }\n.ticker-inner span { padding: 0 24px; font-size: 11px; letter-spacing: 3px; }\n@keyframes ticker {\n  0% { transform: translateX(0); }\n  100% { transform: translateX(-50%); } /* duplicate content for seamless loop */\n}`
  },
  {
    id: 'scroll-reveals',
    category: 'animations',
    name: 'Directional Scroll Reveals',
    description: 'Elements animate in from up/left/right/scale when scrolled into view. Staggered timing with IntersectionObserver.',
    source: 'club-kudt',
    tags: ['scroll', 'reveal', 'animation', 'intersection', 'stagger'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;font-family:'Courier New',monospace;padding:16px;min-height:180px;display:flex;flex-direction:column;gap:12px;align-items:flex-start;justify-content:center}
.box{padding:12px 20px;border:1px solid #2A2A2A;font-size:11px;letter-spacing:2px;color:#F5F0E8;opacity:0;transition:opacity .6s ease,transform .6s ease}
.box.mil-up{transform:translateY(30px)}
.box.mil-left{transform:translateX(-30px)}
.box.mil-right{transform:translateX(30px)}
.box.mil-scale{transform:scale(0.9)}
.box.visible{opacity:1;transform:none}
</style></head><body>
<div class="box mil-up" style="transition-delay:0s;border-color:#E8415A;color:#E8415A">↑ MIL-UP</div>
<div class="box mil-left" style="transition-delay:.1s">← MIL-LEFT</div>
<div class="box mil-right" style="transition-delay:.2s">→ MIL-RIGHT</div>
<div class="box mil-scale" style="transition-delay:.3s">⊕ MIL-SCALE</div>
<script>
setTimeout(()=>{
  document.querySelectorAll('.box').forEach(el=>el.classList.add('visible'));
},200);
</script></body></html>`,
    snippet: `.mil-up { opacity: 0; transform: translateY(40px); transition: opacity .6s ease, transform .6s ease; }\n.mil-left { opacity: 0; transform: translateX(-40px); transition: opacity .6s ease, transform .6s ease; }\n.mil-right { opacity: 0; transform: translateX(40px); transition: opacity .6s ease, transform .6s ease; }\n.mil-scale { opacity: 0; transform: scale(0.92); transition: opacity .6s ease, transform .6s cubic-bezier(.34,1.56,.64,1); }\n.mil-up.visible, .mil-left.visible, .mil-right.visible, .mil-scale.visible { opacity: 1; transform: none; }\n\n// JS — IntersectionObserver\nconst observer = new IntersectionObserver(entries => {\n  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });\n}, { threshold: 0.1 });\ndocument.querySelectorAll('.mil-up, .mil-left, .mil-right, .mil-scale').forEach(el => observer.observe(el));`
  },
  {
    id: 'section-line',
    category: 'animations',
    name: 'Section Line Reveal',
    description: 'A 1px horizontal line that scales from 0 to full width (left to right) as the section enters view.',
    source: 'club-kudt',
    tags: ['line', 'divider', 'animation', 'scroll', 'reveal'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;display:flex;align-items:center;justify-content:center;min-height:180px;font-family:'Courier New',monospace;flex-direction:column;gap:24px;padding:24px}
.section-line{height:1px;background:#E8415A;transform:scaleX(0);transform-origin:left center;transition:transform .8s cubic-bezier(.77,0,.175,1);width:100%}
.section-line.visible{transform:scaleX(1)}
.label{font-size:10px;letter-spacing:3px;color:#888070}
</style></head><body>
<div class="label">SCROLL TRIGGER FIRES</div>
<div class="section-line" id="line"></div>
<div class="label">SECTION TITLE BELOW</div>
<script>setTimeout(()=>document.getElementById('line').classList.add('visible'),400)</script>
</body></html>`,
    snippet: `.section-line {\n  height: 1px;\n  background: var(--accent);\n  transform: scaleX(0);\n  transform-origin: left center;\n  transition: transform .8s cubic-bezier(.77, 0, .175, 1);\n}\n.section-line.visible { transform: scaleX(1); }\n\n// Trigger on scroll\nconst observer = new IntersectionObserver(([e]) => {\n  if (e.isIntersecting) el.classList.add('visible');\n});\nobserver.observe(document.querySelector('.section-line'));`
  },
  {
    id: 'stat-counter',
    category: 'animations',
    name: 'Animated Stat Counter',
    description: 'Numbers count up from 0 to target when scrolled into view. Supports suffix (+ / %) and prefix (€).',
    source: 'club-kudt',
    tags: ['counter', 'number', 'animation', 'stats', 'scroll'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;display:flex;align-items:center;justify-content:center;gap:32px;min-height:180px;font-family:'Courier New',monospace;flex-wrap:wrap;padding:16px}
.stat{text-align:center}
.stat-num{font-size:36px;font-weight:900;color:#F5F0E8;letter-spacing:2px}
.stat-label{font-size:9px;letter-spacing:3px;color:#888070;margin-top:4px}
</style></head><body>
<div class="stat"><div class="stat-num" id="s1">0</div><div class="stat-label">EST. YEAR</div></div>
<div class="stat"><div class="stat-num" id="s2">0+</div><div class="stat-label">ATTENDEES</div></div>
<div class="stat"><div class="stat-num" id="s3">€0</div><div class="stat-label">AVG TICKET</div></div>
<div class="stat"><div class="stat-num" id="s4">0%</div><div class="stat-label">QUEER SPACE</div></div>
<script>
function count(el,target,prefix='',suffix='',dur=1500){
  let start=null;
  function step(ts){
    if(!start)start=ts;
    const p=Math.min((ts-start)/dur,1);
    el.textContent=prefix+Math.floor(p*target)+suffix;
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
setTimeout(()=>{
  count(document.getElementById('s1'),2022,'','');
  count(document.getElementById('s2'),780,'','+');
  count(document.getElementById('s3'),15,'€','');
  count(document.getElementById('s4'),100,'','%');
},300);
</script></body></html>`,
    snippet: `// Stat counter JS\nfunction animateCounter(el, target, prefix = '', suffix = '', duration = 1500) {\n  let start = null;\n  function step(timestamp) {\n    if (!start) start = timestamp;\n    const progress = Math.min((timestamp - start) / duration, 1);\n    el.textContent = prefix + Math.floor(progress * target) + suffix;\n    if (progress < 1) requestAnimationFrame(step);\n  }\n  requestAnimationFrame(step);\n}\n\n// Usage\nanimateCounter(el, 780, '', '+'); // "780+"\nanimateCounter(el, 15, '€', '');  // "€15"`
  },
  {
    id: 'scroll-progress',
    category: 'interactive',
    name: 'Scroll Progress Bar',
    description: 'Fixed 2px bar at the top of the page that fills from left to right as the user scrolls.',
    source: 'club-kudt',
    tags: ['scroll', 'progress', 'bar', 'indicator'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;font-family:'Courier New',monospace;min-height:400px;padding:40px 24px}
.progress-bar{position:fixed;top:0;left:0;height:2px;background:#E8415A;width:0%;transition:width .05s linear;z-index:9999}
.content{color:#888070;font-size:11px;letter-spacing:2px;line-height:2}
</style></head><body>
<div class="progress-bar" id="pb"></div>
<div class="content">
<p>SCROLL DOWN TO SEE THE PROGRESS BAR FILL ↓</p><br>
<p>.....................................</p><p>.....................................</p>
<p>.....................................</p><p>.....................................</p>
<p>.....................................</p><p>.....................................</p>
<p style="color:#E8415A">END OF CONTENT ✦</p>
</div>
<script>
window.addEventListener('scroll',()=>{
  const d=document.documentElement;
  const pct=(d.scrollTop/(d.scrollHeight-d.clientHeight))*100;
  document.getElementById('pb').style.width=pct+'%';
});
</script></body></html>`,
    snippet: `<div class="progress-bar" id="progress-bar"></div>\n\n.progress-bar { position: fixed; top: 0; left: 0; height: 2px; background: var(--accent); width: 0; z-index: 9999; }\n\n// JS\nwindow.addEventListener('scroll', () => {\n  const d = document.documentElement;\n  const pct = (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100;\n  document.getElementById('progress-bar').style.width = pct + '%';\n});`
  },
  {
    id: 'nav-autohide',
    category: 'interactive',
    name: 'Nav Auto-hide on Scroll',
    description: 'Navigation slides up when scrolling down past 120px, returns when scrolling back up. Blur backdrop.',
    source: 'club-kudt',
    tags: ['nav', 'navigation', 'scroll', 'hide', 'backdrop'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;font-family:'Courier New',monospace;height:300px;overflow-y:scroll}
nav{position:sticky;top:0;background:rgba(13,13,13,0.85);backdrop-filter:blur(8px);border-bottom:1px solid #2A2A2A;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;transition:transform .3s ease;z-index:100}
nav.hidden{transform:translateY(-100%)}
.nav-logo{font-size:14px;letter-spacing:4px;color:#F5F0E8;font-weight:900}
.nav-links{display:flex;gap:20px}
.nav-links a{font-size:10px;letter-spacing:2px;color:#888070;text-decoration:none}
.content{padding:20px;color:#888070;font-size:10px;letter-spacing:2px;line-height:2.5}
</style></head><body>
<nav id="nav"><span class="nav-logo">STUDIO</span><div class="nav-links"><a>ABOUT</a><a>WORK</a><a>CONTACT</a></div></nav>
<div class="content"><p>SCROLL DOWN ↓</p><p>.</p><p>.</p><p>.</p><p>.</p><p>.</p><p>NAV RETURNS ON SCROLL UP ↑</p></div>
<script>
const nav=document.getElementById('nav');let last=0;
document.addEventListener('scroll',function(){
  const cur=document.documentElement.scrollTop;
  if(cur>120&&cur>last)nav.classList.add('hidden');
  else nav.classList.remove('hidden');
  last=cur;
},{passive:true});
</script></body></html>`,
    snippet: `nav { position: fixed; top: 0; left: 0; right: 0; backdrop-filter: blur(8px); transition: transform .3s ease; }\nnav.hidden { transform: translateY(-100%); }\n\n// JS\nlet lastScroll = 0;\nwindow.addEventListener('scroll', () => {\n  const current = window.scrollY;\n  if (current > 120 && current > lastScroll) nav.classList.add('hidden');\n  else nav.classList.remove('hidden');\n  lastScroll = current;\n}, { passive: true });`
  },
  {
    id: 'hamburger-drawer',
    category: 'interactive',
    name: 'Animated Hamburger + Mobile Drawer',
    description: '3 lines animate into an X, opening a full-screen drawer menu with scroll lock.',
    source: 'club-kudt',
    tags: ['hamburger', 'menu', 'mobile', 'drawer', 'navigation'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;font-family:'Courier New',monospace;overflow:hidden;min-height:180px;display:flex;align-items:flex-start;justify-content:flex-end;padding:20px}
.burger{width:24px;height:18px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;z-index:200;position:relative}
.burger span{display:block;height:1px;background:#F5F0E8;transition:all .3s ease}
.burger.open span:nth-child(1){transform:rotate(45deg) translate(6px,6px)}
.burger.open span:nth-child(2){opacity:0}
.burger.open span:nth-child(3){transform:rotate(-45deg) translate(6px,-6px)}
.drawer{position:fixed;inset:0;background:#0D0D0D;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;transform:translateX(100%);transition:transform .4s cubic-bezier(.77,0,.175,1);z-index:100}
.drawer.open{transform:translateX(0)}
.drawer a{font-size:24px;letter-spacing:6px;color:#F5F0E8;text-decoration:none;opacity:0;transform:translateX(20px);transition:opacity .3s,transform .3s}
.drawer.open a{opacity:1;transform:translateX(0)}
.drawer.open a:nth-child(1){transition-delay:.15s}
.drawer.open a:nth-child(2){transition-delay:.2s}
.drawer.open a:nth-child(3){transition-delay:.25s}
</style></head><body>
<div class="burger" id="b"><span></span><span></span><span></span></div>
<div class="drawer" id="d"><a>ABOUT</a><a>EVENTS</a><a>CONTACT</a></div>
<script>
document.getElementById('b').addEventListener('click',function(){
  this.classList.toggle('open');
  document.getElementById('d').classList.toggle('open');
});
</script></body></html>`,
    snippet: `// Hamburger toggle JS\ndocument.querySelector('.hamburger').addEventListener('click', function() {\n  this.classList.toggle('open');\n  document.querySelector('.mobile-drawer').classList.toggle('open');\n  document.body.style.overflow = this.classList.contains('open') ? 'hidden' : '';\n});\n\n/* CSS lines */\n.hamburger span:nth-child(1) { transform: none; }\n.hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(6px, 6px); }\n.hamburger.open span:nth-child(2) { opacity: 0; }\n.hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(6px, -6px); }`
  },
  {
    id: 'palette-void-red',
    category: 'colors',
    name: 'Dark Void × Red Accent',
    description: 'Club KUDT palette: near-black background, cream text, red accent. High contrast, nightlife aesthetic.',
    source: 'club-kudt',
    tags: ['palette', 'dark', 'red', 'nightlife', 'monochrome'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;font-family:'Courier New',monospace}
.swatches{display:flex;gap:8px}
.swatch{width:48px;height:48px;border-radius:2px;position:relative}
.swatch-label{position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);font-size:8px;letter-spacing:1px;white-space:nowrap;color:#888070}
.preview{width:100%;max-width:280px;background:#0D0D0D;border:1px solid #2A2A2A;padding:16px;margin-top:24px}
.preview h3{color:#F5F0E8;font-size:14px;letter-spacing:4px;margin-bottom:8px}
.preview p{color:#888070;font-size:10px;letter-spacing:1px;margin-bottom:12px}
.preview button{background:transparent;border:1px solid #E8415A;color:#E8415A;padding:8px 16px;font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;cursor:pointer}
</style></head><body>
<div class="swatches">
<div class="swatch" style="background:#0D0D0D;border:1px solid #2A2A2A"><span class="swatch-label">#0D0D0D</span></div>
<div class="swatch" style="background:#1A1A1A"><span class="swatch-label">#1A1A1A</span></div>
<div class="swatch" style="background:#888070"><span class="swatch-label">#888070</span></div>
<div class="swatch" style="background:#F5F0E8"><span class="swatch-label">#F5F0E8</span></div>
<div class="swatch" style="background:#E8415A"><span class="swatch-label">#E8415A</span></div>
</div>
<div class="preview"><h3>EVENT TITLE</h3><p>Queer feesten in Alkmaar — drag, disco, pop & meer.</p><button>GET TICKETS</button></div>
</body></html>`,
    snippet: `:root {\n  --void: #0D0D0D;      /* background */\n  --surface: #1A1A1A;   /* cards */\n  --muted: #888070;     /* secondary text */\n  --cream: #F5F0E8;     /* primary text */\n  --accent: #E8415A;    /* CTA, highlights */\n}`
  },
  {
    id: 'typography-monospace',
    category: 'typography',
    name: 'Monospace Editorial',
    description: 'Courier New throughout with 2–4px letter-spacing. All-caps headings, fluid sizes via clamp().',
    source: 'club-kudt',
    tags: ['typography', 'monospace', 'courier', 'editorial', 'uppercase'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;padding:24px;font-family:'Courier New',monospace;min-height:180px}
.t1{font-size:clamp(28px,5vw,48px);font-weight:900;color:#F5F0E8;letter-spacing:6px;text-transform:uppercase;line-height:1.1;margin-bottom:4px}
.t2{font-size:12px;letter-spacing:4px;color:#E8415A;text-transform:uppercase;margin-bottom:16px}
.t3{font-size:14px;letter-spacing:2px;color:#888070;line-height:1.8;max-width:320px;margin-bottom:16px}
.t4{font-size:10px;letter-spacing:3px;color:#888070;text-transform:uppercase;border-top:1px solid #2A2A2A;padding-top:12px}
</style></head><body>
<div class="t2">UPCOMING EVENT ✦ 2026</div>
<div class="t1">PRIDE<br>NIGHT</div>
<div class="t3">Queer feesten in Alkmaar. Drag, disco, pop & meer. Podium Victorie — elke maand.</div>
<div class="t4">Courier New · Letter-spacing 2–6px · clamp() fluid sizing</div>
</body></html>`,
    snippet: `/* Monospace type system */\n:root { --font-mono: 'Courier New', Courier, monospace; }\nbody { font-family: var(--font-mono); }\n\n.heading-xl { font-size: clamp(32px, 6vw, 80px); font-weight: 900; letter-spacing: 6px; text-transform: uppercase; }\n.heading-sm { font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: var(--accent); }\n.body-copy { font-size: 14px; letter-spacing: 2px; line-height: 1.8; color: var(--muted); }\n.label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); }`
  },
  {
    id: 'layout-event-grid',
    category: 'layout',
    name: '2-Col Event Card Grid',
    description: 'Grid with featured card spanning 2 columns. Hover: red border + gradient overlay + numbered badges.',
    source: 'club-kudt',
    tags: ['grid', 'cards', 'events', 'layout', 'featured'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;padding:16px;font-family:'Courier New',monospace;min-height:180px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.card{background:#1A1A1A;border:1px solid #2A2A2A;padding:16px;position:relative;transition:border-color .2s,background .2s;cursor:default}
.card:hover{border-color:#E8415A;background:#1E1010}
.card.featured{grid-column:span 2;border-color:#E8415A}
.card-tag{font-size:9px;letter-spacing:3px;color:#E8415A;margin-bottom:8px}
.card-title{font-size:14px;letter-spacing:2px;color:#F5F0E8;font-weight:700;margin-bottom:4px}
.card-date{font-size:10px;letter-spacing:1px;color:#888070}
.card-num{position:absolute;bottom:12px;right:12px;font-size:20px;color:#F5F0E8;opacity:.1;font-weight:900}
</style></head><body>
<div class="grid">
<div class="card featured"><div class="card-tag">FEATURED ✦ NEXT EVENT</div><div class="card-title">PRIDE NIGHT — PODIUM VICTORIE</div><div class="card-date">SAT 21 JUNE 2026 · 22:00 – 05:00</div><div class="card-num">001</div></div>
<div class="card"><div class="card-tag">PAST</div><div class="card-title">WINTER EDITION</div><div class="card-date">DEC 2025</div><div class="card-num">002</div></div>
<div class="card"><div class="card-tag">PAST</div><div class="card-title">SUMMER SPECIAL</div><div class="card-date">JUL 2025</div><div class="card-num">003</div></div>
</div></body></html>`,
    snippet: `.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }\n.card { background: var(--surface); border: 1px solid transparent; transition: border-color .2s, background .2s; }\n.card:hover { border-color: var(--accent); }\n.card.featured { grid-column: span 2; border-color: var(--accent); }\n\n@media (max-width: 768px) {\n  .grid { grid-template-columns: 1fr; }\n  .card.featured { grid-column: span 1; }\n}`
  },
  {
    id: 'layout-timeline',
    category: 'layout',
    name: 'Timeline Layout',
    description: 'Year column (left) + content column (right). Minimal separator lines, staggered entry animation.',
    source: 'club-kudt',
    tags: ['timeline', 'history', 'layout', 'about', 'chronology'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;padding:20px;font-family:'Courier New',monospace;min-height:180px}
.timeline{display:flex;flex-direction:column;gap:0}
.timeline-item{display:grid;grid-template-columns:80px 1fr;gap:16px;padding:16px 0;border-top:1px solid #2A2A2A}
.timeline-item:first-child{border-top:none}
.year{font-size:12px;letter-spacing:2px;color:#E8415A;padding-top:3px}
.content-title{font-size:12px;letter-spacing:2px;color:#F5F0E8;font-weight:700;margin-bottom:4px}
.content-body{font-size:10px;letter-spacing:1px;color:#888070;line-height:1.8}
</style></head><body>
<div class="timeline">
<div class="timeline-item"><div class="year">2022</div><div><div class="content-title">FOUNDED</div><div class="content-body">First edition at Podium Victorie. 120 attendees.</div></div></div>
<div class="timeline-item"><div class="year">2023</div><div><div class="content-title">EXPANSION</div><div class="content-body">Grew to monthly events. 400+ regular attendees.</div></div></div>
<div class="timeline-item"><div class="year">2026</div><div><div class="content-title">TODAY</div><div class="content-body">780+ attendees. Noord-Holland's only queer night.</div></div></div>
</div></body></html>`,
    snippet: `.timeline-item { display: grid; grid-template-columns: 80px 1fr; gap: 16px; padding: 20px 0; border-top: 1px solid var(--surface); }\n.timeline-year { font-size: 12px; letter-spacing: 2px; color: var(--accent); }\n.timeline-title { font-size: 14px; letter-spacing: 2px; color: var(--cream); font-weight: 700; margin-bottom: 8px; }\n.timeline-body { font-size: 13px; color: var(--muted); line-height: 1.8; }`
  },
  {
    id: 'form-honeypot',
    category: 'interactive',
    name: 'Form Honeypot + Rate Limit',
    description: 'Hidden field catches bots. Client-side 30s rate limiter blocks spam. Email maxlength=254 (RFC limit).',
    source: 'club-kudt',
    tags: ['form', 'honeypot', 'security', 'spam', 'rate-limit'],
    previewHtml: `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0D0D;padding:20px;font-family:'Courier New',monospace;min-height:180px;display:flex;align-items:center;justify-content:center}
form{width:100%;max-width:300px;display:flex;flex-direction:column;gap:10px}
input{background:transparent;border:1px solid #2A2A2A;border-top:none;border-left:none;border-right:none;color:#F5F0E8;font-family:'Courier New',monospace;font-size:12px;letter-spacing:2px;padding:10px 0;outline:none;transition:border-color .2s}
input:focus{border-color:#E8415A}
input::placeholder{color:#888070}
.honeypot{display:none}
button{background:transparent;border:1px solid #E8415A;color:#E8415A;font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;padding:10px;cursor:pointer;transition:background .2s}
button:hover{background:rgba(232,65,90,0.1)}
.msg{font-size:10px;letter-spacing:1px;color:#888070;min-height:16px}
</style></head><body>
<form id="f" action="https://formspree.io/f/demo" method="POST">
<input type="email" name="email" placeholder="YOUR@EMAIL.COM" maxlength="254" required>
<input type="text" name="_gotcha" class="honeypot" tabindex="-1" autocomplete="off">
<button type="submit" id="btn">SUBSCRIBE</button>
<div class="msg" id="msg"></div>
</form>
<script>
let last=0;
document.getElementById('f').addEventListener('submit',function(e){
  e.preventDefault();
  if(this._gotcha&&this._gotcha.value){return;}
  const now=Date.now();
  if(now-last<30000&&last>0){document.getElementById('msg').textContent='PLEASE WAIT 30s';return;}
  last=now;
  document.getElementById('msg').textContent='SUBSCRIBED ✦';
  document.getElementById('btn').textContent='JOINED ✦';
});
</script></body></html>`,
    snippet: `<!-- Honeypot field (hidden from users, bots fill it) -->\n<input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off">\n<input type="email" maxlength="254" required>\n\n// Rate limiter JS\nlet lastSubmit = 0;\nform.addEventListener('submit', e => {\n  if (form._gotcha && form._gotcha.value) return; // bot detected\n  const now = Date.now();\n  if (now - lastSubmit < 30000) { e.preventDefault(); alert('Please wait 30s'); return; }\n  lastSubmit = now;\n});`
  }
];

// ─── Inferred: Ashley Creative Portfolio ─────────────────────────────────────

const ASHLEY_ELEMENTS = [
  {
    id: 'ashley-palette',
    category: 'colors',
    name: 'Neutral Editorial Palette',
    description: 'White/black base with orange #FF9800 accent. Real colors from style.css — clean minimal portfolio aesthetic.',
    source: 'ashley-creative-portfolio',
    status: 'inferred',
    tags: ['palette', 'neutral', 'editorial', 'portfolio', 'minimal', 'orange'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:180px;font-family:system-ui,sans-serif;gap:16px;padding:20px}.swatches{display:flex;gap:8px}.swatch{width:44px;height:44px;border-radius:2px;border:1px solid rgba(0,0,0,.1)}.preview{background:#fff;padding:16px;border-bottom:2px solid #000;width:100%;max-width:280px;text-align:center}.preview h3{font-size:20px;color:#000;letter-spacing:4px;margin-bottom:4px}.preview p{font-size:11px;color:rgba(0,0,0,0.5);letter-spacing:1px}.preview span{color:#FF9800}</style></head><body><div class="swatches"><div class="swatch" style="background:#fff"></div><div class="swatch" style="background:rgba(0,0,0,0.05)"></div><div class="swatch" style="background:rgba(0,0,0,0.5)"></div><div class="swatch" style="background:#000"></div><div class="swatch" style="background:#FF9800"></div></div><div class="preview"><h3>ASHLEY</h3><p>Creative Director — <span>Branding & Web</span></p></div></body></html>',
    snippet: ':root {\n  --body: #fff;                      /* white bg */\n  --black: #000;                     /* primary text */\n  --text: rgba(0,0,0,0.5);           /* muted text */\n  --surface: rgba(0,0,0,0.05);       /* subtle surface */\n  --accent: #FF9800;                 /* orange accent (real from CSS) */\n  --button: #1C2539;                 /* dark button */\n}'
  },
  {
    id: 'ashley-typography',
    category: 'typography',
    name: 'Outfit — Clean Geometric Sans',
    description: 'Outfit font (real from style.css) — modern geometric sans used at all weights. No serif. Letter-spacing for labels.',
    source: 'ashley-creative-portfolio',
    status: 'inferred',
    tags: ['typography', 'sans', 'geometric', 'outfit', 'portfolio', 'clean'],
    previewHtml: '<!DOCTYPE html><html><head><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff;padding:24px;min-height:180px;display:flex;flex-direction:column;justify-content:center;gap:8px}.t1{font-family:"Outfit",sans-serif;font-size:42px;font-weight:700;color:#000;line-height:1.05;letter-spacing:-1px}.t2{font-family:"Outfit",sans-serif;font-size:14px;font-weight:500;color:rgba(0,0,0,0.5);letter-spacing:2px;text-transform:uppercase}.t3{font-family:"Outfit",sans-serif;font-size:13px;font-weight:300;color:rgba(0,0,0,0.5);line-height:1.7;margin-top:4px}.accent{color:#FF9800}</style></head><body><div class="t2">Creative Director</div><div class="t1">Ashley <span class="accent">Design</span></div><div class="t3">Branding, web design and visual identity for brands that stand out.</div></body></html>',
    snippet: '/* Real font from Ashley style.css */\n@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");\n\nbody { font-family: "Outfit", sans-serif; color: rgba(0,0,0,0.5); }\n.heading { font-family: "Outfit", sans-serif; font-weight: 700; color: #000; letter-spacing: -1px; }\n.label { font-family: "Outfit", sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); }'
  },
  {
    id: 'ashley-split-hero',
    category: 'hero',
    name: 'Split Hero',
    description: 'Full-height hero split 50/50: name + title left, portrait/image placeholder right. Clean editorial entry.',
    source: 'ashley-creative-portfolio',
    status: 'inferred',
    tags: ['hero', 'split', 'portfolio', 'layout', 'fullscreen'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#F8F6F2;min-height:180px;font-family:Georgia,serif;display:flex}.left{flex:1;display:flex;flex-direction:column;justify-content:center;padding:24px;border-right:1px solid #E0DDD8}.label{font-size:9px;letter-spacing:3px;color:#C0392B;text-transform:uppercase;margin-bottom:8px;font-family:system-ui,sans-serif}.name{font-size:28px;font-weight:700;color:#222;line-height:1.1;margin-bottom:4px}.role{font-size:13px;color:#888;font-style:italic;margin-bottom:16px}.cta{font-size:9px;letter-spacing:2px;color:#222;border-bottom:1px solid #222;padding-bottom:2px;display:inline-block;font-family:system-ui,sans-serif;text-transform:uppercase}.right{flex:1;background:#E8E4DC;display:flex;align-items:center;justify-content:center}.img-slot{width:80px;height:80px;border-radius:50%;background:#ccc;display:flex;align-items:center;justify-content:center;font-size:9px;letter-spacing:1px;color:#888;font-family:system-ui,sans-serif}</style></head><body><div class="left"><div class="label">Available for work</div><div class="name">Ashley<br>Johnson</div><div class="role">Creative Director</div><div class="cta">View Work ↓</div></div><div class="right"><div class="img-slot">PHOTO</div></div></body></html>',
    snippet: '.hero { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }\n.hero-left { display: flex; flex-direction: column; justify-content: center; padding: clamp(40px, 8vw, 100px); }\n.hero-right { background: var(--surface); /* swap for portrait img */ }\n\n@media (max-width: 768px) {\n  .hero { grid-template-columns: 1fr; }\n  .hero-right { height: 40vh; }\n}'
  },
  {
    id: 'ashley-portfolio-grid',
    category: 'layout',
    name: 'Portfolio Case Study Grid',
    description: 'Image grid where hovering darkens the photo and slides in the project title + category from below.',
    source: 'ashley-creative-portfolio',
    status: 'inferred',
    tags: ['portfolio', 'grid', 'hover', 'reveal', 'case-study'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#F8F6F2;padding:16px;min-height:180px;font-family:system-ui,sans-serif}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.item{position:relative;overflow:hidden;aspect-ratio:4/3;background:#E0DDD8;cursor:pointer}.overlay{position:absolute;inset:0;background:rgba(34,34,34,0);display:flex;flex-direction:column;justify-content:flex-end;padding:12px;transition:background .3s}.item:hover .overlay{background:rgba(34,34,34,0.75)}.info{transform:translateY(20px);opacity:0;transition:transform .3s,opacity .3s}.item:hover .info{transform:translateY(0);opacity:1}.proj-title{font-size:11px;font-weight:600;color:#F8F6F2;letter-spacing:1px}.proj-cat{font-size:9px;letter-spacing:2px;color:#C0392B;text-transform:uppercase;margin-top:2px}.num{position:absolute;top:8px;right:8px;font-size:9px;letter-spacing:2px;color:#888}</style></head><body><div class="grid"><div class="item"><div class="num">01</div><div class="overlay"><div class="info"><div class="proj-title">Brand Identity</div><div class="proj-cat">Branding</div></div></div></div><div class="item"><div class="num">02</div><div class="overlay"><div class="info"><div class="proj-title">Web Design</div><div class="proj-cat">Digital</div></div></div></div><div class="item"><div class="num">03</div><div class="overlay"><div class="info"><div class="proj-title">Print Work</div><div class="proj-cat">Editorial</div></div></div></div></div></body></html>',
    snippet: '.portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }\n.portfolio-item { position: relative; overflow: hidden; aspect-ratio: 4/3; }\n.portfolio-overlay { position: absolute; inset: 0; background: transparent; transition: background .3s; display: flex; flex-direction: column; justify-content: flex-end; padding: 20px; }\n.portfolio-item:hover .portfolio-overlay { background: rgba(0,0,0,0.7); }\n.portfolio-info { transform: translateY(20px); opacity: 0; transition: transform .3s, opacity .3s; }\n.portfolio-item:hover .portfolio-info { transform: translateY(0); opacity: 1; }'
  },
  {
    id: 'ashley-project-overlay',
    category: 'interactive',
    name: 'Project Lightbox Overlay',
    description: 'Full-screen modal overlay with project details, image, and close button. Triggered on portfolio card click.',
    source: 'ashley-creative-portfolio',
    status: 'inferred',
    tags: ['lightbox', 'modal', 'overlay', 'portfolio', 'fullscreen'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#F8F6F2;min-height:180px;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center}.trigger{padding:10px 20px;border:1px solid #222;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;background:transparent;font-family:inherit;transition:background .2s}.trigger:hover{background:#222;color:#F8F6F2}.overlay{position:fixed;inset:0;background:rgba(248,246,242,0.97);display:none;align-items:center;justify-content:center;z-index:100}.overlay.open{display:flex}.modal{max-width:500px;width:90%;padding:32px;position:relative}.close{position:absolute;top:16px;right:16px;background:none;border:none;font-size:18px;cursor:pointer;color:#888}.img-slot{width:100%;height:120px;background:#E0DDD8;margin-bottom:16px;display:flex;align-items:center;justify-content:center;font-size:10px;letter-spacing:2px;color:#888}.proj-label{font-size:9px;letter-spacing:3px;color:#C0392B;text-transform:uppercase;margin-bottom:6px}.proj-title{font-family:Georgia,serif;font-size:22px;color:#222;margin-bottom:8px}.proj-desc{font-size:12px;color:#666;line-height:1.7}</style></head><body><button class="trigger" onclick="document.getElementById(\'ov\').classList.add(\'open\')">VIEW PROJECT</button><div class="overlay" id="ov"><div class="modal"><button class="close" onclick="document.getElementById(\'ov\').classList.remove(\'open\')">✕</button><div class="img-slot">PROJECT IMAGE</div><div class="proj-label">Branding</div><div class="proj-title">Brand Identity</div><div class="proj-desc">Full brand identity system including logo, color palette, and typography guidelines.</div></div></div></body></html>',
    snippet: '// Lightbox JS\nconst overlay = document.getElementById("overlay");\ndocument.querySelectorAll(".portfolio-item").forEach(item => {\n  item.addEventListener("click", () => {\n    overlay.classList.add("open");\n    document.body.style.overflow = "hidden";\n  });\n});\ndocument.getElementById("overlay-close").addEventListener("click", () => {\n  overlay.classList.remove("open");\n  document.body.style.overflow = "";\n});\n\n.overlay { position: fixed; inset: 0; background: rgba(248,246,242,0.97); opacity: 0; pointer-events: none; transition: opacity .3s; }\n.overlay.open { opacity: 1; pointer-events: all; }'
  },
  {
    id: 'ashley-page-transition',
    category: 'animations',
    name: 'Curtain Page Transition',
    description: 'Dark curtain sweeps across the screen on navigation, then retracts to reveal the new page.',
    source: 'ashley-creative-portfolio',
    status: 'inferred',
    tags: ['transition', 'page', 'animation', 'curtain', 'navigation'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#F8F6F2;overflow:hidden;min-height:180px;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif}.page{text-align:center}.page-title{font-size:24px;color:#222;margin-bottom:16px}.trigger{padding:8px 20px;border:1px solid #222;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;background:transparent;font-family:system-ui,sans-serif}.curtain{position:fixed;inset:0;background:#222;transform:scaleX(0);transform-origin:left;transition:transform .4s cubic-bezier(.77,0,.175,1);z-index:100}.curtain.enter{transform:scaleX(1);transform-origin:left}.curtain.exit{transform:scaleX(0);transform-origin:right}</style></head><body><div class="curtain" id="curtain"></div><div class="page"><div class="page-title">Page Title</div><button class="trigger" onclick="runTransition()">NAVIGATE →</button></div><script>function runTransition(){const c=document.getElementById("curtain");c.classList.add("enter");setTimeout(()=>{c.classList.remove("enter");c.classList.add("exit");setTimeout(()=>c.classList.remove("exit"),400);},400);}</script></body></html>',
    snippet: '// Curtain transition\nconst curtain = document.getElementById("curtain");\nfunction navigateTo(url) {\n  curtain.classList.add("enter"); // sweep in\n  setTimeout(() => {\n    window.location.href = url;\n  }, 400);\n}\n// On new page load:\nwindow.addEventListener("load", () => {\n  curtain.classList.add("exit"); // sweep out\n});\n\n.curtain { position: fixed; inset: 0; background: var(--text); transform: scaleX(1); transform-origin: right; transition: transform .4s cubic-bezier(.77,0,.175,1); }\n.curtain.exit { transform: scaleX(0); }'
  },
  {
    id: 'ashley-underline-nav',
    category: 'interactive',
    name: 'Expanding Underline Nav',
    description: 'Nav links with an underline that expands from center on hover. Clean, minimal interaction.',
    source: 'ashley-creative-portfolio',
    status: 'inferred',
    tags: ['nav', 'underline', 'hover', 'animation', 'minimal'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#F8F6F2;display:flex;align-items:center;justify-content:center;min-height:180px;font-family:system-ui,sans-serif}nav{display:flex;gap:32px;align-items:center}.nav-logo{font-family:Georgia,serif;font-size:16px;font-weight:700;color:#222;margin-right:16px}.nav-link{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#555;text-decoration:none;position:relative;padding-bottom:4px}.nav-link::after{content:"";position:absolute;bottom:0;left:50%;right:50%;height:1px;background:#C0392B;transition:left .2s ease,right .2s ease}.nav-link:hover::after{left:0;right:0}.nav-link:hover{color:#222}</style></head><body><nav><div class="nav-logo">A.</div><a class="nav-link">Work</a><a class="nav-link">About</a><a class="nav-link">Services</a><a class="nav-link">Contact</a></nav></body></html>',
    snippet: '.nav-link { position: relative; padding-bottom: 4px; text-decoration: none; }\n.nav-link::after {\n  content: "";\n  position: absolute;\n  bottom: 0;\n  left: 50%;\n  right: 50%;\n  height: 1px;\n  background: var(--accent);\n  transition: left .2s ease, right .2s ease;\n}\n.nav-link:hover::after { left: 0; right: 0; }'
  }
];

// ─── Inferred: FoodKing Fast Food Restaurant ──────────────────────────────────

const FOODKING_ELEMENTS = [
  {
    id: 'foodking-palette',
    category: 'colors',
    name: 'Bold Energy Palette',
    description: 'Green (#00813D) primary, red (#D12525) accent, amber (#FFB936) highlight, dark header (#212121). Real extracted from main.css.',
    source: 'foodking-fast-food-restaurant',
    status: 'inferred',
    tags: ['palette', 'green', 'red', 'amber', 'bold', 'restaurant', 'energy'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:180px;font-family:"Barlow Condensed","Arial Narrow",sans-serif;gap:16px;padding:20px}.swatches{display:flex;gap:8px}.swatch{width:44px;height:44px;border-radius:2px;border:1px solid rgba(0,0,0,.1)}.preview{background:#212121;border-left:4px solid #00813D;padding:14px 16px;width:100%;max-width:280px}.preview h3{font-size:22px;color:#FFB936;letter-spacing:3px;text-transform:uppercase}.preview p{font-size:11px;color:#aaa;letter-spacing:1px;margin-top:4px}.preview .price{font-size:18px;color:#D12525;margin-top:6px;font-weight:900}</style></head><body><div class="swatches"><div class="swatch" style="background:#00813D"></div><div class="swatch" style="background:#D12525"></div><div class="swatch" style="background:#FFB936"></div><div class="swatch" style="background:#212121"></div><div class="swatch" style="background:#F4F1EA;border:1px solid #ddd"></div></div><div class="preview"><h3>FOODKING</h3><p>Burgers · Fries · Shakes</p><div class="price">FROM €5.99</div></div></body></html>',
    snippet: ':root {\n  --theme: #00813D;    /* primary green */\n  --theme2: #D12525;   /* red accent */\n  --theme3: #FFB936;   /* amber highlight */\n  --header: #212121;   /* dark header */\n  --text: #5C5C5B;     /* body text */\n  --bg: #F4F1EA;       /* light background */\n  --ratting: #FF9F0D;  /* star rating */\n}'
  },
  {
    id: 'foodking-typography',
    category: 'typography',
    name: 'Condensed Heavy Display',
    description: 'Barlow Condensed (real font from main.css) at large sizes, all-caps, tight tracking. DM Sans for body copy.',
    source: 'foodking-fast-food-restaurant',
    status: 'inferred',
    tags: ['typography', 'condensed', 'barlow', 'bold', 'restaurant', 'display'],
    previewHtml: '<!DOCTYPE html><html><head><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#212121;padding:20px;min-height:180px;display:flex;flex-direction:column;justify-content:center;gap:6px}.t1{font-family:"Barlow Condensed",sans-serif;font-size:52px;font-weight:900;color:#FFB936;letter-spacing:2px;text-transform:uppercase;line-height:1}.t2{font-family:"Barlow Condensed",sans-serif;font-size:16px;font-weight:700;color:#00813D;letter-spacing:4px;text-transform:uppercase}.t3{font-family:"DM Sans",system-ui,sans-serif;font-size:12px;color:#aaa;letter-spacing:1px;line-height:1.6;margin-top:4px}.label{font-size:9px;letter-spacing:3px;color:#555;font-family:"DM Sans",sans-serif;margin-top:8px}</style></head><body><div class="t2">NEW ARRIVAL</div><div class="t1">KING<br>BURGER</div><div class="t3">Double smashed patty · Cheddar · Special sauce</div><div class="label">Barlow Condensed 900 + DM Sans body</div></body></html>',
    snippet: '/* Real fonts from FoodKing main.css */\n@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=DM+Sans:wght@400;500&display=swap");\n\n.heading-xl { font-family: "Barlow Condensed", sans-serif; font-weight: 900; font-size: clamp(48px, 10vw, 120px); text-transform: uppercase; letter-spacing: 2px; color: var(--theme3); }\n.heading-label { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: var(--theme); }\nbody { font-family: "DM Sans", sans-serif; color: var(--text); }'
  },
  {
    id: 'foodking-hero-food',
    category: 'hero',
    name: 'Full-Bleed Food Hero',
    description: 'Full-viewport hero with darkened food photography background, bold headline, and pulsing ORDER NOW CTA.',
    source: 'foodking-fast-food-restaurant',
    status: 'inferred',
    tags: ['hero', 'food', 'fullbleed', 'restaurant', 'CTA'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{margin:0}hero{display:flex;align-items:center;justify-content:center;min-height:180px;background:linear-gradient(135deg,#1a2a1a 0%,#212121 50%,#0F0F0F 100%);position:relative;overflow:hidden}.bg-text{position:absolute;font-family:"Barlow Condensed",Impact,sans-serif;font-size:120px;color:rgba(0,129,61,0.07);white-space:nowrap;letter-spacing:8px;user-select:none;top:50%;transform:translateY(-50%)}.content{position:relative;text-align:center;z-index:1}.eyebrow{font-family:system-ui,sans-serif;font-size:9px;letter-spacing:4px;color:#FFB936;text-transform:uppercase;margin-bottom:8px}.title{font-family:"Barlow Condensed",Impact,sans-serif;font-size:48px;color:#fff;letter-spacing:4px;text-transform:uppercase;line-height:1;margin-bottom:12px}.title span{color:#00813D}.cta{background:#00813D;border:none;color:#fff;font-family:"Barlow Condensed",sans-serif;font-size:13px;letter-spacing:3px;padding:12px 28px;cursor:pointer;animation:pulse 2s ease-in-out infinite}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,129,61,0.4)}50%{box-shadow:0 0 0 10px rgba(0,129,61,0)}}</style></head><body><hero><div class="bg-text">FOODKING FOODKING</div><div class="content"><div class="eyebrow">Freshly Made Daily</div><div class="title">FEED THE<br><span>KING</span></div><button class="cta">ORDER NOW</button></div></hero></body></html>',
    snippet: '.hero { position: relative; min-height: 100vh; background: url("hero-food.jpg") center/cover; display: flex; align-items: center; justify-content: center; }\n.hero::after { content: ""; position: absolute; inset: 0; background: rgba(33,33,33,0.65); }\n.hero-content { position: relative; z-index: 1; text-align: center; }\n\n/* Pulsing CTA — FoodKing green */\n@keyframes cta-pulse {\n  0%, 100% { box-shadow: 0 0 0 0 rgba(0,129,61,.5); }\n  50% { box-shadow: 0 0 0 12px rgba(0,129,61,0); }\n}\n.cta-order { background: var(--theme); animation: cta-pulse 2s ease-in-out infinite; }'
  },
  {
    id: 'foodking-menu-grid',
    category: 'layout',
    name: 'Menu Card Grid',
    description: 'Grid of food cards: image placeholder, item name, description, price tag, and "Add" CTA. Hover lifts card.',
    source: 'foodking-fast-food-restaurant',
    status: 'inferred',
    tags: ['menu', 'grid', 'cards', 'restaurant', 'layout', 'food'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0F0F0F;padding:14px;min-height:180px;font-family:system-ui,sans-serif}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.card{background:#1A0A0A;border:1px solid #2A1A1A;overflow:hidden;transition:transform .2s,border-color .2s;cursor:pointer}.card:hover{transform:translateY(-4px);border-color:#C0001A}.img{height:60px;background:linear-gradient(135deg,#2A0808,#1A1A0A);display:flex;align-items:center;justify-content:center;font-size:9px;letter-spacing:2px;color:#555}.body{padding:8px}.name{font-size:11px;font-weight:700;color:#F5F0E8;letter-spacing:1px;margin-bottom:2px;font-family:Impact,sans-serif;text-transform:uppercase}.desc{font-size:8px;color:#888;line-height:1.4;margin-bottom:6px}.footer{display:flex;align-items:center;justify-content:space-between}.price{font-size:13px;font-weight:900;color:#F5A623;font-family:Impact,sans-serif}.add{background:#C0001A;border:none;color:#fff;font-size:8px;letter-spacing:1px;padding:4px 8px;cursor:pointer;font-family:inherit}</style></head><body><div class="grid"><div class="card"><div class="img">📷 PHOTO</div><div class="body"><div class="name">King Burger</div><div class="desc">Double patty, cheddar, sauce</div><div class="footer"><div class="price">€8.99</div><button class="add">ADD</button></div></div></div><div class="card"><div class="img">📷 PHOTO</div><div class="body"><div class="name">Crispy Fries</div><div class="desc">Seasoned, large portion</div><div class="footer"><div class="price">€3.49</div><button class="add">ADD</button></div></div></div><div class="card"><div class="img">📷 PHOTO</div><div class="body"><div class="name">Shake</div><div class="desc">Vanilla, choc or strawberry</div><div class="footer"><div class="price">€4.29</div><button class="add">ADD</button></div></div></div></div></body></html>',
    snippet: '.menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }\n.menu-card { background: var(--surface); border: 1px solid transparent; transition: transform .2s, border-color .2s; overflow: hidden; }\n.menu-card:hover { transform: translateY(-4px); border-color: var(--red); }\n.menu-card-img { aspect-ratio: 4/3; object-fit: cover; width: 100%; background: var(--surface); }\n.menu-card-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px; }\n.menu-price { font-family: var(--font-display); color: var(--gold); font-size: 1.4rem; }'
  },
  {
    id: 'foodking-sticky-order',
    category: 'interactive',
    name: 'Mobile Sticky Order Bar',
    description: 'Fixed bottom bar with "ORDER NOW" button always visible on mobile. Disappears on desktop where inline CTAs suffice.',
    source: 'foodking-fast-food-restaurant',
    status: 'inferred',
    tags: ['mobile', 'sticky', 'CTA', 'order', 'restaurant', 'fixed'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0F0F0F;min-height:180px;font-family:system-ui,sans-serif}.content{padding:20px;color:#888;font-size:10px;letter-spacing:2px;line-height:2;padding-bottom:70px}.sticky-bar{position:fixed;bottom:0;left:0;right:0;background:rgba(15,15,15,0.97);border-top:1px solid #C0001A;padding:12px 20px;display:flex;align-items:center;justify-content:space-between}.bar-info{font-size:10px;letter-spacing:2px;color:#888}.bar-info span{color:#F5A623;font-weight:700}.order-btn{background:#C0001A;border:none;color:#fff;font-family:Impact,sans-serif;font-size:13px;letter-spacing:3px;padding:10px 24px;cursor:pointer;text-transform:uppercase}</style></head><body><div class="content"><p>MENU CONTENT ABOVE ↑</p><p>.</p><p>.</p></div><div class="sticky-bar"><div class="bar-info">🛒 <span>3 items</span> — €21.47</div><button class="order-btn">ORDER NOW</button></div></body></html>',
    snippet: '.sticky-order-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(15,15,15,.97); border-top: 2px solid var(--red); padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; z-index: 100; }\n\n@media (min-width: 1024px) {\n  .sticky-order-bar { display: none; } /* hide on desktop */\n}'
  },
  {
    id: 'foodking-promo-banner',
    category: 'animations',
    name: 'Flashing Promo Ribbon',
    description: 'Red ribbon with animated flashing discount text. Bold attention-grabber for deals and limited offers.',
    source: 'foodking-fast-food-restaurant',
    status: 'inferred',
    tags: ['promo', 'banner', 'animation', 'flash', 'discount', 'restaurant'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0F0F0F;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:180px;font-family:Impact,"Arial Narrow",sans-serif;gap:12px}.ribbon{width:100%;background:#C0001A;padding:12px 20px;display:flex;align-items:center;justify-content:center;gap:16px;position:relative;overflow:hidden}.ribbon::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 10px,transparent 10px,transparent 20px)}.flash{font-size:22px;letter-spacing:4px;color:#F5A623;animation:flash 1.2s ease-in-out infinite;text-transform:uppercase}@keyframes flash{0%,100%{opacity:1}50%{opacity:.4}}.pill{background:#F5A623;color:#0F0F0F;font-size:11px;letter-spacing:2px;padding:4px 12px;font-weight:900}.sub{font-size:10px;letter-spacing:3px;color:rgba(245,160,35,0.6)}</style></head><body><div class="ribbon"><span class="sub">LIMITED TIME</span><span class="flash">50% OFF</span><span class="pill">TODAY ONLY</span></div></body></html>',
    snippet: '.promo-ribbon { background: var(--red); padding: 12px 20px; display: flex; align-items: center; justify-content: center; gap: 16px; }\n.promo-text { font-family: var(--font-display); font-size: 1.5rem; letter-spacing: 4px; color: var(--gold); animation: promo-flash 1.2s ease-in-out infinite; }\n@keyframes promo-flash {\n  0%, 100% { opacity: 1; }\n  50% { opacity: .4; }\n}'
  },
  {
    id: 'foodking-hours-table',
    category: 'layout',
    name: 'Opening Hours Table',
    description: "Clean hours table with today's row highlighted in red/gold. Shows open/closed status dynamically.",
    source: 'foodking-fast-food-restaurant',
    status: 'inferred',
    tags: ['hours', 'table', 'restaurant', 'layout', 'schedule'],
    previewHtml: '<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0F0F0F;padding:16px;min-height:180px;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center}.hours{width:100%;max-width:280px}.h-title{font-family:Impact,sans-serif;font-size:16px;letter-spacing:4px;color:#F5A623;text-transform:uppercase;margin-bottom:12px}.row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #1A1A1A;font-size:11px}.row.today{background:rgba(192,0,26,0.1);margin:0 -8px;padding:7px 8px;border-color:#C0001A}.day{color:#888;letter-spacing:1px}.time{color:#F5F0E8;letter-spacing:1px}.row.today .day{color:#F5A623;font-weight:700}.row.today .time{color:#C0001A}.badge{font-size:8px;letter-spacing:2px;background:#C0001A;color:#fff;padding:2px 6px;margin-left:6px}</style></head><body><div class="hours"><div class="h-title">Hours</div><div class="row"><span class="day">Mon – Thu</span><span class="time">11:00 – 22:00</span></div><div class="row today"><span class="day">Friday <span class="badge">TODAY</span></span><span class="time">11:00 – 23:00</span></div><div class="row"><span class="day">Saturday</span><span class="time">10:00 – 23:00</span></div><div class="row"><span class="day">Sunday</span><span class="time">12:00 – 21:00</span></div></div></body></html>',
    snippet: "// Highlight today's row\nconst days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];\nconst today = days[new Date().getDay()];\ndocument.querySelector(`[data-day='${today}']`)?.classList.add('today');\n\n.hours-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--surface); }\n.hours-row.today { background: rgba(192,0,26,0.1); color: var(--gold); font-weight: 700; }"
  }
];

// ─── Generic site analyzer ────────────────────────────────────────────────────

function readFilesRecursive(dir, exts = ['.html', '.css', '.js']) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      results.push(...readFilesRecursive(full, exts));
    } else if (entry.isFile() && exts.some(e => entry.name.endsWith(e))) {
      try { results.push({ path: full, content: fs.readFileSync(full, 'utf8') }); } catch {}
    }
  }
  return results;
}

function extractColors(files) {
  const colors = new Set();
  for (const { content } of files) {
    const matches = content.matchAll(/--[\w-]+\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g);
    for (const m of matches) colors.add(m[1]);
    const hexMatches = content.matchAll(/#([0-9a-fA-F]{6})\b/g);
    for (const m of hexMatches) colors.add('#' + m[1]);
  }
  return [...colors].slice(0, 20);
}

function extractFonts(files) {
  const fonts = new Set();
  for (const { content } of files) {
    const matches = content.matchAll(/font-family\s*:\s*([^;}\n]+)/g);
    for (const m of matches) fonts.add(m[1].trim().replace(/['"]/g, '').split(',')[0]);
    const imports = content.matchAll(/@import url\(['"](https?:\/\/fonts\.googleapis\.com[^'"]+)['"]\)/g);
    for (const m of imports) fonts.add('Google Font: ' + m[1]);
  }
  return [...fonts].filter(f => f.length < 60);
}

function detectComponents(files) {
  const detected = [];
  const all = files.map(f => f.content).join('\n');
  if (/canvas/i.test(all) && /particle|fillRect|arc\(/i.test(all)) detected.push('Canvas Particles');
  if (/cursor\b.*fixed|fixed.*cursor\b/i.test(all) && /mousemove/i.test(all)) detected.push('Custom Cursor');
  if (/feTurbulence|feDisplacementMap/i.test(all)) detected.push('SVG Glitch Filter');
  if (/magnetic|data-magnetic/i.test(all)) detected.push('Magnetic Button');
  if (/tilt|rotateX.*rotateY/i.test(all)) detected.push('3D Tilt Card');
  if (/preloader|#preloader/i.test(all)) detected.push('Preloader');
  if (/@keyframes\s+ticker|marquee/i.test(all)) detected.push('Marquee Ticker');
  if (/konami|↑↑↓↓/i.test(all) || /38,38,40,40/i.test(all)) detected.push('Konami Easter Egg');
  if (/<audio|MusicPlayer|PlayerContext/i.test(all)) detected.push('Music Player');
  if (/progress.*scroll|scroll.*progress/i.test(all)) detected.push('Scroll Progress Bar');
  if (/ScrollTrigger|gsap\./i.test(all)) detected.push('GSAP / ScrollTrigger');
  if (/IntersectionObserver/i.test(all)) detected.push('IntersectionObserver Reveals');
  if (/_gotcha|honeypot/i.test(all)) detected.push('Form Honeypot');
  if (/parallax|scrub/i.test(all)) detected.push('Parallax');
  return detected;
}

function analyzeUploadedSite(siteDir, siteName) {
  const files = readFilesRecursive(siteDir);
  if (files.length === 0) return null;

  const colors = extractColors(files);
  const fonts = extractFonts(files);
  const components = detectComponents(files);
  const pageCount = files.filter(f => f.path.endsWith('.html')).length;

  return {
    id: siteName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: siteName,
    path: siteDir,
    stats: { files: files.length, pages: pageCount },
    colors,
    fonts,
    detectedComponents: components
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Always include Club KUDT
  const sites = [
    {
      id: 'club-kudt',
      name: 'Club KUDT',
      path: CLUB_KUDT_DIR,
      stats: { files: 6, pages: 6 },
      colors: ['#0D0D0D', '#1A1A1A', '#888070', '#F5F0E8', '#E8415A'],
      fonts: ['Courier New'],
      detectedComponents: CLUB_KUDT_ELEMENTS.map(e => e.name)
    }
  ];

  // Scan uploaded sites
  if (fs.existsSync(SOURCE_SITES_DIR)) {
    for (const entry of fs.readdirSync(SOURCE_SITES_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const siteDir = path.join(SOURCE_SITES_DIR, entry.name);
      process.stderr.write(`[studio] Analyzing ${entry.name}...\n`);
      const result = analyzeUploadedSite(siteDir, entry.name);
      if (result) {
        sites.push(result);
        process.stderr.write(`[studio]   ${result.stats.pages} pages, ${result.detectedComponents.length} components detected\n`);
      }
    }
  }

  // Add inferred sites (files not yet uploaded)
  const inferredSites = [
    {
      id: 'ashley-creative-portfolio',
      name: 'Ashley Creative Portfolio',
      path: null,
      status: 'inferred',
      stats: { files: 0, pages: 0 },
      colors: ['#F8F6F2', '#E8E4DC', '#888888', '#222222', '#C0392B'],
      fonts: ['Playfair Display', 'Inter'],
      detectedComponents: ASHLEY_ELEMENTS.map(e => e.name)
    },
    {
      id: 'foodking-fast-food-restaurant',
      name: 'FoodKing Restaurant',
      path: null,
      status: 'inferred',
      stats: { files: 0, pages: 0 },
      colors: ['#0F0F0F', '#1A0A0A', '#C0001A', '#F5A623', '#F5F0E8'],
      fonts: ['Barlow Condensed', 'Impact'],
      detectedComponents: FOODKING_ELEMENTS.map(e => e.name)
    }
  ];

  // Only add inferred sites if real files haven't been uploaded yet
  for (const inferred of inferredSites) {
    const uploaded = sites.find(s => s.id === inferred.id);
    if (!uploaded) {
      sites.push(inferred);
      process.stderr.write(`[studio] Added inferred entries for ${inferred.name} (upload files to override)\n`);
    }
  }

  // Build element catalog — start with Club KUDT hardcoded elements
  // When real files exist, include the component entries but strip 'inferred' status
  const ashleyUploaded = sites.find(s => s.id === 'ashley-creative-portfolio' && s.status !== 'inferred');
  const foodkingUploaded = sites.find(s => s.id === 'foodking-fast-food-restaurant' && s.status !== 'inferred');
  const promoteDetected = (arr) => arr.map(e => e.status === 'inferred' ? { ...e, status: 'detected' } : e);
  const elements = [
    ...CLUB_KUDT_ELEMENTS,
    ...(ashleyUploaded ? promoteDetected(ASHLEY_ELEMENTS) : ASHLEY_ELEMENTS),
    ...(foodkingUploaded ? promoteDetected(FOODKING_ELEMENTS) : FOODKING_ELEMENTS)
  ];

  // For uploaded sites, generate generic color/typography entries
  for (const site of sites.slice(1)) {
    if (site.colors.length > 3) {
      elements.push({
        id: `${site.id}-palette`,
        category: 'colors',
        name: `${site.name} — Color Palette`,
        description: `Colors extracted from ${site.name}: ${site.colors.slice(0, 5).join(', ')}`,
        source: site.id,
        tags: ['palette', 'colors'],
        previewHtml: generatePalettePreview(site.name, site.colors.slice(0, 6)),
        snippet: `:root {\n${site.colors.slice(0, 6).map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`
      });
    }
    if (site.fonts.length > 0) {
      elements.push({
        id: `${site.id}-typography`,
        category: 'typography',
        name: `${site.name} — Typography`,
        description: `Fonts used: ${site.fonts.slice(0, 3).join(', ')}`,
        source: site.id,
        tags: ['typography', 'font'],
        previewHtml: generateTypographyPreview(site.name, site.fonts[0]),
        snippet: `font-family: '${site.fonts[0]}', sans-serif;`
      });
    }
  }

  const catalog = {
    generated: new Date().toISOString().slice(0, 10),
    sites,
    elements,
    categories: ['colors', 'typography', 'animations', 'interactive', 'hero', 'layout']
  };

  // Write catalog.json
  fs.writeFileSync(path.join(OUTPUT_DIR, 'catalog.json'), JSON.stringify(catalog, null, 2));

  // Write catalog.js (window.CATALOG for browser use without a server)
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'catalog.js'),
    `/* Generated by scripts/studio/analyze-styles.js — ${catalog.generated} */\nwindow.CATALOG = ${JSON.stringify(catalog, null, 2)};\n`
  );

  process.stderr.write(`[studio] Done — ${elements.length} elements from ${sites.length} site(s)\n`);
  process.stderr.write(`[studio] Output: ${OUTPUT_DIR}\n`);
}

function generatePalettePreview(name, colors) {
  const swatches = colors.map(c => `<div style="width:40px;height:40px;background:${c};flex-shrink:0;border-radius:2px"></div>`).join('');
  return `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#111;padding:20px;font-family:'Courier New',monospace;min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}</style></head><body><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">${swatches}</div><div style="font-size:10px;letter-spacing:2px;color:#666">${colors.join('  ')}</div></body></html>`;
}

function generateTypographyPreview(name, font) {
  return `<!DOCTYPE html><html><head><style>*{margin:0;padding:0}body{background:#0D0D0D;padding:24px;min-height:180px;display:flex;flex-direction:column;justify-content:center;gap:8px}</style></head><body><div style="font-family:'${font}',sans-serif;font-size:36px;font-weight:900;color:#F5F0E8;letter-spacing:4px">HEADLINE</div><div style="font-family:'${font}',sans-serif;font-size:14px;color:#888070;letter-spacing:2px">Body copy — ${name}</div><div style="font-family:'${font}',sans-serif;font-size:10px;color:#666;letter-spacing:3px;margin-top:8px">${font.toUpperCase()}</div></body></html>`;
}

main();
