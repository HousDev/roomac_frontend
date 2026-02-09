// "use client";

// import { useState, useEffect, useMemo } from "react";
// import { AdminHeader } from "@/components/admin/admin-header";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableBody,
//   TableHead,
//   TableHeader,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Tag,
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   X,
//   Calendar,
//   Percent,
//   IndianRupee,
//   Clock,
//   Star,
//   Shield,
//   Award,
//   Sparkles,
//   Users,
//   Megaphone,
//   Ticket,
//   BellRing,
//   ShieldCheck,
//   Trophy,
//   Search,
//   Filter,
//   MapPin,
//   Wifi,
//   Tv,
//   Coffee,
//   Dumbbell,
//   Scan,
//   CreditCard,
//   Home,
//   Zap,
//   CheckCircle,
//   TrendingUp,
//   Share2,
//   Facebook,
//   Twitter,
//   Linkedin,
//   MessageSquare,
//   Mail,
//   Copy,
//   RefreshCw,
//   Building,
//   Key,
//   Bed,
//   Bath,
//   Snowflake,
//   Sun,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { offerApi, Offer, Room, Property, PaginationParams, PaginatedResponse } from "@/lib/offerApi";
// import { toast } from "sonner";
// import axios from "axios";

// // Environment utility
// const getBaseUrl = () => {
//   const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
//   const baseUrl = apiUrl.replace('/api', '');
//   return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
// };

// interface PropertyApiResponse {
//   id: number;
//   name: string;
//   slug: string;
//   city_id: string | null;
//   area: string | null;
//   address: string | null;
//   total_rooms: number;
//   total_beds: number;
//   occupied_beds: number;
//   starting_price: number;
//   security_deposit: number;
//   description: string | null;
//   property_manager_name: string | null;
//   property_manager_phone: string | null;
//   amenities: string[];
//   services: string[];
//   photo_urls: string[];
//   property_rules: string | null;
//   is_active: boolean;
//   rating: number | null;
//   created_at: string;
//   updated_at: string | null;
// }

// interface BonusDetails {
//   title: string;
//   description: string;
//   valid_until: string;
//   conditions?: string;
// }

// interface ApiResponse {
//   success: boolean;
//   data: PropertyApiResponse[];
//   meta: {
//     total: number;
//     page: number;
//     pageSize: number;
//   };
// }

// interface FormData {
//   code: string;
//   title: string;
//   description: string;
//   offer_type: string;
//   discount_type: string;
//   discount_value: string;
//   discount_percent: string;
//   min_months: string;
//   start_date: string;
//   end_date: string;
//   terms_and_conditions: string;
//   is_active: boolean;
//   display_order: string;
//   bonus_title: string;
//   bonus_description: string;
//   bonus_valid_until: string;
//   bonus_conditions: string;
//   property_id: number | null;
//   room_id: number | null;
// }

// interface OfferFormFieldsProps {
//   formData: FormData;
//   setFormData: React.Dispatch<React.SetStateAction<FormData>>;
//   existingCodes?: string[];
//   isEdit?: boolean;
//   currentCode?: string;
//   properties?: PropertyApiResponse[];
//   rooms?: Room[];
//   loadingRooms?: boolean;
//   onPropertyChange?: (propertyId: number | null) => void;
//   onGenerateCode?: () => void;
//   isGeneratingCode?: boolean;
// }

// interface OfferPreviewData {
//   offer: Offer;
//   property: PropertyApiResponse | null;
//   room: Room | null;
//   bonusDetails: BonusDetails;
// }

// // Enhanced Share Modal Component
// interface ShareModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   offer: Offer | null;
//   property?: PropertyApiResponse | null;
// }

// const ShareModal = ({ isOpen, onClose, offer, property }: ShareModalProps) => {
//   if (!isOpen || !offer) return null;

//   const discountValue = offer.discount_type === "percentage"
//     ? `${offer.discount_percent}%`
//     : `₹${offer.discount_value}`;

//   const getDaysLeft = () => {
//     if (!offer.end_date) return "Soon";
//     const end = new Date(offer.end_date);
//     const today = new Date();
//     const diffTime = end.getTime() - today.getTime();
//     const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
//     return daysLeft > 0 ? `${daysLeft} days left` : "Expired";
//   };

//   const getOfferTypeColor = () => {
//     switch (offer.offer_type) {
//       case 'seasonal': return 'bg-orange-100 text-orange-800';
//       case 'student': return 'bg-blue-100 text-blue-800';
//       case 'corporate': return 'bg-gray-100 text-gray-800';
//       case 'referral': return 'bg-green-100 text-green-800';
//       case 'early_booking': return 'bg-cyan-100 text-cyan-800';
//       default: return 'bg-yellow-100 text-yellow-800';
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl max-h-[85vh] overflow-y-auto">
//         <div className="relative">
//           <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
//                   <Share2 className="h-6 w-6 text-white" />
//                 </div>
//                 <div>
//                   <DialogTitle className="text-white text-xl font-bold">
//                     Share This Amazing Offer!
//                   </DialogTitle>
//                   <DialogDescription className="text-blue-100">
//                     Spread the word and help others save money
//                   </DialogDescription>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="p-4 -mt-6">
//             <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-4 transform -translate-y-4">
//               <div className="flex items-start justify-between mb-3">
//                 <div>
//                   <Badge className={`${getOfferTypeColor()} font-semibold px-3 py-1 mb-2`}>
//                     {offer.offer_type.replace('_', ' ').toUpperCase()}
//                   </Badge>
//                   <h3 className="text-lg font-bold text-gray-900">{offer.title}</h3>
//                   <p className="text-gray-600 text-sm mt-1 line-clamp-2">{offer.description}</p>
                  
//                   {property && (
//                     <div className="flex items-center gap-2 mt-2">
//                       <Building className="h-3 w-3 text-gray-400" />
//                       <span className="text-sm text-gray-700 font-medium">{property.name}</span>
//                       {property.area && (
//                         <span className="text-xs text-gray-500">({property.area})</span>
//                       )}
//                     </div>
//                   )}
//                 </div>
//                 <div className="text-right">
//                   <div className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
//                     {discountValue} OFF
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">Special Discount</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3 mb-4">
//                 <div className="bg-blue-50 rounded-lg p-2">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4 text-blue-600" />
//                     <span className="text-sm font-semibold text-gray-700">Validity</span>
//                   </div>
//                   <p className="text-xs text-gray-600 mt-1">
//                     {offer.start_date ? new Date(offer.start_date).toLocaleDateString() : 'Anytime'}
//                     {offer.end_date && ` - ${new Date(offer.end_date).toLocaleDateString()}`}
//                   </p>
//                 </div>

//                 <div className="bg-green-50 rounded-lg p-3">
//                   <div className="flex items-center gap-2">
//                     <Clock className="h-4 w-4 text-green-600" />
//                     <span className="text-sm font-semibold text-gray-700">Time Left</span>
//                   </div>
//                   <p className="text-xs text-gray-600 mt-1">{getDaysLeft()}</p>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-semibold text-gray-700 mb-1">Your Offer Code</p>
//                     <div className="flex items-center gap-2">
//                       <Ticket className="h-4 w-4 text-purple-600" />
//                       <code className="font-mono text-lg font-bold text-purple-700 bg-white px-3 py-1 rounded border border-purple-300">
//                         {offer.code}
//                       </code>
//                     </div>
//                   </div>
//                   <Button
//                     size="sm"
//                     onClick={() => {
//                       navigator.clipboard.writeText(offer.code);
//                       toast.success("Code copied to clipboard!");
//                     }}
//                     className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
//                   >
//                     <Copy className="h-3 w-3 mr-1" />
//                     Copy Code
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             <div className="mb-4">
//               <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                 <Sparkles className="h-4 w-4 text-yellow-500" />
//                 Share via Social Media
//               </h4>
              
//               <div className="grid grid-cols-4 gap-2 mb-3">
//                 <Button
//                   onClick={() => {
//                     const url = `${getBaseUrl()}/offers/${offer.code}`;
//                     const message = `🎉 Check out this amazing offer: ${offer.title}\n\nGet ${discountValue} off!\n\nUse code: ${offer.code}\n\n${url}`;
//                     window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
//                     toast.success("Opening WhatsApp...");
//                   }}
//                   className="bg-[#25D366] hover:bg-[#22C35E] text-white h-auto py-3 flex flex-col gap-1 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
//                 >
//                   <MessageSquare className="h-4 w-4" />
//                   <span className="text-xs font-medium">WhatsApp</span>
//                 </Button>

