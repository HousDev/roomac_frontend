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
  Shield, // Add this line
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
        }
      }
    } catch (error) {
      console.error("Failed to fetch rooms masters:", error);
      toast.error("Failed to load vacate reasons");
    } finally {
      setLoadingMasters(false);
    }
  };

  // Reset when wizard opens
  useEffect(() => {
    if (open && bedAssignment) {
      fetchRoomsMasters();
      checkForExistingRequest();
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

  const extractTenantVacateData = async (requests: any[]) => {
    const vacateRequests = requests.filter((request) => {
      const isVacateBed = request.request_type === "vacate_bed";
      const isForCurrentTenant = request.tenant_id === tenantDetails?.id;
      const isActiveStatus = ["pending", "in_progress", "approved"].includes(
        request.status,
      );
      return isVacateBed && isForCurrentTenant && isActiveStatus;
    });

    if (vacateRequests.length > 0) {
      const latestRequest = vacateRequests[0];

      const vacateData = latestRequest.vacate_data || {};

      if (vacateData.expected_vacate_date) {
        const tenantDate = vacateData.expected_vacate_date;
        setTenantVacateDate(tenantDate);
      }

      // Set tenant request date
      if (latestRequest.created_at) {
        const requestDate = latestRequest.created_at.split("T")[0];
        setTenantRequestDate(requestDate);
      }

      // Parse boolean values correctly
      const parseBoolean = (value: any): boolean => {
        if (value === 1 || value === "1" || value === true || value === "true")
          return true;
        if (
          value === 0 ||
          value === "0" ||
          value === false ||
          value === "false"
        )
          return false;
        return false;
      };

      const lockinAcceptedFromTenant = parseBoolean(
        vacateData.lockin_penalty_accepted ??
          latestRequest.lockin_penalty_accepted,
      );

      const noticeAcceptedFromTenant = parseBoolean(
        vacateData.notice_penalty_accepted ??
          latestRequest.notice_penalty_accepted,
      );

      setLockinAcceptedByTenant(lockinAcceptedFromTenant);
      setNoticeGivenByTenant(noticeAcceptedFromTenant);

      // 🔥 FIX: Calculate actual agreement status based on lock-in completion
      // Don't just rely on tenant's acceptance - check if lock-in is actually completed
      const isLockinCompleted = await checkIfLockinCompleted();

      // Lock-in is considered "accepted" if:
      // 1. Tenant accepted it, OR
      // 2. Lock-in period is already completed (no penalty anyway)
      const effectiveLockinAccepted =
        lockinAcceptedFromTenant || isLockinCompleted;

      // Notice is considered "accepted" if tenant accepted it
      const effectiveNoticeAccepted = noticeAcceptedFromTenant;

      const termsAgreed = effectiveLockinAccepted && effectiveNoticeAccepted;
      setTenantAgreedToTerms(termsAgreed);

      // Store reason ID for later lookup
      if (vacateData.primary_reason_id || latestRequest.primary_reason_id) {
        const reasonId =
          vacateData.primary_reason_id || latestRequest.primary_reason_id;
        setTenantVacateReasonId(reasonId);
      }

      setTenantVacateData(latestRequest);
      return latestRequest;
    }

    return null;
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

      // Check if tenant token exists
      if (!checkTenantAuth()) {
        setExistingVacateRequest(null);
        setWizardDisabled(false);
        return;
      }

      // Try to get tenant requests
      const allRequests = await getMyTenantRequests();

      if (!Array.isArray(allRequests)) {
        console.error(
          "❌ getMyTenantRequests did not return an array:",
          allRequests,
        );
        setExistingVacateRequest(null);
        setWizardDisabled(false);
        return;
      }

      // Filter for vacate requests
      const vacateRequests = allRequests.filter((request) => {
        const isVacateBed = request.request_type === "vacate_bed";
        const isForCurrentTenant = request.tenant_id === tenantDetails?.id;
        const isActiveStatus = ["pending", "in_progress", "approved"].includes(
          request.status,
        );

        return isVacateBed && isForCurrentTenant && isActiveStatus;
      });

      if (vacateRequests.length > 0) {
        const tenantRequest = await extractTenantVacateData(vacateRequests);

        if (tenantRequest) {
          setExistingVacateRequest(tenantRequest);
          toast.info("Tenant vacate request found", {
            description: "Loading tenant's vacate request details...",
            duration: 2000,
          });
        }
      } else {
        setExistingVacateRequest(null);
      }

      setWizardDisabled(false);
    } catch (error) {
      console.error("❌ Error checking existing request:", error);
      // Log the full error details
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      setExistingVacateRequest(null);
      setWizardDisabled(false);
    } finally {
      setIsCheckingExisting(false);
    }
  };

  const loadInitialData = async () => {
    // Prevent multiple calls
    if (initialDataLoadedRef.current) {
      return;
    }

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

      // Mark as loaded BEFORE processing the data
      initialDataLoadedRef.current = true;

      // 🚨 Check if there's an existing vacate request in the initial data
      // In loadInitialData function, update the section where you process existingVacateRequest:

      if (data.existingVacateRequest) {
        const tenantRequest = data.existingVacateRequest;

        // Make sure vacate_data exists
        const vacateData = tenantRequest.vacate_data || {};

        // Set tenant request data
        setExistingVacateRequest(tenantRequest);

        // Set tenant vacate date
        if (
          vacateData.expected_vacate_date ||
          tenantRequest.expected_vacate_date
        ) {
          const date =
            vacateData.expected_vacate_date ||
            tenantRequest.expected_vacate_date;
          setTenantVacateDate(date);
        }

        // Set tenant request date
        if (tenantRequest.created_at) {
          const requestDate = tenantRequest.created_at.split("T")[0];
          setTenantRequestDate(requestDate);
        }

        // IMPORTANT: Parse boolean values correctly
        // Handle both 1/0 and true/false
        const parseBoolean = (value: any): boolean => {
          if (
            value === 1 ||
            value === "1" ||
            value === true ||
            value === "true"
          )
            return true;
          if (
            value === 0 ||
            value === "0" ||
            value === false ||
            value === "false"
          )
            return false;
          return false; // default
        };

        // Check if tenant accepted penalties - parse from multiple possible locations
        const lockinAccepted = parseBoolean(
          vacateData.lockin_penalty_accepted ??
            tenantRequest.lockin_penalty_accepted ??
            false,
        );

        const noticeAccepted = parseBoolean(
          vacateData.notice_penalty_accepted ??
            tenantRequest.notice_penalty_accepted ??
            false,
        );

        setLockinAcceptedByTenant(lockinAccepted);
        setNoticeGivenByTenant(noticeAccepted);

        // Tenant agrees to terms if they accepted BOTH penalties
        const termsAgreed = lockinAccepted && noticeAccepted;
        setTenantAgreedToTerms(termsAgreed);

        // Store reason ID for later lookup
        if (vacateData.primary_reason_id || tenantRequest.primary_reason_id) {
          const reasonId =
            vacateData.primary_reason_id || tenantRequest.primary_reason_id;
          setTenantVacateReasonId(reasonId);
        }

        // Store reason text
        if (vacateData.primary_reason || tenantRequest.primary_reason) {
          const reason =
            vacateData.primary_reason || tenantRequest.primary_reason;
          setTenantVacateReason(reason);
        }

        setTenantVacateData(tenantRequest);
      } else {
      }

      // Only set default if no tenant date
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load vacate data";
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
    if (step === 1) {
      if (!formData.vacateReasonValue) {
        toast.error("Please select a vacate reason");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (formData.isNoticeGiven && !formData.noticeGivenDate) {
        toast.error("Please select notice given date");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!formData.requestedVacateDate) {
        toast.error("Please select vacate date");
        return;
      }
      await calculateAllPenalties();
      setStep(5);
    } else if (step === 5) {
      if (!formData.adminApproved) {
        toast.error("Please approve the vacate request");
        return;
      }
      setStep(6);
    }
  };

  // Fix the checkLockinStatus function - Calculate lock-in end date and compare with current date
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
      const lockinMonths =
        initialData?.bedAssignment?.lockin_period_months || 0;
      const currentDate = new Date(); // Use current date

      if (!checkInDateStr) {
        setLockinStatus({
          isCompleted: true,
          message: "No check-in date found, cannot calculate lock-in period",
          lockinMonths: lockinMonths,
          penaltyApplicable: false,
        });
        return;
      }

      const checkIn = new Date(checkInDateStr);

      // Calculate lock-in end date: check-in date + lock-in months
      const lockInEndDate = new Date(checkIn);
      lockInEndDate.setMonth(checkIn.getMonth() + lockinMonths);

      // Normalize dates for comparison (remove time component)
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

      // Check if current date is ON OR AFTER lock-in end date
      const isCompleted = normalizedCurrentDate >= normalizedLockInEndDate;

      // Calculate how many months have been completed
      const monthsDiff =
        (normalizedCurrentDate.getFullYear() - checkIn.getFullYear()) * 12 +
        (normalizedCurrentDate.getMonth() - checkIn.getMonth());
      const completedMonths = Math.max(0, Math.min(monthsDiff, lockinMonths));

      // Calculate remaining if not completed
      let remainingDays = 0;
      let remainingMonths = 0;

      if (!isCompleted) {
        const remainingTime =
          normalizedLockInEndDate.getTime() - normalizedCurrentDate.getTime();
        remainingDays = Math.ceil(remainingTime / (1000 * 3600 * 24));
        remainingMonths = Math.ceil(remainingDays / 30);
      }

      const message = isCompleted
        ? `Lock-in period completed (${completedMonths} months completed out of required ${lockinMonths} months)`
        : `Lock-in period not completed (${completedMonths} months completed out of required ${lockinMonths} months. Remaining: ${remainingMonths} months / ${remainingDays} days)`;

      setLockinStatus({
        isCompleted,
        message,
        lockinMonths: lockinMonths,
        completedMonths: completedMonths,
        remainingMonths: remainingMonths,
        remainingDays: remainingDays,
        checkInDate: checkInDateStr,
        currentDate: normalizedCurrentDate.toISOString().split("T")[0],
        lockInEndDate: lockInEndDate.toISOString().split("T")[0],
        penaltyApplicable: !isCompleted,
      });
    } catch (error) {
      console.error("Error checking lock-in status:", error);

      // Fallback calculation
      const checkInDateStr = initialData?.bedAssignment?.check_in_date;
      const lockinMonths =
        initialData?.bedAssignment?.lockin_period_months || 0;

      if (!checkInDateStr || lockinMonths === 0) {
        setLockinStatus({
          isCompleted: true,
          message: "No lock-in data available",
          lockinMonths: 0,
          penaltyApplicable: false,
        });
        return;
      }

      try {
        const checkIn = new Date(checkInDateStr);
        const currentDate = new Date();
        const lockInEndDate = new Date(checkIn);
        lockInEndDate.setMonth(checkIn.getMonth() + lockinMonths);

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

        const isCompleted = normalizedCurrentDate >= normalizedLockInEndDate;

        setLockinStatus({
          isCompleted,
          message: isCompleted
            ? "Lock-in period completed"
            : "Lock-in period not completed",
          lockinMonths: lockinMonths,
          penaltyApplicable: !isCompleted,
        });
      } catch (e) {
        setLockinStatus({
          isCompleted: false,
          message: "Error calculating lock-in period",
          lockinMonths: lockinMonths,
          penaltyApplicable: true,
        });
      }
    } finally {
      setCalculating(false);
    }
  };

  // Fix the calculateNoticePeriodStatus function - Calculate notice end date and compare with current date
  const calculateNoticePeriodStatus = () => {
    if (!initialData?.bedAssignment) {
      return null;
    }

    const bedData = initialData.bedAssignment;
    const noticePeriodDays = bedData.notice_period_days || 0;
    const currentDate = new Date(); // Use current date

    if (noticePeriodDays === 0) {
      return {
        isNoticeRequired: false,
        message: "No notice period required",
        penaltyApplicable: false,
        isCompleted: true,
      };
    }

    // Notice starts from tenant's request date (or admin override)
    // Use tenant's request date if available, otherwise use admin's override date
    const noticeStartDateStr =
      tenantRequestDate ||
      (formData.isNoticeGiven ? formData.noticeGivenDate : null);

    if (!noticeStartDateStr) {
      return {
        isNoticeGiven: false,
        isCompleted: false,
        message: "No notice given - penalty applies",
        penaltyApplicable: true,
      };
    }

    const noticeStartDate = new Date(noticeStartDateStr);

    // Calculate notice end date: notice start date + notice period days
    const noticeEndDate = new Date(noticeStartDate);
    noticeEndDate.setDate(noticeStartDate.getDate() + noticePeriodDays);

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
    const normalizedCurrentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );

    // Check if current date is ON OR AFTER notice end date
    const isNoticeCompleted = normalizedCurrentDate >= normalizedNoticeEndDate;

    // Calculate days since notice given
    const daysSinceNotice = Math.ceil(
      (normalizedCurrentDate.getTime() - normalizedNoticeStartDate.getTime()) /
        (1000 * 3600 * 24),
    );

    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (normalizedNoticeEndDate.getTime() - normalizedCurrentDate.getTime()) /
          (1000 * 3600 * 24),
      ),
    );

    if (isNoticeCompleted) {
      return {
        isNoticeGiven: true,
        isCompleted: true,
        noticeStartDate: normalizedNoticeStartDate.toISOString().split("T")[0],
        noticeEndDate: normalizedNoticeEndDate.toISOString().split("T")[0],
        noticePeriodDays,
        daysCompleted: daysSinceNotice,
        message: `Notice period completed (${daysSinceNotice} days served out of required ${noticePeriodDays} days)`,
        penaltyApplicable: false,
      };
    } else {
      return {
        isNoticeGiven: true,
        isCompleted: false,
        noticeStartDate: normalizedNoticeStartDate.toISOString().split("T")[0],
        noticeEndDate: normalizedNoticeEndDate.toISOString().split("T")[0],
        noticePeriodDays,
        daysCompleted: daysSinceNotice,
        daysRemaining,
        message: `Notice period not completed (${daysSinceNotice} days served, ${daysRemaining} days remaining out of ${noticePeriodDays} days required)`,
        penaltyApplicable: true, // Penalty applies if notice period is still running
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

      if (lockinStatus && lockinStatus.penaltyApplicable) {
        lockinPenaltyApplicable = true;

        // Get penalty from tenant data
        const penaltyAmount = parseFloat(bedData.lockin_penalty_amount) || 0;
        const penaltyType = bedData.lockin_penalty_type || "";

        if (penaltyAmount > 0) {
          lockinPenalty = penaltyAmount;
          lockinPenaltyDescription = `Fixed penalty (₹${lockinPenalty.toLocaleString("en-IN")})`;
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

      if (noticeStatus?.penaltyApplicable) {
        noticePenaltyApplicable = true;

        // Get penalty from tenant data
        const penaltyAmount = parseFloat(bedData.notice_penalty_amount) || 0;
        const penaltyType = bedData.notice_penalty_type || "";

        if (penaltyAmount > 0) {
          noticePenalty = penaltyAmount;
          noticePenaltyDescription = `Fixed penalty (₹${noticePenalty.toLocaleString("en-IN")})`;
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

  // Enhanced penalty calculation helper
  const calculatePenaltyAmount = (
    penaltyType: string,
    securityDeposit: number,
    rentPerBed: number,
  ) => {
    if (!penaltyType) return 0;

    const lowerType = penaltyType.toLowerCase();

    // Check for percentage-based penalties
    if (lowerType.includes("%")) {
      const percentageMatch = lowerType.match(/(\d+)%/);
      if (percentageMatch) {
        const percentage = parseInt(percentageMatch[1]);
        return Math.round((securityDeposit * percentage) / 100);
      }
    }

    // Check for fixed amounts in the type (e.g., "₹2000", "2000_fixed")
    const fixedAmountMatch = lowerType.match(/₹?(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (fixedAmountMatch) {
      const amountStr = fixedAmountMatch[1].replace(/,/g, "");
      return parseFloat(amountStr) || 0;
    }

    // Check for common penalty types
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
    setFormData(prev => ({
      ...prev,
      adminApproved: true
    }));
  }
}, [existingVacateRequest, initialData, isCheckingExisting]);

const handleSubmit = async () => {
  try {
    setLoading(true);

    // Calculate final amounts based on admin override
    const finalPenaltyAmount = isAdminOverride ? 0 : formData.finalPenaltyAmount;
    const finalRefundAmount = isAdminOverride 
      ? (initialData?.bedAssignment?.security_deposit || 0)
      : formData.securityRefundAmount;

    const payload = {
      bedAssignmentId: bedAssignment.id,
      tenantId: tenantDetails?.id || bedAssignment.tenant_id,
      vacateReasonValue: isAdminOverride ? 'Admin forced vacate' : formData.vacateReasonValue,
      isNoticeGiven: isAdminOverride ? true : formData.isNoticeGiven,
      noticeGivenDate: isAdminOverride ? new Date().toISOString().split('T')[0] : (formData.noticeGivenDate || tenantRequestDate),
      requestedVacateDate: formData.requestedVacateDate,
      tenantAgreed: isAdminOverride ? true : tenantAgreedToTerms,
      lockinPeriodMonths: initialData?.bedAssignment?.lockin_period_months || 0,
      lockinPenaltyType: initialData?.bedAssignment?.lockin_penalty_type || '',
      lockinPenaltyAmount: isAdminOverride ? 0 : (initialData?.bedAssignment?.lockin_penalty_amount || 0),
      noticePeriodDays: initialData?.bedAssignment?.notice_period_days || 0,
      noticePenaltyType: initialData?.bedAssignment?.notice_penalty_type || '',
      noticePenaltyAmount: isAdminOverride ? 0 : (initialData?.bedAssignment?.notice_penalty_amount || 0),
      securityDepositAmount: initialData?.bedAssignment?.security_deposit || 0,
      totalPenaltyAmount: finalPenaltyAmount,
      refundableAmount: finalRefundAmount,
      lockinPenaltyApplied: !isAdminOverride && formData.lockinPenaltyApplied,
      noticePenaltyApplied: !isAdminOverride && formData.noticePenaltyApplied,
      adminApproved: formData.adminApproved,
      tenantVacateRequestId: existingVacateRequest?.id,
      isAdminOverride: isAdminOverride  // ✅ Pass this flag
    };

    const response = await vacateApi.submitVacateRequest(payload);

    if (response && response.success) {
      setSubmissionResult(response.data);
      toast.success(response.message || "Bed vacated successfully by admin!");

      if (onVacateComplete) {
        onVacateComplete();
      }

      try {
        await updateBedAssignment(bedAssignment.id.toString(), {
          tenant_id: null,
          tenant_gender: null,
          is_available: true,
        });
      } catch (updateError) {
        console.error("⚠️ Could not update bed assignment:", updateError);
      }

      setStep(6);

      setTimeout(() => {
        onOpenChange(false);
        resetWizard();
      }, 3000);
    } else {
      const errorMessage = response?.message || response?.data?.message || "Failed to submit vacate request";
      toast.error(errorMessage);
    }
  } catch (error) {
    console.error("❌ Error submitting vacate request:", error);
    const err = error as any;
    if (err?.response) {
      const errorMessage = err.response.data?.message || err.message || "Failed to submit vacate request";
      toast.error(errorMessage);
    } else {
      toast.error((err as Error)?.message || "Failed to submit vacate request.");
    }
  } finally {
    setLoading(false);
  }
};

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const resetWizard = () => {
    if (step !== 6) {
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
    if (step === 6) {
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
  const stepTitles = [
    "Reason",
    "Lock-in",
    "Notice",
    "Date",
    "Summary",
    "Result",
  ];

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
                  const icons = [
                    FileText,
                    Lock,
                    Bell,
                    CalendarIcon,
                    CheckCircle,
                    Check,
                  ];
                  const StepIcon = icons[index] || Check;
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
                              {formatCurrency(bedData.lockin_penalty_amount)}
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

            {step === 3 && (
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
                              {formatCurrency(bedData.notice_penalty_amount)}
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

                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
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
                        </div>
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

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      Penalties are automatically calculated based on selected
                      date and notice status. Click "Next" to see the
                      calculation.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && calculation && (
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
    <h4 className="font-medium text-sm mb-2">Financial Summary</h4>
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">Security Deposit</div>
        <div className="font-medium text-sm">
          {formatCurrency(calculation.financials.securityDeposit)}
        </div>
      </div>

      {/* Lock-in Penalty - Show strikethrough if overridden */}
      {calculation.financials.lockinPenalty > 0 && (
        <div className="flex justify-between items-center pt-2 border-t">
          <div>
            <div className={`text-sm ${isAdminOverride ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
              Lock-in Penalty
            </div>
            {isAdminOverride && (
              <div className="text-xs text-green-600">(Waived by admin)</div>
            )}
          </div>
          <div className={`font-medium text-sm ${isAdminOverride ? 'text-gray-400 line-through' : 'text-red-600'}`}>
            - {formatCurrency(calculation.financials.lockinPenalty)}
          </div>
        </div>
      )}

      {/* Notice Penalty - Show strikethrough if overridden */}
      {calculation.financials.noticePenalty > 0 && (
        <div className="flex justify-between items-center pt-2 border-t">
          <div>
            <div className={`text-sm ${isAdminOverride ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
              Notice Penalty
            </div>
            {isAdminOverride && (
              <div className="text-xs text-green-600">(Waived by admin)</div>
            )}
          </div>
          <div className={`font-medium text-sm ${isAdminOverride ? 'text-gray-400 line-through' : 'text-red-600'}`}>
            - {formatCurrency(calculation.financials.noticePenalty)}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t">
        <div className="text-sm font-medium">Total Penalties</div>
        <div className={`font-medium text-sm ${isAdminOverride ? 'text-gray-400 line-through' : 'text-red-600'}`}>
          - {formatCurrency(isAdminOverride ? 0 : calculation.financials.totalPenalty)}
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t">
        <div className="font-medium">Refundable Amount</div>
        <div className={`font-bold ${isAdminOverride ? 'text-green-600' : (calculation.financials.refundableAmount > 0 ? 'text-green-600' : 'text-red-600')}`}>
          {formatCurrency(isAdminOverride ? calculation.financials.securityDeposit : calculation.financials.refundableAmount)}
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
                • Full security deposit of {formatCurrency(calculation.financials.securityDeposit)} will be refunded
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
        setFormData(prev => ({
          ...prev,
          lockinPenaltyApplied: false,
          noticePenaltyApplied: false,
          finalPenaltyAmount: 0,
          securityRefundAmount: calculation?.financials?.securityDeposit || 0,
          adminApproved: true
        }));
        toast.info("Admin override enabled - No penalties will be applied");
      } else {
        // Restore original calculation
        setFormData(prev => ({
          ...prev,
          lockinPenaltyApplied: calculation?.lockinPolicy?.penaltyApplicable || false,
          noticePenaltyApplied: calculation?.noticePolicy?.penaltyApplicable || false,
          finalPenaltyAmount: calculation?.financials?.totalPenalty || 0,
          securityRefundAmount: calculation?.financials?.refundableAmount || 0,
          adminApproved: false
        }));
      }
    }}
    className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 mt-0.5"
  />
  <div className="flex-1">
    <Label htmlFor="adminOverride" className="font-medium text-purple-800">
      Admin Override - No Penalty Vacate
    </Label>
    <p className="text-xs text-purple-600 mt-0.5">
      Check this to bypass penalties and refund full security deposit. 
      Tenant agreement will be ignored.
    </p>
  </div>
</div>

      {/* Admin Approval Checkbox - Original */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="adminApproved"
          checked={formData.adminApproved}
          onChange={(e) => handleInputChange("adminApproved", e.target.checked)}
          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
          disabled={isAdminOverride} // Disable if admin override is checked
        />
        <div>
          <label
            htmlFor="adminApproved"
            className={`font-medium text-sm ${isAdminOverride ? 'text-gray-400' : ''}`}
          >
            Admin Approval
          </label>
          <div className="text-xs text-gray-600 space-y-0.5 mt-1">
            <div>
              • I approve this vacate request with the calculated penalties
            </div>
            <div>
              • Tenant will vacate bed {bedData.bed_number} on{" "}
              {formatDate(formData.requestedVacateDate)}
            </div>
            <div>
              • Security deposit refund:{" "}
              {formatCurrency(
                isAdminOverride 
                  ? (calculation?.financials?.securityDeposit || 0)
                  : formData.securityRefundAmount
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Agreement Status Display - Update to show admin override message */}
      <div
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
              <span className="font-medium">✓ Admin Override:</span>
              <span>Penalties waived - Full refund processed</span>
            </>
          ) : lockinStatus?.isCompleted || tenantAgreedToTerms ? (
            <>
              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span className="font-medium">✓ Agreement Status:</span>
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
                <span className="font-medium">⚠️ Agreement Status:</span>
                <span> Tenant has NOT accepted all terms</span>
              </span>
            </>
          )}
        </div>
        {lockinStatus?.isCompleted && !isAdminOverride && (
          <div className="mt-1 text-green-700 text-[10px]">
            ✓ Lock-in period completed on{" "}
            {formatDate(lockinStatus.lockInEndDate)} - No lock-in penalty
            applies
          </div>
        )}
        {isAdminOverride && (
          <div className="mt-1 text-purple-700 text-[10px]">
            ✓ Admin override active - Tenant vacated immediately with no penalties
          </div>
        )}
      </div>
    </div>
  </CardContent>
</Card>
              </div>
            )}

            {step === 6 && submissionResult && (
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
          {step > 1 && step < 6 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading || calculating}
              size="sm"
            >
              Back
            </Button>
          )}

          {step < 5 ? (
            <Button
              onClick={handleNext}
              disabled={loading || calculating || loadingMasters}
              size="sm"
            >
              {calculating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Next"
              )}
            </Button>
          ) : step === 5 ? (
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
          ) : (
            <Button onClick={handleClose} size="sm">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
