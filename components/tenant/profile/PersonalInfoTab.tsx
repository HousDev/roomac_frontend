

// // components/tenant/profile/PersonalInfoTab.tsx
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from '@/components/ui/select';
// import {
//   User, Mail, Phone, Calendar, Briefcase,
//   AlertCircle, MapPin, Building, Users, Heart, Shield, Home,
//   PenLine, Lock, Hash, Award
// } from 'lucide-react';
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

// // Helper function to safely get last 6 characters of ID
// const getDisplayId = (id: string | number | undefined): string => {
//   if (!id) return 'N/A';
//   const idStr = String(id); // Convert to string safely
//   return idStr.length > 6 ? idStr.slice(-6) : idStr;
// };

// // Reusable read-only row (desktop) - enhanced with logo colors
// const InfoRow = ({
//   label, value, last = false, icon: Icon, badge
// }: { 
//   label: string; 
//   value: string; 
//   last?: boolean;
//   icon?: any;
//   badge?: string;
// }) => (
//   <div className={`group flex items-start justify-between py-3 px-1 ${!last ? 'border-b border-slate-100' : ''} hover:bg-[#f0f5ff] transition-colors duration-150 rounded-lg`}>
//     <div className="flex items-center gap-2 text-slate-500">
//       {Icon && <Icon className="h-3.5 w-3.5 text-[#004aad]" />}
//       <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
//     </div>
//     <div className="flex items-center gap-2 max-w-[60%]">
//       {badge && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-[#ffc107] text-[#004aad] bg-[#fff9e6]">{badge}</Badge>}
//       <span className="text-sm font-semibold text-slate-800 text-right break-words">{value || '—'}</span>
//     </div>
//   </div>
// );

// // Section Header Component with logo colors
// const SectionHeader = ({ icon: Icon, title, color = "blue" }: { icon: any; title: string; color?: string }) => {
//   const getBgColor = () => {
//     switch(color) {
//       case 'blue': return 'bg-[#e6f0ff]';
//       case 'gold': return 'bg-[#fff9e6]';
//       case 'rose': return 'bg-rose-50';
//       case 'emerald': return 'bg-emerald-50';
//       default: return 'bg-[#e6f0ff]';
//     }
//   };

//   const getTextColor = () => {
//     switch(color) {
//       case 'blue': return 'text-[#004aad]';
//       case 'gold': return 'text-[#ffc107]';
//       default: return 'text-[#004aad]';
//     }
//   };

//   return (
//     <div className="flex items-center gap-2.5">
//       <div className={`p-2 ${getBgColor()} rounded-lg`}>
//         <Icon className={`h-4 w-4 ${getTextColor()}`} />
//       </div>
//       <div>
//         <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
//         <p className="text-[10px] text-slate-400 mt-0.5">Personal details & preferences</p>
//       </div>
//     </div>
//   );
// };

// export default function PersonalInfoTab({
//   profile,
//   editing,
//   formData,
//   errors,
//   loading,
//   age,
//   isMobile = false,
//   onFieldChange,
// }: PersonalInfoTabProps) {

//   const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
//   const OCC_OPTIONS = ['Service', 'Business', 'Student', 'Other'];
//   const REL_OPTIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Friend', 'Relative', 'Guardian', 'Other'];

//   // Safely format display values
//   const displayId = getDisplayId(profile.id);
//   const displayName = profile.full_name || '—';
//   const displayEmail = profile.email || '—';
//   const displayPhone = `${profile.country_code || ''} ${profile.phone || ''}`.trim() || '—';
//   const displayGender = profile.gender || '—';
//   const displayDob = profile.date_of_birth 
//     ? (() => { try { return format(parseISO(profile.date_of_birth), 'dd MMM yyyy'); } catch { return profile.date_of_birth; } })()
//     : '—';

//   // ── MOBILE VIEW - Enhanced with logo colors ─────────────────────────────────
//   if (isMobile) {
//     return (
//       <div className="space-y-3 pb-4">
        
//         {/* Profile Summary Card - Blue gradient */}
//         <div className="bg-gradient-to-br from-[#004aad] via-[#004aad] to-[#002a7a] rounded-xl p-4 border border-[#004aad]/20 shadow-lg">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="h-12 w-12 rounded-xl bg-[#ffc107] flex items-center justify-center shadow-lg">
//               <User className="h-6 w-6 text-[#004aad]" />
//             </div>
//             <div className="flex-1">
//               <h2 className="text-base font-bold text-white">{displayName}</h2>
//               <div className="flex items-center gap-1.5 mt-0.5">
//                 <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-[9px] px-1.5 py-0">
//                   <Hash className="h-2 w-2 inline mr-0.5" />
//                   {displayId}
//                 </Badge>
//                 {/* {age && (
//                   <Badge className="bg-[#ffc107] text-[#004aad] border-none text-[9px] px-1.5 py-0">
//                     <Award className="h-2 w-2 inline mr-0.5" />
//                     {age} years
//                   </Badge>
//                 )} */}
//               </div>
//             </div>
//           </div>
          
//           {/* Quick Info Chips */}
//           <div className="flex flex-wrap gap-1.5 mt-2">
//             {profile.gender && (
//               <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
//                 <User className="h-3 w-3 text-[#ffc107]" />
//                 <span className="text-[10px] font-medium text-white">{profile.gender}</span>
//               </div>
//             )}
//             {profile.occupation_category && (
//               <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
//                 <Briefcase className="h-3 w-3 text-[#ffc107]" />
//                 <span className="text-[10px] font-medium text-white">{profile.occupation_category}</span>
//               </div>
//             )}
//             {profile.city && (
//               <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
//                 <MapPin className="h-3 w-3 text-[#ffc107]" />
//                 <span className="text-[10px] font-medium text-white">{profile.city}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Basic Information */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="px-4 py-3 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
//             <div className="flex items-center gap-2">
//               <div className="p-1.5 bg-[#004aad] rounded-lg shadow-sm">
//                 <User className="h-3.5 w-3.5 text-white" />
//               </div>
//               <span className="text-xs font-bold text-[#004aad] uppercase tracking-wider">Basic Information</span>
//             </div>
//           </div>
//           <div className="p-4 space-y-3">

//             {/* Full Name — locked */}
//             <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
//               <div className="flex items-center justify-between mb-1">
//                 <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Full Name</p>
//                 <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
//               </div>
//               <p className="text-sm font-bold text-slate-800">{displayName}</p>
//             </div>

//             {/* Email — locked */}
//             <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
//               <div className="flex items-center justify-between mb-1">
//                 <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Email</p>
//                 <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
//               </div>
//               <p className="text-xs text-slate-700 truncate">{displayEmail}</p>
//             </div>

//             {/* Phone — locked */}
//             <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
//               <div className="flex items-center justify-between mb-1">
//                 <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Phone</p>
//                 <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
//               </div>
//               <p className="text-sm font-bold text-slate-800">{displayPhone}</p>
//             </div>

//             {/* Gender + DOB side by side */}
//             <div className="grid grid-cols-2 gap-2">
//               <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
//                 <p className="text-[9px] font-medium text-[#004aad] uppercase tracking-wider mb-1">Gender</p>
//                 <p className="text-sm font-bold text-slate-800">{displayGender}</p>
//                 {errors.gender && <p className="text-[9px] text-red-500 mt-1">{errors.gender}</p>}
//               </div>
//               <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
//                 <p className="text-[9px] font-medium text-[#ffc107] uppercase tracking-wider mb-1">Date of Birth</p>
//                 <div className="flex items-baseline gap-1">
//                   <p className="text-sm font-bold text-slate-800">{displayDob}</p>
//                   {age && <span className="text-[9px] text-slate-400">({age}y)</span>}
//                 </div>
//                 {errors.date_of_birth && <p className="text-[9px] text-red-500 mt-1">{errors.date_of_birth}</p>}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Occupation */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="px-4 py-3 bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] border-b border-[#ffc107]/30">
//             <div className="flex items-center gap-2">
//               <div className="p-1.5 bg-[#ffc107] rounded-lg shadow-sm">
//                 <Briefcase className="h-3.5 w-3.5 text-[#004aad]" />
//               </div>
//               <span className="text-xs font-bold text-[#004aad] uppercase tracking-wider">Occupation</span>
//             </div>
//           </div>
//           <div className="p-4 space-y-3">
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Category</p>
//                 {editing ? (
//                   <Select value={formData.occupation_category || ''} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
//                     <SelectTrigger className="h-9 text-sm border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107]">
//                       <SelectValue placeholder="Select" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {OCC_OPTIONS.map(o => (
//                         <SelectItem key={o} value={o} className="text-sm">{o}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 ) : (
//                   <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
//                     {profile.occupation_category || '—'}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Occupation</p>
//                 {editing ? (
//                   <Input 
//                     value={formData.occupation || ''} 
//                     onChange={e => onFieldChange('occupation', e.target.value)} 
//                     disabled={loading} 
//                     className={`h-9 text-sm border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107] ${errors.occupation ? 'border-red-300 focus:ring-red-200' : ''}`} 
//                     placeholder="Profession" 
//                   />
//                 ) : (
//                   <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
//                     {profile.occupation || '—'}
//                   </p>
//                 )}
//                 {errors.occupation && <p className="text-[9px] text-red-500 mt-1">{errors.occupation}</p>}
//               </div>
//             </div>
//             <div>
//               <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Details</p>
//               {editing ? (
//                 <Textarea 
//                   value={formData.exact_occupation || ''} 
//                   onChange={e => onFieldChange('exact_occupation', e.target.value)} 
//                   disabled={loading} 
//                   rows={2} 
//                   className="text-sm border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107]" 
//                   placeholder="Job title, company..." 
//                 />
//               ) : (
//                 <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 min-h-[60px]">
//                   {profile.exact_occupation || '—'}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Emergency Contact */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="px-4 py-3 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
//             <div className="flex items-center gap-2">
//               <div className="p-1.5 bg-rose-500 rounded-lg shadow-sm">
//                 <AlertCircle className="h-3.5 w-3.5 text-white" />
//               </div>
//               <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Emergency Contact</span>
//             </div>
//           </div>
//           <div className="p-4 space-y-3">
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Name</p>
//                 {editing ? (
//                   <Input 
//                     value={formData.emergency_contact_name || ''} 
//                     onChange={e => onFieldChange('emergency_contact_name', e.target.value)} 
//                     disabled={loading} 
//                     className="h-9 text-sm border-slate-200 focus:ring-2 focus:ring-rose-200" 
//                     placeholder="Contact name" 
//                   />
//                 ) : (
//                   <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
//                     {profile.emergency_contact_name || '—'}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Phone</p>
//                 {editing ? (
//                   <Input 
//                     value={formData.emergency_contact_phone || ''} 
//                     onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} 
//                     disabled={loading} 
//                     maxLength={10} 
//                     className="h-9 text-sm border-slate-200 focus:ring-2 focus:ring-rose-200" 
//                     placeholder="Contact phone" 
//                   />
//                 ) : (
//                   <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
//                     {profile.emergency_contact_phone || '—'}
//                   </p>
//                 )}
//               </div>
//             </div>
//             <div>
//               <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Relationship</p>
//               {editing ? (
//                 <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
//                   <SelectTrigger className="h-9 text-sm border-slate-200 focus:ring-2 focus:ring-rose-200">
//                     <SelectValue placeholder="Select" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {REL_OPTIONS.map(r => (
//                       <SelectItem key={r} value={r} className="text-sm">{r}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
//                   {profile.emergency_contact_relation || '—'}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Permanent Address */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
//             <div className="flex items-center gap-2">
//               <div className="p-1.5 bg-emerald-500 rounded-lg shadow-sm">
//                 <MapPin className="h-3.5 w-3.5 text-white" />
//               </div>
//               <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Permanent Address</span>
//             </div>
//           </div>
//           <div className="p-4 space-y-3">
//             <div>
//               <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Address</p>
//               {editing ? (
//                 <Textarea 
//                   value={formData.address || ''} 
//                   onChange={e => onFieldChange('address', e.target.value)} 
//                   disabled={loading} 
//                   rows={2} 
//                   className={`text-sm border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.address ? 'border-red-300 focus:ring-red-200' : ''}`} 
//                   placeholder="Complete address" 
//                 />
//               ) : (
//                 <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
//                   {profile.address || '—'}
//                 </div>
//               )}
//               {errors.address && <p className="text-[9px] text-red-500 mt-1">{errors.address}</p>}
//             </div>
//             <div className="grid grid-cols-3 gap-2">
//               {(['city', 'state', 'pincode'] as const).map(f => (
//                 <div key={f}>
//                   <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1 capitalize">{f}</p>
//                   {editing ? (
//                     <Input 
//                       value={formData[f] as string || ''} 
//                       onChange={e => onFieldChange(f, e.target.value)} 
//                       disabled={loading} 
//                       className={`h-9 text-sm border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors[f] ? 'border-red-300 focus:ring-red-200' : ''}`} 
//                     />
//                   ) : (
//                     <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
//                       {(profile as any)[f] || '—'}
//                     </p>
//                   )}
//                   {errors[f] && <p className="text-[9px] text-red-500 mt-1">{errors[f]}</p>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Edit Mode Indicator */}
//         {editing && (
//           <div className="bg-[#e6f0ff] border border-[#004aad]/30 rounded-xl p-3 flex items-center gap-2">
//             <PenLine className="h-4 w-4 text-[#004aad]" />
//             <p className="text-xs text-[#004aad] font-medium">You are editing your profile</p>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // ── DESKTOP VIEW - Enhanced with logo colors ─────────────────────────────────
//   return (
//     <div className="space-y-5 pb-6">
      
      

