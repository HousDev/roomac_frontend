"use client"

// app/admin/tenants/page.tsx
import { useState, useEffect } from "react";
import TenantsClient from "@/components/admin/tenants/tenants-client";
import { listTenants, Tenant } from "@/lib/tenantApi";

const initialFilters = {
  search: undefined,
  page: undefined,
  pageSize: undefined,
  gender: undefined,
  occupation_category: undefined,
  is_active: undefined,
  portal_access_enabled: undefined,
  has_credentials: undefined,
  city: undefined,
  state: undefined,
  preferred_sharing: undefined
};

export default function TenantsPage() {
  const [initialData, setInitialData] = useState<Tenant[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    listTenants({})
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setInitialData(res.data);
        }
      })
      .catch((err) => console.error("Failed to load tenants:", err))
      .finally(() => setInitialLoading(false));
  }, []);

  if (initialLoading) return <TenantsLoading />;
  return (
    <TenantsClient
      initialData={initialData}
      initialLoading={false}
      initialFilters={initialFilters}
    />
  );
}

function TenantsLoading() {
  return (
    <div className="p-2">
      <div className="border-0 shadow-lg rounded-lg">
        <div className="sticky top-16 z-10 bg-blue-600 py-3 px-6">
          <div className="flex justify-between">
            <div className="animate-pulse bg-white/30 h-9 w-32 rounded" />
            <div className="flex gap-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse bg-white/30 h-9 w-24 rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse bg-white/30 h-96 rounded" />
        </div>
      </div>
    </div>
  );
}