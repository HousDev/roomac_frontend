



// // components/tenant/profile/TenantProfileClientPage.tsx 
// "use client";
// import { useState, useCallback, useMemo, useEffect } from "react";
// import { toast } from "sonner";
// import { User, Save, X } from "lucide-react";

// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { getAllStaff, type StaffMember } from '@/lib/staffApi';
// import { DocumentViewerModal } from "@/components/DocumentViewerModal";
// import {
//   TenantProfile,
//   TenantFormData,
//   tenantDetailsApi,
// } from "@/lib/tenantDetailsApi";
// import { logoutTenant } from "@/lib/tenantAuthApi";

// import { useTenantValidation } from "./useTenantValidation";
// import ProfileSidebar from "./ProfileSidebar";
// import PersonalInfoTab from "./PersonalInfoTab";
// import AccommodationTab from "./AccommodationTab";
// import DocumentsTab from "./DocumentsTab";
// import PaymentsTab from "./PaymentsTab";

// /* ------------------------------------------------------------------ */
// /* TYPES */
// /* ------------------------------------------------------------------ */

// interface TenantProfileClientPageProps {
//   initialProfile: TenantProfile | null;
// }

// type DocumentModalState = {
//   open: boolean;
//   url: string;
//   title: string;
//   type: "image" | "pdf";
//   downloadName: string;
// };

// /* ------------------------------------------------------------------ */
// /* COMPONENT */
// /* ------------------------------------------------------------------ */

// export default function TenantProfileClientPage({
//   initialProfile,
// }: TenantProfileClientPageProps) {
//   const [profile, setProfile] = useState<TenantProfile | null>(initialProfile);
//   const [loading, setLoading] = useState(false);
//   const [editing, setEditing] = useState(false);
//   const [activeTab, setActiveTab] = useState("personal");
//   const [isMobile, setIsMobile] = useState(false);

//   // Add this with your other useState declarations
//   const [propertyManagerStaff, setPropertyManagerStaff] = useState<StaffMember | null>(null);

