"use server";

import { cookies } from "@/src/compat/next-headers";
import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
import { tenantSettingsApi } from "@/lib/tenantSettingsApi";

export async function getTenantData() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("tenant_token")?.value;
    
    if (!token) {
      return null;
    }

    // This is a simplified version
    const result = await tenantDetailsApi.loadProfile();
    return result.success ? result.data : null;
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

    const result = await tenantSettingsApi.getNotificationPreferences();
    return result.success ? result.data : null;
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return null;
  }
}

export async function updateNotificationPreferences(preferences: any) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("tenant_token")?.value;
    
    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const result = await tenantSettingsApi.updateNotificationPreferences(preferences);
    return result;
  } catch (error) {
    console.error("Error updating preferences:", error);
    return { success: false, message: "Failed to update preferences" };
  }
}