"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { gsap } from "gsap";

import AuthGuard from "@/components/AuthGuard";
import CheckInCard from "@/components/checkin/CheckInCard";
import CompanyCard from "@/components/checkin/CompanyCard";
import MoodFace from "@/components/checkin/MoodFace";
import MoodOverviewCard from "@/components/checkin/MoodOverviewCard";
import RecentCheckinsCard from "@/components/checkin/RecentCheckinsCard";
import { moodOptions } from "@/components/checkin/constants";

type TeamOption = {
  id: string;
  name: string;
  organization?: string | null;
};

type HistoryItem = {
  id: string;
  mood: number;
  note: string | null;
  createdAt: string;
  teamName: string | null;
};

type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  anonymousUsername: string | null;
};

type TeamFeedItem = {
  id: string;
  mood: number;
  note: string | null;
  createdAt: string;
  anonymousUsername: string | null;
};

type TeamStatsResponse = {
  averageMood: number;
  totalCheckins: number;
  lastCheckinAt: string | null;
} | null;

type DashboardResponse = {
  unauthorized?: boolean;
  teams?: TeamOption[];
  history?: HistoryItem[];
  stats?: TeamStatsResponse;
  teamFeed?: TeamFeedItem[];
};

type TeamStatsState = {
  avg: number;
  total: number;
  updated: string;
};

const TEAM_STORAGE_KEY = "squadpulse.teamId";

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function formatHistoryDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function mapTeamStats(stats?: TeamStatsResponse): TeamStatsState {
  if (!stats) {
    return { avg: 0, total: 0, updated: "—" };
  }

  const average = Number.isFinite(stats.averageMood)
    ? Number((stats.averageMood ?? 0).toFixed(1))
    : 0;

  return {
    avg: average,
    total: stats.totalCheckins ?? 0,
    updated: formatRelativeTime(stats.lastCheckinAt ?? null),
  } satisfies TeamStatsState;
}

