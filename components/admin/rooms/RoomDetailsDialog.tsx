// "use client";

// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Eye, Pencil, Building, DoorOpen, Users, Bed, Bath, Wind,
//   Sun, Heart, Image as ImageIcon, Video, MapPin,
//   Home, Sparkles, CheckCircle, XCircle, UserRound, Globe,
//   Calendar, Wifi, Tv, Droplets, Shield, Coffee,
//   Car, Dumbbell, TreePine, Waves, Thermometer, UsersRound, PersonStanding,
//   BadgeIndianRupee // Added rupees icon
// } from 'lucide-react';
// import type { RoomResponse } from '@/lib/roomsApi';

// interface RoomDetailsDialogProps {
//   room: any;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// // Amenities options for display
// const AMENITIES_OPTIONS = [
//   { id: 'wifi', label: 'WiFi', icon: <Wifi className="h-4 w-4" /> },
//   { id: 'tv', label: 'TV', icon: <Tv className="h-4 w-4" /> },
//   { id: 'ac', label: 'Air Conditioner', icon: <Wind className="h-4 w-4" /> },
//   { id: 'geyser', label: 'Geyser', icon: <Droplets className="h-4 w-4" /> },
//   { id: 'fridge', label: 'Refrigerator', icon: <Tv className="h-4 w-4" /> },
//   { id: 'laundry', label: 'Laundry Service', icon: <Droplets className="h-4 w-4" /> },
//   { id: 'cleaning', label: 'Cleaning Service', icon: <Home className="h-4 w-4" /> },
//   { id: 'security', label: '24/7 Security', icon: <Shield className="h-4 w-4" /> },
//   { id: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" /> },
//   { id: 'power', label: 'Power Backup', icon: <Sparkles className="h-4 w-4" /> },
//   { id: 'gym', label: 'Gym', icon: <Dumbbell className="h-4 w-4" /> },
//   { id: 'cafeteria', label: 'Cafeteria', icon: <Coffee className="h-4 w-4" /> },
//   { id: 'garden', label: 'Garden', icon: <TreePine className="h-4 w-4" /> },
//   { id: 'swimming', label: 'Swimming Pool', icon: <Waves className="h-4 w-4" /> },
//   { id: 'study', label: 'Study Table', icon: <Sun className="h-4 w-4" /> },
//   { id: 'wardrobe', label: 'Wardrobe', icon: <DoorOpen className="h-4 w-4" /> },
//   { id: 'curtains', label: 'Curtains', icon: <Bed className="h-4 w-4" /> },
//   { id: 'heater', label: 'Room Heater', icon: <Thermometer className="h-4 w-4" /> },
//   { id: 'fan', label: 'Ceiling Fan', icon: <Wind className="h-4 w-4" /> },
//   { id: 'lamp', label: 'Study Lamp', icon: <Sun className="h-4 w-4" /> },
// ];

// // Gender icon component
// const GenderIcon = ({ gender, size = "h-4 w-4" }: { gender: string; size?: string }) => {
//   switch (gender.toLowerCase()) {
//     case 'male':
//     case 'male_only':
//       return <UserRound className={`${size} text-blue-600`} />;
//     case 'female':
//     case 'female_only':
//       return <UserRound className={`${size} text-pink-600`} />;
//     case 'couples':
//     case 'couple':
//       return <UsersRound className={`${size} text-red-600`} />;
//     default:
//       return <PersonStanding className={`${size} text-gray-600`} />;
//   }
// };

// export function RoomDetailsDialog({ room, open, onOpenChange }: RoomDetailsDialogProps) {
//   const YesNoIcon = ({ value }: { value: boolean }) => {
//     return value ? (
//       <CheckCircle className="h-4 w-4 text-green-600" />
//     ) : (
//       <XCircle className="h-4 w-4 text-red-500" />
//     );
//   };

