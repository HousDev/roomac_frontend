'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export default function AboutHeader() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-200 via-[#cfdbea] text-white py-12">       
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse animate-infinite animate-duration-[3000ms]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse animate-infinite animate-duration-[4000ms] animate-delay-1000" />

      <div className="container mx-auto px-4 relative mt-12 mb-6">
  <div className="max-w-4xl mx-auto text-center">
    <Badge className="mb-4 bg-white backdrop-blur-md border-white/30 text-blue-400 hover:text-white px-4 py-1.5 text-xs sm:text-sm opacity-0 animate-[popIn_0.6s_ease-out_0.2s_forwards] hover:scale-105 transition-transform duration-300">
      <Sparkles className="h-3 w-3 mr-1 animate-spin animate-infinite animate-duration-[2000ms]" />
      Trusted by 500+ Residents
    </Badge>
    
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-black font-bold mb-4 leading-tight tracking-tight">
      <div className="inline-block overflow-hidden whitespace-nowrap">
        <span className="inline-block animate-[typewriter_2.5s_steps(11,end)_forwards_0.5s]">
          About ROOMAC
        </span>
      </div>
    </h1>
    
    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 mb-2 leading-relaxed max-w-3xl mx-auto opacity-0 animate-[fadeUp_1s_ease-out_1.5s_forwards]">
      Redefining co-living with premium comfort, personalized care, and quality accommodation. 
      <span className="block mt-3 text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-900 animate-[pulse_2s_ease-in-out_infinite_2s] leading-tight">
        We create spaces where you don't just live — you belong.
      </span>
    </p>
  </div>
</div>
      <div className="hidden">
        <style>
          {`@keyframes popIn {0%{opacity:0;transform:scale(0.8) translateY(-20px);}80%{transform:scale(1.05);}100%{opacity:1;transform:scale(1) translateY(0);}}@keyframes typewriter {from{width:0;}to{width:100%;}}@keyframes fadeUp {from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}`}
        </style>
      </div>
    </section>
  );
}