//                 <Button
//                   onClick={() => {
//                     const url = `${getBaseUrl()}/offers/${offer.code}`;
//                     window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${offer.title} - Get ${discountValue} off!`)}`, '_blank');
//                     toast.success("Opening Facebook...");
//                   }}
//                   className="bg-[#1877F2] hover:bg-[#166FE5] text-white h-auto py-3 flex flex-col gap-1 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
//                 >
//                   <Facebook className="h-4 w-4" />
//                   <span className="text-xs font-medium">Facebook</span>
//                 </Button>

//                 <Button
//                   onClick={() => {
//                     const url = `${getBaseUrl()}/offers/${offer.code}`;
//                     window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`🎁 Check out: ${offer.title} - Get ${discountValue} off! Use code: ${offer.code}`)}`, '_blank');
//                     toast.success("Opening Twitter...");
//                   }}
//                   className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white h-auto py-3 flex flex-col gap-1 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
//                 >
//                   <Twitter className="h-4 w-4" />
//                   <span className="text-xs font-medium">Twitter</span>
//                 </Button>

//                 <Button
//                   onClick={() => {
//                     const url = `${getBaseUrl()}/offers/${offer.code}`;
//                     window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
//                     toast.success("Opening LinkedIn...");
//                   }}
//                   className="bg-[#0A66C2] hover:bg-[#0959AC] text-white h-auto py-3 flex flex-col gap-1 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md"
//                 >
//                   <Linkedin className="h-4 w-4" />
//                   <span className="text-xs font-medium">LinkedIn</span>
//                 </Button>
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 <Button
//                   onClick={() => {
//                     const url = `${getBaseUrl()}/offers/${offer.code}`;
//                     const subject = `🎁 Amazing Offer: ${offer.title}`;
//                     const body = `Hi,\n\nI found this great offer for you:\n\n🏷️ ${offer.title}\n📝 ${offer.description || 'Special discount offer'}\n\n💰 Get ${discountValue} off!\n🎟️ Use code: ${offer.code}\n\nCheck it out: ${url}\n\nBest regards,\n`;
//                     window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
//                   }}
//                   className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white h-10 justify-start gap-3 rounded-lg px-3 shadow-md"
//                 >
//                   <Mail className="h-4 w-4" />
//                   <span className="font-medium">Email</span>
//                 </Button>

//                 <Button
//                   onClick={() => {
//                     const url = `${getBaseUrl()}/offers/${offer.code}`;
//                     window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`🎁 Check out: ${offer.title} - Get ${discountValue} off! Use code: ${offer.code}`)}`, '_blank');
//                     toast.success("Opening Telegram...");
//                   }}
//                   className="bg-[#0088CC] hover:bg-[#0077B5] text-white h-10 justify-start gap-2 rounded-lg px-3 shadow-md"
//                 >
//                   <MessageSquare className="h-4 w-4" />
//                   <span className="font-medium">Telegram</span>
//                 </Button>
//               </div>

//               <div className="mt-3">
//                 <Button
//                   onClick={() => {
//                     const url = `${getBaseUrl()}/offers/${offer.code}`;
//                     navigator.clipboard.writeText(url);
//                     toast.success("📋 Link copied to clipboard!");
//                   }}
//                   className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white w-full h-10 justify-center gap-3 rounded-lg shadow-md"
//                 >
//                   <Copy className="h-4 w-4" />
//                   <span className="font-medium">Copy Share Link</span>
//                 </Button>
//               </div>
//             </div>

//             <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-1.5 rounded-lg shadow-sm">
//                     <TrendingUp className="h-4 w-4 text-white" />
//                   </div>
//                   <div>
//                     <p className="text-sm font-semibold text-gray-700">Sharing is Caring! ❤️</p>
//                     <p className="text-xs text-gray-600">Every share helps someone save money</p>
//                   </div>
//                 </div>
//                 <Badge variant="outline" className="bg-white border-green-300 text-green-700 shadow-sm">
//                   <CheckCircle className="h-3 w-3 mr-1" />
//                   Verified Offer
//                 </Badge>
//               </div>
//             </div>
//           </div>

//           <div className="absolute top-2 right-2 opacity-20">
//             <Sparkles className="h-8 w-8 text-white" />
//           </div>
//           <div className="absolute bottom-2 left-2 opacity-20">
//             <Share2 className="h-6 w-6 text-white" />
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// const OfferFormFields = ({ 
//   formData, 
//   setFormData, 
//   existingCodes = [], 
//   isEdit = false, 
//   currentCode = "",
//   properties = [],
//   rooms = [],
//   loadingRooms = false,
//   onPropertyChange,
//   onGenerateCode,
//   isGeneratingCode = false
// }: OfferFormFieldsProps) => {
//   const [codeError, setCodeError] = useState("");

//   const validateCode = (code: string) => {
//     const uppercaseCode = code.toUpperCase();

//     if (!uppercaseCode) {
//       setCodeError("Offer code is required");
//       return false;
//     }

//     if (uppercaseCode.length < 3) {
//       setCodeError("Code must be at least 3 characters");
//       return false;
//     }

//     if (isEdit && uppercaseCode === currentCode) {
//       setCodeError("");
//       return true;
//     }

//     if (existingCodes.includes(uppercaseCode)) {
//       setCodeError("This offer code already exists");
//       return false;
//     }

//     setCodeError("");
//     return true;
//   };

//   const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.toUpperCase();
//     setFormData(prev => ({ ...prev, code: value }));
//     validateCode(value);
//   };

//   const getOfferTypeIcon = (type: string) => {
//     switch (type) {
//       case 'seasonal': return <Calendar className="h-4 w-4 text-orange-500" />;
//       case 'student': return <Award className="h-4 w-4 text-blue-500" />;
//       case 'corporate': return <Shield className="h-4 w-4 text-gray-600" />;
//       case 'referral': return <Users className="h-4 w-4 text-green-500" />;
//       case 'early_booking': return <Clock className="h-4 w-4 text-cyan-500" />;
//       default: return <Star className="h-4 w-4 text-yellow-500" />;
//     }
//   };

//   const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData(prev => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleSelectChange = (field: string) => (value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   return (
//     <div className="grid gap-6 py-4">
//       <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
//         <h3 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
//           <Building className="h-4 w-4" />
//           Property & Room Selection
//         </h3>
        
//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="property_id" className="text-gray-700">
//               Select Property (Optional)
//             </Label>
//             <Select
//               value={formData.property_id?.toString() || "null"}
//               onValueChange={(value) => {
//                 const propertyId = value && value !== "null" ? parseInt(value) : null;
//                 setFormData(prev => ({ 
//                   ...prev, 
//                   property_id: propertyId,
//                   room_id: null
//                 }));
//                 onPropertyChange?.(propertyId);
//               }}
//             >
//               <SelectTrigger id="property_id" className="border-purple-300 focus:border-purple-500">
//                 <SelectValue placeholder="Select a property (or leave empty for general offer)" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="null">General Offer (All Properties)</SelectItem>
//                 {properties.map((property) => (
//                   <SelectItem 
//                     key={property.id} 
//                     value={property.id.toString()}
//                   >
//                     <div className="flex items-center gap-2">
//                       <Building className="h-3 w-3" />
//                       <span>{property.name}</span>
//                       {property.area && (
//                         <span className="text-gray-500 text-xs">({property.area})</span>
//                       )}
//                     </div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <p className="text-xs text-gray-500">
//               Leave empty to create a general offer applicable to all properties
//             </p>
//           </div>

