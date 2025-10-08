"use client";

import type { HTMLAttributes, RefObject } from "react";
import MoodFace from "@/components/checkin/MoodFace";

interface MoodSnapshotCardProps extends HTMLAttributes<HTMLDivElement> {
  mood: 1 | 2 | 3 | 4 | 5;
  color: string;
  label: string;
  average: number;
  barRef?: RefObject<HTMLDivElement>;
}

const MoodSnapshotCard = ({ mood, color, label, average, barRef, className = "", ...rest }: MoodSnapshotCardProps) => {
  return (
    <section
      data-card
      className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/75 dark:to-[#232136]/55 p-5 shadow-md ${className}`.trim()}
      {...rest}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Mood snapshot</h2>
        <span className="text-xs text-foreground/60">Real-time</span>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <MoodFace mood={mood} activeColor={color} size={64} />
        <div>
          <div className="text-sm font-medium text-foreground">Feeling {label}</div>
          <div className="mt-2 text-2xl font-semibold text-foreground">{average.toFixed(1)} / 5</div>
        </div>
      </div>
      <div className="mt-4 h-2 rounded-full bg-foreground/10">
        <div ref={barRef} className="h-full rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc]" />
      </div>
    </section>
  );
};

export default MoodSnapshotCard;
