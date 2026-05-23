import {
  AGENT_LABELS,
  COLS,
  PALETTE,
  ROWS,
  TABLE_RECT,
  TILE,
  WORK_TILES,
  type AgentId,
  type AgentStateKind,
} from "./constants";
import { drawSpriteFrame, type SpriteSheets } from "./sprites";

export interface RoomAgent {
  id: AgentId;
  tileX: number;
  tileY: number;
  px: number;
  py: number;
  targetTileX: number;
  targetTileY: number;
  state: AgentStateKind;
  frame: number;
  frameTimer: number;
  flipX: boolean;
  idleUntil: number;
}

export interface Camera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

function buildCollisionMap(): number[][] {
  const map: number[][] = [];
  for (let r = 0; r < ROWS; r++) {
    map[r] = [];
    for (let c = 0; c < COLS; c++) {
      const border = r <= 1 || r >= ROWS - 1 || c <= 0 || c >= COLS - 1;
      const table =
        c >= TABLE_RECT.x &&
        c < TABLE_RECT.x + TABLE_RECT.w &&
        r >= TABLE_RECT.y &&
        r < TABLE_RECT.y + TABLE_RECT.h;
      map[r]![c] = border || table ? 0 : 1;
    }
  }
  return map;
}

const COLLISION = buildCollisionMap();

function isWalkable(tx: number, ty: number) {
  return ty >= 0 && ty < ROWS && tx >= 0 && tx < COLS && COLLISION[ty]![tx] === 1;
}

function randomWalkable(exclude?: { x: number; y: number }) {
  for (let i = 0; i < 40; i++) {
    const tx = 2 + Math.floor(Math.random() * (COLS - 4));
    const ty = 3 + Math.floor(Math.random() * (ROWS - 5));
    if (!isWalkable(tx, ty)) continue;
    if (exclude && exclude.x === tx && exclude.y === ty) continue;
    return { x: tx, y: ty };
  }
  return { x: 4, y: 8 };
}

function createAgent(id: AgentId, tileX: number, tileY: number): RoomAgent {
  return {
    id,
    tileX,
    tileY,
    px: tileX * TILE,
    py: tileY * TILE,
    targetTileX: tileX,
    targetTileY: tileY,
    state: "idle",
    frame: 0,
    frameTimer: 0,
    flipX: false,
    idleUntil: performance.now() + 2000 + Math.random() * 3000,
  };
}

export function createDefaultAgents(): RoomAgent[] {
  return [
    createAgent("razzle", 4, 9),
    createAgent("dolphin", 7, 10),
    createAgent("hawkeye", 17, 8),
    createAgent("bones", 10, 11),
    createAgent("octo", 15, 7),
    createAgent("atlas", 19, 10),
  ];
}

export function createCamera(): Camera {
  return { x: 0, y: 0, targetX: 0, targetY: 0 };
}

export function updateCamera(cam: Camera, viewW: number, viewH: number) {
  cam.x += (cam.targetX - cam.x) * 0.1;
  cam.y += (cam.targetY - cam.y) * 0.1;
  const maxX = Math.max(0, COLS * TILE - viewW);
  const maxY = Math.max(0, ROWS * TILE - viewH);
  cam.x = Math.max(0, Math.min(maxX, cam.x));
  cam.y = Math.max(0, Math.min(maxY, cam.y));
}

export function focusCameraOn(cam: Camera, px: number, py: number, viewW: number, viewH: number) {
  cam.targetX = px + 16 - viewW / 2;
  cam.targetY = py + 24 - viewH / 2;
  const maxX = Math.max(0, COLS * TILE - viewW);
  const maxY = Math.max(0, ROWS * TILE - viewH);
  cam.targetX = Math.max(0, Math.min(maxX, cam.targetX));
  cam.targetY = Math.max(0, Math.min(maxY, cam.targetY));
}

function drawFloor(ctx: CanvasRenderingContext2D) {
  for (let r = 2; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? PALETTE.floorWood1 : PALETTE.floorWood2;
      ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
    }
  }
}

function drawWalls(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = PALETTE.wallDark;
  ctx.fillRect(0, 0, COLS * TILE, 2 * TILE);
  ctx.fillRect(0, (ROWS - 1) * TILE, COLS * TILE, TILE);
  ctx.fillRect(0, 0, TILE, ROWS * TILE);
  ctx.fillRect((COLS - 1) * TILE, 0, TILE, ROWS * TILE);

  ctx.fillStyle = PALETTE.wallMid;
  ctx.fillRect(TILE, TILE, (COLS - 2) * TILE, TILE);

  ctx.fillStyle = PALETTE.bannerBg;
  ctx.fillRect(6 * TILE, TILE + 4, 12 * TILE, TILE - 8);
  ctx.fillStyle = PALETTE.bannerText;
  ctx.font = 'bold 14px "Luckiest Guy", cursive';
  ctx.textAlign = "center";
  ctx.fillText("SITUATION ROOM", 12 * TILE, TILE + 22);
  ctx.textAlign = "left";
}

