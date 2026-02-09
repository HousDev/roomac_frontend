// components/tenant/portal/actions.ts (Updated)
'use server';

import { cookies } from '@/src/compat/next-headers';
import { redirect } from '@/src/compat/next-navigation';

export async function getTenantData() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('tenant_token')?.value;
    const tenantId = cookieStore.get('tenant_id')?.value;
    
    if (!token || !tenantId) {
      // Instead of redirecting, return null or error state
      return { error: 'NOT_AUTHENTICATED' };
    }

    // Return the data
    return {
      tenant: {
        id: tenantId,
        full_name: "John Doe",
        email: cookieStore.get('tenant_email')?.value || "john.doe@example.com",
        phone: "+91 9876543210",
        portal_access_enabled: true,
      },
      booking: {
        id: "BOOK001",
        properties: { name: "ROOMAC PG" },
        rooms: { room_number: "302" },
        check_in_date: "2023-12-01",
        lock_in_end_date: "2024-06-01",
        property_id: "PROP001",
        room_id: "ROOM302",
      },
      payments: [
        { id: 1, payment_for: "Rent - January 2024", amount: 15000, payment_date: "2024-01-01", payment_status: "completed" },
        { id: 2, payment_for: "Maintenance - January 2024", amount: 1500, payment_date: "2024-01-05", payment_status: "completed" },
        { id: 3, payment_for: "Rent - February 2024", amount: 15000, payment_date: "2024-02-01", payment_status: "pending" },
        { id: 4, payment_for: "Electricity Bill - January", amount: 1200, payment_date: "2024-01-15", payment_status: "completed" },
        { id: 5, payment_for: "Security Deposit", amount: 30000, payment_date: "2023-12-01", payment_status: "completed" },
      ],
      complaints: [
        { id: 1, title: "AC Not Working", description: "AC in bedroom is not cooling properly", category: "maintenance", priority: "high", status: "in_progress", created_at: "2024-01-20", resolution_notes: "Technician scheduled for tomorrow" },
        { id: 2, title: "Water Leakage", description: "Water leaking from bathroom ceiling", category: "plumbing", priority: "urgent", status: "resolved", created_at: "2024-01-15", resolution_notes: "Fixed by plumber on Jan 16" },
        { id: 3, title: "WiFi Issue", description: "Internet speed very slow in evening", category: "internet", priority: "medium", status: "open", created_at: "2024-01-25", resolution_notes: null },
      ],
      stats: {
        totalPayments: 8,
        pendingPayments: 2,
        openComplaints: 1,
        unreadNotifications: 3,
        daysUntilRentDue: 7,
        rentAmount: 15000,
        occupancyDays: 45,
        depositAmount: 30000,
        nextDueDate: "2024-02-05",
        maintenanceScore: 8.5,
        cleanlinessScore: 9.0,
        communityScore: 8.7,
      },
      notifications: [],
      leaveRequests: [],
    };
  } catch (error) {
    console.error('Error fetching tenant data:', error);
    return { error: 'SERVER_ERROR' };
  }
}