/* TRIZNES · Сочи 3D · Два мира — движок на Three.js.
   Каркас SOCHI MATRIX (Аргон) + канон ядра TRIZNES. Здания, вода и улицы — реальные (OpenStreetMap).
   Координаты узлов — только подтверждённые (база triznes_world_places или OSM). 2026-11-12, Claude. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = (k, v) => { try { if (v !== undefined) localStorage.setItem(k, v); return localStorage.getItem(k) } catch (e) { return null } };

const PAL = {
  real: { bg: 0xcfe6f2, fog: 0xdcebf3, land: 0xeee5d6, sea: 0x6cc2df, green: 0xb8d9a2, sand: 0xf3e2c0,
    road: 0xffffff, road2: 0xffe3c8, road3: 0xffb98c, path: 0xe2d6c6, rail: 0xb6a9c8,
    b: ['#f6efe6', '#efe3ea', '#e6dcf3', '#d9e4f6'], edge: 0x9a8cb4, edgeOp: 0, beamOp: .38, sun: 1.0, amb: .75 },
  synth: { bg: 0x0d0820, fog: 0x140a2c, land: 0x110b26, sea: 0x0b1d44, green: 0x0f2420, sand: 0x231a3a,
    road: 0x2a1e4c, road2: 0x4d3388, road3: 0xff3dcb, path: 0x22183f, rail: 0x3a2c66,
    b: ['#1c1440', '#2c1e5e', '#4a2c88', '#8a3fc0'], edge: 0x6a4cc0, edgeOp: .18, beamOp: .55, sun: .55, amb: .55 },
  matrix: { bg: 0x020308, fog: 0x03060f, land: 0x03050b, sea: 0x020b18, green: 0x041210, sand: 0x070a14,
    road: 0x0a3a44, road2: 0x12707e, road3: 0x42ecff, path: 0x082228, rail: 0x0f4d5a,
    b: ['#05070e', '#060a14', '#081020', '#0a1530'], edge: 0x42ecff, edgeOp: .55, beamOp: .8, sun: .25, amb: .35 },
};

let OSM, W, CH, world = 'synth';
let renderer, scene, camera, sun, hemi, ground, seaPlane, bMesh, bEdges, grid;
const layers = {}, nodeObjs = [], farObjs = [], chObjs = [], tagEls = [], arcs = [], waves = [];
const cam = { tx: 0, tz: 300, dist: 2600, theta: -0.78, phi: 0.95 };
let fly = null;

/* ---------- загрузка ---------- */
Promise.all(['./data/sochi-osm.json', './data/sochi-matrix.json', './data/core-characters.json']
  .map(u => fetch(u).then(r => r.ok ? r.json() : null).catch(() => null)))
  .then(([o, w, c]) => {
    if (!o || !w || !window.THREE) { $('load').textContent = 'НЕ ЗАГРУЗИЛОСЬ — ОБНОВИ СТРАНИЦУ'; return }
    OSM = o; W = w; CH = (c && c.characters) || [];
    try { init() } catch (e) { console.error(e); $('load').textContent = 'УСТРОЙСТВО НЕ ТЯНЕТ 3D'; return }
    $('load').classList.add('off');
  });

/* ---------- гео ---------- */
function ll2m(lng, lat) { return [(lng - OSM.origin[0]) * OSM.scale[0], -(lat - OSM.origin[1]) * OSM.scale[1]] }
function kmTo(lng, lat) { const [x, z] = ll2m(lng, lat); return Math.hypot(x, z) / 1000 }

