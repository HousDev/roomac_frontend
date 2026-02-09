import { forwardRef, useMemo } from 'react';
import type { Step } from './types';

interface HowItWorksSectionProps {
  id: string;
  visible: boolean;
  steps: Step[];
}

const circleColors = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700'
];

export const HowItWorksSection = forwardRef<HTMLElement, HowItWorksSectionProps>(
  ({ id, visible, steps }, ref) => {
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
        className={`py-16 bg-slate-50 shadow-xl hover:shadow-2xl transition-all duration-1000 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">
            How It Works
          </h2>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const colorClass = circleColors[index % circleColors.length];
                const delayClass = delayClasses[index % delayClasses.length];
                
                return (
                  <div 
                    key={index} 
                    className={`relative group transition-all duration-700 ${delayClass} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center text-xl font-bold mb-4 relative overflow-hidden shadow-lg group-hover:scale-110 transition-all duration-500`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
                        <span className="relative z-10 group-hover:scale-125 transition-transform duration-500">
                          {step.number}
                        </span>
                        <div className="absolute inset-0 rounded-full border-2 border-current opacity-20 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700" />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors duration-500">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-500">
                        {step.description}
                      </p>
                      
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }
);

HowItWorksSection.displayName = 'HowItWorksSection';