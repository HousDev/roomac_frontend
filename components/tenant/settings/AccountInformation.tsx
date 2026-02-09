import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Info as IconInfo } from "lucide-react";
import type { TenantProfile } from "@/lib/tenantDetailsApi";

interface AccountInformationProps {
  tenant: TenantProfile | null;
}

export default function AccountInformation({ tenant }: AccountInformationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Your basic account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Full Name</Label>
            <p className="mt-2 text-gray-700">{tenant?.full_name || "N/A"}</p>
          </div>
          <div>
            <Label>Email</Label>
            <p className="mt-2 text-gray-700">{tenant?.email || "N/A"}</p>
          </div>
          <div>
            <Label>Phone</Label>
            <p className="mt-2 text-gray-700">
              {tenant?.country_code} {tenant?.phone || "N/A"}
            </p>
          </div>
          <div>
            <Label>Status</Label>
            <p className="mt-2">
              <span
                className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                  tenant?.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {tenant?.is_active ? "ACTIVE" : "INACTIVE"}
              </span>
            </p>
          </div>
          <div>
            <Label>Property</Label>
            <p className="mt-2 text-gray-700">{tenant?.property_name || "Not assigned"}</p>
          </div>
          <div>
            <Label>Room</Label>
            <p className="mt-2 text-gray-700">{tenant?.room_number || "Not assigned"}</p>
          </div>
        </div>

        <Alert>
          <IconInfo className="h-4 w-4" />
          <AlertDescription>
            To update your basic information, please visit your <strong>Profile</strong> page or contact your property manager.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}