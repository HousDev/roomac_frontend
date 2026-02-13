'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MilestoneItem } from './types';
import TimelineDot from './Dot';
import { useRef } from 'react';

interface AboutTimelineProps {
  milestones: MilestoneItem[];
  onScroll?: () => void;
}

export default function AboutTimeline({ milestones, onScroll }: AboutTimelineProps) {
  const cardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  return (
    <section className="py-5 -mt-6 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white relative overflow-hidden">
      {/* Timeline Dot SVG - Yeh line cards ke neeche connect karega */}
      <TimelineDot cardRefs={cardRefs} />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-12 h-12 bg-[#004AAD]/10 rounded-full animate-[orbFloat_15s_ease-in-out_infinite] blur-sm" />
        <div className="absolute top-40 right-20 w-8 h-8 bg-blue-400/10 rounded-full animate-[orbFloat_12s_ease-in-out_infinite_reverse_2s] blur-sm" />
        <div className="absolute bottom-32 left-1/4 w-10 h-10 bg-blue-300/20 rounded-full animate-[orbFloat_18s_ease-in-out_infinite_1s] blur-sm" />
        <div className="absolute top-1/3 left-1/3 w-14 h-14 bg-white/20 rounded-full animate-[orbFloat_20s_ease-in-out_infinite_0.5s] blur-sm" />
        <div className="absolute bottom-20 right-1/4 w-9 h-9 bg-white/30 rounded-full animate-[orbFloat_16s_ease-in-out_infinite_reverse_1.5s] blur-sm" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 overflow-hidden">
            <div className="inline-block mb-4 animate-[badgeRise_1s_ease-out_0.3s_forwards] opacity-0">
              <Badge className="relative bg-gradient-to-r from-[#004AAD] via-blue-500 to-blue-500 text-white border-0 px-6 py-2 shadow-lg overflow-hidden group">
                <span className="relative z-10 font-semibold">Our Journey</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#004AAD] via-blue-500 to-blue-500 animate-[shimmerWave_3s_ease-in-out_infinite]" />
              </Badge>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-2 overflow-hidden">
              <div className="inline-block">
               <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-3 tracking-tight leading-tight">
  {"Milestones & Achievements".split("").map((letter, index) => (
    <span
      key={index}
      className="inline-block opacity-0 animate-[letterWave_0.6s_ease-out_forwards]"
      style={{ 
        animationDelay: `${0.5 + (index * 0.03)}s`,
        color: letter === ' ' ? 'transparent' : '#1e293b'
      }}
    >
      {letter}
    </span>
  ))}
</h2>
              </div>
            </h2>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed opacity-0 animate-[textGlide_1s_ease-out_1.2s_forwards]">
              From a single property to a trusted network across cities
            </p>
          </div>

          <div className="relative pb-20" onScroll={onScroll}>
            {/* Mobile View - Cards Only */}
            <div className="md:hidden -mt-6">
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    ref={cardRefs[index]}
                    className="opacity-0 relative pb-8"
                    style={{
                      animation: `cardReveal 0.8s ease-out ${1.8 + (index * 0.2)}s forwards`
                    }}
                  >
                    <Card className="border-0 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#004AAD]/5 via-blue-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-0 left-0 w-12 h-1 bg-gradient-to-r from-[#004AAD] to-cyan-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                      <div className="absolute bottom-0 right-0 w-12 h-1 bg-gradient-to-r from-cyan-400 to-[#004AAD] transform translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                      
                      <CardContent className="p-6 relative z-10">
                        <Badge className="mb-3 bg-gradient-to-r from-[#004AAD] to-cyan-500 text-white border-0 shadow-md relative overflow-hidden group-hover:shadow-lg transition-all duration-300">
                          <span className="relative z-10">{milestone.year}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#004AAD] to-cyan-500 animate-[gradientSlide_2s_ease-in-out_infinite]" />
                        </Badge>
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#004AAD] transition-colors duration-300">
                          {milestone.title}
                        </h3>
                        
                        <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View - Cards with line BELOW each card */}
            <div className="hidden md:block space-y-32">
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  ref={cardRefs[index]}
                  className={`flex flex-col md:flex-row items-start gap-8 opacity-0 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                  style={{
                    animation: `cardReveal 0.8s ease-out ${1.8 + (index * 0.2)}s forwards`
                  }}
                >
                  <div className="md:w-1/2">
                    <div className="relative">
                      <Card className={`border-0 shadow-xl relative overflow-hidden group ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'} hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#004AAD]/5 via-blue-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-[#004AAD] to-cyan-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                        <div className="absolute bottom-0 right-0 w-16 h-1 bg-gradient-to-r from-cyan-400 to-[#004AAD] transform translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                        
                        <CardContent className="p-8 relative z-10 pb-12">
                          <Badge className="mb-4 bg-gradient-to-r from-[#004AAD] to-cyan-600 text-white border-0 shadow-md relative overflow-hidden group-hover:shadow-lg transition-all duration-300">
                            <span className="relative z-10">{milestone.year}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#95b7e3] to-cyan-500 animate-[gradientSlide_2s_ease-in-out_infinite]" />
                          </Badge>
                          
                          <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#004AAD] transition-colors duration-300">
                            {milestone.title}
                          </h3>
                          
                          <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                            {milestone.description}
                          </p>
                        </CardContent>
                      </Card>
                      
                      {/* Connection point indicator - invisible but helps with positioning */}
                      <div 
                        className={`absolute bottom-0 w-4 h-4 ${index % 2 === 0 ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} translate-y-1/2 bg-[#004AAD] rounded-full opacity-0`}
                      />
                    </div>
                  </div>
                  
                  {/* Spacer for alignment */}
                  <div className="md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden">
        <style>
          {`
          @keyframes badgeRise {
            0% { opacity: 0; transform: translateY(20px) scale(0.9); }
            70% { transform: translateY(-5px) scale(1.05); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          
          @keyframes shimmerWave {
            0%, 100% { background-position: -200% 0; }
            50% { background-position: 200% 0; }
          }
          
          @keyframes letterWave {
            0% { opacity: 0; transform: translateY(20px) rotateX(90deg); }
            100% { opacity: 1; transform: translateY(0) rotateX(0); }
          }
          
          @keyframes textGlide {
            0% { opacity: 0; transform: translateX(-30px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes cardReveal {
            0% { opacity: 0; transform: translateX(-40px) scale(0.95); }
            100% { opacity: 1; transform: translateX(0) scale(1); }
          }
          
          @keyframes orbFloat {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(20px, -30px) rotate(120deg); }
            66% { transform: translate(-15px, 20px) rotate(240deg); }
          }
          
          @keyframes gradientSlide {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          `}
        </style>
      </div>
    </section>
  );
}