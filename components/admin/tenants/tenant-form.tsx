// // components/admin/tenants/tenant-form.tsx
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
//   Clock3,
//   ChevronLeft,
//   ChevronRight
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
//   getPropertyDetails,
//   type Tenant,
//   type PreferredOptions,
//   type OptionType,
//   getPreferredOptions,
// } from "@/lib/tenantApi";
// import { consumeMasters } from "@/lib/masterApi";

// // Add Property type definition
// type Property = {
//   id: number;
//   name: string;
//   city?: string;
//   state?: string;
//   address?: string;
//   lockin_period_months: number;
//   lockin_penalty_amount: number;
//   lockin_penalty_type: string;
//   notice_period_days: number;
//   notice_penalty_amount: number;
//   notice_penalty_type: string;
// };

// interface MasterValue {
//   id: number;
//   name: string;
//   isactive: number;
// }

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
//   const [activeTab, setActiveTab] = useState("basic");
  
//   // Master data states
//   const [commonMasters, setCommonMasters] = useState<Record<string, MasterValue[]>>({});
//   const [roomsMasters, setRoomsMasters] = useState<Record<string, MasterValue[]>>({});
//   const [loadingMasters, setLoadingMasters] = useState(false);
  
//   // Derived options from masters
//   const [cities, setCities] = useState<MasterValue[]>([]);
//   const [states, setStates] = useState<MasterValue[]>([]);
//   const [sharingTypes, setSharingTypes] = useState<MasterValue[]>([]);
//   const [roomTypes, setRoomTypes] = useState<MasterValue[]>([]);
//   const [occupations, setOccupations] = useState<MasterValue[]>([]);
  
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
//   const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<Property | null>(null);
//   const [useCustomTerms, setUseCustomTerms] = useState(false);

//   // Existing files from tenant
//   const [existingFiles, setExistingFiles] = useState({
//     id_proof_url: tenant?.id_proof_url || "",
//     address_proof_url: tenant?.address_proof_url || "",
//     photo_url: tenant?.photo_url || "",
//   });
  
//   // Additional documents from tenant
//   const [additionalDocuments, setAdditionalDocuments] = useState<Array<{
//     filename: string;
//     url: string;
//     uploaded_at?: string;
//   }>>(tenant?.additional_documents || []);
  
//   // Credential fields
//   const [createCredentials, setCreateCredentials] = useState(false);
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordStrength, setPasswordStrength] = useState(0);
  
//   const [formData, setFormData] = useState<any>({
//     salutation: tenant?.salutation || "",
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
//     city_id: tenant?.city_id || "",
//     city: tenant?.city || "",
//     state_id: tenant?.state_id || "",
//     state: tenant?.state || "",
//     pincode: tenant?.pincode || "",
//     preferred_sharing: tenant?.preferred_sharing || "",
//     preferred_room_type: tenant?.preferred_room_type || "",
//     preferred_property_id: tenant?.preferred_property_id || "",
//     check_in_date: tenant?.check_in_date || "",
//     portal_access_enabled: tenant?.portal_access_enabled || false,
//     is_active: tenant?.is_active ?? true,
//     emergency_contact_name: tenant?.emergency_contact_name || "",
//     emergency_contact_phone: tenant?.emergency_contact_phone || "",
//     emergency_contact_relation: tenant?.emergency_contact_relation || "",
//     lockin_period_months: tenant?.lockin_period_months !== undefined ? tenant.lockin_period_months : 0,
//     lockin_penalty_amount: tenant?.lockin_penalty_amount !== undefined ? tenant.lockin_penalty_amount : 0,
//     lockin_penalty_type: tenant?.lockin_penalty_type || "fixed",
//     notice_period_days: tenant?.notice_period_days !== undefined ? tenant.notice_period_days : 0,
//     notice_penalty_amount: tenant?.notice_penalty_amount !== undefined ? tenant.notice_penalty_amount : 0,
//     notice_penalty_type: tenant?.notice_penalty_type || "fixed",
//     property_id: tenant?.property_id || undefined,
//   });

//   const tabs = ["basic", "occupation", "address", "property", "terms", "documents", "credentials"];

//   const goToNextTab = () => {
//     const currentIndex = tabs.indexOf(activeTab);
//     if (currentIndex < tabs.length - 1) {
//       setActiveTab(tabs[currentIndex + 1]);
//     }
//   };

//   const goToPrevTab = () => {
//     const currentIndex = tabs.indexOf(activeTab);
//     if (currentIndex > 0) {
//       setActiveTab(tabs[currentIndex - 1]);
//     }
//   };

//   // Fetch masters and properties when form opens
//   useEffect(() => {
//     fetchMasters();
//     fetchProperties();
//   }, []);

//   // Initialize with tenant data
//   useEffect(() => {
//     loadOptions();
//     if (tenant?.id) {
//       loadExistingDocuments();
//       if (tenant.additional_documents) {
//         setAdditionalDocuments(tenant.additional_documents);
//       }
//       setCreateCredentials(tenant?.has_credentials || false);
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

//   useEffect(() => {
//     if (formData.property_id && !useCustomTerms) {
//       fetchPropertyDetails(formData.property_id);
//     } else {
//       setSelectedPropertyDetails(null);
//     }
//   }, [formData.property_id, useCustomTerms]);

//   useEffect(() => {
//     if (tenant?.id) {
//       const hasCustomTerms = 
//         (tenant.lockin_period_months !== null && tenant.lockin_period_months !== undefined) ||
//         (tenant.lockin_penalty_amount !== null && tenant.lockin_penalty_amount !== undefined) ||
//         (tenant.notice_period_days !== null && tenant.notice_period_days !== undefined) ||
//         (tenant.notice_penalty_amount !== null && tenant.notice_penalty_amount !== undefined);
      
//       setUseCustomTerms(hasCustomTerms);
      
//       if (hasCustomTerms) {
//         setFormData((prev: any) => ({
//           ...prev,
//           lockin_period_months: tenant.lockin_period_months || 0,
//           lockin_penalty_amount: tenant.lockin_penalty_amount || 0,
//           lockin_penalty_type: tenant.lockin_penalty_type || "fixed",
//           notice_period_days: tenant.notice_period_days || 0,
//           notice_penalty_amount: tenant.notice_penalty_amount || 0,
//           notice_penalty_type: tenant.notice_penalty_type || "fixed",
//         }));
//       }
//     } else {
//       setUseCustomTerms(false);
//     }
//   }, [tenant]);

//   // Update cities and states from masters
//   useEffect(() => {
//     if (commonMasters["Cities"]) {
//       setCities(commonMasters["Cities"]);
//     }
//     if (commonMasters["States"]) {
//       setStates(commonMasters["States"]);
//     }
//   }, [commonMasters]);

//   // Update sharing types and room types from rooms masters
//   useEffect(() => {
//     if (roomsMasters["Sharing Type"]) {
//       setSharingTypes(roomsMasters["Sharing Type"]);
//     }
//     if (roomsMasters["Room Type"]) {
//       setRoomTypes(roomsMasters["Room Type"]);
//     }
//     if (roomsMasters["Occupation"]) {
//       setOccupations(roomsMasters["Occupation"]);
//     }
//   }, [roomsMasters]);

//   // When masters load and we have a tenant, set the city and state IDs
//   useEffect(() => {
//     if (tenant?.id && cities.length > 0 && states.length > 0) {
//       // Find city ID from city name
//       if (tenant.city && !tenant.city_id) {
//         const matchingCity = cities.find(
//           c => c.name.toLowerCase() === tenant.city?.toLowerCase()
//         );
//         if (matchingCity) {
//           setFormData((prev: any) => ({
//             ...prev,
//             city_id: String(matchingCity.id)
//           }));
//         }
//       }
      
//       // Find state ID from state name
//       if (tenant.state && !tenant.state_id) {
//         const matchingState = states.find(
//           s => s.name.toLowerCase() === tenant.state?.toLowerCase()
//         );
//         if (matchingState) {
//           setFormData((prev: any) => ({
//             ...prev,
//             state_id: String(matchingState.id)
//           }));
//         }
//       }
//     }
//   }, [cities, states, tenant]);

//   const fetchMasters = async () => {
//     setLoadingMasters(true);
//     try {
//       // Fetch both Common and Rooms masters in parallel
//       const [commonRes, roomsRes] = await Promise.all([
//         consumeMasters({ tab: "Common" }),
//         consumeMasters({ tab: "Rooms" })
//       ]);

//       // Process Common masters
//       if (commonRes?.success && commonRes.data) {
//         const grouped: Record<string, MasterValue[]> = {};
//         commonRes.data.forEach((item: any) => {
//           const type = item.type_name;
//           if (!grouped[type]) {
//             grouped[type] = [];
//           }
//           grouped[type].push({
//             id: item.value_id,
//             name: item.value_name,
//             isactive: 1,
//           });
//         });
//         setCommonMasters(grouped);
//       }

//       // Process Rooms masters
//       if (roomsRes?.success && roomsRes.data) {
//         const grouped: Record<string, MasterValue[]> = {};
//         roomsRes.data.forEach((item: any) => {
//           const type = item.type_name;
//           if (!grouped[type]) {
//             grouped[type] = [];
//           }
//           grouped[type].push({
//             id: item.value_id,
//             name: item.value_name,
//             isactive: 1,
//           });
//         });
//         setRoomsMasters(grouped);
//       }
//     } catch (error) {
//       console.error("Failed to fetch masters:", error);
//       toast.error("Failed to load master data");
//     } finally {
//       setLoadingMasters(false);
//     }
//   };

//   const fetchProperties = async () => {
//     try {
//       const propertiesResult = await getAllProperties();
//       if (propertiesResult.success && propertiesResult.data) {
//         const propertiesData = Array.isArray(propertiesResult.data) 
//           ? propertiesResult.data.map(p => ({
//               value: p.id,
//               label: p.name,
//               address: p.address || `${p.city}, ${p.state}`,
//               lockin_period_months: p.lockin_period_months,
//               lockin_penalty_amount: p.lockin_penalty_amount,
//               lockin_penalty_type: p.lockin_penalty_type,
//               notice_period_days: p.notice_period_days,
//               notice_penalty_amount: p.notice_penalty_amount,
//               notice_penalty_type: p.notice_penalty_type,
//             }))
//           : [];
//         setProperties(propertiesData);
//       }
//     } catch (err) {
//       console.error("Failed to fetch properties", err);
//       toast.error("Failed to load properties");
//     }
//   };

//   const fetchPropertyDetails = async (propertyId: number) => {
//     try {
//       const res: any = await getPropertyDetails(propertyId);
      
//       if (res.success && res.data) {
//         setSelectedPropertyDetails(res.data);
        
//         const isEditingExistingTenant = tenant?.id !== undefined;
//         const tenantHasCustomValues = 
//           tenant?.lockin_period_months !== null || 
//           tenant?.notice_period_days !== null ||
//           tenant?.lockin_penalty_amount !== null ||
//           tenant?.notice_penalty_amount !== null;
        
//         if (!isEditingExistingTenant || (!tenantHasCustomValues && !useCustomTerms)) {
//           setFormData((prev: any) => ({
//             ...prev,
//             lockin_period_months: res.data.lockin_period_months || prev.lockin_period_months,
//             lockin_penalty_amount: res.data.lockin_penalty_amount || prev.lockin_penalty_amount,
//             lockin_penalty_type: res.data.lockin_penalty_type || prev.lockin_penalty_type,
//             notice_period_days: res.data.notice_period_days || prev.notice_period_days,
//             notice_penalty_amount: res.data.notice_penalty_amount || prev.notice_penalty_amount,
//             notice_penalty_type: res.data.notice_penalty_type || prev.notice_penalty_type,
//           }));
//         }
//       }
//     } catch (err: any) {
//       console.error("Failed to fetch property details", err);
//     }
//   };

