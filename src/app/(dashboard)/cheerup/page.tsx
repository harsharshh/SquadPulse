"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { useSession } from "next-auth/react";

import AuthGuard from "@/components/AuthGuard";
import CompanyCard from "@/components/checkin/CompanyCard";
import MoodOverviewCard from "@/components/checkin/MoodOverviewCard";
import RecentCheckinsCard, { type CheckInHistoryItem } from "@/components/checkin/RecentCheckinsCard";
import MoodFace from "@/components/checkin/MoodFace";
import { moodOptions } from "@/components/checkin/constants";

const motivationalQuotes = [
  "You're doing amazing! 🌟",
  "Every day is a fresh start! 🌅",
  "You've got this! 💪",
  "Small steps lead to big changes! 🚀",
  "Your positivity is contagious! 😊",
  "Today is going to be great! ✨",
  "You're stronger than you think! 💎",
  "Keep shining bright! ☀️",
];

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything! 😄",
  "I told my partner they were drawing their eyebrows too high. They looked surprised! 😂",
  "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
  "What do you call a fake noodle? An impasta! 🍝",
  "Why don't eggs tell jokes? They'd crack each other up! 🥚",
  "What do you call a bear with no teeth? A gummy bear! 🐻",
];

const palettes = [
  { name: "Calm Blue", hex: "#3B82F6", emoji: "💙" },
  { name: "Peaceful Green", hex: "#10B981", emoji: "💚" },
  { name: "Warm Orange", hex: "#F97316", emoji: "🧡" },
  { name: "Soft Purple", hex: "#8B5CF6", emoji: "💜" },
  { name: "Gentle Pink", hex: "#EC4899", emoji: "💖" },
  { name: "Sunny Yellow", hex: "#EAB308", emoji: "💛" },
];

const microActions = [
  { label: "Stretch for 30 seconds", emoji: "🧘" },
  { label: "Send a thank-you ping", emoji: "💌" },
  { label: "Grab water and hydrate", emoji: "💧" },
  { label: "Share one win in chat", emoji: "🏆" },
];

const gratitudeSeed: CheckInHistoryItem[] = [
  { date: "Today", mood: 5, note: "Morning stand-up full of wins" },
  { date: "Yesterday", mood: 4, note: "Shared laughter in design sync" },
  { date: "2 days ago", mood: 4, note: "Async day gave deep-work time" },
];

