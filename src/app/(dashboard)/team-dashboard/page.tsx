"use client";

import AuthGuard from "@/components/AuthGuard";

export default function TeamDashboardPage() {
  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] bg-clip-text text-transparent">
          Team Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Example widgets, replace with real data */}
          <div className="rounded-xl bg-white/80 dark:bg-gray-900/60 shadow p-6 flex flex-col items-center">
            <span className="text-5xl mb-2">😊</span>
            <p className="text-lg font-semibold">Team Mood</p>
            <p className="text-2xl font-bold text-green-500 mt-2">Good</p>
            <p className="text-xs text-gray-500 mt-1">Based on last 7 days</p>
          </div>
          <div className="rounded-xl bg-white/80 dark:bg-gray-900/60 shadow p-6 flex flex-col items-center">
            <span className="text-5xl mb-2">📈</span>
            <p className="text-lg font-semibold">Check-in Rate</p>
            <p className="text-2xl font-bold text-blue-500 mt-2">87%</p>
            <p className="text-xs text-gray-500 mt-1">Active participation</p>
          </div>
          <div className="rounded-xl bg-white/80 dark:bg-gray-900/60 shadow p-6 flex flex-col items-center">
            <span className="text-5xl mb-2">💬</span>
            <p className="text-lg font-semibold">Whispers Shared</p>
            <p className="text-2xl font-bold text-pink-500 mt-2">42</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>
          <div className="rounded-xl bg-white/80 dark:bg-gray-900/60 shadow p-6 flex flex-col items-center">
            <span className="text-5xl mb-2">🧑‍🤝‍🧑</span>
            <p className="text-lg font-semibold">Team Size</p>
            <p className="text-2xl font-bold text-purple-500 mt-2">12</p>
            <p className="text-xs text-gray-500 mt-1">Members</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
