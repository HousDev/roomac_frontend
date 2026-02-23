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
} from "lucide-react";

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
      <DialogContent className="max-w-md w-[95vw] p-4 md:p-5 text-sm">

        {/* Header */}
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center justify-between text-base md:text-lg">
            <span>Enquiry Details</span>
            {getStatusBadge(enquiry.status || "new")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm md:text-base">
                {enquiry.tenant_name}
              </h3>
              <span className="text-xs text-gray-500">
                {formatDateForDisplay(enquiry.created_at || "")}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <Phone className="h-3.5 w-3.5 text-gray-500" />
                <span className="font-medium">{enquiry.phone}</span>
              </div>

              {enquiry.email && (
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Mail className="h-3.5 w-3.5 text-gray-500" />
                  <span>{enquiry.email}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs md:text-sm">
                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                <span>
                  {enquiry.property_full_name ||
                    enquiry.property_name ||
                    "-"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs md:text-sm">
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                <span>
                  Move-in:{" "}
                  {formatDateForDisplay(
                    enquiry.preferred_move_in_date
                  )}
                </span>
              </div>

              {enquiry.budget_range && (
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <DollarSign className="h-3.5 w-3.5 text-gray-500" />
                  <span>Budget: {enquiry.budget_range}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Message */}
          {enquiry.message && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs md:text-sm">
                <MessageSquare className="h-3.5 w-3.5 text-gray-500" />
                <Label className="text-xs md:text-sm">Message</Label>
              </div>
              <p className="text-xs md:text-sm text-gray-600 p-2 bg-gray-50 rounded border leading-snug">
                {enquiry.message}
              </p>
            </div>
          )}

          {/* Followups */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              <Label className="font-medium text-xs md:text-sm">
                Followups
              </Label>
              <Badge
                variant="secondary"
                className="ml-auto text-[10px] px-2 py-0.5"
              >
                {enquiry.followups?.length || 0}
              </Badge>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {enquiry.followups &&
              enquiry.followups.length > 0 ? (
                enquiry.followups.map(
                  (followup: Followup) => (
                    <Card
                      key={followup.id}
                      className="p-2 text-xs md:text-sm"
                    >
                      <p>{followup.note}</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {formatDateForDisplay(
                          followup.timestamp
                        )}{" "}
                        • {followup.created_by}
                      </p>
                    </Card>
                  )
                )
              ) : (
                <p className="text-xs text-gray-500 text-center py-1">
                  No followups yet
                </p>
              )}
            </div>

            {/* Add Followup */}
            <div className="space-y-1.5">
              <Textarea
                placeholder="Add a followup..."
                value={followupText}
                onChange={(e) =>
                  setFollowupText(e.target.value)
                }
                rows={2}
                className="text-xs md:text-sm"
              />
              <Button
                onClick={onAddFollowup}
                size="sm"
                className="w-full h-8 text-xs md:text-sm"
                disabled={!followupText.trim()}
              >
                Add Followup
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs md:text-sm"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete this enquiry?"
                  )
                ) {
                  onDelete(enquiry.id);
                }
              }}
            >
              Delete
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs md:text-sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnquiryViewDialog;
