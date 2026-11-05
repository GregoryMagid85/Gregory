// Winnie Weekly Update — infographic explainer. Pure function of time: window.seek(t) paints frame t.
// Timing is in SECONDS against the narration (words.json); the music grid is only used for SFX.
// Real footage only (muted clips in assets/clips/*, the outfit screenshots in assets/img/).
// Icons (apple, sponge, ball, outfit slots, checklist) are drawn from scratch in code.
import * as M from './lib/motion.js';

const { W, H, E, prog, lerp, clamp, spring, SPRING, wobble, font, layout, text, rrect, hash01 } = M;

// ---------------------------------------------------------------- tokens
const C = {
  bg: '#FFD84D', bgDot: '#FFCA2C', ink: '#2B2240', card: '#FFFFFF', soft: '#FFF6D6',
  accent: '#FF8A1F',            // the one accent (also the caption colour)
  red: '#E8565B', teal: '#4FC3B8', blue: '#3FA9F5', yellow: '#F7B731', green: '#7BC86C', purple: '#8E6BD8',
};
const DISPLAY = 'Display', UI = 'UI';
const FPS_CLIP = 24;

// ---------------------------------------------------------------- narration words
let WORDS = [], LINES = [];
const norm = (w) => w.toLowerCase().replace(/[^a-z']/g, '');
const at = (w, n = 0) => {                         // start time of the n-th occurrence of word w
  const hits = WORDS.filter((x) => norm(x.w) === norm(w));
  if (!hits[n]) throw new Error('cue word not in narration: ' + w);
  return hits[n].s;
};
function buildLines() {
  // a caption line = one or more phrases, broken at sentence ends or ~6 words
  let cur = [];
  const flush = () => { if (cur.length) LINES.push(cur); cur = []; };
  WORDS.forEach((w, i) => {
    const prev = WORDS[i - 1];
    if (prev && (prev.p !== w.p) && (/[.!?:]$/.test(prev.w) || cur.length >= 5 || w.scene !== prev.scene)) flush();
    if (cur.length >= 7) flush();
    cur.push(w);
  });
  flush();
}

// ---------------------------------------------------------------- scene timeline (seconds)
const T = { journey: 12.6, care: 18.6, rive: 27.35, lab: 31.2, outfit: 37.0, next: 47.5, end: 51.85 };
const DUR = 58;

// ---------------------------------------------------------------- clip frames (lazy, deterministic)
const CLIPS = { evo: 91, lab: 331, hatch: 504, rive: 144 };
const CACHE = new Map(); const MISSING = new Set();
function clipFrame(name, sec) {
  const n = CLIPS[name];
  const i = clamp(Math.floor(sec * FPS_CLIP + 1e-6) + 1, 1, n);
  const url = `assets/clips/${name}/${String(i).padStart(4, '0')}.jpg`;
  const im = CACHE.get(url);
  if (im && im.complete && im.naturalWidth) return im;
  MISSING.add(url); return null;
}
async function loadUrls(urls) {
  await Promise.all(urls.map(async (u) => {
    if (CACHE.has(u) && CACHE.get(u).naturalWidth) return;
    const im = new Image(); im.src = u; CACHE.set(u, im);
    try { await im.decode(); } catch { console.error('frame failed', u); }
  }));
  if (CACHE.size > 420) {                         // simple LRU trim (Map keeps insertion order)
    const drop = CACHE.size - 360; let k = 0;
    for (const key of CACHE.keys()) { if (k++ >= drop) break; CACHE.delete(key); }
  }
}

// ---------------------------------------------------------------- helpers
const sp = (t, t0, cfg = SPRING.bouncy) => spring(t - t0, cfg);
const ease = (t, a, b, f = E.outCubic) => f(prog(t, a, b));
function card(ctx, x, y, w, h, r = 28, { fill = C.card, stroke = C.ink, lw = 6, shadow = 10 } = {}) {
  if (shadow) { rrect(ctx, x, y + shadow, w, h, r); ctx.fillStyle = C.ink; ctx.fill(); }
  rrect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); }
}
function pop(ctx, k, cx, cy, fn) {               // scale about a point by spring value k
  if (k <= 0.001) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy); fn(); ctx.restore();
}
function chip(ctx, str, x, y, { size = 34, bg = C.ink, fg = '#fff', pad = 22, align = 'left', fam = UI, weight = 800 } = {}) {
  ctx.font = font(size, weight, fam);
  const w = ctx.measureText(str).width + pad * 2, h = size * 1.55;
  const x0 = align === 'center' ? x - w / 2 : x;
  rrect(ctx, x0, y, w, h, h / 2); ctx.fillStyle = bg; ctx.fill();
  ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.fillText(str, x0 + pad, y + h / 2 + size * 0.04); ctx.textBaseline = 'alphabetic';
  return { w, h, x: x0 };
}
function imgCover(ctx, img, sx, sy, sw, sh, x, y, w, h) {   // crop source rect to cover dest rect
  if (!img) return;
  const s = Math.max(w / sw, h / sh), cw = w / s, ch = h / s;
  ctx.drawImage(img, sx + (sw - cw) / 2, sy + (sh - ch) / 2, cw, ch, x, y, w, h);
}
function clipRR(ctx, x, y, w, h, r, fn) { ctx.save(); rrect(ctx, x, y, w, h, r); ctx.clip(); fn(); ctx.restore(); }
function arrow(ctx, x1, y1, x2, y2, p, color = C.ink, lw = 7) {
  if (p <= 0) return;
  const x = lerp(x1, x2, p), y = lerp(y1, y2, p);
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x, y); ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1), L = 26 * Math.min(1, p * 3);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - L * Math.cos(a - 0.5), y - L * Math.sin(a - 0.5));
  ctx.moveTo(x, y); ctx.lineTo(x - L * Math.cos(a + 0.5), y - L * Math.sin(a + 0.5)); ctx.stroke();
}
function headline(ctx, t, str, x, y, t0, size = 92, color = C.ink, accentWords = []) {
  // word-staggered spring rise, clipped per line
  ctx.font = font(size, 700, DISPLAY);
  let cx = x;
  str.split(' ').forEach((w, i) => {
    const k = sp(t, t0 + i * 0.07, SPRING.bouncy);
    const ww = ctx.measureText(w + ' ').width;
    if (k > 0.001) {
      ctx.save(); ctx.globalAlpha = clamp(k * 2);
      ctx.translate(cx, y + (1 - k) * size * 0.7);
      ctx.fillStyle = accentWords.includes(i) ? C.accent : color;
      ctx.font = font(size, 700, DISPLAY); ctx.fillText(w, 0, 0); ctx.restore();
    }
    cx += ww;
  });
}
function burst(ctx, cx, cy, t, t0, r0 = 60, r1 = 170, n = 12, color = C.accent) {
  const p = prog(t, t0, t0 + 0.55); if (p <= 0 || p >= 1) return;
  const e = E.outCubic(p);
  ctx.strokeStyle = color; ctx.lineWidth = 9 * (1 - p) + 1; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * M.TAU + 0.2;
    const ra = lerp(r0, r1, e), rb = lerp(r0, r1, Math.min(1, e * 1.35));
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * ra * 0.8, cy + Math.sin(a) * ra * 0.8); ctx.lineTo(cx + Math.cos(a) * rb, cy + Math.sin(a) * rb); ctx.stroke();
  }
}

