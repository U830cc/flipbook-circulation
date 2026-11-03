// ============================================================ Part E · plate tectonics, earthquakes, volcanoes, tsunami (pages 35–44)
const E_LINE = 'rgba(40,55,80,0.22)';
function E_frame(ctx, x, y, w, h) { ctx.strokeStyle = E_LINE; ctx.lineWidth = 2; rr(ctx, x, y, w, h, 16); ctx.stroke(); }
function E_card(ctx, x, y, w, h, col) {
  ctx.fillStyle = rgba(col, 0.08); rr(ctx, x, y, w, h, 12); ctx.fill();
  ctx.fillStyle = col; rr(ctx, x, y, 7, h, 3); ctx.fill();
}
function E_poly(ctx, pts, fill, stroke, lw = 2) {
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function E_line(ctx, pts, col, w, dash, off) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = off || 0; }
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore();
}
function E_star(ctx, x, y, r, col, n = 8) {
  ctx.beginPath();
  for (let k = 0; k < n * 2; k++) { const a = k * Math.PI / n - Math.PI / 2, rad = k % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}
function E_hint(ctx, P, txt, y) {
  label(ctx, '☝ ' + txt, P.cx, y, { size: 16, wt: 600, color: 'rgba(0,0,0,0)', bg: 'rgba(251,248,241,0.95)', pad: 8, r: 14 });
  hint(ctx, P, txt, y);
}
const E_fmt = (v, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const E_SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const E_pow10 = (n) => '10' + String(n).split('').map(c => E_SUP[+c]).join('');

// ------------------------------------------------------------ page 36 · seafloor spreading
// Normal-polarity chrons of the last 5.3 Myr (Brunhes, Jaramillo, Olduvai, Gauss with Kaena and Mammoth, Gilbert subchrons).
const E_NORMAL = [[0, 0.78], [0.99, 1.07], [1.78, 1.95], [2.58, 3.04], [3.11, 3.22], [3.33, 3.58], [4.18, 4.29], [4.48, 4.62], [4.80, 4.89], [4.98, 5.23]];
const E_isNormal = (ma) => E_NORMAL.some(([a, b]) => ma >= a && ma < b);
const E_NCOL = '#b8461b', E_RCOL = '#a9d2ee', E_OLD = '#9aa3ab';
const E_TMAX = 5;
function E_dSpread(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 248, bot = 700;
  const T = st.T, vHalf = st.rate * 5, kpx = 1.4, ppm = vHalf * kpx, back = E_TMAX - T;
  stitle(ctx, 'ก. การแผ่ขยายพื้นสมุทรที่สันเขากลางมหาสมุทร', X0, 206, th);
  ctx.save(); rr(ctx, X0, top, W, bot - top, 16); ctx.clip();
  ctx.fillStyle = '#f4efe4'; ctx.fillRect(X0, top, W, bot - top);
  // stripes for one band [y0, y1] following yTop(x)
  const segs = [];
  { const cuts = new Set([0, T]); for (const [n0, n1] of E_NORMAL) { cuts.add(clamp(n0 - back, 0, T)); cuts.add(clamp(n1 - back, 0, T)); }
    const cs = [...cuts].sort((p, q) => p - q);
    for (let i = 1; i < cs.length; i++) { const a = cs[i - 1], b = cs[i]; if (b - a > 1e-4) segs.push([a, b, E_isNormal(back + (a + b) / 2)]); } }
  const band = (yA, yB, inner = 0) => {
    for (const s of [-1, 1]) {
      for (const [a, b, n] of segs) {
        const xa = cx + s * a * ppm, xb = cx + s * b * ppm, pts = [];
        for (let k = 0; k <= 6; k++) { const x = lerp(xa, xb, k / 6); pts.push([x, yA(x)]); }
        for (let k = 6; k >= 0; k--) { const x = lerp(xa, xb, k / 6); pts.push([x, yB(x)]); }
        E_poly(ctx, pts, n ? E_NCOL : E_RCOL);
      }
    }
  };
  // top view
  const ty0 = 290, ty1 = 352;
  ctx.fillStyle = E_OLD; ctx.fillRect(X0, ty0, W, ty1 - ty0);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; for (let x = X0 + 6; x < X1; x += 14) ctx.fillRect(x, ty0, 2, ty1 - ty0);
  band(() => ty0, () => ty1);
  ctx.strokeStyle = '#c92a2a'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(cx, ty0 - 6); ctx.lineTo(cx, ty1 + 6); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, 'มองจากด้านบน (top view)', X0 + 16, 270, { size: 15, wt: 700, color: C.soft, align: 'left' });
  const nowN = E_isNormal(back);
  label(ctx, 'ขั้วแม่เหล็กขณะนี้: ' + (nowN ? 'ปกติ' : 'กลับขั้ว'), X1 - 16, 270, { size: 15, wt: 700, color: nowN ? E_NCOL : '#1c6fb0', align: 'right' });
  const oldW = W / 2 - T * ppm;
  if (oldW > 110) for (const s of [-1, 1]) label(ctx, 'เปลือกเดิม', cx + s * (W / 2 - oldW / 2), (ty0 + ty1) / 2, { size: 14, wt: 700, color: '#fff' });
  // cross-section
  const ys = 380, fl = (x) => 418 + 30 * Math.sqrt(clamp(Math.abs(x - cx) / 360, 0, 1));
  const cr = (x) => fl(x) + 22, lb = (x) => fl(x) + 30 + 100 * Math.sqrt(clamp(Math.abs(x - cx) / 360, 0, 1));
  let g = ctx.createLinearGradient(0, 430, 0, bot); g.addColorStop(0, '#f08c3c'); g.addColorStop(1, '#c4561e');
  ctx.fillStyle = g; ctx.fillRect(X0, 430, W, bot - 430);
  // convection loops beneath both plates
  const lp = [Path(rrectPts(cx + 18, 574, X1 - cx - 34, 112, 48, 10)), Path(rrectPts(X0 + 16, 574, cx - X0 - 34, 112, 48, 10).reverse())];
  const ph = phaseAdvance(st, 'cv', t, 0.03 + st.rate * 0.004);
  for (const p of lp) { strokeP(ctx, p, 'rgba(255,240,220,0.55)', 3, [10, 8], -ph * p.len); for (let k = 0; k < 6; k++) { const q = p.at(k / 6 + ph); chevron(ctx, q.x, q.y, q.ang, '#fff4e0', 11); } }
  label(ctx, 'การพาความร้อนในเนื้อโลก (mantle convection)', cx, 630, { size: 15, wt: 700, color: '#fff' });
  // lithosphere
  const lpts = []; for (let x = X0; x <= X1; x += 8) lpts.push([x, cr(x)]); for (let x = X1; x >= X0; x -= 8) lpts.push([x, lb(x)]);
  E_poly(ctx, lpts, '#6b5546');
  // magma channel under the ridge
  g = ctx.createLinearGradient(0, 560, 0, 420); g.addColorStop(0, 'rgba(255,140,40,0)'); g.addColorStop(1, 'rgba(255,190,70,0.95)');
  E_poly(ctx, [[cx - 40, 570], [cx + 40, 570], [cx + 9, fl(cx)], [cx - 9, fl(cx)]], g);
  for (let k = 0; k < 9; k++) { const u = mod1(t * 0.35 + k / 9), y = lerp(560, fl(cx) + 4, u), x = cx + Math.sin(k * 2.1 + t) * 22 * (1 - u); circle(ctx, x, y, 3.5, `rgba(255,236,170,${Math.sin(Math.PI * u)})`); }
  // water
  ctx.beginPath(); ctx.moveTo(X0, ys); ctx.lineTo(X1, ys); for (let x = X1; x >= X0; x -= 8) ctx.lineTo(x, fl(x)); ctx.closePath();
  g = ctx.createLinearGradient(0, ys, 0, 450); g.addColorStop(0, '#5aa9dd'); g.addColorStop(1, '#2367a3'); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = X0; x <= X1; x += 6) { const y = ys + 2 * Math.sin(x * 0.05 + t * 2); x === X0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
  // crust band
  { const pts = []; for (let x = X0; x <= X1; x += 8) pts.push([x, fl(x)]); for (let x = X1; x >= X0; x -= 8) pts.push([x, cr(x)]); E_poly(ctx, pts, E_OLD); }
  band(fl, cr);
  E_line(ctx, Array.from({ length: 94 }, (_, i) => [X0 + i * 8, cr(X0 + i * 8)]), 'rgba(30,20,10,0.45)', 1.5);
  label(ctx, 'เปลือกโลกใหม่บันทึกขั้วแม่เหล็ก', cx + 150, fl(cx + 150) - 14, { size: 13, wt: 700, color: '#fff' });
  circle(ctx, cx, fl(cx) - 2, 7 + Math.sin(t * 4), 'rgba(255,200,80,0.9)');
  // plate motion chevrons
  const sp = phaseAdvance(st, 'pm', t, 0.06 + st.rate * 0.01);
  for (let k = 0; k < 4; k++) {
    const u = mod1(k / 4 + sp), dx = 60 + u * 280;
    for (const s of [-1, 1]) { const x = cx + s * dx; chevron(ctx, x, (cr(x) + lb(x)) / 2, s > 0 ? 0 : Math.PI, `rgba(255,255,255,${0.75 * Math.sin(Math.PI * u)})`, 12); }
  }
  label(ctx, 'สันเขากลางมหาสมุทร', cx, ys - 16, { size: 15, wt: 700, color: '#c92a2a', bg: 'rgba(255,255,255,0.9)', pad: 5 });
  label(ctx, 'ธรณีภาค (lithosphere)', X0 + 120, lb(X0 + 120) - 26, { size: 14, wt: 700, color: '#fff' });
  label(ctx, 'ฐานธรณีภาค (asthenosphere)', X1 - 120, 556, { size: 14, wt: 700, color: '#fff' });
  label(ctx, 'แมกมาดันขึ้น', cx, 548, { size: 14, wt: 700, color: '#fff', bg: 'rgba(196,86,30,0.85)', pad: 4 });
  // probe = the piece of seafloor under the finger
  const px = clamp(st.px, X0 + 6, X1 - 6), dist = Math.abs(px - cx) / kpx, age = dist / vHalf, inNew = age <= T;
  st._age = age; st._new = inNew;
  ctx.strokeStyle = 'rgba(25,30,40,0.85)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(px, ty0 - 4); ctx.lineTo(px, cr(px) + 4); ctx.stroke(); ctx.setLineDash([]);
  circle(ctx, px, (ty0 + ty1) / 2, 10, '#fff'); ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ring(ctx, px, (ty0 + ty1) / 2, 10);
  arrow(ctx, px - 14, (ty0 + ty1) / 2, px - 30, (ty0 + ty1) / 2, { color: C.ink, w: 3, head: 9 });
  arrow(ctx, px + 14, (ty0 + ty1) / 2, px + 30, (ty0 + ty1) / 2, { color: C.ink, w: 3, head: 9 });
  ctx.restore();
  E_frame(ctx, X0, top, W, bot - top);
  E_hint(ctx, P, 'ลากพื้นสมุทรออกจากสันเขา = เวลาผ่านไป · ลากเข้าหา = ย้อนเวลา', bot - 22);
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: 'ew-resize', drag: (qx, qy, phase) => {
    if (qx < 0) return;
    if (phase === 'start') { st._lx = qx; st.px = qx; return; }
    st.T = clamp(st.T + (Math.abs(qx - cx) - Math.abs(st._lx - cx)) / ppm, 0, E_TMAX); st._lx = qx; st.px = qx;
  } });
  // readout
  const ry = 716;
  E_card(ctx, X0, ry, W, 92, th.a);
  label(ctx, `ผ่านไป ${T.toFixed(1)} ล้านปี`, X0 + 22, ry + 28, { size: 26, wt: 600, color: th.a, align: 'left', fam: F.display });
  label(ctx, `แผ่ขยาย ${st.rate.toFixed(1)} ซม./ปี (ข้างละ ${(st.rate / 2).toFixed(1)})`, X1 - 18, ry + 28, { size: 18, wt: 700, color: C.ink, align: 'right' });
  const pn = E_isNormal(back + age);
  const msg = age < 0.05 ? 'หินตรงจุดที่ลาก: กำลังเกิดใหม่ที่สันเขา อายุเกือบ 0 ปี'
    : inNew ? `หินตรงจุดที่ลาก: อายุ ${age.toFixed(2)} ล้านปี · ห่างสันเขา ${E_fmt(dist)} กม. · บันทึกขั้ว${pn ? 'ปกติ' : 'กลับขั้ว'}`
    : `หินตรงจุดที่ลาก: เปลือกเดิม อายุมากกว่า ${T.toFixed(1)} ล้านปี (เก่ากว่าแถบใหม่ทั้งหมด)`;
  label(ctx, msg, X0 + 22, ry + 66, { size: 18, wt: 600, color: C.ink, align: 'left' });
  // legend
  const lg = (x, col, txt) => { ctx.fillStyle = col; rr(ctx, x, 826, 26, 16, 4); ctx.fill(); label(ctx, txt, x + 34, 834, { size: 15, wt: 600, color: C.soft, align: 'left' }); };
  lg(X0 + 4, E_NCOL, 'ขั้วปกติ (normal)'); lg(X0 + 200, E_RCOL, 'กลับขั้ว (reversed)'); lg(X0 + 410, E_OLD, 'เปลือกเดิม');
  slider(ctx, P, 'rate', X0 + 40, 896, W - 80, { min: 2, max: 10, title: 'อัตราการแผ่ขยาย (รวมสองข้าง)', value: `${st.rate.toFixed(1)} ซม./ปี`, left: 'ช้า · สันเขาแอตแลนติก ~2.5', right: 'เร็ว · แปซิฟิกตะวันออก ~10' });
  // continents timeline
  stitle(ctx, 'ข. ทวีปเลื่อน: จากแพนเจียถึงปัจจุบัน', X0, 942, th);
  E_drawEras(ctx, X0, 984, W, t, th);
}

