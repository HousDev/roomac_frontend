// import { Notification } from '@/lib/notificationApi';

// export class NotificationRedirectHandler {
//   getRedirectUrl(notification: Notification): string {
//     const { related_entity_type, related_entity_id, request_type } = notification;
    
//     if (related_entity_id) {
//       switch (request_type) {
//         case 'complaint':
//           return `/admin/complaints/${related_entity_id}`;
//         case 'maintenance':
//           return `/admin/maintenance/${related_entity_id}`;
//         case 'receipt':
//           return `/admin/receipts/${related_entity_id}`;
//         case 'leave':
//           return `/admin/leave-requests`;
//         case 'vacate_bed':
//           return `/admin/vacate-requests/${related_entity_id}`;
//         case 'change_bed':
//           return `/admin/change-bed-requests`;
//         default:
//           switch (related_entity_type?.toLowerCase()) {
//             case 'complaint':
//               return `/admin/complaints/${related_entity_id}`;
//             case 'maintenance':
//               return `/admin/maintenance/${related_entity_id}`;
//             case 'receipt':
//               return `/admin/receipts/${related_entity_id}`;
//             case 'leave_request':
//               return `/admin/leave-requests`;
//             case 'vacate_request':
//               return `/admin/vacate-requests/${related_entity_id}`;
//             case 'change_bed_request':
//               return `/admin/change-bed-requests`;
//             default:
//               return this.determineRedirectFromContent(notification);
//           }
//       }
//     }
    
//     return this.determineRedirectFromContent(notification);
//   }

//   private determineRedirectFromContent(notification: Notification): string {
//     const lowerTitle = notification.title.toLowerCase();
//     const lowerMessage = notification.message.toLowerCase();
    
//     if (lowerTitle.includes('complaint') || lowerMessage.includes('complaint')) {
//       return '/admin/complaints';
//     }
//     if (lowerTitle.includes('maintenance') || lowerMessage.includes('maintenance')) {
//       return '/admin/maintenance';
//     }
//     if (lowerTitle.includes('receipt') || lowerMessage.includes('receipt')) {
//       return '/admin/receipts';
//     }
//     if (lowerTitle.includes('leave request') || lowerMessage.includes('leave request')) {
//       return '/admin/leave-requests';
//     }
//     if (lowerTitle.includes('vacate') || lowerMessage.includes('vacate')) {
//       return '/admin/vacate-requests';
//     }
//     if (lowerTitle.includes('change bed') || lowerMessage.includes('change bed')) {
//       return '/admin/change-bed-requests';
//     }
    
//     return '/admin/dashboard';
//   }

//   getRequestTypeBadge(notification: Notification): { label: string; color: string } | null {
//     const { request_type, title, message } = notification;
//     const lowerTitle = title.toLowerCase();
//     const lowerMessage = message.toLowerCase();
    
//     switch (request_type) {
//       case 'complaint':
//         return { label: 'Complaint', color: 'bg-red-500 text-white' };
//       case 'maintenance':
//         return { label: 'Maintenance', color: 'bg-orange-500 text-white' };
//       case 'receipt':
//         return { label: 'Receipt', color: 'bg-green-500 text-white' };
//       case 'leave':
//         return { label: 'Leave Request', color: 'bg-blue-500 text-white' };
//       case 'vacate_bed':
//         return { label: 'Vacate Request', color: 'bg-purple-500 text-white' };
//       case 'change_bed':
//         return { label: 'Change Bed', color: 'bg-cyan-500 text-white' };
//       default:
//         if (lowerTitle.includes('complaint') || lowerMessage.includes('complaint')) {
//           return { label: 'Complaint', color: 'bg-red-500 text-white' };
//         }
//         if (lowerTitle.includes('maintenance') || lowerMessage.includes('maintenance')) {
//           return { label: 'Maintenance', color: 'bg-orange-500 text-white' };
//         }
//         if (lowerTitle.includes('receipt') || lowerMessage.includes('receipt')) {
//           return { label: 'Receipt', color: 'bg-green-500 text-white' };
//         }
//         if (lowerTitle.includes('leave request') || lowerMessage.includes('leave request')) {
//           return { label: 'Leave Request', color: 'bg-blue-500 text-white' };
//         }
//         if (lowerTitle.includes('vacate') || lowerMessage.includes('vacate')) {
//           return { label: 'Vacate Request', color: 'bg-purple-500 text-white' };
//         }
//         if (lowerTitle.includes('change bed') || lowerMessage.includes('change bed')) {
//           return { label: 'Change Bed', color: 'bg-cyan-500 text-white' };
//         }
        
//         return null;
//     }
//   }

//   getPriorityColor(priority: string): string {
//     switch (priority) {
//       case 'urgent':
//         return 'bg-red-100 text-red-800 border-red-200';
//       case 'high':
//         return 'bg-orange-100 text-orange-800 border-orange-200';
//       case 'medium':
//         return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'low':
//         return 'bg-green-100 text-green-800 border-green-200';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   }
// }

import { Notification } from '@/lib/notificationApi';

