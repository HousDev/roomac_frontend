

// components/admin/communications/EmailHistory/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getCommunicationLogs,
  getCommunicationStatistics,
  exportCommunicationLogs,
  resendCommunication,
  deleteCommunicationLog,
  type CommunicationLog,
} from "@/lib/communicationLogApi";
import { AlertCircle, CheckCircle, ChevronRight, Clock, FileText, Filter, Trash2, X } from "lucide-react";
import * as XLSX from 'xlsx';
import { useRouter, usePathname } from "next/navigation";
import { CommunicationTabs } from "@/components/admin/communications/CommunicationTabs";


import Swal from 'sweetalert2';
// ─────────────────────────────────────────────────────────────────────────────
// THEME CONSTANTS (matching Category Mapping Form)
// ─────────────────────────────────────────────────────────────────────────────
const colors = {
  primary: {
    from: "#1A2B6D",
    to: "#3B5BDB",
  },
  bg: "#F2F4F8",
  surface: "#FFFFFF",
  border: "#E4E8F0",
  borderSub: "#EEF0F5",
  text: "#1A2340",
  textSub: "#6B7A99",
  textMute: "#9BA5BF",
  blue: "#185FA5",
  blueBg: "#E6F1FB",
  green: "#0F6E56",
  greenBg: "#E1F5EE",
  greenLine: "#1D9E75",
  red: "#A32D2D",
  redBg: "#FCEBEB",
  redLine: "#E24B4A",
  amber: "#854F0B",
  amberBg: "#FAEEDA",
  orange: "#E8601A",
  slate: "#64748B",
  slateBg: "#F1F5F9",
};

