const { chromium } = require('playwright');
const fs = require('fs');
const wm = JSON.parse(fs.readFileSync('wordmark.json', 'utf8'));
const html = `<!doctype html><meta charset=utf-8>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
 html,body{margin:0;width:1200px;height:630px}
 body{background:
   radial-gradient(60% 50% at 50% 24%, rgba(140,170,136,.16), transparent 70%),
   radial-gradient(48% 42% at 86% 88%, rgba(232,180,105,.13), transparent 72%), #F4F0E8;
   display:flex;flex-direction:column;align-items:center;justify-content:center;
   font-family:Newsreader,Georgia,serif;color:#22332B;text-align:center}
 svg{width:720px;display:block;margin-bottom:26px}
 .sub{font-style:italic;font-size:30px;color:#3B4E44;margin:0 0 16px}
 .sub i{font-style:normal;color:#6E8C6B;padding:0 .2em}
 .meta{font-family:Inter,sans-serif;font-size:15px;letter-spacing:.24em;
   text-transform:uppercase;color:#6E8C6B;margin:0}
 .linea{width:120px;height:1px;background:#8CAA88;margin:26px auto 0}
</style>
<svg viewBox="${wm.viewBox}"><path fill="#22332B" d="${wm.fill}"/></svg>
<p class="sub">Asesoría fiscal, contable, laboral y mercantil</p>
<p class="meta">Carballo · A Coruña · desde 1986</p>
<div class="linea"></div>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.waitForTimeout(900);
  await p.screenshot({ path: '../assets/img/og-cervantes.jpg', type: 'jpeg', quality: 88 });
  await b.close();
  console.log('og-cervantes.jpg listo');
})();
