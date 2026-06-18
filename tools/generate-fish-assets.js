const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'fish');
const W = 720;
const H = 360;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function clamp(v, min = 0, max = 255) {
  return Math.max(min, Math.min(max, v));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function rgba(hex, a = 255) {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
    a,
  ];
}

function blendPixel(buf, x, y, color, alpha = color[3] / 255) {
  if (x < 0 || y < 0 || x >= W || y >= H || alpha <= 0) return;
  const idx = (Math.floor(y) * W + Math.floor(x)) * 4;
  const srcA = clamp(alpha * 255) / 255;
  const dstA = buf[idx + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA <= 0) return;
  buf[idx] = clamp((color[0] * srcA + buf[idx] * dstA * (1 - srcA)) / outA);
  buf[idx + 1] = clamp((color[1] * srcA + buf[idx + 1] * dstA * (1 - srcA)) / outA);
  buf[idx + 2] = clamp((color[2] * srcA + buf[idx + 2] * dstA * (1 - srcA)) / outA);
  buf[idx + 3] = clamp(outA * 255);
}

function fillEllipse(buf, cx, cy, rx, ry, colorFn) {
  const minX = Math.floor(cx - rx - 2);
  const maxX = Math.ceil(cx + rx + 2);
  const minY = Math.floor(cy - ry - 2);
  const maxY = Math.ceil(cy + ry + 2);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      const d = nx * nx + ny * ny;
      if (d <= 1.12) {
        const edge = clamp((1.12 - d) / 0.16, 0, 1);
        const color = colorFn(nx, ny, d, x, y);
        blendPixel(buf, x, y, color, edge * (color[3] / 255));
      }
    }
  }
}

function fillPolygon(buf, points, colorFn) {
  const minX = Math.floor(Math.min(...points.map((p) => p[0])) - 2);
  const maxX = Math.ceil(Math.max(...points.map((p) => p[0])) + 2);
  const minY = Math.floor(Math.min(...points.map((p) => p[1])) - 2);
  const maxY = Math.ceil(Math.max(...points.map((p) => p[1])) + 2);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i][0];
        const yi = points[i][1];
        const xj = points[j][0];
        const yj = points[j][1];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      if (!inside) continue;
      let edge = 1;
      for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        const dist = pointLineDistance(x, y, a[0], a[1], b[0], b[1]);
        edge = Math.min(edge, clamp(dist / 3, 0, 1));
      }
      blendPixel(buf, x, y, colorFn(x, y), edge);
    }
  }
}

function pointLineDistance(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D || 1;
  const param = clamp(dot / lenSq, 0, 1);
  const xx = x1 + param * C;
  const yy = y1 + param * D;
  return Math.hypot(px - xx, py - yy);
}

function strokeCurve(buf, points, color, width) {
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 1.6);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = mix(x1, x2, t);
      const y = mix(y1, y2, t);
      fillEllipse(buf, x, y, width, width, () => color);
    }
  }
}

function addScaleTexture(buf, cx, cy, rx, ry, color) {
  for (let row = -5; row <= 5; row++) {
    for (let col = -9; col <= 8; col++) {
      const x = cx + col * rx * 0.092 + (row % 2) * rx * 0.045;
      const y = cy + row * ry * 0.145;
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny > 0.82) continue;
      strokeCurve(buf, [
        [x - 8, y - 2],
        [x, y + 4],
        [x + 8, y - 2],
      ], color, 0.72);
    }
  }
}

function addEye(buf, x, y, scale) {
  const s = scale * 1.18;
  fillEllipse(buf, x, y, 10 * s, 10 * s, () => rgba('#f8fbff', 245));
  fillEllipse(buf, x + 1 * s, y + 1 * s, 5.4 * s, 5.4 * s, () => rgba('#06111a', 255));
  fillEllipse(buf, x - 2 * s, y - 3 * s, 2.2 * s, 2.2 * s, () => rgba('#ffffff', 230));
}

