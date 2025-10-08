"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";

import AuthGuard from "@/components/AuthGuard";
import CompanyCard from "@/components/checkin/CompanyCard";
import MoodOverviewCard from "@/components/checkin/MoodOverviewCard";
import RecentCheckinsCard, { type CheckInHistoryItem } from "@/components/checkin/RecentCheckinsCard";
import { moodOptions } from "@/components/checkin/constants";

const teamInsights = [
  {
    title: "Team mood",
    description: "Composite sentiment across squads",
    trend: "+8% from last sprint",
    value: "4.1 / 5",
    accent: "from-[#f97316] via-[#fb7185] to-[#c084fc]",
  },
  {
    title: "Check-in health",
    description: "Participation rate over the last 14 days",
    trend: "Holding steady",
    value: "89%",
    accent: "from-[#22c55e] to-[#4ade80]",
  },
  {
    title: "Burnout risk",
    description: "Flagged individuals requiring follow-up",
    trend: "Down 2 members",
    value: "Low",
    accent: "from-[#f97316] to-[#fb7185]",
  },
  {
    title: "Psychological safety",
    description: "Confidence to raise concerns anonymously",
    trend: "Up 5 points",
    value: "82 / 100",
    accent: "from-[#3b82f6] to-[#60a5fa]",
  },
];

const healthSignals = [
  {
    label: "Shipping confidence is high",
    detail: "Product squad reported 12 wins in the last 48h",
    tone: "positive",
  },
  {
    label: "Meetings fatigue",
    detail: "12% of check-ins mentioned long syncs—consider async updates",
    tone: "caution",
  },
  {
    label: "Support load easing",
    detail: "Average after-hours pings dropped by 37% week over week",
    tone: "positive",
  },
];

const highlightItems = [
  {
    title: "Wins called out",
    items: [
      "Deal desk launched in record time",
      "Documentation overhaul improved onboarding feedback",
      "Customer NPS ticked up from 42 → 51",
    ],
  },
  {
    title: "Focus areas",
    items: [
      "Revisit incident postmortem template with SRE",
      "Spin up listening session for new hires",
      "Pilot async stand-ups for Platform pod",
    ],
  },
];

const teamHistory: CheckInHistoryItem[] = [
  { date: "Today", mood: 4, note: "Momentum feels great" },
  { date: "Yesterday", mood: 3, note: "Lots of customer escalations" },
  { date: "2 days ago", mood: 5, note: "Closed the quarterly OKRs" },
  { date: "3 days ago", mood: 4, note: "Async rituals working well" },
];

export default function TeamDashboardPage() {
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const teamStats = useMemo(() => ({
    avg: 4.1,
    total: 128,
    updated: "3 minutes ago",
  }), []);

  const moodSummary = useMemo(() => {
    const mood = Math.round(teamStats.avg) as 1 | 2 | 3 | 4 | 5;
    const color = moodOptions.find((option) => option.value === mood)?.colorHex ?? "#9ca3af";
    return { mood, color };
  }, [teamStats.avg]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (rightColRef.current) {
        gsap.from(rightColRef.current.children, {
          y: 18,
          autoAlpha: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.08,
        });
      }

      if (cardsRef.current) {
        gsap.from(cardsRef.current.querySelectorAll("[data-card]") as NodeListOf<HTMLElement>, {
          y: 16,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.06,
        });
      }

      if (barRef.current) {
        gsap.fromTo(barRef.current, { width: 0 }, { width: `${Math.min(100, (teamStats.avg / 5) * 100)}%`, duration: 0.8, ease: "power2.out" });
      }
    });

    return () => ctx.revert();
  }, [teamStats.avg]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background supports-[backdrop-filter]:bg-background/80">
        <main className="mx-auto max-w-8xl px-6 py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[7fr_3fr]">
            <div ref={cardsRef} className="flex flex-col gap-6">
              <header className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/65 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-8 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40">
                <p className="inline-flex items-center rounded-full border border-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">Pulse overview</p>
                <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-foreground">
                  Team dashboard
                  <span className="block text-lg font-medium text-foreground/60 mt-2">
                    Real-time mood, health, and participation signals across Squad Pulse
                  </span>
                </h1>
              </header>

              <section className="grid gap-4 md:grid-cols-2" data-card>
                {teamInsights.map((insight) => (
                  <div
                    key={insight.title}
                    className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 to-white/72 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-5 shadow-md"
                  >
                    <div className={`inline-flex items-center rounded-full bg-gradient-to-r ${insight.accent} px-3 py-1 text-xs font-semibold text-white shadow`}>Insight</div>
                    <h2 className="mt-4 text-lg font-semibold text-foreground">{insight.title}</h2>
                    <p className="text-sm text-foreground/70 mt-1">{insight.description}</p>
                    <div className="mt-6 flex items-end justify-between">
                      <span className="text-3xl font-semibold text-foreground">{insight.value}</span>
                      <span className="text-xs font-medium text-foreground/60">{insight.trend}</span>
                    </div>
                  </div>
                ))}
              </section>

              <section className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-5 shadow-lg" data-card>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Health signals</h2>
                    <p className="text-sm text-foreground/60">What stood out in the last 7 days</p>
                  </div>
                  <span className="text-xs rounded-full border border-foreground/10 px-3 py-1 text-foreground/60">Auto-curated</span>
                </div>
                <ul className="mt-4 space-y-3">
                  {healthSignals.map((signal) => (
                    <li key={signal.label} className="rounded-xl border border-foreground/10 bg-background/80 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${signal.tone === "positive" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className="text-sm font-semibold text-foreground">{signal.label}</span>
                      </div>
                      <p className="mt-2 text-sm text-foreground/70">{signal.detail}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 to-white/75 dark:from-[#1a1a2e]/78 dark:to-[#232136]/55 p-5 shadow-lg" data-card>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Highlights & focus</h2>
                  <span className="text-xs text-foreground/60">Compiled from whispers + check-ins</span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {highlightItems.map((section) => (
                    <div key={section.title} className="rounded-xl border border-foreground/10 bg-background/80 px-4 py-3">
                      <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                      <ul className="mt-2 space-y-2 text-sm text-foreground/70 list-disc list-inside">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside ref={rightColRef} className="flex h-full min-h-0 flex-col gap-6">
              <CompanyCard teamName="Core Squad" orgName="Gainsight" />

              <MoodOverviewCard
                mood={moodSummary.mood}
                moodColor={moodSummary.color}
                stats={teamStats}
                progressRef={barRef}
              />

              <RecentCheckinsCard
                history={teamHistory}
                onSelectEntry={() => {}}
              />
            </aside>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
