// garden.js — 後院菜園（3D，繪本風）
//
// 從小星球點小屋旁邊的菜園進來。規則在 farm.js（和 v1 共用存檔），
// 存檔在 petstore.js（transaction），這裡只管畫面和動作。
//
// 地面是一顆很大的球的頂端（半徑 34），所以遠處的地平線是彎的 ——
// 和小星球同一個世界，只是鏡頭湊近了。

import { THREE, P, sharedUniforms, inked, mergeParts, blob, makeTree, makeHouse, makeFlower, makeRock,
         makeMushroom, makeCloud, makeHamster, animateHamster, createWobbler, createStage, screenOf, themable, box as roundBox } from './book3d.js';
import * as F from './farm.js';

const G = 34;                                      // 地面那顆大球的半徑
const gy = (x, z) => Math.sqrt(Math.max(0, G * G - x * x - z * z)) - G;

// ── 田的位置：0 左後、1 右後、2 左前、3 右前（對應 v1 的 garden:0–3）──────
const BEDS = [[-1.75, -1.5], [1.75, -1.5], [-1.75, 1.7], [1.75, 1.7]];
const BED_W = 2.6, BED_D = 2.0;
/** 倉鼠站在田的前面（靠鏡頭那一側）照顧它 */
const standOf = (i) => new THREE.Vector3(BEDS[i][0], 0, BEDS[i][1] + BED_D / 2 + 0.45);

// 用 themable 登記：v3 換成可愛風時，菜園的顏色跟著換（book3d.js 的 applyTheme）
const C = themable('garden', {
  soil: 0x86603f, soilDark: 0x6f4f34, plank: 0xb08560, plankDark: 0x8a6448,
  sprout: 0x7aa35a, leaf: 0x5e8a4a, leafLight: 0x86ab62,
  carrot: 0xd9772f, corn: 0xe9c24a, cornHusk: 0x9cbf6a, straw: 0xc9504a, pumpkin: 0xd6893a,
  stall: 0xfbf1dc, awning: 0xbf6a35, shirt: 0x4f7fab, sack: 0xe6cf9a, can: 0x6f9cc4,
});

// ════════════════════════════════════════════════════════════════════
// 地面
// ════════════════════════════════════════════════════════════════════
function makeGround() {
  // 只要球的頂端那一小塊（thetaLength 0.62），頂點都花在看得到的地方
  const geo = new THREE.SphereGeometry(G, 150, 60, 0, Math.PI * 2, 0, 0.62);
  geo.translate(0, -G, 0);
  const pos = geo.getAttribute('position'), col = new Float32Array(pos.count * 3);
  const g0 = new THREE.Color(P.grass[0]), g1 = new THREE.Color(P.grass[3]), g2 = new THREE.Color(P.grass[2]);
  const path = new THREE.Color(P.path), c = new THREE.Color();
  // 小徑：從小屋門口到菜園，再到種子攤
  const PATH = [[-4.2, -3.2], [-1.5, -0.1], [0, 0.1], [1.8, 0.1], [4.4, -2.4]];
  const segDist = (x, z) => {
    let best = 1e9;
    for (let k = 0; k < PATH.length - 1; k++) {
      const [ax, az] = PATH[k], [bx, bz] = PATH[k + 1];
      const vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
      best = Math.min(best, Math.hypot(x - ax - vx * t, z - az - vz * t));
    }
    return best;
  };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const n = Math.sin(x * 0.35 + Math.sin(z * 0.5)) * 0.5 + Math.sin(z * 0.42 + Math.sin(x * 0.3)) * 0.5;
    c.copy(g0).lerp(g1, (n + 1) * 0.36).lerp(g2, Math.max(0, -z / 14) * 0.3);
    const d = segDist(x, z);
    if (d < 0.75) c.lerp(path, 0.82 * Math.min(1, (0.75 - d) / 0.35));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const g = inked(geo, 0xffffff, { line: 2.0, vertexColors: true });
  g.userData.kind = 'ground';
  return g;
}

const on = (obj, x, z, yaw = 0, sink = 0.02) => { obj.position.set(x, gy(x, z) - sink, z); obj.rotation.y = yaw; return obj; };

