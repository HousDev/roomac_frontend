// components/admin/rooms/VacateBedWizard.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Check,
  Calendar,
  UserMinus,
  Loader2,
  Info,
  CheckCircle,
  FileText,
  Clock,
  AlertTriangle,
  X,
  Bell,
  CalendarIcon,
  Lock,
  Shield,
  UsersRound,
  Heart, // Add this line
} from "lucide-react";
import { toast } from "sonner";
import { vacateApi } from "@/lib/vacateApi";
import { getMyTenantRequests } from "@/lib/tenantRequestsApi";
import { updateBedAssignment } from "@/lib/roomsApi";
import { consumeMasters } from "@/lib/masterApi";

interface MasterValue {
  id: number;
  name: string;
  isactive: number;
}

interface TenantWithSelection {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  is_primary: boolean;
  selected: boolean;
  partner_details?: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    gender: string;
    relationship: string;
  };
}

export function VacateBedWizard({
  open,
  onOpenChange,
  bedAssignment,
  tenantDetails,
  onVacateComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bedAssignment: any;
  tenantDetails: any;
  onVacateComplete?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [calculation, setCalculation] = useState<any>(null);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lockinStatus, setLockinStatus] = useState<any>(null);
  const [existingVacateRequest, setExistingVacateRequest] = useState<any>(null);
  const [wizardDisabled, setWizardDisabled] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
const [isCoupleBooking, setIsCoupleBooking] = useState(false);

  // Master data states
  const [roomsMasters, setRoomsMasters] = useState<
    Record<string, MasterValue[]>
  >({});
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [vacateReasons, setVacateReasons] = useState<any[]>([]);

  // Store tenant vacate request details
  const [tenantVacateData, setTenantVacateData] = useState<any>(null);
  const [noticeGivenByTenant, setNoticeGivenByTenant] =
    useState<boolean>(false);
  const [lockinAcceptedByTenant, setLockinAcceptedByTenant] =
    useState<boolean>(false);
  const [tenantVacateDate, setTenantVacateDate] = useState<string>("");
  const [tenantRequestDate, setTenantRequestDate] = useState<string>("");
  const [tenantVacateReason, setTenantVacateReason] = useState<string>("");
  const [tenantVacateReasonId, setTenantVacateReasonId] = useState<
    number | null
  >(null);
  const [tenantAgreedToTerms, setTenantAgreedToTerms] =
    useState<boolean>(false);
  const [noticePeriodStatus, setNoticePeriodStatus] = useState<any>(null);
  const [isAdminOverride, setIsAdminOverride] = useState(false);
  // Add this with your other state declarations
  const initialDataLoadedRef = useRef(false);
  const [tenantsToVacate, setTenantsToVacate] = useState<TenantWithSelection[]>(
    [],
  );
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [partnerTenant, setPartnerTenant] = useState<any>(null);
  // Add this with your other state declarations (around line 60-80)
const [securityDeposit, setSecurityDeposit] = useState<number>(0);

  // Form state
  const [formData, setFormData] = useState({
    vacateReasonValue: "",
    isNoticeGiven: false,
    noticeGivenDate: "",
    requestedVacateDate: "",
    adminApproved: false,
    lockinPenaltyApplied: false,
    noticePenaltyApplied: false,
    finalPenaltyAmount: 0,
    securityRefundAmount: 0,
    tenantAgreedToTerms: false,
  });

  // Add this near the top of your component or in a utility file
  const checkTenantAuth = () => {
    if (typeof window === "undefined") return false;

    const tenantToken = localStorage.getItem("tenant_token");

    if (!tenantToken) {
      console.warn("⚠️ No tenant token found - tenant requests will fail");
      return false;
    }

    return true;
  };

  // Fetch rooms masters for vacate reasons
const fetchRoomsMasters = async () => {
  setLoadingMasters(true);
  try {
    const res = await consumeMasters({ tab: "Rooms" });
    if (res?.success && res.data) {
      const grouped: Record<string, MasterValue[]> = {};
      res.data.forEach((item: any) => {
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

      // Set vacate reasons from masters
      if (grouped["Vacate Reason"] && grouped["Vacate Reason"].length > 0) {
        const reasons = grouped["Vacate Reason"].map((reason) => ({
          id: reason.id,
          value: reason.name,
        }));
        setVacateReasons(reasons);
        
        // ✅ After setting vacateReasons, check for existing request
        if (open && bedAssignment) {
          await checkForExistingRequest();
        }
      } else {
        // Even if no reasons, still check for existing request
        if (open && bedAssignment) {
          await checkForExistingRequest();
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch rooms masters:", error);
    toast.error("Failed to load vacate reasons");
    // Still try to check for existing request
    if (open && bedAssignment) {
      await checkForExistingRequest();
    }
  } finally {
    setLoadingMasters(false);
  }
};

  // Reset when wizard opens
  useEffect(() => {
    if (open && bedAssignment) {
      fetchRoomsMasters();
     
    } else if (!open) {
      resetWizard();
    }
  }, [open, bedAssignment]);

  // Load initial data
  useEffect(() => {
    if (open && bedAssignment && existingVacateRequest !== undefined) {
      loadInitialData();
    }
  }, [open, bedAssignment, existingVacateRequest]);

  // **CRITICAL FIX: Set tenant date immediately when available**
  useEffect(() => {
    if (tenantVacateDate && open) {
      const formattedDate = formatDateForInput(tenantVacateDate);

      setFormData((prev) => ({
        ...prev,
        requestedVacateDate: formattedDate,
      }));
    }
  }, [tenantVacateDate, open]);

  // Also update form when we have all tenant data
  useEffect(() => {
    if (tenantVacateData && initialData && open) {
      updateFormWithTenantData();
    }
  }, [tenantVacateData, initialData, open]);

  // Check lock-in status
  useEffect(() => {
    if (initialData && formData.requestedVacateDate) {
      checkLockinStatus();
    }
  }, [initialData, formData.requestedVacateDate]);

  // Recalculate notice period when dates change
  useEffect(() => {
    if (
      initialData &&
      (tenantRequestDate ||
        formData.noticeGivenDate ||
        formData.requestedVacateDate)
    ) {
      const status = calculateNoticePeriodStatus();
      setNoticePeriodStatus(status);
    }
  }, [
    initialData,
    tenantRequestDate,
    formData.noticeGivenDate,
    formData.isNoticeGiven,
    formData.requestedVacateDate,
  ]);

  // Add this useEffect to calculate terms agreement based on lock-in completion status
  useEffect(() => {
    if (lockinStatus !== null) {
      // Lock-in is considered "accepted" if:
      // 1. Tenant accepted it, OR
      // 2. Lock-in period is already completed (no penalty anyway)
      const isLockinCompleted = lockinStatus.isCompleted || false;
      const effectiveLockinAccepted =
        lockinAcceptedByTenant || isLockinCompleted;

      // Notice is considered "accepted" if tenant accepted it
      const effectiveNoticeAccepted = noticeGivenByTenant;

      const termsAgreed = effectiveLockinAccepted && effectiveNoticeAccepted;
      setTenantAgreedToTerms(termsAgreed);

      // Update form data
      setFormData((prev) => ({
        ...prev,
        tenantAgreedToTerms: termsAgreed,
      }));
    }
  }, [lockinStatus, lockinAcceptedByTenant, noticeGivenByTenant]);
  // Helper to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  // Function to extract tenant vacate request details
  // const extractTenantVacateData = async (requests: any[]) => {
  //   const vacateRequests = requests.filter(request => {
  //     const isVacateBed = request.request_type === 'vacate_bed';
  //     const isForCurrentTenant = request.tenant_id === tenantDetails?.id;
  //     const isActiveStatus = ['pending', 'in_progress', 'approved'].includes(request.status);
  //     return isVacateBed && isForCurrentTenant && isActiveStatus;
  //   });

  //   if (vacateRequests.length > 0) {
  //     const latestRequest = vacateRequests[0];

  //     const vacateData = latestRequest.vacate_data || {};

  //     if (vacateData.expected_vacate_date) {
  //       const tenantDate = vacateData.expected_vacate_date;
  //       setTenantVacateDate(tenantDate);
  //     }

  //     // Set tenant request date
  //     if (latestRequest.created_at) {
  //       const requestDate = latestRequest.created_at.split('T')[0];
  //       setTenantRequestDate(requestDate);
  //     }

  //     // Parse boolean values correctly
  //     const parseBoolean = (value: any): boolean => {
  //       if (value === 1 || value === '1' || value === true || value === 'true') return true;
  //       if (value === 0 || value === '0' || value === false || value === 'false') return false;
  //       return false;
  //     };

  //     // Check if tenant accepted penalties
  //     const lockinAccepted = parseBoolean(
  //       vacateData.lockin_penalty_accepted ??
  //       latestRequest.lockin_penalty_accepted
  //     );

  //     const noticeAccepted = parseBoolean(
  //       vacateData.notice_penalty_accepted ??
  //       latestRequest.notice_penalty_accepted
  //     );

  //     setLockinAcceptedByTenant(lockinAccepted);
  //     setNoticeGivenByTenant(noticeAccepted);

  //     // Tenant agrees to terms if they accepted BOTH penalties
  //     const termsAgreed = lockinAccepted && noticeAccepted;
  //     setTenantAgreedToTerms(termsAgreed);

  //     // Store reason ID for later lookup
  //     if (vacateData.primary_reason_id || latestRequest.primary_reason_id) {
  //       const reasonId = vacateData.primary_reason_id || latestRequest.primary_reason_id;
  //       setTenantVacateReasonId(reasonId);
  //     }

  //     setTenantVacateData(latestRequest);
  //     return latestRequest;
  //   }

  //   return null;
  // };
  // Add this helper function in VacateBedWizard.tsx
  const checkIfLockinCompleted = async (): Promise<boolean> => {
    try {
      if (!initialData?.bedAssignment) return false;

      const checkInDateStr = initialData.bedAssignment.check_in_date;
      const lockinMonths = initialData.bedAssignment.lockin_period_months || 0;

      if (!checkInDateStr || lockinMonths === 0) {
        return true; // No lock-in period = automatically completed
      }

      const checkIn = new Date(checkInDateStr);
      const currentDate = new Date();

      // Calculate lock-in end date
      const lockInEndDate = new Date(checkIn);
      lockInEndDate.setMonth(checkIn.getMonth() + lockinMonths);

      // Normalize dates
      const normalizedLockInEndDate = new Date(
        lockInEndDate.getFullYear(),
        lockInEndDate.getMonth(),
        lockInEndDate.getDate(),
      );
      const normalizedCurrentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      );

      // Completed if current date >= lock-in end date
      return normalizedCurrentDate >= normalizedLockInEndDate;
    } catch (error) {
      console.error("Error checking lock-in completion:", error);
      return false;
    }
  };

const extractTenantVacateData = async (vacateRequests: any[]) => {
  if (!vacateRequests || vacateRequests.length === 0) return null;

  const latestRequest = vacateRequests[0];
  
  // console.log("🔍 Extracting vacate data from request:", latestRequest);

  // Store the full request object with the correct ID field
  // The API returns vacate_request_id, not id
  const requestWithId = {
    ...latestRequest,
    id: latestRequest.vacate_request_id, // Map vacate_request_id to id for consistent display
    status: latestRequest.request_status, // Map request_status to status
    created_at: latestRequest.vacate_request_date || latestRequest.request_created,
  };
  
  setTenantVacateData(requestWithId);
  
  // Set tenant requested vacate date (use expected_vacate_date)
  if (latestRequest.expected_vacate_date) {
    const tenantDate = latestRequest.expected_vacate_date;
    setTenantVacateDate(tenantDate);
    
    // Also set the form date to tenant's requested date
    const formattedDate = formatDateForInput(tenantDate);
    setFormData((prev) => ({
      ...prev,
      requestedVacateDate: formattedDate,
    }));
  }

  // Set tenant request date (when they submitted - use vacate_request_date)
  if (latestRequest.vacate_request_date) {
    const requestDate = latestRequest.vacate_request_date.split("T")[0];
    setTenantRequestDate(requestDate);
  } else if (latestRequest.request_created) {
    const requestDate = latestRequest.request_created.split("T")[0];
    setTenantRequestDate(requestDate);
  }

  // Parse boolean values correctly from the request
  const parseBoolean = (value: any): boolean => {
    if (value === 1 || value === "1" || value === true || value === "true")
      return true;
    if (value === 0 || value === "0" || value === false || value === "false")
      return false;
    return false;
  };

  // Get lock-in and notice acceptance from the request
  const lockinAcceptedFromTenant = parseBoolean(latestRequest.lockin_penalty_accepted);
  const noticeAcceptedFromTenant = parseBoolean(latestRequest.notice_penalty_accepted);

  setLockinAcceptedByTenant(lockinAcceptedFromTenant);
  setNoticeGivenByTenant(noticeAcceptedFromTenant);

  // Check if lock-in is actually completed
  const isLockinCompleted = await checkIfLockinCompleted();

  // Effective acceptance status
  const effectiveLockinAccepted = lockinAcceptedFromTenant || isLockinCompleted;
  const effectiveNoticeAccepted = noticeAcceptedFromTenant;
  const termsAgreed = effectiveLockinAccepted && effectiveNoticeAccepted;
  setTenantAgreedToTerms(termsAgreed);

  // Store reason ID and reason text from the request
  const reasonId = latestRequest.primary_reason_id;
  const reasonText = latestRequest.primary_reason;
  
  if (reasonId) {
    setTenantVacateReasonId(reasonId);
    
    // Try to get the reason text from masters
    const reason = vacateReasons.find((r: any) => r.id === reasonId);
    if (reason) {
      setTenantVacateReason(reason.value);
      setFormData((prev) => ({
        ...prev,
        vacateReasonValue: reason.value,
      }));
    }
  } else if (reasonText) {
    setTenantVacateReason(reasonText);
    setFormData((prev) => ({
      ...prev,
      vacateReasonValue: reasonText,
    }));
  }

  // Also store secondary reasons if needed
  // if (latestRequest.secondary_reasons && latestRequest.secondary_reasons.length > 0) {
  //   // console.log("Secondary reasons:", latestRequest.secondary_reasons);
  // }

  return requestWithId;
};

// Helper to safely decode JSON data from vacate request
const decodeVacateData = (data: any) => {
  if (!data) return {};
  
  // If it's already an object, return it
  if (typeof data === 'object') return data;
  
  // If it's a string, try to parse it
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing vacate_data:", e);
      return {};
    }
  }
  
  return {};
};
  // Function to update form with tenant data
  const updateFormWithTenantData = () => {
    if (!initialData || !tenantVacateData) return;

    const newFormData = { ...formData };

    // Date already handled by useEffect above

    // Set notice given date to request date
    if (tenantRequestDate) {
      newFormData.noticeGivenDate = tenantRequestDate;
      newFormData.isNoticeGiven = noticeGivenByTenant;
    }

    // Set vacate reason from ID using masters data
    if (tenantVacateReasonId && vacateReasons.length > 0) {
      const reason = vacateReasons.find(
        (r: any) => r.id === tenantVacateReasonId,
      );
      if (reason) {
        setTenantVacateReason(reason.value);
        newFormData.vacateReasonValue = reason.value;
      }
    }

    // Set tenant agreed to terms
    newFormData.tenantAgreedToTerms = tenantAgreedToTerms;

    setFormData(newFormData);
  };

  // Function to check for existing vacate requests
  // const checkForExistingRequest = async () => {
  //   try {
  //     setIsCheckingExisting(true);

  //     const allRequests = await getMyTenantRequests();

  //     if (!Array.isArray(allRequests)) {
  //       console.error('❌ getMyTenantRequests did not return an array:', allRequests);
  //       setExistingVacateRequest(null);
  //       setWizardDisabled(false);
  //       return;
  //     }

  //     const tenantRequest = await extractTenantVacateData(allRequests);

  //     if (tenantRequest) {
  //       setExistingVacateRequest(tenantRequest);
  //       toast.info("Tenant vacate request found", {
  //         description: "Loading tenant's vacate request details...",
  //         duration: 2000
  //       });
  //     } else {
  //       setExistingVacateRequest(null);
  //     }

  //     setWizardDisabled(false);

  //   } catch (error) {
  //     console.error("❌ Error checking existing request:", error);
  //     setExistingVacateRequest(null);
  //     setWizardDisabled(false);
  //   } finally {
  //     setIsCheckingExisting(false);
  //   }
  // };

  // In VacateBedWizard.tsx, update the checkForExistingRequest function with better error logging:

const checkForExistingRequest = async () => {
  try {
    setIsCheckingExisting(true);
    setWizardDisabled(true);

    // ✅ FIX: Try multiple possible token storage keys
    let adminToken = localStorage.getItem("auth_token");
    
    if (!adminToken) {
      adminToken = localStorage.getItem("admin_token");
    }
    
    if (!adminToken) {
      adminToken = localStorage.getItem("token");
    }
    
    if (!adminToken) {
      console.warn("⚠️ No admin token found");
      setExistingVacateRequest(null);
      setWizardDisabled(false);
      return;
    }

    // Call the admin API to get vacate requests for this specific tenant
    // console.log(`🔍 Fetching vacate requests for tenant: ${tenantDetails?.id}`);
    const response = await fetch(
      `/api/admin/vacate-requests?tenant_id=${tenantDetails?.id}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 401) {
      console.error("❌ Unauthorized - token invalid");
      setExistingVacateRequest(null);
      setWizardDisabled(false);
      return;
    }

    const result = await response.json();
    // console.log("🔍 Admin vacate requests response:", result);

    let vacateRequests = [];
    if (result.success && Array.isArray(result.data)) {
      vacateRequests = result.data;
    }

    // Filter for vacate requests that are pending
    const activeVacateRequests = vacateRequests.filter((request) => {
      const isVacateRequest = request.vacate_request_id !== undefined;
      const isForCurrentTenant = request.tenant_id === tenantDetails?.id;
      const isActiveStatus = ["pending", "in_progress"].includes(
        request.request_status,
      );
      return isVacateRequest && isForCurrentTenant && isActiveStatus;
    });

    // console.log("🔍 Active vacate requests:", activeVacateRequests);

    if (activeVacateRequests.length > 0) {
      // console.log("✅ Found vacate request, extracting data...");
      const tenantRequest = await extractTenantVacateData(activeVacateRequests);
      if (tenantRequest) {
        const requestWithId = {
          ...tenantRequest,
          id: tenantRequest.vacate_request_id,
          status: tenantRequest.request_status,
          created_at: tenantRequest.vacate_request_date || tenantRequest.request_created,
        };
        setExistingVacateRequest(requestWithId);
        // console.log("✅ Vacate request set in state:", requestWithId);
        toast.info("Tenant vacate request found", {
          description: "Loading tenant's vacate request details...",
          duration: 1000,
        });
      }
    } else {
      // console.log("ℹ️ No active vacate requests found for this tenant");
      setExistingVacateRequest(null);
    }

    setWizardDisabled(false);
  } catch (error) {
    console.error("❌ Error checking existing request:", error);
    setExistingVacateRequest(null);
    setWizardDisabled(false);
  } finally {
    setIsCheckingExisting(false);
  }
};

// Add this useEffect temporarily to debug
// useEffect(() => {
//   if (typeof window !== 'undefined') {
//     console.log("🔍 localStorage keys:", Object.keys(localStorage));
//     console.log("🔍 auth_token:", localStorage.getItem("auth_token"));
//     console.log("🔍 admin_token:", localStorage.getItem("admin_token"));
//     console.log("🔍 token:", localStorage.getItem("token"));
//   }
// }, []);

// Helper function to fetch raw tenant data
const fetchRawTenant = async (tenantId: number) => {
  try {
    const response = await fetch(`/api/tenants/raw/${tenantId}`);
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return null;
  }
};

const fetchPartnerDetails = async (tenantId: number) => {
  try {
    setLoadingTenants(true);

    // Fetch current tenant using RAW endpoint
    const tenant = await fetchRawTenant(tenantId);

    if (!tenant) {
      console.error("Tenant not found");
      setTenantsToVacate([{
        id: tenantId,
        full_name: "Unknown",
        email: "",
        phone: "",
        gender: "",
        is_primary: false,
        selected: true,
      }]);
      setIsCoupleBooking(false);
      return;
    }

    // console.log("🔍 Tenant data:", tenant);
    // console.log("🔍 partner_tenant_id:", tenant.partner_tenant_id);
    // console.log("🔍 is_couple_booking:", tenant.is_couple_booking);
    // console.log("🔍 is_primary_tenant:", tenant.is_primary_tenant);

    const partnerTenantId = tenant.partner_tenant_id;
    const hasPartner = partnerTenantId && partnerTenantId !== tenant.id;

    // ✅ CRITICAL: Check if this tenant is currently in a bed assignment
    // If the bed assignment is not a couple booking anymore, treat as single
    const isCurrentlyCoupleBooking = bedAssignment?.is_couple === true || 
                                      bedAssignment?.is_couple === 1 || 
                                      bedAssignment?.is_couple === "1";

    // console.log("🔍 Bed assignment is_couple:", bedAssignment?.is_couple);
    // console.log("🔍 Currently couple booking:", isCurrentlyCoupleBooking);

    // ✅ Set the couple booking flag
    setIsCoupleBooking(hasPartner && isCurrentlyCoupleBooking);

    if (hasPartner && isCurrentlyCoupleBooking) {
      // Fetch partner using RAW endpoint
      const partner = await fetchRawTenant(partnerTenantId);

      if (partner) {
        // console.log("✅ Partner found:", partner.full_name, "ID:", partner.id);
        
        // Determine which one is primary (has is_primary_tenant = 1)
        const isCurrentPrimary = tenant.is_primary_tenant === 1;
        
        if (isCurrentPrimary) {
          // Current is primary, partner is partner
          setTenantsToVacate([
            {
              id: tenant.id,
              full_name: tenant.full_name,
              email: tenant.email || "",
              phone: tenant.phone || "",
              gender: tenant.gender || "",
              is_primary: true,
              selected: true,
              partner_details: {
                id: partner.id,
                full_name: partner.full_name,
                email: partner.email || "",
                phone: partner.phone || "",
                gender: partner.gender || "",
                relationship: tenant.partner_relationship || "Spouse",
              },
            },
            {
              id: partner.id,
              full_name: partner.full_name,
              email: partner.email || "",
              phone: partner.phone || "",
              gender: partner.gender || "",
              is_primary: false,
              selected: false,  // ← Partner not selected by default
              partner_details: {
                id: tenant.id,
                full_name: tenant.full_name,
                email: tenant.email || "",
                phone: tenant.phone || "",
                gender: tenant.gender || "",
                relationship: partner.partner_relationship || "Spouse",
              },
            },
          ]);
        } else {
          // Current is partner, primary is the partner
          setTenantsToVacate([
            {
              id: partner.id,
              full_name: partner.full_name,
              email: partner.email || "",
              phone: partner.phone || "",
              gender: partner.gender || "",
              is_primary: true,
              selected: false,  // ← Primary not selected by default
              partner_details: {
                id: tenant.id,
                full_name: tenant.full_name,
                email: tenant.email || "",
                phone: tenant.phone || "",
                gender: tenant.gender || "",
                relationship: partner.partner_relationship || "Spouse",
              },
            },
            {
              id: tenant.id,
              full_name: tenant.full_name,
              email: tenant.email || "",
              phone: tenant.phone || "",
              gender: tenant.gender || "",
              is_primary: false,
              selected: true,  // ← Current tenant selected by default
              partner_details: {
                id: partner.id,
                full_name: partner.full_name,
                email: partner.email || "",
                phone: partner.phone || "",
                gender: partner.gender || "",
                relationship: tenant.partner_relationship || "Spouse",
              },
            },
          ]);
        }
      } else {
        // console.log("⚠️ Partner tenant ID exists but partner not found");
        setTenantsToVacate([
          {
            id: tenant.id,
            full_name: tenant.full_name,
            email: tenant.email || "",
            phone: tenant.phone || "",
            gender: tenant.gender || "",
            is_primary: tenant.is_primary_tenant === 1,
            selected: true,
          },
        ]);
      }
    } else {
      // console.log("ℹ️ Single tenant or couple booking flag disabled");
      setTenantsToVacate([
        {
          id: tenant.id,
          full_name: tenant.full_name,
          email: tenant.email || "",
          phone: tenant.phone || "",
          gender: tenant.gender || "",
          is_primary: tenant.is_primary_tenant === 1,
          selected: true,
        },
      ]);
    }
  } catch (error) {
    console.error("Error fetching partner details:", error);
    toast.error("Failed to load tenant details");
    setTenantsToVacate([{
      id: tenantDetails?.id || 0,
      full_name: tenantDetails?.full_name || "Unknown",
      email: "",
      phone: "",
      gender: "",
      is_primary: false,
      selected: true,
    }]);
  } finally {
    setLoadingTenants(false);
  }
};

  // Call this in useEffect
  useEffect(() => {
    if (open && bedAssignment && tenantDetails) {
      fetchPartnerDetails(tenantDetails.id);
    }
  }, [open, bedAssignment, tenantDetails]);

const loadInitialData = async () => {
  if (initialDataLoadedRef.current) return;

  try {
    setLoading(true);
    setError(null);

    const response = await vacateApi.getInitialData(bedAssignment.id);

    let data;
    if (response && response.success && response.data) {
      data = response.data;
    } else if (response && response.data) {
      data = response.data;
    } else {
      data = response;
    }

    if (!data || !data.bedAssignment) {
      throw new Error("Invalid response from server");
    }

    setInitialData(data);
    initialDataLoadedRef.current = true;

    //  console.log("📊 Bed Assignment Data:", {
    //   tenant_rent: data.bedAssignment?.tenant_rent,
    //   rent_per_bed: data.bedAssignment?.rent_per_bed,
    //   security_deposit: data.bedAssignment?.security_deposit,
    //   bed_id: data.bedAssignment?.id,
    //   bed_number: data.bedAssignment?.bed_number
    // });

    // ✅ Set security deposit from bed data
    if (data.bedAssignment) {
      const deposit = parseFloat(data.bedAssignment.security_deposit) || 
                      parseFloat(data.bedAssignment.rent_per_bed) || 0;
      setSecurityDeposit(deposit);
    }

    // ✅ Always fetch partner details - don't rely on is_couple_booking flag
    if (data.bedAssignment && data.bedAssignment.tenant_id) {
      // console.log("📢 Fetching partner details for tenant:", data.bedAssignment.tenant_id);
      await fetchPartnerDetails(data.bedAssignment.tenant_id);
    }

    // Set default vacate date if no tenant date
    if (!tenantVacateDate) {
      const today = new Date();
      const defaultVacateDate = new Date(today);
      defaultVacateDate.setDate(today.getDate() + 30);
      const formattedDate = defaultVacateDate.toISOString().split("T")[0];

      setFormData((prev) => ({
        ...prev,
        requestedVacateDate: formattedDate,
      }));
    }
  } catch (error) {
    console.error("Error loading initial data:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to load vacate data";
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (
      field === "isNoticeGiven" ||
      field === "requestedVacateDate" ||
      field === "noticeGivenDate"
    ) {
      setTimeout(() => {
        calculateAllPenalties();
      }, 100);
    }
  };


const handleNext = async () => {
  // Step 1: Validate vacate reason
  if (step === 1) {
    if (!formData.vacateReasonValue) {
      toast.error("Please select a vacate reason");
      return;
    }
    
    // ✅ For non-couple bookings, skip step 2 (Select Tenants)
    if (isCoupleBooking) {
      setStep(2);
    } else {
      setStep(3); // Skip to Lock-in step
    }
  } 
  // Step 2: Select Tenants (only for couple bookings)
  else if (step === 2 && isCoupleBooking) {
    const selectedCount = tenantsToVacate.filter(t => t.selected).length;
    if (selectedCount === 0) {
      toast.error("Please select at least one tenant to vacate");
      return;
    }
    setStep(3);
  } 
  // Step 3: Lock-in
  else if (step === 3) {
    setStep(4);
  } 
  // Step 4: Notice
  else if (step === 4) {
    setStep(5);
  } 
  // Step 5: Date
  else if (step === 5) {
    if (!formData.requestedVacateDate) {
      toast.error("Please select vacate date");
      return;
    }
    await calculateAllPenalties();
    setStep(6);
  } 
  // Step 6: Summary
  else if (step === 6) {
    if (!formData.adminApproved) {
      toast.error("Please approve the vacate request");
      return;
    }
    setStep(7);
  }
};
// Update the icons array to handle dynamic steps
const getIcons = () => {
  const icons = [FileText];
  
  if (isCoupleBooking) {
    icons.push(Lock); // Select Tenants step icon
  }
  
  icons.push(Lock, Bell, CalendarIcon, CheckCircle, Check);
  return icons;
};

// Replace the checkLockinStatus function
// Replace the checkLockinStatus function with this corrected version

const checkLockinStatus = async () => {
  try {
    if (
      !initialData?.bedAssignment?.lockin_period_months ||
      initialData.bedAssignment.lockin_period_months === 0
    ) {
      setLockinStatus({
        isCompleted: true,
        message: "No lock-in period required",
        lockinMonths: 0,
        penaltyApplicable: false,
      });
      return;
    }

    setCalculating(true);

    const checkInDateStr = initialData?.bedAssignment?.check_in_date;
    const lockinMonths = initialData?.bedAssignment?.lockin_period_months || 0;
    
    // Use tenant's request submission date (vacate_request_date)
    const requestSubmissionDateStr = tenantRequestDate;
    
    if (!checkInDateStr) {
      setLockinStatus({
        isCompleted: true,
        message: "No check-in date found, cannot calculate lock-in period",
        lockinMonths: lockinMonths,
        penaltyApplicable: false,
      });
      return;
    }

    if (!requestSubmissionDateStr) {
      setLockinStatus({
        isCompleted: false,
        message: "No request submission date found - Lock-in period cannot be calculated yet",
        lockinMonths: lockinMonths,
        penaltyApplicable: true,
      });
      return;
    }

    const checkIn = new Date(checkInDateStr);
    const requestSubmissionDate = new Date(requestSubmissionDateStr);

    // Calculate lock-in end date: check-in date + lock-in months
    const lockInEndDate = new Date(checkIn);
    lockInEndDate.setMonth(checkIn.getMonth() + lockinMonths);

    // Normalize dates for comparison (remove time component)
    const normalizedCheckIn = new Date(
      checkIn.getFullYear(),
      checkIn.getMonth(),
      checkIn.getDate()
    );
    const normalizedRequestDate = new Date(
      requestSubmissionDate.getFullYear(),
      requestSubmissionDate.getMonth(),
      requestSubmissionDate.getDate()
    );
    const normalizedLockInEnd = new Date(
      lockInEndDate.getFullYear(),
      lockInEndDate.getMonth(),
      lockInEndDate.getDate()
    );

    // ✅ Calculate actual months completed between check-in and request date
    let monthsCompleted = 0;
    let daysCompleted = 0;
    let isCompleted = false;
    let remainingMonths = 0;
    let remainingDays = 0;

    // Calculate the difference in days first
    const diffTime = normalizedRequestDate.getTime() - normalizedCheckIn.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
    
    // Calculate months roughly (30 days per month)
    const approxMonths = diffDays / 30;
    
    if (approxMonths >= lockinMonths) {
      // Lock-in is completed
      isCompleted = true;
      monthsCompleted = lockinMonths;
      daysCompleted = lockinMonths * 30;
      remainingMonths = 0;
      remainingDays = 0;
    } else {
      // Lock-in not completed
      isCompleted = false;
      monthsCompleted = Math.floor(approxMonths);
      daysCompleted = monthsCompleted * 30;
      const remainingTotalDays = (lockinMonths * 30) - diffDays;
      remainingMonths = Math.floor(remainingTotalDays / 30);
      remainingDays = remainingTotalDays % 30;
    }

    // For debugging
    // console.log("🔍 Lock-in Check (Corrected):", {
    //   checkInDate: normalizedCheckIn.toISOString().split('T')[0],
    //   requestSubmissionDate: normalizedRequestDate.toISOString().split('T')[0],
    //   lockInEndDate: normalizedLockInEnd.toISOString().split('T')[0],
    //   diffDays: diffDays,
    //   lockinMonths: lockinMonths,
    //   monthsCompleted: monthsCompleted,
    //   remainingMonths: remainingMonths,
    //   remainingDays: remainingDays,
    //   isCompleted: isCompleted
    // });

    // Format the message
    let message = "";
    if (isCompleted) {
      message = `✓ Lock-in period completed (${monthsCompleted} months completed out of required ${lockinMonths} months)`;
    } else {
      message = `✗ Lock-in period not completed (${monthsCompleted} months completed out of required ${lockinMonths} months. Remaining: ${remainingMonths} month(s) / ${remainingDays} days)`;
    }

    setLockinStatus({
      isCompleted,
      message,
      lockinMonths: lockinMonths,
      completedMonths: monthsCompleted,
      remainingMonths: remainingMonths,
      remainingDays: remainingDays,
      checkInDate: checkInDateStr,
      requestSubmissionDate: requestSubmissionDateStr,
      lockInEndDate: lockInEndDate.toISOString().split("T")[0],
      penaltyApplicable: !isCompleted,
    });
  } catch (error) {
    console.error("Error checking lock-in status:", error);
    setLockinStatus({
      isCompleted: false,
      message: "Error calculating lock-in period",
      lockinMonths: initialData?.bedAssignment?.lockin_period_months || 0,
      penaltyApplicable: true,
    });
  } finally {
    setCalculating(false);
  }
};

// Replace the calculateNoticePeriodStatus function
const calculateNoticePeriodStatus = () => {
  if (!initialData?.bedAssignment) {
    return null;
  }

  const bedData = initialData.bedAssignment;
  const noticePeriodDays = bedData.notice_period_days || 0;

  // ✅ CORRECT: Notice is calculated from request submission date to requested vacate date
  const noticeStartDateStr = tenantRequestDate; // vacate_request_date
  const noticeEndDateStr = tenantVacateDate; // expected_vacate_date

  if (noticePeriodDays === 0) {
    return {
      isNoticeRequired: false,
      message: "No notice period required",
      penaltyApplicable: false,
      isCompleted: true,
    };
  }

  if (!noticeStartDateStr || !noticeEndDateStr) {
    return {
      isNoticeGiven: !!noticeStartDateStr,
      isCompleted: false,
      message: !noticeStartDateStr ? "No notice given - penalty applies" : "Vacate date not set",
      penaltyApplicable: true,
    };
  }

  const noticeStartDate = new Date(noticeStartDateStr);
  const noticeEndDate = new Date(noticeEndDateStr);

  // Calculate the difference in days
  const timeDiff = noticeEndDate.getTime() - noticeStartDate.getTime();
  const daysGiven = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Normalize dates for comparison
  const normalizedNoticeStartDate = new Date(
    noticeStartDate.getFullYear(),
    noticeStartDate.getMonth(),
    noticeStartDate.getDate(),
  );
  const normalizedNoticeEndDate = new Date(
    noticeEndDate.getFullYear(),
    noticeEndDate.getMonth(),
    noticeEndDate.getDate(),
  );

  // Notice period is COMPLETED if days given >= required notice period
  const isNoticeCompleted = daysGiven >= noticePeriodDays;

  const daysRemaining = isNoticeCompleted ? 0 : Math.max(0, noticePeriodDays - daysGiven);

  if (isNoticeCompleted) {
    return {
      isNoticeGiven: true,
      isCompleted: true,
      noticeStartDate: normalizedNoticeStartDate.toISOString().split("T")[0],
      noticeEndDate: normalizedNoticeEndDate.toISOString().split("T")[0],
      noticePeriodDays,
      daysGiven: daysGiven,
      daysRemaining: 0,
      message: `Notice period completed (${daysGiven} days given out of required ${noticePeriodDays} days)`,
      penaltyApplicable: false,
    };
  } else {
    return {
      isNoticeGiven: true,
      isCompleted: false,
      noticeStartDate: normalizedNoticeStartDate.toISOString().split("T")[0],
      noticeEndDate: normalizedNoticeEndDate.toISOString().split("T")[0],
      noticePeriodDays,
      daysGiven: daysGiven,
      daysRemaining,
      message: `Notice period not completed (${daysGiven} days given, ${daysRemaining} days short of required ${noticePeriodDays} days)`,
      penaltyApplicable: true,
    };
  }
};
  // Update penalty calculation to use current date logic
  const calculateAllPenalties = async () => {
    try {
      setCalculating(true);

      if (!initialData?.bedAssignment) {
        throw new Error("No bed assignment data");
      }

      const bedData = initialData.bedAssignment;
      const securityDeposit = parseFloat(bedData.security_deposit) || 0;
      const rentPerBed = parseFloat(bedData.rent_per_bed) || 0;
      const currentDate = new Date().toISOString().split("T")[0];

      // 1. LOCK-IN PENALTY CALCULATION
      let lockinPenalty = 0;
      let lockinPenaltyDescription = "";
      let lockinPenaltyApplicable = false;

      // Recalculate lock-in status if needed
      if (!lockinStatus) {
        await checkLockinStatus();
      }

      // In calculateAllPenalties function, update the lock-in penalty section:

if (lockinStatus && lockinStatus.penaltyApplicable) {
  lockinPenaltyApplicable = true;

  // Get penalty from tenant data
  const penaltyAmount = parseFloat(bedData.lockin_penalty_amount) || 0;
  const penaltyType = bedData.lockin_penalty_type || "";

  if (penaltyAmount > 0) {
    // Check if it's a percentage value (e.g., "5.00" for 5%)
    if (penaltyType === "percentage" && penaltyAmount < 100) {
      // This is a percentage value, calculate based on security deposit
      lockinPenalty = Math.round((securityDeposit * penaltyAmount) / 100);
      lockinPenaltyDescription = `${penaltyAmount}% of security deposit (₹${lockinPenalty.toLocaleString("en-IN")})`;
    } else {
      lockinPenalty = penaltyAmount;
      lockinPenaltyDescription = `Fixed penalty (₹${lockinPenalty.toLocaleString("en-IN")})`;
    }
  } else if (penaltyType) {
    // Calculate based on penalty type
    lockinPenalty = calculatePenaltyAmount(
      penaltyType,
      securityDeposit,
      rentPerBed,
    );

    if (lockinPenalty > 0) {
      if (penaltyType.includes("%")) {
        lockinPenaltyDescription = `${penaltyType} of security deposit (₹${lockinPenalty.toLocaleString("en-IN")})`;
      } else {
        lockinPenaltyDescription = `${penaltyType.replace(/_/g, " ")} (₹${lockinPenalty.toLocaleString("en-IN")})`;
      }
    }
  }

  // If still 0, use rent as fallback
  if (lockinPenalty === 0 && rentPerBed > 0) {
    lockinPenalty = rentPerBed;
    lockinPenaltyDescription = `One month rent (₹${rentPerBed.toLocaleString("en-IN")})`;
  }
} else if (lockinStatus?.isCompleted) {
        lockinPenaltyDescription = "No penalty - Lock-in period completed";
      }

      // 2. NOTICE PERIOD CALCULATION
      let noticePenalty = 0;
      let noticePenaltyDescription = "";
      let noticePenaltyApplicable = false;

      // Calculate notice period status
      const noticeStatus = calculateNoticePeriodStatus();
      setNoticePeriodStatus(noticeStatus);

      // In calculateAllPenalties function, update the notice penalty section:

if (noticeStatus?.penaltyApplicable) {
  noticePenaltyApplicable = true;

  // Get penalty from tenant data
  const penaltyAmount = parseFloat(bedData.notice_penalty_amount) || 0;
  const penaltyType = bedData.notice_penalty_type || "";

  if (penaltyAmount > 0) {
    // Check if it's a percentage value (e.g., "7.00" for 7%)
    if (penaltyType === "percentage" && penaltyAmount < 100) {
      // This is a percentage value, calculate based on security deposit
      noticePenalty = Math.round((securityDeposit * penaltyAmount) / 100);
      noticePenaltyDescription = `${penaltyAmount}% of security deposit (₹${noticePenalty.toLocaleString("en-IN")})`;
    } else {
      noticePenalty = penaltyAmount;
      noticePenaltyDescription = `Fixed penalty (₹${noticePenalty.toLocaleString("en-IN")})`;
    }
  } else if (penaltyType) {
    // Calculate based on penalty type
    noticePenalty = calculatePenaltyAmount(
      penaltyType,
      securityDeposit,
      rentPerBed,
    );

    if (noticePenalty > 0) {
      if (penaltyType.includes("%")) {
        noticePenaltyDescription = `${penaltyType} of security deposit (₹${noticePenalty.toLocaleString("en-IN")})`;
      } else {
        noticePenaltyDescription = `${penaltyType.replace(/_/g, " ")} (₹${noticePenalty.toLocaleString("en-IN")})`;
      }
    }
  }

  // If still 0, use rent as fallback
  if (noticePenalty === 0 && rentPerBed > 0) {
    noticePenalty = rentPerBed;
    noticePenaltyDescription = `One month rent (₹${rentPerBed.toLocaleString("en-IN")})`;
  }
} else if (noticeStatus?.isNoticeGiven) {
        noticePenaltyDescription = "No penalty - Notice period completed";
      } else if (noticeStatus?.isNoticeRequired === false) {
        noticePenaltyDescription = "No notice period required";
      } else if (!noticeStatus?.isNoticeGiven) {
        noticePenaltyDescription = "No notice given - penalty applies";
        noticePenaltyApplicable = true;

        // Apply penalty for no notice
        const penaltyAmount = parseFloat(bedData.notice_penalty_amount) || 0;
        const penaltyType = bedData.notice_penalty_type || "";

        if (penaltyAmount > 0) {
          noticePenalty = penaltyAmount;
          noticePenaltyDescription = `Fixed penalty (₹${noticePenalty.toLocaleString("en-IN")}) - No notice given`;
        } else if (rentPerBed > 0) {
          noticePenalty = rentPerBed;
          noticePenaltyDescription = `One month rent (₹${rentPerBed.toLocaleString("en-IN")}) - No notice given`;
        }
      }

      // 3. FINAL CALCULATION
      const totalPenalty = Number(lockinPenalty) + Number(noticePenalty);
      const refundableAmount = Number(securityDeposit) - totalPenalty;
      const isNegativeRefund = refundableAmount < 0;
      const additionalPaymentNeeded = isNegativeRefund
        ? Math.abs(refundableAmount)
        : 0;

      // Update form data
      setFormData((prev) => ({
        ...prev,
        lockinPenaltyApplied: lockinPenalty > 0,
        noticePenaltyApplied: noticePenalty > 0,
        finalPenaltyAmount: totalPenalty,
        securityRefundAmount: Math.max(0, refundableAmount),
      }));

      // Update calculation state for UI
      setCalculation({
        financials: {
          securityDeposit,
          lockinPenalty,
          noticePenalty,
          totalPenalty,
          refundableAmount: Math.max(0, refundableAmount),
          actualRefundableAmount: refundableAmount,
          isNegativeRefund: isNegativeRefund,
          additionalPaymentNeeded: additionalPaymentNeeded,
        },
        lockinPolicy: {
          isCompleted: lockinStatus?.isCompleted || false,
          periodMonths: bedData.lockin_period_months || 0,
          penaltyType: bedData.lockin_penalty_type || "",
          penaltyAmount: bedData.lockin_penalty_amount || 0,
          penaltyDescription: lockinPenaltyDescription,
          checkInDate: bedData.check_in_date,
          lockInEndDate: lockinStatus?.lockInEndDate,
          penaltyApplicable: lockinPenaltyApplicable,
          message: lockinStatus?.message,
        },
        noticePolicy: {
          isNoticeRequired: noticeStatus?.isNoticeRequired ?? true,
          isNoticeGiven: noticeStatus?.isNoticeGiven || false,
          isCompleted: noticeStatus?.isCompleted || false,
          noticeStartDate: noticeStatus?.noticeStartDate || null,
          noticeEndDate: noticeStatus?.noticeEndDate || null,
          periodDays: noticeStatus?.noticePeriodDays || 0,
          daysCompleted: noticeStatus?.daysCompleted || 0,
          daysRemaining: noticeStatus?.daysRemaining || 0,
          penaltyType: bedData.notice_penalty_type || "",
          penaltyAmount: bedData.notice_penalty_amount || 0,
          penaltyDescription: noticePenaltyDescription,
          noticeGivenByTenant: !!tenantRequestDate,
          message: noticeStatus?.message || "",
          penaltyApplicable: noticePenaltyApplicable,
        },
      });
    } catch (error) {
      console.error("❌ Error calculating penalties:", error);
      toast.error("Error calculating penalties");
    } finally {
      setCalculating(false);
    }
  };

const calculatePenaltyAmount = (
  penaltyType: string,
  securityDeposit: number,
  rentPerBed: number,
) => {
  if (!penaltyType) return 0;

  const lowerType = penaltyType.toLowerCase();

  // Check for percentage-based penalties - calculate based on security deposit
  if (lowerType.includes("%")) {
    const percentageMatch = lowerType.match(/(\d+)%/);
    if (percentageMatch) {
      const percentage = parseInt(percentageMatch[1]);
      // ✅ Calculate percentage of security deposit
      const calculatedAmount = Math.round((securityDeposit * percentage) / 100);
      // console.log(`💰 Percentage penalty: ${percentage}% of ₹${securityDeposit} = ₹${calculatedAmount}`);
      return calculatedAmount;
    }
  }

  // Check for fixed amounts in the type (e.g., "₹2000", "2000_fixed")
  const fixedAmountMatch = lowerType.match(/₹?(\d+(?:,\d+)*(?:\.\d+)?)/);
  if (fixedAmountMatch) {
    const amountStr = fixedAmountMatch[1].replace(/,/g, "");
    return parseFloat(amountStr) || 0;
  }

  // Check for common penalty types - based on rent
  if (
    lowerType.includes("one_month_rent") ||
    lowerType.includes("one month rent")
  ) {
    return rentPerBed;
  }

  if (
    lowerType.includes("two_month_rent") ||
    lowerType.includes("two months rent")
  ) {
    return rentPerBed * 2;
  }

  if (
    lowerType.includes("three_month_rent") ||
    lowerType.includes("three months rent")
  ) {
    return rentPerBed * 3;
  }

  if (
    lowerType.includes("half_month_rent") ||
    lowerType.includes("half month rent")
  ) {
    return Math.round(rentPerBed / 2);
  }

  if (
    lowerType.includes("full_deposit") ||
    lowerType.includes("full security deposit") ||
    lowerType.includes("deposit_forfeit")
  ) {
    return securityDeposit;
  }

  if (
    lowerType.includes("half_deposit") ||
    lowerType.includes("half security deposit")
  ) {
    return Math.round(securityDeposit / 2);
  }

  return 0;
};

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLockinPenaltyType = (type: string) => {
    if (!type) return "No penalty";
    return type.replace(/_/g, " ").replace(/rent/gi, "Rent");
  };

  const formatDate = (dateString: string | number | Date): string => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return String(dateString);
    }
  };

  useEffect(() => {
    // If no existing tenant vacate request, enable admin override by default
    if (!existingVacateRequest && initialData && !isCheckingExisting) {
      setIsAdminOverride(true);
      // Also auto-check admin approval when override is enabled
      setFormData((prev) => ({
        ...prev,
        adminApproved: true,
      }));
    }
  }, [existingVacateRequest, initialData, isCheckingExisting]);

// const handleSubmit = async () => {
//   try {
//     setLoading(true);

//     const selectedTenants = tenantsToVacate.filter(t => t.selected);
    
//     if (selectedTenants.length === 0) {
//       toast.error("Please select at least one tenant to vacate");
//       setLoading(false);
//       return;
//     }

//     const results = [];
//     const errors = [];

//     // Process each selected tenant
//     for (const tenant of selectedTenants) {
//       try {
//         // Calculate final amounts based on admin override or tenant request
//         let finalPenaltyAmount;
//         let finalRefundAmount;
        
//         if (isAdminOverride) {
//           // ✅ Admin Override: No penalties, full refund
//           finalPenaltyAmount = 0;
//           finalRefundAmount = initialData?.bedAssignment?.security_deposit || 0;
//         } else if (existingVacateRequest) {
//           // ✅ Tenant submitted a vacate request - use calculations from the request
//           finalPenaltyAmount = calculation?.financials?.totalPenalty || formData.finalPenaltyAmount;
//           finalRefundAmount = calculation?.financials?.refundableAmount || formData.securityRefundAmount;
//         } else {
//           // ✅ No tenant request, admin is processing manually
//           finalPenaltyAmount = formData.finalPenaltyAmount;
//           finalRefundAmount = formData.securityRefundAmount;
//         }

//         const payload = {
//           bedAssignmentId: bedAssignment.id,
//           tenantId: tenant.id,
//           vacateReasonValue: isAdminOverride ? 'Admin forced vacate' :(tenantVacateReason || formData.vacateReasonValue),
//           isNoticeGiven: isAdminOverride ? true :(noticeGivenByTenant || formData.isNoticeGiven),
//           noticeGivenDate: isAdminOverride ? new Date().toISOString().split('T')[0] :  (tenantRequestDate || formData.noticeGivenDate),
//           requestedVacateDate: formData.requestedVacateDate,  
//           tenantAgreed: isAdminOverride ? true : tenantAgreedToTerms,
//           lockinPeriodMonths: initialData?.bedAssignment?.lockin_period_months || 0,
//           lockinPenaltyType: initialData?.bedAssignment?.lockin_penalty_type || '',
//           lockinPenaltyAmount: isAdminOverride ? 0 : (initialData?.bedAssignment?.lockin_penalty_amount || 0),
//           noticePeriodDays: initialData?.bedAssignment?.notice_period_days || 0,
//           noticePenaltyType: initialData?.bedAssignment?.notice_penalty_type || '',
//           noticePenaltyAmount: isAdminOverride ? 0 : (initialData?.bedAssignment?.notice_penalty_amount || 0),
//           securityDepositAmount: initialData?.bedAssignment?.security_deposit || 0,
//           totalPenaltyAmount: selectedTenants.length === 2 ? finalPenaltyAmount : Math.floor(finalPenaltyAmount / 2),
//           refundableAmount: selectedTenants.length === 2 ? finalRefundAmount : Math.floor(finalRefundAmount / 2),
//           lockinPenaltyApplied: !isAdminOverride && formData.lockinPenaltyApplied,
//           noticePenaltyApplied: !isAdminOverride && formData.noticePenaltyApplied,
//           adminApproved: formData.adminApproved,
//           tenantVacateRequestId: existingVacateRequest?.id,
//           isAdminOverride: isAdminOverride,
//           isPartialVacate: selectedTenants.length === 1 && tenantsToVacate.length === 2
//         };

//         const response = await vacateApi.submitVacateRequest(payload);
        
//         if (response && response.success) {
          
//           results.push({
//             tenant_id: tenant.id,
//             tenant_name: tenant.full_name,
//             success: true,
//             message: response.message
//           });
//         } else {
//           errors.push({
//             tenant_id: tenant.id,
//             tenant_name: tenant.full_name,
//             error: response?.message || "Failed to submit vacate request"
//           });
//         }
//       } catch (error) {
//         console.error(`Error vacating tenant ${tenant.id}:`, error);
//         errors.push({
//           tenant_id: tenant.id,
//           tenant_name: tenant.full_name,
//           error: error.message
//         });
//       }
//     }

//     if (results.length > 0) {
//       const successMessage = results.map(r => r.tenant_name).join(', ');
//       toast.success(`Successfully vacated: ${successMessage}`);
      
//       // ✅ HANDLE BED ASSIGNMENT UPDATE FOR PARTIAL VACATE
//       const allTenantsVacated = selectedTenants.length === tenantsToVacate.length;

//         // Get the original bed rent and security deposit
//       const originalBedRent = initialData?.bedAssignment?.tenant_rent ||
//                               0;
//       const originalSecurityDeposit = initialData?.bedAssignment?.security_deposit || 
//                                      initialData?.bedAssignment?.rent_per_bed || 
//                                      0;
      
//       if (allTenantsVacated) {
//         // Both tenants vacated - mark bed as available
//         await updateBedAssignment(bedAssignment.id.toString(), {
//           tenant_id: null,
//           tenant_gender: null,
//           is_available: true,
//           // tenant_rent:initialData?.bedAssignment?.tenant_rent || initialData?.bedAssignment?.rent_per_bed,
//           // tenant_rent:initialData?.bedAssignment?.tenant_rent,
//           tenant_rent: originalBedRent,
//           is_couple: false,
//           security_deposit: null,
//           vacate_reason: `Both tenants vacated. Bed rent preserved: ${originalBedRent}`
//         });
//         console.log("✅ Both tenants vacated - Bed marked as available");
//       } else {
//         // Only one tenant vacated - update bed to remaining tenant
//         const remainingTenant = tenantsToVacate.find(t => !t.selected);
//         if (remainingTenant) {
//           // Fetch remaining tenant's gender
//           const remainingTenantDetails = await fetchRawTenant(remainingTenant.id);

//             //  const currentTenantRent = initialData?.bedAssignment?.tenant_rent || 
//             //                          initialData?.bedAssignment?.rent_per_bed || 
//             //                          0;
//   //                                    const currentTenantRent = initialData?.bedAssignment?.tenant_rent ;
//   //           // Get the security deposit from the original bed assignment
//   // const originalSecurityDeposit = initialData?.bedAssignment?.security_deposit || 
//   //                                  initialData?.bedAssignment?.rent_per_bed || 
//   //                                  0;
          
//           await updateBedAssignment(bedAssignment.id.toString(), {
//             tenant_id: remainingTenant.id,
//             tenant_gender: remainingTenantDetails?.gender || null,
//             is_available: false,
//             is_couple: false, // No longer a couple booking
//             tenant_rent:originalBedRent,
//              security_deposit: originalSecurityDeposit,
//              vacate_reason: `Partial vacate - ${remainingTenant.full_name} remains. Bed rent preserved: ${originalBedRent}`
//           });
//           console.log(`✅ Single tenant vacated - Bed updated to remaining tenant: ${remainingTenant.full_name}`);
//         }
//       }
      
//       if (onVacateComplete) {
//         onVacateComplete();
//       }

//       setStep(6);
//       setTimeout(() => {
//         onOpenChange(false);
//         resetWizard();
//       }, 100);
//     }
    
//     if (errors.length > 0) {
//       const errorMessage = errors.map(e => `${e.tenant_name}: ${e.error}`).join('; ');
//       toast.error(`Failed to vacate: ${errorMessage}`);
//     }
    
//   } catch (error) {
//     console.error("❌ Error submitting vacate request:", error);
//     toast.error(error.message || "Failed to submit vacate request.");
//   } finally {
//     setLoading(false);
//   }
// };

const handleSubmit = async () => {
  try {
    setLoading(true);

    const selectedTenants = tenantsToVacate.filter(t => t.selected);
    
    if (selectedTenants.length === 0) {
      toast.error("Please select at least one tenant to vacate");
      setLoading(false);
      return;
    }

    const results = [];
    const errors = [];

    // Process each selected tenant
    for (const tenant of selectedTenants) {
      try {
        // Calculate final amounts based on admin override or tenant request
        let finalPenaltyAmount;
        let finalRefundAmount;
        
        if (isAdminOverride) {
          finalPenaltyAmount = 0;
          finalRefundAmount = initialData?.bedAssignment?.security_deposit || 0;
        } else if (existingVacateRequest) {
          finalPenaltyAmount = calculation?.financials?.totalPenalty || formData.finalPenaltyAmount;
          finalRefundAmount = calculation?.financials?.refundableAmount || formData.securityRefundAmount;
        } else {
          finalPenaltyAmount = formData.finalPenaltyAmount;
          finalRefundAmount = formData.securityRefundAmount;
        }

        const payload = {
          bedAssignmentId: bedAssignment.id,
          tenantId: tenant.id,
          vacateReasonValue: isAdminOverride ? 'Admin forced vacate' : (tenantVacateReason || formData.vacateReasonValue),
          isNoticeGiven: isAdminOverride ? true : (noticeGivenByTenant || formData.isNoticeGiven),
          noticeGivenDate: isAdminOverride ? new Date().toISOString().split('T')[0] : (tenantRequestDate || formData.noticeGivenDate),
          requestedVacateDate: formData.requestedVacateDate,  
          tenantAgreed: isAdminOverride ? true : tenantAgreedToTerms,
          lockinPeriodMonths: initialData?.bedAssignment?.lockin_period_months || 0,
          lockinPenaltyType: initialData?.bedAssignment?.lockin_penalty_type || '',
          lockinPenaltyAmount: isAdminOverride ? 0 : (initialData?.bedAssignment?.lockin_penalty_amount || 0),
          noticePeriodDays: initialData?.bedAssignment?.notice_period_days || 0,
          noticePenaltyType: initialData?.bedAssignment?.notice_penalty_type || '',
          noticePenaltyAmount: isAdminOverride ? 0 : (initialData?.bedAssignment?.notice_penalty_amount || 0),
          securityDepositAmount: initialData?.bedAssignment?.security_deposit || 0,
          totalPenaltyAmount: selectedTenants.length === 2 ? finalPenaltyAmount : Math.floor(finalPenaltyAmount / 2),
          refundableAmount: selectedTenants.length === 2 ? finalRefundAmount : Math.floor(finalRefundAmount / 2),
          lockinPenaltyApplied: !isAdminOverride && formData.lockinPenaltyApplied,
          noticePenaltyApplied: !isAdminOverride && formData.noticePenaltyApplied,
          adminApproved: formData.adminApproved,
          tenantVacateRequestId: existingVacateRequest?.id,
          isAdminOverride: isAdminOverride,
          isPartialVacate: selectedTenants.length === 1 && tenantsToVacate.length === 2
        };

        const response = await vacateApi.submitVacateRequest(payload);
        
        if (response && response.success) {
          results.push({
            tenant_id: tenant.id,
            tenant_name: tenant.full_name,
            success: true,
            message: response.message
          });
        } else {
          errors.push({
            tenant_id: tenant.id,
            tenant_name: tenant.full_name,
            error: response?.message || "Failed to submit vacate request"
          });
        }
      } catch (error) {
        console.error(`Error vacating tenant ${tenant.id}:`, error);
        errors.push({
          tenant_id: tenant.id,
          tenant_name: tenant.full_name,
          error: error.message
        });
      }
    }

    if (results.length > 0) {
      const successMessage = results.map(r => r.tenant_name).join(', ');
      toast.success(`Successfully vacated: ${successMessage}`);
      
      // ✅ HANDLE BED ASSIGNMENT UPDATE FOR PARTIAL VACATE
      const allTenantsVacated = selectedTenants.length === tenantsToVacate.length;

      // ✅ CRITICAL FIX: Get the original bed rent from multiple sources
      // First try bedAssignment.tenant_rent, then rent_per_bed, then fallback to 0
      const originalBedRent = bedAssignment?.tenant_rent || 
                              initialData?.bedAssignment?.tenant_rent || 
                              initialData?.bedAssignment?.rent_per_bed || 
                              bedAssignment?.rent_per_bed || 0;
      
      const originalSecurityDeposit = initialData?.bedAssignment?.security_deposit || 
                                     initialData?.bedAssignment?.rent_per_bed || 
                                     bedAssignment?.security_deposit || 0;
      
      // console.log("💰 Original bed rent to preserve:", originalBedRent);
      // console.log("💰 Original security deposit to preserve:", originalSecurityDeposit);
      
      if (allTenantsVacated) {
        // Both tenants vacated - mark bed as available but preserve rent
        await updateBedAssignment(bedAssignment.id.toString(), {
          tenant_id: null,
          tenant_gender: null,
          is_available: true,
          tenant_rent: originalBedRent, // ✅ Preserve the rent
          is_couple: false,
          security_deposit: null,
          vacate_reason: `Both tenants vacated. Bed rent preserved: ${originalBedRent}`
        });
        // console.log("✅ Both tenants vacated - Bed marked as available with rent preserved:", originalBedRent);
      } else {
        // Only one tenant vacated - update bed to remaining tenant
        const remainingTenant = tenantsToVacate.find(t => !t.selected);
        if (remainingTenant) {
          // Fetch remaining tenant's gender
          const remainingTenantDetails = await fetchRawTenant(remainingTenant.id);
          
          await updateBedAssignment(bedAssignment.id.toString(), {
            tenant_id: remainingTenant.id,
            tenant_gender: remainingTenantDetails?.gender || null,
            is_available: false,
            is_couple: false, // No longer a couple booking
            tenant_rent: originalBedRent, // ✅ IMPORTANT: Use original bed rent, NOT tenant rent
            security_deposit: originalSecurityDeposit,
            vacate_reason: `Partial vacate - ${remainingTenant.full_name} remains. Bed rent preserved: ${originalBedRent}`
          });
          // console.log(`✅ Single tenant vacated - Bed updated to remaining tenant: ${remainingTenant.full_name} with rent preserved: ${originalBedRent}`);
        }
      }
      
      if (onVacateComplete) {
        onVacateComplete();
      }

      setStep(6);
      setTimeout(() => {
        onOpenChange(false);
        resetWizard();
      }, 100);
    }
    
    if (errors.length > 0) {
      const errorMessage = errors.map(e => `${e.tenant_name}: ${e.error}`).join('; ');
      toast.error(`Failed to vacate: ${errorMessage}`);
    }
    
  } catch (error) {
    console.error("❌ Error submitting vacate request:", error);
    toast.error(error.message || "Failed to submit vacate request.");
  } finally {
    setLoading(false);
  }
};

  const handleBack = () => {
    if (step > 1) {
       // For non-couple bookings, step 2 doesn't exist
    if (!isCoupleBooking && step === 3) {
      setStep(1); // Go back from Lock-in to Reason
    } else if (!isCoupleBooking && step === 4) {
      setStep(3); // Go back from Notice to Lock-in
    } else {
      setStep(step - 1);
    }
    }
  };

  const resetWizard = () => {
    if (step !== 7) {
      setStep(1);
      setInitialData(null);
      setCalculation(null);
      setSubmissionResult(null);
      setError(null);
      setLockinStatus(null);
      setExistingVacateRequest(null);
      setTenantVacateData(null);
      setNoticeGivenByTenant(false);
      setLockinAcceptedByTenant(false);
      setTenantVacateDate("");
      setTenantRequestDate("");
      setTenantVacateReason("");
      setTenantVacateReasonId(null);
      setTenantAgreedToTerms(false);
      setNoticePeriodStatus(null);
      setWizardDisabled(false);
      setFormData({
        vacateReasonValue: "",
        isNoticeGiven: false,
        noticeGivenDate: "",
        requestedVacateDate: "",
        adminApproved: false,
        lockinPenaltyApplied: false,
        noticePenaltyApplied: false,
        finalPenaltyAmount: 0,
        securityRefundAmount: 0,
        tenantAgreedToTerms: false,
      });
      // Reset the loaded ref
      initialDataLoadedRef.current = false;
    }
  };

  const handleClose = () => {
    if (step === 7) {
      onOpenChange(false);
    } else {
      resetWizard();
      onOpenChange(false);
    }
  };

  if (loading && !initialData) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pb-4">
            <DialogTitle>Admin: Vacate Bed</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-gray-500" />
            <p className="text-sm text-gray-600">Loading bed information...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !initialData?.bedAssignment) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-red-600">Error</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-600 mb-4 text-sm">
              {error || "Failed to load data"}
            </p>
            <Button variant="outline" onClick={handleClose} className="text-sm">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const bedData = initialData.bedAssignment;
  const currentDate =
    initialData.currentDate || new Date().toISOString().split("T")[0];
const getStepTitles = () => {
  if (isCoupleBooking) {
    return ["Reason", "Select Tenants", "Lock-in", "Notice", "Date", "Summary", "Result"];
  } else {
    return ["Reason", "Lock-in", "Notice", "Date", "Summary", "Result"];
  }
};

const stepTitles = getStepTitles();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        // Custom size — exactly xs aur sm ke beech
        className="w-[calc(100%-32px)] max-w-md md:max-w-lg max-h-[75vh] overflow-hidden flex flex-col p-0 rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header - Match ChangeBedWizard styling */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2.5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserMinus className="h-3.5 w-3.5" />
              <div>
                <DialogTitle className="text-sm font-bold leading-tight text-white">
                  Vacate Bed {bedAssignment?.bed_number}
                </DialogTitle>
                <DialogDescription className="text-orange-100 text-[10px]">
                  {tenantDetails?.full_name || "Tenant"}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                Step {step}/{stepTitles.length}
              </span>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-white/20 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {loadingMasters && (
          <div className="py-2 text-center mb-2">
            <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-blue-500" />
            <p className="text-xs text-gray-500">Loading master data...</p>
          </div>
        )}

        {isCheckingExisting && (
          <div className="py-4 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-sm text-gray-600">
              Checking for existing requests...
            </p>
          </div>
        )}

        {existingVacateRequest && !isCheckingExisting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-blue-800">
                    Tenant's Vacate Request
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {existingVacateRequest.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-blue-700">Request ID:</div>
                    <div className="font-semibold">
                      #{existingVacateRequest.id}
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-700">Submitted:</div>
                    <div>{formatDate(existingVacateRequest.created_at)}</div>
                  </div>
                  <div>
                    <div className="text-blue-700">Lock-in Accepted:</div>
                    <div
                      className={`font-medium ${lockinAcceptedByTenant || lockinStatus?.isCompleted ? "text-green-600" : "text-red-600"}`}
                    >
                      {lockinAcceptedByTenant || lockinStatus?.isCompleted
                        ? "Yes"
                        : "No"}
                      {lockinStatus?.isCompleted && (
                        <span className="text-[10px] text-green-600 ml-1">
                          (Completed)
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-700">Notice Accepted:</div>
                    <div
                      className={`font-medium ${noticeGivenByTenant ? "text-green-600" : "text-red-600"}`}
                    >
                      {noticeGivenByTenant ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <div className="flex items-center gap-2">
                    {tenantAgreedToTerms ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">
                          ✓ Tenant has agreed to all terms and penalties
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                        <span className="text-xs text-amber-700">
                          Tenant has NOT agreed to all terms
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between gap-0.5">
                {stepTitles.map((title, index) => {
                  const iconsList = getIcons();
  const StepIcon = iconsList[index] || Check;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center relative"
                    >
                      {index < stepTitles.length - 1 && (
                        <div
                          className={`absolute top-3 left-1/2 w-full h-0.5 -translate-x-1/2 ${
                            step > index + 1 ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        />
                      )}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 mb-1 ${
                          step > index + 1
                            ? "bg-white border-blue-600 text-blue-600"
                            : step === index + 1
                              ? "bg-white border-blue-600 text-blue-600"
                              : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        {step > index + 1 ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <StepIcon className="h-3 w-3" />
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-medium truncate w-full text-center ${
                          step >= index + 1
                            ? "text-blue-600 font-semibold"
                            : "text-gray-500"
                        }`}
                      >
                        {title}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-1.5">
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(step / stepTitles.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-1 text-sm">
                    Select Vacate Reason
                  </h3>
                  <p className="text-xs text-blue-700">
                    Select or confirm the reason for vacating.
                  </p>
                </div>

                {tenantVacateReason && (
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3 text-amber-600" />
                      <span className="text-xs font-medium text-amber-800">
                        Tenant selected: {tenantVacateReason}
                      </span>
                    </div>
                    <p className="text-xs text-amber-700">
                      This reason has been pre-selected. You can change it if
                      needed.
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Vacate Reason <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.vacateReasonValue}
                    onValueChange={(value) =>
                      handleInputChange("vacateReasonValue", value)
                    }
                    disabled={loadingMasters}
                  >
                    <SelectTrigger className="h-9 border-gray-300 focus:ring-blue-500 hover:border-gray-400 text-sm">
                      <SelectValue
                        placeholder={
                          formData.vacateReasonValue || "Select a reason..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      className="max-h-48 overflow-y-auto bg-white shadow-lg rounded-md border border-gray-200"
                      side="bottom"
                      align="center"
                      sideOffset={5}
                      position="popper"
                      avoidCollisions={false}
                    >
                      <div className="py-1">
                        {loadingMasters ? (
                          <div className="px-3 py-1.5 text-xs text-gray-500 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading reasons...
                          </div>
                        ) : vacateReasons.length > 0 ? (
                          vacateReasons.map((reason: any) => (
                            <SelectItem
                              key={reason.id}
                              value={reason.value}
                              className="py-1.5 px-3 hover:bg-blue-50 text-xs cursor-pointer focus:bg-blue-400"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="text-xs font-normal">
                                  {reason.value}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-1.5 text-xs text-gray-500">
                            No vacate reasons found
                          </div>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-1 text-sm">
                    Select Tenants to Vacate
                  </h3>
                  <p className="text-xs text-purple-700">
                    Select which tenants you want to vacate from this bed.
                    {tenantsToVacate.length > 1 &&
                      " Since this is a couple booking, you can vacate one or both tenants."}
                  </p>
                </div>

                {loadingTenants ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-500" />
                    <p className="text-sm text-gray-500 mt-2">
                      Loading tenant details...
                    </p>
                  </div>
                ) : (
                  <Card className="border">
                    <CardContent className="p-3">
                      <div className="space-y-3">
                        <div className="text-sm font-medium mb-2 flex items-center gap-2">
                          <UsersRound className="h-4 w-4 text-purple-600" />
                          Tenants on this bed:
                        </div>

                        {tenantsToVacate.map((tenant, index) => (
                          <div
                            key={tenant.id}
                            className={`p-3 rounded-lg border ${tenant.selected ? "bg-purple-50 border-purple-300" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                id={`tenant_${tenant.id}`}
                                checked={tenant.selected}
                                onChange={(e) => {
                                  const updated = tenantsToVacate.map((t) =>
                                    t.id === tenant.id
                                      ? { ...t, selected: e.target.checked }
                                      : t,
                                  );
                                  setTenantsToVacate(updated);
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={`tenant_${tenant.id}`}
                                  className="font-medium text-sm cursor-pointer flex items-center gap-2"
                                >
                                  {tenant.full_name}
                                  {tenant.is_primary && tenantsToVacate.length > 1 && (
  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
    Primary
  </Badge>
)}
{!tenant.is_primary && tenantsToVacate.length > 1 && index === 1 && (
  <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
    Partner
  </Badge>
)}
{!tenant.is_primary && tenantsToVacate.length > 1 && index === 0 && (
  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
    Partner
  </Badge>
)}
{tenantsToVacate.length === 1 && tenant.is_primary && (
  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
    Primary
  </Badge>
)}
                                </label>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                                  <div className="text-xs text-gray-500">
                                    <span className="font-medium">Email:</span>{" "}
                                    {tenant.email || "N/A"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    <span className="font-medium">Phone:</span>{" "}
                                    {tenant.phone || "N/A"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    <span className="font-medium">Gender:</span>{" "}
                                    {tenant.gender || "N/A"}
                                  </div>
                                  {tenant.partner_details && (
                                    <div className="text-xs text-gray-500">
                                      <span className="font-medium">
                                        Partner:
                                      </span>{" "}
                                      {tenant.partner_details.full_name}
                                    </div>
                                  )}
                                </div>

                                {/* {tenant.partner_details && (
                                  <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                                    <div className="text-xs text-purple-600 flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      <span>
                                        Partnered with:{" "}
                                        {tenant.partner_details.full_name}
                                      </span>
                                    </div>
                                  </div>
                                )} */}
                              </div>
                            </div>
                          </div>
                        ))}

                        {tenantsToVacate.filter((t) => t.selected).length ===
                          0 && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4 inline mr-2" />
                            Please select at least one tenant to vacate
                          </div>
                        )}

                        {tenantsToVacate.length > 1 &&
                          tenantsToVacate.filter((t) => t.selected).length ===
                            1 && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                              <AlertTriangle className="h-4 w-4 inline mr-2" />
                              Only one tenant will be vacated. The other tenant
                              will remain in the bed. The bed will remain
                              occupied with the remaining tenant.
                            </div>
                          )}

                        {tenantsToVacate.length > 1 &&
                          tenantsToVacate.filter((t) => t.selected).length ===
                            2 && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                              <Info className="h-4 w-4 inline mr-2" />
                              Both tenants will be vacated. The bed will become
                              available for new assignment.
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-1 text-sm">
                    Lock-in Period Policy
                  </h3>
                  <p className="text-xs text-blue-700">
                    Lock-in status is automatically calculated.
                  </p>
                </div>

                <Card className="border">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500">
                            Lock-in Period
                          </div>
                          <div className="font-medium">
                            {bedData.lockin_period_months || 0} months
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">
                            Penalty Type
                          </div>
                          <div className="font-medium text-sm">
                            {formatLockinPenaltyType(
                              bedData.lockin_penalty_type,
                            ) || "No penalty"}
                          </div>
                        </div>
                        {bedData.lockin_penalty_amount > 0 && (
                          <div>
                            <div className="text-xs text-gray-500">
                              Penalty Amount
                            </div>
                            <div className="font-medium text-sm text-red-600">
      {(() => {
        // Calculate actual penalty amount based on type
        if (bedData.lockin_penalty_type === "percentage" && bedData.lockin_penalty_amount < 100) {
          const calculatedAmount = Math.round((securityDeposit * parseFloat(bedData.lockin_penalty_amount)) / 100);
          return formatCurrency(calculatedAmount);
        }
        return formatCurrency(bedData.lockin_penalty_amount);
      })()}
    </div>
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-gray-500">
                            Check-in Date
                          </div>
                          <div className="font-medium text-sm">
                            {formatDate(bedData.check_in_date)}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <h4 className="font-medium text-sm mb-2">
                          Lock-in Status
                        </h4>

                        {calculating ? (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                              <div className="text-xs text-gray-600">
                                Calculating lock-in status...
                              </div>
                            </div>
                          </div>
                        ) : lockinStatus ? (
                          <div
                            className={`p-3 rounded border text-sm ${
                              lockinStatus.isCompleted
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium">
                                {lockinStatus.isCompleted
                                  ? "✓ Lock-in Completed"
                                  : "✗ Lock-in Not Completed"}
                              </div>
                              <Badge
                                variant={
                                  lockinStatus.isCompleted
                                    ? "default"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {lockinStatus.isCompleted
                                  ? "No Penalty"
                                  : "Penalty Applicable"}
                              </Badge>
                            </div>
                            <div className="text-xs">
                              {lockinStatus.message}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                            <div className="text-xs text-gray-600">
                              Lock-in status will be calculated once vacate date
                              is selected.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-1 text-sm">
                    Notice Period Status
                  </h3>
                  <p className="text-xs text-blue-700">
                    Notice period is calculated from tenant's request date (
                    {tenantRequestDate ? formatDate(tenantRequestDate) : "N/A"})
                    plus {bedData.notice_period_days || 0} days, compared with
                    today's date.
                  </p>
                </div>

                <Card className="border">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500">
                            Notice Period
                          </div>
                          <div className="font-medium">
                            {bedData.notice_period_days || 0} days
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">
                            Penalty Type
                          </div>
                          <div className="font-medium text-sm">
                            {bedData.notice_penalty_type
                              ? formatLockinPenaltyType(
                                  bedData.notice_penalty_type,
                                )
                              : "Fixed penalty"}
                          </div>
                        </div>
                        {bedData.notice_penalty_amount > 0 && (
                          <div>
                            <div className="text-xs text-gray-500">
                              Penalty Amount
                            </div>
                             <div className="font-medium text-sm text-red-600">
      {(() => {
        // Calculate actual penalty amount based on type
        if (bedData.notice_penalty_type === "percentage" && bedData.notice_penalty_amount < 100) {
          const calculatedAmount = Math.round((securityDeposit * parseFloat(bedData.notice_penalty_amount)) / 100);
          return formatCurrency(calculatedAmount);
        }
        return formatCurrency(bedData.notice_penalty_amount);
      })()}
    </div>
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-gray-500">
                            Security Deposit
                          </div>
                          <div className="font-medium text-sm text-green-600">
                            {formatCurrency(bedData.security_deposit || 0)}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <h4 className="font-medium text-sm mb-2">
                          Notice Period Calculation
                        </h4>

                        {tenantRequestDate ? (
                          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <div className="text-xs font-medium text-blue-800 mb-0.5">
                              Tenant Request Date
                            </div>
                            <div className="text-xs text-gray-600">
                              Request submitted: {formatDate(tenantRequestDate)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Required notice: {bedData.notice_period_days || 0}{" "}
                              days
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Notice should be completed by:{" "}
                              {formatDate(
                                new Date(
                                  new Date(tenantRequestDate).getTime() +
                                    (bedData.notice_period_days || 0) *
                                      24 *
                                      60 *
                                      60 *
                                      1000,
                                ),
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                            <div className="text-xs font-medium text-red-800 mb-0.5">
                              No Tenant Request Date Found
                            </div>
                            <div className="text-xs text-gray-600">
                              Tenant has not submitted a vacate request. You can
                              manually set a notice date below.
                            </div>
                          </div>
                        )}

                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              id="adminNoticeOverride"
                              checked={formData.isNoticeGiven}
                              onChange={(e) =>
                                handleInputChange(
                                  "isNoticeGiven",
                                  e.target.checked,
                                )
                              }
                              className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                              htmlFor="adminNoticeOverride"
                              className="text-sm"
                            >
                              Set Manual Notice Date
                            </label>
                          </div>

                          {formData.isNoticeGiven && (
                            <div>
                              <Label className="text-sm font-medium mb-1.5 block">
                                Notice Given Date *
                              </Label>
                              <Input
                                type="date"
                                value={formData.noticeGivenDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "noticeGivenDate",
                                    e.target.value,
                                  )
                                }
                                max={currentDate}
                                className="h-9"
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                This date will be used as the notice start date
                                if tenant hasn't submitted a request.
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Show notice period status */}
                        {calculating ? (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                              <div className="text-xs text-gray-600">
                                Calculating notice period status...
                              </div>
                            </div>
                          </div>
                        ) : noticePeriodStatus ? (
                          <div
                            className={`p-3 rounded border text-sm ${
                              noticePeriodStatus.isCompleted
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium">
                                {noticePeriodStatus.isCompleted
                                  ? "✓ Notice Period Completed"
                                  : "✗ Notice Period Not Completed"}
                              </div>
                              <Badge
                                variant={
                                  noticePeriodStatus.isCompleted
                                    ? "default"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {noticePeriodStatus.isCompleted
                                  ? "No Penalty"
                                  : "Penalty Applicable"}
                              </Badge>
                            </div>
                            <div className="text-xs">
                              {noticePeriodStatus.message || ""}
                            </div>
                            {!noticePeriodStatus.isCompleted &&
                              noticePeriodStatus.daysRemaining > 0 && (
                                <div className="text-xs mt-1">
                                  <span className="font-medium">
                                    Days remaining:
                                  </span>{" "}
                                  {noticePeriodStatus.daysRemaining} days
                                </div>
                              )}
                            {noticePeriodStatus.noticeEndDate && (
                              <div className="text-xs mt-1 text-gray-600">
                                <span className="font-medium">
                                  Notice ends on:
                                </span>{" "}
                                {formatDate(noticePeriodStatus.noticeEndDate)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                            <div className="text-xs text-gray-600">
                              Unable to calculate notice period. Please ensure a
                              notice date is set.
                            </div>
                          </div>
                        )}

                        {/* <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                          <div className="text-xs text-blue-700">
                            <span className="font-medium">
                              Calculation Logic:
                            </span>
                            <br />• Notice Start Date:{" "}
                            {tenantRequestDate
                              ? formatDate(tenantRequestDate)
                              : "Manual date"}
                            <br />• Notice Period: +
                            {bedData.notice_period_days || 0} days
                            <br />• Notice End Date: Start Date +{" "}
                            {bedData.notice_period_days || 0} days
                            <br />• Compare with: Today's date (
                            {formatDate(new Date())})<br />• Penalty applies if:
                            Today &lt; Notice End Date
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-1 text-sm">
                    Select Vacate Date
                  </h3>
                  <p className="text-xs text-blue-700">
                    Set the actual vacate date.
                  </p>
                </div>

                {tenantVacateDate && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Tenant requested vacate date:{" "}
                        {formatDate(tenantVacateDate)}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      You can use this date or select a different one.
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium mb-1.5 block">
                    Actual Vacate Date *
                  </Label>
                  <Input
                    type="date"
                    value={formData.requestedVacateDate}
                    onChange={(e) =>
                      handleInputChange("requestedVacateDate", e.target.value)
                    }
                    min={currentDate}
                    required
                    className="h-9"
                  />
                  <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                    <div>
                      • This is the actual date tenant will vacate the bed
                    </div>
                    <div>• Should be at least today's date</div>
                    <div>• Used to calculate final penalties and refund</div>
                    {tenantVacateDate && (
                      <div className="text-blue-600">
                        • Tenant originally requested:{" "}
                        {formatDate(tenantVacateDate)}
                      </div>
                    )}
                  </div>
                </div>

                {/* <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      Penalties are automatically calculated based on selected
                      date and notice status. Click "Next" to see the
                      calculation.
                    </div>
                  </div>
                </div> */}
              </div>
            )}

            {step === 6 && calculation && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-1 text-sm">
                    Penalty Calculation & Summary
                  </h3>
                  <p className="text-xs text-blue-700">
                    Review penalties and approve vacate request.
                  </p>
                </div>

                <Card className="border">
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm mb-2">
                      Bed & Room Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Bed Number</div>
                        <div className="font-medium text-sm">
                          {bedData.bed_number}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Room Number</div>
                        <div className="font-medium text-sm">
                          {bedData.room_number || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Check-in Date
                        </div>
                        <div className="font-medium text-sm">
                          {formatDate(bedData.check_in_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Vacate Date</div>
                        <div className="font-medium text-sm">
                          {formatDate(formData.requestedVacateDate)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm mb-2">
                      Financial Summary
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Security Deposit
                        </div>
                        <div className="font-medium text-sm">
                          {formatCurrency(
                            calculation.financials.securityDeposit,
                          )}
                        </div>
                      </div>

                      {/* Lock-in Penalty - Show strikethrough if overridden */}
                      {calculation.financials.lockinPenalty > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div>
                            <div
                              className={`text-sm ${isAdminOverride ? "text-gray-400 line-through" : "text-gray-600"}`}
                            >
                              Lock-in Penalty
                            </div>
                            {isAdminOverride && (
                              <div className="text-xs text-green-600">
                                (Waived by admin)
                              </div>
                            )}
                          </div>
                          <div
                            className={`font-medium text-sm ${isAdminOverride ? "text-gray-400 line-through" : "text-red-600"}`}
                          >
                            -{" "}
                            {formatCurrency(
                              calculation.financials.lockinPenalty,
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notice Penalty - Show strikethrough if overridden */}
                      {calculation.financials.noticePenalty > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div>
                            <div
                              className={`text-sm ${isAdminOverride ? "text-gray-400 line-through" : "text-gray-600"}`}
                            >
                              Notice Penalty
                            </div>
                            {isAdminOverride && (
                              <div className="text-xs text-green-600">
                                (Waived by admin)
                              </div>
                            )}
                          </div>
                          <div
                            className={`font-medium text-sm ${isAdminOverride ? "text-gray-400 line-through" : "text-red-600"}`}
                          >
                            -{" "}
                            {formatCurrency(
                              calculation.financials.noticePenalty,
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="text-sm font-medium">
                          Total Penalties
                        </div>
                        <div
                          className={`font-medium text-sm ${isAdminOverride ? "text-gray-400 line-through" : "text-red-600"}`}
                        >
                          -{" "}
                          {formatCurrency(
                            isAdminOverride
                              ? 0
                              : calculation.financials.totalPenalty,
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="font-medium">Refundable Amount</div>
                        <div
                          className={`font-bold ${isAdminOverride ? "text-green-600" : calculation.financials.refundableAmount > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(
                            isAdminOverride
                              ? calculation.financials.securityDeposit
                              : calculation.financials.refundableAmount,
                          )}
                        </div>
                      </div>

                      {isAdminOverride && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-green-800 text-sm mb-1">
                                ✓ Admin Override Active
                              </div>
                              <div className="text-sm text-green-700">
                                • No penalties will be charged
                              </div>
                              <div className="text-sm text-green-700">
                                • Full security deposit of{" "}
                                {formatCurrency(
                                  calculation.financials.securityDeposit,
                                )}{" "}
                                will be refunded
                              </div>
                              <div className="text-sm text-green-700">
                                • Tenant agreement is not required
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* In step 5 - Admin Override Checkbox */}
                      <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <input
                          type="checkbox"
                          id="adminOverride"
                          checked={isAdminOverride}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setIsAdminOverride(checked);
                            if (checked) {
                              // Set penalties to 0 and refund to full deposit
                              setFormData((prev) => ({
                                ...prev,
                                lockinPenaltyApplied: false,
                                noticePenaltyApplied: false,
                                finalPenaltyAmount: 0,
                                securityRefundAmount:
                                  calculation?.financials?.securityDeposit || 0,
                                adminApproved: true,
                              }));
                              toast.info(
                                "Admin override enabled - No penalties will be applied",
                              );
                            } else {
                              // Restore original calculation
                              setFormData((prev) => ({
                                ...prev,
                                lockinPenaltyApplied:
                                  calculation?.lockinPolicy
                                    ?.penaltyApplicable || false,
                                noticePenaltyApplied:
                                  calculation?.noticePolicy
                                    ?.penaltyApplicable || false,
                                finalPenaltyAmount:
                                  calculation?.financials?.totalPenalty || 0,
                                securityRefundAmount:
                                  calculation?.financials?.refundableAmount ||
                                  0,
                                adminApproved: false,
                              }));
                            }
                          }}
                          className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="adminOverride"
                            className="font-medium text-purple-800"
                          >
                            Admin Override - No Penalty Vacate
                          </Label>
                          <p className="text-xs text-purple-600 mt-0.5">
                            Check this to bypass penalties and refund full
                            security deposit. Tenant agreement will be ignored.
                          </p>
                        </div>
                      </div>

                      {/* Admin Approval Checkbox - Original */}
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="adminApproved"
                          checked={formData.adminApproved}
                          onChange={(e) =>
                            handleInputChange("adminApproved", e.target.checked)
                          }
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                          disabled={isAdminOverride} // Disable if admin override is checked
                        />
                        <div>
                          <label
                            htmlFor="adminApproved"
                            className={`font-medium text-sm ${isAdminOverride ? "text-gray-400" : ""}`}
                          >
                            Admin Approval
                          </label>
                          <div className="text-xs text-gray-600 space-y-0.5 mt-1">
                            <div>
                              • I approve this vacate request with the
                              calculated penalties
                            </div>
                            <div>
                              • Tenant will vacate bed {bedData.bed_number} on{" "}
                              {formatDate(formData.requestedVacateDate)}
                            </div>
                            <div>
                              • Security deposit refund:{" "}
                              {formatCurrency(
                                isAdminOverride
                                  ? calculation?.financials?.securityDeposit ||
                                      0
                                  : formData.securityRefundAmount,
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Agreement Status Display - Update to show admin override message */}
                      {/* <div
                        className={`p-2 rounded text-xs ${
                          isAdminOverride
                            ? "bg-purple-50 border border-purple-200 text-purple-800"
                            : lockinStatus?.isCompleted || tenantAgreedToTerms
                              ? "bg-green-50 border border-green-200 text-green-800"
                              : "bg-red-50 border border-red-200 text-red-800"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {isAdminOverride ? (
                            <>
                              <Shield className="h-3 w-3 text-purple-600 flex-shrink-0" />
                              <span className="font-medium">
                                ✓ Admin Override:
                              </span>
                              <span>
                                Penalties waived - Full refund processed
                              </span>
                            </>
                          ) : lockinStatus?.isCompleted ||
                            tenantAgreedToTerms ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                              <span className="font-medium">
                                ✓ Agreement Status:
                              </span>
                              <span>
                                {lockinStatus?.isCompleted
                                  ? "Lock-in period completed - No penalty applicable"
                                  : "Tenant has accepted all terms"}
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0" />
                              <span>
                                <span className="font-medium">
                                  ⚠️ Agreement Status:
                                </span>
                                <span> Tenant has NOT accepted all terms</span>
                              </span>
                            </>
                          )}
                        </div>
                        {lockinStatus?.isCompleted && !isAdminOverride && (
                          <div className="mt-1 text-green-700 text-[10px]">
                            ✓ Lock-in period completed on{" "}
                            {formatDate(lockinStatus.lockInEndDate)} - No
                            lock-in penalty applies
                          </div>
                        )}
                        {isAdminOverride && (
                          <div className="mt-1 text-purple-700 text-[10px]">
                            ✓ Admin override active - Tenant vacated immediately
                            with no penalties
                          </div>
                        )}
                      </div> */}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 7 && submissionResult && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-green-800 text-lg mb-1">
                    Vacate Request Processed Successfully!
                  </h3>
                  <p className="text-green-700">
                    The bed has been marked as vacated and penalties have been
                    applied.
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Vacate Record ID: #
                    {submissionResult.vacateRecordId || "N/A"}
                  </p>
                </div>

                <Card className="border">
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm mb-2">
                      Processing Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Bed</div>
                        <div className="font-medium">
                          Bed {bedData.bed_number}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Vacate Date</div>
                        <div className="font-medium">
                          {formatDate(formData.requestedVacateDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Penalties Applied
                        </div>
                        <div className="font-medium text-red-600">
                          {formatCurrency(
                            submissionResult.financials?.totalPenalty ||
                              formData.finalPenaltyAmount,
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Refund Amount
                        </div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(
                            submissionResult.financials?.refundableAmount ||
                              formData.securityRefundAmount,
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-600">
                        This dialog will close automatically in a few seconds...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

<DialogFooter className="gap-2 pt-3 border-t px-4 pb-3 flex-shrink-0 bg-white">
  {/* Show Back button for steps > 1 and step < 7 (so it shows on Summary step too) */}
  {step > 1 && step < 7 && (
    <Button
      variant="outline"
      onClick={handleBack}
      disabled={loading || calculating}
      size="sm"
    >
      Back
    </Button>
  )}

  {/* Rest of your button conditions remain the same */}
  
  {step === 1 && (
    <Button
      onClick={handleNext}
      disabled={loading || calculating || loadingMasters || !formData.vacateReasonValue}
      size="sm"
    >
      Next
    </Button>
  )}
  
  {step === 2 && isCoupleBooking && (
    <Button
      onClick={handleNext}
      disabled={loading || tenantsToVacate.filter(t => t.selected).length === 0}
      size="sm"
    >
      Next
    </Button>
  )}
  
  {step === 3 && (
    <Button
      onClick={handleNext}
      disabled={loading || calculating}
      size="sm"
    >
      Next
    </Button>
  )}
  
  {step === 4 && (
    <Button
      onClick={handleNext}
      disabled={loading || calculating}
      size="sm"
    >
      Next
    </Button>
  )}
  
  {step === 5 && (
    <Button
      onClick={handleNext}
      disabled={loading || !formData.requestedVacateDate}
      size="sm"
    >
      Calculate Penalties
    </Button>
  )}
  
  {step === 6 && (
    <Button
      onClick={handleSubmit}
      disabled={loading || !formData.adminApproved}
      size="sm"
    >
      {loading ? (
        <>
          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
          Processing...
        </>
      ) : (
        "Approve & Process Vacate"
      )}
    </Button>
  )}
  
  {step === 7 && (
    <Button onClick={handleClose} size="sm">
      Close
    </Button>
  )}
</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
