const { chromium } = require('playwright');
const url = require('url'), path = require('path'), fs = require('fs');
(async () => {
  const svg = fs.readFileSync('../assets/img/brand/icon.svg', 'utf8');
  const b = await chromium.launch();
  for (const s of [96, 180, 192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<style>html,body{margin:0}svg{display:block;width:${s}px;height:${s}px}</style>${svg}`);
    await p.screenshot({ path: `../assets/img/brand/icon-${s}.png`, omitBackground: true });
    await p.close();
  }
  await b.close();
  console.log('iconos PNG listos');
})();
