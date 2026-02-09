// // app/tenant/requests/page.tsx
// "use client";

// import { useState, useEffect, ReactNode } from 'react';
// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Plus,
//   MessageSquare,
//   Receipt,
//   Wrench,
//   Calendar,
//   FileText,
//   Clock,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   ArrowLeft,
//   Send,
//   Loader2,
//   Bed,
//   Move,
//   AlertTriangle,
//   Check,
//   Info,
//   Home,
//   Building,
//   DoorOpen,
//   Hash
// } from 'lucide-react';
// import { format } from 'date-fns';
// import TenantHeader from '@/components/layout/tenantHeader';
// import {
//   getMyTenantRequests,
//   createTenantRequest,
//   getTenantContractDetails,
//   getCurrentRoomInfo,
//   getActiveProperties,
//   getAvailableRooms,
//   getChangeBedReasons,
//   getVacateReasons,
//   getAvailableBedsForRoom,
//   getLeaveTypes,
//   type TenantRequest,
//   type Property as ApiProperty,
//   type Room as ApiRoom,
//   type ChangeReason,
//   type CurrentRoomInfo,
//   getComplaintCategories,
//   getComplaintReasons  
// } from "@/lib/tenantRequestsApi";

// import { getTenantToken } from "@/lib/tenantAuthApi";
// import { getActiveMasterValuesByCode } from "@/lib/masterApi";
// import { Checkbox } from "@/components/ui/checkbox";

// interface RequestFormData {
//   request_type: string;
//   title: string;
//   description: string;
//   priority: string;
//   vacateData?: {
//     primary_reason_id?: string;
//     secondary_reasons?: string[];
//     overall_rating?: number;
//     food_rating?: number;
//     cleanliness_rating?: number;
//     management_rating?: number;
//     improvement_suggestions?: string;
//     agree_lockin_penalty?: boolean;
//     agree_notice_penalty?: boolean;
//     expected_vacate_date?: string;
//   };
//   changeBedData?: {
//     preferred_property_id?: number;
//     preferred_room_id?: number;
//     change_reason_id?: number;
//     shifting_date?: string;
//     notes?: string;
//     preferred_bed_number?: number;
//   };
//   leaveData?: {
//     leave_type: string;
//     leave_start_date: string;
//     leave_end_date: string;
//     total_days: number;
//     contact_address_during_leave?: string;
//     emergency_contact_number?: string;
//     room_locked?: boolean;
//     keys_submitted?: boolean;
//   };
//    maintenanceData?: {
//     issue_category?: string;
//     location?: string;
//     preferred_visit_time?: string;
//     access_permission?: boolean;
//   };
//   complaintData?: {
//     category_master_type_id?: number;
//     reason_master_value_id?: number;
//     custom_reason?: string;
//   };
// }

// interface VacateReason {
//   id: number;
//   value: string;
//   description?: string;
// }

// interface BackendTenantDetails {
//   id: number;
//   full_name: string;
//   property_id: number;
//   property_name: string;
//   room_number: number;
//   bed_number: number;
//   check_in_date: string;
//   lockin_period_months: number;
//   lockin_penalty_amount: string;
//   lockin_penalty_type: string;
//   notice_period_days: number;
//   notice_penalty_amount: string;
//   notice_penalty_type: string;
//   monthly_rent: string;
// }

// interface BackendLockinInfo {
//   isInLockinPeriod: boolean;
//   lockinEnds: string;
//   remainingMonths: number;
//   checkInDate: string;
//   lockinPeriodMonths: number;
//   penalty: {
//     amount: string;
//     type: string;
//     description: string;
//     calculatedAmount: string;
//   };
// }

// interface BackendNoticeInfo {
//   noticePeriodDays: number;
//   penalty: {
//     amount: string;
//     type: string;
//     description: string;
//     calculatedAmount: string;
//   };
//   requiresAgreement: boolean;
// }

// interface BackendContractResponse {
//   tenantDetails: BackendTenantDetails;
//   lockinInfo: BackendLockinInfo | null;
//   noticeInfo: BackendNoticeInfo | null;
// }

// interface FrontendLockinInfo {
//   isInLockinPeriod: boolean;
//   lockinEnds: Date;
//   remainingMonths: number;
//   checkInDate: Date;
//   lockinPeriodMonths: number;
//   penalty: {
//     amount: number | null;
//     type: string | null;
//     description: string;
//     calculatedAmount: number | null;
//   };
// }

// interface FrontendNoticeInfo {
//   noticePeriodDays: number;
//   penalty: {
//     amount: number | null;
//     type: string | null;
//     description: string;
//     calculatedAmount: number | null;
//   };
//   requiresAgreement: boolean;
// }

// interface Property {
//   city: ReactNode;
//   available_rooms_count: ReactNode;
//   id: number;
//   name: string;
//   address: string;
//   is_active: boolean;
// }

// interface LocalRoom {
//   id: number;
//   room_number: number;
//   sharing_type: string;
//   total_bed: number;
//   occupied_beds: number;
//   rent_per_bed: number;
//   available_beds: number;
// }

// // Add this interface at the top of your component file, after the other interfaces
// interface LeaveType {
//   id: number;
//   value: string;
//   description: string;
//   display_order: number;
//   is_active: boolean;
//   type_code: string;
// }


// export default function TenantRequestsPage() {
//   const router = useRouter();
//   const [requests, setRequests] = useState<TenantRequest[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
  
//   const [vacateReasons, setVacateReasons] = useState<VacateReason[]>([]);
//   const [secondaryReasonsInput, setSecondaryReasonsInput] = useState('');
//   const [lockinInfo, setLockinInfo] = useState<FrontendLockinInfo | null>(null);
//   const [noticeInfo, setNoticeInfo] = useState<FrontendNoticeInfo | null>(null);
//   // Change bed request states
//   const [currentRoom, setCurrentRoom] = useState<CurrentRoomInfo | null>(null);
//   const [changeReasons, setChangeReasons] = useState<ChangeReason[]>([]);
//   const [properties, setProperties] = useState<ApiProperty[]>([]);
//   const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
//   const [availableRooms, setAvailableRooms] = useState<ApiRoom[]>([]);
//   const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
//   const [availableBeds, setAvailableBeds] = useState<number[]>([]);
//   const [selectedBedNumber, setSelectedBedNumber] = useState<number | null>(null);
//   const [step, setStep] = useState<number>(1); // For multi-step form
//   // Add state for leave types
// const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

// const [complaintCategories, setComplaintCategories] = useState<ComplaintCategory[]>([]);
// const [complaintReasons, setComplaintReasons] = useState<ComplaintReason[]>([]);
// const [selectedComplaintCategory, setSelectedComplaintCategory] = useState<number | null>(null);
// const [showCustomReason, setShowCustomReason] = useState(false);

// // Add these to your component (after other state declarations)
// const [maintenanceCategories, setMaintenanceCategories] = useState([
//   { id: 'electrical', label: 'Electrical' },
//   { id: 'plumbing', label: 'Plumbing' },
//   { id: 'ac', label: 'AC' },
//   { id: 'furniture', label: 'Furniture' },
//   { id: 'internet', label: 'Internet' },
//   { id: 'cleaning', label: 'Cleaning' },
//   { id: 'other', label: 'Other' }
// ]);

// const [visitTimes, setVisitTimes] = useState([
//   { id: 'morning', label: 'Morning (9 AM - 12 PM)' },
//   { id: 'afternoon', label: 'Afternoon (12 PM - 4 PM)' },
//   { id: 'evening', label: 'Evening (4 PM - 7 PM)' },
//   { id: 'anytime', label: 'Anytime during office hours' }
// ]);

// const [maintenanceLocations, setMaintenanceLocations] = useState([
//   { id: 'bathroom', label: 'Bathroom' },
//   { id: 'kitchen', label: 'Kitchen' },
//   { id: 'room', label: 'My Room' },
//   { id: 'common_area', label: 'Common Area' },
//   { id: 'corridor', label: 'Corridor' },
//   { id: 'other', label: 'Other Location' }
// ]);

//   const [formData, setFormData] = useState<RequestFormData>({
//     request_type: 'general',
//     title: '',
//     description: '',
//     priority: 'medium'
//   });

//     const [filteredRequests, setFilteredRequests] = useState<TenantRequest[]>([]);

//   useEffect(() => {
//   loadAllData();
// }, []);


//   const loadAllData = async () => {
//     try {
//       setLoading(true);
      
//       // Load all data in parallel
//       const [
//         requestsData,
//         contractData,
//         roomInfo,
//         propertiesData,
//         changeReasonsData,
//         vacateReasonsResponse,
//         leaveTypesData,
//         complaintCategoriesData
//       ] = await Promise.allSettled([
//         getMyTenantRequests(),
//         getTenantContractDetails(),
//         getCurrentRoomInfo(),
//         getActiveProperties(),
//         getChangeBedReasons(),
//         getActiveMasterValuesByCode('VACATE_REASON'),
//         getLeaveTypes(),
//         getComplaintCategories()
//       ]);

//       // Handle requests data
//       if (requestsData.status === 'fulfilled') {
//         setRequests(requestsData.value);
//         setFilteredRequests(requestsData.value);
//       }

//       // Handle contract data
//       if (contractData.status === 'fulfilled') {
//         setLockinInfo(contractData.value.lockinInfo);
//         setNoticeInfo(contractData.value.noticeInfo);
//       }

//        // Handle room info
//       if (roomInfo.status === 'fulfilled') {
//         setCurrentRoom(roomInfo.value);
//       }

//       // Handle properties
//       if (propertiesData.status === 'fulfilled') {
//         setProperties(propertiesData.value);
//       }

//       // Handle change reasons
//       if (changeReasonsData.status === 'fulfilled') {
//         setChangeReasons(changeReasonsData.value);
//       }

//       // Handle vacate reasons - FIXED: Extract array from response
//       if (vacateReasonsResponse.status === 'fulfilled') {
//         const response = vacateReasonsResponse.value;
//         if (response && response.success && Array.isArray(response.data)) {
//           setVacateReasons(response.data);
//         } else {
//           // Fallback if response doesn't have expected structure
//           setVacateReasons([
//             { id: 1, value: 'Job Change/Relocation' },
//             { id: 2, value: 'Personal Reasons' },
//             { id: 3, value: 'Financial Issues' },
//             { id: 4, value: 'Found Better Accommodation' },
//             { id: 5, value: 'Completing Studies' },
//             { id: 6, value: 'Medical Reasons' },
//             { id: 7, value: 'Family Reasons' },
//             { id: 8, value: 'Dissatisfied with Services' }
//           ]);
//         }
//       } else {
//         // Fallback if promise fails
//         setVacateReasons([
//           { id: 1, value: 'Job Change/Relocation' },
//           { id: 2, value: 'Personal Reasons' },
//           { id: 3, value: 'Financial Issues' },
//           { id: 4, value: 'Found Better Accommodation' }
//         ]);
//       }

