
import { useState, useEffect } from "react";
// import TenantHeader from "@/components/layout/tenantHeader";
import SettingsClient from "@/components/tenant/settings/SettingsClient";
import { getTenantData, getNotificationPreferences } from "@/components/tenant/settings/actions";

export default function SettingsPage() {
  const [tenantData, setTenantData] = useState<Awaited<ReturnType<typeof getTenantData>> | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<Awaited<ReturnType<typeof getNotificationPreferences>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getTenantData(), getNotificationPreferences()]).then(([t, n]) => {
      setTenantData(t.status === "fulfilled" ? t.value : null);
      setNotificationPrefs(n.status === "fulfilled" ? n.value : null);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div>
        {/* <TenantHeader /> */}
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* <TenantHeader /> */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-9xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your account preferences and security</p>
          </div>
          
          <SettingsClient 
              initialTenant={tenantData}
              initialNotifications={notificationPrefs}
            />
        </div>
      </div>
    </div>
  );
}