const canvas = document.getElementById('aquarium');
const app = document.querySelector('.app');

const tankOptionsEl = document.getElementById('tankOptions');
const fishOptionsEl = document.getElementById('fishOptions');
const decorOptionsEl = document.getElementById('decorOptions');
const tankLabelEl = document.getElementById('tankLabel');
const moodLabelEl = document.getElementById('moodLabel');
const densityRange = document.getElementById('densityRange');
const currentRange = document.getElementById('currentRange');
const lightRange = document.getElementById('lightRange');
const randomizeButton = document.getElementById('randomizeButton');
const musicButton = document.getElementById('musicButton');
const showcaseButton = document.getElementById('showcaseButton');
const exitShowcaseButton = document.getElementById('exitShowcaseButton');

if (!window.THREE) {
  const error = document.createElement('div');
  error.style.cssText = [
    'position:absolute',
    'inset:24px',
    'z-index:20',
    'display:grid',
    'place-items:center',
    'padding:24px',
    'border-radius:8px',
    'background:rgba(5,10,14,0.92)',
    'color:white',
    'font:600 16px/1.5 system-ui, sans-serif',
    'text-align:center',
  ].join(';');
  error.textContent = 'Three.js 没有加载成功。请连接网络后刷新，或用 npm start 通过本地服务打开页面。';
  document.querySelector('.stage').appendChild(error);
  throw new Error('THREE global is missing');
}

const tanks = [
  {
    id: 'tropical',
    name: '热带黑缸',
    desc: '黑底聚光',
    mood: '黑底聚光 · 热带海草与珊瑚',
    water: 0x10283a,
    glass: 0x94e7ff,
    sand: 0xded7c2,
    back: 0x020304,
  },
  {
    id: 'reef',
    name: '珊瑚海缸',
    desc: '海蓝光',
    mood: '柔和海蓝光 · 珊瑚与鱼群',
    water: 0x0b6381,
    glass: 0xb8f7ff,
    sand: 0xe2c996,
    back: 0x042237,
  },
  {
    id: 'planted',
    name: '自然草缸',
    desc: '清透绿影',
    mood: '清透绿影 · 沉木与水草',
    water: 0x1a7169,
    glass: 0xb5ffe6,
    sand: 0xb69362,
    back: 0x071b16,
  },
  {
    id: 'zen',
    name: '极简岩景',
    desc: '冷白灯',
    mood: '冷白顶光 · 黑石与白砂',
    water: 0x3f7885,
    glass: 0xe5fdff,
    sand: 0xd8d4c7,
    back: 0x0b1218,
  },
];

const fishTypes = [
  { id: 'koi', name: '锦鲤', desc: '宽尾慢游', src: 'assets/fish/koi.png', size: 1.42, speed: 0.30, sway: 0.62, pace: 0.78 },
  { id: 'clownfish', name: '小丑鱼', desc: '短促摆尾', src: 'assets/fish/clownfish.png', size: 0.88, speed: 0.95, sway: 1.18, pace: 1.22 },
  { id: 'betta', name: '斗鱼', desc: '长鳍漂游', src: 'assets/fish/betta.png', size: 1.14, speed: 0.26, sway: 0.82, pace: 0.70 },
  { id: 'angelfish', name: '神仙鱼', desc: '优雅巡游', src: 'assets/fish/angelfish.png', size: 1.08, speed: 0.40, sway: 0.58, pace: 0.84 },
  { id: 'guppy', name: '孔雀鱼', desc: '小群快游', src: 'assets/fish/guppy.png', size: 0.62, speed: 1.20, sway: 1.52, pace: 1.36 },
  { id: 'blueTang', name: '蓝倒吊', desc: '亮蓝快游', src: 'assets/fish/blueTang.png', size: 0.86, speed: 1.02, sway: 1.12, pace: 1.22 },
  { id: 'discus', name: '七彩神仙', desc: '圆身慢游', src: 'assets/fish/discus.png', size: 1.02, speed: 0.34, sway: 0.62, pace: 0.78 },
  { id: 'neonTetra', name: '霓虹灯鱼', desc: '小群闪游', src: 'assets/fish/neonTetra.png', size: 0.48, speed: 1.32, sway: 1.58, pace: 1.46 },
  { id: 'butterflyfish', name: '蝴蝶鱼', desc: '黄白巡游', src: 'assets/fish/butterflyfish.png', size: 0.90, speed: 0.72, sway: 0.92, pace: 1.02 },
  { id: 'yellowTang', name: '黄倒吊', desc: '亮黄巡游', src: 'assets/fish/yellowTang.png', size: 0.86, speed: 0.92, sway: 1.02, pace: 1.15 },
  { id: 'parrotfish', name: '鹦嘴鱼', desc: '彩色慢游', src: 'assets/fish/parrotfish.png', size: 1.05, speed: 0.46, sway: 0.78, pace: 0.86 },
  { id: 'moorishIdol', name: '角镰鱼', desc: '黑白黄带', src: 'assets/fish/moorishIdol.png', size: 0.98, speed: 0.64, sway: 0.88, pace: 0.96 },
  { id: 'cardinalfish', name: '天竺鲷', desc: '红橙小鱼', src: 'assets/fish/cardinalfish.png', size: 0.70, speed: 1.02, sway: 1.18, pace: 1.22 },
  { id: 'foxface', name: '狐狸鱼', desc: '黄橙海鱼', src: 'assets/fish/foxface.png', size: 0.95, speed: 0.74, sway: 0.92, pace: 1.00 },
];

