
// app/tenant/requests/page.tsx
import { Suspense } from 'react';
import TenantRequestsClient from '@/components/tenant/tenant-requests/TenantRequestsClient';
import Loading from '@/components/tenant/tenant-requests/loading';

// This is now a client-only page - server component just wraps it
export default function TenantRequestsPage() {
  return (
    <Suspense fallback={<Loading />}>
      {/* <TenantRequestsClient initialData ={{
        requests: [],
        isAuthenticated: false,
        error: null
      }} /> */}
      <TenantRequestsClient />
    </Suspense>
  );
}