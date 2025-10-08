
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import { gsap } from "gsap";

const hexToRgba = (hex: string, alpha = 0.12) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// GSAP-animated celebration face for check-in success
function CelebrationFace({ size = 72 }: { size?: number }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const mouth = useRef<SVGPathElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (wrapRef.current) {
        gsap.fromTo(
          wrapRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }
        );
      }
      if (mouth.current) {
        gsap.fromTo(
          mouth.current,
          { strokeDashoffset: 40 },
          { strokeDashoffset: 0, duration: 0.6, ease: "power2.out", delay: 0.2 }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background circle */}
        <circle cx="32" cy="32" r="28" fill="#10b981" />
        {/* Animated check path */}
        <path
          ref={mouth}
          d="M20 34 L28 42 L44 24"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray="40"
          strokeDashoffset="40"
        />
      </svg>
    </div>
  );
}

// Reusable GSAP-animated SVG face
function MoodFace({ mood, activeColor, idleColor = "#e5e7eb", size = 64 }: { mood: 1|2|3|4|5; activeColor: string; idleColor?: string; size?: number }) {
  const wrapRef = useRef<HTMLDivElement|null>(null);
  const eyeL = useRef<SVGCircleElement|null>(null);
  const eyeR = useRef<SVGCircleElement|null>(null);
  const mouth = useRef<SVGPathElement|null>(null);
  // New refs for cheeks, sparkles, tear
  const cheekL = useRef<SVGCircleElement|null>(null);
  const cheekR = useRef<SVGCircleElement|null>(null);
  const sparkleL = useRef<SVGPolygonElement|null>(null);
  const sparkleR = useRef<SVGPolygonElement|null>(null);
  const tear = useRef<SVGPathElement|null>(null);

  // idle micro animations (blink + gentle float)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // gentle float
      if (wrapRef.current) {
        gsap.to(wrapRef.current, { y: 2, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
      // random blink loop
      const blink = () => {
        gsap.to([eyeL.current, eyeR.current], { scaleY: 0.1, duration: 0.08, transformOrigin: "center", yoyo: true, repeat: 1, ease: "power1.inOut", onComplete: () => {
          gsap.delayedCall(1 + Math.random()*2, blink);
        }});
      };
      blink();
      // hide accents initially
      gsap.set([cheekL.current, cheekR.current, sparkleL.current, sparkleR.current, tear.current], { autoAlpha: 0, scale: 0.8 });
    });
    return () => ctx.revert();
  }, []);

  const onHover = () => {
    if (!wrapRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // common subtle scale
    tl.to(wrapRef.current, { scale: 1.04, duration: 0.18 }, 0);

    switch (mood) {
      case 1: // Terrible: deeper frown, slight shake, tear appears
        tl.to(mouth.current, { attr: { d: sadPath(1.3) }, duration: 0.22 }, 0)
          .to([eyeL.current, eyeR.current], { y: 1.5, scaleY: 0.85, duration: 0.18 }, 0)
          .fromTo(tear.current, { autoAlpha: 0, y: -2 }, { autoAlpha: 1, y: 2, duration: 0.3 }, 0.05)
          .to(wrapRef.current, { x: 2, yoyo: true, repeat: 3, duration: 0.05 }, 0.02);
        break;
      case 2: // Bad: frown, droopy eyes
        tl.to(mouth.current, { attr: { d: sadPath(1.05) }, duration: 0.22 }, 0)
          .to([eyeL.current, eyeR.current], { y: 1, scaleY: 0.9, duration: 0.18 }, 0);
        break;
      case 3: // Okay: slight smile, cheeks appear softly
        tl.to(mouth.current, { attr: { d: neutralPath(0.6) }, duration: 0.2 }, 0)
          .to([cheekL.current, cheekR.current], { autoAlpha: 0.6, scale: 1, duration: 0.24 }, 0.06);
        break;
      case 4: // Good: bigger smile, light cheek blush, eye squint a touch
        tl.to(mouth.current, { attr: { d: smilePath(1.0) }, duration: 0.2 }, 0)
          .to([eyeL.current, eyeR.current], { scaleY: 0.85, duration: 0.18 }, 0)
          .to([cheekL.current, cheekR.current], { autoAlpha: 0.8, scale: 1, duration: 0.24 }, 0.06);
        break;
      case 5: // Amazing: big smile + sparkles
        tl.to(mouth.current, { attr: { d: smilePath(1.25) }, duration: 0.2 }, 0)
          .to([eyeL.current, eyeR.current], { scaleY: 0.8, duration: 0.18 }, 0)
          .to([sparkleL.current, sparkleR.current], { autoAlpha: 1, scale: 1, rotate: 15, duration: 0.26, stagger: 0.06 }, 0.05)
          .to(wrapRef.current, { scale: 1.08, yoyo: true, repeat: 1, duration: 0.16 }, 0.05);
        break;
    }
  };
  const onLeave = () => {
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tl.to(wrapRef.current, { scale: 1, x: 0, duration: 0.18 }, 0)
      .to([eyeL.current, eyeR.current], { y: 0, scaleY: 1, duration: 0.18 }, 0)
      .to([cheekL.current, cheekR.current, sparkleL.current, sparkleR.current, tear.current], { autoAlpha: 0, scale: 0.8, duration: 0.18 }, 0)
      .to(mouth.current, { attr: { d: baseMouthPath(mood) }, duration: 0.22 }, 0);
  };

  // initial mouth shape per mood
  const baseMouthPath = (m: number) => {
    if (m <= 2) return sadPath(0.8);
    if (m === 3) return neutralPath(0.4);
    return smilePath(0.8);
  };
  function smilePath(intensity = 1) {
    // cubic bezier smile
    const i = intensity;
    return `M 22 38 C 28 ${40 + 6*i} 36 ${40 + 6*i} 42 38`;
  }
  function neutralPath(intensity = 1) {
    const w = 8*intensity;
    return `M ${32-w} 38 L ${32+w} 38`;
    }
  function sadPath(intensity = 1) {
    const i = intensity;
    return `M 22 40 C 28 ${38 - 6*i} 36 ${38 - 6*i} 42 40`;
  }

  const faceFill = activeColor; // color comes from parent per mood

  return (
    <div ref={wrapRef} onMouseEnter={onHover} onMouseLeave={onLeave} className="select-none">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2" />
          </filter>
        </defs>
        <g filter="url(#softShadow)">
          <circle cx="32" cy="32" r="24" fill={faceFill} />
          {/* eyes */}
          <circle ref={eyeL} cx="24" cy="28" r="2.5" fill={idleColor} />
          <circle ref={eyeR} cx="40" cy="28" r="2.5" fill={idleColor} />
          {/* cheeks (hidden by default, used for 3/4) */}
          <circle ref={cheekL} cx="22" cy="34" r="3" fill="#fecaca" />
          <circle ref={cheekR} cx="42" cy="34" r="3" fill="#fecaca" />
          {/* sparkles for 5 */}
          <polygon ref={sparkleL} points="18,20 20,24 16,24" fill="#ffffff" />
          <polygon ref={sparkleR} points="48,20 50,24 46,24" fill="#ffffff" />
          {/* tear for 1 */}
          <path ref={tear} d="M24 30 C23 32, 23 33, 24 34" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
          {/* mouth */}
          <path ref={mouth} d={baseMouthPath(mood)} stroke={idleColor} strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

// Brand-aware mood palette (aligned with project gradient hues)
const moodOptions = [
  { emoji: "😢", label: "Terrible", value: 1, colorHex: "#ef4444", ring: "ring-red-400/40" },
  { emoji: "😔", label: "Bad", value: 2, colorHex: "#f97316", ring: "ring-orange-400/40" },
  { emoji: "😐", label: "Okay", value: 3, colorHex: "#f59e0b", ring: "ring-yellow-400/40" },
  { emoji: "😊", label: "Good", value: 4, colorHex: "#10b981", ring: "ring-green-400/40" },
  { emoji: "🤩", label: "Amazing", value: 5, colorHex: "#3b82f6", ring: "ring-blue-400/40" },
];

// Reusable Tailwind SelectDropdown component (theme-aware)
function SelectDropdown({
  value,
  options,
  onChange,
  placeholder = "Select",
  className = "",
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (buttonRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Basic keyboard nav
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (open) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
  };

  const selected = value || "";

  return (
    <div className={`relative z-30 ${className}`} onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="w-full rounded-xl border border-foreground/15 bg-background/80 px-3 py-2 text-left text-foreground shadow-sm transition focus:border-transparent focus:ring-2 focus:ring-[#c084fc] dark:bg-foreground/5"
      >
        <span className="block truncate text-sm">{selected || placeholder}</span>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-foreground/15 bg-white dark:bg-[#0b0b16] p-1.5 shadow-xl outline-none"
        >
          {options.map((opt) => {
            const active = opt === value;
            return (
              <li
                key={opt}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-foreground/10 hover:text-foreground ${active ? 'bg-foreground/10 font-semibold' : 'text-foreground/80'}`}
              >
                <span className="truncate">{opt}</span>
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
}

export default function CheckInPage() {
  const { data: session } = useSession();

  // UI state
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Organization (shown as chip in team header)
  const [orgName] = useState<string>("Gainsight");

  // Team state (stateful, allows adding new teams)
  const [teamName, setTeamName] = useState("Jo Core");
  const [teams, setTeams] = useState<string[]>(["Jo Core", "Communication Hub", "Product team"]);
  // First-visit team selection flow
  const [showTeamPicker, setShowTeamPicker] = useState<boolean>(true);
  const [pickerSelected, setPickerSelected] = useState<string>("");
  const [addingNew, setAddingNew] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>("");

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('squadpulse.team') : null;
      if (stored) {
        setTeamName(stored);
        setShowTeamPicker(false);
      } else {
        setShowTeamPicker(true);
        setPickerSelected((prev) => prev || "Core Squad");
      }
    } catch {
      setShowTeamPicker(true);
    }
  }, []);

  // Guard: If pickerSelected is empty on first render, default to first team
  useEffect(() => {
    if (!pickerSelected && teams.length > 0) setPickerSelected(teams[0]);
  }, [pickerSelected, teams]);

  // Local history for the signed-in user
  const [myHistory, setMyHistory] = useState<{ date: string; mood: number; note?: string }[]>([
    { date: "Today", mood: 4, note: "Felt productive" },
    { date: "Yesterday", mood: 3, note: "Meetings heavy" },
    { date: "2 days ago", mood: 5, note: "Great release!" },
  ]);

  // History detail modal + comments
  const [historyModal, setHistoryModal] = useState<{ open: boolean; index: number | null }>({ open: false, index: null });
  const [historyComments, setHistoryComments] = useState<Record<number, string[]>>({});
  const [newHistoryComment, setNewHistoryComment] = useState<string>("");

  const openHistoryModal = (index: number) => {
    setHistoryModal({ open: true, index });
    setNewHistoryComment("");
  };
  const closeHistoryModal = () => setHistoryModal({ open: false, index: null });

  const addHistoryComment = () => {
    if (!historyModal.open || historyModal.index == null) return;
    const text = newHistoryComment.trim();
    if (!text) return;
    setHistoryComments((prev) => {
      const arr = prev[historyModal.index!] ? [...prev[historyModal.index!]] : [];
      arr.unshift(text);
      return { ...prev, [historyModal.index!]: arr };
    });
    setNewHistoryComment("");
  };

  // Aggregate team overview (mock state updated on submit)
  const [teamStats, setTeamStats] = useState({ avg: 3.6, total: 12, updated: "2 min ago" });

  // Refs for GSAP animations
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null); // team avg progress bar fill

  // Appear animation
  useLayoutEffect(() => {
    if (showTeamPicker) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(leftColRef.current, { y: 20, autoAlpha: 0, duration: 0.5 })
        .from(rightColRef.current, { y: 20, autoAlpha: 0, duration: 0.5 }, "-=0.2");

      if (cardsRef.current) {
        tl.from(
          Array.from(cardsRef.current.querySelectorAll("[data-card]")),
          { y: 16, autoAlpha: 0, duration: 0.5, stagger: 0.08 }
        );
      }

      // Animate initial team bar to current avg
        const pct = Math.min(100, Math.max(0, (teamStats.avg / 5) * 100));
        if (barRef.current) {
        gsap.set(barRef.current, { width: 0 });
        gsap.to(barRef.current, { width: `${pct}%`, duration: 0.8, ease: "power2.out" });
        }
    });
    return () => ctx.revert();
  }, [showTeamPicker, teamStats.avg]);

  // Whenever teamStats.avg changes, animate bar width
  useEffect(() => {
    const pct = Math.min(100, Math.max(0, (teamStats.avg / 5) * 100));
    if (barRef.current) {
      gsap.to(barRef.current, { width: `${pct}%`, duration: 0.6, ease: "power2.out" });
      gsap.fromTo(
        barRef.current,
        { scaleY: 0.96 },
        { scaleY: 1, duration: 0.3, ease: "power1.out" }
      );
    }
  }, [teamStats.avg]);

  const teamFaceMood = useMemo(() => {
    const n = Math.round(teamStats.avg);
    return Math.min(5, Math.max(1, n)) as 1|2|3|4|5;
  }, [teamStats.avg]);

  const teamFaceColor = useMemo(() => {
    return moodOptions.find((m) => m.value === teamFaceMood)?.colorHex ?? "#9ca3af";
  }, [teamFaceMood]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;
    setIsSubmitting(true);

    // Simulate API
    try {
      await new Promise((r) => setTimeout(r, 500));
      // Update local history
      setMyHistory((prev) => [{ date: "Just now", mood: selectedMood, note: comment }, ...prev]);
      // Update team stats (mock): new average from previous + this mood
      setTeamStats((prev) => {
        const newTotal = prev.total + 1;
        const newAvg = (prev.avg * prev.total + selectedMood) / newTotal;
        return { avg: parseFloat(newAvg.toFixed(1)), total: newTotal, updated: "a moment ago" };
      });
      setIsSubmitted(true);
      // Micro celebration
      if (cardsRef.current) {
        const pulse = cardsRef.current.querySelector("[data-celebrate]");
        if (pulse) {
          gsap.fromTo(
            pulse,
            { scale: 0.9, filter: "brightness(1)" },
            { scale: 1, filter: "brightness(1.15)", duration: 0.35, yoyo: true, repeat: 1 }
          );
        }
      }
    } finally {
      setIsSubmitting(false);
      setSelectedMood(null);
      setComment("");
    }
  };

  const resetForm = () => {
    setSelectedMood(null);
    setComment("");
    setIsSubmitted(false);
  };

  const userFirstName = useMemo(() => (session?.user?.name ?? "").split(" ")[0] || "there", [session]);

  const selectedMoodColor = useMemo(() => {
    const m = moodOptions.find((mo) => mo.value === selectedMood);
    return m?.colorHex ?? null;
  }, [selectedMood]);

  return (
    <AuthGuard>
      {showTeamPicker ? (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-8 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40 text-center">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Choose your team to start</h1>
            <p className="mt-2 text-sm text-foreground/70">We’ll remember your choice on this device.</p>
            <div className="mt-6 space-y-4 text-left">
              <label htmlFor="team-picker" className="text-sm font-medium text-foreground/90">Select your team</label>
              <SelectDropdown
                value={pickerSelected}
                options={teams}
                onChange={(v) => { setPickerSelected(v); setAddingNew(false); }}
                className=""
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAddingNew((s) => !s)}
                  className="text-sm font-semibold text-foreground hover:text-[#fb7185]"
                >
                  {addingNew ? "Cancel adding new team" : "➕ Add your team"}
                </button>
                <button
                  type="button"
                  disabled={addingNew}
                  onClick={() => {
                    if (addingNew) return; // safety
                    const chosen = pickerSelected || teams[0];
                    setTeamName(chosen);
                    try { localStorage.setItem('squadpulse.team', chosen); } catch {}
                    setShowTeamPicker(false);
                  }}
                  className={`rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-4 py-2 text-sm font-semibold text-white transition ${addingNew ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:opacity-95'}`}
                >
                  Continue
                </button>
              </div>

              {addingNew && (
                <div className="mt-3 space-y-3">
                  <label htmlFor="new-team" className="text-sm font-medium text-foreground/90">New team name</label>
                  <input
                    id="new-team"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Platform Tribe"
                    className="w-full rounded-xl border border-foreground/15 bg-background/80 px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-transparent focus:ring-2 focus:ring-[#fb7185] dark:bg-foreground/5"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!newTeamName.trim()}
                      onClick={() => {
                        const name = newTeamName.trim();
                        if (!name) return;
                        if (!teams.includes(name)) setTeams((prev) => [...prev, name]);
                        setTeamName(name);
                        setPickerSelected(name);
                        try { localStorage.setItem('squadpulse.team', name); } catch {}
                        setShowTeamPicker(false);
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!newTeamName.trim() ? 'bg-foreground/10 text-foreground/60 cursor-not-allowed' : 'bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white hover:opacity-95'}`}
                    >
                      Save & continue
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 text-xs text-foreground/60">You can change teams anytime in the settings.</div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <main className="mx-auto max-w-8xl px-6 py-8">
          {/* Grid: Left (check-in + my history) | Right (team header + overview) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[7fr_3fr] h-full">
            {/* LEFT COLUMN */}
            <div ref={leftColRef} className="space-y-6 self-stretch flex flex-col items-center justify-center">
              <h1 className="w-full max-w-xxl self-center text-center text-3xl md:text-4xl font-semibold text-foreground py-4">
                How are you feeling today,{" "}
                <span className="bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] bg-clip-text text-transparent">
                  {userFirstName}
                </span>
                ?
              </h1>
              <div
                data-card
                className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40"
                style={selectedMoodColor ? { backgroundImage: `linear-gradient(to bottom right, ${hexToRgba(selectedMoodColor, 0.15)}, transparent), linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))` } : undefined}
              >

                {isSubmitted ? (
                  <div className="text-center">
                    <div className="mb-6 flex flex-col items-center" data-celebrate>
                      <div className="mb-4">
                        <CelebrationFace />
                      </div>
                      <h2 className="mb-2 text-2xl font-semibold text-foreground">Thanks for checking in!</h2>
                      <p className="mb-6 text-foreground/70">Your mood has been recorded. See you tomorrow.</p>
                    </div>
                    <button
                      onClick={resetForm}
                      className="rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-5 py-3 font-medium text-white transition hover:opacity-95"
                    >
                      Submit Another Check-in
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h4 className="mb-4 text-center text-md font-semibold text-foreground">Rate Your Mood</h4>
                      <div className="grid grid-cols-5 gap-3">
                        {moodOptions.map((mood) => {
                          const active = selectedMood === mood.value;
                          return (
                            <button
                              key={mood.value}
                              type="button"
                              onClick={() => setSelectedMood(mood.value)}
                              className={[
                                "group rounded-xl border-2 p-4 transition-all duration-200 focus:outline-none hover:border-foreground/25 hover:-translate-y-0.5",
                                active ? `border-transparent ring-4 ${mood.ring}` : "border-foreground/15 bg-background/80 dark:bg-foreground/5",
                              ].join(" ")}
                              style={active ? { backgroundColor: hexToRgba(mood.colorHex, 0.15) } : undefined}
                            >
                              <div className="mb-2 flex items-center justify-center">
                                <MoodFace mood={mood.value as 1|2|3|4|5} activeColor={mood.colorHex} size={72} />
                              </div>
                              <div className="text-xs font-medium">{mood.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="comment" className="mb-2 block text-sm font-medium text-foreground/90">
                        Any additional thoughts to share anonymously ?
                      </label>
                      <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="w-full resize-none rounded-xl border border-foreground/15 bg-background/80 px-4 py-3 text-foreground placeholder:text-foreground/40 focus:border-transparent focus:ring-2 dark:bg-foreground/5"
                        placeholder="Share what's on your mind..."
                        style={selectedMoodColor ? { outlineColor: selectedMoodColor, boxShadow: `0 0 0 2px ${hexToRgba(selectedMoodColor, 0.45)}` } : undefined}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedMood || isSubmitting}
                      className="w-full rounded-xl bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] py-4 text-lg font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting…" : "Submit Check-in"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div ref={rightColRef} className="flex flex-col space-y-6 h-[calc(100vh-4rem)]" data-card-container>
              {/* Team header */}
              <div
                data-card
                className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40 flex items-center justify-between"
              >
                {/* Left: Team avatar + name */}
                <div className="flex items-center gap-3">
                  {/* Avatar derived from team initials */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f97316] via-[#fb7185] to-[#c084fc] text-white shadow-md">
                    <span className="text-base font-bold leading-none">
                      {teamName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
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

                {/* Right: Org chip */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-2.5 py-1 text-xs text-foreground/80 bg-background/60 dark:bg-foreground/10">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M12 3l9 5-9 5-9-5 9-5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 12l9 5 9-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {orgName}
                  </span>
                </div>
              </div>

              {/* Team overview */}
              <div ref={cardsRef} data-card className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40">
                <div className="mb-3 flex items-center gap-3">
                  <MoodFace mood={teamFaceMood} activeColor={teamFaceColor} size={48} />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Your mood overview</h3>
                    {/* <div className="text-sm text-foreground/70">Average: {teamStats.avg} / 5</div> */}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-foreground/10" style={{background: 'aliceblue'}}>
                  <div
                    ref={barRef}
                    className="h-full origin-center rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc]"
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-foreground/10 bg-gradient-to-tr from-white/80 to-white/60 dark:from-[#2d2250]/40 dark:to-[#1a1a2e]/30 shadow-sm p-3 text-center">
                    <div className="text-xs text-foreground/60">Average</div>
                      <div className="text-2xl font-extrabold tracking-tight" style={{ color: teamFaceColor }}>
                            {teamStats.avg}
                            <span className="ml-1 align-top text-[10px] font-semibold text-foreground/60">/ 5</span>
                        </div>
                  </div>
                  <div className="rounded-xl border border-foreground/10 bg-gradient-to-tr from-white/80 to-white/60 dark:from-[#2d2250]/40 dark:to-[#1a1a1a]/30 shadow-sm p-3 text-center">
                    <div className="text-xs text-foreground/60">Check‑ins</div>
                    <div className="text-xl font-semibold text-foreground">{teamStats.total}</div>
                  </div>
                  <div className="rounded-xl border border-foreground/10 bg-gradient-to-tr from-white/80 to-white/60 dark:from-[#2d2250]/40 dark:to-[#1a1a2e]/30 shadow-sm p-3 text-center">
                    <div className="text-xs text-foreground/60">Updated</div>
                    <div className="text-sm font-medium text-foreground">{teamStats.updated}</div>
                  </div>
                </div>

                {/* Mini trend bubbles */}
                <div className="mt-4 flex flex-wrap gap-2" aria-hidden>
                  {[...Array(12)].map((_, i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full bg-foreground/15"
                      style={{ opacity: 0.6 + (i % 3) * 0.1 }}
                    />
                  ))}
                </div>
              </div>

              {/* My history (moved to right column) */}
              <div data-card className="flex-1 overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40">
                <div className="p-5 flex flex-col h-full">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Your recent check-ins</h3>
                  <div className="flex-1 overflow-y-auto pr-2">
                    <ul className="space-y-2">
                      {myHistory.map((h, idx) => {
                        const mood = moodOptions.find((m) => m.value === h.mood);
                        const color = mood?.colorHex ?? "#9ca3af";
                        const label = mood?.label ?? `Mood ${h.mood}`;
                        return (
                          <li
                            key={idx}
                            role="button"
                            tabIndex={0}
                            onClick={() => openHistoryModal(idx)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHistoryModal(idx); } }}
                            className="cursor-pointer rounded-xl border border-foreground/10 bg-gradient-to-tr from-white/80 to-white/60 dark:from-[#2d2250]/30 dark:to-[#1a1a2e]/30 px-3 py-2 shadow-sm transition hover:shadow hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-[#c084fc]/60"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="shrink-0">
                                  <MoodFace mood={h.mood as 1|2|3|4|5} activeColor={color} size={32} />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-foreground">
                                    {label} <span className="ml-1 text-foreground/60">· {h.mood}</span>
                                  </div>
                                  {h.note && (
                                    <div className="text-xs text-foreground/70 line-clamp-1">{h.note}</div>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-foreground/60">{h.date}</div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      )}
      {/* History modal */}
      {historyModal.open && historyModal.index != null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={(e) => { if (e.currentTarget === e.target) closeHistoryModal(); }}>
          <div className="w-full max-w-2xl rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/95 to-white/80 dark:from-[#151527]/95 dark:to-[#1a1a2e]/80 p-6 shadow-2xl" role="dialog" aria-modal="true">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const idx = historyModal.index as number;
                  const h = myHistory[idx];
                  const mood = moodOptions.find((m) => m.value === h.mood);
                  const color = mood?.colorHex ?? '#9ca3af';
                  const label = mood?.label ?? `Mood ${h.mood}`;
                  return (
                    <>
                      <MoodFace mood={h.mood as 1|2|3|4|5} activeColor={color} size={40} />
                      <div>
                        <div className="text-base font-semibold text-foreground">{label} <span className="ml-1 text-foreground/60">· {h.mood}/5</span></div>
                        <div className="text-xs text-foreground/60">{h.date}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <button onClick={closeHistoryModal} className="rounded-full p-1.5 hover:bg-foreground/10" aria-label="Close">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Body: details */}
            {(() => {
              const idx = historyModal.index as number;
              const h = myHistory[idx];
              return (
                <div className="space-y-4">
                  {h.note && (
                    <div className="rounded-xl border border-foreground/10 bg-foreground/[.03] p-3 text-sm text-foreground">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">Original note</div>
                      <div>{h.note}</div>
                    </div>
                  )}

                  {/* Comments thread */}
                  <div className="rounded-xl border border-foreground/10 bg-foreground/[.03] p-3">
                    <div className="mb-2 text-sm font-semibold text-foreground">Comments</div>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {(historyComments[idx] ?? []).length === 0 ? (
                        <div className="text-xs text-foreground/60">No comments yet.</div>
                      ) : (
                        (historyComments[idx] ?? []).map((c, i) => (
                          <div key={i} className="rounded-lg border border-foreground/10 bg-background/80 px-3 py-2 text-sm text-foreground">{c}</div>
                        ))
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <input
                        value={newHistoryComment}
                        onChange={(e) => setNewHistoryComment(e.target.value)}
                        placeholder="Add a comment…"
                        className="flex-1 rounded-xl border border-foreground/15 bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-transparent focus:ring-2 focus:ring-[#c084fc] dark:bg-foreground/5"
                      />
                      <button
                        type="button"
                        onClick={addHistoryComment}
                        disabled={!newHistoryComment.trim()}
                        className={`rounded-full px-3 py-2 text-sm font-semibold transition ${!newHistoryComment.trim() ? 'bg-foreground/10 text-foreground/60 cursor-not-allowed' : 'bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white hover:opacity-95'}`}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
