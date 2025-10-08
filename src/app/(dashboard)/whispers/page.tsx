"use client";

import { useEffect, useMemo, useState } from "react";
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

const sampleWhispers: Whisper[] = [
  {
    id: "1",
    text: "Great code review today! Really helpful feedback.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    category: "praise",
    likes: 8,
    shares: 1,
    comments: [
      {
        id: "c1",
        author: "Anon-7",
        text: "Agree! Super crisp points. 🙌",
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
      },
    ],
    likedByMe: false,
    mine: false,
  },
  {
    id: "2",
    text: "We're blocked on the API integration. Need help!",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    category: "concern",
    likes: 3,
    shares: 0,
    comments: [
      {
        id: "c2",
        author: "Anon-2",
        text: "DM me the error logs. I can take a look.",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        id: "c3",
        author: "Anon-4",
        text: "Is this on staging or prod? 🤔",
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
      },
    ],
    likedByMe: false,
    mine: false,
  },
  {
    id: "3",
    text: "What if we added dark mode to the dashboard?",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    category: "idea",
    likes: 12,
    shares: 2,
    comments: [],
    likedByMe: true,
    mine: false,
  },
  {
    id: "4",
    text: "Coffee break anyone? ☕",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    category: "fun",
    likes: 5,
    shares: 0,
    comments: [
      {
        id: "c4",
        author: "Anon-9",
        text: "Always. ☕+💻 = ❤️",
        timestamp: new Date(Date.now() - 1000 * 60 * 55),
      },
    ],
    likedByMe: false,
    mine: false,
  },
];

const sampleParticipants: WhisperParticipant[] = [
  { id: "u1", name: "Harsh", role: "Engineering", colorClass: "bg-orange-500", status: "online" },
  { id: "u2", name: "Priya", role: "Design", colorClass: "bg-pink-500", status: "busy" },
  { id: "u3", name: "Aman", role: "Product", colorClass: "bg-indigo-500", status: "online" },
  { id: "u4", name: "Neha", role: "Quality", colorClass: "bg-emerald-500", status: "away" },
  { id: "u5", name: "Ravi", role: "Support", colorClass: "bg-blue-500", status: "online" },
];

