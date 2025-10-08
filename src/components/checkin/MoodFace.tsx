"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

interface MoodFaceProps {
  mood: 1 | 2 | 3 | 4 | 5;
  activeColor: string;
  idleColor?: string;
  size?: number;
}

const MoodFace = ({ mood, activeColor, idleColor = "#e5e7eb", size = 64 }: MoodFaceProps) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const eyeL = useRef<SVGCircleElement | null>(null);
  const eyeR = useRef<SVGCircleElement | null>(null);
  const mouth = useRef<SVGPathElement | null>(null);
  const cheekL = useRef<SVGCircleElement | null>(null);
  const cheekR = useRef<SVGCircleElement | null>(null);
  const sparkleL = useRef<SVGPolygonElement | null>(null);
  const sparkleR = useRef<SVGPolygonElement | null>(null);
  const tear = useRef<SVGPathElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (wrapRef.current) {
        gsap.to(wrapRef.current, { y: 2, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }

      const blink = () => {
        gsap.to([eyeL.current, eyeR.current], {
          scaleY: 0.1,
          duration: 0.08,
          transformOrigin: "center",
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
          onComplete: () => {
            gsap.delayedCall(1 + Math.random() * 2, blink);
          },
        });
      };

      blink();
      gsap.set([cheekL.current, cheekR.current, sparkleL.current, sparkleR.current, tear.current], { autoAlpha: 0, scale: 0.8 });
    });

    return () => ctx.revert();
  }, []);

  const onHover = () => {
    if (!wrapRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(wrapRef.current, { scale: 1.04, duration: 0.18 }, 0);

    switch (mood) {
      case 1:
        tl.to(mouth.current, { attr: { d: sadPath(1.3) }, duration: 0.22 }, 0)
          .to([eyeL.current, eyeR.current], { y: 1.5, scaleY: 0.85, duration: 0.18 }, 0)
          .fromTo(tear.current, { autoAlpha: 0, y: -2 }, { autoAlpha: 1, y: 2, duration: 0.3 }, 0.05)
          .to(wrapRef.current, { x: 2, yoyo: true, repeat: 3, duration: 0.05 }, 0.02);
        break;
      case 2:
        tl.to(mouth.current, { attr: { d: sadPath(1.05) }, duration: 0.22 }, 0)
          .to([eyeL.current, eyeR.current], { y: 1, scaleY: 0.9, duration: 0.18 }, 0);
        break;
      case 3:
        tl.to(mouth.current, { attr: { d: neutralPath(0.6) }, duration: 0.2 }, 0)
          .to([cheekL.current, cheekR.current], { autoAlpha: 0.6, scale: 1, duration: 0.24 }, 0.06);
        break;
      case 4:
        tl.to(mouth.current, { attr: { d: smilePath(1) }, duration: 0.2 }, 0)
          .to([eyeL.current, eyeR.current], { scaleY: 0.85, duration: 0.18 }, 0)
          .to([cheekL.current, cheekR.current], { autoAlpha: 0.8, scale: 1, duration: 0.24 }, 0.06);
        break;
      case 5:
        tl.to(mouth.current, { attr: { d: smilePath(1.25) }, duration: 0.2 }, 0)
          .to([eyeL.current, eyeR.current], { scaleY: 0.8, duration: 0.18 }, 0)
          .to([sparkleL.current, sparkleR.current], { autoAlpha: 1, scale: 1, rotate: 15, duration: 0.26, stagger: 0.06 }, 0.05)
          .to(wrapRef.current, { scale: 1.08, yoyo: true, repeat: 1, duration: 0.16 }, 0.05);
        break;
      default:
        break;
    }
  };

  const onLeave = () => {
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tl.to(wrapRef.current, { scale: 1, x: 0, duration: 0.18 }, 0)
      .to([eyeL.current, eyeR.current], { y: 0, scaleY: 1, duration: 0.18 }, 0)
      .to([cheekL.current, cheekR.current, sparkleL.current, sparkleR.current, tear.current], { autoAlpha: 0, scale: 0.8, duration: 0.18 }, 0)
      .to(mouth.current, { attr: { d: baseMouthPath(mood) }, duration: 0.22 }, 0);
  };

  const baseMouthPath = (value: number) => {
    if (value <= 2) return sadPath(0.8);
    if (value === 3) return neutralPath(0.4);
    return smilePath(0.8);
  };

  const smilePath = (intensity = 1) => `M 22 38 C 28 ${40 + 6 * intensity} 36 ${40 + 6 * intensity} 42 38`;
  const neutralPath = (intensity = 1) => `M ${32 - 8 * intensity} 38 L ${32 + 8 * intensity} 38`;
  const sadPath = (intensity = 1) => `M 22 40 C 28 ${38 - 6 * intensity} 36 ${38 - 6 * intensity} 42 40`;

  return (
    <div ref={wrapRef} onMouseEnter={onHover} onMouseLeave={onLeave} className="select-none">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2" />
          </filter>
        </defs>
        <g filter="url(#softShadow)">
          <circle cx="32" cy="32" r="24" fill={activeColor} />
          <circle ref={eyeL} cx="24" cy="28" r="2.5" fill={idleColor} />
          <circle ref={eyeR} cx="40" cy="28" r="2.5" fill={idleColor} />
          <circle ref={cheekL} cx="22" cy="34" r="3" fill="#fecaca" />
          <circle ref={cheekR} cx="42" cy="34" r="3" fill="#fecaca" />
          <polygon ref={sparkleL} points="18,20 20,24 16,24" fill="#ffffff" />
          <polygon ref={sparkleR} points="48,20 50,24 46,24" fill="#ffffff" />
          <path ref={tear} d="M24 30 C23 32, 23 33, 24 34" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
          <path ref={mouth} d={baseMouthPath(mood)} stroke={idleColor} strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

export default MoodFace;
