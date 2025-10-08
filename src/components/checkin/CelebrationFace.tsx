"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

interface CelebrationFaceProps {
  size?: number;
}

const CelebrationFace = ({ size = 72 }: CelebrationFaceProps) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const mouth = useRef<SVGPathElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (wrapRef.current) {
        gsap.fromTo(
          wrapRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }
        );
      }
      if (mouth.current) {
        gsap.fromTo(
          mouth.current,
          { strokeDashoffset: 40 },
          { strokeDashoffset: 0, duration: 0.6, ease: "power2.out", delay: 0.2 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="28" fill="#10b981" />
        <path
          ref={mouth}
          d="M20 34 L28 42 L44 24"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray="40"
          strokeDashoffset="40"
        />
      </svg>
    </div>
  );
};

export default CelebrationFace;
