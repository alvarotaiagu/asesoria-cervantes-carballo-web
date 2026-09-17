/* Verificación de la web de Asesoría Cervantes con Playwright.
   Necesita un servidor local en la raíz del proyecto:
       python -m http.server 8971
   Uso:  NODE_PATH=/c/Users/alvar/node_modules node scripts/verify.js
   Escribe screenshots/ y scripts/verify-report.json. Sale con código 1 si algo falla. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.CERVANTES_URL || 'http://127.0.0.1:8971/';
const RAIZ = path.join(__dirname, '..');
const CAPS = path.join(RAIZ, 'screenshots');
fs.mkdirSync(CAPS, { recursive: true });

const res = [];
const ok = (nombre, valor, detalle) => {
  res.push({ prueba: nombre, ok: !!valor, detalle: detalle === undefined ? null : detalle });
  console.log((valor ? 'OK   ' : 'FALLA') + ' ' + nombre +
    (detalle !== undefined ? '  ' + JSON.stringify(detalle) : ''));
};

const UA_CTX = { viewport: { width: 1440, height: 900 } };

async function pagina(browser, opciones = {}) {
  const ctx = await browser.newContext(Object.assign({}, UA_CTX, opciones));
  const p = await ctx.newPage();
  p.__errores = [];
  p.on('pageerror', e => p.__errores.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') p.__errores.push('console: ' + m.text()); });
  return p;
}

/* Recorre toda la página para disparar todos los ScrollTrigger y vuelve arriba.
   Se hace con la RUEDA, no con window.scrollTo: la página lleva Lenis, que
   gestiona el scroll él mismo; un scrollTo programático se pelea con su
   posición interna y ScrollTrigger puede no enterarse de haber pasado por una
   sección. Con la rueda se recorre como lo haría una persona. */
async function recorrer(p, paso = 500, espera = 130) {
  await p.mouse.move(700, 450);
  let anterior = -1;
  for (let i = 0; i < 120; i++) {
    await p.mouse.wheel(0, paso);
    await p.waitForTimeout(espera);
    const y = await p.evaluate(() => Math.round(window.scrollY));
    if (y === anterior) break;          // ya no baja más: se llegó al final
    anterior = y;
  }
  const alto = await p.evaluate(() => document.body.scrollHeight);
  for (let i = 0; i < 120; i++) {
    await p.mouse.wheel(0, -paso * 3);
    await p.waitForTimeout(25);
    if (await p.evaluate(() => window.scrollY) <= 0) break;
  }
  /* las últimas secciones disparan su animación al final del recorrido:
     hay que darles tiempo a asentarse antes de medir nada */
  await p.waitForTimeout(2600);
  return alto;
}

