// // components/tenant/profile/AccommodationTab.tsx
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Label } from '@/components/ui/label';
// import { 
//   Building, Home, Bed, Users, Briefcase, 
//   BadgeIndianRupee, User, Phone, MapPin, Calendar, 
//   Mail, CheckCircle, XCircle
// } from 'lucide-react';
// import { format, parseISO } from 'date-fns';
// import { TenantProfile } from '@/lib/tenantDetailsApi';

// interface AccommodationTabProps {
//   profile: TenantProfile;
//   isMobile?: boolean;
// }

// export default function AccommodationTab({ profile, isMobile = false }: AccommodationTabProps) {
//   console.log('🏠 RAW PROFILE DATA:', JSON.stringify(profile, null, 2));

//   // Check if tenant has a room assignment
//   const hasAccommodation = profile.room_id !== null && profile.room_id !== undefined;
//   const hasProperty = profile.property_id !== null && profile.property_id !== undefined;
//   const isActive = profile.is_active === 1 || profile.is_active === true || profile.is_active === '1';

//   // Helper function to safely format date
//   const formatDate = (dateString?: string | null) => {
//     if (!dateString) return 'N/A';
//     try {
//       return format(parseISO(dateString), 'dd MMM yyyy');
//     } catch {
//       return 'Invalid Date';
//     }
//   };

//   if (!hasAccommodation) {
//     return (
//       <Card>
//         <CardContent className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
//           <div className="flex justify-center mb-4">
//             <div className="p-3 bg-amber-100 rounded-full">
//               <Home className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-amber-600`} />
//             </div>
//           </div>
//           <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>
//             No Room Assignment Yet
//           </h3>
//           <p className="text-gray-500 mb-6 max-w-md mx-auto">
//             Your accommodation is being processed. Once assigned, your room and bed details will appear here.
//           </p>
          
//           {hasProperty && (
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
//               <div className="flex items-center gap-2 text-blue-700 mb-2">
//                 <Building className="h-4 w-4" />
//                 <span className="font-medium">Property Information</span>
//               </div>
//               <p className="text-sm text-blue-800">
//                 You are registered at: <span className="font-semibold">{profile.property_name || `Property #${profile.property_id}`}</span>
//               </p>
//               {profile.property_manager_name && (
//                 <p className="text-xs text-blue-600 mt-2">
//                   Manager: {profile.property_manager_name} {profile.property_manager_phone && `- ${profile.property_manager_phone}`}
//                 </p>
//               )}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <>
//       {/* Status Card */}
//       <Card className="mb-4 border-l-4 border-l-green-500">
//         <CardContent className="py-3 px-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
            
// {isActive ? (
//   <>
//     <CheckCircle className="h-5 w-5 text-green-500" />
//     <span className="font-medium text-green-700">Active Account</span>
//   </>
// ) : (
//   <>
//     <XCircle className="h-5 w-5 text-red-500" />
//     <span className="font-medium text-red-700">Inactive Account</span>
//   </>
// )}
//             </div>
//             {profile.check_in_date && (
//               <Badge variant="outline" className="bg-blue-50">
//                 Check-in: {formatDate(profile.check_in_date)}
//               </Badge>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Main Accommodation Card */}
//       <Card>
//         <CardHeader className={isMobile ? 'px-4 py-3' : ''}>
//           <CardTitle className={isMobile ? 'text-base' : ''}>Current Accommodation</CardTitle>
//           <CardDescription className={isMobile ? 'text-xs' : ''}>Your assigned room and bed details</CardDescription>
//         </CardHeader>
//         <CardContent className={isMobile ? 'px-4 py-3' : ''}>
//           <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
//             {/* Property Info */}
//             <div className="space-y-1">
//               <div className="flex items-center gap-2 text-gray-500">
//                 <Building className="h-4 w-4" />
//                 <Label className={isMobile ? 'text-xs' : ''}>Property</Label>
//               </div>
//               <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
//                 {profile.property_name || `Property #${profile.property_id}`}
//               </p>
//               {profile.property_address && (
//                 <p className="text-xs text-gray-500 mt-1">{profile.property_address}</p>
//               )}
//               {profile.property_city && (
//                 <p className="text-xs text-gray-400 mt-1">{profile.property_city}</p>
//               )}
//             </div>

