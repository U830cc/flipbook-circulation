// ============================================================ constants
const CW = 900, CH = 1170;
const PW = 1, PH = CH / CW;
const GAP = 0.0042, BASE = 0.006, SX = 44, SY = 12;
const D2R = Math.PI / 180;
const F = {
  display: '"Mitr", "Sarabun", "Thonburi", "Tahoma", sans-serif',
  body: '"Sarabun", "Thonburi", "Tahoma", sans-serif',
  label: '"IBM Plex Sans Thai", "Sarabun", "Thonburi", "Tahoma", sans-serif',
};
const C = {
  ink: '#25303a', soft: '#5d6872', paper: '#fbf8f1',
  hi: '#1c63c9', lo: '#c92a2a', hot: '#e8590c', cold: '#1c7ed6',
  hadley: '#e8590c', ferrel: '#2b8a3e', polar: '#1971c2',
};
const TH = {
  intro:  { a: '#8a5a14', t: '#f4e9d4', n: 0, ch: 'เริ่มต้น' },
  cosmos: { a: '#6741b8', t: '#ece6f8', n: 1, ch: 'บทที่ 1 · เอกภพ' },
  galaxy: { a: '#3b4fb5', t: '#e4e8f8', n: 2, ch: 'บทที่ 2 · กาแล็กซี' },
  star:   { a: '#c2410c', t: '#fbe9df', n: 3, ch: 'บทที่ 3 · ดาวฤกษ์' },
  solar:  { a: '#a86a0c', t: '#f7ecd8', n: 4, ch: 'บทที่ 4 · ระบบสุริยะ' },
  tech:   { a: '#0f7c72', t: '#dff2ef', n: 5, ch: 'บทที่ 5 · เทคโนโลยีอวกาศ' },
  earth:  { a: '#8a4b2a', t: '#f3e6dc', n: 6, ch: 'บทที่ 6 · กระบวนการเปลี่ยนแปลงภายในโลก' },
  hazard: { a: '#c92a2a', t: '#f9e1e1', n: 7, ch: 'บทที่ 7 · ธรณีพิบัติภัย' },
  end:    { a: '#8a5a14', t: '#f4e9d4', n: 8, ch: 'ทบทวนความรู้' },
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, f) => a + (b - a) * f;
const smooth = (a, b, x) => { const f = clamp((x - a) / (b - a), 0, 1); return f * f * (3 - 2 * f); };
const mod1 = (x) => ((x % 1) + 1) % 1;

