import VacateRequestsList from '@/components/admin/VacateRequestsList';

export default function VacateRequestsPage() {
  return <VacateRequestsList />;
}

export const dynamic = 'force-dynamic'; // Optional: if you want fresh data on every load