//           {formData.property_id && (
//             <div className="space-y-2">
//               <Label htmlFor="room_id" className="text-gray-700">
//                 Select Room (Optional)
//               </Label>
//               {loadingRooms ? (
//                 <div className="flex items-center gap-2 text-gray-500">
//                   <RefreshCw className="h-4 w-4 animate-spin" />
//                   Loading rooms...
//                 </div>
//               ) : (
//                 <Select
//                   value={formData.room_id?.toString() || "null"}
//                   onValueChange={(value) => {
//                     setFormData(prev => ({ 
//                       ...prev, 
//                       room_id: value && value !== "null" ? parseInt(value) : null 
//                     }));
//                   }}
//                   disabled={rooms.length === 0}
//                 >
//                   <SelectTrigger id="room_id" className="border-purple-300 focus:border-purple-500">
//                     <SelectValue 
//                       placeholder={rooms.length === 0 ? "No rooms available" : "Select a room (or leave empty for all rooms)"} 
//                     />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="null">All Rooms in Property</SelectItem>
//                     {rooms.map((room) => (
//                       <SelectItem 
//                         key={room.id} 
//                         value={room.id.toString()}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-2">
//                             <Key className="h-3 w-3" />
//                             <span>Room {room.room_number}</span>
//                             <Badge variant="outline" className="text-xs capitalize">
//                               {room.sharing_type}
//                             </Badge>
//                           </div>
//                           <span className="text-gray-600 text-xs">
//                             ₹{room.rent_per_bed}/bed
//                           </span>
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}
//               <p className="text-xs text-gray-500">
//                 Leave empty to apply offer to all rooms in the selected property
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="space-y-2">
//         <div className="flex items-center justify-between">
//           <Label htmlFor="code" className="flex items-center gap-2 text-gray-700">
//             <Ticket className="h-4 w-4" />
//             Offer Code *
//           </Label>
//           <Button
//             type="button"
//             size="sm"
//             variant="outline"
//             onClick={onGenerateCode}
//             disabled={isGeneratingCode}
//             className="h-7 text-xs"
//           >
//             {isGeneratingCode ? (
//               <>
//                 <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
//                 Generating...
//               </>
//             ) : (
//               <>
//                 <RefreshCw className="h-3 w-3 mr-1" />
//                 Generate Random
//               </>
//             )}
//           </Button>
//         </div>
//         <div className="relative">
//           <Input
//             id="code"
//             placeholder="e.g., NEWYEAR2025"
//             value={formData.code}
//             onChange={handleCodeChange}
//             className={`pl-10 border-gray-300 focus:border-blue-500 ${codeError ? 'border-red-500' : ''}`}
//           />
//           <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//         </div>
//         {codeError ? (
//           <p className="text-red-500 text-sm">{codeError}</p>
//         ) : (
//           <p className="text-xs text-gray-500">
//             Enter a custom code or generate a random one (8 characters, letters & numbers)
//           </p>
//         )}
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="offer_type" className="flex items-center gap-2 text-gray-700">
//             <Tag className="h-4 w-4" />
//             Offer Type
//           </Label>
//           <Select
//             value={formData.offer_type}
//             onValueChange={handleSelectChange("offer_type")}
//           >
//             <SelectTrigger id="offer_type" className="border-gray-300 focus:border-blue-500">
//               <div className="flex items-center gap-2">
//                 {getOfferTypeIcon(formData.offer_type)}
//                 <SelectValue placeholder="Select offer type" />
//               </div>
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="general" className="flex items-center gap-2">
//                 <Star className="h-4 w-4 text-yellow-500" />
//                 General
//               </SelectItem>
//               <SelectItem value="seasonal" className="flex items-center gap-2">
//                 <Calendar className="h-4 w-4 text-orange-500" />
//                 Seasonal
//               </SelectItem>
//               <SelectItem value="student" className="flex items-center gap-2">
//                 <Award className="h-4 w-4 text-blue-500" />
//                 Student
//               </SelectItem>
//               <SelectItem value="corporate" className="flex items-center gap-2">
//                 <Shield className="h-4 w-4 text-gray-600" />
//                 Corporate
//               </SelectItem>
//               <SelectItem value="referral" className="flex items-center gap-2">
//                 <Users className="h-4 w-4 text-green-500" />
//                 Referral
//               </SelectItem>
//               <SelectItem value="early_booking" className="flex items-center gap-2">
//                 <Clock className="h-4 w-4 text-cyan-500" />
//                 Early Booking
//               </SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="title" className="flex items-center gap-2 text-gray-700">
//             <Megaphone className="h-4 w-4" />
//             Offer Title *
//           </Label>
//           <div className="relative">
//             <Input
//               id="title"
//               placeholder="e.g., New Year Special Offer"
//               value={formData.title}
//               onChange={handleInputChange("title")}
//               className="pl-10 border-gray-300 focus:border-blue-500"
//             />
//             <Megaphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//           </div>
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="description" className="flex items-center gap-2 text-gray-700">
//           <BellRing className="h-4 w-4" />
//           Description
//         </Label>
//         <div className="relative">
//           <Textarea
//             id="description"
//             placeholder="Brief description of the offer that will attract tenants"
//             rows={3}
//             value={formData.description}
//             onChange={handleInputChange("description")}
//             className="pl-10 border-gray-300 focus:border-blue-500"
//           />
//           <BellRing className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//         </div>
//       </div>

//       <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
//         <h3 className="font-semibold text-blue-700 mb-3">
//           Discount Details
//         </h3>
//         <div className="grid grid-cols-3 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="discount_type" className="text-gray-700">
//               Discount Type *
//             </Label>
//             <Select
//               value={formData.discount_type}
//               onValueChange={handleSelectChange("discount_type")}
//             >
//               <SelectTrigger id="discount_type" className="border-gray-300 focus:border-blue-500">
//                 <SelectValue placeholder="Select discount type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="percentage">Percentage</SelectItem>
//                 <SelectItem value="fixed">Fixed Amount</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {formData.discount_type === "percentage" ? (
//             <div className="space-y-2">
//               <Label htmlFor="discount_percent" className="text-gray-700">
//                 Discount Percent *
//               </Label>
//               <div className="relative">
//                 <Input
//                   id="discount_percent"
//                   type="text"
//                   placeholder="20"
//                   value={formData.discount_percent}
//                   onChange={handleInputChange("discount_percent")}
//                   className="pl-3 border-gray-300 focus:border-blue-500"
//                 />
//                 <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-2">
//               <Label htmlFor="discount_value" className="text-gray-700">
//                 Discount Amount *
//               </Label>
//               <div className="relative">
//                 <Input
//                   id="discount_value"
//                   type="text"
//                   placeholder="5000"
//                   value={formData.discount_value}
//                   onChange={handleInputChange("discount_value")}
//                   className="pl-3 border-gray-300 focus:border-blue-500"
//                 />
//                 <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
//               </div>
//             </div>
//           )}

//           <div className="space-y-2">
//             <Label htmlFor="min_months" className="text-gray-700">
//               Min Month Stay
//             </Label>
//             <div className="relative">
//               <Input
//                 id="min_months"
//                 type="text"
//                 placeholder="3"
//                 value={formData.min_months}
//                 onChange={handleInputChange("min_months")}
//                 className="pl-3 border-gray-300 focus:border-blue-500"
//               />
//               <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">months</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
//         <h3 className="font-semibold text-amber-700 mb-3">
//           <Sparkles className="h-4 w-4 inline mr-2" />
//           Limited Time Bonus (Optional)
//         </h3>
//         <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="bonus_title" className="text-gray-700">
//               Bonus Title
//             </Label>
//             <Input
//               id="bonus_title"
//               placeholder="e.g., Booked for 12 months get 1 month FREE"
//               value={formData.bonus_title}
//               onChange={handleInputChange("bonus_title")}
//               className="border-amber-300 focus:border-amber-500"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="bonus_valid_until" className="text-gray-700">
//               Bonus Valid Until
//             </Label>
//             <Input
//               id="bonus_valid_until"
//               type="date"
//               value={formData.bonus_valid_until}
//               onChange={handleInputChange("bonus_valid_until")}
//               className="border-amber-300 focus:border-amber-500"
//             />
//           </div>
//         </div>
//         <div className="space-y-2 mt-4">
//           <Label htmlFor="bonus_description" className="text-gray-700">
//             Bonus Description
//           </Label>
//           <Textarea
//             id="bonus_description"
//             placeholder="e.g., Book for 12 months and get 1 month absolutely free!"
//             rows={2}
//             value={formData.bonus_description}
//             onChange={handleInputChange("bonus_description")}
//             className="border-amber-300 focus:border-amber-500"
//           />
//         </div>
//         <div className="space-y-2 mt-4">
//           <Label htmlFor="bonus_conditions" className="text-gray-700">
//             Bonus Conditions (comma separated)
//           </Label>
//           <Input
//             id="bonus_conditions"
//             placeholder="e.g., Booked for 12 months, Booked for 6 months get 6% off"
//             value={formData.bonus_conditions}
//             onChange={handleInputChange("bonus_conditions")}
//             className="border-amber-300 focus:border-amber-500"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="start_date" className="text-gray-700">
//             Valid From (Optional)
//           </Label>
//           <div className="relative">
//             <Input
//               id="start_date"
//               type="date"
//               value={formData.start_date}
//               onChange={handleInputChange("start_date")}
//               className="pl-3 border-gray-300 focus:border-blue-500"
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="end_date" className="text-gray-700">
//             Valid Until (Optional)
//           </Label>
//           <div className="relative">
//             <Input
//               id="end_date"
//               type="date"
//               value={formData.end_date}
//               onChange={handleInputChange("end_date")}
//               className="pl-3 border-gray-300 focus:border-blue-500"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="terms_and_conditions" className="text-gray-700">
//           Terms & Conditions
//         </Label>
//         <div className="relative">
//           <Textarea
//             id="terms_and_conditions"
//             placeholder="Terms and conditions that apply to this offer"
//             rows={3}
//             value={formData.terms_and_conditions}
//             onChange={handleInputChange("terms_and_conditions")}
//             className="pl-3 border-gray-300 focus:border-blue-500"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="display_order" className="text-gray-700">
//             Display Priority
//           </Label>
//           <div className="relative">
//             <Input
//               id="display_order"
//               type="text"
//               placeholder="0 (Higher number = Higher priority)"
//               value={formData.display_order}
//               onChange={handleInputChange("display_order")}
//               className="pl-3 border-gray-300 focus:border-blue-500"
//             />
//           </div>
//         </div>

