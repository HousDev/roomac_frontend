'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ValueItem {
  iconComponent: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}

interface AboutValuesProps {
  values: ValueItem[];
  onHover?: (index: number) => void;
}

export default function AboutValues({ values, onHover }: AboutValuesProps) {
  return (
   <section className="py-8 relative overflow-hidden">
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-cyan-400/5 rounded-full animate-[float_8s_ease-in-out_infinite] blur-sm" />
    <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-blue-400/5 to-white/10 rounded-full animate-[float_10s_ease-in-out_infinite_reverse_2s] blur-sm" />
  </div>

  <div className="container mx-auto px-4 relative z-10">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8 overflow-hidden">
        <div className="inline-block mb-4 animate-[zoomIn_0.8s_ease-out_0.2s_forwards] opacity-0 scale-50">
          <div className="backdrop-blur-sm bg-white/30 rounded-full px-6 py-2 border border-white/50 shadow-lg">
            <Badge className="bg-white text-[#004AAD] border-0 px-4 py-1 backdrop-blur-sm">
              Our Values
            </Badge>
          </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 overflow-hidden">
          <div className="inline-block">
            {"What Drives Us".split("").map((letter, index) => (
              <span
                key={index}
                className="inline-block opacity-0 animate-[zoomLetter_0.6s_ease-out_forwards]"
                style={{ 
                  animationDelay: `${0.6 + (index * 0.05)}s`,
                  transformOrigin: 'center bottom'
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </h2>
        
        <p className="text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed opacity-0 animate-[zoomIn_0.8s_ease-out_1.2s_forwards] scale-50">
          The principles that guide everything we do
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {values.map((value, index) => {
          const Icon = value.iconComponent;
          return (
            <div 
              key={index} 
              className="opacity-0 scale-95 animate-[zoomIn_0.8s_ease-out_forwards]"
              style={{ animationDelay: `${1.5 + (index * 0.15)}s` }}
            >
              {/* Mobile पर min-height कम कर दिया */}
              <Card 
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:scale-105 h-full min-h-[280px] md:min-h-[400px]"
                onMouseEnter={() => onHover?.(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-400/0 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                
                <div className="absolute top-4 right-4 h-8 w-8 border-2 border-blue-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150" />
                
                <CardContent className="p-4 md:p-8 relative z-10 h-full">
                  {/* Icon container size: Mobile छोटा, Desktop वही */}
                  <div className={`h-16 w-16 md:h-20 md:w-20 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg group-hover:scale-125 transition-all duration-500 relative overflow-hidden`}>
                    <div className="absolute inset-0 border-2 border-white/30 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:scale-90 transition-all duration-500" />
                    
                    <div className="absolute inset-4 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                    
                    {/* Icon size: Mobile छोटा, Desktop वही */}
                    <Icon className="h-8 w-8 md:h-10 md:w-10 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  
                  {/* Title text size: Mobile छोटा, Desktop वही */}
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 group-hover:text-[#004AAD] transition-colors duration-300 transform group-hover:scale-105 origin-left">
                    {value.title}
                  </h3>
                  
                  {/* Description text size: Mobile छोटा, Desktop वही */}
                  <p className="text-slate-600 leading-relaxed text-base md:text-lg transform group-hover:scale-[1.02] transition-transform duration-500">
                    {value.description}
                  </p>
                </CardContent>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              </Card>
            </div>
          );
        })}
      </div>

      <div className="mt-10 md:mt-16 text-center overflow-hidden">
        <div 
          className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm px-6 py-3 md:px-8 md:py-4 rounded-2xl border border-white/40 shadow-lg opacity-0 scale-95 animate-[zoomIn_0.8s_ease-out_forwards]"
          style={{ animationDelay: '2.5s' }}
        >
          <div className="h-5 w-5 md:h-6 md:w-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center animate-[zoomPulse_2s_ease-in-out_infinite]">
            <svg className="h-3 w-3 md:h-4 md:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-base md:text-lg text-slate-700 font-medium">
            Living our values every day
          </span>
        </div>
      </div>
    </div>
  </div>
  <div className="hidden">
    <style>
      {`
      @keyframes zoomIn {
        0% { opacity: 0; transform: scale(0.5); }
        70% { transform: scale(1.05); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      @keyframes zoomLetter {
        0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
        50% { transform: scale(1.1) rotate(5deg); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); }
      }
      
      @keyframes zoomPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        50% { transform: scale(1.1); }
        70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0) translateX(0) scale(1); }
        33% { transform: translateY(-20px) translateX(10px) scale(1.05); }
        66% { transform: translateY(10px) translateX(-10px) scale(0.95); }
      }
      
      @keyframes float_reverse {
        0%, 100% { transform: translateY(0) translateX(0) scale(1); }
        33% { transform: translateY(20px) translateX(-10px) scale(0.95); }
        66% { transform: translateY(-10px) translateX(10px) scale(1.05); }
      }
      `}
    </style>
  </div>
</section>
  );
}