//       {/* Profile Header Card - Blue and gold theme */}
//       <Card className="border-none shadow-lg bg-gradient-to-r from-[#004aad] to-[#002a7a] overflow-hidden">
//         <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/20 rounded-full -ml-10 -mb-10"></div>
//         <CardContent className="p-6 relative z-10">
//           <div className="flex items-center gap-5">
//             <div className="h-16 w-16 rounded-xl bg-[#ffc107] flex items-center justify-center shadow-lg border border-white/30">
//               <User className="h-8 w-8 text-[#004aad]" />
//             </div>
//             <div className="flex-1">
//               <h3 className="text-xl font-bold text-white mb-1">{displayName}</h3>
//               <div className="flex items-center gap-3 text-sm text-white/80">
//                 <span className="flex items-center gap-1">
//                   <Mail className="h-3.5 w-3.5" /> {displayEmail}
//                 </span>
//                 <span className="w-1 h-1 rounded-full bg-white/40"></span>
//                 <span className="flex items-center gap-1">
//                   <Phone className="h-3.5 w-3.5" /> {displayPhone}
//                 </span>

//               </div>
//             </div>
//             <Badge className="bg-[#ffc107] text-[#004aad] border-none text-xs px-3 py-1 shadow-md">
//               <Hash className="h-3 w-3 inline mr-1" />
//               #{displayId}
//             </Badge>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//         {/* Left Column */}
//         <div className="space-y-5">
//           {/* Basic Information */}
//           <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
//             <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
//               <SectionHeader icon={User} title="Basic Information" color="blue" />
//             </CardHeader>
//             <CardContent className="px-6 py-4">
//               <div className="space-y-1">
//                 <InfoRow label="Gender" value={displayGender} icon={Heart} />
//                 <InfoRow label="Date of Birth" value={displayDob} icon={Calendar} badge={age ? `${age}y` : undefined} last />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Emergency Contact */}
//           <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
//             <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
//               <SectionHeader icon={AlertCircle} title="Emergency Contact" color="rose" />
//             </CardHeader>
//             <CardContent className="px-6 py-4">
//               {editing ? (
//                 <div className="space-y-3">
//                   <div>
//                     <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Contact Name</Label>
//                     <Input 
//                       value={formData.emergency_contact_name || ''} 
//                       onChange={e => onFieldChange('emergency_contact_name', e.target.value)} 
//                       disabled={loading} 
//                       className="border-slate-200 focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all" 
//                       placeholder="Full name" 
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Phone</Label>
//                       <Input 
//                         value={formData.emergency_contact_phone || ''} 
//                         onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} 
//                         disabled={loading} 
//                         maxLength={10} 
//                         className="border-slate-200 focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all" 
//                         placeholder="Phone number" 
//                       />
//                     </div>
//                     <div>
//                       <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Relationship</Label>
//                       <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
//                         <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-rose-200">
//                           <SelectValue placeholder="Select" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {REL_OPTIONS.map(r => (
//                             <SelectItem key={r} value={r}>{r}</SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   <InfoRow label="Name" value={profile.emergency_contact_name || '—'} icon={User} />
//                   <InfoRow label="Phone" value={profile.emergency_contact_phone || '—'} icon={Phone} />
//                   <InfoRow label="Relationship" value={profile.emergency_contact_relation || '—'} icon={Users} last />
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right Column */}
//         <div className="space-y-5">
//           {/* Occupation */}
//           <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
//             <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] border-b border-[#ffc107]/30">
//               <SectionHeader icon={Briefcase} title="Occupation" color="gold" />
//             </CardHeader>
//             <CardContent className="px-6 py-4">
//               {editing ? (
//                 <div className="space-y-3">
//                   <div>
//                     <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Category</Label>
//                     <Select value={formData.occupation_category || ''} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
//                       <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107]">
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {OCC_OPTIONS.map(o => (
//                           <SelectItem key={o} value={o}>{o}</SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Occupation</Label>
//                     <Input 
//                       value={formData.occupation || ''} 
//                       onChange={e => onFieldChange('occupation', e.target.value)} 
//                       disabled={loading} 
//                       className={`border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107] ${errors.occupation ? 'border-red-300 focus:ring-red-200' : ''}`} 
//                       placeholder="Your profession" 
//                     />
//                     {errors.occupation && <p className="text-xs text-red-500 mt-1.5">{errors.occupation}</p>}
//                   </div>
//                   <div>
//                     <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Exact Details</Label>
//                     <Textarea 
//                       value={formData.exact_occupation || ''} 
//                       onChange={e => onFieldChange('exact_occupation', e.target.value)} 
//                       disabled={loading} 
//                       rows={3} 
//                       className="border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107] resize-none" 
//                       placeholder="Job title, company, responsibilities..." 
//                     />
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   <InfoRow label="Category" value={profile.occupation_category || '—'} icon={Building} />
//                   <InfoRow label="Occupation" value={profile.occupation || '—'} icon={Briefcase} />
//                   <InfoRow label="Exact Details" value={profile.exact_occupation || '—'} icon={Shield} last />
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Permanent Address */}
//           <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
//             <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
//               <SectionHeader icon={MapPin} title="Permanent Address" color="emerald" />
//             </CardHeader>
//             <CardContent className="px-6 py-4">
//               {editing ? (
//                 <div className="space-y-3">
//                   <div>
//                     <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Address</Label>
//                     <Textarea 
//                       value={formData.address || ''} 
//                       onChange={e => onFieldChange('address', e.target.value)} 
//                       disabled={loading} 
//                       rows={2} 
//                       className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.address ? 'border-red-300 focus:ring-red-200' : ''}`} 
//                       placeholder="Complete address" 
//                     />
//                     {errors.address && <p className="text-xs text-red-500 mt-1.5">{errors.address}</p>}
//                   </div>
//                   <div className="grid grid-cols-3 gap-3">
//                     <div>
//                       <Label className="text-xs font-medium text-slate-500 mb-1.5 block">City</Label>
//                       <Input 
//                         value={formData.city || ''} 
//                         onChange={e => onFieldChange('city', e.target.value)} 
//                         disabled={loading} 
//                         className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.city ? 'border-red-300 focus:ring-red-200' : ''}`} 
//                       />
//                       {errors.city && <p className="text-xs text-red-500 mt-1.5">{errors.city}</p>}
//                     </div>
//                     <div>
//                       <Label className="text-xs font-medium text-slate-500 mb-1.5 block">State</Label>
//                       <Input 
//                         value={formData.state || ''} 
//                         onChange={e => onFieldChange('state', e.target.value)} 
//                         disabled={loading} 
//                         className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.state ? 'border-red-300 focus:ring-red-200' : ''}`} 
//                       />
//                       {errors.state && <p className="text-xs text-red-500 mt-1.5">{errors.state}</p>}
//                     </div>
//                     <div>
//                       <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Pincode</Label>
//                       <Input 
//                         value={formData.pincode || ''} 
//                         onChange={e => onFieldChange('pincode', e.target.value)} 
//                         disabled={loading} 
//                         className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.pincode ? 'border-red-300 focus:ring-red-200' : ''}`} 
//                       />
//                       {errors.pincode && <p className="text-xs text-red-500 mt-1.5">{errors.pincode}</p>}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   <InfoRow label="Address" value={profile.address || '—'} icon={Home} />
//                   <InfoRow label="City" value={profile.city || '—'} icon={MapPin} />
//                   <InfoRow label="State" value={profile.state || '—'} icon={Building} />
//                   <InfoRow label="Pincode" value={profile.pincode || '—'} icon={Mail} last />
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Edit Mode Indicator */}
//       {editing && (
//         <div className="mt-4 p-3 bg-[#e6f0ff] border border-[#004aad]/30 rounded-lg flex items-center gap-2">
//           <PenLine className="h-4 w-4 text-[#004aad]" />
//           <p className="text-xs text-[#004aad]">You are in edit mode. Changes will be saved when you click the Save button.</p>
//         </div>
//       )}
//     </div>
//   );
// }



// // components/tenant/profile/PersonalInfoTab.tsx
// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Button } from '@/components/ui/button';
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from '@/components/ui/select';
// import {
//   User, Mail, Phone, Calendar, Briefcase,
//   AlertCircle, MapPin, Building, Users, Heart, Shield, Home,
//   PenLine, Lock, Hash, Award, ChevronDown, ChevronUp, Plus,
//   GraduationCap, Laptop, Store, Rocket,
// } from 'lucide-react';
// import { format, parseISO } from 'date-fns';
// import { TenantProfile, TenantFormData } from '@/lib/tenantDetailsApi';

// // ─── Types ───────────────────────────────────────────────────────────────────

// export interface PartnerFormData {
//   full_name: string;
//   phone: string;
//   email: string;
//   gender: string;
//   date_of_birth: string;
//   address: string;
//   occupation: string;
//   organization: string;
//   relationship: string;
// }

// interface PersonalInfoTabProps {
//   profile: TenantProfile;
//   editing: boolean;
//   formData: TenantFormData;
//   errors: Record<string, string>;
//   loading: boolean;
//   age: number | null;
//   isMobile?: boolean;
//   // master data for dropdowns
//   cities?: Array<{ id: number; name: string }>;
//   states?: Array<{ id: number; name: string }>;
//   onFieldChange: (field: keyof TenantFormData, value: string) => void;
//   // partner
//   partnerData?: PartnerFormData;
//   onPartnerFieldChange?: (field: keyof PartnerFormData, value: string) => void;
// }

// // ─── Occupation categories (mirrors tenant-form) ─────────────────────────────

// const OCCUPATION_CATEGORIES = [
//   { value: 'Working Professional', label: 'Working Professional', icon: <Briefcase className="h-3 w-3" /> },
//   { value: 'Student', label: 'Student', icon: <GraduationCap className="h-3 w-3" /> },
//   { value: 'Business Owner', label: 'Business Owner', icon: <Store className="h-3 w-3" /> },
//   { value: 'Freelancer / Self-Employed', label: 'Freelancer / Self-Employed', icon: <Laptop className="h-3 w-3" /> },
//   { value: 'Government Employee', label: 'Government Employee', icon: <Building className="h-3 w-3" /> },
//   { value: 'Consultant', label: 'Consultant', icon: <Rocket className="h-3 w-3" /> },
//   { value: 'Other', label: 'Other', icon: <User className="h-3 w-3" /> },
// ];

// // ─── Small helpers ────────────────────────────────────────────────────────────

// const getDisplayId = (id: string | number | undefined): string => {
//   if (!id) return 'N/A';
//   const s = String(id);
//   return s.length > 6 ? s.slice(-6) : s;
// };

// const InfoRow = ({
//   label, value, last = false, icon: Icon, badge,
// }: {
//   label: string; value: string; last?: boolean; icon?: any; badge?: string;
// }) => (
//   <div className={`group flex items-start justify-between py-3 px-1 ${!last ? 'border-b border-slate-100' : ''} hover:bg-[#f0f5ff] transition-colors duration-150 rounded-lg`}>
//     <div className="flex items-center gap-2 text-slate-500">
//       {Icon && <Icon className="h-3.5 w-3.5 text-[#004aad]" />}
//       <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
//     </div>
//     <div className="flex items-center gap-2 max-w-[60%]">
//       {badge && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-[#ffc107] text-[#004aad] bg-[#fff9e6]">{badge}</Badge>}
//       <span className="text-sm font-semibold text-slate-800 text-right break-words">{value || '—'}</span>
//     </div>
//   </div>
// );

// const SectionHeader = ({ icon: Icon, title, color = 'blue' }: { icon: any; title: string; color?: string }) => {
//   const bgMap: Record<string, string> = { blue: 'bg-[#e6f0ff]', gold: 'bg-[#fff9e6]', rose: 'bg-rose-50', emerald: 'bg-emerald-50' };
//   const txtMap: Record<string, string> = { blue: 'text-[#004aad]', gold: 'text-[#ffc107]', rose: 'text-rose-500', emerald: 'text-emerald-600' };
//   return (
//     <div className="flex items-center gap-2.5">
//       <div className={`p-2 ${bgMap[color] ?? bgMap.blue} rounded-lg`}>
//         <Icon className={`h-4 w-4 ${txtMap[color] ?? txtMap.blue}`} />
//       </div>
//       <div>
//         <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
//         <p className="text-[10px] text-slate-400 mt-0.5">Personal details & preferences</p>
//       </div>
//     </div>
//   );
// };

// // ─── Occupation conditional fields (mirrors tenant-form logic) ────────────────

// function OccupationExtraFields({
//   category, formData, editing, loading, isMobile, onFieldChange,
// }: {
//   category: string;
//   formData: TenantFormData;
//   editing: boolean;
//   loading: boolean;
//   isMobile: boolean;
//   onFieldChange: (field: keyof TenantFormData, value: string) => void;
// }) {
//   const F = 'h-8 text-[11px] rounded-md border-slate-200 focus:border-[#004aad]';
//   const L = 'text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1';

//   if (!category) return null;

//   const orgLabel =
//     category === 'Student' ? 'College / University' :
//     category === 'Working Professional' ? 'Company / Organization' :
//     category === 'Business Owner' ? 'Business Name' :
//     category === 'Government Employee' ? 'Department / Office' : 'Organization';

//   return (
//     <div className="space-y-3 pt-1">
//       {/* Organization */}
//       <div>
//         <p className={L}>{orgLabel}</p>
//         {editing ? (
//           <Input
//             value={(formData as any).organization || ''}
//             onChange={e => onFieldChange('organization' as any, e.target.value)}
//             disabled={loading}
//             className={`${F} w-full`}
//             placeholder={`Enter ${orgLabel.toLowerCase()}`}
//           />
//         ) : (
//           <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
//             {(formData as any).organization || '—'}
//           </p>
//         )}
//       </div>

//       {/* Student-specific */}
//       {category === 'Student' && (
//         <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
//           <div>
//             <p className={L}>Course Duration</p>
//             {editing ? (
//               <Select
//                 value={(formData as any).course_duration || ''}
//                 onValueChange={v => onFieldChange('course_duration' as any, v)}
//                 disabled={loading}
//               >
//                 <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Duration" /></SelectTrigger>
//                 <SelectContent>
//                   {[['1_year','1 Year'],['2_years','2 Years'],['3_years','3 Years'],['4_years','4 Years'],['5_years','5+ Years']].map(([v,l]) => (
//                     <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             ) : (
//               <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
//                 {(formData as any).course_duration || '—'}
//               </p>
//             )}
//           </div>
//           <div>
//             <p className={L}>Student ID</p>
//             {editing ? (
//               <Input value={(formData as any).student_id || ''} onChange={e => onFieldChange('student_id' as any, e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="University ID" />
//             ) : (
//               <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).student_id || '—'}</p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Working Professional / Business / Consultant income */}
//       {['Working Professional','Business Owner','Consultant'].includes(category) && (
//         <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
//           <div>
//             <p className={L}>Experience (yrs)</p>
//             {editing ? (
//               <Input type="number" min="0" max="50" value={(formData as any).years_of_experience || ''} onChange={e => onFieldChange('years_of_experience' as any, e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="5" />
//             ) : (
//               <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).years_of_experience || '—'}</p>
//             )}
//           </div>
//           <div>
//             <p className={L}>Monthly Income (₹)</p>
//             {editing ? (
//               <Input type="number" min="0" value={(formData as any).monthly_income || ''} onChange={e => onFieldChange('monthly_income' as any, e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="50000" />
//             ) : (
//               <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).monthly_income || '—'}</p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Government Employee */}
//       {category === 'Government Employee' && (
//         <div>
//           <p className={L}>Employee / Service ID</p>
//           {editing ? (
//             <Input value={(formData as any).employee_id || ''} onChange={e => onFieldChange('employee_id' as any, e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="Employee ID" />
//           ) : (
//             <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).employee_id || '—'}</p>
//           )}
//         </div>
//       )}

//       {/* Freelancer */}
//       {category === 'Freelancer / Self-Employed' && (
//         <div>
//           <p className={L}>Portfolio / Website URL</p>
//           {editing ? (
//             <Input type="url" value={(formData as any).portfolio_url || ''} onChange={e => onFieldChange('portfolio_url' as any, e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="github.com/username" />
//           ) : (
//             <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).portfolio_url || '—'}</p>
//           )}
//         </div>
//       )}

//       {/* Work Mode */}
//       <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
//         <div>
//           <p className={L}>Work Mode</p>
//           {editing ? (
//             <Select value={(formData as any).work_mode || ''} onValueChange={v => onFieldChange('work_mode' as any, v)} disabled={loading}>
//               <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select" /></SelectTrigger>
//               <SelectContent>
//                 {[['remote','Fully Remote'],['hybrid','Hybrid'],['onsite','On-site'],['flexible','Flexible']].map(([v,l]) => (
//                   <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           ) : (
//             <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).work_mode || '—'}</p>
//           )}
//         </div>
//         <div>
//           <p className={L}>Shift Timing</p>
//           {editing ? (
//             <Select value={(formData as any).shift_timing || ''} onValueChange={v => onFieldChange('shift_timing' as any, v)} disabled={loading}>
//               <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select" /></SelectTrigger>
//               <SelectContent>
//                 {[['day','Day'],['night','Night'],['rotating','Rotating'],['flexible','Flexible']].map(([v,l]) => (
//                   <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           ) : (
//             <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).shift_timing || '—'}</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Partner Details Section ─────────────────────────────────────────────────

// function PartnerSection({
//   editing, loading, isMobile, partnerData, profile, onPartnerFieldChange,
// }: {
//   editing: boolean;
//   loading: boolean;
//   isMobile: boolean;
//   partnerData: PartnerFormData;
//   profile: TenantProfile;
//   onPartnerFieldChange: (field: keyof PartnerFormData, value: string) => void;
// }) {
//   const [open, setOpen] = useState(!!partnerData.full_name);
//   const F = 'h-8 text-[11px] rounded-md border-slate-200 focus:border-[#004aad]';
//   const L = 'text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1';

//   const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
//   const REL_OPTIONS = ['Spouse', 'Partner', 'Fiancé', 'Fiancée', 'Other'];

//   const hasPartner = !!(profile as any).partner_full_name || !!partnerData.full_name;

//   return (
//     <div className="mt-3">
//       <button
//         type="button"
//         onClick={() => setOpen(o => !o)}
//         className="flex items-center gap-1.5 text-[11px] font-medium text-[#004aad] hover:text-blue-700 transition-colors w-full"
//       >
//         <div className="p-1.5 bg-[#e6f0ff] rounded-lg">
//           <Heart className="h-3.5 w-3.5 text-[#004aad]" />
//         </div>
//         <span className="flex-1 text-left text-xs font-semibold text-slate-700">
//           {hasPartner ? 'Partner Details' : 'Add Partner Details'}
//         </span>
//         {hasPartner && (
//           <Badge className="bg-[#e6f0ff] text-[#004aad] border-none text-[9px] px-2">Linked</Badge>
//         )}
//         {open ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
//       </button>

//       {open && (
//         <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
//           <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
//             {/* Full Name */}
//             <div>
//               <p className={L}>Full Name</p>
//               {editing ? (
//                 <Input value={partnerData.full_name} onChange={e => onPartnerFieldChange('full_name', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="Partner's full name" />
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.full_name || '—'}</p>
//               )}
//             </div>