// ---------------------------------------------------------------- drawn icons (from scratch)
const ICON = {
  apple(ctx, s) {
    ctx.fillStyle = C.red; ctx.beginPath();
    ctx.moveTo(0, -0.28 * s);
    ctx.bezierCurveTo(0.35 * s, -0.5 * s, 0.62 * s, -0.12 * s, 0.42 * s, 0.25 * s);
    ctx.bezierCurveTo(0.3 * s, 0.5 * s, 0.1 * s, 0.5 * s, 0, 0.42 * s);
    ctx.bezierCurveTo(-0.1 * s, 0.5 * s, -0.3 * s, 0.5 * s, -0.42 * s, 0.25 * s);
    ctx.bezierCurveTo(-0.62 * s, -0.12 * s, -0.35 * s, -0.5 * s, 0, -0.28 * s); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(-0.22 * s, -0.08 * s, 0.07 * s, 0.14 * s, 0.4, 0, M.TAU); ctx.fill();
    ctx.strokeStyle = '#6B3B1F'; ctx.lineWidth = 0.07 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -0.28 * s); ctx.quadraticCurveTo(0.02 * s, -0.45 * s, 0.08 * s, -0.52 * s); ctx.stroke();
    ctx.fillStyle = C.green; ctx.beginPath(); ctx.ellipse(0.2 * s, -0.42 * s, 0.16 * s, 0.07 * s, -0.5, 0, M.TAU); ctx.fill();
  },
  sponge(ctx, s) {
    ctx.save(); ctx.rotate(-0.35);
    ctx.fillStyle = C.yellow; ctx.beginPath();
    ctx.ellipse(-0.2 * s, 0, 0.26 * s, 0.3 * s, 0, 0, M.TAU); ctx.ellipse(0.2 * s, 0, 0.26 * s, 0.3 * s, 0, 0, M.TAU);
    ctx.fill(); ctx.fillRect(-0.2 * s, -0.22 * s, 0.4 * s, 0.44 * s);
    ctx.fillStyle = '#E39A14';
    [[-0.28, -0.1], [-0.1, 0.12], [0.08, -0.12], [0.26, 0.1], [-0.3, 0.14], [0.22, -0.16]].forEach(([x, y], i) => {
      ctx.beginPath(); ctx.arc(x * s, y * s, (0.035 + 0.02 * (i % 2)) * s, 0, M.TAU); ctx.fill();
    });
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    [[0.38, -0.36, 0.08], [0.5, -0.18, 0.05], [-0.42, -0.38, 0.06]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x * s, y * s, r * s, 0, M.TAU); ctx.fill(); });
  },
  ball(ctx, s) {
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(0, 0, 0.42 * s, 0, M.TAU); ctx.fill();
    ctx.fillStyle = '#8FD3FF';
    [[-0.15, -0.15, 0.09], [0.15, -0.05, 0.08], [-0.05, 0.18, 0.08], [0.2, 0.22, 0.05], [-0.25, 0.08, 0.05]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x * s, y * s, r * s, 0, M.TAU); ctx.fill(); });
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(-0.2 * s, -0.24 * s, 0.1 * s, 0.05 * s, -0.6, 0, M.TAU); ctx.fill();
  },
  hat(ctx, s) {
    ctx.fillStyle = C.purple;
    ctx.beginPath(); ctx.ellipse(0, 0.18 * s, 0.46 * s, 0.12 * s, 0, 0, M.TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-0.32 * s, 0.18 * s); ctx.bezierCurveTo(-0.34 * s, -0.4 * s, 0.34 * s, -0.4 * s, 0.32 * s, 0.18 * s); ctx.fill();
    ctx.fillStyle = '#B79BF0'; ctx.beginPath(); ctx.ellipse(-0.1 * s, -0.12 * s, 0.07 * s, 0.12 * s, 0.4, 0, M.TAU); ctx.fill();
  },
  glasses(ctx, s) {
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 0.09 * s;
    ctx.fillStyle = 'rgba(160,220,255,.55)';
    [-0.24, 0.24].forEach((x) => { ctx.beginPath(); ctx.arc(x * s, 0, 0.2 * s, 0, M.TAU); ctx.fill(); ctx.stroke(); });
    ctx.beginPath(); ctx.moveTo(-0.05 * s, -0.02 * s); ctx.quadraticCurveTo(0, -0.08 * s, 0.05 * s, -0.02 * s); ctx.stroke();
  },
  scarf(ctx, s) {
    ctx.fillStyle = '#F4C430'; rrect(ctx, -0.42 * s, -0.16 * s, 0.84 * s, 0.24 * s, 0.1 * s); ctx.fill();
    ctx.fillRect(0.12 * s, 0, 0.18 * s, 0.42 * s);
    ctx.save(); rrect(ctx, -0.42 * s, -0.16 * s, 0.84 * s, 0.24 * s, 0.1 * s); ctx.clip();
    ctx.fillStyle = C.ink; for (let i = -6; i < 6; i++) { ctx.beginPath(); ctx.moveTo(i * 0.14 * s, 0.1 * s); ctx.lineTo((i * 0.14 + 0.07) * s, 0.1 * s); ctx.lineTo((i * 0.14 + 0.16) * s, -0.18 * s); ctx.lineTo((i * 0.14 + 0.09) * s, -0.18 * s); ctx.fill(); }
    ctx.restore();
  },
  pants(ctx, s) {
    ctx.fillStyle = '#9A7FE0';
    ctx.beginPath(); ctx.moveTo(-0.34 * s, -0.3 * s); ctx.lineTo(0.34 * s, -0.3 * s); ctx.lineTo(0.38 * s, 0.4 * s); ctx.lineTo(0.06 * s, 0.4 * s);
    ctx.lineTo(0, 0.02 * s); ctx.lineTo(-0.06 * s, 0.4 * s); ctx.lineTo(-0.38 * s, 0.4 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6B4FB8'; ctx.fillRect(-0.34 * s, -0.3 * s, 0.68 * s, 0.1 * s);
    ctx.fillStyle = '#fff'; ctx.fillRect(-0.05 * s, -0.29 * s, 0.1 * s, 0.08 * s);
  },
  shirt(ctx, s) {
    ctx.fillStyle = '#4FC3B8';
    ctx.beginPath(); ctx.moveTo(-0.16 * s, -0.36 * s); ctx.lineTo(-0.46 * s, -0.2 * s); ctx.lineTo(-0.36 * s, 0.02 * s); ctx.lineTo(-0.26 * s, -0.04 * s);
    ctx.lineTo(-0.26 * s, 0.4 * s); ctx.lineTo(0.26 * s, 0.4 * s); ctx.lineTo(0.26 * s, -0.04 * s); ctx.lineTo(0.36 * s, 0.02 * s); ctx.lineTo(0.46 * s, -0.2 * s);
    ctx.lineTo(0.16 * s, -0.36 * s); ctx.quadraticCurveTo(0, -0.2 * s, -0.16 * s, -0.36 * s); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0.1 * s, 0.08 * s, 0, M.TAU); ctx.fill();
  },
  check(ctx, s, color = '#fff') {
    ctx.strokeStyle = color; ctx.lineWidth = 0.14 * s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-0.28 * s, 0.02 * s); ctx.lineTo(-0.08 * s, 0.22 * s); ctx.lineTo(0.3 * s, -0.2 * s); ctx.stroke();
  },
  lock(ctx, s) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 0.1 * s; ctx.beginPath(); ctx.arc(0, -0.08 * s, 0.2 * s, Math.PI, 0); ctx.lineTo(0.2 * s, 0.05 * s); ctx.moveTo(-0.2 * s, 0.05 * s); ctx.lineTo(-0.2 * s, -0.08 * s); ctx.stroke();
    ctx.fillStyle = C.yellow; rrect(ctx, -0.32 * s, 0, 0.64 * s, 0.44 * s, 0.08 * s); ctx.fill(); ctx.lineWidth = 0.06 * s; ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0.2 * s, 0.06 * s, 0, M.TAU); ctx.fill();
  },
  share(ctx, s) {
    const pts = [[0.24, -0.26], [-0.24, 0], [0.24, 0.26]];
    ctx.strokeStyle = C.ink; ctx.lineWidth = 0.08 * s;
    ctx.beginPath(); ctx.moveTo(pts[0][0] * s, pts[0][1] * s); ctx.lineTo(pts[1][0] * s, pts[1][1] * s); ctx.lineTo(pts[2][0] * s, pts[2][1] * s); ctx.stroke();
    pts.forEach(([x, y], i) => { ctx.fillStyle = [C.teal, C.blue, C.teal][i]; ctx.beginPath(); ctx.arc(x * s, y * s, 0.14 * s, 0, M.TAU); ctx.fill(); ctx.lineWidth = 0.05 * s; ctx.stroke(); });
  },
  rocket(ctx, s) {
    ctx.save(); ctx.rotate(0.6);
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.moveTo(-0.12 * s, 0.3 * s); ctx.lineTo(0, 0.52 * s); ctx.lineTo(0.12 * s, 0.3 * s); ctx.fill();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(-0.16 * s, 0.1 * s); ctx.lineTo(-0.3 * s, 0.34 * s); ctx.lineTo(-0.12 * s, 0.3 * s); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0.16 * s, 0.1 * s); ctx.lineTo(0.3 * s, 0.34 * s); ctx.lineTo(0.12 * s, 0.3 * s); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = C.ink; ctx.lineWidth = 0.05 * s;
    ctx.beginPath(); ctx.moveTo(0, -0.48 * s); ctx.bezierCurveTo(0.26 * s, -0.2 * s, 0.2 * s, 0.2 * s, 0.14 * s, 0.32 * s); ctx.lineTo(-0.14 * s, 0.32 * s);
    ctx.bezierCurveTo(-0.2 * s, 0.2 * s, -0.26 * s, -0.2 * s, 0, -0.48 * s); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(0, -0.08 * s, 0.08 * s, 0, M.TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  },
  play(ctx, s) {
    ctx.fillStyle = C.accent; ctx.beginPath(); ctx.moveTo(-0.18 * s, -0.26 * s); ctx.lineTo(0.28 * s, 0); ctx.lineTo(-0.18 * s, 0.26 * s); ctx.closePath(); ctx.fill();
  },
  tap(ctx, s) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = 0.06 * s; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-0.05 * s, -0.25 * s, 0.16 * s, 0, M.TAU); ctx.strokeStyle = C.accent; ctx.stroke();
    ctx.strokeStyle = C.ink;
    rrect(ctx, -0.13 * s, -0.26 * s, 0.16 * s, 0.5 * s, 0.08 * s); ctx.fill(); ctx.stroke();
    rrect(ctx, -0.13 * s, 0.02 * s, 0.4 * s, 0.38 * s, 0.12 * s); ctx.fill(); ctx.stroke();
  },
};
function iconTile(ctx, name, cx, cy, s, { bg = C.card, ring = null, ringP = 0, ringColor = C.green, stroke = C.ink } = {}) {
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy + s * 0.06, s * 0.5, 0, M.TAU); ctx.fill();
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, s * 0.5, 0, M.TAU); ctx.fill();
  ctx.lineWidth = Math.max(4, s * 0.05); ctx.strokeStyle = stroke; ctx.stroke();
  if (ring) {
    ctx.lineWidth = s * 0.08; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(43,34,64,.12)'; ctx.beginPath(); ctx.arc(cx, cy, s * 0.4, 0, M.TAU); ctx.stroke();
    ctx.strokeStyle = ringColor; ctx.beginPath(); ctx.arc(cx, cy, s * 0.4, -Math.PI / 2, -Math.PI / 2 + M.TAU * clamp(ringP, 0.001, 1)); ctx.stroke();
  }
  ctx.save(); ctx.translate(cx, cy); ICON[name](ctx, s * (ring ? 0.55 : 0.7)); ctx.restore();
}

