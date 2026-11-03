// ============================================================ part F · space probes (pages 29–30)
let F_seed = 7; const F_rnd = () => (F_seed = (F_seed * 16807) % 2147483647) / 2147483647;
const F_STARS = Array.from({ length: 120 }, () => [F_rnd(), F_rnd(), 0.6 + F_rnd() * 1.4, F_rnd() * 6.28]);
const F_TOP = 228, F_H = 474;

// Schematic top view: the Sun sits at the left edge, orbit radii are compressed (not to scale).
// Bodies are given as [radius px, angle deg] around the Sun, or as an offset from a parent body.
const F_BODY = {
  sun: { r: 0, a: 0 },
  earth: { r: 150, a: -40 },
  moon: { of: 'earth', dx: 36, dy: -30 },
  bennu: { r: 200, a: 2 },
  didymos: { r: 222, a: 58 },
  mars: { r: 268, a: 22 },
  jupiter: { r: 430, a: -10 },
  europa: { of: 'jupiter', dx: -30, dy: 32 },
  ganymede: { of: 'jupiter', dx: 50, dy: 40 },
  helio: { r: 655, a: 15 },
};
const F_TYPES = {
  flyby: 'ยานบินผ่าน (flyby)', orbiter: 'ยานโคจร (orbiter)', lander: 'ยานลงจอด (lander) + รถสำรวจ (rover)',
  rover: 'รถสำรวจ (rover) + เฮลิคอปเตอร์', sample: 'ยานเก็บตัวอย่างกลับ (sample return)', impact: 'ยานพุ่งชน (impactor)',
};
// light: one-way radio delay [min s, max s, text]
const F_STOPS = [
  { body: 'sun', ax: 30, ay: -42, name: 'Parker Solar Probe', ag: 'NASA · สหรัฐอเมริกา', when: 'ส่งปี 2018', type: 'orbiter', tx: 'ยานโคจรรอบดวงอาทิตย์ (orbiter)',
    target: 'ดวงอาทิตย์ · ชั้นบรรยากาศ corona', travel: '≈ 3 เดือนถึงจุดเฉียดใกล้ครั้งแรก', light: [480, 480, '≈ 8 นาที'],
    find: 'ผ่านเข้าไปในชั้น corona ครั้งแรกปี 2021 เฉียดผิวดวงอาทิตย์เพียง ≈ 6.1 ล้าน กม. เร็ว ≈ 190 กม./วินาที วัตถุที่เร็วที่สุดที่มนุษย์สร้าง' },
  { body: 'moon', ax: -4, ay: 26, name: 'Chandrayaan-3', ag: 'ISRO · อินเดีย', when: 'ส่งปี 2023', type: 'lander',
    target: 'ดวงจันทร์ · ใกล้ขั้วใต้', travel: '≈ 40 วัน', light: [1.3, 1.3, '≈ 1.3 วินาที'],
    find: 'ยาน Vikram ลงจอดใกล้ขั้วใต้ของดวงจันทร์ได้เป็นครั้งแรก (23 ส.ค. 2023) รถ Pragyan ตรวจพบกำมะถันในดิน' },
  { body: 'moon', ax: 24, ay: -18, name: "Chang'e 6", ag: 'CNSA · จีน', when: 'ส่งปี 2024', type: 'sample',
    target: 'ดวงจันทร์ · ด้านไกล (far side)', travel: '≈ 1 เดือนถึงพื้น · 53 วันทั้งภารกิจ', light: [1.3, 1.3, '≈ 1.3 วินาที'],
    find: 'นำหินและดินจากด้านไกลของดวงจันทร์กลับโลกได้เป็นครั้งแรก ราว 1.9 กิโลกรัม (มิ.ย. 2024) ด้านไกลมองไม่เห็นโลก จึงต้องส่งสัญญาณผ่านดาวเทียม Queqiao-2' },
  { body: 'bennu', ax: 0, ay: 0, name: 'OSIRIS-REx', ag: 'NASA · สหรัฐอเมริกา', when: 'ส่งปี 2016', type: 'sample',
    target: 'ดาวเคราะห์น้อย Bennu (ใกล้โลก)', travel: '≈ 2 ปีถึง Bennu · 7 ปีไป–กลับ', light: [1110, 1110, '≈ 18 นาที (ขณะเก็บตัวอย่าง)'],
    find: 'แคปซูลนำฝุ่นหิน 121.6 กรัมลงถึงโลก (24 ก.ย. 2023) พบสารประกอบคาร์บอน แร่ที่มีน้ำ และกรดอะมิโน วัตถุดิบตั้งต้นของระบบสุริยะ' },
  { body: 'didymos', ax: 0, ay: 0, name: 'DART', ag: 'NASA · สหรัฐอเมริกา', when: 'ส่งปี 2021', type: 'impact',
    target: 'Dimorphos ดวงจันทร์จิ๋วของดาวเคราะห์น้อย Didymos', travel: '≈ 10 เดือน', light: [38, 38, '≈ 38 วินาที (ขณะชน)'],
    find: 'พุ่งชน Dimorphos (26 ก.ย. 2022) ทำให้คาบโคจรรอบ Didymos สั้นลง 32 นาที การทดสอบป้องกันโลก (planetary defence) ครั้งแรก' },
  { body: 'mars', ax: 0, ay: 0, name: 'Perseverance + Ingenuity', ag: 'NASA · สหรัฐอเมริกา', when: 'ส่งปี 2020', type: 'rover',
    target: 'ดาวอังคาร · ปล่อง Jezero', travel: '≈ 7 เดือน', light: [180, 1320, '3–22 นาที'],
    find: 'สำรวจตะกอนทะเลสาบโบราณ เก็บหินใส่หลอดรอนำกลับโลก เฮลิคอปเตอร์ Ingenuity บินด้วยพลังของตัวเองได้ครั้งแรกบนดาวดวงอื่น (19 เม.ย. 2021)' },
  { body: 'jupiter', ax: 0, ay: -34, name: 'Juno', ag: 'NASA · สหรัฐอเมริกา', when: 'ส่งปี 2011', type: 'orbiter',
    target: 'ดาวพฤหัสบดี', travel: '≈ 5 ปี (เข้าวงโคจรปี 2016)', light: [2100, 3120, '35–52 นาที'],
    find: 'โคจรผ่านเหนือขั้ว พบพายุไซโคลนเรียงเป็นกลุ่มที่ขั้วทั้งสอง และแก่นกลางที่ฟุ้งกระจาย ไม่อัดแน่นอย่างที่เคยคิด' },
  { body: 'europa', ax: 0, ay: 0, name: 'Europa Clipper', ag: 'NASA · สหรัฐอเมริกา', when: 'ส่งปี 2024', plan: true, type: 'orbiter', tx: 'ยานโคจร (orbiter) บินผ่าน Europa หลายสิบครั้ง',
    target: 'Europa ดวงจันทร์ของดาวพฤหัสบดี', travel: '≈ 5.5 ปี (ถึงราวปี 2030 ตามแผน)', light: [2100, 3120, '35–52 นาที'],
    find: 'ตามแผน: ตรวจมหาสมุทรน้ำเค็มใต้เปลือกน้ำแข็งของ Europa ว่ามีน้ำ สารเคมี และพลังงานพอสำหรับสิ่งมีชีวิตหรือไม่' },
  { body: 'ganymede', ax: 0, ay: 0, name: 'JUICE', ag: 'ESA · ยุโรป', when: 'ส่งปี 2023', plan: true, type: 'orbiter',
    target: 'ดวงจันทร์น้ำแข็ง Ganymede, Callisto, Europa', travel: '≈ 8 ปี (ถึงราวปี 2031 ตามแผน)', light: [2100, 3120, '35–52 นาที'],
    find: 'ตามแผน: ศึกษามหาสมุทรใต้ผิวน้ำแข็ง แล้วเข้าโคจรรอบ Ganymede เป็นยานแรกที่โคจรรอบดวงจันทร์ของดาวดวงอื่น' },
  { body: 'helio', ax: 0, ay: 0, name: 'Voyager 1', ag: 'NASA · สหรัฐอเมริกา', when: 'ส่งปี 1977', type: 'flyby',
    target: 'อวกาศระหว่างดาว (interstellar space)', travel: '≈ 35 ปีถึงขอบลมสุริยะ (ปี 2012)', light: [82800, 82800, '≈ 23 ชั่วโมง'],
    find: 'บินผ่านดาวพฤหัสบดีและดาวเสาร์ แล้วออกพ้นฟองลมสุริยะ (heliosphere) เป็นยานแรก ไกลเกือบ 1 วันแสง วัตถุที่ไกลที่สุดที่มนุษย์สร้าง' },
];

