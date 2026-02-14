import { forwardRef, useMemo } from 'react';
import type { Step } from './types';

interface HowItWorksSectionProps {
  id: string;
  visible: boolean;
  steps: Step[];
}

const circleColors = [
  'bg-blue-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-500 text-white',
  'bg-purple-600 text-white'
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
  className={`py-14 bg-gray-50 transition-all duration-700 ${
    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
  }`}
>
  <div className="container mx-auto px-4">
    {/* Section Title */}
    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900 mb-8 md:mb-16 tracking-tight">
      How It <span className="text-[#004AAD]">works?</span>
    </h2>
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-10">
        {steps.map((step, index) => {
          const colorClass = circleColors[index % circleColors.length];
          const delayClass = delayClasses[index % delayClasses.length];
          return (
            <div 
              key={index}
              className={`relative text-center transition-all duration-700 ${delayClass} ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              {/* Step Circle */}
              <div className="flex justify-center mb-3 md:mb-6">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${colorClass} flex items-center justify-center text-xl md:text-2xl font-semibold shadow-md`}>
                  {step.number}
                </div>
              </div>
              {/* Title */}
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3 px-2">
                {step.title}
              </h3>
              {/* Description */}
              <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xs mx-auto px-4">
                {step.description}
              </p>
              {/* Connector Line - Desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-[1px] bg-gray-300" />
              )}
              {/* Vertical Connector - Mobile only */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <div className="w-[2px] h-6 bg-gray-300" />
                </div>
              )}
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
