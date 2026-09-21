# Asesoría Cervantes SL · web «Pluma»

Web de una página para **Asesoría Cervantes SL** (Gran Vía 23-25, 1º · 15100 Carballo,
A Coruña). Sustituye a la actual de WordPress, de la que solo se han tomado los datos:
ni la estructura ni el estilo.

**Concepto:** el logotipo es una firma caligráfica y el negocio se llama como un
escritor, así que **la web se escribe sola** y **cada área de trabajo es un capítulo**.
El wordmark se dibuja a mano al cargar, cada titular lo anuncia un trazo de pluma que
escribe su primera palabra, los capítulos se pasan como páginas y los numerales
romanos se dibujan a trazo.

- Paleta: hueso `#F4F0E8` (papel) · verde salvia `#8CAA88` (pluma) · verde tinta
  `#22332B` (texto y contraportada) · arena `#E8B469` **solo** en los numerales.
- Tipografía: **Newsreader** (serif de libro, con itálicas de verdad) para titulares y
  cuerpo; **Inter** para la interfaz. La caligrafía no es una fuente de texto: son
  trazos dibujados, y solo aparece en el logo y en los numerales de capítulo.
- Modo claro. La contraportada (pie) va en verde tinta oscuro.

---

## Cómo se ve

```
python -m http.server 8971      # desde esta carpeta
# y abrir http://127.0.0.1:8971/
```

Hace falta un servidor: con `file://` no cargan los módulos ni las máscaras CSS.

---

## Archivos

```
index.html                 una sola página; el SVG del wordmark va en línea
css/style.css              todo el estilo
js/main.js                 movimiento y utilidades
js/noticias-datos.js       LAS NOTICIAS SE EDITAN AQUÍ (o desde una hoja de Google)
js/trazos-datos.js         la caligrafía dibujada (generado, no editar a mano)
assets/img/brand/          wordmark, la «C», iconos, logo de Kit Digital
assets/img/photos/         fotografía de ambiente, ya igualada de color
scripts/                   herramientas de construcción y la verificación
screenshots/               capturas de la verificación
```

---

## Lo que hay que rellenar

Todo lo que falta está **marcado a la vista en la propia página**, entre corchetes,
para que se vea de un vistazo qué queda. Nada de esto se ha inventado.

| Qué falta | Dónde está | Qué hacer |
|---|---|---|
| **Año de fundación** | hero, bajo el subtítulo | Ver más abajo: es el único dato contradictorio de su web |
| Foto del equipo, nombres, cargos y nº de personas | Prólogo, bloque «El equipo» | Enviar foto y nombres; sustituir el marco de puntos |
| Rol en Kit Digital | pie | ¿Agente digitalizador o beneficiario? Su web no lo dice |
| Confirmar el enlace de «Acceso clientes» | hero, sección Clientes y pie | Ver más abajo |
| Redes sociales | — | Su web actual **no enlaza ninguna**. No se han puesto |
| Precios / tarifas | — | No hay ninguno publicado. No se han inventado |
| Colegiación, premios, certificaciones | — | No consta ninguno. No se han inventado |

### El año de fundación

Su web se contradice **en la misma página**:

- Portada y titular de «Sobre nosotros»: **«Desde 1986»**
- Cuerpo de «Sobre nosotros»: **«Fundada en 1984»**

La web usa **1986** (es lo que aparece dos veces y en la portada) y **no afirma los
40 años**, porque esa cifra depende justo del dato en duda. En el hero hay una línea
que lo deja dicho: *«Año de fundación a confirmar: 1984 o 1986»*.

**Cuando lo confirmen**, en `js/main.js` (arriba del todo):

```js
var ANIO_1986_CONFIRMADO = false;   // póngalo en true
```

Con `true`, esa línea pasa a decir **«Capítulo cuarenta»** y desaparece el aviso.
Si el año bueno resulta ser 1984, hay que cambiar además los «1986» del `index.html`
(subtítulo del hero, primer párrafo del prólogo y pie) y el `foundingDate` del
JSON-LD.

### Los dos enlaces

El encargo los daba por no localizables. **Sí están en el HTML de su web actual**, y se
han usado, pero **conviene que los confirmen antes de publicar**:

