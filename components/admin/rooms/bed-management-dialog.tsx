// "use client";

// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { toast } from "sonner";
// import {
//   Bed, MapPin, UserPlus, UserMinus, BadgeIndianRupee,
//   ClipboardList, AlertCircle, Check, X,
//   UserRound, Globe, Eye, Filter, Save,
//   UsersRound, Mail, Phone, Calendar, PersonStanding,
//   Search
// } from 'lucide-react';
// import { getAvailableBeds, assignBed, updateBedAssignment } from '@/lib/roomsApi';
// import { request } from '@/lib/api';
// import type { RoomResponse, BedAssignment } from '@/lib/roomsApi';

// interface BedManagementDialogProps {
//   room: RoomResponse;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onRefresh?: () => void;
// }

// interface BedAssignmentState {
//   tenantId: string;
//   selectedTenant: any | null;
//   selectedGender: string;
// }

// interface Tenant {
//   id: number;
//   full_name: string;
//   email: string;
//   phone: string;
//   gender: string;
//   is_active: boolean;
//   portal_access_enabled: boolean;
//   couple_id?: number;
// }

// interface ApiResult<T = any> {
//   success: boolean;
//   message?: string;
//   data?: T;
// }

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

// function TenantSelectionSection({
//   bedNumber,
//   bedState,
//   updateBedAssignmentState,
//   tenants,
//   loadingTenants,
//   searchQuery,
//   setSearchQuery,
//   roomGenderPreferences
// }: {
//   bedNumber: number;
//   bedState: BedAssignmentState;
//   updateBedAssignmentState: (bedNumber: number, updates: Partial<BedAssignmentState>) => void;
//   tenants: Tenant[];
//   loadingTenants: boolean;
//   searchQuery: string;
//   setSearchQuery: (query: string) => void;
//   roomGenderPreferences: string[];
// }) {
//   const filteredTenants = tenants.filter(tenant => {
//     const matchesSearch = !searchQuery || 
//       tenant.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       tenant.phone?.includes(searchQuery) ||
//       tenant.id?.toString().includes(searchQuery);
    
//     if (roomGenderPreferences.length > 0) {
//       const tenantGender = tenant.gender?.toLowerCase();
//       const tenantIsCouple = tenant.couple_id != null;
      
//       const matchesGender = roomGenderPreferences.some(pref => {
//         const prefLower = pref.toLowerCase();
        
//         // For couples preference - show ALL tenants (both individuals and couples)
//         // Couples rooms can have individual tenants or couples
//         if (prefLower === 'couples') {
//           return true; // Show all tenants for couples preference
//         }
//         // For male preference
//         else if (prefLower === 'male_only' || prefLower === 'male') {
//           return tenantGender === 'male' && !tenantIsCouple; // Male only, not couples
//         }
//         // For female preference
//         else if (prefLower === 'female_only' || prefLower === 'female') {
//           return tenantGender === 'female' && !tenantIsCouple; // Female only, not couples
//         }
//         // For "both" or mixed gender rooms
//         else if (prefLower === 'both' || prefLower === 'any' || prefLower === 'mixed') {
//           return !tenantIsCouple; // Show individual tenants only (male or female)
//         }
//         return true;
//       });
//       return matchesSearch && matchesGender;
//     }
    
//     return matchesSearch;
//   });

//   // Sort tenants: couples first, then by name
//   const sortedTenants = [...filteredTenants].sort((a, b) => {
//     // Couples first
//     if (a.couple_id && !b.couple_id) return -1;
//     if (!a.couple_id && b.couple_id) return 1;
//     // Then by name
//     return a.full_name?.localeCompare(b.full_name || '') || 0;
//   });

//   return (
//     <div className="space-y-3">
//       <div>
//         <Label htmlFor={`search-${bedNumber}`} className="text-xs flex items-center gap-2 mb-1">
//           <Search className="h-3 w-3" />
//           Search Tenant
//         </Label>
//         <Input
//           id={`search-${bedNumber}`}
//           placeholder="Search by name, email, phone or ID..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="h-8 text-xs"
//         />
//       </div>

//       {roomGenderPreferences.length > 0 && (
//         <div className="p-2 bg-blue-50 rounded border border-blue-200">
//           <p className="text-xs text-blue-700 font-medium mb-1">Room Preferences:</p>
//           <div className="flex flex-wrap gap-1">
//             {roomGenderPreferences.map(pref => {
//               const prefLower = pref.toLowerCase();
//               let label = '';
//               let color = 'bg-gray-100 text-gray-700 border-gray-300';
              
//               if (prefLower === 'male_only' || prefLower === 'male') {
//                 label = 'Male Only';
//                 color = 'bg-blue-100 text-blue-700 border-blue-300';
//               } else if (prefLower === 'female_only' || prefLower === 'female') {
//                 label = 'Female Only';
//                 color = 'bg-pink-100 text-pink-700 border-pink-300';
//               } else if (prefLower === 'couples') {
//                 label = 'Couples Room';
//                 color = 'bg-red-100 text-red-700 border-red-300';
//               } else if (prefLower === 'both' || prefLower === 'any' || prefLower === 'mixed') {
//                 label = 'Mixed Gender';
//                 color = 'bg-purple-100 text-purple-700 border-purple-300';
//               }
              
//               return (
//                 <Badge key={pref} variant="outline" className={`text-xs ${color}`}>
//                   {label}
//                 </Badge>
//               );
//             })}
//           </div>
//           {roomGenderPreferences.some(p => p.toLowerCase() === 'couples') && (
//             <p className="text-xs text-blue-600 mt-1">
//               Couples room: Can assign individual tenants or couples
//             </p>
//           )}
//         </div>
//       )}

//       <div>
//         <Label htmlFor={`tenant-select-${bedNumber}`} className="text-xs flex items-center gap-2 mb-1">
//           <UserRound className="h-3 w-3" />
//           Select Tenant *
//         </Label>
//         <Select
//           value={bedState.tenantId}
//           onValueChange={(value) => {
//             const tenant = tenants.find(t => t.id.toString() === value);
//             updateBedAssignmentState(bedNumber, {
//               tenantId: value,
//               selectedTenant: tenant || null
//             });
//           }}
//           disabled={loadingTenants}
//         >
//           <SelectTrigger className="h-9 text-sm">
//             <SelectValue placeholder={
//               loadingTenants ? "Loading tenants..." : 
//               sortedTenants.length > 0 ? "Select a tenant" : 
//               searchQuery ? "No tenants found matching search" : "No tenants available"
//             } />
//           </SelectTrigger>
//           <SelectContent className="max-h-64">
//             {loadingTenants ? (
//               <div className="p-4 text-center">
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mx-auto"></div>
//                 <p className="text-xs text-gray-500 mt-2">Loading tenants...</p>
//               </div>
//             ) : sortedTenants.length === 0 ? (
//               <div className="p-4 text-center text-gray-500">
//                 <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
//                 <p className="text-xs">
//                   {searchQuery ? "No tenants match your search." : "No tenants match room preferences."}
//                 </p>
//                 {roomGenderPreferences.length > 0 && (
//                   <p className="text-xs mt-1">Room preferences may be restricting results.</p>
//                 )}
//               </div>
//             ) : (
//               <div>
//                 {/* Couples Section */}
//                 {sortedTenants.some(t => t.couple_id) && (
//                   <div className="px-3 py-2">
//                     <div className="text-xs font-semibold text-red-600 flex items-center gap-1">
//                       <UsersRound className="h-3 w-3" />
//                       Couples
//                     </div>
//                   </div>
//                 )}
//                 {sortedTenants
//                   .filter(tenant => tenant.couple_id)
//                   .map(tenant => (
//                     <SelectItem 
//                       key={tenant.id} 
//                       value={tenant.id.toString()}
//                     >
//                       <div className="flex items-center gap-2 py-1">
//                         <UsersRound className="h-5 w-5 text-red-600" />
//                         <div className="flex-1 min-w-0">
//                           <div className="font-medium truncate text-sm flex items-center gap-1">
//                             {tenant.full_name}
//                             <Badge variant="outline" className="h-4 px-1 text-xs bg-red-50 text-red-700 border-red-200">
//                               Couple
//                             </Badge>
//                           </div>
//                           <div className="text-xs text-gray-500 truncate flex items-center gap-2">
//                             <span>ID: {tenant.id}</span>
//                             <span>•</span>
//                             <span className="flex items-center gap-1">
//                               <GenderIcon gender={tenant.gender || 'Other'} size="h-3 w-3" />
//                               {tenant.gender || 'Not specified'}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </SelectItem>
//                 ))}

//                 {/* Individuals Section */}
//                 {sortedTenants.some(t => !t.couple_id) && (
//                   <div className="px-3 py-2 border-t">
//                     <div className="text-xs font-semibold text-gray-600 flex items-center gap-1">
//                       <UserRound className="h-3 w-3" />
//                       Individual Tenants
//                     </div>
//                   </div>
//                 )}
//                 {sortedTenants
//                   .filter(tenant => !tenant.couple_id)
//                   .map(tenant => (
//                     <SelectItem 
//                       key={tenant.id} 
//                       value={tenant.id.toString()}
//                     >
//                       <div className="flex items-center gap-2 py-1">
//                         <GenderIcon gender={tenant.gender || 'Other'} size="h-5 w-5" />
//                         <div className="flex-1 min-w-0">
//                           <div className="font-medium truncate text-sm">
//                             {tenant.full_name}
//                           </div>
//                           <div className="text-xs text-gray-500 truncate flex items-center gap-2">
//                             <span>ID: {tenant.id}</span>
//                             <span>•</span>
//                             <span className="flex items-center gap-1">
//                               <GenderIcon gender={tenant.gender || 'Other'} size="h-3 w-3" />
//                               {tenant.gender || 'Not specified'}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </SelectItem>
//                 ))}
//               </div>
//             )}
//           </SelectContent>
//         </Select>
//       </div>
      
//       {bedState.selectedTenant && (
//         <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//           <div className="flex items-center justify-between mb-3">
//             <div className="flex items-center gap-2">
//               <Eye className="h-4 w-4 text-blue-600" />
//               <span className="text-sm font-bold text-blue-700">Selected Tenant:</span>
//             </div>
//             {bedState.selectedTenant.couple_id ? (
//               <UsersRound className="h-5 w-5 text-red-600" />
//             ) : (
//               <GenderIcon gender={bedState.selectedTenant.gender || 'Other'} />
//             )}
//           </div>
          
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <span className="text-xs text-gray-600 block">Name:</span>
//               <span className="text-sm font-medium truncate block">
//                 {bedState.selectedTenant.full_name}
//                 {bedState.selectedTenant.couple_id && (
//                   <Badge variant="outline" className="ml-2 h-4 px-1 text-xs bg-red-50 text-red-700 border-red-200">
//                     Couple
//                   </Badge>
//                 )}
//               </span>
//             </div>
//             <div>
//               <span className="text-xs text-gray-600 block">ID:</span>
//               <span className="text-sm font-mono">{bedState.selectedTenant.id}</span>
//             </div>
//             <div>
//               <span className="text-xs text-gray-600 block">Gender:</span>
//               <div className="flex items-center gap-1">
//                 {bedState.selectedTenant.couple_id ? (
//                   <UsersRound className="h-3 w-3 text-red-600" />
//                 ) : (
//                   <GenderIcon gender={bedState.selectedTenant.gender || 'Other'} size="h-3 w-3" />
//                 )}
//                 <span className="text-sm">
//                   {bedState.selectedTenant.couple_id ? 'Couple' : bedState.selectedTenant.gender || 'Not specified'}
//                 </span>
//               </div>
//             </div>
//             <div>
//               <span className="text-xs text-gray-600 block">Status:</span>
//               <Badge variant="outline" className={
//                 bedState.selectedTenant.is_active 
//                   ? 'bg-green-100 text-green-800 border-green-300 text-xs'
//                   : 'bg-red-100 text-red-800 border-red-300 text-xs'
//               }>
//                 {bedState.selectedTenant.is_active ? 'Active' : 'Inactive'}
//               </Badge>
//             </div>
//           </div>
          
//           {bedState.selectedTenant.phone && (
//             <div className="mt-3 pt-3 border-t">
//               <div className="flex items-center gap-2">
//                 <Phone className="h-3 w-3 text-gray-500" />
//                 <span className="text-xs font-medium">{bedState.selectedTenant.phone}</span>
//               </div>
//             </div>
//           )}
          
//           {bedState.selectedTenant.email && (
//             <div className="flex items-center gap-2 mt-1">
//               <Mail className="h-3 w-3 text-gray-500" />
//               <span className="text-xs truncate">{bedState.selectedTenant.email}</span>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export function BedManagementDialog({ room, open, onOpenChange, onRefresh }: BedManagementDialogProps) {
//   const [bedAssignments, setBedAssignments] = useState<BedAssignment[]>(room.bed_assignments || []);
//   const [assigningBed, setAssigningBed] = useState<number | null>(null);
//   const [availableBeds, setAvailableBeds] = useState<BedAssignment[]>([]);
//   const [tenants, setTenants] = useState<Tenant[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingTenants, setLoadingTenants] = useState(false);
//   const [savingBed, setSavingBed] = useState<number | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // State for vacate reason dialog
//   const [vacateReason, setVacateReason] = useState('');
//   const [vacateDialogOpen, setVacateDialogOpen] = useState(false);
//   const [selectedBedToVacate, setSelectedBedToVacate] = useState<BedAssignment | null>(null);
  
//   // State for transfer confirmation dialog
//   const [transferDialogOpen, setTransferDialogOpen] = useState(false);
//   const [transferDetails, setTransferDetails] = useState<{
//     bedAssignment: BedAssignment | null;
//     newTenant: any | null;
//     existingAssignment: any | null;
//   }>({
//     bedAssignment: null,
//     newTenant: null,
//     existingAssignment: null
//   });
//   const [transferReason, setTransferReason] = useState('');
  
//   const [bedAssignmentStates, setBedAssignmentStates] = useState<Record<number, BedAssignmentState>>({});

//   const roomGenderPreferences = Array.isArray(room.room_gender_preference) 
//     ? room.room_gender_preference 
//     : typeof room.room_gender_preference === 'string'
//       ? room.room_gender_preference.split(',').filter(Boolean)
//       : [];

