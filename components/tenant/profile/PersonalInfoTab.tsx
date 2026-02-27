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
//   onFieldChange: (field: keyof TenantFormData, value: string) => void;
// }

// export default function PersonalInfoTab({
//   profile,
//   editing,
//   formData,
//   errors,
//   loading,
//   age,
//   onFieldChange
// }: PersonalInfoTabProps) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Personal Information</CardTitle>
//         <CardDescription>Your basic personal details</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* Basic Information */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Basic Information</h3>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <Label>Full Name</Label>
//               <p className="mt-2 text-gray-700 font-medium">{profile.full_name}</p>
//               <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
//             </div>

//             <div>
//               <Label>Email Address</Label>
//               <p className="mt-2 text-gray-700">{profile.email}</p>
//               <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
//             </div>

//             <div>
//               <Label>Phone Number</Label>
//               <p className="mt-2 text-gray-700">{profile.country_code} {profile.phone}</p>
//               <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
//             </div>

//             <div>
//               <Label>Gender</Label>
//               {editing ? (
//                 <Select
//                   value={formData.gender}
//                   onValueChange={(value) => onFieldChange('gender', value)}
//                   disabled={loading}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select gender" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Male">Male</SelectItem>
//                     <SelectItem value="Female">Female</SelectItem>
//                     <SelectItem value="Other">Other</SelectItem>
//                   </SelectContent>
//                 </Select>
//               ) : (
//                 <p className="mt-2 text-gray-700">{profile.gender || "Not specified"}</p>
//               )}
//               {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
//             </div>

//             <div>
//               <Label>Date of Birth</Label>
//               {editing ? (
//                 <>
//                   <Input
//                     type="date"
//                     value={formData.date_of_birth}
//                     onChange={(e) => onFieldChange('date_of_birth', e.target.value)}
//                     disabled={loading}
//                     className={errors.date_of_birth ? 'border-red-500' : ''}
//                   />
//                   {errors.date_of_birth && <p className="text-sm text-red-500 mt-1">{errors.date_of_birth}</p>}
//                 </>
//               ) : (
//                 <p className="mt-2 text-gray-700">
//                   {profile.date_of_birth ? format(parseISO(profile.date_of_birth), "dd MMM yyyy") : "Not provided"}
//                   {age && ` (${age} years)`}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>

//         <Separator />

//         {/* Occupation Information */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Occupation Information</h3>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <Label>Occupation Category</Label>
//               {editing ? (
//                 <Select
//                   value={formData.occupation_category}
//                   onValueChange={(value) => onFieldChange('occupation_category', value)}
//                   disabled={loading}
//                 >
//                   <SelectTrigger>
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
//                 <p className="mt-2 text-gray-700">{profile.occupation_category || "Not specified"}</p>
//               )}
//             </div>

//             <div>
//               <Label>Occupation</Label>
//               {editing ? (
//                 <Input
//                   value={formData.occupation}
//                   onChange={(e) => onFieldChange('occupation', e.target.value)}
//                   placeholder="Your profession"
//                   disabled={loading}
//                   className={errors.occupation ? 'border-red-500' : ''}
//                 />
//               ) : (
//                 <p className="mt-2 text-gray-700">{profile.occupation || "Not specified"}</p>
//               )}
//               {errors.occupation && <p className="text-sm text-red-500 mt-1">{errors.occupation}</p>}
//             </div>

//             <div className="md:col-span-2">
//               <Label>Exact Occupation Details</Label>
//               {editing ? (
//                 <Textarea
//                   value={formData.exact_occupation}
//                   onChange={(e) => onFieldChange('exact_occupation', e.target.value)}
//                   placeholder="Specific job title/role, company name, etc."
//                   rows={2}
//                   disabled={loading}
//                   className={errors.exact_occupation ? 'border-red-500' : ''}
//                 />
//               ) : (
//                 <p className="mt-2 text-gray-700">{profile.exact_occupation || "Not specified"}</p>
//               )}
//               {errors.exact_occupation && <p className="text-sm text-red-500 mt-1">{errors.exact_occupation}</p>}
//             </div>
//           </div>
//         </div>

//         <Separator />