const AVATAR_COLORS = [
  { bg: "#E6F1FB", c: "#185FA5" },
  { bg: "#E1F5EE", c: "#0F6E56" },
  { bg: "#EEEDFE", c: "#3C3489" },
  { bg: "#FAEEDA", c: "#854F0B" },
  { bg: "#FCEBEB", c: "#A32D2D" },
  { bg: "#EAF3DE", c: "#3B6D11" },
  { bg: "#FAECE7", c: "#993C1D" },
  { bg: "#FBEAF0", c: "#993556" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  (name || "U")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getAvatar = (id: number) => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];

const trunc = (str: string | null, n: number) => {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "…" : str;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Excel export using CSV with BOM
const exportToExcel = (logs: CommunicationLog[], filename = "communication_logs") => {
  const rows = logs.map((row) => ({
    "ID": row.id,
    "Recipient Name": row.recipient_name || "",
    "Recipient Email": row.recipient_email || "",
    "Recipient Phone": row.recipient_phone || "",
    "Subject": row.subject || "",
    "Type": row.communication_type || "",
    "Status": row.status || "",
    "Channel": row.channel || "",
    "Sent At": row.sent_at || "",
    "Created At": row.created_at || "",
    "Retries": row.retries,
    "Template": row.template_name || "",
    "Property": row.property_name || "",
    "Tenant": row.tenant_name || "",
    "Error": row.error_message || "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Logs");
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// ─────────────────────────────────────────────────────────────────────────────
// SWEET ALERT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// SweetAlert2 bulk delete confirmation — styled like image 6
const confirmBulkDelete = async (count: number): Promise<boolean> => {
  const result = await Swal.fire({
    html: `
      <div style="text-align:center;padding:12px 0 4px">
        <div style="width:64px;height:64px;border-radius:50%;border:3px solid #E8601A;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
          <span style="font-size:28px;color:#E8601A;font-weight:700;line-height:1">!</span>
        </div>
        <div style="font-size:18px;font-weight:700;color:#1A2340;margin-bottom:10px">Are you sure?</div>
        <p style="color:#6B7A99;font-size:13px;line-height:1.6;margin:0">
          You are about to delete <strong style="color:#1A2340">${count} communication log${count > 1 ? "s" : ""}</strong>.<br/>
          This action <strong style="color:#A32D2D">cannot be undone!</strong>
        </p>
      </div>`,
    showCancelButton: true,
    confirmButtonText: `Yes, delete ${count} record${count > 1 ? "s" : ""}!`,
    cancelButtonText: "Cancel",
    customClass: {
      popup: "swal-custom-popup",
      confirmButton: "swal-confirm-btn",
      cancelButton: "swal-cancel-btn",
    },
    buttonsStyling: false,
    width: 380,
  });
  return result.isConfirmed;
};

// Single delete confirmation — same style
const confirmSingleDelete = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete 1 communication log. This action cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    background: '#fff',
    backdrop: `rgba(0,0,0,0.4)`,
    width: '400px',
    padding: '1.5rem',
    customClass: {
      popup: 'rounded-xl shadow-2xl',
      title: 'text-lg font-bold text-gray-800',
      htmlContainer: 'text-sm text-gray-600 my-2',
      confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
      cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
      actions: 'flex justify-center gap-2 mt-4'
    },
    buttonsStyling: false,
  });
  return result.isConfirmed;
};

// Resend confirmation with SweetAlert
const confirmResend = async (): Promise<boolean> => {
  if (typeof Swal === "undefined") {
    return window.confirm("Are you sure you want to resend this communication?");
  }
  const result = await Swal.fire({
    title: `<span style="font-size:18px;font-weight:700;color:#1A2340">Resend Communication?</span>`,
    html: `
      <div style="text-align:center;padding:4px 0">
        <p style="color:#6B7A99;font-size:13px;line-height:1.6;margin:0">
          This will attempt to resend the communication to the recipient.
        </p>
      </div>`,
    showCancelButton: true,
    confirmButtonText: "Yes, Resend",
    cancelButtonText: "Cancel",
    customClass: {
      popup: "swal-custom-popup",
      confirmButton: "swal-confirm-btn",
      cancelButton: "swal-cancel-btn",
    },
    buttonsStyling: false,
    width: 360,
  });
  return result.isConfirmed;
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS (Tailwind + icons)
// ─────────────────────────────────────────────────────────────────────────────
function Badge({ variant = "success", children }: { variant?: string; children: React.ReactNode }) {
  const styles: Record<string, { bg: string; text: string }> = {
    success: { bg: colors.greenBg, text: colors.green },
    failed: { bg: colors.redBg, text: colors.red },
    pending: { bg: colors.amberBg, text: colors.amber },
    sent: { bg: colors.greenBg, text: colors.green },
    delivered: { bg: colors.greenBg, text: colors.green },
  };
  const s = styles[variant] || styles.success;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {children}
    </span>
  );
}

function MiniBar({ pct, color: barColor = colors.greenLine }: { pct: number; color?: string }) {
  return (
    <div className="h-1 rounded-sm overflow-hidden w-full mt-1" style={{ backgroundColor: colors.border }}>
      <div className="h-full rounded-sm transition-all duration-400" style={{ width: `${pct}%`, backgroundColor: barColor }} />
    </div>
  );
}

function Avatar({ name, id }: { name: string; id: number }) {
  const av = getAvatar(id);
  return (
    <span
      className="w-7 h-7 rounded-full inline-flex items-center justify-center text-[9px] font-bold shrink-0 mr-2"
      style={{ backgroundColor: av.bg, color: av.c }}
    >
      {getInitials(name)}
    </span>
  );
}

function StatCard({
  num,
  label,
  pct,
  barColor,
  textColor,
}: {
  num: number;
  label: string;
  pct?: number;
  barColor?: string;
  textColor?: string;
}) {
  return (
    <div className="bg-white border border-[#E4E8F0] rounded-lg p-2.5 flex-1 min-w-0 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-[#6B7A99] mb-0.5 whitespace-nowrap">{label}</div>
          <div className="text-xl font-bold leading-tight" style={{ color: textColor || colors.text }}>
            {num.toLocaleString()}
          </div>
        </div>
      </div>
      {pct !== undefined && <MiniBar pct={pct} color={barColor} />}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  count,
  activeStyle,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  activeStyle: any;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 transition-all font-inherit border whitespace-nowrap ${
        active ? "" : "bg-[#F2F4F8] text-[#6B7A99] border-[#E4E8F0]"
      }`}
      style={active ? activeStyle : undefined}
    >
      {label}
      {count !== undefined && (
        <span
          className={`rounded-full text-[10px] px-1 font-semibold ${
            active ? "bg-white/35" : "bg-[#E4E8F0] text-[#6B7A99]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ColumnSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative flex items-center">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-1.5 py-1 pr-6 text-[10px] border border-[#E4E8F0] rounded-md bg-[#FAFBFE] text-[#1A2340] outline-none font-inherit"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-1 border-none bg-transparent text-[#9BA5BF] cursor-pointer text-xs leading-none p-0"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER SIDEBAR (Tailwind version)
// ─────────────────────────────────────────────────────────────────────────────
interface FilterState {
  status: string;
  channel: string;
  communicationType: string;
  hasRetries: boolean;
   dateFrom: string;  // ← add
  dateTo: string;
  ignoreDateFilter: boolean;
  
}

function FilterSidebar({
  open,
  onClose,
  filters,
  onApply,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onReset: () => void;
}) {
  const [local, setLocal] = useState<FilterState>(filters);
  useEffect(() => {
    setLocal(filters);
  }, [filters, open]);

const set = (k: keyof FilterState, v: any) => {
  const updated = { ...local, [k]: v };
  setLocal(updated);
  onApply(updated);  // ← fires immediately, triggers loadLogs
};

  const selectClasses =
    "w-full px-2.5 py-1.5 border border-[#E4E8F0] rounded-md bg-white text-xs text-[#1A2340] outline-none cursor-pointer font-inherit";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/35 z-[199] transition-opacity duration-250 backdrop-blur-sm ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[min(340px,90vw)] bg-white shadow-[-4px_0_24px_rgba(26,35,64,0.12)] z-[200] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E8F0] bg-gradient-to-r from-[#1A2B6D] to-[#3B5BDB] text-white">
          <div >
            <div className="text-sm font-bold text-white">Filter Logs</div>
            <div className="text-[10px] text-white mt-0.5">Narrow down results</div>
          </div>
          <button onClick={onClose} className="border-none bg-transparent cursor-pointer text-xl text-[#9BA5BF] leading-none">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-3.5">
            <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Status</label>
            <select value={local.status} onChange={(e) => set("status", e.target.value)} className={selectClasses}>
              <option value="">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="mb-3.5">
            <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Channel</label>
            <select value={local.channel} onChange={(e) => set("channel", e.target.value)} className={selectClasses}>
              <option value="">All Channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div className="mb-3.5">
            <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">
              Communication Type
            </label>
            <select
              value={local.communicationType}
              onChange={(e) => set("communicationType", e.target.value)}
              className={selectClasses}
            >
              <option value="">All Types</option>
              <option value="rent_reminder">Rent Reminder</option>
              <option value="maintenance_update">Maintenance Update</option>
              <option value="notice">Notice</option>
              <option value="welcome">Welcome</option>
              <option value="credentials">Credentials</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-3.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={local.hasRetries}
                onChange={(e) => set("hasRetries", e.target.checked)}
                className="w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-xs text-[#1A2340]">Show only records with retries</span>
            </label>
          </div>




{!local.ignoreDateFilter && (
  <>
    <div className="mb-3.5">
      <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Date From</label>
      <input type="date" value={local.dateFrom} onChange={(e) => set("dateFrom", e.target.value)}
        className="w-full px-2.5 py-1.5 border border-[#E4E8F0] rounded-md bg-white text-xs text-[#1A2340] outline-none font-inherit" />
    </div>
    <div className="mb-3.5">
      <label className="block text-[10px] font-bold text-[#9BA5BF] uppercase tracking-wide mb-1">Date To</label>
      <input type="date" value={local.dateTo} onChange={(e) => set("dateTo", e.target.value)}
        className="w-full px-2.5 py-1.5 border border-[#E4E8F0] rounded-md bg-white text-xs text-[#1A2340] outline-none font-inherit" />
    </div>
  </>
)}

<div className="mb-3.5">
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={local.ignoreDateFilter}
      onChange={(e) => set("ignoreDateFilter", e.target.checked)}
      className="w-3.5 h-3.5 cursor-pointer"
    />
    <span className="text-xs text-[#1A2340]">Ignore date filter</span>
  </label>
</div>
        </div>


        <div className="p-4 border-t border-[#E4E8F0] flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 py-2 border border-[#E4E8F0] rounded-md bg-[#F2F4F8] text-[#6B7A99] text-xs font-semibold cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={() => {
              onApply(local);
              onClose();
            }}
            className="flex-[2] py-2 rounded-md text-xs font-semibold cursor-pointer text-white"
            style={{ background: `linear-gradient(135deg, ${colors.primary.from}, ${colors.primary.to})` }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPANDED ROW (Desktop)
// ─────────────────────────────────────────────────────────────────────────────
function ExpandedRow({ row }: { row: CommunicationLog }) {
  const isOk = row.status === "sent" || row.status === "delivered";
  return (
    <tr>
      <td colSpan={11} className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 p-3.5 bg-[#F8F9FC] border-t border-[#E4E8F0]">
          <div>
            <div className="text-[9px] font-bold text-[#6B7A99] uppercase tracking-wide mb-1.5">Delivery Timeline</div>
            <div className="text-xs text-[#1A2340] space-y-1">
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Sent</span> {formatDate(row.sent_at)}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Delivered</span>{" "}
                <span className={isOk ? "text-[#0F6E56]" : "text-[#A32D2D]"}>
                  {formatDate((row as any).delivered_at) || formatDate(row.sent_at)}
                </span>
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Created</span> {formatDate(row.created_at)}
              </div>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-[#6B7A99] uppercase tracking-wide mb-1.5">Contact Info</div>
            <div className="text-xs text-[#1A2340] space-y-1">
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Name</span> {row.recipient_name || "—"}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Email</span> {row.recipient_email}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Phone</span> {row.recipient_phone || "—"}
              </div>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-[#6B7A99] uppercase tracking-wide mb-1.5">Details</div>
            <div className="text-xs text-[#1A2340] space-y-1">
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Retries</span> {row.retries}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Template</span> {row.template_name || "—"}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Property</span> {row.property_name || "—"}
              </div>
              <div>
                <span className="text-[#6B7A99] w-16 inline-block">Tenant</span> {row.tenant_name || "—"}
              </div>
            </div>
            {row.status === "failed" && row.error_message && (
              <div className="mt-2 p-2 rounded-md text-xs text-[#A32D2D]" style={{ backgroundColor: colors.redBg }}>
                <strong>Error:</strong> {row.error_message}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE ROW (Desktop & Mobile responsive)
// ─────────────────────────────────────────────────────────────────────────────
function EmailRow({
  row,
  isExpanded,
  onToggle,
  onResend,
  onDelete,
  isSelected,
  onSelect,
}: {
  row: CommunicationLog;
  isExpanded: boolean;
  onToggle: () => void;
  onResend: (id: number) => void;
  onDelete: (id: number) => void;
  isSelected: boolean;
  onSelect: (id: number, checked: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const statusBadge = {
    sent: <Badge variant="success">Sent</Badge>,
    delivered: <Badge variant="success">Delivered</Badge>,
    failed: <Badge variant="failed">Failed</Badge>,
    pending: <Badge variant="pending">Pending</Badge>,
  }[row.status] || <Badge variant="pending">{row.status}</Badge>;

  const remarkText = row.error_message || row.subject || "—";
  const remarkColor =
    row.status === "failed" ? colors.red : row.status === "pending" ? colors.amber : colors.textSub;

  const bgClass = isSelected
    ? "bg-[#E6F1FB]"
    : hovered || isExpanded
    ? "bg-[#F5F7FB]"
    : "bg-transparent";

  return (
    <>
      <tr
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="cursor-pointer border-b border-[#EEF0F5]"
      >
        <td className={`${bgClass} px-2 py-2 align-middle w-7 text-center`} onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(row.id, e.target.checked)}
            className="w-3.5 h-3.5 cursor-pointer"
          />
        </td>
       <td className={`${bgClass} px-1 py-2 align-middle w-7 text-center`}>
  <ChevronRight
    size={12}
    className={`inline-block text-[#9BA5BF] transition-transform ${
      isExpanded ? "rotate-90" : "rotate-0"
    }`}
  />
</td>
        <td className={`${bgClass} px-3 py-2 align-middle max-w-[150px]`}>
          <div className="flex items-center">
            <Avatar name={row.recipient_name || row.recipient_email} id={row.id} />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#1A2340] truncate">{row.recipient_name || "—"}</div>
              <div className="text-[10px] text-[#6B7A99] truncate">{row.recipient_email}</div>
            </div>
          </div>
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-xs text-[#1A2340] max-w-[160px]`}>
          <span title={row.subject || ""}>{trunc(row.subject, 30) || "—"}</span>
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-xs text-[#6B7A99] whitespace-nowrap`}>
          {row.communication_type?.replace(/_/g, " ") || "—"}
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle whitespace-nowrap`}>{statusBadge}</td>
        <td className={`${bgClass} px-3 py-2 align-middle text-center text-xs`}>
          <span className="text-[10px] text-[#6B7A99]">{row.channel}</span>
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-xs text-[#6B7A99] whitespace-nowrap`}>
          {formatDate(row.sent_at)}
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-center`}>
          {row.retries > 0 ? <Badge variant="failed">{row.retries}x</Badge> : <span className="text-[10px] text-[#9BA5BF]">0</span>}
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-[10px] max-w-[140px]`} style={{ color: remarkColor }}>
          <span title={remarkText}>{trunc(remarkText, 32)}</span>
        </td>
        <td className={`${bgClass} px-3 py-2 align-middle text-center whitespace-nowrap`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResend(row.id);
            }}
            disabled={row.status !== "failed"}
            className={`text-[10px] px-2 py-1 rounded-md border mr-1.5 font-inherit ${
              row.status === "failed"
                ? "border-[#A32D2D] text-[#A32D2D] cursor-pointer"
                : "border-[#E4E8F0] text-[#9BA5BF] cursor-not-allowed"
            } bg-none`}
          >
            Retry
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.id);
            }}
            className="text-[10px] px-2 py-1 rounded-md border border-[#E4E8F0] text-[#9BA5BF] cursor-pointer bg-none font-inherit"
          >
            Delete
          </button>
        </td>
      </tr>
      {isExpanded && <ExpandedRow row={row} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_FILTERS: FilterState = {
  status: "",
  channel: "",
  communicationType: "",
  hasRetries: false,
  dateFrom: "", dateTo: "",
  ignoreDateFilter: false,
};

export default function EmailHistory() {
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [colSearch, setColSearch] = useState({
    recipient: "",
    subject: "",
    type: "",
    channel: "",
    sentAt: "",
    remark: "",
  });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

const [pageSize, setPageSize] = useState(10);

  // Client-side filtering: combine main search and column searches
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Main search filter (name, email, subject)
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          (row.recipient_name && row.recipient_name.toLowerCase().includes(term)) ||
          (row.recipient_email && row.recipient_email.toLowerCase().includes(term)) ||
          (row.subject && row.subject.toLowerCase().includes(term))
      );
    }

    // Column search filters
    if (colSearch.recipient) {
      const term = colSearch.recipient.toLowerCase();
      filtered = filtered.filter((row) =>
        `${row.recipient_name || ""} ${row.recipient_email || ""}`.toLowerCase().includes(term)
      );
    }
    if (colSearch.subject) {
      const term = colSearch.subject.toLowerCase();
      filtered = filtered.filter((row) => (row.subject || "").toLowerCase().includes(term));
    }
    if (colSearch.type) {
      const term = colSearch.type.toLowerCase();
      filtered = filtered.filter((row) => (row.communication_type || "").toLowerCase().includes(term));
    }
    if (colSearch.channel) {
      const term = colSearch.channel.toLowerCase();
      filtered = filtered.filter((row) => (row.channel || "").toLowerCase().includes(term));
    }
    if (colSearch.sentAt) {
      const term = colSearch.sentAt.toLowerCase();
      filtered = filtered.filter((row) => formatDate(row.sent_at).toLowerCase().includes(term));
    }
    if (colSearch.remark) {
      const term = colSearch.remark.toLowerCase();
      filtered = filtered.filter((row) =>
        `${row.error_message || ""} ${row.subject || ""}`.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [logs, search, colSearch]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build filters — use snake_case keys that match the API interface
      const apiFilters: Record<string, any> = {
        page,
        limit: pageSize,
      };

      if (search) apiFilters.search = search;

      // Status: sidebar filter takes priority over pill filter
      if (sidebarFilters.status) {
        apiFilters.status = sidebarFilters.status;
      } else if (filter !== "all") {
        apiFilters.status = filter;
      }

      // Channel — send as-is (email / whatsapp / sms)
      if (sidebarFilters.channel) {
        apiFilters.channel = sidebarFilters.channel;
      }

      // Communication type — API expects snake_case key
      if (sidebarFilters.communicationType) {
        apiFilters.communication_type = sidebarFilters.communicationType;
      }

      // Retries
      if (sidebarFilters.hasRetries) {
        apiFilters.has_retries = true;
      }

      if (!sidebarFilters.ignoreDateFilter) {
  if (sidebarFilters.dateFrom) apiFilters.dateFrom = sidebarFilters.dateFrom;
  if (sidebarFilters.dateTo) apiFilters.dateTo = sidebarFilters.dateTo;
}

      

      const response = await getCommunicationLogs(apiFilters);
      if (response.success) {
        setLogs(response.data);
      } else {
        setError("Failed to load logs");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, search, filter, sidebarFilters, pageSize]);

  const loadStats = useCallback(async () => {
    try {
      const response = await getCommunicationStatistics();
      if (response.success) {
        setStats({
          total: response.data.total || 0,
          sent: response.data.sent || 0,
          failed: response.data.failed || 0,
          pending: response.data.pending || 0,
        });
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [loadLogs, loadStats]);

  const handleResend = async (id: number) => {
    const confirmed = await confirmResend();
    if (!confirmed) return;
    try {
      await resendCommunication(id);
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Resent!",
          text: "Communication has been resent successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      } else {
        alert("Resent successfully!");
      }
      loadLogs();
    } catch (err: any) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Error!",
          text: err.message || "Failed to resend",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      } else {
        alert(err.message || "Failed to resend");
      }
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmSingleDelete();
    if (!confirmed) return;
    try {
      await deleteCommunicationLog(id);
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Deleted!",
          text: "Log deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      }
      loadLogs();
      loadStats();
    } catch (err: any) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Error!",
          text: err.message || "Failed to delete",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      } else {
        alert(err.message || "Failed to delete");
      }
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    const confirmed = await confirmBulkDelete(count);
    if (!confirmed) return;

    setBulkDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteCommunicationLog(id)));
      setSelectedIds(new Set());
      loadLogs();
      loadStats();
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Deleted!",
          text: `${count} record${count > 1 ? "s" : ""} deleted successfully.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      }
    } catch (err: any) {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Error!",
          text: err.message || "Bulk delete failed",
          icon: "error",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal-custom-popup" },
        });
      } else {
        alert(err.message || "Bulk delete failed");
      }
    } finally {
      setBulkDeleting(false);
    }
  };

 const handleExport = async () => {
  setExporting(true);
  try {
    exportToExcel(logs, "communication_logs");
  } catch (err: any) {
    alert(err.message || "Export failed");
  } finally {
    setExporting(false);
  }
};

  const handleFilter = (f: string) => {
    setFilter(f);
    setPage(1);
    setExpandedId(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    setExpandedId(null);
  };

  const toggleExpand = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

  const handleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filteredLogs.map((r) => r.id)));
    else setSelectedIds(new Set());
  };

  const allSelected = filteredLogs.length > 0 && filteredLogs.every((r) => selectedIds.has(r.id));
  const someSelected = selectedIds.size > 0;
  const hasActiveSidebarFilters = Object.values(sidebarFilters).some((v) => v !== "" && v !== false);
  const totalPages = Math.ceil(stats.total / pageSize) || 1;
  const safePage = Math.min(page, totalPages);

  const pills = [
    {
      key: "all",
      label: "All",
      activeStyle: { background: colors.blueBg, color: colors.blue, border: `0.5px solid ${colors.blue}` },
      count: stats.total,
    },
    {
      key: "sent",
      label: "Sent",
      activeStyle: { background: colors.greenBg, color: colors.green, border: `0.5px solid ${colors.green}` },
      count: stats.sent,
    },
    {
      key: "failed",
      label: "Failed",
      activeStyle: { background: colors.redBg, color: colors.red, border: `0.5px solid ${colors.red}` },
      count: stats.failed,
    },
    {
      key: "pending",
      label: "Pending",
      activeStyle: { background: colors.amberBg, color: colors.amber, border: `0.5px solid ${colors.amber}` },
      count: stats.pending,
    },
  ];

  // Reduce table height when bulk action bar is visible
const tableMaxHeight = someSelected ? "max-h-[330px] sm:max-h-[420px]" : "max-h-[380px] sm:max-h-[420px]";
  return (
    <>
      <style>{`
        .swal-custom-popup { border-radius: 14px !important; font-family: 'DM Sans', 'Segoe UI', sans-serif !important; padding: 28px 24px 24px !important; }
        .swal-confirm-btn { background: #A32D2D !important; color: #fff !important; border: none !important; border-radius: 8px !important; padding: 10px 22px !important; font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important; margin: 0 5px !important; }
        .swal-cancel-btn { background: #4B5563 !important; color: #fff !important; border: none !important; border-radius: 8px !important; padding: 10px 22px !important; font-size: 13px !important; font-weight: 600 !important; cursor: pointer !important; margin: 0 5px !important; }
        .swal2-actions { gap: 8px !important; margin-top: 20px !important; }
      `}</style>

      <FilterSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filters={sidebarFilters}
        onApply={(f) => {
          setSidebarFilters(f);
          setPage(1);
          setExpandedId(null);
        }}
        onReset={() => {
          setSidebarFilters(DEFAULT_FILTERS);
          setPage(1);
        }}
      />

      <div className="font-['DM Sans','Segoe UI',sans-serif] p-0 md:p-0">
        {/* Header Buttons */}
      <div className="flex flex-wrap items-center  gap-2 mb-4 -mt-4 justify-end">
    {/* <CommunicationTabs /> */}
    <div className="flex gap-2 justify-end">
       <button
    onClick={() => setSidebarOpen(true)}
    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold border flex items-center gap-1 ${
        hasActiveSidebarFilters
            ? "bg-[#E6F1FB] text-[#185FA5] border-[#185FA5]"
            : "text-white border-transparent"
    }`}
    style={
        !hasActiveSidebarFilters
            ? {
                  background:
                      "linear-gradient(to right, #0A1F5C, #123A9A, #1E4ED8)",
                  boxShadow: "0 3px 10px rgba(30,78,216,0.3)",
              }
            : {}
    }
>
    <Filter size={14} />
    Filters {hasActiveSidebarFilters && "●"}
</button>
        <button
            onClick={handleExport}
            disabled={exporting}
            className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${colors.primary.from}, ${colors.primary.to})` }}
        >
            {exporting ? "Exporting..." : "Export Excel"}
        </button>
    </div>
</div>

        {/* Stat Cards – Gradient UI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-4  md:-mt-2 sticky top-0 z-10">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Total Communications</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-600">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Sent / Delivered</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">{stats.sent}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-green-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
              <MiniBar pct={stats.total ? Math.round(stats.sent / stats.total * 100) : 0} color={colors.greenLine} />

          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Failed</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">{stats.failed}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-red-600">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
            <MiniBar pct={stats.total ? Math.round(stats.failed / stats.total * 100) : 0} color={colors.redLine} />

          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border-0 shadow-sm p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Pending</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">{stats.pending}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-yellow-600">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search + Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
       
          {pills.map((p) => (
            <FilterPill
              key={p.key}
              label={p.label}
              count={p.count}
              active={filter === p.key}
              activeStyle={p.activeStyle}
              onClick={() => handleFilter(p.key)}
            />
          ))}
        </div>

        {/* Bulk Action Bar */}
       {/* Bulk Action Bar */}
{someSelected && (
  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg mb-2">
    <span className="text-xs font-semibold text-red-700">
      {selectedIds.size} selected
    </span>
    <button
      onClick={handleBulkDelete}
      disabled={bulkDeleting}
      className="h-7 text-[10px] bg-red-600 hover:bg-red-700 text-white px-2.5 ml-2 rounded-md disabled:opacity-50"
    >
      <Trash2 className="h-3 w-3 inline mr-1" />
      Delete Selected
    </button>
    <button
      onClick={() => setSelectedIds(new Set())}
      className="h-7 text-[10px] text-slate-500 ml-auto hover:bg-slate-100 px-2 rounded-md"
    >
      <X className="h-3 w-3 inline mr-1" />
      Clear
    </button>
  </div>
)}

        {/* Table */}
        <div className="bg-white border border-[#E4E8F0] rounded-xl ">
          {/* Dynamic max-height: smaller when bulk bar is visible */}
          <div className={`overflow-x-auto overflow-y-auto ${tableMaxHeight} transition-all duration-200`}>
            <table className="w-full border-collapse min-w-[960px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#F8F9FC] border-b border-[#E4E8F0]">
                  <th className="px-2 py-2 w-9">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="w-7" />
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Recipient</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Subject</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Type</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap w-[90px]">Status</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Channel</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Sent At</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap w-[70px]">Retries</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap">Remark</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#6B7A99] whitespace-nowrap w-[120px]">Actions</th>
                </tr>
                <tr className="bg-[#FAFBFE] border-b border-[#E4E8F0]">
                  <td colSpan={2} />
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.recipient}
                      onChange={(v) => setColSearch((p) => ({ ...p, recipient: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.subject}
                      onChange={(v) => setColSearch((p) => ({ ...p, subject: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.type}
                      onChange={(v) => setColSearch((p) => ({ ...p, type: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td />
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.channel}
                      onChange={(v) => setColSearch((p) => ({ ...p, channel: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.sentAt}
                      onChange={(v) => setColSearch((p) => ({ ...p, sentAt: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td />
                  <td className="px-3 py-1">
                    <ColumnSearch
                      value={colSearch.remark}
                      onChange={(v) => setColSearch((p) => ({ ...p, remark: v }))}
                      placeholder="Search…"
                    />
                  </td>
                  <td />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-[#9BA5BF]">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-[#A32D2D]">
                      {error}
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-[#9BA5BF]">
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((row) => (
                    <EmailRow
                      key={row.id}
                      row={row}
                      isExpanded={expandedId === row.id}
                      onToggle={() => toggleExpand(row.id)}
                      onResend={handleResend}
                      onDelete={handleDelete}
                      isSelected={selectedIds.has(row.id)}
                      onSelect={handleSelect}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
        {/* Pagination */}
{!loading && filteredLogs.length > 0 && (
  <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-[#E4E8F0] text-xs text-[#6B7A99] flex-wrap gap-2 sticky bottom-0 bg-white z-10">
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#6B7A99]">
        {`Showing ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, stats.total)} of ${stats.total} records`}
      </span>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-[#9BA5BF]">Rows:</span>
        <select
          value={pageSize === stats.total ? "All" : String(pageSize)}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "All") {
              setPageSize(stats.total || 1);
            } else {
              setPageSize(Number(val));
            }
            setPage(1);
          }}
          className="h-6 text-[10px] border border-[#E4E8F0] rounded-md bg-white px-1 outline-none"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value="All">All</option>
        </select>
      </div>
    </div>
    {totalPages > 1 && (
      <div className="flex gap-1">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-2.5 py-1 border border-[#E4E8F0] rounded-md bg-white disabled:opacity-50 text-xs"
        >
          ‹ Prev
        </button>
        <span className="px-2.5 py-1">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-2.5 py-1 border border-[#E4E8F0] rounded-md bg-white disabled:opacity-50 text-xs"
        >
          Next ›
        </button>
      </div>
    )}
  </div>
)}
        </div>
      </div>
    </>
  );
}