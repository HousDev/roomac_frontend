// "use client";

// import { useState, useCallback, useMemo, SetStateAction } from 'react';
// import { toast } from 'sonner';
// import { format, parseISO } from 'date-fns';
// import {
//   User, Mail, Phone, MapPin, Calendar, Home,
//   Edit, Save, X, FileText, Shield, Briefcase,
//   Building, Bed, BadgeIndianRupee, LogOut, Users,
//   AlertCircle, CreditCard, Wallet, Download,
//   Eye, Trash2, Upload
// } from 'lucide-react';
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
// import { Textarea } from "@/components/ui/textarea";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";
// import { Progress } from "@/components/ui/progress";
// import { DocumentViewerModal } from "@/components/DocumentViewerModal";
// import { TenantProfile, TenantFormData, AdditionalDocument, tenantDetailsApi } from '@/lib/tenantDetailsApi';
// import { getTenantId, logoutTenant } from '@/lib/tenantAuthApi';
// import { useTenantValidation } from './useTenantValidation';
// import ProfileHeader from './ProfileHeader';
// import ProfileSidebar from './ProfileSidebar';
// import PersonalInfoTab from './PersonalInfoTab';
// import AccommodationTab from './AccommodationTab';
// import DocumentsTab from './DocumentsTab';
// import PaymentsTab from './PaymentsTab';

// interface TenantProfileClientPageProps {
//   initialProfile: TenantProfile | null;
// }

// export default function TenantProfileClientPage({ initialProfile }: TenantProfileClientPageProps) {
//   const [profile, setProfile] = useState<TenantProfile | null>(initialProfile);
//   const [loading, setLoading] = useState(false);
//   const [editing, setEditing] = useState(false);
//   const [activeTab, setActiveTab] = useState('personal');
//   const [documentModal, setDocumentModal] = useState({
//     open: false,
//     url: '',
//     title: '',
//     type: 'image' as 'image' | 'pdf',
//     downloadName: ''
//   });

//   const { validateProfile, errors } = useTenantValidation();

//   // Initialize form data
//   const [formData, setFormData] = useState<any>(() => ({
//     full_name: initialProfile?.full_name || "",
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
//   }));

//   // Load tenant profile
//   const loadTenantProfile = useCallback(async () => {
//     try {
//       setLoading(true);
//       const result = await tenantDetailsApi.loadProfile();

//       if (result.success && result.data) {
//         const data = result.data as TenantProfile;
//         const tenantData = {
//           ...data,
//           manager_name: data.property_manager_name || data.manager_name,
//           manager_phone: data.property_manager_phone || data.manager_phone,
//         };

//         setProfile(tenantData);
//         setFormData({
//           full_name: tenantData.full_name || "",
//           phone: tenantData.phone || "",
//           country_code: tenantData.country_code || "+91",
//           date_of_birth: tenantData.date_of_birth || "",
//           gender: tenantData.gender || "",
//           occupation: tenantData.occupation || "",
//           occupation_category: tenantData.occupation_category || "",
//           exact_occupation: tenantData.exact_occupation || "",
//           address: tenantData.address || "",
//           city: tenantData.city || "",
//           state: tenantData.state || "",
//           pincode: tenantData.pincode || "",
//           preferred_sharing: tenantData.preferred_sharing || "",
//           preferred_room_type: tenantData.preferred_room_type || "",
//           emergency_contact_name: tenantData.emergency_contact_name || "",
//           emergency_contact_phone: tenantData.emergency_contact_phone || "",
//           emergency_contact_relation: tenantData.emergency_contact_relation || "",
//         });
//       } else {
//         toast.error(result.message || "Failed to load profile");
//       }
//     } catch (error: any) {
//       console.error("Error loading profile:", error);

//       if (error.message?.includes('401') ||
//           error.message?.includes('Unauthorized') ||
//           error.message?.includes('Session expired')) {
//         toast.error("Your session has expired. Please login again.");

//         localStorage.removeItem('tenant_token');
//         localStorage.removeItem('tenant_id');
//         localStorage.removeItem('tenant_logged_in');

//         setTimeout(() => {
//           window.location.href = '/tenant/login';
//         }, 2000);
//       } else {
//         toast.error("An error occurred: " + error.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Format date for server
//   const formatDateForServer = useCallback((dateString: string): string => {
//     if (!dateString) return '';

//     try {
//       const date = new Date(dateString);
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');

//       return `${year}-${month}-${day}`;
//     } catch (error) {
//       console.error('Error formatting date:', error);
//       return dateString;
//     }
//   }, []);

//   // Save profile
//   const handleSave = useCallback(async () => {
//     try {
//       if (!profile?.id) {
//         toast.error("Tenant not found");
//         return;
//       }

//       // Validate form data
//       const validationErrors = validateProfile(formData);
//       if (Object.keys(validationErrors).length > 0) {
//         toast.error("Please fix validation errors before saving");
//         return;
//       }

//       setLoading(true);

//       const formattedData = {
//         ...formData,
//         date_of_birth: formData.date_of_birth
//           ? formatDateForServer(formData.date_of_birth)
//           : formData.date_of_birth
//       };

