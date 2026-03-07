export type IDProofType = 'Aadhaar' | 'PAN' | 'Driving License' | 'Passport';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  id_proof_type: IDProofType;
  id_proof_number: string;
  id_proof_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitorLog {
  id: string;
  visitor_id: string | null;
  visitor_name: string;
  visitor_phone: string;
  tenant_id: string;
  tenant_name: string;
  room_number: string;
  entry_time: string;
  exit_time: string | null;
  purpose: string;
  approval_status: ApprovalStatus;
  approval_otp: string | null;
  approved_at: string | null;
  security_guard_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
  visitor?: Visitor;
}

export interface VisitorRestriction {
  id: string;
  property_name: string;
  restriction_type: string;
  start_time: string;
  end_time: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
