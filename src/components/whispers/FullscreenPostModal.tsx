"use client";

import { useState } from "react";

import type { Whisper } from "./types";
import { CategoryIcon } from "@/components/icons/WhisperCategoryIcons";
import { categoryTheme, timeAgo } from "./constants";
import { IconComment, IconHeart, IconShare } from "./icons";

interface FullscreenPostModalProps {
  open: boolean;
  post: Whisper | null;
  onClose: () => void;
  onAddComment: (postId: string, text: string) => void;
  onToggleLike: (postId: string) => void;
}

const FullscreenPostModal = ({ open, post, onClose, onAddComment, onToggleLike }: FullscreenPostModalProps) => {
  const [commentText, setCommentText] = useState("");

  if (!open || !post) return null;

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText("");
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-stretch justify-center p-0">
        <div className="w-full max-w-3xl h-full max-h-screen bg-white dark:bg-neutral-900 rounded-none md:rounded-2xl border border-neutral-200/70 dark:border-neutral-800 overflow-hidden flex flex-col">
          <div className={`h-1.5 w-full ${categoryTheme[post.category].bar}`} />
          <div className="px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs font-medium">
                  <span className="inline-flex items-center justify-center group">
                    <CategoryIcon kind={post.category} />
                  </span>
                  <span className="capitalize">{post.category}</span>
                </span>
                <span className={`${categoryTheme[post.category].text} font-semibold`}>{post.author ?? "Anonymous"}</span>
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

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 tracking-wide">Comments</h4>
                {post.comments.length === 0 ? (
                  <p className="text-sm text-neutral-500">Be the first to comment.</p>
                ) : (
                  <ul className="space-y-3">
                    {post.comments.map((comment) => (
                      <li
                        key={comment.id}
                        className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60"
                      >
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">{comment.author}</span>
                          <span>{timeAgo(comment.timestamp)}</span>
                        </div>
                        <p className="mt-1 text-neutral-800 dark:text-neutral-200">{comment.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  rows={2}
                  placeholder="Write a comment…"
                  className="w-full resize-none rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500/70"
                  maxLength={320}
                />
                <div className="mt-1 text-xs text-neutral-500 text-right">{commentText.length}/320</div>
              </div>
              <button
                onClick={handleAddComment}
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
};

export default FullscreenPostModal;
