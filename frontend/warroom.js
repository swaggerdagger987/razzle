/* ======================================================================
   RAZZLE WAR ROOM — PIXEL ENGINE
   Retro pixel-art war room where 6 fantasy football analyst agents work.
   Canvas: 30×22 tile grid, 32px tiles, dark mode palette.
   ====================================================================== */

// ── CONSTANTS ──────────────────────────────────────────────────────────
const TILE = 32;
const COLS = 30;
const ROWS = 22;
const WORLD_W = COLS * TILE;
const WORLD_H = ROWS * TILE;

// Sprite sheet: 112×96 → 7 cols × 4 rows → 16×24 per frame
const FR_W = 16, FR_H = 24, FR_COLS = 7, FR_ROWS = 4;
const SP_SCALE = 2; // draw at 32×48

const DIR = { DOWN: 0, LEFT: 1, RIGHT: 2, UP: 3 };
const STATE = { IDLE: 0, WALK: 1, WORK_DESK: 2, ANALYZE_BOARD: 3, DISCUSS: 4, THINK: 5, CELEBRATE: 6, COFFEE: 7 };

const WALK_FRAMES = [0, 1, 2, 1];
const IDLE_FRAME = 0;
const ANIM_SPEED = 150; // ms per walk frame

// ── PALETTE (dark Situation Room) ────────────────────────────────────────────
const C = {
  wallDark:    '#121a2e',
  wallMid:     '#1b2845',
  wallLight:   '#243358',
  wallAccent:  '#2e4070',
  floorWood1:  '#8b6d3c',
  floorWood2:  '#9c7a42',
  floorWood3:  '#7a5e32',
  turf1:       '#1e5c28',
  turf2:       '#267832',
  turf3:       '#1a4c22',
  turfLine:    '#e8e8e8',
  deskTop:     '#5c3a1a',
  deskFront:   '#4a2e14',
  deskLeg:     '#3c2410',
  monitor:     '#0a1a0a',
  monitorGlow: '#22cc55',
  screenBg:    '#0c200c',
  tableDark:   '#3c2410',
  tableTop:    '#5a3818',
  tvFrame:     '#222222',
  tvScreen:    '#0a1e3a',
  tvGlow:      '#3388cc',
  boardBg:     '#1a1a1a',
  boardFrame:  '#444444',
  shelfWood:   '#6a4a28',
  shelfBook1:  '#cc3030',
  shelfBook2:  '#3060cc',
  shelfBook3:  '#30aa50',
  plantPot:    '#8a5a30',
  plantLeaf:   '#2a8c3a',
  coffeeMach:  '#444444',
  coffeeAccent:'#888888',
  trophy:      '#d4aa40',
  trophyBase:  '#666666',
  clockFace:   '#e8e0cc',
  clockFrame:  '#444444',
  helmetBase:  '#1a2844',
  helmetStripe:'#d97757', // Razzle terracotta
  phone:       '#222222',
  phoneRed:    '#cc2222',
  whiteboard:  '#e8e4d8',
  wbFrame:     '#aaaaaa',
  chairSeat:   '#3a3a3a',
  chairBack:   '#2a2a2a',
  bannerBg:    '#d97757', // Razzle terracotta
  bannerText:  '#2d1f14',
  nameTag:     'rgba(0,0,0,0.7)',
  nameText:    '#ffffff',
  bubbleBg:    '#ffffff',
  bubbleBorder:'#333333',
};

// ── CANVAS SETUP ───────────────────────────────────────────────────────
const cvs = document.getElementById('warRoomCanvas');
const ctx = cvs.getContext('2d');

function resizeCanvas() {
  const container = document.getElementById('canvasContainer');
  const rect = container.getBoundingClientRect();
  cvs.width = WORLD_W;
  cvs.height = WORLD_H;
}
resizeCanvas();

// ── CAMERA ─────────────────────────────────────────────────────────────
const cam = { x: 0, y: 0, targetX: 0, targetY: 0 };

function updateCam() {
  cam.x += (cam.targetX - cam.x) * 0.08;
  cam.y += (cam.targetY - cam.y) * 0.08;
}

function centerCamOn(wx, wy) {
  cam.targetX = wx - cvs.width / 2;
  cam.targetY = wy - cvs.height / 2;
}

function clampCam() {
  const maxX = Math.max(0, WORLD_W - cvs.width);
  const maxY = Math.max(0, WORLD_H - cvs.height);
  cam.targetX = Math.max(0, Math.min(maxX, cam.targetX));
  cam.targetY = Math.max(0, Math.min(maxY, cam.targetY));
  cam.x = Math.max(0, Math.min(maxX, cam.x));
  cam.y = Math.max(0, Math.min(maxY, cam.y));
}

// ── SPRITE LOADING ─────────────────────────────────────────────────────
const spriteImgs = {};
const CHAR_NAMES = ['char_0','char_1','char_2','char_3','char_4','char_5'];
let spritesLoaded = 0;

CHAR_NAMES.forEach(name => {
  const img = new Image();
  img.onload = () => { spritesLoaded++; };
  img.src = `assets/characters/${name}.png`;
  spriteImgs[name] = img;
});

// ── COLLISION MAP ──────────────────────────────────────────────────────
// 0 = blocked, 1 = walkable
const collisionMap = [];
for (let r = 0; r < ROWS; r++) {
  collisionMap[r] = [];
  for (let c = 0; c < COLS; c++) {
    if (r <= 1 || r >= ROWS - 1 || c <= 0 || c >= COLS - 1) {
      collisionMap[r][c] = 0;
    } else {
      collisionMap[r][c] = 1;
    }
  }
}

function blockTile(c, r) {
  if (r >= 0 && r < ROWS && c >= 0 && c < COLS) collisionMap[r][c] = 0;
}

function blockRect(cx, cy, w, h) {
  for (let r = cy; r < cy + h; r++)
    for (let c = cx; c < cx + w; c++)
      blockTile(c, r);
}

function isWalkable(tileX, tileY) {
  if (tileX < 0 || tileX >= COLS || tileY < 0 || tileY >= ROWS) return false;
  return collisionMap[tileY][tileX] === 1;
}

// ── ROOM LAYOUT ────────────────────────────────────────────────────────
const ZONE_WOOD = 0, ZONE_TURF = 1;
const zones = [
  { type: ZONE_WOOD, x: 1, y: 2, w: 28, h: 19 },
  { type: ZONE_TURF, x: 10, y: 8, w: 10, h: 6 },
];

const furniture = [];

// --- NORTH WALL ---
furniture.push({ type: 'draftBoard', x: 4, y: 1, w: 8, h: 2 });
blockRect(4, 1, 8, 1);

furniture.push({ type: 'tv', x: 14, y: 1, w: 2, h: 2 });
furniture.push({ type: 'tv', x: 17, y: 1, w: 2, h: 2 });
blockRect(14, 1, 2, 1);
blockRect(17, 1, 2, 1);

furniture.push({ type: 'clock', x: 21, y: 1 });

furniture.push({ type: 'banner', x: 24, y: 1, w: 4, h: 2 });

furniture.push({ type: 'trophyCase', x: 1, y: 1, w: 2, h: 2 });
blockRect(1, 1, 2, 1);

// --- ANALYST DESKS (top row) ---
furniture.push({ type: 'desk', x: 2, y: 4, facing: 'down' });
blockRect(2, 4, 3, 2);

furniture.push({ type: 'desk', x: 7, y: 4, facing: 'down' });
blockRect(7, 4, 3, 2);

furniture.push({ type: 'desk', x: 21, y: 4, facing: 'down' });
blockRect(21, 4, 3, 2);

furniture.push({ type: 'desk', x: 26, y: 4, facing: 'down' });
blockRect(26, 4, 3, 2);

// --- CENTRAL WAR TABLE (on turf) ---
furniture.push({ type: 'warTable', x: 11, y: 9, w: 8, h: 4 });
blockRect(11, 9, 8, 4);

// --- BOTTOM ROW DESKS ---
furniture.push({ type: 'desk', x: 2, y: 15, facing: 'up' });
blockRect(2, 15, 3, 2);

furniture.push({ type: 'desk', x: 7, y: 15, facing: 'up' });
blockRect(7, 15, 3, 2);

// --- SIDE FEATURES ---
furniture.push({ type: 'coffee', x: 26, y: 9 });
blockRect(26, 9, 2, 2);

furniture.push({ type: 'bookshelf', x: 27, y: 13, h: 3 });
blockRect(28, 13, 1, 3);

furniture.push({ type: 'whiteboard', x: 14, y: 17, w: 5, h: 2 });
blockRect(14, 18, 5, 1);

furniture.push({ type: 'plant', x: 1, y: 8 });
furniture.push({ type: 'plant', x: 1, y: 14 });
furniture.push({ type: 'plant', x: 28, y: 4 });
furniture.push({ type: 'plant', x: 28, y: 17 });
blockTile(1, 8);
blockTile(1, 14);
blockTile(28, 4);
blockTile(28, 17);

furniture.push({ type: 'helmet', x: 22, y: 1 });
furniture.push({ type: 'helmet', x: 23, y: 1 });

furniture.push({ type: 'phone', x: 2, y: 18 });
blockTile(2, 18);

furniture.push({ type: 'cabinet', x: 11, y: 16, h: 2 });
blockRect(11, 16, 1, 2);

// Chairs around war table
furniture.push({ type: 'chair', x: 10, y: 10, facing: 'right' });
furniture.push({ type: 'chair', x: 10, y: 11, facing: 'right' });
furniture.push({ type: 'chair', x: 19, y: 10, facing: 'left' });
furniture.push({ type: 'chair', x: 19, y: 11, facing: 'left' });
furniture.push({ type: 'chair', x: 13, y: 8, facing: 'down' });
furniture.push({ type: 'chair', x: 16, y: 8, facing: 'down' });
furniture.push({ type: 'chair', x: 13, y: 13, facing: 'up' });
furniture.push({ type: 'chair', x: 16, y: 13, facing: 'up' });

// ── DRAWING HELPERS ────────────────────────────────────────────────────
const now = () => performance.now();

function px(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
}

function drawPixelRect(x, y, w, h, fill, border) {
  if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
  if (border) { ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
}

// ── FLOOR RENDERING ────────────────────────────────────────────────────
function drawFloor() {
  px(0, 0, WORLD_W, WORLD_H, C.wallDark);

  for (const z of zones) {
    if (z.type === ZONE_WOOD) {
      for (let r = z.y; r < z.y + z.h; r++) {
        for (let c = z.x; c < z.x + z.w; c++) {
          const tx = c * TILE, ty = r * TILE;
          const variant = ((c + r * 3) % 3);
          const col = variant === 0 ? C.floorWood1 : variant === 1 ? C.floorWood2 : C.floorWood3;
          px(tx, ty, TILE, TILE, col);
          px(tx, ty, TILE, 1, 'rgba(0,0,0,0.08)');
          if ((c + r) % 4 === 0) px(tx + TILE - 1, ty, 1, TILE, 'rgba(0,0,0,0.06)');
        }
      }
    } else if (z.type === ZONE_TURF) {
      for (let r = z.y; r < z.y + z.h; r++) {
        for (let c = z.x; c < z.x + z.w; c++) {
          const tx = c * TILE, ty = r * TILE;
          const variant = (c + r) % 2;
          px(tx, ty, TILE, TILE, variant ? C.turf1 : C.turf2);
        }
      }
      const turfX = z.x * TILE, turfY = z.y * TILE;
      const turfW = z.w * TILE, turfH = z.h * TILE;
      ctx.strokeStyle = C.turfLine;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
      const cx = turfX + turfW / 2;
      ctx.beginPath(); ctx.moveTo(cx, turfY + 4); ctx.lineTo(cx, turfY + turfH - 4); ctx.stroke();
      for (let i = 1; i < 4; i++) {
        const lx = turfX + (turfW * i / 4);
        ctx.beginPath(); ctx.moveTo(lx, turfY + turfH * 0.3); ctx.lineTo(lx, turfY + turfH * 0.7); ctx.stroke();
      }
      ctx.strokeRect(turfX + 2, turfY + 2, turfW - 4, turfH - 4);
      ctx.globalAlpha = 1;
    }
  }

  // Wall trim
  for (let c = 0; c < COLS; c++) {
    px(c * TILE, 2 * TILE - 4, TILE, 4, C.wallAccent);
  }
  // Wall surface
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < COLS; c++) {
      const tx = c * TILE, ty = r * TILE;
      px(tx, ty, TILE, TILE, C.wallMid);
      if ((c + r) % 3 === 0) px(tx + 4, ty + 4, TILE - 8, TILE - 8, C.wallLight);
    }
  }
  // Bottom wall
  for (let c = 0; c < COLS; c++) {
    px(c * TILE, (ROWS - 1) * TILE, TILE, TILE, C.wallMid);
  }
  // Side walls
  for (let r = 0; r < ROWS; r++) {
    px(0, r * TILE, TILE, TILE, C.wallMid);
    px((COLS - 1) * TILE, r * TILE, TILE, TILE, C.wallMid);
  }
}

// ── FURNITURE RENDERING ────────────────────────────────────────────────

function drawDraftBoard(f) {
  const x = f.x * TILE, y = f.y * TILE;
  const w = f.w * TILE, h = f.h * TILE;
  drawPixelRect(x + 2, y + 2, w - 4, h - 4, C.boardBg, C.boardFrame);
  ctx.fillStyle = '#d97757';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DRAFT BOARD', x + w / 2, y + 14);
  const cardW = 22, cardH = 8, gap = 3;
  const startX = x + 8, startY = y + 20;
  const colors = ['#d97757','#5b7fff','#2ec4b6','#8b5cf6','#e87422','#d44040','#ffc857','#33aaaa'];
  const t = now();
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 9; col++) {
      const cx = startX + col * (cardW + gap);
      const cy = startY + row * (cardH + gap);
      const ci = (row * 9 + col) % colors.length;
      const flipPhase = Math.sin(t / 2000 + row * 3 + col * 7);
      const scaleX = flipPhase > 0.92 ? Math.abs(Math.cos(t / 200 + col)) : 1;
      if (scaleX > 0.1) {
        const adjW = cardW * scaleX;
        const adjX = cx + (cardW - adjW) / 2;
        px(adjX, cy, adjW, cardH, colors[ci]);
        if (scaleX > 0.5) {
          px(adjX + 2, cy + 2, adjW * 0.6, 2, 'rgba(255,255,255,0.4)');
        }
      }
    }
  }
  ctx.textAlign = 'left';
}

function drawTV(f) {
  const x = f.x * TILE, y = f.y * TILE;
  const w = f.w * TILE, h = f.h * TILE;
  drawPixelRect(x + 3, y + 4, w - 6, h - 10, C.tvFrame);
  const sx = x + 6, sy = y + 7, sw = w - 12, sh = h - 18;
  px(sx, sy, sw, sh, C.tvScreen);
  const t = now();
  for (let i = 0; i < 8; i++) {
    const bx = sx + ((t / 50 + i * 13) % sw);
    const by = sy + ((Math.sin(t / 800 + i) + 1) * sh / 2.5) + 2;
    px(bx % (sx + sw), by, 4, 3, i % 2 === 0 ? C.tvGlow : '#55aaee');
  }
  const scanY = sy + ((t / 30) % sh);
  px(sx, scanY, sw, 1, 'rgba(100,180,255,0.15)');
  px(x + w / 2 - 3, y + h - 6, 6, 4, C.tvFrame);
}

function drawDesk(f) {
  const x = f.x * TILE, y = f.y * TILE;
  const w = 3 * TILE, h = 2 * TILE;
  drawPixelRect(x + 2, y + 6, w - 4, h - 16, C.deskTop);
  drawPixelRect(x + 2, y + h - 10, w - 4, 10, C.deskFront);
  px(x + 4, y + h - 4, 4, 4, C.deskLeg);
  px(x + w - 8, y + h - 4, 4, 4, C.deskLeg);
  const mx = x + w / 2 - 10, my = y + 2;
  drawPixelRect(mx, my, 20, 14, C.monitor);
  const t = now();
  px(mx + 2, my + 2, 16, 10, C.screenBg);
  const cursorOn = Math.floor(t / 500) % 2;
  for (let line = 0; line < 3; line++) {
    const lw = 6 + ((line * 7 + Math.floor(t / 3000)) % 8);
    px(mx + 3, my + 3 + line * 3, lw, 2, C.monitorGlow);
  }
  if (cursorOn) px(mx + 14, my + 9, 2, 2, C.monitorGlow);
  px(mx + 8, my + 14, 4, 3, '#333');
  px(x + w / 2 - 8, y + 20, 16, 4, '#333');
  px(x + w / 2 - 7, y + 21, 14, 2, '#555');
}

function drawPixelFootball(x, y) {
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(x, y + 1, 8, 4);
  ctx.fillRect(x + 1, y, 6, 6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 3, y + 1, 1, 4);
  ctx.fillRect(x + 2, y + 2, 3, 1);
}

function drawWarTable(f) {
  const x = f.x * TILE, y = f.y * TILE;
  const w = f.w * TILE, h = f.h * TILE;
  px(x + 4, y + 4, w - 4, h - 4, 'rgba(0,0,0,0.2)');
  drawPixelRect(x, y + 4, w, h - 8, C.tableTop, C.tableDark);
  drawPixelRect(x + 6, y + 8, w - 12, h - 16, null, 'rgba(100,70,30,0.3)');
  // Center emblem — Razzle tiger
  const cx = x + w / 2, cy = y + h / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#d97757';
  ctx.fill();
  ctx.strokeStyle = '#ffc857';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#2d1f14';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RAZZLE', cx, cy);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  // Papers
  px(x + 14, y + 12, 12, 8, '#e8e0cc');
  px(x + 15, y + 13, 8, 1, '#666');
  px(x + 15, y + 15, 6, 1, '#666');
  px(x + w - 30, y + h - 22, 10, 7, '#ddd8c8');
  drawPixelFootball(x + w - 45, y + 14);
}

function drawCoffee(f) {
  const x = f.x * TILE, y = f.y * TILE;
  drawPixelRect(x + 4, y + 4, 24, 28, C.coffeeMach, C.coffeeAccent);
  px(x + 8, y + 8, 16, 8, '#1a3a1a');
  px(x + 9, y + 9, 4, 2, '#33cc33');
  px(x + 10, y + 20, 12, 8, '#333');
  px(x + 13, y + 22, 6, 5, '#e8e0cc');
  px(x + 12, y + 22, 8, 1, '#d0c8b0');
  const t = now();
  const steamPhase = Math.floor(t / 300) % 4;
  ctx.globalAlpha = 0.4;
  px(x + 14 + (steamPhase % 2), y + 18 - steamPhase, 2, 2, '#ccc');
  px(x + 16 - (steamPhase % 2), y + 16 - steamPhase, 2, 2, '#ccc');
  ctx.globalAlpha = 1;
  px(x + 30, y + 26, 6, 5, '#e8e0cc');
  const steam2 = Math.floor(t / 400) % 3;
  ctx.globalAlpha = 0.3;
  px(x + 31 + steam2 % 2, y + 22 - steam2, 2, 2, '#ddd');
  ctx.globalAlpha = 1;
}

