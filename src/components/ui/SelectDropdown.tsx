"use client";

import { useEffect, useRef, useState } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectDropdownProps = {
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

const SelectDropdown = ({
  value,
  options,
  onChange,
  placeholder = "Select",
  className = "",
  disabled = false,
}: SelectDropdownProps) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!open) return;
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open && !disabled && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (open && event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption?.label ?? "";

  return (
    <div className={`relative z-30 ${disabled ? "opacity-60" : ""} ${className}`} onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((state) => !state);
        }}
        disabled={disabled}
        className={`w-full rounded-xl border border-foreground/15 bg-background/80 px-3 py-2 text-left text-foreground shadow-sm transition focus:border-transparent focus:ring-2 focus:ring-[#c084fc] dark:bg-foreground/5 ${
          disabled ? "cursor-not-allowed" : ""
        }`}
      >
        <span className="block truncate text-sm">{selectedLabel || placeholder}</span>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && !disabled && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-foreground/15 bg-white p-1.5 shadow-xl outline-none dark:bg-[#0b0b16]"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-foreground/10 hover:text-foreground ${active ? "bg-foreground/10 font-semibold" : "text-foreground/80"}`}
              >
                <span className="truncate">{opt.label}</span>
                {active && (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 10.5l1.8 1.8 3.7-3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SelectDropdown;
