
// ============================================================ build pages
const pages = [];
let animClock = 0;
function buildPage(i) {
  const def = PAGES[i], side = i % 2 === 0 ? 'R' : 'L', cv = makeCanvas(), ctx = cv.getContext('2d');
  const P = { i, def, side, cv, ctx, th: def.th || TH.intro, X0: side === 'R' ? 92 : 66, X1: side === 'R' ? 834 : 808, zones: [], st: def.init ? def.init() : {}, dirty: true, clock: 0 };
  P.cx = (P.X0 + P.X1) / 2;
  if (def.kind === 'cover') { P.draw = (t) => drawCover(ctx, t); P.anim = true; }
  else if (def.kind === 'back') { P.draw = () => drawBack(ctx); }
  else {
    const base = makeCanvas(), b = base.getContext('2d');
    paperBase(b, P); header(b, P); footer(b, P);
    if (def.blocks) {
      let s = 1, y;
      for (; s > 0.72; s -= 0.04) { b.save(); y = renderBlocks(b, def.blocks, P.X0, 226, P.X1 - P.X0, P.th, s); b.restore(); if (y <= CH - 92) break; b.clearRect(0, 0, CW, CH); paperBase(b, P); header(b, P); footer(b, P); }
      P.draw = () => ctx.drawImage(base, 0, 0);
    } else if (def.kind === 'toc') P.draw = () => { ctx.drawImage(base, 0, 0); drawTOC(ctx, P); };
    else if (def.kind === 'quiz') P.draw = () => { ctx.drawImage(base, 0, 0); drawQuiz(ctx, P); };
    else { P.anim = true; P.base = base; P.draw = (t) => { ctx.drawImage(base, 0, 0); def.draw(ctx, t, P); }; }
  }
  P.tex = new THREE.CanvasTexture(cv);
  P.tex.colorSpace = THREE.SRGBColorSpace;
  if (side === 'L') { P.tex.wrapS = THREE.RepeatWrapping; P.tex.repeat.x = -1; P.tex.offset.x = 1; }
  return P;
}
function redraw(P) {
  P.zones = []; P.clock = animClock; P.draw(animClock);
  const pop = P.popObj;
  if (pop && pop.hidden) {
    const [x, y, w, h] = pop.rect, src = P.i === 0 ? COVER_BG : P.base;
    P.ctx.drawImage(src, x, y, w, h, x, y, w, h);
    if (P.i !== 0) label(P.ctx, '↻ ภาพ 3 มิติ · ลากบนโมเดลเพื่อโต้ตอบ · ลากพื้นที่ว่างเพื่อหมุนดูรอบด้าน', x + w / 2, y + 14, { size: 14, wt: 600, color: P.th.a });
  }
  P.tex.needsUpdate = true; P.dirty = false;
}

// ============================================================ three.js scene
const stage = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000, 0);
stage.appendChild(renderer.domElement);
const maxAniso = renderer.capabilities.getMaxAnisotropy();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.05, 60);
scene.add(new THREE.HemisphereLight(0xfff6e8, 0x29415c, 1.25));
const sun = new THREE.DirectionalLight(0xffffff, 1.7);
sun.position.set(-1.5, 3.4, 1.6); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 9 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.32 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.002; ground.receiveShadow = true; scene.add(ground);
const book = new THREE.Group(); scene.add(book);
{
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 20, 128, 128, 128); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.7, PH + 0.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.0005; book.add(m);
}
function edgeTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#efe7d6'; x.fillRect(0, 0, 64, 128);
  for (let y = 0; y < 128; y += 4) { x.fillStyle = `rgba(120,100,70,${0.12 + rnd() * 0.1})`; x.fillRect(0, y, 64, 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const edgeMat = new THREE.MeshStandardMaterial({ map: edgeTexture(), roughness: 0.9 });
const plainMat = new THREE.MeshStandardMaterial({ color: 0xefe7d6, roughness: 0.9 });
const blocks = [-1, 1].map(sgn => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(PW * 0.985, 1, PH * 0.985), [edgeMat, edgeMat, plainMat, plainMat, edgeMat, edgeMat]);
  m.position.x = sgn * PW * 0.5; m.scale.y = 0.001; m.receiveShadow = true; m.userData.sgn = sgn; book.add(m); return m;
});
const spine = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, PH + 0.02), new THREE.MeshStandardMaterial({ color: 0x0b2a4a, roughness: 0.6 }));
spine.position.y = 0.004; book.add(spine);

