"use client";

// app/admin/templates/page.tsx
// Template Center - SMS / WhatsApp / Email templates
// Roomac admin dashboard — blue/cyan theme

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  MessageSquare, Mail, Phone, Plus, Search, RefreshCw,
  Loader2, CheckCircle, Clock, XCircle, AlertCircle,
  Eye, Edit2, Copy, Trash2, MoreVertical, Sparkles,
  X, Send, Zap,
} from "lucide-react";

import {
  getTemplates, createTemplate, updateTemplate,
  approveTemplate, rejectTemplate, duplicateTemplate,
  deleteTemplate, bulkDeleteTemplates,
  generateWithAI,
  type MessageTemplate, type TemplateChannel, type TemplateCategory,
} from "@/lib/templateApi";
import { useAuth } from "@/context/authContext";

/* ── Constants ───────────────────────────────────────────────── */

const CHANNELS: { key: TemplateChannel; label: string; icon: any; color: string }[] = [
  { key: "sms",       label: "SMS Templates",       icon: Phone,         color: "bg-blue-600"   },
  { key: "whatsapp",  label: "WhatsApp Templates",  icon: MessageSquare, color: "bg-green-600"  },
  { key: "email",     label: "Email Templates",     icon: Mail,          color: "bg-purple-600" },
];

const CATEGORIES: { key: TemplateCategory; label: string; color: string }[] = [
  { key: "otp",          label: "OTP",          color: "bg-red-100 text-red-700"       },
  { key: "payment",      label: "Payment",      color: "bg-green-100 text-green-700"   },
  { key: "verification", label: "Verification", color: "bg-blue-100 text-blue-700"     },
  { key: "marketing",    label: "Marketing",    color: "bg-purple-100 text-purple-700" },
  { key: "alert",        label: "Alert",        color: "bg-orange-100 text-orange-700" },
  { key: "reminder",     label: "Reminder",     color: "bg-yellow-100 text-yellow-700" },
  { key: "welcome",      label: "Welcome",      color: "bg-cyan-100 text-cyan-700"     },
  { key: "notice",       label: "Notice",       color: "bg-gray-100 text-gray-700"     },
];

const CHANNEL_VARIABLES: Record<string, string[]> = {
  otp:          ["otp", "tenant_name", "expiry_minutes"],
  payment:      ["tenant_name", "amount", "property_name", "receipt_id", "payment_date", "due_date"],
  verification: ["tenant_name", "verify_link", "otp", "expiry_hours"],
  marketing:    ["name", "property_name", "location", "price", "cta_url", "discount"],
  alert:        ["tenant_name", "request_id", "status", "staff_name", "property_name"],
  reminder:     ["tenant_name", "amount", "due_date", "property_name", "room_number"],
  welcome:      ["tenant_name", "property_name", "checkin_date", "room_number", "staff_name"],
  notice:       ["tenant_name", "notice_message", "effective_date", "property_name"],
};

/* ── Helpers ─────────────────────────────────────────────────── */

function getCategoryStyle(cat: string) {
  return CATEGORIES.find((c) => c.key === cat)?.color || "bg-gray-100 text-gray-700";
}

function getChannelIcon(channel: string) {
  if (channel === "sms")      return <Phone className="h-3 w-3" />;
  if (channel === "whatsapp") return <MessageSquare className="h-3 w-3" />;
  return <Mail className="h-3 w-3" />;
}

function extractVarsFromContent(content: string): string[] {
  return [...new Set((content.match(/\{(\w+)\}/g) || []).map((v) => v.replace(/[{}]/g, "")))];
}