//         <div className="flex items-center justify-between pt-6">
//           <Label htmlFor="is_active" className="flex items-center gap-2 text-gray-700">
//             <span>Active Status</span>
//           </Label>
//           <Switch
//             id="is_active"
//             checked={formData.is_active}
//             onCheckedChange={(checked) =>
//               setFormData(prev => ({ ...prev, is_active: checked }))
//             }
//             className="data-[state=checked]:bg-green-500"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// interface OfferPreviewProps {
//   previewData: OfferPreviewData | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// const OfferPreview = ({ previewData, isOpen, onClose }: OfferPreviewProps) => {
//   if (!isOpen || !previewData) return null;

//   const { offer, property, room, bonusDetails } = previewData;

//   const discountValue = offer.discount_type === "percentage"
//     ? `${offer.discount_percent}%`
//     : `₹${offer.discount_value}`;

//   const getDaysLeft = () => {
//     if (!offer.end_date) return "No expiry";
//     const end = new Date(offer.end_date);
//     const today = new Date();
//     const diffTime = end.getTime() - today.getTime();
//     const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
//     return `${daysLeft} Days`;
//   };

//   const getOfferTypeIcon = () => {
//     switch (offer.offer_type) {
//       case 'seasonal': return <Calendar className="h-5 w-5 text-orange-500" />;
//       case 'student': return <Award className="h-5 w-5 text-blue-500" />;
//       case 'corporate': return <Shield className="h-5 w-5 text-gray-600" />;
//       case 'referral': return <Users className="h-5 w-5 text-green-500" />;
//       case 'early_booking': return <Clock className="h-5 w-5 text-cyan-500" />;
//       default: return <Star className="h-5 w-5 text-yellow-500" />;
//     }
//   };

//   const calculateDiscountedPrice = (originalPrice: number) => {
//     if (offer.discount_type === "percentage" && offer.discount_percent) {
//       return Math.round(originalPrice * (1 - (offer.discount_percent / 100)));
//     } else if (offer.discount_type === "fixed" && offer.discount_value) {
//       return Math.max(0, originalPrice - offer.discount_value);
//     }
//     return originalPrice;
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="relative w-full max-w-4xl pt-2 pb-2">
//         <button
//           onClick={onClose}
//           className="absolute -top-1 -right-1 z-50 bg-white hover:bg-gray-100 border border-gray-300 p-1 rounded-full shadow-lg transition-all hover:scale-110"
//         >
//           <X className="h-4 w-4 text-gray-700" />
//         </button>

//         <div className="bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200 max-h-[70vh] overflow-y-auto">
//           <div className="flex flex-col md:flex-row">
//             <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-cyan-600 p-4 text-white relative">
//               <div className="absolute top-2 left-2 opacity-20">
//                 <Sparkles className="h-6 w-6" />
//               </div>
//               <div className="absolute bottom-2 right-2 opacity-20">
//                 <Trophy className="h-8 w-8" />
//               </div>

//               <div className="relative z-10">
//                 <div className="flex items-center gap-1 mb-3">
//                   {getOfferTypeIcon()}
//                   <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
//                     {offer.offer_type.replace('_', ' ')}
//                   </span>
//                 </div>

//                 <h1 className="text-xl font-black mb-2 leading-tight">
//                   {offer.title}
//                 </h1>

//                 <p className="text-blue-100 text-xs mb-4">
//                   {offer.description || "Limited Time Exclusive Offer"}
//                 </p>

//                 {property && (
//                   <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 mb-3 border border-white/20">
//                     <div className="flex items-center gap-2">
//                       <Building className="h-4 w-4" />
//                       <div>
//                         <p className="font-bold text-xs">{property.name}</p>
//                         {property.area && (
//                           <p className="text-xs text-blue-200">{property.area}</p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/30">
//                   <div className="text-center">
//                     <div className="flex items-center justify-center gap-1 mb-1">
//                       <Percent className="h-4 w-4" />
//                       <span className="text-base font-bold">FLAT</span>
//                     </div>
//                     <div className="text-2xl font-black mb-1">{discountValue}</div>
//                     <p className="text-sm font-semibold">DISCOUNT</p>
//                   </div>
//                 </div>

//                 <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
//                   <div className="flex items-center gap-2">
//                     <div className="bg-white p-1 rounded">
//                       <Scan className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <div>
//                       <p className="font-bold text-xs">Scan to Apply</p>
//                       <p className="text-xs text-blue-200">Code: {offer.code}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="md:w-3/5 p-4">
//               <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <div className="bg-blue-100 p-1 rounded">
//                     <IndianRupee className="h-4 w-4 text-blue-600" />
//                   </div>
//                   <div>
//                     <h2 className="text-lg font-bold text-gray-800">Exclusive Deal</h2>
//                     <p className="text-gray-600 text-xs">
//                       {property ? `At ${property.name}` : "Premium PG accommodation"}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className="flex items-center gap-1 text-red-600">
//                     <Clock className="h-3 w-3" />
//                     <span className="font-bold text-sm">{getDaysLeft()}</span>
//                   </div>
//                 </div>
//               </div>

//               {room && (
//                 <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <Key className="h-4 w-4 text-green-600" />
//                       <div>
//                         <h4 className="font-bold text-gray-800 text-sm mb-1">
//                           Room {room.room_number} - {room.sharing_type.charAt(0).toUpperCase() + room.sharing_type.slice(1)}
//                         </h4>
//                         <div className="flex items-baseline gap-2">
//                           <span className="text-lg font-bold text-gray-800">
//                             ₹{calculateDiscountedPrice(room.rent_per_bed).toLocaleString()}
//                           </span>
//                           <span className="text-gray-500 text-sm line-through">
//                             ₹{room.rent_per_bed.toLocaleString()}
//                           </span>
//                           <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
//                             Save ₹{(room.rent_per_bed - calculateDiscountedPrice(room.rent_per_bed)).toLocaleString()}
//                           </Badge>
//                         </div>
//                         <div className="flex items-center gap-3 mt-2">
//                           <div className="flex items-center gap-1">
//                             <Bed className="h-3 w-3 text-gray-500" />
//                             <span className="text-xs text-gray-600">{room.total_bed} beds</span>
//                           </div>
//                           {room.has_attached_bathroom && (
//                             <div className="flex items-center gap-1">
//                               <Bath className="h-3 w-3 text-gray-500" />
//                               <span className="text-xs text-gray-600">Attached Bath</span>
//                             </div>
//                           )}
//                           {room.has_ac && (
//                             <div className="flex items-center gap-1">
//                               <Snowflake className="h-3 w-3 text-gray-500" />
//                               <span className="text-xs text-gray-600">AC</span>
//                             </div>
//                           )}
//                           {room.has_balcony && (
//                             <div className="flex items-center gap-1">
//                               <Sun className="h-3 w-3 text-gray-500" />
//                               <span className="text-xs text-gray-600">Balcony</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {bonusDetails.title && (
//                 <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 mb-4">
//                   <div className="flex flex-col md:flex-row items-center justify-between gap-2">
//                     <div className="flex items-center gap-2">
//                       <Zap className="h-5 w-5 text-amber-600" />
//                       <div>
//                         <h4 className="font-bold text-gray-800 text-sm mb-1">{bonusDetails.title}</h4>
//                         <p className="text-gray-600 text-xs">{bonusDetails.description}</p>
//                         {bonusDetails.valid_until && (
//                           <p className="text-amber-600 text-xs font-medium mt-1">
//                             Valid until: {new Date(bonusDetails.valid_until).toLocaleDateString()}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                   {bonusDetails.conditions && (
//                     <div className="mt-2">
//                       <p className="text-xs text-gray-700 font-medium">Special Offers:</p>
//                       <div className="flex flex-wrap gap-1 mt-1">
//                         {bonusDetails.conditions.split(',').map((condition, index) => (
//                           <Badge key={index} className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
//                             {condition.trim()}
//                           </Badge>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {property && property.amenities && property.amenities.length > 0 && (
//                 <div className="mb-4">
//                   <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-1">
//                     <ShieldCheck className="h-3 w-3" />
//                     Property Amenities
//                   </h3>
//                   <div className="grid grid-cols-2 gap-1">
//                     {property.amenities.slice(0, 8).map((amenity, index) => {
//                       const getIcon = () => {
//                         if (amenity.toLowerCase().includes('wifi')) return <Wifi className="h-3 w-3 text-blue-600" />;
//                         if (amenity.toLowerCase().includes('tv')) return <Tv className="h-3 w-3 text-blue-600" />;
//                         if (amenity.toLowerCase().includes('breakfast') || amenity.toLowerCase().includes('food')) return <Coffee className="h-3 w-3 text-blue-600" />;
//                         if (amenity.toLowerCase().includes('gym')) return <Dumbbell className="h-3 w-3 text-blue-600" />;
//                         return <Star className="h-3 w-3 text-blue-600" />;
//                       };
                      
