// book3d.js — 「繪本風 3D」的共用零件
//
// 小星球、後院、之後每一個地區都從這裡拿材質和角色。風格統一靠的是這一份：
// 同一組調色盤、同一套繪本著色器、同一種墨線、同一隻倉鼠。
// 新地區只要 import 這裡的東西，畫出來自動就是同一本書。
//
// 繪本感的三個技巧（細節在下面的 shader）：
//   ① 柔和的兩階明暗，暗面混冷紫而不是變黑
//   ② 暗面疊色鉛筆排線（螢幕座標，遠近一樣粗）
//   ③ 手繪墨線：背面沿法線在螢幕上外推，粗細用雜訊起伏
// 光源固定在畫面左上方（view space），轉到哪一面都是亮的。

import * as THREE from '../vendor/three.module.min.js';
export { THREE };

// ── 調色盤：和 v2 設計稿的繪本風同一組 ─────────────────────────────────
export const P = {
  ink: 0x4a3f3a,
  grass: [0xb7cd8f, 0xa6c07f, 0xc6d79c, 0x9cb877],
  path: 0xe9dbb7,
  dirt: 0xc9a77c,
  trunk: 0x8a6448,
  leaf: [0x6f9a55, 0x5e8a4a, 0x86ab62, 0x7aa35a],
  roof: 0xbf6a35,
  wall: 0xfbf1dc,
  door: 0x8a5a8f,
  window: 0xbcd3e6,
  rock: 0xc8bfae,
  water: 0x8fb3d1,
  cloud: 0xfffdf7,
  flower: [0xb05a6c, 0xd9a53a, 0x4f7fab, 0xf2b8c6, 0xfbf1dc],
  mushroom: 0xbf6a35,
  stem: 0xf3e6cf,
  // 倉鼠：和 2D 那隻同一組顏色
  hamBody: 0xe8a765, hamHead: 0xf3c189, hamBelly: 0xfbdcb4, hamEar: 0xe58aa2,
  hamPaw: 0xf0a0b4, hamEye: 0x2b2020,
};

const SHADOW_TINT = new THREE.Color(0x6e6a9e);  // 暗面混進去的冷紫

// ════════════════════════════════════════════════════════════════════
// 繪本材質
// ════════════════════════════════════════════════════════════════════
export const sharedUniforms = {
  uLightView: { value: new THREE.Vector3(-0.45, 0.62, 0.64).normalize() },
  uShadowTint: { value: SHADOW_TINT },
  uPixelRatio: { value: 1 },
  uResolution: { value: new THREE.Vector2(1, 1) },
  uTime: { value: 0 },
};

const BOOK_VS = /* glsl */`
  varying vec3 vN;
  varying vec3 vView;
  varying vec3 vColor;
  void main() {
    #ifdef USE_COLOR
      vColor = color;
    #else
      vColor = vec3(1.0);
    #endif
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const BOOK_FS = /* glsl */`
  uniform vec3 uColor;
  uniform vec3 uLightView;
  uniform vec3 uShadowTint;
  uniform float uPixelRatio;
  uniform float uHatch;
  varying vec3 vN;
  varying vec3 vView;
  varying vec3 vColor;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // 一組斜線：0 = 紙、1 = 筆畫。寬度用 smoothstep 抗鋸齒
  float lines(vec2 fc, vec2 dir, float spacing, float width) {
    float d = fract(dot(fc, dir) / spacing);
    return 1.0 - smoothstep(width, width + 0.18, min(d, 1.0 - d) * 2.0);
  }

  void main() {
    vec3 base = uColor * vColor;
    vec3 n = normalize(vN);
    vec3 v = normalize(vView);
    float ndl = dot(n, uLightView);

    // ① 兩階明暗：交界留一點點柔和的過渡，不要硬切成卡通的兩色
    float lit = smoothstep(-0.12, 0.28, ndl);
    vec3 shade = base * mix(vec3(1.0), uShadowTint, 0.50) * 0.80;
    vec3 col = mix(shade, base, lit);
    col += base * 0.08 * smoothstep(0.55, 1.0, ndl);            // 亮面再亮一點點

    // ② 色鉛筆排線：用螢幕座標畫，所以線的粗細不會跟著遠近變
    vec2 fc = gl_FragCoord.xy / uPixelRatio;
    float dark = 1.0 - lit;
    float h1 = lines(fc, normalize(vec2(1.0, 1.15)), 5.5, 0.22);
    float h2 = lines(fc, normalize(vec2(1.0, -0.9)), 6.5, 0.18);
    float deep = smoothstep(-0.05, -0.55, ndl);
    col *= 1.0 - uHatch * (h1 * dark * 0.20 + h2 * deep * 0.16);

    // 邊緣一點暖色的回光，把輪廓和背景分開
    float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    col = mix(col, vec3(1.0, 0.96, 0.88), rim * 0.22 * lit);

    // 紙的顆粒：每個像素一點點亮度差
    col *= 0.97 + 0.05 * hash(floor(fc));

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function bookMat(hex, { hatch = 1, vertexColors = false } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...sharedUniforms,
      uColor: { value: new THREE.Color(hex) },
      uHatch: { value: hatch },
    },
    vertexShader: BOOK_VS,
    fragmentShader: BOOK_FS,
    vertexColors,
  });
}

