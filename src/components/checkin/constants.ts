export const moodOptions = [
  { emoji: "😢", label: "Terrible", value: 1, colorHex: "#ef4444", ring: "ring-red-400/40" },
  { emoji: "😔", label: "Bad", value: 2, colorHex: "#f97316", ring: "ring-orange-400/40" },
  { emoji: "😐", label: "Okay", value: 3, colorHex: "#f59e0b", ring: "ring-yellow-400/40" },
  { emoji: "😊", label: "Good", value: 4, colorHex: "#10b981", ring: "ring-green-400/40" },
  { emoji: "🤩", label: "Amazing", value: 5, colorHex: "#3b82f6", ring: "ring-blue-400/40" },
] as const;

export type MoodOption = (typeof moodOptions)[number];

export const hexToRgba = (hex: string, alpha = 0.12) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
