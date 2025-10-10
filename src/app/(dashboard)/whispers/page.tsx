"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { gsap } from "gsap";

import AuthGuard from "@/components/AuthGuard";
import WhisperComposerCard from "@/components/whispers/WhisperComposerCard";
import WhisperFiltersCard from "@/components/whispers/WhisperFiltersCard";
import WhisperSnapshotCard from "@/components/whispers/WhisperSnapshotCard";
import WhisperParticipantsCard, {
  type WhisperParticipant,
} from "@/components/whispers/WhisperParticipantsCard";
import WhisperCard from "@/components/whispers/WhisperCard";
import FullscreenPostModal from "@/components/whispers/FullscreenPostModal";
import type { Whisper, Category } from "@/components/whispers/types";
import { ORGANIZATION_STORAGE_KEY, TEAM_STORAGE_KEY } from "@/lib/constants";

type OrganizationOption = {
  id: string;
  name: string;
};

type TeamOption = {
  id: string;
  name: string;
  organizationId: string;
};

type ApiComment = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
};

type ApiWhisper = {
  id: string;
  text: string;
  timestamp: string;
  updatedAt: string;
  category: Category;
  likes: number;
  shares: number;
  comments: ApiComment[];
  likedByMe: boolean;
  mine: boolean;
  author: string;
};

type ApiStats = {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  categoryCounts: Record<Category, number>;
};

type ApiParticipant = {
  id: string;
  name: string;
};

type WallResponse = {
  whispers: ApiWhisper[];
  stats: ApiStats;
  participants: ApiParticipant[];
  organizations?: OrganizationOption[];
  organizationId?: string;
  teams?: TeamOption[];
  teamId?: string | null;
};

const COLOR_CLASSES = [
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-purple-500",
  "bg-rose-500",
  "bg-lime-500",
  "bg-teal-500",
];

const STATUS_OPTIONS: WhisperParticipant["status"][] = ["online", "busy", "away"];

const DEFAULT_STATS: ApiStats = {
  totalPosts: 0,
  totalLikes: 0,
  totalComments: 0,
  totalShares: 0,
  categoryCounts: {
    general: 0,
    praise: 0,
    concern: 0,
    idea: 0,
    fun: 0,
  },
};

const pickFromArray = <T,>(input: string, items: T[]): T => {
  const hash = Array.from(input).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return items[hash % items.length];
};

const mapApiComment = (comment: ApiComment) => ({
  id: comment.id,
  author: comment.author,
  text: comment.text,
  timestamp: new Date(comment.timestamp),
});

const mapApiWhisper = (post: ApiWhisper): Whisper => ({
  id: post.id,
  text: post.text,
  timestamp: new Date(post.timestamp),
  category: post.category,
  likes: post.likes,
  shares: post.shares,
  comments: post.comments.map(mapApiComment),
  likedByMe: post.likedByMe,
  mine: post.mine,
  author: post.author,
});

const decorateParticipants = (participants: ApiParticipant[]): WhisperParticipant[] =>
  participants.map((participant) => ({
    id: participant.id,
    name: participant.name,
    colorClass: pickFromArray(participant.id, COLOR_CLASSES),
    status: pickFromArray(participant.id, STATUS_OPTIONS),
  }));

