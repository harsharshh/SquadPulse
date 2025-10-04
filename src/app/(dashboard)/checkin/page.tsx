"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/AuthGuard";

const moodOptions = [
	{ emoji: "😢", label: "Terrible", value: 1, color: "bg-red-500" },
	{ emoji: "😔", label: "Bad", value: 2, color: "bg-orange-500" },
	{ emoji: "😐", label: "Okay", value: 3, color: "bg-yellow-500" },
	{ emoji: "😊", label: "Good", value: 4, color: "bg-green-500" },
	{ emoji: "🤩", label: "Amazing", value: 5, color: "bg-blue-500" },
];

export default function CheckInPage() {
	const { data: session } = useSession();
	const [selectedMood, setSelectedMood] = useState<number | null>(null);
	const [comment, setComment] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedMood) {
			// Here you would typically send the data to your backend
			console.log("Mood check-in:", { mood: selectedMood, comment, user: session?.user });
			setIsSubmitted(true);
		}
	};

	const resetForm = () => {
		setSelectedMood(null);
		setComment("");
		setIsSubmitted(false);
	};

	return (
		<AuthGuard>
			<div className="min-h-screen bg-background">
				<main className="max-w-2xl mx-auto px-6 py-8">
					<div className="text-center mb-8">
						<p className="text-gray-600 dark:text-gray-400">
							How are you feeling today, {session?.user?.name}?
						</p>
					</div>

					{isSubmitted ? (
						<div className="text-center">
							<div className="mb-6">
								<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
									<span className="text-2xl">✅</span>
								</div>
								<h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
									Thanks for checking in!
								</h2>
								<p className="text-gray-600 dark:text-gray-400 mb-6">
									Your mood has been recorded. Check back tomorrow for another check-in.
								</p>
							</div>
							<button
								onClick={resetForm}
								className="px-6 py-3 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white rounded-lg hover:opacity-95 transition-opacity"
							>
								Submit Another Check-in
							</button>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-8">
							<div>
								<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
									How would you rate your mood today?
								</h2>
								<div className="grid grid-cols-5 gap-4">
									{moodOptions.map((mood) => (
										<button
											key={mood.value}
											type="button"
											onClick={() => setSelectedMood(mood.value)}
											className={`p-4 rounded-xl border-2 transition-all duration-200 ${
												selectedMood === mood.value
													? `border-gray-900 dark:border-gray-100 ${mood.color} text-white`
													: "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
											}`}
										>
											<div className="text-3xl mb-2">{mood.emoji}</div>
											<div className="text-sm font-medium">{mood.label}</div>
										</button>
									))}
								</div>
							</div>

							<div>
								<label
									htmlFor="comment"
									className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
								>
									Any additional thoughts? (Optional)
								</label>
								<textarea
									id="comment"
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									rows={4}
									className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
									placeholder="Share what's on your mind..."
								/>
							</div>

							<button
								type="submit"
								disabled={!selectedMood}
								className="w-full py-4 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white rounded-lg font-semibold text-lg hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Submit Check-in
							</button>
						</form>
					)}

					<div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
							Team Mood Overview
						</h3>
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Average mood today
								</span>
								<span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									3.6
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Total check-ins
								</span>
								<span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									12
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600 dark:text-gray-400">
									Last updated
								</span>
								<span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									2 min ago
								</span>
							</div>
						</div>
					</div>
				</main>
			</div>
		</AuthGuard>
	);
}