// ════════════════════════════════════════════════════════════════════
// 菜圃（木框 + 土 + 三條田畦）
// ════════════════════════════════════════════════════════════════════
function makeBed(i) {
  const g = new THREE.Group();
  const w = BED_W, d = BED_D, h = 0.3, t = 0.14;
  const box = (sx, sy, sz) => roundBox(sx, sy, sz);
  g.add(inked(mergeParts([
    { geo: box(w, h, t), color: C.plank, pos: [0, h / 2, -d / 2] },
    { geo: box(w, h, t), color: C.plank, pos: [0, h / 2, d / 2] },
    { geo: box(t, h, d), color: C.plankDark, pos: [-w / 2, h / 2, 0] },
    { geo: box(t, h, d), color: C.plankDark, pos: [w / 2, h / 2, 0] },
  ]), 0xffffff, { line: 1.6, vertexColors: true }));
  // 土：一塊方的，加三條隆起的田畦
  const furrows = [-0.55, 0, 0.55].map((z) => ({
    geo: new THREE.CylinderGeometry(0.17, 0.17, w - 0.36, 12, 1, false, 0, Math.PI),
    color: C.soilDark, pos: [0, h - 0.04, z], rot: [0, 0, Math.PI / 2],
  }));
  g.add(inked(mergeParts([{ geo: box(w - t, h - 0.04, d - t), color: C.soil, pos: [0, (h - 0.04) / 2, 0] }, ...furrows]),
    0xffffff, { line: 1.2, hatch: 1.3, vertexColors: true }));
  g.add(blob(1.7));
  g.userData = { kind: 'bed', index: i, top: h + 0.12 };
  return g;
}

// ════════════════════════════════════════════════════════════════════
// 作物：每種三個樣子（剛種、長大中、可以收）
// ════════════════════════════════════════════════════════════════════
const SPOTS = {
  carrot: [[-0.75, -0.55], [0, -0.55], [0.75, -0.55], [-0.75, 0.55], [0, 0.55], [0.75, 0.55]],
  corn: [[-0.8, 0], [0, 0], [0.8, 0]],
  straw: [[-0.55, -0.45], [0.55, -0.45], [-0.55, 0.45], [0.55, 0.45]],
  pumpkin: [[-0.55, 0.05], [0.6, -0.05]],
};
const ico = (r, d = 2) => new THREE.IcosahedronGeometry(r, d);

/** 一片葉子：壓扁的小球，往外斜 */
function leaf(x, y, z, r, len, yaw, tilt, color) {
  return { geo: ico(r, 2), color, pos: [x + Math.sin(yaw) * len * 0.5, y, z + Math.cos(yaw) * len * 0.5], scale: [0.45, 0.18, len / r], rot: [tilt, yaw, 0] };
}

