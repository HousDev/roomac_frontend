'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function AboutCTA() {
  return (
    <section className="py-20 relative overflow-hidden bg-blue-900 text-white">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience ROOMAC?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join our growing community and discover what makes ROOMAC the preferred choice for quality co-living
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/properties">
              <Button size="lg" className="bg-white text-[#004AAD] hover:bg-white/90 shadow-xl text-lg px-8">
                <Home className="mr-2 h-5 w-5" />
                Explore Properties
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-blue-900 hover:bg-blue-200 text-lg px-8">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}