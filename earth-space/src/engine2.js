function makePops() {
  for (const [i, def] of Object.entries(POP)) {
    const P = pages[+i], g = new THREE.Group(), inner = new THREE.Group();
    g.add(inner); book.add(g);
    P.popObj = { g, inner, rect: def.rect, f: 0, hidden: false, api: def.build(inner, P) };
    g.visible = false;
  }
}
function isOpenPage(i) {
  const c = spreadNow();
  if (i === 2 * c && c < N) return sheets[c].t < 0.02 && (c === 0 || sheets[c - 1].t > 0.98);
  if (i === 2 * c - 1 && c > 0) return sheets[c - 1].t > 0.98 && (c === N || sheets[c].t < 0.02);
  return false;
}
function popStep(dt) {
  for (const P of pages) {
    const pop = P.popObj; if (!pop) continue;
    const want = popOn && isOpenPage(P.i) ? 1 : 0;
    pop.f += (want - pop.f) * (1 - Math.exp(-dt * (want ? 4 : 10)));
    if (Math.abs(want - pop.f) < 0.002) pop.f = want;
    const s = sheets[Math.floor(P.i / 2)];
    pop.g.position.set(P.side === 'R' ? 0 : -PW, (P.side === 'R' ? s.hR : s.hL) + 0.0012, 0);
    pop.g.visible = pop.f > 0.01;
    const e = pop.f, back = e < 1 ? 1 + 0.12 * Math.sin(Math.PI * e) : 1;
    pop.inner.scale.set(1, Math.max(0.001, e * back), 1);
    const hide = popOn && pop.f > 0.35;
    if (hide !== pop.hidden) { pop.hidden = hide; P.dirty = true; }
    if (pop.g.visible) pop.api.update(animClock, paused ? 0 : dt);
  }
}
function setPop(v) {
  popOn = v; const b = document.getElementById('popBtn'); b.setAttribute('aria-pressed', String(v));
}
function pickPop(e) {
  setRay(e);
  const vis = popPickables.filter(m => m.userData.pop.P.popObj.f > 0.9);
  return vis.length ? ray.intersectObjects(vis, false)[0] || null : null;
}
function popCanvas(mesh, world) {
  const P = mesh.userData.pop.P, l = P.popObj.inner.worldToLocal(world.clone()); l.world = world;
  return mesh.userData.pop.toCanvas(l);
}

// ============================================================ pointer interaction
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.12);
function setRay(e) { const r = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); }
function pick(e, objs = pickables) { setRay(e); return ray.intersectObjects(objs, false)[0] || null; }
function hitInfo(hit) {
  const { sheet, face } = hit.object.userData, p = face === 'front' ? sheet * 2 : sheet * 2 + 1;
  const u = face === 'front' ? hit.uv.x : 1 - hit.uv.x;
  return { p, P: pages[p], x: u * CW, y: (1 - hit.uv.y) * CH, outer: face === 'front' ? hit.uv.x : hit.uv.x, s: sheets[sheet] };
}
function zoneAt(P, x, y) { for (let k = P.zones.length - 1; k >= 0; k--) { const z = P.zones[k]; if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) return z; } return null; }
function localX(e) { setRay(e); const pt = new THREE.Vector3(); return ray.ray.intersectPlane(dragPlane, pt) ? (pt.x - book.position.x) / PW : null; }
let act = null, hoverSheet = null;
function onDown(e) {
  if (e.button !== 0 || !orbit) return;
  const ph = pickPop(e);
  if (ph) {
    const pc = popCanvas(ph.object, ph.point), PP = ph.object.userData.pop.P, pz = zoneAt(PP, pc.x, pc.y);
    if (pz) {
      const kind = ph.object.userData.pop.plane;
      let plane = null;
      if (kind === 'h') plane = new THREE.Plane().setFromNormalAndCoplanarPoint(UP, ph.point);
      if (kind === 'v') { const n = new THREE.Vector3(); camera.getWorldDirection(n); n.y = 0; n.normalize().negate(); plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, ph.point); }
      orbit.enabled = false; renderer.domElement.setPointerCapture(e.pointerId);
      act = { kind: 'zone', z: pz, P: PP, pop: { mesh: ph.object, plane }, last: pc, sx: e.clientX, sy: e.clientY, moved: false };
      if (pz.drag) { pz.drag(pc.x, pc.y, 'start'); PP.dirty = true; }
      return;
    }
  }
  const hit = pick(e); if (!hit) return;
  const h = hitInfo(hit), z = zoneAt(h.P, h.x, h.y);
  orbit.enabled = false;
  renderer.domElement.setPointerCapture(e.pointerId);
  if (z) {
    act = { kind: 'zone', z, P: h.P, mesh: hit.object, sx: e.clientX, sy: e.clientY, moved: false };
    if (z.drag) { z.drag(h.x, h.y, 'start'); h.P.dirty = true; }
    return;
  }
  const s = h.s, x0 = localX(e);
  act = { kind: 'page', s, h, sx: e.clientX, sy: e.clientY, moved: false, t0: s.t, x0: x0 ?? 0, dir: s.t < 0.5 ? 1 : -1, grabZ: clamp(hit.point.z / (PH / 2), -1, 1), lastT: s.t, lastTime: performance.now(), v: 0 };
}
function onMove(e) {
  if (act && act.kind === 'zone') {
    if (Math.hypot(e.clientX - act.sx, e.clientY - act.sy) > 4) act.moved = true;
    if (act.pop) {
      setRay(e); let pt = null;
      if (act.pop.plane) { pt = new THREE.Vector3(); if (!ray.ray.intersectPlane(act.pop.plane, pt)) pt = null; }
      else { const hh = ray.intersectObject(act.pop.mesh, false)[0]; pt = hh ? hh.point : null; }
      if (pt) { act.last = popCanvas(act.pop.mesh, pt); if (act.z.drag) { act.z.drag(act.last.x, act.last.y, 'move'); act.P.dirty = true; } }
      return;
    }
    if (act.z.drag) { const hit = pick(e, [act.mesh]); if (hit) { const h = hitInfo(hit); act.z.drag(h.x, h.y, 'move'); act.P.dirty = true; } }
    return;
  }
  if (act && act.kind === 'page') {
    if (!act.moved && Math.hypot(e.clientX - act.sx, e.clientY - act.sy) > 6) { act.moved = true; act.s.drag = true; act.s.dragDir = act.dir; act.s.twist = act.grabZ * 0.5; act.s.peelTarget = 0; }
    if (act.moved) {
      const lx = localX(e); if (lx == null) return;
      const ang = Math.acos(clamp(lx, -1, 1)), ang0 = Math.acos(clamp(act.x0, -1, 1)), s = act.s;
      s.t = act.dir > 0 ? clamp(act.t0 + (ang - ang0) / Math.max(0.2, Math.PI - ang0) * (1 - act.t0), 0, 1)
                        : clamp(act.t0 - (ang0 - ang) / Math.max(0.2, ang0) * act.t0, 0, 1);
      const now = performance.now(), dts = Math.max(0.001, (now - act.lastTime) / 1000);
      act.v = lerp(act.v, (s.t - act.lastT) / dts, 0.35); act.lastT = s.t; act.lastTime = now;
    }
    return;
  }
  if (e.buttons) return;
  const ph = pickPop(e);
  if (ph) { const pc = popCanvas(ph.object, ph.point), pz = zoneAt(ph.object.userData.pop.P, pc.x, pc.y); if (pz) { renderer.domElement.style.cursor = pz.cursor || 'pointer'; return; } }
  const hit = pick(e);
  let cursor = '', peelS = null, peelV = 0;
  if (hit) {
    const h = hitInfo(hit), z = zoneAt(h.P, h.x, h.y);
    if (z) cursor = z.cursor || 'pointer';
    else {
      cursor = 'grab';
      const top = h.s.i === spreadNow() || h.s.i === spreadNow() - 1;
      if (top && h.outer > 0.8 && h.s.t < 0.01) { peelS = h.s; peelV = 0.55; }
      if (top && h.outer > 0.8 && h.s.t > 0.99) { peelS = h.s; peelV = -0.55; }
    }
  }
  renderer.domElement.style.cursor = cursor;
  if (hoverSheet && hoverSheet !== peelS) hoverSheet.peelTarget = 0;
  hoverSheet = peelS; if (peelS) peelS.peelTarget = peelV;
}
function onUp(e) {
  if (!act) return;
  if (act.kind === 'zone') {
    if (act.pop) { if (act.z.drag) { act.z.drag(act.last.x, act.last.y, 'end'); act.P.dirty = true; } }
    else { const hit = pick(e, [act.mesh]);
      if (act.z.drag) { const h = hit ? hitInfo(hit) : null; act.z.drag(h ? h.x : -1, h ? h.y : -1, 'end'); act.P.dirty = true; } }
    if (act.z.click && !act.moved) { act.z.click(); act.P.dirty = true; }
  } else {
    const s = act.s;
    if (act.moved) {
      s.drag = false; s.vel = clamp(act.v, -6, 6); const pred = s.t + s.vel * 0.18, was = s.side;
      s.side = pred > 0.5 ? 1 : 0; if (s.side !== was) focus = s.side ? 'L' : 'R'; updateHud();
    }
    else if (act.h.s.side === 0) { if (single && focusSide() === 'L') { focus = 'R'; updateHud(); } else flipNext(); }
    else { if (single && focusSide() === 'R') { focus = 'L'; updateHud(); } else flipPrev(); }
  }
  act = null; orbit.enabled = true;
}