function addHighlights(buf, cx, cy, rx, ry) {
  strokeCurve(buf, [
    [cx - rx * 0.42, cy - ry * 0.42],
    [cx - rx * 0.18, cy - ry * 0.56],
    [cx + rx * 0.22, cy - ry * 0.45],
  ], rgba('#ffffff', 82), 1.4);
  strokeCurve(buf, [
    [cx - rx * 0.55, cy + ry * 0.18],
    [cx - rx * 0.18, cy + ry * 0.30],
    [cx + rx * 0.32, cy + ry * 0.18],
  ], rgba('#ffffff', 32), 1.1);
}

function addBodyVolume(buf, cx, cy, rx, ry, spec) {
  fillEllipse(buf, cx + rx * 0.08, cy - ry * 0.28, rx * 0.82, ry * 0.30, () => rgba('#ffffff', spec.topGlow || 58));
  fillEllipse(buf, cx - rx * 0.02, cy + ry * 0.38, rx * 0.88, ry * 0.24, () => rgba('#06131b', spec.bellyShade || 48));
  fillEllipse(buf, cx - rx * 0.56, cy + ry * 0.08, rx * 0.32, ry * 0.50, () => rgba('#041019', spec.tailShade || 34));
  fillEllipse(buf, cx + rx * 0.52, cy - ry * 0.04, rx * 0.22, ry * 0.42, () => rgba('#ffffff', spec.headGlow || 36));

  strokeCurve(buf, [
    [cx + rx * 0.42, cy - ry * 0.48],
    [cx + rx * 0.49, cy - ry * 0.20],
    [cx + rx * 0.45, cy + ry * 0.28],
  ], rgba('#1a2732', 62), 1.6);

  strokeCurve(buf, [
    [cx - rx * 0.76, cy],
    [cx - rx * 0.34, cy + ry * 0.04],
    [cx + rx * 0.36, cy + ry * 0.00],
  ], rgba('#ffffff', 42), 1);
}

