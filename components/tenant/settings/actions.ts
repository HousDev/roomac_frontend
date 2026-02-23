// "use server";

// import { cookies } from "@/src/compat/next-headers";
// import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
// import { tenantSettingsApi } from "@/lib/tenantSettingsApi";

// export async function getTenantData() {
//   try {
//     const cookieStore = cookies();
//     const token = cookieStore.get("tenant_token")?.value;
    
//     if (!token) {
//       return null;
//     }

//     // This is a simplified version
//     const result = await tenantDetailsApi.loadProfile();
//     return result.success ? result.data : null;
//   } catch (error) {
//     console.error("Error fetching tenant data:", error);
//     return null;
//   }
// }

// export async function getNotificationPreferences() {
//   try {
//     const cookieStore = cookies();
//     const token = cookieStore.get("tenant_token")?.value;
    
//     if (!token) {
//       return null;
//     }

//     const result = await tenantSettingsApi.getNotificationPreferences();
//     return result.success ? result.data : null;
//   } catch (error) {
//     console.error("Error fetching notification preferences:", error);
//     return null;
//   }
// }

// export async function updateNotificationPreferences(preferences: any) {
//   try {
//     const cookieStore = cookies();
//     const token = cookieStore.get("tenant_token")?.value;
    
//     if (!token) {
//       return { success: false, message: "Not authenticated" };
//     }

//     const result = await tenantSettingsApi.updateNotificationPreferences(preferences);
//     return result;
//   } catch (error) {
//     console.error("Error updating preferences:", error);
//     return { success: false, message: "Failed to update preferences" };
//   }
// }

// actions.ts
"use server";

import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getTenantData() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("tenant_token")?.value;
    
    if (!token) {
      console.log("No token found in cookies");
      return null;
    }

    console.log("Fetching tenant data from server with token...");
    
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
    console.log("Server fetch result:", data.success ? "Success" : "Failed");
    
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