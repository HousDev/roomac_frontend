// components/admin/enquiries/ConvertToTenantDialog.tsx - Final simplified version

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, UserPlus, X, ArrowRight } from "lucide-react";
import { convertEnquiryToTenant } from "@/lib/enquiryApi";
import { toast } from "sonner";

interface ConvertToTenantDialogProps {
  enquiryId: string;
  tenantName: string;
  isOpen: boolean;
  onClose: () => void;
  onConverted: () => void;
}

const ConvertToTenantDialog = ({
  enquiryId,
  tenantName,
  isOpen,
  onClose,
  onConverted,
}: ConvertToTenantDialogProps) => {
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const response = await convertEnquiryToTenant(enquiryId);
      
      // Check if we need to handle conflicts
      if (response.requiresAction && response.existingTenants) {
        toast.error(`Cannot convert: Found ${response.existingTenants.length} existing tenant(s) with matching email/phone. Please use a different email or phone.`);
        setIsConverting(false);
        onClose(); // Close the dialog
        return;
      }

      toast.success(response.message || "Enquiry converted to tenant successfully");
      onConverted(); // Trigger parent refresh
      onClose(); // Close the dialog
    } catch (error: any) {
      toast.error(error.message || "Failed to convert enquiry to tenant");
      onClose();
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] p-0 rounded-xl border-0 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white px-5 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Convert to Tenant
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              Convert enquiry from {tenantName} to a tenant
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
        <div className="p-5">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-700 mb-2">
              You are about to convert this enquiry to a tenant.
            </p>
            <p className="text-xs text-gray-500">
              This will:
            </p>
            <ul className="text-xs text-gray-500 text-left mt-2 space-y-1 list-disc pl-5">
              <li>Create a new tenant record with the enquiry details</li>
              <li>Soft delete this enquiry (move to trash)</li>
              <li>Mark the enquiry status as "converted"</li>
              <li>Add a followup note about the conversion</li>
            </ul>
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Note:</span> If a tenant with the same email or phone already exists, conversion will be blocked.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 text-sm"
              disabled={isConverting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvert}
              disabled={isConverting}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-sm"
            >
              {isConverting ? (
                <>Converting...</>
              ) : (
                <>
                  Convert Now
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertToTenantDialog;