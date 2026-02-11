const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Notification {
  id: number;
  recipient_id: number;
  recipient_type: 'admin' | 'tenant';
  title: string;
  message: string;
  notification_type: string;
  related_entity_type: string;
  related_entity_id: number | null;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  read_at: string | null;
  entity_title?: string;
  entity_status?: string;
  tenant_name?: string;
  request_type?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
  tenant_requests: number;
  vacate_requests: number;
}

// Simple fetch wrapper
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    console.log(`🌐 API Call: ${API_BASE_URL}${url}`);
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ API Error (${url}):`, error);
    throw error;
  }
}

// Get admin notifications
export const getAdminNotifications = async (limit = 10): Promise<Notification[]> => {
  try {
    console.log(`🔔 Fetching admin notifications (limit: ${limit})`);
    
    const response = await apiFetch<{
      success: boolean;
      data: Notification[];
    }>(`/api/admin/notifications?limit=${limit}`);
    
    if (response.success) {
      console.log(`✅ Found ${response.data.length} notifications`);
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    // Return empty array instead of mock data to see real issue
    return [];
  }
};

// Get admin unread count
export const getAdminUnreadCount = async (): Promise<number> => {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: { count: number };
    }>('/api/admin/notifications/unread-count');
    
    if (response.success) {
      return response.data.count;
    }
    return 0;
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return 0;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (id: number): Promise<boolean> => {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
    }>(`/api/admin/notifications/${id}/read`, {
      method: 'PUT'
    });
    
    return response.success;
  } catch (error) {
    console.error('❌ Error marking as read:', error);
    return false;
  }
};

// Mark all notifications as read
export const markAllAdminNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const response = await apiFetch<{
      success: boolean;
      message: string;
    }>('/api/admin/notifications/read-all', {
      method: 'PUT'
    });
    
    return response.success;
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    return false;
  }
};

// Get notification stats
export const getAdminNotificationStats = async (): Promise<NotificationStats> => {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: NotificationStats;
    }>('/api/admin/notifications/stats');
    
    if (response.success) {
      return response.data;
    }
    
    // Return empty stats if API fails
    return {
      total: 0,
      unread: 0,
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
      tenant_requests: 0,
      vacate_requests: 0
    };
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return {
      total: 0,
      unread: 0,
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
      tenant_requests: 0,
      vacate_requests: 0
    };
  }
};

// Test API endpoints
export const testNotificationAPI = async () => {
  const tests = [
    { name: 'Get Notifications', endpoint: '/api/admin/notifications?limit=2' },
    { name: 'Unread Count', endpoint: '/api/admin/notifications/unread-count' },
    { name: 'Stats', endpoint: '/api/admin/notifications/stats' },
    { name: 'Test Endpoint', endpoint: '/api/admin/test' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const response = await fetch(`${API_BASE_URL}${test.endpoint}`);
      results.push({
        name: test.name,
        endpoint: test.endpoint,
        status: response.status,
        ok: response.ok
      });
    } catch (error : any) {
      results.push({
        name: test.name,
        endpoint: test.endpoint,
        error: error.message
      });
    }
  }
  
  console.log('🧪 API Test Results:', results);
  return results;
};

// Create test notification
export const createTestNotification = async () => {
  try {
    const response = await apiFetch<{
      success: boolean;
      notification_id: number;
      message: string;
    }>('/api/admin/test-notification', {
      method: 'POST',
      body: JSON.stringify({
        title: "Test Notification from Frontend",
        message: "This is a test notification created from the frontend"
      })
    });
    
    return response;
  } catch (error:any) {
    console.error('❌ Error creating test notification:', error);
    return { success: false, message: error.message };
  }
};
