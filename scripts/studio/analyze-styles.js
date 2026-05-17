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

  // Build element catalog — start with Club KUDT hardcoded elements
  const elements = [...CLUB_KUDT_ELEMENTS];

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
