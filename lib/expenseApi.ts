// lib/expenseApi.ts
import { request } from "./api";

/* ── Types ─────────────────────────────────────────────────────────────────── */
export interface ExpenseItem {
  id?: number;
  name: string;
  category: string;
  qty: number;
  price: number;
  total?: number;
}

export interface Expense {
  id: number;
  property_id: number;
  property_name: string;
  category_id: number;
  category_name: string;
  description: string;
  amount: number;
  payment_mode: string; 
  receipt_url?: string | null;
  receipt_name?: string | null;
  expense_date: string;
  status: "Paid" | "Pending";
  added_by_name: string;
  notes?: string;
  items: ExpenseItem[];
  created_at: string;
  updated_at: string;
}

export interface ExpenseFilters {
  property_id?: string;
  category_id?: string;
  payment_mode?: string;
  status?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

export interface ExpenseStats {
  total_count: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  paid_count: number;
  pending_count: number;
}

/* ── API helpers ────────────────────────────────────────────────────────────── */

export const getExpenses = async (filters: ExpenseFilters = {}): Promise<Expense[]> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.append(k, v);
  });
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await request(`/api/expenses${qs}`, { method: "GET" });
  return res.success ? res.data || [] : [];
};

export const getExpenseStats = async (filters: { property_id?: string; payment_mode?: string; month?: string } = {}): Promise<ExpenseStats> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.append(k, v);
  });
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await request(`/api/expenses/stats${qs}`, { method: "GET" });
  return res.data || {};
};

export const getExpenseById = async (id: number): Promise<Expense> => {
  const res = await request(`/api/expenses/${id}`, { method: "GET" });
  if (res.success) return res.data;
  throw new Error("Failed to fetch expense");
};

/** Build a FormData payload (handles file + JSON items) */
const buildFormData = (data: Record<string, any>, file?: File | null): FormData => {
  const fd = new FormData();
  const { items, receipt, ...rest } = data;
  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  });
  if (items) fd.append("items", JSON.stringify(items));
  if (file instanceof File) fd.append("receipt", file);
  return fd;
};

export const createExpense = async (data: Record<string, any>, file?: File | null) => {
  const fd = buildFormData(data, file);
  return await request("/api/expenses", { method: "POST", body: fd }, true);
};

export const updateExpense = async (id: number, data: Record<string, any>, file?: File | null) => {
  const fd = buildFormData(data, file);
  return await request(`/api/expenses/${id}`, { method: "PUT", body: fd }, true);
};

export const deleteExpense = async (id: number) =>
  request(`/api/expenses/${id}`, { method: "DELETE" });