const decorOptions = [
  { id: 'coral', name: '珊瑚群', desc: '暖色枝状' },
  { id: 'grass', name: '高水草', desc: '前后摆动' },
  { id: 'wood', name: '沉木', desc: '自然缸景' },
  { id: 'stone', name: '黑石阵', desc: '极简层次' },
];

const state = {
  tank: 'tropical',
  decor: new Set(['coral', 'grass']),
  counts: { koi: 1, clownfish: 4, betta: 1, angelfish: 2, guppy: 4, blueTang: 2, discus: 2, neonTetra: 6, butterflyfish: 2, yellowTang: 2, parrotfish: 1, moorishIdol: 2, cardinalfish: 4, foxface: 1 },
  density: Number(densityRange.value),
  current: Number(currentRange.value) / 100,
  light: Number(lightRange.value) / 100,
  fish: [],
  textures: {},
  time: 0,
};

const audio = {
  ctx: null,
  master: null,
  media: null,
  usingRecordedAudio: false,
  started: false,
  muted: false,
  bubbles: [],
  bubbleNoise: null,
  noiseSources: [],
  modulators: [],
};

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07090b);
scene.fog = new THREE.FogExp2(0x06080a, 0.038);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 3.7, 9.8);
camera.lookAt(0, 1.55, 0);

const root = new THREE.Group();
scene.add(root);

const aquarium = new THREE.Group();
aquarium.position.set(0, 1.42, 0);
root.add(aquarium);

const tankSize = { x: 7.4, y: 3.9, z: 3.0 };
const fishBounds = {
  x: tankSize.x * 0.43,
  yMin: -tankSize.y * 0.30,
  yMax: tankSize.y * 0.32,
  z: tankSize.z * 0.38,
};

const textureLoader = new THREE.TextureLoader();
const clock = new THREE.Clock();
let waterMesh;
let backPanel;
let sandMesh;
let glassMesh;
let causticsMesh;
let decorGroup = new THREE.Group();
let bubbleGroup = new THREE.Group();
let particleGroup = new THREE.Group();
let lampGroup;
let lightCone;

scene.add(new THREE.HemisphereLight(0x88c8ff, 0x1b1008, 0.32));
const keyLight = new THREE.SpotLight(0x9eeaff, 3.6, 16, Math.PI * 0.22, 0.55, 1.4);
keyLight.position.set(0, 5.35, 1.05);
keyLight.target.position.set(0, 1.2, -0.4);
scene.add(keyLight, keyLight.target);

const warmFill = new THREE.PointLight(0xffc98b, 0.35, 10);
warmFill.position.set(-3.5, 2.2, 4.5);
scene.add(warmFill);

function makeButton(option, active, onClick) {
  const button = document.createElement('button');
  button.className = `option${active ? ' active' : ''}`;
  button.type = 'button';
  button.innerHTML = `<span>${option.name}</span><small>${option.desc}</small>`;
  button.addEventListener('click', onClick);
  return button;
}

function renderControls() {
  tankOptionsEl.replaceChildren(
    ...tanks.map((tank) =>
      makeButton(tank, state.tank === tank.id, () => {
        state.tank = tank.id;
        applyTankStyle();
        renderControls();
      }),
    ),
  );

  decorOptionsEl.replaceChildren(
    ...decorOptions.map((decor) =>
      makeButton(decor, state.decor.has(decor.id), () => {
        if (state.decor.has(decor.id)) state.decor.delete(decor.id);
        else state.decor.add(decor.id);
        if (!state.decor.size) state.decor.add('coral');
        rebuildDecor();
        renderControls();
      }),
    ),
  );

  fishOptionsEl.replaceChildren(
    ...fishTypes.map((fish) => {
      const button = document.createElement('button');
      button.className = `fish-card${state.counts[fish.id] ? ' active' : ''}`;
      button.type = 'button';
      button.innerHTML = `
        <img src="${fish.src}" alt="${fish.name}" />
        <span class="fish-meta"><strong>${fish.name}</strong><small>${fish.desc}</small></span>
        <span class="count">${state.counts[fish.id] || 0}</span>
      `;
      button.addEventListener('click', () => {
        state.counts[fish.id] = ((state.counts[fish.id] || 0) + 1) % 7;
        rebuildFish();
        renderControls();
      });
      return button;
    }),
  );

  const tank = getTank();
  tankLabelEl.textContent = tank.name;
  moodLabelEl.textContent = tank.mood;
}

