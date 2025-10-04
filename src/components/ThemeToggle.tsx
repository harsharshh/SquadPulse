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
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className="rounded-full border border-black/10 dark:border-white/20 px-4 py-2 text-sm font-medium bg-white/70 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 transition-colors flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {variant === "icon" ? (
        theme === "light" ? "🌕" : "🌑"
      ) : (
        <>
          {theme === "light" ? "🌕 Light theme" : "🌑 Dark theme"}
        </>
      )}
    </button>
  );
}
