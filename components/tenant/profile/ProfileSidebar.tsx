



// // components/tenant/profile/ProfileSidebar.tsx
// import { Card, CardContent } from '@/components/ui/card';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { 
//   Mail, Phone, Home, Bed, Calendar, User, AlertCircle, X, 
//   Edit, MapPin, Shield, Heart, Award, Clock 
// } from 'lucide-react';
// import { format, parseISO } from 'date-fns';
// import { TenantProfile } from '@/lib/tenantDetailsApi';

// interface ProfileSidebarProps {
//   profile: TenantProfile;
//   age: number | null;
//   editing: boolean;
//   onEdit: () => void;
//   isMobile?: boolean;
//   onClose?: () => void;
// }

// // Info Item Component for consistent styling
// const InfoItem = ({ icon: Icon, children, highlight = false }: { 
//   icon: any; 
//   children: React.ReactNode;
//   highlight?: boolean;
// }) => (
//   <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${highlight ? 'bg-[#e6f0ff]' : 'hover:bg-slate-50'}`}>
//     <div className={`p-1.5 rounded-lg ${highlight ? 'bg-[#004aad]' : 'bg-slate-100'}`}>
//       <Icon className={`h-3.5 w-3.5 ${highlight ? 'text-white' : 'text-slate-500'}`} />
//     </div>
//     <div className="flex-1 text-sm text-slate-600">{children}</div>
//   </div>
// );

// export default function ProfileSidebar({ 
//   profile, 
//   age, 
//   editing, 
//   onEdit, 
//   isMobile = false,
//   onClose 
// }: ProfileSidebarProps) {
  
//   // Get initials for avatar fallback
//   const getInitials = () => {
//     if (!profile.full_name) return "U";
//     return profile.full_name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .substring(0, 2);
//   };

//   // Format date safely
//   const formatDate = (dateString?: string) => {
//     if (!dateString) return 'N/A';
//     try {
//       return format(parseISO(dateString), "dd MMM yyyy");
//     } catch {
//       return 'Invalid Date';
//     }
//   };

//   const content = (
//     <>
//       {/* Mobile Header with Close Button */}
//       {isMobile && onClose && (
//         <div className="sticky top-0 bg-white z-10 pb-2 mb-2 border-b border-slate-100">
//           <div className="flex justify-between items-center">
//             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Profile Overview</h3>
//             <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-[#e6f0ff] hover:text-[#004aad]">
//               <X className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Profile Header with Gradient */}
//       <div className="relative mb-6">
//         {/* Background Decoration */}
//         <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/5 via-transparent to-[#ffc107]/5 rounded-2xl"></div>
        
//         <div className="relative text-center pt-2">
//           {/* Avatar with Gold Ring */}
//           <div className="relative inline-block mb-4">
//             <div className="absolute -inset-1 bg-gradient-to-r from-[#004aad] to-[#ffc107] rounded-full opacity-70 blur-sm"></div>
//             <Avatar className={`${isMobile ? 'h-20 w-20' : 'h-32 w-32'} border-4 border-white shadow-xl relative mx-auto`}>
//               <AvatarImage 
//                 src={profile.photo_url || ""} 
//                 alt={profile.full_name} 
//                 className="object-cover"
//               />
//               <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-[#004aad] to-[#002a7a] text-white">
//                 {getInitials()}
//               </AvatarFallback>
//             </Avatar>
//           </div>

//           {/* Name */}
//           <h2 className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold text-slate-800 mb-2`}>
//             {profile.full_name}
//           </h2>

//           {/* Badges Grid */}
//           <div className="flex flex-wrap gap-2 justify-center mb-3">
//             <Badge className={`${profile.is_active 
//               ? 'bg-green-50 text-green-700 border-green-200' 
//               : 'bg-slate-50 text-slate-600 border-slate-200'} 
//               border text-xs px-3 py-1 font-medium`}>
//               <Shield className={`h-3 w-3 mr-1 ${profile.is_active ? 'text-green-500' : 'text-slate-400'}`} />
//               {profile.is_active ? "ACTIVE" : "INACTIVE"}
//             </Badge>
            
//             <Badge className="bg-[#e6f0ff] text-[#004aad] border-[#004aad]/20 text-xs px-3 py-1 font-medium">
//               <Award className="h-3 w-3 mr-1" />
//               {profile.occupation_category || "Tenant"}
//             </Badge>
            
//             {profile.portal_access_enabled && (
//               <Badge className="bg-[#fff9e6] text-[#ffc107] border-[#ffc107]/20 text-xs px-3 py-1 font-medium">
//                 <User className="h-3 w-3 mr-1" />
//                 Portal Access
//               </Badge>
//             )}
//           </div>