/* ---------- сцена ---------- */
function init() {
  const st = $('stage');
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  st.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 5, 30000);
  hemi = new THREE.HemisphereLight(0xffffff, 0x444466, .6); scene.add(hemi);
  sun = new THREE.DirectionalLight(0xffffff, .8); sun.position.set(-1200, 2000, 900); scene.add(sun);

  const [x0, z0, x1, z1] = OSM.bounds;
  seaPlane = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), new THREE.MeshBasicMaterial({ color: 0x0b1d44 }));
  seaPlane.rotation.x = -Math.PI / 2; seaPlane.position.y = -2; scene.add(seaPlane);
  ground = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ color: 0x110b26 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set((x0 + x1) / 2, -1, (z0 + z1) / 2); scene.add(ground);
  grid = new THREE.GridHelper(14000, 140, 0x42ecff, 0x0b2a33); grid.position.y = 0.6; grid.material.transparent = true; grid.material.opacity = .25; scene.add(grid);

  buildAreas(); buildRoads(); buildBuildings(); buildNodes(); buildFar(); buildChars(); buildArcs(); buildStreets();
  buildChips(); bindUI(); bindControls(); startFeed(); live(); setInterval(live, 60000);
  setWorld(store('sochi3d-world') || 'synth', true);
  const [hx, hz] = centroid();
  cam.tx = hx; cam.tz = hz;
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight) });
  requestAnimationFrame(loop);
  setTimeout(home, 400);
}

function polyShape(flat) {
  const pts = []; for (let i = 0; i < flat.length; i += 2) pts.push(new THREE.Vector2(flat[i], -flat[i + 1]));
  return pts;
}
function buildAreas() {
  const mk = (list, y) => {
    const geos = [];
    list.forEach(rings => {
      try {
        const outer = polyShape(rings[0]); if (outer.length < 3) return;
        const sh = new THREE.Shape(outer);
        for (let i = 1; i < rings.length; i++) sh.holes.push(new THREE.Path(polyShape(rings[i])));
        const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); g.translate(0, y, 0); geos.push(g);
      } catch (e) { }
    });
    return merge(geos);
  };
  layers.water = new THREE.Mesh(mk(OSM.water, 0.2), new THREE.MeshBasicMaterial({ color: 0x0b1d44 }));
  const greens = OSM.green.filter(g => g[0] !== 'sand').map(g => [g[1]]), sands = OSM.green.filter(g => g[0] === 'sand').map(g => [g[1]]);
  layers.green = new THREE.Mesh(mk(greens, 0.1), new THREE.MeshBasicMaterial({ color: 0x0f2420 }));
  layers.sand = new THREE.Mesh(mk(sands, 0.12), new THREE.MeshBasicMaterial({ color: 0x231a3a }));
  [layers.green, layers.sand, layers.water].forEach(m => scene.add(m));
}
function merge(geos) {
  let n = 0; geos.forEach(g => { if (g.index) { const ng = g.toNonIndexed(); g.dispose(); g._ni = ng } else g._ni = g; n += g._ni.attributes.position.count });
  const pos = new Float32Array(n * 3); let o = 0;
  geos.forEach(g => { pos.set(g._ni.attributes.position.array, o); o += g._ni.attributes.position.array.length });
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return out;
}
function buildRoads() {
  const W_ = { primary: 14, trunk: 16, motorway: 16, secondary: 11, tertiary: 9, minor: 6, pier: 5 };
  const groups = { road3: [], road2: [], road: [], path: [], rail: [] };
  const ribbons = { road3: [], road2: [], road: [] };
  OSM.roads.forEach(([cl, f]) => {
    const key = /primary|trunk|motorway/.test(cl) ? 'road3' : /secondary|tertiary/.test(cl) ? 'road2' : /minor|service|pier/.test(cl) ? 'road' : cl === 'rail' ? 'rail' : 'path';
    if (cl === 'ferry' || cl === 'aerialway') return;
    const w = W_[cl];
    for (let i = 0; i + 3 < f.length; i += 2) {
      const ax = f[i], az = f[i + 1], bx = f[i + 2], bz = f[i + 3];
      if (w && ribbons[key]) {
        const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1, nx = -dz / L * w / 2, nz = dx / L * w / 2, y = key === 'road3' ? .5 : .4;
        ribbons[key].push(ax + nx, y, az + nz, ax - nx, y, az - nz, bx + nx, y, bz + nz, bx + nx, y, bz + nz, ax - nx, y, az - nz, bx - nx, y, bz - nz);
      } else groups[key].push(ax, .35, az, bx, .35, bz);
    }
  });
  Object.keys(ribbons).forEach(k => {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(ribbons[k], 3));
    layers['rib_' + k] = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); scene.add(layers['rib_' + k]);
  });
  Object.keys(groups).forEach(k => {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(groups[k], 3));
    layers['ln_' + k] = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8 })); scene.add(layers['ln_' + k]);
  });
}
function buildBuildings() {
  const pos = [], hs = [], edge = [];
  OSM.buildings.forEach(([h, mh, f]) => {
    let pts = []; for (let i = 0; i < f.length; i += 2) pts.push([f[i], f[i + 1]]);
    if (pts.length > 1) { const a = pts[0], b = pts[pts.length - 1]; if (a[0] === b[0] && a[1] === b[1]) pts.pop() }
    if (pts.length < 3) return;
    h = Math.max(3, h); const y0 = mh || 0;
    const v2 = pts.map(p => new THREE.Vector2(p[0], p[1]));
    let tris; try { tris = THREE.ShapeUtils.triangulateShape(v2, []) } catch (e) { return }
    tris.forEach(t => t.forEach(ix => { pos.push(pts[ix][0], h, pts[ix][1]); hs.push(h) }));
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      pos.push(a[0], y0, a[1], b[0], y0, b[1], b[0], h, b[1], a[0], y0, a[1], b[0], h, b[1], a[0], h, a[1]);
      for (let k = 0; k < 6; k++) hs.push(h);
      edge.push(a[0], h, a[1], b[0], h, b[1]);
      if (h > 14 || i % 2 === 0) edge.push(a[0], y0, a[1], a[0], h, a[1]);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3));
  g.computeVertexNormals();
  g.userData.h = hs;
  bMesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  scene.add(bMesh);
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.Float32BufferAttribute(edge, 3));
  bEdges = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: 0x42ecff, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(bEdges);
}
function paintBuildings(P) {
  const cs = P.b.map(c => new THREE.Color(c)), stops = [0, 15, 40, 100];
  const g = bMesh.geometry, col = g.attributes.color.array, hs = g.userData.h, tmp = new THREE.Color();
  for (let i = 0; i < hs.length; i++) {
    const h = hs[i]; let k = 0; while (k < 2 && h > stops[k + 1]) k++;
    const t = Math.min(1, (h - stops[k]) / (stops[k + 1] - stops[k]));
    tmp.copy(cs[k]).lerp(cs[k + 1], t); col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
  }
  g.attributes.color.needsUpdate = true;
}