//   const handlePropertySelect = (propertyId: number | undefined) => {
//     setFormData((prev: any) => ({ 
//       ...prev, 
//       property_id: propertyId 
//     }));
    
//     if (!tenant) {
//       setUseCustomTerms(false);
//     }
//   };

//   const loadOptions = async () => {
//     try {
//       // Load preferred options
//       const preferredResult = await getPreferredOptions();

//       if (preferredResult.success && preferredResult.data) {
//         const data = preferredResult.data;
//         setOptions(prev => ({
//           ...prev,
//           ...data,
//           genderOptions: data.genderOptions || ['Male', 'Female', 'Other'],
//           countryCodes: data.countryCodes || ['+91', '+1', '+44', '+61', '+65']
//         }));
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
//           if (res.data.additional_documents && Array.isArray(res.data.additional_documents)) {
//             setAdditionalDocuments(res.data.additional_documents);
//           }
          
//           // Update form data with the latest from API
//           setFormData((prev: any) => ({
//             ...prev,
//             city_id: res.data.city_id || prev.city_id,
//             city: res.data.city || prev.city,
//             state_id: res.data.state_id || prev.state_id,
//             state: res.data.state || prev.state,
//           }));
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
//     // Basic validations
//     if (!formData.full_name.trim()) {
//       toast.error("Full name is required");
//       setActiveTab("basic");
//       return false;
//     }
    
//     if (!formData.email.trim()) {
//       toast.error("Email is required");
//       setActiveTab("basic");
//       return false;
//     }
    
//     if (!formData.phone.trim()) {
//       toast.error("Phone number is required");
//       setActiveTab("basic");
//       return false;
//     }
    
//     if (!formData.gender) {
//       toast.error("Gender is required");
//       setActiveTab("basic");
//       return false;
//     }
    
//     if (!formData.address) {
//       toast.error("Address is required");
//       setActiveTab("address");
//       return false;
//     }
    
//     if (!formData.city_id && !formData.city) {
//       toast.error("City is required");
//       setActiveTab("address");
//       return false;
//     }
    
//     if (!formData.state_id && !formData.state) {
//       toast.error("State is required");
//       setActiveTab("address");
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
//     if (!tenant?.id) {
//       if (createCredentials) {
//         if (password.length < 6) {
//           toast.error("Password must be at least 6 characters");
//           setActiveTab("credentials");
//           return false;
//         }
        
//         if (password !== confirmPassword) {
//           toast.error("Passwords do not match");
//           setActiveTab("credentials");
//           return false;
//         }
//       }
//     } else {
//       if (password && password.trim() !== '') {
//         if (password.length < 6) {
//           toast.error("Password must be at least 6 characters");
//           setActiveTab("credentials");
//           return false;
//         }
        
//         if (password !== confirmPassword) {
//           toast.error("Passwords do not match");
//           setActiveTab("credentials");
//           return false;
//         }
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
//       const progressInterval = setInterval(() => {
//         setUploadProgress(prev => {
//           if (prev >= 90) {
//             clearInterval(progressInterval);
//             return prev;
//           }
//           return prev + 10;
//         });
//       }, 200);
      
//       const formDataToSend = new FormData();
      
//       // Append tenant data
//       Object.keys(formData).forEach(key => {
//         const value = formData[key as keyof typeof formData];
//         if (value !== undefined && value !== null && value !== '') {
//           if ((key === 'check_in_date' || key === 'date_of_birth') && value) {
//             const dateValue = new Date(String(value));
//             if (!isNaN(dateValue.getTime())) {
//               formDataToSend.append(key, dateValue.toISOString().split('T')[0]);
//             }
//           } else {
//             formDataToSend.append(key, String(value));
//           }
//         }
//       });
      
//       // Append credential info
//       if (createCredentials) {
//         if (tenant?.id) {
//           if (password && password.trim() !== '') {
//             formDataToSend.append('update_credentials', 'true');
//             formDataToSend.append('password', password);
//           }
//         } else {
//           if (createCredentials) {
//             formDataToSend.append('create_credentials', 'true');
//             formDataToSend.append('password', password);
//           }
//         }
//       }
      
//       // Append existing additional documents as JSON
//       if (additionalDocuments.length > 0) {
//         formDataToSend.append('additional_documents', JSON.stringify(additionalDocuments));
//       }
      
//       // Append main document files
//       if (idProofFile) formDataToSend.append('id_proof_url', idProofFile);
//       if (addressProofFile) formDataToSend.append('address_proof_url', addressProofFile);
//       if (photoFile) formDataToSend.append('photo_url', photoFile);
      
//       // Append additional files
//       additionalFiles.forEach((file) => {
//         formDataToSend.append('additional_documents[]', file);
//       });
      
//       let result: any;
//       if (tenant?.id) {
//         result = await updateTenant(tenant.id, formDataToSend);
//       } else {
//         result = await createTenant(formDataToSend);
//       }
      
//       clearInterval(progressInterval);
//       setUploadProgress(100);
      
//       if (result.success) {
//         const successMessage = tenant ? "Tenant updated successfully" : "Tenant created successfully";
//         toast.success(successMessage);
        
//         if (result.additional_documents) {
//           setAdditionalDocuments(result.additional_documents);
//         }
        
//         setIdProofFile(null);
//         setAddressProofFile(null);
//         setPhotoFile(null);
//         setAdditionalFiles([]);
        
//         if (typeof onSuccess === "function") {
//           setTimeout(() => {
//             onSuccess();
//           }, 500);
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
//     setFormData((prev: any) => ({ ...prev, [field]: value }));
//   };

//   const handleSelectChange = (field: string, value: string | undefined) => {
//     setFormData((prev: any) => ({ ...prev, [field]: value }));
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
//               onError={(e: any) => {
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
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {/* Progress Bar - made smaller */}
//       {loading && uploadProgress > 0 && (
//         <div className="space-y-1">
//           <div className="flex justify-between text-xs">
//             <span>Uploading...</span>
//             <span>{uploadProgress}%</span>
//           </div>
//           <Progress value={uploadProgress} className="h-1.5" />
//         </div>
//       )}

//       {/* Form Tabs - made more compact */}
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//         <TabsList className="grid grid-cols-7 mb-2 h-8 sm:h-8 mt-2">
//           <TabsTrigger value="basic" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
//             <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//             <span className="inline text-[8px] sm:text-xs">Basic</span>
//           </TabsTrigger>
//           <TabsTrigger value="occupation" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
//             <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//             <span className="inline text-[8px] sm:text-xs">Work</span>
//           </TabsTrigger>
//           <TabsTrigger value="address" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
//             <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//             <span className="inline text-[8px] sm:text-xs">Address</span>
//           </TabsTrigger>
//           <TabsTrigger value="property" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
//             <Building className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//             <span className="inline text-[8px] sm:text-xs">Property</span>
//           </TabsTrigger>
//           <TabsTrigger value="terms" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
//             <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//             <span className="inline text-[8px] sm:text-xs">Terms</span>
//           </TabsTrigger>
//           <TabsTrigger value="documents" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
//             <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//             <span className="inline text-[8px] sm:text-xs">Docs</span>
//           </TabsTrigger>
//           <TabsTrigger value="credentials" className="flex items-center gap-1 py-1 text-[10px] sm:text-xs px-0.5 sm:px-1">
//             <Key className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//             <span className="inline text-[8px] sm:text-xs">Login</span>
//           </TabsTrigger>
//         </TabsList>

//         {/* Fixed height container for tab content */}
//         <div className="min-h-[300px] max-h-[450px] overflow-y-auto pr-1 px-4 pb-6">
//           {/* Basic Information Tab */}
//           <TabsContent value="basic" className="space-y-4 mt-0 ">
//             <Card>
//               <CardHeader className="bg-blue-50 py-3">
//                 <CardTitle className="flex items-center gap-2 text-base">
//                   <User className="h-4 w-4" />
//                   Personal Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-3">
//                     {/* Salutation and Name row */}
//                     <div className="grid grid-cols-4 gap-2">
//                       <div className="space-y-1">
//                         <Label htmlFor="salutation" className="text-sm">Salutation</Label>
//                         <Select
//                           value={formData.salutation}
//                           onValueChange={(value) => handleSelectChange("salutation", value)}
//                         >
//                           <SelectTrigger className="h-9 text-sm">
//                             <SelectValue placeholder="Title" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof"].map((title) => (
//                               <SelectItem key={title} value={title} className="text-sm">
//                                 {title}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div className="space-y-1 col-span-3">
//                         <Label htmlFor="full_name" className="text-sm">
//                           <span className="text-red-500">*</span> Full Name
//                         </Label>
//                         <Input
//                           id="full_name"
//                           value={formData.full_name}
//                           onChange={(e) => handleInputChange("full_name", e.target.value)}
//                           placeholder="Enter full name"
//                           required
//                           className="h-9 text-sm"
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-1">
//                       <Label htmlFor="email" className="text-sm">
//                         <span className="text-red-500">*</span> Email Address
//                       </Label>
//                       <Input
//                         id="email"
//                         type="email"
//                         value={formData.email}
//                         onChange={(e) => handleInputChange("email", e.target.value)}
//                         placeholder="example@email.com"
//                         required
//                         className="h-9 text-sm"
//                       />
//                     </div>

