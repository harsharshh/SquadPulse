"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pages = [
  { name: "Mood Check-in", path: "/checkin", emoji: "📊" },
  { name: "Whisper Wall", path: "/whispers", emoji: "💭" },
  { name: "CheerUp Mode", path: "/play", emoji: "🎉" },
];

export default function PageNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Don't show navigation on home page
  if (pathname === "/") {
    return null;
  }
  
  const currentPage = pages.find(page => page.path === pathname) || pages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
      >
        <span className="text-lg">{currentPage.emoji}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentPage.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
            <div className="py-2">
              {pages.map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 ${
                    pathname === page.path
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-lg">{page.emoji}</span>
                  <span className="font-medium">{page.name}</span>
                  {pathname === page.path && (
                    <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                      ✓
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
