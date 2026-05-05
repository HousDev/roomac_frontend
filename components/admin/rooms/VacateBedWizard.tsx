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
  Heart,
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
  const [noticeGivenByTenant, setNoticeGivenByTenant] = useState<boolean>(false);
  const [lockinAcceptedByTenant, setLockinAcceptedByTenant] = useState<boolean>(false);
  const [tenantVacateDate, setTenantVacateDate] = useState<string>("");
  const [tenantRequestDate, setTenantRequestDate] = useState<string>("");
  const [tenantVacateReason, setTenantVacateReason] = useState<string>("");
  const [tenantVacateReasonId, setTenantVacateReasonId] = useState<number | null>(null);
  const [tenantAgreedToTerms, setTenantAgreedToTerms] = useState<boolean>(false);
  const [noticePeriodStatus, setNoticePeriodStatus] = useState<any>(null);
  const [isAdminOverrideLockin, setIsAdminOverrideLockin] = useState(false);
  const [isAdminOverrideNotice, setIsAdminOverrideNotice] = useState(false);
  
  const initialDataLoadedRef = useRef(false);
  const [tenantsToVacate, setTenantsToVacate] = useState<TenantWithSelection[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
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
    if (tenantVacateDate && open) {
      const formattedDate = formatDateForInput(tenantVacateDate);
      setFormData((prev) => ({
        ...prev,
        requestedVacateDate: formattedDate,
      }));
    }
  }, [tenantVacateDate, open]);

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
      const effectiveLockinAccepted = lockinAcceptedByTenant || isLockinCompleted;
      const effectiveNoticeAccepted = noticeGivenByTenant;
      const termsAgreed = effectiveLockinAccepted && effectiveNoticeAccepted;
      setTenantAgreedToTerms(termsAgreed);
      setFormData((prev) => ({
        ...prev,
        tenantAgreedToTerms: termsAgreed,
      }));
    }
  }, [lockinStatus, lockinAcceptedByTenant, noticeGivenByTenant]);

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

    const latestRequest = vacateRequests[0];
    
    const requestWithId = {
      ...latestRequest,
      id: latestRequest.vacate_request_id,
      status: latestRequest.request_status,
      created_at: latestRequest.vacate_request_date || latestRequest.request_created,
    };
    
    setTenantVacateData(requestWithId);
    
    if (latestRequest.expected_vacate_date) {
      const tenantDate = latestRequest.expected_vacate_date;
      setTenantVacateDate(tenantDate);
      const formattedDate = formatDateForInput(tenantDate);
      setFormData((prev) => ({
        ...prev,
        requestedVacateDate: formattedDate,
      }));
    }

    if (latestRequest.vacate_request_date) {
      const requestDate = latestRequest.vacate_request_date.split("T")[0];
      setTenantRequestDate(requestDate);
    } else if (latestRequest.request_created) {
      const requestDate = latestRequest.request_created.split("T")[0];
      setTenantRequestDate(requestDate);
    }

    const parseBoolean = (value: any): boolean => {
      if (value === 1 || value === "1" || value === true || value === "true") return true;
      if (value === 0 || value === "0" || value === false || value === "false") return false;
      return false;
    };

    const lockinAcceptedFromTenant = parseBoolean(latestRequest.lockin_penalty_accepted);
    const noticeAcceptedFromTenant = parseBoolean(latestRequest.notice_penalty_accepted);

    setLockinAcceptedByTenant(lockinAcceptedFromTenant);
    setNoticeGivenByTenant(noticeAcceptedFromTenant);

    const isLockinCompleted = await checkIfLockinCompleted();

    const effectiveLockinAccepted = lockinAcceptedFromTenant || isLockinCompleted;
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
      const reason = vacateReasons.find((r: any) => r.id === tenantVacateReasonId);
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
        }
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

      const activeVacateRequests = vacateRequests.filter((request) => {
        const isVacateRequest = request.vacate_request_id !== undefined;
        const isForCurrentTenant = request.tenant_id === tenantDetails?.id;
        const isActiveStatus = ["pending", "in_progress"].includes(request.request_status);
        return isVacateRequest && isForCurrentTenant && isActiveStatus;
      });

      if (activeVacateRequests.length > 0) {
        const tenantRequest = await extractTenantVacateData(activeVacateRequests);
        if (tenantRequest) {
          const requestWithId = {
            ...tenantRequest,
            id: tenantRequest.vacate_request_id,
            status: tenantRequest.request_status,
            created_at: tenantRequest.vacate_request_date || tenantRequest.request_created,
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

  const fetchPartnerDetails = async (tenantId: number) => {
    try {
      setLoadingTenants(true);
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

      const partnerTenantId = tenant.partner_tenant_id;
      const hasPartner = partnerTenantId && partnerTenantId !== tenant.id;
      const isCurrentlyCoupleBooking = bedAssignment?.is_couple === true || 
                                        bedAssignment?.is_couple === 1 || 
                                        bedAssignment?.is_couple === "1";

      setIsCoupleBooking(hasPartner && isCurrentlyCoupleBooking);

      if (hasPartner && isCurrentlyCoupleBooking) {
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
                selected: false,
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
                selected: false,
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

      if (data.bedAssignment) {
        const deposit = parseFloat(data.bedAssignment.security_deposit) || 
                        parseFloat(data.bedAssignment.rent_per_bed) || 0;
        setSecurityDeposit(deposit);
      }

      if (data.bedAssignment && data.bedAssignment.tenant_id) {
        await fetchPartnerDetails(data.bedAssignment.tenant_id);
      }

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
        setStep(3);
      }
    } 
    else if (step === 2 && isCoupleBooking) {
      const selectedCount = tenantsToVacate.filter(t => t.selected).length;
      if (selectedCount === 0) {
        toast.error("Please select at least one tenant to vacate");
        return;
      }
      setStep(3);
    } 
    else if (step === 3) {
      setStep(4);
    } 
    else if (step === 4) {
      setStep(5);
    } 
    else if (step === 5) {
      if (!formData.requestedVacateDate) {
        toast.error("Please select vacate date");
        return;
      }
      await calculateAllPenalties();
      setStep(6);
    } 
    else if (step === 6) {
      if (!formData.adminApproved && !isAdminOverrideLockin && !isAdminOverrideNotice) {
        toast.error("Please approve the vacate request");
        return;
      }
      setStep(7);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      if (!isCoupleBooking) {
        if (step === 3) setStep(1);
        else if (step === 4) setStep(3);
        else if (step === 5) setStep(4);
        else if (step === 6) setStep(5);
        else setStep(step - 1);
      } else {
        setStep(step - 1);
      }
    }
  };

  const getStepTitles = () => {
    if (isCoupleBooking) {
      return ["Reason", "Select Tenants", "Lock-in", "Notice", "Date", "Summary", "Result"];
    } else {
      return ["Reason", "Lock-in", "Notice", "Date", "Summary", "Result"];
    }
  };

  const getIcons = () => {
    if (isCoupleBooking) {
      return [FileText, UsersRound, Lock, Bell, CalendarIcon, CheckCircle, Check];
    } else {
      return [FileText, Lock, Bell, CalendarIcon, CheckCircle, Check];
    }
  };

  const checkLockinStatus = async () => {
    try {
      if (!initialData?.bedAssignment?.lockin_period_months ||
          initialData.bedAssignment.lockin_period_months === 0) {
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
      const lockInEndDate = new Date(checkIn);
      lockInEndDate.setMonth(checkIn.getMonth() + lockinMonths);

      const normalizedCurrentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const normalizedLockInEnd = new Date(
        lockInEndDate.getFullYear(),
        lockInEndDate.getMonth(),
        lockInEndDate.getDate()
      );

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
  
  // Normalize dates for comparison (remove time component)
  const normalizedCurrentDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const normalizedLockInEnd = new Date(
    lockInEndDate.getFullYear(),
    lockInEndDate.getMonth(),
    lockInEndDate.getDate()
  );

  // Check if lock-in is completed
  const isLockinCompleted = normalizedCurrentDate >= normalizedLockInEnd;
  
  // Notice period starts from lock-in end date (or today if lock-in is already completed)
  let noticeStartDate: Date;
  let noticeEndDate: Date;
  
  if (isLockinCompleted) {
    // Lock-in completed - notice starts from lock-in end date
    noticeStartDate = lockInEndDate;
  } else {
    // Lock-in NOT completed - notice starts from today (tenant wants to vacate now)
    noticeStartDate = normalizedCurrentDate;
  }
  
  noticeEndDate = new Date(noticeStartDate);
  noticeEndDate.setDate(noticeStartDate.getDate() + noticePeriodDays);
  
  const normalizedNoticeEnd = new Date(
    noticeEndDate.getFullYear(),
    noticeEndDate.getMonth(),
    noticeEndDate.getDate()
  );

  if (noticePeriodDays === 0) {
    return {
      isLockinCompleted,
      isNoticeRequired: false,
      message: "No notice period required",
      penaltyApplicable: false,
      isCompleted: true,
      lockInEndDate: normalizedLockInEnd.toISOString().split('T')[0],
      noticeStartDate: noticeStartDate.toISOString().split('T')[0],
      noticeEndDate: noticeEndDate.toISOString().split('T')[0],
      noticePeriodDays: 0,
      daysGiven: 0,
      daysRemaining: 0,
    };
  }

  // Calculate days given and remaining
  let daysGiven = 0;
  let daysRemaining = 0;
  let isNoticeCompleted = false;
  
  if (!isLockinCompleted) {
    // Lock-in NOT completed - tenant is vacating early
    // They are not giving proper notice because notice period should start after lock-in
    // Calculate how many days of notice they would have if they waited for lock-in to complete
    const daysFromNowToLockinEnd = Math.ceil((normalizedLockInEnd.getTime() - normalizedCurrentDate.getTime()) / (1000 * 3600 * 24));
    
    // They are giving 0 days of actual notice because they want to vacate now
    daysGiven = 0;
    
    // The notice period requirement is still noticePeriodDays, but since they're not waiting,
    // all days are remaining
    daysRemaining = noticePeriodDays;
    
    isNoticeCompleted = false;
  } else {
    // Lock-in completed - normal notice calculation
    isNoticeCompleted = normalizedCurrentDate >= normalizedNoticeEnd;
    
    if (isNoticeCompleted) {
      daysGiven = noticePeriodDays;
      daysRemaining = 0;
    } else {
      const timeDiff = normalizedNoticeEnd.getTime() - normalizedCurrentDate.getTime();
      daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      daysGiven = noticePeriodDays - daysRemaining;
      
      // Ensure non-negative
      if (daysGiven < 0) daysGiven = 0;
      if (daysRemaining < 0) daysRemaining = 0;
    }
  }

  // ✅ PENALTY APPLIES IF:
  // 1. Notice period is required
  // 2. And NOT completed (daysRemaining > 0)
  // This includes cases where lock-in is not completed (they are not giving proper notice)
  const penaltyApplicable = noticePeriodDays > 0 && daysRemaining > 0;

  if (isLockinCompleted && isNoticeCompleted) {
    return {
      isLockinCompleted: true,
      isNoticeGiven: true,
      isCompleted: true,
      lockInEndDate: normalizedLockInEnd.toISOString().split('T')[0],
      noticeStartDate: noticeStartDate.toISOString().split('T')[0],
      noticeEndDate: normalizedNoticeEnd.toISOString().split('T')[0],
      noticePeriodDays,
      daysGiven,
      daysRemaining: 0,
      message: `✓ Notice period completed (${daysGiven} days given out of required ${noticePeriodDays} days)`,
      penaltyApplicable: false,
      waitingForLockin: false
    };
  } else if (!isLockinCompleted) {
    // Lock-in not completed - tenant wants to vacate early
    return {
      isLockinCompleted: false,
      isNoticeGiven: false,
      isCompleted: false,
      lockInEndDate: normalizedLockInEnd.toISOString().split('T')[0],
      noticeStartDate: noticeStartDate.toISOString().split('T')[0],
      noticeEndDate: normalizedNoticeEnd.toISOString().split('T')[0],
      noticePeriodDays,
      daysGiven: 0,
      daysRemaining: noticePeriodDays,
      message: `⚠️ Lock-in period not completed. Notice period of ${noticePeriodDays} days required. You are vacating early, so full notice period penalty applies (${noticePeriodDays} days remaining).`,
      penaltyApplicable: true,  // ✅ PENALTY APPLIES
      waitingForLockin: true
    };
  } else {
    // Lock-in completed but notice not completed
    return {
      isLockinCompleted: true,
      isNoticeGiven: true,
      isCompleted: false,
      lockInEndDate: normalizedLockInEnd.toISOString().split('T')[0],
      noticeStartDate: noticeStartDate.toISOString().split('T')[0],
      noticeEndDate: normalizedNoticeEnd.toISOString().split('T')[0],
      noticePeriodDays,
      daysGiven,
      daysRemaining,
      message: `⚠️ Notice period not completed (${daysGiven} days given, ${daysRemaining} days remaining out of required ${noticePeriodDays} days)`,
      penaltyApplicable: true,  // ✅ PENALTY APPLIES
      waitingForLockin: false
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
          lockinPenalty = Math.round((securityDepositAmount * penaltyAmount) / 100);
          lockinPenaltyDescription = `${penaltyAmount}% of security deposit (${formatCurrency(lockinPenalty)})`;
        } else {
          lockinPenalty = penaltyAmount;
          lockinPenaltyDescription = `Fixed penalty (${formatCurrency(lockinPenalty)})`;
        }
      } else if (penaltyType) {
        if (penaltyType.includes("%")) {
          const percentage = parseInt(penaltyType);
          lockinPenalty = Math.round((securityDepositAmount * percentage) / 100);
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
          noticePenalty = Math.round((securityDepositAmount * penaltyAmount) / 100);
          noticePenaltyDescription = `${penaltyAmount}% of security deposit (${formatCurrency(noticePenalty)})`;
        } else {
          noticePenalty = penaltyAmount;
          noticePenaltyDescription = `Fixed penalty (${formatCurrency(noticePenalty)})`;
        }
      } else if (penaltyType) {
        if (penaltyType.includes("%")) {
          const percentage = parseInt(penaltyType);
          noticePenalty = Math.round((securityDepositAmount * percentage) / 100);
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

    // ✅ FIX: Calculate total penalty correctly - ADD both penalties
    const totalPenalty = lockinPenalty + noticePenalty;
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
      noticePenaltyApplicable
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
        totalPenalty,
        refundableAmount: Math.max(0, refundableAmount),
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

    const selectedTenants = tenantsToVacate.filter(t => t.selected);
    
    if (selectedTenants.length === 0) {
      toast.error("Please select at least one tenant to vacate");
      setLoading(false);
      return;
    }

    const results = [];
    const errors = [];

    for (const tenant of selectedTenants) {
      try {
        // Calculate final amounts based on individual override flags
        let finalLockinPenaltyAmount = 0;
        let finalNoticePenaltyAmount = 0;
        let finalTotalPenaltyAmount = 0;
        let finalRefundableAmount = 0;
        let finalLockinPenaltyApplied = false;
        let finalNoticePenaltyApplied = false;
        
        // For partial vacate (only one tenant in couple booking), split the amounts
        const isPartialVacateSelected = selectedTenants.length === 1 && tenantsToVacate.length === 2;
        
        if (isAdminOverrideLockin || isAdminOverrideNotice) {
          // Individual overrides
          if (isAdminOverrideLockin) {
            finalLockinPenaltyAmount = 0;
            finalLockinPenaltyApplied = false;
          } else {
            finalLockinPenaltyAmount = isPartialVacateSelected 
              ? Math.floor((calculation?.financials?.lockinPenalty || formData.finalPenaltyAmount) / 2)
              : (calculation?.financials?.lockinPenalty || formData.finalPenaltyAmount);
            finalLockinPenaltyApplied = formData.lockinPenaltyApplied;
          }
          
          if (isAdminOverrideNotice) {
            finalNoticePenaltyAmount = 0;
            finalNoticePenaltyApplied = false;
          } else {
            finalNoticePenaltyAmount = isPartialVacateSelected
              ? Math.floor((calculation?.financials?.noticePenalty || 0) / 2)
              : (calculation?.financials?.noticePenalty || 0);
            finalNoticePenaltyApplied = formData.noticePenaltyApplied;
          }
          
          finalTotalPenaltyAmount = finalLockinPenaltyAmount + finalNoticePenaltyAmount;
          finalRefundableAmount = (calculation?.financials?.securityDeposit || securityDeposit) - finalTotalPenaltyAmount;
        } 
        else if (existingVacateRequest) {
          // Tenant submitted a vacate request - use calculations from the request
          finalLockinPenaltyAmount = isPartialVacateSelected
            ? Math.floor((calculation?.financials?.lockinPenalty || formData.finalPenaltyAmount) / 2)
            : (calculation?.financials?.lockinPenalty || formData.finalPenaltyAmount);
          finalNoticePenaltyAmount = isPartialVacateSelected
            ? Math.floor((calculation?.financials?.noticePenalty || 0) / 2)
            : (calculation?.financials?.noticePenalty || 0);
          finalTotalPenaltyAmount = finalLockinPenaltyAmount + finalNoticePenaltyAmount;
          finalRefundableAmount = isPartialVacateSelected
            ? Math.floor((calculation?.financials?.refundableAmount || formData.securityRefundAmount) / 2)
            : (calculation?.financials?.refundableAmount || formData.securityRefundAmount);
          finalLockinPenaltyApplied = formData.lockinPenaltyApplied;
          finalNoticePenaltyApplied = formData.noticePenaltyApplied;
        } 
        else {
          // No tenant request, admin is processing manually
          finalLockinPenaltyAmount = isPartialVacateSelected
            ? Math.floor((calculation?.financials?.lockinPenalty || formData.finalPenaltyAmount) / 2)
            : (calculation?.financials?.lockinPenalty || formData.finalPenaltyAmount);
          finalNoticePenaltyAmount = isPartialVacateSelected
            ? Math.floor((calculation?.financials?.noticePenalty || 0) / 2)
            : (calculation?.financials?.noticePenalty || 0);
          finalTotalPenaltyAmount = finalLockinPenaltyAmount + finalNoticePenaltyAmount;
          finalRefundableAmount = isPartialVacateSelected
            ? Math.floor((calculation?.financials?.refundableAmount || formData.securityRefundAmount) / 2)
            : (calculation?.financials?.refundableAmount || formData.securityRefundAmount);
          finalLockinPenaltyApplied = formData.lockinPenaltyApplied;
          finalNoticePenaltyApplied = formData.noticePenaltyApplied;
        }

        // Ensure refund amount is not negative
        const safeRefundableAmount = Math.max(0, finalRefundableAmount);

        console.log("💰 Submitting with values:", {
          tenantId: tenant.id,
          tenantName: tenant.full_name,
          finalLockinPenaltyAmount,
          finalNoticePenaltyAmount,
          finalTotalPenaltyAmount,
          finalRefundableAmount: safeRefundableAmount,
          finalLockinPenaltyApplied,
          finalNoticePenaltyApplied,
          isAdminOverrideLockin,
          isAdminOverrideNotice,
          isPartialVacateSelected
        });

        const payload = {
          bedAssignmentId: bedAssignment.id,
          tenantId: tenant.id,
          vacateReasonValue: (isAdminOverrideLockin || isAdminOverrideNotice) 
            ? `Admin forced vacate - ${formData.vacateReasonValue || tenantVacateReason}` 
            : (tenantVacateReason || formData.vacateReasonValue),
          isNoticeGiven: noticeGivenByTenant || formData.isNoticeGiven || true,
          noticeGivenDate: tenantRequestDate || formData.noticeGivenDate || new Date().toISOString().split('T')[0],
          requestedVacateDate: formData.requestedVacateDate,  
          tenantAgreed: true,
          lockinPeriodMonths: initialData?.bedAssignment?.lockin_period_months || 0,
          lockinPenaltyType: initialData?.bedAssignment?.lockin_penalty_type || '',
          lockinPenaltyAmount: finalLockinPenaltyAmount,
          noticePeriodDays: initialData?.bedAssignment?.notice_period_days || 0,
          noticePenaltyType: initialData?.bedAssignment?.notice_penalty_type || '',
          noticePenaltyAmount: finalNoticePenaltyAmount,
          securityDepositAmount: initialData?.bedAssignment?.security_deposit || securityDeposit || 0,
          totalPenaltyAmount: finalTotalPenaltyAmount,
          refundableAmount: safeRefundableAmount,
          lockinPenaltyApplied: finalLockinPenaltyApplied,
          noticePenaltyApplied: finalNoticePenaltyApplied,
          adminApproved: formData.adminApproved,
          tenantVacateRequestId: existingVacateRequest?.id,
          isPartialVacate: isPartialVacateSelected,
          // ✅ IMPORTANT: Send individual override flags, NOT a single isAdminOverride
          isLockinAdminOverride: isAdminOverrideLockin,
          isNoticeAdminOverride: isAdminOverrideNotice
        };

        const response = await vacateApi.submitVacateRequest(payload);
        
        if (response && response.success) {
          results.push({
            tenant_id: tenant.id,
            tenant_name: tenant.full_name,
            success: true,
            message: response.message,
            financials: response.data?.financials
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

      const originalBedRent = bedAssignment?.tenant_rent || 
                              initialData?.bedAssignment?.tenant_rent || 
                              initialData?.bedAssignment?.rent_per_bed || 
                              bedAssignment?.rent_per_bed || 0;
      
      const originalSecurityDeposit = initialData?.bedAssignment?.security_deposit || 
                                     initialData?.bedAssignment?.rent_per_bed || 
                                     bedAssignment?.security_deposit || 
                                     securityDeposit || 0;
      
      console.log("💰 Original bed rent to preserve:", originalBedRent);
      console.log("💰 Original security deposit to preserve:", originalSecurityDeposit);
      
      if (allTenantsVacated) {
        // Both tenants vacated - mark bed as available but preserve rent
        await updateBedAssignment(bedAssignment.id.toString(), {
          tenant_id: null,
          tenant_gender: null,
          is_available: true,
          tenant_rent: originalBedRent,
          is_couple: false,
          security_deposit: null,
          vacate_reason: `Both tenants vacated. Bed rent preserved: ${originalBedRent}`
        });
        console.log("✅ Both tenants vacated - Bed marked as available with rent preserved:", originalBedRent);
      } else {
        // Only one tenant vacated - update bed to remaining tenant
        const remainingTenant = tenantsToVacate.find(t => !t.selected);
        if (remainingTenant) {
          const remainingTenantDetails = await fetchRawTenant(remainingTenant.id);
          
          await updateBedAssignment(bedAssignment.id.toString(), {
            tenant_id: remainingTenant.id,
            tenant_gender: remainingTenantDetails?.gender || null,
            is_available: false,
            is_couple: false,
            tenant_rent: originalBedRent,
            security_deposit: originalSecurityDeposit,
            vacate_reason: `Partial vacate - ${remainingTenant.full_name} remains. Bed rent preserved: ${originalBedRent}`
          });
          console.log(`✅ Single tenant vacated - Bed updated to remaining tenant: ${remainingTenant.full_name} with rent preserved: ${originalBedRent}`);
        }
      }
      
      if (onVacateComplete) {
        onVacateComplete();
      }

      setStep(7);
      setTimeout(() => {
        onOpenChange(false);
        resetWizard();
      }, 2000);
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
  if (isCoupleBooking) return step - 1;
  // Non-couple skips step 2, so adjust: 1→0, 3→1, 4→2, 5→3, 6→4, 7→5
  if (step <= 1) return 0;
  return step - 2;
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
  const currentDate = new Date().toISOString().split("T")[0];
  const stepTitles = getStepTitles();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[calc(100%-32px)] max-w-md md:max-w-lg max-h-[75vh] overflow-hidden flex flex-col p-0 rounded-2xl"
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 mx-2">
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
                    <div className={`font-medium ${lockinAcceptedByTenant || lockinStatus?.isCompleted ? "text-green-600" : "text-red-600"}`}>
                      {lockinAcceptedByTenant || lockinStatus?.isCompleted ? "Yes" : "No"}
                      {lockinStatus?.isCompleted && (
                        <span className="text-[10px] text-green-600 ml-1">(Completed)</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-700">Notice Accepted:</div>
                    <div className={`font-medium ${noticeGivenByTenant ? "text-green-600" : "text-red-600"}`}>
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
                    <div key={index} className="flex-1 flex flex-col items-center relative">
                      {index < stepTitles.length - 1 && (
                        <div
                          className={`absolute top-3 left-1/2 w-full h-0.5 -translate-x-1/2 ${
getStepIndex() > index ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        />
                      )}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 mb-1 ${
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
                        className={`text-[10px] font-medium truncate w-full text-center ${
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
              <div className="mt-1.5">
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
style={{ width: `${((getStepIndex() + 1) / stepTitles.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* STEP 1: VACATE REASON */}
            {step === 1 && (
              <div className="space-y-4 p-2">
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
                      This reason has been pre-selected. You can change it if needed.
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
  <div className="space-y-4 p-2">
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

            {tenantsToVacate.map((tenant, idx) => (
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
                      {!tenant.is_primary && tenantsToVacate.length > 1 && idx === 1 && (
                        <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700 border-pink-200">
                          Partner
                        </Badge>
                      )}
                      {!tenant.is_primary && tenantsToVacate.length > 1 && idx === 0 && (
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
                          <span className="font-medium">Partner:</span>{" "}
                          {tenant.partner_details.full_name}
                        </div>
                      )}
                    </div>

                    {tenant.partner_details && (
                      <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                        <div className="text-xs text-purple-600 flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>
                            Partnered with:{" "}
                            {tenant.partner_details.full_name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {tenantsToVacate.filter((t) => t.selected).length === 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Please select at least one tenant to vacate
              </div>
            )}

            {tenantsToVacate.length > 1 && tenantsToVacate.filter((t) => t.selected).length === 1 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Only one tenant will be vacated. The other tenant will remain in the bed.
              </div>
            )}

            {tenantsToVacate.length > 1 && tenantsToVacate.filter((t) => t.selected).length === 2 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                <Info className="h-4 w-4 inline mr-2" />
                Both tenants will be vacated. The bed will become available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
)}

            {/* STEP 3: LOCK-IN PERIOD */}
            {step === 3 && (
              <div className="space-y-4 p-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-1 text-sm">
                    Lock-in Period Policy
                  </h3>
                  <p className="text-xs text-blue-700">
                    Lock-in status is calculated from check-in date to today.
                  </p>
                </div>

                <Card className="border">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500">Lock-in Period</div>
                          <div className="font-medium">{bedData.lockin_period_months || 0} months</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Penalty Type</div>
                          <div className="font-medium text-sm">
                            {formatLockinPenaltyType(bedData.lockin_penalty_type) || "No penalty"}
                          </div>
                        </div>
                        {bedData.lockin_penalty_amount > 0 && (
                          <div>
                            <div className="text-xs text-gray-500">Penalty Amount</div>
                            <div className="font-medium text-sm text-red-600">
                              {(() => {
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
                          <div className="text-xs text-gray-500">Check-in Date</div>
                          <div className="font-medium text-sm">{formatDate(bedData.check_in_date)}</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <h4 className="font-medium text-sm mb-2">Lock-in Status</h4>

                        {calculating ? (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                              <div className="text-xs text-gray-600">Calculating lock-in status...</div>
                            </div>
                          </div>
                        ) : lockinStatus ? (
                          <div
                            className={`p-3 rounded border text-sm ${
                              isAdminOverrideLockin
                                ? "bg-purple-50 border-purple-200"
                                : lockinStatus.isCompleted
                                  ? "bg-green-50 border-green-200"
                                  : "bg-red-50 border-red-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium">
                                {isAdminOverrideLockin ? "🔓 Admin Override Active" : (lockinStatus.isCompleted ? "✓ Lock-in Completed" : "✗ Lock-in Not Completed")}
                              </div>
                              <Badge variant={isAdminOverrideLockin ? "default" : (lockinStatus.isCompleted ? "default" : "destructive")} className="text-xs">
                                {isAdminOverrideLockin ? "No Penalty (Admin)" : (lockinStatus.isCompleted ? "No Penalty" : "Penalty Applicable")}
                              </Badge>
                            </div>
                            <div className="text-xs">
                              {isAdminOverrideLockin
                                ? "Admin override active - Lock-in penalty will NOT be applied."
                                : lockinStatus.message}
                            </div>
                            {!isAdminOverrideLockin && !lockinStatus.isCompleted && lockinStatus.remainingDays > 0 && (
                              <div className="text-xs mt-1 text-red-600">
                                ⚠️ {lockinStatus.remainingDays} days remaining in lock-in period
                              </div>
                            )}
                            {!isAdminOverrideLockin && lockinStatus.isCompleted && (
                              <div className="text-xs mt-1 text-green-600">
                                ✓ Lock-in completed on {formatDate(lockinStatus.lockInEndDate)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                            <div className="text-xs text-gray-600">Calculating lock-in status...</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Admin Override for Lock-in */}
                <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="adminOverrideLockin"
                    checked={isAdminOverrideLockin}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsAdminOverrideLockin(checked);
                      if (checked) {
                        toast.info("Admin override enabled - Lock-in penalty will be waived");
                      } else {
                        toast.info("Admin override disabled - Standard lock-in rules apply");
                      }
                      calculateAllPenalties();
                    }}
                    className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="adminOverrideLockin" className="font-medium text-purple-800">
                      Admin Override - Waive Lock-in Penalty
                    </Label>
                    <p className="text-xs text-purple-600 mt-0.5">
                      Check this to bypass lock-in penalty regardless of completion status.
                    </p>
                  </div>
                </div>

                {/* Tenant Agreement Status for Lock-in */}
                {existingVacateRequest && !isAdminOverrideLockin && (
                  <div className={`p-2 rounded text-xs ${
                    lockinAcceptedByTenant || lockinStatus?.isCompleted
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {lockinAcceptedByTenant || lockinStatus?.isCompleted ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                          <span>
                            {lockinStatus?.isCompleted
                              ? "✓ Lock-in period completed - No penalty applicable"
                              : "✓ Tenant has accepted lock-in penalty"}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0" />
                          <span>⚠️ Tenant has NOT accepted lock-in penalty</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
  <div className="space-y-4 p-2">
    <div className="bg-blue-50 p-3 rounded-lg">
      <h3 className="font-medium text-blue-800 mb-1 text-sm">
        Notice Period Status
      </h3>
      <p className="text-xs text-blue-700">
        {lockinStatus?.isCompleted 
          ? "Notice period starts after lock-in period is completed."
          : "⚠️ Lock-in period not completed. Full notice period penalty applies for early vacate."}
      </p>
    </div>

    <Card className="border">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Notice Period</div>
              <div className="font-medium">{bedData.notice_period_days || 0} days</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Penalty Type</div>
              <div className="font-medium text-sm">
                {bedData.notice_penalty_type ? formatLockinPenaltyType(bedData.notice_penalty_type) : "Fixed penalty"}
              </div>
            </div>
            {bedData.notice_penalty_amount > 0 && (
              <div>
                <div className="text-xs text-gray-500">Penalty Amount</div>
                <div className="font-medium text-sm text-red-600">
                  {(() => {
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
              <div className="text-xs text-gray-500">Security Deposit</div>
              <div className="font-medium text-sm text-green-600">
                {formatCurrency(bedData.security_deposit || 0)}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <h4 className="font-medium text-sm mb-2">Notice Period Calculation</h4>

            {lockinStatus?.lockInEndDate && (
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="text-xs font-medium text-blue-800 mb-0.5">Lock-in End Date</div>
                <div className="text-xs text-gray-600">Lock-in completed on: {formatDate(lockinStatus.lockInEndDate)}</div>
                {!lockinStatus.isCompleted && (
                  <div className="text-xs text-red-600 mt-1">
                    ⚠️ Lock-in not completed yet. You are vacating early. Full notice period applies.
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-1">Required notice: {bedData.notice_period_days || 0} days</div>
                {lockinStatus.isCompleted && (
                  <div className="text-xs text-gray-600 mt-1">
                    Notice should be completed by:{" "}
                    {formatDate(
                      new Date(
                        new Date(lockinStatus.lockInEndDate).getTime() +
                          (bedData.notice_period_days || 0) * 24 * 60 * 60 * 1000
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {calculating ? (
              <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                  <div className="text-xs text-gray-600">Calculating notice period status...</div>
                </div>
              </div>
            ) : noticePeriodStatus ? (
              <div
                className={`p-3 rounded border text-sm ${
                  isAdminOverrideNotice
                    ? "bg-purple-50 border-purple-200"
                    : noticePeriodStatus.penaltyApplicable && !noticePeriodStatus.isCompleted
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">
                    {isAdminOverrideNotice ? (
                      "🔓 Admin Override Active"
                    ) : noticePeriodStatus.isCompleted ? (
                      "✓ Notice Period Completed"
                    ) : (
                      "✗ Notice Period Not Completed"
                    )}
                  </div>
                  <Badge
                    variant={
                      isAdminOverrideNotice
                        ? "default"
                        : noticePeriodStatus.isCompleted
                          ? "default"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {isAdminOverrideNotice
                      ? "No Penalty (Admin)"
                      : noticePeriodStatus.isCompleted
                        ? "No Penalty"
                        : "Penalty Applicable"}
                  </Badge>
                </div>
                <div className="text-xs">
                  {isAdminOverrideNotice
                    ? "Admin override active - Notice period penalty will NOT be applied."
                    : noticePeriodStatus.message}
                </div>
                {!isAdminOverrideNotice && noticePeriodStatus.penaltyApplicable && noticePeriodStatus.daysRemaining > 0 && (
                  <div className="text-xs mt-1 text-red-600">
                    ⚠️ Penalty of {formatCurrency(calculation?.financials?.noticePenalty || 0)} will apply ({noticePeriodStatus.daysRemaining} days short of required notice)
                  </div>
                )}
                {!isAdminOverrideNotice && noticePeriodStatus.noticeEndDate && noticePeriodStatus.isLockinCompleted && (
                  <div className="text-xs mt-1 text-gray-600">
                    <span className="font-medium">Notice ends on:</span> {formatDate(noticePeriodStatus.noticeEndDate)}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                <div className="text-xs text-gray-600">Unable to calculate notice period.</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Admin Override for Notice */}
    <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
      <input
        type="checkbox"
        id="adminOverrideNotice"
        checked={isAdminOverrideNotice}
        onChange={(e) => {
          const checked = e.target.checked;
          setIsAdminOverrideNotice(checked);
          if (checked) {
            toast.info("Admin override enabled - Notice period penalty will be waived");
          } else {
            toast.info("Admin override disabled - Standard notice period rules apply");
          }
          calculateAllPenalties();
        }}
        className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 mt-0.5"
      />
      <div className="flex-1">
        <Label htmlFor="adminOverrideNotice" className="font-medium text-purple-800">
          Admin Override - Waive Notice Period Penalty
        </Label>
        <p className="text-xs text-purple-600 mt-0.5">
          Check this to bypass notice period penalty regardless of completion status.
        </p>
      </div>
    </div>

    {/* Tenant Agreement Status for Notice */}
    {existingVacateRequest && !isAdminOverrideNotice && (
      <div className={`p-2 rounded text-xs ${
        noticeGivenByTenant
          ? "bg-green-50 border border-green-200 text-green-800"
          : "bg-red-50 border border-red-200 text-red-800"
      }`}>
        <div className="flex items-center gap-1.5">
          {noticeGivenByTenant ? (
            <>
              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>✓ Tenant has accepted notice period terms</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0" />
              <span>⚠️ Tenant has NOT accepted notice period terms</span>
            </>
          )}
        </div>
      </div>
    )}
  </div>
)}

            {/* STEP 5: VACATE DATE */}
            {step === 5 && (
              <div className="space-y-4 p-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-1 text-sm">
                    Select Vacate Date
                  </h3>
                  <p className="text-xs text-blue-700">
                    Set the actual vacate date for processing.
                  </p>
                </div>

                {tenantVacateDate && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Tenant requested vacate date: {formatDate(tenantVacateDate)}
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
                    onChange={(e) => handleInputChange("requestedVacateDate", e.target.value)}
                    min={currentDate}
                    required
                    className="h-9"
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    <div>• This is the actual date tenant will vacate the bed</div>
                    <div>• Should be at least today's date</div>
                    {tenantVacateDate && (
                      <div className="text-blue-600">
                        • Tenant originally requested: {formatDate(tenantVacateDate)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: SUMMARY */}
{step === 6 && calculation && (
  <div className="space-y-4 p-2">
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
        <h4 className="font-medium text-sm mb-2">Bed & Room Information</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500">Bed Number</div>
            <div className="font-medium text-sm">{bedData.bed_number}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Room Number</div>
            <div className="font-medium text-sm">{bedData.room_number || "N/A"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Check-in Date</div>
            <div className="font-medium text-sm">{formatDate(bedData.check_in_date)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Vacate Date</div>
            <div className="font-medium text-sm">{formatDate(formData.requestedVacateDate)}</div>
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
            <div className="font-medium text-sm">{formatCurrency(calculation.financials.securityDeposit)}</div>
          </div>

          {/* Lock-in Penalty - Show independently */}
          {calculation.financials.lockinPenalty > 0 && (
            <div className="flex justify-between items-center pt-2 border-t">
              <div>
                <div className={`text-sm ${isAdminOverrideLockin ? "text-gray-400 line-through" : "text-gray-600"}`}>
                  Lock-in Penalty
                </div>
                {isAdminOverrideLockin && <div className="text-xs text-green-600">(Waived by admin override)</div>}
                {!isAdminOverrideLockin && lockinStatus && !lockinStatus.isCompleted && (
                  <div className="text-xs text-red-600">(Lock-in not completed)</div>
                )}
                {!isAdminOverrideLockin && lockinStatus && lockinStatus.isCompleted && (
                  <div className="text-xs text-green-600">(Lock-in completed - No penalty)</div>
                )}
              </div>
              <div className={`font-medium text-sm ${isAdminOverrideLockin ? "text-gray-400 line-through" : "text-red-600"}`}>
                - {formatCurrency(isAdminOverrideLockin ? 0 : calculation.financials.lockinPenalty)}
              </div>
            </div>
          )}

          {/* Notice Penalty - Show independently */}
          {calculation.financials.noticePenalty > 0 && (
            <div className="flex justify-between items-center pt-2 border-t">
              <div>
                <div className={`text-sm ${isAdminOverrideNotice ? "text-gray-400 line-through" : "text-gray-600"}`}>
                  Notice Penalty
                </div>
                {isAdminOverrideNotice && <div className="text-xs text-green-600">(Waived by admin override)</div>}
                {!isAdminOverrideNotice && noticePeriodStatus && !noticePeriodStatus.isCompleted && (
                  <div className="text-xs text-red-600">(Notice period not completed)</div>
                )}
                {!isAdminOverrideNotice && noticePeriodStatus && noticePeriodStatus.isCompleted && (
                  <div className="text-xs text-green-600">(Notice period completed - No penalty)</div>
                )}
              </div>
              <div className={`font-medium text-sm ${isAdminOverrideNotice ? "text-gray-400 line-through" : "text-red-600"}`}>
                - {formatCurrency(isAdminOverrideNotice ? 0 : calculation.financials.noticePenalty)}
              </div>
            </div>
          )}

          {/* Total Penalties - Show correct total */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-sm font-medium">Total Penalties</div>
            <div className="font-medium text-sm text-red-600">
              - {formatCurrency(calculation.financials.totalPenalty)}
            </div>
          </div>

          {/* Refundable Amount - Show correct refund */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="font-medium">Refundable Amount</div>
            <div className={`font-bold ${calculation.financials.refundableAmount > 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(calculation.financials.refundableAmount)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="adminApproved"
              checked={formData.adminApproved}
              onChange={(e) => handleInputChange("adminApproved", e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
            />
            <div>
              <label htmlFor="adminApproved" className="font-medium text-sm">
                Admin Approval
              </label>
              <div className="text-xs text-gray-600 space-y-0.5 mt-1">
                <div>• I approve this vacate request</div>
                <div>• Tenant will vacate bed {bedData.bed_number} on {formatDate(formData.requestedVacateDate)}</div>
                <div>• Security deposit refund: {formatCurrency(calculation.financials.refundableAmount)}</div>
              </div>
            </div>
          </div>

          {/* Override Status Summary */}
          {(isAdminOverrideLockin || isAdminOverrideNotice) && (
            <div className="p-2 rounded text-xs bg-purple-50 border border-purple-200 text-purple-800">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-purple-600 flex-shrink-0" />
                <span className="font-medium">Admin Override Status:</span>
                <span>
                  {isAdminOverrideLockin && "Lock-in penalty waived "}
                  {isAdminOverrideLockin && isAdminOverrideNotice && "& "}
                  {isAdminOverrideNotice && "Notice penalty waived"}
                </span>
              </div>
            </div>
          )}

          <div className="p-2 rounded text-xs bg-yellow-50 border border-yellow-200 text-yellow-800">
            <div className="flex items-center gap-1.5">
              <Info className="h-3 w-3 text-yellow-600 flex-shrink-0" />
              <span>Please review all penalties before approving.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)}

            {/* STEP 7: RESULT */}
            {step === 7 && (
              <div className="space-y-4 p-2">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-green-800 text-lg mb-1">
                    Vacate Request Processed Successfully!
                  </h3>
                  <p className="text-green-700">
                    The bed has been marked as vacated.
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Closing dialog...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-3 border-t px-4 pb-3 flex-shrink-0 bg-white">
          {step > 1 && step < 7 && (
            <Button variant="outline" onClick={handleBack} disabled={loading || calculating} size="sm">
              Back
            </Button>
          )}

          {step === 1 && (
            <Button onClick={handleNext} disabled={loading || calculating || loadingMasters || !formData.vacateReasonValue} size="sm">
              Next
            </Button>
          )}
          
          {step === 2 && isCoupleBooking && (
            <Button onClick={handleNext} disabled={loading || tenantsToVacate.filter(t => t.selected).length === 0} size="sm">
              Next
            </Button>
          )}
          
          {step === 3 && (
            <Button onClick={handleNext} disabled={loading || calculating} size="sm">
              Next
            </Button>
          )}
          
          {step === 4 && (
            <Button onClick={handleNext} disabled={loading || calculating} size="sm">
              Next
            </Button>
          )}
          
          {step === 5 && (
            <Button onClick={handleNext} disabled={loading || !formData.requestedVacateDate} size="sm">
              Calculate Penalties
            </Button>
          )}
          
          {step === 6 && (
            <Button onClick={handleSubmit} disabled={loading || (!formData.adminApproved && !isAdminOverrideLockin && !isAdminOverrideNotice)} size="sm">
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