import { tenantApiRequest } from "./tenantApiHelper";

export type Notification = {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  related_entity_type: string;
  related_entity_id: number;
  type: string; // For backward compatibility
  is_read: boolean;
  read_at: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
};

// Get tenant notifications
export const getTenantNotifications = async (limit: number = 20): Promise<Notification[]> => {
  try {
    const res = await tenantApiRequest<{
      success: boolean;
      data: Notification[];
    }>(`/api/tenant-notifications?limit=${limit}`, {
      method: "GET",
    });

     if (res.success && Array.isArray(res.data)) {
      // Map the data to match your Notification type
      return res.data.map(n => ({
        id: n.id.toString(),
        title: n.title,
        message: n.message,
        notification_type: n.notification_type,
        type: n.notification_type,
        is_read: n.is_read === 1,
        created_at: n.created_at,
        related_entity_type: n.related_entity_type,
        related_entity_id: n.related_entity_id,
        priority: n.priority,
        read_at: n.read_at
      }));
    }
    return [];
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return [];
  }
};

// Get unread count
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const res = await tenantApiRequest<{
      success: boolean;
      data: { count: number };
    }>("/api/tenant-notifications/unread-count", {
      method: "GET",
    });

    if (res.success && res.data) {
      return res.data.count;
    }
    return 0;
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return 0;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const res = await tenantApiRequest<{
      success: boolean;
    }>(`/api/tenant-notifications/${notificationId}/read`, {
      method: "PUT",
    });

    return res.success;
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<number> => {
  try {
    const res = await tenantApiRequest<{
      success: boolean;
      message: string;
    }>("/api/tenant-notifications/mark-all-read", {
      method: "PUT",
    });

    if (res.success) {
      // Extract count from message
      const match = res.message.match(/(\d+)/);
      return match ? parseInt(match[0]) : 0;
    }
    return 0;
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    return 0;
  }
};