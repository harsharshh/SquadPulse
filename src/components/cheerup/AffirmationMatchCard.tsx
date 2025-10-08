"use client";

import type { HTMLAttributes } from "react";

const affirmations = [
  { prompt: "I celebrate", match: "small wins" },
  { prompt: "I release", match: "today's stress" },
  { prompt: "I am", match: "enough" },
  { prompt: "I choose", match: "joy" },
  { prompt: "I appreciate", match: "my progress" },
];

interface AffirmationMatchCardProps extends HTMLAttributes<HTMLDivElement> {
  onShuffle: () => void;
  pairs: typeof affirmations;
}

const AffirmationMatchCard = ({ onShuffle, pairs, className = "", ...rest }: AffirmationMatchCardProps) => (
  <section
    data-card
    className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/75 dark:to-[#232136]/55 p-5 shadow-md ${className}`.trim()}
    {...rest}
  >
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Affirmation match</h2>
        <p className="text-sm text-foreground/60">Pair prompts with uplifting endings</p>
      </div>
      <button
        onClick={onShuffle}
        className="rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-4 py-2 text-xs font-semibold text-white hover:opacity-95"
      >
        Shuffle pairs
      </button>
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {pairs.map((pair) => (
        <div key={pair.prompt} className="rounded-xl border border-foreground/10 bg-background/80 px-4 py-3 text-sm text-foreground/75">
          <span className="font-semibold text-foreground">{pair.prompt}</span> <span className="text-foreground/60">→</span> {pair.match}
        </div>
      ))}
    </div>
  </section>
);

export { affirmations };
export default AffirmationMatchCard;
