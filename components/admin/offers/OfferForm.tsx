// // app/admin/offers/components/OfferForm.tsx
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import {
//   Building,
//   Ticket,
//   Tag,
//   Megaphone,
//   BellRing,
//   Calendar,
//   Clock,
//   Award,
//   Shield,
//   Users,
//   Star,
//   RefreshCw,
//   Key,
//   Percent,
//   IndianRupee,
//   Sparkles,
//   Zap,
// } from "lucide-react";
// import { PropertyApiResponse } from "./OffersClientPage";
// import { Room } from "@/lib/offerApi";
// import { useState } from "react";

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

// interface OfferFormProps {
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

// const OfferForm = ({
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
//   isGeneratingCode = false,
// }: OfferFormProps) => {
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

// export default OfferForm;

// app/admin/offers/components/OfferForm.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Building,
  Ticket,
  Tag,
  Megaphone,
  BellRing,
  Calendar,
  Clock,
  Award,
  Shield,
  Users,
  Star,
  RefreshCw,
  Key,
  Sparkles,
  X,
} from "lucide-react";
import { PropertyApiResponse } from "./OffersClientPage";
import { Room } from "@/lib/offerApi";
import { useState } from "react";

interface FormData {
  code: string;
  title: string;
  description: string;
  offer_type: string;
  discount_type: string;
  discount_value: string;
  discount_percent: string;
  min_months: string;
  start_date: string;
  end_date: string;
  terms_and_conditions: string;
  is_active: boolean;
  display_order: string;
  bonus_title: string;
  bonus_description: string;
  bonus_valid_until: string;
  bonus_conditions: string;
  property_id: number | null;
  room_id: number | null;
}

interface OfferFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  existingCodes?: string[];
  isEdit?: boolean;
  currentCode?: string;
  properties?: PropertyApiResponse[];
  rooms?: Room[];
  loadingRooms?: boolean;
  onPropertyChange?: (propertyId: number | null) => void;
  onGenerateCode?: () => void;
  isGeneratingCode?: boolean;
}

