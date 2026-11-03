# Page contract for the Earth & Space flip book

The book is a three.js 3D flip book for Thai upper-secondary students (ม.4–6, Earth and Space Science, semester 1). The engine already exists. A part file only supplies page definitions and the 2D canvas drawings for its pages. The sister book `../flipbook.html` (wind and ocean circulation) is the style reference. Read its diagram functions `dPGF`, `dCoriolis`, `dLayers`, `dGyres`, `dENSO` to see the level of craft expected.

## Files

- `src/helpers.js` holds every drawing helper and the theme `TH`. Read it in full before writing. Do not edit it.
- `src/parts/<letter>.js` is your file. It ends with `const PART_<LETTER> = [ ...page defs... ];` in page order.
- All parts are concatenated into one ES module. **Prefix every top-level identifier you create with `<LETTER>_`** (for example `B_dNebula`, `B_PLANETS`) so names never collide.
- Build a flat preview with `sh build.sh dev <letter> <firstPageIndex>` from `earth-space/`. Open `http://127.0.0.1:8765/earth-space/dev-<letter>.html?p=<index>` in **your own browser tab** (create it with `tabs_create` and pass its `tabId` on every browser call; never touch other tabs, other agents share the pane). The bar on top prints errors, the text-fit scale of text pages and the zone count. Arrow keys change page. Drag on the canvas works like in the book.

## Page order and sides

Pages alternate. An odd index is a left page, an even index is a right page. Each topic is one spread: a **text page (odd, left)** followed by an **interactive diagram page (even, right)**.

## Page definitions

Text page:
```js
{ th: TH.star, title: 'ชื่อหัวข้อภาษาไทย', sub: 'English subtitle', blocks: [
  { p: 'ย่อหน้า ใช้ **ตัวหนา** ได้' },
  { h: 'หัวข้อย่อย' },
  { li: ['ข้อ 1', 'ข้อ 2'] },
  { box: 'กล่องเน้น', tone: 'key' | 'note' | 'warn' },
  { f: 'สูตร เช่น m − M = 5 log(d/10)', cap: 'คำอธิบายตัวแปร' },
  { table: { cols: [0.3, 0.7], head: ['หัว', 'หัว'], rows: [['a', 'b']] } },
  { gap: 10 },
] }
```
The renderer shrinks text to fit, down to scale 0.72. Aim for the dev bar to show `text scale 1` or `0.96`. If it reports below 0.88, cut words. About 230–300 Thai words per text page is the budget.

Diagram page:
```js
{ kind: 'diagram', th: TH.star, title: 'ชื่อภาพโต้ตอบ', sub: 'ภาพโต้ตอบ: สิ่งที่ลากได้', draw: X_dSomething, init: () => ({ mass: 1 }) }
```
`draw(ctx, t, P)` runs every frame. `t` is seconds. `P.st` is the state from `init` and persists. `P.X0`, `P.X1` are the content margins, `P.cx` the centre, `P.th.a` the chapter colour. The canvas is 900 × 1170 px. The header ends at y ≈ 196. The footer is at y = 1136. Draw between y = 210 and y = 1100.

Interaction is through zones pushed each frame:
```js
P.zones.push({ x, y, w, h, cursor: 'ew-resize' | 'pointer' | 'grab', drag: (px, py, phase) => { ... }, click: () => { ... } });
```
`phase` is `'start'`, `'move'` or `'end'` (on `'end'` px and py may be −1). `slider(ctx, P, key, x, y, w, { min, max, title, value, left, right })` draws a slider bound to `P.st[key]` and registers its zone. `hint(ctx, P, text, y)` draws the "☝ ลาก…" pill.

## What every diagram page must do

The teacher's explicit request: every moving picture can be dragged with the mouse, and the reader can **see which way they dragged and how the result changes**.

1. One main illustration in a self-contained rounded panel in the upper part of the page (roughly y 236 to 700). It must be draggable directly (not only through a slider). Leave nothing interactive outside it except sliders, buttons and readouts below.
2. A live readout below the panel that names the current state in words and numbers (for example `มวล 8 M☉ → จบชีวิตเป็นซูเปอร์โนวา`). Show direction cues on the drag affordance (arrows or labels at both ends such as `← ร้อนน้อย · ร้อนมาก →`).
3. A `hint()` line inside or just below the panel saying what to drag.
4. A second, smaller static or lightly animated element further down (comparison, scale bar, small table) so the page is full and teaches something extra.
5. Animate gently with `t` (drifting particles, pulsing, flowing arrows). Keep it cheap: no more than a few hundred primitives per frame, no `getImageData`, cache expensive gradients or offscreen canvases in a variable created once.
6. Science must be correct at the ม.6 level used in Thai textbooks (สสวท.). Use real numbers (13.8 billion years, 380,000 years for CMB, 2.7 K, H₀ ≈ 70 km/s/Mpc, Sun 5,800 K, 1 AU, 35,786 km for GEO, 7.9 and 11.2 km/s, P and S wave behaviour, √(gd) for tsunami speed, Richter ≈ 32× energy per unit, and so on).

## Visual style

- Paper-cream page, chapter colour as accent, `C.ink` for text, `C.soft` for secondary text. Space scenes may use a dark rounded panel (deep navy `#0b1730` to `#14254a`) inside the page, like a window, with the rest of the page still paper.
- Fonts: `F.display` for big headings, `F.label` for diagram labels, `F.body` for running text. Labels 15–20 px, readouts 19–26 px.
- Thai text on canvas: use `label()` for single lines, `para()` or `wrap()` + `drawLines()` for wrapping. Keep labels short so they never overlap. Check for overlaps in the preview.
- English technical terms appear in parentheses on first use, for example `การเลื่อนไปทางแดง (redshift)`.

## Narration

Also write `src/parts/<letter>.narration.md` with one section per page in your range, in exactly this form:

```
## หน้า 12 · ชื่อหน้า

ข้อความที่จะอ่านออกเสียง
```

Rules, set by the teacher:
- Spoken Thai addressed to students, friendly, male speaker ending with ครับ sparingly.
- **Technical terms are written in English letters** so the voice reads them in English: Big Bang, redshift, Hubble, cosmic microwave background, nebula, protostar, main sequence, red giant, white dwarf, supernova, neutron star, black hole, Hertzsprung-Russell diagram, magnitude, solar wind, coronal mass ejection, aurora, geostationary, lithosphere, asthenosphere, mantle, convergent, divergent, transform, P wave, S wave, tsunami, and similar. Ordinary Thai words stay Thai.
- Write numbers as digits. Avoid brackets, slashes, arrows and symbols the voice would read strangely. Write units in words (กิโลเมตรต่อวินาที, เคลวิน).
- Text page narration explains the page content in a teacher's voice in about 380–480 characters. Diagram page narration says what to drag, which way, and what to notice, in about 250–350 characters.
- The whole book shares one paid credit budget, so do not exceed these lengths.

## Done means

- `sh build.sh dev <letter> <first>` produces a page with no error in the bar for every page in your range.
- You looked at a screenshot of every page, dragged each diagram at both extremes, and fixed overlaps, clipping and unreadable text.
- Report back: the page list (index, title), the main rectangle of each diagram's draggable panel as `[x, y, w, h]`, the `P.st` keys, and anything you were unsure about scientifically.
