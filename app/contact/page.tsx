

import { useState, useEffect } from 'react';
import ContactClient from '@/components/contact/client';
import ContactLoading from '@/components/contact/loading';
import { ContactPageData } from '@/components/contact/types';

// Server-side data fetching function
async function getContactData(): Promise<ContactPageData> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // In a real app, this would fetch from an API
  return {
    contactMethods: [
      {
        icon: 'Phone', // ✅ Changed to string
        title: "Call Us",
        subtitle: "Mon-Sat, 9 AM - 7 PM",
        value: "+91 99239 53933",
        link: "tel:+919923953933",
        color: "from-yellow-500 to-yellow-500"
      },
      {
        icon: 'Mail', // ✅ Changed to string
        title: "Email Us",
        subtitle: "24/7 Support",
        value: "stay@roomac.com",
        link: "mailto:stay@roomac.com",
        color: "from-green-500 to-emerald-500"
      },
      {
        icon: 'MessageSquare', // ✅ Changed to string
        title: "WhatsApp",
        subtitle: "Instant Response",
        value: "+91 99239 53933",
        link: "https://wa.me/919876543210?text=Hi%20ROOMAC,%20I%20need%20assistance",
        color: "from-purple-500 to-pink-500"
      }
    ],
    officeLocations: [
      {
        city: "Pune",
        address: "Near Indira College, Wakad, Pune, Maharashtra 411057",
        phone: "+91 9923953933",
        email: "stay@roomac.com"
      },
     
    ],
    faqs: [
      {
        question: "How quickly will I get a response?",
        answer: "We respond to all inquiries within 2-4 hours during business hours, and within 24 hours otherwise."
      },
      {
        question: "Can I schedule a property visit?",
        answer: "Yes! Fill out the form mentioning your preferred property and time, and we'll arrange a visit for you."
      },
      {
        question: "Do you offer virtual tours?",
        answer: "Absolutely! We provide video call tours for all our properties if you can't visit in person."
      }
    ]
  };
}

export default function ContactPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getContactData>> | null>(null);
  useEffect(() => {
    getContactData().then(setData);
  }, []);
  if (!data) return <ContactLoading />;
  return <ContactClient data={data} />;
}

// Generate metadata for SEO
export const metadata = {
  title: 'Contact Us | ROOMAC',
  description: 'Get in touch with ROOMAC for property inquiries, support, and accommodation assistance.',
  keywords: ['contact', 'support', 'property inquiry', 'accommodation', 'ROOMAC'],
};