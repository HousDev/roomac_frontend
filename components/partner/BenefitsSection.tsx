import { forwardRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Shield, Building2 } from 'lucide-react';
import type { Benefit, ColorSet } from './types';

interface BenefitsSectionProps {
  id: string;
  visible: boolean;
  benefits: Benefit[];
}

const iconMap = {
  TrendingUp: TrendingUp,
  Users: Users,
  Shield: Shield,
  Building2: Building2
};

const colorSets: ColorSet[] = [
  { 
    bg: 'from-blue-100 to-blue-100',
    bgHover: 'from-blue-200 to-blue-100',
    icon: 'text-blue-600',
    ring: 'border-blue-300/50',
    shadow: 'shadow-blue-100/50',
    shadowHover: 'shadow-blue-200/50',
    titleHover: 'group-hover:text-blue-700',
    underline: 'via-blue-300'
  },
  { 
    bg: 'from-green-100 to-emerald-50',
    bgHover: 'from-green-200 to-emerald-100',
    icon: 'text-emerald-600',
    ring: 'border-emerald-300/50',
    shadow: 'shadow-green-100/50',
    shadowHover: 'shadow-emerald-200/50',
    titleHover: 'group-hover:text-emerald-700',
    underline: 'via-emerald-300'
  },
  { 
    bg: 'from-pink-100 to-rose-50',
    bgHover: 'from-pink-200 to-rose-100',
    icon: 'text-rose-600',
    ring: 'border-rose-300/50',
    shadow: 'shadow-pink-100/50',
    shadowHover: 'shadow-rose-200/50',
    titleHover: 'group-hover:text-rose-700',
    underline: 'via-rose-300'
  },
  { 
    bg: 'from-purple-100 to-violet-50',
    bgHover: 'from-purple-200 to-violet-100',
    icon: 'text-violet-600',
    ring: 'border-violet-300/50',
    shadow: 'shadow-purple-100/50',
    shadowHover: 'shadow-violet-200/50',
    titleHover: 'group-hover:text-violet-700',
    underline: 'via-violet-300'
  }
];

export const BenefitsSection = forwardRef<HTMLElement, BenefitsSectionProps>(
  ({ id, visible, benefits }, ref) => {
    const delayClasses = useMemo(() => [
      'delay-0',
      'delay-100',
      'delay-200',
      'delay-300'
    ], []);

    return (
      <section 
        ref={ref}
        id={id}
        className={`py-10 bg-white transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center  text-slate-900 mb-5">
            Why Partner with Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => {
              const IconComponent = iconMap[benefit.icon as keyof typeof iconMap];
              const colorSet = colorSets[index % colorSets.length];
              const delayClass = delayClasses[index % delayClasses.length];
              
              return (
                <div 
                  key={index}
                  className={`h-full transition-all duration-700 ${delayClass} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                  <Card className="h-full flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-white relative transform perspective-1000">
                    <div className={`absolute inset-0 rounded-xl transition-all duration-1000 ${visible ? 'rotate-0 opacity-100' : 'rotate-y-90 opacity-0'}`} style={{ transitionDelay: `${index * 150}ms` }}>
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colorSet.bg} transition-all duration-700 ${visible ? 'opacity-0' : 'opacity-100'}`}></div>
                    </div>
                    
                    {/* <div className={`absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 ${colorSet.icon.replace('text', 'border')} rounded-tl-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:top-3 group-hover:left-3`} />
                    <div className={`absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 ${colorSet.icon.replace('text', 'border')} rounded-tr-lg opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 group-hover:top-3 group-hover:right-3`} />
                    <div className={`absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 ${colorSet.icon.replace('text', 'border')} rounded-bl-lg opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 group-hover:bottom-3 group-hover:left-3`} />
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 ${colorSet.icon.replace('text', 'border')} rounded-br-lg opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300 group-hover:bottom-3 group-hover:right-3`} /> */}
                    
                    <CardContent className="p-6 relative z-10 flex-grow flex flex-col">
                      <div className="relative mb-6">
                        <div className={`absolute -inset-2 bg-gradient-to-br ${colorSet.bg} rounded-2xl blur-md opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700`}></div>
                        <div className={`relative bg-gradient-to-br ${colorSet.bg} w-14 h-14 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:${colorSet.bgHover} transition-all duration-500 shadow-lg ${colorSet.shadow} group-hover:shadow-xl group-hover:${colorSet.shadowHover} transform group-hover:-translate-y-1`}>
                          <div className={`absolute inset-0 rounded-xl border-2 ${colorSet.ring} group-hover:scale-125 group-hover:opacity-0 transition-all duration-700`} />
                          <IconComponent className={`w-7 h-7 ${colorSet.icon} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`} />
                        </div>
                      </div>
                      
                      <h3 className={`text-xl font-bold text-slate-800 mb-3 ${colorSet.titleHover} transition-colors duration-500 group-hover:translate-x-1 relative inline-block`}>
                        {benefit.title}
                        <span className={`absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r ${colorSet.underline} to-transparent transition-all duration-500 rounded-full`}></span>
                      </h3>
                      
                      <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-500 flex-grow">
                        {benefit.description}
                      </p>
                      
                      <div className="mt-6 flex items-center justify-end">
                        <div className={`w-8 h-0.5 bg-gradient-to-r ${colorSet.underline} to-transparent group-hover:w-12 transition-all duration-500 rounded-full`}></div>
                        <div className={`ml-2 w-0 h-0.5 ${colorSet.bgHover.split(' ')[0]} to-transparent group-hover:w-4 transition-all duration-500 delay-100 rounded-full`}></div>
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </CardContent>
                    
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorSet.underline} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left rounded-b-xl`} />
                    
                    <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${colorSet.icon.replace('text', 'border')} rounded-tl-lg transform -rotate-45 scale-0 group-hover:scale-100 group-hover:rotate-0 transition-all duration-500`} style={{transitionDelay: '0ms'}} />
                    <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${colorSet.icon.replace('text', 'border')} rounded-tr-lg transform -rotate-45 scale-0 group-hover:scale-100 group-hover:rotate-0 transition-all duration-500`} style={{transitionDelay: '100ms'}} />
                    <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${colorSet.icon.replace('text', 'border')} rounded-bl-lg transform rotate-45 scale-0 group-hover:scale-100 group-hover:rotate-0 transition-all duration-500`} style={{transitionDelay: '200ms'}} />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${colorSet.icon.replace('text', 'border')} rounded-br-lg transform rotate-45 scale-0 group-hover:scale-100 group-hover:rotate-0 transition-all duration-500`} style={{transitionDelay: '300ms'}} />
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
);

BenefitsSection.displayName = 'BenefitsSection';