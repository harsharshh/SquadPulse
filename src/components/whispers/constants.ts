import type { Category } from "./types";

export const categoryColors: Record<Category, string> = {
  general: "bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-900/20 dark:via-pink-900/20 dark:to-neutral-900 border-purple-200/60 dark:border-pink-800/60",
  praise: "bg-green-50 dark:bg-green-900/20 border-green-200/80 dark:border-green-800/70",
  concern: "bg-red-50 dark:bg-red-900/20 border-red-200/80 dark:border-red-800/70",
  idea: "bg-blue-50 dark:bg-blue-900/20 border-blue-200/80 dark:border-blue-800/70",
  fun: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200/80 dark:border-yellow-800/70",
};

export const categoryTheme: Record<Category, { bar: string; text: string }> = {
  general: { bar: "bg-gradient-to-r from-[#a78bfa] via-[#fb7185] to-[#fbcfe8]", text: "text-[#7c3aed]" },
  praise: { bar: "bg-gradient-to-r from-[#22c55e] to-[#34d399]", text: "text-[#16a34a]" },
  concern: { bar: "bg-gradient-to-r from-[#ef4444] to-[#fb7185]", text: "text-[#dc2626]" },
  idea: { bar: "bg-gradient-to-r from-[#3b82f6] to-[#22d3ee]", text: "text-[#2563eb]" },
  fun: { bar: "bg-gradient-to-r from-[#f59e0b] to-[#f97316]", text: "text-[#d97706]" },
};

export const categoryLabels: Array<{ key: Category; label: string }> = [
  { key: "general", label: "General" },
  { key: "praise", label: "Praise" },
  { key: "concern", label: "Concern" },
  { key: "idea", label: "Idea" },
  { key: "fun", label: "Fun" },
];

export const timeAgo = (date: Date) => {
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};