export class NotificationRedirectHandler {
  getRedirectUrl(notification: Notification): string {
    const { related_entity_type, related_entity_id, request_type, notification_type } = notification;
    
    // Use the ID from any available field
    const entityId = related_entity_id || notification.entity_id || notification.request_id;
    
    if (entityId) {
      switch (request_type) {
        case 'complaint':
          return `/admin/complaints/${entityId}`;
        case 'maintenance':
          return `/admin/maintenance/${entityId}`;
        case 'receipt':
          return `/admin/receipts/${entityId}`;
        case 'leave':
          return `/admin/leave-requests/${entityId}`;
        case 'vacate_bed':
        case 'vacate_request':
          return `/admin/vacate-requests?highlight=${entityId}`;
        case 'change_bed':
          return `/admin/change-bed-requests?highlight=${entityId}`;
        case 'support_ticket':
          // ✅ Redirect to requests page with support tab
          return `/admin/requests#support`;
        case 'account_deletion':
        case 'deletion_request':
          return `/admin/account-deletion-requests?highlight=${entityId}`;
        case 'enquiry':
          return `/admin/enquiries?highlight=${entityId}`;
        default:
          switch (notification_type) {
            case 'support_ticket':
              return `/admin/requests#support`;
            case 'account_deletion':
              return `/admin/account-deletion-requests?highlight=${entityId}`;
            case 'enquiry':
              return `/admin/enquiries?highlight=${entityId}`;
            default:
              switch (related_entity_type?.toLowerCase()) {
                case 'complaint':
                  return `/admin/complaints/${entityId}`;
                case 'maintenance':
                  return `/admin/maintenance/${entityId}`;
                case 'receipt':
                  return `/admin/receipts/${entityId}`;
                case 'leave_request':
                  return `/admin/leave-requests/${entityId}`;
                case 'vacate_request':
                case 'vacate_bed':
                  return `/admin/vacate-requests?highlight=${entityId}`;
                case 'change_bed_request':
                  return `/admin/change-bed-requests?highlight=${entityId}`;
                case 'support_ticket':
                  return `/admin/requests#support`;
                case 'account_deletion':
                case 'deletion_request':
                  return `/admin/account-deletion-requests?highlight=${entityId}`;
                case 'enquiry':
                  return `/admin/enquiries?highlight=${entityId}`;
                default:
                  return this.determineRedirectFromContent(notification);
              }
          }
      }
    }
    
    return this.determineRedirectFromContent(notification);
  }

  private determineRedirectFromContent(notification: Notification): string {
    const lowerTitle = (notification.title || '').toLowerCase();
    const lowerMessage = (notification.message || '').toLowerCase();
    const lowerType = (notification.notification_type || '').toLowerCase();
    
    // Check for support tickets - redirect to requests page with support tab
    if (lowerTitle.includes('support') || 
        lowerTitle.includes('ticket') ||
        lowerMessage.includes('support ticket') ||
        lowerType.includes('support_ticket')) {
      return '/admin/requests#support';
    }
    
    // Check for account deletion
    if (lowerTitle.includes('account deletion') || 
        lowerTitle.includes('deletion request') ||
        lowerMessage.includes('account deletion') ||
        lowerType.includes('account_deletion')) {
      return '/admin/account-deletion-requests';
    }
    
    // Check for enquiries
    if (lowerTitle.includes('enquiry') || 
        lowerTitle.includes('new enquiry') ||
        lowerMessage.includes('enquiry') ||
        lowerType.includes('enquiry')) {
      return '/admin/enquiries';
    }
    
    // Check for complaints
    if (lowerTitle.includes('complaint') || lowerMessage.includes('complaint')) {
      return '/admin/complaints';
    }
    
    // Check for maintenance
    if (lowerTitle.includes('maintenance') || lowerMessage.includes('maintenance')) {
      return '/admin/maintenance';
    }
    
    // Check for receipts/payments
    if (lowerTitle.includes('receipt') || 
        lowerTitle.includes('payment') || 
        lowerMessage.includes('receipt') ||
        lowerMessage.includes('payment')) {
      return '/admin/receipts';
    }
    
    // Check for leave requests
    if (lowerTitle.includes('leave request') || lowerMessage.includes('leave request')) {
      return '/admin/leave-requests';
    }
    
    // Check for vacate
    if (lowerTitle.includes('vacate') || lowerMessage.includes('vacate')) {
      return '/admin/vacate-requests';
    }
    
    // Check for change bed
    if (lowerTitle.includes('change bed') || lowerMessage.includes('change bed')) {
      return '/admin/change-bed-requests';
    }
    
    return '/admin/dashboard';
  }

  getRequestTypeBadge(notification: Notification): { label: string; color: string } | null {
    const { request_type, notification_type, title, message } = notification;
    const lowerTitle = (title || '').toLowerCase();
    const lowerMessage = (message || '').toLowerCase();
    
    // Check by request_type first
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
      case 'vacate_request':
        return { label: 'Vacate Request', color: 'bg-purple-500 text-white' };
      case 'change_bed':
        return { label: 'Change Bed', color: 'bg-cyan-500 text-white' };
      case 'support_ticket':
        return { label: 'Support Ticket', color: 'bg-indigo-500 text-white' };
      case 'account_deletion':
      case 'deletion_request':
        return { label: 'Account Deletion', color: 'bg-rose-500 text-white' };
      case 'enquiry':
        return { label: 'Enquiry', color: 'bg-emerald-500 text-white' };
      default:
        // Check by notification_type
        switch (notification_type) {
          case 'support_ticket':
            return { label: 'Support Ticket', color: 'bg-indigo-500 text-white' };
          case 'account_deletion':
            return { label: 'Account Deletion', color: 'bg-rose-500 text-white' };
          case 'enquiry':
            return { label: 'Enquiry', color: 'bg-emerald-500 text-white' };
          default:
            // Fallback to content-based detection
            if (lowerTitle.includes('support') || lowerMessage.includes('support ticket')) {
              return { label: 'Support Ticket', color: 'bg-indigo-500 text-white' };
            }
            if (lowerTitle.includes('account deletion') || lowerMessage.includes('account deletion')) {
              return { label: 'Account Deletion', color: 'bg-rose-500 text-white' };
            }
            if (lowerTitle.includes('enquiry') || lowerMessage.includes('enquiry')) {
              return { label: 'Enquiry', color: 'bg-emerald-500 text-white' };
            }
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