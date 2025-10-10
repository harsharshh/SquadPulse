"use client";

import { categoryColors } from "./constants";
import { timeAgo } from "./constants";
import type { Whisper } from "./types";
import { CategoryIcon } from "@/components/icons/WhisperCategoryIcons";
import { IconHeart, IconComment, IconShare } from "./icons";

interface WhisperCardProps {
  post: Whisper;
  isMenuOpen: boolean;
  onToggleMenu: (postId: string) => void;
  onEdit: (post: Whisper) => void;
  onDelete: (postId: string) => void;
  onReport: (postId: string) => void;
  onLike: (postId: string) => void;
  onComment: (post: Whisper) => void;
  onShare: (postId: string) => void;
  deleting?: boolean;
}

const WhisperCard = ({
  post,
  isMenuOpen,
  onToggleMenu,
  onEdit,
  onDelete,
  onReport,
  onLike,
  onComment,
  onShare,
  deleting = false,
}: WhisperCardProps) => {
  return (
    <article
      data-anim="card"
      className={`p-4 sm:p-5 rounded-2xl border ${categoryColors[post.category]} transition-all duration-200 shadow-md hover:shadow-lg flex min-h-[220px] flex-col`}
    >
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs font-medium">
            <span className="inline-flex items-center justify-center group">
              <CategoryIcon kind={post.category} />
            </span>
            <span className="capitalize">{post.category}</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{post.author ?? "Anonymous"}</span>
            <span className="text-neutral-400">•</span>
            <span className="text-xs text-neutral-500">{timeAgo(post.timestamp)}</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => onToggleMenu(post.id)}
            className="px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Post options"
          >
            ⋯
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden">
              {post.mine ? (
                <>
                  <button
                    onClick={() => onEdit(post)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(post.id)}
                    disabled={deleting}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
                      deleting ? "text-neutral-400 cursor-not-allowed" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onReport(post.id)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 relative h-24 overflow-hidden">
        <p className="text-neutral-900 dark:text-neutral-100 leading-relaxed">{post.text}</p>
      </div>
      {post.text.length > 140 && (
        <button
          onClick={() => onComment(post)}
          className="mt-2 self-start text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
        >
          See more
        </button>
      )}

      <div className="mt-auto pt-4 flex items-center justify-end">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => onLike(post.id)}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
              post.likedByMe ? "text-pink-600 dark:text-pink-400" : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <IconHeart filled={post.likedByMe} />
            <span className="text-sm tabular-nums">{post.likes}</span>
            <span className="hidden sm:inline text-xs">Like</span>
          </button>

          <button
            onClick={() => onComment(post)}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          >
            <IconComment />
            <span className="text-sm tabular-nums">{post.comments.length}</span>
            <span className="hidden sm:inline text-xs">Comment</span>
          </button>

          <button
            onClick={() => onShare(post.id)}
            className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          >
            <IconShare />
            <span className="text-sm tabular-nums">{post.shares}</span>
            <span className="hidden sm:inline text-xs">Share</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default WhisperCard;
