


import { useState, useEffect } from 'react';
import AboutClient from '@/components/about/AboutClient';
import { aboutPageData } from '@/components/about/constants';

async function getAboutData() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return aboutPageData;
}

export default function AboutPage() {
  const [data, setData] = useState<typeof aboutPageData | null>(null);
  useEffect(() => {
    getAboutData().then(setData);
  }, []);
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }
  return <AboutClient data={data} />;
}