//      // Handle leave types data
//     if (leaveTypesData.status === 'fulfilled') {
//       console.log('✅ Leave types loaded:', leaveTypesData.value);
//       setLeaveTypes(leaveTypesData.value);
//     } else {
//       console.error('❌ Failed to load leave types:', leaveTypesData.reason);
//     }

// // Handle complaint categories data - ADD DEBUG LOGS
//     if (complaintCategoriesData.status === 'fulfilled') {
//       console.log('🔍 Complaint categories promise fulfilled:', complaintCategoriesData.value);
      
//       // Check what we actually received
//       const categories = complaintCategoriesData.value;
//       console.log('📋 Complaint categories type:', typeof categories);
//       console.log('📋 Is array?', Array.isArray(categories));
//       console.log('📋 Categories data:', categories);
      
//       if (Array.isArray(categories)) {
//         setComplaintCategories(categories);
//         console.log(`✅ Set ${categories.length} complaint categories`);
//       } else if (categories && typeof categories === 'object' && Array.isArray(categories.data)) {
//         // Backend returns { success: true, data: [...] }
//         setComplaintCategories(categories.data);
//         console.log(`✅ Set ${categories.data.length} complaint categories from data property`);
//       } else {
//         console.warn('⚠️ Complaint categories is not an array:', categories);
//         setComplaintCategories([]);
//       }
//     } else {
//       console.error('❌ Failed to load complaint categories:', complaintCategoriesData.reason);
//       setComplaintCategories([]);
//     }


//     } catch (error) {
//       console.error('Error loading data:', error);
//       toast.error('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   //  When property is selected, load available rooms
//   const handlePropertySelect = async (propertyId: number) => {
//     setSelectedPropertyId(propertyId);
//     setSelectedRoomId(null);
//     setAvailableBeds([]);
//     setSelectedBedNumber(null);
    
//     try {
//       const rooms = await getAvailableRooms(propertyId);
//       setAvailableRooms(rooms);
      
//       // Update form data
//       setFormData(prev => ({
//         ...prev,
//         changeBedData: {
//           ...prev.changeBedData,
//           preferred_property_id: propertyId,
//           preferred_room_id: undefined,
//           preferred_bed_number: undefined
//         }
//       }));
//     } catch (error) {
//       console.error('Error loading available rooms:', error);
//       toast.error('Failed to load available rooms');
//     }
//   };

//    // When room is selected, load available beds
// // In your component, update the handleRoomSelect function:
// const handleRoomSelect = async (roomId: number) => {
//     setSelectedRoomId(roomId);
//     setSelectedBedNumber(null);
    
//     try {
//       console.log('Fetching beds for room:', roomId);
//         const beds = await getAvailableBedsForRoom(roomId);
//         console.log('Raw beds response:', beds);
//         console.log('Type of beds:', typeof beds);
//         console.log('Is array?', Array.isArray(beds));
        
//         // Ensure beds is an array of numbers
//         if (Array.isArray(beds)) {
//             // Filter out any non-number values
//              console.log('First bed item:', beds[0]);
//             console.log('Type of first bed item:', typeof beds[0]);
//             const bedNumbers = beds.filter(bed => typeof bed === 'number');
//             setAvailableBeds(bedNumbers);
//         } else {
//             console.error('Beds is not an array:', beds);
//             setAvailableBeds([]);
//         }
        
//         // Update form data
//         setFormData(prev => ({
//             ...prev,
//             changeBedData: {
//                 ...prev.changeBedData,
//                 preferred_room_id: roomId,
//                 preferred_bed_number: undefined
//             }
//         }));
//     } catch (error) {
//         console.error('Error loading available beds:', error);
//         toast.error('Failed to load available beds');
//         setAvailableBeds([]);
//     }
// };

//   // Handle bed selection
//   const handleBedSelect = (bedNumber: number) => {
//     setSelectedBedNumber(bedNumber);
    
//     // Update form data
//     setFormData(prev => ({
//       ...prev,
//       changeBedData: {
//         ...prev.changeBedData,
//         preferred_bed_number: bedNumber
//       }
//     }));
//   };

//    // Handle change reason selection
//   const handleChangeReasonSelect = (reasonId: number) => {
//     setFormData(prev => ({
//       ...prev,
//       changeBedData: {
//         ...prev.changeBedData,
//         change_reason_id: reasonId
//       }
//     }));
//   };

//   // Handle shifting date change
//   const handleShiftingDateChange = (date: string) => {
//     setFormData(prev => ({
//       ...prev,
//       changeBedData: {
//         ...prev.changeBedData,
//         shifting_date: date
//       }
//     }));
//   };

//   // Handle notes change
//   const handleNotesChange = (notes: string) => {
//     setFormData(prev => ({
//       ...prev,
//       changeBedData: {
//         ...prev.changeBedData,
//         notes
//       }
//     }));
//   };

//    // Handle quick request button click
//   const handleQuickRequest = (type: string) => {
//     setFormData({
//       request_type: type,
//       title: type === 'complaint' ? 'Complaint' : 
//              type === 'maintenance' ? 'Maintenance Request' :
//              type === 'vacate_bed' ? 'Vacate Bed Request' :
//              type === 'change_bed' ? 'Change Bed Request' :
//              type === 'receipt' ? 'Receipt Request' :
//              type === 'leave' ? 'Leave Application' : 'General Request',
//       description: '',
//       priority: type === 'maintenance' || type === 'complaint' ? 'high' : 'medium'
//     });

//      // Reset change bed form state
//     if (type === 'change_bed') {
//       setStep(1);
//       setSelectedPropertyId(null);
//       setAvailableRooms([]);
//       setSelectedRoomId(null);
//       setAvailableBeds([]);
//       setSelectedBedNumber(null);
//     }
    
//     setIsDialogOpen(true);
//   };


 


//   // Fetch tenant contract details
//   const fetchTenantDetails = async () => {
//     try {
//       const token = getTenantToken();
//       if (!token) return;

//       console.log('🔍 Fetching tenant contract details...');
      
//       const response = await fetch('http://localhost:3001/api/tenant-requests/contract-details', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const result = await response.json();
//         console.log('📊 Backend contract response:', result);
        
//         if (result.success && result.data) {
//           const backendData: BackendContractResponse = result.data;
          
//           console.log('✅ Backend data received:', {
//             hasLockinInfo: !!backendData.lockinInfo,
//             hasNoticeInfo: !!backendData.noticeInfo,
//             tenantDetails: backendData.tenantDetails
//           });
          
//           // Convert backend data to frontend format
//           if (backendData.lockinInfo) {
//             const lockinData = backendData.lockinInfo;
//             const frontendLockinInfo: FrontendLockinInfo = {
//               isInLockinPeriod: lockinData.isInLockinPeriod,
//               lockinEnds: new Date(lockinData.lockinEnds),
//               remainingMonths: lockinData.remainingMonths,
//               checkInDate: new Date(lockinData.checkInDate),
//               lockinPeriodMonths: lockinData.lockinPeriodMonths,
//               penalty: {
//                 amount: lockinData.penalty.amount ? parseFloat(lockinData.penalty.amount) : null,
//                 type: lockinData.penalty.type,
//                 description: lockinData.penalty.description,
//                 calculatedAmount: lockinData.penalty.calculatedAmount ? parseFloat(lockinData.penalty.calculatedAmount) : null
//               }
//             };
//             setLockinInfo(frontendLockinInfo);
//             console.log('🔒 Frontend lockin info set:', frontendLockinInfo);
//           } else {
//             console.log('⚠️ No lockin info in backend response');
//             setLockinInfo(null);
//           }
          
//           if (backendData.noticeInfo) {
//             const noticeData = backendData.noticeInfo;
//             const frontendNoticeInfo: FrontendNoticeInfo = {
//               noticePeriodDays: noticeData.noticePeriodDays,
//               penalty: {
//                 amount: noticeData.penalty.amount ? parseFloat(noticeData.penalty.amount) : null,
//                 type: noticeData.penalty.type,
//                 description: noticeData.penalty.description,
//                 calculatedAmount: noticeData.penalty.calculatedAmount ? parseFloat(noticeData.penalty.calculatedAmount) : null
//               },
//               requiresAgreement: noticeData.requiresAgreement
//             };
//             setNoticeInfo(frontendNoticeInfo);
//             console.log('📋 Frontend notice info set:', frontendNoticeInfo);
//           } else {
//             console.log('⚠️ No notice info in backend response');
//             setNoticeInfo(null);
//           }
//         } else {
//           console.warn('❌ Backend response not successful:', result);
//         }
//       } else {
//         const errorText = await response.text();
//         console.error('❌ Failed to fetch contract details:', response.status, errorText);
//       }
//     } catch (error) {
//       console.error('🔥 Error fetching tenant contract details:', error);
//     }
//   };

// // Replace the checkAuthAndLoadData function with this:
// const checkAuthAndLoadData = async () => {
//   try {
//     const token = getTenantToken();
//     if (!token) {
//       router.push('/tenant/login');
//       return;
//     }

//     await loadRequests();
//     await loadVacateReasons();
//     await fetchTenantDetails();
//     // These functions are called directly by loadAllData, no need to call them separately
    
//   } catch (error) {
//     console.error('Error loading data:', error);
//     toast.error('Failed to load data');
//   } finally {
//     setLoading(false);
//   }
// };

//   useEffect(() => {
//     checkAuthAndLoadData();
//   }, []);

//   const loadRequests = async () => {
//     try {
//       setLoading(true);
//       const data = await getMyTenantRequests();
//       setRequests(data || []);
//     } catch (err) {
//       console.error("Failed to load requests:", err);
//       toast.error('Failed to load requests');
//       setRequests([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadVacateReasons = async () => {
//     try {
//       const response = await getActiveMasterValuesByCode('VACATE_REASON');
//       if (response?.success && Array.isArray(response.data)) {
//         setVacateReasons(response.data);
//       } else {
//         setVacateReasons([
//           { id: 1, value: 'Job Change/Relocation' },
//           { id: 2, value: 'Personal Reasons' },
//           { id: 3, value: 'Financial Issues' },
//           { id: 4, value: 'Found Better Accommodation' },
//           { id: 5, value: 'Completing Studies' },
//           { id: 6, value: 'Medical Reasons' },
//           { id: 7, value: 'Family Reasons' },
//           { id: 8, value: 'Dissatisfied with Services' }
//         ]);
//       }
//     } catch (error) {
//       console.warn("Failed to load vacate reasons:", error);
//       setVacateReasons([
//         { id: 1, value: 'Job Change/Relocation' },
//         { id: 2, value: 'Personal Reasons' },
//         { id: 3, value: 'Financial Issues' },
//         { id: 4, value: 'Found Better Accommodation' }
//       ]);
//     }
//   };