//         {/* Emergency Contact Information */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Emergency Contact Information</h3>
//           <div className="grid md:grid-cols-3 gap-4">
//             <div>
//               <Label>Contact Name</Label>
//               {editing ? (
//                 <Input
//                   value={formData.emergency_contact_name || ""}
//                   onChange={(e) => onFieldChange('emergency_contact_name', e.target.value)}
//                   placeholder="Emergency contact name"
//                   disabled={loading}
//                 />
//               ) : (
//                 <p className="mt-2 text-gray-700">{profile.emergency_contact_name || "Not provided"}</p>
//               )}
//             </div>

//             <div>
//               <Label>Contact Phone</Label>
//               {editing ? (
//                 <Input
//                   value={formData.emergency_contact_phone || ""}
//                   onChange={(e) => onFieldChange('emergency_contact_phone', e.target.value)}
//                   placeholder="Emergency contact phone"
//                   disabled={loading}
//                 />
//               ) : (
//                 <p className="mt-2 text-gray-700">{profile.emergency_contact_phone || "Not provided"}</p>
//               )}
//             </div>

//             <div>
//               <Label>Relationship</Label>
//               {editing ? (
//                 <Select
//                   value={formData.emergency_contact_relation || ""}
//                   onValueChange={(value) => onFieldChange('emergency_contact_relation', value)}
//                   disabled={loading}
//                 >
//                   <SelectTrigger>
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
//                 <p className="mt-2 text-gray-700">{profile.emergency_contact_relation || "Not specified"}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <Separator />

//         {/* Address Section */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Permanent Address</h3>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div className="md:col-span-2">
//               <Label>Complete Address</Label>
//               {editing ? (
//                 <Textarea
//                   rows={3}
//                   value={formData.address}
//                   onChange={(e) => onFieldChange('address', e.target.value)}
//                   placeholder="Enter your complete address"
//                   disabled={loading}
//                   className={errors.address ? 'border-red-500' : ''}
//                 />
//               ) : (
//                 <p className="mt-2 text-gray-700">{profile.address || "Not provided"}</p>
//               )}
//               {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
//             </div>
//             <div>
//               <Label>City</Label>
//               {editing ? (
//                 <Input
//                   value={formData.city}
//                   onChange={(e) => onFieldChange('city', e.target.value)}
//                   disabled={loading}
//                   className={errors.city ? 'border-red-500' : ''}
//                 />
//               ) : (
//                 <p className="mt-2 text-gray-700">{profile.city || "Not provided"}</p>
//               )}
//               {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
//             </div>
//             <div>
//               <Label>State</Label>
//               {editing ? (
//                 <Input
//                   value={formData.state}
//                   onChange={(e) => onFieldChange('state', e.target.value)}
//                   disabled={loading}
//                   className={errors.state ? 'border-red-500' : ''}
//                 />
//               ) : (
//                 <p className="mt-2 text-gray-700">{profile.state || "Not provided"}</p>
//               )}
//               {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
//             </div>
//             <div>
//               <Label>Pincode</Label>
//               {editing ? (
//                 <Input
//                   value={formData.pincode}
//                   onChange={(e) => onFieldChange('pincode', e.target.value)}
//                   disabled={loading}
//                   className={errors.pincode ? 'border-red-500' : ''}
//                 />
//               ) : (
//                 <p className="mt-2 text-gray-700">{profile.pincode || "Not provided"}</p>
//               )}
//               {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>}
//             </div>
//           </div>
//         </div>

//         <Separator />

//         {/* Preferences Section */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Accommodation Preferences</h3>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <Label>Preferred Sharing Type</Label>
//               <p className="mt-2 text-gray-700 capitalize">{profile.preferred_sharing || "Not specified"}</p>
//               <p className="text-xs text-gray-500 mt-1">Preferred sharing cannot be changed</p>
//             </div>
//             <div>
//               <Label>Preferred Room Type</Label>
//               <p className="mt-2 text-gray-700">{profile.preferred_room_type || "Not specified"}</p>
//               <p className="text-xs text-gray-500 mt-1">Preferred room type cannot be changed</p>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }


// components/tenant/profile/PersonalInfoTab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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

