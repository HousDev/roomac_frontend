



// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Label } from "@/components/ui/label";
// import { Info as IconInfo, Calendar, Home, Phone, Mail, User, MapPin, Building, Bed, Hash, CalendarDays } from "lucide-react";
// import type { TenantProfile } from "@/lib/tenantDetailsApi";
// import { useEffect } from "react";

// interface AccountInformationProps {
//   tenant: TenantProfile | null;
// }

// export default function AccountInformation({ tenant }: AccountInformationProps) {
//   // Debug logging to see what data is coming from API
//   useEffect(() => {
//     if (tenant) {
//       console.log('🏠 AccountInformation - Tenant data:', {
//         property_name: tenant.property_name,
//         property_address: tenant.property_address,
//         property_state: tenant.property_state,
//         property_area: tenant.property_area,
//         property_city_id: tenant.property_city_id,
//         property_manager_name: tenant.property_manager_name,
//         property_manager_phone: tenant.property_manager_phone,
//         tenant_rent: tenant.tenant_rent,
//         rent_per_bed: tenant.rent_per_bed,
//         bed_type: tenant.bed_type,
//         is_couple: tenant.is_couple
//       });
//     }
//   }, [tenant]);

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

//   // Get the correct rent amount (from tenant_rent first, then fallback)
//   const getRentAmount = (): number => {
//     if (tenant?.tenant_rent) {
//       return Number(tenant.tenant_rent);
//     }
//     if (tenant?.rent_per_bed) {
//       return Number(tenant.rent_per_bed);
//     }
//     if (tenant?.monthly_rent) {
//       return Number(tenant.monthly_rent);
//     }
//     return 0;
//   };

//   const rentAmount = getRentAmount();

//   // Get bed display with type
//   const getBedDisplay = (): string => {
//     if (!tenant?.bed_number) return "—";
    
//     let bedDisplay = `#${tenant.bed_number}`;
//     if (tenant.bed_type) {
//       bedDisplay += ` (${tenant.bed_type})`;
//     }
//     return bedDisplay;
//   };

//   // Get sharing type
//   const getSharingType = (): string => {
//     if (tenant?.sharing_type) {
//       const type = tenant.sharing_type.toLowerCase();
//       if (type.includes('single')) return 'Single Occupancy';
//       if (type.includes('double')) return 'Double Sharing';
//       if (type.includes('triple')) return 'Triple Sharing';
//       return tenant.sharing_type;
//     }
//     if (tenant?.preferred_sharing) {
//       return tenant.preferred_sharing;
//     }
//     return "—";
//   };

//   // Get location display
//   const getLocationDisplay = (): string => {
//     const parts = [];
//     if (tenant?.property_area) parts.push(tenant.property_area);
//     if (tenant?.property_city_id) parts.push(`City ID: ${tenant.property_city_id}`);
//     if (tenant?.property_state) parts.push(tenant.property_state);
    
//     return parts.length > 0 ? parts.join(', ') : tenant?.property_address || "—";
//   };

//   // If tenant is null, show loading state
//   if (!tenant) {
//     return (
//       <Card>
//         <CardHeader className="px-4 md:px-6">
//           <CardTitle>Account Information</CardTitle>
//           <CardDescription>Your basic account details</CardDescription>
//         </CardHeader>
//         <CardContent className="px-4 md:px-6">
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
//     <Card className="overflow-hidden">
//       <CardHeader className="px-4 md:px-6 pb-3 md:pb-4">
//         <CardTitle className="text-base md:text-lg">Account Information</CardTitle>
//         <CardDescription className="text-xs md:text-sm">Your basic account details</CardDescription>
//       </CardHeader>
//       <CardContent className="px-4 md:px-6 space-y-5 md:space-y-6">
        
//         {/* Personal Information Section */}
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
//             <User className="h-4 w-4 text-gray-500" />
//             Personal Details
//           </h3>
//           <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4">
//             {/* Full Name */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <User className="h-3 w-3" /> Name
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Full Name</Label>
//               <p className="text-xs md:text-base text-gray-900 font-medium truncate">{tenant.full_name || "N/A"}</p>
//             </div>
            
//             {/* Email */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <Mail className="h-3 w-3" /> Email
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Email</Label>
//               <p className="text-xs md:text-base text-gray-900 truncate">{tenant.email || "N/A"}</p>
//             </div>
            
//             {/* Phone */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <Phone className="h-3 w-3" /> Phone
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Phone</Label>
//               <p className="text-xs md:text-base text-gray-900 truncate">
//                 {tenant.country_code ? `${tenant.country_code} ` : ""}{tenant.phone || "N/A"}
//               </p>
//             </div>
            