// ============================================================ HUD
const topicOf = (p) => { const d = PAGES[p]; return d && d.title ? d.title : ''; };
function updateHud() {
  const c = spreadNow();
  const no = document.getElementById('pageNo'), tp = document.getElementById('pageTopic');
  if (c === 0) { no.textContent = 'ปกหน้า'; tp.textContent = 'แตะเพื่อดูสารบัญ'; }
  else if (c === N) { no.textContent = 'ปกหลัง'; tp.textContent = 'จบเล่ม'; }
  else if (single) { const p = focusSide() === 'L' ? 2 * c - 1 : 2 * c; no.textContent = `หน้า ${p} / ${2 * N - 2}`; tp.textContent = topicOf(p); }
  else { const l = 2 * c - 1, r = 2 * c; no.textContent = `หน้า ${l}–${r} / ${2 * N - 2}`; tp.textContent = topicOf(l % 2 ? l : r) || topicOf(r); }
  narSync();
}

// ============================================================ narration (one MP3 per page in audio/)
const narr = new Audio(); narr.preload = 'auto';
let narOn = false, narQueue = [], narKey = '', narTimer = 0, narPage = null;
function narPages() {
  const c = spreadNow();
  if (c === 0) return [0];
  if (c === N) return [2 * N - 1];
  if (single) return [focusSide() === 'L' ? 2 * c - 1 : 2 * c];
  return [2 * c - 1, 2 * c];
}
function narUi() {
  const b = document.getElementById('narPlay');
  b.hidden = !narOn;
  const playing = narOn && !narr.paused;
  b.setAttribute('aria-label', playing ? 'หยุดเสียงบรรยายชั่วคราว' : 'เล่นเสียงบรรยายหน้านี้');
  b.innerHTML = playing
    ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg>';
}
function narNext() {
  narPage = narQueue.shift() ?? null;
  if (narPage == null) { narUi(); return; }
  narr.src = `audio/p${String(narPage).padStart(2, '0')}.mp3`;
  narr.play().catch(() => {}).finally(narUi);
}
function narStart(delay) { narr.pause(); clearTimeout(narTimer); narQueue = narPages(); narTimer = setTimeout(narNext, delay); narUi(); }
function narSync() {
  if (!narOn) return;
  const key = narPages().join(',');
  if (key === narKey) return;
  narKey = key; narStart(700);
}
function setNar(v) {
  narOn = v;
  const b = document.getElementById('narBtn'); b.setAttribute('aria-pressed', String(v));
  b.querySelector('.lbl').textContent = v ? 'เสียงเปิด' : 'เสียงปิด';
  if (v) { narKey = narPages().join(','); narStart(0); }
  else { narr.pause(); clearTimeout(narTimer); narQueue = []; narUi(); }
}
narr.addEventListener('ended', narNext);
narr.addEventListener('pause', narUi);
narr.addEventListener('play', narUi);
function buildTocMenu() {
  const el = document.getElementById('toc'); el.innerHTML = '';
  const add = (name, p) => { const b = document.createElement('button'); b.innerHTML = `<span></span><span>${p}</span>`; b.firstChild.textContent = name; b.onclick = () => { goToPage(p); toggleToc(false); }; el.appendChild(b); };
  add('ปกหน้า', 0);
  for (const [, ch, items] of TOC) { const h = document.createElement('h2'); h.textContent = ch; el.appendChild(h); items.forEach(([n, p]) => add(n, p)); }
}
function toggleToc(show) {
  const el = document.getElementById('toc'), b = document.getElementById('tocBtn');
  const v = show ?? el.hidden; el.hidden = !v; b.setAttribute('aria-expanded', String(v));
}