/** 南瓜：球體依角度往外推一點，做出一瓣一瓣的紋 */
function pumpkinGeo(r) {
  const g = new THREE.SphereGeometry(r, 28, 18);
  const p = g.getAttribute('position'), v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = 1 + 0.07 * Math.cos(8 * Math.atan2(v.z, v.x));
    p.setXYZ(i, v.x * k, v.y * 0.72, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

function cropParts(crop, stage, top) {
  const parts = [], spots = SPOTS[crop];
  spots.forEach(([x, z], k) => {
    const y = top, yaw0 = k * 1.7;
    if (stage === 0) {
      // 剛種下：一小坨土冒出兩片嫩芽
      parts.push({ geo: new THREE.SphereGeometry(0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), color: C.soilDark, pos: [x, y - 0.05, z] });
      parts.push(leaf(x, y + 0.1, z, 0.06, 0.16, yaw0, -0.5, C.sprout), leaf(x, y + 0.1, z, 0.06, 0.16, yaw0 + Math.PI, -0.5, C.sprout));
      return;
    }
    if (stage === 1) {
      // 長大中：葉子多了、大了（玉米已經抽高一點）
      if (crop === 'corn') parts.push({ geo: new THREE.CylinderGeometry(0.04, 0.05, 0.55, 8), color: C.leaf, pos: [x, y + 0.27, z] });
      const n = crop === 'pumpkin' ? 3 : 4, big = crop === 'pumpkin' ? 0.14 : 0.08;
      for (let j = 0; j < n; j++) parts.push(leaf(x, y + (crop === 'corn' ? 0.35 : 0.1), z, big, big * 3.2, yaw0 + j * 2 * Math.PI / n, -0.35, j % 2 ? C.leaf : C.leafLight));
      return;
    }
    // 可以收了
    if (crop === 'carrot') {
      parts.push({ geo: new THREE.ConeGeometry(0.11, 0.42, 10), color: C.carrot, pos: [x, y - 0.06, z], rot: [Math.PI, 0, 0] });
      for (let j = 0; j < 3; j++) parts.push({ geo: new THREE.ConeGeometry(0.035, 0.36, 5), color: j % 2 ? C.leaf : C.leafLight,
        pos: [x + Math.sin(j * 2.1) * 0.05, y + 0.32, z + Math.cos(j * 2.1) * 0.05], rot: [Math.cos(j * 2.1) * 0.35, 0, -Math.sin(j * 2.1) * 0.35] });
    } else if (crop === 'corn') {
      parts.push({ geo: new THREE.CylinderGeometry(0.05, 0.06, 1.35, 8), color: C.leaf, pos: [x, y + 0.67, z] });
      parts.push(leaf(x, y + 0.55, z, 0.09, 0.55, yaw0, -0.6, C.leafLight), leaf(x, y + 0.85, z, 0.08, 0.5, yaw0 + Math.PI, -0.5, C.leaf));
      parts.push({ geo: new THREE.CylinderGeometry(0.075, 0.095, 0.38, 10), color: C.corn, pos: [x + 0.11, y + 0.78, z], rot: [0, 0, -0.35] });
      parts.push({ geo: ico(0.07, 1), color: C.cornHusk, pos: [x + 0.08, y + 0.6, z], scale: [1.1, 1.6, 1.1] });
      parts.push({ geo: new THREE.ConeGeometry(0.06, 0.22, 5), color: C.corn, pos: [x, y + 1.42, z] });
    } else if (crop === 'straw') {
      for (let j = 0; j < 5; j++) parts.push(leaf(x, y + 0.12, z, 0.09, 0.26, yaw0 + j * 1.26, -0.25, j % 2 ? C.leaf : C.leafLight));
      for (let j = 0; j < 3; j++) {
        const a = yaw0 + j * 2.1 + 0.5, bx = x + Math.sin(a) * 0.24, bz = z + Math.cos(a) * 0.24;
        parts.push({ geo: ico(0.085, 2), color: C.straw, pos: [bx, y + 0.06, bz], scale: [1, 1.25, 1] });
        parts.push({ geo: new THREE.ConeGeometry(0.06, 0.05, 6), color: C.leaf, pos: [bx, y + 0.17, bz] });
      }
    } else if (crop === 'pumpkin') {
      parts.push({ geo: pumpkinGeo(0.36), color: C.pumpkin, pos: [x, y + 0.2, z] });
      parts.push({ geo: new THREE.CylinderGeometry(0.035, 0.05, 0.16, 6), color: 0x6f7a3a, pos: [x, y + 0.5, z], rot: [0.2, 0, 0.15] });
      parts.push(leaf(x, y + 0.08, z, 0.17, 0.5, yaw0 + 0.6, -0.15, C.leaf), leaf(x, y + 0.08, z, 0.15, 0.45, yaw0 + 3.6, -0.15, C.leafLight));
    }
  });
  return parts;
}

function makeCrop(crop, stage, top) {
  const g = inked(mergeParts(cropParts(crop, stage, top)), 0xffffff, { line: stage === 0 ? 0.9 : 1.2, hatch: 0.8, vertexColors: true });
  g.userData.crop = crop; g.userData.stage = stage;
  return g;
}

// ════════════════════════════════════════════════════════════════════
// 布景：種子攤、稻草人、澆水壺、籬笆
// ════════════════════════════════════════════════════════════════════
function makeStall() {
  const s = new THREE.Group();
  const box = (sx, sy, sz) => roundBox(sx, sy, sz);
  const parts = [
    { geo: box(2.0, 0.12, 0.9), color: C.plank, pos: [0, 0.82, 0] },
    { geo: box(1.9, 0.76, 0.08), color: C.stall, pos: [0, 0.4, 0.38] },
    ...[[-0.92, -0.4], [0.92, -0.4], [-0.92, 0.4], [0.92, 0.4]].map(([x, z]) => ({ geo: box(0.1, 0.84, 0.1), color: C.plankDark, pos: [x, 0.42, z] })),
    ...[[-0.92, -0.42], [0.92, -0.42]].map(([x, z]) => ({ geo: box(0.09, 1.0, 0.09), color: C.plankDark, pos: [x, 1.35, z] })),
  ];
  // 條紋遮雨棚：柿橙和米白交錯
  for (let k = 0; k < 6; k++) parts.push({ geo: box(0.36, 0.05, 1.15), color: k % 2 ? C.stall : C.awning, pos: [-0.9 + k * 0.36, 1.82, 0.05], rot: [0.32, 0, 0] });
  // 種子袋
  [0xd9772f, 0xe9c24a, 0xc9504a, 0xd6893a].forEach((c, k) => {
    parts.push({ geo: box(0.3, 0.34, 0.22), color: 0xe9dbb7, pos: [-0.66 + k * 0.44, 1.05, 0.05] });
    parts.push({ geo: ico(0.08, 1), color: c, pos: [-0.66 + k * 0.44, 1.08, 0.17] });
  });
  s.add(inked(mergeParts(parts), 0xffffff, { line: 1.5, vertexColors: true }), blob(1.5));
  s.userData = { kind: 'stall' };
  return s;
}

function makeScarecrow() {
  const s = new THREE.Group();
  const body = new THREE.Group(); s.add(body);
  body.add(inked(mergeParts([
    { geo: new THREE.CylinderGeometry(0.06, 0.07, 2.0, 8), color: C.plankDark, pos: [0, 1.0, 0] },
    { geo: new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), color: C.plankDark, pos: [0, 1.35, 0], rot: [0, 0, Math.PI / 2] },
    { geo: roundBox(0.75, 0.62, 0.32), color: C.shirt, pos: [0, 1.22, 0] },
    { geo: ico(0.28, 2), color: C.sack, pos: [0, 1.85, 0] },
    { geo: new THREE.CylinderGeometry(0.5, 0.5, 0.04, 20), color: C.plank, pos: [0, 2.08, 0] },
    { geo: new THREE.ConeGeometry(0.26, 0.32, 14), color: C.plank, pos: [0, 2.24, 0] },
    { geo: ico(0.1, 1), color: 0xe9c24a, pos: [-0.82, 1.35, 0], scale: [1.2, 0.7, 1] },
    { geo: ico(0.1, 1), color: 0xe9c24a, pos: [0.82, 1.35, 0], scale: [1.2, 0.7, 1] },
  ]), 0xffffff, { line: 1.5, vertexColors: true }));
  // 臉：兩個點、一個笑
  const ink = new THREE.MeshBasicMaterial({ color: P.ink });
  [-0.09, 0.09].forEach((x) => { const e = new THREE.Mesh(ico(0.03, 1), ink); e.position.set(x, 1.9, 0.26); body.add(e); });
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.014, 6, 16, Math.PI), ink);
  smile.position.set(0, 1.8, 0.27); smile.rotation.z = Math.PI; body.add(smile);
  s.add(blob(0.6));
  s.userData = { kind: 'scarecrow', body };
  return s;
}

