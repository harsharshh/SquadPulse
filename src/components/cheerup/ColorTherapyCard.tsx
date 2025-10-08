"use client";

import type { HTMLAttributes } from "react";

interface Palette {
  name: string;
  hex: string;
  emoji: string;
}

interface ColorTherapyCardProps extends HTMLAttributes<HTMLDivElement> {
  palette: Palette;
  onSpin: () => void;
}

const ColorTherapyCard = ({ palette, onSpin, className = "", ...rest }: ColorTherapyCardProps) => {
  return (
    <section
      data-card
      className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/75 dark:to-[#232136]/55 p-5 shadow-md text-center ${className}`.trim()}
      {...rest}
    >
      <div className="text-4xl mb-3">🎨</div>
      <h2 className="text-lg font-semibold text-foreground">Color therapy</h2>
      <p className="text-sm text-foreground/60">Refresh your visual palette</p>
      <button
        onClick={onSpin}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] py-2 text-sm font-semibold text-white hover:opacity-95"
      >
        Discover a new hue
      </button>
      <div
        className="mt-4 h-24 rounded-xl border border-foreground/10 shadow-inner flex items-center justify-center text-white text-lg font-semibold"
        style={{ backgroundColor: palette.hex }}
      >
        <span className="mr-2 text-xl">{palette.emoji}</span>
        {palette.name}
      </div>
    </section>
  );
};

export default ColorTherapyCard;
