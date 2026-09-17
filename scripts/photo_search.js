/* Busca en Pexels con un navegador NUEVO por consulta y UA realista:
   Cloudflare devuelve el reto "Just a moment" si se reutiliza el contexto o
   si no se espera ~9 s tras domcontentloaded. Ver memoria del taller. */
const { chromium } = require('playwright');
const fs = require('fs');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const CONSULTAS = [
  'fountain pen writing paper',
  'hands writing notebook desk',
  'bright office wooden desk plant',
  'morning light window interior warm',
  'archive folders binders shelf',
  'notebook pen minimal desk cream',
  'woman professional portrait natural light office',
  'man professional portrait natural light office',
  'calm office interior wood green',
  'paper documents desk sunlight'
];
const espera = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const salida = {};
  for (const q of CONSULTAS) {
    const b = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] });
    const ctx = await b.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    try {
      await p.goto('https://www.pexels.com/search/' + encodeURIComponent(q) + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await espera(9000);
      const ids = await p.evaluate(() => {
        const out = [];
        document.querySelectorAll('img').forEach(im => {
          const m = (im.src || '').match(/photos\/(\d+)\/pexels-photo-\1/);
          if (m) out.push({ id: m[1], alt: im.alt || '' });
        });
        return out;
      });
      const unicos = [...new Map(ids.map(o => [o.id, o])).values()];
      salida[q] = unicos;
      console.log(q, '->', unicos.length);
    } catch (e) {
      salida[q] = [];
      console.log(q, '-> ERROR', e.message.slice(0, 80));
    }
    await b.close();
    await espera(4000);
  }
  fs.writeFileSync('photos_found.json', JSON.stringify(salida, null, 1));
  console.log('FIN');
})();
