"use client";

import type { HTMLAttributes } from "react";

interface JokeCardProps extends HTMLAttributes<HTMLDivElement> {
  joke: string;
  onSpin: () => void;
}

const JokeCard = ({ joke, onSpin, className = "", ...rest }: JokeCardProps) => (
  <section
    data-card
    className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/75 dark:to-[#232136]/55 p-5 shadow-md ${className}`.trim()}
    {...rest}
  >
    <div className="text-4xl mb-3 text-center">🎪</div>
    <h2 className="text-lg font-semibold text-foreground text-center">Laugh break</h2>
    <p className="text-sm text-foreground/60 text-center">Humor resets the mood meter</p>
    <button
      onClick={onSpin}
      className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] py-2 text-sm font-semibold text-white hover:opacity-95"
    >
      Tell me a joke
    </button>
    <div className="mt-4 rounded-xl border border-foreground/10 bg-background/85 px-4 py-3 text-sm text-foreground/80">
      {joke}
    </div>
  </section>
);

export default JokeCard;
