import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, Info as IconInfo } from "lucide-react";
import type { TenantProfile } from "@/lib/tenantDetailsApi";

interface DeletionRequestSectionProps {
  tenant: TenantProfile | null;
  deleteReason: string;
  deleteLoading: boolean;
  onDeleteReasonChange: (reason: string) => void;
  onRequestDeletion: () => Promise<void>;
  onCancelDeletion: () => Promise<void>;
}

export default function DeletionRequestSection({
  tenant,
  deleteReason,
  deleteLoading,
  onDeleteReasonChange,
  onRequestDeletion,
  onCancelDeletion,
}: DeletionRequestSectionProps) {
  const hasPendingDeletion = tenant?.deletion_request?.status === 'pending';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Account Deletion Request
        </CardTitle>
        <CardDescription>
          Request account deletion. This will be sent to property manager for approval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasPendingDeletion ? (
          <div className="space-y-4">
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Deletion Request Pending</strong>
                <p className="mt-1">
                  Your account deletion request is pending approval from the property manager.
                </p>
                <div className="mt-2 p-3 bg-white rounded border">
                  <p className="text-sm font-medium">Reason:</p>
                  <p className="text-sm mt-1">{tenant.delete_reason}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Requested on: {new Date(tenant.deleted_at || "").toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={onCancelDeletion}
                  disabled={deleteLoading}
                >
                  Cancel Request
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <IconInfo className="h-4 w-4" />
              <AlertDescription>
                When you request account deletion, it will be sent to the property manager for review. 
                You will be notified once a decision is made. You can cancel the request anytime before approval.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="deleteReason">Reason for deletion *</Label>
              <Textarea
                id="deleteReason"
                placeholder="Please provide a reason for account deletion..."
                value={deleteReason}
                onChange={(e) => onDeleteReasonChange(e.target.value)}
                className="mt-2"
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                This helps the property manager understand your request.
              </p>
            </div>

            <Alert variant="destructive">
              <Trash2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Once approved by the property manager, your account will be deleted and cannot be recovered.
                All your data including bookings and payments will be permanently removed.
              </AlertDescription>
            </Alert>

            <Button
              variant="destructive"
              onClick={onRequestDeletion}
              disabled={deleteLoading || !deleteReason.trim()}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteLoading ? "Submitting..." : "Request Account Deletion"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}