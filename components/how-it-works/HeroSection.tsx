'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { IconName } from './data';

interface HeroSectionProps {
  onBrowseProperties: () => void;
  onContactUs: () => void;
}

export default function HeroSection({ onBrowseProperties, onContactUs }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#9aa5b1] via-blue-100 to-white py-10">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge with animation */}
          <div className="mb-6 animate-in zoom-in duration-500 delay-200">
            <Badge className="bg-white backdrop-blur-md border-white/30 text-blue-800 hover:text-white px-6 py-2 text-sm transition-all duration-300 hover:scale-105">
              Simple & Transparent Process
            </Badge>
          </div>
          
          {/* Heading with animation */}
          <h1 className="text-3xl text-slate-900 md:text-6xl font-bold mb-6 leading-tight animate-in zoom-in duration-700 delay-400">
            How It Works
          </h1>
          
          {/* Paragraph with animation */}
          <p className="text-base md:text-2xl text-slate-700 mb-8 leading-relaxed max-w-3xl mx-auto animate-in zoom-in duration-700 delay-600">
            Your journey to comfortable living, simplified in 6 easy steps. From search to move-in, we make it seamless.
          </p>
          
          {/* Buttons with animation */}
          <div className="flex flex-wrap justify-center gap-4 animate-in zoom-in duration-700 delay-800">
            <Link href="/properties" onClick={onBrowseProperties}>
              <Button size="lg" className="bg-white text-[#004AAD] hover:bg-blue-800 hover:text-white shadow-xl hover:shadow-2xl text-lg px-8 transition-all duration-300 hover:scale-105">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Properties
              </Button>
            </Link>
            <Link href="/contact" onClick={onContactUs}>
              <Button size="lg" variant="outline" className="border-2 border-white text-blue-600 hover:bg-blue-800 hover:text-white hover:border-blue-800 text-lg px-8 transition-all duration-300 hover:scale-105">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}