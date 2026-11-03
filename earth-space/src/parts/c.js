// ============================================================ Part C · ระบบสุริยะ ดวงอาทิตย์ และกล้องโทรทรรศน์ (pages 19–26)
const C_STARS = {};
function C_open(ctx, x, y, w, h) {
  const k = w + 'x' + h;
  if (!C_STARS[k]) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0b1730'); bg.addColorStop(1, '#14254a');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.55})`; const z = r() < 0.9 ? 1.2 : 2.2; g.fillRect(r() * w, r() * h, z, z); }
    C_STARS[k] = cv;
  }
  ctx.save(); rr(ctx, x, y, w, h, 16); ctx.clip(); ctx.drawImage(C_STARS[k], x, y);
}
function C_close(ctx, x, y, w, h) {
  ctx.restore();
  ctx.strokeStyle = 'rgba(37,48,58,0.35)'; ctx.lineWidth = 2; rr(ctx, x, y, w, h, 16); ctx.stroke();
}
function C_sig(n, d = 2) {
  if (!n) return '0';
  const p = Math.pow(10, Math.floor(Math.log10(Math.abs(n))) - d + 1), v = Math.round(n / p) * p;
  return v >= 1000 ? Math.round(v).toLocaleString('en-US') : String(+v.toPrecision(d));
}
function C_card(ctx, x, y, w, h, col) {
  ctx.fillStyle = rgba(col, 0.09); rr(ctx, x, y, w, h, 14); ctx.fill();
  ctx.fillStyle = col; rr(ctx, x, y, 7, h, 3); ctx.fill();
}
function C_rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// ============================================================ p20 · solar nebula
const C_NPL = [
  { n: 'พุธ', au: 0.39, rad: 3.5, col: '#b5a99c' }, { n: 'ศุกร์', au: 0.72, rad: 5, col: '#e9cf8f' },
  { n: 'โลก', au: 1, rad: 5, col: '#4dabf7' }, { n: 'อังคาร', au: 1.52, rad: 4, col: '#e8590c' },
  { n: 'พฤหัสบดี', au: 5.2, rad: 12, col: '#d9a066' }, { n: 'เสาร์', au: 9.54, rad: 10, col: '#e6c88a', ring: true },
  { n: 'ยูเรนัส', au: 19.2, rad: 7.5, col: '#99e9f2' }, { n: 'เนปจูน', au: 30.1, rad: 7.5, col: '#4c6ef5' },
];
C_NPL.forEach((p, i) => { p.f = Math.sqrt(p.au / 36); p.a0 = i * 2.39 + 0.7; });
const C_FROST = Math.sqrt(4 / 36);
const C_NEB = (() => {
  const r = C_rng(3), out = [];
  for (let i = 0; i < 230; i++) {
    const q = { ca: r() * Math.PI * 2, cr: Math.sqrt(r()), wob: r() * 6.28, dr: 0.05 + Math.pow(r(), 0.85) * 0.93, z: r() * 2 - 1, sz: 1.6 + r() * 2.2, k: r() };
    if ((q.dr > 0.235 && q.dr < 0.31) || q.dr > 0.95) q.pi = -1;
    else { let b = 0; C_NPL.forEach((p, j) => { if (Math.abs(p.f - q.dr) < Math.abs(C_NPL[b].f - q.dr)) b = j; }); q.pi = b; }
    out.push(q);
  }
  return out;
})();
const C_w = (r) => Math.min(3, 0.25 * Math.pow(Math.max(r, 0.05), -1.5));
const C_STAGES = [
  { n: 'เมฆแก๊สและฝุ่น (solar nebula)', d: 'แก๊สไฮโดรเจน ฮีเลียม และฝุ่นลอยอยู่อย่างเบาบาง คลื่นกระแทกจากซูเปอร์โนวาใกล้ ๆ อาจกระตุ้นให้เริ่มยุบตัว', s: 0.06, k: 'เมฆเนบิวลา' },
  { n: 'ยุบตัวและหมุนเร็วขึ้น', d: 'แรงโน้มถ่วงดึงมวลเข้าหาศูนย์กลาง เมฆหมุนเร็วขึ้นเหมือนนักสเกตที่หุบแขน ใจกลางร้อนขึ้นเรื่อย ๆ', s: 0.26, k: 'ยุบตัว หมุน' },
  { n: 'จานรอบดาวฤกษ์เกิดใหม่ (protoplanetary disc)', d: 'เมฆแบนลงเป็นจาน ใจกลางเป็นดาวฤกษ์ก่อนเกิด (protosun) ด้านในร้อน ด้านนอกเย็น แนวน้ำแข็งแบ่งสองเขต', s: 0.49, k: 'จานร้อน' },
  { n: 'ก้อนดาวเคราะห์ตั้งต้น (planetesimal)', d: 'ฝุ่นชนแล้วเกาะกันเป็นก้อนหลายกิโลเมตร รวมกันต่อเป็นดาวเคราะห์ก่อนเกิด (protoplanet)', s: 0.7, k: 'ก้อนดาว' },
  { n: 'ดาวเคราะห์และดวงอาทิตย์', d: 'ดวงอาทิตย์เริ่มฟิวชัน ลมสุริยะกวาดแก๊สที่เหลือออกไป เศษที่เหลือเป็นดาวเคราะห์น้อยและดาวหาง', s: 0.9, k: 'ดาวเคราะห์' },
];
function C_dNebula(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 236, bot = 690, cy = 463, RX = 330, s = st.s;
  const fc = smooth(0.12, 0.42, s), ff = smooth(0.32, 0.56, s), fk = smooth(0.6, 0.8, s), fp = smooth(0.78, 0.92, s), clr = smooth(0.82, 0.97, s);
  const tilt = lerp(0.62, 0.3, ff), RC = lerp(300, RX, fc);
  const ph = phaseAdvance(st, 'ph', t, lerp(0.03, 0.5, fc));
  C_open(ctx, X0, top, W, bot - top);
  // supernova shock (possible trigger)
  const sn = 1 - smooth(0.08, 0.18, s);
  if (sn > 0.01) {
    for (let k = 0; k < 2; k++) {
      const u = mod1(t * 0.22 + k * 0.5);
      ctx.strokeStyle = `rgba(255,135,135,${0.55 * sn * (1 - u)})`; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(X0 - 380, cy - 30, 420 + u * 170, -0.55, 0.55); ctx.stroke();
    }
    glow(ctx, X0 - 10, cy - 30, 90, `rgba(255,170,150,${0.35 * sn})`);
    label(ctx, 'คลื่นกระแทกจากซูเปอร์โนวา', X0 + 120, top + 40, { size: 15, wt: 700, color: `rgba(255,190,190,${sn})`, bg: `rgba(11,23,48,${0.6 * sn})`, pad: 5 });
  }
  // gas glow
  const gasA = 0.5 * (1 - 0.92 * clr);
  if (gasA > 0.01) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, tilt);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, RC * 1.08);
    g.addColorStop(0, mix('#8a6fb0', '#ffe08a', fc, gasA * (0.5 + fc * 0.5)));
    g.addColorStop(0.3, mix('#7b5ea7', '#f08c3a', fc, gasA * 0.75));
    g.addColorStop(0.62, mix('#6b5a9a', '#5b7fd6', fc, gasA * 0.5));
    g.addColorStop(1, 'rgba(60,70,140,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, RC * 1.08, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // orbits
  if (fp > 0.01) {
    ctx.strokeStyle = `rgba(255,255,255,${0.16 * fp})`; ctx.lineWidth = 1.2;
    for (const p of C_NPL) { ctx.beginPath(); ctx.ellipse(cx, cy, p.f * RX, p.f * RX * tilt, 0, 0, Math.PI * 2); ctx.stroke(); }
  }
  // frost line
  if (ff > 0.05) {
    const al = ff * (1 - 0.35 * fp);
    ctx.strokeStyle = `rgba(165,216,255,${0.85 * al})`; ctx.lineWidth = 2.5; ctx.setLineDash([8, 6]); ctx.lineDashOffset = -t * 10;
    ctx.beginPath(); ctx.ellipse(cx, cy, C_FROST * RX, C_FROST * RX * tilt, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  }
  // dust particles
  const H = [255, 212, 59], Cc = [145, 167, 255], G = [190, 172, 220];
  for (const q of C_NEB) {
    let r = lerp(q.cr * (1 + 0.22 * Math.sin(3 * q.ca + q.wob)), q.dr, fc);
    let a = q.ca + ph * C_w(q.dr) * fc;
    let al = 0.85, sz = q.sz;
    if (q.pi >= 0 && fk > 0) {
      const pl = C_NPL[q.pi], pa = pl.a0 + ph * C_w(pl.f);
      let d = pa - a; d = Math.atan2(Math.sin(d), Math.cos(d));
      a += d * fk * (0.9 + 0.08 * q.k); r = lerp(r, pl.f + (q.k - 0.5) * 0.025, fk);
      al *= 1 - fp; sz *= 1 + fk * 0.4;
    }
    if (q.dr < 0.075) al *= 1 - smooth(0.3, 0.5, s);
    if (q.pi < 0 && q.dr > 0.95) al *= 1 - 0.5 * clr;
    if (al < 0.03) continue;
    const x = cx + r * RC * Math.cos(a), y = cy + r * RC * Math.sin(a) * tilt + q.z * 70 * fc * (1 - ff);
    const tc = smooth(0.1, 0.5, r), cc = [0, 1, 2].map(i => Math.round(lerp(G[i], lerp(H[i], Cc[i], tc), fc)));
    ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${al})`;
    ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2); ctx.fill();
  }
  // solar wind clearing gas
  if (clr > 0.02 && clr < 0.999) {
    for (let k = 0; k < 10; k++) {
      const ang = k / 10 * Math.PI * 2 + 0.2, u = mod1(t * 0.5 + k * 0.37), r0 = 40 + u * 260;
      ctx.strokeStyle = `rgba(255,236,170,${0.6 * Math.sin(Math.PI * u) * Math.sin(Math.PI * clr)})`; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0 * tilt); ctx.lineTo(cx + Math.cos(ang) * (r0 + 30), cy + Math.sin(ang) * (r0 + 30) * tilt); ctx.stroke();
    }
  }
  // protosun / Sun
  if (fc > 0.02) {
    glow(ctx, cx, cy, 30 + 80 * fc + 20 * fp, rgba('#ffd43b', 0.85 * fc));
    circle(ctx, cx, cy, 3 + 12 * fc + 4 * fp, mix('#ff922b', '#fff3bf', fp));
  }
  // planets
  if (fp > 0.01) {
    C_NPL.forEach((p) => {
      const a = p.a0 + ph * C_w(p.f), x = cx + p.f * RX * Math.cos(a), y = cy + p.f * RX * Math.sin(a) * tilt, r = p.rad * Math.sqrt(fp);
      if (p.ring) { ctx.strokeStyle = rgba('#f3e2b8', 0.8 * fp); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, r * 1.9, r * 0.6, -0.3, 0, Math.PI * 2); ctx.stroke(); }
      circle(ctx, x, y, r, mix(p.col, p.col, 0, fp));
      if (fp > 0.6 && (p.n === 'พฤหัสบดี' || p.n === 'เนปจูน')) label(ctx, p.n, x, y + r + 13, { size: 14, wt: 700, color: `rgba(255,255,255,${(fp - 0.6) * 2.5})` });
    });
  }
  // labels
  if (ff > 0.4) label(ctx, 'แนวน้ำแข็ง (frost line) ≈ 3–5 AU', cx, cy - C_FROST * RX * tilt - 16, { size: 15, wt: 700, color: '#a5d8ff', bg: 'rgba(11,23,48,0.65)', pad: 5 });
  if (fc > 0.4) label(ctx, fp > 0.5 ? 'ดวงอาทิตย์ (เริ่มฟิวชัน)' : 'ดาวฤกษ์ก่อนเกิด (protosun)', cx, cy + 38, { size: 15, wt: 700, color: '#ffe8a3', bg: 'rgba(11,23,48,0.6)', pad: 5 });
  if (ff > 0.4 && fp < 0.9) {
    label(ctx, 'ร้อน', cx - 78, cy + 2, { size: 14, wt: 700, color: `rgba(255,212,120,${ff * (1 - fp)})` });
    label(ctx, 'เย็น', cx + 0.66 * RX, cy + 0.66 * RX * tilt + 22, { size: 14, wt: 700, color: `rgba(165,190,255,${ff * (1 - fp)})` });
  }
  if (clr > 0.2) label(ctx, 'ลมสุริยะกวาดแก๊สที่เหลือออกไป', cx, top + 30, { size: 15, wt: 700, color: '#ffe8a3', bg: 'rgba(11,23,48,0.6)', pad: 5 });
  label(ctx, '◀ ย้อนเวลา', X0 + 14, bot - 22, { size: 15, wt: 700, color: 'rgba(255,255,255,0.75)', align: 'left' });
  label(ctx, 'เดินหน้าเวลา ▶', X1 - 14, bot - 22, { size: 15, wt: 700, color: 'rgba(255,255,255,0.75)', align: 'right' });
  label(ctx, 'ภาพไม่ตามมาตราส่วน', cx, bot - 22, { size: 13, wt: 500, color: 'rgba(255,255,255,0.45)' });
  C_close(ctx, X0, top, W, bot - top);
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: 'ew-resize', drag: (px, py, phs) => {
    if (phs === 'start') { st._x = px; st._s = st.s; } else if (phs === 'move') st.s = clamp(st._s + (px - st._x) / (W * 0.9), 0, 1);
  } });
  hint(ctx, P, 'ลากในภาพไปทางขวาเพื่อเดินหน้าเวลา ไปทางซ้ายเพื่อย้อนกลับ', bot + 20);
  // readout
  const si = s < 0.15 ? 0 : s < 0.38 ? 1 : s < 0.6 ? 2 : s < 0.8 ? 3 : 4, S = C_STAGES[si];
  let tt;
  if (s < 0.12) tt = 'ราว 4,600 ล้านปีก่อน (ก่อนยุบตัว)';
  else { const y = Math.pow(10, lerp(3, 8, (s - 0.12) / 0.88)); tt = 'ประมาณ ' + (y < 1e6 ? C_sig(y) + ' ปี' : C_sig(y / 1e6) + ' ล้านปี') + ' หลังเริ่มยุบตัว'; }
  C_card(ctx, X0, 736, W, 128, th.a);
  label(ctx, `ขั้นที่ ${si + 1} · ${S.n}`, X0 + 22, 764, { size: 23, wt: 600, color: th.a, align: 'left', fam: F.display });
  label(ctx, tt, X0 + 22, 796, { size: 18, wt: 700, color: C.ink, align: 'left' });
  para(ctx, S.d, X0 + 22, 808, W - 40, 16.5, { color: C.soft, lh: 25 });
  slider(ctx, P, 's', X0 + 30, 910, W - 60, { title: 'เส้นเวลา (ลากได้เช่นกัน)', value: tt.replace(' หลังเริ่มยุบตัว', '').replace(' (ก่อนยุบตัว)', '') });
  C_STAGES.forEach((g, i) => label(ctx, g.k, X0 + 30 + g.s * (W - 60), 938, { size: 14, wt: i === si ? 700 : 500, color: i === si ? th.a : C.soft }));
  // frost-line comparison
  stitle(ctx, 'แนวน้ำแข็งแบ่งดาวเคราะห์เป็น 2 กลุ่ม', X0, 950, th);
  const bw = (W - 18) / 2;
  [['ด้านในแนวน้ำแข็ง · ร้อน', '#e8590c', 'มีเพียง**หินและโลหะ**ที่ควบแน่นได้ วัตถุดิบน้อย จึงเกิด**ดาวเคราะห์หิน**ขนาดเล็ก หนาแน่น'],
   ['ด้านนอกแนวน้ำแข็ง · เย็น', '#1c7ed6', '**น้ำ มีเทน แอมโมเนีย**แข็งตัวเพิ่มเป็นวัตถุดิบ แกนจึงใหญ่จนดึงแก๊สไว้ได้ เกิด**ดาวเคราะห์ยักษ์**']].forEach(([h, col, tx], i) => {
    const x = X0 + i * (bw + 18);
    ctx.fillStyle = rgba(col, 0.09); rr(ctx, x, 982, bw, 118, 12); ctx.fill();
    ctx.strokeStyle = rgba(col, 0.4); ctx.lineWidth = 1.5; ctx.stroke();
    label(ctx, h, x + 16, 1003, { size: 18, wt: 700, color: col, align: 'left' });
    para(ctx, tx, x + 16, 1016, bw - 30, 16, { lh: 25, bcolor: col });
  });
}

// ============================================================ p22 · zoomable map of the Solar System
const C_ZONES = [
  { n: 'ดาวเคราะห์หิน', a: 0.39, b: 1.52, col: '#f4a261' },
  { n: 'แถบดาวเคราะห์น้อย', a: 2.2, b: 3.2, col: '#c9b79c' },
  { n: 'ดาวเคราะห์แก๊สยักษ์', a: 5.2, b: 9.6, col: '#f0b36b' },
  { n: 'ดาวเคราะห์น้ำแข็งยักษ์', a: 19.2, b: 30.1, col: '#7fd1e8' },
  { n: 'แถบไคเปอร์', a: 30, b: 50, col: '#a5b4fc' },
  { n: 'เมฆออร์ต', a: 2000, b: 100000, col: '#d0bfff' },
];
const C_PLAN = [
  { n: 'ดาวพุธ', e: 'Mercury', au: 0.387, r: 5, col: '#b5a99c', v: -0.35, d: '4,879 km', p: '88 วัน', f: 'ใกล้ดวงอาทิตย์ที่สุด แทบไม่มีบรรยากาศ กลางวันร้อนจัด กลางคืนเย็นจัด' },
  { n: 'ดาวศุกร์', e: 'Venus', au: 0.723, r: 8, col: '#e9cf8f', v: 0.42, d: '12,104 km', p: '225 วัน', f: 'บรรยากาศ CO₂ หนาแน่น เกิดปรากฏการณ์เรือนกระจกรุนแรง ผิวร้อนราว 465 °C' },
  { n: 'โลก', e: 'Earth', au: 1, r: 8, col: '#4dabf7', v: -0.15, d: '12,742 km', p: '365 วัน', f: 'อยู่ในเขตเอื้อต่อชีวิต มีน้ำเป็นของเหลวบนพื้นผิว' },
  { n: 'ดาวอังคาร', e: 'Mars', au: 1.524, r: 6, col: '#e8590c', v: 0.3, d: '6,779 km', p: '687 วัน', f: 'สีแดงจากเหล็กออกไซด์ มีภูเขาไฟโอลิมปัสซึ่งสูงที่สุดในระบบสุริยะ' },
  { n: 'ซีรีส', e: 'Ceres', au: 2.77, r: 4, col: '#adb5bd', v: -0.5, d: '940 km', p: '4.6 ปี', f: 'ดาวเคราะห์แคระที่ใหญ่ที่สุดในแถบดาวเคราะห์น้อย' },
  { n: 'ดาวพฤหัสบดี', e: 'Jupiter', au: 5.2, r: 17, col: '#d9a066', v: 0.12, d: '139,820 km', p: '11.9 ปี', f: 'ใหญ่ที่สุด เป็นแก๊สยักษ์ มีจุดแดงใหญ่ซึ่งเป็นพายุที่ใหญ่กว่าโลก' },
  { n: 'ดาวเสาร์', e: 'Saturn', au: 9.58, r: 14, col: '#e6c88a', v: -0.42, ring: true, d: '116,460 km', p: '29.5 ปี', f: 'แก๊สยักษ์ วงแหวนเป็นน้ำแข็งและหิน ความหนาแน่นเฉลี่ยน้อยกว่าน้ำ' },
  { n: 'ดาวยูเรนัส', e: 'Uranus', au: 19.2, r: 11, col: '#99e9f2', v: 0.36, d: '50,724 km', p: '84 ปี', f: 'น้ำแข็งยักษ์ แกนหมุนเอียงราว 98° จึงหมุนแบบนอนกลิ้ง' },
  { n: 'ดาวเนปจูน', e: 'Neptune', au: 30.1, r: 11, col: '#4c6ef5', v: -0.22, d: '49,244 km', p: '165 ปี', f: 'ดาวเคราะห์ไกลที่สุด ลมแรงที่สุดในระบบสุริยะ กว่า 2,000 km/h' },
  { n: 'พลูโต', e: 'Pluto', au: 39.5, r: 4, col: '#d0bfa8', v: 0.48, d: '2,377 km', p: '248 ปี', f: 'ดาวเคราะห์แคระในแถบไคเปอร์ ถูกจัดเป็นดาวเคราะห์แคระเมื่อปี 2006' },
  { n: 'อีริส', e: 'Eris', au: 67.8, r: 4, col: '#e9ecef', v: -0.5, d: '2,326 km', p: '559 ปี', f: 'ดาวเคราะห์แคระที่อยู่ถัดจากแถบไคเปอร์ มวลมากกว่าพลูโตเล็กน้อย' },
];
const C_DOTS = (() => {
  const r = C_rng(29), out = [];
  for (let i = 0; i < 110; i++) out.push({ d: 2.2 + r() * 1.0, v: r() * 2 - 1, c: '#c9b79c', s: 1.5 });
  for (let i = 0; i < 130; i++) out.push({ d: 30 + r() * 20, v: r() * 2 - 1, c: '#a5b4fc', s: 1.5 });
  for (let i = 0; i < 200; i++) out.push({ d: 2000 * Math.pow(50, r()), v: r() * 2 - 1, c: '#d0bfff', s: 1.4 });
  return out;
})();
const C_ZNAME = [[0.39, 'ภายในวงโคจรดาวพุธ'], [2, 'เขตดาวเคราะห์หิน'], [4.5, 'แถบดาวเคราะห์น้อย'], [14, 'เขตดาวเคราะห์แก๊สยักษ์'], [30.5, 'เขตดาวเคราะห์น้ำแข็งยักษ์'], [55, 'แถบไคเปอร์'], [2000, 'ระหว่างแถบไคเปอร์กับเมฆออร์ต'], [1e9, 'เมฆออร์ต']];
function C_ltime(au) {
  const s = au * 499;
  if (s < 90) return C_sig(s) + ' วินาที'; if (s < 5400) return C_sig(s / 60) + ' นาที';
  if (s < 172800) return C_sig(s / 3600) + ' ชั่วโมง'; if (s < 3.156e7) return C_sig(s / 86400) + ' วัน';
  return C_sig(s / 3.156e7) + ' ปี';
}
function C_km(au) { const m = au * 149.6; return m < 1000 ? C_sig(m) + ' ล้าน km' : m < 1e6 ? C_sig(m / 1000) + ' พันล้าน km' : C_sig(m / 1e6) + ' ล้านล้าน km'; }
function C_dZones(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 236, bot = 680, cy = (top + bot) / 2, sunX = X0 + 34;
  const ZMIN = Math.log10(0.3), ZMAX = 5;
  const R = Math.pow(10, st.z), Wv = X1 - 22 - sunX, k = Wv / R;
  const panDrag = (px, py, phs) => {
    if (phs === 'start') { st._x = px; st._y = py; st._z = st.z; }
    else if (phs === 'move') st.z = clamp(st._z + (-(px - st._x) - (py - st._y)) * 2.6 / W, ZMIN, ZMAX);
  };
  C_open(ctx, X0, top, W, bot - top);
  const band = (a, b, col, alMul) => {
    const ra = a * k, rb = Math.min(b * k, 6000);
    if (ra > Wv + 40) return 0;
    const al = smooth(2, 16, rb - ra) * smooth(-10, 30, Wv - ra) * alMul;
    if (al < 0.02) return 0;
    ctx.beginPath(); ctx.arc(sunX, cy, rb, 0, Math.PI * 2); ctx.moveTo(sunX + Math.max(ra, 0.5), cy); ctx.arc(sunX, cy, Math.max(ra, 0.5), 0, Math.PI * 2, true);
    ctx.fillStyle = rgba(col, 0.14 * al); ctx.fill();
    return al;
  };
  const zl = C_ZONES.map((z, i) => ({ z, i, al: band(z.a, z.b, z.col, 1) }));
  const hz = band(0.95, 1.67, '#51cf66', 1.4);
  // belt dots
  for (const q of C_DOTS) {
    const rp = q.d * k; if (rp < 4 || rp > Wv + 12) continue;
    const dy = q.v * Math.min(rp * 0.92, 205);
    circle(ctx, sunX + Math.sqrt(rp * rp - dy * dy), cy + dy, q.s, rgba(q.c, 0.75));
  }
  // orbits + planets
  ctx.lineWidth = 1.2;
  C_PLAN.forEach((p) => { const rp = p.au * k; if (rp < 5 || rp > 800) return; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(sunX, cy, rp, -Math.PI / 2, Math.PI / 2); ctx.stroke(); });
  const hits = [];
  C_PLAN.forEach((p, i) => {
    const rp = p.au * k, al = smooth(8, 24, rp); if (al < 0.03 || rp > Wv + 6) return;
    const dy = p.v * Math.min(rp * 0.9, 190), x = sunX + Math.sqrt(rp * rp - dy * dy), y = cy + dy;
    if (p.ring) { ctx.strokeStyle = rgba('#f3e2b8', 0.85 * al); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x, y, p.r * 1.9, p.r * 0.55, -0.35, 0, Math.PI * 2); ctx.stroke(); }
    const g = ctx.createRadialGradient(x - p.r * 0.35, y - p.r * 0.35, 1, x, y, p.r);
    g.addColorStop(0, mix(p.col, '#ffffff', 0.45, al)); g.addColorStop(1, mix(p.col, '#000000', 0.25, al));
    circle(ctx, x, y, p.r, g);
    if (st.sel === i) { ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 2.5; ring(ctx, x, y, p.r + 6 + Math.sin(t * 4) * 1.5); }
    const sep = (p.au - (i ? C_PLAN[i - 1].au : 0)) * k, la = al * smooth(26, 46, sep);
    if (la > 0.05) label(ctx, p.n, x, y + p.r + 14, { size: 14, wt: 700, color: `rgba(255,255,255,${0.9 * la})` });
    hits.push({ x: x - p.r - 10, y: y - p.r - 10, w: p.r * 2 + 20, h: p.r * 2 + 20, cursor: 'pointer', drag: panDrag, click: () => { st.sel = i; } });
  });
  // zone labels
  zl.forEach(({ z, i, al }) => {
    if (al < 0.05) return;
    const a = z.a * k, b = Math.min(z.b * k, Wv), span = b - a;
    const la = al * smooth(50, 90, span); if (la < 0.05) return;
    label(ctx, z.n, sunX + (a + b) / 2, top + 26 + (i % 2) * 30, { size: 16, wt: 700, color: mix(z.col, z.col, 0, la), bg: `rgba(11,23,48,${0.7 * la})`, pad: 5 });
  });
  if (hz > 0.05) { const a = 0.95 * k, b = Math.min(1.67 * k, Wv); if (b - a > 70) label(ctx, 'เขตเอื้อต่อชีวิต', sunX + (a + b) / 2, bot - 64, { size: 14, wt: 700, color: mix('#8ce99a', '#8ce99a', 0, hz * smooth(70, 120, b - a)) }); }
  // the Sun (true size, at least 6 px)
  const sR = Math.max(6, 0.00465 * k);
  glow(ctx, sunX, cy, sR * 3 + 30, 'rgba(255,200,80,0.6)');
  circle(ctx, sunX, cy, sR, '#ffd43b');
  label(ctx, 'ดวงอาทิตย์', X0 + 8, cy + sR + 22, { size: 14, wt: 700, color: '#ffe8a3', align: 'left' });
  // scale bar
  let nice = 1; for (const m of [1, 2, 5]) for (let e = -2; e <= 5; e++) { const v = m * Math.pow(10, e); if (v * k >= 90 && v * k <= 230) nice = v; }
  const L = nice * k, bx = X0 + 20, by = bot - 32;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(bx, by - 6); ctx.lineTo(bx, by + 6); ctx.moveTo(bx, by); ctx.lineTo(bx + L, by); ctx.moveTo(bx + L, by - 6); ctx.lineTo(bx + L, by + 6); ctx.stroke();
  label(ctx, `${C_sig(nice, 1)} AU`, bx + L / 2, by - 14, { size: 14, wt: 700, color: '#fff' });
  // next object beyond the edge
  const nx = [...C_PLAN.map(p => [p.n, p.au]), ['เมฆออร์ต', 2000]].find(([, au]) => au * k > Wv + 6);
  const nt = nx ? `ถัดไป: ${nx[0]} ${C_sig(nx[1])} AU ▶` : 'ดาวฤกษ์ที่ใกล้ที่สุดอยู่ไกล 268,000 AU ▶';
  label(ctx, nt, X1 - 14, by, { size: 14, wt: 700, color: 'rgba(255,255,255,0.8)', align: 'right', bg: 'rgba(11,23,48,0.6)', pad: 5 });
  label(ctx, 'ระยะตามมาตราส่วน · ขนาดดาวขยายให้เห็น', cx + 20, bot - 10, { size: 12, wt: 500, color: 'rgba(255,255,255,0.45)' });
  C_close(ctx, X0, top, W, bot - top);
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: 'move', drag: panDrag });
  P.zones.push(...hits);
  hint(ctx, P, 'ลากซ้ายหรือขึ้น = ซูมออก · ลากขวาหรือลง = ซูมเข้า · แตะดาวเพื่อดูข้อมูล', bot + 20);
  // readout
  const zn = C_ZNAME.find(([m]) => R < m)[1];
  C_card(ctx, X0, 722, W, 104, th.a);
  label(ctx, 'ขอบภาพอยู่ที่ ' + zn, X0 + 22, 748, { size: 23, wt: 600, color: th.a, align: 'left', fam: F.display });
  label(ctx, `${C_sig(R)} AU`, X1 - 18, 748, { size: 22, wt: 700, color: C.ink, align: 'right' });
  label(ctx, `≈ ${C_km(R)} · แสงจากดวงอาทิตย์ใช้เวลา ${C_ltime(R)}`, X0 + 22, 780, { size: 18, wt: 600, color: C.ink, align: 'left' });
  label(ctx, '1 AU = ระยะเฉลี่ยโลกถึงดวงอาทิตย์ ≈ 150 ล้าน km · แสงใช้เวลา 8 นาที 20 วินาที', X0 + 22, 807, { size: 15, wt: 500, color: C.soft, align: 'left' });
  slider(ctx, P, 'z', X0 + 40, 880, W - 80, { min: ZMIN, max: ZMAX, title: 'ระดับการซูม (สเกลลอการิทึม)', value: `กว้าง ${C_sig(R)} AU`, left: 'ใกล้ 0.3 AU', right: 'ไกล 100,000 AU' });
  // log strip
  const lx0 = X0 + 14, lx1 = X1 - 14, lxf = (au) => lx0 + (Math.log10(au) + 1) / 6 * (lx1 - lx0), ly = 966;
  label(ctx, 'ขอบภาพอยู่ตรงไหนบนสเกลลอการิทึม (0.1 – 100,000 AU)', X0, 940, { size: 15, wt: 600, color: C.soft, align: 'left' });
  ctx.fillStyle = 'rgba(120,105,80,0.18)'; rr(ctx, lx0, ly - 6, lx1 - lx0, 12, 6); ctx.fill();
  C_ZONES.forEach(z => { ctx.fillStyle = rgba(z.col, 0.9); ctx.fillRect(lxf(z.a), ly - 6, Math.max(3, lxf(z.b) - lxf(z.a)), 12); });
  ctx.fillStyle = rgba(th.a, 0.22); rr(ctx, lx0, ly - 10, lxf(R) - lx0, 20, 6); ctx.fill();
  const mx = lxf(R);
  ctx.fillStyle = th.a; ctx.beginPath(); ctx.moveTo(mx, ly - 8); ctx.lineTo(mx - 8, ly - 20); ctx.lineTo(mx + 8, ly - 20); ctx.closePath(); ctx.fill();
  ctx.fillRect(mx - 1.5, ly - 10, 3, 20);
  [0.1, 1, 10, 100, 1000, 10000, 100000].forEach(v => label(ctx, v.toLocaleString('en-US'), lxf(v), ly + 22, { size: 13, wt: 600, color: C.soft }));
  // fact card
  const sp = C_PLAN[st.sel];
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; rr(ctx, X0, 1004, W, 96, 14); ctx.fill();
  ctx.strokeStyle = rgba(th.a, 0.35); ctx.lineWidth = 1.5; ctx.stroke();
  if (sp) {
    const g = ctx.createRadialGradient(X0 + 40, 1046, 2, X0 + 46, 1052, 22); g.addColorStop(0, mix(sp.col, '#ffffff', 0.45)); g.addColorStop(1, mix(sp.col, '#000000', 0.25));
    circle(ctx, X0 + 46, 1052, 22, g);
    label(ctx, `${sp.n} (${sp.e})`, X0 + 84, 1026, { size: 20, wt: 700, color: C.ink, align: 'left' });
    label(ctx, `${sp.au} AU · เส้นผ่านศูนย์กลาง ${sp.d} · โคจรรอบละ ${sp.p}`, X1 - 16, 1026, { size: 15, wt: 600, color: th.a, align: 'right' });
    para(ctx, sp.f, X0 + 84, 1042, W - 100, 17, { lh: 25 });
  } else {
    label(ctx, 'แตะดาวเคราะห์ในภาพเพื่อดูข้อมูล', X0 + 22, 1030, { size: 20, wt: 700, color: th.a, align: 'left' });
    para(ctx, 'ภาพนี้ย่อ**ระยะทาง**ตามมาตราส่วนจริง แต่ขยาย**ขนาดดาว**ให้มองเห็น ซูมออกจนสุดแล้วดาวเคราะห์ทุกดวงจะรวมเป็นจุดเดียวกับดวงอาทิตย์', X0 + 22, 1046, W - 44, 17, { lh: 25, bcolor: th.a });
  }
}

// ============================================================ p24 · the Sun, solar wind and the magnetosphere
const C_SW = (() => { const r = C_rng(5), o = []; for (let i = 0; i < 90; i++) o.push({ y: r() * 2 - 1, u: r(), sp: 0.8 + r() * 0.4 }); return o; })();
const C_SPOTS = [[-0.3, 0.62], [0.18, 0.7], [-0.05, 0.84], [0.38, 0.6], [-0.48, 0.74], [0.05, 0.55], [0.28, 0.86]];
const C_LEVELS = [
  { n: 'สงบ (quiet)', col: '#2b8a3e', fx: ['ลมสุริยะพัดตามปกติ แมกนีโตสเฟียร์เบี่ยงอนุภาคออกได้', 'ออโรราจาง ๆ เห็นได้เฉพาะใกล้ขั้วโลก', 'ดาวเทียม GPS และวิทยุทำงานปกติ'] },
  { n: 'พายุเล็กน้อย (minor)', col: '#d9480f', fx: ['ระบบไฟฟ้ากำลังผันผวนเล็กน้อย', 'ดาวเทียมได้รับผลกระทบเล็กน้อย', 'ออโรราสว่างขึ้นในละติจูดสูง เช่น แคนาดา นอร์เวย์'] },
  { n: 'พายุรุนแรง (strong)', col: '#e8590c', fx: ['GPS คลาดเคลื่อน วิทยุคลื่นสั้น (HF) ขัดข้องเป็นช่วง ๆ', 'ดาวเทียมถูกแรงต้านบรรยากาศเพิ่ม ต้องปรับวงโคจร', 'ออโรราเห็นได้ถึงละติจูดกลาง'] },
  { n: 'พายุรุนแรงมาก (extreme)', col: '#c92a2a', fx: ['วิทยุ HF ดับหลายชั่วโมง GPS ใช้งานไม่ได้', 'หม้อแปลงไฟฟ้าเสียหาย ไฟดับเป็นวงกว้าง', 'นักบินอวกาศต้องหลบรังสี ออโรราเห็นได้ใกล้เขตร้อน'] },
];
function C_ssn(y) {
  const cyc = (m0, p, m1, A) => (y < m0 || y > m1) ? 0 : y < p ? A * Math.sin(Math.PI / 2 * (y - m0) / (p - m0)) ** 2 : A * Math.cos(Math.PI / 2 * (y - p) / (m1 - p)) ** 2;
  return 2 + cyc(2008.9, 2014.3, 2019.9, 114) + cyc(2019.9, 2024.8, 2030.8, 158);
}
function C_dStorm(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 236, bot = 676, cy = 456, a = st.a;
  const sx = X0 - 70, SR = 200, sEdge = sx + SR, ex = X1 - 150, Re = 15;
  // CME timing
  const cmeOn = smooth(0.42, 0.6, a), T = lerp(7, 3, smooth(0.45, 1, a)), cu = mod1(t / T + 0.3);
  let r0 = Re * lerp(10.5, 5.8, a);
  if (cmeOn > 0 && cu > 0.82) r0 *= 1 - 0.1 * cmeOn * Math.sin(Math.PI * clamp((cu - 0.82) / 0.18, 0, 1));
  const yb = (dx) => Math.sqrt(Math.max(0, 2.4 * r0 * (dx + r0)));
  C_open(ctx, X0, top, W, bot - top);
  // Sun
  glow(ctx, sx, cy, SR + 50 + 80 * a, rgba('#ffa94d', 0.35 + 0.35 * a));
  const sg = ctx.createRadialGradient(sx, cy, 10, sx, cy, SR);
  sg.addColorStop(0, '#fff4c2'); sg.addColorStop(0.7, '#ffb238'); sg.addColorStop(1, '#f76707');
  circle(ctx, sx, cy, SR, sg);
  const ns = Math.round(7 * a);
  for (let i = 0; i < ns; i++) {
    const [an, f] = C_SPOTS[i], x = sx + SR * f * Math.cos(an), y = cy + SR * f * Math.sin(an) * 1.6, rs = 4 + (i % 3) * 2;
    circle(ctx, x, y, rs * 1.7, 'rgba(160,70,10,0.55)'); circle(ctx, x, y, rs, '#5c2a06');
    const fl = Math.pow(Math.max(0, Math.sin(t * (0.9 + i * 0.37) + i * 2)), 14) * smooth(0.3, 0.8, a);
    if (fl > 0.02) glow(ctx, x, y, 12 + 34 * fl, `rgba(255,255,255,${0.95 * fl})`);
  }
  for (let i = 0; i < Math.round(3 * a); i++) {
    const an = [-0.42, 0.12, 0.5][i], h = 26 + 40 * a + 6 * Math.sin(t * 1.3 + i);
    const p1 = [sx + SR * Math.cos(an - 0.07), cy + SR * Math.sin(an - 0.07)], p2 = [sx + SR * Math.cos(an + 0.07), cy + SR * Math.sin(an + 0.07)];
    ctx.strokeStyle = 'rgba(255,107,107,0.85)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(...p1);
    ctx.quadraticCurveTo(sx + (SR + h * 1.3) * Math.cos(an), cy + (SR + h * 1.3) * Math.sin(an), ...p2); ctx.stroke();
  }
  // bow shock + magnetopause
  const ymax = Math.sqrt(2.4 * r0 * (X1 + 10 - ex + r0));
  ctx.strokeStyle = 'rgba(255,192,120,0.3)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 6]); ctx.beginPath();
  for (let y = -ymax * 1.3; y <= ymax * 1.3; y += 8) { const x = ex - r0 * 1.35 + y * y / (3.4 * r0); y === -ymax * 1.3 ? ctx.moveTo(x, cy + y) : ctx.lineTo(x, cy + y); }
  ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath();
  for (let y = -ymax; y <= ymax; y += 6) { const x = ex - r0 + y * y / (2.4 * r0); y === -ymax ? ctx.moveTo(x, cy + y) : ctx.lineTo(x, cy + y); }
  ctx.fillStyle = 'rgba(116,192,252,0.08)'; ctx.fill();
  ctx.strokeStyle = 'rgba(116,192,252,0.85)'; ctx.lineWidth = 2.5; ctx.setLineDash([10, 7]); ctx.lineDashOffset = -t * 12; ctx.stroke(); ctx.setLineDash([]);
  // dipole field lines (dayside compressed, nightside stretched)
  const kd = r0 / (10.5 * Re);
  ctx.strokeStyle = 'rgba(116,192,252,0.6)'; ctx.lineWidth = 1.6;
  for (const L of [2, 3, 4.3, 6, 7.8]) {
    const lm = Math.acos(Math.sqrt(1 / L));
    for (const side of [-1, 1]) {
      if (side > 0 && L >= 6) continue;
      const kn = 1 + 0.18 * L / 8 + 0.3 * a * L / 8;
      ctx.beginPath();
      for (let k = 0; k <= 30; k++) {
        const lam = -lm + 2 * lm * k / 30, r = L * Math.cos(lam) ** 2, X = side * r * Math.cos(lam) * (side < 0 ? kd : kn), Y = r * Math.sin(lam);
        k ? ctx.lineTo(ex + X * Re, cy - Y * Re) : ctx.moveTo(ex + X * Re, cy - Y * Re);
      }
      ctx.stroke();
    }
  }
  for (const sg2 of [-1, 1]) for (let i = 0; i < 3; i++) {
    const yt = (34 + i * 30) * (1 - 0.25 * a);
    ctx.beginPath(); ctx.moveTo(ex + 3, cy + sg2 * Re * 0.85);
    ctx.bezierCurveTo(ex + 10, cy + sg2 * (Re * 3 + i * 26), ex + 90, cy + sg2 * yt, X1 + 10, cy + sg2 * yt); ctx.stroke();
  }
  // GEO orbit
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.3; ctx.setLineDash([3, 5]); ring(ctx, ex, cy, 6.6 * Re); ctx.setLineDash([]);
  label(ctx, 'วงโคจรค้างฟ้า (GEO)', ex + 20, cy + 6.6 * Re + 13, { size: 13, wt: 600, color: 'rgba(255,255,255,0.7)' });
  // solar wind particles
  const n = Math.round(30 + 60 * a), vis = 0.1 + 0.16 * a, len = 6 + 16 * a;
  ctx.strokeStyle = 'rgba(255,216,168,0.8)'; ctx.lineWidth = 1.5 + 1.5 * a; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const q = C_SW[i], u = mod1(q.u + t * vis * q.sp), x = sEdge - 10 + u * (X1 + 30 - sEdge);
    let y = q.y * 215; const dx = x - ex;
    if (dx > -r0) { const b = yb(dx) + 5; if (Math.abs(y) < b) y = (y >= 0 ? 1 : -1) * b; }
    ctx.moveTo(x - len, cy + y); ctx.lineTo(x, cy + y);
  }
  ctx.stroke(); ctx.lineCap = 'butt';
  // CME bubble
  if (cmeOn > 0.01) {
    const D = ex - r0 - sEdge + 10, fx = sEdge + cu * D, al = cmeOn * (1 - smooth(0.86, 1, cu)), rx = 18 + 40 * cu, ry = 50 + 110 * cu;
    ctx.strokeStyle = `rgba(255,146,43,${0.75 * al})`; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.ellipse(fx - rx, cy - 10, rx, ry, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.strokeStyle = `rgba(255,236,153,${0.9 * al})`; ctx.lineWidth = 3; ctx.stroke();
    if (al > 0.2) label(ctx, 'CME', fx + 8, cy - 10 - ry * 0.6, { size: 15, wt: 700, color: `rgba(255,224,102,${al})`, align: 'left' });
  }
  // Earth + aurora
  globe(ctx, ex, cy, Re);
  ctx.fillStyle = 'rgba(0,0,20,0.45)'; ctx.beginPath(); ctx.arc(ex, cy, Re, -Math.PI / 2, Math.PI / 2); ctx.fill();
  const fl = 0.85 + 0.15 * Math.sin(t * 6);
  for (const sg2 of [-1, 1]) {
    const y = cy + sg2 * Re * (0.95 - 0.25 * a), w = Re * (0.5 + 0.45 * a);
    glow(ctx, ex, y, 8 + 22 * a, `rgba(81,207,102,${(0.25 + 0.7 * a) * fl})`);
    if (a > 0.75) glow(ctx, ex, y + sg2 * 6, 10 + 20 * a, `rgba(255,107,107,${(a - 0.75) * 2 * fl})`);
    ctx.strokeStyle = `rgba(178,242,187,${0.4 + 0.6 * a})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(ex, y, w, 2 + 3 * a, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // labels
  label(ctx, 'ดวงอาทิตย์', X0 + 62, bot - 26, { size: 15, wt: 700, color: '#fff', bg: 'rgba(11,23,48,0.55)', pad: 5 });
  label(ctx, 'ลมสุริยะ ▶', (sEdge + ex - r0) / 2 + 10, top + 26, { size: 15, wt: 700, color: '#ffd8a8', bg: 'rgba(11,23,48,0.6)', pad: 5 });
  label(ctx, 'โลก', ex, cy + Re + 16, { size: 14, wt: 700, color: '#fff' });
  label(ctx, 'ออโรรา', ex + 30, cy - Re - 12, { size: 13, wt: 700, color: '#b2f2bb', align: 'left' });
  label(ctx, 'แมกนีโตพอส', ex - r0 + 200 * 200 / (2.4 * r0) - 4, top + 26, { size: 14, wt: 700, color: '#a5d8ff', align: 'right', bg: 'rgba(11,23,48,0.6)', pad: 5 });
  label(ctx, 'แมกนีโตสเฟียร์', ex + 70, cy + 6.6 * Re + 40, { size: 14, wt: 700, color: '#a5d8ff' });
  label(ctx, 'ไม่ตามมาตราส่วน', X1 - 14, bot - 16, { size: 12, wt: 500, color: 'rgba(255,255,255,0.45)', align: 'right' });
  label(ctx, '◀ สงบ', X0 + 160, bot - 26, { size: 14, wt: 700, color: 'rgba(255,255,255,0.75)', align: 'left' });
  label(ctx, 'รุนแรง ▶', X1 - 150, bot - 26, { size: 14, wt: 700, color: 'rgba(255,255,255,0.75)', align: 'right' });
  if (r0 < 6.6 * Re) label(ctx, 'แมกนีโตพอสถูกบีบเข้ามาในวงโคจร GEO', ex - 30, top + 60, { size: 14, wt: 700, color: '#ffc9c9', bg: 'rgba(201,42,42,0.55)', pad: 5 });
  C_close(ctx, X0, top, W, bot - top);
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: 'ew-resize', drag: (px, py, phs) => {
    if (phs === 'start') { st._x = px; st._a = st.a; } else if (phs === 'move') st.a = clamp(st._a + (px - st._x) / (W * 0.8), 0, 1);
  } });
  hint(ctx, P, 'ลากบนดวงอาทิตย์หรือในภาพไปทางขวา ดวงอาทิตย์จะปั่นป่วนขึ้น', bot + 20);
  // readout
  const kp = Math.round(a * 9), lv = C_LEVELS[kp < 5 ? 0 : kp === 5 ? 1 : kp <= 7 ? 2 : 3];
  const speed = Math.round((400 + 400 * a) / 10) * 10;
  C_card(ctx, X0, 716, W, 148, lv.col);
  label(ctx, lv.n, X0 + 22, 742, { size: 24, wt: 600, color: lv.col, align: 'left', fam: F.display });
  label(ctx, `ลมสุริยะ ~${speed} km/s · Kp ${kp}` + (kp >= 5 ? ` (G${kp - 4})` : ''), X1 - 18, 742, { size: 19, wt: 700, color: C.ink, align: 'right' });
  let y = 760;
  for (const f of lv.fx) { circle(ctx, X0 + 30, y + 13, 4, lv.col); y = para(ctx, f, X0 + 44, y, W - 64, 18, { lh: 27 }); }
  if (cmeOn > 0.5) label(ctx, 'CME พุ่งเร็วได้ถึง 1,000–3,000 km/s', X1 - 18, 846, { size: 15, wt: 600, color: lv.col, align: 'right' });
  slider(ctx, P, 'a', X0 + 40, 914, W - 80, { title: 'ระดับกิจกรรมของดวงอาทิตย์', value: lv.n.split(' (')[0], col: lv.col, left: 'สงบ', right: 'พายุรุนแรงมาก' });
  // sunspot cycle
  const gx0 = X0 + 46, gx1 = X1 - 16, gy0 = 990, gy1 = 1072, yx = (yr) => gx0 + (yr - 2008) / 23 * (gx1 - gx0), vy = (v) => gy1 - v / 170 * (gy1 - gy0);
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; rr(ctx, X0, 950, W, 150, 14); ctx.fill();
  label(ctx, 'วัฏจักรจุดมืดดวงอาทิตย์ ~11 ปี (ค่าเฉลี่ยโดยประมาณ)', X0 + 16, 968, { size: 16, wt: 700, color: th.a, align: 'left' });
  ctx.save(); ctx.translate(X0 + 20, (gy0 + gy1) / 2); ctx.rotate(-Math.PI / 2); label(ctx, 'จำนวนจุดมืด', 0, 0, { size: 12, wt: 600, color: C.soft }); ctx.restore();
  ctx.strokeStyle = 'rgba(80,70,50,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
  ctx.beginPath(); for (let yr = 2008; yr <= 2031; yr += 0.1) { const x = yx(yr), v = vy(C_ssn(yr)); yr === 2008 ? ctx.moveTo(x, v) : ctx.lineTo(x, v); }
  ctx.lineTo(gx1, gy1); ctx.lineTo(gx0, gy1); ctx.closePath(); ctx.fillStyle = rgba(th.a, 0.18); ctx.fill();
  ctx.beginPath(); for (let yr = 2008; yr <= 2031; yr += 0.1) { const x = yx(yr), v = vy(C_ssn(yr)); yr === 2008 ? ctx.moveTo(x, v) : ctx.lineTo(x, v); }
  ctx.strokeStyle = th.a; ctx.lineWidth = 2.5; ctx.stroke();
  [2010, 2015, 2020, 2025, 2030].forEach(yr => label(ctx, String(yr), yx(yr), 1086, { size: 13, wt: 600, color: C.soft }));
  label(ctx, 'สูงสุด', yx(2014.3), vy(118) - 10, { size: 13, wt: 700, color: th.a });
  label(ctx, 'ต่ำสุด', yx(2019.9), vy(4) - 12, { size: 13, wt: 700, color: th.a });
  label(ctx, 'พ.ค. 2024 พายุระดับ G5', yx(2024.4) - 8, vy(160) - 6, { size: 13, wt: 700, color: '#c92a2a', align: 'right' });
  circle(ctx, yx(2024.37), vy(C_ssn(2024.37)), 4.5, '#c92a2a');
  const dy = 2008 + mod1(t * 0.04) * 23; circle(ctx, yx(dy), vy(C_ssn(dy)), 5, '#fff'); ctx.strokeStyle = th.a; ctx.lineWidth = 2.5; ring(ctx, yx(dy), vy(C_ssn(dy)), 5);
}