// ---------------------------------------------------------------- background
function background(ctx, t) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.bgDot;
  const off = (t * 14) % 60;
  for (let y = -60; y < H + 60; y += 60) for (let x = -60; x < W + 60; x += 60) {
    const sx = x + off + ((y / 60) % 2 ? 30 : 0), sy = y + off * 0.5;
    ctx.beginPath(); ctx.arc(sx, sy, 7, 0, M.TAU); ctx.fill();
  }
}

// ---------------------------------------------------------------- crops of real stills (source px)
const CROP = {
  st2: ['hatch', 2.0, [240, 60, 300, 300]],     // hatchling in egg (Rive editor canvas)
  st3: ['lab', 1.0, [124, 262, 230, 230]],      // Stage 3 baby (Rive Lab)
  st4: ['lab', 0.0, [108, 212, 260, 260]],      // Stage 4 kid (Rive Lab)
  st5: ['evo', 3.75, [118, 92, 400, 400]],      // Stage 5 winged (in-app, after evolution)
};
function stillCircle(ctx, key, cx, cy, d, ring = C.ink) {
  const [clip, sec, [sx, sy, sw, sh]] = CROP[key];
  const im = clipFrame(clip, sec);
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy + 10, d / 2, 0, M.TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, M.TAU); ctx.clip();
  ctx.fillStyle = key === 'st2' ? '#3A3A3A' : C.soft; ctx.fillRect(cx - d / 2, cy - d / 2, d, d);
  if (im) imgCover(ctx, im, sx, sy, sw, sh, cx - d / 2, cy - d / 2, d, d);
  ctx.restore();
  ctx.lineWidth = 7; ctx.strokeStyle = ring; ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, M.TAU); ctx.stroke();
}

