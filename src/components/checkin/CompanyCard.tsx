"use client";

import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

interface CompanyCardProps extends HTMLAttributes<HTMLDivElement> {
  teamName: string;
  orgName: string;
}

const CompanyCard = forwardRef<HTMLDivElement, CompanyCardProps>(({ teamName, orgName, className = "", ...rest }, ref) => {
  const initials = teamName
    .split(" ")
    .map((word) => word.trim()[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      ref={ref}
      data-card
      className={`rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40 flex items-center justify-between ${className}`.trim()}
      {...rest}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] via-[#fb7185] to-[#c084fc] text-white shadow-md">
          <span className="text-base font-bold leading-none">{initials}</span>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] bg-clip-text text-transparent">
              {teamName}
            </span>
          </h3>
          <p className="text-xs text-foreground/60">Team configuration</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-2.5 py-1 text-xs text-foreground/80 bg-background/60 dark:bg-foreground/10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 3l9 5-9 5-9-5 9-5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 12l9 5 9-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {orgName}
        </span>
      </div>
    </div>
  );
});

CompanyCard.displayName = "CompanyCard";

export default CompanyCard;
