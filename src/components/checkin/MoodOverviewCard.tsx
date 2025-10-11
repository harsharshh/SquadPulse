"use client";

import { forwardRef } from "react";
import type { HTMLAttributes, RefObject } from "react";
import MoodFace from "./MoodFace";

interface TeamStats {
  avg: number;
  total: number;
  updated: string;
}

interface MoodOverviewCardProps extends HTMLAttributes<HTMLDivElement> {
  mood: 1 | 2 | 3 | 4 | 5;
  moodColor: string;
  stats: TeamStats;
  progressRef?: RefObject<HTMLDivElement | null>;
  title?: string;
}

const MoodOverviewCard = forwardRef<HTMLDivElement, MoodOverviewCardProps>(
  ({ mood, moodColor, stats, progressRef, title = "Your mood overview", className = "", ...rest }, ref) => {
    return (
      <div
        ref={ref}
        data-card
        className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40 ${className}`.trim()}
        {...rest}
      >
        <div className="mb-3 flex items-center gap-3">
          <MoodFace mood={mood} activeColor={moodColor} size={48} />
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>
        </div>

        <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-foreground/10" style={{ background: "aliceblue" }}>
          <div
            ref={progressRef}
            className="h-full origin-center rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc]"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-foreground/10 bg-gradient-to-tr from-white/80 to-white/60 dark:from-[#2d2250]/40 dark:to-[#1a1a2e]/30 shadow-sm p-3 text-center">
            <div className="text-xs text-foreground/60">Average</div>
            <div className="text-2xl font-extrabold tracking-tight" style={{ color: moodColor }}>
              {stats.avg}
              <span className="ml-1 align-top text-[10px] font-semibold text-foreground/60">/ 5</span>
            </div>
          </div>
          <div className="rounded-xl border border-foreground/10 bg-gradient-to-tr from-white/80 to-white/60 dark:from-[#2d2250]/40 dark:to-[#1a1a1a]/30 shadow-sm p-3 text-center">
            <div className="text-xs text-foreground/60">Check‑ins</div>
            <div className="text-xl font-semibold text-foreground">{stats.total}</div>
          </div>
          <div className="rounded-xl border border-foreground/10 bg-gradient-to-tr from-white/80 to-white/60 dark:from-[#2d2250]/40 dark:to-[#1a1a2e]/30 shadow-sm p-3 text-center">
            <div className="text-xs text-foreground/60">Updated</div>
            <div className="text-sm font-medium text-foreground">{stats.updated}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-hidden>
          {[...Array(12)].map((_, index) => (
            <span
              key={index}
              className="h-2 w-2 rounded-full bg-foreground/15"
              style={{ opacity: 0.6 + ((index % 3) * 0.1) }}
            />
          ))}
        </div>
      </div>
    );
  }
);

MoodOverviewCard.displayName = "MoodOverviewCard";

export default MoodOverviewCard;
