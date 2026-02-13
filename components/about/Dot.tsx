// TimelineDot.tsx - 100% Working Drawing + Moving Dot

import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface TimelineDotProps {
  cardRefs: React.RefObject<HTMLDivElement>[];
}

const pathData = `
M 450 270 
C 650 280, 750 380, 800 650
C 150 650, 350 950, 650 1100
C 950 1280, 820 1250, 950 1350
`;

const TimelineDot = ({ cardRefs }: TimelineDotProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [pathLength, setPathLength] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Get total path length once
  useEffect(() => {
    if (pathRef.current) {
      const totalLength = pathRef.current.getTotalLength();
      setPathLength(totalLength);
    }
  }, []);

  // Move dot based on scroll
  useEffect(() => {
    return scrollYProgress.on("change", (progress) => {
      if (!pathRef.current) return;

      const point = pathRef.current.getPointAtLength(
        progress * pathLength
      );

      x.set(point.x);
      y.set(point.y);
    });
  }, [scrollYProgress, pathLength, x, y]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <svg
        viewBox="0 0 1200 1600"
        className="absolute inset-0 w-full h-full hidden sm:block"
        fill="none"
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#004AAD" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base Dotted Path */}
        <path
          d={pathData}
          stroke="#cbd5e1"
          strokeWidth="3"
          strokeDasharray="6 8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Blue Drawing Line */}
        <motion.path
          ref={pathRef}
          d={pathData}
          stroke="url(#pathGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          style={{
            pathLength: scrollYProgress,
          }}
        />

        {/* 🟡 Yellow Moving Dot */}
        <motion.circle
          r="8"
          fill="#FFD700"
          stroke="#004AAD"
          strokeWidth="2"
          filter="url(#glow)"
          style={{ x, y }}
        />

        {/* Glow Ring */}
        <motion.circle
          r="18"
          fill="#FFD700"
          opacity="0.25"
          style={{ x, y }}
        />
      </svg>
    </div>
  );
};

export default TimelineDot;
