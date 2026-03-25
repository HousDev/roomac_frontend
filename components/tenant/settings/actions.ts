

// actions.ts
"use server";

import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getTenantData() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("tenant_token")?.value;
    
    if (!token) {
      return null;
    }

    
    const response = await fetch(`${API_BASE_URL}/api/tenant-details/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to fetch tenant data:', response.status);
      return null;
    }

    const data = await response.json();
    
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching tenant data:", error);
    return null;
  }
}

export async function getNotificationPreferences() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("tenant_token")?.value;
    
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/tenant-settings/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return null;
  }
}