function drawBookshelf(f) {
  const x = f.x * TILE, y = f.y * TILE;
  const h = (f.h || 3) * TILE;
  drawPixelRect(x + 2, y, TILE - 4, h, C.shelfWood);
  const bookColors = [C.shelfBook1, C.shelfBook2, C.shelfBook3, '#d97757', '#8b5cf6', '#2ec4b6'];
  for (let shelf = 0; shelf < 3; shelf++) {
    const sy = y + 4 + shelf * (TILE - 2);
    px(x + 2, sy + TILE - 10, TILE - 4, 2, '#553a1a');
    for (let b = 0; b < 4; b++) {
      const bh = 8 + (b % 3) * 2;
      px(x + 4 + b * 6, sy + TILE - 10 - bh, 5, bh, bookColors[(shelf * 4 + b) % bookColors.length]);
    }
  }
}

function drawPlant(f) {
  const x = f.x * TILE + 8, y = f.y * TILE + 8;
  px(x + 2, y + 14, 12, 8, C.plantPot);
  px(x + 4, y + 12, 8, 4, C.plantPot);
  const t = now();
  const sway = Math.sin(t / 1200) * 2;
  ctx.fillStyle = C.plantLeaf;
  ctx.fillRect(x + 6 + sway, y, 4, 14);
  ctx.fillRect(x + 2 + sway * 0.5, y + 4, 6, 4);
  ctx.fillRect(x + 8 - sway * 0.5, y + 2, 6, 4);
  ctx.fillRect(x + 4 + sway * 0.7, y - 2, 4, 6);
}

function drawClock(f) {
  const x = f.x * TILE + TILE / 2, y = f.y * TILE + TILE / 2 + 4;
  const r = 12;
  ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2);
  ctx.fillStyle = C.clockFrame; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = C.clockFace; ctx.fill();
  const t = now();
  const sec = (t / 1000) % 60;
  const min = (t / 60000) % 60;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  const mAngle = (min / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(mAngle) * 8, y + Math.sin(mAngle) * 8);
  ctx.stroke();
  ctx.strokeStyle = '#d97757';
  ctx.lineWidth = 1;
  const sAngle = (sec / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(sAngle) * 9, y + Math.sin(sAngle) * 9);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#333'; ctx.fill();
}

function drawBanner(f) {
  const x = f.x * TILE, y = f.y * TILE;
  const w = f.w * TILE, h = f.h * TILE;
  drawPixelRect(x + 2, y + 4, w - 4, h - 8, C.bannerBg, '#ffc857');
  ctx.fillStyle = C.bannerBg;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + h - 4);
  ctx.lineTo(x + w / 2, y + h + 4);
  ctx.lineTo(x + w - 2, y + h - 4);
  ctx.fill();
  ctx.fillStyle = C.bannerText;
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RAZZLE', x + w / 2, y + 22);
  ctx.font = 'bold 9px monospace';
  ctx.fillText('WAR ROOM', x + w / 2, y + 36);
  ctx.textAlign = 'left';
}

function drawTrophyCase(f) {
  const x = f.x * TILE, y = f.y * TILE;
  const w = f.w * TILE, h = f.h * TILE;
  drawPixelRect(x + 2, y + 2, w - 4, h - 4, '#2a2018', C.shelfWood);
  px(x + 4, y + 4, w - 8, h - 8, 'rgba(200,220,255,0.15)');
  const tx = x + 10, ty = y + 12;
  px(tx + 2, ty, 4, 8, C.trophy);
  px(tx, ty + 8, 8, 3, C.trophyBase);
  px(tx - 1, ty - 2, 10, 3, C.trophy);
  const tx2 = x + 36, ty2 = y + 14;
  px(tx2 + 2, ty2, 3, 6, C.trophy);
  px(tx2, ty2 + 6, 7, 2, C.trophyBase);
  const t = now();
  const sparkle = Math.floor(t / 400) % 6;
  if (sparkle < 2) {
    ctx.globalAlpha = 0.7;
    px(tx + sparkle * 3, ty - 1, 2, 2, '#fff');
    ctx.globalAlpha = 1;
  }
}

function drawHelmet(f) {
  const x = f.x * TILE + 6, y = f.y * TILE + 8;
  ctx.fillStyle = C.helmetBase;
  ctx.beginPath();
  ctx.arc(x + 8, y + 8, 9, Math.PI, 0);
  ctx.fillRect(x - 1, y + 8, 18, 6);
  ctx.fill();
  ctx.fillStyle = C.helmetStripe;
  ctx.fillRect(x + 6, y - 1, 4, 16);
  ctx.fillStyle = '#888';
  ctx.fillRect(x + 14, y + 6, 4, 2);
  ctx.fillRect(x + 14, y + 10, 4, 2);
}

function drawWhiteboard(f) {
  const x = f.x * TILE, y = f.y * TILE;
  const w = f.w * TILE, h = f.h * TILE;
  drawPixelRect(x + 2, y + 2, w - 4, h - 4, C.wbFrame);
  drawPixelRect(x + 5, y + 5, w - 10, h - 10, C.whiteboard);
  ctx.strokeStyle = '#d97757';
  ctx.lineWidth = 2;
  const bx = x + 10, by = y + 10;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(bx + 20 + i * 14, by + 20, 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#5b7fff';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(bx + 20, by + 16); ctx.lineTo(bx + 10, by + 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + 48, by + 16); ctx.lineTo(bx + 70, by + 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + 76, by + 16); ctx.lineTo(bx + 76, by + 8); ctx.lineTo(bx + 90, by + 4); ctx.stroke();
  ctx.strokeStyle = '#d97757';
  ctx.lineWidth = 1.5;
  const defs = [[30, 6], [55, 8], [80, 10], [15, 30], [60, 32]];
  for (const [dx, dy] of defs) {
    ctx.beginPath(); ctx.moveTo(bx + dx - 3, by + dy - 3); ctx.lineTo(bx + dx + 3, by + dy + 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + dx + 3, by + dy - 3); ctx.lineTo(bx + dx - 3, by + dy + 3); ctx.stroke();
  }
  px(x + w / 2 - 20, y + h - 6, 40, 4, '#aaa');
  px(x + w / 2 - 15, y + h - 8, 6, 4, '#d97757');
  px(x + w / 2 - 5, y + h - 8, 6, 4, '#5b7fff');
  px(x + w / 2 + 5, y + h - 8, 6, 4, '#333');
}

function drawChair(f) {
  const x = f.x * TILE + 8, y = f.y * TILE + 8;
  px(x + 2, y + 4, 12, 10, C.chairSeat);
  if (f.facing === 'down') px(x + 2, y, 12, 6, C.chairBack);
  else if (f.facing === 'up') px(x + 2, y + 10, 12, 6, C.chairBack);
  else if (f.facing === 'left') px(x, y + 2, 6, 12, C.chairBack);
  else px(x + 10, y + 2, 6, 12, C.chairBack);
}

function drawPhone(f) {
  const x = f.x * TILE + 4, y = f.y * TILE + 4;
  px(x + 2, y + 8, 20, 14, C.phone);
  px(x + 4, y + 4, 16, 6, '#333');
  px(x + 3, y + 2, 6, 6, '#111');
  px(x + 13, y + 2, 6, 6, '#111');
  px(x + 5, y + 1, 12, 3, '#111');
  const t = now();
  const blink = Math.floor(t / 800) % 2;
  px(x + 10, y + 14, 4, 3, blink ? C.phoneRed : '#881111');
  px(x + 22, y + 14, 4, 2, '#333');
}

function drawCabinet(f) {
  const x = f.x * TILE, y = f.y * TILE;
  const h = (f.h || 1) * TILE;
  drawPixelRect(x + 4, y + 2, TILE - 8, h - 4, '#555', '#444');
  for (let i = 0; i < Math.floor(h / TILE); i++) {
    const dy = y + 4 + i * TILE;
    px(x + 6, dy + 10, TILE - 12, 1, '#333');
    px(x + TILE / 2 - 2, dy + 8, 4, 2, '#888');
  }
}

function drawFurniture() {
  const sorted = [...furniture].sort((a, b) => a.y - b.y);
  for (const f of sorted) {
    switch (f.type) {
      case 'draftBoard':  drawDraftBoard(f); break;
      case 'tv':          drawTV(f); break;
      case 'desk':        drawDesk(f); break;
      case 'warTable':    drawWarTable(f); break;
      case 'coffee':      drawCoffee(f); break;
      case 'bookshelf':   drawBookshelf(f); break;
      case 'plant':       drawPlant(f); break;
      case 'clock':       drawClock(f); break;
      case 'banner':      drawBanner(f); break;
      case 'trophyCase':  drawTrophyCase(f); break;
      case 'helmet':      drawHelmet(f); break;
      case 'whiteboard':  drawWhiteboard(f); break;
      case 'chair':       drawChair(f); break;
      case 'phone':       drawPhone(f); break;
      case 'cabinet':     drawCabinet(f); break;
    }
  }
}

// ── PARTICLE SYSTEM ────────────────────────────────────────────────────
const particles = [];

function spawnParticle(x, y, type) {
  if (particles.length >= 200) return; // Cap particle array
  particles.push({
    x, y,
    vx: (Math.random() - 0.5) * 2,
    vy: -Math.random() * 2 - 1,
    life: 1,
    decay: 0.015 + Math.random() * 0.01,
    type,
    size: 2 + Math.random() * 2,
    color: type === 'confetti'
      ? ['#d97757','#5b7fff','#2ec4b6','#ffc857','#8b5cf6'][Math.floor(Math.random()*5)]
      : type === 'dust' ? '#a09070' : '#ddd',
  });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.type === 'confetti') p.vy += 0.05;
    else if (p.type === 'steam') p.vy -= 0.01;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    px(p.x, p.y, p.size, p.size, p.color);
  }
  ctx.globalAlpha = 1;
}

// ── AGENT DEFINITIONS ──────────────────────────────────────────────────
const AGENT_DEFS = [
  { id: 0, name: 'Razzle',    role: 'Chief of Staff', sprite: 'char_0', color: '#d97757',
    homeX: 14, homeY: 8, stations: [{x:14,y:8},{x:15,y:10},{x:6,y:3},{x:20,y:10}] },
  { id: 1, name: 'Medical',   role: 'Medical Analyst', sprite: 'char_1', color: '#5b7fff',
    homeX: 3, homeY: 7, stations: [{x:3,y:7},{x:15,y:13},{x:26,y:10},{x:12,y:10}] },
  { id: 2, name: 'Scout',     role: 'Scout', sprite: 'char_2', color: '#2ec4b6',
    homeX: 8, homeY: 7, stations: [{x:8,y:7},{x:15,y:3},{x:18,y:10},{x:10,y:8}] },
  { id: 3, name: 'Diplomat',  role: 'Diplomat', sprite: 'char_3', color: '#8b5cf6',
    homeX: 22, homeY: 7, stations: [{x:22,y:7},{x:3,y:18},{x:16,y:13},{x:10,y:11}] },
  { id: 4, name: 'Quant',     role: 'Quant', sprite: 'char_4', color: '#e87422',
    homeX: 3, homeY: 14, stations: [{x:3,y:14},{x:16,y:8},{x:26,y:10},{x:19,y:10}] },
  { id: 5, name: 'Historian', role: 'Historian', sprite: 'char_5', color: '#d44040',
    homeX: 8, homeY: 14, stations: [{x:8,y:14},{x:27,y:14},{x:12,y:11},{x:20,y:18}] },
];

// ── AGENT CLASS ────────────────────────────────────────────────────────
class Agent {
  constructor(def) {
    Object.assign(this, def);
    this.x = def.homeX * TILE + TILE / 2;
    this.y = def.homeY * TILE + TILE / 2;
    this.dir = DIR.DOWN;
    this.state = STATE.IDLE;
    this.frame = 0;
    this.animTimer = 0;
    this.stateTimer = 0;
    this.targetX = this.x;
    this.targetY = this.y;
    this.speed = 1.2 + Math.random() * 0.4;
    this.selected = false;
    this.controlled = false;
    this.workBubble = '';
    this.bubbleTimer = 0;
    this.stationIndex = 0;
    this.idleDuration = 2000 + Math.random() * 3000;
    this.workDuration = 4000 + Math.random() * 4000;
    this.celebrateTimer = 0;
    this.bobOffset = Math.random() * Math.PI * 2;
  }

  get tileX() { return Math.floor(this.x / TILE); }
  get tileY() { return Math.floor(this.y / TILE); }

  setTarget(tx, ty) {
    const ttx = tx * TILE + TILE / 2;
    const tty = ty * TILE + TILE / 2;
    if (isWalkable(tx, ty)) {
      this.targetX = ttx;
      this.targetY = tty;
      this.state = STATE.WALK;
    }
  }

  moveToward(tx, ty, dt) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) {
      this.x = tx;
      this.y = ty;
      return true;
    }
    const step = this.speed * dt * 0.06;
    const mx = (dx / dist) * Math.min(step, dist);
    const my = (dy / dist) * Math.min(step, dist);

    if (Math.abs(dx) > Math.abs(dy)) {
      this.dir = dx > 0 ? DIR.RIGHT : DIR.LEFT;
    } else {
      this.dir = dy > 0 ? DIR.DOWN : DIR.UP;
    }

    const nx = this.x + mx;
    const ny = this.y + my;
    if (isWalkable(Math.floor(nx / TILE), Math.floor(ny / TILE))) {
      this.x = nx;
      this.y = ny;
    } else {
      if (isWalkable(Math.floor((this.x + mx) / TILE), this.tileY)) {
        this.x += mx;
      } else if (isWalkable(this.tileX, Math.floor((this.y + my) / TILE))) {
        this.y += my;
      }
      return true;
    }
    return false;
  }

  updateAnimation(dt) {
    this.animTimer += dt;
    if (this.state === STATE.WALK) {
      if (this.animTimer >= ANIM_SPEED) {
        this.animTimer = 0;
        this.frame = (this.frame + 1) % WALK_FRAMES.length;
      }
    } else {
      this.frame = 0;
      this.animTimer = 0;
    }
  }

  updateAI(dt) {
    if (this.controlled) return;
    this.stateTimer += dt;

    switch (this.state) {
      case STATE.IDLE:
        if (this.stateTimer > this.idleDuration) {
          this.stateTimer = 0;
          this.stationIndex = (this.stationIndex + 1) % this.stations.length;
          const station = this.stations[this.stationIndex];
          this.setTarget(station.x, station.y);
        }
        break;

      case STATE.WALK: {
        const arrived = this.moveToward(this.targetX, this.targetY, dt);
        if (arrived) {
          if (this.stationIndex === 0) {
            this.state = STATE.WORK_DESK;
            this.workBubble = 'typing';
          } else if (this.stationIndex === 1) {
            this.state = STATE.THINK;
            this.workBubble = 'think';
          } else if (this.stationIndex === 2) {
            this.state = STATE.COFFEE;
            this.workBubble = 'coffee';
          } else {
            this.state = STATE.DISCUSS;
            this.workBubble = 'discuss';
          }
          this.stateTimer = 0;
          this.workDuration = 3000 + Math.random() * 5000;
          this.bubbleTimer = 0;

          if (Math.random() < 0.08) {
            this.state = STATE.CELEBRATE;
            this.celebrateTimer = 0;
            this.workBubble = 'eureka';
          }
        }
        break;
      }

      case STATE.WORK_DESK:
      case STATE.ANALYZE_BOARD:
      case STATE.THINK:
      case STATE.DISCUSS:
      case STATE.COFFEE:
        this.bubbleTimer += dt;
        if (this.stateTimer > this.workDuration) {
          this.state = STATE.IDLE;
          this.stateTimer = 0;
          this.workBubble = '';
          this.idleDuration = 1500 + Math.random() * 2000;
        }
        break;

      case STATE.CELEBRATE:
        this.celebrateTimer += dt;
        if (this.celebrateTimer > 1800) {
          this.state = STATE.IDLE;
          this.stateTimer = 0;
          this.workBubble = '';
        } else {
          if (Math.random() < 0.3) {
            spawnParticle(this.x - 4 + Math.random() * 8, this.y - 20, 'confetti');
          }
        }
        break;
    }

    if (this.state === STATE.WALK && Math.random() < 0.05) {
      spawnParticle(this.x, this.y + 10, 'dust');
    }
  }

  draw() {
    const img = spriteImgs[this.sprite];
    if (!img || !img.complete) return;

    const frameCol = this.state === STATE.WALK ? WALK_FRAMES[this.frame] : IDLE_FRAME;
    const frameRow = this.dir;
    const sx = frameCol * FR_W;
    const sy = frameRow * FR_H;

    let drawX = Math.floor(this.x - (FR_W * SP_SCALE) / 2);
    let drawY = Math.floor(this.y - (FR_H * SP_SCALE) + 8);

    if (this.state === STATE.CELEBRATE) {
      const bounce = Math.abs(Math.sin(this.celebrateTimer / 150 * Math.PI)) * 12;
      drawY -= bounce;
    }

    if (this.state !== STATE.WALK && this.state !== STATE.CELEBRATE) {
      const bob = Math.sin(now() / 800 + this.bobOffset) * 1.5;
      drawY += bob;
    }

    // Shadow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 10, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Selection highlight
    if (this.selected) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 10, 14, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Sprite
    ctx.drawImage(img, sx, sy, FR_W, FR_H, drawX, drawY, FR_W * SP_SCALE, FR_H * SP_SCALE);

    // Name tag
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    const nameW = ctx.measureText(this.name).width + 8;
    const nameX = this.x - nameW / 2;
    const nameY = drawY - 10;
    drawPixelRect(nameX, nameY, nameW, 11, C.nameTag);
    ctx.fillStyle = this.color;
    ctx.fillText(this.name, this.x, nameY + 9);
    ctx.textAlign = 'left';

    // Activity bubble
    if (this.workBubble && this.state !== STATE.WALK && this.state !== STATE.IDLE) {
      this.drawBubble(drawX + FR_W * SP_SCALE / 2, drawY - 12);
    }
  }

  drawBubble(bx, by) {
    const t = now();
    const bubW = 28, bubH = 20;
    const x = bx - bubW / 2, y = by - bubH;

    drawPixelRect(x, y, bubW, bubH, C.bubbleBg, C.bubbleBorder);
    px(bx - 2, y + bubH, 2, 3, C.bubbleBg);
    px(bx, y + bubH, 1, 2, C.bubbleBorder);

    const phase = Math.floor(t / 400) % 4;

    switch (this.workBubble) {
      case 'typing':
        for (let i = 0; i < 3; i++) {
          const dotOn = (phase + i) % 4 !== 3;
          if (dotOn) px(x + 6 + i * 6, y + 8, 4, 4, '#333');
          else px(x + 6 + i * 6, y + 9, 4, 3, '#999');
        }
        break;
      case 'think': {
        ctx.fillStyle = phase % 2 === 0 ? '#ffcc00' : '#ddaa00';
        ctx.beginPath();
        ctx.arc(x + bubW / 2, y + 8, 5, 0, Math.PI * 2);
        ctx.fill();
        px(x + bubW / 2 - 1, y + 13, 3, 3, '#888');
        if (phase < 2) {
          ctx.globalAlpha = 0.5;
          for (let a = 0; a < 4; a++) {
            const angle = (a / 4) * Math.PI * 2 + t / 600;
            px(x + bubW / 2 + Math.cos(angle) * 7, y + 8 + Math.sin(angle) * 7, 2, 2, '#ffcc00');
          }
          ctx.globalAlpha = 1;
        }
        break;
      }
      case 'discuss':
        for (let i = 0; i < 3; i++) {
          const lw = 8 + ((phase + i) % 3) * 4;
          px(x + 4, y + 4 + i * 5, Math.min(lw, bubW - 8), 2, '#555');
        }
        break;
      case 'coffee': {
        px(x + 8, y + 6, 10, 8, '#8B6914');
        px(x + 9, y + 7, 8, 6, '#4a2e14');
        const s = phase;
        ctx.globalAlpha = 0.5;
        px(x + 10 + (s % 2), y + 2 + s, 2, 2, '#ccc');
        px(x + 14 - (s % 2), y + 3 + (s + 1) % 3, 2, 2, '#ccc');
        ctx.globalAlpha = 1;
        break;
      }
      case 'eureka':
        drawPixelFootball(x + 7, y + 4);
        ctx.fillStyle = '#d97757';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', x + bubW - 6, y + 14);
        ctx.textAlign = 'left';
        break;
    }
  }
}

