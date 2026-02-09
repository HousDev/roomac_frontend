'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MilestoneItem } from './types';

interface AboutTimelineProps {
  milestones: MilestoneItem[];
  onScroll?: () => void;
}

export default function AboutTimeline({ milestones, onScroll }: AboutTimelineProps) {
  return (
    <section className="py-20 -mt-6 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white relative overflow-hidden">
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
              <Badge className="relative bg-gradient-to-r from-[#004AAD] via-blue-400 to-cyan-400 text-white border-0 px-6 py-2 shadow-lg overflow-hidden group">
                <span className="relative z-10 font-semibold">Our Journey</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#004AAD] via-blue-400 to-cyan-400 animate-[shimmerWave_3s_ease-in-out_infinite]" />
              </Badge>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4 overflow-hidden">
              <div className="inline-block">
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
              </div>
            </h2>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed opacity-0 animate-[textGlide_1s_ease-out_1.2s_forwards]">
              From a single property to a trusted network across cities
            </p>
          </div>

          <div className="relative" onScroll={onScroll}>
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-0 w-1 bg-gradient-to-b from-[#004AAD] via-blue-400 to-cyan-400 animate-[lineExtend_2s_ease-out_1.5s_forwards] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent animate-[lightTrail_3s_linear_infinite]" />
            </div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col md:flex-row items-center gap-8 opacity-0 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                  style={{
                    animation: `cardReveal 0.8s ease-out ${1.8 + (index * 0.2)}s forwards`
                  }}
                >
                  <div className="md:w-1/2">
                    <Card className={`border-0 shadow-xl relative overflow-hidden group ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'} hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#004AAD]/5 via-blue-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-[#004AAD] to-cyan-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                      <div className="absolute bottom-0 right-0 w-16 h-1 bg-gradient-to-r from-cyan-400 to-[#004AAD] transform translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                      
                      <CardContent className="p-8 relative z-10">
                        <Badge className="mb-4 bg-gradient-to-r from-[#004AAD] to-cyan-500 text-white border-0 shadow-md relative overflow-hidden group-hover:shadow-lg transition-all duration-300">
                          <span className="relative z-10">{milestone.year}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#004AAD] to-cyan-500 animate-[gradientSlide_2s_ease-in-out_infinite]" />
                        </Badge>
                        
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#004AAD] transition-colors duration-300">
                          {milestone.title}
                        </h3>
                        
                        <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="hidden md:flex relative">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#004AAD] to-cyan-500 shadow-xl z-10 animate-[nodeGlow_2s_ease-in-out_infinite] p-0.5 group">
                      <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#004AAD] to-cyan-400 animate-[spinOrb_4s_linear_infinite]" />
                      </div>
                    </div>
                    
                    <div className={`absolute top-1/2 w-8 h-0.5 bg-gradient-to-r ${index % 2 === 0 ? 'left-full from-[#004AAD]/50 via-cyan-400/50 to-transparent' : 'right-full from-transparent via-cyan-400/50 to-[#004AAD]/50'} opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-12`} />
                  </div>
                  
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
          
          @keyframes lineExtend {
            0% { height: 0; }
            100% { height: 100%; }
          }
          
          @keyframes lightTrail {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(100%); opacity: 0; }
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
          
          @keyframes orbFloat_reverse {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(-20px, 30px) rotate(-120deg); }
            66% { transform: translate(15px, -20px) rotate(-240deg); }
          }
          
          @keyframes gradientSlide {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes pulseDot {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.5); opacity: 1; }
          }
          
          @keyframes nodeGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 74, 173, 0.3), 0 0 40px rgba(6, 182, 212, 0.2); }
            50% { box-shadow: 0 0 30px rgba(0, 74, 173, 0.5), 0 0 60px rgba(6, 182, 212, 0.3); }
          }
          
          @keyframes spinOrb {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }
          `}
        </style>
      </div>
    </section>
  );
}