// components/admin/enquiries/EnquiryViewDialog.tsx
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Enquiry, Followup } from "@/lib/enquiryApi";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Clock,
  X,
  Trash2,
  IndianRupee,
  User,
  Briefcase,
  StickyNote,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import EnquiryVisitsTab from "./EnquiryVisitsTab";

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
  onEnquiryUpdate?: () => void;
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
  onEnquiryUpdate,
}: EnquiryViewDialogProps) => {
  const [isAddingFollowup, setIsAddingFollowup] = useState(false);
  const [activeTab, setActiveTab] = useState("followups");
  const [localEnquiry, setLocalEnquiry] = useState<Enquiry | null>(enquiry);

  // Update local enquiry when prop changes
  useEffect(() => {
    setLocalEnquiry(enquiry);
  }, [enquiry]);

  // Reset followup text when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFollowupText("");
      setActiveTab("followups");
    }
  }, [isOpen, setFollowupText]);

  if (!localEnquiry) return null;

  const handleAddFollowup = async () => {
    if (!followupText.trim()) {
      toast.error("Please enter a followup note");
      return;
    }

    setIsAddingFollowup(true);
    try {
      await onAddFollowup();
    } finally {
      setIsAddingFollowup(false);
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this enquiry? This action cannot be undone.")) {
      onDelete(localEnquiry.id);
    }
  };

  const handleVisitChange = () => {
    if (onEnquiryUpdate) {
      onEnquiryUpdate();
    }
  };

  // Helper function to format budget range for display
  const formatBudget = (budget: string) => {
    const budgetMap: Record<string, string> = {
      'below-5000': 'Under ₹5,000',
      '5000-8000': '₹5,000 - ₹8,000',
      '8000-12000': '₹8,000 - ₹12,000',
      '12000-18000': '₹12,000 - ₹18,000',
      '18000-25000': '₹18,000 - ₹25,000',
      '25000+': 'Above ₹25,000'
    };
    return budgetMap[budget] || budget;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] p-0 rounded-xl border-0 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] px-4 py-3 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-white uppercase tracking-wider mb-0.5">Enquiry Details</p>
            <h2 className="text-sm font-semibold text-white truncate">{localEnquiry.tenant_name}</h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {getStatusBadge(localEnquiry.status || "new")}
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-white/15 text-white hover:text-white transition ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[80vh]">
          {/* Contact Info */}
          <div className="px-4 py-3 space-y-1.5 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-800">Contact Information</span>
              <span className="text-[10px] text-slate-500">
                Added: {formatDateForDisplay(localEnquiry.created_at || "")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-slate-500 flex-shrink-0" />
              <span className="text-xs font-medium text-slate-800">{localEnquiry.phone}</span>
            </div>

            {localEnquiry.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-slate-500 flex-shrink-0" />
                <span className="text-xs text-slate-600 truncate">{localEnquiry.email}</span>
              </div>
            )}

            <div className="flex items-start gap-2">
              <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-slate-600 leading-relaxed">
                {localEnquiry.property_full_name || localEnquiry.property_name || "—"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-slate-500 flex-shrink-0" />
              <span className="text-xs text-slate-600">
                Move-in: <span className="font-medium text-slate-700">
                  {formatDateForDisplay(localEnquiry.preferred_move_in_date)}
                </span>
              </span>
            </div>

            {localEnquiry.budget_range && (
              <div className="flex items-center gap-2">
                <IndianRupee className="h-3 w-3 text-slate-500 flex-shrink-0" />
                <span className="text-xs text-slate-600">
                  Budget: <span className="font-medium text-slate-700">
                    {formatBudget(localEnquiry.budget_range)}
                  </span>
                </span>
              </div>
            )}

            {/* Occupation Info */}
            {(localEnquiry.occupation || localEnquiry.occupation_category) && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  <span className="text-xs text-slate-600">
                    {localEnquiry.occupation_category && (
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] mr-1">
                        {localEnquiry.occupation_category}
                      </span>
                    )}
                    {localEnquiry.occupation}
                  </span>
                </div>
              </div>
            )}

            {/* Remark */}
            {localEnquiry.remark && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <StickyNote className="h-3 w-3 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600 italic">"{localEnquiry.remark}"</span>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {localEnquiry.message && (
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="h-3 w-3 text-slate-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-800">Requirements</span>
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-100 leading-relaxed">
                {localEnquiry.message}
              </p>
            </div>
          )}

          {/* Tabs for Followups and Visits */}
          <div className="px-4 py-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="followups" className="text-xs">Followups</TabsTrigger>
                <TabsTrigger value="visits" className="text-xs">Visits</TabsTrigger>
              </TabsList>
              
              <TabsContent value="followups" className="mt-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-800">
                        Followup History
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {localEnquiry.followups?.length || 0}
                    </span>
                  </div>

                  {/* Followup list */}
                  <div className="space-y-1.5 max-h-28 overflow-y-auto mb-2.5 scrollbar-thin scrollbar-thumb-slate-200">
                    {localEnquiry.followups && localEnquiry.followups.length > 0 ? (
                      localEnquiry.followups.map((followup: Followup) => (
                        <div key={followup.id} className="bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
                          <p className="text-[11px] text-slate-700 leading-relaxed">{followup.note}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[9px] text-slate-500">{followup.created_by}</span>
                            <span className="text-[9px] text-slate-400">
                              {formatDateForDisplay(followup.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 text-center py-2">No followups yet</p>
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
                    <Button
                      onClick={handleAddFollowup}
                      disabled={!followupText.trim() || isAddingFollowup}
                      className="w-full h-7 text-[11px] font-semibold bg-indigo-900 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition"
                    >
                      {isAddingFollowup ? "Adding..." : "Add Followup"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="visits" className="mt-3">
                <EnquiryVisitsTab 
                  enquiryId={localEnquiry.id} 
                  tenantName={localEnquiry.tenant_name}
                  onVisitChange={handleVisitChange}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Actions */}
          <div className="px-4 py-3 bg-slate-50 flex items-center justify-between border-t border-slate-200">
            <button
              onClick={handleDeleteClick}
              className="flex items-center gap-1.5 text-[11px] font-medium text-red-500 hover:text-red-700 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Enquiry
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