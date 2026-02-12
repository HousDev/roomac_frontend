// "use client";

// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Switch } from "@/components/ui/switch";
// import {
//   Building2,
//   Plus,
//   X,
//   Camera,
//   Home,
//   Users,
//   Wifi,
//   Utensils,
//   CalendarDays,
//   Clock3,
//   FileText,
//   ShieldCheck,
//   BadgeIndianRupee,
//   Shield,
//   Upload,
//   Check,
//   CheckCircle,
//   XSquare,
//   ListChecks,
//   Trash2,
//   MapPin,
//   Globe,
//   Phone,
//   User,
//   Key,
//   AlertCircle,
//   Info,
// } from "lucide-react";

// type Property = {
//   id: string;
//   name: string;
//   city_id?: string;
//   state: string;
//   area: string;
//   address: string;
//   total_rooms: number;
//   total_beds: number;
//   occupied_beds?: number;
//   starting_price: number;
//   security_deposit: number;
//   description?: string;
//   property_manager_name: string;
//   property_manager_phone: string;
//   amenities: string[];
//   services: string[];
//   photo_urls: string[];
//   property_rules?: string;
//   is_active: boolean;
//   lockin_period_months: number;
//   lockin_penalty_amount: number;
//   lockin_penalty_type: string;
//   notice_period_days: number;
//   notice_penalty_amount: number;
//   notice_penalty_type: string;
//   terms_conditions?: string;
//   additional_terms?: string;
// };

// type PropertyFormData = {
//   name: string;
//   city_id: string;
//   state: string;
//   area: string;
//   address: string;
//   total_rooms: number;
//   total_beds: number;
//   occupied_beds: number;
//   starting_price: number;
//   security_deposit: number;
//   description: string;
//   property_manager_name: string;
//   property_manager_phone: string;
//   amenities: string[];
//   services: string[];
//   photo_urls: string[];
//   property_rules: string;
//   lockin_period_months: number;
//   lockin_penalty_amount: number;
//   lockin_penalty_type: string;
//   notice_period_days: number;
//   notice_penalty_amount: number;
//   notice_penalty_type: string;
//   terms_conditions: string;
//   additional_terms: string;
// };

// interface PropertyFormProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   editMode: boolean;
//   selectedProperty: Property | null;
//   onSubmit: (data: PropertyFormData, photoFiles: File[], removedPhotos: string[]) => Promise<void>;
//   onReset: () => void;
//   loading: boolean;
// }

// const commonAmenities = [
//   "WiFi", "AC", "Parking", "Laundry", "Power Backup", "Lift", "CCTV",
//   "24/7 Security", "Gym", "Swimming Pool", "Garden", "Terrace", "TV",
//   "Refrigerator", "Microwave", "Geyser", "Furnished", "Housekeeping",
// ];

// const commonServices = [
//   "Food Service", "Room Cleaning", "Laundry Service", "Maintenance",
//   "Medical Assistance", "Transportation", "Package Handling", "Concierge",
// ];

// export default function PropertyForm({
//   open,
//   onOpenChange,
//   editMode,
//   selectedProperty,
//   onSubmit,
//   onReset,
//   loading,
// }: PropertyFormProps) {
//   const [activeTab, setActiveTab] = useState("basic");
//   const [formData, setFormData] = useState<PropertyFormData>({
//     name: "",
//     city_id: "",
//     state: "",
//     area: "",
//     address: "",
//     total_rooms: 0,
//     total_beds: 0,
//     occupied_beds: 0,
//     starting_price: 0,
//     security_deposit: 0,
//     description: "",
//     property_manager_name: "",
//     property_manager_phone: "",
//     amenities: [],
//     services: [],
//     photo_urls: [],
//     property_rules: "",
//     lockin_period_months: 0,
//     lockin_penalty_amount: 0,
//     lockin_penalty_type: "fixed",
//     notice_period_days: 0,
//     notice_penalty_amount: 0,
//     notice_penalty_type: "fixed",
//     terms_conditions: "",
//     additional_terms: "",
//   });

//   const [amenityInput, setAmenityInput] = useState("");
//   const [serviceInput, setServiceInput] = useState("");
//   const [photoFiles, setPhotoFiles] = useState<File[]>([]);
//   const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
//   const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
//   const [removedPhotoUrls, setRemovedPhotoUrls] = useState<string[]>([]);
//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});

//   // Initialize form when selectedProperty changes
//   useEffect(() => {
//     if (selectedProperty && editMode) {
//       const photoUrls = Array.isArray(selectedProperty.photo_urls) ? selectedProperty.photo_urls : [];

//       setFormData({
//         name: selectedProperty.name || "",
//         city_id: selectedProperty.city_id || "",
//         state: selectedProperty.state || "",
//         area: selectedProperty.area || "",
//         address: selectedProperty.address || "",
//         total_rooms: selectedProperty.total_rooms || 0,
//         total_beds: selectedProperty.total_beds || 0,
//         occupied_beds: selectedProperty.occupied_beds || 0,
//         starting_price: selectedProperty.starting_price || 0,
//         security_deposit: selectedProperty.security_deposit || 0,
//         description: selectedProperty.description || "",
//         property_manager_name: selectedProperty.property_manager_name || "",
//         property_manager_phone: selectedProperty.property_manager_phone || "",
//         amenities: Array.isArray(selectedProperty.amenities) ? selectedProperty.amenities : [],
//         services: Array.isArray(selectedProperty.services) ? selectedProperty.services : [],
//         photo_urls: photoUrls,
//         property_rules: selectedProperty.property_rules || "",
//         lockin_period_months: selectedProperty.lockin_period_months || 0,
//         lockin_penalty_amount: selectedProperty.lockin_penalty_amount || 0,
//         lockin_penalty_type: selectedProperty.lockin_penalty_type || "fixed",
//         notice_period_days: selectedProperty.notice_period_days || 0,
//         notice_penalty_amount: selectedProperty.notice_penalty_amount || 0,
//         notice_penalty_type: selectedProperty.notice_penalty_type || "fixed",
//         terms_conditions: selectedProperty.terms_conditions || "",
//         additional_terms: selectedProperty.additional_terms || "",
//       });

//       setExistingPhotoUrls(photoUrls);
//       setPhotoPreviews(photoUrls.map(url => {
//         if (url.startsWith('http') || url.startsWith('blob:')) return url;
//         const apiUrl = process.env.VITE_API_URL || '';
//         const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
//         return `${apiUrl}/${cleanUrl}`;
//       }));
//       setFormErrors({});
//     } else {
//       resetForm();
//     }
//   }, [selectedProperty, editMode]);

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       city_id: "",
//       state: "",
//       area: "",
//       address: "",
//       total_rooms: 0,
//       total_beds: 0,
//       occupied_beds: 0,
//       starting_price: 0,
//       security_deposit: 0,
//       description: "",
//       property_manager_name: "",
//       property_manager_phone: "",
//       amenities: [],
//       services: [],
//       photo_urls: [],
//       property_rules: "",
//       lockin_period_months: 0,
//       lockin_penalty_amount: 0,
//       lockin_penalty_type: "fixed",
//       notice_period_days: 0,
//       notice_penalty_amount: 0,
//       notice_penalty_type: "fixed",
//       terms_conditions: "",
//       additional_terms: "",
//     });
//     setAmenityInput("");
//     setServiceInput("");
//     setPhotoFiles([]);
//     setPhotoPreviews([]);
//     setExistingPhotoUrls([]);
//     setRemovedPhotoUrls([]);
//     setFormErrors({});
//     setActiveTab("basic");
//   };

//   const handleClose = () => {
//     resetForm();
//     onReset();
//     onOpenChange(false);
//   };

//   const validateForm = (): boolean => {
//     const errors: Record<string, string> = {};

