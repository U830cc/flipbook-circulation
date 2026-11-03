// ============================================================ part A · pages 3–10 · เอกภพและกาแล็กซี
function A_rng(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const A_SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const A_pow10 = (e) => '10' + String(e).split('').map(c => A_SUP[c]).join('');
const A_fmt = (n) => Math.round(n).toLocaleString('en-US');
const A_sig = (x, n) => { const p = Math.pow(10, Math.floor(Math.log10(x)) - n + 1); return Math.round(x / p) * p; };
const A_LITE = '#b9a5ff';

function A_space(ctx, x, y, w, h, sd = 5, n = 70) {
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0b1730'); g.addColorStop(1, '#14254a');
  ctx.fillStyle = g; rr(ctx, x, y, w, h, 16); ctx.fill();
  const R = A_rng(sd);
  for (let k = 0; k < n; k++) { ctx.fillStyle = `rgba(255,255,255,${0.15 + R() * 0.45})`; const s = 0.8 + R() * 1.6; ctx.fillRect(x + R() * w, y + R() * h, s, s); }
}
function A_btn(ctx, P, x, y, w, h, txt, on, click) {
  const a = P.th.a;
  ctx.fillStyle = on ? a : 'rgba(255,255,255,0.9)'; rr(ctx, x, y, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = a; ctx.lineWidth = 2; ctx.stroke();
  label(ctx, txt, x + w / 2, y + h / 2, { size: 16, wt: 700, color: on ? '#fff' : a });
  P.zones.push({ x, y, w, h, cursor: 'pointer', click });
}
function A_card(ctx, x, y, w, h, col) {
  ctx.fillStyle = rgba(col, 0.09); rr(ctx, x, y, w, h, 14); ctx.fill();
  ctx.fillStyle = col; rr(ctx, x, y, 7, h, 3); ctx.fill();
}
function A_gal(ctx, x, y, s, ang, col, q = 0.45) {
  glow(ctx, x, y, s * 2.4, rgba(col, 0.35));
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1, q);
  circle(ctx, 0, 0, s, rgba(col, 0.75)); circle(ctx, 0, 0, s * 0.4, '#fff');
  ctx.restore();
}

// ------------------------------------------------------------ page 4 · ย้อนเวลาเอกภพ
const A_TK = [[0, -40], [0.10, -36], [0.18, -32], [0.36, 0], [0.48, 2.2553], [0.62, 13.0789], [0.74, 15.6752], [0.84, 16.4991], [0.90, 17.4629], [1, 17.639]];
function A_logT(u) {
  for (let k = 1; k < A_TK.length; k++) if (u <= A_TK[k][0]) { const [u0, l0] = A_TK[k - 1], [u1, l1] = A_TK[k]; return lerp(l0, l1, (u - u0) / (u1 - u0)); }
  return A_TK[A_TK.length - 1][1];
}
function A_age(s) {
  const yr = 3.156e7;
  if (s < 1e-3) return A_pow10(Math.round(Math.log10(s))) + ' วินาที';
  if (s < 1) return s.toPrecision(1) + ' วินาที';
  if (s < 120) return Math.round(s) + ' วินาที';
  if (s < 7200) return Math.round(s / 60) + ' นาที';
  if (s < 172800) return Math.round(s / 3600) + ' ชั่วโมง';
  if (s < yr * 2) return A_fmt(s / 86400) + ' วัน';
  const y = s / yr;
  if (y < 1e6) return A_fmt(A_sig(y, 2)) + ' ปี';
  return A_fmt(A_sig(y / 1e6, y < 1e9 ? 2 : 3)) + ' ล้านปี';
}
const A_T = (s) => s < 1.2e13 ? 1.04e10 / Math.sqrt(s) : 3000 * Math.pow(s / 1.2e13, -2 / 3);
const A_Tfmt = (T) => T >= 1e5 ? '≈ ' + A_pow10(Math.round(Math.log10(T))) + ' K' : T >= 100 ? '≈ ' + A_fmt(A_sig(T, 2)) + ' K' : '≈ ' + T.toFixed(1) + ' K';
const A_STG = [
  { u: 0, n: 'บิกแบง (Big Bang)', has: 'พลังงานล้วน ยังไม่มีสสาร', ev: 'เอกภพเริ่มจากสภาวะที่ร้อนและหนาแน่นมาก', k: 0 },
  { u: 0.10, n: 'ยุคเงินเฟ้อ (inflation)', has: 'พลังงานสูงมาก', ev: 'อวกาศขยายตัวเร็วมาก ใหญ่ขึ้นราว 10²⁶ เท่าในเสี้ยววินาที', k: 1 },
  { u: 0.18, n: 'ซุปควาร์ก', has: 'ควาร์ก เลปตอน (เช่น อิเล็กตรอน) และโฟตอน', ev: 'พลังงานเปลี่ยนเป็นอนุภาคมูลฐาน', k: 2 },
  { u: 0.33, n: 'กำเนิดโปรตอนและนิวตรอน', has: 'โปรตอน นิวตรอน อิเล็กตรอน โฟตอน', ev: 'ควาร์ก 3 ตัวรวมกันเป็นโปรตอนหรือนิวตรอน', k: 3 },
  { u: 0.42, n: 'การสังเคราะห์นิวเคลียส', has: 'นิวเคลียส H และ He (H ≈ 75%, He ≈ 25% โดยมวล)', ev: 'โปรตอนกับนิวตรอนหลอมรวมเป็นนิวเคลียสฮีเลียม', k: 4 },
  { u: 0.50, n: 'พลาสมาทึบแสง', has: 'นิวเคลียส อิเล็กตรอนอิสระ และโฟตอน', ev: 'แสงชนอิเล็กตรอนตลอดเวลา จึงเดินทางได้ไม่ไกล', k: 5 },
  { u: 0.605, n: 'อะตอมแรก · กำเนิด CMB', has: 'อะตอม H และ He ที่เป็นกลาง', ev: 'แสงเดินทางได้อิสระ กลายเป็นรังสีไมโครเวฟพื้นหลัง (CMB)', k: 6 },
  { u: 0.645, n: 'ยุคมืด (dark ages)', has: 'แก๊ส H, He และสสารมืด ยังไม่มีดาว', ev: 'แรงโน้มถ่วงดึงแก๊สให้รวมเป็นก้อน', k: 7 },
  { u: 0.745, n: 'ดาวฤกษ์รุ่นแรก', has: 'ดาวมวลมาก ร้อน สีน้ำเงิน', ev: 'ดาวรุ่นแรกส่องสว่าง สิ้นสุดยุคมืด', k: 8 },
  { u: 0.79, n: 'กำเนิดกาแล็กซี', has: 'กาแล็กซีเล็ก ๆ ที่รวมกันเป็นกาแล็กซีใหญ่', ev: 'ซูเปอร์โนวาสร้างธาตุหนักกระจายสู่อวกาศ', k: 9 },
  { u: 0.897, n: 'กำเนิดระบบสุริยะ', has: 'กาแล็กซีมากมาย ดวงอาทิตย์และโลก', ev: 'ระบบสุริยะเกิดจากเนบิวลา เมื่อ 4,600 ล้านปีก่อน', k: 10 },
  { u: 0.94, n: 'ยุคขยายตัวเร่ง', has: 'กาแล็กซีมากมาย ดวงอาทิตย์และโลก', ev: 'พลังงานมืด (dark energy) ทำให้การขยายตัวเร็วขึ้น', k: 11 },
  { u: 0.99, n: 'ปัจจุบัน', has: 'กาแล็กซีหลายแสนล้านแห่ง CMB เหลือ 2.7 K', ev: 'เอกภพยังขยายตัวและเย็นลงต่อไป', k: 11 },
];
const A_CONE = [[0, '#ffffff'], [0.12, '#fffbe6'], [0.2, '#ffe7a0'], [0.36, '#ffbe5c'], [0.5, '#f58a3a'], [0.6, '#d8612e'], [0.625, '#8a3a3a'], [0.65, '#1b1d3a'], [0.745, '#151b3d'], [1, '#111c44']];
function A_coneCol(u) {
  for (let k = 1; k < A_CONE.length; k++) if (u <= A_CONE[k][0]) return mix(A_CONE[k - 1][1], A_CONE[k][1], (u - A_CONE[k - 1][0]) / (A_CONE[k][0] - A_CONE[k - 1][0]));
  return A_CONE[A_CONE.length - 1][1];
}
const A_coneH = (u) => 3 + 30 * smooth(0.1, 0.18, u) + 72 * Math.pow(clamp((u - 0.18) / 0.82, 0, 1), 1.5);
let A_coneCv = null;
function A_cone(xa, xb, cy) {
  if (A_coneCv) return A_coneCv;
  const cv = makeCanvas(), x = cv.getContext('2d'), R = A_rng(41), W = xb - xa;
  x.beginPath(); x.moveTo(xa, cy);
  for (let X = xa; X <= xb; X += 2) x.lineTo(X, cy - A_coneH((X - xa) / W));
  for (let X = xb; X >= xa; X -= 2) x.lineTo(X, cy + A_coneH((X - xa) / W));
  x.closePath(); x.save(); x.clip();
  for (let X = xa; X <= xb; X += 2) { x.fillStyle = A_coneCol((X - xa) / W); x.fillRect(X, cy - 120, 2.5, 240); }
  const sh = x.createLinearGradient(0, cy - 110, 0, cy + 110);
  sh.addColorStop(0, 'rgba(0,0,0,0.35)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.1)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)');
  x.fillStyle = sh; x.fillRect(xa, cy - 120, W, 240);
  for (let k = 0; k < 260; k++) {
    const u = 0.18 + R() * 0.42, X = xa + u * W, h = A_coneH(u);
    x.fillStyle = `rgba(255,255,230,${0.2 + R() * 0.4})`; x.fillRect(X, cy + (R() * 2 - 1) * h, 1.6, 1.6);
  }
  const cm = x.createLinearGradient(xa + 0.6 * W, 0, xa + 0.64 * W, 0);
  cm.addColorStop(0, 'rgba(255,170,90,0)'); cm.addColorStop(0.5, 'rgba(255,190,120,0.75)'); cm.addColorStop(1, 'rgba(255,170,90,0)');
  x.fillStyle = cm; x.fillRect(xa + 0.6 * W, cy - 120, 0.04 * W, 240);
  for (let k = 0; k < 200; k++) {
    const u = 0.745 + R() * 0.255, X = xa + u * W, h = A_coneH(u);
    x.fillStyle = R() < 0.5 ? 'rgba(190,215,255,0.9)' : 'rgba(255,255,255,0.8)';
    const s = 1 + R() * 1.6; x.fillRect(X, cy + (R() * 2 - 1) * h * 0.95, s, s);
  }
  for (let k = 0; k < 34; k++) {
    const u = 0.8 + R() * 0.2, X = xa + u * W, h = A_coneH(u), Y = cy + (R() * 2 - 1) * h * 0.85;
    x.save(); x.translate(X, Y); x.rotate(R() * 3); x.scale(1, 0.45);
    x.fillStyle = R() < 0.5 ? 'rgba(255,214,160,0.85)' : 'rgba(190,210,255,0.85)'; x.beginPath(); x.arc(0, 0, 2.5 + R() * 3, 0, 7); x.fill(); x.restore();
  }
  x.restore();
  x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 1.5;
  for (const s of [-1, 1]) { x.beginPath(); for (let X = xa; X <= xb; X += 2) { const Y = cy + s * A_coneH((X - xa) / W); X === xa ? x.moveTo(X, Y) : x.lineTo(X, Y); } x.stroke(); }
  return (A_coneCv = cv);
}
function A_lens(ctx, k, f, x, y, r, t) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  const bg = (a, b) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  const jit = (i, amp, sp) => [x + Math.sin(i * 12.9898) * r * 0.78 + amp * Math.sin(t * sp + i * 1.7), y + Math.cos(i * 78.233) * r * 0.78 + amp * Math.cos(t * sp * 1.13 + i * 2.3)];
  if (k === 0) {
    bg('#ffffff', '#ffd27a');
    const p = 0.5 + 0.5 * Math.sin(t * 4);
    glow(ctx, x, y, r * (0.5 + 0.2 * p), 'rgba(255,255,255,1)');
  } else if (k === 1) {
    bg('#ffffff', '#ffcf6b');
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 2.5;
    for (let i = 0; i < 4; i++) ring(ctx, x, y, mod1(t * 0.6 + i / 4) * r * 1.1);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, q = mod1(t * 0.6 + i * 0.13); arrow(ctx, x + Math.cos(a) * r * 0.2, y + Math.sin(a) * r * 0.2, x + Math.cos(a) * r * (0.35 + 0.5 * q), y + Math.sin(a) * r * (0.35 + 0.5 * q), { color: 'rgba(200,120,20,0.7)', w: 2.5, head: 9 }); }
  } else if (k === 2) {
    bg('#ffd08a', '#ff8f3a');
    const qc = ['#e03131', '#2f9e44', '#1c7ed6'];
    for (let i = 0; i < 42; i++) { const [px, py] = jit(i, 9, 3.2); circle(ctx, px, py, i % 7 === 6 ? 2.5 : 4.5, i % 7 === 6 ? '#fff' : qc[i % 3]); }
  } else if (k === 3) {
    bg('#ffc37a', '#f08a3a');
    for (let i = 0; i < 20; i++) {
      const [px, py] = jit(i, 6, 1.6), pr = i % 2 === 0;
      circle(ctx, px, py, 8, pr ? '#e03131' : '#868e96');
      label(ctx, pr ? 'p' : 'n', px, py, { size: 11, wt: 700, color: '#fff' });
    }
  } else if (k === 4) {
    bg('#ffb366', '#e0702e');
    const nHe = 2 + Math.round(f * 3);
    for (let i = 0; i < 14; i++) {
      const [px, py] = jit(i, 5, 1.3);
      if (i < nHe) { [[-4, -4, 1], [4, -4, 0], [-4, 4, 0], [4, 4, 1]].forEach(([dx, dy, p]) => circle(ctx, px + dx, py + dy, 5, p ? '#e03131' : '#868e96')); }
      else circle(ctx, px, py, 5.5, '#e03131');
    }
    label(ctx, 'He', x - r * 0.35, y + r * 0.62, { size: 12, wt: 700, color: '#fff', bg: 'rgba(0,0,0,0.3)', pad: 3 });
  } else if (k === 5) {
    bg('#e8804a', '#b8502a');
    for (let i = 0; i < 16; i++) { const [px, py] = jit(i, 5, 1.2); circle(ctx, px, py, i % 4 === 0 ? 6 : 4.5, '#c92a2a'); }
    for (let i = 0; i < 18; i++) { const [px, py] = jit(i + 40, 12, 4); circle(ctx, px, py, 2.2, '#74c0fc'); }
    ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2;
    for (let j = 0; j < 3; j++) {
      ctx.beginPath(); let px = x - r * 0.6 + j * 30, py = y - r * 0.5 + j * 25; ctx.moveTo(px, py);
      for (let s = 0; s < 6; s++) { const a = Math.sin(s * 91.7 + j * 13 + Math.floor(t * 2)) * 3; px += Math.cos(a) * 18; py += Math.sin(a) * 18; ctx.lineTo(px, py); }
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,200,150,0.25)'; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  } else if (k === 6) {
    bg('#5a3a4a', '#241a36');
    ctx.strokeStyle = 'rgba(116,192,252,0.7)'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 9; i++) { const [px, py] = jit(i, 3, 0.8); circle(ctx, px, py, 4, '#ff6b6b'); ring(ctx, px, py, 10); const a = t * 3 + i; circle(ctx, px + Math.cos(a) * 10, py + Math.sin(a) * 10, 2, '#74c0fc'); }
    ctx.strokeStyle = 'rgba(255,190,110,0.9)'; ctx.lineWidth = 2;
    for (let j = 0; j < 4; j++) {
      const yy = y - r * 0.6 + j * r * 0.4, x0 = x - r + mod1(t * 0.4 + j * 0.3) * r * 2 - 40;
      ctx.beginPath(); for (let s = 0; s <= 40; s += 2) { const X = x0 + s, Y = yy + 4 * Math.sin(s * 0.5); s ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke();
      chevron(ctx, x0 + 44, yy, 0, 'rgba(255,190,110,0.9)', 6);
    }
  } else if (k === 7) {
    bg('#151a3a', '#070b1e');
    for (let i = 0; i < 6; i++) { const [px, py] = jit(i, 6, 0.4); glow(ctx, px, py, 26, 'rgba(120,130,200,0.35)'); }
  } else if (k === 8) {
    bg('#151a3a', '#070b1e');
    for (let i = 0; i < 5; i++) { const [px, py] = jit(i, 4, 0.3); glow(ctx, px, py, 24, 'rgba(120,130,200,0.3)'); }
    for (let i = 0; i < 5; i++) { const [px, py] = jit(i + 20, 2, 0.3), p = 0.6 + 0.4 * Math.sin(t * 3 + i); glow(ctx, px, py, 16 * p + 6, 'rgba(150,190,255,0.9)'); circle(ctx, px, py, 3, '#fff'); }
  } else {
    bg('#121a40', '#060a1c');
    const n = k === 9 ? 6 : 10;
    for (let i = 0; i < n; i++) { const [px, py] = jit(i + 7, 3, 0.25); A_gal(ctx, px, py, k === 9 ? 5 : 7, i * 0.9 + t * 0.05, i % 2 ? '#ffd8a8' : '#bac8ff'); }
    if (k === 9) { const d = 22 * (1 - mod1(t * 0.15)); A_gal(ctx, x - d, y + 10, 6, 0.4, '#d0bfff'); A_gal(ctx, x + d, y + 10, 5, 1.2, '#d0bfff'); }
    if (k >= 10 && f < 1.5) {
      A_gal(ctx, x, y, 14, t * 0.1, '#e5dbff', 0.5);
      if (k === 10) { circle(ctx, x + 9, y + 3, 3, '#ffd43b'); label(ctx, 'ดวงอาทิตย์', x + 12, y + 22, { size: 12, wt: 700, color: '#ffd43b' }); }
    }
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; ring(ctx, x, y, r);
}
function A_dTimeline(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 232, bot = 700;
  const xa = X0 + 40, xb = X1 - 30, cy = 350, u = st.u;
  const sec = Math.pow(10, A_logT(u)), T = A_T(sec);
  let si = 0; for (let k = 0; k < A_STG.length; k++) if (u >= A_STG[k].u) si = k;
  const S = A_STG[si], f = (u - S.u) / ((A_STG[si + 1] || { u: 1.0001 }).u - S.u);
  A_space(ctx, X0, top, W, bot - top, 9, 50);
  ctx.save(); rr(ctx, X0, top, W, bot - top, 16); ctx.clip();
  label(ctx, 'เวลาหลังบิกแบง (มาตราส่วนลอการิทึม)', X0 + 18, 254, { size: 15, wt: 600, color: 'rgba(255,255,255,0.7)', align: 'left' });
  ctx.drawImage(A_cone(xa, xb, cy), 0, 0);
  const tickY = cy + 116;
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(xa, tickY, xb - xa, 1.5);
  const ticks = [[0.10, A_pow10(-36) + ' วินาที'], [0.36, '1 วินาที'], [0.48, '3 นาที'], [0.62, '380,000 ปี'], [0.74, '150 ล้านปี'], [0.90, '9,200 ล้านปี'], [1, '13,800 ล้านปี']];
  ticks.forEach(([tu, txt], i) => {
    const X = lerp(xa, xb, tu), row = i % 2;
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(X - 1, tickY - 5, 2, 10 + row * 18);
    label(ctx, txt, X, tickY + 18 + row * 20, { size: 13, wt: 600, color: 'rgba(255,255,255,0.85)', align: tu === 1 ? 'right' : 'center' });
  });
  const sx = lerp(xa, xb, u), h = A_coneH(u);
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.beginPath(); ctx.ellipse(sx, cy, 5 + h * 0.2, h + 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
  const lr = 74, lx = clamp(sx, X0 + 252, X1 - 278), ly = 610;
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
  ctx.beginPath(); ctx.moveTo(sx, cy + h); ctx.lineTo(lx - lr * 0.7, ly - lr * 0.7); ctx.moveTo(sx, cy + h); ctx.lineTo(lx + lr * 0.7, ly - lr * 0.7); ctx.stroke(); ctx.setLineDash([]);
  A_lens(ctx, S.k, f, lx, ly, lr, t);
  label(ctx, 'ภาพขยาย', lx, ly - lr - 12, { size: 13, wt: 700, color: '#fff', bg: rgba(th.a, 0.85), pad: 5 });
  circle(ctx, sx, tickY, 13, '#fff'); ctx.strokeStyle = th.a; ctx.lineWidth = 4; ring(ctx, sx, tickY, 13);
  chevron(ctx, sx - 24, tickY, Math.PI, '#fff', 8); chevron(ctx, sx + 24, tickY, 0, '#fff', 8);
  label(ctx, '← อดีต ร้อนและเล็ก', X0 + 18, 680, { size: 16, wt: 700, color: '#ffd8a8', align: 'left' });
  label(ctx, 'ปัจจุบัน เย็นและกว้าง →', X1 - 18, 680, { size: 16, wt: 700, color: '#a5d8ff', align: 'right' });
  ctx.restore();
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: 'ew-resize', drag: (px) => { st.u = clamp((px - xa) / (xb - xa), 0, 1); } });
  hint(ctx, P, 'ลากซ้าย–ขวาบนภาพ เพื่อเดินทางตามเวลาของเอกภพ', 724);
  const cy0 = 752, ch = 196;
  A_card(ctx, X0, cy0, W, ch, th.a);
  label(ctx, S.n, X0 + 24, cy0 + 30, { size: 27, wt: 600, color: th.a, align: 'left', fam: F.display });
  label(ctx, 'อายุเอกภพ', X0 + 24, cy0 + 72, { size: 16, wt: 600, color: C.soft, align: 'left' });
  label(ctx, u < 0.05 ? 't ≈ 0 (จุดเริ่มต้น)' : A_age(sec), X0 + 24, cy0 + 100, { size: 25, wt: 700, color: C.ink, align: 'left' });
  label(ctx, 'อุณหภูมิ', X0 + W * 0.55, cy0 + 72, { size: 16, wt: 600, color: C.soft, align: 'left' });
  label(ctx, u < 0.05 ? 'สูงกว่า ' + A_pow10(30) + ' K' : A_Tfmt(T), X0 + W * 0.55, cy0 + 100, { size: 25, wt: 700, color: mix('#e8590c', '#1c7ed6', u), align: 'left' });
  let y = para(ctx, '**มีอะไรอยู่:** ' + S.has, X0 + 24, cy0 + 122, W - 44, 18, { bcolor: th.a });
  para(ctx, '**เหตุการณ์เด่น:** ' + S.ev, X0 + 24, y, W - 44, 18, { bcolor: th.a });
  // element mass fractions and cooling
  const by = 972, half = (W - 20) / 2;
  stitle(ctx, 'ธาตุจาก 3 นาทีแรก (โดยมวล)', X0, by, th);
  const bx = X0, bw = half, bh = 40, b0 = by + 50, grow = smooth(0.42, 0.5, u);
  ctx.fillStyle = 'rgba(120,105,80,0.15)'; rr(ctx, bx, b0, bw, bh, 8); ctx.fill();
  ctx.save(); rr(ctx, bx, b0, Math.max(1, bw * grow), bh, 8); ctx.clip();
  ctx.fillStyle = '#e03131'; ctx.fillRect(bx, b0, bw * 0.75, bh); ctx.fillStyle = '#868e96'; ctx.fillRect(bx + bw * 0.75, b0, bw * 0.25, bh); ctx.restore();
  if (grow > 0.6) label(ctx, 'H ≈ 75%', bx + bw * 0.375, b0 + bh / 2, { size: 18, wt: 700, color: '#fff' });
  if (grow > 0.9) label(ctx, 'He ≈ 25%', bx + bw * 0.875, b0 + bh / 2, { size: 15, wt: 700, color: '#fff' });
  para(ctx, grow > 0.9 ? 'ลิเทียมมีเพียงเล็กน้อย ธาตุหนักเกิดภายหลังในดาวฤกษ์' : 'ลากไปถึงนาทีที่ 3 เพื่อดูสัดส่วนธาตุ', bx, b0 + 50, bw, 16, { color: C.soft });
  const tx = X0 + half + 20, tw = half;
  stitle(ctx, 'ยิ่งขยาย ยิ่งเย็น', tx, by, th);
  const ex = clamp(1 - Math.log10(Math.max(T, 2.7) / 2.7) / 31, 0, 1);
  circle(ctx, tx + 30, b0 + 20, 8 + 4 * (1 - ex), mix('#ffd43b', '#1c7ed6', ex));
  ctx.strokeStyle = 'rgba(37,48,58,0.4)'; ctx.lineWidth = 1.5; ring(ctx, tx + 30, b0 + 20, 26);
  circle(ctx, tx + 30, b0 + 20, 6 + 20 * ex, rgba('#1c7ed6', 0.15));
  para(ctx, 'แสง CMB ปล่อยออกมาที่ ~3,000 K แล้วถูกยืดตามอวกาศที่ขยาย ~1,100 เท่า จึงเหลือ **2.7 K** ในวันนี้', tx + 66, b0 - 4, tw - 70, 16, { bcolor: th.a });
}

