export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  property_type: string;
  total_rooms: number;
  available_rooms: number;
  amenities: string[];
  images: string[];
  description: string;
  is_active: boolean;
  contact_person: string;
  contact_phone: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  property_id: string;
  room_number: string;
  floor: number;
  room_type: string;
  capacity: number;
  occupied_beds: number;
  rent_single: number;
  rent_shared: number;
  amenities: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bed {
  id: string;
  room_id: string;
  bed_number: string;
  status: 'available' | 'occupied' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  alternate_phone?: string;
  date_of_birth: string;
  gender: string;
  occupation: string;
  company_college?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  id_proof_type: string;
  id_proof_number: string;
  id_proof_document_url?: string;
  photo_url?: string;
  permanent_address: string;
  referral_code?: string;
  referred_by_code?: string;
  referral_earnings: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  tenant_id: string;
  property_id: string;
  room_id: string;
  bed_id: string;
  booking_type: string;
  move_in_date: string;
  move_out_date?: string;
  agreement_start_date: string;
  agreement_end_date: string;
  agreement_duration_months: number;
  monthly_rent: number;
  security_deposit: number;
  advance_months: number;
  offer_applied?: string;
  offer_discount_percent: number;
  offer_discount_amount: number;
  final_monthly_rent: number;
  status: string;
  payment_status: string;
  deposit_paid: boolean;
  deposit_paid_date?: string;
  agreement_signed: boolean;
  agreement_document_url?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  duration_months: number;
  base_price: number;
  discount_percentage: number;
  features: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  offer_type: string;
  discount_type: string;
  discount_value?: number;
  discount_percent?: number;
  min_months?: number;
  start_date: string;
  end_date: string;
  terms_and_conditions: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  tenant_id: string;
  booking_id: string;
  payment_type: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  payment_date: string;
  due_date: string;
  status: string;
  late_fee?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  payment_id: string;
  tenant_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  description: string;
  generated_by?: string;
  generated_at: string;
  is_cancelled: boolean;
  cancelled_at?: string;
  cancelled_reason?: string;
  metadata: any;
}

export interface Agreement {
  id: string;
  agreement_number: string;
  tenant_id: string;
  booking_id: string;
  template_id?: string;
  content: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  terms_and_conditions: any;
  status: string;
  signed_at?: string;
  tenant_signature?: string;
  landlord_signature?: string;
  witness_name?: string;
  witness_signature?: string;
  generated_by?: string;
  generated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  billing_cycle: string;
  is_active: boolean;
  icon?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_properties: number;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  total_tenants: number;
  active_tenants: number;
  total_revenue: number;
  pending_payments: number;
  occupancy_rate: number;
}