// ============================================================ colour + canvas helpers
const rgbCache = {};
function hex2rgb(h) { return rgbCache[h] || (rgbCache[h] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))); }
function rgba(h, a) { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }
function mix(a, b, f, al = 1) {
  const A = hex2rgb(a), B = hex2rgb(b); f = clamp(f, 0, 1);
  return `rgba(${Math.round(lerp(A[0], B[0], f))},${Math.round(lerp(A[1], B[1], f))},${Math.round(lerp(A[2], B[2], f))},${al})`;
}
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function circle(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } }
function ring(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); }
function glow(ctx, x, y, r, col) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function label(ctx, txt, x, y, o = {}) {
  const { size = 20, wt = 600, color = C.ink, align = 'center', bg = null, fam = F.label, pad = 7, r = 8, border = null } = o;
  ctx.font = `${wt} ${size}px ${fam}`;
  const w = ctx.measureText(txt).width;
  const lx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  if (bg) {
    ctx.fillStyle = bg; rr(ctx, lx - pad, y - size * 0.7 - pad * 0.55, w + pad * 2, size * 1.4 + pad * 1.1, r); ctx.fill();
    if (border) { ctx.strokeStyle = border; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(txt, lx, y + 1);
  return w;
}
function stitle(ctx, txt, x, y, th) { label(ctx, txt, x, y + 12, { size: 23, wt: 600, color: th.a, align: 'left', fam: F.display }); }
function arrow(ctx, x1, y1, x2, y2, o = {}) {
  const { color = C.ink, w = 4, head = 16, dash = null, off = 0 } = o;
  const a = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1);
  const hd = Math.min(head, len * 0.6);
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = off; }
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * hd * 0.7, y2 - Math.sin(a) * hd * 0.7); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hd * Math.cos(a - 0.45), y2 - hd * Math.sin(a - 0.45));
  ctx.lineTo(x2 - hd * Math.cos(a + 0.45), y2 - hd * Math.sin(a + 0.45));
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function chevron(ctx, x, y, ang, col, s = 11) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(-s * 0.7, -s * 0.75); ctx.lineTo(-s * 0.25, 0); ctx.lineTo(-s * 0.7, s * 0.75); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function Path(pts, closed = true) {
  const P = pts.slice(); if (closed) P.push(pts[0]);
  const L = [0];
  for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const len = L[L.length - 1] || 1;
  return {
    P, L, len, closed,
    at(u) {
      u = closed ? mod1(u) : clamp(u, 0, 1);
      const d = u * len; let lo = 0, hi = L.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= d) lo = m; else hi = m; }
      const seg = L[hi] - L[lo] || 1, f = (d - L[lo]) / seg, a = P[lo], b = P[hi];
      return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
    },
    nearest(x, y) {
      let best = { d: 1e9, u: 0 };
      for (let k = 0; k < 240; k++) { const q = this.at(k / 240); const d = Math.hypot(q.x - x, q.y - y); if (d < best.d) best = { d, u: k / 240, q }; }
      return best;
    },
  };
}
function strokeP(ctx, path, color, w, dash, off) {
  ctx.save(); ctx.beginPath();
  path.P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = off || 0; }
  ctx.stroke(); ctx.restore();
}
function fillP(ctx, path, color) { ctx.beginPath(); path.P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = color; ctx.fill(); }
function chaikin(pts, it = 3) {
  let p = pts;
  for (let k = 0; k < it; k++) {
    const o = [], n = p.length;
    for (let i = 0; i < n; i++) {
      const a = p[i], b = p[(i + 1) % n];
      o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    p = o;
  }
  return p;
}
function rrectPts(x, y, w, h, r, n = 10) {
  const out = []; r = Math.min(r, w / 2, h / 2);
  const corner = (cx, cy, a0) => { for (let k = 0; k <= n; k++) { const a = a0 + (k / n) * Math.PI / 2; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return out;
}
// A circulation cell in (latitude°, radius) space; not reversed = rises on the low-latitude side.
function cellPts(phiA, phiB, r1, r2, reversed, n = 90) {
  const pc = (phiA + phiB) / 2, pa = (phiB - phiA) / 2 * 0.9, rc = (r1 + r2) / 2, ra = (r2 - r1) / 2 * 0.84, out = [];
  for (let k = 0; k < n; k++) {
    const th = Math.PI - (reversed ? -1 : 1) * 2 * Math.PI * k / n, c = Math.cos(th), s = Math.sin(th);
    out.push([pc + pa * Math.sign(c) * Math.pow(Math.abs(c), 0.42), rc + ra * Math.sign(s) * Math.pow(Math.abs(s), 0.42)]);
  }
  return out;
}
function mapPolar(pts, cx, cy, sx, sy) { return pts.map(([phi, r]) => [cx + sx * r * Math.cos(phi * D2R), cy - sy * r * Math.sin(phi * D2R)]); }
function globe(ctx, cx, cy, R) {
  const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.08, cx, cy, R);
  g.addColorStop(0, '#8fd0f2'); g.addColorStop(0.55, '#2f86c4'); g.addColorStop(1, '#123f73');
  circle(ctx, cx, cy, R, g);
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
  ctx.lineWidth = 1.5;
  for (const lat of [-60, -30, 30, 60]) {
    const y = cy - R * Math.sin(lat * D2R), h = R * Math.cos(lat * D2R);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(cx - h, y); ctx.lineTo(cx + h, y); ctx.stroke();
  }
  ctx.setLineDash([]); ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
  ctx.restore();
}
function shell(ctx, cx, cy, r0, r1, col = 'rgba(140,190,240,0.16)') {
  ctx.beginPath(); ctx.arc(cx, cy, r1, 0, Math.PI * 2); ctx.arc(cx, cy, r0, 0, Math.PI * 2, true); ctx.fillStyle = col; ctx.fill('evenodd');
}
function bigLetter(ctx, L, x, y, col, r = 30) {
  circle(ctx, x, y, r, 'rgba(255,255,255,0.92)');
  ctx.strokeStyle = col; ctx.lineWidth = 3.5; ring(ctx, x, y, r);
  label(ctx, L, x, y + 1, { size: r * 1.15, wt: 700, color: col, fam: F.display });
}
function cellFlow(ctx, path, t, col, o = {}) {
  const { pxs = 46, n = 6, dots = 9, band = null, width = 3, dotR = 4.2 } = o;
  if (band) fillP(ctx, path, band);
  const c0 = typeof col === 'function' ? 'rgba(70,80,100,0.45)' : rgba(col, 0.6);
  strokeP(ctx, path, c0, width, [9, 8], -t * 30);
  const ph = t * pxs / path.len;
  for (let k = 0; k < n; k++) { const q = path.at(k / n + ph); chevron(ctx, q.x, q.y, q.ang, typeof col === 'function' ? col(q) : col, 11); }
  for (let k = 0; k < dots; k++) { const q = path.at((k + 0.5) / dots + ph); circle(ctx, q.x, q.y, dotR, typeof col === 'function' ? col(q) : col); }
}
function phaseAdvance(st, key, t, rate) {
  const lt = st['_lt' + key] ?? t; st['_lt' + key] = t;
  st[key] = (st[key] || 0) + clamp(t - lt, 0, 0.2) * rate;
  return st[key];
}

// ============================================================ text engine (Thai word wrap)
const SEG = (typeof Intl !== 'undefined' && Intl.Segmenter) ? new Intl.Segmenter('th', { granularity: 'word' }) : null;
function words(s) { return SEG ? Array.from(SEG.segment(s), x => x.segment) : (s.match(/\S+\s*|\s+/g) || []); }
function tokens(text) {
  const out = [];
  for (const part of text.split(/(\*\*[^*]+\*\*)/)) {
    if (!part) continue;
    const b = part.length > 4 && part.startsWith('**') && part.endsWith('**');
    for (const w of words(b ? part.slice(2, -2) : part)) out.push({ w, b });
  }
  // keep brackets glued to their word so a line never starts with ")" or ends with "("
  for (let i = out.length - 1; i > 0; i--) {
    if (/^[)\],.:;%]/.test(out[i].w) && !/\s$/.test(out[i - 1].w)) { out[i - 1].w += out[i].w; out.splice(i, 1); }
    else if (/[(\[]$/.test(out[i - 1].w) && out[i - 1].b === out[i].b) { out[i - 1].w += out[i].w; out.splice(i, 1); }
  }
  return out;
}
function wrap(ctx, text, maxW, size, fam = F.body, wt = 400, bw = 700) {
  const lines = [];
  for (const para of String(text).split('\n')) {
    let line = [], lw = 0;
    for (const tk of tokens(para)) {
      ctx.font = `${tk.b ? bw : wt} ${size}px ${fam}`;
      const width = ctx.measureText(tk.w).width;
      if (lw + width > maxW && line.length) { lines.push(line); line = []; lw = 0; if (!tk.w.trim()) continue; }
      line.push({ w: tk.w, b: tk.b, width }); lw += width;
    }
    lines.push(line);
  }
  return lines;
}
function drawLines(ctx, lines, x, y, lh, size, o = {}) {
  const { fam = F.body, wt = 400, bw = 700, color = C.ink, bcolor = null, align = 'left' } = o;
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  for (const line of lines) {
    const tw = line.reduce((s, t) => s + t.width, 0);
    let lx = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x;
    for (const t of line) {
      ctx.font = `${t.b ? bw : wt} ${size}px ${fam}`;
      ctx.fillStyle = t.b ? (bcolor || color) : color;
      ctx.fillText(t.w, lx, y + size * 0.98); lx += t.width;
    }
    y += lh;
  }
  return y;
}
function para(ctx, text, x, y, w, size, o = {}) {
  const lh = o.lh || Math.round(size * 1.55);
  return drawLines(ctx, wrap(ctx, text, w, size, o.fam || F.body, o.wt || 400, o.bw || 700), x, y, lh, size, o);
}
function renderBlocks(ctx, blocks, x, y, w, th, s = 1) {
  const body = 26 * s, lh = Math.round(body * 1.55);
  for (const b of blocks) {
    if (b.gap) { y += b.gap * s; continue; }
    if (b.h) {
      y += 10 * s;
      ctx.fillStyle = th.a; rr(ctx, x, y + 6 * s, 6 * s, 28 * s, 3); ctx.fill();
      ctx.font = `600 ${30 * s}px ${F.display}`; ctx.fillStyle = C.ink; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      ctx.fillText(b.h, x + 18 * s, y);
      y += 46 * s; continue;
    }
    if (b.p) { y = para(ctx, b.p, x, y, w, body, { lh, bcolor: th.a }) + 8 * s; continue; }
    if (b.li) {
      for (const it of b.li) {
        circle(ctx, x + 10 * s, y + lh * 0.55, 5 * s, th.a);
        y = para(ctx, it, x + 30 * s, y, w - 30 * s, body, { lh, bcolor: th.a }) + 3 * s;
      }
      y += 8 * s; continue;
    }
    if (b.box) {
      const tone = b.tone || 'key', col = tone === 'warn' ? '#c2410c' : tone === 'note' ? '#2b6cb0' : th.a;
      const pad = 20 * s, size = body * 0.92, l2 = Math.round(size * 1.55);
      const lines = wrap(ctx, b.box, w - pad * 2 - 6 * s, size);
      const h = lines.length * l2 + pad * 1.6;
      ctx.fillStyle = rgba(col, 0.09); rr(ctx, x, y, w, h, 12 * s); ctx.fill();
      ctx.fillStyle = col; rr(ctx, x, y, 6 * s, h, 3); ctx.fill();
      drawLines(ctx, lines, x + pad + 6 * s, y + pad * 0.8, l2, size, { bcolor: col });
      y += h + 14 * s; continue;
    }
    if (b.f) {
      const size = 30 * s, h = 70 * s;
      ctx.setLineDash([7, 6]); ctx.strokeStyle = rgba(th.a, 0.6); ctx.lineWidth = 2; rr(ctx, x, y, w, h, 12); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, b.f, x + w / 2, y + h / 2, { size, wt: 600, color: th.a, fam: F.label });
      y += h + 6 * s;
      if (b.cap) y = para(ctx, b.cap, x + w / 2, y, w, body * 0.8, { color: C.soft, align: 'center' });
      y += 10 * s; continue;
    }
    if (b.table) {
      const { head, rows, cols } = b.table, size = 22 * s, l2 = Math.round(size * 1.45), pad = 12 * s;
      const cx = [x]; cols.forEach(f => cx.push(cx[cx.length - 1] + f * w));
      const rowH = (cells, wt) => Math.max(...cells.map((c, i) => wrap(ctx, c, cx[i + 1] - cx[i] - pad * 2, size, F.body, wt === 700 ? 700 : i === 0 ? 600 : 400).length)) * l2 + pad * 1.4;
      const hh = rowH(head, 700);
      ctx.fillStyle = th.a; rr(ctx, x, y, w, hh, 10 * s); ctx.fill();
      head.forEach((c, i) => drawLines(ctx, wrap(ctx, c, cx[i + 1] - cx[i] - pad * 2, size, F.body, 700), cx[i] + pad, y + pad * 0.7, l2, size, { wt: 700, color: '#fff' }));
      y += hh;
      rows.forEach((r, ri) => {
        const h = rowH(r, 400);
        if (ri % 2 === 0) { ctx.fillStyle = rgba(th.a, 0.07); ctx.fillRect(x, y, w, h); }
        r.forEach((c, i) => drawLines(ctx, wrap(ctx, c, cx[i + 1] - cx[i] - pad * 2, size, F.body, i === 0 ? 600 : 400), cx[i] + pad, y + pad * 0.7, l2, size, { bcolor: th.a, wt: i === 0 ? 600 : 400, bw: 700 }));
        y += h;
      });
      ctx.strokeStyle = rgba(th.a, 0.35); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
      y += 18 * s; continue;
    }
  }
  return y;
}

// ============================================================ paper, header, footer
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function makeCanvas() { const c = document.createElement('canvas'); c.width = CW; c.height = CH; return c; }
let NOISE = null;
function noise() {
  if (NOISE) return NOISE;
  NOISE = makeCanvas(); const x = NOISE.getContext('2d');
  x.fillStyle = C.paper; x.fillRect(0, 0, CW, CH);
  for (let i = 0; i < 16000; i++) {
    const a = rnd() * 0.05;
    x.fillStyle = rnd() < 0.5 ? `rgba(120,100,60,${a})` : `rgba(255,255,255,${a * 1.6})`;
    x.fillRect(rnd() * CW, rnd() * CH, 1 + rnd() * 1.6, 1 + rnd() * 1.6);
  }
  for (let i = 0; i < 300; i++) {
    x.strokeStyle = `rgba(140,120,80,${0.03 + rnd() * 0.05})`; x.lineWidth = 0.7;
    const px = rnd() * CW, py = rnd() * CH, a = rnd() * Math.PI, l = 6 + rnd() * 14;
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  return NOISE;
}
function paperBase(ctx, P) {
  ctx.drawImage(noise(), 0, 0);
  const spineX = P.side === 'R' ? 0 : CW, dir = P.side === 'R' ? 1 : -1;
  const g = ctx.createLinearGradient(spineX, 0, spineX + dir * 80, 0);
  g.addColorStop(0, 'rgba(70,50,20,0.26)'); g.addColorStop(0.35, 'rgba(70,50,20,0.08)'); g.addColorStop(1, 'rgba(70,50,20,0)');
  ctx.fillStyle = g; ctx.fillRect(P.side === 'R' ? 0 : CW - 80, 0, 80, CH);
  const outer = P.side === 'R' ? CW : 0;
  const g2 = ctx.createLinearGradient(outer, 0, outer - dir * 16, 0);
  g2.addColorStop(0, 'rgba(0,0,0,0.07)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2; ctx.fillRect(P.side === 'R' ? CW - 16 : 0, 0, 16, CH);
}
function header(ctx, P) {
  const d = P.def, th = P.th;
  if (th.n >= 1 && th.n <= 8) {
    const ty = 150 + (th.n - 1) * 116, tx = P.side === 'R' ? CW - 22 : 0;
    ctx.fillStyle = th.a; rr(ctx, tx - (P.side === 'R' ? 0 : 8), ty, 30, 100, 6); ctx.fill();
    ctx.save(); ctx.translate(P.side === 'R' ? CW - 9 : 11, ty + 48); ctx.rotate(Math.PI / 2);
    label(ctx, th.n <= 7 ? 'บท ' + th.n : 'ทบทวน', 0, 0, { size: 15, wt: 600, color: '#fff' }); ctx.restore();
  }
  label(ctx, th.ch, P.X0, 80, { size: 18, wt: 600, color: th.a, align: 'left' });
  ctx.font = `600 42px ${F.display}`; ctx.fillStyle = C.ink; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  ctx.fillText(d.title, P.X0, 142);
  if (d.sub) label(ctx, d.sub, P.X0, 172, { size: 19, wt: 500, color: C.soft, align: 'left' });
  ctx.fillStyle = th.a; ctx.fillRect(P.X0, 192, 70, 3);
  ctx.fillStyle = 'rgba(80,70,50,0.18)'; ctx.fillRect(P.X0 + 76, 193, P.X1 - P.X0 - 76, 1);
}
function footer(ctx, P) {
  const y = CH - 34;
  if (P.side === 'R') {
    label(ctx, String(P.i), P.X1, y, { size: 20, wt: 600, color: C.soft, align: 'right' });
    label(ctx, 'เอกภพ อวกาศ และโลกของเรา', P.X1 - 40, y, { size: 14, wt: 500, color: 'rgba(93,104,114,0.7)', align: 'right' });
  } else {
    label(ctx, String(P.i), P.X0, y, { size: 20, wt: 600, color: C.soft, align: 'left' });
    label(ctx, P.th.ch, P.X0 + 40, y, { size: 14, wt: 500, color: 'rgba(93,104,114,0.7)', align: 'left' });
  }
}
function slider(ctx, P, key, x, y, w, o = {}) {
  const { min = 0, max = 1, left = '', right = '', title = '', value = '', col = P.th.a } = o;
  const f = (P.st[key] - min) / (max - min);
  if (title) label(ctx, title, x, y - 30, { size: 18, wt: 600, color: C.ink, align: 'left' });
  if (value) label(ctx, value, x + w, y - 30, { size: 18, wt: 700, color: col, align: 'right' });
  ctx.fillStyle = 'rgba(120,105,80,0.22)'; rr(ctx, x, y - 6, w, 12, 6); ctx.fill();
  ctx.fillStyle = rgba(col, 0.85); rr(ctx, x, y - 6, Math.max(12, f * w), 12, 6); ctx.fill();
  const kx = x + f * w;
  circle(ctx, kx, y + 2, 17, 'rgba(0,0,0,0.12)'); circle(ctx, kx, y, 16, '#fff');
  ctx.strokeStyle = col; ctx.lineWidth = 4; ring(ctx, kx, y, 16);
  ctx.fillStyle = col; for (const d of [-5, 0, 5]) ctx.fillRect(kx + d - 1, y - 6, 2, 12);
  if (left) label(ctx, left, x, y + 25, { size: 15, wt: 500, color: C.soft, align: 'left' });
  if (right) label(ctx, right, x + w, y + 25, { size: 15, wt: 500, color: C.soft, align: 'right' });
  P.zones.push({ x: x - 24, y: y - 30, w: w + 48, h: 60, cursor: 'ew-resize', drag: (px) => { P.st[key] = min + (max - min) * clamp((px - x) / w, 0, 1); } });
}
function hint(ctx, P, txt, y) {
  label(ctx, '☝ ' + txt, P.cx, y, { size: 16, wt: 600, color: P.th.a, bg: rgba(P.th.a, 0.1), pad: 8, r: 14 });
}

