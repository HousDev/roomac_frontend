'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { IconName } from './data';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  onBrowseProperties: () => void;
  onContactUs: () => void;
}

export default function HeroSection({ onBrowseProperties, onContactUs }: HeroSectionProps) {
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    const images = [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop'
    ];
    
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setBgImage(randomImage);
  }, []);

  return (
   <section className="relative overflow-hidden py-16 md:py-16">
      {/* Background Image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${bgImage}')`,
          boxShadow: 'inset 0 0 0 1000px rgba(0,0,0,0.75)',
          backgroundBlendMode: 'overlay'
        }}
      />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-30">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge with animation */}
          <div className="mb-4 md:mb-6 animate-in zoom-in duration-500 delay-200">
            <Badge className="bg-white/10 backdrop-blur-md border-white/30 text-white px-4 md:px-6 py-1 md:py-2 text-xs md:text-sm transition-all duration-300 hover:scale-105">
              Simple & Transparent Process
            </Badge>
          </div>
          
          {/* Heading with animation */}
          <h1 className="text-3xl md:text-3xl lg:text-6xl text-white font-bold mb-3 md:mb-6 leading-tight animate-in zoom-in duration-700 delay-400">
            How It <span className='text-blue-400'>Works</span> 
          </h1>
          
          {/* Paragraph with animation */}
          <p className="text-sm md:text-base lg:text-xl text-white/90 mb-4 md:mb-8 leading-relaxed max-w-3xl mx-auto animate-in zoom-in duration-700 delay-600 px-2 md:px-0">
            Your journey to comfortable living, simplified in 6 easy steps. From search to move-in, we make it seamless.
          </p>
          
          {/* Buttons with animation */}
          <div className="flex flex-wrap justify-center gap-4 animate-in zoom-in duration-700 delay-800">
            {/* Desktop view - exactly same as original */}
            <div className="hidden md:flex gap-4">
              <Link href="/properties" onClick={onBrowseProperties}>
                <Button size="lg" className="bg-white text-[#004AAD] hover:bg-blue-800 hover:text-white shadow-xl hover:shadow-2xl text-lg px-8 transition-all duration-300 hover:scale-105">
                  <svg className="mr-2 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Properties
                </Button>
              </Link>
              <Link href="/contact" onClick={onContactUs}>
                <Button size="lg" variant="outline" className="text-white bg-blue-800 hover:bg-blue-800 hover:text-white hover:border-blue-800 text-lg px-8 transition-all duration-300 hover:scale-105">
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Us
                </Button>
              </Link>
            </div>

            {/* Mobile view - compact buttons in ek hi row */}
            <div className="flex md:hidden gap-2 w-full max-w-xs mx-auto">
              <Link href="/properties" onClick={onBrowseProperties} className="flex-1">
                <Button size="default" className="bg-white text-[#004AAD] hover:bg-blue-800 hover:text-white shadow-lg text-xs py-2 px-2 transition-all duration-300 w-full">
                  <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse
                </Button>
              </Link>
              <Link href="/contact" onClick={onContactUs} className="flex-1">
                <Button size="default" variant="outline" className="text-white bg-blue-800 hover:bg-blue-800 hover:text-white hover:border-blue-800 text-xs py-2 px-2 transition-all duration-300 w-full">
                  <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}