//             {/* Status */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <div className="h-3 w-3 rounded-full bg-gray-400" /> Status
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Status</Label>
//               <div className="mt-0.5 md:mt-1">
//                 <span
//                   className={`inline-flex px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold ${
//                     tenant.is_active
//                       ? "bg-green-100 text-green-800"
//                       : "bg-red-100 text-red-800"
//                   }`}
//                 >
//                   {tenant.is_active ? "ACTIVE" : "INACTIVE"}
//                 </span>
//               </div>
//             </div>
            
//             {/* Gender */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <User className="h-3 w-3" /> Gender
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Gender</Label>
//               <p className="text-xs md:text-base text-gray-900 capitalize">{tenant.gender || "—"}</p>
//             </div>
            
//             {/* Date of Birth */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <Calendar className="h-3 w-3" /> DOB
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">DOB</Label>
//               <p className="text-xs md:text-base text-gray-900">{formatDate(tenant.date_of_birth)}</p>
//             </div>
//           </div>
//         </div>

//         {/* Property Information Section */}
//         <div className="border-t border-gray-100 pt-4">
//           <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
//             <Home className="h-4 w-4 text-gray-500" />
//             Property Details
//           </h3>
//           <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4">
//             {/* Property Name */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <Building className="h-3 w-3" /> Property
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Property</Label>
//               <p className="text-xs md:text-base text-gray-900 font-medium truncate">{tenant.property_name || "—"}</p>
//             </div>
            
//             {/* Room Number */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <Hash className="h-3 w-3" /> Room
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Room</Label>
//               <p className="text-xs md:text-base text-gray-900">{tenant.room_number || "—"}</p>
//             </div>
            
//             {/* Bed Number with Type */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <Bed className="h-3 w-3" /> Bed
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Bed</Label>
//               <p className="text-xs md:text-base text-gray-900">{getBedDisplay()}</p>
//             </div>
            
//             {/* Floor */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <Home className="h-3 w-3" /> Floor
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Floor</Label>
//               <p className="text-xs md:text-base text-gray-900">{tenant.floor || "—"}</p>
//             </div>
            
//             {/* Room Type */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <Home className="h-3 w-3" /> Type
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Room Type</Label>
//               <p className="text-xs md:text-base text-gray-900 capitalize truncate">{tenant.room_type?.replace(/_/g, ' ') || "—"}</p>
//             </div>
            
//             {/* Sharing Type */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <Home className="h-3 w-3" /> Sharing
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Sharing</Label>
//               <p className="text-xs md:text-base text-gray-900">{getSharingType()}</p>
//             </div>
            
//             {/* Monthly Rent */}
//             <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//               <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                 <span className="text-xs">₹</span> Rent
//               </Label>
//               <Label className="text-xs text-gray-500 hidden md:block">Monthly Rent</Label>
//               <p className="text-xs md:text-base text-gray-900 font-medium text-green-600">
//                 ₹{rentAmount ? rentAmount.toLocaleString('en-IN') : "—"}
//               </p>
//             </div>
//           </div>

//           {/* Couple Badge */}
//           {/* {tenant.is_couple && (
//             <div className="mt-2 flex justify-end">
//               <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-md text-xs">
//                 👫 Couple Booking
//               </span>
//             </div>
//           )} */}
//         </div>

//         {/* Property Address */}
//         {(tenant.property_address || tenant.property_area || tenant.property_state) && (
//           <div className="border-t border-gray-100 pt-4">
//             <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
//               <MapPin className="h-4 w-4 text-gray-500" />
//               Property Location
//             </h3>
            
//             {/* Mobile view */}
//             <div className="md:hidden space-y-3">
//               {/* Full Address */}
//               <div className="bg-gray-50 p-3 rounded-lg">
//                 <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
//                   <MapPin className="h-3 w-3" /> Address
//                 </Label>
//                 <p className="text-xs text-gray-900">{getLocationDisplay()}</p>
//               </div>
//             </div>
            
