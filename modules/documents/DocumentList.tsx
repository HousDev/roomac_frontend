

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText, Eye, Share2, Trash2, CheckCircle, X,
  Printer, AlertCircle, RefreshCw, Filter,
  Download, Mail, MessageCircle, Shield,
  Loader2, Phone, Square, CheckSquare,
  Copy, Link, PenLine, PauseCircle, XCircle,
  Smartphone, Globe, Plus, Check,
  QrCode, ArrowRight, Send, ChevronDown,
  User, Clock, ShieldCheck, Pen, Edit,
  Palette, Layout, Type, Image as ImageIcon,
  Save, AlertTriangle, Hash, Calendar,
  Home, Users, CreditCard, FileSignature,
  MailCheck, PhoneCall, QrCode as QrCodeIcon,
  Sparkles, Rocket, Zap, BellRing,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Badge }    from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import Swal from "sweetalert2";

import * as XLSX from 'xlsx';

import {
  listDocuments, getDocument, deleteDocument, updateDocumentStatus,
  bulkDeleteDocuments, updateDocument,
  type Document as Doc, type DocumentStatus,
} from "@/lib/documentlistApi";

// ── Timeline step definitions ─────────────────────────────────────────────────
const MAIN_STEPS: Array<{
  key: string;
  label: string;
  short: string;
  Icon: React.FC<any>;
  headerColor: string;
  headerGradient: string;
  accentColor: string;
}> = [
  { 
    key: "Created",        
    label: "Created",       
    short: "Created",  
    Icon: FileText,
    headerColor: "from-green-600 to-green-800",
    headerGradient: "bg-gradient-to-r from-blue-600 to-blue-700",
    accentColor: "blue"
  },
  { 
    key: "Shared",         
    label: "Shared",        
    short: "Shared",   
    Icon: Share2,
    headerColor: "from-green-600 to-green-800",
    headerGradient: "bg-gradient-to-r from-green-600 to-green-800",
    accentColor: "green"
  },
  { 
    key: "On Hold",        
    label: "On Hold",        
    short: "On Hold",  
    Icon: PauseCircle,
    headerColor: "from-orange-500 to-orange-600",
    headerGradient: "bg-gradient-to-r from-orange-500 to-orange-600",
    accentColor: "orange"
  },
  { 
    key: "OTP Verified",   
    label: "OTP Verified",  
    short: "OTP",      
    Icon: ShieldCheck,
    headerColor: "from-purple-600 to-purple-700",
    headerGradient: "bg-gradient-to-r from-purple-600 to-purple-700",
    accentColor: "purple"
  },
  { 
    key: "E-Sign Pending", 
    label: "E-Sign Pending",
    short: "E-Sign",   
    Icon: Pen,
    headerColor: "from-indigo-600 to-indigo-700",
    headerGradient: "bg-gradient-to-r from-indigo-600 to-indigo-700",
    accentColor: "indigo"
  },
 { 
  key: "Completed",      
  label: "Completed",     
  short: "Done",     
  Icon: CheckCircle,
  headerColor: "from-green-500 to-green-800",
  headerGradient: "bg-gradient-to-r from-green-500 to-green-800",  // Changed from emerald to green
  accentColor: "green"  // Changed from emerald to green
},
];

// Cancelled step definition
const CANCELLED_STEP = {
  key: "Cancelled",
  label: "Cancelled",
  short: "Cancel",
  Icon: XCircle,
  headerColor: "from-red-600 to-red-700",
  headerGradient: "bg-gradient-to-r from-red-600 to-red-700",
  accentColor: "red"
};

// Popup action per step
const STEP_POPUP: Record<string, string> = {
  "Shared":          "share",
  "On Hold":         "hold",
  "OTP Verified":    "otp",
  "E-Sign Pending":  "esign",
  "Completed":       "complete",
};

function stepIndex(status: string) {
  const i = MAIN_STEPS.findIndex(s => s.key === status);
  return i === -1 ? 0 : i;
}

type StepState = "done" | "active" | "next" | "pending";

function getStepState(stepKey: string, currentStatus: string): StepState {
  if (currentStatus === "Cancelled") return "pending";
  const ci = stepIndex(currentStatus);
  const si = MAIN_STEPS.findIndex(s => s.key === stepKey);
  if (si < ci)  return "done";
  if (si === ci) return "active";
  if (si === ci + 1) return "next";
  return "pending";
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (d?: string | null) => {
  if (!d) return "N/A";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
  } catch { return "N/A"; }
};

const fmtFull = (d?: string | null) => {
  if (!d) return "N/A";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "N/A";
    return dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
      + " " + dt.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:false });
  } catch { return "N/A"; }
};