//   // Handle gender preferences (array or string)
//   const genderPreferences = Array.isArray(room.room_gender_preference) 
//     ? room.room_gender_preference 
//     : [room.room_gender_preference];

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-2xl flex items-center gap-3">
//             <Eye className="h-6 w-6" />
//             Room Details - Room {room.room_number}
//             <Badge variant={room.is_active ? "default" : "secondary"} className="ml-2">
//               {room.is_active ? 'Active' : 'Inactive'}
//             </Badge>
//           </DialogTitle>
//           <div className="flex items-center gap-2 text-sm text-gray-600">
//             <Building className="h-4 w-4" />
//             {room.property_name} • {room.property_address}
//           </div>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Room Overview */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg flex items-center gap-2">
//                   <DoorOpen className="h-5 w-5" />
//                   Room Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Room Number:</span>
//                   <span className="font-semibold">{room.room_number}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Floor:</span>
//                   <span className="font-semibold">{room.floor || 'Ground'}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Room Type:</span>
//                   <Badge variant="outline" className="capitalize">
//                     {room.sharing_type || 'Other'}
//                   </Badge>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Total Beds:</span>
//                   <span className="font-semibold">{room.total_bed}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Occupied Beds:</span>
//                   <span className="font-semibold">{room.occupied_beds}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Available Beds:</span>
//                   <span className="font-semibold text-green-600">{room.total_bed - room.occupied_beds}</span>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg flex items-center gap-2">
//                   <BadgeIndianRupee className="h-5 w-5" /> {/* Fixed: Replaced DollarSign */}
//                   Pricing & Status
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Rent per Bed:</span>
//                   <span className="font-bold text-green-600">₹{room.rent_per_bed}/month</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Total Monthly Rent:</span>
//                   <span className="font-bold text-blue-600">₹{room.rent_per_bed * room.total_bed}/month</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Status:</span>
//                   <div className="flex items-center gap-2">
//                     <div className={`w-3 h-3 rounded-full ${room.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
//                     <span className="font-semibold">{room.is_active ? 'Active' : 'Inactive'}</span>
//                   </div>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Created Date:</span>
//                   <span className="font-semibold">
//                     {room.created_at ? new Date(room.created_at).toLocaleDateString() : 'N/A'}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Last Updated:</span>
//                   <span className="font-semibold">
//                     {room.updated_at ? new Date(room.updated_at).toLocaleDateString() : 'N/A'}
//                   </span>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Room Features */}
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-lg flex items-center gap-2">
//                 <Sparkles className="h-5 w-5" />
//                 Room Features
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className={`p-3 rounded-lg border ${room.has_ac ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
//                   <div className="flex items-center gap-2 mb-1">
//                     <Wind className={`h-4 w-4 ${room.has_ac ? 'text-green-600' : 'text-gray-400'}`} />
//                     <span className="font-medium">Air Conditioner</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <YesNoIcon value={Boolean(room.has_ac)} />
//                     <span className="text-sm">{room.has_ac ? 'Available' : 'Not Available'}</span>
//                   </div>
//                 </div>

//                 <div className={`p-3 rounded-lg border ${room.has_balcony ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
//                   <div className="flex items-center gap-2 mb-1">
//                     <Sun className={`h-4 w-4 ${room.has_balcony ? 'text-green-600' : 'text-gray-400'}`} />
//                     <span className="font-medium">Balcony</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <YesNoIcon value={Boolean(room.has_balcony)} />
//                     <span className="text-sm">{room.has_balcony ? 'Available' : 'Not Available'}</span>
//                   </div>
//                 </div>

//                 <div className={`p-3 rounded-lg border ${room.has_attached_bathroom ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
//                   <div className="flex items-center gap-2 mb-1">
//                     <Bath className={`h-4 w-4 ${room.has_attached_bathroom ? 'text-green-600' : 'text-gray-400'}`} />
//                     <span className="font-medium">Attached Bathroom</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <YesNoIcon value={Boolean(room.has_attached_bathroom)} />
//                     <span className="text-sm">{room.has_attached_bathroom ? 'Available' : 'Shared'}</span>
//                   </div>
//                 </div>

//                 <div className={`p-3 rounded-lg border ${room.allow_couples ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
//                   <div className="flex items-center gap-2 mb-1">
//                     <Heart className={`h-4 w-4 ${room.allow_couples ? 'text-green-600' : 'text-gray-400'}`} />
//                     <span className="font-medium">Couples Allowed</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <YesNoIcon value={Boolean(room.allow_couples)} />
//                     <span className="text-sm">{room.allow_couples ? 'Allowed' : 'Not Allowed'}</span>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Gender Preferences */}
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-lg flex items-center gap-2">
//                 <Users className="h-5 w-5" />
//                 Gender Preferences
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="flex flex-wrap gap-2">
//                 {genderPreferences.map((pref : any) => (
//                   <Badge key={pref} className={
//                     pref === 'male_only' ? 'bg-blue-100 text-blue-800 border-blue-300' :
//                     pref === 'female_only' ? 'bg-pink-100 text-pink-800 border-pink-300' :
//                     pref === 'couples' ? 'bg-red-100 text-red-800 border-red-300' :
//                     'bg-gray-100 text-gray-800 border-gray-300'
//                   }>
//                     <GenderIcon gender={pref} />
//                     <span className="ml-1">
//                       {pref === 'male_only' ? 'Male Only' :
//                        pref === 'female_only' ? 'Female Only' :
//                        pref === 'couples' ? 'Couples Allowed' : pref}
//                     </span>
//                   </Badge>
//                 ))}
//                 {genderPreferences.length === 0 && (
//                   <span className="text-gray-500">No specific gender preferences</span>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Amenities */}
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-lg flex items-center gap-2">
//                 <DoorOpen className="h-5 w-5" />
//                 Amenities & Facilities
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {room.amenities && room.amenities.length > 0 ? (
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//                   {room.amenities.map((amenity :any , index:number) => {
//                     const predefinedAmenity = AMENITIES_OPTIONS.find(a => a.label === amenity);
//                     return (
//                       <div key={index} className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
//                         <div className="p-1.5 rounded bg-white border">
//                           {predefinedAmenity ? predefinedAmenity.icon : <Sparkles className="h-3 w-3" />}
//                         </div>
//                         <span className="text-sm">{amenity}</span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <p className="text-gray-500">No amenities added</p>
//               )}
//             </CardContent>
//           </Card>

//           {/* Description */}
//           {room.description && (
//             <Card>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg flex items-center gap-2">
//                   <Pencil className="h-5 w-5" />
//                   Description
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-700 whitespace-pre-line">{room.description}</p>
//               </CardContent>
//             </Card>
//           )}

//           {/* Media Information */}
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-lg flex items-center gap-2">
//                 <ImageIcon className="h-5 w-5" />
//                 Media & Gallery
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Photos:</span>
//                   <span className="font-semibold">
//                     {room.photo_urls?.length || 0} photo{room.photo_urls?.length !== 1 ? 's' : ''}
//                   </span>
//                 </div>
//                 {room.video_url && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-600">Video Walkthrough:</span>
//                     <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
//                       <Video className="h-3 w-3 mr-1" />
//                       Available
//                     </Badge>
//                   </div>
//                 )}
//                 {room.video_label && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-600">Video Label:</span>
//                     <span className="font-semibold">{room.video_label}</span>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Property Information */}
//           <Card>
//             <CardHeader className="pb-3">
//               <CardTitle className="text-lg flex items-center gap-2">
//                 <Building className="h-5 w-5" />
//                 Property Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600">Property Name:</span>
//                 <span className="font-semibold">{room.property_name}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600">Property Address:</span>
//                 <span className="font-semibold text-right max-w-xs">{room.property_address}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600">Property ID:</span>
//                 <span className="font-mono text-sm">{room.property_id}</span>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <DialogFooter className="pt-4">
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Close
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Eye, Pencil, Building, DoorOpen, Users, Bed, Bath, Wind,
  Sun, Heart, Image as ImageIcon, Video, MapPin,
  Home, Sparkles, CheckCircle, XCircle, UserRound, Globe,
  Calendar, Wifi, Tv, Droplets, Shield, Coffee,
  Car, Dumbbell, TreePine, Waves, Thermometer, UsersRound, PersonStanding,
  BadgeIndianRupee
} from 'lucide-react';
import type { RoomResponse } from '@/lib/roomsApi';

interface RoomDetailsDialogProps {
  room: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Amenities options for display
const AMENITIES_OPTIONS = [
  { id: 'wifi', label: 'WiFi', icon: <Wifi className="h-4 w-4" /> },
  { id: 'tv', label: 'TV', icon: <Tv className="h-4 w-4" /> },
  { id: 'ac', label: 'Air Conditioner', icon: <Wind className="h-4 w-4" /> },
  { id: 'geyser', label: 'Geyser', icon: <Droplets className="h-4 w-4" /> },
  { id: 'fridge', label: 'Refrigerator', icon: <Tv className="h-4 w-4" /> },
  { id: 'laundry', label: 'Laundry Service', icon: <Droplets className="h-4 w-4" /> },
  { id: 'cleaning', label: 'Cleaning Service', icon: <Home className="h-4 w-4" /> },
  { id: 'security', label: '24/7 Security', icon: <Shield className="h-4 w-4" /> },
  { id: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" /> },
  { id: 'power', label: 'Power Backup', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'gym', label: 'Gym', icon: <Dumbbell className="h-4 w-4" /> },
  { id: 'cafeteria', label: 'Cafeteria', icon: <Coffee className="h-4 w-4" /> },
  { id: 'garden', label: 'Garden', icon: <TreePine className="h-4 w-4" /> },
  { id: 'swimming', label: 'Swimming Pool', icon: <Waves className="h-4 w-4" /> },
  { id: 'study', label: 'Study Table', icon: <Sun className="h-4 w-4" /> },
  { id: 'wardrobe', label: 'Wardrobe', icon: <DoorOpen className="h-4 w-4" /> },
  { id: 'curtains', label: 'Curtains', icon: <Bed className="h-4 w-4" /> },
  { id: 'heater', label: 'Room Heater', icon: <Thermometer className="h-4 w-4" /> },
  { id: 'fan', label: 'Ceiling Fan', icon: <Wind className="h-4 w-4" /> },
  { id: 'lamp', label: 'Study Lamp', icon: <Sun className="h-4 w-4" /> },
];

// Gender icon component
const GenderIcon = ({ gender, size = "h-4 w-4" }: { gender: string; size?: string }) => {
  switch (gender.toLowerCase()) {
    case 'male':
    case 'male_only':
      return <UserRound className={`${size} text-blue-600`} />;
    case 'female':
    case 'female_only':
      return <UserRound className={`${size} text-pink-600`} />;
    case 'couples':
    case 'couple':
      return <UsersRound className={`${size} text-red-600`} />;
    default:
      return <PersonStanding className={`${size} text-gray-600`} />;
  }
};

export function RoomDetailsDialog({ room, open, onOpenChange }: RoomDetailsDialogProps) {
  const YesNoIcon = ({ value }: { value: boolean }) => {
    return value ? (
      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
    ) : (
      <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
    );
  };

  // Handle gender preferences (array or string)
  const genderPreferences = Array.isArray(room.room_gender_preference) 
    ? room.room_gender_preference 
    : [room.room_gender_preference];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-3xl lg:max-w-4xl max-h-[90vh] md:max-h-[90vh] overflow-hidden p-0 border-0 flex flex-col">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 md:px-4 md:py-3 flex-shrink-0">
          <DialogHeader className="space-y-0.5 md:space-y-1">
    <div className="flex items-center justify-between">
      <DialogTitle className="text-sm md:text-base lg:text-lg font-bold flex items-center gap-2 flex-wrap">
        <Eye className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
        <span className="flex-1">Room {room.room_number}</span>
        <Badge 
          variant={room.is_active ? "default" : "secondary"} 
          className="text-[9px] md:text-[10px] px-1.5 py-0.5 bg-white text-blue-600"
        >
          {room.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </DialogTitle>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 md:h-7 md:w-7 text-white hover:bg-white/20 rounded-full -mr-1"
        onClick={() => onOpenChange(false)}
      >
        <X className="h-3 w-3 md:h-4 md:w-4" />
      </Button>
    </div>
    <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-blue-100 flex-wrap">
      <Building className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
      <span className="truncate">{room.property_name}</span>
    </div>
  </DialogHeader>

        </div>

        <div className="px-3 py-2 md:px-4 md:py-2.5 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-2 md:space-y-3">
            {/* Room Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <Card className="border">
                <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
                  <CardTitle className="text-xs md:text-sm flex items-center gap-1.5">
                    <DoorOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Room Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 md:space-y-2 px-2.5 pb-2.5 md:px-4 md:pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Room Number:</span>
                    <span className="text-[10px] md:text-xs font-semibold">{room.room_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Floor:</span>
                    <span className="text-[10px] md:text-xs font-semibold">{room.floor || 'Ground'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Room Type:</span>
                    <Badge variant="outline" className="capitalize text-[9px] md:text-[10px] px-1.5 py-0">
                      {room.sharing_type || 'Other'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Total Beds:</span>
                    <span className="text-[10px] md:text-xs font-semibold">{room.total_bed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Occupied Beds:</span>
                    <span className="text-[10px] md:text-xs font-semibold">{room.occupied_beds}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Available Beds:</span>
                    <span className="text-[10px] md:text-xs font-semibold text-green-600">{room.total_bed - room.occupied_beds}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
                  <CardTitle className="text-xs md:text-sm flex items-center gap-1.5">
                    <BadgeIndianRupee className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Pricing & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 md:space-y-2 px-2.5 pb-2.5 md:px-4 md:pb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Rent per Bed:</span>
                    <span className="text-[10px] md:text-xs font-bold text-green-600">₹{room.rent_per_bed}/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Total Monthly:</span>
                    <span className="text-[10px] md:text-xs font-bold text-blue-600">₹{room.rent_per_bed * room.total_bed}/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Status:</span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ${room.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-[10px] md:text-xs font-semibold">{room.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Created:</span>
                    <span className="text-[10px] md:text-xs font-semibold">
                      {room.created_at ? new Date(room.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Updated:</span>
                    <span className="text-[10px] md:text-xs font-semibold">
                      {room.updated_at ? new Date(room.updated_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Room Features */}
            <Card className="border">
              <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
                <CardTitle className="text-xs md:text-sm flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Room Features
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2.5 pb-2.5 md:px-4 md:pb-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2">
                  <div className={`p-1.5 md:p-2 rounded-lg border ${room.has_ac ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Wind className={`h-3 w-3 md:h-3.5 md:w-3.5 ${room.has_ac ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-[9px] md:text-[10px] font-medium">AC</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <YesNoIcon value={Boolean(room.has_ac)} />
                      <span className="text-[8px] md:text-[9px]">{room.has_ac ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  <div className={`p-1.5 md:p-2 rounded-lg border ${room.has_balcony ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Sun className={`h-3 w-3 md:h-3.5 md:w-3.5 ${room.has_balcony ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-[9px] md:text-[10px] font-medium">Balcony</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <YesNoIcon value={Boolean(room.has_balcony)} />
                      <span className="text-[8px] md:text-[9px]">{room.has_balcony ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  <div className={`p-1.5 md:p-2 rounded-lg border ${room.has_attached_bathroom ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Bath className={`h-3 w-3 md:h-3.5 md:w-3.5 ${room.has_attached_bathroom ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-[9px] md:text-[10px] font-medium">Bathroom</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <YesNoIcon value={Boolean(room.has_attached_bathroom)} />
                      <span className="text-[8px] md:text-[9px]">{room.has_attached_bathroom ? 'Attached' : 'Shared'}</span>
                    </div>
                  </div>

                  <div className={`p-1.5 md:p-2 rounded-lg border ${room.allow_couples ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Heart className={`h-3 w-3 md:h-3.5 md:w-3.5 ${room.allow_couples ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-[9px] md:text-[10px] font-medium">Couples</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <YesNoIcon value={Boolean(room.allow_couples)} />
                      <span className="text-[8px] md:text-[9px]">{room.allow_couples ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gender Preferences */}
            <Card className="border">
              <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
                <CardTitle className="text-xs md:text-sm flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Gender Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2.5 pb-2.5 md:px-4 md:pb-3">
                <div className="flex flex-wrap gap-1 md:gap-1.5">
                  {genderPreferences.map((pref : any) => (
                    <Badge key={pref} className={`text-[9px] md:text-[10px] px-1.5 py-0.5 ${
                      pref === 'male_only' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      pref === 'female_only' ? 'bg-pink-100 text-pink-800 border-pink-300' :
                      pref === 'couples' ? 'bg-red-100 text-red-800 border-red-300' :
                      'bg-gray-100 text-gray-800 border-gray-300'
                    }`}>
                      <GenderIcon gender={pref} size="h-2.5 w-2.5 md:h-3 md:w-3" />
                      <span className="ml-0.5">
                        {pref === 'male_only' ? 'Male Only' :
                         pref === 'female_only' ? 'Female Only' :
                         pref === 'couples' ? 'Couples' : pref}
                      </span>
                    </Badge>
                  ))}
                  {genderPreferences.length === 0 && (
                    <span className="text-[10px] md:text-xs text-gray-500">No specific gender preferences</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="border">
              <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
                <CardTitle className="text-xs md:text-sm flex items-center gap-1.5">
                  <DoorOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Amenities & Facilities
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2.5 pb-2.5 md:px-4 md:pb-3">
                {room.amenities && room.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-2">
                    {room.amenities.map((amenity :any , index:number) => {
                      const predefinedAmenity = AMENITIES_OPTIONS.find(a => a.label === amenity);
                      return (
                        <div key={index} className="flex items-center gap-1.5 p-1.5 md:p-2 border rounded-lg bg-gray-50">
                          <div className="p-1 rounded bg-white border flex-shrink-0">
                            {predefinedAmenity ? (
                              <div className="h-2.5 w-2.5 md:h-3 md:w-3">{predefinedAmenity.icon}</div>
                            ) : (
                              <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            )}
                          </div>
                          <span className="text-[9px] md:text-[10px] truncate">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] md:text-xs text-gray-500">No amenities added</p>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {room.description && (
              <Card className="border">
                <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
                  <CardTitle className="text-xs md:text-sm flex items-center gap-1.5">
                    <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2.5 pb-2.5 md:px-4 md:pb-3">
                  <p className="text-[10px] md:text-xs text-gray-700 whitespace-pre-line">{room.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Media Information */}
            <Card className="border">
              <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
                <CardTitle className="text-xs md:text-sm flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Media & Gallery
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2.5 pb-2.5 md:px-4 md:pb-3">
                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] md:text-xs text-gray-600">Photos:</span>
                    <span className="text-[10px] md:text-xs font-semibold">
                      {room.photo_urls?.length || 0} photo{room.photo_urls?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {room.video_url && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] md:text-xs text-gray-600">Video Walkthrough:</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[9px] md:text-[10px] px-1.5 py-0">
                        <Video className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5" />
                        Available
                      </Badge>
                    </div>
                  )}
                  {room.video_label && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] md:text-xs text-gray-600">Video Label:</span>
                      <span className="text-[10px] md:text-xs font-semibold truncate max-w-[150px]">{room.video_label}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Information */}
            <Card className="border">
              <CardHeader className="pb-2 px-2.5 pt-2.5 md:px-4 md:pt-3">
                <CardTitle className="text-xs md:text-sm flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 md:space-y-2 px-2.5 pb-2.5 md:px-4 md:pb-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] md:text-xs text-gray-600">Property Name:</span>
                  <span className="text-[10px] md:text-xs font-semibold truncate max-w-[150px]">{room.property_name}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] md:text-xs text-gray-600 flex-shrink-0">Address:</span>
                  <span className="text-[10px] md:text-xs font-semibold text-right max-w-[200px]">{room.property_address}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] md:text-xs text-gray-600">Property ID:</span>
                  <span className="text-[10px] md:text-xs font-mono">{room.property_id}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-white border-t px-3 py-2 md:px-4 md:py-2.5 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-7 md:h-8 text-[10px] md:text-xs px-3 md:px-4 w-full md:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}