// ── INSTANTIATE AGENTS ─────────────────────────────────────────────────
const agents = AGENT_DEFS.map(def => new Agent(def));
let selectedAgent = agents[0];
selectedAgent.selected = true;

// ── INPUT HANDLING ─────────────────────────────────────────────────────
const keys = {};

document.addEventListener('keydown', e => {
  // Only handle when canvas is visible
  if (!document.getElementById('canvasContainer')) return;
  keys[e.key] = true;
  if (e.key >= '1' && e.key <= '6') {
    selectAgent(parseInt(e.key) - 1);
  }
});

document.addEventListener('keyup', e => {
  keys[e.key] = false;
});

function selectAgent(idx) {
  if (idx >= 0 && idx < agents.length) {
    agents.forEach(a => { a.selected = false; a.controlled = false; });
    selectedAgent = agents[idx];
    selectedAgent.selected = true;
  }
}

function handleInput(dt) {
  const a = selectedAgent;
  let dx = 0, dy = 0;

  if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx -= 1;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
  if (keys['ArrowUp']    || keys['w'] || keys['W']) dy -= 1;
  if (keys['ArrowDown']  || keys['s'] || keys['S']) dy += 1;

  if (dx !== 0 || dy !== 0) {
    a.controlled = true;
    a.state = STATE.WALK;
    a.workBubble = '';

    if (Math.abs(dx) >= Math.abs(dy)) {
      a.dir = dx > 0 ? DIR.RIGHT : DIR.LEFT;
    } else {
      a.dir = dy > 0 ? DIR.DOWN : DIR.UP;
    }

    const step = a.speed * dt * 0.06;
    const nx = a.x + dx * step;
    const ny = a.y + dy * step;

    if (dx !== 0 && isWalkable(Math.floor(nx / TILE), a.tileY)) {
      a.x = nx;
    }
    if (dy !== 0 && isWalkable(a.tileX, Math.floor(ny / TILE))) {
      a.y = ny;
    }

    if (Math.random() < 0.06) spawnParticle(a.x, a.y + 10, 'dust');
  } else if (a.controlled) {
    a.controlled = false;
    a.state = STATE.IDLE;
    a.stateTimer = 0;
  }
}

// Mouse/touch for panning and agent selection
let dragging = false, dragStartX = 0, dragStartY = 0, dragCamX = 0, dragCamY = 0;
let mouseDownTime = 0;

cvs.addEventListener('mousedown', e => {
  dragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragCamX = cam.targetX;
  dragCamY = cam.targetY;
  mouseDownTime = now();
});

cvs.addEventListener('mousemove', e => {
  if (!dragging) return;
  const scaleX = cvs.width / cvs.clientWidth;
  const scaleY = cvs.height / cvs.clientHeight;
  cam.targetX = dragCamX - (e.clientX - dragStartX) * scaleX;
  cam.targetY = dragCamY - (e.clientY - dragStartY) * scaleY;
});

cvs.addEventListener('mouseup', e => {
  const wasDrag = Math.abs(e.clientX - dragStartX) > 5 || Math.abs(e.clientY - dragStartY) > 5;
  dragging = false;
  if (!wasDrag && now() - mouseDownTime < 300) {
    const rect = cvs.getBoundingClientRect();
    const scaleX = cvs.width / rect.width;
    const scaleY = cvs.height / rect.height;
    const wx = (e.clientX - rect.left) * scaleX + cam.x;
    const wy = (e.clientY - rect.top) * scaleY + cam.y;
    let closest = null, closestDist = 40;
    for (const a of agents) {
      const d = Math.sqrt((a.x - wx) ** 2 + (a.y - wy) ** 2);
      if (d < closestDist) { closest = a; closestDist = d; }
    }
    if (closest) selectAgent(closest.id);
  }
});

// Touch support
cvs.addEventListener('touchstart', e => {
  const t = e.touches[0];
  dragging = true;
  dragStartX = t.clientX;
  dragStartY = t.clientY;
  dragCamX = cam.targetX;
  dragCamY = cam.targetY;
  mouseDownTime = now();
}, { passive: true });

cvs.addEventListener('touchmove', e => {
  if (!dragging) return;
  const t = e.touches[0];
  const scaleX = cvs.width / cvs.clientWidth;
  const scaleY = cvs.height / cvs.clientHeight;
  cam.targetX = dragCamX - (t.clientX - dragStartX) * scaleX;
  cam.targetY = dragCamY - (t.clientY - dragStartY) * scaleY;
}, { passive: true });

cvs.addEventListener('touchend', () => {
  dragging = false;
}, { passive: true });

// ── AMBIENT EFFECTS ────────────────────────────────────────────────────
function ambientEffects() {
  if (Math.random() < 0.02) {
    spawnParticle(26 * TILE + 16, 9 * TILE + 18, 'steam');
  }
}

// ── HUD OVERLAY ────────────────────────────────────────────────────────
function drawHUD() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const hudX = 8, hudY = 8;
  const chipH = 18, chipGap = 4;

  for (let i = 0; i < agents.length; i++) {
    const a = agents[i];
    const cy = hudY + i * (chipH + chipGap);
    const label = `${i + 1} ${a.name}`;
    ctx.font = 'bold 9px monospace';
    const tw = ctx.measureText(label).width + 12;

    ctx.globalAlpha = a.selected ? 0.9 : 0.55;
    drawPixelRect(hudX, cy, tw, chipH, a.selected ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)');
    if (a.selected) {
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(hudX + 0.5, cy + 0.5, tw - 1, chipH - 1);
    }

    let dotColor = '#666';
    if (a.state === STATE.WALK) dotColor = '#33cc55';
    else if (a.state === STATE.WORK_DESK || a.state === STATE.ANALYZE_BOARD) dotColor = '#3388cc';
    else if (a.state === STATE.THINK) dotColor = '#ccaa33';
    else if (a.state === STATE.DISCUSS) dotColor = '#cc6633';
    else if (a.state === STATE.CELEBRATE) dotColor = '#cc3333';
    else if (a.state === STATE.COFFEE) dotColor = '#8B6914';
    px(hudX + 3, cy + chipH / 2 - 2, 4, 4, dotColor);

    ctx.fillStyle = a.selected ? a.color : '#ccc';
    ctx.globalAlpha = 1;
    ctx.fillText(label, hudX + 10, cy + 13);
  }

  // Controls hint
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#fff';
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Arrow keys: move  |  1-6: select agent  |  Click: select  |  Drag: pan', cvs.width / 2, cvs.height - 10);
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ── GAME LOOP ──────────────────────────────────────────────────────────
let lastTime = now();
let _rafId = null;

function gameLoop() {
  const t = now();
  const dt = Math.min(t - lastTime, 50);
  lastTime = t;

  handleInput(dt);
  for (const a of agents) {
    a.updateAI(dt);
    a.updateAnimation(dt);
  }
  updateParticles();
  ambientEffects();

  if (!dragging) {
    centerCamOn(selectedAgent.x, selectedAgent.y);
  }
  updateCam();
  clampCam();

  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.save();
  ctx.translate(-Math.floor(cam.x), -Math.floor(cam.y));

  drawFloor();
  drawFurniture();

  const sortedAgents = [...agents].sort((a, b) => a.y - b.y);
  for (const a of sortedAgents) {
    a.draw();
  }

  drawParticles();
  ctx.restore();

  drawHUD();

  _rafId = requestAnimationFrame(gameLoop);
}

// ── ROSTER SIDEBAR ─────────────────────────────────────────────────────
const STATE_LABELS = {
  [STATE.IDLE]: 'idle',
  [STATE.WALK]: 'walking',
  [STATE.WORK_DESK]: 'at desk',
  [STATE.ANALYZE_BOARD]: 'analyzing',
  [STATE.DISCUSS]: 'discussing',
  [STATE.THINK]: 'thinking',
  [STATE.CELEBRATE]: 'eureka!',
  [STATE.COFFEE]: 'coffee break',
};

const STATE_COLORS = {
  [STATE.IDLE]: '#666',
  [STATE.WALK]: '#33cc55',
  [STATE.WORK_DESK]: '#3388cc',
  [STATE.ANALYZE_BOARD]: '#3388cc',
  [STATE.DISCUSS]: '#cc6633',
  [STATE.THINK]: '#ccaa33',
  [STATE.CELEBRATE]: '#cc3333',
  [STATE.COFFEE]: '#8B6914',
};

function buildRoster() {
  const list = document.getElementById('rosterList');
  if (!list) return;
  list.innerHTML = '';

  for (const a of agents) {
    const row = document.createElement('div');
    row.className = 'roster-agent' + (a.selected ? ' selected' : '');
    row.dataset.agentId = a.id;

    // Draw mini sprite avatar onto a tiny canvas
    const miniCvs = document.createElement('canvas');
    miniCvs.width = FR_W;
    miniCvs.height = FR_H;
    miniCvs.className = 'roster-avatar';
    const miniCtx = miniCvs.getContext('2d');
    const img = spriteImgs[a.sprite];
    if (img && img.complete) {
      miniCtx.drawImage(img, 0, 0, FR_W, FR_H, 0, 0, FR_W, FR_H);
    }

    const info = document.createElement('div');
    info.className = 'roster-info';
    info.innerHTML = `
      <div class="roster-name" style="color:${a.color}">${a.name}</div>
      <div class="roster-role">${a.role}</div>
      <div class="roster-status">
        <span class="roster-dot" style="background:${STATE_COLORS[a.state] || '#666'}"></span>
        ${STATE_LABELS[a.state] || 'idle'}
      </div>
    `;

    row.appendChild(miniCvs);
    row.appendChild(info);
    row.addEventListener('click', () => {
      selectAgent(a.id);
      updateRosterSelection();
    });
    list.appendChild(row);
  }
}

function updateRosterSelection() {
  const rows = document.querySelectorAll('.roster-agent');
  rows.forEach(row => {
    const id = parseInt(row.dataset.agentId);
    row.classList.toggle('selected', agents[id].selected);
  });
}

function updateRosterStatus() {
  const rows = document.querySelectorAll('.roster-agent');
  rows.forEach(row => {
    const id = parseInt(row.dataset.agentId);
    const a = agents[id];
    const statusEl = row.querySelector('.roster-status');
    if (statusEl) {
      const dot = statusEl.querySelector('.roster-dot');
      if (dot) dot.style.background = STATE_COLORS[a.state] || '#666';
      statusEl.lastChild.textContent = ' ' + (STATE_LABELS[a.state] || 'idle');
    }
  });
}

// Toggle button
const rosterToggle = document.getElementById('rosterToggle');
const rosterPanel = document.getElementById('rosterPanel');
if (rosterToggle && rosterPanel) {
  rosterToggle.addEventListener('click', () => {
    rosterPanel.classList.toggle('open');
    if (rosterPanel.classList.contains('open')) {
      buildRoster();
    }
  });
}

// Update roster status every second
let _rosterInterval = setInterval(() => {
  if (rosterPanel && rosterPanel.classList.contains('open')) {
    updateRosterStatus();
    updateRosterSelection();
  }
}, 1000);

// Pause game loop and intervals when page is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    if (_rosterInterval) { clearInterval(_rosterInterval); _rosterInterval = null; }
  } else {
    lastTime = now();
    if (!_rafId) _rafId = requestAnimationFrame(gameLoop);
    if (!_rosterInterval) {
      _rosterInterval = setInterval(() => {
        if (rosterPanel && rosterPanel.classList.contains('open')) {
          updateRosterStatus();
          updateRosterSelection();
        }
      }, 1000);
    }
  }
});

// ── AGENT CONFIG PANEL ────────────────────────────────────────────────
const AGENT_CONFIG_KEY = 'razzle_agent_config';
const DEFAULT_MODEL = 'openrouter/auto';
const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

function loadAgentConfig() {
  try {
    const raw = localStorage.getItem(AGENT_CONFIG_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch (_) { return {}; }
}

function saveAgentConfig(cfg) {
  localStorage.setItem(AGENT_CONFIG_KEY, JSON.stringify(cfg));
}

function getAgentSettings(agentId) {
  const cfg = loadAgentConfig();
  const entry = cfg[String(agentId)] || {};
  return {
    apiKey: (typeof entry.apiKey === 'string') ? entry.apiKey : '',
    model: (typeof entry.model === 'string' && entry.model.trim()) ? entry.model.trim() : DEFAULT_MODEL,
    baseUrl: (typeof entry.baseUrl === 'string' && entry.baseUrl.trim()) ? entry.baseUrl.trim() : DEFAULT_BASE_URL,
  };
}

function setupConfigPanel() {
  const toggle = document.getElementById('configToggle');
  const panel = document.getElementById('configPanel');
  const sharedKeyInput = document.getElementById('cfgSharedKey');
  const modelInput = document.getElementById('cfgModel');
  const baseUrlInput = document.getElementById('cfgBaseUrl');
  const applyKeyBtn = document.getElementById('cfgApplyKey');
  const applyModelBtn = document.getElementById('cfgApplyModel');
  const applyUrlBtn = document.getElementById('cfgApplyUrl');
  const agentKeysHost = document.getElementById('cfgAgentKeys');
  const statusEl = document.getElementById('cfgStatus');
  if (!toggle || !panel) return;

  // Load existing config into fields
  const cfg = loadAgentConfig();
  const first = cfg['0'] || {};
  modelInput.value = (typeof first.model === 'string' && first.model.trim()) ? first.model.trim() : DEFAULT_MODEL;
  baseUrlInput.value = (typeof first.baseUrl === 'string' && first.baseUrl.trim()) ? first.baseUrl.trim() : DEFAULT_BASE_URL;

  // Build per-agent key rows
  agentKeysHost.innerHTML = AGENT_DEFS.map(a => {
    const entry = cfg[String(a.id)] || {};
    const key = (typeof entry.apiKey === 'string') ? entry.apiKey : '';
    return `<div class="config-agent-row" data-agent-id="${a.id}">
      <span class="config-agent-dot" style="background:${a.color}"></span>
      <span class="config-agent-name">${a.name}</span>
      <input class="config-agent-key" type="password" autocomplete="off"
        placeholder="shared key" value="${escapeHtml(key)}">
    </div>`;
  }).join('');

  function showStatus(msg) {
    if (statusEl) { statusEl.textContent = msg; }
  }

  // Toggle panel
  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
  });

  // Apply shared key to all agents
  applyKeyBtn.addEventListener('click', () => {
    const key = sharedKeyInput.value.trim();
    if (!key) { showStatus('enter a key first'); return; }
    const cfg = loadAgentConfig();
    AGENT_DEFS.forEach(a => {
      const existing = cfg[String(a.id)] || {};
      cfg[String(a.id)] = { ...existing, apiKey: key };
    });
    saveAgentConfig(cfg);
    // Update per-agent inputs
    agentKeysHost.querySelectorAll('.config-agent-key').forEach(inp => { inp.value = key; });
    sharedKeyInput.value = '';
    showStatus('key applied to all 6 agents');
    if (typeof updateApiKeyNotice === 'function') updateApiKeyNotice();
  });

  // Apply model to all
  applyModelBtn.addEventListener('click', () => {
    const model = modelInput.value.trim() || DEFAULT_MODEL;
    const cfg = loadAgentConfig();
    AGENT_DEFS.forEach(a => {
      const existing = cfg[String(a.id)] || {};
      cfg[String(a.id)] = { ...existing, model };
    });
    saveAgentConfig(cfg);
    showStatus('model set: ' + model);
  });

  // Apply base URL to all
  applyUrlBtn.addEventListener('click', () => {
    const baseUrl = baseUrlInput.value.trim() || DEFAULT_BASE_URL;
    const cfg = loadAgentConfig();
    AGENT_DEFS.forEach(a => {
      const existing = cfg[String(a.id)] || {};
      cfg[String(a.id)] = { ...existing, baseUrl };
    });
    saveAgentConfig(cfg);
    showStatus('base URL updated');
  });

  // Per-agent key save on blur
  agentKeysHost.querySelectorAll('.config-agent-row').forEach(row => {
    const id = row.dataset.agentId;
    const input = row.querySelector('.config-agent-key');
    input.addEventListener('change', () => {
      const cfg = loadAgentConfig();
      const existing = cfg[String(id)] || {};
      cfg[String(id)] = { ...existing, apiKey: input.value.trim() };
      saveAgentConfig(cfg);
      showStatus(AGENT_DEFS[id].name + ' key saved');
      if (typeof updateApiKeyNotice === 'function') updateApiKeyNotice();
    });
  });
}

// escapeHtml is in app.js (shared)

setupConfigPanel();

