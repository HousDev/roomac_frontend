// components/admin/rooms/VacateBedWizard.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Heart,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import { vacateApi } from "@/lib/vacateApi";
import { getMyTenantRequests } from "@/lib/tenantRequestsApi";
import { updateBedAssignment } from "@/lib/roomsApi";
import { consumeMasters } from "@/lib/masterApi";
import { VacatedTenantPaymentModal } from "../tenants/VacatedTenantPaymentModal";

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
  is_checked_disabled?: boolean;
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
  const [hasExistingPayment, setHasExistingPayment] = useState(false);

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
  const [isAdminOverrideLockin, setIsAdminOverrideLockin] = useState(false);
  const [isAdminOverrideNotice, setIsAdminOverrideNotice] = useState(false);

  const initialDataLoadedRef = useRef(false);
  const [tenantsToVacate, setTenantsToVacate] = useState<TenantWithSelection[]>(
    [],
  );
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [securityDeposit, setSecurityDeposit] = useState<number>(0);
  const [receivePaymentModalOpen, setReceivePaymentModalOpen] = useState(false);
  const [receivePaymentAmount, setReceivePaymentAmount] = useState(0);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [receivePaymentType, setReceivePaymentType] = useState<
    "refund" | "payment"
  >("payment");

  const [inspectionPenalty, setInspectionPenalty] = useState<{
    total_penalty: number;
    items: any[];
    has_inspection: boolean;
  }>({
    total_penalty: 0,
    items: [],
    has_inspection: false,
  });
  const [loadingPenalty, setLoadingPenalty] = useState(false);

  // ✅ NEW: tracks whether a move-out inspection record exists at all
  // (separate from `has_inspection` above, which only flags when there is
  // a non-zero penalty — used purely for the "inspection not done yet" toast)
  const [inspectionConducted, setInspectionConducted] = useState(false);

  // ✅ NEW: tracks rent-payment validation while checking vacate date
  const [checkingPayment, setCheckingPayment] = useState(false);

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

        if (grouped["Vacate Reason"] && grouped["Vacate Reason"].length > 0) {
          const reasons = grouped["Vacate Reason"].map((reason) => ({
            id: reason.id,
            value: reason.name,
          }));
          setVacateReasons(reasons);

          if (open && bedAssignment) {
            await checkForExistingRequest();
          }
        } else {
          if (open && bedAssignment) {
            await checkForExistingRequest();
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch rooms masters:", error);
      toast.error("Failed to load vacate reasons");
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

useEffect(() => {
  if (!open) return;

  if (tenantVacateDate) {
    // Tenant has a requested date — use it
    const formattedDate = formatDateForInput(tenantVacateDate);
    setFormData((prev) => ({
      ...prev,
      requestedVacateDate: formattedDate,
    }));
  } else if (existingVacateRequest === null) {
    // Confirmed no tenant request exists — default to today
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      requestedVacateDate: today,
    }));
  }
  // If existingVacateRequest === undefined, still loading — don't set anything yet
}, [tenantVacateDate, existingVacateRequest, open]);

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

  // Recalculate notice period when dates change - using LOCK-IN END DATE + NOTICE DAYS
  useEffect(() => {
    if (initialData && lockinStatus && formData.requestedVacateDate) {
      const status = calculateNoticePeriodStatus();
      setNoticePeriodStatus(status);
    }
  }, [initialData, lockinStatus, formData.requestedVacateDate]);

  useEffect(() => {
    if (lockinStatus !== null) {
      const isLockinCompleted = lockinStatus.isCompleted || false;
      const effectiveLockinAccepted =
        lockinAcceptedByTenant || isLockinCompleted;
      const effectiveNoticeAccepted = noticeGivenByTenant;
      const termsAgreed = effectiveLockinAccepted && effectiveNoticeAccepted;
      setTenantAgreedToTerms(termsAgreed);
      setFormData((prev) => ({
        ...prev,
        tenantAgreedToTerms: termsAgreed,
      }));
    }
  }, [lockinStatus, lockinAcceptedByTenant, noticeGivenByTenant]);

const fetchInspectionPenalty = async (tenantId: number, checkInDate: string) => {
  setLoadingPenalty(true);
  try {
    const url = `/api/move-out-inspections/penalty/tenant/${tenantId}${
      checkInDate ? `?check_in_date=${encodeURIComponent(checkInDate)}` : ""
    }`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.success && result.data && result.data.items?.length > 0) {
      setInspectionConducted(true);
      setInspectionPenalty({
        total_penalty: result.data.total_penalty,
        items: result.data.items,
        has_inspection: result.data.items.length > 0 && result.data.total_penalty > 0,
      });
    } else {
      setInspectionConducted(!!result.data?.inspection_id);
      setInspectionPenalty({ total_penalty: 0, items: [], has_inspection: false });
    }
  } catch (error) {
    console.error("Error fetching inspection penalty:", error);
    setInspectionConducted(false);
    setInspectionPenalty({ total_penalty: 0, items: [], has_inspection: false });
  } finally {
    setLoadingPenalty(false);
  }
};


  // Add handler for receive payment
  const handleReceivePayment = useCallback((amount: number) => {
    setReceivePaymentAmount(amount);
    setReceivePaymentType("payment");
    setReceivePaymentModalOpen(true);
  }, []);

const handleReceivePaymentSuccess = useCallback(async (amount: number) => {
  setPaymentReceived(true);
  toast.success(`Payment of ₹${amount.toLocaleString()} recorded successfully`);

  // ✅ Close the payment modal
  setReceivePaymentModalOpen(false);

  // ✅ The user stays on step 7 (summary) and can now click Process Vacate
  // No need to recalculate - just mark payment as received

}, []);

