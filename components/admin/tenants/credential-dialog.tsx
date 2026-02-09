// components/admin/tenants/credential-dialog.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCredential, resetCredential } from "@/lib/tenantApi";
import { toast } from "sonner";
import type { Tenant } from "@/lib/tenantApi";

interface CredentialDialogProps {
  tenant: Tenant;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

export function CredentialDialog({
  tenant,
  isOpen,
  onOpenChange,
  password,
  setPassword,
  loading,
  setLoading,
  onSuccess,
}: CredentialDialogProps) {
  const handleCreateCredentials = async () => {
    if (!tenant || !password) {
      toast.error("Please enter a password");
      return;
    }

    setLoading(true);
    try {
      const res = await createCredential(
        tenant.id as any,
        tenant.email,
        password
      );
      if (!res || !res.success) {
        toast.error(res?.message || "Failed to create credentials");
      } else {
        toast.success("Login credentials created successfully");
        onSuccess();
      }
    } catch (error: any) {
      console.error("handleCreateCredentials", error);
      toast.error("Failed to create credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!tenant || !password) {
      toast.error("Please enter a new password");
      return;
    }

    setLoading(true);
    try {
      const res = await resetCredential(tenant.id as any, password);
      if (!res || !res.success) {
        toast.error(res?.message || "Failed to reset password");
      } else {
        toast.success("Password reset successfully");
        onSuccess();
      }
    } catch (error: any) {
      console.error("handleResetPassword", error);
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tenant.has_credentials ? "Reset Password" : "Create Login Credentials"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tenant Name</Label>
            <Input value={tenant.full_name} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={tenant.email} disabled />
          </div>
          <div className="space-y-2">
            <Label>{tenant.has_credentials ? "New Password" : "Password"} *</Label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-slate-500">Minimum 6 characters required</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={tenant.has_credentials ? handleResetPassword : handleCreateCredentials}
              disabled={loading || !password || password.length < 6}
            >
              {loading ? "Processing..." : tenant.has_credentials ? "Reset Password" : "Create Login"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}