

// app/admin/enquiries/page.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EnquiriesClientPage from '@/components/admin/enquiries/EnquiriesClientPage';
import { Enquiry, getEnquiries, getEnquiryStats } from '@/lib/enquiryApi';

export default function EnquiriesPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const search = searchParams.get('search') ?? '';
  const [initialEnquiries, setInitialEnquiries] = useState<Enquiry[]>([]);
  const [initialStats, setInitialStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEnquiries({ status, search }),
      getEnquiryStats()
    ])
      .then(([enquiriesRes, statsRes]) => {
        if (enquiriesRes.success) setInitialEnquiries(enquiriesRes.results);
        if (statsRes.success) setInitialStats(statsRes.data);
      })
      .catch((err) => console.error('Error fetching initial data:', err))
      .finally(() => setLoading(false));
  }, [status, search]);

  if (loading) return <div className="p-4">Loading...</div>;
  return (
    <EnquiriesClientPage 
      initialEnquiries={initialEnquiries}
      initialStats={initialStats}
      searchParams={{ status, search }}
    />
  );
}