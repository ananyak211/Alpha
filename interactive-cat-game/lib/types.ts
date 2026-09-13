export type MovementMode = "smooth" | "random" | "erratic";

export interface DotColorOption {
  name: string;
  hex: string;
}

// Cat-friendly presets. Blue/cyan/green/yellow are more distinguishable to
// cats than red, since cats are dichromats (weak red-green discrimination).
export const DOT_COLORS: DotColorOption[] = [
  { name: "Bright Blue", hex: "#00AFFF" },
  { name: "Cyan", hex: "#00FFFF" },
  { name: "Blue-Green", hex: "#00E5A8" },
  { name: "Yellow-Green", hex: "#B8FF00" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "White", hex: "#FFFFFF" },
];

export const DEFAULT_DOT_COLOR = DOT_COLORS[0].hex;

export const SPEED_MIN = 1;
export const SPEED_MAX = 10;
export const DEFAULT_SPEED = 5;

export const DOT_SIZE_MIN = 12;
export const DOT_SIZE_MAX = 60;
export const DEFAULT_DOT_SIZE = 24;

export const BACKGROUND_COLOR = "#000000";

export interface GameSettings {
  speed: number;
  dotColor: string;
  dotSize: number;
  movementMode: MovementMode;
  soundEnabled: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  speed: DEFAULT_SPEED,
  dotColor: DEFAULT_DOT_COLOR,
  dotSize: DEFAULT_DOT_SIZE,
  movementMode: "random",
  soundEnabled: false,
};