// ------------------------------------------------------------ page 6 · อวกาศยืด redshift และกฎของฮับเบิล
const A_G6 = (() => {
  const R = A_rng(17), out = [], fixed = { '0,0': 'เรา', '-3,1': 'X', '1,-1': 'A', '3,1': 'B', '4,-1': 'C' };
  for (let i = -8; i <= 8; i++) for (let j = -5; j <= 5; j++) {
    const tag = fixed[i + ',' + j] || null;
    out.push({ i: i + (tag ? 0 : (R() - 0.5) * 0.55), j: j + (tag ? 0 : (R() - 0.5) * 0.55), tag, c: ['#ffd8a8', '#bac8ff', '#ffffff', '#ffc9c9'][Math.floor(R() * 4)], s: 2.6 + R() * 2.2, a: R() * 3, arr: !!tag || R() < 0.3 });
  }
  return out;
})();
const A_LINES = [[393.4, ''], [396.8, 'Ca'], [486.1, 'Hβ'], [517.3, 'Mg'], [589.0, 'Na'], [656.3, 'Hα']];
let A_specG = null;
function A_dHubble(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 232, bot = 632, cyP = 432, cell = 34, s = st.s;
  const obs = A_G6.find(g => g.tag === (st.obs ? 'X' : 'เรา')), ch = A_G6.find(g => g.tag === 'ABC'[st.g]);
  const rel = (g) => [(g.i - obs.i), (g.j - obs.j)];
  const H0 = 70, c = 299792;
  A_space(ctx, X0, top, W, bot - top, 3, 40);
  ctx.save(); rr(ctx, X0, top, W, bot - top, 16); ctx.clip();
  ctx.strokeStyle = 'rgba(160,180,255,0.16)'; ctx.lineWidth = 1;
  for (let k = -12; k <= 12; k++) {
    const X = cx + (k + 0.5 - (obs.i % 1)) * cell * s, Y = cyP + (k + 0.5) * cell * s;
    ctx.beginPath(); ctx.moveTo(X, top); ctx.lineTo(X, bot); ctx.moveTo(X0, Y); ctx.lineTo(X1, Y); ctx.stroke();
  }
  const pulse = mod1(t * 0.5);
  for (const g of A_G6) {
    const [ri, rj] = rel(g), x = cx + ri * cell * s, y = cyP + rj * cell * s;
    if (x < X0 - 20 || x > X1 + 20 || y < top - 20 || y > bot + 20) continue;
    const dpx = Math.hypot(x - cx, y - cyP);
    if (dpx > 8 && g.arr) {
      const L = Math.min(0.2 * dpx, 60), ux = (x - cx) / dpx, uy = (y - cyP) / dpx, o = 8 + pulse * 6;
      arrow(ctx, x + ux * o, y + uy * o, x + ux * (o + L), y + uy * (o + L), { color: `rgba(255,190,120,${0.3 + 0.5 * (1 - pulse)})`, w: 2.2, head: 8 });
    }
    A_gal(ctx, x, y, g.s, g.a + t * 0.05, g.c);
    if (g.tag) {
      const on = g === ch, me = g === obs, col = me ? '#ffd43b' : on ? A_LITE : 'rgba(255,255,255,0.8)';
      if (on || me) { ctx.strokeStyle = col; ctx.lineWidth = 2.5; ring(ctx, x, y, 13); }
      label(ctx, g.tag, x, y - 24, { size: 14, wt: 700, color: me || on ? '#0b1730' : '#fff', bg: me || on ? col : 'rgba(255,255,255,0.18)', pad: 4 });
    }
  }
  const [ci, cj] = rel(ch), gx = cx + ci * cell * s, gy = cyP + cj * cell * s;
  ctx.strokeStyle = 'rgba(185,165,255,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(cx, cyP); ctx.lineTo(gx, gy); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, `ขนาดของอวกาศ ×${s.toFixed(2)}`, X0 + 18, 256, { size: 16, wt: 700, color: '#fff', align: 'left', bg: 'rgba(11,23,48,0.75)', pad: 6 });
  label(ctx, 'ทุกกาแล็กซีเห็นกาแล็กซีอื่นถอยห่าง · ไม่มีจุดศูนย์กลาง', X1 - 18, 256, { size: 14, wt: 600, color: '#d0bfff', align: 'right', bg: 'rgba(11,23,48,0.75)', pad: 6 });
  label(ctx, '← อวกาศหดกลับ (อดีต)', X0 + 18, bot - 22, { size: 16, wt: 700, color: '#ffd8a8', align: 'left', bg: 'rgba(11,23,48,0.75)', pad: 5 });
  label(ctx, 'อวกาศยืดออก (อนาคต) →', X1 - 18, bot - 22, { size: 16, wt: 700, color: '#ffc9c9', align: 'right', bg: 'rgba(11,23,48,0.75)', pad: 5 });
  ctx.restore();
  const dOf = (g) => { const [a, b] = rel(g); return Math.hypot(a, b) * 100 * s; };
  const d = dOf(ch), v = H0 * d, z = v / c;
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: 'ew-resize', drag: (px, py, ph) => {
    if (ph === 'end') return;
    st.s = 1 + 1.2 * clamp((px - X0 - 30) / (W - 60), 0, 1);
    const dd = dOf(ch), last = st.tr[st.tr.length - 1];
    if (!last || Math.abs(last - dd) > 6) { st.tr.push(dd); if (st.tr.length > 260) st.tr.shift(); }
  } });
  hint(ctx, P, 'ลากซ้าย–ขวาบนภาพ เพื่อยืดหรือหดอวกาศ', 652);
  const ry = 676, rh = 86;
  A_card(ctx, X0, ry, W, rh, th.a);
  const cols = [['กาแล็กซี', 'ABC'[st.g], 'จาก' + (st.obs ? 'กาแล็กซี X' : 'กาแล็กซีของเรา')], ['ระยะทาง d', A_fmt(d) + ' Mpc', '≈ ' + A_fmt(d * 3.26) + ' ล้านปีแสง'], ['ความเร็วถอยห่าง v', A_fmt(A_sig(v, 3)) + ' km/s', 'v = H₀d'], ['การเลื่อนไปทางแดง', 'z ≈ ' + z.toFixed(3), 'z ≈ v/c']];
  const cw = (W - 30) / 4;
  cols.forEach(([a, b, c2], i) => {
    const x = X0 + 24 + i * cw;
    label(ctx, a, x, ry + 20, { size: 15, wt: 600, color: C.soft, align: 'left' });
    label(ctx, b, x, ry + 46, { size: 22, wt: 700, color: i === 3 ? '#c92a2a' : C.ink, align: 'left' });
    label(ctx, c2, x, ry + 70, { size: 13, wt: 500, color: C.soft, align: 'left' });
  });
  // spectrum
  const sx0 = X0 + 104, sx1 = X1, L0 = 380, L1 = 760, lx = (l) => lerp(sx0, sx1, (l - L0) / (L1 - L0));
  if (!A_specG) {
    A_specG = ctx.createLinearGradient(sx0, 0, sx1, 0);
    [[380, '#4b1680'], [420, '#6a3df0'], [460, '#2f5bff'], [490, '#00b8f0'], [520, '#2fcf3a'], [570, '#ffe23a'], [600, '#ff9a1f'], [650, '#ff2a1a'], [700, '#b0001a'], [760, '#3a0008']].forEach(([l, col]) => A_specG.addColorStop((l - L0) / (L1 - L0), col));
  }
  label(ctx, `สเปกตรัมของกาแล็กซี ${'ABC'[st.g]}`, X0, 786, { size: 19, wt: 700, color: th.a, align: 'left', fam: F.display });
  label(ctx, `เส้นดูดกลืนเลื่อนไป Δλ = ${(656.3 * z).toFixed(0)} nm (Hα)`, X1, 786, { size: 15, wt: 600, color: '#c92a2a', align: 'right' });
  const y1 = 812, y2 = 852;
  label(ctx, 'ห้องทดลอง', sx0 - 10, y1 + 10, { size: 14, wt: 600, color: C.soft, align: 'right' });
  label(ctx, 'กาแล็กซี ' + 'ABC'[st.g], sx0 - 10, y2 + 15, { size: 14, wt: 700, color: C.ink, align: 'right' });
  ctx.fillStyle = A_specG; ctx.fillRect(sx0, y1, sx1 - sx0, 20); ctx.fillRect(sx0, y2, sx1 - sx0, 30);
  for (const [l, nm] of A_LINES) {
    const a = lx(l), b = lx(l * (1 + z));
    ctx.fillStyle = '#111'; ctx.fillRect(a - 1.5, y1, 3, 20);
    if (nm) label(ctx, nm, a, y1 - 10, { size: 12, wt: 700, color: C.soft });
    if (b < sx1 - 1) { ctx.fillStyle = '#111'; ctx.fillRect(b - 1.5, y2, 3, 30); }
    if (Math.abs(b - a) > 6) { ctx.strokeStyle = 'rgba(37,48,58,0.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(a, y1 + 21); ctx.lineTo(Math.min(b, sx1), y2 - 1); ctx.stroke(); }
  }
  for (const l of [400, 500, 600, 700]) label(ctx, l + ' nm', lx(l), y2 + 42, { size: 12, wt: 600, color: C.soft });
  // buttons
  const by = 936;
  label(ctx, 'เลือกกาแล็กซีที่ดูสเปกตรัม', X0, by, { size: 16, wt: 700, color: C.ink, align: 'left' });
  ['A', 'B', 'C'].forEach((g, i) => A_btn(ctx, P, X0 + i * 96, by + 20, 86, 40, 'กาแล็กซี ' + g, st.g === i, () => { st.g = i; st.tr = []; }));
  label(ctx, 'ผู้สังเกตอยู่ที่', X0, by + 92, { size: 16, wt: 700, color: C.ink, align: 'left' });
  A_btn(ctx, P, X0, by + 112, 136, 40, 'กาแล็กซีของเรา', !st.obs, () => { st.obs = 0; st.tr = []; });
  A_btn(ctx, P, X0 + 146, by + 112, 136, 40, 'กาแล็กซี X', !!st.obs, () => { st.obs = 1; st.tr = []; });
  // Hubble plot
  const gx0 = X0 + 360, gx1 = X1 - 6, gy0 = 1080, gy1 = 952, D = 1500, V = 105000;
  const px = (dd) => lerp(gx0, gx1, dd / D), py = (vv) => lerp(gy0, gy1, vv / V);
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(gx0, gy1, gx1 - gx0, gy0 - gy1);
  ctx.strokeStyle = 'rgba(37,48,58,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.stroke();
  label(ctx, 'กฎของฮับเบิล', gx0, gy1 - 16, { size: 16, wt: 700, color: th.a, align: 'left' });
  label(ctx, 'v (km/s)', gx0 + 6, gy1 + 12, { size: 12, wt: 600, color: C.soft, align: 'left' });
  for (const dd of [0, 500, 1000, 1500]) label(ctx, String(dd), px(dd), gy0 + 13, { size: 12, wt: 600, color: C.soft });
  label(ctx, 'd (Mpc)', gx1, gy0 + 30, { size: 12, wt: 600, color: C.soft, align: 'right' });
  ctx.strokeStyle = rgba(th.a, 0.6); ctx.lineWidth = 2; ctx.setLineDash([7, 5]); ctx.beginPath(); ctx.moveTo(px(0), py(0)); ctx.lineTo(px(D), py(H0 * D)); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, 'ความชัน = H₀ ≈ 70', px(1150), py(70 * 1150) - 22, { size: 12, wt: 700, color: th.a });
  for (const g of A_G6) { const dd = dOf(g); if (dd > 0 && dd < D) circle(ctx, px(dd), py(H0 * dd), 2.2, 'rgba(93,104,114,0.45)'); }
  for (const dd of st.tr) if (dd < D) circle(ctx, px(dd), py(H0 * dd), 3.5, rgba(th.a, 0.55));
  if (d < D) { circle(ctx, px(d), py(v), 7, th.a); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ring(ctx, px(d), py(v), 7); }
}

