

// // components/tenant/profile/PersonalInfoTab.tsx
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Separator } from '@/components/ui/separator';
// import { format, parseISO } from 'date-fns';
// import { TenantProfile, TenantFormData } from '@/lib/tenantDetailsApi';

// interface PersonalInfoTabProps {
//   profile: TenantProfile;
//   editing: boolean;
//   formData: TenantFormData;
//   errors: Record<string, string>;
//   loading: boolean;
//   age: number | null;
//   isMobile?: boolean;
//   onFieldChange: (field: keyof TenantFormData, value: string) => void;
// }

// export default function PersonalInfoTab({
//   profile,
//   editing,
//   formData,
//   errors,
//   loading,
//   age,
//   isMobile = false,
//   onFieldChange
// }: PersonalInfoTabProps) {
//   return (
//     <Card>
//       <CardHeader className={isMobile ? 'px-4 py-3' : ''}>
//         <CardTitle className={isMobile ? 'text-base' : ''}>Personal Information</CardTitle>
//         <CardDescription className={isMobile ? 'text-xs' : ''}>Your basic personal details</CardDescription>
//       </CardHeader>
//       <CardContent className={isMobile ? 'px-4 py-3 space-y-4' : 'space-y-6'}>
//         {/* Basic Information */}
//         <div className="space-y-3">
//           <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Basic Information</h3>
//           <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Full Name</Label>
//               <p className={`mt-1 text-gray-700 font-medium ${isMobile ? 'text-sm' : ''}`}>{profile.full_name}</p>
//               <p className={`text-xs text-gray-500 mt-1`}>Name cannot be changed</p>
//             </div>

//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Email Address</Label>
//               <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.email}</p>
//               <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
//             </div>

//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Phone Number</Label>
//               <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.country_code} {profile.phone}</p>
//               <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
//             </div>

//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Gender</Label>
//               {editing ? (
//                 <Select
//                   value={formData.gender}
//                   onValueChange={(value) => onFieldChange('gender', value)}
//                   disabled={loading}
//                 >
//                   <SelectTrigger className={isMobile ? 'h-9 text-sm' : ''}>
//                     <SelectValue placeholder="Select gender" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Male">Male</SelectItem>
//                     <SelectItem value="Female">Female</SelectItem>
//                     <SelectItem value="Other">Other</SelectItem>
//                   </SelectContent>
//                 </Select>
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.gender || "Not specified"}</p>
//               )}
//               {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
//             </div>

//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Date of Birth</Label>
//               {editing ? (
//                 <>
//                   <Input
//                     type="date"
//                     value={formData.date_of_birth}
//                     onChange={(e) => onFieldChange('date_of_birth', e.target.value)}
//                     disabled={loading}
//                     className={`${errors.date_of_birth ? 'border-red-500' : ''} ${isMobile ? 'h-9 text-sm' : ''}`}
//                   />
//                   {errors.date_of_birth && <p className="text-sm text-red-500 mt-1">{errors.date_of_birth}</p>}
//                 </>
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>
//                   {profile.date_of_birth ? format(parseISO(profile.date_of_birth), "dd MMM yyyy") : "Not provided"}
//                   {age && ` (${age} years)`}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>

//         <Separator className={isMobile ? 'my-3' : ''} />

//         {/* Occupation Information */}
//         <div className="space-y-3">
//           <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Occupation Information</h3>
//           <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Occupation Category</Label>
//               {editing ? (
//                 <Select
//                   value={formData.occupation_category}
//                   onValueChange={(value) => onFieldChange('occupation_category', value)}
//                   disabled={loading}
//                 >
//                   <SelectTrigger className={isMobile ? 'h-9 text-sm' : ''}>
//                     <SelectValue placeholder="Select category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Service">Service</SelectItem>
//                     <SelectItem value="Business">Business</SelectItem>
//                     <SelectItem value="Student">Student</SelectItem>
//                     <SelectItem value="Other">Other</SelectItem>
//                   </SelectContent>
//                 </Select>
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.occupation_category || "Not specified"}</p>
//               )}
//             </div>

//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Occupation</Label>
//               {editing ? (
//                 <Input
//                   value={formData.occupation}
//                   onChange={(e) => onFieldChange('occupation', e.target.value)}
//                   placeholder="Your profession"
//                   disabled={loading}
//                   className={`${errors.occupation ? 'border-red-500' : ''} ${isMobile ? 'h-9 text-sm' : ''}`}
//                 />
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.occupation || "Not specified"}</p>
//               )}
//               {errors.occupation && <p className="text-sm text-red-500 mt-1">{errors.occupation}</p>}
//             </div>

