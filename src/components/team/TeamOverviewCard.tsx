"use client";

import type { HTMLAttributes } from "react";

interface OverviewMetric {
  title: string;
  description: string;
  value: string;
  delta?: string;
  accent?: string;
}

interface TeamOverviewCardProps extends HTMLAttributes<HTMLDivElement> {
  metrics: OverviewMetric[];
}

const TeamOverviewCard = ({ metrics, className = "", ...rest }: TeamOverviewCardProps) => {
  return (
    <section
      data-card
      className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 via-white/82 to-white/70 dark:from-[#1a1a2e]/85 dark:to-[#232136]/60 p-6 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40 ${className}`.trim()}
      {...rest}
    >
      <h2 className="text-lg font-semibold text-foreground">Team overview</h2>
      <p className="text-sm text-foreground/60">Rollup of today’s mood, participation, and health signals</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="rounded-xl border border-foreground/10 bg-gradient-to-tr from-white/85 to-white/60 dark:from-[#2d2250]/35 dark:to-[#1a1a2e]/25 p-4 shadow-sm"
          >
            <p className="text-xs text-foreground/55 uppercase tracking-wide">{metric.title}</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{metric.value}</p>
            <p className="mt-1 text-xs text-foreground/60">{metric.description}</p>
            {metric.delta && (
              <p className={`mt-2 inline-flex items-center text-[11px] font-semibold ${metric.accent ?? "text-emerald-500"}`}>
                {metric.delta}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export type { OverviewMetric };
export default TeamOverviewCard;