//     if (!formData.name.trim()) {
//       errors.name = "Property name is required";
//     }

//     if (!formData.city_id.trim()) {
//       errors.city_id = "City is required";
//     }

//     if (!formData.state.trim()) {
//       errors.state = "State is required";
//     }

//     if (!formData.area.trim()) {
//       errors.area = "Area is required";
//     }

//     if (formData.total_rooms < 0) {
//       errors.total_rooms = "Number of rooms must be 0 or greater";
//     }

//     if (formData.total_beds < 0) {
//       errors.total_beds = "Number of beds must be 0 or greater";
//     }

//     if (formData.total_beds < formData.occupied_beds) {
//       errors.occupied_beds = "Occupied beds cannot exceed total beds";
//     }

//     if (formData.starting_price < 0) {
//       errors.starting_price = "Starting price must be 0 or greater";
//     }

//     if (formData.security_deposit < 0) {
//       errors.security_deposit = "Security deposit must be 0 or greater";
//     }

//     if (!formData.property_manager_name.trim()) {
//       errors.property_manager_name = "Manager name is required";
//     }

//     if (!formData.property_manager_phone.trim()) {
//       errors.property_manager_phone = "Manager phone is required";
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }
//     await onSubmit(formData, photoFiles, removedPhotoUrls);
//   };

//   const handlePhotosUpload = (files: File[]) => {
//     if (photoPreviews.length + files.length > 10) {
//       return;
//     }

//     const validFiles = files.filter(file => {
//       if (file.size > 5 * 1024 * 1024) {
//         return false;
//       }
//       return true;
//     });

//     const previews = validFiles.map((f) => URL.createObjectURL(f));
//     setPhotoPreviews((prev) => [...prev, ...previews]);
//     setPhotoFiles((prev) => [...prev, ...validFiles]);
//   };

//   const removeUploadedPhoto = (index: number) => {
//     const isExisting = index < existingPhotoUrls.length;

//     if (isExisting) {
//       const removedUrl = existingPhotoUrls[index];
//       if (removedPhotoUrls.includes(removedUrl)) return;
//       setRemovedPhotoUrls(prev => [...prev, removedUrl]);
//     } else {
//       const adjustedIndex = index - existingPhotoUrls.length;
//       const newPreviews = [...photoPreviews];
//       const removedPreview = newPreviews.splice(index, 1)[0];
//       URL.revokeObjectURL(removedPreview);
//       setPhotoPreviews(newPreviews);

//       const newFiles = [...photoFiles];
//       newFiles.splice(adjustedIndex, 1);
//       setPhotoFiles(newFiles);
//     }
//   };

//   const addAmenity = (amenity?: string) => {
//     const amenityToAdd = amenity || amenityInput.trim();
//     if (amenityToAdd && !formData.amenities.includes(amenityToAdd)) {
//       setFormData({
//         ...formData,
//         amenities: [...formData.amenities, amenityToAdd],
//       });
//       if (!amenity) setAmenityInput("");
//     }
//   };

//   const removeAmenity = (index: number) => {
//     setFormData({
//       ...formData,
//       amenities: formData.amenities.filter((_, i) => i !== index),
//     });
//   };

//   const addService = (service?: string) => {
//     const serviceToAdd = service || serviceInput.trim();
//     if (serviceToAdd && !formData.services.includes(serviceToAdd)) {
//       setFormData({
//         ...formData,
//         services: [...formData.services, serviceToAdd],
//       });
//       if (!service) setServiceInput("");
//     }
//   };

//   const removeService = (index: number) => {
//     setFormData({
//       ...formData,
//       services: formData.services.filter((_, i) => i !== index),
//     });
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader className="space-y-3">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-blue-50">
//               <Building2 className="h-6 w-6 text-blue-600" />
//             </div>
//             <div>
//               <DialogTitle className="text-xl font-bold">
//                 {editMode ? "Edit Property" : "Add New Property"}
//               </DialogTitle>
//               <DialogDescription>
//                 {editMode ? "Update property details" : "Enter property details below"}
//               </DialogDescription>
//             </div>
//           </div>
//         </DialogHeader>

//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="grid grid-cols-5 mb-6">
//             <TabsTrigger value="basic" className="text-sm">
//               <Home className="h-4 w-4 mr-2" />
//               Basic
//             </TabsTrigger>
//             <TabsTrigger value="amenities" className="text-sm">
//               <Wifi className="h-4 w-4 mr-2" />
//               Amenities
//             </TabsTrigger>
//             <TabsTrigger value="terms" className="text-sm">
//               <FileText className="h-4 w-4 mr-2" />
//               Terms
//             </TabsTrigger>
//             <TabsTrigger value="photos" className="text-sm">
//               <Camera className="h-4 w-4 mr-2" />
//               Photos
//             </TabsTrigger>
//             <TabsTrigger value="rules" className="text-sm">
//               <ShieldCheck className="h-4 w-4 mr-2" />
//               Rules
//             </TabsTrigger>
//           </TabsList>

//           {/* Basic Info Tab */}
//           <TabsContent value="basic" className="space-y-6">
//             <div className="space-y-4">
//               <div>
//                 <Label className="text-sm font-medium">Property Name *</Label>
//                 <Input
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   placeholder="Premium Apartment"
//                   className={`mt-1 ${formErrors.name ? 'border-red-500' : ''}`}
//                 />
//                 {formErrors.name && (
//                   <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
//                 )}
//               </div>

//               <div className="grid grid-cols-3 gap-4">
//                 <div>
//                   <Label className="text-sm font-medium">City *</Label>
//                   <Input
//                     value={formData.city_id}
//                     onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
//                     placeholder="Pune"
//                     className={`mt-1 ${formErrors.city_id ? 'border-red-500' : ''}`}
//                   />
//                   {formErrors.city_id && (
//                     <p className="text-xs text-red-500 mt-1">{formErrors.city_id}</p>
//                   )}
//                 </div>
//                 <div>
//                   <Label className="text-sm font-medium">State *</Label>
//                   <Input
//                     value={formData.state}
//                     onChange={(e) => setFormData({ ...formData, state: e.target.value })}
//                     placeholder="Maharashtra"
//                     className={`mt-1 ${formErrors.state ? 'border-red-500' : ''}`}
//                   />
//                   {formErrors.state && (
//                     <p className="text-xs text-red-500 mt-1">{formErrors.state}</p>
//                   )}
//                 </div>
//                 <div>
//                   <Label className="text-sm font-medium">Area *</Label>
//                   <Input
//                     value={formData.area}
//                     onChange={(e) => setFormData({ ...formData, area: e.target.value })}
//                     placeholder="Downtown"
//                     className={`mt-1 ${formErrors.area ? 'border-red-500' : ''}`}
//                   />
//                   {formErrors.area && (
//                     <p className="text-xs text-red-500 mt-1">{formErrors.area}</p>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <Label className="text-sm font-medium">Address</Label>
//                 <Textarea
//                   value={formData.address}
//                   onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                   placeholder="Full address with landmark"
//                   rows={2}
//                   className="mt-1"
//                 />
//               </div>