//             <div className={isMobile ? '' : 'md:col-span-2'}>
//               <Label className={isMobile ? 'text-xs' : ''}>Exact Occupation Details</Label>
//               {editing ? (
//                 <Textarea
//                   value={formData.exact_occupation}
//                   onChange={(e) => onFieldChange('exact_occupation', e.target.value)}
//                   placeholder="Specific job title/role, company name, etc."
//                   rows={isMobile ? 2 : 2}
//                   disabled={loading}
//                   className={`${errors.exact_occupation ? 'border-red-500' : ''} ${isMobile ? 'text-sm' : ''}`}
//                 />
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.exact_occupation || "Not specified"}</p>
//               )}
//               {errors.exact_occupation && <p className="text-sm text-red-500 mt-1">{errors.exact_occupation}</p>}
//             </div>
//           </div>
//         </div>

//         <Separator className={isMobile ? 'my-3' : ''} />

//         {/* Emergency Contact Information */}
//         <div className="space-y-3">
//           <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Emergency Contact Information</h3>
//           <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-3 gap-4'}`}>
//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Contact Name</Label>
//               {editing ? (
//                 <Input
//                   value={formData.emergency_contact_name || ""}
//                   onChange={(e) => onFieldChange('emergency_contact_name', e.target.value)}
//                   placeholder="Emergency contact name"
//                   disabled={loading}
//                   className={isMobile ? 'h-9 text-sm' : ''}
//                 />
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.emergency_contact_name || "Not provided"}</p>
//               )}
//             </div>

//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Contact Phone</Label>
//               {editing ? (
//                 <Input
//                   value={formData.emergency_contact_phone || ""}
//                   onChange={(e) => onFieldChange('emergency_contact_phone', e.target.value)}
//                   placeholder="Emergency contact phone"
//                   disabled={loading}
//                   className={isMobile ? 'h-9 text-sm' : ''}
//                 />
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.emergency_contact_phone || "Not provided"}</p>
//               )}
//             </div>

//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Relationship</Label>
//               {editing ? (
//                 <Select
//                   value={formData.emergency_contact_relation || ""}
//                   onValueChange={(value) => onFieldChange('emergency_contact_relation', value)}
//                   disabled={loading}
//                 >
//                   <SelectTrigger className={isMobile ? 'h-9 text-sm' : ''}>
//                     <SelectValue placeholder="Select relationship" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Father">Father</SelectItem>
//                     <SelectItem value="Mother">Mother</SelectItem>
//                     <SelectItem value="Brother">Brother</SelectItem>
//                     <SelectItem value="Sister">Sister</SelectItem>
//                     <SelectItem value="Spouse">Spouse</SelectItem>
//                     <SelectItem value="Friend">Friend</SelectItem>
//                     <SelectItem value="Relative">Relative</SelectItem>
//                     <SelectItem value="Guardian">Guardian</SelectItem>
//                     <SelectItem value="Other">Other</SelectItem>
//                   </SelectContent>
//                 </Select>
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.emergency_contact_relation || "Not specified"}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <Separator className={isMobile ? 'my-3' : ''} />

//         {/* Address Section */}
//         <div className="space-y-3">
//           <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Permanent Address</h3>
//           <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
//             <div className={isMobile ? '' : 'md:col-span-2'}>
//               <Label className={isMobile ? 'text-xs' : ''}>Complete Address</Label>
//               {editing ? (
//                 <Textarea
//                   rows={isMobile ? 2 : 3}
//                   value={formData.address}
//                   onChange={(e) => onFieldChange('address', e.target.value)}
//                   placeholder="Enter your complete address"
//                   disabled={loading}
//                   className={`${errors.address ? 'border-red-500' : ''} ${isMobile ? 'text-sm' : ''}`}
//                 />
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.address || "Not provided"}</p>
//               )}
//               {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
//             </div>
//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>City</Label>
//               {editing ? (
//                 <Input
//                   value={formData.city}
//                   onChange={(e) => onFieldChange('city', e.target.value)}
//                   disabled={loading}
//                   className={`${errors.city ? 'border-red-500' : ''} ${isMobile ? 'h-9 text-sm' : ''}`}
//                 />
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.city || "Not provided"}</p>
//               )}
//               {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
//             </div>
//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>State</Label>
//               {editing ? (
//                 <Input
//                   value={formData.state}
//                   onChange={(e) => onFieldChange('state', e.target.value)}
//                   disabled={loading}
//                   className={`${errors.state ? 'border-red-500' : ''} ${isMobile ? 'h-9 text-sm' : ''}`}
//                 />
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.state || "Not provided"}</p>
//               )}
//               {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
//             </div>
//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Pincode</Label>
//               {editing ? (
//                 <Input
//                   value={formData.pincode}
//                   onChange={(e) => onFieldChange('pincode', e.target.value)}
//                   disabled={loading}
//                   className={`${errors.pincode ? 'border-red-500' : ''} ${isMobile ? 'h-9 text-sm' : ''}`}
//                 />
//               ) : (
//                 <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.pincode || "Not provided"}</p>
//               )}
//               {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>}
//             </div>
//           </div>
//         </div>

