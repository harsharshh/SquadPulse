"use client";

import type { HTMLAttributes } from "react";

interface CheerIntroCardProps extends HTMLAttributes<HTMLDivElement> {
  headline: string;
  message: string;
  microActions: Array<{ label: string; emoji: string }>;
}

const CheerIntroCard = ({ headline, message, microActions, className = "", ...rest }: CheerIntroCardProps) => {
  return (
    <section
      data-card
      className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 via-white/80 to-white/70 dark:from-[#1a1a2e]/85 dark:to-[#232136]/60 p-8 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40 ${className}`.trim()}
      {...rest}
    >
      <p className="inline-flex items-center rounded-full border border-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
        Cheer up mode
      </p>
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-foreground">{headline}</h1>
      <p className="mt-3 max-w-2xl text-sm text-foreground/65">{message}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {microActions.map((action) => (
          <span
            key={action.label}
            className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/80 px-3 py-1 text-xs font-medium text-foreground/70"
          >
            <span>{action.emoji}</span>
            {action.label}
          </span>
        ))}
      </div>
    </section>
  );
};

export default CheerIntroCard;