// ============================================================ main loop
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reduced, last = performance.now(), lastDraw = -1;
function setPaused(v) {
  paused = v; const b = document.getElementById('animBtn');
  b.setAttribute('aria-pressed', String(v));
  b.innerHTML = v
    ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg><span class="lbl">เล่นภาพ</span>'
    : '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg><span class="lbl">หยุดภาพ</span>';
}
function visiblePages() {
  const c = spreadNow(), set = new Set();
  if (c < N) set.add(2 * c); if (c > 0) set.add(2 * c - 1);
  for (const s of sheets) if (s.t > 0.001 && s.t < 0.999) { set.add(2 * s.i); set.add(2 * s.i + 1); }
  return set;
}
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!paused) animClock += dt;
  for (const s of sheets) step(s, dt);
  const c = spreadNow(), gx = c === 0 ? -PW / 2 : c === N ? PW / 2 : 0;
  book.position.x += (gx - book.position.x) * (1 - Math.exp(-dt * 5));
  for (const b of blocks) {
    const n = sheets.filter(s => (b.userData.sgn > 0 ? s.side === 0 : s.side === 1)).length;
    const hgt = Math.max(0.0005, (n - 1) * GAP + BASE - 0.0016);
    b.visible = n > 0; b.scale.y += (hgt - b.scale.y) * (1 - Math.exp(-dt * 8)); b.position.y = b.scale.y / 2;
  }
  if (camTween) {
    camTween.t = Math.min(1, camTween.t + dt / 0.9); const f = camTween.t < 0.5 ? 2 * camTween.t ** 2 : 1 - (-2 * camTween.t + 2) ** 2 / 2;
    camera.position.lerpVectors(camTween.p0, camTween.p1, f); orbit.target.lerpVectors(camTween.t0, camTween.t1, f);
    if (camTween.t >= 1) camTween = null;
  }
  followStep(dt);
  popStep(dt);
  orbit.update();
  const tick = !paused && animClock - lastDraw > 1 / 30;
  for (const p of visiblePages()) { const P = pages[p]; if (P.dirty || (tick && P.anim)) redraw(P); }
  if (tick) lastDraw = animClock;
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// ============================================================ boot
async function boot() {
  const want = ['400 26px Sarabun', '700 26px Sarabun', '600 26px Sarabun', '600 40px Mitr', '500 26px Mitr', '600 20px "IBM Plex Sans Thai"', '500 20px "IBM Plex Sans Thai"'];
  try { await Promise.race([Promise.all(want.map(f => document.fonts.load(f, 'กขคabc123'))), new Promise(r => setTimeout(r, 4000))]); } catch (err) { /* fall back to system Thai fonts */ }
  for (let i = 0; i < PAGES.length; i++) pages.push(buildPage(i));
  for (const P of pages) redraw(P);
  makeSheets();
  makePops();
  renderer.domElement.addEventListener('pointerdown', onDown);
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true; orbit.dampingFactor = 0.08;
  orbit.minDistance = 0.9; orbit.maxDistance = 7; orbit.maxPolarAngle = 1.38;
  orbit.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  setSingle(autoSingle());
  setView('3d', true);
  updateHud(); buildTocMenu(); setPaused(reduced);
  document.getElementById('loader').classList.add('done');
  requestAnimationFrame(frame);
  window.__book = { pops: () => pages.filter(p => p.popObj).map(p => [p.i, p.popObj.f]), sheets, pages, goToPage, flipNext, flipPrev, setView, camera, renderer, scene, orbit, book };
}
document.getElementById('prevBtn').onclick = prev;
document.getElementById('nextBtn').onclick = next;
let manualMode = false;
document.getElementById('modeBtn').onclick = () => { manualMode = true; setSingle(!single); };
document.getElementById('tocBtn').onclick = () => toggleToc();
document.getElementById('view3d').onclick = () => setView('3d');
document.getElementById('viewRead').onclick = () => setView('read');
document.getElementById('popBtn').onclick = () => setPop(!popOn);
document.getElementById('narBtn').onclick = () => setNar(!narOn);
document.getElementById('narPlay').onclick = () => {
  if (!narr.paused) narr.pause();
  else if (narPage != null && narr.currentTime > 0 && !narr.ended) narr.play().catch(() => {});
  else narStart(0);
};
document.getElementById('animBtn').onclick = () => setPaused(!paused);
document.getElementById('fsBtn').onclick = () => { const d = document; (d.fullscreenElement ? d.exitFullscreen() : d.documentElement.requestFullscreen?.())?.catch?.(() => {}); };
const help = document.getElementById('help');
document.getElementById('helpBtn').onclick = () => { help.hidden = !help.hidden; };
document.getElementById('helpClose').onclick = () => { help.hidden = true; };
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'PageDown') next();
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
  else if (e.key === 'Home') goToSpread(0);
  else if (e.key === 'End') goToSpread(N);
  else if (e.key === 'Escape') toggleToc(false);
});
window.addEventListener('resize', () => {
  if (!innerWidth || !innerHeight) return;
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  if (!orbit) return;
  if (!manualMode && autoSingle() !== single) setSingle(autoSingle()); else setView(viewName);
});
boot();
</script>
