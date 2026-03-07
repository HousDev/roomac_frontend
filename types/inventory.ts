export interface InventoryCategory {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  default_penalty_minor: number;
  default_penalty_major: number;
  created_at: string;
  updated_at: string;
  category?: InventoryCategory;
}

export type AssetCondition = 'New' | 'Good' | 'Used' | 'Damaged';
export type AssetStatus = 'In Stock' | 'Allocated' | 'Maintenance' | 'Disposed';

export interface Asset {
  id: string;
  asset_id: string;
  item_id: string;
  property_name: string;
  room_number: string;
  bed_number: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  condition: AssetCondition;
  status: AssetStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  item?: InventoryItem;
}

export interface PenaltyMaster {
  id: string;
  item_id: string;
  damage_type: string;
  penalty_amount: number;
  description: string;
  created_at: string;
  updated_at: string;
  item?: InventoryItem;
}

export type HandoverStatus = 'Pending' | 'Completed';

export interface TenantHandover {
  id: string;
  tenant_id: string;
  tenant_name: string;
  property_name: string;
  room_number: string;
  bed_number: string | null;
  move_in_date: string;
  handover_date: string;
  inspector_name: string;
  tenant_signature: string | null;
  aadhaar_number: string | null;
  esign_timestamp: string | null;
  esign_ip: string | null;
  status: HandoverStatus;
  created_at: string;
  updated_at: string;
}

export interface HandoverItem {
  id: string;
  handover_id: string;
  asset_id: string;
  condition: 'New' | 'Good' | 'Used';
  tenant_confirmed: boolean;
  notes: string;
  created_at: string;
  asset?: Asset;
}

export interface HandoverPhoto {
  id: string;
  handover_id: string;
  item_id: string;
  photo_url: string;
  photo_type: string;
  created_at: string;
}

export interface MoveoutInspection {
  id: string;
  tenant_id: string;
  tenant_name: string;
  handover_id: string | null;
  room_number: string;
  bed_number: string | null;
  inspection_date: string;
  inspector_name: string;
  total_penalty: number;
  tenant_signature: string | null;
  aadhaar_number: string | null;
  esign_timestamp: string | null;
  esign_ip: string | null;
  status: 'Pending' | 'Completed';
  created_at: string;
  updated_at: string;
}

export interface InspectionItem {
  id: string;
  inspection_id: string;
  asset_id: string;
  movein_condition: string;
  moveout_condition: string;
  has_damage: boolean;
  damage_type: string | null;
  penalty_amount: number;
  notes: string;
  created_at: string;
  asset?: Asset;
}

export interface InspectionPhoto {
  id: string;
  inspection_id: string;
  item_id: string;
  photo_url: string;
  photo_type: 'Before' | 'After';
  created_at: string;
}

export interface TenantSettlement {
  id: string;
  inspection_id: string;
  tenant_id: string;
  security_deposit: number;
  damage_charges: number;
  pending_rent: number;
  other_charges: number;
  refund_amount: number;
  settlement_date: string;
  status: 'Pending' | 'Approved' | 'Paid';
  created_at: string;
  updated_at: string;
}
