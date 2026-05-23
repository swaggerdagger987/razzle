"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentId } from "./constants";
import { PixelRoomEngine } from "./runtime";

export interface PixelRoomProps {
  assetBase?: string;
  workingAgent?: AgentId | null;
  selectedAgent?: AgentId | null;
  onSelectAgent?: (id: AgentId) => void;
  className?: string;
}

export function PixelRoom({
  assetBase,
  workingAgent,
  selectedAgent,
  onSelectAgent,
  className,
}: PixelRoomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PixelRoomEngine | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const prevWorking = useRef<AgentId | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new PixelRoomEngine(canvas, {
      assetBase,
      onReady: () => setStatus("ready"),
      onAgentSelect: onSelectAgent,
    });
    engineRef.current = engine;
    void engine.init().catch(() => setStatus("error"));

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [assetBase, onSelectAgent]);

  useEffect(() => {
    if (selectedAgent && engineRef.current) {
      engineRef.current.selectAgent(selectedAgent);
    }
  }, [selectedAgent]);

  useEffect(() => {
    if (!engineRef.current) return;
    if (workingAgent) {
      engineRef.current.markAgentWorking(workingAgent);
      prevWorking.current = workingAgent;
    } else if (prevWorking.current) {
      engineRef.current.clearAgentWorking(prevWorking.current);
      prevWorking.current = null;
    }
  }, [workingAgent]);

  return (
    <div className={`canvas-area ${className ?? ""}`}>
      <p className="canvas-label">live floor feed · click an agent</p>
      <div className="canvas-container">
        {status === "loading" && (
          <p className="canvas-placeholder-text" aria-live="polite">
            pulling film...
          </p>
        )}
        {status === "error" && (
          <p className="canvas-placeholder-text" aria-live="polite">
            agents are stretching — reload to retry
          </p>
        )}
        <canvas ref={canvasRef} id="warRoomCanvas" aria-label="Pixel situation room" />
      </div>
    </div>
  );
}

export { PixelRoomEngine } from "./runtime";