export default function WhisperWallPage() {
  const [whispers, setWhispers] = useState<Whisper[]>(sampleWhispers);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeCategory, setComposeCategory] = useState<Category>("general");
  const [activePost, setActivePost] = useState<Whisper | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<Set<Category>>(new Set());

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const startEdit = (post: Whisper) => {
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
  };

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

      const cards = gsap.utils.toArray<HTMLElement>(
        '[data-anim="card"]:not([data-animated="1"])'
      );
      if (cards.length) {
        gsap.set(cards, { opacity: 0, y: 12 });
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.1,
          ease: "power2.out",
          stagger: 0.08,
          onComplete: () => {
            cards.forEach((el) => el.setAttribute("data-animated", "1"));
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  const visibleWhispers = useMemo(() => {
    if (filters.size === 0) return whispers;
    return whispers.filter((whisper) => filters.has(whisper.category));
  }, [whispers, filters]);

  const stats = useMemo(() => {
    const categoryCounts: Record<Category, number> = {
      general: 0,
      praise: 0,
      concern: 0,
      idea: 0,
      fun: 0,
    };
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    for (const whisper of whispers) {
      categoryCounts[whisper.category] += 1;
      totalLikes += whisper.likes;
      totalComments += whisper.comments.length;
      totalShares += whisper.shares;
    }
    const totalPosts = whispers.length || 1;
    return { categoryCounts, totalLikes, totalComments, totalShares, totalPosts };
  }, [whispers]);

  const pieData = useMemo(
    () => [
      { key: "general" as const, value: stats.categoryCounts.general, color: "#a78bfa", label: "General" },
      { key: "praise" as const, value: stats.categoryCounts.praise, color: "#22c55e", label: "Praise" },
      { key: "concern" as const, value: stats.categoryCounts.concern, color: "#ef4444", label: "Concern" },
      { key: "idea" as const, value: stats.categoryCounts.idea, color: "#3b82f6", label: "Idea" },
      { key: "fun" as const, value: stats.categoryCounts.fun, color: "#f97316", label: "Fun" },
    ],
    [
      stats.categoryCounts.general,
      stats.categoryCounts.praise,
      stats.categoryCounts.concern,
      stats.categoryCounts.idea,
      stats.categoryCounts.fun,
    ]
  );

  const legendItems = useMemo(
    () => [
      { key: "general" as const, color: "#a78bfa", label: "General", count: stats.categoryCounts.general },
      { key: "praise" as const, color: "#22c55e", label: "Praise", count: stats.categoryCounts.praise },
      { key: "concern" as const, color: "#ef4444", label: "Concern", count: stats.categoryCounts.concern },
      { key: "idea" as const, color: "#3b82f6", label: "Idea", count: stats.categoryCounts.idea },
      { key: "fun" as const, color: "#f97316", label: "Fun", count: stats.categoryCounts.fun },
    ],
    [
      stats.categoryCounts.general,
      stats.categoryCounts.praise,
      stats.categoryCounts.concern,
      stats.categoryCounts.idea,
      stats.categoryCounts.fun,
    ]
  );

  const toggleLike = (postId: string) => {
    setWhispers((prev) =>
      prev.map((whisper) =>
        whisper.id === postId
          ? {
              ...whisper,
              likedByMe: !whisper.likedByMe,
              likes: whisper.likedByMe ? Math.max(0, whisper.likes - 1) : whisper.likes + 1,
            }
          : whisper
      )
    );
  };

  const addComment = (postId: string, text: string) => {
    const newComment = {
      id: `${Date.now()}`,
      author: `Anon-${Math.floor(1 + Math.random() * 99)}`,
      text,
      timestamp: new Date(),
    };

    setWhispers((prev) =>
      prev.map((whisper) =>
        whisper.id === postId
          ? { ...whisper, comments: [...whisper.comments, newComment] }
          : whisper
      )
    );

    setActivePost((prev) =>
      prev && prev.id === postId ? { ...prev, comments: [...prev.comments, newComment] } : prev
    );
  };

  const incrementShare = (postId: string) => {
    setWhispers((prev) =>
      prev.map((whisper) =>
        whisper.id === postId ? { ...whisper, shares: whisper.shares + 1 } : whisper
      )
    );
  };

  const submitWhisper = () => {
    if (!composeText.trim()) return;

    if (editingId) {
      setWhispers((prev) =>
        prev.map((whisper) =>
          whisper.id === editingId
            ? {
                ...whisper,
                text: composeText.trim(),
                category: composeCategory,
                timestamp: new Date(),
              }
            : whisper
        )
      );
      setEditingId(null);
    } else {
      const newPost: Whisper = {
        id: `${Date.now()}`,
        text: composeText.trim(),
        timestamp: new Date(),
        category: composeCategory,
        likes: 0,
        shares: 0,
        comments: [],
        likedByMe: false,
        mine: true,
      };
      setWhispers((prev) => [newPost, ...prev]);
    }

    setComposeText("");
    setComposeCategory("general");
    setComposerOpen(false);
  };

  const clearComposer = () => {
    setComposeText("");
    setComposeCategory("general");
    setEditingId(null);
  };

  const deletePost = (id: string) => {
    setWhispers((prev) => prev.filter((whisper) => whisper.id !== id));
    setMenuOpenId(null);
  };

  const reportPost = (id: string) => {
    console.log("Reported post:", id);
    setMenuOpenId(null);
  };

  const openModalWithPost = (post: Whisper) => {
    setActivePost(post);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActivePost(null);
  };

  return (
    <AuthGuard>
      <div className="h-screen overflow-hidden bg-background">
        <main className="max-w-6xl mx-auto h-full min-h-0 px-4 sm:px-6">
          <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[70%_30%]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-3 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <WhisperComposerCard
                  isOpen={composerOpen}
                  onToggle={() => setComposerOpen((prev) => !prev)}
                  composeText={composeText}
                  onChangeText={setComposeText}
                  composeCategory={composeCategory}
                  onSelectCategory={setComposeCategory}
                  onClear={clearComposer}
                  onSubmit={submitWhisper}
                  canSubmit={Boolean(composeText.trim())}
                  isEditing={Boolean(editingId)}
                />
              </div>

              <section className="flex flex-1 flex-col gap-4 overflow-y-auto no-scrollbar py-4 pr-2">
                {visibleWhispers.map((post) => (
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
                  />
                ))}

                {visibleWhispers.length === 0 && (
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

                <WhisperParticipantsCard participants={sampleParticipants} />
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
