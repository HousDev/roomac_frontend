

import { forwardRef, useMemo } from 'react';
import type { Step } from './types';

interface HowItWorksSectionProps {
  id: string;
  visible: boolean;
  steps: Step[];
}

// Brand: #004AAD blue, #FFC107 gold
const STEP_THEMES = [
  { num: 'bg-[#004AAD] text-white', icon: '#004AAD', dot: 'bg-[#004AAD]', ring: 'ring-[#004AAD]/20' },
  { num: 'bg-[#FFC107] text-[#004AAD]', icon: '#FFC107', dot: 'bg-[#FFC107]', ring: 'ring-[#FFC107]/25' },
  { num: 'bg-[#004AAD] text-white', icon: '#004AAD', dot: 'bg-[#004AAD]', ring: 'ring-[#004AAD]/20' },
  { num: 'bg-[#FFC107] text-[#004AAD]', icon: '#FFC107', dot: 'bg-[#FFC107]', ring: 'ring-[#FFC107]/25' },
];

const DELAYS = ['delay-0', 'delay-100', 'delay-200', 'delay-300'];

export const HowItWorksSection = forwardRef<HTMLElement, HowItWorksSectionProps>(
  ({ id, visible, steps }, ref) => {
    const delays = useMemo(() => DELAYS, []);

    return (
      <section
        ref={ref}
        id={id}
        className={`py-16 md:py-20 bg-white transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="container mx-auto px-4">

          {/* ── Header ── */}
          <div className="text-center mb-12 md:mb-16">
            {/* Eyebrow */}
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4"
              style={{ background: 'rgba(0,74,173,0.07)', color: '#004AAD', border: '1px solid rgba(0,74,173,0.15)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#004AAD]" />
              Simple Process
            </span>

            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
              How It{' '}
              <span className="relative inline-block text-[#004AAD]">
                Works?
                {/* Gold underline */}
                <span
                  className="absolute left-0 -bottom-1 h-[3px] w-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #FFC107, #FFD54F88)' }}
                />
              </span>
            </h2>

            <p className="mt-4 text-gray-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Your journey to comfortable living, simplified in easy steps.
            </p>
          </div>

          {/* ── Steps ── */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 md:gap-6 md:items-stretch">
              {steps.map((step, index) => {
                const theme = STEP_THEMES[index % STEP_THEMES.length];
                const delay = delays[index % delays.length];
                const isLast = index === steps.length - 1;

                return (
                  <div
                    key={index}
                    className={`relative flex flex-col transition-all duration-700 ${delay} ${
                      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                  >
                    {/* Desktop connector — arrow timeline */}
                    {!isLast && (
                      <div className="hidden md:block absolute top-8 left-[calc(50%+2.2rem)] w-[calc(100%-4.7rem)]" style={{ height: 2 }}>
                        {/* Gradient line */}
                        <div
                          className="absolute inset-0"
style={{ backgroundColor: '#888', height: 2 }}                        />
                        {/* Arrow head — explicitly gold filled */}
                       <svg
  className="absolute -right-3 -top-[10px]"
  width="22"
  height="22"
  viewBox="0 0 22 22"
  fill="none"
>
  <path
    d="M4 11 L17 11"
    stroke="#888"
    strokeWidth="2.5"
    strokeLinecap="round"
  />
  <path
    d="M11 4 L18 11 L11 18"
    stroke="#888"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>
                      </div>
                    )}

                    {/* Card — h-full on inner so all cards stretch equally */}
                    <div className="flex flex-col items-center text-center group h-full">

                      {/* Number circle */}
                      <div className="relative mb-4 flex-shrink-0">
                        <div
                          className={`absolute inset-0 rounded-full ring-4 ${theme.ring} scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500`}
                        />
                        <div
                          className={`w-16 h-16 rounded-full ${theme.num} flex items-center justify-center text-xl font-black shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 select-none`}
                        >
                          {step.number}
                        </div>
                      </div>

                      {/* Text content — flex-1 so all cards same height */}
                      <div
                        className="bg-gray-50 rounded-2xl px-5 py-6 w-full flex-1 flex flex-col items-center transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5"
                        style={{ border: '1px solid rgba(0,74,173,0.08)' }}
                      >
                        {/* Step label */}
                        <p
                          className="text-[10px] font-bold uppercase tracking-widest mb-2"
                          style={{ color: theme.icon }}
                        >
                          Step {String(index + 1).padStart(2, '0')}
                        </p>

                        {/* Title */}
                        <h3 className="text-base font-black text-gray-900 mb-2 leading-snug">
                          {step.title}
                        </h3>

                       

                        {/* Description — mt-auto pushes it down so cards align */}
                        <p className="text-gray-500 text-xs leading-relaxed mt-auto">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Mobile connector */}
                    {!isLast && (
                      <div className="md:hidden flex flex-col items-center my-2">
                        <div className="w-px h-5 bg-gradient-to-b from-[#004AAD33] to-[#FFC10733]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFC107]" />
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