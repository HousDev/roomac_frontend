'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Home, Eye, Users, Shield } from 'lucide-react';

// ✅ IMPORT YOUR IMAGES
import studentsImg from "@/app/src/assets/images/students.jpg";
import corporateImg from '@/app/src/assets/images/pexels-mikhail copy.jpg';
import professionalsImg from '@/app/src/assets/images/professionals.jpg';
import cottonbroImg from '@/app/src/assets/images/corporate copy.jpg';

interface ValueItem {
  iconComponent: React.ComponentType<any>;
  title: string;
  description: string;
  image: any;
}

export default function AboutValues() {

  const values: ValueItem[] = [
    {
      iconComponent: Home,
      title: "Comfort First",
      description:
        "We prioritize your comfort in every design decision, creating spaces that feel as good as they look.",
      image: studentsImg,
    },
    {
      iconComponent: Eye,
      title: "Transparent & Fair",
      description:
        "Clear communication, honest pricing, and no hidden surprises. What you see is what you get.",
      image: corporateImg,
    },
    {
      iconComponent: Users,
      title: "Community Focused",
      description:
        "Building spaces that bring people together and strengthen the fabric of our communities.",
      image: cottonbroImg,
    },
    {
      iconComponent: Shield,
      title: "Quality Assurance",
      description:
        "Rigorous quality checks and premium materials ensure lasting beauty and functionality.",
      image: professionalsImg,
    },
  ];

  return (
    <section className="pb-16 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="container mx-auto px-4 max-w-7xl">

      <div className="text-center mb-10">
  
 <h2 className="font-['Poppins'] text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mt-4 tracking-tight leading-tight">
    <span className="inline-block opacity-0 animate-[letterWave_0.6s_ease-out_0.5s_forwards] text-black">What</span>{' '}
    <span className="inline-block opacity-0 animate-[letterWave_0.6s_ease-out_0.8s_forwards] text-cyan-600">Drives</span>{' '}
    <span className="inline-block opacity-0 animate-[letterWave_0.6s_ease-out_1.1s_forwards] text-[#004AAD]">Us</span>
</h2>

  <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto">
    The principles that guide everything we do
  </p>
</div>

        {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5 md:gap-6 lg:gap-8 -mt-6">
  {values.map((value, index) => {
    const Icon = value.iconComponent;
    const number = String(index + 1).padStart(2, "0");
    
    // Alternating pattern: 01 and 03 at top, 02 and 04 at bottom
    const isTopAligned = index % 2 === 0;

    return (
      <div 
        key={index} 
        className={`group relative ${
          isTopAligned 
            ? 'mt-0' 
            : 'mt-0 sm:mt-12 md:mt-16 lg:mt-20'
        }`}
      >
        {/* Vertical line on left side of card - Hidden on mobile */}
        {index > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-px bg-blue-800/30 -translate-x-4 hidden lg:block"></div>
        )}

        {/* Desktop Layout (sm and above) */}
        <div className="hidden sm:block">
          {/* Number positioned above card */}
          <span className="text-4xl md:text-5xl lg:text-6xl font-serif text-blue-900/50 mb-2 md:mb-3 lg:mb-4 block">
            {number}
          </span>

          <Card className="overflow-hidden shadow-md group-hover:shadow-xl transition duration-500 group-hover:-translate-y-1 sm:group-hover:-translate-y-2">
            <div className="relative aspect-[4/5] md:aspect-[3/4]">
              <Image
                src={value.image}
                alt={value.title}
                fill
                className="object-cover group-hover:scale-105 transition duration-700"
              />

              {/* Overlay gradient for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Text overlay on image */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 lg:p-6 text-white flex flex-col justify-end h-full">
                {/* Horizontal line above title */}
                <div className="w-8 sm:w-10 md:w-12 h-0.5 bg-white mb-1 sm:mb-1.5 md:mb-2 lg:mb-3"></div>
                
                {/* Title */}
                <h3 className="text-base sm:text-lg md:text-xl font-serif mb-0.5 sm:mb-1 md:mb-1.5 lg:mb-2">
                  {value.title}
                </h3>
                
                {/* Description */}
                <p className="text-xs sm:text-xs md:text-sm text-white/90 leading-relaxed line-clamp-2 sm:line-clamp-3 md:line-clamp-4">
                  {value.description}
                </p>
              </div>

              {/* Icon overlay on hover */}
              <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-white rounded-lg sm:rounded-xl p-1.5 sm:p-2 md:p-3 shadow-lg opacity-0 group-hover:opacity-100 transition duration-500">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Mobile Layout (below sm) - Number on image */}
       {/* Mobile Layout (below sm) - Number on image */}
<div className="block sm:hidden">
  <Card className="overflow-hidden shadow-md">
    <div className="relative aspect-[4/3]">
      <Image
        src={value.image}
        alt={value.title}
        fill
        className="object-cover"
      />

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Text overlay - UPAR KAR DIYA */}
      <div className="absolute bottom-8 left-0 right-0 p-3 text-white">
        {/* Horizontal line */}
        <div className="w-8 h-0.5 bg-white mb-1.5"></div>
        
        {/* Title */}
        <h3 className="text-base font-serif mb-1">
          {value.title}
        </h3>
        
        {/* Description */}
        <p className="text-xs text-white/90 leading-relaxed line-clamp-2">
          {value.description}
        </p>
      </div>

      {/* Icon */}
      <div className="absolute top-2 right-2 bg-white rounded-lg p-1.5 shadow-lg">
        <Icon className="w-4 h-4 text-blue-700" />
      </div>
    </div>
  </Card>
</div>
      </div>
    );
  })}
</div>

      </div>
    </section>
  );
}