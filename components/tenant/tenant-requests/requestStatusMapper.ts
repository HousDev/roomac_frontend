// utils/requestStatusMapper.ts

// Define the possible status values for each request type
export type RequestStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'resolved' 
  | 'closed' 
  | 'approved' 
  | 'rejected' 
  | 'completed';

// Map specific request type statuses to unified display statuses
export function getDisplayStatus(request: {
  request_type: string;
  status: string;
  change_bed_data?: { request_status?: string };
  vacate_data?: { status?: string };
}): RequestStatus {
  const { request_type, status, change_bed_data, vacate_data } = request;

  // For change bed requests, use the change_bed_data.request_status if available
  if (request_type === 'change_bed' && change_bed_data?.request_status) {
    const changeBedStatus = change_bed_data.request_status;
    
    // Map change bed statuses to unified statuses
    switch (changeBedStatus) {
      case 'pending':
      case 'approved':
      case 'rejected':
      case 'processed':
        // Map 'processed' to 'completed' for display
        return changeBedStatus === 'processed' ? 'completed' : changeBedStatus as RequestStatus;
      default:
        return 'pending';
    }
  }

  // For vacate bed requests, use the vacate_data.status if available
  if (request_type === 'vacate_bed' && vacate_data?.status) {
    const vacateStatus = vacate_data.status;
    
    // Map vacate bed statuses to unified statuses
    switch (vacateStatus) {
      case 'pending':
      case 'under_review':
      case 'approved':
      case 'rejected':
      case 'completed':
        // Map 'under_review' to 'in_progress' for display
        return vacateStatus === 'under_review' ? 'in_progress' : vacateStatus as RequestStatus;
      default:
        return 'pending';
    }
  }

  // For other request types (complaint, maintenance, receipt, general)
  // Use the main status field directly
  switch (status) {
    case 'pending':
    case 'in_progress':
    case 'resolved':
    case 'closed':
    case 'approved':
    case 'rejected':
    case 'completed':
      return status as RequestStatus;
    default:
      return 'pending';
  }
}

// Get the appropriate status badge color/variant based on display status
export function getStatusConfig(status: RequestStatus) {
  const configs: Record<RequestStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
    pending: { 
      label: 'Pending', 
      variant: 'outline',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    in_progress: { 
      label: 'In Progress', 
      variant: 'default',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    resolved: { 
      label: 'Resolved', 
      variant: 'secondary',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    closed: { 
      label: 'Closed', 
      variant: 'outline',
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    approved: { 
      label: 'Approved', 
      variant: 'default',
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    rejected: { 
      label: 'Rejected', 
      variant: 'destructive',
      color: 'bg-red-100 text-red-800 border-red-200'
    },
    completed: { 
      label: 'Completed', 
      variant: 'default',
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    }
  };

  return configs[status] || configs.pending;
}