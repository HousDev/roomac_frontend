// //tenant/[id]/page.tsx
// "use client"

// import { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   getTenantById,
//   type Tenant,
//   viewDocument,
//   getTenantAssignment,
//   getTenantPayments,
//   getTenantPaymentFormData,
//   getPrimaryTenantByCoupleId,
// } from "@/lib/tenantApi";
// import {
//   ArrowLeft,
//   Mail,
//   Phone,
//   MapPin,
//   Calendar,
//   Home,
//   User,
//   Briefcase,
//   FileText,
//   CreditCard,
//   Shield,
//   Download,
//   Camera,
//   Award,
//   Heart,
//   Clock,
//   AlertCircle,
//   Loader2,
//   Eye,
//   Bed,
//   IndianRupee,
//   FileCheck,
//   FileWarning,
//   CalendarDays,
//   RotateCcw,
//   ChevronDown,
//   ChevronUp,
//   ReceiptIndianRupee,
//   TrendingUp,
//   Building,
//   CheckCircle,
//   Sparkles,
//   IdCard,
//   GraduationCap,
//   Wallet,
//   ExternalLink,
//   Copy,
//   Check,
//   Store,
//   Laptop,
//   Rocket,
//   Landmark,
//   Users,
//   BriefcaseBusiness,
//   Key,
//   Lock,
//   EyeOff,
//   Upload,
//   X,
//   AlertTriangle,
//   GraduationCap as GraduationIcon,
// } from "lucide-react";
// import { toast } from "sonner";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "@/components/ui/collapsible";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { getSettings, type SettingsData } from "@/lib/settingsApi";
// import * as paymentApi from "@/lib/paymentRecordApi";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { request } from "@/lib/api";

// // Add this interface for Partner Details
// interface PartnerDetails {
//   salutation: string;
//   full_name: string;
//   country_code: string;
//   phone: string;
//   email: string;
//   gender: string;
//   date_of_birth: string;
//   address: string;
//   occupation: string;
//   organization: string;
//   relationship: string;
//   id_proof_type: string;
//   id_proof_number: string;
//   id_proof_url: string | null;
//   address_proof_type: string;
//   address_proof_number: string;
//   address_proof_url: string | null;
//   photo_url: string | null;
// }

// export default function TenantDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   console.log('📄 Tenant detail page - ID from URL:', params.id);

//   const [tenant, setTenant] = useState<Tenant | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [payments, setPayments] = useState<any[]>([]);
//   const [paymentSummary, setPaymentSummary] = useState<any>(null);
//   const [assignment, setAssignment] = useState<any>(null);
//   const [loadingPayments, setLoadingPayments] = useState(false);
//   const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
//   const [receiptOpen, setReceiptOpen] = useState(false);
//   const [receiptId, setReceiptId] = useState<number | null>(null);
//   const [copiedEmail, setCopiedEmail] = useState(false);
//   const [copiedPhone, setCopiedPhone] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [partnerDetails, setPartnerDetails] = useState<PartnerDetails | null>(
//     null,
//   );
//   const [effectiveTenantIdForPayments, setEffectiveTenantIdForPayments] = useState<string | number | null>(null);

//   const tid = params.id as string;

//   useEffect(() => {
//     console.log('🔍 useEffect triggered for tenant ID:', tid);
//     if (tid) {
//       loadTenant();
//     }
//   }, [tid]);

// useEffect(() => {
//   if (activeTab === "payments" && tid && effectiveTenantIdForPayments) {
//     loadPayments();
//   }
// }, [activeTab, tid, effectiveTenantIdForPayments]);

// // const loadTenant = async () => {
// //   console.log(`🔍 Loading tenant details for ID: `);
// //   try {
// //     setLoading(true);
// //     const r: any = await getTenantById(tid);
    
// //     if (r?.success && r.data) {
// //       let tenantData = r.data;
      
// //       // WORKAROUND for partner swapping (keep existing code)
// //       const requestedId = parseInt(tid);
// //       const returnedId = tenantData.id;
      
// //       if (tenantData.is_couple_booking && requestedId !== returnedId) {
// //         tenantData = {
// //           ...tenantData,
// //           id: requestedId,
// //           salutation: tenantData.partner_salutation,
// //           full_name: tenantData.partner_full_name,
// //           email: tenantData.partner_email,
// //           phone: tenantData.partner_phone,
// //           country_code: tenantData.partner_country_code,
// //           gender: tenantData.partner_gender,
// //           date_of_birth: tenantData.partner_date_of_birth,
// //           address: tenantData.partner_address,
// //           occupation: tenantData.partner_occupation,
// //           organization: tenantData.partner_organization,
// //           partner_salutation: tenantData.salutation,
// //           partner_full_name: tenantData.full_name,
// //           partner_email: tenantData.email,
// //           partner_phone: tenantData.phone,
// //           partner_country_code: tenantData.country_code,
// //           partner_gender: tenantData.gender,
// //           partner_date_of_birth: tenantData.date_of_birth,
// //           partner_address: tenantData.address,
// //           partner_occupation: tenantData.occupation,
// //           partner_organization: tenantData.organization,
// //           partner_relationship: tenantData.partner_relationship || "Spouse",
// //           id_proof_url: tenantData.partner_id_proof_url,
// //           address_proof_url: tenantData.partner_address_proof_url,
// //           photo_url: tenantData.partner_photo_url,
// //           partner_id_proof_url: tenantData.id_proof_url,
// //           partner_address_proof_url: tenantData.address_proof_url,
// //           partner_photo_url: tenantData.photo_url,
// //           additional_documents: tenantData.partner_additional_documents || [],
// //           partner_additional_documents: tenantData.additional_documents || [],
// //         };
// //       }
      
// //       console.log("✅ Tenant data loaded:", tenantData);
      
// //       // ✅ FIX: Determine which tenant ID to use for assignment lookup
// //       let assignmentTenantId = tenantData.id;
// //       let isPartnerTenant = false;
      
// //       // If this is a partner tenant (not primary), use the primary tenant ID for assignment
// //       if (tenantData.is_couple_booking === 1 && tenantData.is_primary_tenant === 0) {
// //         isPartnerTenant = true;
// //         if (tenantData.partner_tenant_id) {
// //           assignmentTenantId = tenantData.partner_tenant_id;
// //           console.log(`📊 Partner tenant - using primary tenant ID for assignment: ${assignmentTenantId}`);
// //         } else if (tenantData.couple_id) {
// //           // Try to find primary by couple_id
// //           try {
// //             const response = await fetch(`/api/tenants/couple/${tenantData.couple_id}/primary`);
// //             const result = await response.json();
// //             if (result.success && result.data) {
// //               assignmentTenantId = result.data.id;
// //               console.log(`📊 Found primary tenant via couple_id: ${assignmentTenantId}`);
// //             }
// //           } catch (error) {
// //             console.error("Error finding primary tenant:", error);
// //           }
// //         }
// //       }
      
// //       // ✅ Check if tenant has vacate records using the effective tenant ID
// //       const vacateRecord = tenantData.vacate_records && tenantData.vacate_records.length > 0 
// //         ? tenantData.vacate_records[0] 
// //         : null;

// //         // If vacated, add rent_amount from vacate record to tenantData
// //       if (vacateRecord && vacateRecord.rent_amount) {
// //         tenantData.vacate_rent_amount = vacateRecord.rent_amount;
// //         console.log("✅ Using rent from vacate record:", vacateRecord.rent_amount);
// //       }
      
// //       let assignmentData = null;
      
// //       if (vacateRecord) {
// //         // For vacated tenants, fetch bed assignment using bed_assignment_id from vacate record
// //         try {
// //           const bedId = vacateRecord.bed_assignment_id;
// //           console.log(`🔍 Fetching vacated bed assignment with ID: ${bedId}`);
          
// //           // Fetch the bed assignment details
// //           const bedResponse = await fetch(`/api/rooms/bed-assignments/${bedId}`);
// //           const bedResult = await bedResponse.json();
          
// //           if (bedResult.success && bedResult.data) {
// //             const bedData = bedResult.data;
            
// //             // Fetch room details
// //             const roomResponse = await fetch(`/api/rooms/${bedData.room_id}`);
// //             const roomResult = await roomResponse.json();
            
// //             if (roomResult.success && roomResult.data) {
// //               const roomData = roomResult.data;
              
// //               // Fetch property details
// //               const propResponse = await fetch(`/api/properties/${roomData.property_id}`);
// //               const propResult = await propResponse.json();
              
// //               assignmentData = {
// //                 id: bedData.id,
// //                 bed_number: bedData.bed_number,
// //                 bed_type: bedData.bed_type,
// //                 tenant_rent: bedData.tenant_rent,
// //                 is_couple: bedData.is_couple === 1,
// //                 is_vacated: true,
// //                 vacated_date: vacateRecord.requested_vacate_date,
// //                 room: {
// //                   id: roomData.id,
// //                   room_number: roomData.room_number,
// //                   floor: roomData.floor,
// //                   sharing_type: roomData.sharing_type,
// //                   has_ac: roomData.has_ac === 1,
// //                   has_attached_bathroom: roomData.has_attached_bathroom === 1,
// //                   has_balcony: roomData.has_balcony === 1,
// //                 },
// //                 property: {
// //                   id: propResult.data.id,
// //                   name: propResult.data.name,
// //                   address: propResult.data.address,
// //                 }
// //               };
// //               console.log("✅ Vacated assignment loaded:", assignmentData);
// //             }
// //           }
// //         } catch (error) {
// //           console.error("Error fetching vacated bed assignment:", error);
// //         }
// //       } else {
// //         // For active tenants, use the regular assignment API with the effective tenant ID
// //         const assignmentResult = await getTenantAssignment(assignmentTenantId);
// //         if (assignmentResult.success && assignmentResult.data) {
// //           assignmentData = assignmentResult.data;
// //           console.log("✅ Active assignment loaded:", assignmentData);
          
// //           // ✅ If this is a partner tenant, also update the monthly_rent value in tenant data for display
// //           if (isPartnerTenant && assignmentData && assignmentData.tenant_rent) {
// //             tenantData.monthly_rent = assignmentData.tenant_rent;
// //           }
// //         } else {
// //           console.log("⚠️ No active assignment found for tenant:", assignmentTenantId);
// //         }
// //       }
      
// //       // ✅ For partner tenants, also fetch the primary tenant's rent to display in stats
// //       if (isPartnerTenant && !assignmentData) {
// //         // Try one more time with the primary tenant ID
// //         const primaryAssignmentResult = await getTenantAssignment(assignmentTenantId);
// //         if (primaryAssignmentResult.success && primaryAssignmentResult.data) {
// //           assignmentData = primaryAssignmentResult.data;
// //           tenantData.monthly_rent = primaryAssignmentResult.data.tenant_rent;
// //           console.log("✅ Partner tenant - using primary tenant's assignment for stats:", assignmentData);
// //         }
// //       }
      
      
// //       setAssignment(assignmentData);
// //       setTenant(tenantData);
      
// //       // Load partner details if they exist (keep existing code)
// //       if (tenantData.partner_full_name) {
// //         setPartnerDetails({
// //           salutation: tenantData.partner_salutation || "Mr.",
// //           full_name: tenantData.partner_full_name || "",
// //           country_code: tenantData.partner_country_code || "",
// //           phone: tenantData.partner_phone || "",
// //           email: tenantData.partner_email || "",
// //           gender: tenantData.partner_gender || "",
// //           date_of_birth: tenantData.partner_date_of_birth || "",
// //           address: tenantData.partner_address || "",
// //           occupation: tenantData.partner_occupation || "",
// //           organization: tenantData.partner_organization || "",
// //           relationship: tenantData.partner_relationship || "Spouse",
// //           id_proof_type: tenantData.partner_id_proof_type || "",
// //           id_proof_number: tenantData.partner_id_proof_number || "",
// //           id_proof_url: tenantData.partner_id_proof_url || null,
// //           address_proof_type: tenantData.partner_address_proof_type || "",
// //           address_proof_number: tenantData.partner_address_proof_number || "",
// //           address_proof_url: tenantData.partner_address_proof_url || null,
// //           photo_url: tenantData.partner_photo_url || null,
// //         });
// //       }
// //     } else {
// //       setError("Failed to load tenant details");
// //     }
// //   } catch (err) {
// //     console.error(err);
// //     setError("An error occurred while fetching tenant details");
// //   } finally {
// //     setLoading(false);
// //   }
// // };


// const loadTenant = async () => {
//   console.log(`🔍 Loading tenant details for ID: ${tid}`);
//   try {
//     setLoading(true);
//     const r: any = await getTenantById(tid);
    
//     if (r?.success && r.data) {
//       let tenantData = r.data;
      
//       const requestedId = parseInt(tid);
//       const returnedId = tenantData.id;
      
//       if (tenantData.is_couple_booking && requestedId !== returnedId) {
//         tenantData = {
//           ...tenantData,
//           id: requestedId,
//           salutation: tenantData.partner_salutation,
//           full_name: tenantData.partner_full_name,
//           email: tenantData.partner_email,
//           phone: tenantData.partner_phone,
//           country_code: tenantData.partner_country_code,
//           gender: tenantData.partner_gender,
//           date_of_birth: tenantData.partner_date_of_birth,
//           address: tenantData.partner_address,
//           occupation: tenantData.partner_occupation,
//           organization: tenantData.partner_organization,
//           partner_salutation: tenantData.salutation,
//           partner_full_name: tenantData.full_name,
//           partner_email: tenantData.email,
//           partner_phone: tenantData.phone,
//           partner_country_code: tenantData.country_code,
//           partner_gender: tenantData.gender,
//           partner_date_of_birth: tenantData.date_of_birth,
//           partner_address: tenantData.address,
//           partner_occupation: tenantData.occupation,
//           partner_organization: tenantData.organization,
//           partner_relationship: tenantData.partner_relationship || "Spouse",
//           id_proof_url: tenantData.partner_id_proof_url,
//           address_proof_url: tenantData.partner_address_proof_url,
//           photo_url: tenantData.partner_photo_url,
//           partner_id_proof_url: tenantData.id_proof_url,
//           partner_address_proof_url: tenantData.address_proof_url,
//           partner_photo_url: tenantData.photo_url,
//           additional_documents: tenantData.partner_additional_documents || [],
//           partner_additional_documents: tenantData.additional_documents || [],
//         };
//       }
      
//       console.log("✅ Tenant data loaded:", tenantData);
      
//       const vacateRecord = tenantData.vacate_records && tenantData.vacate_records.length > 0 
//         ? tenantData.vacate_records[0] 
//         : null;

//       console.log("📅 Check-in date from database:", tenantData.check_in_date);
      
//       if (vacateRecord && vacateRecord.rent_amount) {
//         tenantData.vacate_rent_amount = vacateRecord.rent_amount;
//       }
      
//       let assignmentData = null;
//       let effectiveTenantIdForAssignment = tenantData.id;
//       let foundAssignmentTenant = null;

//       if (tenantData.is_couple_booking === 1 || tenantData.is_couple_booking === true) {
//         try {
//           let assignmentResult = await getTenantAssignment(tenantData.id);
//           console.log(`Checking tenant ${tenantData.id} assignment:`, assignmentResult);
          
//           if (assignmentResult.success && assignmentResult.data) {
//             const assignmentRaw = Array.isArray(assignmentResult.data) && assignmentResult.data.length > 0 
//               ? assignmentResult.data[0] 
//               : assignmentResult.data;
            
//             if (assignmentRaw && assignmentRaw.id) {
//               effectiveTenantIdForAssignment = tenantData.id;
//               foundAssignmentTenant = tenantData.id;
//               console.log(`✅ Tenant ${tenantData.id} has direct assignment`);
//             }
//           }
          
//           if (!foundAssignmentTenant && tenantData.partner_tenant_id) {
//             assignmentResult = await getTenantAssignment(tenantData.partner_tenant_id);
//             console.log(`Checking partner ${tenantData.partner_tenant_id} assignment:`, assignmentResult);
            
//             if (assignmentResult.success && assignmentResult.data) {
//               const assignmentRaw = Array.isArray(assignmentResult.data) && assignmentResult.data.length > 0 
//                 ? assignmentResult.data[0] 
//                 : assignmentResult.data;
              
//               if (assignmentRaw && assignmentRaw.id) {
//                 effectiveTenantIdForAssignment = tenantData.partner_tenant_id;
//                 foundAssignmentTenant = tenantData.partner_tenant_id;
//                 console.log(`✅ Partner ${foundAssignmentTenant} has assignment, using for tenant ${tenantData.id}`);
//               }
//             }
//           }
          
//           if (!foundAssignmentTenant && tenantData.couple_id) {
//             try {
//               const primaryResult = await getPrimaryTenantByCoupleId(tenantData.couple_id);
//               if (primaryResult.success && primaryResult.data) {
//                 const primaryId = primaryResult.data.id;
//                 assignmentResult = await getTenantAssignment(primaryId);
                
//                 if (assignmentResult.success && assignmentResult.data) {
//                   const assignmentRaw = Array.isArray(assignmentResult.data) && assignmentResult.data.length > 0 
//                     ? assignmentResult.data[0] 
//                     : assignmentResult.data;
                  
//                   if (assignmentRaw && assignmentRaw.id) {
//                     effectiveTenantIdForAssignment = primaryId;
//                     foundAssignmentTenant = primaryId;
//                     console.log(`✅ Primary tenant via couple_id ${primaryId} has assignment`);
//                   }
//                 }
//               }
//             } catch (err) {
//               console.error("Error fetching primary tenant:", err);
//             }
//           }
//         } catch (err) {
//           console.error("Error checking assignments for couple:", err);
//         }
//       } else {
//         const assignmentResult = await getTenantAssignment(tenantData.id);
//         if (assignmentResult.success && assignmentResult.data) {
//           const assignmentRaw = Array.isArray(assignmentResult.data) && assignmentResult.data.length > 0 
//             ? assignmentResult.data[0] 
//             : assignmentResult.data;
          
//           if (assignmentRaw && assignmentRaw.id) {
//             effectiveTenantIdForAssignment = tenantData.id;
//             foundAssignmentTenant = tenantData.id;
//           }
//         }
//       }

//       // Payments always belong to the tenant's own ID, not the partner's.
// // Assignment lookup may resolve to the partner's ID for display purposes,
// // but payment records (including for vacated tenants) are stored per tenant.
// setEffectiveTenantIdForPayments(tenantData.id);
//       console.log("🟢 foundAssignmentTenant:", foundAssignmentTenant);
//       console.log("🟢 tenantData.is_couple_booking:", tenantData.is_couple_booking);
//       console.log("🟢 tenantData.partner_tenant_id:", tenantData.partner_tenant_id);

//       if (vacateRecord) {
//         try {
//           const bedId = vacateRecord.bed_assignment_id;
//           console.log(`🔍 Fetching vacated bed assignment with ID: ${bedId}`);
          
//           const bedResponse = await fetch(`/api/rooms/bed-assignments/${bedId}`);
//           const bedResult = await bedResponse.json();
          
//           if (bedResult.success && bedResult.data) {
//             const bedData = bedResult.data;
            
//             const roomResponse = await fetch(`/api/rooms/${bedData.room_id}`);
//             const roomResult = await roomResponse.json();
            
//             if (roomResult.success && roomResult.data) {
//               const roomData = roomResult.data;
              
//               const propResponse = await fetch(`/api/properties/${roomData.property_id}`);
//               const propResult = await propResponse.json();
              
//               assignmentData = {
//                 id: bedData.id,
//                 bed_number: bedData.bed_number,
//                 bed_type: bedData.bed_type,
//                 tenant_rent: bedData.tenant_rent,
//                 is_couple: bedData.is_couple === 1,
//                 is_vacated: true,
//                 vacated_date: vacateRecord.requested_vacate_date,
//                 room: {
//                   id: roomData.id,
//                   room_number: roomData.room_number,
//                   floor: roomData.floor,
//                   sharing_type: roomData.sharing_type,
//                   has_ac: roomData.has_ac === 1,
//                   has_attached_bathroom: roomData.has_attached_bathroom === 1,
//                   has_balcony: roomData.has_balcony === 1,
//                 },
//                 property: {
//                   id: propResult.data.id,
//                   name: propResult.data.name,
//                   address: propResult.data.address,
//                 }
//               };
//               console.log("✅ Vacated assignment loaded:", assignmentData);
//             }
//           }
//         } catch (error) {
//           console.error("Error fetching vacated bed assignment:", error);
//         }
//       } else {
//         const assignmentResult = await getTenantAssignment(effectiveTenantIdForAssignment);
//         console.log("🔍 Assignment API response:", assignmentResult);
        
//         if (assignmentResult.success && assignmentResult.data) {
//           let assignmentRaw = assignmentResult.data;
//           if (Array.isArray(assignmentRaw) && assignmentRaw.length > 0) {
//             assignmentRaw = assignmentRaw[0];
//           }
          
//           if (assignmentRaw && assignmentRaw.id) {
//             // Handle both flat response (from getTenantBedAssignment) 
//             // and nested response (from getTenantAssignment)
//             assignmentData = {
//               id: assignmentRaw.id,
//               bed_number: assignmentRaw.bed_number,
//               bed_type: assignmentRaw.bed_type,
//               tenant_rent: assignmentRaw.tenant_rent,
//               is_couple: assignmentRaw.is_couple === 1 || assignmentRaw.is_couple === true,
//               room: {
//                 id: assignmentRaw.room?.id || assignmentRaw.room_id,
//                 room_number: assignmentRaw.room?.room_number || assignmentRaw.room_number,
//                 floor: assignmentRaw.room?.floor || assignmentRaw.floor,
//                 sharing_type: assignmentRaw.room?.sharing_type || assignmentRaw.sharing_type,
//               },
//               property: {
//                 id: assignmentRaw.property?.id || assignmentRaw.property_id,
//                 name: assignmentRaw.property?.name || assignmentRaw.property_name,
//               }
//             };
//             console.log("✅ Active assignment loaded:", assignmentData);
            
//             if (tenantData.is_primary_tenant === 0 && assignmentData.tenant_rent) {
//               tenantData.monthly_rent = assignmentData.tenant_rent;
//             }
//           } else {
//             console.log("⚠️ No active assignment found for tenant:", effectiveTenantIdForAssignment);
//           }
//         } else {
//           console.log("⚠️ Assignment API returned no data for tenant:", effectiveTenantIdForAssignment);
//         }
//       }
      
//       setAssignment(assignmentData);
//       setTenant(tenantData);
      
//       if (tenantData.partner_full_name) {
//         setPartnerDetails({
//           salutation: tenantData.partner_salutation || "Mr.",
//           full_name: tenantData.partner_full_name || "",
//           country_code: tenantData.partner_country_code || "",
//           phone: tenantData.partner_phone || "",
//           email: tenantData.partner_email || "",
//           gender: tenantData.partner_gender || "",
//           date_of_birth: tenantData.partner_date_of_birth || "",
//           address: tenantData.partner_address || "",
//           occupation: tenantData.partner_occupation || "",
//           organization: tenantData.partner_organization || "",
//           relationship: tenantData.partner_relationship || "Spouse",
//           id_proof_type: tenantData.partner_id_proof_type || "",
//           id_proof_number: tenantData.partner_id_proof_number || "",
//           id_proof_url: tenantData.partner_id_proof_url || null,
//           address_proof_type: tenantData.partner_address_proof_type || "",
//           address_proof_number: tenantData.partner_address_proof_number || "",
//           address_proof_url: tenantData.partner_address_proof_url || null,
//           photo_url: tenantData.partner_photo_url || null,
//         });
//       }
//     } else {
//       setError("Failed to load tenant details");
//     }
//   } catch (err) {
//     console.error(err);
//     setError("An error occurred while fetching tenant details");
//   } finally {
//     setLoading(false);
//   }
// };

//   const loadAssignment = async (id:any) => {
//     try {
//       const r = await getTenantAssignment(tid);
//       r.success && r.data && setAssignment(r.data);
//     } catch {}
//   };

// const loadPayments = async () => {
//   setLoadingPayments(true);
//   try {
//     const paymentTenantId = effectiveTenantIdForPayments || tid;
    
//     console.log("📊 Loading payments for tenant ID:", tid);
//     console.log("📊 effectiveTenantIdForPayments:", effectiveTenantIdForPayments);
//     console.log("📊 Using paymentTenantId:", paymentTenantId);
    
//     if (!paymentTenantId) {
//       console.warn("⚠️ No tenant ID found for payments");
//       setLoadingPayments(false);
//       return;
//     }
    
//     const paymentFormResult = await paymentApi.getTenantPaymentFormData(paymentTenantId.toString());
    