//             {/* Phone */}
//             <div>
//               <p className={L}>Phone</p>
//               {editing ? (
//                 <Input value={partnerData.phone} onChange={e => onPartnerFieldChange('phone', e.target.value)} disabled={loading} maxLength={10} className={`${F} w-full`} placeholder="10-digit mobile" />
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.phone || '—'}</p>
//               )}
//             </div>

//             {/* Email */}
//             <div>
//               <p className={L}>Email</p>
//               {editing ? (
//                 <Input type="email" value={partnerData.email} onChange={e => onPartnerFieldChange('email', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="partner@email.com" />
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.email || '—'}</p>
//               )}
//             </div>

//             {/* Gender */}
//             <div>
//               <p className={L}>Gender</p>
//               {editing ? (
//                 <Select value={partnerData.gender} onValueChange={v => onPartnerFieldChange('gender', v)} disabled={loading}>
//                   <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select" /></SelectTrigger>
//                   <SelectContent>{GENDER_OPTIONS.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
//                 </Select>
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.gender || '—'}</p>
//               )}
//             </div>

//             {/* DOB */}
//             <div>
//               <p className={L}>Date of Birth</p>
//               {editing ? (
//                 <Input type="date" value={partnerData.date_of_birth} onChange={e => onPartnerFieldChange('date_of_birth', e.target.value)} disabled={loading} className={`${F} w-full`} />
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.date_of_birth || '—'}</p>
//               )}
//             </div>

//             {/* Relationship */}
//             <div>
//               <p className={L}>Relationship</p>
//               {editing ? (
//                 <Select value={partnerData.relationship} onValueChange={v => onPartnerFieldChange('relationship', v)} disabled={loading}>
//                   <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select" /></SelectTrigger>
//                   <SelectContent>{REL_OPTIONS.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
//                 </Select>
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.relationship || '—'}</p>
//               )}
//             </div>