// simplified continents, [lon, lat]; each era moves a continent by [dLon, dLat, rotation°] about its centroid
const E_CONT = {
  na: { c: '#7a9a4a', p: [[-165, 65], [-140, 70], [-95, 72], [-78, 62], [-60, 50], [-72, 41], [-81, 30], [-97, 26], [-97, 19], [-86, 15], [-80, 8], [-92, 15], [-106, 22], [-117, 32], [-124, 42], [-134, 57], [-160, 58]] },
  gl: { c: '#7a9a4a', p: [[-55, 60], [-43, 60], [-22, 70], [-18, 81], [-60, 83], [-72, 77]] },
  sa: { c: '#8aa84f', p: [[-79, 9], [-62, 11], [-50, 1], [-35, -6], [-39, -20], [-53, -34], [-65, -41], [-70, -54], [-75, -46], [-71, -19], [-81, -5]] },
  af: { c: '#b39a55', p: [[-17, 21], [-9, 35], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [32, -29], [20, -35], [12, -17], [9, 4], [-8, 4], [-17, 14]] },
  eu: { c: '#9b8a5a', p: [[-9, 37], [-9, 44], [-2, 49], [5, 59], [20, 70], [60, 70], [100, 76], [140, 72], [178, 68], [160, 60], [140, 54], [130, 42], [121, 31], [108, 20], [105, 9], [99, 14], [92, 21], [88, 27], [72, 31], [60, 25], [48, 30], [35, 36], [27, 40], [12, 44]] },
  in: { c: '#c08a4e', p: [[68, 24], [72, 21], [77, 8], [80, 10], [87, 22], [90, 27], [80, 31], [72, 32]] },
  au: { c: '#c9a35b', p: [[114, -22], [122, -17], [131, -12], [142, -11], [146, -19], [153, -28], [147, -38], [138, -35], [130, -31], [115, -34]] },
  an: { c: '#e4ebf0', p: [[-60, -68], [0, -70], [60, -67], [90, -72], [60, -86], [-30, -86], [-70, -76]] },
};
const E_ERAS = [
  { cap: '250 ล้านปีก่อน', name: 'แพนเจีย (Pangaea)', m: { na: [50, -7, -20], gl: [56, -29, -20], sa: [45, -10, -22], af: [0, -12, -6], eu: [0, -14, 0], in: [-32, -48, 40], au: [-42, -12, 30], an: [20, 26, 0] } },
  { cap: '200 ล้านปีก่อน', name: 'เริ่มแยก: ลอเรเซีย · กอนด์วานา', m: { na: [42, -5, -17], gl: [48, -25, -17], sa: [39, -10, -19], af: [0, -11, -5], eu: [2, -12, 0], in: [-28, -44, 36], au: [-40, -12, 28], an: [20, 23, 0] } },
  { cap: '100 ล้านปีก่อน', name: 'มหาสมุทรแอตแลนติกเปิด', m: { na: [22, -3, -8], gl: [25, -12, -8], sa: [16, -6, -8], af: [0, -6, -2], eu: [3, -4, 0], in: [-18, -35, 20], au: [-22, -12, 15], an: [12, 10, 0] } },
  { cap: 'ปัจจุบัน', name: 'ทวีปยังเลื่อนต่อไป', m: {} },
];
let E_ERA_CV = null;
function E_eraCanvas(w, h) {
  if (E_ERA_CV) return E_ERA_CV;
  const cv = document.createElement('canvas'); cv.width = w * 4 + 60; cv.height = h; const x = cv.getContext('2d');
  E_ERAS.forEach((era, i) => {
    const ox = i * (w + 20);
    x.save(); rr(x, ox, 0, w, h, 10); x.clip();
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5fa4d6'); g.addColorStop(1, '#2b6ea6');
    x.fillStyle = g; x.fillRect(ox, 0, w, h);
    const map = ([lo, la]) => [ox + (lo + 180) / 360 * w, (90 - la) / 180 * h];
    for (const [k, ct] of Object.entries(E_CONT)) {
      const [dl, dp, rot] = era.m[k] || [0, 0, 0];
      const cxl = ct.p.reduce((s, q) => s + q[0], 0) / ct.p.length, cyl = ct.p.reduce((s, q) => s + q[1], 0) / ct.p.length;
      const c = Math.cos(rot * D2R), s = Math.sin(rot * D2R);
      const pts = chaikin(ct.p.map(([lo, la]) => { const a = lo - cxl, b = la - cyl; return map([cxl + dl + a * c - b * s, cyl + dp + a * s + b * c]); }), 2);
      E_poly(x, pts, ct.c, 'rgba(40,40,20,0.35)', 1);
    }
    x.restore();
  });
  return (E_ERA_CV = cv);
}
function E_drawEras(ctx, X0, y, W, t, th) {
  const w = (W - 60) / 4, h = 92, cv = E_eraCanvas(Math.round(w), h);
  E_ERAS.forEach((era, i) => {
    const x = X0 + i * (w + 20);
    ctx.drawImage(cv, i * (Math.round(w) + 20), 0, Math.round(w), h, x, y, Math.round(w), h);
    ctx.strokeStyle = E_LINE; ctx.lineWidth = 1.5; rr(ctx, x, y, w, h, 10); ctx.stroke();
    label(ctx, era.cap, x + w / 2, y + h + 20, { size: 16, wt: 700, color: th.a });
    label(ctx, era.name, x + w / 2, y + h + 44, { size: 13, wt: 600, color: C.soft });
    if (i < 3) chevron(ctx, x + w + 10, y + h / 2, 0, rgba(th.a, 0.5 + 0.4 * Math.sin(t * 3 - i)), 9);
  });
}