//                       return (
//                         <div key={index} className="flex items-center gap-1 p-1 bg-gray-50 rounded text-xs">
//                           {getIcon()}
//                           <span className="font-medium">{amenity}</span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-3">
//                 <div className="flex flex-col md:flex-row items-center justify-between gap-2">
//                   <div>
//                     <h4 className="font-bold text-gray-800 text-sm mb-1">Ready to Book?</h4>
//                     <p className="text-gray-600 text-xs">Apply offer code at checkout</p>
//                   </div>
//                   <div className="flex gap-1">
//                     <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-1 text-xs h-7">
//                       <CreditCard className="h-3 w-3 mr-1" />
//                       Book Now
//                     </Button>
//                   </div>
//                 </div>
//               </div>

//               <div className="border-t border-gray-200 pt-2">
//                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
//                   <div className="flex items-center gap-1">
//                     <div className="bg-gray-100 p-1 rounded">
//                       <Shield className="h-3 w-3 text-gray-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium text-gray-800 text-xs">Terms</p>
//                       <p className="text-gray-600 text-xs">Min. {offer.min_months} months stay</p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-gray-500 text-xs">Offer Code: <span className="font-bold">{offer.code}</span></p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const Pagination = ({ 
//   currentPage, 
//   totalPages, 
//   onPageChange,
//   className = ""
// }: { 
//   currentPage: number; 
//   totalPages: number; 
//   onPageChange: (page: number) => void;
//   className?: string;
// }) => {
//   const getPageNumbers = () => {
//     const delta = 2;
//     const range = [];
//     const rangeWithDots = [];
//     let l;

//     for (let i = 1; i <= totalPages; i++) {
//       if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
//         range.push(i);
//       }
//     }

//     range.forEach((i) => {
//       if (l) {
//         if (i - l === 2) {
//           rangeWithDots.push(l + 1);
//         } else if (i - l !== 1) {
//           rangeWithDots.push('...');
//         }
//       }
//       rangeWithDots.push(i);
//       l = i;
//     });

//     return rangeWithDots;
//   };

//   if (totalPages <= 1) return null;

//   return (
//     <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
//       <div className="text-sm text-gray-600">
//         Page {currentPage} of {totalPages}
//       </div>
      
//       <div className="flex items-center gap-2">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => onPageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="h-8 px-3"
//         >
//           <ChevronLeft className="h-4 w-4 mr-1" />
//           Previous
//         </Button>
        
//         <div className="flex items-center gap-1">
//           {getPageNumbers().map((pageNum, index) => (
//             pageNum === '...' ? (
//               <span key={index} className="px-2 text-gray-500">...</span>
//             ) : (
//               <Button
//                 key={index}
//                 variant={currentPage === pageNum ? "default" : "outline"}
//                 size="sm"
//                 onClick={() => onPageChange(pageNum as number)}
//                 className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
//               >
//                 {pageNum}
//               </Button>
//             )
//           ))}
//         </div>
        
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => onPageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="h-8 px-3"
//         >
//           Next
//           <ChevronRight className="h-4 w-4 ml-1" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// const ItemsPerPageSelector = ({ 
//   value, 
//   onChange 
// }: { 
//   value: string; 
//   onChange: (value: string) => void;
// }) => (
//   <div className="flex items-center gap-2">
//     <Label htmlFor="items-per-page" className="text-sm text-gray-600 whitespace-nowrap">
//       Items per page:
//     </Label>
//     <Select
//       value={value}
//       onValueChange={onChange}
//     >
//       <SelectTrigger className="w-20 h-8">
//         <SelectValue placeholder="10" />
//       </SelectTrigger>
//       <SelectContent>
//         <SelectItem value="5">5</SelectItem>
//         <SelectItem value="10">10</SelectItem>
//         <SelectItem value="20">20</SelectItem>
//         <SelectItem value="50">50</SelectItem>
//       </SelectContent>
//     </Select>
//   </div>
// );

// const OfferTableSkeleton = () => (
//   <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
//     <Table>
//       <TableHeader>
//         <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
//           <TableHead className="font-semibold text-gray-700">Code</TableHead>
//           <TableHead className="font-semibold text-gray-700">Offer Details</TableHead>
//           <TableHead className="font-semibold text-gray-700">Property / Room</TableHead>
//           <TableHead className="font-semibold text-gray-700">Discount</TableHead>
//           <TableHead className="font-semibold text-gray-700">Min Stay</TableHead>
//           <TableHead className="font-semibold text-gray-700">Validity</TableHead>
//           <TableHead className="font-semibold text-gray-700">Status</TableHead>
//           <TableHead className="font-semibold text-gray-700">Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {Array.from({ length: 5 }).map((_, index) => (
//           <TableRow key={index}>
//             <TableCell>
//               <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
//             </TableCell>
//             <TableCell>
//               <div className="space-y-2">
//                 <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
//                 <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
//               </div>
//             </TableCell>
//             <TableCell>
//               <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
//             </TableCell>
//             <TableCell>
//               <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
//             </TableCell>
//             <TableCell>
//               <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
//             </TableCell>
//             <TableCell>
//               <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
//             </TableCell>
//             <TableCell>
//               <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
//             </TableCell>
//             <TableCell>
//               <div className="flex gap-2">
//                 <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
//                 <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
//                 <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
//               </div>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   </div>
// );

// export default function OffersPage() {
//   const [offers, setOffers] = useState<Offer[]>([]);
//   const [properties, setProperties] = useState<PropertyApiResponse[]>([]);
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingRooms, setLoadingRooms] = useState(false);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
//   const [previewData, setPreviewData] = useState<OfferPreviewData | null>(null);
//   const [showPreview, setShowPreview] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterType, setFilterType] = useState("all");
//   const [filterProperty, setFilterProperty] = useState("all");
//   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
//   const [selectedShareOffer, setSelectedShareOffer] = useState<Offer | null>(null);
//   const [selectedShareProperty, setSelectedShareProperty] = useState<PropertyApiResponse | null>(null);
//   const [isGeneratingCode, setIsGeneratingCode] = useState(false);

//   // Pagination state
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0,
//     limit: 10,
//     hasNextPage: false,
//     hasPrevPage: false
//   });
//   const [itemsPerPage, setItemsPerPage] = useState("10");

//   const [formData, setFormData] = useState<FormData>({
//     code: "",
//     title: "",
//     description: "",
//     offer_type: "general",
//     discount_type: "percentage",
//     discount_value: "",
//     discount_percent: "",
//     min_months: "1",
//     start_date: "",
//     end_date: "",
//     terms_and_conditions: "",
//     is_active: true,
//     display_order: "0",
//     bonus_title: "",
//     bonus_description: "",
//     bonus_valid_until: "",
//     bonus_conditions: "",
//     property_id: null,
//     room_id: null
//   });

//   // Load offers with pagination
//   const loadOffers = async (page = 1, useFilters = true) => {
//     setLoading(true);
//     try {
//       const params: PaginationParams = {
//         page,
//         limit: parseInt(itemsPerPage),
//       };

//       if (useFilters) {
//         if (searchQuery) params.search = searchQuery;
//         if (filterType !== "all") params.offer_type = filterType;
//         if (filterProperty !== "all") params.property_id = filterProperty;
//       }

//       const response = await offerApi.getPaginated(params);
      
//       if (response.success) {
//         setOffers(response.data);
//         setPagination({
//           currentPage: response.pagination.currentPage,
//           totalPages: response.pagination.totalPages,
//           totalItems: response.pagination.totalItems,
//           limit: response.pagination.limit,
//           hasNextPage: response.pagination.hasNextPage,
//           hasPrevPage: response.pagination.hasPrevPage
//         });
//       } else {
//         // Fallback to old method if paginated fails
//         const data = await offerApi.getAll();
//         setOffers(data);
//         setPagination({
//           currentPage: 1,
//           totalPages: Math.ceil(data.length / parseInt(itemsPerPage)),
//           totalItems: data.length,
//           limit: parseInt(itemsPerPage),
//           hasNextPage: false,
//           hasPrevPage: false
//         });
//       }
//     } catch (err) {
//       console.error("Error loading offers:", err);
//       toast.error("Failed to load offers");
//       setOffers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadProperties = async () => {
//     try {
//       const response = await axios.get<ApiResponse>('http://localhost:3001/api/properties');
//       if (response.data.success && response.data.data) {
//         const activeProperties = response.data.data.filter(p => 
//           p.is_active && 
//           p.id && 
//           p.name && 
//           p.name.trim() !== ""
//         );
//         setProperties(activeProperties);
//       }
//     } catch (err) {
//       console.error("Error loading properties:", err);
//       toast.error("Failed to load properties");
//     }
//   };