//           {/* Quick Stats */}
//           {/* {age && (
//             <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
//               <Clock className="h-3 w-3" />
//               <span>{age} years old</span>
//               <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
//               <Heart className="h-3 w-3 text-[#ffc107]" />
//               <span>{profile.gender}</span>
//             </div>
//           )} */}
//         </div>
//       </div>

//       {/* Contact & Info Section */}
//       <div className="space-y-2 mb-6">
//         <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
//           Contact Information
//         </h4>
        
//         <InfoItem icon={Mail}>
//           <span className="text-slate-600 break-all">{profile.email}</span>
//         </InfoItem>
        
//         <InfoItem icon={Phone}>
//           <span className="text-slate-600">{profile.country_code} {profile.phone}</span>
//         </InfoItem>
//       </div>

//       {/* Accommodation Section */}
//       {(profile.room_number || profile.bed_number) && (
//         <div className="space-y-2 mb-6">
//           <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
//             Current Accommodation
//           </h4>
          
//           {profile.room_number && (
//             <InfoItem icon={Home} highlight={!!profile.room_number}>
//               <div>
//                 <span className="text-slate-600">Room {profile.room_number}</span>
//                 {profile.floor && <span className="text-xs text-slate-400 ml-2">Floor {profile.floor}</span>}
//               </div>
//             </InfoItem>
//           )}
          
//           {profile.bed_number && (
//             <InfoItem icon={Bed}>
//               <span className="text-slate-600">
//                 Bed #{profile.bed_number}
//                 {profile.bed_type && <span className="text-xs text-slate-400 ml-2">({profile.bed_type})</span>}
//               </span>
//             </InfoItem>
//           )}
//         </div>
//       )}

//       {/* Dates Section */}
//       <div className="space-y-2 mb-6">
//         <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
//           Important Dates
//         </h4>
        
//         <InfoItem icon={Calendar}>
//           <div>
//             <span className="text-slate-600">Check-in: {formatDate(profile.check_in_date)}</span>
//             {profile.bed_assigned_at && (
//               <span className="text-xs text-slate-400 block mt-0.5">
//                 Assigned: {formatDate(profile.bed_assigned_at)}
//               </span>
//             )}
//           </div>
//         </InfoItem>

//         {profile.date_of_birth && (
//           <InfoItem icon={User}>
//             <span className="text-slate-600">Born: {formatDate(profile.date_of_birth)}</span>
//           </InfoItem>
//         )}
//       </div>

//       {/* Emergency Contact */}
//       {profile.emergency_contact_name && (
//         <div className="mt-6 pt-6 border-t border-slate-100">
//           <div className="flex items-center gap-2 mb-4">
//             <div className="p-1.5 bg-rose-50 rounded-lg">
//               <AlertCircle className="h-4 w-4 text-rose-500" />
//             </div>
//             <h4 className="font-medium text-sm text-slate-700">Emergency Contact</h4>
//           </div>
          
//           <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100">
//             <div className="space-y-3">
//               <div>
//                 <p className="text-xs text-rose-500 font-medium mb-1">Name</p>
//                 <p className="text-sm font-semibold text-slate-800">{profile.emergency_contact_name}</p>
//               </div>
              
//               <div>
//                 <p className="text-xs text-rose-500 font-medium mb-1">Phone</p>
//                 <p className="text-sm text-slate-600">{profile.emergency_contact_phone}</p>
//               </div>
              
//               <div>
//                 <Badge variant="outline" className="bg-white text-rose-600 border-rose-200 text-xs">
//                   {profile.emergency_contact_relation}
//                 </Badge>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Profile Button */}
//       {!editing && (
//         <Button 
//           className="w-full mt-6 bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#003a8d] hover:to-[#001a5a] text-white border-none shadow-lg hover:shadow-xl transition-all duration-200" 
//           onClick={onEdit} 
//           size={isMobile ? "default" : "lg"}
//         >
//           <Edit className="mr-2 h-4 w-4" />
//           Edit Profile
//         </Button>
//       )}

//       {/* Profile ID Badge */}
//       <div className="mt-4 text-center">
//         <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[8px] px-2 py-0">
//           Profile ID: #{profile.id}
//         </Badge>
//       </div>
//     </>
//   );

//   // For mobile, just render the content without Card wrapper (Card is in Sheet)
//   if (isMobile) {
//     return <div className="space-y-4 p-2">{content}</div>;
//   }

//   // For desktop, keep the Card wrapper with sticky positioning
//   return (
//     <Card className="sticky top-6 border-none shadow-lg bg-gradient-to-b from-white to-slate-50/50 overflow-hidden">
//       {/* Decorative Elements */}
//       <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#004aad]/5 to-transparent rounded-full -mr-16 -mt-16"></div>
//       <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#ffc107]/5 to-transparent rounded-full -ml-12 -mb-12"></div>
      