//               <div className="grid grid-cols-4 gap-4">
//                 <div>
//                   <Label className="text-sm font-medium">Rooms</Label>
//                   <Input
//                     type="number"
//                     min="0"
//                     value={formData.total_rooms || ''}
//                     onChange={(e) => setFormData({ ...formData, total_rooms: parseInt(e.target.value) || 0 })}
//                     className={`mt-1 ${formErrors.total_rooms ? 'border-red-500' : ''}`}
//                   />
//                   {formErrors.total_rooms && (
//                     <p className="text-xs text-red-500 mt-1">{formErrors.total_rooms}</p>
//                   )}
//                 </div>
//                 <div>
//                   <Label className="text-sm font-medium">Beds</Label>
//                   <Input
//                     type="number"
//                     min="0"
//                     value={formData.total_beds || ''}
//                     onChange={(e) => setFormData({ ...formData, total_beds: parseInt(e.target.value) || 0 })}
//                     className={`mt-1 ${formErrors.total_beds ? 'border-red-500' : ''}`}
//                   />
//                   {formErrors.total_beds && (
//                     <p className="text-xs text-red-500 mt-1">{formErrors.total_beds}</p>
//                   )}
//                 </div>
//                 <div>
//                   <Label className="text-sm font-medium">Occupied</Label>
//                   <Input
//                     type="number"
//                     min="0"
//                     value={formData.occupied_beds || ''}
//                     onChange={(e) => setFormData({ ...formData, occupied_beds: parseInt(e.target.value) || 0 })}
//                     className={`mt-1 ${formErrors.occupied_beds ? 'border-red-500' : ''}`}
//                   />
//                   {formErrors.occupied_beds && (
//                     <p className="text-xs text-red-500 mt-1">{formErrors.occupied_beds}</p>
//                   )}
//                 </div>
//                 <div className="pt-6">
//                   <Badge variant={formData.total_beds - (formData.occupied_beds || 0) > 0 ? "default" : "secondary"}>
//                     {formData.total_beds - (formData.occupied_beds || 0)} beds available
//                   </Badge>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Label className="text-sm font-medium">Starting Price (₹)</Label>
//                   <Input
//                     type="number"
//                     min="0"
//                     value={formData.starting_price || ''}
//                     onChange={(e) => setFormData({ ...formData, starting_price: parseFloat(e.target.value) || 0 })}
//                     className={`mt-1 ${formErrors.starting_price ? 'border-red-500' : ''}`}
//                   />
//                   {formErrors.starting_price && (
//                     <p className="text-xs text-red-500 mt-1">{formErrors.starting_price}</p>
//                   )}
//                   {formData.starting_price > 0 && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       ₹{formData.starting_price.toLocaleString()}/month
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <Label className="text-sm font-medium">Security Deposit (₹)</Label>
//                   <Input
//                     type="number"
//                     min="0"
//                     value={formData.security_deposit || ''}
//                     onChange={(e) => setFormData({ ...formData, security_deposit: parseFloat(e.target.value) || 0 })}
//                     className={`mt-1 ${formErrors.security_deposit ? 'border-red-500' : ''}`}
//                   />
//                   {formErrors.security_deposit && (
//                     <p className="text-xs text-red-500 mt-1">{formErrors.security_deposit}</p>
//                   )}
//                 </div>
//               </div>

//               <Separator />

//               <div>
//                 <h3 className="text-sm font-semibold mb-3">Manager Details</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label className="text-sm font-medium">Name *</Label>
//                     <Input
//                       value={formData.property_manager_name}
//                       onChange={(e) => setFormData({ ...formData, property_manager_name: e.target.value })}
//                       placeholder="John Doe"
//                       className={`mt-1 ${formErrors.property_manager_name ? 'border-red-500' : ''}`}
//                     />
//                     {formErrors.property_manager_name && (
//                       <p className="text-xs text-red-500 mt-1">{formErrors.property_manager_name}</p>
//                     )}
//                   </div>
//                   <div>
//                     <Label className="text-sm font-medium">Phone *</Label>
//                     <Input
//                       value={formData.property_manager_phone}
//                       onChange={(e) => setFormData({ ...formData, property_manager_phone: e.target.value })}
//                       placeholder="+91 9876543210"
//                       className={`mt-1 ${formErrors.property_manager_phone ? 'border-red-500' : ''}`}
//                     />
//                     {formErrors.property_manager_phone && (
//                       <p className="text-xs text-red-500 mt-1">{formErrors.property_manager_phone}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </TabsContent>

//           {/* Amenities Tab */}
//           <TabsContent value="amenities" className="space-y-6">
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-sm font-semibold mb-3">Amenities</h3>
//                 <div className="flex gap-2 mb-3">
//                   <Input
//                     value={amenityInput}
//                     onChange={(e) => setAmenityInput(e.target.value)}
//                     placeholder="Add custom amenity..."
//                     onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
//                   />
//                   <Button type="button" onClick={() => addAmenity()}>Add</Button>
//                 </div>

//                 <div className="mb-4">
//                   <p className="text-xs text-gray-500 mb-2">Quick Select:</p>
//                   <div className="flex flex-wrap gap-2">
//                     {commonAmenities.map((amenity) => (
//                       <Badge
//                         key={amenity}
//                         variant={formData.amenities.includes(amenity) ? "default" : "outline"}
//                         className="cursor-pointer"
//                         onClick={() => {
//                           if (formData.amenities.includes(amenity)) {
//                             removeAmenity(formData.amenities.indexOf(amenity));
//                           } else {
//                             addAmenity(amenity);
//                           }
//                         }}
//                       >
//                         {amenity}
//                         {formData.amenities.includes(amenity) && <Check className="h-3 w-3 ml-1" />}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="border rounded p-3">
//                   <p className="text-sm font-medium mb-2">Selected ({formData.amenities.length})</p>
//                   {formData.amenities.length > 0 ? (
//                     <div className="flex flex-wrap gap-2">
//                       {formData.amenities.map((amenity, index) => (
//                         <Badge key={index} variant="secondary">
//                           {amenity}
//                           <X
//                             className="h-3 w-3 ml-1 cursor-pointer"
//                             onClick={() => removeAmenity(index)}
//                           />
//                         </Badge>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-sm text-gray-400">No amenities added</p>
//                   )}
//                 </div>
//               </div>

//               <Separator />

//               <div>
//                 <h3 className="text-sm font-semibold mb-3">Services</h3>
//                 <div className="flex gap-2 mb-3">
//                   <Input
//                     value={serviceInput}
//                     onChange={(e) => setServiceInput(e.target.value)}
//                     placeholder="Add custom service..."
//                     onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
//                   />
//                   <Button type="button" onClick={() => addService()}>Add</Button>
//                 </div>

//                 <div className="mb-4">
//                   <p className="text-xs text-gray-500 mb-2">Quick Select:</p>
//                   <div className="flex flex-wrap gap-2">
//                     {commonServices.map((service) => (
//                       <Badge
//                         key={service}
//                         variant={formData.services.includes(service) ? "default" : "outline"}
//                         className="cursor-pointer"
//                         onClick={() => {
//                           if (formData.services.includes(service)) {
//                             removeService(formData.services.indexOf(service));
//                           } else {
//                             addService(service);
//                           }
//                         }}
//                       >
//                         {service}
//                         {formData.services.includes(service) && <Check className="h-3 w-3 ml-1" />}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="border rounded p-3">
//                   <p className="text-sm font-medium mb-2">Selected ({formData.services.length})</p>
//                   {formData.services.length > 0 ? (
//                     <div className="flex flex-wrap gap-2">
//                       {formData.services.map((service, index) => (
//                         <Badge key={index} variant="secondary">
//                           {service}
//                           <X
//                             className="h-3 w-3 ml-1 cursor-pointer"
//                             onClick={() => removeService(index)}
//                           />
//                         </Badge>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-sm text-gray-400">No services added</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </TabsContent>