// ── SCENARIO INPUT PANEL ──────────────────────────────────────────────
const SCENARIO_EXAMPLES = [
  "Bijan Robinson questionable with knee injury before my playoff game",
  "Should I trade Ja'Marr Chase for two mid-tier RBs in dynasty?",
  "My opponent has Josh Allen and Stefon Diggs stack this week",
  "Breakout WR candidates on the waiver wire for dynasty stash",
  "Is it worth rostering a backup QB in a 12-team league?",
  "Evaluating 2025 rookie draft class — who's the 1.01?",
];

function setupScenarioPanel() {
  const input = document.getElementById('scenarioInput');
  const chipsHost = document.getElementById('scenarioChips');
  const runAllBtn = document.getElementById('scenarioRunAll');
  const agentBtnsHost = document.getElementById('scenarioAgentBtns');
  const statusEl = document.getElementById('scenarioStatus');
  if (!input || !runAllBtn) return;

  // Build example chips
  if (chipsHost) {
    chipsHost.innerHTML = SCENARIO_EXAMPLES.map((ex, i) => {
      const short = ex.length > 48 ? ex.slice(0, 45) + '...' : ex;
      return `<button class="scenario-chip" data-example="${i}">${escapeHtml(short)}</button>`;
    }).join('');

    chipsHost.addEventListener('click', e => {
      const chip = e.target.closest('.scenario-chip');
      if (!chip) return;
      const idx = parseInt(chip.dataset.example);
      if (SCENARIO_EXAMPLES[idx]) {
        input.value = SCENARIO_EXAMPLES[idx];
        input.focus();
      }
    });
  }

  // Build per-agent run buttons
  if (agentBtnsHost) {
    agentBtnsHost.innerHTML = AGENT_DEFS.map(a =>
      `<button class="scenario-agent-btn" data-agent-id="${a.id}">
        <span class="scenario-agent-dot" style="background:${a.color}"></span>
        ${escapeHtml(a.name)}
      </button>`
    ).join('');

    agentBtnsHost.addEventListener('click', e => {
      const btn = e.target.closest('.scenario-agent-btn');
      if (!btn || btn.disabled) return;
      const id = parseInt(btn.dataset.agentId);
      const scenario = input.value.trim();
      if (!scenario) {
        setScenarioStatus('write a scenario first', 'error');
        return;
      }
      runSingleAgent(id, scenario);
    });
  }

  // Run All Agents button
  runAllBtn.addEventListener('click', () => {
    const scenario = input.value.trim();
    if (!scenario) {
      setScenarioStatus('write a scenario first', 'error');
      return;
    }
    runAllAgents(scenario);
  });

  // Render context badges
  renderContextBadges();

  // Check API key status and show/hide notice
  updateApiKeyNotice();

  // Check for prefilled scenario from Bureau of Intelligence bridge
  try {
    var prefilled = localStorage.getItem('razzle_prefill_scenario');
    if (prefilled && input) {
      input.value = prefilled;
      localStorage.removeItem('razzle_prefill_scenario');
      input.focus();
      setScenarioStatus('scenario pre-loaded from League Intel', '');
    }
  } catch (e) { /* ignore */ }
}

function updateApiKeyNotice() {
  var notice = document.getElementById('apiKeyNotice');
  var runBtn = document.getElementById('scenarioRunAll');
  if (!notice) return;
  var hasKey = AGENT_DEFS.some(function(_, i) { return getAgentSettings(i).apiKey; });
  var elite = isEliteUser();
  var canRun = hasKey || elite;
  notice.style.display = canRun ? 'none' : 'block';
  if (runBtn) {
    runBtn.disabled = !canRun;
    runBtn.title = canRun ? '' : 'Set an API key in the config panel first';
  }
}

function renderContextBadges() {
  var host = document.getElementById('contextBadges');
  if (!host) return;

  var labCtx = getLabContext();
  var leagueCtx = getLeagueContext();

  var badges = [];

  if (labCtx && labCtx.players && labCtx.players.length) {
    badges.push(
      '<span class="context-badge active">' +
        '<span class="context-badge-dot"></span>' +
        'Lab: ' + labCtx.players.length + ' player' + (labCtx.players.length > 1 ? 's' : '') + ' selected' +
      '</span>'
    );
  } else {
    badges.push(
      '<span class="context-badge inactive">' +
        '<span class="context-badge-dot"></span>' +
        'Lab: no players selected' +
        ' <a href="/lab.html" class="context-badge-link">open Lab</a>' +
      '</span>'
    );
  }

  var pro = isProUser();
  var hasLeague = hasLeagueData();

  if (leagueCtx && leagueCtx.username) {
    var detail = leagueCtx.username;
    if (leagueCtx.leagues && leagueCtx.leagues.length) {
      detail += ' (' + leagueCtx.leagues.length + ' league' + (leagueCtx.leagues.length > 1 ? 's' : '') + ')';
    }
    if (hasLeague && !pro) {
      // Sleeper connected but not Pro — locked state
      badges.push(
        '<span class="context-badge locked">' +
          '<span class="context-badge-dot"></span>' +
          'Sleeper: ' + escapeHtml(detail) + ' \u2014 locked' +
        '</span>'
      );
    } else {
      badges.push(
        '<span class="context-badge active">' +
          '<span class="context-badge-dot"></span>' +
          'Sleeper: ' + escapeHtml(detail) +
        '</span>'
      );
    }
  } else {
    badges.push(
      '<span class="context-badge inactive">' +
        '<span class="context-badge-dot"></span>' +
        'Sleeper: not connected' +
        ' <a href="/league-intel.html" class="context-badge-link">connect</a>' +
      '</span>'
    );
  }

  // Mode badge — detect trial state for annotation
  var leagueMode = isLeagueContextMode();
  var _trialUser = null;
  try { _trialUser = JSON.parse(localStorage.getItem("razzle_user") || "null"); } catch(e) {}
  var _isTrial = _trialUser && _trialUser.trial_active && _trialUser.plan_source === "trial";

  if (leagueMode) {
    var _modeLabel = _isTrial ? 'League Context \u2014 Trial' : 'League Context \u2014 Pro';
    badges.unshift(
      '<span class="context-badge active" style="border-color:var(--orange); background:var(--orange-light); color:var(--orange);">' +
        '<span class="context-badge-dot" style="background:var(--orange);"></span>' +
        _modeLabel +
      '</span>'
    );
  } else if (hasLeague && !pro) {
    // Has data but not Pro — locked
    badges.unshift(
      '<span class="context-badge locked" style="border-color:var(--orange);">' +
        '<span class="context-badge-dot" style="background:var(--orange); opacity:0.4;"></span>' +
        'League Context \u2014 Pro Only \uD83D\uDD12' +
      '</span>'
    );
  } else {
    badges.unshift(
      '<span class="context-badge inactive">' +
        '<span class="context-badge-dot"></span>' +
        'Generic Mode' +
      '</span>'
    );
  }

  host.innerHTML = badges.join('');

  // Show/hide pro upsell based on league context + auth
  var upsellZone = document.getElementById('proUpsellZone');
  if (upsellZone) {
    var user = null;
    try { user = JSON.parse(localStorage.getItem("razzle_user")); } catch(e) {}
    var isPaid = user && (user.plan === "pro" || user.plan === "elite");
    // Hide upsell if in league mode OR paid user
    upsellZone.style.display = (leagueMode || isPaid) ? 'none' : 'block';
    // Update CTA based on auth state
    var btn = document.getElementById('proUpsellBtn');
    var hint = document.getElementById('proUpsellHint');
    if (btn && hint) {
      if (!user) {
        btn.textContent = 'Start Free 7-Day Trial';
        btn.href = '#';
        btn.onclick = function(e) { e.preventDefault(); if (typeof openAuthModal === 'function') openAuthModal(); };
        hint.textContent = 'no credit card required — full Pro access for 7 days';
      } else if (!user.sleeper_username) {
        btn.textContent = 'Connect Sleeper to Unlock';
        btn.href = '/league-intel.html';
        btn.onclick = null;
        hint.textContent = 'connect your leagues for full league context';
      } else {
        btn.textContent = 'Upgrade to Pro — from $6.67/mo';
        btn.href = '/pricing.html';
        btn.onclick = null;
        hint.textContent = 'full league context, agent memory, personalized briefings';
      }
    }
  }
}

function setScenarioStatus(msg, type) {
  const el = document.getElementById('scenarioStatus');
  if (!el) return;
  el.textContent = msg;
  el.className = 'scenario-status' + (type ? ' ' + type : '');
}

function setScenarioButtonsDisabled(disabled) {
  const runAll = document.getElementById('scenarioRunAll');
  if (runAll) runAll.disabled = disabled;
  const btns = document.querySelectorAll('.scenario-agent-btn');
  btns.forEach(b => { b.disabled = disabled; });
}

// ── PER-AGENT STATUS TRACKER ──────────────────────────────────────────
function initAgentStatusTracker(agentIds) {
  const tracker = document.getElementById('agentStatusTracker');
  if (!tracker) return;
  tracker.style.display = 'flex';
  tracker.innerHTML = agentIds.map(function(id) {
    var a = AGENT_DEFS[id];
    return '<div class="agent-status-chip" data-tracker-id="' + id + '">' +
      '<span class="status-icon" style="color:' + a.color + '">●</span>' +
      '<span>' + escapeHtml(a.name) + '</span>' +
      '</div>';
  }).join('');
}

function setAgentStatus(agentId, status) {
  var chip = document.querySelector('.agent-status-chip[data-tracker-id="' + agentId + '"]');
  if (!chip) return;
  chip.className = 'agent-status-chip ' + status;
  var icon = chip.querySelector('.status-icon');
  if (!icon) return;
  var a = AGENT_DEFS[agentId];
  if (status === 'running') {
    icon.textContent = '◎';
    icon.style.color = '';
  } else if (status === 'done') {
    icon.textContent = '✓';
    icon.style.color = '';
  } else if (status === 'error') {
    icon.textContent = '✗';
    icon.style.color = '';
  } else {
    icon.textContent = '●';
    icon.style.color = a ? a.color : '';
  }
}

// ── LLM INTEGRATION ──────────────────────────────────────────────────
const LLM_TIMEOUT_MS = 20000;
const LLM_TEMPERATURE = 0.3;

const PERSONA_PATHS = {
  0: '/agent-personas/razzle.md',
  1: '/agent-personas/medical.md',
  2: '/agent-personas/scout.md',
  3: '/agent-personas/diplomat.md',
  4: '/agent-personas/quant.md',
  5: '/agent-personas/historian.md',
};

const personaCache = new Map();

async function loadPersona(agentId) {
  if (personaCache.has(agentId)) return personaCache.get(agentId);
  const path = PERSONA_PATHS[agentId];
  if (!path) throw new Error('Unknown agent ID: ' + agentId);
  const resp = await fetch(path, { cache: 'no-store' });
  if (!resp.ok) throw new Error('Could not load persona for agent ' + agentId);
  const text = await resp.text();
  personaCache.set(agentId, text);
  return text;
}

function isProUser() {
  try {
    var user = JSON.parse(localStorage.getItem("razzle_user"));
    var p = user && user.plan;
    return p === "pro" || p === "elite" || p === "pro_lifetime" || p === "elite_lifetime";
  } catch (e) { return false; }
}

function isEliteUser() {
  try {
    var user = JSON.parse(localStorage.getItem("razzle_user"));
    var p = user && user.plan;
    return p === "elite" || p === "elite_lifetime";
  } catch (e) { return false; }
}

function hasLeagueData() {
  var leagueCtx = getLeagueContext();
  return leagueCtx && leagueCtx.roster && leagueCtx.roster.length > 0;
}

function isLeagueContextMode() {
  // League context requires Pro subscription
  return hasLeagueData() && isProUser();
}

function buildRules(agentDef) {
  var leagueMode = isLeagueContextMode();
  const rules = [
    'Hard rules:',
    '- Return structured analysis using your mandatory output sections.',
    '- Be specific, decisive, and action-oriented for a fantasy manager.',
    '- No disclaimers or excessive hedging.',
    '- Keep each section concise — 2-4 sentences max.',
    '- Use real-world knowledge of NFL players and injuries.',
  ];
  if (leagueMode) {
    rules.push('- LEAGUE CONTEXT MODE: You have the manager\'s actual roster, league settings, and rival data.');
    rules.push('- Reference specific roster players, rival managers, and league format in your analysis.');
    rules.push('- Tailor advice to their specific league situation, not generic advice.');
  } else {
    rules.push('- GENERIC MODE: No league context available. Give general fantasy football analysis.');
    rules.push('- Use broad rankings and general strategy, not league-specific advice.');
    rules.push('- If format is unknown, default to 0.5 PPR redraft analysis. Adapt if the user specifies a format in their question.');
  }
  if (agentDef.id === 0) {
    rules.push('- Lead with the Urgency Tier.');
    rules.push('- Synthesize specialist insights, do not just repeat them.');
    rules.push('- End with one clear recommendation.');
  }
  return rules.join('\n');
}

function getLabContext() {
  try {
    const raw = localStorage.getItem('razzle_lab_context');
    if (!raw) return null;
    const ctx = JSON.parse(raw);
    // Only use if less than 24h old
    if (ctx.updatedAt && Date.now() - ctx.updatedAt > 86400000) return null;
    if (!ctx.players || !ctx.players.length) return null;
    return ctx;
  } catch (e) { return null; }
}

function formatLabContext(ctx) {
  var lines = ['', '--- WHAT THE LAB KNOWS ---'];
  lines.push('Season: ' + (ctx.season || 'latest') + ' | View: ' + (ctx.preset || 'Custom'));
  if (ctx.players && ctx.players.length) {
    lines.push('Selected players (' + ctx.players.length + '):');
    ctx.players.forEach(function(p) {
      var statLine = '';
      if (p.stats) {
        var statParts = [];
        if (p.stats.fantasy_points_ppr != null) statParts.push('PPR: ' + p.stats.fantasy_points_ppr);
        if (p.stats.ppg != null) statParts.push('PPG: ' + p.stats.ppg);
        if (p.stats.games != null) statParts.push('G: ' + p.stats.games);
        if (p.stats.receptions != null) statParts.push('REC: ' + p.stats.receptions);
        if (p.stats.targets != null) statParts.push('TGT: ' + p.stats.targets);
        if (p.stats.receiving_yards != null) statParts.push('RecYds: ' + p.stats.receiving_yards);
        if (p.stats.rushing_yards != null) statParts.push('RuYds: ' + p.stats.rushing_yards);
        if (p.stats.passing_yards != null) statParts.push('PaYds: ' + p.stats.passing_yards);
        if (p.stats.target_share != null) statParts.push('TgtShr: ' + (p.stats.target_share * 100).toFixed(1) + '%');
        if (p.stats.wopr != null) statParts.push('WOPR: ' + p.stats.wopr.toFixed(3));
        // Include formula scores
        Object.keys(p.stats).forEach(function(k) {
          if (k.startsWith('formula_')) statParts.push(k.replace('formula_', '') + ': ' + p.stats[k]);
        });
        statLine = ' | ' + statParts.join(', ');
      }
      lines.push('  - ' + p.full_name + ' (' + p.position + ', ' + (p.team || '?') + ')' + statLine);
    });
  }
  if (ctx.filters && ctx.filters.length) {
    lines.push('Active filters: ' + ctx.filters.map(function(f) {
      return f.stat + ' ' + f.op + ' ' + f.value;
    }).join('; '));
  }
  if (ctx.formulas && ctx.formulas.length) {
    lines.push('Custom formulas: ' + ctx.formulas.map(function(f) { return f.name; }).join(', '));
  }
  lines.push('--- END LAB CONTEXT ---');
  return lines.join('\n');
}

function getLeagueContext() {
  try {
    var user = localStorage.getItem('razzle_sleeper_user');
    var leagueData = localStorage.getItem('razzle_league_context');
    if (!user) return null;
    var ctx = { username: user };
    if (leagueData) {
      var parsed = JSON.parse(leagueData);
      // Only use if less than 7 days old
      if (parsed.updatedAt && Date.now() - parsed.updatedAt > 604800000) return ctx;
      ctx.leagues = parsed.leagues;
      ctx.roster = parsed.roster;
      ctx.record = parsed.record;
      ctx.rivals = parsed.rivals;
      // Enhanced multi-season data (from Bureau of Intelligence)
      ctx.managerProfiles = parsed.managerProfiles || null;
      ctx.historyDepth = parsed.historyDepth || 1;
      ctx.historySeasons = parsed.historySeasons || [];
    }
    return ctx;
  } catch (e) { return null; }
}

function detectLeagueFormat(ctx) {
  // Extract the primary league's format for agent instructions
  var lg = null;
  if (ctx.leagues && ctx.leagues.length) {
    // Use the currently selected league if available, otherwise first
    var selectedId = ctx.selectedLeagueId;
    if (selectedId) {
      lg = ctx.leagues.find(function(l) { return l.id === selectedId; });
    }
    if (!lg) lg = ctx.leagues[0];
  }
  if (!lg) {
    return { type: 'Redraft', scoring: 'Half PPR', superflex: false, tePremium: false,
      bestBall: false, waiverType: 'Standard', taxiSlots: 0, draftRounds: null,
      tradeDeadline: null, previousLeagueId: null, teams: '12', label: 'Standard 0.5 PPR Redraft (default — no league detected)' };
  }
  var label = lg.teams + '-team ' + lg.scoring + ' ' + lg.type;
  if (lg.bestBall) label += ' (Best Ball)';
  if (lg.waiverType === 'FAAB') label += ', FAAB waivers';
  if (lg.taxiSlots > 0) label += ', ' + lg.taxiSlots + ' taxi slots';
  return {
    type: lg.type || 'Redraft',
    scoring: lg.scoring || 'Half PPR',
    superflex: lg.superflex || false,
    tePremium: lg.tePremium || false,
    bestBall: lg.bestBall || false,
    waiverType: lg.waiverType || 'Standard',
    taxiSlots: lg.taxiSlots || 0,
    reserveSlots: lg.reserveSlots || 0,
    draftRounds: lg.draftRounds || null,
    tradeDeadline: lg.tradeDeadline || null,
    previousLeagueId: lg.previousLeagueId || null,
    teams: lg.teams || '12',
    scoringPassTD: lg.scoringPassTD || 4,
    label: label,
  };
}