function getTank() {
  return tanks.find((tank) => tank.id === state.tank) || tanks[0];
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function buildScene() {
  buildRoom();
  buildLamp();
  buildAquarium();
  buildBubbles();
  buildParticles();
  rebuildDecor();
  applyTankStyle();
}

function buildLamp() {
  lampGroup = new THREE.Group();
  lampGroup.position.set(0, 3.88, 0.42);
  root.add(lampGroup);

  const railMat = new THREE.MeshStandardMaterial({ color: 0x15181b, roughness: 0.42, metalness: 0.55 });
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0x1f2529, roughness: 0.38, metalness: 0.68 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x9eeaff, transparent: true, opacity: 0.72 });

  const rail = new THREE.Mesh(new THREE.BoxGeometry(tankSize.x * 0.82, 0.08, 0.16), railMat);
  rail.position.set(0, 0.18, -0.08);
  lampGroup.add(rail);

  for (const x of [-2.55, 0, 2.55]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.48, 12), railMat);
    arm.position.set(x, -0.04, -0.02);
    arm.rotation.x = Math.PI * 0.5;
    lampGroup.add(arm);

    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 0.34, 32, 1, true), shadeMat);
    head.position.set(x, -0.28, 0.12);
    head.rotation.x = Math.PI * 0.5;
    lampGroup.add(head);

    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.31, 32), glowMat);
    lens.position.set(x, -0.28, 0.30);
    lampGroup.add(lens);
  }

  const coneGeo = new THREE.ConeGeometry(tankSize.x * 0.43, 3.7, 48, 1, true);
  coneGeo.translate(0, -1.85, 0);
  lightCone = new THREE.Mesh(
    coneGeo,
    new THREE.MeshBasicMaterial({
      color: 0x7ce7ff,
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  lightCone.position.set(0, tankSize.y / 2 - 0.08, 0.05);
  lightCone.scale.set(0.88, 0.92, 0.55);
  aquarium.add(lightCone);
}

function buildRoom() {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(11.5, 0.28, 6.5),
    new THREE.MeshStandardMaterial({ color: 0x3f2b1c, roughness: 0.66, metalness: 0.02 }),
  );
  floor.position.set(0, -0.08, 0.45);
  root.add(floor);

  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(9.6, 0.42, 4.8),
    new THREE.MeshStandardMaterial({ color: 0x5a3924, roughness: 0.58, metalness: 0.02 }),
  );
  tableTop.position.set(0, 0.18, 0);
  root.add(tableTop);

  for (const x of [-3.9, 3.9]) {
    for (const z of [-1.75, 1.75]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 1.45, 0.38),
        new THREE.MeshStandardMaterial({ color: 0x2a1c13, roughness: 0.72 }),
      );
      leg.position.set(x, -0.74, z);
      root.add(leg);
    }
  }

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 9),
    new THREE.MeshBasicMaterial({ color: 0x07090b }),
  );
  wall.position.set(0, 3.6, -4.0);
  root.add(wall);
}

function buildAquarium() {
  backPanel = new THREE.Mesh(
    new THREE.BoxGeometry(tankSize.x, tankSize.y, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x020304, roughness: 0.4 }),
  );
  backPanel.position.set(0, 0, -tankSize.z / 2);
  aquarium.add(backPanel);

  waterMesh = new THREE.Mesh(
    new THREE.BoxGeometry(tankSize.x - 0.08, tankSize.y - 0.12, tankSize.z - 0.08, 32, 12, 8),
    new THREE.MeshPhysicalMaterial({
      color: 0x10283a,
      transparent: true,
      opacity: 0.35,
      roughness: 0.06,
      metalness: 0,
      transmission: 0.2,
      thickness: 0.9,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  waterMesh.renderOrder = 1;
  aquarium.add(waterMesh);

  glassMesh = new THREE.Mesh(
    new THREE.BoxGeometry(tankSize.x, tankSize.y, tankSize.z),
    new THREE.MeshPhysicalMaterial({
      color: 0x9ae7ff,
      transparent: true,
      opacity: 0.16,
      roughness: 0.03,
      metalness: 0,
      transmission: 0.5,
      thickness: 0.32,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  glassMesh.renderOrder = 40;
  aquarium.add(glassMesh);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(tankSize.x, tankSize.y, tankSize.z)),
    new THREE.LineBasicMaterial({ color: 0xc8f7ff, transparent: true, opacity: 0.44 }),
  );
  edges.renderOrder = 45;
  aquarium.add(edges);

  sandMesh = new THREE.Mesh(
    new THREE.BoxGeometry(tankSize.x - 0.18, 0.22, tankSize.z - 0.18, 20, 1, 8),
    new THREE.MeshStandardMaterial({ color: 0x2b261b, roughness: 0.92 }),
  );
  sandMesh.position.y = -tankSize.y / 2 + 0.12;
  aquarium.add(sandMesh);

  causticsMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(tankSize.x * 0.92, tankSize.y * 0.72, 48, 16),
    new THREE.MeshBasicMaterial({
      color: 0x7ce7ff,
      transparent: true,
      opacity: 0.10,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  causticsMesh.renderOrder = 3;
  causticsMesh.position.set(0, 0.2, -tankSize.z / 2 + 0.08);
  aquarium.add(causticsMesh);

  aquarium.add(decorGroup, bubbleGroup, particleGroup);
}

function applyTankStyle() {
  const tank = getTank();
  if (waterMesh) waterMesh.material.color.setHex(tank.water);
  if (backPanel) backPanel.material.color.setHex(tank.back);
  if (sandMesh) sandMesh.material.color.setHex(tank.sand);
  if (glassMesh) glassMesh.material.color.setHex(tank.glass);
  keyLight.intensity = 2.4 + state.light * 2.2;
  if (lightCone) lightCone.material.opacity = 0.035 + state.light * 0.10;
}

function rebuildDecor() {
  decorGroup.clear();
  addPebbleBed();
  if (state.decor.has('stone')) addStones();
  if (state.decor.has('wood')) addWood();
  if (state.decor.has('grass')) addGrass();
  if (state.decor.has('coral')) addCoral();
}

function addGrass() {
  const mats = [
    new THREE.MeshStandardMaterial({ color: 0x2fd07a, roughness: 0.58, emissive: 0x0d4f2d, emissiveIntensity: 0.12, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0x65e34c, roughness: 0.55, emissive: 0x1f5c19, emissiveIntensity: 0.10, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0x18a9a1, roughness: 0.56, emissive: 0x063d3a, emissiveIntensity: 0.10, side: THREE.DoubleSide }),
  ];
  for (let i = 0; i < 74; i++) {
    const height = rand(0.82, 1.95);
    const blade = new THREE.Mesh(createGrassBladeGeometry(height, rand(0.04, 0.09), rand(-0.34, 0.34), rand(-0.14, 0.14)), mats[i % mats.length]);
    blade.position.set(rand(-3.4, 3.4), -tankSize.y / 2 + 0.18, rand(-1.24, 1.08));
    blade.userData.sway = rand(0.9, 2.2);
    blade.userData.leafHeight = height;
    decorGroup.add(blade);
  }
}

function createGrassBladeGeometry(height, baseWidth, bendX, bendZ) {
  const rows = 8;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    const width = baseWidth * Math.pow(1 - t, 1.35) + 0.004;
    const x = bendX * t * t;
    const y = height * t;
    const z = bendZ * t * t;
    positions.push(x - width, y, z, x + width, y, z);
    uvs.push(0, t, 1, t);
  }

  for (let i = 0; i < rows; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function addCoral() {
  const colors = [0xff4f59, 0xff9f1c, 0xff4fc3, 0xfff166, 0x40e0d0];
  for (let i = 0; i < 9; i++) {
    const group = new THREE.Group();
    group.position.set(rand(-3.0, 3.0), -tankSize.y / 2 + 0.2, rand(-1.0, 0.75));
    branch(group, new THREE.Vector3(0, 0, 0), Math.PI / 2, rand(0.42, 0.88), 5, colors[i % colors.length]);
    group.scale.setScalar(rand(0.78, 1.08));
    decorGroup.add(group);
  }
}

function branch(group, start, angle, len, depth, color) {
  const delta = new THREE.Vector3(Math.cos(angle) * len * 0.35, Math.sin(angle) * len, rand(-0.04, 0.04));
  const end = start.clone().add(delta);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012 * depth, 0.020 * depth, len, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.26, emissive: color, emissiveIntensity: 0.26 }),
  );
  tube.position.copy(mid);
  tube.rotation.z = Math.PI / 2 - angle;
  group.add(tube);
  if (depth <= 1) return;
  branch(group, end, angle + rand(0.25, 0.48), len * 0.62, depth - 1, color);
  branch(group, end, angle - rand(0.25, 0.48), len * 0.58, depth - 1, color);
  if (depth > 2 && Math.random() > 0.55) {
    branch(group, end, angle + rand(-0.12, 0.12), len * 0.42, depth - 2, color);
  }
}

function addPebbleBed() {
  const colors = [0xf4f1e6, 0xded8c7, 0xc9d4d8, 0xb9c2bf, 0xe8d5c4, 0xffffff];
  for (let i = 0; i < 185; i++) {
    const radius = rand(0.032, 0.095);
    const pebble = new THREE.Mesh(
      new THREE.DodecahedronGeometry(radius, 0),
      new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.84,
        metalness: 0.02,
      }),
    );
    pebble.position.set(rand(-3.58, 3.58), -tankSize.y / 2 + 0.22 + rand(0, 0.045), rand(-1.38, 1.36));
    pebble.scale.set(rand(1.1, 2.2), rand(0.22, 0.48), rand(0.9, 1.7));
    pebble.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    decorGroup.add(pebble);
  }
}

function addStones() {
  const colors = [0xbcc4bf, 0x8f9998, 0xd7d4c4, 0x6d787b];
  for (let i = 0; i < 9; i++) {
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(rand(0.28, 0.62), 1),
      new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.88, metalness: 0.01 }),
    );
    stone.position.set(rand(-3.05, 3.05), -tankSize.y / 2 + 0.36, rand(-1.08, 0.98));
    stone.scale.set(rand(1.15, 2.15), rand(0.55, 1.25), rand(0.75, 1.45));
    stone.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    decorGroup.add(stone);
  }
}

