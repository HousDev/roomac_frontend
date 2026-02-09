// components/admin/enquiries/components/EnquiryViewDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Enquiry, Followup } from "@/lib/enquiryApi";
import { Calendar, Phone, Mail, MapPin, DollarSign, MessageSquare, Clock } from "lucide-react";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Enquiry Details</span>
            {getStatusBadge(enquiry.status || "new")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{enquiry.tenant_name}</h3>
              <span className="text-sm text-gray-500">
                {formatDateForDisplay(enquiry.created_at || "")}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{enquiry.phone}</span>
              </div>
              {enquiry.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{enquiry.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{enquiry.property_full_name || enquiry.property_name || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Move-in: {formatDateForDisplay(enquiry.preferred_move_in_date)}</span>
              </div>
              {enquiry.budget_range && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>Budget: {enquiry.budget_range}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Message */}
          {enquiry.message && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <Label>Message</Label>
              </div>
              <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded border">
                {enquiry.message}
              </p>
            </div>
          )}

          {/* Followups */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <Label className="font-medium">Followups</Label>
              <Badge variant="secondary" className="ml-auto">
                {enquiry.followups?.length || 0}
              </Badge>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {enquiry.followups && enquiry.followups.length > 0 ? (
                enquiry.followups.map((followup: Followup) => (
                  <Card key={followup.id} className="p-3">
                    <p className="text-sm">{followup.note}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateForDisplay(followup.timestamp)} • {followup.created_by}
                    </p>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  No followups yet
                </p>
              )}
            </div>

            {/* Add Followup */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a followup note..."
                value={followupText}
                onChange={(e) => setFollowupText(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <Button 
                onClick={onAddFollowup} 
                size="sm" 
                className="w-full"
                disabled={!followupText.trim()}
              >
                Add Followup
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Are you sure you want to delete this enquiry?")) {
                  onDelete(enquiry.id);
                }
              }}
            >
              Delete
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnquiryViewDialog;