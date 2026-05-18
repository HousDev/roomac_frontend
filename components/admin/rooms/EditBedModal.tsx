// components/admin/rooms/EditBedModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/lib/api";

interface EditBedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bedAssignment: any;
  tenantName: string;
  onSuccess: () => void;
}

export function EditBedModal({
  open,
  onOpenChange,
  bedAssignment,
  tenantName,
  onSuccess,
}: EditBedModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    apply_date: new Date().toISOString().split("T")[0],
    tenant_rent: "",
    security_deposit: "",
  });

  useEffect(() => {
    if (bedAssignment && open) {
      setFormData({
        apply_date: new Date().toISOString().split("T")[0],
        tenant_rent: bedAssignment.tenant_rent?.toString() || "",
        security_deposit: bedAssignment.security_deposit?.toString() || "",
      });
    }
  }, [bedAssignment, open]);

  // components/admin/rooms/EditBedModal.tsx - Update handleSubmit

const handleSubmit = async () => {
  if (!formData.apply_date) {
    toast.error("Please select an apply date");
    return;
  }

  setLoading(true);
  try {
    const payload: any = {
      apply_date: formData.apply_date,
    };

    // ✅ ALWAYS send tenant_rent (current rent from bed assignment)
    // This ensures the monthly rent is recalculated even if rent didn't change
    const currentRent = bedAssignment?.tenant_rent 
      ? parseFloat(bedAssignment.tenant_rent) 
      : 0;
    
    // If user entered a new rent, use that, otherwise use current rent
    const newRent = formData.tenant_rent && formData.tenant_rent !== bedAssignment?.tenant_rent?.toString()
      ? parseFloat(formData.tenant_rent)
      : currentRent;
    
    payload.tenant_rent = newRent;

    // Only send security deposit if it changed
    if (formData.security_deposit && formData.security_deposit !== bedAssignment?.security_deposit?.toString()) {
      payload.security_deposit = parseFloat(formData.security_deposit);
    }

    console.log("📤 Sending payload:", payload);

    const response = await request(`/api/rooms/bed-assignments/${bedAssignment.id}/edit`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (response.success) {
      toast.success(response.message);
      onOpenChange(false);
      onSuccess();
    } else {
      toast.error(response.message || "Failed to update bed");
    }
  } catch (error: any) {
    toast.error(error.message || "Failed to update bed");
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-blue-600" />
            Edit Bed Assignment
          </DialogTitle>
          <DialogDescription>
            Update rent or security deposit for {tenantName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="apply_date" className="text-sm font-medium">
              Apply From Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apply_date"
              type="date"
              value={formData.apply_date}
              onChange={(e) => setFormData({ ...formData, apply_date: e.target.value })}
              className="mt-1"
              max={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-slate-500 mt-1">
              Rent change will apply from this date in monthly rent calculation
            </p>
          </div>

          <div>
            <Label htmlFor="tenant_rent" className="text-sm font-medium">
              Monthly Rent (₹)
            </Label>
            <Input
              id="tenant_rent"
              type="text"
              placeholder="Enter monthly rent"
              value={formData.tenant_rent}
              onChange={(e) => setFormData({ ...formData, tenant_rent: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="security_deposit" className="text-sm font-medium">
              Security Deposit (₹)
            </Label>
            <Input
              id="security_deposit"
              type="text"
              placeholder="Enter security deposit"
              value={formData.security_deposit}
              onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}