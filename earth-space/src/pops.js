// ============================================================ pop-up helpers (page-local units, see engine1)
let POP_DOT = null;
function POP_dotTex() {
  if (POP_DOT) return POP_DOT;
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  POP_DOT = new THREE.CanvasTexture(c); return POP_DOT;
}
// n points; colors: hex or array of hex per point
function POP_pts(n, color, size, o = {}) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size, map: POP_dotTex(), transparent: true, depthWrite: false, opacity: o.opacity ?? 1, sizeAttenuation: true, color: Array.isArray(color) ? 0xffffff : color, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending });
  if (Array.isArray(color)) {
    const col = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) { c.set(color[i]); col.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); mat.vertexColors = true;
  }
  const p = new THREE.Points(geo, mat); p.frustumCulled = false; p.userData.pos = pos; return p;
}
// dark display mat under space scenes, leaving the top 30 px for the engine's "3D" caption
function POP_mat(g, [x, y, w, h], color = 0x0e1b38) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(px2x(w - 8), 0.004, px2x(h - 34)), M(color, { roughness: 0.8 }));
  m.position.set(px2x(x + w / 2), 0.002, py2z(y + 30 + (h - 34) / 2)); m.receiveShadow = true; g.add(m); return m;
}
// invisible horizontal plane over a canvas rect at height y: drags on it reuse the page zone
function POP_hit(g, P, [x, y, w, h], hy, kind = 'h', toCanvas = flatCanvas) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(px2x(w), px2x(h)), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2; m.position.set(px2x(x + w / 2), hy, py2z(y + h / 2)); m.visible = false; g.add(m);
  return pickable(m, P, kind, toCanvas);
}
const POP_UNIT = new THREE.BoxGeometry(1, 1, 1);
function POP_block(parent, color, o = {}) { const m = new THREE.Mesh(POP_UNIT, M(color, o)); m.castShadow = m.receiveShadow = !o.transparent; parent.add(m); return m; }
// place a unit box by its extents (units)
function POP_box(m, x0, x1, y0, y1, z0, z1) {
  const w = Math.max(1e-4, x1 - x0), h = Math.max(1e-4, y1 - y0);
  m.scale.set(w, h, z1 - z0); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.visible = x1 - x0 > 1e-3 && y1 - y0 > 1e-4;
}
function POP_circle(r, color, opacity = 0.4, n = 128) {
  const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
}
function POP_glow(color, s) {
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: POP_dotTex(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  spr.scale.set(s, s, 1); return spr;
}
const POP_lbl = (txt, col, h = 0.022, o = {}) => textSprite(txt, { color: col, h, ...o });
// a label sprite that only re-renders its canvas when the text changes
function POP_say(spr, txt, col, brd) { const k = txt + '|' + col; if (spr.userData.k !== k) { spr.userData.k = k; spr.userData.set(txt, col, brd); } }

const POP = {
  0: { rect: [150, 420, 500, 300], build(g, P) {
    const G = deskGlobe(g, px2x(400), py2z(560), 0.25, 0.165, 23.5 * D2R);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.03, 32, 20), M(0xd9d4cc, { roughness: 0.9 }));
    const orbitG = new THREE.Group(); orbitG.position.copy(G.tiltG.position); orbitG.rotation.z = 5 * D2R; g.add(orbitG);
    const path = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.0015, 6, 120), M(0xffffff, { transparent: true, opacity: 0.35 }));
    path.rotation.x = Math.PI / 2; orbitG.add(path, shadowAll(moon));
    return { update(t, dt) { G.spin.rotation.y += dt * 0.35; const a = t * 0.5; moon.position.set(Math.cos(a) * 0.27, 0, -Math.sin(a) * 0.27); } };
  } },

  // ---------------------------------------------------------- 10 · Milky Way, tilt follows st.tilt
  10: { rect: [92, 232, 742, 468], build(g, P) {
    const rect = [92, 232, 742, 468], R = 0.2, cy = 0.25, st = P.st;
    POP_mat(g, rect, 0x0b1430);
    const base = new THREE.Group(); base.position.set(px2x(P.cx), cy, py2z(466)); g.add(base);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.012, cy, 12), M(0x8f9bb8, { transparent: true, opacity: 0.5 }));
    stem.position.set(px2x(P.cx), cy / 2, py2z(466)); g.add(stem);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.2, 40, 24), M(0x9d8cff, { transparent: true, opacity: 0.05, depthWrite: false, roughness: 1 }));
    base.add(halo);
    const gcPts = POP_pts(A_MW.gc.length, 0xffe296, 0.024);
    A_MW.gc.forEach(([x, y, z], i) => gcPts.userData.pos.set([x * R, z * R, y * R], i * 3)); base.add(gcPts);
    const tilt = new THREE.Group(); base.add(tilt);
    const spin = new THREE.Group(); tilt.add(spin);
    const COLS = ['#fff0d7', '#b9cdff', '#ff78af', '#ffd6a0'];
    const disc = POP_pts(A_MW.pts.length, A_MW.pts.map(p => COLS[p[3]]), 0.02);
    A_MW.pts.forEach(([x, y, z], i) => disc.userData.pos.set([x * R, z * R, y * R], i * 3)); spin.add(disc);
    const sheen = new THREE.Mesh(new THREE.CircleGeometry(R * 1.02, 64), new THREE.MeshBasicMaterial({ color: 0x8090ff, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide }));
    sheen.rotation.x = -Math.PI / 2; tilt.add(sheen);
    const bulge = POP_glow(0xffd8a0, R * 0.55); tilt.add(bulge);
    const core = new THREE.Mesh(new THREE.SphereGeometry(R * 0.09, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffe2b0 }));
    core.scale.y = 0.6; tilt.add(core);
    const [s0, , s2] = [A_MW.sun[0], 0, A_MW.sun[1]], sunR = Math.hypot(s0, s2) * R;
    const sunOrbit = POP_circle(sunR, 0xffd43b, 0.5); tilt.add(sunOrbit);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.008, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd43b }));
    sun.position.set(s0 * R, 0, s2 * R); spin.add(sun);
    const sunGlow = POP_glow(0xffd43b, 0.04); sun.add(sunGlow);
    const sunLbl = POP_lbl('ดวงอาทิตย์', '#0b1730', 0.02, { bg: '#ffd43b' }); sunLbl.center.set(0.5, -0.4); sun.add(sunLbl);
    const sgr = POP_lbl('Sgr A*', '#ffffff', 0.018, { bg: 'rgba(11,23,48,0.75)' }); sgr.position.set(0, 0.03, 0); tilt.add(sgr);
    const haloLbl = POP_lbl('ฮาโล: สสารมืด + กระจุกดาวทรงกลม', '#d0bfff', 0.02, { bg: 'rgba(11,23,48,0.8)' }); haloLbl.position.set(-R * 0.9, R * 1.1, 0); base.add(haloLbl);
    const tag = POP_lbl('', '#ffffff', 0.024, { bg: 'rgba(11,23,48,0.85)' }); tag.position.set(R * 1.15, R * 0.95, 0); base.add(tag);
    const hitDisc = new THREE.Mesh(new THREE.CircleGeometry(R * 1.2, 48), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    hitDisc.rotation.x = -Math.PI / 2; hitDisc.visible = false; tilt.add(hitDisc);
    pickable(hitDisc, P, 'h', flatCanvas);
    POP_hit(g, P, rect, 0.01);
    return { update(t) {
      const inc = st.tilt * D2R;
      tilt.rotation.x = -inc;
      spin.rotation.y = -t * 0.06;
      bulge.scale.set(R * 0.55, R * 0.55 * lerp(1, 0.62, Math.sin(inc)), 1);
      POP_say(tag, `เอียง ${Math.round(st.tilt)}°\n${st.tilt < 20 ? 'มองจากด้านบน' : st.tilt < 70 ? 'มองเฉียง' : 'มองจากด้านข้าง'}`, '#ffffff');
    } };
  } },

  // ---------------------------------------------------------- 22 · Solar-system zoom, log-spaced rings follow st.z
  22: { rect: [92, 236, 742, 444], build(g, P) {
    const rect = [92, 236, 742, 444], st = P.st, X0 = P.X0, X1 = P.X1, W = X1 - X0;
    const top = 236, bot = 680, cy2 = (top + bot) / 2, sunX = X0 + 34, Wv = X1 - 22 - sunX, SPAN = Math.log10(Wv / 8);
    const Rmax = 0.215, r0 = 0.032, yP = 0.05;
    POP_mat(g, rect, 0x0b1730);
    const sys = new THREE.Group(); sys.position.set(px2x(P.cx), yP, py2z(cy2 + 6)); g.add(sys);
    const rad = (au, z) => r0 + (Rmax - r0) * (Math.log10(au) - z + SPAN) / SPAN;
    const sunM = new THREE.Mesh(new THREE.SphereGeometry(0.02, 32, 20), new THREE.MeshBasicMaterial({ color: 0xffd43b }));
    sunM.position.y = 0.02; sys.add(sunM, POP_glow(0xffb040, 0.11)); sys.children[1].position.y = 0.02;
    const sunLbl = POP_lbl('ดวงอาทิตย์', '#ffe8a3', 0.018, { bg: 'rgba(11,23,48,0.8)' }); sunLbl.position.set(0, 0.06, 0); sys.add(sunLbl);
    const edge = POP_circle(Rmax, 0xffffff, 0.55); sys.add(edge);
    const edgeLbl = POP_lbl('', '#ffffff', 0.02, { bg: 'rgba(11,23,48,0.85)' }); edgeLbl.position.set(0, 0.02, -Rmax - 0.012); sys.add(edgeLbl);
    // belts: points sorted by distance so the visible window is one draw range
    const rng = C_rng(77), belts = [[2.2, 3.2, 110, 0xc9b79c, 0], [30, 50, 130, 0xa5b4fc, 0], [2000, 100000, 220, 0xd0bfff, 1]].map(([a, b, n, col, dome]) => {
      const d = Array.from({ length: n }, () => (dome ? a * Math.pow(b / a, rng()) : a + (b - a) * rng())).sort((p, q) => p - q);
      const ang = d.map(() => rng() * Math.PI * 2), up = d.map(() => (dome ? rng() * 0.6 : (rng() - 0.5) * 0.04));
      const pts = POP_pts(n, col, dome ? 0.022 : 0.016, { opacity: 0.85 }); sys.add(pts);
      return { d, ang, up, pts, dome };
    });
    const orbitLines = C_PLAN.map(() => { const l = POP_circle(1, 0xffffff, 0.22); sys.add(l); return l; });
    const planets = C_PLAN.map((p, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.006, p.r * 0.0011), 24, 16), M(p.col, { roughness: 0.6, emissive: new THREE.Color(p.col), emissiveIntensity: 0.25 }));
      if (p.ring) { const rg = new THREE.Mesh(new THREE.RingGeometry(p.r * 0.0016, p.r * 0.0024, 40), new THREE.MeshBasicMaterial({ color: 0xf3e2b8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })); rg.rotation.x = -Math.PI / 2 + 0.4; m.add(rg); }
      const lbl = POP_lbl(p.n, '#ffffff', 0.017, { bg: 'rgba(11,23,48,0.75)' }); lbl.center.set(0.5, -0.5); m.add(lbl);
      m.userData.lbl = lbl; m.userData.a0 = i * 2.39; sys.add(m);
      pickable(m, P, 'h', (l) => { const R = Math.pow(10, st.z), rp = p.au * Wv / R, dy = p.v * Math.min(rp * 0.9, 190), o = sys.worldToLocal(l.world.clone()).sub(m.position).multiplyScalar(900); return { x: sunX + Math.sqrt(Math.max(0, rp * rp - dy * dy)) + o.x, y: cy2 + dy + o.z }; });
      return m;
    });
    const selRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 40), new THREE.MeshBasicMaterial({ color: 0xffe066 })); selRing.rotation.x = Math.PI / 2; sys.add(selRing);
    POP_hit(g, P, rect, yP + 0.002);
    let lastZ = null;
    return { update(t) {
      const z = st.z, R = Math.pow(10, z), k = Wv / R;
      if (z !== lastZ) {
        lastZ = z;
        POP_say(edgeLbl, `ขอบภาพ ${C_sig(R)} AU`, '#ffffff');
        for (const b of belts) {
          const lo = R / Math.pow(10, SPAN), pos = b.pts.userData.pos; let i0 = b.d.findIndex(v => v >= lo); if (i0 < 0) i0 = b.d.length;
          let i1 = b.d.findIndex(v => v > R); if (i1 < 0) i1 = b.d.length;
          for (let i = i0; i < i1; i++) { const r = rad(b.d[i], z); pos.set([Math.cos(b.ang[i]) * r, b.dome ? b.up[i] * r : b.up[i], Math.sin(b.ang[i]) * r], i * 3); }
          b.pts.geometry.setDrawRange(i0, Math.max(0, i1 - i0)); b.pts.geometry.attributes.position.needsUpdate = true;
        }
      }
      belts.forEach((b, i) => { b.pts.rotation.y = -t * (i ? 0.004 : 0.03); });
      planets.forEach((m, i) => {
        const p = C_PLAN[i], rp = p.au * k, al = smooth(8, 24, rp), on = al >= 0.03 && rp <= Wv + 6;
        m.visible = orbitLines[i].visible = on; if (!on) return;
        const r = rad(p.au, z), a = m.userData.a0 + t * 0.15 / Math.sqrt(p.au);
        m.position.set(Math.cos(a) * r, 0.012, -Math.sin(a) * r); m.scale.setScalar(0.4 + 0.6 * al);
        orbitLines[i].scale.set(r, 1, r);
        const sep = (p.au - (i ? C_PLAN[i - 1].au : 0)) * k; m.userData.lbl.visible = al * smooth(26, 46, sep) > 0.3 || st.sel === i;
      });
      const sp = planets[st.sel];
      selRing.visible = !!(sp && sp.visible);
      if (selRing.visible) { selRing.position.copy(sp.position); const s = sp.geometry.parameters.radius * sp.scale.x * 1.8 + 0.006 + 0.002 * Math.sin(t * 4); selRing.scale.set(s, s, s); }
    } };
  } },

  // ---------------------------------------------------------- 32 · satellite altitude, orbit plane tilted so it projects onto the 2D ellipse
  32: { rect: [92, 236, 742, 464], build(g, P) {
    const rect = [92, 236, 742, 464], st = P.st, cx = P.cx, ey = 452, Re = 44, rMax = 336, k = 0.46, SPEED = 1440;
    const aToR = (a) => Re + (rMax - Re) * Math.sqrt(a / 40000), s = 0.22 / rMax, tiltA = Math.acos(0.62), hy = 0.18;
    POP_mat(g, rect, 0x0b1730);
    const orb = new THREE.Group(); orb.position.set(px2x(cx), hy, py2z(ey)); orb.rotation.x = tiltA; g.add(orb);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.01, hy, 10), M(0x8f9bb8, { transparent: true, opacity: 0.5 }));
    stem.position.set(px2x(cx), hy / 2, py2z(ey)); g.add(stem);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(Re * s, 48, 32), M(0xffffff, { map: globeTex(), roughness: 0.45 }));
    orb.add(shadowAll(earth));
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.004, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff6b6b }));
    pin.position.set(Re * s * Math.cos(14 * D2R), Re * s * Math.sin(14 * D2R), 0); earth.add(pin);
    const leo = new THREE.Mesh(new THREE.RingGeometry(aToR(160) * s, aToR(2000) * s, 96), new THREE.MeshBasicMaterial({ color: 0x63e6be, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }));
    leo.rotation.x = -Math.PI / 2; orb.add(leo);
    const ringT = (a, col, r = 0.0016) => { const m = new THREE.Mesh(new THREE.TorusGeometry(aToR(a) * s, r, 6, 160), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75 })); m.rotation.x = Math.PI / 2; orb.add(m); return m; };
    ringT(20200, 0x74c0fc); ringT(35786, 0xffa94d);
    const satBody = (col, sc) => {
      const b = new THREE.Group(), mat = M(0x4dabf7, { roughness: 0.3, metalness: 0.4 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.012), M(col, { emissive: new THREE.Color(col), emissiveIntensity: 0.35 }));
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.002, 0.012), mat);
      b.add(box, wing); b.scale.setScalar(sc); orb.add(shadowAll(b)); return b;
    };
    const me = satBody('#ffd43b', 1.25), gps = satBody('#a5d8ff', 0.8), geo = satBody('#ffc078', 0.8);
    me.add(POP_glow(0xffd43b, 0.06));
    const gpsL = POP_lbl('GPS 20,200 กม.', '#a5d8ff', 0.019, { bg: 'rgba(11,23,48,0.8)' }); gpsL.position.set(aToR(20200) * s * 0.6, 0.01, -aToR(20200) * s * 0.8); orb.add(gpsL);
    const geoL = POP_lbl('GEO 35,786 กม.', '#ffc078', 0.019, { bg: 'rgba(11,23,48,0.8)' }); geoL.position.set(-aToR(35786) * s * 0.62, 0.01, -aToR(35786) * s * 0.78); orb.add(geoL);
    const tag = POP_lbl('', '#25303a', 0.022, { bg: 'rgba(255,255,255,0.93)' }); tag.center.set(0.5, -0.6); me.add(tag);
    let myRing = null, lastAlt = null;
    // a big invisible disc in the orbit plane; the hit point becomes the 2D point at the same radius and angle
    const hit = new THREE.Mesh(new THREE.CircleGeometry(rMax * s * 1.6, 64), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    hit.rotation.x = -Math.PI / 2; hit.visible = false; orb.add(hit);
    pickable(hit, P, null, (l) => { const o = orb.worldToLocal(l.world.clone()), rho = Math.hypot(o.x, o.z) / s, a = Math.atan2(o.z, o.x); return { x: cx + rho * Math.cos(a), y: ey + rho * k * Math.sin(a) }; });
    const ext = (key, rate, t) => -((st[key] || 0) + (st['_lt' + key] == null ? 0 : clamp(t - st['_lt' + key], 0, 0.2) * rate));
    const put = (m, r, a) => { m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); m.rotation.y = -a; };
    return { update(t, dt) {
      const alt = st.alt, { T } = D_orbit(alt), cl = D_class(alt);
      if (alt !== lastAlt) {
        lastAlt = alt;
        if (myRing) { orb.remove(myRing); myRing.geometry.dispose(); }
        myRing = ringT(alt, cl[2], 0.0028);
        POP_say(tag, `${D_fmt(alt)} กม.`, '#25303a');
      }
      const ang = ext('ph', 2 * Math.PI * SPEED / T, t), spin = ext('pe', 2 * Math.PI * SPEED / 86164, t) + 1.2, pg = ext('pg', 2 * Math.PI * SPEED / D_orbit(20200).T, t) + 2.4;
      put(me, aToR(alt) * s, ang); put(gps, aToR(20200) * s, pg); put(geo, aToR(35786) * s, spin);
      earth.rotation.y = -spin;
    } };
  } },

  // ---------------------------------------------------------- 36 · Earth interior, cut-away sphere with a probe at st.depth
  36: { rect: [92, 236, 742, 464], build(g, P) {
    const st = P.st, Rs = 0.19, yc = Rs + 0.006, cy2 = 690, cx = P.cx;
    const r3 = (km) => Rs * D_rpx(km) / 340;
    const E = new THREE.Group(); E.position.set(px2x(cx), yc, py2z(468)); E.rotation.y = -0.25; g.add(E);
    // cross-section texture shared by both cut faces
    const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'), Q = (km) => 256 * D_rpx(km) / 340;
    for (const [km, col] of [[6371, '#8d6e4f'], [6336, '#a0522d'], [6271, '#d9480f'], [6021, '#c2410c'], [3480, '#f08c00'], [1221, '#ffd43b']]) { x.fillStyle = col; x.beginPath(); x.arc(256, 256, Q(km), 0, Math.PI * 2); x.fill(); }
    let gr = x.createRadialGradient(256, 256, Q(3480), 256, 256, Q(6021)); gr.addColorStop(0, '#e8590c'); gr.addColorStop(1, '#b4441c');
    x.fillStyle = gr; x.beginPath(); x.arc(256, 256, Q(6021), 0, Math.PI * 2); x.arc(256, 256, Q(3480), 0, Math.PI * 2, true); x.fill();
    gr = x.createRadialGradient(256, 256, Q(1221), 256, 256, Q(3480)); gr.addColorStop(0, '#ffc046'); gr.addColorStop(1, '#f08c00');
    x.fillStyle = gr; x.beginPath(); x.arc(256, 256, Q(3480), 0, Math.PI * 2); x.arc(256, 256, Q(1221), 0, Math.PI * 2, true); x.fill();
    x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 2; x.setLineDash([5, 6]);
    for (const km of [6271, 6021, 3480, 1221]) { x.beginPath(); x.arc(256, 256, Q(km), 0, Math.PI * 2); x.stroke(); }
    const ctex = new THREE.CanvasTexture(c); ctex.colorSpace = THREE.SRGBColorSpace;
    const faceMat = new THREE.MeshStandardMaterial({ map: ctex, roughness: 0.8, side: THREE.DoubleSide });
    const f1 = new THREE.Mesh(new THREE.CircleGeometry(Rs, 64, -Math.PI / 2, Math.PI), faceMat);
    const f2 = new THREE.Mesh(new THREE.CircleGeometry(Rs, 64, Math.PI / 2, Math.PI), faceMat); f2.rotation.y = Math.PI / 2;
    const shell = new THREE.Mesh(new THREE.SphereGeometry(Rs, 64, 40, Math.PI, Math.PI * 1.5), M(0xffffff, { map: globeTex(), roughness: 0.5 }));
    const inner = new THREE.Mesh(new THREE.SphereGeometry(r3(1221), 32, 20), M(0xffe066, { emissive: new THREE.Color('#ffb000'), emissiveIntensity: 0.5, roughness: 0.4 }));
    E.add(shadowAll(shell), f1, f2, shadowAll(inner));
    // probe down the wedge edge (the vertical radius, as on the 2D page)
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 1, 8), M(0xffffff)); E.add(rod);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.02), M(0x343a40)); cap.position.set(0.004, Rs + 0.05, 0.004); E.add(cap);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.008, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); E.add(tip);
    const tipGlow = POP_glow(0xffffff, 0.04); tip.add(tipGlow);
    const tag = POP_lbl('', '#25303a', 0.022); tag.center.set(-0.08, 0.5); tip.add(tag);
    const lab = (txt, km, deg, col = '#ffffff') => { const sp = POP_lbl(txt, col, 0.017, { bg: 'rgba(11,23,48,0.65)' }); sp.position.set(r3(km) * Math.sin(deg * D2R), r3(km) * Math.cos(deg * D2R), 0.004); E.add(sp); return sp; };
    lab('แก่นโลกชั้นใน', 600, 150, '#fff3bf'); lab('แก่นโลกชั้นนอก (ของเหลว)', 2400, 125, '#fff3bf'); lab('เนื้อโลก', 4900, 112); lab('เปลือกโลก (ขยายความหนา)', 6371, 25);
    // seismic rays on face 1, source at the north pole, angular distance runs down the face
    const rays = new THREE.Group(); E.add(rays);
    const heads = [];
    for (const ry of D_rays()) {
      const pts = ry.pts.map(([px, py, tm]) => { const r = Math.hypot(px, py), d = Math.PI - Math.atan2(py, px), q = r3(r); return [q * Math.sin(d), q * Math.cos(d), tm]; });
      const col = ry.type === 'P' ? 0x4dabf7 : 0xff6b6b;
      const line = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.filter((p, i) => i % 2 === 0 || i === pts.length - 1).map(p => new THREE.Vector3(p[0], p[1], 0.003))), 80, 0.0011, 4, false), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8 }));
      rays.add(line);
      const h = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); rays.add(h); heads.push({ h, pts, T: ry.T });
    }
    const src = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffe066 })); src.position.set(0, Rs + 0.004, 0.003); rays.add(src);
    const shadowLbl = POP_lbl('เขตเงาคลื่น P 104°–140° · คลื่น S ไม่ผ่านแก่นชั้นนอก', '#ffffff', 0.017, { bg: 'rgba(28,126,214,0.9)' }); shadowLbl.position.set(Rs * 0.9, -Rs * 0.55, 0.01); rays.add(shadowLbl);
    const bx = P.X1 - 228, by = 250;
    const btn = POP_lbl('', '#1864ab', 0.026, { border: '#1864ab' }); btn.position.set(-Rs * 0.85, Rs * 1.15, 0); E.add(btn);
    pickable(btn, P, null, () => ({ x: bx + 107, y: by + 18 }));
    const toC = (l) => { const o = E.worldToLocal(l.world.clone()); return { x: cx, y: cy2 - 340 * clamp(o.y / Rs, 0, 1) }; };
    for (const m of [shell, f1, f2, inner]) pickable(m, P, 'v', toC);
    return { update(t) {
      const d = st.depth, h = Rs * D_rpx(D_RE - d) / 340, L = D_layer(d), topY = Rs + 0.045;
      rod.scale.y = topY - h; rod.position.set(0.004, (topY + h) / 2, 0.004);
      tip.position.set(0.004, h, 0.004);
      POP_say(tag, `${D_fmt(d)} กม.\n${L.phys[0]}`, mix(L.phys[2], '#25303a', 0.3), L.phys[2]);
      rays.visible = !!st.rays;
      POP_say(btn, st.rays ? '◉ ซ่อนคลื่น P และ S' : '○ แสดงคลื่น P และ S', '#1864ab', '#1864ab');
      if (st.rays) { const tau = mod1(t / 12) * 12 * 2.5 * 60; for (const q of heads) { q.h.visible = tau < q.T; if (q.h.visible) { const c = D_at(q.pts, tau); q.h.position.set(c.x, c.y, 0.004); } } }
    } };
  } },

  // ---------------------------------------------------------- 40 · plate boundaries, five modes driven by st.mode and st.d
  40: { rect: [92, 266, 742, 434], build(g, P) {
    const rect = [92, 266, 742, 434], st = P.st, X = px2x, cx = px2x(P.cx), xa = X(P.X0 + 10), xb = X(P.X1 - 10);
    const zc = py2z(490), Dz = 0.28, z0 = zc - Dz / 2, z1 = zc + Dz / 2;
    const yA = 0.09, yL = 0.12, yC = 0.155, yO = 0.13, ySea = 0.148;
    const BR = { crust: '#c9a874', ocean: '#4a4f5a', lith: '#7b6250' };
    const asth = POP_block(g, '#e8823a', { roughness: 0.9 }); POP_box(asth, xa, xb, 0, yA, z0, z1);
    const G = [0, 1, 2, 3, 4].map(() => { const q = new THREE.Group(); g.add(q); return q; });
    // shared pieces
    const mkArrow = (q) => { const a = arrow3(0x495057, 0.09, 0.007); q.add(a); return a; };
    const aim = (a, x, y, z, dx, dz) => { a.position.set(x - dx * 0.045, y, z - dz * 0.045); a.rotation.set(0, Math.atan2(dx, dz), 0); };
    const tint = (arrs) => arrs.forEach(a => a.traverse(o => { if (o.isMesh) o.material.color.set(st._side ? 0xe8590c : 0x495057); }));
    const cone = (q, col) => { const m = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 32, 1, true), M(col, { roughness: 0.85, side: THREE.DoubleSide })); m.geometry.translate(0, 0.5, 0); q.add(shadowAll(m)); return m; };
    const ash = (q) => { const p = POP_pts(12, 0x8a8a90, 0.08, { opacity: 0.6 }); q.add(p); return p; };
    const puff = (p, x, y, z, t, on) => { p.visible = on > 0.05; p.material.opacity = 0.6 * on; const a = p.userData.pos; for (let k = 0; k < 12; k++) { const u = mod1(t * 0.3 + k / 12); a.set([x + Math.sin(k * 1.7 + t) * 0.008 + u * 0.03, y + 0.01 + u * 0.09 * on, z + Math.cos(k * 2.3) * 0.01], k * 3); } p.geometry.attributes.position.needsUpdate = true; };
    const top = POP_lbl('', '#8a4b2a', 0.022, { bg: 'rgba(255,255,255,0.92)' }); g.add(top);
    // mode 0: divergent
    const d0 = { lL: POP_block(G[0], BR.lith), cL: POP_block(G[0], BR.crust), lR: POP_block(G[0], BR.lith), cR: POP_block(G[0], BR.crust),
      floor: POP_block(G[0], BR.crust), magma: POP_block(G[0], '#ff8c28', { emissive: new THREE.Color('#ff7a00'), emissiveIntensity: 0.8 }),
      sea: POP_block(G[0], '#3d8fd1', { transparent: true, opacity: 0.55, depthWrite: false }), glow: POP_glow(0xffaa40, 0.05), dots: POP_pts(10, 0xffeca8, 0.03),
      volc: cone(G[0], '#7d5a48'), arr: [mkArrow(G[0]), mkArrow(G[0])] };
    G[0].add(d0.glow, d0.dots);
    // modes 1, 2: subduction (slab = chain of short boxes that steepen with depth)
    const SEG = 0.012, segs = []; { let x = 0, y = 0, s = 0; while (s < 0.15) { const a = (16 + 34 * clamp(s / 0.09, 0, 1)) * D2R; segs.push({ x: x + Math.cos(a) * SEG / 2, y: y - Math.sin(a) * SEG / 2, a, s }); x += Math.cos(a) * SEG; y -= Math.sin(a) * SEG; s += SEG; } }
    const sub = [1, 2].map(mi => {
      const q = G[mi], o = {
        fl: POP_block(q, BR.lith), fc: POP_block(q, BR.ocean), ol: POP_block(q, BR.lith), oc: POP_block(q, mi === 2 ? BR.ocean : BR.crust),
        sea: POP_block(q, '#3d8fd1', { transparent: true, opacity: 0.5, depthWrite: false }),
        slab: segs.map(() => { const m = POP_block(q, '#3b3f47'); m.scale.set(SEG * 1.15, 0.03, Dz * 1.012); return m; }),
        volc: cone(q, '#7d5a48'), ash: ash(q), melt: POP_pts(9, 0xff9640, 0.035), quakes: [0, 1, 2, 3, 4, 5].map(() => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.006), new THREE.MeshBasicMaterial({ color: 0xffe03c, transparent: true })); q.add(m); return m; }),
        ticks: [0, 1, 2, 3, 4, 5, 6].map(() => POP_block(q, '#ffffff', { transparent: true, opacity: 0.5 })), arr: [mkArrow(q), mkArrow(q)],
      };
      q.add(o.melt); return o;
    });
    // mode 3: continent-continent collision with a fold ridge
    const ridgeGeo = new THREE.BoxGeometry(1, 1, 1, 32, 1, 1); { const p = ridgeGeo.attributes.position; for (let i = 0; i < p.count; i++) { const xx = p.getX(i); p.setY(i, p.getY(i) > 0 ? Math.exp(-((xx * 3.2) ** 2)) : 0); } ridgeGeo.computeVertexNormals(); }
    const d3 = { lL: POP_block(G[3], BR.lith), cL: POP_block(G[3], BR.crust), lR: POP_block(G[3], BR.lith), cR: POP_block(G[3], BR.crust),
      oc: POP_block(G[3], BR.ocean), sea: POP_block(G[3], '#3d8fd1', { transparent: true, opacity: 0.5, depthWrite: false }),
      ridge: new THREE.Mesh(ridgeGeo, M('#a8875c', { roughness: 0.9 })), root: new THREE.Mesh(ridgeGeo, M(BR.crust, { roughness: 0.9 })), arr: [mkArrow(G[3]), mkArrow(G[3])] };
    d3.root.rotation.z = Math.PI; G[3].add(shadowAll(d3.ridge), d3.root);
    // mode 4: transform, top view blocks offset along z with a road and a stream
    const tf = [-1, 1].map(sg => {
      const q = new THREE.Group(); G[4].add(q);
      const x0 = sg < 0 ? xa : cx, x1 = sg < 0 ? cx : xb, l = POP_block(q, BR.lith), c = POP_block(q, sg < 0 ? '#d9c79c' : '#cdb98a');
      POP_box(l, x0, x1, yA, yL, z0, z1); POP_box(c, x0, x1, yL, yC, z0, z1);
      const road = POP_block(q, '#7b7f86'); POP_box(road, x0, x1, yC, yC + 0.002, zc - 0.11, zc - 0.085);
      const river = POP_block(q, '#3d8fd1'); POP_box(river, x0, x1, yC, yC + 0.0025, zc + 0.02, zc + 0.04);
      const lb = POP_lbl(sg < 0 ? 'แผ่นธรณี A' : 'แผ่นธรณี B', '#5a4020', 0.02); lb.position.set((x0 + x1) / 2, yC + 0.03, zc - 0.05); q.add(lb);
      return { q, a: mkArrow(G[4]) };
    });
    const fault = POP_block(G[4], '#5a2d17');
    const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 6, 48), new THREE.MeshBasicMaterial({ color: 0xc92a2a, transparent: true })); m.rotation.x = Math.PI / 2; G[4].add(m); return m; });
    POP_hit(g, P, rect, yC + 0.002);
    return { update(t) {
      const m = st.mode, d = st.d;
      G.forEach((q, i) => { q.visible = i === m; });
      asth.visible = m !== 4;
      let tl = '';
      if (m === 0) {
        const gap = X(40 + d * 210), xl = cx - gap / 2, xr = cx + gap / 2, oc = smooth(0.4, 0.8, d), sea = d > 0.45, fy = yC - 0.03 * smooth(0.05, 0.8, d);
        POP_box(d0.lL, xa, xl, yA, yL, z0, z1); POP_box(d0.cL, xa, xl, yL, yC, z0, z1); POP_box(d0.lR, xr, xb, yA, yL, z0, z1); POP_box(d0.cR, xr, xb, yL, yC, z0, z1);
        POP_box(d0.floor, xl, xr, yA, fy, z0, z1); d0.floor.material.color.setStyle(mix('#a98a62', BR.ocean, oc));
        POP_box(d0.magma, cx - 0.008, cx + 0.008, yA - 0.03, fy + 0.004 + 0.008 * oc, z0 + 0.004, z1 - 0.004);
        POP_box(d0.sea, xl, xr, fy, ySea, z0, z1); d0.sea.visible = sea;
        d0.glow.position.set(cx, fy + 0.01, z1);
        const a = d0.dots.userData.pos; for (let k = 0; k < 10; k++) { const u = mod1(t * 0.4 + k / 10); a.set([cx + Math.sin(k * 2 + t) * 0.012 * (1 - u), lerp(0.02, fy, u), z1 + 0.004 - (k % 3) * 0.04], k * 3); } d0.dots.geometry.attributes.position.needsUpdate = true;
        const vh = 0.035 * smooth(0.25, 0.5, d) * (d < 0.75 ? 1 : 1 - smooth(0.75, 0.85, d)); d0.volc.visible = vh > 0.002; d0.volc.scale.set(0.03, vh, 0.03); d0.volc.position.set(xl - 0.06, yC, zc);
        aim(d0.arr[0], xa + 0.12, yC + 0.03, zc, -1, 0); aim(d0.arr[1], xb - 0.12, yC + 0.03, zc, 1, 0); tint(d0.arr);
        tl = sea ? 'สันเขากลางมหาสมุทร · ทะเลเกิดใหม่' : 'หุบเขาทรุด (rift valley)'; top.position.set(cx, yC + 0.07, zc);
      } else if (m <= 2) {
        const o = sub[m - 1], oo = m === 2, xt = cx - X(70), len = 0.02 + 0.13 * d;
        POP_box(o.fl, xa, xt, yA, yL, z0, z1); POP_box(o.fc, xa, xt, yL, yO, z0, z1);
        POP_box(o.ol, xt, xb, yA, yL, z0, z1); POP_box(o.oc, xt + 0.012, xb, yL, oo ? yO : yC, z0, z1);
        POP_box(o.sea, xa, oo ? xb : xt + 0.012, yO, ySea, z0, z1);
        o.slab.forEach((b, i) => { const sg = segs[i]; b.visible = sg.s < len; b.position.set(xt + sg.x + Math.sin(sg.a) * 0.015, yO + sg.y - Math.cos(sg.a) * 0.015, zc); b.rotation.z = -sg.a; });
        o.ticks.forEach((b, k) => { const xx = xt - mod1(k / 7 - d * 0.6) * (xt - xa); POP_box(b, xx - 0.003, xx + 0.003, yO, yO + 0.0015, z0 + 0.02, z1 - 0.02); });
        const tipS = segs.filter(sg => sg.s < len).pop(), act = smooth(0.35, 0.6, d), xv = xt + 0.12, vb = oo ? yO : yC, vh = (oo ? 0.09 : 0.06) * smooth(0.25, 1, d);
        o.volc.visible = vh > 0.002; o.volc.scale.set(oo ? 0.05 : 0.04, vh, oo ? 0.05 : 0.04); o.volc.position.set(xv, vb, zc);
        puff(o.ash, xv, vb + vh, zc, t, smooth(0.5, 0.9, d));
        const mp = o.melt.userData.pos; for (let k = 0; k < 9; k++) { const u = mod1(t * 0.3 + k / 9); mp.set([xv + Math.sin(k * 1.9 + t) * 0.008, lerp(0.03, vb, u), z1 + 0.003 - (k % 3) * 0.05], k * 3); }
        o.melt.geometry.attributes.position.needsUpdate = true; o.melt.visible = act > 0.05; o.melt.material.opacity = act;
        o.quakes.forEach((q, k) => { const cyc = t * 0.8 + k * 0.37, age = cyc - Math.floor(cyc), sg = segs[Math.floor(mod1(Math.sin(Math.floor(cyc) * 12.9898 + k * 78.233) * 43758.5453) * segs.length)]; q.visible = sg.s < len; q.position.set(xt + sg.x, yO + sg.y, z1 + 0.004); q.material.opacity = 1 - age; q.scale.setScalar(1.6 - age); });
        aim(o.arr[0], xa + 0.12, yC + 0.03, zc, 1, 0); aim(o.arr[1], xb - 0.12, yC + 0.05, zc, -1, 0); tint(o.arr);
        tl = vh > 0.03 ? (oo ? 'หมู่เกาะภูเขาไฟรูปโค้ง (island arc)' : 'เทือกเขาภูเขาไฟ') : 'ร่องลึกก้นสมุทร · แผ่นมหาสมุทรมุดตัว'; top.position.set(vh > 0.03 ? xv : xt, Math.max(vb + vh, yC) + 0.06, zc);
      } else if (m === 3) {
        const c = smooth(0, 0.45, d), mm = smooth(0.4, 1, d), gap = X(180) * (1 - c), xe = cx - gap;
        POP_box(d3.lL, xa, xe, yA, yL, z0, z1); POP_box(d3.cL, xa, xe, yL, yC, z0, z1); POP_box(d3.lR, cx, xb, yA, yL, z0, z1); POP_box(d3.cR, cx, xb, yL, yC, z0, z1);
        POP_box(d3.oc, xe, cx, yA, yO, z0, z1); POP_box(d3.sea, xe, cx, yO, ySea, z0, z1); d3.oc.visible = d3.sea.visible = gap > 0.005;
        const w = 0.25 + 0.2 * mm; d3.ridge.visible = d3.root.visible = mm > 0.01;
        d3.ridge.scale.set(w, 0.1 * mm, Dz); d3.ridge.position.set(cx, yC - 0.001, zc);
        d3.root.scale.set(w, 0.035 * mm, Dz * 0.995); d3.root.position.set(cx, yA + 0.001, zc);
        aim(d3.arr[0], xa + 0.12, yC + 0.03, zc, 1, 0); aim(d3.arr[1], xb - 0.12, yC + 0.03, zc, -1, 0); tint(d3.arr);
        tl = mm > 0.2 ? 'เทือกเขาโก่งตัว (fold mountains)' : 'มหาสมุทรระหว่างทวีปแคบลง'; top.position.set(cx, yC + 0.1 * mm + 0.05, zc);
      } else {
        const off = X(80) * d, dir = st._dir || 1;
        tf[0].q.position.z = -off; tf[1].q.position.z = off; POP_box(fault, cx - 0.002, cx + 0.002, yA, yC + 0.003, z0 - Math.abs(off), z1 + Math.abs(off));
        aim(tf[0].a, xa + 0.12, yC + 0.03, zc, 0, -dir); aim(tf[1].a, xb - 0.12, yC + 0.03, zc, 0, dir); tint([tf[0].a, tf[1].a]);
        const fl = (st._fl || []).filter(f => animClock - f.t0 < 1.6 && animClock >= f.t0).slice(-3);
        rings.forEach((r, i) => { const f = fl[i]; r.visible = !!f; if (!f) return; const a = animClock - f.t0, s = X(10 + a * 70 * f.r); r.scale.set(s, s, s); r.position.set(cx, yC + 0.004, py2z(f.y)); r.material.opacity = 0.85 * (1 - a / 1.6); });
        tl = 'รอยเลื่อน (transform fault)'; top.position.set(cx, yC + 0.05, z0 - 0.05);
      }
      POP_say(top, tl, '#8a4b2a');
    } };
  } },

  // ---------------------------------------------------------- 44 · volcano shape by silica, lathe cone rebuilt in place when st.si changes
  44: { rect: [92, 248, 742, 452], build(g, P) {
    const rect = [92, 248, 742, 452], st = P.st, s = 0.62 / 900, yg = 0.03, NP = 48, SEGS = 72;
    const C0 = new THREE.Vector3(px2x(P.cx), 0, py2z(476));
    const ground = POP_block(g, '#8c7a62', { roughness: 0.95 }); POP_box(ground, px2x(96), px2x(830), 0, yg, py2z(282), py2z(696));
    const V = new THREE.Group(); V.position.set(C0.x, yg, C0.z); g.add(V);
    const prof = [];
    for (let j = 0; j < NP; j++) prof.push(new THREE.Vector2(j / (NP - 1), 0));
    const lathe = new THREE.LatheGeometry(prof, SEGS);
    lathe.setAttribute('color', new THREE.BufferAttribute(new Float32Array(lathe.attributes.position.count * 3), 3));
    const coneM = new THREE.Mesh(lathe, M(0xffffff, { vertexColors: true, roughness: 0.9, side: THREE.DoubleSide })); V.add(shadowAll(coneM));
    const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 10), new THREE.MeshBasicMaterial({ color: 0xff7a1a })); V.add(vent);
    const crater = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: 0xff7a1a })); crater.rotation.x = -Math.PI / 2; V.add(crater);
    const lavaP = POP_pts(60, 0xff7a1e, 0.03), bombP = POP_pts(22, 0xff9a3c, 0.03), ashP = POP_pts(34, 0x8d8a85, 0.14, { opacity: 0.6 });
    V.add(lavaP, bombP, ashP);
    const L1 = POP_lbl('← ซิลิกาน้อย · หนืดน้อย', '#d9480f', 0.022), L2 = POP_lbl('ซิลิกามาก · หนืดมาก →', '#862e9c', 0.022);
    L1.position.set(px2x(P.X0 + 150), 0.06, py2z(670)); L2.position.set(px2x(P.X1 - 150), 0.06, py2z(670)); g.add(L1, L2);
    const tag = POP_lbl('', '#7a3a10', 0.024); g.add(tag);
    POP_hit(g, P, rect, yg + 0.001);
    let lastSi = null, Vp = null;
    const hgt = (r) => { const q = r / Vp.B; if (q >= 1) return 0; let h = Vp.H * Math.pow(1 - Math.pow(q, Vp.p), Vp.q); if (r < Vp.cr) h -= (Vp.cr - r) * 0.45; return h * 1.5; };
    const col = new THREE.Color(), dark = new THREE.Color();
    return { update(t) {
      const si = st.si, f = (si - 45) / 30;
      if (si !== lastSi) {
        lastSi = si; Vp = E_vparams(f);
        const pos = lathe.attributes.position, cl = lathe.attributes.color, nl = Math.round(lerp(4, 6, f));
        col.setStyle(mix('#8a6a55', '#a59c90', f)); dark.setStyle('#5a4638');
        for (let i = 0; i <= SEGS; i++) {
          const ph = i / SEGS * Math.PI * 2, sn = Math.sin(ph), cs = Math.cos(ph);
          for (let j = 0; j < NP; j++) {
            const r = j / (NP - 1) * (Vp.B + 4), h = hgt(r), idx = i * NP + j;
            pos.setXYZ(idx, r * s * sn, Math.max(0, h) * s, r * s * cs);
            const band = f > 0.45 && Math.floor(h / (Vp.H * 1.5) * nl) % 2 === 1;
            const c = band ? col.clone().lerp(dark, 0.5) : col; cl.setXYZ(idx, c.r, c.g, c.b);
          }
        }
        pos.needsUpdate = cl.needsUpdate = true; lathe.computeVertexNormals(); lathe.computeBoundingSphere();
        const peak = hgt(0) * s; vent.scale.y = Math.max(0.001, peak); vent.position.y = peak / 2; crater.position.y = peak + 0.001; crater.scale.setScalar(Math.max(0.004, Vp.cr * s * 0.5));
        crater.material.color.setStyle(mix('#ffc233', '#a51d1d', f)); vent.material.color.copy(crater.material.color);
        POP_say(tag, E_VTYPE[E_vtype(f)].name, '#7a3a10');
      }
      const peak = hgt(0) * s, lava = 1 - smooth(0.2, 0.55, f), boom = smooth(0.5, 0.85, f), bombs = smooth(0.15, 0.38, f) * (1 - smooth(0.55, 0.8, f));
      tag.position.set(C0.x, yg + Vp.H * 1.5 * s + 0.05 + boom * 0.13, C0.z);
      // lava runs down six flanks
      lavaP.visible = lava > 0.05; lavaP.material.opacity = 0.95 * lava;
      if (lavaP.visible) { const a = lavaP.userData.pos, Lr = Vp.B * lerp(0.35, 0.95, lava); for (let k = 0; k < 60; k++) { const dir = (k % 6) / 6 * Math.PI * 2 + 0.3, r = lerp(Vp.cr * 0.6, Lr, mod1(t * 0.25 + Math.floor(k / 6) / 10)); a.set([Math.sin(dir) * r * s, hgt(r) * s + 0.003, Math.cos(dir) * r * s], k * 3); } lavaP.geometry.attributes.position.needsUpdate = true; }
      // fountain or bombs
      const on = Math.max(lava * 0.9, bombs); bombP.visible = on > 0.05; bombP.material.opacity = on; bombP.material.color.set(bombs > lava ? 0x9a3020 : 0xff9a3c);
      if (bombP.visible) { const a = bombP.userData.pos, hm = lerp(50, 160, bombs) * s; for (let k = 0; k < 22; k++) { const u = mod1(t * 0.7 + k * 0.618), ang = k * 2.4, sp = (k * 0.37 % 1) * lerp(0.6, 1.4, bombs) * hm; a.set([Math.sin(ang) * sp * u, peak + 2 * hm * u * (1 - u), Math.cos(ang) * sp * u], k * 3); } bombP.geometry.attributes.position.needsUpdate = true; }
      // ash column with an umbrella top
      ashP.visible = boom > 0.03; ashP.material.opacity = 0.6 * boom;
      if (ashP.visible) { const a = ashP.userData.pos; for (let k = 0; k < 34; k++) { const u = mod1(t * 0.1 + k / 34), sp = u > 0.75 ? (u - 0.75) * 4 : 0, an = k * 2.4; const rr2 = 0.006 + u * 0.02 + sp * 0.12 * (0.5 + 0.5 * Math.sin(k * 1.7)); a.set([Math.sin(an + t * 0.3) * rr2, peak + u * 0.2, Math.cos(an + t * 0.3) * rr2], k * 3); } ashP.geometry.attributes.position.needsUpdate = true; }
    } };
  } },
};
