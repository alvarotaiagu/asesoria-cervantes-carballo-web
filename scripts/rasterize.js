const { chromium } = require('playwright');
const url = require('url'), path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1040, height: 320 }, deviceScaleFactor: 2 });
  for (const n of process.argv.slice(2)) {
    await p.goto(url.pathToFileURL(path.resolve(n + '.svg')).href);
    await p.screenshot({ path: 'raster-' + n + '.png' });
  }
  await b.close();
})();
