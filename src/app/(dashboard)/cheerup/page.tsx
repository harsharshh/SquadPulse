"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { gsap } from "gsap";

import AuthGuard from "@/components/AuthGuard";
import { moodOptions } from "@/components/checkin/constants";
import CheerIntroCard from "@/components/cheerup/CheerIntroCard";
import MoodSnapshotCard from "@/components/cheerup/MoodSnapshotCard";
import ColorTherapyCard from "@/components/cheerup/ColorTherapyCard";
import ChallengeSpinnerCard from "@/components/cheerup/ChallengeSpinnerCard";
import QuoteCard from "@/components/cheerup/QuoteCard";
import JokeCard from "@/components/cheerup/JokeCard";
import BreathingCard from "@/components/cheerup/BreathingCard";
import GratitudeBoardCard from "@/components/cheerup/GratitudeBoardCard";
import MoodBingoCard from "@/components/cheerup/MoodBingoCard";
import QuickTipsCard from "@/components/cheerup/QuickTipsCard";
import AffirmationMatchCard, { affirmations } from "@/components/cheerup/AffirmationMatchCard";
import EmojiMemoryGameCard, { allEmojis } from "@/components/cheerup/EmojiMemoryGameCard";
import {
  motivationalQuotes,
  jokes,
  palettes,
  challenges,
  microActions,
  bingoBoard,
} from "@/components/cheerup/data";

const randomSubset = <T,>(array: T[], count: number) =>
  array
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

export default function CheerUpPage() {
  const { data: session } = useSession();
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [currentJoke, setCurrentJoke] = useState(jokes[0]);
  const [selectedPalette, setSelectedPalette] = useState(palettes[0]);
  const [challenge, setChallenge] = useState(challenges[0]);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [cyclesRemaining, setCyclesRemaining] = useState(0);
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [newGratitudeItem, setNewGratitudeItem] = useState("");
  const [affirmationPairs, setAffirmationPairs] = useState(() => randomSubset(affirmations, 4));
  const [emojiPool, setEmojiPool] = useState(() => randomSubset(allEmojis, 10));
  const [revealedEmojis, setRevealedEmojis] = useState<string[]>([]);

  const layoutRef = useRef<HTMLDivElement | null>(null);
  const moodBarRef = useRef<HTMLDivElement | null>(null);

  const wellnessStats = useMemo(() => ({ avg: 4.6, total: 36 }), []);
  const boosterMood = useMemo(() => {
    const rounded = Math.round(wellnessStats.avg) as 1 | 2 | 3 | 4 | 5;
    const palette = moodOptions.find((option) => option.value === rounded);
    return {
      mood: rounded,
      color: palette?.colorHex ?? "#fb7185",
      label: palette?.label ?? "Bright",
    };
  }, [wellnessStats.avg]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (layoutRef.current) {
        gsap.from(layoutRef.current.querySelectorAll("[data-card]") as NodeListOf<HTMLElement>, {
          y: 20,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.08,
        });
      }
      if (moodBarRef.current) {
        gsap.fromTo(
          moodBarRef.current,
          { width: 0 },
          { width: `${Math.min(100, (wellnessStats.avg / 5) * 100)}%`, duration: 0.8, ease: "power2.out" }
        );
      }
    });
    return () => ctx.revert();
  }, [wellnessStats.avg]);

  useEffect(() => {
    if (cyclesRemaining <= 0) return;
    const timer = setTimeout(() => {
      setBreathingPhase((prev) => {
        if (prev === "Inhale") return "Hold";
        if (prev === "Hold") return "Exhale";
        return "Inhale";
      });
      setCyclesRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 3000);

    return () => clearTimeout(timer);
  }, [cyclesRemaining, breathingPhase]);

  const spinQuote = () => {
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  };

  const spinJoke = () => {
    setCurrentJoke(jokes[Math.floor(Math.random() * jokes.length)]);
  };

  const spinPalette = () => {
    setSelectedPalette(palettes[Math.floor(Math.random() * palettes.length)]);
  };

  const spinChallenge = () => {
    setChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
  };

  const startBreathing = () => {
    setCyclesRemaining(9);
    setBreathingPhase("Inhale");
  };

  const addGratitudeItem = () => {
    const trimmed = newGratitudeItem.trim();
    if (!trimmed) return;
    setGratitudeItems((prev) => [trimmed, ...prev]);
    setNewGratitudeItem("");
  };

  const removeGratitudeItem = (index: number) => {
    setGratitudeItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const shuffleAffirmations = () => {
    setAffirmationPairs(randomSubset(affirmations, 4));
  };

  const revealEmojis = () => {
    const reveal = randomSubset(emojiPool, 3);
    setRevealedEmojis(reveal);
    setTimeout(() => setRevealedEmojis([]), 2000);
    setEmojiPool(randomSubset(allEmojis, 10));
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background supports-[backdrop-filter]:bg-background/80">
        <main className="mx-auto max-w-8xl px-6 py-8">
          <div ref={layoutRef} className="flex flex-col gap-6">
            <CheerIntroCard
              headline={`Hi ${session?.user?.name?.split(" ")[0] ?? "there"}, let’s lift your energy`}
              message="Take mindful micro-breaks, collect motivation, and track the bright spots powering your day."
              microActions={microActions}
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MoodSnapshotCard
                mood={boosterMood.mood}
                color={boosterMood.color}
                label={boosterMood.label}
                average={wellnessStats.avg}
                barRef={moodBarRef}
              />
              <ColorTherapyCard palette={selectedPalette} onSpin={spinPalette} />
              <ChallengeSpinnerCard challenge={challenge} onSpin={spinChallenge} />
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <QuoteCard quote={currentQuote} onSpin={spinQuote} />
              <JokeCard joke={currentJoke} onSpin={spinJoke} />
            </section>

            <BreathingCard phase={breathingPhase} remaining={cyclesRemaining} onStart={startBreathing} />

            <section className="grid gap-4 lg:grid-cols-2">
              <GratitudeBoardCard
                entries={gratitudeItems}
                newEntry={newGratitudeItem}
                onChange={setNewGratitudeItem}
                onAdd={addGratitudeItem}
                onRemove={removeGratitudeItem}
              />
              <MoodBingoCard board={bingoBoard} />
            </section>

            <AffirmationMatchCard pairs={affirmationPairs} onShuffle={shuffleAffirmations} />

            <EmojiMemoryGameCard pool={emojiPool} revealed={revealedEmojis} onReveal={revealEmojis} />

            <QuickTipsCard
              tips={[
                "Step outside for two minutes of daylight",
                "Swap playlists to something uplifting",
                "Schedule a 10-minute virtual coffee with a teammate",
                "Celebrate one micro-win before you log off",
              ]}
            />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