// ================================================================= S1 HOOK  (0 .. 12.6)
function sHook(ctx, t) {
  const tWatch = at('watch'), tFour = at('four...'), tPoof = at('poof!'), tFive = at('five!'), tWings = at('wings,'), tTail = at('tail,'), tHungry = at("i'm");
  // --- left: title block
  const k0 = sp(t, 0.15, SPRING.snappy);
  pop(ctx, k0, 130, 150, () => chip(ctx, 'WEEKLY UPDATE  ·  NOV 5', 110, 120, { size: 30, bg: C.ink }));
  headline(ctx, t, 'Big news', 110, 290, at('big') - 0.1, 104);
  headline(ctx, t, 'this week:', 110, 400, at('big') + 0.15, 104);
  headline(ctx, t, 'Winnie', 110, 540, at('winnie') - 0.05, 128, C.ink);
  headline(ctx, t, 'evolved!', 110, 670, at('evolved!') - 0.05, 128, C.accent);
  burst(ctx, 640, 615, t, at('evolved!') + 0.1, 70, 180, 10);

  // --- stage chips 4 -> 5 under the title
  const kc = sp(t, tFour - 0.05, SPRING.bouncy);
  pop(ctx, kc, 230, 780, () => {
    stillCircle(ctx, 'st4', 190, 790, 130);
    chip(ctx, 'STAGE 4', 120, 865, { size: 26, bg: C.card, fg: C.ink });
  });
  arrow(ctx, 275, 790, 385, 790, ease(t, tPoof, tPoof + 0.35), C.ink, 8);
  const k5 = sp(t, tFive - 0.08, SPRING.bouncy);
  pop(ctx, k5, 470, 790, () => {
    stillCircle(ctx, 'st5', 470, 790, 150, C.accent);
    chip(ctx, 'STAGE 5', 398, 875, { size: 26, bg: C.accent, fg: '#fff' });
  });
  burst(ctx, 470, 790, t, tFive, 80, 150, 12);

  // --- right: the real evolution recording
  const kx = sp(t, 0.25, SPRING.gentle);
  const cw = 720, ch = 731, cx = lerp(W + 40, 1060, kx), cy = 120;
  // push-in on "watch this", zoom to speech bubble on "I'm hungry"
  const push = 1 + 0.04 * ease(t, tWatch, tWatch + 0.8, E.inOutCubic);
  const zb = ease(t, tHungry - 0.35, tHungry + 0.45, E.inOutCubic);
  ctx.save();
  ctx.translate(cx + cw / 2, cy + ch / 2); ctx.scale(push, push); ctx.translate(-(cx + cw / 2), -(cy + ch / 2));
  card(ctx, cx, cy, cw, ch, 34);
  const clipT = clamp(t - (tPoof - 0.36), 0, 3.78);
  const im = clipFrame('evo', clipT);
  clipRR(ctx, cx + 3, cy + 3, cw - 6, ch - 6, 31, () => {
    if (!im) return;
    // zoom (log-space) toward the bubble at src (515,185)
    const z = Math.exp(lerp(0, Math.log(1.9), zb));
    const fx = lerp(320, 470, zb), fy = lerp(325, 230, zb);
    const sw = 640 / z, sh = 650 / z;
    const sx = clamp(fx - sw / 2, 0, 640 - sw), sy = clamp(fy - sh / 2, 0, 650 - sh);
    ctx.drawImage(im, sx, sy, sw, sh, cx + 3, cy + 3, cw - 6, ch - 6);
  });
  ctx.restore();
  // wing / tail callouts (only while not zoomed)
  const vis = 1 - zb;
  if (vis > 0.02) {
    ctx.save(); ctx.globalAlpha = vis;
    const kw = sp(t, tWings, SPRING.bouncy), kt = sp(t, tTail, SPRING.bouncy);
    const sx = (x) => cx + (x / 640) * cw, sy = (y) => cy + (y / 650) * ch;
    if (kw > 0) { arrow(ctx, sx(60), sy(560), sx(150), sy(355), clamp(kw), C.ink, 7); pop(ctx, kw, sx(60), sy(590), () => chip(ctx, 'WINGS', sx(60), sy(560), { size: 30, align: 'center', bg: C.accent })); }
    if (kt > 0) { arrow(ctx, sx(560), sy(560), sx(505), sy(420), clamp(kt), C.ink, 7); pop(ctx, kt, sx(560), sy(590), () => chip(ctx, 'TAIL', sx(560), sy(560), { size: 30, align: 'center', bg: C.accent })); }
    ctx.restore();
  }
  // translation of the in-app Hebrew prompt
  const kh = sp(t, tHungry, SPRING.bouncy);
  if (kh > 0.001) {
    const bx = 1060, by = 880;
    pop(ctx, kh, bx + 360, by + 40, () => {
      card(ctx, bx, by - 6, 720, 92, 46, { fill: C.card });
      ctx.save(); ctx.translate(bx + 52, by + 40); ICON.apple(ctx, 62); ctx.restore();
      text(ctx, 'In-app: “Winnie is hungry — feed him!”', bx + 96, by + 52, font(31, 800, UI), C.ink);
    });
  }
}

