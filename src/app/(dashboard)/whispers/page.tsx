"use client";

import { useEffect, useMemo, useState } from "react";

import { gsap } from "gsap";
import AuthGuard from "@/components/AuthGuard";
import { CategoryIcon } from "@/components/icons/WhisperCategoryIcons";

// ---------- Types ----------
interface Comment {
  id: string;
  author: string; // Anonymous display only
  text: string;
  timestamp: Date;
}

type Category = "general" | "praise" | "concern" | "idea" | "fun";

interface Whisper {
  id: string;
  text: string;
  timestamp: Date;
  category: Category;
  likes: number;
  shares: number;
  comments: Comment[];
  likedByMe?: boolean;
  mine?: boolean; // indicates whether the current user posted this whisper
}

// ---------- UI helpers ----------
const categoryColors: Record<Category, string> = {
  general: "bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-purple-900/20 dark:via-pink-900/20 dark:to-neutral-900 border-purple-200/60 dark:border-pink-800/60",
  praise: "bg-green-50 dark:bg-green-900/20 border-green-200/80 dark:border-green-800/70",
  concern: "bg-red-50 dark:bg-red-900/20 border-red-200/80 dark:border-red-800/70",
  idea: "bg-blue-50 dark:bg-blue-900/20 border-blue-200/80 dark:border-blue-800/70",
  fun: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200/80 dark:border-yellow-800/70",
};

const categoryTheme: Record<Category, { bar: string; text: string; }> = {
  general: { bar: "bg-gradient-to-r from-[#a78bfa] via-[#fb7185] to-[#fbcfe8]", text: "text-[#7c3aed]" },
  praise:  { bar: "bg-gradient-to-r from-[#22c55e] to-[#34d399]",            text: "text-[#16a34a]" },
  concern: { bar: "bg-gradient-to-r from-[#ef4444] to-[#fb7185]",            text: "text-[#dc2626]" },
  idea:    { bar: "bg-gradient-to-r from-[#3b82f6] to-[#22d3ee]",            text: "text-[#2563eb]" },
  fun:     { bar: "bg-gradient-to-r from-[#f59e0b] to-[#f97316]",            text: "text-[#d97706]" },
};



const categoryLabels: { key: Category; label: string }[] = [
  { key: "general", label: "General" },
  { key: "praise", label: "Praise" },
  { key: "concern", label: "Concern" },
  { key: "idea", label: "Idea" },
  { key: "fun", label: "Fun" },
];