//             {/* Occupation */}
//             <div>
//               <p className={L}>Occupation</p>
//               {editing ? (
//                 <Input value={partnerData.occupation} onChange={e => onPartnerFieldChange('occupation', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="e.g. Software Engineer" />
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.occupation || '—'}</p>
//               )}
//             </div>

//             {/* Organization */}
//             <div>
//               <p className={L}>Organization / Company</p>
//               {editing ? (
//                 <Input value={partnerData.organization} onChange={e => onPartnerFieldChange('organization', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="Company or institution" />
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.organization || '—'}</p>
//               )}
//             </div>
//           </div>

//           {/* Address */}
//           <div>
//             <p className={L}>Address</p>
//             {editing ? (
//               <Textarea value={partnerData.address} onChange={e => onPartnerFieldChange('address', e.target.value)} disabled={loading} rows={2} className="text-sm border-slate-200 resize-none" placeholder="Partner's address" />
//             ) : (
//               <div className="text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-100 min-h-[48px]">{partnerData.address || '—'}</div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

// export default function PersonalInfoTab({
//   profile,
//   editing,
//   formData,
//   errors,
//   loading,
//   age,
//   isMobile = false,
//   cities = [],
//   states = [],
//   onFieldChange,
//   partnerData,
//   onPartnerFieldChange,
// }: PersonalInfoTabProps) {
//   const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
//   const OCC_OPTIONS = OCCUPATION_CATEGORIES;
//   const REL_OPTIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Friend', 'Relative', 'Guardian', 'Other'];

//   const displayId = getDisplayId(profile.id);
//   const displayName = profile.full_name || '—';
//   const displayEmail = profile.email || '—';
//   const displayPhone = `${profile.country_code || ''} ${profile.phone || ''}`.trim() || '—';
//   const displayGender = profile.gender || '—';
//   const displayDob = profile.date_of_birth
//     ? (() => { try { return format(parseISO(profile.date_of_birth), 'dd MMM yyyy'); } catch { return profile.date_of_birth; } })()
//     : '—';

//   // DOB max — must be 18+
//   const maxDob = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())
//     .toISOString().split('T')[0];

//   const defaultPartner: PartnerFormData = {
//     full_name: (profile as any).partner_full_name || '',
//     phone: (profile as any).partner_phone || '',
//     email: (profile as any).partner_email || '',
//     gender: (profile as any).partner_gender || '',
//     date_of_birth: (profile as any).partner_date_of_birth || '',
//     address: (profile as any).partner_address || '',
//     occupation: (profile as any).partner_occupation || '',
//     organization: (profile as any).partner_organization || '',
//     relationship: (profile as any).partner_relationship || 'Spouse',
//   };

//   const currentPartner = partnerData ?? defaultPartner;
//   const handlePartner = onPartnerFieldChange ?? (() => {});

//   const F = 'h-8 text-[11px] rounded-md border-slate-200 focus:border-[#004aad]';
//   const L_mobile = 'text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1';

//   // ── MOBILE ────────────────────────────────────────────────────────────────
//   if (isMobile) {
//     return (
//       <div className="space-y-3 pb-4">

//         {/* Profile banner */}
//         <div className="bg-gradient-to-br from-[#004aad] via-[#004aad] to-[#002a7a] rounded-xl p-4 border border-[#004aad]/20 shadow-lg">
//           <div className="flex items-center gap-3 mb-3">
//             <div className="h-12 w-12 rounded-xl bg-[#ffc107] flex items-center justify-center shadow-lg">
//               <User className="h-6 w-6 text-[#004aad]" />
//             </div>
//             <div className="flex-1">
//               <h2 className="text-base font-bold text-white">{displayName}</h2>
//               <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-[9px] px-1.5 py-0 mt-0.5">
//                 <Hash className="h-2 w-2 inline mr-0.5" />{displayId}
//               </Badge>
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-1.5 mt-2">
//             {profile.gender && (
//               <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
//                 <User className="h-3 w-3 text-[#ffc107]" />
//                 <span className="text-[10px] font-medium text-white">{profile.gender}</span>
//               </div>
//             )}
//             {profile.occupation_category && (
//               <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
//                 <Briefcase className="h-3 w-3 text-[#ffc107]" />
//                 <span className="text-[10px] font-medium text-white">{profile.occupation_category}</span>
//               </div>
//             )}
//             {profile.city && (
//               <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
//                 <MapPin className="h-3 w-3 text-[#ffc107]" />
//                 <span className="text-[10px] font-medium text-white">{profile.city}</span>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Basic Information */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="px-4 py-3 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
//             <div className="flex items-center gap-2">
//               <div className="p-1.5 bg-[#004aad] rounded-lg shadow-sm"><User className="h-3.5 w-3.5 text-white" /></div>
//               <span className="text-xs font-bold text-[#004aad] uppercase tracking-wider">Basic Information</span>
//             </div>
//           </div>
//           <div className="p-4 space-y-3">
//             {/* Full Name — locked */}
//             <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
//               <div className="flex items-center justify-between mb-1">
//                 <p className={L_mobile}>Full Name</p>
//                 <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
//               </div>
//               <p className="text-sm font-bold text-slate-800">{displayName}</p>
//             </div>
//             {/* Email — locked */}
//             <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
//               <div className="flex items-center justify-between mb-1">
//                 <p className={L_mobile}>Email</p>
//                 <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
//               </div>
//               <p className="text-xs text-slate-700 truncate">{displayEmail}</p>
//             </div>
//             {/* Phone — locked */}
//             <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
//               <div className="flex items-center justify-between mb-1">
//                 <p className={L_mobile}>Phone</p>
//                 <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
//               </div>
//               <p className="text-sm font-bold text-slate-800">{displayPhone}</p>
//             </div>

//             {/* Gender + DOB */}
//             <div className="grid grid-cols-2 gap-2">
//               <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
//   <p className={`${L_mobile} text-[#004aad]`}>Gender</p>
//   <p className="text-sm font-bold text-slate-800 mt-1">{displayGender}</p>
// </div>

//               {/* DOB — now EDITABLE */}
//               <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
//                 <p className={`${L_mobile} text-[#ffc107]`}>Date of Birth</p>
//                 {editing ? (
//                   <Input
//                     type="date"
//                     value={formData.date_of_birth || ''}
//                     onChange={e => {
//                       const sel = new Date(e.target.value);
//                       const cut = new Date(maxDob);
//                       if (sel > cut) return;
//                       onFieldChange('date_of_birth', e.target.value);
//                     }}
//                     max={maxDob}
//                     disabled={loading}
//                     className={`${F} w-full mt-1`}
//                   />
//                 ) : (
//                   <div className="flex items-baseline gap-1 mt-1">
//                     <p className="text-sm font-bold text-slate-800">{displayDob}</p>
//                     {age && <span className="text-[9px] text-slate-400">({age}y)</span>}
//                   </div>
//                 )}
//                 {errors.date_of_birth && <p className="text-[9px] text-red-500 mt-1">{errors.date_of_birth}</p>}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Occupation */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="px-4 py-3 bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] border-b border-[#ffc107]/30">
//             <div className="flex items-center gap-2">
//               <div className="p-1.5 bg-[#ffc107] rounded-lg shadow-sm"><Briefcase className="h-3.5 w-3.5 text-[#004aad]" /></div>
//               <span className="text-xs font-bold text-[#004aad] uppercase tracking-wider">Occupation</span>
//             </div>
//           </div>
//           <div className="p-4 space-y-3">
//             <div>
//               <p className={L_mobile}>Category</p>
//               {editing ? (
//                 <Select value={formData.occupation_category || ''} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
//                   <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select category" /></SelectTrigger>
//                   <SelectContent>
//                     {OCC_OPTIONS.map(o => (
//                       <SelectItem key={o.value} value={o.value} className="text-xs">
//                         <span className="flex items-center gap-1">{o.icon}{o.label}</span>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.occupation_category || '—'}</p>
//               )}
//             </div>
//             <div>
//               <p className={L_mobile}>Occupation</p>
//               {editing ? (
//                 <Input value={formData.occupation || ''} onChange={e => onFieldChange('occupation', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="Profession" />
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.occupation || '—'}</p>
//               )}
//               {errors.occupation && <p className="text-[9px] text-red-500 mt-1">{errors.occupation}</p>}
//             </div>
//             <div>
//               <p className={L_mobile}>Details</p>
//               {editing ? (
//                 <Textarea value={formData.exact_occupation || ''} onChange={e => onFieldChange('exact_occupation', e.target.value)} disabled={loading} rows={2} className="text-sm border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107]" placeholder="Job title, company..." />
//               ) : (
//                 <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 min-h-[60px]">{profile.exact_occupation || '—'}</div>
//               )}
//             </div>
//             {/* Conditional occupation fields */}
//             <OccupationExtraFields
//               category={editing ? (formData.occupation_category || '') : (profile.occupation_category || '')}
//               formData={formData}
//               editing={editing}
//               loading={loading}
//               isMobile={isMobile}
//               onFieldChange={onFieldChange}
//             />
//           </div>
//         </div>

//         {/* Emergency Contact */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="px-4 py-3 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
//             <div className="flex items-center gap-2">
//               <div className="p-1.5 bg-rose-500 rounded-lg shadow-sm"><AlertCircle className="h-3.5 w-3.5 text-white" /></div>
//               <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Emergency Contact</span>
//             </div>
//           </div>
//           <div className="p-4 space-y-3">
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <p className={L_mobile}>Name</p>
//                 {editing ? (
//                   <Input value={formData.emergency_contact_name || ''} onChange={e => onFieldChange('emergency_contact_name', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="Contact name" />
//                 ) : (
//                   <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.emergency_contact_name || '—'}</p>
//                 )}
//               </div>
//               <div>
//                 <p className={L_mobile}>Phone</p>
//                 {editing ? (
//                   <Input value={formData.emergency_contact_phone || ''} onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} disabled={loading} maxLength={10} className={`${F} w-full`} placeholder="Contact phone" />
//                 ) : (
//                   <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.emergency_contact_phone || '—'}</p>
//                 )}
//               </div>
//             </div>
//             <div>
//               <p className={L_mobile}>Relationship</p>
//               {editing ? (
//                 <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
//                   <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select" /></SelectTrigger>
//                   <SelectContent>{REL_OPTIONS.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
//                 </Select>
//               ) : (
//                 <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.emergency_contact_relation || '—'}</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Permanent Address */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
//           <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
//             <div className="flex items-center gap-2">
//               <div className="p-1.5 bg-emerald-500 rounded-lg shadow-sm"><MapPin className="h-3.5 w-3.5 text-white" /></div>
//               <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Permanent Address</span>
//             </div>
//           </div>
//           <div className="p-4 space-y-3">
//             <div>
//               <p className={L_mobile}>Address</p>
//               {editing ? (
//                 <Textarea value={formData.address || ''} onChange={e => onFieldChange('address', e.target.value)} disabled={loading} rows={2} className={`text-sm border-slate-200 ${errors.address ? 'border-red-300' : ''}`} placeholder="Complete address" />
//               ) : (
//                 <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.address || '—'}</div>
//               )}
//               {errors.address && <p className="text-[9px] text-red-500 mt-1">{errors.address}</p>}
//             </div>
//             <div className="grid grid-cols-3 gap-2">
//               {/* City dropdown */}
//               {/* City dropdown - SIMPLIFIED without city_id */}
// <div>
//   <p className={L_mobile}>City</p>
//   {editing ? (
//     cities.length > 0 ? (
//       <Select
//         value={formData.city || ''}
//         onValueChange={v => {
//           onFieldChange('city', v);
//         }}
//         disabled={loading}
//       >
//         <SelectTrigger className={`${F} w-full`}>
//           <SelectValue placeholder="City" />
//         </SelectTrigger>
//         <SelectContent>
//           {cities.map(c => (
//             <SelectItem key={c.id} value={c.name} className="text-xs">
//               {c.name}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     ) : (
//       <Input 
//         value={formData.city || ''} 
//         onChange={e => onFieldChange('city', e.target.value)} 
//         disabled={loading} 
//         className={`${F} w-full`} 
//       />
//     )
//   ) : (
//     <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
//       {profile.city || '—'}
//     </p>
//   )}
//   {errors.city && <p className="text-[9px] text-red-500 mt-1">{errors.city}</p>}
// </div>
//               {/* State dropdown */}
//              {/* State dropdown - SIMPLIFIED without state_id */}
// <div>
//   <p className={L_mobile}>State</p>
//   {editing ? (
//     states.length > 0 ? (
//       <Select
//         value={formData.state || ''}
//         onValueChange={v => {
//           onFieldChange('state', v);
//         }}
//         disabled={loading}
//       >
//         <SelectTrigger className={`${F} w-full`}>
//           <SelectValue placeholder="State" />
//         </SelectTrigger>
//         <SelectContent>
//           {states.map(s => (
//             <SelectItem key={s.id} value={s.name} className="text-xs">
//               {s.name}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     ) : (
//       <Input 
//         value={formData.state || ''} 
//         onChange={e => onFieldChange('state', e.target.value)} 
//         disabled={loading} 
//         className={`${F} w-full`} 
//       />
//     )
//   ) : (
//     <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
//       {profile.state || '—'}
//     </p>
//   )}
//   {errors.state && <p className="text-[9px] text-red-500 mt-1">{errors.state}</p>}
// </div>
//               {/* Pincode */}
//               <div>
//                 <p className={L_mobile}>Pincode</p>
//                 {editing ? (
//                   <Input value={formData.pincode || ''} onChange={e => onFieldChange('pincode', e.target.value)} disabled={loading} className={`${F} w-full ${errors.pincode ? 'border-red-300' : ''}`} />
//                 ) : (
//                   <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.pincode || '—'}</p>
//                 )}
//                 {errors.pincode && <p className="text-[9px] text-red-500 mt-1">{errors.pincode}</p>}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Partner Details */}
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4">
//           <PartnerSection
//             editing={editing}
//             loading={loading}
//             isMobile={isMobile}
//             partnerData={currentPartner}
//             profile={profile}
//             onPartnerFieldChange={handlePartner}
//           />
//         </div>