- **Acceso clientes (Ubyquo)** → `https://cic.quantyca.com/login`
  Es el destino del elemento del menú que su web rotula literalmente «Ubyquo».
  Quantyca es la empresa detrás de Ubyquo, así que encaja, pero no lo hemos podido
  comprobar desde dentro. En la página hay un aviso visible de que está pendiente de
  confirmación; **quítelo** cuando lo confirmen (párrafo `.aviso-url` en la sección
  «Acceso clientes» de `index.html`).
- **Canal Interno de Información** → el formulario de `forms.office.com` al que apuntan
  tanto el botón del pie como el QR rotulado «Canal Interno de Información de Asesoría
  Cervantes SL».

---

## Las noticias las lleva el propio despacho

La sección «Noticias» **no tiene las publicaciones escritas en el código**: las lee de
una hoja de cálculo de Google publicada como JSON, para poder añadir o quitar una
noticia sin tocar la web.

Las instrucciones completas (columnas de la hoja, el código de Apps Script que hay que
pegar, cómo ocultar una fila sin borrarla) están **dentro de
`js/noticias-datos.js`**, en castellano y paso a paso.

Mientras no haya hoja, se muestran **las cuatro últimas publicadas en
asesoriacervantes.com**, que ya están puestas como respaldo:

1. Asesoría Cervantes está en Accountex España 2024
2. Finalización de la situación de crisis sanitaria COVID-19
3. Subvenciones para apoyar iniciativas de emprendimiento (Orden 28/06/2023)
4. Subvenciones al sector turístico (Orden 27/06/2023)

El respaldo **se pinta siempre primero**, antes de pedir la hoja. Si la hoja no
contesta, el visitante no ve ningún error: se queda con estas cuatro.

---

## Datos reales usados

Tomados de asesoriacervantes.com y de su ficha de Google:

- **Dirección:** Gran Vía, 23-25, Piso 1º · 15100 Carballo, A Coruña
- **Teléfono:** 981 70 27 55 · **Correo:** info@asesoriacervantes.com
- **Valoración:** 4,6 ★ con 39 reseñas en Google
- **Cuatro reseñas** de su ficha de Google, transcritas literalmente de las capturas
  que envió el cliente. **Los apellidos van abreviados** («Estefanía R.», «Ana G.»,
  «Jesús Manuel R.», «Ca D.»). Las erratas del original se han respetado porque son
  citas, no texto nuestro; solo se ha separado un punto pegado
  («asesores.con» → «asesores. Con»)
- **Horario**, las dos temporadas, tal y como figura en su página de contacto
- **Servicios**, agrupados en cuatro áreas a partir de su página de servicios
- **Textos propios**, adaptados (no copiados literalmente)
- **Kit Digital:** se muestra el logotipo del programa sin afirmar nada más que lo que
  ellos dicen
- **Accountex España 2024:** citado como noticia suya

### Dos cosas que dicen las reseñas y no están en la web

Al transcribirlas aparecieron dos servicios que **su web actual no menciona** y que por
eso **no se han puesto** en la página:

- *«además de poder contratar un **seguro de coche** muy asequible»*
- *«Inmejorable equipo de asesores. Con **abogados** y gestores especializados»*

Si también hacen seguros o tienen abogados en plantilla, merece la pena decirlo: hoy la
web solo habla de fiscal, contable, laboral y mercantil. Habría que confirmarlo antes de
añadir nada.

---

## El logotipo

El wordmark **es el suyo**: se ha partido del PNG de su web
(`cervantes-325px.png` / `cervantes1-2.png`) y se ha vectorizado. El SVG tiene dos
capas:

- **el relleno**, que es el contorno real del logo, vectorizado (`potrace`);
- **quince trazos de línea central** que siguen el recorrido real de la mano
  (el *ductus*), que son los que se animan.

La línea central no se dibujó a ojo: se obtuvo adelgazando el logo hasta dejarlo de un
píxel de ancho (Zhang-Suen), convirtiéndolo en grafo y recorriéndolo eligiendo en cada
cruce la dirección que menos gira, que es como se enlaza una cursiva a mano. Luego se
ordenó de izquierda a derecha, con la barra de la «t» al final.