//             {/* Room Info */}
//             <div className="space-y-1">
//               <div className="flex items-center gap-2 text-gray-500">
//                 <Home className="h-4 w-4" />
//                 <Label className={isMobile ? 'text-xs' : ''}>Room Number</Label>
//               </div>
//               <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
//                 {profile.room_number || `Room #${profile.room_id}`}
//               </p>
//               {profile.floor && (
//                 <p className="text-xs text-gray-500 mt-1">Floor: {profile.floor}</p>
//               )}
//             </div>

//             {/* Bed Info */}
//             <div className="space-y-1">
//               <div className="flex items-center gap-2 text-gray-500">
//                 <Bed className="h-4 w-4" />
//                 <Label className={isMobile ? 'text-xs' : ''}>Bed Number</Label>
//               </div>
//               <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
//                 {profile.bed_number || 'N/A'}
//               </p>
//             </div>

//             {/* Room Type */}
//             <div className="space-y-1">
//               <div className="flex items-center gap-2 text-gray-500">
//                 <Briefcase className="h-4 w-4" />
//                 <Label className={isMobile ? 'text-xs' : ''}>Room Type</Label>
//               </div>
//               <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
//                 {profile.room_type || 'Standard'}
//               </p>
//             </div>

//             {/* Monthly Rent */}
//             <div className="space-y-1">
//               <div className="flex items-center gap-2 text-gray-500">
//                 <BadgeIndianRupee className="h-4 w-4" />
//                 <Label className={isMobile ? 'text-xs' : ''}>Monthly Rent</Label>
//               </div>
//               <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-green-600`}>
//                 ₹ {profile.rent_per_bed ? Number(profile.rent_per_bed).toLocaleString("en-IN") : 
//                      profile.monthly_rent ? Number(profile.monthly_rent).toLocaleString("en-IN") : 'N/A'}
//               </p>
//             </div>

//             {/* Sharing Type */}
//             <div className="space-y-1">
//               <div className="flex items-center gap-2 text-gray-500">
//                 <Users className="h-4 w-4" />
//                 <Label className={isMobile ? 'text-xs' : ''}>Sharing</Label>
//               </div>
//               <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
//                 {profile.preferred_sharing || 'Not specified'}
//               </p>
//             </div>
//           </div>

//           {/* Bed Assignment Date */}
//           {profile.bed_assigned_at && (
//             <div className={`mt-4 pt-4 border-t`}>
//               <p className="text-sm text-gray-500">
//                 Bed assigned on: {formatDate(profile.bed_assigned_at)}
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Property Manager Information */}
//       {(profile.property_manager_name || profile.manager_name) && (
//         <Card className="mt-4">
//           <CardHeader className={isMobile ? 'px-4 py-3' : ''}>
//             <CardTitle className={isMobile ? 'text-base' : ''}>Property Management</CardTitle>
//             <CardDescription className={isMobile ? 'text-xs' : ''}>Contact information for property management</CardDescription>
//           </CardHeader>
//           <CardContent className={isMobile ? 'px-4 py-3' : ''}>
//             <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-2 gap-6'}`}>
//               {(profile.property_manager_name || profile.manager_name) && (
//                 <div className="space-y-1">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <User className="h-4 w-4" />
//                     <Label className={isMobile ? 'text-xs' : ''}>Manager Name</Label>
//                   </div>
//                   <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
//                     {profile.property_manager_name || profile.manager_name}
//                   </p>
//                 </div>
//               )}

//               {(profile.property_manager_phone || profile.manager_phone) && (
//                 <div className="space-y-1">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <Phone className="h-4 w-4" />
//                     <Label className={isMobile ? 'text-xs' : ''}>Manager Phone</Label>
//                   </div>
//                   <p className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>
//                     {profile.property_manager_phone || profile.manager_phone}
//                   </p>
//                 </div>
//               )}