/* ---------- узлы мира ---------- */
const beamMat = color => new THREE.ShaderMaterial({
  uniforms: { c: { value: new THREE.Color(color) }, op: { value: .6 }, t: { value: 0 } },
  vertexShader: 'varying float vy;void main(){vy=uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'uniform vec3 c;uniform float op;uniform float t;varying float vy;void main(){float a=pow(1.-vy,1.6)*op*(.82+.18*sin(t*2.4-vy*14.));gl_FragColor=vec4(c,a);}',
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
});
const loader = new THREE.TextureLoader();
function buildNodes() { W.nodes.forEach(addNode) }
function addNode(n) {
    const [x, z] = ll2m(n.lng, n.lat), h = 140 + n.level * 30, r = n.kind === 'hub' ? 16 : 11;
    const grp = new THREE.Group(); grp.position.set(x, 0, z);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(r * .55, r, h, 28, 1, true), beamMat(n.color)); beam.position.y = h / 2; grp.add(beam);
    const ring = new THREE.Mesh(new THREE.RingGeometry(r * 1.6, r * 2.1, 48), new THREE.MeshBasicMaterial({ color: n.color, transparent: true, opacity: .7, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 1.2; grp.add(ring);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(n.kind === 'hub' ? 16 : 11, 0), new THREE.MeshBasicMaterial({ color: n.color, wireframe: true }));
    core.position.y = Math.min(h, 120) + 24; grp.add(core);
    if (n.guide && W.guides[n.guide]) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: loader.load('./img/guide-' + n.guide + '.webp'), transparent: true, depthWrite: false }));
      sp.scale.set(34, 34, 1); sp.position.y = core.position.y + 34; grp.add(sp);
    }
    grp.userData = { n, beam, ring, core, h };
    if (PAL[world]) beam.material.uniforms.op.value = PAL[world].beamOp;
    scene.add(grp); nodeObjs.push(grp);
    tag(n.name, n.color, '', () => openNode(n), () => new THREE.Vector3(x, core.position.y + (n.guide ? 62 : 96), z));
}
function buildFar() {
  W.far.forEach(f => {
    const [x, z] = ll2m(f.lng, f.lat), d = Math.hypot(x, z), R = 2300, k = Math.min(1, R / d), px = x * k, pz = z * k;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(5, 8, 260, 16, 1, true), beamMat('#caff39'));
    beam.position.set(px, 130, pz); scene.add(beam); farObjs.push(beam);
    tag(f.name + ' · ' + (d / 1000).toFixed(d < 10000 ? 1 : 0).replace('.', ',') + ' км', '#caff39', 'far', () => openFar(f, d), () => new THREE.Vector3(px, 280, pz));
  });
}
function buildChars() {
  const hub = W.nodes[0], [hx, hz] = ll2m(hub.lng, hub.lat), cols = ['#ff3dcb', '#42ecff', '#caff39', '#ffd36e', '#b46bff'];
  CH.forEach((c, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16), new THREE.MeshBasicMaterial({ color: cols[i % cols.length] }));
    m.userData = { c, a: i / Math.max(1, CH.length) * Math.PI * 2, hx, hz, col: cols[i % cols.length] };
    scene.add(m); chObjs.push(m);
    tag(c.key, cols[i % cols.length], 'ch', () => openChar(c), () => m.position.clone().add(new THREE.Vector3(0, 14, 0)));
  });
}
function buildArcs() {
  const P = W.nodes.map(n => { const [x, z] = ll2m(n.lng, n.lat); return new THREE.Vector3(x, 30, z) });
  const pairs = []; for (let i = 1; i < P.length; i++) pairs.push([0, i]);
  for (let i = 1; i < P.length; i++) pairs.push([i, i + 1 < P.length ? i + 1 : 1]);
  pairs.forEach(([a, b]) => {
    const A = P[a], B = P[b], M = A.clone().lerp(B, .5); M.y = 60 + A.distanceTo(B) * .22;
    const curve = new THREE.QuadraticBezierCurve3(A, M, B);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)), new THREE.LineBasicMaterial({ color: W.nodes[b].color, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(line);
    const dots = []; for (let k = 0; k < 4; k++) { const d = new THREE.Mesh(new THREE.SphereGeometry(3.2, 8, 8), new THREE.MeshBasicMaterial({ color: W.nodes[b].color })); scene.add(d); dots.push(d) }
    arcs.push({ curve, line, dots, off: Math.random() });
  });
}
function buildStreets() {
  OSM.labels.filter(l => l.length === 3).forEach(l => {
    const el = document.createElement('div'); el.className = 'street'; el.textContent = l[0]; $('tags').appendChild(el);
    tagEls.push({ el, street: true, p: new THREE.Vector3(l[1], 4, l[2]) });
  });
}
function tag(text, color, cls, onClick, posFn) {
  const el = document.createElement('button'); el.type = 'button'; el.className = 'tag ' + cls; el.textContent = text; el.style.setProperty('--c', color);
  el.onclick = e => { e.stopPropagation(); onClick() };
  $('tags').appendChild(el); tagEls.push({ el, posFn });
}