// ------------------------------------------------------------ page 38 · plate boundaries
const E_BOUND = [
  { tab: 'แยกออก', name: 'ขอบแยกออกจากกัน (divergent)', move: 'out', quake: 'ตื้น', volc: 'มี · ลาวาบะซอลต์', land: 'สันเขากลางสมุทร · หุบเขาทรุด' },
  { tab: 'มหาสมุทร-ทวีป', name: 'ขอบชนกัน: มหาสมุทร-ทวีป', move: 'in', quake: 'ตื้นถึงลึก', volc: 'มี · ระเบิดรุนแรง', land: 'ร่องลึก · เทือกเขาภูเขาไฟ' },
  { tab: 'มหาสมุทร-มหาสมุทร', name: 'ขอบชนกัน: มหาสมุทร-มหาสมุทร', move: 'in', quake: 'ตื้นถึงลึก', volc: 'มี', land: 'ร่องลึก · หมู่เกาะรูปโค้ง' },
  { tab: 'ทวีป-ทวีป', name: 'ขอบชนกัน: ทวีป-ทวีป', move: 'in', quake: 'ตื้นถึงปานกลาง', volc: 'ไม่มี', land: 'เทือกเขาสูงโก่งตัว' },
  { tab: 'เฉือน', name: 'ขอบเฉือนกัน (transform)', move: 'slide', quake: 'ตื้น · บ่อย', volc: 'ไม่มี', land: 'รอยเลื่อน · ลำน้ำหักงอ' },
];
const E_SKY = (ctx, X0, top, W, ys) => { const g = ctx.createLinearGradient(0, top, 0, ys); g.addColorStop(0, '#d6e8f5'); g.addColorStop(1, '#f3f8fb'); ctx.fillStyle = g; ctx.fillRect(X0, top, W, ys - top); };
const E_ASTH = (ctx, X0, y, W, bot) => { const g = ctx.createLinearGradient(0, y, 0, bot); g.addColorStop(0, '#f2a25a'); g.addColorStop(1, '#cf6a2a'); ctx.fillStyle = g; ctx.fillRect(X0, y, W, bot - y); };
const E_CRUST_C = '#c9a874', E_CRUST_O = '#4a4f5a', E_LITH = '#7b6250';
function E_water(ctx, x0, x1, ys, yb, t) {
  const g = ctx.createLinearGradient(0, ys, 0, yb); g.addColorStop(0, '#5aa9dd'); g.addColorStop(1, '#2367a3');
  ctx.fillStyle = g; ctx.fillRect(x0, ys, x1 - x0, yb - ys);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = x0; x <= x1; x += 6) { const y = ys + 2 * Math.sin(x * 0.05 + t * 2); x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
}
function E_volcano(ctx, x, yb, h, w, t, erupt) {
  if (h < 3) return;
  E_poly(ctx, [[x - w, yb], [x - 10, yb - h], [x + 10, yb - h], [x + w, yb]], '#7d5a48', 'rgba(50,30,20,0.5)', 1.5);
  E_poly(ctx, [[x - 10, yb - h], [x + 10, yb - h], [x + 4, yb - h + 10], [x - 4, yb - h + 10]], '#ff7a1a');
  if (erupt > 0.05) for (let k = 0; k < 6; k++) {
    const u = mod1(t * 0.3 + k / 6), r = 6 + u * 18;
    circle(ctx, x + Math.sin(k * 1.7 + t) * 6 + u * 24, yb - h - 8 - u * 60 * erupt, r, `rgba(110,110,115,${0.5 * (1 - u) * erupt})`);
  }
}
// slab centreline for subduction: starts at the trench and steepens with depth
function E_slab(xt, yt, len) {
  const top = [[xt, yt]]; let x = xt, y = yt, s = 0;
  while (s < len) { const a = (16 + 34 * clamp(s / 220, 0, 1)) * D2R; x += Math.cos(a) * 6; y += Math.sin(a) * 6; s += 6; top.push([x, y]); }
  return top;
}
function E_offset(pts, d) {
  return pts.map((p, i) => { const a = pts[Math.min(i + 1, pts.length - 1)], b = pts[Math.max(i - 1, 0)], ang = Math.atan2(a[1] - b[1], a[0] - b[0]); return [p[0] - Math.sin(ang) * d, p[1] + Math.cos(ang) * d]; });
}
function E_dBounds(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 266, bot = 700, B = E_BOUND[st.mode], d = st.d;
  // tabs
  const tw = (W - 4 * 8) / 5;
  E_BOUND.forEach((b, i) => {
    const x = X0 + i * (tw + 8), on = i === st.mode;
    ctx.fillStyle = on ? th.a : rgba(th.a, 0.1); rr(ctx, x, 208, tw, 42, 10); ctx.fill();
    label(ctx, b.tab, x + tw / 2, 229, { size: b.tab.length > 12 ? 14 : 16, wt: 700, color: on ? '#fff' : th.a });
    P.zones.push({ x, y: 208, w: tw, h: 42, cursor: 'pointer', click: () => { if (st.mode !== i) { st.mode = i; st.d = i === 4 ? 0 : 0.15; st._fl = []; } } });
  });
  const ys = 400, info = {};
  ctx.save(); rr(ctx, X0, top, W, bot - top, 16); ctx.clip();
  E_SKY(ctx, X0, top, W, ys);
  if (st.mode === 0) E_drawDiv(ctx, t, P, d, ys, top, bot, info);
  else if (st.mode <= 2) E_drawSub(ctx, t, P, d, ys, top, bot, info, st.mode === 2);
  else if (st.mode === 3) E_drawCol(ctx, t, P, d, ys, top, bot, info);
  else E_drawTf(ctx, t, P, d, top, bot, info);
  ctx.restore();
  E_frame(ctx, X0, top, W, bot - top);
  E_hint(ctx, P, B.move === 'slide' ? 'ลากแผ่นธรณีขึ้น-ลง ให้เลื่อนผ่านกัน' : B.move === 'out' ? 'ลากแผ่นธรณีออกจากกัน (← →) หรือดันกลับ' : 'ลากแผ่นธรณีเข้าหากัน (→ ←) หรือดึงกลับ', bot - 22);
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: B.move === 'slide' ? 'ns-resize' : 'ew-resize', drag: (qx, qy, phase) => {
    if (qx < 0) { st._side = 0; return; }
    if (phase === 'start') { st._side = qx < cx ? -1 : 1; st._lx = qx; st._ly = qy; return; }
    const s = st._side || 1;
    if (B.move === 'slide') {
      const dd = (qy - st._ly) * s / 260; st.d = clamp(st.d + dd, -1, 1); st._acc = (st._acc || 0) + Math.abs(dd);
      st._dir = Math.sign(dd) || st._dir;
      if (st._acc > 0.07) { st._acc = 0; (st._fl = st._fl || []).push({ y: clamp(qy, top + 30, bot - 50), t0: P.clock, r: 0.6 + Math.random() * 0.6 }); if (st._fl.length > 8) st._fl.shift(); }
    } else {
      const dd = (qx - st._lx) * s / 300 * (B.move === 'out' ? 1 : -1); st.d = clamp(st.d + dd, 0, 1); st._dir = Math.sign(dd) || st._dir;
    }
    st._lx = qx; st._ly = qy;
  } });
  // readout
  const ry = 716;
  E_card(ctx, X0, ry, W, 122, th.a);
  label(ctx, B.name, X0 + 22, ry + 26, { size: 24, wt: 600, color: th.a, align: 'left', fam: F.display });
  label(ctx, 'ภูมิประเทศ: ' + info.land, X0 + 22, ry + 62, { size: 18, wt: 700, color: C.ink, align: 'left' });
  label(ctx, 'ตัวอย่าง: ' + info.place, X0 + 22, ry + 94, { size: 18, wt: 600, color: C.ink, align: 'left' });
  if (B.move !== 'slide') {
    const bw = 150, bx = X1 - bw - 20;
    label(ctx, B.move === 'out' ? 'ระยะแยก' : 'ระยะชน', bx, ry + 26, { size: 15, wt: 600, color: C.soft, align: 'left' });
    ctx.fillStyle = 'rgba(120,105,80,0.2)'; rr(ctx, bx + 70, ry + 18, bw - 70, 16, 8); ctx.fill();
    ctx.fillStyle = th.a; rr(ctx, bx + 70, ry + 18, Math.max(10, (bw - 70) * d), 16, 8); ctx.fill();
  }
  // comparison table
  stitle(ctx, 'ข. เปรียบเทียบขอบแผ่นธรณีทั้ง 5 แบบ', X0, 852, th);
  const cols = [0, 0.29, 0.5, 0.72, 1].map(f => X0 + f * W), heads = ['ขอบแผ่นธรณี', 'แผ่นดินไหว', 'ภูเขาไฟ', 'ภูมิประเทศ'];
  let y = 892;
  ctx.fillStyle = th.a; rr(ctx, X0, y, W, 32, 8); ctx.fill();
  heads.forEach((h, i) => label(ctx, h, cols[i] + 12, y + 16, { size: 15, wt: 700, color: '#fff', align: 'left' }));
  y += 32;
  E_BOUND.forEach((b, i) => {
    const on = i === st.mode;
    if (on) { ctx.fillStyle = rgba(th.a, 0.18); ctx.fillRect(X0, y, W, 34); ctx.fillStyle = th.a; ctx.fillRect(X0, y, 5, 34); }
    else if (i % 2 === 0) { ctx.fillStyle = rgba(th.a, 0.05); ctx.fillRect(X0, y, W, 34); }
    [b.tab, b.quake, b.volc, b.land].forEach((c, k) => label(ctx, c, cols[k] + 12, y + 17, { size: 15, wt: k === 0 || on ? 700 : 500, color: k === 2 && c === 'ไม่มี' ? '#868e96' : C.ink, align: 'left' }));
    P.zones.push({ x: X0, y, w: W, h: 34, cursor: 'pointer', click: () => { if (st.mode !== i) { st.mode = i; st.d = i === 4 ? 0 : 0.15; st._fl = []; } } });
    y += 34;
  });
  ctx.strokeStyle = rgba(th.a, 0.35); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X0, y); ctx.lineTo(X1, y); ctx.stroke();
}
function E_plateArrows(ctx, xl, xr, y, out, active) {
  const col = active ? '#e8590c' : 'rgba(37,48,58,0.7)', len = 54;
  if (out) { arrow(ctx, xl + len / 2, y, xl - len / 2, y, { color: col, w: 6, head: 16 }); arrow(ctx, xr - len / 2, y, xr + len / 2, y, { color: col, w: 6, head: 16 }); }
  else { arrow(ctx, xl - len / 2, y, xl + len / 2, y, { color: col, w: 6, head: 16 }); arrow(ctx, xr + len / 2, y, xr - len / 2, y, { color: col, w: 6, head: 16 }); }
}
function E_drawDiv(ctx, t, P, d, ys, top, bot, info) {
  const { X0, X1, cx, st } = P, g = 40 + d * 210, xl = cx - g / 2, xr = cx + g / 2, yl = 384;
  const lb = (x) => 540 - 70 * Math.exp(-(((x - cx) / (90 + g * 0.6)) ** 2)) * (0.3 + 0.7 * d);
  E_ASTH(ctx, X0, 420, X1 - X0, bot);
  // rising mantle
  for (const s of [-1, 1]) {
    const p = Path([[cx + s * 30, bot - 6], [cx + s * 26, 600], [cx + s * 70, 560], [cx + s * 220, 572]], false), ph = mod1(t * 0.12);
    strokeP(ctx, p, 'rgba(255,240,220,0.5)', 3, [10, 8], -ph * p.len);
    for (let k = 0; k < 3; k++) { const q = p.at(k / 3 + ph); chevron(ctx, q.x, q.y, q.ang, '#fff4e0', 10); }
  }
  // rift floor sinks with spreading, then floods and becomes new ocean crust
  const oc = smooth(0.4, 0.8, d), sea = d > 0.45, fy = yl + 12 + 84 * smooth(0.05, 0.8, d);
  const bump = (x) => 10 * oc * Math.exp(-(((x - cx) / 26) ** 2));
  const fill = [];
  for (let k = 0; k <= 16; k++) { const x = lerp(xl - 30, xr + 30, k / 16); fill.push([x, fy - bump(x)]); }
  const fb = (x) => Math.max(lb(x), fy + 40);
  fill.push([xr + 30, fb(xr + 30)], [cx, fb(cx)], [xl - 30, fb(xl - 30)]);
  if (sea) E_water(ctx, xl, xr, ys, fy + 4, t);
  E_poly(ctx, fill, mix('#a98a62', E_CRUST_O, oc));
  if (!sea) for (let k = 0; k < 3; k++) { const bx = lerp(xl, xr, (k + 0.5) / 3); E_line(ctx, [[bx - 8, fy + 4], [bx + 8, fy + 30]], 'rgba(60,40,20,0.45)', 2); }
  const mg = ctx.createLinearGradient(0, fb(cx), 0, fy); mg.addColorStop(0, 'rgba(255,140,40,0.9)'); mg.addColorStop(1, 'rgba(255,200,80,0.95)');
  E_poly(ctx, [[cx - 26, fb(cx) + 6], [cx + 26, fb(cx) + 6], [cx + 5, fy - bump(cx)], [cx - 5, fy - bump(cx)]], mg);
  // plates (continental crust over mantle lithosphere) with normal-fault edges dipping toward the rift
  const plate = (x0, x1, s) => {
    const e = s < 0 ? x1 : x0, far = s < 0 ? x0 : x1, out = [[far, yl], [e, yl], [e - s * 18, 452]];
    for (let k = 0; k <= 12; k++) { const x = lerp(e - s * 18, far, k / 12); out.push([x, lb(x)]); }
    E_poly(ctx, out, E_LITH);
    E_poly(ctx, [[far, yl], [e, yl], [e - s * 11, 440], [far, 440]], E_CRUST_C, 'rgba(60,40,20,0.35)', 1.5);
  };
  plate(X0 - 10, xl, -1); plate(xr, X1 + 10, 1);
  for (let k = 0; k < 8; k++) { const u = mod1(t * 0.4 + k / 8), y = lerp(600, fy, u); circle(ctx, cx + Math.sin(k * 2 + t) * 16 * (1 - u), y, 3.5, `rgba(255,236,170,${Math.sin(Math.PI * u)})`); }
  glow(ctx, cx, fy, 26, 'rgba(255,170,60,0.7)');
  if (d > 0.25 && d < 0.75) { E_volcano(ctx, xl - 60, yl, 34 * smooth(0.25, 0.5, d), 34, t, 0.6); }
  E_plateArrows(ctx, X0 + 150, X1 - 150, 362, true, !!st._side);
  label(ctx, 'แผ่นทวีป', X0 + 70, 412, { size: 14, wt: 700, color: '#5a4020' });
  label(ctx, 'ธรณีภาค', X0 + 70, 490, { size: 14, wt: 700, color: '#fff' });
  label(ctx, 'ฐานธรณีภาค (asthenosphere)', X1 - 140, 640, { size: 14, wt: 700, color: '#fff' });
  label(ctx, 'แมกมาดันตัวขึ้น', cx, 620, { size: 14, wt: 700, color: '#fff', bg: 'rgba(196,86,30,0.85)', pad: 4 });
  label(ctx, sea ? 'สันเขากลางมหาสมุทร · ทะเลเกิดใหม่' : 'หุบเขาทรุด (rift valley)', cx, 300, { size: 16, wt: 700, color: '#8a4b2a', bg: 'rgba(255,255,255,0.9)', pad: 5 });
  arrow(ctx, cx, 314, cx, fy - 14, { color: 'rgba(138,75,42,0.7)', w: 2.5, head: 10 });
  info.land = sea ? 'สันเขากลางมหาสมุทร เกิดพื้นสมุทรใหม่' : 'หุบเขาทรุด แผ่นทวีปเริ่มแยก';
  info.place = sea ? 'สันเขากลางมหาสมุทรแอตแลนติก · ไอซ์แลนด์' : 'ร่องหุบเขาแอฟริกาตะวันออก (East African Rift)';
}
function E_drawSub(ctx, t, P, d, ys, top, bot, info, oo) {
  const { X0, X1, cx, st } = P, xt = cx - 70, yS = 468, yt = 496, Lmax = 470, len = 70 + d * 400;
  E_ASTH(ctx, X0, 430, X1 - X0, bot);
  E_water(ctx, X0, oo ? X1 : xt + 150, ys, 520, t);
  const slabFull = E_slab(xt, yt, Lmax), slab = slabFull.slice(0, Math.max(2, Math.round(len / 6)));
  const sb = E_offset(slab, 40);
  // subducting plate: flat part + slab
  const flatTop = [[X0 - 10, yS], [xt - 60, yS], [xt - 20, yS + 8], [xt, yt]];
  E_poly(ctx, [...flatTop, ...slab.slice(1), ...sb.slice().reverse(), [xt - 22, yt + 40], [xt - 60, yS + 54], [X0 - 10, yS + 54]], E_CRUST_O);
  E_poly(ctx, [...flatTop, ...slab.slice(1), ...E_offset(slab, 10).reverse(), [xt - 60, yS + 10], [X0 - 10, yS + 10]], '#2f333b');
  // motion ticks travel with the plate
  const path = Path([...flatTop, ...slab.slice(1)], false);
  for (let k = -1; k < 20; k++) { const u = (k * 46 + d * 400) / path.len; if (u < 0 || u > 1) continue; const q = path.at(u); E_line(ctx, [[q.x - Math.sin(q.ang) * 2, q.y + Math.cos(q.ang) * 2], [q.x - Math.sin(q.ang) * 22, q.y + Math.cos(q.ang) * 22]], 'rgba(255,255,255,0.4)', 3); }
  // overriding plate follows the slab interface
  const ov = [], yo = oo ? yS : 386;
  const iface = slabFull.filter(p => p[1] <= 560);
  if (oo) { ov.push([xt + 8, yt - 6], [xt + 60, yS]); } else { ov.push([xt + 8, yt - 6], [xt + 60, 440], [xt + 120, 392], [xt + 160, yo]); }
  ov.push([X1 + 10, yo], [X1 + 10, 560], [iface[iface.length - 1][0], 560]);
  for (let i = iface.length - 1; i >= 0; i--) if (iface[i][0] > xt + 8) ov.push(iface[i]);
  E_poly(ctx, ov, E_LITH);
  if (oo) E_poly(ctx, [[xt + 8, yt - 6], [xt + 60, yS], [X1 + 10, yS], [X1 + 10, yS + 12], [xt + 30, yS + 20]], E_CRUST_O);
  else E_poly(ctx, [[xt + 8, yt - 6], [xt + 60, 440], [xt + 120, 392], [xt + 160, yo], [X1 + 10, yo], [X1 + 10, 470], [xt + 50, 478]], E_CRUST_C, 'rgba(60,40,20,0.35)', 1.5);
  // sea
  // melting at ~100 km depth
  const melt = slab.find(p => p[1] >= 596), xm = melt ? melt[0] + 10 : null, act = melt ? smooth(0, 0.25, (len - 230) / 200) : 0;
  const vb = oo ? yS : yo, vh = (oo ? 150 : 92) * smooth(0.25, 1, d), xv = xm ? xm - 4 : xt + 230;
  if (melt) {
    for (let k = 0; k < 9; k++) { const u = mod1(t * 0.3 + k / 9), y = lerp(melt[1] - 8, vb + 8, u); circle(ctx, xm + Math.sin(k * 1.9 + t * 0.8) * 10, y, 4 + (k % 3), `rgba(255,${150 + (k % 3) * 30},60,${act * Math.sin(Math.PI * u)})`); }
    glow(ctx, xm, melt[1] - 4, 30, `rgba(255,150,50,${0.7 * act})`);
    if (act > 0.2) label(ctx, 'หินหลอมละลาย → แมกมา', xm + 16, melt[1] + 26, { size: 14, wt: 700, color: '#fff', bg: 'rgba(196,86,30,0.85)', pad: 4, align: 'left' });
  }
  E_volcano(ctx, xv, vb, vh, oo ? 70 : 56, t, smooth(0.5, 0.9, d));
  // earthquakes along the slab interface (Benioff zone)
  const nq = Math.round(2 + d * 5);
  for (let k = 0; k < nq; k++) {
    const cyc = t * 0.8 + k * 0.37, idx = Math.floor(cyc), age = cyc - idx, h = Math.sin(idx * 12.9898 + k * 78.233) * 43758.5453;
    const p = slab[Math.floor(mod1(h) * (slab.length - 1))];
    if (p) E_star(ctx, p[0], p[1] + 6, 9 * (1 - age) + 3, `rgba(255,224,60,${1 - age})`, 6);
  }
  E_plateArrows(ctx, X0 + 120, X1 - 110, oo ? 444 : 360, false, !!st._side);
  label(ctx, 'ร่องลึกก้นสมุทร', xt - 6, 422, { size: 14, wt: 700, color: '#fff' });
  label(ctx, 'แผ่นมหาสมุทร', X0 + 90, 520, { size: 14, wt: 700, color: '#fff' });
  label(ctx, oo ? 'แผ่นมหาสมุทร' : 'แผ่นทวีป', X1 - 90, oo ? 520 : 420, { size: 14, wt: 700, color: oo ? '#fff' : '#5a4020' });
  label(ctx, 'มุดตัว (subduction)', slab[Math.min(30, slab.length - 1)][0] - 40, slab[Math.min(30, slab.length - 1)][1] + 54, { size: 14, wt: 700, color: '#fff' });
  if (vh > 30) label(ctx, oo ? 'หมู่เกาะภูเขาไฟรูปโค้ง (island arc)' : 'เทือกเขาภูเขาไฟ', xv, vb - vh - (oo ? 22 : 64), { size: 15, wt: 700, color: '#8a4b2a', bg: 'rgba(255,255,255,0.9)', pad: 5 });
  label(ctx, '★ แผ่นดินไหว', X1 - 70, 656, { size: 14, wt: 700, color: '#7a5d00', bg: 'rgba(255,236,150,0.9)', pad: 4 });
  info.land = oo ? (vh > 70 ? 'ร่องลึกก้นสมุทร และหมู่เกาะภูเขาไฟรูปโค้ง' : 'ร่องลึกก้นสมุทร ภูเขาไฟใต้ทะเลเริ่มก่อตัว') : (vh > 30 ? 'ร่องลึกก้นสมุทร และเทือกเขาภูเขาไฟบนทวีป' : 'ร่องลึกก้นสมุทร แผ่นมหาสมุทรเริ่มมุดตัว');
  info.place = oo ? 'ญี่ปุ่น · หมู่เกาะมาเรียนา (ร่องลึกมาเรียนา ลึก ~11 กม.)' : 'เทือกเขาแอนดีส (อเมริกาใต้)';
}
function E_drawCol(ctx, t, P, d, ys, top, bot, info) {
  const { X0, X1, cx, st } = P, c = smooth(0, 0.45, d), m = smooth(0.4, 1, d), gap = 180 * (1 - c), xe = cx - gap, xr = cx;
  E_ASTH(ctx, X0, 430, X1 - X0, bot);
  const mtn = (x) => m * 96 * Math.exp(-(((x - cx) / (60 + 90 * m)) ** 2));
  const root = (x) => m * 70 * Math.exp(-(((x - cx) / (70 + 80 * m)) ** 2));
  // remnant ocean slab, detaches once continents collide
  const sl = E_slab(xr - 6, 480, 90 + 140 * d).map(([x, y]) => [x, y + (m > 0.35 ? 30 * smooth(0.35, 0.8, m) : 0)]);
  E_poly(ctx, [...sl, ...E_offset(sl, 34).reverse()], E_CRUST_O);
  if (gap > 4) { E_water(ctx, xe, xr + 4, ys, 470, t); ctx.fillStyle = E_CRUST_O; ctx.fillRect(xe, 470, gap + 4, 46); }
  const plate = (x0, x1) => {
    const crust = [], lith = [];
    for (let k = 0; k <= 24; k++) { const x = lerp(x0, x1, k / 24); crust.push([x, 384 - mtn(x)]); }
    for (let k = 24; k >= 0; k--) { const x = lerp(x0, x1, k / 24); crust.push([x, 470 + root(x)]); }
    for (let k = 0; k <= 24; k++) { const x = lerp(x0, x1, k / 24); lith.push([x, 470 + root(x) - 2]); }
    for (let k = 24; k >= 0; k--) { const x = lerp(x0, x1, k / 24); lith.push([x, 552 + root(x) * 0.6]); }
    E_poly(ctx, lith, E_LITH); E_poly(ctx, crust, E_CRUST_C, 'rgba(60,40,20,0.35)', 1.5);
    ctx.save(); E_poly(ctx, crust, null); ctx.clip();
    for (let k = 0; k < 4; k++) {
      const pts = [];
      for (let x = x0; x <= x1; x += 6) pts.push([x, 404 + k * 20 - mtn(x) * (0.8 - k * 0.12) + root(x) * k * 0.25 + m * 9 * Math.sin((x - cx) * 0.07 + k) * Math.exp(-(((x - cx) / 150) ** 2))]);
      E_line(ctx, pts, 'rgba(110,75,40,0.45)', 2.5);
    }
    ctx.restore();
  };
  plate(X0 - 10, xe); plate(xr, X1 + 10);
  if (gap < 6) E_line(ctx, [[cx, 384 - mtn(cx) + 6], [cx + 10, 470 + root(cx)]], 'rgba(60,30,20,0.55)', 2, [6, 5]);
  E_plateArrows(ctx, X0 + 110, X1 - 110, 362 - 6 * m, false, !!st._side);
  label(ctx, 'แผ่นทวีป', X0 + 70, 420, { size: 14, wt: 700, color: '#5a4020' });
  label(ctx, 'แผ่นทวีป', X1 - 70, 420, { size: 14, wt: 700, color: '#5a4020' });
  if (gap > 40) label(ctx, 'มหาสมุทรแคบลง', (xe + xr) / 2, 440, { size: 14, wt: 700, color: '#fff' });
  if (m > 0.2) {
    label(ctx, 'เทือกเขาโก่งตัว (fold mountains)', cx + 130, 318, { size: 15, wt: 700, color: '#8a4b2a', bg: 'rgba(255,255,255,0.9)', pad: 5, align: 'left' });
    label(ctx, 'รากเทือกเขาหนาลง', cx - 190, 600, { size: 13, wt: 700, color: '#fff', align: 'left' });
  }
  label(ctx, 'ไม่มีภูเขาไฟ: เปลือกทวีปเบา ไม่มุดลึก', X0 + 16, 290, { size: 14, wt: 700, color: C.soft, align: 'left' });
  info.land = m > 0.2 ? `เทือกเขาสูงโก่งตัว (ยกตัวแล้ว ~${E_fmt(m * 8.8, 1)} กม.)` : 'มหาสมุทรระหว่างทวีปค่อย ๆ ปิด';
  info.place = 'เทือกเขาหิมาลัย (อินเดียชนยูเรเชีย) · เอเวอเรสต์ 8,849 ม.';
}
function E_drawTf(ctx, t, P, s, top, bot, info) {
  const { X0, X1, cx, st } = P, W = X1 - X0, off = 80 * s;
  const side = (x0, x1, dy, col) => {
    ctx.save(); ctx.beginPath(); ctx.rect(x0, top, x1 - x0, bot - top); ctx.clip();
    ctx.fillStyle = col; ctx.fillRect(x0, top, x1 - x0, bot - top);
    for (let k = 0; k < 40; k++) { const x = x0 + mod1(k * 0.618) * (x1 - x0), y = top + mod1(k * 0.37 + dy / (bot - top) + 2) * (bot - top); circle(ctx, x, y, 5 + (k % 3) * 2, 'rgba(70,110,50,0.35)'); }
    const ry = 380 + dy, sy = 520 + dy;
    ctx.fillStyle = '#7b7f86'; ctx.fillRect(x0, ry - 12, x1 - x0, 24);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.setLineDash([14, 12]); ctx.beginPath(); ctx.moveTo(x0, ry); ctx.lineTo(x1, ry); ctx.stroke(); ctx.setLineDash([]);
    const sp = []; for (let x = x0; x <= x1; x += 6) sp.push([x, sy + 10 * Math.sin((x - cx) * 0.035)]);
    E_line(ctx, sp, '#3d8fd1', 12); E_line(ctx, sp, 'rgba(255,255,255,0.35)', 3, [8, 10], -t * 30);
    ctx.restore();
  };
  side(X0, cx, -off, '#d9c79c'); side(cx, X1, off, '#cdb98a');
  ctx.strokeStyle = '#5a2d17'; ctx.lineWidth = 4; ctx.beginPath();
  for (let y = top; y <= bot; y += 10) { const x = cx + 3 * Math.sin(y * 0.3); y === top ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke();
  // quake flashes where the fault slips
  for (const f of st._fl || []) {
    const a = P.clock - f.t0; if (a > 1.6) continue;
    const r = 10 + a * 70 * f.r;
    ctx.strokeStyle = `rgba(201,42,42,${0.8 * (1 - a / 1.6)})`; ctx.lineWidth = 3; ring(ctx, cx, f.y, r); ring(ctx, cx, f.y, r * 0.6);
    E_star(ctx, cx, f.y, 14 * (1 - a / 1.6) + 4, `rgba(255,212,59,${1 - a / 1.6})`, 8);
  }
  const dir = st._dir || 1, col = st._side ? '#e8590c' : 'rgba(37,48,58,0.75)';
  arrow(ctx, X0 + 120, 470 + 40 * dir, X0 + 120, 470 - 40 * dir, { color: col, w: 7, head: 18 });
  arrow(ctx, X1 - 120, 470 - 40 * dir, X1 - 120, 470 + 40 * dir, { color: col, w: 7, head: 18 });
  label(ctx, 'แผ่นธรณี A', X0 + 120, 300, { size: 15, wt: 700, color: '#5a4020', bg: 'rgba(255,255,255,0.8)', pad: 4 });
  label(ctx, 'แผ่นธรณี B', X1 - 120, 300, { size: 15, wt: 700, color: '#5a4020', bg: 'rgba(255,255,255,0.8)', pad: 4 });
  label(ctx, 'รอยเลื่อน', cx, 284, { size: 14, wt: 700, color: '#fff', bg: 'rgba(90,45,23,0.9)', pad: 4 });
  label(ctx, 'มองจากด้านบน', X1 - 16, 640, { size: 13, wt: 700, color: C.soft, align: 'right' });
  label(ctx, 'N ↑', X0 + 30, 640, { size: 15, wt: 700, color: C.soft });
  info.land = Math.abs(s) < 0.05 ? 'รอยเลื่อนตรง ถนนและลำน้ำยังต่อกัน' : 'ถนนและลำน้ำที่เคยต่อกันถูกเลื่อนเยื้องออกจากกัน';
  info.place = 'รอยเลื่อนซานแอนเดรียส (สหรัฐฯ) · รอยเลื่อนสะกาย (เมียนมา)';
}

// ------------------------------------------------------------ page 40 · seismic waves and the seismogram
const E_VP = 6.0, E_VS = 3.45, E_VR = 3.0;
const E_MMI = ['', 'ไม่รู้สึก วัดได้ด้วยเครื่องมือเท่านั้น', 'คนอยู่นิ่ง ๆ บนตึกสูงรู้สึกได้', 'คนในอาคารรู้สึก เหมือนรถบรรทุกวิ่งผ่าน', 'ของในบ้านสั่น หน้าต่างกระทบกันดัง',
  'คนส่วนใหญ่รู้สึก ของเล็ก ๆ ตกจากชั้น', 'ทุกคนรู้สึก ผนังปูนร้าว เดินลำบาก', 'อาคารที่สร้างไม่ดีเสียหายมาก', 'อาคารทั่วไปเสียหาย บางส่วนพังลง',
  'อาคารเสียหายรุนแรง ฐานรากเคลื่อน', 'อาคารส่วนใหญ่พัง รางรถไฟคดงอ', 'สะพานพัง พื้นดินแยกเป็นร่อง', 'ทำลายเกือบทั้งหมด เห็นพื้นดินเป็นคลื่น'];
const E_ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
function E_trace(tau, tp, ts, tr) {
  let y = 0;
  if (tau > tp) { const u = tau - tp; y += 0.35 * (Math.exp(-u / 7) * 0.8 + 0.12) * (Math.sin(u * 4.1) + 0.5 * Math.sin(u * 7.3 + 0.7)); }
  if (tau > ts) { const u = tau - ts; y += 0.8 * (Math.exp(-u / 12) * 0.85 + 0.1) * (Math.sin(u * 2.3) + 0.4 * Math.sin(u * 3.9 + 1.3)); }
  if (tau > tr) { const u = (tau - tr) / 9; y += 1.25 * u * Math.exp(1 - u) * Math.sin((tau - tr) * 0.95); }
  return y;
}
function E_dSeismo(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 248, bot = 700, mapB = 486;
  const ex = X0 + 96, ey = 368, sx = st.sx, sy = st.sy, dkm = Math.hypot(sx - ex, sy - ey) * 1.0;
  const tp = dkm / E_VP, ts = dkm / E_VS, tr = dkm / E_VR, tau = mod1(t / 13) * 240;
  stitle(ctx, 'ก. ลากสถานีวัดให้ห่างจากจุดเหนือศูนย์เกิดแผ่นดินไหว', X0, 206, th);
  ctx.save(); rr(ctx, X0, top, W, bot - top, 16); ctx.clip();
  ctx.fillStyle = '#efe6cf'; ctx.fillRect(X0, top, W, mapB - top);
  ctx.strokeStyle = 'rgba(120,100,60,0.15)'; ctx.lineWidth = 1;
  for (let x = X0 + 40; x < X1; x += 60) { ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, mapB); ctx.stroke(); }
  for (let y = top + 30; y < mapB; y += 60) { ctx.beginPath(); ctx.moveTo(X0, y); ctx.lineTo(X1, y); ctx.stroke(); }
  ctx.save(); ctx.beginPath(); ctx.rect(X0, top, W, mapB - top); ctx.clip();
  const fronts = [[E_VR, '#7048e8', 10, 0.25], [E_VS, '#d9480f', 4, 0.8], [E_VP, '#1c7ed6', 3, 0.8]];
  for (const [v, col, w, a] of fronts) { const r = v * tau; if (r > 900) continue; ctx.strokeStyle = rgba(col, a * clamp(1 - r / 900, 0.2, 1)); ctx.lineWidth = w; ring(ctx, ex, ey, r); }
  ctx.restore();
  E_line(ctx, [[ex, ey], [sx, sy]], 'rgba(37,48,58,0.55)', 2, [6, 5]);
  label(ctx, `${E_fmt(dkm)} กม.`, (ex + sx) / 2, (ey + sy) / 2 - 16, { size: 15, wt: 700, color: C.ink, bg: 'rgba(255,255,255,0.9)', pad: 4 });
  E_star(ctx, ex, ey, 18, '#c92a2a', 8); circle(ctx, ex, ey, 4, '#fff');
  label(ctx, 'จุดเหนือศูนย์ (epicentre)', ex, ey + 32, { size: 14, wt: 700, color: '#c92a2a', bg: 'rgba(255,255,255,0.85)', pad: 4 });
  E_poly(ctx, [[sx, sy - 16], [sx + 14, sy + 10], [sx - 14, sy + 10]], '#25303a', '#fff', 2.5);
  for (const s of [-1, 1]) arrow(ctx, sx + s * 22, sy, sx + s * 36, sy, { color: C.ink, w: 3, head: 9 });
  label(ctx, 'สถานีวัด', sx, sy + 28, { size: 14, wt: 700, color: C.ink, bg: 'rgba(255,255,255,0.85)', pad: 4 });
  ctx.fillStyle = C.ink; ctx.fillRect(X1 - 136, top + 34, 100, 4);
  label(ctx, '100 กม.', X1 - 86, top + 20, { size: 13, wt: 700, color: C.ink });
  [['P', '#1c7ed6'], ['S', '#d9480f'], ['พื้นผิว', '#7048e8']].forEach(([n, c], i) => { circle(ctx, X0 + 22, top + 22 + i * 22, 6, c); label(ctx, 'คลื่น ' + n, X0 + 34, top + 22 + i * 22, { size: 14, wt: 700, color: c, align: 'left' }); });
  // seismogram
  const g0 = X0 + 24, g1 = X1 - 20, gy = 596, gh = 66, sxs = (g1 - g0) / 240;
  ctx.fillStyle = '#fdfbf6'; ctx.fillRect(X0, mapB, W, bot - mapB);
  ctx.fillStyle = E_LINE; ctx.fillRect(X0, mapB, W, 2);
  label(ctx, 'คลื่นไหวสะเทือนที่สถานีบันทึกได้ (seismogram)', X0 + 16, mapB + 18, { size: 14, wt: 700, color: C.soft, align: 'left' });
  for (let s = 0; s < 240; s += 30) { const x = g0 + s * sxs; ctx.fillStyle = 'rgba(37,48,58,0.12)'; ctx.fillRect(x, gy - gh, 1, gh * 2); label(ctx, String(s), x, gy + gh + 12, { size: 11, wt: 600, color: C.soft }); }
  label(ctx, 'วินาที', g1, gy + gh + 12, { size: 11, wt: 700, color: C.soft, align: 'right' });
  const amp = Math.pow(1.75, st.mag - 5) * 1.1 * (180 / (180 + dkm));
  ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let x = g0; x <= g0 + tau * sxs; x += 1) { const s = (x - g0) / sxs, y = gy - gh * Math.tanh(amp * E_trace(s, tp, ts, tr)) - 1.6 * (Math.sin(s * 7.1) + 0.6 * Math.sin(s * 11.3 + 1)); x === g0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke();
  circle(ctx, g0 + tau * sxs, gy - gh * Math.tanh(amp * E_trace(tau, tp, ts, tr)), 4, '#c92a2a');
  const mk = (s, col, txt, row) => { if (s > 240) return; const x = g0 + s * sxs; ctx.strokeStyle = rgba(col, 0.8); ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, gy - gh); ctx.lineTo(x, gy + gh); ctx.stroke(); ctx.setLineDash([]); label(ctx, txt, x + 4, gy - gh + 10 + row * 22, { size: 13, wt: 700, color: col, align: 'left', bg: 'rgba(253,251,246,0.9)', pad: 3 }); };
  mk(tp, '#1c7ed6', 'P', 0); mk(ts, '#d9480f', 'S', 0); mk(tr, '#7048e8', 'พื้นผิว', 1);
  if (ts <= 240) {
    const xa = g0 + tp * sxs, xb = g0 + ts * sxs, yy = gy + gh - 8;
    if (xb - xa > 26) { arrow(ctx, (xa + xb) / 2, yy, xa + 2, yy, { color: C.ink, w: 2, head: 8 }); arrow(ctx, (xa + xb) / 2, yy, xb - 2, yy, { color: C.ink, w: 2, head: 8 }); }
    label(ctx, `S−P ${E_fmt(ts - tp, 1)} วินาที`, xb - xa < 130 ? xb + 66 : (xa + xb) / 2, yy - 14, { size: 13, wt: 700, color: C.ink, bg: 'rgba(255,255,255,0.9)', pad: 3 });
  }
  ctx.restore();
  E_frame(ctx, X0, top, W, bot - top);
  E_hint(ctx, P, 'ลากสถานี ▲ ออกห่าง → ช่วง S−P กว้างขึ้น', mapB - 22);
  P.zones.push({ x: X0, y: top, w: W, h: mapB - top, cursor: 'grab', drag: (qx, qy) => { if (qx < 0) return; st.sx = clamp(qx, ex + 40, X1 - 20); st.sy = clamp(qy, top + 20, mapB - 20); } });
  // readout
  const ry = 712, sp = ts - tp;
  E_card(ctx, X0, ry, W, 88, th.a);
  label(ctx, `ระยะจริง ${E_fmt(dkm)} กม.`, X0 + 22, ry + 28, { size: 24, wt: 600, color: th.a, align: 'left', fam: F.display });
  label(ctx, `ประมาณจาก S−P: 8 × ${E_fmt(sp, 1)} ≈ ${E_fmt(sp * 8.1)} กม.`, X1 - 18, ry + 28, { size: 18, wt: 700, color: C.ink, align: 'right' });
  label(ctx, `P มาถึง ${E_fmt(tp, 1)} วินาที  ·  S มาถึง ${E_fmt(ts, 1)} วินาที  ·  S−P = ${E_fmt(sp, 1)} วินาที`, X0 + 22, ry + 64, { size: 18, wt: 600, color: C.ink, align: 'left' });
  // magnitude
  const M = st.mag, E = Math.pow(10, 1.5 * (M - 5));
  const eTxt = E >= 1 ? `×${E_fmt(E, E < 10 ? 1 : 0)}` : `1/${E_fmt(1 / E)}`;
  slider(ctx, P, 'mag', X0 + 40, 850, W - 80, { min: 3, max: 9, title: 'ขนาดแผ่นดินไหว (magnitude)', value: `M ${M.toFixed(1)} · พลังงาน ${eTxt} ของ M5`, left: 'M3 เล็ก', right: 'M9 ใหญ่มาก' });
  const R = Math.hypot(dkm, 15), I = clamp(Math.round(1.45 * M - 0.9 - 2.6 * Math.log10(R / 10)), 1, 12);
  const ic = I >= 9 ? '#c92a2a' : I >= 7 ? '#e8590c' : I >= 5 ? '#e67700' : '#2b8a3e';
  E_card(ctx, X0, 894, W, 66, ic);
  label(ctx, E_ROMAN[I], X0 + 56, 927, { size: 32, wt: 600, color: ic, fam: F.display });
  label(ctx, `ความรุนแรงที่สถานี (เมอร์คัลลี) · ${E_MMI[I]}`, X0 + 102, 915, { size: 17, wt: 700, color: C.ink, align: 'left' });
  label(ctx, 'ขนาดเท่าเดิม แต่ยิ่งไกล ความรุนแรงยิ่งลดลง', X0 + 102, 942, { size: 15, wt: 500, color: C.soft, align: 'left' });
  // three stations
  stitle(ctx, 'ข. สถานี 3 แห่ง หาตำแหน่งจุดเหนือศูนย์', X0, 968, th);
  const qx = X0 + 150, qy = 1056, sts = [[-84, -16], [72, -22], [12, 30]];
  ctx.fillStyle = '#efe6cf'; rr(ctx, X0, 1006, 300, 100, 12); ctx.fill();
  ctx.save(); rr(ctx, X0, 1006, 300, 100, 12); ctx.clip();
  sts.forEach(([dx, dy], i) => { const r = Math.hypot(dx, dy) * (1 + 0.04 * Math.sin(t * 2 + i)); ctx.strokeStyle = rgba(['#1c7ed6', '#2b8a3e', '#7048e8'][i], 0.8); ctx.lineWidth = 2; ring(ctx, qx + dx, qy + dy, r); });
  ctx.restore();
  sts.forEach(([dx, dy], i) => E_poly(ctx, [[qx + dx, qy + dy - 8], [qx + dx + 7, qy + dy + 5], [qx + dx - 7, qy + dy + 5]], ['#1c7ed6', '#2b8a3e', '#7048e8'][i]));
  E_star(ctx, qx, qy, 9, '#c92a2a');
  para(ctx, 'แต่ละสถานีหาระยะจากช่วง S−P แล้ววาดวงกลมรัศมีเท่าระยะนั้น จุดที่วงกลม 3 วงตัดกันคือจุดเหนือศูนย์เกิดแผ่นดินไหว', X0 + 320, 1010, W - 316, 17, { color: C.ink, lh: 26 });
}