// ================================================================= S2 JOURNEY  (12.6 .. 18.6)
function sJourney(ctx, t) {
  headline(ctx, t, 'The growth journey', 110, 190, at('growth') - 0.25, 96);
  const nodes = [
    ['st2', 'STAGE 2', 'Hatchling', at('hatchling')],
    ['st3', 'STAGE 3', 'Baby', at('baby,')],
    ['st4', 'STAGE 4', 'Kid', at('kid,')],
    ['st5', 'STAGE 5', 'Winged', at('winged')],
  ];
  const xs = [300, 740, 1180, 1620], y = 540, d = 300;
  // path line drawing between nodes
  ctx.save(); ctx.setLineDash([2, 26]); ctx.lineCap = 'round'; ctx.lineWidth = 14; ctx.strokeStyle = C.ink;
  for (let i = 0; i < 3; i++) {
    const p = ease(t, nodes[i][3] + 0.1, nodes[i + 1][3], E.inOutCubic);
    if (p <= 0) continue;
    ctx.beginPath(); ctx.moveTo(xs[i] + d / 2 + 10, y); ctx.lineTo(lerp(xs[i] + d / 2 + 10, xs[i + 1] - d / 2 - 10, p), y); ctx.stroke();
  }
  ctx.restore();
  nodes.forEach(([key, st, name, t0], i) => {
    const k = sp(t, t0 - 0.08, SPRING.bouncy);
    const last = i === 3;
    pop(ctx, k, xs[i], y, () => {
      stillCircle(ctx, key, xs[i], y, last ? d + 30 : d, last ? C.accent : C.ink);
      chip(ctx, st, xs[i], y + d / 2 + 34, { size: 28, align: 'center', bg: last ? C.accent : C.ink });
      text(ctx, name, xs[i], y + d / 2 + 135, font(48, 700, DISPLAY), C.ink, 'center');
    });
    if (last) burst(ctx, xs[i], y, t, t0, d / 2 + 10, d / 2 + 90, 14);
  });
}

// ================================================================= S3 CARE LOOP  (18.6 .. 27.35)
function hatchClipTime(t) {
  // narration cue -> the matching moment in the Rive recording (apple / sponge / ball)
  const a = at('drag') - 0.35, b = at('scrub') - 0.05, c = at('toss') - 0.1;
  if (t < a) return 1.0 + (t - T.care) * ((5.0 - 1.0) / (a - T.care));
  if (t < b) return 5.0 + (t - a) * (1.7 / (b - a));
  if (t < c) return 9.25 + (t - b) * (1.75 / (c - b));
  return 17.6 + (t - c) * 0.95;
}
function sCare(ctx, t) {
  headline(ctx, t, '3 needs = the care loop', 110, 165, at('every') - 0.2, 84);
  // left: real Rive recording of the hatchling
  const kx = sp(t, T.care + 0.1, SPRING.gentle);
  const x = lerp(-820, 110, kx), y = 220, w = 800, h = 640;
  card(ctx, x, y, w, h, 34, { fill: '#2A2A2A' });
  const im = clipFrame('hatch', hatchClipTime(t));
  clipRR(ctx, x + 3, y + 3, w - 6, h - 6, 31, () => { if (im) imgCover(ctx, im, 0, 0, 720, 644, x + 3, y + 3, w - 6, h - 6); });
  pop(ctx, sp(t, T.care + 0.5, SPRING.snappy), x + 40, y + 40, () => chip(ctx, 'RIVE  ·  STAGE 2', x + 24, y + 24, { size: 24, bg: C.ink }));
  // right: three needs
  const rows = [
    ['apple', 'FOOD', 'Drag the apple', at('food,'), at('apple,') + 0.45, C.red, 0.3],
    ['sponge', 'CLEAN', 'Scrub with the sponge', at('cleaning,'), at('sponge,') + 0.3, C.yellow, 0.45],
    ['ball', 'PLAY', 'Toss the ball', at('play.'), at('rings') + 0.05, C.blue, 0.22],
  ];
  const active = t < at('drag') - 0.4 ? -1 : t < at('scrub') - 0.1 ? 0 : t < at('toss') - 0.1 ? 1 : 2;
  rows.forEach(([ic, label, verb, t0, tFill, col, p0], i) => {
    const k = sp(t, t0 - 0.08, SPRING.bouncy);
    const rx = 1010, ry = 250 + i * 210;
    const fillP = lerp(p0, 1, spring(t - tFill, SPRING.snappy));
    const on = i === active;
    pop(ctx, k, rx + 90, ry + 85, () => {
      card(ctx, rx, ry, 800, 170, 85, { fill: on ? C.soft : C.card, stroke: on ? C.accent : C.ink, lw: on ? 8 : 6 });
      iconTile(ctx, ic, rx + 85, ry + 85, 130, { ring: true, ringP: fillP, ringColor: col });
      text(ctx, label, rx + 180, ry + 78, font(54, 700, DISPLAY), C.ink);
      text(ctx, verb, rx + 182, ry + 124, font(30, 800, UI), 'rgba(43,34,64,.65)');
      // meter
      const mx = rx + 560, my = ry + 70, mw = 200, mh = 30;
      rrect(ctx, mx, my, mw, mh, 15); ctx.fillStyle = 'rgba(43,34,64,.12)'; ctx.fill();
      rrect(ctx, mx, my, mw * clamp(fillP), mh, 15); ctx.fillStyle = col; ctx.fill();
      text(ctx, `${Math.round(clamp(fillP) * 100)}%`, mx + mw / 2, my + 72, font(30, 800, UI), C.ink, 'center');
    });
    burst(ctx, rx + 85, ry + 85, t, tFill, 70, 120, 10, col);
  });
}

// ================================================================= S4 BUILT IN RIVE  (27.35 .. 31.2)
function sRive(ctx, t) {
  headline(ctx, t, 'All built in Rive', 110, 150, at('built') - 0.2, 84);
  const tLive = at('live');
  const kx = sp(t, T.rive + 0.05, SPRING.gentle);
  const x = 110, y = lerp(H + 50, 200, kx), w = 1200, h = 675;
  card(ctx, x, y, w, h, 26, { fill: '#1E1E1E' });
  const im = clipFrame('rive', clamp(t - T.rive, 0, 5.9));
  // zoom into the state-machine inputs panel (wearHat…)
  const z = ease(t, at('reaction') - 0.2, at('reaction') + 0.6, E.inOutCubic);
  clipRR(ctx, x + 3, y + 3, w - 6, h - 6, 23, () => {
    if (!im) return;
    const zz = Math.exp(lerp(0, Math.log(3.2), z));
    const sw = 1440 / zz, sh = 810 / zz;
    const fx = lerp(720, 120, z), fy = lerp(405, 320, z);
    const sx = clamp(fx - sw / 2, 0, 1440 - sw), sy = clamp(fy - sh / 2, 0, 810 - sh);
    ctx.drawImage(im, sx, sy, sw, sh, x + 3, y + 3, w - 6, h - 6);
  });
  // right column: what it means
  const items = [
    ['play', 'State machine: MoguSM', at('rive,')],
    ['tap', 'Reacts to every touch', tLive - 0.1],
    ['hat', 'Outfit inputs: wearHat, wearGlasses…', at('interactive.')],
  ];
  items.forEach(([ic, str, t0], i) => {
    const k = sp(t, t0, SPRING.bouncy);
    const ix = 1350, iy = 250 + i * 200;
    pop(ctx, k, ix + 60, iy + 60, () => {
      iconTile(ctx, ic, ix + 60, iy + 60, 120);
      const words = str.split(': ');
      if (words.length > 1) {
        text(ctx, words[0] + ':', ix + 140, iy + 48, font(30, 800, UI), 'rgba(43,34,64,.65)');
        text(ctx, words[1], ix + 140, iy + 92, font(words[1].length > 14 ? 28 : 38, 800, UI), C.ink);
      } else text(ctx, str, ix + 140, iy + 72, font(36, 800, UI), C.ink);
    });
  });
}