//               {profile.property_manager_email && (
//                 <div className="space-y-1 md:col-span-2">
//                   <div className="flex items-center gap-2 text-gray-500">
//                     <Mail className="h-4 w-4" />
//                     <Label className={isMobile ? 'text-xs' : ''}>Manager Email</Label>
//                   </div>
//                   <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>
//                     {profile.property_manager_email}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Property Address */}
//       {profile.property_address && (
//         <Card className="mt-4">
//           <CardHeader className={isMobile ? 'px-4 py-3' : ''}>
//             <CardTitle className={isMobile ? 'text-base' : ''}>Property Location</CardTitle>
//           </CardHeader>
//           <CardContent className={isMobile ? 'px-4 py-3' : ''}>
//             <div className="space-y-2">
//               <div className="flex items-start gap-3">
//                 <MapPin className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400 mt-0.5 flex-shrink-0`} />
//                 <div>
//                   <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>
//                     {profile.property_address}
//                   </p>
//                   {(profile.property_city || profile.property_state) && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       {[profile.property_city, profile.property_state].filter(Boolean).join(', ')}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </>
//   );
// }


// components/tenant/profile/AccommodationTab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Building, Home, Bed, Users, Briefcase,
  BadgeIndianRupee, User, Phone, MapPin, Calendar,
  Mail, CheckCircle, XCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile } from '@/lib/tenantDetailsApi';
import { type StaffMember } from '@/lib/staffApi';

// ─────────────────────────────────────────────────────────────────────────────
// HOW TO GET SALUTATION IN THE PARENT (TenantProfileClientPage.tsx):
//
//  1. import { getAllStaff, type StaffMember } from '@/lib/staffApi'
//
//  2. const [propertyManagerStaff, setPropertyManagerStaff] =
//       useState<StaffMember | null>(null)
//
//  3. Copy this function into the parent (same as page.tsx):
//
//     const fetchPropertyManagerStaff = useCallback(async (tenantData: TenantProfile) => {
//       try {
//         const allStaff = await getAllStaff();
//         if (tenantData.property_manager_name && allStaff.length > 0) {
//           const managerName = tenantData.property_manager_name.toLowerCase().trim();
//           const matched = allStaff.find(s =>
//             s.name.toLowerCase().trim() === managerName ||
//             `${s.salutation} ${s.name}`.toLowerCase().trim() === managerName ||
//             s.name.toLowerCase().includes(managerName) ||
//             managerName.includes(s.name.toLowerCase())
//           );
//           if (matched) { setPropertyManagerStaff(matched); return; }
//         }
//         if (tenantData.property_manager_phone && allStaff.length > 0) {
//           const matched = allStaff.find(s =>
//             s.phone === tenantData.property_manager_phone ||
//             s.whatsapp_number === tenantData.property_manager_phone
//           );
//           if (matched) { setPropertyManagerStaff(matched); }
//         }
//       } catch (err) {
//         console.error('Error fetching staff:', err);
//       }
//     }, []);
//
//  4. Call it after profile loads:
//     fetchPropertyManagerStaff(profileData)
//
//  5. Pass to this component:
//     <AccommodationTab ... propertyManagerStaff={propertyManagerStaff} />
// ─────────────────────────────────────────────────────────────────────────────

interface AccommodationTabProps {
  profile: TenantProfile;
  isMobile?: boolean;
  propertyManagerStaff?: StaffMember | null;
}

