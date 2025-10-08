"use client";

import type { HTMLAttributes } from "react";

interface QuoteCardProps extends HTMLAttributes<HTMLDivElement> {
  quote: string;
  onSpin: () => void;
}

const QuoteCard = ({ quote, onSpin, className = "", ...rest }: QuoteCardProps) => {
  return (
    <section
      data-card
      className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/75 dark:to-[#232136]/55 p-5 shadow-md ${className}`.trim()}
      {...rest}
    >
      <div className="text-4xl mb-3 text-center">🎲</div>
      <h2 className="text-lg font-semibold text-foreground text-center">Motivation booster</h2>
      <p className="text-sm text-foreground/60 text-center">Spin up a fresh reminder</p>
      <button
        onClick={onSpin}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] py-2 text-sm font-semibold text-white hover:opacity-95"
      >
        Shuffle quote
      </button>
      <div className="mt-4 rounded-xl border border-foreground/10 bg-background/85 px-4 py-3 text-sm font-medium text-foreground">
        {quote}
      </div>
    </section>
  );
};

export default QuoteCard;