function F_layout(P) {
  const sx = P.X0 + 46, sy = F_TOP + 228, out = {};
  for (const k in F_BODY) {
    const b = F_BODY[k];
    out[k] = b.of ? { x: out[b.of].x + b.dx, y: out[b.of].y + b.dy } : { x: sx + b.r * Math.cos(b.a * D2R), y: sy - b.r * Math.sin(b.a * D2R) };
  }
  return out;
}
function F_space(ctx, x, y, w, h, t) {
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0b1730'); g.addColorStop(1, '#14254a');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  for (const [u, v, r, ph] of F_STARS) {
    ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(t * 1.3 + ph)})`;
    ctx.fillRect(x + u * w, y + v * h, r, r);
  }
}
function F_planet(ctx, x, y, r, c0, c1) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, c0); g.addColorStop(1, c1); circle(ctx, x, y, r, g);
}
function F_probe(ctx, x, y, s, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = '#4dabf7'; ctx.fillRect(-s * 2.2, -s * 0.4, s * 1.4, s * 0.8); ctx.fillRect(s * 0.8, -s * 0.4, s * 1.4, s * 0.8);
  ctx.fillStyle = '#ffd43b'; rr(ctx, -s * 0.7, -s * 0.7, s * 1.4, s * 1.4, 3); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, -s * 0.7, s * 0.6, Math.PI, 0); ctx.stroke();
  ctx.restore();
}
// mission-type glyph, drawn in a s×s box centred on (x, y)
function F_icon(ctx, type, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  const k = s / 40;
  if (type === 'flyby') {
    circle(ctx, -4 * k, 6 * k, 8 * k, col);
    ctx.beginPath(); ctx.moveTo(-18 * k, -14 * k); ctx.quadraticCurveTo(14 * k, -12 * k, 16 * k, 16 * k); ctx.stroke();
    chevron(ctx, 16 * k, 16 * k, Math.PI / 2.3, col, 6 * k);
  } else if (type === 'orbiter') {
    circle(ctx, 0, 0, 8 * k, col);
    ctx.beginPath(); ctx.ellipse(0, 0, 18 * k, 9 * k, -0.4, 0, Math.PI * 2); ctx.stroke();
    ctx.fillRect(12 * k, -14 * k, 7 * k, 7 * k);
  } else if (type === 'lander' || type === 'rover') {
    ctx.fillRect(-18 * k, 14 * k, 36 * k, 3 * k);
    if (type === 'lander') {
      rr(ctx, -9 * k, -12 * k, 18 * k, 14 * k, 3); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-7 * k, 2 * k); ctx.lineTo(-14 * k, 14 * k); ctx.moveTo(7 * k, 2 * k); ctx.lineTo(14 * k, 14 * k); ctx.stroke();
    } else {
      rr(ctx, -14 * k, -4 * k, 28 * k, 10 * k, 3); ctx.fill();
      for (const dx of [-11, 0, 11]) circle(ctx, dx * k, 10 * k, 4 * k, col);
      ctx.beginPath(); ctx.moveTo(8 * k, -4 * k); ctx.lineTo(8 * k, -14 * k); ctx.stroke(); circle(ctx, 8 * k, -15 * k, 3 * k, col);
    }
  } else if (type === 'sample') {
    circle(ctx, 10 * k, -8 * k, 8 * k, col);
    ctx.beginPath(); ctx.moveTo(4 * k, 0); ctx.quadraticCurveTo(-6 * k, 12 * k, -16 * k, 12 * k); ctx.stroke();
    chevron(ctx, -16 * k, 12 * k, Math.PI, col, 6 * k);
    rr(ctx, -20 * k, -16 * k, 12 * k, 9 * k, 3); ctx.fill();
  } else if (type === 'impact') {
    circle(ctx, 8 * k, 6 * k, 10 * k, col);
    arrow(ctx, -18 * k, -16 * k, -2 * k, -2 * k, { color: col, w: 2.5, head: 8 * k });
    for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.5; ctx.beginPath(); ctx.moveTo(-1 * k + Math.cos(a) * 5 * k, -1 * k + Math.sin(a) * 5 * k); ctx.lineTo(-1 * k + Math.cos(a) * 10 * k, -1 * k + Math.sin(a) * 10 * k); ctx.stroke(); }
  }
  ctx.restore();
}
// quadratic arc from Earth to the target, bulging away from the Sun (Hohmann-like sketch)
function F_traj(L, s, sun) {
  const A = L.earth, B = { x: L[s.body].x + (s.body === 'jupiter' ? s.ax * 0.6 : 0), y: L[s.body].y + (s.body === 'jupiter' ? s.ay * 0.6 : 0) };
  if (s.body === 'sun') { B.x += 30; B.y -= 6; }
  const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len, ny = dx / len;
  if ((mx - sun.x) * nx + (my - sun.y) * ny < 0) { nx = -nx; ny = -ny; }
  const b = Math.min(120, len * 0.32), C = { x: mx + nx * b, y: my + ny * b };
  const at = (u) => ({ x: (1 - u) ** 2 * A.x + 2 * u * (1 - u) * C.x + u * u * B.x, y: (1 - u) ** 2 * A.y + 2 * u * (1 - u) * C.y + u * u * B.y,
    ang: Math.atan2(2 * (1 - u) * (C.y - A.y) + 2 * u * (B.y - C.y), 2 * (1 - u) * (C.x - A.x) + 2 * u * (B.x - C.x)) });
  return { at, B };
}
function F_dProbes(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, bot = F_TOP + F_H, L = F_layout(P), sun = L.sun;
  st.now = t;
  const anchor = (i) => { const s = F_STOPS[i], b = L[s.body]; return { x: b.x + s.ax, y: b.y + s.ay }; };
  const sel = F_STOPS[st.sel], A = anchor(st.sel);
  if (st.mx == null) { st.mx = A.x; st.my = A.y; }
  st.mx += (A.x - st.mx) * 0.3; st.my += (A.y - st.my) * 0.3;

  ctx.save(); rr(ctx, X0, F_TOP, W, F_H, 16); ctx.clip();
  F_space(ctx, X0, F_TOP, W, F_H, t);
  // solar wind bubble edge and orbits
  ctx.fillStyle = 'rgba(120,160,255,0.05)'; ctx.beginPath(); ctx.arc(sun.x, sun.y, F_BODY.helio.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(150,180,255,0.55)'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 8; ring(ctx, sun.x, sun.y, F_BODY.helio.r); ctx.setLineDash([]);
  ctx.lineWidth = 1.5;
  for (const [r, al] of [[62, 0.18], [100, 0.18], [F_BODY.earth.r, 0.42], [F_BODY.mars.r, 0.3], [F_BODY.jupiter.r, 0.3], [545, 0.18]]) { ctx.strokeStyle = `rgba(200,215,240,${al})`; ring(ctx, sun.x, sun.y, r); }
  // main asteroid belt
  for (let i = 0; i < 150; i++) {
    const a = (i * 2.399) % (Math.PI * 2), r = 322 + ((i * 37) % 34);
    ctx.fillStyle = 'rgba(200,190,170,0.45)'; ctx.fillRect(sun.x + r * Math.cos(a + t * 0.01), sun.y + r * Math.sin(a + t * 0.01), 1.8, 1.8);
  }
  // Parker's elongated orbit
  ctx.strokeStyle = 'rgba(255,190,120,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(sun.x + 26, sun.y - 18, 52, 24, -0.62, 0, Math.PI * 2); ctx.stroke();
  // Sun
  glow(ctx, sun.x, sun.y, 80 + 4 * Math.sin(t * 2), 'rgba(255,200,80,0.55)');
  F_planet(ctx, sun.x, sun.y, 26, '#fff3bf', '#f08c00');
  // planets and small bodies
  F_planet(ctx, L.earth.x, L.earth.y, 11, '#a5d8ff', '#1864ab');
  F_planet(ctx, L.moon.x, L.moon.y, 6, '#f1f3f5', '#868e96');
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ring(ctx, L.earth.x, L.earth.y, Math.hypot(F_BODY.moon.dx, F_BODY.moon.dy));
  F_planet(ctx, L.mars.x, L.mars.y, 9, '#ffc9a8', '#c2410c');
  F_planet(ctx, L.bennu.x, L.bennu.y, 4, '#ced4da', '#495057');
  F_planet(ctx, L.didymos.x, L.didymos.y, 5, '#ced4da', '#495057'); circle(ctx, L.didymos.x + 9, L.didymos.y - 3, 2.2, '#adb5bd');
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 1;
  ring(ctx, L.jupiter.x, L.jupiter.y, Math.hypot(F_BODY.europa.dx, F_BODY.europa.dy)); ring(ctx, L.jupiter.x, L.jupiter.y, Math.hypot(F_BODY.ganymede.dx, F_BODY.ganymede.dy));
  F_planet(ctx, L.jupiter.x, L.jupiter.y, 22, '#ffe8cc', '#b86b25');
  ctx.strokeStyle = 'rgba(140,80,30,0.5)'; ctx.lineWidth = 2;
  for (const dy of [-7, 3]) { ctx.beginPath(); ctx.moveTo(L.jupiter.x - 20, L.jupiter.y + dy); ctx.lineTo(L.jupiter.x + 20, L.jupiter.y + dy); ctx.stroke(); }
  F_planet(ctx, L.europa.x, L.europa.y, 5, '#fff', '#c5a88a');
  F_planet(ctx, L.ganymede.x, L.ganymede.y, 6, '#e9ecef', '#7d6e5d');
  // body labels
  const lb = (txt, x, y, col = 'rgba(255,255,255,0.82)', al = 'center') => label(ctx, txt, x, y, { size: 14, wt: 600, color: col, align: al });
  lb('ดวงอาทิตย์', sun.x, sun.y + 46, '#ffd8a8');
  lb('โลก', L.earth.x - 16, L.earth.y + 12, '#a5d8ff', 'right');
  lb('ดวงจันทร์', L.moon.x - 10, L.moon.y - 10, '#dee2e6', 'right');
  lb('ดาวอังคาร', L.mars.x + 26, L.mars.y + 4, '#ffc9a8', 'left');
  lb('Bennu', L.bennu.x + 22, L.bennu.y + 14, '#ced4da', 'left');
  lb('Didymos · Dimorphos', L.didymos.x + 12, L.didymos.y - 16, '#ced4da', 'left');
  lb('ดาวพฤหัสบดี', L.jupiter.x + 28, L.jupiter.y - 18, '#ffd8a8', 'left');
  lb('Europa', L.europa.x - 8, L.europa.y + 14, '#e9ecef', 'right');
  lb('Ganymede', L.ganymede.x + 8, L.ganymede.y + 14, '#e9ecef', 'left');
  lb('แถบดาวเคราะห์น้อย', sun.x + 330 * Math.cos(-0.15), sun.y - 330 * Math.sin(-0.15) + 14, 'rgba(220,210,190,0.75)');
  lb('ดาวเสาร์', sun.x + 545 * Math.cos(0.3), sun.y - 545 * Math.sin(0.3) - 2, 'rgba(220,215,200,0.7)');
  lb('ขอบลมสุริยะ (heliopause)', L.helio.x - 12, F_TOP + 22, '#bac8ff', 'right');
  lb('อวกาศระหว่างดาว →', X1 - 14, bot - 66, '#bac8ff', 'right');

  // trajectory: grows from Earth for ~2.4 s, then a probe loops along it
  const tr = F_traj(L, sel, sun), age = t - (st.t0 ?? -10), u = clamp(age / 2.4, 0, 1);
  ctx.strokeStyle = 'rgba(255,212,59,0.9)'; ctx.lineWidth = 3; ctx.setLineDash([8, 7]); ctx.lineDashOffset = -t * 20; ctx.beginPath();
  for (let k = 0; k <= 40; k++) { const q = tr.at(u * k / 40); k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }
  ctx.stroke(); ctx.setLineDash([]);
  const pu = u < 1 ? u : mod1((age - 2.4) / 3.2), q = tr.at(pu);
  F_probe(ctx, q.x, q.y, 5, q.ang);
  if (u >= 1) { const pulse = 0.5 + 0.5 * Math.sin(t * 4); glow(ctx, tr.B.x, tr.B.y, 26 + 6 * pulse, `rgba(255,212,59,${0.25 + 0.2 * pulse})`); }
  // snap points
  F_STOPS.forEach((s, i) => {
    if (i === st.sel) return;
    const a = anchor(i); ctx.strokeStyle = 'rgba(255,212,59,0.75)'; ctx.lineWidth = 2; ring(ctx, a.x, a.y, 7);
    circle(ctx, a.x, a.y, 2.5, 'rgba(255,212,59,0.8)');
  });
  // the draggable marker, snapped
  ctx.fillStyle = 'rgba(255,212,59,0.22)'; circle(ctx, st.mx, st.my, 20, 'rgba(255,212,59,0.22)');
  ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 3; ring(ctx, st.mx, st.my, 16);
  F_icon(ctx, sel.type, st.mx, st.my, 22, '#fff');
  if (st.drag && st.px != null) { ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(st.px, st.py); ctx.lineTo(st.mx, st.my); ctx.stroke(); ctx.setLineDash([]); circle(ctx, st.px, st.py, 5, 'rgba(255,255,255,0.7)'); }
  const tagR = st.mx > X1 - 230, tagY = st.my < F_TOP + 70 ? st.my + 34 : st.my - 32;
  label(ctx, sel.name + (sel.plan ? ' · ตามแผน' : ''), st.mx + (tagR ? -10 : 10), tagY, { size: 15, wt: 700, color: '#0b1730', bg: sel.plan ? '#ffc078' : '#ffd43b', pad: 6, align: tagR ? 'right' : 'left' });
  // direction strip
  ctx.fillStyle = 'rgba(8,16,34,0.82)'; ctx.fillRect(X0, bot - 40, W, 40);
  label(ctx, '← ใกล้ดวงอาทิตย์', X0 + 18, bot - 20, { size: 15, wt: 700, color: '#ffc078', align: 'left' });
  label(ctx, 'ไกลออกไป →', X1 - 18, bot - 20, { size: 15, wt: 700, color: '#bac8ff', align: 'right' });
  label(ctx, 'มองจากด้านบน · ระยะไม่ตามมาตราส่วน', cx, bot - 20, { size: 13, wt: 500, color: 'rgba(255,255,255,0.6)' });
  ctx.restore();
  ctx.strokeStyle = 'rgba(40,55,80,0.35)'; ctx.lineWidth = 2; rr(ctx, X0, F_TOP, W, F_H, 16); ctx.stroke();
  P.zones.push({
    x: X0, y: F_TOP, w: W, h: F_H - 40, cursor: 'grab', drag: (px, py, phase) => {
      if (phase === 'end' || px < 0) { st.drag = false; st.px = null; return; }
      st.drag = true; st.px = clamp(px, X0 + 8, X1 - 8); st.py = clamp(py, F_TOP + 8, bot - 48);
      let best = st.sel, bd = 1e9;
      F_STOPS.forEach((s, i) => { const a = anchor(i), d = Math.hypot(a.x - st.px, a.y - st.py); if (d < bd) { bd = d; best = i; } });
      if (best !== st.sel) { st.sel = best; st.t0 = st.now; }
    },
  });
  hint(ctx, P, 'ลากยานสีเหลืองไปยังเป้าหมาย แล้วดูเส้นทางจากโลก', bot + 22);
  F_readout(ctx, P, bot + 44, sel);
  F_delay(ctx, P, bot + 256, sel);
}
function F_readout(ctx, P, y, s) {
  const { X0, X1, th } = P, W = X1 - X0, h = 196;
  ctx.fillStyle = rgba(th.a, 0.08); rr(ctx, X0, y, W, h, 12); ctx.fill();
  ctx.fillStyle = th.a; rr(ctx, X0, y, 6, h, 3); ctx.fill();
  const nw = label(ctx, s.name, X0 + 22, y + 28, { size: 25, wt: 600, align: 'left', fam: F.display });
  label(ctx, s.ag + ' · ' + s.when, X1 - 18, y + 28, { size: 16, wt: 600, color: C.soft, align: 'right' });
  if (s.plan) label(ctx, 'ยังไม่ถึง · ตามแผน', X0 + 36 + nw, y + 28, { size: 14, wt: 700, color: '#fff', bg: '#e8590c', pad: 6, align: 'left' });
  F_icon(ctx, s.type, X0 + 42, y + 72, 34, th.a);
  label(ctx, s.tx || F_TYPES[s.type], X0 + 72, y + 66, { size: 19, wt: 700, color: th.a, align: 'left' });
  label(ctx, 'เป้าหมาย: ' + s.target, X0 + 72, y + 94, { size: 16, wt: 500, color: C.ink, align: 'left' });
  label(ctx, 'เดินทาง ' + s.travel, X0 + 22, y + 126, { size: 17, wt: 700, color: C.ink, align: 'left' });
  label(ctx, 'สัญญาณวิทยุ ' + s.light[2], X1 - 18, y + 126, { size: 17, wt: 700, color: '#1971c2', align: 'right' });
  para(ctx, s.find, X0 + 22, y + 142, W - 40, 16.5, { lh: 24, color: C.soft });
}
const F_LT = [['ดวงจันทร์', 1.3, 1.3, '1.3 วินาที'], ['ดาวอังคาร', 180, 1320, '3–22 นาที'], ['ดาวพฤหัสบดี', 2100, 3120, '35–52 นาที'], ['Voyager 1', 82800, 82800, '≈ 23 ชม.']];
function F_delay(ctx, P, y, s) {
  const { X0, X1, th } = P;
  stitle(ctx, 'ข. สัญญาณวิทยุเดินทางด้วยความเร็วแสง ต้องรอนานแค่ไหน', X0, y, th);
  const gx0 = X0 + 34, gx1 = X1 - 50, by = y + 68, X = (sec) => lerp(gx0, gx1, Math.log10(sec) / Math.log10(86400));
  ctx.fillStyle = 'rgba(120,105,80,0.18)'; rr(ctx, gx0 - 8, by - 7, gx1 - gx0 + 16, 14, 7); ctx.fill();
  for (const [sec, txt] of [[1, '1 วินาที'], [60, '1 นาที'], [3600, '1 ชั่วโมง'], [86400, '1 วัน']]) {
    ctx.fillStyle = 'rgba(37,48,58,0.45)'; ctx.fillRect(X(sec) - 1, by - 12, 2, 24);
    label(ctx, txt, X(sec), by + 44, { size: 13, wt: 600, color: C.soft });
  }
  const pulse = 0.5 + 0.5 * Math.sin(P.st.now * 3);
  for (const [n, a, b, txt] of F_LT) {
    const on = s.light[0] >= a * 0.9 && s.light[1] <= b * 1.1 && Math.abs(s.light[0] - a) < a * 0.1 + 1;
    const col = on ? th.a : '#1971c2', xa = X(a), xb = X(b);
    ctx.fillStyle = rgba(col, on ? 0.9 : 0.6); rr(ctx, xa - 6, by - 6, xb - xa + 12, 12, 6); ctx.fill();
    if (on) { ctx.strokeStyle = rgba(th.a, 0.4 + 0.4 * pulse); ctx.lineWidth = 3; rr(ctx, xa - 10, by - 10, xb - xa + 20, 20, 10); ctx.stroke(); }
    label(ctx, n, (xa + xb) / 2, by - 25, { size: 15, wt: 700, color: on ? th.a : C.ink });
    label(ctx, txt, (xa + xb) / 2, by + 24, { size: 14, wt: 600, color: col });
  }
  const xs = X((s.light[0] + s.light[1]) / 2);
  ctx.fillStyle = '#e8a400'; ctx.beginPath(); ctx.moveTo(xs, by - 9); ctx.lineTo(xs - 7, by - 19); ctx.lineTo(xs + 7, by - 19); ctx.closePath(); ctx.fill();
  label(ctx, 'สั่งรถบนดาวอังคารต้องรอคำตอบไป–กลับ 6–44 นาที rover จึงต้องขับหลบหินเองอัตโนมัติ', P.cx, by + 64, { size: 15, wt: 600, color: C.soft });
}

const PART_F = [
  { th: TH.tech, title: 'ยานสำรวจอวกาศรุ่นใหม่', sub: 'Space probes', blocks: [
    { p: '**ยานสำรวจอวกาศ (space probe)** คือหุ่นยนต์ที่ไปศึกษาดาวดวงอื่นแทนมนุษย์ ทนรังสีและอุณหภูมิสุดขั้ว ทำงานได้หลายปี และไม่เสี่ยงชีวิตคน' },
    { li: [
      '**บินผ่าน (flyby)** และ**ยานโคจร (orbiter)** ถ่ายภาพ ทำแผนที่',
      '**ยานลงจอด (lander)** และ**รถสำรวจ (rover)** ตรวจหินบนพื้นผิว',
      '**ยานเก็บตัวอย่างกลับ (sample return)** นำหินกลับมาวิเคราะห์บนโลก',
    ] },
    { table: { cols: [0.29, 0.23, 0.48], head: ['ยาน', 'เป้าหมาย', 'ผลงานเด่น'], rows: [
      ['Parker Solar Probe', 'ดวงอาทิตย์', 'ผ่านชั้น corona เร็วที่สุดที่มนุษย์สร้าง'],
      ['Chandrayaan-3', 'ดวงจันทร์', 'อินเดียลงจอดใกล้ขั้วใต้ครั้งแรก 2023'],
      ["Chang'e 6", 'ดวงจันทร์', 'จีนนำหินด้านไกลกลับโลกครั้งแรก 2024'],
      ['DART', 'Dimorphos', 'ชนให้วงโคจรเปลี่ยน ทดสอบป้องกันโลก'],
      ['OSIRIS-REx', 'Bennu', 'ส่งฝุ่นดาวเคราะห์น้อยถึงโลก 2023'],
      ['Perseverance', 'ดาวอังคาร', 'Ingenuity บินบนดาวอื่นครั้งแรก 2021'],
      ['Juno', 'ดาวพฤหัสบดี', 'โคจรรอบตั้งแต่ 2016 พบไซโคลนที่ขั้ว'],
      ['Europa Clipper', 'Europa', 'ส่ง 2024 **ตามแผน**ถึงราว 2030'],
      ['JUICE (ESA)', 'Ganymede', 'ส่ง 2023 **ตามแผน**ถึงราว 2031'],
      ['Voyager 1', 'อวกาศระหว่างดาว', 'พ้นเขตลมสุริยะ 2012 ไกลที่สุด'],
    ] } },
  ] },
  { kind: 'diagram', th: TH.tech, title: 'ส่งยานไปที่ไหนดี', sub: 'ภาพโต้ตอบ: ลากยานไปยังเป้าหมายในระบบสุริยะ', draw: F_dProbes, init: () => ({ sel: 5, t0: 0 }) },
];