function buildFormatInstructions(fmt) {
  var lines = [];
  lines.push('');
  lines.push('--- LEAGUE FORMAT (CRITICAL — adapt ALL analysis to this format) ---');
  lines.push('Format: ' + fmt.label);
  lines.push('');

  // Type-specific instructions
  if (fmt.type === 'Dynasty') {
    lines.push('FORMAT RULES — DYNASTY:');
    lines.push('- Time horizon is MULTI-YEAR. Player value includes future seasons, not just this year.');
    lines.push('- Age and trajectory matter enormously. A 23-year-old with upside > 28-year-old producing now.');
    lines.push('- Draft picks have real trade value. Reference pick valuations when relevant.');
    lines.push('- Rebuilding vs contending is a core strategic axis. Determine which mode the user is in.');
    lines.push('- Taxi squad stashing is relevant for rookies.' + (fmt.taxiSlots > 0 ? ' This league has ' + fmt.taxiSlots + ' taxi slots.' : ''));
    lines.push('- Trade deadline pressure differs: contenders buy, rebuilders sell.');
  } else if (fmt.type === 'Keeper') {
    lines.push('FORMAT RULES — KEEPER:');
    lines.push('- Players can be kept at a draft round cost. Keeper VALUE = (projected ADP) - (keeper round cost).');
    lines.push('- Surplus value is king. A WR2 kept at Round 10 can be more valuable than a WR1 kept at Round 1.');
    lines.push('- Factor in keeper cost when evaluating trades — the receiving team loses keeper eligibility.');
    lines.push('- Draft rounds matter: ' + (fmt.draftRounds ? fmt.draftRounds + ' rounds in this league.' : 'check league settings for round count.'));
    lines.push('- Mix of dynasty thinking (some long-term) and redraft thinking (yearly reset on non-keepers).');
  } else if (fmt.bestBall) {
    lines.push('FORMAT RULES — BEST BALL:');
    lines.push('- No lineup setting. Optimal lineup is auto-calculated each week.');
    lines.push('- CEILING MATTERS MORE THAN FLOOR. Boom/bust players are more valuable than consistent ones.');
    lines.push('- Weekly variance is a feature, not a bug. High-upside players win best ball leagues.');
    lines.push('- QB-WR stacking correlation matters. Recommend stacks with correlated upside.');
    lines.push('- Roster construction should emphasize depth and weekly boom potential.');
  } else {
    // Redraft
    lines.push('FORMAT RULES — REDRAFT:');
    lines.push('- Time horizon is THIS SEASON ONLY. Next year does not matter.');
    lines.push('- Age is irrelevant. A 31-year-old producing now is as valuable as a 23-year-old.');
    lines.push('- "Buy low / sell high" means for THIS season\'s playoff push, not long-term asset management.');
    lines.push('- Playoff schedule (Weeks 15-17) matters enormously for trade targets.');
    lines.push('- Streaming (QB, TE, DST) is a core strategy. Identify streamable positions.');
    lines.push('- Bench depth matters less as season progresses — consolidate for studs.');
  }

  // Scoring-specific
  if (fmt.superflex) {
    lines.push('');
    lines.push('SCORING MODIFIER — SUPERFLEX:');
    lines.push('- QBs are SIGNIFICANTLY more valuable. A top-5 QB can be the most valuable asset in fantasy.');
    lines.push('- Rostering 3 QBs is a viable strategy. QB scarcity drives all valuations upward.');
    lines.push('- Adjust ALL trade values for QB premium. A QB1 is worth a top-tier RB or WR package.');
  }

  if (fmt.tePremium) {
    lines.push('');
    lines.push('SCORING MODIFIER — TE PREMIUM:');
    lines.push('- Top TEs are significantly more valuable than standard scoring. TE scarcity is amplified.');
    lines.push('- A top-3 TE can be a league-winning advantage. Factor TE premium into all valuations.');
  }

  if (fmt.scoring && fmt.scoring.indexOf('PPR') >= 0) {
    lines.push('');
    if (fmt.scoring.indexOf('Half') >= 0) {
      lines.push('SCORING: Half PPR (0.5 points per reception) — balanced between volume and efficiency.');
    } else {
      lines.push('SCORING: Full PPR (1.0 points per reception) — reception volume is king. Target share and catch rate matter more.');
    }
  } else if (fmt.scoring && fmt.scoring.indexOf('Standard') >= 0) {
    lines.push('');
    lines.push('SCORING: Standard (no PPR) — touchdowns and yardage dominate. RBs more valuable, especially goal-line backs.');
  }

  if (fmt.scoringPassTD === 6) {
    lines.push('SCORING: 6-point passing TDs — QBs are significantly more valuable than in 4-point leagues.');
  }

  // Waiver type
  if (fmt.waiverType === 'FAAB') {
    lines.push('');
    lines.push('WAIVERS: FAAB (Free Agent Acquisition Budget) — budget management is critical. Recommend specific dollar amounts for bids.');
  } else if (fmt.waiverType === 'Rolling') {
    lines.push('');
    lines.push('WAIVERS: Rolling priority — waiver priority is a scarce resource. Only recommend burning priority on impactful adds.');
  }

  lines.push('--- END FORMAT RULES ---');
  return lines.join('\n');
}

function formatLeagueContext(ctx) {
  var lines = ['', '--- WHAT LEAGUE INTEL KNOWS ---'];
  lines.push('Sleeper user: ' + ctx.username);
  if (ctx.historyDepth > 1) {
    lines.push('Intel depth: ' + ctx.historyDepth + ' seasons of data (' + (ctx.historySeasons || []).join(', ') + ')');
  }
  if (ctx.leagues && ctx.leagues.length) {
    ctx.leagues.forEach(function(lg) {
      var extras = [];
      if (lg.superflex) extras.push('SF');
      if (lg.tePremium) extras.push('TEP');
      if (lg.bestBall) extras.push('BestBall');
      if (lg.waiverType === 'FAAB') extras.push('FAAB');
      if (lg.taxiSlots > 0) extras.push(lg.taxiSlots + ' taxi');
      var extraStr = extras.length ? ' [' + extras.join(', ') + ']' : '';
      lines.push('League: ' + lg.name + ' (' + lg.type + ', ' + lg.scoring + ', ' + lg.teams + '-team, ' + lg.season + ')' + extraStr);
    });
  }
  if (ctx.record) {
    lines.push('Your record: ' + ctx.record.wins + '-' + ctx.record.losses + ' | Points: ' + ctx.record.fpts);
  }
  if (ctx.roster && ctx.roster.length) {
    lines.push('Your roster (' + ctx.roster.length + ' players):');
    ctx.roster.forEach(function(p) {
      lines.push('  - ' + p.name + ' (' + p.pos + ', ' + (p.team || '?') + ')');
    });
  }
  if (ctx.rivals && ctx.rivals.length) {
    lines.push('Rival managers:');
    ctx.rivals.forEach(function(r) {
      lines.push('  - ' + r.manager + ' (' + r.wins + '-' + r.losses + '): ' + r.topPlayers.slice(0, 4).join(', '));
    });
  }

  // Enhanced manager behavioral profiles (multi-season)
  if (ctx.managerProfiles && ctx.managerProfiles.length) {
    lines.push('');
    lines.push('--- MANAGER BEHAVIORAL PROFILES ---');
    ctx.managerProfiles.forEach(function(mp) {
      var header = mp.name + ' (' + mp.record + ')';
      if (mp.seasonsTracked > 1) {
        header += ' [' + mp.seasonsTracked + ' seasons tracked, all-time: ' + (mp.allTimeRecord || mp.record) + ']';
      }
      lines.push(header);
      lines.push('  Behavioral summary: ' + mp.summary);
      lines.push('  Stats: ' + mp.trades + ' trades, ' + mp.waivers + ' waivers, $' + mp.faab + ' FAAB spent');

      // Per-season breakdown (paid multi-season)
      if (mp.seasonsTracked > 1 && mp.movesBySeason) {
        var seasonBreakdown = [];
        var sKeys = Object.keys(mp.movesBySeason).sort();
        for (var sk = 0; sk < sKeys.length; sk++) {
          var sy = sKeys[sk];
          var detail = sy + ': ' + mp.movesBySeason[sy] + ' moves';
          if (mp.tradesBySeason && mp.tradesBySeason[sy]) detail += ', ' + mp.tradesBySeason[sy] + ' trades';
          if (mp.faabBySeason && mp.faabBySeason[sy]) detail += ', $' + mp.faabBySeason[sy] + ' FAAB';
          if (mp.recordBySeason && mp.recordBySeason[sy]) {
            detail += ' (' + mp.recordBySeason[sy].wins + '-' + mp.recordBySeason[sy].losses + ')';
          }
          seasonBreakdown.push(detail);
        }
        lines.push('  Season history: ' + seasonBreakdown.join(' | '));
      }

      // Positional bias
      if (mp.posAdds) {
        var posList = [];
        for (var pos in mp.posAdds) {
          if (pos !== '?') posList.push(pos + ':' + mp.posAdds[pos]);
        }
        if (posList.length) lines.push('  Position adds: ' + posList.join(', '));
      }

      // Panic indicator
      if (mp.panicWeeks > 0) {
        lines.push('  Panic indicator: ' + mp.panicWeeks + ' burst weeks (3+ moves in single week)');
      }
    });
    lines.push('--- END MANAGER PROFILES ---');
  }

  // Recent league activity feed (from Bureau of Intelligence)
  if (ctx.recentActivity && ctx.recentActivity.length) {
    lines.push('');
    lines.push('--- RECENT LEAGUE ACTIVITY ---');
    ctx.recentActivity.forEach(function(txn) {
      var mgrs = (txn.managers || []).join(' & ');
      var adds = (txn.adds || []).join(', ');
      var drops = (txn.drops || []).join(', ');
      var line = txn.type.toUpperCase() + ': ' + mgrs;
      if (adds) line += ' added ' + adds;
      if (drops) line += ' | dropped ' + drops;
      if (txn.faab > 0) line += ' ($' + txn.faab + ' FAAB)';
      if (txn.time) {
        var ago = Math.floor((Date.now() - txn.time) / 86400000);
        if (ago <= 0) line += ' (today)';
        else if (ago === 1) line += ' (yesterday)';
        else line += ' (' + ago + ' days ago)';
      }
      lines.push(line);
    });
    lines.push('--- END RECENT ACTIVITY ---');
  }

  lines.push('--- END LEAGUE CONTEXT ---');
  return lines.join('\n');
}

function buildUserMessage(scenario, agentDef, peerInsights) {
  const parts = [buildRules(agentDef)];

  // Inject format-specific instructions (always — uses league data if available, defaults otherwise)
  var leagueCtx = getLeagueContext();
  var fmt = detectLeagueFormat(leagueCtx || {});
  parts.push(buildFormatInstructions(fmt));

  parts.push('', 'Scenario:', scenario);

  // Inject Lab context if available
  var labCtx = getLabContext();
  if (labCtx) {
    parts.push(formatLabContext(labCtx));
  }

  // Inject League context only for Pro users
  if (isProUser()) {
    if (leagueCtx) {
      parts.push(formatLeagueContext(leagueCtx));
    }
  }

  // Inject Situation Room memory (past briefings) if available
  var memoryEntries = getRelevantMemory(scenario, 3);
  if (memoryEntries.length) {
    parts.push(formatMemoryContext(memoryEntries));
  }

  if (Array.isArray(peerInsights) && peerInsights.length) {
    parts.push('', 'Peer agent insights to synthesize:');
    peerInsights.forEach(function(p, i) {
      parts.push((i + 1) + '. ' + p.name + ': ' + p.text);
    });
  }
  return parts.join('\n');
}

async function callLLM(apiKey, model, baseUrl, systemPrompt, userMessage) {
  const controller = new AbortController();
  const timer = setTimeout(function() { controller.abort(); }, LLM_TIMEOUT_MS);

  try {
    const resp = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        'HTTP-Referer': 'https://razzle.lol',
        'X-Title': 'Razzle Situation Room',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: LLM_TEMPERATURE,
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(function() { return ''; });
      var msg = resp.status === 401 ? 'invalid API key. check Config.' :
               resp.status === 429 ? 'rate limited by provider. wait a moment.' :
               resp.status >= 500 ? 'LLM provider is down. try again shortly.' :
               'API error ' + resp.status + (detail ? ': ' + detail.slice(0, 200) : '');
      throw new Error(msg);
    }

    const data = await resp.json();
    const content = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content : null;
    if (!content) throw new Error('No content in model response');
    return content.trim();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('agent took too long to respond. try again or check your API key.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Store last results per agent for Razzle synthesis
const agentResults = new Map();

async function callServerLLM(systemPrompt, userMessage) {
  /** Call the server-side LLM proxy for Elite users (AI-included mode). */
  var token = localStorage.getItem('razzle_token');
  if (!token) throw new Error('Sign in required for AI-included mode');

  var resp = await fetch('/api/llm/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: LLM_TEMPERATURE,
    }),
  });

  if (!resp.ok) {
    var detail = await resp.json().catch(function() { return {}; });
    throw new Error(detail.error || 'Server LLM error ' + resp.status);
  }

  var data = await resp.json();
  var content = data && data.choices && data.choices[0] && data.choices[0].message
    ? data.choices[0].message.content : null;
  if (!content) throw new Error('No content in model response');
  return content.trim();
}

async function executeAgent(agentId, scenario, peerInsights) {
  const agentDef = AGENT_DEFS[agentId];
  if (!agentDef) throw new Error('Unknown agent');

  const settings = getAgentSettings(agentId);
  const elite = isEliteUser();
  const hasBYOK = !!settings.apiKey;

  // Elite users can use server-side proxy OR their own key
  if (!hasBYOK && !elite) throw new Error('No API key configured');

  const persona = await loadPersona(agentId);
  const userMessage = buildUserMessage(scenario, agentDef, peerInsights);

  var result;
  if (hasBYOK) {
    // BYOK mode (Pro or Elite with custom key)
    result = await callLLM(settings.apiKey, settings.model, settings.baseUrl, persona, userMessage);
  } else {
    // Server-side proxy (Elite AI-included mode)
    result = await callServerLLM(persona, userMessage);
  }

  agentResults.set(agentId, { name: agentDef.name, text: result, at: Date.now() });
  return result;
}

async function runSingleAgent(agentId, scenario) {
  const agent = AGENT_DEFS[agentId];
  if (!agent) return;

  // Check rate limit
  var limitMsg = getQueryLimitMessage();
  if (limitMsg) {
    setScenarioStatus(limitMsg, 'error');
    return;
  }

  // Server-side tracking
  var serverQuota = await trackQueryServerSide();
  if (serverQuota && !serverQuota.allowed) {
    var serverMsg = serverQuota.error || 'Daily query limit reached.';
    if (serverQuota.plan === 'free') serverMsg += ' Upgrade to Pro for 20/day.';
    else if (serverQuota.plan === 'pro') serverMsg += ' Upgrade to Elite for unlimited.';
    setScenarioStatus(serverMsg, 'error');
    updateQueryLimitBadge();
    return;
  }

  const settings = getAgentSettings(agentId);
  if (!settings.apiKey && !isEliteUser()) {
    setScenarioStatus('set an API key in Config first', 'error');
    return;
  }

  // Dismiss first-run demo if showing
  window.dispatchEvent(new CustomEvent('razzle:agents-starting'));

  initAgentStatusTracker([agentId]);
  setAgentStatus(agentId, 'running');
  setScenarioStatus('running ' + agent.name + '...', 'running');
  setScenarioButtonsDisabled(true);

  const canvasAgent = agents[agentId];
  if (canvasAgent) {
    canvasAgent.workBubble = '📡';
    canvasAgent.bubbleTimer = 25000;
  }

  try {
    var result = await executeAgent(agentId, scenario);
    setAgentStatus(agentId, 'done');
    setScenarioStatus(agent.name + ' done', 'done');

    window.dispatchEvent(new CustomEvent('razzle:agent-result', {
      detail: { agentId, result, scenario }
    }));
  } catch (err) {
    setAgentStatus(agentId, 'error');
    setScenarioStatus(agent.name + ': ' + err.message, 'error');
  } finally {
    setScenarioButtonsDisabled(false);
    if (canvasAgent) { canvasAgent.workBubble = ''; }
  }
}

// ── AI QUERY RATE LIMITING (server-side + localStorage cache) ────────
function getDailyQueryLimit() {
  if (isEliteUser()) return Infinity;
  if (isProUser()) return 20;
  return 5; // free tier
}

function getTodayQueryCount() {
  try {
    var data = JSON.parse(localStorage.getItem('razzle_query_count') || '{}');
    var today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch (e) { return 0; }
}

function _setLocalQueryCount(count) {
  var today = new Date().toISOString().slice(0, 10);
  localStorage.setItem('razzle_query_count', JSON.stringify({ date: today, count: count }));
}

function incrementQueryCount() {
  var newCount = getTodayQueryCount() + 1;
  _setLocalQueryCount(newCount);
  return newCount;
}

/**
 * Server-side query tracking. Call BEFORE making LLM request.
 * Returns { allowed, used, limit, remaining, plan } or null on error.
 */
async function trackQueryServerSide() {
  try {
    var headers = { 'Content-Type': 'application/json' };
    var token = localStorage.getItem('razzle_token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    var base = typeof API_BASE !== 'undefined' ? API_BASE : '';
    var resp = await fetch(base + '/api/agents/track', { method: 'POST', headers: headers });
    var data = await resp.json();
    if (resp.status === 429) {
      // Sync local cache with server truth
      _setLocalQueryCount(data.used || data.limit || 999);
      return { allowed: false, error: data.error, used: data.used, limit: data.limit, remaining: 0, plan: data.plan };
    }
    if (data.used != null) {
      // Sync local cache with server-reported count
      _setLocalQueryCount(data.used);
    }
    return data;
  } catch (e) {
    // Server unreachable — fall back to local tracking
    return null;
  }
}

function getQueryLimitMessage() {
  var limit = getDailyQueryLimit();
  var used = getTodayQueryCount();
  var remaining = Math.max(0, limit - used);
  if (limit === Infinity) return null;
  if (remaining <= 0) {
    if (!isProUser()) return 'Daily limit reached (5 free queries). Upgrade to Pro for 20/day.';
    return 'Daily limit reached (20 Pro queries). Upgrade to Elite for unlimited.';
  }
  return null;
}

function updateQueryLimitBadge() {
  var el = document.getElementById('queryLimitBadge');
  if (!el) return;
  var limit = getDailyQueryLimit();
  var used = getTodayQueryCount();
  if (limit === Infinity) {
    el.textContent = 'unlimited queries (Elite)';
  } else {
    var remaining = Math.max(0, limit - used);
    var tier = isProUser() ? 'Pro' : 'Free';
    el.textContent = remaining + '/' + limit + ' queries remaining today (' + tier + ')';
    if (remaining <= 1) el.style.color = 'var(--orange)';
    else if (remaining <= 0) el.style.color = '#d44040';
    else el.style.color = 'var(--ink-light)';
  }
}

// Sync quota from server on load (updates local cache with server truth)
function syncQuotaFromServer() {
  try {
    var headers = {};
    var token = localStorage.getItem('razzle_token');
    if (token) headers['Authorization'] = 'Bearer ' + token;
    var base = typeof API_BASE !== 'undefined' ? API_BASE : '';
    fetch(base + '/api/agents/quota', { headers: headers })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.used != null) {
          _setLocalQueryCount(data.used);
          updateQueryLimitBadge();
        }
      }).catch(function() {});
  } catch (e) {}
}

