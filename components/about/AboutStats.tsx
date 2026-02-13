'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { StatItem } from '@/data/types';

interface AboutStatsProps {
  stats: StatItem[];
  onAnimationComplete?: (index: number) => void;
}

export default function AboutStats({ stats, onAnimationComplete }: AboutStatsProps) {
  // Beautiful gradients matching the colors from your image
  const iconGradients = [
    'bg-gradient-to-br from-amber-400 to-orange-600', // Gold/Orange for Premium Properties
    'bg-gradient-to-br from-emerald-400 to-teal-600', // Green/Teal for Cities Covered
    'bg-gradient-to-br from-blue-400 to-indigo-600', // Blue/Indigo for Average Rating
    'bg-gradient-to-br from-purple-400 to-purple-700', // Purple for additional stat
    'bg-gradient-to-br from-pink-400 to-rose-600', // Pink for additional stat
    'bg-gradient-to-br from-cyan-400 to-blue-600', // Cyan/Blue for additional stat
    'bg-gradient-to-br from-yellow-400 to-amber-600', // Yellow/Amber for additional stat
    'bg-gradient-to-br from-red-400 to-red-600' // Red for additional stat
  ];

  return (
    <section className="py-12 -mt-24 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.iconComponent;
            const gradientClass = iconGradients[index % iconGradients.length];
            
            return (
              <div
                key={index}
                className="opacity-0 -translate-y-full"
                style={{
                  animation: `slideInFromBottom 0.6s ease-out ${index * 0.15 + 0.2}s forwards`
                }}
                onAnimationEnd={() => onAnimationComplete?.(index)}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 overflow-hidden relative bg-white">
                  <CardContent className="p-4 md:p-4 text-center relative z-10">
                    {/* Icon Container - Beautiful gradients that turn white on hover */}
                    <div className={`h-10 w-12 md:h-16 md:w-16 ${gradientClass} group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-white rounded-full flex items-center justify-center mx-auto  group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                      {/* Icon - White by default, turns blue (#0148ac) on hover */}
                      <Icon 
                        className="h-6 w-6 md:h-8 md:w-8 text-white group-hover:text-[#0148ac] transition-colors duration-500" 
                        strokeWidth={1.5} 
                      />
                    </div>
                    
                    {/* Number - Turns white on hover */}
                    <h3 className="text-2xl md:text-4xl font-bold text-slate-900 group-hover:text-white mb-2 transition-colors duration-500 font-serif">
                      {stat.number}
                    </h3>
                    
                    {/* Label - Turns white on hover */}
                    <p className="text-xs md:text-sm font-medium text-slate-600 group-hover:text-white/90 transition-colors duration-500">
                      {stat.label}
                    </p>
                    
                    {/* Gold/Yellow underline (#f9bf0f) - appears on hover */}
                    <div 
                      className="w-16 h-0.5 bg-[#f9bf0f] mx-auto  opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  </CardContent>
                  
                  {/* Blue background overlay (#0148ac) - slides up from bottom on hover */}
                  <div 
                    className="absolute inset-0 bg-[#0148ac] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out rounded-2xl"
                  />
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Animation Keyframes */}
      <div className="hidden">
        <style>
          {`@keyframes slideInFromBottom {from{opacity:0;transform:translateY(100px);}to{opacity:1;transform:translateY(0);}}`}
        </style>
      </div>
    </section>
  );
}