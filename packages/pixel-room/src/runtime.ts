import { COLS, ROWS, TILE, WORLD_H, WORLD_W, type AgentId } from "./constants";
import {
  agentById,
  clearAgentWorking,
  createCamera,
  createDefaultAgents,
  focusCameraOn,
  hitTestAgent,
  renderRoom,
  setAgentWorking,
  updateAgents,
  updateCamera,
  type Camera,
  type RoomAgent,
} from "./engine";
import { loadSpriteSheets, type SpriteSheets } from "./sprites";

export interface PixelRoomEngineOptions {
  assetBase?: string;
  onReady?: () => void;
  onAgentSelect?: (id: AgentId) => void;
}

export class PixelRoomEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private agents: RoomAgent[];
  private cam: Camera;
  private sheets: SpriteSheets | null = null;
  private raf = 0;
  private lastTs = 0;
  private assetBase: string;
  private onReady?: () => void;
  private onAgentSelect?: (id: AgentId) => void;
  private selectedId: AgentId | null = "razzle";
  private workingIds = new Set<AgentId>();
  private viewW = WORLD_W;
  private viewH = WORLD_H;

  constructor(canvas: HTMLCanvasElement, options: PixelRoomEngineOptions = {}) {
    this.canvas = canvas;
    this.assetBase = options.assetBase ?? "/pixel-room/characters";
    this.onReady = options.onReady;
    this.onAgentSelect = options.onAgentSelect;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D unavailable");
    this.ctx = ctx;
    this.agents = createDefaultAgents();
    this.cam = createCamera();
    this.resize();
    this.canvas.addEventListener("click", this.onClick);
    window.addEventListener("resize", this.onResize);
  }

  private resize = () => {
    const container = this.canvas.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    this.viewW = Math.min(WORLD_W, Math.max(320, Math.floor(rect.width)));
    this.viewH = Math.min(WORLD_H, Math.max(240, Math.floor(rect.height)));
    this.canvas.width = this.viewW;
    this.canvas.height = this.viewH;
    const sel = this.selectedId ? agentById(this.agents, this.selectedId) : null;
    if (sel) focusCameraOn(this.cam, sel.px, sel.py, this.viewW, this.viewH);
  };

  private onResize = () => this.resize();

  private onClick = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const worldX = (e.clientX - rect.left) * scaleX + this.cam.x;
    const worldY = (e.clientY - rect.top) * scaleY + this.cam.y;
    const hit = hitTestAgent(this.agents, worldX, worldY);
    if (hit) {
      this.selectAgent(hit);
      this.onAgentSelect?.(hit);
    }
  };

  async init() {
    this.sheets = await loadSpriteSheets(this.assetBase);
    this.selectAgent(this.selectedId ?? "razzle");
    this.onReady?.();
    this.start();
  }

  start() {
    if (this.raf) return;
    this.lastTs = performance.now();
    const tick = (ts: number) => {
      const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;

      for (const id of this.workingIds) {
        const agent = agentById(this.agents, id);
        if (agent && agent.state === "walk") {
          const desk = agent.targetTileX * TILE;
          const dist = Math.hypot(desk - agent.px, agent.targetTileY * TILE - agent.py);
          if (dist < 4) {
            agent.state = "work";
            agent.px = agent.targetTileX * TILE;
            agent.py = agent.targetTileY * TILE;
          }
        }
      }

      updateAgents(this.agents, dt, ts);
      updateCamera(this.cam, this.viewW, this.viewH);

      if (this.sheets) {
        renderRoom(this.ctx, this.agents, this.sheets, this.cam, this.viewW, this.viewH, this.selectedId);
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  selectAgent(id: AgentId) {
    this.selectedId = id;
    const agent = agentById(this.agents, id);
    if (agent) focusCameraOn(this.cam, agent.px, agent.py, this.viewW, this.viewH);
  }

  markAgentWorking(id: AgentId) {
    this.workingIds.add(id);
    setAgentWorking(this.agents, id);
  }

  clearAgentWorking(id: AgentId) {
    this.workingIds.delete(id);
    clearAgentWorking(this.agents, id);
  }

  destroy() {
    this.canvas.removeEventListener("click", this.onClick);
    window.removeEventListener("resize", this.onResize);
    this.stop();
  }
}

export { COLS, ROWS, TILE, WORLD_H, WORLD_W };