// ③ 手繪墨線：把物件的「背面」沿著法線在螢幕上往外推，露出來的那一圈就是
// 描邊。推的距離用像素算，所以遠近的線一樣粗；再乘上一點雜訊，線就有粗細
// 起伏，像沾水筆畫的。
const OUTLINE_VS = /* glsl */`
  attribute vec3 outlineNormal;
  uniform vec2 uResolution;
  uniform float uPixelRatio;
  uniform float uWidth;
  uniform float uSeed;
  float hash3(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719)) + uSeed) * 43758.5453); }
  float vnoise(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  void main() {
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec3 nv = normalize(normalMatrix * outlineNormal);
    float w = uWidth * uPixelRatio * (0.55 + 0.9 * vnoise(position * 4.0));
    vec2 dir = length(nv.xy) > 1e-4 ? normalize(nv.xy) : vec2(0.0);
    clip.xy += dir * w * clip.w * 2.0 / uResolution;
    gl_Position = clip;
  }
`;
const OUTLINE_FS = /* glsl */`
  uniform vec3 uInk;
  void main() {
    gl_FragColor = vec4(uInk, 1.0);
    #include <colorspace_fragment>
  }
`;

/**
 * 描邊要用「平滑過的法線」：方塊的每個面法線都不一樣，直接推會在角落裂開。
 * 把同一個位置的法線加起來平均，存成另一個屬性，只給描邊用。
 */
export function addOutlineNormals(geo) {
  if (geo.getAttribute('outlineNormal')) return geo;
  const pos = geo.getAttribute('position'), nor = geo.getAttribute('normal');
  const sum = new Map(), key = (i) =>
    pos.getX(i).toFixed(4) + ',' + pos.getY(i).toFixed(4) + ',' + pos.getZ(i).toFixed(4);
  for (let i = 0; i < pos.count; i++) {
    const k = key(i), s = sum.get(k) || [0, 0, 0];
    s[0] += nor.getX(i); s[1] += nor.getY(i); s[2] += nor.getZ(i); sum.set(k, s);
  }
  const out = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const s = sum.get(key(i)), l = Math.hypot(s[0], s[1], s[2]) || 1;
    out[i * 3] = s[0] / l; out[i * 3 + 1] = s[1] / l; out[i * 3 + 2] = s[2] / l;
  }
  geo.setAttribute('outlineNormal', new THREE.BufferAttribute(out, 3));
  return geo;
}

let seedCounter = 0;
function outlineMat(width) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uResolution: sharedUniforms.uResolution,
      uPixelRatio: sharedUniforms.uPixelRatio,
      uWidth: { value: width },
      uSeed: { value: (seedCounter++ * 1.618) % 10 },
      uInk: { value: new THREE.Color(P.ink) },
    },
    vertexShader: OUTLINE_VS,
    fragmentShader: OUTLINE_FS,
    side: THREE.BackSide,
  });
}

/**
 * 把幾個小零件（每個有自己的顏色和位置）合成一個幾何，顏色寫進頂點色。
 * 一棵樹的四團樹葉、一朵花的莖和花瓣，原本各自一個 mesh、各自一圈描邊，
 * 整顆星球畫一次要 372 次 draw call；合起來之後每個物件只要兩次。
 */