//   useEffect(() => {
//     if (open) {
//       loadAvailableBeds();
//       loadTenantsBasedOnPreferences();
//       setBedAssignments(room.bed_assignments || []);
//       setBedAssignmentStates({});
//       setSearchQuery('');
//     }
//   }, [open, room]);

//   const loadAvailableBeds = async () => {
//     try {
//       setLoading(true);
//       const response = await getAvailableBeds(room.id.toString());
//       if (response.data) {
//         setAvailableBeds(response.data);
//       }
//     } catch (error) {
//       console.error('Error loading available beds:', error);
//       toast.error("Failed to load available beds");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadTenantsBasedOnPreferences = async () => {
//     try {
//       setLoadingTenants(true);
      
//       // Fetch all active tenants with portal access
//       const response = await request<Tenant[]>('/api/tenants?is_active=true&portal_access_enabled=true');
      
//       if (Array.isArray(response)) {
//         setTenants(response);
//       } else if (response.data && Array.isArray(response.data)) {
//         setTenants(response.data);
//       } else {
//         setTenants([]);
//       }
//     } catch (error: any) {
//       console.error('Error loading tenants:', error);
//       toast.error(`Failed to load tenants: ${error.message}`);
//       setTenants([]);
//     } finally {
//       setLoadingTenants(false);
//     }
//   };

//   const getBedStatus = (bedNumber: number) => {
//     const assignment = bedAssignments.find(b => b.bed_number === bedNumber);
//     if (!assignment) return { status: 'available', assignment: null };
    
//     if (!assignment.is_available && assignment.tenant_id) {
//       return { status: 'occupied', assignment };
//     }
//     return { status: 'available', assignment };
//   };

//   const findTenantDetails = (tenantId: number) => {
//     return tenants.find(t => t.id === tenantId);
//   };

//   const getBedAssignmentState = (bedNumber: number): BedAssignmentState => {
//     return bedAssignmentStates[bedNumber] || {
//       tenantId: '',
//       selectedTenant: null,
//       selectedGender: 'all'
//     };
//   };

//   const updateBedAssignmentState = (bedNumber: number, updates: Partial<BedAssignmentState>) => {
//     setBedAssignmentStates(prev => ({
//       ...prev,
//       [bedNumber]: {
//         ...getBedAssignmentState(bedNumber),
//         ...updates
//       }
//     }));
//   };

//   const resetBedAssignmentState = (bedNumber: number) => {
//     setBedAssignmentStates(prev => {
//       const newState = { ...prev };
//       delete newState[bedNumber];
//       return newState;
//     });
//   };

//   // Helper function to check if tenant is already assigned elsewhere
//   const checkTenantExistingAssignment = async (tenantId: number, excludeBedAssignmentId?: number) => {
//     try {
//       const response = await request<ApiResult<any>>(`/api/rooms/tenant-assignment/${tenantId}`);
      
//       if (response.success && response.data) {
//         // Filter out the current bed assignment and find active assignments
//         const activeAssignments = Array.isArray(response.data) 
//           ? response.data.filter((assignment: any) => 
//               (excludeBedAssignmentId ? assignment.id !== excludeBedAssignmentId : true) && 
//               !assignment.is_available
//             )
//           : [];
        
//         return activeAssignments.length > 0 ? activeAssignments[0] : null;
//       }
//       return null;
//     } catch (error) {
//       console.error("Error checking tenant assignment:", error);
//       return null;
//     }
//   };

//   // Helper function to vacate existing assignment
//   const vacateExistingAssignment = async (bedAssignmentId: number, reason: string) => {
//     try {
//       const result = await request<ApiResult<any>>(`/api/rooms/bed-assignments/${bedAssignmentId}/vacate`, {
//         method: 'POST',
//         body: JSON.stringify({ reason }),
//       });
//       return result;
//     } catch (error: any) {
//       return {
//         success: false,
//         message: error.message || 'Failed to vacate bed'
//       };
//     }
//   };

//   const handleAssignBed = async (bedNumber: number) => {
//     const bedState = getBedAssignmentState(bedNumber);
    
//     if (!bedState.tenantId.trim() || !bedState.selectedTenant) {
//       toast.error("Please select a tenant");
//       return;
//     }

//     const tenantId = parseInt(bedState.tenantId);
//     const tenantName = bedState.selectedTenant.full_name;
    
//     try {
//       setSavingBed(bedNumber);
      
//       // Check if the tenant is already assigned elsewhere
//       const existingAssignment = await checkTenantExistingAssignment(tenantId);
      
//       if (existingAssignment) {
//         // Show transfer confirmation dialog
//         setTransferDetails({
//           bedAssignment: null, // This is a new assignment
//           newTenant: bedState.selectedTenant,
//           existingAssignment: existingAssignment
//         });
//         setTransferReason(`Moved to Bed ${bedNumber} in Room ${room.room_number}`);
//         setTransferDialogOpen(true);
//         setSavingBed(null);
//         return;
//       }
      
//       // Proceed with normal assignment
//       const payload = {
//         room_id: room.id,
//         bed_number: bedNumber,
//         tenant_id: tenantId,
//         tenant_gender: bedState.selectedTenant.gender as 'Male' | 'Female' | 'Other'
//       };

//       const result = await assignBed(payload);
      
//       if (result.success) {
//         toast.success(`Bed ${bedNumber} assigned to ${tenantName} successfully!`);
        
//         const newAssignment: BedAssignment = {
//           id: result.data?.id || Date.now(),
//           bed_number: bedNumber,
//           room_id: room.id,
//           tenant_id: tenantId,
//           tenant_gender: bedState.selectedTenant.gender as 'Male' | 'Female' | 'Other',
//           is_available: false,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString()
//         };
        
//         setBedAssignments(prev => {
//           const filtered = prev.filter(b => b.bed_number !== bedNumber);
//           return [...filtered, newAssignment];
//         });
        
//         setAssigningBed(null);
//         resetBedAssignmentState(bedNumber);
        
//         await loadAvailableBeds();
        
//         if (onRefresh) onRefresh();
        
//       } else {
//         toast.error(result.message || "Failed to assign bed");
//       }
//     } catch (err: any) {
//       console.error("Assign bed error:", err);
//       toast.error(err.message || "Failed to assign bed");
//     } finally {
//       setSavingBed(null);
//     }
//   };

//   const handleUpdateBedAssignment = async (bedAssignment: BedAssignment) => {
//     const bedNumber = bedAssignment.bed_number;
//     const bedState = getBedAssignmentState(bedNumber);
    
//     if (!bedState.tenantId.trim() || !bedState.selectedTenant) {
//       toast.error("Please select a tenant");
//       return;
//     }

//     const newTenantId = parseInt(bedState.tenantId);
//     const currentTenantId = bedAssignment.tenant_id;

//     // If it's the same tenant, just update normally
//     if (currentTenantId === newTenantId) {
//       await updateBedAssignmentDirectly(bedAssignment, bedState);
//       return;
//     }

//     try {
//       setSavingBed(bedNumber);
      
//       // Check if the new tenant is already assigned to another bed
//       const existingAssignment = await checkTenantExistingAssignment(newTenantId, bedAssignment.id);
      
//       if (existingAssignment) {
//         // Show transfer confirmation dialog
//         setTransferDetails({
//           bedAssignment: bedAssignment,
//           newTenant: bedState.selectedTenant,
//           existingAssignment: existingAssignment
//         });
//         setTransferReason(`Transferred to Bed ${bedNumber} in Room ${room.room_number}`);
//         setTransferDialogOpen(true);
//         setSavingBed(null);
//         return;
//       }
      
//       // Update the bed assignment
//       await updateBedAssignmentDirectly(bedAssignment, bedState);
      
//     } catch (err: any) {
//       console.error("Update bed error:", err);
//       toast.error(err.message || "Failed to update bed assignment");
//     } finally {
//       setSavingBed(null);
//     }
//   };

//   // Helper function to update bed assignment directly
//   const updateBedAssignmentDirectly = async (bedAssignment: BedAssignment, bedState: BedAssignmentState) => {
//     const result = await updateBedAssignment(bedAssignment.id.toString(), {
//       tenant_id: parseInt(bedState.tenantId),
//       tenant_gender: bedState.selectedTenant.gender as 'Male' | 'Female' | 'Other',
//       is_available: false
//     });
    
//     if (result.success) {
//       toast.success(`Bed ${bedAssignment.bed_number} updated successfully!`);
      
//       const updatedAssignment: BedAssignment = {
//         ...bedAssignment,
//         tenant_id: parseInt(bedState.tenantId),
//         tenant_gender: bedState.selectedTenant.gender as 'Male' | 'Female' | 'Other',
//         is_available: false,
//         updated_at: new Date().toISOString()
//       };
      
//       setBedAssignments(prev => 
//         prev.map(b => b.id === bedAssignment.id ? updatedAssignment : b)
//       );
      
//       setAssigningBed(null);
//       resetBedAssignmentState(bedAssignment.bed_number);
      
//       await loadAvailableBeds();
      
//       if (onRefresh) onRefresh();
//     } else {
//       toast.error(result.message || "Failed to update bed assignment");
//     }
//   };

//   // Function to handle transfer confirmation
//   const handleTransferConfirmation = async () => {
//     try {
//       const { bedAssignment, newTenant, existingAssignment } = transferDetails;
      
//       if (!existingAssignment || !newTenant) {
//         toast.error("Invalid transfer details");
//         return;
//       }

//       setSavingBed(bedAssignment?.bed_number || null);
      
//       // 1. Vacate the existing assignment
//       const vacateResult = await vacateExistingAssignment(existingAssignment.id, transferReason);
      
//       if (!vacateResult.success) {
//         toast.error(`Failed to vacate existing bed: ${vacateResult.message}`);
//         setSavingBed(null);
//         return;
//       }
      
//       toast.success(`Vacated Bed ${existingAssignment.bed_number} in Room ${existingAssignment.room_number}`);
      
//       // 2. If this is a new assignment (not an update)
//       if (!bedAssignment) {
//         const payload = {
//           room_id: room.id,
//           bed_number: transferDetails.existingAssignment?.bed_number || 0,
//           tenant_id: newTenant.id,
//           tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other'
//         };

//         const result = await assignBed(payload);
        
//         if (result.success) {
//           const newBedAssignment: BedAssignment = {
//             id: result.data?.id || Date.now(),
//             bed_number: payload.bed_number,
//             room_id: room.id,
//             tenant_id: newTenant.id,
//             tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
//             is_available: false,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString()
//           };
          
//           setBedAssignments(prev => {
//             const filtered = prev.filter(b => b.bed_number !== payload.bed_number);
//             return [...filtered, newBedAssignment];
//           });
//         } else {
//           toast.error(result.message || "Failed to assign bed");
//         }
//       } else {
//         // 3. Update the existing bed assignment
//         const result = await updateBedAssignment(bedAssignment.id.toString(), {
//           tenant_id: newTenant.id,
//           tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
//           is_available: false
//         });
        
//         if (result.success) {
//           const updatedAssignment: BedAssignment = {
//             ...bedAssignment,
//             tenant_id: newTenant.id,
//             tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
//             is_available: false,
//             updated_at: new Date().toISOString()
//           };
          
//           setBedAssignments(prev => 
//             prev.map(b => b.id === bedAssignment.id ? updatedAssignment : b)
//           );
//         } else {
//           toast.error(result.message || "Failed to update bed assignment");
//         }
//       }
      
//       // Reset states
//       setAssigningBed(null);
//       if (bedAssignment) {
//         resetBedAssignmentState(bedAssignment.bed_number);
//       }
      
//       await loadAvailableBeds();
      
//       if (onRefresh) onRefresh();
      
//       // Close the transfer dialog
//       setTransferDialogOpen(false);
//       setTransferDetails({
//         bedAssignment: null,
//         newTenant: null,
//         existingAssignment: null
//       });
//       setTransferReason('');
      
//     } catch (err: any) {
//       console.error("Transfer error:", err);
//       toast.error(err.message || "Failed to process transfer");
//     } finally {
//       setSavingBed(null);
//     }
//   };

//   // New function to handle vacate confirmation
//   const handleVacateConfirmation = (bedAssignment: BedAssignment) => {
//     setSelectedBedToVacate(bedAssignment);
//     setVacateReason('');
//     setVacateDialogOpen(true);
//   };

//   // Updated handleVacateBed function with reason
//   const handleVacateBed = async (bedAssignment: BedAssignment, reason: string = '') => {
//     try {
//       setSavingBed(bedAssignment.bed_number);
      
//       const result = await updateBedAssignment(bedAssignment.id.toString(), {
//         tenant_id: null,
//         tenant_gender: null,
//         is_available: true,
//         vacate_reason: reason
//       });
      
//       if (result.success) {
//         // Show alert with room number instead of ID
//         alert(`Bed ${bedAssignment.bed_number} in Room ${room.room_number} has been vacated.\nReason: ${reason || 'No reason provided'}`);
        
//         toast.success(`Bed ${bedAssignment.bed_number} in Room ${room.room_number} has been vacated`);
        
//         const updatedAssignment: BedAssignment = {
//           ...bedAssignment,
//           tenant_id: null,
//           tenant_gender: null,
//           is_available: true,
//           updated_at: new Date().toISOString(),
//           vacate_reason: reason
//         };
        
//         setBedAssignments(prev => 
//           prev.map(b => b.id === bedAssignment.id ? updatedAssignment : b)
//         );
        
//         loadAvailableBeds();
        
//         if (onRefresh) onRefresh();
        
//         // Close the vacate dialog
//         setVacateDialogOpen(false);
//         setSelectedBedToVacate(null);
//         setVacateReason('');
//       } else {
//         toast.error(result.message || "Failed to vacate bed");
//       }
//     } catch (err: any) {
//       console.error("Vacate bed error:", err);
//       toast.error(err.message || "Failed to vacate bed");
//     } finally {
//       setSavingBed(null);
//     }
//   };

//   const totalBeds = room.total_bed;
//   const occupiedBeds = bedAssignments.filter(b => !b.is_available).length;
//   const availableBedsCount = totalBeds - occupiedBeds;

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="text-2xl flex items-center gap-3">
//               <Bed className="h-6 w-6" />
//               Bed Management - Room {room.room_number}
//               <Badge variant="outline" className="ml-2">
//                 {room.property_name}
//               </Badge>
//             </DialogTitle>
//             <DialogDescription className="flex items-center gap-2">
//               <MapPin className="h-4 w-4" />
//               {room.property_address} • Floor {room.floor || 'G'}
//             </DialogDescription>
//           </DialogHeader>