const sheets = [];
const pickables = [];
function makeSheets() {
  for (let i = 0; i < N; i++) {
    const geo = new THREE.PlaneGeometry(PW, PH, SX, SY);
    const cover = i === 0 || i === N - 1;
    const mf = new THREE.MeshStandardMaterial({ map: pages[2 * i].tex, roughness: cover ? 0.55 : 0.85, metalness: 0, side: THREE.FrontSide });
    const mb = new THREE.MeshStandardMaterial({ map: pages[2 * i + 1].tex, roughness: cover ? 0.55 : 0.85, metalness: 0, side: THREE.BackSide });
    mf.shadowSide = THREE.DoubleSide;
    pages[2 * i].tex.anisotropy = maxAniso; pages[2 * i + 1].tex.anisotropy = maxAniso;
    const front = new THREE.Mesh(geo, mf), back = new THREE.Mesh(geo, mb);
    front.receiveShadow = back.receiveShadow = true;
    front.userData = { sheet: i, face: 'front' }; back.userData = { sheet: i, face: 'back' };
    book.add(front, back); pickables.push(front, back);
    const s = { i, geo, front, back, cover, t: 0, vel: 0, side: 0, curl: 0, twist: 0, peel: 0, peelTarget: 0, drag: false, dragDir: 1,
      hR: (N - 1 - i) * GAP + BASE, hL: i * GAP + BASE, dirty: true };
    sheets.push(s);
  }
}
function deform(s) {
  const pos = s.geo.attributes.position.array, uv = s.geo.attributes.uv.array;
  const theta = Math.PI * s.t, stiff = s.cover ? 0.12 : 1;
  const curl = s.curl * stiff, peel = s.peel * (s.cover ? 0.3 : 1), tw = s.twist;
  const h = s.hR + (s.hL - s.hR) * s.t, ds = PW / SX;
  for (let j = 0; j <= SY; j++) {
    const v = uv[(j * (SX + 1)) * 2 + 1], zn = (0.5 - v) * 2, z = (0.5 - v) * PH;
    let x = 0, y = 0;
    for (let i = 0; i <= SX; i++) {
      if (i > 0) {
        const sn = (i - 0.5) / SX, e = Math.max(0, (sn - 0.55) / 0.45);
        let a = theta + curl * sn * sn * (1 + tw * zn) + peel * e * e * (0.55 + 0.45 * zn);
        a = a < 0 ? 0 : a > Math.PI ? Math.PI : a;
        x += Math.cos(a) * ds; y += Math.sin(a) * ds;
      }
      const k = (j * (SX + 1) + i) * 3;
      pos[k] = x; pos[k + 1] = y + h; pos[k + 2] = z;
    }
  }
  s.geo.attributes.position.needsUpdate = true;
  s.geo.computeVertexNormals(); s.geo.computeBoundingSphere();
}
function step(s, dt) {
  let changed = s.dirty;
  const pk = s.peelTarget - s.peel;
  if (Math.abs(pk) > 1e-4) { s.peel += pk * (1 - Math.exp(-dt * 10)); changed = true; } else if (s.peel !== s.peelTarget) { s.peel = s.peelTarget; changed = true; }
  if (s.drag) { s.curl = s.dragDir * 0.85 * Math.sin(Math.PI * s.t); changed = true; }
  else {
    const goal = s.side, k = 58, c = 15.2;
    if (Math.abs(goal - s.t) > 1e-4 || Math.abs(s.vel) > 1e-3) {
      s.vel += (k * (goal - s.t) - c * s.vel) * dt; s.t += s.vel * dt;
      if (s.t < 0) { s.t = 0; s.vel = 0; } if (s.t > 1) { s.t = 1; s.vel = 0; }
      changed = true;
    } else if (s.t !== goal) { s.t = goal; s.vel = 0; changed = true; }
    const tc = -s.vel * 0.22;
    if (Math.abs(tc - s.curl) > 1e-4) { s.curl += (tc - s.curl) * (1 - Math.exp(-dt * 12)); changed = true; } else if (s.curl !== tc) { s.curl = tc; changed = true; }
    if (Math.abs(s.twist) > 1e-4) { s.twist *= Math.exp(-dt * 3); changed = true; }
  }
  if (changed) { deform(s); s.dirty = false; }
  s.front.castShadow = s.t > 0.003 && s.t < 0.997;
}
const spreadNow = () => sheets.reduce((n, s) => n + (s.side === 1 ? 1 : 0), 0);
function flipNext() { const c = spreadNow(); if (c < N) sheets[c].side = 1; focus = 'L'; updateHud(); }
function flipPrev() { const c = spreadNow(); if (c > 0) sheets[c - 1].side = 0; focus = 'R'; updateHud(); }
// Single-page mode (phones): the camera frames one page; "next" moves left page → right page → turn the sheet.
let single = false, focus = 'R', followX = 0;
const autoSingle = () => innerWidth < innerHeight * 0.9 || innerWidth < 700;
function focusSide() { const c = spreadNow(); return c === 0 ? 'R' : c === N ? 'L' : focus; }
function next() { if (single && focusSide() === 'L' && spreadNow() < N) { focus = 'R'; updateHud(); } else flipNext(); }
function prev() { if (single && focusSide() === 'R' && spreadNow() > 0) { focus = 'L'; updateHud(); } else flipPrev(); }
function setSingle(v) {
  single = v; const b = document.getElementById('modeBtn');
  b.setAttribute('aria-pressed', String(v));
  b.querySelector('.lbl').textContent = v ? 'หน้าเดียว' : 'หน้าคู่';
  if (orbit) setView(viewName); updateHud();
}
let goTimers = [];
function goToSpread(target) {
  goTimers.forEach(clearTimeout); goTimers = [];
  target = clamp(target, 0, N); const c = spreadNow();
  if (target > c) for (let i = c; i < target; i++) goTimers.push(setTimeout(() => { sheets[i].side = 1; updateHud(); }, (i - c) * 85));
  else for (let i = c - 1; i >= target; i--) goTimers.push(setTimeout(() => { sheets[i].side = 0; updateHud(); }, (c - 1 - i) * 85));
}
function goToPage(p) { focus = p % 2 ? 'L' : 'R'; goToSpread(Math.floor((p + 1) / 2)); updateHud(); }

