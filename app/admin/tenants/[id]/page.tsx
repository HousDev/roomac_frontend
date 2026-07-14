// app/admin/tenants/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTenantById,
  type Tenant,
  viewDocument,
  getTenantAssignment,
  getTenantPayments,
  getTenantPaymentFormData,
  getPrimaryTenantByCoupleId,
} from "@/lib/tenantApi";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  BedDouble,
  Building2,
  LogOut,
  User,
  Briefcase,
  FileText,
  CreditCard,
  ScrollText,
  Heart,
  History,
  Shield,
  Phone,
  Mail,
  Copy,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  Upload,
  Download,
  Printer,
  Users,
  Banknote,
  CheckCircle2,
  XCircle,
  MapPin,
  Fingerprint,
  BadgeCheck,
  TrendingUp,
  Wallet,
  ReceiptText,
  Lock,
  Bell,
  ExternalLink,
  Layers,
  MoreHorizontal,
  Info,
  Star,
  Home,
  Hash,
  CreditCard as IdCardIcon,
  Share2,
  Camera,
  Eye,
  Bed,
  FileCheck,
  FileWarning,
  CalendarDays,
  RotateCcw,
  ReceiptIndianRupee,
  Building,
  CheckCircle,
  Sparkles,
  IdCard,
  GraduationCap,
  Loader2,
  Store,
  Laptop,
  Landmark,
  BriefcaseBusiness,
  Key,
  EyeOff,
  X,
  AlertTriangle,
  Check,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TenantForm } from "@/components/admin/tenants/tenant-form";

import { getSettings, type SettingsData } from "@/lib/settingsApi";
import * as paymentApi from "@/lib/paymentRecordApi";
import { Badge } from "@/components/ui/badge";
import { request } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ─── Font style (matching ui-sans-serif, system-ui, -apple-system) ────────────
const fontStyle = {
  fontFamily: "ui-sans-serif, system-ui, -apple-system",
};

// ─── Brand colors from Roomac logo ────────────────────────────────────────────
// Primary blue: #1B3FA0, Gold: #F5A623, Dark navy: #0D2567

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = "overview" | "documents" | "payments" | "partner" | "history";