function sortTeams(teams: TeamOption[]): TeamOption[] {
  return [...teams].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

function formatOrgName(raw?: string | null) {
  if (!raw) return "Gainsight";
  const base = raw.split("@").pop() ?? raw;
  const domain = base.split(".")[0] ?? base;
  return domain
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function SelectDropdown({
  value,
  options,
  onChange,
  placeholder = "Select",
  className = "",
}: {
  value: string | null;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
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
    if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
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
    <div className={`relative z-30 ${className}`} onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((state) => !state)}
        className="w-full rounded-xl border border-foreground/15 bg-background/80 px-3 py-2 text-left text-foreground shadow-sm transition focus:border-transparent focus:ring-2 focus:ring-[#c084fc] dark:bg-foreground/5"
      >
        <span className="block truncate text-sm">{selectedLabel || placeholder}</span>
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
}

function SpinnerIcon({ size = 48 }: { size?: number }) {
  const dimension = `${size}px`;
  return (
    <span
      className="inline-block animate-spin rounded-full border-4 border-foreground/20 border-t-[#fb7185]"
      style={{ height: dimension, width: dimension }}
    />
  );
}

function FullscreenLoader({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <SpinnerIcon size={56} />
        <p className="text-sm font-medium text-foreground/70">{message}</p>
      </div>
    </div>
  );
}

function InlineLoader({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm">
      <SpinnerIcon size={40} />
      <p className="mt-3 text-xs font-medium text-foreground/70">{message}</p>
    </div>
  );
}

export default function CheckInPage() {
  const { data: session } = useSession();

  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [, setTeamFeed] = useState<TeamFeedItem[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [pickerSelected, setPickerSelected] = useState<string | null>(null);
  const [showTeamPicker, setShowTeamPicker] = useState<boolean>(false);
  const [addingNew, setAddingNew] = useState<boolean>(false);
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [myHistory, setMyHistory] = useState<HistoryItem[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStatsState>({ avg: 0, total: 0, updated: "—" });

  const [historyModal, setHistoryModal] = useState<{ open: boolean; checkinId: string | null }>({ open: false, checkinId: null });
  const [commentsByCheckinId, setCommentsByCheckinId] = useState<Record<string, CommentItem[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [newHistoryComment, setNewHistoryComment] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const userFirstName = useMemo(() => (session?.user?.name ?? "").split(" ")[0] || "there", [session]);
  const selectedMoodColor = useMemo(() => moodOptions.find((mood) => mood.value === selectedMood)?.colorHex ?? null, [selectedMood]);

  const teamOptions = useMemo(() => sortTeams(teams).map((team) => ({ value: team.id, label: team.name })), [teams]);
  const selectedTeam = useMemo(() => teams.find((team) => team.id === selectedTeamId) ?? null, [teams, selectedTeamId]);
  const selectedTeamName = selectedTeam?.name ?? teamOptions.find((team) => team.value === pickerSelected)?.label ?? "Your Team";
  const orgName = useMemo(() => {
    if (selectedTeam?.organization) {
      return formatOrgName(selectedTeam.organization);
    }
    const emailDomain = session?.user?.email?.split("@")[1] ?? null;
    return formatOrgName(emailDomain);
  }, [selectedTeam, session]);

  const teamFaceMood = useMemo(() => {
    const rounded = Math.round(teamStats.avg);
    return Math.min(5, Math.max(1, rounded)) as 1 | 2 | 3 | 4 | 5;
  }, [teamStats.avg]);

  const teamFaceColor = useMemo(
    () => moodOptions.find((option) => option.value === teamFaceMood)?.colorHex ?? "#9ca3af",
    [teamFaceMood],
  );

  const fetchDashboardData = useCallback(async (teamId?: string | null) => {
    const search = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
    const response = await fetch(`/api/checkins${search}`, { cache: "no-store" });

    if (response.status === 401) {
      return { unauthorized: true } satisfies DashboardResponse;
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Failed to load data");
    }

    return (await response.json()) as DashboardResponse;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setIsPageLoading(true);
      try {
        const savedTeamId = typeof window === "undefined" ? null : localStorage.getItem(TEAM_STORAGE_KEY);
        const data = await fetchDashboardData(savedTeamId);
        if (cancelled) return;

        if (data.unauthorized) {
          setTeams([]);
          setMyHistory([]);
          setTeamStats({ avg: 0, total: 0, updated: "—" });
          setSelectedTeamId(null);
          setPickerSelected(null);
          setShowTeamPicker(true);
          setError(null);
          return;
        }

        const normalizedTeams = data.teams ? sortTeams(data.teams) : [];
        setTeams(normalizedTeams);
        setMyHistory(data.history ?? []);
        setTeamStats(mapTeamStats(data.stats));
        setTeamFeed(data.teamFeed ?? []);

        const availableTeamIds = new Set(normalizedTeams.map((team) => team.id));

        if (savedTeamId && availableTeamIds.has(savedTeamId)) {
          setSelectedTeamId(savedTeamId);
          setPickerSelected(savedTeamId);
          setShowTeamPicker(false);
        } else {
          setSelectedTeamId(null);
          setPickerSelected(normalizedTeams[0]?.id ?? null);
          setShowTeamPicker(true);
        }

        setError(null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load check-in data. Please try again.");
          setShowTeamPicker(true);
        }
      } finally {
        if (!cancelled) {
          setIsPageLoading(false);
          setInitialized(true);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [fetchDashboardData]);

  useLayoutEffect(() => {
    if (showTeamPicker) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(leftColRef.current, { y: 20, autoAlpha: 0, duration: 0.5 })
        .from(rightColRef.current, { y: 20, autoAlpha: 0, duration: 0.5 }, "-=0.2");

      if (cardsRef.current) {
        const elements = Array.from(cardsRef.current.querySelectorAll("[data-card]"));
        if (elements.length) {
          tl.from(elements, { y: 16, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, "<");
        }
      }

      const pct = Math.min(100, Math.max(0, (teamStats.avg / 5) * 100));
      if (barRef.current) {
        gsap.set(barRef.current, { width: 0 });
        gsap.to(barRef.current, { width: `${pct}%`, duration: 0.8, ease: "power2.out" });
      }
    });

    return () => ctx.revert();
  }, [showTeamPicker, teamStats.avg]);

  useEffect(() => {
    const pct = Math.min(100, Math.max(0, (teamStats.avg / 5) * 100));
    if (barRef.current) {
      gsap.to(barRef.current, { width: `${pct}%`, duration: 0.6, ease: "power2.out" });
      gsap.fromTo(barRef.current, { scaleY: 0.96 }, { scaleY: 1, duration: 0.3, ease: "power1.out" });
    }
  }, [teamStats.avg]);

  const handleTeamContinue = useCallback(async () => {
    const fallbackTeamId = pickerSelected ?? teams[0]?.id ?? null;
    if (!fallbackTeamId) {
      setError("Please select or create a team to continue.");
      return;
    }

    setIsPageLoading(true);
    try {
      const data = await fetchDashboardData(fallbackTeamId);
      if (data.unauthorized) {
        setError("Your session expired. Please sign in again.");
        setTeams([]);
        setMyHistory([]);
        setTeamStats({ avg: 0, total: 0, updated: "—" });
        setSelectedTeamId(null);
        setPickerSelected(null);
        setShowTeamPicker(true);
        setIsPageLoading(false);
        return;
      }

      setTeams(sortTeams(data.teams ?? []));
      setMyHistory(data.history ?? []);
      setTeamStats(mapTeamStats(data.stats));
      setTeamFeed(data.teamFeed ?? []);
      setSelectedTeamId(fallbackTeamId);
      setPickerSelected(fallbackTeamId);
      setShowTeamPicker(false);
      setError(null);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(TEAM_STORAGE_KEY, fallbackTeamId);
        }
      } catch {}
    } catch (err) {
      console.error(err);
      setError("Failed to load team details. Please try again.");
    } finally {
      setIsPageLoading(false);
    }
  }, [fetchDashboardData, pickerSelected, teams]);

  const handleCreateTeam = useCallback(async () => {
    const trimmedName = newTeamName.trim();
    if (!trimmedName) return;

    setIsCreatingTeam(true);
    try {
      const response = await fetch("/api/checkins/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to create team");
      }

      const payload = await response.json();

      if (payload?.error === "Unauthorized") {
        setError("Your session expired. Please sign in again.");
        return;
      }
      const team = payload.team as TeamOption;

      const updatedTeams = sortTeams([...teams.filter((item) => item.id !== team.id), team]);
      setTeams(updatedTeams);
      setSelectedTeamId(team.id);
      setPickerSelected(team.id);
      setShowTeamPicker(false);
      setAddingNew(false);
      setNewTeamName("");
      setError(null);

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(TEAM_STORAGE_KEY, team.id);
        }
      } catch {}

      setIsPageLoading(true);
      const data = await fetchDashboardData(team.id);
      if (data.unauthorized) {
        setError("Your session expired. Please sign in again.");
        setTeams([]);
        setMyHistory([]);
        setTeamStats({ avg: 0, total: 0, updated: "—" });
        setSelectedTeamId(null);
        setPickerSelected(null);
        setShowTeamPicker(true);
        return;
      }
      setTeams(sortTeams(data.teams ?? []));
      setMyHistory(data.history ?? []);
      setTeamStats(mapTeamStats(data.stats));
      setTeamFeed(data.teamFeed ?? []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setIsCreatingTeam(false);
      setIsPageLoading(false);
    }
  }, [fetchDashboardData, newTeamName, teams]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedMood) return;

      if (!selectedTeamId) {
        setError("Select a team before submitting your check-in.");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      try {
        const response = await fetch("/api/checkins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mood: selectedMood,
            note: comment,
            teamId: selectedTeamId,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Failed to submit check-in");
        }

        const payload = await response.json();
        if (payload.checkin) {
          setMyHistory((prev) => [payload.checkin as HistoryItem, ...prev]);
        }
        if (payload.stats) {
          setTeamStats(mapTeamStats(payload.stats));
        }
        if (payload.teams) {
          setTeams(sortTeams(payload.teams));
        }

        setIsSubmitted(true);
        setSelectedMood(null);
        setComment("");
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to submit check-in");
      } finally {
        setIsSubmitting(false);
      }
    },
    [comment, selectedMood, selectedTeamId],
  );

  const resetForm = useCallback(() => {
    setSelectedMood(null);
    setComment("");
    setIsSubmitted(false);
  }, []);

  const openHistoryModal = useCallback(
    (checkinId: string) => {
      setHistoryModal({ open: true, checkinId });
      setNewHistoryComment("");

      if (commentsByCheckinId[checkinId]) return;

      setLoadingComments((prev) => ({ ...prev, [checkinId]: true }));

      fetch(`/api/checkins/${checkinId}/comments`, { cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch comments");
          return response.json();
        })
        .then((data: { comments?: CommentItem[] }) => {
          setCommentsByCheckinId((prev) => ({ ...prev, [checkinId]: data.comments ?? [] }));
        })
        .catch((err) => {
          console.error(err);
          setError("Could not load comments for this check-in.");
        })
        .finally(() => {
          setLoadingComments((prev) => ({ ...prev, [checkinId]: false }));
        });
    },
    [commentsByCheckinId],
  );

  const closeHistoryModal = useCallback(() => setHistoryModal({ open: false, checkinId: null }), []);

  const addHistoryComment = useCallback(async () => {
    if (!historyModal.checkinId) return;
    const trimmed = newHistoryComment.trim();
    if (!trimmed) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/checkins/${historyModal.checkinId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to add comment");
      }

      const payload = await response.json();
      if (payload.comment) {
        setCommentsByCheckinId((prev) => ({
          ...prev,
          [historyModal.checkinId!]: [payload.comment as CommentItem, ...(prev[historyModal.checkinId!] ?? [])],
        }));
      }

      setNewHistoryComment("");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  }, [historyModal.checkinId, newHistoryComment]);

  const activeHistory = useMemo(
    () => (historyModal.checkinId ? myHistory.find((item) => item.id === historyModal.checkinId) ?? null : null),
    [historyModal.checkinId, myHistory],
  );

  const activeComments = historyModal.checkinId ? commentsByCheckinId[historyModal.checkinId] ?? [] : [];
  const commentsLoading = historyModal.checkinId ? loadingComments[historyModal.checkinId] ?? false : false;

  const showFullScreenLoader = !initialized || (isPageLoading && !showTeamPicker);

  if (showFullScreenLoader) {
    return (
      <AuthGuard>
        <FullscreenLoader
          message={!initialized ? "Preparing your check-in dashboard…" : "Loading your check-in dashboard…"}
        />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      {showTeamPicker ? (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="relative w-full max-w-lg rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/90 to-white/70 p-8 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/40 text-center dark:from-[#1a1a2e]/90 dark:to-[#232136]/70">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Choose your team to start</h1>
            <p className="mt-2 text-sm text-foreground/70">We’ll remember your choice on this device.</p>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            <div className="mt-6 space-y-4 text-left">
              <label htmlFor="team-picker" className="text-sm font-medium text-foreground/90">
                Select your team
              </label>
              <SelectDropdown
                value={pickerSelected}
                options={teamOptions}
                onChange={(value) => {
                  setPickerSelected(value);
                  setAddingNew(false);
                }}
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAddingNew((state) => !state)}
                  className="text-sm font-semibold text-foreground hover:text-[#fb7185]"
                >
                  {addingNew ? "Cancel" : "➕ Add a new team"}
                </button>
                <button
                  type="button"
                  disabled={addingNew || isPageLoading}
                  onClick={handleTeamContinue}
                  className={`rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] px-4 py-2 text-sm font-semibold text-white transition ${
                    addingNew || isPageLoading ? "cursor-not-allowed opacity-50" : "hover:opacity-95"
                  }`}
                >
                  {isPageLoading ? "Loading…" : "Continue"}
                </button>
              </div>

              {addingNew && (
                <div className="mt-3 space-y-3">
                  <label htmlFor="new-team" className="text-sm font-medium text-foreground/90">
                    New team name
                  </label>
                  <input
                    id="new-team"
                    value={newTeamName}
                    onChange={(event) => setNewTeamName(event.target.value)}
                    placeholder="e.g. Platform Tribe"
                    className="w-full rounded-xl border border-foreground/15 bg-background/80 px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-transparent focus:ring-2 focus:ring-[#fb7185] dark:bg-foreground/5"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isCreatingTeam || !newTeamName.trim()}
                      onClick={handleCreateTeam}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        !newTeamName.trim()
                          ? "cursor-not-allowed bg-foreground/10 text-foreground/60"
                          : "bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white hover:opacity-95"
                      }`}
                    >
                      {isCreatingTeam ? "Saving…" : "Save & continue"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 text-xs text-foreground/60">You can change teams anytime in the settings.</div>

            {isPageLoading && <InlineLoader message="Loading your team dashboard…" />}
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <main className="mx-auto max-w-8xl px-6 py-8" ref={cardsRef}>
            {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[7fr_3fr]">
              <div
                ref={leftColRef}
                className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-6"
              >
                <h1 className="text-center text-3xl font-semibold text-foreground md:text-4xl">
                  How are you feeling today,
                  <span className="bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] bg-clip-text text-transparent">
                    {` ${userFirstName}`}
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

              <div ref={rightColRef} className="flex h-[calc(100vh-4rem)] flex-col space-y-6">
                <CompanyCard teamName={selectedTeamName} orgName={orgName} />
                <MoodOverviewCard
                  data-card
                  mood={teamFaceMood}
                  moodColor={teamFaceColor}
                  stats={teamStats}
                  progressRef={barRef}
                />
                <RecentCheckinsCard
                  data-card
                  history={myHistory}
                  onSelectEntry={openHistoryModal}
                />
              </div>
            </div>
          </main>
        </div>
      )}

      {historyModal.open && activeHistory && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(event) => {
            if (event.currentTarget === event.target) closeHistoryModal();
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl border border-foreground/10 bg-gradient-to-br from-white/95 to-white/80 p-6 shadow-2xl dark:from-[#151527]/95 dark:to-[#1a1a2e]/80" role="dialog" aria-modal="true">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const mood = moodOptions.find((item) => item.value === activeHistory.mood);
                  const color = mood?.colorHex ?? "#9ca3af";
                  const label = mood?.label ?? `Mood ${activeHistory.mood}`;
                  return (
                    <>
                      <MoodFace mood={activeHistory.mood as 1 | 2 | 3 | 4 | 5} activeColor={color} size={40} />
                      <div>
                        <div className="text-base font-semibold text-foreground">
                          {label} <span className="ml-1 text-foreground/60">· {activeHistory.mood}/5</span>
                        </div>
                        <div className="text-xs text-foreground/60">
                          {formatHistoryDate(activeHistory.createdAt)}
                          {activeHistory.teamName ? ` · ${activeHistory.teamName}` : ""}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              <button onClick={closeHistoryModal} className="rounded-full p-1.5 hover:bg-foreground/10" aria-label="Close">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {activeHistory.note && (
                <div className="rounded-xl border border-foreground/10 bg-foreground/[.03] p-3 text-sm text-foreground">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                    Original note
                  </div>
                  <div>{activeHistory.note}</div>
                </div>
              )}

              <div className="rounded-xl border border-foreground/10 bg-foreground/[.03] p-3">
                <div className="mb-2 text-sm font-semibold text-foreground">Comments</div>
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {commentsLoading ? (
                    <div className="text-xs text-foreground/60">Loading comments…</div>
                  ) : activeComments.length === 0 ? (
                    <div className="text-xs text-foreground/60">No comments yet.</div>
                  ) : (
                    activeComments.map((commentItem) => (
                      <div key={commentItem.id} className="rounded-lg border border-foreground/10 bg-background/80 px-3 py-2 text-sm text-foreground">
                        <div className="mb-1 text-xs font-semibold text-foreground/60">
                          {commentItem.anonymousUsername ?? "Anonymous"} · {formatRelativeTime(commentItem.createdAt)}
                        </div>
                        <div>{commentItem.content}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={newHistoryComment}
                    onChange={(event) => setNewHistoryComment(event.target.value)}
                    placeholder="Add a comment…"
                    className="flex-1 rounded-xl border border-foreground/15 bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-transparent focus:ring-2 focus:ring-[#c084fc] dark:bg-foreground/5"
                  />
                  <button
                    type="button"
                    onClick={addHistoryComment}
                    disabled={!newHistoryComment.trim() || isSubmittingComment}
                    className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                      !newHistoryComment.trim() || isSubmittingComment
                        ? "cursor-not-allowed bg-foreground/10 text-foreground/60"
                        : "bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white hover:opacity-95"
                    }`}
                  >
                    {isSubmittingComment ? "Adding…" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