//   // Check if mobile view
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 1024);
//     };
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const [documentModal, setDocumentModal] = useState<DocumentModalState>({
//     open: false,
//     url: "",
//     title: "",
//     type: "image",
//     downloadName: "",
//   });

//   const { validateProfile, errors } = useTenantValidation();

//   /* ------------------------------------------------------------------ */
//   /* FORM STATE (EMAIL INCLUDED ✅) */
//   /* ------------------------------------------------------------------ */

//   const [formData, setFormData] = useState<TenantFormData>({
//     full_name: initialProfile?.full_name || "",
//     email: initialProfile?.email || "",
//     phone: initialProfile?.phone || "",
//     country_code: initialProfile?.country_code || "+91",
//     date_of_birth: initialProfile?.date_of_birth || "",
//     gender: initialProfile?.gender || "",
//     occupation: initialProfile?.occupation || "",
//     occupation_category: initialProfile?.occupation_category || "",
//     exact_occupation: initialProfile?.exact_occupation || "",
//     address: initialProfile?.address || "",
//     city: initialProfile?.city || "",
//     state: initialProfile?.state || "",
//     pincode: initialProfile?.pincode || "",
//     preferred_sharing: initialProfile?.preferred_sharing || "",
//     preferred_room_type: initialProfile?.preferred_room_type || "",
//     emergency_contact_name: initialProfile?.emergency_contact_name || "",
//     emergency_contact_phone: initialProfile?.emergency_contact_phone || "",
//     emergency_contact_relation: initialProfile?.emergency_contact_relation || "",
//   });

//   /* ------------------------------------------------------------------ */
//   /* HELPERS */
//   /* ------------------------------------------------------------------ */

//   const formatDateForServer = (date: string) => {
//     if (!date) return "";
//     const d = new Date(date);
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
//       2,
//       "0"
//     )}-${String(d.getDate()).padStart(2, "0")}`;
//   };

//   const calculateAge = (dob?: string) => {
//     if (!dob) return null;
//     const birth = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birth.getFullYear();
//     const m = today.getMonth() - birth.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const getDocumentUrl = (url: string) => {
//     if (!url) return "";
//     if (url.startsWith("http")) return url;
//     return `${import.meta.env.VITE_API_URL}${url}`;
//   };

//   // Add this function before loadTenantProfile
//   const fetchPropertyManagerStaff = useCallback(async (tenantData: TenantProfile) => {
//     try {
//       const allStaff = await getAllStaff();
      
//       if (!allStaff || allStaff.length === 0) {
//         return;
//       }

//       // Try to match by name first
//       if (tenantData.property_manager_name) {
//         const managerName = tenantData.property_manager_name.toLowerCase().trim();
//         const matched = allStaff.find(s => {
//           const staffFullName = `${s.salutation || ''} ${s.name}`.toLowerCase().trim();
//           const staffNameOnly = s.name.toLowerCase().trim();
          
//           return staffFullName.includes(managerName) || 
//                  staffNameOnly.includes(managerName) ||
//                  managerName.includes(staffNameOnly);
//         });
        
//         if (matched) {
//           setPropertyManagerStaff(matched);
//           return;
//         }
//       }

//       // Try to match by phone if name match fails
//       if (tenantData.property_manager_phone) {
//         const managerPhone = tenantData.property_manager_phone.replace(/\D/g, '');
//         const matched = allStaff.find(s => {
//           const staffPhone = (s.phone || '').replace(/\D/g, '');
//           const staffWhatsapp = (s.whatsapp_number || '').replace(/\D/g, '');
          
//           return staffPhone === managerPhone || staffWhatsapp === managerPhone;
//         });
        
//         if (matched) {
//           setPropertyManagerStaff(matched);
//           return;
//         }
//       }
//       setPropertyManagerStaff(null);
//     } catch (err) {
//       console.error('Error fetching staff:', err);
//       setPropertyManagerStaff(null);
//     }
//   }, []);

//   /* ------------------------------------------------------------------ */
//   /* API */
//   /* ------------------------------------------------------------------ */

//   // Add this function inside your component, before the useEffect
//   const loadTenantProfile = useCallback(async () => {
//     try {
//       setLoading(true);
      
//       const res = await tenantDetailsApi.loadProfile();
      
//       if (!res.success || !res.data) {
//         toast.error("Failed to load profile");
//         return;
//       }

//       setProfile(res.data);
//       setFormData({
//         full_name: res.data.full_name || "",
//         email: res.data.email || "",
//         phone: res.data.phone || "",
//         country_code: res.data.country_code || "+91",
//         date_of_birth: res.data.date_of_birth || "",
//         gender: res.data.gender || "",
//         occupation: res.data.occupation || "",
//         occupation_category: res.data.occupation_category || "",
//         exact_occupation: res.data.exact_occupation || "",
//         address: res.data.address || "",
//         city: res.data.city || "",
//         state: res.data.state || "",
//         pincode: res.data.pincode || "",
//         preferred_sharing: res.data.preferred_sharing || "",
//         preferred_room_type: res.data.preferred_room_type || "",
//         emergency_contact_name: res.data.emergency_contact_name || "",
//         emergency_contact_phone: res.data.emergency_contact_phone || "",
//         emergency_contact_relation: res.data.emergency_contact_relation || "",
//       });

//       // Fetch staff data for property manager
//       await fetchPropertyManagerStaff(res.data);
      
//     } catch (err: any) {
//       console.error('❌ Error in loadTenantProfile:', err);
//       toast.error(err.message || "Error loading profile");
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchPropertyManagerStaff]);

//   // Call loadTenantProfile when component mounts
//   useEffect(() => {
//     loadTenantProfile();
//   }, [loadTenantProfile]);

//   // Add this useEffect to test the API directly
//   useEffect(() => {
//     const testAPI = async () => {
//       try {
//         const response = await fetch('http://localhost:3001/api/tenant-details/profile', {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('tenant_token')}`
//           }
//         });
//         const data = await response.json();
//       } catch (error) {
//         console.error('🧪 Direct API error:', error);
//       }
//     };
    