//       const result = await tenantDetailsApi.updateProfile(formattedData);

//       if (result.success) {
//         toast.success("Profile updated successfully");
//         setEditing(false);
//         await loadTenantProfile();
//       } else {
//         toast.error(result.message || "Failed to update profile");
//       }
//     } catch (error: any) {
//       console.error("Error updating profile:", error);

//       if (error.message?.includes('Server error')) {
//         toast.error("Server error. Please check if all fields are valid.");
//       } else if (error.message?.includes('Session expired')) {
//         toast.error("Your session has expired. Please login again.");

//         localStorage.removeItem('tenant_token');
//         localStorage.removeItem('tenant_id');
//         localStorage.removeItem('tenant_logged_in');

//         setTimeout(() => {
//           window.location.href = '/tenant/login';
//         }, 2000);
//       } else {
//         toast.error("An error occurred: " + error.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [profile, formData, validateProfile, formatDateForServer, loadTenantProfile]);

//   // Cancel editing
//   const handleCancel = useCallback(() => {
//     setEditing(false);
//     if (profile) {
//       setFormData({
//         full_name: profile.full_name || "",
//         phone: profile.phone || "",
//         country_code: profile.country_code || "+91",
//         date_of_birth: profile.date_of_birth || "",
//         gender: profile.gender || "",
//         occupation: profile.occupation || "",
//         occupation_category: profile.occupation_category || "",
//         exact_occupation: profile.exact_occupation || "",
//         address: profile.address || "",
//         city: profile.city || "",
//         state: profile.state || "",
//         pincode: profile.pincode || "",
//         preferred_sharing: profile.preferred_sharing || "",
//         preferred_room_type: profile.preferred_room_type || "",
//         emergency_contact_name: profile.emergency_contact_name || "",
//         emergency_contact_phone: profile.emergency_contact_phone || "",
//         emergency_contact_relation: profile.emergency_contact_relation || "",
//       });
//     }
//   }, [profile]);

//   // Handle logout
//   const handleLogout = useCallback(async () => {
//     try {
//       await logoutTenant();
//       localStorage.removeItem('tenant_token');
//       localStorage.removeItem('tenant_id');
//       localStorage.removeItem('tenant_logged_in');

//       toast.success("Logged out successfully");
//       window.location.href = '/tenant/login';
//     } catch (error) {
//       console.error("Logout error:", error);
//       toast.error("Error during logout");
//     }
//   }, []);

//   // Calculate age
//   const calculateAge = useCallback((dob: string) => {
//     if (!dob) return null;
//     const birthDate = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     return age;
//   }, []);

//   // Calculate payment summary
//   const paymentSummary = useMemo(() => {
//     if (!profile?.payments || profile.payments.length === 0) {
//       return { paid: 0, pending: 0, total: 0 };
//     }

//     return profile.payments.reduce((acc: { paid: any; pending: any; total: any; }, payment: { status: string; amount: any; }) => {
//       if (payment.status === 'paid') {
//         acc.paid += payment.amount;
//       } else if (payment.status === 'pending') {
//         acc.pending += payment.amount;
//       }
//       acc.total += payment.amount;
//       return acc;
//     }, { paid: 0, pending: 0, total: 0 });
//   }, [profile]);

//   // Document URL helper
//   const getDocumentUrl = useCallback((url: string) => {
//     if (!url) return '';
//     if (url.startsWith('http')) return url;
//     const baseUrl = process.env.VITE_API_URL || 'http://localhost:3001';
//     return `${baseUrl}${url}`;
//   }, []);

//   // Handle form field change
//   const handleFieldChange = useCallback((field: keyof TenantFormData, value: string) => {
//     setFormData((prev: any) => ({
//       ...prev,
//       [field]: value
//     }));
//   }, []);

//   if (!profile) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardContent className="text-center py-12">
//             <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
//             <h3 className="text-lg font-semibold mb-2">No Profile Found</h3>
//             <p className="text-gray-500 mb-4">Unable to load your tenant profile</p>
//             <Button onClick={loadTenantProfile}>Try Again</Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const age = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null;

//   return (
//     <>
//       <ProfileHeader
//         tenantName={profile.full_name}
//         onLogout={handleLogout}
//       />
      
//       <div className="max-w-7xl mx-auto p-4 md:p-6">
//         {/* Page Header */}
//         <div className="mb-6 md:mb-8">
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
//           <p className="text-gray-600">View and manage your personal information</p>
//         </div>

//         <div className="grid gap-6 lg:grid-cols-4">
//           {/* Left Sidebar */}
//           <div className="lg:col-span-1">
//             <ProfileSidebar
//               profile={profile}
//               age={age}
//               editing={editing}
//               onEdit={() => setEditing(true)}
//             />
//           </div>

//           {/* Main Content */}
//           <div className="lg:col-span-3">
//             <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//               <TabsList className="grid w-full grid-cols-4">
//                 <TabsTrigger value="personal">Personal Info</TabsTrigger>
//                 <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
//                 <TabsTrigger value="documents">Documents</TabsTrigger>
//                 <TabsTrigger value="payments">Payments</TabsTrigger>
//               </TabsList>

