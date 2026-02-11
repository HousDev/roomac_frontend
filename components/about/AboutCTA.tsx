'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function AboutCTA() {
  return (
    <section className="py-18 relative overflow-hidden text-blue-900 bg-white">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96  rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96  rounded-full blur-3xl opacity-20" />

   <div className="container mx-auto px-4 relative">
  <div className="max-w-4xl mx-auto text-center">
    {/* Responsive heading with breakpoints */}
    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
      Ready to Experience ROOMAC?
    </h2>
    
    {/* Responsive paragraph with adjusted line-height for mobile */}
    <p className="text-base sm:text-lg md:text-xl text-blue-900 mb-6 md:mb-8 leading-normal sm:leading-relaxed px-2 sm:px-0">
      Join our growing community and discover what makes ROOMAC the preferred choice for quality co-living
    </p>
    
    {/* Responsive button container */}
    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-2 sm:px-0">
      <Link href="/properties" className="w-full sm:w-auto">
        <Button 
          size="lg" 
          className="bg-blue-800 text-white hover:bg-cyan-600 shadow-xl text-base sm:text-lg w-full sm:w-auto px-4 sm:px-8"
        >
          <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Explore Properties
        </Button>
      </Link>
      
      <Link href="/contact" className="w-full sm:w-auto">
        <Button 
          size="lg" 
          variant="outline" 
          className="border-2 border-blue-500 text-blue-900 hover:bg-blue-800 text-base sm:text-lg hover:text-white w-full sm:w-auto px-4 sm:px-8 mb-2 sm:mb-4"
        >
          Get in Touch
        </Button>
      </Link>
    </div>
  </div>
</div>
    </section>
  );
}