// Initialize badge and sync quota on load
setTimeout(function() {
  updateQueryLimitBadge();
  syncQuotaFromServer();
}, 100);

async function runAllAgents(scenario) {
  // Check rate limit (local cache first for instant UX)
  var limitMsg = getQueryLimitMessage();
  if (limitMsg) {
    setScenarioStatus(limitMsg, 'error');
    return;
  }

  // Server-side tracking (authoritative — prevents localStorage bypass)
  var serverQuota = await trackQueryServerSide();
  if (serverQuota && !serverQuota.allowed) {
    var serverMsg = serverQuota.error || 'Daily query limit reached.';
    if (serverQuota.plan === 'free') serverMsg += ' Upgrade to Pro for 20/day.';
    else if (serverQuota.plan === 'pro') serverMsg += ' Upgrade to Elite for unlimited.';
    setScenarioStatus(serverMsg, 'error');
    updateQueryLimitBadge();
    return;
  }

  const hasKey = AGENT_DEFS.some(function(_, i) { return getAgentSettings(i).apiKey; });
  const elite = isEliteUser();
  if (!hasKey && !elite) {
    setScenarioStatus('set an API key in Config first', 'error');
    return;
  }

  // Dismiss first-run demo if showing
  window.dispatchEvent(new CustomEvent('razzle:agents-starting'));

  // Initialize per-agent status tracker (specialists first, then Razzle)
  initAgentStatusTracker([1, 2, 3, 4, 5, 0]);

  setScenarioStatus('pulling film on all agents...', 'running');
  setScenarioButtonsDisabled(true);

  agents.forEach(function(a) {
    a.workBubble = '📡';
    a.bubbleTimer = 30000;
  });

  // Run 5 specialists (IDs 1-5) in parallel
  var specialistIds = [1, 2, 3, 4, 5];
  var results = {};
  var errors = {};

  var specialistPromises = specialistIds.map(function(id) {
    return (async function() {
      var s = getAgentSettings(id);
      if (!s.apiKey && !elite) {
        errors[id] = 'no API key';
        setAgentStatus(id, 'error');
        return;
      }
      setAgentStatus(id, 'running');
      try {
        results[id] = await executeAgent(id, scenario);
        setAgentStatus(id, 'done');
        var ca = agents[id];
        if (ca) { ca.workBubble = '✅'; ca.bubbleTimer = 3000; }
      } catch (err) {
        errors[id] = err.message;
        setAgentStatus(id, 'error');
        var ca = agents[id];
        if (ca) { ca.workBubble = '❌'; ca.bubbleTimer = 3000; }
      }
    })();
  });

  await Promise.all(specialistPromises);

  var successCount = Object.keys(results).length;
  var errorCount = Object.keys(errors).length;

  if (successCount === 0) {
    setScenarioStatus('the room hit a wall. check your API key and try again.', 'error');
    setScenarioButtonsDisabled(false);
    agents.forEach(function(a) { a.workBubble = ''; });
    window.dispatchEvent(new CustomEvent('razzle:all-agents-done', {
      detail: { scenario: scenario, results: results, errors: errors, razzleSynthesis: null }
    }));
    return;
  }

  // Run Razzle (agent 0) with specialist outputs as peer insights
  setScenarioStatus('Razzle is synthesizing...', 'running');
  setAgentStatus(0, 'running');
  var peerInsights = specialistIds
    .filter(function(id) { return results[id]; })
    .map(function(id) { return { name: AGENT_DEFS[id].name, text: results[id] }; });

  var razzleSynthesis = null;
  try {
    var razzleSettings = getAgentSettings(0);
    if (razzleSettings.apiKey || elite) {
      razzleSynthesis = await executeAgent(0, scenario, peerInsights);
      setAgentStatus(0, 'done');
      var ca = agents[0];
      if (ca) { ca.workBubble = '✅'; ca.bubbleTimer = 3000; }
    } else {
      errors[0] = 'no API key for Razzle';
      setAgentStatus(0, 'error');
    }
  } catch (err) {
    errors[0] = err.message;
    setAgentStatus(0, 'error');
    var ca = agents[0];
    if (ca) { ca.workBubble = '❌'; ca.bubbleTimer = 3000; }
  }

  // Update rate limit badge (server already tracked the query in trackQueryServerSide)
  if (successCount > 0) {
    updateQueryLimitBadge();
    var limit = getDailyQueryLimit();
    var used = getTodayQueryCount();
    var remaining = limit === Infinity ? '' : ' (' + Math.max(0, limit - used) + ' remaining today)';
    var statusMsg = razzleSynthesis
      ? 'briefing complete — ' + successCount + ' specialists reported' + remaining
      : successCount + ' specialists done' + (errorCount ? ', ' + errorCount + ' failed' : '') + remaining;
  } else {
    var statusMsg = successCount + ' specialists done' + (errorCount ? ', ' + errorCount + ' failed' : '');
  }
  setScenarioStatus(statusMsg, razzleSynthesis ? 'done' : 'error');
  setScenarioButtonsDisabled(false);

  // ── CROSS-AGENT TRIGGERS ──────────────────────────────────────────────
  // Scan specialist outputs for trigger signals and auto-invoke follow-ups
  var followUps = detectCrossAgentTriggers(results, scenario);
  var followUpResults = {};

  if (followUps.length > 0 && (hasKey || elite)) {
    setScenarioStatus('cross-referencing intelligence... (' + followUps.length + ' trigger' + (followUps.length > 1 ? 's' : '') + ')', 'running');

    var followUpPromises = followUps.map(function(trigger) {
      return (async function() {
        var s = getAgentSettings(trigger.targetAgentId);
        if (!s.apiKey && !elite) return;
        try {
          var followUpScenario = trigger.prompt;
          var result = await executeAgent(trigger.targetAgentId, followUpScenario);
          followUpResults[trigger.key] = {
            targetAgentId: trigger.targetAgentId,
            sourceAgentId: trigger.sourceAgentId,
            triggerType: trigger.type,
            triggerLabel: trigger.label,
            result: result
          };
        } catch (err) {
          // Silent fail for follow-ups — they're bonus intelligence
        }
      })();
    });

    await Promise.all(followUpPromises);
  }

  window.dispatchEvent(new CustomEvent('razzle:all-agents-done', {
    detail: {
      scenario: scenario,
      results: results,
      errors: errors,
      razzleSynthesis: razzleSynthesis,
      followUps: followUpResults
    }
  }));
}

// ── CROSS-AGENT TRIGGER DETECTION ───────────────────────────────────────
// Scans specialist outputs for signal patterns that should invoke follow-up agents.
// Returns array of { key, type, label, sourceAgentId, targetAgentId, prompt }

var TRIGGER_PATTERNS = [
  {
    type: 'injury_handcuff',
    label: 'injury detected — evaluating replacements',
    sourceAgent: 1, // Medical
    targetAgent: 2, // Scout
    patterns: [/\b(out|doubtful|questionable|injured|ACL|MCL|concussion|hamstring|ankle|knee|fracture|torn|surgery|IR)\b/i],
    buildPrompt: function(sourceText, originalScenario) {
      return 'FOLLOW-UP from Medical analysis. The Medical analyst flagged an injury in this scenario:\n\n' +
        'Original scenario: ' + originalScenario + '\n\n' +
        'Medical finding: ' + sourceText.slice(0, 500) + '\n\n' +
        'Your task: Evaluate the backup/handcuff options. Who steps into the role? What is their snap share trend? Are there waiver wire alternatives? Rank the replacement options by opportunity quality.';
    }
  },
  {
    type: 'injury_trade',
    label: 'injury detected — identifying trade targets',
    sourceAgent: 1, // Medical
    targetAgent: 3, // Diplomat
    patterns: [/\b(out\s+\d+|missed?\s+\d+|weeks?\s+out|season.ending|IR|surgery|long.term)\b/i],
    buildPrompt: function(sourceText, originalScenario) {
      return 'FOLLOW-UP from Medical analysis. A significant injury was flagged:\n\n' +
        'Original scenario: ' + originalScenario + '\n\n' +
        'Medical finding: ' + sourceText.slice(0, 500) + '\n\n' +
        'Your task: Identify trade targets to fill the gap. Which managers in the league have depth at this position? Who might be willing to trade? Propose specific trade frameworks.';
    }
  },
  {
    type: 'low_odds_rebuild',
    label: 'low championship odds — evaluating rebuild path',
    sourceAgent: 4, // Quant
    targetAgent: 3, // Diplomat
    patterns: [/championship\s+(odds?|probability)\s*[:\s]?\s*(\d{1,2}(\.\d+)?)\s*%/i, /\b(below|under)\s+(15|10|5)\s*%/i, /\b(rebuild|rebuilding|teardown|tanking|sell)\b/i],
    buildPrompt: function(sourceText, originalScenario) {
      return 'FOLLOW-UP from Quant analysis. Championship odds are low or rebuild was recommended:\n\n' +
        'Original scenario: ' + originalScenario + '\n\n' +
        'Quant finding: ' + sourceText.slice(0, 500) + '\n\n' +
        'Your task: Map out the rebuild trade strategy. Who are the sell candidates? Which contenders in the league would overpay? What draft picks should be targeted? Propose a 3-move teardown sequence.';
    }
  },
  {
    type: 'breakout_faab',
    label: 'breakout detected — FAAB bid strategy',
    sourceAgent: 2, // Scout
    targetAgent: 3, // Diplomat
    patterns: [/\b(breakout|emerging|trending up|snap.share.increas|target.share.ris|waiver.wire|free.agent|pick.up|add)\b/i],
    buildPrompt: function(sourceText, originalScenario) {
      return 'FOLLOW-UP from Scout analysis. A breakout or waiver opportunity was identified:\n\n' +
        'Original scenario: ' + originalScenario + '\n\n' +
        'Scout finding: ' + sourceText.slice(0, 500) + '\n\n' +
        'Your task: Recommend a FAAB bid strategy. How much should the GM bid? Who else in the league needs this player? What is the competitive bidding landscape? If rolling waivers, should priority be burned here?';
    }
  },
  {
    type: 'breakout_value',
    label: 'breakout detected — running valuation',
    sourceAgent: 2, // Scout
    targetAgent: 4, // Quant
    patterns: [/\b(breakout|buy.low|buy low|undervalued|emerging|ascending)\b/i],
    buildPrompt: function(sourceText, originalScenario) {
      return 'FOLLOW-UP from Scout analysis. A breakout or undervalued player was flagged:\n\n' +
        'Original scenario: ' + originalScenario + '\n\n' +
        'Scout finding: ' + sourceText.slice(0, 500) + '\n\n' +
        'Your task: Run a valuation analysis. What is this player worth right now vs. where they could be? What is the buy window? Calculate the value gap between current market price and projected production.';
    }
  },
  {
    type: 'panic_pattern',
    label: 'panic pattern detected — preparing counter-strategy',
    sourceAgent: 5, // Historian
    targetAgent: 3, // Diplomat
    patterns: [/\b(panic|desperate|fire.sale|losing streak|overreact|emotional|tilt|frustrated)\b/i],
    buildPrompt: function(sourceText, originalScenario) {
      return 'FOLLOW-UP from Historian analysis. A manager panic pattern was detected:\n\n' +
        'Original scenario: ' + originalScenario + '\n\n' +
        'Historian finding: ' + sourceText.slice(0, 500) + '\n\n' +
        'Your task: Prepare a counter-strategy to exploit this panic window. What players might they sell cheap? What offers should the GM make? Timing recommendations for when to approach.';
    }
  }
];

function detectCrossAgentTriggers(results, originalScenario) {
  var triggers = [];
  var seen = {}; // prevent duplicate target agent invocations for same trigger type

  TRIGGER_PATTERNS.forEach(function(pattern) {
    var sourceText = results[pattern.sourceAgent];
    if (!sourceText) return;

    var matched = pattern.patterns.some(function(regex) {
      return regex.test(sourceText);
    });

    if (matched) {
      var key = pattern.type + '_' + pattern.targetAgent;
      if (seen[key]) return; // only one follow-up per target per type
      seen[key] = true;

      // Cap at 3 total follow-ups to control LLM costs
      if (triggers.length >= 3) return;

      triggers.push({
        key: key,
        type: pattern.type,
        label: pattern.label,
        sourceAgentId: pattern.sourceAgent,
        targetAgentId: pattern.targetAgent,
        prompt: pattern.buildPrompt(sourceText, originalScenario)
      });
    }
  });

  return triggers;
}

setupScenarioPanel();

// ── AGENT BIO CARDS (Situation Room hero) ───────────────────────────────────
(function renderWarRoomBios() {
  var grid = document.getElementById('warroomBioGrid');
  if (!grid) return;

  var BIOS = [
    { name: 'Razzle', animal: 'Bengal Tiger', emoji: '\uD83D\uDC2F', role: 'Chief of Staff', color: '#d97757', sprite: 'char_0',
      specialty: 'synthesizes all intel, delivers the final call' },
    { name: 'Medical', animal: 'Owl', emoji: '\uD83E\uDD89', role: 'Medical Analyst', color: '#5b7fff', sprite: 'char_1',
      specialty: 'injury timelines, return-to-play risk' },
    { name: 'Scout', animal: 'Eagle', emoji: '\uD83E\uDD85', role: 'Scout', color: '#2ec4b6', sprite: 'char_2',
      specialty: 'breakout detection, usage trends' },
    { name: 'Diplomat', animal: 'Bear', emoji: '\uD83D\uDC3B', role: 'Diplomat', color: '#8b5cf6', sprite: 'char_3',
      specialty: 'trade strategy, leaguemate profiling' },
    { name: 'Quant', animal: 'Fox', emoji: '\uD83E\uDD8A', role: 'Quant', color: '#e87422', sprite: 'char_4',
      specialty: 'valuations, championship probability' },
    { name: 'Historian', animal: 'Elephant', emoji: '\uD83D\uDC18', role: 'Historian', color: '#d44040', sprite: 'char_5',
      specialty: 'league precedents, pattern recognition' },
  ];

  grid.innerHTML = BIOS.map(function(a) {
    return '<div class="warroom-bio-card">' +
      '<div class="warroom-bio-stripe" style="background:' + a.color + '"></div>' +
      '<div class="warroom-bio-body">' +
        '<div class="warroom-bio-avatar" style="background-image:url(\'assets/characters/' + a.sprite + '.png\'); background-position:0 0; background-size:224px 96px;"></div>' +
        '<div>' +
          '<div class="warroom-bio-name" style="color:' + a.color + '">' + a.emoji + ' ' + a.name + '</div>' +
          '<div class="warroom-bio-role">' + a.role + ' <span style="font-family:var(--font-hand,Caveat,cursive); font-size:12px; opacity:0.7;">(' + a.animal + ')</span></div>' +
          '<div class="warroom-bio-specialty">' + a.specialty + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
})();

// ── BRIEFING CARD RENDERER ────────────────────────────────────────────

function markdownToHtml(md) {
  // Simple markdown → HTML for agent responses
  var html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Paragraphs: split by double newlines
  var parts = html.split(/\n{2,}/);
  html = parts.map(function(p) {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol')) return p;
    return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');

  return html;
}

function detectUrgency(text) {
  var upper = text.toUpperCase();
  if (upper.indexOf('URGENT') !== -1) return 'urgent';
  if (upper.indexOf('MONITOR') !== -1) return 'monitor';
  if (upper.indexOf('OPPORTUNITY') !== -1) return 'opportunity';
  return null;
}

function renderBriefingCard(agentId, content, isError) {
  var agent = AGENT_DEFS[agentId];
  if (!agent) return '';

  var isRazzle = agentId === 0;
  var cardClass = 'briefing-card' + (isRazzle ? ' razzle-card' : '') + (isError ? ' error' : '');

  var bodyHtml;
  if (isError) {
    bodyHtml = '<div class="briefing-card-error">' + escapeHtml(content) + '</div>';
  } else {
    bodyHtml = markdownToHtml(content);
    // Inject urgency badge for Razzle
    if (isRazzle) {
      var urgency = detectUrgency(content);
      if (urgency) {
        bodyHtml = '<span class="urgency-badge ' + urgency + '">' + urgency + '</span>\n' + bodyHtml;
      }
    }
  }

  var collapsed = !isRazzle ? ' collapsed' : '';
  var toggleText = !isRazzle ? (collapsed ? '[expand]' : '[collapse]') : '';

  // Pro/Trial badge or generic hint
  var contextPill = '';
  if (isLeagueContextMode()) {
    var _tu = null;
    try { _tu = JSON.parse(localStorage.getItem("razzle_user") || "null"); } catch(e) {}
    var _onTrial = _tu && _tu.trial_active && _tu.plan_source === "trial";
    contextPill = _onTrial
      ? '<span class="briefing-pro-pill" style="background:var(--orange);">Trial</span>'
      : '<span class="briefing-pro-pill">Pro</span>';
  } else if (hasLeagueData() && !isProUser()) {
    contextPill = '<span class="briefing-generic-hint">generic analysis \u2014 upgrade for league-specific intel</span>';
  }

  return '<div class="' + cardClass + collapsed + '" data-briefing-agent="' + agentId + '">' +
    '<div class="briefing-card-header" onclick="toggleBriefingCard(this)">' +
      '<span class="briefing-card-dot" style="background:' + agent.color + '"></span>' +
      '<span class="briefing-card-name">' + escapeHtml(agent.name) + '</span>' +
      '<span class="briefing-card-role">' + escapeHtml(agent.role) + '</span>' +
      contextPill +
      '<span class="briefing-card-toggle">' + toggleText + '</span>' +
    '</div>' +
    '<div class="briefing-card-body">' + bodyHtml + '</div>' +
  '</div>';
}

function renderLoadingCard(agentId) {
  var agent = AGENT_DEFS[agentId];
  if (!agent) return '';

  var isRazzle = agentId === 0;
  var cardClass = 'briefing-card loading' + (isRazzle ? ' razzle-card' : '');

  return '<div class="' + cardClass + '" data-briefing-agent="' + agentId + '">' +
    '<div class="briefing-card-header">' +
      '<span class="briefing-card-dot" style="background:' + agent.color + '"></span>' +
      '<span class="briefing-card-name">' + escapeHtml(agent.name) + '</span>' +
      '<span class="briefing-card-role">' + escapeHtml(agent.role) + '</span>' +
    '</div>' +
    '<div class="briefing-card-body">' +
      '<div class="briefing-card-loading-text">pulling film...</div>' +
    '</div>' +
  '</div>';
}

function renderFollowUpCard(followUp) {
  var targetAgent = AGENT_DEFS[followUp.targetAgentId];
  var sourceAgent = AGENT_DEFS[followUp.sourceAgentId];
  if (!targetAgent || !sourceAgent) return '';

  var bodyHtml = markdownToHtml(followUp.result);

  return '<div class="briefing-card followup-card collapsed" data-followup-type="' + followUp.triggerType + '">' +
    '<div class="briefing-card-header" onclick="toggleBriefingCard(this)">' +
      '<span class="briefing-card-dot" style="background:' + targetAgent.color + '"></span>' +
      '<span class="briefing-card-name">' + escapeHtml(targetAgent.name) + '</span>' +
      '<span class="briefing-card-role">' + escapeHtml(targetAgent.role) + '</span>' +
      '<span class="followup-trigger-badge">' + escapeHtml(followUp.triggerLabel) + '</span>' +
      '<span class="followup-source-tag">triggered by ' + escapeHtml(sourceAgent.name) + '</span>' +
      '<span class="briefing-card-toggle">[expand]</span>' +
    '</div>' +
    '<div class="briefing-card-body">' + bodyHtml + '</div>' +
  '</div>';
}

window.toggleBriefingCard = function(header) {
  var card = header.closest('.briefing-card');
  if (!card) return;
  card.classList.toggle('collapsed');
  var toggle = header.querySelector('.briefing-card-toggle');
  if (toggle) {
    toggle.textContent = card.classList.contains('collapsed') ? '[expand]' : '[collapse]';
  }
};

function renderAllBriefings(detail) {
  var host = document.getElementById('briefingCards');
  if (!host) return;

  var html = '';

  // Razzle synthesis at top (prominent)
  if (detail.razzleSynthesis) {
    html += renderBriefingCard(0, detail.razzleSynthesis, false);
  } else if (detail.errors && detail.errors[0]) {
    html += renderBriefingCard(0, detail.errors[0], true);
  }

  // Specialist cards below (collapsible)
  var specialistIds = [1, 2, 3, 4, 5];
  specialistIds.forEach(function(id) {
    if (detail.results && detail.results[id]) {
      html += renderBriefingCard(id, detail.results[id], false);
    } else if (detail.errors && detail.errors[id]) {
      html += renderBriefingCard(id, detail.errors[id], true);
    }
  });

  // Follow-up intelligence cards (cross-agent triggers)
  if (detail.followUps && Object.keys(detail.followUps).length > 0) {
    html += '<div class="followup-section">' +
      '<div class="followup-section-header">' +
        '<span class="followup-section-icon">&#128279;</span> ' +
        '<span class="followup-section-title">Follow-Up Intelligence</span>' +
        '<span class="followup-section-sub">auto-triggered by specialist findings</span>' +
      '</div>';
    Object.keys(detail.followUps).forEach(function(key) {
      var fu = detail.followUps[key];
      html += renderFollowUpCard(fu);
    });
    html += '</div>';
  }

  // Pro teaser for free users with league data connected
  if (hasLeagueData() && !isProUser()) {
    html += '<div class="pro-teaser-card">' +
      '<p>your league data is connected but locked</p>' +
      '<div class="pro-teaser-detail">this analysis would reference your actual roster, rivals, and league settings with Pro</div>' +
      '<a class="btn-pro-upgrade" href="/pricing.html" aria-label="Upgrade to Pro plan for league-contextualized AI agents" onclick="event.preventDefault(); if(localStorage.getItem(\'razzle_token\')&&typeof startCheckout===\'function\'){startCheckout(\'year\')}else{window.location.href=\'/pricing.html\';}">Upgrade to Pro \u2014 from $9.99/mo</a>' +
    '</div>';
  }

  host.innerHTML = html;
}

// Listen for all-agents-done to render full briefing
window.addEventListener('razzle:all-agents-done', function(e) {
  renderAllBriefings(e.detail);
});

// Listen for single agent result to render individual card
window.addEventListener('razzle:agent-result', function(e) {
  var host = document.getElementById('briefingCards');
  if (!host) return;
  var d = e.detail;

  // Remove existing card for this agent
  var existing = host.querySelector('[data-briefing-agent="' + d.agentId + '"]');
  if (existing) existing.remove();

  // Render and insert
  var temp = document.createElement('div');
  temp.innerHTML = renderBriefingCard(d.agentId, d.result, false);
  var card = temp.firstElementChild;

  // Razzle goes first, specialists after
  if (d.agentId === 0) {
    host.insertBefore(card, host.firstChild);
  } else {
    host.appendChild(card);
  }
});

// ── WAR ROOM MEMORY ───────────────────────────────────────────────────

var MEMORY_KEY = 'razzle_warroom_memory';
var MEMORY_MAX_LOCAL = 20;
var MEMORY_MAX_SERVER = 100;
var _serverMemoryCache = null; // cached server memories for Elite

function getWarRoomMemory() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY)) || [];
  } catch (e) { return []; }
}