Todos los paths llevan `pathLength="1"`, así que el `stroke-dasharray` **no depende del
tamaño**: la escritura es idéntica a 400 px que a 2000 px de ancho.

La misma tubería genera la palabra caligráfica de cada titular y los numerales
`I · II · III · IV` (ver `scripts/pen_words.py` y `scripts/numerals.py`).

### Regenerar la caligrafía

```
cd scripts
pip install potracer numpy pillow
python trace_wordmark.py     # el wordmark a partir del PNG
python skeleton.py           # adelgazado
python ductus.py             # orden de escritura
python build_wordmark.py     # SVG final
python pen_words.py          # las palabras de los titulares
python numerals.py           # I · II · III · IV
python generate_brand.py     # la «C» y los iconos
```

Para **añadir una palabra** a un titular nuevo: añádala a `PALABRAS` en
`scripts/pen_words.py`, vuelva a ejecutarlo, y ponga `data-pluma="LaPalabra"` en el
`<h2 class="titular">`.

---

## Fotografía

> **Aviso importante.** El encargo pedía *generar* fotografía original. En este entorno
> no hay herramienta de generación de imágenes, así que **son fotografías de archivo
> con licencia de Pexels**, elegidas una a una para que encajen con el concepto
> (pluma, papel, madera clara, luz de mañana) e **igualadas todas con la misma
> gradación de color** (cremas cálidos, verdes apagados, sombras templadas) para que no
> parezcan un collage. En la página van rotuladas **«Fotografía de ambiente»**.
> Si quieren fotos reales del despacho, sustituyen a estas sin tocar nada más.

| Archivo | Pexels | Qué es |
|---|---|---|
| `caligrafia` | 114107 | Plumilla sobre una hoja de caligrafía |
| `escritorio` | 8250969 | Escritorio de madera clara con eucalipto |
| `pluma-sobres` | 9786294 | Estilográfica y sobres color hueso |
| `manos` | 8376141 | Manos escribiendo en un bloc |
| `despacho` | 36887756 | Estantería verde y madera clara |
| `archivo` | 11176866 | Carpetas ordenadas |
| `luz` | 18886987 | Luz de ventana sobre una pared |

**No hay ningún retrato de persona, y es a propósito.** Poner una cara de banco de
imágenes presentada como «el equipo» de un negocio real sería engañoso, así que ese
bloque es un marco marcado como pendiente. Se regeneran con
`python scripts/process_photos.py`.

---

## Accesibilidad y privacidad

- **Sin JavaScript, sin CDN o con «reducir movimiento» activado, la página se ve
  entera y quieta**: el wordmark aparece ya escrito, los textos visibles y el teléfono,
  el correo y el horario funcionan. Los estados ocultos de la animación viven bajo
  `html.has-motion`, que solo se añade cuando GSAP ha cargado y no se ha pedido menos
  movimiento.
- Con `prefers-reduced-motion` no hay escritura, ni pasar página, ni contadores.
- **El mapa de Google no se carga hasta que el visitante pulsa el botón.** Así no se
  contradice el aviso de cookies, que dice que no hay cookies de terceros.
- El aviso de cookies **cierra de verdad**: hay una regla `.cookie-banner[hidden]`
  explícita, porque `display:flex` empata en especificidad con el `[hidden]` del
  navegador y sin ella el botón no haría nada.
- Navegación por teclado con enlace de salto, `:focus-visible` visible y textos
  alternativos en todas las imágenes.
- Sin `canvas`: ningún desenfoque ni sombra por fotograma.

---

## El control de paleta (demostración, quitar antes de dar la web por oficial)

Un cliente de otra asesoría (Dourado & Fernández) vio la maqueta de su propia web en
una reunión y no le convenció el verde. Desde entonces, todas las plantillas del
sector asesoría/gestoría llevan un mando para enseñar la misma web en varios colores
distintos delante del cliente, sin tener que reeditar el CSS a cada rato. **Esto no es
parte del sitio**: es una herramienta de venta mientras se decide la marca, y se
retira al entregar la web ya como oficial.