/* ---------- миры ---------- */
function setWorld(w, instant) {
  if (!PAL[w]) w = 'synth'; world = w; store('sochi3d-world', w);
  const P = PAL[w], info = W.worlds[w];
  document.documentElement.dataset.world = w;
  $('wTitle').textContent = info.label; $('wSub').textContent = info.sub;
  document.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.w === w)));
  scene.background = new THREE.Color(P.bg); scene.fog = new THREE.Fog(P.fog, 2200, 9000);
  seaPlane.material.color.setHex(P.sea); ground.material.color.setHex(P.land);
  layers.water.material.color.setHex(P.sea); layers.green.material.color.setHex(P.green); layers.sand.material.color.setHex(P.sand);
  ['road3', 'road2', 'road'].forEach(k => layers['rib_' + k].material.color.setHex(P[k]));
  ['road3', 'road2', 'road', 'path', 'rail'].forEach(k => layers['ln_' + k].material.color.setHex(P[k]));
  paintBuildings(P);
  bEdges.material.color.setHex(P.edge); bEdges.material.opacity = P.edgeOp; bEdges.visible = P.edgeOp > 0;
  bEdges.material.blending = w === 'real' ? THREE.NormalBlending : THREE.AdditiveBlending;
  grid.visible = w === 'matrix';
  sun.intensity = P.sun; hemi.intensity = P.amb;
  hemi.color.setHex(w === 'real' ? 0xfff6e8 : 0x9a88ff); hemi.groundColor.setHex(w === 'real' ? 0xb8a890 : 0x1a1030);
  nodeObjs.forEach(o => { o.userData.beam.material.uniforms.op.value = P.beamOp; o.userData.beam.visible = true });
  farObjs.forEach(b => b.material.uniforms.op.value = P.beamOp * .7);
  arcs.forEach(a => { a.line.visible = w !== 'real'; a.dots.forEach(d => d.visible = w !== 'real') });
  if (!instant) feed(`<b>Слой</b> переключён: ${esc(info.label)}`);
}

