'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useMemo } from 'react';
import { IconName } from './data';

interface StatData {
  number: string;
  label: string;
  iconName: IconName;
}

interface QuickStatsProps {
  stats: StatData[];
  // IconLoader: React.ComponentType<{ name: IconName } & React.SVGProps<SVGSVGElement>>;
  IconLoader: React.ForwardRefExoticComponent<
  { name: IconName } &
  React.SVGProps<SVGSVGElement> &
  React.RefAttributes<SVGSVGElement>
>;

}

export default function QuickStats({ stats, IconLoader }: QuickStatsProps) {
  const colorConfigs = useMemo(() => [
    {
      iconColor: 'from-red-300 to-red-500',
      accentColor: 'border-red-500',
      shadowColor: 'shadow-red-900/40',
      hoverShadowColor: 'group-hover:shadow-red-800/60',
      bottomLineColor: 'bg-gradient-to-r from-red-600 to-red-800',
      sideLineColor: 'via-red-700',
      sideLineRightColor: 'via-red-600',
      cornerColor: 'border-red-600/0 group-hover:border-red-500/80',
      bgFromColor: 'from-red-200/20'
    },
    {
      iconColor: 'from-blue-600 to-blue-600',
      accentColor: 'border-blue-500',
      shadowColor: 'shadow-blue-900/40',
      hoverShadowColor: 'group-hover:shadow-blue-800/60',
      bottomLineColor: 'bg-gradient-to-r from-blue-600 to-blue-800',
      sideLineColor: 'via-blue-700',
      sideLineRightColor: 'via-blue-600',
      cornerColor: 'border-blue-600/0 group-hover:border-blue-500/80',
      bgFromColor: 'from-blue-200/20'
    },
    {
      iconColor: 'from-green-400 to-green-600',
      accentColor: 'border-green-500',
      shadowColor: 'shadow-green-900/40',
      hoverShadowColor: 'group-hover:shadow-green-800/60',
      bottomLineColor: 'bg-gradient-to-r from-green-600 to-green-800',
      sideLineColor: 'via-green-700',
      sideLineRightColor: 'via-green-600',
      cornerColor: 'border-green-600/0 group-hover:border-green-500/80',
      bgFromColor: 'from-green-200/20'
    },
    {
      iconColor: 'from-purple-500 to-purple-500',
      accentColor: 'border-purple-500',
      shadowColor: 'shadow-purple-900/40',
      hoverShadowColor: 'group-hover:shadow-purple-800/60',
      bottomLineColor: 'bg-gradient-to-r from-purple-600 to-purple-800',
      sideLineColor: 'via-purple-700',
      sideLineRightColor: 'via-purple-600',
      cornerColor: 'border-purple-600/0 group-hover:border-purple-500/80',
      bgFromColor: 'from-purple-200/20'
    }
  ], []);

  return (
    <section className="py-12 -mt-16 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const colors = colorConfigs[index % colorConfigs.length];
            
            return (
              <Card 
                key={index} 
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 bg-white overflow-hidden group relative opacity-0 animate-[slideInRight_0.8s_ease-out_forwards]"
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <CardContent className="p-6 text-center relative z-10 group">
                  {/* Icon Container */}
                  <div
                    className={`
                      h-16 w-16 mx-auto mb-4 rounded-3xl flex items-center justify-center
                      bg-gradient-to-br ${colors.iconColor}
                      shadow-lg ${colors.shadowColor}
                      relative overflow-hidden transition-transform duration-700
                      group-hover:scale-110 group-hover:-translate-y-1
                    `}
                  >
                    {/* Soft Glow */}
                    <div className={`
                      absolute inset-0 rounded-3xl
                      bg-gradient-to-r from-transparent via-white/20 to-transparent
                      animate-[shimmer_2s_infinite] 
                      pointer-events-none
                    `} />

                    {/* Pulse Ring */}
                    <div className={`
                      absolute inset-0 rounded-3xl border-2 ${colors.accentColor}
                      scale-100 group-hover:scale-125 opacity-60 group-hover:opacity-20
                      transition-all duration-700
                    `} />

                    {/* Icon */}
                    <IconLoader name={stat.iconName} className="h-8 w-8 text-white relative z-10 drop-shadow-lg transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  {/* Number */}
                  <h3 className="text-4xl font-extrabold mb-1 text-black transition-all duration-500 group-hover:text-gray-800 group-hover:scale-105">
                    {stat.number}
                  </h3>

                  {/* Label */}
                  <p className="text-sm text-gray-700 font-semibold transition-all duration-500 group-hover:text-gray-900 group-hover:tracking-wider">
                    {stat.label}
                  </p>

                  {/* Smooth Bottom Line with Dot */}
                  <div className={`
                    absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 group-hover:w-3/4
                    ${colors.bottomLineColor} rounded-full transition-all duration-700
                  `}>
                    <div className="absolute top-1/2 left-0 w-2 h-2 bg-white rounded-full -translate-y-1/2 opacity-0 group-hover:opacity-100 animate-[moveDot_1.5s_linear_infinite]" />
                  </div>

                  {/* Soft Background Glow on hover */}
                  <div className={`
                    absolute inset-0 rounded-xl -z-10
                    bg-gradient-to-br
                    ${colors.bgFromColor}
                    to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-700
                  `} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}