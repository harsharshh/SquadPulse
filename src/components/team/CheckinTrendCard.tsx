"use client";

import type { HTMLAttributes } from "react";

interface CheckinPoint {
  label: string;
  value: number;
  positive?: number;
  neutral?: number;
  negative?: number;
}

interface CheckinTrendCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  range: string;
  ranges: string[];
  data: CheckinPoint[];
  onRangeChange: (range: string) => void;
}

const CheckinTrendCard = ({ title, range, ranges, data, onRangeChange, className = "", ...rest }: CheckinTrendCardProps) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <section
      data-card
      className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 to-white/75 dark:from-[#1a1a2e]/82 dark:to-[#232136]/60 p-6 shadow-lg ${className}`.trim()}
      {...rest}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-foreground/60">Daily mood check-ins across the selected window</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/70 px-2 py-1 text-xs font-medium text-foreground/70">
          {ranges.map((option) => (
            <button
              key={option}
              onClick={() => onRangeChange(option)}
              className={`rounded-full px-2.5 py-1 transition ${
                range === option ? "bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white" : "hover:bg-foreground/10"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {data.map((point) => {
          const height = Math.round((point.value / maxValue) * 100);
          return (
            <div key={point.label} className="rounded-xl border border-foreground/10 bg-background/80 p-4 flex flex-col gap-3">
              <div className="text-sm font-medium text-foreground/70">{point.label}</div>
              <div className="flex-1 flex items-end gap-1">
                {point.positive !== undefined || point.neutral !== undefined || point.negative !== undefined ? (
                  <div className="relative h-28 w-full overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-green-400/80"
                      style={{ height: `${((point.positive ?? 0) / maxValue) * 100}%` }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-amber-300/80"
                      style={{ height: `${((point.neutral ?? 0) / maxValue) * 100}%` }}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-rose-400/80"
                      style={{ height: `${((point.negative ?? 0) / maxValue) * 100}%` }}
                    />
                  </div>
                ) : (
                  <div className="h-28 w-full rounded-lg border border-foreground/10 bg-foreground/5 flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="text-sm font-semibold text-foreground">{point.value} check-ins</div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export type { CheckinPoint };
export default CheckinTrendCard;
