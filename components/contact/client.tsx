'use client';

import { Suspense } from 'react';
import ContactHeader from './ContactHeader';
import ContactMethods from './ContactMethods';
import ContactForm from './ContactForm';
import OfficeInfo from './OfficeInfo';
import FAQSection from './FAQSection';
import { ContactPageData } from './types';

interface ContactClientProps {
  data: ContactPageData;
}

export default function ContactClient({ data }: ContactClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
      <Suspense fallback={<div>Loading...</div>}>
        <ContactHeader />
      </Suspense>

      <Suspense fallback={<div>Loading contact methods...</div>}>
        <ContactMethods methods={data.contactMethods} />
      </Suspense>

      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Suspense fallback={<div>Loading form...</div>}>
                <ContactForm />
              </Suspense>
            </div>
            
            <Suspense fallback={<div>Loading office info...</div>}>
              <OfficeInfo locations={data.officeLocations} />
            </Suspense>
          </div>
        </div>
      </section>

      <Suspense fallback={<div>Loading FAQs...</div>}>
        <FAQSection faqs={data.faqs} />
      </Suspense>
    </div>
  );
}