export function mergeParts(parts) {
  const geos = parts.map(({ geo, color, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0] }) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(new THREE.Matrix4().compose(
      new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(...scale)));
    const c = new THREE.Color(color), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  });
  const total = geos.reduce((a, g) => a + g.getAttribute('position').count, 0);
  const out = new THREE.BufferGeometry();
  for (const name of ['position', 'normal', 'color']) {
    const arr = new Float32Array(total * 3); let o = 0;
    for (const g of geos) { arr.set(g.getAttribute(name).array, o); o += g.getAttribute(name).array.length; }
    out.setAttribute(name, new THREE.BufferAttribute(arr, 3));
  }
  return out;
}

/** 一個繪本風物件 = 著色的本體 + 一圈墨線 */
export function inked(geo, hex, { line = 1.6, hatch = 1, vertexColors = false } = {}) {
  addOutlineNormals(geo);
  const g = new THREE.Group();
  const body = new THREE.Mesh(geo, bookMat(hex, { hatch, vertexColors }));
  const edge = new THREE.Mesh(geo, outlineMat(line));
  g.add(edge, body);
  g.userData.body = body;
  return g;
}

// 地上的影子：一個淡淡的圓，比即時陰影便宜很多，而且更像繪本
let blobTex = null;
export function blob(radius) {
  if (!blobTex) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 4, 32, 32, 31);
    gr.addColorStop(0, 'rgba(74,63,58,.34)'); gr.addColorStop(1, 'rgba(74,63,58,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    blobTex = new THREE.CanvasTexture(cv);
  }
  const m = new THREE.Mesh(new THREE.CircleGeometry(radius, 24),
    new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.025;
  return m;
}

export function makeTree(scale = 1, tint = 0) {
  const t = new THREE.Group();
  const trunk = inked(new THREE.CylinderGeometry(0.09, 0.14, 0.9, 10), P.trunk, { line: 1.4 });
  trunk.position.y = 0.45;
  t.add(trunk);
  const puffs = [[0, 0.1, 0, 0.5], [0.32, -0.05, 0.1, 0.36], [-0.3, -0.02, -0.08, 0.38], [0.05, 0.36, -0.05, 0.36]];
  const crown = inked(mergeParts(puffs.map(([x, y, z, r], i) =>
    ({ geo: new THREE.IcosahedronGeometry(r, 3), color: P.leaf[(i + tint) % 4], pos: [x, y, z] }))), 0xffffff, { line: 1.6, vertexColors: true });
  crown.position.y = 1.05;
  t.add(crown, blob(0.75));
  t.scale.setScalar(scale);
  t.userData = { kind: 'tree', crown };
  return t;
}

export function makeHouse() {
  const h = new THREE.Group();
  const wall = inked(new THREE.BoxGeometry(1.1, 0.8, 0.95), P.wall, { line: 1.8 });
  wall.position.y = 0.4;
  const roof = inked(new THREE.ConeGeometry(0.92, 0.75, 4), P.roof, { line: 1.8 });
  roof.position.y = 1.15; roof.rotation.y = Math.PI / 4;
  const door = inked(new THREE.BoxGeometry(0.3, 0.46, 0.05), P.door, { line: 1.2 });
  door.position.set(0, 0.24, 0.49);
  const win = inked(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 20), P.window, { line: 1.2, hatch: 0 });
  win.rotation.x = Math.PI / 2; win.position.set(0.32, 0.52, 0.49);
  const chimney = inked(new THREE.BoxGeometry(0.16, 0.34, 0.16), P.roof, { line: 1.4 });
  chimney.position.set(-0.28, 1.32, -0.1);
  h.add(wall, roof, door, win, chimney, blob(1.0));
  h.userData = { kind: 'house' };
  return h;
}

