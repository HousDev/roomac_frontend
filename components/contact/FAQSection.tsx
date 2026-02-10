'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FAQ } from './types';
import { useState, useCallback } from 'react';

interface FAQSectionProps {
  faqs: FAQ[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleFaqToggle = useCallback((index: number) => {
    setOpenFaqIndex(current => current === index ? null : index);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white">
  <div className="container mx-auto px-4">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-blue-100 text-[#004AAD] border-0 px-4 py-1.5 font-medium">
          FAQ
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Quick answers to common questions
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <Card 
            key={index} 
            className="border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
            onClick={() => handleFaqToggle(index)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-lg text-slate-900 leading-relaxed">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openFaqIndex === index ? (
                    <svg 
                      className="h-5 w-5 text-[#004AAD] transition-transform duration-200 rotate-180" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg 
                      className="h-5 w-5 text-[#004AAD] transition-transform duration-200" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaqIndex === index 
                    ? 'mt-4 opacity-100 max-h-96' 
                    : 'mt-0 opacity-0 max-h-0'
                }`}
              >
                <p className="text-slate-600 leading-relaxed pt-3 border-t border-slate-200">
                  {faq.answer}
                </p>
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