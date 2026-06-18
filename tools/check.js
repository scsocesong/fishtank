const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const checks = [
  ['node', ['--check', 'app.js']],
  ['node', ['--check', 'tools/generate-fish-assets.js']],
  ['node', ['--check', 'tools/serve.js']],
];

let failed = false;
for (const [cmd, args] of checks) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) failed = true;
}

for (const file of ['index.html', 'styles.css', 'app.js', 'tools/serve.js', 'assets/fish-data.js']) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    console.error(`Missing required file: ${file}`);
    failed = true;
  }
}

for (const file of ['koi.png', 'clownfish.png', 'betta.png', 'angelfish.png', 'guppy.png', 'blueTang.png', 'discus.png', 'neonTetra.png', 'butterflyfish.png', 'yellowTang.png', 'parrotfish.png', 'moorishIdol.png', 'cardinalfish.png', 'foxface.png']) {
  const full = path.join(root, 'assets', 'fish', file);
  if (!fs.existsSync(full)) {
    console.error(`Missing fish texture: ${file}`);
    failed = true;
    continue;
  }
  const png = fs.readFileSync(full);
  if (png[25] !== 6) {
    console.error(`Fish texture is not RGBA PNG: ${file}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