/* ── Roomac Logo SVG (inline, matches brand) ─────────────────── */
const RoomacLogo = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* House outline */}
    <path d="M8 20 L18 10 L28 20 L26 20 L26 30 L10 30 L10 20 Z" fill="#F5A623" stroke="#F5A623" strokeWidth="0.5"/>
    {/* Door */}
    <rect x="15" y="23" width="6" height="7" rx="1" fill="#1A3A6B"/>
    {/* Window */}
    <rect x="11" y="20" width="5" height="4" rx="0.5" fill="#1A3A6B"/>
    {/* Person */}
    <circle cx="21" cy="17" r="2" fill="#1A3A6B"/>
    {/* Suitcase */}
    <rect x="19" y="21" width="4" height="3" rx="0.5" fill="#1A3A6B"/>
    {/* ROOMAC text */}
    <text x="34" y="26" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="16" fill="#1A3A6B" letterSpacing="1">ROOMAC</text>
  </svg>
);

/* ── Email Preview Component ─────────────────────────────────── */
function EmailPreview({ template }: { template: MessageTemplate }) {
  return (
    <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm max-w-sm mx-auto text-xs">
        {/* Header with logo */}
        <div className="bg-[#1A3A6B] px-4 py-3 flex items-center gap-2">
          <RoomacLogo className="h-6 w-auto" />
        </div>
        {/* Body */}
        <div className="px-4 py-3 space-y-2">
          {template.subject && (
            <p className="font-semibold text-gray-800 text-[11px]">{template.subject}</p>
          )}
          <div
            className="text-gray-600 leading-relaxed text-[10px] whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: template.content.replace(/\n/g, "<br/>") }}
          />
        </div>
        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
          <p className="text-[9px] text-gray-400 text-center">
            Roomac · Comfort, Care &amp; Quality Accommodation
          </p>
          <p className="text-[9px] text-blue-400 text-center">Unsubscribe · Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

/* ── WhatsApp Preview Component ──────────────────────────────── */
function WhatsAppPreview({ template }: { template: MessageTemplate }) {
  return (
    <div className="bg-[#e5ddd5] rounded-lg p-3 border border-gray-200">
      <div className="max-w-xs mx-auto">
        {/* WA header */}
        <div className="bg-[#075e54] px-3 py-2 rounded-t-lg flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#128c7e] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">R</span>
          </div>
          <div>
            <p className="text-white text-[10px] font-semibold">Roomac</p>
            <p className="text-green-300 text-[9px]">Business Account</p>
          </div>
        </div>
        {/* Chat bubble */}
        <div className="bg-white rounded-b-lg px-3 py-2 shadow-sm">
          <p className="text-[10px] text-gray-800 whitespace-pre-wrap leading-relaxed">{template.content}</p>
          <p className="text-[9px] text-gray-400 text-right mt-1">✓✓</p>
        </div>
      </div>
    </div>
  );
}

/* ── SMS Preview Component ───────────────────────────────────── */
function SmsPreview({ template }: { template: MessageTemplate }) {
  return (
    <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
      <div className="max-w-xs mx-auto">
        <div className="bg-gray-200 px-3 py-1.5 rounded-t-lg text-center">
          <p className="text-[9px] text-gray-500 font-medium">ROOMAC</p>
        </div>
        <div className="bg-white rounded-b-lg px-3 py-2 shadow-sm">
          <p className="text-[10px] text-gray-800 whitespace-pre-wrap leading-relaxed">{template.content}</p>
          <div className="flex justify-between items-center mt-1.5 border-t border-gray-100 pt-1">
            <p className="text-[9px] text-gray-400">{template.content.length} chars</p>
            <p className="text-[9px] text-blue-500">SMS</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function TemplateCenterPage() {
  const { can } = useAuth();

  const [templates, setTemplates]           = useState<MessageTemplate[]>([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [activeChannel, setActiveChannel]   = useState<TemplateChannel>("sms");
  const [statusFilter, setStatusFilter]     = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch]                 = useState("");
  const [channelCounts, setChannelCounts]   = useState<Record<string, { total: number; pending: number; approved: number }>>({});

  const [selected, setSelected]             = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading]       = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate]   = useState<MessageTemplate | null>(null);

  const [viewTemplate, setViewTemplate]     = useState<MessageTemplate | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  const [rejectingId, setRejectingId]       = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const [updating, setUpdating] = useState(false);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const { templates: data, stats } = await getTemplates({ channel: activeChannel, status: statusFilter, category: categoryFilter, search });
      setTemplates(data);
      const counts: Record<string, any> = {};
      stats.forEach((s) => {
        counts[s.channel] = { total: Number(s.total), pending: Number(s.pending), approved: Number(s.approved) };
      });
      setChannelCounts(counts);
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, [activeChannel, statusFilter, categoryFilter, search]);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const refresh = async () => {
    setRefreshing(true);
    await loadTemplates();
    setRefreshing(false);
    toast.success("Refreshed");
  };

  const filtered     = templates;
  const pendingCount  = filtered.filter((t) => t.status === "pending").length;
  const approvedCount = filtered.filter((t) => t.status === "approved").length;
  const allSelected   = selected.size === filtered.length && filtered.length > 0;

  const toggleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(filtered.map((t) => t.id)));

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleBulkDelete = async () => {
    try {
      setBulkLoading(true);
      await bulkDeleteTemplates(Array.from(selected));
      toast.success(`Deleted ${selected.size} templates`);
      setSelected(new Set());
      setShowBulkDeleteDialog(false);
      await loadTemplates();
    } catch { toast.error("Failed to delete"); }
    finally { setBulkLoading(false); }
  };

  const handleApprove = async (id: number) => {
    try {
      setUpdating(true);
      await approveTemplate(id);
      toast.success("Template approved");
      await loadTemplates();
    } catch { toast.error("Failed to approve"); }
    finally { setUpdating(false); }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      setUpdating(true);
      await rejectTemplate(rejectingId, rejectionReason);
      toast.success("Template rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      setRejectingId(null);
      await loadTemplates();
    } catch { toast.error("Failed to reject"); }
    finally { setUpdating(false); }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await duplicateTemplate(id);
      toast.success("Template duplicated");
      await loadTemplates();
    } catch { toast.error("Failed to duplicate"); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTemplate(id);
      toast.success("Template deleted");
      await loadTemplates();
    } catch { toast.error("Failed to delete"); }
  };

  if (loading && !refreshing) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="text-gray-600">Loading Template Center...</p>
    </div>
  );

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 min-h-screen">

      {/* ── Channel Tabs ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-3 pt-2 pb-0">
        <div className="flex items-center gap-1 overflow-x-auto pb-0">
          {CHANNELS.map((ch) => {
            const counts = channelCounts[ch.key];
            const isActive = activeChannel === ch.key;
            const Icon = ch.icon;
            return (
              <button
                key={ch.key}
                onClick={() => { setActiveChannel(ch.key); setSelected(new Set()); }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-blue-500 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {ch.label}
                {counts && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {counts.total}
                  </span>
                )}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2 pb-1">
            <Button variant="ghost" size="sm" onClick={refresh} disabled={refreshing} className="h-8 w-8 p-0">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            {can("manage_templates") && (
              <Button
                size="sm"
                onClick={() => { setEditingTemplate(null); setShowCreateDialog(true); }}
                className="h-8 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Create Template</span>
                <span className="sm:hidden">Create</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Status sub-tabs + Filters ── */}
      <div className="sticky top-[44px] sm:top-[46px] z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-3 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1">
            {[
              { key: "all",      label: "All Templates", count: filtered.length    },
              { key: "pending",  label: "Pending",       count: pendingCount       },
              { key: "approved", label: "Approved",      count: approvedCount      },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                  statusFilter === s.key
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {s.key === "pending"  && <Clock className="h-3 w-3" />}
                {s.key === "approved" && <CheckCircle className="h-3 w-3" />}
                {s.key === "all"      && <Eye className="h-3 w-3" />}
                {s.label}
                <span className={`text-[10px] px-1 rounded-full ${
                  statusFilter === s.key ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>{s.count}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="pl-7 h-7 text-xs w-36 sm:w-48 border-gray-200"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-7 text-xs w-32 sm:w-36 border-gray-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      {can("manage_templates") && selected.size > 0 && (
        <div className="sticky top-[90px] sm:top-[92px] z-10 mx-3 mt-2 bg-white rounded-lg shadow-lg border border-blue-200 p-2.5 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">{selected.size} selected</Badge>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())} className="h-7 text-xs text-gray-500">
              <X className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          </div>
          <Button
            variant="destructive" size="sm"
            onClick={() => setShowBulkDeleteDialog(true)}
            className="h-7 text-xs bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Selected
          </Button>
        </div>
      )}

      {/* ── Template Cards Grid ── */}
      <div className="p-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm font-medium">No templates found</p>
            <p className="text-gray-400 text-xs mt-1">Create your first template to get started</p>
            {can("manage_templates") && (
              <Button
                size="sm" className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                onClick={() => { setEditingTemplate(null); setShowCreateDialog(true); }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Template
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((tmpl) => (
              <TemplateCard
                key={tmpl.id}
                template={tmpl}
                selected={selected.has(tmpl.id)}
                onSelect={() => toggleSelect(tmpl.id)}
                onView={() => { setViewTemplate(tmpl); setShowViewDialog(true); }}
                onEdit={() => { setEditingTemplate(tmpl); setShowCreateDialog(true); }}
                onDuplicate={() => handleDuplicate(tmpl.id)}
                onDelete={() => handleDelete(tmpl.id)}
                onApprove={() => handleApprove(tmpl.id)}
                onReject={() => { setRejectingId(tmpl.id); setShowRejectDialog(true); }}
                canManage={can("manage_templates")}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT DIALOG ── */}
      <CreateEditDialog
        open={showCreateDialog}
        onOpenChange={(v) => { setShowCreateDialog(v); if (!v) setEditingTemplate(null); }}
        template={editingTemplate}
        activeChannel={activeChannel}
        onSuccess={async () => {
          setShowCreateDialog(false);
          setEditingTemplate(null);
          await loadTemplates();
        }}
      />

      {/* ── VIEW DIALOG ── */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
            <DialogTitle className="text-white text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" /> Template Preview
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-xs">
              #{viewTemplate?.id} · {viewTemplate?.channel?.toUpperCase()} · {viewTemplate?.category}
            </DialogDescription>
          </DialogHeader>
          {viewTemplate && (
            <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryStyle(viewTemplate.category)}`}>
                  {viewTemplate.category}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {getChannelIcon(viewTemplate.channel)}
                  <span className="ml-1">{viewTemplate.channel}</span>
                </Badge>
                {viewTemplate.status === "approved" && (
                  <Badge className="bg-green-100 text-green-700 border-0 text-[10px]"><CheckCircle className="h-2.5 w-2.5 mr-1" />Approved</Badge>
                )}
                {viewTemplate.status === "pending" && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-0 text-[10px]"><Clock className="h-2.5 w-2.5 mr-1" />Pending</Badge>
                )}
                {viewTemplate.status === "rejected" && (
                  <Badge className="bg-red-100 text-red-700 border-0 text-[10px]"><XCircle className="h-2.5 w-2.5 mr-1" />Rejected</Badge>
                )}
              </div>

              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Template Name</p>
                <p className="text-sm font-semibold">{viewTemplate.name}</p>
              </div>

              {viewTemplate.subject && (
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">Subject</p>
                  <p className="text-xs font-medium">{viewTemplate.subject}</p>
                </div>
              )}

              {/* ── Channel-specific preview ── */}
              <div>
                <p className="text-[10px] text-gray-500 mb-1 font-medium">
                  {viewTemplate.channel === "email" ? "📧 Email Preview" :
                   viewTemplate.channel === "whatsapp" ? "💬 WhatsApp Preview" : "📱 SMS Preview"}
                </p>
                {viewTemplate.channel === "email"     && <EmailPreview    template={viewTemplate} />}
                {viewTemplate.channel === "whatsapp"  && <WhatsAppPreview template={viewTemplate} />}
                {viewTemplate.channel === "sms"       && <SmsPreview      template={viewTemplate} />}
              </div>

              {viewTemplate.variables?.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-500 mb-1">Variables Used</p>
                  <div className="flex flex-wrap gap-1">
                    {viewTemplate.variables.map((v) => (
                      <span key={v} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-mono">
                        {"{" + v + "}"}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-gray-50 rounded-lg p-2">
                <div>
                  <p className="text-gray-400">Priority</p>
                  <p className="font-semibold capitalize text-gray-700">{viewTemplate.priority}</p>
                </div>
                <div>
                  <p className="text-gray-400">Used</p>
                  <p className="font-semibold text-gray-700">{viewTemplate.usage_count}x</p>
                </div>
                <div>
                  <p className="text-gray-400">Auto Approve</p>
                  <p className="font-semibold text-gray-700">{viewTemplate.auto_approve ? "Yes" : "No"}</p>
                </div>
              </div>

              {viewTemplate.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-[10px] text-red-600 font-medium">Rejection Reason</p>
                  <p className="text-xs text-red-700 mt-0.5">{viewTemplate.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── REJECT DIALOG ── */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-sm" aria-describedby="reject-desc">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 text-sm">
              <XCircle className="h-4 w-4" /> Reject Template
            </DialogTitle>
            <DialogDescription id="reject-desc" className="text-xs">
              Provide a reason for rejection so the creator can improve it.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={3}
            className="text-xs"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleReject} disabled={updating || !rejectionReason.trim()}>
              {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <XCircle className="h-3.5 w-3.5 mr-1" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── BULK DELETE DIALOG ── */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="max-w-sm" aria-describedby="bulk-delete-desc">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" /> Confirm Delete
            </DialogTitle>
            <DialogDescription id="bulk-delete-desc" className="text-xs">
              Delete {selected.size} template{selected.size > 1 ? "s" : ""}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBulkDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkLoading}>
              {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
              Delete {selected.size}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE CARD COMPONENT
═══════════════════════════════════════════════════════════════ */

function TemplateCard({
  template, selected, onSelect, onView, onEdit,
  onDuplicate, onDelete, onApprove, onReject, canManage,
}: {
  template: MessageTemplate;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onApprove: () => void;
  onReject: () => void;
  canManage: boolean;
}) {
  return (
    <Card className={`relative border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
      selected ? "border-blue-400 shadow-blue-100 shadow-md bg-blue-50/30" : "border-gray-200 bg-white"
    }`}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {canManage && (
              <Checkbox checked={selected} onCheckedChange={onSelect} className="mt-0.5" />
            )}
            <div className={`p-1.5 rounded-md ${
              template.channel === "sms"      ? "bg-blue-100"   :
              template.channel === "whatsapp" ? "bg-green-100"  : "bg-purple-100"
            }`}>
              {template.channel === "sms"      && <Phone       className="h-3 w-3 text-blue-600"   />}
              {template.channel === "whatsapp" && <MessageSquare className="h-3 w-3 text-green-600" />}
              {template.channel === "email"    && <Mail        className="h-3 w-3 text-purple-600" />}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100">
                <MoreVertical className="h-3.5 w-3.5 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-blue-600">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onView} className="text-xs cursor-pointer">
                <Eye className="h-3.5 w-3.5 mr-2" /> Preview
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuItem onClick={onEdit} className="text-xs cursor-pointer">
                    <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDuplicate} className="text-xs cursor-pointer">
                    <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                  </DropdownMenuItem>
                  {template.status === "pending" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onApprove} className="text-xs cursor-pointer text-green-600">
                        <CheckCircle className="h-3.5 w-3.5 mr-2" /> Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onReject} className="text-xs cursor-pointer text-red-600">
                        <XCircle className="h-3.5 w-3.5 mr-2" /> Reject
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-xs cursor-pointer text-red-600">
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="text-xs font-semibold text-gray-800 truncate mb-1.5">{template.name}</h3>

        <div className="flex items-center gap-1 flex-wrap mb-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getCategoryStyle(template.category)}`}>
            {template.category}
          </span>
          {template.status === "approved" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-0.5">
              <CheckCircle className="h-2.5 w-2.5" /> Approved
            </span>
          )}
          {template.status === "pending" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" /> Pending
            </span>
          )}
          {template.status === "rejected" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-0.5">
              <XCircle className="h-2.5 w-2.5" /> Rejected
            </span>
          )}
        </div>

        {template.variables?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {template.variables.slice(0, 4).map((v) => (
              <span key={v} className="text-[9px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded font-mono">
                {"{" + v + "}"}
              </span>
            ))}
            {template.variables.length > 4 && (
              <span className="text-[9px] text-gray-400">+{template.variables.length - 4}</span>
            )}
          </div>
        )}

        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2 mb-3 italic">
          "{template.content}"
        </p>

        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
          <span className="text-[10px] text-gray-400">
            {new Date(template.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
          <Button variant="ghost" size="sm" onClick={onView} className="h-6 text-[10px] text-blue-600 hover:bg-blue-50 px-2">
            <Eye className="h-3 w-3 mr-1" /> Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CREATE / EDIT DIALOG COMPONENT
═══════════════════════════════════════════════════════════════ */

function CreateEditDialog({
  open, onOpenChange, template, activeChannel, onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  template: MessageTemplate | null;
  activeChannel: TemplateChannel;
  onSuccess: () => void;
}) {
  const isEdit = !!template;

  const [name, setName]               = useState("");
  const [channel, setChannel]         = useState<TemplateChannel>(activeChannel);
  const [category, setCategory]       = useState<TemplateCategory>("alert");
  const [content, setContent]         = useState("");
  const [subject, setSubject]         = useState("");
  const [priority, setPriority]       = useState("normal");
  const [autoApprove, setAutoApprove] = useState(false);
  const [availableVars, setAvailableVars] = useState<string[]>([]);
  const [detectedVars, setDetectedVars]   = useState<string[]>([]);
  const [saving, setSaving]           = useState(false);
  const [aiLoading, setAiLoading]     = useState(false);
  const [subjectHint, setSubjectHint] = useState("");

  useEffect(() => {
    if (template) {
      setName(template.name);
      setChannel(template.channel);
      setCategory(template.category);
      setContent(template.content);
      setSubject(template.subject || "");
      setPriority(template.priority);
      setAutoApprove(!!template.auto_approve);
    } else {
      setName(""); setChannel(activeChannel); setCategory("alert");
      setContent(""); setSubject(""); setPriority("normal"); setAutoApprove(false);
    }
  }, [template, activeChannel, open]);

  useEffect(() => { setAvailableVars(CHANNEL_VARIABLES[category] || []); }, [category]);
  useEffect(() => { setDetectedVars(extractVarsFromContent(content)); }, [content]);

  const insertVar = (v: string) => setContent((prev) => prev + `{${v}}`);

  const handleAIGenerate = async () => {
    try {
      setAiLoading(true);
      // ✅ Now calls backend proxy — no CORS error
      const result = await generateWithAI({
        category,
        channel,
        subject_hint: subjectHint || name,
        tone: "professional and friendly",
      });
      setContent(result);
      toast.success("AI generated template content!");
    } catch (err: any) {
      toast.error("AI generation failed: " + (err?.message || "Unknown error"));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      toast.error("Name and content are required");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name, channel, category, content,
        subject: channel === "email" ? subject : undefined,
        variables: detectedVars,
        priority: priority as any,
        auto_approve: autoApprove,
        status: "pending" as any,
      };
      if (isEdit && template) {
        await updateTemplate(template.id, payload);
        toast.success("Template updated!");
      } else {
        await createTemplate(payload);
        toast.success("Template created!");
      }
      onSuccess();
    } catch {
      toast.error(isEdit ? "Failed to update" : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden" aria-describedby="create-edit-desc">
        <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {isEdit ? "Edit Template" : "Create Template"}
              {!isEdit && (
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full ml-1 capitalize">
                  {channel} Template
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-blue-100 bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="h-2.5 w-2.5" /> Manual review
              </span>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}
                className="h-7 w-7 text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription id="create-edit-desc" className="sr-only">
          {isEdit ? "Edit an existing message template" : "Create a new message template"}
        </DialogDescription>

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Name + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">Template Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. OTP Verification"
                className="h-9 text-xs border-gray-200 focus:border-blue-400"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
                <SelectTrigger className="h-9 text-xs border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.key} value={c.key} className="text-xs">{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Channel + Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as TemplateChannel)}>
                <SelectTrigger className="h-9 text-xs border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms"      className="text-xs">📱 SMS</SelectItem>
                  <SelectItem value="whatsapp" className="text-xs">💬 WhatsApp</SelectItem>
                  <SelectItem value="email"    className="text-xs">📧 Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-9 text-xs border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal" className="text-xs">Normal</SelectItem>
                  <SelectItem value="high"   className="text-xs">High</SelectItem>
                  <SelectItem value="urgent" className="text-xs">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email subject */}
          {channel === "email" && (
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">Email Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Rent Due Reminder - {property_name}"
                className="h-9 text-xs border-gray-200 focus:border-blue-400"
              />
            </div>
          )}

          {/* AI Generate */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-700">
              Content Subject <span className="text-gray-400 font-normal">(for AI generation)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={subjectHint}
                onChange={(e) => setSubjectHint(e.target.value)}
                placeholder="Describe what this template should say..."
                className="h-9 text-xs border-gray-200 focus:border-blue-400"
              />
              <Button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiLoading}
                className="h-9 text-xs px-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white whitespace-nowrap shadow-sm"
              >
                {aiLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                )}
                {aiLoading ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <p className="text-[10px] text-gray-400">
              Tip: Select a category and describe the context for best AI results.
            </p>
          </div>

          {/* Variables chips */}
          {availableVars.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">
                Variables <span className="text-gray-400 font-normal">(click to insert)</span>
              </Label>
              <div className="flex flex-wrap gap-1.5 bg-gray-50 rounded-lg p-2 border border-gray-200">
                {availableVars.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVar(v)}
                    className="text-[10px] bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded font-mono hover:bg-blue-50 hover:border-blue-400 transition-colors"
                  >
                    {"{" + v + "}"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Template Content */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-700">
              Template Content
              <span className="text-gray-400 font-normal ml-1">
                · Limit 1,000 · {1000 - content.length} left
              </span>
            </Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Template content will appear here. You can edit it after AI generation."
              rows={5}
              maxLength={1000}
              className="text-xs border-gray-200 focus:border-blue-400 resize-none font-mono"
            />
          </div>

          {/* Detected variables */}
          {detectedVars.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <p className="text-[10px] text-blue-600 font-medium mb-1">Detected Variables in Content:</p>
              <div className="flex flex-wrap gap-1">
                {detectedVars.map((v) => (
                  <span key={v} className="text-[10px] bg-white border border-blue-300 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                    {"{" + v + "}"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch id="auto-approve" checked={autoApprove} onCheckedChange={setAutoApprove} />
                <Label htmlFor="auto-approve" className="text-xs text-gray-600 cursor-pointer">Auto-approve</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Status</span>
                <Badge className="bg-yellow-100 text-yellow-700 border-0 text-[10px]">
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  {autoApprove ? "Approved" : "Pending"}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs px-4">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !name.trim() || !content.trim()}
                className="h-8 text-xs px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                {isEdit ? "Save Changes" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}