


// import { Card, CardContent } from '@/components/ui/card';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Mail, Phone, Home, Bed, Calendar, User, AlertCircle, X } from 'lucide-react';
// import { format, parseISO } from 'date-fns';
// import { TenantProfile } from '@/lib/tenantDetailsApi';
// import { Edit } from 'lucide-react';

// interface ProfileSidebarProps {
//   profile: TenantProfile;
//   age: number | null;
//   editing: boolean;
//   onEdit: () => void;
//   isMobile?: boolean;
//   onClose?: () => void;
// }

// export default function ProfileSidebar({ 
//   profile, 
//   age, 
//   editing, 
//   onEdit, 
//   isMobile = false,
//   onClose 
// }: ProfileSidebarProps) {
//   const content = (
//     <>
//       {/* Close button for mobile sheet header */}
//       {isMobile && onClose && (
//         <div className="flex justify-end mb-2">
//           <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
//             <X className="h-4 w-4" />
//           </Button>
//         </div>
//       )}

//       <div className="text-center mb-6">
// <Avatar className={`${isMobile ? 'h-16 w-16' : 'h-28 w-28 md:h-32 md:w-32'} mx-auto mb-4`}>          <AvatarImage src={profile.photo_url || ""} alt={profile.full_name} />
//           <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-purple-100">
//             {profile.full_name
//               ? profile.full_name
//                 .split(" ")
//                 .map((n) => n[0])
//                 .join("")
//               : "U"}
//           </AvatarFallback>
//         </Avatar>
// <h2 className={`${isMobile ? 'text-base' : 'text-xl md:text-2xl'} font-bold mb-2`}>{profile.full_name}</h2>        <div className="flex flex-wrap gap-2 justify-center">
//           <Badge variant={profile.is_active ? "default" : "secondary"}>
//             {profile.is_active ? "ACTIVE" : "INACTIVE"}
//           </Badge>
//           <Badge variant="outline" className="bg-blue-50">
//             {profile.occupation_category || "Tenant"}
//           </Badge>
//           {profile.portal_access_enabled && (
//             <Badge variant="outline" className="bg-green-50">
//               Portal Access
//             </Badge>
//           )}
//         </div>
//       </div>

//       <div className="space-y-3">
//         <div className="flex items-center gap-3 text-sm">
//           <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
//           <span className="text-gray-600 truncate">{profile.email}</span>
//         </div>
//         <div className="flex items-center gap-3 text-sm">
//           <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
//           <span className="text-gray-600">{profile.country_code} {profile.phone}</span>
//         </div>
//         {profile.room_number && (
//           <div className="flex items-center gap-3 text-sm">
//             <Home className="h-4 w-4 text-gray-400 flex-shrink-0" />
//             <span className="text-gray-600">Room {profile.room_number}</span>
//           </div>
//         )}
//         {profile.bed_number && (
//           <div className="flex items-center gap-3 text-sm ml-7">
//             <Bed className="h-3 w-3 text-gray-400 flex-shrink-0" />
//             <span className="text-gray-600">Bed {profile.bed_number}</span>
//           </div>
//         )}
//         <div className="flex items-center gap-3 text-sm">
//           <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
//           <span className="text-gray-600">
//             Joined - {format(parseISO(profile.check_in_date), "dd MMM yyyy")}
//           </span>
//         </div>
//         {profile.date_of_birth && (
//           <div className="flex items-center gap-3 text-sm">
//             <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
//             <span className="text-gray-600">
//               {age} years • {profile.gender}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Emergency Contact */}
//       {profile.emergency_contact_name && (
//         <div className="mt-6 pt-6 border-t">
//           <div className="flex items-center gap-2 mb-3">
//             <AlertCircle className="h-4 w-4 text-amber-600" />
//             <h4 className="font-medium text-sm">Emergency Contact</h4>
//           </div>
//           <div className="space-y-2 text-sm">
//             <p className="font-medium">{profile.emergency_contact_name}</p>
//             <p className="text-gray-600">{profile.emergency_contact_phone}</p>
//             <Badge variant="outline" className="text-xs">
//               {profile.emergency_contact_relation}
//             </Badge>
//           </div>
//         </div>
//       )}

//       {!editing && (
//         <Button className="w-full mt-6" onClick={onEdit} size={isMobile ? "default" : "default"}>
//           <Edit className="mr-2 h-4 w-4" />
//           Edit Profile
//         </Button>
//       )}
//     </>
//   );

//   // For mobile, just render the content without Card wrapper (Card is in Sheet)
//   if (isMobile) {
//     return <div className="space-y-4">{content}</div>;
//   }

//   // For desktop, keep the Card wrapper with sticky positioning
//   return (
//     <Card className="sticky top-6">
//       <CardContent className="pt-6">
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

  const content = (
    <>
      {/* Mobile Header with Close Button */}
      {isMobile && onClose && (
        <div className="sticky top-0 bg-white z-10 pb-2 mb-2 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Profile Overview</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-[#e6f0ff] hover:text-[#004aad]">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Profile Header with Gradient */}
      <div className="relative mb-6">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/5 via-transparent to-[#ffc107]/5 rounded-2xl"></div>
        
        <div className="relative text-center pt-2">
          {/* Avatar with Gold Ring */}
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#004aad] to-[#ffc107] rounded-full opacity-70 blur-sm"></div>
            <Avatar className={`${isMobile ? 'h-20 w-20' : 'h-32 w-32'} border-4 border-white shadow-xl relative mx-auto`}>
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
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold text-slate-800 mb-2`}>
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

          {/* Quick Stats */}
          {/* {age && (
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              <span>{age} years old</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
              <Heart className="h-3 w-3 text-[#ffc107]" />
              <span>{profile.gender}</span>
            </div>
          )} */}
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
          size={isMobile ? "default" : "lg"}
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

  // For mobile, just render the content without Card wrapper (Card is in Sheet)
  if (isMobile) {
    return <div className="space-y-4 p-2">{content}</div>;
  }

  // For desktop, keep the Card wrapper with sticky positioning
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