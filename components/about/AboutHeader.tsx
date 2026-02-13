'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AboutHeader() {
  const [bgImage, setBgImage] = useState('');

  const headerData = {
    title: "About ROOMAC",
    description: "Redefining co-living with premium comfort, personalized care, and quality accommodation.",
    badgeText: "Trusted by 500+ Residents",
  };

  useEffect(() => {
    const images = [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074&auto=format&fit=crop'
    ];
    
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBgImage(randomImage);
  }, []);

  return (
    <section className="relative overflow-hidden py-16 md:py-20 lg:py-24">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${bgImage}')`,
          boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,0.75)',
          backgroundBlendMode: 'overlay'
        }}
      />
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLVoiIHN0cm9rZT0iI2RkZGRkZCIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-5 z-15" />
      
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-10" />
      
      <div className="container mx-auto px-4 relative z-30">
        <div className="max-w-4xl mx-auto text-center">
          
          <Badge className="mb-4 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 px-4 py-1.5 text-xs sm:text-sm opacity-0 animate-[popIn_0.6s_ease-out_0.2s_forwards] hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-3 w-3 mr-1 animate-spin animate-infinite animate-duration-[2000ms]" />
            {headerData.badgeText}
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-4 leading-tight tracking-tight opacity-0 animate-[slideDown_1.2s_ease-out_0.4s_forwards]">
            {headerData.title}
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 leading-relaxed max-w-3xl mx-auto opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]">
            {headerData.description}
            <span className="block mt-4 text-base sm:text-lg md:text-xl font-bold text-white leading-tight">
              We create spaces where you don't just live — you belong.
            </span>
          </p>
        
        </div>
      </div>

      <style jsx>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          80% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-60px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}