//           {roomGenderPreferences.length > 0 && (
//             <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
//               <div className="flex items-center gap-2 mb-2">
//                 <Filter className="h-4 w-4 text-blue-600" />
//                 <h3 className="font-semibold text-blue-800">Room Gender Preferences</h3>
//               </div>
//               <div className="flex flex-wrap gap-2 mb-2">
//                 {roomGenderPreferences.map(pref => {
//                   const prefLower = pref.toLowerCase();
//                   let label = '';
//                   let iconColor = '';
                  
//                   if (prefLower === 'male_only' || prefLower === 'male') {
//                     label = 'Male Only';
//                     iconColor = 'text-blue-600';
//                   } else if (prefLower === 'female_only' || prefLower === 'female') {
//                     label = 'Female Only';
//                     iconColor = 'text-pink-600';
//                   } else if (prefLower === 'couples') {
//                     label = 'Couples';
//                     iconColor = 'text-red-600';
//                   }
                  
//                   return (
//                     <Badge key={pref} variant="outline" className="bg-white border-blue-300">
//                       <GenderIcon gender={prefLower} size="h-3 w-3" />
//                       <span className="ml-1">{label}</span>
//                     </Badge>
//                   );
//                 })}
//               </div>
//               <p className="text-sm text-blue-600">
//                 Tenant dropdown will only show tenants matching these gender preferences.
//               </p>
//             </div>
//           )}

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">Total Beds</p>
//                     <h3 className="text-2xl font-bold text-gray-800">{totalBeds}</h3>
//                   </div>
//                   <Bed className="h-8 w-8 text-blue-500" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">Occupied</p>
//                     <h3 className="text-2xl font-bold text-green-600">{occupiedBeds}</h3>
//                   </div>
//                   <UserRound className="h-8 w-8 text-green-500" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">Available</p>
//                     <h3 className="text-2xl font-bold text-cyan-600">{availableBedsCount}</h3>
//                   </div>
//                   <UserPlus className="h-8 w-8 text-cyan-500" />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-gray-600">Rent per Bed</p>
//                     <h3 className="text-2xl font-bold text-amber-600">₹{room.rent_per_bed}</h3>
//                   </div>
//                   <BadgeIndianRupee className="h-8 w-8 text-amber-500" />
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           <div>
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h3 className="text-xl font-bold flex items-center gap-2">
//                   <ClipboardList className="h-5 w-5" />
//                   Bed Assignments
//                   <Badge variant="outline" className="ml-2">
//                     {totalBeds} Beds Total
//                   </Badge>
//                 </h3>
//                 <p className="text-sm text-gray-600 mt-1">
//                   {availableBedsCount > 0 ? (
//                     <span className="text-green-600 font-medium">{availableBedsCount} beds available for assignment</span>
//                   ) : (
//                     <span className="text-amber-600">Room is fully occupied</span>
//                   )}
//                 </p>
//               </div>
//               <Badge variant={availableBedsCount > 0 ? "default" : "secondary"}>
//                 {availableBedsCount} beds available
//               </Badge>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {Array.from({ length: totalBeds }, (_, i) => i + 1).map(bedNumber => {
//                 const { status, assignment } = getBedStatus(bedNumber);
//                 const isOccupied = status === 'occupied';
//                 const tenantDetails = assignment?.tenant_id ? findTenantDetails(assignment.tenant_id) : null;
//                 const isBeingSaved = savingBed === bedNumber;
//                 const bedState = getBedAssignmentState(bedNumber);
                
//                 return (
//                   <Card key={bedNumber} className={`overflow-hidden transition-opacity duration-200 ${
//                     isOccupied ? 'border-green-200' : 'border-gray-200'
//                   } ${isBeingSaved ? 'opacity-70' : ''}`}>
//                     <CardContent className="p-4">
//                       <div className="flex justify-between items-start mb-3">
//                         <div className="flex items-center gap-2">
//                           <div className={`p-2 rounded ${
//                             isOccupied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
//                           }`}>
//                             <Bed className="h-4 w-4" />
//                           </div>
//                           <div>
//                             <h4 className="font-bold text-lg">Bed {bedNumber}</h4>
//                             <Badge variant={isOccupied ? "default" : "outline"} className={
//                               isOccupied ? 'bg-green-100 text-green-800 border-green-300' : ''
//                             }>
//                               {isOccupied ? 'Occupied' : 'Available'}
//                             </Badge>
//                           </div>
//                         </div>
//                         <div className={`w-3 h-3 rounded-full ${isOccupied ? 'bg-green-500' : 'bg-gray-300'}`} />
//                       </div>

//                       {isOccupied && assignment ? (
//                         <div className="space-y-3">
//                           <div className="bg-gray-50 p-3 rounded-lg">
//                             {tenantDetails ? (
//                               <>
//                                 <div className="flex items-center justify-between mb-2">
//                                   <span className="text-sm font-medium text-gray-700">Tenant:</span>
//                                   <span className="font-bold truncate">{tenantDetails.full_name}</span>
//                                 </div>
//                                 <div className="grid grid-cols-2 gap-2 mt-2">
//                                   <div>
//                                     <span className="text-xs text-gray-600">ID:</span>
//                                     <span className="text-sm block">{tenantDetails.id}</span>
//                                   </div>
//                                   <div>
//                                     <span className="text-xs text-gray-600">Gender:</span>
//                                     <div className="flex items-center gap-1">
//                                       <GenderIcon gender={assignment.tenant_gender || ''} size="h-3 w-3" />
//                                       <span className="text-sm">{assignment.tenant_gender}</span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </>
//                             ) : (
//                               <>
//                                 <div className="grid grid-cols-2 gap-2">
//                                   <div>
//                                     <span className="text-sm font-medium text-gray-700">Tenant ID:</span>
//                                     <span className="font-bold block">{assignment.tenant_id}</span>
//                                   </div>
//                                   <div>
//                                     <span className="text-sm font-medium text-gray-700">Gender:</span>
//                                     <div className="flex items-center gap-1">
//                                       <GenderIcon gender={assignment.tenant_gender || ''} size="h-3 w-3" />
//                                       <span className="font-medium">{assignment.tenant_gender}</span>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </>
//                             )}
//                           </div>
                          
//                           <div className="flex flex-col gap-2">
//                             {assigningBed === bedNumber ? (
//                               <div className="space-y-2">
//                                 <div className="flex justify-between items-center">
//                                   <span className="text-sm font-medium">Change Tenant</span>
//                                   <Button
//                                     size="sm"
//                                     variant="ghost"
//                                     className="h-6 w-6 p-0"
//                                     onClick={() => {
//                                       setAssigningBed(null);
//                                       resetBedAssignmentState(bedNumber);
//                                     }}
//                                   >
//                                     <X className="h-3 w-3" />
//                                   </Button>
//                                 </div>
//                                 <TenantSelectionSection
//                                   bedNumber={bedNumber}
//                                   bedState={bedState}
//                                   updateBedAssignmentState={updateBedAssignmentState}
//                                   tenants={tenants}
//                                   loadingTenants={loadingTenants}
//                                   searchQuery={searchQuery}
//                                   setSearchQuery={setSearchQuery}
//                                   roomGenderPreferences={roomGenderPreferences}
//                                 />
//                                 <Button
//                                   size="sm"
//                                   className="w-full"
//                                   onClick={() => handleUpdateBedAssignment(assignment)}
//                                   disabled={!bedState.tenantId.trim() || !bedState.selectedTenant || isBeingSaved}
//                                 >
//                                   {isBeingSaved ? (
//                                     <>Updating...</>
//                                   ) : (
//                                     <>
//                                       <Save className="h-3 w-3 mr-1" />
//                                       Update Assignment
//                                     </>
//                                   )}
//                                 </Button>
//                               </div>
//                             ) : (
//                               <div className="flex gap-2">
//                                 <Button
//                                   size="sm"
//                                   variant="outline"
//                                   className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
//                                   onClick={() => {
//                                     setAssigningBed(bedNumber);
//                                     updateBedAssignmentState(bedNumber, {
//                                       tenantId: '',
//                                       selectedTenant: null,
//                                       selectedGender: 'all'
//                                     });
//                                     loadTenantsBasedOnPreferences();
//                                   }}
//                                   disabled={isBeingSaved}
//                                 >
//                                   <UserPlus className="h-3 w-3 mr-1" />
//                                   Change Tenant
//                                 </Button>
//                                 <Button
//                                   size="sm"
//                                   variant="outline"
//                                   className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
//                                   onClick={() => handleVacateConfirmation(assignment)}
//                                   disabled={isBeingSaved}
//                                 >
//                                   <UserMinus className="h-3 w-3 mr-1" />
//                                   Vacate
//                                 </Button>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       ) : (
//                         <div>
//                           {assigningBed === bedNumber ? (
//                             <div className="space-y-3">
//                               <div className="flex justify-between items-center">
//                                 <span className="text-sm font-medium">Assign New Tenant</span>
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   className="h-6 w-6 p-0"
//                                   onClick={() => {
//                                     setAssigningBed(null);
//                                     resetBedAssignmentState(bedNumber);
//                                   }}
//                                 >
//                                   <X className="h-3 w-3" />
//                                 </Button>
//                               </div>
                              
//                               <TenantSelectionSection
//                                 bedNumber={bedNumber}
//                                 bedState={bedState}
//                                 updateBedAssignmentState={updateBedAssignmentState}
//                                 tenants={tenants}
//                                 loadingTenants={loadingTenants}
//                                 searchQuery={searchQuery}
//                                 setSearchQuery={setSearchQuery}
//                                 roomGenderPreferences={roomGenderPreferences}
//                               />
                              
//                               <Button
//                                 size="sm"
//                                 className="w-full"
//                                 onClick={() => handleAssignBed(bedNumber)}
//                                 disabled={!bedState.tenantId.trim() || !bedState.selectedTenant || isBeingSaved}
//                               >
//                                 {isBeingSaved ? (
//                                   <>Assigning...</>
//                                 ) : (
//                                   <>
//                                     <Check className="h-3 w-3 mr-1" />
//                                     Assign to Bed {bedNumber}
//                                   </>
//                                 )}
//                               </Button>
//                             </div>
//                           ) : (
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               className="w-full h-9"
//                               onClick={() => {
//                                 setAssigningBed(bedNumber);
//                                 updateBedAssignmentState(bedNumber, {
//                                   tenantId: '',
//                                   selectedTenant: null,
//                                   selectedGender: 'all'
//                                 });
//                                 loadTenantsBasedOnPreferences();
//                               }}
//                               disabled={isBeingSaved}
//                             >
//                               <UserPlus className="h-3 w-3 mr-1" />
//                               Assign Tenant
//                             </Button>
//                           )}
//                         </div>
//                       )}

//                       <div className="mt-3 pt-3 border-t">
//                         <div className="flex justify-between items-center">
//                           <span className="text-xs text-gray-500">Monthly Rent:</span>
//                           <span className="font-bold text-green-600">₹{room.rent_per_bed}</span>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           </div>

//           <DialogFooter className="gap-2 pt-4 border-t">
//             <div className="flex-1 text-xs text-gray-500">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="h-3 w-3" />
//                 <span>Note: Only active tenants with portal access can be assigned to beds.</span>
//               </div>
//               {roomGenderPreferences.length > 0 && (
//                 <div className="flex items-center gap-2 mt-1">
//                   <Filter className="h-3 w-3" />
//                   <span>Tenants are filtered based on room gender preferences.</span>
//                 </div>
//               )}
//             </div>
//             <Button variant="outline" onClick={() => onOpenChange(false)}>
//               Close
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Vacate Reason Dialog */}
//       <Dialog open={vacateDialogOpen} onOpenChange={setVacateDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-xl flex items-center gap-2">
//               <UserMinus className="h-5 w-5 text-red-600" />
//               Vacate Bed {selectedBedToVacate?.bed_number}
//             </DialogTitle>
//             <DialogDescription>
//               Room {room.room_number} • {room.property_name}
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="space-y-4 py-4">
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
//                 <div>
//                   <h4 className="font-semibold text-yellow-800">Important</h4>
//                   <p className="text-sm text-yellow-700 mt-1">
//                     Are you sure you want to vacate Bed {selectedBedToVacate?.bed_number}?
//                     This will remove the tenant from this bed in Room {room.room_number}.
//                   </p>
//                 </div>
//               </div>
//             </div>
            
//             <div>
//               <Label htmlFor="vacate-reason" className="text-sm font-medium">
//                 Reason for Vacating (Optional)
//               </Label>
//               <Textarea
//                 id="vacate-reason"
//                 placeholder="Enter reason for vacating this bed..."
//                 value={vacateReason}
//                 onChange={(e) => setVacateReason(e.target.value)}
//                 className="mt-2 min-h-[100px]"
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 This information will be recorded for reference.
//               </p>
//             </div>
//           </div>
          
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setVacateDialogOpen(false);
//                 setSelectedBedToVacate(null);
//                 setVacateReason('');
//               }}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={() => {
//                 if (selectedBedToVacate) {
//                   handleVacateBed(selectedBedToVacate, vacateReason);
//                 }
//               }}
//             >
//               <UserMinus className="h-4 w-4 mr-2" />
//               Confirm Vacate
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Transfer Confirmation Dialog */}
//       <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle className="text-xl flex items-center gap-2">
//               <AlertCircle className="h-5 w-5 text-amber-600" />
//               Tenant Already Assigned
//             </DialogTitle>
//             <DialogDescription>
//               One tenant can only have one bed assignment at a time
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="space-y-4 py-4">
//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
//                 <div>
//                   <h4 className="font-semibold text-amber-800">Transfer Required</h4>
//                   <p className="text-sm text-amber-700 mt-1">
//                     <strong>{transferDetails.newTenant?.full_name}</strong> is already assigned to:
//                   </p>
//                   <div className="mt-2 p-2 bg-white rounded border border-amber-300">
//                     <div className="flex items-center justify-between">
//                       <span className="font-medium">Bed {transferDetails.existingAssignment?.bed_number}</span>
//                       <span className="text-sm">in Room {transferDetails.existingAssignment?.room_number}</span>
//                     </div>
//                     <div className="mt-1 text-xs text-gray-600">
//                       Property: {transferDetails.existingAssignment?.property_name}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <UserPlus className="h-5 w-5 text-blue-600 mt-0.5" />
//                 <div>
//                   <h4 className="font-semibold text-blue-800">New Assignment</h4>
//                   <p className="text-sm text-blue-700 mt-1">
//                     Tenant will be assigned to:
//                   </p>
//                   <div className="mt-2 p-2 bg-white rounded border border-blue-300">
//                     <div className="flex items-center justify-between">
//                       <span className="font-medium">
//                         Bed {transferDetails.bedAssignment?.bed_number || transferDetails.existingAssignment?.bed_number}
//                       </span>
//                       <span className="text-sm">in Room {room.room_number}</span>
//                     </div>
//                     <div className="mt-1 text-xs text-gray-600">
//                       Property: {room.property_name}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div>
//               <Label htmlFor="transfer-reason" className="text-sm font-medium">
//                 Reason for Transfer (Required)
//               </Label>
//               <Textarea
//                 id="transfer-reason"
//                 placeholder="Enter reason for transferring this tenant..."
//                 value={transferReason}
//                 onChange={(e) => setTransferReason(e.target.value)}
//                 className="mt-2 min-h-[100px]"
//                 required
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 This information will be recorded in both bed assignments.
//               </p>
//             </div>
//           </div>
          
