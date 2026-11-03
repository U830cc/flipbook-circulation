
// ============================================================ cover, back, contents, review
function coverBg(ctx, hingeLeft) {
  const g = ctx.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, '#070b24'); g.addColorStop(0.55, '#141a4a'); g.addColorStop(1, '#0b1233');
  ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
  const neb = (x, y, r, col) => { const n = ctx.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, col); n.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = n; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); };
  neb(700, 260, 360, 'rgba(150,80,220,0.22)'); neb(180, 720, 380, 'rgba(40,120,220,0.20)'); neb(620, 980, 300, 'rgba(230,90,60,0.12)');
  for (let i = 0; i < 900; i++) { const a = rnd(); ctx.fillStyle = `rgba(255,255,255,${0.15 + a * 0.7})`; ctx.fillRect(rnd() * CW, rnd() * CH, a > 0.93 ? 2.4 : 1.3, a > 0.93 ? 2.4 : 1.3); }
  const hx = hingeLeft ? 0 : CW - 34, hg = ctx.createLinearGradient(hx, 0, hx + 34, 0);
  hg.addColorStop(hingeLeft ? 0 : 1, 'rgba(0,0,0,0.45)'); hg.addColorStop(hingeLeft ? 1 : 0, 'rgba(0,0,0,0)');
  ctx.fillStyle = hg; ctx.fillRect(hx, 0, 34, CH);
  ctx.strokeStyle = 'rgba(217,180,90,0.55)'; ctx.lineWidth = 2;
  const ox = hingeLeft ? 54 : 30; ctx.strokeRect(ox, 30, CW - 84, CH - 60);
  ctx.lineWidth = 1; ctx.strokeRect(ox + 8, 38, CW - 100, CH - 76);
}
const GAL_STARS = Array.from({ length: 520 }, (_, k) => {
  const arm = k % 2, u = rnd(), r = 14 + u * 190, a = arm * Math.PI + u * 4.2 + (rnd() - 0.5) * 0.55;
  return { r, a, s: 0.8 + rnd() * 1.8, c: u < 0.25 ? '#ffe2a8' : rnd() < 0.5 ? '#bcd6ff' : '#ffffff', o: 0.35 + rnd() * 0.6 };
});
function spiralGalaxy(ctx, cx, cy, sc, tilt, t, spin = 0.05) {
  glow(ctx, cx, cy, 120 * sc, 'rgba(255,214,150,0.55)');
  for (const s of GAL_STARS) {
    const a = s.a + t * spin * (60 / (s.r + 40));
    const x = cx + Math.cos(a) * s.r * sc, y = cy + Math.sin(a) * s.r * sc * tilt;
    ctx.globalAlpha = s.o; ctx.fillStyle = s.c; ctx.fillRect(x, y, s.s, s.s);
  }
  ctx.globalAlpha = 1;
  glow(ctx, cx, cy, 34 * sc, 'rgba(255,240,210,0.95)');
}
let COVER_BG = null, BACK_BG = null;
function drawCover(ctx, t) {
  if (!COVER_BG) { COVER_BG = makeCanvas(); coverBg(COVER_BG.getContext('2d'), true); }
  ctx.drawImage(COVER_BG, 0, 0);
  label(ctx, 'วิทยาศาสตร์โลกและอวกาศ · มัธยมศึกษาตอนปลาย', 465, 112, { size: 19, wt: 600, color: '#d9e9f7', bg: 'rgba(255,255,255,0.08)', border: 'rgba(217,180,90,0.5)', pad: 12, r: 18 });
  spiralGalaxy(ctx, 600, 330, 1.05, 0.42, t);
  const gx = 400, gy = 560, R = 150;
  glow(ctx, gx, gy, R + 90, 'rgba(120,190,255,0.28)');
  globe(ctx, gx, gy, R);
  ctx.save(); ctx.beginPath(); ctx.arc(gx, gy, R, 0, Math.PI * 2); ctx.clip();
  const sh = ctx.createLinearGradient(gx - R, 0, gx + R, 0); sh.addColorStop(0, 'rgba(0,0,20,0)'); sh.addColorStop(1, 'rgba(0,0,20,0.55)'); ctx.fillStyle = sh; ctx.fillRect(gx - R, gy - R, 2 * R, 2 * R);
  ctx.restore();
  const ma = t * 0.5, mx = gx + Math.cos(ma) * 235, my = gy + Math.sin(ma) * 70;
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(gx, gy, 235, 70, 0, 0, Math.PI * 2); ctx.stroke();
  if (Math.sin(ma) > -0.2 || Math.abs(Math.cos(ma)) > 0.64) circle(ctx, mx, my, 20, '#d9d4cc');
  ctx.font = `600 64px ${F.display}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff'; ctx.fillText('เอกภพ อวกาศ', 465, 840);
  ctx.fillStyle = '#c7b5ff'; ctx.fillText('และโลกของเรา', 465, 916);
  ctx.textAlign = 'left';
  label(ctx, 'UNIVERSE · STARS · SPACE · DYNAMIC EARTH', 465, 962, { size: 17, wt: 600, color: '#c9cfea' });
  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = ['rgba(150,74,40,0.55)', 'rgba(120,58,32,0.8)', 'rgba(84,40,24,0.97)'][k];
    ctx.beginPath(); ctx.moveTo(0, CH);
    for (let x = 0; x <= CW; x += 10) ctx.lineTo(x, 1016 + k * 32 - 26 * Math.exp(-((x - 300 - k * 140) ** 2) / 9000) + 6 * Math.sin(x * 0.02 + k));
    ctx.lineTo(CW, CH); ctx.closePath(); ctx.fill();
  }
  const fl = 0.5 + 0.5 * Math.sin(t * 3);
  glow(ctx, 300, 994, 30 + 8 * fl, 'rgba(255,120,40,0.7)');
  label(ctx, 'แตะขอบกระดาษหรือลากมุมเพื่อเปิดหนังสือ →', 465, 1110, { size: 18, wt: 600, color: 'rgba(255,255,255,0.85)' });
}
function drawBack(ctx) {
  if (!BACK_BG) { BACK_BG = makeCanvas(); coverBg(BACK_BG.getContext('2d'), false); }
  ctx.drawImage(BACK_BG, 0, 0);
  spiralGalaxy(ctx, 440, 320, 0.62, 0.45, 0);
  ctx.font = `600 40px ${F.display}`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('หนังสือพลิก 3 มิติ', 440, 520);
  ctx.font = `500 26px ${F.display}`; ctx.fillStyle = '#c7b5ff'; ctx.fillText('เอกภพ อวกาศ และโลกของเรา', 440, 566); ctx.textAlign = 'left';
  const topics = ['บิกแบง', 'หลักฐานบิกแบง', 'ประเภทกาแล็กซี', 'ทางช้างเผือก', 'วิวัฒนาการดาวฤกษ์', 'สเปกตรัม', 'แผนภาพ H-R', 'โชติมาตร', 'กำเนิดระบบสุริยะ', 'ลมสุริยะ', 'จรวดและดาวเทียม', 'โครงสร้างโลก', 'แผ่นธรณี', 'แผ่นดินไหว', 'ภูเขาไฟ', 'สึนามิ'];
  let x = 96, y = 640;
  ctx.font = `600 18px ${F.label}`;
  for (const tp of topics) { const w = ctx.measureText(tp).width + 28; if (x + w > 812) { x = 96; y += 50; } label(ctx, tp, x + 14, y, { size: 18, color: '#d9e0f7', align: 'left', bg: 'rgba(255,255,255,0.08)', border: 'rgba(217,180,90,0.45)', pad: 12, r: 16 }); x += w + 14; }
  para(ctx, 'สื่อการเรียนรู้ประกอบรายวิชาวิทยาศาสตร์โลกและอวกาศ ระดับมัธยมศึกษาตอนปลาย ภาคเรียนที่ 1', 440, 910, 620, 20, { color: '#c9cfea', align: 'center', fam: F.label });
  label(ctx, 'สร้างด้วย three.js ร่วมกับ Claude', 440, 1060, { size: 17, wt: 600, color: 'rgba(217,180,90,0.9)' });
}
const TOC = [
  [TH.cosmos, 'บทที่ 1 เอกภพ', [['กำเนิดและวิวัฒนาการของเอกภพ', 3], ['หลักฐานที่สนับสนุนทฤษฎีบิกแบง', 5]]],
  [TH.galaxy, 'บทที่ 2 กาแล็กซี', [['การจำแนกประเภทของกาแล็กซี', 7], ['กาแล็กซีทางช้างเผือก', 9]]],
  [TH.star, 'บทที่ 3 ดาวฤกษ์', [['กำเนิดและวิวัฒนาการของดาวฤกษ์', 11], ['สี อุณหภูมิ และสเปกตรัม', 13], ['แผนภาพ H-R', 15], ['ความสว่างและโชติมาตร', 17]]],
  [TH.solar, 'บทที่ 4 ระบบสุริยะ', [['กำเนิดระบบสุริยะ', 19], ['เขตบริวารของดวงอาทิตย์', 21], ['ดวงอาทิตย์ ลมสุริยะ พายุสุริยะ', 23]]],
  [TH.tech, 'บทที่ 5 เทคโนโลยีอวกาศ', [['กล้องโทรทรรศน์', 25], ['จรวด ยานอวกาศ สถานีอวกาศ', 27], ['ยานสำรวจอวกาศรุ่นใหม่', 29], ['ดาวเทียมและวงโคจร', 31], ['การประยุกต์ใช้เทคโนโลยีอวกาศ', 33]]],
  [TH.earth, 'บทที่ 6 กระบวนการเปลี่ยนแปลงภายในโลก', [['โครงสร้างโลก', 35], ['ทวีปเลื่อนและการแปรสัณฐาน', 37], ['ขอบแผ่นธรณี', 39]]],
  [TH.hazard, 'บทที่ 7 ธรณีพิบัติภัย', [['แผ่นดินไหว', 41], ['ภูเขาไฟ', 43], ['สึนามิ', 45]]],
  [TH.end, 'ทบทวนความรู้', [['แผนผังสรุป', 47], ['แบบทดสอบท้ายเล่ม', 48]]],
];
function drawTOC(ctx, P) {
  let y = 222;
  for (const [th, ch, items] of TOC) {
    ctx.fillStyle = th.a; rr(ctx, P.X0, y - 7, 13, 13, 4); ctx.fill();
    label(ctx, ch, P.X0 + 22, y, { size: 17, wt: 600, color: th.a, align: 'left', fam: F.display });
    y += 27;
    for (const [name, p] of items) {
      label(ctx, name, P.X0 + 22, y, { size: 17, wt: 400, color: C.ink, align: 'left', fam: F.body });
      ctx.font = `400 17px ${F.body}`; const nw = ctx.measureText(name).width;
      ctx.fillStyle = 'rgba(93,104,114,0.45)'; for (let dx = P.X0 + 32 + nw; dx < P.X1 - 34; dx += 9) ctx.fillRect(dx, y + 5, 2, 2);
      label(ctx, String(p), P.X1, y, { size: 17, wt: 600, color: th.a, align: 'right' });
      P.zones.push({ x: P.X0, y: y - 12, w: P.X1 - P.X0, h: 25, cursor: 'pointer', click: () => goToPage(p) });
      y += 25;
    }
    y += 7;
  }
  label(ctx, 'แตะชื่อหัวข้อเพื่อไปยังหน้านั้น', P.cx, y + 14, { size: 16, wt: 500, color: C.soft });
}
const QUIZ = [
  ['รังสีไมโครเวฟพื้นหลังของเอกภพ (CMB) เกิดขึ้นเมื่อใด', 'เมื่อเอกภพอายุประมาณ 380,000 ปี อุณหภูมิลดลงจนอิเล็กตรอนรวมกับนิวเคลียสเป็นอะตอม แสงจึงเดินทางได้อิสระ ปัจจุบันวัดได้ประมาณ 2.7 K'],
  ['ดาราจักรที่อยู่ไกลกว่ามีสเปกตรัมต่างจากดาราจักรที่อยู่ใกล้อย่างไร', 'เส้นสเปกตรัมเลื่อนไปทางแดง (redshift) มากกว่า เพราะเคลื่อนที่ออกห่างเร็วกว่า ตามกฎของฮับเบิล v = H₀d'],
  ['ดาวฤกษ์มวล 20 เท่าของดวงอาทิตย์จะจบชีวิตอย่างไร', 'กลายเป็นดาวยักษ์ใหญ่แดง แล้วระเบิดเป็นซูเปอร์โนวา แกนที่เหลือเป็นดาวนิวตรอนหรือหลุมดำ'],
  ['ดาวสีน้ำเงินกับดาวสีแดง ดวงใดอุณหภูมิผิวสูงกว่า', 'ดาวสีน้ำเงิน เพราะความยาวคลื่นที่ปลดปล่อยพลังงานมากที่สุดสั้นกว่า (กฎของวีน)'],
  ['ดาว A มีโชติมาตรปรากฏ +1 ดาว B มี +6 ดวงใดสว่างกว่าและกี่เท่า', 'ดาว A สว่างกว่าประมาณ 100 เท่า เพราะต่างกัน 5 โชติมาตร'],
  ['ทำไมดาวเทียมค้างฟ้าจึงอยู่เหนือจุดเดิมบนโลกตลอด', 'โคจรที่สูงประมาณ 35,786 km เหนือเส้นศูนย์สูตร มีคาบ 24 ชั่วโมงเท่ากับคาบการหมุนรอบตัวเองของโลก'],
  ['หลักฐานใดบอกว่าแก่นโลกชั้นนอกเป็นของเหลว', 'คลื่น S ผ่านของเหลวไม่ได้ จึงเกิดเขตอับคลื่น S ด้านตรงข้ามจุดเกิดแผ่นดินไหว'],
  ['เทือกเขาหิมาลัยเกิดจากขอบแผ่นธรณีแบบใด', 'ขอบแบบชนกันระหว่างแผ่นธรณีทวีปกับทวีป (อินเดียชนยูเรเชีย) เปลือกโลกโก่งตัวเป็นเทือกเขา'],
];
function drawQuiz(ctx, P) {
  let y = 214; const w = P.X1 - P.X0;
  QUIZ.forEach(([q, a], i) => {
    circle(ctx, P.X0 + 15, y + 15, 15, P.th.a);
    label(ctx, String(i + 1), P.X0 + 15, y + 15, { size: 16, wt: 700, color: '#fff' });
    y = para(ctx, q, P.X0 + 40, y, w - 40, 19, { lh: 28, wt: 600 });
    const open = P.st.open[i], lines = wrap(ctx, a, w - 72, 17), h = open ? lines.length * 25 + 14 : 38;
    if (open) { ctx.fillStyle = 'rgba(43,138,62,0.1)'; rr(ctx, P.X0 + 40, y + 2, w - 40, h, 10); ctx.fill(); drawLines(ctx, lines, P.X0 + 54, y + 8, 25, 17, { color: '#2b6a35' }); }
    else { ctx.setLineDash([6, 5]); ctx.strokeStyle = 'rgba(93,104,114,0.5)'; ctx.lineWidth = 1.5; rr(ctx, P.X0 + 40, y + 2, w - 40, h, 10); ctx.stroke(); ctx.setLineDash([]); label(ctx, 'แตะเพื่อดูเฉลย', P.X0 + 40 + (w - 40) / 2, y + 2 + h / 2, { size: 15, wt: 600, color: C.soft }); }
    P.zones.push({ x: P.X0 + 40, y: y + 2, w: w - 40, h, cursor: 'pointer', click: () => { const was = P.st.open[i]; P.st.open = []; P.st.open[i] = !was; P.dirty = true; } });
    y += h + 12;
  });
}
const MAP = [
  { k: 'cosmos', p: 3, t: '**บิกแบง** 13,800 ล้านปีก่อน\nอวกาศขยายตัวและเย็นลง', x: 0.5, y: 230 },
  { k: 'galaxy', p: 7, t: 'แก๊สรวมตัวเป็น**กาแล็กซี**\nทางช้างเผือกเป็นแบบกังหันมีคาน', x: 0.5, y: 340 },
  { k: 'star', p: 11, t: '**ดาวฤกษ์** เกิดในเนบิวลา\nมวลกำหนดอายุ สี และจุดจบ', x: 0.5, y: 450 },
  { k: 'solar', p: 19, t: '**ระบบสุริยะ** 4,600 ล้านปีก่อน\nดวงอาทิตย์ ลมสุริยะ และบริวาร', x: 0.5, y: 560 },
  { k: 'earth', p: 35, t: '**โลก** แบ่งเป็นชั้น\nการพาความร้อนในเนื้อโลกดันแผ่นธรณี', x: 0.5, y: 670 },
  { k: 'hazard', p: 41, t: 'ขอบแผ่นธรณีทำให้เกิด\n**แผ่นดินไหว ภูเขาไฟ สึนามิ**', x: 0.5, y: 780 },
];
function dSummary(ctx, t, P) {
  const { X0, X1, cx } = P, w = 500, h = 76, bx = cx - w / 2 - 70;
  MAP.forEach((m, i) => {
    const col = TH[m.k].a, y = m.y;
    ctx.fillStyle = rgba(col, 0.1); rr(ctx, bx, y, w, h, 14); ctx.fill();
    ctx.strokeStyle = rgba(col, 0.6); ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = col; rr(ctx, bx, y, 8, h, 4); ctx.fill();
    const lines = wrap(ctx, m.t, w - 40, 18, F.label, 600, 700);
    drawLines(ctx, lines, bx + w / 2 + 4, y + h / 2 - lines.length * 14, 28, 18, { fam: F.label, wt: 600, bw: 700, color: C.ink, bcolor: col, align: 'center' });
    label(ctx, 'หน้า ' + m.p + ' →', bx + w - 14, y + 13, { size: 13, wt: 600, color: col, align: 'right' });
    P.zones.push({ x: bx, y, w, h, cursor: 'pointer', click: () => goToPage(m.p) });
    if (i) arrow(ctx, bx + w / 2, y - 32, bx + w / 2, y - 4, { color: 'rgba(37,48,58,0.5)', w: 3, head: 11, dash: [7, 6], off: -t * 22 });
  });
  const tx = bx + w + 30, tw = X1 - tx, col = TH.tech.a;
  ctx.fillStyle = rgba(col, 0.1); rr(ctx, tx, 230, tw, 626, 14); ctx.fill(); ctx.strokeStyle = rgba(col, 0.6); ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); ctx.translate(tx + tw / 2, 543); ctx.rotate(-Math.PI / 2);
  label(ctx, 'เทคโนโลยีอวกาศ ใช้สำรวจทุกขั้น', 0, -12, { size: 18, wt: 700, color: col, fam: F.label });
  label(ctx, 'กล้องโทรทรรศน์ · ยานสำรวจ · ดาวเทียม', 0, 16, { size: 15, wt: 600, color: C.ink, fam: F.label });
  ctx.restore();
  P.zones.push({ x: tx, y: 230, w: tw, h: 626, cursor: 'pointer', click: () => goToPage(25) });
  ctx.fillStyle = rgba(P.th.a, 0.08); rr(ctx, X0, 890, X1 - X0, 150, 14); ctx.fill();
  para(ctx, '**แนวคิดหลัก** ธาตุที่ประกอบเป็นโลกและตัวเราเกิดจากบิกแบงและในดาวฤกษ์รุ่นก่อน พลังงานความร้อนภายในโลกยังขับเคลื่อนแผ่นธรณี ทำให้ผิวโลกเปลี่ยนแปลงตลอดเวลา', X0 + 20, 906, X1 - X0 - 40, 20, { lh: 31, bcolor: P.th.a });
  label(ctx, '☝ แตะกล่องเพื่อไปยังบทนั้น', cx, 1072, { size: 16, wt: 600, color: P.th.a, bg: rgba(P.th.a, 0.1), pad: 8, r: 14 });
}

// ============================================================ page content
const PAGES = [
  { kind: 'cover', anim: true },
  { th: TH.intro, title: 'ก่อนเริ่มเรียน', sub: 'How to use this book', blocks: [
    { h: 'จุดประสงค์การเรียนรู้' },
    { li: [
      'อธิบาย**กำเนิดและวิวัฒนาการของเอกภพ**ตามทฤษฎีบิกแบง และหลักฐานที่สนับสนุน',
      'จำแนก**ประเภทของกาแล็กซี** และอธิบายโครงสร้างของกาแล็กซีทางช้างเผือก',
      'อธิบาย**วิวัฒนาการของดาวฤกษ์** ความสัมพันธ์ของสี อุณหภูมิ สเปกตรัม ความสว่างและโชติมาตร',
      'อธิบาย**กำเนิดระบบสุริยะ** เขตบริวาร และผลของลมสุริยะและพายุสุริยะต่อโลก',
      'อธิบาย**เทคโนโลยีอวกาศ**และการนำมาใช้ประโยชน์',
      'อธิบาย**โครงสร้างโลก การแปรสัณฐานของแผ่นธรณี** และ**ธรณีพิบัติภัย**',
    ] },
    { h: 'วิธีใช้หนังสือ' },
    { li: ['**ลากหรือคลิกบนภาพประกอบ**หน้าขวา แล้วสังเกตว่าผลเปลี่ยนไปอย่างไร', 'บางหน้ามี**โมเดลป๊อปอัป 3 มิติ** ลากบนโมเดลเพื่อโต้ตอบ ลากพื้นที่ว่างเพื่อหมุนดูรอบ ๆ', 'เปิด**ปุ่มเสียง**บนแถบเครื่องมือเพื่อฟังคำบรรยายแต่ละหน้า'] },
    { box: 'ภาพที่ใช้ในเล่มนี้**ไม่ได้ย่อตามมาตราส่วนจริง** เพราะระยะทางและขนาดในอวกาศต่างกันมากเกินกว่าจะวาดลงหน้าเดียว' },
  ] },
  { kind: 'toc', th: TH.intro, title: 'สารบัญ', sub: 'Contents' },
  ...PART_A, ...PART_B, ...PART_C, ...PART_D.slice(0, 2), ...PART_F, ...PART_D.slice(2), ...PART_E,
  { kind: 'diagram', th: TH.end, title: 'แผนผังสรุป', sub: 'จากบิกแบงถึงโลกที่เปลี่ยนแปลง', draw: dSummary, init: () => ({}) },
  { kind: 'quiz', th: TH.end, title: 'แบบทดสอบท้ายเล่ม', sub: 'แตะที่กล่องเพื่อดูเฉลย', init: () => ({ open: [] }) },
  { kind: 'back' },
];
if (PAGES.length !== 50) console.warn('page count', PAGES.length);
const N = PAGES.length / 2;