//   const loadRoomsByProperty = async (propertyId: number) => {
//     setLoadingRooms(true);
//     try {
//       const rooms = await offerApi.getRoomsByProperty(propertyId);
//       setRooms(rooms);
//     } catch (err) {
//       console.error("Error loading rooms:", err);
//       toast.error("Failed to load rooms");
//     } finally {
//       setLoadingRooms(false);
//     }
//   };

//   const handleGenerateCode = async () => {
//     setIsGeneratingCode(true);
//     try {
//       const result = await offerApi.generateOfferCode();
//       if (result.code) {
//         setFormData(prev => ({ ...prev, code: result.code }));
//         toast.success("🎉 New offer code generated!");
//       } else {
//         // Fallback manual generation
//         const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//         let generatedCode = '';
//         for (let i = 0; i < 8; i++) {
//           generatedCode += characters.charAt(Math.floor(Math.random() * characters.length));
//         }
//         setFormData(prev => ({ ...prev, code: generatedCode }));
//         toast.warning("Using fallback code generation");
//       }
//     } catch (err) {
//       console.error("Error generating code:", err);
//       // Fallback to client-side generation
//       const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//       let fallbackCode = '';
//       for (let i = 0; i < 8; i++) {
//         fallbackCode += characters.charAt(Math.floor(Math.random() * characters.length));
//       }
//       setFormData(prev => ({ ...prev, code: fallbackCode }));
//       toast.error("Server error, using client-side generation");
//     } finally {
//       setIsGeneratingCode(false);
//     }
//   };

//   const handlePropertyChange = (propertyId: number | null) => {
//     if (propertyId) {
//       loadRoomsByProperty(propertyId);
//     } else {
//       setRooms([]);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       code: "",
//       title: "",
//       description: "",
//       offer_type: "general",
//       discount_type: "percentage",
//       discount_value: "",
//       discount_percent: "",
//       min_months: "1",
//       start_date: "",
//       end_date: "",
//       terms_and_conditions: "",
//       is_active: true,
//       display_order: "0",
//       bonus_title: "",
//       bonus_description: "",
//       bonus_valid_until: "",
//       bonus_conditions: "",
//       property_id: null,
//       room_id: null
//     });
//     setRooms([]);
//   };

//   // Load initial data
//   useEffect(() => {
//     loadOffers();
//     loadProperties();
//   }, []);

//   // Reload when filters or items per page change
//   useEffect(() => {
//     loadOffers(1);
//   }, [searchQuery, filterType, filterProperty, itemsPerPage]);

//   const existingOfferCodes = useMemo(() => {
//     return offers.map(offer => offer.code.toUpperCase());
//   }, [offers]);

//   const handlePageChange = (page: number) => {
//     loadOffers(page, false);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleAdd = async () => {
//     if (!formData.title || !formData.code) {
//       toast.error("Please fill in offer title and code");
//       return;
//     }

//     const uppercaseCode = formData.code.toUpperCase();
//     if (existingOfferCodes.includes(uppercaseCode)) {
//       toast.error("This offer code already exists");
//       return;
//     }

//     // Validate discount values
//     if (formData.discount_type === "percentage" && (!formData.discount_percent || parseFloat(formData.discount_percent) <= 0)) {
//       toast.error("Please enter a valid discount percentage");
//       return;
//     }

//     if (formData.discount_type === "fixed" && (!formData.discount_value || parseFloat(formData.discount_value) <= 0)) {
//       toast.error("Please enter a valid discount amount");
//       return;
//     }

//     try {
//       const body = {
//         code: uppercaseCode,
//         title: formData.title,
//         description: formData.description || null,
//         offer_type: formData.offer_type,
//         discount_type: formData.discount_type,
//         discount_value:
//           formData.discount_type === "fixed"
//             ? parseFloat(formData.discount_value) || 0
//             : 0,
//         discount_percent:
//           formData.discount_type === "percentage"
//             ? parseFloat(formData.discount_percent) || 0
//             : 0,
//         min_months: parseInt(formData.min_months) || 1,
//         start_date: formData.start_date || null,
//         end_date: formData.end_date || null,
//         terms_and_conditions: formData.terms_and_conditions || null,
//         is_active: !!formData.is_active,
//         display_order: parseInt(formData.display_order) || 0,
//         bonus_title: formData.bonus_title || null,
//         bonus_description: formData.bonus_description || null,
//         bonus_valid_until: formData.bonus_valid_until || null,
//         bonus_conditions: formData.bonus_conditions || null,
//         property_id: formData.property_id || null,
//         room_id: formData.room_id || null,
//       };

//       const result = await offerApi.create(body);
//       toast.success("🎉 Offer created successfully!");
//       setIsAddDialogOpen(false);
//       resetForm();
//       await loadOffers(pagination.currentPage);
//     } catch (err: any) {
//       console.error("Error creating offer:", err);
//       toast.error(err.response?.data?.message || err.message || "Failed to create offer");
//     }
//   };

//   const handleEdit = (offer: Offer) => {
//     setSelectedOffer(offer);
//     setFormData({
//       code: offer.code || "",
//       title: offer.title,
//       description: offer.description || "",
//       offer_type: offer.offer_type || "general",
//       discount_type: offer.discount_type || "percentage",
//       discount_value: (offer.discount_value ?? 0).toString(),
//       discount_percent: (offer.discount_percent ?? 0).toString(),
//       min_months: (offer.min_months ?? 1).toString(),
//       start_date: offer.start_date ? offer.start_date.split('T')[0] : "",
//       end_date: offer.end_date ? offer.end_date.split('T')[0] : "",
//       terms_and_conditions: offer.terms_and_conditions || "",
//       is_active: !!offer.is_active,
//       display_order: (offer.display_order ?? 0).toString(),
//       bonus_title: (offer as any).bonus_title || "",
//       bonus_description: (offer as any).bonus_description || "",
//       bonus_valid_until: (offer as any).bonus_valid_until ? (offer as any).bonus_valid_until.split('T')[0] : "",
//       bonus_conditions: (offer as any).bonus_conditions || "",
//       property_id: offer.property_id || null,
//       room_id: offer.room_id || null
//     });
    
//     if (offer.property_id) {
//       handlePropertyChange(offer.property_id);
//     }
    
//     setIsEditDialogOpen(true);
//   };

//   const handleUpdate = async () => {
//     if (!selectedOffer) return;

//     const uppercaseCode = formData.code.toUpperCase();
//     if (uppercaseCode !== selectedOffer.code && existingOfferCodes.includes(uppercaseCode)) {
//       toast.error("This offer code already exists");
//       return;
//     }

//     if (formData.discount_type === "percentage" && (!formData.discount_percent || parseFloat(formData.discount_percent) <= 0)) {
//       toast.error("Please enter a valid discount percentage");
//       return;
//     }

//     if (formData.discount_type === "fixed" && (!formData.discount_value || parseFloat(formData.discount_value) <= 0)) {
//       toast.error("Please enter a valid discount amount");
//       return;
//     }

//     try {
//       const body = {
//         code: uppercaseCode,
//         title: formData.title,
//         description: formData.description || null,
//         offer_type: formData.offer_type,
//         discount_type: formData.discount_type,
//         discount_value:
//           formData.discount_type === "fixed"
//             ? parseFloat(formData.discount_value) || 0
//             : 0,
//         discount_percent:
//           formData.discount_type === "percentage"
//             ? parseFloat(formData.discount_percent) || 0
//             : 0,
//         min_months: parseInt(formData.min_months) || 1,
//         start_date: formData.start_date || null,
//         end_date: formData.end_date || null,
//         terms_and_conditions: formData.terms_and_conditions || null,
//         is_active: !!formData.is_active,
//         display_order: parseInt(formData.display_order) || 0,
//         bonus_title: formData.bonus_title || null,
//         bonus_description: formData.bonus_description || null,
//         bonus_valid_until: formData.bonus_valid_until || null,
//         bonus_conditions: formData.bonus_conditions || null,
//         property_id: formData.property_id || null,
//         room_id: formData.room_id || null,
//         updated_at: new Date().toISOString(),
//       };

//       await offerApi.update(selectedOffer.id, body);
//       toast.success("✅ Offer updated successfully!");
//       setIsEditDialogOpen(false);
//       setSelectedOffer(null);
//       resetForm();
//       await loadOffers(pagination.currentPage);
//     } catch (err: any) {
//       console.error("❌ Error updating offer:", err);
//       toast.error(err.response?.data?.message || err.message || "Failed to update offer");
//     }
//   };

