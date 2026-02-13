'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MessageSquare, LucideIcon } from 'lucide-react';
import { ContactMethod } from '@/components/contact/types';

// Import all icons you need
const iconComponents = {
  Phone,
  Mail,
  MessageSquare,
} as const;

// Type for icon names
type IconName = keyof typeof iconComponents;

interface ContactMethodsProps {
  methods: ContactMethod[];
}

export default function ContactMethods({ methods }: ContactMethodsProps) {

  // Function to get icon component safely
  const getIcon = (iconName: string): LucideIcon => {
    return iconComponents[iconName as IconName] || Phone;
  };

  return (
    <section className="py-5 -mt-16 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

          {methods.map((method, index) => {
            const IconComponent = getIcon(method.icon);
            const isExternalLink = method.link.startsWith("http");

            return (
              <a
                key={index}
                href={method.link}
                target={isExternalLink ? "_blank" : undefined}
                rel={isExternalLink ? "noopener noreferrer" : undefined}
                className="block group"
              >
                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl h-full overflow-hidden">
                  <CardContent className="p-6 flex items-center gap-4 relative">

                    {/* Icon Circle */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-[#004AAD] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-medium text-gray-600 mb-1">
                        {method.title}
                      </h3>

                      <p className="text-base font-bold text-[#004AAD] mb-0.5 transition-colors duration-300 group-hover:text-[#FDB913]">
                        {method.value}
                      </p>

                      <p className="text-xs text-gray-500">
                        {method.subtitle}
                      </p>
                    </div>

                  </CardContent>
                </Card>
              </a>
            );
          })}

        </div>
      </div>
    </section>
  );
}