/**
 * Get all memories (local + server for Elite).
 * Returns a promise that resolves to an array.
 */
async function getWarRoomMemoryFull() {
  var local = getWarRoomMemory();

  if (!isEliteUser()) return local;

  // Elite users: merge server memories with local
  try {
    var token = localStorage.getItem('razzle_token');
    if (!token) return local;

    var resp = await fetch(
      (typeof API_BASE !== 'undefined' ? API_BASE : '') + '/api/user/memory?limit=100',
      { headers: { 'Authorization': 'Bearer ' + token } }
    );
    if (!resp.ok) return local;
    var data = await resp.json();
    var serverEntries = (data.memories || []).map(function(m) {
      return {
        id: m.id,
        ts: new Date(m.created_at).getTime(),
        scenario: m.scenario,
        agents: _parseFindings(m.findings),
        leagueId: m.league_id,
        leagueName: m.league_name,
        synced: true
      };
    });

    _serverMemoryCache = serverEntries;

    // Merge: server entries + local entries not yet synced
    // Deduplicate by scenario + timestamp proximity (within 5 seconds)
    var merged = serverEntries.slice();
    local.forEach(function(l) {
      var isDupe = merged.some(function(s) {
        return s.scenario === l.scenario && Math.abs(s.ts - l.ts) < 5000;
      });
      if (!isDupe) {
        l.synced = false;
        merged.push(l);
      }
    });

    merged.sort(function(a, b) { return b.ts - a.ts; });
    return merged;
  } catch (e) {
    return local;
  }
}

function _parseFindings(findingsStr) {
  try {
    return JSON.parse(findingsStr);
  } catch (e) {
    return [{ name: 'Razzle', finding: findingsStr.slice(0, 200) }];
  }
}

function saveWarRoomMemory(scenario, detail) {
  var memory = getWarRoomMemory();
  var entry = {
    ts: Date.now(),
    scenario: scenario,
    agents: []
  };

  // Extract key findings from each agent
  if (detail.razzleSynthesis) {
    var lines = detail.razzleSynthesis.split('\n').filter(function(l) { return l.trim(); });
    entry.agents.push({ name: 'Razzle', finding: lines.slice(0, 2).join(' ').slice(0, 200) });
  }
  var ids = [1, 2, 3, 4, 5];
  ids.forEach(function(id) {
    if (detail.results && detail.results[id]) {
      var lines = detail.results[id].split('\n').filter(function(l) { return l.trim(); });
      entry.agents.push({ name: AGENT_DEFS[id].name, finding: lines.slice(0, 1).join(' ').slice(0, 150) });
    }
  });

  // Save to localStorage
  memory.unshift(entry);
  if (memory.length > MEMORY_MAX_LOCAL) memory = memory.slice(0, MEMORY_MAX_LOCAL);
  try { localStorage.setItem(MEMORY_KEY, JSON.stringify(memory)); } catch (e) { /* quota */ }

  // Sync to server if Elite
  _syncMemoryToServer(entry);
}

function _syncMemoryToServer(entry) {
  if (!isEliteUser()) return;
  var token = localStorage.getItem('razzle_token');
  if (!token) return;

  // Get league context for league_id/name
  var leagueId = null;
  var leagueName = null;
  try {
    var ctx = JSON.parse(localStorage.getItem('razzle_league_context') || '{}');
    if (ctx.leagues && ctx.leagues.length > 0) {
      leagueId = ctx.leagues[0].id || null;
      leagueName = ctx.leagues[0].name || null;
    }
  } catch (e) { /* ignore */ }

  fetch(
    (typeof API_BASE !== 'undefined' ? API_BASE : '') + '/api/user/memory',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        scenario: entry.scenario,
        findings: JSON.stringify(entry.agents),
        league_id: leagueId,
        league_name: leagueName
      })
    }
  ).catch(function() { /* silent fail — local copy is the fallback */ });
}

function getRelevantMemory(scenario, maxItems) {
  maxItems = maxItems || 3;

  // Use server-synced cache for Elite, otherwise localStorage
  var memory = (_serverMemoryCache && isEliteUser()) ? _serverMemoryCache : getWarRoomMemory();
  if (!memory.length) return [];

  // Extract keywords from scenario (words 4+ chars, lowercased)
  var words = scenario.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/)
    .filter(function(w) { return w.length >= 4; });
  if (!words.length) return memory.slice(0, maxItems);

  // Get current league context for league-aware scoring
  var currentLeagueId = null;
  try {
    var ctx = JSON.parse(localStorage.getItem('razzle_league_context') || '{}');
    if (ctx.leagues && ctx.leagues.length > 0) currentLeagueId = ctx.leagues[0].id || null;
  } catch (e) { /* ignore */ }

  var now = Date.now();

  // Score each memory entry by keyword overlap + time decay + league match
  var scored = memory.map(function(m) {
    var text = (m.scenario + ' ' + m.agents.map(function(a) { return a.finding; }).join(' ')).toLowerCase();
    var keywordScore = 0;
    words.forEach(function(w) { if (text.indexOf(w) >= 0) keywordScore++; });

    // Time decay: memories older than 7 days get penalized, older than 30 days heavily
    var ageMs = now - (m.ts || 0);
    var ageDays = ageMs / 86400000;
    var timeDecay = 1.0;
    if (ageDays > 30) timeDecay = 0.3;
    else if (ageDays > 14) timeDecay = 0.6;
    else if (ageDays > 7) timeDecay = 0.8;

    // League bonus: memories from the same league get a boost
    var leagueBonus = 0;
    if (currentLeagueId && m.leagueId && m.leagueId === currentLeagueId) {
      leagueBonus = 2; // equivalent to 2 extra keyword matches
    }

    var totalScore = (keywordScore + leagueBonus) * timeDecay;
    return { entry: m, score: totalScore };
  });

  // Return top matches by score, then by recency
  scored.sort(function(a, b) { return b.score - a.score || b.entry.ts - a.entry.ts; });
  return scored.slice(0, maxItems).map(function(s) { return s.entry; });
}

function formatMemoryContext(entries) {
  if (!entries.length) return '';
  var lines = ['', '--- WHAT THE WAR ROOM REMEMBERS ---'];
  var eliteNote = isEliteUser() ? ' (cloud-synced, multi-season)' : '';
  if (eliteNote) lines.push('Memory depth: ' + entries.length + ' briefings' + eliteNote);

  entries.forEach(function(m) {
    var ago = formatTimeAgo(m.ts);
    var leaguePrefix = m.leagueName ? ' [' + m.leagueName + ']' : '';
    lines.push('');
    lines.push('Briefing from ' + ago + leaguePrefix + ': "' + m.scenario.slice(0, 100) + '"');
    m.agents.forEach(function(a) {
      lines.push('  ' + a.name + ': ' + a.finding);
    });
  });
  lines.push('--- END MEMORY ---');
  return lines.join('\n');
}

function formatTimeAgo(ts) {
  var diff = Date.now() - ts;
  var mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min ago';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + ' hours ago';
  var days = Math.floor(hrs / 24);
  return days + ' days ago';
}

// Hook into all-agents-done to save memory
window.addEventListener('razzle:all-agents-done', function(e) {
  var d = e.detail;
  if (d.scenario && (d.razzleSynthesis || (d.results && Object.keys(d.results).length > 0))) {
    saveWarRoomMemory(d.scenario, d);
  }
  renderMemoryPanel();
});

function renderMemoryPanel() {
  var panel = document.getElementById('memoryPanel');
  if (!panel) return;

  // Elite users get server-synced memories
  if (isEliteUser()) {
    panel.innerHTML = '<div style="font-family:var(--font-hand); font-size:14px; color:var(--ink-light); text-align:center; padding:8px;">loading memory...</div>';
    getWarRoomMemoryFull().then(function(memories) {
      _renderMemoryEntries(panel, memories, true);
    });
  } else {
    var memory = getWarRoomMemory();
    _renderMemoryEntries(panel, memory, false);
  }
}

function _renderMemoryEntries(panel, memory, isElite) {
  if (!memory.length) {
    var emptyMsg = isElite
      ? 'no briefings recorded yet — your memory syncs across devices'
      : 'no briefings recorded yet';
    if (!isElite) {
      emptyMsg += '<div style="margin-top:8px; font-size:12px; color:var(--orange);">Elite plan: unlimited cloud-synced memory</div>';
    }
    panel.innerHTML = '<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); text-align:center; padding:16px;">' + emptyMsg + '</div>';
    return;
  }

  var headerBadge = isElite
    ? '<div style="font-family:var(--font-mono); font-size:9px; color:var(--pos-qb); text-align:center; margin-bottom:6px; padding:2px 8px; border:1px solid var(--pos-qb); border-radius:3px; display:inline-block;">cloud-synced</div>'
    : '';

  var html = headerBadge ? '<div style="text-align:center;">' + headerBadge + '</div>' : '';

  memory.forEach(function(m) {
    var ago = formatTimeAgo(m.ts);
    var agentSummary = m.agents.map(function(a) { return a.name; }).join(', ');
    var syncIcon = m.synced ? '<span title="Synced to cloud" style="font-size:10px; color:var(--pos-qb); margin-left:4px;">&#9729;</span>' : '';
    var leagueTag = m.leagueName ? '<span style="font-family:var(--font-mono); font-size:9px; color:var(--orange); margin-left:4px;">[' + escapeHtml(m.leagueName) + ']</span>' : '';

    html += '<div style="padding:8px 0; border-bottom:1px dashed var(--ink-faint);">';
    html += '<div style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">' + ago + syncIcon + leagueTag + '</div>';
    html += '<div style="font-family:var(--font-display); font-size:12px; margin:2px 0;">' + escapeHtml(m.scenario.slice(0, 80)) + (m.scenario.length > 80 ? '...' : '') + '</div>';
    html += '<div style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">' + agentSummary + '</div>';
    html += '</div>';
  });

  html += '<div style="text-align:center; margin-top:8px;">';
  html += '<button class="btn-chunky" style="font-size:10px; padding:3px 10px;" onclick="clearWarRoomMemory()">clear memory</button>';
  if (!isElite) {
    html += '<div style="font-family:var(--font-hand); font-size:11px; color:var(--ink-light); margin-top:6px;">' + memory.length + '/' + MEMORY_MAX_LOCAL + ' local entries</div>';
  } else {
    html += '<div style="font-family:var(--font-hand); font-size:11px; color:var(--pos-qb); margin-top:6px;">' + memory.length + '/' + MEMORY_MAX_SERVER + ' cloud entries</div>';
  }
  html += '</div>';
  panel.innerHTML = html;
}

function clearWarRoomMemory() {
  localStorage.removeItem(MEMORY_KEY);

  // Also clear server memory for Elite users
  if (isEliteUser()) {
    var token = localStorage.getItem('razzle_token');
    if (token) {
      fetch(
        (typeof API_BASE !== 'undefined' ? API_BASE : '') + '/api/user/memory',
        { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } }
      ).catch(function() {});
    }
    _serverMemoryCache = null;
  }

  renderMemoryPanel();
}

function toggleMemoryPanel() {
  var panel = document.getElementById('memoryPanel');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// Initialize memory panel on load
setTimeout(renderMemoryPanel, 500);

// ── WEEKLY BRIEFING PANEL ─────────────────────────────────────────────

function initWeeklyBriefingPanel() {
  var eliteSection = document.getElementById('weeklyBriefingSection');
  var teaserSection = document.getElementById('weeklyBriefingTeaser');
  if (!eliteSection || !teaserSection) return;

  if (isEliteUser()) {
    eliteSection.style.display = 'block';
    teaserSection.style.display = 'none';
    loadLatestBriefing();
  } else {
    eliteSection.style.display = 'none';
    teaserSection.style.display = 'block';
  }
}

function loadLatestBriefing() {
  var token = localStorage.getItem('razzle_token');
  if (!token) return;
  var body = document.getElementById('weeklyBriefingBody');
  var weekLabel = document.getElementById('briefingWeekLabel');

  fetch(
    (typeof API_BASE !== 'undefined' ? API_BASE : '') + '/api/briefings/latest',
    { headers: { 'Authorization': 'Bearer ' + token } }
  )
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (!data.briefing) {
      body.innerHTML = '<div style="font-family:var(--font-hand); font-size:16px; color:var(--ink-light); text-align:center; padding:16px;">no briefings yet — hit "Generate New Briefing" to get your first one</div>';
      return;
    }
    var b = data.briefing;
    if (weekLabel) weekLabel.textContent = b.week_label || '';
    renderBriefingContent(body, b);
  })
  .catch(function() {
    body.innerHTML = '<div style="font-family:var(--font-hand); font-size:14px; color:var(--ink-light); text-align:center; padding:12px;">could not load briefing</div>';
  });
}

function renderBriefingContent(container, briefing) {
  var html = '';
  // Summary
  html += '<div style="font-family:var(--font-mono); font-size:13px; line-height:1.6; color:var(--ink); margin-bottom:12px;">' + escapeHtml(briefing.summary) + '</div>';

  // Urgency items
  var urgents = safeParse(briefing.urgency_items);
  if (urgents.length) {
    html += '<div style="margin-bottom:8px;"><span style="font-family:var(--font-display); font-size:12px; color:var(--red); text-transform:uppercase;">Urgent</span>';
    urgents.forEach(function(item) {
      html += '<div style="font-family:var(--font-mono); font-size:12px; color:var(--ink-medium); margin:2px 0 2px 8px;">- ' + escapeHtml(item) + '</div>';
    });
    html += '</div>';
  }

  // Monitor items
  var monitors = safeParse(briefing.monitor_items);
  if (monitors.length) {
    html += '<div style="margin-bottom:8px;"><span style="font-family:var(--font-display); font-size:12px; color:var(--yellow); text-transform:uppercase;">Monitor</span>';
    monitors.forEach(function(item) {
      html += '<div style="font-family:var(--font-mono); font-size:12px; color:var(--ink-medium); margin:2px 0 2px 8px;">- ' + escapeHtml(item) + '</div>';
    });
    html += '</div>';
  }

  // Opportunity items
  var opps = safeParse(briefing.opportunity_items);
  if (opps.length) {
    html += '<div style="margin-bottom:8px;"><span style="font-family:var(--font-display); font-size:12px; color:var(--green); text-transform:uppercase;">Opportunity</span>';
    opps.forEach(function(item) {
      html += '<div style="font-family:var(--font-mono); font-size:12px; color:var(--ink-medium); margin:2px 0 2px 8px;">- ' + escapeHtml(item) + '</div>';
    });
    html += '</div>';
  }

  // Agent highlights
  var highlights = safeParse(briefing.agent_highlights);
  if (highlights.length) {
    html += '<div style="border-top:2px dashed var(--ink-faint); padding-top:8px; margin-top:8px;">';
    html += '<div style="font-family:var(--font-display); font-size:11px; text-transform:uppercase; color:var(--ink-light); margin-bottom:4px;">Agent Highlights</div>';
    highlights.forEach(function(h) {
      html += '<div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-medium); margin:3px 0;">';
      html += '<strong style="color:var(--orange);">' + escapeHtml(h.agent || '') + ':</strong> ' + escapeHtml(h.finding || h.text || '') + '</div>';
    });
    html += '</div>';
  }

  // Timestamp
  if (briefing.created_at) {
    html += '<div style="font-family:var(--font-hand); font-size:12px; color:var(--ink-light); text-align:right; margin-top:8px;">generated ' + briefing.created_at + '</div>';
  }

  container.innerHTML = html;
}