//                     <div className="space-y-1">
//                       <Label htmlFor="phone" className="text-sm">
//                         <span className="text-red-500">*</span> Phone Number
//                       </Label>
//                       <div className="flex gap-2">
//                         <Select
//                           value={formData.country_code}
//                           onValueChange={(value) => handleInputChange("country_code", value)}
//                         >
//                           <SelectTrigger className="w-[120px] h-9 text-sm">
//                             <SelectValue placeholder="+91" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {options.countryCodes.map((code) => (
//                               <SelectItem key={code} value={code} className="text-sm">
//                                 {code}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <Input
//                           id="phone"
//                           type="tel"
//                           value={formData.phone}
//                           onChange={(e) => handleInputChange("phone", e.target.value)}
//                           placeholder="9876543210"
//                           pattern="[6-9][0-9]{9}"
//                           maxLength={10}
//                           required
//                           className="h-9 text-sm"
//                         />
//                       </div>
//                       <p className="text-xs text-gray-500">
//                         10-digit Indian mobile number starting with 6-9
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-2 gap-2">
//                       <div className="space-y-1">
//                         <Label htmlFor="date_of_birth" className="text-sm">Date of Birth</Label>
//                         <div className="relative">
//                           <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                           <Input
//                             id="date_of_birth"
//                             type="date"
//                             value={formData.date_of_birth}
//                             onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
//                             className="pl-10 h-9 text-sm"
//                             max={new Date().toISOString().split('T')[0]}
//                           />
//                         </div>
//                         {formData.date_of_birth && (
//                           <p className="text-xs text-gray-500">
//                             Must be at least 18 years old
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <div className="space-y-1">
//                       <Label htmlFor="gender" className="text-sm">
//                         <span className="text-red-500">*</span> Gender
//                       </Label>
//                       <Select
//                         value={formData.gender}
//                         onValueChange={(value) => handleSelectChange("gender", value)}
//                       >
//                         <SelectTrigger className="h-9 text-sm">
//                           <SelectValue placeholder="Select gender" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {options.genderOptions.map((option) => (
//                             <SelectItem key={option} value={option} className="text-sm">
//                               {option}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-1">
//                       <Label className="text-sm">Emergency Contact</Label>
//                       <div className="grid grid-cols-2 gap-2">
//                         <Input
//                           placeholder="Name"
//                           value={formData.emergency_contact_name}
//                           onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
//                           className="h-9 text-sm"
//                         />
//                         <Input
//                           placeholder="Phone"
//                           value={formData.emergency_contact_phone}
//                           onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
//                           className="h-9 text-sm"
//                           pattern="[6-9][0-9]{9}"
//                           maxLength={10}
//                         />
//                       </div>
//                       <Select
//                         value={formData.emergency_contact_relation}
//                         onValueChange={(value) => handleSelectChange("emergency_contact_relation", value)}
//                       >
//                         <SelectTrigger className="h-9 text-sm">
//                           <SelectValue placeholder="Relation" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {emergencyRelations.map((relation) => (
//                             <SelectItem key={relation} value={relation} className="text-sm">
//                               {relation}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="pt-2">
//                       <div className="flex items-center gap-2">
//                         <Switch
//                           id="is_active"
//                           checked={formData.is_active}
//                           onCheckedChange={(checked) => handleInputChange("is_active", checked)}
//                         />
//                         <Label htmlFor="is_active" className="cursor-pointer text-sm">
//                           Active Tenant
//                         </Label>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Occupation Tab */}
//           <TabsContent value="occupation" className="space-y-4 mt-0">
//             <Card>
//               <CardHeader className="bg-green-50 py-3">
//                 <CardTitle className="flex items-center gap-2 text-base">
//                   <Briefcase className="h-4 w-4" />
//                   Occupation & Room Preferences
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-3">
//                     <div className="space-y-1">
//                       <Label htmlFor="occupation_category" className="text-sm">Occupation Category</Label>
//                       <Select
//                         value={formData.occupation_category}
//                         onValueChange={(value) => handleSelectChange("occupation_category", value)}
//                       >
//                         <SelectTrigger className="h-9 text-sm">
//                           <SelectValue placeholder="Select category" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="any" className="text-sm">Any</SelectItem>
//                           {occupationCategories.map((option) => (
//                             <SelectItem key={option.value} value={option.value} className="text-sm">
//                               <span className="mr-2">{option.icon}</span>
//                               {option.label}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-1">
//                       <Label htmlFor="exact_occupation" className="text-sm">
//                         {formData.occupation_category === "Student" 
//                           ? "Course & College/University"
//                           : formData.occupation_category === "Service" 
//                           ? "Job Title & Company"
//                           : formData.occupation_category === "Business"
//                           ? "Business Type & Name"
//                           : "Occupation Details"}
//                       </Label>
//                       <Textarea
//                         id="exact_occupation"
//                         value={formData.exact_occupation}
//                         onChange={(e) => handleInputChange("exact_occupation", e.target.value)}
//                         placeholder={
//                           formData.occupation_category === "Student"
//                             ? "e.g., B.Tech Computer Science at ABC University"
//                             : formData.occupation_category === "Service"
//                             ? "e.g., Software Engineer at XYZ Corporation"
//                             : formData.occupation_category === "Business"
//                             ? "e.g., Retail Business - Fashion Store"
//                             : "Enter occupation details"
//                         }
//                         rows={2}
//                         className="text-sm min-h-16"
//                       />
//                     </div>

//                     <div className="space-y-1">
//                       <Label htmlFor="occupation" className="text-sm">Additional Details</Label>
//                       <Input
//                         id="occupation"
//                         value={formData.occupation}
//                         onChange={(e) => handleInputChange("occupation", e.target.value)}
//                         placeholder="Any additional occupation information"
//                         className="h-9 text-sm"
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <div className="space-y-1">
//                       <Label htmlFor="preferred_property_id" className="text-sm">Preferred Property</Label>
//                       <Select
//                         value={formData.preferred_property_id?.toString() || ""}
//                         onValueChange={(value) => {
//                           const val = value ? parseInt(value) : undefined;
//                           setFormData((prev: any) => ({ ...prev, preferred_property_id: val }));
//                         }}
//                       >
//                         <SelectTrigger className="h-9 text-sm">
//                           <SelectValue placeholder="Select property" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="none" className="text-sm">None</SelectItem>
//                           {properties.map((property) => (
//                             <SelectItem key={property.value} value={property.value.toString()} className="text-sm">
//                               <div className="flex flex-col">
//                                 <span className="font-medium">{property.label}</span>
//                                 <span className="text-xs text-gray-500">
//                                   {property.address}
//                                 </span>
//                               </div>
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     {formData.gender && formData.preferred_property_id && availableRooms.length > 0 && (
//                       <div className="space-y-1">
//                         <Label className="text-sm">Available Rooms ({availableRooms.length} found)</Label>
//                         <div className="max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
//                           {availableRooms.map((room) => (
//                             <div
//                               key={room.id}
//                               className="p-2 mb-2 border rounded hover:bg-white cursor-pointer transition-colors text-sm"
//                               onClick={() => {
//                                 handleSelectChange("preferred_sharing", room.sharing_type);
//                                 handleSelectChange("preferred_room_type", room.room_type);
//                               }}
//                             >
//                               <div className="flex items-center justify-between">
//                                 <div>
//                                   <div className="flex items-center gap-1">
//                                     <Building className="h-3.5 w-3.5 text-blue-600" />
//                                     <span className="font-medium">Room {room.room_number}</span>
//                                     <Badge variant="outline" className="text-xs">
//                                       {room.sharing_type}
//                                     </Badge>
//                                   </div>
//                                   <div className="text-xs text-gray-600 mt-0.5">
//                                     {room.room_type} • Floor {room.floor || "G"} • 
//                                     {(room.available_beds || (room.total_bed - room.occupied_beds))} bed(s) available
//                                   </div>
//                                 </div>
//                                 <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
//                                   ₹{room.rent_per_bed || room.monthly_rent}/bed
//                                 </Badge>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     <div className="grid grid-cols-2 gap-3">
//                       <div className="space-y-1">
//                         <Label htmlFor="preferred_sharing" className="text-sm">Preferred Sharing</Label>
//                         <Select
//                           value={formData.preferred_sharing}
//                           onValueChange={(value) => handleSelectChange("preferred_sharing", value)}
//                           disabled={loadingMasters}
//                         >
//                           <SelectTrigger className="h-9 text-sm">
//                             <SelectValue placeholder={loadingMasters ? "Loading..." : "Select sharing"} />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="any" className="text-sm">Any</SelectItem>
//                             {loadingMasters ? (
//                               <div className="px-2 py-1.5 text-xs text-gray-500 flex items-center gap-1">
//                                 <Loader2 className="h-3 w-3 animate-spin" />
//                                 Loading...
//                               </div>
//                             ) : sharingTypes.length > 0 ? (
//                               sharingTypes.map((type) => (
//                                 <SelectItem key={type.id} value={type.name.toLowerCase()} className="text-sm">
//                                   {type.name}
//                                 </SelectItem>
//                               ))
//                             ) : (
//                               <>
//                                 <SelectItem value="single" className="text-sm">Single Sharing</SelectItem>
//                                 <SelectItem value="double" className="text-sm">Double Sharing</SelectItem>
//                                 <SelectItem value="triple" className="text-sm">Triple Sharing</SelectItem>
//                               </>
//                             )}
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div className="space-y-1">
//                         <Label htmlFor="preferred_room_type" className="text-sm">Room Type</Label>
//                         <Select
//                           value={formData.preferred_room_type}
//                           onValueChange={(value) => handleSelectChange("preferred_room_type", value)}
//                           disabled={loadingMasters}
//                         >
//                           <SelectTrigger className="h-9 text-sm">
//                             <SelectValue placeholder={loadingMasters ? "Loading..." : "Select type"} />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="any" className="text-sm">Any</SelectItem>
//                             {loadingMasters ? (
//                               <div className="px-2 py-1.5 text-xs text-gray-500 flex items-center gap-1">
//                                 <Loader2 className="h-3 w-3 animate-spin" />
//                                 Loading...
//                               </div>
//                             ) : roomTypes.length > 0 ? (
//                               roomTypes.map((type) => (
//                                 <SelectItem key={type.id} value={type.name} className="text-sm">
//                                   {type.name}
//                                 </SelectItem>
//                               ))
//                             ) : (
//                               <>
//                                 <SelectItem value="AC" className="text-sm">AC</SelectItem>
//                                 <SelectItem value="Non-AC" className="text-sm">Non-AC</SelectItem>
//                                 <SelectItem value="Deluxe" className="text-sm">Deluxe</SelectItem>
//                                 <SelectItem value="Premium" className="text-sm">Premium</SelectItem>
//                               </>
//                             )}
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div className="space-y-1">
//                         <Label htmlFor="check_in_date" className="text-sm">Check-in Date</Label>
//                         <div className="relative">
//                           <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                           <Input
//                             id="check_in_date"
//                             type="date"
//                             value={formData.check_in_date}
//                             onChange={(e) => handleInputChange("check_in_date", e.target.value)}
//                             className="pl-10 h-9 text-sm"
//                             max={new Date().toISOString().split('T')[0]}
//                           />
//                         </div>
//                         {formData.check_in_date && (
//                           <p className="text-xs text-gray-500">
//                             Tenant move-in date
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Address Tab */}
//           <TabsContent value="address" className="space-y-4 mt-0">
//             <Card>
//               <CardHeader className="bg-purple-50 py-3">
//                 <CardTitle className="flex items-center gap-2 text-base">
//                   <MapPin className="h-4 w-4" />
//                   Address Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-4">
//                 <div className="space-y-3">
//                   <div className="space-y-1">
//                     <Label htmlFor="address" className="text-sm">
//                       <span className="text-red-500">*</span> Complete Address
//                     </Label>
//                     <Textarea
//                       id="address"
//                       value={formData.address}
//                       onChange={(e) => handleInputChange("address", e.target.value)}
//                       placeholder="House no, Building, Street, Area, Landmark"
//                       rows={2}
//                       className="text-sm min-h-16"
//                       required
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                     <div className="space-y-1">
//                       <Label htmlFor="city_id" className="text-sm">
//                         <span className="text-red-500">*</span> City
//                       </Label>
//                       <Select
//                         value={formData.city_id ? String(formData.city_id) : ""}
//                         onValueChange={(value) => {
//                           const selectedCity = cities.find(c => c.id === parseInt(value));
//                           handleSelectChange("city_id", value);
//                           handleSelectChange("city", selectedCity?.name || "");
//                         }}
//                         disabled={loadingMasters}
//                       >
//                         <SelectTrigger className="h-9 text-sm">
//                           <SelectValue placeholder={loadingMasters ? "Loading..." : "Select City"} />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {loadingMasters ? (
//                             <div className="px-2 py-1.5 text-xs text-gray-500 flex items-center gap-1">
//                               <Loader2 className="h-3 w-3 animate-spin" />
//                               Loading...
//                             </div>
//                           ) : cities.length > 0 ? (
//                             cities.map((city) => (
//                               <SelectItem key={city.id} value={String(city.id)} className="text-sm">
//                                 {city.name}
//                               </SelectItem>
//                             ))
//                           ) : (
//                             <div className="px-2 py-1.5 text-xs text-gray-500">
//                               No cities found
//                             </div>
//                           )}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-1">
//                       <Label htmlFor="state_id" className="text-sm">
//                         <span className="text-red-500">*</span> State
//                       </Label>
//                       <Select
//                         value={formData.state_id ? String(formData.state_id) : ""}
//                         onValueChange={(value) => {
//                           const selectedState = states.find(s => s.id === parseInt(value));
//                           handleSelectChange("state_id", value);
//                           handleSelectChange("state", selectedState?.name || "");
//                         }}
//                         disabled={loadingMasters}
//                       >
//                         <SelectTrigger className="h-9 text-sm">
//                           <SelectValue placeholder={loadingMasters ? "Loading..." : "Select State"} />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {loadingMasters ? (
//                             <div className="px-2 py-1.5 text-xs text-gray-500 flex items-center gap-1">
//                               <Loader2 className="h-3 w-3 animate-spin" />
//                               Loading...
//                             </div>
//                           ) : states.length > 0 ? (
//                             states.map((state) => (
//                               <SelectItem key={state.id} value={String(state.id)} className="text-sm">
//                                 {state.name}
//                               </SelectItem>
//                             ))
//                           ) : (
//                             <div className="px-2 py-1.5 text-xs text-gray-500">
//                               No states found
//                             </div>
//                           )}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-1">
//                       <Label htmlFor="pincode" className="text-sm">Pincode</Label>
//                       <Input
//                         id="pincode"
//                         value={formData.pincode}
//                         onChange={(e) => handleInputChange("pincode", e.target.value)}
//                         placeholder="6-digit pincode"
//                         maxLength={6}
//                         className="h-9 text-sm"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Property Tab */}
//           <TabsContent value="property" className="space-y-4 mt-0">
//             <Card>
//               <CardHeader className="bg-indigo-50 py-3">
//                 <CardTitle className="flex items-center gap-2 text-base">
//                   <Building className="h-4 w-4" />
//                   Property Assignment
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-4">
//                 <div className="space-y-3">
//                   <div className="space-y-1">
//                     <Label htmlFor="property_id" className="text-sm">Assigned Property</Label>
//                     <Select
//                       value={formData.property_id?.toString() || ""}
//                       onValueChange={(value) => handlePropertySelect(value ? parseInt(value) : undefined)}
//                     >
//                       <SelectTrigger className="h-9 text-sm">
//                         <SelectValue placeholder="Select property to assign" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {properties.map((property) => (
//                           <SelectItem key={property.value} value={property.value.toString()} className="text-sm">
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
//                     <p className="text-xs text-gray-500">
//                       This is the actual property where the tenant will be staying
//                     </p>
//                   </div>

//                   {/* Show property details if selected */}
//                   {selectedPropertyDetails && (
//                     <div className="border rounded p-3 bg-blue-50">
//                       <h4 className="font-medium mb-2 flex items-center gap-1 text-sm">
//                         <Building className="h-3.5 w-3.5" />
//                         Selected Property Details
//                       </h4>
//                       <div className="grid grid-cols-2 gap-3 text-xs">
//                         <div>
//                           <p className="text-gray-600">Property Name:</p>
//                           <p className="font-medium">{selectedPropertyDetails.name}</p>
//                         </div>
//                         <div>
//                           <p className="text-gray-600">Lock-in Period:</p>
//                           <p className="font-medium">{selectedPropertyDetails.lockin_period_months} months</p>
//                         </div>
//                         <div>
//                           <p className="text-gray-600">Lock-in Penalty:</p>
//                           <p className="font-medium flex items-center gap-1">
//                             {selectedPropertyDetails.lockin_penalty_type === 'percentage' ? (
//                               <>
//                                 <span>%</span>
//                                 <span>{selectedPropertyDetails.lockin_penalty_amount}</span>
//                               </>
//                             ) : (
//                               <>
//                                 <span>₹</span>
//                                 <span>{selectedPropertyDetails.lockin_penalty_amount}</span>
//                               </>
//                             )}
//                             <span className="text-gray-500 text-[10px]">({selectedPropertyDetails.lockin_penalty_type})</span>
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-gray-600">Notice Period:</p>
//                           <p className="font-medium">{selectedPropertyDetails.notice_period_days} days</p>
//                         </div>
//                         <div>
//                           <p className="text-gray-600">Notice Penalty:</p>
//                           <p className="font-medium flex items-center gap-1">
//                             {selectedPropertyDetails.notice_penalty_type === 'percentage' ? (
//                               <>
//                                 <span>%</span>
//                                 <span>{selectedPropertyDetails.notice_penalty_amount}</span>
//                               </>
//                             ) : (
//                               <>
//                                 <span>₹</span>
//                                 <span>{selectedPropertyDetails.notice_penalty_amount}</span>
//                               </>
//                             )}
//                             <span className="text-gray-500 text-[10px]">({selectedPropertyDetails.notice_penalty_type})</span>
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Terms Tab */}
//           <TabsContent value="terms" className="space-y-4 mt-0">
//             <Card>
//               <CardHeader className="bg-purple-50 py-3">
//                 <CardTitle className="flex items-center gap-2 text-base">
//                   <FileText className="h-4 w-4" />
//                   Rental Terms & Conditions
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-4">
//                 <Alert className="mb-4 bg-blue-50 border-blue-200 py-2">
//                   <AlertCircle className="h-4 w-4 text-blue-600" />
//                   <AlertDescription className="text-blue-800 text-sm">
//                     These terms will override the property's default terms for this specific tenant.
//                   </AlertDescription>
//                 </Alert>

