const { chromium } = require('playwright');
const url = require('url'), path = require('path');
(async () => {
  const [file, out, w, h] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w || 900, height: +h || 900 }, deviceScaleFactor: 2 });
  await p.goto(url.pathToFileURL(path.resolve(file)).href, { waitUntil: 'networkidle' });
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
})();