// ------------------------------------------------------------ page 8 · ส้อมเสียงของฮับเบิล
const A_N8 = 440;
const A_PT8 = (() => { const R = A_rng(29), o = []; for (let k = 0; k < A_N8; k++) o.push([R(), R(), R(), R(), R(), Math.floor(R() * 5), R(), R()]); return o; })();
const A_IRR = [[-0.35, -0.1], [0.25, -0.25], [0.05, 0.2], [0.5, 0.15], [-0.2, 0.3]];
const A_UX = [[0, 50], [0.5, 358], [0.62, 420], [0.74, 510], [0.87, 600], [1, 690]];
function A_u2x(u, X0) { for (let k = 1; k < A_UX.length; k++) if (u <= A_UX[k][0]) return X0 + lerp(A_UX[k - 1][1], A_UX[k][1], (u - A_UX[k - 1][0]) / (A_UX[k][0] - A_UX[k - 1][0])); return X0 + 690; }
function A_x2u(x, X0) { const d = x - X0; if (d <= 50) return 0; for (let k = 1; k < A_UX.length; k++) if (d <= A_UX[k][1]) return lerp(A_UX[k - 1][0], A_UX[k][0], (d - A_UX[k - 1][1]) / (A_UX[k][1] - A_UX[k - 1][1])); return 1; }
function A_type(st) {
  if (st.irr) return 'irr';
  if (st.u <= 0.53) return 'E' + Math.round(7 * Math.min(st.u, 0.5) / 0.5);
  if (st.u < 0.68) return 'S0';
  return (st.bar ? 'SB' : 'S') + (st.u < 0.805 ? 'a' : st.u < 0.935 ? 'b' : 'c');
}
const A_INFO = {
  E: { n: 'กาแล็กซีรี (elliptical)', shape: 'ทรงรีเรียบ ไม่มีแขน · ตัวเลขยิ่งมากยิ่งรี', star: 'ดาวอายุมาก สีแดง–เหลือง', gas: 'แก๊สและฝุ่นน้อยมาก แทบไม่มีดาวเกิดใหม่', gf: 0.04 },
  S0: { n: 'กาแล็กซีรูปเลนส์ (lenticular)', shape: 'มีจานแบนและส่วนป่องใหญ่ แต่ไม่มีแขน', star: 'ดาวอายุมากเป็นส่วนใหญ่', gas: 'แก๊สน้อย ดาวเกิดใหม่น้อย', gf: 0.15, ex: 'NGC 5866' },
  a: { shape: 'ส่วนป่องใหญ่ แขนพันแน่น', star: 'ใจกลางดาวแก่สีเหลือง แขนมีดาวอายุน้อยบ้าง', gas: 'แก๊สค่อนข้างน้อย', gf: 0.35 },
  b: { shape: 'ส่วนป่องปานกลาง แขนเห็นชัด', star: 'ดาวแก่ที่ใจกลาง ดาวอายุน้อยสีน้ำเงินในแขน', gas: 'แก๊สปานกลาง มีดาวเกิดใหม่ในแขน', gf: 0.55 },
  c: { shape: 'ส่วนป่องเล็ก แขนกางหลวม', star: 'ดาวอายุน้อยสีน้ำเงินจำนวนมาก', gas: 'แก๊สและฝุ่นมาก ดาวเกิดใหม่มาก', gf: 0.75 },
  irr: { n: 'กาแล็กซีไม่มีรูปแบบ (irregular)', shape: 'รูปร่างไม่แน่นอน ไม่สมมาตร', star: 'ดาวอายุน้อยสีน้ำเงินมาก', gas: 'แก๊สมาก ดาวเกิดใหม่มากที่สุด', gf: 0.92, ex: 'เมฆแมเจลแลนใหญ่และเล็ก' },
};
const A_EX = { Sa: 'M104 หมวกปีกกว้าง (Sombrero)', Sb: 'M31 แอนดรอเมดา', Sc: 'M33 สามเหลี่ยม (Triangulum)', SBa: 'NGC 4314', SBb: 'NGC 1300 · ทางช้างเผือก (SBbc)', SBc: 'NGC 7479' };
function A_icon(ctx, x, y, kind, n, bar) {
  if (kind === 'E') { ctx.save(); ctx.translate(x, y); ctx.scale(1, 1 - n / 10); glow(ctx, 0, 0, 16, 'rgba(255,210,150,0.95)'); ctx.restore(); return; }
  ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.6);
  glow(ctx, 0, 0, 17, 'rgba(220,220,255,0.55)'); glow(ctx, 0, 0, 7 + (kind === 'S0' ? 4 : 3 - n), 'rgba(255,215,160,1)');
  if (kind !== 'S0') {
    ctx.strokeStyle = 'rgba(190,210,255,0.95)'; ctx.lineWidth = 2;
    if (bar) { ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke(); }
    const open = 0.6 + n * 0.45, r0 = bar ? 8 : 4;
    for (const s of [0, Math.PI]) { ctx.beginPath(); for (let a = 0; a <= 2.6; a += 0.2) { const r = r0 + a * (13 - r0) / 2.6 * (0.7 + 0.15 * n); const th = s - a * (1.6 / open); a ? ctx.lineTo(r * Math.cos(th), r * Math.sin(th)) : ctx.moveTo(r * Math.cos(th), r * Math.sin(th)); } ctx.stroke(); }
  }
  ctx.restore();
}
function A_dFork(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 232, bot = 700, yH = 330;
  const lt = st._lt ?? t, dt = clamp(t - lt, 0, 0.1); st._lt = t;
  st.irrF += ((st.irr ? 1 : 0) - st.irrF) * Math.min(1, dt * 4);
  const u = st.u, bar = st.bar, I = st.irrF;
  A_space(ctx, X0, top, W, bot - top, 13, 60);
  ctx.save(); rr(ctx, X0, top, W, bot - top, 16); ctx.clip();
  // fork
  const xS0 = X0 + 420, xE7 = X0 + 358;
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(X0 + 50, yH); ctx.lineTo(xS0, yH);
  for (const s of [-1, 1]) { ctx.moveTo(xS0, yH); ctx.lineTo(X0 + 510, yH + s * 50); ctx.lineTo(X0 + 690, yH + s * 50); }
  ctx.stroke(); ctx.lineCap = 'butt';
  for (let n = 0; n <= 7; n++) { const x = X0 + 50 + n * 44; A_icon(ctx, x, yH, 'E', n); label(ctx, 'E' + n, x, yH + 32, { size: 13, wt: 700, color: 'rgba(255,255,255,0.85)' }); }
  A_icon(ctx, xS0, yH, 'S0', 0); label(ctx, 'S0', xS0, yH + 32, { size: 13, wt: 700, color: 'rgba(255,255,255,0.85)' });
  ['a', 'b', 'c'].forEach((L, n) => {
    const x = X0 + 510 + n * 90;
    A_icon(ctx, x, yH - 50, 'S', n, false); label(ctx, 'S' + L, x, yH - 80, { size: 14, wt: 700, color: bar ? 'rgba(255,255,255,0.6)' : '#fff' });
    A_icon(ctx, x, yH + 50, 'S', n, true); label(ctx, 'SB' + L, x, yH + 80, { size: 14, wt: 700, color: bar ? '#fff' : 'rgba(255,255,255,0.6)' });
  });
  label(ctx, 'แบบปกติ', X0 + 468, yH - 58, { size: 13, wt: 600, color: '#a5d8ff', align: 'right' });
  label(ctx, 'แบบมีคาน', X0 + 468, yH + 58, { size: 13, wt: 600, color: '#a5d8ff', align: 'right' });
  label(ctx, 'ด้าม: กาแล็กซีรี', X0 + 20, 254, { size: 13, wt: 600, color: '#ffd8a8', align: 'left' });
  if (!st.irr) {
    const mx = A_u2x(u, X0), my = yH + (bar ? 1 : -1) * 50 * smooth(0.62, 0.74, u);
    circle(ctx, mx, my, 24, rgba(A_LITE, 0.25)); ctx.strokeStyle = A_LITE; ctx.lineWidth = 3.5; ring(ctx, mx, my, 24);
    chevron(ctx, mx - 34, my, Math.PI, A_LITE, 8); chevron(ctx, mx + 34, my, 0, A_LITE, 8);
  }
  // preview galaxy
  const gcx = cx + 70, gcy = 580, R = 138, rot = t * 0.12;
  const ue = clamp(u / 0.5, 0, 1), s0 = smooth(0.5, 0.62, u), sp = smooth(0.62, 1, u), arm = smooth(0.62, 0.76, u);
  const fb = lerp(lerp(1, 0.55, s0), 0.12, sp), qB = lerp(1 - 0.7 * ue, 0.72, s0), Rb = lerp(0.8, 0.34, s0) * lerp(1, 0.6, sp);
  const pitch = lerp(11, 30, sp) * D2R, scat = lerp(Math.PI, 0.45, arm), barL = bar ? 0.42 * smooth(0.56, 0.7, u) : 0;
  const young = lerp(0, 0.8, smooth(0.6, 1, u)), pink = arm * lerp(0.03, 0.14, sp), r0 = Math.max(barL, 0.12);
  glow(ctx, gcx, gcy, R * 1.25 * (1 - fb * 0.4), `rgba(150,170,255,${0.2 * (1 - fb) * (1 - I)})`);
  ctx.save(); ctx.translate(gcx, gcy); ctx.scale(1, lerp(qB, 0.8, I));
  glow(ctx, 0, 0, R * Rb * 1.35, `rgba(255,210,150,${(0.55 * fb + 0.25) * (1 - I * 0.8)})`);
  ctx.restore();
  const B = [[], [], [], [], []], COL = ['rgba(255,214,160,0.9)', 'rgba(255,232,200,0.85)', 'rgba(185,210,255,0.9)', 'rgba(255,110,170,0.95)', 'rgba(255,255,255,0.9)'];
  for (const [q1, q2, q3, q4, q5, cl, g1, g2] of A_PT8) {
    const wB = 1 - smooth(fb * 1.15 - 0.12, fb * 1.15, q1);
    const rr0 = Rb * Math.sqrt(-2 * Math.log(1 - q2 * 0.985)) * 0.42, ab = q3 * Math.PI * 2 + rot * 0.3;
    const bx = rr0 * Math.cos(ab), by = rr0 * Math.sin(ab) * qB;
    const r = 0.12 + 0.88 * q2, m = q3 < 0.5 ? 0 : Math.PI;
    const thS = m - Math.log(Math.max(r, r0) / r0) / Math.tan(pitch) + (q4 - 0.5) * scat + rot;
    let dx = r * Math.cos(thS), dy = r * Math.sin(thS);
    const wbar = barL > 0.02 ? 1 - smooth(barL * 0.8, barL * 1.15, r) : 0;
    if (wbar > 0) { const al = m + rot, w = (q4 - 0.5) * 0.12; dx = lerp(dx, r * Math.cos(al) - w * Math.sin(al), wbar); dy = lerp(dy, r * Math.sin(al) + w * Math.cos(al), wbar); }
    dy *= 0.55;
    let x = lerp(dx, bx, wB), y = lerp(dy, by, wB);
    const ic = A_IRR[cl], gr = Math.sqrt(-2 * Math.log(1 - g1 * 0.98)) * 0.16, ga = g2 * Math.PI * 2;
    x = lerp(x, ic[0] + gr * Math.cos(ga) + 0.02 * Math.sin(t + q1 * 9), I); y = lerp(y, (ic[1] + gr * Math.sin(ga)) * 0.85, I);
    let ci = wB > 0.5 ? 0 : q5 < pink ? 3 : q5 < pink + young ? 2 : 1;
    if (I > 0.5) ci = q5 < 0.22 ? 3 : q5 < 0.8 ? 2 : 4;
    B[ci].push(gcx + x * R, gcy + y * R);
  }
  B.forEach((arr, i) => { ctx.fillStyle = COL[i]; ctx.beginPath(); for (let k = 0; k < arr.length; k += 2) ctx.rect(arr[k] - 1.2, arr[k + 1] - 1.2, i === 3 ? 3.2 : 2.4, i === 3 ? 3.2 : 2.4); ctx.fill(); });
  const code = A_type(st);
  label(ctx, code === 'irr' ? 'Irr' : code, X0 + 30, 482, { size: 44, wt: 600, color: '#fff', align: 'left', fam: F.display });
  label(ctx, 'ภาพตัวอย่าง', X0 + 30, 524, { size: 14, wt: 600, color: 'rgba(255,255,255,0.65)', align: 'left' });
  label(ctx, '← กาแล็กซีรี · กังหัน →', X0 + 30, 676, { size: 15, wt: 700, color: '#d0bfff', align: 'left' });
  ctx.restore();
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: 'grab', drag: (px, py, ph) => {
    if (ph === 'end') return;
    st.u = clamp(A_x2u(px, X0), 0, 1); st.irr = false;
    if (py < 440 && st.u > 0.62) st.bar = py > yH;
  } });
  hint(ctx, P, 'ลากวงกลมไปตามส้อมเสียง (ลากขึ้น–ลงที่ปลายส้อมเพื่อเลือกแขนง)', 722);
  // readout
  const base = code === 'irr' ? 'irr' : code[0] === 'E' ? 'E' : code === 'S0' ? 'S0' : code.slice(-1);
  const inf = A_INFO[base], name = inf.n || (code.startsWith('SB') ? 'กาแล็กซีกังหันมีคาน (barred spiral)' : 'กาแล็กซีกังหัน (spiral)');
  const ex = inf.ex || A_EX[code] || (['E0', 'E1', 'E2'].includes(code) ? 'M87 (E0)' : 'M110 (E5)');
  const ry = 746, rh = 180;
  A_card(ctx, X0, ry, W, rh, th.a);
  label(ctx, (code === 'irr' ? 'Irr' : code) + ' · ' + name, X0 + 24, ry + 30, { size: 25, wt: 600, color: th.a, align: 'left', fam: F.display });
  let y = ry + 56;
  for (const [k, v] of [['รูปร่าง', inf.shape], ['ดาวฤกษ์', inf.star], ['แก๊ส', inf.gas], ['ตัวอย่าง', ex || '—']]) y = para(ctx, `**${k}:** ${v}`, X0 + 24, y, W - 44, 18, { bcolor: th.a, lh: 28 });
  // buttons
  const by = 944;
  A_btn(ctx, P, X0, by, 200, 42, 'แบบปกติ (S)', !st.bar && !st.irr, () => { st.bar = false; st.irr = false; if (st.u < 0.74) st.u = 0.74; });
  A_btn(ctx, P, X0 + 212, by, 200, 42, 'แบบมีคาน (SB)', st.bar && !st.irr, () => { st.bar = true; st.irr = false; if (st.u < 0.74) st.u = 0.74; });
  A_btn(ctx, P, X0 + 424, by, 200, 42, 'ไม่มีรูปแบบ (Irr)', st.irr, () => { st.irr = !st.irr; });
  // gas gradient
  const gy = 1024, gx0 = X0, gx1 = X1, gf = inf.gf;
  label(ctx, 'แก๊ส ฝุ่น และดาวเกิดใหม่', gx0, gy - 16, { size: 16, wt: 700, color: C.ink, align: 'left' });
  const gg = ctx.createLinearGradient(gx0, 0, gx1, 0); gg.addColorStop(0, '#f3a86b'); gg.addColorStop(0.5, '#c9d4f5'); gg.addColorStop(1, '#4c6ef5');
  ctx.fillStyle = gg; rr(ctx, gx0, gy, gx1 - gx0, 16, 8); ctx.fill();
  const mk = lerp(gx0 + 10, gx1 - 10, gf);
  circle(ctx, mk, gy + 8, 12, '#fff'); ctx.strokeStyle = th.a; ctx.lineWidth = 3.5; ring(ctx, mk, gy + 8, 12);
  label(ctx, 'น้อย · ดาวแก่สีแดง (E)', gx0, gy + 36, { size: 14, wt: 600, color: C.soft, align: 'left' });
  label(ctx, 'มาก · ดาวอายุน้อยสีน้ำเงิน (Sc, Irr)', gx1, gy + 36, { size: 14, wt: 600, color: C.soft, align: 'right' });
  label(ctx, 'ส้อมเสียงจัดกลุ่มตามรูปร่าง ไม่ใช่ลำดับวิวัฒนาการ', cx, 1090, { size: 15, wt: 700, color: '#c2410c' });
}

