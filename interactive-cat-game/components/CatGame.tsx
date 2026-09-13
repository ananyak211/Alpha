"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SETTINGS, type GameSettings } from "@/lib/types";
import GameCanvas from "@/components/GameCanvas";
import GameControls from "@/components/GameControls";
import GameStats from "@/components/GameStats";

export default function CatGame() {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(true);
  const [score, setScore] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleStart = useCallback(() => {
    setRunning(true);
    setPaused(false);
    setControlsOpen(false);
  }, []);

  const handlePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setRunning(true);
    setPaused(false);
    setControlsOpen(false);
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      void el.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  }, []);

  // Keyboard controls for humans.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        if (!running) {
          handleStart();
        } else {
          handlePause();
        }
      } else if (e.key === "r" || e.key === "R") {
        handleRestart();
      } else if (e.key === "Escape") {
        setControlsOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [running, handleStart, handlePause, handleRestart]);

  return (
    <div
      ref={rootRef}
      className="relative h-[100dvh] w-[100vw] overflow-hidden bg-black"
    >
      <GameCanvas
        settings={settings}
        running={running}
        paused={paused}
        reducedMotion={reducedMotion}
        onScore={() => setScore((s) => s + 1)}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <GameStats score={score} onReset={() => setScore(0)} />
        <div className="flex flex-col items-end">
          <GameControls
            open={controlsOpen}
            onToggleOpen={() => setControlsOpen((o) => !o)}
            running={running}
            paused={paused}
            settings={settings}
            onSettingsChange={setSettings}
            onStart={handleStart}
            onPause={handlePause}
            onRestart={handleRestart}
            onFullscreen={handleFullscreen}
          />
        </div>
      </div>

      {!running && !controlsOpen && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/50">
          Press Space or open settings to start
        </div>
      )}
    </div>
  );
}
