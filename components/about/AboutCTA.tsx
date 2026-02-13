'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AboutCTA() {
  const [currentImage, setCurrentImage] = useState(0);
  
  const pgImages = [
    {
      url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      alt: "Modern PG Room with Bed"
    },
    {
      url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      alt: "Co-living Common Area"
    },
    {
      url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      alt: "PG Kitchen and Dining"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % pgImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white md:rounded-2xl mx-3 md:mx-6 lg:mx-8 my-0 md:my-8 mb-2 -mt-8">
      <div className="relative min-h-[450px] md:min-h-[400px] flex items-center">
        
        {/* Full Background Image Slider */}
        <div className="absolute inset-0 overflow-hidden">
          {pgImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              {/* Dark Overlay for text readability */}
              <div className="absolute inset-0 bg-black/50 md:bg-black/40" />
            </div>
          ))}
          
          {/* Slider Indicators - Hidden on mobile */}
          <div className="hidden md:flex absolute bottom-6 left-1/2 transform -translate-x-1/2 gap-2 z-20">
            {pgImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImage 
                    ? 'w-8 bg-white' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Curved Blue Background - Hidden on mobile, visible on md and up */}
        <div className="hidden md:block absolute inset-y-0 left-0 w-full md:w-[65%] lg:w-[58%] z-10">
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 1000 800" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="50%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            <path 
              d="M 0,0 L 0,800 L 750,800 Q 850,400 750,0 Z" 
              fill="url(#blueGradient)"
            />
          </svg>
        </div>

        {/* Mobile Modern Design - Angled cut design */}
        <div className="md:hidden absolute inset-0 z-10 ">
          {/* Main gradient background with geometric pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700">
            {/* Diagonal line pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 2px, transparent 2px, transparent 12px)'
              }} />
            </div>
          </div>
          
          {/* Modern geometric shape - Angled cut at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
          
          {/* Top right accent circle */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-400 rounded-full opacity-20 blur-3xl" />
          
          {/* Bottom left accent circle */}
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400 rounded-full opacity-20 blur-3xl" />
          
          {/* Modern diagonal line accent */}
          <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-64 bg-cyan-400 transform rotate-45 translate-x-8 -translate-y-8 opacity-30" />
          </div>
        </div>

        {/* Cyan Accent Curve - Hidden on mobile */}
        <div className="hidden md:block absolute inset-y-0 left-0 w-full md:w-[70%] lg:w-[62%] pointer-events-none z-20">
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 1000 800" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M 750,0 Q 850,400 750,800 L 820,800 Q 920,400 820,0 Z" 
              fill="#06b6d4"
              fillOpacity="0.85"
            />
          </svg>
        </div>

        {/* Light Blue Gradient Overlay */}
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-blue-50/40 to-transparent pointer-events-none hidden md:block z-30  " />

        {/* Grid Pattern - Adjusted for mobile */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 md:opacity-10 z-10 mix-blend-overlay " />

        {/* Main Content Container */}
        <div className="container mx-auto px-5 md:px-6 lg:px-8 relative z-30  ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Side - Text Content - Modern mobile layout */}
            <div className="text-white py-16 md:py-10 md:ml-8 lg:py-12 text-center md:text-left ">
              {/* Modern badge for mobile */}
             
              
              <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-4 leading-[1.2] md:leading-[1.1] tracking-tight px-2">
                Ready to Experience
                <br />
                ROOMAC?
              </h1>
              <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-6 text-white/90 font-light leading-relaxed max-w-lg mx-auto md:mx-0 px-3">
                Join our growing community and discover what makes ROOMAC the preferred choice for quality co-living
              </p>
              
              {/* Stats for mobile - adds uniqueness */}
              <div className="md:hidden flex justify-center gap-8 mb-8">
                <div>
                  <div className="text-xl font-bold">500+</div>
                  <div className="text-xs text-white/70">Properties</div>
                </div>
                <div>
                  <div className="text-xl font-bold">10k+</div>
                  <div className="text-xs text-white/70">Happy Clients</div>
                </div>
                <div>
                  <div className="text-xl font-bold">50+</div>
                  <div className="text-xs text-white/70">Cities</div>
                </div>
              </div>
              
              {/* Buttons - Modern stacked design on mobile */}
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 sm:gap-4 px-3">
                <Link href="/properties" className="w-full sm:w-auto">
                  <Button 
                    size="lg"
                    className="bg-white text-blue-900 hover:bg-blue-50 text-sm md:text-base lg:text-lg px-6 md:px-8 py-5 md:py-5 font-semibold transition-all duration-300 hover:translate-x-1 w-full shadow-lg hover:shadow-xl"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Explore Properties
                  </Button>
                </Link>
                
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 text-sm md:text-base lg:text-lg px-6 md:px-8 py-5 md:py-5 font-semibold transition-all duration-300 hover:translate-x-1 w-full"
                  >
                    Get in Touch
                  </Button>
                </Link>
              </div>
              
              {/* Trust indicator for mobile */}
              <p className="md:hidden text-xs text-white/60 mt-6 flex items-center justify-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">✓ 24/7 Support</span>
                <span className="flex items-center gap-1 ml-2">✓ Fully Furnished</span>
                <span className="flex items-center gap-1 ml-2">✓ No Hidden Charges</span>
              </p>
            </div>

          

          </div>
        </div>
      </div>
    </section>
  );
}