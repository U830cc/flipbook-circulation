// ============================================================ part B · บทที่ 3 ดาวฤกษ์ (pages 11–18)
const B_rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;
const B_n = (v, d = 0) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const B_sgn = (v, d = 1) => (v < 0 ? '−' : '+') + Math.abs(v).toFixed(d);
const B_sig = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v)) - 1); return Math.round(v / p) * p; };
function B_yr(y) {
  if (!isFinite(y)) return 'ยาวนานมาก';
  if (y < 1) return 'ไม่กี่เดือน';
  if (y >= 1e6) { const v = B_sig(y / 1e6); return B_n(v, v < 10 && v % 1 ? 1 : 0) + ' ล้านปี'; }
  return B_n(B_sig(y)) + ' ปี';
}

// vivid display colour of a star by surface temperature (K)
const B_TV = [[2500, [255, 88, 48]], [3000, [255, 118, 60]], [3500, [255, 148, 78]], [4500, [255, 190, 110]], [5200, [255, 218, 140]], [5800, [255, 234, 168]], [6500, [255, 245, 212]], [7500, [244, 244, 255]], [10000, [214, 226, 255]], [15000, [176, 201, 255]], [25000, [142, 176, 255]], [40000, [112, 150, 255]]];
function B_tc(T, a = 1) {
  const L = B_TV; T = clamp(T, L[0][0], L[L.length - 1][0]);
  let i = 1; while (i < L.length - 1 && T > L[i][0]) i++;
  const f = clamp((Math.log(T) - Math.log(L[i - 1][0])) / (Math.log(L[i][0]) - Math.log(L[i - 1][0])), 0, 1), A = L[i - 1][1], B = L[i][1];
  return `rgba(${Math.round(lerp(A[0], B[0], f))},${Math.round(lerp(A[1], B[1], f))},${Math.round(lerp(A[2], B[2], f))},${a})`;
}
const B_CLS = [
  { L: 'O', t0: 30000, r: '> 30,000', col: 'น้ำเงิน' },
  { L: 'B', t0: 10000, r: '10,000–30,000', col: 'น้ำเงินแกมขาว' },
  { L: 'A', t0: 7500, r: '7,500–10,000', col: 'ขาว' },
  { L: 'F', t0: 6000, r: '6,000–7,500', col: 'ขาวแกมเหลือง' },
  { L: 'G', t0: 5000, r: '5,000–6,000', col: 'เหลือง' },
  { L: 'K', t0: 3500, r: '3,500–5,000', col: 'ส้ม' },
  { L: 'M', t0: 0, r: '< 3,500', col: 'แดง' },
];
const B_clsI = (T) => B_CLS.findIndex(c => T >= c.t0);
const B_EX = [[40000, 'ดาวนาออส (ζ Puppis)'], [22000, 'สไปกา'], [12100, 'ไรเจล'], [9900, 'ซิริอุส'], [8000, 'ดาวตานกอินทรี (Altair)'], [6500, 'โปรซีออน'], [5800, 'ดวงอาทิตย์'], [4300, 'อาร์คตูรุส'], [3900, 'อัลเดบาแรน'], [3500, 'บีเทลจุส'], [3000, 'พรอกซิมาเซนทอรี']];
const B_ex = (T) => B_EX.reduce((b, e) => Math.abs(Math.log(e[0] / T)) < Math.abs(Math.log(b[0] / T)) ? e : b);

