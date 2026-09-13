"use client";

import { DOT_COLORS } from "@/lib/types";

interface ColorSelectorProps {
  value: string;
  onChange: (hex: string) => void;
}

export default function ColorSelector({ value, onChange }: ColorSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-white/80">
        Dot color
      </legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Dot color">
        {DOT_COLORS.map((color) => {
          const selected = color.hex.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={color.hex}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={color.name}
              title={color.name}
              onClick={() => onChange(color.hex)}
              className={`h-8 w-8 rounded-full border-2 transition ${
                selected
                  ? "border-white scale-110"
                  : "border-white/20 hover:border-white/50"
              }`}
              style={{ background: color.hex }}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