//           <DialogFooter className="gap-2">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setTransferDialogOpen(false);
//                 setTransferDetails({
//                   bedAssignment: null,
//                   newTenant: null,
//                   existingAssignment: null
//                 });
//                 setTransferReason('');
//               }}
//             >
//               Cancel Transfer
//             </Button>
//             <Button
//               onClick={handleTransferConfirmation}
//               disabled={!transferReason.trim() || savingBed !== null}
//               className="bg-amber-600 hover:bg-amber-700"
//             >
//               {savingBed ? (
//                 <>Processing...</>
//               ) : (
//                 <>
//                   <Check className="h-4 w-4 mr-2" />
//                   Vacate Old Bed & Assign to New
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }


// "use client";

// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { toast } from "sonner";
// import {
//   Bed, MapPin, UserPlus, UserMinus, BadgeIndianRupee,
//   ClipboardList, AlertCircle, Check, X,
//   UserRound, Eye, Filter, Save,
//   UsersRound, Mail, Phone, Search,
//   ChevronDown, RefreshCw
// } from 'lucide-react';
// import { getAvailableBeds, assignBed, updateBedAssignment, getRoomById } from '@/lib/roomsApi';
// import { request } from '@/lib/api';
// import type { RoomResponse, BedAssignment } from '@/lib/roomsApi';
// import { VacateBedWizard } from '@/components/admin/rooms/VacateBedWizard';
// import { ChangeBedWizard } from '@/components/admin/rooms/ChangeBedWizard';

// interface BedManagementDialogProps {
//   room: any;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onRefresh?: () => void;
// }

// interface BedAssignmentState {
//   tenantId: string;
//   selectedTenant: any | null;
// }

// interface Tenant {
//   id: number;
//   full_name: string;
//   email: string;
//   phone: string;
//   gender: string;
//   is_active: boolean;
//   portal_access_enabled: boolean;
//   couple_id?: number;
//   is_assigned?: boolean;
// }

// interface ApiResult<T = any> {
//   success: boolean;
//   message?: string;
//   data?: T;
// }

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
//       return <UserRound className={`${size} text-gray-600`} />;
//   }
// };

// // Cleaned up Tenant Selection Dropdown Component
// function TenantSelectDropdown({
//   bedNumber,
//   value,
//   onValueChange,
//   tenants,
//   loading,
//   roomGenderPreferences,
//   currentRoomAssignments
// }: {
//   bedNumber: number;
//   value: string;
//   onValueChange: (value: string) => void;
//   tenants: Tenant[];
//   loading: boolean;
//   roomGenderPreferences: string[];
//   currentRoomAssignments: BedAssignment[];
// }) {
//   const [searchQuery, setSearchQuery] = useState('');

//   // Filter only unassigned tenants
//   const unassignedTenants = tenants.filter(tenant => !tenant.is_assigned);
  
//   // Filter based on room preferences and current assignments
//   const filteredTenants = unassignedTenants.filter(tenant => {
//     const tenantGender = tenant.gender?.toLowerCase();
//     const tenantIsCouple = tenant.couple_id != null;
    
//     // For rooms with both male and female preference
//     const hasBothGenders = roomGenderPreferences.some(p => 
//       p.toLowerCase() === 'both' || p.toLowerCase() === 'any' || p.toLowerCase() === 'mixed'
//     );
    
//     const hasMaleOnly = roomGenderPreferences.some(p => 
//       p.toLowerCase() === 'male_only' || p.toLowerCase() === 'male'
//     );
    
//     const hasFemaleOnly = roomGenderPreferences.some(p => 
//       p.toLowerCase() === 'female_only' || p.toLowerCase() === 'female'
//     );
    
//     const hasCouplesAllowed = roomGenderPreferences.some(p => 
//       p.toLowerCase() === 'couples'
//     );
    
//     // Get assigned genders in current room (excluding the current bed)
//     const assignedGenders = currentRoomAssignments
//       .filter(assignment => assignment.bed_number !== bedNumber && assignment.tenant_gender)
//       .map(assignment => assignment.tenant_gender?.toLowerCase());
    
//     // For rooms with both male and female (mixed gender rooms)
//     if (hasBothGenders) {
//       return !tenantIsCouple; // Don't show couples unless explicitly allowed
//     }
    
//     // For male-only rooms
//     if (hasMaleOnly && !hasFemaleOnly) {
//       return tenantGender === 'male' && !tenantIsCouple;
//     }
    
//     // For female-only rooms
//     if (hasFemaleOnly && !hasMaleOnly) {
//       return tenantGender === 'female' && !tenantIsCouple;
//     }
    
//     // For rooms that allow both male and female (but not "both" preference)
//     if (hasMaleOnly && hasFemaleOnly) {
//       // If one gender is already assigned, only show that gender
//       if (assignedGenders.length > 0) {
//         const assignedGender = assignedGenders[0];
//         if (assignedGender === 'male') {
//           return tenantGender === 'male' && !tenantIsCouple;
//         } else if (assignedGender === 'female') {
//           return tenantGender === 'female' && !tenantIsCouple;
//         }
//       }
//       // If no assignments yet, show both genders
//       return (tenantGender === 'male' || tenantGender === 'female') && !tenantIsCouple;
//     }
    
//     // For couples rooms
//     if (hasCouplesAllowed) {
//       return true; // Couples rooms can have any tenant (individuals or couples)
//     }
    
//     return true;
//   });

//   // Apply search filter
//   const searchedTenants = searchQuery 
//     ? filteredTenants.filter(tenant => 
//         tenant.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         tenant.phone?.includes(searchQuery) ||
//         tenant.id?.toString().includes(searchQuery)
//       )
//     : filteredTenants;

//   // Sort tenants: couples first, then by name
//   const sortedTenants = [...searchedTenants].sort((a, b) => {
//     if (a.couple_id && !b.couple_id) return -1;
//     if (!a.couple_id && b.couple_id) return 1;
//     return a.full_name?.localeCompare(b.full_name || '') || 0;
//   });

//   // Get selected tenant
//   const selectedTenant = tenants.find(t => t.id.toString() === value);

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center justify-between">
//         <Label className="text-sm font-medium">Select Tenant</Label>
//         <span className="text-xs text-gray-500">
//           {sortedTenants.length} available
//         </span>
//       </div>
      
//       <Select value={value} onValueChange={onValueChange} disabled={loading}>
//         <SelectTrigger className="h-10">
//           <SelectValue placeholder={
//             loading ? "Loading..." : 
//             sortedTenants.length > 0 ? "Choose a tenant" : 
//             "No tenants available"
//           } />
//         </SelectTrigger>
//         <SelectContent className="max-h-[350px] p-0">
//           {/* Search inside dropdown */}
//           <div className="sticky top-0 z-10 bg-white border-b p-3">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
//               <Input
//                 placeholder="Search tenants..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-9"
//                 onClick={(e) => e.stopPropagation()}
//               />
//             </div>
//           </div>

//           {/* Tenant list */}
//           <div className="max-h-[250px] overflow-y-auto">
//             {loading ? (
//               <div className="p-6 text-center">
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mx-auto"></div>
//                 <p className="text-sm text-gray-500 mt-2">Loading tenants...</p>
//               </div>
//             ) : sortedTenants.length === 0 ? (
//               <div className="p-6 text-center">
//                 <UserRound className="h-8 w-8 text-gray-400 mx-auto mb-2" />
//                 <p className="text-sm font-medium text-gray-600">No tenants found</p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {searchQuery ? "Try a different search" : "All tenants are assigned"}
//                 </p>
//               </div>
//             ) : (
//               <div className="divide-y">
//                 {sortedTenants.map(tenant => (
//                   <SelectItem 
//                     key={tenant.id} 
//                     value={tenant.id.toString()}
//                     className="py-3"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="relative">
//                         {tenant.couple_id ? (
//                           <UsersRound className="h-5 w-5 text-red-600" />
//                         ) : (
//                           <GenderIcon gender={tenant.gender || 'Other'} size="h-5 w-5" />
//                         )}
//                         {tenant.is_active && (
//                           <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
//                         )}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="font-medium text-sm truncate">
//                           {tenant.full_name}
//                           {tenant.couple_id && (
//                             <Badge variant="outline" className="ml-2 h-5 px-1.5 text-xs bg-red-50 text-red-700 border-red-200">
//                               Couple
//                             </Badge>
//                           )}
//                         </div>
//                         <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
//                           <span>ID: {tenant.id}</span>
//                           <span>•</span>
//                           <span className="flex items-center gap-1">
//                             {tenant.gender || 'Not specified'}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </SelectItem>
//                 ))}
//               </div>
//             )}
//           </div>
//         </SelectContent>
//       </Select>

//       {/* Selected tenant preview */}
//       {selectedTenant && (
//         <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="text-sm font-semibold text-blue-800">Selected Tenant</h4>
//             {selectedTenant.couple_id ? (
//               <UsersRound className="h-4 w-4 text-red-600" />
//             ) : (
//               <GenderIcon gender={selectedTenant.gender || 'Other'} size="h-4 w-4" />
//             )}
//           </div>
          
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <span className="text-xs text-gray-600">Name</span>
//               <span className="text-sm font-medium">{selectedTenant.full_name}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-xs text-gray-600">ID</span>
//               <span className="text-sm font-mono">{selectedTenant.id}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-xs text-gray-600">Gender</span>
//               <span className="text-sm">{selectedTenant.couple_id ? 'Couple' : selectedTenant.gender || 'Not specified'}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-xs text-gray-600">Status</span>
//               <Badge variant={selectedTenant.is_active ? "default" : "secondary"} className="h-5 text-xs">
//                 {selectedTenant.is_active ? 'Active' : 'Inactive'}
//               </Badge>
//             </div>
//           </div>
          
//           {selectedTenant.phone && (
//             <div className="mt-2 pt-2 border-t border-blue-100">
//               <div className="flex items-center gap-2">
//                 <Phone className="h-3 w-3 text-gray-500" />
//                 <span className="text-xs">{selectedTenant.phone}</span>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // Updated Bed Card Component with Change Bed button
// function BedCard({
//   bedNumber,
//   assignment,
//   isOccupied,
//   isAssigning,
//   onAssignClick,
//   onUpdateClick,
//   onVacateClick,
//   onChangeBedClick,
//   tenants,
//   loadingTenants,
//   roomGenderPreferences,
//   currentRoomAssignments,
//   isSaving,
//   tenantDetails,
//   room // Added room prop
// }: {
//   bedNumber: number;
//   assignment: any;
//   isOccupied: boolean;
//   isAssigning: boolean;
//   onAssignClick: () => void;
//   onUpdateClick: (tenantId: string) => void;
//   onVacateClick: () => void;
//   onChangeBedClick: () => void;
//   tenants: Tenant[];
//   loadingTenants: boolean;
//   roomGenderPreferences: string[];
//   currentRoomAssignments: BedAssignment[];
//   isSaving: boolean;
//   tenantDetails?: any;
//   room: RoomResponse; // Added room prop
// }) {
//   const [selectedTenantId, setSelectedTenantId] = useState('');

//   return (
//     <Card className={`overflow-hidden ${isOccupied ? 'border-green-200' : 'border-gray-200'}`}>
//       <CardContent className="p-4">
//         {/* Bed Header */}
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center gap-3">
//             <div className={`p-2 rounded-lg ${isOccupied ? 'bg-green-100' : 'bg-gray-100'}`}>
//               <Bed className={`h-5 w-5 ${isOccupied ? 'text-green-600' : 'text-gray-600'}`} />
//             </div>
//             <div>
//               <h3 className="font-bold text-lg">Bed {bedNumber}</h3>
//               <Badge variant={isOccupied ? "default" : "outline"} className={
//                 isOccupied ? 'bg-green-100 text-green-800 border-green-300' : ''
//               }>
//                 {isOccupied ? 'Occupied' : 'Available'}
//               </Badge>
//             </div>
//           </div>
//           <div className={`w-3 h-3 rounded-full ${isOccupied ? 'bg-green-500' : 'bg-gray-300'}`} />
//         </div>

//         {/* Occupied Bed View */}
//         {isOccupied && assignment && tenantDetails && (
//           <div className="space-y-4">
//             {/* Tenant Info */}
//             <div className="bg-gray-50 p-3 rounded-lg">
//               <div className="flex items-start justify-between mb-3">
//                 <div>
//                   <h4 className="font-semibold text-gray-800">Current Tenant</h4>
//                   <p className="text-sm text-gray-600 mt-0.5">ID: {assignment.tenant_id}</p>
//                 </div>
//                 <GenderIcon gender={assignment.tenant_gender || ''} />
//               </div>
              
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600">Name</span>
//                   <span className="font-medium">{tenantDetails.full_name}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600">Gender</span>
//                   <span className="font-medium">{assignment.tenant_gender}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600">Status</span>
//                   <Badge variant={tenantDetails.is_active ? "default" : "secondary"} className="h-5 text-xs">
//                     {tenantDetails.is_active ? 'Active' : 'Inactive'}
//                   </Badge>
//                 </div>
//               </div>
//             </div>

