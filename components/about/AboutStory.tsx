'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TeamItem {
  iconComponent: React.ComponentType<any>;
  title: string;
  description: string;
}

interface AboutStoryProps {
  team: TeamItem[]; // Changed from 'values' to 'team'
}

export default function AboutStory({ team }: AboutStoryProps) { // Changed prop name
  return (
    <section className="py-15 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-8 h-8 border-2 border-blue-300/30 rounded-lg animate-[floatShape_15s_linear_infinite] rotate-45 opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]" />
        <div className="absolute top-1/3 right-20 w-6 h-6 border border-cyan-400/20 rounded-full animate-[floatShape_20s_linear_infinite_2s] opacity-0 animate-[fadeIn_1s_ease-out_1.2s_forwards]" />
        <div className="absolute bottom-1/4 left-1/3 w-10 h-10 border-2 border-blue-400/25 rounded-lg animate-[floatShape_18s_linear_infinite_1s] rotate-12 opacity-0 animate-[fadeIn_1s_ease-out_1.4s_forwards]" />
        <div className="absolute bottom-1/3 right-1/4 w-7 h-7 border border-cyan-300/30 rounded-full animate-[floatShape_25s_linear_infinite_3s] opacity-0 animate-[fadeIn_1s_ease-out_1.6s_forwards]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 overflow-hidden">
            <div className="inline-block mb-4 opacity-0 animate-[badgePop_0.6s_ease-out_1s_forwards]">
              <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-[#004AAD] border-0 px-6 py-2  hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#004AAD] rounded-full animate-pulse animate-delay-1000" />
                  Our Story
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse animate-delay-1000" />
                </div>
              </Badge>
            </div>
            
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 overflow-hidden">
                <div className="inline-block">
                  {["Building", "Homes,", "Creating", "Communities"].map((word, wordIndex) => (
                    <span key={wordIndex} className="inline-block mr-2">
                      {word.split("").map((letter, letterIndex) => (
                        <span
                          key={`${wordIndex}-${letterIndex}`}
                          className="inline-block opacity-0 animate-[letterReveal_0.3s_ease-out_forwards]"
                          style={{ animationDelay: `${1.2 + (wordIndex * 0.2) + (letterIndex * 0.03)}s` }}
                        >
                          {letter}
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </h2>
              
              <div className="h-1 w-0 mx-auto bg-gradient-to-r from-blue-400 via-[#004AAD] to-cyan-400 opacity-0 animate-[underlineGrow_1.5s_ease-out_2s_forwards]" />
            </div>
          </div>

          <div className="relative group opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards]">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <Card className="border-0 shadow-2xl mb-10 relative overflow-hidden backdrop-blur-sm bg-white/95">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-[#004AAD] to-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              
             <CardContent className="p-3 md:p-12 relative z-10">
  {[
    "ROOMAC was founded with a simple yet powerful vision: to create living spaces that feel like home for professionals and students away from their families. We understand the challenges of finding quality accommodation that perfectly balances comfort, affordability, and community.",
    "What started as a single property has grown into a thriving network across major cities. Today, ROOMAC operates 50+ premium properties, serving hundreds of residents who trust us for their accommodation needs. Our commitment to quality, transparent pricing, and resident satisfaction has made us a preferred choice for co-living.",
    "But we're more than just a place to stay. We're a community where friendships are formed, careers are built, and memories are created. Every ROOMAC property is designed to foster connections, support personal growth, and provide the peace of mind you need to focus on what matters most."
  ].map((paragraph, index) => (
    <div 
      key={index} 
      className="mb-6 last:mb-0 overflow-hidden"
    >
      <div 
        className="text-base md:text-lg text-slate-700 leading-relaxed transform translate-x-full opacity-0"
        style={{
          animation: `slideInParagraph 0.8s ease-out ${1.8 + (index * 0.4)}s forwards`
        }}
      >
        {paragraph}
      </div>
    </div>
  ))}
</CardContent>
              <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400/30 rounded-full opacity-0 animate-[bounce_2s_ease-in-out_infinite,fadeIn_0.5s_ease-out_2.5s_forwards]" />
              <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-cyan-400/40 rounded-full opacity-0 animate-[bounce_2s_ease-in-out_infinite_0.5s,fadeIn_0.5s_ease-out_2.7s_forwards]" />
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {team.map((item, index) => { // Changed from 'values' to 'team'
              const Icon = item.iconComponent;
              return (
                <div 
                  key={index}
                  className="transform-gpu perspective-1000"
                  style={{
                    opacity: 0,
                    transform: 'translateY(30px) rotateX(10deg)',
                    animation: `card3DAppear 0.8s ease-out ${2.2 + (index * 0.2)}s forwards`
                  }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 cursor-pointer bg-gradient-to-br from-white to-blue-50/50">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-400/5 to-transparent rounded-full blur-xl" />
                      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-cyan-400/5 to-transparent rounded-full blur-xl" />
                    </div>
                    
                    <CardContent className="p-8 text-center relative z-10">
                      <div className="relative h-16 w-16 mx-auto mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#004AAD] to-cyan=-500 rounded-2xl animate-[spinSlow_20s_linear_infinite] opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="absolute inset-2 bg-gradient-to-br from-[#004AAD] to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#004AAD] transition-colors duration-300">
                        {item.title}
                      </h3>
                      
                      <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                        {item.description}
                      </p>
                    </CardContent>
                    
                    <div className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hidden">
        <style>
          {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes badgePop {
            0% { opacity: 0; transform: scale(0.8) rotate(-5deg); }
            80% { transform: scale(1.1) rotate(2deg); }
            100% { opacity: 1; transform: scale(1) rotate(0); }
          }
          
          @keyframes letterReveal {
            0% { opacity: 0; transform: translateY(10px) rotateX(90deg); }
            100% { opacity: 1; transform: translateY(0) rotateX(0); }
          }
          
          @keyframes underlineGrow {
            0% { width: 0; opacity: 0; }
            100% { width: 200px; opacity: 1; }
          }
          
          @keyframes slideInParagraph {
            0% { opacity: 0; transform: translateX(50px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          
          @keyframes card3DAppear {
            0% { opacity: 0; transform: translateY(30px) rotateX(10deg); }
            100% { opacity: 1; transform: translateY(0) rotateX(0); }
          }
          
          @keyframes floatShape {
            0% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-20px) translateX(10px) rotate(90deg); }
            50% { transform: translateY(-40px) translateX(0) rotate(180deg); }
            75% { transform: translateY(-20px) translateX(-10px) rotate(270deg); }
            100% { transform: translateY(0) translateX(0) rotate(360deg); }
          }
          
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          `}
        </style>
      </div>
    </section>
  );
}