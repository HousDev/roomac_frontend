// "use client";
// import { useState, useCallback, useMemo } from "react";
// import { toast } from "sonner";
// import { User, Save, X } from "lucide-react";

// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// import { DocumentViewerModal } from "@/components/DocumentViewerModal";
// import {
//   TenantProfile,
//   TenantFormData,
//   tenantDetailsApi,
// } from "@/lib/tenantDetailsApi";
// import { logoutTenant } from "@/lib/tenantAuthApi";

// import { useTenantValidation } from "./useTenantValidation";
// // import ProfileHeader from "./ProfileHeader";
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

//   /* ------------------------------------------------------------------ */
//   /* API */
//   /* ------------------------------------------------------------------ */

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
//         emergency_contact_relation:
//           res.data.emergency_contact_relation || "",
//       });
//     } catch (err: any) {
//       toast.error(err.message || "Error loading profile");
//     } finally {
//       setLoading(false);
//     }
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
//       (acc:any, p:any) => {
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
//       <div className="min-h-screen flex items-center justify-center">
//         <Card>
//           <CardContent className="text-center py-10">
//             <User className="mx-auto h-12 w-12 text-gray-400" />
//             <p className="mt-4">Profile not found</p>
//             <Button onClick={loadTenantProfile}>Retry</Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* <ProfileHeader tenantName={profile.full_name} onLogout={handleLogout} /> */}

//       <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-4 gap-6">
//         <ProfileSidebar
//           profile={profile}
//           age={age}
//           editing={editing}
//           onEdit={() => setEditing(true)}
//         />

//         <div className="lg:col-span-3">
//           <Tabs value={activeTab} onValueChange={setActiveTab}>
//             <TabsList className="grid grid-cols-4">
//               <TabsTrigger value="personal">Personal</TabsTrigger>
//               <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
//               <TabsTrigger value="documents">Documents</TabsTrigger>
//               <TabsTrigger value="payments">Payments</TabsTrigger>
//             </TabsList>

//             <TabsContent value="personal">
//               <PersonalInfoTab
//                 profile={profile}
//                 editing={editing}
//                 formData={formData}
//                 errors={errors}
//                 loading={loading}
//                 age={age}
//                 onFieldChange={(field, value) =>
//                   setFormData((prev) => ({ ...prev, [field]: value }))
//                 }
//               />

//               {editing && (
//                 <div className="flex gap-4 mt-6">
//                   <Button onClick={handleSave} disabled={loading}>
//                     <Save className="mr-2 h-4 w-4" />
//                     Save
//                   </Button>
//                   <Button variant="outline" onClick={handleCancel}>
//                     <X className="mr-2 h-4 w-4" />
//                     Cancel
//                   </Button>
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="accommodation">
//               <AccommodationTab profile={profile} />
//             </TabsContent>

//             <TabsContent value="documents">
//               <DocumentsTab
//                 profile={profile}
//                 getDocumentUrl={getDocumentUrl}
//                 onDocumentClick={(data) => setDocumentModal(data)}
//               />
//             </TabsContent>

//             <TabsContent value="payments">
//               <PaymentsTab
//                 profile={profile}
//                 paymentSummary={paymentSummary}
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


"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { User, Save, X, Menu } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { DocumentViewerModal } from "@/components/DocumentViewerModal";
import {
  TenantProfile,
  TenantFormData,
  tenantDetailsApi,
} from "@/lib/tenantDetailsApi";
import { logoutTenant } from "@/lib/tenantAuthApi";

import { useTenantValidation } from "./useTenantValidation";
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
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    return `${import.meta.env.VITE_API_URL}${url}`;
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
      {/* Mobile Header with Menu Button */}
      {isMobile && (
        <div className="lg:hidden bg-white border-b sticky top-0 z-20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto">
                <div className="p-4">
                  <ProfileSidebar
                    profile={profile}
                    age={age}
                    editing={editing}
                    onEdit={() => {
                      setEditing(true);
                      setSidebarOpen(false);
                    }}
                    isMobile={true}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="font-semibold text-lg">My Profile</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}

      <div className={`max-w-7xl mx-auto ${isMobile ? 'p-4' : 'p-6'} grid lg:grid-cols-4 gap-6`}>
        {/* Desktop Sidebar - Hidden on mobile */}
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

        <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-3'}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid grid-cols-4 ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <TabsTrigger value="personal" className={isMobile ? 'text-xs px-1' : ''}>Personal</TabsTrigger>
              <TabsTrigger value="accommodation" className={isMobile ? 'text-xs px-1' : ''}>Accommodation</TabsTrigger>
              <TabsTrigger value="documents" className={isMobile ? 'text-xs px-1' : ''}>Documents</TabsTrigger>
              <TabsTrigger value="payments" className={isMobile ? 'text-xs px-1' : ''}>Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-0">
              <PersonalInfoTab
                profile={profile}
                editing={editing}
                formData={formData}
                errors={errors}
                loading={loading}
                age={age}
                isMobile={isMobile}
                onFieldChange={(field, value) =>
                  setFormData((prev) => ({ ...prev, [field]: value }))
                }
              />

              {editing && (
                <div className={`flex gap-4 ${isMobile ? 'mt-4' : 'mt-6'}`}>
                  <Button onClick={handleSave} disabled={loading} className={isMobile ? 'flex-1' : ''}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className={isMobile ? 'flex-1' : ''}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="accommodation" className="mt-0">
              <AccommodationTab profile={profile} isMobile={isMobile} />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <DocumentsTab
                profile={profile}
                getDocumentUrl={getDocumentUrl}
                onDocumentClick={(data) => setDocumentModal(data)}
                isMobile={isMobile}
              />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentsTab
                profile={profile}
                paymentSummary={paymentSummary}
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