//             {/* Actions for Occupied Bed */}
//             <div className="space-y-3">
//               {isAssigning ? (
//                 <>
//                   <TenantSelectDropdown
//                     bedNumber={bedNumber}
//                     value={selectedTenantId}
//                     onValueChange={setSelectedTenantId}
//                     tenants={tenants}
//                     loading={loadingTenants}
//                     roomGenderPreferences={roomGenderPreferences}
//                     currentRoomAssignments={currentRoomAssignments}
//                   />
                  
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       className="flex-1"
//                       onClick={onAssignClick}
//                       disabled={isSaving}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       className="flex-1"
//                       onClick={() => onUpdateClick(selectedTenantId)}
//                       disabled={!selectedTenantId || isSaving}
//                     >
//                       {isSaving ? 'Updating...' : 'Update'}
//                     </Button>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="grid grid-cols-2 gap-2">
//                     {/* <Button
//                       variant="outline"
//                       className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-900"
//                       onClick={onAssignClick}
//                       disabled={isSaving}
//                     >
//                       <UserPlus className="h-4 w-4 mr-2" />
//                       Change
//                     </Button> */}
//                     <Button
//                     variant="outline"
//                     className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-900"
//                     onClick={onChangeBedClick}
//                     disabled={isSaving}
//                   >
//                     <RefreshCw className="h-4 w-4 mr-2" />
//                     Change Bed
//                   </Button>
//                     <Button
//                       variant="outline"
//                       className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-900"
//                       onClick={onVacateClick}
//                       disabled={isSaving}
//                     >
//                       <UserMinus className="h-4 w-4 mr-2" />
//                       Vacate
//                     </Button>
//                   </div>
                  
                  
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Available Bed View */}
//         {!isOccupied && (
//           <div className="space-y-4">
//             {isAssigning ? (
//               <>
//                 <TenantSelectDropdown
//                   bedNumber={bedNumber}
//                   value={selectedTenantId}
//                   onValueChange={setSelectedTenantId}
//                   tenants={tenants}
//                   loading={loadingTenants}
//                   roomGenderPreferences={roomGenderPreferences}
//                   currentRoomAssignments={currentRoomAssignments}
//                 />
                
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     className="flex-1"
//                     onClick={onAssignClick}
//                     disabled={isSaving}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     className="flex-1"
//                     onClick={() => onUpdateClick(selectedTenantId)}
//                     disabled={!selectedTenantId || isSaving}
//                   >
//                     {isSaving ? 'Assigning...' : 'Assign'}
//                   </Button>
//                 </div>
//               </>
//             ) : (
//               <Button
//                 variant="outline"
//                 className="w-full h-11"
//                 onClick={onAssignClick}
//                 disabled={isSaving}
//               >
//                 <UserPlus className="h-4 w-4 mr-2" />
//                 Assign Tenant
//               </Button>
//             )}
//           </div>
//         )}

//         {/* Rent Info */}
//         <div className="mt-4 pt-4 border-t">
//           <div className="flex items-center justify-between">
//             <span className="text-sm text-gray-600">Monthly Rent</span>
//             <span className="font-bold text-green-600">₹{assignment?.rent_per_bed || room.rent_per_bed}</span>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// export function BedManagementDialog({ room, open, onOpenChange, onRefresh }: BedManagementDialogProps) {
//   const [bedAssignments, setBedAssignments] = useState<BedAssignment[]>(room.bed_assignments || []);
//   const [assigningBed, setAssigningBed] = useState<number | null>(null);
//   const [tenants, setTenants] = useState<Tenant[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingTenants, setLoadingTenants] = useState(false);
//   const [savingBed, setSavingBed] = useState<number | null>(null);
  
//   // State for vacate wizard
//   const [vacateWizardOpen, setVacateWizardOpen] = useState(false);
//   const [selectedBedForVacate, setSelectedBedForVacate] = useState<BedAssignment | null>(null);
  
//   // State for transfer confirmation dialog
//   const [transferDialogOpen, setTransferDialogOpen] = useState(false);
//   const [transferDetails, setTransferDetails] = useState<{
//     bedAssignment: BedAssignment | null;
//     newTenant: any | null;
//     existingAssignment: any | null;
//   }>({
//     bedAssignment: null,
//     newTenant: null,
//     existingAssignment: null
//   });
//   const [transferReason, setTransferReason] = useState('');

//   // State for Change Bed wizard
//   const [changeBedWizardOpen, setChangeBedWizardOpen] = useState(false);
//   const [selectedTenantForChange, setSelectedTenantForChange] = useState<Tenant | null>(null);

//   const roomGenderPreferences = Array.isArray(room.room_gender_preference) 
//     ? room.room_gender_preference 
//     : typeof room.room_gender_preference === 'string'
//       ? room.room_gender_preference.split(',').filter(Boolean)
//       : [];

//   useEffect(() => {
//     if (open) {
//       loadTenantsBasedOnPreferences();
//       setBedAssignments(room.bed_assignments || []);
//       setAssigningBed(null);
//     }
//   }, [open, room]);

//   const loadTenantsBasedOnPreferences = async () => {
//     try {
//       setLoadingTenants(true);
      
//       const response : any = await request<Tenant[]>('/api/tenants?is_active=true&portal_access_enabled=true');
      
//       let tenantsList: Tenant[] = [];
      
//       if (Array.isArray(response)) {
//         tenantsList = response;
//       } else if (response.data && Array.isArray(response.data)) {
//         tenantsList = response.data;
//       }
      
//       // Check assignment status for each tenant
//       const tenantsWithAssignment = await Promise.all(
//         tenantsList.map(async (tenant) => {
//           try {
//             const assignmentCheck = await request<ApiResult<any>>(`/api/rooms/tenant-assignment/${tenant.id}`);
//             return {
//               ...tenant,
//               is_assigned: assignmentCheck.success && assignmentCheck.data && 
//                            Array.isArray(assignmentCheck.data) && 
//                            assignmentCheck.data.length > 0 &&
//                            assignmentCheck.data.some((assignment: any) => !assignment.is_available)
//             };
//           } catch {
//             return {
//               ...tenant,
//               is_assigned: false
//             };
//           }
//         })
//       );
      
//       setTenants(tenantsWithAssignment);
//     } catch (error: any) {
//       console.error('Error loading tenants:', error);
//       toast.error(`Failed to load tenants: ${error.message}`);
//       setTenants([]);
//     } finally {
//       setLoadingTenants(false);
//     }
//   };

//   const getBedStatus = (bedNumber: number) => {
//     const assignment = bedAssignments.find(b => b.bed_number === bedNumber);
//     if (!assignment) return { status: 'available', assignment: null };
    
//     if (!assignment.is_available && assignment.tenant_id) {
//       return { status: 'occupied', assignment };
//     }
//     return { status: 'available', assignment };
//   };

//   const findTenantDetails = (tenantId: number) => {
//     return tenants.find(t => t.id === tenantId);
//   };

//   const checkTenantExistingAssignment = async (tenantId: number, excludeBedAssignmentId?: number) => {
//     try {
//       const response = await request<ApiResult<any>>(`/api/rooms/tenant-assignment/${tenantId}`);
      
//       if (response.success && response.data) {
//         const activeAssignments = Array.isArray(response.data) 
//           ? response.data.filter((assignment: any) => 
//               (excludeBedAssignmentId ? assignment.id !== excludeBedAssignmentId : true) && 
//               !assignment.is_available
//             )
//           : [];
        
//         return activeAssignments.length > 0 ? activeAssignments[0] : null;
//       }
//       return null;
//     } catch (error) {
//       console.error("Error checking tenant assignment:", error);
//       return null;
//     }
//   };

//   const vacateExistingAssignment = async (bedAssignmentId: number, reason: string) => {
//     try {
//       const result = await request<ApiResult<any>>(`/api/rooms/bed-assignments/${bedAssignmentId}/vacate`, {
//         method: 'POST',
//         body: JSON.stringify({ reason }),
//       });
//       return result;
//     } catch (error: any) {
//       return {
//         success: false,
//         message: error.message || 'Failed to vacate bed'
//       };
//     }
//   };

//   // Handle Change Bed Click
//   const handleChangeBedClick = (bedAssignment: BedAssignment) => {
//     const tenantDetails = findTenantDetails(bedAssignment.tenant_id);
//     if (tenantDetails) {
//       setSelectedTenantForChange(tenantDetails);
//       setChangeBedWizardOpen(true);
//     }
//   };

//   const handleAssignBed = async (bedNumber: number, tenantId: string) => {
//     if (!tenantId.trim()) {
//       toast.error("Please select a tenant");
//       return;
//     }

//     const tenant = tenants.find(t => t.id.toString() === tenantId);
//     if (!tenant) {
//       toast.error("Invalid tenant selected");
//       return;
//     }

//     const tenantIdNum = parseInt(tenantId);
    
//     try {
//       setSavingBed(bedNumber);
      
//       // Check if tenant is already assigned elsewhere
//       const existingAssignment = await checkTenantExistingAssignment(tenantIdNum);
      
//       if (existingAssignment) {
//         setTransferDetails({
//           bedAssignment: null,
//           newTenant: tenant,
//           existingAssignment: existingAssignment
//         });
//         setTransferReason(`Moved to Bed ${bedNumber} in Room ${room.room_number}`);
//         setTransferDialogOpen(true);
//         setSavingBed(null);
//         return;
//       }
      
//       const payload = {
//         room_id: room.id,
//         bed_number: bedNumber,
//         tenant_id: tenantIdNum,
//         tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other'
//       };

//       const result = await assignBed(payload);
      
//       if (result.success) {
//         toast.success(`Bed ${bedNumber} assigned successfully!`);
        
//         const newAssignment: BedAssignment = {
//           id: result.data?.id || Date.now(),
//           bed_number: bedNumber,
//           room_id: room.id,
//           tenant_id: tenantIdNum,
//           tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other',
//           is_available: false,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString()
//         };
        
//         setBedAssignments(prev => {
//           const filtered = prev.filter(b => b.bed_number !== bedNumber);
//           return [...filtered, newAssignment];
//         });
        
//         setAssigningBed(null);
        
//         if (onRefresh) onRefresh();
        
//       } else {
//         toast.error(result.message || "Failed to assign bed");
//       }
//     } catch (err: any) {
//       console.error("Assign bed error:", err);
//       toast.error(err.message || "Failed to assign bed");
//     } finally {
//       setSavingBed(null);
//     }
//   };

//   const handleUpdateBedAssignment = async (bedAssignment: BedAssignment, tenantId: string) => {
//     if (!tenantId.trim()) {
//       toast.error("Please select a tenant");
//       return;
//     }

//     const tenant = tenants.find(t => t.id.toString() === tenantId);
//     if (!tenant) {
//       toast.error("Invalid tenant selected");
//       return;
//     }

//     const newTenantId = parseInt(tenantId);
//     const currentTenantId = bedAssignment.tenant_id;

//     if (currentTenantId === newTenantId) {
//       await updateBedAssignmentDirectly(bedAssignment, tenant);
//       return;
//     }

//     try {
//       setSavingBed(bedAssignment.bed_number);
      
//       const existingAssignment = await checkTenantExistingAssignment(newTenantId, bedAssignment.id);
      
//       if (existingAssignment) {
//         setTransferDetails({
//           bedAssignment: bedAssignment,
//           newTenant: tenant,
//           existingAssignment: existingAssignment
//         });
//         setTransferReason(`Transferred to Bed ${bedAssignment.bed_number} in Room ${room.room_number}`);
//         setTransferDialogOpen(true);
//         setSavingBed(null);
//         return;
//       }
      
//       await updateBedAssignmentDirectly(bedAssignment, tenant);
      
//     } catch (err: any) {
//       console.error("Update bed error:", err);
//       toast.error(err.message || "Failed to update bed assignment");
//     } finally {
//       setSavingBed(null);
//     }
//   };

//   const updateBedAssignmentDirectly = async (bedAssignment: BedAssignment, tenant: Tenant) => {
//     const result = await updateBedAssignment(bedAssignment.id.toString(), {
//       tenant_id: tenant.id,
//       tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other',
//       is_available: false
//     });
    
//     if (result.success) {
//       toast.success(`Bed ${bedAssignment.bed_number} updated successfully!`);
      
//       const updatedAssignment: BedAssignment = {
//         ...bedAssignment,
//         tenant_id: tenant.id,
//         tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other',
//         is_available: false,
//         updated_at: new Date().toISOString()
//       };
      
//       setBedAssignments(prev => 
//         prev.map(b => b.id === bedAssignment.id ? updatedAssignment : b)
//       );
      
//       setAssigningBed(null);
      
//       if (onRefresh) onRefresh();
//     } else {
//       toast.error(result.message || "Failed to update bed assignment");
//     }
//   };

//   const handleTransferConfirmation = async () => {
//     try {
//       const { bedAssignment, newTenant, existingAssignment } = transferDetails;
      
//       if (!existingAssignment || !newTenant) {
//         toast.error("Invalid transfer details");
//         return;
//       }

//       setSavingBed(bedAssignment?.bed_number || null);
      
//       const vacateResult = await vacateExistingAssignment(existingAssignment.id, transferReason);
      
//       if (!vacateResult.success) {
//         toast.error(`Failed to vacate existing bed: ${vacateResult.message}`);
//         setSavingBed(null);
//         return;
//       }
      
//       toast.success(`Vacated previous assignment`);
      
//       if (!bedAssignment) {
//         const payload = {
//           room_id: room.id,
//           bed_number: transferDetails.existingAssignment?.bed_number || 0,
//           tenant_id: newTenant.id,
//           tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other'
//         };

//         const result = await assignBed(payload);
        
//         if (result.success) {
//           const newBedAssignment: BedAssignment = {
//             id: result.data?.id || Date.now(),
//             bed_number: payload.bed_number,
//             room_id: room.id,
//             tenant_id: newTenant.id,
//             tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
//             is_available: false,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString()
//           };
          
//           setBedAssignments(prev => {
//             const filtered = prev.filter(b => b.bed_number !== payload.bed_number);
//             return [...filtered, newBedAssignment];
//           });
//         } else {
//           toast.error(result.message || "Failed to assign bed");
//         }
//       } else {
//         const result = await updateBedAssignment(bedAssignment.id.toString(), {
//           tenant_id: newTenant.id,
//           tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
//           is_available: false
//         });
        
//         if (result.success) {
//           const updatedAssignment: BedAssignment = {
//             ...bedAssignment,
//             tenant_id: newTenant.id,
//             tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
//             is_available: false,
//             updated_at: new Date().toISOString()
//           };
          
