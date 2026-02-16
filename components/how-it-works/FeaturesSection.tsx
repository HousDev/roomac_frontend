'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconName } from './data';

interface FeatureData {
  iconName: IconName;
  title: string;
  description: string;
  color: string;
}

interface FeaturesSectionProps {
  features: FeatureData[];
  // IconLoader: React.ComponentType<{ name: IconName } & React.SVGProps<SVGSVGElement>>;
  IconLoader: React.ForwardRefExoticComponent<
  { name: IconName } &
  React.SVGProps<SVGSVGElement> &
  React.RefAttributes<SVGSVGElement>
>;

}

export default function FeaturesSection({ features, IconLoader }: FeaturesSectionProps) {
  return (
   <section className="py-8 md:py-10 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white">
  <div className="container mx-auto px-4 md:px-6">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-4 md:mb-10">
        <Badge className="mb-3 md:mb-4 bg-blue-100 text-[#004AAD] border-0 px-4 py-1 text-sm md:text-base">
          Why Choose Us
        </Badge>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 md:mb-4">
          The Roomac <span className='text-blue-700'>Advantage</span> 
        </h2>
        <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          We go beyond just providing a room — we create a home where you can thrive
        </p>
      </div>

    <div className="max-w-5xl mx-auto  px-4">
  <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-3 sm:gap-6">

    {features.slice(0, 9).map((feature, index) => (
      <div
        key={index}
        className="group bg-white rounded-xl p-4 sm:p-5
                   shadow-sm hover:shadow-md 
                   transition-all duration-300 
                   border border-slate-100"
      >
        {/* Icon */}
        <div className="flex justify-center sm:justify-start">
          <div className="h-9 w-9 sm:h-10 sm:w-10  
                          flex items-center justify-center 
                          rounded-lg bg-slate-100 mb-2 sm:mb-4
                          group-hover:bg-slate-900 transition-all duration-300">
            <IconLoader
              name={feature.iconName}
              className="h-4 w-4 sm:h-5 sm:w-5 
                         text-slate-700 group-hover:text-white transition"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1 sm:mb-2 text-center sm:text-left">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 text-center sm:text-left">
          {feature.description}
        </p>
      </div>
    ))}

  </div>
</div>

    </div>
  </div>
</section>
  );
}