**Actualización (2026-09-21):** este sitio (y sus 6 hermanos de asesoría/gestoría) se
envían por correo a Dourado & Fernández, un cliente real, para que elija qué
ESTRUCTURA/CONCEPTO de plantilla prefiere. Dourado & Fernández ya tiene su propia web
construida en su rojo de marca real, sobre papel blanco puro. Para que el color Y el
fondo dejen de ser una variable en esa comparación — y el cliente compare solo
estructura, viendo cada plantilla ya en «su» color y «su» papel — el rojo real de
Dourado & Fernández y su blanco pasaron a ser la paleta **por defecto** (el `:root`,
sin clase) en los 7 sitios. El verde salvia y el crema real de este sitio no han
desaparecido: siguen siendo una opción del mando, ahora con el nombre **Original**.

Las cuatro paletas (cambia el color de marca y, solo en Rojo, también el papel — la
tinta es la misma en las cuatro):

| Paleta | `--salvia` | `--salvia-osc` | `--oliva` | `--arena` | `--papel` / `-2` / `-3` | Por qué |
|---|---|---|---|---|---|---|
| **Rojo** (por defecto, sin clase) | `#D68A8D` | `#7A1418` | `#9C2A2E` | `#C4585C` | `#FFFFFF` / `#F2F0EA` / `#EAE6DC` | Rojo Y papel blanco reales de Dourado & Fernández (`dourado-fernandez-asesores-carballo-web`: su `--crema`/`--crema-2` tal cual; `--papel-3` no tiene equivalente allí y sigue el mismo paso de gris cálido), para el correo comparativo |
| **Original** | `#8CAA88` | `#6E8C6B` | `#93A86D` | `#E8B469` | `#F4F0E8` / `#EFEADF` / `#E7E0D1` | El verde salvia + arena + papel crema real de este sitio (era la paleta por defecto hasta el 2026-09-21) |
| **Añil** | `#909FC1` | `#3E4F7E` | `#6194AE` | `#E4A758` | `#F4F0E8` / `#EFEADF` / `#E7E0D1` | Azul de registro contable/financiero (papel crema propio, no el blanco de Dourado) |
| **Sepia** | `#C78D70` | `#79412A` | `#C9664A` | `#E2A350` | `#F4F0E8` / `#EFEADF` / `#E7E0D1` | Tinta cálida, coherente con el concepto «Pluma» (papel crema propio, no el blanco de Dourado) |