//     if (paymentFormResult.success && paymentFormResult.data) {
//       console.log("📊 Payment form data received:", paymentFormResult.data);
//       setPaymentSummary(paymentFormResult.data);
      
//       // Use the same request utility as the rest of the app
//       const paymentsData: any = await request(`/api/payments/tenant/${paymentTenantId}`);
//       if (paymentsData.success) {
//         console.log("📊 Payment records:", paymentsData.data);
//         setPayments(paymentsData.data || []);
//       } else {
//         console.log("⚠️ No payment records found for tenant:", paymentTenantId);
//         setPayments([]);
//       }
//     } else {
//       console.log("⚠️ No payment form data found for tenant:", paymentTenantId);
//       setPaymentSummary(null);
//       setPayments([]);
//     }
//   } catch (error) {
//     console.error("Error loading payments:", error);
//     setPaymentSummary(null);
//     setPayments([]);
//   } finally {
//     setLoadingPayments(false);
//   }
// };

//   const viewDoc = (url: string) => {
//     if (!url) {
//       toast.error("Document not available");
//       return;
//     }
//     viewDocument(url);
//   };
//   const toggleMonth = (k: string) =>
//     setExpandedMonths((p) =>
//       p.includes(k) ? p.filter((m) => m !== k) : [...p, k],
//     );
// // Preview receipt in a modal (like admin payment page)
// const previewReceipt = async (id: number) => {
//   try {
//     toast.loading("Loading receipt...", { id: "receipt-preview" });
    
//     const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/receipts/${id}/preview-pdf`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/pdf',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to load receipt');
//     }

//     const blob = await response.blob();
//     const url = URL.createObjectURL(blob);
    
//     // Create modal with smaller width
//     const modal = document.createElement('div');
//     modal.style.cssText = `
//       position: fixed;
//       top: 0;
//       left: 0;
//       right: 0;
//       bottom: 0;
//       background: rgba(0,0,0,0.7);
//       z-index: 9999;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       flex-direction: column;
//     `;
    
//     const modalContent = document.createElement('div');
//     modalContent.style.cssText = `
//       width: 720px;
//       max-width: 90vw;
//       height: 90vh;
//       background: white;
//       border-radius: 12px;
//       position: relative;
//       display: flex;
//       flex-direction: column;
//       overflow: hidden;
//       box-shadow: 0 20px 40px rgba(0,0,0,0.2);
//     `;
    
//     const headerBar = document.createElement('div');
//     headerBar.style.cssText = `
//       padding: 12px 20px;
//       background: #1a3c6e;
//       color: white;
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       flex-shrink: 0;
//     `;
//     headerBar.innerHTML = `
//       <span style="font-weight: 600; font-size: 14px;">Payment Receipt</span>
//       <button id="closePreviewBtn" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">&times;</button>
//     `;
    
//     const pdfViewer = document.createElement('iframe');
//     pdfViewer.style.cssText = `
//       width: 100%;
//       flex: 1;
//       border: none;
//     `;
//     pdfViewer.src = url;
    
//     modalContent.appendChild(headerBar);
//     modalContent.appendChild(pdfViewer);
//     modal.appendChild(modalContent);
//     document.body.appendChild(modal);
    
//     // Add download button outside
//     const downloadBtn = document.createElement('button');
//     downloadBtn.innerHTML = 'Download PDF';
//     downloadBtn.style.cssText = `
//       margin-top: 16px;
//       padding: 8px 20px;
//       background: #1a3c6e;
//       color: white;
//       border: none;
//       border-radius: 6px;
//       cursor: pointer;
//       font-size: 12px;
//       font-weight: 500;
//     `;
//     downloadBtn.onclick = () => {
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `receipt-${id}.pdf`;
//       link.click();
//     };
//     modal.appendChild(downloadBtn);
    
//     const closeBtn = headerBar.querySelector('#closePreviewBtn');
//     closeBtn?.addEventListener('click', () => {
//       URL.revokeObjectURL(url);
//       modal.remove();
//       toast.dismiss("receipt-preview");
//     });
    
//     modal.onclick = (e) => {
//       if (e.target === modal) {
//         URL.revokeObjectURL(url);
//         modal.remove();
//         toast.dismiss("receipt-preview");
//       }
//     };
    
//     toast.dismiss("receipt-preview");
//     toast.success("Receipt loaded");
    
//   } catch (error) {
//     console.error("Error previewing receipt:", error);
//     toast.dismiss("receipt-preview");
//     toast.error("Failed to load receipt preview");
//   }
// };

// // Download receipt PDF
// const downloadReceipt = (id: number) => {
//   window.open(`/api/payments/receipts/${id}/download`, "_blank");
// };

// // For backward compatibility
// const openReceipt = (id: number) => {
//   previewReceipt(id);
// };

// const dlReceipt = (id: number) => {
//   downloadReceipt(id);
// };

//   const copyToClipboard = async (text: string, type: "email" | "phone") => {
//     await navigator.clipboard.writeText(text);
//     if (type === "email") {
//       setCopiedEmail(true);
//       setTimeout(() => setCopiedEmail(false), 2000);
//       toast.success("Email copied to clipboard");
//     } else {
//       setCopiedPhone(true);
//       setTimeout(() => setCopiedPhone(false), 2000);
//       toast.success("Phone number copied to clipboard");
//     }
//   };

//   if (loading) return <LoadingSkeleton />;

//   if (error || !tenant)
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
//         <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 max-w-md text-center shadow-xl">
//           <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
//             <AlertCircle className="w-6 h-6 text-white" />
//           </div>
//           <p className="font-lexend text-lg font-semibold text-slate-900 mb-2">
//             Tenant Not Found
//           </p>
//           <p className="text-sm text-slate-600 mb-6">
//             {error ||
//               "The tenant you're looking for doesn't exist or has been removed."}
//           </p>
//           <button
//             onClick={() => router.back()}
//             className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
//           >
//             <ArrowLeft className="w-4 h-4" /> Go Back
//           </button>
//         </div>
//       </div>
//     );


// const roomVal = (() => {
//   if (assignment) {
//     const roomNum = assignment.room?.room_number || assignment.room_number || "—";
//     const bedNum = assignment.bed_number || "—";
//     if (assignment.is_vacated) {
//       return `Room ${roomNum} · Bed ${bedNum}`;
//     }
//     return `Room ${roomNum} · Bed ${bedNum}`;
//   }
//   // Also check if tenant has direct assignment data
//   if (tenant?.bed_number) {
//     return `Room ${tenant.room_number || "—"} · Bed ${tenant.bed_number}`;
//   }
//   return "Not Assigned";
// })();

// // Update the rentVal calculation (around line 380 in your component)
// const rentVal = (() => {
//   // For vacated tenants, use rent from vacate record first
//   const vacateRecord = tenant?.vacate_records?.[0];
//   if (vacateRecord?.rent_amount) {
//     return `₹${Number(vacateRecord.rent_amount).toLocaleString()}`;
//   }
//   // For active tenants
//   if (assignment?.tenant_rent) {
//     return `₹${Number(assignment.tenant_rent).toLocaleString()}`;
//   }
//   if (tenant?.payments?.[0]?.amount) {
//     return `₹${tenant.payments[0].amount.toLocaleString()}`;
//   }
//   if (tenant?.monthly_rent) {
//     return `₹${Number(tenant.monthly_rent).toLocaleString()}`;
//   }
//   return "N/A";
// })();

//   // Helper function to get occupation icon
//   const getOccupationIcon = (category: string) => {
//     switch (category) {
//       case "Working Professional":
//         return <BriefcaseBusiness className="w-4 h-4" />;
//       case "Student":
//         return <GraduationIcon className="w-4 h-4" />;
//       case "Business Owner":
//         return <Store className="w-4 h-4" />;
//       case "Freelancer / Self-Employed":
//         return <Laptop className="w-4 h-4" />;
//       case "Government Employee":
//         return <Landmark className="w-4 h-4" />;
//       default:
//         return <Briefcase className="w-4 h-4" />;
//     }
//   };

//   return (
//     <div className=" bg-gradient-to-br from-slate-50 via-white to-slate-50 font-inter">
//       {/* Modern Header with Glassmorphism */}
//       <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
//         <div className="max-w-9xl mx-auto px-0 md:px-0 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => router.back()}
//               className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200 group"
//             >
//               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
//             </button>
//             <div className="flex items-center gap-3">
//               <div className="relative">
//                 <Avatar className="w-11 h-11 ring-2 ring-white shadow-lg">
//                   {tenant.photo_url ? (
//                     <AvatarImage
//                       src={tenant.photo_url}
//                       alt={tenant.full_name}
//                     />
//                   ) : (
//                     <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-lexend font-bold text-base">
//                       {tenant.full_name?.charAt(0)?.toUpperCase()}
//                     </AvatarFallback>
//                   )}
//                 </Avatar>
//                 <span
//                   className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${tenant.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}
//                 />
//               </div>
//               <div>
//                 <h1 className="font-lexend font-bold text-lg text-slate-900">
//                   {tenant.salutation ? `${tenant.salutation} ` : ""}
//                   {tenant.full_name}
//                 </h1>
//                 <div className="flex items-center gap-2">
//                   <span
//                     className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${tenant.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
//                   >
//                     {tenant.is_active ? "Active" : "Inactive"}
//                   </span>
//                   <span className="text-[10px] text-slate-400 font-mono">
//                     ID: {tenant.id}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs">
//             <Calendar className="w-3 h-3" />
//             Tenant Created {" "}
//             {tenant.created_at
//               ? new Date(tenant.created_at).toLocaleDateString("en-IN", {
//                   month: "short",
//                   year: "numeric",
//                 })
//               : "—"}
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <main className="max-w-9xl mx-auto px-0 md:px-0 py-6 space-y-6">
//         {/* Enhanced Stat Cards */}
//     {/* Enhanced Stat Cards - 5 columns when vacated, 4 columns normally */}
// <div className={`grid grid-cols-2 sm:grid-cols-4 ${(() => {
//   const vacateRecord = tenant.vacate_records && tenant.vacate_records.length > 0 
//     ? tenant.vacate_records[0] 
//     : null;
//   return vacateRecord ? 'lg:grid-cols-5' : '';
// })()} gap-1.5 sm:gap-2 sticky top-16 z-10`}>
// <StatCard
//   title="Member Since"
//   value={
//     tenant.check_in_date
//       ? new Date(tenant.check_in_date).toLocaleDateString("en-IN", {
//           day: "numeric",
//           month: "short",
//           year: "numeric",
//         })
//       : "N/A"
//   }
//   icon={CalendarDays}
//   color="bg-blue-600"
//   bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
// />
//   <StatCard
//   title="Monthly Rent"
//   value={(() => {
//     const vacateRecord = tenant.vacate_records?.[0];
//     if (vacateRecord?.rent_amount) {
//       return `₹${Number(vacateRecord.rent_amount).toLocaleString()}`;
//     }
//     return rentVal;
//   })()}
//   icon={IndianRupee}
//   color="bg-green-600"
//   bgColor="bg-gradient-to-br from-green-50 to-green-100"
// />
//   <StatCard
//     title="Room / Bed"
//     value={roomVal}
//     icon={Bed}
//     color="bg-purple-600"
//     bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
//   />
//   <StatCard
//     title="Property"
//     value={
//       assignment?.property?.name ||
// tenant.assigned_property_name ||
// tenant.property_details?.name ||   // ← add optional chaining
// "Not Assigned"
//     }
//     icon={Building}
//     color="bg-amber-600"
//     bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
//   />

//   {(() => {
//     const vacateRecord = tenant.vacate_records && tenant.vacate_records.length > 0 
//       ? tenant.vacate_records[0] 
//       : null;
    
//     if (vacateRecord) {
//       return (
//         <StatCard
//           title="Vacated On"
//           value={new Date(vacateRecord.requested_vacate_date).toLocaleDateString("en-IN", {
//             day: "numeric",
//             month: "short",
//             year: "numeric",
//           })}
//           icon={Calendar}
//           color="bg-red-600"
//           bgColor="bg-gradient-to-br from-red-50 to-red-100"
//         />
//       );
//     }
//     return null;
//   })()}
// </div>

//         {/* Main Card with Modern Tabs */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//           <Tabs value={activeTab} onValueChange={setActiveTab}>
//             {/* Enhanced Tab Navigation */}
//             <div className="border-b border-slate-200 px-4 md:px-6 overflow-x-auto scrollbar-hide">
//               <TabsList className="h-auto p-0 bg-transparent flex gap-6 min-w-max md:min-w-0 items-start justify-start">
//                 {[
//                   {
//                     v: "overview",
//                     icon: <User className="w-4 h-4" />,
//                     label: "Overview",
//                   },
//                   {
//                     v: "occupation",
//                     icon: <Briefcase className="w-4 h-4" />,
//                     label: "Occupation",
//                   },
//                   {
//                     v: "documents",
//                     icon: <FileText className="w-4 h-4" />,
//                     label: "Documents",
//                   },
//                   {
//                     v: "payments",
//                     icon: <CreditCard className="w-4 h-4" />,
//                     label: "Payments",
//                   },
//                   {
//                     v: "terms",
//                     icon: <FileCheck className="w-4 h-4" />,
//                     label: "Terms",
//                   },
//                   {
//                     v: "partner",
//                     icon: <Heart className="w-4 h-4" />,
//                     label: "Partner",
//                   },
//                 ].map((t) => (
//                   <TabsTrigger
//                     key={t.v}
//                     value={t.v}
//                     className="px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent hover:text-slate-700 transition gap-2 relative"
//                   >
//                     {t.icon}
//                     {t.label}
//                   </TabsTrigger>
//                 ))}
//               </TabsList>
//             </div>

//             {/* Tab Content with Enhanced Styling */}
//             <div className="p-2 md:p-2 max-h-[45vh] md:max-h-[55vh] overflow-y-auto">
//               {/* Overview Tab */}
//           <TabsContent value="overview" className="mt-0 space-y-3">
//   {/* Personal Info + Account Status Grid */}
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//     {/* Personal Information Card - 2 columns, label+value with small gap */}
//     <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
//       <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//         <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
//           <User className="w-3.5 h-3.5" />
//         </div>
//         <h3 className="font-lexend font-semibold text-slate-900 text-sm">Personal Information</h3>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Salutation  -</span>
//           <span className="text-xs font-medium text-slate-900">{tenant.salutation || "—"}</span>
//         </div>
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name  -</span>
//           <span className="text-xs font-medium text-slate-900">{tenant.full_name}</span>
//         </div>
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender  -</span>
//           <span className="text-xs font-medium text-slate-900">{tenant.gender || "—"}</span>
//         </div>
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Birth  -</span>
//           <span className="text-xs font-medium text-slate-900">
//             {tenant.date_of_birth
//               ? `${new Date(tenant.date_of_birth).toLocaleDateString("en-GB")} · ${calcAge(tenant.date_of_birth)} yrs`
//               : "—"}
//           </span>
//         </div>
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Aadhar  -</span>
//           <span className="text-xs font-medium text-slate-900">{tenant.aadhar_number || "—"}</span>
//         </div>
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PAN  -</span>
//           <span className="text-xs font-medium text-slate-900">{tenant.pan_number || "—"}</span>
//         </div>
//       </div>
//     </div>

//     {/* Account Status Card - ORIGINAL STYLE (no changes) */}
//     <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
//       <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//         <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
//           <Shield className="w-3.5 h-3.5" />
//         </div>
//         <h3 className="font-lexend font-semibold text-slate-900 text-sm">Account Status</h3>
//       </div>
//       <div className="space-y-0">
//         <div className="flex items-center justify-between py-1.5">
//           <span className="text-xs text-slate-600">Account Status</span>
//           <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${tenant.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
//             {tenant.is_active ? "Active" : "Inactive"}
//           </span>
//         </div>
//         <div className="flex items-center justify-between py-1.5 border-t border-slate-100">
//           <span className="text-xs text-slate-600">Portal Access</span>
//           <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${tenant.portal_access_enabled ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
//             {tenant.portal_access_enabled ? "Enabled" : "Disabled"}
//           </span>
//         </div>
//         <div className="flex items-center justify-between py-1.5 border-t border-slate-100">
//           <span className="text-xs text-slate-600">Login Credentials</span>
//           <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${tenant.has_credentials ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
//             {tenant.has_credentials ? "Configured" : "Not Configured"}
//           </span>
//         </div>
//         {tenant.credential_email && (
//           <div className="flex items-center justify-between py-1.5 border-t border-slate-100">
//             <span className="text-xs text-slate-600">Credential Email</span>
//             <span className="text-xs font-medium text-slate-900 truncate max-w-[180px]">{tenant.credential_email}</span>
//           </div>
//         )}
//       </div>
//     </div>
//   </div>

//   {/* Contact + Emergency Grid */}
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//     {/* Contact Information */}
//     <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
//       <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//         <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-sm">
//           <Phone className="w-3.5 h-3.5" />
//         </div>
//         <h3 className="font-lexend font-semibold text-slate-900 text-sm">Contact Information</h3>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email -</span>
//           <div className="flex items-center gap-1">
//             <a href={`mailto:${tenant.email}`} className="text-xs font-medium text-blue-600 hover:underline">
//               {tenant.email}
//             </a>
//             <button onClick={() => copyToClipboard(tenant.email, "email")} className="p-0.5 rounded hover:bg-slate-100">
//               {copiedEmail ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
//             </button>
//           </div>
//         </div>
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone  -</span>
//           <div className="flex items-center gap-1">
//             <a href={`tel:${tenant.country_code}${tenant.phone}`} className="text-xs font-medium text-slate-900 hover:underline">
//               {tenant.country_code} {tenant.phone}
//             </a>
//             <button onClick={() => copyToClipboard(`${tenant.country_code}${tenant.phone}`, "phone")} className="p-0.5 rounded hover:bg-slate-100">
//               {copiedPhone ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
//             </button>
//           </div>
//         </div>
//         <div className="sm:col-span-2 flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Address  -</span>
//           <span className="text-xs font-medium text-slate-900">
//             {tenant.address}, {tenant.city}, {tenant.state} – {tenant.pincode}
//           </span>
//         </div>
//       </div>
//     </div>

//     {/* Emergency Contact */}
//     <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
//       <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//         <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-sm">
//           <Heart className="w-3.5 h-3.5" />
//         </div>
//         <h3 className="font-lexend font-semibold text-slate-900 text-sm">Emergency Contact</h3>
//       </div>
//       {tenant.emergency_contact_name ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name  -</span>
//             <span className="text-xs font-medium text-slate-900">{tenant.emergency_contact_name}</span>
//           </div>
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone  -</span>
//             <span className="text-xs font-medium text-slate-900">{tenant.emergency_contact_phone || "—"}</span>
//           </div>
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Relation  -</span>
//             <span className="text-xs font-medium text-slate-900">{tenant.emergency_contact_relation || "—"}</span>
//           </div>
//           {tenant.emergency_contact_email && (
//             <div className="flex items-baseline gap-2">
//               <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email  -</span>
//               <span className="text-xs font-medium text-slate-900 break-all">{tenant.emergency_contact_email}</span>
//             </div>
//           )}
//         </div>
//       ) : (
//         <p className="text-xs text-slate-400 italic">No emergency contact provided</p>
//       )}
//     </div>
//   </div>

//   {/* Move-in + Vacate Grid */}
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//     {/* Move-in Information */}
//     <div className="bg-white rounded-xl border border-slate-200 p-4">
//       <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//         <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center shadow-sm">
//           <Calendar className="w-3.5 h-3.5" />
//         </div>
//         <h3 className="font-lexend font-semibold text-slate-900 text-sm">Move-in Information</h3>
//       </div>
//       <div className="flex items-baseline gap-2">
//         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-in Date</span>
//         <span className="text-xs font-medium text-slate-900">
//           {tenant.check_in_date
//             ? new Date(tenant.check_in_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
//             : "Not specified"}
//         </span>
//       </div>
//     </div>

//     {/* Vacate Information - ONLY for vacated tenants */}
//     {(() => {
//       const vacateRecord = tenant.vacate_records && tenant.vacate_records.length > 0
//         ? tenant.vacate_records[0]
//         : null;
//       if (!vacateRecord) return null;
//       return (
//         <div className="bg-red-50 rounded-xl border border-red-200 p-4">
//           <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-200">
//             <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-sm">
//               <Calendar className="w-3.5 h-3.5" />
//             </div>
//             <h3 className="font-lexend font-semibold text-red-800 text-sm">Vacate Information</h3>
//           </div>
//           <div className="space-y-2">
//             <div className="flex items-baseline gap-2">
//               <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Vacate Date</span>
//               <span className="text-xs font-medium text-red-900">
//                 {vacateRecord.requested_vacate_date
//                   ? new Date(vacateRecord.requested_vacate_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
//                   : "N/A"}
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Status</span>
//               <Badge className={`text-[9px] px-1.5 py-0 ${vacateRecord.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'} border`}>
//                 {vacateRecord.status === 'approved' ? 'Approved' : vacateRecord.status}
//               </Badge>
//             </div>
//             <div className="flex items-baseline gap-2">
//               <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Penalty</span>
//               <span className="text-xs font-semibold text-red-700">₹{Number(vacateRecord.total_penalty_amount || 0).toLocaleString()}</span>
//             </div>
//             <div className="flex items-baseline gap-2">
//               <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Vacate Reason</span>
//               <span className="text-xs font-medium text-red-900">{vacateRecord.vacate_reason_value || "Not specified"}</span>
//             </div>
//             <div className="flex items-baseline gap-2">
//               <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Refund</span>
//               <span className="text-xs font-semibold text-green-700">₹{Number(vacateRecord.refundable_amount || 0).toLocaleString()}</span>
//             </div>
//           </div>
//         </div>
//       );
//     })()}
//   </div>
// </TabsContent>

//               {/* Occupation Tab - Enhanced with all fields */}
//              <TabsContent value="occupation" className="mt-0 space-y-3">
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//     {/* Employment Details Card */}
//     <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
//       <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//         <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
//           {getOccupationIcon(tenant.occupation_category)}
//         </div>
//         <h3 className="font-lexend font-semibold text-slate-900 text-sm">Employment Details</h3>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
//         {/* Category */}
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category -</span>
//           <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
//             {tenant.occupation_category || "Other"}
//           </span>
//         </div>
//         {/* Exact Occupation */}
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exact Occupation -</span>
//           <span className="text-xs font-medium text-slate-900">{tenant.exact_occupation || "—"}</span>
//         </div>
//         {/* Occupation */}
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Occupation -</span>
//           <span className="text-xs font-medium text-slate-900">{tenant.occupation || "—"}</span>
//         </div>
//         {/* Organization */}
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organization / Company -</span>
//           <span className="text-xs font-medium text-slate-900">{tenant.organization || "—"}</span>
//         </div>
//         {/* Years of Experience */}
//         {tenant.years_of_experience && (
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Years of Experience -</span>
//             <span className="text-xs font-medium text-slate-900">{tenant.years_of_experience} years</span>
//           </div>
//         )}
//         {/* Monthly Income */}
//         {tenant.monthly_income && (
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Income -</span>
//             <span className="text-xs font-medium text-slate-900">₹{Number(tenant.monthly_income).toLocaleString()}</span>
//           </div>
//         )}
//         {/* Course Duration (students) */}
//         {tenant.course_duration && (
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Course Duration -</span>
//             <span className="text-xs font-medium text-slate-900">{tenant.course_duration.replace("_", " ")}</span>
//           </div>
//         )}
//         {/* Student ID */}
//         {tenant.student_id && (
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student ID -</span>
//             <span className="text-xs font-medium text-slate-900">{tenant.student_id}</span>
//           </div>
//         )}
//         {/* Employee ID */}
//         {tenant.employee_id && (
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee ID -</span>
//             <span className="text-xs font-medium text-slate-900">{tenant.employee_id}</span>
//           </div>
//         )}
//         {/* Portfolio URL */}
//         {tenant.portfolio_url && (
//           <div className="sm:col-span-2 flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Portfolio URL -</span>
//             <a
//               href={tenant.portfolio_url}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
//             >
//               View Portfolio <ExternalLink className="w-3 h-3" />
//             </a>
//           </div>
//         )}
//       </div>
//     </div>

