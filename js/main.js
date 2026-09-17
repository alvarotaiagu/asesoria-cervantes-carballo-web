/* ==========================================================================
   Asesoría Cervantes SL · «Pluma» — movimiento y utilidades
   --------------------------------------------------------------------------
   GSAP, ScrollTrigger y Lenis vienen de un CDN. Si fallan (bloqueador, red
   caída, navegador antiguo) nada de lo de aquí abajo puede romper la página:
   el wordmark se ve ya escrito, los textos visibles, el teléfono y el mapa
   funcionan. Por eso los estados «ocultos» del CSS viven bajo html.has-motion,
   que solo se activa en esta línea de aquí abajo.
   ========================================================================== */
(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     EL AÑO DE FUNDACIÓN
     Su web actual se contradice: la portada y el titular de «Sobre nosotros»
     dicen «Desde 1986», pero el cuerpo de «Sobre nosotros» dice «Fundada en
     1984». Mientras no lo confirmen, la web dice solo «Desde 1986» y NO afirma
     los cuarenta años. Cuando confirmen que es 1986, ponga esto en true y el
     hero pasará a decir «Capítulo cuarenta».
     -------------------------------------------------------------------------- */
  var ANIO_1986_CONFIRMADO = false;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsapListo = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var motion = gsapListo && !reduce;
  var html = document.documentElement;
  if (gsapListo) gsap.registerPlugin(ScrollTrigger);
  if (motion) html.classList.add("has-motion");

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var navH = function () {
    return parseFloat(getComputedStyle(html).getPropertyValue("--nav-h")) * 16 || 76;
  };

  /* ======================================================================
     1 · Cosas que deben funcionar siempre (haya o no animación)
     ====================================================================== */

  /* --- año del pie ------------------------------------------------------ */
  $$("[data-anio]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* --- «Capítulo cuarenta», solo si confirman 1986 ---------------------- */
  if (ANIO_1986_CONFIRMADO) {
    var cap40 = $(".hero-capitulo");
    if (cap40) cap40.textContent = "Capítulo cuarenta";
  }

  /* --- aviso de cookies ------------------------------------------------- */
  (function avisoCookies() {
    var banner = $(".cookie-banner");
    var ok = $(".cookie-ack");
    if (!banner || !ok) return;
    var CLAVE = "cervantes-cookie-ack";
    var visto = false;
    try { visto = localStorage.getItem(CLAVE) === "1"; } catch (e) {}
    if (!visto) banner.hidden = false;
    ok.addEventListener("click", function () {
      banner.hidden = true;
      try { localStorage.setItem(CLAVE, "1"); } catch (e) {}
    });
  })();

  /* --- menú móvil -------------------------------------------------------- */
  var toggle = $(".nav-toggle");
  var navMovil = $(".nav-movil");
  function cerrarMenu() {
    if (!toggle || !navMovil) return;
    toggle.setAttribute("aria-expanded", "false");
    navMovil.hidden = true;
  }
  if (toggle && navMovil) {
    toggle.addEventListener("click", function () {
      var abierto = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", abierto ? "false" : "true");
      toggle.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
      navMovil.hidden = abierto;
    });
  }

  /* --- mapa solo al pedirlo (sin cookies de terceros hasta el clic) ------ */
  (function mapaBajoDemanda() {
    var btn = $(".map-consent");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var q = encodeURIComponent("Asesoría Cervantes SL, Gran Vía 23-25, 15100 Carballo, A Coruña");
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=" + q + "&output=embed";
      iframe.title = "Mapa: Asesoría Cervantes, Gran Vía 23-25, Carballo";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.setAttribute("allowfullscreen", "");
      btn.replaceWith(iframe);
    });
  })();

  /* --- sombra de la cabecera -------------------------------------------- */
  var cabecera = $(".cabecera");
  function alHacerScroll() {
    if (cabecera) cabecera.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", alHacerScroll, { passive: true });
  alHacerScroll();

  /* --- estrellas de la valoración (4,6 sobre 5) -------------------------- */
  (function estrellas() {
    var D = "M12 2.4l2.9 6.1 6.7.9-4.9 4.6 1.2 6.6L12 17.5 6.1 20.6l1.2-6.6L2.4 9.4l6.7-.9z";
    $$("[data-estrellas]").forEach(function (caja) {
      var nota = parseFloat(caja.dataset.estrellas) || 0;
      var out = "";
      for (var i = 0; i < 5; i++) {
        var p = Math.max(0, Math.min(1, nota - i));
        out += '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path class="fondo" d="' + D + '"/>' +
          (p > 0 ? '<path class="relleno" d="' + D + '" style="clip-path:inset(0 ' +
            ((1 - p) * 100).toFixed(0) + '% 0 0)"/>' : "") + "</svg>";
      }
      caja.innerHTML = out;
    });
  })();

  /* --- noticias: respaldo primero, hoja después -------------------------- */
  (function noticias() {
    var lista = $("[data-noticias]");
    var cfg = window.NOTICIAS;
    if (!lista || !cfg) return;

    function esc(s) {
      return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function pintar(filas) {
      lista.innerHTML = filas.slice(0, 4).map(function (n) {
        var t = esc(n.titulo);
        var titulo = n.enlace
          ? '<a href="' + esc(n.enlace) + '" target="_blank" rel="noopener">' + t + "</a>"
          : t;
        return '<li class="noticia" data-reveal>' +
          (n.fecha ? '<p class="noticia-fecha">' + esc(n.fecha) + "</p>" : "") +
          '<h3 class="noticia-titulo">' + titulo + "</h3>" +
          '<p class="noticia-resumen">' + esc(n.resumen) + "</p>" +
          (n.enlace ? '<a class="noticia-mas" href="' + esc(n.enlace) +
            '" target="_blank" rel="noopener">Leer la noticia</a>' : "") +
          "</li>";
      }).join("");
    }

    /* normaliza lo que devuelva la hoja: array suelto, {datos:[]} o
       {noticias:[]}, y las claves en mayúsculas o con espacios */
    function normalizar(j) {
      var filas = Array.isArray(j) ? j
        : (j && (j.datos || j.noticias || j.items || j.rows)) || [];
      if (!Array.isArray(filas)) return [];
      return filas.map(function (f) {
        var o = {};
        Object.keys(f || {}).forEach(function (k) {
          o[String(k).trim().toLowerCase()] = f[k];
        });
        return {
          titulo: o.titulo || o["título"] || "",
          fecha: o.fecha || "",
          resumen: o.resumen || o.descripcion || o["descripción"] || "",
          enlace: o.enlace || o.url || o.link || "",
          estado: String(o.estado || "").trim().toLowerCase()
        };
      }).filter(function (n) {
        return n.titulo && n.estado !== "oculto" && n.estado !== "no";
      });
    }

    pintar(cfg.RESPALDO || []);          // el respaldo SIEMPRE se pinta primero

    var url = cfg.HOJA && cfg.HOJA.url;
    if (!url) return;
    var ctrl = window.AbortController ? new AbortController() : null;
    var reloj = setTimeout(function () { if (ctrl) ctrl.abort(); }, (cfg.HOJA.corte || 7000));
    fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)); })
      .then(function (j) {
        var filas = normalizar(j);
        if (filas.length) {
          pintar(filas);
          if (motion) {
            /* las tarjetas nuevas entran ya visibles y se recalculan alturas */
            gsap.set($$(".noticia", lista), { opacity: 1, y: 0 });
            ScrollTrigger.refresh();
          }
        }
      })
      .catch(function (e) {
        /* al visitante nunca se le enseña el fallo: se queda con el respaldo */
        console.warn("[Cervantes] la hoja de noticias no contestó; se mantienen las cuatro de respaldo.", e);
      })
      .then(function () { clearTimeout(reloj); });
  })();

  /* --- capítulos: todas las tarjetas, la misma altura ---------------------
     En una pila pegajosa todas las tarjetas se clavan al mismo `top`, así que
     una más alta que la de delante asoma por debajo y se ve su borde. Se mide
     la más alta y se iguala; hay que hacerlo con o sin animación, porque es
     cuestión de maquetación, no de movimiento. */
  (function igualarCapitulos() {
    var tarjetas = $$(".cap-tarjeta");
    if (tarjetas.length < 2) return;
    var pendiente = false;
    function medir() {
      tarjetas.forEach(function (t) { t.style.minHeight = ""; });
      var alto = 0;
      tarjetas.forEach(function (t) { alto = Math.max(alto, t.offsetHeight); });
      tarjetas.forEach(function (t) { t.style.minHeight = alto + "px"; });
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    }
    function alRedimensionar() {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(function () { pendiente = false; medir(); });
    }
    medir();
    window.addEventListener("resize", alRedimensionar);
    window.addEventListener("load", medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
  })();

  /* --- anclas: desplazamiento suave y cierre del menú -------------------- */
  var lenis = null;
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var destino = document.querySelector(id);
      if (!destino) return;
      e.preventDefault();
      cerrarMenu();
      var off = -navH();
      if (lenis) lenis.scrollTo(destino, { offset: off, duration: 1.4 });
      else window.scrollTo({
        top: destino.getBoundingClientRect().top + window.scrollY + off,
        behavior: reduce ? "auto" : "smooth"
      });
      history.replaceState(null, "", id);
    });
  });


  /* ======================================================================
     Cortina de entrada (preloader)
     ----------------------------------------------------------------------
     Gesto propio: la portada del tomo. El filete se dibuja, el nombre sube
     desde una máscara y la hoja se PASA girando sobre el lomo izquierdo,
     con la sombra del canto encendiéndose a la vez.

     Dos momentos distintos a propósito:
       · alAbrirse(fn) → cuando la hoja EMPIEZA a girar, para que la pluma
         del hero ya esté escribiendo cuando asoma la página.
       · retirar()     → al terminar: quita el nodo, devuelve el scroll y
         refresca ScrollTrigger, que midió con overflow:hidden.
     Va ANTES del `if (!motion) return` de abajo: si no, sin GSAP o con
     movimiento reducido la cortina se quedaría puesta tapando el sitio.
     ====================================================================== */
  var cortina = (function initCortina() {
    var el = $("[data-cortina]");
    var espera = [];
    var abierta = false;
    var fuera = false;

    function abrir() {
      if (abierta) return;
      abierta = true;
      espera.splice(0).forEach(function (fn) { try { fn(); } catch (e) {} });
    }
    function retirar() {
      abrir();
      if (fuera) return;
      fuera = true;
      if (el) el.hidden = true;
      html.classList.remove("cortina-puesta");
      if (lenis) lenis.start();
      if (gsapListo) ScrollTrigger.refresh();
    }

    var api = { alAbrirse: function (fn) { return abierta ? fn() : espera.push(fn); } };
    if (!el || !motion) { retirar(); return api; }

    html.classList.add("cortina-puesta");

    var hoja = $(".cortina-hoja", el);
    var lineas = $$(".cortina-marco-l", el);
    var tomo = $(".cortina-tomo", el);
    var marca = $(".cortina-marca span", el);
    var filete = $(".cortina-filete", el);
    var pie = $(".cortina-pie", el);
    var PASA = 1.4;

    var tl = gsap.timeline({ onComplete: retirar });
    if (lineas.length) tl.to(lineas, { strokeDashoffset: 0, duration: 0.5, stagger: 0.13, ease: "power2.inOut" }, 0);
    if (tomo) tl.to(tomo, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.35);
    /* el estado inicial es un translateY(112%) de CSS y GSAP lo lee del
       matrix como p\u00edxeles, no como yPercent: hay que poner las dos a cero
       o el nombre no sale nunca de su m\u00e1scara. */
    if (marca) tl.to(marca, { y: 0, yPercent: 0, duration: 0.95, ease: "expo.out" }, 0.5);
    if (filete) tl.to(filete, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, 0.85);
    if (pie) tl.to(pie, { opacity: 1, letterSpacing: "0.34em", duration: 0.8, ease: "power2.out" }, 0.9);

    tl.add(abrir, PASA);
    /* El giro va en POSITIVO: con transform-origin a la izquierda, un
       rotationY negativo trae el canto derecho hacia la cámara y la hoja
       tapa MAS, no menos. En positivo se va hacia atrás, se escorza y
       destapa la página desde la derecha, que es como se pasa una hoja. */
    if (hoja) {
      tl.to(hoja, { rotationY: 96, duration: 1.15, ease: "expo.inOut" }, PASA);
      var canto = $(".cortina-canto", el);
      if (canto) tl.to(canto, { opacity: 1, duration: 0.6, ease: "power2.out" }, PASA);
    }

    setTimeout(retirar, 5200);
    return api;
  })();

  /* ======================================================================
     2 · Sin movimiento: valores finales y se acabó
     ====================================================================== */
  if (!motion) {
    $$("[data-contador]").forEach(function (el) { el.textContent = el.dataset.contador; });
    $$("[data-contador-dec]").forEach(function (el) {
      el.textContent = String(el.dataset.contadorDec).replace(".", ",");
    });
    return;
  }

  /* ======================================================================
     3 · La caligrafía dibujada
     ====================================================================== */
  var TRAZOS = window.TRAZOS || { palabras: {}, numerales: {} };

  /* Construye un SVG de líneas centrales listo para escribirse.
     Todos los paths llevan pathLength="1": así el dasharray no depende del
     tamaño al que se pinte el SVG y la animación es idéntica a 400 px que a
     2000 px de ancho. */
  function svgDeTrazos(dato, clase) {
    if (!dato) return null;
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", dato.vb);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    if (clase) svg.setAttribute("class", clase);
    dato.t.forEach(function (t) {
      var p = document.createElementNS(ns, "path");
      p.setAttribute("d", t[0]);
      p.setAttribute("pathLength", "1");
      svg.appendChild(p);
    });
    return svg;
  }

  /* Escribe un conjunto de paths en orden, repartiendo el tiempo según la
     longitud real de cada trazo: los largos tardan más, como una mano.
     El easing es "de mano": rápido al entrar en la curva, lento al rematar. */
  function escribir(tl, paths, longitudes, total, cuando, anchoPluma) {
    var suma = longitudes.reduce(function (a, b) { return a + b; }, 0) || 1;
    var t = cuando;
    paths.forEach(function (p, i) {
      var d = Math.max(0.09, (longitudes[i] / suma) * total);
      tl.set(p, { opacity: 1 }, t);
      tl.fromTo(p,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: d, ease: "power1.inOut" }, t);
      t += d * (anchoPluma || 0.88);      /* los trazos se encadenan solapados */
    });
    return t;
  }

  /* --- HERO: el wordmark se escribe y luego se rellena ------------------- */
  (function heroWordmark() {
    var svg = $(".wm");
    if (!svg) return;
    var paths = $$(".wm-pluma path", svg);
    var tinta = $(".wm-tinta", svg);
    /* la longitud de cada trazo se mide en el propio navegador: es exacta y
       evita tener que llevarla duplicada en otro archivo */
    var largos = paths.map(function (p) {
      try { return p.getTotalLength() || 1; } catch (e) { return 1; }
    });

    var tl = gsap.timeline({ delay: 0.25, paused: true });
    escribir(tl, paths, largos, 1.95, 0, 0.9);

    /* al terminar el trazo, la tinta entra sola de izquierda a derecha */
    tl.fromTo(tinta,
      { opacity: 0, clipPath: "inset(0 100% 0 0)" },
      { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.62, ease: "power2.out" },
      ">-0.1");
    tl.to(paths, { opacity: 0, duration: 0.45, ease: "power1.out" }, "<0.12");

    tl.fromTo(".hero-sub, .hero-capitulo, .hero-badge, .hero-botones",
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: "power3.out" }, "<0.1");
    tl.fromTo(".hero-scroll", { opacity: 0 }, { opacity: 1, duration: 0.8 }, ">-0.4");

    /* la pluma no empieza a escribir hasta que se pasa la hoja: lo primero
       que se ve de la página ya está en movimiento */
    cortina.alAbrirse(function () { tl.play(); });
  })();

  /* --- Titulares: la pluma escribe la primera palabra -------------------- */
  function partirCaracteres(el) {
    var texto = el.textContent.trim();
    el.setAttribute("aria-label", texto);
    el.innerHTML = "";
    var palabras = texto.split(/\s+/);
    var chars = [];
    palabras.forEach(function (palabra, i) {
      var w = document.createElement("span");
      w.className = "split-word";
      w.setAttribute("aria-hidden", "true");
      Array.from(palabra).forEach(function (ch) {
        var c = document.createElement("span");
        c.className = "split-char";
        c.textContent = ch;
        w.appendChild(c);
        chars.push(c);
      });
      el.appendChild(w);
      if (i < palabras.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return chars;
  }

  $$(".titular").forEach(function (h2) {
    var primera = $(".tit-1", h2);
    var resto = $(".tit-r", h2);
    var clave = h2.dataset.pluma;
    var dato = TRAZOS.palabras && TRAZOS.palabras[clave];
    var chars = resto ? partirCaracteres(resto) : [];

    var caja = null, paths = [];
    if (primera && dato) {
      /* el texto serif se envuelve para poder atenuarlo mientras se escribe */
      var txt = document.createElement("span");
      txt.className = "tit-1-txt";
      txt.textContent = primera.textContent;
      primera.textContent = "";
      primera.appendChild(txt);

      caja = document.createElement("span");
      caja.className = "pluma-svg";
      caja.appendChild(svgDeTrazos(dato, "pluma-trazo"));
      primera.appendChild(caja);
      paths = $$("path", caja);
      gsap.set(txt, { opacity: 0 });
      primera.__txt = txt;
    }

    var tl = gsap.timeline({
      scrollTrigger: { trigger: h2, start: "top 84%", once: true }
    });

    if (paths.length) {
      var largos = dato.t.map(function (t) { return t[1] || 1; });
      escribir(tl, paths, largos, 0.8, 0, 0.82);
      /* la pluma cede el sitio a la tipografía serif */
      tl.to(primera.__txt, { opacity: 1, duration: 0.45, ease: "power2.out" }, ">-0.05");
      tl.to(paths, { opacity: 0, duration: 0.4, ease: "power1.out" }, "<");
    }
    if (chars.length) {
      tl.to(chars, {
        opacity: 1, y: 0, duration: 0.95, ease: "power2.out",
        stagger: { each: 0.026, from: "start" }
      }, paths.length ? "<0.05" : 0);
    }
  });

  /* --- Entradas genéricas ------------------------------------------------ */
  $$("[data-reveal]").forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true }
    });
  });

  /* --- Marquesina: lenta, en itálica, ligada también al scroll ----------- */
  (function marquesina() {
    var pista = $(".marquesina-pista");
    if (!pista) return;
    var mitad = pista.scrollWidth / 2;
    gsap.to(pista, { x: -mitad, duration: 34, ease: "none", repeat: -1 });
  })();

  /* --- Capítulos: pila pegajosa, pasar página y numeral que se dibuja ---- */
  (function capitulos() {
    $$(".cap").forEach(function (li, i) {
      var tarjeta = $(".cap-tarjeta", li);
      var caja = $(".cap-num", li);
      var dato = TRAZOS.numerales && TRAZOS.numerales[li.dataset.numeral];
      var paths = [];
      if (caja && dato) {
        caja.appendChild(svgDeTrazos(dato));
        paths = $$("path", caja);
      }

      var tl = gsap.timeline({
        scrollTrigger: { trigger: li, start: i === 0 ? "top 80%" : "top 72%", once: true }
      });

      /* pasar página: la tarjeta se descubre de derecha a izquierda */
      if (i > 0) {
        tl.fromTo(tarjeta,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.5, ease: "power2.inOut" }, 0);
      }
      if (paths.length) {
        var largos = dato.t.map(function (t) { return t[1] || 1; });
        escribir(tl, paths, largos, 0.85, i > 0 ? 0.28 : 0.1, 0.8);
      }
    });
  })();

  /* --- Contadores -------------------------------------------------------- */
  $$("[data-contador]").forEach(function (el) {
    var fin = parseInt(el.dataset.contador, 10) || 0;
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 92%", once: true,
      onEnter: function () {
        gsap.to(obj, {
          v: fin, duration: 1.6, ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(obj.v); }
        });
      }
    });
  });
  $$("[data-contador-dec]").forEach(function (el) {
    var fin = parseFloat(el.dataset.contadorDec) || 0;
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 92%", once: true,
      onEnter: function () {
        gsap.to(obj, {
          v: fin, duration: 1.8, ease: "power2.out",
          onUpdate: function () { el.textContent = obj.v.toFixed(1).replace(".", ","); }
        });
      }
    });
  });

  /* --- Botones magnéticos (solo con ratón) ------------------------------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    $$("[data-magnetic]").forEach(function (btn) {
      var xTo = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3" });
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.28);
      });
      btn.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });
  }

  /* --- Enlace activo en la navegación ------------------------------------ */
  $$(".nav a").forEach(function (a) {
    var destino = document.querySelector(a.getAttribute("href"));
    if (!destino) return;
    ScrollTrigger.create({
      trigger: destino, start: "top 50%", end: "bottom 50%",
      onToggle: function (self) { a.classList.toggle("is-active", self.isActive); }
    });
  });

  /* --- Lenis: el scroll, pausado ----------------------------------------- */
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* las fuentes y las imágenes cambian alturas: recalcular */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