function drawFish(spec) {
  const buf = Buffer.alloc(W * H * 4);
  const cx = 370;
  const cy = 180;
  const rx = spec.rx;
  const ry = spec.ry;
  const bodyA = rgba(spec.bodyA);
  const bodyB = rgba(spec.bodyB);
  const accent = rgba(spec.accent, spec.accentAlpha || 210);
  const fin = rgba(spec.fin, spec.finAlpha || 185);
  const dark = rgba(spec.dark || '#223344', 155);

  const tailBaseX = cx - rx * 0.86;
  fillPolygon(buf, [
    [tailBaseX, cy],
    [tailBaseX - spec.tail, cy - ry * 0.96],
    [tailBaseX - spec.tail * 0.68, cy - ry * 0.10],
    [tailBaseX - spec.tail, cy + ry * 0.96],
  ], (x, y) => {
    const t = Math.abs(y - cy) / (ry * 1.05);
    return [fin[0], fin[1], fin[2], clamp(fin[3] * (0.58 + t * 0.34))];
  });

  fillPolygon(buf, [
    [cx - rx * 0.26, cy - ry * 0.56],
    [cx + rx * 0.22, cy - ry * spec.dorsal],
    [cx + rx * 0.53, cy - ry * 0.50],
  ], () => fin);

  fillPolygon(buf, [
    [cx - rx * 0.08, cy + ry * 0.46],
    [cx + rx * 0.34, cy + ry * spec.ventral],
    [cx + rx * 0.60, cy + ry * 0.34],
  ], () => [fin[0], fin[1], fin[2], clamp(fin[3] * 0.74)]);

  fillEllipse(buf, cx, cy, rx, ry, (nx, ny) => {
    const dorsal = clamp(1 - Math.max(0, ny + 0.1), 0, 1);
    const roundness = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    const light = clamp(0.45 + roundness * 0.34 + dorsal * 0.16 + nx * 0.11, 0, 1);
    const shimmer = Math.sin((nx + 1.1) * 18) * 0.035 + Math.cos(ny * 16) * 0.025;
    const t = clamp(light + shimmer, 0, 1);
    return [
      clamp(mix(bodyA[0], bodyB[0], t)),
      clamp(mix(bodyA[1], bodyB[1], t)),
      clamp(mix(bodyA[2], bodyB[2], t)),
      255,
    ];
  });

  if (spec.pattern === 'clown') {
    for (const offset of [-0.48, -0.03, 0.44]) {
      fillEllipse(buf, cx + rx * offset, cy, rx * 0.14, ry * 1.02, () => rgba('#fff7df', 238));
      strokeCurve(buf, [
        [cx + rx * offset - 3, cy - ry * 0.88],
        [cx + rx * offset + 3, cy + ry * 0.88],
      ], rgba('#1b1c22', 160), 1.5);
    }
  }

  if (spec.pattern === 'koi') {
    fillEllipse(buf, cx + rx * 0.15, cy - ry * 0.30, rx * 0.25, ry * 0.24, () => rgba('#f4582a', 220));
    fillEllipse(buf, cx - rx * 0.26, cy + ry * 0.20, rx * 0.22, ry * 0.20, () => rgba('#f4582a', 205));
    fillEllipse(buf, cx + rx * 0.46, cy + ry * 0.08, rx * 0.16, ry * 0.16, () => rgba('#232b31', 170));
  }

  if (spec.pattern === 'betta') {
    for (let i = 0; i < 18; i++) {
      const y = cy - ry * 0.78 + i * ry * 0.092;
      strokeCurve(buf, [
        [tailBaseX - 8, y],
        [tailBaseX - spec.tail * 0.74, y + Math.sin(i) * 7],
      ], rgba('#ffffff', 48), 0.55);
    }
  }

  addBodyVolume(buf, cx, cy, rx, ry, spec);
  addScaleTexture(buf, cx, cy, rx, ry, [accent[0], accent[1], accent[2], 54]);
  addHighlights(buf, cx, cy, rx, ry);
  strokeCurve(buf, [
    [tailBaseX + 6, cy - ry * 0.65],
    [tailBaseX + 4, cy + ry * 0.65],
  ], dark, 1.1);

  const eyeX = cx + rx * 0.62;
  addEye(buf, eyeX, cy - ry * 0.18, spec.eyeScale || 1);
  strokeCurve(buf, [
    [cx + rx * 0.56, cy + ry * 0.18],
    [cx + rx * 0.70, cy + ry * 0.22],
  ], rgba('#151a1f', 92), 1.2);

  writePng(path.join(OUT_DIR, `${spec.id}.png`), buf, W, H);
}

function writePng(filename, rgbaBuffer, width, height) {
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgbaBuffer.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }

  const chunks = [
    chunk('IHDR', Buffer.concat([
      uint32(width),
      uint32(height),
      Buffer.from([8, 6, 0, 0, 0]),
    ])),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ];

  fs.writeFileSync(filename, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    ...chunks,
  ]));
}

