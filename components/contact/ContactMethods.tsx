'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MessageSquare, LucideIcon } from 'lucide-react';
import { ContactMethod } from '@/components/contact/types';
import { useState } from 'react';

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
  // Function to get icon component
  const getIcon = (iconName: string): LucideIcon => {
    // Type assertion - make sure the iconName matches our IconName type
    return iconComponents[iconName as IconName] || Phone;
  };

  return (
   <section className="py-5 -mt-16 relative z-10">
  <div className="container mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {methods.map((method, index) => {
        const IconComponent = getIcon(method.icon);

        return (
          <a
            key={index}
            href={method.link}
            target={method.link.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="border-0 bg-[#f3f7ff] shadow-md rounded-2xl h-full">
              <CardContent className="p-8 text-center relative">

                {/* Yellow vertical line – rounded till card curve */}
                <span className="absolute left-0 top-6 bottom-3 w-[5px] bg-yellow-400 rounded-r-full" />

                {/* ICON */}
                <div className="flex justify-center mb-4">
                  <IconComponent className="h-10 w-10 text-yellow-500" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-[#004AAD] mb-2">
                  {method.title}
                </h3>

                {/* Value */}
                <p className="text-sm font-semibold text-[#004AAD] mb-1">
                  {method.value}
                </p>

                {/* Subtitle */}
                <p className="text-sm text-gray-500">
                  {method.subtitle}
                </p>

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