//                 <div className="space-y-4">
//                   {/* Custom Terms Toggle */}
//                   <div className="flex items-center justify-between p-3 border rounded">
//                     <div>
//                       <Label className="font-medium text-sm">Use Custom Terms</Label>
//                       <p className="text-xs text-gray-500">
//                         Toggle to override property's default terms for this tenant
//                       </p>
//                     </div>
//                     <Switch
//                       checked={useCustomTerms}
//                       onCheckedChange={(checked) => {
//                         setUseCustomTerms(checked);
//                         if (!checked && selectedPropertyDetails) {
//                           setFormData((prev: any) => ({
//                             ...prev,
//                             lockin_period_months: selectedPropertyDetails.lockin_period_months || 0,
//                             lockin_penalty_amount: selectedPropertyDetails.lockin_penalty_amount || 0,
//                             lockin_penalty_type: selectedPropertyDetails.lockin_penalty_type || "fixed",
//                             notice_period_days: selectedPropertyDetails.notice_period_days || 0,
//                             notice_penalty_amount: selectedPropertyDetails.notice_penalty_amount || 0,
//                             notice_penalty_type: selectedPropertyDetails.notice_penalty_type || "fixed",
//                           }));
//                         } else if (checked && tenant) {
//                           setFormData((prev: any) => ({
//                             ...prev,
//                             lockin_period_months: tenant.lockin_period_months || selectedPropertyDetails?.lockin_period_months || 0,
//                             lockin_penalty_amount: tenant.lockin_penalty_amount || selectedPropertyDetails?.lockin_penalty_amount || 0,
//                             lockin_penalty_type: tenant.lockin_penalty_type || selectedPropertyDetails?.lockin_penalty_type || "fixed",
//                             notice_period_days: tenant.notice_period_days || selectedPropertyDetails?.notice_period_days || 0,
//                             notice_penalty_amount: tenant.notice_penalty_amount || selectedPropertyDetails?.notice_penalty_amount || 0,
//                             notice_penalty_type: tenant.notice_penalty_type || selectedPropertyDetails?.notice_penalty_type || "fixed",
//                           }));
//                         }
//                       }}
//                     />
//                   </div>

//                   {useCustomTerms || !selectedPropertyDetails ? (
//                     <div className="grid grid-cols-2 gap-4">
//                       {/* Lock-in Period Section */}
//                       <div className="space-y-3 border-2 border-blue-100 bg-blue-50/50 rounded p-3">
//                         <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm">
//                           <Calendar className="h-4 w-4 text-blue-600" />
//                           Custom Lock-in Period
//                         </h3>
//                         <div className="space-y-3">
//                           <div>
//                             <Label className="text-sm">Duration (months)</Label>
//                             <Input
//                               type="number"
//                               min="0"
//                               value={formData.lockin_period_months || ''}
//                               onChange={(e) => handleInputChange("lockin_period_months", parseInt(e.target.value) || 0)}
//                               placeholder="12"
//                               className="h-9 text-sm mt-1"
//                             />
//                           </div>

//                           <div className="space-y-1">
//                             <Label className="text-sm">Penalty Amount</Label>
//                             <div className="grid grid-cols-2 gap-2">
//                               <Input
//                                 type="number"
//                                 min="0"
//                                 value={formData.lockin_penalty_amount || ''}
//                                 onChange={(e) => handleInputChange("lockin_penalty_amount", parseFloat(e.target.value) || 0)}
//                                 placeholder="Amount"
//                                 className="h-9 text-sm"
//                               />
//                               <Select
//                                 value={formData.lockin_penalty_type}
//                                 onValueChange={(value) => handleSelectChange("lockin_penalty_type", value)}
//                               >
//                                 <SelectTrigger className="h-9 text-sm">
//                                   <SelectValue placeholder="Type" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="fixed" className="text-sm">Fixed Amount</SelectItem>
//                                   <SelectItem value="percentage" className="text-sm">Percentage</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Notice Period Section */}
//                       <div className="space-y-3 border-2 border-amber-100 bg-amber-50/50 rounded p-3">
//                         <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm">
//                           <Clock3 className="h-4 w-4 text-amber-600" />
//                           Custom Notice Period
//                         </h3>
//                         <div className="space-y-3">
//                           <div>
//                             <Label className="text-sm">Duration (days)</Label>
//                             <Input
//                               type="number"
//                               min="0"
//                               value={formData.notice_period_days || ''}
//                               onChange={(e) => handleInputChange("notice_period_days", parseInt(e.target.value) || 0)}
//                               placeholder="30"
//                               className="h-9 text-sm mt-1"
//                             />
//                           </div>

//                           <div className="space-y-1">
//                             <Label className="text-sm">Penalty Amount</Label>
//                             <div className="grid grid-cols-2 gap-2">
//                               <Input
//                                 type="number"
//                                 min="0"
//                                 value={formData.notice_penalty_amount || ''}
//                                 onChange={(e) => handleInputChange("notice_penalty_amount", parseFloat(e.target.value) || 0)}
//                                 placeholder="Amount"
//                                 className="h-9 text-sm"
//                               />
//                               <Select
//                                 value={formData.notice_penalty_type}
//                                 onValueChange={(value) => handleSelectChange("notice_penalty_type", value)}
//                               >
//                                 <SelectTrigger className="h-9 text-sm">
//                                   <SelectValue placeholder="Type" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="fixed" className="text-sm">Fixed Amount</SelectItem>
//                                   <SelectItem value="percentage" className="text-sm">Percentage</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="p-4 border-2 border-green-200 bg-green-50 rounded">
//                       <div className="flex items-center gap-2 mb-3">
//                         <Check className="h-5 w-5 text-green-600" />
//                         <h3 className="font-semibold text-green-800 text-sm">
//                           Using Property's Default Terms
//                         </h3>
//                       </div>
                      
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <h4 className="font-medium mb-1 text-sm">Lock-in Period</h4>
//                           <div className="space-y-1 text-xs">
//                             <p><span className="text-gray-600">Duration:</span> {formData.lockin_period_months} months</p>
//                             <p><span className="text-gray-600">Penalty:</span> 
//                               {formData.lockin_penalty_type === 'percentage' ? (
//                                 <span className="font-medium">%{formData.lockin_penalty_amount} ({formData.lockin_penalty_type})</span>
//                               ) : (
//                                 <span className="font-medium">₹{formData.lockin_penalty_amount} ({formData.lockin_penalty_type})</span>
//                               )}
//                             </p>
//                           </div>
//                         </div>