export function makeFlower(i) {
  const f = new THREE.Group();
  const head = inked(mergeParts([
    { geo: new THREE.CylinderGeometry(0.018, 0.022, 0.32, 6), color: P.leaf[1], pos: [0, 0.16, 0] },
    { geo: new THREE.IcosahedronGeometry(0.085, 2), color: P.flower[i % P.flower.length], pos: [0, 0.34, 0] },
    { geo: new THREE.IcosahedronGeometry(0.035, 1), color: 0xf2c94c, pos: [0, 0.36, 0.06] },
  ]), 0xffffff, { line: 1.0, hatch: 0.5, vertexColors: true });
  f.add(head);
  f.userData = { kind: 'flower', head };
  return f;
}

export function makeRock(s) {
  const geo = new THREE.DodecahedronGeometry(0.28, 0);
  const r = inked(geo, P.rock, { line: 1.4 });
  r.scale.set(s, s * 0.6, s * 0.85);
  r.position.y = 0.08;
  const g = new THREE.Group(); g.add(r, blob(0.3 * s));
  return g;
}

export function makeMushroom() {
  const m = new THREE.Group();
  m.add(inked(mergeParts([
    { geo: new THREE.CylinderGeometry(0.05, 0.065, 0.18, 10), color: P.stem, pos: [0, 0.09, 0] },
    { geo: new THREE.SphereGeometry(0.14, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), color: P.mushroom, pos: [0, 0.17, 0] },
  ]), 0xffffff, { line: 1.1, vertexColors: true }));
  return m;
}

export function makePond() {
  const g = new THREE.Group();
  const water = inked(new THREE.CircleGeometry(0.95, 40), P.water, { line: 1.8, hatch: 0.4 });
  water.rotation.x = -Math.PI / 2; water.position.y = 0.06;
  g.add(water);
  // 水面上兩道亮線
  [[-0.25, 0.1, 0.42], [0.18, -0.2, 0.3]].forEach(([x, z, w]) => {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.035), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
    l.rotation.x = -Math.PI / 2; l.position.set(x, 0.075, z); g.add(l);
  });
  return g;
}

export function makeCloud() {
  const c = new THREE.Group();
  c.add(inked(mergeParts([[0, 0, 0, 0.55], [0.55, -0.08, 0.05, 0.42], [-0.55, -0.1, 0, 0.4], [0.2, 0.25, -0.05, 0.4]]
    .map(([x, y, z, r]) => ({ geo: new THREE.IcosahedronGeometry(r, 3), color: P.cloud, pos: [x, y, z], scale: [1, 0.72, 1] }))),
    0xffffff, { line: 1.6, hatch: 0.5, vertexColors: true }));
  return c;
}

