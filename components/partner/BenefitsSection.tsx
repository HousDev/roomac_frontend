import { forwardRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Shield, Building2 } from 'lucide-react';
import type { Benefit, ColorSet } from './types';

interface BenefitsSectionProps {
  id: string;
  visible: boolean;
  benefits: Benefit[];
}

const iconMap = {
  TrendingUp: TrendingUp,
  Users: Users,
  Shield: Shield,
  Building2: Building2,
};



export const BenefitsSection = forwardRef<HTMLElement, BenefitsSectionProps>(
  ({ id, visible, benefits }, ref) => {
    const delayClasses = useMemo(() => [
      'delay-0',
      'delay-100',
      'delay-200',
      'delay-300'
    ], []);

    return (
      <section
        ref={ref}
        id={id}
        className={`py-10 bg-white transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          
          {/* ================= CENTER HEADING ================= */}
       <div className="text-center mb-10 ">
  <h2 className="font-['Poppins'] text-3xl sm:text-4xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
  Why Partner with <span className="text-[#004AAD]">Us?</span>
</h2>
  <p className="font-['Poppins'] text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
    We combine strong business networks with meaningful benefits to <span className="font-semibold text-gray-800">accelerate your growth</span> and maximize opportunities.
  </p>
</div>
          {/* ================= TOP SECTION - BENEFITS CARDS ================= */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20 max-w-5xl mx-auto">
  {benefits.map((benefit, index) => {
    const IconComponent = iconMap[benefit.icon as keyof typeof iconMap];
    const delayClass = delayClasses[index % delayClasses.length];
    
    return (
      <div
        key={index}
        className={`transition-all duration-700 ${delayClass} ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <Card className="relative overflow-hidden border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-500 group h-full max-w-md">
          {/* Accent line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-700 to-blue-500"></div>
          
          <CardContent className="p-6 bg-white">
            {/* Icon container */}
            <div className="mb-4 relative">
              <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-500">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              {/* Decorative element */}
              <div className="absolute -top-1 -right-1 w-14 h-14 bg-blue-50 rounded-full opacity-40 group-hover:scale-110 transition-all duration-500 -z-10"></div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">
              {benefit.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {benefit.description}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  })}
</div>
          {/* ================= BOTTOM SECTION - NETWORK OVERLAP DESIGN ================= */}
       <div className="flex justify-center items-center py-2 -mt-8">
  {/* Desktop View - Original (UNCHANGED) */}
  <div className="hidden md:flex relative w-[800px] h-[800px] justify-center items-center">
    
    {/* CENTER CIRCLE */}
    <div className="absolute w-[400px] h-[400px] flex items-center justify-center z-[5]">
      <div className="absolute w-[300px] h-[300px] rounded-full border-[5px] border-white"></div>
      <div className="relative w-[260px] h-[260px] rounded-full border-[5px] border-[#5b9ce8] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-[#4a90e2] tracking-wide">
            PG BUSINESS
          </div>
          <div className="text-2xl font-bold text-[#2563eb] mt-1">
            NETWORK
          </div>
          <div className="mt-4 flex justify-center">
            <div className="w-[60px] h-[60px] flex items-center justify-center bg-white">
              <Building2
                className="w-8 h-8 text-[#4a90e2]"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* IMAGE NODES */}
    {[
      { top: 'top-20', left: 'left-20', src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop' },
      { top: 'top-20', right: 'right-20', src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop' },
      { bottom: 'bottom-20', left: 'left-20', src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop' },
      { bottom: 'bottom-20', right: 'right-14', src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop' },
    ].map((img, idx) => (
      <div
        key={idx}
        className={`absolute ${img.top || ''} ${img.bottom || ''} ${img.left || ''} ${img.right || ''} w-[300px] h-[300px] rounded-full border-[6px] border-[#5b9ce8] overflow-hidden bg-white transition-transform duration-300 hover:scale-110 hover:shadow-xl`}
      >
        <img src={img.src} alt={`Network ${idx}`} className="w-full h-full object-cover" />
      </div>
    ))}
  </div>

  {/* Mobile View - Exact same layout, just scaled */}
  <div className="md:hidden relative w-[372px] h-[300px] flex items-center justify-center -mt-10">
    
    {/* CENTER CIRCLE */}
    <div className="absolute w-[175px] h-[175px] flex items-center justify-center z-[5]">
      <div className="absolute w-[130px] h-[130px] rounded-full border-[3px] border-white"></div>
      <div className="relative w-[115px] h-[115px] rounded-full border-[3px] border-[#5b9ce8] bg-white flex items-center justify-center">
        <div className="text-center px-1">
          <div className="text-[9px] font-semibold text-[#4a90e2] tracking-wide">
            PG BUSINESS
          </div>
          <div className="text-xs font-bold text-[#2563eb] mt-0.5">
            NETWORK
          </div>
          <div className="mt-1.5 flex justify-center">
            <div className="w-[26px] h-[26px] flex items-center justify-center bg-white">
              <Building2
                className="w-3.5 h-3.5 text-[#4a90e2]"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* IMAGE NODES - Same positions, scaled */}
    {[
      { top: 'top-[10px]', left: 'left-[35px]', src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop' },
      { top: 'top-[10px]', right: 'right-[45px]', src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop' },
      { bottom: 'bottom-[10px]', left: 'left-[35px]', src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop' },
      { bottom: 'bottom-[10px]', right: 'right-[45px]', src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop' },
    ].map((img, idx) => (
      <div
        key={idx}
        className={`absolute ${img.top || ''} ${img.bottom || ''} ${img.left || ''} ${img.right || ''} w-[131px] h-[131px] rounded-full border-[3px] border-[#5b9ce8] overflow-hidden bg-white transition-transform duration-300 hover:scale-110 hover:shadow-xl active:scale-105`}
      >
        <img src={img.src} alt={`Network ${idx}`} className="w-full h-full object-cover" />
      </div>
    ))}
  </div>
</div>
        </div>
      </section>
    );
  }
);

BenefitsSection.displayName = 'BenefitsSection';