// ================================================================= S5 RIVE LAB  (31.2 .. 37.0)
function sLab(ctx, t) {
  const tNew = at('new'), tSwitch = at('switch'), tTest = at('test');
  // phone with the real Rive Lab recording
  const kx = sp(t, T.lab + 0.05, SPRING.gentle);
  const pw = 420, ph = 864, px = 200, py = lerp(H + 40, 70, kx);
  card(ctx, px - 18, py - 18, pw + 36, ph + 36, 56, { fill: C.ink, lw: 0, shadow: 12 });
  const clipT = clamp(t - (tNew + 0.4), 0, 13.7);
  const im = clipFrame('lab', clipT);
  clipRR(ctx, px, py, pw, ph, 40, () => { if (im) imgCover(ctx, im, 0, 0, 480, 988, px, py, pw, ph); });
  // highlight the stage tabs on "switch stages"
  const hk = ease(t, tSwitch - 0.1, tSwitch + 0.3) * (1 - ease(t, tTest - 0.2, tTest + 0.2));
  if (hk > 0.01) {
    const s = pw / 480;
    ctx.save(); ctx.globalAlpha = hk; ctx.lineWidth = 7; ctx.strokeStyle = C.accent;
    rrect(ctx, px + 100 * s, py + 50 * s, 280 * s, 56 * s, 28 * s); ctx.stroke(); ctx.restore();
    arrow(ctx, px + pw + 150, py + 80, px + 380 * s + 16, py + 78 * s, hk, C.accent, 8);
  }
  // right: title + features
  pop(ctx, sp(t, tNew - 0.1, SPRING.bouncy), 800, 170, () => chip(ctx, 'NEW THIS WEEK', 760, 120, { size: 32, bg: C.accent }));
  headline(ctx, t, 'The Rive Lab', 760, 300, at('lab!') - 0.3, 120);
  const feats = [
    ['tap', 'Switch stages in one tap', tSwitch],
    ['play', 'Test every animation — on the phone', tTest],
  ];
  feats.forEach(([ic, str, t0], i) => {
    const k = sp(t, t0 - 0.05, SPRING.bouncy);
    const fx = 760, fy = 380 + i * 190;
    pop(ctx, k, fx + 70, fy + 70, () => {
      card(ctx, fx, fy, 1040, 150, 75);
      iconTile(ctx, ic, fx + 75, fy + 75, 116);
      text(ctx, str, fx + 160, fy + 90, font(40, 800, UI), C.ink);
    });
  });
  // mini tab switcher illustrating Stage 3 / 4 / 5
  const kt = sp(t, tSwitch + 0.2, SPRING.snappy);
  if (kt > 0.01) {
    const sel = Math.floor(clamp((t - tSwitch - 0.3) / 0.45, 0, 99)) % 3;
    pop(ctx, kt, 1280, 800, () => {
      ['Stage 3', 'Stage 4', 'Stage 5'].forEach((s, i) => chip(ctx, s, 960 + i * 230, 770, { size: 34, bg: i === sel ? C.teal : C.card, fg: i === sel ? '#fff' : C.ink }));
    });
  }
}

// ================================================================= S6 OUTFITS  (37.0 .. 47.5)
const PANEL = {   // in assets/img/outfits.png (1032x1013): the character area of each screenshot
  hat: [40, 30, 452, 400], glasses: [533, 30, 452, 400], scarf: [30, 676, 305, 212], pants: [359, 676, 305, 212], shirt: [688, 676, 305, 212],
};
function sOutfit(ctx, t, IMG) {
  headline(ctx, t, 'Stage 5 gets dressed up!', 110, 160, at('dressed') - 0.6, 84);
  const slots = ['hat', 'glasses', 'scarf', 'pants', 'shirt'];
  const tS = [at('hat,'), at('glasses,'), at('scarf,'), at('pants,'), at('shirt.')];
  const tToggle = at('toggle'), tScale = at('tune'), tStack = at('stack');
  let cur = 0; tS.forEach((x, i) => { if (t >= x - 0.12) cur = i; });
  const showStack = t >= tStack - 0.1;
  // left: the real screenshot of the current slot
  const kx = sp(t, T.outfit + 0.1, SPRING.gentle);
  const x = lerp(-900, 110, kx), y = 210, w = 780, h = 650;
  card(ctx, x, y, w, h, 34);
  const key = showStack ? 'shirt' : slots[cur];
  const [sx, sy, sw, sh] = PANEL[key];
  const swap = sp(t, showStack ? tStack - 0.1 : tS[cur] - 0.12, SPRING.snappy);
  clipRR(ctx, x + 3, y + 3, w - 6, h - 6, 31, () => {
    if (IMG.outfits) {
      const z = 0.92 + 0.08 * swap;
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(z, z); ctx.translate(-(x + w / 2), -(y + h / 2));
      imgCover(ctx, IMG.outfits, sx, sy, sw, sh, x, y, w, h); ctx.restore();
    }
  });
  pop(ctx, sp(t, tS[0] - 0.2, SPRING.snappy), x + 30, y + h - 40, () =>
    chip(ctx, showStack ? 'ALL 5 ON' : `${slots[cur].toUpperCase()} ON`, x + 24, y + h - 80, { size: 30, bg: C.accent }));
  // right: 5 slot tiles
  const kSlots = sp(t, at('five', 3) - 0.1, SPRING.bouncy);
  const gx = 980, gy = 230;
  slots.forEach((s, i) => {
    const k = sp(t, at('five', 3) - 0.05 + i * 0.06, SPRING.bouncy);
    const cx = gx + 85 + i * 170, cy = gy + 85;
    const lit = t >= tS[i] - 0.12;
    const isCur = !showStack && i === cur && t >= tS[0] - 0.12 && t < tToggle;
    const lift = isCur ? -14 * sp(t, tS[i] - 0.12, SPRING.bouncy) : 0;
    pop(ctx, k * (isCur ? 1.12 : 1), cx, cy, () => {
      iconTile(ctx, s, cx, cy + lift, 140, { bg: lit ? C.soft : C.card, stroke: isCur ? C.accent : C.ink });
      text(ctx, s, cx, cy + 112, font(30, 800, UI), C.ink, 'center');
      // toggle switch under each tile
      const tk = ease(t, tToggle + i * 0.09, tToggle + i * 0.09 + 0.2);
      if (t >= tToggle - 0.3) {
        const tx = cx - 40, ty = cy + 140;
        rrect(ctx, tx, ty, 80, 40, 20); ctx.fillStyle = tk > 0.5 ? C.teal : 'rgba(43,34,64,.2)'; ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(tx + 20 + 40 * tk, ty + 20, 15, 0, M.TAU); ctx.fill();
      }
    });
  });
  void kSlots;
  // tune the scale: the real scale row + a live value
  const kScale = sp(t, tScale - 0.1, SPRING.bouncy);
  pop(ctx, kScale, 1390, 640, () => {
    card(ctx, 980, 560, 820, 150, 40);
    if (IMG.outfits) imgCover(ctx, IMG.outfits, 125, 618, 300, 44, 1000, 590, 460, 68);
    const v = 1 + 0.15 * ease(t, tScale + 0.2, tScale + 1.0, E.inOutCubic);
    text(ctx, 'scale', 1490, 615, font(26, 800, UI), 'rgba(43,34,64,.6)');
    text(ctx, v.toFixed(2), 1490, 672, font(56, 700, DISPLAY), C.accent);
    // slider
    rrect(ctx, 1630, 620, 140, 14, 7); ctx.fillStyle = 'rgba(43,34,64,.15)'; ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(1630 + 140 * ((v - 0.9) / 0.4), 627, 18, 0, M.TAU); ctx.fill();
  });
  // stack: five layers -> one outfit
  const kSt = sp(t, tStack - 0.05, SPRING.bouncy);
  if (kSt > 0.01) {
    pop(ctx, kSt, 1390, 800, () => {
      card(ctx, 980, 740, 820, 120, 60, { fill: C.ink, lw: 0, shadow: 0 });
      slots.forEach((s, i) => {
        const p = ease(t, tStack + i * 0.08, tStack + i * 0.08 + 0.35, E.outBack);
        ctx.save(); ctx.translate(1060 + i * 90 * p + 0 * (1 - p), 800); ICON[s](ctx, 70); ctx.restore();
      });
      text(ctx, '= full outfit', 1520, 815, font(44, 700, DISPLAY), '#fff');
    });
  }
}