// shared drawing pieces
const B_SP = {};
function B_space(ctx, x, y, w, h, th) {
  const k = w + 'x' + h; let c = B_SP[k];
  if (!c) {
    c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'), r = B_rng(w * 7 + h);
    rr(g, 0, 0, w, h, 18); g.clip();
    const lg = g.createLinearGradient(0, 0, 0, h); lg.addColorStop(0, '#14254a'); lg.addColorStop(1, '#0b1730');
    g.fillStyle = lg; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 170; i++) { g.fillStyle = `rgba(255,255,255,${0.12 + r() * 0.5})`; const s = r() < 0.9 ? 1.3 : 2.2; g.fillRect(r() * w, r() * h, s, s); }
    B_SP[k] = c;
  }
  ctx.drawImage(c, x, y);
  ctx.strokeStyle = rgba(th.a, 0.55); ctx.lineWidth = 2; rr(ctx, x, y, w, h, 18); ctx.stroke();
}
function B_star(ctx, x, y, r, T, glowK = 2.4) {
  glow(ctx, x, y, r * glowK, B_tc(T, 0.42));
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.08, x, y, r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, B_tc(T)); g.addColorStop(1, B_tc(T * 0.78));
  circle(ctx, x, y, r, g);
}
let B_NEB = null;
function B_nebula() {
  if (B_NEB) return B_NEB;
  const c = document.createElement('canvas'); c.width = c.height = 420;
  const x = c.getContext('2d'), r = B_rng(77), cols = ['#e64980', '#9c36b5', '#3bc9db', '#f783ac', '#7048e8'];
  for (let i = 0; i < 80; i++) {
    const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * 150, px = 210 + Math.cos(a) * d, py = 210 + Math.sin(a) * d * 0.75, rad = 30 + r() * 60;
    const g = x.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, rgba(cols[i % 5], 0.2)); g.addColorStop(1, rgba(cols[i % 5], 0));
    x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = r() * 130, px = 210 + Math.cos(a) * d, py = 210 + Math.sin(a) * d * 0.7, rad = 10 + r() * 26;
    const g = x.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, 'rgba(8,6,18,0.4)'); g.addColorStop(1, 'rgba(8,6,18,0)');
    x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  }
  return (B_NEB = c);
}
function B_readout(ctx, P, y, h) { ctx.fillStyle = rgba(P.th.a, 0.08); rr(ctx, P.X0, y, P.X1 - P.X0, h, 14); ctx.fill(); }
function B_button(ctx, P, x, y, w, h, txt, on, click) {
  const a = P.th.a;
  ctx.fillStyle = on ? a : 'rgba(255,255,255,0.75)'; rr(ctx, x, y, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = a; ctx.lineWidth = 2; ctx.stroke();
  label(ctx, txt, x + w / 2, y + h / 2, { size: 16, wt: 700, color: on ? '#fff' : a });
  P.zones.push({ x, y, w, h, cursor: 'pointer', click });
}

// ============================================================ page 12 · stellar life cycle
const B_EDGE = [0, 0.09, 0.2, 0.5, 0.66, 0.82, 1];
const B_STAGE = {
  common: [
    { n: 'เนบิวลา', e: 'nebula', d: 'แก๊สและฝุ่นยุบตัวเข้าหากันด้วยแรงโน้มถ่วง' },
    { n: 'ดาวฤกษ์ก่อนเกิด', e: 'protostar', d: 'ยุบตัวต่อจนร้อนขึ้น แต่ยังไม่เกิดฟิวชัน' },
    { n: 'ลำดับหลัก', e: 'main sequence', d: 'ฟิวชัน H → He ที่แกน แรงดันสมดุลกับแรงโน้มถ่วง' },
  ],
  lo: [
    { n: 'ดาวยักษ์แดง', e: 'red giant', d: 'H ที่แกนหมด แกนหดตัว เปลือกนอกขยายและเย็นลง' },
    { n: 'เนบิวลาดาวเคราะห์', e: 'planetary nebula', d: 'เปลือกนอกหลุดลอยออกไป เหลือแกนที่ร้อนจัด' },
    { n: 'ดาวแคระขาว', e: 'white dwarf', d: 'แกนขนาดราวโลก ไม่มีฟิวชันแล้ว ค่อย ๆ เย็นลง' },
  ],
  hi: [
    { n: 'ดาวยักษ์ใหญ่แดง', e: 'red supergiant', d: 'หลอมธาตุหนักขึ้นเป็นชั้น ๆ จนแกนกลางเป็นเหล็ก' },
    { n: 'ซูเปอร์โนวา', e: 'supernova', d: 'แกนเหล็กยุบตัวฉับพลัน แล้วระเบิดอย่างรุนแรง' },
    { n: 'ดาวนิวตรอน', e: 'neutron star', d: 'แกนอัดแน่นเป็นนิวตรอน กว้างเพียงราว 20 กม.' },
  ],
  bh: { n: 'หลุมดำ', e: 'black hole', d: 'แกนยุบตัวต่อไม่หยุด แม้แต่แสงก็หนีออกมาไม่ได้' },
};
function B_life(M) {
  const hi = M > 8, ms = 1e10 * Math.pow(M, -2.5), core = hi ? 1.4 + (M - 8) * 0.1 : 0.45 + 0.11 * M, bh = hi && core > 3;
  const st = [...B_STAGE.common, ...(hi ? B_STAGE.hi : B_STAGE.lo)];
  if (bh) st[5] = B_STAGE.bh;
  return { hi, bh, core, ms, st, dur: [1e6, 5e7 * Math.pow(M, -2.5), ms, 0.1 * ms, hi ? 0.5 : 1e4, Infinity] };
}
function B_dLife(ctx, t, P) {
  const { X0, X1, cx, th, st } = P;
  const M = Math.pow(10, st.lm), lf = B_life(M), life = st.life;
  let i = 0; while (i < 5 && life >= B_EDGE[i + 1]) i++;
  const f = (life - B_EDGE[i]) / (B_EDGE[i + 1] - B_EDGE[i]);
  const top = 222, bot = 700, sx = cx, sy = 402;
  B_space(ctx, X0, top, X1 - X0, bot - top, th);
  ctx.save(); rr(ctx, X0, top, X1 - X0, bot - top, 18); ctx.clip();
  const rMS = 18 * Math.pow(M, 0.45), Tms = clamp(5800 * Math.sqrt(M), 3000, 40000);
  const rG = lf.hi ? 136 : 98 + 4 * M, TG = lf.hi ? 3500 : 3700;
  const tl = (a, b, u) => Math.exp(lerp(Math.log(a), Math.log(b), u));
  ctx.save(); ctx.beginPath(); ctx.rect(X0, top, X1 - X0, 548 - top); ctx.clip();
  if (i === 0) {
    const s = lerp(1, 0.42, smooth(0, 1, f));
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 0.04 + f * 1.2); ctx.scale(s, s); ctx.drawImage(B_nebula(), -210, -210); ctx.restore();
    glow(ctx, sx, sy, 20 + 50 * f, `rgba(255,170,90,${0.15 + 0.5 * f})`);
    for (let k = 0; k < 14; k++) {
      const a = k * 0.449 * Math.PI, u = mod1(k * 0.37 + t * 0.12), r = lerp(190, 30, u) * s;
      arrow(ctx, sx + Math.cos(a) * r, sy + Math.sin(a) * r * 0.75, sx + Math.cos(a) * (r - 22), sy + Math.sin(a) * (r - 22) * 0.75, { color: `rgba(200,220,255,${0.55 * Math.sin(Math.PI * u)})`, w: 2, head: 8 });
    }
  } else if (i === 1) {
    const r = lerp(56, rMS, smooth(0, 1, f)), T = tl(2600, Tms, f);
    ctx.save(); ctx.translate(sx, sy);
    ctx.strokeStyle = `rgba(255,160,90,${0.45 * (1 - f)})`; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 2.6, r * 0.42, -0.15, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.restore();
    B_star(ctx, sx, sy, r, T, 2.8);
    ctx.save(); ctx.translate(sx, sy);
    ctx.strokeStyle = `rgba(255,160,90,${0.55 * (1 - f)})`; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 2.6, r * 0.42, -0.15, 0, Math.PI); ctx.stroke();
    const jl = 120 * (1 - 0.6 * f);
    ctx.rotate(-0.15);
    for (const d of [-1, 1]) arrow(ctx, 0, d * (r + 6), 0, d * (r + 6 + jl), { color: `rgba(180,220,255,${0.75 * (1 - f)})`, w: 4, head: 14, dash: [10, 8], off: -t * 40 });
    ctx.restore();
  } else if (i === 2) {
    const pul = 1 + 0.02 * Math.sin(t * 2.4);
    B_star(ctx, sx, sy, rMS * pul, Tms);
    if (rMS > 24) { circle(ctx, sx, sy, rMS * 0.32, 'rgba(255,255,255,0.55)'); label(ctx, 'H→He', sx, sy, { size: 13, wt: 700, color: '#7a3b00' }); }
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3 + 0.3, r0 = rMS + 10, r1 = rMS + 40, o = 0.12;
      arrow(ctx, sx + Math.cos(a - o) * r0, sy + Math.sin(a - o) * r0, sx + Math.cos(a - o) * r1, sy + Math.sin(a - o) * r1, { color: '#ffa94d', w: 3, head: 10 });
      arrow(ctx, sx + Math.cos(a + o) * r1, sy + Math.sin(a + o) * r1, sx + Math.cos(a + o) * r0, sy + Math.sin(a + o) * r0, { color: '#74c0fc', w: 3, head: 10 });
    }
    label(ctx, 'แรงดันออก', sx + rMS + 58, sy - 26, { size: 15, wt: 700, color: '#ffa94d', align: 'left' });
    label(ctx, 'แรงโน้มถ่วงดึงเข้า', sx - rMS - 58, sy - 26, { size: 15, wt: 700, color: '#74c0fc', align: 'right' });
    label(ctx, 'สมดุลกัน → ขนาดคงที่', sx, Math.max(sy - rMS - 54, 262), { size: 15, wt: 600, color: '#fff', bg: 'rgba(255,255,255,0.12)', pad: 5 });
  } else if (i === 3) {
    const u = smooth(0, 0.7, f), r = lerp(rMS, rG, u), T = tl(Tms, TG, u);
    B_star(ctx, sx, sy, r, T, 1.6);
    ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.clip();
    for (let k = 0; k < 7; k++) {
      const a = k * 0.9 + t * 0.06, d = r * (0.25 + 0.6 * mod1(k * 0.37));
      circle(ctx, sx + Math.cos(a) * d, sy + Math.sin(a) * d, r * 0.2, 'rgba(140,30,0,0.16)');
    }
    ctx.restore();
    if (lf.hi && f > 0.35) {
      const layers = [['H', '#ffd8a8'], ['He', '#ffc078'], ['C', '#ffa94d'], ['O', '#ff922b'], ['Si', '#e8590c'], ['Fe', '#868e96']], al = smooth(0.35, 0.6, f);
      ctx.globalAlpha = al;
      layers.forEach(([n, c], k) => { circle(ctx, sx, sy, 46 - k * 7.5, c); });
      label(ctx, 'Fe', sx, sy, { size: 12, wt: 700, color: '#fff' });
      label(ctx, 'H He C O Si Fe', sx, sy + 60, { size: 13, wt: 700, color: '#5c1a00', bg: 'rgba(255,255,255,0.7)', pad: 4 });
      ctx.globalAlpha = 1;
    } else circle(ctx, sx, sy, 6, '#fff');
  } else if (i === 4 && !lf.hi) {
    if (f < 0.35) { ctx.globalAlpha = 1 - f / 0.35; B_star(ctx, sx, sy, rG * (1 + 0.3 * f), TG, 1.4); ctx.globalAlpha = 1; }
    const R = lerp(rG * 0.75, 182, smooth(0, 1, f));
    glow(ctx, sx, sy, R * 1.25, `rgba(240,101,149,${0.18 * (1 - 0.4 * f)})`);
    ctx.lineWidth = 20; ctx.strokeStyle = `rgba(240,101,149,${0.5 * (1 - 0.4 * f)})`; ring(ctx, sx, sy, R);
    ctx.lineWidth = 9; ctx.strokeStyle = `rgba(59,201,219,${0.55 * (1 - 0.4 * f)})`; ring(ctx, sx, sy, R * 0.8);
    B_star(ctx, sx, sy, lerp(16, 8, f), 30000, 4);
  } else if (i === 4) {
    if (f < 0.3) { const u = f / 0.3; glow(ctx, sx, sy, lerp(80, 340, u), `rgba(255,255,240,${1 - u})`); }
    const R = lerp(40, 196, smooth(0, 1, f)), al = 0.75 * (1 - 0.45 * f), cols = ['#ffa94d', '#66d9e8', '#ff8787', '#ffe066'];
    glow(ctx, sx, sy, R * 1.1, `rgba(255,190,120,${0.2 * (1 - f)})`);
    ctx.lineCap = 'round';
    for (let k = 0; k < 30; k++) {
      const a = k * Math.PI * 2 / 30 + 0.1 * Math.sin(k * 3.1), r0 = R * (0.62 + 0.1 * mod1(k * 0.41)), r1 = R * (0.86 + 0.22 * mod1(k * 0.618));
      ctx.strokeStyle = rgba(cols[k % 4], al); ctx.lineWidth = 3 + (k % 3);
      ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); ctx.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); ctx.stroke();
    }
    if (f > 0.35) circle(ctx, sx, sy, 5, '#e7f5ff');
  } else {
    const R = 196 + 20 * f;
    if (!lf.hi) {
      ctx.lineWidth = 16; ctx.strokeStyle = `rgba(240,101,149,${0.14 * (1 - f)})`; ring(ctx, sx, sy, R * 0.93);
      B_star(ctx, sx, sy, 8, tl(25000, 9000, f), 5);
      label(ctx, 'เล็กราวโลก แต่หนาแน่นมาก', sx, sy + 70, { size: 15, wt: 600, color: '#fff', bg: 'rgba(255,255,255,0.12)', pad: 5 });
    } else if (!lf.bh) {
      for (let k = 0; k < 30; k += 2) { const a = k * Math.PI / 15; ctx.strokeStyle = `rgba(255,169,77,${0.12 * (1 - f)})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * R * 0.7, sy + Math.sin(a) * R * 0.7); ctx.lineTo(sx + Math.cos(a) * R, sy + Math.sin(a) * R); ctx.stroke(); }
      const a = t * 2.2;
      for (const d of [0, Math.PI]) {
        ctx.fillStyle = 'rgba(165,216,255,0.32)'; ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(a + d - 0.1) * 170, sy + Math.sin(a + d - 0.1) * 170); ctx.lineTo(sx + Math.cos(a + d + 0.1) * 170, sy + Math.sin(a + d + 0.1) * 170); ctx.closePath(); ctx.fill();
      }
      B_star(ctx, sx, sy, 5, 40000, 6);
      label(ctx, 'หมุนเร็วมาก ส่งลำคลื่นวิทยุ (pulsar)', sx, sy + 70, { size: 15, wt: 600, color: '#fff', bg: 'rgba(255,255,255,0.12)', pad: 5 });
    } else {
      ctx.save(); ctx.translate(sx, sy);
      const disk = (a0, a1) => { for (let k = 0; k < 4; k++) { ctx.strokeStyle = `rgba(255,${150 + k * 25},${60 + k * 30},${0.75 - k * 0.12})`; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(0, 0, 46 + k * 11, (46 + k * 11) * 0.3, -0.12, a0, a1); ctx.stroke(); } };
      disk(Math.PI, 2 * Math.PI);
      glow(ctx, 0, 0, 60, 'rgba(255,170,80,0.35)');
      circle(ctx, 0, 0, 26, '#000'); ctx.strokeStyle = 'rgba(255,210,150,0.9)'; ctx.lineWidth = 2; ring(ctx, 0, 0, 27);
      disk(0, Math.PI);
      for (let k = 0; k < 8; k++) { const a = t * 1.6 + k * 0.785, rr2 = 52 + (k % 3) * 11; circle(ctx, Math.cos(a) * rr2, Math.sin(a) * rr2 * 0.3, 2.5, 'rgba(255,240,200,0.9)'); }
      ctx.restore();
      label(ctx, 'แม้แต่แสงก็หนีออกมาไม่ได้', sx, sy + 70, { size: 15, wt: 600, color: '#fff', bg: 'rgba(255,255,255,0.12)', pad: 5 });
    }
  }
  ctx.restore();
  // path that forks by mass: its x axis is the drag axis
  const tx0 = X0 + 40, tx1 = X1 - 40, tX = (u) => lerp(tx0, tx1, u), yC = 604, yLo = 580, yHi = 636;
  const yAt = (u, hiB) => u < 0.5 ? yC : lerp(yC, hiB ? yHi : yLo, smooth(0.5, 0.57, u));
  const line = (u0, u1, hiB, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); for (let u = u0; u <= u1 + 1e-6; u += 0.01) { u === u0 ? ctx.moveTo(tX(u), yAt(u, hiB)) : ctx.lineTo(tX(u), yAt(u, hiB)); } ctx.stroke(); };
  line(0, 0.5, false, 'rgba(255,255,255,0.55)', 4);
  line(0.5, 1, !lf.hi, 'rgba(255,255,255,0.16)', 3);
  line(0.5, 1, lf.hi, rgba('#ffd43b', 0.8), 4);
  const mids = B_EDGE.slice(0, 6).map((e, k) => (e + B_EDGE[k + 1]) / 2);
  const icon = ['#f783ac', '#ff922b', B_tc(Tms), '#ff6b6b', '#3bc9db', '#e7f5ff'], iconHi = ['#f783ac', '#ff922b', B_tc(Tms), '#ff5a2a', '#ffe066', lf.bh ? '#000' : '#a5d8ff'];
  for (let k = 0; k < 6; k++) {
    for (const hiB of k < 3 ? [lf.hi] : [false, true]) {
      const on = k < 3 || hiB === lf.hi, x = tX(mids[k]), y = yAt(mids[k], hiB);
      const nm = k < 3 ? B_STAGE.common[k].n : hiB ? (k === 5 ? (on ? lf.st[5].n : 'นิวตรอน / หลุมดำ') : B_STAGE.hi[k - 3].n) : B_STAGE.lo[k - 3].n;
      circle(ctx, x, y, on ? 8 : 6, on ? (hiB ? iconHi : icon)[k] : 'rgba(255,255,255,0.25)');
      if (k === 5 && hiB && lf.bh) { ctx.strokeStyle = '#ffa94d'; ctx.lineWidth = 2; ring(ctx, x, y, 9); }
      const ly = k === 1 ? y - 22 : k < 3 ? y + 22 : hiB ? y + 22 : y - 22;
      label(ctx, nm, x, ly, { size: 14, wt: on ? 700 : 500, color: on ? '#fff' : 'rgba(255,255,255,0.4)' });
    }
  }
  label(ctx, 'มวล ≤ 8 M☉', tX(0.5) - 8, yLo, { size: 12, wt: 700, color: lf.hi ? 'rgba(255,255,255,0.35)' : '#ffd43b', align: 'right' });
  label(ctx, 'มวล > 8 M☉', tX(0.5) - 8, yHi + 4, { size: 12, wt: 700, color: lf.hi ? '#ffd43b' : 'rgba(255,255,255,0.35)', align: 'right' });
  const kx = tX(life), ky = yAt(life, lf.hi);
  glow(ctx, kx, ky, 30, 'rgba(255,212,59,0.45)');
  circle(ctx, kx, ky, 11, '#ffd43b'); ctx.strokeStyle = '#7a5d00'; ctx.lineWidth = 2; ring(ctx, kx, ky, 11);
  chevron(ctx, kx - 22, ky, Math.PI, '#ffd43b', 8); chevron(ctx, kx + 22, ky, 0, '#ffd43b', 8);
  label(ctx, '← เกิด', X0 + 18, top + 26, { size: 17, wt: 700, color: '#ffd43b', align: 'left' });
  label(ctx, 'ตาย →', X1 - 18, top + 26, { size: 17, wt: 700, color: '#ffd43b', align: 'right' });
  label(ctx, 'ภาพไม่ได้ย่อตามมาตราส่วนจริง', X1 - 16, bot - 14, { size: 12, wt: 500, color: 'rgba(255,255,255,0.5)', align: 'right' });
  ctx.restore();
  P.zones.push({ x: X0, y: top, w: X1 - X0, h: bot - top, cursor: 'ew-resize', drag: (px) => { st.life = clamp((px - tx0) / (tx1 - tx0), 0, 1); } });
  hint(ctx, P, 'ลากซ้าย–ขวาบนภาพ เพื่อเดินไปตามช่วงชีวิตของดาว', bot + 20);
  // readout
  const s = lf.st[i], mTxt = M < 1.95 ? B_n(M, 1) : B_n(M);
  B_readout(ctx, P, 742, 124);
  label(ctx, `มวล ${mTxt} M☉ · ${s.n} (${s.e})`, X0 + 18, 764, { size: 22, wt: 700, color: th.a, align: 'left', fam: F.display });
  label(ctx, s.d, X0 + 18, 794, { size: 17, wt: 500, align: 'left' });
  let when;
  if (i === 5) when = lf.hi ? 'ซากดาวที่เหลือ คงอยู่ต่อไปอีกยาวนานมาก' : 'ค่อย ๆ เย็นลงไปอีกหลายพันล้านปี';
  else if (i === 4 && lf.hi) when = 'ระเบิดในไม่กี่วินาที แต่สว่างจ้าอยู่หลายเดือน';
  else {
    const age = lf.dur.slice(0, i).reduce((a, b) => a + b, 0) + f * lf.dur[i];
    when = `ช่วงนี้นานราว ${B_yr(lf.dur[i])} · อายุดาวตอนนี้ ≈ ${B_yr(Math.max(age, 1e4))}`;
  }
  label(ctx, when, X0 + 18, 820, { size: 17, wt: 600, color: C.soft, align: 'left' });
  const end = lf.hi ? `มวล > 8 M☉ → ซูเปอร์โนวา → ${lf.st[5].n} (แกนเหลือ ≈ ${B_n(lf.core, 1)} M☉)` : `มวล ≤ 8 M☉ → เนบิวลาดาวเคราะห์ → ดาวแคระขาว (≈ ${B_n(lf.core, 1)} M☉)`;
  label(ctx, 'ปลายทาง: ' + end, X0 + 18, 846, { size: 16, wt: 700, color: '#fff', bg: lf.hi ? '#c2410c' : '#2b6cb0', align: 'left', pad: 6 });
  // mass slider with markers
  const sx0 = X0 + 40, sw = X1 - X0 - 80, sy0 = 918, lm0 = Math.log10(0.5), lm1 = Math.log10(30), mX = (m) => sx0 + sw * (Math.log10(m) - lm0) / (lm1 - lm0);
  for (const [m, txt] of [[1, '1'], [8, '8']]) {
    ctx.fillStyle = 'rgba(37,48,58,0.45)'; ctx.fillRect(mX(m) - 1, sy0 - 14, 2, 28);
    label(ctx, txt, mX(m), sy0 + 25, { size: 13, wt: 600, color: C.soft });
  }
  slider(ctx, P, 'lm', sx0, sy0, sw, { min: lm0, max: lm1, title: 'มวลของดาว (M☉) · ลากแถบ', value: `${mTxt} M☉`, left: '← มวลน้อย', right: 'มวลมาก →' });
  // lifetime vs mass
  stitle(ctx, 'อายุช่วงลำดับหลัก: ยิ่งมวลมาก ยิ่งอายุสั้น', X0, 962, th);
  const bx0 = X0 + 92, bx1 = X1 - 172, lX = (y) => lerp(bx0, bx1, (Math.log10(y) - 6) / 5);
  [0.5, 1, 8, 30].forEach((m, k) => {
    const y = 1016 + k * 22, life2 = 1e10 * Math.pow(m, -2.5);
    label(ctx, `${m} M☉`, X0, y, { size: 15, wt: 700, align: 'left' });
    ctx.fillStyle = B_tc(clamp(5800 * Math.sqrt(m), 3000, 40000)); rr(ctx, bx0, y - 8, lX(life2) - bx0, 16, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(37,48,58,0.25)'; ctx.lineWidth = 1; ctx.stroke();
    label(ctx, B_yr(life2), X1, y, { size: 15, wt: 600, color: C.soft, align: 'right' });
  });
  const ux = lX(13.8e9);
  ctx.setLineDash([5, 4]); ctx.strokeStyle = '#6741b8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ux, 1002); ctx.lineTo(ux, 1092); ctx.stroke(); ctx.setLineDash([]);
  label(ctx, 'อายุเอกภพ 13,800 ล้านปี', ux, 1106, { size: 13, wt: 700, color: '#6741b8' });
  const cxm = lX(lf.ms);
  chevron(ctx, cxm, 999, Math.PI / 2, th.a, 8);
  label(ctx, 'ดาวนี้', cxm + 10, 996, { size: 13, wt: 700, color: th.a, align: 'left' });
}

// ============================================================ page 14 · blackbody curves
const B_HCK = 1.4388e7;
const B_logB = (l, T) => { const x = B_HCK / (l * T); return -5 * Math.log10(l) - (x > 40 ? x / Math.LN10 : Math.log10(Math.expm1(x))); };
const B_wien = (T) => 2.898e6 / T;
function B_wl(l) {
  let r = 0, g = 0, b = 0;
  if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; }
  else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1;
  const k = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 700 ? 0.3 + 0.7 * (750 - l) / 50 : 1;
  return [r, g, b].map(v => Math.round(255 * clamp(v * k, 0, 1)));
}
let B_RB = null;
function B_rainbow() {
  if (B_RB) return B_RB;
  const c = document.createElement('canvas'); c.width = 370; c.height = 1; const x = c.getContext('2d');
  for (let i = 0; i < 370; i++) { const [r, g, b] = B_wl(380 + i); x.fillStyle = `rgb(${r},${g},${b})`; x.fillRect(i, 0, 1, 1); }
  return (B_RB = c);
}
// absorption lines: [nm, width, strength per class O B A F G K M]
const B_LINES = [
  ...[656.3, 486.1, 434.0, 410.2].map(l => [l, 3, [0.25, 0.55, 1, 0.7, 0.45, 0.25, 0.12], 'H']),
  [468.6, 2, [0.75, 0, 0, 0, 0, 0, 0], 'He'], ...[447.1, 471.3, 501.6].map(l => [l, 2, [0.4, 0.7, 0.05, 0, 0, 0, 0], 'He']),
  ...[393.4, 396.8].map(l => [l, 3, [0, 0.05, 0.3, 0.7, 0.9, 1, 0.8], 'Ca']),
  [589.3, 3, [0, 0, 0.05, 0.2, 0.5, 0.75, 0.85], 'Na'], [517.3, 2, [0, 0, 0, 0.3, 0.5, 0.7, 0.6], 'Mg'],
  ...[495.7, 527.0, 532.8, 438.4].map(l => [l, 1.5, [0, 0, 0.05, 0.25, 0.45, 0.6, 0.5], 'Fe']), [430.8, 3, [0, 0, 0, 0.2, 0.6, 0.6, 0.3], 'CH'],
  ...[476.1, 495.4, 516.7, 544.8, 586.0, 615.9, 671.3, 705.4].map(l => [l, 9, [0, 0, 0, 0, 0, 0.15, 0.9], 'TiO']),
];
function B_dSpectrum(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, T = st.T;
  const top = 222, bot = 712;
  B_space(ctx, X0, top, X1 - X0, bot - top, th);
  const gx0 = X0 + 66, gx1 = X1 - 26, gy0 = 292, gy1 = 596, lx = (l) => lerp(gx0, gx1, l / 2000);
  const pk = (TT) => B_logB(B_wien(TT), TT), frac = lerp(0.3, 0.9, Math.log(T / 2500) / Math.log(16)), lpT = pk(T);
  const ly = (v) => gy1 - (gy1 - gy0) * frac * Math.pow(10, Math.min(v - lpT, 2));
  ctx.save(); rr(ctx, X0, top, X1 - X0, bot - top, 18); ctx.clip();
  ctx.globalAlpha = 0.42; ctx.drawImage(B_rainbow(), lx(380), gy0 - 18, lx(750) - lx(380), gy1 - gy0 + 18); ctx.globalAlpha = 1;
  label(ctx, 'แสงที่ตามองเห็น', (lx(380) + lx(750)) / 2, gy0 - 30, { size: 14, wt: 700, color: '#fff' });
  label(ctx, 'UV', lx(190), gy0 - 30, { size: 14, wt: 700, color: '#d0bfff' });
  label(ctx, 'อินฟราเรด (IR) →', lx(1000), gy0 - 30, { size: 14, wt: 700, color: '#ffa8a8', align: 'left' });
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(gx0, gy0 - 18); ctx.lineTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
  for (let l = 0; l <= 2000; l += 500) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(lx(l) - 1, gy1, 2, 7); label(ctx, String(l), lx(l), gy1 + 18, { size: 13, wt: 600, color: 'rgba(255,255,255,0.75)' }); }
  label(ctx, 'ความยาวคลื่น (nm)', (gx0 + gx1) / 2, gy1 + 40, { size: 14, wt: 600, color: 'rgba(255,255,255,0.8)' });
  ctx.save(); ctx.translate(gx0 - 24, (gy0 + gy1) / 2); ctx.rotate(-Math.PI / 2); label(ctx, 'ความเข้มแสง (ปรับสเกลตามกราฟ)', 0, 0, { size: 14, wt: 600, color: 'rgba(255,255,255,0.8)' }); ctx.restore();
  const curve = (TT) => { const pts = []; for (let l = 40; l <= 2000; l += 10) pts.push([lx(l), ly(B_logB(l, TT))]); return pts; };
  const sun = curve(5800);
  ctx.save(); ctx.beginPath(); ctx.rect(gx0, gy0 - 18, gx1 - gx0, gy1 - gy0 + 18); ctx.clip();
  ctx.strokeStyle = 'rgba(255,224,102,0.75)'; ctx.lineWidth = 2.5; ctx.setLineDash([8, 6]); ctx.beginPath(); sun.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  const cur = curve(T);
  ctx.fillStyle = B_tc(T, 0.16); ctx.beginPath(); ctx.moveTo(cur[0][0], gy1); cur.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(gx1, gy1); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = B_tc(T); ctx.lineWidth = 4.5; ctx.beginPath(); cur.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  const lm = B_wien(T), px = lx(lm), py = ly(B_logB(lm, T)), spx = lx(500), spy = ly(B_logB(500, 5800));
  const rs = Math.pow(10, pk(5800) - lpT), rsTxt = rs >= 1 ? `ยอดสูงกว่า ×${B_n(B_sig(rs))}` : `ยอดต่ำกว่า ×${B_n(B_sig(1 / rs))}`;
  if (Math.abs(T - 5800) > 400) label(ctx, `ดวงอาทิตย์ 5,800 K (${rsTxt})`, spy < gy0 ? spx + 14 : spx + 12, clamp(spy - 8, gy0 - 4, gy1 - 14), { size: 13, wt: 700, color: '#ffe066', align: 'left', bg: 'rgba(11,23,48,0.7)', pad: 4 });
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(px, gy1); ctx.lineTo(px, py); ctx.stroke(); ctx.setLineDash([]);
  circle(ctx, px, py, 7, '#fff'); circle(ctx, px, py, 4, B_tc(T));
  label(ctx, `λmax ${B_n(lm)} nm`, clamp(px, gx0 + 70, gx1 - 70), py - 22, { size: 15, wt: 700, color: '#0b1730', bg: 'rgba(255,255,255,0.92)', pad: 5 });
  const ci = B_clsI(T), cl = B_CLS[ci], swx = gx1 - 62, swy = gy0 + 52;
  glow(ctx, swx, swy, 80 + 4 * Math.sin(t * 2), B_tc(T, 0.5)); B_star(ctx, swx, swy, 32, T, 1.2);
  label(ctx, `ชนิด ${cl.L}`, swx, swy + 54, { size: 15, wt: 700, color: '#fff' });
  // drag strip: the direction of the drag is the direction of temperature
  const sy0 = 660, fT = Math.log(T / 2500) / Math.log(16);
  for (let k = 0; k < 40; k++) { ctx.fillStyle = B_tc(2500 * Math.pow(16, (k + 0.5) / 40)); ctx.fillRect(lerp(gx0, gx1, k / 40), sy0 - 7, (gx1 - gx0) / 40 + 1, 14); }
  const kx = lerp(gx0, gx1, fT);
  circle(ctx, kx, sy0, 13, '#fff'); circle(ctx, kx, sy0, 8, B_tc(T));
  chevron(ctx, kx - 24, sy0, Math.PI, '#fff', 8); chevron(ctx, kx + 24, sy0, 0, '#fff', 8);
  label(ctx, '← เย็นลง (แดง)', gx0, sy0 + 28, { size: 15, wt: 700, color: '#ff8a65', align: 'left' });
  label(ctx, 'ร้อนขึ้น (น้ำเงิน) →', gx1, sy0 + 28, { size: 15, wt: 700, color: '#91a7ff', align: 'right' });
  ctx.restore();
  P.zones.push({ x: X0, y: top, w: X1 - X0, h: bot - top, cursor: 'ew-resize', drag: (qx) => { st.T = 2500 * Math.pow(16, clamp((qx - gx0) / (gx1 - gx0), 0, 1)); } });
  hint(ctx, P, 'ลากซ้าย–ขวาบนภาพ เพื่อเปลี่ยนอุณหภูมิผิวของดาว', bot + 20);
  B_readout(ctx, P, 754, 108);
  const ex = B_ex(T);
  label(ctx, `T = ${B_n(Math.round(T / 50) * 50)} K   ·   λmax ≈ ${B_n(lm)} nm`, X0 + 18, 780, { size: 24, wt: 700, color: th.a, align: 'left', fam: F.display });
  label(ctx, `ชนิดสเปกตรัม ${cl.L} · สี${cl.col} · ใกล้เคียง ${ex[1]} (${B_n(ex[0])} K)`, X0 + 18, 814, { size: 18, wt: 600, align: 'left' });
  const e4 = Math.pow(T / 5800, 4);
  label(ctx, `ผิวดาวแผ่พลังงานต่อตารางเมตร ${e4 < 10 ? B_n(e4, 2) : B_n(e4)} เท่าของผิวดวงอาทิตย์ (∝ T⁴)`, X0 + 18, 843, { size: 16, wt: 500, color: C.soft, align: 'left' });
  // spectral class strip
  label(ctx, 'ชนิดสเปกตรัม เรียงจากร้อนไปเย็น', X0, 888, { size: 17, wt: 700, color: th.a, align: 'left' });
  const bw = (X1 - X0) / 7;
  B_CLS.forEach((c, k) => {
    const x = X0 + k * bw, on = k === ci, Tm = [40000, 18000, 8700, 6700, 5500, 4200, 3000][k];
    ctx.fillStyle = B_tc(Tm); rr(ctx, x + 3, 904, bw - 6, 58, 10); ctx.fill();
    ctx.strokeStyle = on ? C.ink : 'rgba(37,48,58,0.2)'; ctx.lineWidth = on ? 3.5 : 1.5; ctx.stroke();
    label(ctx, c.L, x + bw / 2, 922, { size: 22, wt: 700, color: C.ink, fam: F.display });
    label(ctx, c.r, x + bw / 2, 948, { size: 12, wt: 600, color: C.ink });
    if (on) chevron(ctx, x + bw / 2, 974, -Math.PI / 2, C.ink, 9);
  });
  // simulated absorption spectrum of this class
  const qx0 = X0, qx1 = X1, qy = 1006, qX = (l) => lerp(qx0, qx1, (l - 380) / 370);
  label(ctx, `สเปกตรัมจำลองของดาวชนิด ${cl.L} · เส้นมืด = เส้นดูดกลืน (absorption lines)`, X0, 992, { size: 15, wt: 600, color: C.soft, align: 'left' });
  ctx.drawImage(B_rainbow(), qx0, qy, qx1 - qx0, 40);
  const tags = {};
  for (const [l, w, s, el] of B_LINES) {
    const a = s[ci]; if (a <= 0) continue;
    ctx.fillStyle = `rgba(10,8,20,${0.9 * a})`; ctx.fillRect(qX(l) - w, qy, w * 2, 40);
    if (a >= 0.4 && !tags[el]) tags[el] = l;
  }
  ctx.strokeStyle = 'rgba(37,48,58,0.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(qx0, qy, qx1 - qx0, 40);
  for (const [el, l] of Object.entries(tags)) label(ctx, el, qX(l), qy + 58, { size: 14, wt: 700, color: C.ink });
  for (const l of [400, 500, 600, 700]) label(ctx, l + ' nm', qX(l), qy + 82, { size: 12, wt: 500, color: C.soft });
}

// ============================================================ page 16 · HR diagram
const B_MS = (m) => { const L = m < 0.43 ? 0.23 * Math.pow(m, 2.3) : Math.pow(m, 3.5), R = Math.pow(m, m > 1 ? 0.57 : 0.8); return { L, T: 5800 * Math.pow(L / (R * R), 0.25) }; };
const B_MSLINE = Array.from({ length: 60 }, (_, k) => B_MS(Math.pow(10, -1 + k * 2.4 / 59)));
function B_msLogL(T) {
  const A = B_MSLINE; if (T <= A[0].T) return Math.log10(A[0].L);
  for (let k = 1; k < A.length; k++) if (T <= A[k].T) return lerp(Math.log10(A[k - 1].L), Math.log10(A[k].L), (Math.log(T) - Math.log(A[k - 1].T)) / (Math.log(A[k].T) - Math.log(A[k - 1].T)));
  return Math.log10(A[A.length - 1].L);
}
const B_R = (T, L) => Math.sqrt(L) * Math.pow(5800 / T, 2);
const B_HRS = (() => {
  const r = B_rng(2024), out = [], add = (T, L) => { const R = B_R(T, L); out.push({ T, L, R, col: B_tc(T), rad: clamp(3.2 + 1.2 * Math.log10(R), 1.8, 7.5) }); };
  for (let k = 0; k < 105; k++) { const s = B_MS(Math.pow(10, lerp(-1, 1.32, Math.pow(r(), 1.5)))); add(s.T * Math.pow(10, (r() - 0.5) * 0.03), s.L * Math.pow(10, (r() - 0.5) * 0.35)); }
  for (let k = 0; k < 20; k++) add(lerp(3600, 5200, r()), Math.pow(10, lerp(1.3, 2.8, r())));
  for (let k = 0; k < 10; k++) add(Math.exp(lerp(Math.log(3500), Math.log(30000), r())), Math.pow(10, lerp(4.3, 5.7, r())));
  for (let k = 0; k < 15; k++) { const T = Math.exp(lerp(Math.log(6000), Math.log(30000), r())), R = lerp(0.01, 0.014, r()); add(T, R * R * Math.pow(T / 5800, 4)); }
  return out;
})();
const B_SUNPATH = [[5800, 1], [5600, 1.7], [5000, 2.3], [4600, 5], [4300, 30], [3900, 300], [3300, 2500], [4700, 45], [4900, 50], [4400, 60], [3800, 500], [3100, 5000], [6000, 6000], [15000, 6000], [40000, 5000], [40000, 0.33], [30000, 0.103], [20000, 0.02], [12000, 0.0026], [8000, 5e-4]];
function B_region(T, L) {
  const R = B_R(T, L), dl = Math.log10(L) - B_msLogL(T);
  if (R < 0.06) return ['ดาวแคระขาว (white dwarf)', 'ร้อนแต่สลัว เพราะเล็กมาก'];
  if (Math.abs(dl) < 0.7) return ['ลำดับหลัก (main sequence)', L > 100 ? 'ดาวมวลมาก ร้อนและสว่าง' : L < 0.1 ? 'ดาวมวลน้อย เย็นและสลัว' : 'ดาวขนาดใกล้เคียงดวงอาทิตย์'];
  if (dl > 0) return L > 1e4 ? ['ดาวยักษ์ใหญ่ (supergiant)', 'สว่างมากที่สุด ขนาดมหึมา'] : ['ดาวยักษ์ (giant)', 'เย็นแต่สว่าง เพราะใหญ่มาก'];
  return ['ใต้แถบลำดับหลัก', 'บริเวณนี้แทบไม่พบดาว'];
}
function B_dHR(ctx, t, P) {
  const { X0, X1, cx, th, st } = P;
  const top = 222, bot = 720, px0 = X0 + 84, px1 = X1 - 22, py0 = 262, py1 = 650;
  const lT0 = Math.log10(40000), lT1 = Math.log10(2500);
  const xT = (T) => lerp(px0, px1, (lT0 - Math.log10(T)) / (lT0 - lT1)), yL = (L) => lerp(py1, py0, (Math.log10(L) + 4) / 10);
  B_space(ctx, X0, top, X1 - X0, bot - top, th);
  ctx.save(); rr(ctx, X0, top, X1 - X0, bot - top, 18); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
  for (let e = -4; e <= 6; e += 2) { ctx.beginPath(); ctx.moveTo(px0, yL(Math.pow(10, e))); ctx.lineTo(px1, yL(Math.pow(10, e))); ctx.stroke(); label(ctx, e === 0 ? '1' : '10' + ['⁻⁴', '⁻²', '', '²', '⁴', '⁶'][(e + 4) / 2], px0 - 8, yL(Math.pow(10, e)), { size: 13, wt: 600, color: 'rgba(255,255,255,0.75)', align: 'right' }); }
  for (const T of [30000, 10000, 6000, 3000]) { ctx.beginPath(); ctx.moveTo(xT(T), py0); ctx.lineTo(xT(T), py1); ctx.stroke(); label(ctx, B_n(T), xT(T), py1 + 16, { size: 13, wt: 600, color: 'rgba(255,255,255,0.75)' }); }
  [['O', 36000], ['B', 17000], ['A', 8700], ['F', 6700], ['G', 5500], ['K', 4200], ['M', 3000]].forEach(([c, T]) => label(ctx, c, xT(T), py0 - 18, { size: 15, wt: 700, color: B_tc(T) }));
  label(ctx, '← ร้อน   อุณหภูมิผิว (K)   เย็น →', (px0 + px1) / 2, py1 + 40, { size: 14, wt: 700, color: 'rgba(255,255,255,0.85)' });
  ctx.save(); ctx.translate(X0 + 22, (py0 + py1) / 2); ctx.rotate(-Math.PI / 2); label(ctx, 'กำลังส่องสว่าง (L/L☉) · สว่างขึ้น →', 0, 0, { size: 14, wt: 700, color: 'rgba(255,255,255,0.85)' }); ctx.restore();
  // main sequence band
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 36; ctx.lineCap = 'round'; ctx.beginPath();
  B_MSLINE.forEach((s, k) => { const x = xT(clamp(s.T, 2500, 40000)), y = yL(s.L); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
  for (const s of B_HRS) circle(ctx, xT(s.T), yL(s.L), s.rad, s.col);
  const tag = (txt, T, L, al = 'center', rot = 0) => { ctx.save(); ctx.translate(xT(T), yL(L)); ctx.rotate(rot); label(ctx, txt, 0, 0, { size: 15, wt: 700, color: '#fff', bg: 'rgba(11,23,48,0.7)', pad: 4, align: al }); ctx.restore(); };
  const a1 = xT(15000), a2 = xT(4000), ang = Math.atan2(yL(Math.pow(10, B_msLogL(4000))) - yL(Math.pow(10, B_msLogL(15000))), a2 - a1);
  tag('ลำดับหลัก', 11000, Math.pow(10, B_msLogL(11000) - 1.3), 'center', ang);
  tag('ดาวยักษ์', 3500, 7);
  tag('ดาวยักษ์ใหญ่', 14000, 1.6e5);
  tag('ดาวแคระขาว', 22000, 1.2e-4);
  // the Sun
  const sux = xT(5800), suy = yL(1);
  ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2.5; ring(ctx, sux, suy, 9); circle(ctx, sux, suy, 3, '#ffe066');
  label(ctx, 'ดวงอาทิตย์', sux + 12, suy - 16, { size: 13, wt: 700, color: '#ffe066', align: 'left' });
  // the Sun's future path
  if (st.path) {
    const path = Path(B_SUNPATH.map(([T, L]) => [xT(T), yL(L)]), false), u = clamp((t - st.p0) / 9, 0, 1);
    strokeP(ctx, path, 'rgba(255,224,102,0.25)', 3, [6, 6], 0);
    ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 3.5; ctx.beginPath();
    for (let k = 0; k <= 80; k++) { const q = path.at(u * k / 80); k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); } ctx.stroke();
    const q = path.at(u); glow(ctx, q.x, q.y, 22, 'rgba(255,224,102,0.7)'); circle(ctx, q.x, q.y, 6, '#fff');
    for (let k = 1; k <= 3; k++) { const p = path.at(clamp(u * 1.02 - 0.012 * k, 0, 1)); circle(ctx, p.x, p.y, 2, 'rgba(255,255,255,0.6)'); }
    if (u > 0.3) tag('① ดาวยักษ์แดง', 3300, 1.5e4, 'center');
    if (u > 0.72) tag('② เนบิวลาดาวเคราะห์', 20000, 1.5e3, 'center');
    if (u > 0.97) tag('③ ดาวแคระขาว', 8000, 2e-3, 'left');
    if (t - st.p0 > 12) st.p0 = t;
  }
  // probe
  const qx = xT(st.T), qy = yL(st.L);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
  ctx.beginPath(); ctx.moveTo(px0, qy); ctx.lineTo(px1, qy); ctx.moveTo(qx, py0); ctx.lineTo(qx, py1); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ring(ctx, qx, qy, 16 + 2 * Math.sin(t * 3));
  circle(ctx, qx, qy, 5, B_tc(st.T));
  for (const [a, dx, dy] of [[0, 30, 0], [Math.PI, -30, 0], [-Math.PI / 2, 0, -30], [Math.PI / 2, 0, 30]]) chevron(ctx, qx + dx, qy + dy, a, 'rgba(255,255,255,0.8)', 7);
  ctx.restore();
  P.zones.push({ x: X0, y: top, w: X1 - X0, h: bot - top, cursor: 'grab', drag: (x, y) => {
    if (x < 0) return;
    st.T = Math.pow(10, lT0 - clamp((x - px0) / (px1 - px0), 0, 1) * (lT0 - lT1));
    st.L = Math.pow(10, -4 + clamp((py1 - y) / (py1 - py0), 0, 1) * 10);
  } });
  hint(ctx, P, 'ลากวงกลมไปที่ใดก็ได้บนแผนภาพ', bot + 20);
  const [rg, rd] = B_region(st.T, st.L), R = B_R(st.T, st.L);
  const fmtL = (L) => L >= 100 ? B_n(B_sig(L)) : L >= 0.1 ? B_n(L, L < 1 ? 2 : 1) : L.toExponential(1).replace('e', '×10^');
  const fmtR = (r) => r >= 10 ? B_n(B_sig(r)) : r >= 0.1 ? B_n(r, 2) : B_n(r, 3);
  B_readout(ctx, P, 762, 92);
  label(ctx, rg, X0 + 18, 788, { size: 22, wt: 700, color: th.a, align: 'left', fam: F.display });
  label(ctx, rd, X1 - 18, 788, { size: 16, wt: 600, color: C.soft, align: 'right' });
  label(ctx, `T ≈ ${B_n(B_sig(st.T))} K (ชนิด ${B_CLS[B_clsI(st.T)].L}) · L ≈ ${fmtL(st.L)} L☉ · R ≈ ${fmtR(R)} R☉`, X0 + 18, 826, { size: 18, wt: 600, align: 'left' });
  B_button(ctx, P, cx - 210, 872, 420, 44, st.path ? '■ ซ่อนเส้นทางชีวิตของดวงอาทิตย์' : '▶ แสดงเส้นทางชีวิตของดวงอาทิตย์', st.path, () => { st.path = !st.path; st.p0 = t; });
  // size comparison
  const by = 936, bh = 156;
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; rr(ctx, X0, by, X1 - X0, bh, 14); ctx.fill();
  ctx.strokeStyle = rgba(th.a, 0.3); ctx.lineWidth = 1.5; ctx.stroke();
  label(ctx, 'เทียบขนาดกับดวงอาทิตย์', X0 + 18, by + 22, { size: 16, wt: 700, color: th.a, align: 'left' });
  const ccy = by + 82, big = 46, rs = R >= 1 ? big / R : big, rx = R >= 1 ? big : big * R, c1 = X0 + 40 + big, c2 = c1 + big + 30 + Math.max(rs, 3);
  ctx.save(); rr(ctx, X0, by, X1 - X0, bh, 14); ctx.clip();
  B_star(ctx, c1, ccy, Math.max(rx, 1.6), st.T, 1.3);
  B_star(ctx, c2, ccy, Math.max(rs, 1.6), 5800, 1.3);
  ctx.restore();
  label(ctx, 'ดาวที่เลือก', c1, ccy + Math.max(rx, 3) + 14, { size: 13, wt: 600, color: C.soft });
  label(ctx, 'ดวงอาทิตย์', c2, ccy + Math.max(rs, 3) + 14, { size: 13, wt: 600, color: C.soft });
  const tx = X0 + 330;
  label(ctx, 'R/R☉ = √(L/L☉) × (5,800 / T)²', tx, by + 56, { size: 18, wt: 700, color: C.ink, align: 'left' });
  label(ctx, `= √${fmtL(st.L)} × (5,800 / ${B_n(B_sig(st.T))})² ≈ ${fmtR(R)}`, tx, by + 88, { size: 16, wt: 600, color: C.soft, align: 'left' });
  const cmp = R >= 1.15 ? `ใหญ่กว่าดวงอาทิตย์ราว ${B_n(B_sig(R))} เท่า` : R <= 0.87 ? `เล็กกว่าดวงอาทิตย์ราว ${B_n(B_sig(1 / R))} เท่า` : 'ขนาดใกล้เคียงดวงอาทิตย์';
  label(ctx, cmp, tx, by + 122, { size: 18, wt: 700, color: th.a, align: 'left' });
}

// ============================================================ page 18 · distance and magnitude
const B_SK = [{ n: 'ดาวคล้ายดวงอาทิตย์', M: 4.8, T: 5800, r: 10 }, { n: 'ซิริอุส', M: 1.4, T: 9900, r: 12 }, { n: 'ไรเจล', M: -7, T: 12100, r: 17 }];
function B_dMag(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, S = B_SK[st.sk], d = Math.pow(10, st.ld), m = S.M + 5 * st.ld - 5;
  const top = 222, bot = 652, ox = X0 + 74, oy = 452, rx0 = X0 + 176, rx1 = X1 - 50, ry = 590;
  const sx = lerp(rx0, rx1, st.ld / 3), D = sx - ox, h = Math.min(D * 0.24, 96), tA = h / D;
  B_space(ctx, X0, top, X1 - X0, bot - top, th);
  ctx.save(); rr(ctx, X0, top, X1 - X0, bot - top, 18); ctx.clip();
  // light cone from the star to the observer
  const cg = ctx.createLinearGradient(sx, 0, ox, 0); cg.addColorStop(0, B_tc(S.T, 0.38)); cg.addColorStop(1, B_tc(S.T, 0.04));
  ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(sx, oy); ctx.lineTo(ox, oy - h); ctx.lineTo(ox, oy + h); ctx.closePath(); ctx.fill();
  const frame = (fx, hh, n) => {
    const k = hh * 0.35, dd = k * 0.45; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.6;
    const P4 = [[fx - k, oy - hh - dd], [fx + k, oy - hh + dd], [fx + k, oy + hh + dd], [fx - k, oy + hh - dd]];
    ctx.beginPath(); P4.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.stroke();
    for (let j = 1; j < n; j++) {
      const u = j / n;
      ctx.beginPath(); ctx.moveTo(lerp(P4[0][0], P4[1][0], u), lerp(P4[0][1], P4[1][1], u)); ctx.lineTo(lerp(P4[3][0], P4[2][0], u), lerp(P4[3][1], P4[2][1], u)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lerp(P4[0][0], P4[3][0], u), lerp(P4[0][1], P4[3][1], u)); ctx.lineTo(lerp(P4[1][0], P4[2][0], u), lerp(P4[1][1], P4[2][1], u)); ctx.stroke();
    }
  };
  const ffx = ox + 34 + 0.35 * h; frame(sx - D / 2, h / 2, 1); frame(ffx, h * (sx - ffx) / D, 2);
  if (D > 250) {
    label(ctx, '1 ช่อง', sx - D / 2, oy - h / 2 - 16, { size: 13, wt: 700, color: '#fff' });
    label(ctx, '4 ช่อง', ffx, oy - h * (sx - ffx) / D - 24, { size: 13, wt: 700, color: '#fff' });
  }
  for (let k = 0; k < 44; k++) {
    const a = (mod1(k * 0.618) * 2 - 1) * Math.atan(tA), s = mod1(k * 0.137 + t * 0.32) * (D - 8), y = oy - s * Math.tan(a);
    const hit = Math.abs(y - oy) < 16 && s > D - 60;
    circle(ctx, sx - s, y, hit ? 3.6 : 2.4, hit ? '#fff' : B_tc(S.T, 0.85));
  }
  // observer
  globe(ctx, ox, oy, 20);
  ctx.fillStyle = '#ffd43b'; rr(ctx, ox + 20, oy - 16, 7, 32, 3); ctx.fill();
  label(ctx, 'ผู้สังเกตบนโลก', X0 + 10, oy + 36, { size: 13, wt: 700, color: '#fff', align: 'left' });
  // star
  B_star(ctx, sx, oy, S.r * (1 + 0.04 * Math.sin(t * 3)), S.T, 3);
  chevron(ctx, sx - S.r - 16, oy, Math.PI, '#ffd43b', 9); chevron(ctx, sx + S.r + 16, oy, 0, '#ffd43b', 9);
  label(ctx, S.n, Math.min(sx, X1 - 90), oy - S.r - 22, { size: 14, wt: 700, color: '#fff' });
  // what the eye sees
  const ix = X0 + 74, iy = 302, vis = clamp((9 - m) / 21, 0, 1);
  circle(ctx, ix, iy, 46, '#050a16'); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; ring(ctx, ix, iy, 46);
  if (m <= 6) { glow(ctx, ix, iy, 6 + 40 * vis, B_tc(S.T, 0.25 + 0.6 * vis)); circle(ctx, ix, iy, 1.2 + 5 * vis, '#fff'); }
  else circle(ctx, ix, iy, 1, 'rgba(255,255,255,0.18)');
  label(ctx, 'ตาเห็นอย่างนี้', ix + 56, iy - 12, { size: 13, wt: 700, color: '#fff', align: 'left' });
  label(ctx, m <= 6 ? 'มองเห็นด้วยตาเปล่า' : 'ตาเปล่ามองไม่เห็น', ix + 56, iy + 10, { size: 13, wt: 600, color: m <= 6 ? '#8ce99a' : '#ffa8a8', align: 'left' });
  // log distance ruler
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(rx0, ry); ctx.lineTo(rx1, ry); ctx.stroke();
  for (let e = 0; e < 3; e++) for (const k of [1, 2, 5]) { const x = lerp(rx0, rx1, (e + Math.log10(k)) / 3); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(x - 1, ry - (k === 1 ? 9 : 5), 2, k === 1 ? 18 : 10); }
  for (const [dd, ly] of [[1, '3.26'], [10, '32.6'], [100, '326'], [1000, '3,260']]) {
    const x = lerp(rx0, rx1, Math.log10(dd) / 3);
    ctx.fillStyle = '#fff'; ctx.fillRect(x - 1, ry - 9, 2, 18);
    label(ctx, `${B_n(dd)} pc`, x, ry + 22, { size: 14, wt: 700, color: dd === 10 ? '#ffd43b' : '#fff' });
    label(ctx, `${ly} ปีแสง`, x, ry + 42, { size: 12, wt: 500, color: 'rgba(255,255,255,0.65)' });
  }
  label(ctx, '← ใกล้โลก', rx0, ry - 24, { size: 15, wt: 700, color: '#ffd43b', align: 'left' });
  label(ctx, 'ไกลโลก →', rx1, ry - 24, { size: 15, wt: 700, color: '#ffd43b', align: 'right' });
  label(ctx, 'ระยะ ×2 → แสงกระจายบนพื้นที่ ×4 → สว่างเหลือ ¼', cx + 40, top + 26, { size: 14, wt: 600, color: 'rgba(255,255,255,0.85)' });
  ctx.restore();
  P.zones.push({ x: X0, y: top, w: X1 - X0, h: bot - top, cursor: 'ew-resize', drag: (px) => { if (px >= 0) st.ld = clamp((px - rx0) / (rx1 - rx0) * 3, 0, 3); } });
  hint(ctx, P, 'ลากดาวเข้าใกล้หรือออกห่างจากโลก', bot + 18);
  // readout
  const dTxt = d >= 100 ? B_n(B_sig(d)) : d >= 10 ? B_n(d) : B_n(d, 1), b = Math.pow(10 / d, 2);
  B_readout(ctx, P, 692, 110);
  label(ctx, `ระยะ ${dTxt} pc (${d * 3.26 < 100 ? B_n(d * 3.26, 1) : B_n(B_sig(d * 3.26))} ปีแสง) · M = ${B_sgn(S.M)} คงที่`, X0 + 18, 714, { size: 17, wt: 600, align: 'left' });
  label(ctx, `โชติมาตรปรากฏ m = ${B_sgn(m)}`, X0 + 18, 748, { size: 25, wt: 700, color: th.a, align: 'left', fam: F.display });
  label(ctx, m <= 6 ? 'ตาเปล่าเห็น' : m <= 30 ? 'ต้องใช้กล้องโทรทรรศน์' : 'สลัวเกินกล้องใด ๆ', X1 - 18, 748, { size: 16, wt: 700, color: '#fff', bg: m <= 6 ? '#2b8a3e' : '#c2410c', align: 'right', pad: 6 });
  const bTxt = Math.abs(b - 1) < 0.02 ? 'สว่างเท่ากับที่ 10 pc (นิยามของ M)' : b >= 1 ? `สว่างกว่าที่ 10 pc ${B_n(B_sig(b))} เท่า` : `สลัวกว่าที่ 10 pc ${B_n(B_sig(1 / b))} เท่า`;
  label(ctx, `m − M = 5 log₁₀(${dTxt}) − 5 = ${B_sgn(m - S.M)} → ${bTxt}`, X0 + 18, 782, { size: 16, wt: 600, color: C.soft, align: 'left' });
  // brightness bar (log)
  const bx0 = X0 + 190, bx1 = X1 - 10, by = 826, fb = clamp(1 - st.ld / 3, 0, 1);
  label(ctx, 'ความสว่างที่ได้รับ', X0, by, { size: 15, wt: 700, align: 'left' });
  ctx.fillStyle = 'rgba(120,105,80,0.2)'; rr(ctx, bx0, by - 8, bx1 - bx0, 16, 8); ctx.fill();
  ctx.fillStyle = B_tc(S.T * 0.6); rr(ctx, bx0, by - 8, Math.max(16, fb * (bx1 - bx0)), 16, 8); ctx.fill();
  for (const [v, txt] of [[1e-4, '×1/10,000'], [1e-2, '×1/100'], [1, '×1 (ที่ 10 pc)'], [100, '×100']]) {
    const x = lerp(bx0, bx1, (Math.log10(v) + 4) / 6);
    ctx.fillStyle = 'rgba(37,48,58,0.5)'; ctx.fillRect(x - 1, by - 11, 2, 22);
    label(ctx, txt, clamp(x, bx0 + 34, bx1 - 30), by + 22, { size: 12, wt: 600, color: C.soft });
  }
  // star buttons
  const gw = (X1 - X0 - 20) / 3;
  B_SK.forEach((s, k) => B_button(ctx, P, X0 + k * (gw + 10), 870, gw, 44, `${s.n} M ${B_sgn(s.M)}`, st.sk === k, () => { st.sk = k; }));
  // magnitude number line
  label(ctx, 'แกนโชติมาตรปรากฏ: ตัวเลขยิ่งน้อย ยิ่งสว่าง', X0, 944, { size: 17, wt: 700, color: th.a, align: 'left' });
  const nx0 = X0 + 16, nx1 = X1 - 16, nX = (v) => lerp(nx0, nx1, (v + 27) / 57), ny = 1000;
  ctx.fillStyle = 'rgba(43,138,62,0.55)'; rr(ctx, nx0, ny - 6, nX(6) - nx0, 12, 6); ctx.fill();
  ctx.fillStyle = 'rgba(93,104,114,0.35)'; rr(ctx, nX(6), ny - 6, nx1 - nX(6), 12, 6); ctx.fill();
  for (let v = -25; v <= 30; v += 5) { ctx.fillStyle = 'rgba(37,48,58,0.55)'; ctx.fillRect(nX(v) - 1, ny + 6, 2, 6); label(ctx, B_sgn(v, 0).replace('+0', '0'), nX(v), ny + 22, { size: 12, wt: 500, color: C.soft }); }
  label(ctx, 'ตาเปล่าเห็น', nX(-19.5), ny, { size: 11, wt: 700, color: '#fff' });
  const marks = [[-26.7, 'ดวงอาทิตย์ −26.7', 1046, 'left'], [-12.7, 'ดวงจันทร์เต็มดวง −12.7', 1070, 'center'], [-1.46, 'ซิริอุส −1.46', 1046, 'center'], [6, 'ขีดจำกัดตาเปล่า +6', 1070, 'center'], [30, 'กล้องฮับเบิล ≈ +30', 1046, 'right']];
  for (const [v, txt, y, al] of marks) {
    const x = nX(v);
    ctx.strokeStyle = 'rgba(37,48,58,0.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, ny + 8); ctx.lineTo(x, y - 10); ctx.stroke();
    circle(ctx, x, ny, 4, C.ink);
    label(ctx, txt, al === 'left' ? x - 6 : al === 'right' ? x + 6 : x, y, { size: 13, wt: 600, color: C.ink, align: al });
  }
  const cm = nX(clamp(m, -27, 30));
  chevron(ctx, cm, ny - 16, Math.PI / 2, th.a, 10);
  circle(ctx, cm, ny, 7, B_tc(S.T)); ctx.strokeStyle = th.a; ctx.lineWidth = 2.5; ring(ctx, cm, ny, 7);
  label(ctx, `ดาวนี้ ${B_sgn(m)}`, clamp(cm, X0 + 60, X1 - 60), ny - 36, { size: 14, wt: 700, color: '#fff', bg: th.a, pad: 5 });
}

const PART_B = [
  { th: TH.star, title: 'กำเนิดและวิวัฒนาการของดาวฤกษ์', sub: 'Star formation and stellar evolution', blocks: [
    { p: 'ดาวฤกษ์เกิดใน **เนบิวลา (nebula)** ซึ่งเป็นกลุ่มแก๊สไฮโดรเจน ฮีเลียม และฝุ่นขนาดมหึมา เมื่อบางส่วนของเนบิวลาหนาแน่นขึ้น **แรงโน้มถ่วง** จะดึงแก๊สให้ยุบตัวเข้าหากัน พลังงานโน้มถ่วงเปลี่ยนเป็นความร้อน เกิดเป็น **ดาวฤกษ์ก่อนเกิด (protostar)**' },
    { p: 'เมื่อแกนกลางร้อนถึงราว **15 ล้านเคลวิน** จะเกิด **ฟิวชัน** หลอมไฮโดรเจนเป็นฮีเลียม ดาวเข้าสู่ **ลำดับหลัก (main sequence)** ซึ่งเป็นช่วงที่ยาวนานที่สุด แรงดันจากภายในสมดุลกับแรงโน้มถ่วง ดาวจึงมีขนาดค่อนข้างคงที่' },
    { h: 'ชะตากรรมขึ้นกับมวล' },
    { li: [
      '**มวลไม่เกินราว 8 M☉** → ดาวยักษ์แดง (red giant) → เนบิวลาดาวเคราะห์ (planetary nebula) → ดาวแคระขาว (white dwarf)',
      '**มวลมากกว่า 8 M☉** → ดาวยักษ์ใหญ่แดง (red supergiant) → ซูเปอร์โนวา (supernova) → ดาวนิวตรอน (neutron star) ถ้าแกนเหลือ 1.4–3 M☉ หรือหลุมดำ (black hole) ถ้าแกนเหลือมากกว่า 3 M☉',
    ] },
    { box: 'ดาวมวลมากมีอายุสั้น เพราะเผาเชื้อเพลิงเร็วกว่ามาก ดวงอาทิตย์อยู่ในลำดับหลักได้ราว **10,000 ล้านปี** แต่ดาวมวล 10 เท่าอยู่ได้เพียงราว 30 ล้านปี' },
    { f: 'อายุ ≈ 10,000 ล้านปี × (M☉ / M)^2.5', cap: 'M คือมวลของดาว M☉ คือมวลของดวงอาทิตย์' },
  ] },
  { kind: 'diagram', th: TH.star, title: 'เส้นทางชีวิตของดาวฤกษ์', sub: 'ภาพโต้ตอบ: ลากตามช่วงชีวิต และเลื่อนมวลของดาว', draw: B_dLife, init: () => ({ life: 0.35, lm: 0 }) },
  { th: TH.star, title: 'สี อุณหภูมิผิว และสเปกตรัมของดาวฤกษ์', sub: 'Colour, surface temperature and spectral class', blocks: [
    { p: 'สีของดาวฤกษ์บอก **อุณหภูมิผิว** ดาวที่ร้อนที่สุดเป็นสีน้ำเงิน ดาวที่เย็นที่สุดเป็นสีแดง เพราะดาวแผ่รังสีคล้าย **วัตถุดำ (blackbody)** ยิ่งร้อน ความยาวคลื่นที่เข้มที่สุดยิ่งสั้น' },
    { f: 'λmax × T = 2.898 × 10⁻³ m·K', cap: 'กฎของวีน (Wien) T เป็นเคลวิน เช่น ดวงอาทิตย์ 5,800 K ได้ λmax ≈ 500 nm' },
    { h: 'ชนิดสเปกตรัม (spectral class)' },
    { table: { cols: [0.14, 0.34, 0.52], head: ['ชนิด', 'อุณหภูมิผิว (K)', 'สี · ตัวอย่าง'], rows: [
      ['O', '> 30,000', 'น้ำเงิน · ดาวนาออส'],
      ['B', '10,000–30,000', 'น้ำเงินแกมขาว · ไรเจล สไปกา'],
      ['A', '7,500–10,000', 'ขาว · ซิริอุส เวกา'],
      ['F', '6,000–7,500', 'ขาวแกมเหลือง · โปรซีออน'],
      ['G', '5,000–6,000', 'เหลือง · **ดวงอาทิตย์ (G2)**'],
      ['K', '3,500–5,000', 'ส้ม · อาร์คตูรุส'],
      ['M', '< 3,500', 'แดง · บีเทลจุส แอนทาเรส'],
    ] } },
    { box: 'สเปกตรัมของดาวมี **เส้นดูดกลืน (absorption lines)** เป็นเส้นมืดที่ตำแหน่งเฉพาะของธาตุแต่ละชนิด จึงบอกได้ว่าบรรยากาศของดาวมีธาตุใด เช่น ไฮโดรเจน ฮีเลียม โซเดียม เหล็ก' },
  ] },
  { kind: 'diagram', th: TH.star, title: 'อุณหภูมิกับสีของดาว', sub: 'ภาพโต้ตอบ: ลากเพื่อเปลี่ยนอุณหภูมิผิว', draw: B_dSpectrum, init: () => ({ T: 5800 }) },
  { th: TH.star, title: 'แผนภาพเฮิรตซ์สปรัง-รัสเซลล์', sub: 'Hertzsprung–Russell Diagram (HR diagram)', blocks: [
    { p: 'แผนภาพ HR วางดาวฤกษ์ตามสมบัติสองอย่าง **แกนนอน** คืออุณหภูมิผิวหรือชนิดสเปกตรัม โดย **ร้อนอยู่ซ้าย เย็นอยู่ขวา** (O B A F G K M) **แกนตั้ง** คือกำลังส่องสว่างเทียบกับดวงอาทิตย์ (L/L☉) หรือโชติมาตรสัมบูรณ์ ยิ่งสูงยิ่งสว่าง' },
    { h: 'กลุ่มของดาว' },
    { li: [
      '**ลำดับหลัก (main sequence)** แถบเฉียงจากซ้ายบน (ร้อน สว่าง) ลงมาขวาล่าง (เย็น สลัว) มีดาวราว 90% รวมทั้งดวงอาทิตย์',
      '**ดาวยักษ์ (giants)** อยู่ขวาบนของลำดับหลัก ผิวเย็นแต่สว่างมากเพราะขนาดใหญ่',
      '**ดาวยักษ์ใหญ่ (supergiants)** อยู่บนสุด สว่างกว่าดวงอาทิตย์หลายหมื่นถึงล้านเท่า',
      '**ดาวแคระขาว (white dwarfs)** อยู่ซ้ายล่าง ร้อนแต่สลัวเพราะเล็กราวโลก',
    ] },
    { box: 'ขนาดของดาวเพิ่มขึ้นจากซ้ายล่างไปขวาบน คำนวณได้จาก L ∝ R²T⁴ หรือ **R/R☉ = √(L/L☉) × (5,800/T)²**' },
    { p: 'ดวงอาทิตย์อยู่กลางแถบลำดับหลัก (G2, 5,800 K) เมื่อดาววิวัฒนาการ ตำแหน่งบนแผนภาพจะเคลื่อนไป ดวงอาทิตย์จะขยายเป็นดาวยักษ์แดงทางขวาบน แล้วจบเป็นดาวแคระขาวทางซ้ายล่าง' },
  ] },
  { kind: 'diagram', th: TH.star, title: 'สำรวจแผนภาพ HR', sub: 'ภาพโต้ตอบ: ลากตัวชี้ไปบนแผนภาพ', draw: B_dHR, init: () => ({ T: 5800, L: 1, path: false, p0: 0 }) },
  { th: TH.star, title: 'ความสว่างและโชติมาตรของดาวฤกษ์', sub: 'Brightness and magnitude', blocks: [
    { p: 'ความสว่างที่เราเห็นขึ้นกับ **กำลังส่องสว่าง** ของดาวและ **ระยะทาง** แสงแผ่ออกรอบทิศ ยิ่งไกลแสงยิ่งกระจายบนพื้นที่ทรงกลมที่ใหญ่ขึ้น จึงสว่างลดลงตาม **กฎกำลังสองผกผัน** ไกลขึ้น 2 เท่า สว่างเหลือ 1/4' },
    { h: 'โชติมาตรปรากฏ (m)' },
    { p: 'ระบบที่ **ฮิปปาร์คัส (Hipparchus)** เริ่มใช้ ตัวเลข **ยิ่งน้อยยิ่งสว่าง** ดาวที่สว่างมากมีค่าติดลบ ต่างกัน 1 อันดับ สว่างต่างกัน 2.512 เท่า ต่างกัน 5 อันดับ สว่างต่างกัน 100 เท่า ตาเปล่าเห็นได้ถึงราว +6' },
    { h: 'โชติมาตรสัมบูรณ์ (M)' },
    { p: 'คือโชติมาตรที่ดาวจะปรากฏ ถ้าอยู่ห่าง **10 พาร์เซก (32.6 ปีแสง)** ใช้เทียบกำลังส่องสว่างจริงของดาว' },
    { f: 'm − M = 5 log₁₀ d − 5', cap: 'd คือระยะทางในหน่วยพาร์เซก (pc)' },
    { table: { cols: [0.44, 0.28, 0.28], head: ['ดาว', 'm', 'M'], rows: [['ดวงอาทิตย์', '−26.7', '+4.8'], ['ซิริอุส', '−1.46', '+1.4'], ['ไรเจล', '+0.13', '≈ −7']] } },
  ] },
  { kind: 'diagram', th: TH.star, title: 'ระยะทางกับความสว่าง', sub: 'ภาพโต้ตอบ: ลากดาวเข้าใกล้หรือออกห่างโลก', draw: B_dMag, init: () => ({ ld: 1, sk: 0 }) },
];
