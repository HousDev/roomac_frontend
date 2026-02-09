// components/admin/tenants/tenant-edit-dialog.tsx

"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TenantForm } from "@/components/admin/tenants/tenant-form";
import type { Tenant } from "@/lib/tenantApi";

interface TenantEditDialogProps {
  tenant: Tenant;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TenantEditDialog({ 
  tenant, 
  isOpen, 
  onOpenChange, 
  onSuccess, 
  onCancel 
}: TenantEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tenant: {tenant.full_name}</DialogTitle>
        </DialogHeader>
        <TenantForm
          tenant={tenant}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}