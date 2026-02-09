'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export default function AboutHeader() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-200 via-[#cfdbea] text-white py-24">       
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse animate-infinite animate-duration-[3000ms]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse animate-infinite animate-duration-[4000ms] animate-delay-1000" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-white backdrop-blur-md border-white/30 text-blue-400 hover:text-white px-6 py-2 text-sm opacity-0 animate-[popIn_0.6s_ease-out_0.2s_forwards] hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-3 w-3 mr-1 animate-spin animate-infinite animate-duration-[2000ms]" />
            Trusted by 500+ Residents
          </Badge>
          
          <h1 className="text-5xl md:text-6xl text-black font-bold mb-6 leading-tight">
            <div className="inline-block overflow-hidden whitespace-nowrap">
              <span className="inline-block animate-[typewriter_2.5s_steps(11,end)_forwards_0.5s]">
                About ROOMAC
              </span>
            </div>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-700 mb-8 leading-relaxed max-w-3xl mx-auto opacity-0 animate-[fadeUp_1s_ease-out_1.5s_forwards]">
            Redefining co-living with Comfort, Care, and Quality Accommodation. 
            <span className="block mt-2 font-bold text-slate-700 animate-[pulse_2s_ease-in-out_infinite_2s]">
              We create spaces where you don't just live — you thrive.
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