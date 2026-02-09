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
    <section className="py-12 -mt-16 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {methods.map((method, index) => {
            // Get the icon component
            const IconComponent = getIcon(method.icon);
            
            return (
              <a 
                key={index} 
                href={method.link} 
                target={method.link.startsWith('http') ? '_blank' : undefined} 
                rel="noopener noreferrer"
                className="block group"
              >
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer h-full hover:-translate-y-2">
                  <CardContent className="p-6 text-center relative">
                    {/* Icon container with hover effect */}
                    <div 
                      className={`h-16 w-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 shadow-lg relative overflow-hidden group-hover:scale-110`}
                    >
                      {/* Main icon */}
                      <IconComponent className="h-8 w-8 text-white relative z-10" />
                      
                      {/* Action symbol overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* Call icon pe call symbol */}
                        {method.title.toLowerCase().includes('call') && (
                          <div className="bg-white rounded-full p-1.5 shadow-lg">
                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* WhatsApp pe message symbol */}
                        {method.title.toLowerCase().includes('whatsapp') && (
                          <div className="bg-white rounded-full p-1.5 shadow-lg">
                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Email pe mail symbol */}
                        {method.title.toLowerCase().includes('email') && (
                          <div className="bg-white rounded-full p-1.5 shadow-lg">
                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Others pe arrow symbol */}
                        {!method.title.toLowerCase().includes('call') && 
                         !method.title.toLowerCase().includes('whatsapp') && 
                         !method.title.toLowerCase().includes('email') && (
                          <div className="bg-white rounded-full p-1.5 shadow-lg">
                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-[#004AAD] transition-colors duration-300">
                      {method.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2">{method.subtitle}</p>
                    <p className="text-sm font-semibold text-[#004AAD] group-hover:scale-105 transition-transform duration-300 inline-block">
                      {method.value}
                    </p>
                    
                    {/* Bottom line effect */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-yellow-500 rounded-full group-hover:w-3/4 transition-all duration-500" />
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