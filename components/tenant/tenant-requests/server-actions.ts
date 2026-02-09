'use server';

import { getMyTenantRequests } from "@/lib/tenantRequestsApi";

export async function getInitialTenantRequestsData() {
  try {
    // Fetch requests without token check on server
    const requests = await getMyTenantRequests();
    
    return {
      requests,
      isAuthenticated: true, // Assume authenticated since API handles auth
      error: null
    };
  } catch (error: any) {
    console.error('Error fetching initial data:', error);
    
    // Check for authentication errors
    if (error.message?.includes('Authentication') || 
        error.message?.includes('token') || 
        error.message?.includes('401') ||
        error.message?.includes('Unauthorized')) {
      return {
        requests: [],
        isAuthenticated: false,
        error: 'Authentication required'
      };
    }
    
    return {
      requests: [],
      isAuthenticated: true,
      error: error.message || 'Failed to load data'
    };
  }
}