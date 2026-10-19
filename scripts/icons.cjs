// Erzeugt die PNG-Icons aus public/icon.svg (einmalig bei Änderungen am Icon).
// Aufruf: NODE_PATH=$(npm root -g) node scripts/icons.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const svg = fs.readFileSync(path.join(__dirname, '../public/icon.svg'), 'utf8');
const targets = [
  ['apple-touch-icon.png', 180, 1],
  ['icon-192.png', 192, 1],
  ['icon-512.png', 512, 1],
  // Maskierbares Icon: Motiv etwas kleiner, damit es in jede Maske passt.
  ['icon-maskable-512.png', 512, 0.8]
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [file, size, scale] of targets) {
    await page.setViewportSize({ width: size, height: size });
    const inner = size * scale;
    const off = (size - inner) / 2;
    await page.setContent(
      `<html><body style="margin:0;background:#2B4D47">` +
        `<div style="position:absolute;left:${off}px;top:${off}px;width:${inner}px;height:${inner}px">` +
        svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `) +
        `</div></body></html>`
    );
    await page.screenshot({ path: path.join(__dirname, '../public', file) });
  }
  await browser.close();
})();