//       <CardContent className="pt-6 relative z-10">
//         {content}
//       </CardContent>
//     </Card>
//   );
// }

// components/tenant/profile/ProfileSidebar.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, Phone, Home, Bed, Calendar, User, AlertCircle, X, 
  Edit, MapPin, Shield, Heart, Award, Clock 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile } from '@/lib/tenantDetailsApi';

interface ProfileSidebarProps {
  profile: TenantProfile;
  age: number | null;
  editing: boolean;
  onEdit: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

// Info Item Component for consistent styling
const InfoItem = ({ icon: Icon, children, highlight = false }: { 
  icon: any; 
  children: React.ReactNode;
  highlight?: boolean;
}) => (
  <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${highlight ? 'bg-[#e6f0ff]' : 'hover:bg-slate-50'}`}>
    <div className={`p-1.5 rounded-lg ${highlight ? 'bg-[#004aad]' : 'bg-slate-100'}`}>
      <Icon className={`h-3.5 w-3.5 ${highlight ? 'text-white' : 'text-slate-500'}`} />
    </div>
    <div className="flex-1 text-sm text-slate-600">{children}</div>
  </div>
);

export default function ProfileSidebar({ 
  profile, 
  age, 
  editing, 
  onEdit, 
  isMobile = false,
  onClose 
}: ProfileSidebarProps) {
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!profile.full_name) return "U";
    return profile.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), "dd MMM yyyy");
    } catch {
      return 'Invalid Date';
    }
  };

  // ── MOBILE VIEW — Compact gradient card, always visible above tabs ──────────
  if (isMobile) {
    return (
      <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] rounded-2xl p-4 shadow-lg mb-2">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/40 to-[#ffc107] rounded-full blur-sm" />
            <Avatar className="h-14 w-14 border-2 border-white shadow-lg relative">
              <AvatarImage
                src={profile.photo_url || ""}
                alt={profile.full_name}
                className="object-cover"
              />
              <AvatarFallback className="text-lg font-bold bg-[#002a7a] text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name + Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base truncate">{profile.full_name}</h2>

            {/* Quick info row */}
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {profile.room_number && (
                <span className="flex items-center gap-1 text-white/80 text-[11px]">
                  <Home className="h-3 w-3" /> Room {profile.room_number}
                </span>
              )}
              {profile.bed_number && (
                <span className="flex items-center gap-1 text-white/80 text-[11px]">
                  <Bed className="h-3 w-3" /> Bed {profile.bed_number}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              <Badge
                className={`text-[9px] px-2 py-0 border-0 font-semibold ${
                  profile.is_active
                    ? 'bg-green-400/20 text-green-300'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                <Shield className="h-2.5 w-2.5 mr-0.5" />
                {profile.is_active ? "ACTIVE" : "INACTIVE"}
              </Badge>

              {profile.occupation_category && (
                <Badge className="text-[9px] px-2 py-0 border-0 bg-[#ffc107]/20 text-[#ffc107] font-semibold">
                  <Award className="h-2.5 w-2.5 mr-0.5" />
                  {profile.occupation_category}
                </Badge>
              )}

              {profile.portal_access_enabled && (
                <Badge className="text-[9px] px-2 py-0 border-0 bg-white/15 text-white/80 font-semibold">
                  <User className="h-2.5 w-2.5 mr-0.5" />
                  Portal
                </Badge>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {!editing && (
            <button
              onClick={onEdit}
              className="flex-shrink-0 flex flex-col items-center gap-1 bg-white/15 hover:bg-white/25 rounded-xl px-3 py-2 transition-colors"
            >
              <Edit className="h-4 w-4 text-white" />
              <span className="text-[9px] text-white/80 font-medium">Edit</span>
            </button>
          )}
        </div>

        {/* Contact row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20 overflow-hidden">
          <div className="flex items-center gap-1.5 text-white/70 text-[11px] flex-shrink-0">
            <Phone className="h-3 w-3" />
            <span>{profile.country_code} {profile.phone}</span>
          </div>
          {profile.email && (
            <div className="flex items-center gap-1.5 text-white/70 text-[11px] min-w-0">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
          )}
        </div>

        {/* Check-in date if available */}
        {profile.check_in_date && (
          <div className="flex items-center gap-1.5 text-white/60 text-[10px] mt-2">
            <Calendar className="h-3 w-3" />
            <span>Check-in: {formatDate(profile.check_in_date)}</span>
          </div>
        )}
      </div>
    );
  }

  // ── DESKTOP VIEW — Full sidebar with Card wrapper ───────────────────────────
  const content = (
    <>
      {/* Profile Header with Gradient */}
      <div className="relative mb-6">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/5 via-transparent to-[#ffc107]/5 rounded-2xl"></div>
        
        <div className="relative text-center pt-2">
          {/* Avatar with Gold Ring */}
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#004aad] to-[#ffc107] rounded-full opacity-70 blur-sm"></div>
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl relative mx-auto">
              <AvatarImage 
                src={profile.photo_url || ""} 
                alt={profile.full_name} 
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-[#004aad] to-[#002a7a] text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Name */}
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            {profile.full_name}
          </h2>

          {/* Badges Grid */}
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            <Badge className={`${profile.is_active 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-slate-50 text-slate-600 border-slate-200'} 
              border text-xs px-3 py-1 font-medium`}>
              <Shield className={`h-3 w-3 mr-1 ${profile.is_active ? 'text-green-500' : 'text-slate-400'}`} />
              {profile.is_active ? "ACTIVE" : "INACTIVE"}
            </Badge>
            
            <Badge className="bg-[#e6f0ff] text-[#004aad] border-[#004aad]/20 text-xs px-3 py-1 font-medium">
              <Award className="h-3 w-3 mr-1" />
              {profile.occupation_category || "Tenant"}
            </Badge>
            
            {profile.portal_access_enabled && (
              <Badge className="bg-[#fff9e6] text-[#ffc107] border-[#ffc107]/20 text-xs px-3 py-1 font-medium">
                <User className="h-3 w-3 mr-1" />
                Portal Access
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Info Section */}
      <div className="space-y-2 mb-6">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
          Contact Information
        </h4>
        
        <InfoItem icon={Mail}>
          <span className="text-slate-600 break-all">{profile.email}</span>
        </InfoItem>
        
        <InfoItem icon={Phone}>
          <span className="text-slate-600">{profile.country_code} {profile.phone}</span>
        </InfoItem>
      </div>

      {/* Accommodation Section */}
      {(profile.room_number || profile.bed_number) && (
        <div className="space-y-2 mb-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
            Current Accommodation
          </h4>
          
          {profile.room_number && (
            <InfoItem icon={Home} highlight={!!profile.room_number}>
              <div>
                <span className="text-slate-600">Room {profile.room_number}</span>
                {profile.floor && <span className="text-xs text-slate-400 ml-2">Floor {profile.floor}</span>}
              </div>
            </InfoItem>
          )}
          
          {profile.bed_number && (
            <InfoItem icon={Bed}>
              <span className="text-slate-600">
                Bed #{profile.bed_number}
                {profile.bed_type && <span className="text-xs text-slate-400 ml-2">({profile.bed_type})</span>}
              </span>
            </InfoItem>
          )}
        </div>
      )}

      {/* Dates Section */}
      <div className="space-y-2 mb-6">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
          Important Dates
        </h4>
        
        <InfoItem icon={Calendar}>
          <div>
            <span className="text-slate-600">Check-in: {formatDate(profile.check_in_date)}</span>
            {profile.bed_assigned_at && (
              <span className="text-xs text-slate-400 block mt-0.5">
                Assigned: {formatDate(profile.bed_assigned_at)}
              </span>
            )}
          </div>
        </InfoItem>

        {profile.date_of_birth && (
          <InfoItem icon={User}>
            <span className="text-slate-600">Born: {formatDate(profile.date_of_birth)}</span>
          </InfoItem>
        )}
      </div>

      {/* Emergency Contact */}
      {profile.emergency_contact_name && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-rose-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </div>
            <h4 className="font-medium text-sm text-slate-700">Emergency Contact</h4>
          </div>
          
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-rose-500 font-medium mb-1">Name</p>
                <p className="text-sm font-semibold text-slate-800">{profile.emergency_contact_name}</p>
              </div>
              
              <div>
                <p className="text-xs text-rose-500 font-medium mb-1">Phone</p>
                <p className="text-sm text-slate-600">{profile.emergency_contact_phone}</p>
              </div>
              
              <div>
                <Badge variant="outline" className="bg-white text-rose-600 border-rose-200 text-xs">
                  {profile.emergency_contact_relation}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Button */}
      {!editing && (
        <Button 
          className="w-full mt-6 bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#003a8d] hover:to-[#001a5a] text-white border-none shadow-lg hover:shadow-xl transition-all duration-200" 
          onClick={onEdit} 
          size="lg"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      )}

      {/* Profile ID Badge */}
      <div className="mt-4 text-center">
        <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[8px] px-2 py-0">
          Profile ID: #{profile.id}
        </Badge>
      </div>
    </>
  );

  return (
    <Card className="sticky top-6 border-none shadow-lg bg-gradient-to-b from-white to-slate-50/50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#004aad]/5 to-transparent rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#ffc107]/5 to-transparent rounded-full -ml-12 -mb-12"></div>
      
      <CardContent className="pt-6 relative z-10">
        {content}
      </CardContent>
    </Card>
  );
}