El rojo de Dourado & Fernández no se copió literal en las cuatro variables: su propia
web usa `--oro` (#9C2A2E, el acento principal) y `--oro-tinta` (#7A1418, la variante
oscura para texto, ~10:1 sobre blanco/crema por su propia documentación) tal cual, para
`--oliva` y `--salvia-osc`. Pero `--salvia` hace doble papel en este sitio — es fondo
de botón bajo texto oscuro (`.btn-pluma`) Y es texto claro sobre `--tinta` oscura
(`.pie h4`, `.pie-pendiente` en el pie de página) — y un rojo necesita mucha más luz
que un verde para el mismo contraste (el canal verde pesa 0.7152 en la luminancia WCAG,
el rojo solo 0.2126). Por eso `--salvia` y `--arena` son un aclarado (mismo matiz y
saturación, 358°/48%, más claro) de `--oro-claro` (#C4585C) de Dourado, no el tono
literal: `--arena` se quedó en el propio `#C4585C` (uso decorativo/gráfico, umbral
WCAG 3:1) y `--salvia` se aclaró hasta `#D68A8D` para llegar a ≥4.5:1 en sus dos usos
de texto.

Los tonos de marca se comprobaron con la fórmula de contraste WCAG (luminancia
relativa sRGB) contra `--papel` y `--tinta`, en los sitios donde se usan como texto
(no en los puramente decorativos, como el trazo del SVG o la máscara del separador).
La paleta Rojo iguala o mejora los contrastes de la paleta Original en esos mismos
usos: `--salvia-osc` sobre `--papel` pasa de 3.28:1 (Original, sobre el crema
`#F4F0E8`) a 10.82:1 (Rojo, sobre el blanco `#FFFFFF` — mejora aún más que el 9.52:1
que daba antes de que Rojo también llevara el papel blanco de Dourado); `--salvia`
sobre `--tinta` (texto del pie) pasa de 5.21:1 a 5.00:1, y sobre el texto oscuro del
botón (`#14211B`) llega a 6.24:1. `--tinta` sobre `--papel` (el texto de cuerpo)
también mejora con el blanco: de 11.67:1 (Original, sobre crema) a 13.32:1 (Rojo).

**Cómo se quita al entregar la web ya como oficial** (4 sitios, y decidir antes cuál
de las cuatro paletas se queda como la real):

1. `index.html`: borrar el `<script>` del `<head>` que lee `localStorage` (busca
   `cervantes-paleta`) y el bloque `<div class="paleta" id="paleta" hidden>…</div>`
   junto al aviso de cookies.
2. `css/style.css`: decidir qué paleta queda como `:root` (si es Original, devolver
   los siete valores de `--papel`/`--papel-2`/`--papel-3`/`--salvia`/`--salvia-osc`/
   `--oliva`/`--arena` a los de la fila «Original» de la tabla — Rojo es la única que
   también cambia el papel, no solo el color de marca), borrar los bloques
   `html.paleta-original { … }`, `html.paleta-anil { … }` y `html.paleta-sepia { … }`
   (justo debajo de `:root`) y el bloque «Control de paleta (demostración…)» (junto al
   aviso de cookies).
3. `js/main.js`: borrar la función `initPaleta()` completa. Si no se usa en ningún otro
   sitio, también se puede quitar `actualizarAlturaCookie()` / `--cookie-h` de
   `avisoCookies()`, aunque no hace daño dejarlo.
4. `scripts/verify.js`: borrar la sección «10 · Control de paleta».

---

## Verificación

```
python -m http.server 8971
NODE_PATH=/c/Users/alvar/node_modules node scripts/verify.js
```

**50/52 pruebas correctas.** Resultado completo en `scripts/verify-report.json`. Los dos
fallos (titulares que no siempre se asientan en serif tras el recorrido con la rueda, y
los numerales de capítulo) son anteriores al control de paleta — no los toca este
cambio, ni el papel blanco de Rojo del 2026-09-21 — y no se reproducen siempre; quedan
pendientes de revisar aparte.

Cubre: el wordmark se escribe y luego se rellena; `pathLength="1"` en todos los trazos;
los seis titulares se asientan en serif sin dejar caracteres ocultos; los cuatro
numerales se dibujan; las tarjetas de la pila miden todas lo mismo y ninguna asoma por
debajo (medido recorriendo la sección de 60 en 60 px); las noticias desde la hoja,
con claves en mayúsculas y respetando «oculto», **y el respaldo con `route.abort()`**;
el mapa solo tras el clic; el botón de cookies; `reduced-motion`; sin JS; sin CDN;
400 / 390 / 820 px sin scroll horizontal; **y el control de paleta** (aparece con JS,
cada botón cambia una clase y un color de verdad, se guarda en `localStorage` y se
aplica de nuevo al recargar sin fogonazo, ya en `domcontentloaded`).

> Nota para quien retoque las pruebas: hay que recorrer la página **con la rueda**
> (`mouse.wheel`), no con `window.scrollTo`. La página lleva Lenis, que gestiona el
> scroll él mismo, y un `scrollTo` programático se pelea con su posición interna:
> ScrollTrigger puede no enterarse de haber pasado por una sección y los titulares del
> final se quedan sin disparar. No es un fallo de la web; se comprobó que con rueda
> los seis se asientan.

---

## Esta plantilla dentro del catálogo

Tercera del sector asesoría/gestoría, y deliberadamente distinta de las otras dos:

| | Concepto | Color | Estructura propia |
|---|---|---|---|
| Dourado & Fernández | «Balance» | verde botella + oro | columnas contables que cuadran |
| Rivand Asesores | «Cuenta atrás» | azul noche + cobre | dial de trimestres |
| **Cervantes** | **«Pluma»** | **papel + salvia + arena** | **capítulos que se pasan, caligrafía que escribe** |

Comparte el material «pluma y papel» con las plantillas legales, pero el lenguaje es
otro: **aquí no hay sellos, ni firmas al pie, ni subrayados de rotulador** (eso es
Castro Pombo «Escritura» y MJ Ramos «Cláusula»). Aquí la caligrafía **escribe**.