// // Add handler for leave data
// const handleLeaveDataChange = (field: string, value: any) => {
//   setFormData(prev => ({
//     ...prev,
//     leaveData: {
//       ...prev.leaveData,
//       [field]: value
//     }
//   }));
// };

// // Add this handler function with your other handlers
// const handleMaintenanceDataChange = (field: string, value: any) => {
//   setFormData(prev => ({
//     ...prev,
//     maintenanceData: {
//       ...prev.maintenanceData,
//       [field]: value
//     }
//   }));
// };

// const handleSubmit = async () => {
//     // Basic validation - ALWAYS validate title and description for ALL request types
//     if (!formData.title.trim() || !formData.description.trim()) {
//         toast.error('Please fill all required fields (Title and Description)');
//         return;
//     }

//     // Additional validation for vacate bed request
//     if (formData.request_type === 'vacate_bed') {
//         if (!formData.vacateData?.primary_reason_id) {
//             toast.error('Please select a primary reason for vacating');
//             return;
//         }
        
//         if (!formData.vacateData?.expected_vacate_date) {
//             toast.error('Please select an expected vacate date');
//             return;
//         }
        
//         // Check lock-in period agreement
//         if (lockinInfo?.isInLockinPeriod && !formData.vacateData?.agree_lockin_penalty) {
//             toast.error('You must agree to the lock-in period penalty to proceed');
//             return;
//         }
        
//         // Check notice period agreement
//         if (noticeInfo?.requiresAgreement && !formData.vacateData?.agree_notice_penalty) {
//             toast.error('You must agree to the notice period penalty to proceed');
//             return;
//         }
//     }

//     // Additional validation for change bed request
//     if (formData.request_type === 'change_bed') {
//         if (!formData.changeBedData?.change_reason_id) {
//             toast.error('Please select a reason for change');
//             return;
//         }
        
//         if (!formData.changeBedData?.preferred_property_id) {
//             toast.error('Please select a preferred property');
//             return;
//         }
        
//         if (!formData.changeBedData?.preferred_room_id) {
//             toast.error('Please select a preferred room');
//             return;
//         }
        
//         if (!formData.changeBedData?.shifting_date) {
//             toast.error('Please select a shifting date');
//             return;
//         }
        
//         // Validate shifting date is not in the past
//         const shiftingDate = new Date(formData.changeBedData.shifting_date);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
        
//         if (shiftingDate < today) {
//             toast.error('Shifting date cannot be in the past');
//             return;
//         }
        
//         // Check if tenant is trying to move to same room
//         if (currentRoom?.room_id && formData.changeBedData.preferred_room_id === currentRoom.room_id) {
//             toast.error('You cannot request to move to your current room');
//             return;
//         }
        
//         // Check current room info exists
//         if (!currentRoom?.property_id || !currentRoom?.room_id) {
//             toast.error('Unable to determine your current room information');
//             return;
//         }
//     }

// // In handleSubmit function, add leave validation
// if (formData.request_type === 'leave') {
//   if (!formData.leaveData?.leave_type) {
//     toast.error('Please select a leave type');
//     return;
//   }
  
//   if (!formData.leaveData?.leave_start_date) {
//     toast.error('Please select a leave start date');
//     return;
//   }
  
//   if (!formData.leaveData?.leave_end_date) {
//     toast.error('Please select a leave end date');
//     return;
//   }
  
//   if (!formData.leaveData?.total_days || formData.leaveData.total_days < 1) {
//     toast.error('Please enter a valid number of days');
//     return;
//   }
  
//   if (formData.leaveData.total_days > 30) {
//     toast.error('Leave cannot exceed 30 days');
//     return;
//   }
  
//   // Validate dates
//   const startDate = new Date(formData.leaveData.leave_start_date);
//   const endDate = new Date(formData.leaveData.leave_end_date);
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
  
//   if (startDate < today) {
//     toast.error('Leave start date cannot be in the past');
//     return;
//   }
  
//   if (endDate < startDate) {
//     toast.error('Leave end date cannot be before start date');
//     return;
//   }
// }

// // Add this validation in your handleSubmit function:
// if (formData.request_type === 'maintenance') {
//   if (!formData.maintenanceData?.issue_category) {
//     toast.error('Please select an issue category for maintenance');
//     return;
//   }
  
//   if (!formData.maintenanceData?.location) {
//     toast.error('Please select the location of the issue');
//     return;
//   }
  
//   if (!formData.description.trim()) {
//     toast.error('Please provide a detailed description of the issue');
//     return;
//   }
// }

// // Add this to your handleSubmit function:
// if (formData.request_type === 'complaint') {
//   if (!formData.complaintData?.category_master_type_id) {
//     toast.error('Please select a complaint category');
//     return;
//   }
  
//   if (!formData.complaintData?.reason_master_value_id && !formData.complaintData?.custom_reason) {
//     toast.error('Please select a reason or provide a custom reason for your complaint');
//     return;
//   }
  
//   if (formData.complaintData?.custom_reason && formData.complaintData.custom_reason.trim().length < 10) {
//     toast.error('Please provide a more detailed custom reason (at least 10 characters)');
//     return;
//   }
// }

//     try {
//         setSubmitting(true);
        
//         const requestData: any = {
//             request_type: formData.request_type,
//             title: formData.title,
//             description: formData.description,
//             priority: formData.priority
//         };

//         if (formData.request_type === 'vacate_bed' && formData.vacateData) {
//             requestData.vacate_data = {
//                 ...formData.vacateData,
//                 secondary_reasons: secondaryReasonsInput
//                     .split(',')
//                     .map(r => r.trim())
//                     .filter(r => r.length > 0),
//                 lockin_penalty_accepted: formData.vacateData.agree_lockin_penalty || false,
//                 notice_penalty_accepted: formData.vacateData.agree_notice_penalty || false,
//                 expected_vacate_date: formData.vacateData.expected_vacate_date
//             };
//         }

//         // In your handleSubmit function, update the change bed data section:
// if (formData.request_type === 'change_bed' && formData.changeBedData) {
//   // Debug current room data
//   console.log('🔍 Current room data:', {
//     property_id: currentRoom?.property_id,
//     room_id: currentRoom?.room_id,
//     bed_number: currentRoom?.bed_number,
//     has_assignment: currentRoom?.has_assignment
//   });

//   // If current room data is missing, try to get it from bed assignments
//   let currentPropertyId = currentRoom?.property_id;
//   let currentRoomId = currentRoom?.room_id;
//   let currentBedNumber = currentRoom?.bed_number;

//   // If still missing, set defaults
//   if (!currentPropertyId || !currentRoomId) {
//     console.warn('⚠️ Current room info missing, using defaults');
//     // You might want to fetch this from a different endpoint
//     currentPropertyId = currentRoom?.property_id || 1;
//     currentRoomId = currentRoom?.room_id || 1;
//     currentBedNumber = currentBedNumber || 0;
//   }

//   requestData.change_bed_data = {
//     // Include current location info
//     current_property_id: currentPropertyId,
//     current_room_id: currentRoomId,
//     current_bed_number: currentBedNumber,
    
//     // Preferred location info
//     preferred_property_id: formData.changeBedData.preferred_property_id,
//     preferred_room_id: formData.changeBedData.preferred_room_id,
//     change_reason_id: formData.changeBedData.change_reason_id,
//     shifting_date: formData.changeBedData.shifting_date,
//     notes: formData.changeBedData.notes,
//     preferred_bed_number: formData.changeBedData.preferred_bed_number
//   };

//   console.log('📤 Sending change bed data:', requestData.change_bed_data);
//   console.log('🚀 Sending to backend:', {
//   request_type: 'change_bed',
//   title: formData.title,
//   description: formData.description,
//   priority: formData.priority,
//   change_bed_data: formData.changeBedData
// });
// }
// // In handleSubmit function, add leave_data to request
// if (formData.request_type === 'leave' && formData.leaveData) {
//   requestData.leave_data = {
//     leave_type: formData.leaveData.leave_type,
//     leave_start_date: formData.leaveData.leave_start_date,
//     leave_end_date: formData.leaveData.leave_end_date,
//     total_days: formData.leaveData.total_days,
//     contact_address_during_leave: formData.leaveData.contact_address_during_leave || '',
//     emergency_contact_number: formData.leaveData.emergency_contact_number || '',
//     room_locked: formData.leaveData.room_locked || false,
//     keys_submitted: formData.leaveData.keys_submitted || false
//   };
// }

// // In your handleSubmit function, add this before creating the request:
// if (formData.request_type === 'maintenance' && formData.maintenanceData) {
//   requestData.maintenance_data = {
//     issue_category: formData.maintenanceData.issue_category,
//     location: formData.maintenanceData.location,
//     preferred_visit_time: formData.maintenanceData.preferred_visit_time || 'anytime',
//     access_permission: formData.maintenanceData.access_permission || false,
//   };
// }

// // In your handleSubmit function, add this:
// if (formData.request_type === 'complaint' && formData.complaintData) {
//   requestData.complaint_data = {
//     category_master_type_id: formData.complaintData.category_master_type_id,
//     reason_master_value_id: formData.complaintData.reason_master_value_id,
//     custom_reason: formData.complaintData.custom_reason || null
//   };
// }

//         await createTenantRequest(requestData);

//         toast.success('Request created successfully!');
        
//         // Reset form
//         setFormData({
//             request_type: 'general',
//             title: '',
//             description: '',
//             priority: 'medium'
//         });
//         setSecondaryReasonsInput('');
//         setStep(1);
//         setSelectedPropertyId(null);
//         setAvailableRooms([]);
//         setSelectedRoomId(null);
//         setAvailableBeds([]);
//         setSelectedBedNumber(null);

//         setIsDialogOpen(false);
//         await loadRequests();

//         // Reload requests
//         const updatedRequests = await getMyTenantRequests();
//         setRequests(updatedRequests);
//         setFilteredRequests(updatedRequests);

//     } catch (err: any) {
//         console.error("Failed to create request:", err);
        
