"use client";

export const IconHeart = ({ filled }: { filled?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={`w-5 h-5 ${filled ? "fill-current" : "fill-none"} stroke-current`}
  >
    <path
      strokeWidth="1.8"
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
    />
  </svg>
);

export const IconComment = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 stroke-current"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      strokeWidth="1.8"
      d="M21 12a8.96 8.96 0 0 1-2.64 6.36A9 9 0 0 1 5.1 19L3 21l.6-2.9A9 9 0 1 1 21 12z"
    />
  </svg>
);

export const IconShare = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 stroke-current"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      strokeWidth="1.8"
      d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v12"
    />
  </svg>
);
