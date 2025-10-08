"use client";

import type { FormEvent } from "react";
import CelebrationFace from "./CelebrationFace";
import MoodFace from "./MoodFace";
import { hexToRgba, moodOptions } from "./constants";

interface CheckInCardProps {
  isSubmitted: boolean;
  selectedMood: number | null;
  selectedMoodColor: string | null;
  comment: string;
  isSubmitting: boolean;
  onSelectMood: (value: number) => void;
  onCommentChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  className?: string;
}

const CheckInCard = ({
  isSubmitted,
  selectedMood,
  selectedMoodColor,
  comment,
  isSubmitting,
  onSelectMood,
  onCommentChange,
  onSubmit,
  onReset,
  className = "",
}: CheckInCardProps) => {
  const cardStyle = selectedMoodColor
    ? {
        backgroundImage: `linear-gradient(to bottom right, ${hexToRgba(selectedMoodColor, 0.15)}, transparent), linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))`,
      }
    : undefined;

  return (
    <div
      data-card
      className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40 ${className}`.trim()}
      style={cardStyle}
    >
      {isSubmitted ? (
        <div className="text-center">
          <div className="mb-6 flex flex-col items-center" data-celebrate>
            <div className="mb-4">
              <CelebrationFace />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-foreground">Thanks for checking in!</h2>
            <p className="mb-6 text-foreground/70">Your mood has been recorded. See you tomorrow.</p>
          </div>
          <button
            onClick={onReset}
            className="rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-5 py-3 font-medium text-white transition hover:opacity-95"
          >
            Submit Another Check-in
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <h4 className="mb-4 text-center text-md font-semibold text-foreground">Rate Your Mood</h4>
            <div className="grid grid-cols-5 gap-3">
              {moodOptions.map((mood) => {
                const active = selectedMood === mood.value;
                return (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => onSelectMood(mood.value)}
                    className={[
                      "group rounded-xl border-2 p-4 transition-all duration-200 focus:outline-none hover:border-foreground/25 hover:-translate-y-0.5",
                      active ? `border-transparent ring-4 ${mood.ring}` : "border-foreground/15 bg-background/80 dark:bg-foreground/5",
                    ].join(" ")}
                    style={active ? { backgroundColor: hexToRgba(mood.colorHex, 0.15) } : undefined}
                  >
                    <div className="mb-2 flex items-center justify-center">
                      <MoodFace mood={mood.value as 1 | 2 | 3 | 4 | 5} activeColor={mood.colorHex} size={72} />
                    </div>
                    <div className="text-xs font-medium">{mood.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="mb-2 block text-sm font-medium text-foreground/90">
              Any additional thoughts to share anonymously ?
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(event) => onCommentChange(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-foreground/15 bg-background/80 px-4 py-3 text-foreground placeholder:text-foreground/40 focus:border-transparent focus:ring-2 dark:bg-foreground/5"
              placeholder="Share what's on your mind..."
              style={selectedMoodColor ? { outlineColor: selectedMoodColor, boxShadow: `0 0 0 2px ${hexToRgba(selectedMoodColor, 0.45)}` } : undefined}
            />
          </div>

          <button
            type="submit"
            disabled={!selectedMood || isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] py-4 text-lg font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : "Submit Check-in"}
          </button>
        </form>
      )}
    </div>
  );
};

export default CheckInCard;
