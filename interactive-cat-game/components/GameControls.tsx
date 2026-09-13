"use client";

import type { GameSettings, MovementMode } from "@/lib/types";
import { DOT_SIZE_MAX, DOT_SIZE_MIN } from "@/lib/types";
import ColorSelector from "@/components/ColorSelector";
import SpeedControl from "@/components/SpeedControl";

interface GameControlsProps {
  open: boolean;
  onToggleOpen: () => void;
  running: boolean;
  paused: boolean;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  onFullscreen: () => void;
}

const MOVEMENT_MODES: MovementMode[] = ["smooth", "random", "erratic"];

export default function GameControls({
  open,
  onToggleOpen,
  running,
  paused,
  settings,
  onSettingsChange,
  onStart,
  onPause,
  onRestart,
  onFullscreen,
}: GameControlsProps) {
  function update<K extends keyof GameSettings>(key: K, value: GameSettings[K]) {
    onSettingsChange({ ...settings, [key]: value });
  }

  return (
    <>
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        aria-controls="game-controls-panel"
        aria-label={open ? "Hide controls" : "Show controls"}
        className="pointer-events-auto rounded-full bg-black/50 p-2.5 text-white/80 backdrop-blur hover:bg-black/70 hover:text-white"
      >
        {open ? "✕" : "⚙"}
      </button>

      {open && (
        <div
          id="game-controls-panel"
          className="pointer-events-auto mt-2 w-72 max-w-[85vw] space-y-4 rounded-2xl border border-white/10 bg-black/70 p-4 text-white backdrop-blur-md"
        >
          <div className="flex gap-2">
            {!running || paused ? (
              <button
                type="button"
                onClick={onStart}
                className="flex-1 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium hover:bg-sky-400"
              >
                {running ? "Resume" : "Start Game"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onPause}
                className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
              >
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={onRestart}
              className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
            >
              Restart
            </button>
          </div>

          <SpeedControl
            value={settings.speed}
            onChange={(speed) => update("speed", speed)}
          />

          <div>
            <label htmlFor="dot-size-range" className="mb-1 flex justify-between text-sm text-white/80">
              <span>Dot size</span>
              <span>{settings.dotSize}px</span>
            </label>
            <input
              id="dot-size-range"
              type="range"
              min={DOT_SIZE_MIN}
              max={DOT_SIZE_MAX}
              step={2}
              value={settings.dotSize}
              onChange={(e) => update("dotSize", Number(e.target.value))}
              className="w-full accent-sky-400"
            />
          </div>

          <ColorSelector
            value={settings.dotColor}
            onChange={(hex) => update("dotColor", hex)}
          />

          <div>
            <label htmlFor="movement-mode" className="mb-1 block text-sm text-white/80">
              Movement mode
            </label>
            <select
              id="movement-mode"
              value={settings.movementMode}
              onChange={(e) => update("movementMode", e.target.value as MovementMode)}
              className="w-full rounded-lg border border-white/20 bg-black/60 px-2 py-1.5 text-sm capitalize"
            >
              {MOVEMENT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="sound-toggle" className="text-sm text-white/80">
              Sound
            </label>
            <input
              id="sound-toggle"
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => update("soundEnabled", e.target.checked)}
              className="h-4 w-4 accent-sky-400"
            />
          </div>

          <button
            type="button"
            onClick={onFullscreen}
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
          >
            Fullscreen
          </button>

          <p className="text-xs text-white/40">
            Keyboard: Space = pause/resume, R = restart
          </p>
        </div>
      )}
    </>
  );
}