function drawWarTable(ctx: CanvasRenderingContext2D) {
  const x = TABLE_RECT.x * TILE;
  const y = TABLE_RECT.y * TILE;
  const w = TABLE_RECT.w * TILE;
  const h = TABLE_RECT.h * TILE;
  ctx.fillStyle = PALETTE.turf1;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.turf2;
  ctx.fillRect(x + 8, y + 8, w - 16, h - 16);
  ctx.strokeStyle = PALETTE.turfLine;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
}

function pickNextTile(agent: RoomAgent) {
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ].sort(() => Math.random() - 0.5);

  for (const d of dirs) {
    const nx = agent.tileX + d.x;
    const ny = agent.tileY + d.y;
    if (isWalkable(nx, ny)) {
      return { x: nx, y: ny };
    }
  }
  return randomWalkable({ x: agent.tileX, y: agent.tileY });
}

export function updateAgents(agents: RoomAgent[], dt: number, now: number) {
  for (const agent of agents) {
    agent.frameTimer += dt;
    if (agent.frameTimer >= 150) {
      agent.frameTimer = 0;
      agent.frame = (agent.frame + 1) % 4;
    }

    if (agent.state === "work") {
      continue;
    }

    if (agent.state === "idle") {
      if (now >= agent.idleUntil) {
        const next = pickNextTile(agent);
        agent.targetTileX = next.x;
        agent.targetTileY = next.y;
        agent.state = "walk";
        agent.flipX = next.x < agent.tileX;
      }
      continue;
    }

    const targetPx = agent.targetTileX * TILE;
    const targetPy = agent.targetTileY * TILE;
    const speed = 48 * dt;
    const dx = targetPx - agent.px;
    const dy = targetPy - agent.py;
    const dist = Math.hypot(dx, dy);

    if (dist < speed || dist === 0) {
      agent.px = targetPx;
      agent.py = targetPy;
      agent.tileX = agent.targetTileX;
      agent.tileY = agent.targetTileY;
      agent.state = "idle";
      agent.idleUntil = now + 1500 + Math.random() * 2500;
    } else {
      agent.px += (dx / dist) * speed;
      agent.py += (dy / dist) * speed;
      agent.flipX = dx < 0;
    }
  }
}

function drawSelectionRing(ctx: CanvasRenderingContext2D, agent: RoomAgent) {
  ctx.strokeStyle = "#ffc857";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.ellipse(agent.px + 16, agent.py + 40, 22, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function renderRoom(
  ctx: CanvasRenderingContext2D,
  agents: RoomAgent[],
  sheets: SpriteSheets,
  cam: Camera,
  viewW: number,
  viewH: number,
  selectedId: AgentId | null,
) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, viewW, viewH);
  ctx.save();
  ctx.translate(-cam.x, -cam.y);

  drawWalls(ctx);
  drawFloor(ctx);
  drawWarTable(ctx);

  const sorted = [...agents].sort((a, b) => a.py - b.py);
  for (const agent of sorted) {
    const anim = agent.state === "walk" ? "walk" : "idle";
    const img = sheets[agent.id][anim];
    if (img) {
      drawSpriteFrame(ctx, img, agent.frame, agent.px, agent.py - 8, agent.flipX);
    }
    if (agent.id === selectedId) {
      drawSelectionRing(ctx, agent);
    }
    ctx.fillStyle = PALETTE.nameTag;
    ctx.fillRect(agent.px - 4, agent.py + 38, 72, 14);
    ctx.fillStyle = agent.state === "work" ? "#ffc857" : PALETTE.nameText;
    ctx.font = '10px "Space Mono", monospace';
    const label = agent.state === "work" ? `${AGENT_LABELS[agent.id]} · WORK` : AGENT_LABELS[agent.id];
    ctx.fillText(label, agent.px + 2, agent.py + 49);
  }
  ctx.restore();
}

export function setAgentWorking(agents: RoomAgent[], id: AgentId) {
  const agent = agents.find((a) => a.id === id);
  if (!agent) return;
  const desk = WORK_TILES[id];
  agent.targetTileX = desk.x;
  agent.targetTileY = desk.y;
  agent.state = "walk";
  agent.flipX = desk.x < agent.tileX;
}

export function clearAgentWorking(agents: RoomAgent[], id: AgentId) {
  const agent = agents.find((a) => a.id === id);
  if (!agent) return;
  agent.state = "idle";
  agent.idleUntil = performance.now() + 2000;
}

export function hitTestAgent(agents: RoomAgent[], worldX: number, worldY: number): AgentId | null {
  for (const agent of [...agents].reverse()) {
    if (
      worldX >= agent.px &&
      worldX <= agent.px + 32 &&
      worldY >= agent.py &&
      worldY <= agent.py + 48
    ) {
      return agent.id;
    }
  }
  return null;
}

export function agentById(agents: RoomAgent[], id: AgentId): RoomAgent | undefined {
  return agents.find((a) => a.id === id);
}