// ------------------------------------------------------------ page 42 · volcano shape vs silica
const E_VK = [
  { f: 0.08, B: 320, H: 82, p: 2.0, q: 1.0, cr: 30 },
  { f: 0.35, B: 112, H: 98, p: 1.0, q: 1.0, cr: 24 },
  { f: 0.80, B: 236, H: 232, p: 1.0, q: 1.9, cr: 14 },
];
function E_vparams(f) {
  const K = E_VK;
  if (f <= K[0].f) return K[0];
  for (let i = 1; i < K.length; i++) if (f <= K[i].f) {
    const u = smooth(0, 1, (f - K[i - 1].f) / (K[i].f - K[i - 1].f)), o = {};
    for (const k of ['B', 'H', 'p', 'q', 'cr']) o[k] = lerp(K[i - 1][k], K[i][k], u);
    return o;
  }
  return K[K.length - 1];
}
const E_VTYPE = [
  { name: 'ภูเขาไฟรูปโล่ (shield)', style: 'ปะทุไม่รุนแรง ลาวาพุและไหลไกล', ex: 'เมานาโลอา · คีเลาเอีย (ฮาวาย)' },
  { name: 'กรวยกรวดภูเขาไฟ (cinder cone)', style: 'พ่นลูกไฟและเศษหินเป็นระยะ', ex: 'ปาริคูติน (เม็กซิโก)' },
  { name: 'ภูเขาไฟสลับชั้น (stratovolcano)', style: 'ปะทุระเบิดรุนแรง เสาเถ้าสูงหลายกิโลเมตร', ex: 'ฟูจิ (ญี่ปุ่น) · ปินาตูโบ (ฟิลิปปินส์)' },
];
const E_vtype = (f) => f < 0.25 ? 0 : f < 0.47 ? 1 : 2;
function E_dVolcano(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 248, bot = 700, yg = 604;
  const si = st.si, f = (si - 45) / 30, V = E_vparams(f), ty = E_vtype(f);
  const prof = (x) => { const r = Math.abs(x - cx) / V.B; if (r >= 1) return 0; let h = V.H * Math.pow(1 - Math.pow(r, V.p), V.q); const dx = Math.abs(x - cx); if (dx < V.cr) h -= (V.cr - dx) * 0.45; return h; };
  const peak = yg - prof(cx);
  const magma = mix('#ffc233', '#a51d1d', f), boom = smooth(0.5, 0.85, f), lava = 1 - smooth(0.2, 0.55, f), bombs = smooth(0.15, 0.38, f) * (1 - smooth(0.55, 0.8, f));
  stitle(ctx, 'ก. ปริมาณซิลิกากำหนดรูปร่างภูเขาไฟและการปะทุ', X0, 206, th);
  ctx.save(); rr(ctx, X0, top, W, bot - top, 16); ctx.clip();
  let g = ctx.createLinearGradient(0, top, 0, yg); g.addColorStop(0, mix('#cfe3f2', '#9aa3ad', boom * 0.7)); g.addColorStop(1, '#f4f1ea');
  ctx.fillStyle = g; ctx.fillRect(X0, top, W, yg - top);
  ctx.fillStyle = '#8c7a62'; ctx.fillRect(X0, yg, W, bot - yg);
  ctx.strokeStyle = 'rgba(60,45,30,0.25)'; ctx.lineWidth = 2;
  for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(X0, yg + k * 24); ctx.lineTo(X1, yg + k * 24); ctx.stroke(); }
  // magma chamber + conduit
  ctx.beginPath(); ctx.ellipse(cx, 668, 110, 26, 0, 0, Math.PI * 2); ctx.fillStyle = magma; ctx.fill();
  E_poly(ctx, [[cx - 9, 650], [cx + 9, 650], [cx + 6, peak + 8], [cx - 6, peak + 8]], magma);
  // cone
  const cone = [[cx - V.B - 2, yg + 1]];
  for (let x = cx - V.B; x <= cx + V.B; x += 4) cone.push([x, yg - prof(x)]);
  cone.push([cx + V.B + 2, yg + 1]);
  E_poly(ctx, cone, mix('#5d4a3e', '#8d8478', f), 'rgba(40,30,20,0.5)', 2);
  ctx.save(); E_poly(ctx, cone, null); ctx.clip();
  const nl = Math.round(lerp(4, 6, f));
  for (let k = 1; k < nl; k++) {
    const pts = []; for (let x = cx - V.B; x <= cx + V.B; x += 6) pts.push([x, yg - prof(x) * (1 - k / nl)]);
    if (f > 0.45 && k % 2) { const band = pts.concat(pts.slice().reverse().map(([x, y]) => [x, y + 8])); E_poly(ctx, band, 'rgba(70,55,48,0.55)'); }
    else E_line(ctx, pts, 'rgba(40,25,15,0.35)', 2);
  }
  E_poly(ctx, [[cx - 7, yg], [cx + 7, yg], [cx + 6, peak + 8], [cx - 6, peak + 8]], magma);
  ctx.restore();
  // bubbles: escape freely in runny magma, trapped in viscous magma
  const rise = lerp(70, 6, f);
  for (let k = 0; k < 16; k++) {
    const u = mod1(t * rise / 120 + k / 16), x = cx + Math.sin(k * 2.7) * lerp(90, 60, f) * (1 - u * 0.9), y = lerp(686, 650, u) - (f < 0.4 ? u * 30 : 0);
    circle(ctx, x, y, lerp(5, 2.2, f) * (0.7 + 0.3 * Math.sin(k)), `rgba(255,255,230,${lerp(0.85, 0.55, f)})`);
  }
  for (let k = 0; k < 8; k++) { const u = mod1(t * rise / 160 + k / 8), y = lerp(650, peak + 12, f > 0.5 ? u * 0.45 : u); circle(ctx, cx + Math.sin(k + t * 3) * 3, y, lerp(3.5, 1.8, f), 'rgba(255,255,230,0.8)'); }
  if (f > 0.5) { glow(ctx, cx, 640 - (650 - peak) * 0.3, 30, `rgba(255,255,200,${0.5 * boom})`); label(ctx, 'ก๊าซถูกกัก แรงดันสูง', cx + 22, 630, { size: 13, wt: 700, color: '#fff', bg: 'rgba(120,30,30,0.85)', pad: 4, align: 'left' }); }
  // lava flows down the flanks
  if (lava > 0.05) for (const s of [-1, 1]) {
    const L = V.B * lerp(0.35, 0.95, lava), pts = [];
    for (let dx = V.cr * 0.6; dx <= L; dx += 5) pts.push([cx + s * dx, yg - prof(cx + s * dx) - 2]);
    E_line(ctx, pts, `rgba(255,120,30,${0.9 * lava})`, 7); E_line(ctx, pts, `rgba(255,230,120,${0.9 * lava})`, 2.5, [10, 14], s * t * 40);
  }
  // fountain and bombs
  const nb = 22, hmax = lerp(50, 160, bombs);
  for (let k = 0; k < nb; k++) {
    const u = mod1(t * 0.7 + k * 0.618), a = (k * 0.37 % 1 - 0.5) * lerp(0.7, 1.6, bombs), vx = Math.sin(a) * hmax * 1.2, vy = hmax * 2;
    const x = cx + vx * u, y = peak - (vy * u - hmax * 2 * u * u);
    const on = Math.max(lava * 0.9, bombs);
    if (on < 0.05) continue;
    const big = bombs > lava; circle(ctx, x, y, big ? 4.5 : 3, big ? `rgba(120,30,20,${on})` : `rgba(255,${180 + (k % 3) * 20},60,${on})`);
    if (big) glow(ctx, x, y, 9, `rgba(255,120,40,${0.5 * on})`);
  }
  // ash column, umbrella cloud, pyroclastic flow
  if (boom > 0.03) {
    for (let k = 0; k < 22; k++) {
      const u = mod1(t * 0.1 + k / 22), y = lerp(peak - 6, top + 40, u), spread = u > 0.75 ? (u - 0.75) * 4 : 0;
      const x = cx + Math.sin(k * 2.3 + t * 0.5) * (8 + u * 28) + Math.sin(k * 1.7) * spread * 210, r = 10 + u * 26 + spread * 14;
      circle(ctx, x, y, r, `rgba(${100 + k % 3 * 12},${98 + k % 3 * 12},${96 + k % 3 * 10},${0.5 * boom * (u < 0.92 ? 1 : (1 - u) * 12)})`);
    }
    if (boom > 0.5) { const u = mod1(t * 0.18), dx = V.cr + u * V.B * 0.9; for (let k = 0; k < 5; k++) circle(ctx, cx + dx - k * 12, yg - prof(cx + dx - k * 12) - 10 - k * 3, 14 + k * 3, `rgba(130,125,118,${0.6 * (1 - u) * (boom - 0.5) * 2})`); }
  }
  label(ctx, 'แมกมา (magma)', cx - 200, 634, { size: 14, wt: 700, color: '#fff', bg: 'rgba(60,30,20,0.7)', pad: 4 });
  if (lava > 0.6) label(ctx, 'ลาวา (lava) ไหลไกล', cx + V.B * 0.6, yg - 64, { size: 14, wt: 700, color: '#a33c0c', bg: 'rgba(255,255,255,0.85)', pad: 4 });
  if (boom > 0.4) label(ctx, 'เสาเถ้าภูเขาไฟ', cx + 120, top + 70, { size: 14, wt: 700, color: '#495057', bg: 'rgba(255,255,255,0.85)', pad: 4 });
  label(ctx, '← ซิลิกาน้อย · หนืดน้อย', X0 + 16, top + 22, { size: 15, wt: 700, color: '#d9480f', align: 'left' });
  label(ctx, 'ซิลิกามาก · หนืดมาก →', X1 - 16, top + 22, { size: 15, wt: 700, color: '#862e9c', align: 'right' });
  ctx.restore();
  E_frame(ctx, X0, top, W, bot - top);
  E_hint(ctx, P, 'ลากซ้าย-ขวาบนภาพเพื่อเปลี่ยนปริมาณซิลิกาในแมกมา', bot - 20);
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: 'ew-resize', drag: (qx) => { if (qx < 0) return; st.si = 45 + 30 * clamp((qx - X0 - 40) / (W - 80), 0, 1); } });
  // readout
  const rock = si < 52 ? 'บะซอลต์ (basalt)' : si < 57 ? 'บะซอลต์-แอนดีไซต์' : si < 63 ? 'แอนดีไซต์ (andesite)' : si < 69 ? 'ดาไซต์ (dacite)' : 'ไรโอไลต์ (rhyolite)';
  const le = Math.round(clamp(1 + (si - 48) / 27 * 9, 1, 10)), vw = le <= 2 ? 'ต่ำ' : le <= 5 ? 'ปานกลาง' : le <= 7 ? 'สูง' : 'สูงมาก';
  const gas = f < 0.3 ? 'ก๊าซหนีออกง่าย' : f < 0.55 ? 'ก๊าซหนีออกได้บางส่วน' : 'ก๊าซถูกกักไว้ แรงดันสูง', T = Math.round(lerp(1200, 800, f) / 50) * 50;
  const VT = E_VTYPE[ty], ry = 714;
  E_card(ctx, X0, ry, W, 124, th.a);
  label(ctx, VT.name, X0 + 22, ry + 28, { size: 25, wt: 600, color: th.a, align: 'left', fam: F.display });
  label(ctx, `ซิลิกา ${Math.round(si)}%`, X1 - 18, ry + 28, { size: 22, wt: 700, color: C.ink, align: 'right' });
  label(ctx, `แมกมา${rock} ~${E_fmt(T)} °C · ความหนืด${vw} ≈ ${E_pow10(le)} Pa·s · ${gas}`, X0 + 22, ry + 66, { size: 17, wt: 600, color: C.ink, align: 'left' });
  label(ctx, `การปะทุ: ${VT.style} · ตัวอย่าง ${VT.ex}`, X0 + 22, ry + 98, { size: 17, wt: 600, color: C.ink, align: 'left' });
  slider(ctx, P, 'si', X0 + 40, 896, W - 80, { min: 45, max: 75, title: 'ปริมาณซิลิกา (SiO₂) ในแมกมา', value: `${Math.round(si)}%`, left: '45% บะซอลต์', right: '75% ไรโอไลต์' });
  // comparison cards
  stitle(ctx, 'ข. เปรียบเทียบภูเขาไฟ 3 ชนิด', X0, 940, th);
  const cw = (W - 24) / 3;
  E_VK.forEach((k, i) => {
    const x = X0 + i * (cw + 12), y = 980, on = i === ty;
    ctx.fillStyle = on ? rgba(th.a, 0.14) : 'rgba(255,255,255,0.5)'; rr(ctx, x, y, cw, 110, 12); ctx.fill();
    ctx.strokeStyle = on ? th.a : E_LINE; ctx.lineWidth = on ? 3 : 1.5; ctx.stroke();
    const s = 0.28, bx = x + cw / 2, by = y + 62, pts = [[bx - k.B * s - 1, by]];
    for (let q = -1; q <= 1.0001; q += 0.05) { const r = Math.abs(q); pts.push([bx + q * k.B * s, by - k.H * s * Math.pow(1 - Math.pow(r, k.p), k.q)]); }
    pts.push([bx + k.B * s + 1, by]);
    E_poly(ctx, pts, mix('#5d4a3e', '#8d8478', k.f));
    ctx.fillStyle = 'rgba(60,45,30,0.4)'; ctx.fillRect(x + 12, by, cw - 24, 2);
    label(ctx, ['รูปโล่', 'กรวยกรวด', 'สลับชั้น'][i], bx, y + 80, { size: 16, wt: 700, color: on ? th.a : C.ink });
    label(ctx, ['กว้าง ลาดชันน้อย', 'เล็ก ลาดชัน', 'สูง ชัน เป็นชั้น'][i], bx, y + 99, { size: 13, wt: 600, color: C.soft });
  });
  label(ctx, 'ไทยมีภูเขาไฟที่ดับแล้ว เช่น พนมรุ้ง (บุรีรัมย์)', cx, 1108, { size: 14, wt: 600, color: C.soft });
}

