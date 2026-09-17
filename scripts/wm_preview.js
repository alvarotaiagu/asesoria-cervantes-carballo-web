const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const wm = JSON.parse(fs.readFileSync('wordmark.json', 'utf8'));
const L = wm.trazos.reduce((a, t) => a + t.len, 0);
// cada trazo ocupa una fraccion del tiempo proporcional a su longitud
let acc = 0;
const tramos = wm.trazos.map(t => { const a = acc / L; acc += t.len; return { a, b: acc / L, d: t.d }; });
const frame = p => `<!doctype html><meta charset=utf-8><style>
 body{margin:0;background:#F4F0E8;display:grid;place-items:center;height:100vh}
 svg{width:92vw} .t{fill:none;stroke:#8CAA88;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
 .f{fill:#22332B}</style>
<svg viewBox="${wm.viewBox}">
 <g>${tramos.map(t => {
   const local = Math.max(0, Math.min(1, (p - t.a) / (t.b - t.a)));
   return `<path class="t" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${(1 - local).toFixed(4)}" d="${t.d}"/>`;
 }).join('')}</g>
 <path class="f" style="opacity:${p >= 1 ? 1 : 0}" d="${wm.fill}"/>
</svg>`;
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1100, height: 420 }, deviceScaleFactor: 2 });
  for (const p of [0.18, 0.4, 0.62, 0.85, 1]) {
    await pg.setContent(frame(p));
    await pg.screenshot({ path: `wm-${String(Math.round(p * 100)).padStart(3, '0')}.png` });
  }
  await b.close();
  console.log('frames listos');
})();
