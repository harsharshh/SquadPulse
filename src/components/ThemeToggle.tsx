"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "@/components/ThemeProvider";
import { gsap } from "gsap";

interface ThemeToggleProps {
  variant?: "full" | "icon";
}

export default function ThemeToggle({ variant = "full" }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const context = useContext(ThemeContext);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const theme = context?.theme ?? "light";
  const toggleTheme = context?.toggleTheme ?? (() => {});

  useEffect(() => {
    if (!buttonRef.current) return;
    gsap.fromTo(
      buttonRef.current,
      { scale: 0.95, rotate: -5, opacity: 0.8 },
      { scale: 1, rotate: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
    );
  }, [theme]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !context) return null;

  return (
    <label
      className={`relative inline-flex items-center cursor-pointer select-none ${
        variant === "icon" ? "w-10 h-6" : "w-16 h-8"
      }`}
    >
      <input
        type="checkbox"
        checked={theme === "dark"}
        onChange={toggleTheme}
        className="sr-only peer"
        aria-label="Toggle theme"
      />
      <span
        className={`transition-colors duration-300 absolute left-0 top-0 rounded-full ${
          variant === "icon"
            ? "w-10 h-6"
            : "w-16 h-8"
        } ${
          theme === "dark"
            ? "bg-[#c084fc] dark:bg-[#c084fc]"
            : "bg-[#fb7185] dark:bg-[#fb7185]"
        }`}
      ></span>
      <span
        className={`absolute top-1 left-1 flex items-center justify-center transition-transform duration-300 rounded-full bg-white dark:bg-black shadow ${
          variant === "icon" ? "w-4 h-4" : "w-6 h-6"
        } ${
          theme === "dark"
            ? variant === "icon"
              ? "translate-x-4"
              : "translate-x-8"
            : "translate-x-0"
        }`}
      >
        {theme === "dark" ? "🌑" : "🌕"}
      </span>
      
    </label>
  );
}