//           setBedAssignments(prev => 
//             prev.map(b => b.id === bedAssignment.id ? updatedAssignment : b)
//           );
//         } else {
//           toast.error(result.message || "Failed to update bed assignment");
//         }
//       }
      
//       setAssigningBed(null);
      
//       if (onRefresh) onRefresh();
      
//       setTransferDialogOpen(false);
//       setTransferDetails({
//         bedAssignment: null,
//         newTenant: null,
//         existingAssignment: null
//       });
//       setTransferReason('');
      
//     } catch (err: any) {
//       console.error("Transfer error:", err);
//       toast.error(err.message || "Failed to process transfer");
//     } finally {
//       setSavingBed(null);
//     }
//   };

//   const handleVacateClick = (bedAssignment: BedAssignment) => {
//     setSelectedBedForVacate(bedAssignment);
//     setVacateWizardOpen(true);
//   };

//   // const handleVacateComplete = () => {
//   //   // Refresh data after successful vacate
//   //   loadTenantsBasedOnPreferences();
//   //   if (onRefresh) onRefresh();
//   // };

//   const handleVacateComplete = () => {
//   console.log('🔄 Vacate complete - refreshing data...');
  
//   // 1. Immediately update local state to show bed as available
//   setBedAssignments(prev => 
//     prev.map(bed => 
//       bed.id === selectedBedForVacate?.id 
//         ? { ...bed, tenant_id: null, tenant_gender: null, is_available: true }
//         : bed
//     )
//   );
  
//   // 2. Refresh the parent data
//   if (onRefresh) {
//     console.log('🔄 Calling parent refresh...');
//     onRefresh(); // This should reload the rooms list
//   }
  
//   // 3. Refresh tenants list
//   loadTenantsBasedOnPreferences();
  
//   // 4. Clear the selected bed
//   setSelectedBedForVacate(null);
//   setAssigningBed(null);
  
//   // 5. Show success message
//   toast.success('Bed vacated successfully! Occupants updated.');
  
//   // 6. Force a direct refresh of room data
//   const refreshRoomData = async () => {
//     try {
//       const response = await getRoomById(room.id.toString());
//       if (response) {
//         console.log('🔄 Room data refreshed');
//         setBedAssignments(response.bed_assignments || []);
//       }
//     } catch (error) {
//       console.error('Error refreshing room:', error);
//     }
//   };
  
//   refreshRoomData();
// };

//   const handleChangeBedSuccess = () => {
//     // Refresh data after successful bed change
//     loadTenantsBasedOnPreferences();
//     if (onRefresh) onRefresh();
//   };

//   const totalBeds = room.total_bed;
//   const occupiedBeds = bedAssignments.filter(b => !b.is_available).length;
//   const availableBedsCount = totalBeds - occupiedBeds;

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="text-2xl flex items-center gap-3">
//               <Bed className="h-6 w-6" />
//               Bed Management - Room {room.room_number}
//               <Badge variant="outline" className="ml-2">
//                 {room.property_name}
//               </Badge>
//             </DialogTitle>
//             <DialogDescription className="flex items-center gap-2">
//               <MapPin className="h-4 w-4" />
//               {room.property_address} • Floor {room.floor || 'G'}
//             </DialogDescription>
//           </DialogHeader>

//           {/* Room Info & Stats */}
//           <div className="space-y-6">
//             {/* Room Preferences */}
//             {roomGenderPreferences.length > 0 && (
//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex items-center gap-2 mb-3">
//                     <Filter className="h-4 w-4 text-blue-600" />
//                     <h3 className="font-semibold text-gray-800">Room Preferences</h3>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {roomGenderPreferences.map((pref:any) => {
//                       const prefLower = pref.toLowerCase();
//                       let label = '';
                      
//                       if (prefLower === 'male_only' || prefLower === 'male') {
//                         label = 'Male Only';
//                       } else if (prefLower === 'female_only' || prefLower === 'female') {
//                         label = 'Female Only';
//                       } else if (prefLower === 'couples') {
//                         label = 'Couples';
//                       } else if (prefLower === 'both' || prefLower === 'any' || prefLower === 'mixed') {
//                         label = 'Mixed Gender';
//                       }
                      
//                       return (
//                         <Badge key={pref} variant="outline" className="bg-white">
//                           <GenderIcon gender={prefLower} size="h-3 w-3" />
//                           <span className="ml-1">{label}</span>
//                         </Badge>
//                       );
//                     })}
//                   </div>
//                   <p className="text-sm text-gray-600 mt-2">
//                     Tenants will be filtered based on these preferences.
//                   </p>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Stats Cards */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600">Total Beds</p>
//                       <h3 className="text-2xl font-bold text-gray-800">{totalBeds}</h3>
//                     </div>
//                     <Bed className="h-8 w-8 text-blue-500" />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600">Occupied</p>
//                       <h3 className="text-2xl font-bold text-green-600">{occupiedBeds}</h3>
//                     </div>
//                     <UserRound className="h-8 w-8 text-green-500" />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600">Available</p>
//                       <h3 className="text-2xl font-bold text-cyan-600">{availableBedsCount}</h3>
//                     </div>
//                     <UserPlus className="h-8 w-8 text-cyan-500" />
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardContent className="p-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm text-gray-600">Rent per Bed</p>
//                       <h3 className="text-2xl font-bold text-amber-600">₹{room.rent_per_bed}</h3>
//                     </div>
//                     <BadgeIndianRupee className="h-8 w-8 text-amber-500" />
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Bed Assignments */}
//             <div>
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-xl font-bold flex items-center gap-2">
//                     <ClipboardList className="h-5 w-5" />
//                     Bed Assignments
//                   </h3>
//                   <p className="text-sm text-gray-600 mt-1">
//                     {availableBedsCount > 0 ? (
//                       <span className="text-green-600 font-medium">{availableBedsCount} beds available</span>
//                     ) : (
//                       <span className="text-amber-600">Room is fully occupied</span>
//                     )}
//                   </p>
//                 </div>
//                 <Badge variant={availableBedsCount > 0 ? "default" : "secondary"}>
//                   {totalBeds} Beds Total
//                 </Badge>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                 {Array.from({ length: totalBeds }, (_, i) => i + 1).map(bedNumber => {
//                   const { status, assignment } = getBedStatus(bedNumber);
//                   const isOccupied = status === 'occupied';
//                   const tenantDetails = assignment?.tenant_id ? findTenantDetails(assignment.tenant_id) : null;
//                   const isAssigning = assigningBed === bedNumber;
//                   const isSaving = savingBed === bedNumber;

//                   return (
//                     <BedCard
//                       key={bedNumber}
//                       bedNumber={bedNumber}
//                       assignment={assignment}
//                       isOccupied={isOccupied}
//                       isAssigning={isAssigning}
//                       isSaving={isSaving}
//                       onAssignClick={() => {
//                         if (isAssigning) {
//                           setAssigningBed(null);
//                         } else {
//                           setAssigningBed(bedNumber);
//                         }
//                       }}
//                       onUpdateClick={(tenantId) => {
//                         if (assignment) {
//                           handleUpdateBedAssignment(assignment, tenantId);
//                         } else {
//                           handleAssignBed(bedNumber, tenantId);
//                         }
//                       }}
//                       onVacateClick={() => assignment && handleVacateClick(assignment)}
//                       onChangeBedClick={() => assignment && handleChangeBedClick(assignment)}
//                       tenants={tenants}
//                       loadingTenants={loadingTenants}
//                       roomGenderPreferences={roomGenderPreferences}
//                       currentRoomAssignments={bedAssignments}
//                       tenantDetails={tenantDetails}
//                       room={room} // Pass room prop here
//                     />
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           <DialogFooter className="gap-2 pt-6 border-t">
//             <div className="flex-1">
//               <div className="flex items-center gap-2 text-sm text-gray-600">
//                 <AlertCircle className="h-4 w-4" />
//                 <span>Only active tenants with portal access can be assigned</span>
//               </div>
//               <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
//                 <RefreshCw className="h-4 w-4" />
//                 <span>Click "Change Bed" to move tenant to different bed/room</span>
//               </div>
//             </div>
//             <Button variant="outline" onClick={() => onOpenChange(false)}>
//               Close
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Vacate Wizard Dialog */}
//       {selectedBedForVacate && (
//         <VacateBedWizard
//           open={vacateWizardOpen}
//           onOpenChange={setVacateWizardOpen}
//           bedAssignment={selectedBedForVacate}
//           tenantDetails={findTenantDetails(selectedBedForVacate.tenant_id)}
//           onVacateComplete={handleVacateComplete}
//         />
//       )}

//       {/* Change Bed Wizard Dialog */}
//       {selectedTenantForChange && (
//         <ChangeBedWizard
//           tenantId={selectedTenantForChange.id}
//           tenantName={selectedTenantForChange.full_name}
//           open={changeBedWizardOpen}
//           onOpenChange={setChangeBedWizardOpen}
//           onSuccess={handleChangeBedSuccess}
//         />
//       )}

//       {/* Transfer Dialog */}
//       <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="text-xl">Transfer Required</DialogTitle>
//             <DialogDescription>
//               Tenant is already assigned to another bed
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="space-y-4">
//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
//                 <div>
//                   <h4 className="font-semibold text-amber-800">Transfer Tenant</h4>
//                   <p className="text-sm text-amber-700 mt-1">
//                     <strong>{transferDetails.newTenant?.full_name}</strong> will be moved from their current bed.
//                   </p>
//                 </div>
//               </div>
//             </div>
            
//             <div>
//               <Label htmlFor="transfer-reason" className="text-sm font-medium">
//                 Reason for Transfer
//               </Label>
//               <Textarea
//                 id="transfer-reason"
//                 placeholder="Enter reason for transferring..."
//                 value={transferReason}
//                 onChange={(e) => setTransferReason(e.target.value)}
//                 className="mt-2 min-h-[80px]"
//                 required
//               />
//             </div>
//           </div>
          
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setTransferDialogOpen(false);
//                 setTransferDetails({
//                   bedAssignment: null,
//                   newTenant: null,
//                   existingAssignment: null
//                 });
//                 setTransferReason('');
//               }}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleTransferConfirmation}
//               disabled={!transferReason.trim()}
//             >
//               Confirm Transfer
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

// components/admin/rooms/BedManagementDialog.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import {
  Bed, MapPin, UserPlus, UserMinus, BadgeIndianRupee,
  ClipboardList, AlertCircle, Check, X,
  UserRound, Eye, Filter, Save,
  UsersRound, Mail, Phone, Search,
  ChevronDown, RefreshCw
} from 'lucide-react';
import { getAvailableBeds, assignBed, updateBedAssignment, getRoomById } from '@/lib/roomsApi';
import { request } from '@/lib/api';
import type { RoomResponse, BedAssignment } from '@/lib/roomsApi';
import { VacateBedWizard } from '@/components/admin/rooms/VacateBedWizard';
import { ChangeBedWizard } from '@/components/admin/rooms/ChangeBedWizard';

interface BedManagementDialogProps {
  room: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

interface BedAssignmentState {
  tenantId: string;
  selectedTenant: any | null;
}

interface Tenant {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  is_active: boolean;
  portal_access_enabled: boolean;
  couple_id?: number;
  is_assigned?: boolean;
}

interface ApiResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

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
      return <UserRound className={`${size} text-gray-600`} />;
  }
};