export default function PersonalInfoTab({
  profile,
  editing,
  formData,
  errors,
  loading,
  age,
  isMobile = false,
  onFieldChange
}: PersonalInfoTabProps) {
  return (
    <Card>
      <CardHeader className={isMobile ? 'px-4 py-3' : ''}>
        <CardTitle className={isMobile ? 'text-base' : ''}>Personal Information</CardTitle>
        <CardDescription className={isMobile ? 'text-xs' : ''}>Your basic personal details</CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? 'px-4 py-3 space-y-4' : 'space-y-6'}>
        {/* Basic Information */}
        <div className="space-y-3">
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Basic Information</h3>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Full Name</Label>
              <p className={`mt-1 text-gray-700 font-medium ${isMobile ? 'text-sm' : ''}`}>{profile.full_name}</p>
              <p className={`text-xs text-gray-500 mt-1`}>Name cannot be changed</p>
            </div>

            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Email Address</Label>
              <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Phone Number</Label>
              <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.country_code} {profile.phone}</p>
              <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
            </div>

            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Gender</Label>
              {editing ? (
                <Select
                  value={formData.gender}
                  onValueChange={(value) => onFieldChange('gender', value)}
                  disabled={loading}
                >
                  <SelectTrigger className={isMobile ? 'h-9 text-sm' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.gender || "Not specified"}</p>
              )}
              {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
            </div>

            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Date of Birth</Label>
              {editing ? (
                <>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => onFieldChange('date_of_birth', e.target.value)}
                    disabled={loading}
                    className={`${errors.date_of_birth ? 'border-red-500' : ''} ${isMobile ? 'h-9 text-sm' : ''}`}
                  />
                  {errors.date_of_birth && <p className="text-sm text-red-500 mt-1">{errors.date_of_birth}</p>}
                </>
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>
                  {profile.date_of_birth ? format(parseISO(profile.date_of_birth), "dd MMM yyyy") : "Not provided"}
                  {age && ` (${age} years)`}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator className={isMobile ? 'my-3' : ''} />

        {/* Occupation Information */}
        <div className="space-y-3">
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Occupation Information</h3>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Occupation Category</Label>
              {editing ? (
                <Select
                  value={formData.occupation_category}
                  onValueChange={(value) => onFieldChange('occupation_category', value)}
                  disabled={loading}
                >
                  <SelectTrigger className={isMobile ? 'h-9 text-sm' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.occupation_category || "Not specified"}</p>
              )}
            </div>

            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Occupation</Label>
              {editing ? (
                <Input
                  value={formData.occupation}
                  onChange={(e) => onFieldChange('occupation', e.target.value)}
                  placeholder="Your profession"
                  disabled={loading}
                  className={`${errors.occupation ? 'border-red-500' : ''} ${isMobile ? 'h-9 text-sm' : ''}`}
                />
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.occupation || "Not specified"}</p>
              )}
              {errors.occupation && <p className="text-sm text-red-500 mt-1">{errors.occupation}</p>}
            </div>

            <div className={isMobile ? '' : 'md:col-span-2'}>
              <Label className={isMobile ? 'text-xs' : ''}>Exact Occupation Details</Label>
              {editing ? (
                <Textarea
                  value={formData.exact_occupation}
                  onChange={(e) => onFieldChange('exact_occupation', e.target.value)}
                  placeholder="Specific job title/role, company name, etc."
                  rows={isMobile ? 2 : 2}
                  disabled={loading}
                  className={`${errors.exact_occupation ? 'border-red-500' : ''} ${isMobile ? 'text-sm' : ''}`}
                />
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.exact_occupation || "Not specified"}</p>
              )}
              {errors.exact_occupation && <p className="text-sm text-red-500 mt-1">{errors.exact_occupation}</p>}
            </div>
          </div>
        </div>

        <Separator className={isMobile ? 'my-3' : ''} />

        {/* Emergency Contact Information */}
        <div className="space-y-3">
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Emergency Contact Information</h3>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-3 gap-4'}`}>
            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Contact Name</Label>
              {editing ? (
                <Input
                  value={formData.emergency_contact_name || ""}
                  onChange={(e) => onFieldChange('emergency_contact_name', e.target.value)}
                  placeholder="Emergency contact name"
                  disabled={loading}
                  className={isMobile ? 'h-9 text-sm' : ''}
                />
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.emergency_contact_name || "Not provided"}</p>
              )}
            </div>

            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Contact Phone</Label>
              {editing ? (
                <Input
                  value={formData.emergency_contact_phone || ""}
                  onChange={(e) => onFieldChange('emergency_contact_phone', e.target.value)}
                  placeholder="Emergency contact phone"
                  disabled={loading}
                  className={isMobile ? 'h-9 text-sm' : ''}
                />
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.emergency_contact_phone || "Not provided"}</p>
              )}
            </div>

            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Relationship</Label>
              {editing ? (
                <Select
                  value={formData.emergency_contact_relation || ""}
                  onValueChange={(value) => onFieldChange('emergency_contact_relation', value)}
                  disabled={loading}
                >
                  <SelectTrigger className={isMobile ? 'h-9 text-sm' : ''}>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Brother">Brother</SelectItem>
                    <SelectItem value="Sister">Sister</SelectItem>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Friend">Friend</SelectItem>
                    <SelectItem value="Relative">Relative</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.emergency_contact_relation || "Not specified"}</p>
              )}
            </div>
          </div>
        </div>

        <Separator className={isMobile ? 'my-3' : ''} />

        {/* Address Section */}
        <div className="space-y-3">
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Permanent Address</h3>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
            <div className={isMobile ? '' : 'md:col-span-2'}>
              <Label className={isMobile ? 'text-xs' : ''}>Complete Address</Label>
              {editing ? (
                <Textarea
                  rows={isMobile ? 2 : 3}
                  value={formData.address}
                  onChange={(e) => onFieldChange('address', e.target.value)}
                  placeholder="Enter your complete address"
                  disabled={loading}
                  className={`${errors.address ? 'border-red-500' : ''} ${isMobile ? 'text-sm' : ''}`}
                />
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.address || "Not provided"}</p>
              )}
              {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div>
              <Label className={isMobile ? 'text-xs' : ''}>City</Label>
              {editing ? (
                <Input
                  value={formData.city}
                  onChange={(e) => onFieldChange('city', e.target.value)}
                  disabled={loading}
                  className={`${errors.city ? 'border-red-500' : ''} ${isMobile ? 'h-9 text-sm' : ''}`}
                />
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.city || "Not provided"}</p>
              )}
              {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <Label className={isMobile ? 'text-xs' : ''}>State</Label>
              {editing ? (
                <Input
                  value={formData.state}
                  onChange={(e) => onFieldChange('state', e.target.value)}
                  disabled={loading}
                  className={`${errors.state ? 'border-red-500' : ''} ${isMobile ? 'h-9 text-sm' : ''}`}
                />
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.state || "Not provided"}</p>
              )}
              {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
            </div>
            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Pincode</Label>
              {editing ? (
                <Input
                  value={formData.pincode}
                  onChange={(e) => onFieldChange('pincode', e.target.value)}
                  disabled={loading}
                  className={`${errors.pincode ? 'border-red-500' : ''} ${isMobile ? 'h-9 text-sm' : ''}`}
                />
              ) : (
                <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.pincode || "Not provided"}</p>
              )}
              {errors.pincode && <p className="text-sm text-red-500 mt-1">{errors.pincode}</p>}
            </div>
          </div>
        </div>

        <Separator className={isMobile ? 'my-3' : ''} />

        {/* Preferences Section */}
        <div className="space-y-3">
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Accommodation Preferences</h3>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Preferred Sharing Type</Label>
              <p className={`mt-1 text-gray-700 capitalize ${isMobile ? 'text-sm' : ''}`}>{profile.preferred_sharing || "Not specified"}</p>
              <p className="text-xs text-gray-500 mt-1">Preferred sharing cannot be changed</p>
            </div>
            <div>
              <Label className={isMobile ? 'text-xs' : ''}>Preferred Room Type</Label>
              <p className={`mt-1 text-gray-700 ${isMobile ? 'text-sm' : ''}`}>{profile.preferred_room_type || "Not specified"}</p>
              <p className="text-xs text-gray-500 mt-1">Preferred room type cannot be changed</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