//     {/* Work Preferences & Schedule Card */}
//     <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
//       <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//         <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
//           <Clock className="w-3.5 h-3.5" />
//         </div>
//         <h3 className="font-lexend font-semibold text-slate-900 text-sm">Work Preferences & Schedule</h3>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
//         {/* Work Mode */}
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Work Mode -</span>
//           <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
//             {tenant.work_mode
//               ? tenant.work_mode.charAt(0).toUpperCase() + tenant.work_mode.slice(1)
//               : "Not specified"}
//           </span>
//         </div>
//         {/* Shift Timing */}
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shift Timing -</span>
//           <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
//             {tenant.shift_timing
//               ? tenant.shift_timing.charAt(0).toUpperCase() + tenant.shift_timing.slice(1)
//               : "Not specified"}
//           </span>
//         </div>
//       </div>
//     </div>
//   </div>
// </TabsContent>

//               {/* Documents Tab - Enhanced Grid with ID/Address proof types */}
//               <TabsContent value="documents" className="mt-0">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   <div className="space-y-2">
//                     <DocCard
//                       title="ID Proof"
//                       icon={<IdCard className="w-4 h-4" />}
//                       url={tenant.id_proof_url}
//                       filename="ID Proof Document"
//                       onView={viewDoc}
//                       gradient="from-blue-500 to-blue-600"
//                       bg="bg-blue-50"
//                     />
//                     {tenant.id_proof_type && (
//                       <div className="text-center">
//                         <Badge variant="outline" className="text-[10px]">
//                           Type: {tenant.id_proof_type}
//                         </Badge>
//                         {tenant.id_proof_number && (
//                           <p className="text-[10px] text-slate-400 mt-1">
//                             #{tenant.id_proof_number}
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   <div className="space-y-2">
//                     <DocCard
//                       title="Address Proof"
//                       icon={<Home className="w-4 h-4" />}
//                       url={tenant.address_proof_url}
//                       filename="Address Proof Document"
//                       onView={viewDoc}
//                       gradient="from-purple-500 to-purple-600"
//                       bg="bg-purple-50"
//                     />
//                     {tenant.address_proof_type && (
//                       <div className="text-center">
//                         <Badge variant="outline" className="text-[10px]">
//                           Type: {tenant.address_proof_type}
//                         </Badge>
//                         {tenant.address_proof_number && (
//                           <p className="text-[10px] text-slate-400 mt-1">
//                             #{tenant.address_proof_number}
//                           </p>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   <DocCard
//                     title="Photograph"
//                     icon={<Camera className="w-4 h-4" />}
//                     url={tenant.photo_url}
//                     filename="Tenant Photo"
//                     onView={viewDoc}
//                     gradient="from-emerald-500 to-emerald-600"
//                     bg="bg-emerald-50"
//                     isImage
//                   />
//                 </div>

//                 {tenant.additional_documents &&
//                   tenant.additional_documents.length > 0 && (
//                     <div className="mt-6 bg-gradient-to-br from-white to-slate-50/50 rounded-xl border border-slate-200 p-5">
//                       <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
//                         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-sm">
//                           <FileText className="w-4 h-4" />
//                         </div>
//                         <h3 className="font-lexend font-semibold text-slate-900">
//                           Additional Documents (
//                           {tenant.additional_documents.length})
//                         </h3>
//                       </div>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                         {tenant.additional_documents.map(
//                           (doc: any, i: number) => (
//                             <DocCard
//                               key={i}
//                               title={doc.filename || `Document ${i + 1}`}
//                               icon={<FileText className="w-4 h-4" />}
//                               url={doc.url}
//                               filename={doc.filename}
//                               uploadedAt={doc.uploaded_at}
//                               onView={viewDoc}
//                               bg="bg-slate-100"
//                               gradient="from-slate-500 to-slate-600"
//                             />
//                           ),
//                         )}
//                       </div>
//                     </div>
//                   )}
//               </TabsContent>

// {/* Payments Tab - Complete */}
// <TabsContent value="payments" className="mt-0">
//   {loadingPayments ? (
//     <div className="flex justify-center py-12">
//       <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
//     </div>
//   ) : !paymentSummary && payments.length === 0 ? (
//     <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
//       <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
//         <CreditCard className="w-6 h-6 text-slate-300" />
//       </div>
//       <p className="text-sm text-slate-400">No payment records found</p>
//     </div>
//   ) : (
//    <div className="space-y-4">

//   {/* Penalty + Security Deposit side by side for vacated tenants */}
//   {paymentSummary?.is_vacated && (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

//       {/* LEFT — Penalty Breakdown */}
//       <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full">
//         <Collapsible
//           open={expandedMonths.includes('penalty-details')}
//           onOpenChange={() => toggleMonth('penalty-details')}
//           className="w-full"
//         >
//           <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-slate-50 transition-colors">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-sm">
//                 <FileWarning className="w-4 h-4" />
//               </div>
//               <div className="text-left">
//                 <h3 className="font-lexend font-semibold text-slate-900">Penalty Breakdown</h3>
//                 <p className="text-xs text-slate-500">Detailed penalty calculation for vacated tenant</p>
//               </div>
//             </div>
//             {expandedMonths.includes('penalty-details') ? (
//               <ChevronUp className="w-4 h-4 text-slate-400" />
//             ) : (
//               <ChevronDown className="w-4 h-4 text-slate-400" />
//             )}
//           </CollapsibleTrigger>

//           <CollapsibleContent className="px-4 pb-4">
//             <div className="space-y-3">
//               {paymentSummary.vacate_info?.lockin_penalty_amount > 0 && (
//                 <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-4 h-4 text-blue-600" />
//                       <span className="text-sm font-medium text-blue-800">Lock-in Penalty</span>
//                     </div>
//                     <Badge className="bg-blue-100 text-blue-700">
//                       ₹{Number(paymentSummary.vacate_info.lockin_penalty_amount).toLocaleString()}
//                     </Badge>
//                   </div>
//                   <p className="text-xs text-blue-600 mt-1 ml-6">
//                     {paymentSummary.vacate_info.lockin_penalty_description ||
//                       `Lock-in period: ${paymentSummary.vacate_info.lockin_period_months || 0} months`}
//                   </p>
//                 </div>
//               )}

//               {paymentSummary.vacate_info?.notice_penalty_amount > 0 && (
//                 <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <Clock className="w-4 h-4 text-amber-600" />
//                       <span className="text-sm font-medium text-amber-800">Notice Penalty</span>
//                     </div>
//                     <Badge className="bg-amber-100 text-amber-700">
//                       ₹{Number(paymentSummary.vacate_info.notice_penalty_amount).toLocaleString()}
//                     </Badge>
//                   </div>
//                   <p className="text-xs text-amber-600 mt-1 ml-6">
//                     {paymentSummary.vacate_info.notice_penalty_description ||
//                       `Notice period: ${paymentSummary.vacate_info.notice_period_days || 0} days`}
//                   </p>
//                 </div>
//               )}

//               {paymentSummary.vacate_info?.inspection_penalty_amount > 0 && (
//                 <div className="bg-red-50/50 rounded-lg p-3 border border-red-100">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4 text-red-600" />
//                       <span className="text-sm font-medium text-red-800">Inspection Penalty</span>
//                     </div>
//                     <Badge className="bg-red-100 text-red-700">
//                       ₹{Number(paymentSummary.vacate_info.inspection_penalty_amount).toLocaleString()}
//                     </Badge>
//                   </div>
//                   <p className="text-xs text-red-600 mt-1 ml-6">Move-out inspection damages</p>
//                 </div>
//               )}

//               {(paymentSummary.vacate_info?.total_penalty > 0 || paymentSummary.vacate_info?.total_penalty_amount > 0) && (
//                 <div className="bg-slate-100 rounded-lg p-3 border border-slate-200 mt-2">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm font-semibold text-slate-800">Total Penalty</span>
//                     <span className="text-base font-bold text-red-600">
//                       ₹{Number(paymentSummary.vacate_info.total_penalty || paymentSummary.vacate_info.total_penalty_amount).toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {(!paymentSummary.vacate_info?.lockin_penalty_amount &&
//                 !paymentSummary.vacate_info?.notice_penalty_amount &&
//                 !paymentSummary.vacate_info?.inspection_penalty_amount) && (
//                 <div className="text-center py-4">
//                   <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
//                   <p className="text-sm text-slate-500">No penalties applied</p>
//                 </div>
//               )}
//             </div>
//           </CollapsibleContent>
//         </Collapsible>
//       </div>

//       {/* RIGHT — Security Deposit */}
//       {paymentSummary?.vacate_info?.security_deposit > 0 && (
//         <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full">
//           <Collapsible
//             open={expandedMonths.includes('security-deposit')}
//             onOpenChange={() => toggleMonth('security-deposit')}
//             className="w-full"
//           >
//             <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-slate-50 transition-colors">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-sm">
//                   <Shield className="w-4 h-4" />
//                 </div>
//                 <div className="text-left">
//                   <h3 className="font-lexend font-semibold text-slate-900">Security Deposit</h3>
//                   <p className="text-xs text-slate-500">Deposit, penalty & refund breakdown</p>
//                 </div>
//               </div>
//               {expandedMonths.includes('security-deposit') ? (
//                 <ChevronUp className="w-4 h-4 text-slate-400" />
//               ) : (
//                 <ChevronDown className="w-4 h-4 text-slate-400" />
//               )}
//             </CollapsibleTrigger>
//             <CollapsibleContent className="px-4 pb-4">
//               <div className="space-y-3">
//                 <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-amber-800 font-medium">Security Deposit</span>
//                     <Badge className="bg-amber-100 text-amber-700">
//                       ₹{(paymentSummary.vacate_info.security_deposit || 0).toLocaleString()}
//                     </Badge>
//                   </div>
//                 </div>
//                 <div className="bg-red-50/50 rounded-lg p-3 border border-red-100">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-red-800 font-medium">Total Penalty</span>
//                     <Badge className="bg-red-100 text-red-700">
//                       ₹{(paymentSummary.vacate_info.total_penalty || 0).toLocaleString()}
//                     </Badge>
//                   </div>
//                 </div>
//                 <div className="bg-green-50/50 rounded-lg p-3 border border-green-100">
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-green-800 font-medium">Refund Amount</span>
//                     <Badge className="bg-green-100 text-green-700">
//                       ₹{(paymentSummary.vacate_info.refundable_amount || 0).toLocaleString()}
//                     </Badge>
//                   </div>
//                 </div>
//               </div>
//             </CollapsibleContent>
//           </Collapsible>
//         </div>
//       )}

//     </div>
//   )}

//   {/* Payment Summary Cards */}
// <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
//   {!paymentSummary?.is_vacated ? (
//     <>
//       <PaymentCard
//         label="Total Paid"
//         value={`₹${(paymentSummary?.total_paid || 0).toLocaleString()}`}
//         gradient="from-emerald-500 to-emerald-600"
//         icon={<IndianRupee className="w-3 h-3" />}
//         compact
//       />
//       <PaymentCard
//         label="Total Pending"
//         value={`₹${(paymentSummary?.total_pending || 0).toLocaleString()}`}
//         gradient="from-orange-500 to-orange-600"
//         icon={<IndianRupee className="w-3 h-3" />}
//         compact
//       />
//       <PaymentCard
//         label="Monthly Rent"
//         value={`₹${(paymentSummary?.monthly_rent || 0).toLocaleString()}`}
//         gradient="from-blue-500 to-blue-600"
//         icon={<IndianRupee className="w-3 h-3" />}
//         compact
//       />
//       <PaymentCard
//         label="Months Joined"
//         value={String(paymentSummary?.total_months_since_joining || "0")}
//         gradient="from-purple-500 to-purple-600"
//         icon={<CalendarDays className="w-3 h-3" />}
//         compact
//       />
//     </>
//   ) : (
//     <>
//       <PaymentCard
//         label="Total Rent Paid"
//         value={`₹${(paymentSummary?.total_rent_paid || 0).toLocaleString()}`}
//         gradient="from-emerald-500 to-emerald-600"
//         icon={<IndianRupee className="w-3 h-3" />}
//         compact
//       />
//       <PaymentCard
//         label="Rent Payment Count"
//         value={String(paymentSummary?.rent_payment_count || "0")}
//         gradient="from-blue-500 to-blue-600"
//         icon={<CreditCard className="w-3 h-3" />}
//         compact
//       />
//       <PaymentCard
//         label="Security Deposit"
//         value={`₹${(paymentSummary?.vacate_info?.security_deposit || 0).toLocaleString()}`}
//         gradient="from-amber-500 to-amber-600"
//         icon={<IndianRupee className="w-3 h-3" />}
//         compact
//       />
//       <PaymentCard
//         label="Deposit Paid"
//         value={`₹${(paymentSummary?.security_deposit_info?.paid || 0).toLocaleString()}`}
//         gradient="from-green-500 to-green-600"
//         icon={<IndianRupee className="w-3 h-3" />}
//         compact
//       />
//     </>
//   )}
// </div>

//   {/* Payment History */}
//   <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
//     <div className="flex items-center gap-3 p-4 pb-0 border-b border-slate-200">
//       <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
//         <CreditCard className="w-4 h-4" />
//       </div>
//       <div>
//         <h3 className="font-lexend font-semibold text-slate-900">Payment Transactions</h3>
//         <p className="text-xs text-slate-500 mt-0.5">Complete payment history of this tenant</p>
//       </div>
//     </div>

//     <div className="flex gap-3 px-4 pt-3">
//       <div className="flex items-center gap-1">
//         <div className="w-2 h-2 rounded-full bg-green-500"></div>
//         <span className="text-xs text-slate-600">Approved</span>
//       </div>
//       <div className="flex items-center gap-1">
//         <div className="w-2 h-2 rounded-full bg-red-500"></div>
//         <span className="text-xs text-slate-600">Rejected</span>
//       </div>
//       {!paymentSummary?.is_vacated && (
//         <div className="flex items-center gap-1">
//           <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
//           <span className="text-xs text-slate-600">Pending</span>
//         </div>
//       )}
//     </div>

//     <div className="overflow-x-auto">
//       <table className="w-full min-w-[800px] text-sm">
//         <thead className="bg-slate-50 border-b border-slate-200">
//           <tr>
//             <th className="text-left py-3 px-3 font-semibold text-slate-600 text-xs">Date</th>
//             <th className="text-left py-3 px-3 font-semibold text-slate-600 text-xs">Amount</th>
//             <th className="text-left py-3 px-3 font-semibold text-slate-600 text-xs">Type</th>
//             <th className="text-left py-3 px-3 font-semibold text-slate-600 text-xs">Mode</th>
//             <th className="text-left py-3 px-3 font-semibold text-slate-600 text-xs">Period</th>
//             <th className="text-left py-3 px-3 font-semibold text-slate-600 text-xs">Status</th>
//             <th className="text-right py-3 px-3 font-semibold text-slate-600 text-xs">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {(() => {
//             let allPayments: any[] = [...payments];

//             if (paymentSummary?.is_vacated) {
//               if (paymentSummary.payments && Array.isArray(paymentSummary.payments)) {
//                 allPayments = [...allPayments, ...paymentSummary.payments];
//               }
//               if (paymentSummary.rent_payments && Array.isArray(paymentSummary.rent_payments)) {
//                 allPayments = [...allPayments, ...paymentSummary.rent_payments];
//               }
//               if (paymentSummary.security_deposit_payments && Array.isArray(paymentSummary.security_deposit_payments)) {
//                 allPayments = [...allPayments, ...paymentSummary.security_deposit_payments];
//               }
//             }

//             const uniqueMap = new Map();
//             for (const p of allPayments) {
//               if (p && p.id && !uniqueMap.has(p.id)) {
//                 uniqueMap.set(p.id, p);
//               }
//             }
//             const uniquePayments = Array.from(uniqueMap.values());
//             console.log("All payments combined", payments);
//             console.log("Unique payments after deduplication", uniquePayments);

//             let paymentsToShow = uniquePayments;
//             console.log("payment to show", paymentsToShow, paymentSummary);
//             if (paymentSummary?.is_vacated) {
//               paymentsToShow = uniquePayments.filter((p: any) => p.status !== "pending");
//             }

//             paymentsToShow.sort((a: any, b: any) => {
//               const dateA = a.payment_date ? new Date(a.payment_date) : new Date(0);
//               const dateB = b.payment_date ? new Date(b.payment_date) : new Date(0);
//               return dateB.getTime() - dateA.getTime();
//             });

//             if (paymentsToShow.length === 0) {
//               return (
//                 <tr>
//                   <td colSpan={7} className="text-center py-8 text-slate-400 text-sm">
//                     No payment transactions found
//                   </td>
//                 </tr>
//               );
//             }

//             return paymentsToShow.map((p: any) => {
//               let statusClass = "bg-gray-100 text-gray-700";
//               let amountClass = "text-emerald-600";

//               if (p.status === "approved") {
//                 statusClass = "bg-green-100 text-green-700";
//                 amountClass = "text-emerald-600";
//               } else if (p.status === "rejected") {
//                 statusClass = "bg-red-100 text-red-700";
//                 amountClass = "text-red-400 line-through";
//               } else if (p.status === "pending") {
//                 statusClass = "bg-yellow-100 text-yellow-700";
//                 amountClass = "text-amber-600";
//               } else if (p.status === "paid") {
//                 statusClass = "bg-green-100 text-green-700";
//                 amountClass = "text-emerald-600";
//               } else if (p.status === "failed") {
//                 statusClass = "bg-red-100 text-red-700";
//                 amountClass = "text-red-400 line-through";
//               } else if (p.status === "refund") {
//                 statusClass = "bg-green-300 text-green-700";
//                 amountClass = "text-emerald-600";
//               }

//               let paymentTypeDisplay = "—";
//               let paymentTypeClass = "bg-gray-100 text-gray-700";

//               if (p.payment_type === "rent") {
//                 paymentTypeDisplay = "Rent";
//                 paymentTypeClass = "bg-blue-100 text-blue-700";
//               } else if (p.payment_type === "security_deposit") {
//                 paymentTypeDisplay = "Security Deposit";
//                 paymentTypeClass = "bg-purple-100 text-purple-700";
//               } else if (p.payment_type === "maintenance") {
//                 paymentTypeDisplay = "Maintenance";
//                 paymentTypeClass = "bg-orange-100 text-orange-700";
//               } else if (p.payment_type === "deposit_refund") {
//                 paymentTypeDisplay = "Deposit Refund";
//                 paymentTypeClass = "bg-green-100 text-green-700";
//               } else if (p.payment_type === "penalty_payment") {
//                 paymentTypeDisplay = "Penalty Payment";
//                 paymentTypeClass = "bg-red-100 text-red-700";
//               }

//               return (
//                 <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
//                   <td className="py-3 px-3 text-slate-600 whitespace-nowrap text-xs">
//                     {p.payment_date
//                       ? new Date(p.payment_date).toLocaleDateString("en-IN", {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric",
//                         })
//                       : "—"}
//                   </td>
//                   <td className={`py-3 px-3 font-semibold whitespace-nowrap text-xs ${amountClass}`}>
//                     ₹{(p.amount || 0).toLocaleString()}
//                   </td>
//                   <td className="py-3 px-3">
//                     <Badge className={`text-[9px] px-1.5 py-0 ${paymentTypeClass}`}>
//                       {paymentTypeDisplay}
//                     </Badge>
//                   </td>
//                   <td className="py-3 px-3 text-slate-600 capitalize whitespace-nowrap text-xs">
//                     {p.payment_mode || "—"}
//                     {p.bank_name && (
//                       <span className="text-[10px] text-slate-400 block">{p.bank_name}</span>
//                     )}
//                   </td>
//                   <td className="py-3 px-3 text-slate-600 whitespace-nowrap text-xs">
//                     {p.month} {p.year}
//                   </td>
//                   <td className="py-3 px-3">
//                     <Badge className={`text-[9px] px-1.5 py-0 ${statusClass}`}>
//                       {p.status === "approved" ? "Approved" : p.status === "paid" ? "Paid" : p.status}
//                     </Badge>
//                   </td>
//                   <td className="py-3 px-3 text-right">
//                     {p.status === "approved" && (
//                       <div className="flex items-center justify-end gap-1">
//                         <button
//                           onClick={() => previewReceipt(p.id)}
//                           className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all duration-200"
//                           title="Preview Receipt"
//                         >
//                           <Eye className="w-3.5 h-3.5" />
//                         </button>
//                         <button
//                           onClick={() => downloadReceipt(p.id)}
//                           className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all duration-200"
//                           title="Download Receipt"
//                         >
//                           <Download className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     )}
//                   </td>
//                 </tr>
//               );
//             });
//           })()}
//         </tbody>
//       </table>
//     </div>
//   </div>

//   {/* Summary Cards for Payment Stats */}
//   <div className="grid grid-cols-2 gap-3">
//     {!paymentSummary?.is_vacated ? (
//       <>
//         <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
//           <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Paid</p>
//           <p className="text-lg font-bold text-green-600">
//             ₹{(paymentSummary?.total_paid || 0).toLocaleString()}
//           </p>
//         </div>
//         <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
//           <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Pending</p>
//           <p className="text-lg font-bold text-red-600">
//             ₹{(paymentSummary?.total_pending || 0).toLocaleString()}
//           </p>
//         </div>
//       </>
//     ) : (
//       <>
//         <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
//           <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Rent Paid</p>
//           <p className="text-lg font-bold text-green-600">
//             ₹{(paymentSummary?.total_rent_paid || 0).toLocaleString()}
//           </p>
//         </div>
//         <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
//           <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Rejected</p>
//           <p className="text-lg font-bold text-red-600">
//             ₹{(paymentSummary?.total_rejected || 0).toLocaleString()}
//           </p>
//         </div>
//       </>
//     )}
//   </div>

// </div>
//   )}
// </TabsContent>

//               {/* Terms Tab - NEW */}
//         <TabsContent value="terms" className="mt-0 space-y-3">
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//     {/* Lock-in Period Card */}
//     <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
//       <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//         <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
//           <Calendar className="w-3.5 h-3.5" />
//         </div>
//         <h3 className="font-lexend font-semibold text-slate-900 text-sm">Lock-in Period</h3>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration -</span>
//           <span className="text-xs font-medium text-slate-900">
//             {tenant.lockin_period_months ? `${tenant.lockin_period_months} months` : "Not specified"}
//           </span>
//         </div>
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Penalty -</span>
//           <span className="text-xs font-medium text-slate-900">
//             {tenant.lockin_penalty_amount
//               ? tenant.lockin_penalty_type === "percentage"
//                 ? `${tenant.lockin_penalty_amount}% of rent`
//                 : `₹${tenant.lockin_penalty_amount.toLocaleString()}`
//               : "No penalty specified"}
//           </span>
//         </div>
//       </div>
//     </div>

//     {/* Notice Period Card */}
//     <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
//       <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//         <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-sm">
//           <Clock className="w-3.5 h-3.5" />
//         </div>
//         <h3 className="font-lexend font-semibold text-slate-900 text-sm">Notice Period</h3>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration -</span>
//           <span className="text-xs font-medium text-slate-900">
//             {tenant.notice_period_days ? `${tenant.notice_period_days} days` : "Not specified"}
//           </span>
//         </div>
//         <div className="flex items-baseline gap-2">
//           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Penalty -</span>
//           <span className="text-xs font-medium text-slate-900">
//             {tenant.notice_penalty_amount
//               ? tenant.notice_penalty_type === "percentage"
//                 ? `${tenant.notice_penalty_amount}% of rent`
//                 : `₹${tenant.notice_penalty_amount.toLocaleString()}`
//               : "No penalty specified"}
//           </span>
//         </div>
//       </div>
//     </div>
//   </div>

//   {/* Terms Summary - full width, compact */}
//   <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
//     <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//       <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
//         <FileCheck className="w-3.5 h-3.5" />
//       </div>
//       <h3 className="font-lexend font-semibold text-slate-900 text-sm">Terms Summary</h3>
//     </div>
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
//       <div className="flex items-baseline gap-2">
//         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lock-in Period -</span>
//         <span className="text-xs font-medium text-slate-900">{tenant.lockin_period_months || 0} months</span>
//       </div>
//       <div className="flex items-baseline gap-2">
//         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lock-in Penalty -</span>
//         <span className="text-xs font-medium text-slate-900">
//           {tenant.lockin_penalty_type === "percentage" ? "%" : "₹"}{tenant.lockin_penalty_amount || 0} ({tenant.lockin_penalty_type || "fixed"})
//         </span>
//       </div>
//       <div className="flex items-baseline gap-2">
//         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notice Period -</span>
//         <span className="text-xs font-medium text-slate-900">{tenant.notice_period_days || 0} days</span>
//       </div>
//       <div className="flex items-baseline gap-2">
//         <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notice Penalty -</span>
//         <span className="text-xs font-medium text-slate-900">
//           {tenant.notice_penalty_type === "percentage" ? "%" : "₹"}{tenant.notice_penalty_amount || 0} ({tenant.notice_penalty_type || "fixed"})
//         </span>
//       </div>
//     </div>
//   </div>
// </TabsContent>

