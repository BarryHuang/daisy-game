// landmarks.js — 小星球上 v1 倉鼠世界的地區入口（可愛風）
//
// v1 的倉鼠世界是 7 個橫向捲動的場景：家、後院、大公園、熱鬧街道、遊戲中心、遊樂園、陽光沙灘
// （daisy_hamster.html 的 MAP_ORDER）。v3 把它們放到 3D 小星球上，每一區一個小地標，
// 遠遠看就知道是哪裡。家就是星球上那棟小屋；後院用 planet.js 原本的菜園。
//
// 每個地標都是基本形狀拼起來、合成一個幾何（mergeParts），整個地標只要兩次 draw call。
// 顏色寫在這裡（糖果色），不跟著調色盤走 —— 地標本來就要各自好認。

import { THREE, inked, mergeParts, blob, box as roundBox } from '../../v2/lab/book3d.js';

const box = (x, y, z) => roundBox(x, y, z);   // 精緻可愛風是圓角方塊
const cyl = (rt, rb, h, n = 12) => new THREE.CylinderGeometry(rt, rb, h, n);
const sph = (r, d = 1) => new THREE.IcosahedronGeometry(r, d);
const group = (parts, line = 1.3) => {
  const g = new THREE.Group();
  g.add(inked(mergeParts(parts), 0xffffff, { line, vertexColors: true }));
  return g;
};

/** 大公園：長椅、一隻小鴨、兩朵鬱金香（v1：餵鴨子、釣魚、曬太陽） */
export function makePark() {
  const p = [];
  // 長椅
  [-0.16, 0, 0.16].forEach((dz, i) => p.push({ geo: box(0.7, 0.05, 0.1), color: 0xff9f43, pos: [0, i === 2 ? 0.42 : 0.24, dz * (i === 2 ? 0.4 : 1) - (i === 2 ? 0.12 : 0)], rot: [i === 2 ? -0.3 : 0, 0, 0] }));
  [[-0.3, -0.12], [0.3, -0.12], [-0.3, 0.12], [0.3, 0.12]].forEach(([x, z]) => p.push({ geo: box(0.05, 0.24, 0.05), color: 0x8a5a3c, pos: [x, 0.12, z] }));
  // 小鴨
  p.push({ geo: sph(0.13), color: 0xffd93d, pos: [0.55, 0.12, 0.25], scale: [1.2, 0.85, 1] });
  p.push({ geo: sph(0.08), color: 0xffd93d, pos: [0.67, 0.25, 0.25] });
  p.push({ geo: new THREE.ConeGeometry(0.035, 0.09, 6), color: 0xff8a2a, pos: [0.76, 0.24, 0.25], rot: [0, 0, -Math.PI / 2] });
  p.push({ geo: sph(0.015, 0), color: 0x2b2020, pos: [0.71, 0.28, 0.31] });
  // 鬱金香
  [[-0.5, 0.2, 0xff5d8f], [-0.42, 0.32, 0xffc93c]].forEach(([x, z, c]) => {
    p.push({ geo: cyl(0.012, 0.012, 0.22, 5), color: 0x48c24f, pos: [x, 0.11, z] });
    p.push({ geo: new THREE.ConeGeometry(0.06, 0.1, 6), color: c, pos: [x, 0.25, z], rot: [Math.PI, 0, 0] });
  });
  const g = group(p); g.add(blob(0.75)); return g;
}