// ============================================================ camera
const controls = { target: new THREE.Vector3() };
let orbit = null;
function preset(name) {
  const a = innerWidth / innerHeight, fit = (single ? 1.08 : 1.22) / (2 * Math.tan(17 * D2R));
  const d = Math.max(PH * 1.15, (single ? PW * 1.04 : 2 * PW) / a) * fit, x = followX;
  return name === 'read'
    ? { pos: new THREE.Vector3(x, d, 0.12 * d + 0.03), target: new THREE.Vector3(x, 0, 0.03) }
    : { pos: new THREE.Vector3(x + (single ? 0.06 : 0.22) * d, 0.95 * d, 0.9 * d), target: new THREE.Vector3(x, 0.05, 0.07) };
}
function followStep(dt) {
  const want = single ? book.position.x + (focusSide() === 'R' ? PW / 2 : -PW / 2) : 0;
  const nx = followX + (want - followX) * (1 - Math.exp(-dt * 6)), dx = nx - followX;
  followX = nx;
  if (Math.abs(dx) < 1e-6) return;
  camera.position.x += dx; orbit.target.x += dx;
  if (camTween) for (const v of [camTween.p0, camTween.p1, camTween.t0, camTween.t1]) v.x += dx;
}
let camTween = null, viewName = '3d';
function setView(name, instant = false) {
  viewName = name; const p = preset(name);
  document.getElementById('view3d').setAttribute('aria-pressed', String(name === '3d'));
  document.getElementById('viewRead').setAttribute('aria-pressed', String(name === 'read'));
  if (instant) { camera.position.copy(p.pos); orbit.target.copy(p.target); orbit.update(); return; }
  camTween = { t: 0, p0: camera.position.clone(), p1: p.pos, t0: orbit.target.clone(), t1: p.target };
}