//                         <div>
//                           <h4 className="font-medium mb-1 text-sm">Notice Period</h4>
//                           <div className="space-y-1 text-xs">
//                             <p><span className="text-gray-600">Duration:</span> {formData.notice_period_days} days</p>
//                             <p><span className="text-gray-600">Penalty:</span> 
//                               {formData.notice_penalty_type === 'percentage' ? (
//                                 <span className="font-medium">%{formData.notice_penalty_amount} ({formData.notice_penalty_type})</span>
//                               ) : (
//                                 <span className="font-medium">₹{formData.notice_penalty_amount} ({formData.notice_penalty_type})</span>
//                               )}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Summary of Terms */}
//                   <div className="border rounded p-3 bg-gray-50">
//                     <h4 className="font-medium mb-2 text-sm">Terms Summary</h4>
//                     <div className="grid grid-cols-2 gap-3">
//                       <div>
//                         <p className="text-xs text-gray-600">Lock-in Period:</p>
//                         <p className="font-medium text-sm">{formData.lockin_period_months} months</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-600">Lock-in Penalty:</p>
//                         <p className="font-medium text-sm flex items-center gap-1">
//                           {formData.lockin_penalty_type === 'percentage' ? (
//                             <>
//                               <span>%</span>
//                               <span>{formData.lockin_penalty_amount}</span>
//                             </>
//                           ) : (
//                             <>
//                               <span>₹</span>
//                               <span>{formData.lockin_penalty_amount}</span>
//                             </>
//                           )}
//                           <span className="text-gray-500 text-[10px]">({formData.lockin_penalty_type})</span>
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-600">Notice Period:</p>
//                         <p className="font-medium text-sm">{formData.notice_period_days} days</p>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-600">Notice Penalty:</p>
//                         <p className="font-medium text-sm flex items-center gap-1">
//                           {formData.notice_penalty_type === 'percentage' ? (
//                             <>
//                               <span>%</span>
//                               <span>{formData.notice_penalty_amount}</span>
//                             </>
//                           ) : (
//                             <>
//                               <span>₹</span>
//                               <span>{formData.notice_penalty_amount}</span>
//                             </>
//                           )}
//                           <span className="text-gray-500 text-[10px]">({formData.notice_penalty_type})</span>
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Documents Tab */}
//           <TabsContent value="documents" className="space-y-4 mt-0">
//             <Card>
//               <CardHeader className="bg-amber-50 py-3">
//                 <CardTitle className="flex items-center gap-2 text-base">
//                   <FileText className="h-4 w-4" />
//                   Required Documents
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-4">
//                 <Alert className="mb-4 bg-blue-50 border-blue-200 py-2">
//                   <AlertCircle className="h-4 w-4 text-blue-600" />
//                   <AlertDescription className="text-blue-800 text-sm">
//                     All marked (*) documents are required. Max file size: 10MB per file.
//                     Supported formats: PDF, JPG, PNG, WebP, BMP.
//                   </AlertDescription>
//                 </Alert>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <FileUploadField
//                     label="ID Proof"
//                     file={idProofFile}
//                     setFile={setIdProofFile}
//                     existingUrl={existingFiles.id_proof_url}
//                     fieldName="id_proof_url"
//                     description="Aadhar Card, Passport, PAN Card, Driving License"
//                   />
                  
//                   <FileUploadField
//                     label="Address Proof"
//                     file={addressProofFile}
//                     setFile={setAddressProofFile}
//                     existingUrl={existingFiles.address_proof_url}
//                     fieldName="address_proof_url"
//                     description="Utility Bill, Bank Statement, Rental Agreement"
//                   />
                  
//                   <FileUploadField
//                     label="Photograph"
//                     file={photoFile}
//                     setFile={setPhotoFile}
//                     existingUrl={existingFiles.photo_url}
//                     fieldName="photo_url"
//                     accept=".jpg,.jpeg,.png,.webp,.bmp"
//                     description="Recent passport-size photo"
//                   />
//                 </div>

//                 {/* Additional Documents */}
//                 <Separator className="my-4" />
                
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <Label className="font-medium text-sm">Additional Documents (Optional)</Label>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       size="sm"
//                       className="h-8 text-xs"
//                       onClick={() => {
//                         const input = document.createElement('input');
//                         input.type = 'file';
//                         input.accept = ".pdf,.jpg,.jpeg,.png,.webp,.bmp,.doc,.docx";
//                         input.multiple = true;
//                         input.onchange = (e: any) => {
//                           const files = Array.from(e.target.files);
//                           if (files.length + additionalFiles.length > 5) {
//                             toast.error("Maximum 5 additional documents allowed");
//                             return;
//                           }
//                           setAdditionalFiles(prev => [...prev, ...files as File[]]);
//                         };
//                         input.click();
//                       }}
//                     >
//                       <Upload className="h-3.5 w-3.5 mr-1" />
//                       Add Files
//                     </Button>
//                   </div>
                  
//                   {/* Existing Additional Documents */}
//                   {additionalDocuments.length > 0 && (
//                     <div className="space-y-2">
//                       <h4 className="font-medium text-xs">Existing Documents:</h4>
//                       {additionalDocuments.map((doc, index) => (
//                         <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
//                           <div className="flex items-center gap-2">
//                             <FileText className="h-4 w-4 text-gray-500" />
//                             <div>
//                               <p className="font-medium">{doc.filename}</p>
//                               <p className="text-xs text-gray-500">
//                                 {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Previously uploaded'}
//                               </p>
//                               <a
//                                 href={doc.url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-xs text-blue-600 hover:underline"
//                               >
//                                 View Document
//                               </a>
//                             </div>
//                           </div>
//                           <Button
//                             type="button"
//                             variant="ghost"
//                             size="sm"
//                             className="h-7 w-7 p-0 text-red-600 hover:text-red-800"
//                             onClick={() => {
//                               setAdditionalDocuments(prev => prev.filter((_, i) => i !== index));
//                               toast.info("Document will be removed on save");
//                             }}
//                           >
//                             <X className="h-3.5 w-3.5" />
//                           </Button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
                  
//                   {/* New Additional Files */}
//                   {additionalFiles.length > 0 && (
//                     <div className="space-y-2">
//                       <h4 className="font-medium text-xs">New Files to Upload:</h4>
//                       {additionalFiles.map((file, index) => (
//                         <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
//                           <div className="flex items-center gap-2">
//                             <FileText className="h-4 w-4 text-gray-500" />
//                             <div>
//                               <p className="font-medium">{file.name}</p>
//                               <p className="text-xs text-gray-500">
//                                 {(file.size / 1024 / 1024).toFixed(2)} MB
//                               </p>
//                             </div>
//                           </div>
//                           <Button
//                             type="button"
//                             variant="ghost"
//                             size="sm"
//                             className="h-7 w-7 p-0 text-red-600 hover:text-red-800"
//                             onClick={() => {
//                               setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
//                             }}
//                           >
//                             <X className="h-3.5 w-3.5" />
//                           </Button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
                  
//                   <p className="text-xs text-gray-500">
//                     You can upload additional documents like company ID, college ID, reference letters, etc.
//                     Maximum 5 additional documents.
//                   </p>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Credentials Tab */}
//           <TabsContent value="credentials" className="space-y-4 mt-0">
//             <Card>
//               <CardHeader className="bg-emerald-50 py-3">
//                 <CardTitle className="flex items-center gap-2 text-base">
//                   <Key className="h-4 w-4" />
//                   Login Credentials
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="pt-4">
//                 <div className="space-y-4">
//                   {/* Current Credential Status */}
//                   {tenant?.has_credentials ? (
//                     <Alert className="bg-blue-50 border-blue-200 py-2">
//                       <div className="flex items-start gap-2">
//                         <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
//                         <div>
//                           <h4 className="font-medium text-blue-800 text-sm">Login Already Configured</h4>
//                           <p className="text-xs text-blue-700 mt-0.5">
//                             Tenant already has portal access. To reset password, set a new password below.
//                           </p>
//                           <div className="mt-2 space-y-0.5">
//                             <p className="text-xs">
//                               <span className="font-medium">Email:</span> {tenant.credential_email || tenant.email}
//                             </p>
//                             <p className="text-xs">
//                               <span className="font-medium">Status:</span>{" "}
//                               <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
//                                 Active
//                               </Badge>
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </Alert>
//                   ) : (
//                     <Alert className="bg-blue-50 border-blue-200 py-2">
//                       <div className="flex items-start gap-2">
//                         <Key className="h-4 w-4 text-blue-600 mt-0.5" />
//                         <div>
//                           <h4 className="font-medium text-blue-800 text-sm">Create Portal Access</h4>
//                           <p className="text-xs text-blue-700 mt-0.5">
//                             Set a password to enable tenant portal access.
//                           </p>
//                         </div>
//                       </div>
//                     </Alert>
//                   )}

//                   {/* Enable Credentials Toggle */}
//                   <div className="flex items-center justify-between p-3 border rounded">
//                     <div>
//                       <Label className="font-medium text-sm">Enable Portal Access</Label>
//                       <p className="text-xs text-gray-500">
//                         Allow tenant to access their portal with login credentials
//                       </p>
//                     </div>
//                     <Switch
//                       checked={createCredentials}
//                       onCheckedChange={(checked) => setCreateCredentials(checked)}
//                     />
//                   </div>

//                   {createCredentials && (
//                     <>
//                       <div className="space-y-3">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div className="space-y-2">
//                             <Label htmlFor="password" className="text-sm">
//                               <span className="text-red-500">*</span> Password
//                             </Label>
//                             <div className="relative">
//                               <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                               <Input
//                                 id="password"
//                                 type="password"
//                                 placeholder="Enter password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 className="pl-10 h-9 text-sm"
//                                 minLength={6}
//                                 required={createCredentials}
//                               />
//                             </div>
                            
//                             {/* Password Strength Meter */}
//                             {password.length > 0 && (
//                               <div className="space-y-1">
//                                 <div className="flex justify-between text-xs">
//                                   <span>Password Strength:</span>
//                                   <span className={
//                                     passwordStrength >= 75 ? "text-green-600" :
//                                     passwordStrength >= 50 ? "text-yellow-600" :
//                                     passwordStrength >= 25 ? "text-orange-600" : "text-red-600"
//                                   }>
//                                     {passwordStrength >= 75 ? "Strong" :
//                                      passwordStrength >= 50 ? "Good" :
//                                      passwordStrength >= 25 ? "Weak" : "Very Weak"}
//                                   </span>
//                                 </div>
//                                 <Progress 
//                                   value={passwordStrength} 
//                                   className="h-1.5 bg-gray-200 rounded-full"
//                                   style={{
//                                     '--progress-bar-color': passwordStrength >= 75 ? 'rgb(34,197,94)' :
//                                                              passwordStrength >= 50 ? 'rgb(234,179,8)' :
//                                                              passwordStrength >= 25 ? 'rgb(249,115,22)' :
//                                                              'rgb(239,68,68)'
//                                   } as React.CSSProperties}
//                                 />
//                               </div>
//                             )}
//                           </div>

//                           <div className="space-y-2">
//                             <Label htmlFor="confirmPassword" className="text-sm">
//                               <span className="text-red-500">*</span> Confirm Password
//                             </Label>
//                             <div className="relative">
//                               <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//                               <Input
//                                 id="confirmPassword"
//                                 type="password"
//                                 placeholder="Confirm password"
//                                 value={confirmPassword}
//                                 onChange={(e) => setConfirmPassword(e.target.value)}
//                                 className="pl-10 h-9 text-sm"
//                                 minLength={6}
//                                 required={createCredentials}
//                               />
//                             </div>
                            
//                             {password && confirmPassword && (
//                               <div className={`flex items-center gap-1 text-xs ${
//                                 password === confirmPassword ? "text-green-600" : "text-red-600"
//                               }`}>
//                                 {password === confirmPassword ? (
//                                   <>
//                                     <Check className="h-3.5 w-3.5" />
//                                     <span>Passwords match</span>
//                                   </>
//                                 ) : (
//                                   <>
//                                     <AlertTriangle className="h-3.5 w-3.5" />
//                                     <span>Passwords don't match</span>
//                                   </>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         {/* Password Requirements */}
//                         <div className="p-3 border rounded bg-gray-50">
//                           <Label className="font-medium mb-1 block text-sm">Password Requirements:</Label>
//                           <ul className="space-y-1 text-xs text-gray-600">
//                             <li className={`flex items-center gap-1 ${password.length >= 6 ? "text-green-600" : ""}`}>
//                               <div className={`h-1.5 w-1.5 rounded-full ${password.length >= 6 ? "bg-green-500" : "bg-gray-300"}`} />
//                               Minimum 6 characters
//                             </li>
//                             <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-green-600" : ""}`}>
//                               <div className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
//                               At least one uppercase letter
//                             </li>
//                             <li className={`flex items-center gap-1 ${/[0-9]/.test(password) ? "text-green-600" : ""}`}>
//                               <div className={`h-1.5 w-1.5 rounded-full ${/[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
//                               At least one number
//                             </li>
//                             <li className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}`}>
//                               <div className={`h-1.5 w-1.5 rounded-full ${/[^A-Za-z0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
//                               At least one special character
//                             </li>
//                           </ul>
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </div>
//       </Tabs>