//               {/* Personal Info Tab */}
//               <TabsContent value="personal">
//                 <PersonalInfoTab
//                   profile={profile}
//                   editing={editing}
//                   formData={formData}
//                   errors={errors}
//                   loading={loading}
//                   age={age}
//                   onFieldChange={handleFieldChange}
//                 />
                
//                 {editing && (
//                   <div className="flex gap-4 mt-6">
//                     <Button onClick={handleSave} disabled={loading}>
//                       <Save className="mr-2 h-4 w-4" />
//                       {loading ? "Saving..." : "Save Changes"}
//                     </Button>
//                     <Button variant="outline" onClick={handleCancel}>
//                       <X className="mr-2 h-4 w-4" />
//                       Cancel
//                     </Button>
//                   </div>
//                 )}
//               </TabsContent>

//               {/* Accommodation Tab */}
//               <TabsContent value="accommodation">
//                 <AccommodationTab profile={profile} />
//               </TabsContent>

//               {/* Documents Tab */}
//               <TabsContent value="documents">
//                 <DocumentsTab
//                   profile={profile}
//                   onDocumentClick={(docData: SetStateAction<{ open: boolean; url: string; title: string; type: "image" | "pdf"; downloadName: string; }>) => setDocumentModal(docData)}
//                   getDocumentUrl={getDocumentUrl}
//                 />
//               </TabsContent>

//               {/* Payments Tab */}
//               <TabsContent value="payments">
//                 <PaymentsTab
//                   profile={profile}
//                   paymentSummary={paymentSummary}
//                 />
//               </TabsContent>
//             </Tabs>
//           </div>
//         </div>
//       </div>

//       <DocumentViewerModal
//         open={documentModal.open}
//         onOpenChange={(open) => setDocumentModal(prev => ({ ...prev, open }))}
//         url={documentModal.url}
//         title={documentModal.title}
//         type={documentModal.type}
//         downloadName={documentModal.downloadName}
//       />
//     </>
//   );
// }

"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { User, Save, X } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DocumentViewerModal } from "@/components/DocumentViewerModal";
import {
  TenantProfile,
  TenantFormData,
  tenantDetailsApi,
} from "@/lib/tenantDetailsApi";
import { logoutTenant } from "@/lib/tenantAuthApi";

import { useTenantValidation } from "./useTenantValidation";
import ProfileHeader from "./ProfileHeader";
import ProfileSidebar from "./ProfileSidebar";
import PersonalInfoTab from "./PersonalInfoTab";
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
    date_of_birth: initialProfile?.date_of_birth || "",
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
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
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
    return `${process.env.VITE_API_URL}${url}`;
  };

  /* ------------------------------------------------------------------ */
  /* API */
  /* ------------------------------------------------------------------ */

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
        date_of_birth: res.data.date_of_birth || "",
        gender: res.data.gender || "",
        occupation: res.data.occupation || "",
        occupation_category: res.data.occupation_category || "",
        exact_occupation: res.data.exact_occupation || "",
        address: res.data.address || "",
        city: res.data.city || "",
        state: res.data.state || "",
        pincode: res.data.pincode || "",
        preferred_sharing: res.data.preferred_sharing || "",
        preferred_room_type: res.data.preferred_room_type || "",
        emergency_contact_name: res.data.emergency_contact_name || "",
        emergency_contact_phone: res.data.emergency_contact_phone || "",
        emergency_contact_relation:
          res.data.emergency_contact_relation || "",
      });
    } catch (err: any) {
      toast.error(err.message || "Error loading profile");
    } finally {
      setLoading(false);
    }
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
      const payload: TenantFormData = {
        ...formData,
        date_of_birth: formatDateForServer(formData.date_of_birth),
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
  }, [formData, profile, validateProfile, loadTenantProfile]);

  const handleCancel = () => {
    if (!profile) return;
    setEditing(false);
    setFormData({
      full_name: profile.full_name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      country_code: profile.country_code || "+91",
      date_of_birth: profile.date_of_birth || "",
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
  };

  const handleLogout = async () => {
    await logoutTenant();
    localStorage.clear();
    window.location.href = "/tenant/login";
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
      (acc:any, p:any) => {
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
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-10">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4">Profile not found</p>
            <Button onClick={loadTenantProfile}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ProfileHeader tenantName={profile.full_name} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-4 gap-6">
        <ProfileSidebar
          profile={profile}
          age={age}
          editing={editing}
          onEdit={() => setEditing(true)}
        />

        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfoTab
                profile={profile}
                editing={editing}
                formData={formData}
                errors={errors}
                loading={loading}
                age={age}
                onFieldChange={(field, value) =>
                  setFormData((prev) => ({ ...prev, [field]: value }))
                }
              />

              {editing && (
                <div className="flex gap-4 mt-6">
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="accommodation">
              <AccommodationTab profile={profile} />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentsTab
                profile={profile}
                getDocumentUrl={getDocumentUrl}
                onDocumentClick={(data) => setDocumentModal(data)}
              />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentsTab
                profile={profile}
                paymentSummary={paymentSummary}
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