function uint32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function chunk(type, data) {
  const name = Buffer.from(type);
  const crc = crc32(Buffer.concat([name, data]));
  return Buffer.concat([uint32(data.length), name, data, uint32(crc)]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

ensureDir(OUT_DIR);

[
  {
    id: 'koi',
    bodyA: '#fff6dd',
    bodyB: '#f3b04d',
    accent: '#ff6a2d',
    fin: '#fff0c9',
    rx: 205,
    ry: 69,
    tail: 145,
    dorsal: 1.18,
    ventral: 1.12,
    pattern: 'koi',
    eyeScale: 1,
  },
  {
    id: 'clownfish',
    bodyA: '#ff6a16',
    bodyB: '#ffbc2f',
    accent: '#ffffff',
    fin: '#fb7b1d',
    dark: '#101014',
    rx: 175,
    ry: 76,
    tail: 104,
    dorsal: 1.04,
    ventral: 0.96,
    pattern: 'clown',
    eyeScale: 0.92,
  },
  {
    id: 'betta',
    bodyA: '#1554b6',
    bodyB: '#2be2ff',
    accent: '#a7f5ff',
    fin: '#a820df',
    finAlpha: 155,
    rx: 150,
    ry: 60,
    tail: 190,
    dorsal: 1.34,
    ventral: 1.42,
    pattern: 'betta',
    eyeScale: 0.86,
  },
  {
    id: 'angelfish',
    bodyA: '#dbe7f0',
    bodyB: '#f7f7f1',
    accent: '#202735',
    fin: '#e7eef8',
    rx: 142,
    ry: 112,
    tail: 112,
    dorsal: 1.52,
    ventral: 1.64,
    pattern: 'plain',
    eyeScale: 0.88,
  },
  {
    id: 'guppy',
    bodyA: '#7af0d2',
    bodyB: '#f8f37b',
    accent: '#f3449b',
    fin: '#ff4aa2',
    finAlpha: 172,
    rx: 132,
    ry: 44,
    tail: 132,
    dorsal: 1.20,
    ventral: 1.04,
    pattern: 'betta',
    eyeScale: 0.72,
  },
  {
    id: 'blueTang',
    bodyA: '#1641c8',
    bodyB: '#2fe7ff',
    accent: '#fff24f',
    fin: '#10236e',
    rx: 155,
    ry: 62,
    tail: 118,
    dorsal: 1.08,
    ventral: 1.02,
    pattern: 'plain',
    eyeScale: 0.82,
  },
  {
    id: 'discus',
    bodyA: '#ff5548',
    bodyB: '#45ddff',
    accent: '#fff36b',
    fin: '#ff7ad9',
    finAlpha: 166,
    rx: 128,
    ry: 118,
    tail: 78,
    dorsal: 1.28,
    ventral: 1.26,
    pattern: 'plain',
    eyeScale: 0.82,
  },
  {
    id: 'neonTetra',
    bodyA: '#0f6cff',
    bodyB: '#6dfff2',
    accent: '#ff3758',
    fin: '#dffcff',
    finAlpha: 132,
    rx: 126,
    ry: 34,
    tail: 96,
    dorsal: 0.92,
    ventral: 0.86,
    pattern: 'plain',
    eyeScale: 0.62,
  },
  {
    id: 'butterflyfish',
    bodyA: '#fff2a3',
    bodyB: '#ffcc27',
    accent: '#15171b',
    fin: '#fff0a8',
    rx: 145,
    ry: 82,
    tail: 94,
    dorsal: 1.24,
    ventral: 1.08,
    pattern: 'plain',
    eyeScale: 0.78,
  },
  {
    id: 'yellowTang',
    bodyA: '#fff14f',
    bodyB: '#ffcb18',
    accent: '#163c8a',
    fin: '#fff581',
    rx: 162,
    ry: 66,
    tail: 124,
    dorsal: 1.00,
    ventral: 0.95,
    pattern: 'plain',
    eyeScale: 0.80,
  },
  {
    id: 'parrotfish',
    bodyA: '#35d6ff',
    bodyB: '#ff6dc6',
    accent: '#fff15f',
    fin: '#6effab',
    rx: 182,
    ry: 82,
    tail: 110,
    dorsal: 1.16,
    ventral: 1.02,
    pattern: 'plain',
    eyeScale: 0.84,
  },
  {
    id: 'moorishIdol',
    bodyA: '#fff3b5',
    bodyB: '#101922',
    accent: '#ffba2e',
    fin: '#faf1c6',
    rx: 188,
    ry: 78,
    tail: 112,
    dorsal: 1.12,
    ventral: 1.00,
    pattern: 'plain',
    eyeScale: 0.82,
  },
  {
    id: 'cardinalfish',
    bodyA: '#ff5d4a',
    bodyB: '#ffcc5a',
    accent: '#fff4d8',
    fin: '#ff8d66',
    rx: 138,
    ry: 56,
    tail: 114,
    dorsal: 1.04,
    ventral: 0.98,
    pattern: 'plain',
    eyeScale: 0.82,
  },
  {
    id: 'foxface',
    bodyA: '#ffd34f',
    bodyB: '#ff8b1e',
    accent: '#1d2430',
    fin: '#fff0a2',
    rx: 174,
    ry: 74,
    tail: 120,
    dorsal: 1.08,
    ventral: 1.00,
    pattern: 'plain',
    eyeScale: 0.84,
  },
].forEach(drawFish);

console.log(`Generated transparent PNG fish assets in ${OUT_DIR}`);
