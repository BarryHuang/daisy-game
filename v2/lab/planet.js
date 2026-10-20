// planet.js — 倉鼠的小星球（試作）
//
// 目的：驗證「繪本風的 3D 倉鼠世界」在她的平板上跑不跑得動、好不好看。
// 這是試作，不接資料、不存進度。值得做下去才會進 v2 的正式版。
//
// 為什麼不用免費 3D 素材：每一套素材有自己的畫風，混在一起不會像同一本書。
// 這裡所有東西（倉鼠、樹、小屋、花）都是用基本形狀拼出來，再交給同一套
// 「繪本著色」去畫 —— 風格統一是靠著色器，不是靠模型。
//
// 繪本感從哪裡來（三個技巧，全部在下面的 shader 裡）：
//   ① 柔和的兩階明暗：亮面是原色，暗面混一點冷紫（不是變黑），像水彩
//   ② 色鉛筆排線：暗面上疊斜線，越暗越密，最暗的地方再加一層交叉線
//   ③ 手繪墨線：每個物件外面一圈墨色描邊，粗細用雜訊微微起伏
// 光源跟著鏡頭走（固定在畫面左上方），所以不管轉到哪一面都是亮的那一面。

import * as THREE from '../vendor/three.module.min.js';

// ── 調色盤：和 v2 設計稿的繪本風同一組 ─────────────────────────────────
const P = {
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

const R = 5;                 // 星球半徑
const SHADOW_TINT = new THREE.Color(0x6e6a9e);  // 暗面混進去的冷紫

// ════════════════════════════════════════════════════════════════════
// 繪本材質
// ════════════════════════════════════════════════════════════════════
const sharedUniforms = {
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

function bookMat(hex, { hatch = 1, vertexColors = false } = {}) {
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
function addOutlineNormals(geo) {
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
function mergeParts(parts) {
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
function inked(geo, hex, { line = 1.6, hatch = 1, vertexColors = false } = {}) {
  addOutlineNormals(geo);
  const g = new THREE.Group();
  const body = new THREE.Mesh(geo, bookMat(hex, { hatch, vertexColors }));
  const edge = new THREE.Mesh(geo, outlineMat(line));
  g.add(edge, body);
  g.userData.body = body;
  return g;
}

// ════════════════════════════════════════════════════════════════════
// 星球
// ════════════════════════════════════════════════════════════════════
// 地表的小起伏。CPU 和 GPU 要用同一支，物件才放得剛好貼地。
function noise3(x, y, z) {
  return Math.sin(x * 1.7 + Math.sin(y * 2.3)) * 0.5 +
         Math.sin(y * 2.1 + Math.sin(z * 1.9)) * 0.35 +
         Math.sin(z * 2.6 + Math.sin(x * 1.3)) * 0.25;
}
const POND = new THREE.Vector3(0.62, 0.35, -0.70).normalize();
const PATH_AXIS = new THREE.Vector3(0.25, 0.25, 1).normalize();   // 小徑沿著這條大圓走

function groundHeight(dir) {
  let h = noise3(dir.x * 2.2, dir.y * 2.2, dir.z * 2.2) * 0.11;
  const pond = dir.angleTo(POND);
  if (pond < 0.42) h -= 0.10 * (1 - pond / 0.42) ** 2;        // 池塘那裡凹下去
  return R + h;
}

function makePlanet() {
  const geo = new THREE.SphereGeometry(R, 120, 84);
  const pos = geo.getAttribute('position');
  const colors = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3(), c = new THREE.Color();
  const grass = P.grass.map((h) => new THREE.Color(h));
  const path = new THREE.Color(P.path), dirt = new THREE.Color(P.dirt);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const r = groundHeight(v);
    pos.setXYZ(i, v.x * r, v.y * r, v.z * r);
    // 草地是幾種綠混在一起，像色鉛筆一筆一筆塗的
    // 大片、柔和的漸層，像水彩一刷過去；細的紋理交給著色器的排線。
    // （第一版每個頂點跳色，整顆星球像迷彩）
    const k = THREE.MathUtils.clamp((noise3(v.x * 3.2, v.y * 3.2, v.z * 3.2) + 1.1) / 2.2, 0, 1);
    c.copy(grass[0]).lerp(grass[3], k * 0.75).lerp(grass[2], Math.max(0, v.y) * 0.35);
    // 小徑
    const onPath = Math.abs(v.dot(PATH_AXIS));
    if (onPath < 0.07) c.lerp(path, 0.85 * (1 - onPath / 0.07) ** 0.5);
    // 池塘邊一圈泥土
    const pond = v.angleTo(POND);
    if (pond < 0.47 && pond > 0.36) c.lerp(dirt, 0.55);
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const planet = inked(geo, 0xffffff, { line: 2.2, vertexColors: true });
  planet.userData.kind = 'ground';
  return planet;
}

/** 把物件放到星球表面：+Y 對齊地面法線，再繞自己的 Y 轉 yaw */
const _up = new THREE.Vector3(0, 1, 0);
function placeOn(obj, dir, yaw = 0, sink = 0.02) {
  const d = dir.clone().normalize();
  obj.position.copy(d).multiplyScalar(groundHeight(d) - sink);
  obj.quaternion.setFromUnitVectors(_up, d);
  obj.rotateY(yaw);
  return obj;
}
const dirFrom = (lat, lon) => {
  const a = THREE.MathUtils.degToRad(lat), b = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b));
};

// 地上的影子：一個淡淡的圓，比即時陰影便宜很多，而且更像繪本
let blobTex = null;
function blob(radius) {
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

// ════════════════════════════════════════════════════════════════════
// 星球上的東西
// ════════════════════════════════════════════════════════════════════
function makeTree(scale = 1, tint = 0) {
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

function makeHouse() {
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

function makeFlower(i) {
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

function makeRock(s) {
  const geo = new THREE.DodecahedronGeometry(0.28, 0);
  const r = inked(geo, P.rock, { line: 1.4 });
  r.scale.set(s, s * 0.6, s * 0.85);
  r.position.y = 0.08;
  const g = new THREE.Group(); g.add(r, blob(0.3 * s));
  return g;
}

function makeMushroom() {
  const m = new THREE.Group();
  m.add(inked(mergeParts([
    { geo: new THREE.CylinderGeometry(0.05, 0.065, 0.18, 10), color: P.stem, pos: [0, 0.09, 0] },
    { geo: new THREE.SphereGeometry(0.14, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), color: P.mushroom, pos: [0, 0.17, 0] },
  ]), 0xffffff, { line: 1.1, vertexColors: true }));
  return m;
}

function makePond() {
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

function makeCloud() {
  const c = new THREE.Group();
  c.add(inked(mergeParts([[0, 0, 0, 0.55], [0.55, -0.08, 0.05, 0.42], [-0.55, -0.1, 0, 0.4], [0.2, 0.25, -0.05, 0.4]]
    .map(([x, y, z, r]) => ({ geo: new THREE.IcosahedronGeometry(r, 3), color: P.cloud, pos: [x, y, z], scale: [1, 0.72, 1] }))),
    0xffffff, { line: 1.6, hatch: 0.5, vertexColors: true }));
  return c;
}

// ════════════════════════════════════════════════════════════════════
// 倉鼠（和 2D 那隻同一組顏色、同樣圓滾滾的比例）
// ════════════════════════════════════════════════════════════════════
function makeHamster() {
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
// 場景
// ════════════════════════════════════════════════════════════════════
export function startPlanet(canvas, hooks = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  const world = new THREE.Group(); scene.add(world);
  const planet = makePlanet(); world.add(planet);

  const interactive = [];
  const house = placeOn(makeHouse(), dirFrom(18, 8), 0.1); world.add(house); interactive.push(house);
  const HOUSE_DOOR = dirFrom(12.5, 8.6);

  const trees = [
    [36, -28, 1.05, 0], [8, -42, 0.85, 1], [-22, 30, 1.15, 2], [52, 40, 0.9, 3], [-6, 95, 1.0, 1],
    [30, 150, 1.1, 0], [-40, -110, 0.95, 2], [65, -120, 0.8, 3], [-58, 20, 0.9, 0], [10, -160, 1.0, 1],
  ].map(([la, lo, s, t], i) => {
    const tr = placeOn(makeTree(s, t), dirFrom(la, lo), i * 1.3); world.add(tr); interactive.push(tr); return tr;
  });

  const pond = placeOn(makePond(), POND, 0, 0.0); world.add(pond);

  let fi = 0;
  const flowerSpots = [];
  for (let k = 0; k < 34; k++) {
    // 花集中在小屋前和池塘邊，其他地方零星幾朵 —— 一叢一叢的才像畫
    // 用固定的亂數撒開。第一版排在經緯度格子上，從側面看疊成一根根串珠
    const jit = (n) => Math.sin(k * 12.9898 + n * 78.233) * 43758.5453 % 1;
    const near = k < 12 ? dirFrom(6 + jit(1) * 9, -12 + jit(2) * 16) :
                 k < 22 ? POND.clone().add(new THREE.Vector3(Math.sin(k * 2.3), Math.cos(k * 1.7), Math.sin(k)).multiplyScalar(0.12)) :
                 dirFrom(((k * 47) % 140) - 70, (k * 83) % 360);
    if (near.angleTo(POND) < 0.4) continue;
    const f = placeOn(makeFlower(fi++), near, k); world.add(f); interactive.push(f); flowerSpots.push(f);
  }
  [[-10, 60, 1.2], [42, -70, 0.9], [-30, -40, 1.4], [20, 110, 1.0], [-50, 140, 1.1]].forEach(([la, lo, s]) =>
    world.add(placeOn(makeRock(s), dirFrom(la, lo), la)));
  [[-15, -20], [-17, -16], [25, 70], [-35, 75], [-36, 79]].forEach(([la, lo]) =>
    world.add(placeOn(makeMushroom(), dirFrom(la, lo), lo)));

  // 小草叢：三片細葉一叢，撒滿星球。全部合成一個幾何，整顆星球的草只要畫兩次
  {
    const parts = [], blade = new THREE.ConeGeometry(0.035, 0.22, 4);
    const up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), m = new THREE.Matrix4();
    for (let i = 0; i < 160; i++) {
      const d = new THREE.Vector3(Math.sin(i * 2.399) * Math.sqrt(1 - ((i + 0.5) / 160 * 2 - 1) ** 2),
                                  (i + 0.5) / 160 * 2 - 1,
                                  Math.cos(i * 2.399) * Math.sqrt(1 - ((i + 0.5) / 160 * 2 - 1) ** 2)).normalize();
      if (d.angleTo(POND) < 0.5 || Math.abs(d.dot(PATH_AXIS)) < 0.08) continue;
      const base = d.clone().multiplyScalar(groundHeight(d));
      q.setFromUnitVectors(up, d);
      for (let b = 0; b < 3; b++) {
        const g = blade.clone();
        g.translate(0, 0.1, 0);
        g.rotateZ((b - 1) * 0.35); g.rotateY(i + b * 2.1);
        g.applyMatrix4(m.makeRotationFromQuaternion(q)); g.translate(base.x, base.y, base.z);
        parts.push({ geo: g, color: P.leaf[(i + b) % 4] });
      }
    }
    world.add(inked(mergeParts(parts), 0xffffff, { line: 0.9, hatch: 0.4, vertexColors: true }));
  }

  const clouds = new THREE.Group(); scene.add(clouds);
  [[9.2, 0.4, 1.4], [9.6, 2.3, 1.9], [9.4, 4.2, 1.2], [9.8, 5.4, 2.2]].forEach(([r, ang, tilt]) => {
    const c = makeCloud();
    c.position.set(Math.cos(ang) * r, tilt * 4, Math.sin(ang) * r);
    c.lookAt(0, c.position.y, 0); clouds.add(c);
  });

  const ham = makeHamster(); world.add(ham); interactive.push(ham);
  const hamState = { dir: dirFrom(4, 2), target: null, facing: new THREE.Quaternion(), walk: 0, jump: 0, idle: 0, onArrive: null };
  placeOn(ham, hamState.dir);

  // ── 鏡頭：繞著星球轉。拖曳轉動、雙指／滾輪縮放；放手一陣子後慢慢跟著倉鼠 ─────
  // 距離 = 依螢幕比例算出「整顆星球剛好放得下」的 base × 她縮放的倍數。
  // 不用加大視角去塞直放的螢幕：視角一大，邊緣的樹會被拉成廣角變形。
  const cam = { theta: 0.3, phi: 2.2, zoom: 0.86, tTheta: 0.3, tPhi: 2.2, tZoom: 0.86, base: 18, lastTouch: -1e9,
                look: new THREE.Vector3(), tLook: new THREE.Vector3() };
  const FIT = 6.9;    // 星球加上樹頂、雲，大約要放得下的半徑
  // 鏡頭對準的不是星球中心，而是「中心往倉鼠走一半」的那一點。對準中心的話，
  // 鏡頭一壓低、一拉近，倉鼠就被擠到畫面最上緣切掉（第二版截圖只剩兩隻腳）。
  function placeCamera() {
    camera.position.setFromSphericalCoords(cam.base * cam.zoom, cam.phi, cam.theta).add(cam.look);
    camera.lookAt(cam.look);
  }

  // ── 尺寸 ────────────────────────────────────────────────────────────
  // 解析度上限。自動降畫質會改它，所以要在 resize() 第一次被呼叫之前宣告 ——
  // 宣告在後面的話，typeof 碰到暫時性死區一樣會丟錯
  const PR_STEPS = [2, 1.5, 1.25];
  let prCap = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const pr = Math.min(window.devicePixelRatio || 1, prCap);   // 平板 DPR 2 封頂，省電
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = 34;
    camera.updateProjectionMatrix();
    cam.base = FIT / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(1, camera.aspect));
    sharedUniforms.uPixelRatio.value = pr;
    sharedUniforms.uResolution.value.set(w * pr, h * pr);
  }
  addEventListener('resize', resize); resize();

  // ── 點、拖、縮放 ──────────────────────────────────────────────────────
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pointers = new Map();
  let downAt = null, pinch0 = 0, dist0 = 0;
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) downAt = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); dist0 = cam.tZoom;
      if (downAt) downAt.moved = true;
    }
    cam.lastTouch = performance.now();
    hooks.onFirstTouch && hooks.onFirstTouch();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId), cur = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, cur);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch0) cam.tZoom = THREE.MathUtils.clamp(dist0 * pinch0 / d, 0.62, 1.35);
    } else if (pointers.size === 1) {
      const dx = cur.x - prev.x, dy = cur.y - prev.y;
      if (downAt && Math.hypot(cur.x - downAt.x, cur.y - downAt.y) > 8) downAt.moved = true;
      if (downAt && downAt.moved) {
        cam.tTheta -= dx * 0.006;
        cam.tPhi = THREE.MathUtils.clamp(cam.tPhi - dy * 0.006, 0.35, Math.PI - 0.35);
      }
    }
    cam.lastTouch = performance.now();
  });
  const up = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size === 0 && downAt && !downAt.moved && performance.now() - downAt.t < 450) tap(e.clientX, e.clientY);
    if (pointers.size === 0) { downAt = null; pinch0 = 0; }
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); downAt = null; });
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); cam.tZoom = THREE.MathUtils.clamp(cam.tZoom * (1 + e.deltaY * 0.001), 0.62, 1.35); cam.lastTouch = performance.now(); }, { passive: false });

  const rootOf = (o) => { while (o && !o.userData.kind) o = o.parent; return o; };
  function tap(x, y) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects([...interactive, planet], true).find((h) => h.object.material.type === 'ShaderMaterial' && h.object.material.side !== THREE.BackSide);
    if (!hit) return;
    const obj = rootOf(hit.object);
    const kind = obj ? obj.userData.kind : 'ground';
    const point = hit.point.clone();
    world.worldToLocal(point);
    if (kind === 'hamster') { hamJump(); return; }
    if (kind === 'tree') { wobble(obj.userData.crown, 1.0); hooks.sfx && hooks.sfx('pop'); dropLeaves(obj); }
    if (kind === 'flower') { wobble(obj.userData.head, 1.4); hooks.sfx && hooks.sfx('sparkle'); hooks.burst && hooks.burst(project(obj, 0.4), '✿'); }
    if (kind === 'house') {
      wobble(obj, 0.25); hooks.sfx && hooks.sfx('door');
      walkTo(HOUSE_DOOR, () => { hooks.say && hooks.say('到家了！'); hamJump(); });
      return;
    }
    // 點地面（或點了樹、花之後）→ 倉鼠走過去，停在旁邊一點點
    const dir = point.normalize();
    if (kind !== 'ground') dir.lerp(hamState.dir, 0.12).normalize();
    walkTo(dir);
  }

  // 螢幕座標（給 2D 的愛心、星星用）
  const _p = new THREE.Vector3();
  function project(obj, lift = 0.8) {
    obj.updateWorldMatrix(true, false);
    _p.set(0, lift, 0).applyMatrix4(obj.matrixWorld).project(camera);
    const r = canvas.getBoundingClientRect();
    return { x: r.left + (_p.x + 1) / 2 * r.width, y: r.top + (1 - _p.y) / 2 * r.height };
  }

  // ── 小動畫 ────────────────────────────────────────────────────────────
  const wobbles = [];
  function wobble(obj, amt) { wobbles.push({ obj, t: 0, amt, base: obj.scale.clone() }); }
  const leaves = [];
  function dropLeaves(tree) {
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.07, 5), new THREE.MeshBasicMaterial({ color: P.leaf[i % 4], side: THREE.DoubleSide }));
      leaf.position.set((Math.random() - 0.5) * 0.9, 1.1 + Math.random() * 0.4, (Math.random() - 0.5) * 0.9);
      tree.add(leaf);
      leaves.push({ m: leaf, t: 0, vx: (Math.random() - 0.5) * 0.3, spin: Math.random() * 6 });
    }
  }
  function hamJump() {
    if (hamState.jump > 0) return;
    hamState.jump = 0.0001;
    hooks.sfx && hooks.sfx('jump');
    setTimeout(() => hooks.burst && hooks.burst(project(ham, 1.2), '💛'), 120);
  }
  function walkTo(dir, onArrive) {
    hamState.target = dir.clone().normalize();
    hamState.onArrive = onArrive || null;
    hamState.idle = 0;
  }

  // ── 主迴圈 ────────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  const tmpQ = new THREE.Quaternion(), m4 = new THREE.Matrix4();
  const vUp = new THREE.Vector3(), vFwd = new THREE.Vector3(), vRight = new THREE.Vector3();
  // 自動降畫質：連續 2 秒低於 45 fps 就把解析度降一級（2 → 1.5 → 1.25）。
  // 她的平板是哪一年的我們不知道；寧可畫面稍微糊一點，也不要卡。
  // fps 要用真實時間量：下面的 dt 為了動畫穩定被夾在 0.05 秒以內，拿它來算
  // 的話，再慢都只會顯示「20 fps」，自動降畫質永遠不會觸發
  let frames = 0, fpsT = 0, slowSecs = 0, lastReal = performance.now();

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    sharedUniforms.uTime.value = t;

    // 倉鼠走路：沿著大圓走到目標
    const s = hamState;
    let moving = false;
    if (s.target) {
      const ang = s.dir.angleTo(s.target);
      if (ang < 0.01) {
        s.target = null;
        const cb = s.onArrive; s.onArrive = null; cb && cb();
      } else {
        moving = true;
        const step = Math.min(1, (1.6 * dt / R) / ang);   // 每秒走 1.6 單位
        vFwd.copy(s.target).sub(vUp.copy(s.dir).multiplyScalar(s.dir.dot(s.target))).normalize();
        s.dir.lerp(s.target, step).normalize();
        // 面向前進方向
        vUp.copy(s.dir);
        vRight.crossVectors(vUp, vFwd).normalize();
        vFwd.crossVectors(vRight, vUp).normalize();
        m4.makeBasis(vRight, vUp, vFwd);
        tmpQ.setFromRotationMatrix(m4);
        s.facing.copy(tmpQ);
      }
    } else {
      s.idle += dt;
      // 發呆太久就自己晃到附近
      if (s.idle > 7) {
        const wander = s.dir.clone().add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.45)).normalize();
        walkTo(wander);
      }
    }
    // 位置貼地；轉向平滑一點
    ham.position.copy(s.dir).multiplyScalar(groundHeight(s.dir) - 0.02);
    if (!s.facing.lengthSq() || s.facing.w === 1 && !s.target) {
      vUp.copy(s.dir); ham.quaternion.setFromUnitVectors(_up, vUp);
      s.facing.copy(ham.quaternion);
    } else {
      // 先保證頭朝上（貼地），再慢慢轉向
      const want = s.facing.clone();
      const upFix = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0).applyQuaternion(want), s.dir);
      want.premultiply(upFix);
      ham.quaternion.slerp(want, Math.min(1, dt * 8));
    }
    const rig = ham.userData;
    s.walk = moving ? s.walk + dt * 11 : s.walk * 0.85;
    let lift = Math.abs(Math.sin(s.walk)) * 0.07, jumpLift = 0;
    if (s.jump > 0) {
      s.jump += dt * 2.6;
      jumpLift = Math.sin(Math.min(Math.PI, s.jump * Math.PI)) * 0.55;
      lift += jumpLift;
      if (s.jump >= 1) s.jump = 0;
    }
    rig.bodyRig.position.y = lift;
    rig.bodyRig.rotation.z = moving ? Math.sin(s.walk) * 0.06 : 0;
    const breathe = 1 + Math.sin(t * 2.4) * 0.015;
    rig.bodyRig.scale.set(breathe, 1 / breathe, breathe);
    // 走路時腳貼地（身體晃、腳不飄）；跳起來時腳要跟著離地，
    // 不然草地上會留下四顆粉紅色的橢圓（截圖抓到的）
    rig.paws.forEach((p, i) => { p.position.y = 0.05 + jumpLift + (moving ? Math.max(0, Math.sin(s.walk + (i % 2 ? Math.PI : 0))) * 0.08 : 0); });
    rig.ears.forEach((e, i) => { e.rotation.x = Math.sin(t * 3 + i) * 0.05 + (Math.sin(t * 0.7) > 0.97 ? 0.3 : 0); });
    const blink = (t % 3.7) < 0.12;
    rig.eyes.forEach((e) => { e.scale.y = blink ? 0.15 : 1; });
    rig.hands.forEach((h, i) => { h.position.y = 0.42 + (moving ? Math.sin(s.walk + i * Math.PI) * 0.03 : 0); });

    // 樹搖、花彈
    for (let i = wobbles.length - 1; i >= 0; i--) {
      const w = wobbles[i]; w.t += dt;
      const k = Math.sin(w.t * 18) * Math.exp(-w.t * 4) * 0.12 * w.amt;
      w.obj.scale.set(w.base.x * (1 + k), w.base.y * (1 - k), w.base.z * (1 + k));
      if (w.t > 1.2) { w.obj.scale.copy(w.base); wobbles.splice(i, 1); }
    }
    for (let i = leaves.length - 1; i >= 0; i--) {
      const l = leaves[i]; l.t += dt;
      l.m.position.y -= dt * 0.55; l.m.position.x += Math.sin(l.t * 4) * dt * 0.4 + l.vx * dt;
      l.m.rotation.set(l.t * l.spin, l.t * 2, 0);
      if (l.m.position.y < 0.05) { l.m.parent.remove(l.m); leaves.splice(i, 1); }
    }
    clouds.rotation.y += dt * 0.025;

    // 鏡頭：放手 2.5 秒後，慢慢轉到看得到倉鼠的角度
    if (performance.now() - cam.lastTouch > 2500) {
      const hp = ham.getWorldPosition(new THREE.Vector3()).normalize();
      const sph = new THREE.Spherical().setFromVector3(hp);
      // 鏡頭在倉鼠「下面」一點（phi 大一點）往上看，倉鼠就站在星球的上緣、
      // 背後是天空 —— 小王子插畫裡那個構圖。反過來從上面看，倉鼠會掉到
      // 星球中間偏下（第一版就是這樣）
      const wantPhi = THREE.MathUtils.clamp(sph.phi + 0.88, 0.35, Math.PI - 0.35);
      let dTheta = sph.theta - cam.tTheta;
      dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
      cam.tTheta += dTheta * Math.min(1, dt * 0.9);
      cam.tPhi += (wantPhi - cam.tPhi) * Math.min(1, dt * 0.9);
    }
    cam.theta += (cam.tTheta - cam.theta) * Math.min(1, dt * 7);
    cam.phi += (cam.tPhi - cam.phi) * Math.min(1, dt * 7);
    cam.zoom += (cam.tZoom - cam.zoom) * Math.min(1, dt * 7);
    cam.tLook.copy(ham.position).multiplyScalar(0.5);
    cam.look.lerp(cam.tLook, Math.min(1, dt * 2.5));
    placeCamera();

    renderer.render(scene, camera);

    const nowReal = performance.now();
    frames++; fpsT += (nowReal - lastReal) / 1000; lastReal = nowReal;
    if (fpsT >= 1) {
      const fps = frames / fpsT;
      slowSecs = fps < 45 ? slowSecs + 1 : 0;
      const next = PR_STEPS.find((x) => x < prCap - 0.01);
      if (slowSecs >= 2 && next && (window.devicePixelRatio || 1) > next) { prCap = next; slowSecs = 0; resize(); }
      hooks.onStats && hooks.onStats({ fps: Math.round(frames / fpsT), calls: renderer.info.render.calls, tris: renderer.info.render.triangles, pr: renderer.getPixelRatio() });
      frames = 0; fpsT = 0;
    }
  }
  renderer.setAnimationLoop(frame);

  return {
    renderer, scene, camera,
    get pixelRatioCap() { return prCap; },
    walkTo: (lat, lon) => walkTo(dirFrom(lat, lon)),
    jump: hamJump,
    ham, hamState,
  };
}