//       {/* Form Actions - Navigation and Submit */}
//       <div className="flex items-center justify-between pt-4 border-t pb-4 p-4">
//         <div className="flex items-center gap-2">
//           <Button
//             type="button"
//             variant="outline"
//             size="sm"
//             onClick={goToPrevTab}
//             disabled={activeTab === tabs[0] || loading}
//             className="h-8 px-3 text-xs"
//           >
//             <ChevronLeft className="h-3.5 w-3.5 mr-1" />
//             Previous
//           </Button>
          
//           <div className="flex items-center gap-1 mx-2">
//             {tabs.map((tab) => (
//               <div
//                 key={tab}
//                 className={`h-1.5 w-6 rounded-full transition-colors ${
//                   activeTab === tab ? "bg-blue-600" : "bg-gray-300"
//                 }`}
//               />
//             ))}
//           </div>

//           {activeTab !== tabs[tabs.length - 1] ? (
//             <Button
//               type="button"
//               variant="outline"
//               size="sm"
//               onClick={goToNextTab}
//               className="h-8 px-3 text-xs"
//             >
//               Next
//               <ChevronRight className="h-3.5 w-3.5 ml-1" />
//             </Button>
//           ) : (
//             <div className="w-[70px]" /> // Spacer for alignment
//           )}
//         </div>
        
//         {/* Show submit button only on the last tab */}
//         {activeTab === tabs[tabs.length - 1] && (
//           <Button 
//             type="submit" 
//             disabled={loading}
//             className="min-w-[100px] h-8 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
//                 {uploadProgress > 0 ? "Uploading..." : "Saving..."}
//               </>
//             ) : tenant ? "Update Tenant" : "Create Tenant"}
//           </Button>
//         )}
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
  EyeOff,
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
  Clock3,
  ChevronLeft,
  ChevronRight
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
  getPropertyDetails,
  type Tenant,
  type PreferredOptions,
  type OptionType,
  getPreferredOptions,
} from "@/lib/tenantApi";
import { consumeMasters } from "@/lib/masterApi";

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

