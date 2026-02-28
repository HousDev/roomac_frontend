

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Label } from "@/components/ui/label";
// import { Info as IconInfo, Calendar, Home, Phone, Mail, User, MapPin } from "lucide-react";
// import type { TenantProfile } from "@/lib/tenantDetailsApi";

// interface AccountInformationProps {
//   tenant: TenantProfile | null;
// }

// export default function AccountInformation({ tenant }: AccountInformationProps) {
//   // Format date helper
//   const formatDate = (dateString?: string) => {
//     if (!dateString) return "N/A";
//     try {
//       return new Date(dateString).toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: 'short',
//         year: 'numeric'
//       });
//     } catch {
//       return "N/A";
//     }
//   };

//   // If tenant is null, show loading state
//   if (!tenant) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Account Information</CardTitle>
//           <CardDescription>Your basic account details</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-center py-8">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//               <p className="mt-4 text-gray-600">Loading account information...</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Account Information</CardTitle>
//         <CardDescription>Your basic account details</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* Personal Information Section */}
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
//             <User className="h-4 w-4 text-gray-500" />
//             Personal Details
//           </h3>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <Label className="text-xs text-gray-500">Full Name</Label>
//               <p className="mt-1 text-gray-900 font-medium">{tenant.full_name || "N/A"}</p>
//             </div>
//             <div>
//               <Label className="text-xs text-gray-500">Email Address</Label>
//               <p className="mt-1 text-gray-900 flex items-center gap-1">
//                 <Mail className="h-3 w-3 text-gray-400" />
//                 {tenant.email || "N/A"}
//               </p>
//             </div>
//             <div>
//               <Label className="text-xs text-gray-500">Phone Number</Label>
//               <p className="mt-1 text-gray-900 flex items-center gap-1">
//                 <Phone className="h-3 w-3 text-gray-400" />
//                 {tenant.country_code} {tenant.phone || "N/A"}
//               </p>
//             </div>
//             <div>
//               <Label className="text-xs text-gray-500">Status</Label>
//               <p className="mt-1">
//                 <span
//                   className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
//                     tenant.is_active
//                       ? "bg-green-100 text-green-800"
//                       : "bg-red-100 text-red-800"
//                   }`}
//                 >
//                   {tenant.is_active ? "ACTIVE" : "INACTIVE"}
//                 </span>
//               </p>
//             </div>
//             <div>
//               <Label className="text-xs text-gray-500">Gender</Label>
//               <p className="mt-1 text-gray-900">{tenant.gender || "Not specified"}</p>
//             </div>
//             <div>
//               <Label className="text-xs text-gray-500">Date of Birth</Label>
//               <p className="mt-1 text-gray-900 flex items-center gap-1">
//                 <Calendar className="h-3 w-3 text-gray-400" />
//                 {formatDate(tenant.date_of_birth)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Property Information Section */}
//         <div className="border-t border-gray-100 pt-4">
//           <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
//             <Home className="h-4 w-4 text-gray-500" />
//             Property Details
//           </h3>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <Label className="text-xs text-gray-500">Property Name</Label>
//               <p className="mt-1 text-gray-900">{tenant.property_name || "Not assigned"}</p>
//             </div>
//             <div>
//               <Label className="text-xs text-gray-500">Room Number</Label>
//               <p className="mt-1 text-gray-900">{tenant.room_number || "Not assigned"}</p>
//             </div>
//             <div>
//               <Label className="text-xs text-gray-500">Bed Number</Label>
//               <p className="mt-1 text-gray-900">{tenant.bed_number || "Not assigned"}</p>
//             </div>
//             <div>
//               <Label className="text-xs text-gray-500">Floor</Label>
//               <p className="mt-1 text-gray-900">{tenant.floor || "N/A"}</p>
//             </div>
//             <div>
//               <Label className="text-xs text-gray-500">Room Type</Label>
//               <p className="mt-1 text-gray-900 capitalize">{tenant.room_type?.replace('_', ' ') || "N/A"}</p>
//             </div>
//             <div>
//               <Label className="text-xs text-gray-500">Monthly Rent</Label>
//               <p className="mt-1 text-gray-900">
//                 ₹{tenant.rent_per_bed?.toLocaleString('en-IN') || tenant.monthly_rent?.toLocaleString('en-IN') || "N/A"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Property Address */}
//         {(tenant.property_address || tenant.property_city) && (
//           <div className="border-t border-gray-100 pt-4">
//             <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
//               <MapPin className="h-4 w-4 text-gray-500" />
//               Property Address
//             </h3>
//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="md:col-span-2">
//                 <Label className="text-xs text-gray-500">Address</Label>
//                 <p className="mt-1 text-gray-900">{tenant.property_address || "N/A"}</p>
//               </div>
//               <div>
//                 <Label className="text-xs text-gray-500">City</Label>
//                 <p className="mt-1 text-gray-900">{tenant.property_city || "N/A"}</p>
//               </div>
//               <div>
//                 <Label className="text-xs text-gray-500">State</Label>
//                 <p className="mt-1 text-gray-900">{tenant.property_state || "N/A"}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Property Manager */}
//         {(tenant.property_manager_name || tenant.manager_name) && (
//           <div className="border-t border-gray-100 pt-4">
//             <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Manager</h3>
//             <div className="grid md:grid-cols-2 gap-4">
//               <div>
//                 <Label className="text-xs text-gray-500">Manager Name</Label>
//                 <p className="mt-1 text-gray-900">{tenant.property_manager_name || tenant.manager_name || "N/A"}</p>
//               </div>
//               <div>
//                 <Label className="text-xs text-gray-500">Contact</Label>
//                 <p className="mt-1 text-gray-900">{tenant.property_manager_phone || tenant.manager_phone || "N/A"}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Contract Terms */}
//         {(tenant.check_in_date || tenant.lockin_period_months || tenant.notice_period_days) && (
//           <div className="border-t border-gray-100 pt-4">
//             <h3 className="text-sm font-semibold text-gray-900 mb-3">Contract Terms</h3>
//             <div className="grid md:grid-cols-3 gap-4">
//               {tenant.check_in_date && (
//                 <div>
//                   <Label className="text-xs text-gray-500">Check-in Date</Label>
//                   <p className="mt-1 text-gray-900">{formatDate(tenant.check_in_date)}</p>
//                 </div>
//               )}
//               {tenant.lockin_period_months && (
//                 <div>
//                   <Label className="text-xs text-gray-500">Lock-in Period</Label>
//                   <p className="mt-1 text-gray-900">{tenant.lockin_period_months} months</p>
//                 </div>
//               )}
//               {tenant.notice_period_days && (
//                 <div>
//                   <Label className="text-xs text-gray-500">Notice Period</Label>
//                   <p className="mt-1 text-gray-900">{tenant.notice_period_days} days</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

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
import { Info as IconInfo, Calendar, Home, Phone, Mail, User, MapPin, Building, Bed, Hash, CalendarDays } from "lucide-react";
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
        <CardHeader className="px-4 md:px-6">
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
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
    <Card className="overflow-hidden">
      <CardHeader className="px-4 md:px-6 pb-3 md:pb-4">
        <CardTitle className="text-base md:text-lg">Account Information</CardTitle>
        <CardDescription className="text-xs md:text-sm">Your basic account details</CardDescription>
      </CardHeader>
      <CardContent className="px-4 md:px-6 space-y-5 md:space-y-6">
        
        {/* Personal Information Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            Personal Details
          </h3>
          {/* MOBILE: 2-column grid | DESKTOP: 2-column grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4">
            {/* Full Name */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <User className="h-3 w-3" /> Name
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">Full Name</Label>
              <p className="text-xs md:text-base text-gray-900 font-medium truncate">{tenant.full_name || "N/A"}</p>
            </div>
            
            {/* Email */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <Mail className="h-3 w-3" /> Email
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">Email</Label>
              <p className="text-xs md:text-base text-gray-900 truncate">{tenant.email || "N/A"}</p>
            </div>
            
            {/* Phone */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <Phone className="h-3 w-3" /> Phone
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">Phone</Label>
              <p className="text-xs md:text-base text-gray-900 truncate">{tenant.country_code} {tenant.phone || "N/A"}</p>
            </div>
            
            {/* Status */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <div className="h-3 w-3 rounded-full bg-gray-400" /> Status
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">Status</Label>
              <div className="mt-0.5 md:mt-1">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold ${
                    tenant.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {tenant.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </div>
            
            {/* Gender */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <User className="h-3 w-3" /> Gender
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">Gender</Label>
              <p className="text-xs md:text-base text-gray-900">{tenant.gender || "—"}</p>
            </div>
            
            {/* Date of Birth */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <Calendar className="h-3 w-3" /> DOB
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">DOB</Label>
              <p className="text-xs md:text-base text-gray-900">{formatDate(tenant.date_of_birth)}</p>
            </div>
          </div>
        </div>

        {/* Property Information Section */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Home className="h-4 w-4 text-gray-500" />
            Property Details
          </h3>
          {/* MOBILE: 2-column grid | DESKTOP: 2-column grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4">
            {/* Property Name */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <Building className="h-3 w-3" /> Property
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">Property</Label>
              <p className="text-xs md:text-base text-gray-900 font-medium truncate">{tenant.property_name || "—"}</p>
            </div>
            
            {/* Room Number */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <Hash className="h-3 w-3" /> Room
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">Room</Label>
              <p className="text-xs md:text-base text-gray-900">{tenant.room_number || "—"}</p>
            </div>
            
            {/* Bed Number */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <Bed className="h-3 w-3" /> Bed
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">Bed</Label>
              <p className="text-xs md:text-base text-gray-900">{tenant.bed_number || "—"}</p>
            </div>
            
            {/* Floor */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <Home className="h-3 w-3" /> Floor
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">Floor</Label>
              <p className="text-xs md:text-base text-gray-900">{tenant.floor || "—"}</p>
            </div>
            
            {/* Room Type */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <Home className="h-3 w-3" /> Type
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">Room Type</Label>
              <p className="text-xs md:text-base text-gray-900 capitalize truncate">{tenant.room_type?.replace('_', ' ') || "—"}</p>
            </div>
            
            {/* Monthly Rent */}
            <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                <span className="text-xs">₹</span> Rent
              </Label>
              <Label className="text-xs text-gray-500 hidden md:block">Monthly Rent</Label>
              <p className="text-xs md:text-base text-gray-900 font-medium">
                ₹{tenant.rent_per_bed?.toLocaleString('en-IN') || tenant.monthly_rent?.toLocaleString('en-IN') || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Property Address - WITH CITY & STATE */}
        {(tenant.property_address || tenant.property_city || tenant.property_state) && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              Property Address
            </h3>
            
            {/* Full Address - Full width on mobile */}
            <div className="bg-gray-50 p-3 rounded-lg mb-3 md:hidden">
              <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3" /> Address
              </Label>
              <p className="text-xs text-gray-900">
                {tenant.property_address || ""}
                {tenant.property_address && (tenant.property_city || tenant.property_state) ? ", " : ""}
                {tenant.property_city || ""}
                {tenant.property_city && tenant.property_state ? ", " : ""}
                {tenant.property_state || ""}
              </p>
            </div>
            
            {/* Mobile: City & State in 2-column grid */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {tenant.property_city && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" /> City
                  </Label>
                  <p className="text-xs font-medium">{tenant.property_city}</p>
                </div>
              )}
              {tenant.property_state && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3" /> State
                  </Label>
                  <p className="text-xs font-medium">{tenant.property_state}</p>
                </div>
              )}
            </div>
            
            {/* Desktop view - separate fields */}
            <div className="hidden md:grid md:grid-cols-2 md:gap-4">
              <div>
                <Label className="text-xs text-gray-500">Address</Label>
                <p className="mt-1 text-gray-900">{tenant.property_address || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
          </div>
        )}

        {/* Property Manager */}
        {(tenant.property_manager_name || tenant.manager_name) && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Manager</h3>
            {/* MOBILE: 2-column grid | DESKTOP: 2-column grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4">
              <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
                <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                  <User className="h-3 w-3" /> Name
                </Label>
                <Label className="text-xs text-gray-500 hidden md:block">Name</Label>
                <p className="text-xs md:text-base text-gray-900 truncate">{tenant.property_manager_name || tenant.manager_name || "—"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
                <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                  <Phone className="h-3 w-3" /> Contact
                </Label>
                <Label className="text-xs text-gray-500 hidden md:block">Contact</Label>
                <p className="text-xs md:text-base text-gray-900 truncate">{tenant.property_manager_phone || tenant.manager_phone || "—"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contract Terms */}
        {(tenant.check_in_date || tenant.lockin_period_months || tenant.notice_period_days) && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contract Terms</h3>
            {/* MOBILE: 2-column grid | DESKTOP: 3-column grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {tenant.check_in_date && (
                <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
                  <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                    <CalendarDays className="h-3 w-3" /> Check-in
                  </Label>
                  <Label className="text-xs text-gray-500 hidden md:block">Check-in</Label>
                  <p className="text-xs md:text-base text-gray-900">{formatDate(tenant.check_in_date)}</p>
                </div>
              )}
              {tenant.lockin_period_months && (
                <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
                  <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                    <Calendar className="h-3 w-3" /> Lock-in
                  </Label>
                  <Label className="text-xs text-gray-500 hidden md:block">Lock-in</Label>
                  <p className="text-xs md:text-base text-gray-900">{tenant.lockin_period_months}m</p>
                </div>
              )}
              {tenant.notice_period_days && (
                <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
                  <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
                    <Calendar className="h-3 w-3" /> Notice
                  </Label>
                  <Label className="text-xs text-gray-500 hidden md:block">Notice</Label>
                  <p className="text-xs md:text-base text-gray-900">{tenant.notice_period_days}d</p>
                </div>
              )}
            </div>
          </div>
        )}

        <Alert className="mt-4 md:mt-6">
          <IconInfo className="h-4 w-4" />
          <AlertDescription className="text-xs md:text-sm">
            To update your information, visit <strong>Profile</strong> or contact manager.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}