//           {/* Terms Tab */}
//           <TabsContent value="terms" className="space-y-6">
//             <div className="grid grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <h3 className="text-sm font-semibold">Lock-in Period</h3>
//                 <div>
//                   <Label>Duration (months)</Label>
//                   <Input
//                     type="number"
//                     min="0"
//                     value={formData.lockin_period_months || ''}
//                     onChange={(e) => setFormData({ ...formData, lockin_period_months: parseInt(e.target.value) || 0 })}
//                     placeholder="12"
//                     className="mt-1"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Penalty Amount</Label>
//                   <Input
//                     type="number"
//                     min="0"
//                     value={formData.lockin_penalty_amount || ''}
//                     onChange={(e) => setFormData({ ...formData, lockin_penalty_amount: parseFloat(e.target.value) || 0 })}
//                     placeholder="Amount"
//                     className="mt-1"
//                   />
//                 </div>

//                 <div>
//                   <Label>Penalty Type</Label>
//                   <Select
//                     value={formData.lockin_penalty_type}
//                     onValueChange={(value) => setFormData({ ...formData, lockin_penalty_type: value })}
//                   >
//                     <SelectTrigger className="mt-1">
//                       <SelectValue placeholder="Select type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="fixed">Fixed Amount</SelectItem>
//                       <SelectItem value="percentage">Percentage</SelectItem>
//                       <SelectItem value="rent">Month's Rent</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <h3 className="text-sm font-semibold">Notice Period</h3>
//                 <div>
//                   <Label>Duration (days)</Label>
//                   <Input
//                     type="number"
//                     min="0"
//                     value={formData.notice_period_days || ''}
//                     onChange={(e) => setFormData({ ...formData, notice_period_days: parseInt(e.target.value) || 0 })}
//                     placeholder="30"
//                     className="mt-1"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Penalty Amount</Label>
//                   <Input
//                     type="number"
//                     min="0"
//                     value={formData.notice_penalty_amount || ''}
//                     onChange={(e) => setFormData({ ...formData, notice_penalty_amount: parseFloat(e.target.value) || 0 })}
//                     placeholder="Amount"
//                     className="mt-1"
//                   />
//                 </div>

//                 <div>
//                   <Label>Penalty Type</Label>
//                   <Select
//                     value={formData.notice_penalty_type}
//                     onValueChange={(value) => setFormData({ ...formData, notice_penalty_type: value })}
//                   >
//                     <SelectTrigger className="mt-1">
//                       <SelectValue placeholder="Select type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="fixed">Fixed Amount</SelectItem>
//                       <SelectItem value="percentage">Percentage</SelectItem>
//                       <SelectItem value="rent">Month's Rent</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <h3 className="text-sm font-semibold mb-3">Terms & Conditions</h3>
//               <Textarea
//                 value={formData.terms_conditions}
//                 onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
//                 placeholder="Enter terms and conditions here..."
//                 rows={6}
//                 className="font-sans"
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 This will be saved to the database and included in rental agreements
//               </p>
//             </div>
//           </TabsContent>

//           {/* Photos Tab */}
//           <TabsContent value="photos" className="space-y-6">
//             <div>
//               <h3 className="text-sm font-semibold mb-3">Property Photos</h3>
//               <p className="text-xs text-gray-500 mb-4">
//                 Upload up to 10 photos. First photo will be used as cover image.
//               </p>

//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   multiple
//                   id="property-photos"
//                   className="hidden"
//                   onChange={(e) => {
//                     const files = Array.from(e.target.files || []);
//                     if (files.length > 0) {
//                       handlePhotosUpload(files);
//                     }
//                     e.target.value = '';
//                   }}
//                 />
//                 <label htmlFor="property-photos" className="cursor-pointer">
//                   <div className="p-3 rounded-full bg-blue-50 inline-block mb-3">
//                     <Upload className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <p className="text-sm font-medium">Upload Photos</p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Drag & drop or click to browse
//                   </p>
//                 </label>
//               </div>

//               {photoPreviews.length > 0 && (
//                 <div className="mt-6">
//                   <div className="flex justify-between items-center mb-3">
//                     <h4 className="text-sm font-medium">
//                       Photos ({photoPreviews.length}/10)
//                     </h4>
//                     {removedPhotoUrls.length > 0 && (
//                       <Badge variant="destructive">
//                         {removedPhotoUrls.length} marked for removal
//                       </Badge>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-3 gap-3">
//                     {photoPreviews.map((src, index) => {
//                       const isExisting = index < existingPhotoUrls.length;
//                       const originalUrl = isExisting ? existingPhotoUrls[index] : null;
//                       const isRemoved = isExisting && originalUrl && removedPhotoUrls.includes(originalUrl);

//                       return (
//                         <div
//                           key={index}
//                           className={`relative rounded overflow-hidden ${isRemoved ? 'opacity-50' : ''}`}
//                         >
//                           <img
//                             src={src}
//                             alt={`Property ${index + 1}`}
//                             className="h-32 w-full object-cover"
//                           />
//                           <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all">
//                             <div className="absolute bottom-2 right-2">
//                               <Button
//                                 size="sm"
//                                 variant="destructive"
//                                 className="h-7 w-7 p-0"
//                                 onClick={() => removeUploadedPhoto(index)}
//                               >
//                                 <X className="h-4 w-4" />
//                               </Button>
//                             </div>
//                             {index === 0 && (
//                               <div className="absolute top-2 left-2">
//                                 <Badge className="bg-blue-600 text-xs">Cover</Badge>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </TabsContent>

//           {/* Rules Tab */}
//           <TabsContent value="rules" className="space-y-6">
//             <div className="space-y-4">
//               <div>
//                 <h3 className="text-sm font-semibold mb-3">Property Rules</h3>
//                 <Textarea
//                   value={formData.property_rules}
//                   onChange={(e) => setFormData({ ...formData, property_rules: e.target.value })}
//                   placeholder="Enter property rules here..."
//                   rows={4}
//                 />
//               </div>

//               <div>
//                 <h3 className="text-sm font-semibold mb-3">Description</h3>
//                 <Textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   placeholder="Describe the property..."
//                   rows={4}
//                 />
//               </div>

//               <div>
//                 <h3 className="text-sm font-semibold mb-3">Additional Terms</h3>
//                 <Textarea
//                   value={formData.additional_terms}
//                   onChange={(e) => setFormData({ ...formData, additional_terms: e.target.value })}
//                   placeholder="Any additional terms..."
//                   rows={3}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   This will be saved to the database as additional_terms field
//                 </p>
//               </div>
//             </div>
//           </TabsContent>
//         </Tabs>