export default function CheerUpPage() {
  const { data: session } = useSession();
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [currentJoke, setCurrentJoke] = useState(jokes[0]);
  const [selectedPalette, setSelectedPalette] = useState(palettes[0]);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [cyclesRemaining, setCyclesRemaining] = useState(0);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [newGratitudeItem, setNewGratitudeItem] = useState("");

  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const rightColumnRef = useRef<HTMLDivElement | null>(null);
  const moodBarRef = useRef<HTMLDivElement | null>(null);

  const wellnessStats = useMemo(() => ({ avg: 4.6, total: 36, updated: "Refreshed just now" }), []);
  const boosterMood = useMemo(() => {
    const rounded = Math.round(wellnessStats.avg) as 1 | 2 | 3 | 4 | 5;
    const palette = moodOptions.find((option) => option.value === rounded);
    return {
      mood: rounded,
      color: palette?.colorHex ?? "#fb7185",
      label: palette?.label ?? "Bright",
    };
  }, [wellnessStats.avg]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (leftColumnRef.current) {
        gsap.from(leftColumnRef.current.children, {
          y: 18,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.08,
        });
      }
      if (rightColumnRef.current) {
        gsap.from(rightColumnRef.current.children, {
          y: 20,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.1,
        });
      }
      if (moodBarRef.current) {
        gsap.fromTo(
          moodBarRef.current,
          { width: 0 },
          { width: `${Math.min(100, (wellnessStats.avg / 5) * 100)}%`, duration: 0.8, ease: "power2.out" }
        );
      }
    });
    return () => ctx.revert();
  }, [wellnessStats.avg]);

  useEffect(() => {
    if (cyclesRemaining <= 0) return;
    const timer = setTimeout(() => {
      setBreathingPhase((prev) => {
        if (prev === "Inhale") return "Hold";
        if (prev === "Hold") return "Exhale";
        return "Inhale";
      });
      setCyclesRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 3000);

    return () => clearTimeout(timer);
  }, [cyclesRemaining, breathingPhase]);

  const spinQuote = () => {
    const next = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setCurrentQuote(next);
  };

  const spinJoke = () => {
    const next = jokes[Math.floor(Math.random() * jokes.length)];
    setCurrentJoke(next);
  };

  const spinPalette = () => {
    const next = palettes[Math.floor(Math.random() * palettes.length)];
    setSelectedPalette(next);
  };

  const startBreathing = () => {
    setCyclesRemaining(9);
    setBreathingPhase("Inhale");
  };

  const addGratitudeItem = () => {
    const trimmed = newGratitudeItem.trim();
    if (!trimmed) return;
    setGratitudeItems((prev) => [trimmed, ...prev]);
    setNewGratitudeItem("");
  };

  const removeGratitudeItem = (index: number) => {
    setGratitudeItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const gratitudeHistory = useMemo<CheckInHistoryItem[]>(() => {
    const mapped = gratitudeItems.slice(0, 5).map((item, idx) => ({
      date: idx === 0 ? "Moments ago" : `${idx} mins ago`,
      mood: 5,
      note: item,
    }));
    return [...mapped, ...gratitudeSeed].slice(0, 6);
  }, [gratitudeItems]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background supports-[backdrop-filter]:bg-background/80">
        <main className="mx-auto max-w-8xl px-6 py-8">
          <div className="grid gap-6 lg:grid-cols-[7fr_3fr]">
            <div ref={leftColumnRef} className="flex flex-col gap-6">
              <section className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 via-white/80 to-white/70 dark:from-[#1a1a2e]/85 dark:to-[#232136]/60 p-8 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40">
                <p className="inline-flex items-center rounded-full border border-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  Cheer up mode
                </p>
                <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-foreground">
                  Hi {session?.user?.name?.split(" ")[0] ?? "there"}, let&apos;s lift your energy
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-foreground/65">
                  Take mindful micro-breaks, collect motivation, and track the bright spots powering your day.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {microActions.map((action) => (
                    <span
                      key={action.label}
                      className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/80 px-3 py-1 text-xs font-medium text-foreground/70"
                    >
                      <span>{action.emoji}</span>
                      {action.label}
                    </span>
                  ))}
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2" data-card>
                <div className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/75 dark:to-[#232136]/55 p-5 shadow-md">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Mood snapshot</h2>
                    <span className="text-xs text-foreground/60">Real-time</span>
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <MoodFace mood={boosterMood.mood} activeColor={boosterMood.color} size={64} />
                    <div>
                      <div className="text-sm font-medium text-foreground">Feeling {boosterMood.label}</div>
                      <div className="mt-2 text-2xl font-semibold text-foreground">{wellnessStats.avg.toFixed(1)} / 5</div>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-foreground/10">
                    <div ref={moodBarRef} className="h-full rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc]" />
                  </div>
                </div>

                <div className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/75 dark:to-[#232136]/55 p-5 shadow-md text-center">
                  <div className="text-4xl mb-3">🎨</div>
                  <h2 className="text-lg font-semibold text-foreground">Color therapy</h2>
                  <p className="text-sm text-foreground/60">Refresh your visual palette</p>
                  <button
                    onClick={spinPalette}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] py-2 text-sm font-semibold text-white hover:opacity-95"
                  >
                    Discover a new hue
                  </button>
                  <div
                    className="mt-4 h-24 rounded-xl border border-foreground/10 shadow-inner flex items-center justify-center text-white text-lg font-semibold"
                    style={{ backgroundColor: selectedPalette.hex }}
                  >
                    <span className="mr-2 text-xl">{selectedPalette.emoji}</span>
                    {selectedPalette.name}
                  </div>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2" data-card>
                <div className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/75 dark:to-[#232136]/55 p-5 shadow-md">
                  <div className="text-4xl mb-3 text-center">🎲</div>
                  <h2 className="text-lg font-semibold text-foreground text-center">Motivation booster</h2>
                  <p className="text-sm text-foreground/60 text-center">Spin up a fresh reminder</p>
                  <button
                    onClick={spinQuote}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] py-2 text-sm font-semibold text-white hover:opacity-95"
                  >
                    Shuffle quote
                  </button>
                  <div className="mt-4 rounded-xl border border-foreground/10 bg-background/85 px-4 py-3 text-sm font-medium text-foreground">
                    {currentQuote}
                  </div>
                </div>

                <div className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/75 dark:to-[#232136]/55 p-5 shadow-md">
                  <div className="text-4xl mb-3 text-center">🎪</div>
                  <h2 className="text-lg font-semibold text-foreground text-center">Laugh break</h2>
                  <p className="text-sm text-foreground/60 text-center">Humor resets the mood meter</p>
                  <button
                    onClick={spinJoke}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] py-2 text-sm font-semibold text-white hover:opacity-95"
                  >
                    Tell me a joke
                  </button>
                  <div className="mt-4 rounded-xl border border-foreground/10 bg-background/85 px-4 py-3 text-sm text-foreground/80">
                    {currentJoke}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-5 shadow-lg" data-card>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Breathing exercise</h2>
                    <p className="text-sm text-foreground/60">Three 3-3-3 cycles to reset focus</p>
                  </div>
                  <span className="text-xs text-foreground/60">Guided</span>
                </div>
                <div className="mt-4 flex flex-col items-center gap-3">
                  <div className="text-5xl">
                    {breathingPhase === "Inhale" && "🫁"}
                    {breathingPhase === "Hold" && "⏸️"}
                    {breathingPhase === "Exhale" && "😮‍💨"}
                  </div>
                  <div className="text-lg font-semibold text-foreground">{breathingPhase}</div>
                  <div className="text-xs text-foreground/60">{cyclesRemaining} beats remaining</div>
                  {cyclesRemaining === 0 ? (
                    <button
                      onClick={startBreathing}
                      className="rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-6 py-2 text-sm font-semibold text-white hover:opacity-95"
                    >
                      Begin guided breathing
                    </button>
                  ) : (
                    <div className="h-2 w-full rounded-full bg-foreground/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#fb7185] to-[#c084fc]"
                        style={{ width: `${(9 - cyclesRemaining) / 9 * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/95 to-white/75 dark:from-[#1a1a2e]/82 dark:to-[#232136]/60 p-5 shadow-lg" data-card>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Gratitude board</h2>
                    <p className="text-sm text-foreground/60">Capture bright moments as they happen</p>
                  </div>
                  <MoodFace mood={5} activeColor="#fb7185" size={56} />
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newGratitudeItem}
                    onChange={(event) => setNewGratitudeItem(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addGratitudeItem();
                      }
                    }}
                    placeholder="I&apos;m grateful for..."
                    className="flex-1 rounded-xl border border-foreground/15 bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:border-transparent focus:ring-2 focus:ring-[#fb7185]"
                  />
                  <button
                    onClick={addGratitudeItem}
                    className="rounded-xl bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
                  >
                    Add
                  </button>
                </div>
                <ul className="mt-4 space-y-2 max-h-44 overflow-y-auto pr-1">
                  {gratitudeItems.length === 0 ? (
                    <li className="rounded-xl border border-foreground/10 bg-background/80 px-4 py-3 text-sm text-foreground/70">
                      Start logging little sparks of joy throughout the day.
                    </li>
                  ) : (
                    gratitudeItems.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-foreground/10 bg-background/80 px-4 py-3 text-sm text-foreground/80"
                      >
                        <span>✨ {item}</span>
                        <button
                          onClick={() => removeGratitudeItem(index)}
                          className="text-foreground/40 hover:text-foreground/80"
                        >
                          ×
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            </div>

            <aside ref={rightColumnRef} className="flex h-full min-h-0 flex-col gap-6">
              <CompanyCard teamName="Cheer Squad" orgName="Squad Pulse" />

              <MoodOverviewCard
                mood={boosterMood.mood}
                moodColor={boosterMood.color}
                stats={wellnessStats}
              />

              <RecentCheckinsCard history={gratitudeHistory} onSelectEntry={() => {}} />

              <div
                data-card
                className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 to-white/75 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-5 shadow-lg"
              >
                <h3 className="text-sm font-semibold text-foreground">Quick reset tips</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                  <li>• Step outside for two minutes of daylight</li>
                  <li>• Swap playlists to something uplifting</li>
                  <li>• Schedule a 10-minute virtual coffee with a teammate</li>
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