//         {editing && (
//           <div className="bg-[#e6f0ff] border border-[#004aad]/30 rounded-xl p-3 flex items-center gap-2">
//             <PenLine className="h-4 w-4 text-[#004aad]" />
//             <p className="text-xs text-[#004aad] font-medium">You are editing your profile</p>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // ── DESKTOP ───────────────────────────────────────────────────────────────
//   return (
//     <div className="space-y-5 pb-6">

//       {/* Profile header */}
//       <Card className="border-none shadow-lg bg-gradient-to-r from-[#004aad] to-[#002a7a] overflow-hidden">
//         <CardContent className="p-6">
//           <div className="flex items-center gap-5">
//             <div className="h-16 w-16 rounded-xl bg-[#ffc107] flex items-center justify-center shadow-lg border border-white/30">
//               <User className="h-8 w-8 text-[#004aad]" />
//             </div>
//             <div className="flex-1">
//               <h3 className="text-xl font-bold text-white mb-1">{displayName}</h3>
//               <div className="flex items-center gap-3 text-sm text-white/80">
//                 <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{displayEmail}</span>
//                 <span className="w-1 h-1 rounded-full bg-white/40" />
//                 <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{displayPhone}</span>
//               </div>
//             </div>
//             <Badge className="bg-[#ffc107] text-[#004aad] border-none text-xs px-3 py-1 shadow-md">
//               <Hash className="h-3 w-3 inline mr-1" />#{displayId}
//             </Badge>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//         {/* Left column */}
//         <div className="space-y-5">

//           {/* Basic Info */}
//           <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
//             <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
//               <SectionHeader icon={User} title="Basic Information" color="blue" />
//             </CardHeader>
//             <CardContent className="px-6 py-4">
//               <div className="space-y-1">
//                 <InfoRow label="Gender" value={displayGender} icon={Heart} />

//                 {/* DOB — now EDITABLE on desktop too */}
//                 {editing ? (
//                   <div className="py-2 border-t border-slate-100">
//                     <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Date of Birth</Label>
//                     <Input
//                       type="date"
//                       value={formData.date_of_birth || ''}
//                       onChange={e => {
//                         const sel = new Date(e.target.value);
//                         if (sel > new Date(maxDob)) return;
//                         onFieldChange('date_of_birth', e.target.value);
//                       }}
//                       max={maxDob}
//                       disabled={loading}
//                       className="border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107]"
//                     />
//                     {formData.date_of_birth && (
//                       <p className="text-[10px] text-slate-400 mt-1">
//                         Age: {Math.floor((Date.now() - new Date(formData.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} yrs
//                       </p>
//                     )}
//                     {errors.date_of_birth && <p className="text-xs text-red-500 mt-1">{errors.date_of_birth}</p>}
//                   </div>
//                 ) : (
//                   <InfoRow label="Date of Birth" value={displayDob} icon={Calendar} badge={age ? `${age}y` : undefined} last />
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Emergency Contact */}
//           <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
//             <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
//               <SectionHeader icon={AlertCircle} title="Emergency Contact" color="rose" />
//             </CardHeader>
//             <CardContent className="px-6 py-4">
//               {editing ? (
//                 <div className="space-y-3">
//                   <div>
//                     <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Contact Name</Label>
//                     <Input value={formData.emergency_contact_name || ''} onChange={e => onFieldChange('emergency_contact_name', e.target.value)} disabled={loading} className="border-slate-200 focus:ring-2 focus:ring-rose-200" placeholder="Full name" />
//                   </div>
//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Phone</Label>
//                       <Input value={formData.emergency_contact_phone || ''} onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} disabled={loading} maxLength={10} className="border-slate-200 focus:ring-2 focus:ring-rose-200" placeholder="Phone number" />
//                     </div>
//                     <div>
//                       <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Relationship</Label>
//                       <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
//                         <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-rose-200"><SelectValue placeholder="Select" /></SelectTrigger>
//                         <SelectContent>{REL_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   <InfoRow label="Name" value={profile.emergency_contact_name || '—'} icon={User} />
//                   <InfoRow label="Phone" value={profile.emergency_contact_phone || '—'} icon={Phone} />
//                   <InfoRow label="Relationship" value={profile.emergency_contact_relation || '—'} icon={Users} last />
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Partner Details */}
//           <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
//             <CardContent className="px-6 py-4">
//               <PartnerSection
//                 editing={editing}
//                 loading={loading}
//                 isMobile={false}
//                 partnerData={currentPartner}
//                 profile={profile}
//                 onPartnerFieldChange={handlePartner}
//               />
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right column */}
//         <div className="space-y-5">

//           {/* Occupation */}
//           <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
//             <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] border-b border-[#ffc107]/30">
//               <SectionHeader icon={Briefcase} title="Occupation" color="gold" />
//             </CardHeader>
//             <CardContent className="px-6 py-4">
//               {editing ? (
//                 <div className="space-y-3">
//                   <div>
//                     <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Category</Label>
//                     <Select value={formData.occupation_category || ''} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
//                       <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-[#ffc107]"><SelectValue placeholder="Select category" /></SelectTrigger>
//                       <SelectContent>
//                         {OCC_OPTIONS.map(o => (
//                           <SelectItem key={o.value} value={o.value}>
//                             <span className="flex items-center gap-1">{o.icon}{o.label}</span>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Occupation</Label>
//                     <Input value={formData.occupation || ''} onChange={e => onFieldChange('occupation', e.target.value)} disabled={loading} className={`border-slate-200 focus:ring-2 focus:ring-[#ffc107] ${errors.occupation ? 'border-red-300' : ''}`} placeholder="Your profession" />
//                     {errors.occupation && <p className="text-xs text-red-500 mt-1.5">{errors.occupation}</p>}
//                   </div>
//                   <div>
//                     <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Exact Details</Label>
//                     <Textarea value={formData.exact_occupation || ''} onChange={e => onFieldChange('exact_occupation', e.target.value)} disabled={loading} rows={2} className="border-slate-200 focus:ring-2 focus:ring-[#ffc107] resize-none" placeholder="Job title, responsibilities..." />
//                   </div>
//                   <OccupationExtraFields
//                     category={formData.occupation_category || ''}
//                     formData={formData}
//                     editing={editing}
//                     loading={loading}
//                     isMobile={false}
//                     onFieldChange={onFieldChange}
//                   />
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   <InfoRow label="Category" value={profile.occupation_category || '—'} icon={Building} />
//                   <InfoRow label="Occupation" value={profile.occupation || '—'} icon={Briefcase} />
//                   <InfoRow label="Exact Details" value={profile.exact_occupation || '—'} icon={Shield} last />
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Permanent Address */}
//           <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
//             <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
//               <SectionHeader icon={MapPin} title="Permanent Address" color="emerald" />
//             </CardHeader>
//             <CardContent className="px-6 py-4">
//               {editing ? (
//                 <div className="space-y-3">
//                   <div>
//                     <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Address</Label>
//                     <Textarea value={formData.address || ''} onChange={e => onFieldChange('address', e.target.value)} disabled={loading} rows={2} className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.address ? 'border-red-300' : ''}`} placeholder="Complete address" />
//                     {errors.address && <p className="text-xs text-red-500 mt-1.5">{errors.address}</p>}
//                   </div>
//                   <div className="grid grid-cols-3 gap-3">
//                     {/* City dropdown */}
//                    {/* City dropdown - Desktop */}
// <div>
//   <Label className="text-xs font-medium text-slate-500 mb-1.5 block">City</Label>
//   {cities.length > 0 ? (
//     <Select
//       value={formData.city || ''}
//       onValueChange={v => {
//         onFieldChange('city', v);
//       }}
//       disabled={loading}
//     >
//       <SelectTrigger className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.city ? 'border-red-300' : ''}`}>
//         <SelectValue placeholder="City" />
//       </SelectTrigger>
//       <SelectContent>
//         {cities.map(c => (
//           <SelectItem key={c.id} value={c.name}>
//             {c.name}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   ) : (
//     <Input 
//       value={formData.city || ''} 
//       onChange={e => onFieldChange('city', e.target.value)} 
//       disabled={loading} 
//       className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.city ? 'border-red-300' : ''}`} 
//     />
//   )}
//   {errors.city && <p className="text-xs text-red-500 mt-1.5">{errors.city}</p>}
// </div>