// ============================================================ p26 · the electromagnetic spectrum and atmospheric windows
const C_BANDS = [
  { n: 'รังสีแกมมา', e: 'gamma ray', s: 'γ', a: -12, b: -11, col: '#e64980', tc: '#c2255c', tel: 'Fermi (อวกาศ)', see: 'การระเบิดรังสีแกมมา พัลซาร์ และหลุมดำมวลยิ่งยวด', sat: true },
  { n: 'รังสีเอกซ์', e: 'X-ray', s: 'X', a: -11, b: -8, col: '#9c36b5', tc: '#862e9c', tel: 'Chandra (อวกาศ)', see: 'แก๊สร้อนหลายล้านเคลวิน รอบหลุมดำ และซากซูเปอร์โนวา', sat: true },
  { n: 'อัลตราไวโอเลต', e: 'ultraviolet', s: 'UV', a: -8, b: -6.398, col: '#7048e8', tc: '#5f3dc4', tel: 'Hubble 2.4 m (อวกาศ)', see: 'ดาวฤกษ์ร้อนอายุน้อย และบริเวณที่กำลังเกิดดาว', sat: true },
  { n: 'แสงที่ตามองเห็น', e: 'visible light', s: 'แสง', a: -6.398, b: -6.155, col: '#fab005', tc: '#b07400', tel: 'ELT 39 m (กำลังสร้าง ชิลี) · Rubin 8.4 m · TNT 2.4 m ดอยอินทนนท์', see: 'ดาวฤกษ์ เนบิวลา กาแล็กซี ดาวเคราะห์ และวัตถุที่เปลี่ยนแปลงบนท้องฟ้า' },
  { n: 'อินฟราเรด', e: 'infrared', s: 'IR', a: -6.155, b: -3, col: '#e03131', tc: '#c92a2a', tel: 'James Webb 6.5 m · Euclid · Roman (กำหนดส่งราว 2026–2027)', see: 'ดาวที่กำลังเกิดหลังม่านฝุ่น กาแล็กซีไกลมาก และแผนที่สสารมืด', sat: true },
  { n: 'ไมโครเวฟ', e: 'microwave', s: 'ไมโครเวฟ', a: -3, b: -1, col: '#f08c00', tc: '#d9480f', tel: 'ALMA (ที่สูงแห้ง ชิลี) · Event Horizon Telescope', see: 'รังสีไมโครเวฟพื้นหลังของเอกภพ แก๊สเย็น และเงาหลุมดำ M87* (2019)', dish: true },
  { n: 'คลื่นวิทยุ', e: 'radio', s: 'วิทยุ', a: -1, b: 2, col: '#2f9e44', tc: '#2b8a3e', tel: 'FAST 500 m (จีน) · SKA (กำลังสร้าง) · TNRT 40 m เชียงใหม่', see: 'พัลซาร์ ไฮโดรเจนเส้น 21 cm และเจ็ตจากหลุมดำ', dish: true },
];
function C_trans(L) {
  const g = (c, w) => Math.exp(-(((L - c) / w) ** 2)), win = (a0, a1, b0, b1) => smooth(a0, a1, L) * (1 - smooth(b0, b1, L));
  let T = 0.85 * win(-6.53, -6.42, -5.33, -5.28) * (1 - 0.65 * g(-5.854, 0.02) - 0.75 * g(-5.72, 0.025) - 0.8 * g(-5.57, 0.035) - 0.85 * g(-5.367, 0.015));
  T += 0.6 * win(-5.11, -5.08, -4.9, -4.87) * (1 - 0.45 * g(-5.018, 0.008));
  T += 0.15 * g(-3.46, 0.02) + 0.2 * g(-3.35, 0.02) + 0.3 * g(-3.07, 0.04);
  T += (0.3 + 0.7 * smooth(-2.95, -1.9, L)) * win(-3.03, -2.97, 1.0, 1.5) * (1 - 0.5 * g(-2.3, 0.025) - 0.15 * g(-1.87, 0.02));
  return clamp(T, 0, 1);
}
function C_absAlt(L) { if (L > 0.9) return 110; if (L < -8) return 70; if (L < -6.4) return lerp(110, 30, smooth(-8, -6.6, L)); return 6; }
function C_lam(L) {
  const m = Math.pow(10, L), u = m < 1e-9 ? [1e-12, 'pm'] : m < 1e-6 ? [1e-9, 'nm'] : m < 1e-3 ? [1e-6, 'µm'] : m < 1e-2 ? [1e-3, 'mm'] : m < 1 ? [1e-2, 'cm'] : [1, 'm'];
  return C_sig(m / u[0]) + ' ' + u[1];
}
function C_dSpectrum(ctx, t, P) {
  const { X0, X1, cx, th, st } = P, W = X1 - X0, top = 236, bot = 716;
  const gx0 = X0 + 24, gx1 = X1 - 24, Lx = (L) => gx0 + (L + 12) / 14 * (gx1 - gx0);
  const L = -12 + st.w * 14, mx = Lx(L), T = C_trans(L), B = C_BANDS.find(b => L < b.b) || C_BANDS[6];
  const gnd = 452, altY = (h) => gnd - h / 120 * 190;
  C_open(ctx, X0, top, W, bot - top);
  // sky
  const sky = ctx.createLinearGradient(0, top, 0, gnd); sky.addColorStop(0, 'rgba(20,37,74,0)'); sky.addColorStop(0.55, 'rgba(36,76,140,0.6)'); sky.addColorStop(1, 'rgba(111,168,220,0.95)');
  ctx.fillStyle = sky; ctx.fillRect(X0, top, W, gnd - top);
  ctx.fillStyle = 'rgba(140,233,154,0.12)'; ctx.fillRect(X0, altY(120), W, altY(95) - altY(120));
  ctx.fillStyle = 'rgba(208,191,255,0.16)'; ctx.fillRect(X0, altY(50), W, altY(20) - altY(50));
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(X0, altY(10), W, gnd - altY(10));
  label(ctx, 'ไอโอโนสเฟียร์', X1 - 12, altY(108), { size: 13, wt: 700, color: '#b2f2bb', align: 'right' });
  label(ctx, 'ชั้นโอโซน', X1 - 12, altY(35), { size: 13, wt: 700, color: '#e5dbff', align: 'right' });
  label(ctx, 'ไอน้ำ', X1 - 12, altY(5), { size: 13, wt: 700, color: '#fff', align: 'right' });
  [[100, '100 km'], [50, '50 km'], [10, '10 km']].forEach(([h, s]) => { label(ctx, s, X0 + 10, altY(h), { size: 12, wt: 600, color: 'rgba(255,255,255,0.6)', align: 'left' }); });
  ctx.fillStyle = '#6b5a3e'; ctx.fillRect(X0, gnd, W, 18); ctx.fillStyle = '#7f9a4d'; ctx.fillRect(X0, gnd, W, 4);
  // photon packet
  const yA = altY(C_absAlt(L)), lpx = lerp(8, 34, st.w), u = mod1(t * 0.42), head = lerp(top + 6, gnd, u);
  const blocked = T < 0.08;
  ctx.strokeStyle = B.col === '#fab005' ? '#ffe066' : B.col; ctx.lineWidth = 3; ctx.beginPath();
  let started = false;
  for (let y = head - 70; y <= head; y += 1.5) {
    if (y < top) continue;
    const amp = y < yA ? 8 : 8 * lerp(1, T, smooth(yA, yA + 50, y));
    if (blocked && y > yA + 10) break;
    const x = mx + amp * Math.sin((y - t * 60) / lpx * Math.PI * 2);
    started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true;
  }
  ctx.stroke();
  if (blocked && head > yA) glow(ctx, mx, yA, 26, `rgba(255,240,200,${0.8 * (1 - smooth(yA, yA + 90, head))})`);
  // telescopes
  if (T > 0.12) {
    const tx = clamp(mx + 40, X0 + 30, X1 - 30);
    if (B.dish) {
      ctx.strokeStyle = '#e9ecef'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(tx, gnd - 26, 18, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, gnd - 10); ctx.lineTo(tx, gnd); ctx.stroke();
    } else {
      ctx.fillStyle = '#e9ecef'; ctx.beginPath(); ctx.arc(tx, gnd - 2, 16, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#495057'; ctx.fillRect(tx - 3, gnd - 18, 6, 10);
    }
    label(ctx, 'กล้องบนพื้นโลก', tx + 26, gnd - 12, { size: 13, wt: 700, color: '#fff', align: 'left', bg: 'rgba(11,23,48,0.55)', pad: 4 });
  }
  if (T < 0.6) {
    const tx = clamp(mx + 60, X0 + 40, X1 - 150), ty = top + 20;
    ctx.fillStyle = '#ced4da'; ctx.fillRect(tx - 7, ty - 12, 14, 24);
    ctx.fillStyle = '#4dabf7'; ctx.fillRect(tx - 30, ty - 6, 20, 12); ctx.fillRect(tx + 10, ty - 6, 20, 12);
    label(ctx, 'กล้องในอวกาศ', tx + 38, ty, { size: 13, wt: 700, color: '#fff', align: 'left' });
  }
  // transmission curve
  const gy0 = 498, gy1 = 600, ty = (v) => gy1 - v * (gy1 - gy0);
  label(ctx, 'ส่วนที่ผ่านบรรยากาศถึงพื้นโลก', gx0, 484, { size: 14, wt: 700, color: 'rgba(255,255,255,0.85)', align: 'left' });
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx1, gy0); ctx.moveTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
  label(ctx, '100%', gx1, gy0 - 9, { size: 11, wt: 600, color: 'rgba(255,255,255,0.55)', align: 'right' });
  ctx.beginPath(); ctx.moveTo(gx0, gy1);
  for (let k = 0; k <= 280; k++) { const l = -12 + k / 280 * 14; ctx.lineTo(Lx(l), ty(C_trans(l))); }
  ctx.lineTo(gx1, gy1); ctx.closePath(); ctx.fillStyle = 'rgba(116,192,252,0.35)'; ctx.fill();
  ctx.strokeStyle = '#a5d8ff'; ctx.lineWidth = 2; ctx.stroke();
  label(ctx, 'หน้าต่างแสง', Lx(-6.3), ty(0.9) - 8, { size: 13, wt: 700, color: '#ffe066' });
  label(ctx, 'หน้าต่างวิทยุ', Lx(0), ty(1) - 8, { size: 13, wt: 700, color: '#b2f2bb' });
  // spectrum bar
  const by = 612;
  for (const b of C_BANDS) {
    const x0 = Lx(b.a), x1 = Lx(b.b);
    if (b.s === 'แสง') { const g = ctx.createLinearGradient(x0, 0, x1, 0); ['#7b2ff7', '#2f6bff', '#22c55e', '#facc15', '#f97316', '#ef4444'].forEach((c, i) => g.addColorStop(i / 5, c)); ctx.fillStyle = g; }
    else ctx.fillStyle = rgba(b.col, 0.85);
    ctx.fillRect(x0, by, x1 - x0, 24);
    label(ctx, b.s, (x0 + x1) / 2, by + 42, { size: 14, wt: B === b ? 700 : 600, color: B === b ? '#fff' : 'rgba(255,255,255,0.7)' });
  }
  [[-12, '1 pm'], [-9, '1 nm'], [-6, '1 µm'], [-3, '1 mm'], [0, '1 m']].forEach(([l, s]) => {
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(Lx(l) - 0.75, by + 24, 1.5, 6);
    label(ctx, s, Lx(l), by + 66, { size: 12, wt: 600, color: 'rgba(255,255,255,0.6)' });
  });
  label(ctx, '◀ คลื่นสั้น พลังงานสูง', X0 + 14, bot - 16, { size: 14, wt: 700, color: 'rgba(255,255,255,0.75)', align: 'left' });
  label(ctx, 'คลื่นยาว พลังงานต่ำ ▶', X1 - 14, bot - 16, { size: 14, wt: 700, color: 'rgba(255,255,255,0.75)', align: 'right' });
  // marker
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(mx, gy0 - 4); ctx.lineTo(mx, by + 24); ctx.stroke(); ctx.setLineDash([]);
  circle(ctx, mx, ty(T), 6, '#fff');
  circle(ctx, mx, by + 12, 15, '#fff'); ctx.strokeStyle = th.a; ctx.lineWidth = 4; ring(ctx, mx, by + 12, 15);
  chevron(ctx, mx - 26, by + 12, Math.PI, '#fff', 8); chevron(ctx, mx + 26, by + 12, 0, '#fff', 8);
  C_close(ctx, X0, top, W, bot - top);
  P.zones.push({ x: X0, y: top, w: W, h: bot - top, cursor: 'ew-resize', drag: (px) => { st.w = clamp((px - gx0) / (gx1 - gx0), 0, 1); } });
  hint(ctx, P, 'ลากซ้าย–ขวาในภาพเพื่อเลือกความยาวคลื่น', bot + 20);
  // readout
  const radioCut = L > 1.1;
  const [stt, sc] = radioCut ? ['ไอโอโนสเฟียร์สะท้อนกลับ ต้องรับนอกโลก', '#c92a2a'] : T > 0.6 ? ['✓ ผ่านบรรยากาศถึงพื้นโลก ใช้กล้องบนพื้นโลกได้', '#2b8a3e'] : T > 0.12 ? ['ผ่านได้บางส่วน ใช้กล้องบนที่สูงและแห้ง หรือในอวกาศ', '#e67700'] : ['✗ บรรยากาศดูดกลืน ต้องใช้กล้องในอวกาศ', '#c92a2a'];
  C_card(ctx, X0, 756, W, 158, B.col);
  label(ctx, `${B.n} (${B.e})`, X0 + 22, 782, { size: 24, wt: 600, color: B.tc, align: 'left', fam: F.display });
  label(ctx, `λ ≈ ${C_lam(L)} · ผ่าน ${Math.round(T * 100)}%`, X1 - 18, 782, { size: 20, wt: 700, color: C.ink, align: 'right' });
  label(ctx, stt, X0 + 22, 814, { size: 19, wt: 700, color: sc, align: 'left' });
  let y = para(ctx, '**ตัวอย่างกล้อง:** ' + B.tel, X0 + 22, 828, W - 40, 17, { lh: 25, bcolor: B.tc });
  para(ctx, '**สิ่งที่เห็น:** ' + B.see, X0 + 22, y, W - 40, 17, { lh: 25, bcolor: B.tc });
  // light-gathering comparison
  stitle(ctx, 'พื้นที่รับแสงเทียบกับตาคน (∝ D²)', X0, 922, th);
  const sc2 = 16, ry = 1006;
  circle(ctx, X0 + 70, ry, 2.5, C.ink); ctx.strokeStyle = rgba(th.a, 0.5); ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ring(ctx, X0 + 70, ry, 12); ctx.setLineDash([]);
  label(ctx, 'ตาคน 7 mm', X0 + 70, 1070, { size: 15, wt: 700, color: C.ink }); label(ctx, '1 เท่า', X0 + 70, 1092, { size: 14, wt: 600, color: C.soft });
  const tx = X0 + 220, tg = ctx.createRadialGradient(tx - 6, ry - 6, 2, tx, ry, 1.2 * sc2);
  tg.addColorStop(0, '#f1f3f5'); tg.addColorStop(1, '#868e96'); circle(ctx, tx, ry, 1.2 * sc2, tg); circle(ctx, tx, ry, 4, '#343a40');
  label(ctx, 'TNT · Hubble 2.4 m', tx, 1070, { size: 15, wt: 700, color: C.ink }); label(ctx, `≈ ${C_sig((2400 / 7) ** 2)} เท่า`, tx, 1092, { size: 14, wt: 600, color: th.a });
  const jx = X0 + 430, d = 1.32 * sc2;
  let hi = 0;
  for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) {
    if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) === 0 || Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) > 2) continue;
    const hx = jx + d * (q + r / 2), hy = ry + d * r * Math.sqrt(3) / 2, R = d / Math.sqrt(3) * 0.94;
    ctx.beginPath(); for (let k = 0; k < 6; k++) { const an = Math.PI / 6 + k * Math.PI / 3; k ? ctx.lineTo(hx + R * Math.cos(an), hy + R * Math.sin(an)) : ctx.moveTo(hx + R * Math.cos(an), hy + R * Math.sin(an)); }
    ctx.closePath(); ctx.fillStyle = mix('#d4a017', '#ffe8a3', 0.3 + 0.3 * Math.sin(t * 1.5 + hi++ * 0.7)); ctx.fill();
  }
  label(ctx, 'James Webb 6.5 m', jx, 1070, { size: 15, wt: 700, color: C.ink }); label(ctx, `≈ ${C_sig((6500 / 7) ** 2)} เท่า`, jx, 1092, { size: 14, wt: 600, color: th.a });
  para(ctx, 'D ใหญ่ขึ้น 2 เท่า รับแสงได้ **4 เท่า** เห็นวัตถุจางลงและแยกรายละเอียดได้ดีขึ้น · ELT 39 m จะรับแสงได้ราว **31 ล้านเท่า**ของตา', X0 + 530, 952, W - 530, 16, { lh: 25, bcolor: th.a });
}