//         <Separator className={isMobile ? 'my-3' : ''} />

//         {/* Preferences Section */}
//         <div className="space-y-3">
//           <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Accommodation Preferences</h3>
//           <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Preferred Sharing Type</Label>
//               <p className={`mt-1 text-gray-700 capitalize ${isMobile ? 'text-sm' : ''}`}>{profile.preferred_sharing || "Not specified"}</p>
//               <p className="text-xs text-gray-500 mt-1">Preferred sharing cannot be changed</p>
//             </div>
//             <div>
//               <Label className={isMobile ? 'text-xs' : ''}>Preferred Room Type</Label>
//               <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.preferred_room_type || "Not specified"}</p>
//               <p className="text-xs text-gray-500 mt-1">Preferred room type cannot be changed</p>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }



// components/tenant/profile/PersonalInfoTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  User, Mail, Phone, Calendar, Briefcase,
  AlertCircle, MapPin, Building, Users
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile, TenantFormData } from '@/lib/tenantDetailsApi';

interface PersonalInfoTabProps {
  profile: TenantProfile;
  editing: boolean;
  formData: TenantFormData;
  errors: Record<string, string>;
  loading: boolean;
  age: number | null;
  isMobile?: boolean;
  onFieldChange: (field: keyof TenantFormData, value: string) => void;
}

// Reusable read-only row (desktop)
const InfoRow = ({
  label, value, last = false
}: { label: string; value: string; last?: boolean }) => (
  <div className={`flex justify-between py-2.5 ${!last ? 'border-b border-slate-100' : ''}`}>
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-900 text-right max-w-[60%]">{value || '—'}</span>
  </div>
);

