
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

    const start = 0;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + eased * (target - start);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
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

  // Modern gradient backgrounds for icons
  const iconGradients = [
    'bg-gradient-to-br from-violet-500 to-fuchsia-600',
    'bg-gradient-to-br from-emerald-500 to-cyan-600',
    'bg-gradient-to-br from-orange-500 to-amber-600',
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-rose-500 to-pink-600',
    'bg-gradient-to-br from-teal-500 to-emerald-600',
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-red-500 to-rose-600',
  ];

  return (
    <section
      ref={sectionRef}
      className="py-12 -mt-24 relative z-10"
    >
      <div className="container mx-auto px-4">
        {/* Grid with reduced gap and centered cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.iconComponent;
            const gradientClass =
              iconGradients[index % iconGradients.length];

            return (
              <div key={index} className="flex justify-center">
                <Card className="w-[160px] sm:w-[180px] md:w-[240px] border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 group bg-white rounded-xl overflow-hidden">
                  <CardContent className="p-4 text-center">
                    {/* Icon with modern design - smaller and cleaner */}
                    <div className="relative mb-3">
                      <div className={`w-10 h-10 mx-auto ${gradientClass} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                      </div>
                      {/* Decorative dot */}
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Number with modern typography */}
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#0148ac] transition-colors duration-300 font-sans tracking-tight">
                      <AnimatedNumber
                        raw={stat.number}
                        shouldStart={hasBeenVisible}
                      />
                    </h3>

                    {/* Label with modern styling */}
                    <p className="text-xs sm:text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors duration-300 mt-1">
                      {stat.label}
                    </p>

                    {/* Minimal accent line */}
                    <div className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mt-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}