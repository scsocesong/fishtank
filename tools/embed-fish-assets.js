const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const fishDir = path.join(root, 'assets', 'fish');
const outFile = path.join(root, 'assets', 'fish-data.js');

const ids = ['koi', 'clownfish', 'betta', 'angelfish', 'guppy', 'blueTang', 'discus', 'neonTetra', 'butterflyfish', 'yellowTang', 'parrotfish', 'moorishIdol', 'cardinalfish', 'foxface'];
const data = {};

for (const id of ids) {
  const file = path.join(fishDir, `${id}.png`);
  const png = fs.readFileSync(file);
  data[id] = `data:image/png;base64,${png.toString('base64')}`;
}

const body = `window.FISH_TEXTURE_DATA = ${JSON.stringify(data)};\n`;
fs.writeFileSync(outFile, body, 'utf8');
console.log(`Wrote ${outFile}`);
