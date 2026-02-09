import { Suspense, useEffect, useState } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getTenantProfile } from '@/lib/tenantAuthApi';
import TenantProfileClientPage from '@/components/tenant/profile/TenantProfileClientPage';

export const metadata: Metadata = {
  title: 'My Profile - Tenant Portal',
  description: 'View and manage your tenant profile',
};

export default function TenantProfilePage() {
  const [initialProfile, setInitialProfile] = useState<{ success: boolean; data: unknown } | null>(null);
  useEffect(() => {
    getTenantProfile().then(setInitialProfile);
  }, []);
  if (!initialProfile)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <TenantProfileSkeleton />
      </div>
    );
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Suspense fallback={<TenantProfileSkeleton />}>
        <TenantProfileClientPage
          initialProfile={initialProfile.success ? initialProfile.data : null}
        />
      </Suspense>
    </div>
  );
}

function TenantProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header Skeleton */}
      <div className="mb-6 md:mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <Skeleton className="h-32 w-32 mx-auto rounded-full mb-4" />
                <Skeleton className="h-7 w-48 mx-auto mb-2" />
                <div className="flex gap-2 justify-center">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full mt-6" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Skeleton */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="grid md:grid-cols-2 gap-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    {i < 3 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
