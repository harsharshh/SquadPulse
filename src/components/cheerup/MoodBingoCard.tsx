"use client";

import type { HTMLAttributes } from "react";

interface MoodBingoCardProps extends HTMLAttributes<HTMLDivElement> {
  board: string[][];
}

const MoodBingoCard = ({ board, className = "", ...rest }: MoodBingoCardProps) => {
  return (
    <section
      data-card
      className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/95 to-white/75 dark:from-[#1a1a2e]/82 dark:to-[#232136]/60 p-5 shadow-lg ${className}`.trim()}
      {...rest}
    >
      <h2 className="text-lg font-semibold text-foreground">Mood bingo</h2>
      <p className="text-sm text-foreground/60">Tick off the joyful micro-wins you collect today</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {board.flat().map((cell) => (
          <div
            key={cell}
            className="rounded-xl border border-foreground/10 bg-background/80 px-3 py-3 text-[12px] text-center font-medium text-foreground/70"
          >
            {cell}
          </div>
        ))}
      </div>
    </section>
  );
};

export default MoodBingoCard;
