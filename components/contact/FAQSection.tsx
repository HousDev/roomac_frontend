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
  <section className="py-10 bg-gradient-to-b from-slate-50 to-white">
  <div className="container mx-auto px-4">
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-block mb-2  px-3 py-1 text-xs font-semibold text-[#004AAD] bg-blue-100 rounded-full">
          FAQ
        </span>

        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          Frequently Asked Questions
        </h2>

        <p className="text-sm md:text-base text-slate-600">
          Quick answers to common questions.
        </p>
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openFaqIndex === index;

          return (
            <div
              key={index}
              onClick={() => handleFaqToggle(index)}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="px-4 py-4 md:px-5 md:py-4">

                {/* Question */}
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm md:text-base font-semibold text-slate-900">
                    {faq.question}
                  </h3>

                  {/* Plus / Minus */}
                  <div
                    className={`relative h-5 w-5 flex items-center justify-center transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <span className="absolute h-0.5 w-3 bg-[#004AAD]"></span>
                    <span
                      className={`absolute h-3 w-0.5 bg-[#004AAD] transition-opacity duration-200 ${
                        isOpen ? "opacity-0" : "opacity-100"
                      }`}
                    ></span>
                  </div>
                </div>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 mt-3"
                      : "grid-rows-[0fr] opacity-0 mt-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-200 pt-3">
                      {faq.answer}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  </div>
</section>

  );
}