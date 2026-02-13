'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TeamItem {
  iconComponent: React.ComponentType<any>;
  title: string;
  description: string;
}

interface AboutStoryProps {
  team: TeamItem[];
}

export default function AboutStory({ team }: AboutStoryProps) {
  return (
    <section className="py-12 md:py-16 relative bg-white -mt-7">
      {/* Premium background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-50 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-50 to-transparent rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Stats Section */}
      
          {/* Our Story Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <Badge className="bg-gradient-to-r from-blue-800 to-blue-400  text-[#072348] border-0 px-5 py-2 shadow-sm mb-4">
                <span className="font-['Inter'] text-xs font-semibold tracking-[0.2em] text-white uppercase">Our Story</span>
              </Badge>
              
              <h2 className="font-['Poppins'] text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-3 tracking-tight leading-tight">
    <span className="text-[#004AAD]">Building</span>{' '}
    <span>Homes,</span>{' '}
    <span className="text-cyan-600">Creating</span>{' '}
    <span>Communities</span>
</h2>
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 via-[#004AAD] to-cyan-400 rounded-full mx-auto" />
            </div>

          <div className="space-y-2 mb-8 text-left md:text-center">
<p className="font-['Poppins'] text-[14px] md:text-[16px] text-slate-600 leading-relaxed font-medium tracking-wide">
    ROOMAC was founded with a simple yet powerful vision: to create living spaces that feel like home for professionals and students away from their families. We understand the challenges of finding quality accommodation that perfectly balances comfort, affordability, and community.
</p>
<p className="font-['Poppins'] text-[14px] md:text-[16px] text-slate-600 leading-relaxed font-medium tracking-wide">
    What started as a single property has grown into a thriving network across major cities. Today, ROOMAC operates 50+ premium properties, Our commitment to quality, transparent pricing, and resident satisfaction has made us a preferred choice for co-living.
</p>
</div>
          </div>

      {/* Mission, Vision, Approach Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 -mt-10">
  <div className="group relative">
    <div className="absolute -inset-0.5 bg-gradient-to-br from-[#004AAD]/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 blur transition duration-500" />
    <Card className="relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-500">
      <CardContent className="p-6 md:p-8">
        <div className="mb-4">
          <h3 className="font-poppins text-2xl font-semibold text-slate-900 mb-1 group-hover:text-[#004AAD] transition-colors duration-300">
            Our Mission
          </h3>
          <div className="w-8 h-px bg-slate-700 group-hover:w-16 transition-all duration-500" />
        </div>
        <p className="font-poppins text-slate-600 leading-relaxed text-sm">
          To provide premium, affordable co-living spaces that combine comfort, community, and convenience for young professionals and students.
        </p>
      </CardContent>
    </Card>
  </div>
  
  <div className="group relative">
    <div className="absolute -inset-0.5 bg-gradient-to-br from-slate-900/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 blur transition duration-500" />
    <Card className="relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-500">
      <CardContent className="p-6 md:p-8">
        <div className="mb-2">
          <h3 className="font-poppins text-2xl font-semibold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors duration-300">
            Our Vision
          </h3>
          <div className="w-8 h-px bg-slate-800 group-hover:w-16 transition-all duration-500" />
        </div>
        <p className="font-poppins text-slate-600 leading-relaxed text-sm">
          To become India's most trusted co-living brand, known for exceptional quality, transparent prices, and resident satisfaction.
        </p>
      </CardContent>
    </Card>
  </div>
  
  <div className="group relative">
    <div className="absolute -inset-0.5 bg-gradient-to-br from-[#004AAD]/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 blur transition duration-500" />
    <Card className="relative overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-500">
      <CardContent className="p-6 md:p-8">
        <div className="mb-4">
          <h3 className="font-poppins text-2xl font-semibold text-slate-900 mb-1 group-hover:text-[#004AAD] transition-colors duration-300">
            Our Approach
          </h3>
          <div className="w-8 h-px bg-slate-700 group-hover:w-16 transition-all duration-500" />
        </div>
        <p className="font-poppins text-slate-600 leading-relaxed text-sm">
          We leverage technology, maintain high standards, and listen to our residents to continuously improve and innovate our services.
        </p>
      </CardContent>
    </Card>
  </div>
</div>
        </div>
      </div>

      
    </section>
  );
}