interface PartnerDetails {
  salutation: string;
  full_name: string;
  country_code: string;
  phone: string;
  email: string;
  gender: string;
  date_of_birth: string;
  address: string;
  occupation: string;
  organization: string;
  relationship: string;
  id_proof_type: string;
  id_proof_number: string;
  id_proof_url: string | null;
  address_proof_type: string;
  address_proof_number: string;
  address_proof_url: string | null;
  photo_url: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatINR = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function calcAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  if (isNaN(birth.getTime())) return 0;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const getApiUrl = () =>
  (typeof window !== "undefined" && (window as any).__ENV__?.VITE_API_URL) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "http://localhost:3001";

function resolveUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${getApiUrl()}${url}`;
}

// ─── Shared Print Branding (logo header + watermark) ─────────────────────────
const PRINT_BRAND_STYLE = `
  .brand-header{display:flex;align-items:center;background:#fff;border-bottom:2px solid #e5e7eb;border-radius:12px 12px 0 0;padding:16px 20px;margin-bottom:20px}
  .brand-logo-wrap{width:120px;flex-shrink:0;display:flex;align-items:center;justify-content:flex-start}
  .brand-logo{max-height:52px;width:auto;object-fit:contain}
  .brand-center{flex:1;text-align:center;padding:0 12px}
  .brand-name{font-size:22px;font-weight:700;color:#1e293b;letter-spacing:-0.5px}
  .brand-sub{font-size:10px;font-weight:500;color:#4b5563;text-transform:uppercase;letter-spacing:1px;margin-top:2px}
  .brand-right{width:120px;flex-shrink:0;text-align:right;font-size:9px;color:#6c7a8a;line-height:1.6}
  .brand-right .label{font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;display:block}
.watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-25deg);
  font-size:120px;font-weight:900;color:rgba(27,63,160,0.09);white-space:nowrap;
  pointer-events:none;user-select:none;z-index:-1;letter-spacing:4px}
    @media print { .watermark{ -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
`;

function buildBrandHeaderHTML(orgLogo: string, orgName: string, subtitle: string) {
  return `<div class="brand-header">
    <div class="brand-logo-wrap">${orgLogo ? `<img class="brand-logo" src="${orgLogo}" alt="logo" onerror="this.style.display='none'"/>` : ""}</div>
    <div class="brand-center">
      <div class="brand-name">${orgName}</div>
      <div class="brand-sub">${subtitle}</div>
    </div>
    <div class="brand-right">
      <span class="label">Report Date</span>
      ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
    </div>
  </div>`;
}

// ✅ Watermark is always the site NAME as text — never the logo image.
function buildWatermarkHTML(orgLogo: string, orgName: string) {
  const firstWord = orgName?.split(" ")[0] || "ROOMAC";
  return `<div class="watermark">${firstWord}</div>`;
}
// ─── Primitives ───────────────────────────────────────────────────────────────
function BadgePill({ children, variant = "gray" }: { children: React.ReactNode; variant?: string }) {
  const v: Record<string, string> = {
    green:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    red:    "bg-red-50    text-red-600    border-red-200",
    amber:  "bg-amber-50  text-amber-700  border-amber-200",
    blue:   "bg-blue-50   text-blue-700   border-blue-200",
    gray:   "bg-gray-100  text-gray-600   border-gray-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    teal:   "bg-teal-50   text-teal-700   border-teal-200",
    rose:   "bg-rose-50   text-rose-700   border-rose-200",
    gold:   "bg-amber-50  text-amber-600  border-amber-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${v[variant] ?? v.gray}`}>
      {children}
    </span>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap flex-shrink-0">{label}</span>
      <div className={`text-xs font-semibold text-gray-800 text-right ${mono ? "font-mono" : ""}`} style={fontStyle}>
        {value ?? <span className="text-gray-300 font-normal">—</span>}
      </div>
    </div>
  );
}

function Section({ title, icon, accent = "bg-[#1B3FA0]", children, className = "" }: {
  title: string; icon: React.ReactNode; accent?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
        <div className={`w-5 h-5 rounded-md ${accent} flex items-center justify-center text-white flex-shrink-0`}>{icon}</div>
        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>{title}</span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

// ─── KV Row (inline label - value) ───────────────────────────────────────────
function KVRow({ label, value, mono = false, wide = false }: { label: string; value: React.ReactNode; mono?: boolean; wide?: boolean }) {
  return (
    <div className={`flex items-baseline gap-2 ${wide ? "col-span-2" : ""}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap flex-shrink-0" style={fontStyle}>{label} —</span>
      <span className={`text-xs font-medium text-gray-900 ${mono ? "font-mono" : ""}`} style={fontStyle}>{value ?? <span className="text-gray-300">—</span>}</span>
    </div>
  );
}

// ─── Document Card ────────────────────────────────────────────────────────────
const DocCard = ({
  title,
  type,
  number,
  status,
  url,
  onView,
  onUpload,
  accent,
}: {
  title: string;
  type?: string;
  number?: string;
  status: "Uploaded" | "Not Uploaded";
  url?: string;
  onView: (url: string) => void;
  onUpload: () => void;
  accent: string;
}) => {
  const isUploaded = status === "Uploaded";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
      {/* Top: icon + title/type/number + status badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-8 h-8 rounded-lg ${accent} flex items-center justify-center text-white flex-shrink-0`}>
            <FileText size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{title}</p>
            {type && <p className="text-[9px] text-gray-500 truncate">{type}</p>}
            {number && <p className="text-[9px] text-gray-500 truncate">{number}</p>}
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-[9px] px-2 py-0.5 whitespace-nowrap ${
            isUploaded
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-gray-50 text-gray-500 border-gray-200"
          }`}
        >
          {status}
        </Badge>
      </div>

      {/* Bottom: action buttons in a single row */}
      <div className="flex items-center justify-end gap-2 mt-1">
        {isUploaded && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] px-3"
            onClick={() => onView(url!)}
          >
            View
          </Button>
        )}
        <Button
          variant={isUploaded ? "outline" : "default"}
          size="sm"
          className="h-7 text-[10px] px-3"
          onClick={onUpload}
        >
          {isUploaded ? "Replace" : "Upload"}
        </Button>
      </div>
    </div>
  );
};

// ─── Payment Stat Card ────────────────────────────────────────────────────────
function PaymentCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className={`${bg} border-0 shadow-sm`}>
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
            <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
          </div>
          <div className={`p-1.5 rounded-lg ${color}`}>
            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="h-16 bg-white border-b border-slate-200" />
      <div className="max-w-9xl mx-auto px-2 sm:px-2 py-2 space-y-3">
        <div className="h-16 bg-white/20 rounded-xl animate-pulse" />
        <div className="bg-white rounded-xl h-96 animate-pulse" />
      </div>
    </div>
  );
}


// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({
  tenant, assignment, payments, paymentSummary, onIdCard, onEdit,
  copiedEmail, copiedPhone, onCopyEmail, onCopyPhone,
  orgLogo, orgName,
}: {
  tenant: any; assignment: any; paymentSummary: any; onIdCard: () => void; onEdit: () => void;
  copiedEmail: boolean; copiedPhone: boolean; payments: any[];
  onCopyEmail: () => void; onCopyPhone: () => void;
  orgLogo: string; orgName: string;
}) {
  // ✅ FIX: Determine if tenant is actually vacated (not just has vacate history)
  const hasVacateHistory = tenant.vacate_records?.length > 0;
  const hasActiveAssignment = assignment !== null && !assignment?.is_vacated;
  const isActuallyVacated = hasVacateHistory && !hasActiveAssignment && !tenant.is_active;
  
  // ✅ Get the latest vacate record (only for display if actually vacated)
  const vacateRecord = isActuallyVacated ? tenant.vacate_records?.[0] ?? null : null;

  // ✅ Get current stay data from active assignment (PRIORITIZE THIS)
  const currentStay = {
    property: assignment?.property?.name || tenant.assigned_property_name || "Not Assigned",
    room: assignment?.room?.room_number || tenant.assigned_room_number || "—",
    bed: assignment?.bed_number || tenant.assigned_bed_number || "—",
    rent: assignment?.tenant_rent || tenant.monthly_rent || 0,
    checkIn: tenant.check_in_date,
    checkOut: isActuallyVacated ? (vacateRecord?.requested_vacate_date || null) : null,
    isActive: tenant.is_active && hasActiveAssignment,
    securityDeposit: assignment?.security_deposit || tenant.security_deposit || 0,
  };

  // ✅ Previous stay (only relevant when tenant is NOT currently active)
  const previousStay = isActuallyVacated && vacateRecord ? {
  property: vacateRecord.property_name || "—",
  room: vacateRecord.room_number || "—",
  bed: vacateRecord.bed_number || "—",
  sharingType: vacateRecord.sharing_type || "—",
  rent: Number(vacateRecord.rent_amount || 0),
  securityDeposit: Number(vacateRecord.security_deposit_amount || 0),
  checkIn: vacateRecord.stay_check_in_date,
  checkOut: vacateRecord.requested_vacate_date,
  totalPenalty: Number(vacateRecord.total_penalty_amount || 0),
  lockinPenalty: Number(vacateRecord.lockin_penalty_amount || 0),
  noticePenalty: Number(vacateRecord.notice_penalty_amount || 0),
  inspectionPenalty: Number(vacateRecord.inspection_penalty_amount || 0),
  refundAmount: Number(vacateRecord.refundable_amount || 0),
  refundStatus: vacateRecord.status,
  vacateReason: vacateRecord.vacate_reason_value || "—",
} : null;

  const getOccupationIcon = (cat: string) => {
    switch (cat) {
      case "Working Professional": return <BriefcaseBusiness size={11} />;
      case "Student": return <GraduationCap size={11} />;
      case "Business Owner": return <Store size={11} />;
      case "Freelancer / Self-Employed": return <Laptop size={11} />;
      case "Government Employee": return <Landmark size={11} />;
      default: return <Briefcase size={11} />;
    }
  };

  // ✅ FIX: Prioritize current assignment over vacate record for rent
// In OverviewTab, the rentVal is already correct with this logic:
const rentVal = (() => {
  // 1. If tenant has active assignment, use that FIRST
  if (hasActiveAssignment && assignment?.tenant_rent) {
    return formatINR(assignment.tenant_rent);
  }
  // 2. Only use vacate record if actually vacated
  if (isActuallyVacated && vacateRecord?.rent_amount) {
    return formatINR(vacateRecord.rent_amount);
  }
  // 3. Fallback to tenant.monthly_rent
  if (tenant.monthly_rent) {
    return formatINR(tenant.monthly_rent);
  }
  return "N/A";
})();

  // ✅ FIX: Prioritize current assignment over vacate record for room/bed
  const roomVal = (() => {
    // 1. If tenant has active assignment, use that
    if (hasActiveAssignment && assignment) {
      return `Room ${assignment.room?.room_number || "—"} · Bed ${assignment.bed_number || "—"}`;
    }
    // 2. If tenant is actually vacated, use vacate record
    if (isActuallyVacated && vacateRecord) {
      return `Room ${vacateRecord.room_number || "—"} · Bed ${vacateRecord.bed_number || "—"}`;
    }
    // 3. Fallback to tenant fields
    if (tenant.bed_number) {
      return `Room ${tenant.room_number || "—"} · Bed ${tenant.bed_number}`;
    }
    return "Not Assigned";
  })();

  // ─── Security Deposit ──────────────────────────────────────────────────
  const securityDeposit = (() => {
    // 1. If tenant has active assignment, use that
    if (hasActiveAssignment && assignment?.security_deposit) {
      return Number(assignment.security_deposit);
    }
    // 2. If tenant is actually vacated, use vacate record
    if (isActuallyVacated && vacateRecord?.security_deposit_amount) {
      return Number(vacateRecord.security_deposit_amount);
    }
    // 3. Fallback to tenant.security_deposit
    if (tenant.security_deposit) {
      return Number(tenant.security_deposit);
    }
    // 4. Check payment summary
    if (paymentSummary?.security_deposit_info?.total) {
      return Number(paymentSummary.security_deposit_info.total);
    }
    if (paymentSummary?.security_deposit_info?.paid) {
      return Number(paymentSummary.security_deposit_info.paid);
    }
    if (paymentSummary?.vacate_info?.security_deposit) {
      return Number(paymentSummary.vacate_info.security_deposit);
    }
    // 5. Calculate from payments
    const sdPayments = (payments || []).filter((p: any) =>
      p.payment_type === "security_deposit" && (p.status === "paid" || p.status === "approved")
    );
    if (sdPayments.length > 0) {
      return sdPayments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
    }
    return 0;
  })();

  // ─── Couple booking ────────────────────────────────────────────────────
  const isCoupleBooking = tenant.is_couple_booking === true || tenant.is_couple_booking === 1;

  // ─── Profile stat box calculations ────────────────────────────────────
  const staysCount = (() => {
    const pastStays = tenant.vacate_records?.length || 0;
    const hasCurrent = hasActiveAssignment && tenant.is_active;
    return pastStays + (hasCurrent ? 1 : 0);
  })();

  const monthsStayed = (() => {
    if (!tenant.check_in_date) return 0;
    const start = new Date(tenant.check_in_date);
    if (isNaN(start.getTime())) return 0;
    const end = isActuallyVacated && vacateRecord?.requested_vacate_date 
      ? new Date(vacateRecord.requested_vacate_date) 
      : new Date();
    if (isNaN(end.getTime())) return 0;
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) months--;
    return Math.max(0, months);
  })();

const rentPaidTotal = (() => {
    // ✅ Prefer summing from stay_history — it's the backend-computed,
    // partner-merged, per-stay windowed total (same source History tab's
    // "Lifetime Rent" card uses). paymentSummary alone can under-report
    // this for shared stays where payments were recorded under the
    // partner's tenant_id rather than this tenant's own.
    const stayHistory = tenant.stay_history || [];
    if (stayHistory.length > 0) {
      return stayHistory.reduce((sum: number, s: any) => sum + Number(s.totalRentPaid || 0), 0);
    }
    if (isActuallyVacated) return paymentSummary?.total_rent_paid ?? 0;
    return paymentSummary?.total_paid ?? 0;
  })();

  const rentPaidDisplay = (() => {
    const n = Number(rentPaidTotal || 0);
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${Math.round(n / 1000)}k`;
    return `₹${n}`;
  })();

// ─── Print (matches full tenant profile design) ─────────────────────────
const buildOverviewPrintHTML = () => {
  const roomDisplay = (() => {
    if (hasActiveAssignment && assignment) return `Room ${assignment.room?.room_number || "—"} · Bed ${assignment.bed_number || "—"}`;
    if (isActuallyVacated && vacateRecord) return `Room ${vacateRecord.room_number || "—"} · Bed ${vacateRecord.bed_number || "—"}`;
    if (tenant.bed_number) return `Room ${tenant.room_number || "—"} · Bed ${tenant.bed_number}`;
    return "Not Assigned";
  })();

  const rentValDisplay = (() => {
    if (hasActiveAssignment && assignment?.tenant_rent) return formatINR(assignment.tenant_rent);
    if (isActuallyVacated && vacateRecord?.rent_amount) return formatINR(vacateRecord.rent_amount);
    if (tenant.monthly_rent) return formatINR(tenant.monthly_rent);
    return "N/A";
  })();

  const depositPaidDisplay = formatINR(paymentSummary?.security_deposit_info?.paid || 0);
  const lifetimeRentDisplay = formatINR(rentPaidTotal);
  const stayTypeDisplay = isCoupleBooking ? "Couple" : "Single";

  return `<!DOCTYPE html><html><head><title>Tenant Profile · ${tenant.full_name}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;color:#111;font-size:12px;padding:32px;position:relative}
  ${PRINT_BRAND_STYLE}
 .header{display:flex;align-items:center;gap:16px;margin-bottom:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px}
  .avatar{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#60a5fa,#2563eb);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:900;flex-shrink:0}
  .header-info h1{font-size:18px;font-weight:900;margin-bottom:3px;color:#1e293b}
  .header-info .meta{font-size:10px;color:#64748b}
  .badge{display:inline-block;padding:1px 8px;border-radius:12px;font-size:10px;font-weight:700;border:1px solid;margin-left:6px}
  .badge-green{background:#d4edda;color:#155724;border-color:#c3e6cb}
  .stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:20px 0}
  .stat-box{padding:12px;border-radius:8px;text-align:center}
  .stat-box.blue{background:#e6f0ff}
  .stat-box.green{background:#e6ffe6}
  .stat-box.amber{background:#fff9e6}
  .stat-val{font-size:20px;font-weight:900}
  .stat-box.blue .stat-val{color:#004aad}
  .stat-box.green .stat-val{color:#28a745}
  .stat-box.amber .stat-val{color:#d4a000}
  .stat-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#666;margin-top:2px}
  .section{margin-bottom:18px;background:#f8fafc;border-radius:8px;padding:12px 14px;border:1px solid #eef2f7}
.section-title{font-size:10.5px;font-weight:800;color:#1e293b;margin-bottom:10px;
  padding-bottom:6px;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:.08em;
  display:flex;align-items:center;gap:6px}
.section-title::before{content:'';width:3px;height:11px;background:#1B3FA0;border-radius:2px}  .row{display:flex;justify-content:space-between;align-items:baseline;padding:4px 0;border-bottom:1px solid #e2e8f0}
  .row:last-child{border:0}
  .lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#666}
  .val{font-size:11px;font-weight:600;color:#333;text-align:right}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .vacate-box{background:#fee;border:1px solid #f8d7da;border-radius:8px;padding:10px;margin-top:8px}
  .vacate-title{font-size:9px;font-weight:800;color:#dc3545;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
  .vacate-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 16px}
  .footer{margin-top:28px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:10px;color:#999;display:flex;justify-content:space-between}
</style></head><body>
${buildWatermarkHTML(orgLogo, orgName)}
${buildBrandHeaderHTML(orgLogo, orgName, "Tenant Profile")}
<div class="header">
  <div class="avatar">${tenant.full_name?.charAt(0)?.toUpperCase() ?? "?"}</div>
  <div class="header-info">
    <h1>${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name} <span class="badge badge-green">${currentStay.isActive ? "Active" : "Inactive"}</span></h1>
    <div class="meta">ID #${tenant.id} &nbsp;·&nbsp; Member Since ${tenant.check_in_date ? new Date(tenant.check_in_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} &nbsp;·&nbsp; ${currentStay.property || "—"} · ${roomDisplay}</div>
  </div>
</div>

<div class="stats">
  <div class="stat-box blue"><div class="stat-val">${staysCount}</div><div class="stat-lbl">Total Stays</div></div>
  <div class="stat-box green"><div class="stat-val">${lifetimeRentDisplay}</div><div class="stat-lbl">Lifetime Rent</div></div>
  <div class="stat-box amber"><div class="stat-val">${monthsStayed}</div><div class="stat-lbl">Months Stayed</div></div>
</div>

<div class="two-col">
<div>
  <div class="section">
    <div class="section-title">Personal Information</div>
    <div class="row"><span class="lbl">Full Name</span><span class="val">${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}</span></div>
    <div class="row"><span class="lbl">Gender</span><span class="val">${tenant.gender || "—"}</span></div>
    <div class="row"><span class="lbl">Date of Birth</span><span class="val">${tenant.date_of_birth ? `${new Date(tenant.date_of_birth).toLocaleDateString("en-IN")} (${calcAge(tenant.date_of_birth)} yrs)` : "—"}</span></div>
    <div class="row"><span class="lbl">Aadhar</span><span class="val" style="font-family:monospace">${tenant.aadhar_number ?? (tenant.id_proof_type === "Aadhar Card" ? tenant.id_proof_number : null) ?? (tenant.address_proof_type === "Aadhar Card" ? tenant.address_proof_number : null) ?? "—"}</span></div>
    <div class="row"><span class="lbl">PAN</span><span class="val" style="font-family:monospace">${tenant.pan_number ?? (tenant.id_proof_type === "PAN Card" ? tenant.id_proof_number : null) ?? (tenant.address_proof_type === "PAN Card" ? tenant.address_proof_number : null) ?? "—"}</span></div>
  </div>
  <div class="section">
    <div class="section-title">Contact</div>
    <div class="row"><span class="lbl">Email</span><span class="val">${tenant.email || "—"}</span></div>
    <div class="row"><span class="lbl">Phone</span><span class="val">${tenant.country_code || ""} ${tenant.phone || "—"}</span></div>
    <div class="row"><span class="lbl">Address</span><span class="val" style="max-width:200px;text-align:right">${tenant.address || "—"}</span></div>
  </div>
  <div class="section">
    <div class="section-title">Account</div>
    <div class="row"><span class="lbl">Status</span><span class="val">${currentStay.isActive ? "Active" : "Inactive"}</span></div>
    <div class="row"><span class="lbl">Portal Access</span><span class="val">${tenant.portal_access_enabled ? "Enabled" : "Disabled"}</span></div>
    <div class="row"><span class="lbl">Login</span><span class="val">${tenant.has_credentials ? "Configured" : "Not Set"}</span></div>
    ${tenant.credential_email ? `<div class="row"><span class="lbl">Credential Email</span><span class="val">${tenant.credential_email}</span></div>` : ""}
  </div>
</div>
<div>
  <div class="section">
    <div class="section-title">Current Stay</div>
    <div class="row"><span class="lbl">Property</span><span class="val">${currentStay.property || "—"}</span></div>
    <div class="row"><span class="lbl">Room / Bed</span><span class="val">${roomDisplay}</span></div>
    <div class="row"><span class="lbl">Monthly Rent</span><span class="val" style="color:#059669;font-weight:800">${rentValDisplay}</span></div>
    <div class="row"><span class="lbl">Stay Type</span><span class="val">${stayTypeDisplay}</span></div>
    <div class="row"><span class="lbl">Check-in</span><span class="val">${currentStay.checkIn ? new Date(currentStay.checkIn).toLocaleDateString("en-IN") : "—"}</span></div>
    <div class="row"><span class="lbl">Check-out</span><span class="val">${isActuallyVacated && currentStay.checkOut ? new Date(currentStay.checkOut).toLocaleDateString("en-IN") : "—"}</span></div>
    <div class="row"><span class="lbl">Security Deposit</span><span class="val">${formatINR(securityDeposit)}</span></div>
    <div class="row"><span class="lbl">Deposit Paid</span><span class="val">${depositPaidDisplay}</span></div>
    ${isActuallyVacated && vacateRecord ? `<div class="vacate-box">
      <div class="vacate-title">Vacate Details</div>
      <div class="vacate-grid">
        <div><div class="lbl">Penalty</div><div class="val" style="text-align:left">₹${Number(vacateRecord.total_penalty_amount || 0).toLocaleString()}</div></div>
        <div><div class="lbl">Refund</div><div class="val" style="text-align:left;color:#059669">₹${Number(vacateRecord.refundable_amount || 0).toLocaleString()}</div></div>
        <div><div class="lbl">Status</div><div class="val" style="text-align:left">${vacateRecord.status || "—"}</div></div>
        <div><div class="lbl">Reason</div><div class="val" style="text-align:left">${vacateRecord.vacate_reason_value || "—"}</div></div>
      </div>
    </div>` : ""}
  </div>
  <div class="section">
    <div class="section-title">Occupation</div>
    <div class="row"><span class="lbl">Category</span><span class="val">${tenant.occupation_category || "Other"}</span></div>
    <div class="row"><span class="lbl">Occupation</span><span class="val">${tenant.occupation || "—"}</span></div>
    <div class="row"><span class="lbl">Organization</span><span class="val">${tenant.organization || "—"}</span></div>
    <div class="row"><span class="lbl">Work Mode</span><span class="val">${tenant.work_mode ? tenant.work_mode.charAt(0).toUpperCase() + tenant.work_mode.slice(1) : "—"}</span></div>
    <div class="row"><span class="lbl">Shift</span><span class="val">${tenant.shift_timing ? tenant.shift_timing.charAt(0).toUpperCase() + tenant.shift_timing.slice(1) : "—"}</span></div>
  </div>
  <div class="section">
    <div class="section-title">Terms &amp; Conditions</div>
    <div class="row"><span class="lbl">Lock-in Period</span><span class="val">${tenant.lockin_period_months ? `${tenant.lockin_period_months} months` : "Not set"}</span></div>
    <div class="row"><span class="lbl">Lock-in Penalty</span><span class="val">${tenant.lockin_penalty_amount ? (tenant.lockin_penalty_type === "percentage" ? `${tenant.lockin_penalty_amount}% of deposit` : formatINR(tenant.lockin_penalty_amount)) : "—"}</span></div>
    <div class="row"><span class="lbl">Notice Period</span><span class="val">${tenant.notice_period_days ? `${tenant.notice_period_days} days` : "Not set"}</span></div>
    <div class="row"><span class="lbl">Notice Penalty</span><span class="val">${tenant.notice_penalty_amount ? (tenant.notice_penalty_type === "percentage" ? `${tenant.notice_penalty_amount}% of deposit` : formatINR(tenant.notice_penalty_amount)) : "—"}</span></div>
    <div class="row"><span class="lbl">Penalty Applied</span><span class="val">${isActuallyVacated && vacateRecord ? formatINR(vacateRecord.total_penalty_amount || 0) : "₹0"}</span></div>
  </div>
</div>
</div>
<div class="footer"><span>Roomac Co-Living Management System</span><span>Generated ${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</span></div>
</body></html>`;
};

const handlePrintProfile = () => {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(buildOverviewPrintHTML());
  w.document.close();
  w.print();
};

const handlePDFProfile = () => {
  const w = window.open("", "_blank");
  if (!w) return;
  const html = buildOverviewPrintHTML().replace("</style>", `
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    @page { margin: 16mm; size: A4; }
  </style>`);
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 400);
};

  return (
    <div className="space-y-3">
      {/* Action bar */}
      <div className="hidden lg:flex justify-end gap-2 mb-3">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          style={fontStyle}
        >
          <Edit2 size={12} /> Edit Tenant
        </button>
        <button
          onClick={onIdCard}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3FA0] rounded-lg text-[10px] font-bold text-white hover:bg-[#0D2567] transition-colors shadow-sm"
          style={fontStyle}
        >
          <IdCardIcon size={12} /> ID Card
        </button>
        <button
          onClick={handlePrintProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3FA0] border border-gray-200 rounded-lg text-[10px] font-bold text-white hover:bg-blue-800 hover:text-white transition-colors shadow-sm"
        >
          <Printer size={12} /> Print
        </button>
        <button
          onClick={handlePDFProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3FA0] rounded-lg text-[10px] font-bold text-white hover:bg-[#0D2567] transition-colors shadow-sm"
        >
          <Download size={12} /> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {/* Profile card */}
          <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0D2567 0%, #1B3FA0 60%, #0D2567 100%)" }}>
            <div className="px-3 sm:px-4 pt-4 sm:pt-5 pb-3 sm:pb-4 flex flex-col items-center text-center gap-1.5 sm:gap-2">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-[#1B3FA0] flex items-center justify-center text-white font-black text-base sm:text-xl shadow-lg ring-2 ring-[#F5A623]/40">
                  {tenant.photo_url ? (
                    <img src={resolveUrl(tenant.photo_url)} alt={tenant.full_name} className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    tenant.full_name?.charAt(0)?.toUpperCase() ?? "?"
                  )}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-[#0D2567] ${currentStay.isActive ? "bg-emerald-400" : "bg-gray-500"}`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-white leading-tight" style={fontStyle}>
                  {tenant.salutation ? `${tenant.salutation} ` : ""}{tenant.full_name}
                </p>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                  <BadgePill variant={currentStay.isActive ? "green" : "gray"}>{currentStay.isActive ? "Active" : "Inactive"}</BadgePill>
                  <span className="text-[9px] sm:text-[10px] text-blue-300 font-mono">{tenant.id}</span>
                </div>
              </div>
            </div>
            {/* Stat boxes: Stays / Months / Rent Paid */}
            <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
              {[
                { label: "Stays", value: staysCount },
                { label: "Months", value: monthsStayed },
                { label: "Rent Paid", value: rentPaidDisplay },
              ].map(({ label, value }) => (
                <div key={label} className="px-1.5 sm:px-2 py-2 sm:py-2.5 text-center">
                  <p className="text-xs sm:text-sm font-black text-white" style={fontStyle}>{value}</p>
                  <p className="text-[7px] sm:text-[8px] font-bold text-blue-300 uppercase tracking-widest mt-0.5" style={fontStyle}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Account status */}
          <Section title="Account" icon={<BadgeCheck size={11} />} accent="bg-slate-600">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center gap-2 py-1">
                <span
                  className="w-[55px] text-[10px] font-semibold text-gray-400 uppercase shrink-0"
                  style={fontStyle}
                >
                  Status
                </span>
                <BadgePill variant={currentStay.isActive ? "green" : "gray"}>
                  {currentStay.isActive ? "Active" : "Inactive"}
                </BadgePill>
              </div>

              <div className="flex items-center gap-2 py-1">
                <span
                  className="w-[55px] text-[10px] font-semibold text-gray-400 uppercase shrink-0"
                  style={fontStyle}
                >
                  Portal
                </span>
                <BadgePill variant={tenant.portal_access_enabled ? "green" : "amber"}>
                  {tenant.portal_access_enabled ? "Enabled" : "Disabled"}
                </BadgePill>
              </div>

              <div className="flex items-center gap-2 py-1">
                <span
                  className="w-[55px] text-[10px] font-semibold text-gray-400 uppercase shrink-0"
                  style={fontStyle}
                >
                  Login
                </span>
                <BadgePill variant={tenant.has_credentials ? "blue" : "amber"}>
                  {tenant.has_credentials ? "Configured" : "Not Set"}
                </BadgePill>
              </div>

              <div className="flex items-center gap-2 py-1">
                <span
                  className="w-[55px] text-[10px] font-semibold text-gray-400 uppercase shrink-0"
                  style={fontStyle}
                >
                  Check-in
                </span>
                <span className="text-[11px] font-medium text-gray-700">
                  {tenant.check_in_date
                    ? new Date(tenant.check_in_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            </div>

            {tenant.credential_email && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p
                  className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1"
                  style={fontStyle}
                >
                  Credential Email
                </p>
                <p className="text-[10px] font-mono text-gray-600 break-all">
                  {tenant.credential_email}
                </p>
              </div>
            )}
          </Section>

          {/* Emergency contact */}
          <Section title="Emergency Contact" icon={<Heart size={11} />} accent="bg-rose-500">
            {tenant.emergency_contact_name ? (
              <div className="space-y-0">
                <InfoRow label="Name" value={tenant.emergency_contact_name} />
                <InfoRow label="Phone" value={tenant.emergency_contact_phone} />
                <InfoRow label="Relation" value={tenant.emergency_contact_relation} />
                {tenant.emergency_contact_email && <InfoRow label="Email" value={tenant.emergency_contact_email} />}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 py-1 text-center italic" style={fontStyle}>No emergency contact on file</p>
            )}
          </Section>
        </div>

        {/* Right Main */}
        <div className="lg:col-span-2 space-y-3">
          {/* Current Stay — only for active tenants */}
          {currentStay.isActive && (
<div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#1B3FA0] flex items-center justify-center text-white"><Home size={11} /></div>
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Current Stay</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgePill variant={isCoupleBooking ? "rose" : "blue"}>
                  {isCoupleBooking ? <Heart size={9} /> : <User size={9} />}
                  {isCoupleBooking ? "Couple" : "Single"}
                </BadgePill>
                {isActuallyVacated ? (
                  <BadgePill variant="red"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Vacated</BadgePill>
                ) : currentStay.isActive ? (
                  <BadgePill variant="green"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active</BadgePill>
                ) : (
                  <BadgePill variant="gray">Inactive</BadgePill>
                )}
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
              {[
                { label: "Property", value: currentStay.property || "Not Assigned", wide: true },
                { label: "Room / Bed", value: roomVal, wide: false },
                { label: "Monthly Rent", value: <span className="font-black text-emerald-600">{rentVal}</span> },
                { label: "Check-in", value: currentStay.checkIn ? new Date(currentStay.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                { label: isActuallyVacated ? "Check-out" : "Status", value: isActuallyVacated && currentStay.checkOut ? new Date(currentStay.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : <BadgePill variant="green">Active</BadgePill> },
                { label: "Security Deposit", value: <span className="font-black text-amber-600">{formatINR(securityDeposit)}</span> },
                { label: "Lock-in", value: tenant.lockin_period_months ? `${tenant.lockin_period_months} months` : "—" },
                { label: "Notice Period", value: tenant.notice_period_days ? `${tenant.notice_period_days} days` : "—" },
                { label: "Refund", value: isActuallyVacated && vacateRecord ? <span className="font-black text-emerald-600">{formatINR(vacateRecord.refundable_amount || 0)}</span> : "—" },
              ].map(({ label, value, wide }: any) => (
                <div key={label} className={wide ? "col-span-2 sm:col-span-1" : ""}>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" style={fontStyle}>{label}</p>
                  <div className="text-xs font-semibold text-gray-800" style={fontStyle}>{value}</div>
                </div>
              ))}
            </div>
            {isActuallyVacated && vacateRecord && (
              <div className="mx-4 mb-4 bg-red-50 rounded-lg border border-red-100 px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <LogOut size={11} className="text-red-500" />
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider" style={fontStyle}>Vacate Details</span>
                  <BadgePill variant="amber">{vacateRecord.status || "Pending"}</BadgePill>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Penalty</p><p className="text-xs font-bold text-gray-800">₹{Number(vacateRecord.total_penalty_amount || 0).toLocaleString()}</p></div>
                  <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Refund Status</p><p className="text-xs font-bold text-amber-700">{vacateRecord.status || "—"}</p></div>
                  <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Refund Amt</p><p className="text-xs font-bold text-emerald-600">₹{Number(vacateRecord.refundable_amount || 0).toLocaleString()}</p></div>
                  <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Reason</p><p className="text-xs text-gray-700">{vacateRecord.vacate_reason_value || "—"}</p></div>
                </div>
              </div>
            )}
          </div>
            )}

            {/* Previous Stay — only for vacated tenants */}
          {!currentStay.isActive && previousStay && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-gray-500 flex items-center justify-center text-white"><History size={11} /></div>
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Previous Stay</span>
                </div>
                <BadgePill variant="red"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Vacated</BadgePill>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                {[
                  { label: "Property", value: previousStay.property, wide: true },
                  { label: "Room / Bed", value: `Room ${previousStay.room} · Bed ${previousStay.bed}` },
                  { label: "Sharing Type", value: previousStay.sharingType },
                  { label: "Monthly Rent", value: <span className="font-black text-emerald-600">{formatINR(previousStay.rent)}</span> },
                  { label: "Check-in", value: previousStay.checkIn ? new Date(previousStay.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                  { label: "Vacated On", value: previousStay.checkOut ? new Date(previousStay.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                  { label: "Security Deposit", value: <span className="font-black text-amber-600">{formatINR(previousStay.securityDeposit)}</span> },
                  { label: "Penalty Applied", value: <span className="font-black text-red-600">{formatINR(previousStay.totalPenalty)}</span> },
                  { label: "Refund Amount", value: <span className="font-black text-emerald-600">{formatINR(previousStay.refundAmount)}</span> },
                ].map(({ label, value, wide }: any) => (
                  <div key={label} className={wide ? "col-span-2 sm:col-span-1" : ""}>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" style={fontStyle}>{label}</p>
                    <div className="text-xs font-semibold text-gray-800" style={fontStyle}>{value}</div>
                  </div>
                ))}
              </div>
              <div className="mx-4 mb-4 bg-red-50 rounded-lg border border-red-100 px-3 py-2.5">
  <div className="flex items-center gap-2 mb-1.5">
    <LogOut size={11} className="text-red-500" />
    <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider" style={fontStyle}>Vacate Details</span>
    <BadgePill variant="amber">{previousStay.refundStatus || "Pending"}</BadgePill>
  </div>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2.5">
    <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Lock-in Penalty</p><p className="text-xs font-bold text-gray-800">₹{previousStay.lockinPenalty.toLocaleString()}</p></div>
    <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Notice Penalty</p><p className="text-xs font-bold text-gray-800">₹{previousStay.noticePenalty.toLocaleString()}</p></div>
    <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Inspection Penalty</p><p className="text-xs font-bold text-gray-800">₹{previousStay.inspectionPenalty.toLocaleString()}</p></div>
    <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Total Penalty</p><p className="text-xs font-bold text-red-600">₹{previousStay.totalPenalty.toLocaleString()}</p></div>
  </div>
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Refund Status</p><p className="text-xs font-bold text-amber-700">{previousStay.refundStatus || "—"}</p></div>
    <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Refund Amt</p><p className="text-xs font-bold text-emerald-600">₹{previousStay.refundAmount.toLocaleString()}</p></div>
    <div className="col-span-2 sm:col-span-1"><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Reason</p><p className="text-xs text-gray-700">{previousStay.vacateReason}</p></div>
  </div>
</div>
            </div>
          )}
          

          {/* Personal + Contact + Occupation + Terms — 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Section title="Personal" icon={<Fingerprint size={11} />} accent="bg-[#1B3FA0]">
              <div className="space-y-0">
                <InfoRow label="Full Name" value={`${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}`} />
                <InfoRow label="Gender" value={tenant.gender} />
                <InfoRow label="DOB" value={tenant.date_of_birth ? <span>{new Date(tenant.date_of_birth).toLocaleDateString("en-IN")} <BadgePill>{calcAge(tenant.date_of_birth)} yrs</BadgePill></span> : null} />
                <InfoRow label="Aadhar" value={
                  tenant.aadhar_number ?? 
                  (tenant.id_proof_type === "Aadhar Card" ? tenant.id_proof_number : null) ?? 
                  (tenant.address_proof_type === "Aadhar Card" ? tenant.address_proof_number : null) ?? 
                  null
                } mono />
                <InfoRow label="PAN" value={
                  tenant.pan_number ?? 
                  (tenant.id_proof_type === "PAN Card" ? tenant.id_proof_number : null) ?? 
                  (tenant.address_proof_type === "PAN Card" ? tenant.address_proof_number : null) ?? 
                  null
                } mono />
              </div>
            </Section>

            <Section title="Contact" icon={<Phone size={11} />} accent="bg-emerald-600">
              <div className="space-y-2">
                <div className="flex items-center gap-2 py-1 border-b border-gray-50">
                  <Mail size={11} className="text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${tenant.email}`} className="text-[10px] font-semibold text-[#1B3FA0] hover:underline flex-1 truncate">{tenant.email}</a>
                  <button onClick={onCopyEmail} className="p-0.5 rounded hover:bg-gray-100 flex-shrink-0">
                    {copiedEmail ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 py-1 border-b border-gray-50">
                  <Phone size={11} className="text-gray-400 flex-shrink-0" />
                  <span className="text-[10px] font-semibold text-gray-700 flex-1">{tenant.country_code} {tenant.phone}</span>
                  <button onClick={onCopyPhone} className="p-0.5 rounded hover:bg-gray-100 flex-shrink-0">
                    {copiedPhone ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-start gap-2 py-1">
                  <MapPin size={11} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] text-gray-600 leading-snug">{tenant.address}{tenant.city ? `, ${tenant.city}` : ""}{tenant.state ? `, ${tenant.state}` : ""}</span>
                </div>
              </div>
            </Section>

            {/* Occupation Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
                <div className="w-5 h-5 rounded-md bg-violet-600 flex items-center justify-center text-white flex-shrink-0">
                  {tenant.occupation_category ? (
                    tenant.occupation_category === "Student" ? <GraduationCap size={11} /> :
                    tenant.occupation_category === "Working Professional" ? <BriefcaseBusiness size={11} /> :
                    <Briefcase size={11} />
                  ) : <Briefcase size={11} />}
                </div>
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Occupation</span>
              </div>
              <div className="px-4 py-3">
                <div className="space-y-0">
                  <InfoRow label="Category" value={tenant.occupation_category ? <BadgePill variant="violet">{tenant.occupation_category}</BadgePill> : "Other"} />
                  <InfoRow label="Occupation" value={tenant.occupation} />
                  <InfoRow label="Organization" value={tenant.organization} />
                  <InfoRow label="Work Mode" value={tenant.work_mode ? tenant.work_mode.charAt(0).toUpperCase() + tenant.work_mode.slice(1) : null} />
                  <InfoRow label="Shift" value={tenant.shift_timing ? tenant.shift_timing.charAt(0).toUpperCase() + tenant.shift_timing.slice(1) : null} />
                  {tenant.exact_occupation && <InfoRow label="Exact Role" value={tenant.exact_occupation} />}
                  {tenant.monthly_income && <InfoRow label="Monthly Income" value={`₹${Number(tenant.monthly_income).toLocaleString()}`} />}
                  {tenant.years_of_experience && <InfoRow label="Experience" value={`${tenant.years_of_experience} yrs`} />}
                  {tenant.employee_id && <InfoRow label="Employee ID" value={tenant.employee_id} mono />}
                  {tenant.student_id && <InfoRow label="Student ID" value={tenant.student_id} mono />}
                  {tenant.course_duration && <InfoRow label="Course" value={tenant.course_duration.replace("_", " ")} />}
                </div>
              </div>
            </div>

            {/* Terms Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
                <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-white flex-shrink-0"><FileCheck size={11} /></div>
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Terms &amp; Conditions</span>
              </div>
              <div className="px-4 py-3">
                <div className="space-y-0">
                  <InfoRow label="Lock-in Period" value={tenant.lockin_period_months ? `${tenant.lockin_period_months} months` : "Not set"} />
                  <InfoRow label="Lock-in Penalty" value={
                    tenant.lockin_penalty_amount
                      ? <BadgePill variant="violet">{tenant.lockin_penalty_type === "percentage" ? `${tenant.lockin_penalty_amount}% of deposit` : `₹${Number(tenant.lockin_penalty_amount).toLocaleString()}`}</BadgePill>
                      : "—"
                  } />
                  <InfoRow label="Notice Period" value={tenant.notice_period_days ? `${tenant.notice_period_days} days` : "Not set"} />
                  <InfoRow label="Notice Penalty" value={
                    tenant.notice_penalty_amount
                      ? <BadgePill variant="amber">{tenant.notice_penalty_type === "percentage" ? `${tenant.notice_penalty_amount}% of deposit` : `₹${Number(tenant.notice_penalty_amount).toLocaleString()}`}</BadgePill>
                      : "—"
                  } />
                  <InfoRow label="Penalty Applied" value={
                    isActuallyVacated && vacateRecord ? 
                      <BadgePill variant="green">{formatINR(vacateRecord.total_penalty_amount || 0)}</BadgePill> 
                      : <BadgePill variant="gray">—</BadgePill>
                  } />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────
function DocumentsTab({ tenant, onView, onUpload }: { tenant: any; onView: (url: string) => void; onUpload: (docType: string) => void; }) {
  const docs = [
    {
      title: "ID Proof",
      type: tenant.id_proof_type,
      number: tenant.id_proof_number,
      url: tenant.id_proof_url,
      accent: "bg-[#1B3FA0]",
    },
    {
      title: "Address Proof",
      type: tenant.address_proof_type,
      number: tenant.address_proof_number,
      url: tenant.address_proof_url,
      accent: "bg-amber-500",
    },
    {
      title: "Photograph",
      type: undefined,
      number: undefined,
      url: tenant.photo_url,
      accent: "bg-rose-500",
    },
  ];

  const uploaded = docs.filter((d) => d.url).length + (tenant.additional_documents?.length ?? 0);
  const total = docs.length + (tenant.additional_documents?.length ?? 0);

  return (
    <div className="space-y-3">
      {/* ── Document Completion Card (distinct gradient) ── */}
    <div
  className="flex items-center justify-between rounded-xl px-4 py-3 border"
  style={{
    background: "linear-gradient(135deg, #FFFCF5 0%, #FFF7E6 100%)",
  }}
>
  <div className="flex-1">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#C28A00]">
        Document Completion
      </span>

      <span className="text-xs font-black text-[#0F4BAF]">
        {uploaded}/{total} uploaded
      </span>
    </div>

    <div className="h-2 bg-[#F3E6BF] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${total > 0 ? (uploaded / total) * 100 : 0}%`,
          background: "linear-gradient(90deg, #F4B400, #FFC83D)",
        }}
      />
    </div>
  </div>

  <div className="ml-4 text-xl font-black text-[#0F4BAF]">
    {total > 0 ? Math.round((uploaded / total) * 100) : 0}%
  </div>
</div>

      {/* ── Primary Documents Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {docs.map((doc) => (
          <DocCard
            key={doc.title}
            title={doc.title}
            type={doc.type}
            number={doc.number}
            status={doc.url ? "Uploaded" : "Not Uploaded"}
            url={doc.url}
            onView={onView}
            onUpload={() => onUpload(doc.title)}
            accent={doc.accent}
          />
        ))}
      </div>

      {/* ── Additional Documents ── */}
      {tenant.additional_documents && tenant.additional_documents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
            <div className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center text-white flex-shrink-0">
              <FileText size={11} />
            </div>
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              Additional Documents ({tenant.additional_documents.length})
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tenant.additional_documents.map((doc: any, i: number) => (
              <DocCard
                key={i}
                title={doc.filename || `Document ${i + 1}`}
                status={doc.url ? "Uploaded" : "Not Uploaded"}
                url={doc.url}
                onView={onView}
                onUpload={() => onUpload(doc.filename || `Document ${i + 1}`)}
                accent="bg-gray-400"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────
// ─── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ payments, paymentSummary, loadingPayments, onPreviewReceipt, onDownloadReceipt }: {
  payments: any[]; paymentSummary: any; loadingPayments: boolean;
  onPreviewReceipt: (id: number) => void; onDownloadReceipt: (id: number) => void;
}) {
  const [penaltyOpen, setPenaltyOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  if (loadingPayments) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#1B3FA0]" /></div>;
  }

  if (!paymentSummary && payments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><CreditCard size={20} className="text-gray-300" /></div>
        <p className="text-sm text-gray-400" style={fontStyle}>No payment records found</p>
      </div>
    );
  }

  const isVacated = paymentSummary?.is_vacated;

  // Build deduplicated payment list
  const buildPayments = () => {
    let allP: any[] = [...payments];
    if (isVacated) {
      if (paymentSummary?.payments) allP = [...allP, ...paymentSummary.payments];
      if (paymentSummary?.rent_payments) allP = [...allP, ...paymentSummary.rent_payments];
      if (paymentSummary?.security_deposit_payments) allP = [...allP, ...paymentSummary.security_deposit_payments];
    }
    const map = new Map();
    for (const p of allP) { if (p?.id && !map.has(p.id)) map.set(p.id, p); }
    let result = Array.from(map.values());
    if (isVacated) result = result.filter((p: any) => p.status !== "pending");
    return result.sort((a: any, b: any) => new Date(b.payment_date || 0).getTime() - new Date(a.payment_date || 0).getTime());
  };

  const displayPayments = buildPayments();

  const typeColor: Record<string, string> = {
    rent: "bg-blue-100 text-blue-700",
    security_deposit: "bg-amber-100 text-amber-700",
    maintenance: "bg-cyan-100 text-cyan-700",
    penalty_payment: "bg-red-100 text-red-700",
    deposit_refund: "bg-emerald-100 text-emerald-700",
    refund: "bg-emerald-100 text-emerald-700",
  };
  const typeDisplay: Record<string, string> = {
    rent: "Rent",
    security_deposit: "Security Deposit",
    maintenance: "Maintenance",
    penalty_payment: "Penalty",
    deposit_refund: "Deposit Refund",
    refund: "Refund",
  };

  const isApprovedOrPaid = (status: string) => status === "approved" || status === "paid" || status === "refund" || status === "completed";
  const isRejectedOrFailed = (status: string) => status === "rejected" || status === "failed";

  return (
    <div className="space-y-3">

      {/* Vacated: Penalty + Security Deposit as separate collapsibles side-by-side */}
      {isVacated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Penalty Breakdown - unchanged */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <Collapsible open={penaltyOpen} onOpenChange={setPenaltyOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-red-500 flex items-center justify-center text-white"><AlertCircle size={11} /></div>
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Penalty Breakdown</span>
                </div>
                {penaltyOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 border-t border-gray-100">
                {/* same content, no change */}
                <div className="pt-3 space-y-2">
                  {paymentSummary?.vacate_info?.lockin_penalty_amount > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-800" style={fontStyle}>Lock-in Penalty</span>
                        <BadgePill variant="blue">₹{Number(paymentSummary.vacate_info.lockin_penalty_amount).toLocaleString()}</BadgePill>
                      </div>
                      {paymentSummary?.vacate_info?.lockin_penalty_description && (
                        <p className="text-[10px] text-blue-600 mt-1">{paymentSummary.vacate_info.lockin_penalty_description}</p>
                      )}
                    </div>
                  )}
                  {paymentSummary?.vacate_info?.notice_penalty_amount > 0 && (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-800" style={fontStyle}>Notice Penalty</span>
                        <BadgePill variant="amber">₹{Number(paymentSummary.vacate_info.notice_penalty_amount).toLocaleString()}</BadgePill>
                      </div>
                      {paymentSummary?.vacate_info?.notice_penalty_description && (
                        <p className="text-[10px] text-amber-600 mt-1">{paymentSummary.vacate_info.notice_penalty_description}</p>
                      )}
                    </div>
                  )}
                  {paymentSummary?.vacate_info?.inspection_penalty_amount > 0 && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-red-800" style={fontStyle}>Inspection Penalty</span>
                        <BadgePill variant="red">₹{Number(paymentSummary.vacate_info.inspection_penalty_amount).toLocaleString()}</BadgePill>
                      </div>
                    </div>
                  )}
                  {!paymentSummary?.vacate_info?.lockin_penalty_amount &&
                   !paymentSummary?.vacate_info?.notice_penalty_amount &&
                   !paymentSummary?.vacate_info?.inspection_penalty_amount && (
                    <div className="text-center py-3">
                      <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-400" style={fontStyle}>No penalties applied</p>
                    </div>
                  )}
                  {(paymentSummary?.vacate_info?.total_penalty > 0 || paymentSummary?.vacate_info?.total_penalty_amount > 0) && (
                    <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800" style={fontStyle}>Total Penalty</span>
                      <span className="text-sm font-black text-red-600">₹{Number(paymentSummary.vacate_info.total_penalty || paymentSummary.vacate_info.total_penalty_amount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Security Deposit - unchanged */}
          {paymentSummary?.vacate_info?.security_deposit > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <Collapsible open={depositOpen} onOpenChange={setDepositOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-white"><Shield size={11} /></div>
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Security Deposit</span>
                  </div>
                  {depositOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-3 space-y-2.5">
                    {[
                      { label: "Security Deposit", value: paymentSummary.vacate_info.security_deposit, color: "bg-amber-50 border-amber-100 text-amber-800", badge: "amber" },
                      { label: "Total Penalty Deducted", value: paymentSummary.vacate_info.total_penalty || 0, color: "bg-red-50 border-red-100 text-red-800", badge: "red" },
                      { label: "Refund Amount", value: paymentSummary.vacate_info.refundable_amount || 0, color: "bg-emerald-50 border-emerald-100 text-emerald-800", badge: "green" },
                    ].map(({ label, value, color, badge }) => (
                      <div key={label} className={`rounded-lg p-3 border ${color}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={fontStyle}>{label}</span>
                          <BadgePill variant={badge as any}>₹{Number(value).toLocaleString()}</BadgePill>
                        </div>
                        <div className="mt-1.5 h-1 bg-white/50 rounded-full">
                          <div className="h-full rounded-full bg-current opacity-40"
                            style={{ width: `${Math.min(100, (value / paymentSummary.vacate_info.security_deposit) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                    <div className="text-[9px] text-gray-400 italic text-right" style={fontStyle}>
                      Deposit collected: ₹{Number(paymentSummary.security_deposit_info?.paid || 0).toLocaleString()}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards - already 2 cols on mobile, fine */}
    {/* Summary Cards */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
  {!isVacated ? (
    <>
      <PaymentCard
        title="Total Paid"
        value={formatINR(paymentSummary?.total_paid || 0)}
        icon={IndianRupee}
        color="bg-green-600"
        bg="bg-gradient-to-br from-green-50 to-green-100"
      />
      <PaymentCard
        title="Total Pending"
        value={formatINR(paymentSummary?.total_pending || 0)}
        icon={IndianRupee}
        color="bg-orange-600"
        bg="bg-gradient-to-br from-orange-50 to-orange-100"
      />
      <PaymentCard
        title="Monthly Rent"
        value={formatINR(paymentSummary?.monthly_rent || 0)}
        icon={IndianRupee}
        color="bg-blue-600"
        bg="bg-gradient-to-br from-blue-50 to-blue-100"
      />
      <PaymentCard
        title="Months Joined"
        value={String(paymentSummary?.total_months_since_joining || 0)}
        icon={Calendar}
        color="bg-purple-600"
        bg="bg-gradient-to-br from-purple-50 to-purple-100"
      />
    </>
  ) : (
    <>
      <PaymentCard
        title="Total Rent Paid"
        value={formatINR(paymentSummary?.total_rent_paid || 0)}
        icon={IndianRupee}
        color="bg-emerald-600"
        bg="bg-gradient-to-br from-emerald-50 to-emerald-100"
      />
      <PaymentCard
        title="Rent Payments"
        value={String(paymentSummary?.rent_payment_count || 0)}
        icon={CreditCard}
        color="bg-blue-600"
        bg="bg-gradient-to-br from-blue-50 to-blue-100"
      />
      <PaymentCard
        title="Security Deposit"
        value={formatINR(paymentSummary?.vacate_info?.security_deposit || 0)}
        icon={Shield}
        color="bg-amber-600"
        bg="bg-gradient-to-br from-amber-50 to-amber-100"
      />
      <PaymentCard
        title="Deposit Paid"
        value={formatINR(paymentSummary?.security_deposit_info?.paid || 0)}
        icon={IndianRupee}
        color="bg-teal-600"
        bg="bg-gradient-to-br from-teal-50 to-teal-100"
      />
    </>
  )}
</div>

      {/* Transactions Table - responsive padding/font on mobile */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-100 flex items-center justify-between gap-2 sm:gap-3 bg-gray-50/40 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#1B3FA0] flex items-center justify-center text-white"><ReceiptText size={11} /></div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Transactions</span>
            <span className="text-[9px] sm:text-[10px] text-gray-400" style={fontStyle}>{displayPayments.length} records</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Approved / Paid</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Rejected</span>
            {!isVacated && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Pending</span>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] sm:text-[11px]">
            <thead>
              <tr className="border-b border-gray-50">
                {["Date", "Amount", "Type", "Mode", "Period", "Status", ""].map(h => (
                  <th key={h} className="text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap" style={fontStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayPayments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-xs" style={fontStyle}>No payment transactions found</td></tr>
              ) : displayPayments.map((p: any) => {
                const approved = isApprovedOrPaid(p.status);
                const rejected = isRejectedOrFailed(p.status);
                const typeKey = p.payment_type || p.type || "";
                return (
                  <tr key={p.id} className={`border-b border-gray-50/80 hover:bg-gray-50/40 transition-colors ${rejected ? "bg-red-50/20" : ""}`}>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-[11px] text-gray-500 whitespace-nowrap" style={fontStyle}>
                      {p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className={`px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-bold whitespace-nowrap ${rejected ? "text-red-400 line-through" : approved ? "text-gray-900" : "text-amber-600"}`} style={fontStyle}>
                      {formatINR(p.amount || 0)}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 whitespace-nowrap">
                      <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${typeColor[typeKey] ?? "bg-gray-100 text-gray-600"}`} style={fontStyle}>
                        {typeDisplay[typeKey] || typeKey || "—"}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-[11px] text-gray-500 whitespace-nowrap capitalize" style={fontStyle}>{p.payment_mode || "—"}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-[11px] text-gray-500 whitespace-nowrap" style={fontStyle}>{p.month} {p.year}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 whitespace-nowrap">
                      {approved && (
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200" style={fontStyle}>
                          <CheckCircle2 size={8} className="sm:size-[9px]" />{p.status === "paid" ? "Paid" : "Approved"}
                        </span>
                      )}
                      {rejected && (
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-red-100 text-red-600 border border-red-200" style={fontStyle}>
                          <XCircle size={8} className="sm:size-[9px]" />{p.status === "failed" ? "Failed" : "Rejected"}
                        </span>
                      )}
                      {!approved && !rejected && (
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200" style={fontStyle}>
                          <Clock size={8} className="sm:size-[9px]" />{p.status ?? "Pending"}
                        </span>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5">
                      {approved && (
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <button onClick={() => onPreviewReceipt(p.id)} className="p-0.5 sm:p-1 hover:bg-blue-50 rounded transition-colors" title="View Receipt"><Eye size={10} className="sm:size-[11px] text-[#1B3FA0]" /></button>
                          <button onClick={() => onDownloadReceipt(p.id)} className="p-0.5 sm:p-1 hover:bg-emerald-50 rounded transition-colors" title="Download Receipt"><Download size={10} className="sm:size-[11px] text-emerald-500" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
          <div className="px-2 sm:px-4 py-1.5 sm:py-2 text-center">
            <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={fontStyle}>Total Approved / Paid</p>
            <p className="text-xs sm:text-sm font-black text-emerald-600 mt-0.5">{formatINR(isVacated ? paymentSummary?.total_rent_paid || 0 : paymentSummary?.total_paid || 0)}</p>
          </div>
          <div className="px-2 sm:px-4 py-1.5 sm:py-2 text-center">
            <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={fontStyle}>{isVacated ? "Total Rejected" : "Total Pending"}</p>
            <p className="text-xs sm:text-sm font-black text-red-500 mt-0.5">{formatINR(isVacated ? paymentSummary?.total_rejected || 0 : paymentSummary?.total_pending || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Partner Tab ──────────────────────────────────────────────────────────────
function PartnerTab({ partnerDetails, onView }: { partnerDetails: PartnerDetails | null; onView: (url: string) => void }) {
  if (!partnerDetails || !partnerDetails.full_name) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center"><Heart size={20} className="text-gray-200" /></div>
        <p className="text-xs text-gray-400" style={fontStyle}>No partner details for this tenant</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-rose-50/60">
          <div className="w-5 h-5 rounded-md bg-rose-500 flex items-center justify-center text-white flex-shrink-0"><Heart size={11} /></div>
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Partner Information</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-black text-xl shadow-md flex-shrink-0">
              {partnerDetails.photo_url ? (
                <img src={resolveUrl(partnerDetails.photo_url)} alt={partnerDetails.full_name} className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : partnerDetails.full_name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="text-sm font-black text-gray-900" style={fontStyle}>
                {partnerDetails.salutation ? `${partnerDetails.salutation} ` : ""}{partnerDetails.full_name}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5" style={fontStyle}>{partnerDetails.relationship || "Partner"}</p>
              <div className="flex items-center gap-2 mt-1">
                {partnerDetails.gender && <BadgePill variant="blue">{partnerDetails.gender}</BadgePill>}
                {partnerDetails.occupation && <BadgePill variant="violet">{partnerDetails.occupation}</BadgePill>}
              </div>
            </div>
          </div>
          {/* Grid: 2 columns on mobile, 3 columns on large screens */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3">
            {[
              { label: "Phone", value: `${partnerDetails.country_code || ""} ${partnerDetails.phone || ""}`.trim() || "—" },
              { label: "Email", value: partnerDetails.email || "—" },
              { label: "Date of Birth", value: partnerDetails.date_of_birth ? new Date(partnerDetails.date_of_birth).toLocaleDateString("en-IN") : "—" },
              { label: "Gender", value: partnerDetails.gender || "—" },
              { label: "Relationship", value: partnerDetails.relationship || "—" },
              { label: "Organization", value: partnerDetails.organization || "—" },
              { label: "Address", value: partnerDetails.address || "—", wide: true },
            ].map(({ label, value, wide }: any) => (
              <div key={label} className={wide ? "col-span-2 lg:col-span-3" : ""}>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" style={fontStyle}>{label}</p>
                <p className="text-xs font-semibold text-gray-800" style={fontStyle}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(partnerDetails.id_proof_url || partnerDetails.address_proof_url || partnerDetails.photo_url) && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white flex-shrink-0"><FileText size={11} /></div>
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Partner Documents</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {partnerDetails.id_proof_url && (
              <DocCard title="Partner ID Proof" type={partnerDetails.id_proof_type} number={partnerDetails.id_proof_number}
                status="Uploaded" url={partnerDetails.id_proof_url} onView={onView} accent="bg-[#1B3FA0]" />
            )}
            {partnerDetails.address_proof_url && (
              <DocCard title="Partner Address Proof" type={partnerDetails.address_proof_type} number={partnerDetails.address_proof_number}
                status="Uploaded" url={partnerDetails.address_proof_url} onView={onView} accent="bg-amber-500" />
            )}
            {partnerDetails.photo_url && (
              <DocCard title="Partner Photo" status="Uploaded" url={partnerDetails.photo_url} onView={onView} accent="bg-rose-500" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ tenant, orgLogo, orgName }: { tenant: any; orgLogo: string; orgName: string }) {
  const [expandedStay, setExpandedStay] = useState<string | null>(null);
  const [sectionMap, setSectionMap] = useState<Record<string, string>>({});

  function resolveDocNumber(tenant: any, docType: "Aadhar Card" | "PAN Card"): string | null {
    if (tenant.id_proof_type === docType && tenant.id_proof_number) return tenant.id_proof_number;
    if (tenant.address_proof_type === docType && tenant.address_proof_number) return tenant.address_proof_number;
    if (docType === "Aadhar Card" && tenant.aadhar_number) return tenant.aadhar_number;
    if (docType === "PAN Card" && tenant.pan_number) return tenant.pan_number;
    return null;
  }

  const aadharNum = resolveDocNumber(tenant, "Aadhar Card");
  const panNum = resolveDocNumber(tenant, "PAN Card");

  // ✅ Read the backend-computed, correctly-windowed stay history.
  // Each entry already has: stayNumber, checkIn, checkOut, isCurrent,
  // vacateRecord, rentPayments, depositPayments, refundPayments,
  // penaltyPayments, totalRentPaid, totalDepositPaid, totalRefunded,
  // totalPenaltyPaid, refundStatusInfo: { status, isFullyRefunded, isPartialRefund }
  const rawStayHistory: any[] = tenant.stay_history ?? [];

  // Normalize into the shape the rest of this component renders, while
  // pulling display fields (property/room/bed/rent/penalty amounts) from
  // either the vacateRecord (past stays) or the tenant/assignment (current).
  const allStays = [...rawStayHistory]
    .map((stay) => {
      const vr = stay.vacateRecord;
      const isVacatedRecord = !stay.isCurrent;

      const property = isVacatedRecord
        ? (vr?.property_name || tenant.assigned_property_name || "N/A")
        : (tenant.current_assignment?.property?.name || tenant.assigned_property_name || "N/A");

      const room = isVacatedRecord
        ? (vr?.room_number || "—")
        : (tenant.current_assignment?.room?.room_number || tenant.room_number || "—");

      const bed = isVacatedRecord
        ? (vr?.bed_number || "—")
        : (tenant.current_assignment?.bed_number || tenant.bed_number || "—");

      const monthlyRent = isVacatedRecord
        ? Number(vr?.rent_amount || 0)
        : Number(tenant.current_assignment?.tenant_rent || tenant.monthly_rent || 0);

      const securityDeposit = isVacatedRecord
        ? Number(vr?.security_deposit_amount || 0)
        : Number(tenant.current_assignment?.security_deposit || tenant.security_deposit || 0);

      const refundInfo = stay.refundStatusInfo || { status: null, isFullyRefunded: false, isPartialRefund: false };

      // ✅ Couple/partner info is per-stay: past stays use the vacate_records
      // snapshot (partner_tenant_id / is_couple_booking / sharing_type as
      // they were AT THAT TIME), never the live tenants row — because the
      // live row is reset to solo once a couple vacates and would otherwise
      // wrongly show old stays as "Single" or with a stale/missing partner.
      const stayIsCouple = isVacatedRecord
        ? !!vr?.is_couple_booking
        : (tenant.is_couple_booking === true || tenant.is_couple_booking === 1);

      const stayPartner = isVacatedRecord
        ? (vr?.partner_full_name
            ? {
                name: vr.partner_full_name,
                phone: `${vr.partner_country_code || ""} ${vr.partner_phone || ""}`.trim(),
                relation: "Spouse",
              }
            : null)
        : (tenant.partner_full_name
            ? {
                name: tenant.partner_full_name,
                phone: `${tenant.partner_country_code || ""} ${tenant.partner_phone || ""}`.trim(),
                relation: tenant.partner_relationship || "Spouse",
              }
            : null);

      // ✅ FIX: Get the rate and amount correctly
      // For vacated records: use the vacate record's rate (new columns)
      // For current stay: use the tenant's rate
      const lockinPenaltyRate = isVacatedRecord
        ? Number(vr?.lockin_penalty_rate || 0)
        : Number(tenant.lockin_penalty_amount || 0);

      const lockinPenaltyAmount = isVacatedRecord
        ? Number(vr?.lockin_penalty_amount || 0)
        : Number(tenant.lockin_penalty_amount || 0);

      const noticePenaltyRate = isVacatedRecord
        ? Number(vr?.notice_penalty_rate || 0)
        : Number(tenant.notice_penalty_amount || 0);

      const noticePenaltyAmount = isVacatedRecord
        ? Number(vr?.notice_penalty_amount || 0)
        : Number(tenant.notice_penalty_amount || 0);

      return {
        id: stay.isCurrent ? "current" : `vacate-${stay.vacateRecordId}`,
        stayNumber: stay.stayNumber,
        isCurrent: stay.isCurrent,
        isVacatedRecord,
        vacateRecordId: stay.vacateRecordId,
        vacateRecord: vr,
        property,
        room,
        bed,
        stayType: stayIsCouple ? "Couple" : "Single",
        sharingType: isVacatedRecord
          ? (vr?.sharing_type || null)
          : (tenant.current_assignment?.sharing_type || tenant.current_assignment?.room?.sharing_type || null),
        monthlyRent,
        securityDeposit,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        rentPayments: stay.rentPayments || [],
        depositPayments: stay.depositPayments || [],
        refundPayments: stay.refundPayments || [],
        penaltyPayments: stay.penaltyPayments || [],
        depositPaid: stay.totalDepositPaid || 0,
        totalRentPaidThisStay: stay.totalRentPaid || 0,
        totalRefunded: stay.totalRefunded || 0,
        refundAmount: Number(vr?.refundable_amount || 0),
        refundStatus: refundInfo.status,
        isFullyRefunded: refundInfo.isFullyRefunded,
        isPartialRefund: refundInfo.isPartialRefund,
        totalPenalty: Number(vr?.total_penalty_amount || 0),
        lockinPenalty: Number(vr?.lockin_penalty_amount || 0),
        noticePenalty: Number(vr?.notice_penalty_amount || 0),
        inspectionPenalty: Number(vr?.inspection_penalty_amount || 0),
        vacateReason: vr?.vacate_reason_value || "—",
        lockInPeriod: vr?.lockin_period_months
          ? `${vr.lockin_period_months} months`
          : (tenant.lockin_period_months ? `${tenant.lockin_period_months} months` : "—"),
        // ✅ FIX: These now use the rate columns correctly
        lockinPenaltyType: isVacatedRecord
          ? (vr?.lockin_penalty_type || "fixed")
          : (tenant.lockin_penalty_type || "fixed"),
        lockinPenaltyRate,           // ✅ NEW — original percentage rate
        lockinPenaltyAmount,         // ✅ NEW — computed rupee amount
        noticePeriod: vr?.notice_period_days
          ? `${vr.notice_period_days} days`
          : (tenant.notice_period_days ? `${tenant.notice_period_days} days` : "—"),
        noticePenaltyType: isVacatedRecord
          ? (vr?.notice_penalty_type || "fixed")
          : (tenant.notice_penalty_type || "fixed"),
        noticePenaltyRate,           // ✅ NEW — original percentage rate
        noticePenaltyAmount,         // ✅ NEW — computed rupee amount
        partner: stayPartner,
      };
    })
    .sort((a, b) => b.stayNumber - a.stayNumber);

  // Dynamic styling for whatever sharing_type comes back from the DB —
  // no hardcoded list of room types.
  const SHARING_TYPE_PALETTE = [
    { bg: "bg-blue-500",   text: "text-blue-700",   ring: "ring-blue-200" },
    { bg: "bg-teal-500",   text: "text-teal-700",   ring: "ring-teal-200" },
    { bg: "bg-violet-500", text: "text-violet-700", ring: "ring-violet-200" },
    { bg: "bg-amber-500",  text: "text-amber-700",  ring: "ring-amber-200" },
    { bg: "bg-cyan-500",   text: "text-cyan-700",   ring: "ring-cyan-200" },
  ];
  function getSharingTypeStyle(rawType: string | null | undefined) {
    const type = (rawType || "single").toLowerCase();
    let hash = 0;
    for (let i = 0; i < type.length; i++) hash = (hash * 31 + type.charCodeAt(i)) >>> 0;
    return SHARING_TYPE_PALETTE[hash % SHARING_TYPE_PALETTE.length];
  }

  const typeColor: Record<string, string> = {
    rent: "bg-blue-100 text-blue-700",
    security_deposit: "bg-amber-100 text-amber-700",
    maintenance: "bg-cyan-100 text-cyan-700",
    penalty_payment: "bg-red-100 text-red-700",
    deposit_refund: "bg-emerald-100 text-emerald-700",
    refund: "bg-emerald-100 text-emerald-700",
  };
  const typeDisplay: Record<string, string> = {
    rent: "Rent",
    security_deposit: "Security Deposit",
    maintenance: "Maintenance",
    penalty_payment: "Penalty",
    deposit_refund: "Deposit Refund",
    refund: "Refund",
  };

  // ✅ Documents used in print sections — fallback to Aadhar Card label
  // when no specific proof type is on file.
  const docs = [
    { label: "ID Proof", type: tenant.id_proof_type || "Aadhar Card", number: tenant.id_proof_number, url: tenant.id_proof_url },
    { label: "Address Proof", type: tenant.address_proof_type || "Aadhar Card", number: tenant.address_proof_number, url: tenant.address_proof_url },
    { label: "Photograph", type: undefined, number: undefined, url: tenant.photo_url },
  ];

  const buildStayPrintSections = (stay: any) => {
    const stayPayments = [
      ...stay.rentPayments, ...stay.depositPayments, ...stay.refundPayments, ...stay.penaltyPayments,
    ].sort((a: any, b: any) => new Date(b.payment_date || 0).getTime() - new Date(a.payment_date || 0).getTime());

    const docsRows = docs.map(d => {
      const uploadedDate = d.url && stay.checkIn ? new Date(stay.checkIn).toLocaleDateString("en-IN") : "—";
      return `<tr>
        <td class="doc-type">${d.label}</td>
        <td>${d.type || "—"}</td>
        <td class="doc-number">${d.number || "—"}</td>
        <td>${d.url
          ? `<span class="doc-status doc-status-yes">Uploaded</span>`
          : `<span class="doc-status doc-status-no">Not Uploaded</span>`}</td>
        <td class="doc-date">${uploadedDate}</td>
      </tr>`;
    }).join("");

    const docsHtml = `<table class="doctable">
      <thead><tr><th>Document</th><th>Type</th><th>Number</th><th>Status</th><th>Uploaded</th></tr></thead>
      <tbody>${docsRows}</tbody>
    </table>`;

    // ✅ FIX: Format penalty display with rate + amount
    const formatLockinPenalty = (stay: any) => {
      if (stay.lockinPenaltyAmount <= 0) return "—";
      if (stay.lockinPenaltyType === "percentage" && stay.lockinPenaltyRate > 0) {
        return `${stay.lockinPenaltyRate}% of deposit (₹${stay.lockinPenaltyAmount.toLocaleString("en-IN")})`;
      }
      return `₹${stay.lockinPenaltyAmount.toLocaleString("en-IN")}`;
    };

    const formatNoticePenalty = (stay: any) => {
      if (stay.noticePenaltyAmount <= 0) return "—";
      if (stay.noticePenaltyType === "percentage" && stay.noticePenaltyRate > 0) {
        return `${stay.noticePenaltyRate}% of deposit (₹${stay.noticePenaltyAmount.toLocaleString("en-IN")})`;
      }
      return `₹${stay.noticePenaltyAmount.toLocaleString("en-IN")}`;
    };

    return `
      <h2>Stay Details</h2>
      <div class="g2">
        <div><div class="lbl">Property</div><div class="val">${stay.property}</div></div>
        <div><div class="lbl">Room/Bed</div><div class="val">Room ${stay.room} · Bed ${stay.bed}</div></div>
        <div><div class="lbl">Type</div><div class="val">${stay.stayType}</div></div>
        <div><div class="lbl">Rent</div><div class="val">₹${stay.monthlyRent.toLocaleString("en-IN")}</div></div>
        <div><div class="lbl">Check-in</div><div class="val">${stay.checkIn ? new Date(stay.checkIn).toLocaleDateString("en-IN") : "—"}</div></div>
        <div><div class="lbl">Check-out</div><div class="val">${stay.checkOut ? new Date(stay.checkOut).toLocaleDateString("en-IN") : "Active"}</div></div>
        <div><div class="lbl">Deposit</div><div class="val">₹${stay.securityDeposit.toLocaleString("en-IN")}</div></div>
        ${stay.isVacatedRecord ? `<div><div class="lbl">Refund</div><div class="val">₹${(stay.refundAmount || 0).toLocaleString("en-IN")} (${stay.refundStatus || "N/A"})</div></div>` : ""}
      </div>

      <h2>Payments</h2>
      <table class="ptable"><thead><tr><th>Date</th><th>Amount</th><th>Type</th><th>Mode</th><th>Period</th><th>Status</th></tr></thead>
      <tbody>${stayPayments.length ? stayPayments.map((p: any) => `<tr>
        <td>${p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN") : "—"}</td>
        <td>₹${Number(p.amount || 0).toLocaleString("en-IN")}</td>
        <td>${typeDisplay[p.payment_type] || p.payment_type || "—"}</td>
        <td>${p.payment_mode || "—"}</td>
        <td>${p.month ? `${p.month} ${p.year}` : "—"}</td>
        <td>${p.status || "—"}</td>
      </tr>`).join("") : `<tr><td colspan="6" style="text-align:center;color:#9ca3af">No payment records</td></tr>`}</tbody></table>
      <div class="totalline">Total: <span>₹${(stay.totalRentPaidThisStay || 0).toLocaleString("en-IN")}</span></div>

      <h2>Documents</h2>
      ${docsHtml}

      <h2>Security Deposit</h2>
      <div class="g2">
        <div><div class="lbl">Security Deposit</div><div class="val">₹${stay.securityDeposit.toLocaleString("en-IN")}</div></div>
        <div><div class="lbl">Deposit Paid</div><div class="val">₹${(stay.depositPaid || 0).toLocaleString("en-IN")}</div></div>
        ${stay.isVacatedRecord ? `
        <div><div class="lbl">Refund Amount</div><div class="val">₹${(stay.refundAmount || 0).toLocaleString("en-IN")}</div></div>
        <div><div class="lbl">Total Refunded</div><div class="val">₹${(stay.totalRefunded || 0).toLocaleString("en-IN")}</div></div>` : ""}
      </div>

      <h2>Terms &amp; Penalties</h2>
      <div class="g2">
        <div><div class="lbl">Lock-in Period</div><div class="val">${stay.lockInPeriod}</div></div>
        <div><div class="lbl">Lock-in Penalty</div><div class="val">${formatLockinPenalty(stay)}</div></div>
        <div><div class="lbl">Notice Period</div><div class="val">${stay.noticePeriod}</div></div>
        <div><div class="lbl">Notice Penalty</div><div class="val">${formatNoticePenalty(stay)}</div></div>
        ${stay.isVacatedRecord ? `<div class="g2full"><div class="lbl">Vacate Reason</div><div class="val">${stay.vacateReason}</div></div>` : ""}
      </div>

      ${stay.partner ? `
      <h2>Partner Details</h2>
      <div class="g2">
        <div><div class="lbl">Name</div><div class="val">${stay.partner.name}</div></div>
        <div><div class="lbl">Phone</div><div class="val">${stay.partner.phone}</div></div>
        <div><div class="lbl">Relation</div><div class="val">${stay.partner.relation}</div></div>
      </div>` : ""}
    `;
  };

  const STAY_PRINT_STYLE = `
    body{font-family:system-ui,sans-serif;margin:40px;color:#111;font-size:12px;position:relative}
    ${PRINT_BRAND_STYLE}

    /* ── ONLY SMALLER FONT IN HEADER, KEEP LAYOUT ── */
    .brand-name { font-size: 16px !important; }      /* was 22px */
    .brand-sub  { font-size: 8px !important; }       /* was 10px */
    /* .brand-logo-wrap and .brand-right remain visible */

    h1{font-size:20px;font-weight:900;margin-bottom:2px;color:#111}
    .sub{color:#64748b;font-size:11px;margin-bottom:22px;font-weight:600}
    h2{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#1e293b;border-bottom:1px solid #e2e8f0;padding-bottom:6px;margin:20px 0 12px}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;background:#f8f9fa;padding:14px 16px;border-radius:8px;margin-bottom:14px}
    .g2full{grid-column:span 2}
    .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#666;font-weight:700;margin-bottom:2px}
    .val{font-size:13px;font-weight:700;color:#333}

    /* ── TABLES (matches ledger) ── */
    .ptable{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
    .ptable thead tr{background:#eff6ff}
    .ptable th{
      text-align:left;
      font-size:9px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:.05em;
      color:#2563eb;
      border:1px solid #bfdbfe;
      padding:7px 10px;
    }
    .ptable td{
      padding:7px 10px;
      border:1px solid #e2e8f0;
      color:#111;
    }
    .ptable td:nth-child(2){color:#16a34a;font-weight:700}

    .doctable{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px}
    .doctable thead tr{background:#eff6ff}
    .doctable th{
      text-align:left;
      font-size:9px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:.05em;
      color:#2563eb;
      border:1px solid #bfdbfe;
      padding:7px 10px;
    }
    .doctable td{
      padding:7px 10px;
      border:1px solid #e2e8f0;
      color:#111;
    }

    .doc-type{color:#2563eb;font-weight:600}
    .doc-date{color:#6b7280}
    .doc-status{font-weight:600}
    .doc-status-yes{color:#16a34a}
    .doc-status-no{color:#dc3545}

    .totalline{font-size:13px;font-weight:800;color:#166534;margin:6px 0 4px;background:#f0fdf4;padding:8px 12px;border-radius:6px}
    .totalline span{color:#16a34a}

    .ft{margin-top:28px;font-size:10px;color:#999;border-top:1px solid #e2e8f0;padding-top:8px}

    .stay-block{margin-top:8px}
    .stay-block + .stay-block{margin-top:36px;padding-top:28px;border-top:3px double #d1d5db}
    h2{break-after:avoid-page}
    .doc-number{font-family:monospace;color:#374151}
  `;

  const doPrint = (stay: any) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Stay #${stay.stayNumber}</title>
    <style>${STAY_PRINT_STYLE}</style></head><body>
    ${buildWatermarkHTML(orgLogo, orgName)}
    ${buildBrandHeaderHTML(orgLogo, orgName, `Stay #${stay.stayNumber}`)}
    <div style="text-align:center">
      <h1>${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}</h1>
      <div class="sub">ID: ${tenant.id} · Stay #${stay.stayNumber} · ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
    </div>
    ${buildStayPrintSections(stay)}
    <div class="ft">Roomac Co-Living Management System</div></body></html>`);
    w.document.close();
    w.print();
  };

  // ✅ Print All: ONE brand header + ONE watermark for the whole document.
  // Stays are separated with a simple divider and flow naturally onto new
  // pages only when content actually overflows (no forced page-break-after).
  const doPrintAll = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const sections = allStays.map((stay, idx) => `
      <div class="stay-block">
        <h1 class="stay-heading">Stay #${stay.stayNumber}${stay.isCurrent ? ' <span class="current-tag">Current</span>' : ""}</h1>
        <div class="sub">${stay.property} · ${stay.checkIn ? new Date(stay.checkIn).toLocaleDateString("en-IN") : "—"} — ${stay.checkOut ? new Date(stay.checkOut).toLocaleDateString("en-IN") : "Active"}</div>
        ${buildStayPrintSections(stay)}
      </div>
    `).join("");

    w.document.write(`<!DOCTYPE html><html><head><title>Stay History · ${tenant.full_name}</title>
    <style>${STAY_PRINT_STYLE}
     .cover {
    text-align: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f3f4f6;
  }
  .cover h1 {
    font-size: 16px;
    font-weight: 900;
    margin-bottom: 2px;
  }
  .cover .sub {
    font-size: 10px;
    color: #64748b;
  }
      .stay-heading{font-size:15px;font-weight:800;letter-spacing:.02em;color:#1e293b;margin-bottom:2px}
      .current-tag{display:inline-block;font-size:9px;font-weight:700;color:#059669;background:#d1fae5;padding:2px 8px;border-radius:999px;margin-left:6px;vertical-align:middle;text-transform:uppercase;letter-spacing:.05em}
    </style></head><body>
    ${buildWatermarkHTML(orgLogo, orgName)}
    ${buildBrandHeaderHTML(orgLogo, orgName, "Complete Stay History")}
    <div class="cover">
      <h1>${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}</h1>
      <div class="sub">ID: ${tenant.id} · ${allStays.length} stay(s) · Generated ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
    </div>
    ${sections}
    </body></html>`);
    w.document.close();
    w.print();
  };

  const doDownload = (stay: any) => {
    const csv = [
      `Stay History,${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name},ID:${tenant.id},Stay#${stay.stayNumber}`,
      "",
      "STAY",
      `Property,${stay.property}`,
      `Room,Room ${stay.room} Bed ${stay.bed}`,
      `Type,${stay.stayType}`,
      `Rent,₹${stay.monthlyRent}`,
      `CheckIn,${stay.checkIn ? new Date(stay.checkIn).toLocaleDateString("en-IN") : "—"}`,
      `CheckOut,${stay.checkOut ? new Date(stay.checkOut).toLocaleDateString("en-IN") : "Active"}`,
      `Deposit,₹${stay.securityDeposit}`,
      `Refund,₹${stay.refundAmount ?? 0} (${stay.refundStatus ?? "N/A"})`,
      `Penalty,₹${stay.totalPenalty ?? 0}`,
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `stay-${tenant.id}-${stay.stayNumber}.csv`;
    a.click();
  };

  // ── Top stat cards ──
  const totalStays = allStays.length;
 const lifetimeRent = allStays.reduce((a, s) => a + (s.totalRentPaidThisStay || 0), 0);
  const monthsStayed = (() => {
  let totalDays = 0;
  for (const s of allStays) {
    if (!s.checkIn) continue;
    const start = new Date(s.checkIn);
    const end = s.checkOut ? new Date(s.checkOut) : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
    const days = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    totalDays += days;
  }
  // Average month length (~30.44 days) keeps this consistent with how
  // rent proration elsewhere in the app treats a "month".
  return Math.round(totalDays / 30.44);
})();

  const refundReceived = allStays.filter(s => s.isVacatedRecord).reduce((a, s) => a + s.totalRefunded, 0);

  if (allStays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center"><History size={20} className="text-gray-200" /></div>
        <p className="text-xs text-gray-400" style={fontStyle}>No stay history available for this tenant</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <PaymentCard
          title="Total Stays"
          value={totalStays}
          icon={Layers}
          color="bg-blue-600"
          bg="bg-gradient-to-br from-blue-50 to-blue-100"
        />
        <PaymentCard
          title="Lifetime Rent"
          value={formatINR(lifetimeRent)}
          icon={IndianRupee}
          color="bg-emerald-600"
          bg="bg-gradient-to-br from-emerald-50 to-emerald-100"
        />
        <PaymentCard
          title="Months Stayed"
          value={monthsStayed}
          icon={Calendar}
          color="bg-violet-600"
          bg="bg-gradient-to-br from-violet-50 to-violet-100"
        />
        <PaymentCard
          title="Refund Received"
          value={formatINR(refundReceived)}
          icon={Banknote}
          color="bg-teal-600"
          bg="bg-gradient-to-br from-teal-50 to-teal-100"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={doPrintAll}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white border border-gray-200 rounded-lg text-[9px] sm:text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          style={fontStyle}
        >
          <Printer size={10} className="sm:size-[11px]" /> Print All
        </button>
      </div>

      {/* Timeline */}
      <div className="relative space-y-2.5">
        <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-gray-200 hidden lg:block" />
        {allStays.map(stay => {
          const sharingCfg = getSharingTypeStyle(stay.sharingType);
          const isCoupleOccupancy = stay.stayType === "Couple";
          const isOpen = expandedStay === stay.id;
          const section = sectionMap[stay.id] ?? "payments";

          // ✅ Build the unified payments list shown in the Payments sub-tab
          // directly from the backend-windowed arrays — no more guessing or
          // date-cutoff filtering here.
          const stayPayments = [
            ...stay.rentPayments,
            ...stay.depositPayments,
            ...stay.refundPayments,
            ...stay.penaltyPayments,
          ].sort((a: any, b: any) => new Date(b.payment_date || 0).getTime() - new Date(a.payment_date || 0).getTime());

          const stayRentPaid = stay.totalRentPaidThisStay;
          const docsUploaded = stay.isCurrent
            ? [tenant.id_proof_url, tenant.address_proof_url, tenant.photo_url].filter(Boolean).length
            : 0;
          const docsTotal = 3;

          return (
            <div key={stay.id} className="relative lg:pl-10">
              <div
                className={`absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 border-white shadow hidden lg:block ${stay.isCurrent ? "bg-emerald-500" : "bg-gray-300"}`}
                style={{ transform: "translateX(-50%)" }}
              />
              <div className={`bg-white rounded-xl border overflow-hidden transition-all ${isOpen ? "border-gray-200 shadow-md" : "border-gray-100 shadow-sm hover:shadow"}`}>
                {/* Stay header */}
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 cursor-pointer" onClick={() => setExpandedStay(isOpen ? null : stay.id)}>
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl ${sharingCfg.bg} flex items-center justify-center text-white font-black text-[9px] sm:text-[11px] flex-shrink-0`}>#{stay.stayNumber}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-900" style={fontStyle}>{stay.property}</span>
                      {stay.sharingType && (
                        <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ring-1 bg-white ${sharingCfg.text} ${sharingCfg.ring}`}>
                          <BedDouble size={9} />
                          {stay.sharingType.charAt(0).toUpperCase() + stay.sharingType.slice(1)}
                        </span>
                      )}
                      {stay.isCurrent && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500" />Current
                        </span>
                      )}
                      {stay.isFullyRefunded && stay.isVacatedRecord && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-green-50 text-green-700 ring-1 ring-green-200">
                          <CheckCircle size={10} /> Refunded
                        </span>
                      )}
                      {stay.isPartialRefund && stay.isVacatedRecord && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200">
                          <Clock size={10} /> Partial Refund
                        </span>
                      )}
                      {stay.refundStatus === "Pending Refund" && stay.isVacatedRecord && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                          <Clock size={10} /> Pending Refund
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-3 mt-0.5 flex-wrap text-[9px] sm:text-[10px] text-gray-500">
                      <span className="flex items-center gap-0.5"><BedDouble size={7} className="sm:size-[9px]" />Room {stay.room} · Bed {stay.bed}</span>
                      <span className="flex items-center gap-0.5">
                        <Calendar size={7} className="sm:size-[9px]" />
                        {stay.checkIn ? new Date(stay.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        {" — "}
                        {stay.checkOut ? new Date(stay.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Active"}
                      </span>
                      <span className="flex items-center gap-0.5 font-bold text-gray-700"><IndianRupee size={7} className="sm:size-[9px]" />{formatINR(stay.monthlyRent)}/mo</span>
                    </div>
                    <div className="flex gap-1 sm:gap-1.5 mt-1 flex-wrap">
                      {[
                        { label: `${stayPayments.length} payments`, bg: "bg-gray-50 border-gray-100 text-gray-500" },
                        { label: formatINR(stayRentPaid), bg: "bg-emerald-50 border-emerald-100 text-emerald-700" },
                        { label: `dep ${formatINR(stay.depositPaid)}`, bg: "bg-gray-50 border-gray-100 text-gray-500" },
                        { label: `${docsUploaded}/${docsTotal} docs`, bg: "bg-gray-50 border-gray-100 text-gray-500" },
                        ...(stay.partner ? [{ label: stay.partner.name, bg: "bg-rose-50 border-rose-100 text-rose-600" }] : []),
                      ].map(({ label, bg }) => (
                        <span key={label} className={`border rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-medium ${bg}`} style={fontStyle}>{label}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); doPrint(stay); }} className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Printer size={10} className="sm:size-[12px] text-gray-400" /></button>
                    <button onClick={e => { e.stopPropagation(); doDownload(stay); }} className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Download size={10} className="sm:size-[12px] text-gray-400" /></button>
                    {isOpen ? <ChevronUp size={11} className="sm:size-[13px] text-gray-400 ml-0.5" /> : <ChevronDown size={11} className="sm:size-[13px] text-gray-400 ml-0.5" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
                      {[
                        { key: "payments", label: "Payments", icon: <CreditCard size={8} className="sm:size-[10px]" /> },
                        { key: "documents", label: "Documents", icon: <FileText size={8} className="sm:size-[10px]" /> },
                        { key: "deposit", label: "Deposit", icon: <Shield size={8} className="sm:size-[10px]" /> },
                        { key: "terms", label: "Terms", icon: <ScrollText size={8} className="sm:size-[10px]" /> },
                        ...(stay.partner ? [{ key: "partner", label: "Partner", icon: <Heart size={8} className="sm:size-[10px]" /> }] : []),
                      ].map(t => (
                        <button
                          key={t.key}
                          onClick={() => setSectionMap(m => ({ ...m, [stay.id]: t.key }))}
                          className={`flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold whitespace-nowrap border-b-2 transition-colors ${
                            section === t.key ? "border-gray-900 text-gray-900 bg-white" : "border-transparent text-gray-400 hover:text-gray-600"
                          }`}
                          style={fontStyle}
                        >
                          {t.icon}{t.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-2 sm:p-3">
                      {section === "payments" && (
                        <div className="space-y-2">
                          <div className="rounded-lg border border-gray-100 overflow-hidden">
                            <table className="w-full text-[10px] sm:text-[11px]">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                  {["Date", "Amount", "Type", "Mode", "Status"].map(h => (
                                    <th key={h} className="text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap" style={fontStyle}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {stayPayments.length === 0 ? (
                                  <tr><td colSpan={5} className="text-center py-6 text-gray-400 text-xs" style={fontStyle}>No payment records</td></tr>
                                ) : stayPayments.map((p: any, idx: number) => {
                                  const approved = p.status === "approved" || p.status === "paid" || p.status === "refund" || p.status === "completed";
                                  const rejected = p.status === "rejected" || p.status === "failed";
                                  const isRefund = p.payment_type === "deposit_refund";
                                  const typeKey = p.payment_type || "";
                                  return (
                                    <tr key={p.id || idx} className={`border-t border-gray-50 hover:bg-gray-50/50 ${rejected ? "bg-red-50/20" : ""} ${isRefund && approved ? "bg-green-50/20" : ""}`}>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-500 whitespace-nowrap">{p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                                      <td className={`px-2 sm:px-3 py-1.5 sm:py-2 font-bold whitespace-nowrap ${rejected ? "text-red-400 line-through" : isRefund ? "text-green-600" : "text-gray-900"}`}>{formatINR(p.amount || 0)}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"><span className={`px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${typeColor[typeKey] ?? "bg-gray-100 text-gray-600"}`}>{typeDisplay[typeKey] || typeKey || "—"}</span></td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-500 whitespace-nowrap capitalize">{p.payment_mode || "—"}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                                        {approved && <span className="flex items-center gap-1 font-bold text-emerald-600"><CheckCircle2 size={8} className="sm:size-[9px]" />{p.status === "paid" ? "Paid" : p.status === "refund" ? "Refunded" : "Approved"}</span>}
                                        {rejected && <span className="flex items-center gap-1 font-bold text-red-500"><XCircle size={8} className="sm:size-[9px]" />{p.status === "failed" ? "Failed" : "Rejected"}</span>}
                                        {!approved && !rejected && <span className="flex items-center gap-1 font-bold text-amber-600"><Clock size={8} className="sm:size-[9px]" />{p.status ?? "Pending"}</span>}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-emerald-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                              <p className="text-[8px] sm:text-[9px] font-bold text-emerald-600 uppercase tracking-wider" style={fontStyle}>Rent Paid</p>
                              <p className="text-xs sm:text-sm font-black text-emerald-700">{formatINR(stayRentPaid)}</p>
                            </div>
                            <div className="bg-red-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                              <p className="text-[8px] sm:text-[9px] font-bold text-red-500 uppercase tracking-wider" style={fontStyle}>Total Penalty</p>
                              <p className="text-xs sm:text-sm font-black text-red-600">{formatINR(stay.totalPenalty || 0)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {section === "documents" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {docs.map(d => (
                            <div key={d.label} className={`rounded-lg border p-2 sm:p-2.5 ${!d.url ? "border-dashed border-gray-200 bg-gray-50" : "border-gray-100 bg-white"}`}>
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <FileText size={11} className="sm:size-[13px] text-blue-400" />
                                <BadgePill variant={d.url ? "blue" : "gray"}>{d.url ? "Uploaded" : "Not Uploaded"}</BadgePill>
                              </div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-gray-700" style={fontStyle}>{d.label}</p>
                              {d.type && <p className="text-[8px] sm:text-[9px] text-gray-400" style={fontStyle}>{d.type}</p>}
                              {d.number && <p className="text-[8px] sm:text-[9px] font-mono text-gray-500 mt-0.5">#{d.number}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {section === "deposit" && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              ["Security Deposit", formatINR(stay.securityDeposit), "text-gray-900"],
                              ["Deposit Paid", formatINR(stay.depositPaid), "text-emerald-600"],
                              ...(stay.isVacatedRecord ? [
                                ["Refund Amount", formatINR(stay.refundAmount ?? 0), "text-blue-600"],
                                ["Total Refunded", formatINR(stay.totalRefunded || 0),
                                  stay.isFullyRefunded ? "text-green-600" :
                                  stay.isPartialRefund ? "text-yellow-600" :
                                  stay.refundStatus === "Pending Refund" ? "text-amber-600" : "text-gray-600"
                                ],
                                ["Refund Status", stay.refundStatus ?? "N/A",
                                  stay.isFullyRefunded ? "text-green-600" :
                                  stay.isPartialRefund ? "text-yellow-600" :
                                  stay.refundStatus === "Pending Refund" ? "text-amber-600" : "text-gray-600"
                                ],
                              ] : []),
                            ].map(([k, v, c]) => (
                              <div key={k} className="bg-gray-50 rounded-lg p-2 sm:p-2.5">
                                <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-wider font-bold" style={fontStyle}>{k}</p>
                                <p className={`text-xs sm:text-sm font-black mt-0.5 ${c}`} style={fontStyle}>{v}</p>
                              </div>
                            ))}
                          </div>
                          {stay.refundPayments && stay.refundPayments.length > 0 && (
                            <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-[9px] font-semibold text-green-700 mb-1">Refund Payments</p>
                              {stay.refundPayments.map((rp: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-xs text-green-600 py-0.5 border-b border-green-100 last:border-0">
                                  <span>{rp.payment_date ? new Date(rp.payment_date).toLocaleDateString("en-IN") : "—"}</span>
                                  <span className="font-medium">₹{Number(rp.amount).toLocaleString()}</span>
                                  <span>{rp.payment_mode || "—"}</span>
                                  <span className="text-[8px]">{rp.status || "approved"}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {section === "terms" && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              ["Lock-in Period", stay.lockInPeriod],
                              // ✅ FIX: Show rate + amount for percentage, or just amount for fixed
                              ["Lock-in Penalty", stay.lockinPenaltyAmount > 0 ? (
                                stay.lockinPenaltyType === "percentage" && stay.lockinPenaltyRate > 0
                                  ? `${stay.lockinPenaltyRate}% of deposit (${formatINR(stay.lockinPenaltyAmount)})`
                                  : formatINR(stay.lockinPenaltyAmount)
                              ) : "—"],
                              ["Notice Period", stay.noticePeriod],
                              // ✅ FIX: Same for notice penalty
                              ["Notice Penalty", stay.noticePenaltyAmount > 0 ? (
                                stay.noticePenaltyType === "percentage" && stay.noticePenaltyRate > 0
                                  ? `${stay.noticePenaltyRate}% of deposit (${formatINR(stay.noticePenaltyAmount)})`
                                  : formatINR(stay.noticePenaltyAmount)
                              ) : "—"],
                            ].map(([k, v]) => (
                              <div key={k} className="bg-gray-50 rounded-lg p-2 sm:p-2.5">
                                <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-wider font-bold" style={fontStyle}>{k}</p>
                                <p className="text-[10px] sm:text-xs font-bold text-gray-800 mt-0.5" style={fontStyle}>{v}</p>
                              </div>
                            ))}
                          </div>
                          {stay.isVacatedRecord && (stay.lockinPenalty > 0 || stay.noticePenalty > 0 || stay.inspectionPenalty > 0) && (
                            <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                              <p className="text-[9px] font-semibold text-red-700 mb-1">Penalty Breakdown</p>
                              <div className="space-y-1 text-xs">
                                {stay.lockinPenalty > 0 && (
                                  <div className="flex justify-between text-red-600">
                                    <span>Lock-in Penalty</span>
                                    <span className="font-medium">₹{stay.lockinPenalty.toLocaleString()}</span>
                                  </div>
                                )}
                                {stay.noticePenalty > 0 && (
                                  <div className="flex justify-between text-red-600">
                                    <span>Notice Penalty</span>
                                    <span className="font-medium">₹{stay.noticePenalty.toLocaleString()}</span>
                                  </div>
                                )}
                                {stay.inspectionPenalty > 0 && (
                                  <div className="flex justify-between text-red-600">
                                    <span>Inspection Penalty</span>
                                    <span className="font-medium">₹{stay.inspectionPenalty.toLocaleString()}</span>
                                  </div>
                                )}
                                {stay.totalPenalty > 0 && (
                                  <div className="flex justify-between text-red-700 font-bold border-t border-red-200 pt-1 mt-1">
                                    <span>Total Penalty</span>
                                    <span>₹{stay.totalPenalty.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {stay.vacateReason && stay.vacateReason !== "—" && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-[9px] font-semibold text-gray-600 mb-1">Vacate Reason</p>
                              <p className="text-xs text-gray-700">{stay.vacateReason}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {section === "partner" && stay.partner && (
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            ["Name", stay.partner.name],
                            ["Phone", stay.partner.phone],
                            ["Relation", stay.partner.relation],
                          ].map(([k, v]) => (
                            <div key={k} className="bg-rose-50 rounded-lg p-2 sm:p-2.5">
                              <p className="text-[8px] sm:text-[9px] text-rose-400 uppercase tracking-wider font-bold" style={fontStyle}>{k}</p>
                              <p className="text-[10px] sm:text-xs font-bold text-gray-800 mt-0.5" style={fontStyle}>{v}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ID Card Modal ────────────────────────────────────────────────────────────
function TenantIdCard({ tenant, assignment, onClose }: { tenant: any; assignment: any; onClose: () => void }) {
  const aadharNum = tenant.aadhar_number ?? 
    (tenant.id_proof_type === "Aadhar Card" ? tenant.id_proof_number : null) ?? 
    (tenant.address_proof_type === "Aadhar Card" ? tenant.address_proof_number : null) ?? null;
  const panNum = tenant.pan_number ?? 
    (tenant.id_proof_type === "PAN Card" ? tenant.id_proof_number : null) ?? 
    (tenant.address_proof_type === "PAN Card" ? tenant.address_proof_number : null) ?? null;
  const maskedAadhar = aadharNum ? `XXXX XXXX ${String(aadharNum).replace(/\s/g, "").slice(-4)}` : null;
  const stay = {
    room: assignment?.room?.room_number || "—",
    bed: assignment?.bed_number || "—",
    property: assignment?.property?.name || "—",
    checkIn: tenant.check_in_date ? new Date(tenant.check_in_date).toLocaleDateString("en-IN") : "—",
    checkOut: tenant.vacate_records?.[0]?.requested_vacate_date ? new Date(tenant.vacate_records[0].requested_vacate_date).toLocaleDateString("en-IN") : null,
    isActive: tenant.is_active,
  };

  const handleShare = async () => {
    const text = `Resident ID Card\n${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}\nID: #${tenant.id}\nRoom: ${stay.room} · ${stay.property}\nPhone: ${tenant.country_code} ${tenant.phone}\nCheck-in: ${stay.checkIn}${stay.checkOut ? "\nVacated: " + stay.checkOut : ""}`;
    if (navigator.share) {
      await navigator.share({ title: "Resident ID Card", text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Details copied to clipboard!");
    }
  };

 

  // ─── Print / PDF helpers for TenantIdCard ──────────────────────────────
const buildCardHTML = () => {
   const aadharNum = tenant.aadhar_number ?? 
    (tenant.id_proof_type === "Aadhar Card" ? tenant.id_proof_number : null) ?? 
    (tenant.address_proof_type === "Aadhar Card" ? tenant.address_proof_number : null) ?? null;
  const panNum = tenant.pan_number ?? 
    (tenant.id_proof_type === "PAN Card" ? tenant.id_proof_number : null) ?? 
    (tenant.address_proof_type === "PAN Card" ? tenant.address_proof_number : null) ?? null;
  const maskedAadhar = aadharNum ? `XXXX XXXX ${String(aadharNum).replace(/\s/g, "").slice(-4)}` : null;
  const stay = {
    room: assignment?.room?.room_number || "—",
    bed: assignment?.bed_number || "—",
    property: assignment?.property?.name || "—",
    checkIn: tenant.check_in_date ? new Date(tenant.check_in_date).toLocaleDateString("en-IN") : "—",
    checkOut: tenant.vacate_records?.[0]?.requested_vacate_date
      ? new Date(tenant.vacate_records[0].requested_vacate_date).toLocaleDateString("en-IN")
      : null,
    isActive: tenant.is_active,
  };

  return `<!DOCTYPE html><html><head><title>Resident ID Card · ${tenant.full_name}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;padding:24px}
  .page{display:flex;flex-direction:column;gap:20px;align-items:center}
  .card{width:340px;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35)}
  .front{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%);padding:20px;position:relative;min-height:200px}
  .front-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
  .org{display:flex;align-items:center;gap:8px}
  .org-icon{width:28px;height:28px;background:#2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center}
  .org-icon svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .org-name{font-size:11px;font-weight:800;color:#fff;letter-spacing:.02em}
  .org-sub{font-size:8px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.07em;margin-top:1px}
  .id-tag{font-size:8px;font-weight:800;color:#64748b;letter-spacing:.08em;text-transform:uppercase;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:3px 8px;border-radius:6px}
  .profile-row{display:flex;align-items:center;gap:14px}
  .avatar{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;flex-shrink:0;box-shadow:0 4px 16px rgba(37,99,235,.5);border:2px solid rgba(255,255,255,.15)}
  .profile-info .name{font-size:16px;font-weight:900;color:#fff;line-height:1.1}
  .profile-info .sub{font-size:10px;color:#94a3b8;margin-top:3px}
  .profile-info .sub span{font-weight:700;color:#cbd5e1}
  .stripe{height:3px;background:linear-gradient(90deg,#2563eb,#06b6d4,#2563eb);border-radius:0;margin:14px -20px;width:calc(100% + 40px)}
  .fields{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin-top:2px}
  .field .lbl{font-size:7.5px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin-bottom:2px}
  .field .val{font-size:10.5px;font-weight:700;color:#e2e8f0;font-family:monospace}
  .field .val-normal{font-size:10px;font-weight:700;color:#e2e8f0;font-family:system-ui,sans-serif}
  .field-full{grid-column:span 2}
  .status-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:${stay.isActive ? "#10b981" : "#94a3b8"};margin-right:4px;vertical-align:middle}
  .back{background:#f8fafc;border:1.5px solid #e2e8f0;padding:18px;min-height:190px}
  .back-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:10px;border-bottom:1.5px solid #e2e8f0}
  .back-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#334155}
  .back-id{font-size:9px;font-weight:700;color:#94a3b8;font-family:monospace}
  .back-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:12px}
  .bf .lbl{font-size:7.5px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:2px}
  .bf .val{font-size:10px;font-weight:700;color:#1e293b}
  .bf .val-mono{font-size:10px;font-weight:700;color:#1e293b;font-family:monospace}
  .bf-full{grid-column:span 2}
  .qr-section{display:flex;align-items:flex-end;justify-content:space-between;margin-top:auto;padding-top:10px;border-top:1.5px solid #e2e8f0}
  .qr-box{width:48px;height:48px;border:1.5px solid #e2e8f0;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center}
  .qr-grid{display:grid;grid-template-columns:repeat(5,6px);grid-template-rows:repeat(5,6px);gap:1px}
  .qr-c{width:6px;height:6px;border-radius:1px}
  .disclaimer{font-size:8px;color:#94a3b8;line-height:1.4;max-width:220px}
  .disclaimer strong{color:#64748b}
  @media print{body{background:#fff;min-height:auto;padding:0}.page{gap:32px}.card{box-shadow:0 0 0 1.5px #e2e8f0}}
</style></head><body>
<div class="page">
  <div class="card">
    <div class="front">
      <div class="front-header">
        <div class="org">
          <div class="org-icon"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          <div><div class="org-name">Roomac Co-Living</div><div class="org-sub">Resident Identity Card</div></div>
        </div>
        <div class="id-tag">RESIDENT</div>
      </div>
      <div class="profile-row">
        <div class="avatar">${tenant.full_name?.charAt(0)?.toUpperCase() ?? "?"}</div>
        <div class="profile-info">
          <div class="name">${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}</div>
          <div class="sub">ID <span>${tenant.id}</span> &nbsp;·&nbsp; <span class="status-dot"></span><span>${stay.isActive ? "Active" : "Inactive"}</span></div>
          <div class="sub" style="margin-top:2px">Room <span>${stay.room}</span> &nbsp;·&nbsp; <span>${stay.property}</span></div>
        </div>
      </div>
      <div class="stripe"></div>
      <div class="fields">
        <div class="field"><div class="lbl">Check-in</div><div class="val">${stay.checkIn}</div></div>
        <div class="field"><div class="lbl">${stay.checkOut ? "Vacated On" : "Valid Until"}</div><div class="val">${stay.checkOut ?? "Active"}</div></div>
        <div class="field"><div class="lbl">Bed</div><div class="val-normal">${stay.bed}</div></div>
        <div class="field"><div class="lbl">ID</div><div class="val-normal">#${tenant.id}</div></div>
        ${aadharNum ? `<div class="field field-full"><div class="lbl">Aadhar (partial)</div><div class="val">XXXX XXXX ${String(aadharNum).replace(/\s/g,"").slice(-4)}</div></div>` : ""}
      </div>
    </div>
  </div>
  <div class="card">
    <div class="back">
      <div class="back-header">
        <div class="back-title">Resident Details</div>
        <div class="back-id">#${tenant.id} · ${new Date().toLocaleDateString("en-IN",{month:"short",year:"numeric"})}</div>
      </div>
      <div class="back-fields">
        <div class="bf"><div class="lbl">Full Name</div><div class="val">${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}</div></div>
        <div class="bf"><div class="lbl">Gender</div><div class="val">${tenant.gender || "—"}</div></div>
        <div class="bf"><div class="lbl">Date of Birth</div><div class="val">${tenant.date_of_birth ? new Date(tenant.date_of_birth).toLocaleDateString("en-IN") : "—"}</div></div>
        <div class="bf"><div class="lbl">Phone</div><div class="val-mono">${tenant.country_code || ""} ${tenant.phone || "—"}</div></div>
        <div class="bf bf-full"><div class="lbl">Email</div><div class="val">${tenant.email || "—"}</div></div>
        ${aadharNum ? `<div class="bf"><div class="lbl">Aadhar No.</div><div class="val-mono">${maskedAadhar}</div></div>` : ""}
        ${panNum ? `<div class="bf"><div class="lbl">PAN No.</div><div class="val-mono">${panNum}</div></div>` : ""}
        <div class="bf bf-full"><div class="lbl">Address</div><div class="val">${tenant.address || "—"}</div></div>
        ${tenant.emergency_contact_name ? `<div class="bf bf-full"><div class="lbl">Emergency Contact</div><div class="val">${tenant.emergency_contact_name} · ${tenant.emergency_contact_phone || ""} (${tenant.emergency_contact_relation || ""})</div></div>` : ""}
      </div>
      <div class="qr-section">
        <div class="disclaimer"><strong>Roomac Co-Living</strong><br>This card is issued to the above resident. Valid for entry at the registered property only. Report loss immediately to the management.</div>
        <div class="qr-box">
          <div class="qr-grid">
            ${Array.from({length:25},(_,i)=>{const on=[0,1,2,3,4,5,6,10,14,15,16,17,18,19,20,24].includes(i);return `<div class="qr-c" style="background:${on?"#1e293b":"#f8fafc"}"></div>`;}).join("")}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</body></html>`;
};

const handlePrint = () => {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(buildCardHTML());
  w.document.close();
  w.print();
};

const handlePDF = () => {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(buildCardHTML());
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 400);
};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0D2567, #1B3FA0)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F5A623] flex items-center justify-center"><IdCardIcon size={13} className="text-white" /></div>
            <div>
              <p className="text-xs font-black text-white" style={fontStyle}>Resident ID Card</p>
              <p className="text-[9px] text-blue-300" style={fontStyle}>{tenant.id} · {tenant.full_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold transition-colors">✕</button>
        </div>

        <div className="p-5 bg-slate-50">
          <div className="rounded-2xl p-4 shadow-xl ring-1 ring-slate-700/50 mb-3" style={{ background: "linear-gradient(135deg, #0D2567 0%, #1B3FA0 60%, #0D2567 100%)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#F5A623] rounded-lg flex items-center justify-center"><Building2 size={11} className="text-white" /></div>
                <div>
                  <p className="text-[10px] font-black text-white" style={fontStyle}>Roomac Co-Living</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest" style={fontStyle}>Resident ID Card</p>
                </div>
              </div>
              <span className="text-[8px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded" style={fontStyle}>RESIDENT</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5A623] to-amber-500 flex items-center justify-center text-white font-black text-base shadow-lg flex-shrink-0 ring-2 ring-amber-500/30">
                {tenant.full_name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="text-sm font-black text-white leading-tight" style={fontStyle}>
                  {tenant.salutation ? `${tenant.salutation} ` : ""}{tenant.full_name}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5" style={fontStyle}>ID <span className="font-bold text-slate-300">{tenant.id}</span> · {stay.room} · {stay.property}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${stay.isActive ? "bg-emerald-400" : "bg-slate-500"}`} />
                  <span className="text-[8px] font-bold text-slate-400" style={fontStyle}>{stay.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
            <div className="h-0.5 rounded-full mb-3 -mx-4" style={{ background: "linear-gradient(90deg, #F5A623, #fbbf24, #F5A623)" }} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider" style={fontStyle}>Check-in</p>
                <p className="text-[10px] font-bold text-slate-300 font-mono">{stay.checkIn}</p>
              </div>
              <div>
                <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider" style={fontStyle}>{stay.checkOut ? "Vacated" : "Bed"}</p>
                <p className="text-[10px] font-bold text-slate-300" style={fontStyle}>{stay.checkOut ?? stay.bed}</p>
              </div>
              {maskedAadhar && (
                <div className="col-span-2">
                  <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider" style={fontStyle}>Aadhar (last 4)</p>
                  <p className="text-[10px] font-bold text-slate-300 font-mono">{maskedAadhar}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Phone", value: `${tenant.country_code || ""} ${tenant.phone || "—"}`, mono: true },
              { label: "Aadhar", value: maskedAadhar ?? "Not uploaded", mono: true },
              { label: "PAN", value: panNum ?? "Not provided", mono: true },
              { label: "Emergency", value: tenant.emergency_contact_name ?? "—", mono: false },
            ].map(({ label, value, mono }) => (
              <div key={label} className="bg-white rounded-lg border border-slate-100 px-2.5 py-2">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest" style={fontStyle}>{label}</p>
                <p className={`text-[10px] font-bold text-slate-700 mt-0.5 truncate ${mono ? "font-mono" : ""}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

       <div className="px-5 pb-5 pt-1 grid grid-cols-3 gap-2">
  <button
    onClick={handlePrint}
    className="flex items-center justify-center gap-1.5 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700"
  >
    <Printer size={15} />
    <span className="text-[10px] font-semibold uppercase">Print</span>
  </button>

  <button
    onClick={handlePDF}
    className="flex items-center justify-center gap-1.5 h-11 rounded-xl text-white hover:opacity-90 transition-opacity"
    style={{ background: "#0D2567" }}
  >
    <Download size={15} />
    <span className="text-[10px] font-semibold uppercase">Save PDF</span>
  </button>

  <button
    onClick={handleShare}
    className="flex items-center justify-center gap-1.5 h-11 rounded-xl bg-[#F5A623] hover:bg-amber-500 transition-colors text-white"
  >
    <Share2 size={15} />
    <span className="text-[10px] font-semibold uppercase">Share</span>
  </button>
</div>
        <p className="text-center text-[9px] text-slate-400 pb-3" style={fontStyle}>For security verification or tenant entry purposes</p>
      </div>
    </div>
  );
}

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: React.ReactNode; countKey?: string }[] = [
  { id: "overview",   label: "Overview",     icon: <User size={12} /> },
  { id: "documents",  label: "Documents",    icon: <FileText size={12} /> },
  { id: "payments",   label: "Payments",     icon: <CreditCard size={12} /> },
  { id: "partner",    label: "Partner",      icon: <Heart size={12} /> },
  { id: "history",    label: "Stay History", icon: <History size={12} />, countKey: "stayHistory" },
];

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tid = params.id as string;

  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState<PartnerDetails | null>(null);
  const [effectiveTenantIdForPayments, setEffectiveTenantIdForPayments] = useState<string | number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
const [editInitialTab, setEditInitialTab] = useState<string>("basic");
const [orgSettings, setOrgSettings] = useState<{ logoUrl: string; orgName: string }>({
  logoUrl: "",
  orgName: "Roomac Co-Living",
});

useEffect(() => {
  (async () => {
    try {
      const settings: any = await getSettings(); // already { logo_header: {value...}, ... }
      if (settings && typeof settings === "object") {
        const logo =
          settings.logo_header?.value ||
          settings.logo_admin_sidebar?.value ||
          settings.logo_footer?.value ||
          "";
        const name = settings.site_name?.value || "Roomac Co-Living";
        const resolvedLogo = logo ? resolveUrl(logo) : "";
        setOrgSettings({ logoUrl: resolvedLogo, orgName: name });
      }
    } catch (e) {
      console.error("Failed to load org settings for print branding", e);
    }
  })();
}, []);

  useEffect(() => {
    if (tid) loadTenant();
  }, [tid]);

  useEffect(() => {
  if (tid && effectiveTenantIdForPayments) {
    loadPayments();
  }
}, [tid, effectiveTenantIdForPayments]);

const loadTenant = async () => {
  try {
    setLoading(true);
    const r: any = await getTenantById(tid);
    if (r?.success && r.data) {
      let tenantData = r.data;

      const assignmentData = tenantData.current_assignment || null;

      const isVacated = tenantData.is_vacated === true ||
                        (tenantData.vacate_records && tenantData.vacate_records.length > 0 && !tenantData.is_active);

      if (tenantData.is_active && assignmentData && !assignmentData.is_vacated) {
        tenantData.assigned_property_name = assignmentData.property?.name || null;
        tenantData.assigned_room_number = assignmentData.room?.room_number || null;
        tenantData.assigned_bed_number = assignmentData.bed_number || null;
        tenantData.monthly_rent = assignmentData.tenant_rent || 0;
        tenantData.security_deposit = assignmentData.security_deposit || 0;
        tenantData.room_number = assignmentData.room?.room_number || null;
        tenantData.bed_number = assignmentData.bed_number || null;
        tenantData.property_name = assignmentData.property?.name || null;
        tenantData.property_id = assignmentData.property?.id || null;
        tenantData.room_id = assignmentData.room?.id || null;
      } else if (isVacated && tenantData.vacate_records && tenantData.vacate_records.length > 0) {
        const latestVacate = tenantData.vacate_records[0];
        tenantData.vacated_date = latestVacate.requested_vacate_date;
        tenantData.vacate_rent_amount = latestVacate.rent_amount || 0;
        tenantData.vacate_security_deposit = latestVacate.security_deposit_amount || 0;
        tenantData.assigned_property_name = latestVacate.property_name || null;
        tenantData.assigned_room_number = latestVacate.room_number || null;
        tenantData.assigned_bed_number = latestVacate.bed_number || null;
      }

      setAssignment(assignmentData);

      // ✅ SIMPLIFIED: Always use the REQUESTED tenant's own ID for payments.
      // The backend (getTenantPaymentFormData / getVacatedTenantPaymentFormData)
      // already resolves the partner internally — whether the partner holds
      // the bed assignment, the payments, or both. No need to pre-guess here;
      // pre-guessing based on "does THIS tenant have an assignment" is wrong
      // because assignment ownership and payment ownership can be split
      // independently between the two partners.
      setEffectiveTenantIdForPayments(tenantData.id);

      const vacateRecord = tenantData.vacate_records?.[0] ?? null;
      if (vacateRecord?.rent_amount) tenantData.vacate_rent_amount = vacateRecord.rent_amount;

      setTenant(tenantData);

      // Partner tab is for the CURRENT pairing only — a vacated tenant's
// partner_full_name comes from the vacate-record snapshot (for Stay
// History), but shouldn't leak into the top-level Partner tab.
const isCurrentlyCoupled =
  tenantData.is_active &&
  (tenantData.is_couple_booking === true || tenantData.is_couple_booking === 1) &&
  !!assignmentData &&
  !assignmentData.is_vacated;

if (isCurrentlyCoupled && tenantData.partner_full_name) {
  setPartnerDetails({
    salutation: tenantData.partner_salutation || "Mr.",
    full_name: tenantData.partner_full_name || "",
    country_code: tenantData.partner_country_code || "",
    phone: tenantData.partner_phone || "",
    email: tenantData.partner_email || "",
    gender: tenantData.partner_gender || "",
    date_of_birth: tenantData.partner_date_of_birth || "",
    address: tenantData.partner_address || "",
    occupation: tenantData.partner_occupation || "",
    organization: tenantData.partner_organization || "",
    relationship: tenantData.partner_relationship || "Spouse",
    id_proof_type: tenantData.partner_id_proof_type || "",
    id_proof_number: tenantData.partner_id_proof_number || "",
    id_proof_url: tenantData.partner_id_proof_url || null,
    address_proof_type: tenantData.partner_address_proof_type || "",
    address_proof_number: tenantData.partner_address_proof_number || "",
    address_proof_url: tenantData.partner_address_proof_url || null,
    photo_url: tenantData.partner_photo_url || null,
  });
} else {
  setPartnerDetails(null);
}
    } else {
      setError("Failed to load tenant details");
    }
  } catch (err) {
    console.error(err);
    setError("An error occurred while fetching tenant details");
  } finally {
    setLoading(false);
  }
};

const loadPayments = async () => {
  setLoadingPayments(true);
  try {
    // ✅ Use the effective tenant ID for payments
    const paymentTenantId = effectiveTenantIdForPayments || tid;
    if (!paymentTenantId) { 
      setLoadingPayments(false); 
      return; 
    }
    
    console.log(`📊 Loading payments for tenant: ${paymentTenantId}`);
    
    const formResult = await paymentApi.getTenantPaymentFormData(paymentTenantId.toString());
    if (formResult.success && formResult.data) {
      setPaymentSummary(formResult.data);
      
      // ✅ If the payment tenant ID is different from the requested tenant,
      // the payment summary contains data from the partner
      if (paymentTenantId !== parseInt(tid)) {
        console.log(`📊 Using payment data from partner ${paymentTenantId}`);
      }
      
      const paymentsData: any = await request(`/api/payments/tenant/${paymentTenantId}`);
      if (paymentsData.success) {
        // ✅ Store payments from the effective tenant
        setPayments(paymentsData.data || []);
      } else {
        setPayments([]);
      }
    } else {
      setPaymentSummary(null);
      setPayments([]);
    }
  } catch (error) {
    console.error("Error loading payments:", error);
    setPaymentSummary(null);
    setPayments([]);
  } finally {
    setLoadingPayments(false);
  }
};

  const viewDoc = (url: string) => {
    if (!url) { toast.error("Document not available"); return; }
    viewDocument(url);
  };

  const previewReceipt = async (id: number) => {
    try {
      toast.loading("Loading receipt...", { id: "receipt-preview" });
      const response = await fetch(`${getApiUrl()}/api/payments/receipts/${id}/preview-pdf`);
      if (!response.ok) throw new Error("Failed to load receipt");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const modal = document.createElement("div");
      modal.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;";
      const modalContent = document.createElement("div");
      modalContent.style.cssText = "width:720px;max-width:90vw;height:90vh;background:white;border-radius:12px;position:relative;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.2);";
      const headerBar = document.createElement("div");
      headerBar.style.cssText = "padding:12px 20px;background:#1B3FA0;color:white;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;";
      headerBar.innerHTML = `<span style="font-weight:600;font-size:14px;">Payment Receipt</span><button id="closePreviewBtn" style="background:none;border:none;color:white;cursor:pointer;font-size:20px;">&times;</button>`;
      const pdfViewer = document.createElement("iframe");
      pdfViewer.style.cssText = "width:100%;flex:1;border:none;";
      pdfViewer.src = url;
      modalContent.appendChild(headerBar);
      modalContent.appendChild(pdfViewer);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      const closeBtn = headerBar.querySelector("#closePreviewBtn");
      closeBtn?.addEventListener("click", () => { URL.revokeObjectURL(url); modal.remove(); toast.dismiss("receipt-preview"); });
      modal.onclick = (e) => { if (e.target === modal) { URL.revokeObjectURL(url); modal.remove(); toast.dismiss("receipt-preview"); } };
      toast.dismiss("receipt-preview");
      toast.success("Receipt loaded");
    } catch {
      toast.dismiss("receipt-preview");
      toast.error("Failed to load receipt preview");
    }
  };

  const downloadReceipt = (id: number) => window.open(`/api/payments/receipts/${id}/download`, "_blank");

  const handleCopyEmail = async () => {
    if (!tenant?.email) return;
    await navigator.clipboard.writeText(tenant.email);
    setCopiedEmail(true);
    toast.success("Email copied!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = async () => {
    if (!tenant?.phone) return;
    await navigator.clipboard.writeText(`${tenant.country_code}${tenant.phone}`);
    setCopiedPhone(true);
    toast.success("Phone copied!");
    setTimeout(() => setCopiedPhone(false), 2000);
  };

 const handleEdit = () => {
  setEditInitialTab("basic");
  setIsEditOpen(true);
};

const handleUploadDoc = (docType: string) => {
  setEditInitialTab("documents"); // jumps straight to Documents tab
  setIsEditOpen(true);
};

  if (loading) return <LoadingSkeleton />;

  if (error || !tenant) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-xl border border-slate-100">
        <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-white" />
        </div>
        <p className="font-bold text-lg text-slate-900 mb-2" style={fontStyle}>Tenant Not Found</p>
        <p className="text-sm text-slate-500 mb-6" style={fontStyle}>{error || "The tenant doesn't exist or has been removed."}</p>
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm hover:opacity-90 transition-all" style={{ background: "#1B3FA0", ...fontStyle }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );

  const vacateRecord = tenant.vacate_records?.[0] ?? null;

  const rentVal = (() => {
    if (vacateRecord?.rent_amount) return formatINR(vacateRecord.rent_amount);
    if (assignment?.tenant_rent) return formatINR(assignment.tenant_rent);
    if (tenant.monthly_rent) return formatINR(tenant.monthly_rent);
    return "N/A";
  })();

  const roomVal = (() => {
    if (assignment) return `Room ${assignment.room?.room_number || "—"} · Bed ${assignment.bed_number || "—"}`;
    if (tenant.bed_number) return `Room ${tenant.room_number || "—"} · Bed ${tenant.bed_number}`;
    return "Not Assigned";
  })();

  return (
    <div className=" bg-slate-100" style={fontStyle}>
      <div className="max-w-9xl mx-auto px-2 sm:px-2 py-4 space-y-3">

{/* ── Tenant Header (Roomac brand dark) ── */}
<div className="rounded-xl shadow-lg overflow-hidden border border-[#0D2567]/40" style={{ background: "linear-gradient(135deg, #0D2567 0%, #1B3FA0 100%)" }}>
  <div className="overflow-x-auto">
    <div className="flex items-stretch min-h-[50px] sm:min-h-[60px] flex-nowrap w-max sm:w-full px-2 sm:px-0 py-2 sm:py-0">

      {/* Left — back + identity */}
      <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 flex-shrink-0 border-r border-white/10">
        <button onClick={() => router.back()}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white flex-shrink-0">
          <ArrowLeft size={11} className="sm:size-[13px]" />
        </button>
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-lg ring-2 ring-[#F5A623]/40"
            style={{ background: "linear-gradient(135deg, #F5A623, #d97706)" }}>
            {tenant.photo_url ? (
              <img src={resolveUrl(tenant.photo_url)} alt={tenant.full_name} className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : tenant.full_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-[#0D2567] ${tenant.is_active ? "bg-emerald-400" : "bg-slate-500"}`} />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] sm:text-sm font-black text-white whitespace-nowrap block">
            {tenant.salutation ? `${tenant.salutation} ` : ""}{tenant.full_name}
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
            <BadgePill variant={tenant.is_active ? "green" : "gray"}>
              {tenant.is_active ? "Active" : "Inactive"}
            </BadgePill>
            <span className="text-[8px] sm:text-[9px] text-blue-300 font-mono">{tenant.id}</span>
          </div>
        </div>
      </div>

      {/* Centre — stat pills (flex row on mobile, grid on desktop) */}
      <div className="flex-1 flex flex-nowrap sm:grid sm:grid-cols-4 divide-x divide-white/10 min-w-0">
        {[
          { 
            title: "Member Since", 
            value: tenant.check_in_date ? new Date(tenant.check_in_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A", 
            icon: <CalendarDays size={9} className="sm:size-[11px]" />, 
            color: "text-[#F5A623]" 
          },
          { 
            title: "Monthly Rent", 
            // ✅ FIX: Use current assignment rent if available
            value: (() => {
              if (assignment?.tenant_rent) return formatINR(assignment.tenant_rent);
              if (tenant.monthly_rent) return formatINR(tenant.monthly_rent);
              return "N/A";
            })(),
            icon: <IndianRupee size={9} className="sm:size-[11px]" />, 
            color: "text-emerald-400" 
          },
          { 
            title: "Room / Bed", 
            // ✅ FIX: Use current assignment room/bed if available
            value: (() => {
              if (assignment) return `Room ${assignment.room?.room_number || "—"} · Bed ${assignment.bed_number || "—"}`;
              if (tenant.bed_number) return `Room ${tenant.room_number || "—"} · Bed ${tenant.bed_number}`;
              return "Not Assigned";
            })(),
            icon: <BedDouble size={9} className="sm:size-[11px]" />, 
            color: "text-violet-300" 
          },
          { 
            title: "Property", 
            // ✅ FIX: Use current assignment property if available
            value: assignment?.property?.name || tenant.assigned_property_name || "Not Assigned", 
            icon: <Building2 size={9} className="sm:size-[11px]" />, 
            color: "text-amber-300" 
          },
        ].map(({ title, value, icon, color }) => (
          <div key={title} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 hover:bg-white/5 transition-colors min-w-0 flex-shrink-0">
            <span className={`flex-shrink-0 ${color}`}>{icon}</span>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] font-bold text-blue-300 uppercase tracking-widest truncate">{title}</p>
              <p className="text-[10px] sm:text-[11px] font-bold text-white truncate mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Right — created + vacated (only show vacated if actually vacated) */}
      <div className="flex flex-col justify-center items-end gap-1 px-2 sm:px-4 py-2 sm:py-3 flex-shrink-0 border-l border-white/10">
        <div className="flex flex-col items-end gap-0.5">
          <p className="text-[8px] sm:text-[9px] font-bold text-blue-300 uppercase tracking-widest">Created</p>
          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-bold text-white">
            <Calendar size={8} className="sm:size-[10px] text-blue-300" />
            {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
          </div>
        </div>
        {/* ✅ FIX: Only show vacated date if tenant is actually vacated (no active assignment) */}
        {!tenant.is_active && tenant.vacate_records?.length > 0 && !assignment && (
          <div className="flex flex-col items-end gap-0.5">
            <p className="text-[8px] sm:text-[9px] font-bold text-blue-300 uppercase tracking-widest">Vacated</p>
            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-bold text-red-400">
              <LogOut size={8} className="sm:size-[10px]" />
              {new Date(tenant.vacate_records[0].requested_vacate_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

        {/* ── Tab content ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto max-h-[520px]">
          <div className="border-b border-slate-100 overflow-x-auto sticky top-0 z-10" style={{ background: "#f8fafc" }}>
            <div className="flex min-w-max px-1 pt-1 sticky top-0 z-10">
              {TABS.map(tab => {
                const stayCount = tab.countKey === "stayHistory"
  ? (tenant?.stay_history?.length ?? 0)
  : 0;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold rounded-t-lg mr-0.5 transition-all border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-[#1B3FA0] bg-white shadow-sm"
                        : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-white/70"
                    }`}
                    style={{ borderBottomColor: activeTab === tab.id ? "#1B3FA0" : "transparent", ...fontStyle }}
                  >
                    {tab.icon} {tab.label}
                    {tab.countKey && stayCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#1B3FA0] text-white">
                        {stayCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4">
            {activeTab === "overview" && (
  <OverviewTab
    tenant={tenant}
    assignment={assignment}
    paymentSummary={paymentSummary}
    payments={payments}
    onIdCard={() => setShowIdCard(true)}
    onEdit={handleEdit}
    copiedEmail={copiedEmail}
    copiedPhone={copiedPhone}
    onCopyEmail={handleCopyEmail}
    onCopyPhone={handleCopyPhone}
    orgLogo={orgSettings.logoUrl}
    orgName={orgSettings.orgName}
  />
)}
{activeTab === "documents" && (
  <DocumentsTab tenant={tenant} onView={viewDoc} onUpload={handleUploadDoc} />
)}            {activeTab === "payments" && (
              <PaymentsTab
                payments={payments}
                paymentSummary={paymentSummary}
                loadingPayments={loadingPayments}
                onPreviewReceipt={previewReceipt}
                onDownloadReceipt={downloadReceipt}
              />
            )}
            {activeTab === "partner" && <PartnerTab partnerDetails={partnerDetails} onView={viewDoc} />}
{activeTab === "history" && (
  <HistoryTab tenant={tenant} orgLogo={orgSettings.logoUrl} orgName={orgSettings.orgName} />
)}       </div>
        </div>
      </div>

{isEditOpen && (
  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
    <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">
      {/* Visible header */}
      <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0">
        <DialogTitle className="text-sm md:text-base font-semibold text-white">
          Edit Tenant: {tenant?.full_name || ""}
        </DialogTitle>
        <button
          onClick={() => setIsEditOpen(false)}
          className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto">
        <TenantForm
          tenant={tenant}
          initialTab={editInitialTab}
          onSuccess={async () => {
            setIsEditOpen(false);
            await loadTenant();
          }}
          onCancel={() => setIsEditOpen(false)}
        />
      </div>
    </DialogContent>
  </Dialog>
)}
      {showIdCard && <TenantIdCard tenant={tenant} assignment={assignment} onClose={() => setShowIdCard(false)} />}
    </div>
  );
}