//         // Handle specific backend errors
//         if (err.message.includes('lock-in period penalty')) {
//             toast.error('You must agree to the lock-in period penalty');
//         } else if (err.message.includes('notice period penalty')) {
//             toast.error('You must agree to the notice period penalty');
//         } else if (err.message.includes('already have a pending')) {
//             toast.error(err.message);
//         } else if (err.message.includes('Cannot request to move to current room')) {
//             toast.error('Cannot request to move to your current room');
//         } else if (err.message.includes('Selected room is fully occupied')) {
//             toast.error('The selected room is fully occupied. Please select another room.');
//         } else if (err.message.includes('current_property_id')) {
//             toast.error('System error: Missing current room information');
//         } else {
//             toast.error(err.message || 'Failed to create request');
//         }
//     } finally {
//         setSubmitting(false);
//     }
// };

// // Add handler for complaint category change
// // Update your handleComplaintCategoryChange function
// const handleComplaintCategoryChange = async (categoryId: number) => {
//   setSelectedComplaintCategory(categoryId);
//   setComplaintReasons([]);
//   setShowCustomReason(false);
  
//   // Update form data
//   setFormData(prev => ({
//     ...prev,
//     complaintData: {
//       ...prev.complaintData,
//       category_master_type_id: categoryId,
//       reason_master_value_id: undefined,
//       custom_reason: undefined
//     }
//   }));
  
//   try {
//     console.log(`🔄 Loading reasons for category ${categoryId}...`);
//     const reasons = await getComplaintReasons(categoryId);
//     console.log(`✅ Loaded ${reasons.length} reasons for category ${categoryId}:`, reasons);
//     setComplaintReasons(reasons);
//   } catch (error) {
//     console.error('❌ Error loading complaint reasons:', error);
//     toast.error('Failed to load complaint reasons');
    
//     // Provide fallback reasons based on category
//     let fallbackReasons: ComplaintReason[] = [];
    
//     if (categoryId === 9) { // Food
//       fallbackReasons = [
//         { id: 33, value: 'Oily food', master_type_id: 9 },
//         { id: 34, value: 'Too spicy', master_type_id: 9 },
//         { id: 35, value: 'Bad quality', master_type_id: 9 },
//         { id: 36, value: 'Not fresh', master_type_id: 9 },
//         { id: 37, value: 'Others', master_type_id: 9 }
//       ];
//     } else if (categoryId === 10) { // Room
//       fallbackReasons = [
//         { id: 100, value: 'Room not clean', master_type_id: 10 },
//         { id: 101, value: 'Maintenance issues', master_type_id: 10 },
//         { id: 102, value: 'Others', master_type_id: 10 }
//       ];
//     } else if (categoryId === 11) { // Staff
//       fallbackReasons = [
//         { id: 103, value: 'Rude behavior', master_type_id: 11 },
//         { id: 104, value: 'Poor service', master_type_id: 11 },
//         { id: 105, value: 'Others', master_type_id: 11 }
//       ];
//     } else { // Other
//       fallbackReasons = [
//         { id: 106, value: 'General issue', master_type_id: 12 },
//         { id: 107, value: 'Others', master_type_id: 12 }
//       ];
//     }
    
//     setComplaintReasons(fallbackReasons);
//   }
// };
// // Add handler for complaint reason change
// const handleComplaintReasonChange = (reasonId: number, reasonValue: string) => {
//   const isOthers = reasonValue.toLowerCase() === 'others';
//   setShowCustomReason(isOthers);
  
//   setFormData(prev => ({
//     ...prev,
//     complaintData: {
//       ...prev.complaintData,
//       reason_master_value_id: isOthers ? null : reasonId,
//       custom_reason: isOthers ? prev.complaintData?.custom_reason : undefined
//     }
//   }));
// };

// // Add handler for custom reason input
// const handleCustomReasonChange = (value: string) => {
//   setFormData(prev => ({
//     ...prev,
//     complaintData: {
//       ...prev.complaintData,
//       custom_reason: value
//     }
//   }));
// };
//   const getRequestTypeIcon = (type: string) => {
//     switch (type) {
//       case 'complaint': return <MessageSquare className="h-5 w-5" />;
//       case 'receipt': return <Receipt className="h-5 w-5" />;
//       case 'maintenance': return <Wrench className="h-5 w-5" />;
//       case 'leave': return <Calendar className="h-5 w-5" />;
//       case 'vacate_bed': return <Move className="h-5 w-5" />;
//       case 'change_bed': return <Bed className="h-5 w-5" />;
//       default: return <FileText className="h-5 w-5" />;
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
//       pending: { variant: 'outline', icon: Clock },
//       in_progress: { variant: 'default', icon: AlertCircle },
//       resolved: { variant: 'default', icon: CheckCircle },
//       closed: { variant: 'secondary', icon: XCircle },
//       approved: { variant: 'default', icon: CheckCircle },
//       rejected: { variant: 'destructive', icon: XCircle },
//       completed: { variant: 'default', icon: CheckCircle }
//     };

//     const config = variants[status] || variants.pending;
//     const Icon = config.icon;

//     return (
//       <Badge variant={config.variant} className="flex items-center gap-1">
//         <Icon className="h-3 w-3" />
//         {status.replace('_', ' ').toUpperCase()}
//       </Badge>
//     );
//   };

//   const getPriorityBadge = (priority: string) => {
//     const colors: Record<string, string> = {
//       low: 'bg-green-100 text-green-800 hover:bg-green-100',
//       medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
//       high: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
//       urgent: 'bg-red-100 text-red-800 hover:bg-red-100'
//     };

//     return (
//       <Badge className={`${colors[priority] || colors.medium}`}>
//         {priority.toUpperCase()}
//       </Badge>
//     );
//   };

//   const quickRequests = [
//     {
//       type: 'complaint',
//       title: 'File a Complaint',
//       description: 'Report an issue or concern',
//       icon: MessageSquare,
//       color: 'bg-red-50 border-red-200'
//     },
//     {
//       type: 'receipt',
//       title: 'Request Receipt',
//       description: 'Get rent or deposit receipt',
//       icon: Receipt,
//       color: 'bg-blue-50 border-blue-200'
//     },
//     {
//       type: 'maintenance',
//       title: 'Maintenance Request',
//       description: 'Report repair needs',
//       icon: Wrench,
//       color: 'bg-orange-50 border-orange-200'
//     },
//     {
//       type: 'leave',
//       title: 'Leave Application',
//       description: 'Request temporary leave',
//       icon: Calendar,
//       color: 'bg-purple-50 border-purple-200'
//     },
//     {
//       type: 'vacate_bed',
//       title: 'Vacate Bed Request',
//       description: 'Request to vacate your bed',
//       icon: Move,
//       color: 'bg-pink-50 border-pink-200'
//     },
//     {
//       type: 'change_bed',
//       title: 'Change Bed Request',
//       description: 'Request to change your bed',
//       icon: Bed,
//       color: 'bg-teal-50 border-teal-200'
//     }
//   ];

//   const filterRequestsByStatus = (status: string) => {
//     if (status === 'all') return requests;
//     return requests.filter(req => req.status === status);
//   };

//   const handleVacateDataChange = (field: string, value: any) => {
//     setFormData(prev => ({
//       ...prev,
//       vacateData: {
//         ...prev.vacateData,
//         [field]: value
//       }
//     }));
//   };

//    // Render change bed form steps
//   const renderChangeBedForm = () => {
//     switch (step) {
//       case 1: // Step 1: Show current room and select reason
//         return (
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-lg font-semibold mb-4">Step 1: Current Room & Reason</h3>
              
//               {/* Current Room Info */}
//               {currentRoom ? (
//                 currentRoom.has_assignment ? (
//                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
//                     <div className="flex items-center gap-3 mb-3">
//                       <Home className="h-6 w-6 text-blue-600" />
//                       <h4 className="font-semibold text-blue-800">Your Current Room</h4>
//                     </div>
//                     <div className="grid grid-cols-2 gap-3 text-sm">
//                       <div><span className="font-medium">Property:</span> {currentRoom.property_name}</div>
//                       <div><span className="font-medium">Room:</span> {currentRoom.room_number}</div>
//                       <div><span className="font-medium">Bed:</span> {currentRoom.bed_number}</div>
//                       <div><span className="font-medium">Rent:</span> ₹{currentRoom.rent_per_bed}/month</div>
//                       <div><span className="font-medium">Sharing:</span> {currentRoom.sharing_type}</div>
//                       <div><span className="font-medium">Occupancy:</span> {currentRoom.occupied_beds}/{currentRoom.total_bed} beds</div>
//                       <div><span className="font-medium">Floor:</span> {currentRoom.floor || 'Ground'}</div>
//                       <div><span className="font-medium">Available:</span> {currentRoom.available_beds} beds</div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
//                     <div className="flex items-center gap-3">
//                       <AlertTriangle className="h-6 w-6 text-yellow-600" />
//                       <div>
//                         <h4 className="font-semibold text-yellow-800">No Current Assignment</h4>
//                         <p className="text-sm text-yellow-700 mt-1">
//                           You are not currently assigned to any bed. You can still request a new bed assignment.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )
//               ) : (
//                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
//                   <div className="flex items-center gap-3">
//                     <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
//                     <div>
//                       <h4 className="font-semibold text-gray-800">Loading room information...</h4>
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               {/* Change Reason Selection */}
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="change_reason" className="text-base">Why do you want to change your bed? *</Label>
//                   <Select
//                     value={formData.changeBedData?.change_reason_id?.toString() || ''}
//                     onValueChange={(value) => handleChangeReasonSelect(parseInt(value))}
//                   >
//                     <SelectTrigger className="h-12">
//                       <SelectValue placeholder="Select a reason for change" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {changeReasons.map((reason) => (
//                         <SelectItem key={reason.id} value={reason.id.toString()}>
//                           <div className="flex flex-col">
//                             <span className="font-medium">{reason.value}</span>
//                             {reason.description && (
//                               <span className="text-xs text-gray-500">{reason.description}</span>
//                             )}
//                           </div>
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
                
//                 <div className="flex justify-end">
//                   <Button 
//                     onClick={() => setStep(2)}
//                     disabled={!formData.changeBedData?.change_reason_id}
//                     className="bg-blue-600 hover:bg-blue-700"
//                   >
//                     Next: Select Property
//                     <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
        