// {/* State dropdown - Desktop */}
// <div>
//   <Label className="text-xs font-medium text-slate-500 mb-1.5 block">State</Label>
//   {states.length > 0 ? (
//     <Select
//       value={formData.state || ''}
//       onValueChange={v => {
//         onFieldChange('state', v);
//       }}
//       disabled={loading}
//     >
//       <SelectTrigger className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.state ? 'border-red-300' : ''}`}>
//         <SelectValue placeholder="State" />
//       </SelectTrigger>
//       <SelectContent>
//         {states.map(s => (
//           <SelectItem key={s.id} value={s.name}>
//             {s.name}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   ) : (
//     <Input 
//       value={formData.state || ''} 
//       onChange={e => onFieldChange('state', e.target.value)} 
//       disabled={loading} 
//       className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.state ? 'border-red-300' : ''}`} 
//     />
//   )}
//   {errors.state && <p className="text-xs text-red-500 mt-1.5">{errors.state}</p>}
// </div>
//                     <div>
//                       <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Pincode</Label>
//                       <Input value={formData.pincode || ''} onChange={e => onFieldChange('pincode', e.target.value)} disabled={loading} className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.pincode ? 'border-red-300' : ''}`} />
//                       {errors.pincode && <p className="text-xs text-red-500 mt-1.5">{errors.pincode}</p>}
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-1">
//                   <InfoRow label="Address" value={profile.address || '—'} icon={Home} />
//                   <InfoRow label="City" value={profile.city || '—'} icon={MapPin} />
//                   <InfoRow label="State" value={profile.state || '—'} icon={Building} />
//                   <InfoRow label="Pincode" value={profile.pincode || '—'} icon={Mail} last />
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {editing && (
//         <div className="mt-4 p-3 bg-[#e6f0ff] border border-[#004aad]/30 rounded-lg flex items-center gap-2">
//           <PenLine className="h-4 w-4 text-[#004aad]" />
//           <p className="text-xs text-[#004aad]">You are in edit mode. Changes will be saved when you click the Save button.</p>
//         </div>
//       )}
//     </div>
//   );
// }



// components/tenant/profile/PersonalInfoTab.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  User, Mail, Phone, Calendar, Briefcase,
  AlertCircle, MapPin, Building, Users, Heart, Shield, Home,
  PenLine, Lock, Hash, Award, ChevronDown, ChevronUp, Plus,
  GraduationCap, Laptop, Store, Rocket,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile, TenantFormData } from '@/lib/tenantDetailsApi';
import { getSubCategoriesForCategory, type OccupationSubCategory } from '@/lib/occupation-data';
// ─── Types ───────────────────────────────────────────────────────────────────

export interface PartnerFormData {
  full_name: string;
  phone: string;
  email: string;
  gender: string;
  date_of_birth: string;
  address: string;
  occupation: string;
  organization: string;
  relationship: string;
}

interface PersonalInfoTabProps {
  profile: TenantProfile;
  editing: boolean;
  formData: TenantFormData;
  errors: Record<string, string>;
  loading: boolean;
  age: number | null;
  isMobile?: boolean;
  cities?: Array<{ id: number; name: string }>;
  states?: Array<{ id: number; name: string }>;
  onFieldChange: (field: keyof TenantFormData, value: string) => void;
  partnerData?: PartnerFormData;
  onPartnerFieldChange?: (field: keyof PartnerFormData, value: string) => void;
}

// ─── Occupation categories ─────────────────────────────────────────────

const OCCUPATION_CATEGORIES = [
  { value: 'Working Professional', label: 'Working Professional', icon: <Briefcase className="h-3 w-3" /> },
  { value: 'Student', label: 'Student', icon: <GraduationCap className="h-3 w-3" /> },
  { value: 'Business Owner', label: 'Business Owner', icon: <Store className="h-3 w-3" /> },
  { value: 'Freelancer / Self-Employed', label: 'Freelancer / Self-Employed', icon: <Laptop className="h-3 w-3" /> },
  { value: 'Government Employee', label: 'Government Employee', icon: <Building className="h-3 w-3" /> },
  { value: 'Consultant', label: 'Consultant', icon: <Rocket className="h-3 w-3" /> },
  { value: 'Other', label: 'Other', icon: <User className="h-3 w-3" /> },
];

const getDisplayId = (id: string | number | undefined): string => {
  if (!id) return 'N/A';
  const s = String(id);
  return s.length > 6 ? s.slice(-6) : s;
};

const InfoRow = ({
  label, value, last = false, icon: Icon, badge, required = false
}: {
  label: string; value: string; last?: boolean; icon?: any; badge?: string; required?: boolean;
}) => (
  <div className={`group flex items-start justify-between py-3 px-1 ${!last ? 'border-b border-slate-100' : ''} hover:bg-[#f0f5ff] transition-colors duration-150 rounded-lg`}>
    <div className="flex items-center gap-2 text-slate-500">
      {Icon && <Icon className="h-3.5 w-3.5 text-[#004aad]" />}
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
    </div>
    <div className="flex items-center gap-2 max-w-[60%]">
      {badge && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-[#ffc107] text-[#004aad] bg-[#fff9e6]">{badge}</Badge>}
      <span className="text-sm font-semibold text-slate-800 text-right break-words">{value || '—'}</span>
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title, color = 'blue' }: { icon: any; title: string; color?: string }) => {
  const bgMap: Record<string, string> = { blue: 'bg-[#e6f0ff]', gold: 'bg-[#fff9e6]', rose: 'bg-rose-50', emerald: 'bg-emerald-50' };
  const txtMap: Record<string, string> = { blue: 'text-[#004aad]', gold: 'text-[#ffc107]', rose: 'text-rose-500', emerald: 'text-emerald-600' };
  return (
    <div className="flex items-center gap-2.5">
      <div className={`p-2 ${bgMap[color] ?? bgMap.blue} rounded-lg`}>
        <Icon className={`h-4 w-4 ${txtMap[color] ?? txtMap.blue}`} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Personal details & preferences</p>
      </div>
    </div>
  );
};

// ─── Occupation conditional fields ────────────────────────────────

function OccupationExtraFields({
  category, formData, editing, loading, isMobile, onFieldChange,
}: {
  category: string;
  formData: TenantFormData;
  editing: boolean;
  loading: boolean;
  isMobile: boolean;
  onFieldChange: (field: keyof TenantFormData, value: string) => void;
}) {
  const F = 'h-8 text-[11px] rounded-md border-slate-200 focus:border-[#004aad]';
  const L = 'text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1';

  if (!category) return null;

  const orgLabel =
    category === 'Student' ? 'College / University' :
    category === 'Working Professional' ? 'Company / Organization' :
    category === 'Business Owner' ? 'Business Name' :
    category === 'Government Employee' ? 'Department / Office' : 'Organization';

  return (
    <div className="space-y-3 pt-1">
      <div>
        <p className={L}>{orgLabel}</p>
        {editing ? (
          <Input
            value={(formData as any).organization || ''}
            onChange={e => onFieldChange('organization' as any, e.target.value)}
            disabled={loading}
            className={`${F} w-full`}
            placeholder={`Enter ${orgLabel.toLowerCase()}`}
          />
        ) : (formData as any).organization ? (
  <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
    {(formData as any).organization}
  </p>
) : null}

      </div>

    {category === 'Student' && (
  <div className={`grid grid-cols-2 gap-2`}>
    <div>
      <p className={L}>Course Duration</p>
      {editing ? (
        <Input 
          value={(formData as any).course_duration || ''} 
          onChange={e => onFieldChange('course_duration' as any, e.target.value)}
          disabled={loading} 
          className={`${F} w-full`} 
          placeholder="e.g. 3 Years, 4 Years" 
        />
      ) : (formData as any).course_duration ? (
        <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
          {(formData as any).course_duration}
        </p>
      ) : null}
    </div>
    <div>
      <p className={L}>Student ID</p>
      {editing ? (
        <Input value={(formData as any).student_id || ''} onChange={e => onFieldChange('student_id' as any, e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="University ID" />
      ) : (formData as any).student_id ? (
        <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).student_id}</p>
      ) : null}
    </div>
  </div>
)}

      {['Working Professional','Business Owner','Consultant'].includes(category) && (
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
          <div>
            <p className={L}>Experience (yrs)</p>
            {editing ? (
              <Input type="number" min="0" max="50" value={(formData as any).years_of_experience || ''} onChange={e => onFieldChange('years_of_experience' as any, e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="5" />
            ) : (
              <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).years_of_experience || '—'}</p>
            )}
          </div>
          <div>
            <p className={L}>Monthly Income (₹)</p>
            {editing ? (
              <Input type="number" min="0" value={(formData as any).monthly_income || ''} onChange={e => onFieldChange('monthly_income' as any, e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="50000" />
            ) : (
              <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).monthly_income || '—'}</p>
            )}
          </div>
        </div>
      )}

      {category === 'Government Employee' && (
        <div>
          <p className={L}>Employee / Service ID</p>
          {editing ? (
            <Input value={(formData as any).employee_id || ''} onChange={e => onFieldChange('employee_id' as any, e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="Employee ID" />
          ) : (
            <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).employee_id || '—'}</p>
          )}
        </div>
      )}

      {category === 'Freelancer / Self-Employed' && (
        <div>
          <p className={L}>Portfolio / Website URL</p>
          {editing ? (
            <Input type="url" value={(formData as any).portfolio_url || ''} onChange={e => onFieldChange('portfolio_url' as any, e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="github.com/username" />
          ) : (
            <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).portfolio_url || '—'}</p>
          )}
        </div>
      )}

      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
        <div>
          <p className={L}>Work Mode</p>
          {editing ? (
            <Select value={(formData as any).work_mode || ''} onValueChange={v => onFieldChange('work_mode' as any, v)} disabled={loading}>
              <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {[['remote','Fully Remote'],['hybrid','Hybrid'],['onsite','On-site'],['flexible','Flexible']].map(([v,l]) => (
                  <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).work_mode || '—'}</p>
          )}
        </div>
        <div>
          <p className={L}>Shift Timing</p>
          {editing ? (
            <Select value={(formData as any).shift_timing || ''} onValueChange={v => onFieldChange('shift_timing' as any, v)} disabled={loading}>
              <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {[['day','Day'],['night','Night'],['rotating','Rotating'],['flexible','Flexible']].map(([v,l]) => (
                  <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{(formData as any).shift_timing || '—'}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Partner Details Section ─────────────────────────────────────────────────

function PartnerSection({
  editing, loading, isMobile, partnerData, profile, onPartnerFieldChange,
}: {
  editing: boolean;
  loading: boolean;
  isMobile: boolean;
  partnerData: PartnerFormData;
  profile: TenantProfile;
  onPartnerFieldChange: (field: keyof PartnerFormData, value: string) => void;
}) {
  const hasPartnerData = !!(partnerData.full_name || partnerData.phone || partnerData.email);
  const [open, setOpen] = useState(hasPartnerData);
  const F = 'h-8 text-[11px] rounded-md border-slate-200 focus:border-[#004aad]';
  const L = 'text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1';

  const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
  const REL_OPTIONS = ['Spouse', 'Partner', 'Fiancé', 'Fiancée', 'Other'];

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[11px] font-medium text-[#004aad] hover:text-blue-700 transition-colors w-full"
      >
        <div className="p-1.5 bg-[#e6f0ff] rounded-lg">
          <Heart className="h-3.5 w-3.5 text-[#004aad]" />
        </div>
        <span className="flex-1 text-left text-xs font-semibold text-slate-700">
          {hasPartnerData ? 'Partner Details' : 'Add Partner Details'}
        </span>
        {hasPartnerData && (
          <Badge className="bg-[#e6f0ff] text-[#004aad] border-none text-[9px] px-2">Linked</Badge>
        )}
        {open ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
      </button>

      {open && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
            <div>
              <p className={L}>Full Name</p>
              {editing ? (
                <Input value={partnerData.full_name || ''} onChange={e => onPartnerFieldChange('full_name', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="Partner's full name" />
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.full_name || '—'}</p>
              )}
            </div>
            <div>
              <p className={L}>Phone</p>
              {editing ? (
                <Input value={partnerData.phone || ''} onChange={e => onPartnerFieldChange('phone', e.target.value)} disabled={loading} maxLength={10} className={`${F} w-full`} placeholder="10-digit mobile" />
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.phone || '—'}</p>
              )}
            </div>
            <div>
              <p className={L}>Email</p>
              {editing ? (
                <Input type="email" value={partnerData.email || ''} onChange={e => onPartnerFieldChange('email', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="partner@email.com" />
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.email || '—'}</p>
              )}
            </div>
            <div>
              <p className={L}>Gender</p>
              {editing ? (
                <Select value={partnerData.gender || ''} onValueChange={v => onPartnerFieldChange('gender', v)} disabled={loading}>
                  <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{GENDER_OPTIONS.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.gender || '—'}</p>
              )}
            </div>
            <div>
              <p className={L}>Date of Birth</p>
              {editing ? (<Input 
  type="date" 
  value={partnerData.date_of_birth ? partnerData.date_of_birth.split('T')[0] : ''} 
                onChange={e => onPartnerFieldChange('date_of_birth', e.target.value)} disabled={loading} className={`${F} w-full`} />
              ) : (
<p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">
  {partnerData.date_of_birth 
    ? (() => { try { return format(parseISO(partnerData.date_of_birth), 'dd MMM yyyy'); } catch { return partnerData.date_of_birth; } })()
    : '—'}
</p>              )}
            </div>
            <div>
              <p className={L}>Relationship</p>
              {editing ? (
                <Select value={partnerData.relationship || 'Spouse'} onValueChange={v => onPartnerFieldChange('relationship', v)} disabled={loading}>
                  <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{REL_OPTIONS.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.relationship || '—'}</p>
              )}
            </div>
            <div>
              <p className={L}>Occupation</p>
              {editing ? (
                <Input value={partnerData.occupation || ''} onChange={e => onPartnerFieldChange('occupation', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="e.g. Software Engineer" />
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.occupation || '—'}</p>
              )}
            </div>
            <div>
              <p className={L}>Organization / Company</p>
              {editing ? (
                <Input value={partnerData.organization || ''} onChange={e => onPartnerFieldChange('organization', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="Company or institution" />
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100">{partnerData.organization || '—'}</p>
              )}
            </div>
          </div>
          <div>
            <p className={L}>Address</p>
            {editing ? (
              <Textarea value={partnerData.address || ''} onChange={e => onPartnerFieldChange('address', e.target.value)} disabled={loading} rows={2} className="text-sm border-slate-200 resize-none" placeholder="Partner's address" />
            ) : (
              <div className="text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-100 min-h-[48px]">{partnerData.address || '—'}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function PersonalInfoTab({
  profile,
  editing,
  formData,
  errors,
  loading,
  age,
  isMobile = false,
  cities = [],
  states = [],
  onFieldChange,
  partnerData,
  onPartnerFieldChange,
}: PersonalInfoTabProps) {
  const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
  const OCC_OPTIONS = OCCUPATION_CATEGORIES;
  const REL_OPTIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Friend', 'Relative', 'Guardian', 'Other'];

  const displayId = getDisplayId(profile.id);
  const displayName = profile.full_name || '—';
  const displayEmail = profile.email || '—';
  const displayPhone = `${profile.country_code || ''} ${profile.phone || ''}`.trim() || '—';
  const displayGender = profile.gender || '—';
  const displayDob = profile.date_of_birth
  ? (() => { try { return format(parseISO(profile.date_of_birth.substring(0,10) + 'T00:00:00'), 'dd MMM yyyy'); } catch { return profile.date_of_birth; } })()
  : '—';

  const maxDob = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate())
    .toISOString().split('T')[0];

  const defaultPartner: PartnerFormData = {
    full_name: (profile as any).partner_full_name || '',
    phone: (profile as any).partner_phone || '',
    email: (profile as any).partner_email || '',
    gender: (profile as any).partner_gender || '',
    date_of_birth: (profile as any).partner_date_of_birth || '',
    address: (profile as any).partner_address || '',
    occupation: (profile as any).partner_occupation || '',
    organization: (profile as any).partner_organization || '',
    relationship: (profile as any).partner_relationship || 'Spouse',
  };

  const currentPartner = partnerData ?? defaultPartner;
  const handlePartner = onPartnerFieldChange ?? (() => {});

  const F = 'h-8 text-[11px] rounded-md border-slate-200 focus:border-[#004aad]';
  const L_mobile = 'text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1';
  const RequiredStar = () => <span className="text-red-500 ml-0.5 text-[10px]">*</span>;
const [availableSubCategories, setAvailableSubCategories] = useState<OccupationSubCategory[]>([]);
useEffect(() => {
  if (formData.occupation_category) {
    setAvailableSubCategories(getSubCategoriesForCategory(formData.occupation_category));
  }
}, [formData.occupation_category]);
  // ── MOBILE VIEW ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="space-y-3 pb-4">

        {/* Profile banner */}
        <div className="bg-gradient-to-br from-[#004aad] via-[#004aad] to-[#002a7a] rounded-xl p-4 border border-[#004aad]/20 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-[#ffc107] flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-[#004aad]" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-white">{displayName}</h2>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-[9px] px-1.5 py-0 mt-0.5">
                <Hash className="h-2 w-2 inline mr-0.5" />{displayId}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {profile.gender && (
              <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
                <User className="h-3 w-3 text-[#ffc107]" />
                <span className="text-[10px] font-medium text-white">{profile.gender}</span>
              </div>
            )}
            {profile.occupation_category && (
              <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-[#ffc107]" />
                <span className="text-[10px] font-medium text-white">{profile.occupation_category}</span>
              </div>
            )}
            {profile.city && (
              <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#ffc107]" />
                <span className="text-[10px] font-medium text-white">{profile.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#004aad] rounded-lg shadow-sm"><User className="h-3.5 w-3.5 text-white" /></div>
              <span className="text-xs font-bold text-[#004aad] uppercase tracking-wider">Basic Information</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <p className={L_mobile}>Full Name <RequiredStar /></p>
                <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
              </div>
              <p className="text-sm font-bold text-slate-800">{displayName}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <p className={L_mobile}>Email <RequiredStar /></p>
                <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
              </div>
              <p className="text-xs text-slate-700 truncate">{displayEmail}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <p className={L_mobile}>Phone <RequiredStar /></p>
                <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
              </div>
              <p className="text-sm font-bold text-slate-800">{displayPhone}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                <p className={`${L_mobile} text-[#004aad]`}>Gender <RequiredStar /></p>
                <p className="text-sm font-bold text-slate-800 mt-1">{displayGender}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                <p className={`${L_mobile} text-[#ffc107]`}>Date of Birth <RequiredStar /></p>
                {editing ? (
                  <Input
                    type="date"
                    value={formData.date_of_birth || ''}
                    onChange={e => {
                      const sel = new Date(e.target.value);
                      const cut = new Date(maxDob);
                      if (sel > cut) return;
                      onFieldChange('date_of_birth', e.target.value);
                    }}
                    max={maxDob}
                    disabled={loading}
                    className={`${F} w-full mt-1`}
                  />
                ) : (
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-sm font-bold text-slate-800">{displayDob}</p>
                    {age && <span className="text-[9px] text-slate-400">({age}y)</span>}
                  </div>
                )}
                {errors.date_of_birth && <p className="text-[9px] text-red-500 mt-1">{errors.date_of_birth}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Occupation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] border-b border-[#ffc107]/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#ffc107] rounded-lg shadow-sm"><Briefcase className="h-3.5 w-3.5 text-[#004aad]" /></div>
              <span className="text-xs font-bold text-[#004aad] uppercase tracking-wider">Occupation</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className={L_mobile}>Category <RequiredStar /></p>
              {editing ? (
                <Select value={formData.occupation_category || ''} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
                  <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {OCC_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">
                        <span className="flex items-center gap-1">{o.icon}{o.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.occupation_category || '—'}</p>
              )}
            </div>
            {editing && formData.occupation_category && availableSubCategories.length > 0 && (
              <div>
                <p className={L_mobile}>Sub-Category</p>
                <Select
                  value={formData.exact_occupation || ''}
                  onValueChange={v => onFieldChange('exact_occupation', v === 'none' ? '' : v)}
                  disabled={loading}
                >
                  <SelectTrigger className={`${F} w-full`}>
                    <SelectValue placeholder="Select sub-category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">None</SelectItem>
                    {availableSubCategories.map(s => (
                      <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <p className={L_mobile}>Occupation</p>
              {editing ? (
                <Input value={formData.occupation || ''} onChange={e => onFieldChange('occupation', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="Profession" />
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.occupation || '—'}</p>
              )}
              {errors.occupation && <p className="text-[9px] text-red-500 mt-1">{errors.occupation}</p>}
            </div>
            <div>
              <p className={L_mobile}>Details</p>
              {editing ? (
                <Textarea value={formData.exact_occupation || ''} onChange={e => onFieldChange('exact_occupation', e.target.value)} disabled={loading} rows={2} className="text-sm border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107]" placeholder="Job title, company..." />
              ) : (
                <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 min-h-[60px]">{profile.exact_occupation || '—'}</div>
              )}
            </div>
            <OccupationExtraFields
              category={editing ? (formData.occupation_category || '') : (profile.occupation_category || '')}
              formData={formData}
              editing={editing}
              loading={loading}
              isMobile={isMobile}
              onFieldChange={onFieldChange}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500 rounded-lg shadow-sm"><AlertCircle className="h-3.5 w-3.5 text-white" /></div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Emergency Contact</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className={L_mobile}>Name</p>
                {editing ? (
                  <Input value={formData.emergency_contact_name || ''} onChange={e => onFieldChange('emergency_contact_name', e.target.value)} disabled={loading} className={`${F} w-full`} placeholder="Contact name" />
                ) : (
                  <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.emergency_contact_name || '—'}</p>
                )}
              </div>
              <div>
                <p className={L_mobile}>Phone</p>
                {editing ? (
                  <Input value={formData.emergency_contact_phone || ''} onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} disabled={loading} maxLength={10} className={`${F} w-full`} placeholder="Contact phone" />
                ) : (
                  <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.emergency_contact_phone || '—'}</p>
                )}
              </div>
            </div>
            <div>
              <p className={L_mobile}>Relationship</p>
              {editing ? (
                <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
                  <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{REL_OPTIONS.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.emergency_contact_relation || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Permanent Address */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500 rounded-lg shadow-sm"><MapPin className="h-3.5 w-3.5 text-white" /></div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Permanent Address</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className={L_mobile}>Address <RequiredStar /></p>
              {editing ? (
                <Textarea value={formData.address || ''} onChange={e => onFieldChange('address', e.target.value)} disabled={loading} rows={2} className={`text-sm border-slate-200 ${errors.address ? 'border-red-300' : ''}`} placeholder="Complete address" />
              ) : (
                <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.address || '—'}</div>
              )}
              {errors.address && <p className="text-[9px] text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className={L_mobile}>City <RequiredStar /></p>
                {editing ? (
                  cities.length > 0 ? (
                    <Select
                      value={formData.city || ''}
                      onValueChange={v => onFieldChange('city', v)}
                      disabled={loading}
                    >
                      <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="City" /></SelectTrigger>
                      <SelectContent>{cities.map(c => <SelectItem key={c.id} value={c.name} className="text-xs">{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Input value={formData.city || ''} onChange={e => onFieldChange('city', e.target.value)} disabled={loading} className={`${F} w-full`} />
                  )
                ) : (
                  <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.city || '—'}</p>
                )}
                {errors.city && <p className="text-[9px] text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <p className={L_mobile}>State <RequiredStar /></p>
                {editing ? (
                  states.length > 0 ? (
                    <Select
                      value={formData.state || ''}
                      onValueChange={v => onFieldChange('state', v)}
                      disabled={loading}
                    >
                      <SelectTrigger className={`${F} w-full`}><SelectValue placeholder="State" /></SelectTrigger>
                      <SelectContent>{states.map(s => <SelectItem key={s.id} value={s.name} className="text-xs">{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Input value={formData.state || ''} onChange={e => onFieldChange('state', e.target.value)} disabled={loading} className={`${F} w-full`} />
                  )
                ) : (
                  <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.state || '—'}</p>
                )}
                {errors.state && <p className="text-[9px] text-red-500 mt-1">{errors.state}</p>}
              </div>
              <div>
                <p className={L_mobile}>Pincode <RequiredStar /></p>
                {editing ? (
                  <Input value={formData.pincode || ''} onChange={e => onFieldChange('pincode', e.target.value)} disabled={loading} className={`${F} w-full ${errors.pincode ? 'border-red-300' : ''}`} />
                ) : (
                  <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">{profile.pincode || '—'}</p>
                )}
                {errors.pincode && <p className="text-[9px] text-red-500 mt-1">{errors.pincode}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Partner Details */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4">
          <PartnerSection
            editing={editing}
            loading={loading}
            isMobile={isMobile}
            partnerData={currentPartner}
            profile={profile}
            onPartnerFieldChange={handlePartner}
          />
        </div>

        {editing && (
          <div className="bg-[#e6f0ff] border border-[#004aad]/30 rounded-xl p-3 flex items-center gap-2">
            <PenLine className="h-4 w-4 text-[#004aad]" />
            <p className="text-xs text-[#004aad] font-medium">You are editing your profile</p>
          </div>
        )}
      </div>
    );
  }

  // ── DESKTOP VIEW ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-6">

      {/* Profile header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-[#004aad] to-[#002a7a] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-xl bg-[#ffc107] flex items-center justify-center shadow-lg border border-white/30">
              <User className="h-8 w-8 text-[#004aad]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{displayName}</h3>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{displayEmail}</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{displayPhone}</span>
              </div>
            </div>
            <Badge className="bg-[#ffc107] text-[#004aad] border-none text-xs px-3 py-1 shadow-md">
              <Hash className="h-3 w-3 inline mr-1" />#{displayId}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-5">

          {/* Basic Info */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
              <SectionHeader icon={User} title="Basic Information" color="blue" />
            </CardHeader>
            <CardContent className="px-6 py-4">
              <div className="space-y-1">
                <InfoRow label="Gender" value={displayGender} icon={Heart} required />
                {editing ? (
                  <div className="py-2 border-t border-slate-100">
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Date of Birth <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      value={formData.date_of_birth || ''}
                      onChange={e => {
                        const sel = new Date(e.target.value);
                        if (sel > new Date(maxDob)) return;
                        onFieldChange('date_of_birth', e.target.value);
                      }}
                      max={maxDob}
                      disabled={loading}
                      className="border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107]"
                    />
                    {formData.date_of_birth && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Age: {Math.floor((Date.now() - new Date(formData.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} yrs
                      </p>
                    )}
                    {errors.date_of_birth && <p className="text-xs text-red-500 mt-1">{errors.date_of_birth}</p>}
                  </div>
                ) : (
                  <InfoRow label="Date of Birth" value={displayDob} icon={Calendar} badge={age ? `${age}y` : undefined} required last />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
              <SectionHeader icon={AlertCircle} title="Emergency Contact" color="rose" />
            </CardHeader>
            <CardContent className="px-6 py-4">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Contact Name</Label>
                    <Input value={formData.emergency_contact_name || ''} onChange={e => onFieldChange('emergency_contact_name', e.target.value)} disabled={loading} className="border-slate-200 focus:ring-2 focus:ring-rose-200" placeholder="Full name" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Phone</Label>
                      <Input value={formData.emergency_contact_phone || ''} onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} disabled={loading} maxLength={10} className="border-slate-200 focus:ring-2 focus:ring-rose-200" placeholder="Phone number" />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Relationship</Label>
                      <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
                        <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-rose-200"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{REL_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <InfoRow label="Name" value={profile.emergency_contact_name || '—'} icon={User} />
                  <InfoRow label="Phone" value={profile.emergency_contact_phone || '—'} icon={Phone} />
                  <InfoRow label="Relationship" value={profile.emergency_contact_relation || '—'} icon={Users} last />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partner Details */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardContent className="px-6 py-4">
              <PartnerSection
                editing={editing}
                loading={loading}
                isMobile={false}
                partnerData={currentPartner}
                profile={profile}
                onPartnerFieldChange={handlePartner}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Occupation */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] border-b border-[#ffc107]/30">
              <SectionHeader icon={Briefcase} title="Occupation" color="gold" />
            </CardHeader>
            <CardContent className="px-6 py-4">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Category <span className="text-red-500">*</span></Label>
                    <Select value={formData.occupation_category || ''} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
                      <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-[#ffc107]"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {OCC_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value}>
                            <span className="flex items-center gap-1">{o.icon}{o.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.occupation_category && availableSubCategories.length > 0 && (
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Sub-Category</Label>
                      <Select
                        value={formData.exact_occupation || ''}
                        onValueChange={v => onFieldChange('exact_occupation', v === 'none' ? '' : v)}
                        disabled={loading}
                      >
                        <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-[#ffc107]">
                          <SelectValue placeholder="Select sub-category (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="text-xs">None</SelectItem>
                          {availableSubCategories.map(s => (
                            <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Occupation</Label>
                    <Input value={formData.occupation || ''} onChange={e => onFieldChange('occupation', e.target.value)} disabled={loading} className={`border-slate-200 focus:ring-2 focus:ring-[#ffc107] ${errors.occupation ? 'border-red-300' : ''}`} placeholder="Your profession" />
                    {errors.occupation && <p className="text-xs text-red-500 mt-1.5">{errors.occupation}</p>}
                  </div>
                  {/* <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Exact Details</Label>
                    <Textarea value={formData.exact_occupation || ''} onChange={e => onFieldChange('exact_occupation', e.target.value)} disabled={loading} rows={2} className="border-slate-200 focus:ring-2 focus:ring-[#ffc107] resize-none" placeholder="Job title, responsibilities..." />
                  </div> */}
                  <OccupationExtraFields
                    category={formData.occupation_category || ''}
                    formData={formData}
                    editing={editing}
                    loading={loading}
                    isMobile={false}
                    onFieldChange={onFieldChange}
                  />
                </div>
           ) : (
  <div className="space-y-1">
    {(() => {
      const cat = profile.occupation_category || '';
      const rows = [
        { show: true, label: "Category", value: profile.occupation_category || '—', icon: Building, required: true },
        { show: !!(profile.occupation), label: "Occupation", value: profile.occupation || '', icon: Briefcase },
        { show: !!(profile.exact_occupation), label: "Exact Details", value: profile.exact_occupation || '', icon: Shield },
        // Organization - show for all categories if filled
        { show: !!(profile as any).organization, label: 
            cat === 'Student' ? 'College / University' :
            cat === 'Working Professional' ? 'Company / Organization' :
            cat === 'Business Owner' ? 'Business Name' :
            cat === 'Government Employee' ? 'Department / Office' : 'Organization',
          value: (profile as any).organization || '', icon: Building },
        // Student-only
        { show: cat === 'Student' && !!(profile as any).course_duration, label: "Course Duration", value: (profile as any).course_duration || '', icon: Shield },
        { show: cat === 'Student' && !!(profile as any).student_id, label: "Student ID", value: (profile as any).student_id || '', icon: Hash },
        // Working Professional / Business / Consultant only
        { show: ['Working Professional','Business Owner','Consultant'].includes(cat) && !!(profile as any).years_of_experience, label: "Experience", value: `${(profile as any).years_of_experience} yrs`, icon: Award },
        { show: ['Working Professional','Business Owner','Consultant'].includes(cat) && !!(profile as any).monthly_income, label: "Monthly Income", value: `₹${(profile as any).monthly_income}`, icon: Shield },
        // Government Employee only
        { show: cat === 'Government Employee' && !!(profile as any).employee_id, label: "Employee ID", value: (profile as any).employee_id || '', icon: Hash },
        // Freelancer only
        { show: cat === 'Freelancer / Self-Employed' && !!(profile as any).portfolio_url, label: "Portfolio URL", value: (profile as any).portfolio_url || '', icon: Shield },
        // Work mode & shift — show for all if filled
        { show: !!(profile as any).work_mode, label: "Work Mode", value: (profile as any).work_mode || '', icon: Briefcase },
        { show: !!(profile as any).shift_timing, label: "Shift Timing", value: (profile as any).shift_timing || '', icon: Shield },
      ].filter(r => r.show);
      
      return rows.map((r, i) => (
        <InfoRow 
          key={r.label}
          label={r.label} 
          value={r.value} 
          icon={r.icon} 
          required={r.required}
          last={i === rows.length - 1}
        />
      ));
    })()}
  </div>
)}
            </CardContent>
          </Card>

          {/* Permanent Address */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
              <SectionHeader icon={MapPin} title="Permanent Address" color="emerald" />
            </CardHeader>
            <CardContent className="px-6 py-4">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Address <span className="text-red-500">*</span></Label>
                    <Textarea value={formData.address || ''} onChange={e => onFieldChange('address', e.target.value)} disabled={loading} rows={2} className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.address ? 'border-red-300' : ''}`} placeholder="Complete address" />
                    {errors.address && <p className="text-xs text-red-500 mt-1.5">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1.5 block">City <span className="text-red-500">*</span></Label>
                      {cities.length > 0 ? (
                        <Select
                          value={formData.city || ''}
                          onValueChange={v => onFieldChange('city', v)}
                          disabled={loading}
                        >
                          <SelectTrigger className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.city ? 'border-red-300' : ''}`}>
                            <SelectValue placeholder="City" />
                          </SelectTrigger>
                          <SelectContent>{cities.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <Input value={formData.city || ''} onChange={e => onFieldChange('city', e.target.value)} disabled={loading} className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.city ? 'border-red-300' : ''}`} />
                      )}
                      {errors.city && <p className="text-xs text-red-500 mt-1.5">{errors.city}</p>}
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1.5 block">State <span className="text-red-500">*</span></Label>
                      {states.length > 0 ? (
                        <Select
                          value={formData.state || ''}
                          onValueChange={v => onFieldChange('state', v)}
                          disabled={loading}
                        >
                          <SelectTrigger className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.state ? 'border-red-300' : ''}`}>
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                          <SelectContent>{states.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <Input value={formData.state || ''} onChange={e => onFieldChange('state', e.target.value)} disabled={loading} className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.state ? 'border-red-300' : ''}`} />
                      )}
                      {errors.state && <p className="text-xs text-red-500 mt-1.5">{errors.state}</p>}
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Pincode <span className="text-red-500">*</span></Label>
                      <Input value={formData.pincode || ''} onChange={e => onFieldChange('pincode', e.target.value)} disabled={loading} className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.pincode ? 'border-red-300' : ''}`} />
                      {errors.pincode && <p className="text-xs text-red-500 mt-1.5">{errors.pincode}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <InfoRow label="Address" value={profile.address || '—'} icon={Home} required />
                  <InfoRow label="City" value={profile.city || '—'} icon={MapPin} required />
                  <InfoRow label="State" value={profile.state || '—'} icon={Building} required />
                  <InfoRow label="Pincode" value={profile.pincode || '—'} icon={Mail} required last />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {editing && (
        <div className="mt-4 p-3 bg-[#e6f0ff] border border-[#004aad]/30 rounded-lg flex items-center gap-2">
          <PenLine className="h-4 w-4 text-[#004aad]" />
          <p className="text-xs text-[#004aad]">You are in edit mode. Changes will be saved when you click the Save button.</p>
        </div>
      )}
    </div>
  );
}