//   const handleDelete = async (offerId: string) => {
//     if (!confirm("Are you sure you want to delete this offer?")) return;
    
//     try {
//       await offerApi.remove(offerId);
//       toast.success("🗑️ Offer deleted successfully!");
      
//       if (offers.length === 1 && pagination.currentPage > 1) {
//         await loadOffers(pagination.currentPage - 1);
//       } else {
//         await loadOffers(pagination.currentPage);
//       }
//     } catch (err: any) {
//       console.error("Error deleting offer:", err);
//       toast.error(err.response?.data?.message || err.message || "Failed to delete offer");
//     }
//   };

//   const toggleActive = async (offerId: string, currentStatus: boolean) => {
//     try {
//       await offerApi.toggleActive(offerId, !currentStatus);
//       toast.success(`✨ Offer ${!currentStatus ? "activated" : "deactivated"} successfully!`);
//       await loadOffers(pagination.currentPage);
//     } catch (err: any) {
//       console.error("Error toggling offer active:", err);
//       toast.error(err.response?.data?.message || "Failed to update offer status");
//     }
//   };

//   const handlePreview = async (offer: Offer) => {
//     try {
//       const fullOffer = await offerApi.getById(offer.id);
      
//       let property = null;
//       if (fullOffer.property_id) {
//         try {
//           const propResponse = await axios.get(`http://localhost:3001/api/properties/${fullOffer.property_id}`);
//           if (propResponse.data.success) {
//             property = propResponse.data.data;
//           }
//         } catch (error) {
//           console.error("Error fetching property details:", error);
//         }
//       }

//       let room = null;
//       if (fullOffer.room_id) {
//         try {
//           if (fullOffer.property_id) {
//             const propertyRooms = await offerApi.getRoomsByProperty(fullOffer.property_id);
//             room = propertyRooms.find(r => r.id === fullOffer.room_id) || null;
//           }
//         } catch (error) {
//           console.error("Error fetching room details:", error);
//         }
//       }

//       const bonusData: BonusDetails = {
//         title: (fullOffer as any).bonus_title || "",
//         description: (fullOffer as any).bonus_description || "",
//         valid_until: (fullOffer as any).bonus_valid_until || "",
//         conditions: (fullOffer as any).bonus_conditions || ""
//       };

//       setPreviewData({
//         offer: fullOffer,
//         property,
//         room,
//         bonusDetails: bonusData
//       });
//       setShowPreview(true);
//     } catch (err) {
//       console.error("Error loading offer details:", err);
//       toast.error("Failed to load offer preview");
//     }
//   };

//   const handleShare = async (offer: Offer) => {
//     setSelectedShareOffer(offer);
    
//     let property = null;
//     if (offer.property_id) {
//       const prop = properties.find(p => p.id === offer.property_id);
//       if (prop) property = prop;
//     }
    
//     setSelectedShareProperty(property);
//     setIsShareModalOpen(true);
//   };

//   const renderPropertyInfo = (offer: Offer) => {
//     if (!offer.property_name) {
//       return (
//         <div className="flex items-center gap-2">
//           <Building className="h-3 w-3 text-gray-400" />
//           <span className="text-gray-500 text-sm">General Offer</span>
//         </div>
//       );
//     }
    
//     return (
//       <div className="space-y-1">
//         <div className="flex items-center gap-2">
//           <Building className="h-3 w-3 text-purple-500" />
//           <span className="font-medium text-sm">{offer.property_name}</span>
//         </div>
//         {offer.room_number && (
//           <div className="flex items-center gap-2 text-xs text-gray-600 ml-1">
//             <Key className="h-3 w-3" />
//             <span>Room {offer.room_number}</span>
//             {offer.sharing_type && (
//               <Badge variant="outline" className="text-xs px-1 py-0 h-4 capitalize">
//                 {offer.sharing_type}
//               </Badge>
//             )}
//             {offer.rent_per_bed && (
//               <span className="text-xs text-green-600">
//                 ₹{offer.rent_per_bed}/bed
//               </span>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };

//   const startItem = (pagination.currentPage - 1) * pagination.limit + 1;
//   const endItem = Math.min(pagination.currentPage * pagination.limit, pagination.totalItems);

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <AdminHeader title="Offers" />

//       <div className="p-6">
//         <Card className="border-0 shadow-xl bg-white">
//           <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
//             <div className="flex items-center justify-between">
//               <div>
//                 <CardTitle className="flex items-center gap-3 text-2xl">
//                   <div className="bg-white/20 p-2 rounded-lg">
//                     <Tag className="h-7 w-7" />
//                   </div>
//                   <div>
//                     <div>Offer Management</div>
//                     <CardDescription className="text-blue-100">
//                       Create and manage promotional offers for properties and rooms
//                     </CardDescription>
//                   </div>
//                 </CardTitle>
//               </div>
//               <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//                 <DialogTrigger asChild>
//                   <Button className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-0 font-bold">
//                     <Plus className="h-5 w-5 mr-2" />
//                     Create New Offer
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//                   <DialogHeader>
//                     <div className="flex items-center gap-3">
//                       <div className="bg-blue-100 p-2 rounded-lg">
//                         <Megaphone className="h-6 w-6 text-blue-600" />
//                       </div>
//                       <div>
//                         <DialogTitle>Create New Offer</DialogTitle>
//                         <CardDescription>Fill in the details to create an attractive promotional offer</CardDescription>
//                       </div>
//                     </div>
//                   </DialogHeader>
//                   <OfferFormFields
//                     formData={formData}
//                     setFormData={setFormData}
//                     existingCodes={existingOfferCodes}
//                     properties={properties}
//                     rooms={rooms}
//                     loadingRooms={loadingRooms}
//                     onPropertyChange={handlePropertyChange}
//                     onGenerateCode={handleGenerateCode}
//                     isGeneratingCode={isGeneratingCode}
//                   />
//                   <DialogFooter>
//                     <Button
//                       variant="outline"
//                       onClick={() => {
//                         setIsAddDialogOpen(false);
//                         resetForm();
//                       }}
//                       className="border-gray-300"
//                     >
//                       Cancel
//                     </Button>
//                     <Button onClick={handleAdd} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
//                       Create Offer
//                     </Button>
//                   </DialogFooter>
//                 </DialogContent>
//               </Dialog>
//             </div>
//           </CardHeader>

//           <CardContent className="p-6">
//             {/* Filters and Search */}
//             <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//                 <div className="md:col-span-2">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       placeholder="Search offers by code, title, property, room, discount..."
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className="pl-10"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <Select value={filterType} onValueChange={setFilterType}>
//                     <SelectTrigger>
//                       <div className="flex items-center gap-2">
//                         <Filter className="h-4 w-4" />
//                         <SelectValue placeholder="Filter by type" />
//                       </div>
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Types</SelectItem>
//                       <SelectItem value="general">General</SelectItem>
//                       <SelectItem value="seasonal">Seasonal</SelectItem>
//                       <SelectItem value="student">Student</SelectItem>
//                       <SelectItem value="corporate">Corporate</SelectItem>
//                       <SelectItem value="referral">Referral</SelectItem>
//                       <SelectItem value="early_booking">Early Booking</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Select value={filterProperty} onValueChange={setFilterProperty}>
//                     <SelectTrigger>
//                       <div className="flex items-center gap-2">
//                         <Building className="h-4 w-4" />
//                         <SelectValue placeholder="Filter by property" />
//                       </div>
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Properties</SelectItem>
//                       <SelectItem value="general">General Offers</SelectItem>
//                       {properties.map((property) => (
//                         <SelectItem key={property.id} value={property.id.toString()}>
//                           {property.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
              
//               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//                 <div className="text-sm text-gray-600">
//                   Showing <span className="font-semibold">{startItem}</span>-
//                   <span className="font-semibold">{endItem}</span> of{" "}
//                   <span className="font-semibold">{pagination.totalItems}</span> offers
//                   {searchQuery && (
//                     <span> for "<span className="font-medium">{searchQuery}</span>"</span>
//                   )}
//                 </div>
                
//                 <div className="flex items-center gap-4">
//                   <ItemsPerPageSelector 
//                     value={itemsPerPage}
//                     onChange={setItemsPerPage}
//                   />
                  
