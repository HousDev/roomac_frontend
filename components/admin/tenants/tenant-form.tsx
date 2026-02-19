// // tenant-form.tsx
// "use client";

// import { useState, useEffect } from "react";
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
// import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import { Switch } from "@/components/ui/switch";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   FileText,
//   Upload,
//   X,
//   Eye,
//   Loader2,
//   Key,
//   AlertCircle,
//   Check,
//   Calendar,
//   MapPin,
//   Building,
//   User,
//   Briefcase,
//   Lock,
//   Shield,
//   AlertTriangle,
// } from "lucide-react";
// import { toast } from "sonner";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Progress } from "@/components/ui/progress";
// import {
//   createTenant,
//   updateTenant,
//   getTenant,
//   getAllProperties,
//   getAvailableRooms,
//   getRoomTypes,
//   getPreferredOptions,
//   createTenantFormData,
//   prepareTenantPayload,
//   validateTenantData,
//   type Tenant,
//   type PreferredOptions,
//   type OptionType,
// } from "@/lib/tenantApi";
// import { DataTable } from "@/components/admin/data-table";
// interface TenantFormProps {
//   tenant?: Tenant;
//   onSuccess: () => void;
//   onCancel: () => void;
// }

// export function TenantForm({ tenant, onSuccess, onCancel }: TenantFormProps) {
//   const [loading, setLoading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [properties, setProperties] = useState<OptionType[]>([]);
//   const [availableRooms, setAvailableRooms] = useState<any[]>([]);
//   const [sharingTypes, setSharingTypes] = useState<string[]>(['single', 'double', 'triple']);
//   const [roomTypes, setRoomTypes] = useState<string[]>(['AC', 'Non-AC', 'Deluxe', 'Premium']);
//   const [activeTab, setActiveTab] = useState("basic");
//   const [options, setOptions] = useState<PreferredOptions>({
//     sharingTypes: [],
//     roomTypes: [],
//     properties: [],
//     genderOptions: ['Male', 'Female', 'Other'],
//     countryCodes: ['+91', '+1', '+44', '+61', '+65'],
//     occupations: [],
//     cities: [],
//     states: []
//   });
  
//   // File states
//   const [idProofFile, setIdProofFile] = useState<File | null>(null);
//   const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
//   const [photoFile, setPhotoFile] = useState<File | null>(null);
//   const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  
//   // Existing files from tenant
//   const [existingFiles, setExistingFiles] = useState({
//     id_proof_url: tenant?.id_proof_url || "",
//     address_proof_url: tenant?.address_proof_url || "",
//     photo_url: tenant?.photo_url || "",
//   });
  
//   // Credential fields
//   const [createCredentials, setCreateCredentials] = useState(tenant?.has_credentials || false);
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordStrength, setPasswordStrength] = useState(0);
  
//   const [formData, setFormData] = useState({
//     full_name: tenant?.full_name || "",
//     email: tenant?.email || "",
//     country_code: tenant?.country_code || "+91",
//     phone: tenant?.phone || "",
//     date_of_birth: tenant?.date_of_birth || "",
//     gender: tenant?.gender || "",
//     occupation_category: tenant?.occupation_category || "",
//     exact_occupation: tenant?.exact_occupation || "",
//     occupation: tenant?.occupation || "",
//     address: tenant?.address || "",
//     city: tenant?.city || "",
//     state: tenant?.state || "",
//     pincode: tenant?.pincode || "",
//     preferred_sharing: tenant?.preferred_sharing || "",
//     preferred_room_type: tenant?.preferred_room_type || "",
//     preferred_property_id: tenant?.preferred_property_id || "",
//     portal_access_enabled: tenant?.portal_access_enabled || false,
//     is_active: tenant?.is_active ?? true,
//     emergency_contact_name: tenant?.emergency_contact_name || "",
//     emergency_contact_phone: tenant?.emergency_contact_phone || "",
//     emergency_contact_relation: tenant?.emergency_contact_relation || "",
//   });

//   // Initialize
//   useEffect(() => {
//     loadOptions();
//     if (tenant?.id) {
//       loadExistingDocuments();
//     }
//   }, [tenant]);

//   // Load available rooms when gender and property are selected
//   useEffect(() => {
//     if (formData.gender && formData.preferred_property_id) {
//       loadAvailableRooms();
//     }
//   }, [formData.gender, formData.preferred_property_id]);

//   // Check password strength
//   useEffect(() => {
//     if (password.length === 0) {
//       setPasswordStrength(0);
//       return;
//     }
    
//     let strength = 0;
//     if (password.length >= 6) strength += 25;
//     if (/[A-Z]/.test(password)) strength += 25;
//     if (/[0-9]/.test(password)) strength += 25;
//     if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
//     setPasswordStrength(strength);
//   }, [password]);

//   const loadOptions = async () => {
//     try {
//       // Load all options in parallel
//       const [preferredResult, propertiesResult, roomTypesResult] = await Promise.all([
//         getPreferredOptions(),
//         getAllProperties(),
//         getRoomTypes(),
//       ]);
//       console.log('Preferred options result:', propertiesResult);

//       // Set preferred options
//       if (preferredResult.success && preferredResult.data) {
//         setOptions(prev => ({
//           ...prev,
//           ...preferredResult.data,
//           genderOptions: preferredResult.data.genderOptions || ['Male', 'Female', 'Other'],
//           countryCodes: preferredResult.data.countryCodes || ['+91', '+1', '+44', '+61', '+65']
//         }));
//       }

//       // Set properties
//       if (propertiesResult.success && propertiesResult.data) {
//         const propertiesData = Array.isArray(propertiesResult.data) 
//           ? propertiesResult.data.map(p => ({
//               value: p.id,
//               label: p.name,
//               address: p.address || `${p.city}, ${p.state}`
//             }))
//           : [];
//         setProperties(propertiesData);
//       }

//       // Set room types
//       if (roomTypesResult.success && roomTypesResult.data) {
//         if (roomTypesResult.data.sharingTypes) {
//           setSharingTypes(roomTypesResult.data.sharingTypes);
//         }
//         if (roomTypesResult.data.roomTypes) {
//           setRoomTypes(roomTypesResult.data.roomTypes);
//         }
//       }
//     } catch (err) {
//       console.error("Failed to load options", err);
//       toast.error("Failed to load form options");
//     }
//   };

//   const loadExistingDocuments = async () => {
//     if (tenant?.id) {
//       try {
//         const res = await getTenant(tenant.id);
//         if (res?.success && res.data) {
//           setExistingFiles({
//             id_proof_url: res.data.id_proof_url || "",
//             address_proof_url: res.data.address_proof_url || "",
//             photo_url: res.data.photo_url || "",
//           });
//         }
//       } catch (err) {
//         console.error("Failed to load documents", err);
//         toast.error("Failed to load existing documents");
//       }
//     }
//   };

//   const loadAvailableRooms = async () => {
//     if (!formData.gender || !formData.preferred_property_id) return;
    
//     try {
//       const res = await getAvailableRooms(
//         formData.gender, 
//         formData.preferred_property_id
//       );
//       if (res?.success) {
//         setAvailableRooms(res.data || []);
//       }
//     } catch (err) {
//       console.error("Failed to load available rooms", err);
//       setAvailableRooms([]);
//     }
//   };

//   const validateForm = (): boolean => {
//     // Use the API validation function
//     const validation = validateTenantData(formData);
    
//     if (!validation.isValid) {
//       toast.error(validation.errors[0]);
//       setActiveTab("basic");
//       return false;
//     }
    
//     // Additional document validations
//     if (!idProofFile && !existingFiles.id_proof_url) {
//       toast.error("ID Proof is required");
//       setActiveTab("documents");
//       return false;
//     }
    
//     if (!addressProofFile && !existingFiles.address_proof_url) {
//       toast.error("Address Proof is required");
//       setActiveTab("documents");
//       return false;
//     }
    
//     if (!photoFile && !existingFiles.photo_url) {
//       toast.error("Photo is required");
//       setActiveTab("documents");
//       return false;
//     }
    
//     // Credential validations
//     if (createCredentials || (tenant?.has_credentials && password)) {
//       if (password.length < 6) {
//         toast.error("Password must be at least 6 characters");
//         setActiveTab("credentials");
//         return false;
//       }
      
//       if (password !== confirmPassword) {
//         toast.error("Passwords do not match");
//         setActiveTab("credentials");
//         return false;
//       }
//     }
    
//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;
    
//     setLoading(true);
//     setUploadProgress(0);
    
//     try {
//       // Simulate upload progress
//       const progressInterval = setInterval(() => {
//         setUploadProgress(prev => {
//           if (prev >= 90) {
//             clearInterval(progressInterval);
//             return prev;
//           }
//           return prev + 10;
//         });
//       }, 200);
      
//       // Prepare tenant data
//       const tenantData = {
//         ...formData,
//         // Convert boolean values
//         is_active: Boolean(formData.is_active),
//         portal_access_enabled: Boolean(formData.portal_access_enabled),
//         // Add credential info
//         ...(createCredentials && { create_credentials: "true" }),
//         ...(password && { password }),
//         ...(tenant && password && { update_credentials: "true" }),
//       };
      
//       // Prepare files object
//       const files = {
//         ...(idProofFile && { id_proof_url: idProofFile }),
//         ...(addressProofFile && { address_proof_url: addressProofFile }),
//         ...(photoFile && { photo_url: photoFile }),
//       };
//       console.log('Files to upload:sdjhfajsdhfkj');
//       // Create FormData
//       const formDataToSend = createTenantFormData(tenantData, files);
//       console.log('FormData prepared:', formDataToSend);
//       // Call API
//       let result;
//       if (tenant?.id) {
//         console.log('Updating tenant with ID:');
//         result = await updateTenant(tenant.id, formDataToSend);
//       } else {
//         console.log('create tenant with ID:')
//         result = await createTenant(formDataToSend);
//         console.log('result tenant with ID:',result)

//       }
      
//       clearInterval(progressInterval);
//       setUploadProgress(100);
      
//       if (result.success) {
//         const successMessage = tenant ? "Tenant updated successfully" : "Tenant created successfully";
//         toast.success(successMessage);
        
//         if (typeof onSuccess === "function") {
//           setTimeout(() => {
//             onSuccess();
//           }, 500); // Small delay to show completion
//         }
//       } else {
//         toast.error(result.message || "Operation failed");
//       }
//     } catch (err: any) {
//       console.error("Failed to save tenant", err);
//       toast.error(err.message || "Operation failed. Check console for details.");
//     } finally {
//       setLoading(false);
//       setUploadProgress(0);
//     }
//   };

//   const handleInputChange = (field: string, value: any) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSelectChange = (field: string, value: string | undefined) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const DocumentPreview = ({ url, type, onRemove }: { url: string; type: string; onRemove?: () => void }) => {
//     if (!url) return null;
    
//     const isImage = url.match(/\.(jpeg|jpg|png|gif|webp|bmp)$/i);
//     const isPdf = url.match(/\.pdf$/i);
//     const isWord = url.match(/\.(doc|docx)$/i);
    
//     const getIcon = () => {
//       if (isPdf) return "📄 PDF";
//       if (isWord) return "📝 Word";
//       return "📋 Document";
//     };
    
//     return (
//       <div className="mt-2 border rounded-lg p-3 bg-white">
//         <div className="flex items-center justify-between mb-2">
//           <div className="flex items-center gap-2">
//             <FileText className="h-4 w-4 text-blue-600" />
//             <span className="text-sm font-medium">{type}</span>
//           </div>
//           <div className="flex gap-2">
//             <a
//               href={url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
//             >
//               <Eye className="h-3 w-3" />
//               View
//             </a>
//             {onRemove && (
//               <button
//                 type="button"
//                 onClick={onRemove}
//                 className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
//               >
//                 <X className="h-3 w-3" />
//                 Remove
//               </button>
//             )}
//           </div>
//         </div>
        
//         {isImage ? (
//           <div className="relative">
//             <img 
//               src={url} 
//               alt={type}
//               className="h-40 w-full object-cover rounded border"
//               onError={(e) => {
//                 (e.target as HTMLImageElement).style.display = 'none';
//                 const parent = e.target.parentElement;
//                 if (parent) {
//                   parent.innerHTML = `
//                     <div class="h-40 w-full bg-gray-100 rounded flex flex-col items-center justify-center">
//                       <FileText class="h-8 w-8 text-gray-400 mb-2" />
//                       <p class="text-sm text-gray-600">Image not available</p>
//                       <a href="${url}" target="_blank" class="text-xs text-blue-600 hover:underline mt-1">
//                         View file directly
//                       </a>
//                     </div>
//                   `;
//                 }
//               }}
//             />
//             <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
//               {type}
//             </div>
//           </div>
//         ) : (
//           <div className="h-40 w-full bg-gray-100 rounded flex flex-col items-center justify-center p-4">
//             <FileText className="h-12 w-12 text-gray-400 mb-3" />
//             <p className="text-sm font-medium text-gray-700 mb-1">{getIcon()}</p>
//             <p className="text-xs text-gray-500 text-center">{type} Document</p>
//             <a
//               href={url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="mt-3 text-xs text-blue-600 hover:text-blue-800 hover:underline"
//             >
//               Click to download/view
//             </a>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const FileUploadField = ({ 
//     label, 
//     file, 
//     setFile, 
//     existingUrl,
//     fieldName,
//     accept = ".pdf,.jpg,.jpeg,.png,.webp,.bmp,.doc,.docx",
//     description = "Max file size: 10MB",
//     required = true
//   }: { 
//     label: string;
//     file: File | null;
//     setFile: (file: File | null) => void;
//     existingUrl: string;
//     fieldName: string;
//     accept?: string;
//     description?: string;
//     required?: boolean;
//   }) => (
//     <div className="space-y-3">
//       <Label htmlFor={fieldName}>
//         <div className="flex items-center gap-2">
//           <FileText className="h-4 w-4" />
//           {label} {required && "*"}
//         </div>
//       </Label>
      
//       <div className="space-y-2">
//         <Input
//           id={fieldName}
//           type="file"
//           accept={accept}
//           onChange={(e) => {
//             if (e.target.files && e.target.files[0]) {
//               const selectedFile = e.target.files[0];
//               // Check file size (10MB)
//               if (selectedFile.size > 10 * 1024 * 1024) {
//                 toast.error("File size exceeds 10MB limit");
//                 return;
//               }
//               setFile(selectedFile);
//             }
//           }}
//           className="cursor-pointer"
//         />
        
//         {file && (
//           <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium text-blue-800">New file selected:</p>
//                 <p className="text-blue-700 text-sm">{file.name}</p>
//                 <p className="text-xs text-blue-600">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
//               </div>
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="h-8 text-red-600 hover:text-red-800 hover:bg-red-50"
//                 onClick={() => setFile(null)}
//               >
//                 <X className="h-3 w-3" />
//               </Button>
//             </div>
//           </div>
//         )}
        
//         {!file && existingUrl && (
//           <DocumentPreview
//             url={existingUrl}
//             type={label}
//             onRemove={() => {
//               setExistingFiles(prev => ({ ...prev, [fieldName]: "" }));
//               toast.info(`${label} will be removed. Please upload a new file.`);
//             }}
//           />
//         )}
        
//         {!file && !existingUrl && (
//           <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
//             <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
//             <p className="text-sm text-gray-600">Click to upload {label.toLowerCase()}</p>
//             <p className="text-xs text-gray-500 mt-1">{description}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   const occupationCategories = [
//     { value: "Service", label: "Service", icon: "💼" },
//     { value: "Business", label: "Business", icon: "🏢" },
//     { value: "Student", label: "Student", icon: "🎓" },
//     { value: "Professional", label: "Professional", icon: "👨‍💻" },
//     { value: "Self-Employed", label: "Self-Employed", icon: "👨‍🍳" },
//     { value: "Other", label: "Other", icon: "👤" },
//   ];

//   const emergencyRelations = [
//     "Father", "Mother", "Brother", "Sister", "Spouse", 
//     "Friend", "Relative", "Guardian", "Other"
//   ];

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Progress Bar */}
//       {loading && uploadProgress > 0 && (
//         <div className="space-y-2">
//           <div className="flex justify-between text-sm">
//             <span>Uploading...</span>
//             <span>{uploadProgress}%</span>
//           </div>
//           <Progress value={uploadProgress} className="h-2" />
//         </div>
//       )}

