'use client';

import { Badge } from '@/components/ui/badge';
import { Headphones } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ContactHeader() {
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    const images = [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'
    ];
    
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBgImage(randomImage);
  }, []);

  return (
    <section className="relative overflow-hidden py-24">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${bgImage}')`,
          boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,0.7)',
          backgroundBlendMode: 'overlay'
        }}
      />
      
      {/* Pattern Overlays */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLVoiIHN0cm9rZT0iI2RkZGRkZCIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-5 z-10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-10" />
      
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 z-15" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20 z-15" />

      <div className="container mx-auto px-4 relative z-30">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="overflow-hidden">
            <Badge 
              className="mb-6 bg-white/10 backdrop-blur-md border-white/30 text-white hover:text-white hover:bg-white/20 hover:border-white/40 px-6 py-2 text-sm transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-8 duration-800 delay-200 fill-mode-forwards"
            >
              <Headphones className="h-3 w-3 mr-1" />
              24/7 Support Available
            </Badge>
          </div>
          
          {/* Title */}
          <div className="overflow-hidden">
          <h1 
  className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-in slide-in-from-bottom-12 duration-1000 delay-400 fill-mode-forwards zoom-in-95"
>
  <span className="text-white">Get in </span>
  <span className="text-blue-400">Touch</span>
</h1>
          </div>
          
          {/* Paragraph */}
          <div className="overflow-hidden">
            <p 
              className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto animate-[slideInLeft_0.8s_ease-out_0.6s_forwards] opacity-0 -translate-x-full"
            >
              Have questions? We're here to help you find your perfect accommodation. Reach out through any channel that suits you best.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden styles for custom animations */}
      <div className="hidden">
        <style>
          {`@keyframes slideInLeft {
              from {
                opacity: 0;
                transform: translateX(-100%);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }`}
        </style>
      </div>
    </section>
  );
}