const OfferForm = ({
  formData,
  setFormData,
  existingCodes = [],
  isEdit = false,
  currentCode = "",
  properties = [],
  rooms = [],
  loadingRooms = false,
  onPropertyChange,
  onGenerateCode,
  isGeneratingCode = false,
}: OfferFormProps) => {
  const [codeError, setCodeError] = useState("");

  const validateCode = (code: string) => {
    const uppercaseCode = code.toUpperCase();

    if (!uppercaseCode) {
      setCodeError("Offer code is required");
      return false;
    }

    if (uppercaseCode.length < 3) {
      setCodeError("Code must be at least 3 characters");
      return false;
    }

    if (isEdit && uppercaseCode === currentCode) {
      setCodeError("");
      return true;
    }

    if (existingCodes.includes(uppercaseCode)) {
      setCodeError("This offer code already exists");
      return false;
    }

    setCodeError("");
    return true;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, code: value }));
    validateCode(value);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-0 -mt-6">
      {/* Property & Room Selection - Full width on both mobile and desktop */}
      <div className="col-span-1 md:col-span-2">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-2.5 rounded-lg border border-purple-200">
          <h3 className="font-medium text-purple-700 mb-1.5 flex items-center gap-1 text-xs">
            <Building className="h-3 w-3" />
            Property & Room Selection
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="property_id" className="text-[10px] text-gray-700">
                Select Property (Optional)
              </Label>
              <Select
                value={formData.property_id?.toString() || "null"}
                onValueChange={(value) => {
                  const propertyId = value && value !== "null" ? parseInt(value) : null;
                  setFormData(prev => ({ 
                    ...prev, 
                    property_id: propertyId,
                    room_id: null
                  }));
                  onPropertyChange?.(propertyId);
                }}
              >
                <SelectTrigger id="property_id" className="h-7 text-[10px] border-purple-300">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null" className="text-[10px]">General Offer (All Properties)</SelectItem>
                  {properties.map((property) => (
                    <SelectItem 
                      key={property.id} 
                      value={property.id.toString()}
                      className="text-[10px]"
                    >
                      <div className="flex items-center gap-1">
                        <Building className="h-2.5 w-2.5" />
                        <span>{property.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[8px] text-gray-500">Leave empty for general offer</p>
            </div>

            {formData.property_id && (
              <div className="space-y-1">
                <Label htmlFor="room_id" className="text-[10px] text-gray-700">
                  Select Room (Optional)
                </Label>
                {loadingRooms ? (
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 h-7">
                    <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <Select
                    value={formData.room_id?.toString() || "null"}
                    onValueChange={(value) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        room_id: value && value !== "null" ? parseInt(value) : null 
                      }));
                    }}
                    disabled={rooms.length === 0}
                  >
                    <SelectTrigger id="room_id" className="h-7 text-[10px] border-purple-300">
                      <SelectValue placeholder={rooms.length === 0 ? "No rooms" : "Select room"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null" className="text-[10px]">All Rooms</SelectItem>
                      {rooms.map((room) => (
                        <SelectItem 
                          key={room.id} 
                          value={room.id.toString()}
                          className="text-[10px]"
                        >
                          <div className="flex items-center gap-1">
                            <Key className="h-2.5 w-2.5" />
                            <span>Room {room.room_number}</span>
                            <Badge variant="outline" className="text-[7px] px-1 py-0 h-3">
                              {room.sharing_type}
                            </Badge>
                            <span className="text-[8px]">₹{room.rent_per_bed}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-[8px] text-gray-500">Leave empty for all rooms</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Code */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="code" className="flex items-center gap-1 text-[10px] text-gray-700">
            <Ticket className="h-2.5 w-2.5" />
            Offer Code *
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onGenerateCode}
            disabled={isGeneratingCode}
            className="h-5 text-[8px] px-1.5"
          >
            {isGeneratingCode ? (
              <RefreshCw className="h-2 w-2 animate-spin" />
            ) : (
              "Generate"
            )}
          </Button>
        </div>
        <div className="relative">
          <Input
            id="code"
            placeholder="e.g., NEWYEAR2025"
            value={formData.code}
            onChange={handleCodeChange}
            className={`h-6 pl-6 text-[10px] ${codeError ? 'border-red-500' : ''}`}
          />
          <Ticket className="absolute left-1.5 top-1/2 transform -translate-y-1/2 h-2.5 w-2.5 text-gray-400" />
        </div>
        {codeError ? (
          <p className="text-red-500 text-[8px]">{codeError}</p>
        ) : (
          <p className="text-[8px] text-gray-500">8 chars, letters & numbers</p>
        )}
      </div>

      {/* Offer Type */}
      <div className="space-y-1">
        <Label htmlFor="offer_type" className="flex items-center gap-1 text-[10px] text-gray-700">
          <Tag className="h-2.5 w-2.5" />
          Offer Type
        </Label>
        <Select
          value={formData.offer_type}
          onValueChange={handleSelectChange("offer_type")}
        >
          <SelectTrigger id="offer_type" className="h-6 text-[10px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general" className="text-[10px]">General</SelectItem>
            <SelectItem value="seasonal" className="text-[10px]">Seasonal</SelectItem>
            <SelectItem value="student" className="text-[10px]">Student</SelectItem>
            <SelectItem value="corporate" className="text-[10px]">Corporate</SelectItem>
            <SelectItem value="referral" className="text-[10px]">Referral</SelectItem>
            <SelectItem value="early_booking" className="text-[10px]">Early Booking</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <Label htmlFor="title" className="flex items-center gap-1 text-[10px] text-gray-700">
          <Megaphone className="h-2.5 w-2.5" />
          Title *
        </Label>
        <div className="relative">
          <Input
            id="title"
            placeholder="e.g., New Year Special"
            value={formData.title}
            onChange={handleInputChange("title")}
            className="h-6 pl-6 text-[10px]"
          />
          <Megaphone className="absolute left-1.5 top-1/2 transform -translate-y-1/2 h-2.5 w-2.5 text-gray-400" />
        </div>
      </div>

      {/* Description - Full width */}
      <div className="col-span-1 md:col-span-2 space-y-1">
        <Label htmlFor="description" className="flex items-center gap-1 text-[10px] text-gray-700">
          <BellRing className="h-2.5 w-2.5" />
          Description
        </Label>
        <div className="relative">
          <Textarea
            id="description"
            placeholder="Brief description to attract tenants"
            rows={1}
            value={formData.description}
            onChange={handleInputChange("description")}
            className="pl-6 text-[10px] resize-none h-14"
          />
          <BellRing className="absolute left-1.5 top-2 h-2.5 w-2.5 text-gray-400" />
        </div>
      </div>

      {/* Discount Details - Full width */}
      <div className="col-span-1 md:col-span-2">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-2.5 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-700 mb-1.5 text-xs">Discount Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="space-y-1">
              <Label htmlFor="discount_type" className="text-[10px] text-gray-700">
                Discount Type *
              </Label>
              <Select
                value={formData.discount_type}
                onValueChange={handleSelectChange("discount_type")}
              >
                <SelectTrigger id="discount_type" className="h-6 text-[10px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage" className="text-[10px]">Percentage</SelectItem>
                  <SelectItem value="fixed" className="text-[10px]">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.discount_type === "percentage" ? (
              <div className="space-y-1">
                <Label htmlFor="discount_percent" className="text-[10px] text-gray-700">
                  Discount %
                </Label>
                <div className="relative">
                  <Input
                    id="discount_percent"
                    type="text"
                    placeholder="20"
                    value={formData.discount_percent}
                    onChange={handleInputChange("discount_percent")}
                    className="h-6 text-[10px] pr-4"
                  />
                  <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-[8px] text-gray-500">%</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="discount_value" className="text-[10px] text-gray-700">
                  Amount ₹
                </Label>
                <div className="relative">
                  <Input
                    id="discount_value"
                    type="text"
                    placeholder="5000"
                    value={formData.discount_value}
                    onChange={handleInputChange("discount_value")}
                    className="h-6 text-[10px] pr-4"
                  />
                  <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-[8px] text-gray-500">₹</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="min_months" className="text-[10px] text-gray-700">
                Min Stay
              </Label>
              <div className="relative">
                <Input
                  id="min_months"
                  type="text"
                  placeholder="3"
                  value={formData.min_months}
                  onChange={handleInputChange("min_months")}
                  className="h-6 text-[10px] pr-8"
                />
                <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-[8px] text-gray-500">months</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validity Dates */}
      <div className="space-y-1">
        <Label htmlFor="start_date" className="text-[10px] text-gray-700">
          Valid From
        </Label>
        <Input
          id="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleInputChange("start_date")}
          className="h-6 text-[10px]"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="end_date" className="text-[10px] text-gray-700">
          Valid Until
        </Label>
        <Input
          id="end_date"
          type="date"
          value={formData.end_date}
          onChange={handleInputChange("end_date")}
          className="h-6 text-[10px]"
        />
      </div>

      {/* Bonus Section - Full width */}
      <div className="col-span-1 md:col-span-2">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-2.5 rounded-lg border border-amber-200">
          <h3 className="font-medium text-amber-700 mb-1.5 flex items-center gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            Bonus (Optional)
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="bonus_title" className="text-[10px] text-gray-700">
                Title
              </Label>
              <Input
                id="bonus_title"
                placeholder="e.g., 1 month FREE"
                value={formData.bonus_title}
                onChange={handleInputChange("bonus_title")}
                className="h-6 text-[10px]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bonus_valid_until" className="text-[10px] text-gray-700">
                Valid Until
              </Label>
              <Input
                id="bonus_valid_until"
                type="date"
                value={formData.bonus_valid_until}
                onChange={handleInputChange("bonus_valid_until")}
                className="h-6 text-[10px]"
              />
            </div>
          </div>
          <div className="space-y-1 mt-2">
            <Label htmlFor="bonus_description" className="text-[10px] text-gray-700">
              Description
            </Label>
            <Input
              id="bonus_description"
              placeholder="e.g., Book for 12 months and get 1 month free!"
              value={formData.bonus_description}
              onChange={handleInputChange("bonus_description")}
              className="h-6 text-[10px]"
            />
          </div>
        </div>
      </div>

      {/* Terms & Conditions - Full width */}
      <div className="col-span-1 md:col-span-2 space-y-1">
        <Label htmlFor="terms_and_conditions" className="text-[10px] text-gray-700">
          Terms & Conditions
        </Label>
        <Textarea
          id="terms_and_conditions"
          placeholder="Terms and conditions"
          rows={1}
          value={formData.terms_and_conditions}
          onChange={handleInputChange("terms_and_conditions")}
          className="text-[10px] resize-none h-12"
        />
      </div>

      {/* Display Priority and Status */}
      <div className="space-y-1">
        <Label htmlFor="display_order" className="text-[10px] text-gray-700">
          Priority
        </Label>
        <Input
          id="display_order"
          type="text"
          placeholder="0"
          value={formData.display_order}
          onChange={handleInputChange("display_order")}
          className="h-6 text-[10px]"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="is_active" className="text-[10px] text-gray-700">
          Active
        </Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) =>
            setFormData(prev => ({ ...prev, is_active: checked }))
          }
          className="scale-75 origin-right"
        />
      </div>
    </div>
  );
};

export default OfferForm;