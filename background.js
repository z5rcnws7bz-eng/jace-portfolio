// ── Static fish canvas background ────────────────────────────────────────
// Draws frozen koi/orca/stingray silhouettes made of colored kanji chars,
// matching the fih.umgbhalla.com aesthetic. Canvas z-index is 0 — always
// behind the page content which sits at z-index 1.

const canvas  = document.getElementById('fish-canvas');
const ctx     = canvas.getContext('2d');

// ── Resize canvas to fill viewport ───────────────────────────────────────
function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  drawAll();
}
window.addEventListener('resize', resize);

// ── Character pools for each creature ────────────────────────────────────
const koiChars     = '鱗魚水波流泳錦紅橙白春';
const orcaChars    = '海鯨虎縞黒白深潮波墨夜';
const stingrayChars= '翼羽鰭滑灰影潜底砂海床';

function pick(str) { return str[Math.floor(Math.random() * str.length)]; }

// ── Fish shape bitmaps  (1 = filled cell) ────────────────────────────────
// Each bitmap is a 2D array; rendered at CELL_SIZE px per cell

const CELL = 13; // px per character cell

const KOI_BITMAP = [
  [0,0,0,0,1,1,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  [0,0,0,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,1,1,0,0,0,0,0,0,0,0],
];

const KOI2_BITMAP = [     // second koi, smaller
  [0,0,1,1,0,0,0,0,0],
  [0,1,1,1,1,1,0,0,0],
  [1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,0,0,0],
  [0,0,1,1,0,0,0,0,0],
];

const ORCA_BITMAP = [      // orca — taller, with dorsal fin
  [0,0,0,0,1,0,0,0,0,0,0,0],
  [0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,1,1,1,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,0,0,1,1,0,0,0],
  [0,0,0,1,1,0,0,1,1,0,0,0],
];

const STINGRAY_BITMAP = [   // flat diamond shape with tail
  [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],  // tail
  [0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
];

// ── Colour palettes ───────────────────────────────────────────────────────
const KOI_COLORS  = ['#e07b39','#c94f2e','#d4834a','#b84a24','#f0a060','#c46030','#e8956a'];
const KOI2_COLORS = ['#c8a4d4','#a87cb0','#9b6aa3','#b890c0','#d4b8e0','#e0cce8'];
const ORCA_COLORS = ['#2a2a2a','#1a1a1a','#383838','#222222','#404040','#181818','#303030'];
const RAY_COLORS  = ['#8a7560','#7a6550','#6a5540','#9a8570','#b0a090','#7d6d5d'];

function randColor(palette) { return palette[Math.floor(Math.random() * palette.length)]; }

// ── Core draw function ────────────────────────────────────────────────────
function drawFish({ bitmap, colors, charPool, x, y, flipX = false, flipY = false, scale = 1 }) {
  const rows = bitmap.length;
  const cols = bitmap[0].length;
  const cs = Math.round(CELL * scale);

  ctx.font = `${cs - 1}px monospace`;
  ctx.textBaseline = 'top';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const row = flipY ? bitmap[rows - 1 - r] : bitmap[r];
      const col = flipX ? row[cols - 1 - c]    : row[c];
      if (!col) continue;

      ctx.fillStyle = randColor(colors);
      ctx.fillText(pick(charPool), x + c * cs, y + r * cs);
    }
  }
}

// ── Scatter some tiny floating chars around a fish for texture ────────────
function scatter({ colors, charPool, cx, cy, radius, count }) {
  ctx.font = `10px monospace`;
  ctx.textBaseline = 'top';
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.random() * radius;
    ctx.fillStyle = randColor(colors) + '55'; // semi-transparent
    ctx.fillText(pick(charPool), cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
  }
}

// ── Draw everything ───────────────────────────────────────────────────────
function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const W = canvas.width;
  const H = canvas.height;

  // Top-left: large koi
  drawFish({ bitmap: KOI_BITMAP, colors: KOI_COLORS, charPool: koiChars,
             x: 10, y: 10, scale: 1 });
  scatter({ colors: KOI_COLORS, charPool: koiChars,
            cx: 100, cy: 80, radius: 60, count: 20 });

  // Top-left corner: second smaller koi below first
  drawFish({ bitmap: KOI2_BITMAP, colors: KOI2_COLORS, charPool: koiChars,
             x: 30, y: 160, scale: 0.85 });

  // Top-right: orca (flipped so it faces left into the page)
  const orcaX = W - (ORCA_BITMAP[0].length * CELL) - 20;
  drawFish({ bitmap: ORCA_BITMAP, colors: ORCA_COLORS, charPool: orcaChars,
             x: orcaX, y: 20, flipX: true, scale: 1 });
  scatter({ colors: ORCA_COLORS, charPool: orcaChars,
            cx: W - 100, cy: 90, radius: 55, count: 15 });

  // Bottom-right: stingray
  const rayW = STINGRAY_BITMAP[0].length * CELL * 0.8;
  const rayH = STINGRAY_BITMAP.length    * CELL * 0.8;
  drawFish({ bitmap: STINGRAY_BITMAP, colors: RAY_COLORS, charPool: stingrayChars,
             x: W - rayW - 30, y: H - rayH - 30, scale: 0.8 });
  scatter({ colors: RAY_COLORS, charPool: stingrayChars,
            cx: W - rayW / 2 - 30, cy: H - rayH / 2 - 30, radius: 50, count: 15 });

  // Bottom-left: small second koi facing right
  drawFish({ bitmap: KOI_BITMAP, colors: KOI_COLORS, charPool: koiChars,
             x: 20, y: H - KOI_BITMAP.length * CELL * 0.75 - 20,
             flipX: true, scale: 0.75 });
}

resize(); // initial draw