export default function AccommodationTab({
  profile,
  isMobile = false,
  propertyManagerStaff = null,
}: AccommodationTabProps) {

  const hasAccommodation = profile.room_id !== null && profile.room_id !== undefined;
  const hasProperty = profile.property_id !== null && profile.property_id !== undefined;
  const isActive = profile.is_active === 1 || profile.is_active === true || profile.is_active === '1';

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), 'dd MMM yyyy'); }
    catch { return 'Invalid Date'; }
  };

  // ── Same helpers as page.tsx ───────────────────────────────────────────────
  const getManagerDisplayName = () => {
    if (propertyManagerStaff) {
      const sal = propertyManagerStaff.salutation ? `${propertyManagerStaff.salutation} ` : '';
      return `${sal}${propertyManagerStaff.name}`;
    }
    return profile.property_manager_name || profile.manager_name || '—';
  };
  const getManagerRole = () => propertyManagerStaff?.role || 'Property Manager';
  const getManagerPhone = () =>
    propertyManagerStaff?.phone || profile.property_manager_phone || profile.manager_phone || '—';
  const getManagerEmail = () =>
    propertyManagerStaff?.email || (profile as any)?.property_manager_email || '—';
  const getManagerPhoto = () => propertyManagerStaff?.photo_url || null;

  const hasManager = !!(profile.property_manager_name || profile.manager_name || propertyManagerStaff);

  // ── No accommodation ───────────────────────────────────────────────────────
  if (!hasAccommodation) {
    return (
      <Card>
        <CardContent className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-slate-100 rounded-full">
              <Home className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-slate-400`} />
            </div>
          </div>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>
            No Room Assignment Yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
            Your accommodation is being processed. Once assigned, your room and bed details will appear here.
          </p>
          {hasProperty && (
            <div className="border border-slate-200 rounded-lg p-4 max-w-md mx-auto text-left">
              <p className="text-xs text-slate-400 mb-1">Registered at</p>
              <p className="text-sm font-medium text-slate-800">
                {profile.property_name || `Property #${profile.property_id}`}
              </p>
              {getManagerPhone() !== '—' && (
                <p className="text-xs text-slate-500 mt-1.5">
                  Manager: {getManagerDisplayName()} · {getManagerPhone()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ── MOBILE VIEW ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="space-y-3">

        {/* Status */}
        {/* <div className={`flex items-center justify-between rounded-lg px-3 py-2 border ${isActive ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center gap-1.5">
            {isActive
              ? <><CheckCircle className="h-3.5 w-3.5 text-green-500" /><span className="text-xs font-medium text-green-700">Active</span></>
              : <><XCircle className="h-3.5 w-3.5 text-red-500" /><span className="text-xs font-medium text-red-700">Inactive</span></>
            }
          </div>
          {profile.check_in_date && (
            <span className="text-[10px] text-slate-400">Check-in: {formatDate(profile.check_in_date)}</span>
          )}
        </div> */}

        {/* Property */}
        <div className="border border-slate-200 rounded-lg p-3 bg-white">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Property</p>
          <div className="flex items-start gap-2">
            <Building className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {profile.property_name || `Property #${profile.property_id}`}
              </p>
              {profile.property_address && (
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{profile.property_address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Room / Bed / Type / Rent — 2×2 grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Room</p>
            <p className="text-xl font-bold text-slate-800">{profile.room_number || `#${profile.room_id}`}</p>
            {profile.floor && <p className="text-[10px] text-slate-400">Floor {profile.floor}</p>}
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Bed</p>
            <p className="text-xl font-bold text-slate-800">{profile.bed_number || 'N/A'}</p>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Room Type</p>
            <p className="text-sm font-medium text-slate-700">{profile.room_type || 'Standard'}</p>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Rent / Month</p>
            <p className="text-sm font-semibold text-slate-800">
              ₹{profile.rent_per_bed
                ? Number(profile.rent_per_bed).toLocaleString('en-IN')
                : profile.monthly_rent
                  ? Number(profile.monthly_rent).toLocaleString('en-IN')
                  : 'N/A'}
            </p>
          </div>
        </div>

        {/* Sharing */}
        {profile.preferred_sharing && (
          <div className="flex items-center gap-2 px-1">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Sharing:</span>
            <Badge variant="outline" className="text-[10px] px-2 py-0">{profile.preferred_sharing}</Badge>
            {profile.bed_assigned_at && (
              <span className="text-[10px] text-slate-400 ml-auto">Since {formatDate(profile.bed_assigned_at)}</span>
            )}
          </div>
        )}

        {/* Property Manager — salutation from staff API */}
        {hasManager && (
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Property Manager</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                {getManagerPhoto()
                  ? <img src={getManagerPhoto()!} alt="" className="h-8 w-8 rounded-full object-cover" />
                  : <User className="h-4 w-4 text-slate-400" />
                }
              </div>
              <div>
                {/* salutation + name from staffApi */}
                <p className="text-xs font-semibold text-slate-800">{getManagerDisplayName()}</p>
                <p className="text-[10px] text-slate-400">{getManagerRole()}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {getManagerPhone() !== '—' && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-600">{getManagerPhone()}</span>
                </div>
              )}
              {getManagerEmail() !== '—' && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-600 truncate">{getManagerEmail()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {profile.property_address && (
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Location</p>
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-700">{profile.property_address}</p>
                {(profile.property_city || profile.property_state) && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {[profile.property_city, profile.property_state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ── DESKTOP VIEW (original preserved, manager section updated with salutation) ──
  return (
    <>
      {/* Status Card */}
      <Card className="mb-4 border-l-4 border-l-green-500">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isActive ? (
                <><CheckCircle className="h-5 w-5 text-green-500" /><span className="font-medium text-green-700">Active Account</span></>
              ) : (
                <><XCircle className="h-5 w-5 text-red-500" /><span className="font-medium text-red-700">Inactive Account</span></>
              )}
            </div>
            {profile.check_in_date && (
              <Badge variant="outline" className="bg-blue-50">
                Check-in: {formatDate(profile.check_in_date)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Accommodation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Accommodation</CardTitle>
          <CardDescription>Your assigned room and bed details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <Building className="h-4 w-4" />
                <Label>Property</Label>
              </div>
              <p className="text-lg font-semibold">
                {profile.property_name || `Property #${profile.property_id}`}
              </p>
              {profile.property_address && (
                <p className="text-xs text-gray-500 mt-1">{profile.property_address}</p>
              )}
              {profile.property_city && (
                <p className="text-xs text-gray-400 mt-1">{profile.property_city}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <Home className="h-4 w-4" />
                <Label>Room Number</Label>
              </div>
              <p className="text-lg font-semibold">
                {profile.room_number || `Room #${profile.room_id}`}
              </p>
              {profile.floor && (
                <p className="text-xs text-gray-500 mt-1">Floor: {profile.floor}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <Bed className="h-4 w-4" />
                <Label>Bed Number</Label>
              </div>
              <p className="text-lg font-semibold">{profile.bed_number || 'N/A'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <Briefcase className="h-4 w-4" />
                <Label>Room Type</Label>
              </div>
              <p className="text-lg font-semibold">{profile.room_type || 'Standard'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <BadgeIndianRupee className="h-4 w-4" />
                <Label>Monthly Rent</Label>
              </div>
              <p className="text-lg font-semibold text-green-600">
                ₹ {profile.rent_per_bed
                  ? Number(profile.rent_per_bed).toLocaleString('en-IN')
                  : profile.monthly_rent
                    ? Number(profile.monthly_rent).toLocaleString('en-IN')
                    : 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="h-4 w-4" />
                <Label>Sharing</Label>
              </div>
              <p className="text-lg font-semibold">{profile.preferred_sharing || 'Not specified'}</p>
            </div>
          </div>

          {profile.bed_assigned_at && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Bed assigned on: {formatDate(profile.bed_assigned_at)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Manager — salutation from staffApi */}
      {hasManager && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Property Management</CardTitle>
            <CardDescription>Contact information for property management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="h-4 w-4" />
                  <Label>Manager Name</Label>
                </div>
                {/* salutation prepended from staffApi */}
                <p className="text-lg font-semibold">{getManagerDisplayName()}</p>
                <p className="text-xs text-gray-400">{getManagerRole()}</p>
              </div>

              {getManagerPhone() !== '—' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="h-4 w-4" />
                    <Label>Manager Phone</Label>
                  </div>
                  <p className="text-lg font-semibold">{getManagerPhone()}</p>
                </div>
              )}

              {getManagerEmail() !== '—' && (
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail className="h-4 w-4" />
                    <Label>Manager Email</Label>
                  </div>
                  <p className="text-base">{getManagerEmail()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Address */}
      {profile.property_address && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Property Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-base">{profile.property_address}</p>
                  {(profile.property_city || profile.property_state) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {[profile.property_city, profile.property_state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}