// ------------------------------------------------------------ page 44 · tsunami shoaling
const E_TSU = { shore: 500, max: 540, period: 0.25, H0: 0.6 };
const E_depth = (x) => x < 280 ? 4000 : x < 400 ? 4000 - 3800 * smooth(0, 1, (x - 280) / 120) : x < 500 ? 200 * Math.pow(1 - (x - 400) / 100, 1.6) : 0;
const E_vkmh = (d) => Math.sqrt(9.8 * Math.max(d, 2)) * 3.6;
let E_TCUM = null;
function E_timeToShore(x) {
  if (!E_TCUM) { E_TCUM = new Float32Array(E_TSU.shore + 1); for (let i = E_TSU.shore - 1; i >= 0; i--) E_TCUM[i] = E_TCUM[i + 1] + 1 / E_vkmh(E_depth(i + 0.5)); }
  const i = clamp(Math.floor(x), 0, E_TSU.shore); return E_TCUM[i];
}
function E_dTsunami(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 248, bot = 700, ys = 392;
  const x0p = X0 + 14, xsp = X1 - 108, KM = [0, 280, 400, 500, E_TSU.max], FR = [0, 0.42, 0.6, 1, 1 + (X1 - 86 - xsp) / (xsp - x0p)];
  const pw = (a, b, v) => { for (let i = 1; i < a.length; i++) if (v <= a[i] || i === a.length - 1) return lerp(b[i - 1], b[i], (v - a[i - 1]) / (a[i] - a[i - 1])); };
  const toPx = (km) => x0p + (xsp - x0p) * pw(KM, FR, km), toKm = (px) => pw(FR, KM, (px - x0p) / (xsp - x0p));
  const yBed = (km) => ys + 4 + 236 * Math.pow(E_depth(km) / 4000, 0.5);
  const xc = st.x, d = E_depth(Math.min(xc, 499.9)), v = E_vkmh(d), run = smooth(496, E_TSU.max, xc);
  const H = xc < E_TSU.shore ? E_TSU.H0 * Math.pow(4000 / Math.max(d, 2), 0.25) : E_TSU.H0 * Math.pow(2000, 0.25) * (1 + 0.5 * run), lam = v * E_TSU.period;
  const xw = Math.min(xc, E_TSU.shore - 1), ampPx = clamp(H * 10, 8, 64), sig = Math.max(lam * 0.2, 9), lead = xw + sig * 2.2;
  const eta = (km) => {
    const a = (km - xw) / sig, b = (km - lead) / (sig * 1.4);
    return ampPx * Math.exp(-a * a) - 0.8 * ampPx * Math.exp(-b * b) + 0.2 * ampPx * Math.exp(-(((km - xw + sig * 2.2) / sig) ** 2)) + 1.6 * Math.sin(km * 0.25 + t * 2);
  };
  stitle(ctx, 'ก. ลากยอดคลื่นสึนามิจากกลางมหาสมุทรเข้าหาฝั่ง', X0, 206, th);
  ctx.save(); rr(ctx, X0, top, W, bot - top, 16); ctx.clip();
  E_SKY(ctx, X0, top, W, ys + 20);
  // water
  ctx.beginPath(); ctx.moveTo(x0p - 20, bot);
  for (let px = x0p - 20; px <= xsp + 2; px += 3) ctx.lineTo(px, ys - eta(toKm(px)));
  ctx.lineTo(xsp + 2, bot); ctx.closePath();
  let g = ctx.createLinearGradient(0, ys - 40, 0, bot); g.addColorStop(0, '#4f9fd6'); g.addColorStop(1, '#0f3e70'); ctx.fillStyle = g; ctx.fill();
  // seabed
  const bed = [[x0p - 20, bot], [x0p - 20, yBed(0)]];
  for (let px = x0p; px <= xsp; px += 4) bed.push([px, yBed(toKm(px))]);
  const land = (px) => ys - 2 - (px - xsp) * 0.16 - 70 * smooth(X1 - 60, X1 - 16, px);
  for (let px = xsp; px <= X1 + 4; px += 4) bed.push([px, land(px)]);
  bed.push([X1 + 4, bot]);
  E_poly(ctx, bed, '#b39b72', 'rgba(70,50,30,0.5)', 2);
  const drained = xc < E_TSU.shore && [488, 492, 496].some(km => ys - eta(km) > yBed(km));
  // the source fault on the deep seafloor
  const fx = toPx(40), fyb = yBed(40);
  ctx.fillStyle = '#9b835c'; ctx.fillRect(fx, fyb - 12, 40, 12);
  E_line(ctx, [[fx, fyb - 12], [fx + 8, bot]], '#5a2d17', 3);
  arrow(ctx, fx + 20, fyb - 14, fx + 20, fyb - 44, { color: '#c92a2a', w: 4, head: 11 });
  E_star(ctx, fx + 4, fyb + 30, 12, '#c92a2a');
  label(ctx, 'แผ่นดินไหวยกพื้นทะเล', fx + 34, fyb - 34, { size: 13, wt: 700, color: '#fff', align: 'left' });
  // run-up over the land
  if (xc >= E_TSU.shore - 4) {
    const xf = Math.max(toPx(xc), xsp + 4), hh = ampPx * 0.9, pts = [[xsp - 2, ys - eta(E_TSU.shore)]];
    for (let px = xsp; px <= xf; px += 3) pts.push([px, land(px) - hh * (1 - (px - xsp) / Math.max(xf - xsp, 1)) - 2]);
    for (let px = xf; px >= xsp - 2; px -= 3) pts.push([px, land(px) + 1]);
    E_poly(ctx, pts, 'rgba(60,130,190,0.85)');
    for (let j = 0; j < 6; j++) { const px = lerp(xsp, xf, j / 6); circle(ctx, px, land(px) - hh * (1 - j / 6) - 3, 3, 'rgba(255,255,255,0.8)'); }
  }
  // houses, trees, high ground
  for (const [px, tp] of [[xsp + 16, 'h'], [xsp + 34, 't'], [xsp + 50, 'h']]) {
    const y = land(px);
    if (tp === 'h') { ctx.fillStyle = '#e9e1cf'; ctx.fillRect(px - 8, y - 14, 16, 14); E_poly(ctx, [[px - 10, y - 14], [px, y - 22], [px + 10, y - 14]], '#a6462a'); }
    else { E_line(ctx, [[px, y], [px + 2, y - 26]], '#6b4a2a', 3); circle(ctx, px + 2, y - 28, 8, '#4c8a3a'); }
  }
  const hx = X1 - 40, hy = land(hx);
  E_line(ctx, [[hx, hy], [hx, hy - 34]], '#25303a', 2.5); E_poly(ctx, [[hx, hy - 34], [hx + 20, hy - 28], [hx, hy - 22]], '#2b8a3e');
  label(ctx, 'ที่สูง', hx, hy + 16, { size: 13, wt: 700, color: '#2b8a3e', bg: 'rgba(255,255,255,0.85)', pad: 3 });
  // depth ticks on the seabed
  for (const [km, txt] of [[200, '4,000 ม.'], [400, '200 ม.']]) label(ctx, txt, toPx(km), yBed(km) + 22, { size: 13, wt: 700, color: '#5a4020', bg: 'rgba(255,255,255,0.7)', pad: 3 });
  label(ctx, 'ไหล่ทวีป', toPx(450), yBed(450) + 40, { size: 13, wt: 700, color: '#5a4020' });
  // crest handle
  const cxp = toPx(xc), cyp = (xc < E_TSU.shore ? ys - eta(xc) : land(cxp) - ampPx * 0.9 * (1 - run)) - 16;
  ctx.strokeStyle = 'rgba(37,48,58,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cxp, cyp + 12); ctx.lineTo(cxp, xc < E_TSU.shore ? yBed(xc) : land(cxp)); ctx.stroke(); ctx.setLineDash([]);
  circle(ctx, cxp, cyp, 11, '#fff'); ctx.strokeStyle = '#c92a2a'; ctx.lineWidth = 3.5; ring(ctx, cxp, cyp, 11);
  arrow(ctx, cxp - 15, cyp, cxp - 32, cyp, { color: '#c92a2a', w: 3, head: 9 }); arrow(ctx, cxp + 15, cyp, cxp + 32, cyp, { color: '#c92a2a', w: 3, head: 9 });
  if (drained) label(ctx, 'น้ำทะเลลดลงผิดปกติ!', X1 - 110, top + 60, { size: 15, wt: 700, color: '#fff', bg: '#c92a2a', pad: 5 });
  label(ctx, '← มหาสมุทรลึก', X0 + 16, top + 22, { size: 15, wt: 700, color: '#1c5f99', align: 'left' });
  label(ctx, 'ชายฝั่ง →', X1 - 16, top + 22, { size: 15, wt: 700, color: '#8a4b2a', align: 'right' });
  label(ctx, 'ความสูงคลื่นขยายเกินจริง · ระยะทางและความลึกไม่ตามมาตราส่วน', X1 - 16, bot - 52, { size: 12, wt: 600, color: 'rgba(255,255,255,0.8)', align: 'right' });
  ctx.restore();
  E_frame(ctx, X0, top, W, bot - top);
  E_hint(ctx, P, 'ลากยอดคลื่นไปทางขวาเข้าหาฝั่ง หรือลากกลับไปทะเลลึก', bot - 22);
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: 'ew-resize', drag: (qx) => { if (qx < 0) return; st.x = clamp(toKm(qx), 0, E_TSU.max); } });
  // readout
  const ry = 714, tt = xc < E_TSU.shore ? E_timeToShore(xc) : 0, hrs = Math.floor(tt), mins = Math.round((tt - hrs) * 60);
  E_card(ctx, X0, ry, W, 96, drained || run > 0 ? '#c92a2a' : th.a);
  if (xc < E_TSU.shore) {
    label(ctx, `ลึก ${E_fmt(Math.max(d, 1))} ม. → เร็ว ${E_fmt(v)} กม./ชม.`, X0 + 22, ry + 28, { size: 24, wt: 600, color: th.a, align: 'left', fam: F.display });
    label(ctx, `ถึงฝั่งอีก ≈ ${hrs ? hrs + ' ชม. ' : ''}${mins} นาที`, X1 - 18, ry + 28, { size: 18, wt: 700, color: C.ink, align: 'right' });
    label(ctx, drained ? `คลื่นสูง ≈ ${E_fmt(H, 1)} ม. · น้ำลดจนเห็นพื้นทะเล = สัญญาณเตือน รีบขึ้นที่สูงทันที` : `คลื่นสูง ≈ ${E_fmt(H, 1)} ม. · ความยาวคลื่น ≈ ${E_fmt(lam)} กม. · ยิ่งตื้น ยิ่งช้า สั้นลง และสูงขึ้น`, X0 + 22, ry + 66, { size: 17, wt: 600, color: drained ? '#c92a2a' : C.ink, align: 'left' });
  } else {
    label(ctx, `คลื่นซัดขึ้นฝั่ง สูง ≈ ${E_fmt(H, 1)} ม.`, X0 + 22, ry + 28, { size: 24, wt: 600, color: '#c92a2a', align: 'left', fam: F.display });
    label(ctx, 'น้ำทะลักเข้าแผ่นดิน พัดพาบ้านเรือน ต้องอพยพขึ้นที่สูงก่อนคลื่นมาถึง', X0 + 22, ry + 66, { size: 17, wt: 600, color: C.ink, align: 'left' });
  }
  // speed vs depth chart
  stitle(ctx, 'ข. อัตราเร็วของสึนามิกับความลึกของน้ำ  v = √(g·d)', X0, 826, th);
  const c0 = X0 + 60, c1 = X0 + 470, cy0 = 878, cy1 = 1068, dx = (dd) => lerp(c0, c1, dd / 5000), vy = (vv) => lerp(cy1, cy0, vv / 900);
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(c0, cy0, c1 - c0, cy1 - cy0);
  ctx.strokeStyle = 'rgba(37,48,58,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(c0, cy0, c1 - c0, cy1 - cy0);
  for (const dd of [0, 1000, 2000, 3000, 4000, 5000]) label(ctx, E_fmt(dd), dx(dd), cy1 + 14, { size: 12, wt: 600, color: C.soft });
  label(ctx, 'ความลึก (ม.)', c1, cy1 + 34, { size: 13, wt: 700, color: C.soft, align: 'right' });
  for (const vv of [0, 300, 600, 900]) { label(ctx, String(vv), c0 - 8, vy(vv), { size: 12, wt: 600, color: C.soft, align: 'right' }); ctx.fillStyle = 'rgba(37,48,58,0.08)'; ctx.fillRect(c0, vy(vv), c1 - c0, 1); }
  label(ctx, 'กม./ชม.', c0 - 8, cy0 - 14, { size: 12, wt: 700, color: C.soft, align: 'right' });
  for (const [vv, txt] of [[800, 'เครื่องบินเจ็ต'], [100, 'รถยนต์']]) { ctx.strokeStyle = 'rgba(37,48,58,0.35)'; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(c0, vy(vv)); ctx.lineTo(c1, vy(vv)); ctx.stroke(); ctx.setLineDash([]); label(ctx, txt, c1 - 6, vy(vv) - 10, { size: 12, wt: 700, color: C.soft, align: 'right' }); }
  ctx.strokeStyle = th.a; ctx.lineWidth = 3.5; ctx.beginPath();
  for (let dd = 0; dd <= 5000; dd += 50) { const X = dx(dd), Y = vy(E_vkmh(dd)); dd ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke();
  if (xc < E_TSU.shore) { circle(ctx, dx(d), vy(v), 8 + Math.sin(t * 4), '#fff'); circle(ctx, dx(d), vy(v), 6, th.a); }
  const tx = c1 + 26, tw = X1 - tx;
  para(ctx, '**4,000 ม.** เร็ว ≈ 713 กม./ชม. เท่าเครื่องบินเจ็ต แต่สูงไม่ถึง 1 ม.', tx, 874, tw, 16, { lh: 24, bcolor: th.a });
  para(ctx, '**50 ม.** เร็ว ≈ 80 กม./ชม. วิ่งหนีไม่ทัน', tx, 954, tw, 16, { lh: 24, bcolor: th.a });
  para(ctx, '**10 ม.** เร็ว ≈ 36 กม./ชม. คลื่นด้านหลังไล่ทัน ยอดคลื่นจึงสูงขึ้น', tx, 1010, tw, 16, { lh: 24, bcolor: th.a });
}