//               {/* Partner Tab - NEW */}
//              <TabsContent value="partner" className="mt-0 space-y-3">
//   {partnerDetails && partnerDetails.full_name ? (
//     <>
//       {/* Partner Basic Info Card */}
//       <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
//         <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//           <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-sm">
//             <Heart className="w-3.5 h-3.5" />
//           </div>
//           <h3 className="font-lexend font-semibold text-slate-900 text-sm">Partner Information</h3>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Salutation -</span>
//             <span className="text-xs font-medium text-slate-900">{partnerDetails.salutation || "—"}</span>
//           </div>
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name -</span>
//             <span className="text-xs font-medium text-slate-900">{partnerDetails.full_name}</span>
//           </div>
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone -</span>
//             <span className="text-xs font-medium text-slate-900">{partnerDetails.country_code} {partnerDetails.phone}</span>
//           </div>
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email -</span>
//             <span className="text-xs font-medium text-slate-900">{partnerDetails.email || "—"}</span>
//           </div>
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender -</span>
//             <span className="text-xs font-medium text-slate-900">{partnerDetails.gender || "—"}</span>
//           </div>
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Birth -</span>
//             <span className="text-xs font-medium text-slate-900">
//               {partnerDetails.date_of_birth
//                 ? new Date(partnerDetails.date_of_birth).toLocaleDateString("en-IN")
//                 : "—"}
//             </span>
//           </div>
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Relationship -</span>
//             <span className="text-xs font-medium text-slate-900">{partnerDetails.relationship || "—"}</span>
//           </div>
//           <div className="flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Occupation -</span>
//             <span className="text-xs font-medium text-slate-900">{partnerDetails.occupation || "—"}</span>
//           </div>
//           <div className="sm:col-span-2 flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organization -</span>
//             <span className="text-xs font-medium text-slate-900">{partnerDetails.organization || "—"}</span>
//           </div>
//           <div className="sm:col-span-2 flex items-baseline gap-2">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Address -</span>
//             <span className="text-xs font-medium text-slate-900">{partnerDetails.address || "—"}</span>
//           </div>
//         </div>
//       </div>

//       {/* Partner Documents Card - only if any document exists */}
//       {(partnerDetails.id_proof_url ||
//         partnerDetails.address_proof_url ||
//         partnerDetails.photo_url) && (
//         <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
//           <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
//             <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
//               <FileText className="w-3.5 h-3.5" />
//             </div>
//             <h3 className="font-lexend font-semibold text-slate-900 text-sm">Partner Documents</h3>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//             {partnerDetails.id_proof_url && (
//               <DocCard
//                 title="Partner ID Proof"
//                 icon={<IdCard className="w-4 h-4" />}
//                 url={partnerDetails.id_proof_url}
//                 filename="ID Proof"
//                 onView={viewDoc}
//                 gradient="from-blue-500 to-blue-600"
//                 bg="bg-blue-50"
//               />
//             )}
//             {partnerDetails.address_proof_url && (
//               <DocCard
//                 title="Partner Address Proof"
//                 icon={<Home className="w-4 h-4" />}
//                 url={partnerDetails.address_proof_url}
//                 filename="Address Proof"
//                 onView={viewDoc}
//                 gradient="from-purple-500 to-purple-600"
//                 bg="bg-purple-50"
//               />
//             )}
//             {partnerDetails.photo_url && (
//               <DocCard
//                 title="Partner Photo"
//                 icon={<Camera className="w-4 h-4" />}
//                 url={partnerDetails.photo_url}
//                 filename="Photo"
//                 onView={viewDoc}
//                 gradient="from-emerald-500 to-emerald-600"
//                 bg="bg-emerald-50"
//                 isImage
//               />
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   ) : (
//     <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
//       <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
//       <p className="text-xs text-slate-400">No partner details available for this tenant</p>
//     </div>
//   )}
// </TabsContent>
//             </div>
//           </Tabs>
//         </div>
//       </main>

//       <ReceiptDialog
//         open={receiptOpen}
//         onOpenChange={setReceiptOpen}
//         receiptId={receiptId}
//         onDownload={dlReceipt}
//       />
//     </div>
//   );
// }

// /* Enhanced Document Card Component */
// function DocCard({
//   title,
//   icon,
//   url,
//   filename,
//   isImage,
//   uploadedAt,
//   onView,
//   gradient,
//   bg,
// }: any) {
//   if (!url)
//     return (
//       <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center gap-3 cursor-default opacity-60 bg-slate-50/50">
//         <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200 flex-shrink-0">
//           <FileWarning className="w-4 h-4" />
//         </div>
//         <div className="min-w-0 flex-1">
//           <p className="text-sm font-medium text-slate-900 truncate">{title}</p>
//           <p className="text-xs text-slate-400">Not uploaded</p>
//         </div>
//       </div>
//     );

//   return (
//     <div
//       className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all duration-300"
//       onClick={() => onView(url)}
//     >
//       <div
//         className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${gradient} group-hover:h-1 transition-all duration-300`}
//       />
//       <div
//         className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200`}
//       >
//         {isImage ? (
//           <img
//             src={url.startsWith("http") ? url : `http://localhost:3001${url}`}
//             alt={title}
//             className="w-full h-full object-cover"
//             onError={(e) => {
//               (e.target as HTMLImageElement).src =
//                 "https://via.placeholder.com/40?text=!";
//             }}
//           />
//         ) : (
//           icon
//         )}
//       </div>
//       <div className="min-w-0 flex-1">
//         <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
//           {title}
//         </p>
//         <p className="text-xs text-slate-400 truncate">{filename}</p>
//         {uploadedAt && (
//           <p className="text-[10px] text-slate-300 mt-0.5">
//             Uploaded {new Date(uploadedAt).toLocaleDateString()}
//           </p>
//         )}
//       </div>
//       <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110">
//         <Eye className="w-3.5 h-3.5" />
//       </div>
//     </div>
//   );
// }

// function PaymentCard({ label, value, gradient, icon }: any) {
//   return (
//     <div className="group relative overflow-hidden bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
//       <div
//         className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${gradient} group-hover:h-1 transition-all duration-300`}
//       />
//       <div className="flex items-start justify-between">
//         <div>
//           <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
//             {label}
//           </p>
//           <p className="font-lexend font-bold text-lg text-slate-900">
//             {value}
//           </p>
//         </div>
//         <div
//           className={`w-8 h-8 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10 flex items-center justify-center text-white`}
//         >
//           {icon}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* Enhanced Receipt Dialog - Same as admin payment page */
// const ReceiptDialog = ({ open, onOpenChange, receiptId, onDownload }: any) => {
//   const [receipt, setReceipt] = useState<any>(null);
//   const [settings, setSettings] = useState<SettingsData>({});
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     (async () => {
//       try {
//         setSettings(await getSettings());
//       } catch {}
//     })();
//   }, []);
  
//   useEffect(() => {
//     if (open && receiptId) fetchR();
//   }, [open, receiptId]);

//   const fetchR = async () => {
//     if (!receiptId) return;
//     setLoading(true);
//     try {
//       const r = await paymentApi.getReceiptById(receiptId);
//       r.success ? setReceipt(r.data) : toast.error("Failed to load receipt");
//     } catch {
//       toast.error("Failed to load receipt");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logo = settings["logo_header"]?.value || "/default-logo.png";
//   const fullLogo = logo.startsWith("http")
//     ? logo
//     : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${logo}`;
//   const siteName = settings["site_name"]?.value || "ROOMAC";
//   const tagline = settings["site_tagline"]?.value || "Premium Living Spaces";

//   // Open PDF in new tab for better preview
//   const openPdfPreview = () => {
//     if (receiptId) {
//       window.open(`/api/payments/receipts/${receiptId}/preview-pdf`, '_blank');
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="p-0 bg-white border border-slate-200 rounded-2xl max-w-[95vw] md:max-w-[720px] max-h-[90vh] overflow-y-auto">
//         <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
//               <ReceiptIndianRupee className="w-4 h-4" />
//             </div>
//             <div>
//               <p className="font-lexend font-semibold text-slate-900">
//                 Payment Receipt
//               </p>
//               <p className="text-xs text-slate-400">
//                 {receipt
//                   ? `Receipt #${receipt.id} · ${receipt.month} ${receipt.year}`
//                   : "Loading…"}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={() => onOpenChange(false)}
//             className="p-1 rounded-md hover:bg-gray-100 transition"
//           >
//             <X className="h-4 w-4 text-gray-500" />
//           </button>
//         </div>

//         <div className="p-5">
//           {loading ? (
//             <div className="flex justify-center py-12">
//               <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//             </div>
//           ) : receipt ? (
//             <>
//               <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-4">
//                 {/* Header */}
//                 <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] p-6 text-center relative">
//                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.2),transparent_70%)]" />
//                   <div className="relative z-10">
//                     <img
//                       src={fullLogo}
//                       alt={siteName}
//                       className="h-10 mx-auto mb-2 object-contain"
//                       onError={(e) => {
//                         (e.target as HTMLImageElement).style.display = "none";
//                       }}
//                     />
//                     <p className="font-lexend font-bold text-xl text-white">
//                       {siteName}
//                     </p>
//                     <p className="text-xs text-white/60 mt-1">{tagline}</p>
//                     <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs text-white font-medium">
//                       Payment Receipt
//                     </span>
//                   </div>
//                 </div>

//                 <div className="p-5 bg-white">
//                   {/* Meta */}
//                   <div className="grid grid-cols-2 gap-3 mb-4">
//                     <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
//                       <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
//                         Receipt No.
//                       </p>
//                       <p className="font-lexend font-bold text-slate-900">
//                         #{receipt.id}
//                       </p>
//                     </div>
//                     <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
//                       <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
//                         Payment Date
//                       </p>
//                       <p className="font-lexend font-bold text-slate-900">
//                         {new Date(receipt.payment_date).toLocaleDateString(
//                           "en-IN",
//                         )}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Tenant */}
//                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
//                     <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
//                       Tenant Details
//                     </p>
//                     <p className="font-semibold text-slate-900">
//                       {receipt.tenant_name}
//                     </p>
//                     {receipt.tenant_phone && (
//                       <p className="text-xs text-slate-600 mt-1">
//                         {receipt.tenant_phone}
//                       </p>
//                     )}
//                     {receipt.tenant_email && (
//                       <p className="text-xs text-slate-600">
//                         {receipt.tenant_email}
//                       </p>
//                     )}
//                   </div>

//                   {/* Property */}
//                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
//                     <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
//                       Property Details
//                     </p>
//                     <p className="font-semibold text-slate-900">
//                       {receipt.property_name || "N/A"}
//                     </p>
//                     <p className="text-xs text-slate-600 mt-1">
//                       Room: {receipt.room_number || "N/A"}
//                       {receipt.bed_number && ` · Bed #${receipt.bed_number}`}
//                     </p>
//                   </div>

//                   {/* Amount */}
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
//                     <p className="text-[10px] font-bold uppercase text-blue-600 mb-3">
//                       Payment Details
//                     </p>
//                     <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-200">
//                       <span className="text-sm text-blue-700">Amount Paid</span>
//                       <span className="font-lexend font-bold text-2xl text-blue-700">
//                         ₹{receipt.amount?.toLocaleString() || "0"}
//                       </span>
//                     </div>
//                     {[
//                       ["Payment Mode", receipt.payment_mode, true],
//                       receipt.bank_name && ["Bank", receipt.bank_name],
//                       receipt.transaction_id && [
//                         "Transaction ID",
//                         receipt.transaction_id,
//                       ],
//                       ["Period", `${receipt.month} ${receipt.year}`],
//                     ]
//                       .filter(Boolean)
//                       .map((row: any, i: number) => (
//                         <div key={i} className="flex justify-between mb-1.5">
//                           <span className="text-xs text-blue-500">
//                             {row[0]}
//                           </span>
//                           <span
//                             className={`text-sm font-medium text-slate-700 ${row[2] ? "capitalize" : ""}`}
//                           >
//                             {row[1]}
//                           </span>
//                         </div>
//                       ))}
//                   </div>

//                   {receipt.remark && (
//                     <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
//                       <p className="text-[10px] font-bold uppercase text-amber-700 mb-1">
//                         Remark
//                       </p>
//                       <p className="text-sm text-slate-700">{receipt.remark}</p>
//                     </div>
//                   )}

//                   {/* Footer */}
//                   <div className="pt-3 border-t border-slate-200 text-center">
//                     {settings["contact_address"]?.value && (
//                       <p className="text-xs text-slate-400">
//                         {settings["contact_address"].value}
//                       </p>
//                     )}
//                     <p className="text-xs text-slate-400 mt-1">
//                       {settings["contact_phone"]?.value &&
//                         `Tel: ${settings["contact_phone"].value}`}
//                       {settings["contact_email"]?.value &&
//                         ` · ${settings["contact_email"].value}`}
//                     </p>
//                     <p className="text-[10px] text-slate-300 mt-2">
//                       Computer generated receipt · No signature required
//                     </p>
//                     <p className="text-[10px] text-slate-300">
//                       Generated: {new Date(receipt.created_at).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2">
//                 <button
//                   onClick={() => onOpenChange(false)}
//                   className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition"
//                 >
//                   Close
//                 </button>
//                 <button
//                   onClick={openPdfPreview}
//                   className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
//                 >
//                   <Eye className="w-3.5 h-3.5" /> Preview PDF
//                 </button>
//                 <button
//                   onClick={() => onDownload(receipt.id)}
//                   className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium text-sm shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
//                 >
//                   <Download className="w-3.5 h-3.5" /> Download PDF
//                 </button>
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-12">
//               <FileWarning className="w-8 h-8 text-slate-300 mx-auto mb-3" />
//               <p className="text-sm text-slate-400">No receipt data found</p>
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// /* Enhanced Loading Skeleton */
// function LoadingSkeleton() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
//       <div className="h-16 bg-white border-b border-slate-200" />
//       <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           {[1, 2, 3, 4].map((i) => (
//             <div
//               key={i}
//               className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse"
//             >
//               <div className="w-8 h-8 bg-slate-200 rounded-lg mb-2" />
//               <div className="h-3 bg-slate-200 rounded w-20 mb-1" />
//               <div className="h-4 bg-slate-200 rounded w-28" />
//             </div>
//           ))}
//         </div>
//         <div className="bg-white border border-slate-200 rounded-2xl h-[400px] animate-pulse" />
//       </div>
//     </div>
//   );
// }

// function calcAge(dob: string): number {
//   if (!dob) return 0;
//   const birth = new Date(dob);
//   const today = new Date();
//   if (isNaN(birth.getTime())) return 0;
//   let age = today.getFullYear() - birth.getFullYear();
//   const monthDiff = today.getMonth() - birth.getMonth();
//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
//     age--;
//   }
//   return age;
// }

// // Stat Card Component
// const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
//   <Card className={`${bgColor} border-0 shadow-sm`}>
//     <CardContent className="p-2 sm:p-3">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
//             {title}
//           </p>
//           <p className="text-sm sm:text-base font-bold text-slate-800">
//             {value}
//           </p>
//         </div>
//         <div className={`p-1.5 rounded-lg ${color}`}>
//           <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// );

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTenantById,
  type Tenant,
  viewDocument,
  getTenantAssignment,
  getTenantPayments,
  getTenantPaymentFormData,
  getPrimaryTenantByCoupleId,
} from "@/lib/tenantApi";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  BedDouble,
  Building2,
  LogOut,
  User,
  Briefcase,
  FileText,
  CreditCard,
  ScrollText,
  Heart,
  History,
  Shield,
  Phone,
  Mail,
  Copy,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  Upload,
  Download,
  Printer,
  Users,
  Banknote,
  CheckCircle2,
  XCircle,
  MapPin,
  Fingerprint,
  BadgeCheck,
  TrendingUp,
  Wallet,
  ReceiptText,
  Lock,
  Bell,
  ExternalLink,
  Layers,
  MoreHorizontal,
  Info,
  Star,
  Home,
  Hash,
  CreditCard as IdCardIcon,
  Share2,
  Camera,
  Eye,
  Bed,
  FileCheck,
  FileWarning,
  CalendarDays,
  RotateCcw,
  ReceiptIndianRupee,
  Building,
  CheckCircle,
  Sparkles,
  IdCard,
  GraduationCap,
  Loader2,
  Store,
  Laptop,
  Landmark,
  BriefcaseBusiness,
  Key,
  EyeOff,
  X,
  AlertTriangle,
  Check,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TenantForm } from "@/components/admin/tenants/tenant-form";

import { getSettings, type SettingsData } from "@/lib/settingsApi";
import * as paymentApi from "@/lib/paymentRecordApi";
import { Badge } from "@/components/ui/badge";
import { request } from "@/lib/api";

// ─── Font style (matching ui-sans-serif, system-ui, -apple-system) ────────────
const fontStyle = {
  fontFamily: "ui-sans-serif, system-ui, -apple-system",
};

// ─── Brand colors from Roomac logo ────────────────────────────────────────────
// Primary blue: #1B3FA0, Gold: #F5A623, Dark navy: #0D2567

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = "overview" | "documents" | "payments" | "partner" | "history";

interface PartnerDetails {
  salutation: string;
  full_name: string;
  country_code: string;
  phone: string;
  email: string;
  gender: string;
  date_of_birth: string;
  address: string;
  occupation: string;
  organization: string;
  relationship: string;
  id_proof_type: string;
  id_proof_number: string;
  id_proof_url: string | null;
  address_proof_type: string;
  address_proof_number: string;
  address_proof_url: string | null;
  photo_url: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatINR = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function calcAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  if (isNaN(birth.getTime())) return 0;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const getApiUrl = () =>
  (typeof window !== "undefined" && (window as any).__ENV__?.VITE_API_URL) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "http://localhost:3001";

function resolveUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${getApiUrl()}${url}`;
}

// ─── Primitives ───────────────────────────────────────────────────────────────
function BadgePill({ children, variant = "gray" }: { children: React.ReactNode; variant?: string }) {
  const v: Record<string, string> = {
    green:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    red:    "bg-red-50    text-red-600    border-red-200",
    amber:  "bg-amber-50  text-amber-700  border-amber-200",
    blue:   "bg-blue-50   text-blue-700   border-blue-200",
    gray:   "bg-gray-100  text-gray-600   border-gray-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    teal:   "bg-teal-50   text-teal-700   border-teal-200",
    rose:   "bg-rose-50   text-rose-700   border-rose-200",
    gold:   "bg-amber-50  text-amber-600  border-amber-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${v[variant] ?? v.gray}`}>
      {children}
    </span>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap flex-shrink-0">{label}</span>
      <div className={`text-xs font-semibold text-gray-800 text-right ${mono ? "font-mono" : ""}`} style={fontStyle}>
        {value ?? <span className="text-gray-300 font-normal">—</span>}
      </div>
    </div>
  );
}