//             {/* Desktop view */}
//             <div className="hidden md:grid md:grid-cols-2 md:gap-4">
//               <div>
//                 <Label className="text-xs text-gray-500">Address</Label>
//                 <p className="mt-1 text-gray-900">{tenant.property_address || "—"}</p>
//               </div>
//               <div>
//                 <Label className="text-xs text-gray-500">Area / Location</Label>
//                 <p className="mt-1 text-gray-900">{tenant.property_area || "—"}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Property Manager */}
//         {(tenant.property_manager_name || tenant.manager_name) && (
//           <div className="border-t border-gray-100 pt-4">
//             <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Manager</h3>
//             <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4">
//               <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//                 <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                   <User className="h-3 w-3" /> Name
//                 </Label>
//                 <Label className="text-xs text-gray-500 hidden md:block">Name</Label>
//                 <p className="text-xs md:text-base text-gray-900 truncate">{tenant.property_manager_name || tenant.manager_name || "—"}</p>
//               </div>
//               <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//                 <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                   <Phone className="h-3 w-3" /> Contact
//                 </Label>
//                 <Label className="text-xs text-gray-500 hidden md:block">Contact</Label>
//                 <p className="text-xs md:text-base text-gray-900 truncate">{tenant.property_manager_phone || tenant.manager_phone || "—"}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Contract Terms */}
//         {(tenant.check_in_date || tenant.lockin_period_months || tenant.notice_period_days) && (
//           <div className="border-t border-gray-100 pt-4">
//             <h3 className="text-sm font-semibold text-gray-900 mb-3">Contract Terms</h3>
//             <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
//               {tenant.check_in_date && (
//                 <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//                   <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                     <CalendarDays className="h-3 w-3" /> Check-in
//                   </Label>
//                   <Label className="text-xs text-gray-500 hidden md:block">Check-in</Label>
//                   <p className="text-xs md:text-base text-gray-900">{formatDate(tenant.check_in_date)}</p>
//                 </div>
//               )}
//               {tenant.lockin_period_months && (
//                 <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//                   <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                     <Calendar className="h-3 w-3" /> Lock-in
//                   </Label>
//                   <Label className="text-xs text-gray-500 hidden md:block">Lock-in</Label>
//                   <p className="text-xs md:text-base text-gray-900">{tenant.lockin_period_months}m</p>
//                 </div>
//               )}
//               {tenant.notice_period_days && (
//                 <div className="bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
//                   <Label className="text-[10px] text-gray-500 flex items-center gap-1 mb-1 md:hidden">
//                     <Calendar className="h-3 w-3" /> Notice
//                   </Label>
//                   <Label className="text-xs text-gray-500 hidden md:block">Notice</Label>
//                   <p className="text-xs md:text-base text-gray-900">{tenant.notice_period_days}d</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         <Alert className="mt-4 md:mt-6">
//           <IconInfo className="h-4 w-4" />
//           <AlertDescription className="text-xs md:text-sm">
//             To update your information, visit <strong>Profile</strong> or contact manager.
//           </AlertDescription>
//         </Alert>
//       </CardContent>
//     </Card>
//   );
// }
// components/tenant/profile/AccountInformation.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Info as IconInfo, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  MapPin,
  Shield,
  Heart,
  Clock,
  AlertCircle,
  XCircle,
  Home
} from "lucide-react";
import type { TenantProfile } from "@/lib/tenantDetailsApi";
import { useEffect } from "react";

interface AccountInformationProps {
  tenant: TenantProfile | null;
}

