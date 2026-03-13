// components/admin/enquiries/ScheduleVisitDialog.tsx
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, CalendarDays, X } from "lucide-react";
import { scheduleVisit } from "@/lib/enquiryApi";
import { toast } from "sonner";

interface ScheduleVisitDialogProps {
  enquiryId: string;
  tenantName: string;
  isOpen: boolean;
  onClose: () => void;
  onVisitScheduled: () => void;
}

const ScheduleVisitDialog = ({
  enquiryId,
  tenantName,
  isOpen,
  onClose,
  onVisitScheduled,
}: ScheduleVisitDialogProps) => {
  const [visitData, setVisitData] = useState({
    scheduled_date: "",
    scheduled_time: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!visitData.scheduled_date) {
      toast.error("Please select a visit date");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await scheduleVisit(enquiryId, visitData);
      toast.success(response.message || "Visit scheduled successfully");
      onVisitScheduled();
      onClose();
      
      // Reset form
      setVisitData({
        scheduled_date: "",
        scheduled_time: "",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to schedule visit");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get tomorrow's date as min for date input
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] p-0 rounded-xl border-0 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-5 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Schedule Visit
            </h2>
            <p className="text-xs text-purple-100 mt-0.5">
              Schedule a site visit for {tenantName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/15 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Visit Date <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="date"
                min={minDate}
                value={visitData.scheduled_date}
                onChange={(e) => setVisitData({ ...visitData, scheduled_date: e.target.value })}
                className="pl-9 text-sm"
              />
            </div>
          </div>

          {/* Time (Optional) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Preferred Time <span className="text-gray-400 text-[10px]">(Optional)</span>
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="time"
                value={visitData.scheduled_time}
                onChange={(e) => setVisitData({ ...visitData, scheduled_time: e.target.value })}
                className="pl-9 text-sm"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Additional Notes
            </Label>
            <Textarea
              placeholder="Any specific instructions or preferences for the visit..."
              value={visitData.notes}
              onChange={(e) => setVisitData({ ...visitData, notes: e.target.value })}
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!visitData.scheduled_date || isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-white-700 text-sm"
            >
              {isSubmitting ? "Scheduling..." : "Schedule Visit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleVisitDialog;