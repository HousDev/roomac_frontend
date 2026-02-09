'use client';

import { Card, CardContent } from '@/components/ui/card';

interface StatItem {
  number: string;
  label: string;
  iconComponent: React.ComponentType<any>;
  color: string;
}

interface AboutStatsProps {
  stats: StatItem[];
  onAnimationComplete?: (index: number) => void;
}

export default function AboutStats({ stats, onAnimationComplete }: AboutStatsProps) {
  return (
    <section className="py-12 -mt-16 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.iconComponent;
            return (
              <div 
                key={index} 
                className="opacity-0 -translate-y-full"
                style={{
                  animation: `slideInFromBottom 0.6s ease-out ${index * 0.15 + 0.2}s forwards`
                }}
                onAnimationEnd={() => onAnimationComplete?.(index)}
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2">
                  <CardContent className="p-6 text-center">
                    <div className={`h-16 w-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold text-slate-900 mb-2">{stat.number}</h3>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden">
        <style>
          {`@keyframes slideInFromBottom {from{opacity:0;transform:translateY(100px);}to{opacity:1;transform:translateY(0);}}`}
        </style>
      </div>
    </section>
  );
}