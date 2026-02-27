// components/tenant/tenant-requests/requestConfig.tsx
import { 
  MessageSquare, 
  Receipt, 
  Wrench, 
  Calendar, 
  Move, 
  Bed,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  Info,
  Home,
  Building,
  DoorOpen,
  Hash,
  ArrowLeft,
  Send,
  Plus,
  FileText
} from 'lucide-react';

// Quick request types
export const QUICK_REQUESTS = [
  {
    type: 'complaint',
    title: 'File a Complaint',
    description: 'Report an issue or concern',
    icon: MessageSquare,
    color: 'bg-red-50 border-red-200'
  },
  {
    type: 'receipt',
    title: 'Request Receipt',
    description: 'Get rent or deposit receipt',
    icon: Receipt,
    color: 'bg-blue-50 border-blue-200'
  },
  {
    type: 'maintenance',
    title: 'Maintenance Request',
    description: 'Report repair needs',
    icon: Wrench,
    color: 'bg-orange-50 border-orange-200'
  },
  {
    type: 'leave',
    title: 'Leave Application',
    description: 'Request temporary leave',
    icon: Calendar,
    color: 'bg-purple-50 border-purple-200'
  },
  {
    type: 'vacate_bed',
    title: 'Vacate Bed Request',
    description: 'Request to vacate your bed',
    icon: Move,
    color: 'bg-pink-50 border-pink-200'
  },
  {
    type: 'change_bed',
    title: 'Change Bed Request',
    description: 'Request to change your bed',
    icon: Bed,
    color: 'bg-teal-50 border-teal-200'
  }
] as const;

// Maintenance categories
export const MAINTENANCE_CATEGORIES = [
  { id: 'electrical', label: 'Electrical' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'ac', label: 'AC' },
  { id: 'furniture', label: 'Furniture' },
  { id: 'internet', label: 'Internet' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'other', label: 'Other' }
] as const;

// Visit times
export const VISIT_TIMES = [
  { id: 'morning', label: 'Morning (9 AM - 12 PM)' },
  { id: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
  { id: 'evening', label: 'Evening (4 PM - 7 PM)' },
  { id: 'anytime', label: 'Anytime during office hours' }
] as const;

// Maintenance locations
export const MAINTENANCE_LOCATIONS = [
  { id: 'bathroom', label: 'Bathroom' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'room', label: 'My Room' },
  { id: 'common_area', label: 'Common Area' },
  { id: 'corridor', label: 'Corridor' },
  { id: 'other', label: 'Other Location' }
] as const;

// Request status configuration
export const REQUEST_STATUS_CONFIG = {
  pending: { variant: 'outline' as const, icon: Clock, label: 'PENDING' },
  in_progress: { variant: 'default' as const, icon: AlertCircle, label: 'IN PROGRESS' },
  resolved: { variant: 'default' as const, icon: CheckCircle, label: 'RESOLVED' },
  closed: { variant: 'secondary' as const, icon: XCircle, label: 'CLOSED' },
  approved: { variant: 'default' as const, icon: CheckCircle, label: 'APPROVED' },
  rejected: { variant: 'destructive' as const, icon: XCircle, label: 'REJECTED' },
  completed: { variant: 'default' as const, icon: CheckCircle, label: 'COMPLETED' }
} as const;

// Priority configuration
export const PRIORITY_CONFIG = {
  low: { color: 'bg-green-100 text-green-800 hover:bg-green-100', label: 'LOW' },
  medium: { color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100', label: 'MEDIUM' },
  high: { color: 'bg-orange-100 text-orange-800 hover:bg-orange-100', label: 'HIGH' },
  urgent: { color: 'bg-red-100 text-red-800 hover:bg-red-100', label: 'URGENT' }
} as const;

// Request type icons
export const REQUEST_TYPE_ICONS = {
  complaint: MessageSquare,
  receipt: Receipt,
  maintenance: Wrench,
  leave: Calendar,
  vacate_bed: Move,
  change_bed: Bed,
  general: FileText
} as const;

// Interfaces
export interface RequestFormData {
  request_type: string;
  title: string;
  description: string;
  priority: string;
  vacateData?: {
    primary_reason_id?: string;
        primary_reason_text?: string; // Add this

    secondary_reasons?: string[];
    overall_rating?: number;
    food_rating?: number;
    cleanliness_rating?: number;
    management_rating?: number;
    improvement_suggestions?: string;
    agree_lockin_penalty?: boolean;
    agree_notice_penalty?: boolean;
    expected_vacate_date?: string;
  };
  changeBedData?: {
    preferred_property_id?: number;
    preferred_room_id?: number;
    change_reason_id?: number;
    shifting_date?: string;
    notes?: string;
    preferred_bed_number?: number;
  };
  leaveData?: any;
  maintenanceData?: {
    issue_category?: string;
    location?: string;
    preferred_visit_time?: string;
    access_permission?: boolean;
  };
  complaintData?: {
    category_master_type_id?: number;
    reason_master_value_id?: number;
    custom_reason?: string;
  };
}