//     testAPI();
//   }, []);

//   const handleSave = useCallback(async () => {
//     if (!profile?.id) return;

//     const validationErrors = validateProfile(formData);
//     if (Object.keys(validationErrors).length > 0) {
//       toast.error("Please fix validation errors");
//       return;
//     }

//     try {
//       setLoading(true);
//       const payload: TenantFormData = {
//         ...formData,
//         date_of_birth: formatDateForServer(formData.date_of_birth),
//       };

//       const res = await tenantDetailsApi.updateProfile(payload);
//       if (res.success) {
//         toast.success("Profile updated successfully");
//         setEditing(false);
//         await loadTenantProfile();
//       } else {
//         toast.error(res.message || "Update failed");
//       }
//     } catch (err: any) {
//       toast.error(err.message || "Error updating profile");
//     } finally {
//       setLoading(false);
//     }
//   }, [formData, profile, validateProfile, loadTenantProfile]);

//   const handleCancel = () => {
//     if (!profile) return;
//     setEditing(false);
//     setFormData({
//       full_name: profile.full_name || "",
//       email: profile.email || "",
//       phone: profile.phone || "",
//       country_code: profile.country_code || "+91",
//       date_of_birth: profile.date_of_birth || "",
//       gender: profile.gender || "",
//       occupation: profile.occupation || "",
//       occupation_category: profile.occupation_category || "",
//       exact_occupation: profile.exact_occupation || "",
//       address: profile.address || "",
//       city: profile.city || "",
//       state: profile.state || "",
//       pincode: profile.pincode || "",
//       preferred_sharing: profile.preferred_sharing || "",
//       preferred_room_type: profile.preferred_room_type || "",
//       emergency_contact_name: profile.emergency_contact_name || "",
//       emergency_contact_phone: profile.emergency_contact_phone || "",
//       emergency_contact_relation:
//         profile.emergency_contact_relation || "",
//     });
//   };

//   const handleLogout = async () => {
//     await logoutTenant();
//     localStorage.clear();
//     window.location.href = "/login";
//   };

//   /* ------------------------------------------------------------------ */
//   /* MEMO */
//   /* ------------------------------------------------------------------ */

//   const age = calculateAge(profile?.date_of_birth);

//   const paymentSummary = useMemo(() => {
//     if (!profile?.payments?.length) {
//       return { paid: 0, pending: 0, total: 0 };
//     }
//     return profile.payments.reduce(
//       (acc: any, p: any) => {
//         acc.total += p.amount;
//         p.status === "paid"
//           ? (acc.paid += p.amount)
//           : (acc.pending += p.amount);
//         return acc;
//       },
//       { paid: 0, pending: 0, total: 0 }
//     );
//   }, [profile]);

//   /* ------------------------------------------------------------------ */
//   /* RENDER */
//   /* ------------------------------------------------------------------ */

//   if (!profile) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <Card className="w-full max-w-md">
//           <CardContent className="text-center py-10">
//             <User className="mx-auto h-12 w-12 text-gray-400" />
//             <p className="mt-4">Profile not found</p>
//             <Button onClick={loadTenantProfile} className="mt-4">Retry</Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className={`max-w-7xl mx-auto ${isMobile ? 'p-4' : 'p-6'} grid lg:grid-cols-4 gap-6`}>

//         {/* ── MOBILE: Compact profile card always visible at top ── */}
//         {isMobile && (
//           <div className="col-span-1">
//             <ProfileSidebar
//               profile={profile}
//               age={age}
//               editing={editing}
//               onEdit={() => setEditing(true)}
//               isMobile={true}
//             />
//           </div>
//         )}

//         {/* ── DESKTOP: Full sidebar in left column ── */}
//         {!isMobile && (
//           <div className="lg:block">
//             <ProfileSidebar
//               profile={profile}
//               age={age}
//               editing={editing}
//               onEdit={() => setEditing(true)}
//               isMobile={false}
//             />
//           </div>
//         )}