interface MasterValue {
  id: number;
  name: string;
  isactive: number;
}

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
  const [activeTab, setActiveTab] = useState("basic");
  
  // Master data states
  const [commonMasters, setCommonMasters] = useState<Record<string, MasterValue[]>>({});
  const [roomsMasters, setRoomsMasters] = useState<Record<string, MasterValue[]>>({});
  const [loadingMasters, setLoadingMasters] = useState(false);
  
  // Derived options from masters
  const [cities, setCities] = useState<MasterValue[]>([]);
  const [states, setStates] = useState<MasterValue[]>([]);
  const [sharingTypes, setSharingTypes] = useState<MasterValue[]>([]);
  const [roomTypes, setRoomTypes] = useState<MasterValue[]>([]);
  const [occupations, setOccupations] = useState<MasterValue[]>([]);
  
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
  const [existingPassword, setExistingPassword] = useState("••••••••");
  const [showExistingPassword, setShowExistingPassword] = useState(false);
  
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
    city_id: tenant?.city_id || "",
    city: tenant?.city || "",
    state_id: tenant?.state_id || "",
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
    lockin_period_months: tenant?.lockin_period_months !== undefined ? tenant.lockin_period_months : 0,
    lockin_penalty_amount: tenant?.lockin_penalty_amount !== undefined ? tenant.lockin_penalty_amount : 0,
    lockin_penalty_type: tenant?.lockin_penalty_type || "fixed",
    notice_period_days: tenant?.notice_period_days !== undefined ? tenant.notice_period_days : 0,
    notice_penalty_amount: tenant?.notice_penalty_amount !== undefined ? tenant.notice_penalty_amount : 0,
    notice_penalty_type: tenant?.notice_penalty_type || "fixed",
    property_id: tenant?.property_id || undefined,
  });

  const tabs = ["basic", "occupation", "address", "property", "terms", "documents", "credentials"];

  const goToNextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const goToPrevTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Fetch masters and properties when form opens
  useEffect(() => {
    fetchMasters();
    fetchProperties();
  }, []);

  // Initialize with tenant data
  useEffect(() => {
    loadOptions();
    if (tenant?.id) {
      loadExistingDocuments();
      if (tenant.additional_documents) {
        setAdditionalDocuments(tenant.additional_documents);
      }
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

  useEffect(() => {
    if (formData.property_id && !useCustomTerms) {
      fetchPropertyDetails(formData.property_id);
    } else {
      setSelectedPropertyDetails(null);
    }
  }, [formData.property_id, useCustomTerms]);

  useEffect(() => {
    if (tenant?.id) {
      const hasCustomTerms = 
        (tenant.lockin_period_months !== null && tenant.lockin_period_months !== undefined) ||
        (tenant.lockin_penalty_amount !== null && tenant.lockin_penalty_amount !== undefined) ||
        (tenant.notice_period_days !== null && tenant.notice_period_days !== undefined) ||
        (tenant.notice_penalty_amount !== null && tenant.notice_penalty_amount !== undefined);
      
      setUseCustomTerms(hasCustomTerms);
      
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
      setUseCustomTerms(false);
    }
  }, [tenant]);

  // Update cities and states from masters
  useEffect(() => {
    if (commonMasters["Cities"]) {
      setCities(commonMasters["Cities"]);
    }
    if (commonMasters["States"]) {
      setStates(commonMasters["States"]);
    }
  }, [commonMasters]);

  // Update sharing types and room types from rooms masters
  useEffect(() => {
    if (roomsMasters["Sharing Type"]) {
      setSharingTypes(roomsMasters["Sharing Type"]);
    }
    if (roomsMasters["Room Type"]) {
      setRoomTypes(roomsMasters["Room Type"]);
    }
    if (roomsMasters["Occupation"]) {
      setOccupations(roomsMasters["Occupation"]);
    }
  }, [roomsMasters]);

  // When masters load and we have a tenant, set the city and state IDs
  useEffect(() => {
    if (tenant?.id && cities.length > 0 && states.length > 0) {
      // Find city ID from city name
      if (tenant.city && !tenant.city_id) {
        const matchingCity = cities.find(
          c => c.name.toLowerCase() === tenant.city?.toLowerCase()
        );
        if (matchingCity) {
          setFormData((prev: any) => ({
            ...prev,
            city_id: String(matchingCity.id)
          }));
        }
      }
      
      // Find state ID from state name
      if (tenant.state && !tenant.state_id) {
        const matchingState = states.find(
          s => s.name.toLowerCase() === tenant.state?.toLowerCase()
        );
        if (matchingState) {
          setFormData((prev: any) => ({
            ...prev,
            state_id: String(matchingState.id)
          }));
        }
      }
    }
  }, [cities, states, tenant]);

  const fetchMasters = async () => {
    setLoadingMasters(true);
    try {
      // Fetch both Common and Rooms masters in parallel
      const [commonRes, roomsRes] = await Promise.all([
        consumeMasters({ tab: "Common" }),
        consumeMasters({ tab: "Rooms" })
      ]);

      // Process Common masters
      if (commonRes?.success && commonRes.data) {
        const grouped: Record<string, MasterValue[]> = {};
        commonRes.data.forEach((item: any) => {
          const type = item.type_name;
          if (!grouped[type]) {
            grouped[type] = [];
          }
          grouped[type].push({
            id: item.value_id,
            name: item.value_name,
            isactive: 1,
          });
        });
        setCommonMasters(grouped);
      }

      // Process Rooms masters
      if (roomsRes?.success && roomsRes.data) {
        const grouped: Record<string, MasterValue[]> = {};
        roomsRes.data.forEach((item: any) => {
          const type = item.type_name;
          if (!grouped[type]) {
            grouped[type] = [];
          }
          grouped[type].push({
            id: item.value_id,
            name: item.value_name,
            isactive: 1,
          });
        });
        setRoomsMasters(grouped);
      }
    } catch (error) {
      console.error("Failed to fetch masters:", error);
      toast.error("Failed to load master data");
    } finally {
      setLoadingMasters(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const propertiesResult = await getAllProperties();
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
    } catch (err) {
      console.error("Failed to fetch properties", err);
      toast.error("Failed to load properties");
    }
  };

  const fetchPropertyDetails = async (propertyId: number) => {
    try {
      const res: any = await getPropertyDetails(propertyId);
      
      if (res.success && res.data) {
        setSelectedPropertyDetails(res.data);
        
        const isEditingExistingTenant = tenant?.id !== undefined;
        const tenantHasCustomValues = 
          tenant?.lockin_period_months !== null || 
          tenant?.notice_period_days !== null ||
          tenant?.lockin_penalty_amount !== null ||
          tenant?.notice_penalty_amount !== null;
        
        if (!isEditingExistingTenant || (!tenantHasCustomValues && !useCustomTerms)) {
          setFormData((prev: any) => ({
            ...prev,
            lockin_period_months: res.data.lockin_period_months || prev.lockin_period_months,
            lockin_penalty_amount: res.data.lockin_penalty_amount || prev.lockin_penalty_amount,
            lockin_penalty_type: res.data.lockin_penalty_type || prev.lockin_penalty_type,
            notice_period_days: res.data.notice_period_days || prev.notice_period_days,
            notice_penalty_amount: res.data.notice_penalty_amount || prev.notice_penalty_amount,
            notice_penalty_type: res.data.notice_penalty_type || prev.notice_penalty_type,
          }));
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch property details", err);
    }
  };

  const handlePropertySelect = (propertyId: number | undefined) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      property_id: propertyId 
    }));
    
    if (!tenant) {
      setUseCustomTerms(false);
    }
  };

  const loadOptions = async () => {
    try {
      // Load preferred options
      const preferredResult = await getPreferredOptions();

      if (preferredResult.success && preferredResult.data) {
        const data = preferredResult.data;
        setOptions(prev => ({
          ...prev,
          ...data,
          genderOptions: data.genderOptions || ['Male', 'Female', 'Other'],
          countryCodes: data.countryCodes || ['+91', '+1', '+44', '+61', '+65']
        }));
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
          if (res.data.additional_documents && Array.isArray(res.data.additional_documents)) {
            setAdditionalDocuments(res.data.additional_documents);
          }
          
          // Update form data with the latest from API
          setFormData((prev: any) => ({
            ...prev,
            city_id: res.data.city_id || prev.city_id,
            city: res.data.city || prev.city,
            state_id: res.data.state_id || prev.state_id,
            state: res.data.state || prev.state,
          }));
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
    
    if (!formData.city_id && !formData.city) {
      toast.error("City is required");
      setActiveTab("address");
      return false;
    }
    
    if (!formData.state_id && !formData.state) {
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

    // Credential validations
    if (!tenant?.id) {
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
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setUploadProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      const formDataToSend = new FormData();
      
      // Append tenant data
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof typeof formData];
        if (value !== undefined && value !== null && value !== '') {
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
      if (createCredentials) {
        if (tenant?.id) {
          if (password && password.trim() !== '') {
            formDataToSend.append('update_credentials', 'true');
            formDataToSend.append('password', password);
          }
        } else {
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
      
      let result: any;
      if (tenant?.id) {
        result = await updateTenant(tenant.id, formDataToSend);
      } else {
        result = await createTenant(formDataToSend);
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.success) {
        const successMessage = tenant ? "Tenant updated successfully" : "Tenant created successfully";
        toast.success(successMessage);
        
        if (result.additional_documents) {
          setAdditionalDocuments(result.additional_documents);
        }
        
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
              onError={(e: any) => {
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Progress Bar - made smaller */}
      {loading && uploadProgress > 0 && (
        <div className="px-4 pt-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
       <div className="px-4 pt-2">
  <TabsList className="grid grid-cols-7 h-12 sm:h-10">

    <TabsTrigger
      value="basic"
      className="flex flex-col sm:flex-row items-center justify-center gap-1 px-1 sm:px-2"
    >
      <User className="h-4 w-4 sm:h-4 sm:w-4" />
      <span className="text-[10px] sm:text-xs">Basic</span>
    </TabsTrigger>

    <TabsTrigger
      value="occupation"
      className="flex flex-col sm:flex-row items-center justify-center gap-1 px-1 sm:px-2"
    >
      <Briefcase className="h-4 w-4 sm:h-4 sm:w-4" />
      <span className="text-[10px] sm:text-xs">Work</span>
    </TabsTrigger>

    <TabsTrigger
      value="address"
      className="flex flex-col sm:flex-row items-center justify-center gap-1 px-1 sm:px-2"
    >
      <MapPin className="h-4 w-4 sm:h-4 sm:w-4" />
      <span className="text-[10px] sm:text-xs">Address</span>
    </TabsTrigger>

    <TabsTrigger
      value="property"
      className="flex flex-col sm:flex-row items-center justify-center gap-1 px-1 sm:px-2"
    >
      <Building className="h-4 w-4 sm:h-4 sm:w-4" />
      <span className="text-[10px] sm:text-xs">Prop</span>
    </TabsTrigger>

    <TabsTrigger
      value="terms"
      className="flex flex-col sm:flex-row items-center justify-center gap-1 px-1 sm:px-2"
    >
      <FileText className="h-4 w-4 sm:h-4 sm:w-4" />
      <span className="text-[10px] sm:text-xs">Terms</span>
    </TabsTrigger>

    <TabsTrigger
      value="documents"
      className="flex flex-col sm:flex-row items-center justify-center gap-1 px-1 sm:px-2"
    >
      <FileText className="h-4 w-4 sm:h-4 sm:w-4" />
      <span className="text-[10px] sm:text-xs">Docs</span>
    </TabsTrigger>

    <TabsTrigger
      value="credentials"
      className="flex flex-col sm:flex-row items-center justify-center gap-1 px-1 sm:px-2"
    >
      <Key className="h-4 w-4 sm:h-4 sm:w-4" />
      <span className="text-[10px] sm:text-xs">Login</span>
    </TabsTrigger>

  </TabsList>
</div>

        {/* Scrollable content area with fixed height */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3">
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="bg-blue-50 py-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
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
                        <Label htmlFor="salutation" className="text-xs sm:text-sm">Salutation</Label>
                        <Select
                          value={formData.salutation}
                          onValueChange={(value) => handleSelectChange("salutation", value)}
                        >
                          <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                            <SelectValue placeholder="Title" />
                          </SelectTrigger>
                          <SelectContent>
                            {["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof"].map((title) => (
                              <SelectItem key={title} value={title} className="text-xs sm:text-sm">
                                {title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 col-span-3">
                        <Label htmlFor="full_name" className="text-xs sm:text-sm">
                          <span className="text-red-500">*</span> Full Name
                        </Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange("full_name", e.target.value)}
                          placeholder="Enter full name"
                          required
                          className="h-8 sm:h-9 text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs sm:text-sm">
                        <span className="text-red-500">*</span> Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="example@email.com"
                        required
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs sm:text-sm">
                        <span className="text-red-500">*</span> Phone Number
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.country_code}
                          onValueChange={(value) => handleInputChange("country_code", value)}
                        >
                          <SelectTrigger className="w-[100px] sm:w-[120px] h-8 sm:h-9 text-xs sm:text-sm">
                            <SelectValue placeholder="+91" />
                          </SelectTrigger>
                          <SelectContent>
                            {options.countryCodes.map((code) => (
                              <SelectItem key={code} value={code} className="text-xs sm:text-sm">
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
                          className="h-8 sm:h-9 text-xs sm:text-sm"
                        />
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        10-digit Indian mobile number starting with 6-9
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="date_of_birth" className="text-xs sm:text-sm">Date of Birth</Label>
                        <div className="relative">
                          <Calendar className="absolute left-2 top-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                            className="pl-8 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm"
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        {formData.date_of_birth && (
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            Must be at least 18 years old
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="gender" className="text-xs sm:text-sm">
                        <span className="text-red-500">*</span> Gender
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleSelectChange("gender", value)}
                      >
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.genderOptions.map((option) => (
                            <SelectItem key={option} value={option} className="text-xs sm:text-sm">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs sm:text-sm">Emergency Contact</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Name"
                          value={formData.emergency_contact_name}
                          onChange={(e) => handleInputChange("emergency_contact_name", e.target.value)}
                          className="h-8 sm:h-9 text-xs sm:text-sm"
                        />
                        <Input
                          placeholder="Phone"
                          value={formData.emergency_contact_phone}
                          onChange={(e) => handleInputChange("emergency_contact_phone", e.target.value)}
                          className="h-8 sm:h-9 text-xs sm:text-sm"
                          pattern="[6-9][0-9]{9}"
                          maxLength={10}
                        />
                      </div>
                      <Select
                        value={formData.emergency_contact_relation}
                        onValueChange={(value) => handleSelectChange("emergency_contact_relation", value)}
                      >
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Relation" />
                        </SelectTrigger>
                        <SelectContent>
                          {emergencyRelations.map((relation) => (
                            <SelectItem key={relation} value={relation} className="text-xs sm:text-sm">
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
                        <Label htmlFor="is_active" className="cursor-pointer text-xs sm:text-sm">
                          Active Tenant
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Occupation Tab */}
          <TabsContent value="occupation" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="bg-green-50 py-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Briefcase className="h-4 w-4" />
                  Occupation & Room Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="occupation_category" className="text-xs sm:text-sm">Occupation Category</Label>
                      <Select
                        value={formData.occupation_category}
                        onValueChange={(value) => handleSelectChange("occupation_category", value)}
                      >
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any" className="text-xs sm:text-sm">Any</SelectItem>
                          {occupationCategories.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                              <span className="mr-2">{option.icon}</span>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="exact_occupation" className="text-xs sm:text-sm">
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
                        className="text-xs sm:text-sm min-h-16"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="occupation" className="text-xs sm:text-sm">Additional Details</Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => handleInputChange("occupation", e.target.value)}
                        placeholder="Any additional occupation information"
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="preferred_property_id" className="text-xs sm:text-sm">Preferred Property</Label>
                      <Select
                        value={formData.preferred_property_id?.toString() || ""}
                        onValueChange={(value) => {
                          const val = value ? parseInt(value) : undefined;
                          setFormData((prev: any) => ({ ...prev, preferred_property_id: val }));
                        }}
                      >
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className="text-xs sm:text-sm">None</SelectItem>
                          {properties.map((property) => (
                            <SelectItem key={property.value} value={property.value.toString()} className="text-xs sm:text-sm">
                              <div className="flex flex-col">
                                <span className="font-medium">{property.label}</span>
                                <span className="text-[10px] sm:text-xs text-gray-500">
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
                        <Label className="text-xs sm:text-sm">Available Rooms ({availableRooms.length} found)</Label>
                        <div className="max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
                          {availableRooms.map((room) => (
                            <div
                              key={room.id}
                              className="p-2 mb-2 border rounded hover:bg-white cursor-pointer transition-colors"
                              onClick={() => {
                                handleSelectChange("preferred_sharing", room.sharing_type);
                                handleSelectChange("preferred_room_type", room.room_type);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-1">
                                    <Building className="h-3.5 w-3.5 text-blue-600" />
                                    <span className="font-medium text-xs sm:text-sm">Room {room.room_number}</span>
                                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                                      {room.sharing_type}
                                    </Badge>
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                                    {room.room_type} • Floor {room.floor || "G"} • 
                                    {(room.available_beds || (room.total_bed - room.occupied_beds))} bed(s) available
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-green-50 text-green-700 text-[10px] sm:text-xs">
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
                        <Label htmlFor="preferred_sharing" className="text-xs sm:text-sm">Preferred Sharing</Label>
                        <Select
                          value={formData.preferred_sharing}
                          onValueChange={(value) => handleSelectChange("preferred_sharing", value)}
                          disabled={loadingMasters}
                        >
                          <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                            <SelectValue placeholder={loadingMasters ? "Loading..." : "Select sharing"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any" className="text-xs sm:text-sm">Any</SelectItem>
                            {loadingMasters ? (
                              <div className="px-2 py-1.5 text-xs text-gray-500 flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Loading...
                              </div>
                            ) : sharingTypes.length > 0 ? (
                              sharingTypes.map((type) => (
                                <SelectItem key={type.id} value={type.name.toLowerCase()} className="text-xs sm:text-sm">
                                  {type.name}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="single" className="text-xs sm:text-sm">Single Sharing</SelectItem>
                                <SelectItem value="double" className="text-xs sm:text-sm">Double Sharing</SelectItem>
                                <SelectItem value="triple" className="text-xs sm:text-sm">Triple Sharing</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="preferred_room_type" className="text-xs sm:text-sm">Room Type</Label>
                        <Select
                          value={formData.preferred_room_type}
                          onValueChange={(value) => handleSelectChange("preferred_room_type", value)}
                          disabled={loadingMasters}
                        >
                          <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                            <SelectValue placeholder={loadingMasters ? "Loading..." : "Select type"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any" className="text-xs sm:text-sm">Any</SelectItem>
                            {loadingMasters ? (
                              <div className="px-2 py-1.5 text-xs text-gray-500 flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Loading...
                              </div>
                            ) : roomTypes.length > 0 ? (
                              roomTypes.map((type) => (
                                <SelectItem key={type.id} value={type.name} className="text-xs sm:text-sm">
                                  {type.name}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="AC" className="text-xs sm:text-sm">AC</SelectItem>
                                <SelectItem value="Non-AC" className="text-xs sm:text-sm">Non-AC</SelectItem>
                                <SelectItem value="Deluxe" className="text-xs sm:text-sm">Deluxe</SelectItem>
                                <SelectItem value="Premium" className="text-xs sm:text-sm">Premium</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="check_in_date" className="text-xs sm:text-sm">Check-in Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-2 top-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                          <Input
                            id="check_in_date"
                            type="date"
                            value={formData.check_in_date}
                            onChange={(e) => handleInputChange("check_in_date", e.target.value)}
                            className="pl-8 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm"
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        {formData.check_in_date && (
                          <p className="text-[10px] sm:text-xs text-gray-500">
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

          {/* Address Tab */}
          <TabsContent value="address" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="bg-purple-50 py-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="h-4 w-4" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="address" className="text-xs sm:text-sm">
                      <span className="text-red-500">*</span> Complete Address
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="House no, Building, Street, Area, Landmark"
                      rows={2}
                      className="text-xs sm:text-sm min-h-16"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="city_id" className="text-xs sm:text-sm">
                        <span className="text-red-500">*</span> City
                      </Label>
                      <Select
                        value={formData.city_id ? String(formData.city_id) : ""}
                        onValueChange={(value) => {
                          const selectedCity = cities.find(c => c.id === parseInt(value));
                          handleSelectChange("city_id", value);
                          handleSelectChange("city", selectedCity?.name || "");
                        }}
                        disabled={loadingMasters}
                      >
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder={loadingMasters ? "Loading..." : "Select City"} />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingMasters ? (
                            <div className="px-2 py-1.5 text-xs text-gray-500 flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Loading...
                            </div>
                          ) : cities.length > 0 ? (
                            cities.map((city) => (
                              <SelectItem key={city.id} value={String(city.id)} className="text-xs sm:text-sm">
                                {city.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-xs text-gray-500">
                              No cities found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="state_id" className="text-xs sm:text-sm">
                        <span className="text-red-500">*</span> State
                      </Label>
                      <Select
                        value={formData.state_id ? String(formData.state_id) : ""}
                        onValueChange={(value) => {
                          const selectedState = states.find(s => s.id === parseInt(value));
                          handleSelectChange("state_id", value);
                          handleSelectChange("state", selectedState?.name || "");
                        }}
                        disabled={loadingMasters}
                      >
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder={loadingMasters ? "Loading..." : "Select State"} />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingMasters ? (
                            <div className="px-2 py-1.5 text-xs text-gray-500 flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Loading...
                            </div>
                          ) : states.length > 0 ? (
                            states.map((state) => (
                              <SelectItem key={state.id} value={String(state.id)} className="text-xs sm:text-sm">
                                {state.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-xs text-gray-500">
                              No states found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="pincode" className="text-xs sm:text-sm">Pincode</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Property Tab */}
          <TabsContent value="property" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="bg-indigo-50 py-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Building className="h-4 w-4" />
                  Property Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="property_id" className="text-xs sm:text-sm">Assigned Property</Label>
                    <Select
                      value={formData.property_id?.toString() || ""}
                      onValueChange={(value) => handlePropertySelect(value ? parseInt(value) : undefined)}
                    >
                      <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                        <SelectValue placeholder="Select property to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.value} value={property.value.toString()} className="text-xs sm:text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium">{property.label}</span>
                              <span className="text-[10px] sm:text-xs text-gray-500">
                                {property.address}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      This is the actual property where the tenant will be staying
                    </p>
                  </div>

                  {/* Show property details if selected */}
                  {selectedPropertyDetails && (
                    <div className="border rounded p-3 bg-blue-50">
                      <h4 className="font-medium mb-2 flex items-center gap-1 text-xs sm:text-sm">
                        <Building className="h-3.5 w-3.5" />
                        Selected Property Details
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-[10px] sm:text-xs">
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
                            <span className="text-gray-500 text-[8px] sm:text-[10px]">({selectedPropertyDetails.lockin_penalty_type})</span>
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
                            <span className="text-gray-500 text-[8px] sm:text-[10px]">({selectedPropertyDetails.notice_penalty_type})</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms Tab */}
          <TabsContent value="terms" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="bg-purple-50 py-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="h-4 w-4" />
                  Rental Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Alert className="mb-4 bg-blue-50 border-blue-200 py-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-xs sm:text-sm">
                    These terms will override the property's default terms for this specific tenant.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {/* Custom Terms Toggle */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <Label className="font-medium text-xs sm:text-sm">Use Custom Terms</Label>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        Toggle to override property's default terms for this tenant
                      </p>
                    </div>
                    <Switch
                      checked={useCustomTerms}
                      onCheckedChange={(checked) => {
                        setUseCustomTerms(checked);
                        if (!checked && selectedPropertyDetails) {
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
                        <h3 className="font-semibold flex items-center gap-2 mb-2 text-xs sm:text-sm">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          Custom Lock-in Period
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs sm:text-sm">Duration (months)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={formData.lockin_period_months || ''}
                              onChange={(e) => handleInputChange("lockin_period_months", parseInt(e.target.value) || 0)}
                              placeholder="12"
                              className="h-8 sm:h-9 text-xs sm:text-sm mt-1"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs sm:text-sm">Penalty Amount</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={formData.lockin_penalty_amount || ''}
                                onChange={(e) => handleInputChange("lockin_penalty_amount", parseFloat(e.target.value) || 0)}
                                placeholder="Amount"
                                className="h-8 sm:h-9 text-xs sm:text-sm"
                              />
                              <Select
                                value={formData.lockin_penalty_type}
                                onValueChange={(value) => handleSelectChange("lockin_penalty_type", value)}
                              >
                                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fixed" className="text-xs sm:text-sm">Fixed Amount</SelectItem>
                                  <SelectItem value="percentage" className="text-xs sm:text-sm">Percentage</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notice Period Section */}
                      <div className="space-y-3 border-2 border-amber-100 bg-amber-50/50 rounded p-3">
                        <h3 className="font-semibold flex items-center gap-2 mb-2 text-xs sm:text-sm">
                          <Clock3 className="h-4 w-4 text-amber-600" />
                          Custom Notice Period
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs sm:text-sm">Duration (days)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={formData.notice_period_days || ''}
                              onChange={(e) => handleInputChange("notice_period_days", parseInt(e.target.value) || 0)}
                              placeholder="30"
                              className="h-8 sm:h-9 text-xs sm:text-sm mt-1"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs sm:text-sm">Penalty Amount</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={formData.notice_penalty_amount || ''}
                                onChange={(e) => handleInputChange("notice_penalty_amount", parseFloat(e.target.value) || 0)}
                                placeholder="Amount"
                                className="h-8 sm:h-9 text-xs sm:text-sm"
                              />
                              <Select
                                value={formData.notice_penalty_type}
                                onValueChange={(value) => handleSelectChange("notice_penalty_type", value)}
                              >
                                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fixed" className="text-xs sm:text-sm">Fixed Amount</SelectItem>
                                  <SelectItem value="percentage" className="text-xs sm:text-sm">Percentage</SelectItem>
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
                        <h3 className="font-semibold text-green-800 text-xs sm:text-sm">
                          Using Property's Default Terms
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-1 text-xs sm:text-sm">Lock-in Period</h4>
                          <div className="space-y-1 text-[10px] sm:text-xs">
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
                          <h4 className="font-medium mb-1 text-xs sm:text-sm">Notice Period</h4>
                          <div className="space-y-1 text-[10px] sm:text-xs">
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
                    <h4 className="font-medium mb-2 text-xs sm:text-sm">Terms Summary</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-600">Lock-in Period:</p>
                        <p className="font-medium text-xs sm:text-sm">{formData.lockin_period_months} months</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-600">Lock-in Penalty:</p>
                        <p className="font-medium text-xs sm:text-sm flex items-center gap-1">
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
                          <span className="text-gray-500 text-[8px] sm:text-[10px]">({formData.lockin_penalty_type})</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-600">Notice Period:</p>
                        <p className="font-medium text-xs sm:text-sm">{formData.notice_period_days} days</p>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-600">Notice Penalty:</p>
                        <p className="font-medium text-xs sm:text-sm flex items-center gap-1">
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
                          <span className="text-gray-500 text-[8px] sm:text-[10px]">({formData.notice_penalty_type})</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="bg-amber-50 py-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="h-4 w-4" />
                  Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Alert className="mb-4 bg-blue-50 border-blue-200 py-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-xs sm:text-sm">
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
                    <Label className="font-medium text-xs sm:text-sm">Additional Documents (Optional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 sm:h-8 text-[10px] sm:text-xs"
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
                      <h4 className="font-medium text-[10px] sm:text-xs">Existing Documents:</h4>
                      {additionalDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-xs sm:text-sm">{doc.filename}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500">
                                {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Previously uploaded'}
                              </p>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] sm:text-xs text-blue-600 hover:underline"
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
                      <h4 className="font-medium text-[10px] sm:text-xs">New Files to Upload:</h4>
                      {additionalFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-xs sm:text-sm">{file.name}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500">
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
                  
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    You can upload additional documents like company ID, college ID, reference letters, etc.
                    Maximum 5 additional documents.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="bg-emerald-50 py-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
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
                          <h4 className="font-medium text-blue-800 text-xs sm:text-sm">Login Already Configured</h4>
                          <p className="text-[10px] sm:text-xs text-blue-700 mt-0.5">
                            Tenant already has portal access. To reset password, set a new password below.
                          </p>
                          <div className="mt-2 space-y-0.5">
                            <p className="text-[10px] sm:text-xs">
                              <span className="font-medium">Email:</span> {tenant.credential_email || tenant.email}
                            </p>
                            <p className="text-[10px] sm:text-xs">
                              <span className="font-medium">Status:</span>{" "}
                              <Badge variant="outline" className="bg-green-100 text-green-800 text-[10px] sm:text-xs">
                                Active
                              </Badge>
                            </p>
                            {/* Show existing password with eye toggle */}
                            <div className="mt-2">
                              <p className="text-[10px] sm:text-xs font-medium">Current Password:</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="relative flex-1 max-w-[200px]">
                                  <Input
                                    type={showExistingPassword ? "text" : "password"}
                                    value={existingPassword}
                                    readOnly
                                    disabled
                                    className="h-8 sm:h-9 text-xs sm:text-sm bg-gray-50 pr-8"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowExistingPassword(!showExistingPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                  >
                                    {showExistingPassword ? (
                                      <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    ) : (
                                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ) : (
                    <Alert className="bg-blue-50 border-blue-200 py-2">
                      <div className="flex items-start gap-2">
                        <Key className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800 text-xs sm:text-sm">Create Portal Access</h4>
                          <p className="text-[10px] sm:text-xs text-blue-700 mt-0.5">
                            Set a password to enable tenant portal access.
                          </p>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {/* Enable Credentials Toggle */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <Label className="font-medium text-xs sm:text-sm">Enable Portal Access</Label>
                      <p className="text-[10px] sm:text-xs text-gray-500">
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
                            <Label htmlFor="password" className="text-xs sm:text-sm">
                              {tenant?.has_credentials ? "New Password (leave blank to keep current)" : "Password"} 
                              {tenant?.has_credentials ? "" : " *"}
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                              <Input
                                id="password"
                                type="password"
                                placeholder={tenant?.has_credentials ? "Enter new password to change" : "Enter password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-8 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm"
                                minLength={6}
                              />
                            </div>
                            
                            {/* Password Strength Meter */}
                            {password.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] sm:text-xs">
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
                                <Progress 
                                  value={passwordStrength} 
                                  className="h-1.5 bg-gray-200 rounded-full"
                                  style={{
                                    '--progress-bar-color': passwordStrength >= 75 ? 'rgb(34,197,94)' :
                                                             passwordStrength >= 50 ? 'rgb(234,179,8)' :
                                                             passwordStrength >= 25 ? 'rgb(249,115,22)' :
                                                             'rgb(239,68,68)'
                                  } as React.CSSProperties}
                                />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">
                              Confirm Password
                              {tenant?.has_credentials && password ? " *" : !tenant?.has_credentials && createCredentials ? " *" : ""}
                            </Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                              <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-8 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm"
                                minLength={6}
                              />
                            </div>
                            
                            {password && confirmPassword && (
                              <div className={`flex items-center gap-1 text-[10px] sm:text-xs ${
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
                          <Label className="font-medium mb-1 block text-xs sm:text-sm">Password Requirements:</Label>
                          <ul className="space-y-1 text-[10px] sm:text-xs text-gray-600">
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
        </div>
      </Tabs>

      {/* Fixed Footer with Navigation and Submit */}
      <div className="border-t bg-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToPrevTab}
            disabled={activeTab === tabs[0] || loading}
            className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
          >
            <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1 mx-2">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`h-1.5 w-4 sm:w-6 rounded-full transition-colors ${
                  activeTab === tab ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {activeTab !== tabs[tabs.length - 1] ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goToNextTab}
              className="h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
            >
              Next
              <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1" />
            </Button>
          ) : (
            <div className="w-[60px] sm:w-[70px]" /> // Spacer for alignment
          )}
        </div>
        
        {/* Show submit button only on the last tab */}
        {activeTab === tabs[tabs.length - 1] && (
          <Button 
            type="submit" 
            disabled={loading}
            className="h-7 sm:h-8 px-3 sm:px-4 text-[10px] sm:text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                {uploadProgress > 0 ? "Upload" : "Save"}
              </>
            ) : tenant ? "Update" : "Create"}
          </Button>
        )}
      </div>
    </form>
  );
}