//       {/* Form Tabs */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         <TabsList className="grid grid-cols-5 mb-6">
//           <TabsTrigger value="basic" className="flex items-center gap-2">
//             <User className="h-4 w-4" />
//             <span className="hidden sm:inline">Basic Info</span>
//           </TabsTrigger>
//           <TabsTrigger value="occupation" className="flex items-center gap-2">
//             <Briefcase className="h-4 w-4" />
//             <span className="hidden sm:inline">Occupation</span>
//           </TabsTrigger>
//           <TabsTrigger value="address" className="flex items-center gap-2">
//             <MapPin className="h-4 w-4" />
//             <span className="hidden sm:inline">Address</span>
//           </TabsTrigger>
//           <TabsTrigger value="documents" className="flex items-center gap-2">
//             <FileText className="h-4 w-4" />
//             <span className="hidden sm:inline">Documents</span>
//           </TabsTrigger>
//           <TabsTrigger value="credentials" className="flex items-center gap-2">
//             <Key className="h-4 w-4" />
//             <span className="hidden sm:inline">Login</span>
//           </TabsTrigger>
//         </TabsList>

//         {/* Basic Information Tab */}
//         <TabsContent value="basic" className="space-y-6">
//           <Card>
//             <CardHeader className="bg-blue-50">
//               <CardTitle className="flex items-center gap-2">
//                 <User className="h-5 w-5" />
//                 Personal Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="full_name">
//                       <span className="text-red-500">*</span> Full Name
//                     </Label>
//                     <Input
//                       id="full_name"
//                       value={formData.full_name}
//                       onChange={(e) => handleInputChange("full_name", e.target.value)}
//                       placeholder="Enter full name"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="email">
//                       <span className="text-red-500">*</span> Email Address
//                     </Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={formData.email}
//                       onChange={(e) => handleInputChange("email", e.target.value)}
//                       placeholder="example@email.com"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="phone">
//                       <span className="text-red-500">*</span> Phone Number
//                     </Label>
//                     <div className="flex gap-2">
//                       <Select
//                         value={formData.country_code}
//                         onValueChange={(value) => handleInputChange("country_code", value)}
//                       >
//                         <SelectTrigger className="w-[140px]">
//                           <SelectValue placeholder="+91" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {options.countryCodes.map((code) => (
//                             <SelectItem key={code} value={code}>
//                               {code}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <Input
//                         id="phone"
//                         type="tel"
//                         value={formData.phone}
//                         onChange={(e) => handleInputChange("phone", e.target.value)}
//                         placeholder="9876543210"
//                         pattern="[6-9][0-9]{9}"
//                         maxLength={10}
//                         required
//                       />
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       10-digit Indian mobile number starting with 6-9
//                     </p>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="date_of_birth">Date of Birth</Label>
//                     <div className="relative">
//                       <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <Input
//                         id="date_of_birth"
//                         type="date"
//                         value={formData.date_of_birth}
//                         onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
//                         className="pl-10"
//                         max={new Date().toISOString().split('T')[0]}
//                       />
//                     </div>
//                     {formData.date_of_birth && (
//                       <p className="text-xs text-gray-500">
//                         Must be at least 18 years old
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="gender">
//                       <span className="text-red-500">*</span> Gender
//                     </Label>
//                     <Select
//                       value={formData.gender}
//                       onValueChange={(value) => handleSelectChange("gender", value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select gender" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {options.genderOptions.map((option) => (
//                           <SelectItem key={option} value={option}>
//                             {option}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Emergency Contact</Label>
//                     <div className="grid grid-cols-2 gap-2">
//                       <Input
//                         placeholder="Name"
//                         value={formData.emergency_contact_name}
//                         onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
//                       />
//                       <Input
//                         placeholder="Phone"
//                         value={formData.emergency_contact_phone}
//                         onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
//                       />
//                     </div>
//                     <Select
//                       value={formData.emergency_contact_relation}
//                       onValueChange={(value) => handleSelectChange("emergency_contact_relation", value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Relation" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {emergencyRelations.map((relation) => (
//                           <SelectItem key={relation} value={relation}>
//                             {relation}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-4 pt-4">
//                     <div className="flex items-center gap-2">
//                       <Switch
//                         id="is_active"
//                         checked={formData.is_active}
//                         onCheckedChange={(checked) => handleInputChange("is_active", checked)}
//                       />
//                       <Label htmlFor="is_active" className="cursor-pointer">
//                         Active Tenant
//                       </Label>
//                     </div>
                    