//         {/* ── TABS CONTENT ── */}
//         <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-3'}`}>
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//             <TabsList
//               className={`
//                 ${isMobile 
//                   ? "flex overflow-x-auto whitespace-nowrap gap-2 mb-4 scrollbar-hide"
//                   : "grid grid-cols-4 mb-6"
//                 }
//               `}
//             >
//               <TabsTrigger
//                 value="personal"
//                 className={`
//                   ${isMobile 
//                     ? "text-[11px] px-3 py-1.5 min-w-fit flex-shrink-0"
//                     : ""
//                   }
//                 `}
//               >
//                 Personal
//               </TabsTrigger>
//               <TabsTrigger
//                 value="accommodation"
//                 className={isMobile ? 'text-xs px-1' : ''}
//               >
//                 Accommodation
//               </TabsTrigger>
//               <TabsTrigger
//                 value="documents"
//                 className={isMobile ? 'text-xs px-1' : ''}
//               >
//                 Documents
//               </TabsTrigger>
//               <TabsTrigger
//                 value="payments"
//                 className={isMobile ? 'text-xs px-1' : ''}
//               >
//                 Payments
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="personal" className="mt-0">
//               <PersonalInfoTab
//                 profile={profile}
//                 editing={editing}
//                 formData={formData}
//                 errors={errors}
//                 loading={loading}
//                 age={age}
//                 isMobile={isMobile}
//                 onFieldChange={(field, value) =>
//                   setFormData((prev) => ({ ...prev, [field]: value }))
//                 }
//               />

//               {editing && (
//                 <div className={`flex gap-4 ${isMobile ? 'mt-4' : 'mt-6'}`}>
//                   <Button
//                     onClick={handleSave}
//                     disabled={loading}
//                     className={isMobile ? 'flex-1' : ''}
//                   >
//                     <Save className="mr-2 h-4 w-4" />
//                     Save
//                   </Button>
//                   <Button
//                     variant="outline"
//                     onClick={handleCancel}
//                     className={isMobile ? 'flex-1' : ''}
//                   >
//                     <X className="mr-2 h-4 w-4" />
//                     Cancel
//                   </Button>
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="accommodation" className="mt-0">
//               <AccommodationTab
//                 profile={profile}
//                 isMobile={isMobile}
//                 propertyManagerStaff={propertyManagerStaff}
//               />
//             </TabsContent>

//             <TabsContent value="documents" className="mt-0">
//               <DocumentsTab
//                 profile={profile}
//                 getDocumentUrl={getDocumentUrl}
//                 onDocumentClick={(data) => setDocumentModal(data)}
//                 isMobile={isMobile}
//               />
//             </TabsContent>

//             <TabsContent value="payments" className="mt-0">
//               <PaymentsTab
//                 tenantId={profile.id}
//                 isMobile={isMobile}
//               />
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>

//       <DocumentViewerModal
//         open={documentModal.open}
//         onOpenChange={(open) =>
//           setDocumentModal((prev) => ({ ...prev, open }))
//         }
//         url={documentModal.url}
//         title={documentModal.title}
//         type={documentModal.type}
//         downloadName={documentModal.downloadName}
//       />
//     </>
//   );
// }



// components/tenant/profile/TenantProfileClientPage.tsx 
"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { User, Save, X } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllStaff, type StaffMember } from '@/lib/staffApi';
import { DocumentViewerModal } from "@/components/DocumentViewerModal";
import {
  TenantProfile,
  TenantFormData,
  tenantDetailsApi,
} from "@/lib/tenantDetailsApi";
import { logoutTenant } from "@/lib/tenantAuthApi";
import { consumeMasters } from "@/lib/masterApi";

import { useTenantValidation } from "./useTenantValidation";
import ProfileSidebar from "./ProfileSidebar";
import PersonalInfoTab, { PartnerFormData } from "./PersonalInfoTab";
import AccommodationTab from "./AccommodationTab";
import DocumentsTab from "./DocumentsTab";
import PaymentsTab from "./PaymentsTab";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

interface TenantProfileClientPageProps {
  initialProfile: TenantProfile | null;
}

