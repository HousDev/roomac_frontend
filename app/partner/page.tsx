
import { useState, useEffect } from 'react';
import { PartnerPageClient } from '@/components/partner/PartnerPageClient';
import { LoadingSkeleton } from '@/components/partner/LoadingSkeleton';
import { getInitialData } from '@/components/partner/data';

export default function PartnerPage() {
  const [initialData, setInitialData] = useState<Awaited<ReturnType<typeof getInitialData>> | null>(null);
  useEffect(() => {
    getInitialData().then(setInitialData);
  }, []);
  if (!initialData) return <LoadingSkeleton />;
  return (
    <div className="flex-1">
      <PartnerPageClient initialData={initialData} />
    </div>
  );
}