/** 熱鬧街道：兩間有條紋雨棚的小店、冰淇淋招牌、紅色郵筒（v1：郵筒、冰淇淋攤、蛋糕店） */
export function makeStreet() {
  const p = [];
  [[-0.3, 0xfff1f7, 0xff6b9a], [0.32, 0xeef8ff, 0x4fa3ff]].forEach(([x, wall, stripe]) => {
    p.push({ geo: box(0.5, 0.55, 0.42), color: wall, pos: [x, 0.275, 0] });
    p.push({ geo: box(0.56, 0.06, 0.48), color: stripe, pos: [x, 0.58, 0] });
    for (let k = 0; k < 4; k++) p.push({ geo: box(0.13, 0.05, 0.16), color: k % 2 ? 0xffffff : stripe, pos: [x - 0.19 + k * 0.127, 0.43, 0.27], rot: [0.5, 0, 0] });
    p.push({ geo: box(0.16, 0.26, 0.02), color: 0x9b5de5, pos: [x, 0.13, 0.215] });
    p.push({ geo: box(0.13, 0.12, 0.02), color: 0x8fd8ff, pos: [x + 0.15, 0.27, 0.215] });
  });
  // 冰淇淋招牌（左邊那間的屋頂上）
  p.push({ geo: new THREE.ConeGeometry(0.07, 0.18, 8), color: 0xf3c189, pos: [-0.3, 0.72, 0], rot: [Math.PI, 0, 0] });
  p.push({ geo: sph(0.08), color: 0xff8fc0, pos: [-0.3, 0.84, 0] });
  // 蛋糕招牌（右邊那間）
  p.push({ geo: cyl(0.1, 0.1, 0.08, 14), color: 0xfff1d6, pos: [0.32, 0.66, 0] });
  p.push({ geo: cyl(0.1, 0.1, 0.03, 14), color: 0xff6b9a, pos: [0.32, 0.715, 0] });
  p.push({ geo: sph(0.03, 0), color: 0xff4d6d, pos: [0.32, 0.76, 0] });
  // 郵筒
  p.push({ geo: cyl(0.07, 0.07, 0.3, 12), color: 0xff4d4d, pos: [0.0, 0.15, 0.38] });
  p.push({ geo: sph(0.07), color: 0xff4d4d, pos: [0.0, 0.3, 0.38], scale: [1, 0.6, 1] });
  const g = group(p); g.add(blob(0.8)); return g;
}

/** 遊戲中心：紫色的機台屋、屋頂一顆大星星、霓虹燈條（v1：12 台機台、扭蛋機） */
export function makeArcade() {
  const p = [];
  p.push({ geo: box(0.9, 0.62, 0.55), color: 0x9b5de5, pos: [0, 0.31, 0] });
  p.push({ geo: box(0.96, 0.08, 0.6), color: 0xffc93c, pos: [0, 0.66, 0] });
  // 霓虹燈條
  [0xff5d8f, 0x3fc5f0, 0x7bd04c].forEach((c, k) => p.push({ geo: box(0.92, 0.035, 0.02), color: c, pos: [0, 0.5 - k * 0.07, 0.28] }));
  // 門和兩扇亮著的窗
  p.push({ geo: box(0.2, 0.3, 0.02), color: 0xffe3a3, pos: [0, 0.15, 0.28] });
  [-0.3, 0.3].forEach((x) => p.push({ geo: box(0.16, 0.14, 0.02), color: 0x8fd8ff, pos: [x, 0.24, 0.28] }));
  // 屋頂的大星星：兩個扁平的五角錐背對背
  const star = new THREE.ConeGeometry(0.2, 0.08, 5);
  p.push({ geo: star, color: 0xffd93d, pos: [0, 0.9, 0], rot: [Math.PI / 2, 0, 0] });
  p.push({ geo: star, color: 0xffd93d, pos: [0, 0.9, 0], rot: [-Math.PI / 2, 0, 0] });
  p.push({ geo: box(0.04, 0.16, 0.04), color: 0xb07042, pos: [0, 0.75, 0] });
  // 旁邊的扭蛋機
  p.push({ geo: box(0.18, 0.2, 0.16), color: 0xff6b9a, pos: [0.6, 0.1, 0.18] });
  p.push({ geo: sph(0.1), color: 0xdff6ff, pos: [0.6, 0.29, 0.18] });
  const g = group(p); g.add(blob(0.9)); return g;
}

