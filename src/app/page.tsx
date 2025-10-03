"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { gsap } from "gsap";

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(titleRef.current, { y: 24, autoAlpha: 0, duration: 0.6, immediateRender: false })
        .from(subtitleRef.current, { y: 18, autoAlpha: 0, duration: 0.5, immediateRender: false }, "-=0.25")
        .from(Array.from(ctaRef.current?.children ?? []), { y: 16, autoAlpha: 0, duration: 0.4, stagger: 0.08, immediateRender: false }, "-=0.25");
      if (cardsRef.current) {
        tl.from(
          Array.from(cardsRef.current.querySelectorAll("[data-card]")),
          {
            y: 24,
            autoAlpha: 0,
            rotate: 1,
            duration: 0.6,
            stagger: 0.2,          // appear one by one
            immediateRender: false,
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* soft vignette + arc accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full blur-3xl opacity-[.25] dark:opacity-[.18] bg-gradient-to-br from-[#f97316] via-[#fb7185] to-[#c084fc]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full blur-3xl opacity-[.20] dark:opacity-[.14] bg-gradient-to-tr from-[#c084fc] via-[#fb7185] to-[#f97316]" />
      </div>

      {/* header */}
      <Header />

      {/* hero */}
      <main className="relative z-10 mx-auto max-w-6xl  pt-6 md:pt-10 pb-16 md:pb-24 min-h-[calc(100vh-80px)] flex items-center">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* LEFT: Title / Subtitle / CTAs */}
          <div>
            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] bg-clip-text text-transparent tracking-tight"
            >
              Squad<span className="align-baseline">Pulse</span>
            </h1>
            <p
              ref={subtitleRef}
              className="mt-3 max-w-xl text-sm sm:text-base md:text-lg text-foreground/70"
            >
              Team pulse and anonymous whisper wall for real‑time sentiment and safe expression.
              Plus a playful <span className="font-medium">CheerUp Mode</span> to lift the vibe.
            </p>

            <div ref={ctaRef} className="mt-5 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/checkin"
                className="rounded-full px-5 sm:px-6 h-11 sm:h-12 inline-flex items-center justify-center text-sm sm:text-base font-medium bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white shadow-sm hover:opacity-95 transition whitespace-nowrap leading-none min-w-[176px]"
              >
                Start check‑in
              </Link>
              <Link
                href="/whispers"
                className="rounded-full px-5 sm:px-6 h-11 sm:h-12 inline-flex items-center justify-center text-sm sm:text-base font-medium border border-foreground/15 hover:bg-foreground/5 transition whitespace-nowrap leading-none min-w-[176px]"
              >
                Open Whisper Wall
              </Link>
              <Link
                href="/play"
                className="rounded-full px-5 sm:px-6 h-11 sm:h-12 inline-flex items-center justify-center text-sm sm:text-base font-medium border border-foreground/15 hover:bg-foreground/5 transition whitespace-nowrap leading-none min-w-[176px]"
              >
                Try CheerUp Mode
              </Link>
            </div>
          </div>

          {/* RIGHT: Visual representation cards */}
          <div ref={cardsRef} className="grid gap-4">
            {/* Daily mood check-ins */}
            <div
              data-card
              className="rounded-2xl border border-foreground/10 p-4 md:p-5 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground/80">Daily mood check‑ins</h3>
                <span className="inline-flex h-6 items-center rounded-full px-2 text-xs bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] text-white">Live</span>
              </div>
              <div className="flex items-center gap-4">
                {/* pulse ring */}
                <div className="relative h-16 w-16">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] opacity-25 animate-ping" />
                  <span className="absolute inset-1 rounded-full border border-foreground/15" />
                  <span className="absolute inset-3 rounded-full bg-foreground/10" />
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full rounded bg-foreground/10 overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc]" />
                  </div>
                  <p className="mt-2 text-xs text-foreground/60">Avg mood today: <span className="font-medium">3.6</span></p>
                </div>
              </div>
            </div>

            {/* Whisper wall */}
            <div
              data-card
              className="rounded-2xl border border-foreground/10 p-4 md:p-5 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground/80">Whisper Wall</h3>
                <span className="text-xs text-foreground/50">Anon safe</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["We’re blocked on API", "Great code review!", "Need focus time", "Release feels tight", "👏 Kudos QA", "Infra flaky", "UI polish?", "Let’s pair"].map((t, i) => (
                  <div key={i} className="rounded-md px-2 py-2 text-[11px] leading-snug bg-foreground/[.06] border border-foreground/10">
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* CheerUp mode */}
            <div
              data-card
              className="rounded-2xl border border-foreground/10 p-4 md:p-5 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground/80">CheerUp Mode</h3>
                <Link href="/play" className="text-xs underline text-foreground/60 hover:text-foreground/80">Play</Link>
              </div>
              <div className="flex items-center gap-3">
                {/* wheel placeholder */}
                <div className="relative h-20 w-20 rounded-full border-2 border-foreground/15 grid place-items-center">
                  <div className="absolute inset-1 rounded-full bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] opacity-20" />
                  <div className="text-sm font-semibold">🎡</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground/70">Spin &amp; Cheer, Emoji Storm, and Poll Battles — bite‑size fun to reset the vibe.</p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs rounded-full px-2 py-1 bg-foreground/5 border border-foreground/10">Icebreaker</span>
                    <span className="text-xs rounded-full px-2 py-1 bg-foreground/5 border border-foreground/10">Mood‑booster</span>
                    <span className="text-xs rounded-full px-2 py-1 bg-foreground/5 border border-foreground/10">Team‑bonding</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      
    </div>
  );
}
