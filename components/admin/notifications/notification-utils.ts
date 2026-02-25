import { Notification } from '@/lib/notificationApi';

export class NotificationRedirectHandler {
  getRedirectUrl(notification: Notification): string {
    const { related_entity_type, related_entity_id, request_type } = notification;
    
    if (related_entity_id) {
      switch (request_type) {
        case 'complaint':
          return `/admin/complaints/${related_entity_id}`;
        case 'maintenance':
          return `/admin/maintenance/${related_entity_id}`;
        case 'receipt':
          return `/admin/receipts/${related_entity_id}`;
        case 'leave':
          return `/admin/leave-requests`;
        case 'vacate_bed':
          return `/admin/vacate-requests/${related_entity_id}`;
        case 'change_bed':
          return `/admin/change-bed-requests`;
        default:
          switch (related_entity_type?.toLowerCase()) {
            case 'complaint':
              return `/admin/complaints/${related_entity_id}`;
            case 'maintenance':
              return `/admin/maintenance/${related_entity_id}`;
            case 'receipt':
              return `/admin/receipts/${related_entity_id}`;
            case 'leave_request':
              return `/admin/leave-requests`;
            case 'vacate_request':
              return `/admin/vacate-requests/${related_entity_id}`;
            case 'change_bed_request':
              return `/admin/change-bed-requests`;
            default:
              return this.determineRedirectFromContent(notification);
          }
      }
    }
    
    return this.determineRedirectFromContent(notification);
  }

  private determineRedirectFromContent(notification: Notification): string {
    const lowerTitle = notification.title.toLowerCase();
    const lowerMessage = notification.message.toLowerCase();
    
    if (lowerTitle.includes('complaint') || lowerMessage.includes('complaint')) {
      return '/admin/complaints';
    }
    if (lowerTitle.includes('maintenance') || lowerMessage.includes('maintenance')) {
      return '/admin/maintenance';
    }
    if (lowerTitle.includes('receipt') || lowerMessage.includes('receipt')) {
      return '/admin/receipts';
    }
    if (lowerTitle.includes('leave request') || lowerMessage.includes('leave request')) {
      return '/admin/leave-requests';
    }
    if (lowerTitle.includes('vacate') || lowerMessage.includes('vacate')) {
      return '/admin/vacate-requests';
    }
    if (lowerTitle.includes('change bed') || lowerMessage.includes('change bed')) {
      return '/admin/change-bed-requests';
    }
    
    return '/admin/dashboard';
  }

  getRequestTypeBadge(notification: Notification): { label: string; color: string } | null {
    const { request_type, title, message } = notification;
    const lowerTitle = title.toLowerCase();
    const lowerMessage = message.toLowerCase();
    
    switch (request_type) {
      case 'complaint':
        return { label: 'Complaint', color: 'bg-red-500 text-white' };
      case 'maintenance':
        return { label: 'Maintenance', color: 'bg-orange-500 text-white' };
      case 'receipt':
        return { label: 'Receipt', color: 'bg-green-500 text-white' };
      case 'leave':
        return { label: 'Leave Request', color: 'bg-blue-500 text-white' };
      case 'vacate_bed':
        return { label: 'Vacate Request', color: 'bg-purple-500 text-white' };
      case 'change_bed':
        return { label: 'Change Bed', color: 'bg-cyan-500 text-white' };
      default:
        if (lowerTitle.includes('complaint') || lowerMessage.includes('complaint')) {
          return { label: 'Complaint', color: 'bg-red-500 text-white' };
        }
        if (lowerTitle.includes('maintenance') || lowerMessage.includes('maintenance')) {
          return { label: 'Maintenance', color: 'bg-orange-500 text-white' };
        }
        if (lowerTitle.includes('receipt') || lowerMessage.includes('receipt')) {
          return { label: 'Receipt', color: 'bg-green-500 text-white' };
        }
        if (lowerTitle.includes('leave request') || lowerMessage.includes('leave request')) {
          return { label: 'Leave Request', color: 'bg-blue-500 text-white' };
        }
        if (lowerTitle.includes('vacate') || lowerMessage.includes('vacate')) {
          return { label: 'Vacate Request', color: 'bg-purple-500 text-white' };
        }
        if (lowerTitle.includes('change bed') || lowerMessage.includes('change bed')) {
          return { label: 'Change Bed', color: 'bg-cyan-500 text-white' };
        }
        
        return null;
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}