// Add a function to check for existing payments for this tenant
const checkExistingPayments = useCallback(async () => {
  if (!tenantDetails?.id) return;

  try {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`/api/payments/tenant/${tenantDetails.id}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      }
    });
    const result = await response.json();

    if (result.success && result.data) {
      // Check for any penalty_payment records (payment_type = 'penalty_payment')
      const penaltyPayments = result.data.filter(
        (p: any) => p.payment_type === 'penalty_payment' && p.status === 'approved'
      );

      if (penaltyPayments.length > 0) {
        const totalPaid = penaltyPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

        setPaymentReceived(true);
      } else {

        setPaymentReceived(false);
      }
    }
  } catch (error) {
    console.error("Error checking existing payments:", error);
    setPaymentReceived(false);
  }
}, [tenantDetails]);

// Call this when the wizard opens
useEffect(() => {
  if (open && tenantDetails?.id) {
    checkExistingPayments();
  }
}, [open, tenantDetails?.id, checkExistingPayments]);

// ✅ NEW: Validate that the tenant's rent is paid up through the month of
// the requested vacate date, before allowing progression to the next step.
// Uses the same /api/payments/tenant/:id endpoint already used elsewhere.
// If the endpoint/shape isn't available, this fails open (with a warning
// toast) so the wizard doesn't get permanently stuck on a missing API.
const validatePaymentTillVacateDate = async (
  vacateDateStr: string,
): Promise<boolean> => {
  if (!tenantDetails?.id || !vacateDateStr) return true;

  setCheckingPayment(true);
  try {
    const response = await fetch(
      `/api/payments/tenant/${tenantDetails.id}/payment-form`,
    );
    const result = await response.json();

    if (!result?.success || !result?.data) {
      toast.warning(
        "Could not verify payment status for this tenant. Please confirm dues manually.",
      );
      return true;
    }

    const monthWiseHistory: any[] = result.data.month_wise_history || [];
    const depositInfo = result.data.deposit_info || null;

    const vacateDate = new Date(vacateDateStr);
    const vacateMonthKey = `${vacateDate.getFullYear()}-${String(
      vacateDate.getMonth() + 1,
    ).padStart(2, "0")}`;

    // Rent dues up to the vacate month
    const pendingMonths = monthWiseHistory.filter(
      (m) => m.month_key <= vacateMonthKey && parseFloat(m.pending) > 0,
    );

    // Security deposit due — same source used to show the deposit card elsewhere
    const depositPending = depositInfo ? parseFloat(depositInfo.pending) || 0 : 0;

    if (pendingMonths.length > 0 || depositPending > 0) {
      const parts: string[] = [];

      if (pendingMonths.length > 0) {
        const monthLabels = pendingMonths
          .map((m) => `${m.month} ${m.year}`)
          .join(", ");
        parts.push(`unpaid rent for ${monthLabels}`);
      }

      if (depositPending > 0) {
        parts.push(
          `a pending security deposit of ₹${depositPending.toLocaleString("en-IN")}`,
        );
      }

      toast.error(
        `Tenant has ${parts.join(" and ")}. Please clear these dues before vacating.`,
        { duration: 6000 },
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating payment status:", error);
    toast.warning(
      "Could not verify payment status for this tenant. Please confirm dues manually.",
    );
    return true;
  } finally {
    setCheckingPayment(false);
  }
};

const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  try {
    // ✅ If the date is in ISO format with time, extract just the date part
    // This prevents timezone offset issues
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0];
      if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return datePart;
      }
    }

    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return "";
  }
};

  const checkIfLockinCompleted = async (): Promise<boolean> => {
    try {
      if (!initialData?.bedAssignment) return false;

      const checkInDateStr = initialData.bedAssignment.check_in_date;
      const lockinMonths = initialData.bedAssignment.lockin_period_months || 0;
      const currentDate = new Date();

      if (!checkInDateStr || lockinMonths === 0) {
        return true;
      }

      const checkIn = new Date(checkInDateStr);
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

      return normalizedCurrentDate >= normalizedLockInEndDate;
    } catch (error) {
      console.error("Error checking lock-in completion:", error);
      return false;
    }
  };

const extractTenantVacateData = async (vacateRequests: any[]) => {
  if (!vacateRequests || vacateRequests.length === 0) return null;

  const sortedRequests = [...vacateRequests].sort(
    (a, b) =>
      new Date(b.vacate_request_date).getTime() -
      new Date(a.vacate_request_date).getTime(),
  );
  const latestRequest = sortedRequests[0];

  const requestWithId = {
    ...latestRequest,
    id: latestRequest.vacate_request_id,
    status: latestRequest.vacate_status,
    created_at: latestRequest.vacate_request_date,
  };

  setTenantVacateData(requestWithId);

  // ✅ Extract the date correctly
  if (latestRequest.expected_vacate_date) {
    const tenantDate = latestRequest.expected_vacate_date;
    console.log("📅 Extracted tenant vacate date:", tenantDate);
    setTenantVacateDate(tenantDate);
    const formattedDate = formatDateForInput(tenantDate);
    console.log("📅 Formatted date for input:", formattedDate);
    setFormData((prev) => ({
      ...prev,
      requestedVacateDate: formattedDate,
    }));
  }

    if (latestRequest.vacate_request_date) {
      const requestDate = latestRequest.vacate_request_date.split("T")[0];
      setTenantRequestDate(requestDate);
    }

    const parseBoolean = (value: any): boolean => {
      if (value === 1 || value === "1" || value === true || value === "true")
        return true;
      if (value === 0 || value === "0" || value === false || value === "false")
        return false;
      return false;
    };

    const lockinAcceptedFromTenant = parseBoolean(
      latestRequest.lockin_penalty_accepted,
    );
    const noticeAcceptedFromTenant = parseBoolean(
      latestRequest.notice_penalty_accepted,
    );

    setLockinAcceptedByTenant(lockinAcceptedFromTenant);
    setNoticeGivenByTenant(noticeAcceptedFromTenant);

    const isLockinCompleted = await checkIfLockinCompleted();

    const effectiveLockinAccepted =
      lockinAcceptedFromTenant || isLockinCompleted;
    const effectiveNoticeAccepted = noticeAcceptedFromTenant;
    const termsAgreed = effectiveLockinAccepted && effectiveNoticeAccepted;
    setTenantAgreedToTerms(termsAgreed);

    const reasonId = latestRequest.primary_reason_id;
    const reasonText = latestRequest.primary_reason;

    if (reasonId) {
      setTenantVacateReasonId(reasonId);
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

    return requestWithId;
  };

  const updateFormWithTenantData = () => {
    if (!initialData || !tenantVacateData) return;

    const newFormData = { ...formData };

    if (tenantRequestDate) {
      newFormData.noticeGivenDate = tenantRequestDate;
      newFormData.isNoticeGiven = noticeGivenByTenant;
    }

    if (tenantVacateReasonId && vacateReasons.length > 0) {
      const reason = vacateReasons.find(
        (r: any) => r.id === tenantVacateReasonId,
      );
      if (reason) {
        setTenantVacateReason(reason.value);
        newFormData.vacateReasonValue = reason.value;
      }
    }

    newFormData.tenantAgreedToTerms = tenantAgreedToTerms;
    setFormData(newFormData);
  };

  const checkForExistingRequest = async () => {
    try {
      setIsCheckingExisting(true);
      setWizardDisabled(true);

      let adminToken = localStorage.getItem("auth_token");
      if (!adminToken) adminToken = localStorage.getItem("admin_token");
      if (!adminToken) adminToken = localStorage.getItem("token");

      if (!adminToken) {
        console.warn("⚠️ No admin token found");
        setExistingVacateRequest(null);
        setWizardDisabled(false);
        return;
      }

      const response = await fetch(
        `/api/admin/vacate-requests?tenant_id=${tenantDetails?.id}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 401) {
        console.error("❌ Unauthorized - token invalid");
        setExistingVacateRequest(null);
        setWizardDisabled(false);
        return;
      }

      const result = await response.json();

      let vacateRequests = [];
      if (result.success && Array.isArray(result.data)) {
        vacateRequests = result.data;
      }

      // ✅ FIX: Include ALL statuses, not just pending and in_progress
      // This will fetch requests that are approved, completed, rejected as well
      const currentCheckIn = tenantDetails?.check_in_date ? new Date(tenantDetails.check_in_date) : null;
const activeVacateRequests = vacateRequests.filter((request) => {
  const isVacateRequest = request.vacate_request_id !== undefined;
  const isForCurrentTenant = request.tenant_id === tenantDetails?.id;
  const isRelevantStatus = ['pending', 'in_progress', 'approved'].includes(request.vacate_status);
  const belongsToCurrentStay = !currentCheckIn ||
    new Date(request.vacate_request_date) >= currentCheckIn;
  return isVacateRequest && isForCurrentTenant && isRelevantStatus && belongsToCurrentStay;
});

      console.log("🔍 All vacate requests for tenant:", activeVacateRequests);

      if (activeVacateRequests.length > 0) {
        const tenantRequest =
          await extractTenantVacateData(activeVacateRequests);
        if (tenantRequest) {
          const requestWithId = {
            ...tenantRequest,
            id: tenantRequest.vacate_request_id,
            status: tenantRequest.request_status,
            created_at:
              tenantRequest.vacate_request_date ||
              tenantRequest.request_created,
          };
          setExistingVacateRequest(requestWithId);
          toast.info("Tenant vacate request found", {
            description: "Loading tenant's vacate request details...",
            duration: 1000,
          });
        }
      } else {
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

  const fetchFullTenant = async (tenantId: number) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Error fetching full tenant:", error);
      return null;
    }
  };

  
// Add this helper near fetchRawTenant / fetchFullTenant
const checkPartnerCurrentlyAssigned = async (partnerId: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/rooms/tenant-assignment/${partnerId}`);
    const result = await response.json();
    // getTenantAssignment returns success:true + data only when a live
    // bed assignment is found (directly or via couple/partner lookup).
    // success:false means "No active bed assignment found for this tenant".
    return !!(result && result.success && result.data);
  } catch (error) {
    console.error("Error checking partner assignment status:", error);
    // Don't silently split a real couple apart on a network hiccup —
    // default to treating them as still-partnered and let the vacate
    // record creation / bed-occupancy checks downstream sort it out.
    return true;
  }
};

const fetchPartnerDetails = async (tenantId: number) => {
  try {
    setLoadingTenants(true);
    const tenant = await fetchRawTenant(tenantId);

    if (!tenant) {
      console.error("Tenant not found");
      setTenantsToVacate([
        {
          id: tenantId,
          full_name: "Unknown",
          email: "",
          phone: "",
          gender: "",
          is_primary: false,
          selected: true,
        },
      ]);
      setIsCoupleBooking(false);
      return;
    }

    const partnerTenantId = tenant.partner_tenant_id;
    const hasPartner = partnerTenantId && partnerTenantId !== tenant.id;
    const isCurrentlyCoupleBooking =
      bedAssignment?.is_couple === true ||
      bedAssignment?.is_couple === 1 ||
      bedAssignment?.is_couple === "1";

    // ✅ REPLACE WITH THIS:
let partnerStillActive = false;
if (hasPartner && isCurrentlyCoupleBooking) {
  // checkPartnerCurrentlyAssigned() already confirms a live bed_assignments
  // row exists for the partner (directly or via primary/couple lookup) —
  // that alone proves the partner is still active. The extra is_active
  // check on /api/tenants/raw/:id was always false because that endpoint
  // doesn't return that column, so couples were silently downgraded to
  // solo vacates every single time.
  partnerStillActive = await checkPartnerCurrentlyAssigned(partnerTenantId);
}

    const isRealCoupleVacate = hasPartner && isCurrentlyCoupleBooking && partnerStillActive;
    setIsCoupleBooking(isRealCoupleVacate);

    if (!isRealCoupleVacate) {
      console.log(
        hasPartner
          ? `ℹ️ Partner ${partnerTenantId} has vacated — treating as solo vacate`
          : "ℹ️ No partner — solo vacate",
      );
      setTenantsToVacate([
        {
          id: tenant.id,
          full_name: tenant.full_name,
          email: tenant.email || "",
          phone: tenant.phone || "",
          gender: tenant.gender || "",
          is_primary: tenant.is_primary_tenant === 1,
          selected: true,
          is_checked_disabled: false,
        },
      ]);
      return;
    }

    {
      const partner = await fetchRawTenant(partnerTenantId);

      if (partner) {
        const isCurrentPrimary = tenant.is_primary_tenant === 1;

        if (isCurrentPrimary) {
          setTenantsToVacate([
            {
              id: tenant.id,
              full_name: tenant.full_name,
              email: tenant.email || "",
              phone: tenant.phone || "",
              gender: tenant.gender || "",
              is_primary: true,
              selected: true,
              is_checked_disabled: true,
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
              selected: true,
              is_checked_disabled: true,
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
          setTenantsToVacate([
            {
              id: partner.id,
              full_name: partner.full_name,
              email: partner.email || "",
              phone: partner.phone || "",
              gender: partner.gender || "",
              is_primary: true,
              selected: true,
              is_checked_disabled: true,
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
              selected: true,
              is_checked_disabled: true,
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

        setFormData((prev) => ({
          ...prev,
          isPartialVacate: false,
        }));
      } else {
        setTenantsToVacate([
          {
            id: tenant.id,
            full_name: tenant.full_name,
            email: tenant.email || "",
            phone: tenant.phone || "",
            gender: tenant.gender || "",
            is_primary: tenant.is_primary_tenant === 1,
            selected: true,
            is_checked_disabled: false,
          },
        ]);
      }
    }
  } catch (error) {
    console.error("Error fetching partner details:", error);
    toast.error("Failed to load tenant details");
    setTenantsToVacate([
      {
        id: tenantDetails?.id || 0,
        full_name: tenantDetails?.full_name || "Unknown",
        email: "",
        phone: "",
        gender: "",
        is_primary: false,
        selected: true,
        is_checked_disabled: false,
      },
    ]);
  } finally {
    setLoadingTenants(false);
  }
};

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

      // In loadInitialData function, after setting initialData:
      if (data.bedAssignment && data.bedAssignment.tenant_id) {
  await fetchInspectionPenalty(data.bedAssignment.tenant_id, data.bedAssignment.check_in_date?.split("T")[0]);
}

      if (data.bedAssignment) {
        const deposit =
          parseFloat(data.bedAssignment.security_deposit) ||
          parseFloat(data.bedAssignment.rent_per_bed) ||
          0;
        setSecurityDeposit(deposit);
      }

      if (data.bedAssignment && data.bedAssignment.tenant_id) {
        await fetchPartnerDetails(data.bedAssignment.tenant_id);
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
    if (field === "requestedVacateDate") {
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
      if (isCoupleBooking) {
        setStep(2);
      } else {
        setStep(3); // Lock-in (skipping step 2 for non-couple)
      }
    } else if (step === 2 && isCoupleBooking) {
      setStep(3);
    } else if (step === 3) {
      // Lock-in
      setStep(4); // Go to Notice
    } else if (step === 4) {
      // Notice → Inspection
      // ✅ NEW: gentle warning (not a hard block) if no inspection record exists yet
      if (!loadingPenalty && !inspectionConducted) {
        toast.warning(
          "Move-out inspection has not been recorded for this tenant yet.",
          { description: "You can still proceed, but penalties may be incomplete." },
        );
      }
      setStep(5); // Go to Inspection
    } else if (step === 5) {
      // Inspection
      // Don't validate date here, just go to Date step
      setStep(6); // Go to Date
    } else if (step === 6) {
      // Date
      if (!formData.requestedVacateDate) {
        toast.error("Please select vacate date");
        return;
      }
      // ✅ NEW: hard block if rent isn't paid up through the vacate month
      const paymentOk = await validatePaymentTillVacateDate(
        formData.requestedVacateDate,
      );
      if (!paymentOk) return;

      await calculateAllPenalties();
      setStep(7); // Go to Summary
    } else if (step === 7) {
      // Summary
      if (
        !formData.adminApproved &&
        !isAdminOverrideLockin &&
        !isAdminOverrideNotice
      ) {
        toast.error("Please approve the vacate request");
        return;
      }
      setStep(8); // Go to Result
    }
  };

  const handleBack = () => {
    if (step > 1) {
      if (!isCoupleBooking) {
        if (step === 3)
          setStep(1); // Lock-in → Reason
        else if (step === 4)
          setStep(3); // Notice → Lock-in
        else if (step === 5)
          setStep(4); // Inspection → Notice
        else if (step === 6)
          setStep(5); // Date → Inspection
        else if (step === 7)
          setStep(6); // Summary → Date
        else if (step === 8) setStep(7); // Result → Summary
      } else {
        setStep(step - 1); // Couple: all sequential 1-8
      }
    }
  };

  const getStepTitles = () => {
    if (isCoupleBooking) {
      return [
        "Reason",
        "Select Tenants",
        "Lock-in",
        "Notice",
        "Inspection",
        "Date",
        "Summary",
        "Result",
      ];
    } else {
      return [
        "Reason",
        "Lock-in",
        "Notice",
        "Inspection",
        "Date",
        "Summary",
        "Result",
      ];
    }
  };

  const getIcons = () => {
    if (isCoupleBooking) {
      return [
        FileText,
        UsersRound,
        Lock,
        Bell,
        Shield,
        CalendarIcon,
        CheckCircle,
        Check,
      ];
    } else {
      return [FileText, Lock, Bell, Shield, CalendarIcon, CheckCircle, Check];
    }
  };

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

    // ✅ FIX: Use current date for comparison, but lock-in end date is check-in + lockinMonths
    const currentDate = new Date();

    if (!checkInDateStr) {
      setLockinStatus({
        isCompleted: true,
        message: "No check-in date found",
        lockinMonths: lockinMonths,
        penaltyApplicable: false,
      });
      return;
    }

    const checkIn = new Date(checkInDateStr);

    // ✅ CRITICAL FIX: Lock-in end date = check-in date + lockin_months
    const lockInEndDate = new Date(checkIn);
    lockInEndDate.setMonth(checkIn.getMonth() + lockinMonths);

    // Normalize dates for comparison (remove time component)
    const normalizedCurrentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    const normalizedLockInEnd = new Date(
      lockInEndDate.getFullYear(),
      lockInEndDate.getMonth(),
      lockInEndDate.getDate(),
    );

    // ✅ Lock-in is completed if current date >= lock-in end date
    const isCompleted = normalizedCurrentDate >= normalizedLockInEnd;

    let remainingDays = 0;
    let remainingMonths = 0;
    let completedMonths = 0;

    if (!isCompleted) {
      const timeDiff = normalizedLockInEnd.getTime() - normalizedCurrentDate.getTime();
      remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      remainingMonths = Math.floor(remainingDays / 30);
      completedMonths = lockinMonths - remainingMonths;
    } else {
      completedMonths = lockinMonths;
    }

    let message = "";
    if (isCompleted) {
      message = `✓ Lock-in period completed (${completedMonths} months completed out of required ${lockinMonths} months)`;
    } else {
      message = `✗ Lock-in period not completed (${completedMonths} months completed out of required ${lockinMonths} months. Remaining: ${remainingMonths} month(s) / ${remainingDays} days)`;
    }

    setLockinStatus({
      isCompleted,
      message,
      lockinMonths: lockinMonths,
      completedMonths,
      remainingDays,
      remainingMonths,
      checkInDate: checkInDateStr,
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

const calculateNoticePeriodStatus = () => {
  if (!initialData?.bedAssignment) {
    return null;
  }

  const bedData = initialData.bedAssignment;
  const noticePeriodDays = bedData.notice_period_days || 0;
  const currentDate = new Date();

  // Get lock-in end date
  const checkInDateStr = bedData.check_in_date;
  const lockinMonths = bedData.lockin_period_months || 0;

  if (!checkInDateStr) {
    return {
      isNoticeRequired: false,
      message: "No check-in date found",
      penaltyApplicable: false,
      isCompleted: false,
    };
  }

  const checkIn = new Date(checkInDateStr);
  const lockInEndDate = new Date(checkIn);
  lockInEndDate.setMonth(checkIn.getMonth() + lockinMonths);

  // Normalize dates for comparison
  const normalizedCurrentDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );
  const normalizedLockInEnd = new Date(
    lockInEndDate.getFullYear(),
    lockInEndDate.getMonth(),
    lockInEndDate.getDate(),
  );

  // ✅ Check if lock-in is completed
  const isLockinCompleted = normalizedCurrentDate >= normalizedLockInEnd;

  // ✅ CRITICAL FIX: Notice period starts from lock-in end date, NOT from current date
  let noticeStartDate: Date;
  let noticeEndDate: Date;

  if (isLockinCompleted) {
    // Lock-in completed - notice starts from lock-in end date
    noticeStartDate = normalizedLockInEnd;
  } else {
    // Lock-in NOT completed - tenant is vacating early
    // Notice period hasn't even started yet because lock-in isn't done
    // So penalty should apply in full
    noticeStartDate = normalizedLockInEnd;
  }

  noticeEndDate = new Date(noticeStartDate);
  noticeEndDate.setDate(noticeStartDate.getDate() + noticePeriodDays);

  const normalizedNoticeEnd = new Date(
    noticeEndDate.getFullYear(),
    noticeEndDate.getMonth(),
    noticeEndDate.getDate(),
  );

  if (noticePeriodDays === 0) {
    return {
      isLockinCompleted,
      isNoticeRequired: false,
      message: "No notice period required",
      penaltyApplicable: false,
      isCompleted: true,
      lockInEndDate: normalizedLockInEnd.toISOString().split("T")[0],
      noticeStartDate: noticeStartDate.toISOString().split("T")[0],
      noticeEndDate: noticeEndDate.toISOString().split("T")[0],
      noticePeriodDays: 0,
      daysGiven: 0,
      daysRemaining: 0,
    };
  }

  // ✅ Calculate days given and remaining
  let daysGiven = 0;
  let daysRemaining = 0;
  let isNoticeCompleted = false;

  if (!isLockinCompleted) {
    // Lock-in NOT completed - tenant is vacating early
    // They get ZERO days credit for notice period
    daysGiven = 0;
    daysRemaining = noticePeriodDays;
    isNoticeCompleted = false;
  } else {
    // Lock-in completed - check if current date >= notice end date
    isNoticeCompleted = normalizedCurrentDate >= normalizedNoticeEnd;

    if (isNoticeCompleted) {
      daysGiven = noticePeriodDays;
      daysRemaining = 0;
    } else {
      const timeDiff = normalizedNoticeEnd.getTime() - normalizedCurrentDate.getTime();
      daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      daysGiven = noticePeriodDays - daysRemaining;

      if (daysGiven < 0) daysGiven = 0;
      if (daysRemaining < 0) daysRemaining = 0;
    }
  }

  // ✅ Penalty applies if lock-in not completed OR notice not completed
  const penaltyApplicable = !isLockinCompleted || (noticePeriodDays > 0 && !isNoticeCompleted);

  if (isLockinCompleted && isNoticeCompleted) {
    return {
      isLockinCompleted: true,
      isNoticeGiven: true,
      isCompleted: true,
      lockInEndDate: normalizedLockInEnd.toISOString().split("T")[0],
      noticeStartDate: noticeStartDate.toISOString().split("T")[0],
      noticeEndDate: normalizedNoticeEnd.toISOString().split("T")[0],
      noticePeriodDays,
      daysGiven,
      daysRemaining: 0,
      message: `✓ Notice period completed (${daysGiven} days given out of required ${noticePeriodDays} days)`,
      penaltyApplicable: false,
      waitingForLockin: false,
    };
  } else if (!isLockinCompleted) {
    // Lock-in not completed - full penalty applies
    return {
      isLockinCompleted: false,
      isNoticeGiven: false,
      isCompleted: false,
      lockInEndDate: normalizedLockInEnd.toISOString().split("T")[0],
      noticeStartDate: noticeStartDate.toISOString().split("T")[0],
      noticeEndDate: normalizedNoticeEnd.toISOString().split("T")[0],
      noticePeriodDays,
      daysGiven: 0,
      daysRemaining: noticePeriodDays,
      message: `⚠️ Lock-in period not completed. Notice period starts after lock-in ends on ${normalizedLockInEnd.toISOString().split("T")[0]}. Full ${noticePeriodDays} days penalty applies.`,
      penaltyApplicable: true,
      waitingForLockin: true,
    };
  } else {
    // Lock-in completed but notice not completed
    return {
      isLockinCompleted: true,
      isNoticeGiven: true,
      isCompleted: false,
      lockInEndDate: normalizedLockInEnd.toISOString().split("T")[0],
      noticeStartDate: noticeStartDate.toISOString().split("T")[0],
      noticeEndDate: normalizedNoticeEnd.toISOString().split("T")[0],
      noticePeriodDays,
      daysGiven,
      daysRemaining,
      message: `⚠️ Notice period not completed (${daysGiven} days given, ${daysRemaining} days remaining out of required ${noticePeriodDays} days)`,
      penaltyApplicable: true,
      waitingForLockin: false,
    };
  }
};

  const calculateAllPenalties = async () => {
    try {
      setCalculating(true);

      if (!initialData?.bedAssignment) {
        throw new Error("No bed assignment data");
      }

      const bedData = initialData.bedAssignment;
      const securityDepositAmount = parseFloat(bedData.security_deposit) || 0;
      const rentPerBed = parseFloat(bedData.rent_per_bed) || 0;

      if (!lockinStatus) {
        await checkLockinStatus();
      }

      let lockinPenalty = 0;
      let lockinPenaltyApplicable = false;
      let lockinPenaltyDescription = "";

      // Calculate LOCK-IN PENALTY
      if (isAdminOverrideLockin) {
        lockinPenalty = 0;
        lockinPenaltyApplicable = false;
        lockinPenaltyDescription = "Waived by admin override";
      } else if (lockinStatus && lockinStatus.penaltyApplicable) {
        lockinPenaltyApplicable = true;
        const penaltyAmount = parseFloat(bedData.lockin_penalty_amount) || 0;
        const penaltyType = bedData.lockin_penalty_type || "";

        if (penaltyAmount > 0) {
          if (penaltyType === "percentage" && penaltyAmount < 100) {
            lockinPenalty = Math.round(
              (securityDepositAmount * penaltyAmount) / 100,
            );
            lockinPenaltyDescription = `${penaltyAmount}% of security deposit (${formatCurrency(lockinPenalty)})`;
          } else {
            lockinPenalty = penaltyAmount;
            lockinPenaltyDescription = `Fixed penalty (${formatCurrency(lockinPenalty)})`;
          }
        } else if (penaltyType) {
          if (penaltyType.includes("%")) {
            const percentage = parseInt(penaltyType);
            lockinPenalty = Math.round(
              (securityDepositAmount * percentage) / 100,
            );
            lockinPenaltyDescription = `${penaltyType} of security deposit (${formatCurrency(lockinPenalty)})`;
          } else if (penaltyType.includes("one_month_rent")) {
            lockinPenalty = rentPerBed;
            lockinPenaltyDescription = `One month rent (${formatCurrency(lockinPenalty)})`;
          } else {
            lockinPenalty = rentPerBed;
            lockinPenaltyDescription = `Standard penalty (${formatCurrency(lockinPenalty)})`;
          }
        } else {
          lockinPenalty = rentPerBed;
          lockinPenaltyDescription = `One month rent (${formatCurrency(lockinPenalty)})`;
        }
      } else if (lockinStatus?.isCompleted) {
        lockinPenaltyDescription = "No penalty - Lock-in period completed";
      }

      let noticePenalty = 0;
      let noticePenaltyApplicable = false;
      let noticePenaltyDescription = "";

      const noticeStatus = calculateNoticePeriodStatus();
      setNoticePeriodStatus(noticeStatus);

      // Calculate NOTICE PENALTY
      if (isAdminOverrideNotice) {
        noticePenalty = 0;
        noticePenaltyApplicable = false;
        noticePenaltyDescription = "Waived by admin override";
      } else if (noticeStatus?.penaltyApplicable) {
        noticePenaltyApplicable = true;
        const penaltyAmount = parseFloat(bedData.notice_penalty_amount) || 0;
        const penaltyType = bedData.notice_penalty_type || "";

        if (penaltyAmount > 0) {
          if (penaltyType === "percentage" && penaltyAmount < 100) {
            noticePenalty = Math.round(
              (securityDepositAmount * penaltyAmount) / 100,
            );
            noticePenaltyDescription = `${penaltyAmount}% of security deposit (${formatCurrency(noticePenalty)})`;
          } else {
            noticePenalty = penaltyAmount;
            noticePenaltyDescription = `Fixed penalty (${formatCurrency(noticePenalty)})`;
          }
        } else if (penaltyType) {
          if (penaltyType.includes("%")) {
            const percentage = parseInt(penaltyType);
            noticePenalty = Math.round(
              (securityDepositAmount * percentage) / 100,
            );
            noticePenaltyDescription = `${penaltyType} of security deposit (${formatCurrency(noticePenalty)})`;
          } else if (penaltyType.includes("one_month_rent")) {
            noticePenalty = rentPerBed;
            noticePenaltyDescription = `One month rent (${formatCurrency(noticePenalty)})`;
          } else {
            noticePenalty = rentPerBed;
            noticePenaltyDescription = `Standard penalty (${formatCurrency(noticePenalty)})`;
          }
        } else {
          noticePenalty = rentPerBed;
          noticePenaltyDescription = `One month rent (${formatCurrency(noticePenalty)})`;
        }
      } else if (noticeStatus?.isCompleted) {
        noticePenaltyDescription = "No penalty - Notice period completed";
      }

      // ✅ ADD INSPECTION PENALTY (from move-out inspection)
      let inspectionPenaltyAmount = inspectionPenalty.total_penalty;
      let inspectionPenaltyDescription = "";

      if (inspectionPenaltyAmount > 0) {
        inspectionPenaltyDescription = `Move-out inspection penalty (${inspectionPenalty.items.length} damaged/missing items)`;
        console.log(`🔍 Inspection penalty: ₹${inspectionPenaltyAmount}`);
      }

      // ✅ FIX: Calculate total penalty correctly - ADD both penalties
      const totalPenalty =
        lockinPenalty + noticePenalty + inspectionPenaltyAmount;
      const refundableAmount = securityDepositAmount - totalPenalty;

      console.log("💰 Penalty Calculation:", {
        securityDepositAmount,
        lockinPenalty,
        noticePenalty,
        totalPenalty,
        refundableAmount,
        isAdminOverrideLockin,
        isAdminOverrideNotice,
        lockinPenaltyApplicable,
        noticePenaltyApplicable,
      });

      setFormData((prev) => ({
        ...prev,
        lockinPenaltyApplied: lockinPenalty > 0,
        noticePenaltyApplied: noticePenalty > 0,
        finalPenaltyAmount: totalPenalty,
        securityRefundAmount: Math.max(0, refundableAmount),
      }));

      setCalculation({
        financials: {
          securityDeposit: securityDepositAmount,
          lockinPenalty,
          noticePenalty,
          inspectionPenalty: inspectionPenaltyAmount,
          totalPenalty,
          refundableAmount: refundableAmount,
        },
        lockinPolicy: {
          isCompleted: lockinStatus?.isCompleted || false,
          periodMonths: bedData.lockin_period_months || 0,
          penaltyType: bedData.lockin_penalty_type || "",
          penaltyAmount: bedData.lockin_penalty_amount || 0,
          penaltyDescription: lockinPenaltyDescription,
          checkInDate: bedData.check_in_date,
          lockInEndDate: lockinStatus?.lockInEndDate,
          penaltyApplicable: lockinPenaltyApplicable && !isAdminOverrideLockin,
        },
        noticePolicy: {
          isNoticeRequired: noticeStatus?.isNoticeRequired ?? true,
          isNoticeGiven: noticeStatus?.isNoticeGiven || false,
          isCompleted: noticeStatus?.isCompleted || false,
          lockInEndDate: noticeStatus?.lockInEndDate || null,
          noticeStartDate: noticeStatus?.noticeStartDate || null,
          noticeEndDate: noticeStatus?.noticeEndDate || null,
          periodDays: noticeStatus?.noticePeriodDays || 0,
          daysCompleted: noticeStatus?.daysGiven || 0,
          daysRemaining: noticeStatus?.daysRemaining || 0,
          penaltyType: bedData.notice_penalty_type || "",
          penaltyAmount: bedData.notice_penalty_amount || 0,
          penaltyDescription: noticePenaltyDescription,
          message: noticeStatus?.message || "",
          penaltyApplicable: noticePenaltyApplicable && !isAdminOverrideNotice,
        },
        inspectionPenalty: {
          amount: inspectionPenaltyAmount,
          items: inspectionPenalty.items,
          has_inspection: inspectionPenalty.has_inspection,
          description: inspectionPenaltyDescription,
        },
      });
    } catch (error) {
      console.error("❌ Error calculating penalties:", error);
      toast.error("Error calculating penalties");
    } finally {
      setCalculating(false);
    }
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
const handleSubmit = async () => {
  try {
    setLoading(true);

    const selectedTenants = tenantsToVacate.filter((t) => t.selected);

    if (selectedTenants.length === 0) {
      toast.error("Please select at least one tenant to vacate");
      setLoading(false);
      return;
    }

    // ✅ Get all tenant IDs
    const tenantIds = selectedTenants.map(t => t.id);
    const isPartialVacate = selectedTenants.length < tenantsToVacate.length;

    console.log("📢 Vacating tenants:", {
      tenantIds,
      isPartialVacate,
      totalTenants: tenantsToVacate.length,
      selectedCount: selectedTenants.length
    });

    // Calculate final amounts
    let finalLockinPenaltyAmount = 0;
    let finalNoticePenaltyAmount = 0;
    let finalInspectionPenaltyAmount = 0;
    let finalTotalPenaltyAmount = 0;
    let finalRefundableAmount = 0;
    let finalLockinPenaltyApplied = false;
    let finalNoticePenaltyApplied = false;

    // For partial vacate (only one tenant in couple booking), split the amounts
    const isPartialVacateSelected = selectedTenants.length === 1 && tenantsToVacate.length === 2;

    finalInspectionPenaltyAmount = isPartialVacateSelected
      ? Math.floor((inspectionPenalty.total_penalty || 0) / 2)
      : inspectionPenalty.total_penalty || 0;

    // ✅ Calculate the actual refundable amount based on whether payment was received
    let actualRefundableAmount = calculation?.financials?.refundableAmount || 0;

    // ✅ If payment was received (tenant owed money), set refundable to 0
    if (paymentReceived && actualRefundableAmount < 0) {
      actualRefundableAmount = 0;
    }

    if (isAdminOverrideLockin || isAdminOverrideNotice) {
      // Individual overrides
      if (isAdminOverrideLockin) {
        finalLockinPenaltyAmount = 0;
        finalLockinPenaltyApplied = false;
      } else {
        finalLockinPenaltyAmount = isPartialVacateSelected
          ? Math.floor((calculation?.financials?.lockinPenalty || formData.finalPenaltyAmount) / 2)
          : calculation?.financials?.lockinPenalty || formData.finalPenaltyAmount;
        finalLockinPenaltyApplied = formData.lockinPenaltyApplied;
      }

      if (isAdminOverrideNotice) {
        finalNoticePenaltyAmount = 0;
        finalNoticePenaltyApplied = false;
      } else {
        finalNoticePenaltyAmount = isPartialVacateSelected
          ? Math.floor((calculation?.financials?.noticePenalty || 0) / 2)
          : calculation?.financials?.noticePenalty || 0;
        finalNoticePenaltyApplied = formData.noticePenaltyApplied;
      }

      finalTotalPenaltyAmount = finalLockinPenaltyAmount + finalNoticePenaltyAmount + finalInspectionPenaltyAmount;
      finalRefundableAmount = (calculation?.financials?.securityDeposit || securityDeposit) - finalTotalPenaltyAmount;

    } else {
      // No admin override - use calculated values
      finalLockinPenaltyAmount = isPartialVacateSelected
        ? Math.floor((calculation?.financials?.lockinPenalty || formData.finalPenaltyAmount) / 2)
        : calculation?.financials?.lockinPenalty || formData.finalPenaltyAmount;

      finalNoticePenaltyAmount = isPartialVacateSelected
        ? Math.floor((calculation?.financials?.noticePenalty || 0) / 2)
        : calculation?.financials?.noticePenalty || 0;

      finalInspectionPenaltyAmount = isPartialVacateSelected
        ? Math.floor(inspectionPenalty.total_penalty / 2)
        : inspectionPenalty.total_penalty || 0;

      finalTotalPenaltyAmount = finalLockinPenaltyAmount + finalNoticePenaltyAmount + finalInspectionPenaltyAmount;
      finalRefundableAmount = (calculation?.financials?.securityDeposit || securityDeposit) - finalTotalPenaltyAmount;
      finalLockinPenaltyApplied = formData.lockinPenaltyApplied;
      finalNoticePenaltyApplied = formData.noticePenaltyApplied;
    }

    // ✅ If payment was received for negative refundable amount, set to 0
    const safeRefundableAmount = paymentReceived && finalRefundableAmount < 0
      ? 0
      : Math.max(0, finalRefundableAmount);

    // ✅ Build payload with tenantIds array
    const payload = {
      bedAssignmentId: bedAssignment.id,
      tenantIds: tenantIds, // ✅ Send ALL tenant IDs in one array
      vacateReasonValue: isAdminOverrideLockin || isAdminOverrideNotice
        ? `Admin forced vacate - ${formData.vacateReasonValue || tenantVacateReason}`
        : tenantVacateReason || formData.vacateReasonValue,
      isNoticeGiven: noticeGivenByTenant || formData.isNoticeGiven || true,
      noticeGivenDate: tenantRequestDate || formData.noticeGivenDate || new Date().toISOString().split("T")[0],
      requestedVacateDate: formData.requestedVacateDate,
      tenantAgreed: true,
      lockinPeriodMonths: initialData?.bedAssignment?.lockin_period_months || 0,
      lockinPenaltyType: initialData?.bedAssignment?.lockin_penalty_type || "",
      lockinPenaltyAmount: finalLockinPenaltyAmount,
      noticePeriodDays: initialData?.bedAssignment?.notice_period_days || 0,
      noticePenaltyType: initialData?.bedAssignment?.notice_penalty_type || "",
      noticePenaltyAmount: finalNoticePenaltyAmount,
      inspectionPenaltyAmount: finalInspectionPenaltyAmount,
      securityDepositAmount: initialData?.bedAssignment?.security_deposit || securityDeposit || 0,
      totalPenaltyAmount: finalTotalPenaltyAmount,
      refundableAmount: safeRefundableAmount,
      lockinPenaltyApplied: finalLockinPenaltyApplied,
      noticePenaltyApplied: finalNoticePenaltyApplied,
      adminApproved: formData.adminApproved || isAdminOverrideLockin || isAdminOverrideNotice,
      tenantVacateRequestId: existingVacateRequest?.id,
      isPartialVacate: isPartialVacate,
      isLockinAdminOverride: isAdminOverrideLockin,
      isNoticeAdminOverride: isAdminOverrideNotice,
      paymentReceived: paymentReceived,
    };

    console.log("📤 Submitting vacate request with payload:", {
      tenantIds: payload.tenantIds,
      isPartialVacate: payload.isPartialVacate,
      refundableAmount: payload.refundableAmount,
    });

    // ✅ SINGLE API CALL
    const response = await vacateApi.submitVacateRequest(payload);

    if (response && response.success) {
      const successMessage = tenantIds.length === 1
        ? `Successfully vacated ${selectedTenants[0].full_name}`
        : `Successfully vacated ${tenantIds.length} tenants`;

      toast.success(successMessage);

      // ✅ Refresh data and close
      if (onVacateComplete) {
        onVacateComplete();
      }

      setStep(7);
      setTimeout(() => {
        onOpenChange(false);
        resetWizard();
      }, 2000);

    } else {
      toast.error(response?.message || "Failed to vacate tenants");
    }

  } catch (error) {
    console.error("❌ Error submitting vacate request:", error);
    toast.error(error.message || "Failed to submit vacate request.");
  } finally {
    setLoading(false);
  }
};

  const resetWizard = () => {
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
    setIsAdminOverrideLockin(false);
    setIsAdminOverrideNotice(false);
    setPaymentReceived(false);  // ✅ Reset payment received state
    setInspectionConducted(false);
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
    initialDataLoadedRef.current = false;
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };
  const getStepIndex = () => {
    if (isCoupleBooking) {
      return step - 1; // steps 1-8 → index 0-7, direct mapping
    } else {
      // Non-couple steps: 1, 3, 4, 5, 6, 7, 8 (step 2 is skipped)
      if (step === 1) return 0; // Reason
      if (step === 3) return 1; // Lock-in
      if (step === 4) return 2; // Notice
      if (step === 5) return 3; // Inspection
      if (step === 6) return 4; // Date
      if (step === 7) return 5; // Summary
      if (step === 8) return 6; // Result
      return 0;
    }
  };

  if (loading && !initialData) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base">Admin: Vacate Bed</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-gray-500" />
            <p className="text-xs text-gray-600">Loading bed information...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !initialData?.bedAssignment) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base text-red-600">Error</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-gray-600 mb-3 text-xs">
              {error || "Failed to load data"}
            </p>
            <Button variant="outline" onClick={handleClose} size="sm" className="text-xs">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const bedData = initialData.bedAssignment;
  const stepTitles = getStepTitles();

  // ── Compact status pill used across Lock-in / Notice steps ──────────────
  const StatusPill = ({
    tone,
    icon: Icon,
    children,
  }: {
    tone: "green" | "red" | "purple";
    icon: any;
    children: React.ReactNode;
  }) => {
    const toneClasses =
      tone === "green"
        ? "bg-green-50 text-green-700 border-green-200"
        : tone === "purple"
          ? "bg-purple-50 text-purple-700 border-purple-200"
          : "bg-red-50 text-red-700 border-red-200";
    return (
      <div
        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium ${toneClasses}`}
      >
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        <span>{children}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[calc(100%-32px)] max-w-md md:max-w-lg max-h-[80vh] overflow-hidden flex flex-col p-0 rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
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
                Step {getStepIndex() + 1}/{stepTitles.length}
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
          <div className="py-1.5 text-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto text-blue-500" />
          </div>
        )}

        {isCheckingExisting && (
          <div className="py-3 text-center">
            <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-blue-500" />
            <p className="text-xs text-gray-600">
              Checking for existing requests...
            </p>
          </div>
        )}

        {/* ✅ Tenant's own vacate request — shown ONLY on step 1, compact single card */}
        {step === 1 && existingVacateRequest && !isCheckingExisting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-2 mx-2 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-blue-800 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Tenant Request #{existingVacateRequest.id}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {existingVacateRequest.status}
              </Badge>
            </div>
            <div className="text-blue-700">
              Submitted {formatDate(existingVacateRequest.created_at)} · Lock-in:{" "}
              <span className={lockinAcceptedByTenant || lockinStatus?.isCompleted ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                {lockinAcceptedByTenant || lockinStatus?.isCompleted ? "Accepted" : "Not accepted"}
              </span>{" "}
              · Notice:{" "}
              <span className={noticeGivenByTenant ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                {noticeGivenByTenant ? "Accepted" : "Not accepted"}
              </span>
            </div>
            <div
              className={`mt-1 flex items-center gap-1 font-medium ${
                tenantAgreedToTerms ? "text-green-700" : "text-amber-700"
              }`}
            >
              {tenantAgreedToTerms ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              {tenantAgreedToTerms
                ? "Agreed to all terms"
                : "Has not agreed to all terms"}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-2">
            <div className="px-2 py-1.5 bg-gray-50 border-b border-gray-200 rounded-t-md flex-shrink-0">
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
                          className={`absolute top-2.5 left-1/2 w-full h-0.5 -translate-x-1/2 ${
                            getStepIndex() > index
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        />
                      )}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 z-10 mb-0.5 ${
                          getStepIndex() >= index
                            ? "bg-white border-blue-600 text-blue-600"
                            : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        {getStepIndex() > index ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <StepIcon className="h-3 w-3" />
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-medium truncate w-full text-center ${
                          getStepIndex() >= index
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
            </div>

            {/* STEP 1: VACATE REASON */}
            {step === 1 && (
              <div className="space-y-2.5 p-2">
                {tenantVacateReason && (
                  <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs">
                    <span className="font-medium text-amber-800">
                      Tenant selected: {tenantVacateReason}
                    </span>{" "}
                    <span className="text-amber-700">— you can change it.</span>
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
                      <SelectValue placeholder="Select a reason..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto bg-white shadow-lg rounded-md border border-gray-200">
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
                              className="py-1.5 px-3 hover:bg-blue-50 text-xs cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="text-xs">{reason.value}</span>
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

{/* STEP 2: SELECT TENANTS (Only for Couple Bookings) */}
{step === 2 && isCoupleBooking && (
  <div className="space-y-2.5 p-2">
    <div className="bg-purple-50 p-2.5 rounded-lg text-xs text-purple-700 flex items-center gap-1.5">
      <UsersRound className="h-3.5 w-3.5" />
      Both tenants in this couple booking will be vacated together.
    </div>

    {loadingTenants ? (
      <div className="text-center py-6">
        <Loader2 className="h-5 w-5 animate-spin mx-auto text-purple-500" />
      </div>
    ) : (
      <Card className="border">
        <CardContent className="p-2.5 space-y-2">
          {tenantsToVacate.map((tenant) => (
            <div
              key={tenant.id}
              className={`p-2.5 rounded-lg border ${tenant.selected ? "bg-purple-50 border-purple-300" : "bg-gray-50 border-gray-200"}`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id={`tenant_${tenant.id}`}
                  checked={tenant.selected}
                  disabled={tenant.is_checked_disabled || false}
                  onChange={(e) => {
                    if (!tenant.is_checked_disabled) {
                      const updated = tenantsToVacate.map((t) =>
                        t.id === tenant.id
                          ? { ...t, selected: e.target.checked }
                          : t,
                      );
                      setTenantsToVacate(updated);
                    }
                  }}
                  className={`h-4 w-4 rounded border-gray-300 ${
                    tenant.is_checked_disabled
                      ? "cursor-not-allowed opacity-60"
                      : "text-purple-600 focus:ring-purple-500"
                  } mt-0.5`}
                />
                <div className="flex-1">
                  <label
                    htmlFor={`tenant_${tenant.id}`}
                    className="font-medium text-sm flex items-center gap-1.5 flex-wrap"
                  >
                    {tenant.full_name}
                    {tenant.is_primary ? (
                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                        Primary
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-pink-50 text-pink-700 border-pink-200">
                        Partner
                      </Badge>
                    )}
                  </label>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {tenant.email || "N/A"} · {tenant.phone || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {tenantsToVacate.filter((t) => t.selected).length === 0 && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
              <AlertCircle className="h-3.5 w-3.5 inline mr-1.5" />
              Please select at least one tenant to vacate
            </div>
          )}
        </CardContent>
      </Card>
    )}
  </div>
)}

            {/* STEP 3: LOCK-IN PERIOD */}
            {step === 3 && (
              <div className="space-y-2.5 p-2">
                <Card className="border">
                  <CardContent className="p-3 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <div className="text-gray-500">Lock-in Period</div>
                        <div className="font-medium text-gray-800">
                          {bedData.lockin_period_months || 0} months
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Check-in Date</div>
                        <div className="font-medium text-gray-800">
                          {formatDate(bedData.check_in_date)}
                        </div>
                      </div>
                      {lockinStatus?.penaltyApplicable && (
                        <div className="col-span-2">
                          <div className="text-gray-500">Penalty Amount</div>
                          <div className="font-medium text-red-600">
                            {(() => {
                              if (
                                bedData.lockin_penalty_type === "percentage" &&
                                bedData.lockin_penalty_amount < 100
                              ) {
                                const calculatedAmount = Math.round(
                                  (securityDeposit *
                                    parseFloat(bedData.lockin_penalty_amount)) /
                                    100,
                                );
                                return formatCurrency(calculatedAmount);
                              }
                              return formatCurrency(bedData.lockin_penalty_amount || 0);
                            })()}{" "}
                            <span className="text-gray-500 font-normal">
                              ({formatLockinPenaltyType(bedData.lockin_penalty_type)})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {calculating ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Checking lock-in status...
                      </div>
                    ) : lockinStatus ? (
                      <StatusPill
                        tone={
                          isAdminOverrideLockin
                            ? "purple"
                            : lockinStatus.isCompleted
                              ? "green"
                              : "red"
                        }
                        icon={
                          isAdminOverrideLockin
                            ? Shield
                            : lockinStatus.isCompleted
                              ? CheckCircle
                              : AlertTriangle
                        }
                      >
                        {isAdminOverrideLockin
                          ? "Waived by admin override — no penalty"
                          : lockinStatus.isCompleted
                            ? `Completed on ${formatDate(lockinStatus.lockInEndDate)} — no penalty`
                            : `${lockinStatus.remainingDays || 0} day(s) remaining — penalty applies`}
                      </StatusPill>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Admin Override for Lock-in - Only show if penalty is applicable */}
                {lockinStatus && lockinStatus.penaltyApplicable && (
                  <div className="flex items-start gap-2 p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="adminOverrideLockin"
                      checked={isAdminOverrideLockin}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsAdminOverrideLockin(checked);
                        toast.info(
                          checked
                            ? "Lock-in penalty will be waived"
                            : "Standard lock-in rules apply",
                        );
                        calculateAllPenalties();
                      }}
                      className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="adminOverrideLockin"
                        className="font-medium text-purple-800 text-sm"
                      >
                        Admin Override — Waive Lock-in Penalty
                      </Label>
                    </div>
                  </div>
                )}

                {/* Tenant Agreement Status for Lock-in */}
                {existingVacateRequest && !isAdminOverrideLockin && lockinStatus?.penaltyApplicable && (
                  <StatusPill
                    tone={lockinAcceptedByTenant ? "green" : "red"}
                    icon={lockinAcceptedByTenant ? CheckCircle : AlertTriangle}
                  >
                    {lockinAcceptedByTenant
                      ? "Tenant accepted lock-in penalty"
                      : "Tenant has NOT accepted lock-in penalty"}
                  </StatusPill>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-2.5 p-2">
                <Card className="border">
                  <CardContent className="p-3 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <div className="text-gray-500">Notice Period</div>
                        <div className="font-medium text-gray-800">
                          {bedData.notice_period_days || 0} days
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Security Deposit</div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(bedData.security_deposit || 0)}
                        </div>
                      </div>
                      {noticePeriodStatus?.penaltyApplicable && bedData.notice_penalty_amount > 0 && (
                        <div className="col-span-2">
                          <div className="text-gray-500">Penalty Amount</div>
                          <div className="font-medium text-red-600">
                            {(() => {
                              if (
                                bedData.notice_penalty_type === "percentage" &&
                                bedData.notice_penalty_amount < 100
                              ) {
                                const calculatedAmount = Math.round(
                                  (securityDeposit *
                                    parseFloat(bedData.notice_penalty_amount)) /
                                    100,
                                );
                                return formatCurrency(calculatedAmount);
                              }
                              return formatCurrency(bedData.notice_penalty_amount || 0);
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    {calculating ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Checking notice period...
                      </div>
                    ) : noticePeriodStatus ? (
                      <StatusPill
                        tone={
                          isAdminOverrideNotice
                            ? "purple"
                            : noticePeriodStatus.isCompleted
                              ? "green"
                              : "red"
                        }
                        icon={
                          isAdminOverrideNotice
                            ? Shield
                            : noticePeriodStatus.isCompleted
                              ? CheckCircle
                              : AlertTriangle
                        }
                      >
                        {isAdminOverrideNotice
                          ? "Waived by admin override — no penalty"
                          : !noticePeriodStatus.isLockinCompleted
                            ? `Lock-in not completed — full ${noticePeriodStatus.noticePeriodDays} day notice penalty applies`
                            : noticePeriodStatus.isCompleted
                              ? `Completed (${noticePeriodStatus.daysGiven} of ${noticePeriodStatus.noticePeriodDays} days given) — no penalty`
                              : `${noticePeriodStatus.daysRemaining} day(s) short of required notice — penalty applies`}
                      </StatusPill>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Admin Override for Notice - Only show if penalty is applicable */}
                {noticePeriodStatus && noticePeriodStatus.penaltyApplicable && (
                  <div className="flex items-start gap-2 p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="adminOverrideNotice"
                      checked={isAdminOverrideNotice}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsAdminOverrideNotice(checked);
                        toast.info(
                          checked
                            ? "Notice period penalty will be waived"
                            : "Standard notice period rules apply",
                        );
                        calculateAllPenalties();
                      }}
                      className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="adminOverrideNotice"
                        className="font-medium text-purple-800 text-sm"
                      >
                        Admin Override — Waive Notice Penalty
                      </Label>
                    </div>
                  </div>
                )}

                {/* Tenant Agreement Status for Notice */}
                {existingVacateRequest && !isAdminOverrideNotice && noticePeriodStatus?.penaltyApplicable && (
                  <StatusPill
                    tone={noticeGivenByTenant ? "green" : "red"}
                    icon={noticeGivenByTenant ? CheckCircle : AlertTriangle}
                  >
                    {noticeGivenByTenant
                      ? "Tenant accepted notice period terms"
                      : "Tenant has NOT accepted notice period terms"}
                  </StatusPill>
                )}
              </div>
            )}

            {/* STEP 5: INSPECTION PENALTY */}
            {step === 5 && (
              <div className="space-y-2.5 p-2">
                {loadingPenalty ? (
                  <div className="text-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-purple-500 mb-1.5" />
                    <p className="text-xs text-gray-500">Loading inspection data...</p>
                  </div>
                ) : !inspectionConducted ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                    <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-1.5" />
                    <p className="text-sm font-medium text-amber-800">
                      No Move-Out Inspection Found
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      No inspection record exists for this tenant yet. You can
                      proceed, but penalties will not include damage charges.
                    </p>
                  </div>
                ) : inspectionPenalty.has_inspection &&
                  inspectionPenalty.items.length > 0 ? (
                  <Card className="border-purple-200">
                    <CardContent className="p-3 space-y-2">
                      {inspectionPenalty.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div>
                            <p className="font-medium text-gray-800">{item.item_name}</p>
                            <p className="text-gray-500">
                              {item.condition_at_movein} → {item.condition_at_moveout}
                            </p>
                          </div>
                          <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">
                            {formatCurrency(item.penalty_amount)}
                          </Badge>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-purple-200 flex items-center justify-between">
                        <span className="text-sm font-bold text-purple-800">Total</span>
                        <span className="text-base font-bold text-red-600">
                          {formatCurrency(inspectionPenalty.total_penalty)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <StatusPill tone="green" icon={CheckCircle}>
                    Inspection completed — no damage penalties
                  </StatusPill>
                )}
              </div>
            )}

            {/* STEP 6: VACATE DATE */}
            {step === 6 && (
              <div className="space-y-2.5 p-2">
                {tenantVacateDate && (
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-800 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      Tenant requested: {formatDate(tenantVacateDate)}
                    </div>
                    <p className="text-amber-700 mt-0.5">Auto-filled — you can change it.</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium mb-1.5 block">
                    Actual Vacate Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.requestedVacateDate || new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      handleInputChange("requestedVacateDate", e.target.value)
                    }
                    required
                    className="h-9"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    This is the actual date the tenant will vacate the bed.
                  </p>
                </div>

                {checkingPayment && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Verifying rent payment status...
                  </div>
                )}
              </div>
            )}

            {step === 7 && calculation && (
              <div className="space-y-2.5 p-2">
                <Card className="border">
                  <CardContent className="p-3">
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <div className="text-gray-500">Bed / Room</div>
                        <div className="font-medium text-gray-800">
                          {bedData.bed_number} / {bedData.room_number || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Vacate Date</div>
                        <div className="font-medium text-gray-800">
                          {formatDate(formData.requestedVacateDate)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Security Deposit</span>
                      <span className="font-medium">
                        {formatCurrency(calculation.financials.securityDeposit)}
                      </span>
                    </div>

                    {calculation.financials.lockinPenalty > 0 && (
                      <div className="flex justify-between items-center">
                        <span className={isAdminOverrideLockin ? "text-gray-400 line-through" : "text-gray-600"}>
                          Lock-in Penalty
                        </span>
                        <span className={isAdminOverrideLockin ? "text-gray-400 line-through" : "font-medium text-red-600"}>
                          - {formatCurrency(isAdminOverrideLockin ? 0 : calculation.financials.lockinPenalty)}
                        </span>
                      </div>
                    )}

                    {calculation.financials.noticePenalty > 0 && (
                      <div className="flex justify-between items-center">
                        <span className={isAdminOverrideNotice ? "text-gray-400 line-through" : "text-gray-600"}>
                          Notice Penalty
                        </span>
                        <span className={isAdminOverrideNotice ? "text-gray-400 line-through" : "font-medium text-red-600"}>
                          - {formatCurrency(isAdminOverrideNotice ? 0 : calculation.financials.noticePenalty)}
                        </span>
                      </div>
                    )}

                    {calculation?.inspectionPenalty?.amount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Inspection Penalty</span>
                        <span className="font-medium text-red-600">
                          - {formatCurrency(calculation.inspectionPenalty.amount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1.5 border-t">
                      <span className="font-medium">Total Penalties</span>
                      <span className="font-medium text-red-600">
                        - {formatCurrency(calculation.financials.totalPenalty)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1.5 border-t">
                      <span className="font-medium">
                        {calculation.financials.refundableAmount >= 0 ? "Refundable Amount" : "Amount Due from Tenant"}
                      </span>
                      <span className={`font-bold ${calculation.financials.refundableAmount >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {calculation.financials.refundableAmount >= 0
                          ? formatCurrency(calculation.financials.refundableAmount)
                          : formatCurrency(Math.abs(calculation.financials.refundableAmount))}
                      </span>
                    </div>

                    {calculation.financials.refundableAmount < 0 && !paymentReceived && (
                      <div className="mt-2 p-2.5 bg-orange-50 border border-orange-200 rounded-lg text-xs">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-orange-800">
                              Payment of {formatCurrency(Math.abs(calculation.financials.refundableAmount))} required
                            </p>
                            <Button
                              size="sm"
                              className="mt-2 bg-orange-600 hover:bg-orange-700 text-white h-7 text-xs"
                              onClick={() => handleReceivePayment(Math.abs(calculation.financials.refundableAmount))}
                            >
                              <IndianRupee className="w-3 h-3 mr-1" />
                              Record Payment
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {calculation.financials.refundableAmount < 0 && paymentReceived && (
                      <StatusPill tone="green" icon={CheckCircle}>
                        Payment recorded — ready to process
                      </StatusPill>
                    )}

                    {calculation.financials.refundableAmount > 0 && (
                      <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                        <Info className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                        Refund of {formatCurrency(calculation.financials.refundableAmount)} will be processed within 15 working days.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="p-3 space-y-2">
                    {existingVacateRequest &&
                      !isAdminOverrideLockin &&
                      !isAdminOverrideNotice && (
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="adminApproved"
                            checked={formData.adminApproved}
                            onChange={(e) =>
                              handleInputChange("adminApproved", e.target.checked)
                            }
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                          />
                          <label htmlFor="adminApproved" className="text-sm font-medium">
                            Approve Tenant's Vacate Request
                          </label>
                        </div>
                      )}

                    {(!existingVacateRequest || isAdminOverrideLockin || isAdminOverrideNotice) && (
                      <StatusPill tone="purple" icon={Info}>
                        {isAdminOverrideLockin || isAdminOverrideNotice
                          ? "Admin override active — bed will vacate immediately"
                          : "Direct admin vacate — no tenant approval required"}
                      </StatusPill>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* STEP 8: RESULT */}
            {step === 8 && (
              <div className="space-y-3 p-2">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-green-100 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-medium text-green-800 text-base mb-1">
                    Vacate Processed Successfully!
                  </h3>
                  <p className="text-green-700 text-sm">The bed has been marked as vacated.</p>

                  {calculation?.financials?.refundableAmount > 0 && (
                    <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-left text-xs">
                      <p className="font-medium text-amber-800">
                        Refund of {formatCurrency(calculation.financials.refundableAmount)} due
                      </p>
                      <p className="text-amber-700 mt-0.5">
                        Will be processed within 15 working days.
                      </p>
                    </div>
                  )}

                  {calculation?.financials?.refundableAmount === 0 &&
                    calculation?.financials?.totalPenalty > 0 && (
                      <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-left text-xs">
                        <p className="font-medium text-red-800">No Refund Due</p>
                        <p className="text-red-700 mt-0.5">
                          Penalties fully covered the security deposit.
                        </p>
                      </div>
                    )}

                  <p className="text-xs text-green-600 mt-2">Closing dialog...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2.5 border-t px-4 pb-2.5 flex-shrink-0 bg-white">
          {step > 1 && step < 8 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading || calculating}
              size="sm"
            >
              Back
            </Button>
          )}

          {step === 1 && (
            <Button
              onClick={handleNext}
              disabled={
                loading ||
                calculating ||
                loadingMasters ||
                !formData.vacateReasonValue
              }
              size="sm"
            >
              Next
            </Button>
          )}

          {step === 2 && isCoupleBooking && (
            <Button
              onClick={handleNext}
              disabled={
                loading ||
                tenantsToVacate.filter((t) => t.selected).length === 0
              }
              size="sm"
            >
              Next
            </Button>
          )}

          {(step === 3 || step === 4 || step === 5) && (
            <Button
              onClick={handleNext}
              disabled={loading || calculating}
              size="sm"
            >
              Next
            </Button>
          )}

          {step === 6 && ( // Date step - runs payment validation, then calculates penalties
            <Button
              onClick={handleNext}
              disabled={loading || checkingPayment || !formData.requestedVacateDate}
              size="sm"
            >
              {checkingPayment ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Calculate Penalties"
              )}
            </Button>
          )}

          {step === 7 && ( // Summary step - Process
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                (existingVacateRequest &&
                  !isAdminOverrideLockin &&
                  !isAdminOverrideNotice &&
                  !formData.adminApproved) ||
                  (calculation?.financials?.refundableAmount < 0 && !paymentReceived)
              }
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Vacate"
              )}
            </Button>
          )}

          {step === 8 && (
            <Button onClick={handleClose} size="sm">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
      {/* Add Receive Payment Modal */}
<VacatedTenantPaymentModal
  open={receivePaymentModalOpen}
  onOpenChange={setReceivePaymentModalOpen}
  tenant={{ id: tenantDetails?.id, full_name: tenantDetails?.full_name }}
  amount={receivePaymentAmount}
  type={receivePaymentType}
  onSuccess={handleReceivePaymentSuccess}
/>
    </Dialog>
  );
}