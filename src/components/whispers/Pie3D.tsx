"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";

import type { Category } from "./types";

type PieSlice = { key: Category; value: number; color: string; label: string; emoji?: string };

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
};

const arcPath = (
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
  tilt = 0.75
) => {
  const sy = tilt;
  const so = polarToCartesian(cx, cy, rOuter, endAngle);
  const eo = polarToCartesian(cx, cy, rOuter, startAngle);
  const si = polarToCartesian(cx, cy, rInner, startAngle);
  const ei = polarToCartesian(cx, cy, rInner, endAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    `M ${so.x} ${cy + (so.y - cy) * sy}`,
    `A ${rOuter} ${rOuter * sy} 0 ${large} 0 ${eo.x} ${cy + (eo.y - cy) * sy}`,
    `L ${si.x} ${cy + (si.y - cy) * sy}`,
    `A ${rInner} ${rInner * sy} 0 ${large} 1 ${ei.x} ${cy + (ei.y - cy) * sy}`,
    "Z",
  ].join(" ");
};

interface Pie3DProps {
  data: PieSlice[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  depth?: number;
}

const Pie3D = ({
  data,
  width = 280,
  height = 180,
  innerRadius = 48,
  outerRadius = 80,
  depth = 10,
}: Pie3DProps) => {
  const cx = width / 2;
  const cy = height / 2 - 6;
  const total = data.reduce((acc, slice) => acc + slice.value, 0) || 1;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const obj = { p: 0 };
    const tl = gsap.to(obj, {
      p: 1,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => setProgress(obj.p),
    });
    return () => {
      tl.kill();
    };
  }, [data]);

  let current = 0;
  const segments = data.map((slice) => {
    const angle = (slice.value / total) * 360 * progress;
    const start = current;
    const end = current + angle;
    current = end;
    return { ...slice, start, end };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto block">
      <g transform={`translate(0, ${depth})`} opacity={0.55}>
        {segments.map((segment) => (
          <path
            key={`${segment.key}-shadow`}
            d={arcPath(cx, cy, outerRadius, innerRadius, segment.start, segment.end)}
            fill={segment.color}
            style={{ filter: "brightness(0.7)" }}
          />
        ))}
      </g>

      {segments.map((segment) => (
        <path
          key={segment.key}
          d={arcPath(cx, cy, outerRadius, innerRadius, segment.start, segment.end)}
          fill={segment.color}
        />
      ))}

      <ellipse cx={cx} cy={cy - 2} rx={outerRadius} ry={outerRadius * 0.75} fill="url(#gloss)" opacity="0.15" />

      <defs>
        <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export type { PieSlice };
export default Pie3D;
