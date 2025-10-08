"use client";

import type { HTMLAttributes } from "react";

interface QuickTipsCardProps extends HTMLAttributes<HTMLDivElement> {
  tips: string[];
}

const QuickTipsCard = ({ tips, className = "", ...rest }: QuickTipsCardProps) => (
  <section
    data-card
    className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/94 to-white/78 dark:from-[#1a1a2e]/85 dark:to-[#232136]/62 p-5 shadow-lg ${className}`.trim()}
    {...rest}
  >
    <h2 className="text-lg font-semibold text-foreground">Quick reset tips</h2>
    <ul className="mt-3 space-y-2 text-sm text-foreground/70">
      {tips.map((tip) => (
        <li key={tip}>• {tip}</li>
      ))}
    </ul>
  </section>
);

export default QuickTipsCard;