/* ---------- карточки ---------- */
function sheet(html) { $('sBody').innerHTML = html; $('sheet').classList.add('on'); const x = $('sBody').querySelector('.x'); x && (x.onclick = closeSheet) }
function closeSheet() { $('sheet').classList.remove('on') }
const lvl = n => n.kind === 'partner' ? 'ПАРТНЁР · ' + (n.level ? 'ступень ' + n.level + ' · ' + (W.levels[n.level - 1] || '') : '') : n.level === 0 ? 'Ступень 00 · ВХОД' : `Ступень ${String(n.level).padStart(2, '0')} · ${W.levels[n.level - 1] || ''}`;
function openNode(n) {
  const g = W.guides[n.guide] || null, [x, z] = ll2m(n.lng, n.lat);
  flyTo(x, z, 620, cam.theta, .82, 1600);
  sheet(`<div class="row"><h2 class="ey" style="color:${n.color}">${esc(lvl(n))}</h2><button class="x" aria-label="Закрыть">✕</button></div>
    <img class="cover" src="./art/${esc(n.id)}.webp" alt="" onerror="this.remove()">
    <h3 id="sTitle">${esc(n.name)}</h3><p class="mut">${esc(n.desc)}</p>
    <div class="dual"><div><b>РЕАЛЬНЫЙ СОЧИ</b>${esc(n.real)}</div><div><b>МАТРИЦА</b>${esc(n.matrix)}</div></div>
    ${g && g.name ? `<div class="guide"><img src="./img/guide-${esc(n.guide)}.webp" alt=""><div><b style="color:${g.color}">${esc(g.name)}</b><div class="xs mut">${esc(g.role)}</div></div></div>` : ''}
    <p class="xs mut">Точка подтверждена: ${esc(n.geo)}</p>
    <div class="btns"><a class="btn pri" href="https://yandex.ru/maps/?pt=${n.lng},${n.lat}&z=17&l=map" target="_blank" rel="noopener">Маршрут в Яндекс Картах</a>
    <button class="btn" id="sOrbit">Облететь точку</button></div>`);
  $('sOrbit').onclick = () => { closeSheet(); orbitAround = { x, z, until: performance.now() + 9000 }; flyTo(x, z, 480, cam.theta, .7, 1200) };
  wave(x, z, n.color);
}
function openFar(f, d) {
  sheet(`<div class="row"><h2 class="ey" style="color:var(--lime)">ДАЛЬНЯЯ ТОЧКА МИРА</h2><button class="x" aria-label="Закрыть">✕</button></div>
    <h3 id="sTitle">${esc(f.name)}</h3><p class="mut">${(d / 1000).toFixed(1).replace('.', ',')} км от центра. Луч стоит на краю карты и показывает направление; 3D-кварталы этого района подключим следующим шагом.</p>
    <div class="btns"><a class="btn pri" href="https://yandex.ru/maps/?pt=${f.lng},${f.lat}&z=14&l=map" target="_blank" rel="noopener">Открыть в Яндекс Картах</a></div>`);
}
function openChar(c) {
  sheet(`<div class="row"><h2 class="ey">ПЕРСОНАЖ ЯДРА · ${esc(c.world || '')}</h2><button class="x" aria-label="Закрыть">✕</button></div>
    <h3 id="sTitle">${esc(c.key)}</h3><p class="mut">${esc(c.tagline || '')}</p>
    <div class="dual"><div><b>СТАТУС</b>${c.status === 'IN_GAME' ? 'В ИГРЕ' : esc(c.status)}</div><div><b>УРОВЕНЬ · XP</b>${esc(c.level)} · ${esc(c.xp)}</div></div>
    <p><b>Следующий шаг:</b> ${esc(c.next_step || '—')}</p>
    <p class="xs mut">Живая геопозиция игроков не показывается: персонажи кружат над штабом. Реальное место — только по согласию игрока, после проверки привязки профиля.</p>`);
}
function openPending() {
  sheet(`<div class="row"><h2 class="ey" style="color:var(--gold)">ЖДУТ АДРЕСА · ${W.pending.length}</h2><button class="x" aria-label="Закрыть">✕</button></div>
    <h3 id="sTitle">Узлы из архива Аргона</h3><p class="mut">На реальную карту ставлю только подтверждённые точки. Пришли адрес — узел встанет в город.</p>
    ${W.pending.map(p => `<div class="guide"><div><b>${esc(p.name)}</b><div class="xs mut">${esc(p.why)}</div></div></div>`).join('')}`);
}

