"use client";

import type { HTMLAttributes } from "react";
import MoodFace from "./MoodFace";
import { moodOptions } from "./constants";

export interface CheckInHistoryItem {
  date: string;
  mood: number;
  note?: string;
}

interface RecentCheckinsCardProps extends HTMLAttributes<HTMLDivElement> {
  history: CheckInHistoryItem[];
  onSelectEntry: (index: number) => void;
}

const RecentCheckinsCard = ({ history, onSelectEntry, className = "", ...rest }: RecentCheckinsCardProps) => {
  return (
    <div
      data-card
      className={`flex-1 overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40 ${className}`.trim()}
      {...rest}
    >
      <div className="p-5 flex flex-col h-full">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Your recent check-ins</h3>
        <div className="flex-1 overflow-y-auto pr-2">
          <ul className="space-y-2">
            {history.map((entry, idx) => {
              const mood = moodOptions.find((option) => option.value === entry.mood);
              const color = mood?.colorHex ?? "#9ca3af";
              const label = mood?.label ?? `Mood ${entry.mood}`;

              return (
                <li
                  key={`${entry.date}-${idx}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectEntry(idx)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectEntry(idx);
                    }
                  }}
                  className="cursor-pointer rounded-xl border border-foreground/10 bg-gradient-to-tr from-white/80 to-white/60 dark:from-[#2d2250]/30 dark:to-[#1a1a2e]/30 px-3 py-2 shadow-sm transition hover:shadow hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-[#c084fc]/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        <MoodFace mood={entry.mood as 1 | 2 | 3 | 4 | 5} activeColor={color} size={32} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {label} <span className="ml-1 text-foreground/60">· {entry.mood}</span>
                        </div>
                        {entry.note && <div className="text-xs text-foreground/70 line-clamp-1">{entry.note}</div>}
                      </div>
                    </div>
                    <div className="text-xs text-foreground/60">{entry.date}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecentCheckinsCard;