/** 遊樂園：會轉的摩天輪 ＋ 一顆氣球（v1：摩天輪、旋轉木馬、咖啡杯、碰碰車） */
export function makeFair() {
  const g = new THREE.Group();
  const H = 0.78;   // 輪軸高度
  // 支架（不轉）
  const legs = [];
  [-1, 1].forEach((s) => [-0.08, 0.08].forEach((z) => legs.push({ geo: box(0.04, 0.84, 0.04), color: 0xffffff, pos: [s * 0.2, 0.4, z], rot: [0, 0, s * 0.25] })));
  legs.push({ geo: box(0.5, 0.06, 0.26), color: 0xff6b9a, pos: [0, 0.03, 0] });
  // 氣球
  legs.push({ geo: cyl(0.004, 0.004, 0.5, 4), color: 0x6b3f6e, pos: [0.5, 0.25, 0.2] });
  legs.push({ geo: sph(0.09), color: 0x3fc5f0, pos: [0.5, 0.55, 0.2], scale: [1, 1.2, 1] });
  g.add(inked(mergeParts(legs), 0xffffff, { line: 1.1, vertexColors: true }));
  // 輪子（會轉）：外圈、輪輻、8 個彩色車廂
  const wheel = [];
  wheel.push({ geo: new THREE.TorusGeometry(0.62, 0.025, 6, 40), color: 0xff5d8f });
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2;
    wheel.push({ geo: box(0.02, 0.62, 0.02), color: 0xffffff, pos: [Math.cos(a) * 0.31, Math.sin(a) * 0.31, 0], rot: [0, 0, a - Math.PI / 2] });
    wheel.push({ geo: box(0.12, 0.1, 0.1), color: [0xffc93c, 0x3fc5f0, 0x7bd04c, 0x9b5de5][k % 4], pos: [Math.cos(a) * 0.62, Math.sin(a) * 0.62 - 0.07, 0] });
  }
  wheel.push({ geo: cyl(0.06, 0.06, 0.22, 10), color: 0xffd93d, rot: [Math.PI / 2, 0, 0] });
  const w = inked(mergeParts(wheel), 0xffffff, { line: 1.0, vertexColors: true });
  w.position.y = H;
  g.add(w, blob(0.85));
  // 慢慢轉；車廂永遠朝下這種細節省略（遠遠看不出來）
  g.userData.tick = (dt) => { w.rotation.z += dt * 0.35; };
  return g;
}

/** 陽光沙灘：一片沙、條紋陽傘、沙堡、海星、海灘球（v1：堆沙堡、撿貝殼、衝浪） */
export function makeBeach() {
  const p = [];
  p.push({ geo: cyl(0.75, 0.8, 0.05, 28), color: 0xffe3a3, pos: [0, 0.02, 0] });
  // 一小片海
  p.push({ geo: cyl(0.32, 0.34, 0.052, 20), color: 0x4fc3ff, pos: [0.42, 0.025, -0.38], scale: [1.3, 1, 0.8] });
  // 陽傘
  p.push({ geo: cyl(0.015, 0.015, 0.7, 6), color: 0xffffff, pos: [-0.25, 0.35, -0.1] });
  [0xff5d8f, 0xffffff].forEach((c, k) => p.push({ geo: new THREE.ConeGeometry(0.42 - k * 0.2, 0.2 - k * 0.09, 12, 1, true), color: c, pos: [-0.25, 0.72 + k * 0.05, -0.1] }));
  // 沙堡
  p.push({ geo: box(0.3, 0.14, 0.2), color: 0xf5c46b, pos: [0.25, 0.1, 0.25] });
  [[-0.12, 0], [0.12, 0]].forEach(([x]) => {
    p.push({ geo: cyl(0.06, 0.07, 0.24, 10), color: 0xf5c46b, pos: [0.25 + x, 0.15, 0.25] });
    p.push({ geo: new THREE.ConeGeometry(0.07, 0.1, 10), color: 0xff6b9a, pos: [0.25 + x, 0.32, 0.25] });
  });
  // 海星、海灘球
  p.push({ geo: new THREE.CylinderGeometry(0.08, 0.08, 0.025, 5), color: 0xff8a2a, pos: [-0.45, 0.06, 0.35] });
  p.push({ geo: sph(0.09), color: 0x3fc5f0, pos: [0.05, 0.12, 0.45] });
  const g = group(p, 1.1); g.add(blob(0.95)); return g;
}

/**
 * v3 小星球上的 7 個地區（順序同 v1 的 MAP_ORDER），給 planet.js 的 hooks.regions。
 * 位置是用程式找過的空地（離樹、石頭、池塘都夠遠），stand 是倉鼠走過去站的地方。
 */
export const REGIONS = [
  { name: 'home' },
  { name: 'garden', make: null, at: [10, -22], stand: [9, -11.5], yaw: -0.3, scale: 1.4 },
  { name: 'park',   make: makePark,   at: [-12, 130], stand: [-6, 122], yaw: 0.6, scale: 1.2 },
  { name: 'street', make: makeStreet, at: [-25, -160], stand: [-18, -152], yaw: 2.6, scale: 1.25 },
  { name: 'arcade', make: makeArcade, at: [-3, -122], stand: [3, -114], yaw: 2.1, scale: 1.25 },
  { name: 'fair',   make: makeFair,   at: [15, -85], stand: [12, -75], yaw: 1.6, scale: 1.2 },
  { name: 'beach',  make: makeBeach,  at: [-37, 0], stand: [-29, 4], yaw: 0.2, scale: 1.2 },
];