//         <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
//           <div className="flex items-center gap-2">
//             {["basic", "amenities", "terms", "photos", "rules"].map((tab) => (
//               <div
//                 key={tab}
//                 className={`h-1.5 w-8 rounded-full ${activeTab === tab ? 'bg-blue-600' : 'bg-gray-200'}`}
//               />
//             ))}
//           </div>
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               onClick={handleClose}
//               disabled={loading}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSubmit}
//               disabled={loading}
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               {loading ? (
//                 <>
//                   <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
//                   {editMode ? 'Updating...' : 'Creating...'}
//                 </>
//               ) : editMode ? 'Update Property' : 'Create Property'}
//             </Button>
//           </div>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }




"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  Plus,
  X,
  Camera,
  Home,
  Users,
  Wifi,
  Utensils,
  CalendarDays,
  Clock3,
  FileText,
  ShieldCheck,
  BadgeIndianRupee,
  Shield,
  Upload,
  Check,
  CheckCircle,
  XSquare,
  ListChecks,
  Trash2,
  Loader2,
  AlertCircle,
  Bug,
  Receipt,
  Lock,
  Bell,
  Wrench,
  BookOpen,
} from "lucide-react";
import { 
  getLockinPeriodOptions, 
  getNoticePeriodOptions,
  extractNumberFromDuration 
} from "@/lib/masterApi";

// Common terms templates with headers
const TERMS_TEMPLATES = [
  {
    id: "lockin",
    title: "Lock-in Period Terms",
    icon: Lock,
    header: "🔒 Minimum Lock-in Period",
    content: (property: any) => `Minimum lock-in period of ${property.lockin_period_months || 3} months required.`,
    detailedContent: (property: any) => `
1. The tenant agrees to a minimum lock-in period of ${property.lockin_period_months || 3} months.
2. Early termination before completing the lock-in period will result in a penalty.
3. Penalty for early exit: ${property.lockin_penalty_type === 'percentage' ? `${property.lockin_penalty_amount}% of security deposit` : property.lockin_penalty_type === 'rent' ? `One month's rent` : `₹${property.lockin_penalty_amount || 2000}`}.
4. The lock-in period starts from the date of agreement signing.
    `.trim(),
  },
  {
    id: "security",
    title: "Security Deposit Terms",
    icon: Shield,
    header: "💰 Security Deposit",
    content: (property: any) => `Security deposit of ₹${property.security_deposit || 3000} refundable within 30 days of checkout.`,
    detailedContent: (property: any) => `
1. A security deposit of ₹${property.security_deposit || 3000} is required.
2. The deposit is refundable upon vacating, subject to property condition.
3. Deductions may be made for damages, outstanding dues, or cleaning charges.
4. Refund will be processed within 30 days of vacating.
    `.trim(),
  },
  {
    id: "notice",
    title: "Notice Period Terms",
    icon: Bell,
    header: "📅 Notice Period",
    content: (property: any) => `Notice period of ${Math.floor((property.notice_period_days || 30)/30)} month required before vacating.`,
    detailedContent: (property: any) => `
1. A notice period of ${property.notice_period_days || 30} days is required for vacating the premises.
2. Notice must be provided in writing to the property manager.
3. Failure to provide adequate notice will result in a penalty.
4. Penalty for non-compliance: ${property.notice_penalty_type === 'percentage' ? `${property.notice_penalty_amount}% of security deposit` : property.notice_penalty_type === 'rent' ? `One month's rent` : `₹${property.notice_penalty_amount || 5000}`}.
    `.trim(),
  },
  {
    id: "electricity",
    title: "Electricity & Utilities",
    icon: Receipt,
    header: "⚡ Electricity & Utilities",
    content: () => `Electricity charges as per actuals, billed monthly.`,
    detailedContent: () => `
1. Electricity charges will be billed as per actual consumption.
2. Meter readings will be taken monthly.
3. Payment due within 7 days of billing.
4. Late payment may incur additional charges.
    `.trim(),
  },
  {
    id: "maintenance",
    title: "Maintenance Terms",
    icon: Wrench,
    header: "🔧 Maintenance",
    content: () => `Regular maintenance provided, major repairs reported to management.`,
    detailedContent: () => `
1. Regular maintenance of common areas is the responsibility of the property management.
2. Tenants are responsible for minor repairs and maintenance within their units.
3. Major repairs should be reported immediately to the property manager.
4. Emergency maintenance requests will be addressed within 24 hours.
    `.trim(),
  },
  {
    id: "rules",
    title: "Property Rules",
    icon: BookOpen,
    header: "📋 Property Rules",
    content: () => `Guests allowed with prior permission. Smoking & alcohol prohibited. Pets not allowed.`,
    detailedContent: () => `
1. Guests allowed with prior permission from management.
2. Smoking and alcohol consumption strictly prohibited in rooms.
3. Pets not allowed in the premises.
4. Quiet hours from 10 PM to 7 AM.
5. Proper waste disposal in designated areas.
    `.trim(),
  },
  {
    id: "rent_terms",
    title: "Rent & Amenities",
    icon: BadgeIndianRupee,
    header: "💵 Rent Includes",
    content: () => `Monthly rent includes 3 meals per day and all amenities.`,
    detailedContent: () => `
1. Monthly rent includes accommodation and all listed amenities.
2. Three meals per day included (breakfast, lunch, dinner).
3. All common area amenities accessible during designated hours.
4. Additional services may incur extra charges.
    `.trim(),
  },
  {
    id: "damage",
    title: "Damage & Liability",
    icon: AlertCircle,
    header: "⚠️ Damage & Liability",
    content: () => `Damage to property will be deducted from security deposit.`,
    detailedContent: () => `
1. Damage to property will be deducted from security deposit.
2. Tenants are responsible for care of provided furniture and fixtures.
3. Intentional damage may result in additional charges.
4. Normal wear and tear excluded.
    `.trim(),
  },
  {
    id: "management",
    title: "Management Rights",
    icon: Building2,
    header: "🏢 Management Rights",
    content: () => `Management reserves the right to modify rules with 15 days prior notice.`,
    detailedContent: () => `
1. Management reserves the right to modify rules with 15 days prior notice.
2. Changes will be communicated in writing.
3. Major rule changes require tenant consultation.
4. Emergency modifications may be implemented immediately.
    `.trim(),
  },
  {
    id: "taxes",
    title: "Taxes & Government Dues",
    icon: Receipt,
    header: "🧾 Taxes & Government Dues",
    content: () => `All government taxes and charges applicable as per current rates.`,
    detailedContent: () => `
1. All applicable government taxes (GST, property tax, etc.) are included.
2. Any increase in statutory charges will be borne by tenant.
3. Tax invoices provided monthly.
4. Prompt payment of all dues required.
    `.trim(),
  },
];

type Property = {
  id: string;
  name: string;
  city_id?: string;
  state: string; 
  area: string;
  address: string;
  total_rooms: number;
  total_beds: number;
  occupied_beds?: number;
  starting_price: number;
  security_deposit: number;
  description?: string;
  property_manager_name: string;
  property_manager_phone: string;
  amenities: string[];
  services: string[];
  photo_urls: string[];
  property_rules?: string;
  is_active: boolean;
  lockin_period_months: number;
  lockin_penalty_amount: number;
  lockin_penalty_type: string;
  notice_period_days: number;
  notice_penalty_amount: number;
  notice_penalty_type: string;
  terms_conditions?: string;
  additional_terms?: string;
};

type PropertyFormData = {
  name: string;
  city_id: string;
  state: string; 
  area: string;
  address: string;
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  starting_price: number;
  security_deposit: number;
  description: string;
  property_manager_name: string;
  property_manager_phone: string;
  amenities: string[];
  services: string[];
  photo_urls: string[];
  property_rules: string;
  lockin_period_months: number;
  lockin_penalty_amount: number;
  lockin_penalty_type: string;
  notice_period_days: number;
  notice_penalty_amount: number;
  notice_penalty_type: string;
  terms_conditions: string;
  additional_terms: string;
  custom_terms?: string[];
};

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode: boolean;
  selectedProperty: any;
  onSubmit: any;
  onReset: () => void;
  loading: boolean;
}

const commonAmenities = [
  "WiFi", "AC", "Parking", "Laundry", "Power Backup", "Lift", "CCTV",
  "24/7 Security", "Gym", "Swimming Pool", "Garden", "Terrace", "TV",
  "Refrigerator", "Microwave", "Geyser", "Furnished", "Housekeeping",
];

const commonServices = [
  "Food Service", "Room Cleaning", "Laundry Service", "Maintenance",
  "Medical Assistance", "Transportation", "Package Handling", "Concierge",
];

// Penalty type options (hardcoded since we removed the API call)
const PENALTY_TYPE_OPTIONS = [
  { id: 1, value: "Fixed", code: "fixed" },
  { id: 2, value: "Percentage", code: "percentage" },
];

export default function PropertyForm({
  open,
  onOpenChange,
  editMode,
  selectedProperty,
  onSubmit,
  onReset,
  loading,
}: PropertyFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<PropertyFormData>({
    name: "",
    city_id: "",
    state: "",
    area: "",
    address: "",
    total_rooms: 0,
    total_beds: 0,
    occupied_beds: 0,
    starting_price: 0,
    security_deposit: 0,
    description: "",
    property_manager_name: "",
    property_manager_phone: "",
    amenities: [],
    services: [],
    photo_urls: [],
    property_rules: "",
    lockin_period_months: 0,
    lockin_penalty_amount: 0,
    lockin_penalty_type: "fixed",
    notice_period_days: 0,
    notice_penalty_amount: 0,
    notice_penalty_type: "fixed",
    terms_conditions: "",
    additional_terms: "",
    custom_terms: [],
  });

  const [amenityInput, setAmenityInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [removedPhotoUrls, setRemovedPhotoUrls] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [customTerms, setCustomTerms] = useState<string[]>([]);
  const [newTerm, setNewTerm] = useState("");
  
  // Master data states
  const [lockinPeriodOptions, setLockinPeriodOptions] = useState<Array<{id: number, value: string}>>([]);
  const [noticePeriodOptions, setNoticePeriodOptions] = useState<Array<{id: number, value: string}>>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when selectedProperty changes
  useEffect(() => {
    if (selectedProperty && editMode) {
      const photoUrls = Array.isArray(selectedProperty.photo_urls) ? selectedProperty.photo_urls : [];
      
      const initialFormData = {
        name: selectedProperty.name || "",
        city_id: selectedProperty.city_id || "",
        state: selectedProperty.state || "",
        area: selectedProperty.area || "",
        address: selectedProperty.address || "",
        total_rooms: selectedProperty.total_rooms || 0,
        total_beds: selectedProperty.total_beds || 0,
        occupied_beds: selectedProperty.occupied_beds || 0,
        starting_price: selectedProperty.starting_price || 0,
        security_deposit: selectedProperty.security_deposit || 0,
        description: selectedProperty.description || "",
        property_manager_name: selectedProperty.property_manager_name || "",
        property_manager_phone: selectedProperty.property_manager_phone || "",
        amenities: Array.isArray(selectedProperty.amenities) ? selectedProperty.amenities : [],
        services: Array.isArray(selectedProperty.services) ? selectedProperty.services : [],
        photo_urls: photoUrls,
        property_rules: selectedProperty.property_rules || "",
        lockin_period_months: selectedProperty.lockin_period_months || 0,
        lockin_penalty_amount: selectedProperty.lockin_penalty_amount || 0,
        lockin_penalty_type: selectedProperty.lockin_penalty_type || "fixed",
        notice_period_days: selectedProperty.notice_period_days || 0,
        notice_penalty_amount: selectedProperty.notice_penalty_amount || 0,
        notice_penalty_type: selectedProperty.notice_penalty_type || "fixed",
        terms_conditions: selectedProperty.terms_conditions || "",
        additional_terms: selectedProperty.additional_terms || "",
        custom_terms: [],
      };

      setFormData(initialFormData);
      setExistingPhotoUrls(photoUrls);
      setPhotoPreviews(photoUrls.map((url: string) => {
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        return `${apiUrl}/${cleanUrl}`;
      }));
      
      // Parse custom terms from existing terms_conditions
      const existingTerms = selectedProperty.terms_conditions || "";
      const customTermsList = existingTerms.split('\n').filter((term: string) => 
        term.trim() && !TERMS_TEMPLATES.some(template => 
          term.includes(template.header) || existingTerms.includes(template.detailedContent(selectedProperty))
        )
      );
      setCustomTerms(customTermsList);
      setSelectedTerms([]);
      setError(null);
    } else {
      resetForm();
    }
  }, [selectedProperty, editMode]);

  // Load master options when form opens
  useEffect(() => {
    if (open) {
      loadMasterOptions();
    } else {
      setError(null);
    }
  }, [open]);

  const loadMasterOptions = async () => {
    setLoadingOptions(true);
    setError(null);
    
    try {
      const lockinRes = await getLockinPeriodOptions();
      const noticeRes = await getNoticePeriodOptions();

      if (lockinRes.success) {
        setLockinPeriodOptions(lockinRes.data || []);
      } else {
        console.error("Failed to load lockin period options:", lockinRes);
        setError(`Lockin options error: ${lockinRes.error || 'Unknown error'}`);
      }

      if (noticeRes.success) {
        setNoticePeriodOptions(noticeRes.data || []);
      } else {
        console.error("Failed to load notice period options:", noticeRes);
        setError(`Notice options error: ${noticeRes.error || 'Unknown error'}`);
      }

    } catch (error: any) {
      console.error("Failed to load master options:", error);
      setError(`Network error: ${error.message || 'Failed to load options'}`);
      
      // Fallback options
      setLockinPeriodOptions([
        { id: 1, value: "3 months" },
        { id: 2, value: "6 months" },
        { id: 3, value: "12 months" },
        { id: 4, value: "18 months" }
      ]);
      
      setNoticePeriodOptions([
        { id: 1, value: "15 days" },
        { id: 2, value: "30 days" },
        { id: 3, value: "45 days" },
        { id: 4, value: "60 days" }
      ]);
      
    } finally {
      setLoadingOptions(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      city_id: "",
      state: "",
      area: "",
      address: "",
      total_rooms: 0,
      total_beds: 0,
      occupied_beds: 0,
      starting_price: 0,
      security_deposit: 0,
      description: "",
      property_manager_name: "",
      property_manager_phone: "",
      amenities: [],
      services: [],
      photo_urls: [],
      property_rules: "",
      lockin_period_months: 0,
      lockin_penalty_amount: 0,
      lockin_penalty_type: "fixed",
      notice_period_days: 0,
      notice_penalty_amount: 0,
      notice_penalty_type: "fixed",
      terms_conditions: "",
      additional_terms: "",
      custom_terms: [],
    });
    setAmenityInput("");
    setServiceInput("");
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setExistingPhotoUrls([]);
    setRemovedPhotoUrls([]);
    setSelectedTerms([]);
    setCustomTerms([]);
    setNewTerm("");
    setActiveTab("basic");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onReset();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    // Combine selected template terms and custom terms
    const templateTerms = selectedTerms.map(termId => {
      const template = TERMS_TEMPLATES.find(t => t.id === termId);
      if (!template) return "";
      return `${template.header}\n${template.detailedContent(formData)}`;
    }).filter(Boolean);

    const allTerms = [...templateTerms, ...customTerms.map(term => `📝 Custom Term\n${term}`)].join("\n\n");
    
    const submitData = {
      ...formData,
      terms_conditions: allTerms,
      custom_terms: customTerms, // Store custom terms separately
    };
    
    await onSubmit(submitData, photoFiles, removedPhotoUrls);
  };

  const handlePhotosUpload = (files: File[]) => {
    const previews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((prev) => [...prev, ...previews]);
    setPhotoFiles((prev) => [...prev, ...files]);
  };

  const removeUploadedPhoto = (index: number) => {
    const isExistingImage = index < existingPhotoUrls.length;

    if (isExistingImage) {
      const removedUrl = existingPhotoUrls[index];
      if (removedPhotoUrls.includes(removedUrl)) return;
      setRemovedPhotoUrls(prev => [...prev, removedUrl]);
    } else {
      const adjustedIndex = index - existingPhotoUrls.length;
      const newPreviews = [...photoPreviews];
      newPreviews.splice(index, 1);
      setPhotoPreviews(newPreviews);

      const newFiles = [...photoFiles];
      newFiles.splice(adjustedIndex, 1);
      setPhotoFiles(newFiles);
    }
  };

  const addAmenity = (amenity?: string) => {
    const amenityToAdd = amenity || amenityInput.trim();
    if (amenityToAdd && !formData.amenities.includes(amenityToAdd)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityToAdd],
      });
      if (!amenity) setAmenityInput("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    });
  };

  const addService = (service?: string) => {
    const serviceToAdd = service || serviceInput.trim();
    if (serviceToAdd && !formData.services.includes(serviceToAdd)) {
      setFormData({
        ...formData,
        services: [...formData.services, serviceToAdd],
      });
      if (!service) setServiceInput("");
    }
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const addCustomTerm = () => {
    if (newTerm.trim()) {
      setCustomTerms(prev => [...prev, newTerm.trim()]);
      setNewTerm("");
    }
  };

  const removeCustomTerm = (index: number) => {
    setCustomTerms(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTermTemplate = (termId: string) => {
    setSelectedTerms(prev =>
      prev.includes(termId)
        ? prev.filter(id => id !== termId)
        : [...prev, termId]
    );
  };

  const generateTermsFromTemplates = () => {
    const templateTerms = selectedTerms.map(termId => {
      const template = TERMS_TEMPLATES.find(t => t.id === termId);
      if (!template) return "";
      return `${template.header}\n${template.detailedContent(formData)}`;
    }).filter(Boolean);

    const allTerms = [...templateTerms, ...customTerms.map(term => `📝 Custom Term\n${term}`)].join("\n\n");
    setFormData(prev => ({ ...prev, terms_conditions: allTerms }));
  };

  // Helper function to find selected option from master values
  const findSelectedOption = (options: Array<{id: number, value: string}>, currentValue: number) => {
    if (!currentValue || options.length === 0) return '';
    
    const option = options.find(opt => extractNumberFromDuration(opt.value) === currentValue);
    if (option) return option.value;
    
    for (const opt of options) {
      const optValue = extractNumberFromDuration(opt.value);
      if (optValue && Math.abs(optValue - currentValue) <= 5) {
        return opt.value;
      }
    }
    
    return '';
  };

  // Format value for display
  const formatOptionValue = (value: number, type: 'months' | 'days') => {
    if (!value) return '';
    return type === 'months' 
      ? `${value} month${value > 1 ? 's' : ''}`
      : `${value} day${value > 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 border-0">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold">
              {editMode ? "Edit Property" : "Add New Property"}
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-sm">
              Enter complete property details including amenities, terms, and conditions
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="basic" className="flex items-center gap-2 text-xs py-2">
              <Home className="h-3 w-3" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="amenities" className="flex items-center gap-2 text-xs py-2">
              <Wifi className="h-3 w-3" />
              Amenities
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex items-center gap-2 text-xs py-2">
              <FileText className="h-3 w-3" />
              Terms
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2 text-xs py-2">
              <Camera className="h-3 w-3" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center gap-2 text-xs py-2">
              <ShieldCheck className="h-3 w-3" />
              Rules
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Property Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Premium Apartment"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm font-medium">City *</Label>
                    <Input
                      value={formData.city_id}
                      onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                      placeholder="Pune"
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">State *</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Area *</Label>
                  <Input
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Downtown"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address with landmark"
                    rows={2}
                    className="text-sm min-h-16"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the property, features, and surroundings..."
                    rows={3}
                    className="text-sm min-h-20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-sm font-medium">Rooms</Label>
                    <Input
                      type="text"
                      min="0"
                      value={formData.total_rooms || ''}
                      onChange={(e) => setFormData({ ...formData, total_rooms: parseInt(e.target.value) || 0 })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Beds</Label>
                    <Input
                      type="text"
                      min="0"
                      value={formData.total_beds || ''}
                      onChange={(e) => setFormData({ ...formData, total_beds: parseInt(e.target.value) || 0 })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Occupied</Label>
                    <Input
                      type="text"
                      min="0"
                      value={formData.occupied_beds || ''}
                      onChange={(e) => setFormData({ ...formData, occupied_beds: parseInt(e.target.value) || 0 })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Starting Price (₹)</Label>
                  <Input
                    type="text"
                    min="0"
                    value={formData.starting_price || ''}
                    onChange={(e) => setFormData({ ...formData, starting_price: parseFloat(e.target.value) || 0 })}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Security Deposit (₹)</Label>
                  <Input
                    type="text"
                    min="0"
                    value={formData.security_deposit || ''}
                    onChange={(e) => setFormData({ ...formData, security_deposit: parseFloat(e.target.value) || 0 })}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Property Manager
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Manager Name</Label>
                      <Input
                        value={formData.property_manager_name}
                        onChange={(e) => setFormData({ ...formData, property_manager_name: e.target.value })}
                        placeholder="John Doe"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
  <Label className="text-xs">Phone Number</Label>
  <Input
    type="tel"
    value={formData.property_manager_phone}
    onChange={(e) => {
      // Remove non-numeric characters
      const numericValue = e.target.value.replace(/\D/g, '');

      // Limit to 10 digits
      if (numericValue.length <= 10) {
        setFormData({
          ...formData,
          property_manager_phone: numericValue,
        });
      }
    }}
    maxLength={10}
    placeholder="9876543210"
    className="h-8 text-sm"
  />
</div>

                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Amenities</h3>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    placeholder="Add custom amenity..."
                    className="h-9 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                  />
                  <Button type="button" size="sm" onClick={() => addAmenity()}>Add</Button>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Quick Select:</p>
                  <div className="flex flex-wrap gap-1">
                    {commonAmenities.map((amenity) => (
                      <Badge
                        key={amenity}
                        variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-blue-50 text-xs px-2 py-1"
                        onClick={() => {
                          if (formData.amenities.includes(amenity)) {
                            removeAmenity(formData.amenities.indexOf(amenity));
                          } else {
                            addAmenity(amenity);
                          }
                        }}
                      >
                        {amenity}
                        {formData.amenities.includes(amenity) && <Check className="h-2 w-2 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-3">
                  <Label className="text-sm font-medium">Selected Amenities ({formData.amenities.length})</Label>
                  {formData.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs py-1 px-2">
                          {amenity}
                          <X
                            className="h-2 w-2 ml-1 cursor-pointer hover:text-red-600"
                            onClick={() => removeAmenity(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">No amenities added yet</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Services</h3>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    placeholder="Add custom service..."
                    className="h-9 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                  />
                  <Button type="button" size="sm" onClick={() => addService()}>Add</Button>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Quick Select:</p>
                  <div className="flex flex-wrap gap-1">
                    {commonServices.map((service) => (
                      <Badge
                        key={service}
                        variant={formData.services.includes(service) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-green-50 text-xs px-2 py-1"
                        onClick={() => {
                          if (formData.services.includes(service)) {
                            removeService(formData.services.indexOf(service));
                          } else {
                            addService(service);
                          }
                        }}
                      >
                        {service}
                        {formData.services.includes(service) && <Check className="h-2 w-2 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-3">
                  <Label className="text-sm font-medium">Selected Services ({formData.services.length})</Label>
                  {formData.services.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs py-1 px-2">
                          {service}
                          <X
                            className="h-2 w-2 ml-1 cursor-pointer hover:text-red-600"
                            onClick={() => removeService(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2">No services added yet</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Terms Tab */}
          <TabsContent value="terms" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {/* Lock-in Period Section */}
    <div className="border border-blue-100 bg-blue-50/50 rounded p-3">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <CalendarDays className="h-4 w-4 text-blue-600" />
        Lock-in Period
        {loadingOptions && (
          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
        )}
      </h3>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Duration</Label>
          <Select
            value={findSelectedOption(lockinPeriodOptions, formData.lockin_period_months)}
            onValueChange={(value) => {
              const months = extractNumberFromDuration(value);
              setFormData({ ...formData, lockin_period_months: months });
            }}
            disabled={loadingOptions}
          >
            <SelectTrigger className="h-8 text-sm mt-1">
              <SelectValue placeholder="Select lock-in period">
                {formData.lockin_period_months ? 
                  formatOptionValue(formData.lockin_period_months, 'months') : 
                  "Select lock-in period"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {lockinPeriodOptions.length > 0 ? (
                lockinPeriodOptions.map((option) => (
                  <SelectItem 
                    key={option.id} 
                    value={option.value}
                    className="text-sm"
                  >
                    {option.value}
                  </SelectItem>
                ))
              ) : !loadingOptions && (
                <div className="px-2 py-1 text-xs text-gray-500">
                  No options available
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Penalty for Early Exit</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="0"
              value={formData.lockin_penalty_amount || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                lockin_penalty_amount: parseFloat(e.target.value) || 0 
              })}
              placeholder={formData.lockin_penalty_type === 'percentage' ? 'Percentage' : 'Amount'}
              className="h-8 text-sm"
            />
            <Select
              value={formData.lockin_penalty_type}
              onValueChange={(value) => {
                setFormData({ 
                  ...formData, 
                  lockin_penalty_type: value 
                });
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="text-sm">
                {PENALTY_TYPE_OPTIONS.filter(option => option.code !== 'rent').map((option) => (
                  <SelectItem 
                    key={option.id} 
                    value={option.code}
                  >
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>

              {/* Notice Period Section */}
    <div className="border border-amber-100 bg-amber-50/50 rounded p-3">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <Clock3 className="h-4 w-4 text-amber-600" />
        Notice Period
        {loadingOptions && (
          <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
        )}
      </h3>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Duration</Label>
          <Select
            value={findSelectedOption(noticePeriodOptions, formData.notice_period_days)}
            onValueChange={(value) => {
              const days = extractNumberFromDuration(value);
              setFormData({ ...formData, notice_period_days: days });
            }}
            disabled={loadingOptions}
          >
            <SelectTrigger className="h-8 text-sm mt-1">
              <SelectValue placeholder="Select notice period">
                {formData.notice_period_days ? 
                  formatOptionValue(formData.notice_period_days, 'days') : 
                  "Select notice period"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {noticePeriodOptions.length > 0 ? (
                noticePeriodOptions.map((option) => (
                  <SelectItem 
                    key={option.id} 
                    value={option.value}
                    className="text-sm"
                  >
                    {option.value}
                  </SelectItem>
                ))
              ) : !loadingOptions && (
                <div className="px-2 py-1 text-xs text-gray-500">
                  No options available
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Penalty for Non-Compliance</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="0"
              value={formData.notice_penalty_amount || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                notice_penalty_amount: parseFloat(e.target.value) || 0 
              })}
              placeholder={formData.notice_penalty_type === 'percentage' ? 'Percentage' : 'Amount'}
              className="h-8 text-sm"
            />
            <Select
              value={formData.notice_penalty_type}
              onValueChange={(value) => {
                setFormData({ 
                  ...formData, 
                  notice_penalty_type: value 
                });
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="text-sm">
                {PENALTY_TYPE_OPTIONS.filter(option => option.code !== 'rent').map((option) => (
                  <SelectItem 
                    key={option.id} 
                    value={option.code}
                  >
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Terms & Conditions Builder
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded p-3">
                  <h4 className="text-sm font-semibold mb-2">Template Terms</h4>
                  <p className="text-xs text-gray-500 mb-3">Select terms to include</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {TERMS_TEMPLATES.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                        <div className="flex items-center gap-2 flex-1">
                          <Switch
                            checked={selectedTerms.includes(template.id)}
                            onCheckedChange={() => toggleTermTemplate(template.id)}
                            className="h-4 w-8"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{template.title}</p>
                            <p className="text-[9px] text-gray-500 truncate">{template.content(formData)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-3">
                  <h4 className="text-sm font-semibold mb-2">Custom Terms</h4>
                  <p className="text-xs text-gray-500 mb-3">Add your own terms</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Add Custom Term</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newTerm}
                          onChange={(e) => setNewTerm(e.target.value)}
                          placeholder="Enter custom term..."
                          className="h-8 text-sm"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTerm())}
                        />
                        <Button size="sm" onClick={addCustomTerm} className="h-8">Add</Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Custom Terms ({customTerms.length})</Label>
                      {customTerms.length > 0 ? (
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {customTerms.map((term, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded bg-gray-50 text-xs">
                              <p className="truncate flex-1">{term}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeCustomTerm(index)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No custom terms added</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-semibold">Generated Terms & Conditions</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateTermsFromTemplates}
                    disabled={selectedTerms.length === 0}
                    className="h-8 text-xs"
                  >
                    Generate from Templates
                  </Button>
                </div>
                <Textarea
                  value={formData.terms_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                  placeholder="Generated terms will appear here..."
                  rows={6}
                  className="text-sm font-mono"
              
                />
              </div>
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Property Photos
              </h3>
              <p className="text-xs text-gray-500">
                Upload multiple photos for the property. Maximum 10 photos, 5MB each.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  id="property-photos"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handlePhotosUpload(files);
                    }
                    e.target.value = '';
                  }}
                />
                <label htmlFor="property-photos" className="cursor-pointer flex flex-col items-center">
                  <div className="p-3 rounded-full bg-blue-100 mb-3">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {photoPreviews.length > 0 ? 'Add More Photos' : 'Upload Property Photos'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Drag & drop or click to browse
                  </p>
                </label>
              </div>

              {photoPreviews.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">
                      Photo Gallery ({photoPreviews.length} photos)
                    </h4>
                    {removedPhotoUrls.length > 0 && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        {removedPhotoUrls.length} marked for removal
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-3 border rounded bg-white">
                    {photoPreviews.map((src, index) => {
                      const isExisting = index < existingPhotoUrls.length;
                      const originalUrl = isExisting ? existingPhotoUrls[index] : null;
                      const isRemoved = isExisting && originalUrl && removedPhotoUrls.includes(originalUrl);

                      return (
                        <div
                          key={index}
                          className={`relative group rounded overflow-hidden border ${isRemoved
                              ? 'border-red-300 bg-red-50/30'
                              : 'border-gray-200 hover:border-blue-300'
                            } transition-all duration-200`}
                        >
                          <img
                            src={src}
                            alt={`Property ${index + 1}`}
                            className="h-32 w-full object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center">
                              {isExisting ? (
                                <Badge className={`text-xs px-1 h-4 ${isRemoved ? 'bg-red-600' : 'bg-blue-600'}`}>
                                  {isRemoved ? 'Removing' : 'Existing'}
                                </Badge>
                              ) : (
                                <Badge className="text-xs px-1 h-4 bg-green-600">New</Badge>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 w-6 p-0"
                                onClick={() => removeUploadedPhoto(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {isRemoved && (
                            <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                              <XSquare className="h-8 w-8 text-red-600 opacity-70" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {photoFiles.length > 0 && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-700 font-medium">
                        ✅ {photoFiles.length} new photos will be uploaded
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Property Rules
                </Label>
                <Textarea
                  value={formData.property_rules}
                  onChange={(e) => setFormData({ ...formData, property_rules: e.target.value })}
                  placeholder="Enter property rules here (guest policies, noise restrictions, common area rules, etc.)..."
                  rows={4}
                  className="text-sm min-h-20"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Additional Terms (Optional)</Label>
                <Textarea
                  value={formData.additional_terms}
                  onChange={(e) => setFormData({ ...formData, additional_terms: e.target.value })}
                  placeholder="Any additional terms or special conditions..."
                  rows={3}
                  className="text-sm min-h-16"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sticky bottom-0 bg-white border-t p-4">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-1">
              {["basic", "amenities", "terms", "photos", "rules"].map((tab) => (
                <div
                  key={tab}
                  className={`h-1.5 w-1.5 rounded-full ${activeTab === tab ? 'bg-blue-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : editMode ? 'Update Property' : 'Create Property'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}