const priorityColor = (p: string) => {
  switch (p) {
    case "urgent": return "bg-red-100 text-red-700 border-red-200";
    case "high":   return "bg-orange-100 text-orange-700 border-orange-200";
    case "normal": return "bg-blue-100 text-blue-700 border-blue-200";
    case "low":    return "bg-gray-100 text-gray-500 border-gray-200";
    default:       return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <Card className={`${bg} border-0 shadow-sm hover:shadow-md transition-shadow`}>
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
          <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-1.5 rounded-lg ${color} shadow-lg`}>
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);
const EditField = ({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean;
}) => (
  <div className="space-y-1">
    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
      {label}{required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full h-8 px-2.5 text-[11px] border rounded-md outline-none font-medium transition-all
        ${value
          ? "border-green-300 bg-green-50/40 focus:border-green-400 focus:ring-1 focus:ring-green-100"
          : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100"}`}
    />
  </div>
);
// ════════════════════════════════════════════════════════════════════════════
// Template Edit Popup (for editing document template)
// ════════════════════════════════════════════════════════════════════════════
function TemplateEditPopup({ doc, onClose, onDone }: { doc: Doc; onClose: () => void; onDone: () => void }) {
  const [saving, setSaving]       = useState(false);
  const [activeTab, setActiveTab] = useState<"edit"|"preview">("edit");
  const [previewHtml, setPreviewHtml] = useState("");

  const dj = (doc.data_json || {}) as Record<string, any>;

  const [formData, setFormData] = useState({
    documentType:         dj.document_type          || doc.document_type          || "",
    date:                 dj.date                   || "",
    tenantName:           doc.tenant_name            || "",
    tenantPhone:          doc.tenant_phone           || "",
    tenantEmail:          doc.tenant_email           || "",
    aadhaarNumber:        dj.aadhaar_number          || doc.aadhaar_number         || "",
    panNumber:            dj.pan_number              || doc.pan_number             || "",
    emergencyContactName: dj.emergency_contact_name  || doc.emergency_contact_name || "",
    emergencyPhone:       dj.emergency_phone         || doc.emergency_phone        || "",
    propertyName:         dj.property_name           || doc.property_name          || "",
    roomNumber:           dj.room_number != null ? String(dj.room_number) : doc.room_number != null ? String(doc.room_number) : "",
bedNumber:            dj.bed_number  != null ? String(dj.bed_number)  : doc.bed_number  != null ? String(doc.bed_number)  : "",
    moveInDate:           dj.move_in_date            || doc.move_in_date           || "",
    rentAmount:           dj.rent_amount             ? String(dj.rent_amount)      : doc.rent_amount  ? String(doc.rent_amount)  : "",
    securityDeposit:      dj.security_deposit        ? String(dj.security_deposit) : doc.security_deposit ? String(doc.security_deposit) : "",
    paymentMode:          dj.payment_mode            || doc.payment_mode           || "",
    companyName:          dj.company_name            || doc.company_name           || "",
    companyAddress:       dj.company_address         || doc.company_address        || "",
    notes:                doc.notes                  || "",
  });

  const set = useCallback((k: string, v: string) =>
    setFormData(p => ({ ...p, [k]: v })), []);

  // Build preview by replacing placeholders in html_content
const buildPreview = useCallback(() => {
    // Since html_content is already rendered, we do old→new swap using data_json
    let html = doc.html_content || "";

    // Build old→new mapping using current data_json vs form values
    const swaps: Array<[string, string]> = [
      [String(dj.tenant_name            || ""), formData.tenantName],
      [String(dj.tenant_phone           || ""), formData.tenantPhone],
      [String(dj.tenant_email           || ""), formData.tenantEmail],
      [String(dj.aadhaar_number         || ""), formData.aadhaarNumber],
      [String(dj.pan_number             || ""), formData.panNumber],
      [String(dj.emergency_contact_name || ""), formData.emergencyContactName],
      [String(dj.emergency_phone        || ""), formData.emergencyPhone],
      [String(dj.property_name          || ""), formData.propertyName],
      [dj.room_number  != null ? String(dj.room_number)  : doc.room_number  != null ? String(doc.room_number)  : "", formData.roomNumber],
[dj.bed_number   != null ? String(dj.bed_number)   : doc.bed_number   != null ? String(doc.bed_number)   : "", formData.bedNumber],
      [String(dj.move_in_date           || ""), formData.moveInDate],
      [String(dj.rent_amount            || ""), formData.rentAmount],
      [String(dj.security_deposit       || ""), formData.securityDeposit],
      [String(dj.payment_mode           || ""), formData.paymentMode],
      [String(dj.company_name           || ""), formData.companyName],
      [String(dj.company_address        || ""), formData.companyAddress],
      [String(dj.document_type          || ""), formData.documentType],
    ];

   swaps.forEach(([oldVal, newVal]) => {
  if (oldVal && oldVal.trim() && oldVal !== newVal) {
    const escaped = oldVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Use word boundaries to avoid replacing numbers inside CSS/HTML attributes
    html = html.replace(new RegExp(`(?<![\\w\\-\\.#])${escaped}(?![\\w\\-\\.px%em])`, 'g'), newVal || "");
  }
});

    // Also handle {{placeholders}} if any remain
    const placeholders: Record<string, string> = {
      tenant_name:            formData.tenantName,
      tenant_phone:           formData.tenantPhone,
      tenant_email:           formData.tenantEmail,
      aadhaar_number:         formData.aadhaarNumber,
      pan_number:             formData.panNumber,
      emergency_contact_name: formData.emergencyContactName,
      emergency_phone:        formData.emergencyPhone,
      property_name:          formData.propertyName,
      room_number:            formData.roomNumber,
      bed_number:             formData.bedNumber,
      move_in_date:           formData.moveInDate,
      rent_amount:            formData.rentAmount,
      security_deposit:       formData.securityDeposit,
      payment_mode:           formData.paymentMode,
      company_name:           formData.companyName,
      company_address:        formData.companyAddress,
      document_type:          formData.documentType,
      date:                   formData.date,
    };
    Object.entries(placeholders).forEach(([k, v]) => {
      html = html.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v || "");
    });

    setPreviewHtml(html);
    setActiveTab("preview");
  }, [doc.html_content, dj, formData]);

  
  const handleSave = async () => {
    if (!formData.tenantName.trim())  { toast.error("Tenant Name required");  return; }
    if (!formData.tenantPhone.trim()) { toast.error("Tenant Phone required"); return; }
    setSaving(true);
    try {
      const dataJson = {
        ...dj,
        tenant_name:            formData.tenantName,
        tenant_phone:           formData.tenantPhone,
        tenant_email:           formData.tenantEmail,
        aadhaar_number:         formData.aadhaarNumber,
        pan_number:             formData.panNumber,
        emergency_contact_name: formData.emergencyContactName,
        emergency_phone:        formData.emergencyPhone,
        property_name:          formData.propertyName,
        room_number:            formData.roomNumber,
        bed_number:             formData.bedNumber,
        move_in_date:           formData.moveInDate,
        rent_amount:            formData.rentAmount,
        security_deposit:       formData.securityDeposit,
        payment_mode:           formData.paymentMode,
        company_name:           formData.companyName,
        company_address:        formData.companyAddress,
        document_type:          formData.documentType,
        date:                   formData.date,
      };
      await updateDocument(doc.id, {
        tenant_name:            formData.tenantName,
        tenant_phone:           formData.tenantPhone,
        tenant_email:           formData.tenantEmail,
        aadhaar_number:         formData.aadhaarNumber,
        pan_number:             formData.panNumber,
        emergency_contact_name: formData.emergencyContactName,
        emergency_phone:        formData.emergencyPhone,
        property_name:          formData.propertyName,
        room_number:            formData.roomNumber,
        bed_number:             formData.bedNumber,
        move_in_date:           formData.moveInDate,
        rent_amount:            formData.rentAmount,
        security_deposit:       formData.securityDeposit,
        payment_mode:           formData.paymentMode,
        company_name:           formData.companyName,
        company_address:        formData.companyAddress,
        notes:                  formData.notes,
        data_json:              dataJson,
      } as any);
      toast.success("Document updated!");
      onDone();
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3.5 rounded-t-2xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Edit className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Edit Document
                <Badge className="bg-white/30 text-white border-0 text-[9px] px-1.5">{doc.document_number}</Badge>
              </h2>
              <p className="text-[10px] text-white/80">{doc.document_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/20 text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info bar */}
        <div className="bg-gray-50 px-5 py-2 border-b flex gap-4 text-[10px] flex-shrink-0 flex-wrap">
          <span className="flex items-center gap-1 text-gray-600 font-medium">
            <User className="h-3 w-3 text-gray-400" />{doc.tenant_name}
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <Phone className="h-3 w-3 text-gray-400" />{doc.tenant_phone}
          </span>
          {doc.property_name && (
            <span className="flex items-center gap-1 text-gray-600">
              <Home className="h-3 w-3 text-gray-400" />{doc.property_name}
            </span>
          )}
          <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold
            ${doc.status === "Completed" ? "bg-green-100 text-green-700" :
              doc.status === "Cancelled" ? "bg-red-100 text-red-700" :
              "bg-blue-100 text-blue-700"}`}>
            {doc.status}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-5 pt-2 gap-1 flex-shrink-0">
          <button onClick={() => setActiveTab("edit")}
            className={`px-4 py-1.5 text-[11px] font-semibold rounded-t-lg transition-colors flex items-center gap-1
              ${activeTab === "edit" ? "bg-purple-100 text-purple-700 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"}`}>
            <Edit className="h-3 w-3" /> Edit Fields
          </button>
          <button onClick={buildPreview}
            className={`px-4 py-1.5 text-[11px] font-semibold rounded-t-lg transition-colors flex items-center gap-1
              ${activeTab === "preview" ? "bg-purple-100 text-purple-700 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"}`}>
            <Eye className="h-3 w-3" /> Preview
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "edit" ? (
            <div className="p-5 space-y-4">

              {/* Document Info */}
              <div className="border border-blue-100 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
                  <h3 className="text-[10px] font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="h-3 w-3" /> Document Info
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <EditField label="Document Type" value={formData.documentType} onChange={v => set("documentType", v)} />
                  <EditField label="Date"          value={formData.date}         onChange={v => set("date", v)} />
                </div>
              </div>

              {/* Tenant Information */}
              <div className="border border-green-100 rounded-xl overflow-hidden">
                <div className="bg-green-50 px-4 py-2 border-b border-green-100">
                  <h3 className="text-[10px] font-bold text-green-700 uppercase tracking-wide flex items-center gap-1.5">
                    <User className="h-3 w-3" /> Tenant Information
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-3 gap-3">
                  <EditField label="Tenant Name"           value={formData.tenantName}           onChange={v => set("tenantName", v)}           required />
                  <EditField label="Phone Number"          value={formData.tenantPhone}          onChange={v => set("tenantPhone", v)}          type="tel" required />
                  <EditField label="Email"                 value={formData.tenantEmail}          onChange={v => set("tenantEmail", v)}          type="email" />
                  <EditField label="Aadhaar Number"        value={formData.aadhaarNumber}        onChange={v => set("aadhaarNumber", v)} />
                  <EditField label="PAN Number"            value={formData.panNumber}            onChange={v => set("panNumber", v)} />
                  <EditField label="Emergency Contact"     value={formData.emergencyContactName} onChange={v => set("emergencyContactName", v)} />
                  <EditField label="Emergency Phone"       value={formData.emergencyPhone}       onChange={v => set("emergencyPhone", v)}       type="tel" />
                </div>
              </div>

              {/* Property Details */}
              <div className="border border-indigo-100 rounded-xl overflow-hidden">
                <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100">
                  <h3 className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Home className="h-3 w-3" /> Property Details
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-3 gap-3">
                  <EditField label="Property Name"    value={formData.propertyName}    onChange={v => set("propertyName", v)} />
                  <EditField label="Room Number"      value={formData.roomNumber}      onChange={v => set("roomNumber", v)} />
                  <EditField label="Bed Number"       value={formData.bedNumber}       onChange={v => set("bedNumber", v)} />
                  <EditField label="Move In Date"     value={formData.moveInDate}      onChange={v => set("moveInDate", v)}      type="date" />
                  <EditField label="Rent Amount"      value={formData.rentAmount}      onChange={v => set("rentAmount", v)}      type="number" />
                  <EditField label="Security Deposit" value={formData.securityDeposit} onChange={v => set("securityDeposit", v)} type="number" />
                  <EditField label="Payment Mode"     value={formData.paymentMode}     onChange={v => set("paymentMode", v)} />
                </div>
              </div>

              {/* Company Info */}
              <div className="border border-orange-100 rounded-xl overflow-hidden">
                <div className="bg-orange-50 px-4 py-2 border-b border-orange-100">
                  <h3 className="text-[10px] font-bold text-orange-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Home className="h-3 w-3" /> Company / Manager Info
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <EditField label="Company Name"    value={formData.companyName}    onChange={v => set("companyName", v)} />
                  <EditField label="Company Address" value={formData.companyAddress} onChange={v => set("companyAddress", v)} />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Notes</label>
                <textarea rows={2} value={formData.notes} onChange={e => set("notes", e.target.value)}
                  className="w-full text-[11px] p-2.5 border border-gray-200 rounded-lg resize-none bg-gray-50 focus:bg-white focus:border-purple-400 outline-none"
                  placeholder="Any additional notes..." />
              </div>
            </div>
          ) : (
            /* Preview Tab */
            <div className="p-4 bg-slate-100 min-h-full">
              <div className="bg-white rounded-lg shadow max-w-[210mm] mx-auto">
                {previewHtml
                  ? <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  : <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                      Click Preview tab to generate
                    </div>
                }
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t px-5 py-3 bg-gray-50 rounded-b-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={buildPreview}
              className="h-8 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-semibold flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="h-8 px-4 rounded-xl border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="h-8 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-semibold flex items-center gap-1.5 disabled:opacity-60">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// POPUP: Share — Enhanced modern version
// ════════════════════════════════════════════════════════════════════════════
function SharePopup({ doc, onClose, onDone }: { doc: Doc; onClose: () => void; onDone: () => void }) {
  const [channels, setChannels] = useState<Set<string>>(new Set());
  const [recipients, setRecipients] = useState([
    { name: doc.tenant_name || "Tenant", contact: doc.tenant_phone || "", type: "Tenant" },
  ]);
  const [customName, setCustomName] = useState("");
  const [customContact, setCustomContact] = useState("");
  const [customType, setCustomType] = useState("Phone");
  const [message, setMessage] = useState(
    `Dear ${doc.tenant_name || "Tenant"},\n\nPlease find attached the ${doc.document_name} for your review.\n\nDocument: ${doc.document_name}\nDocument ID: ${doc.id}\nDate: ${fmt(doc.created_at)}\n\nProperty: ${doc.property_name || "N/A"} — Room ${doc.room_number || "N/A"}`
  );
  const [sharing, setSharing] = useState(false);

  const toggleChannel = (c: string) =>
    setChannels(p => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n; });

  const addRecipient = () => {
    if (!customName.trim() || !customContact.trim()) return;
    setRecipients(p => [...p, { name: customName.trim(), contact: customContact.trim(), type: customType }]);
    setCustomName(""); setCustomContact("");
  };

  const handleShare = async () => {
    if (!channels.size) { toast.error("Select at least one channel"); return; }
    setSharing(true);
    try {
      if (channels.has("whatsapp")) {
        const phone = (doc.tenant_phone || "").replace(/\D/g, "");
        if (phone) {
          const msg = encodeURIComponent(`📄 *${doc.document_name}*\n*Doc:* ${doc.document_number}\n*Tenant:* ${doc.tenant_name}\n*Property:* ${doc.property_name || "N/A"}\n*Room:* ${doc.room_number || "N/A"}\n*Status:* ${doc.status}`);
          window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
        }
      }
      if (channels.has("email") && doc.tenant_email) {
        window.open(`mailto:${doc.tenant_email}?subject=${encodeURIComponent(`Document: ${doc.document_name}`)}&body=${encodeURIComponent(message)}`, "_blank");
      }
      if (channels.has("sms")) {
        const phone = (doc.tenant_phone || "").replace(/\D/g, "");
        if (phone) window.open(`sms:${phone}?body=${encodeURIComponent(message)}`, "_blank");
      }
      if (channels.has("public")) {
        await navigator.clipboard.writeText(`${window.location.origin}/document/view/${doc.share_token || doc.id}`).catch(() => {});
        toast.success("Public link copied!");
      }
      await updateDocumentStatus(doc.id, "Shared" as DocumentStatus);
      toast.success("Shared! Status → Shared");
      onDone();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSharing(false); }
  };

  const CHANNELS = [
    { id:"whatsapp", label:"WhatsApp",   desc:"Rich formatting",    Icon: MessageCircle, color:"green", gradient:"from-green-500 to-green-800" },
    { id:"email",    label:"Email",       desc:"With attachment",    Icon: Mail,          color:"blue", gradient:"from-blue-500 to-blue-600" },
    { id:"sms",      label:"SMS",         desc:"Document link",      Icon: Smartphone,    color:"purple", gradient:"from-purple-500 to-purple-600" },
    { id:"public",   label:"Public Link", desc:"Shareable link",     Icon: Globe,         color:"orange", gradient:"from-orange-500 to-orange-600" },
  ];

  const getHeaderGradient = () => {
    return "from-green-600 to-green-800";
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-300"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5 duration-300">

        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getHeaderGradient()} px-4 sm:px-5 py-3 sm:py-4 rounded-t-2xl flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Share Document
                <Badge className="bg-white/30 text-white border-0 text-[8px] sm:text-[10px] px-1.5 py-0.5">
                  {doc.document_number}
                </Badge>
              </h2>
              <p className="text-[10px] sm:text-xs text-white/80 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {doc.document_name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 sm:p-2 rounded-xl hover:bg-white/20 text-white transition-all hover:scale-110"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5">

          {/* Doc summary card */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-3 sm:p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium">Document ID</p>
                <p className="text-[11px] sm:text-xs font-bold text-gray-800 font-mono">{doc.id}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium">Template</p>
                <p className="text-[11px] sm:text-xs font-semibold text-gray-800 truncate">{doc.document_name}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium">Tenant</p>
                <p className="text-[11px] sm:text-xs font-semibold text-gray-800">{doc.tenant_name}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium">Property</p>
                <p className="text-[11px] sm:text-xs font-semibold text-gray-800">{doc.property_name || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Channels grid */}
          {/* Channels grid - COMPACT */}
<div>
  <p className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2 sm:mb-3 flex items-center gap-1">
    <Rocket className="h-3 w-3" /> Select Sharing Channels
  </p>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">  {/* Changed gap-2 to gap-1.5 */}
    {CHANNELS.map(c => (
      <button
        key={c.id}
        onClick={() => toggleChannel(c.id)}
        className={`relative group flex flex-col items-center p-1.5 sm:p-2 rounded-xl border-2 transition-all duration-300  {/* Changed p-2 to p-1.5 */}
          ${channels.has(c.id) 
            ? `border-${c.color}-500 bg-${c.color}-50 shadow-lg scale-105` 
            : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'}`}
      >
        <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center mb-1 transition-all  {/* Changed h-8 w-8 to h-7 w-7 */}
          ${channels.has(c.id) 
            ? `bg-gradient-to-r ${c.gradient} text-white shadow-lg` 
            : `bg-${c.color}-50 text-${c.color}-600 group-hover:scale-110`}`}>
          <c.Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />  {/* Changed h-4 to h-3.5 */}
        </div>
        <span className="text-[9px] sm:text-[10px] font-semibold text-gray-800">{c.label}</span>  {/* Changed text-[10px] to text-[9px] */}
        <span className="text-[6px] sm:text-[8px] text-gray-400">{c.desc}</span>  {/* Changed text-[7px] to text-[6px] */}
        {channels.has(c.id) && (
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg animate-in zoom-in">  {/* Changed h-4 to h-3.5 */}
            <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5" />  {/* Changed h-2 to h-2 */}
          </div>
        )}
      </button>
    ))}
  </div>
</div>

          {/* Recipients */}
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
              <Users className="h-3 w-3" /> Recipients
            </p>
            
            {/* Add recipient */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
              <div className="relative flex-shrink-0">
                <select className="h-7 sm:h-8 pl-2 pr-6 sm:pl-2.5 sm:pr-7 text-[9px] sm:text-[10px] border border-gray-200 rounded-lg bg-white appearance-none font-medium">
                  <option>Both</option>
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-gray-400 pointer-events-none" />
              </div>
              <Input
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Name"
                className="h-7 sm:h-8 text-[9px] sm:text-[10px] w-20 sm:w-24 flex-shrink-0"
              />
              <Input
                value={customContact}
                onChange={e => setCustomContact(e.target.value)}
                placeholder="Phone/Email"
                className="h-7 sm:h-8 text-[9px] sm:text-[10px] w-24 sm:w-32 flex-shrink-0"
              />
              <div className="relative flex-shrink-0">
                <select 
                  value={customType} 
                  onChange={e => setCustomType(e.target.value)}
                  className="h-7 sm:h-8 pl-2 pr-6 sm:pl-2.5 sm:pr-7 text-[9px] sm:text-[10px] border border-gray-200 rounded-lg bg-white appearance-none"
                >
                  <option>Phone</option>
                  <option>Email</option>
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={addRecipient}
                className="h-7 sm:h-8 w-7 sm:w-8 rounded-lg bg-gradient-to-r from-green-600 to-green-800 text-white flex items-center justify-center hover:scale-105 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>

            {/* Recipients list */}
            <div className="space-y-1.5 sm:space-y-2">
              {recipients.map((r, i) => (
                <div key={i} className="flex items-center gap-2 p-2 sm:p-2.5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all group">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-800 truncate">{r.name}</p>
                    <p className="text-[8px] sm:text-[10px] text-gray-500">{r.contact}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-[8px] sm:text-[10px] px-1.5 py-0.5 font-semibold">
                    {r.type}
                  </Badge>
                  <button
                    onClick={() => setRecipients(p => p.filter((_, j) => j !== i))}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500"
                  >
                    <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] sm:text-xs font-bold text-gray-600 flex items-center gap-1">
                <Mail className="h-3 w-3" /> Tenant Message
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setMessage(`Dear ${doc.tenant_name},\n\nPlease find attached the ${doc.document_name} for your review.\n\nDocument ID: ${doc.id}\nDate: ${fmt(doc.created_at)}\n\nProperty: ${doc.property_name || "N/A"}\nRoom: ${doc.room_number || "N/A"}`)}
                  className="h-6 px-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[8px] sm:text-[9px] font-semibold hover:scale-105 transition-all shadow-sm"
                >
                  Default
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(message)}
                  className="h-6 px-2 rounded-lg border border-gray-200 text-[8px] sm:text-[9px] font-medium text-gray-600 flex items-center gap-0.5 hover:bg-gray-50"
                >
                  <Copy className="h-2.5 w-2.5" /> Copy
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full text-[9px] sm:text-[11px] p-2.5 sm:p-3 border border-gray-200 rounded-xl resize-none bg-gray-50 focus:bg-white focus:border-green-400 focus:ring-1 focus:ring-green-100 transition-all leading-relaxed"
            />
          </div>

          {/* Quick Actions */}
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Quick Actions
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(`${window.location.origin}/document/view/${doc.share_token || doc.id}`);
                  toast.success("Link copied!");
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
              >
                <Link className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] sm:text-[11px] font-semibold text-gray-700">Copy Link</span>
              </button>
              <button
                onClick={() => toast.info("QR generation coming soon")}
                className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
              >
                <QrCodeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] sm:text-[11px] font-semibold text-gray-700">Generate QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 rounded-b-2xl flex items-center justify-between gap-3">
          <p className="text-[9px] sm:text-xs text-gray-400">
            {channels.size} channel(s) · {recipients.length} recipient(s)
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl border border-gray-200 text-[10px] sm:text-xs font-medium text-gray-600 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="h-8 sm:h-9 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all"
            >
              {sharing ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              Share Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// POPUP: Change Status (On Hold / Completed / Cancelled) - Enhanced modern version
// ════════════════════════════════════════════════════════════════════════════
function ChangeStatusPopup({
  doc, targetStatus, onClose, onDone,
}: { doc: Doc; targetStatus: string; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [notifyTenant, setNotifyTenant] = useState(true);

  const meta: Record<string, { 
    Icon: any; 
    gradient: string; 
    bg: string; 
    desc: string;
    iconBg: string;
    alertTitle: string;
  }> = {
    "On Hold":   { 
      Icon: PauseCircle,  
      gradient: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
      desc: "Document processing paused",
      iconBg: "bg-orange-100",
      alertTitle: "Hold Document"
    },
    "Completed": { 
      Icon: CheckCircle,  
      gradient: "from-emerald-600 to-emerald-700",
      bg: "bg-emerald-50",
      desc: "All processes finished",
      iconBg: "bg-emerald-100",
      alertTitle: "Complete Document"
    },
    "Cancelled": { 
      Icon: XCircle,      
      gradient: "from-red-600 to-red-700",
      bg: "bg-red-50",
      desc: "Document cancelled",
      iconBg: "bg-red-100",
      alertTitle: "Cancel Document"
    },
  };
  
  const m = meta[targetStatus] || meta["On Hold"];

  const handleSubmit = async () => {
    if (!reason.trim()) { 
      toast.error("Please provide a reason"); 
      return; 
    }
    setSaving(true);
    try {
      await updateDocumentStatus(doc.id, targetStatus as DocumentStatus);
      if (notifyTenant) {
        toast.success(`Tenant notified about ${targetStatus} status`);
      }
      toast.success(`Status → ${targetStatus}`);
      onDone();
    } catch (e: any) { 
      toast.error(e.message); 
    } finally { 
      setSaving(false); 
    }
  };

 const getHeaderGradient = () => {
  // Make Completed popup header brighter
  if (targetStatus === "Completed") {
    return "from-green-500 to-green-800";
  }
  return m.gradient;
};
  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-300"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getHeaderGradient()} px-4 sm:px-5 py-3 sm:py-4 rounded-t-2xl flex items-center justify-between`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <m.Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">{m.alertTitle}</h2>
              <p className="text-[10px] sm:text-xs text-white/80">{doc.document_number}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 sm:p-2 rounded-xl hover:bg-white/20 text-white transition-all hover:scale-110"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
          
          {/* Status Preview */}
          <div className={`${m.bg} rounded-xl p-3 sm:p-4 border border-${targetStatus === "On Hold" ? "orange" : targetStatus === "Completed" ? "emerald" : "red"}-200`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${m.iconBg} flex items-center justify-center flex-shrink-0`}>
                <m.Icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${targetStatus === "On Hold" ? "orange" : targetStatus === "Completed" ? "emerald" : "red"}-600`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-gray-900">{targetStatus}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">{m.desc}</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Reason for Change <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Please provide a reason for changing the status..."
              className="w-full text-[10px] sm:text-xs p-2.5 sm:p-3 border border-gray-200 rounded-xl resize-none bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Notify Tenant */}
          <label className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={notifyTenant}
              onChange={(e) => setNotifyTenant(e.target.checked)}
              className="h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-gray-700">Notify tenant about this change</p>
              <p className="text-[8px] sm:text-[10px] text-gray-400">Send SMS/Email notification</p>
            </div>
          </label>

          {/* Document Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-2.5 sm:p-3 border border-gray-200">
            <p className="text-[9px] sm:text-[10px] text-gray-400 mb-1">Document Details</p>
            <div className="flex justify-between text-[10px] sm:text-xs">
              <span className="font-semibold text-gray-700">Tenant:</span>
              <span className="text-gray-600">{doc.tenant_name}</span>
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs mt-1">
              <span className="font-semibold text-gray-700">Property:</span>
              <span className="text-gray-600">{doc.property_name || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 sm:px-5 pb-4 sm:pb-5">
          <button
            onClick={onClose}
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl border border-gray-200 text-[10px] sm:text-xs font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
  onClick={handleSubmit}
  disabled={saving}
  className={`h-8 sm:h-9 px-4 sm:px-5 rounded-xl bg-gradient-to-r ${
    targetStatus === "Completed" 
      ? "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" 
      : m.gradient
  } hover:opacity-90 text-white text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all`}
>
  {saving ? (
    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
  ) : (
    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
  )}
  Update Status
</button>
        </div>

        {/* Step Trail */}
        {/* Step Trail */}
<div className="border-t px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-1 overflow-x-auto rounded-b-2xl bg-gray-50">
  {[...MAIN_STEPS.map(s => s.key), "Cancelled"].map((s, i, arr) => (
    <div key={s} className="flex items-center gap-1 flex-shrink-0">
      <span className={`text-[8px] sm:text-[9px] font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap
        ${s === targetStatus 
          ? (s === "Cancelled" 
            ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm" 
            : s === "Completed"
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm"
            : `bg-gradient-to-r ${meta[s]?.gradient || "from-blue-600 to-blue-700"} text-white shadow-sm`)
          : "bg-gray-200 text-gray-600"}`}>
        {s}
      </span>
      {i < arr.length - 1 && <ArrowRight className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-gray-300" />}
    </div>
  ))}
</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// POPUP: OTP Verify - Enhanced modern version
// ════════════════════════════════════════════════════════════════════════════
function OTPVerifyPopup({ doc, onClose, onDone }: { doc: Doc; onClose: () => void; onDone: () => void }) {
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]);
  const [via, setVia] = useState<"sms" | "email">("sms");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const sendOtp = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtp(code);
    setOtpSent(true);
    setResendTimer(30);
    toast.success(`OTP sent via ${via}: ${code}`);
    
    // Start timer
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const verifyOtp = () => {
    const enteredOtp = otpInput.join("");
    if (enteredOtp === otp) { 
      setVerified(true); 
      toast.success("OTP verified successfully!");
    } else {
      toast.error("Invalid OTP");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otpInput];
    newOtp[index] = value;
    setOtpInput(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      await updateDocumentStatus(doc.id, "OTP Verified" as DocumentStatus);
      toast.success("OTP Verified — status updated");
      onDone();
    } catch (e: any) { 
      toast.error(e.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const getHeaderGradient = () => {
    return "from-purple-600 to-purple-700";
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-300"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getHeaderGradient()} px-4 sm:px-5 py-3 sm:py-4 rounded-t-2xl flex items-center justify-between`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Verify Parties</h2>
              <p className="text-[10px] sm:text-xs text-white/80">{doc.document_number}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 sm:p-2 rounded-xl hover:bg-white/20 text-white transition-all hover:scale-110"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
          
          {/* Tenant Details */}
          <div className={`border-2 rounded-xl p-3 sm:p-4 transition-all ${verified ? "border-purple-300 bg-purple-50/30" : "border-gray-200"}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] sm:text-xs font-bold text-gray-800 flex items-center gap-1">
                <User className="h-3 w-3" /> Tenant Details
              </p>
              {verified && (
                <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 text-[9px] sm:text-[10px] px-2 py-0.5">
                  <CheckCircle className="h-2.5 w-2.5 mr-1" /> Verified
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
              <div className="space-y-0.5">
                <p className="text-[8px] sm:text-[9px] text-gray-400">Name</p>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-800 bg-gray-50 p-1.5 sm:p-2 rounded-lg">{doc.tenant_name}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] sm:text-[9px] text-gray-400">Phone</p>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-800 bg-gray-50 p-1.5 sm:p-2 rounded-lg">{doc.tenant_phone}</p>
              </div>
              {doc.tenant_email && (
                <div className="col-span-2 space-y-0.5">
                  <p className="text-[8px] sm:text-[9px] text-gray-400">Email</p>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-800 bg-gray-50 p-1.5 sm:p-2 rounded-lg">{doc.tenant_email}</p>
                </div>
              )}
            </div>

            {/* OTP Section */}
            {!verified && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[9px] sm:text-[10px] text-gray-600 font-medium">Send via:</span>
                  <div className="flex gap-2">
                    {(["sms", "email"] as const).map(v => (
                      <label key={v} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          checked={via === v}
                          onChange={() => setVia(v)}
                          className="h-3 w-3 text-purple-600"
                        />
                        <span className="text-[9px] sm:text-[10px] font-medium uppercase">{v}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={sendOtp}
                    disabled={resendTimer > 0}
                    className="ml-auto h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-[9px] sm:text-[10px] font-semibold disabled:opacity-50 transition-all shadow-sm hover:shadow"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Send OTP'}
                  </button>
                </div>

                {otpSent && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[9px] sm:text-[10px] text-gray-600 mb-2">Enter OTP</p>
                      <div className="flex gap-1 sm:gap-2 justify-center">
                        {otpInput.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            className="w-8 h-8 sm:w-10 sm:h-10 text-center text-sm sm:text-base font-bold border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:ring-1 focus:ring-purple-100 outline-none"
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={verifyOtp}
                      className="w-full h-8 sm:h-9 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Verify OTP
                    </button>
                  </div>
                )}
              </>
            )}

            {verified && (
              <div className="flex items-center gap-2 text-green-600 text-[11px] sm:text-xs font-semibold mt-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                OTP verified successfully!
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="text-[10px] sm:text-xs font-semibold text-gray-600 block mb-1.5 flex items-center gap-1">
              <Pen className="h-3 w-3" /> Additional Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any notes about the verification process..."
              className="w-full text-[10px] sm:text-xs p-2.5 sm:p-3 border border-gray-200 rounded-xl resize-none bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 sm:px-5 pb-4 sm:pb-5">
          <button
            onClick={onClose}
            className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl border border-gray-200 text-[10px] sm:text-xs font-medium text-gray-600 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={saving || !verified}
            className="h-8 sm:h-9 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all"
          >
            {saving ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// POPUP: E-Sign - Enhanced modern version
// ════════════════════════════════════════════════════════════════════════════
function ESignPopup({ doc, onClose, onDone }: { doc: Doc; onClose: () => void; onDone: () => void }) {
  const [saving, setSaving] = useState(false);
  const [signers, setSigners] = useState([
    { 
      id: 1, 
      name: doc.tenant_name, 
      email: doc.tenant_email, 
      phone: doc.tenant_phone,
      type: "Tenant",
      status: "pending"
    }
  ]);
  const [signatureBoxes, setSignatureBoxes] = useState<Array<{signerId: number, page: number, x: number, y: number}>>([]);

  const addSigner = () => {
    setSigners(prev => [...prev, {
      id: Date.now(),
      name: "",
      email: "",
      phone: "",
      type: "Co-Signer",
      status: "pending"
    }]);
  };

  const removeSigner = (id: number) => {
    setSigners(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateDocumentStatus(doc.id, "E-Sign Pending" as DocumentStatus);
      toast.success("Submitted for E-Sign");
      onDone();
    } catch (e: any) { 
      toast.error(e.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const getHeaderGradient = () => {
    return "from-indigo-600 to-indigo-700";
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 backdrop-blur-md animate-in fade-in duration-300"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getHeaderGradient()} px-4 sm:px-5 py-3 sm:py-4 rounded-t-2xl flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <FileSignature className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">E-Sign (Aadhaar)</h2>
              <p className="text-[10px] sm:text-xs text-white/80">{doc.document_number} · {doc.document_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[9px] sm:text-[10px] font-medium flex items-center gap-1 transition-all">
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Upload PDF</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 sm:p-2 rounded-xl hover:bg-white/20 text-white transition-all hover:scale-110"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          
          {/* Signers Panel */}
          <div className="w-44 sm:w-56 border-r bg-gray-50 overflow-y-auto flex-shrink-0 p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <Users className="h-3 w-3" /> Signers
              </p>
              <button
                onClick={addSigner}
                className="h-5 sm:h-6 px-1.5 sm:px-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[8px] sm:text-[9px] font-semibold flex items-center gap-0.5 hover:scale-105 transition-all"
              >
                <Plus className="h-2.5 w-2.5" /> Add
              </button>
            </div>

            {signers.map((signer, idx) => (
              <div key={signer.id} className="bg-white rounded-xl border border-gray-200 p-2 sm:p-3 space-y-2 shadow-sm hover:shadow transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-indigo-500' : 'bg-purple-500'}`} />
                    <p className="text-[10px] sm:text-xs font-bold text-gray-700">{signer.type}</p>
                  </div>
                  {signer.status === 'pending' && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-0 text-[8px] px-1 py-0">Pending</Badge>
                  )}
                </div>
                
                {idx === 0 ? (
                  <>
                    <Input 
                      value={signer.name} 
                      readOnly 
                      className="h-6 sm:h-7 text-[9px] sm:text-[10px] bg-gray-50 px-2" 
                      placeholder="Name"
                    />
                    <Input 
                      value={signer.phone} 
                      readOnly 
                      className="h-6 sm:h-7 text-[9px] sm:text-[10px] bg-gray-50 px-2" 
                      placeholder="Phone"
                    />
                    <Input 
                      value={signer.email || ''} 
                      placeholder="Email" 
                      className="h-6 sm:h-7 text-[9px] sm:text-[10px] px-2" 
                    />
                  </>
                ) : (
                  <>
                    <Input 
                      placeholder="Full Name" 
                      className="h-6 sm:h-7 text-[9px] sm:text-[10px] px-2" 
                    />
                    <Input 
                      placeholder="Phone Number" 
                      className="h-6 sm:h-7 text-[9px] sm:text-[10px] px-2" 
                    />
                    <Input 
                      placeholder="Email Address" 
                      className="h-6 sm:h-7 text-[9px] sm:text-[10px] px-2" 
                    />
                  </>
                )}

                <div className="flex gap-1 pt-1">
                  <button className="flex-1 h-6 sm:h-7 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[8px] sm:text-[9px] font-semibold hover:scale-105 transition-all">
                    + Add Box
                  </button>
                  <button className="flex-1 h-6 sm:h-7 rounded-lg border border-gray-200 text-[8px] sm:text-[9px] text-gray-600 hover:bg-gray-50">
                    Mark
                  </button>
                </div>

                {idx > 0 && (
                  <button
                    onClick={() => removeSigner(signer.id)}
                    className="w-full text-[8px] sm:text-[9px] text-red-400 hover:text-red-600 font-medium pt-1"
                  >
                    Remove Signer
                  </button>
                )}
              </div>
            ))}

            <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-100">
              <p className="text-[8px] sm:text-[9px] text-indigo-700 font-medium">Signature Boxes: {signatureBoxes.length}</p>
              <p className="text-[7px] sm:text-[8px] text-indigo-500">Click 'Add Box' to place signature field</p>
            </div>
          </div>

          {/* Document Preview */}
          <div className="flex-1 bg-slate-100 overflow-auto flex items-start justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-[210mm] min-h-64 relative">
              {doc.html_content ? (
                <>
                  <div 
                    className="p-4 text-[11px] sm:text-xs"
                    dangerouslySetInnerHTML={{ __html: doc.html_content }} 
                  />
                  
                  {/* Signature Box Placeholders */}
                  {signatureBoxes.map((box, idx) => (
                    <div
                      key={idx}
                      className="absolute border-2 border-indigo-400 bg-indigo-50/50 rounded-lg flex items-center justify-center cursor-move group hover:bg-indigo-100/50 transition-all"
                      style={{
                        left: box.x,
                        top: box.y,
                        width: '120px',
                        height: '40px',
                      }}
                    >
                      <FileSignature className="h-4 w-4 text-indigo-600 opacity-50 group-hover:opacity-100" />
                      <span className="text-[8px] text-indigo-600 ml-1">Signature</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400 flex-col gap-3">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No document content</p>
                  <p className="text-[10px] text-gray-400">Upload a PDF to add signature fields</p>
                  <button className="mt-2 h-8 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-semibold">
                    Upload PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t px-4 sm:px-5 py-3 sm:py-4 bg-gray-50 rounded-b-2xl flex items-center justify-between">
          <p className="text-[9px] sm:text-xs text-gray-500 flex items-center gap-1">
            <FileSignature className="h-3 w-3" />
            {signers.length} Signer(s) · {signatureBoxes.length} Box(es)
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl border border-gray-200 text-[10px] sm:text-xs font-medium text-gray-600 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="h-8 sm:h-9 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Rocket className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              Submit to Digio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TIMELINE — Image 2 style: pill steps with icon + label, connected by line
// ════════════════════════════════════════════════════════════════════════════
function TimelineSteps({
  doc,
  onStepClick,
  compact = false,
}: {
  doc: Doc;
  onStepClick: (doc: Doc, action: string) => void;
  compact?: boolean;
}) {
  const status      = doc.status;
  const isCancelled = status === "Cancelled";
  const isCompleted = status === "Completed";

  return (
    <div className="flex items-center flex-nowrap gap-0 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
      {MAIN_STEPS.map((step, i) => {
        const state  = getStepState(step.key, status);
        const isNext = state === "next" && !isCancelled;

        // Circle styles
        let circleCls = "flex-shrink-0 flex items-center justify-center rounded-full border-2 transition-all ";
        const size    = compact ? "w-5 h-5" : "w-6 h-6 sm:w-7 sm:h-7";
        circleCls    += size + " ";

        if (state === "done")   circleCls += "border-green-500 bg-green-500 text-white";
        else if (state === "active") circleCls += `border-${step.accentColor}-600 bg-${step.accentColor}-600 text-white ring-2 ring-${step.accentColor}-200 shadow-sm`;
        else if (isNext)        circleCls += `border-${step.accentColor}-400 border-dashed bg-white text-${step.accentColor}-500 cursor-pointer hover:bg-${step.accentColor}-50 hover:scale-110 hover:shadow`;
        else                    circleCls += "border-gray-200 bg-gray-100 text-gray-400";

        const iconSz = compact ? "h-2.5 w-2.5" : "h-3 w-3";

        // Label below (only on non-compact)
        const labelCls = compact ? "hidden" : `text-[8px] leading-tight mt-0.5 font-medium truncate max-w-[40px] sm:max-w-[52px] text-center ${
          state === "done" ? "text-green-600" :
          state === "active" ? `text-${step.accentColor}-700 font-bold` :
          isNext ? `text-${step.accentColor}-500` : "text-gray-400"
        }`;

        // Connecting line
        const lineCls = `flex-shrink-0 h-0.5 ${compact ? "w-2" : "w-3 sm:w-5"} ${
          state === "done" ? "bg-green-400" : "bg-gray-200"
        }`;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <button
                disabled={!isNext}
                onClick={() => isNext && onStepClick(doc, STEP_POPUP[step.key] || "")}
                title={`${step.label}${isNext ? " — click to proceed" : ""}`}
                className={circleCls}
              >
                {state === "done"
                  ? <Check className={iconSz} />
                  : <step.Icon className={iconSz} />
                }
              </button>
              {!compact && (
                <span className={labelCls}>{step.short}</span>
              )}
            </div>
            {i < MAIN_STEPS.length - 1 && (
              <div className={lineCls} style={{ marginBottom: compact ? 0 : "14px" }} />
            )}
          </div>
        );
      })}

      {/* Cancelled pill */}
      <div className="flex items-center ml-1 flex-shrink-0">
        <div className={`h-0.5 ${compact ? "w-1.5" : "w-2"} flex-shrink-0 ${isCancelled ? "bg-red-400" : "bg-gray-200"}`}
          style={{ marginBottom: compact ? 0 : "14px" }} />
        <div className="flex flex-col items-center">
          <button
            disabled={isCancelled || isCompleted}
            onClick={() => !isCancelled && !isCompleted && onStepClick(doc, "cancel")}
            title={isCancelled ? "Cancelled" : isCompleted ? "Already completed" : "Cancel document"}
            className={`flex-shrink-0 flex items-center justify-center rounded-full border-2 transition-all
              ${compact ? "w-5 h-5" : "w-6 h-6 sm:w-7 sm:h-7"}
              ${isCancelled
                ? "border-red-500 bg-red-500 text-white"
                : isCompleted
                ? "border-gray-200 bg-gray-100 text-gray-300 cursor-default"
                : "border-gray-300 bg-gray-50 text-gray-400 cursor-pointer hover:border-red-400 hover:bg-red-50 hover:text-red-500 hover:scale-110"
              }`}
          >
            {isCancelled
              ? <Check className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
              : <XCircle className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
            }
          </button>
          {!compact && (
            <span className={`text-[8px] leading-tight mt-0.5 font-medium text-center max-w-[36px] ${
              isCancelled ? "text-red-600 font-bold" : "text-gray-400"
            }`}>Cancel</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export function DocumentList() {
  const [docs,        setDocs]        = useState<Doc[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewDoc,     setViewDoc]     = useState<Doc | null>(null);
  const [loadingView, setLoadingView] = useState<number|string|null>(null);

  const [popup, setPopup] = useState<{
    type: "share"|"hold"|"otp"|"esign"|"complete"|"cancel"|"edit" | null;
    doc: Doc | null;
  }>({ type: null, doc: null });

  const [statusFilter,   setStatusFilter]   = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [col, setCol] = useState({ document_number: "", tenant_name: "", property_name: "" });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll,   setSelectAll]   = useState(false);

  const stats = useMemo(() => ({
    total:     docs.length,
    created:   docs.filter(d => d.status === "Created").length,
    esign:     docs.filter(d => d.status === "E-Sign Pending").length,
    completed: docs.filter(d => d.status === "Completed").length,
  }), [docs]);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listDocuments({
        status:   statusFilter   !== "all" ? statusFilter   as DocumentStatus : undefined,
        priority: priorityFilter !== "all" ? priorityFilter as any            : undefined,
        pageSize: 100,
      });
      setDocs(res.data || []);
    } catch (e: any) { toast.error(e.message || "Failed to load documents"); }
    finally { setLoading(false); }
  }, [statusFilter, priorityFilter]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const filteredRows = useMemo(() => docs.filter(d => {
    const nOk = !col.document_number || d.document_number?.toLowerCase().includes(col.document_number.toLowerCase());
    const tOk = !col.tenant_name     || d.tenant_name?.toLowerCase().includes(col.tenant_name.toLowerCase());
    const pOk = !col.property_name   || (d.property_name||"").toLowerCase().includes(col.property_name.toLowerCase());
    return nOk && tOk && pOk;
  }), [docs, col]);

  const toggleAll = () => {
    if (selectAll) { setSelectedIds(new Set()); setSelectAll(false); }
    else           { setSelectedIds(new Set(filteredRows.map(d => d.id))); setSelectAll(true); }
  };
  const toggleOne = (id: number) => {
    const n = new Set(selectedIds); n.has(id) ? n.delete(id) : n.add(id);
    setSelectedIds(n); setSelectAll(n.size === filteredRows.length && filteredRows.length > 0);
  };
  const selectedItems = filteredRows.filter(d => selectedIds.has(d.id));

  const handleDelete = async (id: number, name: string) => {
  const r = await Swal.fire({
    title: "Delete Document?",
    text: `"${name}" will be permanently removed.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6b7280",
    customClass: { popup: "rounded-xl text-sm" },

    didOpen: () => {
      const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
      const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;

      if (confirmBtn) {
        confirmBtn.style.background = '#dc2626';
        confirmBtn.style.color = '#fff';
        confirmBtn.style.padding = '8px 18px';
        confirmBtn.style.borderRadius = '6px';
        confirmBtn.style.fontWeight = '600';
        confirmBtn.style.display = 'inline-block';
        confirmBtn.style.filter = 'none';
        confirmBtn.onmouseover = () => (confirmBtn.style.filter = 'none');
      }

      if (cancelBtn) {
        cancelBtn.style.background = '#6b7280';
        cancelBtn.style.color = '#fff';
        cancelBtn.style.padding = '8px 18px';
        cancelBtn.style.borderRadius = '6px';
        cancelBtn.style.marginRight = '8px';
        cancelBtn.style.display = 'inline-block';
        cancelBtn.style.filter = 'none';
        cancelBtn.onmouseover = () => (cancelBtn.style.filter = 'none');
      }
    }
  });

  if (!r.isConfirmed) return;

  try {
    await deleteDocument(id);
    toast.success("Deleted");
    setSelectedIds(p => {
      const n = new Set(p);
      n.delete(id);
      return n;
    });
    await loadDocs();
  } catch (e: any) {
    toast.error(e.message);
  }
};

  const handleBulkDelete = async () => {
  if (!selectedItems.length) return;

  const r = await Swal.fire({
    title: `Delete ${selectedItems.length} document(s)?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete all",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6b7280",
    customClass: { popup: "rounded-xl text-sm" },

    didOpen: () => {
      const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
      const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;

      if (confirmBtn) {
        confirmBtn.style.background = '#dc2626';
        confirmBtn.style.color = '#fff';
        confirmBtn.style.padding = '8px 18px';
        confirmBtn.style.borderRadius = '6px';
        confirmBtn.style.fontWeight = '600';
        confirmBtn.style.display = 'inline-block';
        confirmBtn.style.filter = 'none';
        confirmBtn.onmouseover = () => (confirmBtn.style.filter = 'none');
      }

      if (cancelBtn) {
        cancelBtn.style.background = '#6b7280';
        cancelBtn.style.color = '#fff';
        cancelBtn.style.padding = '8px 18px';
        cancelBtn.style.borderRadius = '6px';
        cancelBtn.style.marginRight = '8px';
        cancelBtn.style.display = 'inline-block';
        cancelBtn.style.filter = 'none';
        cancelBtn.onmouseover = () => (cancelBtn.style.filter = 'none');
      }
    }
  });

  if (!r.isConfirmed) return;

  try {
    await bulkDeleteDocuments(selectedItems.map(d => d.id));
    toast.success(`Deleted ${selectedItems.length}`);
    setSelectedIds(new Set());
    setSelectAll(false);
    await loadDocs();
  } catch (e: any) {
    toast.error(e.message);
  }
};
  const handlePrint = (doc: Doc) => {
    const w = window.open("","_blank");
    if (w) { w.document.write(`<html><head><title>${doc.document_name}</title></head><body>${doc.html_content}</body></html>`); w.document.close(); w.focus(); w.print(); }
  };

  const handleDownload = (doc: Doc) => {
    if (!doc.html_content) { toast.error("No content"); return; }
    const pw = window.open("","_blank","width=900,height=700");
    if (!pw) { toast.error("Popup blocked"); return; }
    pw.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${doc.document_number}</title><style>body{margin:0;padding:0;}@media print{@page{size:A4;margin:10mm;}}</style></head><body>${doc.html_content}<script>window.onload=function(){setTimeout(function(){window.print();window.onafterprint=function(){window.close();};},400);};<\/script></body></html>`);
    pw.document.close();
  };

  const handleStepClick = (doc: Doc, action: string) => {
    if (!action) return;
    setPopup({ type: action as any, doc });
  };

  const closePopup = () => setPopup({ type: null, doc: null });
  const popupDone  = () => { closePopup(); loadDocs(); };


// Replace the handleExport function with:

const handleExport = () => {
  try {
    // Prepare data for export
    const exportData = filteredRows.map(d => ({
      'Document #': d.document_number,
      'Document Name': d.document_name,
      'Tenant Name': d.tenant_name,
      'Tenant Phone': d.tenant_phone,
      'Tenant Email': d.tenant_email || '',
      'Property': d.property_name || '',
      'Room Number': d.room_number || '',
      'Rent Amount': d.rent_amount ? `₹${Number(d.rent_amount).toLocaleString('en-IN')}` : '',
      'Status': d.status,
      'Priority': d.priority,
      'Signature Required': d.signature_required ? 'Yes' : 'No',
      'Created By': d.created_by || '',
      'Created Date': fmt(d.created_at),
      'Last Updated': fmt(d.updated_at),
      'Document ID': d.id
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-size columns
    const colWidths = [];
    const headers = Object.keys(exportData[0] || {});
    headers.forEach(header => {
      const maxLength = Math.max(
        header.length,
        ...exportData.map(row => String(row[header] || '').length)
      );
      colWidths.push({ wch: Math.min(maxLength + 2, 50) });
    });
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Documents");

    // Add summary sheet
    const summaryData = [{
      'Metric': 'Total Documents',
      'Value': filteredRows.length
    }, {
      'Metric': 'By Status',
      'Value': Object.entries(
        filteredRows.reduce((acc, d) => {
          acc[d.status] = (acc[d.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([k, v]) => `${k}: ${v}`).join(', ')
    }, {
      'Metric': 'By Priority',
      'Value': Object.entries(
        filteredRows.reduce((acc, d) => {
          acc[d.priority] = (acc[d.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([k, v]) => `${k}: ${v}`).join(', ')
    }, {
      'Metric': 'Export Date',
      'Value': new Date().toLocaleString('en-IN')
    }, {
      'Metric': 'Filters Applied',
      'Value': `Status: ${statusFilter}, Priority: ${priorityFilter}`
    }];

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // Generate filename
    const filename = `documents_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    toast.success(`Exported ${filteredRows.length} documents successfully`);
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export documents');
  }
};

  const hasFilters   = statusFilter !== "all" || priorityFilter !== "all";
  const filterCount  = [statusFilter!=="all",priorityFilter!=="all"].filter(Boolean).length;
  const clearFilters = () => { setStatusFilter("all"); setPriorityFilter("all"); };
  const hasColSearch = Object.values(col).some(v => v !== "");

  const ALL_STATUSES = ["Created","Shared","On Hold","OTP Verified","E-Sign Pending","Completed","Expired","Cancelled"];

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-full">

      {/* STICKY HEADER */}
      <div className="sticky top-16 z-10 pb-2">
        <div className="pb-2 flex items-center justify-end gap-2 flex-wrap">
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 border border-blue-200 rounded-lg px-2 py-1">{selectedItems.length} selected</span>
              <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2" onClick={handleBulkDelete}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o=>!o)}
            className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors ${sidebarOpen||hasFilters ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
            <Filter className="h-3.5 w-3.5" /><span className="hidden sm:inline">Filters</span>
            {filterCount > 0 && <span className="h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center bg-white text-blue-600">{filterCount}</span>}
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium">
            <Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={loadDocs} disabled={loading} className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading?"animate-spin":""}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="pb-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <StatCard title="Total Documents"  value={stats.total}     icon={FileText}    color="bg-blue-600"    bg="bg-gradient-to-br from-blue-50 to-blue-100" />
          <StatCard title="Created"          value={stats.created}   icon={AlertCircle} color="bg-indigo-600"  bg="bg-gradient-to-br from-indigo-50 to-indigo-100" />
          <StatCard title="E-Sign Pending"   value={stats.esign}     icon={PenLine}     color="bg-green-600"   bg="bg-gradient-to-br from-green-50 to-green-100" />
          <StatCard title="Completed"        value={stats.completed} icon={Shield}      color="bg-emerald-600" bg="bg-gradient-to-br from-emerald-50 to-emerald-100" />
        </div>
      </div>

      {/* TABLE */}
      <div className="relative">
        <Card className="border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg flex-wrap gap-1">
            <span className="text-sm font-semibold text-gray-700">
              All Documents ({filteredRows.length})
              {selectedIds.size > 0 && <span className="ml-2 text-blue-600 text-xs">({selectedIds.size} selected)</span>}
            </span>
            {hasColSearch && <button onClick={() => setCol({document_number:"",tenant_name:"",property_name:""})} className="text-[10px] text-blue-600 font-semibold">Clear Search</button>}
          </div>

          {/* ── MOBILE cards ── */}
          <div className="block lg:hidden divide-y divide-gray-100">
            {loading ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
            ) : filteredRows.length === 0 ? (
              <div className="text-center py-10"><FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-500">No documents found</p></div>
            ) : filteredRows.map(d => (
              <div key={d.id} className={`p-3 ${selectedIds.has(d.id) ? "bg-blue-50/40" : ""}`}>
                <div className="flex items-start gap-2 mb-2">
                  <button onClick={() => toggleOne(d.id)} className="mt-0.5 flex-shrink-0">
                    {selectedIds.has(d.id) ? <CheckSquare className="h-4 w-4 text-blue-600" /> : <Square className="h-4 w-4 text-gray-400" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-blue-600 font-mono">{d.document_number}</p>
                    <p className="text-[12px] font-semibold text-gray-800 truncate">{d.document_name}</p>
                    <p className="text-[11px] text-gray-600">{d.tenant_name} · {d.tenant_phone}</p>
                    {d.property_name && <p className="text-[10px] text-gray-400">{d.property_name}{d.room_number ? ` · R-${d.room_number}` : ""}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge className={`text-[9px] px-1.5 py-0 border ${priorityColor(d.priority)}`}>{d.priority}</Badge>
                    <span className="text-[9px] text-gray-400">{fmt(d.created_at)}</span>
                  </div>
                </div>
                <div className="mb-2 overflow-x-auto"><TimelineSteps doc={d} onStepClick={handleStepClick} compact /></div>
                <div className="flex items-center gap-1 border-t pt-2 mt-1">
                  <button onClick={async () => { setLoadingView(d.id); try { const r=await getDocument(d.id); setViewDoc(r.data||d); } catch { setViewDoc(d); } finally { setLoadingView(null); } }}
                    className="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                    {loadingView===d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => setPopup({type:"share",doc:d})} className="p-1.5 rounded-md text-gray-400 hover:bg-green-50 hover:text-green-600"><Share2 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handlePrint(d)} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100"><Printer className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDownload(d)} className="p-1.5 rounded-md text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"><Download className="h-3.5 w-3.5" /></button>
                  {/* Edit button in actions column */}
                  <button 
                    onClick={() => setPopup({type:"edit",doc:d})} 
                    className="p-1.5 rounded-md text-gray-400 hover:bg-purple-50 hover:text-purple-600"
                    title="Edit Template"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(d.id, d.document_name)} className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 ml-auto"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* ── DESKTOP table ── */}
          <div className="hidden lg:block overflow-auto" style={{ maxHeight:"calc(100vh - 290px)" }}>
            <div style={{ minWidth:"1060px" }}>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-gray-50">
                  <TableRow>
                    <TableHead className="py-2 px-3 w-8">
                      <button onClick={toggleAll} className="p-1 hover:bg-gray-200 rounded">
                        {selectAll ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
                      </button>
                    </TableHead>
                    <TableHead className="py-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">DOCUMENT</TableHead>
                    <TableHead className="py-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">PARTIES</TableHead>
                    <TableHead className="py-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">PROPERTY</TableHead>
                    <TableHead className="py-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">STATUS & PROGRESS</TableHead>
                    <TableHead className="py-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">TIMELINE</TableHead>
                    <TableHead className="py-2 px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">ACTIONS</TableHead>
                  </TableRow>
                  {/* Column search */}
                  <TableRow className="bg-gray-50/80">
                    <TableCell className="py-1 px-3" />
                    <TableCell className="py-1 px-2"><Input placeholder="Doc#…" value={col.document_number} onChange={e=>setCol(p=>({...p,document_number:e.target.value}))} className="h-6 text-[10px]" /></TableCell>
                    <TableCell className="py-1 px-2"><Input placeholder="Tenant…" value={col.tenant_name} onChange={e=>setCol(p=>({...p,tenant_name:e.target.value}))} className="h-6 text-[10px]" /></TableCell>
                    <TableCell className="py-1 px-2"><Input placeholder="Property…" value={col.property_name} onChange={e=>setCol(p=>({...p,property_name:e.target.value}))} className="h-6 text-[10px]" /></TableCell>
                    <TableCell /><TableCell /><TableCell />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Loading…</p>
                    </TableCell></TableRow>
                  ) : filteredRows.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12">
                      <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-500">No documents found</p>
                    </TableCell></TableRow>
                  ) : filteredRows.map(d => (
                    <TableRow key={d.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(d.id) ? "bg-blue-50/40" : ""}`}>
                      <TableCell className="py-2 px-3">
                        <button onClick={() => toggleOne(d.id)} className="p-1 hover:bg-gray-200 rounded">
                          {selectedIds.has(d.id) ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </TableCell>

                      {/* Document */}
                      <TableCell className="py-2 px-3">
                        <p className="font-mono text-[11px] font-bold text-blue-600">{d.document_number}</p>
                        <p className="text-[11px] font-semibold text-gray-800 max-w-[150px] truncate">{d.document_name}</p>
                        <p className="text-[9px] text-gray-400">ID: {d.id} · {d.created_by}</p>
                        {d.signature_required && <Badge className="bg-purple-50 text-purple-600 border border-purple-200 text-[9px] px-1 py-0 mt-0.5">Sig. Req.</Badge>}
                      </TableCell>

                      {/* Parties */}
                      <TableCell className="py-2 px-3">
                        <p className="text-[11px] font-semibold text-gray-800">{d.tenant_name}</p>
                        {d.tenant_phone && <p className="text-[10px] text-gray-500 flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{d.tenant_phone}</p>}
                        {d.tenant_email && <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{d.tenant_email}</p>}
                      </TableCell>

                      {/* Property */}
                      <TableCell className="py-2 px-3">
                        <p className="text-[11px] text-gray-700 max-w-[110px] truncate">{d.property_name || "N/A"}</p>
                        {d.room_number && <p className="text-[10px] text-gray-500">Room: {d.room_number}</p>}
                        {d.rent_amount ? <p className="text-[10px] text-green-600 font-medium">₹{Number(d.rent_amount).toLocaleString("en-IN")}/mo</p> : null}
                      </TableCell>

                      {/* Status & progress */}
                      <TableCell className="py-2 px-3">
                        <div className="space-y-1">
                          <Badge className={`text-[9px] px-1.5 py-0 border ${priorityColor(d.priority)}`}>{d.priority}</Badge>
                          <div className="w-20">
                            <div className="flex justify-between mb-0.5">
                              <span className="text-[9px] text-gray-400">Progress</span>
                              <span className="text-[9px] font-semibold text-gray-600">
                                {d.status === "Cancelled" ? "0" : Math.round((stepIndex(d.status) / (MAIN_STEPS.length - 1)) * 100)}%
                              </span>
                            </div>
                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${d.status === "Cancelled" ? "bg-red-400" : "bg-blue-500"}`}
                                style={{ width:`${d.status==="Cancelled" ? 5 : Math.max(5,Math.round((stepIndex(d.status)/(MAIN_STEPS.length-1))*100))}%` }} />
                            </div>
                          </div>
                          <p className="text-[9px] text-gray-400">{fmt(d.created_at)}</p>
                        </div>
                      </TableCell>

                      {/* Timeline */}
                      <TableCell className="py-2 px-3">
                        <TimelineSteps doc={d} onStepClick={handleStepClick} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-2 px-3">
                        <div className="flex justify-end gap-0.5">
                          <button onClick={async () => {
                            setLoadingView(d.id);
                            try { const r=await getDocument(d.id); setViewDoc(r.data||d); }
                            catch { setViewDoc(d); }
                            finally { setLoadingView(null); }
                          }} title="View" className="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            {loadingView===d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => setPopup({type:"share",doc:d})} title="Share"
                            className="p-1.5 rounded-md text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"><Share2 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handlePrint(d)} title="Print"
                            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"><Printer className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDownload(d)} title="Download"
                            className="p-1.5 rounded-md text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"><Download className="h-3.5 w-3.5" /></button>
                          {/* Edit button in actions column */}
                          <button 
                            onClick={() => setPopup({type:"edit",doc:d})} 
                            title="Edit Template"
                            className="p-1.5 rounded-md text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(d.id, d.document_name)} title="Delete"
                            className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        {/* FILTER SIDEBAR */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />}
        <aside className={`fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-white" /><span className="text-sm font-semibold text-white">Filters</span>
              {hasFilters && <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">{filterCount} active</span>}
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">Clear all</button>}
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Status</p>
              <div className="space-y-1">
                {["all", ...ALL_STATUSES].map(s => (
                  <label key={s} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${statusFilter===s?"bg-blue-50 border border-blue-200 text-blue-700":"hover:bg-gray-50 border border-transparent text-gray-700"}`}>
                    <input type="radio" name="status" checked={statusFilter===s} onChange={() => setStatusFilter(s)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusFilter===s?"bg-blue-500":"bg-gray-300"}`} />
                    <span className="text-[12px] font-medium">{s==="all"?"All Statuses":s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Priority</p>
              <div className="space-y-1">
                {["all","low","normal","high","urgent"].map(p => (
                  <label key={p} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${priorityFilter===p?"bg-blue-50 border border-blue-200 text-blue-700":"hover:bg-gray-50 border border-transparent text-gray-700"}`}>
                    <input type="radio" name="priority" checked={priorityFilter===p} onChange={() => setPriorityFilter(p)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${priorityFilter===p?"bg-blue-500":"bg-gray-300"}`} />
                    <span className="text-[12px] font-medium capitalize">{p==="all"?"All Priorities":p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
            <button onClick={clearFilters} disabled={!hasFilters} className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40">Clear All</button>
            <button onClick={() => setSidebarOpen(false)} className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold">Apply & Close</button>
          </div>
        </aside>
      </div>

      {/* VIEW MODAL */}
      {viewDoc && (
        <Dialog open={!!viewDoc} onOpenChange={v => { if (!v) setViewDoc(null); }}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[92vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg flex-shrink-0 flex-wrap gap-2">
              <div>
                <h2 className="text-base font-semibold">{viewDoc.document_name}</h2>
                <p className="text-xs text-blue-100">{viewDoc.document_number} · {viewDoc.tenant_name}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => { setViewDoc(null); setPopup({type:"share",doc:viewDoc}); }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] font-medium">
                  <Share2 className="h-3 w-3" />Share
                </button>
                <button onClick={() => handlePrint(viewDoc)} className="p-1.5 rounded-lg hover:bg-white/20"><Printer className="h-4 w-4" /></button>
                <button onClick={() => handleDownload(viewDoc)} className="p-1.5 rounded-lg hover:bg-white/20"><Download className="h-4 w-4" /></button>
                <DialogClose asChild><button className="p-1.5 rounded-full hover:bg-white/20"><X className="h-4 w-4 text-white" /></button></DialogClose>
              </div>
            </div>
            {/* Info bar */}
            <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2.5 bg-gray-50 border-b text-[11px]">
              {[["Tenant",viewDoc.tenant_name],["Phone",viewDoc.tenant_phone||"—"],["Property",viewDoc.property_name||"—"],["Room",viewDoc.room_number||"—"]].map(([k,v]) => (
                <div key={k}><span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{k}</span><p className="font-semibold text-gray-800 truncate">{v}</p></div>
              ))}
            </div>
            {/* Timeline in modal */}
            <div className="px-4 py-3 border-b bg-white flex items-start gap-3">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mt-1 flex-shrink-0">Timeline</span>
              <div className="overflow-x-auto flex-1">
                <TimelineSteps doc={viewDoc} onStepClick={(d, action) => { setViewDoc(null); setPopup({type:action as any,doc:d}); }} />
              </div>
            </div>
            <div className="overflow-y-auto p-4 bg-slate-100" style={{ maxHeight:"calc(92vh - 210px)" }}>
              <div className="bg-white rounded-lg shadow max-w-[210mm] mx-auto p-2">
                {viewDoc.html_content
                  ? <div dangerouslySetInnerHTML={{ __html: viewDoc.html_content }} />
                  : <div className="text-center py-16 text-gray-400"><FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="text-sm font-medium">No document content</p></div>
                }
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* POPUPS */}
      {popup.type === "share"    && popup.doc && <SharePopup        doc={popup.doc} onClose={closePopup} onDone={popupDone} />}
      {popup.type === "hold"     && popup.doc && <ChangeStatusPopup doc={popup.doc} targetStatus="On Hold"         onClose={closePopup} onDone={popupDone} />}
      {popup.type === "complete" && popup.doc && <ChangeStatusPopup doc={popup.doc} targetStatus="Completed"       onClose={closePopup} onDone={popupDone} />}
      {popup.type === "cancel"   && popup.doc && <ChangeStatusPopup doc={popup.doc} targetStatus="Cancelled"       onClose={closePopup} onDone={popupDone} />}
      {popup.type === "otp"      && popup.doc && <OTPVerifyPopup    doc={popup.doc} onClose={closePopup} onDone={popupDone} />}
      {popup.type === "esign"    && popup.doc && <ESignPopup        doc={popup.doc} onClose={closePopup} onDone={popupDone} />}
      {popup.type === "edit"     && popup.doc && <TemplateEditPopup doc={popup.doc} onClose={closePopup} onDone={popupDone} />}
    </div>
  );
}