// ================================================================= S7 NEXT UP + END  (47.5 .. 58)
function sNext(ctx, t, IMG) {
  headline(ctx, t, 'Next up', 110, 200, at('next') - 0.25, 110);
  const rows = [
    ['lock', 'Lock in the item positions', at('lock')],
    ['share', 'Hit “Share values”', at('hit')],
    ['rocket', 'Ship it!', at('ship')],
  ];
  rows.forEach(([ic, str, t0], i) => {
    const k = sp(t, t0 - 0.1, SPRING.bouncy);
    const rx = 110, ry = 270 + i * 190;
    pop(ctx, k, rx + 80, ry + 80, () => {
      card(ctx, rx, ry, 1000, 150, 75);
      iconTile(ctx, ic, rx + 75, ry + 75, 116, { bg: C.soft });
      text(ctx, str, rx + 165, ry + 92, font(44, 800, UI), C.ink);
      // check
      const ck = sp(t, t0 + 0.45, SPRING.bouncy);
      pop(ctx, ck, rx + 920, ry + 75, () => {
        ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(rx + 920, ry + 75, 42, 0, M.TAU); ctx.fill();
        ctx.save(); ctx.translate(rx + 920, ry + 75); ICON.check(ctx, 60); ctx.restore();
      });
    });
  });
  // the real "Share values" button from the Rive Lab
  const kb = sp(t, at('share') - 0.05, SPRING.bouncy);
  const lab = clipFrame('lab', 1.0);
  pop(ctx, kb, 1480, 520, () => {
    card(ctx, 1220, 380, 560, 280, 36);
    text(ctx, 'in the Rive Lab app:', 1500, 445, font(30, 800, UI), 'rgba(43,34,64,.6)', 'center');
    if (lab) imgCover(ctx, lab, 226, 908, 124, 50, 1340, 490, 320, 129);
    const pulse = 0.5 + 0.5 * Math.sin((t - at('share')) * 6);
    ctx.lineWidth = 7; ctx.strokeStyle = C.accent; ctx.globalAlpha = 0.6 + 0.4 * pulse;
    rrect(ctx, 1326, 478, 348, 153, 40); ctx.stroke(); ctx.globalAlpha = 1;
  });
}
function sEnd(ctx, t) {
  const tA = at('awesome'), tSee = at('see');
  // confetti (seeded)
  for (let i = 0; i < 70; i++) {
    const t0 = tA + hash01(i, 3) * 0.6, age = t - t0; if (age < 0) continue;
    const x = W * hash01(i, 5), y = -40 + age * (260 + 260 * hash01(i, 7)) + 40 * Math.sin(age * 3 + i);
    if (y > H + 40) continue;
    ctx.save(); ctx.translate(x, y); ctx.rotate(age * (2 + 4 * hash01(i, 9)));
    ctx.fillStyle = [C.accent, C.red, C.teal, C.blue, C.purple, '#fff'][i % 6]; ctx.fillRect(-9, -5, 18, 10); ctx.restore();
  }
  const k = sp(t, tA - 0.15, SPRING.bouncy);
  const bob = Math.sin(t * 3) * 8;
  pop(ctx, k, W / 2, 400, () => stillCircle(ctx, 'st5', W / 2, 360 + bob, 440, C.accent));
  burst(ctx, W / 2, 360, t, tA, 230, 330, 16);
  headline(ctx, t, 'Awesome work, team!', 430, 750, tA, 110, C.ink, [2]);
  const ks = sp(t, tSee - 0.05, SPRING.snappy);
  pop(ctx, ks, W / 2, 850, () => chip(ctx, 'See you next update!', W / 2, 800, { size: 40, align: 'center', bg: C.accent }));
}

