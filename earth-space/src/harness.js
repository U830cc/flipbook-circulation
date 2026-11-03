// ============================================================ dev harness (flat 2D, no three.js): one part's pages, draggable like in the book
const view = document.getElementById('view'), vctx = view.getContext('2d'), bar = document.getElementById('bar');
const qs = new URLSearchParams(location.search);
let cur = null, clock = 0, last = performance.now(), act = null;
function devBuild(i) {
  const def = DEVPAGES[i - DEVSTART], side = i % 2 === 0 ? 'R' : 'L', cv = makeCanvas(), ctx = cv.getContext('2d');
  const P = { i, def, side, cv, ctx, th: def.th || TH.intro, X0: side === 'R' ? 92 : 66, X1: side === 'R' ? 834 : 808, zones: [], st: def.init ? def.init() : {}, dirty: true, clock: 0 };
  P.cx = (P.X0 + P.X1) / 2;
  const base = makeCanvas(), b = base.getContext('2d');
  paperBase(b, P); header(b, P); footer(b, P);
  if (def.blocks) {
    let s = 1, y;
    for (; s > 0.72; s -= 0.04) { b.save(); y = renderBlocks(b, def.blocks, P.X0, 226, P.X1 - P.X0, P.th, s); b.restore(); if (y <= CH - 92) break; b.clearRect(0, 0, CW, CH); paperBase(b, P); header(b, P); footer(b, P); }
    P.fit = { scale: +s.toFixed(2), bottom: Math.round(y) };
    P.draw = () => ctx.drawImage(base, 0, 0);
  } else { P.base = base; P.draw = (t) => { ctx.drawImage(base, 0, 0); def.draw(ctx, t, P); }; }
  return P;
}
function show(i) {
  i = clamp(i, DEVSTART, DEVSTART + DEVPAGES.length - 1);
  try { cur = devBuild(i); window.__P = cur; } catch (e) { fail(e); }
  history.replaceState(null, '', '?p=' + i);
}
function fail(e) { window.__err = String(e && e.stack || e); bar.textContent = 'ERROR: ' + window.__err; bar.style.background = '#c92a2a'; }
function zoneHit(P, x, y) { for (let k = P.zones.length - 1; k >= 0; k--) { const z = P.zones[k]; if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) return z; } return null; }
function toCanvas(e) { const r = view.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * CW, y: (e.clientY - r.top) / r.height * CH }; }
view.addEventListener('pointerdown', (e) => {
  const p = toCanvas(e), z = cur && zoneHit(cur, p.x, p.y); if (!z) return;
  act = { z, moved: false, x: p.x, y: p.y }; view.setPointerCapture(e.pointerId);
  if (z.drag) z.drag(p.x, p.y, 'start');
});
view.addEventListener('pointermove', (e) => {
  const p = toCanvas(e);
  if (act) { if (Math.hypot(p.x - act.x, p.y - act.y) > 4) act.moved = true; if (act.z.drag) act.z.drag(p.x, p.y, 'move'); return; }
  const z = cur && zoneHit(cur, p.x, p.y); view.style.cursor = z ? (z.cursor || 'pointer') : 'default';
});
view.addEventListener('pointerup', (e) => {
  if (!act) return; const p = toCanvas(e);
  if (act.z.drag) act.z.drag(p.x, p.y, 'end');
  if (act.z.click && !act.moved) act.z.click();
  act = null;
});
addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(cur.i + 1); if (e.key === 'ArrowLeft') show(cur.i - 1); });
document.getElementById('prev').onclick = () => show(cur.i - 1);
document.getElementById('next').onclick = () => show(cur.i + 1);
function tick() {
  const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; clock += dt;
  if (cur && !window.__err) {
    try {
      cur.zones = []; cur.draw(clock); vctx.clearRect(0, 0, CW, CH); vctx.drawImage(cur.cv, 0, 0);
      bar.textContent = `page ${cur.i} (${cur.side}) · ${cur.def.title || cur.def.kind}` + (cur.fit ? ` · text scale ${cur.fit.scale}, bottom ${cur.fit.bottom}/${CH - 92}` : ` · zones ${cur.zones.length}`);
    } catch (e) { fail(e); }
  }
  setTimeout(tick, 33);
}
Promise.all(['600 30px Mitr', '400 26px Sarabun', '700 26px Sarabun', '600 20px "IBM Plex Sans Thai"'].map(f => document.fonts.load(f, 'ทดสอบ'))).finally(() => { show(+(qs.get('p') ?? DEVSTART)); tick(); });
