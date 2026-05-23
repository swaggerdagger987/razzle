import type { AgentAnim, AgentId } from "./constants";
import { AGENT_SPRITE_PREFIX } from "./constants";

export type SpriteSheets = Record<AgentId, Partial<Record<AgentAnim, HTMLImageElement>>>;

export async function loadSpriteSheets(assetBase: string): Promise<SpriteSheets> {
  const sheets: SpriteSheets = { razzle: {}, octo: {}, bones: {} };
  const loads: Promise<void>[] = [];

  for (const id of Object.keys(AGENT_SPRITE_PREFIX) as AgentId[]) {
    const prefix = AGENT_SPRITE_PREFIX[id];
    for (const anim of ["idle", "walk"] as AgentAnim[]) {
      loads.push(
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            sheets[id][anim] = img;
            resolve();
          };
          img.onerror = () => reject(new Error(`Failed to load ${prefix}-${anim}.png`));
          img.src = `${assetBase}/${prefix}-${anim}.png`;
        }),
      );
    }
  }

  await Promise.all(loads);
  return sheets;
}

export function drawSpriteFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  frameIndex: number,
  dx: number,
  dy: number,
  flipX: boolean,
) {
  const cols = 2;
  const frame = frameIndex % 4;
  const sx = (frame % cols) * (img.width / cols);
  const sy = Math.floor(frame / cols) * (img.height / cols);
  const sw = img.width / cols;
  const sh = img.height / cols;

  ctx.save();
  if (flipX) {
    ctx.translate(dx + 32, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, sx, sy, sw, sh, 0, dy, 32, 48);
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, 32, 48);
  }
  ctx.restore();
}
