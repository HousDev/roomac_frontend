import { useState, useEffect } from 'react';
import HowItWorksClient from '@/components/how-it-works/HowItWorksClient';
import Loading from '@/components/how-it-works/loading';
import { getStaticData } from '@/components/how-it-works/data';

export default function HowItWorksPage() {
  const [initialData, setInitialData] = useState<Awaited<ReturnType<typeof getStaticData>> | null>(null);
  useEffect(() => {
    getStaticData().then(setInitialData);
  }, []);
  if (!initialData) return <Loading />;
  return <HowItWorksClient initialData={initialData as any} />;
}