/* ---------- лента ядра ---------- */
function feed(html) {
  const ev = document.createElement('div'); ev.className = 'ev'; ev.innerHTML = html;
  const box = $('evs'); box.prepend(ev); while (box.children.length > 6) box.lastChild.remove();
}
function startFeed() {
  const n = id => W.nodes.find(x => x.id === id) || W.nodes[0];
  const items = [
    () => [n('naberezhnaya-sochi'), '<b>АПОЛЛОН</b> держит вход на Набережной: ступень 00 «Улыбнись прохожему»'],
    () => [n('mediahub-primorskaya'), '<b>TRIZNES</b> · ядро на связи, Нейроферма принимает кадры'],
    () => [n('navaginskaya'), '<b>BEZLIKI</b> прокладывает маршрут по Навагинской · ступень 7 «ГОРОД»'],
    () => [n('morport-sochi'), '<b>SOCHIWOOD</b> · Морпорт готов к съёмке, ДИОНИС задаёт формат игры'],
    ...CH.map(c => () => [n('mediahub-primorskaya'), `<b>${esc(c.key)}</b> · ${esc(c.next_step || c.tagline || '')}`]),
  ];
  let i = 0;
  const tick = () => { const [node, html] = items[i++ % items.length](); feed(html); const [x, z] = ll2m(node.lng, node.lat); wave(x, z, node.color) };
  tick(); setInterval(tick, 5200);
  feed('<span class="xs">Лента собрана из снимка ядра. Живые события пойдут, когда подключим таблицу событий мира.</span>');
}
function wave(x, z, color) {
  const m = new THREE.Mesh(new THREE.RingGeometry(10, 16, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 2, z); scene.add(m); waves.push({ m, t0: performance.now() });
}

/* ---------- живое ядро: точки, импульсы, новости Сочи ---------- */
const SB = 'https://bbxhhtpmbtgfaxamgksf.supabase.co', ANON = 'sb_publishable_aFTiVGlsJxeeutL_gEZaKA_S9VyKaHS';
const seenPulse = new Set(), seenNews = new Set(); let liveOk = false;
async function live() {
  let w; try { const r = await fetch(SB + '/rest/v1/rpc/triznes_app_world', { method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: '{}' }); if (!r.ok) return; w = await r.json() } catch (e) { return }
  if (!liveOk) { liveOk = true; feed('<b>Ядро</b> на связи: точки, импульсы и новости Сочи идут вживую') }
  let added = false;
  (w.places || []).forEach(p => {
    const m = p.matrix; if (!m || p.latitude == null || W.nodes.some(n => n.id === p.slug)) return;
    const n = { id: p.slug, name: (p.name || '').toUpperCase(), real: p.address || p.name, matrix: m.title || '', lng: p.longitude, lat: p.latitude, level: m.level || 0, guide: m.guide || null, color: m.color || '#42ecff', kind: p.category, desc: p.description || '', geo: 'база triznes_world_places' };
    W.nodes.push(n); addNode(n); added = true;
  });
  if (added) buildChips();
  (w.pulses || []).slice().reverse().forEach(p => {
    const k = p.place + p.at; if (seenPulse.has(k)) return; seenPulse.add(k);
    const n = W.nodes.find(x => x.id === p.place); const g = W.guides[p.guide];
    feed(`<b>${esc(g ? g.name : 'ЯДРО')}</b> · ${esc(p.title)}`);
    if (n) { const [x, z] = ll2m(n.lng, n.lat); wave(x, z, n.color) }
  });
  (w.news || []).slice(0, 4).reverse().forEach(nw => {
    if (!nw.headline || seenNews.has(nw.headline)) return; seenNews.add(nw.headline);
    feed(`<b>Сочи сейчас</b> · ${nw.url ? `<a href="${esc(nw.url)}" target="_blank" rel="noopener" style="color:inherit">${esc(nw.headline)}</a>` : esc(nw.headline)}`);
  });
}

/* ---------- интерфейс ---------- */
function buildChips() {
  $('chips').innerHTML = W.nodes.map((n, i) => `<button class="panel chip" data-i="${i}" style="--c:${n.color}"><small>${esc(n.kind === 'partner' ? 'ПАРТНЁР' : n.level === 0 ? 'ВХОД' : 'СТУПЕНЬ ' + n.level)}</small>${esc(n.name)}</button>`).join('')
    + `<button class="panel chip pend" data-p="1" style="--c:var(--gold)"><small>ЖДУТ АДРЕСА</small>${W.pending.length} ${W.pending.length === 1 ? 'узел' : 'узла'} Аргона</button>`;
  $('chips').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.p) openPending(); else openNode(W.nodes[+b.dataset.i]) };
}
function bindUI() {
  if (/\/app\/matrix\/?/.test(location.pathname)) $('bBack').hidden = false;
  document.querySelector('.seg').onclick = e => { const b = e.target.closest('button'); if (b) setWorld(b.dataset.w) };
  $('bHome').onclick = () => { closeSheet(); home() };
  $('bFeed').onclick = () => $('feed').classList.toggle('show');
  addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet() });
}