(async () => {
  const b = await chromium.launch();

  /* ==================================================================
     1 · Carga normal, escritorio
     ================================================================== */
  {
    const p = await pagina(b);
    await p.goto(BASE, { waitUntil: 'networkidle' });

    const wm = await p.evaluate(() => {
      const paths = [...document.querySelectorAll('.wm-pluma path')];
      return {
        n: paths.length,
        conPathLength: paths.filter(x => x.getAttribute('pathLength') === '1').length,
        vb: document.querySelector('.wm').getAttribute('viewBox'),
        par: document.querySelector('.wm').getAttribute('preserveAspectRatio')
      };
    });
    ok('wordmark: paths de trazo presentes', wm.n >= 10, wm.n);
    ok('wordmark: todos con pathLength="1"', wm.conPathLength === wm.n, wm);
    ok('wordmark: viewBox sin estirar (preserveAspectRatio por defecto)',
      !wm.par || wm.par === 'xMidYMid meet', wm.par);

    /* a mitad de la escritura debe haber trazo a medias y tinta aún oculta */
    await p.waitForTimeout(700);
    const medio = await p.evaluate(() => {
      const paths = [...document.querySelectorAll('.wm-pluma path')];
      const off = paths.map(x => parseFloat(getComputedStyle(x).strokeDashoffset));
      return {
        empezados: off.filter(o => o < 0.999).length,
        sinEmpezar: off.filter(o => o >= 0.999).length,
        tinta: +getComputedStyle(document.querySelector('.wm-tinta')).opacity
      };
    });
    ok('wordmark: se está escribiendo (unos trazos hechos, otros no)',
      medio.empezados > 0 && medio.sinEmpezar > 0, medio);

    await p.waitForTimeout(3200);
    const fin = await p.evaluate(() => ({
      tinta: +getComputedStyle(document.querySelector('.wm-tinta')).opacity,
      trazo: +getComputedStyle(document.querySelector('.wm-pluma path')).opacity
    }));
    ok('wordmark: al terminar se rellena y la pluma se retira',
      fin.tinta > 0.95 && fin.trazo < 0.05, fin);

    await p.click('.cookie-ack');
    const cerrado = await p.evaluate(() => {
      const el = document.querySelector('.cookie-banner');
      return { hidden: el.hidden, display: getComputedStyle(el).display };
    });
    ok('cookies: el botón cierra de verdad (display none, no solo [hidden])',
      cerrado.hidden === true && cerrado.display === 'none', cerrado);

    await recorrer(p);

    const titulares = await p.evaluate(() => [...document.querySelectorAll('.titular')].map(h => {
      const t1 = h.querySelector('.tit-1-txt');
      const chars = [...h.querySelectorAll('.split-char')];
      return {
        pluma: h.dataset.pluma,
        serif: t1 ? +getComputedStyle(t1).opacity : null,
        trazos: h.querySelectorAll('.pluma-svg path').length,
        charsOcultos: chars.filter(c => +getComputedStyle(c).opacity < 0.9).length
      };
    }));
    ok('titulares: cada uno tiene su trazo de pluma',
      titulares.every(t => t.trazos > 0), titulares.map(t => t.pluma + ':' + t.trazos).join(' '));
    ok('titulares: al asentarse queda la tipografía serif y ningún carácter oculto',
      titulares.every(t => t.serif > 0.95 && t.charsOcultos === 0), titulares);

    const nums = await p.evaluate(() => [...document.querySelectorAll('.cap-num')].map(c => ({
      paths: c.querySelectorAll('path').length,
      off: c.querySelector('path') ? parseFloat(getComputedStyle(c.querySelector('path')).strokeDashoffset) : null,
      op: c.querySelector('path') ? +getComputedStyle(c.querySelector('path')).opacity : null
    })));
    ok('capítulos: los cuatro numerales están dibujados',
      nums.length === 4 && nums.every(n => n.paths > 0 && n.off < 0.02 && n.op > 0.9), nums);

    const alturas = await p.evaluate(() =>
      [...document.querySelectorAll('.cap-tarjeta')].map(c => Math.round(c.getBoundingClientRect().height)));
    ok('capítulos: todas las tarjetas miden lo mismo (si no, asoman por debajo)',
      new Set(alturas).size === 1, alturas);

    const grid = await p.evaluate(() => ({
      cols: getComputedStyle(document.querySelector('.noticias')).gridTemplateColumns.split(' ').length,
      n: document.querySelectorAll('.noticia').length
    }));
    ok('noticias: cuatro tarjetas de respaldo', grid.n === 4, grid);
    ok('noticias: las cuatro en una fila en escritorio', grid.cols === 4, grid);

    const sinCanvas = await p.evaluate(() => document.querySelectorAll('canvas').length);
    ok('sin canvas (nada de blur/shadow por frame)', sinCanvas === 0, sinCanvas);

    ok('sin errores de consola', p.__errores.length === 0, p.__errores);
    await p.context().close();
  }

  /* ==================================================================
     2 · La pila de capítulos a media altura
     ================================================================== */
  {
    const p = await pagina(b);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.click('.cookie-ack');
    const caja = await p.evaluate(() => {
      const s = document.querySelector('#capitulos');
      const r = s.getBoundingClientRect();
      return { arriba: r.top + window.scrollY, alto: r.height };
    });
    let solapes = 0, muestras = 0, asoman = 0;
    for (let y = caja.arriba; y < caja.arriba + caja.alto; y += 60) {
      await p.evaluate(v => window.scrollTo(0, v), y);
      await p.waitForTimeout(45);
      const r = await p.evaluate(() => {
        const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stack-top')) * 16;
        const cajas = [...document.querySelectorAll('.cap-tarjeta')].map(c => c.getBoundingClientRect());
        const pegadas = cajas.filter(c => Math.abs(c.top - top) < 6).length;
        /* ¿alguna tarjeta de atrás asoma por debajo de la que está delante? */
        let sobresale = 0;
        for (let i = 0; i < cajas.length - 1; i++) {
          const a = cajas[i], bb = cajas[i + 1];
          if (bb.top <= a.top + 2 && bb.bottom > a.bottom + 2) sobresale++;
        }
        return { pegadas, sobresale };
      });
      muestras++;
      if (r.pegadas > 1) solapes++;
      if (r.sobresale > 0) asoman++;
    }
    ok('pila: nunca hay dos tarjetas clavadas a la vez en el mismo sitio',
      solapes === 0, { muestras, solapes });
    ok('pila: ninguna tarjeta de atrás asoma por debajo', asoman === 0, { muestras, asoman });
    await p.screenshot({ path: path.join(CAPS, 'v-pila.png') });
    await p.context().close();
  }

  /* ==================================================================
     3 · Noticias: hoja que responde y hoja que falla
     ================================================================== */
  {
    // 3a · la hoja contesta
    const p = await pagina(b);
    /* se sirve js/noticias-datos.js con la URL de la hoja ya puesta: así se
       prueba el camino real del código, no un parche posterior */
    const datos = fs.readFileSync(path.join(RAIZ, 'js', 'noticias-datos.js'), 'utf8');
    const conUrl = datos.replace('url: ""', 'url: "/hoja-de-prueba.json"');
    if (conUrl === datos) throw new Error('no se pudo inyectar la URL de prueba en noticias-datos.js');
    await p.route('**/js/noticias-datos.js', route =>
      route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: conUrl }));
    await p.route('**/hoja-de-prueba*', route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([
        { titulo: 'Desde la hoja 1', fecha: 'Enero 2026', resumen: 'Uno', enlace: 'https://example.com/1' },
        { TITULO: 'Desde la hoja 2', Fecha: '', Resumen: 'Dos', Enlace: '' },
        { titulo: 'Oculta', fecha: '', resumen: 'No debe salir', enlace: '', estado: 'oculto' },
        { titulo: 'Desde la hoja 3', fecha: '', resumen: 'Tres', enlace: '' },
        { titulo: 'Desde la hoja 4', fecha: '', resumen: 'Cuatro', enlace: '' }
      ])
    }));
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    const conHoja = await p.evaluate(() =>
      [...document.querySelectorAll('.noticia-titulo')].map(h => h.textContent.trim()));
    ok('noticias: la hoja sustituye al respaldo, acepta claves en mayúsculas y respeta «oculto»',
      conHoja.length === 4 && conHoja.every(t => t.startsWith('Desde la hoja')) && !conHoja.includes('Oculta'),
      conHoja);
    await p.context().close();

    // 3b · la hoja falla: route.abort()
    const q = await pagina(b);
    await q.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        if (window.NOTICIAS) window.NOTICIAS.HOJA.url = '/hoja-de-prueba.json';
      });
    });
    await q.route('**/hoja-de-prueba*', route => route.abort());
    await q.goto(BASE, { waitUntil: 'networkidle' });
    await q.waitForTimeout(1500);
    const conFallo = await q.evaluate(() => ({
      titulos: [...document.querySelectorAll('.noticia-titulo')].map(h => h.textContent.trim()),
      visible: document.querySelectorAll('.noticia').length
    }));
    const erroresVisibles = await q.evaluate(() => document.body.innerText.toLowerCase().includes('error'));
    ok('noticias: si la hoja falla se quedan las cuatro de respaldo',
      conFallo.visible === 4 && conFallo.titulos[0].includes('Accountex'), conFallo.titulos);
    ok('noticias: el fallo es silencioso (no se le enseña al visitante)', !erroresVisibles);
    await q.context().close();
  }

  /* ==================================================================
     4 · Mapa bajo demanda
     ================================================================== */
  {
    const p = await pagina(b);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.click('.cookie-ack');
    const antes = await p.evaluate(() => document.querySelectorAll('.mapa iframe').length);
    ok('mapa: no se carga ningún iframe hasta el clic', antes === 0, antes);
    await p.locator('.map-consent').scrollIntoViewIfNeeded();
    await p.click('.map-consent');
    await p.waitForTimeout(500);
    const despues = await p.evaluate(() => {
      const f = document.querySelector('.mapa iframe');
      return f ? f.getAttribute('src') : null;
    });
    ok('mapa: tras el clic aparece el embed de Google sin API key',
      !!despues && despues.includes('output=embed') && despues.includes('Cervantes'), despues);
    await p.context().close();
  }

  /* ==================================================================
     5 · Menos movimiento
     ================================================================== */
  {
    const p = await pagina(b, { reducedMotion: 'reduce' });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    await recorrer(p, 700, 90);
    const r = await p.evaluate(() => ({
      hasMotion: document.documentElement.classList.contains('has-motion'),
      tinta: +getComputedStyle(document.querySelector('.wm-tinta')).opacity,
      titularVisible: +getComputedStyle(document.querySelector('.titular')).opacity,
      tarjetaClip: getComputedStyle(document.querySelector('.cap-tarjeta')).clipPath,
      contador: document.querySelector('[data-contador]').textContent.trim(),
      revelados: [...document.querySelectorAll('[data-reveal]')]
        .filter(e => +getComputedStyle(e).opacity < 0.9).length
    }));
    ok('reduced-motion: no se activa la animación', r.hasMotion === false, r.hasMotion);
    ok('reduced-motion: el wordmark aparece ya escrito', r.tinta > 0.95, r.tinta);
    ok('reduced-motion: nada de pasar página (sin clip-path)',
      r.tarjetaClip === 'none', r.tarjetaClip);
    ok('reduced-motion: todo el contenido visible', r.revelados === 0, r.revelados);
    ok('reduced-motion: los contadores muestran su valor final', r.contador === '39', r.contador);
    await p.screenshot({ path: path.join(CAPS, 'v-reduced-motion.png'), fullPage: false });
    await p.context().close();
  }

  /* ==================================================================
     6 · Sin JavaScript
     ================================================================== */
  {
    const ctx = await b.newContext(Object.assign({}, UA_CTX, { javaScriptEnabled: false }));
    const p = await ctx.newPage();
    await p.goto(BASE, { waitUntil: 'load' });
    const r = await p.evaluate(() => 1).catch(() => null);
    const txt = await p.locator('body').innerText();
    const tinta = await p.locator('.wm-tinta').evaluate(e => e.getAttribute('fill')).catch(() => null);
    ok('sin JS: el wordmark sigue ahí, relleno', tinta === '#22332B', tinta);
    ok('sin JS: se lee el contenido (horario, teléfono, servicios)',
      txt.includes('981 70 27 55') && txt.includes('8:30') && txt.includes('Mercantil'),
      txt.length);
    await p.screenshot({ path: path.join(CAPS, 'v-sin-js.png') });
    await ctx.close();
  }

  /* ==================================================================
     7 · Sin CDN (GSAP bloqueado)
     ================================================================== */
  {
    const p = await pagina(b);
    await p.route('**cdnjs.cloudflare.com/**', route => route.abort());
    await p.goto(BASE, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => ({
      hasMotion: document.documentElement.classList.contains('has-motion'),
      tinta: +getComputedStyle(document.querySelector('.wm-tinta')).opacity,
      noticias: document.querySelectorAll('.noticia').length,
      contador: document.querySelector('[data-contador]').textContent.trim(),
      estrellas: document.querySelectorAll('.estrellas svg').length
    }));
    ok('sin CDN: el wordmark se ve relleno y no hay animación',
      !r.hasMotion && r.tinta > 0.95, r);
    ok('sin CDN: las noticias y las estrellas siguen funcionando',
      r.noticias === 4 && r.estrellas >= 5 && r.contador === '39', r);
    await p.context().close();
  }

  /* ==================================================================
     8 · Responsive, incluido 400 px
     ================================================================== */
  for (const [nombre, w, h] of [['movil-400', 400, 900], ['movil-390', 390, 844], ['tablet-820', 820, 1180]]) {
    const p = await pagina(b, { viewport: { width: w, height: h } });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3400);
    await p.click('.cookie-ack');
    const r = await p.evaluate(() => ({
      scrollH: document.documentElement.scrollWidth,
      clientH: document.documentElement.clientWidth,
      wm: Math.round(document.querySelector('.wm').getBoundingClientRect().width),
      tinta: +getComputedStyle(document.querySelector('.wm-tinta')).opacity
    }));
    ok('responsive ' + nombre + ': sin scroll horizontal', r.scrollH <= r.clientH + 1, r);
    ok('responsive ' + nombre + ': el wordmark se escribe igual, escalado',
      r.wm > w * 0.55 && r.tinta > 0.95, r);
    await recorrer(p, 600, 90);
    const caps = await p.evaluate(() => {
      const t = [...document.querySelectorAll('.cap-tarjeta')].map(c => c.getBoundingClientRect());
      return { apilados: t.every(c => c.width > 0), unaColumna: new Set(t.map(c => Math.round(c.left))).size === 1 };
    });
    ok('responsive ' + nombre + ': los capítulos se apilan en una columna',
      caps.apilados && caps.unaColumna, caps);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(CAPS, 'v-' + nombre + '.png') });
    await p.context().close();
  }

  /* ==================================================================
     9 · Datos reales en la página
     ================================================================== */
  {
    const p = await pagina(b);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    const txt = await p.locator('body').innerText();
    const html = await p.content();
    const debe = [
      'Gran Vía, 23-25', '15100 Carballo', '981 70 27 55', 'info@asesoriacervantes.com',
      '39', 'Enero a junio', 'Julio, agosto', '8:30 – 14:00', '15:30 – 18:00', '8:30 – 14:30',
      'Fiscal', 'Contable', 'Laboral y Seguridad Social', 'Mercantil',
      'Ubyquo', 'Kit Digital', 'Canal Interno de Información', 'Accountex'
    ];
    /* innerText devuelve el texto tal y como se ve, y el horario lleva
       text-transform: uppercase: hay que comparar sin distinguir caja */
    const plano = txt.toLowerCase();
    const faltan = debe.filter(d => !plano.includes(d.toLowerCase()));
    ok('datos reales presentes en la página', faltan.length === 0, faltan);
    ok('teléfono enlazado correctamente', html.includes('tel:+34981702755'));
    ok('sin marcadores de plantilla sin sustituir',
      !html.includes('<!--WORDMARK-->') && !html.includes('<!--C-GLIFO-->'));
    const pendientes = (txt.match(/\[[A-ZÑÁÉÍÓÚº][^\]]*\]/g) || []);
    ok('los huecos sin dato están marcados a la vista', pendientes.length >= 3, pendientes);

    /* reseñas: son las cuatro reales de Google y ningún apellido va entero */
    const resenas = await p.evaluate(() => [...document.querySelectorAll('.resenas li')].map(li => ({
      cita: li.querySelector('blockquote p').textContent.trim(),
      firma: li.querySelector('cite').firstChild.textContent.trim(),
      estrellas: li.querySelectorAll('.estrellas .relleno').length
    })));
    ok('reseñas: las cuatro reales, con sus cinco estrellas',
      resenas.length === 4 &&
      resenas.every(r => r.estrellas === 5 && r.cita.length > 40 && !r.cita.includes('PENDIENTE')),
      resenas.map(r => r.firma + ' (' + r.estrellas + '★)'));
    ok('reseñas: los apellidos van abreviados, no completos',
      resenas.every(r => /\s[A-ZÑ]\.$/.test(r.firma)), resenas.map(r => r.firma));
    await p.context().close();
  }

  await b.close();

  const fallos = res.filter(r => !r.ok);
  fs.writeFileSync(path.join(__dirname, 'verify-report.json'),
    JSON.stringify({ fecha: new Date().toISOString(), base: BASE, total: res.length, fallos: fallos.length, pruebas: res }, null, 1));
  console.log('\n' + (res.length - fallos.length) + '/' + res.length + ' pruebas correctas');
  if (fallos.length) {
    console.log('FALLAN:\n' + fallos.map(f => ' - ' + f.prueba + '  ' + JSON.stringify(f.detalle)).join('\n'));
    process.exit(1);
  }
})();