//                     <div className="flex items-center gap-2">
//                       <Switch
//                         id="portal_access_enabled"
//                         checked={formData.portal_access_enabled}
//                         onCheckedChange={(checked) => handleInputChange("portal_access_enabled", checked)}
//                       />
//                       <Label htmlFor="portal_access_enabled" className="cursor-pointer">
//                         Enable Portal Access
//                       </Label>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Occupation Tab */}
//         <TabsContent value="occupation" className="space-y-6">
//           <Card>
//             <CardHeader className="bg-green-50">
//               <CardTitle className="flex items-center gap-2">
//                 <Briefcase className="h-5 w-5" />
//                 Occupation & Room Preferences
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="occupation_category">Occupation Category</Label>
//                     <Select
//                       value={formData.occupation_category}
//                       onValueChange={(value) => handleSelectChange("occupation_category", value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="any">Any</SelectItem>
//                         {occupationCategories.map((option) => (
//                           <SelectItem key={option.value} value={option.value}>
//                             <span className="mr-2">{option.icon}</span>
//                             {option.label}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="exact_occupation">
//                       {formData.occupation_category === "Student" 
//                         ? "Course & College/University"
//                         : formData.occupation_category === "Service" 
//                         ? "Job Title & Company"
//                         : formData.occupation_category === "Business"
//                         ? "Business Type & Name"
//                         : "Occupation Details"}
//                     </Label>
//                     <Textarea
//                       id="exact_occupation"
//                       value={formData.exact_occupation}
//                       onChange={(e) => handleInputChange("exact_occupation", e.target.value)}
//                       placeholder={
//                         formData.occupation_category === "Student"
//                           ? "e.g., B.Tech Computer Science at ABC University"
//                           : formData.occupation_category === "Service"
//                           ? "e.g., Software Engineer at XYZ Corporation"
//                           : formData.occupation_category === "Business"
//                           ? "e.g., Retail Business - Fashion Store"
//                           : "Enter occupation details"
//                       }
//                       rows={3}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="occupation">Additional Details</Label>
//                     <Input
//                       id="occupation"
//                       value={formData.occupation}
//                       onChange={(e) => handleInputChange("occupation", e.target.value)}
//                       placeholder="Any additional occupation information"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="preferred_property_id">Preferred Property</Label>
//                     <Select
//                       value={formData.preferred_property_id?.toString() || ""}
//                       onValueChange={(value) => {
//                         const val = value ? parseInt(value) : undefined;
//                         setFormData(prev => ({ ...prev, preferred_property_id: val }));
//                       }}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select property" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="none">None</SelectItem>
//                         {properties.map((property) => (
//                           <SelectItem key={property.value} value={property.value.toString()}>
//                             <div className="flex flex-col">
//                               <span className="font-medium">{property.label}</span>
//                               <span className="text-xs text-gray-500">
//                                 {property.address}
//                               </span>
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {formData.gender && formData.preferred_property_id && availableRooms.length > 0 && (
//                     <div className="space-y-2">
//                       <Label>Available Rooms ({availableRooms.length} found)</Label>
//                       <div className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
//                         {availableRooms.map((room) => (
//                           <div
//                             key={room.id}
//                             className="p-3 mb-2 border rounded hover:bg-white cursor-pointer transition-colors"
//                             onClick={() => {
//                               handleSelectChange("preferred_sharing", room.sharing_type);
//                               handleSelectChange("preferred_room_type", room.room_type);
//                             }}
//                           >
//                             <div className="flex items-center justify-between">
//                               <div>
//                                 <div className="flex items-center gap-2">
//                                   <Building className="h-4 w-4 text-blue-600" />
//                                   <span className="font-medium">Room {room.room_number}</span>
//                                   <Badge variant="outline">
//                                     {room.sharing_type}
//                                   </Badge>
//                                 </div>
//                                 <div className="text-sm text-gray-600 mt-1">
//                                   {room.room_type} • Floor {room.floor || "G"} • 
//                                   {(room.available_beds || (room.total_bed - room.occupied_beds))} bed(s) available
//                                 </div>
//                               </div>
//                               <Badge variant="secondary" className="bg-green-50 text-green-700">
//                                 ₹{room.rent_per_bed || room.monthly_rent}/bed
//                               </Badge>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="preferred_sharing">Preferred Sharing</Label>
//                       <Select
//                         value={formData.preferred_sharing}
//                         onValueChange={(value) => handleSelectChange("preferred_sharing", value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select sharing" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="any">Any</SelectItem>
//                           {sharingTypes.map((type) => (
//                             <SelectItem key={type} value={type}>
//                               {type.charAt(0).toUpperCase() + type.slice(1)} Sharing
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="preferred_room_type">Room Type</Label>
//                       <Select
//                         value={formData.preferred_room_type}
//                         onValueChange={(value) => handleSelectChange("preferred_room_type", value)}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="any">Any</SelectItem>
//                           {roomTypes.map((type) => (
//                             <SelectItem key={type} value={type}>
//                               {type}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Address Tab */}
//         <TabsContent value="address" className="space-y-6">
//           <Card>
//             <CardHeader className="bg-purple-50">
//               <CardTitle className="flex items-center gap-2">
//                 <MapPin className="h-5 w-5" />
//                 Address Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-6">
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="address">
//                     <span className="text-red-500">*</span> Complete Address
//                   </Label>
//                   <Textarea
//                     id="address"
//                     value={formData.address}
//                     onChange={(e) => handleInputChange("address", e.target.value)}
//                     placeholder="House no, Building, Street, Area, Landmark"
//                     rows={3}
//                     required
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="city">
//                       <span className="text-red-500">*</span> City
//                     </Label>
//                     <Input
//                       id="city"
//                       value={formData.city}
//                       onChange={(e) => handleInputChange("city", e.target.value)}
//                       placeholder="Enter city"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="state">
//                       <span className="text-red-500">*</span> State
//                     </Label>
//                     <Input
//                       id="state"
//                       value={formData.state}
//                       onChange={(e) => handleInputChange("state", e.target.value)}
//                       placeholder="Enter state"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="pincode">Pincode</Label>
//                     <Input
//                       id="pincode"
//                       value={formData.pincode}
//                       onChange={(e) => handleInputChange("pincode", e.target.value)}
//                       placeholder="6-digit pincode"
//                       maxLength={6}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Documents Tab */}
//         <TabsContent value="documents" className="space-y-6">
//           <Card>
//             <CardHeader className="bg-amber-50">
//               <CardTitle className="flex items-center gap-2">
//                 <FileText className="h-5 w-5" />
//                 Required Documents
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-6">
//               <Alert className="mb-6 bg-blue-50 border-blue-200">
//                 <AlertCircle className="h-4 w-4 text-blue-600" />
//                 <AlertDescription className="text-blue-800">
//                   All marked (*) documents are required. Max file size: 10MB per file.
//                   Supported formats: PDF, JPG, PNG, WebP, BMP, DOC, DOCX.
//                 </AlertDescription>
//               </Alert>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <FileUploadField
//                   label="ID Proof"
//                   file={idProofFile}
//                   setFile={setIdProofFile}
//                   existingUrl={existingFiles.id_proof_url}
//                   fieldName="id_proof_url"
//                   description="Aadhar Card, Passport, PAN Card, Driving License"
//                 />
                
//                 <FileUploadField
//                   label="Address Proof"
//                   file={addressProofFile}
//                   setFile={setAddressProofFile}
//                   existingUrl={existingFiles.address_proof_url}
//                   fieldName="address_proof_url"
//                   description="Utility Bill, Bank Statement, Rental Agreement"
//                 />
                
//                 <FileUploadField
//                   label="Photograph"
//                   file={photoFile}
//                   setFile={setPhotoFile}
//                   existingUrl={existingFiles.photo_url}
//                   fieldName="photo_url"
//                   accept=".jpg,.jpeg,.png,.webp,.bmp"
//                   description="Recent passport-size photo"
//                 />
//               </div>

//               {/* Additional Documents */}
//               <Separator className="my-6" />
              
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <Label className="text-lg font-medium">Additional Documents (Optional)</Label>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => {
//                       const input = document.createElement('input');
//                       input.type = 'file';
//                       input.accept = ".pdf,.jpg,.jpeg,.png,.webp,.bmp,.doc,.docx";
//                       input.multiple = true;
//                       input.onchange = (e: any) => {
//                         const files = Array.from(e.target.files);
//                         if (files.length + additionalFiles.length > 5) {
//                           toast.error("Maximum 5 additional documents allowed");
//                           return;
//                         }
//                         setAdditionalFiles(prev => [...prev, ...files as File[]]);
//                       };
//                       input.click();
//                     }}
//                   >
//                     <Upload className="h-4 w-4 mr-2" />
//                     Add More Files
//                   </Button>
//                 </div>
                
//                 {additionalFiles.length > 0 && (
//                   <div className="space-y-3">
//                     {additionalFiles.map((file, index) => (
//                       <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
//                         <div className="flex items-center gap-3">
//                           <FileText className="h-5 w-5 text-gray-500" />
//                           <div>
//                             <p className="font-medium">{file.name}</p>
//                             <p className="text-xs text-gray-500">
//                               {(file.size / 1024 / 1024).toFixed(2)} MB
//                             </p>
//                           </div>
//                         </div>
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="sm"
//                           className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
//                           onClick={() => {
//                             setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
//                           }}
//                         >
//                           <X className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
                
//                 <p className="text-sm text-gray-500">
//                   You can upload additional documents like company ID, college ID, reference letters, etc.
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Credentials Tab */}
//         <TabsContent value="credentials" className="space-y-6">
//           <Card>
//             <CardHeader className="bg-emerald-50">
//               <CardTitle className="flex items-center gap-2">
//                 <Key className="h-5 w-5" />
//                 Login Credentials
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-6">
//               <div className="space-y-6">
//                 {/* Current Credential Status */}
//                 {tenant?.has_credentials ? (
//                   <Alert className="bg-green-50 border-green-200">
//                     <div className="flex items-start gap-3">
//                       <Shield className="h-5 w-5 text-green-600 mt-0.5" />
//                       <div>
//                         <h4 className="font-medium text-green-800">Login Already Configured</h4>
//                         <p className="text-sm text-green-700 mt-1">
//                           Tenant already has portal access. You can reset the password below.
//                         </p>
//                         <div className="mt-3 space-y-1">
//                           <p className="text-sm">
//                             <span className="font-medium">Email:</span> {tenant.credential_email || tenant.email}
//                           </p>
//                           <p className="text-sm">
//                             <span className="font-medium">Status:</span>{" "}
//                             <Badge variant="outline" className="bg-green-100 text-green-800">
//                               Active
//                             </Badge>
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </Alert>
//                 ) : (
//                   <Alert className="bg-blue-50 border-blue-200">
//                     <div className="flex items-start gap-3">
//                       <Key className="h-5 w-5 text-blue-600 mt-0.5" />
//                       <div>
//                         <h4 className="font-medium text-blue-800">Create Portal Access</h4>
//                         <p className="text-sm text-blue-700 mt-1">
//                           Enable tenant portal access by creating login credentials.
//                           Tenant can use these credentials to log into their portal.
//                         </p>
//                       </div>
//                     </div>
//                   </Alert>
//                 )}

//                 {/* Enable/Disable Switch */}
//                 <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
//                   <div className="space-y-1">
//                     <Label className="font-medium">
//                       {tenant?.has_credentials ? "Reset Password" : "Create Login Credentials"}
//                     </Label>
//                     <p className="text-sm text-gray-600">
//                       {tenant?.has_credentials 
//                         ? "Enter new password to reset credentials"
//                         : "Enable tenant portal access"}
//                     </p>
//                   </div>
//                   <Switch
//                     checked={createCredentials || tenant?.has_credentials}
//                     onCheckedChange={setCreateCredentials}
//                     disabled={tenant?.has_credentials}
//                   />
//                 </div>

//                 {/* Password Fields */}
//                 {(createCredentials || tenant?.has_credentials) && (
//                   <div className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="space-y-3">
//                         <Label htmlFor="password">
//                           <span className="text-red-500">*</span> 
//                           {tenant?.has_credentials ? "New Password" : "Password"}
//                         </Label>
//                         <div className="relative">
//                           <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                           <Input
//                             id="password"
//                             type="password"
//                             placeholder="Enter password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="pl-10"
//                             minLength={6}
//                             required
//                           />
//                         </div>
                        
//                         {/* Password Strength Meter */}
//                         {password.length > 0 && (
//                           <div className="space-y-2">
//                             <div className="flex justify-between text-xs">
//                               <span>Password Strength:</span>
//                               <span className={
//                                 passwordStrength >= 75 ? "text-green-600" :
//                                 passwordStrength >= 50 ? "text-yellow-600" :
//                                 passwordStrength >= 25 ? "text-orange-600" : "text-red-600"
//                               }>
//                                 {passwordStrength >= 75 ? "Strong" :
//                                  passwordStrength >= 50 ? "Good" :
//                                  passwordStrength >= 25 ? "Weak" : "Very Weak"}
//                               </span>
//                             </div>
//                             <Progress 
//                               value={passwordStrength} 
//                               className="h-2"
//                               indicatorClassName={
//                                 passwordStrength >= 75 ? "bg-green-500" :
//                                 passwordStrength >= 50 ? "bg-yellow-500" :
//                                 passwordStrength >= 25 ? "bg-orange-500" : "bg-red-500"
//                               }
//                             />
//                           </div>
//                         )}
//                       </div>

//                       <div className="space-y-3">
//                         <Label htmlFor="confirmPassword">
//                           <span className="text-red-500">*</span> Confirm Password
//                         </Label>
//                         <div className="relative">
//                           <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                           <Input
//                             id="confirmPassword"
//                             type="password"
//                             placeholder="Confirm password"
//                             value={confirmPassword}
//                             onChange={(e) => setConfirmPassword(e.target.value)}
//                             className="pl-10"
//                             minLength={6}
//                             required
//                           />
//                         </div>
                        
//                         {password && confirmPassword && (
//                           <div className={`flex items-center gap-2 text-sm ${
//                             password === confirmPassword ? "text-green-600" : "text-red-600"
//                           }`}>
//                             {password === confirmPassword ? (
//                               <>
//                                 <Check className="h-4 w-4" />
//                                 <span>Passwords match</span>
//                               </>
//                             ) : (
//                               <>
//                                 <AlertTriangle className="h-4 w-4" />
//                                 <span>Passwords don't match</span>
//                               </>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Password Requirements */}
//                     <div className="p-4 border rounded-lg bg-gray-50">
//                       <Label className="font-medium mb-2 block">Password Requirements:</Label>
//                       <ul className="space-y-1 text-sm text-gray-600">
//                         <li className={`flex items-center gap-2 ${password.length >= 6 ? "text-green-600" : ""}`}>
//                           <div className={`h-2 w-2 rounded-full ${password.length >= 6 ? "bg-green-500" : "bg-gray-300"}`} />
//                           Minimum 6 characters
//                         </li>
//                         <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-green-600" : ""}`}>
//                           <div className={`h-2 w-2 rounded-full ${/[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
//                           At least one uppercase letter
//                         </li>
//                         <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? "text-green-600" : ""}`}>
//                           <div className={`h-2 w-2 rounded-full ${/[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
//                           At least one number
//                         </li>
//                         <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}`}>
//                           <div className={`h-2 w-2 rounded-full ${/[^A-Za-z0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
//                           At least one special character
//                         </li>
//                       </ul>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Form Actions */}
//       <div className="flex items-center justify-between pt-6 border-t">
//         <div className="flex items-center gap-4">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={onCancel}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
          
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => {
//               const tabs = ["basic", "occupation", "address", "documents", "credentials"];
//               const currentIndex = tabs.indexOf(activeTab);
//               if (currentIndex > 0) {
//                 setActiveTab(tabs[currentIndex - 1]);
//               }
//             }}
//             disabled={activeTab === "basic" || loading}
//           >
//             Previous
//           </Button>
          
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() => {
//               const tabs = ["basic", "occupation", "address", "documents", "credentials"];
//               const currentIndex = tabs.indexOf(activeTab);
//               if (currentIndex < tabs.length - 1) {
//                 setActiveTab(tabs[currentIndex + 1]);
//               }
//             }}
//             disabled={activeTab === "credentials" || loading}
//           >
//             Next
//           </Button>
//         </div>
        
//         <Button 
//           type="submit" 
//           disabled={loading}
//           className="min-w-[140px]"
//         >
//           {loading ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               {uploadProgress > 0 ? "Uploading..." : "Saving..."}
//             </>
//           ) : tenant ? "Update Tenant" : "Create Tenant"}
//         </Button>
//       </div>

//       {/* Form Status Summary */}
//       <div className="mt-6 p-4 border rounded-lg bg-gray-50">
//         <h4 className="font-medium mb-2">Form Status</h4>
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
//           {[
//             { tab: "basic", label: "Basic Info", complete: !!formData.full_name && !!formData.email && !!formData.phone },
//             { tab: "occupation", label: "Occupation", complete: !!formData.occupation_category },
//             { tab: "address", label: "Address", complete: !!formData.address && !!formData.city && !!formData.state },
//             { tab: "documents", label: "Documents", complete: 
//               (!!idProofFile || !!existingFiles.id_proof_url) && 
//               (!!addressProofFile || !!existingFiles.address_proof_url) && 
//               (!!photoFile || !!existingFiles.photo_url) 
//             },
//             { tab: "credentials", label: "Login", complete: 
//               !createCredentials || 
//               (password.length >= 6 && password === confirmPassword)
//             },
//           ].map((section) => (
//             <div 
//               key={section.tab}
//               className={`flex items-center gap-2 p-2 rounded ${section.complete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
//               onClick={() => setActiveTab(section.tab)}
//             >
//               <div className={`h-2 w-2 rounded-full ${section.complete ? 'bg-green-500' : 'bg-gray-400'}`} />
//               <span>{section.label}</span>
//               {section.complete && <Check className="h-3 w-3 ml-auto" />}
//             </div>
//           ))}
//         </div>
//       </div>
//     </form>
//   );
// }


// components/admin/tenants/tenant-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  X,
  Eye,
  Loader2,
  Key,
  AlertCircle,
  Check,
  Calendar,
  MapPin,
  Building,
  User,
  Briefcase,
  Lock,
  Shield,
  AlertTriangle,
  Clock3
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  createTenant,
  updateTenant,
  getTenant,
  getAllProperties,
  getAvailableRooms,
  getRoomTypes,
  getPreferredOptions,
  getPropertyDetails, // Import this from tenantApi
  type Tenant,
  type PreferredOptions,
  type OptionType,
} from "@/lib/tenantApi";

// Add Property type definition
type Property = {
  id: number;
  name: string;
  city?: string;
  state?: string;
  address?: string;
  lockin_period_months: number;
  lockin_penalty_amount: number;
  lockin_penalty_type: string;
  notice_period_days: number;
  notice_penalty_amount: number;
  notice_penalty_type: string;
};

interface TenantFormProps {
  tenant?: Tenant;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TenantForm({ tenant, onSuccess, onCancel }: TenantFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [properties, setProperties] = useState<OptionType[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [sharingTypes, setSharingTypes] = useState<string[]>(['single', 'double', 'triple']);
  const [roomTypes, setRoomTypes] = useState<string[]>(['AC', 'Non-AC', 'Deluxe', 'Premium']);
  const [activeTab, setActiveTab] = useState("basic");
  const [options, setOptions] = useState<PreferredOptions>({
    sharingTypes: [],
    roomTypes: [],
    properties: [],
    genderOptions: ['Male', 'Female', 'Other'],
    countryCodes: ['+91', '+1', '+44', '+61', '+65'],
    occupations: [],
    cities: [],
    states: []
  });
  
  // File states
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<Property | null>(null);
  const [useCustomTerms, setUseCustomTerms] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Existing files from tenant
  const [existingFiles, setExistingFiles] = useState({
    id_proof_url: tenant?.id_proof_url || "",
    address_proof_url: tenant?.address_proof_url || "",
    photo_url: tenant?.photo_url || "",
  });
  
  // Additional documents from tenant
  const [additionalDocuments, setAdditionalDocuments] = useState<Array<{
    filename: string;
    url: string;
    uploaded_at?: string;
  }>>(tenant?.additional_documents || []);
  
  // Credential fields
  const [createCredentials, setCreateCredentials] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const [formData, setFormData] = useState<any>({
      salutation: tenant?.salutation || "",
    full_name: tenant?.full_name || "",
    email: tenant?.email || "",
    country_code: tenant?.country_code || "+91",
    phone: tenant?.phone || "",
    date_of_birth: tenant?.date_of_birth || "",
    gender: tenant?.gender || "",
    occupation_category: tenant?.occupation_category || "",
    exact_occupation: tenant?.exact_occupation || "",
    occupation: tenant?.occupation || "",
    address: tenant?.address || "",
    city: tenant?.city || "",
    state: tenant?.state || "",
    pincode: tenant?.pincode || "",
    preferred_sharing: tenant?.preferred_sharing || "",
    preferred_room_type: tenant?.preferred_room_type || "",
    preferred_property_id: tenant?.preferred_property_id || "",
     check_in_date: tenant?.check_in_date || "",
    portal_access_enabled: tenant?.portal_access_enabled || false,
    is_active: tenant?.is_active ?? true,
    emergency_contact_name: tenant?.emergency_contact_name || "",
    emergency_contact_phone: tenant?.emergency_contact_phone || "",
    emergency_contact_relation: tenant?.emergency_contact_relation || "",
    // New fields for property terms
    // lockin_period_months: tenant?.lockin_period_months || 0,
    // lockin_penalty_amount: tenant?.lockin_penalty_amount || 0,
    // lockin_penalty_type: tenant?.lockin_penalty_type || "fixed",
    // notice_period_days: tenant?.notice_period_days || 0,
    // notice_penalty_amount: tenant?.notice_penalty_amount || 0,
    // FIX: Use tenant's custom values if they exist, otherwise default to 0
  lockin_period_months: tenant?.lockin_period_months !== undefined ? tenant.lockin_period_months : 0,
  lockin_penalty_amount: tenant?.lockin_penalty_amount !== undefined ? tenant.lockin_penalty_amount : 0,
  lockin_penalty_type: tenant?.lockin_penalty_type || "fixed",
  notice_period_days: tenant?.notice_period_days !== undefined ? tenant.notice_period_days : 0,
  notice_penalty_amount: tenant?.notice_penalty_amount !== undefined ? tenant.notice_penalty_amount : 0,
    notice_penalty_type: tenant?.notice_penalty_type || "fixed",
    property_id: tenant?.property_id || undefined,
  });

  // Initialize
  useEffect(() => {
    loadOptions();
    if (tenant?.id) {
      loadExistingDocuments();
      // Load additional documents
      if (tenant.additional_documents) {
        setAdditionalDocuments(tenant.additional_documents);
      }
      // Set createCredentials based on tenant's existing credentials
      setCreateCredentials(tenant?.has_credentials || false);
    }
  }, [tenant]);

  // Load available rooms when gender and property are selected
  useEffect(() => {
    if (formData.gender && formData.preferred_property_id) {
      loadAvailableRooms();
    }
  }, [formData.gender, formData.preferred_property_id]);

  // Check password strength
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [password]);

  // Add effect to fetch property details when property is selected
  // useEffect(() => {
  //   if (formData.property_id) {
  //     fetchPropertyDetails(formData.property_id);
  //   } else {
  //     setSelectedPropertyDetails(null);
  //   }
  // }, [formData.property_id]);
  // Update this effect to include useCustomTerms as a dependency
useEffect(() => {
  console.log('🔍 Property ID changed:', formData.property_id);
  console.log('Current useCustomTerms:', useCustomTerms);
  console.log('Current form terms:', {
    lockin: formData.lockin_period_months,
    notice: formData.notice_period_days
  });
  if (formData.property_id && !useCustomTerms) {
    console.log('📋 Fetching property details (custom terms OFF)');
    fetchPropertyDetails(formData.property_id);
  } else {
     console.log('⏸️ Skipping property fetch (custom terms ON)');
    setSelectedPropertyDetails(null);
  }
}, [formData.property_id, useCustomTerms]); // Added useCustomTerms as dependency

  // Add effect to initialize useCustomTerms
  // useEffect(() => {
  //   if (tenant?.id) {
  //     // If tenant already has custom values, show custom fields
  //     const hasCustomLockin = tenant.lockin_period_months !== undefined && tenant.lockin_period_months !== null;
  //     const hasCustomNotice = tenant.notice_period_days !== undefined && tenant.notice_period_days !== null;
  //     setUseCustomTerms(hasCustomLockin || hasCustomNotice);
  //   }
  // }, [tenant]);

  // Replace the existing useEffect for initializing useCustomTerms with this:

// Add effect to initialize useCustomTerms
useEffect(() => {
  if (tenant?.id) {
    // Check if tenant has custom terms different from property defaults
    console.log('🔄 Initializing tenant edit mode');
    console.log('Tenant custom terms:', {
      lockin: tenant.lockin_period_months,
      notice: tenant.notice_period_days,
      lockinPenalty: tenant.lockin_penalty_amount,
      noticePenalty: tenant.notice_penalty_amount
    });
    // This is the key fix - we need to check if tenant has any custom terms set
    const hasCustomTerms = 
      (tenant.lockin_period_months !== null && tenant.lockin_period_months !== undefined) ||
      (tenant.lockin_penalty_amount !== null && tenant.lockin_penalty_amount !== undefined) ||
      (tenant.notice_period_days !== null && tenant.notice_period_days !== undefined) ||
      (tenant.notice_penalty_amount !== null && tenant.notice_penalty_amount !== undefined);
    
    console.log('Has custom terms?', hasCustomTerms);
    // console.log('Breakdown:', { hasCustomLockin, hasCustomNotice, hasCustomLockinPenalty, hasCustomNoticePenalty });

    setUseCustomTerms(hasCustomTerms);
    
    // If tenant has custom terms, ensure form data uses tenant values
    if (hasCustomTerms) {
      setFormData((prev: any) => ({
        ...prev,
        lockin_period_months: tenant.lockin_period_months || 0,
        lockin_penalty_amount: tenant.lockin_penalty_amount || 0,
        lockin_penalty_type: tenant.lockin_penalty_type || "fixed",
        notice_period_days: tenant.notice_period_days || 0,
        notice_penalty_amount: tenant.notice_penalty_amount || 0,
        notice_penalty_type: tenant.notice_penalty_type || "fixed",
      }));
    }
  } else {
    // For new tenants, default to OFF
    setUseCustomTerms(false);
  }
}, [tenant]);

  // Function to fetch property details - UPDATED to use tenantApi
const fetchPropertyDetails = async (propertyId: number) => {
  try {
    console.log('🔍 Fetching property details for ID:', propertyId);
    console.log('Current tenant ID:', tenant?.id);
    console.log('Current useCustomTerms:', useCustomTerms);
    
    const res:any = await getPropertyDetails(propertyId);
    
    if (res.success && res.data) {
      console.log('✅ Property details fetched:', res.data);
      setSelectedPropertyDetails(res.data);
      
      // CRITICAL FIX: Check if we're editing an existing tenant
      // AND if tenant already has custom terms set
      const isEditingExistingTenant = tenant?.id !== undefined;
      const tenantHasCustomValues = 
        tenant?.lockin_period_months !== null || 
        tenant?.notice_period_days !== null ||
        tenant?.lockin_penalty_amount !== null ||
        tenant?.notice_penalty_amount !== null;
      
      console.log('Editing existing tenant?', isEditingExistingTenant);
      console.log('Tenant has custom values?', tenantHasCustomValues);
      console.log('useCustomTerms toggle state:', useCustomTerms);
      
      // Only apply property defaults if:
      // 1. We're NOT editing an existing tenant (creating new) OR
      // 2. Tenant doesn't have custom values AND custom terms toggle is OFF
      if (!isEditingExistingTenant || (!tenantHasCustomValues && !useCustomTerms)) {
        console.log('📝 Applying property defaults to form');
        setFormData((prev: { lockin_period_months: any; lockin_penalty_amount: any; lockin_penalty_type: any; notice_period_days: any; notice_penalty_amount: any; notice_penalty_type: any; }) => ({
          ...prev,
          lockin_period_months: res.data.lockin_period_months || prev.lockin_period_months,
          lockin_penalty_amount: res.data.lockin_penalty_amount || prev.lockin_penalty_amount,
          lockin_penalty_type: res.data.lockin_penalty_type || prev.lockin_penalty_type,
          notice_period_days: res.data.notice_period_days || prev.notice_period_days,
          notice_penalty_amount: res.data.notice_penalty_amount || prev.notice_penalty_amount,
          notice_penalty_type: res.data.notice_penalty_type || prev.notice_penalty_type,
        }));
      } else {
        console.log('⏸️ Skipping property defaults - preserving tenant custom values');
        // Keep existing form data (tenant's custom values)
      }
    } else {
      console.log('❌ Failed to fetch property details');
    }
  } catch (err: any) {
    console.error("Failed to fetch property details", err);
  }
};

  // Add this function to handle property selection
  const handlePropertySelect = (propertyId: number | undefined) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      property_id: propertyId 
    }));
    
    // Reset custom terms toggle if property changes
    if (!tenant) {
      setUseCustomTerms(false);
    }
  };

  const loadOptions = async () => {
    try {
      // Load all options in parallel
      const [preferredResult, propertiesResult, roomTypesResult] = await Promise.all([
        getPreferredOptions(),
        getAllProperties(),
        getRoomTypes(),
      ]);

      // Set preferred options
      // if (preferredResult.success && preferredResult.data) {
      //   setOptions(prev => ({
      //     ...prev,
      //     ...preferredResult.data,
      //     genderOptions: preferredResult.data.genderOptions || ['Male', 'Female', 'Other'],
      //     countryCodes: preferredResult.data.countryCodes || ['+91', '+1', '+44', '+61', '+65']
      //   }));
      // }
      if (preferredResult.success && preferredResult.data) {
  const data = preferredResult.data; // now TS knows it's defined
  setOptions(prev => ({
    ...prev,
    ...data,
    genderOptions: data.genderOptions || ['Male', 'Female', 'Other'],
    countryCodes: data.countryCodes || ['+91', '+1', '+44', '+61', '+65']
  }));
}


      // Set properties
      if (propertiesResult.success && propertiesResult.data) {
        const propertiesData = Array.isArray(propertiesResult.data) 
          ? propertiesResult.data.map(p => ({
              value: p.id,
              label: p.name,
              address: p.address || `${p.city}, ${p.state}`,
              lockin_period_months: p.lockin_period_months,
              lockin_penalty_amount: p.lockin_penalty_amount,
              lockin_penalty_type: p.lockin_penalty_type,
              notice_period_days: p.notice_period_days,
              notice_penalty_amount: p.notice_penalty_amount,
              notice_penalty_type: p.notice_penalty_type,
            }))
          : [];
        setProperties(propertiesData);
      }
      console.log('Tenant data from API:', tenant);
      console.log('Tenant terms data:', {
  lockin_period_months: tenant?.lockin_period_months,
  lockin_penalty_amount: tenant?.lockin_penalty_amount,
  lockin_penalty_type: tenant?.lockin_penalty_type,
  notice_period_days: tenant?.notice_period_days,
  notice_penalty_amount: tenant?.notice_penalty_amount,
  notice_penalty_type: tenant?.notice_penalty_type,
  property_id: tenant?.property_id
});

      // Set room types
      if (roomTypesResult.success && roomTypesResult.data) {
        if (roomTypesResult.data.sharingTypes) {
          setSharingTypes(roomTypesResult.data.sharingTypes);
        }
        if (roomTypesResult.data.roomTypes) {
          setRoomTypes(roomTypesResult.data.roomTypes);
        }
      }
    } catch (err) {
      console.error("Failed to load options", err);
      toast.error("Failed to load form options");
    }
  };

  const loadExistingDocuments = async () => {
    if (tenant?.id) {
      try {
        const res = await getTenant(tenant.id);
        if (res?.success && res.data) {
          setExistingFiles({
            id_proof_url: res.data.id_proof_url || "",
            address_proof_url: res.data.address_proof_url || "",
            photo_url: res.data.photo_url || "",
          });
          // Load additional documents from API response
          if (res.data.additional_documents && Array.isArray(res.data.additional_documents)) {
            setAdditionalDocuments(res.data.additional_documents);
          }
        }
      } catch (err) {
        console.error("Failed to load documents", err);
        toast.error("Failed to load existing documents");
      }
    }
  };

  const loadAvailableRooms = async () => {
    if (!formData.gender || !formData.preferred_property_id) return;
    
    try {
      const res = await getAvailableRooms(
        formData.gender, 
        formData.preferred_property_id
      );
      if (res?.success) {
        setAvailableRooms(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load available rooms", err);
      setAvailableRooms([]);
    }
  };

  const validateForm = (): boolean => {
    // Basic validations
    if (!formData.full_name.trim()) {
      toast.error("Full name is required");
      setActiveTab("basic");
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error("Email is required");
      setActiveTab("basic");
      return false;
    }
    
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      setActiveTab("basic");
      return false;
    }
    
    if (!formData.gender) {
      toast.error("Gender is required");
      setActiveTab("basic");
      return false;
    }
    
    if (!formData.address) {
      toast.error("Address is required");
      setActiveTab("address");
      return false;
    }
    
    if (!formData.city) {
      toast.error("City is required");
      setActiveTab("address");
      return false;
    }
    
    if (!formData.state) {
      toast.error("State is required");
      setActiveTab("address");
      return false;
    }
    
    // Additional document validations
    if (!idProofFile && !existingFiles.id_proof_url) {
      toast.error("ID Proof is required");
      setActiveTab("documents");
      return false;
    }
    
    if (!addressProofFile && !existingFiles.address_proof_url) {
      toast.error("Address Proof is required");
      setActiveTab("documents");
      return false;
    }
    
    if (!photoFile && !existingFiles.photo_url) {
      toast.error("Photo is required");
      setActiveTab("documents");
      return false;
    }
    
    // Credential validations - if create_credentials is checked
    // if (createCredentials) {
    //   if (password.length < 6) {
    //     toast.error("Password must be at least 6 characters");
    //     setActiveTab("credentials");
    //     return false;
    //   }
      
    //   if (password !== confirmPassword) {
    //     toast.error("Passwords do not match");
    //     setActiveTab("credentials");
    //     return false;
    //   }
    // }

    // FIX: Only validate password for CREATE or if password is entered for UPDATE
  if (!tenant?.id) {
    // Creating new tenant - validate credentials if createCredentials is checked
    if (createCredentials) {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setActiveTab("credentials");
        return false;
      }
      
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        setActiveTab("credentials");
        return false;
      }
    }
  } else {
    // Updating existing tenant - only validate if password is entered
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setActiveTab("credentials");
        return false;
      }
      
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        setActiveTab("credentials");
        return false;
      }
    }
    // If no password is entered, that's OK - we're not updating credentials
  }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      // Create FormData
      const formDataToSend = new FormData();
      
      // Append tenant data
      // Object.keys(formData).forEach(key => {
      //   const value = formData[key as keyof typeof formData];
      //   if (value !== undefined && value !== null && value !== '') {
      //     formDataToSend.append(key, String(value));
      //   }
      // });
      // Append tenant data
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData];
      if (value !== undefined && value !== null && value !== '') {
        // Format dates for MySQL
        if ((key === 'check_in_date' || key === 'date_of_birth') && value) {
          const dateValue = new Date(String(value));
          if (!isNaN(dateValue.getTime())) {
            formDataToSend.append(key, dateValue.toISOString().split('T')[0]);
          }
        } else {
          formDataToSend.append(key, String(value));
        }
      }
    });
      
      // Append credential info
      // if (createCredentials) {
      //   formDataToSend.append('create_credentials', 'true');
      //   formDataToSend.append('password', password);
      // }
      
      // // For updating existing tenant credentials
      // if (tenant && password && createCredentials) {
      //   formDataToSend.append('update_credentials', 'true');
      // }
      // IMPORTANT FIX: Only append create_credentials if it's true AND we're creating
    // For updates, we should check if password is provided
    if (createCredentials) {
       if (tenant?.id) {
      // For update: only append password if user explicitly entered a new one
      if (password && password.trim() !== '') {
        formDataToSend.append('update_credentials', 'true');
        formDataToSend.append('password', password);
      }
      // Don't require password for updates if not provided
    } else {
      // For create: check if createCredentials is enabled
      if (createCredentials) {
        formDataToSend.append('create_credentials', 'true');
        formDataToSend.append('password', password);
      }
    }
    }
      
      // Append existing additional documents as JSON
      if (additionalDocuments.length > 0) {
        formDataToSend.append('additional_documents', JSON.stringify(additionalDocuments));
      }
      
      // Append main document files
      if (idProofFile) formDataToSend.append('id_proof_url', idProofFile);
      if (addressProofFile) formDataToSend.append('address_proof_url', addressProofFile);
      if (photoFile) formDataToSend.append('photo_url', photoFile);
      
      // Append additional files
      additionalFiles.forEach((file) => {
        formDataToSend.append('additional_documents[]', file);
      });
      
      console.log('FormData prepared:', {
        idProof: !!idProofFile,
        addressProof: !!addressProofFile,
        photo: !!photoFile,
        additionalFiles: additionalFiles.length,
        createCredentials,
        passwordSet: !!password,
        lockinPeriodMonths: formData.lockin_period_months,
        noticePeriodDays: formData.notice_period_days
      });
      
      // Call API
      let result : any;
      if (tenant?.id) {
        console.log('Updating tenant with ID:', tenant.id);
        result = await updateTenant(tenant.id, formDataToSend);
      } else {
        console.log('Creating new tenant');
        result = await createTenant(formDataToSend);
      }
      
      console.log('Form data being sent:', {
  salutation: formData.salutation,
  check_in_date: formData.check_in_date
});
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.success) {
        const successMessage = tenant ? "Tenant updated successfully" : "Tenant created successfully";
        toast.success(successMessage);
        
        // Update local state with returned additional documents
        if (result.additional_documents) {
          setAdditionalDocuments(result.additional_documents);
        }
        
        // Clear file inputs
        setIdProofFile(null);
        setAddressProofFile(null);
        setPhotoFile(null);
        setAdditionalFiles([]);
        
        if (typeof onSuccess === "function") {
          setTimeout(() => {
            onSuccess();
          }, 500);
        }
      } else {
        toast.error(result.message || "Operation failed");
      }
    } catch (err: any) {
      console.error("Failed to save tenant", err);
      toast.error(err.message || "Operation failed. Check console for details.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: string, value: string | undefined) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const DocumentPreview = ({ url, type, onRemove }: { url: string; type: string; onRemove?: () => void }) => {
    if (!url) return null;
    
    const isImage = url.match(/\.(jpeg|jpg|png|gif|webp|bmp)$/i);
    const isPdf = url.match(/\.pdf$/i);
    const isWord = url.match(/\.(doc|docx)$/i);
    
    const getIcon = () => {
      if (isPdf) return "📄 PDF";
      if (isWord) return "📝 Word";
      return "📋 Document";
    };
    
    return (
      <div className="mt-2 border rounded-lg p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">{type}</span>
          </div>
          <div className="flex gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
            >
              <Eye className="h-3 w-3" />
              View
            </a>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
              >
                <X className="h-3 w-3" />
                Remove
              </button>
            )}
          </div>
        </div>
        
        {isImage ? (
          <div className="relative">
            <img 
              src={url} 
              alt={type}
              className="h-40 w-full object-cover rounded border"
              onError={(e:any) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = e.target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="h-40 w-full bg-gray-100 rounded flex flex-col items-center justify-center">
                      <FileText class="h-8 w-8 text-gray-400 mb-2" />
                      <p class="text-sm text-gray-600">Image not available</p>
                      <a href="${url}" target="_blank" class="text-xs text-blue-600 hover:underline mt-1">
                        View file directly
                      </a>
                    </div>
                  `;
                }
              }}
            />
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {type}
            </div>
          </div>
        ) : (
          <div className="h-40 w-full bg-gray-100 rounded flex flex-col items-center justify-center p-4">
            <FileText className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">{getIcon()}</p>
            <p className="text-xs text-gray-500 text-center">{type} Document</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              Click to download/view
            </a>
          </div>
        )}
      </div>
    );
  };

  const FileUploadField = ({ 
    label, 
    file, 
    setFile, 
    existingUrl,
    fieldName,
    accept = ".pdf,.jpg,.jpeg,.png,.webp,.bmp,.doc,.docx",
    description = "Max file size: 10MB",
    required = true
  }: { 
    label: string;
    file: File | null;
    setFile: (file: File | null) => void;
    existingUrl: string;
    fieldName: string;
    accept?: string;
    description?: string;
    required?: boolean;
  }) => (
    <div className="space-y-3">
      <Label htmlFor={fieldName}>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {label} {required && "*"}
        </div>
      </Label>
      
      <div className="space-y-2">
        <Input
          id={fieldName}
          type="file"
          accept={accept}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const selectedFile = e.target.files[0];
              // Check file size (10MB)
              if (selectedFile.size > 10 * 1024 * 1024) {
                toast.error("File size exceeds 10MB limit");
                return;
              }
              setFile(selectedFile);
            }
          }}
          className="cursor-pointer"
        />
        
        {file && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-800">New file selected:</p>
                <p className="text-blue-700 text-sm">{file.name}</p>
                <p className="text-xs text-blue-600">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => setFile(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {!file && existingUrl && (
          <DocumentPreview
            url={existingUrl}
            type={label}
            onRemove={() => {
              setExistingFiles(prev => ({ ...prev, [fieldName]: "" }));
              toast.info(`${label} will be removed. Please upload a new file.`);
            }}
          />
        )}
        
        {!file && !existingUrl && (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Click to upload {label.toLowerCase()}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        )}
      </div>
    </div>
  );

  const occupationCategories = [
    { value: "Service", label: "Service", icon: "💼" },
    { value: "Business", label: "Business", icon: "🏢" },
    { value: "Student", label: "Student", icon: "🎓" },
    { value: "Professional", label: "Professional", icon: "👨‍💻" },
    { value: "Self-Employed", label: "Self-Employed", icon: "👨‍🍳" },
    { value: "Other", label: "Other", icon: "👤" },
  ];

  const emergencyRelations = [
    "Father", "Mother", "Brother", "Sister", "Spouse", 
    "Friend", "Relative", "Guardian", "Other"
  ];

  return (
    // <form onSubmit={handleSubmit} className="space-y-6">
    //   {/* Progress Bar */}
    //   {loading && uploadProgress > 0 && (
    //     <div className="space-y-2">
    //       <div className="flex justify-between text-sm">
    //         <span>Uploading...</span>
    //         <span>{uploadProgress}%</span>
    //       </div>
    //       <Progress value={uploadProgress} className="h-2" />
    //     </div>
    //   )}

    //   {/* Form Tabs */}
    //   <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    //     <TabsList className="grid grid-cols-7 mb-6">
    //       <TabsTrigger value="basic" className="flex items-center gap-2">
    //         <User className="h-4 w-4" />
    //         <span className="hidden sm:inline">Basic Info</span>
    //       </TabsTrigger>
    //       <TabsTrigger value="occupation" className="flex items-center gap-2">
    //         <Briefcase className="h-4 w-4" />
    //         <span className="hidden sm:inline">Occupation</span>
    //       </TabsTrigger>
    //       <TabsTrigger value="address" className="flex items-center gap-2">
    //         <MapPin className="h-4 w-4" />
    //         <span className="hidden sm:inline">Address</span>
    //       </TabsTrigger>
    //       <TabsTrigger value="property" className="flex items-center gap-2">
    //         <Building className="h-4 w-4" />
    //         <span className="hidden sm:inline">Property</span>
    //       </TabsTrigger>
    //       <TabsTrigger value="terms" className="flex items-center gap-2">
    //         <FileText className="h-4 w-4" />
    //         <span className="hidden sm:inline">Terms</span>
    //       </TabsTrigger>
    //       <TabsTrigger value="documents" className="flex items-center gap-2">
    //         <FileText className="h-4 w-4" />
    //         <span className="hidden sm:inline">Documents</span>
    //       </TabsTrigger>
    //       <TabsTrigger value="credentials" className="flex items-center gap-2">
    //         <Key className="h-4 w-4" />
    //         <span className="hidden sm:inline">Login</span>
    //       </TabsTrigger>
    //     </TabsList>

    //     {/* Basic Information Tab */}
    //     <TabsContent value="basic" className="space-y-6">
    //       <Card>
    //         <CardHeader className="bg-blue-50">
    //           <CardTitle className="flex items-center gap-2">
    //             <User className="h-4 w-4" />
    //             Personal Information
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="pt-3">
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //             <div className="space-y-4">
    //               <div className="space-y-2">
    //                 <Label htmlFor="full_name">
    //                   <span className="text-red-500 text-md">*</span> Full Name
    //                 </Label>
    //                 <Input
    //                   id="full_name"
    //                   value={formData.full_name}
    //                   onChange={(e) => handleInputChange("full_name", e.target.value)}
    //                   placeholder="Enter full name "
    //                   required
    //                   className="h-9 text-sm"
    //                 />
    //               </div>

    //               <div className="space-y-1">
    //                 <Label htmlFor="email">
    //                   <span className="text-red-500 text-sm">*</span> Email Address
    //                 </Label>
    //                 <Input
    //                   id="email"
    //                   type="email"
    //                   value={formData.email}
    //                   onChange={(e) => handleInputChange("email", e.target.value)}
    //                   placeholder="example@email.com"
    //                   required
    //                   className="h-9 text-sm"
    //                 />
    //               </div>

    //               <div className="space-y-2">
    //                 <Label htmlFor="phone">
    //                   <span className="text-red-500">*</span> Phone Number
    //                 </Label>
    //                 <div className="flex gap-2">
    //                   <Select
    //                     value={formData.country_code}
    //                     onValueChange={(value) => handleInputChange("country_code", value)}
    //                   >
    //                     <SelectTrigger className="w-[140px]">
    //                       <SelectValue placeholder="+91" />
    //                     </SelectTrigger>
    //                     <SelectContent>
    //                       {options.countryCodes.map((code) => (
    //                         <SelectItem key={code} value={code}>
    //                           {code}
    //                         </SelectItem>
    //                       ))}
    //                     </SelectContent>
    //                   </Select>
    //                   <Input
    //                     id="phone"
    //                     type="tel"
    //                     value={formData.phone}
    //                     onChange={(e) => handleInputChange("phone", e.target.value)}
    //                     placeholder="9876543210"
    //                     pattern="[6-9][0-9]{9}"
    //                     maxLength={10}
    //                     required
    //                   />
    //                 </div>
    //                 <p className="text-xs text-gray-500">
    //                   10-digit Indian mobile number starting with 6-9
    //                 </p>
    //               </div>

    //               <div className="space-y-2">
    //                 <Label htmlFor="date_of_birth">Date of Birth</Label>
    //                 <div className="relative">
    //                   <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
    //                   <Input
    //                     id="date_of_birth"
    //                     type="date"
    //                     value={formData.date_of_birth}
    //                     onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
    //                     className="pl-10"
    //                     max={new Date().toISOString().split('T')[0]}
    //                   />
    //                 </div>
    //                 {formData.date_of_birth && (
    //                   <p className="text-xs text-gray-500">
    //                     Must be at least 18 years old
    //                   </p>
    //                 )}
    //               </div>
    //             </div>

    //             <div className="space-y-4">
    //               <div className="space-y-2">
    //                 <Label htmlFor="gender">
    //                   <span className="text-red-500">*</span> Gender
    //                 </Label>
    //                 <Select
    //                   value={formData.gender}
    //                   onValueChange={(value) => handleSelectChange("gender", value)}
    //                 >
    //                   <SelectTrigger>
    //                     <SelectValue placeholder="Select gender" />
    //                   </SelectTrigger>
    //                   <SelectContent>
    //                     {options.genderOptions.map((option) => (
    //                       <SelectItem key={option} value={option}>
    //                         {option}
    //                       </SelectItem>
    //                     ))}
    //                   </SelectContent>
    //                 </Select>
    //               </div>

    //               <div className="space-y-2">
    //                 <Label>Emergency Contact</Label>
    //                 <div className="grid grid-cols-2 gap-2">
    //                   <Input
    //                     placeholder="Name"
    //                     value={formData.emergency_contact_name}
    //                     onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
    //                   />
    //                   <Input
    //                     placeholder="Phone"
    //                     value={formData.emergency_contact_phone}
    //                     onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
    //                   />
    //                 </div>
    //                 <Select
    //                   value={formData.emergency_contact_relation}
    //                   onValueChange={(value) => handleSelectChange("emergency_contact_relation", value)}
    //                 >
    //                   <SelectTrigger>
    //                     <SelectValue placeholder="Relation" />
    //                   </SelectTrigger>
    //                   <SelectContent>
    //                     {emergencyRelations.map((relation) => (
    //                       <SelectItem key={relation} value={relation}>
    //                         {relation}
    //                       </SelectItem>
    //                     ))}
    //                   </SelectContent>
    //                 </Select>
    //               </div>

    //               <div className="pt-4">
    //                 <div className="flex items-center gap-2">
    //                   <Switch
    //                     id="is_active"
    //                     checked={formData.is_active}
    //                     onCheckedChange={(checked) => handleInputChange("is_active", checked)}
    //                   />
    //                   <Label htmlFor="is_active" className="cursor-pointer">
    //                     Active Tenant
    //                   </Label>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </TabsContent>

    //     {/* Occupation Tab */}
    //     <TabsContent value="occupation" className="space-y-6">
    //       <Card>
    //         <CardHeader className="bg-green-50">
    //           <CardTitle className="flex items-center gap-2">
    //             <Briefcase className="h-5 w-5" />
    //             Occupation & Room Preferences
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="pt-6">
    //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //             <div className="space-y-4">
    //               <div className="space-y-2">
    //                 <Label htmlFor="occupation_category">Occupation Category</Label>
    //                 <Select
    //                   value={formData.occupation_category}
    //                   onValueChange={(value) => handleSelectChange("occupation_category", value)}
    //                 >
    //                   <SelectTrigger>
    //                     <SelectValue placeholder="Select category" />
    //                   </SelectTrigger>
    //                   <SelectContent>
    //                     <SelectItem value="any">Any</SelectItem>
    //                     {occupationCategories.map((option) => (
    //                       <SelectItem key={option.value} value={option.value}>
    //                         <span className="mr-2">{option.icon}</span>
    //                         {option.label}
    //                       </SelectItem>
    //                     ))}
    //                   </SelectContent>
    //                 </Select>
    //               </div>

    //               <div className="space-y-2">
    //                 <Label htmlFor="exact_occupation">
    //                   {formData.occupation_category === "Student" 
    //                     ? "Course & College/University"
    //                     : formData.occupation_category === "Service" 
    //                     ? "Job Title & Company"
    //                     : formData.occupation_category === "Business"
    //                     ? "Business Type & Name"
    //                     : "Occupation Details"}
    //                 </Label>
    //                 <Textarea
    //                   id="exact_occupation"
    //                   value={formData.exact_occupation}
    //                   onChange={(e) => handleInputChange("exact_occupation", e.target.value)}
    //                   placeholder={
    //                     formData.occupation_category === "Student"
    //                       ? "e.g., B.Tech Computer Science at ABC University"
    //                       : formData.occupation_category === "Service"
    //                       ? "e.g., Software Engineer at XYZ Corporation"
    //                       : formData.occupation_category === "Business"
    //                       ? "e.g., Retail Business - Fashion Store"
    //                       : "Enter occupation details"
    //                   }
    //                   rows={3}
    //                 />
    //               </div>

    //               <div className="space-y-2">
    //                 <Label htmlFor="occupation">Additional Details</Label>
    //                 <Input
    //                   id="occupation"
    //                   value={formData.occupation}
    //                   onChange={(e) => handleInputChange("occupation", e.target.value)}
    //                   placeholder="Any additional occupation information"
    //                 />
    //               </div>
    //             </div>

    //             <div className="space-y-4">
    //               <div className="space-y-2">
    //                 <Label htmlFor="preferred_property_id">Preferred Property</Label>
    //                 <Select
    //                   value={formData.preferred_property_id?.toString() || ""}
    //                   onValueChange={(value) => {
    //                     const val = value ? parseInt(value) : undefined;
    //                     setFormData(prev => ({ ...prev, preferred_property_id: val }));
    //                   }}
    //                 >
    //                   <SelectTrigger>
    //                     <SelectValue placeholder="Select property" />
    //                   </SelectTrigger>
    //                   <SelectContent>
    //                     <SelectItem value="none">None</SelectItem>
    //                     {properties.map((property) => (
    //                       <SelectItem key={property.value} value={property.value.toString()}>
    //                         <div className="flex flex-col">
    //                           <span className="font-medium">{property.label}</span>
    //                           <span className="text-xs text-gray-500">
    //                             {property.address}
    //                           </span>
    //                         </div>
    //                       </SelectItem>
    //                     ))}
    //                   </SelectContent>
    //                 </Select>
    //               </div>

    //               {formData.gender && formData.preferred_property_id && availableRooms.length > 0 && (
    //                 <div className="space-y-2">
    //                   <Label>Available Rooms ({availableRooms.length} found)</Label>
    //                   <div className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
    //                     {availableRooms.map((room) => (
    //                       <div
    //                         key={room.id}
    //                         className="p-3 mb-2 border rounded hover:bg-white cursor-pointer transition-colors"
    //                         onClick={() => {
    //                           handleSelectChange("preferred_sharing", room.sharing_type);
    //                           handleSelectChange("preferred_room_type", room.room_type);
    //                         }}
    //                       >
    //                         <div className="flex items-center justify-between">
    //                           <div>
    //                             <div className="flex items-center gap-2">
    //                               <Building className="h-4 w-4 text-blue-600" />
    //                               <span className="font-medium">Room {room.room_number}</span>
    //                               <Badge variant="outline">
    //                                 {room.sharing_type}
    //                               </Badge>
    //                             </div>
    //                             <div className="text-sm text-gray-600 mt-1">
    //                               {room.room_type} • Floor {room.floor || "G"} • 
    //                               {(room.available_beds || (room.total_bed - room.occupied_beds))} bed(s) available
    //                             </div>
    //                           </div>
    //                           <Badge variant="secondary" className="bg-green-50 text-green-700">
    //                             ₹{room.rent_per_bed || room.monthly_rent}/bed
    //                           </Badge>
    //                         </div>
    //                       </div>
    //                     ))}
    //                   </div>
    //                 </div>
    //               )}

    //               <div className="grid grid-cols-2 gap-4">
    //                 <div className="space-y-2">
    //                   <Label htmlFor="preferred_sharing">Preferred Sharing</Label>
    //                   <Select
    //                     value={formData.preferred_sharing}
    //                     onValueChange={(value) => handleSelectChange("preferred_sharing", value)}
    //                   >
    //                     <SelectTrigger>
    //                       <SelectValue placeholder="Select sharing" />
    //                     </SelectTrigger>
    //                     <SelectContent>
    //                       <SelectItem value="any">Any</SelectItem>
    //                       {sharingTypes.map((type) => (
    //                         <SelectItem key={type} value={type}>
    //                           {type.charAt(0).toUpperCase() + type.slice(1)} Sharing
    //                         </SelectItem>
    //                       ))}
    //                     </SelectContent>
    //                   </Select>
    //                 </div>

    //                 <div className="space-y-2">
    //                   <Label htmlFor="preferred_room_type">Room Type</Label>
    //                   <Select
    //                     value={formData.preferred_room_type}
    //                     onValueChange={(value) => handleSelectChange("preferred_room_type", value)}
    //                   >
    //                     <SelectTrigger>
    //                       <SelectValue placeholder="Select type" />
    //                     </SelectTrigger>
    //                     <SelectContent>
    //                       <SelectItem value="any">Any</SelectItem>
    //                       {roomTypes.map((type) => (
    //                         <SelectItem key={type} value={type}>
    //                           {type}
    //                         </SelectItem>
    //                       ))}
    //                     </SelectContent>
    //                   </Select>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </TabsContent>

    //     {/* Address Tab */}
    //     <TabsContent value="address" className="space-y-6">
    //       <Card>
    //         <CardHeader className="bg-purple-50">
    //           <CardTitle className="flex items-center gap-2">
    //             <MapPin className="h-5 w-5" />
    //             Address Information
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="pt-6">
    //           <div className="space-y-4">
    //             <div className="space-y-2">
    //               <Label htmlFor="address">
    //                 <span className="text-red-500">*</span> Complete Address
    //               </Label>
    //               <Textarea
    //                 id="address"
    //                 value={formData.address}
    //                 onChange={(e) => handleInputChange("address", e.target.value)}
    //                 placeholder="House no, Building, Street, Area, Landmark"
    //                 rows={3}
    //                 required
    //               />
    //             </div>

    //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //               <div className="space-y-2">
    //                 <Label htmlFor="city">
    //                   <span className="text-red-500">*</span> City
    //                 </Label>
    //                 <Input
    //                   id="city"
    //                   value={formData.city}
    //                   onChange={(e) => handleInputChange("city", e.target.value)}
    //                   placeholder="Enter city"
    //                   required
    //                 />
    //               </div>

    //               <div className="space-y-2">
    //                 <Label htmlFor="state">
    //                   <span className="text-red-500">*</span> State
    //                 </Label>
    //                 <Input
    //                   id="state"
    //                   value={formData.state}
    //                   onChange={(e) => handleInputChange("state", e.target.value)}
    //                   placeholder="Enter state"
    //                   required
    //                 />
    //               </div>

    //               <div className="space-y-2">
    //                 <Label htmlFor="pincode">Pincode</Label>
    //                 <Input
    //                   id="pincode"
    //                   value={formData.pincode}
    //                   onChange={(e) => handleInputChange("pincode", e.target.value)}
    //                   placeholder="6-digit pincode"
    //                   maxLength={6}
    //                 />
    //               </div>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </TabsContent>

    //     {/* Property Tab */}
    //     <TabsContent value="property" className="space-y-6">
    //       <Card>
    //         <CardHeader className="bg-indigo-50">
    //           <CardTitle className="flex items-center gap-2">
    //             <Building className="h-5 w-5" />
    //             Property Assignment
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="pt-6">
    //           <div className="space-y-4">
    //             <div className="space-y-2">
    //               <Label htmlFor="property_id">Assigned Property</Label>
    //               <Select
    //                 value={formData.property_id?.toString() || ""}
    //                 onValueChange={(value) => handlePropertySelect(value ? parseInt(value) : undefined)}
    //               >
    //                 <SelectTrigger>
    //                   <SelectValue placeholder="Select property to assign" />
    //                 </SelectTrigger>
    //                 <SelectContent>
    //                   {properties.map((property) => (
    //                     <SelectItem key={property.value} value={property.value.toString()}>
    //                       <div className="flex flex-col">
    //                         <span className="font-medium">{property.label}</span>
    //                         <span className="text-xs text-gray-500">
    //                           {property.address}
    //                         </span>
    //                       </div>
    //                     </SelectItem>
    //                   ))}
    //                 </SelectContent>
    //               </Select>
    //               <p className="text-xs text-gray-500">
    //                 This is the actual property where the tenant will be staying
    //               </p>
    //             </div>

    //             {/* Show property details if selected */}
    //             {selectedPropertyDetails && (
    //               <div className="border rounded-lg p-4 bg-blue-50">
    //                 <h4 className="font-medium mb-3 flex items-center gap-2">
    //                   <Building className="h-4 w-4" />
    //                   Selected Property Details
    //                 </h4>
    //                 <div className="grid grid-cols-2 gap-4 text-sm">
    //                   <div>
    //                     <p className="text-gray-600">Property Name:</p>
    //                     <p className="font-medium">{selectedPropertyDetails.name}</p>
    //                   </div>
    //                   <div>
    //                     <p className="text-gray-600">Lock-in Period:</p>
    //                     <p className="font-medium">{selectedPropertyDetails.lockin_period_months} months</p>
    //                   </div>
    //                   <div>
    //                     <p className="text-gray-600">Lock-in Penalty:</p>
    //                     <p className="font-medium">
    //                       ₹{selectedPropertyDetails.lockin_penalty_amount} ({selectedPropertyDetails.lockin_penalty_type})
    //                     </p>
    //                   </div>
    //                   <div>
    //                     <p className="text-gray-600">Notice Period:</p>
    //                     <p className="font-medium">{selectedPropertyDetails.notice_period_days} days</p>
    //                   </div>
    //                 </div>
    //               </div>
    //             )}
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </TabsContent>
        
    //     {/* Terms Tab */}
    //     <TabsContent value="terms" className="space-y-6">
    //       <Card>
    //         <CardHeader className="bg-purple-50">
    //           <CardTitle className="flex items-center gap-2">
    //             <FileText className="h-5 w-5" />
    //             Rental Terms & Conditions
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="pt-6">
    //           <Alert className="mb-6 bg-blue-50 border-blue-200">
    //             <AlertCircle className="h-4 w-4 text-blue-600" />
    //             <AlertDescription className="text-blue-800">
    //               These terms will override the property's default terms for this specific tenant.
    //             </AlertDescription>
    //           </Alert>

    //           <div className="space-y-6">
    //             {/* Custom Terms Toggle */}
    //             <div className="flex items-center justify-between p-4 border rounded-lg">
    //               <div>
    //                 <Label className="font-medium">Use Custom Terms</Label>
    //                 <p className="text-sm text-gray-500">
    //                   Toggle to override property's default terms for this tenant
    //                 </p>
    //               </div>
    //               <Switch
    //                 checked={useCustomTerms}
    //                 onCheckedChange={(checked) => {
    //                   setUseCustomTerms(checked);
    //                   if (!checked && selectedPropertyDetails) {
    //                     // Reset to property defaults
    //                     setFormData(prev => ({
    //                       ...prev,
    //                       lockin_period_months: selectedPropertyDetails.lockin_period_months || 0,
    //                       lockin_penalty_amount: selectedPropertyDetails.lockin_penalty_amount || 0,
    //                       lockin_penalty_type: selectedPropertyDetails.lockin_penalty_type || "fixed",
    //                       notice_period_days: selectedPropertyDetails.notice_period_days || 0,
    //                       notice_penalty_amount: selectedPropertyDetails.notice_penalty_amount || 0,
    //                       notice_penalty_type: selectedPropertyDetails.notice_penalty_type || "fixed",
    //                     }));
    //                   }
    //                 }}
    //               />
    //             </div>

    //             {useCustomTerms || !selectedPropertyDetails ? (
    //               <div className="grid grid-cols-2 gap-6">
    //                 {/* Lock-in Period Section */}
    //                 <div className="space-y-4 border-2 border-blue-100 bg-blue-50/50 rounded-lg p-4">
    //                   <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
    //                     <Calendar className="h-5 w-5 text-blue-600" />
    //                     Custom Lock-in Period
    //                   </h3>
    //                   <div className="space-y-4">
    //                     <div>
    //                       <Label>Duration (months)</Label>
    //                       <Input
    //                         type="number"
    //                         min="0"
    //                         value={formData.lockin_period_months || ''}
    //                         onChange={(e) => handleInputChange("lockin_period_months", parseInt(e.target.value) || 0)}
    //                         placeholder="12"
    //                         className="mt-1"
    //                       />
    //                     </div>

    //                     <div className="space-y-2">
    //                       <Label>Penalty Amount</Label>
    //                       <div className="grid grid-cols-2 gap-2">
    //                         <Input
    //                           type="number"
    //                           min="0"
    //                           value={formData.lockin_penalty_amount || ''}
    //                           onChange={(e) => handleInputChange("lockin_penalty_amount", parseFloat(e.target.value) || 0)}
    //                           placeholder="Amount"
    //                           className="mt-1"
    //                         />
    //                         <Select
    //                           value={formData.lockin_penalty_type}
    //                           onValueChange={(value) => handleSelectChange("lockin_penalty_type", value)}
    //                         >
    //                           <SelectTrigger>
    //                             <SelectValue placeholder="Type" />
    //                           </SelectTrigger>
    //                           <SelectContent>
    //                             <SelectItem value="fixed">Fixed Amount</SelectItem>
    //                             <SelectItem value="percentage">Percentage</SelectItem>
    //                             <SelectItem value="rent">Month's Rent</SelectItem>
    //                           </SelectContent>
    //                         </Select>
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </div>

    //                 {/* Notice Period Section */}
    //                 <div className="space-y-4 border-2 border-amber-100 bg-amber-50/50 rounded-lg p-4">
    //                   <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
    //                     <Clock3 className="h-5 w-5 text-amber-600" />
    //                     Custom Notice Period
    //                   </h3>
    //                   <div className="space-y-4">
    //                     <div>
    //                       <Label>Duration (days)</Label>
    //                       <Input
    //                         type="number"
    //                         min="0"
    //                         value={formData.notice_period_days || ''}
    //                         onChange={(e) => handleInputChange("notice_period_days", parseInt(e.target.value) || 0)}
    //                         placeholder="30"
    //                         className="mt-1"
    //                       />
    //                     </div>

    //                     <div className="space-y-2">
    //                       <Label>Penalty Amount</Label>
    //                       <div className="grid grid-cols-2 gap-2">
    //                         <Input
    //                           type="number"
    //                           min="0"
    //                           value={formData.notice_penalty_amount || ''}
    //                           onChange={(e) => handleInputChange("notice_penalty_amount", parseFloat(e.target.value) || 0)}
    //                           placeholder="Amount"
    //                           className="mt-1"
    //                         />
    //                         <Select
    //                           value={formData.notice_penalty_type}
    //                           onValueChange={(value) => handleSelectChange("notice_penalty_type", value)}
    //                         >
    //                           <SelectTrigger>
    //                             <SelectValue placeholder="Type" />
    //                           </SelectTrigger>
    //                           <SelectContent>
    //                             <SelectItem value="fixed">Fixed Amount</SelectItem>
    //                             <SelectItem value="percentage">Percentage</SelectItem>
    //                             <SelectItem value="rent">Month's Rent</SelectItem>
    //                           </SelectContent>
    //                         </Select>
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             ) : (
    //               <div className="p-6 border-2 border-green-200 bg-green-50 rounded-lg">
    //                 <div className="flex items-center gap-3 mb-4">
    //                   <Check className="h-6 w-6 text-green-600" />
    //                   <h3 className="text-lg font-semibold text-green-800">
    //                     Using Property's Default Terms
    //                   </h3>
    //                 </div>
                    
    //                 <div className="grid grid-cols-2 gap-6">
    //                   <div>
    //                     <h4 className="font-medium mb-2">Lock-in Period</h4>
    //                     <div className="space-y-2 text-sm">
    //                       <p><span className="text-gray-600">Duration:</span> {formData.lockin_period_months} months</p>
    //                       <p><span className="text-gray-600">Penalty:</span> ₹{formData.lockin_penalty_amount} ({formData.lockin_penalty_type})</p>
    //                     </div>
    //                   </div>
                      
    //                   <div>
    //                     <h4 className="font-medium mb-2">Notice Period</h4>
    //                     <div className="space-y-2 text-sm">
    //                       <p><span className="text-gray-600">Duration:</span> {formData.notice_period_days} days</p>
    //                       <p><span className="text-gray-600">Penalty:</span> ₹{formData.notice_penalty_amount} ({formData.notice_penalty_type})</p>
    //                     </div>
    //                   </div>
    //                 </div>
                    
    //                 <p className="text-sm text-gray-600 mt-4">
    //                   These terms are inherited from the selected property. Toggle "Use Custom Terms" to override.
    //                 </p>
    //               </div>
    //             )}

    //             {/* Summary of Terms */}
    //             <div className="border rounded-lg p-4 bg-gray-50">
    //               <h4 className="font-medium mb-3">Terms Summary</h4>
    //               <div className="grid grid-cols-2 gap-4">
    //                 <div>
    //                   <p className="text-sm text-gray-600">Lock-in Period:</p>
    //                   <p className="font-medium">
    //                     {formData.lockin_period_months} months
    //                   </p>
    //                 </div>
    //                 <div>
    //                   <p className="text-sm text-gray-600">Lock-in Penalty:</p>
    //                   <p className="font-medium">
    //                     ₹{formData.lockin_penalty_amount} ({formData.lockin_penalty_type})
    //                   </p>
    //                 </div>
    //                 <div>
    //                   <p className="text-sm text-gray-600">Notice Period:</p>
    //                   <p className="font-medium">
    //                     {formData.notice_period_days} days
    //                   </p>
    //                 </div>
    //                 <div>
    //                   <p className="text-sm text-gray-600">Notice Penalty:</p>
    //                   <p className="font-medium">
    //                     ₹{formData.notice_penalty_amount} ({formData.notice_penalty_type})
    //                   </p>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </TabsContent>

    //     {/* Documents Tab */}
    //     <TabsContent value="documents" className="space-y-6">
    //       <Card>
    //         <CardHeader className="bg-amber-50">
    //           <CardTitle className="flex items-center gap-2">
    //             <FileText className="h-5 w-5" />
    //             Required Documents
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="pt-6">
    //           <Alert className="mb-6 bg-blue-50 border-blue-200">
    //             <AlertCircle className="h-4 w-4 text-blue-600" />
    //             <AlertDescription className="text-blue-800">
    //               All marked (*) documents are required. Max file size: 10MB per file.
    //               Supported formats: PDF, JPG, PNG, WebP, BMP, DOC, DOCX.
    //             </AlertDescription>
    //           </Alert>

    //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    //             <FileUploadField
    //               label="ID Proof"
    //               file={idProofFile}
    //               setFile={setIdProofFile}
    //               existingUrl={existingFiles.id_proof_url}
    //               fieldName="id_proof_url"
    //               description="Aadhar Card, Passport, PAN Card, Driving License"
    //             />
                
    //             <FileUploadField
    //               label="Address Proof"
    //               file={addressProofFile}
    //               setFile={setAddressProofFile}
    //               existingUrl={existingFiles.address_proof_url}
    //               fieldName="address_proof_url"
    //               description="Utility Bill, Bank Statement, Rental Agreement"
    //             />
                
    //             <FileUploadField
    //               label="Photograph"
    //               file={photoFile}
    //               setFile={setPhotoFile}
    //               existingUrl={existingFiles.photo_url}
    //               fieldName="photo_url"
    //               accept=".jpg,.jpeg,.png,.webp,.bmp"
    //               description="Recent passport-size photo"
    //             />
    //           </div>

    //           {/* Additional Documents */}
    //           <Separator className="my-6" />
              
    //           <div className="space-y-4">
    //             <div className="flex items-center justify-between">
    //               <Label className="text-lg font-medium">Additional Documents (Optional)</Label>
    //               <Button
    //                 type="button"
    //                 variant="outline"
    //                 size="sm"
    //                 onClick={() => {
    //                   const input = document.createElement('input');
    //                   input.type = 'file';
    //                   input.accept = ".pdf,.jpg,.jpeg,.png,.webp,.bmp,.doc,.docx";
    //                   input.multiple = true;
    //                   input.onchange = (e: any) => {
    //                     const files = Array.from(e.target.files);
    //                     if (files.length + additionalFiles.length > 5) {
    //                       toast.error("Maximum 5 additional documents allowed");
    //                       return;
    //                     }
    //                     setAdditionalFiles(prev => [...prev, ...files as File[]]);
    //                   };
    //                   input.click();
    //                 }}
    //               >
    //                 <Upload className="h-4 w-4 mr-2" />
    //                 Add More Files
    //               </Button>
    //             </div>
                
    //             {/* Existing Additional Documents */}
    //             {additionalDocuments.length > 0 && (
    //               <div className="space-y-3">
    //                 <h4 className="font-medium text-sm">Existing Documents:</h4>
    //                 {additionalDocuments.map((doc, index) => (
    //                   <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
    //                     <div className="flex items-center gap-3">
    //                       <FileText className="h-5 w-5 text-gray-500" />
    //                       <div>
    //                         <p className="font-medium">{doc.filename}</p>
    //                         <p className="text-xs text-gray-500">
    //                           {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Previously uploaded'}
    //                         </p>
    //                         <a
    //                           href={doc.url}
    //                           target="_blank"
    //                           rel="noopener noreferrer"
    //                           className="text-xs text-blue-600 hover:underline"
    //                         >
    //                           View Document
    //                         </a>
    //                       </div>
    //                     </div>
    //                     <Button
    //                       type="button"
    //                       variant="ghost"
    //                       size="sm"
    //                       className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
    //                       onClick={() => {
    //                         setAdditionalDocuments(prev => prev.filter((_, i) => i !== index));
    //                         toast.info("Document will be removed on save");
    //                       }}
    //                     >
    //                       <X className="h-4 w-4" />
    //                     </Button>
    //                   </div>
    //                 ))}
    //               </div>
    //             )}
                
    //             {/* New Additional Files */}
    //             {additionalFiles.length > 0 && (
    //               <div className="space-y-3">
    //                 <h4 className="font-medium text-sm">New Files to Upload:</h4>
    //                 {additionalFiles.map((file, index) => (
    //                   <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
    //                     <div className="flex items-center gap-3">
    //                       <FileText className="h-5 w-5 text-gray-500" />
    //                       <div>
    //                         <p className="font-medium">{file.name}</p>
    //                         <p className="text-xs text-gray-500">
    //                           {(file.size / 1024 / 1024).toFixed(2)} MB
    //                         </p>
    //                       </div>
    //                     </div>
    //                     <Button
    //                       type="button"
    //                       variant="ghost"
    //                       size="sm"
    //                       className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
    //                       onClick={() => {
    //                         setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
    //                       }}
    //                     >
    //                       <X className="h-4 w-4" />
    //                     </Button>
    //                   </div>
    //                 ))}
    //               </div>
    //             )}
                
    //             <p className="text-sm text-gray-500">
    //               You can upload additional documents like company ID, college ID, reference letters, etc.
    //               Maximum 5 additional documents.
    //             </p>
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </TabsContent>

    //     {/* Credentials Tab */}
    //     <TabsContent value="credentials" className="space-y-6">
    //       <Card>
    //         <CardHeader className="bg-emerald-50">
    //           <CardTitle className="flex items-center gap-2">
    //             <Key className="h-5 w-5" />
    //             Login Credentials
    //           </CardTitle>
    //         </CardHeader>
    //         <CardContent className="pt-6">
    //           <div className="space-y-6">
    //             {/* Current Credential Status */}
    //             {tenant?.has_credentials ? (
    //               <Alert className="bg-blue-50 border-blue-200">
    //                 <div className="flex items-start gap-3">
    //                   <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
    //                   <div>
    //                     <h4 className="font-medium text-blue-800">Login Already Configured</h4>
    //                     <p className="text-sm text-blue-700 mt-1">
    //                       Tenant already has portal access. To reset password, set a new password below.
    //                     </p>
    //                     <div className="mt-3 space-y-1">
    //                       <p className="text-sm">
    //                         <span className="font-medium">Email:</span> {tenant.credential_email || tenant.email}
    //                       </p>
    //                       <p className="text-sm">
    //                         <span className="font-medium">Status:</span>{" "}
    //                         <Badge variant="outline" className="bg-green-100 text-green-800">
    //                           Active
    //                         </Badge>
    //                       </p>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </Alert>
    //             ) : (
    //               <Alert className="bg-blue-50 border-blue-200">
    //                 <div className="flex items-start gap-3">
    //                   <Key className="h-5 w-5 text-blue-600 mt-0.5" />
    //                   <div>
    //                     <h4 className="font-medium text-blue-800">Create Portal Access</h4>
    //                     <p className="text-sm text-blue-700 mt-1">
    //                       Set a password to enable tenant portal access.
    //                     </p>
    //                   </div>
    //                 </div>
    //               </Alert>
    //             )}

    //             {/* Enable Credentials Toggle */}
    //             <div className="flex items-center justify-between p-4 border rounded-lg">
    //               <div>
    //                 <Label className="font-medium">Enable Portal Access</Label>
    //                 <p className="text-sm text-gray-500">
    //                   Allow tenant to access their portal with login credentials
    //                 </p>
    //               </div>
    //               <Switch
    //                 checked={createCredentials}
    //                 onCheckedChange={(checked) => setCreateCredentials(checked)}
    //               />
    //             </div>

    //             {createCredentials && (
    //               <>
    //                 <div className="space-y-4">
    //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //                     <div className="space-y-3">
    //                       <Label htmlFor="password">
    //                         <span className="text-red-500">*</span> Password
    //                       </Label>
    //                       <div className="relative">
    //                         <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
    //                         <Input
    //                           id="password"
    //                           type="password"
    //                           placeholder="Enter password"
    //                           value={password}
    //                           onChange={(e) => setPassword(e.target.value)}
    //                           className="pl-10"
    //                           minLength={6}
    //                           required={createCredentials}
    //                         />
    //                       </div>
                          
    //                       {/* Password Strength Meter */}
    //                       {password.length > 0 && (
    //                         <div className="space-y-2">
    //                           <div className="flex justify-between text-xs">
    //                             <span>Password Strength:</span>
    //                             <span className={
    //                               passwordStrength >= 75 ? "text-green-600" :
    //                               passwordStrength >= 50 ? "text-yellow-600" :
    //                               passwordStrength >= 25 ? "text-orange-600" : "text-red-600"
    //                             }>
    //                               {passwordStrength >= 75 ? "Strong" :
    //                                passwordStrength >= 50 ? "Good" :
    //                                passwordStrength >= 25 ? "Weak" : "Very Weak"}
    //                             </span>
    //                           </div>
    //                           <Progress 
    //                             value={passwordStrength} 
    //                             className="h-2"
    //                             indicatorClassName={
    //                               passwordStrength >= 75 ? "bg-green-500" :
    //                               passwordStrength >= 50 ? "bg-yellow-500" :
    //                               passwordStrength >= 25 ? "bg-orange-500" : "bg-red-500"
    //                             }
    //                           />
    //                         </div>
    //                       )}
    //                     </div>

    //                     <div className="space-y-3">
    //                       <Label htmlFor="confirmPassword">
    //                         <span className="text-red-500">*</span> Confirm Password
    //                       </Label>
    //                       <div className="relative">
    //                         <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
    //                         <Input
    //                           id="confirmPassword"
    //                           type="password"
    //                           placeholder="Confirm password"
    //                           value={confirmPassword}
    //                           onChange={(e) => setConfirmPassword(e.target.value)}
    //                           className="pl-10"
    //                           minLength={6}
    //                           required={createCredentials}
    //                         />
    //                       </div>
                          
    //                       {password && confirmPassword && (
    //                         <div className={`flex items-center gap-2 text-sm ${
    //                           password === confirmPassword ? "text-green-600" : "text-red-600"
    //                         }`}>
    //                           {password === confirmPassword ? (
    //                             <>
    //                               <Check className="h-4 w-4" />
    //                               <span>Passwords match</span>
    //                             </>
    //                           ) : (
    //                             <>
    //                               <AlertTriangle className="h-4 w-4" />
    //                               <span>Passwords don't match</span>
    //                             </>
    //                           )}
    //                         </div>
    //                       )}
    //                     </div>
    //                   </div>

    //                   {/* Password Requirements */}
    //                   <div className="p-4 border rounded-lg bg-gray-50">
    //                     <Label className="font-medium mb-2 block">Password Requirements:</Label>
    //                     <ul className="space-y-1 text-sm text-gray-600">
    //                       <li className={`flex items-center gap-2 ${password.length >= 6 ? "text-green-600" : ""}`}>
    //                         <div className={`h-2 w-2 rounded-full ${password.length >= 6 ? "bg-green-500" : "bg-gray-300"}`} />
    //                         Minimum 6 characters
    //                       </li>
    //                       <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? "text-green-600" : ""}`}>
    //                         <div className={`h-2 w-2 rounded-full ${/[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
    //                         At least one uppercase letter
    //                       </li>
    //                       <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? "text-green-600" : ""}`}>
    //                         <div className={`h-2 w-2 rounded-full ${/[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
    //                         At least one number
    //                       </li>
    //                       <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}`}>
    //                         <div className={`h-2 w-2 rounded-full ${/[^A-Za-z0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
    //                         At least one special character
    //                       </li>
    //                     </ul>
    //                   </div>
    //                 </div>
    //               </>
    //             )}
    //           </div>
    //         </CardContent>
    //       </Card>
    //     </TabsContent>
    //   </Tabs>

    //   {/* Form Actions */}
    //   <div className="flex items-center justify-between pt-6 border-t">
    //     <div className="flex items-center gap-4">
    //       <Button
    //         type="button"
    //         variant="outline"
    //         onClick={onCancel}
    //         disabled={loading}
    //       >
    //         Cancel
    //       </Button>
          
    //       <Button
    //         type="button"
    //         variant="outline"
    //         onClick={() => {
    //           const tabs = ["basic", "occupation", "address", "property", "terms", "documents", "credentials"];
    //           const currentIndex = tabs.indexOf(activeTab);
    //           if (currentIndex > 0) {
    //             setActiveTab(tabs[currentIndex - 1]);
    //           }
    //         }}
    //         disabled={activeTab === "basic" || loading}
    //       >
    //         Previous
    //       </Button>
          
    //       <Button
    //         type="button"
    //         variant="outline"
    //         onClick={() => {
    //           const tabs = ["basic", "occupation", "address", "property", "terms", "documents", "credentials"];
    //           const currentIndex = tabs.indexOf(activeTab);
    //           if (currentIndex < tabs.length - 1) {
    //             setActiveTab(tabs[currentIndex + 1]);
    //           }
    //         }}
    //         disabled={activeTab === "credentials" || loading}
    //       >
    //         Next
    //       </Button>
    //     </div>
        
    //     <Button 
    //       type="submit" 
    //       disabled={loading}
    //       className="min-w-[140px]"
    //     >
    //       {loading ? (
    //         <>
    //           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    //           {uploadProgress > 0 ? "Uploading..." : "Saving..."}
    //         </>
    //       ) : tenant ? "Update Tenant" : "Create Tenant"}
    //     </Button>
    //   </div>

    //   {/* Form Status Summary */}
    //   <div className="mt-6 p-4 border rounded-lg bg-gray-50">
    //     <h4 className="font-medium mb-2">Form Status</h4>
    //     <div className="grid grid-cols-4 md:grid-cols-7 gap-2 text-sm">
    //       {[
    //         { tab: "basic", label: "Basic Info", complete: !!formData.full_name && !!formData.email && !!formData.phone },
    //         { tab: "occupation", label: "Occupation", complete: !!formData.occupation_category },
    //         { tab: "address", label: "Address", complete: !!formData.address && !!formData.city && !!formData.state },
    //         { tab: "property", label: "Property", complete: !!formData.property_id },
    //         { tab: "terms", label: "Terms", complete: !!formData.property_id || useCustomTerms },
    //         { tab: "documents", label: "Documents", complete: 
    //           (!!idProofFile || !!existingFiles.id_proof_url) && 
    //           (!!addressProofFile || !!existingFiles.address_proof_url) && 
    //           (!!photoFile || !!existingFiles.photo_url) 
    //         },
    //         { tab: "credentials", label: "Login", complete: 
    //           !createCredentials || (password.length >= 6 && password === confirmPassword)
    //         },
    //       ].map((section) => (
    //         <div 
    //           key={section.tab}
    //           className={`flex items-center gap-2 p-2 rounded ${section.complete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
    //           onClick={() => setActiveTab(section.tab)}
    //         >
    //           <div className={`h-2 w-2 rounded-full ${section.complete ? 'bg-green-500' : 'bg-gray-400'}`} />
    //           <span>{section.label}</span>
    //           {section.complete && <Check className="h-3 w-3 ml-auto" />}
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </form>
    <form onSubmit={handleSubmit} className="space-y-4 ">
  {/* Progress Bar - made smaller */}
  {loading && uploadProgress > 0 && (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>Uploading...</span>
        <span>{uploadProgress}%</span>
      </div>
      <Progress value={uploadProgress} className="h-1.5" />
    </div>
  )}

  {/* Form Tabs - made more compact */}
  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    {/* Form Tabs - responsive with labels on mobile */}
<TabsList className="grid grid-cols-7 mb-2 h-8 sm:h-8 mt-2">
  <TabsTrigger value="basic" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
    <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    <span className="inline text-[8px] sm:text-xs">Basic</span>
  </TabsTrigger>
  <TabsTrigger value="occupation" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
    <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    <span className="inline text-[8px] sm:text-xs">Work</span>
  </TabsTrigger>
  <TabsTrigger value="address" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
    <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    <span className="inline text-[8px] sm:text-xs">Address</span>
  </TabsTrigger>
  <TabsTrigger value="property" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
    <Building className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    <span className="inline text-[8px] sm:text-xs">Property</span>
  </TabsTrigger>
  <TabsTrigger value="terms" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
    <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    <span className="inline text-[8px] sm:text-xs">Terms</span>
  </TabsTrigger>
  <TabsTrigger value="documents" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
    <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    <span className="inline text-[8px] sm:text-xs">Docs</span>
  </TabsTrigger>
  <TabsTrigger value="credentials" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
    <Key className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    <span className="inline text-[8px] sm:text-xs">Login</span>
  </TabsTrigger>
</TabsList>

    {/* Basic Information Tab - with salutation and check-in date */}
    <TabsContent value="basic" className="space-y-4">
      <Card>
        <CardHeader className="bg-blue-50 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {/* Salutation and Name row */}
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="salutation" className="text-sm">Salutation</Label>
                  <Select
                    value={formData.salutation}
                    onValueChange={(value) => handleSelectChange("salutation", value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof"].map((title) => (
                        <SelectItem key={title} value={title} className="text-sm">
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 col-span-3">
                  <Label htmlFor="full_name" className="text-sm">
                    <span className="text-red-500">*</span> Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    placeholder="Enter full name"
                    required
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">
                  <span className="text-red-500">*</span> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-sm">
                  <span className="text-red-500">*</span> Phone Number
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.country_code}
                    onValueChange={(value) => handleInputChange("country_code", value)}
                  >
                    <SelectTrigger className="w-[120px] h-9 text-sm">
                      <SelectValue placeholder="+91" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.countryCodes.map((code) => (
                        <SelectItem key={code} value={code} className="text-sm">
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="9876543210"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  10-digit Indian mobile number starting with 6-9
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="date_of_birth" className="text-sm">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                      className="pl-10 h-9 text-sm"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {formData.date_of_birth && (
                    <p className="text-xs text-gray-500">
                      Must be at least 18 years old
                    </p>
                  )}
                </div>

                
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="gender" className="text-sm">
                  <span className="text-red-500">*</span> Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.genderOptions.map((option) => (
                      <SelectItem key={option} value={option} className="text-sm">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Emergency Contact</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    placeholder="Phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                    className="h-9 text-sm"
                    pattern="[6-9][0-9]{9}"
                     maxLength={10}
                  />
                </div>
                <Select
                  value={formData.emergency_contact_relation}
                  onValueChange={(value) => handleSelectChange("emergency_contact_relation", value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Relation" />
                  </SelectTrigger>
                  <SelectContent>
                    {emergencyRelations.map((relation) => (
                      <SelectItem key={relation} value={relation} className="text-sm">
                        {relation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer text-sm">
                    Active Tenant
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Occupation Tab - made compact */}
    <TabsContent value="occupation" className="space-y-4">
      <Card>
        <CardHeader className="bg-green-50 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4" />
            Occupation & Room Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="occupation_category" className="text-sm">Occupation Category</Label>
                <Select
                  value={formData.occupation_category}
                  onValueChange={(value) => handleSelectChange("occupation_category", value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any" className="text-sm">Any</SelectItem>
                    {occupationCategories.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-sm">
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="exact_occupation" className="text-sm">
                  {formData.occupation_category === "Student" 
                    ? "Course & College/University"
                    : formData.occupation_category === "Service" 
                    ? "Job Title & Company"
                    : formData.occupation_category === "Business"
                    ? "Business Type & Name"
                    : "Occupation Details"}
                </Label>
                <Textarea
                  id="exact_occupation"
                  value={formData.exact_occupation}
                  onChange={(e) => handleInputChange("exact_occupation", e.target.value)}
                  placeholder={
                    formData.occupation_category === "Student"
                      ? "e.g., B.Tech Computer Science at ABC University"
                      : formData.occupation_category === "Service"
                      ? "e.g., Software Engineer at XYZ Corporation"
                      : formData.occupation_category === "Business"
                      ? "e.g., Retail Business - Fashion Store"
                      : "Enter occupation details"
                  }
                  rows={2}
                  className="text-sm min-h-16"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="occupation" className="text-sm">Additional Details</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange("occupation", e.target.value)}
                  placeholder="Any additional occupation information"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="preferred_property_id" className="text-sm">Preferred Property</Label>
                <Select
                  value={formData.preferred_property_id?.toString() || ""}
                  onValueChange={(value) => {
                    const val = value ? parseInt(value) : undefined;
                    setFormData((prev: any) => ({ ...prev, preferred_property_id: val }));
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-sm">None</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.value} value={property.value.toString()} className="text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{property.label}</span>
                          <span className="text-xs text-gray-500">
                            {property.address}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.gender && formData.preferred_property_id && availableRooms.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-sm">Available Rooms ({availableRooms.length} found)</Label>
                  <div className="max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
                    {availableRooms.map((room) => (
                      <div
                        key={room.id}
                        className="p-2 mb-2 border rounded hover:bg-white cursor-pointer transition-colors text-sm"
                        onClick={() => {
                          handleSelectChange("preferred_sharing", room.sharing_type);
                          handleSelectChange("preferred_room_type", room.room_type);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1">
                              <Building className="h-3.5 w-3.5 text-blue-600" />
                              <span className="font-medium">Room {room.room_number}</span>
                              <Badge variant="outline" className="text-xs">
                                {room.sharing_type}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {room.room_type} • Floor {room.floor || "G"} • 
                              {(room.available_beds || (room.total_bed - room.occupied_beds))} bed(s) available
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                            ₹{room.rent_per_bed || room.monthly_rent}/bed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="preferred_sharing" className="text-sm">Preferred Sharing</Label>
                  <Select
                    value={formData.preferred_sharing}
                    onValueChange={(value) => handleSelectChange("preferred_sharing", value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select sharing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any" className="text-sm">Any</SelectItem>
                      {sharingTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-sm">
                          {type.charAt(0).toUpperCase() + type.slice(1)} Sharing
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="preferred_room_type" className="text-sm">Room Type</Label>
                  <Select
                    value={formData.preferred_room_type}
                    onValueChange={(value) => handleSelectChange("preferred_room_type", value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any" className="text-sm">Any</SelectItem>
                      {roomTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-sm">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="check_in_date" className="text-sm">Check-in Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="check_in_date"
                      type="date"
                      value={formData.check_in_date}
                      onChange={(e) => handleInputChange("check_in_date", e.target.value)}
                      className="pl-10 h-9 text-sm"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {formData.check_in_date && (
                    <p className="text-xs text-gray-500">
                      Tenant move-in date
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Address Tab - made compact */}
    <TabsContent value="address" className="space-y-4">
      <Card>
        <CardHeader className="bg-purple-50 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="address" className="text-sm">
                <span className="text-red-500">*</span> Complete Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="House no, Building, Street, Area, Landmark"
                rows={2}
                className="text-sm min-h-16"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="city" className="text-sm">
                  <span className="text-red-500">*</span> City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="state" className="text-sm">
                  <span className="text-red-500">*</span> State
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter state"
                  className="h-9 text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="pincode" className="text-sm">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Property Tab - made compact */}
    <TabsContent value="property" className="space-y-4">
      <Card>
        <CardHeader className="bg-indigo-50 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building className="h-4 w-4" />
            Property Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="property_id" className="text-sm">Assigned Property</Label>
              <Select
                value={formData.property_id?.toString() || ""}
                onValueChange={(value) => handlePropertySelect(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select property to assign" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.value} value={property.value.toString()} className="text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">{property.label}</span>
                        <span className="text-xs text-gray-500">
                          {property.address}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                This is the actual property where the tenant will be staying
              </p>
            </div>

            {/* Show property details if selected */}
{selectedPropertyDetails && (
  <div className="border rounded p-3 bg-blue-50">
    <h4 className="font-medium mb-2 flex items-center gap-1 text-sm">
      <Building className="h-3.5 w-3.5" />
      Selected Property Details
    </h4>
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div>
        <p className="text-gray-600">Property Name:</p>
        <p className="font-medium">{selectedPropertyDetails.name}</p>
      </div>
      <div>
        <p className="text-gray-600">Lock-in Period:</p>
        <p className="font-medium">{selectedPropertyDetails.lockin_period_months} months</p>
      </div>
      <div>
        <p className="text-gray-600">Lock-in Penalty:</p>
        <p className="font-medium flex items-center gap-1">
          {selectedPropertyDetails.lockin_penalty_type === 'percentage' ? (
            <>
              <span>%</span>
              <span>{selectedPropertyDetails.lockin_penalty_amount}</span>
            </>
          ) : (
            <>
              <span>₹</span>
              <span>{selectedPropertyDetails.lockin_penalty_amount}</span>
            </>
          )}
          <span className="text-gray-500 text-[10px]">({selectedPropertyDetails.lockin_penalty_type})</span>
        </p>
      </div>
      <div>
        <p className="text-gray-600">Notice Period:</p>
        <p className="font-medium">{selectedPropertyDetails.notice_period_days} days</p>
      </div>
      <div>
        <p className="text-gray-600">Notice Penalty:</p>
        <p className="font-medium flex items-center gap-1">
          {selectedPropertyDetails.notice_penalty_type === 'percentage' ? (
            <>
              <span>%</span>
              <span>{selectedPropertyDetails.notice_penalty_amount}</span>
            </>
          ) : (
            <>
              <span>₹</span>
              <span>{selectedPropertyDetails.notice_penalty_amount}</span>
            </>
          )}
          <span className="text-gray-500 text-[10px]">({selectedPropertyDetails.notice_penalty_type})</span>
        </p>
      </div>
    </div>
  </div>
)}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
    
    {/* Terms Tab - made compact */}
    <TabsContent value="terms" className="space-y-4">
      <Card>
        <CardHeader className="bg-purple-50 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Rental Terms & Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Alert className="mb-4 bg-blue-50 border-blue-200 py-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              These terms will override the property's default terms for this specific tenant.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {/* Custom Terms Toggle */}
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <Label className="font-medium text-sm">Use Custom Terms</Label>
                <p className="text-xs text-gray-500">
                  Toggle to override property's default terms for this tenant
                </p>
              </div>
<Switch
  checked={useCustomTerms}
  onCheckedChange={(checked) => {
    setUseCustomTerms(checked);
    if (!checked && selectedPropertyDetails) {
      // When turning OFF custom terms, use property defaults
      setFormData((prev: any) => ({
        ...prev,
        lockin_period_months: selectedPropertyDetails.lockin_period_months || 0,
        lockin_penalty_amount: selectedPropertyDetails.lockin_penalty_amount || 0,
        lockin_penalty_type: selectedPropertyDetails.lockin_penalty_type || "fixed",
        notice_period_days: selectedPropertyDetails.notice_period_days || 0,
        notice_penalty_amount: selectedPropertyDetails.notice_penalty_amount || 0,
        notice_penalty_type: selectedPropertyDetails.notice_penalty_type || "fixed",
      }));
    } else if (checked && tenant) {
      // When turning ON custom terms for editing, restore tenant's custom values
      setFormData((prev: any) => ({
        ...prev,
        lockin_period_months: tenant.lockin_period_months || selectedPropertyDetails?.lockin_period_months || 0,
        lockin_penalty_amount: tenant.lockin_penalty_amount || selectedPropertyDetails?.lockin_penalty_amount || 0,
        lockin_penalty_type: tenant.lockin_penalty_type || selectedPropertyDetails?.lockin_penalty_type || "fixed",
        notice_period_days: tenant.notice_period_days || selectedPropertyDetails?.notice_period_days || 0,
        notice_penalty_amount: tenant.notice_penalty_amount || selectedPropertyDetails?.notice_penalty_amount || 0,
        notice_penalty_type: tenant.notice_penalty_type || selectedPropertyDetails?.notice_penalty_type || "fixed",
      }));
    }
  }}
/>
            </div>

            {useCustomTerms || !selectedPropertyDetails ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Lock-in Period Section */}
                <div className="space-y-3 border-2 border-blue-100 bg-blue-50/50 rounded p-3">
                  <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Custom Lock-in Period
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Duration (months)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.lockin_period_months || ''}
                        onChange={(e) => handleInputChange("lockin_period_months", parseInt(e.target.value) || 0)}
                        placeholder="12"
                        className="h-9 text-sm mt-1"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm">Penalty Amount</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={formData.lockin_penalty_amount || ''}
                          onChange={(e) => handleInputChange("lockin_penalty_amount", parseFloat(e.target.value) || 0)}
                          placeholder="Amount"
                          className="h-9 text-sm"
                        />
                        <Select
                          value={formData.lockin_penalty_type}
                          onValueChange={(value) => handleSelectChange("lockin_penalty_type", value)}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed" className="text-sm">Fixed Amount</SelectItem>
                            <SelectItem value="percentage" className="text-sm">Percentage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notice Period Section */}
                <div className="space-y-3 border-2 border-amber-100 bg-amber-50/50 rounded p-3">
                  <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                    <Clock3 className="h-4 w-4 text-amber-600" />
                    Custom Notice Period
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Duration (days)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.notice_period_days || ''}
                        onChange={(e) => handleInputChange("notice_period_days", parseInt(e.target.value) || 0)}
                        placeholder="30"
                        className="h-9 text-sm mt-1"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm">Penalty Amount</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={formData.notice_penalty_amount || ''}
                          onChange={(e) => handleInputChange("notice_penalty_amount", parseFloat(e.target.value) || 0)}
                          placeholder="Amount"
                          className="h-9 text-sm"
                        />
                        <Select
                          value={formData.notice_penalty_type}
                          onValueChange={(value) => handleSelectChange("notice_penalty_type", value)}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed" className="text-sm">Fixed Amount</SelectItem>
                            <SelectItem value="percentage" className="text-sm">Percentage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-2 border-green-200 bg-green-50 rounded">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800 text-sm">
                    Using Property's Default Terms
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
  <h4 className="font-medium mb-1 text-sm">Lock-in Period</h4>
  <div className="space-y-1 text-xs">
    <p><span className="text-gray-600">Duration:</span> {formData.lockin_period_months} months</p>
    <p><span className="text-gray-600">Penalty:</span> 
      {formData.lockin_penalty_type === 'percentage' ? (
        <span className="font-medium">%{formData.lockin_penalty_amount} ({formData.lockin_penalty_type})</span>
      ) : (
        <span className="font-medium">₹{formData.lockin_penalty_amount} ({formData.lockin_penalty_type})</span>
      )}
    </p>
  </div>
</div>

<div>
  <h4 className="font-medium mb-1 text-sm">Notice Period</h4>
  <div className="space-y-1 text-xs">
    <p><span className="text-gray-600">Duration:</span> {formData.notice_period_days} days</p>
    <p><span className="text-gray-600">Penalty:</span> 
      {formData.notice_penalty_type === 'percentage' ? (
        <span className="font-medium">%{formData.notice_penalty_amount} ({formData.notice_penalty_type})</span>
      ) : (
        <span className="font-medium">₹{formData.notice_penalty_amount} ({formData.notice_penalty_type})</span>
      )}
    </p>
  </div>
</div>
                </div>
              </div>
            )}

{/* Summary of Terms */}
<div className="border rounded p-3 bg-gray-50">
  <h4 className="font-medium mb-2 text-sm">Terms Summary</h4>
  <div className="grid grid-cols-2 gap-3">
    <div>
      <p className="text-xs text-gray-600">Lock-in Period:</p>
      <p className="font-medium text-sm">{formData.lockin_period_months} months</p>
    </div>
    <div>
      <p className="text-xs text-gray-600">Lock-in Penalty:</p>
      <p className="font-medium text-sm flex items-center gap-1">
        {formData.lockin_penalty_type === 'percentage' ? (
          <>
            <span>%</span>
            <span>{formData.lockin_penalty_amount}</span>
          </>
        ) : (
          <>
            <span>₹</span>
            <span>{formData.lockin_penalty_amount}</span>
          </>
        )}
        <span className="text-gray-500 text-[10px]">({formData.lockin_penalty_type})</span>
      </p>
    </div>
    <div>
      <p className="text-xs text-gray-600">Notice Period:</p>
      <p className="font-medium text-sm">{formData.notice_period_days} days</p>
    </div>
    <div>
      <p className="text-xs text-gray-600">Notice Penalty:</p>
      <p className="font-medium text-sm flex items-center gap-1">
        {formData.notice_penalty_type === 'percentage' ? (
          <>
            <span>%</span>
            <span>{formData.notice_penalty_amount}</span>
          </>
        ) : (
          <>
            <span>₹</span>
            <span>{formData.notice_penalty_amount}</span>
          </>
        )}
        <span className="text-gray-500 text-[10px]">({formData.notice_penalty_type})</span>
      </p>
    </div>
  </div>
</div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

{/* Documents Tab - made compact */}
<TabsContent value="documents" className="space-y-4">
  <Card>
    <CardHeader className="bg-amber-50 py-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <FileText className="h-4 w-4" />
        Required Documents
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-4">
      <Alert className="mb-4 bg-blue-50 border-blue-200 py-2">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          All marked (*) documents are required. Max file size: 10MB per file.
          Supported formats: PDF, JPG, PNG, WebP, BMP.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FileUploadField
          label="ID Proof"
          file={idProofFile}
          setFile={setIdProofFile}
          existingUrl={existingFiles.id_proof_url}
          fieldName="id_proof_url"
          description="Aadhar Card, Passport, PAN Card, Driving License"
        />
        
        <FileUploadField
          label="Address Proof"
          file={addressProofFile}
          setFile={setAddressProofFile}
          existingUrl={existingFiles.address_proof_url}
          fieldName="address_proof_url"
          description="Utility Bill, Bank Statement, Rental Agreement"
        />
        
        <FileUploadField
          label="Photograph"
          file={photoFile}
          setFile={setPhotoFile}
          existingUrl={existingFiles.photo_url}
          fieldName="photo_url"
          accept=".jpg,.jpeg,.png,.webp,.bmp"
          description="Recent passport-size photo"
        />
      </div>

      {/* Additional Documents */}
      <Separator className="my-4" />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="font-medium text-sm">Additional Documents (Optional)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = ".pdf,.jpg,.jpeg,.png,.webp,.bmp,.doc,.docx";
              input.multiple = true;
              input.onchange = (e: any) => {
                const files = Array.from(e.target.files);
                if (files.length + additionalFiles.length > 5) {
                  toast.error("Maximum 5 additional documents allowed");
                  return;
                }
                setAdditionalFiles(prev => [...prev, ...files as File[]]);
              };
              input.click();
            }}
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            Add Files
          </Button>
        </div>
        
        {/* Existing Additional Documents */}
        {additionalDocuments.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-xs">Existing Documents:</h4>
            {additionalDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{doc.filename}</p>
                    <p className="text-xs text-gray-500">
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Previously uploaded'}
                    </p>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-800"
                  onClick={() => {
                    setAdditionalDocuments(prev => prev.filter((_, i) => i !== index));
                    toast.info("Document will be removed on save");
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* New Additional Files */}
        {additionalFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-xs">New Files to Upload:</h4>
            {additionalFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-800"
                  onClick={() => {
                    setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-500">
          You can upload additional documents like company ID, college ID, reference letters, etc.
          Maximum 5 additional documents.
        </p>
      </div>
    </CardContent>
  </Card>
</TabsContent>

    {/* Credentials Tab - made compact */}
    <TabsContent value="credentials" className="space-y-4">
      <Card>
        <CardHeader className="bg-emerald-50 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            Login Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Current Credential Status */}
            {tenant?.has_credentials ? (
              <Alert className="bg-blue-50 border-blue-200 py-2">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 text-sm">Login Already Configured</h4>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Tenant already has portal access. To reset password, set a new password below.
                    </p>
                    <div className="mt-2 space-y-0.5">
                      <p className="text-xs">
                        <span className="font-medium">Email:</span> {tenant.credential_email || tenant.email}
                      </p>
                      <p className="text-xs">
                        <span className="font-medium">Status:</span>{" "}
                        <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                          Active
                        </Badge>
                      </p>
                    </div>
                  </div>
                </div>
              </Alert>
            ) : (
              <Alert className="bg-blue-50 border-blue-200 py-2">
                <div className="flex items-start gap-2">
                  <Key className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 text-sm">Create Portal Access</h4>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Set a password to enable tenant portal access.
                    </p>
                  </div>
                </div>
              </Alert>
            )}

            {/* Enable Credentials Toggle */}
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <Label className="font-medium text-sm">Enable Portal Access</Label>
                <p className="text-xs text-gray-500">
                  Allow tenant to access their portal with login credentials
                </p>
              </div>
              <Switch
                checked={createCredentials}
                onCheckedChange={(checked) => setCreateCredentials(checked)}
              />
            </div>

            {createCredentials && (
              <>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm">
                        <span className="text-red-500">*</span> Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 h-9 text-sm"
                          minLength={6}
                          required={createCredentials}
                        />
                      </div>
                      
                      {/* Password Strength Meter */}
                      {password.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Password Strength:</span>
                            <span className={
                              passwordStrength >= 75 ? "text-green-600" :
                              passwordStrength >= 50 ? "text-yellow-600" :
                              passwordStrength >= 25 ? "text-orange-600" : "text-red-600"
                            }>
                              {passwordStrength >= 75 ? "Strong" :
                               passwordStrength >= 50 ? "Good" :
                               passwordStrength >= 25 ? "Weak" : "Very Weak"}
                            </span>
                          </div>
                          {/* <Progress 
                            value={passwordStrength} 
                            className="h-1.5"
                            indicatorClassName={
                              passwordStrength >= 75 ? "bg-green-500" :
                              passwordStrength >= 50 ? "bg-yellow-500" :
                              passwordStrength >= 25 ? "bg-orange-500" : "bg-red-500"
                            }
                          /> */}
                          <Progress
  value={passwordStrength}
  className="h-1.5 bg-gray-200 rounded-full"
  style={{
    // dynamic color for the filled part
    '--progress-bar-color': passwordStrength >= 75 ? 'rgb(34,197,94)' : // green-500
                             passwordStrength >= 50 ? 'rgb(234,179,8)' : // yellow-500
                             passwordStrength >= 25 ? 'rgb(249,115,22)' : // orange-500
                             'rgb(239,68,68)' // red-500
  } as React.CSSProperties}
/>

                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm">
                        <span className="text-red-500">*</span> Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 h-9 text-sm"
                          minLength={6}
                          required={createCredentials}
                        />
                      </div>
                      
                      {password && confirmPassword && (
                        <div className={`flex items-center gap-1 text-xs ${
                          password === confirmPassword ? "text-green-600" : "text-red-600"
                        }`}>
                          {password === confirmPassword ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Passwords match</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span>Passwords don't match</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="p-3 border rounded bg-gray-50">
                    <Label className="font-medium mb-1 block text-sm">Password Requirements:</Label>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li className={`flex items-center gap-1 ${password.length >= 6 ? "text-green-600" : ""}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${password.length >= 6 ? "bg-green-500" : "bg-gray-300"}`} />
                        Minimum 6 characters
                      </li>
                      <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-green-600" : ""}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
                        At least one uppercase letter
                      </li>
                      <li className={`flex items-center gap-1 ${/[0-9]/.test(password) ? "text-green-600" : ""}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${/[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
                        At least one number
                      </li>
                      <li className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${/[^A-Za-z0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
                        At least one special character
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>

  {/* Form Actions - made compact */}
  <div className="flex items-center justify-between pt-4 border-t">
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
        className="h-9 px-3 text-sm"
      >
        Cancel
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const tabs = ["basic", "occupation", "address", "property", "terms", "documents", "credentials"];
          const currentIndex = tabs.indexOf(activeTab);
          if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1]);
          }
        }}
        disabled={activeTab === "basic" || loading}
        className="h-9 px-3 text-sm"
      >
        Previous
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const tabs = ["basic", "occupation", "address", "property", "terms", "documents", "credentials"];
          const currentIndex = tabs.indexOf(activeTab);
          if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1]);
          }
        }}
        disabled={activeTab === "credentials" || loading}
        className="h-9 px-3 text-sm"
      >
        Next
      </Button>
    </div>
    
    <Button 
      type="submit" 
      disabled={loading}
      className="min-w-[120px] h-9 text-sm"
    >
      {loading ? (
        <>
          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          {uploadProgress > 0 ? "Uploading..." : "Saving..."}
        </>
      ) : tenant ? "Update Tenant" : "Create Tenant"}
    </Button>
  </div>

  {/* Form Status Summary - made compact */}
  <div className="mt-4 p-3 border rounded bg-gray-50">
    <div className="grid grid-cols-4 md:grid-cols-7 gap-1 text-xs">
      {[
        { tab: "basic", label: "Basic Info", complete: !!formData.full_name && !!formData.email && !!formData.phone },
        { tab: "occupation", label: "Occupation", complete: !!formData.occupation_category },
        { tab: "address", label: "Address", complete: !!formData.address && !!formData.city && !!formData.state },
        { tab: "property", label: "Property", complete: !!formData.property_id },
        { tab: "terms", label: "Terms", complete: !!formData.property_id || useCustomTerms },
        { tab: "documents", label: "Documents", complete: 
          (!!idProofFile || !!existingFiles.id_proof_url) && 
          (!!addressProofFile || !!existingFiles.address_proof_url) && 
          (!!photoFile || !!existingFiles.photo_url) 
        },
        { tab: "credentials", label: "Login", complete: 
          !createCredentials || (password.length >= 6 && password === confirmPassword)
        },
      ].map((section) => (
        <div 
          key={section.tab}
          className={`flex items-center gap-1 p-1.5 rounded ${section.complete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
          onClick={() => setActiveTab(section.tab)}
        >
          <div className={`h-1.5 w-1.5 rounded-full ${section.complete ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="truncate">{section.label}</span>
          {section.complete && <Check className="h-2.5 w-2.5 ml-auto" />}
        </div>
      ))}
    </div>
  </div>
  
<Button
  type="button"
  variant="outline"
  size="sm"
  onClick={() => {
    console.log('=== DEBUG CURRENT STATE ===');
    console.log('Tenant from props:', tenant);
    console.log('Form data:', formData);
    console.log('useCustomTerms:', useCustomTerms);
    console.log('Selected property:', selectedPropertyDetails);
    console.log('=== END DEBUG ===');
  }}
  className="text-xs"
>
  Debug State
</Button>
</form>
  );
}