function addWood() {
  const mat = new THREE.MeshStandardMaterial({ color: 0x5a321f, roughness: 0.76 });
  for (let i = 0; i < 4; i++) {
    const branchMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, rand(1.1, 2.0), 9), mat);
    branchMesh.position.set(rand(-1.5, 1.5), -tankSize.y / 2 + 0.38 + i * 0.08, rand(-0.6, 0.7));
    branchMesh.rotation.set(rand(-0.4, 0.5), rand(-0.5, 0.5), rand(0.8, 1.35));
    decorGroup.add(branchMesh);
  }
}

function buildBubbles() {
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.58,
    roughness: 0,
    transmission: 0.62,
    emissive: 0xffffff,
    emissiveIntensity: 0.08,
  });
  for (let i = 0; i < 72; i++) {
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(rand(0.018, 0.055), 12, 8), mat);
    bubble.position.set(rand(-3.4, 3.4), rand(-1.62, 1.6), rand(-1.25, 1.25));
    bubble.userData.speed = rand(0.22, 0.75);
    bubble.userData.phase = rand(0, Math.PI * 2);
    bubbleGroup.add(bubble);
  }
}

function buildParticles() {
  const geom = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 420; i++) {
    positions.push(rand(-3.55, 3.55), rand(-1.6, 1.75), rand(-1.35, 1.35));
  }
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xbfeeff,
    size: 0.012,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  particleGroup.add(new THREE.Points(geom, mat));
}

function loadTextures(done) {
  let left = fishTypes.length;
  fishTypes.forEach((fish) => {
    const source = window.FISH_TEXTURE_DATA && window.FISH_TEXTURE_DATA[fish.id] ? window.FISH_TEXTURE_DATA[fish.id] : fish.src;
    textureLoader.load(
      source,
      (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
        state.textures[fish.id] = texture;
        left -= 1;
        if (left === 0) done();
      },
      undefined,
      () => {
        state.textures[fish.id] = createFallbackFishTexture(fish);
        left -= 1;
        if (left === 0) done();
      },
    );
  });
}

