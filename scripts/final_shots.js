const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8971/';
async function recorrer(p, paso = 500, espera = 120) {
  await p.mouse.move(700, 450);
  let ant = -1;
  for (let i = 0; i < 120; i++) {
    await p.mouse.wheel(0, paso); await p.waitForTimeout(espera);
    const y = await p.evaluate(() => Math.round(window.scrollY));
    if (y === ant) break; ant = y;
  }
  for (let i = 0; i < 120; i++) {
    await p.mouse.wheel(0, -paso * 3); await p.waitForTimeout(20);
    if (await p.evaluate(() => window.scrollY) <= 0) break;
  }
  await p.waitForTimeout(2600);
}
(async () => {
  const b = await chromium.launch();
  for (const [n, w, h] of [['escritorio', 1440, 900], ['movil', 400, 860]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3600);
    await p.click('.cookie-ack');
    await recorrer(p);
    await p.evaluate(() => { document.querySelector('.cabecera').style.position = 'absolute'; });
    await p.waitForTimeout(300);
    await p.screenshot({ path: `../screenshots/final-${n}.png`, fullPage: true });
    console.log(n, 'listo');
    await p.context().close();
  }
  await b.close();
})();
