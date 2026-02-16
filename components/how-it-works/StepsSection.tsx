'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconName } from './data';
import { Check } from 'lucide-react';

interface StepData {
  number: string;
  iconName: IconName;
  title: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
}

interface StepsSectionProps {
  steps: StepData[];
  IconLoader: React.ForwardRefExoticComponent<
    { name: IconName } &
    React.SVGProps<SVGSVGElement> &
    React.RefAttributes<SVGSVGElement>
  >;
}

export default function StepsSection({ steps, IconLoader }: StepsSectionProps) {

  const getStepImage = (title: string) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('browse') || lowerTitle.includes('search')) {
      return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop";
    }

    if (lowerTitle.includes('visit') || lowerTitle.includes('tour')) {
      return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop";
    }

    if (lowerTitle.includes('book') || lowerTitle.includes('confirm')) {
      return "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&auto=format&fit=crop";
    }

    if (lowerTitle.includes('move') || lowerTitle.includes('shift')) {
      return "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200&auto=format&fit=crop";
    }

    return "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200&auto=format&fit=crop";
  };

  return (
    <section className="py-10 -mt-10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-10">
            <Badge className="mb-3 bg-white text-blue-700 hover:text-white border-black/15 px-4 py-1 text-sm md:text-base">
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-poppins lg:text-5xl font-bold text-slate-900 mb-4">
              Your Journey to <span className='text-blue-700'>Comfortable</span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-4 md:px-0">
              From browsing to moving in, we've streamlined everything to make your experience smooth and hassle-free
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => {

              const bgImage = getStepImage(step.title);

              return (
                <Card key={index} className="border-0 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 group">
                  <CardContent className="p-0">

                    {/* ================= MOBILE VIEW ================= */}
                    <div className="block md:hidden">
                      <div
                        className="p-8 flex flex-col items-center justify-center text-white relative overflow-hidden bg-cover bg-center"
                        style={{ backgroundImage: `url(${bgImage})` }}
                      >
                        <div className="absolute inset-0 bg-black/55" />

                        <div className="relative z-10 text-center">
                          <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-4 shadow-2xl mx-auto group-hover:scale-110 transition-transform duration-300">
                            <IconLoader name={step.iconName} className="h-8 w-8" />
                          </div>
                          <div className="text-4xl font-bold mb-2 opacity-95">{step.number}</div>
                          <div className="h-1 w-16 bg-white/60 mx-auto rounded-full mb-4" />
                          <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                        </div>
                      </div>

                      <div className="p-6 bg-white">
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                          {step.description}
                        </p>

                        {/* ✅ FIRST IMAGE STYLE CHECK POINTS */}
                        <div className="space-y-3">
                          {step.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <Check className="h-5 w-5 text-amber-500 flex-shrink-0" />
                              <span className="text-sm font-medium text-slate-700">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>

                    {/* ================= DESKTOP VIEW ================= */}
                    <div className={`hidden md:flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>

                      {/* Image Side */}
                      <div
                        className="md:w-2/5 p-6 md:p-12 flex flex-col items-center justify-center text-white relative overflow-hidden bg-cover bg-center"
                        style={{ backgroundImage: `url(${bgImage})` }}
                      >
                        <div className="absolute inset-0 bg-black/55" />

                        <div className="relative z-10 text-center">
                          <div className="h-16 w-16 md:h-24 md:w-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-4 md:mb-6 shadow-2xl mx-auto group-hover:scale-110 transition-transform duration-300">
                            <IconLoader name={step.iconName} className="h-8 w-8 md:h-12 md:w-12" />
                          </div>
                          <div className="text-5xl md:text-7xl font-bold mb-2 md:mb-3 opacity-95">{step.number}</div>
                          <div className="h-1 w-16 md:w-20 bg-white/60 mx-auto rounded-full" />
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className="md:w-3/5 p-6 md:p-12 bg-white">
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 md:mb-4">
                          {step.title}
                        </h3>
                        <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-4 md:mb-6">
                          {step.description}
                        </p>

                        {/* ✅ FIRST IMAGE STYLE CHECK POINTS */}
                        <div className="space-y-4">
                          {step.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <Check className="h-5 w-5 text-blue-700 flex-shrink-0" />
                              <span className="text-base font-medium text-slate-700">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                      </div>

                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
