// DocumentList.tsx
// Changes from previous version:
// 1. Timeline redesigned to match Image 2: horizontal pill steps with icons + connecting lines
//    each step shows icon + label, active = blue filled, done = green check, pending = grey outline
// 2. Status DB fix: status values mapped to VARCHAR-safe strings (handled in updateDocumentStatus calls)
// 3. Share popup: matches Image 1 exactly (already correct, kept as-is)
// 4. Form / layout kept compact
// 5. Fully responsive

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText, Eye, Share2, Trash2, CheckCircle, X,
  Printer, AlertCircle, RefreshCw, Filter,
  Download, Mail, MessageCircle, Shield,
  Loader2, Phone, Square, CheckSquare,
  Copy, Link, PenLine, PauseCircle, XCircle,
  Smartphone, Globe, Plus, Check,
  QrCode, ArrowRight, Send, ChevronDown,
  User, Clock, ShieldCheck, Pen,
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

import {
  listDocuments, getDocument, deleteDocument, updateDocumentStatus,
  bulkDeleteDocuments,
  type Document as Doc, type DocumentStatus,
} from "@/lib/documentlistApi";

// ── Timeline step definitions ─────────────────────────────────────────────────
// These match Image 2: Created → Shared → On Hold → OTP Verified → E-Sign Pending → Completed
// Plus a separate "Cancelled" bubble on the right
const MAIN_STEPS: Array<{
  key: string;
  label: string;
  short: string;
  Icon: React.FC<any>;
}> = [
  { key: "Created",        label: "Created",       short: "Created",  Icon: FileText     },
  { key: "Shared",         label: "Shared",        short: "Shared",   Icon: Share2       },
  { key: "On Hold",        label: "On Hold",        short: "On Hold",  Icon: PauseCircle  },
  { key: "OTP Verified",   label: "OTP Verified",  short: "OTP",      Icon: ShieldCheck  },
  { key: "E-Sign Pending", label: "E-Sign Pending",short: "E-Sign",   Icon: Pen          },
  { key: "Completed",      label: "Completed",     short: "Done",     Icon: CheckCircle  },
];

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
        else if (state === "active") circleCls += "border-blue-600 bg-blue-600 text-white ring-2 ring-blue-200 shadow-sm";
        else if (isNext)        circleCls += "border-blue-400 border-dashed bg-white text-blue-500 cursor-pointer hover:bg-blue-50 hover:scale-110 hover:shadow";
        else                    circleCls += "border-gray-200 bg-gray-100 text-gray-400";

        const iconSz = compact ? "h-2.5 w-2.5" : "h-3 w-3";

        // Label below (only on non-compact)
        const labelCls = compact ? "hidden" : `text-[8px] leading-tight mt-0.5 font-medium truncate max-w-[40px] sm:max-w-[52px] text-center ${
          state === "done" ? "text-green-600" :
          state === "active" ? "text-blue-700 font-bold" :
          isNext ? "text-blue-500" : "text-gray-400"
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
// POPUP: Share — COMPACT version
// - 3-column channel grid (not 2×2)
// - Reduced paddings, smaller text, tighter rows
// - max-h reduced so it fits mobile without scrolling past footer
// - max-w wider (2xl → 2xl on sm, full on mobile)
// ════════════════════════════════════════════════════════════════════════════
function SharePopup({ doc, onClose, onDone }: { doc: Doc; onClose: () => void; onDone: () => void }) {
  const [channels,      setChannels]      = useState<Set<string>>(new Set());
  const [recipients,    setRecipients]    = useState([
    { name: doc.tenant_name || "Tenant", contact: doc.tenant_phone || "", type: "Tenant" },
  ]);
  const [customName,    setCustomName]    = useState("");
  const [customContact, setCustomContact] = useState("");
  const [customType,    setCustomType]    = useState("Phone");
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
    { id:"whatsapp", label:"WhatsApp",   desc:"Rich formatting",    Icon: MessageCircle, clr:"text-green-600 bg-green-50 border-green-200"   },
    { id:"email",    label:"Email",       desc:"With attachment",    Icon: Mail,          clr:"text-blue-600 bg-blue-50 border-blue-200"      },
    { id:"sms",      label:"SMS",         desc:"Document link",      Icon: Smartphone,    clr:"text-purple-600 bg-purple-50 border-purple-200"},
    { id:"public",   label:"Public Link", desc:"Shareable link",     Icon: Globe,         clr:"text-orange-600 bg-orange-50 border-orange-200"},
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Modal — max-w-2xl gives more width, max-h tight */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col">

        {/* ── Header (compact) ── */}
        <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Share2 className="h-3.5 w-3.5 text-green-600" />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-gray-900 leading-tight">Share Document</h2>
              <p className="text-[10px] text-gray-400 truncate max-w-[260px]">{doc.document_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400"><X className="h-4 w-4" /></button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">

          {/* Doc summary — compact 2+2 inline grid */}
          <div className="bg-gray-50 rounded-lg px-3 py-2 grid grid-cols-2 gap-x-6 gap-y-0.5 text-[10px]">
            <div><span className="text-gray-400">Document: </span><span className="font-semibold text-gray-700">{doc.id}</span></div>
            <div><span className="text-gray-400">Template: </span><span className="font-semibold text-gray-700 truncate">{doc.document_name}</span></div>
            <div><span className="text-gray-400">Tenant: </span><span className="font-semibold text-gray-700">{doc.tenant_name}</span></div>
            <div><span className="text-gray-400">Property: </span><span className="font-semibold text-gray-700">{doc.property_name || "N/A"}</span></div>
          </div>

          {/* ── Channels — 3-column on sm+, 2-col on xs ── */}
          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">Select Sharing Channels</p>
            {/* grid-cols-2 on mobile, grid-cols-3 on sm (puts first 3 in a row, last alone) */}
            {/* We use grid-cols-2 sm:grid-cols-4 so all 4 fit one row on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CHANNELS.map(c => (
                <button
                  key={c.id}
                  onClick={() => toggleChannel(c.id)}
                  className={`flex items-center gap-1.5 px-2 py-2 rounded-xl border-2 text-left transition-all
                    ${channels.has(c.id) ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                >
                  <div className={`p-1 rounded-lg border flex-shrink-0
                    ${channels.has(c.id) ? "bg-blue-100 text-blue-600 border-blue-200" : c.clr}`}>
                    <c.Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-gray-800 leading-tight">{c.label}</p>
                    <p className="text-[8px] text-gray-400 leading-tight truncate">{c.desc}</p>
                  </div>
                  {channels.has(c.id) && <Check className="h-3 w-3 text-blue-600 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* ── Recipients ── */}
          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">Recipients</p>
            {/* Add row */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <div className="relative flex-shrink-0">
                <select className="h-6 pl-1.5 pr-5 text-[10px] border border-gray-200 rounded-md bg-white appearance-none font-medium">
                  <option>Both</option>
                </select>
                <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-gray-400 pointer-events-none" />
              </div>
              <span className="text-[9px] text-gray-400 hidden sm:inline">Add Custom</span>
              <Input
                value={customName} onChange={e => setCustomName(e.target.value)}
                placeholder="Name" className="h-6 text-[10px] w-16 sm:w-20 flex-shrink-0"
              />
              <Input
                value={customContact} onChange={e => setCustomContact(e.target.value)}
                placeholder="Phone/Email" className="h-6 text-[10px] w-24 sm:w-28 flex-shrink-0"
              />
              <div className="relative flex-shrink-0">
                <select value={customType} onChange={e => setCustomType(e.target.value)}
                  className="h-6 pl-1.5 pr-5 text-[10px] border border-gray-200 rounded-md bg-white appearance-none">
                  <option>Phone</option><option>Email</option>
                </select>
                <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-gray-400 pointer-events-none" />
              </div>
              <button onClick={addRecipient}
                className="h-6 w-6 rounded-md bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 flex-shrink-0">
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {/* List */}
            <div className="space-y-1">
              {recipients.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-2.5 w-2.5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-800 truncate">{r.name}</p>
                    <p className="text-[9px] text-gray-500">{r.contact}</p>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold flex-shrink-0">{r.type}</span>
                  <button onClick={() => setRecipients(p => p.filter((_, j) => j !== i))}
                    className="text-gray-300 hover:text-red-400 flex-shrink-0 ml-0.5"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Message ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Tenant Message</p>
              <div className="flex gap-1">
                <button
                  onClick={() => setMessage(`Dear ${doc.tenant_name},\n\nPlease find attached the ${doc.document_name} for your review.\n\nDocument ID: ${doc.id}\nDate: ${fmt(doc.created_at)}\n\nProperty: ${doc.property_name || "N/A"}\nRoom: ${doc.room_number || "N/A"}`)}
                  className="h-5 px-2 rounded bg-blue-600 text-white text-[9px] font-semibold">Use Default</button>
                <button
                  onClick={() => navigator.clipboard.writeText(message).catch(() => {})}
                  className="h-5 px-1.5 rounded border border-gray-200 text-[9px] font-medium text-gray-600 flex items-center gap-0.5">
                  <Copy className="h-2 w-2" />Copy
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full text-[10px] p-2 border border-gray-200 rounded-lg resize-none bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all leading-relaxed"
            />
          </div>

          {/* ── Quick Actions ── */}
          <div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">Quick Actions</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(`${window.location.origin}/document/view/${doc.share_token || doc.id}`).catch(() => {});
                  toast.success("Link copied!");
                }}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <Link className="h-3 w-3 text-blue-600 flex-shrink-0" />
                <span className="text-[10px] font-semibold text-gray-700">Copy Public Link</span>
              </button>
              <button
                onClick={() => toast.info("QR generation coming soon")}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
              >
                <QrCode className="h-3 w-3 text-orange-600 flex-shrink-0" />
                <span className="text-[10px] font-semibold text-gray-700">Generate QR Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 border-t px-3 py-2 flex items-center justify-between bg-white rounded-b-2xl">
          <p className="text-[9px] text-gray-400">{channels.size} channel(s) · {recipients.length} recipient(s)</p>
          <div className="flex gap-1.5">
            <button onClick={onClose}
              className="h-7 px-3 rounded-lg border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleShare} disabled={sharing}
              className="h-7 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] font-semibold flex items-center gap-1 disabled:opacity-60">
              {sharing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Share Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// POPUP: Change Status (On Hold / Completed / Cancelled)
// ════════════════════════════════════════════════════════════════════════════
function ChangeStatusPopup({
  doc, targetStatus, onClose, onDone,
}: { doc: Doc; targetStatus: string; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const meta: Record<string, { Icon: any; color: string; border: string; desc: string }> = {
    "On Hold":   { Icon: PauseCircle,  color: "text-orange-500", border: "border-orange-200 bg-orange-50", desc: "Document processing paused" },
    "Completed": { Icon: CheckCircle,  color: "text-emerald-600", border: "border-emerald-200 bg-emerald-50", desc: "All processes finished" },
    "Cancelled": { Icon: XCircle,      color: "text-red-500",     border: "border-red-200 bg-red-50",       desc: "Document cancelled" },
  };
  const m = meta[targetStatus] || meta["On Hold"];

  const handleSubmit = async () => {
    if (!reason.trim()) { toast.error("Please provide a reason"); return; }
    setSaving(true);
    try {
      await updateDocumentStatus(doc.id, targetStatus as DocumentStatus);
      toast.success(`Status → ${targetStatus}`);
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Change Document Status</h2>
            <p className="text-[10px] text-gray-500">Update status for 1 selected document</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-[11px] font-bold text-gray-700 mb-2">New Status <span className="text-red-400">*</span></p>
            <div className={`flex items-center gap-3 p-3.5 rounded-xl border-2 ${m.border}`}>
              <div className="h-4 w-4 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center flex-shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-gray-900">{targetStatus}</p>
                <p className="text-[11px] text-gray-500">{m.desc}</p>
              </div>
              <m.Icon className={`h-5 w-5 flex-shrink-0 ${m.color}`} />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
              Reason for Change <span className="text-red-400">*</span>
            </label>
            <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Please provide a reason for changing the status…"
              className="w-full text-[11px] p-2.5 border border-gray-200 rounded-lg resize-none bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
          </div>
          <p className="text-[10px] text-gray-400">This will update 1 document</p>
        </div>
        <div className="flex justify-end gap-2 px-4 pb-3">
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold flex items-center gap-1.5 disabled:opacity-60">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}Update Status
          </button>
        </div>
        {/* Step trail */}
        <div className="border-t px-4 py-2.5 flex items-center gap-1 overflow-x-auto rounded-b-2xl bg-gray-50">
          {[...MAIN_STEPS.map(s => s.key), "Cancelled"].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-1 flex-shrink-0">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap
                ${s === targetStatus ? (s === "Cancelled" ? "bg-red-600 text-white" : "bg-blue-600 text-white") : "bg-gray-100 text-gray-500"}`}>
                {s}
              </span>
              {i < arr.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-gray-300" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// POPUP: OTP Verify
// ════════════════════════════════════════════════════════════════════════════
function OTPVerifyPopup({ doc, onClose, onDone }: { doc: Doc; onClose: () => void; onDone: () => void }) {
  const [otp,      setOtp]      = useState("");
  const [otpSent,  setOtpSent]  = useState(false);
  const [verified, setVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [via,      setVia]      = useState<"sms"|"email">("sms");
  const [notes,    setNotes]    = useState("");
  const [saving,   setSaving]   = useState(false);

  const sendOtp = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtp(code); setOtpSent(true);
    toast.success(`OTP sent (demo): ${code}`);
  };

  const verifyOtp = () => {
    if (otpInput === otp) { setVerified(true); toast.success("OTP verified!"); }
    else toast.error("Invalid OTP");
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      await updateDocumentStatus(doc.id, "OTP Verified" as DocumentStatus);
      toast.success("OTP Verified — status updated");
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Verify Parties</h2>
            <p className="text-[10px] text-gray-500">Verify tenant to continue</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className={`border-2 rounded-xl p-3.5 transition-colors ${verified ? "border-green-300 bg-green-50/30" : "border-gray-200"}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-bold text-gray-800">Tenant Details <span className="text-[10px] font-normal text-gray-400">(Optional)</span></p>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {verified ? "✓ Verified" : "Not verified"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Input defaultValue={doc.tenant_name} readOnly className="h-8 text-[11px] bg-gray-50" placeholder="Name" />
              <Input defaultValue={doc.tenant_email || ""} className="h-8 text-[11px]" placeholder="Email" />
              <Input defaultValue={doc.tenant_phone} readOnly className="h-8 text-[11px] bg-gray-50" />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] text-gray-600 font-medium">Send via:</span>
              {(["sms","email"] as const).map(v => (
                <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={via===v} onChange={() => setVia(v)} className="accent-blue-600" />
                  <span className="text-[11px] font-medium uppercase">{v}</span>
                </label>
              ))}
              <button onClick={sendOtp} disabled={verified}
                className="ml-auto h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold disabled:opacity-40">
                Send OTP
              </button>
            </div>
            {otpSent && !verified && (
              <div className="flex gap-2">
                <Input value={otpInput} onChange={e => setOtpInput(e.target.value)}
                  placeholder="Enter OTP received" className="h-8 text-[11px] flex-1" />
                <button onClick={verifyOtp} className="h-8 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] font-semibold">Verify</button>
              </div>
            )}
            {verified && (
              <div className="flex items-center gap-2 text-green-600 text-[11px] font-semibold mt-1">
                <CheckCircle className="h-4 w-4" />OTP verified successfully!
              </div>
            )}
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-600 block mb-1">Additional Notes (Optional)</label>
            <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Add any notes about the verification process…"
              className="w-full text-[11px] p-2.5 border border-gray-200 rounded-lg resize-none bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-4 pb-4">
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleContinue} disabled={saving}
            className={`h-9 px-5 rounded-xl text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-60
              ${verified ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500 hover:bg-gray-600"}`}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Continue ({verified ? "Verified" : "Not Verified"})
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// POPUP: E-Sign
// ════════════════════════════════════════════════════════════════════════════
function ESignPopup({ doc, onClose, onDone }: { doc: Doc; onClose: () => void; onDone: () => void }) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateDocumentStatus(doc.id, "E-Sign Pending" as DocumentStatus);
      toast.success("Submitted for E-Sign");
      onDone();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[82vh] flex flex-col">
        {/* Header compact */}
        <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0">
          <div>
            <h2 className="text-[13px] font-bold text-gray-900 leading-tight">E-sign (Aadhaar)</h2>
            <p className="text-[9px] text-gray-400">Doc id: {doc.id} · Click 'Add Box' or 'Mark' — coordinates auto-generated</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="h-6 px-2 rounded-lg border border-gray-200 text-[9px] font-medium text-gray-600 flex items-center gap-1 hover:bg-gray-50">
              <Download className="h-2.5 w-2.5" />Upload PDF
            </button>
            <button className="h-6 px-2 rounded-lg border border-gray-200 text-[9px] font-medium text-gray-600 hover:bg-gray-50">View Coordinates</button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400"><X className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Signers panel compact */}
          <div className="w-36 sm:w-44 border-r bg-gray-50 overflow-y-auto flex-shrink-0 p-2 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Signers</p>
              <button className="h-4 px-1.5 rounded bg-blue-600 text-white text-[8px] font-semibold">+ Add</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-1.5 space-y-1">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-sm bg-blue-500" />
                <p className="text-[10px] font-bold text-gray-700">Tenant</p>
                <Check className="h-2.5 w-2.5 text-green-500 ml-auto" />
              </div>
              <Input defaultValue={doc.tenant_name} readOnly className="h-5 text-[9px] bg-gray-50 px-1.5" />
              <Input defaultValue={doc.tenant_email || ""} placeholder="Email" className="h-5 text-[9px] px-1.5" />
              <Input defaultValue={doc.tenant_phone} readOnly className="h-5 text-[9px] bg-gray-50 px-1.5" />
              <div className="flex gap-1 pt-0.5">
                <button className="flex-1 h-5 rounded-md bg-blue-600 text-white text-[8px] font-semibold">+ Add Box</button>
                <button className="flex-1 h-5 rounded-md border border-gray-200 text-[8px] text-gray-600">✋ Mark</button>
              </div>
              <button className="w-full text-[8px] text-red-400 hover:text-red-600 font-medium pt-0.5">Remove Signer</button>
            </div>
          </div>
          {/* Document preview */}
          <div className="flex-1 bg-slate-100 overflow-auto flex items-start justify-center p-2">
            <div className="bg-white rounded-lg shadow-md w-full max-w-[210mm] min-h-48">
              {doc.html_content
                ? <div className="p-3 text-[10px]" dangerouslySetInnerHTML={{ __html: doc.html_content }} />
                : <div className="flex items-center justify-center h-48 text-gray-400 flex-col gap-2">
                    <FileText className="h-10 w-10 text-gray-300" />
                    <p className="text-xs font-medium text-gray-500">Upload PDF to view</p>
                    <p className="text-[9px] text-gray-400">API must return PDF/base64</p>
                  </div>
              }
            </div>
          </div>
        </div>
        {/* Footer compact */}
        <div className="flex-shrink-0 border-t px-3 py-2 flex items-center justify-between bg-white rounded-b-2xl">
          <p className="text-[10px] text-gray-500">1 Signer (0 boxes)</p>
          <div className="flex gap-1.5">
            <button onClick={onClose} className="h-7 px-3 rounded-xl border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50">Stop Marking</button>
            <button onClick={handleSubmit} disabled={saving}
              className="h-7 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold flex items-center gap-1 disabled:opacity-60">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}Submit to Digio
            </button>
            <button onClick={onClose} className="h-7 px-3 rounded-xl border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50">Close</button>
          </div>
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
    type: "share"|"hold"|"otp"|"esign"|"complete"|"cancel" | null;
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
    const r = await Swal.fire({ title:"Delete Document?", text:`"${name}" will be permanently removed.`, icon:"warning", showCancelButton:true, confirmButtonColor:"#d33", confirmButtonText:"Yes, delete", customClass:{popup:"rounded-xl text-sm"} });
    if (!r.isConfirmed) return;
    try { await deleteDocument(id); toast.success("Deleted"); setSelectedIds(p=>{const n=new Set(p);n.delete(id);return n;}); await loadDocs(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.length) return;
    const r = await Swal.fire({ title:`Delete ${selectedItems.length} document(s)?`, icon:"warning", showCancelButton:true, confirmButtonColor:"#d33", confirmButtonText:"Delete all", customClass:{popup:"rounded-xl text-sm"} });
    if (!r.isConfirmed) return;
    try { await bulkDeleteDocuments(selectedItems.map(d=>d.id)); toast.success(`Deleted ${selectedItems.length}`); setSelectedIds(new Set()); setSelectAll(false); await loadDocs(); }
    catch (e: any) { toast.error(e.message); }
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

  const handleExport = () => {
    const rows = filteredRows.map(d => [d.document_number,d.document_name,d.tenant_name,d.tenant_phone,d.property_name||"",d.room_number||"",d.status,d.priority,fmt(d.created_at)]);
    const csv = [["Doc#","Name","Tenant","Phone","Property","Room","Status","Priority","Date"],...rows].map(r=>r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=`documents_${new Date().toISOString().split("T")[0]}.csv`; a.click();
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
    </div>
  );
}