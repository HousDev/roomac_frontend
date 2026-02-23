"use client";

import { Suspense } from "react";
import ProfileClient from "@/components/admin/admin-profile/ProfileClient";
import Loading from "@/components/admin/admin-profile/loading";
import Error from "@/components/admin/admin-profile/error";

export default function ProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileClient initialProfile={undefined} initialNotifications={{
        email_notifications: false,
        sms_notifications: false,
        whatsapp_notifications: false,
        payment_alerts: false,
        booking_alerts: false,
        maintenance_alerts: false
      }} />
    </Suspense>
  );
}