export default function WhisperWallPage() {
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [, setTeams] = useState<TeamOption[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [pickerOrganizationId, setPickerOrganizationId] = useState<string | null>(null);
  const [, setPickerTeamId] = useState<string | null>(null);

  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [stats, setStats] = useState<ApiStats>(DEFAULT_STATS);
  const [participants, setParticipants] = useState<WhisperParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [composerOpen, setComposerOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeCategory, setComposeCategory] = useState<Category>("general");
  const [isSavingWhisper, setIsSavingWhisper] = useState(false);
  const [activePost, setActivePost] = useState<Whisper | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<Set<Category>>(new Set());
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null);

  const fetchWhispersData = useCallback(async (options?: { organizationId?: string | null; teamId?: string | null }) => {
    const params = new URLSearchParams();
    if (options?.organizationId) params.set("organizationId", options.organizationId);
    if (options?.teamId) params.set("teamId", options.teamId);
    const query = params.size ? `?${params.toString()}` : "";

    const response = await fetch(`/api/whispers${query}`, { cache: "no-store" });
    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Unauthorized" };
      }
      const message = await response.text();
      throw new Error(message || "Failed to load whispers");
    }

    return (await response.json()) as WallResponse;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setLoading(true);
      try {
        const savedOrgId = typeof window === "undefined" ? null : localStorage.getItem(ORGANIZATION_STORAGE_KEY);
        const savedTeamId = typeof window === "undefined" ? null : localStorage.getItem(TEAM_STORAGE_KEY);

        const data = await fetchWhispersData({ organizationId: savedOrgId, teamId: savedTeamId });
        if (cancelled) return;

        if ((data as { error?: string }).error === "Unauthorized") {
          setError("Your session expired. Please sign in again.");
          setOrganizations([]);
          setTeams([]);
          setWhispers([]);
          setStats(DEFAULT_STATS);
          setParticipants([]);
          setSelectedOrganizationId(null);
          setPickerOrganizationId(null);
          setSelectedTeamId(null);
          setPickerTeamId(null);
          return;
        }

        const payload = data as WallResponse;
        const normalizedOrganizations = payload.organizations ?? [];
        setOrganizations(normalizedOrganizations);

        const resolvedOrganizationId = (() => {
          if (savedOrgId && normalizedOrganizations.some((org) => org.id === savedOrgId)) {
            return savedOrgId;
          }
          if (payload.organizationId && normalizedOrganizations.some((org) => org.id === payload.organizationId)) {
            return payload.organizationId;
          }
          return normalizedOrganizations[0]?.id ?? null;
        })();

        const normalizedTeams = payload.teams ?? [];
        setTeams(normalizedTeams);

        const resolvedTeamId = (() => {
          if (savedTeamId && normalizedTeams.some((team) => team.id === savedTeamId)) {
            return savedTeamId;
          }
          if (payload.teamId && normalizedTeams.some((team) => team.id === payload.teamId)) {
            return payload.teamId;
          }
          return normalizedTeams[0]?.id ?? null;
        })();

        setSelectedOrganizationId(resolvedOrganizationId);
        setPickerOrganizationId(resolvedOrganizationId);
        setSelectedTeamId(resolvedTeamId);
        setPickerTeamId(resolvedTeamId);

        setWhispers(payload.whispers?.map(mapApiWhisper) ?? []);
        setStats(payload.stats ?? DEFAULT_STATS);
        setParticipants(decorateParticipants(payload.participants ?? []));
        setError(null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load whispers. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [fetchWhispersData]);

  const startEdit = useCallback((post: Whisper) => {
    setComposeText(post.text);
    setComposeCategory(post.category);
    setComposerOpen(true);
    setEditingId(post.id);
    setMenuOpenId(null);
    if (typeof window !== "undefined") {
      setTimeout(() => {
        document.querySelector("#composer-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-anim="filters"]', {
        opacity: 0,
        y: 12,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.from('[data-anim="snapshot"]', {
        opacity: 0,
        y: 12,
        duration: 0.45,
        ease: "power2.out",
        delay: 0.05,
      });
      gsap.from('[data-anim="online"]', {
        opacity: 0,
        y: 12,
        duration: 0.45,
        ease: "power2.out",
        delay: 0.1,
      });
    });

    return () => ctx.revert();
  }, []);

  const visibleWhispers = useMemo(() => {
    if (filters.size === 0) return whispers;
    return whispers.filter((whisper) => filters.has(whisper.category));
  }, [whispers, filters]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-anim="card"]');
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 12 });
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.18,
          ease: "power2.out",
          stagger: 0.05,
        });
      }
    });

    return () => ctx.revert();
  }, [visibleWhispers.length]);

  const pieData = useMemo(
    () => [
      { key: "general" as const, value: stats.categoryCounts.general, color: "#a78bfa", label: "General" },
      { key: "praise" as const, value: stats.categoryCounts.praise, color: "#22c55e", label: "Praise" },
      { key: "concern" as const, value: stats.categoryCounts.concern, color: "#ef4444", label: "Concern" },
      { key: "idea" as const, value: stats.categoryCounts.idea, color: "#3b82f6", label: "Idea" },
      { key: "fun" as const, value: stats.categoryCounts.fun, color: "#f97316", label: "Fun" },
    ],
    [stats.categoryCounts]
  );

  const legendItems = useMemo(
    () => [
      { key: "general" as const, color: "#a78bfa", label: "General", count: stats.categoryCounts.general },
      { key: "praise" as const, color: "#22c55e", label: "Praise", count: stats.categoryCounts.praise },
      { key: "concern" as const, color: "#ef4444", label: "Concern", count: stats.categoryCounts.concern },
      { key: "idea" as const, color: "#3b82f6", label: "Idea", count: stats.categoryCounts.idea },
      { key: "fun" as const, color: "#f97316", label: "Fun", count: stats.categoryCounts.fun },
    ],
    [stats.categoryCounts]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      try {
        const existing = whispers.find((item) => item.id === postId);
        const response = await fetch(`/api/whispers/${postId}/like`, { method: "POST" });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const payload = (await response.json()) as { liked: boolean; likes: number };

        setWhispers((prev) =>
          prev.map((whisper) =>
            whisper.id === postId
              ? { ...whisper, likedByMe: payload.liked, likes: payload.likes }
              : whisper
          )
        );
        setActivePost((prev) =>
          prev && prev.id === postId ? { ...prev, likedByMe: payload.liked, likes: payload.likes } : prev
        );
        setStats((prev) => ({
          ...prev,
          totalLikes: Math.max(0, prev.totalLikes + payload.likes - (existing?.likes ?? 0)),
        }));
      } catch (err) {
        console.error(err);
        setError("Failed to update like. Please try again.");
      }
    },
    [whispers],
  );

  const addComment = useCallback(
    async (postId: string, text: string) => {
      try {
        const response = await fetch(`/api/whispers/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Failed to add comment");
        }

        const payload = (await response.json()) as { comment: ApiComment };
        const comment = mapApiComment(payload.comment);

        setWhispers((prev) =>
          prev.map((whisper) =>
            whisper.id === postId
              ? { ...whisper, comments: [...whisper.comments, comment] }
              : whisper
          )
        );

        setActivePost((prev) =>
          prev && prev.id === postId ? { ...prev, comments: [...prev.comments, comment] } : prev
        );

        setStats((prev) => ({ ...prev, totalComments: prev.totalComments + 1 }));
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to add comment");
      }
    },
    [],
  );

  const incrementShare = useCallback(
    async (postId: string) => {
      try {
        const existing = whispers.find((item) => item.id === postId);
        const response = await fetch(`/api/whispers/${postId}/share`, { method: "POST" });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const payload = (await response.json()) as { shares: number };

        setWhispers((prev) =>
          prev.map((whisper) =>
            whisper.id === postId ? { ...whisper, shares: payload.shares } : whisper
          )
        );
        setActivePost((prev) =>
          prev && prev.id === postId ? { ...prev, shares: payload.shares } : prev
        );
        setStats((prev) => ({
          ...prev,
          totalShares: Math.max(0, prev.totalShares + payload.shares - (existing?.shares ?? 0)),
        }));
      } catch (err) {
        console.error(err);
        setError("Failed to share whisper. Please try again.");
      }
    },
    [whispers],
  );

  const submitWhisper = useCallback(async () => {
    const trimmed = composeText.trim();
    if (!trimmed) return;

    const organizationId = selectedOrganizationId ?? pickerOrganizationId ?? organizations[0]?.id;
    if (!organizationId) {
      setError("Select an organization before posting a whisper.");
      return;
    }

    setIsSavingWhisper(true);
    try {
      if (editingId) {
        const existing = whispers.find((item) => item.id === editingId);
        const response = await fetch(`/api/whispers/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: trimmed, category: composeCategory, organizationId }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Failed to update whisper");
        }

        const payload = await response.json();
        const updated = mapApiWhisper(payload.whisper as ApiWhisper);

        setWhispers((prev) =>
          prev.map((whisper) =>
            whisper.id === updated.id
              ? { ...whisper, text: updated.text, category: updated.category, timestamp: updated.timestamp }
              : whisper
          )
        );
        setActivePost((prev) =>
          prev && prev.id === updated.id
            ? { ...prev, text: updated.text, category: updated.category, timestamp: updated.timestamp }
            : prev
        );

        if (existing && existing.category !== updated.category) {
          setStats((prev) => ({
            ...prev,
            categoryCounts: {
              ...prev.categoryCounts,
              [existing.category]: Math.max(0, prev.categoryCounts[existing.category] - 1),
              [updated.category]: prev.categoryCounts[updated.category] + 1,
            },
          }));
        }
      } else {
        const response = await fetch(`/api/whispers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: trimmed,
            category: composeCategory,
            organizationId,
            teamId: selectedTeamId,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Failed to create whisper");
        }

        const payload = await response.json();
        const created = mapApiWhisper(payload.whisper as ApiWhisper);
        setWhispers((prev) => [created, ...prev]);
        setStats((prev) => ({
          ...prev,
          totalPosts: prev.totalPosts + 1,
          categoryCounts: {
            ...prev.categoryCounts,
            [created.category]: prev.categoryCounts[created.category] + 1,
          },
        }));
      }

      setComposeText("");
      setComposeCategory("general");
      setComposerOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save whisper");
    } finally {
      setIsSavingWhisper(false);
    }
  }, [composeCategory, composeText, editingId, organizations, pickerOrganizationId, selectedOrganizationId, selectedTeamId, whispers]);

  const clearComposer = useCallback(() => {
    setComposeText("");
    setComposeCategory("general");
    setEditingId(null);
  }, []);

  const deletePost = useCallback(
    async (id: string) => {
      if (typeof window !== "undefined") {
        const confirmed = window.confirm("Delete this whisper? This can’t be undone.");
        if (!confirmed) {
          return;
        }
      }

      setDeleteInProgress(id);
      try {
        const target = whispers.find((item) => item.id === id);
        const response = await fetch(`/api/whispers/${id}`, { method: "DELETE" });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Failed to delete whisper");
        }

        setMenuOpenId(null);
        setWhispers((prev) => prev.filter((whisper) => whisper.id !== id));
        setActivePost((prev) => (prev && prev.id === id ? null : prev));

        if (target) {
          setStats((prev) => ({
            totalPosts: Math.max(0, prev.totalPosts - 1),
            totalLikes: Math.max(0, prev.totalLikes - target.likes),
            totalComments: Math.max(0, prev.totalComments - target.comments.length),
            totalShares: Math.max(0, prev.totalShares - target.shares),
            categoryCounts: {
              ...prev.categoryCounts,
              [target.category]: Math.max(0, prev.categoryCounts[target.category] - 1),
            },
          }));
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to delete whisper");
      } finally {
        setDeleteInProgress(null);
      }
    },
    [whispers],
  );

  const reportPost = useCallback((id: string) => {
    console.info("Reported post", id);
    setMenuOpenId(null);
  }, []);

  const openModalWithPost = useCallback((post: Whisper) => {
    setActivePost(post);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setActivePost(null);
  }, []);

  return (
    <AuthGuard>
      <div className="h-screen overflow-hidden bg-background">
        <main className="max-w-6xl mx-auto h-full min-h-0 px-4 sm:px-6">
          <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[70%_30%]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-3 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                {error && (
                  <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                    {error}
                  </div>
                )}
                <WhisperComposerCard
                  isOpen={composerOpen}
                  onToggle={() => setComposerOpen((prev) => !prev)}
                  composeText={composeText}
                  onChangeText={setComposeText}
                  composeCategory={composeCategory}
                  onSelectCategory={setComposeCategory}
                  onClear={clearComposer}
                  onSubmit={submitWhisper}
                  canSubmit={Boolean(composeText.trim()) && !isSavingWhisper}
                  isEditing={Boolean(editingId)}
                />
              </div>

              <section className="flex flex-1 flex-col gap-4 overflow-y-auto no-scrollbar py-4 pr-2">
                {loading && initialLoad ? (
                  <div className="flex flex-1 items-center justify-center py-16 text-sm text-neutral-500">
                    Loading whispers…
                  </div>
                ) : visibleWhispers.length ? (
                  visibleWhispers.map((post) => (
                    <WhisperCard
                      key={post.id}
                      post={post}
                      isMenuOpen={menuOpenId === post.id}
                      onToggleMenu={(id) =>
                        setMenuOpenId((current) => (current === id ? null : id))
                      }
                      onEdit={startEdit}
                      onDelete={deletePost}
                      onReport={reportPost}
                      onLike={toggleLike}
                      onComment={openModalWithPost}
                      onShare={incrementShare}
                      deleting={deleteInProgress === post.id}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💭</div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      No whispers yet
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Be the first to share a thought on the whisper wall!
                    </p>
                  </div>
                )}
              </section>
            </div>

            <aside className="hidden lg:flex h-full min-h-0 flex-col py-2">
              <div className="sticky top-0 h-full min-h-0 flex flex-col space-y-4">
                <WhisperFiltersCard
                  selected={filters}
                  onToggle={(category) =>
                    setFilters((prev) => {
                      const next = new Set(prev);
                      if (next.has(category)) next.delete(category);
                      else next.add(category);
                      return next;
                    })
                  }
                  onClear={() => setFilters(new Set())}
                />

                <WhisperSnapshotCard
                  totalPosts={stats.totalPosts}
                  pieData={pieData}
                  legendItems={legendItems}
                />

                <WhisperParticipantsCard participants={participants} />
              </div>
            </aside>
          </div>
        </main>

        <FullscreenPostModal
          open={modalOpen}
          post={activePost}
          onClose={closeModal}
          onAddComment={addComment}
          onToggleLike={toggleLike}
        />
      </div>
    </AuthGuard>
  );
}
