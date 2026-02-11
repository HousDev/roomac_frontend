'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IconName } from './data';

interface CTASectionProps {
  onBrowseProperties: () => void;
  onContactUs: () => void;
  // IconLoader: React.ComponentType<{ name: IconName } & React.SVGProps<SVGSVGElement>>;
  IconLoader: React.ForwardRefExoticComponent<
  { name: IconName } &
  React.SVGProps<SVGSVGElement> &
  React.RefAttributes<SVGSVGElement>
>;

}

export default function CTASection({ onBrowseProperties, onContactUs, IconLoader }: CTASectionProps) {
  return (
    <section className="py-10 relative overflow-hidden bg-blue-900 text-white">
  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
  <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl opacity-20" />
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />

  <div className="container mx-auto px-4 relative">
    <div className="max-w-4xl mx-auto text-center">
      
      {/* Desktop View (hidden on mobile) */}
      <div className="hidden md:block">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Find Your Perfect Room?
        </h2>
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          Join hundreds of happy residents who call ROOMAC home. Your perfect accommodation is just a few clicks away.
        </p>
      </div>
      
      {/* Mobile View (hidden on desktop) */}
      <div className="md:hidden">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Ready to Find Your Perfect Room?
        </h2>
        <p className="text-base sm:text-lg text-white/90 mb-6 leading-normal">
          Join hundreds of happy residents who call ROOMAC home. Your perfect accommodation is just a few clicks away.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/properties" onClick={onBrowseProperties}>
          <Button size="lg" className="bg-white text-[#004AAD] hover:bg-white/90 shadow-xl text-lg px-8">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explore Properties
          </Button>
        </Link>
        <Link href="/contact" onClick={onContactUs}>
          <Button size="lg" variant="outline" className="border-2 border-white text-blue-600 hover:bg-white/20 text-lg px-8">
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Talk to Us
          </Button>
        </Link>
      </div>
      
      {/* Mobile/Desktop responsive text */}
      <p className="mt-8 text-white/80 text-sm md:text-base ">
        Need help deciding? Our team is available 24/7 to assist you
      </p>
    </div>
  </div>
</section>
  );
}