// ---------- Starter sample data ----------
const sampleWhispers: Whisper[] = [
  {
    id: "1",
    text: "Great code review today! Really helpful feedback.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    category: "praise",
    likes: 8,
    shares: 1,
    comments: [
      { id: "c1", author: "Anon-7", text: "Agree! Super crisp points. 🙌", timestamp: new Date(Date.now() - 1000 * 60 * 3) },
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
      { id: "c2", author: "Anon-2", text: "DM me the error logs. I can take a look.", timestamp: new Date(Date.now() - 1000 * 60 * 10) },
      { id: "c3", author: "Anon-4", text: "Is this on staging or prod? 🤔", timestamp: new Date(Date.now() - 1000 * 60 * 8) },
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
    comments: [{ id: "c4", author: "Anon-9", text: "Always. ☕+💻 = ❤️", timestamp: new Date(Date.now() - 1000 * 60 * 55) }],
    likedByMe: false,
    mine: false,
  },
];

const sampleParticipants = [
  { id: "u1", name: "Harsh", color: "bg-orange-500" },
  { id: "u2", name: "Priya", color: "bg-pink-500" },
  { id: "u3", name: "Aman", color: "bg-indigo-500" },
  { id: "u4", name: "Neha", color: "bg-emerald-500" },
  { id: "u5", name: "Ravi", color: "bg-blue-500" },
];

// ---------- Utilities ----------
const timeAgo = (date: Date) => {
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  const hours = Math.floor(diffMins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const anonNameFromId = (id: string) => {
  const sum = Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return `Anon-${(sum % 97) + 1}`;
};

// Lightweight inline icons to avoid external deps
const IconHeart = ({ filled }: { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={`w-5 h-5 ${filled ? "fill-current" : "fill-none"} stroke-current`}>
    <path strokeWidth="1.8" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconComment = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 stroke-current" viewBox="0 0 24 24" fill="none">
    <path strokeWidth="1.8" d="M21 12a8.96 8.96 0 0 1-2.64 6.36A9 9 0 0 1 5.1 19L3 21l.6-2.9A9 9 0 1 1 21 12z"/>
  </svg>
);

const IconShare = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 stroke-current" viewBox="0 0 24 24" fill="none">
    <path strokeWidth="1.8" d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v12"/>
  </svg>
);

/* ---------- Pie 3D Helpers (SVG, no deps) ---------- */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number, tilt = 0.75) {
  // squash Y for faux-3D perspective
  const sy = tilt;
  const so = polarToCartesian(cx, cy, rOuter, endAngle);
  const eo = polarToCartesian(cx, cy, rOuter, startAngle);
  const si = polarToCartesian(cx, cy, rInner, startAngle);
  const ei = polarToCartesian(cx, cy, rInner, endAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${so.x} ${cy + (so.y - cy) * sy}`,
    `A ${rOuter} ${rOuter * sy} 0 ${large} 0 ${eo.x} ${cy + (eo.y - cy) * sy}`,
    `L ${si.x} ${cy + (si.y - cy) * sy}`,
    `A ${rInner} ${rInner * sy} 0 ${large} 1 ${ei.x} ${cy + (ei.y - cy) * sy}`,
    "Z",
  ].join(" ");
}

type PieSlice = { key: Category; value: number; color: string; label: string; emoji?: string };

function Pie3D({
  data,
  width = 280,
  height = 180,
  innerRadius = 48,
  outerRadius = 80,
  depth = 10, // vertical offset for the 'shadow' slice
}: {
  data: PieSlice[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  depth?: number;
}) {
  const cx = width / 2;
  const cy = height / 2 - 6; // slight shift up for perspective
  const total = data.reduce((a, b) => a + b.value, 0) || 1;

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const obj = { p: 0 };
    const tl = gsap.to(obj, {
      p: 1,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => setProgress(obj.p),
    });
    return () => {
      tl.kill();
    };
  }, [data]);

  // Build angles
  let curr = 0;
  const segments = data.map((d) => {
    const angle = (d.value / total) * 360 * progress;
    const start = curr;
    const end = curr + angle;
    curr = end;
    return { ...d, start, end };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto block">
      {/* bottom 'depth' layer */}
      <g transform={`translate(0, ${depth})`} opacity={0.55}>
        {segments.map((s) => (
          <path
            key={`${s.key}-shadow`}
            d={arcPath(cx, cy, outerRadius, innerRadius, s.start, s.end)}
            fill={s.color}
            style={{ filter: "brightness(0.7)" }}
          />
        ))}
      </g>
      {/* top layer */}
      {segments.map((s) => (
        <path
          key={s.key}
          d={arcPath(cx, cy, outerRadius, innerRadius, s.start, s.end)}
          fill={s.color}
        />
      ))}
      {/* thin gloss */}
      <ellipse
        cx={cx}
        cy={cy - 2}
        rx={outerRadius}
        ry={outerRadius * 0.75}
        fill="url(#gloss)"
        opacity="0.15"
      />
      <defs>
        <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ---------- Modal ----------
function FullscreenPostModal({
  open,
  onClose,
  post,
  onAddComment,
  onToggleLike,
}: {
  open: boolean;
  onClose: () => void;
  post: Whisper | null;
  onAddComment: (postId: string, text: string) => void;
  onToggleLike: (postId: string) => void;
}) {
  const [commentText, setCommentText] = useState("");

  if (!open || !post) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-stretch justify-center p-0">
        <div className="w-full max-w-3xl h-full max-h-screen bg-white dark:bg-neutral-900 rounded-none md:rounded-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden flex flex-col">
          {/* Category accent bar */}
          <div className={`h-1.5 w-full ${categoryTheme[post.category].bar}`} />
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs font-medium">
                <span className="inline-flex items-center justify-center group">
                  <CategoryIcon kind={post.category} />
                </span>
                <span className="capitalize">{post.category}</span>
              </span>
              <span className={`${categoryTheme[post.category].text} font-semibold`}>{anonNameFromId(post.id)}</span>
              <span className="text-neutral-400">•</span>
              <span className="opacity-70">{timeAgo(post.timestamp)}</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-left">
            <p className="text-lg leading-relaxed text-neutral-900 dark:text-neutral-100">{post.text}</p>

            <div className="flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
              <button
                onClick={() => onToggleLike(post.id)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span className={post.likedByMe ? "text-pink-600 dark:text-pink-400" : ""}>
                  <IconHeart filled={post.likedByMe} />
                </span>
                <span className="tabular-nums">{post.likes}</span>
                <span className="hidden sm:inline">Like</span>
              </button>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                <IconComment />
                <span className="tabular-nums">{post.comments.length}</span>
                <span className="hidden sm:inline">Comments</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2">
                <IconShare />
                <span className="tabular-nums">{post.shares}</span>
                <span className="hidden sm:inline">Shares</span>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 tracking-wide">Comments</h4>
              {post.comments.length === 0 ? (
                <p className="text-sm text-neutral-500">Be the first to comment.</p>
              ) : (
                <ul className="space-y-3">
                  {post.comments.map((c) => (
                    <li key={c.id} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60">
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">{c.author}</span>
                        <span>{timeAgo(c.timestamp)}</span>
                      </div>
                      <p className="mt-1 text-neutral-800 dark:text-neutral-200">{c.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Add comment */}
        <div className="shrink-0 border-t border-neutral-200 dark:border-neutral-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                placeholder="Write a comment…"
                className="w-full resize-none rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
                maxLength={320}
              />
              <div className="mt-1 text-xs text-neutral-500 text-right">{commentText.length}/320</div>
            </div>
            <button
              onClick={() => {
                if (commentText.trim()) {
                  onAddComment(post.id, commentText.trim());
                  setCommentText("");
                }
              }}
              className="shrink-0 self-center px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] hover:opacity-95 disabled:opacity-50"
              disabled={!commentText.trim()}
            >
              Comment
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Page ----------
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
    // Right column sections
    gsap.from('[data-anim="filters"]', { opacity: 0, y: 12, duration: 0.4, ease: 'power2.out' });
    gsap.from('[data-anim="snapshot"]', { opacity: 0, y: 12, duration: 0.45, ease: 'power2.out', delay: 0.05 });
    gsap.from('[data-anim="online"]', { opacity: 0, y: 12, duration: 0.45, ease: 'power2.out', delay: 0.1 });

    // Post cards: same animation as snapshot (fade + slide-up)
    const cards = gsap.utils.toArray<HTMLElement>('[data-anim="card"]:not([data-animated="1"])');
    if (cards.length) {
      gsap.set(cards, { opacity: 0, y: 12 }); // ensure hidden before animation
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.10,
        ease: "power2.out",
        stagger: 0.08,
        onComplete: () => {
          cards.forEach((el) => el.setAttribute("data-animated", "1"));
        },
      });
    }
  });

  return () => ctx.revert();
}, []); // run only once on mount

  const anonName = (id: string) => {
    // Deterministic anon label based on id
    const sum = Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return `Anon-${(sum % 97) + 1}`;
  };

  const deletePost = (id: string) => {
    setWhispers((prev) => prev.filter((w) => w.id !== id));
    setMenuOpenId(null);
  };

  const reportPost = (id: string) => {
    console.log("Reported post:", id);
    setMenuOpenId(null);
  };

  const visibleWhispers = useMemo(() => {
    if (filters.size === 0) return whispers; // no selection => show all
    return whispers.filter((w) => filters.has(w.category));
  }, [whispers, filters]);

  const stats = useMemo(() => {
    const categoryCounts: Record<Category, number> = { general: 0, praise: 0, concern: 0, idea: 0, fun: 0 };
    let totalLikes = 0, totalComments = 0, totalShares = 0;
    for (const w of whispers) {
      categoryCounts[w.category] += 1;
      totalLikes += w.likes;
      totalComments += w.comments.length;
      totalShares += w.shares;
    }
    const totalPosts = whispers.length || 1;
    return { categoryCounts, totalLikes, totalComments, totalShares, totalPosts };
  }, [whispers]);

  const pieData = useMemo(
    () => [
      { key: "general" as const, value: stats.categoryCounts.general, color: "#a78bfa", label: "General" }, // violet
      { key: "praise"  as const, value: stats.categoryCounts.praise,  color: "#22c55e", label: "Praise"  }, // green
      { key: "concern" as const, value: stats.categoryCounts.concern, color: "#ef4444", label: "Concern" }, // red
      { key: "idea"    as const, value: stats.categoryCounts.idea,    color: "#3b82f6", label: "Idea"    }, // blue
      { key: "fun"     as const, value: stats.categoryCounts.fun,     color: "#f97316", label: "Fun"     }, // orange
    ],
    [
      stats.categoryCounts.general,
      stats.categoryCounts.praise,
      stats.categoryCounts.concern,
      stats.categoryCounts.idea,
      stats.categoryCounts.fun,
    ]
  );

  const legendItems: Array<{ key: Category; color: string; label: string; count: number }> = [
    { key: "general", color: "#a78bfa", label: "General", count: stats.categoryCounts.general },
    { key: "praise", color: "#22c55e", label: "Praise", count: stats.categoryCounts.praise },
    { key: "concern", color: "#ef4444", label: "Concern", count: stats.categoryCounts.concern },
    { key: "idea", color: "#3b82f6", label: "Idea", count: stats.categoryCounts.idea },
    { key: "fun", color: "#f97316", label: "Fun", count: stats.categoryCounts.fun },
  ];

  const toggleLike = (postId: string) => {
    setWhispers((arr) =>
      arr.map((w) =>
        w.id === postId
          ? {
              ...w,
              likedByMe: !w.likedByMe,
              likes: w.likedByMe ? Math.max(0, w.likes - 1) : w.likes + 1,
            }
          : w
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

    // Update the main list
    setWhispers((prev) =>
      prev.map((w) =>
        w.id === postId ? { ...w, comments: [...w.comments, newComment] } : w
      )
    );

    // If the modal is open on this post, update it immediately too
    setActivePost((prev) =>
      prev && prev.id === postId
        ? { ...prev, comments: [...prev.comments, newComment] }
        : prev
    );
  };

  const incrementShare = (postId: string) => {
    setWhispers((arr) =>
      arr.map((w) => (w.id === postId ? { ...w, shares: w.shares + 1 } : w))
    );
  };

  const submitWhisper = () => {
    if (!composeText.trim()) return;

    if (editingId) {
      // update existing post
      setWhispers((arr) =>
        arr.map((w) =>
          w.id === editingId ? { ...w, text: composeText.trim(), category: composeCategory, timestamp: new Date() } : w
        )
      );
      setEditingId(null);
    } else {
      // create new post (owned by current user)
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
      setWhispers((arr) => [newPost, ...arr]);
    }

    setComposeText("");
    setComposeCategory("general");
    setComposerOpen(false);
  };

  return (
    <AuthGuard>
      <div className="h-screen overflow-hidden bg-background">
        <main className="max-w-6xl mx-auto h-full min-h-0 px-4 sm:px-6">
          <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[70%_30%]">
            <div className="flex h-full min-h-0 flex-col">
              {/* Top controls (fixed in left column) */}
              <div className="shrink-0 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-3 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                {/* Composer */}
                <section>
                  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-md">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center gap-2" id="composer-anchor">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f97316] via-[#fb7185] to-[#c084fc]" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">What&apos;s on your mind today?</span>
                      </div>
                      <button
                        onClick={() => setComposerOpen((v) => !v)}
                        className={`text-sm px-3 py-1.5 rounded-lg font-semibold shadow-sm transition ${composerOpen ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white hover:opacity-95"}`}
                      >
                        {composerOpen ? "Hide" : "Add Whisper"}
                      </button>
                    </div>
                    {composerOpen && (
                      <div className="px-4 sm:px-6 py-4">
                        {/* Category pills */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {categoryLabels.map(({ key, label }) => (
                            <button
                              key={key}
                              onClick={() => setComposeCategory(key)}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium leading-none border ${
                                composeCategory === key
                                  ? "bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white border-transparent"
                                  : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                              }`}
                            >
                              <span className="inline-flex items-center justify-center group">
                                <CategoryIcon kind={key} size={16} />
                              </span>
                              <span>{label}</span>
                            </button>
                          ))}
                        </div>
                        {/* Rich textarea */}
                        <div className="rounded-xl border border-neutral-300 dark:border-neutral-700 overflow-hidden">
                          <textarea
                            value={composeText}
                            onChange={(e) => setComposeText(e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Share what's on your mind…"
                            className="w-full resize-none bg-white dark:bg-neutral-900 px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
                          />
                          <div className="flex items-center justify-between px-3 py-2 text-xs text-neutral-500 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2">
                              <span className="hidden sm:inline">Anonymous</span>
                              <span>•</span>
                              <span className="capitalize">{composeCategory}</span>
                            </div>
                            <span>{composeText.length}/500</span>
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="mt-3 flex items-center justify-end gap-3">
                          <button
                          onClick={() => {
                            setComposeText("");
                            setComposeCategory("general");
                            setEditingId(null);
                          }}
                            className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            Clear
                          </button>
                          <button
                            onClick={submitWhisper}
                            disabled={!composeText.trim()}
                            className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] hover:opacity-95 disabled:opacity-50"
                          >
                            {editingId ? "Update Whisper" : "Post Whisper"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Feed */}
              <section className="flex flex-1 flex-col gap-4 overflow-y-auto no-scrollbar py-4 pr-2">
                {visibleWhispers.map((post) => (
                  <article
                  key={post.id}
                  data-anim="card"
                  className={`p-4 sm:p-5 rounded-2xl border ${categoryColors[post.category]} transition-all duration-200 shadow-md hover:shadow-lg flex min-h-[220px] flex-col`}
                >
                    {/* Header */}
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Category chip */}
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs font-medium">
                        <span className="inline-flex items-center justify-center group">
                            <CategoryIcon kind={post.category} />
                          </span>
                          <span className="capitalize">{post.category}</span>
                        </span>
                        {/* Name • time */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{anonName(post.id)}</span>
                          <span className="text-neutral-400">•</span>
                          <span className="text-xs text-neutral-500">{timeAgo(post.timestamp)}</span>
                        </div>
                      </div>
                    
                      {/* Kebab menu */}
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                          className="px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          aria-label="Post options"
                        >
                          ⋯
                        </button>
                        {menuOpenId === post.id && (
                          <div className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
                            {post.mine ? (
                              <>
                                <button
                                  onClick={() => startEdit(post)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deletePost(post.id)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => reportPost(post.id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                              >
                                Report
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Body (clamped; See more opens modal) */}
                    <div className="mt-3 relative h-24 overflow-hidden">
                      <p className="text-neutral-900 dark:text-neutral-100 leading-relaxed">
                        {post.text}
                      </p>
                      
                    </div>
                    {post.text.length > 140 && (
                      <button
                        onClick={() => {
                          setActivePost(post);
                          setModalOpen(true);
                        }}
                        className="mt-2 self-start text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
                      >
                        See more
                      </button>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-4 flex items-center justify-end">
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                            post.likedByMe ? "text-pink-600 dark:text-pink-400" : "text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          <IconHeart filled={post.likedByMe} />
                          <span className="text-sm tabular-nums">{post.likes}</span>
                          <span className="hidden sm:inline text-xs">Like</span>
                        </button>

                        <button
                          onClick={() => {
                            setActivePost(post);
                            setModalOpen(true);
                          }}
                          className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                        >
                          <IconComment />
                          <span className="text-sm tabular-nums">{post.comments.length}</span>
                          <span className="hidden sm:inline text-xs">Comment</span>
                        </button>

                        <button
                          onClick={() => incrementShare(post.id)}
                          className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                        >
                          <IconShare />
                          <span className="text-sm tabular-nums">{post.shares}</span>
                          <span className="hidden sm:inline text-xs">Share</span>
                        </button>
                      </div>
                    </div>
                  </article>
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
            {/* Right column */}
            <aside className="hidden lg:flex h-full min-h-0 flex-col py-2">
              <div className="sticky top-0 h-full min-h-0 flex flex-col space-y-4">
                {/* a. Quick filters (compact) */}
                <section data-anim="filters" className="shrink-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-3 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Quick filters</h3>
                    <button
                      onClick={() => setFilters(new Set())}
                      className="text-[11px] px-2 py-0.5 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      Clear
                    </button>
                  </div>
                  {/* Two-line grid: 3 items per row (5 categories) */}
                  <div className="grid grid-cols-3 gap-2">
                    {categoryLabels.map(({ key, label }) => {
                      const active = filters.has(key);
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setFilters((prev) => {
                              const next = new Set(prev);
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              return next;
                            });
                          }}
                          className={`inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-[11px] leading-none ${
                            active
                              ? "border-transparent text-white bg-neutral-900 dark:bg-white dark:text-neutral-900"
                              : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <span className="inline-flex items-center justify-center group">
                            <CategoryIcon kind={key} size={14} />
                          </span>
                          <span className={`${active ? "text-inherit" : "text-neutral-800 dark:text-neutral-200"}`}>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
                {/* b. Snapshot */}
                <section data-anim="snapshot" className="shrink-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-4 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Snapshot</h3>
                    <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
                      <span>Total posts</span>
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {stats.totalPosts}
                      </span>
                    </span>
                  </div>

                  {/* 3D Pie Chart */}
                  <Pie3D
                    data={pieData}
                  />

                  {/* Legend with counts (list view) */}
                  <ul className="mt-3 space-y-2">
                    {legendItems.map((item) => (
                      <li key={item.key} className="flex items-center justify-between px-2 ">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-neutral-700 dark:text-neutral-300 inline-flex items-center gap-1">
                            {item.label}
                            <CategoryIcon kind={item.key} size={14} />
                          </span>
                        </div>
                        <span className="tabular-nums text-neutral-700 dark:text-neutral-300 text-sm">{item.count}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                {/* c. Team members online */}
                <section data-anim="online" className="flex flex-1 min-h-0 flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 backdrop-blur p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Team members online</h3>
                    <div className="text-xs text-neutral-500">{sampleParticipants.length} online</div>
                  </div>
                  <ul className="mt-3 space-y-2 flex-1 overflow-auto pr-1">
                    {sampleParticipants.map((p) => (
                      <li key={p.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white ${p.color}`}>
                            {p.name[0]}
                          </div>
                          <span className="text-sm text-neutral-800 dark:text-neutral-200">{p.name}</span>
                        </div>
                        <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-neutral-900" />
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </aside>
          </div>
        </main>

        {/* Fullscreen Post Modal */}
        <FullscreenPostModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          post={activePost}
          onAddComment={addComment}
          onToggleLike={toggleLike}
        />
      </div>
    </AuthGuard>
  );
}
