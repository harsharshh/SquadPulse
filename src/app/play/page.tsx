"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";

const motivationalQuotes = [
  "You're doing amazing! 🌟",
  "Every day is a fresh start! 🌅",
  "You've got this! 💪",
  "Small steps lead to big changes! 🚀",
  "Your positivity is contagious! 😊",
  "Today is going to be great! ✨",
  "You're stronger than you think! 💎",
  "Keep shining bright! ☀️",
];

// Removed unused funActivities array

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything! 😄",
  "I told my wife she was drawing her eyebrows too high. She looked surprised! 😂",
  "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
  "What do you call a fake noodle? An impasta! 🍝",
  "Why don't eggs tell jokes? They'd crack each other up! 🥚",
  "What do you call a bear with no teeth? A gummy bear! 🐻",
];

const colors = [
  { name: "Calm Blue", hex: "#3B82F6", emoji: "💙" },
  { name: "Peaceful Green", hex: "#10B981", emoji: "💚" },
  { name: "Warm Orange", hex: "#F59E0B", emoji: "🧡" },
  { name: "Soft Purple", hex: "#8B5CF6", emoji: "💜" },
  { name: "Gentle Pink", hex: "#EC4899", emoji: "💖" },
  { name: "Sunny Yellow", hex: "#EAB308", emoji: "💛" },
];

export default function CheerUpPage() {
  const { data: session } = useSession();
  const [currentQuote, setCurrentQuote] = useState("");
  const [currentJoke, setCurrentJoke] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathingCount, setBreathingCount] = useState(0);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [newGratitudeItem, setNewGratitudeItem] = useState("");

  const getRandomQuote = () => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setCurrentQuote(randomQuote);
  };

  const getRandomJoke = () => {
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    setCurrentJoke(randomJoke);
  };

  const getRandomColor = () => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setSelectedColor(randomColor);
  };

  const addGratitudeItem = () => {
    if (newGratitudeItem.trim()) {
      setGratitudeItems([...gratitudeItems, newGratitudeItem.trim()]);
      setNewGratitudeItem("");
    }
  };

  const removeGratitudeItem = (index: number) => {
    setGratitudeItems(gratitudeItems.filter((_, i) => i !== index));
  };

  // Breathing exercise effect
  useEffect(() => {
    if (breathingCount > 0) {
      const interval = setInterval(() => {
        setBreathingPhase((prev) => {
          if (prev === "inhale") return "hold";
          if (prev === "hold") return "exhale";
          return "inhale";
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [breathingCount]);

  const startBreathingExercise = () => {
    setBreathingCount(3);
    setBreathingPhase("inhale");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Take a break and boost your mood with these fun activities, {session?.user?.name}!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Random Quote */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-4xl mb-4">🎲</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Random Quote
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Get a motivational boost
                </p>
                <button
                  onClick={getRandomQuote}
                  className="w-full py-2 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white rounded-lg hover:opacity-95 transition-opacity font-semibold"
                >
                  Get Quote
                </button>
                {currentQuote && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {currentQuote}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Color Therapy */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Color Therapy
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Relax with colors
                </p>
                <button
                  onClick={getRandomColor}
                  className="w-full py-2 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white rounded-lg hover:opacity-95 transition-opacity font-semibold mb-4"
                >
                  New Color
                </button>
                <div
                  className="w-full h-20 rounded-lg flex items-center justify-center text-white font-semibold text-lg transition-all duration-500"
                  style={{ backgroundColor: selectedColor.hex }}
                >
                  <span className="mr-2">{selectedColor.emoji}</span>
                  {selectedColor.name}
                </div>
              </div>
            </div>

            {/* Joke Generator */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-4xl mb-4">🎪</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Joke Generator
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Laugh it out
                </p>
                <button
                  onClick={getRandomJoke}
                  className="w-full py-2 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white rounded-lg hover:opacity-95 transition-opacity font-semibold"
                >
                  Tell Me a Joke
                </button>
                {currentJoke && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-900 dark:text-gray-100">
                      {currentJoke}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Breathing Exercise */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-4xl mb-4">🧘</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Breathing Exercise
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Take a mindful moment
                </p>
                {breathingCount === 0 ? (
                  <button
                    onClick={startBreathingExercise}
                    className="w-full py-2 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white rounded-lg hover:opacity-95 transition-opacity font-semibold"
                  >
                    Start Breathing
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl">
                      {breathingPhase === "inhale" && "🫁"}
                      {breathingPhase === "hold" && "⏸️"}
                      {breathingPhase === "exhale" && "😮‍💨"}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {breathingPhase}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Cycle {breathingCount} of 3
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gratitude List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 md:col-span-2">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🌟</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Gratitude List
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Count your blessings
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGratitudeItem}
                    onChange={(e) => setNewGratitudeItem(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addGratitudeItem()}
                    placeholder="What are you grateful for?"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={addGratitudeItem}
                    className="px-4 py-2 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white rounded-lg hover:opacity-95 transition-opacity font-semibold"
                  >
                    Add
                  </button>
                </div>
                
                {gratitudeItems.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {gratitudeItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <span className="text-gray-900 dark:text-gray-100">✨ {item}</span>
                        <button
                          onClick={() => removeGratitudeItem(index)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white rounded-full">
              <span className="text-2xl">🎉</span>
              <span className="font-semibold">You&apos;re awesome! Keep spreading positivity!</span>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
