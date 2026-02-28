// components/admin/enquiries/components/EnquiryViewDialog.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Enquiry, Followup } from "@/lib/enquiryApi";
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  MessageSquare,
  Clock,
  X,
  Trash2,
  IndianRupee,
} from "lucide-react";
import MySwal from "@/app/utils/swal";

interface EnquiryViewDialogProps {
  enquiry: Enquiry | null;
  isOpen: boolean;
  onClose: () => void;
  followupText: string;
  setFollowupText: (text: string) => void;
  onAddFollowup: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  formatDateForDisplay: (dateString: string) => string;
  onDelete: (id: string) => void;
}

const EnquiryViewDialog = ({
  enquiry,
  isOpen,
  onClose,
  followupText,
  setFollowupText,
  onAddFollowup,
  getStatusBadge,
  formatDateForDisplay,
  onDelete,
}: EnquiryViewDialogProps) => {
  if (!enquiry) return null;

const handleDeleteClick = async () => {
  
  // Close the view dialog first
  onClose();
  
  // Small delay to ensure dialog is closed before SweetAlert opens
  setTimeout(async () => {
    const result = await MySwal.fire({
      title: "Delete Enquiry?",
      text: "Are you sure you want to delete this enquiry? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      onDelete(enquiry.id);
    }
  }, 100);
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-sm w-[95vw] p-0 rounded-xl border-0 shadow-2xl overflow-hidden">

    {/* ── Header ── */}
    <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:bg-blue-700 border-blue-600 px-4 py-3 flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-slate-800 uppercase tracking-wider mb-0.5">Enquiry Details</p>
        <h2 className="text-sm font-semibold text-white truncate">{enquiry.tenant_name}</h2>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {getStatusBadge(enquiry.status || "new")}
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/15 text-slate-800 hover:text-white transition ml-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>

    <div className="overflow-y-auto max-h-[80vh] divide-y divide-slate-100">

      {/* ── Contact Info ── */}
      <div className="px-4 py-3 space-y-1.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-800">Contact</span>
          <span className="text-[10px] text-slate-800">{formatDateForDisplay(enquiry.created_at || "")}</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3 text-slate-800 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-800">{enquiry.phone}</span>
        </div>

        {enquiry.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 text-slate-800 flex-shrink-0" />
            <span className="text-xs text-slate-600 truncate">{enquiry.email}</span>
          </div>
        )}

        <div className="flex items-start gap-2">
          <MapPin className="h-3 w-3 text-slate-800 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-slate-600 leading-relaxed">
            {enquiry.property_full_name || enquiry.property_name || "—"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-slate-800 flex-shrink-0" />
          <span className="text-xs text-slate-600">
            Move-in: <span className="font-medium text-slate-700">{formatDateForDisplay(enquiry.preferred_move_in_date)}</span>
          </span>
        </div>

        {enquiry.budget_range && (
          <div className="flex items-center gap-2">
            <IndianRupee className="h-3 w-3 text-slate-800 flex-shrink-0" />
            <span className="text-xs text-slate-600">Budget: <span className="font-medium text-slate-700">{enquiry.budget_range}</span></span>
          </div>
        )}
      </div>

      {/* ── Message ── */}
      {enquiry.message && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageSquare className="h-3 w-3 text-slate-800" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-800">Message</span>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-100 leading-relaxed">
            {enquiry.message}
          </p>
        </div>
      )}

      {/* ── Followups ── */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-slate-800" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-800">Followups</span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {enquiry.followups?.length || 0}
          </span>
        </div>

        {/* Followup list */}
        <div className="space-y-1.5 max-h-28 overflow-y-auto mb-2.5 scrollbar-thin scrollbar-thumb-slate-200">
          {enquiry.followups?.length > 0 ? (
            enquiry.followups.map((followup: Followup) => (
              <div key={followup.id} className="bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
                <p className="text-[11px] text-slate-700 leading-relaxed">{followup.note}</p>
                <p className="text-[9px] text-slate-800 mt-1">
                  {formatDateForDisplay(followup.timestamp)} · {followup.created_by}
                </p>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-800 text-center py-2">No followups yet</p>
          )}
        </div>

        {/* Add followup */}
        <div className="space-y-1.5">
          <textarea
            placeholder="Add a followup note…"
            value={followupText}
            onChange={e => setFollowupText(e.target.value)}
            rows={2}
            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-300 transition"
          />
          <button
            onClick={onAddFollowup}
            disabled={!followupText.trim()}
            className="w-full h-7 text-[11px] font-semibold bg-indigo-900 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            Add Followup
          </button>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
        <button
          onClick={handleDeleteClick}
          className="flex items-center gap-1.5 text-[11px] font-medium text-red-500 hover:text-red-700 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
        <button
          onClick={onClose}
          className="text-[11px] font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition"
        >
          Close
        </button>
      </div>

    </div>
  </DialogContent>
</Dialog>
  );
};

export default EnquiryViewDialog;