function makeCan() {
  const c = inked(mergeParts([
    { geo: new THREE.CylinderGeometry(0.22, 0.25, 0.4, 16), color: C.can, pos: [0, 0.2, 0] },
    { geo: new THREE.CylinderGeometry(0.035, 0.05, 0.5, 8), color: C.can, pos: [0.33, 0.3, 0], rot: [0, 0, -1.0] },
    { geo: new THREE.TorusGeometry(0.15, 0.03, 6, 14, Math.PI), color: C.can, pos: [0, 0.42, 0], rot: [0, Math.PI / 2, 0] },
  ]), 0xffffff, { line: 1.3, vertexColors: true });
  const g = new THREE.Group(); g.add(c, blob(0.35)); return g;
}

function makeFence() {
  const parts = [], box = (sx, sy, sz) => roundBox(sx, sy, sz);
  const runs = [[[-3.2, -6.4], [7.4, -6.4]], [[7.4, -6.4], [7.4, 3.6]], [[-7.6, -1.0], [-7.6, 4.4]]];
  for (const [[ax, az], [bx, bz]] of runs) {
    const len = Math.hypot(bx - ax, bz - az), n = Math.round(len / 1.15), yaw = Math.atan2(bx - ax, bz - az);
    for (let k = 0; k <= n; k++) {
      const x = ax + (bx - ax) * k / n, z = az + (bz - az) * k / n;
      parts.push({ geo: box(0.14, 0.95, 0.14), color: C.plankDark, pos: [x, gy(x, z) + 0.45, z] });
    }
    for (const h of [0.35, 0.72]) {
      const mx = (ax + bx) / 2, mz = (az + bz) / 2;
      parts.push({ geo: box(0.07, 0.1, len), color: C.plank, pos: [mx, gy(mx, mz) + h, mz], rot: [0, yaw, 0] });
    }
  }
  return inked(mergeParts(parts), 0xffffff, { line: 1.3, vertexColors: true });
}