const PART_C = [
  { th: TH.solar, title: 'กำเนิดระบบสุริยะ', sub: 'Solar nebula theory', blocks: [
    { p: 'นักวิทยาศาสตร์อธิบายการเกิดระบบสุริยะด้วย**ทฤษฎีเนบิวลาสุริยะ (solar nebula theory)** เมื่อประมาณ **4,600 ล้านปีก่อน** เมฆแก๊สไฮโดรเจน ฮีเลียม และฝุ่นในอวกาศเริ่มยุบตัว ซึ่งอาจถูกกระตุ้นด้วยคลื่นกระแทกจากซูเปอร์โนวาที่อยู่ใกล้เคียง' },
    { h: 'ลำดับการเกิด' },
    { li: [
      '**ยุบตัวและหมุนเร็วขึ้น** แรงโน้มถ่วงดึงมวลเข้าหาศูนย์กลาง เมฆหมุนเร็วขึ้นแล้วแบนลงเป็น**จานรอบดาวฤกษ์เกิดใหม่ (protoplanetary disc)**',
      '**ดาวฤกษ์ก่อนเกิด (protosun)** มวลกว่า 99.8% รวมอยู่ที่ใจกลาง ร้อนและหนาแน่นขึ้นจนเกิด**ฟิวชัน**ไฮโดรเจนเป็นฮีเลียม กลายเป็นดวงอาทิตย์',
      '**ดาวเคราะห์ตั้งต้น (planetesimal)** ฝุ่นชนและเกาะกันเป็นก้อนขนาดหลายกิโลเมตร แล้วรวมกันเป็น**ดาวเคราะห์ก่อนเกิด (protoplanet)**',
      '**ลมสุริยะ**จากดวงอาทิตย์ที่เพิ่งเกิดพัดแก๊สที่เหลือออกไป เศษที่เหลือกลายเป็น**ดาวเคราะห์น้อยและดาวหาง**',
    ] },
    { box: '**แนวน้ำแข็ง (frost line)** อยู่ราว 3–5 AU ด้านในร้อน มีเพียงหินและโลหะที่ควบแน่นได้ จึงเกิด**ดาวเคราะห์หิน**ขนาดเล็ก ด้านนอกเย็นพอให้น้ำ มีเทน และแอมโมเนียแข็งตัว แกนดาวจึงใหญ่และดึงแก๊สไว้ได้มาก เกิด**ดาวเคราะห์แก๊สยักษ์และน้ำแข็งยักษ์**' },
    { p: '**หลักฐาน** ดาวเคราะห์โคจรทางเดียวกันในระนาบใกล้กัน และพบจานฝุ่นรอบดาวฤกษ์อายุน้อยจริง' },
  ] },
  { kind: 'diagram', th: TH.solar, title: 'จากเมฆฝุ่นสู่ดาวเคราะห์', sub: 'ภาพโต้ตอบ: ลากเพื่อเดินเวลา', draw: C_dNebula, init: () => ({ s: 0 }) },
  { th: TH.solar, title: 'เขตบริวารของดวงอาทิตย์', sub: 'Zones of the Solar System', blocks: [
    { p: 'บริวารของดวงอาทิตย์แบ่งเป็นเขตตามระยะทาง วัดเป็น**หน่วยดาราศาสตร์ (AU)** 1 AU คือระยะเฉลี่ยโลกถึงดวงอาทิตย์ ≈ **150 ล้านกิโลเมตร**' },
    { table: { cols: [0.38, 0.2, 0.42], head: ['เขต', 'ระยะ (AU)', 'สมาชิกเด่น'], rows: [
      ['**ดาวเคราะห์หิน (terrestrial planets)**', '0.4–1.5', 'พุธ ศุกร์ โลก อังคาร'],
      ['**แถบดาวเคราะห์น้อย (asteroid belt)**', '2.2–3.2', 'ดาวเคราะห์น้อยนับล้าน และซีรีส'],
      ['**ดาวเคราะห์ยักษ์ (giant planets)**', '5–30', 'แก๊สยักษ์ พฤหัสบดี เสาร์ น้ำแข็งยักษ์ ยูเรนัส เนปจูน'],
      ['**แถบไคเปอร์ (Kuiper belt)**', '30–50', 'พลูโต อีริส และดาวหางคาบสั้น'],
      ['**เมฆออร์ต (Oort cloud)**', '2,000–100,000', 'เปลือกทรงกลมของดาวหางคาบยาว'],
    ] } },
    { box: '**เขตเอื้อต่อชีวิต (habitable zone)** คือช่วงระยะที่อุณหภูมิเหมาะให้น้ำเป็นของเหลวบนพื้นผิว ของดวงอาทิตย์อยู่ราว 0.95–1.7 AU โลกจึงอยู่ในเขตนี้พอดี', tone: 'note' },
    { box: 'ภาพระบบสุริยะส่วนใหญ่**ไม่ได้ย่อตามมาตราส่วน** ถ้าย่อดวงอาทิตย์เป็นลูกบอลขนาด 10 cm โลกจะเล็กเท่าเม็ดทราย 1 mm อยู่ห่างออกไปราว 11 เมตร', tone: 'warn' },
  ] },
  { kind: 'diagram', th: TH.solar, title: 'ซูมแผนที่ระบบสุริยะ', sub: 'ภาพโต้ตอบ: ลากเพื่อซูมจาก 0.3 ถึง 100,000 AU', draw: C_dZones, init: () => ({ z: Math.log10(4), sel: -1 }) },
  { th: TH.solar, title: 'ดวงอาทิตย์ ลมสุริยะ และพายุสุริยะ', sub: 'The Sun, solar wind and solar storms', blocks: [
    { table: { cols: [0.43, 0.57], head: ['ชั้นของดวงอาทิตย์', 'ลักษณะ'], rows: [
      ['**แก่น (core)**', 'ราว 15 ล้านเคลวิน เกิดฟิวชัน'],
      ['**เขตแผ่รังสี (radiative zone)**', 'พลังงานส่งออกด้วยการแผ่รังสี'],
      ['**เขตพาความร้อน (convective zone)**', 'แก๊สร้อนลอยขึ้น เย็นแล้วจมลง'],
      ['**โฟโตสเฟียร์ (photosphere)**', 'ผิวที่มองเห็น ~5,800 K มี**จุดมืด (sunspot)** ~4,000 K'],
      ['**โครโมสเฟียร์ (chromosphere)**', 'ชั้นบางสีแดง เห็นตอนสุริยุปราคา'],
      ['**คอโรนา (corona)**', 'บรรยากาศชั้นนอก ร้อน 1–2 ล้านเคลวิน'],
    ] } },
    { p: '**ลมสุริยะ (solar wind)** คือกระแสอนุภาคมีประจุจากคอโรนา เร็วราว **400–800 km/s** จำนวนจุดมืดเพิ่มลดเป็น**วัฏจักรประมาณ 11 ปี** ช่วงจุดมืดมากมักเกิด**การลุกจ้า (solar flare)** และ**การปลดปล่อยมวลคอโรนา (CME)** ทำให้เกิด**พายุแม่เหล็กโลก (geomagnetic storm)**' },
    { li: ['ออโรรา (aurora) สว่างและเห็นได้ไกลจากขั้วโลก', 'ดาวเทียมเสียหาย GPS คลาดเคลื่อน วิทยุคลื่นสั้น (HF) ขัดข้อง หม้อแปลงไฟฟ้าเสียหาย นักบินอวกาศได้รับรังสีสูง'] },
    { box: '**แมกนีโตสเฟียร์ (magnetosphere)** ของโลกเบี่ยงอนุภาคส่วนใหญ่ออกไป บางส่วนเข้ามาใกล้ขั้วโลก ชนแก๊สในบรรยากาศจนเกิดออโรรา' },
  ] },
  { kind: 'diagram', th: TH.solar, title: 'พายุสุริยะกับโล่แม่เหล็กโลก', sub: 'ภาพโต้ตอบ: ลากเพื่อปรับกิจกรรมดวงอาทิตย์', draw: C_dStorm, init: () => ({ a: 0.15 }) },
  { th: TH.tech, title: 'กล้องโทรทรรศน์', sub: 'Telescopes across the spectrum', blocks: [
    { li: ['**กล้องหักเหแสง (refracting)** ใช้เลนส์รวมแสง', '**กล้องสะท้อนแสง (reflecting)** ใช้กระจกเว้า สร้างให้ใหญ่ได้มาก กล้องวิจัยขนาดใหญ่จึงเป็นแบบนี้'] },
    { f: 'พื้นที่รับแสง ∝ D²', cap: 'D ยิ่งใหญ่ ยิ่งเห็นวัตถุจาง และแยกรายละเอียด (resolution) ได้ดีขึ้น' },
    { p: 'แสงที่ตามองเห็นและคลื่นวิทยุผ่านบรรยากาศถึงพื้นได้ แต่รังสีแกมมา เอกซ์ UV และอินฟราเรดส่วนใหญ่ถูกดูดกลืน จึงต้องใช้**กล้องในอวกาศ**' },
    { table: { cols: [0.37, 0.63], head: ['กล้อง', 'จุดเด่น'], rows: [
      ['**James Webb (2021)**', '6.5 m อินฟราเรด ที่จุด L2 ห่างโลก 1.5 ล้าน km'],
      ['**Hubble · Chandra**', 'แสงและ UV 2.4 m · รังสีเอกซ์'],
      ['**Euclid (ESA, 2023)**', 'ทำแผนที่สสารมืดและพลังงานมืด'],
      ['**Roman (NASA)**', 'อินฟราเรดมุมกว้าง กำหนดส่งราวปี 2026–2027'],
      ['**Vera C. Rubin 8.4 m**', 'สำรวจท้องฟ้าซ้ำทุกไม่กี่คืน ภาพแรกปี 2025'],
      ['**ELT 39 m**', 'กำลังสร้างในชิลี จะใหญ่ที่สุดในโลก'],
      ['**FAST 500 m · SKA**', 'กล้องวิทยุ (SKA กำลังสร้าง)'],
      ['**Event Horizon Telescope**', 'ภาพเงาหลุมดำ M87* (2019) และ Sgr A* (2022)'],
      ['**ของไทย (NARIT)**', 'TNT 2.4 m ดอยอินทนนท์ · TNRT 40 m เชียงใหม่'],
    ] } },
  ] },
  { kind: 'diagram', th: TH.tech, title: 'หน้าต่างของบรรยากาศ', sub: 'ภาพโต้ตอบ: ลากเลือกความยาวคลื่น', draw: C_dSpectrum, init: () => ({ w: (-6.27 + 12) / 14 }) },
];
