// components/admin/enquiries/TenantConflictDialog.tsx

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, UserPlus, RefreshCw, X } from "lucide-react";
import { useState } from "react";

interface TenantConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingTenants: Array<{
    id: number;
    full_name: string;
    email: string;
    phone: string;
    is_deleted: boolean;
  }>;
  enquiryName: string;
  onAction: (action: 'create_new' | 'update_existing', tenantId?: number) => void;
  isProcessing: boolean;
}

const TenantConflictDialog = ({
  isOpen,
  onClose,
  existingTenants,
  enquiryName,
  onAction,
  isProcessing
}: TenantConflictDialogProps) => {
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] p-0 rounded-xl border-0 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Tenant Conflict Detected
              </h2>
              <p className="text-xs text-amber-100 mt-0.5">
                Found existing tenants with matching email or phone
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-white/15 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-gray-700 mb-3">
            The enquiry for <span className="font-semibold">{enquiryName}</span> matches existing tenants:
          </p>

          {/* Existing tenants list */}
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {existingTenants.map((tenant) => (
              <div
                key={tenant.id}
                className={`p-3 border rounded-lg cursor-pointer transition ${
                  selectedTenant === tenant.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
                onClick={() => setSelectedTenant(tenant.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{tenant.full_name}</span>
                  {tenant.is_deleted && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      In Trash
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {tenant.email && <div>Email: {tenant.email}</div>}
                  {tenant.phone && <div>Phone: {tenant.phone}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Button
              onClick={() => onAction('update_existing', selectedTenant!)}
              disabled={!selectedTenant || isProcessing}
              className="w-full bg-amber-600 hover:bg-amber-700 text-sm h-9"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Update Selected Tenant
            </Button>
            
            <Button
              onClick={() => onAction('create_new')}
              disabled={isProcessing}
              variant="outline"
              className="w-full text-sm h-9"
            >
              <UserPlus className="h-3.5 w-3.5 mr-2" />
              Create New Tenant Anyway
            </Button>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-3">
            Updating will merge enquiry data with the existing tenant
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TenantConflictDialog;