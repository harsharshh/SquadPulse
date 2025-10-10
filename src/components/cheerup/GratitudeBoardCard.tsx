"use client";

import type { HTMLAttributes } from "react";
import MoodFace from "@/components/checkin/MoodFace";

interface GratitudeBoardCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  entries: string[];
  newEntry: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const GratitudeBoardCard = ({ entries, newEntry, onChange, onAdd, onRemove, className = "", ...rest }: GratitudeBoardCardProps) => {
  return (
    <section
      data-card
      className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/95 to-white/75 dark:from-[#1a1a2e]/82 dark:to-[#232136]/60 p-5 shadow-lg ${className}`.trim()}
      {...rest}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Gratitude board</h2>
          <p className="text-sm text-foreground/60">Capture bright moments as they happen</p>
        </div>
        <MoodFace mood={5} activeColor="#fb7185" size={48} />
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newEntry}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder="I&apos;m grateful for..."
          className="flex-1 rounded-xl border border-foreground/15 bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-transparent focus:ring-2 focus:ring-[#fb7185]"
        />
        <button
          onClick={onAdd}
          className="rounded-xl bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
        >
          Add
        </button>
      </div>
      <ul className="mt-4 space-y-2 max-h-44 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <li className="rounded-xl border border-foreground/10 bg-background/80 px-4 py-3 text-sm text-foreground/70">
            Start logging little sparks of joy throughout the day.
          </li>
        ) : (
          entries.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center justify-between rounded-xl border border-foreground/10 bg-background/80 px-4 py-3 text-sm text-foreground/80"
            >
              <span>✨ {item}</span>
              <button
                onClick={() => onRemove(index)}
                className="text-foreground/40 hover:text-foreground/80"
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
};

export default GratitudeBoardCard;