function safeParse(val) {
  if (Array.isArray(val)) return val;
  if (!val || val === '[]') return [];
  try { return JSON.parse(val); } catch (e) { return []; }
}

function generateWeeklyBriefing() {
  // Use the scenario runner to generate a weekly briefing via Razzle
  var scenario = 'Generate my weekly fantasy football briefing. Cover: injury updates affecting my roster, waiver wire priorities, trade opportunities, championship odds update, and the single most important action I should take this week. Organize by urgency tier (URGENT, MONITOR, OPPORTUNITY).';
  var input = document.getElementById('scenarioInput');
  if (input) {
    input.value = scenario;
    // Trigger the run
    var runBtn = document.getElementById('scenarioRunAll');
    if (runBtn && !runBtn.disabled) {
      runBtn.click();
      // Listen for completion to save as briefing
      window._savingBriefing = true;
    }
  }
}

// Hook into agent completion to save briefing when generating weekly
window.addEventListener('razzle:all-agents-done', function(e) {
  if (!window._savingBriefing) return;
  window._savingBriefing = false;

  var d = e.detail;
  if (!d.razzleSynthesis) return;

  var token = localStorage.getItem('razzle_token');
  if (!token || !isEliteUser()) return;

  // Determine week label
  var now = new Date();
  var weekNum = getISOWeek(now);
  var weekLabel = now.getFullYear() + '-W' + String(weekNum).padStart(2, '0');

  // Extract structured data from Razzle synthesis
  var leagueCtx = getLeagueContext() || {};
  var lg = (leagueCtx.leagues && leagueCtx.leagues[0]) || {};

  var briefingData = {
    week_label: weekLabel,
    league_id: lg.id || '',
    league_name: lg.name || '',
    summary: d.razzleSynthesis.slice(0, 5000),
    urgency_items: [],
    monitor_items: [],
    opportunity_items: [],
    agent_highlights: [],
  };

  // Extract agent highlights
  if (d.results) {
    Object.keys(d.results).forEach(function(key) {
      var result = d.results[key];
      if (result && result.text) {
        briefingData.agent_highlights.push({
          agent: result.name || key,
          finding: result.text.slice(0, 500),
        });
      }
    });
  }

  // Save to backend
  fetch(
    (typeof API_BASE !== 'undefined' ? API_BASE : '') + '/api/briefings/save',
    {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(briefingData),
    }
  )
  .then(function() { loadLatestBriefing(); })
  .catch(function() { /* silent fail */ });
});

function getISOWeek(date) {
  var d = new Date(date.valueOf());
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  var yearStart = new Date(d.getFullYear(), 0, 4);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function toggleBriefingHistory() {
  var panel = document.getElementById('briefingHistoryPanel');
  if (!panel) return;
  if (panel.style.display !== 'none') {
    panel.style.display = 'none';
    return;
  }
  panel.style.display = 'block';
  panel.innerHTML = '<div style="font-family:var(--font-hand); font-size:14px; color:var(--ink-light); text-align:center; padding:8px;">loading history...</div>';

  var token = localStorage.getItem('razzle_token');
  if (!token) return;

  fetch(
    (typeof API_BASE !== 'undefined' ? API_BASE : '') + '/api/briefings/history?limit=5',
    { headers: { 'Authorization': 'Bearer ' + token } }
  )
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (!data.briefings || !data.briefings.length) {
      panel.innerHTML = '<div style="font-family:var(--font-hand); font-size:14px; color:var(--ink-light); text-align:center; padding:8px;">no briefing history</div>';
      return;
    }
    var html = '';
    data.briefings.forEach(function(b) {
      var leagueTag = b.league_name ? ' [' + escapeHtml(b.league_name) + ']' : '';
      html += '<div style="padding:6px 0; border-bottom:1px dashed var(--ink-faint); cursor:pointer;" onclick="loadBriefingById(' + b.id + ')">';
      html += '<div style="font-family:var(--font-display); font-size:12px;">' + escapeHtml(b.week_label) + leagueTag + '</div>';
      html += '<div style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light);">' + escapeHtml(b.summary.slice(0, 80)) + '...</div>';
      html += '</div>';
    });
    panel.innerHTML = html;
  })
  .catch(function() {
    panel.innerHTML = '<div style="font-family:var(--font-hand); font-size:14px; color:var(--ink-light); text-align:center; padding:8px;">failed to load</div>';
  });
}

function loadBriefingById(id) {
  // For now, just reload latest — a specific briefing fetch could be added later
  loadLatestBriefing();
}

// ── FIRST-RUN DEMO BRIEFING ───────────────────────────────────────────
// Shows pre-rendered sample briefing cards when user first visits agents.html.
// Demonstrates what agent output looks like before they configure anything.
// Dismissed permanently via localStorage flag, or automatically on first real query.

var DEMO_SCENARIO = 'Should I start Jayden Daniels or Jalen Hurts this week?';

var DEMO_BRIEFINGS = {
  razzle: '## URGENT: Start Jayden Daniels\n\n' +
    'After reviewing all specialist input, the verdict is clear: **Daniels is the start this week.**\n\n' +
    '### Conflict Resolution\n' +
    '- Quant projects Daniels at **22.4 pts** vs Hurts at **18.1 pts** in your scoring format\n' +
    '- Medical confirms Hurts\u2019 ankle is a real concern \u2014 limited practice reps, history of re-aggravation\n' +
    '- Scout flags Daniels\u2019 rushing upside: 7.2 designed runs/game, 3rd among QBs\n\n' +
    '### GM Decision Needed\n' +
    '- **Start Daniels** with high confidence (floor 15, ceiling 30+)\n' +
    '- Hurts is a MONITOR \u2014 if he\u2019s full-go by Sunday, he\u2019s still a fringe QB1 but the ankle caps ceiling\n\n' +
    '*<span style="color:var(--ink-light);font-size:11px;">With league context, this analysis would reference your specific matchup, opponent\u2019s projected score, and whether you need floor or ceiling this week.</span>*',

  medical: '### Injury Assessment: Jalen Hurts\n\n' +
    '**Injury**: Right ankle sprain (Grade 1-2)\n' +
    '**Status**: Limited \u2014 practiced Thursday, questionable\n\n' +
    '**Mechanism**: Non-contact plant-foot aggravation during scramble drill. This is concerning because it mirrors the Week 8 injury from last season.\n\n' +
    '**Return-to-Play Analysis**:\n' +
    '- Historically, QBs with ankle sprains who practice limited on Thursday start 78% of the time\n' +
    '- However, re-aggravation rate within 3 weeks is 31% for this injury type\n' +
    '- Hurts specifically has a pattern of playing through injuries but with reduced rushing volume (4.1 rush att/game when healthy vs 2.3 when managing ankle)\n\n' +
    '**Risk Rating**: ELEVATED \u2014 likely to play but with capped upside\n\n' +
    '*<span style="color:var(--ink-light);font-size:11px;">With league context: would factor in your IR slot availability and whether ??? is available on your bench.</span>*',

  scout: '### Usage Trend: Jayden Daniels\n\n' +
    '**Breakout Signal**: STRONG\n\n' +
    'Daniels\u2019 rushing usage has been elite:\n' +
    '- 7.2 designed runs/game (3rd among QBs)\n' +
    '- 41.3 rushing yards/game (2nd among QBs)\n' +
    '- 4 rushing TDs in last 6 games\n' +
    '- Target share to pass-catchers is climbing: 68% \u2192 72% \u2192 76% over last 3 weeks\n\n' +
    '**Matchup Grade**: A-\n' +
    '- Opponent allows 22.8 fantasy points to QBs (6th most)\n' +
    '- Weak at containing mobile QBs: 5.1 YPC allowed to rushing QBs\n\n' +
    '**Waiver Note**: If Daniels is somehow on your wire, he\u2019s a top-3 add this week.\n\n' +
    '*<span style="color:var(--ink-light);font-size:11px;">With league context: would check if Daniels is on your roster or ??? , and surface waiver competition from ???.</span>*',

  diplomat: '### Leverage Assessment\n\n' +
    '**Trade Window**: If you own both QBs, this is a sell-high moment for Hurts.\n\n' +
    'Hurts\u2019 name value still exceeds his ROS production projection. Managers in QB-needy situations will overpay.\n\n' +
    '**Recommended Approach**:\n' +
    '- Target managers with streaming QBs or injured starters\n' +
    '- Hurts\u2019 perceived value: QB3-5 range\n' +
    '- Actual ROS value with ankle concern: QB8-10\n' +
    '- That gap is your profit margin\n\n' +
    '**FAAB Note**: If Daniels is a waiver add, expect competition. Recommended bid: 18-22% of remaining budget.\n\n' +
    '*<span style="color:var(--ink-light);font-size:11px;">With league context: would identify the 2-3 managers in your league most desperate for a QB and recommend specific counter-offers.</span>*',

  quant: '### Projection Comparison\n\n' +
    '| Metric | Daniels | Hurts |\n' +
    '|--------|---------|-------|\n' +
    '| Projected | **22.4** | 18.1 |\n' +
    '| Floor | 15.2 | 11.8 |\n' +
    '| Ceiling | 31.0 | 28.5 |\n\n' +
    '**Win Probability Impact**: Starting Daniels over Hurts increases your projected points by **4.3** this week.\n\n' +
    '**Confidence**: 72% \u2014 Daniels is the statistically better start in all three scenarios (floor, median, ceiling).\n\n' +
    '**ROS Outlook**: Daniels finishes as a top-5 QB if usage holds. Hurts\u2019 ankle makes him a top-8 with downside risk to top-12.\n\n' +
    '*<span style="color:var(--ink-light);font-size:11px;">With league context: would calculate exact win probability for your matchup and championship odds impact.</span>*',

  historian: '### Pattern Recognition\n\n' +
    '**Historical Precedent**: QBs returning from ankle injuries\n\n' +
    '- In the last 5 seasons, QBs listed as "questionable" with ankle injuries who started averaged **14.2 fantasy points** vs their season average of **19.8** \u2014 a 28% decline\n' +
    '- The decline is almost entirely from reduced rushing: -38% rushing yards, -45% rushing attempts\n' +
    '- Passing production stays relatively stable (-8%) because the ankle affects mobility, not arm strength\n\n' +
    '**Daniels Comparison**: Daniels\u2019 profile (age 24, dual-threat, high rushing floor) matches Lamar Jackson\u2019s 2022 trajectory. Jackson finished QB2 in that stretch.\n\n' +
    '**League Precedent**: In similar start/sit decisions between a healthy dual-threat and an injured elite QB, the healthy option has outscored the injured one 71% of the time.\n\n' +
    '*<span style="color:var(--ink-light);font-size:11px;">With league context: would search your league\u2019s multi-season history for similar decisions and outcomes.</span>*'
};

function showFirstRunDemo() {
  // Only show if: (1) not dismissed, (2) no previous queries run, (3) briefing zone is empty
  if (localStorage.getItem('razzle_demo_dismissed')) return;
  var host = document.getElementById('briefingCards');
  if (!host || host.children.length > 0) return;

  var html = '';

  // Demo header
  html += '<div class="demo-briefing-header" id="demoBriefingHeader">' +
    '<div class="demo-briefing-scenario">' +
      '<span class="demo-briefing-badge">sample briefing</span>' +
      '<span class="demo-briefing-question">' + escapeHtml(DEMO_SCENARIO) + '</span>' +
    '</div>' +
    '<div class="demo-briefing-hint">this is what agent output looks like. run your own scenario above.</div>' +
    '<button class="demo-briefing-dismiss" onclick="dismissFirstRunDemo()">dismiss</button>' +
  '</div>';

  // Razzle synthesis (expanded)
  html += renderDemoCard(0, DEMO_BRIEFINGS.razzle, false);

  // Specialists (collapsed)
  html += renderDemoCard(1, DEMO_BRIEFINGS.medical, true);
  html += renderDemoCard(2, DEMO_BRIEFINGS.scout, true);
  html += renderDemoCard(3, DEMO_BRIEFINGS.diplomat, true);
  html += renderDemoCard(4, DEMO_BRIEFINGS.quant, true);
  html += renderDemoCard(5, DEMO_BRIEFINGS.historian, true);

  // Follow-up demo (shows cross-agent trigger)
  html += '<div class="followup-section">' +
    '<div class="followup-section-header">' +
      '<span class="followup-section-icon">&#128279;</span> ' +
      '<span class="followup-section-title">Follow-Up Intelligence</span>' +
      '<span class="followup-section-sub">auto-triggered by Medical\u2019s injury flag</span>' +
    '</div>' +
    '<div class="briefing-card followup-card collapsed demo-card" data-followup-type="injury-handcuff">' +
      '<div class="briefing-card-header" onclick="toggleBriefingCard(this)">' +
        '<span class="briefing-card-dot" style="background:#2ec4b6"></span>' +
        '<span class="briefing-card-name">Scout</span>' +
        '<span class="briefing-card-role">Scout</span>' +
        '<span class="followup-trigger-badge">injury-handcuff</span>' +
        '<span class="followup-source-tag">triggered by Medical</span>' +
        '<span class="demo-card-badge">demo</span>' +
        '<span class="briefing-card-toggle">[expand]</span>' +
      '</div>' +
      '<div class="briefing-card-body">' +
        markdownToHtml('### Handcuff Assessment: Hurts Backup\n\n' +
          'If Hurts sits or exits early, **Kenny Pickett** takes over.\n\n' +
          '- Pickett has zero rushing upside (1.2 rush att/game in relief)\n' +
          '- Pass game shifts to short routes: TE and slot see +18% target share increase\n' +
          '- If you\u2019re starting any Eagles pass-catchers, factor in Pickett risk\n\n' +
          '*This follow-up was auto-triggered because Medical flagged an elevated injury risk.*') +
      '</div>' +
    '</div>' +
  '</div>';

  // Upgrade CTA at bottom
  html += '<div class="demo-briefing-cta">' +
    '<p>imagine this analysis with <strong>your roster</strong>, <strong>your opponents</strong>, and <strong>your league\u2019s scoring</strong>.</p>' +
    '<a href="/pricing.html" class="btn-chunky btn-primary" style="font-size:13px;">Start Free 7-Day Trial</a>' +
    '<span style="font-family:var(--font-mono); font-size:10px; color:var(--ink-light); display:block; margin-top:6px;">no credit card required</span>' +
  '</div>';

  host.innerHTML = html;
}

function renderDemoCard(agentId, content, collapsed) {
  var agent = AGENT_DEFS[agentId];
  if (!agent) return '';

  var isRazzle = agentId === 0;
  var cardClass = 'briefing-card demo-card' + (isRazzle ? ' razzle-card' : '') + (collapsed ? ' collapsed' : '');

  var bodyHtml = markdownToHtml(content);
  if (isRazzle) {
    bodyHtml = '<span class="urgency-badge urgent">urgent</span>\n' + bodyHtml;
  }

  var toggleText = collapsed ? '[expand]' : '[collapse]';

  return '<div class="' + cardClass + '" data-briefing-agent="' + agentId + '">' +
    '<div class="briefing-card-header" onclick="toggleBriefingCard(this)">' +
      '<span class="briefing-card-dot" style="background:' + agent.color + '"></span>' +
      '<span class="briefing-card-name">' + escapeHtml(agent.name) + '</span>' +
      '<span class="briefing-card-role">' + escapeHtml(agent.role) + '</span>' +
      '<span class="demo-card-badge">demo</span>' +
      '<span class="briefing-card-toggle">' + toggleText + '</span>' +
    '</div>' +
    '<div class="briefing-card-body">' + bodyHtml + '</div>' +
  '</div>';
}

window.dismissFirstRunDemo = function() {
  localStorage.setItem('razzle_demo_dismissed', '1');
  var host = document.getElementById('briefingCards');
  if (host) host.innerHTML = '';
};

// Auto-dismiss demo when a real query starts
window.addEventListener('razzle:agents-starting', function() {
  localStorage.setItem('razzle_demo_dismissed', '1');
  var header = document.getElementById('demoBriefingHeader');
  if (header) header.remove();
  // Remove all demo cards
  var demoCards = document.querySelectorAll('.demo-card');
  demoCards.forEach(function(c) { c.remove(); });
  var demoCta = document.querySelector('.demo-briefing-cta');
  if (demoCta) demoCta.remove();
});

// Show demo after a short delay to let the page settle
setTimeout(showFirstRunDemo, 800);

// Initialize briefing panel on page load
setTimeout(initWeeklyBriefingPanel, 600);

// Re-initialize on plan change
window.addEventListener('razzle-plan-changed', function() {
  setTimeout(initWeeklyBriefingPanel, 200);
});

// ── START ──────────────────────────────────────────────────────────────
function waitAndStart() {
  if (spritesLoaded >= 6) {
    // Hide placeholder
    const placeholder = document.getElementById('canvasPlaceholder');
    if (placeholder) placeholder.style.display = 'none';

    cam.x = cam.targetX = selectedAgent.x - cvs.width / 2;
    cam.y = cam.targetY = selectedAgent.y - cvs.height / 2;
    clampCam();
    gameLoop();
  } else {
    // Loading screen on canvas
    ctx.fillStyle = '#2d1f14';
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    ctx.fillStyle = '#d97757';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('pulling film...', cvs.width / 2, cvs.height / 2);
    const dots = '.'.repeat(Math.floor(now() / 500) % 4);
    ctx.fillText(dots, cvs.width / 2, cvs.height / 2 + 20);
    ctx.textAlign = 'left';
    requestAnimationFrame(waitAndStart);
  }
}
waitAndStart();