// ============================================================ pop-up 3D scenes
// Each scene lives in page-local units (1 unit = 900 canvas px; x from the spine, z = py/900 - 0.65, y up).
const UP = new THREE.Vector3(0, 1, 0);
const px2x = (px) => px / 900, py2z = (py) => py / 900 - 0.65;
const popPickables = [];
let popOn = true;
const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...o });
function shadowAll(obj) { obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return obj; }
function textSprite(txt, o = {}) {
  const { color = '#25303a', bg = 'rgba(255,255,255,0.93)', h = 0.032, border = null } = o;
  const c = document.createElement('canvas'), x = c.getContext('2d'), fs = 44;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthWrite: false, depthTest: false }));
  spr.userData.set = (t, col = color, brd = border) => {
    const lines = String(t).split('\n');
    x.font = `600 ${fs}px ${F.label}`;
    const w = Math.ceil(Math.max(...lines.map(l => x.measureText(l).width))) + 36, hh = lines.length * fs * 1.3 + 22;
    c.width = w; c.height = hh;
    x.font = `600 ${fs}px ${F.label}`; x.fillStyle = bg; rr(x, 2, 2, w - 4, hh - 4, 18); x.fill();
    if (brd) { x.strokeStyle = brd; x.lineWidth = 5; x.stroke(); }
    x.fillStyle = col; x.textBaseline = 'middle';
    lines.forEach((l, i) => x.fillText(l, 18, 11 + fs * 1.3 * (i + 0.5)));
    spr.material.map.dispose(); spr.material.map = new THREE.CanvasTexture(c); spr.material.map.colorSpace = THREE.SRGBColorSpace;
    spr.scale.set(h * lines.length * (w / hh), h * lines.length, 1);
  };
  spr.userData.set(txt); spr.renderOrder = 10; return spr;
}
let GLOBE_TEX = null;
function globeTex() {
  if (GLOBE_TEX) return GLOBE_TEX;
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#e3f2fb'); g.addColorStop(0.1, '#6db7e2'); g.addColorStop(0.5, '#1f6fae'); g.addColorStop(0.9, '#6db7e2'); g.addColorStop(1, '#e3f2fb');
  x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(255,255,255,${rnd() * 0.06})`; x.beginPath(); x.ellipse(rnd() * 1024, rnd() * 512, 10 + rnd() * 40, 4 + rnd() * 10, 0, 0, Math.PI * 2); x.fill(); }
  for (const lat of [-60, -30, 0, 30, 60]) {
    const y = 256 - lat / 90 * 256; x.strokeStyle = `rgba(255,255,255,${lat ? 0.4 : 0.85})`; x.lineWidth = lat ? 2 : 4;
    x.setLineDash(lat ? [14, 10] : []); x.beginPath(); x.moveTo(0, y); x.lineTo(1024, y); x.stroke();
  }
  x.setLineDash([]); x.strokeStyle = 'rgba(255,255,255,0.18)'; x.lineWidth = 1.5;
  for (let lon = 0; lon < 1024; lon += 1024 / 12) { x.beginPath(); x.moveTo(lon, 0); x.lineTo(lon, 512); x.stroke(); }
  GLOBE_TEX = new THREE.CanvasTexture(c); GLOBE_TEX.colorSpace = THREE.SRGBColorSpace; return GLOBE_TEX;
}
function deskGlobe(parent, x, z, y, R, tilt = 0) {
  const brass = M(0x9c7a3c, { metalness: 0.45, roughness: 0.35 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.5, R * 0.62, 0.014, 40), brass); base.position.set(x, 0.007, z);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.006, y - R * 0.95, 12), brass); pole.position.set(x, (y - R * 0.95) / 2, z);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(R * 1.1, 0.0045, 8, 64, Math.PI), brass);
  arc.position.set(x, y, z); arc.rotation.set(0, 0, Math.PI / 2 - tilt);
  const tiltG = new THREE.Group(); tiltG.position.set(x, y, z); tiltG.rotation.z = -tilt;
  const spin = new THREE.Group(); tiltG.add(spin);
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 40), M(0xffffff, { map: globeTex(), roughness: 0.4 }));
  spin.add(sphere);
  parent.add(shadowAll(base), shadowAll(pole), shadowAll(arc), tiltG); shadowAll(sphere);
  return { sphere, spin, tiltG };
}
function tube(pts, r, color, closed = true, o = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), closed, 'centripetal');
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(60, pts.length * 2), r, 8, closed), M(color, { transparent: o.opacity != null, opacity: o.opacity ?? 1 }));
  mesh.castShadow = true; return { mesh, curve };
}
function markers(parent, curve, n, color, size, shape = 'cone') {
  const geo = shape === 'cone' ? new THREE.ConeGeometry(size * 0.55, size * 1.5, 12) : new THREE.SphereGeometry(size * 0.6, 12, 10);
  const ms = [];
  for (let k = 0; k < n; k++) { const m = new THREE.Mesh(geo, M(color)); m.castShadow = true; parent.add(m); ms.push(m); }
  return {
    ms,
    update(ph, colFn) {
      ms.forEach((m, k) => {
        const u = mod1(k / n + ph), p = curve.getPointAt(u);
        m.position.copy(p);
        if (shape === 'cone') m.quaternion.setFromUnitVectors(UP, curve.getTangentAt(u));
        if (colFn) m.material.color.setStyle(colFn(p, u));
      });
    },
  };
}
function arrow3(color, len = 0.1, r = 0.008) {
  const g = new THREE.Group(), mat = M(color);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len * 0.7, 12), mat); shaft.rotation.x = Math.PI / 2; shaft.position.z = len * 0.35;
  const head = new THREE.Mesh(new THREE.ConeGeometry(r * 2.4, len * 0.3, 16), mat); head.rotation.x = Math.PI / 2; head.position.z = len * 0.85;
  g.add(shaft, head); return shadowAll(g);
}
function pickable(mesh, P, plane, toCanvas) { mesh.userData.pop = { P, plane, toCanvas }; popPickables.push(mesh); return mesh; }
const flatCanvas = (l) => ({ x: l.x * 900, y: (l.z + 0.65) * 900 });