// Cleaned up Tenant Selection Dropdown Component
function TenantSelectDropdown({
  bedNumber,
  value,
  onValueChange,
  tenants,
  loading,
  roomGenderPreferences,
  currentRoomAssignments
}: {
  bedNumber: number;
  value: string;
  onValueChange: (value: string) => void;
  tenants: Tenant[];
  loading: boolean;
  roomGenderPreferences: string[];
  currentRoomAssignments: BedAssignment[];
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only unassigned tenants
  const unassignedTenants = tenants.filter(tenant => !tenant.is_assigned);
  
  // Filter based on room preferences and current assignments
  const filteredTenants = unassignedTenants.filter(tenant => {
    const tenantGender = tenant.gender?.toLowerCase();
    const tenantIsCouple = tenant.couple_id != null;
    
    // For rooms with both male and female preference
    const hasBothGenders = roomGenderPreferences.some(p => 
      p.toLowerCase() === 'both' || p.toLowerCase() === 'any' || p.toLowerCase() === 'mixed'
    );
    
    const hasMaleOnly = roomGenderPreferences.some(p => 
      p.toLowerCase() === 'male_only' || p.toLowerCase() === 'male'
    );
    
    const hasFemaleOnly = roomGenderPreferences.some(p => 
      p.toLowerCase() === 'female_only' || p.toLowerCase() === 'female'
    );
    
    const hasCouplesAllowed = roomGenderPreferences.some(p => 
      p.toLowerCase() === 'couples'
    );
    
    // Get assigned genders in current room (excluding the current bed)
    const assignedGenders = currentRoomAssignments
      .filter(assignment => assignment.bed_number !== bedNumber && assignment.tenant_gender)
      .map(assignment => assignment.tenant_gender?.toLowerCase());
    
    // For rooms with both male and female (mixed gender rooms)
    if (hasBothGenders) {
      return !tenantIsCouple; // Don't show couples unless explicitly allowed
    }
    
    // For male-only rooms
    if (hasMaleOnly && !hasFemaleOnly) {
      return tenantGender === 'male' && !tenantIsCouple;
    }
    
    // For female-only rooms
    if (hasFemaleOnly && !hasMaleOnly) {
      return tenantGender === 'female' && !tenantIsCouple;
    }
    
    // For rooms that allow both male and female (but not "both" preference)
    if (hasMaleOnly && hasFemaleOnly) {
      // If one gender is already assigned, only show that gender
      if (assignedGenders.length > 0) {
        const assignedGender = assignedGenders[0];
        if (assignedGender === 'male') {
          return tenantGender === 'male' && !tenantIsCouple;
        } else if (assignedGender === 'female') {
          return tenantGender === 'female' && !tenantIsCouple;
        }
      }
      // If no assignments yet, show both genders
      return (tenantGender === 'male' || tenantGender === 'female') && !tenantIsCouple;
    }
    
    // For couples rooms
    if (hasCouplesAllowed) {
      return true; // Couples rooms can have any tenant (individuals or couples)
    }
    
    return true;
  });

  // Apply search filter
  const searchedTenants = searchQuery 
    ? filteredTenants.filter(tenant => 
        tenant.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.phone?.includes(searchQuery) ||
        tenant.id?.toString().includes(searchQuery)
      )
    : filteredTenants;

  // Sort tenants: couples first, then by name
  const sortedTenants = [...searchedTenants].sort((a, b) => {
    if (a.couple_id && !b.couple_id) return -1;
    if (!a.couple_id && b.couple_id) return 1;
    return a.full_name?.localeCompare(b.full_name || '') || 0;
  });

  // Get selected tenant
  const selectedTenant = tenants.find(t => t.id.toString() === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs md:text-sm font-medium">Select Tenant</Label>
        <span className="text-[10px] md:text-xs text-gray-500">
          {sortedTenants.length} available
        </span>
      </div>
      
      <Select value={value} onValueChange={onValueChange} disabled={loading}>
        <SelectTrigger className="h-8 md:h-10">
          <SelectValue placeholder={
            loading ? "Loading..." : 
            sortedTenants.length > 0 ? "Choose a tenant" : 
            "No tenants available"
          } />
        </SelectTrigger>
        <SelectContent className="max-h-[350px] p-0">
          {/* Search inside dropdown */}
          <div className="sticky top-0 z-10 bg-white border-b p-2 md:p-3">
            <div className="relative">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-500" />
              <Input
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 md:pl-9 h-7 md:h-9 text-xs md:text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Tenant list */}
          <div className="max-h-[250px] overflow-y-auto">
            {loading ? (
              <div className="p-4 md:p-6 text-center">
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-xs md:text-sm text-gray-500 mt-2">Loading tenants...</p>
              </div>
            ) : sortedTenants.length === 0 ? (
              <div className="p-4 md:p-6 text-center">
                <UserRound className="h-6 w-6 md:h-8 md:w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs md:text-sm font-medium text-gray-600">No tenants found</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                  {searchQuery ? "Try a different search" : "All tenants are assigned"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {sortedTenants.map(tenant => (
                  <SelectItem 
                    key={tenant.id} 
                    value={tenant.id.toString()}
                    className="py-2 md:py-3"
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="relative">
                        {tenant.couple_id ? (
                          <UsersRound className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                        ) : (
                          <GenderIcon gender={tenant.gender || 'Other'} size="h-4 w-4 md:h-5 md:w-5" />
                        )}
                        {tenant.is_active && (
                          <div className="absolute -top-1 -right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full border border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs md:text-sm truncate">
                          {tenant.full_name}
                          {tenant.couple_id && (
                            <Badge variant="outline" className="ml-1 md:ml-2 h-4 md:h-5 px-1 md:px-1.5 text-[9px] md:text-xs bg-red-50 text-red-700 border-red-200">
                              Couple
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 md:gap-2 mt-0.5">
                          <span>ID: {tenant.id}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {tenant.gender || 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </div>
            )}
          </div>
        </SelectContent>
      </Select>

      {/* Selected tenant preview */}
      {selectedTenant && (
        <div className="mt-2 md:mt-3 p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h4 className="text-xs md:text-sm font-semibold text-blue-800">Selected Tenant</h4>
            {selectedTenant.couple_id ? (
              <UsersRound className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
            ) : (
              <GenderIcon gender={selectedTenant.gender || 'Other'} size="h-3 w-3 md:h-4 md:w-4" />
            )}
          </div>
          
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">Name</span>
              <span className="text-xs md:text-sm font-medium">{selectedTenant.full_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">ID</span>
              <span className="text-xs md:text-sm font-mono">{selectedTenant.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">Gender</span>
              <span className="text-xs md:text-sm">{selectedTenant.couple_id ? 'Couple' : selectedTenant.gender || 'Not specified'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">Status</span>
              <Badge variant={selectedTenant.is_active ? "default" : "secondary"} className="h-4 md:h-5 text-[9px] md:text-xs">
                {selectedTenant.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          
          {selectedTenant.phone && (
            <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-blue-100">
              <div className="flex items-center gap-1 md:gap-2">
                <Phone className="h-2.5 w-2.5 md:h-3 md:w-3 text-gray-500" />
                <span className="text-[10px] md:text-xs">{selectedTenant.phone}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Updated Bed Card Component with Change Bed button
function BedCard({
  bedNumber,
  assignment,
  isOccupied,
  isAssigning,
  onAssignClick,
  onUpdateClick,
  onVacateClick,
  onChangeBedClick,
  tenants,
  loadingTenants,
  roomGenderPreferences,
  currentRoomAssignments,
  isSaving,
  tenantDetails,
  room // Added room prop
}: {
  bedNumber: number;
  assignment: any;
  isOccupied: boolean;
  isAssigning: boolean;
  onAssignClick: () => void;
  onUpdateClick: (tenantId: string) => void;
  onVacateClick: () => void;
  onChangeBedClick: () => void;
  tenants: Tenant[];
  loadingTenants: boolean;
  roomGenderPreferences: string[];
  currentRoomAssignments: BedAssignment[];
  isSaving: boolean;
  tenantDetails?: any;
  room: RoomResponse; // Added room prop
}) {
  const [selectedTenantId, setSelectedTenantId] = useState('');

  return (
    <Card className={`overflow-hidden ${isOccupied ? 'border-green-200' : 'border-gray-200'}`}>
      <CardContent className="p-3 md:p-4">
        {/* Bed Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className={`p-1.5 md:p-2 rounded-lg ${isOccupied ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Bed className={`h-4 w-4 md:h-5 md:w-5 ${isOccupied ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">Bed {bedNumber}</h3>
              <Badge variant={isOccupied ? "default" : "outline"} className={`text-[9px] md:text-xs ${
                isOccupied ? 'bg-green-100 text-green-800 border-green-300' : ''
              }`}>
                {isOccupied ? 'Occupied' : 'Available'}
              </Badge>
            </div>
          </div>
          <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${isOccupied ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>

        {/* Occupied Bed View */}
        {isOccupied && assignment && tenantDetails && (
          <div className="space-y-3 md:space-y-4">
            {/* Tenant Info */}
            <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div>
                  <h4 className="font-semibold text-xs md:text-sm text-gray-800">Current Tenant</h4>
                  <p className="text-[10px] md:text-xs text-gray-600 mt-0.5">ID: {assignment.tenant_id}</p>
                </div>
                <GenderIcon gender={assignment.tenant_gender || ''} size="h-3.5 w-3.5 md:h-4 md:w-4" />
              </div>
              
              <div className="space-y-1 md:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-gray-600">Name</span>
                  <span className="font-medium text-xs md:text-sm">{tenantDetails.full_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-gray-600">Gender</span>
                  <span className="font-medium text-xs md:text-sm">{assignment.tenant_gender}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-gray-600">Status</span>
                  <Badge variant={tenantDetails.is_active ? "default" : "secondary"} className="h-4 md:h-5 text-[9px] md:text-xs">
                    {tenantDetails.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions for Occupied Bed */}
            <div className="space-y-2 md:space-y-3">
              {isAssigning ? (
                <>
                  <TenantSelectDropdown
                    bedNumber={bedNumber}
                    value={selectedTenantId}
                    onValueChange={setSelectedTenantId}
                    tenants={tenants}
                    loading={loadingTenants}
                    roomGenderPreferences={roomGenderPreferences}
                    currentRoomAssignments={currentRoomAssignments}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                      onClick={onAssignClick}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                      onClick={() => onUpdateClick(selectedTenantId)}
                      disabled={!selectedTenantId || isSaving}
                    >
                      {isSaving ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                    variant="outline"
                    className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-900 h-8 md:h-9 text-[10px] md:text-xs"
                    onClick={onChangeBedClick}
                    disabled={isSaving}
                  >
                    <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Change Bed
                  </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-900 h-8 md:h-9 text-[10px] md:text-xs"
                      onClick={onVacateClick}
                      disabled={isSaving}
                    >
                      <UserMinus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Vacate
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Available Bed View */}
        {!isOccupied && (
          <div className="space-y-3 md:space-y-4">
            {isAssigning ? (
              <>
                <TenantSelectDropdown
                  bedNumber={bedNumber}
                  value={selectedTenantId}
                  onValueChange={setSelectedTenantId}
                  tenants={tenants}
                  loading={loadingTenants}
                  roomGenderPreferences={roomGenderPreferences}
                  currentRoomAssignments={currentRoomAssignments}
                />
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                    onClick={onAssignClick}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                    onClick={() => onUpdateClick(selectedTenantId)}
                    disabled={!selectedTenantId || isSaving}
                  >
                    {isSaving ? 'Assigning...' : 'Assign'}
                  </Button>
                </div>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full h-9 md:h-11 text-xs md:text-sm"
                onClick={onAssignClick}
                disabled={isSaving}
              >
                <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Assign Tenant
              </Button>
            )}
          </div>
        )}

        {/* Rent Info */}
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs text-gray-600">Monthly Rent</span>
            <span className="font-bold text-xs md:text-sm text-green-600">₹{assignment?.rent_per_bed || room.rent_per_bed}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BedManagementDialog({ room, open, onOpenChange, onRefresh }: BedManagementDialogProps) {
  const [bedAssignments, setBedAssignments] = useState<BedAssignment[]>(room.bed_assignments || []);
  const [assigningBed, setAssigningBed] = useState<number | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [savingBed, setSavingBed] = useState<number | null>(null);
  
  // State for vacate wizard
  const [vacateWizardOpen, setVacateWizardOpen] = useState(false);
  const [selectedBedForVacate, setSelectedBedForVacate] = useState<BedAssignment | null>(null);
  
  // State for transfer confirmation dialog
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferDetails, setTransferDetails] = useState<{
    bedAssignment: BedAssignment | null;
    newTenant: any | null;
    existingAssignment: any | null;
  }>({
    bedAssignment: null,
    newTenant: null,
    existingAssignment: null
  });
  const [transferReason, setTransferReason] = useState('');

  // State for Change Bed wizard
  const [changeBedWizardOpen, setChangeBedWizardOpen] = useState(false);
  const [selectedTenantForChange, setSelectedTenantForChange] = useState<Tenant | null>(null);

  const roomGenderPreferences = Array.isArray(room.room_gender_preference) 
    ? room.room_gender_preference 
    : typeof room.room_gender_preference === 'string'
      ? room.room_gender_preference.split(',').filter(Boolean)
      : [];

  useEffect(() => {
    if (open) {
      loadTenantsBasedOnPreferences();
      setBedAssignments(room.bed_assignments || []);
      setAssigningBed(null);
    }
  }, [open, room]);

  const loadTenantsBasedOnPreferences = async () => {
    try {
      setLoadingTenants(true);
      
      const response : any = await request<Tenant[]>('/api/tenants?is_active=true&portal_access_enabled=true');
      
      let tenantsList: Tenant[] = [];
      
      if (Array.isArray(response)) {
        tenantsList = response;
      } else if (response.data && Array.isArray(response.data)) {
        tenantsList = response.data;
      }
      
      // Check assignment status for each tenant
      const tenantsWithAssignment = await Promise.all(
        tenantsList.map(async (tenant) => {
          try {
            const assignmentCheck = await request<ApiResult<any>>(`/api/rooms/tenant-assignment/${tenant.id}`);
            return {
              ...tenant,
              is_assigned: assignmentCheck.success && assignmentCheck.data && 
                           Array.isArray(assignmentCheck.data) && 
                           assignmentCheck.data.length > 0 &&
                           assignmentCheck.data.some((assignment: any) => !assignment.is_available)
            };
          } catch {
            return {
              ...tenant,
              is_assigned: false
            };
          }
        })
      );
      
      setTenants(tenantsWithAssignment);
    } catch (error: any) {
      console.error('Error loading tenants:', error);
      toast.error(`Failed to load tenants: ${error.message}`);
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  };

  const getBedStatus = (bedNumber: number) => {
    const assignment = bedAssignments.find(b => b.bed_number === bedNumber);
    if (!assignment) return { status: 'available', assignment: null };
    
    if (!assignment.is_available && assignment.tenant_id) {
      return { status: 'occupied', assignment };
    }
    return { status: 'available', assignment };
  };

  const findTenantDetails = (tenantId: number) => {
    return tenants.find(t => t.id === tenantId);
  };

  const checkTenantExistingAssignment = async (tenantId: number, excludeBedAssignmentId?: number) => {
    try {
      const response = await request<ApiResult<any>>(`/api/rooms/tenant-assignment/${tenantId}`);
      
      if (response.success && response.data) {
        const activeAssignments = Array.isArray(response.data) 
          ? response.data.filter((assignment: any) => 
              (excludeBedAssignmentId ? assignment.id !== excludeBedAssignmentId : true) && 
              !assignment.is_available
            )
          : [];
        
        return activeAssignments.length > 0 ? activeAssignments[0] : null;
      }
      return null;
    } catch (error) {
      console.error("Error checking tenant assignment:", error);
      return null;
    }
  };

  const vacateExistingAssignment = async (bedAssignmentId: number, reason: string) => {
    try {
      const result = await request<ApiResult<any>>(`/api/rooms/bed-assignments/${bedAssignmentId}/vacate`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to vacate bed'
      };
    }
  };

  // Handle Change Bed Click
  const handleChangeBedClick = (bedAssignment: BedAssignment) => {
    const tenantDetails = findTenantDetails(bedAssignment.tenant_id);
    if (tenantDetails) {
      setSelectedTenantForChange(tenantDetails);
      setChangeBedWizardOpen(true);
    }
  };

  const handleAssignBed = async (bedNumber: number, tenantId: string) => {
    if (!tenantId.trim()) {
      toast.error("Please select a tenant");
      return;
    }

    const tenant = tenants.find(t => t.id.toString() === tenantId);
    if (!tenant) {
      toast.error("Invalid tenant selected");
      return;
    }

    const tenantIdNum = parseInt(tenantId);
    
    try {
      setSavingBed(bedNumber);
      
      // Check if tenant is already assigned elsewhere
      const existingAssignment = await checkTenantExistingAssignment(tenantIdNum);
      
      if (existingAssignment) {
        setTransferDetails({
          bedAssignment: null,
          newTenant: tenant,
          existingAssignment: existingAssignment
        });
        setTransferReason(`Moved to Bed ${bedNumber} in Room ${room.room_number}`);
        setTransferDialogOpen(true);
        setSavingBed(null);
        return;
      }
      
      const payload = {
        room_id: room.id,
        bed_number: bedNumber,
        tenant_id: tenantIdNum,
        tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other'
      };

      const result = await assignBed(payload);
      
      if (result.success) {
        toast.success(`Bed ${bedNumber} assigned successfully!`);
        
        const newAssignment: BedAssignment = {
          id: result.data?.id || Date.now(),
          bed_number: bedNumber,
          room_id: room.id,
          tenant_id: tenantIdNum,
          tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other',
          is_available: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setBedAssignments(prev => {
          const filtered = prev.filter(b => b.bed_number !== bedNumber);
          return [...filtered, newAssignment];
        });
        
        setAssigningBed(null);
        
        if (onRefresh) onRefresh();
        
      } else {
        toast.error(result.message || "Failed to assign bed");
      }
    } catch (err: any) {
      console.error("Assign bed error:", err);
      toast.error(err.message || "Failed to assign bed");
    } finally {
      setSavingBed(null);
    }
  };

  const handleUpdateBedAssignment = async (bedAssignment: BedAssignment, tenantId: string) => {
    if (!tenantId.trim()) {
      toast.error("Please select a tenant");
      return;
    }

    const tenant = tenants.find(t => t.id.toString() === tenantId);
    if (!tenant) {
      toast.error("Invalid tenant selected");
      return;
    }

    const newTenantId = parseInt(tenantId);
    const currentTenantId = bedAssignment.tenant_id;

    if (currentTenantId === newTenantId) {
      await updateBedAssignmentDirectly(bedAssignment, tenant);
      return;
    }

    try {
      setSavingBed(bedAssignment.bed_number);
      
      const existingAssignment = await checkTenantExistingAssignment(newTenantId, bedAssignment.id);
      
      if (existingAssignment) {
        setTransferDetails({
          bedAssignment: bedAssignment,
          newTenant: tenant,
          existingAssignment: existingAssignment
        });
        setTransferReason(`Transferred to Bed ${bedAssignment.bed_number} in Room ${room.room_number}`);
        setTransferDialogOpen(true);
        setSavingBed(null);
        return;
      }
      
      await updateBedAssignmentDirectly(bedAssignment, tenant);
      
    } catch (err: any) {
      console.error("Update bed error:", err);
      toast.error(err.message || "Failed to update bed assignment");
    } finally {
      setSavingBed(null);
    }
  };

  const updateBedAssignmentDirectly = async (bedAssignment: BedAssignment, tenant: Tenant) => {
    const result = await updateBedAssignment(bedAssignment.id.toString(), {
      tenant_id: tenant.id,
      tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other',
      is_available: false
    });
    
    if (result.success) {
      toast.success(`Bed ${bedAssignment.bed_number} updated successfully!`);
      
      const updatedAssignment: BedAssignment = {
        ...bedAssignment,
        tenant_id: tenant.id,
        tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other',
        is_available: false,
        updated_at: new Date().toISOString()
      };
      
      setBedAssignments(prev => 
        prev.map(b => b.id === bedAssignment.id ? updatedAssignment : b)
      );
      
      setAssigningBed(null);
      
      if (onRefresh) onRefresh();
    } else {
      toast.error(result.message || "Failed to update bed assignment");
    }
  };

  const handleTransferConfirmation = async () => {
    try {
      const { bedAssignment, newTenant, existingAssignment } = transferDetails;
      
      if (!existingAssignment || !newTenant) {
        toast.error("Invalid transfer details");
        return;
      }

      setSavingBed(bedAssignment?.bed_number || null);
      
      const vacateResult = await vacateExistingAssignment(existingAssignment.id, transferReason);
      
      if (!vacateResult.success) {
        toast.error(`Failed to vacate existing bed: ${vacateResult.message}`);
        setSavingBed(null);
        return;
      }
      
      toast.success(`Vacated previous assignment`);
      
      if (!bedAssignment) {
        const payload = {
          room_id: room.id,
          bed_number: transferDetails.existingAssignment?.bed_number || 0,
          tenant_id: newTenant.id,
          tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other'
        };

        const result = await assignBed(payload);
        
        if (result.success) {
          const newBedAssignment: BedAssignment = {
            id: result.data?.id || Date.now(),
            bed_number: payload.bed_number,
            room_id: room.id,
            tenant_id: newTenant.id,
            tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
            is_available: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setBedAssignments(prev => {
            const filtered = prev.filter(b => b.bed_number !== payload.bed_number);
            return [...filtered, newBedAssignment];
          });
        } else {
          toast.error(result.message || "Failed to assign bed");
        }
      } else {
        const result = await updateBedAssignment(bedAssignment.id.toString(), {
          tenant_id: newTenant.id,
          tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
          is_available: false
        });
        
        if (result.success) {
          const updatedAssignment: BedAssignment = {
            ...bedAssignment,
            tenant_id: newTenant.id,
            tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
            is_available: false,
            updated_at: new Date().toISOString()
          };
          
          setBedAssignments(prev => 
            prev.map(b => b.id === bedAssignment.id ? updatedAssignment : b)
          );
        } else {
          toast.error(result.message || "Failed to update bed assignment");
        }
      }
      
      setAssigningBed(null);
      
      if (onRefresh) onRefresh();
      
      setTransferDialogOpen(false);
      setTransferDetails({
        bedAssignment: null,
        newTenant: null,
        existingAssignment: null
      });
      setTransferReason('');
      
    } catch (err: any) {
      console.error("Transfer error:", err);
      toast.error(err.message || "Failed to process transfer");
    } finally {
      setSavingBed(null);
    }
  };

  const handleVacateClick = (bedAssignment: BedAssignment) => {
    setSelectedBedForVacate(bedAssignment);
    setVacateWizardOpen(true);
  };

  const handleVacateComplete = () => {
  console.log('🔄 Vacate complete - refreshing data...');
  
  // 1. Immediately update local state to show bed as available
  setBedAssignments(prev => 
    prev.map(bed => 
      bed.id === selectedBedForVacate?.id 
        ? { ...bed, tenant_id: null, tenant_gender: null, is_available: true }
        : bed
    )
  );
  
  // 2. Refresh the parent data
  if (onRefresh) {
    console.log('🔄 Calling parent refresh...');
    onRefresh(); // This should reload the rooms list
  }
  
  // 3. Refresh tenants list
  loadTenantsBasedOnPreferences();
  
  // 4. Clear the selected bed
  setSelectedBedForVacate(null);
  setAssigningBed(null);
  
  // 5. Show success message
  toast.success('Bed vacated successfully! Occupants updated.');
  
  // 6. Force a direct refresh of room data
  const refreshRoomData = async () => {
    try {
      const response = await getRoomById(room.id.toString());
      if (response) {
        console.log('🔄 Room data refreshed');
        setBedAssignments(response.bed_assignments || []);
      }
    } catch (error) {
      console.error('Error refreshing room:', error);
    }
  };
  
  refreshRoomData();
};

  const handleChangeBedSuccess = () => {
    // Refresh data after successful bed change
    loadTenantsBasedOnPreferences();
    if (onRefresh) onRefresh();
  };

  const totalBeds = room.total_bed;
  const occupiedBeds = bedAssignments.filter(b => !b.is_available).length;
  const availableBedsCount = totalBeds - occupiedBeds;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-hidden p-0 border-0 flex flex-col">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 md:px-4 md:py-3 flex-shrink-0">
            <DialogHeader className="space-y-0.5 md:space-y-1">
              <DialogTitle className="text-sm md:text-base lg:text-lg font-bold flex items-center gap-2 justify-between flex-wrap">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <span className="flex-1">Bed Management - Room {room.room_number}</span>
                  <Badge 
                    variant="outline" 
                    className="text-[9px] md:text-[10px] px-1.5 py-0.5 bg-white text-blue-600"
                  >
                    {room.property_name}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-7 md:h-8 px-2 md:px-3 text-white hover:bg-white/20 text-xs md:text-sm"
                >
                  <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Close
                </Button>
              </DialogTitle>
              <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-blue-100 flex-wrap">
                <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                <span className="truncate">{room.property_address} • Floor {room.floor || 'G'}</span>
              </div>
            </DialogHeader>
          </div>

          <div className="px-3 py-2 md:px-4 md:py-2.5 overflow-y-auto flex-1 min-h-0">
            {/* Room Info & Stats */}
            <div className="space-y-2 md:space-y-3">
              {/* Room Preferences */}
              {roomGenderPreferences.length > 0 && (
                <Card>
                  <CardContent className="p-2 md:p-3">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                      <Filter className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                      <h3 className="font-semibold text-xs md:text-sm text-gray-800">Room Preferences</h3>
                    </div>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {roomGenderPreferences.map((pref:any) => {
                        const prefLower = pref.toLowerCase();
                        let label = '';
                        
                        if (prefLower === 'male_only' || prefLower === 'male') {
                          label = 'Male Only';
                        } else if (prefLower === 'female_only' || prefLower === 'female') {
                          label = 'Female Only';
                        } else if (prefLower === 'couples') {
                          label = 'Couples';
                        } else if (prefLower === 'both' || prefLower === 'any' || prefLower === 'mixed') {
                          label = 'Mixed Gender';
                        }
                        
                        return (
                          <Badge key={pref} variant="outline" className="bg-white text-[9px] md:text-xs">
                            <GenderIcon gender={prefLower} size="h-2.5 w-2.5 md:h-3 md:w-3" />
                            <span className="ml-1">{label}</span>
                          </Badge>
                        );
                      })}
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-600 mt-1 md:mt-2">
                      Tenants will be filtered based on these preferences.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                <Card>
                  <CardContent className="p-2 md:p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-600">Total Beds</p>
                        <h3 className="text-lg md:text-2xl font-bold text-gray-800">{totalBeds}</h3>
                      </div>
                      <Bed className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-2 md:p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-600">Occupied</p>
                        <h3 className="text-lg md:text-2xl font-bold text-green-600">{occupiedBeds}</h3>
                      </div>
                      <UserRound className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-2 md:p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-600">Available</p>
                        <h3 className="text-lg md:text-2xl font-bold text-cyan-600">{availableBedsCount}</h3>
                      </div>
                      <UserPlus className="h-6 w-6 md:h-8 md:w-8 text-cyan-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-2 md:p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-600">Rent per Bed</p>
                        <h3 className="text-lg md:text-2xl font-bold text-amber-600">₹{room.rent_per_bed}</h3>
                      </div>
                      <BadgeIndianRupee className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bed Assignments */}
              <div>
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div>
                    <h3 className="text-base md:text-lg font-bold flex items-center gap-1.5 md:gap-2">
                      <ClipboardList className="h-4 w-4 md:h-5 md:w-5" />
                      Bed Assignments
                    </h3>
                    <p className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">
                      {availableBedsCount > 0 ? (
                        <span className="text-green-600 font-medium">{availableBedsCount} beds available</span>
                      ) : (
                        <span className="text-amber-600">Room is fully occupied</span>
                      )}
                    </p>
                  </div>
                  <Badge variant={availableBedsCount > 0 ? "default" : "secondary"} className="text-[9px] md:text-xs">
                    {totalBeds} Beds Total
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
                  {Array.from({ length: totalBeds }, (_, i) => i + 1).map(bedNumber => {
                    const { status, assignment } = getBedStatus(bedNumber);
                    const isOccupied = status === 'occupied';
                    const tenantDetails = assignment?.tenant_id ? findTenantDetails(assignment.tenant_id) : null;
                    const isAssigning = assigningBed === bedNumber;
                    const isSaving = savingBed === bedNumber;

                    return (
                      <BedCard
                        key={bedNumber}
                        bedNumber={bedNumber}
                        assignment={assignment}
                        isOccupied={isOccupied}
                        isAssigning={isAssigning}
                        isSaving={isSaving}
                        onAssignClick={() => {
                          if (isAssigning) {
                            setAssigningBed(null);
                          } else {
                            setAssigningBed(bedNumber);
                          }
                        }}
                        onUpdateClick={(tenantId) => {
                          if (assignment) {
                            handleUpdateBedAssignment(assignment, tenantId);
                          } else {
                            handleAssignBed(bedNumber, tenantId);
                          }
                        }}
                        onVacateClick={() => assignment && handleVacateClick(assignment)}
                        onChangeBedClick={() => assignment && handleChangeBedClick(assignment)}
                        tenants={tenants}
                        loadingTenants={loadingTenants}
                        roomGenderPreferences={roomGenderPreferences}
                        currentRoomAssignments={bedAssignments}
                        tenantDetails={tenantDetails}
                        room={room}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t px-3 py-2 md:px-4 md:py-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-600">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span>Only active tenants with portal access can be assigned • Click "Change Bed" to move tenant</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vacate Wizard Dialog */}
      {selectedBedForVacate && (
        <VacateBedWizard
          open={vacateWizardOpen}
          onOpenChange={setVacateWizardOpen}
          bedAssignment={selectedBedForVacate}
          tenantDetails={findTenantDetails(selectedBedForVacate.tenant_id)}
          onVacateComplete={handleVacateComplete}
        />
      )}

      {/* Change Bed Wizard Dialog */}
      {selectedTenantForChange && (
        <ChangeBedWizard
          tenantId={selectedTenantForChange.id}
          tenantName={selectedTenantForChange.full_name}
          open={changeBedWizardOpen}
          onOpenChange={setChangeBedWizardOpen}
          onSuccess={handleChangeBedSuccess}
        />
      )}

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Transfer Required</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Tenant is already assigned to another bed
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 md:space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-2 md:gap-3">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs md:text-sm text-amber-800">Transfer Tenant</h4>
                  <p className="text-[10px] md:text-xs text-amber-700 mt-1">
                    <strong>{transferDetails.newTenant?.full_name}</strong> will be moved from their current bed.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="transfer-reason" className="text-xs md:text-sm font-medium">
                Reason for Transfer
              </Label>
              <Textarea
                id="transfer-reason"
                placeholder="Enter reason for transferring..."
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="mt-2 min-h-[60px] md:min-h-[80px] text-xs md:text-sm"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTransferDialogOpen(false);
                setTransferDetails({
                  bedAssignment: null,
                  newTenant: null,
                  existingAssignment: null
                });
                setTransferReason('');
              }}
              className="h-8 md:h-9 text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransferConfirmation}
              disabled={!transferReason.trim()}
              className="h-8 md:h-9 text-xs md:text-sm"
            >
              Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}