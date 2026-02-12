import { ReactNode } from "react";

export interface TenantProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  country_code: string;
  date_of_birth: string;
  gender: string;
  occupation: string;
  occupation_category: string;
  exact_occupation: string;
  is_active: boolean;
  portal_access_enabled: boolean;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  id_proof_url: string;
  address_proof_url: string;
  photo_url: string;
  additional_documents?: Array<{
    filename: string;
    url: string;
    uploaded_at?: string;
    document_type?: string;
  }>;
  preferred_sharing: string;
  preferred_room_type: string;
  preferred_property_id: number | null;
  created_at: string;
  updated_at: string;
  room_id: number | null;
  bed_number: number | null;
  tenant_gender: string | null;
  is_available: boolean | null;
  bed_assigned_at: string | null;
  room_number: string | null;
  floor: string | null;
  room_type: string | null;
  rent_per_bed: number | null;
  check_in_date: string;
  lockin_period_months: number | null;
  lockin_penalty_amount: number | null;
  lockin_penalty_type: string | null;
  notice_period_days: number | null;
  notice_penalty_amount: number | null;
  notice_penalty_type: string | null;
  bed_id: number | null;
  monthly_rent: number | null;
  property_id: number | null;
  property_name: string | null;
  property_address: string | null;
  property_city: string | null;
  property_state: string | null;
  property_manager_name: string | null;
  property_manager_phone: string | null;
  amenities: string | null;
  services: string | null;
  property_photos: string | null;
  property_rules: string | null;
  property_active: boolean | null;
  property_rating: number | null;
  manager_name?: string;
  manager_phone?: string;
  deletion_request?: {
    status: 'none' | 'pending' | 'approved' | 'rejected' | 'cancelled';
    reason?: string;
    requested_at?: string;
    reviewed_at?: string;
    reviewed_by?: string;
    review_notes?: string;
  };
}

export interface Payment {
  id: number;
  payment_for: string;
  amount: number;
  payment_date: string;
  payment_status: string;
}

export interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  resolution_notes?: string | null;
  tenant_id?: number;
  property_id?: string;
  room_id?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type?: string;
  time?: string;
  details?: any;
  timestamp?: string;
}

export interface LeaveRequest {
  id: number;
  requested_leave_date: string;
  reason: string;
  tenant_id?: number;
  booking_id?: string;
  property_id?: string;
  room_id?: string;
  lockInCompleted?: boolean;
  lockInViolationDays?: number;
  status: string;
  created_at: string;
}

export interface DashboardStats {
  totalPayments: number;
  pendingPayments: number;
  openComplaints: number;
  unreadNotifications: number;
  daysUntilRentDue: number;
  rentAmount: number;
  occupancyDays: number;
  depositAmount: number;
  nextDueDate: string;
  maintenanceScore: number;
  cleanlinessScore: number;
  communityScore: number;
}

export interface Metric {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
  bgColor: string;
  trend: string;
}

export interface RecentActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  amount?: string;
  status: string;
  time: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Amenity {
  icon: string;
  name: string;
  available: boolean;
  status?: string;
  uptime?: string;
  rating?: string;
  cameras?: string;
  next?: string;
  slots?: string;
  equipment?: string;
  channels?: string;
  type?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  badge: string | null;
  href?: string;
  tab?: string;
}

export interface NewComplaint {
  title: string;
  description: string;
  category: string;
  priority: string;
}

export interface LeaveRequestForm {
  requested_leave_date: string;
  reason: string;
}

export interface NotificationDetail {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
  details: any;
  timestamp: string;
}