function createFallbackFishTexture(fish) {
  const fallback = document.createElement('canvas');
  fallback.width = 512;
  fallback.height = 256;
  const g = fallback.getContext('2d');
  const palette = {
    koi: ['#fff1c7', '#ff6a2d'],
    clownfish: ['#ff7a1a', '#fff7df'],
    betta: ['#1967d2', '#b728d8'],
    angelfish: ['#eef5ff', '#222a35'],
    guppy: ['#7af0d2', '#ff4aa2'],
  }[fish.id] || ['#9eeaff', '#ffffff'];
  const grad = g.createLinearGradient(110, 0, 430, 0);
  grad.addColorStop(0, palette[1]);
  grad.addColorStop(0.45, palette[0]);
  grad.addColorStop(1, '#ffffff');
  g.fillStyle = grad;
  g.beginPath();
  g.ellipse(285, 128, 150, 58, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = palette[1];
  g.beginPath();
  g.moveTo(140, 128);
  g.lineTo(45, 58);
  g.lineTo(80, 128);
  g.lineTo(45, 198);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(255,255,255,0.28)';
  g.beginPath();
  g.ellipse(310, 100, 72, 12, -0.12, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#071013';
  g.beginPath();
  g.arc(395, 108, 11, 0, Math.PI * 2);
  g.fill();
  const texture = new THREE.CanvasTexture(fallback);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function rebuildFish() {
  for (const fish of state.fish) aquarium.remove(fish.group);
  state.fish = [];
  const desired = [];
  for (const type of fishTypes) {
    for (let i = 0; i < (state.counts[type.id] || 0); i++) desired.push(type);
  }
  desired.slice(0, state.density).forEach((type) => state.fish.push(createFish(type)));
}

function createFish(type) {
  const group = new THREE.Group();
  const texture = state.textures[type.id];
  const length = type.size;
  const height = type.size * 0.5;
  const dir = Math.random() > 0.5 ? 1 : -1;
  const tex = texture ? texture.clone() : null;
  if (tex) tex.needsUpdate = true;
  const bodyMat = new THREE.MeshBasicMaterial({
    map: tex,
    color: 0xffffff,
    transparent: true,
    alphaTest: 0.02,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
  });
  bodyMat.toneMapped = false;
  bodyMat.color.setRGB(1.16, 1.12, 1.08);
  const bodyGeometry = new THREE.PlaneGeometry(length, height, 28, 4);
  const basePositions = Float32Array.from(bodyGeometry.attributes.position.array);
  const body = new THREE.Mesh(bodyGeometry, bodyMat);
  body.renderOrder = 30;
  group.add(body);

  const fish = {
    type,
    group,
    body,
    basePositions,
    pos: new THREE.Vector3(rand(-2.3, 2.3), rand(-0.65, 0.85), 0.75),
    vel: new THREE.Vector3(dir * type.speed * rand(0.75, 1.15), rand(-0.02, 0.02), rand(-0.02, 0.02)),
    phase: rand(0, Math.PI * 2),
    turnAt: rand(1.4, 4.8) / type.pace,
    depth: rand(1.05, 1.45),
    facing: dir,
    personality: rand(0.78, 1.28),
    target: new THREE.Vector3(dir * rand(1.2, 3.0), rand(-0.65, 0.85), rand(-0.35, 0.75)),
    turnState: 0,
    turnTimer: 0,
    turnDuration: rand(0.9, 1.6),
    turnAxis: rand(0, 1) > 0.5 ? 1 : -1,
    turnFlipped: false,
    turnStartZ: 0,
    turnExitZ: 0,
  };
  group.position.copy(fish.pos);
  group.scale.set(fish.depth * fish.facing, fish.depth, fish.depth);
  aquarium.add(group);
  return fish;
}

function applyFishSeparation(fish, dt) {
  const steer = new THREE.Vector3();
  for (const other of state.fish) {
    if (other === fish) continue;
    const delta = fish.pos.clone().sub(other.pos);
    const dist = delta.length();
    const minDist = (fish.type.size + other.type.size) * 0.34;
    if (dist > 0.0001 && dist < minDist) {
      steer.add(delta.normalize().multiplyScalar((minDist - dist) / minDist));
    }
  }
  if (steer.lengthSq() > 0) {
    steer.normalize().multiplyScalar(0.12 * dt * fish.type.pace * fish.personality);
    fish.vel.add(steer);
  }
}
function animateFish(fish, dt) {
  fish.phase += dt * (1.05 + fish.type.sway * 0.38);
  fish.turnAt -= dt;
  applyFishSeparation(fish, dt);
  if (fish.turnState > 0) {
    fish.turnTimer += dt;
    const t = Math.min(1, fish.turnTimer / fish.turnDuration);
    const hide = Math.sin(t * Math.PI);
    const backZ = -fishBounds.z * 0.92;
    const outT = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
    fish.pos.x += fish.turnAxis * Math.sin(t * Math.PI * 2) * dt * 0.20;
    fish.pos.z = t < 0.5
      ? THREE.MathUtils.lerp(fish.turnStartZ, backZ, outT)
      : THREE.MathUtils.lerp(backZ, fish.turnExitZ, outT);
    fish.group.rotation.y = THREE.MathUtils.lerp(fish.group.rotation.y, fish.turnAxis * hide * 0.18, dt * 5);
    fish.body.material.opacity = 1 - hide * 0.48;
    if (!fish.turnFlipped && t >= 0.5) {
      fish.turnFlipped = true;
      fish.facing *= -1;
      fish.vel.x = -fish.vel.x * rand(0.86, 1.02);
    }
    if (t >= 1) {
      fish.turnState = 0;
      fish.turnTimer = 0;
      fish.turnFlipped = false;
      fish.body.material.opacity = 1;
      fish.target.set(rand(-3.1, 3.1), rand(-0.86, 1.02), rand(-0.82, 1.12));
      fish.turnAt = rand(2.0, 5.4) / fish.type.pace;
    }
  } else {
    const cruise = fish.type.speed * fish.type.pace * fish.personality;
    const toTarget = fish.target.clone().sub(fish.pos);
    const desired = new THREE.Vector3(
      fish.facing * cruise * 0.58,
      Math.sin(fish.phase * 0.45) * 0.015 + toTarget.y * 0.03,
      Math.cos(fish.phase * 0.35) * 0.012 + toTarget.z * 0.03,
    );
    if (toTarget.length() > 0.05) {
      desired.x += THREE.MathUtils.clamp(toTarget.x * 0.12, -0.18, 0.18);
      desired.y += THREE.MathUtils.clamp(toTarget.y * 0.08, -0.08, 0.08);
      desired.z += THREE.MathUtils.clamp(toTarget.z * 0.08, -0.08, 0.08);
    }
    fish.vel.lerp(desired, dt * 0.22);
    fish.pos.x += fish.vel.x * dt * (0.72 + state.current * 0.18);
    fish.pos.y += fish.vel.y * dt * (0.42 + state.current * 0.12);
    fish.pos.z += fish.vel.z * dt * (0.38 + state.current * 0.10);
  }

  if (fish.pos.x > fishBounds.x) fish.target.x = rand(-fishBounds.x, fishBounds.x * 0.2);
  if (fish.pos.x < -fishBounds.x) fish.target.x = rand(-fishBounds.x * 0.2, fishBounds.x);
  if (fish.pos.y > fishBounds.yMax) fish.target.y = rand(fishBounds.yMin, fishBounds.yMax * 0.2);
  if (fish.pos.y < fishBounds.yMin) fish.target.y = rand(fishBounds.yMin * 0.2, fishBounds.yMax);
  if (fish.pos.z > fishBounds.z) fish.target.z = rand(-fishBounds.z, fishBounds.z * 0.2);
  if (fish.pos.z < -fishBounds.z) fish.target.z = rand(-fishBounds.z * 0.2, fishBounds.z);

  fish.pos.x = THREE.MathUtils.clamp(fish.pos.x, -fishBounds.x, fishBounds.x);
  fish.pos.y = THREE.MathUtils.clamp(fish.pos.y, fishBounds.yMin, fishBounds.yMax);
  fish.pos.z = THREE.MathUtils.clamp(fish.pos.z, -fishBounds.z, fishBounds.z);

  if (fish.turnState === 0 && (fish.turnAt <= 0 || fish.pos.distanceTo(fish.target) < 0.32)) {
    fish.turnState = 1;
    fish.turnTimer = 0;
    fish.turnDuration = rand(1.05, 1.65) / fish.type.pace;
    fish.turnAxis = Math.random() > 0.5 ? 1 : -1;
    fish.turnFlipped = false;
    fish.turnStartZ = fish.pos.z;
    fish.turnExitZ = rand(-0.35, 0.75);
    fish.target.set(fish.facing * rand(1.4, 3.2), rand(-0.82, 0.98), rand(-0.35, 0.75));
  }

  fish.group.position.copy(fish.pos);
  fish.group.scale.set(fish.depth * fish.facing, fish.depth, fish.depth);
  if (fish.turnState === 0) {
    fish.group.rotation.y = THREE.MathUtils.clamp(fish.vel.z * 0.04, -0.04, 0.04);
  }
  fish.group.rotation.z = Math.sin(fish.phase * 1.4) * 0.055 + THREE.MathUtils.clamp(fish.vel.y * 0.10, -0.05, 0.05);
  bendFishBody(fish);
}

function bendFishBody(fish) {
  const position = fish.body.geometry.attributes.position;
  const src = fish.basePositions;
  const turnT = fish.turnState > 0 ? Math.min(1, fish.turnTimer / fish.turnDuration) : 0;
  const turnCurve = fish.turnState > 0 ? Math.sin(turnT * Math.PI) * fish.turnAxis * 0.05 : 0;
  const swimCurve = Math.sin(fish.phase * 2.2) * fish.type.sway * 0.06;
  const arr = position.array;
  const halfLength = fish.type.size * 0.5;

  for (let i = 0; i < arr.length; i += 3) {
    const x = src[i];
    const y = src[i + 1];
    const z = src[i + 2];
    const t = THREE.MathUtils.clamp((x + halfLength) / fish.type.size, 0, 1);
    const tailWeight = Math.pow(1 - t, 1.35);
    const bend = (turnCurve * (0.25 + tailWeight * 0.95)) + (swimCurve * tailWeight);
    arr[i] = x;
    arr[i + 1] = y + Math.sin(fish.phase * 2.8 + t * 7.0) * tailWeight * 0.055 + bend;
    arr[i + 2] = z + bend * 0.35;
  }

  position.needsUpdate = true;
  fish.body.geometry.computeBoundingSphere();
}

function updateBubbles(dt) {
  bubbleGroup.children.forEach((bubble) => {
    bubble.position.y += dt * bubble.userData.speed * (0.75 + state.current);
    bubble.position.x += Math.sin(state.time * 1.4 + bubble.userData.phase) * dt * 0.08;
    if (bubble.position.y > tankSize.y / 2 - 0.15) {
      bubble.position.y = -tankSize.y / 2 + 0.18;
      bubble.position.x = rand(-3.4, 3.4);
      bubble.position.z = rand(-1.25, 1.25);
    }
  });
}

function updateDecor() {
  decorGroup.children.forEach((child, index) => {
    if (child.userData && child.userData.leafHeight) {
      child.rotation.z = Math.sin(state.time * child.userData.sway + index) * (0.075 + state.current * 0.055);
      child.rotation.x = Math.sin(state.time * child.userData.sway * 0.42 + index) * 0.04;
    }
  });
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.04, clock.getDelta());
  state.time += dt;

  root.rotation.y = Math.sin(state.time * 0.18) * 0.025;
  waterMesh.rotation.x = Math.sin(state.time * 0.55) * 0.006;
  if (lampGroup) lampGroup.rotation.y = Math.sin(state.time * 0.18) * 0.025;
  if (lightCone) lightCone.scale.x = 1 + Math.sin(state.time * 1.1) * 0.025;
  causticsMesh.material.opacity = 0.08 + Math.sin(state.time * 1.8) * 0.025;
  causticsMesh.rotation.z = Math.sin(state.time * 0.35) * 0.02;

  updateBubbles(dt);
  updateDecor();
  state.fish.forEach((fish) => animateFish(fish, dt));
  tickAmbientAudio();
  renderer.render(scene, camera);
}

function ensureAudio() {
  if (audio.started) return;
  if (!audio.media) {
    audio.media = new Audio('assets/audio/aquarium-bubbles.mp3');
    audio.media.loop = true;
    audio.media.preload = 'auto';
    audio.media.volume = 0.55;
    audio.media.addEventListener('error', () => {
      if (!audio.started) startSynthAudio();
    });
  }

  audio.media.muted = false;
  audio.media.play().then(() => {
    audio.started = true;
    audio.muted = false;
    audio.usingRecordedAudio = true;
    musicButton.classList.add('audio-on');
    musicButton.textContent = '海底音已开';
  }).catch(() => {
    startSynthAudio();
  });
}

function startSynthAudio() {
  if (audio.started) return;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return;
  audio.ctx = new AudioContextCtor();
  audio.master = audio.ctx.createGain();
  audio.master.gain.value = 0.78;
  audio.master.connect(audio.ctx.destination);

  const compressor = audio.ctx.createDynamicsCompressor();
  compressor.threshold.value = -24;
  compressor.knee.value = 18;
  compressor.ratio.value = 2.2;
  compressor.attack.value = 0.08;
  compressor.release.value = 0.45;
  compressor.connect(audio.master);

  const waterBus = audio.ctx.createGain();
  waterBus.gain.value = 0.92;
  waterBus.connect(compressor);

  const noiseBuffer = audio.ctx.createBuffer(1, audio.ctx.sampleRate * 4, audio.ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  let slow = 0;
  let soft = 0;
  for (let i = 0; i < noiseData.length; i++) {
    slow = slow * 0.975 + (Math.random() * 2 - 1) * 0.025;
    soft = soft * 0.70 + (Math.random() * 2 - 1) * 0.30;
    noiseData[i] = slow * 0.65 + soft * 0.32;
  }

  const layers = [
    { type: 'lowpass', frequency: 620, q: 0.14, gain: 0.035, pan: -0.30, drift: 0.12 },
    { type: 'bandpass', frequency: 1100, q: 0.32, gain: 0.010, pan: 0.25, drift: 0.18 },
    { type: 'highpass', frequency: 1700, q: 0.22, gain: 0.003, pan: 0.04, drift: 0.24 },
  ];
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const noise = audio.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const noiseFilter = audio.ctx.createBiquadFilter();
    noiseFilter.type = layer.type;
    noiseFilter.frequency.value = layer.frequency;
    noiseFilter.Q.value = layer.q;
    const noiseGain = audio.ctx.createGain();
    noiseGain.gain.value = layer.gain;
    const panner = audio.ctx.createStereoPanner();
    panner.pan.value = layer.pan;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(panner);
    panner.connect(waterBus);
    noise.start();
    audio.noiseSources.push({ noise, noiseGain, noiseFilter, panner, baseGain: layer.gain, baseFrequency: layer.frequency, phase: i * 1.7, drift: layer.drift });
  }

  const bubbleNoiseFilter = audio.ctx.createBiquadFilter();
  bubbleNoiseFilter.type = 'bandpass';
  bubbleNoiseFilter.frequency.value = 520;
  bubbleNoiseFilter.Q.value = 0.9;
  const bubbleNoiseGain = audio.ctx.createGain();
  bubbleNoiseGain.gain.value = 0;
  bubbleNoiseFilter.connect(bubbleNoiseGain);
  bubbleNoiseGain.connect(waterBus);
  audio.bubbleNoise = { buffer: noiseBuffer, filter: bubbleNoiseFilter, gain: bubbleNoiseGain };

  for (let i = 0; i < 8; i++) {
    const osc = audio.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 185 + i * 18;
    const gain = audio.ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(waterBus);
    osc.start();
    audio.bubbles.push({ osc, gain, phase: i * 1.1, nextPop: audio.ctx.currentTime + 0.18 + Math.random() * 1.2 });
  }

  const shimmer = audio.ctx.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.value = 0.07;
  const shimmerGain = audio.ctx.createGain();
  shimmerGain.gain.value = 0.018;
  shimmer.connect(shimmerGain);
  shimmerGain.connect(waterBus.gain);
  shimmer.start();
  audio.modulators.push(shimmer);


  audio.started = true;
  audio.muted = false;
  musicButton.classList.add('audio-on');
  musicButton.textContent = '海底音已开';
}

function tickAmbientAudio() {
  if (!audio.started || !audio.ctx || audio.muted) return;
  const t = audio.ctx.currentTime;
  for (const bubble of audio.bubbles) {
    if (t > bubble.nextPop) {
      const strength = 0.115 + Math.random() * 0.070;
      const startFrequency = 360 + Math.random() * 180 + bubble.phase * 5;
      const endFrequency = 120 + Math.random() * 80;
      const duration = 0.24 + Math.random() * 0.20;
      bubble.gain.gain.cancelScheduledValues(t);
      bubble.gain.gain.setValueAtTime(0.0001, t);
      bubble.gain.gain.linearRampToValueAtTime(strength, t + 0.018);
      bubble.gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      bubble.osc.frequency.cancelScheduledValues(t);
      bubble.osc.frequency.setValueAtTime(startFrequency, t);
      bubble.osc.frequency.exponentialRampToValueAtTime(endFrequency, t + duration);
      if (audio.bubbleNoise) {
        const source = audio.ctx.createBufferSource();
        source.buffer = audio.bubbleNoise.buffer;
        source.connect(audio.bubbleNoise.filter);
        source.start(t, Math.random() * 2.5, 0.18);
        audio.bubbleNoise.filter.frequency.setTargetAtTime(430 + Math.random() * 280, t, 0.02);
        audio.bubbleNoise.gain.gain.cancelScheduledValues(t);
        audio.bubbleNoise.gain.gain.setValueAtTime(0.0001, t);
        audio.bubbleNoise.gain.gain.linearRampToValueAtTime(0.070 + Math.random() * 0.055, t + 0.010);
        audio.bubbleNoise.gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16 + Math.random() * 0.10);
      }
      bubble.nextPop = t + 0.12 + Math.random() * 0.58;
    }
  }
  for (const source of audio.noiseSources) {
    const flowPulse = 0.50 + Math.sin(t * source.drift + source.phase) * 0.020 + Math.sin(t * 0.061 + source.phase * 2.1) * 0.012;
    source.noiseGain.gain.setTargetAtTime(source.baseGain * flowPulse, t, 0.35);
    source.noiseFilter.frequency.setTargetAtTime(source.baseFrequency * (0.98 + Math.sin(t * source.drift * 0.85 + source.phase) * 0.10), t, 0.45);
    source.panner.pan.setTargetAtTime(Math.sin(t * 0.04 + source.phase) * 0.25, t, 0.8);
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

densityRange.addEventListener('input', () => {
  state.density = Number(densityRange.value);
  rebuildFish();
});

currentRange.addEventListener('input', () => {
  state.current = Number(currentRange.value) / 100;
});

lightRange.addEventListener('input', () => {
  state.light = Number(lightRange.value) / 100;
  applyTankStyle();
});

randomizeButton.addEventListener('click', () => {
  state.tank = tanks[Math.floor(Math.random() * tanks.length)].id;
  state.decor = new Set(decorOptions.filter(() => Math.random() > 0.35).map((item) => item.id));
  if (!state.decor.size) state.decor = new Set(['coral', 'grass']);
  for (const fish of fishTypes) state.counts[fish.id] = Math.floor(Math.random() * 6);
  if (!Object.values(state.counts).some(Boolean)) state.counts.guppy = 6;
  densityRange.value = String(Math.round(rand(12, 26)));
  currentRange.value = String(Math.round(rand(30, 85)));
  lightRange.value = String(Math.round(rand(58, 96)));
  state.density = Number(densityRange.value);
  state.current = Number(currentRange.value) / 100;
  state.light = Number(lightRange.value) / 100;
  applyTankStyle();
  rebuildDecor();
  rebuildFish();
  renderControls();
});

musicButton.addEventListener('click', () => {
  const wasStarted = audio.started;
  ensureAudio();
  audio.muted = wasStarted ? !audio.muted : false;
  if (audio.media) {
    audio.media.muted = audio.muted;
    audio.media.volume = audio.muted ? 0 : 0.55;
    if (!audio.muted) audio.media.play().catch(() => {});
  }
  musicButton.classList.toggle('audio-on', !audio.muted);
  musicButton.textContent = audio.muted ? '海底音效' : '海底音已开';
  if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
  if (audio.master) audio.master.gain.setTargetAtTime(audio.muted ? 0 : 0.78, audio.ctx.currentTime, 0.08);
});

showcaseButton.addEventListener('click', () => {
  ensureAudio();
  audio.muted = false;
  if (audio.media) {
    audio.media.muted = false;
    audio.media.volume = 0.55;
    audio.media.play().catch(() => {});
  }
  if (audio.master) audio.master.gain.setTargetAtTime(0.78, audio.ctx.currentTime, 0.08);
  musicButton.classList.add('audio-on');
  musicButton.textContent = '海底音已开';
  app.classList.add('showcase');
  exitShowcaseButton.hidden = false;
  setTimeout(resize, 240);
});

exitShowcaseButton.addEventListener('click', () => {
  app.classList.remove('showcase');
  exitShowcaseButton.hidden = true;
  setTimeout(resize, 240);
});

window.addEventListener('resize', resize);

renderControls();
buildScene();
resize();
loadTextures(() => {
  rebuildFish();
  animate();
});
