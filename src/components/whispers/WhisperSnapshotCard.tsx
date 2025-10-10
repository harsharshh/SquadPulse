"use client";

import type { Category } from "./types";
import Pie3D from "./Pie3D";

interface LegendItem {
  key: Category;
  color: string;
  label: string;
  count: number;
}

interface WhisperSnapshotCardProps {
  totalPosts: number;
  pieData: Array<{ key: Category; value: number; color: string; label: string }>;
  legendItems: LegendItem[];
}

const WhisperSnapshotCard = ({ totalPosts, pieData, legendItems }: WhisperSnapshotCardProps) => {
  const hasData = totalPosts > 0;

  return (
    <section
      data-anim="snapshot"
      className="shrink-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-4 shadow-md"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Snapshot</h3>
        <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
          <span>Total posts</span>
          <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 tabular-nums">
            {totalPosts}
          </span>
        </span>
      </div>

      {hasData ? (
        <>
          <Pie3D data={pieData} />

          <ul className="mt-3 space-y-2">
            {legendItems.map((item) => (
              <li key={item.key} className="flex items-center justify-between px-2 ">
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-neutral-700 dark:text-neutral-300 inline-flex items-center gap-1">
                    {item.label}
                  </span>
                </div>
                <span className="tabular-nums text-neutral-700 dark:text-neutral-300 text-sm">{item.count}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-300/70 dark:border-neutral-700/70 bg-neutral-50/60 dark:bg-neutral-900/40 px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          No whispers yet — once teammates post, you’ll see the distribution here.
        </div>
      )}
    </section>
  );
};

export default WhisperSnapshotCard;
