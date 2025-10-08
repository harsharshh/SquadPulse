
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";
import { gsap } from "gsap";
import CheckInCard from "@/components/checkin/CheckInCard";
import CompanyCard from "@/components/checkin/CompanyCard";
import MoodOverviewCard from "@/components/checkin/MoodOverviewCard";
import RecentCheckinsCard, { type CheckInHistoryItem } from "@/components/checkin/RecentCheckinsCard";
import MoodFace from "@/components/checkin/MoodFace";
import { moodOptions } from "@/components/checkin/constants";

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
  const [myHistory, setMyHistory] = useState<CheckInHistoryItem[]>([
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
              <CheckInCard
                isSubmitted={isSubmitted}
                selectedMood={selectedMood}
                selectedMoodColor={selectedMoodColor}
                comment={comment}
                isSubmitting={isSubmitting}
                onSelectMood={(value) => setSelectedMood(value)}
                onCommentChange={(value) => setComment(value)}
                onSubmit={handleSubmit}
                onReset={resetForm}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div ref={rightColRef} className="flex flex-col space-y-6 h-[calc(100vh-4rem)]" data-card-container>
              {/* Team header */}
              <CompanyCard teamName={teamName} orgName={orgName} />

              {/* Team overview */}
              <MoodOverviewCard
                ref={cardsRef}
                mood={teamFaceMood}
                moodColor={teamFaceColor}
                stats={teamStats}
                progressRef={barRef}
              />

              {/* My history (moved to right column) */}
              <RecentCheckinsCard history={myHistory} onSelectEntry={openHistoryModal} />
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
