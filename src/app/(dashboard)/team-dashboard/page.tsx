"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

import AuthGuard from "@/components/AuthGuard";
import CompanyCard from "@/components/checkin/CompanyCard";
import MoodOverviewCard from "@/components/checkin/MoodOverviewCard";
import RecentCheckinsCard, { type CheckInHistoryItem as RecentCheckinItem } from "@/components/checkin/RecentCheckinsCard";
import CheckinTrendCard from "@/components/team/CheckinTrendCard";
import SentimentSignalsCard, { type SentimentSignal } from "@/components/team/SentimentSignalsCard";
import TeamCheckinsChart from "@/components/team/TeamCheckinsChart";
import TeamMoodDistributionChart from "@/components/team/TeamMoodDistributionChart";
import TeamOverviewCard, { type OverviewMetric } from "@/components/team/TeamOverviewCard";
import { useTeamPreferences } from "@/components/team/TeamPreferencesProvider";
import type { TeamDashboardData } from "@/lib/checkin-service";
import { getMoodColor, getMoodOption } from "@/lib/mood";

function formatLastUpdated(timestamp: string | null) {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function TeamDashboardContent() {
  const { ready: preferencesReady, selection, openSelector } = useTeamPreferences();
  const [data, setData] = useState<TeamDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [layoutReady, setLayoutReady] = useState(false);

  const lastRequestedTeamId = useRef<string | null>(null);
  const requestInFlight = useRef(false);

  const fetchDashboard = useCallback(
    async (teamId?: string | null) => {
      requestInFlight.current = true;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (teamId) params.set("teamId", teamId);
        const response = await fetch(`/api/team/dashboard${params.size ? `?${params.toString()}` : ""}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to fetch team dashboard");
        }
        const payload = await response.json();
        if ((payload as { needsSelection?: boolean }).needsSelection) {
          openSelector();
          setData(null);
          setError(null);
        } else {
          setData(payload as TeamDashboardData);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load team dashboard");
        setData(null);
      } finally {
        setLoading(false);
        setLayoutReady(true);
        requestInFlight.current = false;
      }
    },
    [openSelector],
  );

  useEffect(() => {
    if (!preferencesReady) return;
    const teamId = selection.teamId ?? null;

    if (!teamId) {
      openSelector();
      setData(null);
      lastRequestedTeamId.current = null;
      return;
    }

    if (lastRequestedTeamId.current === teamId && (data || requestInFlight.current)) {
      return;
    }

    lastRequestedTeamId.current = teamId;
    fetchDashboard(teamId);
  }, [preferencesReady, selection.teamId, fetchDashboard, openSelector, data]);

  useEffect(() => {
    if (!layoutReady) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-team-card]", {
        y: 16,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.05,
      });
    });
    return () => ctx.revert();
  }, [layoutReady, data]);

  const teamMoodOverview = useMemo(() => {
    const averageMood = data?.stats.averageMood ?? 3;
    const rounded = Math.min(5, Math.max(1, Math.round(averageMood || 3))) as 1 | 2 | 3 | 4 | 5;
    const option = getMoodOption(rounded);
    return {
      mood: rounded,
      color: option?.colorHex ?? getMoodColor(rounded),
      avg: data ? Number(data.stats.averageMood.toFixed(1)) : 0,
      total: data?.stats.totalCheckins7d ?? 0,
      updated: formatLastUpdated(data?.stats.lastCheckinAt ?? null),
    };
  }, [data]);

  const overviewMetrics = useMemo<OverviewMetric[]>(() => {
    if (!data) {
      return [
        { title: "Average mood", description: "Last 7 days", value: "—" },
        { title: "Check-ins (7d)", description: "Team submissions", value: "—" },
        { title: "Active members", description: "Checked in this week", value: "—" },
        { title: "Last check-in", description: "Most recent update", value: "—" },
      ];
    }

    const delta = data.stats.averageMood - 3;
    const deltaLabel =
      Math.abs(delta) < 0.05 ? "Flat vs neutral" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} vs neutral`;
    const participationRatio = data.stats.totalMembers
      ? Math.round((data.stats.activeMembers7d / data.stats.totalMembers) * 100)
      : 0;

    return [
      {
        title: "Average mood",
        description: "Last 7 days",
        value: `${data.stats.averageMood.toFixed(1)} / 5`,
        delta: deltaLabel,
        accent: delta >= 0 ? "text-emerald-500" : "text-rose-500",
      },
      {
        title: "Check-ins (7d)",
        description: "Team submissions",
        value: `${data.stats.totalCheckins7d}`,
      },
      {
        title: "Active members",
        description: `Participation ${participationRatio}%`,
        value: `${data.stats.activeMembers7d} / ${data.stats.totalMembers}`,
      },
      {
        title: "Last check-in",
        description: "Most recent update",
        value: formatLastUpdated(data.stats.lastCheckinAt ?? null),
      },
    ];
  }, [data]);

  const trendPoints = useMemo(() => {
    const fallbackLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if (!data) {
      return fallbackLabels.map((label) => ({ label, value: 0 }));
    }
    return data.weekly.map((point) => ({
      label: point.label,
      value: point.checkins,
    }));
  }, [data]);

  const sentimentSignals = useMemo<SentimentSignal[]>(() => {
    if (!data) {
      return [
        {
          title: "Gathering team signals",
          description: "Once your team starts checking in, we’ll surface insights and nudges here.",
          tone: "neutral",
        },
      ];
    }

    const delta = data.stats.averageMood - 3;
    const participationRatio = data.stats.totalMembers
      ? Math.round((data.stats.activeMembers7d / data.stats.totalMembers) * 100)
      : 0;
    const distributionTop = [...data.moodDistribution].sort((a, b) => b.count - a.count)[0];
    const topMoodOption = distributionTop ? getMoodOption(distributionTop.mood) : null;

    return [
      {
        title: delta >= 0 ? "Team energy trending up" : "Mood dip detected",
        description:
          delta >= 0
            ? `Average mood is ${data.stats.averageMood.toFixed(1)} — keep reinforcing what’s working.`
            : `Average mood slipped to ${data.stats.averageMood.toFixed(1)}. Consider a quick retro to spot blockers.`,
        tone: delta > 0.2 ? "positive" : delta < -0.2 ? "caution" : "neutral",
      },
      {
        title: "Participation pulse",
        description: `Check-in participation is ${participationRatio}% of the team this week.`,
        tone: participationRatio >= 70 ? "positive" : participationRatio >= 40 ? "neutral" : "caution",
      },
      {
        title: "Dominant mood",
        description: topMoodOption
          ? `${topMoodOption.label} moods led with ${distributionTop?.count ?? 0} entries.`
          : "We need a few more check-ins to identify the dominant mood.",
        tone: topMoodOption && topMoodOption.value >= 4 ? "positive" : "neutral",
      },
    ];
  }, [data]);

  const recentHistory = useMemo<RecentCheckinItem[]>(() => {
    if (!data) return [];
    return data.recentCheckins.map((entry) => ({
      id: entry.id,
      createdAt: entry.createdAt,
      mood: entry.mood,
      note: entry.note,
      teamName: entry.anonymousUsername ?? "Anonymous teammate",
    }));
  }, [data]);

  const handleSelectRecentCheckin = useCallback((checkinId: string) => {
    console.debug("Selected team check-in", checkinId);
  }, []);

  const handleTrendRangeChange = useCallback((nextRange: string) => {
    console.debug("Trend range change requested", nextRange);
  }, []);

  return (
    <div className="min-h-screen bg-background supports-[backdrop-filter]:bg-background/80">
      <main className="mx-auto max-w-8xl px-6 py-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
          <div className="flex flex-col gap-6 overflow-y-auto pb-8 lg:max-h-[calc(100vh-4rem)] lg:pr-2">
            <TeamOverviewCard data-team-card metrics={overviewMetrics} />

            <section
              data-team-card
              className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/95 to-white/80 dark:from-[#1a1a2e]/85 dark:to-[#232136]/65 p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Weekly check-ins</h2>
                <span className="text-xs text-foreground/60">Includes mood average overlay</span>
              </div>
              <div className="h-64">
                {data ? <TeamCheckinsChart points={data.weekly} /> : <span className="text-sm text-foreground/50">Loading…</span>}
              </div>
            </section>

            <section
              data-team-card
              className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/95 to-white/80 dark:from-[#1a1a2e]/85 dark:to-[#232136]/65 p-6 shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Mood distribution (30d)</h2>
              </div>
              <div className="h-60">
                {data ? (
                  <TeamMoodDistributionChart buckets={data.moodDistribution} />
                ) : (
                  <span className="text-sm text-foreground/50">Loading…</span>
                )}
              </div>
            </section>

            <CheckinTrendCard
              data-team-card
              title="Daily check-in volume"
              range="7d"
              ranges={["7d"]}
              data={trendPoints}
              onRangeChange={handleTrendRangeChange}
            />

            <SentimentSignalsCard data-team-card signals={sentimentSignals} />
          </div>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-8">
            <CompanyCard
              data-team-card
              teamName={data?.teamName ?? "Select a team"}
              orgName={data?.organizationName ?? "—"}
            />

            <MoodOverviewCard
              data-team-card
              mood={teamMoodOverview.mood}
              moodColor={teamMoodOverview.color}
              stats={{
                avg: teamMoodOverview.avg,
                total: teamMoodOverview.total,
                updated: teamMoodOverview.updated,
              }}
              title="Team weekly pulse"
            />

            <RecentCheckinsCard data-team-card history={recentHistory} onSelectEntry={handleSelectRecentCheckin} />
          </aside>
        </div>

          {loading && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/10 backdrop-blur-sm">
              <div className="rounded-full border-4 border-foreground/20 border-t-[#fb7185] h-12 w-12 animate-spin" />
            </div>
          )}
      </main>
    </div>
  );
}

export default function TeamDashboardPage() {
  return (
    <AuthGuard>
      <TeamDashboardContent />
    </AuthGuard>
  );
}
