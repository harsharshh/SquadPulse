"use client";

import type { Category } from "./types";
import { categoryLabels } from "./constants";
import { CategoryIcon } from "@/components/icons/WhisperCategoryIcons";

interface WhisperComposerCardProps {
  isOpen: boolean;
  onToggle: () => void;
  composeText: string;
  onChangeText: (value: string) => void;
  composeCategory: Category;
  onSelectCategory: (category: Category) => void;
  onClear: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isEditing: boolean;
}

const WhisperComposerCard = ({
  isOpen,
  onToggle,
  composeText,
  onChangeText,
  composeCategory,
  onSelectCategory,
  onClear,
  onSubmit,
  canSubmit,
  isEditing,
}: WhisperComposerCardProps) => {
  return (
    <section>
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-md">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2" id="composer-anchor">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f97316] via-[#fb7185] to-[#c084fc]" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">What&apos;s on your mind today?</span>
          </div>
          <button
            onClick={onToggle}
            className={`text-sm px-3 py-1.5 rounded-lg font-semibold shadow-sm transition ${
              isOpen
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white hover:opacity-95"
            }`}
          >
            {isOpen ? "Hide" : "Add Whisper"}
          </button>
        </div>
        {isOpen && (
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {categoryLabels.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => onSelectCategory(key)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium leading-none border ${
                    composeCategory === key
                      ? "bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white border-transparent"
                      : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span className="inline-flex items-center justify-center group">
                    <CategoryIcon kind={key} size={16} />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-neutral-300 dark:border-neutral-700 overflow-hidden">
              <textarea
                value={composeText}
                onChange={(event) => onChangeText(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Share what's on your mind…"
                className="w-full resize-none bg-white dark:bg-neutral-900 px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
              />
              <div className="flex items-center justify-between px-3 py-2 text-xs text-neutral-500 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">Anonymous</span>
                  <span>•</span>
                  <span className="capitalize">{composeCategory}</span>
                </div>
                <span>{composeText.length}/500</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-end gap-3">
              <button
                onClick={onClear}
                className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Clear
              </button>
              <button
                onClick={onSubmit}
                disabled={!canSubmit}
                className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] hover:opacity-95 disabled:opacity-50"
              >
                {isEditing ? "Update Whisper" : "Post Whisper"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WhisperComposerCard;
