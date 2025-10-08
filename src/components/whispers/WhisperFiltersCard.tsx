"use client";

import type { Category } from "./types";
import { categoryLabels } from "./constants";
import { CategoryIcon } from "@/components/icons/WhisperCategoryIcons";

interface WhisperFiltersCardProps {
  selected: Set<Category>;
  onToggle: (category: Category) => void;
  onClear?: () => void;
}

const WhisperFiltersCard = ({ selected, onToggle, onClear }: WhisperFiltersCardProps) => {
  return (
    <section
      data-anim="filters"
      className="shrink-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-4 shadow-md"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Filters</h3>
        {onClear ? (
          <button
            onClick={onClear}
            className="text-[11px] px-2 py-0.5 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Clear
          </button>
        ) : (
          <span className="text-xs text-neutral-500">Toggle to focus</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {categoryLabels.map(({ key, label }) => {
          const active = selected.has(key);
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-[11px] leading-none ${
                active
                  ? "border-transparent text-white bg-neutral-900 dark:bg-white dark:text-neutral-900"
                  : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              <span className="inline-flex items-center justify-center group">
                <CategoryIcon kind={key} size={14} />
              </span>
              <span className={active ? "text-inherit" : "text-neutral-800 dark:text-neutral-200"}>{label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default WhisperFiltersCard;
