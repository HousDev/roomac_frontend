'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { StatItem } from '@/data/types';

interface AboutStatsProps {
  stats: StatItem[];
  onAnimationComplete?: (index: number) => void;
}

// ─── Count-up hook (starts from 0) ───────────────────────────────────────────
function useCountUp(
  target: number,
  duration: number = 1800,
  shouldStart: boolean = false
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    const start = 0; // ✅ Start from 0
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Smooth ease-out cubic animation
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = start + eased * (target - start);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target); // Ensure exact final value
      }
    };

    requestAnimationFrame(step);
  }, [shouldStart, target, duration]);

  return count;
}

// ─── Parse "10,000+", "98%", "4.8★" → numeric + suffix ──────────────────────
function parseNumber(raw: string): {
  numeric: number;
  suffix: string;
  isDecimal: boolean;
} {
  const match = raw.match(/^[\d,\.]+/);
  if (!match) return { numeric: 0, suffix: raw, isDecimal: false };

  const cleaned = match[0].replace(/,/g, '');
  const numeric = parseFloat(cleaned);
  const isDecimal = cleaned.includes('.');
  const suffix = raw.slice(match[0].length);

  return { numeric, suffix, isDecimal };
}

function formatNumber(
  n: number,
  hadCommas: boolean,
  isDecimal: boolean,
  original: string
): string {
  if (isDecimal) {
    const decimalPlaces =
      (original.match(/\.(\d+)/) || ['', ''])[1].length;
    return n.toFixed(decimalPlaces);
  }

  return hadCommas
    ? Math.floor(n).toLocaleString()
    : String(Math.floor(n));
}

// ─── Animated number display ──────────────────────────────────────────────────
function AnimatedNumber({
  raw,
  shouldStart,
}: {
  raw: string;
  shouldStart: boolean;
}) {
  const { numeric, suffix, isDecimal } = parseNumber(raw);
  const hadCommas = raw.includes(',');
  const count = useCountUp(numeric, 1800, shouldStart);

  return (
    <>
      {formatNumber(count, hadCommas, isDecimal, raw)}
      {suffix}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AboutStats({
  stats,
  onAnimationComplete,
}: AboutStatsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  // Fire count-up once when section enters viewport
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Gradient backgrounds
  const iconGradients = [
    'bg-gradient-to-br from-amber-400 to-orange-600',
    'bg-gradient-to-br from-emerald-400 to-teal-600',
    'bg-gradient-to-br from-blue-400 to-indigo-600',
    'bg-gradient-to-br from-purple-400 to-purple-700',
    'bg-gradient-to-br from-pink-400 to-rose-600',
    'bg-gradient-to-br from-cyan-400 to-blue-600',
    'bg-gradient-to-br from-yellow-400 to-amber-600',
    'bg-gradient-to-br from-red-400 to-red-600',
  ];

  return (
    <section
      ref={sectionRef}
      className="py-12 -mt-24 relative z-10 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.iconComponent;
            const gradientClass =
              iconGradients[index % iconGradients.length];

            return (
              <div
                key={index}
                className="opacity-0 -translate-y-full"
                style={{
                  animation: `slideInFromBottom 0.6s ease-out ${
                    index * 0.15 + 0.2
                  }s forwards`,
                }}
                onAnimationEnd={() =>
                  onAnimationComplete?.(index)
                }
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 overflow-hidden relative bg-white rounded-2xl">
                  {/* ↓ Changed: p-4 → p-3, reduced icon sizes, number size, and label size */}
                  <CardContent className="p-3 text-center relative z-10">
                    {/* Icon — reduced from h-12 w-12 md:h-16 md:w-16 → h-9 w-9 md:h-11 md:w-11 */}
                    <div
                      className={`h-9 w-9 md:h-11 md:w-11 ${gradientClass} group-hover:bg-white rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-500 shadow-lg`}
                    >
                      <Icon
                        className="h-4 w-4 md:h-5 md:w-5 text-white group-hover:text-[#0148ac] transition-colors duration-500"
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Number — reduced from text-2xl md:text-4xl → text-xl md:text-2xl, mb-2 → mb-1 */}
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-white mb-1 transition-colors duration-500 font-serif">
                      <AnimatedNumber
                        raw={stat.number}
                        shouldStart={hasBeenVisible}
                      />
                    </h3>

                    {/* Label — kept same */}
                    <p className="text-xs md:text-sm font-medium text-slate-600 group-hover:text-white/90 transition-colors duration-500">
                      {stat.label}
                    </p>

                    {/* Underline */}
                    <div className="w-16 h-0.5 bg-[#f9bf0f] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </CardContent>

                  {/* Hover Background Overlay */}
                  <div className="absolute inset-0 bg-[#0148ac] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out rounded-2xl" />
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Animation Keyframes */}
      <div className="hidden">
        <style>
          {`
            @keyframes slideInFromBottom {
              from {
                opacity: 0;
                transform: translateY(100px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </div>
    </section>
  );
}