// Info Card Component for consistent styling
const InfoCard = ({ icon: Icon, label, value, color = "blue" }: { 
  icon: any; 
  label: string; 
  value: string | number;
  color?: "blue" | "gold" | "rose";
}) => {
  const getColorClasses = () => {
    switch(color) {
      case 'blue': return 'bg-[#e6f0ff] text-[#004aad]';
      case 'gold': return 'bg-[#fff9e6] text-[#ffc107]';
      case 'rose': return 'bg-rose-50 text-rose-600';
      default: return 'bg-[#e6f0ff] text-[#004aad]';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${getColorClasses()}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-sm font-semibold text-slate-800 break-words">{value || '—'}</p>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <Badge className={`${
      isActive 
        ? 'bg-green-50 text-green-600 border-green-200' 
        : 'bg-rose-50 text-rose-600 border-rose-200'
    } border text-xs px-3 py-1`}>
      {isActive ? (
        <>
          <Shield className="h-3 w-3 mr-1" />
          Active Account
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3 mr-1" />
          Inactive Account
        </>
      )}
    </Badge>
  );
};

// Deletion Request Badge
const DeletionRequestBadge = ({ status }: { status?: string }) => {
  if (!status || status === 'none') return null;

  const config = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Clock, label: 'Deletion Pending' },
    approved: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', icon: Shield, label: 'Deletion Approved' },
    rejected: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: XCircle, label: 'Deletion Rejected' },
    cancelled: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: XCircle, label: 'Deletion Cancelled' }
  };

  const configKey = status as keyof typeof config;
  const { bg, text, border, icon: Icon, label } = config[configKey] || config.pending;

  return (
    <Badge className={`${bg} ${text} ${border} border text-xs px-3 py-1`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};

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

  // Calculate age
  const calculateAge = (dob?: string): number | null => {
    if (!dob) return null;
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  const age = calculateAge(tenant?.date_of_birth);

  // Get account creation date
  const getAccountCreatedDate = (): string => {
    if (tenant?.created_at) return formatDate(tenant.created_at);
    if (tenant?.check_in_date) return formatDate(tenant.check_in_date);
    return "N/A";
  };

  // If tenant is null, show loading state
  if (!tenant) {
    return (
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="p-4 bg-[#e6f0ff] rounded-2xl mb-4">
              <div className="h-8 w-8 border-4 border-[#004aad] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-slate-600">Loading account information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDeletionRequest = tenant.deletion_request && tenant.deletion_request.status !== 'none';

  return (
    <div className="space-y-5">
      
      {/* Header with Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
          <p className="text-xs text-slate-400 mt-0.5">Your basic personal details</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge isActive={tenant.is_active} />
          {hasDeletionRequest && (
            <DeletionRequestBadge status={tenant.deletion_request?.status} />
          )}
        </div>
      </div>

      {/* Basic Personal Details - Single Card */}
     <Card className="border border-slate-200 shadow-sm overflow-hidden">
  <CardHeader className="pb-2 px-5 pt-4 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-[#004aad] rounded-lg">
        <User className="h-3.5 w-3.5 text-white" />
      </div>
      <CardTitle className="text-sm font-semibold text-slate-800">Basic Details</CardTitle>
    </div>
  </CardHeader>
  <CardContent className="p-5">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Full Name */}
      <InfoCard 
        icon={User} 
        label="Full Name" 
        value={tenant.full_name || "—"} 
        color="blue"
      />
      
      {/* Email */}
      <InfoCard 
        icon={Mail} 
        label="Email Address" 
        value={tenant.email || "—"} 
        color="gold"
      />
      
      {/* Phone */}
      <InfoCard 
        icon={Phone} 
        label="Phone Number" 
        value={tenant.country_code ? `${tenant.country_code} ${tenant.phone}` : tenant.phone || "—"} 
        color="blue"
      />
      
      {/* Gender */}
      <InfoCard 
        icon={Heart} 
        label="Gender" 
        value={tenant.gender || "—"} 
        color="gold"
      />
      
      {/* Date of Birth */}
      <InfoCard 
        icon={Calendar} 
        label="Date of Birth" 
        value={formatDate(tenant.date_of_birth)} 
        color="blue"
      />
      
      {/* Address - Full width on all screens */}
      {(tenant.address || tenant.city || tenant.state || tenant.pincode) && (
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-2">
          <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-100">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[#004aad] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Address</p>
                <p className="text-sm text-slate-700">{tenant.address || "—"}</p>
                {(tenant.city || tenant.state || tenant.pincode) && (
                  <p className="text-xs text-[#004aad] mt-1.5 font-medium">
                    {[tenant.city, tenant.state, tenant.pincode].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </CardContent>
</Card>
      

      {/* Emergency Contact Section - Only if exists */}
      {(tenant.emergency_contact_name || tenant.emergency_contact_phone) && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-2 px-5 pt-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5 text-white" />
              </div>
              <CardTitle className="text-sm font-semibold text-slate-800">Emergency Contact</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tenant.emergency_contact_name && (
                <InfoCard 
                  icon={User} 
                  label="Contact Name" 
                  value={tenant.emergency_contact_name} 
                  color="rose"
                />
              )}
              {tenant.emergency_contact_phone && (
                <InfoCard 
                  icon={Phone} 
                  label="Contact Phone" 
                  value={tenant.emergency_contact_phone} 
                  color="rose"
                />
              )}
            </div>
            {tenant.emergency_contact_relation && (
              <div className="mt-3">
                <Badge className="bg-rose-50 text-rose-600 border-rose-200 text-xs px-3 py-1">
                  {tenant.emergency_contact_relation}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Account Created Date */}
      <Card className="bg-gradient-to-br from-slate-50 to-white border border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#004aad]" />
              <span className="text-xs font-medium text-slate-600">Account Created</span>
            </div>
            <span className="text-sm font-semibold text-slate-800">{getAccountCreatedDate()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert className="bg-[#e6f0ff] border-[#004aad]/20">
        <IconInfo className="h-4 w-4 text-[#004aad]" />
        <AlertDescription className="text-xs text-[#004aad]">
          To update your personal information, visit the <span className="font-semibold">Profile</span> tab and click "Edit Profile".
        </AlertDescription>
      </Alert>
    </div>
  );
}