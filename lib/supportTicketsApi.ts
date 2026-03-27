// lib/supportTicketsApi.ts
import { request } from '@/lib/api';

export interface SupportTicket {
  id: number;
  tenant_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  category: string;
  priority: string;
  message: string;
  status: string;
  admin_notes: string | null;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  tenant_id?: number;
}

export interface SupportTicketCounts {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
}

// ── Submit a ticket (tenant-facing) ─────────────────────────────
export const submitSupportTicket = async (
  payload: CreateTicketPayload
): Promise<{ success: boolean; data?: { id: number }; message: string }> => {
  try {
    return await request<{ success: boolean; data?: { id: number }; message: string }>(
      '/api/support-tickets',
      { method: 'POST', body: JSON.stringify(payload) }
    );
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to submit ticket' };
  }
};

// ── Admin: get all tickets ───────────────────────────────────────
export const getAllSupportTickets = async (filters?: {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}): Promise<SupportTicket[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status   && filters.status   !== 'all') params.append('status',   filters.status);
    if (filters?.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res   = await request<{ success: boolean; data: SupportTicket[] }>(
      `/api/support-tickets${query}`
    );
    return res.data || [];
  } catch {
    return [];
  }
};

// ── Admin: get single ticket ─────────────────────────────────────
export const getSupportTicketById = async (id: number): Promise<SupportTicket | null> => {
  try {
    const res = await request<{ success: boolean; data: SupportTicket }>(
      `/api/support-tickets/${id}`
    );
    return res.data || null;
  } catch {
    return null;
  }
};

// ── Admin: update status ─────────────────────────────────────────
export const updateSupportTicketStatus = async (
  id: number,
  status: string,
  admin_notes?: string
): Promise<boolean> => {
  try {
    await request<{ success: boolean }>(
      `/api/support-tickets/${id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status, admin_notes }) }
    );
    return true;
  } catch {
    return false;
  }
};

// ── Admin: counts ─────────────────────────────────────────────────
export const getSupportTicketCounts = async (): Promise<SupportTicketCounts> => {
  try {
    const res = await request<{ success: boolean; data: SupportTicketCounts }>(
      '/api/support-tickets/counts'
    );
    return res.data || { total: 0, open: 0, in_progress: 0, resolved: 0 };
  } catch {
    return { total: 0, open: 0, in_progress: 0, resolved: 0 };
  }
};

// ── Admin: bulk delete ────────────────────────────────────────────
export const bulkDeleteSupportTickets = async (ids: number[]): Promise<boolean> => {
  try {
    await request<{ success: boolean }>(
      '/api/support-tickets/bulk',
      { method: 'DELETE', body: JSON.stringify({ ids }) }
    );
    return true;
  } catch {
    return false;
  }
};