// ---------------------------------------------------------------- captions (word by word, orange on black)
function captions(ctx, t) {
  let line = null;
  for (let i = 0; i < LINES.length; i++) {
    const L = LINES[i], next = LINES[i + 1];
    const a = L[0].s - 0.08, b = next ? Math.min(next[0].s - 0.08, L[L.length - 1].e + 1.2) : L[L.length - 1].e + 1.5;
    if (t >= a && t < b) { line = L; break; }
  }
  if (!line) return;
  const size = 50, f = font(size, 700, DISPLAY);
  ctx.font = f;
  const clean = (w) => w.replace(/^["“]|["”]$/g, '');
  const ws = line.map((w) => clean(w.w));
  const space = ctx.measureText(' ').width * 1.3;
  const widths = ws.map((w) => ctx.measureText(w).width);
  const total = widths.reduce((s, x) => s + x, 0) + space * (ws.length - 1);
  const padX = 34, bh = 86, bw = total + padX * 2;
  const bx = (W - bw) / 2, by = H - bh - 34;
  const appear = sp(t, line[0].s - 0.08, SPRING.snappy);
  // the box grows word by word (springs to the right edge of the latest spoken word)
  let edge = padX * 2 + widths[0], acc = padX;
  line.forEach((w, i) => { const k = spring(t - (w.s - 0.03), SPRING.snappy); if (i > 0) edge += (widths[i] + space) * clamp(k, 0, 1.08); acc += widths[i] + space; });
  ctx.save(); ctx.globalAlpha = clamp(appear * 1.5);
  rrect(ctx, bx, by + (1 - Math.min(1, appear)) * 20, Math.min(bw + 8, edge), bh, 24); ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fill();
  let x = bx + padX;
  line.forEach((w, i) => {
    const k = sp(t, w.s - 0.03, SPRING.snappy);
    if (k > 0.001) {
      const speaking = t >= w.s - 0.03 && t < w.e + 0.05;
      const sc = 0.7 + 0.3 * Math.min(1, k) + (speaking ? 0.06 : 0);
      ctx.save(); ctx.translate(x + widths[i] / 2, by + bh / 2 + 17); ctx.scale(sc, sc);
      ctx.globalAlpha = clamp(k * 2) * clamp(appear * 1.5);
      ctx.fillStyle = speaking ? '#FFB347' : C.accent; ctx.font = f; ctx.textAlign = 'center';
      ctx.fillText(ws[i], 0, 0); ctx.restore();
    }
    x += widths[i] + space;
  });
  ctx.restore();
}

// ---------------------------------------------------------------- composition + whip transitions
const SCENES = [
  [0, T.journey, sHook], [T.journey, T.care, sJourney], [T.care, T.rive, sCare], [T.rive, T.lab, sRive],
  [T.lab, T.outfit, sLab], [T.outfit, T.next, sOutfit], [T.next, T.end, sNext], [T.end, DUR + 1, sEnd],
];
const WHIP = 0.42;   // seconds: A slides out left while B slides in from the right, both on screen
function draw(ctx, u, t, IMG) {
  background(ctx, t);
  let drawn = false;
  for (let i = 0; i < SCENES.length; i++) {
    const [a, b, fn] = SCENES[i];
    const nxt = SCENES[i + 1];
    if (nxt && t >= b - WHIP / 2 && t < b + WHIP / 2) {
      const p = E.inOutCubic(prog(t, b - WHIP / 2, b + WHIP / 2));
      ctx.save(); ctx.translate(-W * p, 0); fn(ctx, t, IMG); ctx.restore();
      ctx.save(); ctx.translate(W * (1 - p), 0); nxt[2](ctx, t, IMG); ctx.restore();
      drawn = true; break;
    }
    if (t >= a && t < b) {
      if (i > 0 && t < a + WHIP / 2) continue;
      fn(ctx, t, IMG); drawn = true; break;
    }
  }
  if (!drawn) SCENES[SCENES.length - 1][2](ctx, t, IMG);
  captions(ctx, t);
}

// ---------------------------------------------------------------- sound accents (seconds -> beats)
const P = 0.461536, OFF = -0.00231; const B = (s) => (s - OFF) / P;
let HITS = [];
function buildHits() {
  const h = (s, label, sfx, o) => HITS.push([B(s), label, sfx, o]);
  h(at('evolved!') + 0.1, 'evolved burst', 'pop', { pitch: 'D6' });
  h(at('poof!') - 0.02, 'poof', 'whoosh', { len: 0.5 });
  h(at('five!') - 0.05, 'stage 5', 'bell', { pitch: 'E6' });
  h(at('wings,'), 'wings', 'blip', { pitch: 'A5' });
  h(at('tail,'), 'tail', 'blip', { pitch: 'C6' });
  [T.journey, T.care, T.rive, T.lab, T.outfit, T.next, T.end].forEach((s) => h(s - 0.05, 'whip', 'whoosh', { len: 0.35 }));
  ['hatchling', 'baby,', 'kid,', 'winged'].forEach((w, i) => h(at(w) - 0.05, 'node ' + w, 'pop', { pitch: ['G5', 'A5', 'B5', 'D6'][i] }));
  ['food,', 'cleaning,', 'play.'].forEach((w, i) => h(at(w) - 0.05, 'need ' + w, 'pop', { pitch: ['C6', 'D6', 'E6'][i] }));
  h(at('apple,') + 0.45, 'food full', 'coins'); h(at('sponge,') + 0.3, 'clean full', 'coins'); h(at('rings') + 0.05, 'play full', 'coins');
  ['hat,', 'glasses,', 'scarf,', 'pants,', 'shirt.'].forEach((w, i) => h(at(w) - 0.1, 'slot ' + w, 'tok', { pitch: ['C5', 'D5', 'E5', 'G5', 'A5'][i] }));
  for (let i = 0; i < 5; i++) h(at('toggle') + i * 0.09 + 0.1, 'toggle', 'tick');
  h(at('stack'), 'stack', 'boing', { pitch: 'C5', to: 'C6' });
  ['lock', 'hit', 'ship'].forEach((w) => h(at(w) + 0.45, 'check ' + w, 'blip', { pitch: 'E6' }));
  h(at('awesome') - 0.15, 'end card', 'impact');
  HITS.sort((a, b) => a[0] - b[0]);
}

// ---------------------------------------------------------------- boot
const words = await fetch('words.json').then((r) => r.json());
WORDS = words.words.map((w) => ({ ...w })); buildLines(); buildHits();
await M.film({
  fonts: [font(100, 700, DISPLAY), font(40, 800, UI)],
  images: { outfits: 'assets/img/outfits.png' },
  hits: HITS,
  samples: 4,
  async init() {
    // preload the stills used by circles
    await loadUrls(Object.values(CROP).map(([c, s]) => `assets/clips/${c}/${String(clamp(Math.floor(s * FPS_CLIP) + 1, 1, CLIPS[c])).padStart(4, '0')}.jpg`).concat(['assets/clips/lab/0025.jpg']));
  },
  draw,
});
// async seek: paint, load any clip frames that were missing, paint again (frame-exact, no hidden state)
const syncSeek = window.seek;
window.seek = async (t) => {
  for (let pass = 0; pass < 3; pass++) {
    MISSING.clear(); syncSeek(t);
    if (!MISSING.size) return;
    await loadUrls([...MISSING]);
  }
};
window.seek(0);
