"use client";

import type { HTMLAttributes } from "react";

const allEmojis = ["😀", "😄", "😁", "😆", "😎", "😍", "🤩", "🥳", "🤠", "😇"];

interface EmojiMemoryGameCardProps extends HTMLAttributes<HTMLDivElement> {
  pool: string[];
  revealed: string[];
  onReveal: () => void;
}

const EmojiMemoryGameCard = ({ pool, revealed, onReveal, className = "", ...rest }: EmojiMemoryGameCardProps) => (
  <section
    data-card
    className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/94 to-white/78 dark:from-[#1a1a2e]/85 dark:to-[#232136]/62 p-5 shadow-lg ${className}`.trim()}
    {...rest}
  >
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Emoji memory</h2>
        <p className="text-sm text-foreground/60">Reveal the trio and remember the joy</p>
      </div>
      <button
        onClick={onReveal}
        className="rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
      >
        Reveal pattern
      </button>
    </div>
    <div className="mt-4 grid grid-cols-5 gap-2">
      {pool.map((emoji, idx) => (
        <div
          key={`${emoji}-${idx}`}
          className={`rounded-xl border border-foreground/10 px-3 py-4 text-center text-xl ${
            revealed.includes(emoji) ? "bg-gradient-to-br from-[#fb7185] to-[#f97316] text-white" : "bg-background/80 text-foreground/60"
          }`}
        >
          {emoji}
        </div>
      ))}
    </div>
  </section>
);

export { allEmojis };
export default EmojiMemoryGameCard;