function centroid() { let x = 0, z = 0; W.nodes.forEach(n => { const p = ll2m(n.lng, n.lat); x += p[0]; z += p[1] }); return [x / W.nodes.length, z / W.nodes.length] }
function home() { const [x, z] = centroid(), portrait = innerHeight > innerWidth; flyTo(x, z, portrait ? 2700 : 2000, portrait ? 0.72 : -0.62, portrait ? 0.82 : 0.9, 2400) }

/* ---------- управление камерой ---------- */
let orbitAround = null;
function bindControls() {
  const el = renderer.domElement, ptrs = new Map(); let last = null, pinch = null, moved = 0;
  el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, b: e.button, s: e.shiftKey }); moved = 0; fly = null; orbitAround = null; if (ptrs.size === 2) pinch = pinchState() });
  el.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; moved += Math.abs(dx) + Math.abs(dy);
    p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 1) {
      if (p.b === 2 || p.s) pan(dx, dy);
      else { cam.theta -= dx * 0.005; cam.phi = clamp(cam.phi - dy * 0.004, 0.12, 1.42) }
    } else if (ptrs.size === 2 && pinch) {
      const now = pinchState();
      cam.dist = clamp(cam.dist * pinch.d / now.d, 120, 6000);
      pan(now.cx - pinch.cx, now.cy - pinch.cy);
      cam.theta -= (now.a - pinch.a);
      pinch = now;
    }
  });
  const up = e => { const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; if (p && moved < 6 && ptrs.size === 0) pick(e) };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('wheel', e => { e.preventDefault(); fly = null; cam.dist = clamp(cam.dist * Math.exp(e.deltaY * 0.0012), 120, 6000) }, { passive: false });
  function pinchState() { const [a, b] = [...ptrs.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, a: Math.atan2(b.y - a.y, b.x - a.x) } }
}
function pan(dx, dy) {
  const k = cam.dist / innerHeight * 1.1, s = Math.sin(cam.theta), c = Math.cos(cam.theta);
  cam.tx -= (c * dx + s * dy) * k;
  cam.tz -= (-s * dx + c * dy) * k;
  const [x0, z0, x1, z1] = OSM.bounds; cam.tx = clamp(cam.tx, x0, x1); cam.tz = clamp(cam.tz, z0, z1);
}
const ray = new THREE.Raycaster(), mv = new THREE.Vector2();
function pick(e) {
  mv.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mv, camera);
  const hit = ray.intersectObjects(nodeObjs.map(o => o.userData.beam).concat(nodeObjs.map(o => o.userData.core)))[0];
  if (hit) { const o = nodeObjs.find(o => o.userData.beam === hit.object || o.userData.core === hit.object); o && openNode(o.userData.n) } else closeSheet();
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function flyTo(tx, tz, dist, theta, phi, ms) { fly = { from: { ...cam }, to: { tx, tz, dist, theta, phi }, t0: performance.now(), ms } }
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/* ---------- кадр ---------- */
const v3 = new THREE.Vector3();
function loop(now) {
  requestAnimationFrame(loop);
  const t = now / 1000;
  if (fly) {
    const k = ease(Math.min(1, (now - fly.t0) / fly.ms));
    for (const key of ['tx', 'tz', 'dist', 'phi']) cam[key] = fly.from[key] + (fly.to[key] - fly.from[key]) * k;
    let dT = ((fly.to.theta - fly.from.theta + Math.PI * 3) % (Math.PI * 2)) - Math.PI; cam.theta = fly.from.theta + dT * k;
    if (k >= 1) fly = null;
  } else if (orbitAround) { cam.theta += 0.0035; if (now > orbitAround.until) orbitAround = null }
  const cx = cam.tx + cam.dist * Math.sin(cam.phi) * Math.sin(cam.theta), cz = cam.tz + cam.dist * Math.sin(cam.phi) * Math.cos(cam.theta), cy = cam.dist * Math.cos(cam.phi);
  camera.position.set(cx, Math.max(30, cy), cz); camera.lookAt(cam.tx, 0, cam.tz);

  nodeObjs.forEach((o, i) => {
    const u = o.userData; u.beam.material.uniforms.t.value = t + i;
    u.core.rotation.y = t * 1.1 + i; u.core.position.y += Math.sin(t * 2 + i) * 0.06;
    const s = 1 + 0.25 * Math.sin(t * 2.2 + i); u.ring.scale.set(s, s, s); u.ring.material.opacity = .45 + .3 * Math.sin(t * 2.2 + i);
  });
  farObjs.forEach((b, i) => b.material.uniforms.t.value = t + i * 2);
  chObjs.forEach((m, i) => { const u = m.userData, a = u.a + t * 0.35; m.position.set(u.hx + Math.cos(a) * 85, 70 + Math.sin(t * 1.6 + i) * 6, u.hz + Math.sin(a) * 85) });
  arcs.forEach(a => a.dots.forEach((d, k) => { const p = (t * 0.12 + a.off + k / a.dots.length) % 1; a.curve.getPoint(p, d.position) }));
  for (let i = waves.length - 1; i >= 0; i--) {
    const w = waves[i], k = (now - w.t0) / 2600;
    if (k >= 1) { scene.remove(w.m); w.m.geometry.dispose(); w.m.material.dispose(); waves.splice(i, 1); continue }
    const s = 1 + k * 26; w.m.scale.set(s, s, s); w.m.material.opacity = .9 * (1 - k);
  }
  renderer.render(scene, camera);
  placeTags();
}
function placeTags() {
  const wdt = innerWidth, hgt = innerHeight; let streets = 0;
  const showStreets = cam.dist < 1500;
  for (const tg of tagEls) {
    if (tg.street) {
      if (!showStreets || streets > 14) { tg.el.style.display = 'none'; continue }
      v3.copy(tg.p);
      const dd = Math.hypot(v3.x - cam.tx, v3.z - cam.tz); if (dd > cam.dist * .9) { tg.el.style.display = 'none'; continue }
    } else v3.copy(tg.posFn());
    v3.project(camera);
    if (v3.z > 1 || v3.x < -1.2 || v3.x > 1.2 || v3.y < -1.2 || v3.y > 1.2) { tg.el.style.display = 'none'; continue }
    tg.el.style.display = '';
    tg.el.style.transform = `translate(${(v3.x * .5 + .5) * wdt}px,${(-v3.y * .5 + .5) * hgt}px) translate(-50%,${tg.street ? '-50%' : '-100%'})`;
    if (tg.street) streets++;
  }
}
})();
