"use client";

import type { HTMLAttributes } from "react";

interface BreathingCardProps extends HTMLAttributes<HTMLDivElement> {
  phase: "Inhale" | "Hold" | "Exhale";
  remaining: number;
  onStart: () => void;
}

const phaseEmoji: Record<BreathingCardProps["phase"], string> = {
  Inhale: "🫁",
  Hold: "⏸️",
  Exhale: "😮‍💨",
};

const BreathingCard = ({ phase, remaining, onStart, className = "", ...rest }: BreathingCardProps) => {
  const progress = (9 - remaining) / 9;

  return (
    <section
      data-card
      className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-5 shadow-lg ${className}`.trim()}
      {...rest}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Breathing exercise</h2>
          <p className="text-sm text-foreground/60">Three 3-3-3 cycles to reset focus</p>
        </div>
        <span className="text-xs text-foreground/60">Guided</span>
      </div>
      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="text-5xl">{phaseEmoji[phase]}</div>
        <div className="text-lg font-semibold text-foreground">{phase}</div>
        <div className="text-xs text-foreground/60">{remaining} beats remaining</div>
        {remaining === 0 ? (
          <button
            onClick={onStart}
            className="rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-6 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            Begin guided breathing
          </button>
        ) : (
          <div className="h-2 w-full rounded-full bg-foreground/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#fb7185] to-[#c084fc]"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default BreathingCard;