const PART_E = [
  { th: TH.earth, title: 'ทวีปเลื่อนและการแปรสัณฐานของแผ่นธรณี', sub: 'Continental drift and plate tectonics', blocks: [
    { p: 'ปี ค.ศ. 1912 **อัลเฟรด เวเกเนอร์ (Alfred Wegener)** เสนอ **ทฤษฎีทวีปเลื่อน (continental drift)** ว่าเมื่อราว 250 ล้านปีก่อน ทวีปทั้งหมดรวมเป็นมหาทวีป **แพนเจีย (Pangaea)** แล้วค่อย ๆ แยกเลื่อนมาอยู่ตำแหน่งปัจจุบัน' },
    { h: 'หลักฐานของทวีปเลื่อน' },
    { li: [
      '**ขอบทวีป** อเมริกาใต้กับแอฟริกาต่อกันได้พอดีเหมือนภาพตัดต่อ',
      '**ซากดึกดำบรรพ์** มีโซซอรัส (Mesosaurus) และกลอสซอปเทอริส (Glossopteris) พบในหลายทวีป',
      '**หินและแนวเทือกเขา** ชนิดและอายุเดียวกันต่อกันได้',
      '**รอยครูดธารน้ำแข็ง** พบในเขตร้อนปัจจุบัน เช่น อินเดีย แอฟริกา',
    ] },
    { h: 'การแผ่ขยายพื้นสมุทร (seafloor spreading)' },
    { p: 'ทศวรรษ 1960 **แฮร์รี เฮสส์ (Harry Hess)** เสนอว่าแมกมาดันขึ้นที่ **สันเขากลางมหาสมุทร** เกิดพื้นสมุทรใหม่ที่เลื่อนออกสองข้าง หลักฐานคือ **แถบแม่เหล็กบรรพกาล** สลับขั้วเป็นแถบ **สมมาตร** สองข้างสันเขา และหิน **อายุน้อยที่สุดที่สันเขา** แล้วเก่าขึ้นเมื่อห่างออกไป' },
    { box: '**ทฤษฎีการแปรสัณฐานของแผ่นธรณี (plate tectonics)** ธรณีภาค (lithosphere) แตกเป็นหลายแผ่น เคลื่อนบนฐานธรณีภาค (asthenosphere) ปีละไม่กี่เซนติเมตร ขับเคลื่อนด้วย **การพาความร้อนในเนื้อโลก (mantle convection)** แรงดึงจากแผ่นที่มุดตัว (slab pull) และแรงผลักจากสันเขา (ridge push)', tone: 'key' },
  ] },
  { kind: 'diagram', th: TH.earth, title: 'พื้นสมุทรแผ่ขยาย', sub: 'ภาพโต้ตอบ: ลากพื้นสมุทรออกจากสันเขา', draw: E_dSpread, init: () => ({ T: 1.5, rate: 6, px: 560 }) },
  { th: TH.earth, title: 'ขอบแผ่นธรณี', sub: 'Plate boundaries', blocks: [
    { p: 'แนวที่แผ่นธรณีพบกันคือ **ขอบแผ่นธรณี** มี 3 แบบตามทิศการเคลื่อนที่' },
    { h: 'แยกออกจากกัน (divergent)' },
    { p: 'แมกมาบะซอลต์ดันขึ้นเป็นเปลือกโลกใหม่ เกิด **สันเขากลางมหาสมุทร** หรือ **หุบเขาทรุด (rift valley)** บนทวีป เช่น ร่องหุบเขาแอฟริกาตะวันออก มีแผ่นดินไหวตื้นและภูเขาไฟแบบลาวาไหล' },
    { h: 'ชนกัน (convergent)' },
    { table: { cols: [0.3, 0.7], head: ['คู่ที่ชนกัน', 'ผลที่เกิดขึ้น'], rows: [
      ['มหาสมุทร-ทวีป', 'แผ่นมหาสมุทรหนาแน่นกว่าจึง **มุดตัว (subduction)** เกิดร่องลึกก้นสมุทรและเทือกเขาภูเขาไฟ เช่น เทือกเขาแอนดีส'],
      ['มหาสมุทร-มหาสมุทร', 'แผ่นหนึ่งมุดลงใต้อีกแผ่น เกิดร่องลึกก้นสมุทรและ **หมู่เกาะภูเขาไฟรูปโค้ง** เช่น ญี่ปุ่น หมู่เกาะมาเรียนา'],
      ['ทวีป-ทวีป', 'เปลือกทวีปเบา มุดได้ยาก จึงอัดตัวยกเป็น **เทือกเขาสูง** ไม่มีภูเขาไฟ เช่น เทือกเขาหิมาลัย'],
    ] } },
    { h: 'เฉือนกัน (transform)' },
    { p: 'แผ่นธรณีเลื่อนผ่านกันในแนวราบ ไม่สร้างและไม่ทำลายเปลือกโลก เกิด **แผ่นดินไหว** บ่อยแต่ไม่มีภูเขาไฟ เช่น รอยเลื่อนซานแอนเดรียส (สหรัฐอเมริกา) และ **รอยเลื่อนสะกาย** (เมียนมา) ซึ่งแรงสั่นส่งถึงไทยได้' },
    { box: 'แผ่นดินไหวและภูเขาไฟส่วนใหญ่ของโลกเกิดตามแนวขอบแผ่นธรณี', tone: 'note' },
  ] },
  { kind: 'diagram', th: TH.earth, title: 'ขอบแผ่นธรณีห้าแบบ', sub: 'ภาพโต้ตอบ: เลือกแบบ แล้วลากแผ่นธรณี', draw: E_dBounds, init: () => ({ mode: 1, d: 0.35 }) },
  { th: TH.hazard, title: 'แผ่นดินไหว', sub: 'Earthquakes', blocks: [
    { p: 'แผ่นธรณีที่เคลื่อนที่ทำให้หินสะสม **แรงเค้น (stress)** จนหินแตกและเลื่อนตาม **รอยเลื่อน (fault)** แล้วดีดกลับ เรียกว่า **การคืนตัวแบบยืดหยุ่น (elastic rebound)** พลังงานแผ่ออกเป็นคลื่นไหวสะเทือน' },
    { li: [
      '**จุดเกิดแผ่นดินไหว (focus, hypocentre)** จุดใต้ดินที่หินเริ่มแตก',
      '**จุดเหนือศูนย์เกิดแผ่นดินไหว (epicentre)** จุดบนผิวโลกที่อยู่ตรงขึ้นมา',
    ] },
    { table: { cols: [0.32, 0.68], head: ['คลื่น', 'ลักษณะ'], rows: [
      ['คลื่นปฐมภูมิ (P wave)', 'อัด-ขยายในแนวเดียวกับทิศคลื่น **เร็วที่สุด** ผ่านได้ทั้งของแข็งและของเหลว'],
      ['คลื่นทุติยภูมิ (S wave)', 'สั่นตั้งฉากกับทิศคลื่น ช้ากว่า P ผ่านได้ **เฉพาะของแข็ง**'],
      ['คลื่นพื้นผิว (Love, Rayleigh)', 'เคลื่อนตามผิวโลก **ช้าที่สุด** แต่สร้างความเสียหายมากที่สุด'],
    ] } },
    { p: '**ขนาด (magnitude)** บอกพลังงานที่ปล่อยออกมา (มาตราริกเตอร์ หรือมาตราขนาดโมเมนต์) ขนาดเพิ่ม 1 พลังงานเพิ่มราว **32 เท่า** ส่วน **ความรุนแรง (intensity)** บอกผลที่คนรู้สึกและความเสียหายแต่ละพื้นที่ ใช้มาตราเมอร์คัลลีปรับปรุง I–XII' },
    { p: '**เครื่องวัดแผ่นดินไหว (seismograph)** บันทึกคลื่น P ก่อน S ยิ่งไกลช่วง **S−P** ยิ่งยาว ใช้หาระยะทางได้ และใช้ 3 สถานีหาตำแหน่งจุดเหนือศูนย์' },
    { box: 'ไทยมีรอยเลื่อนมีพลังทางภาคเหนือและภาคตะวันตก เมื่อเกิดแผ่นดินไหวให้ **หมอบ ป้อง เกาะ** หมอบลงต่ำ ป้องศีรษะ และเกาะโต๊ะที่แข็งแรง', tone: 'warn' },
  ] },
  { kind: 'diagram', th: TH.hazard, title: 'คลื่นไหวสะเทือนและระยะทาง', sub: 'ภาพโต้ตอบ: ลากสถานีวัด และปรับขนาด', draw: E_dSeismo, init: () => ({ sx: 470, sy: 330, mag: 6 }) },
  { th: TH.hazard, title: 'ภูเขาไฟ', sub: 'Volcanoes', blocks: [
    { p: '**แมกมา (magma)** คือหินหลอมเหลวใต้ผิวโลก เมื่อไหลออกมาบนผิวโลกเรียกว่า **ลาวา (lava)** ภูเขาไฟส่วนใหญ่อยู่ตามขอบแผ่นธรณี ทั้งแนวมุดตัวและสันเขากลางมหาสมุทร โดยเฉพาะ **วงแหวนแห่งไฟ (Ring of Fire)** รอบมหาสมุทรแปซิฟิก บางแห่งอยู่กลางแผ่นธรณีเหนือ **จุดร้อน (hotspot)** เช่น หมู่เกาะฮาวาย' },
    { table: { cols: [0.3, 0.7], head: ['ชนิด', 'ลักษณะ'], rows: [
      ['รูปโล่ (shield)', 'แมกมาบะซอลต์ ซิลิกาต่ำ หนืดน้อย ไหลง่าย ปะทุไม่รุนแรง ฐานกว้าง ลาดชันน้อย เช่น เมานาโลอา'],
      ['สลับชั้น (composite, strato)', 'แมกมาแอนดีไซต์ ซิลิกาสูง หนืดมาก ก๊าซหนีออกยาก **ปะทุรุนแรง** ลาดชัน สลับชั้นลาวากับเถ้า เช่น ฟูจิ ปินาตูโบ'],
      ['กรวยกรวด (cinder cone)', 'ขนาดเล็ก ลาดชัน เกิดจากเศษหินภูเขาไฟกองรอบปล่อง'],
    ] } },
    { h: 'ผลผลิตจากภูเขาไฟ' },
    { p: 'ลาวา **ตะกอนภูเขาไฟ (pyroclastics)** เช่น เถ้าและลูกระเบิดภูเขาไฟ ก๊าซ เช่น ไอน้ำ CO₂ SO₂ **กระแสหินภูเขาไฟร้อน (pyroclastic flow)** ที่ไหลลงเขาเร็วมาก และ **ลาฮาร์ (lahar)** หรือโคลนภูเขาไฟ' },
    { box: '**ประโยชน์** ดินภูเขาไฟอุดมสมบูรณ์ ให้พลังงานความร้อนใต้พิภพ และเป็นแหล่งแร่ ไทยมีภูเขาไฟที่ดับแล้ว เช่น **ภูเขาไฟพนมรุ้ง** จังหวัดบุรีรัมย์', tone: 'note' },
  ] },
  { kind: 'diagram', th: TH.hazard, title: 'ซิลิกากับการปะทุ', sub: 'ภาพโต้ตอบ: ลากเพื่อเปลี่ยนความหนืดของแมกมา', draw: E_dVolcano, init: () => ({ si: 50 }) },
  { th: TH.hazard, title: 'สึนามิ', sub: 'Tsunami', blocks: [
    { p: '**สึนามิ (tsunami)** คือคลื่นน้ำขนาดใหญ่ที่เกิดเมื่อน้ำทะเลถูกแทนที่อย่างฉับพลัน ส่วนใหญ่มาจาก **แผ่นดินไหวใต้ทะเล** ในแนวมุดตัว ที่พื้นทะเลยกหรือยุบในแนวดิ่ง นอกจากนี้ยังเกิดจากดินถล่มใต้ทะเลและภูเขาไฟปะทุ' },
    { f: 'v = √(g · d)', cap: 'v อัตราเร็วคลื่น · g ≈ 9.8 m/s² · d ความลึกของน้ำ' },
    { li: [
      'ในมหาสมุทรลึก 4,000 ม. คลื่นเร็วราว **700–800 กม./ชม.** สูงมักไม่ถึง 1 ม. แต่ยาว 100–200 กม. เรือกลางทะเลแทบไม่รู้สึก',
      'เมื่อเข้าใกล้ฝั่ง น้ำตื้นลง คลื่น **ช้าลง สั้นลง และสูงขึ้นมาก** (shoaling) แล้วซัดขึ้นฝั่ง',
    ] },
    { h: 'สัญญาณเตือน' },
    { li: ['เกิดแผ่นดินไหวรุนแรง', 'น้ำทะเล **ลดลงอย่างรวดเร็ว** จนเห็นพื้นทะเล', 'ได้ยินเสียงดังคำรามจากทะเล'] },
    { box: '**26 ธันวาคม 2547** แผ่นดินไหวขนาด 9.1 นอกชายฝั่งสุมาตรา-อันดามัน ทำให้สึนามิซัดชายฝั่งอันดามันของไทย มีผู้เสียชีวิตในไทยกว่า 5,000 คน', tone: 'warn' },
    { p: 'ปัจจุบันมี **ทุ่นตรวจวัดสึนามิ (DART)** และ **ศูนย์เตือนภัยพิบัติแห่งชาติ** แจ้งเตือนผ่านหอเตือนภัย เมื่อได้รับสัญญาณให้ **อพยพขึ้นที่สูงทันที**' },
  ] },
  { kind: 'diagram', th: TH.hazard, title: 'สึนามิเข้าหาฝั่ง', sub: 'ภาพโต้ตอบ: ลากยอดคลื่น', draw: E_dTsunami, init: () => ({ x: 60 }) },
];
