/* ==========================================================================
   NOTICIAS · la sección que mantiene el propio despacho
   ==========================================================================

   La sección «Noticias» NO lleva las publicaciones escritas en el código: las
   lee de una hoja de cálculo de Google publicada como JSON, para que en el
   despacho se pueda añadir o quitar una noticia sin tocar la web.

   Las cuatro de RESPALDO que hay más abajo se pintan SIEMPRE primero, antes
   de pedir la hoja. Si la hoja contesta, las sustituye; si no contesta (o no
   está configurada todavía), el visitante no ve ningún error: se queda con
   estas cuatro. Son las cuatro últimas publicadas en asesoriacervantes.com.

   --------------------------------------------------------------------------
   1 · LA HOJA
   --------------------------------------------------------------------------
   Cree una hoja de Google con ESTA PRIMERA FILA, exactamente con estos
   nombres de columna (en minúsculas):

     titulo | fecha | resumen | enlace | estado

     titulo ..... «Subvenciones al sector turístico»
     fecha ...... como quiera verla escrita: «Orden del 27 de junio de 2023»,
                  «Junio 2023» o «27/06/2023». Se muestra tal cual.
                  Déjela vacía si la noticia no lleva fecha.
     resumen .... dos o tres líneas. Es lo que se lee en la tarjeta.
     enlace ..... la dirección de la noticia completa (la de su web actual,
                  o la de donde la publique). Puede dejarla vacía.
     estado ..... déjelo vacío para publicar. Escriba «oculto» (o «no») para
                  retirar esa noticia de la web sin borrar la fila.

   Se muestran las CUATRO primeras filas visibles. Para cambiar el orden,
   mueva las filas en la hoja.

   --------------------------------------------------------------------------
   2 · PUBLICAR LA HOJA COMO JSON  (gratis, con Apps Script)
   --------------------------------------------------------------------------
   En la hoja: Extensiones › Apps Script, pegue esto, Implementar › Nueva
   implementación › Aplicación web › Quién tiene acceso: «Cualquier usuario».
   Copie la URL que le dé y péguela abajo, en HOJA.url.

       function doGet() {
         const h = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
         const [cab, ...filas] = h.getDataRange().getDisplayValues();
         const datos = filas
           .filter(f => f.join('').trim())
           .map(f => Object.fromEntries(cab.map((c, i) => [c.trim(), f[i]])));
         return ContentService
           .createTextOutput(JSON.stringify(datos))
           .setMimeType(ContentService.MimeType.JSON);
       }

   También sirve un servicio tipo SheetDB o Sheety: la web entiende tanto un
   array suelto como {datos:[...]} o {noticias:[...]}.

   --------------------------------------------------------------------------
   3 · MIENTRAS NO HAYA HOJA
   --------------------------------------------------------------------------
   Deje HOJA.url como está (cadena vacía). La web ni siquiera intentará la
   petición y mostrará las cuatro de respaldo.
   ========================================================================== */

window.NOTICIAS = {

  /* Pegue aquí la URL de la hoja publicada como JSON. Vacío = solo respaldo. */
  HOJA: {
    url: "",
    corte: 7000        // milisegundos antes de rendirse y quedarse con el respaldo
  },

  /* Las cuatro últimas publicadas en asesoriacervantes.com (septiembre 2026).
     Los títulos y los resúmenes son los suyos, resumidos; los enlaces llevan a
     la noticia completa en su web actual. */
  RESPALDO: [
    {
      titulo: "Asesoría Cervantes está en Accountex España 2024",
      fecha: "2024",
      resumen: "Estuvimos en Accountex España, la cita sobre el futuro del despacho profesional y la gestión empresarial, para seguir de cerca los retos de las asesorías y de los departamentos financieros de las pymes.",
      enlace: "https://asesoriacervantes.com/asesoria-cervantes-esta-en-accountex-espana-2024/"
    },
    {
      titulo: "Finalización de la situación de crisis sanitaria COVID-19",
      fecha: "",
      resumen: "El Consejo de Ministros aprobó un Acuerdo por el que se declara la finalización de la situación de crisis sanitaria ocasionada por la COVID-19.",
      enlace: "https://asesoriacervantes.com/finalizacion-covid/"
    },
    {
      titulo: "Subvenciones para apoyar iniciativas de emprendimiento",
      fecha: "Orden del 28 de junio de 2023",
      resumen: "Bases reguladoras de las subvenciones para apoyar iniciativas de emprendimiento y convocatoria para la anualidad 2023.",
      enlace: "https://asesoriacervantes.com/subvenciones-para-apoyar-iniciativas-de-emprendimiento/"
    },
    {
      titulo: "Subvenciones al sector turístico",
      fecha: "Orden del 27 de junio de 2023",
      resumen: "Bases reguladoras para la concesión de subvenciones al sector turístico destinadas a la promoción de la digitalización, con convocatoria para el año 2023.",
      enlace: "https://asesoriacervantes.com/subvenciones-turismo-junio2023/"
    }
  ]
};
