"use client";

import type { HTMLAttributes } from "react";

interface SentimentSignal {
  title: string;
  description: string;
  tone: "positive" | "caution" | "neutral";
}

interface SentimentSignalsCardProps extends HTMLAttributes<HTMLDivElement> {
  signals: SentimentSignal[];
}

const toneColor: Record<SentimentSignal["tone"], string> = {
  positive: "bg-emerald-500",
  caution: "bg-amber-500",
  neutral: "bg-slate-400",
};

const SentimentSignalsCard = ({ signals, className = "", ...rest }: SentimentSignalsCardProps) => (
  <section
    data-card
    className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 to-white/78 dark:from-[#1a1a2e]/82 dark:to-[#232136]/60 p-6 shadow-lg ${className}`.trim()}
    {...rest}
  >
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Sentiment signals</h2>
        <p className="text-sm text-foreground/60">Highlights from whispers and check-ins this week</p>
      </div>
      <span className="text-xs text-foreground/60">Auto-curated</span>
    </div>
    <ul className="mt-4 space-y-3">
      {signals.map((signal) => (
        <li key={signal.title} className="rounded-xl border border-foreground/10 bg-background/85 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${toneColor[signal.tone]}`} />
            <span className="text-sm font-semibold text-foreground">{signal.title}</span>
          </div>
          <p className="mt-2 text-sm text-foreground/70">{signal.description}</p>
        </li>
      ))}
    </ul>
  </section>
);

export type { SentimentSignal };
export default SentimentSignalsCard;