type DocumentModalState = {
  open: boolean;
  url: string;
  title: string;
  type: "image" | "pdf";
  downloadName: string;
};

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export default function TenantProfileClientPage({
  initialProfile,
}: TenantProfileClientPageProps) {
  const [profile, setProfile] = useState<TenantProfile | null>(initialProfile);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [isMobile, setIsMobile] = useState(false);

  // Add this with your other useState declarations
  const [propertyManagerStaff, setPropertyManagerStaff] = useState<StaffMember | null>(null);

  // ========== CHANGE A: Add masters state ==========
  const [cities, setCities] = useState<Array<{id:number;name:string}>>([]);
  const [states, setStates] = useState<Array<{id:number;name:string}>>([]);
  const [partnerData, setPartnerData] = useState<PartnerFormData>({ 
    full_name: '',
    phone: '',
    email: '',
    gender: '',
    date_of_birth: '',
    address: '',
    occupation: '',
    organization: '',
    relationship: 'Spouse' 
  });

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [documentModal, setDocumentModal] = useState<DocumentModalState>({
    open: false,
    url: "",
    title: "",
    type: "image",
    downloadName: "",
  });

  const { validateProfile, errors } = useTenantValidation();

  /* ------------------------------------------------------------------ */
  /* FORM STATE (EMAIL INCLUDED ✅) */
  /* ------------------------------------------------------------------ */

const [formData, setFormData] = useState<TenantFormData>({
  full_name: initialProfile?.full_name || "",
  email: initialProfile?.email || "",
  phone: initialProfile?.phone || "",
  country_code: initialProfile?.country_code || "+91",
  date_of_birth: initialProfile?.date_of_birth 
    ? (initialProfile.date_of_birth as string).split('T')[0] 
    : "",
  gender: initialProfile?.gender || "",
    occupation: initialProfile?.occupation || "",
    occupation_category: initialProfile?.occupation_category || "",
    exact_occupation: initialProfile?.exact_occupation || "",
    address: initialProfile?.address || "",
    city: initialProfile?.city || "",
    state: initialProfile?.state || "",
    pincode: initialProfile?.pincode || "",
    preferred_sharing: initialProfile?.preferred_sharing || "",
    preferred_room_type: initialProfile?.preferred_room_type || "",
    emergency_contact_name: initialProfile?.emergency_contact_name || "",
    emergency_contact_phone: initialProfile?.emergency_contact_phone || "",
    emergency_contact_relation: initialProfile?.emergency_contact_relation || "",
  });

  /* ------------------------------------------------------------------ */
  /* HELPERS */
  /* ------------------------------------------------------------------ */

  const formatDateForServer = (date: string) => {
  if (!date) return "";
  // Return as-is if already in YYYY-MM-DD format, avoid timezone shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const parseDateSafe = (dateStr: string) => {
  if (!dateStr) return "";
  // Extract just YYYY-MM-DD without timezone conversion
  return dateStr.substring(0, 10);
};
  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getDocumentUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  
  // Add leading slash if missing
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  
  return `${import.meta.env.VITE_API_URL}${normalizedUrl}`;
};
  // Add this function before loadTenantProfile
  const fetchPropertyManagerStaff = useCallback(async (tenantData: TenantProfile) => {
    try {
      const allStaff = await getAllStaff();
      
      if (!allStaff || allStaff.length === 0) {
        return;
      }

      // Try to match by name first
      if (tenantData.property_manager_name) {
        const managerName = tenantData.property_manager_name.toLowerCase().trim();
        const matched = allStaff.find(s => {
          const staffFullName = `${s.salutation || ''} ${s.name}`.toLowerCase().trim();
          const staffNameOnly = s.name.toLowerCase().trim();
          
          return staffFullName.includes(managerName) || 
                 staffNameOnly.includes(managerName) ||
                 managerName.includes(staffNameOnly);
        });
        
        if (matched) {
          setPropertyManagerStaff(matched);
          return;
        }
      }

      // Try to match by phone if name match fails
      if (tenantData.property_manager_phone) {
        const managerPhone = tenantData.property_manager_phone.replace(/\D/g, '');
        const matched = allStaff.find(s => {
          const staffPhone = (s.phone || '').replace(/\D/g, '');
          const staffWhatsapp = (s.whatsapp_number || '').replace(/\D/g, '');
          
          return staffPhone === managerPhone || staffWhatsapp === managerPhone;
        });
        
        if (matched) {
          setPropertyManagerStaff(matched);
          return;
        }
      }
      setPropertyManagerStaff(null);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setPropertyManagerStaff(null);
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* API */
  /* ------------------------------------------------------------------ */

  // Add this function inside your component, before the useEffect
  const loadTenantProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      const res = await tenantDetailsApi.loadProfile();
      
      if (!res.success || !res.data) {
        toast.error("Failed to load profile");
        return;
      }

      setProfile(res.data);
      setFormData({
        full_name: res.data.full_name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        country_code: res.data.country_code || "+91",
date_of_birth: res.data.date_of_birth 
  ? (res.data.date_of_birth as string).split('T')[0] 
  : "",
          gender: res.data.gender || "",
        occupation: res.data.occupation || "",
        occupation_category: res.data.occupation_category || "",
        exact_occupation: res.data.exact_occupation || "",
        address: res.data.address || "",
        city: res.data.city || "",
  state: res.data.state || "",
  city_id: res.data.city_id ? String(res.data.city_id) : "",
  state_id: res.data.state_id ? String(res.data.state_id) : "",
        pincode: res.data.pincode || "",
        preferred_sharing: res.data.preferred_sharing || "",
        preferred_room_type: res.data.preferred_room_type || "",
        emergency_contact_name: res.data.emergency_contact_name || "",
        emergency_contact_phone: res.data.emergency_contact_phone || "",
        emergency_contact_relation: res.data.emergency_contact_relation || "",

         // Extra occupation fields
  work_mode: (res.data as any).work_mode || "",
shift_timing: (res.data as any).shift_timing || "",
organization: (res.data as any).organization || "",
years_of_experience: (res.data as any).years_of_experience || "",
monthly_income: (res.data as any).monthly_income || "",
course_duration: (res.data as any).course_duration || "",
student_id: (res.data as any).student_id || "",
portfolio_url: (res.data as any).portfolio_url || "",
employee_id: (res.data as any).employee_id || "",
        
      });

      // ========== CHANGE B: Fetch masters inside loadTenantProfile (after setting setProfile) ==========
      try {
        const mastersRes = await consumeMasters({ tab: 'Common' });
        if (mastersRes?.success) {
          const cityRows = (mastersRes.data || []).filter((i: any) => i.type_name === 'Cities');
          const stateRows = (mastersRes.data || []).filter((i: any) => i.type_name === 'States');
          setCities(cityRows.map((i: any) => ({ id: i.value_id, name: i.value_name })));
          setStates(stateRows.map((i: any) => ({ id: i.value_id, name: i.value_name })));
        }
      } catch (err) {
        console.error('Error fetching masters:', err);
      }

      // ========== CHANGE B (continued): Set partner data from loaded profile ==========
      setPartnerData({
        full_name: (res.data as any).partner_full_name || '',
        phone: (res.data as any).partner_phone || '',
        email: (res.data as any).partner_email || '',
        gender: (res.data as any).partner_gender || '',
date_of_birth: (res.data as any).partner_date_of_birth 
  ? ((res.data as any).partner_date_of_birth as string).split('T')[0]
  : '',
          address: (res.data as any).partner_address || '',
        occupation: (res.data as any).partner_occupation || '',
        organization: (res.data as any).partner_organization || '',
        relationship: (res.data as any).partner_relationship || 'Spouse',
      });

      // Fetch staff data for property manager
      await fetchPropertyManagerStaff(res.data);
      
    } catch (err: any) {
      console.error('❌ Error in loadTenantProfile:', err);
      toast.error(err.message || "Error loading profile");
    } finally {
      setLoading(false);
    }
  }, [fetchPropertyManagerStaff]);

  // Call loadTenantProfile when component mounts
  useEffect(() => {
    loadTenantProfile();
  }, [loadTenantProfile]);

  // Add this useEffect to test the API directly
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/tenant-details/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('tenant_token')}`
          }
        });
        const data = await response.json();
      } catch (error) {
        console.error('🧪 Direct API error:', error);
      }
    };
    
    testAPI();
  }, []);

 const handleSave = useCallback(async () => {
  if (!profile?.id) return;

  const validationErrors = validateProfile(formData);
  if (Object.keys(validationErrors).length > 0) {
    toast.error("Please fix validation errors");
    return;
  }

  try {
    setLoading(true);
    
    // Remove city_id and state_id from formData if they exist
    const { city_id, state_id, ...cleanFormData } = formData;
    
    // Build partner payload - ONLY include fields that have values
    const partnerPayload: any = {};
    if (partnerData) {
      if (partnerData.full_name) partnerPayload.partner_full_name = partnerData.full_name;
      if (partnerData.phone) partnerPayload.partner_phone = partnerData.phone;
      if (partnerData.email) partnerPayload.partner_email = partnerData.email;
      if (partnerData.gender) partnerPayload.partner_gender = partnerData.gender;
      if (partnerData.date_of_birth) partnerPayload.partner_date_of_birth = partnerData.date_of_birth;
      if (partnerData.address) partnerPayload.partner_address = partnerData.address;
      if (partnerData.occupation) partnerPayload.partner_occupation = partnerData.occupation;
      if (partnerData.organization) partnerPayload.partner_organization = partnerData.organization;
      if (partnerData.relationship) partnerPayload.partner_relationship = partnerData.relationship;
    }
    
    const payload = { 
      ...cleanFormData, 
      date_of_birth: formatDateForServer(formData.date_of_birth),
      ...partnerPayload
    };

    const res = await tenantDetailsApi.updateProfile(payload);
    if (res.success) {
      toast.success("Profile updated successfully");
      setEditing(false);
      await loadTenantProfile();
    } else {
      toast.error(res.message || "Update failed");
    }
  } catch (err: any) {
    toast.error(err.message || "Error updating profile");
  } finally {
    setLoading(false);
  }
}, [formData, profile, validateProfile, loadTenantProfile, partnerData]);
 
const handleCancel = () => {
    if (!profile) return;
    setEditing(false);
    setFormData({
      full_name: profile.full_name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      country_code: profile.country_code || "+91",
date_of_birth: profile.date_of_birth 
  ? (profile.date_of_birth as string).split('T')[0] 
  : "",
        gender: profile.gender || "",
      occupation: profile.occupation || "",
      occupation_category: profile.occupation_category || "",
      exact_occupation: profile.exact_occupation || "",
      address: profile.address || "",
      city: profile.city || "",
      state: profile.state || "",
      pincode: profile.pincode || "",
      preferred_sharing: profile.preferred_sharing || "",
      preferred_room_type: profile.preferred_room_type || "",
      emergency_contact_name: profile.emergency_contact_name || "",
      emergency_contact_phone: profile.emergency_contact_phone || "",
      emergency_contact_relation:
        profile.emergency_contact_relation || "",
    });
    // Reset partner data to original
    setPartnerData({
      full_name: (profile as any).partner_full_name || '',
      phone: (profile as any).partner_phone || '',
      email: (profile as any).partner_email || '',
      gender: (profile as any).partner_gender || '',
date_of_birth: (profile as any).partner_date_of_birth
  ? ((profile as any).partner_date_of_birth as string).split('T')[0]
  : '',      address: (profile as any).partner_address || '',
      occupation: (profile as any).partner_occupation || '',
      organization: (profile as any).partner_organization || '',
      relationship: (profile as any).partner_relationship || 'Spouse',
    });
  };

  const handleLogout = async () => {
    await logoutTenant();
    localStorage.clear();
    window.location.href = "/login";
  };

  /* ------------------------------------------------------------------ */
  /* MEMO */
  /* ------------------------------------------------------------------ */

  const age = calculateAge(profile?.date_of_birth);

  const paymentSummary = useMemo(() => {
    if (!profile?.payments?.length) {
      return { paid: 0, pending: 0, total: 0 };
    }
    return profile.payments.reduce(
      (acc: any, p: any) => {
        acc.total += p.amount;
        p.status === "paid"
          ? (acc.paid += p.amount)
          : (acc.pending += p.amount);
        return acc;
      },
      { paid: 0, pending: 0, total: 0 }
    );
  }, [profile]);

  /* ------------------------------------------------------------------ */
  /* RENDER */
  /* ------------------------------------------------------------------ */

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-10">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4">Profile not found</p>
            <Button onClick={loadTenantProfile} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className={`max-w-7xl mx-auto ${isMobile ? 'p-4' : 'p-6'} grid lg:grid-cols-4 gap-6`}>

        {/* ── MOBILE: Compact profile card always visible at top ── */}
        {isMobile && (
          <div className="col-span-1">
            <ProfileSidebar
              profile={profile}
              age={age}
              editing={editing}
              onEdit={() => setEditing(true)}
              isMobile={true}
            />
          </div>
        )}

        {/* ── DESKTOP: Full sidebar in left column ── */}
        {!isMobile && (
          <div className="lg:block">
            <ProfileSidebar
              profile={profile}
              age={age}
              editing={editing}
              onEdit={() => setEditing(true)}
              isMobile={false}
            />
          </div>
        )}

        {/* ── TABS CONTENT ── */}
        <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-3'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList
              className={`
                ${isMobile 
                  ? "flex overflow-x-auto whitespace-nowrap gap-2 mb-4 scrollbar-hide"
                  : "grid grid-cols-4 mb-6"
                }
              `}
            >
              <TabsTrigger
                value="personal"
                className={`
                  ${isMobile 
                    ? "text-[11px] px-3 py-1.5 min-w-fit flex-shrink-0"
                    : ""
                  }
                `}
              >
                Personal
              </TabsTrigger>
              <TabsTrigger
                value="accommodation"
                className={isMobile ? 'text-xs px-1' : ''}
              >
                Accommodation
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className={isMobile ? 'text-xs px-1' : ''}
              >
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className={isMobile ? 'text-xs px-1' : ''}
              >
                Payments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-0">
              {/* ========== CHANGE D: Pass new props to PersonalInfoTab ========== */}
              <PersonalInfoTab
                profile={profile}
                editing={editing}
                formData={formData}
                errors={errors}
                loading={loading}
                age={age}
                isMobile={isMobile}
                cities={cities}
                states={states}
                partnerData={partnerData}
                onPartnerFieldChange={(f, v) => setPartnerData(p => ({ ...p, [f]: v }))}
                onFieldChange={(field, value) =>
                  setFormData((prev) => ({ ...prev, [field]: value }))
                }
              />

              {editing && (
                <div className={`flex gap-4 ${isMobile ? 'mt-4' : 'mt-6'}`}>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className={isMobile ? 'flex-1' : ''}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className={isMobile ? 'flex-1' : ''}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="accommodation" className="mt-0">
              <AccommodationTab
                profile={profile}
                isMobile={isMobile}
                propertyManagerStaff={propertyManagerStaff}
              />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              {/* ========== CHANGE D: Pass new props to DocumentsTab ========== */}
              <DocumentsTab
                profile={profile}
                getDocumentUrl={getDocumentUrl}
                onDocumentClick={(data) => setDocumentModal(data)}
                isMobile={isMobile}
                onProfileRefresh={loadTenantProfile}
              />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentsTab
                tenantId={profile.id}
                isMobile={isMobile}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <DocumentViewerModal
        open={documentModal.open}
        onOpenChange={(open) =>
          setDocumentModal((prev) => ({ ...prev, open }))
        }
        url={documentModal.url}
        title={documentModal.title}
        type={documentModal.type}
        downloadName={documentModal.downloadName}
      />
    </>
  );
}