//       case 2: // Step 2: Select property
//         return (
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold">Step 2: Select New Property</h3>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setStep(1)}
//                 className="text-blue-600"
//               >
//                 ← Back
//               </Button>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="property" className="text-base">Select Property *</Label>
//                 <Select
//                   value={selectedPropertyId?.toString() || ''}
//                   onValueChange={(value) => handlePropertySelect(parseInt(value))}
//                 >
//                   <SelectTrigger className="h-12">
//                     <SelectValue placeholder="Choose a property" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {properties.map((property) => (
//                       <SelectItem key={property.id} value={property.id.toString()}>
//                         <div className="flex flex-col">
//                           <span className="font-medium">{property.name}</span>
//                           <span className="text-xs text-gray-500">
//                             {property.city} • {property.available_rooms_count} rooms available
//                           </span>
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               {selectedPropertyId && availableRooms.length > 0 && (
//                 <div className="flex justify-end">
//                   <Button 
//                     onClick={() => setStep(3)}
//                     className="bg-blue-600 hover:bg-blue-700"
//                   >
//                     Next: Select Room
//                     <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
//                   </Button>
//                 </div>
//               )}
              
//               {selectedPropertyId && availableRooms.length === 0 && (
//                 <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
//                   <div className="flex items-center gap-3">
//                     <AlertTriangle className="h-5 w-5 text-yellow-600" />
//                     <div>
//                       <p className="text-sm text-yellow-800">
//                         No available rooms found in this property. Please select another property.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         );
        
//       case 3: // Step 3: Select room
//         return (
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold">Step 3: Select New Room</h3>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   setStep(2);
//                   setSelectedRoomId(null);
//                   setAvailableBeds([]);
//                   setSelectedBedNumber(null);
//                 }}
//                 className="text-blue-600"
//               >
//                 ← Back
//               </Button>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="room" className="text-base">Select Room *</Label>
//                 <Select
//                   value={selectedRoomId?.toString() || ''}
//                   onValueChange={(value) => handleRoomSelect(parseInt(value))}
//                 >
//                   <SelectTrigger className="h-12">
//                     <SelectValue placeholder="Choose a room" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {availableRooms.map((room) => (
//                       <SelectItem key={room.id} value={room.id.toString()}>
//                         <div className="flex flex-col">
//                           <span className="font-medium">Room {room.room_number}</span>
//                           <span className="text-xs text-gray-500">
//                             {room.sharing_type} sharing • ₹{room.rent_per_bed}/bed • 
//                             {room.available_beds} bed{room.available_beds !== 1 ? 's' : ''} available
//                           </span>
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
              
              
// {selectedRoomId && availableBeds.length > 0 && (
//     <div>
//         <Label className="text-base">Select Bed Number *</Label>
//         <div className="grid grid-cols-4 gap-2 mt-2">
//             {availableBeds.map((bedNumber) => {
//                 // Ensure bedNumber is a valid number
//                 const bedNum = Number(bedNumber);
//                 if (isNaN(bedNum)) {
//                     console.warn('Invalid bed number:', bedNumber);
//                     return null;
//                 }
                
//                 return (
//                     <Button
//                         key={bedNum} // Use bedNum as key, not the object
//                         type="button"
//                         variant={selectedBedNumber === bedNum ? "default" : "outline"}
//                         className={`h-12 ${selectedBedNumber === bedNum ? 'bg-blue-600' : ''}`}
//                         onClick={() => handleBedSelect(bedNum)}
//                     >
//                         <Hash className="h-4 w-4 mr-2" />
//                         Bed {bedNum}
//                     </Button>
//                 );
//             })}
//         </div>
//     </div>
// )}
              
//               {selectedRoomId && availableBeds.length === 0 && (
//                 <div className="bg-red-50 p-4 rounded-lg border border-red-200">
//                   <div className="flex items-center gap-3">
//                     <AlertTriangle className="h-5 w-5 text-red-600" />
//                     <div>
//                       <p className="text-sm text-red-800">
//                         No available beds in this room. Please select another room.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               {selectedRoomId && selectedBedNumber && (
//                 <div className="flex justify-end">
//                   <Button 
//                     onClick={() => setStep(4)}
//                     className="bg-blue-600 hover:bg-blue-700"
//                   >
//                     Next: Final Details
//                     <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         );
        
//       case 4: // Step 4: Final details
//         return (
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold">Step 4: Final Details</h3>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => setStep(3)}
//                 className="text-blue-600"
//               >
//                 ← Back
//               </Button>
//             </div>
            
//             <div className="space-y-4">
//               {/* Summary of selections */}
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h4 className="font-semibold mb-3">Request Summary</h4>
//                 <div className="grid grid-cols-2 gap-3 text-sm">
//                   <div><span className="font-medium">Current Room:</span> {currentRoom?.room_number ? `Room ${currentRoom.room_number}, Bed ${currentRoom.bed_number}` : 'Not assigned'}</div>
//                   <div><span className="font-medium">Reason:</span> {changeReasons.find(r => r.id === formData.changeBedData?.change_reason_id)?.value}</div>
//                   <div><span className="font-medium">New Property:</span> {properties.find(p => p.id === selectedPropertyId)?.name}</div>
//                   <div><span className="font-medium">New Room:</span> {availableRooms.find(r => r.id === selectedRoomId)?.room_number}</div>
//                   <div><span className="font-medium">New Bed:</span> {selectedBedNumber}</div>
//                   <div><span className="font-medium">New Rent:</span> ₹{availableRooms.find(r => r.id === selectedRoomId)?.rent_per_bed}/month</div>
//                 </div>
//               </div>
              
//               {/* Shifting date */}
//               <div>
//                 <Label htmlFor="shifting_date" className="text-base">Preferred Shifting Date *</Label>
//                 <Input
//                   id="shifting_date"
//                   type="date"
//                   value={formData.changeBedData?.shifting_date || ''}
//                   onChange={(e) => handleShiftingDateChange(e.target.value)}
//                   min={new Date().toISOString().split('T')[0]}
//                   className="h-12"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Select when you would like to move to the new room
//                 </p>
//               </div>
              
//               {/* Notes */}
//               {/* <div>
//                 <Label htmlFor="notes" className="text-base">Additional Notes (Optional)</Label>
//                 <Textarea
//                   id="notes"
//                   value={formData.changeBedData?.notes || ''}
//                   onChange={(e) => handleNotesChange(e.target.value)}
//                   placeholder="Any special requests or additional information..."
//                   rows={3}
//                   className="mt-1"
//                 />
//               </div> */}
//             </div>
//           </div>
//         );
        
//       default:
//         return null;
//     }
//   };

//   // Safe find function for vacate reasons
//   const findVacateReason = (reasonId?: string) => {
//     if (!Array.isArray(vacateReasons)) return 'N/A';
//     const reason = vacateReasons.find(r => r.id.toString() === reasonId?.toString());
//     return reason?.value || 'N/A';
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
//         <p className="text-gray-600">Loading your requests...</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <TenantHeader />
//       <div className="min-h-screen bg-gray-50">
//         <div className="max-w-7xl mx-auto p-6">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-4">
//               <Button variant="outline" onClick={() => router.push('/tenant/portal')}>
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Back
//               </Button>
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
//                 <p className="text-gray-600 mt-1">Raise requests and track their status</p>
//               </div>
//             </div>

//             <Dialog open={isDialogOpen} onOpenChange={(open) => {
//               setIsDialogOpen(open);
//               if (!open) {
//                 setFormData({
//                   request_type: 'general',
//                   title: '',
//                   description: '',
//                   priority: 'medium'
//                 });
//                 setSecondaryReasonsInput('');
//                 setStep(1);
//                 setSelectedPropertyId(null);
//                 setAvailableRooms([]);
//                 setSelectedRoomId(null);
//                 setAvailableBeds([]);
//                 setSelectedBedNumber(null);
//               }
//             }}>
//               <DialogTrigger asChild>
//                 <Button className="bg-blue-600 hover:bg-blue-700">
//                   <Plus className="h-4 w-4 mr-2" />
//                   New Request
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//                 <DialogHeader>
//                   <DialogTitle>Create New Request</DialogTitle>
//                   <DialogDescription>
//                     Fill in the details below to submit your request
//                   </DialogDescription>
//                 </DialogHeader>

//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="request_type">Request Type *</Label>
//                     <Select
//                       value={formData.request_type}
//                       onValueChange={(value) => {
//                         setFormData({ 
//                           ...formData, 
//                           request_type: value,
//                           vacateData: value === 'vacate_bed' ? formData.vacateData : undefined,
//                           changeBedData: value === 'change_bed' ? formData.changeBedData : undefined
//                         });
//                         if (value === 'change_bed') {
//                           setStep(1);
//                         }
//                       }}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select request type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="general">General Query</SelectItem>
//                         <SelectItem value="complaint">Complaint</SelectItem>
//                         <SelectItem value="receipt">Receipt Request</SelectItem>
//                         <SelectItem value="maintenance">Maintenance Request</SelectItem>
//                         <SelectItem value="leave">Leave Application</SelectItem>
//                         <SelectItem value="vacate_bed">Vacate Bed Request</SelectItem>
//                         <SelectItem value="change_bed">Change Bed Request</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div>
//                     <Label htmlFor="priority">Priority *</Label>
//                     <Select
//                       value={formData.priority}
//                       onValueChange={(value) => setFormData({ ...formData, priority: value })}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select priority" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="low">Low</SelectItem>
//                         <SelectItem value="medium">Medium</SelectItem>
//                         <SelectItem value="high">High</SelectItem>
//                         <SelectItem value="urgent">Urgent</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Title and Description - ALWAYS VISIBLE FOR ALL REQUEST TYPES */}
//                   <div>
//                     <Label htmlFor="title">Title *</Label>
//                     <Input
//                       id="title"
//                       value={formData.title}
//                       onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                       placeholder="Brief title for your request"
//                       className="h-12"
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="description">Description *</Label>
//                     <Textarea
//                       id="description"
//                       value={formData.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       placeholder="Provide detailed information about your request"
//                       rows={3}
//                     />
//                   </div>

//                   {/* Conditional rendering for Change Bed Request */}
//                   {formData.request_type === 'change_bed' && renderChangeBedForm()}

//                   {/* Conditional rendering for Vacate Bed Request */}
//                   {formData.request_type === 'vacate_bed' && (
//                     <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
//                       <h3 className="font-semibold text-lg">Vacate Bed Details</h3>
                      
//                       {/* Debug info - remove in production */}
//                       <div className="hidden">
//                         <p>Lockin Info: {lockinInfo ? 'Loaded' : 'Not loaded'}</p>
//                         <p>Notice Info: {noticeInfo ? 'Loaded' : 'Not loaded'}</p>
//                       </div>
                      
//                       {/* Lock-in Period Information */}
//                       {lockinInfo && (
//                         <div className={`rounded-lg p-4 ${lockinInfo.isInLockinPeriod ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
//                           <div className="flex items-start gap-3">
//                             {lockinInfo.isInLockinPeriod ? (
//                               <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
//                             ) : (
//                               <Check className="h-5 w-5 text-green-600 mt-0.5" />
//                             )}
//                             <div className="flex-1">
//                               <h4 className="font-semibold">
//                                 {lockinInfo.isInLockinPeriod ? 'Lock-in Period Active' : 'Lock-in Period Completed'}
//                               </h4>
//                               <div className="space-y-1 mt-2">
//                                 <p className="text-sm">
//                                   Check-in Date: {format(lockinInfo.checkInDate, 'dd MMM yyyy')}
//                                 </p>
//                                 <p className="text-sm">
//                                   Lock-in Period: {lockinInfo.lockinPeriodMonths} months
//                                 </p>
//                                 <p className="text-sm">
//                                   Lock-in Ends: {format(lockinInfo.lockinEnds, 'dd MMM yyyy')}
//                                 </p>
//                                 {lockinInfo.isInLockinPeriod && (
//                                   <>
//                                     <p className="text-sm">
//                                       Remaining: {lockinInfo.remainingMonths} month{lockinInfo.remainingMonths > 1 ? 's' : ''}
//                                     </p>
//                                     <p className="text-sm font-medium">
//                                       Early Vacate Penalty: {lockinInfo.penalty.description}
//                                     </p>
//                                     {lockinInfo.penalty.calculatedAmount && (
//                                       <p className="text-sm font-bold">
//                                         Amount Payable: ₹{lockinInfo.penalty.calculatedAmount.toFixed(2)}
//                                       </p>
//                                     )}
//                                   </>
//                                 )}
//                               </div>
                              
//                               {lockinInfo.isInLockinPeriod && (
//                                 <div className="flex items-start space-x-2 mt-3">
//                                   <Checkbox
//                                     id="agree_lockin_penalty"
//                                     checked={formData.vacateData?.agree_lockin_penalty || false}
//                                     onCheckedChange={(checked) => 
//                                       handleVacateDataChange('agree_lockin_penalty', checked)
//                                     }
//                                   />
//                                   <Label htmlFor="agree_lockin_penalty" className="text-sm cursor-pointer">
//                                     I understand and agree to pay the lock-in period penalty
//                                   </Label>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                       {/* Notice Period Information */}
//                       {noticeInfo && (
//                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                           <div className="flex items-start gap-3">
//                             <Info className="h-5 w-5 text-blue-600 mt-0.5" />
//                             <div className="flex-1">
//                               <h4 className="font-semibold text-blue-800">Notice Period Requirements</h4>
//                               <div className="space-y-1 mt-2">
//                                 <p className="text-sm text-blue-700">
//                                   Required Notice: {noticeInfo.noticePeriodDays} days
//                                 </p>
//                                 {noticeInfo.penalty.amount && (
//                                   <>
//                                     <p className="text-sm text-blue-700 font-medium">
//                                       Notice Period Penalty: {noticeInfo.penalty.description}
//                                     </p>
//                                     {noticeInfo.penalty.calculatedAmount && (
//                                       <p className="text-sm text-blue-700 font-bold">
//                                         Amount Payable: ₹{noticeInfo.penalty.calculatedAmount.toFixed(2)}
//                                       </p>
//                                     )}
//                                   </>
//                                 )}
//                               </div>
                              
//                               {noticeInfo.requiresAgreement && (
//                                 <div className="flex items-start space-x-2 mt-3">
//                                   <Checkbox
//                                     id="agree_notice_penalty"
//                                     checked={formData.vacateData?.agree_notice_penalty || false}
//                                     onCheckedChange={(checked) => 
//                                       handleVacateDataChange('agree_notice_penalty', checked)
//                                     }
//                                   />
//                                   <Label htmlFor="agree_notice_penalty" className="text-sm text-blue-800 cursor-pointer">
//                                     I understand and agree to the notice period requirements
//                                   </Label>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                       {/* Show message if no lock-in/notice info found */}
//                       {(!lockinInfo || !noticeInfo) && (
//                         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//                           <div className="flex items-center gap-3">
//                             <Info className="h-5 w-5 text-gray-600" />
//                             <div>
//                               <p className="text-sm text-gray-600">
//                                 {loading ? 'Loading contract details...' : 'Unable to load contract details'}
//                               </p>
//                               <p className="text-xs text-gray-500 mt-1">
//                                 {loading ? 'Please wait...' : 'Please check your contract terms or contact support'}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       )}

//                       {/* Expected Vacate Date */}
//                       <div>
//                         <Label htmlFor="expected_vacate_date">Expected Vacate Date *</Label>
//                         <Input
//                           id="expected_vacate_date"
//                           type="date"
//                           value={formData.vacateData?.expected_vacate_date || ''}
//                           onChange={(e) => handleVacateDataChange('expected_vacate_date', e.target.value)}
//                           min={new Date().toISOString().split('T')[0]}
//                           className="h-12"
//                         />
//                         <p className="text-xs text-gray-500 mt-1">
//                           Select when you plan to vacate
//                         </p>
//                       </div>

//                       <div>
//                         <Label htmlFor="primary_reason">Primary Reason for Vacating *</Label>
//                         <Select
//                           value={formData.vacateData?.primary_reason_id || ''}
//                           onValueChange={(value) => handleVacateDataChange('primary_reason_id', value)}
//                         >
//                           <SelectTrigger className="h-12">
//                             <SelectValue placeholder="Select primary reason" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {Array.isArray(vacateReasons) && vacateReasons.map((reason) => (
//                               <SelectItem key={reason.id} value={reason.id.toString()}>
//                                 {reason.value}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>

//                       <div>
//                         <Label htmlFor="secondary_reasons">
//                           Secondary Reasons (comma separated)
//                         </Label>
//                         <Input
//                           id="secondary_reasons"
//                           value={secondaryReasonsInput}
//                           onChange={(e) => setSecondaryReasonsInput(e.target.value)}
//                           placeholder="e.g., Distance from work, Need bigger room, etc."
//                           className="h-12"
//                         />
//                         <p className="text-xs text-gray-500 mt-1">
//                           Enter multiple reasons separated by commas
//                         </p>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <Label htmlFor="overall_rating">Overall Rating (1-5)</Label>
//                           <Select
//                             value={formData.vacateData?.overall_rating?.toString() || ''}
//                             onValueChange={(value) => handleVacateDataChange('overall_rating', parseInt(value))}
//                           >
//                             <SelectTrigger className="h-12">
//                               <SelectValue placeholder="Select rating" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="1">1 - Very Poor</SelectItem>
//                               <SelectItem value="2">2 - Poor</SelectItem>
//                               <SelectItem value="3">3 - Average</SelectItem>
//                               <SelectItem value="4">4 - Good</SelectItem>
//                               <SelectItem value="5">5 - Excellent</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>

//                         <div>
//                           <Label htmlFor="food_rating">Food Rating (1-5)</Label>
//                           <Select
//                             value={formData.vacateData?.food_rating?.toString() || ''}
//                             onValueChange={(value) => handleVacateDataChange('food_rating', parseInt(value))}
//                           >
//                             <SelectTrigger className="h-12">
//                               <SelectValue placeholder="Select rating" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="1">1 - Very Poor</SelectItem>
//                               <SelectItem value="2">2 - Poor</SelectItem>
//                               <SelectItem value="3">3 - Average</SelectItem>
//                               <SelectItem value="4">4 - Good</SelectItem>
//                               <SelectItem value="5">5 - Excellent</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>

//                         <div>
//                           <Label htmlFor="cleanliness_rating">Cleanliness Rating (1-5)</Label>
//                           <Select
//                             value={formData.vacateData?.cleanliness_rating?.toString() || ''}
//                             onValueChange={(value) => handleVacateDataChange('cleanliness_rating', parseInt(value))}
//                           >
//                             <SelectTrigger className="h-12">
//                               <SelectValue placeholder="Select rating" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="1">1 - Very Poor</SelectItem>
//                               <SelectItem value="2">2 - Poor</SelectItem>
//                               <SelectItem value="3">3 - Average</SelectItem>
//                               <SelectItem value="4">4 - Good</SelectItem>
//                               <SelectItem value="5">5 - Excellent</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>

//                         <div>
//                           <Label htmlFor="management_rating">Management Rating (1-5)</Label>
//                           <Select
//                             value={formData.vacateData?.management_rating?.toString() || ''}
//                             onValueChange={(value) => handleVacateDataChange('management_rating', parseInt(value))}
//                           >
//                             <SelectTrigger className="h-12">
//                               <SelectValue placeholder="Select rating" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="1">1 - Very Poor</SelectItem>
//                               <SelectItem value="2">2 - Poor</SelectItem>
//                               <SelectItem value="3">3 - Average</SelectItem>
//                               <SelectItem value="4">4 - Good</SelectItem>
//                               <SelectItem value="5">5 - Excellent</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       </div>

//                       <div>
//                         <Label htmlFor="improvement_suggestions">Improvement Suggestions</Label>
//                         <Textarea
//                           id="improvement_suggestions"
//                           value={formData.vacateData?.improvement_suggestions || ''}
//                           onChange={(e) => handleVacateDataChange('improvement_suggestions', e.target.value)}
//                           placeholder="Any suggestions for improvement..."
//                           rows={3}
//                         />
//                       </div>
//                     </div>
//                   )}
//                   {/* Conditional rendering for Leave Request */}
// {formData.request_type === 'leave' && (
//   <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
//     <h3 className="font-semibold text-lg">Leave Application Details</h3>
    
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <Label htmlFor="leave_type">Leave Type *</Label>
//         <Select
//           value={formData.leaveData?.leave_type || ''}
//           onValueChange={(value) => handleLeaveDataChange('leave_type', value)}
//         >
//           <SelectTrigger className="h-12">
//             <SelectValue placeholder="Select leave type" />
//           </SelectTrigger>
//           <SelectContent>
//             {leaveTypes.map((type) => (
//               <SelectItem key={type.id} value={type.value}>
//                 <div className="flex flex-col">
//                   <span className="font-medium">{type.value}</span>
//                   {type.description && (
//                     <span className="text-xs text-gray-500">{type.description}</span>
//                   )}
//                 </div>
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
      
//       <div>
//         <Label htmlFor="total_days">Total Days *</Label>
//         <Input
//           id="total_days"
//           type="number"
//           min="1"
//           max="30"
//           value={formData.leaveData?.total_days || ''}
//           onChange={(e) => handleLeaveDataChange('total_days', parseInt(e.target.value))}
//           placeholder="Enter number of days"
//           className="h-12"
//         />
//         <p className="text-xs text-gray-500 mt-1">Maximum 30 days allowed</p>
//       </div>
//     </div>
    
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <Label htmlFor="leave_start_date">Leave Start Date *</Label>
//         <Input
//           id="leave_start_date"
//           type="date"
//           value={formData.leaveData?.leave_start_date || ''}
//           onChange={(e) => {
//             handleLeaveDataChange('leave_start_date', e.target.value);
//             // Auto-calculate end date based on total days
//             if (formData.leaveData?.total_days && e.target.value) {
//               const startDate = new Date(e.target.value);
//               const endDate = new Date(startDate);
//               endDate.setDate(startDate.getDate() + (formData.leaveData.total_days - 1));
//               handleLeaveDataChange('leave_end_date', endDate.toISOString().split('T')[0]);
//             }
//           }}
//           min={new Date().toISOString().split('T')[0]}
//           className="h-12"
//         />
//       </div>
      
//       <div>
//         <Label htmlFor="leave_end_date">Leave End Date *</Label>
//         <Input
//           id="leave_end_date"
//           type="date"
//           value={formData.leaveData?.leave_end_date || ''}
//           onChange={(e) => handleLeaveDataChange('leave_end_date', e.target.value)}
//           min={formData.leaveData?.leave_start_date || new Date().toISOString().split('T')[0]}
//           className="h-12"
//         />
//       </div>
//     </div>
    
//     <div>
//       <Label htmlFor="contact_address_during_leave">Contact Address During Leave</Label>
//       <Textarea
//         id="contact_address_during_leave"
//         value={formData.leaveData?.contact_address_during_leave || ''}
//         onChange={(e) => handleLeaveDataChange('contact_address_during_leave', e.target.value)}
//         placeholder="Your address during the leave period"
//         rows={2}
//       />
//     </div>
    
//     <div>
//       <Label htmlFor="emergency_contact_number">Emergency Contact Number</Label>
//       <Input
//         id="emergency_contact_number"
//         type="tel"
//         value={formData.leaveData?.emergency_contact_number || ''}
//         onChange={(e) => handleLeaveDataChange('emergency_contact_number', e.target.value)}
//         placeholder="Emergency contact number"
//         className="h-12"
//       />
//     </div>
    
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div className="flex items-center space-x-2">
//         <Checkbox
//           id="room_locked"
//           checked={formData.leaveData?.room_locked || false}
//           onCheckedChange={(checked) => handleLeaveDataChange('room_locked', checked)}
//         />
//         <Label htmlFor="room_locked" className="cursor-pointer">Room will be locked during leave</Label>
//       </div>
      
//       <div className="flex items-center space-x-2">
//         <Checkbox
//           id="keys_submitted"
//           checked={formData.leaveData?.keys_submitted || false}
//           onCheckedChange={(checked) => handleLeaveDataChange('keys_submitted', checked)}
//         />
//         <Label htmlFor="keys_submitted" className="cursor-pointer">Keys will be submitted before leave</Label>
//       </div>
//     </div>
//   </div>
// )}

// {/* Add this in the DialogContent section where you have other conditional renders */}
// {formData.request_type === 'maintenance' && (
//   <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
//     <h3 className="font-semibold text-lg">Maintenance Request Details</h3>
    
//     {/* Issue Category */}
//     <div>
//       <Label htmlFor="issue_category">Issue Category *</Label>
//       <Select
//         value={formData.maintenanceData?.issue_category || ''}
//         onValueChange={(value) => handleMaintenanceDataChange('issue_category', value)}
//       >
//         <SelectTrigger className="h-12">
//           <SelectValue placeholder="Select issue category" />
//         </SelectTrigger>
//         <SelectContent>
//           {maintenanceCategories.map((category) => (
//             <SelectItem key={category.id} value={category.id}>
//               {category.label}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>

//     {/* Location */}
//     <div>
//       <Label htmlFor="location">Location *</Label>
//       <Select
//         value={formData.maintenanceData?.location || ''}
//         onValueChange={(value) => handleMaintenanceDataChange('location', value)}
//       >
//         <SelectTrigger className="h-12">
//           <SelectValue placeholder="Select location" />
//         </SelectTrigger>
//         <SelectContent>
//           {maintenanceLocations.map((location) => (
//             <SelectItem key={location.id} value={location.id}>
//               {location.label}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>

//     {/* Preferred Visit Time */}
//     <div>
//       <Label htmlFor="preferred_visit_time">Preferred Visit Time</Label>
//       <Select
//         value={formData.maintenanceData?.preferred_visit_time || ''}
//         onValueChange={(value) => handleMaintenanceDataChange('preferred_visit_time', value)}
//       >
//         <SelectTrigger className="h-12">
//           <SelectValue placeholder="Select preferred time" />
//         </SelectTrigger>
//         <SelectContent>
//           {visitTimes.map((time) => (
//             <SelectItem key={time.id} value={time.id}>
//               {time.label}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>

//     {/* Access Permission */}
//     <div className="flex items-center space-x-2">
//       <Checkbox
//         id="access_permission"
//         checked={formData.maintenanceData?.access_permission || false}
//         onCheckedChange={(checked) => handleMaintenanceDataChange('access_permission', checked)}
//       />
//       <Label htmlFor="access_permission" className="cursor-pointer">
//         I grant permission for staff to enter my room when I'm away if needed
//       </Label>
//     </div>

//     {/* Additional Notes (using existing description field) */}
//     {/* <div>
//       <Label htmlFor="additional_notes">Additional Details</Label>
//       <Textarea
//         id="additional_notes"
//         value={formData.description}
//         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//         placeholder="Please provide detailed description of the issue..."
//         rows={3}
//       />
//       <p className="text-xs text-gray-500 mt-1">
//         Describe the problem in detail including when it started, frequency, etc.
//       </p>
//     </div> */}
//   </div>
// )}

// {/* Add this in the DialogContent section where you have other conditional renders */}
// {formData.request_type === 'complaint' && (
//   <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
//     <h3 className="font-semibold text-lg text-red-800">Complaint Details</h3>
    
//     {/* Complaint Category */}
//     <div>
//       <Label htmlFor="complaint_category" className="text-base">Complaint Category *</Label>
//       <Select
//         value={formData.complaintData?.category_master_type_id?.toString() || ''}
//   onValueChange={(value) => handleComplaintCategoryChange(parseInt(value))}
//       >
//         <SelectTrigger className="h-12">
//           <SelectValue placeholder="Select complaint category" />
//         </SelectTrigger>
//         <SelectContent>
//           {complaintCategories.map((category) => (
//             <SelectItem key={category.id} value={category.id.toString()}>
//               <div className="flex flex-col">
//                 <span className="font-medium">{category.name}</span>
//                 {category.description && (
//                   <span className="text-xs text-gray-500">{category.description}</span>
//                 )}
//               </div>
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>

//     {/* Complaint Reason - Only show if category is selected */}
//     {selectedComplaintCategory && complaintReasons.length > 0 && (
//       <div>
//         <Label htmlFor="complaint_reason" className="text-base">Select Reason *</Label>
//         <Select
//           value={formData.complaintData?.reason_master_value_id?.toString() || ''}
//           onValueChange={(value) => {
//             const reason = complaintReasons.find(r => r.id.toString() === value);
//             handleComplaintReasonChange(parseInt(value), reason?.value || '');
//           }}
//         >
//           <SelectTrigger className="h-12">
//             <SelectValue placeholder="Select reason for complaint" />
//           </SelectTrigger>
//           <SelectContent>
//             {complaintReasons.map((reason) => (
//               <SelectItem key={reason.id} value={reason.id.toString()}>
//                 <div className="flex flex-col">
//                   <span className="font-medium">{reason.value}</span>
//                   {reason.description && (
//                     <span className="text-xs text-gray-500">{reason.description}</span>
//                   )}
//                 </div>
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//     )}

//     {/* Custom Reason Input - Only show if "Others" is selected */}
//     {showCustomReason && (
//       <div>
//         <Label htmlFor="custom_reason" className="text-base">Please specify your reason *</Label>
//         <Textarea
//           id="custom_reason"
//           value={formData.complaintData?.custom_reason || ''}
//           onChange={(e) => handleCustomReasonChange(e.target.value)}
//           placeholder="Please describe your complaint in detail..."
//           rows={3}
//           className="mt-1"
//         />
//         <p className="text-xs text-gray-500 mt-1">
//           Provide specific details about your complaint
//         </p>
//       </div>
//     )}

    
//   </div>
// )}
//                 </div>

//                 <DialogFooter>
//                   <Button
//                     variant="outline"
//                     onClick={() => setIsDialogOpen(false)}
//                     disabled={submitting}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleSubmit}
//                     className="bg-blue-600 hover:bg-blue-700"
//                     disabled={submitting}
//                   >
//                     {submitting ? (
//                       <>
//                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                         Submitting...
//                       </>
//                     ) : (
//                       <>
//                         <Send className="h-4 w-4 mr-2" />
//                         Submit Request
//                       </>
//                     )}
//                   </Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </div>

//           {/* Quick Request Cards - ALWAYS SHOWN */}
//           <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
//             {quickRequests.map((item) => (
//               <Card
//                 key={item.type}
//                 className={`cursor-pointer transition-all hover:shadow-lg ${item.color}`}
//                 onClick={() => handleQuickRequest(item.type)}
//               >
//                 <CardContent className="p-4">
//                   <item.icon className="h-6 w-6 mb-2" />
//                   <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
//                   <p className="text-xs text-gray-600">{item.description}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>Request History</CardTitle>
//               <CardDescription>
//                 View and track all your requests. Total: {requests.length} requests
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Tabs defaultValue="all">
//                 <TabsList className="grid w-full grid-cols-5">
//                   <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
//                   <TabsTrigger value="pending">Pending ({filterRequestsByStatus('pending').length})</TabsTrigger>
//                   <TabsTrigger value="in_progress">In Progress ({filterRequestsByStatus('in_progress').length})</TabsTrigger>
//                   <TabsTrigger value="resolved">Resolved ({filterRequestsByStatus('resolved').length})</TabsTrigger>
//                   <TabsTrigger value="closed">Closed ({filterRequestsByStatus('closed').length})</TabsTrigger>
//                 </TabsList>

//                 {['all', 'pending', 'in_progress', 'resolved', 'closed'].map((tabValue) => (
//                   <TabsContent key={tabValue} value={tabValue} className="mt-6">
//                     {filterRequestsByStatus(tabValue).length === 0 ? (
//                       <div className="text-center py-12">
//                         <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
//                         <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
//                         <p className="text-gray-600 mb-6">
//                           {tabValue === 'all' 
//                             ? "You haven't created any requests yet." 
//                             : `You have no ${tabValue.replace('_', ' ')} requests.`}
//                         </p>
//                         <Button 
//                           onClick={() => setIsDialogOpen(true)}
//                           className="bg-blue-600 hover:bg-blue-700"
//                         >
//                           <Plus className="h-4 w-4 mr-2" />
//                           Create New Request
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="space-y-4">
//                         {filterRequestsByStatus(tabValue).map((request) => (
//                           <Card key={request.id} className="overflow-hidden">
//                             <CardContent className="p-6">
//                               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                                 <div className="flex-1">
//                                   <div className="flex items-center gap-3 mb-2">
//                                     {getRequestTypeIcon(request.request_type)}
//                                     <h3 className="font-semibold text-lg">{request.title}</h3>
//                                     <div className="flex items-center gap-2">
//                                       {getStatusBadge(request.status)}
//                                       {getPriorityBadge(request.priority)}
//                                     </div>
//                                   </div>
                                  
//                                   <p className="text-gray-600 mb-4">{request.description}</p>
                                  
//                                   <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
//                                     <div className="flex items-center gap-1">
//                                       <Calendar className="h-4 w-4" />
//                                       <span>Created: {format(new Date(request.created_at), 'dd MMM yyyy')}</span>
//                                     </div>
//                                     <div className="flex items-center gap-1">
//                                       <Clock className="h-4 w-4" />
//                                       <span>Updated: {format(new Date(request.updated_at), 'dd MMM yyyy')}</span>
//                                     </div>
                                    
//                                     {request.request_type === 'vacate_bed' && request.vacate_data && (
//                                       <div className="flex items-center gap-1">
//                                         <Move className="h-4 w-4" />
//                                         <span>Vacate Request</span>
//                                         {request.vacate_data.expected_vacate_date && (
//                                           <span className="ml-2">
//                                             (Expected: {format(new Date(request.vacate_data.expected_vacate_date), 'dd MMM yyyy')})
//                                           </span>
//                                         )}
//                                       </div>
//                                     )}
//                                   </div>
                                  
//                                   {/* Show additional details for vacate bed requests */}
//                                   {request.request_type === 'vacate_bed' && request.vacate_data && (
//                                     <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
//                                       <h4 className="font-medium text-sm mb-2">Vacate Details:</h4>
//                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//                                         {request.vacate_data.primary_reason_id && (
//                                           <div>
//                                             <span className="font-medium">Primary Reason: </span>
//                                             <span>
//                                               {findVacateReason(request.vacate_data.primary_reason_id?.toString())}
//                                             </span>
//                                           </div>
//                                         )}
                                        
//                                         {request.vacate_data.secondary_reasons && (
//                                           <div>
//                                             <span className="font-medium">Other Reasons: </span>
//                                             <span>{request.vacate_data.secondary_reasons}</span>
//                                           </div>
//                                         )}
                                        
//                                         {request.vacate_data.overall_rating && (
//                                           <div>
//                                             <span className="font-medium">Overall Rating: </span>
//                                             <span>{request.vacate_data.overall_rating}/5</span>
//                                           </div>
//                                         )}
                                        
//                                         {request.vacate_data.food_rating && (
//                                           <div>
//                                             <span className="font-medium">Food Rating: </span>
//                                             <span>{request.vacate_data.food_rating}/5</span>
//                                           </div>
//                                         )}
                                        
//                                         {request.vacate_data.cleanliness_rating && (
//                                           <div>
//                                             <span className="font-medium">Cleanliness Rating: </span>
//                                             <span>{request.vacate_data.cleanliness_rating}/5</span>
//                                           </div>
//                                         )}
                                        
//                                         {request.vacate_data.management_rating && (
//                                           <div>
//                                             <span className="font-medium">Management Rating: </span>
//                                             <span>{request.vacate_data.management_rating}/5</span>
//                                           </div>
//                                         )}
                                        
//                                         {request.vacate_data.improvement_suggestions && (
//                                           <div className="md:col-span-2">
//                                             <span className="font-medium">Suggestions: </span>
//                                             <span>{request.vacate_data.improvement_suggestions}</span>
//                                           </div>
//                                         )}
                                        
//                                         {request.vacate_data.lockin_penalty_accepted && (
//                                           <div className="md:col-span-2">
//                                             <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
//                                               <Check className="h-3 w-3 mr-1" />
//                                               Lock-in Penalty Accepted
//                                             </Badge>
//                                           </div>
//                                         )}
                                        
//                                         {request.vacate_data.notice_penalty_accepted && (
//                                           <div className="md:col-span-2">
//                                             <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
//                                               <Check className="h-3 w-3 mr-1" />
//                                               Notice Period Accepted
//                                             </Badge>
//                                           </div>
//                                         )}
//                                       </div>
//                                     </div>
//                                   )}

//                                   {/* Show change bed details if available */}
//                                     {request.request_type === 'change_bed' && request.change_bed_data && (
//                                       <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
//                                         <h4 className="font-medium text-sm mb-2 text-teal-800">Change Bed Details:</h4>
//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//                                           <div>
//                                             <span className="font-medium text-teal-700">Preferred Property: </span>
//                                             <span>{request.change_bed_data.preferred_property_name || 'N/A'}</span>
//                                           </div>
//                                           <div>
//                                             <span className="font-medium text-teal-700">Preferred Room: </span>
//                                             <span>{request.change_bed_data.preferred_room_number || 'N/A'}</span>
//                                           </div>
//                                           <div>
//                                             <span className="font-medium text-teal-700">Change Reason: </span>
//                                             <span>{request.change_bed_data.change_reason || 'N/A'}</span>
//                                           </div>
//                                           <div>
//                                             <span className="font-medium text-teal-700">Shifting Date: </span>
//                                             <span>{request.change_bed_data.shifting_date ? format(new Date(request.change_bed_data.shifting_date), 'dd MMM yyyy') : 'N/A'}</span>
//                                           </div>
//                                           {request.change_bed_data.notes && (
//                                             <div className="md:col-span-2">
//                                               <span className="font-medium text-teal-700">Notes: </span>
//                                               <span>{request.change_bed_data.notes}</span>
//                                             </div>
//                                           )}
//                                         </div>
//                                       </div>
//                                     )}

// {/* Show leave details if available */}
// {request.request_type === 'leave' && request.leave_data && (
//   <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
//     <h4 className="font-medium text-sm mb-2 text-purple-800">Leave Details:</h4>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//       <div>
//         <span className="font-medium text-purple-700">Leave Type: </span>
//         <span className="capitalize">{request.leave_data.leave_type}</span>
//       </div>
//       <div>
//         <span className="font-medium text-purple-700">Duration: </span>
//         <span>{request.leave_data.total_days} days</span>
//       </div>
//       <div>
//         <span className="font-medium text-purple-700">From: </span>
//         <span>{format(new Date(request.leave_data.leave_start_date), 'dd MMM yyyy')}</span>
//       </div>
//       <div>
//         <span className="font-medium text-purple-700">To: </span>
//         <span>{format(new Date(request.leave_data.leave_end_date), 'dd MMM yyyy')}</span>
//       </div>
//       {request.leave_data.contact_address_during_leave && (
//         <div>
//           <span className="font-medium text-purple-700">Contact Address: </span>
//           <span>{request.leave_data.contact_address_during_leave}</span>
//         </div>
//       )}
//       {request.leave_data.emergency_contact_number && (
//         <div>
//           <span className="font-medium text-purple-700">Emergency Contact: </span>
//           <span>{request.leave_data.emergency_contact_number}</span>
//         </div>
//       )}
//       <div className="flex gap-2">
//         {request.leave_data.room_locked && (
//           <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
//             <Check className="h-3 w-3 mr-1" />
//             Room Locked
//           </Badge>
//         )}
//         {request.leave_data.keys_submitted && (
//           <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
//             <Check className="h-3 w-3 mr-1" />
//             Keys Submitted
//           </Badge>
//         )}
//       </div>
//     </div>
//   </div>
// )}

// {/* Add this in the request display section, after other conditional displays */}
// {request.request_type === 'maintenance' && request.maintenance_data && (
//   <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
//     <h4 className="font-medium text-sm mb-2 text-orange-800">Maintenance Details:</h4>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//       <div>
//         <span className="font-medium text-orange-700">Issue Category: </span>
//         <span className="capitalize">{request.maintenance_data.issue_category}</span>
//       </div>
//       <div>
//         <span className="font-medium text-orange-700">Location: </span>
//         <span className="capitalize">{request.maintenance_data.location}</span>
//       </div>
//       <div>
//         <span className="font-medium text-orange-700">Preferred Visit Time: </span>
//         <span className="capitalize">{request.maintenance_data.preferred_visit_time || 'Anytime'}</span>
//       </div>
//       <div className="flex gap-2">
//         {request.maintenance_data.access_permission && (
//           <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
//             <Check className="h-3 w-3 mr-1" />
//             Access Permission Granted
//           </Badge>
//         )}
//       </div>
//     </div>
//   </div>
// )}

// {/* Add this in the request display section, after other conditional displays */}
// {request.request_type === 'complaint' && request.complaint_data && (
//   <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
//     <h4 className="font-medium text-sm mb-2 text-red-800">Complaint Details:</h4>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//       <div>
//         <span className="font-medium text-red-700">Category: </span>
//         <span>{request.complaint_data.complaint_category_name || 'N/A'}</span>
//       </div>
//       <div>
//         <span className="font-medium text-red-700">Reason: </span>
//         <span>
//           {request.complaint_data.complaint_reason_name || 
//            request.complaint_data.custom_reason || 
//            'N/A'}
//         </span>
//       </div>
//       {request.complaint_data.custom_reason && (
//         <div className="md:col-span-2">
//           <span className="font-medium text-red-700">Custom Reason: </span>
//           <span>{request.complaint_data.custom_reason}</span>
//         </div>
//       )}
//     </div>
//   </div>
// )}
//                                 </div>
//                               </div>
//                             </CardContent>
//                           </Card>
//                         ))}
//                       </div>
//                     )}
//                   </TabsContent>
//                 ))}
//               </Tabs>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }


// app/tenant/requests/page.tsx
import { Suspense } from 'react';
import TenantRequestsClient from '@/components/tenant/tenant-requests/TenantRequestsClient';
import Loading from '@/components/tenant/tenant-requests/loading';

// This is now a client-only page - server component just wraps it
export default function TenantRequestsPage() {
  return (
    <Suspense fallback={<Loading />}>
      {/* <TenantRequestsClient initialData ={{
        requests: [],
        isAuthenticated: false,
        error: null
      }} /> */}
      <TenantRequestsClient />
    </Suspense>
  );
}