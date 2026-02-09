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
    <section className="py-20 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-[#004AAD] border-0 px-4 py-1">
              Why Choose Us
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              The ROOMAC Advantage
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We go beyond just providing a room — we create a home where you can thrive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                <CardContent className="p-8">
                  <div className={`h-16 w-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconLoader name={feature.iconName} className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}