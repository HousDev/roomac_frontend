 "use client";
// app/admin/staff/page.tsx (Server Component)
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import StaffClientPage from '@/components/admin/staff/StaffClientPage';
import { getAllStaff, StaffMember } from '@/lib/staffApi';

export default function StaffPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const role = searchParams.get('role') ?? '';
  const [initialStaff, setInitialStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllStaff()
      .then(setInitialStaff)
      .catch((err) => console.error('Error fetching initial staff:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  return (
    <StaffClientPage 
      initialStaff={initialStaff}
      searchParams={{ search, role }}
    />
  );
}