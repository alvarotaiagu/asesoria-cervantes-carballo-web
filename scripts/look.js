const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8971/';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errores = [];
  p.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  p.on('pageerror', e => errores.push('PAGEERROR ' + e.message));
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(3600);
  await p.screenshot({ path: '../screenshots/01-hero.png' });
  // recorrido completo
  const alto = await p.evaluate(() => document.body.scrollHeight);
  console.log('altura de página:', alto);
  let n = 2;
  for (let y = 700; y < alto - 600; y += 850) {
    await p.evaluate(v => window.scrollTo(0, v), y);
    await p.waitForTimeout(1100);
    await p.screenshot({ path: `../screenshots/${String(n).padStart(2, '0')}-y${y}.png` });
    n++;
  }
  console.log('errores de consola:', errores.length ? errores : 'ninguno');
  await b.close();
})();