// ------------------------------------------------------------ page 10 · ทางช้างเผือกเอียงได้
const A_MW = (() => {
  const R = A_rng(53), pts = [], pitch = 12 * D2R, arms = [[0, 1], [Math.PI / 2, 0.55], [Math.PI, 1], [Math.PI * 1.5, 0.55]];
  const gauss = () => Math.sqrt(-2 * Math.log(1 - R() * 0.98)) * Math.cos(R() * Math.PI * 2);
  for (let k = 0; k < 420; k++) {
    let a; do a = arms[Math.floor(R() * 4)]; while (R() > a[1]);
    const r = 0.28 + 0.72 * Math.sqrt(R()), th = a[0] - Math.log(r / 0.28) / Math.tan(pitch) + gauss() * 0.11;
    pts.push([r * Math.cos(th), r * Math.sin(th), gauss() * 0.018, R() < 0.12 ? 2 : R() < 0.6 ? 1 : 0]);
  }
  for (let k = 0; k < 90; k++) { const l = (R() * 2 - 1) * 0.27, w = gauss() * 0.05, b = 0.45; pts.push([l * Math.cos(b) - w * Math.sin(b), l * Math.sin(b) + w * Math.cos(b), gauss() * 0.04, 3]); }
  const sunA = 2.55;
  for (let k = 0; k < 34; k++) { const r = 0.5 + (R() - 0.5) * 0.06, th = sunA - 0.5 + R() * 0.9; pts.push([r * Math.cos(th), r * Math.sin(th), gauss() * 0.015, 1]); }
  const gc = [];
  for (let k = 0; k < 36; k++) { const u = R() * 2 - 1, ph = R() * Math.PI * 2, r = 0.25 + 0.85 * Math.pow(R(), 0.7), s = Math.sqrt(1 - u * u); gc.push([r * s * Math.cos(ph), r * s * Math.sin(ph), r * u]); }
  return { pts, gc, sun: [0.52 * Math.cos(sunA), 0.52 * Math.sin(sunA), 0] };
})();
let A_skyCv = null;
function A_sky(x0, y0, w, h) {
  if (A_skyCv) return A_skyCv;
  const cv = makeCanvas(), x = cv.getContext('2d'), R = A_rng(61);
  const g = x.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#070d22'); g.addColorStop(1, '#1a2a52');
  x.save(); rr(x, x0, y0, w, h, 14); x.clip(); x.fillStyle = g; x.fillRect(x0, y0, w, h);
  const band = (X) => y0 + h * 0.62 - Math.sin((X - x0) / w * Math.PI) * h * 0.38;
  for (let k = 0; k < 7; k++) { x.strokeStyle = `rgba(220,215,255,${0.07})`; x.lineWidth = 46 - k * 6; x.beginPath(); for (let X = x0; X <= x0 + w; X += 8) X === x0 ? x.moveTo(X, band(X)) : x.lineTo(X, band(X)); x.stroke(); }
  for (let k = 0; k < 700; k++) { const X = x0 + R() * w, d = (R() + R() + R() - 1.5) * 26; x.fillStyle = `rgba(255,250,235,${0.25 + R() * 0.5})`; x.fillRect(X, band(X) + d, 1.2, 1.2); }
  x.strokeStyle = 'rgba(10,12,30,0.55)'; x.lineWidth = 5; x.beginPath(); for (let X = x0 + w * 0.2; X <= x0 + w * 0.8; X += 8) { const Y = band(X) + 3 * Math.sin(X * 0.05); X === x0 + w * 0.2 ? x.moveTo(X, Y) : x.lineTo(X, Y); } x.stroke();
  for (let k = 0; k < 120; k++) { x.fillStyle = `rgba(255,255,255,${0.3 + R() * 0.6})`; const s = 0.8 + R() * 1.6; x.fillRect(x0 + R() * w, y0 + R() * h, s, s); }
  x.fillStyle = '#0d1a10'; x.beginPath(); x.moveTo(x0, y0 + h);
  for (let X = x0; X <= x0 + w; X += 20) x.lineTo(X, y0 + h - 12 - 8 * Math.sin(X * 0.02) - 5 * Math.sin(X * 0.07));
  x.lineTo(x0 + w, y0 + h); x.closePath(); x.fill();
  x.restore();
  return (A_skyCv = cv);
}
function A_dMilkyWay(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 232, bot = 700, gcx = cx, gcy = 466, R = 190;
  const inc = st.tilt * D2R, ci = Math.cos(inc), si = Math.sin(inc), phi = t * 0.06;
  const cp = Math.cos(phi), sp = Math.sin(phi);
  const proj = (x, y, z) => { const xr = x * cp - y * sp, yr = x * sp + y * cp; return [gcx + xr * R, gcy + (yr * ci - z * si) * R]; };
  A_space(ctx, X0, top, W, bot - top, 23, 70);
  ctx.save(); rr(ctx, X0, top, W, bot - top, 16); ctx.clip();
  ctx.strokeStyle = 'rgba(180,160,255,0.28)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]); ring(ctx, gcx, gcy, R * 1.2); ctx.setLineDash([]);
  glow(ctx, gcx, gcy, R * 1.2, 'rgba(120,100,220,0.12)');
  ctx.save(); ctx.translate(gcx, gcy); ctx.scale(1, Math.max(ci, 0.05)); glow(ctx, 0, 0, R * 1.05, 'rgba(170,185,255,0.3)'); ctx.restore();
  const B = [[], [], [], []], COL = ['rgba(255,240,215,0.75)', 'rgba(185,205,255,0.85)', 'rgba(255,120,175,0.9)', 'rgba(255,214,160,0.9)'];
  for (const [x, y, z, c] of A_MW.pts) { const [X, Y] = proj(x, y, z); B[c].push(X, Y); }
  B.forEach((arr, i) => { ctx.fillStyle = COL[i]; ctx.beginPath(); for (let k = 0; k < arr.length; k += 2) ctx.rect(arr[k] - 1.5, arr[k + 1] - 1.5, 3, 3); ctx.fill(); });
  ctx.save(); ctx.translate(gcx, gcy); ctx.scale(1, lerp(1, 0.62, si)); glow(ctx, 0, 0, R * 0.24, 'rgba(255,215,160,0.95)'); ctx.restore();
  if (st.tilt > 55) { ctx.strokeStyle = `rgba(20,14,30,${0.7 * smooth(55, 85, st.tilt)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(gcx, gcy, R * 0.95, Math.max(ci * R, 1.5), 0, 0, Math.PI * 2); ctx.stroke(); }
  for (const [x, y, z] of A_MW.gc) { const [X, Y] = proj(x, y, z); circle(ctx, X, Y, 2.4, 'rgba(255,226,150,0.8)'); }
  circle(ctx, gcx, gcy, 3, '#fff');
  label(ctx, 'Sgr A*', gcx + 34, gcy - 18, { size: 13, wt: 700, color: '#fff', bg: 'rgba(11,23,48,0.6)', pad: 4 });
  const [sx, sy] = proj(...A_MW.sun);
  ctx.strokeStyle = 'rgba(255,212,59,0.4)'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]);
  ctx.beginPath(); ctx.ellipse(gcx, gcy, 0.52 * R, Math.max(0.52 * R * ci, 0.5), 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  const [s0, s1] = A_MW.sun, sl = Math.hypot(s0, s1), [ax, ay] = proj(s0 - s1 / sl * 0.42, s1 + s0 / sl * 0.42, 0);
  arrow(ctx, sx, sy, ax, ay, { color: '#ffd43b', w: 3.5, head: 13 });
  const zx = sx, zy = sy - si * 0.36 * R;
  if (si > 0.12) arrow(ctx, sx, sy, zx, zy, { color: '#74c0fc', w: 3, head: 12 });
  glow(ctx, sx, sy, 14, 'rgba(255,212,59,0.7)'); circle(ctx, sx, sy, 5, '#ffd43b');
  label(ctx, 'ดวงอาทิตย์', sx, sy + 22, { size: 14, wt: 700, color: '#0b1730', bg: '#ffd43b', pad: 4 });
  const ux = (ax - sx) / (Math.hypot(ax - sx, ay - sy) || 1), uy = (ay - sy) / (Math.hypot(ax - sx, ay - sy) || 1);
  label(ctx, 'มองตามระนาบจาน: ดาวแน่น', ax + ux * 30 + (ux < 0 ? -50 : 50), ay + uy * 18, { size: 13, wt: 700, color: '#ffd43b', bg: 'rgba(11,23,48,0.75)', pad: 4 });
  if (si > 0.12) label(ctx, 'มองออกนอกจาน: ดาวน้อย', zx, zy - 18, { size: 13, wt: 700, color: '#74c0fc', bg: 'rgba(11,23,48,0.75)', pad: 4 });
  label(ctx, 'ฮาโล: สสารมืด + กระจุกดาวทรงกลม', X0 + 18, 256, { size: 14, wt: 600, color: '#d0bfff', align: 'left', bg: 'rgba(11,23,48,0.7)', pad: 5 });
  label(ctx, '↑ มองจากด้านบน', X1 - 18, 256, { size: 15, wt: 700, color: '#a5d8ff', align: 'right', bg: 'rgba(11,23,48,0.7)', pad: 5 });
  label(ctx, '↓ มองจากด้านข้าง', X1 - 18, 676, { size: 15, wt: 700, color: '#ffd8a8', align: 'right', bg: 'rgba(11,23,48,0.7)', pad: 5 });
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(X0 + 20, 676, R * 2 * 0.5, 3);
  label(ctx, '50,000 ปีแสง', X0 + 20 + R * 0.5, 662, { size: 12, wt: 600, color: 'rgba(255,255,255,0.8)' });
  ctx.restore();
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: 'ns-resize', drag: (px, py, ph) => {
    if (ph === 'start') st._y0 = [py, st.tilt];
    else if (ph === 'move' && st._y0) st.tilt = clamp(st._y0[1] + (py - st._y0[0]) * 0.28, 0, 90);
  } });
  hint(ctx, P, 'ลากขึ้น–ลงบนภาพ เพื่อเอียงกาแล็กซี', 722);
  const i = st.tilt, view = i < 20 ? 'มองจากด้านบน (face-on)' : i < 70 ? 'มองเฉียง' : 'มองจากด้านข้าง (edge-on)';
  const see = i < 20 ? 'เห็นคานตรงกลาง แขนกังหัน และส่วนป่องชัดเจน — มุมที่เราไม่มีวันเห็นจากโลก' : i < 70 ? 'จานกลายเป็นวงรี แขนกังหันซ้อนกัน ฮาโลยังล้อมรอบเป็นทรงกลม' : 'จานบางเหมือนเส้น มีส่วนป่องตรงกลางและแถบฝุ่นมืด คล้ายทางช้างเผือกที่เราเห็นบนท้องฟ้า';
  const ry = 746, rh = 120;
  A_card(ctx, X0, ry, W, rh, th.a);
  label(ctx, `เอียง ${Math.round(i)}° · ${view}`, X0 + 24, ry + 30, { size: 25, wt: 600, color: th.a, align: 'left', fam: F.display });
  para(ctx, see, X0 + 24, ry + 52, W - 44, 19, { lh: 30 });
  const fy = 896, fw = (W - 20) / 3;
  [['ห่างจากใจกลาง', '26,000 ปีแสง'], ['อัตราเร็วโคจร', '≈ 230 km/s'], ['โคจรครบรอบ', '≈ 230 ล้านปี']].forEach(([a, b], k) => {
    const x = X0 + k * (fw + 10);
    ctx.fillStyle = rgba(th.a, 0.08); rr(ctx, x, fy, fw, 62, 12); ctx.fill();
    label(ctx, a, x + fw / 2, fy + 18, { size: 14, wt: 600, color: C.soft });
    label(ctx, b, x + fw / 2, fy + 44, { size: 20, wt: 700, color: th.a });
  });
  const sy0 = 980, sh = 104;
  ctx.drawImage(A_sky(X0, sy0, W, sh), 0, 0);
  for (let k = 0; k < 6; k++) { const a = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + k * 2.1)); circle(ctx, X0 + 40 + k * 125, sy0 + 18 + (k % 3) * 14, 1.6, `rgba(255,255,255,${a})`); }
  label(ctx, 'ภาพจากโลก: เราอยู่ในจาน จึงเห็นดาวซ้อนกันเป็นแถบฝ้าขาว', X0 + 16, sy0 + 20, { size: 14, wt: 700, color: '#fff', align: 'left', bg: 'rgba(11,23,48,0.6)', pad: 5 });
}

const PART_A = [
  { th: TH.cosmos, title: 'กำเนิดและวิวัฒนาการของเอกภพ', sub: 'The Big Bang Theory', blocks: [
    { p: '**ทฤษฎีบิกแบง (Big Bang)** อธิบายว่าเอกภพเริ่มต้นเมื่อประมาณ **13,800 ล้านปี**ก่อน จากสภาวะที่ร้อนและหนาแน่นมาก แล้ว**ขยายตัวและเย็นลง**ต่อเนื่อง จนปัจจุบันเหลืออุณหภูมิเพียง **2.7 K**' },
    { box: 'บิกแบง**ไม่ใช่การระเบิด**ของสิ่งของออกไปในอวกาศว่างเปล่า แต่เป็น**การขยายตัวของอวกาศเอง** ทุกจุดจึงเคลื่อนห่างจากกันโดยไม่มีจุดศูนย์กลาง', tone: 'warn' },
    { h: 'ลำดับเหตุการณ์สำคัญ' },
    { table: { cols: [0.33, 0.67], head: ['เวลาหลังบิกแบง', 'เหตุการณ์'], rows: [
      ['10⁻³⁶–10⁻³² วินาที', '**ยุคเงินเฟ้อ (inflation)** อวกาศขยายตัวอย่างรวดเร็วมาก'],
      ['ถึง ~1 วินาที', 'เกิด**ควาร์ก**และ**เลปตอน** (เช่น อิเล็กตรอน) แล้วควาร์กรวมเป็น**โปรตอนและนิวตรอน**'],
      ['3 นาทีแรก', 'เกิดนิวเคลียสธาตุเบา ได้ **H ≈ 75%** และ **He ≈ 25%** โดยมวล'],
      ['380,000 ปี', '~3,000 K อิเล็กตรอนรวมกับนิวเคลียสเป็น**อะตอม** แสงเดินทางได้อิสระ เกิด**รังสีไมโครเวฟพื้นหลัง (CMB)**'],
      ['100–200 ล้านปี', 'สิ้นสุด**ยุคมืด** **ดาวฤกษ์รุ่นแรก**ส่องสว่าง แล้วรวมเป็น**กาแล็กซี**'],
      ['9,200 ล้านปี', '**ระบบสุริยะ**ก่อตัว (4,600 ล้านปีก่อน)'],
      ['13,800 ล้านปี', 'ปัจจุบัน เอกภพยังคงขยายตัว'],
    ] } },
    { p: 'เอกภพเย็นลงเพราะพลังงานกระจายไปในปริมาตรที่กว้างขึ้นเรื่อย ๆ' },
  ] },
  { kind: 'diagram', th: TH.cosmos, title: 'ย้อนเวลาเอกภพ', sub: 'ภาพโต้ตอบ: ลากไปตามเวลาตั้งแต่บิกแบงถึงปัจจุบัน', draw: A_dTimeline, init: () => ({ u: 0.62 }) },
  { th: TH.cosmos, title: 'หลักฐานที่สนับสนุนทฤษฎีบิกแบง', sub: 'Evidence for the Big Bang', blocks: [
    { h: '1. การขยายตัวของเอกภพ' },
    { p: 'ปี ค.ศ. 1929 **เอ็ดวิน ฮับเบิล (Edwin Hubble)** พบว่าเส้นสเปกตรัมของกาแล็กซีเกือบทั้งหมด**เลื่อนไปทางความยาวคลื่นยาว** เรียกว่า**การเลื่อนไปทางแดง (redshift)** แสดงว่ากาแล็กซีกำลังเคลื่อนที่ออกห่างจากเรา และ**ยิ่งไกล ยิ่งถอยห่างเร็ว**' },
    { f: 'v = H₀ d', cap: 'v = ความเร็วถอยห่าง (km/s) · d = ระยะทาง (Mpc) · H₀ ≈ 70 km/s/Mpc' },
    { p: 'ค่า redshift หาได้จาก **z = Δλ/λ ≈ v/c** เมื่อ v น้อยกว่าความเร็วแสงมาก กาแล็กซีไม่ได้พุ่งออกจากจุดศูนย์กลาง แต่**อวกาศระหว่างกาแล็กซียืดออก**' },
    { h: '2. รังสีไมโครเวฟพื้นหลังของเอกภพ' },
    { p: 'ปี ค.ศ. 1965 **อาร์โน เพนเซียส (Arno Penzias)** และ**โรเบิร์ต วิลสัน (Robert Wilson)** ตรวจพบคลื่นที่มาจาก**ทุกทิศทางเท่ากัน** เรียกว่า**รังสีไมโครเวฟพื้นหลัง (cosmic microwave background, CMB)** มีอุณหภูมิประมาณ **2.7 K** ความเข้มสูงสุดอยู่ในช่วง**คลื่นไมโครเวฟ** เป็นแสงที่หลงเหลือจากเมื่อเอกภพอายุ 380,000 ปี แล้วถูกยืดออกขณะเอกภพขยายตัว' },
    { box: '**หลักฐานเสริม:** ดาวและแก๊สที่เก่าแก่มีธาตุ H ≈ 75% และ He ≈ 25% โดยมวล ตรงกับสัดส่วนที่ทฤษฎีบิกแบงทำนายไว้', tone: 'note' },
  ] },
  { kind: 'diagram', th: TH.cosmos, title: 'อวกาศยืดและการเลื่อนไปทางแดง', sub: 'ภาพโต้ตอบ: ลากเพื่อยืดอวกาศ ดูสเปกตรัมและกฎของฮับเบิล', draw: A_dHubble, init: () => ({ s: 1.3, g: 1, obs: 0, tr: [] }) },
  { th: TH.galaxy, title: 'การจำแนกประเภทของกาแล็กซี', sub: "Hubble's galaxy classification", blocks: [
    { p: 'ปี ค.ศ. 1926 ฮับเบิลจัดประเภทกาแล็กซีตาม**รูปร่างที่มองเห็น** แล้วเรียงเป็นแผนภาพรูป**ส้อมเสียง (tuning fork)**' },
    { table: { cols: [0.34, 0.66], head: ['ประเภท', 'ลักษณะ'], rows: [
      ['**รี (E)** E0–E7', 'ทรงรีเรียบ ไม่มีแขน ตัวเลขบอกความรี E0 เกือบกลม E7 รีมาก มีดาว**อายุมาก สีแดง**'],
      ['**รูปเลนส์ (S0)**', 'มีจานและส่วนป่องตรงกลาง แต่**ไม่มีแขน**'],
      ['**กังหัน (S)** Sa–Sc', 'มีส่วนป่องและแขนกังหัน Sa ส่วนป่องใหญ่ แขนพันแน่น ส่วน Sc ส่วนป่องเล็ก แขนกางหลวม'],
      ['**กังหันมีคาน (SB)** SBa–SBc', 'แขนเริ่มจากปลาย**คาน (bar)** ที่พาดผ่านใจกลาง แบ่งย่อยเหมือนแบบ S เช่น ทางช้างเผือก'],
      ['**ไม่มีรูปแบบ (Irr)**', 'รูปร่างไม่แน่นอน เช่น **เมฆแมเจลแลนใหญ่และเล็ก**'],
    ] } },
    { h: 'แก๊สกับการเกิดดาว' },
    { p: 'กาแล็กซีรีมี**แก๊สและฝุ่นน้อย** ดาวเกิดใหม่น้อย จึงเหลือแต่ดาวแก่สีแดง ส่วนกาแล็กซีกังหันมีแก๊สและฝุ่นในแขน เกิด**ดาวใหม่สีน้ำเงิน**ต่อเนื่อง โดย Sc มีมากกว่า Sa และกาแล็กซีไม่มีรูปแบบมีแก๊สมากและเกิดดาวใหม่มากที่สุด' },
    { box: 'แผนภาพส้อมเสียงเป็น**การจัดกลุ่มตามรูปร่าง** ไม่ใช่ลำดับวิวัฒนาการของกาแล็กซี', tone: 'note' },
  ] },
  { kind: 'diagram', th: TH.galaxy, title: 'ส้อมเสียงของฮับเบิล', sub: 'ภาพโต้ตอบ: ลากไปตามส้อมเสียงเพื่อเปลี่ยนรูปร่างกาแล็กซี', draw: A_dFork, init: () => ({ u: 0.87, bar: false, irr: false, irrF: 0 }) },
  { th: TH.galaxy, title: 'กาแล็กซีทางช้างเผือก', sub: 'The Milky Way', blocks: [
    { p: '**ทางช้างเผือก (Milky Way)** คือกาแล็กซีที่ระบบสุริยะของเราอยู่ เป็น**กาแล็กซีกังหันมีคาน**' },
    { li: [
      '**จาน (disc):** เส้นผ่านศูนย์กลางประมาณ **100,000 ปีแสง** มีดาวฤกษ์ **100,000–400,000 ล้านดวง** แก๊สและฝุ่นอยู่ในแขนกังหัน',
      '**ส่วนป่องใจกลาง (bulge):** ดาวแก่หนาแน่น ตรงกลางมีหลุมดำมวลยวดยิ่ง **Sagittarius A*** มวลประมาณ **4 ล้านเท่า**ของดวงอาทิตย์',
      '**ฮาโล (halo):** บริเวณทรงกลมล้อมรอบจาน มี**กระจุกดาวทรงกลม**ที่มีดาวแก่ และ**สสารมืด (dark matter)** ซึ่งมีมวลมากกว่าสสารที่มองเห็น',
    ] },
    { h: 'ตำแหน่งของดวงอาทิตย์' },
    { p: 'ดวงอาทิตย์อยู่ห่างจากใจกลางประมาณ **26,000 ปีแสง** ใน**แขนนายพราน (Orion Arm)** โคจรรอบใจกลางด้วยอัตราเร็วประมาณ **220–230 km/s** ใช้เวลารอบละประมาณ **225–250 ล้านปี**' },
    { box: 'เราอยู่**ภายในจาน** เมื่อมองตามระนาบจานจึงเห็นดาวจำนวนมากซ้อนกันเป็น**แถบฝ้าขาวพาดท้องฟ้า** และมองไม่เห็นรูปกังหันทั้งหมด', tone: 'key' },
    { p: 'ทางช้างเผือกเป็นสมาชิกของ**กลุ่มกาแล็กซีท้องถิ่น (Local Group)** ร่วมกับ**กาแล็กซีแอนดรอเมดา (M31)** ซึ่งอยู่ห่างประมาณ 2.5 ล้านปีแสง และกาแล็กซีขนาดเล็กอีกหลายสิบแห่ง' },
  ] },
  { kind: 'diagram', th: TH.galaxy, title: 'ทางช้างเผือกจากทุกมุม', sub: 'ภาพโต้ตอบ: ลากขึ้น–ลงเพื่อเอียงจากด้านบนไปด้านข้าง', draw: A_dMilkyWay, init: () => ({ tilt: 35 }) },
];