// ════════════════════════════════════════════════════════════════════
// 倉鼠（和 2D 那隻同一組顏色、同樣圓滾滾的比例）
// ════════════════════════════════════════════════════════════════════
export function makeHamster() {
  const ham = new THREE.Group();          // 站在地上的那個點；+Y 是頭頂、+Z 是前面
  const bodyRig = new THREE.Group();      // 跳、走路上下晃都動這一層
  ham.add(bodyRig, blob(0.55));

  const sph = (r, d = 3) => new THREE.IcosahedronGeometry(r, d);
  // 身體、肚子、頭、臉頰、尾巴一起動，合成一個幾何
  const torso = inked(mergeParts([
    { geo: sph(0.42, 4), color: P.hamBody, pos: [0, 0.4, 0], scale: [1.05, 0.88, 1.12] },
    { geo: sph(0.3, 3), color: P.hamBelly, pos: [0, 0.34, 0.27], scale: [1, 0.95, 0.6] },
    { geo: sph(0.33, 4), color: P.hamHead, pos: [0, 0.72, 0.22], scale: [1.08, 0.95, 0.98] },
    { geo: sph(0.14, 3), color: P.hamBelly, pos: [-0.21, 0.63, 0.36] },
    { geo: sph(0.14, 3), color: P.hamBelly, pos: [0.21, 0.63, 0.36] },
    { geo: sph(0.07, 2), color: P.hamBody, pos: [0, 0.32, -0.48] },
  ]), 0xffffff, { line: 1.6, vertexColors: true });

  const ears = [-1, 1].map((s) => {
    const e = new THREE.Group();
    const outer = inked(sph(0.11, 2), P.hamBody, { line: 1.2 }); outer.scale.set(1, 1, 0.5);
    const inner = inked(sph(0.065, 2), P.hamEar, { line: 0.6, hatch: 0 }); inner.scale.set(1, 1, 0.4); inner.position.z = 0.03;
    e.add(outer, inner);
    e.position.set(s * 0.22, 0.98, 0.16); e.rotation.z = -s * 0.35;
    return e;
  });
  const blush = [-1, 1].map((s) => {
    const b = new THREE.Mesh(new THREE.CircleGeometry(0.055, 16), new THREE.MeshBasicMaterial({ color: 0xf2a0b4, transparent: true, opacity: 0.75 }));
    b.position.set(s * 0.23, 0.64, 0.495); b.lookAt(b.position.clone().add(new THREE.Vector3(s * 0.5, 0, 1))); return b;
  });
  const eyes = [-1, 1].map((s) => {
    const e = new THREE.Group();
    const ball = new THREE.Mesh(sph(0.052, 2), new THREE.MeshBasicMaterial({ color: P.hamEye }));
    const shine = new THREE.Mesh(sph(0.017, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    shine.position.set(0.015, 0.02, 0.04);
    e.add(ball, shine);
    e.position.set(s * 0.13, 0.77, 0.5);
    return e;
  });
  const nose = new THREE.Mesh(sph(0.03, 1), new THREE.MeshBasicMaterial({ color: 0xd9788f }));
  nose.position.set(0, 0.68, 0.545);
  const paws = [[-0.17, 0.05, 0.24], [0.17, 0.05, 0.24], [-0.2, 0.05, -0.15], [0.2, 0.05, -0.15]].map(([x, y, z]) => {
    const p = inked(sph(0.08, 2), P.hamPaw, { line: 1.0, hatch: 0.3 }); p.scale.set(1, 0.6, 1.25);
    p.position.set(x, y, z); return p;
  });
  const hands = [-1, 1].map((s) => {
    const h = inked(sph(0.07, 2), P.hamPaw, { line: 0.9, hatch: 0.3 });
    h.position.set(s * 0.2, 0.42, 0.4); return h;
  });
  bodyRig.add(torso, ...ears, ...blush, ...eyes, nose, ...hands);
  ham.add(...paws);   // 腳留在地上，身體晃的時候腳不跟著飄
  ham.scale.setScalar(1.55);   // 小王子插畫的比例：主角相對星球很大
  ham.userData = { kind: 'hamster', bodyRig, ears, eyes, paws, hands };
  return ham;
}


// ════════════════════════════════════════════════════════════════════
// 倉鼠的動作（走路晃、跳、呼吸、眨眼）—— 每個地區都一樣
// ════════════════════════════════════════════════════════════════════
/**
 * st = { walk, jump }，由呼叫端保存。moving = 這一幀有沒有在走。
 * 跳躍用 st.jump：設成 0.0001 開始，跑到 1 結束。
 */
export function animateHamster(ham, st, dt, t, moving) {
  const rig = ham.userData;
  st.walk = moving ? st.walk + dt * 11 : st.walk * 0.85;
  let lift = Math.abs(Math.sin(st.walk)) * 0.07, jumpLift = 0;
  if (st.jump > 0) {
    st.jump += dt * 2.6;
    jumpLift = Math.sin(Math.min(Math.PI, st.jump * Math.PI)) * 0.55;
    lift += jumpLift;
    if (st.jump >= 1) st.jump = 0;
  }
  rig.bodyRig.position.y = lift;
  rig.bodyRig.rotation.z = moving ? Math.sin(st.walk) * 0.06 : 0;
  const crouch = st.crouch || 0;            // 蹲下（種菜、收成）：0 → 1
  const breathe = 1 + Math.sin(t * 2.4) * 0.015;
  rig.bodyRig.scale.set(breathe * (1 + crouch * 0.12), (1 / breathe) * (1 - crouch * 0.22), breathe * (1 + crouch * 0.12));
  // 走路時腳貼地（身體晃、腳不飄）；跳起來時腳要跟著離地，
  // 不然草地上會留下四顆粉紅色的橢圓（截圖抓到的）
  rig.paws.forEach((p, i) => { p.position.y = 0.05 + jumpLift + (moving ? Math.max(0, Math.sin(st.walk + (i % 2 ? Math.PI : 0))) * 0.08 : 0); });
  rig.ears.forEach((e, i) => { e.rotation.x = Math.sin(t * 3 + i) * 0.05 + (Math.sin(t * 0.7) > 0.97 ? 0.3 : 0); });
  const blink = (t % 3.7) < 0.12;
  rig.eyes.forEach((e) => { e.scale.y = blink ? 0.15 : 1; });
  rig.hands.forEach((h, i) => { h.position.y = 0.42 - crouch * 0.12 + (moving ? Math.sin(st.walk + i * Math.PI) * 0.03 : 0); });
}

// ════════════════════════════════════════════════════════════════════
// 搖一搖（樹、花、小屋被點的時候）
// ════════════════════════════════════════════════════════════════════
export function createWobbler() {
  const list = [];
  return {
    add(obj, amt) { list.push({ obj, t: 0, amt, base: obj.scale.clone() }); },
    update(dt) {
      for (let i = list.length - 1; i >= 0; i--) {
        const w = list[i]; w.t += dt;
        const k = Math.sin(w.t * 18) * Math.exp(-w.t * 4) * 0.12 * w.amt;
        w.obj.scale.set(w.base.x * (1 + k), w.base.y * (1 - k), w.base.z * (1 + k));
        if (w.t > 1.2) { w.obj.scale.copy(w.base); list.splice(i, 1); }
      }
    },
  };
}

// ════════════════════════════════════════════════════════════════════
// 畫面：解析度、自動降畫質、fps
// ════════════════════════════════════════════════════════════════════
/**
 * 建 renderer、處理視窗大小、連續 2 秒低於 45 fps 就把解析度降一級
 * （2 → 1.5 → 1.25）。她的平板實測 60–80 fps，這是給更舊的裝置的保險。
 *
 * fps 一定要用真實時間量：動畫用的 dt 夾在 0.05 秒以內，拿它算的話
 * 再慢都是「20 fps」，降畫質永遠不會觸發（踩過）。
 *
 *   onResize(w, h)       每次尺寸改變（鏡頭自己調 aspect、距離）
 *   update(dt, t)        每一幀
 *   onStats({fps,...})   每秒一次
 */
export function createStage(canvas, camera, { onResize, onStats } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const PR_STEPS = [2, 1.5, 1.25];
  let prCap = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const pr = Math.min(window.devicePixelRatio || 1, prCap);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    sharedUniforms.uPixelRatio.value = pr;
    sharedUniforms.uResolution.value.set(w * pr, h * pr);
    onResize && onResize(w, h);
  }
  addEventListener('resize', resize); resize();

  const clock = new THREE.Clock();
  let frames = 0, fpsT = 0, slowSecs = 0, lastReal = performance.now();
  return {
    renderer,
    get pixelRatioCap() { return prCap; },
    start(scene, update) {
      renderer.setAnimationLoop(() => {
        const dt = Math.min(clock.getDelta(), 0.05);
        update && update(dt, clock.elapsedTime);
        renderer.render(scene, camera);
        const now = performance.now();
        frames++; fpsT += (now - lastReal) / 1000; lastReal = now;
        if (fpsT >= 1) {
          const fps = frames / fpsT;
          slowSecs = fps < 45 ? slowSecs + 1 : 0;
          const next = PR_STEPS.find((x) => x < prCap - 0.01);
          if (slowSecs >= 2 && next && (window.devicePixelRatio || 1) > next) { prCap = next; slowSecs = 0; resize(); }
          onStats && onStats({ fps: Math.round(fps), calls: renderer.info.render.calls, pr: renderer.getPixelRatio() });
          frames = 0; fpsT = 0;
        }
      });
    },
  };
}

/** 螢幕座標（給 2D 的愛心、標籤用）：物件往上 lift 的那一點 */
const _p = new THREE.Vector3();
export function screenOf(obj, camera, canvas, lift = 0.8) {
  obj.updateWorldMatrix(true, false);
  _p.set(0, lift, 0).applyMatrix4(obj.matrixWorld).project(camera);
  const r = canvas.getBoundingClientRect();
  return { x: r.left + (_p.x + 1) / 2 * r.width, y: r.top + (1 - _p.y) / 2 * r.height, behind: _p.z > 1 };
}
