export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  html_content: string;
  variables: string[];
  is_active: boolean;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  template_id?: string;
  document_number: string;
  document_name: string;
  tenant_id?: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  property_name?: string;
  room_number?: string;
  html_content: string;
  data_json: Record<string, any>;
  status: 'Created' | 'Shared' | 'Viewed' | 'Verified' | 'Completed';
  workflow_stage?: string;
  next_action?: string;
  last_action_at?: string;
  assigned_to?: string;
  due_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  share_method: 'Email' | 'SMS' | 'WhatsApp' | 'Link';
  recipient_name: string;
  recipient_contact: string;
  share_link: string;
  access_token: string;
  otp_code?: string;
  otp_verified: boolean;
  otp_verified_at?: string;
  verification_method?: 'Aadhaar' | 'Mobile' | 'Email';
  aadhaar_last4?: string;
  expires_at: string;
  accessed_at?: string;
  ip_address?: string;
  user_agent?: string;
  shared_by: string;
  created_at: string;
}

export interface DocumentStatusHistory {
  id: string;
  document_id: string;
  status: string;
  event_type: 'Created' | 'Updated' | 'Shared' | 'Viewed' | 'Verified' | 'Completed' | 'Deleted';
  event_description: string;
  performed_by: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
