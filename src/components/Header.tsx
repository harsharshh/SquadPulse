"use client";

import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
      <div className="flex items-center gap-3">
        <span className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] bg-clip-text text-transparent">
          SquadPulse
        </span>
      </div>
      <ThemeToggle />
    </header>
  );
}
