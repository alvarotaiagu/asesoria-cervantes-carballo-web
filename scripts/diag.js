const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto('http://127.0.0.1:8971/', { waitUntil: 'networkidle' });
  await p.click('.cookie-ack');
  const alto = await p.evaluate(() => document.body.scrollHeight);
  // recorre toda la página despacio para disparar todos los triggers
  for (let y = 0; y < alto; y += 500) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(160); }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(3500);

  const r = await p.evaluate(() => {
    const out = { titulares: [], tarjetas: [], grid: {} };
    document.querySelectorAll('.titular').forEach(h => {
      const t1 = h.querySelector('.tit-1-txt');
      const tr = h.querySelector('.tit-r');
      const chars = h.querySelectorAll('.split-char');
      let visibles = 0;
      chars.forEach(c => { if (+getComputedStyle(c).opacity > 0.9) visibles++; });
      out.titulares.push({
        pluma: h.dataset.pluma || null,
        serif1: t1 ? +getComputedStyle(t1).opacity : null,
        chars: chars.length, charsVisibles: visibles,
        trazoOpac: h.querySelector('.pluma-svg path') ? +getComputedStyle(h.querySelector('.pluma-svg path')).opacity : null,
        anchoPluma: h.querySelector('.pluma-svg') ? Math.round(h.querySelector('.pluma-svg').getBoundingClientRect().width) : null,
        anchoPalabra: h.querySelector('.tit-1') ? Math.round(h.querySelector('.tit-1').getBoundingClientRect().width) : null
      });
    });
    document.querySelectorAll('.cap-tarjeta').forEach(c => out.tarjetas.push(Math.round(c.getBoundingClientRect().height)));
    const g = document.querySelector('.noticias');
    out.grid.noticias = g ? getComputedStyle(g).gridTemplateColumns : null;
    out.grid.nNoticias = document.querySelectorAll('.noticia').length;
    out.wm = { pluma: +getComputedStyle(document.querySelector('.wm-pluma')).opacity,
               tinta: +getComputedStyle(document.querySelector('.wm-tinta')).opacity };
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
