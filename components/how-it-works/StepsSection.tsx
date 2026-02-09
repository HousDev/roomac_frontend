'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconName } from './data';

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
  // IconLoader: React.ComponentType<{ name: IconName } & React.SVGProps<SVGSVGElement>>;
  IconLoader: React.ForwardRefExoticComponent<
  { name: IconName } &
  React.SVGProps<SVGSVGElement> &
  React.RefAttributes<SVGSVGElement>
>;

}

export default function StepsSection({ steps, IconLoader }: StepsSectionProps) {
  return (
    <section className="py-20 -mt-10">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white text-blue-700 hover:text-white border-black/15 px-4 py-1">
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 opacity-0 animate-[reveal_1s_ease-out_0.5s_forwards]">
              <span className="inline-block animate-[slideUp_0.5s_ease-out_forwards] opacity-0" style={{animationDelay: '1s'}}>
                Your Journey to Comfortable Living
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From browsing to moving in, we've streamlined everything to make your experience smooth and hassle-free
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <Card key={index} className="border-0 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                    {/* Icon Side */}
                    <div className={`md:w-2/5 bg-gradient-to-br ${step.color} p-12 flex flex-col items-center justify-center text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

                      <div className="relative z-10 text-center">
                        <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-2xl mx-auto group-hover:scale-110 transition-transform duration-300">
                          <IconLoader name={step.iconName} className="h-12 w-12" />
                        </div>
                        <div className="text-7xl font-bold mb-3 opacity-90">{step.number}</div>
                        <div className="h-1 w-20 bg-white/50 mx-auto rounded-full" />
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="md:w-3/5 p-8 md:p-12 bg-white">
                      <h3 className="text-3xl font-bold text-slate-900 mb-4">{step.title}</h3>
                      <p className="text-lg text-slate-600 leading-relaxed mb-6">
                        {step.description}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {step.features.map((feature, i) => (
                          <div key={i} className={`flex items-center gap-3 ${step.bgColor} p-3 rounded-lg`}>
                            <div className="h-2 w-2 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}