function makeButterfly(color) {
  const b = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
  const wingGeo = new THREE.CircleGeometry(0.13, 10);
  const l = new THREE.Mesh(wingGeo, mat), r = new THREE.Mesh(wingGeo, mat);
  l.position.x = -0.1; r.position.x = 0.1;
  const lp = new THREE.Group(), rp = new THREE.Group(); lp.add(l); rp.add(r);
  b.add(lp, rp);
  b.userData = { lp, rp };
  return b;
}

// ════════════════════════════════════════════════════════════════════
// 場景
// ════════════════════════════════════════════════════════════════════
export function startGarden(canvas, hooks = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  const interactive = [];

  const ground = makeGround(); scene.add(ground);

  // 小屋的牆角在左後方，門朝菜園
  const house = on(makeHouse(), -5.6, -4.6, 0.62); house.scale.setScalar(2.1); scene.add(house); interactive.push(house);
  const stall = on(makeStall(), 4.7, -3.4, -0.55); scene.add(stall); interactive.push(stall);
  const crow = on(makeScarecrow(), 5.3, 2.6, -0.4); scene.add(crow); interactive.push(crow);
  scene.add(on(makeCan(), 3.65, 0.05, 0.6));
  scene.add(makeFence());

  const beds = BEDS.map(([x, z], i) => { const b = on(makeBed(i), x, z); scene.add(b); interactive.push(b); return b; });
  const crops = [null, null, null, null];

  [[-8.5, -8.6, 2.1, 0], [-2.2, -9.6, 1.9, 1], [3.8, -10.2, 2.2, 2], [9.4, -7.6, 1.8, 3], [-10.6, -2.2, 2.0, 2],
   [10.8, 0.4, 2.1, 1], [-9.8, 5.2, 1.7, 0], [9.6, 6.6, 1.9, 3], [-14, -12, 2.4, 1], [14, -11, 2.3, 0], [0.5, -14, 2.5, 3]]
    .forEach(([x, z, s, t], k) => { const tr = on(makeTree(s, t), x, z, k * 1.3); scene.add(tr); interactive.push(tr); });

  // 花：小屋門口一叢、籬笆下一排、稻草人腳邊幾朵
  let fi = 0;
  const flowerAt = (x, z) => { const f = on(makeFlower(fi++), x, z, fi); f.scale.setScalar(1.6); scene.add(f); interactive.push(f); };
  for (let k = 0; k < 9; k++) flowerAt(-4.2 + Math.sin(k * 2.3) * 0.9, -2.2 + Math.cos(k * 1.7) * 0.7);
  for (let k = 0; k < 10; k++) flowerAt(-2.6 + k * 1.0 + Math.sin(k) * 0.2, -5.8 + Math.cos(k * 2) * 0.2);
  for (let k = 0; k < 5; k++) flowerAt(5.9 + Math.sin(k * 2.5) * 0.6, 3.4 + Math.cos(k * 1.9) * 0.5);
  [[-6.3, 1.8, 1.4], [6.8, -0.8, 1.1], [-3.4, 4.6, 1.6]].forEach(([x, z, s]) => scene.add(on(makeRock(s * 1.6), x, z, x)));
  [[-6.8, 3.4], [-6.5, 3.8], [8.4, 4.4]].forEach(([x, z]) => { const m = on(makeMushroom(), x, z, z); m.scale.setScalar(1.8); scene.add(m); });

  // 草叢：全部合成一個
  {
    const parts = [], blade = new THREE.ConeGeometry(0.045, 0.3, 4);
    for (let i = 0; i < 420; i++) {
      const r = Math.sqrt((i + 0.5) / 420) * 13, a = i * 2.399;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.85;
      if (BEDS.some(([bx, bz]) => Math.abs(x - bx) < BED_W / 2 + 0.4 && Math.abs(z - bz) < BED_D / 2 + 0.4)) continue;
      for (let b = 0; b < 3; b++) {
        const g = blade.clone();
        g.translate(0, 0.14, 0); g.rotateZ((b - 1) * 0.35); g.rotateY(i + b * 2.1); g.translate(x, gy(x, z), z);
        parts.push({ geo: g, color: P.leaf[(i + b) % 4] });
      }
    }
    scene.add(inked(mergeParts(parts), 0xffffff, { line: 0.9, hatch: 0.4, vertexColors: true }));
  }

  // 遠方的雲（繞著菜園很慢地飄）
  const clouds = new THREE.Group(); scene.add(clouds);
  [[-14, 7.5, -22, 2.4], [6, 9, -26, 2.8], [20, 6.5, -18, 2.2], [-24, 8.5, -12, 2.0]].forEach(([x, y, z, s]) => {
    const c = makeCloud(); c.position.set(x, y, z); c.scale.setScalar(s); clouds.add(c);
  });

  const flies = [0xf2b8c6, 0xf7e08a].map((c) => { const b = makeButterfly(c); scene.add(b); return b; });

  const ham = makeHamster(); ham.scale.setScalar(1.35); scene.add(ham); interactive.push(ham);
  const hs = { pos: new THREE.Vector3(-3.6, 0, -1.4), yaw: 0.9, path: [], walk: 0, jump: 0, crouch: 0, onArrive: null };
  if (hooks.startAt === 'gate') hs.pos.set(0, 0, 4.6);

  // ── 鏡頭 ─────────────────────────────────────────────────────────────
  const cam = { az: 0, pol: 0.98, zoom: 1, tAz: 0, tPol: 0.98, tZoom: 1, base: 16, look: new THREE.Vector3(0, 0, 0.6), lastTouch: -1e9 };
  const stage = createStage(canvas, camera, {
    onResize() {
      // 菜園大約 15 單位寬：直放的時候往後退，整片都放得進來
      // 橫放：整片菜園含小屋、種子攤；直放：只顧四塊田，兩側的小屋和攤子可以切掉一點
      const half = camera.aspect >= 1 ? 6.6 : 4.4;
      cam.base = half / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(1, camera.aspect * 1.2));
    },
    onStats: hooks.onStats,
  });

  // ── 走路：遇到菜圃就走中間的走道繞過去 ─────────────────────────────────
  const inBed = (x, z) => BEDS.some(([bx, bz]) => Math.abs(x - bx) < BED_W / 2 + 0.15 && Math.abs(z - bz) < BED_D / 2 + 0.15);
  const crosses = (a, b) => { for (let k = 1; k < 20; k++) { const t = k / 20; if (inBed(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)) return true; } return false; };
  function walkTo(target, onArrive) {
    const a = hs.pos.clone(), b = target.clone();
    let path = [b];
    if (crosses(a, b)) {
      // 中間那條直的走道 x = 0，前後兩條橫的走道
      const laneZ = (z) => (z < 0.1 ? 0.1 : 3.45);
      const p1 = new THREE.Vector3(a.x, 0, laneZ(a.z)), p2 = new THREE.Vector3(0, 0, laneZ(a.z));
      const p3 = new THREE.Vector3(0, 0, laneZ(b.z)), p4 = new THREE.Vector3(b.x, 0, laneZ(b.z));
      path = [p1, p2, p3, p4, b].filter((p, k, arr) => k === arr.length - 1 || !inBed(p.x, p.z));
      if (inBed(a.x, a.z)) path.shift();
    }
    hs.path = path; hs.onArrive = onArrive || null;
  }

  // ── 點、拖、縮放 ──────────────────────────────────────────────────────
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pointers = new Map();
  let downAt = null, pinch0 = 0, zoom0 = 1;
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) downAt = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = cam.tZoom; if (downAt) downAt.moved = true; }
    cam.lastTouch = performance.now();
    hooks.onFirstTouch && hooks.onFirstTouch();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId), cur = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, cur);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      if (pinch0) cam.tZoom = THREE.MathUtils.clamp(zoom0 * pinch0 / Math.hypot(a.x - b.x, a.y - b.y), 0.6, 1.3);
    } else if (downAt) {
      if (Math.hypot(cur.x - downAt.x, cur.y - downAt.y) > 8) downAt.moved = true;
      if (downAt.moved) {
        cam.tAz = THREE.MathUtils.clamp(cam.tAz - (cur.x - prev.x) * 0.005, -0.75, 0.75);
        cam.tPol = THREE.MathUtils.clamp(cam.tPol - (cur.y - prev.y) * 0.004, 0.62, 1.18);
      }
    }
    cam.lastTouch = performance.now();
  });
  canvas.addEventListener('pointerup', (e) => {
    pointers.delete(e.pointerId);
    if (!pointers.size && downAt && !downAt.moved && performance.now() - downAt.t < 450) tap(e.clientX, e.clientY);
    if (!pointers.size) { downAt = null; pinch0 = 0; }
  });
  canvas.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); downAt = null; });
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); cam.tZoom = THREE.MathUtils.clamp(cam.tZoom * (1 + e.deltaY * 0.001), 0.6, 1.3); }, { passive: false });

  const wobbler = createWobbler();
  const rootOf = (o) => { while (o && !o.userData.kind) o = o.parent; return o; };
  function tap(x, y) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects([...interactive, ...crops.filter(Boolean), ground], true)
      .find((h) => h.object.material.type === 'ShaderMaterial' && h.object.material.side !== THREE.BackSide);
    if (!hit) return;
    let obj = rootOf(hit.object);
    // 點到作物等於點那塊田
    if (!obj && hit.object.parent && hit.object.parent.userData.crop) obj = beds[crops.indexOf(hit.object.parent)];
    const kind = obj ? obj.userData.kind : 'ground';
    if (kind === 'bed') return hooks.onBed && hooks.onBed(obj.userData.index);
    if (kind === 'hamster') return jump();
    if (kind === 'tree' || kind === 'flower') { wobbler.add(kind === 'tree' ? obj.userData.crown : obj.userData.head, kind === 'tree' ? 1 : 1.4); hooks.sfx && hooks.sfx(kind === 'tree' ? 'pop' : 'sparkle'); return; }
    if (kind === 'scarecrow') { wobbler.add(obj.userData.body, 0.8); hooks.sfx && hooks.sfx('bump'); hooks.say && hooks.say('我是稻草人，幫你顧菜！'); return; }
    if (kind === 'stall') return hooks.onStall && hooks.onStall();
    if (kind === 'house') { wobbler.add(obj, 0.2); hooks.sfx && hooks.sfx('door'); return; }
    // 地面：走過去（點到菜圃上就繞道）
    const p = hit.point.clone(); p.y = 0;
    if (p.length() > 10) p.setLength(10);
    if (!inBed(p.x, p.z)) walkTo(p);
  }

  function jump() { if (hs.jump > 0) return; hs.jump = 0.0001; hooks.sfx && hooks.sfx('jump');
    setTimeout(() => hooks.burst && hooks.burst(screenOf(ham, camera, canvas, 1.3), '💛'), 120); }

  // ── 作物的樣子跟著存檔走 ───────────────────────────────────────────────
  let shownSig = '';
  function syncCrops(pet, today) {
    const sig = [0, 1, 2, 3].map((i) => { const st = F.plotState(pet, i, today); return st.empty ? '-' : st.crop + st.stage; }).join(',');
    if (sig === shownSig) return;
    shownSig = sig;
    for (let i = 0; i < 4; i++) {
      const st = F.plotState(pet, i, today);
      const want = st.empty ? null : st.crop + st.stage;
      const have = crops[i] ? crops[i].userData.crop + crops[i].userData.stage : null;
      if (want === have) continue;
      if (crops[i] && !crops[i].userData.leaving) beds[i].remove(crops[i]);
      crops[i] = null;
      if (!st.empty) {
        const c = makeCrop(st.crop, st.stage, beds[i].userData.top);
        c.userData.grow = 0; c.scale.setScalar(0.01);   // 冒出來
        c.userData.base = st.stage === 2 ? 1.3 : 1.15;   // 熟的菜要一眼看得到
        beds[i].add(c); crops[i] = c;
      }
    }
  }

  /** 收成：整片作物從土裡跳起來、轉一圈、縮小不見 */
  function popCrop(i) {
    const c = crops[i]; if (!c) return;
    c.userData.leaving = 0.0001; crops[i] = null; shownSig = '';
  }

  // ── 每一幀 ───────────────────────────────────────────────────────────
  const tmp = new THREE.Vector3(), tmpV = new THREE.Vector3();
  function frame(dt, t) {
    // 倉鼠走路
    let moving = false;
    if (hs.path.length) {
      const goal = hs.path[0];
      tmp.set(goal.x - hs.pos.x, 0, goal.z - hs.pos.z);
      const d = tmp.length();
      if (d < 0.05) {
        hs.path.shift();
        if (!hs.path.length) { const cb = hs.onArrive; hs.onArrive = null; cb && cb(); }
      } else {
        moving = true;
        hs.pos.addScaledVector(tmp.normalize(), Math.min(d, 2.4 * dt));
        const want = Math.atan2(tmp.x, tmp.z);
        hs.yaw += Math.atan2(Math.sin(want - hs.yaw), Math.cos(want - hs.yaw)) * Math.min(1, dt * 10);
      }
    } else if (hs.face != null) {
      hs.yaw += Math.atan2(Math.sin(hs.face - hs.yaw), Math.cos(hs.face - hs.yaw)) * Math.min(1, dt * 8);
    }
    ham.position.set(hs.pos.x, gy(hs.pos.x, hs.pos.z), hs.pos.z);
    ham.rotation.y = hs.yaw;
    hs.crouch += ((hs.crouchOn ? 1 : 0) - hs.crouch) * Math.min(1, dt * 12);
    animateHamster(ham, hs, dt, t, moving);

    // 作物：長出來的彈性、熟了微微晃、收成時跳起來
    beds.forEach((b, i) => {
      b.children.forEach((c) => {
        if (!c.userData.crop) return;
        if (c.userData.leaving) {
          const k = (c.userData.leaving += dt * 1.6);
          c.position.y = Math.sin(Math.min(1, k) * Math.PI) * 1.4;
          c.rotation.y = k * 6;
          c.scale.setScalar(Math.max(0.001, (c.userData.base || 1) * (1 - Math.max(0, k - 0.45) * 1.8)));
          if (k >= 1) b.remove(c);
          return;
        }
        if (c.userData.grow < 1) {
          c.userData.grow = Math.min(1, c.userData.grow + dt * 2.2);
          const g = c.userData.grow, s = 1 + Math.sin(g * Math.PI) * 0.18 * (1 - g);
          c.scale.setScalar(Math.max(0.01, g * s * (c.userData.base || 1)));
        } else if (c.userData.stage === 2) {
          c.rotation.z = Math.sin(t * 2.2 + i) * 0.025;
        }
      });
    });

    wobbler.update(dt);
    crow.userData.body.rotation.z = Math.sin(t * 1.3) * 0.04;
    clouds.position.x = Math.sin(t * 0.03) * 3;
    flies.forEach((b, k) => {
      const a = t * (0.45 + k * 0.12) + k * 3;
      b.position.set(Math.cos(a) * (3.2 + k), 1.6 + Math.sin(t * 2.3 + k) * 0.35, Math.sin(a * 1.3) * 2.6 - 0.6 + k);
      b.rotation.y = -a;
      const f = Math.sin(t * 22 + k) * 0.9;
      b.userData.lp.rotation.y = f; b.userData.rp.rotation.y = -f;
    });

    // 鏡頭：慢慢看向倉鼠那邊一點點
    // 鏡頭會稍微看向倉鼠那邊。直放的螢幕很窄，跟太多的話右邊那塊田會被切掉
    // （手機截圖抓到的），所以直放時幾乎不跟
    tmp.copy(hs.pos).multiplyScalar(camera.aspect >= 1 ? 0.25 : 0.06).add(new THREE.Vector3(0, 0.2, 0.9));
    cam.look.lerp(tmp, Math.min(1, dt * 2));
    cam.az += (cam.tAz - cam.az) * Math.min(1, dt * 6);
    cam.pol += (cam.tPol - cam.pol) * Math.min(1, dt * 6);
    cam.zoom += (cam.tZoom - cam.zoom) * Math.min(1, dt * 6);
    camera.position.setFromSphericalCoords(cam.base * cam.zoom, cam.pol, cam.az).add(cam.look);
    camera.lookAt(cam.look);

    hooks.onFrame && hooks.onFrame();
  }
  stage.start(scene, frame);

  return {
    camera, canvas, ham, hs, beds, crops,
    get pixelRatioCap() { return stage.pixelRatioCap; },
    syncCrops, popCrop, jump,
    /** 倉鼠走到第 i 塊田前面、轉身面對它 */
    goToBed(i) {
      return new Promise((resolve) => {
        hs.face = null;
        walkTo(standOf(i), () => { hs.face = Math.PI; resolve(); });
      });
    },
    crouch(on) { hs.crouchOn = !!on; },
    /**
     * 第 i 塊田的標籤要貼在哪裡。第一版貼在田的正上方，從斜上方看，前排的
     * 「上方」剛好就是後排的田 —— 前排的「可以收了」浮在後排上面，看起來
     * 像在說後排。改成：後排貼在田的後緣（籬笆前的空地），前排貼在前緣下面
     * （草地），兩排的標籤都不會蓋到任何一塊田。
     */
    bedScreen(i) {
      const back = i < 2;
      tmpV.set(0, 0.32, back ? -BED_D / 2 - 0.05 : BED_D / 2 + 0.1).applyMatrix4(beds[i].matrixWorld).project(camera);
      const r = canvas.getBoundingClientRect();
      return { x: r.left + (tmpV.x + 1) / 2 * r.width, y: r.top + (1 - tmpV.y) / 2 * r.height, below: !back };
    },
  };
}