export default function PersonalInfoTab({
  profile,
  editing,
  formData,
  errors,
  loading,
  age,
  isMobile = false,
  onFieldChange,
}: PersonalInfoTabProps) {

  const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
  const OCC_OPTIONS = ['Service', 'Business', 'Student', 'Other'];
  const REL_OPTIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Friend', 'Relative', 'Guardian', 'Other'];

  // ── MOBILE VIEW ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="space-y-3">

        {/* Basic Information */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Basic Information</span>
          </div>
          <div className="p-3 space-y-2.5">

            {/* Full Name — locked */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Full Name</p>
              <p className="text-sm font-medium text-slate-800">{profile.full_name}</p>
              <p className="text-[9px] text-slate-400">Cannot be changed</p>
            </div>

            {/* Email — locked */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-xs text-slate-700 truncate">{profile.email}</p>
              <p className="text-[9px] text-slate-400">Cannot be changed</p>
            </div>

            {/* Phone — locked */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Phone</p>
              <p className="text-xs font-medium text-slate-800">{profile.country_code} {profile.phone}</p>
              <p className="text-[9px] text-slate-400">Cannot be changed</p>
            </div>

            {/* Gender + DOB side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Gender</p>
                {editing ? (
                  <Select value={formData.gender} onValueChange={v => onFieldChange('gender', v)} disabled={loading}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{GENDER_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs font-medium text-slate-800">{profile.gender || '—'}</p>
                )}
                {errors.gender && <p className="text-[10px] text-red-500 mt-0.5">{errors.gender}</p>}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
                {editing ? (
                  <Input type="date" value={formData.date_of_birth} onChange={e => onFieldChange('date_of_birth', e.target.value)} disabled={loading} className={`h-8 text-xs ${errors.date_of_birth ? 'border-red-500' : ''}`} />
                ) : (
                  <p className="text-xs font-medium text-slate-800">
                    {profile.date_of_birth ? format(parseISO(profile.date_of_birth), 'dd MMM yyyy') : '—'}
                    {age && <span className="text-slate-400 ml-1">({age}y)</span>}
                  </p>
                )}
                {errors.date_of_birth && <p className="text-[10px] text-red-500 mt-0.5">{errors.date_of_birth}</p>}
              </div>
            </div>

          </div>
        </div>

        {/* Occupation */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Occupation</span>
          </div>
          <div className="p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Category</p>
                {editing ? (
                  <Select value={formData.occupation_category} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{OCC_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs font-medium text-slate-800">{profile.occupation_category || '—'}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Occupation</p>
                {editing ? (
                  <Input value={formData.occupation} onChange={e => onFieldChange('occupation', e.target.value)} disabled={loading} className={`h-8 text-xs ${errors.occupation ? 'border-red-500' : ''}`} placeholder="Profession" />
                ) : (
                  <p className="text-xs font-medium text-slate-800">{profile.occupation || '—'}</p>
                )}
                {errors.occupation && <p className="text-[10px] text-red-500 mt-0.5">{errors.occupation}</p>}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Details</p>
              {editing ? (
                <Textarea value={formData.exact_occupation} onChange={e => onFieldChange('exact_occupation', e.target.value)} disabled={loading} rows={2} className="text-xs" placeholder="Job title, company..." />
              ) : (
                <p className="text-xs text-slate-700">{profile.exact_occupation || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Emergency Contact</span>
          </div>
          <div className="p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Name</p>
                {editing ? (
                  <Input value={formData.emergency_contact_name || ''} onChange={e => onFieldChange('emergency_contact_name', e.target.value)} disabled={loading} className="h-8 text-xs" placeholder="Contact name" />
                ) : (
                  <p className="text-xs font-medium text-slate-800">{profile.emergency_contact_name || '—'}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                {editing ? (
                  <Input value={formData.emergency_contact_phone || ''} onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} disabled={loading} className="h-8 text-xs" placeholder="Contact phone" />
                ) : (
                  <p className="text-xs font-medium text-slate-800">{profile.emergency_contact_phone || '—'}</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Relationship</p>
              {editing ? (
                <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{REL_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <p className="text-xs font-medium text-slate-800">{profile.emergency_contact_relation || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Permanent Address */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Permanent Address</span>
          </div>
          <div className="p-3 space-y-2.5">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Address</p>
              {editing ? (
                <Textarea value={formData.address} onChange={e => onFieldChange('address', e.target.value)} disabled={loading} rows={2} className={`text-xs ${errors.address ? 'border-red-500' : ''}`} placeholder="Complete address" />
              ) : (
                <p className="text-xs text-slate-700">{profile.address || '—'}</p>
              )}
              {errors.address && <p className="text-[10px] text-red-500 mt-0.5">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['city', 'state', 'pincode'] as const).map(f => (
                <div key={f}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 capitalize">{f}</p>
                  {editing ? (
                    <Input value={formData[f] as string} onChange={e => onFieldChange(f, e.target.value)} disabled={loading} className={`h-8 text-xs ${errors[f] ? 'border-red-500' : ''}`} />
                  ) : (
                    <p className="text-xs font-medium text-slate-800">{(profile as any)[f] || '—'}</p>
                  )}
                  {errors[f] && <p className="text-[10px] text-red-500 mt-0.5">{errors[f]}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <Building className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Accommodation Preferences</span>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Sharing Type</p>
                <p className="text-xs font-medium text-slate-800 capitalize">{profile.preferred_sharing || '—'}</p>
                <p className="text-[9px] text-slate-400">Cannot be changed</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Room Type</p>
                <p className="text-xs font-medium text-slate-800">{profile.preferred_room_type || '—'}</p>
                <p className="text-[9px] text-slate-400">Cannot be changed</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // ── DESKTOP VIEW — minimal, matches portal page right-column card style ────
  return (
    <div className="space-y-4">

      {/* Basic Information */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          {/* Read-only locked fields */}
          <InfoRow label="Full Name" value={profile.full_name} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Phone" value={`${profile.country_code || ''} ${profile.phone || ''}`} />

          {/* Editable fields */}
          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Gender</span>
            {editing ? (
              <div className="w-48">
                <Select value={formData.gender} onValueChange={v => onFieldChange('gender', v)} disabled={loading}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>{GENDER_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
                {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900">{profile.gender || '—'}</span>
            )}
          </div>

          <div className={`flex justify-between py-2.5 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Date of Birth</span>
            {editing ? (
              <div className="w-48">
                <Input type="date" value={formData.date_of_birth} onChange={e => onFieldChange('date_of_birth', e.target.value)} disabled={loading} className={`h-9 text-sm ${errors.date_of_birth ? 'border-red-500' : ''}`} />
                {errors.date_of_birth && <p className="text-xs text-red-500 mt-1">{errors.date_of_birth}</p>}
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900">
                {profile.date_of_birth ? format(parseISO(profile.date_of_birth), 'dd MMM yyyy') : '—'}
                {age && <span className="text-slate-400 ml-1.5 text-xs">({age} years)</span>}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Occupation */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-400" />
            Occupation Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Category</span>
            {editing ? (
              <div className="w-48">
                <Select value={formData.occupation_category} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{OCC_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900">{profile.occupation_category || '—'}</span>
            )}
          </div>

          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Occupation</span>
            {editing ? (
              <div className="w-48">
                <Input value={formData.occupation} onChange={e => onFieldChange('occupation', e.target.value)} disabled={loading} placeholder="Your profession" className={`h-9 text-sm ${errors.occupation ? 'border-red-500' : ''}`} />
                {errors.occupation && <p className="text-xs text-red-500 mt-1">{errors.occupation}</p>}
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900">{profile.occupation || '—'}</span>
            )}
          </div>

          <div className={`flex justify-between py-2.5 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Exact Details</span>
            {editing ? (
              <div className="w-64">
                <Textarea value={formData.exact_occupation} onChange={e => onFieldChange('exact_occupation', e.target.value)} disabled={loading} rows={2} placeholder="Job title, company..." className="text-sm" />
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900 text-right max-w-[60%]">{profile.exact_occupation || '—'}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-slate-400" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Name</span>
            {editing ? (
              <Input value={formData.emergency_contact_name || ''} onChange={e => onFieldChange('emergency_contact_name', e.target.value)} disabled={loading} placeholder="Contact name" className="w-48 h-9 text-sm" />
            ) : (
              <span className="text-sm font-medium text-slate-900">{profile.emergency_contact_name || '—'}</span>
            )}
          </div>
          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Phone</span>
            {editing ? (
              <Input value={formData.emergency_contact_phone || ''} onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} disabled={loading} placeholder="Contact phone" className="w-48 h-9 text-sm" />
            ) : (
              <span className="text-sm font-medium text-slate-900">{profile.emergency_contact_phone || '—'}</span>
            )}
          </div>
          <div className={`flex justify-between py-2.5 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Relationship</span>
            {editing ? (
              <div className="w-48">
                <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{REL_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900">{profile.emergency_contact_relation || '—'}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            Permanent Address
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Address</span>
            {editing ? (
              <div className="w-64">
                <Textarea value={formData.address} onChange={e => onFieldChange('address', e.target.value)} disabled={loading} rows={2} placeholder="Complete address" className={`text-sm ${errors.address ? 'border-red-500' : ''}`} />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900 text-right max-w-[60%]">{profile.address || '—'}</span>
            )}
          </div>
          {(['city', 'state', 'pincode'] as const).map((f, i, arr) => (
            <div key={f} className={`flex justify-between py-2.5 ${i < arr.length - 1 ? 'border-b border-slate-100' : ''} ${editing ? 'items-start' : 'items-center'}`}>
              <span className="text-sm text-slate-500 capitalize">{f}</span>
              {editing ? (
                <div className="w-48">
                  <Input value={formData[f] as string} onChange={e => onFieldChange(f, e.target.value)} disabled={loading} className={`h-9 text-sm ${errors[f] ? 'border-red-500' : ''}`} />
                  {errors[f] && <p className="text-xs text-red-500 mt-1">{errors[f]}</p>}
                </div>
              ) : (
                <span className="text-sm font-medium text-slate-900">{(profile as any)[f] || '—'}</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building className="h-4 w-4 text-slate-400" />
            Accommodation Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <InfoRow label="Sharing Type" value={profile.preferred_sharing || '—'} />
          <InfoRow label="Room Type" value={profile.preferred_room_type || '—'} last />
        </CardContent>
      </Card>

    </div>
  );
}