//                   {searchQuery && (
//                     <Button
//                       variant="ghost"
//                       onClick={() => setSearchQuery("")}
//                       className="text-gray-500 hover:text-gray-700 text-sm h-8"
//                     >
//                       Clear Search
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Loading State */}
//             {loading ? (
//               <div className="space-y-4">
//                 <OfferTableSkeleton />
//                 <div className="text-center py-8">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
//                   <p className="text-slate-500">Loading offers...</p>
//                 </div>
//               </div>
//             ) : offers.length === 0 ? (
//               <div className="text-center py-16">
//                 <div className="bg-gradient-to-r from-blue-100 to-cyan-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Tag className="h-12 w-12 text-blue-400" />
//                 </div>
//                 <p className="text-slate-700 font-medium text-lg mb-2">
//                   {searchQuery ? "No offers match your search" : "No offers created yet"}
//                 </p>
//                 <p className="text-slate-500 mb-6">
//                   {searchQuery
//                     ? "Try a different search term or clear the filter"
//                     : "Create your first offer to attract more tenants"
//                   }
//                 </p>
//                 {!searchQuery && (
//                   <Button
//                     onClick={() => setIsAddDialogOpen(true)}
//                     className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
//                   >
//                     <Plus className="h-4 w-4 mr-2" />
//                     Create Your First Offer
//                   </Button>
//                 )}
//               </div>
//             ) : (
//               <>
//                 {/* Offers Table */}
//                 <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm mb-6">
//                   <Table>
//                     <TableHeader>
//                       <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
//                         <TableHead className="font-semibold text-gray-700">Code</TableHead>
//                         <TableHead className="font-semibold text-gray-700">Offer Details</TableHead>
//                         <TableHead className="font-semibold text-gray-700">Property / Room</TableHead>
//                         <TableHead className="font-semibold text-gray-700">Discount</TableHead>
//                         <TableHead className="font-semibold text-gray-700">Min Stay</TableHead>
//                         <TableHead className="font-semibold text-gray-700">Validity</TableHead>
//                         <TableHead className="font-semibold text-gray-700">Status</TableHead>
//                         <TableHead className="font-semibold text-gray-700">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {offers.map((offer) => (
//                         <TableRow key={offer.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
//                           <TableCell className="font-mono font-bold text-blue-700">
//                             <div className="flex items-center gap-2">
//                               <Ticket className="h-3 w-3 text-blue-500" />
//                               {offer.code}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div>
//                               <p className="font-semibold text-gray-800">
//                                 {offer.title}
//                               </p>
//                               <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
//                                 {offer.offer_type === 'seasonal' && <Calendar className="h-3 w-3 text-orange-500" />}
//                                 {offer.offer_type === 'student' && <Award className="h-3 w-3 text-blue-500" />}
//                                 {offer.offer_type === 'corporate' && <Shield className="h-3 w-3 text-gray-600" />}
//                                 {offer.offer_type === 'referral' && <Users className="h-3 w-3 text-green-500" />}
//                                 {offer.offer_type === 'early_booking' && <Clock className="h-3 w-3 text-cyan-500" />}
//                                 {offer.offer_type === 'general' && <Star className="h-3 w-3 text-yellow-500" />}
//                                 <span className="text-xs">
//                                   {offer.description || offer.offer_type.replace('_', ' ')}
//                                 </span>
//                               </p>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             {renderPropertyInfo(offer)}
//                           </TableCell>
//                           <TableCell>
//                             <Badge variant="secondary" className={`${offer.discount_type === "percentage"
//                                 ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
//                                 : "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200"
//                               } font-medium`}>
//                               {offer.discount_type === "percentage" ? (
//                                 <div className="flex items-center gap-1">
//                                   {offer.discount_percent}% OFF
//                                 </div>
//                               ) : (
//                                 <div className="flex items-center gap-1">
//                                   ₹{offer.discount_value} OFF
//                                 </div>
//                               )}
//                             </Badge>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-1">
//                               <Calendar className="h-3 w-3 text-gray-400" />
//                               <span className="font-medium">{offer.min_months} months</span>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="text-sm">
//                               {offer.start_date ? (
//                                 <div className="flex items-center gap-2">
//                                   <Calendar className="h-4 w-4 text-slate-500" />
//                                   <span>{new Date(offer.start_date).toLocaleDateString()}</span>
//                                 </div>
//                               ) : (
//                                 <span className="text-gray-500">No start date</span>
//                               )}
//                               {offer.end_date && (
//                                 <p className="text-slate-500 text-xs mt-1">
//                                   to {new Date(offer.end_date).toLocaleDateString()}
//                                 </p>
//                               )}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <Button
//                               size="sm"
//                               variant={offer.is_active ? "default" : "outline"}
//                               onClick={() => toggleActive(offer.id, offer.is_active)}
//                               className={`${offer.is_active
//                                   ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
//                                   : "border-gray-300 hover:border-gray-400"
//                                 }`}
//                             >
//                               {offer.is_active ? "Active" : "Inactive"}
//                             </Button>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handlePreview(offer)}
//                                 className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border-gray-300"
//                                 title="View Offer Preview"
//                               >
//                                 <Eye className="h-4 w-4" />
//                               </Button>

//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleEdit(offer)}
//                                 className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border-gray-300"
//                                 title="Edit Offer"
//                               >
//                                 <Edit className="h-4 w-4" />
//                               </Button>

//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleDelete(offer.id)}
//                                 className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 border-gray-300"
//                                 title="Delete Offer"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>

//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleShare(offer)}
//                                 className="hover:bg-green-50 hover:text-green-600 hover:border-green-300 border-gray-300"
//                                 title="Share Offer"
//                               >
//                                 <Share2 className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
                
//                 {/* Pagination */}
//                 {pagination.totalPages > 1 && (
//                   <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
//                     <Pagination
//                       currentPage={pagination.currentPage}
//                       totalPages={pagination.totalPages}
//                       onPageChange={handlePageChange}
//                       className="py-2"
//                     />
//                   </div>
//                 )}
//               </>
//             )}
//           </CardContent>
//         </Card>

//         {/* Edit Dialog */}
//         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//           <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <div className="flex items-center gap-3">
//                 <div className="bg-blue-100 p-2 rounded-lg">
//                   <Edit className="h-6 w-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <DialogTitle>Edit Offer</DialogTitle>
//                   <CardDescription>Update the offer details</CardDescription>
//                 </div>
//               </div>
//             </DialogHeader>
//             <OfferFormFields
//               formData={formData}
//               setFormData={setFormData}
//               existingCodes={existingOfferCodes}
//               isEdit={true}
//               currentCode={selectedOffer?.code || ""}
//               properties={properties}
//               rooms={rooms}
//               loadingRooms={loadingRooms}
//               onPropertyChange={handlePropertyChange}
//               onGenerateCode={handleGenerateCode}
//               isGeneratingCode={isGeneratingCode}
//             />
//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setIsEditDialogOpen(false);
//                   setSelectedOffer(null);
//                   resetForm();
//                 }}
//                 className="border-gray-300"
//               >
//                 Cancel
//               </Button>
//               <Button onClick={handleUpdate} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
//                 Update Offer
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Offer Preview */}
//       {previewData && (
//         <OfferPreview
//           previewData={previewData}
//           isOpen={showPreview}
//           onClose={() => setShowPreview(false)}
//         />
//       )}

//       {/* Enhanced Share Modal */}
//       <ShareModal
//         isOpen={isShareModalOpen}
//         onClose={() => {
//           setIsShareModalOpen(false);
//           setSelectedShareOffer(null);
//           setSelectedShareProperty(null);
//         }}
//         offer={selectedShareOffer}
//         property={selectedShareProperty}
//       />
//     </div>
//   );
// }




// app/admin/offers/page.tsx (Server Component)
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import OffersClientPage from '@/components/admin/offers/OffersClientPage';
import { Offer, offerApi } from '@/lib/offerApi';

export default function OffersPage() {
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
  const limit = 10;
  const initialParams = {
    page,
    limit,
    search: searchParams.get('search') || '',
    offer_type: searchParams.get('offer_type') || '',
    property_id: searchParams.get('property_id') || '',
    is_active: searchParams.get('is_active') === 'false' ? false : undefined,
  };
  const [initialOffers, setInitialOffers] = useState<Offer[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offerApi.getPaginated(initialParams)
      .then((response) => {
        if (response.success) {
          setInitialOffers(response.data);
          setPagination(response.pagination);
        }
      })
      .catch((err) => console.error('Error fetching initial offers:', err))
      .finally(() => setLoading(false));
  }, [page, searchParams.get('search'), searchParams.get('offer_type'), searchParams.get('property_id'), searchParams.get('is_active')]);

  if (loading) return <div className="p-4">Loading...</div>;
  const searchParamsObj = {
    page: searchParams.get('page') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    offer_type: searchParams.get('offer_type') ?? undefined,
    property_id: searchParams.get('property_id') ?? undefined,
    is_active: searchParams.get('is_active') ?? undefined,
  };
  return (
    <OffersClientPage 
      initialOffers={initialOffers}
      initialPagination={pagination}
      searchParams={searchParamsObj}
    />
  );
}