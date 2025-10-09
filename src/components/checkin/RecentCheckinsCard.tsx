"use client";

import type { HTMLAttributes } from "react";
import MoodFace from "./MoodFace";
import { moodOptions } from "./constants";

export interface CheckInHistoryItem {
  id: string;
  createdAt: string;
  mood: number;
  note?: string | null;
  teamName?: string | null;
}

interface RecentCheckinsCardProps extends HTMLAttributes<HTMLDivElement> {
  history: CheckInHistoryItem[];
  onSelectEntry: (checkinId: string) => void;
}

function formatHistoryDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
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
        <div className="relative flex-1 overflow-y-auto pr-2">
          {history.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-foreground/15 bg-foreground/[.03] text-center">
              <span className="text-3xl" role="img" aria-label="No check-ins">
                🗒️
              </span>
              <p className="px-6 text-sm font-medium text-foreground/60">
                Your recent check-ins will appear here after you log a mood.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {history.map((entry) => {
                const mood = moodOptions.find((option) => option.value === entry.mood);
                const color = mood?.colorHex ?? "#9ca3af";
                const label = mood?.label ?? `Mood ${entry.mood}`;

                return (
                  <li
                    key={entry.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectEntry(entry.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectEntry(entry.id);
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
                          {entry.teamName && <div className="text-[11px] text-foreground/50">{entry.teamName}</div>}
                        </div>
                      </div>
                      <div className="text-xs text-foreground/60">{formatHistoryDate(entry.createdAt)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentCheckinsCard;
