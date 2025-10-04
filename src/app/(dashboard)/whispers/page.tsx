"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";

interface Whisper {
  id: string;
  text: string;
  timestamp: Date;
  category: "general" | "praise" | "concern" | "idea" | "fun";
}

const sampleWhispers: Whisper[] = [
  { id: "1", text: "Great code review today! Really helpful feedback.", timestamp: new Date(Date.now() - 1000 * 60 * 5), category: "praise" },
  { id: "2", text: "We're blocked on the API integration. Need help!", timestamp: new Date(Date.now() - 1000 * 60 * 15), category: "concern" },
  { id: "3", text: "Love the new design system! 🎨", timestamp: new Date(Date.now() - 1000 * 60 * 30), category: "praise" },
  { id: "4", text: "What if we added dark mode to the dashboard?", timestamp: new Date(Date.now() - 1000 * 60 * 45), category: "idea" },
  { id: "5", text: "Coffee break anyone? ☕", timestamp: new Date(Date.now() - 1000 * 60 * 60), category: "fun" },
  { id: "6", text: "Release feels a bit rushed. Should we push it?", timestamp: new Date(Date.now() - 1000 * 60 * 75), category: "concern" },
  { id: "7", text: "Kudos to the QA team for catching that bug! 👏", timestamp: new Date(Date.now() - 1000 * 60 * 90), category: "praise" },
  { id: "8", text: "Infrastructure has been flaky today", timestamp: new Date(Date.now() - 1000 * 60 * 120), category: "concern" },
];

const categoryColors = {
  general: "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600",
  praise: "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  concern: "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  idea: "bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  fun: "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
};

const categoryEmojis = {
  general: "💭",
  praise: "👏",
  concern: "⚠️",
  idea: "💡",
  fun: "🎉",
};

export default function WhisperWallPage() {
  const [whispers, setWhispers] = useState<Whisper[]>(sampleWhispers);
  const [newWhisper, setNewWhisper] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Whisper["category"]>("general");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWhisper.trim()) {
      const whisper: Whisper = {
        id: Date.now().toString(),
        text: newWhisper.trim(),
        timestamp: new Date(),
        category: selectedCategory,
      };
      setWhispers([whisper, ...whispers]);
      setNewWhisper("");
      setShowForm(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        
        
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Share your thoughts anonymously. All whispers are safe and private.
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white rounded-lg hover:opacity-95 transition-opacity font-semibold"
            >
              {showForm ? "Cancel" : "Add a Whisper"}
            </button>
          </div>

          {showForm && (
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Whisper["category"])}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="general">💭 General</option>
                    <option value="praise">👏 Praise</option>
                    <option value="concern">⚠️ Concern</option>
                    <option value="idea">💡 Idea</option>
                    <option value="fun">🎉 Fun</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="whisper" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your whisper
                  </label>
                  <textarea
                    id="whisper"
                    value={newWhisper}
                    onChange={(e) => setNewWhisper(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="Share what's on your mind..."
                    maxLength={280}
                  />
                  <div className="text-right text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {newWhisper.length}/280
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!newWhisper.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white rounded-lg hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Post Whisper
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {whispers.map((whisper) => (
              <div
                key={whisper.id}
                className={`p-4 rounded-xl border ${categoryColors[whisper.category]} transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryEmojis[whisper.category]}</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                      {whisper.category}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {formatTimeAgo(whisper.timestamp)}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                  {whisper.text}
                </p>
              </div>
            ))}
          </div>

          {whispers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No whispers yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Be the first to share a thought on the whisper wall!
              </p>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}