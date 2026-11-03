// ============================================================ part D · pages 27–34 · space technology + Earth's interior
const D_TOP = 236, D_H = 464, D_GM = 3.986e14, D_RE = 6371;
let D_seed = 7;
const D_rnd = () => (D_seed = (D_seed * 16807) % 2147483647) / 2147483647;
const D_STARS = Array.from({ length: 110 }, () => [D_rnd(), D_rnd(), 0.6 + D_rnd() * 1.4, D_rnd() * 6.28]);
const D_fmt = (n) => Math.round(n).toLocaleString('en-US');

function D_space(ctx, x, y, w, h, t) {
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0b1730'); g.addColorStop(1, '#14254a');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  for (const [u, v, r, ph] of D_STARS) {
    ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.3 * Math.sin(t * 1.3 + ph)})`;
    ctx.fillRect(x + u * w, y + v * h, r, r);
  }
}
function D_frame(ctx, x, y, w, h) { ctx.strokeStyle = 'rgba(40,55,80,0.35)'; ctx.lineWidth = 2; rr(ctx, x, y, w, h, 16); ctx.stroke(); }
function D_box(ctx, x, y, w, h, col) { ctx.fillStyle = rgba(col, 0.08); rr(ctx, x, y, w, h, 12); ctx.fill(); ctx.fillStyle = col; rr(ctx, x, y, 6, h, 3); ctx.fill(); }
function D_earth(ctx, x, y, R) {
  const g = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.08, x, y, R);
  g.addColorStop(0, '#8fd0f2'); g.addColorStop(0.55, '#2f86c4'); g.addColorStop(1, '#123f73');
  glow(ctx, x, y, R * 1.25, 'rgba(120,190,255,0.35)');
  circle(ctx, x, y, R, g);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = 'rgba(92,160,90,0.85)';
  for (const [a, b, s] of [[-0.45, -0.25, 0.32], [0.25, -0.05, 0.36], [-0.1, 0.42, 0.26], [0.5, 0.45, 0.2]]) {
    ctx.beginPath(); ctx.ellipse(x + a * R, y + b * R, s * R, s * R * 0.62, a * 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function D_sat(ctx, x, y, s, col = '#ffd43b', ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = '#4dabf7'; ctx.fillRect(-s * 2.3, -s * 0.45, s * 1.5, s * 0.9); ctx.fillRect(s * 0.8, -s * 0.45, s * 1.5, s * 0.9);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1; ctx.strokeRect(-s * 2.3, -s * 0.45, s * 1.5, s * 0.9); ctx.strokeRect(s * 0.8, -s * 0.45, s * 1.5, s * 0.9);
  ctx.fillStyle = col; rr(ctx, -s * 0.7, -s * 0.7, s * 1.4, s * 1.4, 3); ctx.fill();
  ctx.restore();
}

// ============================================================ 28 · Newton's cannon
let D_cannonCache = null;
function D_cannonPath(v, b) {
  if (D_cannonCache && D_cannonCache.v === v) return D_cannonCache;
  const R = 0.94;
  let x = 0, y = 1, vx = v / 7.9, vy = 0, time = 0, sweep = 0, prev = 0, end = 'out';
  const pts = [[x, y, 0]];
  for (let k = 0; k < 24000; k++) {
    const r = Math.hypot(x, y), dt = 0.0025 * Math.max(1, r) ** 1.5;
    let r3 = r * r * r; vx -= x / r3 * dt / 2; vy -= y / r3 * dt / 2;
    x += vx * dt; y += vy * dt; time += dt;
    const r2 = Math.hypot(x, y); r3 = r2 * r2 * r2; vx -= x / r3 * dt / 2; vy -= y / r3 * dt / 2;
    const a = Math.atan2(x, y); let da = a - prev; if (da < -Math.PI) da += 2 * Math.PI; if (da > Math.PI) da -= 2 * Math.PI; sweep += da; prev = a;
    if (k % 4 === 0) pts.push([x, y, time]);
    if (r2 < R) { end = 'ground'; pts.push([x, y, time]); break; }
    if (sweep >= 2 * Math.PI) { end = 'orbit'; pts.push([0, 1, time]); break; }
    if (x < b[0] || x > b[1] || y < b[2] || y > b[3]) { end = 'out'; pts.push([x, y, time]); break; }
  }
  return (D_cannonCache = { v, pts, end, T: time });
}
function D_at(pts, tm) {
  let lo = 0, hi = pts.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (pts[m][2] <= tm) lo = m; else hi = m; }
  const a = pts[lo], b = pts[hi], f = clamp((tm - a[2]) / ((b[2] - a[2]) || 1), 0, 1);
  return { i: lo, x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f) };
}
const D_KIND = {
  fall: ['ตกกลับสู่พื้นโลก', '#ff8787', 'ความเร็วไม่พอ ลูกปืนโค้งลงกระทบพื้นก่อนจะโคจรได้ครบรอบ'],
  circle: ['วงโคจรวงกลม', '#69db7c', 'ลูกปืนตกเข้าหาโลกตลอดเวลา แต่ผิวโลกโค้งหนีพอดี จึงวนรอบโลกได้'],
  ellipse: ['วงโคจรวงรี', '#74c0fc', ''],
  escape: ['หลุดพ้นแรงโน้มถ่วงโลก', '#ffa94d', 'พลังงานมากพอจะหนีออกไปไม่กลับมา เส้นทางเป็นเส้นโค้งเปิด'],
};
function D_dCannon(ctx, t, P) {
  const { X0, X1, cx, th, st } = P;
  const W = X1 - X0, bot = D_TOP + D_H, ex = cx, ey = 384, S = 100, Rp = 94;
  const v = Math.round(st.v * 10) / 10;
  const path = D_cannonPath(v, [(X0 - ex) / S - 0.2, (X1 - ex) / S + 0.2, (ey - bot) / S - 0.2, (ey - D_TOP) / S + 0.2]);
  const kind = path.end === 'ground' ? 'fall' : v >= 11.2 ? 'escape' : Math.abs(v - 7.9) <= 0.1 ? 'circle' : 'ellipse';
  const [kName, kCol] = D_KIND[kind];
  if (st._pv !== v) { st._pv = v; st.tt = 0; }
  const tt = phaseAdvance(st, 'tt', t, 1.05);
  let tm;
  if (path.end === 'orbit') tm = tt % path.T;
  else { if (tt > path.T + 1.2) st.tt = 0; tm = Math.min(tt, path.T); }
  const SX = (p) => ex + p[0] * S, SY = (p) => ey - p[1] * S;

  ctx.save(); rr(ctx, X0, D_TOP, W, D_H, 16); ctx.clip();
  D_space(ctx, X0, D_TOP, W, D_H, t);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 7]); ring(ctx, ex, ey, S); ctx.setLineDash([]);
  D_earth(ctx, ex, ey, Rp);
  ctx.fillStyle = '#7b6a55'; ctx.beginPath(); ctx.moveTo(ex - 34, ey - Rp + 6); ctx.lineTo(ex - 6, ey - S + 2); ctx.lineTo(ex + 6, ey - S + 2); ctx.lineTo(ex + 34, ey - Rp + 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f1f3f5'; ctx.beginPath(); ctx.moveTo(ex - 10, ey - S + 8); ctx.lineTo(ex - 6, ey - S + 2); ctx.lineTo(ex + 6, ey - S + 2); ctx.lineTo(ex + 10, ey - S + 8); ctx.closePath(); ctx.fill();
  // predicted path, then the travelled trail
  ctx.strokeStyle = rgba('#ffffff', 0.35); ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath();
  path.pts.forEach((p, i) => (i ? ctx.lineTo(SX(p), SY(p)) : ctx.moveTo(SX(p), SY(p)))); ctx.stroke(); ctx.setLineDash([]);
  const cur = D_at(path.pts, tm);
  ctx.strokeStyle = kCol; ctx.lineWidth = 3.5; ctx.beginPath();
  for (let i = 0; i <= cur.i; i++) { const p = path.pts[i]; i ? ctx.lineTo(SX(p), SY(p)) : ctx.moveTo(SX(p), SY(p)); }
  ctx.lineTo(ex + cur.x * S, ey - cur.y * S); ctx.stroke();
  const bx = ex + cur.x * S, by = ey - cur.y * S;
  glow(ctx, bx, by, 18, rgba(kCol, 0.7)); circle(ctx, bx, by, 6, '#fff');
  if (path.end === 'ground' && tm >= path.T) { const f = clamp((tt - path.T) / 1.2, 0, 1); ctx.strokeStyle = `rgba(255,190,120,${1 - f})`; ctx.lineWidth = 3; ring(ctx, bx, by, 8 + f * 26); }
  // cannon + launch arrow (length grows with speed)
  ctx.fillStyle = '#343a40'; rr(ctx, ex - 14, ey - S - 10, 26, 12, 4); ctx.fill();
  circle(ctx, ex - 6, ey - S + 2, 6, '#212529');
  const al = 18 + v * 17;
  arrow(ctx, ex + 14, ey - S - 4, ex + 14 + al, ey - S - 4, { color: kCol, w: 5, head: 16 });
  label(ctx, `v = ${v.toFixed(1)} กม./วินาที`, Math.max(ex + 22 + al / 2, ex + 100), ey - S - 28, { size: 16, wt: 700, color: '#fff', bg: 'rgba(11,23,48,0.7)', pad: 5 });
  label(ctx, 'ยอดเขาสูง (ไม่มีอากาศต้าน)', ex - 30, ey - S - 30, { size: 14, wt: 600, color: 'rgba(255,255,255,0.75)', align: 'right' });
  if (path.end === 'out' && kind !== 'escape') label(ctx, 'วงรีกว้างเกินกรอบ ↓', X1 - 20, bot - 106, { size: 14, wt: 600, color: '#a5d8ff', align: 'right' });
  // speed ruler (the whole panel drags along it)
  const rx0 = X0 + 56, rx1 = X1 - 56, ry = bot - 30, vx = (s) => lerp(rx0, rx1, s / 12);
  ctx.fillStyle = 'rgba(8,16,34,0.82)'; ctx.fillRect(X0, bot - 90, W, 90);
  for (const [a, b, col] of [[0, 7.85, '#ff8787'], [7.85, 7.95, '#69db7c'], [7.95, 11.2, '#74c0fc'], [11.2, 12, '#ffa94d']]) {
    ctx.fillStyle = rgba(col, 0.75); ctx.fillRect(vx(a), ry - 4, vx(b) - vx(a), 8);
  }
  for (let s = 0; s <= 12; s += 2) label(ctx, String(s), vx(s), ry + 18, { size: 13, wt: 600, color: 'rgba(255,255,255,0.6)' });
  for (const [s, txt, col] of [[7.9, '7.9 วงกลม', '#69db7c'], [11.2, '11.2 หลุดพ้น', '#ffa94d']]) {
    ctx.fillStyle = col; ctx.fillRect(vx(s) - 1.5, ry - 14, 3, 20);
    label(ctx, txt, vx(s) + (s > 10 ? 4 : 0), ry - 24, { size: 13, wt: 700, color: col, align: s > 10 ? 'right' : 'center' });
  }
  label(ctx, '← ช้าลง', rx0 - 6, ry - 46, { size: 14, wt: 700, color: '#fff', align: 'left' });
  label(ctx, 'เร็วขึ้น →', rx1 + 6, ry - 46, { size: 14, wt: 700, color: '#fff', align: 'right' });
  circle(ctx, vx(v), ry, 11, '#fff'); ctx.strokeStyle = kCol; ctx.lineWidth = 4; ring(ctx, vx(v), ry, 11);
  ctx.restore();
  D_frame(ctx, X0, D_TOP, W, D_H);
  P.zones.push({ x: X0, y: D_TOP, w: W, h: D_H, cursor: 'ew-resize', drag: (px) => { if (px >= 0) st.v = clamp((px - rx0) / (rx1 - rx0) * 12, 0, 12); } });
  hint(ctx, P, 'ลากซ้าย-ขวาบนภาพเพื่อปรับความเร็วที่ยิงออกไป', bot + 22);
  // readout
  const q = (v / 7.9) ** 2, apo = D_RE * (q / (2 - q) - 1);
  const why = kind === 'ellipse' ? (v > 7.9 ? `ยิ่งเร็ว วงรียิ่งยืดออก · จุดไกลสุดสูงจากพื้นราว ${D_fmt(Math.round(apo / 100) * 100)} กม.` : 'เกือบพอแล้ว ลูกปืนโคจรเป็นวงรีที่จุดยิงคือจุดไกลสุด') : D_KIND[kind][2];
  const ry2 = bot + 46;
  D_box(ctx, X0, ry2, W, 96, th.a);
  label(ctx, `${v.toFixed(1)} กม./วินาที`, X0 + 22, ry2 + 28, { size: 24, wt: 700, align: 'left', fam: F.display });
  label(ctx, '→ ' + kName, X1 - 18, ry2 + 28, { size: 24, wt: 700, color: mix(kCol, '#25303a', 0.35), align: 'right', fam: F.display });
  para(ctx, why, X0 + 22, ry2 + 50, W - 40, 18, { color: C.soft });
  // multistage strip
  D_stages(ctx, t, P, ry2 + 116);
}
function D_rocketBody(ctx, from, flame) {
  const parts = [[-52, -12, 9, '#f1f3f5', '#e8590c'], [-12, 18, 7.5, '#e9ecef', '#1c7ed6'], [18, 38, 6, '#f8f9fa', '#0f7c72']];
  for (let k = from; k < 3; k++) {
    const [a, b, hw, fill, band] = parts[k];
    ctx.fillStyle = fill; ctx.fillRect(a, -hw, b - a, hw * 2);
    ctx.fillStyle = band; ctx.fillRect(a + 2, -hw, 4, hw * 2);
    ctx.strokeStyle = 'rgba(37,48,58,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(a, -hw, b - a, hw * 2);
  }
  if (from <= 2) { ctx.fillStyle = '#c92a2a'; ctx.beginPath(); ctx.moveTo(38, -6); ctx.lineTo(54, 0); ctx.lineTo(38, 6); ctx.closePath(); ctx.fill(); }
  if (flame) {
    const tail = parts[from][0], hw = parts[from][2];
    ctx.fillStyle = 'rgba(255,169,77,0.9)'; ctx.beginPath(); ctx.moveTo(tail, -hw * 0.7); ctx.lineTo(tail - 20 - flame * 14, 0); ctx.lineTo(tail, hw * 0.7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,243,191,0.95)'; ctx.beginPath(); ctx.moveTo(tail, -hw * 0.35); ctx.lineTo(tail - 10 - flame * 6, 0); ctx.lineTo(tail, hw * 0.35); ctx.closePath(); ctx.fill();
  }
}
function D_stages(ctx, t, P, y0) {
  const { X0, X1, th } = P, W = X1 - X0, h = 176, top = y0 + 38;
  stitle(ctx, 'ข. จรวดหลายท่อน (multistage rocket) สลัดท่อนที่หมดเชื้อเพลิงทิ้ง', X0, y0, th);
  ctx.save(); rr(ctx, X0, top, W, h, 14); ctx.clip();
  const g = ctx.createLinearGradient(X0, 0, X1, 0); g.addColorStop(0, '#a5d8ff'); g.addColorStop(0.45, '#3b5b92'); g.addColorStop(1, '#0b1730');
  ctx.fillStyle = g; ctx.fillRect(X0, top, W, h);
  ctx.fillStyle = '#8ca86b'; ctx.fillRect(X0, top + h - 14, 120, 14);
  const xa = X0 + 60, xb = X1 - 90, ya = top + h - 30, yb = top + 46;
  const pos = (u) => ({ x: xa + (xb - xa) * u ** 1.6, y: ya - (ya - yb) * (1 - (1 - u) ** 2), a: Math.atan2(-2 * (1 - u) * (ya - yb), 1.6 * Math.max(u, 0.004) ** 0.6 * (xb - xa)) });
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([5, 6]); ctx.beginPath();
  for (let k = 0; k <= 40; k++) { const p = pos(k / 40); k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); } ctx.stroke(); ctx.setLineDash([]);
  const u = Math.min(1, mod1(t / 10) * 10 / 8.2), seps = [0.36, 0.68];
  const pad = { x: X0 + 70, y: top + h - 14 };
  ctx.fillStyle = '#495057'; ctx.fillRect(pad.x - 22, pad.y - 3, 44, 5);
  label(ctx, 'ฐานลงจอด', pad.x, pad.y + 8, { size: 12, wt: 600, color: '#fff' });
  seps.forEach((us, k) => {
    if (u < us) return;
    const p = pos(us), d = u - us;
    let x, y, a, al = 1, flame = 0;
    if (k === 0) {
      const f = smooth(0, 0.5, d), lift = Math.sin(Math.PI * f) * 60;
      x = lerp(p.x - Math.cos(p.a) * 30, pad.x, f); y = lerp(p.y - Math.sin(p.a) * 30, pad.y - 22, f) - lift;
      a = lerp(p.a, -Math.PI / 2, smooth(0, 0.3, d)); flame = d > 0.32 && d < 0.5 ? 0.5 + 0.3 * Math.sin(t * 30) : 0;
    } else {
      al = clamp(1 - d * 2.2, 0, 1); if (al <= 0) return;
      x = p.x - Math.cos(p.a) * (30 + d * 60); y = p.y - Math.sin(p.a) * (30 + d * 60) + d * d * 500; a = p.a + d * 3.5;
    }
    ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.rotate(a);
    const part = [[-52, -12, 9], [-12, 18, 7.5]][k];
    ctx.translate(-(part[0] + part[1]) / 2, 0);
    if (flame) { ctx.fillStyle = 'rgba(255,169,77,0.9)'; ctx.beginPath(); ctx.moveTo(part[0], -5); ctx.lineTo(part[0] - 12 - flame * 8, 0); ctx.lineTo(part[0], 5); ctx.closePath(); ctx.fill(); }
    if (k === 0 && d > 0.25) { ctx.strokeStyle = '#343a40'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(part[0] + 6, -9); ctx.lineTo(part[0] - 4, -15); ctx.moveTo(part[0] + 6, 9); ctx.lineTo(part[0] - 4, 15); ctx.stroke(); }
    ctx.beginPath(); ctx.rect(part[0], -20, part[1] - part[0], 40); ctx.clip();
    D_rocketBody(ctx, k, 0);
    ctx.restore();
  });
  const from = u >= seps[1] ? 2 : u >= seps[0] ? 1 : 0, p = pos(u);
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
  ctx.translate(from === 0 ? 0 : from === 1 ? -14 : -28, 0);
  D_rocketBody(ctx, from, u < 1 ? 0.6 + 0.4 * Math.sin(t * 30) : 0);
  ctx.restore();
  const tag = (us, txt, dx, dy, on) => { const q = pos(us); label(ctx, txt, q.x + dx, q.y + dy, { size: 14, wt: 700, color: on ? '#fff' : 'rgba(255,255,255,0.55)', bg: on ? rgba(th.a, 0.85) : 'rgba(11,23,48,0.45)', pad: 5 }); };
  tag(0.36, '① ท่อนแรกแยกตัว บินกลับลงจอด (แบบ Falcon 9)', 40, 34, u >= 0.36);
  tag(0.68, '② ท่อนที่ 2 สลัดทิ้ง', 40, 40, u >= 0.68);
  tag(1, '③ ส่วนบรรทุก (payload) เข้าวงโคจร', -70, 34, u >= 0.98);
  ctx.restore();
  ctx.strokeStyle = 'rgba(40,55,80,0.3)'; ctx.lineWidth = 2; rr(ctx, X0, top, W, h, 14); ctx.stroke();
  label(ctx, 'สลัดท่อนที่หมดเชื้อเพลิง → มวลน้อยลง เร่งได้มากขึ้น · นำท่อนแรกกลับมาใช้ซ้ำช่วยลดต้นทุน', P.cx, top + h + 22, { size: 16, wt: 600, color: C.soft });
}

// ============================================================ 30 · altitude, period and speed (Kepler III)
const D_PRESET = [[400, 'ISS'], [20200, 'GPS'], [35786, 'GEO']];
function D_orbit(alt) { const r = (D_RE + alt) * 1000, T = 2 * Math.PI * Math.sqrt(r ** 3 / D_GM); return { T, v: Math.sqrt(D_GM / r) / 1000 }; }
function D_hm(T) { const m = Math.round(T / 60), h = Math.floor(m / 60); return h ? `${h} ชม. ${m % 60} นาที` : `${m} นาที`; }
function D_class(alt) {
  if (alt <= 2000) return ['LEO · วงโคจรต่ำ', 'เช่น ISS (400 กม.) ดาวเทียมถ่ายภาพ THEOS-2', '#63e6be'];
  if (Math.abs(alt - 35786) < 300) return ['GEO · วงโคจรค้างฟ้า', 'เช่น ไทยคม Himawari อยู่นิ่งเหนือจุดเดิมบนโลก', '#ffa94d'];
  if (alt < 35786) return ['MEO · วงโคจรปานกลาง', 'เช่น ดาวเทียมนำทาง GPS (20,200 กม.)', '#74c0fc'];
  return ['สูงกว่า GEO', 'โคจรช้ากว่าที่โลกหมุน จึงค่อย ๆ เลื่อนไปทางตะวันตก', '#da77f2'];
}
function D_dOrbits(ctx, t, P) {
  const { X0, X1, cx, th, st } = P;
  const W = X1 - X0, bot = D_TOP + D_H, ey = 452, Re = 44, rMax = 336, k = 0.46;
  const aToR = (a) => Re + (rMax - Re) * Math.sqrt(a / 40000);
  const rToA = (r) => 40000 * clamp((r - Re) / (rMax - Re), 0, 1) ** 2;
  const alt = st.alt, { T, v } = D_orbit(alt), [cName, cEx, cCol] = D_class(alt);
  const SPEED = 1440;
  const ang = -phaseAdvance(st, 'ph', t, 2 * Math.PI * SPEED / T);
  const spin = -phaseAdvance(st, 'pe', t, 2 * Math.PI * SPEED / 86164) + 1.2;
  const gps = -phaseAdvance(st, 'pg', t, 2 * Math.PI * SPEED / D_orbit(20200).T) + 2.4;
  const pt = (r, a) => [cx + r * Math.cos(a), ey + r * k * Math.sin(a)];
  const half = (r, back, col, w, dash) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.ellipse(cx, ey, r, r * k, 0, back ? Math.PI : 0, back ? 2 * Math.PI : Math.PI); ctx.stroke(); ctx.setLineDash([]);
  };
  const sat = (r, a, s, col, front) => { if ((Math.sin(a) >= 0) === front) { const [x, y] = pt(r, a); if (!front && Math.abs(x - cx) < Re && y < ey + Re) return; D_sat(ctx, x, y, s, col); } };
  ctx.save(); rr(ctx, X0, D_TOP, W, D_H, 16); ctx.clip();
  D_space(ctx, X0, D_TOP, W, D_H, t);
  // LEO band, reference rings
  ctx.fillStyle = 'rgba(99,230,190,0.14)'; ctx.beginPath(); ctx.ellipse(cx, ey, aToR(2000), aToR(2000) * k, 0, 0, Math.PI * 2); ctx.ellipse(cx, ey, aToR(160), aToR(160) * k, 0, 0, Math.PI * 2, true); ctx.fill('evenodd');
  const rings = [[20200, '#74c0fc'], [35786, '#ffa94d']];
  for (const [a, col] of rings) half(aToR(a), true, rgba(col, 0.5), 2, [7, 7]);
  half(aToR(alt), true, rgba(cCol, 0.55), 3);
  sat(aToR(20200), gps, 6, '#a5d8ff', false); sat(aToR(35786), spin, 6, '#ffc078', false); sat(aToR(alt), ang, 9, '#ffd43b', false);
  // Earth with a ground pin that turns once per sidereal day
  D_earth(ctx, cx, ey, Re);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx, ey, Re, Re * k, 0, 0, Math.PI); ctx.stroke();
  if (Math.sin(spin) >= 0) { const [px, py] = pt(Re, spin); circle(ctx, px, py, 4.5, '#ff6b6b'); }
  for (const [a, col] of rings) half(aToR(a), false, rgba(col, 0.6), 2, [7, 7]);
  half(aToR(alt), false, rgba(cCol, 0.9), 3);
  if (Math.sin(spin) >= 0) { const [gx, gy] = pt(aToR(35786), spin), [px, py] = pt(Re, spin); ctx.strokeStyle = 'rgba(255,192,120,0.55)'; ctx.setLineDash([3, 5]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]); }
  sat(aToR(20200), gps, 6, '#a5d8ff', true); sat(aToR(35786), spin, 6, '#ffc078', true);
  // the reader's satellite: trail, radial line, body
  const r = aToR(alt);
  ctx.strokeStyle = rgba(cCol, 0.9); ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(cx, ey, r, r * k, 0, ang, ang + 0.5); ctx.stroke();
  const [sx, sy] = pt(r, ang);
  if (Math.sin(ang) >= 0) {
    const [ex2, ey2] = pt(Re, ang);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(ex2, ey2); ctx.lineTo(sx, sy); ctx.stroke(); ctx.setLineDash([]);
  }
  sat(r, ang, 9, '#ffd43b', true);
  if (Math.sin(ang) >= 0 || Math.abs(sx - cx) > Re + 14) {
    glow(ctx, sx, sy, 30, 'rgba(255,212,59,0.35)');
    const ux = (sx - cx) / (r || 1), uy = (sy - ey) / (r * k || 1);
    arrow(ctx, sx + ux * 26, sy + uy * 26 * k, sx + ux * 50, sy + uy * 50 * k, { color: 'rgba(255,255,255,0.8)', w: 3, head: 10 });
    arrow(ctx, sx - ux * 26, sy - uy * 26 * k, sx - ux * 46, sy - uy * 46 * k, { color: 'rgba(255,255,255,0.8)', w: 3, head: 10 });
  }
  // labels and the altitude axis
  label(ctx, 'GPS 20,200 กม.', cx + aToR(20200) * 0.42, ey - aToR(20200) * k * 0.91 - 12, { size: 14, wt: 700, color: '#a5d8ff' });
  label(ctx, 'GEO 35,786 กม.', cx - aToR(35786) * 0.55, ey - aToR(35786) * k * 0.84 - 12, { size: 14, wt: 700, color: '#ffc078' });
  label(ctx, 'LEO', cx + aToR(1000) + 4, ey - 4, { size: 13, wt: 700, color: '#63e6be', align: 'left' });
  label(ctx, '● ประเทศไทยบนโลกที่หมุน', X0 + 18, D_TOP + 26, { size: 14, wt: 600, color: '#ffa8a8', align: 'left' });
  label(ctx, 'ภาพเร่ง 1 วินาที = 24 นาที', X1 - 18, D_TOP + 26, { size: 14, wt: 600, color: 'rgba(255,255,255,0.7)', align: 'right' });
  ctx.fillStyle = 'rgba(8,16,34,0.8)'; ctx.fillRect(X0, bot - 40, W, 40);
  label(ctx, '← ใกล้โลก: เร็ว คาบสั้น', X0 + 18, bot - 20, { size: 15, wt: 700, color: '#63e6be', align: 'left' });
  label(ctx, 'ไกลโลก: ช้า คาบยาว →', X1 - 18, bot - 20, { size: 15, wt: 700, color: '#ffc078', align: 'right' });
  label(ctx, 'ระยะไม่ตามมาตราส่วน', cx, bot - 20, { size: 13, wt: 500, color: 'rgba(255,255,255,0.55)' });
  ctx.restore();
  D_frame(ctx, X0, D_TOP, W, D_H);
  P.zones.push({
    x: X0, y: D_TOP, w: W, h: D_H, cursor: 'grab', drag: (px, py) => {
      if (px < 0) return;
      const dx = px - cx, dy = (py - ey) / k, a = clamp(rToA(Math.hypot(dx, dy)), 200, 40000);
      const snap = D_PRESET.find(([p]) => Math.abs(a - p) < 120 + p * 0.03);
      st.alt = snap ? snap[0] : Math.round(a / 10) * 10;
      st.ph = -Math.atan2(dy, dx); st._ltph = undefined;
    },
  });
  hint(ctx, P, 'ลากดาวเทียมสีเหลืองออกห่างหรือเข้าใกล้โลก', bot + 22);
  // readout
  const ry = bot + 46;
  D_box(ctx, X0, ry, W, 100, th.a);
  label(ctx, `สูง ${D_fmt(alt)} กม.`, X0 + 22, ry + 28, { size: 23, wt: 700, align: 'left', fam: F.display });
  label(ctx, `คาบ ${D_hm(T)} · ${v.toFixed(2)} กม./วินาที`, X1 - 18, ry + 28, { size: 22, wt: 700, color: th.a, align: 'right', fam: F.display });
  label(ctx, cName, X0 + 22, ry + 70, { size: 20, wt: 700, color: mix(cCol, '#25303a', 0.45), align: 'left' });
  label(ctx, cEx, X1 - 18, ry + 70, { size: 16, wt: 500, color: C.soft, align: 'right' });
  D_keplerChart(ctx, P, ry + 124, alt);
}
function D_keplerChart(ctx, P, y0, alt) {
  const { X0, X1, th } = P;
  stitle(ctx, 'ข. ยิ่งสูง ยิ่งช้า และคาบยิ่งยาว (กฎข้อที่ 3 ของเคปเลอร์)', X0, y0, th);
  const gx0 = X0 + 56, gx1 = X1 - 56, gy0 = y0 + 60, gy1 = y0 + 200;
  const X = (a) => lerp(gx0, gx1, a / 40000), YT = (T) => lerp(gy1, gy0, T / 28), YV = (v) => lerp(gy1, gy0, v / 8);
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
  ctx.strokeStyle = 'rgba(37,48,58,0.4)'; ctx.lineWidth = 1.5; ctx.strokeRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
  for (const a of [0, 10000, 20000, 30000, 40000]) label(ctx, D_fmt(a), X(a), gy1 + 14, { size: 12, wt: 600, color: C.soft });
  label(ctx, 'ความสูง (กม.)', (gx0 + gx1) / 2, gy1 + 34, { size: 13, wt: 600, color: C.soft });
  for (const T of [0, 12, 24]) label(ctx, String(T), gx0 - 8, YT(T), { size: 12, wt: 700, color: th.a, align: 'right' });
  for (const v of [0, 4, 8]) label(ctx, String(v), gx1 + 8, YV(v), { size: 12, wt: 700, color: '#1971c2', align: 'left' });
  label(ctx, 'คาบ (ชม.)', gx0 - 50, gy0 - 14, { size: 13, wt: 700, color: th.a, align: 'left' });
  label(ctx, 'ความเร็ว (กม./วินาที)', gx1 + 50, gy0 - 14, { size: 13, wt: 700, color: '#1971c2', align: 'right' });
  for (const [key, col, dash] of [['T', th.a, null], ['v', '#1971c2', [8, 6]]]) {
    ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.setLineDash(dash || []); ctx.beginPath();
    for (let a = 0; a <= 40000; a += 800) { const o = D_orbit(a), yy = key === 'T' ? YT(o.T / 3600) : YV(o.v); a ? ctx.lineTo(X(a), yy) : ctx.moveTo(X(a), yy); }
    ctx.stroke(); ctx.setLineDash([]);
  }
  for (const [a, n] of D_PRESET) { const o = D_orbit(a); circle(ctx, X(a), YT(o.T / 3600), 4.5, th.a); label(ctx, n, X(a) + (a > 30000 ? -10 : 10), YT(o.T / 3600) - 14, { size: 12, wt: 700, color: th.a, align: a > 30000 ? 'right' : 'left' }); }
  const o = D_orbit(alt);
  ctx.strokeStyle = 'rgba(37,48,58,0.5)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(alt), gy0); ctx.lineTo(X(alt), gy1); ctx.stroke(); ctx.setLineDash([]);
  circle(ctx, X(alt), YT(o.T / 3600), 7, '#ffd43b'); ctx.strokeStyle = th.a; ctx.lineWidth = 2.5; ring(ctx, X(alt), YT(o.T / 3600), 7);
  circle(ctx, X(alt), YV(o.v), 7, '#ffd43b'); ctx.strokeStyle = '#1971c2'; ring(ctx, X(alt), YV(o.v), 7);
}

// ============================================================ 32 · satellite services + spin-off cards
const D_SERV = [
  { name: 'นำทาง (GPS / GNSS)', orbit: 'MEO', sat: 'ดาวเทียม GPS, Galileo, BeiDou', use: 'บอกตำแหน่งรถ เส้นทาง และเวลา', ground: 'เมือง' },
  { name: 'พยากรณ์อากาศ', orbit: 'GEO', sat: 'ดาวเทียม Himawari-9', use: 'ภาพเมฆทุก 10 นาที ติดตามพายุ', ground: 'ทะเล' },
  { name: 'สำรวจการเกษตร · ภัยพิบัติ', orbit: 'LEO', sat: 'ดาวเทียม THEOS-2', use: 'ภาพละเอียด ดูพืชผล น้ำท่วม ไฟป่า', ground: 'ไร่นา' },
  { name: 'สื่อสาร · โทรทัศน์', orbit: 'GEO', sat: 'ดาวเทียมไทยคม', use: 'ส่งสัญญาณทีวี อินเทอร์เน็ต การแพทย์ทางไกล', ground: 'หมู่บ้าน' },
];
const D_LEVELS = [['LEO', 64, 'LEO · ต่ำ 160–2,000 กม.'], ['MEO', 172, 'MEO · ≈20,200 กม.'], ['GEO', 286, 'GEO · 35,786 กม.']];
const D_CARDS = [
  ['โฟมจำรูป', 'memory foam', 'เบาะลดแรงกระแทกของที่นั่งนักบิน', 'ที่นอน หมอน พื้นรองเท้า'],
  ['เซนเซอร์ภาพ CMOS', 'image sensor', 'กล้องจิ๋วกินไฟน้อยบนยานอวกาศ', 'กล้องโทรศัพท์มือถือ'],
  ['ระบบกรองน้ำ', 'water purification', 'รีไซเคิลน้ำดื่มบนสถานีอวกาศ', 'เครื่องกรองน้ำในบ้านและพื้นที่ภัยพิบัติ'],
  ['เทอร์โมมิเตอร์วัดไข้ทางหู', 'infrared thermometer', 'เซนเซอร์อินฟราเรดวัดอุณหภูมิดาว', 'วัดไข้ได้ในไม่กี่วินาที'],
  ['เครื่องมือไร้สาย', 'cordless tools', 'สว่านแบตเตอรี่เจาะหินดวงจันทร์', 'สว่าน เครื่องดูดฝุ่นไร้สาย'],
  ['อาหารแห้งเยือกแข็ง', 'freeze-dried food', 'อาหารเบา เก็บได้นาน ให้นักบินอวกาศ', 'อาหารสำเร็จรูป อาหารเดินป่า'],
];
function D_dServices(ctx, t, P) {
  const { X0, X1, cx, th, st } = P;
  const W = X1 - X0, bot = D_TOP + D_H, Rg = 1500, gC = 590 + Rg;
  const gy = (x) => gC - Math.sqrt(Rg * Rg - (x - cx) ** 2);
  st.h = lerp(st.h, st.hT, 0.18);
  const sr = Rg + st.h, sx = cx + sr * Math.sin(st.a), sy = gC - sr * Math.cos(st.a);
  const subx = cx + Rg * Math.sin(st.a), reg = clamp(Math.floor((subx - X0) / (W / 4)), 0, 3);
  const lvl = D_LEVELS.reduce((b, L) => (Math.abs(L[1] - st.h) < Math.abs(b[1] - st.h) ? L : b));
  st.lit = st.lit.map((v, i) => lerp(v, i === reg ? 1 : 0, 0.12));
  ctx.save(); rr(ctx, X0, D_TOP, W, D_H, 16); ctx.clip();
  D_space(ctx, X0, D_TOP, W, D_H, t);
  ctx.lineWidth = 2;
  for (const [n, h, txt] of D_LEVELS) {
    const on = n === lvl[0];
    ctx.strokeStyle = on ? 'rgba(255,212,59,0.75)' : 'rgba(255,255,255,0.22)'; ctx.setLineDash([7, 7]);
    ctx.beginPath(); ctx.arc(cx, gC, Rg + h, -Math.PI / 2 - 0.3, -Math.PI / 2 + 0.3); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, txt, X1 - 14, gy(X1 - 14) - h - 14, { size: 14, wt: 700, color: on ? '#ffe066' : 'rgba(255,255,255,0.6)', align: 'right' });
  }
  // atmosphere glow + ground regions
  const ag = ctx.createRadialGradient(cx, gC, Rg, cx, gC, Rg + 40); ag.addColorStop(0, 'rgba(116,192,252,0.55)'); ag.addColorStop(1, 'rgba(116,192,252,0)');
  ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, gC, Rg + 40, 0, Math.PI * 2); ctx.fill();
  const cols = ['#6b8f5a', '#2f78ad', '#7ea04d', '#8a9a5b'];
  for (let i = 0; i < 4; i++) {
    const xa = X0 + i * W / 4, xb = xa + W / 4;
    ctx.beginPath(); ctx.moveTo(xa, bot); for (let x = xa; x <= xb + 0.5; x += 8) ctx.lineTo(x, gy(x)); ctx.lineTo(xb, bot); ctx.closePath();
    ctx.fillStyle = cols[i]; ctx.fill();
    ctx.fillStyle = `rgba(255,236,153,${0.28 * st.lit[i]})`; ctx.fill();
  }
  D_ground(ctx, t, P, gy, st.lit);
  // footprint cone, wider when higher
  const fw = 30 + st.h * 0.72, a0 = st.a - fw / Rg, a1 = st.a + fw / Rg;
  ctx.fillStyle = 'rgba(255,224,102,0.16)'; ctx.beginPath(); ctx.moveTo(sx, sy);
  for (let k = 0; k <= 12; k++) { const a = lerp(a1, a0, k / 12); ctx.lineTo(cx + Rg * Math.sin(a), gC - Rg * Math.cos(a)); }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,224,102,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
  for (let k = 0; k < 3; k++) { const f = mod1(t * 0.8 + k / 3), wy = lerp(sy + 14, gy(subx) - 6, f); ctx.strokeStyle = `rgba(255,224,102,${0.7 * (1 - f)})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(sx, sy, Math.hypot(subx - sx, wy - sy), Math.PI / 2 - 0.12, Math.PI / 2 + 0.12); ctx.stroke(); }
  glow(ctx, sx, sy, 34, 'rgba(255,212,59,0.4)');
  D_sat(ctx, sx, sy, 10, '#ffd43b', st.a);
  arrow(ctx, sx - 30, sy, sx - 52, sy, { color: 'rgba(255,255,255,0.75)', w: 3, head: 10 });
  arrow(ctx, sx + 30, sy, sx + 52, sy, { color: 'rgba(255,255,255,0.75)', w: 3, head: 10 });
  arrow(ctx, sx, sy - 20, sx, sy - 40, { color: 'rgba(255,255,255,0.75)', w: 3, head: 10 });
  for (let i = 0; i < 4; i++) label(ctx, D_SERV[i].ground, X0 + (i + 0.5) * W / 4, bot - 16, { size: 15, wt: 700, color: '#fff', bg: rgba('#0b1730', 0.35 + 0.4 * st.lit[i]), pad: 5 });
  label(ctx, 'ภาพจำลอง ไม่ตามมาตราส่วน', X0 + 14, D_TOP + 22, { size: 13, wt: 500, color: 'rgba(255,255,255,0.55)', align: 'left' });
  ctx.restore();
  D_frame(ctx, X0, D_TOP, W, D_H);
  P.zones.push({
    x: X0, y: D_TOP, w: W, h: D_H, cursor: 'grab', drag: (px, py, ph) => {
      if (ph === 'end') { st.hT = D_LEVELS.reduce((b, L) => (Math.abs(L[1] - st.h) < Math.abs(b[1] - st.h) ? L : b))[1]; return; }
      const dx = px - cx, dy = gC - py;
      st.a = clamp(Math.atan2(dx, dy), -0.235, 0.235);
      st.hT = st.h = clamp(Math.hypot(dx, dy) - Rg, 40, 300);
    },
  });
  hint(ctx, P, 'ลากดาวเทียมซ้าย-ขวาเหนือพื้นที่ต่าง ๆ หรือขึ้น-ลงเปลี่ยนวงโคจร', bot + 22);
  // readout
  const s = D_SERV[reg], ok = s.orbit === lvl[0], ry = bot + 46;
  D_box(ctx, X0, ry, W, 94, th.a);
  label(ctx, s.name, X0 + 22, ry + 26, { size: 22, wt: 700, color: th.a, align: 'left', fam: F.display });
  label(ctx, s.sat, X1 - 18, ry + 26, { size: 16, wt: 600, color: C.soft, align: 'right' });
  label(ctx, s.use, X0 + 22, ry + 64, { size: 16, wt: 500, color: C.ink, align: 'left' });
  label(ctx, ok ? `✓ อยู่วงโคจร ${s.orbit} เหมาะกับงานนี้` : `ปกติงานนี้ใช้วงโคจร ${s.orbit} · ลองลากไป`, X1 - 18, ry + 64, { size: 16, wt: 700, color: ok ? '#2b8a3e' : '#c2410c', align: 'right' });
  D_cardsGrid(ctx, t, P, ry + 112);
}
function D_ground(ctx, t, P, gy, lit) {
  const { X0, X1 } = P, W = X1 - X0, q = W / 4;
  // city: road, buildings, car with route
  const c0 = X0 + 14, c1 = X0 + q - 10;
  for (let k = 0; k < 6; k++) { const bx = c0 + 8 + k * 28, bh = 18 + ((k * 37) % 5) * 7; ctx.fillStyle = k % 2 ? '#c9d1d9' : '#adb5bd'; ctx.fillRect(bx, gy(bx) - bh + 4, 18, bh); }
  ctx.strokeStyle = '#495057'; ctx.lineWidth = 9; ctx.beginPath(); for (let x = c0; x <= c1; x += 8) x === c0 ? ctx.moveTo(x, gy(x) + 16) : ctx.lineTo(x, gy(x) + 16); ctx.stroke();
  if (lit[0] > 0.05) { ctx.strokeStyle = `rgba(77,171,247,${lit[0]})`; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); for (let x = c0; x <= c1; x += 8) x === c0 ? ctx.moveTo(x, gy(x) + 16) : ctx.lineTo(x, gy(x) + 16); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; }
  const carx = lerp(c0 + 6, c1 - 24, mod1(t * 0.12)), cary = gy(carx) + 12;
  ctx.fillStyle = '#e03131'; rr(ctx, carx, cary - 6, 22, 10, 3); ctx.fill();
  if (lit[0] > 0.05) {
    const pin = c1 - 14, py = gy(pin) - 2 - 4 * Math.abs(Math.sin(t * 3));
    ctx.fillStyle = `rgba(250,82,82,${lit[0]})`; ctx.beginPath(); ctx.arc(pin, py - 12, 7, Math.PI, 0); ctx.lineTo(pin, py); ctx.closePath(); ctx.fill();
    circle(ctx, pin, py - 12, 2.5, '#fff');
  }
  // sea: clouds, a typhoon spiral when lit
  const s0 = X0 + q, sxm = s0 + q / 2;
  for (let k = 0; k < 4; k++) { const wx = s0 + 16 + k * 44; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(wx + 8 * Math.sin(t + k), gy(wx) + 26, 8, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  const cy0 = gy(sxm) - 22;
  for (let k = 0; k < 3; k++) { const x = s0 + 40 + mod1(k * 0.33 + t * 0.03) * (q - 80); circle(ctx, x, cy0 + (k % 2) * 8, 11, 'rgba(255,255,255,0.8)'); circle(ctx, x + 12, cy0 + 4 + (k % 2) * 8, 8, 'rgba(255,255,255,0.8)'); }
  if (lit[1] > 0.05) {
    ctx.save(); ctx.translate(sxm, cy0 + 10); ctx.rotate(-t * 1.5); ctx.globalAlpha = lit[1];
    for (const [r, col] of [[30, 'rgba(105,219,124,0.55)'], [20, 'rgba(255,212,59,0.7)'], [10, 'rgba(250,82,82,0.8)']]) { ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2.5;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); for (let u = 0; u <= 1; u += 0.1) { const a = k * 2.09 + u * 3, r = 4 + u * 30; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.6); } ctx.stroke(); }
    ctx.restore();
  }
  // farmland: field strips, NDVI colours and a scan line when lit
  const f0 = X0 + 2 * q + 6, fw = (q - 12) / 6;
  for (let k = 0; k < 6; k++) {
    const x = f0 + k * fw, base = gy(x + fw / 2);
    const ndvi = ['#2b8a3e', '#94d82d', '#fab005', '#2f9e44', '#e8590c', '#74b816'][k];
    ctx.fillStyle = lit[2] > 0.5 ? ndvi : k % 2 ? '#a9c46c' : '#c9b36a';
    ctx.fillRect(x + 1, base + 6, fw - 2, 30);
    ctx.strokeStyle = 'rgba(60,70,30,0.35)'; ctx.lineWidth = 1; for (let j = 1; j < 4; j++) { ctx.beginPath(); ctx.moveTo(x + 2, base + 6 + j * 7.5); ctx.lineTo(x + fw - 2, base + 6 + j * 7.5); ctx.stroke(); }
  }
  if (lit[2] > 0.05) { const lx = f0 + mod1(t * 0.35) * (q - 12); ctx.fillStyle = `rgba(255,255,255,${0.6 * lit[2]})`; ctx.fillRect(lx, gy(lx) + 2, 3, 38); }
  // village: houses with dishes, TV glowing when lit
  const v0 = X0 + 3 * q + 16;
  for (let k = 0; k < 3; k++) {
    const hx = v0 + k * 54, base = gy(hx + 16) + 4;
    ctx.fillStyle = '#e9ecef'; ctx.fillRect(hx, base, 32, 22);
    ctx.fillStyle = '#c92a2a'; ctx.beginPath(); ctx.moveTo(hx - 4, base); ctx.lineTo(hx + 16, base - 14); ctx.lineTo(hx + 36, base); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lit[3] > 0.05 ? `rgba(116,192,252,${0.4 + 0.6 * lit[3] * (0.7 + 0.3 * Math.sin(t * 6 + k))})` : '#495057'; ctx.fillRect(hx + 8, base + 6, 16, 10);
    ctx.strokeStyle = '#dee2e6'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(hx + 28, base - 10, 7, Math.PI * 0.85, Math.PI * 1.85); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx + 28, base - 8); ctx.lineTo(hx + 28, base); ctx.stroke();
    if (lit[3] > 0.05) for (let j = 0; j < 2; j++) { const f = mod1(t * 0.9 + j * 0.5 + k * 0.2); ctx.strokeStyle = `rgba(255,224,102,${lit[3] * (1 - f)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx + 31, base - 13, 6 + f * 18, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke(); }
  }
}
function D_cardsGrid(ctx, t, P, y0) {
  const { X0, X1, th, st } = P, W = X1 - X0, gap = 12, cw = (W - 2 * gap) / 3, ch = 104;
  stitle(ctx, 'ข. ผลพลอยได้ (spin-off) จากงานอวกาศ · แตะการ์ดเพื่อพลิก', X0, y0, th);
  D_CARDS.forEach(([name, en, space, life], i) => {
    const x = X0 + (i % 3) * (cw + gap), y = y0 + 40 + Math.floor(i / 3) * (ch + gap);
    st.fa[i] = lerp(st.fa[i], st.flip[i] ? 1 : 0, 0.16);
    const sc = Math.cos(st.fa[i] * Math.PI), back = st.fa[i] > 0.5;
    ctx.save(); ctx.translate(x + cw / 2, y + ch / 2); ctx.scale(Math.max(0.02, Math.abs(sc)), 1); ctx.translate(-cw / 2, -ch / 2);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; rr(ctx, 2, 4, cw, ch, 12); ctx.fill();
    ctx.fillStyle = back ? '#f3fbf9' : '#fff'; rr(ctx, 0, 0, cw, ch, 12); ctx.fill();
    ctx.strokeStyle = rgba(th.a, back ? 0.7 : 0.35); ctx.lineWidth = 2; rr(ctx, 0, 0, cw, ch, 12); ctx.stroke();
    if (!back) {
      ctx.fillStyle = th.a; rr(ctx, 0, 0, cw, 8, 4); ctx.fill();
      label(ctx, name, cw / 2, 40, { size: 18, wt: 700, color: C.ink, fam: F.display });
      label(ctx, en, cw / 2, 66, { size: 14, wt: 500, color: C.soft });
      label(ctx, 'แตะเพื่อพลิก', cw / 2, 90, { size: 13, wt: 600, color: th.a });
    } else {
      label(ctx, 'ในอวกาศใช้เพื่อ', 12, 18, { size: 13, wt: 700, color: th.a, align: 'left' });
      para(ctx, space, 12, 28, cw - 22, 14, { lh: 19, color: C.ink });
      label(ctx, '→ ในชีวิตประจำวัน', 12, 68, { size: 13, wt: 700, color: '#c2410c', align: 'left' });
      para(ctx, life, 12, 76, cw - 22, 14, { lh: 19, color: C.ink, wt: 600 });
    }
    ctx.restore();
    P.zones.push({ x, y, w: cw, h: ch, cursor: 'pointer', click: () => { st.flip[i] = !st.flip[i]; } });
  });
}

// ============================================================ 34 · Earth's interior, probe + seismic rays
const D_CMB = 3480;
const D_RK = [[0, 0], [1221, 65], [3480, 185.7], [6021, 300], [6271, 324], [6371, 340]];
const D_rpx = (r) => { for (let i = 1; i < D_RK.length; i++) if (r <= D_RK[i][0]) return lerp(D_RK[i - 1][1], D_RK[i][1], (r - D_RK[i - 1][0]) / (D_RK[i][0] - D_RK[i - 1][0])); return 340; };
const D_rkm = (p) => { for (let i = 1; i < D_RK.length; i++) if (p <= D_RK[i][1]) return lerp(D_RK[i - 1][0], D_RK[i][0], (p - D_RK[i - 1][1]) / (D_RK[i][1] - D_RK[i - 1][1])); return D_RE; };
const D_pw = (tab, d) => { for (let i = 1; i < tab.length; i++) if (d <= tab[i][0]) return lerp(tab[i - 1][1], tab[i][1], (d - tab[i - 1][0]) / ((tab[i][0] - tab[i - 1][0]) || 1)); return tab[tab.length - 1][1]; };
const D_VP_M = [[0, 6], [35, 8], [410, 8.9], [660, 10], [700, 10.8], [2891, 13.7]], D_VP_C = [[2891, 8], [5150, 10.3], [6371, 11.2]];
const D_VS_M = [[0, 3.5], [35, 4.5], [410, 4.8], [660, 5.6], [700, 6], [2891, 7.3]];
const D_vel = (type, r) => { const d = D_RE - r; if (r >= D_CMB) return D_pw(type === 'P' ? D_VP_M : D_VS_M, d); return type === 'P' ? D_pw(D_VP_C, d) : 0; };
function D_trace(type, alpha) {
  let x = -D_RE + 1, y = 0, nx = Math.cos(alpha), ny = Math.sin(alpha), tt = 0, end = 'surface';
  const ds = 15, pts = [[x, y, 0]];
  for (let k = 0; k < 3000; k++) {
    const r = Math.hypot(x, y), v = D_vel(type, r), side = r >= D_CMB;
    const ra = side ? Math.max(r - 1, D_CMB) : Math.min(r + 1, D_CMB - 0.001), rb = side ? r + 1 : Math.max(r - 1, 0.1);
    const dv = (D_vel(type, Math.max(ra, rb)) - D_vel(type, Math.min(ra, rb))) / (Math.abs(ra - rb) || 1);
    const gx = dv * x / r, gy = dv * y / r, dot = gx * nx + gy * ny;
    let mx = nx - ds * (gx - dot * nx) / v, my = ny - ds * (gy - dot * ny) / v; const m = Math.hypot(mx, my); mx /= m; my /= m;
    let X = x + mx * ds, Y = y + my * ds; const r2 = Math.hypot(X, Y);
    if ((r2 >= D_CMB) !== side) {
      const v2 = D_vel(type, side ? D_CMB - 1 : D_CMB + 1);
      if (v2 === 0) { pts.push([X, Y, tt + ds / v]); end = 'stop'; break; }
      const ux = X / r2, uy = Y / r2, cn = mx * ux + my * uy, tx = mx - cn * ux, ty = my - cn * uy, sinI = Math.hypot(tx, ty), s2 = sinI * v2 / v;
      if (s2 >= 1) { mx -= 2 * cn * ux; my -= 2 * cn * uy; X = x; Y = y; }
      else { const c2 = Math.sqrt(1 - s2 * s2) * Math.sign(cn), tl = sinI || 1; mx = tx / tl * s2 + ux * c2; my = ty / tl * s2 + uy * c2; }
    }
    tt += ds / v; x = X; y = Y; nx = mx; ny = my;
    if (k % 4 === 0) pts.push([x, y, tt]);
    if (Math.hypot(x, y) >= D_RE) { pts.push([x, y, tt]); break; }
  }
  return { type, pts, end, T: tt };
}
let D_RAYS = null;
function D_rays() {
  if (D_RAYS) return D_RAYS;
  const P = [1.5, 4, 6.5, 9, 11.5, 13.3, 14.2, 15.5, 17.5, 21, 27, 36, 50], S = [4, 8, 12, 15.2, 16.5, 19, 23, 30, 42];
  D_RAYS = [...P.map(a => D_trace('P', a * D2R)), ...S.map(a => D_trace('S', a * D2R))];
  return D_RAYS;
}
const D_TEMP = [[0, 15], [35, 600], [100, 1300], [350, 1600], [2900, 3700], [5150, 5100], [6371, 5700]];
function D_dens(d) { return d < 2900 ? D_pw([[0, 2.7], [35, 3.3], [350, 3.5], [660, 4.0], [2900, 5.6]], d) : d < 5150 ? D_pw([[2900, 9.9], [5150, 12.2]], d) : D_pw([[5150, 12.8], [6371, 13.1]], d); }
function D_layer(d) {
  const comp = d < 35 ? ['เปลือกโลก (crust)', 'หินแกรนิต (ใต้ทวีป)'] : d < 2900 ? ['เนื้อโลก (mantle)', 'หินเพริโดไทต์ (peridotite)'] : d < 5150 ? ['แก่นโลกชั้นนอก (outer core)', 'เหล็ก-นิกเกิล (Fe–Ni)'] : ['แก่นโลกชั้นใน (inner core)', 'เหล็ก-นิกเกิล (Fe–Ni)'];
  const phys = d < 100 ? ['ธรณีภาค (lithosphere)', 'ของแข็ง แข็งและเปราะ', '#8d6e4f'] : d < 350 ? ['ฐานธรณีภาค (asthenosphere)', 'หลอมบางส่วน ไหลได้ช้า ๆ แบบพลาสติก', '#e8590c'] : d < 2900 ? ['มัชฌิมภาค (mesosphere)', 'ของแข็ง', '#c2410c'] : d < 5150 ? ['แก่นโลกชั้นนอก', 'ของเหลว · คลื่น S ผ่านไม่ได้', '#e67700'] : ['แก่นโลกชั้นใน', 'ของแข็ง (ความดันสูงมาก)', '#d9a400'];
  return { comp, phys };
}
function D_dInterior(ctx, t, P) {
  const { X0, X1, cx, th, st } = P;
  const W = X1 - X0, bot = D_TOP + D_H, cy = 690, d = st.depth;
  const toXY = (r, phi) => [cx + D_rpx(r) * Math.cos(phi), cy - D_rpx(r) * Math.sin(phi)];
  const disc = (r, fill) => { ctx.beginPath(); ctx.arc(cx, cy, D_rpx(r), Math.PI, 0); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  ctx.save(); rr(ctx, X0, D_TOP, W, D_H, 16); ctx.clip();
  const sky = ctx.createLinearGradient(0, D_TOP, 0, bot); sky.addColorStop(0, '#0b1730'); sky.addColorStop(1, '#14254a');
  ctx.fillStyle = sky; ctx.fillRect(X0, D_TOP, W, D_H);
  disc(6371, '#8d6e4f');
  disc(6336, '#a0522d');
  const mg = ctx.createRadialGradient(cx, cy, D_rpx(3480), cx, cy, D_rpx(6271));
  mg.addColorStop(0, '#e8590c'); mg.addColorStop(1, '#b4441c');
  disc(6271, '#d9480f'); disc(6021, mg);
  const og = ctx.createRadialGradient(cx, cy, D_rpx(1221), cx, cy, D_rpx(3480)); og.addColorStop(0, '#ffc046'); og.addColorStop(1, '#f08c00');
  disc(3480, og);
  const ig = ctx.createRadialGradient(cx, cy - 10, 4, cx, cy, D_rpx(1221)); ig.addColorStop(0, '#fff9db'); ig.addColorStop(1, '#ffd43b');
  disc(1221, ig);
  // liquid outer core: slow swirling dots; asthenosphere shimmer
  for (let k = 0; k < 26; k++) { const a = mod1(k * 0.618 + t * 0.02 * (k % 2 ? 1 : -1)) * Math.PI, r = lerp(1500, 3300, mod1(k * 0.37)); const [x, y] = toXY(r, a); circle(ctx, x, y, 2.6, 'rgba(255,255,255,0.45)'); }
  ctx.strokeStyle = `rgba(255,220,150,${0.35 + 0.2 * Math.sin(t * 2)})`; ctx.lineWidth = 2; ctx.setLineDash([5, 7]); ctx.lineDashOffset = -t * 8;
  ctx.beginPath(); ctx.arc(cx, cy, D_rpx(6146), Math.PI, 0); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
  for (const r of [6271, 6021]) { ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(cx, cy, D_rpx(r), Math.PI, 0); ctx.stroke(); }
  ctx.setLineDash([]);
  // seismic rays
  if (st.rays) {
    const tau = mod1(t / 12) * 12 * 2.5 * 60;
    for (const ray of D_rays()) {
      const col = ray.type === 'P' ? '#4dabf7' : '#ff6b6b', pts = ray.pts.map(([x, y, tm]) => { const r = Math.hypot(x, y), a = Math.atan2(y, x); return [...toXY(r, a), tm]; });
      ctx.strokeStyle = rgba(col, 0.25); ctx.lineWidth = 2; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
      const cur = D_at(pts.map(p => [p[0], p[1], p[2]]), tau);
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i <= cur.i; i++) i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(cur.x, cur.y); ctx.stroke();
      if (tau < ray.T) circle(ctx, cur.x, cur.y, 4, '#fff');
      else if (ray.end === 'stop') { const [x, y] = pts[pts.length - 1]; ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5); ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5); ctx.stroke(); }
    }
    const arcZ = (d0, d1, rOff, col) => { ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.arc(cx, cy, 340 + rOff, -(180 - d0) * D2R, -(180 - d1) * D2R); ctx.stroke(); };
    arcZ(104, 140, 8, 'rgba(77,171,247,0.95)'); arcZ(104, 180, 17, 'rgba(255,107,107,0.95)');
    for (const deg of [104, 140]) { const a = (180 - deg) * D2R; label(ctx, deg + '°', cx + 372 * Math.cos(a), cy - 372 * Math.sin(a), { size: 14, wt: 700, color: '#fff' }); }
    const a1 = (180 - 122) * D2R;
    label(ctx, 'เขตเงาคลื่น P', cx + 300 * Math.cos(a1) - 20, cy - 300 * Math.sin(a1) + 20, { size: 14, wt: 700, color: '#fff', bg: 'rgba(28,126,214,0.85)', pad: 4 });
    label(ctx, 'เขตเงาคลื่น S (เกิน 104°)', X1 - 16, cy - 74, { size: 14, wt: 700, color: '#fff', bg: 'rgba(201,42,42,0.85)', pad: 4, align: 'right' });
    const [qx, qy] = toXY(6371, Math.PI);
    circle(ctx, qx + 6, qy - 6, 9, '#ffe066'); label(ctx, 'จุดเกิดแผ่นดินไหว', qx + 4, qy - 28, { size: 13, wt: 700, color: '#ffe066', align: 'left', bg: 'rgba(11,23,48,0.7)', pad: 4 });
  }
  // layer names (composition inside, physical property on the left with leader lines)
  const tag = (txt, r, phi, col = '#fff') => { const [x, y] = toXY(r, phi); label(ctx, txt, x, y, { size: 14, wt: 700, color: col, bg: 'rgba(11,23,48,0.55)', pad: 4 }); };
  tag('แก่นโลกชั้นใน', 1150, Math.PI * 0.88, '#fff3bf');
  tag('แก่นโลกชั้นนอก (ของเหลว)', 2500, Math.PI * 0.62, '#fff3bf');
  tag('เนื้อโลก · มัชฌิมภาค', 4900, Math.PI * 0.66);
  const leads = [['เปลือกโลก (ขยายความหนา)', 6355, 0.78], ['ธรณีภาค 0–100 กม.', 6321, 0.82], ['ฐานธรณีภาค 100–350 กม.', 6146, 0.86]];
  leads.forEach(([txt, r, f], k) => {
    const [x, y] = toXY(r, Math.PI * f), lx = X0 + 16, ly = D_TOP + 26 + k * 28;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx + 196, ly); ctx.stroke();
    circle(ctx, x, y, 3, '#fff');
    label(ctx, txt, lx, ly, { size: 14, wt: 700, color: '#fff', align: 'left', bg: 'rgba(11,23,48,0.6)', pad: 4 });
  });
  // probe on the vertical radius
  const ptop = cy - 340, py = cy - D_rpx(D_RE - d), L = D_layer(d);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, ptop - 26); ctx.lineTo(cx, py); ctx.stroke();
  ctx.fillStyle = '#343a40'; rr(ctx, cx - 14, ptop - 40, 28, 16, 4); ctx.fill();
  glow(ctx, cx, py, 22, 'rgba(255,255,255,0.6)'); circle(ctx, cx, py, 8, '#fff'); ctx.strokeStyle = L.phys[2]; ctx.lineWidth = 3.5; ring(ctx, cx, py, 8);
  arrow(ctx, cx + 22, py - 6, cx + 22, py - 30, { color: 'rgba(255,255,255,0.8)', w: 3, head: 10 });
  arrow(ctx, cx + 22, py + 6, cx + 22, py + 30, { color: 'rgba(255,255,255,0.8)', w: 3, head: 10 });
  label(ctx, `${D_fmt(d)} กม.`, cx + 34, Math.min(py, cy - 36), { size: 15, wt: 700, color: '#25303a', bg: 'rgba(255,255,255,0.92)', pad: 5, align: 'left' });
  label(ctx, 'ผิวโลก ↑', cx - 22, ptop - 30, { size: 13, wt: 700, color: '#fff', align: 'right' });
  label(ctx, 'ศูนย์กลางโลก ↓', cx + 12, cy - 10, { size: 13, wt: 700, color: '#5c3d00', align: 'left' });
  // toggle button
  const bw = 214, bx = X1 - bw - 14, by = D_TOP + 14;
  ctx.fillStyle = st.rays ? '#4dabf7' : 'rgba(255,255,255,0.92)'; rr(ctx, bx, by, bw, 36, 18); ctx.fill();
  label(ctx, st.rays ? '◉ ซ่อนคลื่น P และ S' : '○ แสดงคลื่น P และ S', bx + bw / 2, by + 18, { size: 15, wt: 700, color: st.rays ? '#fff' : '#1864ab' });
  if (st.rays) {
    label(ctx, '— คลื่น P', bx + 10, by + 56, { size: 14, wt: 700, color: '#74c0fc', align: 'left' });
    label(ctx, '— คลื่น S', bx + 110, by + 56, { size: 14, wt: 700, color: '#ff8787', align: 'left' });
  }
  ctx.restore();
  D_frame(ctx, X0, D_TOP, W, D_H);
  P.zones.push({ x: X0, y: D_TOP, w: W, h: D_H, cursor: 'ns-resize', drag: (px, qy) => { if (px >= 0) st.depth = Math.round(clamp(D_RE - D_rkm(clamp(cy - qy, 0, 340)), 0, D_RE)); } });
  P.zones.push({ x: bx, y: by, w: bw, h: 36, cursor: 'pointer', click: () => { st.rays = !st.rays; } });
  hint(ctx, P, 'ลากขึ้น-ลงเพื่อเจาะหัววัดลงไปจนถึงศูนย์กลางโลก', bot + 22);
  // readout
  const ry = bot + 46, T = D_pw(D_TEMP, d);
  D_box(ctx, X0, ry, W, 124, L.phys[2]);
  label(ctx, `ลึก ${D_fmt(d)} กม.`, X0 + 22, ry + 26, { size: 23, wt: 700, align: 'left', fam: F.display });
  label(ctx, `≈ ${D_fmt(T < 300 ? Math.round(T / 5) * 5 : Math.round(T / 50) * 50)} °C · ${D_dens(d).toFixed(1)} g/cm³`, X1 - 18, ry + 26, { size: 21, wt: 700, color: th.a, align: 'right', fam: F.display });
  label(ctx, 'องค์ประกอบ:', X0 + 22, ry + 62, { size: 16, wt: 600, color: C.soft, align: 'left' });
  label(ctx, `${L.comp[0]} · ${L.comp[1]}`, X0 + 124, ry + 62, { size: 17, wt: 700, align: 'left' });
  label(ctx, 'สมบัติเชิงกล:', X0 + 22, ry + 96, { size: 16, wt: 600, color: C.soft, align: 'left' });
  label(ctx, `${L.phys[0]} · ${L.phys[1]}`, X0 + 124, ry + 96, { size: 17, wt: 700, color: mix(L.phys[2], '#25303a', 0.3), align: 'left' });
  D_velChart(ctx, P, ry + 142, d);
}
function D_velChart(ctx, P, y0, depth) {
  const { X0, X1, th } = P;
  stitle(ctx, 'ข. ความเร็วคลื่น P และ S ตามความลึก', X0, y0, th);
  const gx0 = X0 + 40, gx1 = X1 - 10, gy0 = y0 + 50, gy1 = y0 + 182;
  const X = (d) => lerp(gx0, gx1, d / D_RE), Y = (v) => lerp(gy1, gy0, v / 16);
  for (const [a, b, col, txt] of [[0, 2900, 'rgba(217,72,15,0.12)', 'เนื้อโลก'], [2900, 5150, 'rgba(240,140,0,0.18)', 'แก่นชั้นนอก (ของเหลว)'], [5150, D_RE, 'rgba(255,212,59,0.25)', 'แก่นชั้นใน']]) {
    ctx.fillStyle = col; ctx.fillRect(X(a), gy0, X(b) - X(a), gy1 - gy0);
    label(ctx, txt, (X(a) + X(b)) / 2, gy0 + 12, { size: 12, wt: 600, color: C.soft });
  }
  ctx.strokeStyle = 'rgba(37,48,58,0.4)'; ctx.lineWidth = 1.5; ctx.strokeRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
  for (const d of [0, 2900, 5150, 6371]) label(ctx, D_fmt(d), X(d), gy1 + 14, { size: 12, wt: 600, color: C.soft });
  label(ctx, 'ความลึก (กม.)', (gx0 + gx1) / 2 + 40, gy1 + 14, { size: 12, wt: 600, color: C.soft });
  for (const v of [0, 7, 14]) label(ctx, String(v), gx0 - 8, Y(v), { size: 12, wt: 600, color: C.soft, align: 'right' });
  label(ctx, 'กม./วินาที', gx0 + 6, gy0 + 12, { size: 12, wt: 600, color: C.soft, align: 'left' });
  for (const [type, col] of [['P', '#1c7ed6'], ['S', '#e03131']]) {
    ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.beginPath();
    for (let d = 0; d <= D_RE; d += 40) { const v = d < 5150 ? D_vel(type, D_RE - d) : (type === 'P' ? D_vel('P', D_RE - d) : 0); d ? ctx.lineTo(X(d), Y(v)) : ctx.moveTo(X(d), Y(v)); }
    ctx.stroke();
  }
  ctx.strokeStyle = '#e03131'; ctx.lineWidth = 2.5; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(X(5150), Y(3.6)); ctx.lineTo(X(D_RE), Y(3.7)); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, 'P', X(2200), Y(13) - 12, { size: 15, wt: 700, color: '#1c7ed6' });
  label(ctx, 'S', X(2500), Y(7) - 12, { size: 15, wt: 700, color: '#e03131' });
  label(ctx, 'S = 0', X(4000), Y(0) - 12, { size: 13, wt: 700, color: '#e03131' });
  ctx.strokeStyle = 'rgba(37,48,58,0.7)'; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(depth), gy0); ctx.lineTo(X(depth), gy1); ctx.stroke(); ctx.setLineDash([]);
  const vp = D_vel('P', D_RE - depth), vs = depth < 5150 ? D_vel('S', D_RE - depth) : 3.6;
  circle(ctx, X(depth), Y(vp), 6, '#1c7ed6'); circle(ctx, X(depth), Y(vs), 6, '#e03131');
}

// ============================================================ pages
const PART_D = [
  { th: TH.tech, title: 'จรวด ยานอวกาศ และสถานีอวกาศ', sub: 'Rockets, spacecraft and space stations', blocks: [
    { p: 'จรวดพ่นแก๊สออกทางท้าย จึงถูกผลักไปข้างหน้าตาม**กฎข้อที่ 3 ของนิวตัน** ไม่ต้องอาศัยอากาศ เชื้อเพลิง**เหลว**ปรับแรงขับและปิด-เปิดได้ เชื้อเพลิง**แข็ง**แรงขับสูงแต่จุดแล้วหยุดไม่ได้ **จรวดหลายท่อน**สลัดท่อนที่หมดเชื้อเพลิงทิ้งเพื่อลดมวล' },
    { box: 'ความเร็วโคจรรอบโลก ≈ **7.9 กม./วินาที** · ความเร็วหลุดพ้น ≈ **11.2 กม./วินาที**', tone: 'key' },
    { h: 'จรวดยุคใหม่' },
    { li: [
      '**Falcon 9** นำท่อนแรกกลับมาลงจอดและใช้ซ้ำ ลดต้นทุนได้มาก',
      '**Starship** ใหญ่ที่สุดที่เคยสร้าง ออกแบบให้ใช้ซ้ำทั้งลำ บินทดสอบตั้งแต่ปี 2023',
      '**SLS** ของ NASA ส่ง Artemis I ปี 2022 และ **Long March 5** ของจีน',
    ] },
    { h: 'ยานอวกาศและสถานีอวกาศ' },
    { li: [
      '**ยานมีมนุษย์** Crew Dragon, Shenzhou และ Orion ในโครงการ **Artemis** ที่จะพามนุษย์กลับไปดวงจันทร์',
      '**ยานสำรวจ (probe)** Perseverance กับเฮลิคอปเตอร์ Ingenuity บินบนดาวอังคารปี 2021 · Parker Solar Probe เข้าใกล้ดวงอาทิตย์ที่สุด · Chang\'e 6 เก็บหินด้านไกลของดวงจันทร์ปี 2024 · Voyager 1 ถึงอวกาศระหว่างดาวแล้ว',
      '**ISS** สูงราว 400 กม. รอบละ ≈ 90 นาที ทดลองในสภาพ**ไร้น้ำหนัก (microgravity)** และ**เทียนกง (Tiangong)** ของจีน เสร็จปี 2022',
    ] },
  ] },
  { kind: 'diagram', th: TH.tech, title: 'ปืนใหญ่ของนิวตัน', sub: 'ภาพโต้ตอบ: ลากเพื่อเปลี่ยนความเร็วที่ยิงออกไป', draw: D_dCannon, init: () => ({ v: 7.3, tt: 0 }) },
  { th: TH.tech, title: 'ดาวเทียมและวงโคจร', sub: 'Satellites and orbits', blocks: [
    { p: '**ดาวเทียม (satellite)** ที่มนุษย์สร้าง แบ่งตามหน้าที่ได้ดังนี้' },
    { li: [
      '**ดาวเทียมสื่อสาร** ทีวี โทรศัพท์ อินเทอร์เน็ต เช่น ไทยคม และ Starlink นับพันดวงในวงโคจรต่ำ',
      '**ดาวเทียมอุตุนิยมวิทยา** ถ่ายภาพเมฆ ติดตามพายุ เช่น Himawari ของญี่ปุ่น',
      '**ดาวเทียมสำรวจทรัพยากร** ถ่ายภาพพื้นผิวโลกละเอียดสูง เช่น THEOS-2 ของไทย ส่งขึ้นเมื่อปี 2566',
      '**ดาวเทียมนำทาง** GPS และ GNSS อื่น ๆ · **ดาวเทียมวิทยาศาสตร์** เช่น กล้องโทรทรรศน์อวกาศ',
          ] },
    { h: 'ระดับความสูงของวงโคจร' },
    { table: { cols: [0.3, 0.38, 0.32], head: ['วงโคจร', 'ความสูง · คาบ', 'ตัวอย่าง'], rows: [
      ['ต่ำ (LEO)', '160–2,000 กม. · ≈ 90 นาที', 'ISS, Starlink, THEOS-2'],
      ['ปานกลาง (MEO)', '≈ 20,200 กม. · ≈ 12 ชม.', 'GPS'],
      ['ค้างฟ้า (GEO)', '35,786 กม. · 24 ชม.', 'ไทยคม Himawari'],
    ] } },
    { p: 'วงโคจร**ค้างฟ้า (geostationary)** อยู่เหนือเส้นศูนย์สูตร โคจรครบรอบพร้อมกับที่โลกหมุนครบรอบ จึงดูนิ่งอยู่เหนือจุดเดิม ส่วน**วงโคจรขั้วโลก**และ**วงโคจรสัมพันธ์กับดวงอาทิตย์ (sun-synchronous)** ผ่านเหนือขั้วโลกขณะที่โลกหมุนอยู่ข้างใต้ จึงถ่ายภาพได้ทั่วโลก' },
    { box: 'ยิ่งวงโคจรสูง ดาวเทียมยิ่งเคลื่อนที่ช้าลง และใช้เวลาโคจรครบรอบนานขึ้น', tone: 'key' },
  ] },
  { kind: 'diagram', th: TH.tech, title: 'สูงขึ้น ช้าลง', sub: 'ภาพโต้ตอบ: ลากดาวเทียมเปลี่ยนความสูงของวงโคจร', draw: D_dOrbits, init: () => ({ alt: 400, ph: 0.6, pe: 0, pg: 0 }) },
  { th: TH.tech, title: 'การประยุกต์ใช้เทคโนโลยีอวกาศ', sub: 'Space technology in everyday life', blocks: [
    { p: 'เทคโนโลยีที่คิดค้นเพื่องานอวกาศหลายอย่างถูกนำมาใช้บนโลก เรียกว่า**ผลพลอยได้ (spin-off)**' },
    { h: 'ผลพลอยได้ในชีวิตประจำวัน' },
    { li: [
      '**โฟมจำรูป (memory foam)** ในที่นอนและหมอน',
      '**เซนเซอร์ภาพ CMOS** ในกล้องโทรศัพท์มือถือ',
      '**ระบบกรองน้ำ**ให้สะอาดพอดื่ม',
      '**เทอร์โมมิเตอร์อินฟราเรด**วัดไข้ทางหู',
      '**สารเคลือบเลนส์กันรอยขีดข่วน**ของแว่นตา',
      '**เครื่องมือไร้สาย** เช่น สว่าน เครื่องดูดฝุ่น',
      '**อาหารแห้งแบบเยือกแข็ง (freeze-dried)** และ**ผ้าห่มฉนวน**สะท้อนความร้อน',
    ] },
    { h: 'บริการจากดาวเทียม' },
    { li: [
      '**นำทางด้วย GPS** ในโทรศัพท์และรถยนต์',
      '**พยากรณ์อากาศ**และติดตามพายุ',
      '**เฝ้าระวังภัยพิบัติและการเกษตร** เช่น น้ำท่วม ไฟป่า พื้นที่ปลูกข้าว',
      '**สื่อสารและโทรทัศน์** รวมถึง**การแพทย์ทางไกล (telemedicine)**',
    ] },
    { box: 'ความเชื่อที่ผิด: ตีนตุ๊กแก (Velcro) และเทฟลอน (Teflon) **ไม่ได้**คิดค้นโดย NASA ทั้งสองอย่างมีมาก่อนแล้ว NASA เพียงนำมาใช้ในภารกิจอวกาศ', tone: 'warn' },
  ] },
  { kind: 'diagram', th: TH.tech, title: 'ดาวเทียมช่วยอะไรเราบ้าง', sub: 'ภาพโต้ตอบ: ลากดาวเทียมไปเหนือพื้นที่และวงโคจรต่าง ๆ', draw: D_dServices, init: () => ({ a: -0.17, h: 172, hT: 172, lit: [0, 0, 0, 0], flip: [false, false, false, false, false, false], fa: [0, 0, 0, 0, 0, 0] }) },
  { th: TH.earth, title: 'โครงสร้างโลก', sub: "Earth's internal structure", blocks: [
    { h: 'แบ่งตามองค์ประกอบทางเคมี' },
    { li: [
      '**เปลือกโลก (crust)** ทวีปหนา 30–70 กม. (หินแกรนิต) มหาสมุทรหนา 5–10 กม. (หินบะซอลต์)',
      '**เนื้อโลก (mantle)** ลึกถึงราว 2,900 กม. ส่วนใหญ่เป็นหินเพริโดไทต์ (peridotite)',
      '**แก่นโลก (core)** เป็นเหล็กและนิกเกิล ชั้นนอกเป็นของเหลว (2,900–5,150 กม.) ชั้นในเป็นของแข็ง (ถึง 6,371 กม.) ร้อนราว 5,000–6,000 °C',
    ] },
    { h: 'แบ่งตามสมบัติเชิงกล' },
    { table: { cols: [0.4, 0.24, 0.36], head: ['ชั้น', 'ลึก (กม.)', 'สมบัติ'], rows: [
      ['ธรณีภาค (lithosphere)', '0–100', 'แข็ง เปราะ'],
      ['ฐานธรณีภาค (asthenosphere)', '100–350', 'หลอมบางส่วน ไหลได้ช้า ๆ'],
      ['มัชฌิมภาค (mesosphere)', '350–2,900', 'ของแข็ง'],
      ['แก่นโลกชั้นนอก', '2,900–5,150', 'ของเหลว'],
      ['แก่นโลกชั้นใน', '5,150–6,371', 'ของแข็ง'],
    ] } },
    { h: 'หลักฐานจากคลื่นไหวสะเทือน' },
    { p: '**คลื่น P** ผ่านได้ทั้งของแข็งและของเหลว ส่วน**คลื่น S** ผ่านได้เฉพาะของแข็ง คลื่น S จึงไปไม่ถึงพื้นที่ที่ห่างจุดเกิดแผ่นดินไหวเกิน **104°** เพราะแก่นโลกชั้นนอกเป็นของเหลว ส่วนคลื่น P หักเหเมื่อเข้าสู่แก่นโลก จึงเกิด**เขตเงา (shadow zone)** ที่ 104°–140°' },
  ] },
  { kind: 'diagram', th: TH.earth, title: 'เจาะลึกถึงใจกลางโลก', sub: 'ภาพโต้ตอบ: ลากหัววัด และเปิดดูคลื่นไหวสะเทือน', draw: D_dInterior, init: () => ({ depth: 1500, rays: false }) },
];
