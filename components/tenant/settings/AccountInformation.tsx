// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Label } from "@/components/ui/label";
// import { Info as IconInfo } from "lucide-react";
// import type { TenantProfile } from "@/lib/tenantDetailsApi";

// interface AccountInformationProps {
//   tenant: TenantProfile | null;
// }

// export default function AccountInformation({ tenant }: AccountInformationProps) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Account Information</CardTitle>
//         <CardDescription>Your basic account details</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="grid md:grid-cols-2 gap-4">
//           <div>
//             <Label>Full Name</Label>
//             <p className="mt-2 text-gray-700">{tenant?.full_name || "N/A"}</p>
//           </div>
//           <div>
//             <Label>Email</Label>
//             <p className="mt-2 text-gray-700">{tenant?.email || "N/A"}</p>
//           </div>
//           <div>
//             <Label>Phone</Label>
//             <p className="mt-2 text-gray-700">
//               {tenant?.country_code} {tenant?.phone || "N/A"}
//             </p>
//           </div>
//           <div>
//             <Label>Status</Label>
//             <p className="mt-2">
//               <span
//                 className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
//                   tenant?.is_active
//                     ? "bg-green-100 text-green-800"
//                     : "bg-red-100 text-red-800"
//                 }`}
//               >
//                 {tenant?.is_active ? "ACTIVE" : "INACTIVE"}
//               </span>
//             </p>
//           </div>
//           <div>
//             <Label>Property</Label>
//             <p className="mt-2 text-gray-700">{tenant?.property_name || "Not assigned"}</p>
//           </div>
//           <div>
//             <Label>Room</Label>
//             <p className="mt-2 text-gray-700">{tenant?.room_number || "Not assigned"}</p>
//           </div>
//         </div>

//         <Alert>
//           <IconInfo className="h-4 w-4" />
//           <AlertDescription>
//             To update your basic information, please visit your <strong>Profile</strong> page or contact your property manager.
//           </AlertDescription>
//         </Alert>
//       </CardContent>
//     </Card>
//   );
// }


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Info as IconInfo, Calendar, Home, Phone, Mail, User, MapPin } from "lucide-react";
import type { TenantProfile } from "@/lib/tenantDetailsApi";

interface AccountInformationProps {
  tenant: TenantProfile | null;
}

export default function AccountInformation({ tenant }: AccountInformationProps) {
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  // If tenant is null, show loading state
  if (!tenant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading account information...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Your basic account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            Personal Details
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Full Name</Label>
              <p className="mt-1 text-gray-900 font-medium">{tenant.full_name || "N/A"}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Email Address</Label>
              <p className="mt-1 text-gray-900 flex items-center gap-1">
                <Mail className="h-3 w-3 text-gray-400" />
                {tenant.email || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Phone Number</Label>
              <p className="mt-1 text-gray-900 flex items-center gap-1">
                <Phone className="h-3 w-3 text-gray-400" />
                {tenant.country_code} {tenant.phone || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Status</Label>
              <p className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                    tenant.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {tenant.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Gender</Label>
              <p className="mt-1 text-gray-900">{tenant.gender || "Not specified"}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Date of Birth</Label>
              <p className="mt-1 text-gray-900 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" />
                {formatDate(tenant.date_of_birth)}
              </p>
            </div>
          </div>
        </div>

        {/* Property Information Section */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Home className="h-4 w-4 text-gray-500" />
            Property Details
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Property Name</Label>
              <p className="mt-1 text-gray-900">{tenant.property_name || "Not assigned"}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Room Number</Label>
              <p className="mt-1 text-gray-900">{tenant.room_number || "Not assigned"}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Bed Number</Label>
              <p className="mt-1 text-gray-900">{tenant.bed_number || "Not assigned"}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Floor</Label>
              <p className="mt-1 text-gray-900">{tenant.floor || "N/A"}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Room Type</Label>
              <p className="mt-1 text-gray-900 capitalize">{tenant.room_type?.replace('_', ' ') || "N/A"}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Monthly Rent</Label>
              <p className="mt-1 text-gray-900">
                ₹{tenant.rent_per_bed?.toLocaleString('en-IN') || tenant.monthly_rent?.toLocaleString('en-IN') || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Property Address */}
        {(tenant.property_address || tenant.property_city) && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              Property Address
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-xs text-gray-500">Address</Label>
                <p className="mt-1 text-gray-900">{tenant.property_address || "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">City</Label>
                <p className="mt-1 text-gray-900">{tenant.property_city || "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">State</Label>
                <p className="mt-1 text-gray-900">{tenant.property_state || "N/A"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Property Manager */}
        {(tenant.property_manager_name || tenant.manager_name) && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Manager</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Manager Name</Label>
                <p className="mt-1 text-gray-900">{tenant.property_manager_name || tenant.manager_name || "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Contact</Label>
                <p className="mt-1 text-gray-900">{tenant.property_manager_phone || tenant.manager_phone || "N/A"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contract Terms */}
        {(tenant.check_in_date || tenant.lockin_period_months || tenant.notice_period_days) && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contract Terms</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {tenant.check_in_date && (
                <div>
                  <Label className="text-xs text-gray-500">Check-in Date</Label>
                  <p className="mt-1 text-gray-900">{formatDate(tenant.check_in_date)}</p>
                </div>
              )}
              {tenant.lockin_period_months && (
                <div>
                  <Label className="text-xs text-gray-500">Lock-in Period</Label>
                  <p className="mt-1 text-gray-900">{tenant.lockin_period_months} months</p>
                </div>
              )}
              {tenant.notice_period_days && (
                <div>
                  <Label className="text-xs text-gray-500">Notice Period</Label>
                  <p className="mt-1 text-gray-900">{tenant.notice_period_days} days</p>
                </div>
              )}
            </div>
          </div>
        )}

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