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

import { THREE, P, sharedUniforms, inked, mergeParts, blob, makeTree, makeHouse, makeFlower, makeRock,
         makeMushroom, makePond, makeCloud, makeHamster, animateHamster, createWobbler, createStage, box as roundBox } from './book3d.js';

const R = 5;                 // 星球半徑

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
export const dirFrom = (lat, lon) => {
  const a = THREE.MathUtils.degToRad(lat), b = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b));
};

// ════════════════════════════════════════════════════════════════════
// 星球上的東西
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// 地區的入口：星球上的縮小版，點了就走進去
// ════════════════════════════════════════════════════════════════════
/** 後院：四小塊田 + 一個插著紅蘿蔔的木牌。進去之後是 garden.html 的大場景 */
function makeGardenPatch() {
  const box = (sx, sy, sz) => roundBox(sx, sy, sz);
  const parts = [];
  [[-0.2, -0.16], [0.2, -0.16], [-0.2, 0.18], [0.2, 0.18]].forEach(([x, z]) => {
    parts.push({ geo: box(0.34, 0.08, 0.26), color: 0xb08560, pos: [x, 0.04, z] });
    parts.push({ geo: box(0.28, 0.08, 0.2), color: 0x86603f, pos: [x, 0.05, z] });
  });
  // 一塊田上長著三根紅蘿蔔，遠遠看就知道是菜園
  [-0.28, -0.2, -0.12].forEach((x) => {
    parts.push({ geo: new THREE.ConeGeometry(0.025, 0.08, 6), color: 0xd9772f, pos: [x, 0.11, 0.18], rot: [Math.PI, 0, 0] });
    parts.push({ geo: new THREE.ConeGeometry(0.012, 0.09, 4), color: 0x6f9a55, pos: [x, 0.17, 0.18] });
  });
  // 木牌
  parts.push({ geo: box(0.03, 0.42, 0.03), color: 0x8a6448, pos: [0.46, 0.21, -0.05] });
  parts.push({ geo: box(0.26, 0.16, 0.03), color: 0xfbf1dc, pos: [0.46, 0.38, -0.05] });
  parts.push({ geo: new THREE.ConeGeometry(0.03, 0.1, 6), color: 0xd9772f, pos: [0.46, 0.38, -0.025], rot: [0, 0, Math.PI / 2.4] });
  const g = new THREE.Group();
  g.add(inked(mergeParts(parts), 0xffffff, { line: 1.3, vertexColors: true }), blob(0.62));
  g.userData = { kind: 'garden' };
  return g;
}