function Section({ title, icon, accent = "bg-[#1B3FA0]", children, className = "" }: {
  title: string; icon: React.ReactNode; accent?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
        <div className={`w-5 h-5 rounded-md ${accent} flex items-center justify-center text-white flex-shrink-0`}>{icon}</div>
        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>{title}</span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

// ─── KV Row (inline label - value) ───────────────────────────────────────────
function KVRow({ label, value, mono = false, wide = false }: { label: string; value: React.ReactNode; mono?: boolean; wide?: boolean }) {
  return (
    <div className={`flex items-baseline gap-2 ${wide ? "col-span-2" : ""}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap flex-shrink-0" style={fontStyle}>{label} —</span>
      <span className={`text-xs font-medium text-gray-900 ${mono ? "font-mono" : ""}`} style={fontStyle}>{value ?? <span className="text-gray-300">—</span>}</span>
    </div>
  );
}

// ─── Document Card ────────────────────────────────────────────────────────────
function DocCard({ title, type, number: docNumber, status, url, onView, accent, onUpload }: {
  title: string; type?: string; number?: string; status: string;
  url?: string; onView: (url: string) => void; accent: string; onUpload?: () => void;
}) {
  const statusVariant: Record<string, string> = {
    Uploaded: "blue", "Not Uploaded": "gray", Verified: "green", Rejected: "red",
  };
  return (
    <div className={`rounded-xl border overflow-hidden ${status === "Not Uploaded" ? "border-dashed border-gray-200 bg-gray-50/60" : "border-gray-100 bg-white"}`}>
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className={`w-8 h-8 rounded-lg ${accent} flex items-center justify-center text-white`}><FileText size={14} /></div>
          <BadgePill variant={statusVariant[status] as any}>{status}</BadgePill>
        </div>
        <p className="text-xs font-bold text-gray-800" style={fontStyle}>{title}</p>
        {type && <p className="text-[10px] text-gray-400 mt-0.5" style={fontStyle}>{type}</p>}
        {docNumber && (
          <div className="mt-1.5 bg-gray-50 rounded px-2 py-1 flex items-center gap-1">
            <Fingerprint size={9} className="text-gray-400" />
            <span className="text-[10px] font-mono text-gray-500">{docNumber}</span>
          </div>
        )}
      </div>
      <div className="px-3 pb-3">
        {!url ? (
          <button onClick={onUpload} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#1B3FA0] text-white text-[10px] font-bold hover:bg-[#0D2567] transition-colors">
            <Upload size={10} /> Upload
          </button>
        ) : (
          <button onClick={() => onView(url)} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold hover:bg-gray-200 transition-colors">
            <Eye size={10} /> View
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Payment Stat Card ────────────────────────────────────────────────────────
function PaymentCard({ label, value, gradient, icon }: any) {
  return (
    <div className={`${gradient} rounded-xl p-3 text-white`}>
      <div className="flex items-start justify-between mb-1">
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/70" style={fontStyle}>{label}</p>
        <div className="opacity-50">{icon}</div>
      </div>
      <p className="text-base font-black" style={fontStyle}>{value}</p>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="h-16 bg-white border-b border-slate-200" />
      <div className="max-w-9xl mx-auto px-2 sm:px-2 py-2 space-y-3">
        <div className="h-16 bg-white/20 rounded-xl animate-pulse" />
        <div className="bg-white rounded-xl h-96 animate-pulse" />
      </div>
    </div>
  );
}


// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({
  tenant,
  assignment,
  payments,
  paymentSummary,
  onIdCard,
  onEdit,
  copiedEmail,
  copiedPhone,
  onCopyEmail,
  onCopyPhone,
}: {
  tenant: any; assignment: any; paymentSummary: any; onIdCard: () => void; onEdit: () => void;
  copiedEmail: boolean; copiedPhone: boolean; payments: any[];
  onCopyEmail: () => void; onCopyPhone: () => void;
}) {
  const vacateRecord = tenant.vacate_records?.[0] ?? null;

  const getOccupationIcon = (cat: string) => {
    switch (cat) {
      case "Working Professional": return <BriefcaseBusiness size={11} />;
      case "Student": return <GraduationCap size={11} />;
      case "Business Owner": return <Store size={11} />;
      case "Freelancer / Self-Employed": return <Laptop size={11} />;
      case "Government Employee": return <Landmark size={11} />;
      default: return <Briefcase size={11} />;
    }
  };

  const rentVal = (() => {
    if (vacateRecord?.rent_amount) return formatINR(vacateRecord.rent_amount);
    if (assignment?.tenant_rent) return formatINR(assignment.tenant_rent);
    if (tenant.monthly_rent) return formatINR(tenant.monthly_rent);
    return "N/A";
  })();

  // ─── Security Deposit — same lookup order as the tenants table ──────────
 const securityDeposit = (() => {
  if (vacateRecord?.security_deposit_amount) return Number(vacateRecord.security_deposit_amount);
  if (assignment?.security_deposit) return Number(assignment.security_deposit);
  if (tenant.security_deposit) return Number(tenant.security_deposit);
  if (paymentSummary?.security_deposit_info?.total) return Number(paymentSummary.security_deposit_info.total);
  if (paymentSummary?.security_deposit_info?.paid) return Number(paymentSummary.security_deposit_info.paid);
  if (paymentSummary?.vacate_info?.security_deposit) return Number(paymentSummary.vacate_info.security_deposit);
  // ← ADD THIS: direct payments se fetch karo
  const sdPayments = (payments || []).filter((p: any) =>
    p.payment_type === "security_deposit" && (p.status === "paid" || p.status === "approved")
  );
  if (sdPayments.length > 0) return sdPayments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
  return 0;
})();

  // ─── Couple booking — same flag the tenants table uses ──────────────────
  const isCoupleBooking = tenant.is_couple_booking === true || tenant.is_couple_booking === 1;

  // ─── Profile stat box calculations (Stays / Months / Rent Paid) ──────────
  const staysCount = (() => {
    if (tenant.vacate_records?.length) return tenant.vacate_records.length;
    return tenant.check_in_date ? 1 : 0;
  })();

  const monthsStayed = (() => {
    if (!tenant.check_in_date) return 0;
    const start = new Date(tenant.check_in_date);
    if (isNaN(start.getTime())) return 0;
    const end = vacateRecord?.requested_vacate_date ? new Date(vacateRecord.requested_vacate_date) : new Date();
    if (isNaN(end.getTime())) return 0;
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) months--;
    return Math.max(0, months);
  })();

  const rentPaidTotal = (() => {
    if (vacateRecord) return paymentSummary?.total_rent_paid ?? 0;
    return paymentSummary?.total_paid ?? 0;
  })();

  const rentPaidDisplay = (() => {
    const n = Number(rentPaidTotal || 0);
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${Math.round(n / 1000)}k`;
    return `₹${n}`;
  })();


  // ─── Print / PDF helpers for OverviewTab ──────────────────────────────
const buildPrintHTML = () => {
  const vacateRecord = tenant.vacate_records?.[0] ?? null;
  const rentVal = (() => {
    if (vacateRecord?.rent_amount) return formatINR(vacateRecord.rent_amount);
    if (assignment?.tenant_rent) return formatINR(assignment.tenant_rent);
    if (tenant.monthly_rent) return formatINR(tenant.monthly_rent);
    return "N/A";
  })();

  return `<!DOCTYPE html><html><head><title>Tenant Profile · ${tenant.full_name}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;color:#111;font-size:12px;padding:32px}
  .header{display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #f3f4f6}
  .avatar{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#60a5fa,#2563eb);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:900;flex-shrink:0}
  .header-info h1{font-size:18px;font-weight:900;margin-bottom:3px}
  .header-info .meta{font-size:10px;color:#6b7280}
  .badge{display:inline-block;padding:1px 8px;border-radius:4px;font-size:10px;font-weight:700;border:1px solid;margin-left:6px}
  .badge-green{background:#f0fdf4;color:#15803d;border-color:#bbf7d0}
  .section{margin-bottom:18px}
  .section-title{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;border-bottom:1.5px solid #f3f4f6;padding-bottom:4px;margin-bottom:8px}
  .row{display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;border-bottom:1px solid #f9fafb}
  .row:last-child{border:0}
  .lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af}
  .val{font-size:11px;font-weight:600;color:#111;text-align:right}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .footer{margin-top:28px;padding-top:10px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;display:flex;justify-content:space-between}
</style></head><body>
<div class="header">
  <div class="avatar">${tenant.full_name?.charAt(0)?.toUpperCase() ?? "?"}</div>
  <div class="header-info">
    <h1>${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name} <span class="badge badge-green">${tenant.is_active ? "Active" : "Inactive"}</span></h1>
    <div class="meta">ID #${tenant.id} &nbsp;·&nbsp; ${assignment?.property?.name || "—"} · Room ${assignment?.room?.room_number || "—"} · Bed ${assignment?.bed_number || "—"}</div>
  </div>
</div>
<div class="two-col">
<div>
  <div class="section">
    <div class="section-title">Personal Information</div>
    <div class="row"><span class="lbl">Full Name</span><span class="val">${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}</span></div>
    <div class="row"><span class="lbl">Gender</span><span class="val">${tenant.gender || "—"}</span></div>
    <div class="row"><span class="lbl">Date of Birth</span><span class="val">${tenant.date_of_birth ? new Date(tenant.date_of_birth).toLocaleDateString("en-IN") : "—"} (${calcAge(tenant.date_of_birth)} yrs)</span></div>
<div class="row"><span class="lbl">Aadhar</span><span class="val" style="font-family:monospace">${tenant.aadhar_number ?? (tenant.id_proof_type === "Aadhar Card" ? tenant.id_proof_number : null) ?? (tenant.address_proof_type === "Aadhar Card" ? tenant.address_proof_number : null) ?? "—"}</span></div>
    <div class="row"><span class="lbl">PAN</span><span class="val" style="font-family:monospace">${tenant.pan_number ?? (tenant.id_proof_type === "PAN Card" ? tenant.id_proof_number : null) ?? (tenant.address_proof_type === "PAN Card" ? tenant.address_proof_number : null) ?? "—"}</span></div>

  </div>
  <div class="section">
    <div class="section-title">Contact</div>
    <div class="row"><span class="lbl">Email</span><span class="val">${tenant.email || "—"}</span></div>
    <div class="row"><span class="lbl">Phone</span><span class="val">${tenant.country_code || ""} ${tenant.phone || "—"}</span></div>
    <div class="row"><span class="lbl">Address</span><span class="val" style="max-width:200px;text-align:right">${tenant.address || "—"}</span></div>
  </div>
  ${tenant.emergency_contact_name ? `<div class="section">
    <div class="section-title">Emergency Contact</div>
    <div class="row"><span class="lbl">Name</span><span class="val">${tenant.emergency_contact_name}</span></div>
    <div class="row"><span class="lbl">Phone</span><span class="val">${tenant.emergency_contact_phone || "—"}</span></div>
    <div class="row"><span class="lbl">Relation</span><span class="val">${tenant.emergency_contact_relation || "—"}</span></div>
  </div>` : ""}
</div>
<div>
  <div class="section">
    <div class="section-title">Stay Information</div>
    <div class="row"><span class="lbl">Property</span><span class="val">${assignment?.property?.name || "—"}</span></div>
    <div class="row"><span class="lbl">Room / Bed</span><span class="val">Room ${assignment?.room?.room_number || "—"} · Bed ${assignment?.bed_number || "—"}</span></div>
    <div class="row"><span class="lbl">Monthly Rent</span><span class="val" style="color:#059669;font-weight:800">${rentVal}</span></div>
    <div class="row"><span class="lbl">Check-in</span><span class="val">${tenant.check_in_date ? new Date(tenant.check_in_date).toLocaleDateString("en-IN") : "—"}</span></div>
    ${vacateRecord ? `<div class="row"><span class="lbl">Vacated On</span><span class="val">${new Date(vacateRecord.requested_vacate_date).toLocaleDateString("en-IN")}</span></div>` : ""}
  </div>
  ${vacateRecord ? `<div class="section">
    <div class="section-title">Vacate Details</div>
    <div class="row"><span class="lbl">Penalty</span><span class="val">₹${Number(vacateRecord.total_penalty_amount || 0).toLocaleString()}</span></div>
    <div class="row"><span class="lbl">Refund</span><span class="val" style="color:#059669">₹${Number(vacateRecord.refundable_amount || 0).toLocaleString()}</span></div>
    <div class="row"><span class="lbl">Status</span><span class="val">${vacateRecord.status || "—"}</span></div>
    <div class="row"><span class="lbl">Reason</span><span class="val">${vacateRecord.vacate_reason_value || "—"}</span></div>
  </div>` : ""}
</div>
</div>
<div class="footer"><span>Roomac Co-Living Management System</span><span>Generated ${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</span></div>
</body></html>`;
};

const handlePrintProfile = () => {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(buildPrintHTML());
  w.document.close();
  w.print();
};

const handlePDFProfile = () => {
  const w = window.open("", "_blank");
  if (!w) return;
  const html = buildPrintHTML().replace("</style>", `
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  @page { margin: 16mm; size: A4; }
</style>`);
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 400);
};

  return (
    <div className="space-y-3">
      {/* Action bar */}
<div className="hidden lg:flex justify-end gap-2 mb-3">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          style={fontStyle}
        >
          <Edit2 size={12} /> Edit Tenant
        </button>
        <button
          onClick={onIdCard}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3FA0] rounded-lg text-[10px] font-bold text-white hover:bg-[#0D2567] transition-colors shadow-sm"
          style={fontStyle}
        >
          <IdCardIcon size={12} /> ID Card
        </button>
        
         <button
    onClick={handlePrintProfile}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3FA0] border border-gray-200 rounded-lg text-[10px] font-bold text-white hover:bg-gray-50 transition-colors shadow-sm"
  >
    <Printer size={12} /> Print
  </button>
  <button
    onClick={handlePDFProfile}
    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3FA0] rounded-lg text-[10px] font-bold text-white hover:bg-[#1B3FA0] transition-colors shadow-sm"
  >
    <Download size={12} /> Download PDF
  </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {/* Profile card */}
        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0D2567 0%, #1B3FA0 60%, #0D2567 100%)" }}>
  <div className="px-3 sm:px-4 pt-4 sm:pt-5 pb-3 sm:pb-4 flex flex-col items-center text-center gap-1.5 sm:gap-2">
    <div className="relative">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-400 to-[#1B3FA0] flex items-center justify-center text-white font-black text-base sm:text-xl shadow-lg ring-2 ring-[#F5A623]/40">
        {tenant.photo_url ? (
          <img src={resolveUrl(tenant.photo_url)} alt={tenant.full_name} className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          tenant.full_name?.charAt(0)?.toUpperCase() ?? "?"
        )}
      </div>
      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-[#0D2567] ${tenant.is_active ? "bg-emerald-400" : "bg-gray-500"}`} />
    </div>
    <div>
      <p className="text-xs sm:text-sm font-black text-white leading-tight" style={fontStyle}>
        {tenant.salutation ? `${tenant.salutation} ` : ""}{tenant.full_name}
      </p>
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
        <BadgePill variant={tenant.is_active ? "green" : "gray"}>{tenant.is_active ? "Active" : "Inactive"}</BadgePill>
        <span className="text-[9px] sm:text-[10px] text-blue-300 font-mono">#{tenant.id}</span>
      </div>
    </div>
  </div>
  {/* Stat boxes: Stays / Months / Rent Paid */}
  <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
    {[
      { label: "Stays", value: staysCount },
      { label: "Months", value: monthsStayed },
      { label: "Rent Paid", value: rentPaidDisplay },
    ].map(({ label, value }) => (
      <div key={label} className="px-1.5 sm:px-2 py-2 sm:py-2.5 text-center">
        <p className="text-xs sm:text-sm font-black text-white" style={fontStyle}>{value}</p>
        <p className="text-[7px] sm:text-[8px] font-bold text-blue-300 uppercase tracking-widest mt-0.5" style={fontStyle}>{label}</p>
      </div>
    ))}
  </div>
</div>

          {/* Account status */}
        <Section title="Account" icon={<BadgeCheck size={11} />} accent="bg-slate-600">
  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
    <div className="flex items-center gap-2 py-1">
      <span
        className="w-[55px] text-[10px] font-semibold text-gray-400 uppercase shrink-0"
        style={fontStyle}
      >
        Status
      </span>
      <BadgePill variant={tenant.is_active ? "green" : "gray"}>
        {tenant.is_active ? "Active" : "Inactive"}
      </BadgePill>
    </div>

    <div className="flex items-center gap-2 py-1">
      <span
        className="w-[55px] text-[10px] font-semibold text-gray-400 uppercase shrink-0"
        style={fontStyle}
      >
        Portal
      </span>
      <BadgePill variant={tenant.portal_access_enabled ? "green" : "amber"}>
        {tenant.portal_access_enabled ? "Enabled" : "Disabled"}
      </BadgePill>
    </div>

    <div className="flex items-center gap-2 py-1">
      <span
        className="w-[55px] text-[10px] font-semibold text-gray-400 uppercase shrink-0"
        style={fontStyle}
      >
        Login
      </span>
      <BadgePill variant={tenant.has_credentials ? "blue" : "amber"}>
        {tenant.has_credentials ? "Configured" : "Not Set"}
      </BadgePill>
    </div>

    <div className="flex items-center gap-2 py-1">
      <span
        className="w-[55px] text-[10px] font-semibold text-gray-400 uppercase shrink-0"
        style={fontStyle}
      >
        Check-in
      </span>
      <span className="text-[11px] font-medium text-gray-700">
        {tenant.check_in_date
          ? new Date(tenant.check_in_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </span>
    </div>
  </div>

  {tenant.credential_email && (
    <div className="mt-2 pt-2 border-t border-gray-100">
      <p
        className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1"
        style={fontStyle}
      >
        Credential Email
      </p>
      <p className="text-[10px] font-mono text-gray-600 break-all">
        {tenant.credential_email}
      </p>
    </div>
  )}
</Section>

          {/* Emergency contact */}
        <Section title="Emergency Contact" icon={<Heart size={11} />} accent="bg-rose-500">
  {tenant.emergency_contact_name ? (
    <div className="space-y-0">
      <InfoRow label="Name" value={tenant.emergency_contact_name} />
      <InfoRow label="Phone" value={tenant.emergency_contact_phone} />
      <InfoRow label="Relation" value={tenant.emergency_contact_relation} />
      {tenant.emergency_contact_email && <InfoRow label="Email" value={tenant.emergency_contact_email} />}
    </div>
  ) : (
    <p className="text-[10px] text-gray-400 py-1 text-center italic" style={fontStyle}>No emergency contact on file</p>
  )}
</Section>
        </div>

        {/* Right Main */}
        <div className="lg:col-span-2 space-y-3">
          {/* Current Stay */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#1B3FA0] flex items-center justify-center text-white"><Home size={11} /></div>
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Current Stay</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgePill variant={isCoupleBooking ? "rose" : "blue"}>
                  {isCoupleBooking ? <Heart size={9} /> : <User size={9} />}
                  {isCoupleBooking ? "Couple" : "Single"}
                </BadgePill>
                {vacateRecord ? <BadgePill variant="red"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Vacated</BadgePill>
                  : <BadgePill variant="green"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active</BadgePill>}
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
              {[
                { label: "Property", value: assignment?.property?.name || "Not Assigned", wide: true },
                { label: "Room / Bed", value: assignment ? `Room ${assignment.room?.room_number || "—"} · Bed ${assignment.bed_number || "—"}` : "Not Assigned" },
                { label: "Monthly Rent", value: <span className="font-black text-emerald-600">{rentVal}</span> },
                { label: "Check-in", value: tenant.check_in_date ? new Date(tenant.check_in_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                { label: vacateRecord ? "Check-out" : "Status", value: vacateRecord ? new Date(vacateRecord.requested_vacate_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : <BadgePill variant="green">Active</BadgePill> },
                { label: "Security Deposit", value: <span className="font-black text-amber-600">{formatINR(securityDeposit)}</span> },
                { label: "Lock-in", value: tenant.lockin_period_months ? `${tenant.lockin_period_months} months` : "—" },
                { label: "Notice Period", value: tenant.notice_period_days ? `${tenant.notice_period_days} days` : "—" },
                { label: "Refund", value: vacateRecord ? <span className="font-black text-emerald-600">{formatINR(vacateRecord.refundable_amount || 0)}</span> : "—" },
              ].map(({ label, value, wide }: any) => (
                <div key={label} className={wide ? "col-span-2 sm:col-span-1" : ""}>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" style={fontStyle}>{label}</p>
                  <div className="text-xs font-semibold text-gray-800" style={fontStyle}>{value}</div>
                </div>
              ))}
            </div>
            {vacateRecord && (
              <div className="mx-4 mb-4 bg-red-50 rounded-lg border border-red-100 px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <LogOut size={11} className="text-red-500" />
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider" style={fontStyle}>Vacate Details</span>
                  <BadgePill variant="amber">{vacateRecord.status || "Pending"}</BadgePill>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Penalty</p><p className="text-xs font-bold text-gray-800">₹{Number(vacateRecord.total_penalty_amount || 0).toLocaleString()}</p></div>
                  <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Refund Status</p><p className="text-xs font-bold text-amber-700">{vacateRecord.status || "—"}</p></div>
                  <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Refund Amt</p><p className="text-xs font-bold text-emerald-600">₹{Number(vacateRecord.refundable_amount || 0).toLocaleString()}</p></div>
                  <div><p className="text-[9px] text-red-400 font-bold uppercase" style={fontStyle}>Reason</p><p className="text-xs text-gray-700">{vacateRecord.vacate_reason_value || "—"}</p></div>
                </div>
              </div>
            )}
          </div>

          {/* Personal + Contact + Occupation + Terms — 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Section title="Personal" icon={<Fingerprint size={11} />} accent="bg-[#1B3FA0]">
              <div className="space-y-0">
                <InfoRow label="Full Name" value={`${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}`} />
                <InfoRow label="Gender" value={tenant.gender} />
                <InfoRow label="DOB" value={tenant.date_of_birth ? <span>{new Date(tenant.date_of_birth).toLocaleDateString("en-IN")} <BadgePill>{calcAge(tenant.date_of_birth)} yrs</BadgePill></span> : null} />
 <InfoRow label="Aadhar" value={
                  tenant.aadhar_number ?? 
                  (tenant.id_proof_type === "Aadhar Card" ? tenant.id_proof_number : null) ?? 
                  (tenant.address_proof_type === "Aadhar Card" ? tenant.address_proof_number : null) ?? 
                  null
                } mono />
                <InfoRow label="PAN" value={
                  tenant.pan_number ?? 
                  (tenant.id_proof_type === "PAN Card" ? tenant.id_proof_number : null) ?? 
                  (tenant.address_proof_type === "PAN Card" ? tenant.address_proof_number : null) ?? 
                  null
                } mono />
              </div>
            </Section>

            <Section title="Contact" icon={<Phone size={11} />} accent="bg-emerald-600">
              <div className="space-y-2">
                <div className="flex items-center gap-2 py-1 border-b border-gray-50">
                  <Mail size={11} className="text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${tenant.email}`} className="text-[10px] font-semibold text-[#1B3FA0] hover:underline flex-1 truncate">{tenant.email}</a>
                  <button onClick={onCopyEmail} className="p-0.5 rounded hover:bg-gray-100 flex-shrink-0">
                    {copiedEmail ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 py-1 border-b border-gray-50">
                  <Phone size={11} className="text-gray-400 flex-shrink-0" />
                  <span className="text-[10px] font-semibold text-gray-700 flex-1">{tenant.country_code} {tenant.phone}</span>
                  <button onClick={onCopyPhone} className="p-0.5 rounded hover:bg-gray-100 flex-shrink-0">
                    {copiedPhone ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-start gap-2 py-1">
                  <MapPin size={11} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] text-gray-600 leading-snug">{tenant.address}{tenant.city ? `, ${tenant.city}` : ""}{tenant.state ? `, ${tenant.state}` : ""}</span>
                </div>
              </div>
            </Section>

            {/* Occupation Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
                <div className="w-5 h-5 rounded-md bg-violet-600 flex items-center justify-center text-white flex-shrink-0">
                  {tenant.occupation_category ? (
                    tenant.occupation_category === "Student" ? <GraduationCap size={11} /> :
                    tenant.occupation_category === "Working Professional" ? <BriefcaseBusiness size={11} /> :
                    <Briefcase size={11} />
                  ) : <Briefcase size={11} />}
                </div>
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Occupation</span>
              
              </div>
              <div className="px-4 py-3">
                <div className="space-y-0">
                  <InfoRow label="Category" value={tenant.occupation_category ? <BadgePill variant="violet">{tenant.occupation_category}</BadgePill> : "Other"} />
                  <InfoRow label="Occupation" value={tenant.occupation} />
                  <InfoRow label="Organization" value={tenant.organization} />
                  <InfoRow label="Work Mode" value={tenant.work_mode ? tenant.work_mode.charAt(0).toUpperCase() + tenant.work_mode.slice(1) : null} />
                  <InfoRow label="Shift" value={tenant.shift_timing ? tenant.shift_timing.charAt(0).toUpperCase() + tenant.shift_timing.slice(1) : null} />
                  {tenant.exact_occupation && <InfoRow label="Exact Role" value={tenant.exact_occupation} />}
                  {tenant.monthly_income && <InfoRow label="Monthly Income" value={`₹${Number(tenant.monthly_income).toLocaleString()}`} />}
                  {tenant.years_of_experience && <InfoRow label="Experience" value={`${tenant.years_of_experience} yrs`} />}
                  {tenant.employee_id && <InfoRow label="Employee ID" value={tenant.employee_id} mono />}
                  {tenant.student_id && <InfoRow label="Student ID" value={tenant.student_id} mono />}
                  {tenant.course_duration && <InfoRow label="Course" value={tenant.course_duration.replace("_", " ")} />}
                </div>
              </div>
            </div>

            {/* Terms Card */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
                <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-white flex-shrink-0"><FileCheck size={11} /></div>
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Terms &amp; Conditions</span>
              </div>
              <div className="px-4 py-3">
                <div className="space-y-0">
                  <InfoRow label="Lock-in Period" value={tenant.lockin_period_months ? `${tenant.lockin_period_months} months` : "Not set"} />
                  <InfoRow label="Lock-in Penalty" value={
                    tenant.lockin_penalty_amount
                      ? <BadgePill variant="violet">{tenant.lockin_penalty_type === "percentage" ? `${tenant.lockin_penalty_amount}% of rent` : `₹${Number(tenant.lockin_penalty_amount).toLocaleString()}`}</BadgePill>
                      : "—"
                  } />
                  <InfoRow label="Notice Period" value={tenant.notice_period_days ? `${tenant.notice_period_days} days` : "Not set"} />
                  <InfoRow label="Notice Penalty" value={
                    tenant.notice_penalty_amount
                      ? <BadgePill variant="amber">{tenant.notice_penalty_type === "percentage" ? `${tenant.notice_penalty_amount}% of rent` : `₹${Number(tenant.notice_penalty_amount).toLocaleString()}`}</BadgePill>
                      : "—"
                  } />
                  <InfoRow label="Penalty Applied" value={<BadgePill variant="green">{formatINR(vacateRecord?.total_penalty_amount || 0)}</BadgePill>} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────
function DocumentsTab({ tenant, onView,onUpload, }: { tenant: any; onView: (url: string) => void;onUpload: (docType: string) => void; }) {
  const docs = [
    { title: "ID Proof", type: tenant.id_proof_type, number: tenant.id_proof_number, url: tenant.id_proof_url, accent: "bg-[#1B3FA0]" },
    { title: "Address Proof", type: tenant.address_proof_type, number: tenant.address_proof_number, url: tenant.address_proof_url, accent: "bg-amber-500" },
    { title: "Photograph", type: undefined, number: undefined, url: tenant.photo_url, accent: "bg-rose-500" },
  ];
  const uploaded = docs.filter(d => d.url).length + (tenant.additional_documents?.length ?? 0);
  const total = docs.length + (tenant.additional_documents?.length ?? 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "linear-gradient(135deg, #0D2567, #1B3FA0)" }}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest" style={fontStyle}>Document Completion</span>
            <span className="text-xs font-black text-white" style={fontStyle}>{uploaded}/{total} uploaded</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#d5c7b0] rounded-full transition-all" style={{ width: `${total > 0 ? (uploaded / total) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="ml-4 text-lg font-black text-white" style={fontStyle}>{total > 0 ? Math.round((uploaded / total) * 100) : 0}%</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {docs.map(doc => (
          <DocCard key={doc.title} title={doc.title} type={doc.type} number={doc.number}
            status={doc.url ? "Uploaded" : "Not Uploaded"} url={doc.url} onView={onView} onUpload={() => onUpload(doc.title)} accent={doc.accent} />
        ))}
      </div>

      {tenant.additional_documents && tenant.additional_documents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
            <div className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center text-white flex-shrink-0"><FileText size={11} /></div>
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Additional Documents ({tenant.additional_documents.length})</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tenant.additional_documents.map((doc: any, i: number) => (
              <DocCard key={i} title={doc.filename || `Document ${i + 1}`} status={doc.url ? "Uploaded" : "Not Uploaded"}
                url={doc.url} onView={onView}  onUpload={() => onUpload(doc.filename || `Document ${i + 1}`)} accent="bg-gray-400" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────
// ─── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ payments, paymentSummary, loadingPayments, onPreviewReceipt, onDownloadReceipt }: {
  payments: any[]; paymentSummary: any; loadingPayments: boolean;
  onPreviewReceipt: (id: number) => void; onDownloadReceipt: (id: number) => void;
}) {
  const [penaltyOpen, setPenaltyOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  if (loadingPayments) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#1B3FA0]" /></div>;
  }

  if (!paymentSummary && payments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><CreditCard size={20} className="text-gray-300" /></div>
        <p className="text-sm text-gray-400" style={fontStyle}>No payment records found</p>
      </div>
    );
  }

  const isVacated = paymentSummary?.is_vacated;

  // Build deduplicated payment list
  const buildPayments = () => {
    let allP: any[] = [...payments];
    if (isVacated) {
      if (paymentSummary?.payments) allP = [...allP, ...paymentSummary.payments];
      if (paymentSummary?.rent_payments) allP = [...allP, ...paymentSummary.rent_payments];
      if (paymentSummary?.security_deposit_payments) allP = [...allP, ...paymentSummary.security_deposit_payments];
    }
    const map = new Map();
    for (const p of allP) { if (p?.id && !map.has(p.id)) map.set(p.id, p); }
    let result = Array.from(map.values());
    if (isVacated) result = result.filter((p: any) => p.status !== "pending");
    return result.sort((a: any, b: any) => new Date(b.payment_date || 0).getTime() - new Date(a.payment_date || 0).getTime());
  };

  const displayPayments = buildPayments();

  const typeColor: Record<string, string> = {
    rent: "bg-blue-100 text-blue-700",
    security_deposit: "bg-amber-100 text-amber-700",
    maintenance: "bg-cyan-100 text-cyan-700",
    penalty_payment: "bg-red-100 text-red-700",
    deposit_refund: "bg-emerald-100 text-emerald-700",
    refund: "bg-emerald-100 text-emerald-700",
  };
  const typeDisplay: Record<string, string> = {
    rent: "Rent",
    security_deposit: "Security Deposit",
    maintenance: "Maintenance",
    penalty_payment: "Penalty",
    deposit_refund: "Deposit Refund",
    refund: "Refund",
  };

  const isApprovedOrPaid = (status: string) => status === "approved" || status === "paid" || status === "refund" || status === "completed";
  const isRejectedOrFailed = (status: string) => status === "rejected" || status === "failed";

  return (
    <div className="space-y-3">

      {/* Vacated: Penalty + Security Deposit as separate collapsibles side-by-side */}
      {isVacated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Penalty Breakdown - unchanged */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <Collapsible open={penaltyOpen} onOpenChange={setPenaltyOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-red-500 flex items-center justify-center text-white"><AlertCircle size={11} /></div>
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Penalty Breakdown</span>
                </div>
                {penaltyOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4 border-t border-gray-100">
                {/* same content, no change */}
                <div className="pt-3 space-y-2">
                  {paymentSummary?.vacate_info?.lockin_penalty_amount > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-800" style={fontStyle}>Lock-in Penalty</span>
                        <BadgePill variant="blue">₹{Number(paymentSummary.vacate_info.lockin_penalty_amount).toLocaleString()}</BadgePill>
                      </div>
                      {paymentSummary?.vacate_info?.lockin_penalty_description && (
                        <p className="text-[10px] text-blue-600 mt-1">{paymentSummary.vacate_info.lockin_penalty_description}</p>
                      )}
                    </div>
                  )}
                  {paymentSummary?.vacate_info?.notice_penalty_amount > 0 && (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-800" style={fontStyle}>Notice Penalty</span>
                        <BadgePill variant="amber">₹{Number(paymentSummary.vacate_info.notice_penalty_amount).toLocaleString()}</BadgePill>
                      </div>
                      {paymentSummary?.vacate_info?.notice_penalty_description && (
                        <p className="text-[10px] text-amber-600 mt-1">{paymentSummary.vacate_info.notice_penalty_description}</p>
                      )}
                    </div>
                  )}
                  {paymentSummary?.vacate_info?.inspection_penalty_amount > 0 && (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-red-800" style={fontStyle}>Inspection Penalty</span>
                        <BadgePill variant="red">₹{Number(paymentSummary.vacate_info.inspection_penalty_amount).toLocaleString()}</BadgePill>
                      </div>
                    </div>
                  )}
                  {!paymentSummary?.vacate_info?.lockin_penalty_amount &&
                   !paymentSummary?.vacate_info?.notice_penalty_amount &&
                   !paymentSummary?.vacate_info?.inspection_penalty_amount && (
                    <div className="text-center py-3">
                      <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-400" style={fontStyle}>No penalties applied</p>
                    </div>
                  )}
                  {(paymentSummary?.vacate_info?.total_penalty > 0 || paymentSummary?.vacate_info?.total_penalty_amount > 0) && (
                    <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800" style={fontStyle}>Total Penalty</span>
                      <span className="text-sm font-black text-red-600">₹{Number(paymentSummary.vacate_info.total_penalty || paymentSummary.vacate_info.total_penalty_amount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Security Deposit - unchanged */}
          {paymentSummary?.vacate_info?.security_deposit > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <Collapsible open={depositOpen} onOpenChange={setDepositOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-white"><Shield size={11} /></div>
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Security Deposit</span>
                  </div>
                  {depositOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-3 space-y-2.5">
                    {[
                      { label: "Security Deposit", value: paymentSummary.vacate_info.security_deposit, color: "bg-amber-50 border-amber-100 text-amber-800", badge: "amber" },
                      { label: "Total Penalty Deducted", value: paymentSummary.vacate_info.total_penalty || 0, color: "bg-red-50 border-red-100 text-red-800", badge: "red" },
                      { label: "Refund Amount", value: paymentSummary.vacate_info.refundable_amount || 0, color: "bg-emerald-50 border-emerald-100 text-emerald-800", badge: "green" },
                    ].map(({ label, value, color, badge }) => (
                      <div key={label} className={`rounded-lg p-3 border ${color}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold" style={fontStyle}>{label}</span>
                          <BadgePill variant={badge as any}>₹{Number(value).toLocaleString()}</BadgePill>
                        </div>
                        <div className="mt-1.5 h-1 bg-white/50 rounded-full">
                          <div className="h-full rounded-full bg-current opacity-40"
                            style={{ width: `${Math.min(100, (value / paymentSummary.vacate_info.security_deposit) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                    <div className="text-[9px] text-gray-400 italic text-right" style={fontStyle}>
                      Deposit collected: ₹{Number(paymentSummary.security_deposit_info?.paid || 0).toLocaleString()}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards - already 2 cols on mobile, fine */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {!isVacated ? (
          <>
            <PaymentCard label="Total Paid" value={formatINR(paymentSummary?.total_paid || 0)} gradient="bg-emerald-600" icon={<IndianRupee size={13} />} />
            <PaymentCard label="Total Pending" value={formatINR(paymentSummary?.total_pending || 0)} gradient="bg-amber-500" icon={<IndianRupee size={13} />} />
            <PaymentCard label="Monthly Rent" value={formatINR(paymentSummary?.monthly_rent || 0)} gradient="bg-[#1B3FA0]" icon={<IndianRupee size={13} />} />
            <PaymentCard label="Months Joined" value={String(paymentSummary?.total_months_since_joining || 0)} gradient="bg-violet-600" icon={<Calendar size={13} />} />
          </>
        ) : (
          <>
            <PaymentCard label="Total Rent Paid" value={formatINR(paymentSummary?.total_rent_paid || 0)} gradient="bg-emerald-600" icon={<IndianRupee size={13} />} />
            <PaymentCard label="Rent Payments" value={String(paymentSummary?.rent_payment_count || 0)} gradient="bg-[#1B3FA0]" icon={<CreditCard size={13} />} />
            <PaymentCard label="Security Deposit" value={formatINR(paymentSummary?.vacate_info?.security_deposit || 0)} gradient="bg-amber-500" icon={<Shield size={13} />} />
            <PaymentCard label="Deposit Paid" value={formatINR(paymentSummary?.security_deposit_info?.paid || 0)} gradient="bg-teal-600" icon={<IndianRupee size={13} />} />
          </>
        )}
      </div>

      {/* Transactions Table - responsive padding/font on mobile */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-100 flex items-center justify-between gap-2 sm:gap-3 bg-gray-50/40 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#1B3FA0] flex items-center justify-center text-white"><ReceiptText size={11} /></div>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Transactions</span>
            <span className="text-[9px] sm:text-[10px] text-gray-400" style={fontStyle}>{displayPayments.length} records</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Approved / Paid</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Rejected</span>
            {!isVacated && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Pending</span>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] sm:text-[11px]">
            <thead>
              <tr className="border-b border-gray-50">
                {["Date", "Amount", "Type", "Mode", "Period", "Status", ""].map(h => (
                  <th key={h} className="text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap" style={fontStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayPayments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-xs" style={fontStyle}>No payment transactions found</td></tr>
              ) : displayPayments.map((p: any) => {
                const approved = isApprovedOrPaid(p.status);
                const rejected = isRejectedOrFailed(p.status);
                const typeKey = p.payment_type || p.type || "";
                return (
                  <tr key={p.id} className={`border-b border-gray-50/80 hover:bg-gray-50/40 transition-colors ${rejected ? "bg-red-50/20" : ""}`}>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-[11px] text-gray-500 whitespace-nowrap" style={fontStyle}>
                      {p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className={`px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-bold whitespace-nowrap ${rejected ? "text-red-400 line-through" : approved ? "text-gray-900" : "text-amber-600"}`} style={fontStyle}>
                      {formatINR(p.amount || 0)}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 whitespace-nowrap">
                      <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${typeColor[typeKey] ?? "bg-gray-100 text-gray-600"}`} style={fontStyle}>
                        {typeDisplay[typeKey] || typeKey || "—"}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-[11px] text-gray-500 whitespace-nowrap capitalize" style={fontStyle}>{p.payment_mode || "—"}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-[10px] sm:text-[11px] text-gray-500 whitespace-nowrap" style={fontStyle}>{p.month} {p.year}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 whitespace-nowrap">
                      {approved && (
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200" style={fontStyle}>
                          <CheckCircle2 size={8} className="sm:size-[9px]" />{p.status === "paid" ? "Paid" : "Approved"}
                        </span>
                      )}
                      {rejected && (
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-red-100 text-red-600 border border-red-200" style={fontStyle}>
                          <XCircle size={8} className="sm:size-[9px]" />{p.status === "failed" ? "Failed" : "Rejected"}
                        </span>
                      )}
                      {!approved && !rejected && (
                        <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200" style={fontStyle}>
                          <Clock size={8} className="sm:size-[9px]" />{p.status ?? "Pending"}
                        </span>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2.5">
                      {approved && (
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <button onClick={() => onPreviewReceipt(p.id)} className="p-0.5 sm:p-1 hover:bg-blue-50 rounded transition-colors" title="View Receipt"><Eye size={10} className="sm:size-[11px] text-[#1B3FA0]" /></button>
                          <button onClick={() => onDownloadReceipt(p.id)} className="p-0.5 sm:p-1 hover:bg-emerald-50 rounded transition-colors" title="Download Receipt"><Download size={10} className="sm:size-[11px] text-emerald-500" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
          <div className="px-2 sm:px-4 py-1.5 sm:py-2 text-center">
            <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={fontStyle}>Total Approved / Paid</p>
            <p className="text-xs sm:text-sm font-black text-emerald-600 mt-0.5">{formatINR(isVacated ? paymentSummary?.total_rent_paid || 0 : paymentSummary?.total_paid || 0)}</p>
          </div>
          <div className="px-2 sm:px-4 py-1.5 sm:py-2 text-center">
            <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={fontStyle}>{isVacated ? "Total Rejected" : "Total Pending"}</p>
            <p className="text-xs sm:text-sm font-black text-red-500 mt-0.5">{formatINR(isVacated ? paymentSummary?.total_rejected || 0 : paymentSummary?.total_pending || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Partner Tab ──────────────────────────────────────────────────────────────
// ─── Partner Tab ──────────────────────────────────────────────────────────────
function PartnerTab({ partnerDetails, onView }: { partnerDetails: PartnerDetails | null; onView: (url: string) => void }) {
  if (!partnerDetails || !partnerDetails.full_name) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center"><Heart size={20} className="text-gray-200" /></div>
        <p className="text-xs text-gray-400" style={fontStyle}>No partner details for this tenant</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-rose-50/60">
          <div className="w-5 h-5 rounded-md bg-rose-500 flex items-center justify-center text-white flex-shrink-0"><Heart size={11} /></div>
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Partner Information</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-black text-xl shadow-md flex-shrink-0">
              {partnerDetails.photo_url ? (
                <img src={resolveUrl(partnerDetails.photo_url)} alt={partnerDetails.full_name} className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : partnerDetails.full_name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="text-sm font-black text-gray-900" style={fontStyle}>
                {partnerDetails.salutation ? `${partnerDetails.salutation} ` : ""}{partnerDetails.full_name}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5" style={fontStyle}>{partnerDetails.relationship || "Partner"}</p>
              <div className="flex items-center gap-2 mt-1">
                {partnerDetails.gender && <BadgePill variant="blue">{partnerDetails.gender}</BadgePill>}
                {partnerDetails.occupation && <BadgePill variant="violet">{partnerDetails.occupation}</BadgePill>}
              </div>
            </div>
          </div>
          {/* Grid: 2 columns on mobile, 3 columns on large screens */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3">
            {[
              { label: "Phone", value: `${partnerDetails.country_code || ""} ${partnerDetails.phone || ""}`.trim() || "—" },
              { label: "Email", value: partnerDetails.email || "—" },
              { label: "Date of Birth", value: partnerDetails.date_of_birth ? new Date(partnerDetails.date_of_birth).toLocaleDateString("en-IN") : "—" },
              { label: "Gender", value: partnerDetails.gender || "—" },
              { label: "Relationship", value: partnerDetails.relationship || "—" },
              { label: "Organization", value: partnerDetails.organization || "—" },
              { label: "Address", value: partnerDetails.address || "—", wide: true },
            ].map(({ label, value, wide }: any) => (
              <div key={label} className={wide ? "col-span-2 lg:col-span-3" : ""}>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" style={fontStyle}>{label}</p>
                <p className="text-xs font-semibold text-gray-800" style={fontStyle}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(partnerDetails.id_proof_url || partnerDetails.address_proof_url || partnerDetails.photo_url) && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white flex-shrink-0"><FileText size={11} /></div>
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider" style={fontStyle}>Partner Documents</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {partnerDetails.id_proof_url && (
              <DocCard title="Partner ID Proof" type={partnerDetails.id_proof_type} number={partnerDetails.id_proof_number}
                status="Uploaded" url={partnerDetails.id_proof_url} onView={onView} accent="bg-[#1B3FA0]" />
            )}
            {partnerDetails.address_proof_url && (
              <DocCard title="Partner Address Proof" type={partnerDetails.address_proof_type} number={partnerDetails.address_proof_number}
                status="Uploaded" url={partnerDetails.address_proof_url} onView={onView} accent="bg-amber-500" />
            )}
            {partnerDetails.photo_url && (
              <DocCard title="Partner Photo" status="Uploaded" url={partnerDetails.photo_url} onView={onView} accent="bg-rose-500" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({
  tenant,
  assignment,
  payments,
  paymentSummary,
}: {
  tenant: any;
  assignment: any;
  payments: any[];
  paymentSummary: any;
}) {

  function resolveDocNumber(tenant: any, docType: "Aadhar Card" | "PAN Card"): string | null {
    if (tenant.id_proof_type === docType && tenant.id_proof_number) return tenant.id_proof_number;
    if (tenant.address_proof_type === docType && tenant.address_proof_number) return tenant.address_proof_number;
    // legacy direct fields as fallback
    if (docType === "Aadhar Card" && tenant.aadhar_number) return tenant.aadhar_number;
    if (docType === "PAN Card" && tenant.pan_number) return tenant.pan_number;
    return null;
  }

  const [expandedStay, setExpandedStay] = useState<string | null>(null);
  const [sectionMap, setSectionMap] = useState<Record<string, string>>({});
 
  const aadharNum = resolveDocNumber(tenant, "Aadhar Card");
  const panNum = resolveDocNumber(tenant, "PAN Card");
 
  // ── Build stay list: past stays (vacate_records, oldest first) + current ──
 const pastStays = [...(tenant.vacate_records ?? [])]
    .sort((a: any, b: any) => new Date(a.requested_vacate_date || 0).getTime() - new Date(b.requested_vacate_date || 0).getTime())
    .map((vr: any, i: number) => ({
      id: `vacate-${vr.id ?? i}`,
      stayNumber: i + 1,
      aadharNumber: tenant.aadhar_number ?? (tenant.id_proof_type === "Aadhar Card" ? tenant.id_proof_number : null),
      panNumber: tenant.pan_number ?? (tenant.id_proof_type === "PAN Card" ? tenant.id_proof_number : null),
      isCurrent: false,
      property: vr.property_name || assignment?.property?.name || tenant.assigned_property_name || "Roomac Co-Living",
      room: vr.room_number || assignment?.room?.room_number || "—",
      bed: vr.bed_number || "—",
      stayType: tenant.is_couple_booking ? "Couple" : "Single",
      monthlyRent: Number(vr.rent_amount || 0),
      checkIn: vr.stay_start_date || tenant.check_in_date || null,
      checkOut: vr.requested_vacate_date || null,
     securityDeposit: Number(vr.security_deposit_amount || paymentSummary?.vacate_info?.security_deposit || 0),
 depositPaid: Number(
  
        paymentSummary?.security_deposit_info?.paid ||
        paymentSummary?.security_deposit_info?.total ||
        vr.security_deposit_amount || 0
      ),      refundAmount: Number(vr.refundable_amount || paymentSummary?.vacate_info?.refundable_amount || 0),
      refundStatus: vr.refund_status || vr.deposit_refund_status || paymentSummary?.vacate_info?.refund_status || vr.status || "N/A",
      totalPenalty: Number(vr.total_penalty_amount || 0),
      vacateReason: vr.vacate_reason_value || "—",
      lockInPeriod: tenant.lockin_period_months ? `${tenant.lockin_period_months} months` : "—",
      noticePeriod: tenant.notice_period_days ? `${tenant.notice_period_days} days` : "—",
      partner: tenant.partner_full_name ? { name: tenant.partner_full_name, phone: `${tenant.partner_country_code || ""} ${tenant.partner_phone || ""}`.trim(), relation: tenant.partner_relationship || "Spouse" } : null,
      isVacatedRecord: true,
    }));
 
const hasCurrentStay = tenant.is_active && (assignment || tenant.check_in_date) && !(tenant.vacate_records?.length > 0);
  const currentStay = hasCurrentStay
    ? {
        id: "current",
        stayNumber: pastStays.length + 1,
        isCurrent: true,
        property: assignment?.property?.name || tenant.assigned_property_name || "Roomac Co-Living",
        room: assignment?.room?.room_number || "—",
        bed: assignment?.bed_number || "—",
        stayType: tenant.is_couple_booking ? "Couple" : "Single",
        monthlyRent: Number(assignment?.tenant_rent || tenant.monthly_rent || 0),
        checkIn: tenant.check_in_date || null,
        checkOut: null,
        securityDeposit: (() => {
          if (assignment?.security_deposit) return Number(assignment.security_deposit);
          if (tenant.security_deposit) return Number(tenant.security_deposit);
          if (paymentSummary?.security_deposit_info?.total) return Number(paymentSummary.security_deposit_info.total);
          if (paymentSummary?.security_deposit_info?.paid) return Number(paymentSummary.security_deposit_info.paid);
          if (paymentSummary?.vacate_info?.security_deposit) return Number(paymentSummary.vacate_info.security_deposit);
          const sdP = (paymentSummary?.payments || []).filter((p: any) =>
            p.payment_type === "security_deposit" && (p.status === "paid" || p.status === "approved")
          );
          if (sdP.length > 0) return sdP.reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
          return 0;
        })(),
       depositPaid: Number(
  assignment?.security_deposit ||
  paymentSummary?.security_deposit_info?.paid ||
  paymentSummary?.security_deposit_info?.total ||
  // ← ADD THIS:
  (payments || [])
    .filter((p: any) => p.payment_type === "security_deposit" && (p.status === "paid" || p.status === "approved"))
    .reduce((s: number, p: any) => s + Number(p.amount || 0), 0) ||
  0
),
        refundAmount: 0,
        refundStatus: null,
        totalPenalty: 0,
        vacateReason: null,
        lockInPeriod: tenant.lockin_period_months ? `${tenant.lockin_period_months} months` : "—",
        noticePeriod: tenant.notice_period_days ? `${tenant.notice_period_days} days` : "—",
        partner: tenant.partner_full_name ? { name: tenant.partner_full_name, phone: `${tenant.partner_country_code || ""} ${tenant.partner_phone || ""}`.trim(), relation: tenant.partner_relationship || "Spouse" } : null,
        isVacatedRecord: false,
      }
    : null;
 
  const allStays = [...(currentStay ? [currentStay] : []), ...pastStays].sort((a, b) => b.stayNumber - a.stayNumber);
 
  const stayTypeCfg: Record<string, { bg: string; text: string; ring: string; icon: React.ReactNode }> = {
    Single: { bg: "bg-blue-500", text: "text-blue-700", ring: "ring-blue-200", icon: <User size={10} /> },
    Sharing: { bg: "bg-teal-500", text: "text-teal-700", ring: "ring-teal-200", icon: <Users size={10} /> },
    Couple: { bg: "bg-rose-500", text: "text-rose-700", ring: "ring-rose-200", icon: <Heart size={10} /> },
  };
 
  const typeColor: Record<string, string> = {
    rent: "bg-blue-100 text-blue-700",
    security_deposit: "bg-amber-100 text-amber-700",
    maintenance: "bg-cyan-100 text-cyan-700",
    penalty_payment: "bg-red-100 text-red-700",
    deposit_refund: "bg-emerald-100 text-emerald-700",
    refund: "bg-emerald-100 text-emerald-700",
  };
  const typeDisplay: Record<string, string> = {
    rent: "Rent",
    security_deposit: "Security Deposit",
    maintenance: "Maintenance",
    penalty_payment: "Penalty",
    deposit_refund: "Deposit Refund",
    refund: "Refund",
  };
 
  // ── Print / download for one stay ──
  const doPrint = (stay: any) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Stay #${stay.stayNumber}</title>
    <style>body{font-family:system-ui,sans-serif;margin:40px;color:#111;font-size:12px}h1{font-size:18px;font-weight:900;margin-bottom:2px}.sub{color:#6b7280;font-size:11px;margin-bottom:22px}h2{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;border-bottom:2px solid #f3f4f6;padding-bottom:4px;margin:18px 0 8px}.g2{display:grid;grid-template-columns:1fr 1fr;gap:5px 24px;margin-bottom:10px}.lbl{font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;font-weight:700}.val{font-size:12px;font-weight:700;margin-top:1px}.ft{margin-top:28px;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}</style>
    </head><body><h1>${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}</h1>
    <div class="sub">ID: ${tenant.id} · Stay #${stay.stayNumber} · ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
    <h2>Stay Details</h2><div class="g2">
    <div><div class="lbl">Property</div><div class="val">${stay.property}</div></div>
    <div><div class="lbl">Room/Bed</div><div class="val">Room ${stay.room} · Bed ${stay.bed}</div></div>
    <div><div class="lbl">Type</div><div class="val">${stay.stayType}</div></div>
    <div><div class="lbl">Rent</div><div class="val">₹${stay.monthlyRent.toLocaleString("en-IN")}</div></div>
    <div><div class="lbl">Check-in</div><div class="val">${stay.checkIn ? new Date(stay.checkIn).toLocaleDateString("en-IN") : "—"}</div></div>
    <div><div class="lbl">Check-out</div><div class="val">${stay.checkOut ? new Date(stay.checkOut).toLocaleDateString("en-IN") : "Active"}</div></div>
    <div><div class="lbl">Deposit</div><div class="val">₹${stay.securityDeposit.toLocaleString("en-IN")}</div></div>
    <div><div class="lbl">Refund</div><div class="val">₹${(stay.refundAmount ?? 0).toLocaleString("en-IN")} (${stay.refundStatus ?? "N/A"})</div></div>
    </div><div class="ft">Roomac Co-Living Management System</div></body></html>`);
    w.document.close();
    w.print();
  };
 
  const doDownload = (stay: any) => {
    const csv = [
      `Stay History,${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name},ID:${tenant.id},Stay#${stay.stayNumber}`,
      "",
      "STAY",
      `Property,${stay.property}`,
      `Room,Room ${stay.room} Bed ${stay.bed}`,
      `Type,${stay.stayType}`,
      `Rent,₹${stay.monthlyRent}`,
      `CheckIn,${stay.checkIn ? new Date(stay.checkIn).toLocaleDateString("en-IN") : "—"}`,
      `CheckOut,${stay.checkOut ? new Date(stay.checkOut).toLocaleDateString("en-IN") : "Active"}`,
      `Deposit,₹${stay.securityDeposit}`,
      `Refund,₹${stay.refundAmount ?? 0} (${stay.refundStatus ?? "N/A"})`,
      `Penalty,₹${stay.totalPenalty ?? 0}`,
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `stay-${tenant.id}-${stay.stayNumber}.csv`;
    a.click();
  };
 
  // ── Top stat cards ──
  const totalStays = allStays.length;
  const lifetimeRent =
    pastStays.reduce((a, s) => a + s.monthlyRent, 0) /* rough — real per-stay rent totals aren't tracked historically */ +
    Number(paymentSummary?.total_rent_paid ?? paymentSummary?.total_paid ?? 0);
  const monthsStayed = (() => {
    let total = 0;
    for (const s of allStays) {
      if (!s.checkIn) continue;
      const start = new Date(s.checkIn);
      const end = s.checkOut ? new Date(s.checkOut) : new Date();
      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
      let m = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      if (end.getDate() < start.getDate()) m--;
      total += Math.max(0, m);
    }
    return total;
  })();
 const refundReceived = pastStays.reduce((a, s) => a + (
    ["approved", "completed", "Completed", "refunded", "Refunded"].includes(s.refundStatus ?? "") 
      ? s.refundAmount : 0
  ), 0) + Number(paymentSummary?.vacate_info?.refunded_amount || 0); 
  if (allStays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center"><History size={20} className="text-gray-200" /></div>
        <p className="text-xs text-gray-400" style={fontStyle}>No stay history available for this tenant</p>
      </div>
    );
  }
 
    return (
    <div className="space-y-3">
      {/* Top stat cards - already 2 columns on mobile, fine */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Stays", value: totalStays, bg: "bg-[#1B3FA0]", icon: <Layers size={13} /> },
          { label: "Lifetime Rent", value: formatINR(lifetimeRent), bg: "bg-emerald-600", icon: <IndianRupee size={13} /> },
          { label: "Months Stayed", value: monthsStayed, bg: "bg-violet-600", icon: <Calendar size={13} /> },
          { label: "Refund Received", value: formatINR(refundReceived), bg: "bg-teal-600", icon: <Banknote size={13} /> },
        ].map(({ label, value, bg, icon }) => (
          <div key={label} className={`${bg} rounded-xl p-2.5 sm:p-3 text-white`}>
            <div className="flex items-start justify-between mb-0.5 sm:mb-1">
              <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-white/70" style={fontStyle}>{label}</p>
              <div className="opacity-50">{icon}</div>
            </div>
            <p className="text-sm sm:text-base font-black" style={fontStyle}>{value}</p>
          </div>
        ))}
      </div>
 
      <div className="flex justify-end">
        <button
          onClick={() => allStays.forEach(s => doPrint(s))}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white border border-gray-200 rounded-lg text-[9px] sm:text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          style={fontStyle}
        >
          <Printer size={10} className="sm:size-[11px]" /> Print All
        </button>
      </div>
 
      {/* Timeline */}
      <div className="relative space-y-2.5">
        <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-gray-200 hidden lg:block" />
        {allStays.map(stay => {
          const cfg = stayTypeCfg[stay.stayType] ?? stayTypeCfg.Single;
          const isOpen = expandedStay === stay.id;
          const section = sectionMap[stay.id] ?? "payments";
 
          // Payments shown for this stay: real list for current stay, derived single-row summary for past stays
          const stayPayments = stay.isCurrent
            ? payments
            : [
                ...(stay.monthlyRent > 0
                  ? [{ id: `${stay.id}-rent`, payment_date: stay.checkOut, amount: stay.monthlyRent, payment_type: "rent", payment_mode: "—", month: "", year: "", status: "approved" }]
                  : []),
                ...(stay.totalPenalty > 0
                  ? [{ id: `${stay.id}-penalty`, payment_date: stay.checkOut, amount: stay.totalPenalty, payment_type: "penalty_payment", payment_mode: "—", month: "", year: "", status: "approved" }]
                  : []),
                ...(stay.refundAmount > 0
                  ? [{ id: `${stay.id}-refund`, payment_date: stay.checkOut, amount: stay.refundAmount, payment_type: "deposit_refund", payment_mode: "—", month: "", year: "", status: stay.refundStatus }]
                  : []),
              ];
 
          const stayRentPaid = stay.isCurrent
            ? Number(paymentSummary?.total_paid ?? paymentSummary?.total_rent_paid ?? 0)
            : stay.monthlyRent;
          const docsUploaded = stay.isCurrent
            ? [tenant.id_proof_url, tenant.address_proof_url, tenant.photo_url].filter(Boolean).length
            : 0;
          const docsTotal = stay.isCurrent ? 3 : 3;
 
          return (
            <div key={stay.id} className="relative lg:pl-10">
              <div
                className={`absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 border-white shadow hidden lg:block ${stay.isCurrent ? "bg-emerald-500" : "bg-gray-300"}`}
                style={{ transform: "translateX(-50%)" }}
              />
              <div className={`bg-white rounded-xl border overflow-hidden transition-all ${isOpen ? "border-gray-200 shadow-md" : "border-gray-100 shadow-sm hover:shadow"}`}>
                {/* Stay header - reduced padding on mobile */}
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 cursor-pointer" onClick={() => setExpandedStay(isOpen ? null : stay.id)}>
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl ${cfg.bg} flex items-center justify-center text-white font-black text-[9px] sm:text-[11px] flex-shrink-0`}>#{stay.stayNumber}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-900" style={fontStyle}>{stay.property}</span>
                      <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ring-1 bg-white ${cfg.text} ${cfg.ring}`}>{cfg.icon}{stay.stayType}</span>
                      {stay.isCurrent && (
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                          <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500" />Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-3 mt-0.5 flex-wrap text-[9px] sm:text-[10px] text-gray-500">
                      <span className="flex items-center gap-0.5"><BedDouble size={7} className="sm:size-[9px]" />Room {stay.room} · Bed {stay.bed}</span>
                      <span className="flex items-center gap-0.5">
                        <Calendar size={7} className="sm:size-[9px]" />
                        {stay.checkIn ? new Date(stay.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        {" — "}
                        {stay.checkOut ? new Date(stay.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Active"}
                      </span>
                      <span className="flex items-center gap-0.5 font-bold text-gray-700"><IndianRupee size={7} className="sm:size-[9px]" />{formatINR(stay.monthlyRent)}/mo</span>
                    </div>
                    <div className="flex gap-1 sm:gap-1.5 mt-1 flex-wrap">
                      {[
                        { label: `${stayPayments.length} payments`, bg: "bg-gray-50 border-gray-100 text-gray-500" },
                        { label: formatINR(stayRentPaid), bg: "bg-emerald-50 border-emerald-100 text-emerald-700" },
                        { label: `dep ${formatINR(stay.depositPaid)}`, bg: "bg-gray-50 border-gray-100 text-gray-500" },
                        { label: `${docsUploaded}/${docsTotal} docs`, bg: "bg-gray-50 border-gray-100 text-gray-500" },
                        ...(stay.partner ? [{ label: stay.partner.name, bg: "bg-rose-50 border-rose-100 text-rose-600" }] : []),
                      ].map(({ label, bg }) => (
                        <span key={label} className={`border rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-medium ${bg}`} style={fontStyle}>{label}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); doPrint(stay); }} className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Printer size={10} className="sm:size-[12px] text-gray-400" /></button>
                    <button onClick={e => { e.stopPropagation(); doDownload(stay); }} className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Download size={10} className="sm:size-[12px] text-gray-400" /></button>
                    {isOpen ? <ChevronUp size={11} className="sm:size-[13px] text-gray-400 ml-0.5" /> : <ChevronDown size={11} className="sm:size-[13px] text-gray-400 ml-0.5" />}
                  </div>
                </div>
 
                {isOpen && (
                  <div className="border-t border-gray-100">
                    <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
                      {[
                        { key: "payments", label: "Payments", icon: <CreditCard size={8} className="sm:size-[10px]" /> },
                        { key: "documents", label: "Documents", icon: <FileText size={8} className="sm:size-[10px]" /> },
                        { key: "deposit", label: "Deposit", icon: <Shield size={8} className="sm:size-[10px]" /> },
                        { key: "terms", label: "Terms", icon: <ScrollText size={8} className="sm:size-[10px]" /> },
                        ...(stay.partner ? [{ key: "partner", label: "Partner", icon: <Heart size={8} className="sm:size-[10px]" /> }] : []),
                      ].map(t => (
                        <button
                          key={t.key}
                          onClick={() => setSectionMap(m => ({ ...m, [stay.id]: t.key }))}
                          className={`flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-bold whitespace-nowrap border-b-2 transition-colors ${
                            section === t.key ? "border-gray-900 text-gray-900 bg-white" : "border-transparent text-gray-400 hover:text-gray-600"
                          }`}
                          style={fontStyle}
                        >
                          {t.icon}{t.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-2 sm:p-3">
                      {section === "payments" && (
                        <div className="space-y-2">
                          {!stay.isCurrent && (
                            <p className="text-[8px] sm:text-[9px] text-gray-400 italic" style={fontStyle}>
                              Detailed transaction history isn't tracked per past stay — figures below are summarized from the vacate record.
                            </p>
                          )}
                          <div className="rounded-lg border border-gray-100 overflow-hidden">
                            <table className="w-full text-[10px] sm:text-[11px]">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                  {["Date", "Amount", "Type", "Mode", "Status"].map(h => (
                                    <th key={h} className="text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap" style={fontStyle}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {stayPayments.length === 0 ? (
                                  <tr><td colSpan={5} className="text-center py-6 text-gray-400 text-xs" style={fontStyle}>No payment records</td></tr>
                                ) : stayPayments.map((p: any) => {
                                  const approved = p.status === "approved" || p.status === "paid";
                                  const rejected = p.status === "rejected" || p.status === "failed";
                                  const typeKey = p.payment_type || "";
                                  return (
                                    <tr key={p.id} className={`border-t border-gray-50 hover:bg-gray-50/50 ${rejected ? "bg-red-50/20" : ""}`}>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-500 whitespace-nowrap">{p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                                      <td className={`px-2 sm:px-3 py-1.5 sm:py-2 font-bold whitespace-nowrap ${rejected ? "text-red-400 line-through" : "text-gray-900"}`}>{formatINR(p.amount || 0)}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"><span className={`px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${typeColor[typeKey] ?? "bg-gray-100 text-gray-600"}`}>{typeDisplay[typeKey] || typeKey || "—"}</span></td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-500 whitespace-nowrap capitalize">{p.payment_mode || "—"}</td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                                        {approved && <span className="flex items-center gap-1 font-bold text-emerald-600"><CheckCircle2 size={8} className="sm:size-[9px]" />{p.status === "paid" ? "Paid" : "Approved"}</span>}
                                        {rejected && <span className="flex items-center gap-1 font-bold text-red-500"><XCircle size={8} className="sm:size-[9px]" />{p.status === "failed" ? "Failed" : "Rejected"}</span>}
                                        {!approved && !rejected && <span className="flex items-center gap-1 font-bold text-amber-600"><Clock size={8} className="sm:size-[9px]" />{p.status ?? "Pending"}</span>}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-emerald-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                              <p className="text-[8px] sm:text-[9px] font-bold text-emerald-600 uppercase tracking-wider" style={fontStyle}>Rent Paid</p>
                              <p className="text-xs sm:text-sm font-black text-emerald-700">{formatINR(stayRentPaid)}</p>
                            </div>
                            <div className="bg-red-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                              <p className="text-[8px] sm:text-[9px] font-bold text-red-500 uppercase tracking-wider" style={fontStyle}>Penalty</p>
                              <p className="text-xs sm:text-sm font-black text-red-600">{formatINR(stay.totalPenalty || 0)}</p>
                            </div>
                          </div>
                        </div>
                      )}
 
                    {section === "documents" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { label: "ID Proof", type: tenant.id_proof_type, number: tenant.id_proof_number, url: tenant.id_proof_url },
                            { label: "Address Proof", type: tenant.address_proof_type, number: tenant.address_proof_number, url: tenant.address_proof_url },
                            { label: "Photograph", type: undefined, number: undefined, url: tenant.photo_url },
                          ].map(d => (
                            <div key={d.label} className={`rounded-lg border p-2 sm:p-2.5 ${!d.url ? "border-dashed border-gray-200 bg-gray-50" : "border-gray-100 bg-white"}`}>
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <FileText size={11} className="sm:size-[13px] text-blue-400" />
                                <BadgePill variant={d.url ? "blue" : "gray"}>{d.url ? "Uploaded" : "Not Uploaded"}</BadgePill>
                              </div>
                              <p className="text-[9px] sm:text-[10px] font-bold text-gray-700" style={fontStyle}>{d.label}</p>
                              {d.type && <p className="text-[8px] sm:text-[9px] text-gray-400" style={fontStyle}>{d.type}</p>}
                              {d.number && <p className="text-[8px] sm:text-[9px] font-mono text-gray-500 mt-0.5">#{d.number}</p>}
                            </div>
                          ))}
                        </div>
                      )}
 
                      {section === "deposit" && (
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            ["Security Deposit", formatINR(stay.securityDeposit), "text-gray-900"],
                            ["Deposit Paid", formatINR(stay.depositPaid), "text-emerald-600"],
                            ...(stay.isVacatedRecord ? [
                              ["Refund Amount", formatINR(stay.refundAmount ?? 0), "text-blue-600"],
                              ["Refund Status", stay.refundStatus ?? "N/A", "text-amber-600"],
                            ] : []),
                          ].map(([k, v, c]) => (
                            <div key={k} className="bg-gray-50 rounded-lg p-2 sm:p-2.5">
                              <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-wider font-bold" style={fontStyle}>{k}</p>
                              <p className={`text-xs sm:text-sm font-black mt-0.5 ${c}`} style={fontStyle}>{v}</p>
                            </div>
                          ))}
                        </div>
                      )}
 
                      {section === "terms" && (
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            ["Lock-in", stay.lockInPeriod],
                            ["Lock-in Penalty", tenant.lockin_penalty_amount ? (tenant.lockin_penalty_type === "percentage" ? `${tenant.lockin_penalty_amount}%` : formatINR(tenant.lockin_penalty_amount)) : "—"],
                            ["Notice", stay.noticePeriod],
                            ["Notice Penalty", tenant.notice_penalty_amount ? (tenant.notice_penalty_type === "percentage" ? `${tenant.notice_penalty_amount}%` : formatINR(tenant.notice_penalty_amount)) : "—"],
                          ].map(([k, v]) => (
                            <div key={k} className="bg-gray-50 rounded-lg p-2 sm:p-2.5">
                              <p className="text-[8px] sm:text-[9px] text-gray-400 uppercase tracking-wider font-bold" style={fontStyle}>{k}</p>
                              <p className="text-[10px] sm:text-xs font-bold text-gray-800 mt-0.5" style={fontStyle}>{v}</p>
                            </div>
                          ))}
                        </div>
                      )}
 
                      {section === "partner" && stay.partner && (
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            ["Name", stay.partner.name],
                            ["Phone", stay.partner.phone],
                            ["Relation", stay.partner.relation],
                          ].map(([k, v]) => (
                            <div key={k} className="bg-rose-50 rounded-lg p-2 sm:p-2.5">
                              <p className="text-[8px] sm:text-[9px] text-rose-400 uppercase tracking-wider font-bold" style={fontStyle}>{k}</p>
                              <p className="text-[10px] sm:text-xs font-bold text-gray-800 mt-0.5" style={fontStyle}>{v}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ID Card Modal ────────────────────────────────────────────────────────────
function TenantIdCard({ tenant, assignment, onClose }: { tenant: any; assignment: any; onClose: () => void }) {
  const aadharNum = tenant.aadhar_number ?? 
    (tenant.id_proof_type === "Aadhar Card" ? tenant.id_proof_number : null) ?? 
    (tenant.address_proof_type === "Aadhar Card" ? tenant.address_proof_number : null) ?? null;
  const panNum = tenant.pan_number ?? 
    (tenant.id_proof_type === "PAN Card" ? tenant.id_proof_number : null) ?? 
    (tenant.address_proof_type === "PAN Card" ? tenant.address_proof_number : null) ?? null;
  const maskedAadhar = aadharNum ? `XXXX XXXX ${String(aadharNum).replace(/\s/g, "").slice(-4)}` : null;
  const stay = {
    room: assignment?.room?.room_number || "—",
    bed: assignment?.bed_number || "—",
    property: assignment?.property?.name || "—",
    checkIn: tenant.check_in_date ? new Date(tenant.check_in_date).toLocaleDateString("en-IN") : "—",
    checkOut: tenant.vacate_records?.[0]?.requested_vacate_date ? new Date(tenant.vacate_records[0].requested_vacate_date).toLocaleDateString("en-IN") : null,
    isActive: tenant.is_active,
  };

  const handleShare = async () => {
    const text = `Resident ID Card\n${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}\nID: #${tenant.id}\nRoom: ${stay.room} · ${stay.property}\nPhone: ${tenant.country_code} ${tenant.phone}\nCheck-in: ${stay.checkIn}${stay.checkOut ? "\nVacated: " + stay.checkOut : ""}`;
    if (navigator.share) {
      await navigator.share({ title: "Resident ID Card", text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Details copied to clipboard!");
    }
  };

 

  // ─── Print / PDF helpers for TenantIdCard ──────────────────────────────
const buildCardHTML = () => {
   const aadharNum = tenant.aadhar_number ?? 
    (tenant.id_proof_type === "Aadhar Card" ? tenant.id_proof_number : null) ?? 
    (tenant.address_proof_type === "Aadhar Card" ? tenant.address_proof_number : null) ?? null;
  const panNum = tenant.pan_number ?? 
    (tenant.id_proof_type === "PAN Card" ? tenant.id_proof_number : null) ?? 
    (tenant.address_proof_type === "PAN Card" ? tenant.address_proof_number : null) ?? null;
  const maskedAadhar = aadharNum ? `XXXX XXXX ${String(aadharNum).replace(/\s/g, "").slice(-4)}` : null;
  const stay = {
    room: assignment?.room?.room_number || "—",
    bed: assignment?.bed_number || "—",
    property: assignment?.property?.name || "—",
    checkIn: tenant.check_in_date ? new Date(tenant.check_in_date).toLocaleDateString("en-IN") : "—",
    checkOut: tenant.vacate_records?.[0]?.requested_vacate_date
      ? new Date(tenant.vacate_records[0].requested_vacate_date).toLocaleDateString("en-IN")
      : null,
    isActive: tenant.is_active,
  };

  return `<!DOCTYPE html><html><head><title>Resident ID Card · ${tenant.full_name}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;padding:24px}
  .page{display:flex;flex-direction:column;gap:20px;align-items:center}
  .card{width:340px;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35)}
  .front{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%);padding:20px;position:relative;min-height:200px}
  .front-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
  .org{display:flex;align-items:center;gap:8px}
  .org-icon{width:28px;height:28px;background:#2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center}
  .org-icon svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .org-name{font-size:11px;font-weight:800;color:#fff;letter-spacing:.02em}
  .org-sub{font-size:8px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.07em;margin-top:1px}
  .id-tag{font-size:8px;font-weight:800;color:#64748b;letter-spacing:.08em;text-transform:uppercase;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:3px 8px;border-radius:6px}
  .profile-row{display:flex;align-items:center;gap:14px}
  .avatar{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;flex-shrink:0;box-shadow:0 4px 16px rgba(37,99,235,.5);border:2px solid rgba(255,255,255,.15)}
  .profile-info .name{font-size:16px;font-weight:900;color:#fff;line-height:1.1}
  .profile-info .sub{font-size:10px;color:#94a3b8;margin-top:3px}
  .profile-info .sub span{font-weight:700;color:#cbd5e1}
  .stripe{height:3px;background:linear-gradient(90deg,#2563eb,#06b6d4,#2563eb);border-radius:0;margin:14px -20px;width:calc(100% + 40px)}
  .fields{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin-top:2px}
  .field .lbl{font-size:7.5px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin-bottom:2px}
  .field .val{font-size:10.5px;font-weight:700;color:#e2e8f0;font-family:monospace}
  .field .val-normal{font-size:10px;font-weight:700;color:#e2e8f0;font-family:system-ui,sans-serif}
  .field-full{grid-column:span 2}
  .status-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:${stay.isActive ? "#10b981" : "#94a3b8"};margin-right:4px;vertical-align:middle}
  .back{background:#f8fafc;border:1.5px solid #e2e8f0;padding:18px;min-height:190px}
  .back-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:10px;border-bottom:1.5px solid #e2e8f0}
  .back-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#334155}
  .back-id{font-size:9px;font-weight:700;color:#94a3b8;font-family:monospace}
  .back-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;margin-bottom:12px}
  .bf .lbl{font-size:7.5px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-bottom:2px}
  .bf .val{font-size:10px;font-weight:700;color:#1e293b}
  .bf .val-mono{font-size:10px;font-weight:700;color:#1e293b;font-family:monospace}
  .bf-full{grid-column:span 2}
  .qr-section{display:flex;align-items:flex-end;justify-content:space-between;margin-top:auto;padding-top:10px;border-top:1.5px solid #e2e8f0}
  .qr-box{width:48px;height:48px;border:1.5px solid #e2e8f0;border-radius:8px;background:#f1f5f9;display:flex;align-items:center;justify-content:center}
  .qr-grid{display:grid;grid-template-columns:repeat(5,6px);grid-template-rows:repeat(5,6px);gap:1px}
  .qr-c{width:6px;height:6px;border-radius:1px}
  .disclaimer{font-size:8px;color:#94a3b8;line-height:1.4;max-width:220px}
  .disclaimer strong{color:#64748b}
  @media print{body{background:#fff;min-height:auto;padding:0}.page{gap:32px}.card{box-shadow:0 0 0 1.5px #e2e8f0}}
</style></head><body>
<div class="page">
  <div class="card">
    <div class="front">
      <div class="front-header">
        <div class="org">
          <div class="org-icon"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          <div><div class="org-name">Roomac Co-Living</div><div class="org-sub">Resident Identity Card</div></div>
        </div>
        <div class="id-tag">RESIDENT</div>
      </div>
      <div class="profile-row">
        <div class="avatar">${tenant.full_name?.charAt(0)?.toUpperCase() ?? "?"}</div>
        <div class="profile-info">
          <div class="name">${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}</div>
          <div class="sub">ID <span>#${tenant.id}</span> &nbsp;·&nbsp; <span class="status-dot"></span><span>${stay.isActive ? "Active" : "Inactive"}</span></div>
          <div class="sub" style="margin-top:2px">Room <span>${stay.room}</span> &nbsp;·&nbsp; <span>${stay.property}</span></div>
        </div>
      </div>
      <div class="stripe"></div>
      <div class="fields">
        <div class="field"><div class="lbl">Check-in</div><div class="val">${stay.checkIn}</div></div>
        <div class="field"><div class="lbl">${stay.checkOut ? "Vacated On" : "Valid Until"}</div><div class="val">${stay.checkOut ?? "Active"}</div></div>
        <div class="field"><div class="lbl">Bed</div><div class="val-normal">${stay.bed}</div></div>
        <div class="field"><div class="lbl">ID</div><div class="val-normal">#${tenant.id}</div></div>
        ${aadharNum ? `<div class="field field-full"><div class="lbl">Aadhar (partial)</div><div class="val">XXXX XXXX ${String(aadharNum).replace(/\s/g,"").slice(-4)}</div></div>` : ""}
      </div>
    </div>
  </div>
  <div class="card">
    <div class="back">
      <div class="back-header">
        <div class="back-title">Resident Details</div>
        <div class="back-id">#${tenant.id} · ${new Date().toLocaleDateString("en-IN",{month:"short",year:"numeric"})}</div>
      </div>
      <div class="back-fields">
        <div class="bf"><div class="lbl">Full Name</div><div class="val">${tenant.salutation ? `${tenant.salutation} ` : ""}${tenant.full_name}</div></div>
        <div class="bf"><div class="lbl">Gender</div><div class="val">${tenant.gender || "—"}</div></div>
        <div class="bf"><div class="lbl">Date of Birth</div><div class="val">${tenant.date_of_birth ? new Date(tenant.date_of_birth).toLocaleDateString("en-IN") : "—"}</div></div>
        <div class="bf"><div class="lbl">Phone</div><div class="val-mono">${tenant.country_code || ""} ${tenant.phone || "—"}</div></div>
        <div class="bf bf-full"><div class="lbl">Email</div><div class="val">${tenant.email || "—"}</div></div>
        ${aadharNum ? `<div class="bf"><div class="lbl">Aadhar No.</div><div class="val-mono">${maskedAadhar}</div></div>` : ""}
        ${panNum ? `<div class="bf"><div class="lbl">PAN No.</div><div class="val-mono">${panNum}</div></div>` : ""}
        <div class="bf bf-full"><div class="lbl">Address</div><div class="val">${tenant.address || "—"}</div></div>
        ${tenant.emergency_contact_name ? `<div class="bf bf-full"><div class="lbl">Emergency Contact</div><div class="val">${tenant.emergency_contact_name} · ${tenant.emergency_contact_phone || ""} (${tenant.emergency_contact_relation || ""})</div></div>` : ""}
      </div>
      <div class="qr-section">
        <div class="disclaimer"><strong>Roomac Co-Living</strong><br>This card is issued to the above resident. Valid for entry at the registered property only. Report loss immediately to the management.</div>
        <div class="qr-box">
          <div class="qr-grid">
            ${Array.from({length:25},(_,i)=>{const on=[0,1,2,3,4,5,6,10,14,15,16,17,18,19,20,24].includes(i);return `<div class="qr-c" style="background:${on?"#1e293b":"#f8fafc"}"></div>`;}).join("")}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</body></html>`;
};

const handlePrint = () => {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(buildCardHTML());
  w.document.close();
  w.print();
};

const handlePDF = () => {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(buildCardHTML());
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 400);
};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #0D2567, #1B3FA0)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F5A623] flex items-center justify-center"><IdCardIcon size={13} className="text-white" /></div>
            <div>
              <p className="text-xs font-black text-white" style={fontStyle}>Resident ID Card</p>
              <p className="text-[9px] text-blue-300" style={fontStyle}>#{tenant.id} · {tenant.full_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold transition-colors">✕</button>
        </div>

        <div className="p-5 bg-slate-50">
          <div className="rounded-2xl p-4 shadow-xl ring-1 ring-slate-700/50 mb-3" style={{ background: "linear-gradient(135deg, #0D2567 0%, #1B3FA0 60%, #0D2567 100%)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#F5A623] rounded-lg flex items-center justify-center"><Building2 size={11} className="text-white" /></div>
                <div>
                  <p className="text-[10px] font-black text-white" style={fontStyle}>Roomac Co-Living</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest" style={fontStyle}>Resident ID Card</p>
                </div>
              </div>
              <span className="text-[8px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded" style={fontStyle}>RESIDENT</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5A623] to-amber-500 flex items-center justify-center text-white font-black text-base shadow-lg flex-shrink-0 ring-2 ring-amber-500/30">
                {tenant.full_name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="text-sm font-black text-white leading-tight" style={fontStyle}>
                  {tenant.salutation ? `${tenant.salutation} ` : ""}{tenant.full_name}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5" style={fontStyle}>ID <span className="font-bold text-slate-300">#{tenant.id}</span> · {stay.room} · {stay.property}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${stay.isActive ? "bg-emerald-400" : "bg-slate-500"}`} />
                  <span className="text-[8px] font-bold text-slate-400" style={fontStyle}>{stay.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
            <div className="h-0.5 rounded-full mb-3 -mx-4" style={{ background: "linear-gradient(90deg, #F5A623, #fbbf24, #F5A623)" }} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider" style={fontStyle}>Check-in</p>
                <p className="text-[10px] font-bold text-slate-300 font-mono">{stay.checkIn}</p>
              </div>
              <div>
                <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider" style={fontStyle}>{stay.checkOut ? "Vacated" : "Bed"}</p>
                <p className="text-[10px] font-bold text-slate-300" style={fontStyle}>{stay.checkOut ?? stay.bed}</p>
              </div>
              {maskedAadhar && (
                <div className="col-span-2">
                  <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider" style={fontStyle}>Aadhar (last 4)</p>
                  <p className="text-[10px] font-bold text-slate-300 font-mono">{maskedAadhar}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Phone", value: `${tenant.country_code || ""} ${tenant.phone || "—"}`, mono: true },
              { label: "Aadhar", value: maskedAadhar ?? "Not uploaded", mono: true },
              { label: "PAN", value: panNum ?? "Not provided", mono: true },
              { label: "Emergency", value: tenant.emergency_contact_name ?? "—", mono: false },
            ].map(({ label, value, mono }) => (
              <div key={label} className="bg-white rounded-lg border border-slate-100 px-2.5 py-2">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest" style={fontStyle}>{label}</p>
                <p className={`text-[10px] font-bold text-slate-700 mt-0.5 truncate ${mono ? "font-mono" : ""}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

       <div className="px-5 pb-5 pt-1 grid grid-cols-3 gap-2">
  <button onClick={handlePrint} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700">
    <Printer size={16} />
    <span className="text-[9px] font-bold uppercase tracking-wider">Print</span>
  </button>
  <button onClick={handlePDF} className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:opacity-90 transition-colors text-white" style={{ background: "#0D2567" }}>
    <Download size={16} />
    <span className="text-[9px] font-bold uppercase tracking-wider">Save PDF</span>
  </button>
  <button onClick={handleShare} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#F5A623] hover:bg-amber-500 transition-colors text-white">
    <Share2 size={16} />
    <span className="text-[9px] font-bold uppercase tracking-wider">Share</span>
  </button>
</div>
        <p className="text-center text-[9px] text-slate-400 pb-3" style={fontStyle}>For security verification or tenant entry purposes</p>
      </div>
    </div>
  );
}

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string; icon: React.ReactNode; countKey?: string }[] = [
  { id: "overview",   label: "Overview",     icon: <User size={12} /> },
  { id: "documents",  label: "Documents",    icon: <FileText size={12} /> },
  { id: "payments",   label: "Payments",     icon: <CreditCard size={12} /> },
  { id: "partner",    label: "Partner",      icon: <Heart size={12} /> },
  { id: "history",    label: "Stay History", icon: <History size={12} />, countKey: "stayHistory" },
];

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tid = params.id as string;

  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState<PartnerDetails | null>(null);
  const [effectiveTenantIdForPayments, setEffectiveTenantIdForPayments] = useState<string | number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
const [editInitialTab, setEditInitialTab] = useState<string>("basic");

  useEffect(() => {
    if (tid) loadTenant();
  }, [tid]);

  useEffect(() => {
  if (tid && effectiveTenantIdForPayments) {
    loadPayments();
  }
}, [tid, effectiveTenantIdForPayments]);

  const loadTenant = async () => {
    try {
      setLoading(true);
      const r: any = await getTenantById(tid);
      if (r?.success && r.data) {
        let tenantData = r.data;
        const requestedId = parseInt(tid);
        const returnedId = tenantData.id;

        if (tenantData.is_couple_booking && requestedId !== returnedId) {
          tenantData = {
            ...tenantData,
            id: requestedId,
            salutation: tenantData.partner_salutation,
            full_name: tenantData.partner_full_name,
            email: tenantData.partner_email,
            phone: tenantData.partner_phone,
            country_code: tenantData.partner_country_code,
            gender: tenantData.partner_gender,
            date_of_birth: tenantData.partner_date_of_birth,
            address: tenantData.partner_address,
            occupation: tenantData.partner_occupation,
            organization: tenantData.partner_organization,
            partner_salutation: tenantData.salutation,
            partner_full_name: tenantData.full_name,
            partner_email: tenantData.email,
            partner_phone: tenantData.phone,
            partner_country_code: tenantData.country_code,
            partner_gender: tenantData.gender,
            partner_date_of_birth: tenantData.date_of_birth,
            partner_address: tenantData.address,
            partner_occupation: tenantData.occupation,
            partner_organization: tenantData.organization,
            partner_relationship: tenantData.partner_relationship || "Spouse",
            id_proof_url: tenantData.partner_id_proof_url,
            address_proof_url: tenantData.partner_address_proof_url,
            photo_url: tenantData.partner_photo_url,
            partner_id_proof_url: tenantData.id_proof_url,
            partner_address_proof_url: tenantData.address_proof_url,
            partner_photo_url: tenantData.photo_url,
            additional_documents: tenantData.partner_additional_documents || [],
            partner_additional_documents: tenantData.additional_documents || [],
          };
        }

        const vacateRecord = tenantData.vacate_records?.[0] ?? null;
        if (vacateRecord?.rent_amount) tenantData.vacate_rent_amount = vacateRecord.rent_amount;

        let assignmentData = null;
        let effectiveTenantIdForAssignment = tenantData.id;
        let foundAssignmentTenant = null;

        if (tenantData.is_couple_booking === 1 || tenantData.is_couple_booking === true) {
          try {
            let assignmentResult = await getTenantAssignment(tenantData.id);
            if (assignmentResult.success && assignmentResult.data) {
              const raw = Array.isArray(assignmentResult.data) ? assignmentResult.data[0] : assignmentResult.data;
              if (raw?.id) { effectiveTenantIdForAssignment = tenantData.id; foundAssignmentTenant = tenantData.id; }
            }
            if (!foundAssignmentTenant && tenantData.partner_tenant_id) {
              assignmentResult = await getTenantAssignment(tenantData.partner_tenant_id);
              if (assignmentResult.success && assignmentResult.data) {
                const raw = Array.isArray(assignmentResult.data) ? assignmentResult.data[0] : assignmentResult.data;
                if (raw?.id) { effectiveTenantIdForAssignment = tenantData.partner_tenant_id; foundAssignmentTenant = tenantData.partner_tenant_id; }
              }
            }
            if (!foundAssignmentTenant && tenantData.couple_id) {
              try {
                const primaryResult = await getPrimaryTenantByCoupleId(tenantData.couple_id);
                if (primaryResult.success && primaryResult.data) {
                  const pid = primaryResult.data.id;
                  assignmentResult = await getTenantAssignment(pid);
                  if (assignmentResult.success && assignmentResult.data) {
                    const raw = Array.isArray(assignmentResult.data) ? assignmentResult.data[0] : assignmentResult.data;
                    if (raw?.id) { effectiveTenantIdForAssignment = pid; foundAssignmentTenant = pid; }
                  }
                }
              } catch {}
            }
          } catch {}
        } else {
          const assignmentResult = await getTenantAssignment(tenantData.id);
          if (assignmentResult.success && assignmentResult.data) {
            const raw = Array.isArray(assignmentResult.data) ? assignmentResult.data[0] : assignmentResult.data;
            if (raw?.id) { effectiveTenantIdForAssignment = tenantData.id; foundAssignmentTenant = tenantData.id; }
          }
        }

        // Payments always use tenant's own ID
        setEffectiveTenantIdForPayments(tenantData.id);

        if (vacateRecord) {
          try {
            const bedRes = await fetch(`/api/rooms/bed-assignments/${vacateRecord.bed_assignment_id}`);
            const bedResult = await bedRes.json();
            if (bedResult.success && bedResult.data) {
              const bedData = bedResult.data;
              const roomRes = await fetch(`/api/rooms/${bedData.room_id}`);
              const roomResult = await roomRes.json();
              if (roomResult.success && roomResult.data) {
                const roomData = roomResult.data;
                const propRes = await fetch(`/api/properties/${roomData.property_id}`);
                const propResult = await propRes.json();
                assignmentData = {
                  id: bedData.id, bed_number: bedData.bed_number, bed_type: bedData.bed_type,
                  tenant_rent: bedData.tenant_rent, security_deposit: raw.security_deposit, is_couple: bedData.is_couple === 1,
                  is_vacated: true, vacated_date: vacateRecord.requested_vacate_date,
                  room: { id: roomData.id, room_number: roomData.room_number, floor: roomData.floor, sharing_type: roomData.sharing_type },
                  property: { id: propResult.data.id, name: propResult.data.name, address: propResult.data.address },
                };
              }
            }
          } catch {}
        } else {
          const assignmentResult = await getTenantAssignment(effectiveTenantIdForAssignment);
          if (assignmentResult.success && assignmentResult.data) {
            let raw = assignmentResult.data;
            if (Array.isArray(raw) && raw.length > 0) raw = raw[0];
            if (raw?.id) {
              assignmentData = {
                id: raw.id, bed_number: raw.bed_number, bed_type: raw.bed_type,
                tenant_rent: raw.tenant_rent,security_deposit: raw.security_deposit, is_couple: raw.is_couple === 1 || raw.is_couple === true,
                room: { id: raw.room?.id || raw.room_id, room_number: raw.room?.room_number || raw.room_number, floor: raw.room?.floor || raw.floor, sharing_type: raw.room?.sharing_type || raw.sharing_type },
                property: { id: raw.property?.id || raw.property_id, name: raw.property?.name || raw.property_name },
              };
              if (tenantData.is_primary_tenant === 0 && assignmentData.tenant_rent) {
                tenantData.monthly_rent = assignmentData.tenant_rent;
              }
            }
          }
        }

        setAssignment(assignmentData);
        setTenant(tenantData);

        if (tenantData.partner_full_name) {
          setPartnerDetails({
            salutation: tenantData.partner_salutation || "Mr.",
            full_name: tenantData.partner_full_name || "",
            country_code: tenantData.partner_country_code || "",
            phone: tenantData.partner_phone || "",
            email: tenantData.partner_email || "",
            gender: tenantData.partner_gender || "",
            date_of_birth: tenantData.partner_date_of_birth || "",
            address: tenantData.partner_address || "",
            occupation: tenantData.partner_occupation || "",
            organization: tenantData.partner_organization || "",
            relationship: tenantData.partner_relationship || "Spouse",
            id_proof_type: tenantData.partner_id_proof_type || "",
            id_proof_number: tenantData.partner_id_proof_number || "",
            id_proof_url: tenantData.partner_id_proof_url || null,
            address_proof_type: tenantData.partner_address_proof_type || "",
            address_proof_number: tenantData.partner_address_proof_number || "",
            address_proof_url: tenantData.partner_address_proof_url || null,
            photo_url: tenantData.partner_photo_url || null,
          });
        }
      } else {
        setError("Failed to load tenant details");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching tenant details");
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const paymentTenantId = effectiveTenantIdForPayments || tid;
      if (!paymentTenantId) { setLoadingPayments(false); return; }
      const formResult = await paymentApi.getTenantPaymentFormData(paymentTenantId.toString());
      if (formResult.success && formResult.data) {
        setPaymentSummary(formResult.data);
        const paymentsData: any = await request(`/api/payments/tenant/${paymentTenantId}`);
        if (paymentsData.success) setPayments(paymentsData.data || []);
        else setPayments([]);
      } else {
        setPaymentSummary(null);
        setPayments([]);
      }
    } catch {
      setPaymentSummary(null);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const viewDoc = (url: string) => {
    if (!url) { toast.error("Document not available"); return; }
    viewDocument(url);
  };

  const previewReceipt = async (id: number) => {
    try {
      toast.loading("Loading receipt...", { id: "receipt-preview" });
      const response = await fetch(`${getApiUrl()}/api/payments/receipts/${id}/preview-pdf`);
      if (!response.ok) throw new Error("Failed to load receipt");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const modal = document.createElement("div");
      modal.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;";
      const modalContent = document.createElement("div");
      modalContent.style.cssText = "width:720px;max-width:90vw;height:90vh;background:white;border-radius:12px;position:relative;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.2);";
      const headerBar = document.createElement("div");
      headerBar.style.cssText = "padding:12px 20px;background:#1B3FA0;color:white;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;";
      headerBar.innerHTML = `<span style="font-weight:600;font-size:14px;">Payment Receipt</span><button id="closePreviewBtn" style="background:none;border:none;color:white;cursor:pointer;font-size:20px;">&times;</button>`;
      const pdfViewer = document.createElement("iframe");
      pdfViewer.style.cssText = "width:100%;flex:1;border:none;";
      pdfViewer.src = url;
      modalContent.appendChild(headerBar);
      modalContent.appendChild(pdfViewer);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      const closeBtn = headerBar.querySelector("#closePreviewBtn");
      closeBtn?.addEventListener("click", () => { URL.revokeObjectURL(url); modal.remove(); toast.dismiss("receipt-preview"); });
      modal.onclick = (e) => { if (e.target === modal) { URL.revokeObjectURL(url); modal.remove(); toast.dismiss("receipt-preview"); } };
      toast.dismiss("receipt-preview");
      toast.success("Receipt loaded");
    } catch {
      toast.dismiss("receipt-preview");
      toast.error("Failed to load receipt preview");
    }
  };

  const downloadReceipt = (id: number) => window.open(`/api/payments/receipts/${id}/download`, "_blank");

  const handleCopyEmail = async () => {
    if (!tenant?.email) return;
    await navigator.clipboard.writeText(tenant.email);
    setCopiedEmail(true);
    toast.success("Email copied!");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = async () => {
    if (!tenant?.phone) return;
    await navigator.clipboard.writeText(`${tenant.country_code}${tenant.phone}`);
    setCopiedPhone(true);
    toast.success("Phone copied!");
    setTimeout(() => setCopiedPhone(false), 2000);
  };

 const handleEdit = () => {
  setEditInitialTab("basic");
  setIsEditOpen(true);
};

const handleUploadDoc = (docType: string) => {
  setEditInitialTab("documents"); // jumps straight to Documents tab
  setIsEditOpen(true);
};

  if (loading) return <LoadingSkeleton />;

  if (error || !tenant) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-xl border border-slate-100">
        <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-white" />
        </div>
        <p className="font-bold text-lg text-slate-900 mb-2" style={fontStyle}>Tenant Not Found</p>
        <p className="text-sm text-slate-500 mb-6" style={fontStyle}>{error || "The tenant doesn't exist or has been removed."}</p>
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm hover:opacity-90 transition-all" style={{ background: "#1B3FA0", ...fontStyle }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );

  const vacateRecord = tenant.vacate_records?.[0] ?? null;

  const rentVal = (() => {
    if (vacateRecord?.rent_amount) return formatINR(vacateRecord.rent_amount);
    if (assignment?.tenant_rent) return formatINR(assignment.tenant_rent);
    if (tenant.monthly_rent) return formatINR(tenant.monthly_rent);
    return "N/A";
  })();

  const roomVal = (() => {
    if (assignment) return `Room ${assignment.room?.room_number || "—"} · Bed ${assignment.bed_number || "—"}`;
    if (tenant.bed_number) return `Room ${tenant.room_number || "—"} · Bed ${tenant.bed_number}`;
    return "Not Assigned";
  })();

  return (
    <div className=" bg-slate-100" style={fontStyle}>
      <div className="max-w-9xl mx-auto px-2 sm:px-2 py-4 space-y-3">

        {/* ── Tenant Header (Roomac brand dark) ── */}
     <div className="rounded-xl shadow-lg overflow-hidden border border-[#0D2567]/40" style={{ background: "linear-gradient(135deg, #0D2567 0%, #1B3FA0 100%)" }}>
  <div className="overflow-x-auto">
    <div className="flex items-stretch min-h-[50px] sm:min-h-[60px] flex-nowrap w-max sm:w-full px-2 sm:px-0 py-2 sm:py-0">

      {/* Left — back + identity */}
      <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 flex-shrink-0 border-r border-white/10">
        <button onClick={() => router.back()}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white flex-shrink-0">
          <ArrowLeft size={11} className="sm:size-[13px]" />
        </button>
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-lg ring-2 ring-[#F5A623]/40"
            style={{ background: "linear-gradient(135deg, #F5A623, #d97706)" }}>
            {tenant.photo_url ? (
              <img src={resolveUrl(tenant.photo_url)} alt={tenant.full_name} className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            ) : tenant.full_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-[#0D2567] ${tenant.is_active ? "bg-emerald-400" : "bg-slate-500"}`} />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] sm:text-sm font-black text-white whitespace-nowrap block">
            {tenant.salutation ? `${tenant.salutation} ` : ""}{tenant.full_name}
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
            <BadgePill variant={tenant.is_active ? "green" : vacateRecord ? "red" : "gray"}>
              {tenant.is_active ? "Active" : vacateRecord ? "Vacated" : "Inactive"}
            </BadgePill>
            <span className="text-[8px] sm:text-[9px] text-blue-300 font-mono">#{tenant.id}</span>
          </div>
        </div>
      </div>

      {/* Centre — stat pills (flex row on mobile, grid on desktop) */}
      <div className="flex-1 flex flex-nowrap sm:grid sm:grid-cols-4 divide-x divide-white/10 min-w-0">
        {[
          { title: "Member Since", value: tenant.check_in_date ? new Date(tenant.check_in_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A", icon: <CalendarDays size={9} className="sm:size-[11px]" />, color: "text-[#F5A623]" },
          { title: "Monthly Rent", value: rentVal, icon: <IndianRupee size={9} className="sm:size-[11px]" />, color: "text-emerald-400" },
          { title: "Room / Bed", value: roomVal, icon: <BedDouble size={9} className="sm:size-[11px]" />, color: "text-violet-300" },
          { title: "Property", value: assignment?.property?.name || tenant.assigned_property_name || "Not Assigned", icon: <Building2 size={9} className="sm:size-[11px]" />, color: "text-amber-300" },
        ].map(({ title, value, icon, color }) => (
          <div key={title} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 hover:bg-white/5 transition-colors min-w-0 flex-shrink-0">
            <span className={`flex-shrink-0 ${color}`}>{icon}</span>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] font-bold text-blue-300 uppercase tracking-widest truncate">{title}</p>
              <p className="text-[10px] sm:text-[11px] font-bold text-white truncate mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Right — created + vacated */}
      <div className="flex flex-col justify-center items-end gap-1 px-2 sm:px-4 py-2 sm:py-3 flex-shrink-0 border-l border-white/10">
        <div className="flex flex-col items-end gap-0.5">
          <p className="text-[8px] sm:text-[9px] font-bold text-blue-300 uppercase tracking-widest">Created</p>
          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-bold text-white">
            <Calendar size={8} className="sm:size-[10px] text-blue-300" />
            {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
          </div>
        </div>
        {vacateRecord && (
          <div className="flex flex-col items-end gap-0.5">
            <p className="text-[8px] sm:text-[9px] font-bold text-blue-300 uppercase tracking-widest">Vacated</p>
            <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-bold text-red-400">
              <LogOut size={8} className="sm:size-[10px]" />
              {new Date(vacateRecord.requested_vacate_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

        {/* ── Tab content ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto max-h-[520px]">
          <div className="border-b border-slate-100 overflow-x-auto sticky top-0 z-10" style={{ background: "#f8fafc" }}>
            <div className="flex min-w-max px-1 pt-1 sticky top-0 z-10">
              {TABS.map(tab => {
                const stayCount = tab.countKey === "stayHistory"
                  ? (tenant?.vacate_records?.length ?? 0) + (tenant?.is_active && !(tenant?.vacate_records?.length > 0) ? 1 : 0)
                  : 0;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold rounded-t-lg mr-0.5 transition-all border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-[#1B3FA0] bg-white shadow-sm"
                        : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-white/70"
                    }`}
                    style={{ borderBottomColor: activeTab === tab.id ? "#1B3FA0" : "transparent", ...fontStyle }}
                  >
                    {tab.icon} {tab.label}
                    {tab.countKey && stayCount > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#1B3FA0] text-white">
                        {stayCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4">
            {activeTab === "overview" && (
              <OverviewTab
                tenant={tenant}
                assignment={assignment}
                    paymentSummary={paymentSummary}
 payments={payments} 
                onIdCard={() => setShowIdCard(true)}
                onEdit={handleEdit}
                copiedEmail={copiedEmail}
                copiedPhone={copiedPhone}
                onCopyEmail={handleCopyEmail}
                onCopyPhone={handleCopyPhone}
              />
            )}
{activeTab === "documents" && (
  <DocumentsTab tenant={tenant} onView={viewDoc} onUpload={handleUploadDoc} />
)}            {activeTab === "payments" && (
              <PaymentsTab
                payments={payments}
                paymentSummary={paymentSummary}
                loadingPayments={loadingPayments}
                onPreviewReceipt={previewReceipt}
                onDownloadReceipt={downloadReceipt}
              />
            )}
            {activeTab === "partner" && <PartnerTab partnerDetails={partnerDetails} onView={viewDoc} />}
{activeTab === "history" && (
  <HistoryTab
    tenant={tenant}
    assignment={assignment}
    payments={payments}
    paymentSummary={paymentSummary}
  />
)}          </div>
        </div>
      </div>

{isEditOpen && (
  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
    <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">
      {/* Visible header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0">
        <DialogTitle className="text-sm md:text-base font-semibold text-white">
          Edit Tenant: {tenant?.full_name || ""}
        </DialogTitle>
        <button
          onClick={() => setIsEditOpen(false)}
          className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto">
        <TenantForm
          tenant={tenant}
          initialTab={editInitialTab}
          onSuccess={async () => {
            setIsEditOpen(false);
            await loadTenant();
          }}
          onCancel={() => setIsEditOpen(false)}
        />
      </div>
    </DialogContent>
  </Dialog>
)}
      {showIdCard && <TenantIdCard tenant={tenant} assignment={assignment} onClose={() => setShowIdCard(false)} />}
    </div>
  );
}