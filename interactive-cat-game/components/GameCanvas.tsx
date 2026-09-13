"use client";

import { useEffect, useRef, useState } from "react";
import type { GameSettings } from "@/lib/types";
import { playCatchSound, playDirectionChangeSound } from "@/lib/sound";

interface GameCanvasProps {
  settings: GameSettings;
  running: boolean;
  paused: boolean;
  reducedMotion: boolean;
  onScore: () => void;
}

interface Pulse {
  id: number;
  x: number;
  y: number;
}

const TWO_PI = Math.PI * 2;

function randomRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function speedToPxPerSecond(speed: number, reducedMotion: boolean) {
  const base = 35 + speed * 30; // speed 1 -> 65px/s, speed 10 -> 335px/s
  return reducedMotion ? Math.min(base, 120) : base;
}

export default function GameCanvas({
  settings,
  running,
  paused,
  reducedMotion,
  onScore,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const boundsRef = useRef({ width: 0, height: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const angleRef = useRef(Math.random() * TWO_PI);
  const pauseUntilRef = useRef(0);
  const nextTurnAtRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const settingsRef = useRef(settings);
  const reducedMotionRef = useRef(reducedMotion);
  const pulseIdRef = useRef(0);

  const [pulses, setPulses] = useState<Pulse[]>([]);

  settingsRef.current = settings;
  reducedMotionRef.current = reducedMotion;

  // Keep bounds in sync with viewport size.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function updateBounds() {
      const rect = el!.getBoundingClientRect();
      boundsRef.current = { width: rect.width, height: rect.height };
      const radius = settingsRef.current.dotSize / 2;
      posRef.current.x = Math.min(
        Math.max(posRef.current.x, radius),
        Math.max(rect.width - radius, radius)
      );
      posRef.current.y = Math.min(
        Math.max(posRef.current.y, radius),
        Math.max(rect.height - radius, radius)
      );
    }

    updateBounds();
    if (posRef.current.x === 0 && posRef.current.y === 0) {
      posRef.current = {
        x: boundsRef.current.width / 2,
        y: boundsRef.current.height / 2,
      };
    }

    const observer = new ResizeObserver(updateBounds);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animation loop.
  useEffect(() => {
    function pickNewAngle(spreadRadians: number) {
      angleRef.current += randomRange(-spreadRadians, spreadRadians);
    }

    function maybePlayDirectionSound() {
      if (settingsRef.current.soundEnabled) playDirectionChangeSound();
    }

    function step(time: number) {
      rafRef.current = requestAnimationFrame(step);

      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      if (!running || paused) return;

      const { width, height } = boundsRef.current;
      if (width === 0 || height === 0) return;

      const settings = settingsRef.current;
      const reduced = reducedMotionRef.current;
      const radius = settings.dotSize / 2;

      // Brief random pauses, like prey freezing.
      if (time < pauseUntilRef.current) {
        renderPosition();
        return;
      }
      if (!reduced && Math.random() < 0.002) {
        pauseUntilRef.current = time + randomRange(150, 450);
      }

      // Direction changes depend on movement mode.
      if (time >= nextTurnAtRef.current) {
        const mode = reduced ? "smooth" : settings.movementMode;
        if (mode === "smooth") {
          pickNewAngle(0.35);
          nextTurnAtRef.current = time + randomRange(500, 1200);
        } else if (mode === "random") {
          pickNewAngle(Math.PI);
          nextTurnAtRef.current = time + randomRange(600, 1600);
          maybePlayDirectionSound();
        } else {
          // erratic
          pickNewAngle(Math.PI * 1.3);
          nextTurnAtRef.current = time + randomRange(200, 600);
          maybePlayDirectionSound();
        }
      } else if (!reduced && settings.movementMode !== "erratic") {
        // Gentle continuous drift so the path never looks perfectly straight.
        pickNewAngle(0.05);
      }

      // Occasional quick directional burst.
      if (!reduced && Math.random() < 0.0015) {
        pickNewAngle(Math.PI * 0.8);
        maybePlayDirectionSound();
      }

      const pxPerSecond = speedToPxPerSecond(settings.speed, reduced);
      let vx = Math.cos(angleRef.current) * pxPerSecond;
      let vy = Math.sin(angleRef.current) * pxPerSecond;

      let nx = posRef.current.x + vx * dt;
      let ny = posRef.current.y + vy * dt;

      const minX = radius;
      const maxX = Math.max(width - radius, radius);
      const minY = radius;
      const maxY = Math.max(height - radius, radius);

      let bounced = false;
      if (nx <= minX || nx >= maxX) {
        nx = Math.min(Math.max(nx, minX), maxX);
        angleRef.current = Math.PI - angleRef.current + randomRange(-0.3, 0.3);
        bounced = true;
      }
      if (ny <= minY || ny >= maxY) {
        ny = Math.min(Math.max(ny, minY), maxY);
        angleRef.current = -angleRef.current + randomRange(-0.3, 0.3);
        bounced = true;
      }
      if (bounced) maybePlayDirectionSound();

      posRef.current = { x: nx, y: ny };
      renderPosition();
    }

    function renderPosition() {
      const dot = dotRef.current;
      if (!dot) return;
      const { x, y } = posRef.current;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [running, paused]);

  function handleCatch(clientX: number, clientY: number) {
    if (!running || paused) return;
    onScore();

    setPulses((prev) => [
      ...prev,
      { id: pulseIdRef.current++, x: posRef.current.x, y: posRef.current.y },
    ]);

    if (settingsRef.current.soundEnabled) playCatchSound();

    const { width, height } = boundsRef.current;
    const radius = settingsRef.current.dotSize / 2;
    posRef.current = {
      x: randomRange(radius, Math.max(width - radius, radius)),
      y: randomRange(radius, Math.max(height - radius, radius)),
    };
    angleRef.current = Math.random() * TWO_PI;
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full touch-none select-none"
      style={{ background: "#000000" }}
    >
      <div
        ref={dotRef}
        role="button"
        tabIndex={-1}
        aria-label="Moving dot, catch it to score"
        onPointerDown={(e) => {
          e.preventDefault();
          handleCatch(e.clientX, e.clientY);
        }}
        className="dot-transition absolute left-0 top-0 rounded-full"
        style={{
          width: settings.dotSize,
          height: settings.dotSize,
          background: settings.dotColor,
          boxShadow: `0 0 ${settings.dotSize}px ${Math.round(
            settings.dotSize / 2
          )}px ${settings.dotColor}66, 0 0 ${settings.dotSize / 2}px ${
            settings.dotColor
          }`,
          cursor: "pointer",
        }}
      />

      {pulses.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute rounded-full border-2"
          style={{
            left: p.x,
            top: p.y,
            width: settings.dotSize,
            height: settings.dotSize,
            marginLeft: -settings.dotSize / 2,
            marginTop: -settings.dotSize / 2,
            borderColor: settings.dotColor,
            animation: "pulse-ring 500ms ease-out forwards",
          }}
          onAnimationEnd={() =>
            setPulses((prev) => prev.filter((x) => x.id !== p.id))
          }
        />
      ))}

      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