// ════════════════════════════════════════════════════════════════════
// 場景
// ════════════════════════════════════════════════════════════════════
export function startPlanet(canvas, hooks = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  const world = new THREE.Group(); scene.add(world);
  const planet = makePlanet(); world.add(planet);

  const interactive = [];
  const house = placeOn(makeHouse(), dirFrom(18, 8), 0.1); world.add(house); interactive.push(house);
  const HOUSE_DOOR = dirFrom(12.5, 8.6);
  // 地區：預設只有後院（v2 的小星球）。v3 傳 hooks.regions 進來，放 v1 倉鼠世界的 7 個區域：
  //   { name, make() → 3D 物件, at: [lat, lon], stand: [lat, lon], yaw, scale }
  //   name 是 'home' 時不用 make，就是這棟小屋；點小屋會走進「家」
  // 倉鼠站在入口「旁邊」而不是正前方：站太近的話，她會擋住入口，
  // 浮在上面的標籤又剛好蓋住她的臉（截圖抓到的）
  const regionList = hooks.regions || [{ name: 'garden', make: makeGardenPatch, at: [10, -22], stand: [9, -11.5], yaw: -0.3, scale: 1.4 }];
  const REGIONS = {};
  for (const rg of regionList) {
    if (rg.name === 'home') { house.userData.kind = 'home'; REGIONS.home = { obj: house, stand: HOUSE_DOOR }; continue; }
    const make = rg.make || (rg.name === 'garden' ? makeGardenPatch : null);   // 後院用這支自己的菜園
    const obj = placeOn(make(), dirFrom(...rg.at), rg.yaw || 0);
    obj.scale.setScalar(rg.scale || 1);
    obj.userData.kind = rg.name;
    world.add(obj); interactive.push(obj);
    REGIONS[rg.name] = { obj, stand: dirFrom(...rg.stand) };
  }
  // 地區附近不放樹、石頭、香菇、零散的花，免得擋住入口
  const spots = regionList.filter((rg) => rg.at).map((rg) => dirFrom(...rg.at));
  // （只在傳了 hooks.regions 時才清；v2 的小星球維持原樣）
  const clear = hooks.regions ? (d) => spots.every((sp) => sp.angleTo(d) > 0.24) : () => true;

  const trees = [
    [36, -28, 1.05, 0], [8, -42, 0.85, 1], [-22, 30, 1.15, 2], [52, 40, 0.9, 3], [-6, 95, 1.0, 1],
    [30, 150, 1.1, 0], [-40, -110, 0.95, 2], [65, -120, 0.8, 3], [-58, 20, 0.9, 0], [10, -160, 1.0, 1],
  ].filter(([la, lo]) => clear(dirFrom(la, lo))).map(([la, lo, s, t], i) => {
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
    if (near.angleTo(POND) < 0.4 || !clear(near)) continue;
    const f = placeOn(makeFlower(fi++), near, k); world.add(f); interactive.push(f); flowerSpots.push(f);
  }
  [[-10, 60, 1.2], [42, -70, 0.9], [-30, -40, 1.4], [20, 110, 1.0], [-50, 140, 1.1]].filter(([la, lo]) => clear(dirFrom(la, lo))).forEach(([la, lo, s]) =>
    world.add(placeOn(makeRock(s), dirFrom(la, lo), la)));
  [[-15, -20], [-17, -16], [25, 70], [-35, 75], [-36, 79]].filter(([la, lo]) => clear(dirFrom(la, lo))).forEach(([la, lo]) =>
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
  if (hooks.startAt && REGIONS[hooks.startAt]) hamState.dir.copy(REGIONS[hooks.startAt].stand);
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
  // 從地區回來的時候，鏡頭一開始就對著倉鼠，不要從預設角度轉一大圈過去
  {
    const sph = new THREE.Spherical().setFromVector3(hamState.dir.clone().multiplyScalar(R));
    cam.theta = cam.tTheta = sph.theta;
    cam.phi = cam.tPhi = THREE.MathUtils.clamp(sph.phi + 0.88, 0.35, Math.PI - 0.35);
    cam.look.copy(hamState.dir).multiplyScalar(R * 0.5);
  }

  // ── 尺寸、解析度、自動降畫質：交給 book3d 的 createStage ──────────────
  const stage = createStage(canvas, camera, {
    onResize() {
      camera.fov = 34; camera.updateProjectionMatrix();
      cam.base = FIT / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(1, camera.aspect));
    },
    onStats: hooks.onStats,
  });
  const renderer = stage.renderer;

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
    if (REGIONS[kind]) { wobble(obj, 0.25); enter(kind); return; }
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
  const wobbler = createWobbler();
  const wobble = (obj, amt) => wobbler.add(obj, amt);
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
  /**
   * 走進一個地區：倉鼠先走到入口，鏡頭拉近、俯衝，再換頁。
   * 不直接換頁 —— 有「走過去、湊近看」這一段，她才感覺得到後院就在小屋旁邊，
   * 而不是點了一個按鈕跳到另一個網頁。
   */
  let entering = null;
  function enter(name) {
    // 走在路上又點了別的地區 → 改去新的那一區（她改變主意時，第二下不能沒反應）。
    // 已經到門口、鏡頭在拉近了（arrived）就不再改
    if (entering && (entering.name === name || entering.arrived)) return;
    const R0 = REGIONS[name]; if (!R0) return;
    const trip = entering = { name, arrived: false };
    hooks.sfx && hooks.sfx('whoosh');
    walkTo(R0.stand, () => {
      if (entering !== trip) return;
      trip.arrived = true;
      cam.lastTouch = -1e9;          // 鏡頭立刻跟上倉鼠
      cam.tZoom = 0.5;
      hooks.sfx && hooks.sfx('door');
      setTimeout(() => { if (entering === trip) hooks.onEnter && hooks.onEnter(name); }, 750);
    });
  }
  function enterRegion(name) { enter(name); }

  function walkTo(dir, onArrive) {
    // 走去某一區的路上她點了地面 → 這趟不進去了
    if (!onArrive && entering && !entering.arrived) entering = null;
    hamState.target = dir.clone().normalize();
    hamState.onArrive = onArrive || null;
    hamState.idle = 0;
  }

  // ── 主迴圈 ────────────────────────────────────────────────────────────
  const tmpQ = new THREE.Quaternion(), m4 = new THREE.Matrix4();
  const vUp = new THREE.Vector3(), vFwd = new THREE.Vector3(), vRight = new THREE.Vector3();
  // 自動降畫質：連續 2 秒低於 45 fps 就把解析度降一級（2 → 1.5 → 1.25）。
  // 她的平板是哪一年的我們不知道；寧可畫面稍微糊一點，也不要卡。

  function frame(dt, t) {
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
    animateHamster(ham, s, dt, t, moving);

    // 樹搖、花彈
    wobbler.update(dt);
    for (let i = leaves.length - 1; i >= 0; i--) {
      const l = leaves[i]; l.t += dt;
      l.m.position.y -= dt * 0.55; l.m.position.x += Math.sin(l.t * 4) * dt * 0.4 + l.vx * dt;
      l.m.rotation.set(l.t * l.spin, l.t * 2, 0);
      if (l.m.position.y < 0.05) { l.m.parent.remove(l.m); leaves.splice(i, 1); }
    }
    clouds.rotation.y += dt * 0.025;
    // 地區自己的小動畫（例如摩天輪會轉）
    for (const k in REGIONS) { const o = REGIONS[k].obj; o.userData.tick && o.userData.tick(dt, t); }

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
    hooks.onFrame && hooks.onFrame();

  }
  stage.start(scene, frame);

  return {
    renderer, scene, camera,
    get pixelRatioCap() { return stage.pixelRatioCap; },
    walkTo: (lat, lon) => walkTo(dirFrom(lat, lon)),
    enterRegion,
    regions: () => Object.keys(REGIONS),
    /** 結束進場動畫（例如這一區還沒開，就留在星球上） */
    cancelEnter() { entering = null; cam.tZoom = 0.86; },
    /** 地區入口的螢幕座標；轉到星球背面（看不到）的時候 visible 是 false */
    regionScreen(name) {
      const o = REGIONS[name].obj;
      const wp = o.getWorldPosition(new THREE.Vector3());
      const toCam = camera.position.clone().sub(wp).normalize();
      const p = project(o, 0.75);
      // 走在路上標籤還在（可以改點別區）；到門口、鏡頭拉近時才收起來
      return Object.assign(p, { visible: wp.clone().normalize().dot(toCam) > 0.25 && !(entering && entering.arrived) });
    },
    jump: hamJump,
    ham, hamState,
  };
}
