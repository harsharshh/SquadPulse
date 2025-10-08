"use client";

import { useMemo, useRef, useLayoutEffect, useState } from "react";
import { gsap } from "gsap";

import AuthGuard from "@/components/AuthGuard";
import TeamOverviewCard, { type OverviewMetric } from "@/components/team/TeamOverviewCard";
import CheckinTrendCard, { type CheckinPoint } from "@/components/team/CheckinTrendCard";
import SentimentSignalsCard, { type SentimentSignal } from "@/components/team/SentimentSignalsCard";

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

export default function TeamDashboardPage() {
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const [range, setRange] = useState("Week");
  const [sentimentRange, setSentimentRange] = useState("Week");

  const overviewMetrics = useMemo<OverviewMetric[]>(
    () => [
      {
        title: "Active mood average",
        description: "Rolling 7-day employee pulse",
        value: "4.1 / 5",
        delta: "+0.3 vs last week",
        accent: "text-emerald-500",
      },
      {
        title: "Participation",
        description: "Check-ins submitted in the past 14 days",
        value: "89%",
        delta: "Flat week over week",
        accent: "text-slate-500",
      },
      {
        title: "Burnout watchlist",
        description: "Members flagged for follow up",
        value: "3",
        delta: "↓ 2 since Monday",
        accent: "text-emerald-500",
      },
      {
        title: "Psych safety",
        description: "Confidence to raise concerns anonymously",
        value: "82 / 100",
        delta: "+5 pts",
        accent: "text-emerald-500",
      },
    ],
    []
  );

  const trendData = useMemo<Record<string, CheckinPoint[]>>(
    () => ({
      Week: [
        { label: "Mon", value: 18 },
        { label: "Tue", value: 21 },
        { label: "Wed", value: 26 },
        { label: "Thu", value: 24 },
        { label: "Fri", value: 19 },
      ],
      Month: [
        { label: "Week 1", value: 92 },
        { label: "Week 2", value: 104 },
        { label: "Week 3", value: 98 },
        { label: "Week 4", value: 87 },
      ],
      Quarter: [
        { label: "Jan", value: 310 },
        { label: "Feb", value: 342 },
        { label: "Mar", value: 328 },
      ],
    }),
    []
  );

  const sentimentTrend = useMemo<Record<string, CheckinPoint[]>>(
    () => ({
      Week: [
        { label: "Mon", value: 18, positive: 12, neutral: 4, negative: 2 },
        { label: "Tue", value: 21, positive: 15, neutral: 4, negative: 2 },
        { label: "Wed", value: 26, positive: 18, neutral: 6, negative: 2 },
        { label: "Thu", value: 24, positive: 16, neutral: 5, negative: 3 },
        { label: "Fri", value: 19, positive: 12, neutral: 4, negative: 3 },
      ],
      Month: [
        { label: "Week 1", value: 92, positive: 64, neutral: 18, negative: 10 },
        { label: "Week 2", value: 104, positive: 71, neutral: 20, negative: 13 },
        { label: "Week 3", value: 98, positive: 66, neutral: 22, negative: 10 },
        { label: "Week 4", value: 87, positive: 58, neutral: 19, negative: 10 },
      ],
      Quarter: [
        { label: "Jan", value: 310, positive: 214, neutral: 62, negative: 34 },
        { label: "Feb", value: 342, positive: 233, neutral: 70, negative: 39 },
        { label: "Mar", value: 328, positive: 221, neutral: 69, negative: 38 },
      ],
    }),
    []
  );

  const sentimentSignals = useMemo<SentimentSignal[]>(
    () => [
      {
        title: "Shipping confidence is high",
        description: "Product squad reported 12 wins in the last 48h",
        tone: "positive",
      },
      {
        title: "Meetings fatigue",
        description: "12% of check-ins mentioned long syncs—consider async updates",
        tone: "caution",
      },
      {
        title: "Support load easing",
        description: "After-hours pings dropped by 37% week over week",
        tone: "positive",
      },
    ],
    []
  );

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (layoutRef.current) {
        gsap.from(layoutRef.current.querySelectorAll("[data-card]") as NodeListOf<HTMLElement>, {
          y: 18,
          autoAlpha: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.08,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background supports-[backdrop-filter]:bg-background/80">
        <main className="mx-auto max-w-8xl px-6 py-8">
          <div ref={layoutRef} className="flex flex-col gap-6">
            <section
              data-card
              className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/65 dark:from-[#1a1a2e]/80 dark:to-[#232136]/60 p-8 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40"
            >
              <p className="inline-flex items-center rounded-full border border-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Pulse overview
              </p>
              <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-foreground">
                Team dashboard
                <span className="block text-lg font-medium text-foreground/60 mt-2">
                  Real-time mood, health, and participation signals across Squad Pulse
                </span>
              </h1>
            </section>

            <TeamOverviewCard metrics={overviewMetrics} />

            <CheckinTrendCard
              title="Check-in volume"
              range={range}
              ranges={["Week", "Month", "Quarter"]}
              data={trendData[range]}
              onRangeChange={setRange}
            />

            <CheckinTrendCard
              title="Sentiment mix"
              range={sentimentRange}
              ranges={["Week", "Month", "Quarter"]}
              data={sentimentTrend[sentimentRange]}
              onRangeChange={setSentimentRange}
            />

            <SentimentSignalsCard signals={sentimentSignals} />

            <section
              data-card
              className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/92 to-white/75 dark:from-[#1a1a2e]/78 dark:to-[#232136]/55 p-5 shadow-lg"
            >
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
        </main>
      </div>
    </AuthGuard>
  );
}
