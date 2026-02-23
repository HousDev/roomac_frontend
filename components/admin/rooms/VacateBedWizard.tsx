"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Calendar, UserMinus, Loader2, Info, CheckCircle, FileText, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { vacateApi } from '@/lib/vacateApi';
import { getMyTenantRequests } from '@/lib/tenantRequestsApi';
import { updateBedAssignment } from '@/lib/roomsApi';

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
  
  // Store tenant vacate request details
  const [tenantVacateData, setTenantVacateData] = useState<any>(null);
  const [noticeGivenByTenant, setNoticeGivenByTenant] = useState<boolean>(false);
  const [lockinAcceptedByTenant, setLockinAcceptedByTenant] = useState<boolean>(false);
  const [tenantVacateDate, setTenantVacateDate] = useState<string>('');
  const [tenantRequestDate, setTenantRequestDate] = useState<string>('');
  const [tenantVacateReason, setTenantVacateReason] = useState<string>('');
  const [tenantVacateReasonId, setTenantVacateReasonId] = useState<number | null>(null);
  const [tenantAgreedToTerms, setTenantAgreedToTerms] = useState<boolean>(false);
  const [noticePeriodStatus, setNoticePeriodStatus] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    vacateReasonValue: '',
    isNoticeGiven: false,
    noticeGivenDate: '',
    requestedVacateDate: '',
    adminApproved: false,
    lockinPenaltyApplied: false,
    noticePenaltyApplied: false,
    finalPenaltyAmount: 0,
    securityRefundAmount: 0,
    tenantAgreedToTerms: false,
  });

  // Reset when wizard opens
  useEffect(() => {
    if (open && bedAssignment) {
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
      
      setFormData(prev => ({
        ...prev,
        requestedVacateDate: formattedDate
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
    if (initialData && (tenantRequestDate || formData.noticeGivenDate || formData.requestedVacateDate)) {
      const status = calculateNoticePeriodStatus();
      setNoticePeriodStatus(status);
    }
  }, [initialData, tenantRequestDate, formData.noticeGivenDate, formData.isNoticeGiven, formData.requestedVacateDate]);

  // Helper to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  // Function to extract tenant vacate request details
  const extractTenantVacateData = async (requests: any[]) => {
    
    const vacateRequests = requests.filter(request => {
      const isVacateBed = request.request_type === 'vacate_bed';
      const isForCurrentTenant = request.tenant_id === tenantDetails?.id;
      const isActiveStatus = ['pending', 'in_progress', 'approved'].includes(request.status);
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
        const requestDate = latestRequest.created_at.split('T')[0];
        setTenantRequestDate(requestDate);
      }
      
      // Check if tenant accepted penalties
      const lockinAccepted = vacateData.lockin_penalty_accepted || false;
      const noticeAccepted = vacateData.notice_penalty_accepted || false;
      
      setLockinAcceptedByTenant(lockinAccepted);
      setNoticeGivenByTenant(noticeAccepted);
      
      // Tenant agrees to terms if they accepted BOTH penalties
      const termsAgreed = lockinAccepted && noticeAccepted;
      setTenantAgreedToTerms(termsAgreed);
      
      
      
      // Store reason ID for later lookup
      if (vacateData.primary_reason_id) {
        setTenantVacateReasonId(vacateData.primary_reason_id);
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
    
    // Set vacate reason from ID
    if (tenantVacateReasonId && initialData && (initialData as any).vacateReasons && Array.isArray((initialData as any).vacateReasons)) {
      const reason = (initialData as any).vacateReasons.find((r: any) => r.id === tenantVacateReasonId);
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
  const checkForExistingRequest = async () => {
    try {
      setIsCheckingExisting(true);
      
      const allRequests = await getMyTenantRequests();
      
      if (!Array.isArray(allRequests)) {
        console.error('❌ getMyTenantRequests did not return an array:', allRequests);
        setExistingVacateRequest(null);
        setWizardDisabled(false);
        return;
      }
      
      const tenantRequest = await extractTenantVacateData(allRequests);
      
      if (tenantRequest) {
        setExistingVacateRequest(tenantRequest);
        toast.info("Tenant vacate request found", {
          description: "Loading tenant's vacate request details...",
          duration: 2000
        });
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

  const loadInitialData = async () => {
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
      
      if (!data.vacateReasons || !Array.isArray(data.vacateReasons)) {
        data.vacateReasons = [];
      }
      
      setInitialData(data);
      
      // Only set default if no tenant date
      if (!tenantVacateDate) {
        const today = new Date();
        const defaultVacateDate = new Date(today);
        defaultVacateDate.setDate(today.getDate() + 30);
        const formattedDate = defaultVacateDate.toISOString().split('T')[0];
        
        setFormData(prev => ({
          ...prev,
          requestedVacateDate: formattedDate
        }));
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load vacate data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'isNoticeGiven' || field === 'requestedVacateDate' || field === 'noticeGivenDate') {
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
    if (!initialData?.bedAssignment?.lockin_period_months || 
        initialData.bedAssignment.lockin_period_months === 0) {
      setLockinStatus({
        isCompleted: true,
        message: "No lock-in period required",
        lockinMonths: 0,
        penaltyApplicable: false
      });
      return;
    }
    
    setCalculating(true);
    
    const checkInDateStr = initialData?.bedAssignment?.check_in_date;
    const lockinMonths = initialData?.bedAssignment?.lockin_period_months || 0;
    const currentDate = new Date(); // Use current date
    
    
    
    if (!checkInDateStr) {
      setLockinStatus({
        isCompleted: true,
        message: "No check-in date found, cannot calculate lock-in period",
        lockinMonths: lockinMonths,
        penaltyApplicable: false
      });
      return;
    }
    
    const checkIn = new Date(checkInDateStr);
    
    // Calculate lock-in end date: check-in date + lock-in months
    const lockInEndDate = new Date(checkIn);
    lockInEndDate.setMonth(checkIn.getMonth() + lockinMonths);
    
    // Normalize dates for comparison (remove time component)
    const normalizedLockInEndDate = new Date(lockInEndDate.getFullYear(), lockInEndDate.getMonth(), lockInEndDate.getDate());
    const normalizedCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    // Check if current date is ON OR AFTER lock-in end date
    const isCompleted = normalizedCurrentDate >= normalizedLockInEndDate;
    
    // Calculate how many months have been completed
    const monthsDiff = (normalizedCurrentDate.getFullYear() - checkIn.getFullYear()) * 12 + 
                       (normalizedCurrentDate.getMonth() - checkIn.getMonth());
    const completedMonths = Math.max(0, Math.min(monthsDiff, lockinMonths));
    
    // Calculate remaining if not completed
    let remainingDays = 0;
    let remainingMonths = 0;
    
    if (!isCompleted) {
      const remainingTime = normalizedLockInEndDate.getTime() - normalizedCurrentDate.getTime();
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
      currentDate: normalizedCurrentDate.toISOString().split('T')[0],
      lockInEndDate: lockInEndDate.toISOString().split('T')[0],
      penaltyApplicable: !isCompleted
    });
    
   
    
  } catch (error) {
    console.error('Error checking lock-in status:', error);
    
    // Fallback calculation
    const checkInDateStr = initialData?.bedAssignment?.check_in_date;
    const lockinMonths = initialData?.bedAssignment?.lockin_period_months || 0;
    
    if (!checkInDateStr || lockinMonths === 0) {
      setLockinStatus({
        isCompleted: true,
        message: "No lock-in data available",
        lockinMonths: 0,
        penaltyApplicable: false
      });
      return;
    }
    
    try {
      const checkIn = new Date(checkInDateStr);
      const currentDate = new Date();
      const lockInEndDate = new Date(checkIn);
      lockInEndDate.setMonth(checkIn.getMonth() + lockinMonths);
      
      const normalizedLockInEndDate = new Date(lockInEndDate.getFullYear(), lockInEndDate.getMonth(), lockInEndDate.getDate());
      const normalizedCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      
      const isCompleted = normalizedCurrentDate >= normalizedLockInEndDate;
      
      setLockinStatus({
        isCompleted,
        message: isCompleted 
          ? 'Lock-in period completed'
          : 'Lock-in period not completed',
        lockinMonths: lockinMonths,
        penaltyApplicable: !isCompleted
      });
    } catch (e) {
      setLockinStatus({
        isCompleted: false,
        message: "Error calculating lock-in period",
        lockinMonths: lockinMonths,
        penaltyApplicable: true
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
      isCompleted: true
    };
  }
  
  // Notice starts from tenant's request date (or admin override)
  // Use tenant's request date if available, otherwise use admin's override date
  const noticeStartDateStr = tenantRequestDate || (formData.isNoticeGiven ? formData.noticeGivenDate : null);
  
  if (!noticeStartDateStr) {
    return {
      isNoticeGiven: false,
      isCompleted: false,
      message: "No notice given - penalty applies",
      penaltyApplicable: true
    };
  }
  
  const noticeStartDate = new Date(noticeStartDateStr);
  
  // Calculate notice end date: notice start date + notice period days
  const noticeEndDate = new Date(noticeStartDate);
  noticeEndDate.setDate(noticeStartDate.getDate() + noticePeriodDays);
  
  // Normalize dates for comparison
  const normalizedNoticeStartDate = new Date(noticeStartDate.getFullYear(), noticeStartDate.getMonth(), noticeStartDate.getDate());
  const normalizedNoticeEndDate = new Date(noticeEndDate.getFullYear(), noticeEndDate.getMonth(), noticeEndDate.getDate());
  const normalizedCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  // Check if current date is ON OR AFTER notice end date
  const isNoticeCompleted = normalizedCurrentDate >= normalizedNoticeEndDate;
  
  // Calculate days since notice given
  const daysSinceNotice = Math.ceil(
    (normalizedCurrentDate.getTime() - normalizedNoticeStartDate.getTime()) / (1000 * 3600 * 24)
  );
  
  const daysRemaining = Math.max(0, Math.ceil(
    (normalizedNoticeEndDate.getTime() - normalizedCurrentDate.getTime()) / (1000 * 3600 * 24)
  ));
  
 
  
  if (isNoticeCompleted) {
    return {
      isNoticeGiven: true,
      isCompleted: true,
      noticeStartDate: normalizedNoticeStartDate.toISOString().split('T')[0],
      noticeEndDate: normalizedNoticeEndDate.toISOString().split('T')[0],
      noticePeriodDays,
      daysCompleted: daysSinceNotice,
      message: `Notice period completed (${daysSinceNotice} days served out of required ${noticePeriodDays} days)`,
      penaltyApplicable: false
    };
  } else {
    return {
      isNoticeGiven: true,
      isCompleted: false,
      noticeStartDate: normalizedNoticeStartDate.toISOString().split('T')[0],
      noticeEndDate: normalizedNoticeEndDate.toISOString().split('T')[0],
      noticePeriodDays,
      daysCompleted: daysSinceNotice,
      daysRemaining,
      message: `Notice period not completed (${daysSinceNotice} days served, ${daysRemaining} days remaining out of ${noticePeriodDays} days required)`,
      penaltyApplicable: true // Penalty applies if notice period is still running
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
    const currentDate = new Date().toISOString().split('T')[0];
    
   
    
    // 1. LOCK-IN PENALTY CALCULATION
    let lockinPenalty = 0;
    let lockinPenaltyDescription = '';
    let lockinPenaltyApplicable = false;
    
    // Recalculate lock-in status if needed
    if (!lockinStatus) {
      await checkLockinStatus();
    }
    
    if (lockinStatus && lockinStatus.penaltyApplicable) {
      lockinPenaltyApplicable = true;
      
      // Get penalty from tenant data
      const penaltyAmount = parseFloat(bedData.lockin_penalty_amount) || 0;
      const penaltyType = bedData.lockin_penalty_type || '';
      
    
      
      if (penaltyAmount > 0) {
        lockinPenalty = penaltyAmount;
        lockinPenaltyDescription = `Fixed penalty (₹${lockinPenalty.toLocaleString('en-IN')})`;
      } else if (penaltyType) {
        // Calculate based on penalty type
        lockinPenalty = calculatePenaltyAmount(penaltyType, securityDeposit, rentPerBed);
        
        if (lockinPenalty > 0) {
          if (penaltyType.includes('%')) {
            lockinPenaltyDescription = `${penaltyType} of security deposit (₹${lockinPenalty.toLocaleString('en-IN')})`;
          } else {
            lockinPenaltyDescription = `${penaltyType.replace(/_/g, ' ')} (₹${lockinPenalty.toLocaleString('en-IN')})`;
          }
        }
      }
      
      // If still 0, use rent as fallback
      if (lockinPenalty === 0 && rentPerBed > 0) {
        lockinPenalty = rentPerBed;
        lockinPenaltyDescription = `One month rent (₹${rentPerBed.toLocaleString('en-IN')})`;
      }
    } else if (lockinStatus?.isCompleted) {
      lockinPenaltyDescription = "No penalty - Lock-in period completed";
    }
    
   
    
    // 2. NOTICE PERIOD CALCULATION
    let noticePenalty = 0;
    let noticePenaltyDescription = '';
    let noticePenaltyApplicable = false;
    
    // Calculate notice period status
    const noticeStatus = calculateNoticePeriodStatus();
    setNoticePeriodStatus(noticeStatus);
    
    
    if (noticeStatus?.penaltyApplicable) {
      noticePenaltyApplicable = true;
      
      // Get penalty from tenant data
      const penaltyAmount = parseFloat(bedData.notice_penalty_amount) || 0;
      const penaltyType = bedData.notice_penalty_type || '';
      
     
      
      if (penaltyAmount > 0) {
        noticePenalty = penaltyAmount;
        noticePenaltyDescription = `Fixed penalty (₹${noticePenalty.toLocaleString('en-IN')})`;
      } else if (penaltyType) {
        // Calculate based on penalty type
        noticePenalty = calculatePenaltyAmount(penaltyType, securityDeposit, rentPerBed);
        
        if (noticePenalty > 0) {
          if (penaltyType.includes('%')) {
            noticePenaltyDescription = `${penaltyType} of security deposit (₹${noticePenalty.toLocaleString('en-IN')})`;
          } else {
            noticePenaltyDescription = `${penaltyType.replace(/_/g, ' ')} (₹${noticePenalty.toLocaleString('en-IN')})`;
          }
        }
      }
      
      // If still 0, use rent as fallback
      if (noticePenalty === 0 && rentPerBed > 0) {
        noticePenalty = rentPerBed;
        noticePenaltyDescription = `One month rent (₹${rentPerBed.toLocaleString('en-IN')})`;
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
      const penaltyType = bedData.notice_penalty_type || '';
      
      if (penaltyAmount > 0) {
        noticePenalty = penaltyAmount;
        noticePenaltyDescription = `Fixed penalty (₹${noticePenalty.toLocaleString('en-IN')}) - No notice given`;
      } else if (rentPerBed > 0) {
        noticePenalty = rentPerBed;
        noticePenaltyDescription = `One month rent (₹${rentPerBed.toLocaleString('en-IN')}) - No notice given`;
      }
    }
    
    
    
    // 3. FINAL CALCULATION
    const totalPenalty = Number(lockinPenalty) + Number(noticePenalty);
    const refundableAmount = Number(securityDeposit) - totalPenalty;
    const isNegativeRefund = refundableAmount < 0;
    const additionalPaymentNeeded = isNegativeRefund ? Math.abs(refundableAmount) : 0;
    
    
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      lockinPenaltyApplied: lockinPenalty > 0,
      noticePenaltyApplied: noticePenalty > 0,
      finalPenaltyAmount: totalPenalty,
      securityRefundAmount: Math.max(0, refundableAmount)
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
        additionalPaymentNeeded: additionalPaymentNeeded
      },
      lockinPolicy: {
        isCompleted: lockinStatus?.isCompleted || false,
        periodMonths: bedData.lockin_period_months || 0,
        penaltyType: bedData.lockin_penalty_type || '',
        penaltyAmount: bedData.lockin_penalty_amount || 0,
        penaltyDescription: lockinPenaltyDescription,
        checkInDate: bedData.check_in_date,
        lockInEndDate: lockinStatus?.lockInEndDate,
        penaltyApplicable: lockinPenaltyApplicable,
        message: lockinStatus?.message
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
        penaltyType: bedData.notice_penalty_type || '',
        penaltyAmount: bedData.notice_penalty_amount || 0,
        penaltyDescription: noticePenaltyDescription,
        noticeGivenByTenant: !!tenantRequestDate,
        message: noticeStatus?.message || '',
        penaltyApplicable: noticePenaltyApplicable
      }
    });
    
  } catch (error) {
    console.error('❌ Error calculating penalties:', error);
    toast.error("Error calculating penalties");
  } finally {
    setCalculating(false);
  }
};

// Enhanced penalty calculation helper
const calculatePenaltyAmount = (penaltyType: string, securityDeposit: number, rentPerBed: number) => {
  if (!penaltyType) return 0;
  
  const lowerType = penaltyType.toLowerCase();
  
  // Check for percentage-based penalties
  if (lowerType.includes('%')) {
    const percentageMatch = lowerType.match(/(\d+)%/);
    if (percentageMatch) {
      const percentage = parseInt(percentageMatch[1]);
      return Math.round((securityDeposit * percentage) / 100);
    }
  }
  
  // Check for fixed amounts in the type (e.g., "₹2000", "2000_fixed")
  const fixedAmountMatch = lowerType.match(/₹?(\d+(?:,\d+)*(?:\.\d+)?)/);
  if (fixedAmountMatch) {
    const amountStr = fixedAmountMatch[1].replace(/,/g, '');
    return parseFloat(amountStr) || 0;
  }
  
  // Check for common penalty types
  if (lowerType.includes('one_month_rent') || lowerType.includes('one month rent')) {
    return rentPerBed;
  }
  
  if (lowerType.includes('two_month_rent') || lowerType.includes('two months rent')) {
    return rentPerBed * 2;
  }
  
  if (lowerType.includes('three_month_rent') || lowerType.includes('three months rent')) {
    return rentPerBed * 3;
  }
  
  if (lowerType.includes('half_month_rent') || lowerType.includes('half month rent')) {
    return Math.round(rentPerBed / 2);
  }
  
  if (lowerType.includes('full_deposit') || lowerType.includes('full security deposit') || lowerType.includes('deposit_forfeit')) {
    return securityDeposit;
  }
  
  if (lowerType.includes('half_deposit') || lowerType.includes('half security deposit')) {
    return Math.round(securityDeposit / 2);
  }
  
  return 0;
};

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatLockinPenaltyType = (type: string) => {
    if (!type) return 'No penalty';
    return type.replace(/_/g, ' ').replace(/rent/gi, 'Rent');
  };

  const formatDate = (dateString: string | number | Date): string => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return String(dateString);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const payload = {
        bedAssignmentId: bedAssignment.id,
        tenantId: tenantDetails?.id || bedAssignment.tenant_id,
        vacateReasonValue: formData.vacateReasonValue,
        isNoticeGiven: formData.isNoticeGiven,
        noticeGivenDate: formData.noticeGivenDate || tenantRequestDate,
        requestedVacateDate: formData.requestedVacateDate,
        tenantAgreed: tenantAgreedToTerms,
        lockinPeriodMonths: initialData?.bedAssignment?.lockin_period_months || 0,
        lockinPenaltyType: initialData?.bedAssignment?.lockin_penalty_type || '',
        lockinPenaltyAmount: initialData?.bedAssignment?.lockin_penalty_amount || 0,
        noticePeriodDays: initialData?.bedAssignment?.notice_period_days || 0,
        noticePenaltyType: initialData?.bedAssignment?.notice_penalty_type || '',
        noticePenaltyAmount: initialData?.bedAssignment?.notice_penalty_amount || 0,
        securityDepositAmount: initialData?.bedAssignment?.security_deposit || 0,
        totalPenaltyAmount: formData.finalPenaltyAmount,
        refundableAmount: formData.securityRefundAmount,
        lockinPenaltyApplied: formData.lockinPenaltyApplied,
        noticePenaltyApplied: formData.noticePenaltyApplied,
        adminApproved: formData.adminApproved,
        tenantVacateRequestId: existingVacateRequest?.id
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
            is_available: true
          });
        } catch (updateError) {
          console.error('⚠️ Could not update bed assignment:', updateError);
        }
        
        setStep(6);
        
        setTimeout(() => {
          onOpenChange(false);
          resetWizard();
        }, 3000);
        
      } else if (response && response.data && response.data.success) {
        setSubmissionResult(response.data.data);
        toast.success(response.data.message || "Bed vacated successfully by admin!");
        
        if (onVacateComplete) {
          onVacateComplete();
        }
        
        try {
          await updateBedAssignment(bedAssignment.id.toString(), {
            tenant_id: null,
            tenant_gender: null,
            is_available: true
          });
        } catch (updateError) {
          console.error('⚠️ Could not update bed assignment:', updateError);
        }
        
        setStep(6);
        
        setTimeout(() => {
          onOpenChange(false);
          resetWizard();
        }, 3000);
      } else {
        const errorMessage = response?.message || 
                            response?.data?.message || 
                            "Failed to submit vacate request";
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error('❌ Error submitting vacate request:', error);
      const err = error as any;
      if (err?.response) {
        const errorMessage = err.response.data?.message || 
                            err.message || 
                            "Failed to submit vacate request";
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
      setTenantVacateDate('');
      setTenantRequestDate('');
      setTenantVacateReason('');
      setTenantVacateReasonId(null);
      setTenantAgreedToTerms(false);
      setNoticePeriodStatus(null);
      setWizardDisabled(false);
      setFormData({
        vacateReasonValue: '',
        isNoticeGiven: false,
        noticeGivenDate: '',
        requestedVacateDate: '',
        adminApproved: false,
        lockinPenaltyApplied: false,
        noticePenaltyApplied: false,
        finalPenaltyAmount: 0,
        securityRefundAmount: 0,
        tenantAgreedToTerms: false,
      });
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
            <p className="text-gray-600 mb-4 text-sm">{error || "Failed to load data"}</p>
            <Button variant="outline" onClick={handleClose} className="text-sm">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const bedData = initialData.bedAssignment;
  const currentDate = initialData.currentDate || new Date().toISOString().split('T')[0];
  const stepTitles = ["Reason", "Lock-in", "Notice", "Date", "Summary", "Result"];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-5">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg flex items-center gap-2">
            <UserMinus className="h-5 w-5" />
            Vacate Bed {bedAssignment.bed_number}
            {!wizardDisabled && <Badge variant="outline" className="ml-2 text-xs">Step {step} of {stepTitles.length}</Badge>}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Process bed vacate for {tenantDetails?.full_name || 'Tenant'}
          </p>
        </DialogHeader>

        {isCheckingExisting && (
          <div className="py-4 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-sm text-gray-600">Checking for existing requests...</p>
          </div>
        )}

        {existingVacateRequest && !isCheckingExisting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-blue-800">Tenant's Vacate Request</span>
                  <Badge variant="outline" className="text-xs">
                    {existingVacateRequest.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-blue-700">Request ID:</div>
                    <div className="font-semibold">#{existingVacateRequest.id}</div>
                  </div>
                  <div>
                    <div className="text-blue-700">Submitted:</div>
                    <div>{formatDate(existingVacateRequest.created_at)}</div>
                  </div>
                  <div>
                    <div className="text-blue-700">Lock-in Accepted:</div>
                    <div className={`font-medium ${lockinAcceptedByTenant ? 'text-green-600' : 'text-red-600'}`}>
                      {lockinAcceptedByTenant ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-700">Notice Accepted:</div>
                    <div className={`font-medium ${noticeGivenByTenant ? 'text-green-600' : 'text-red-600'}`}>
                      {noticeGivenByTenant ? 'Yes' : 'No'}
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

        <div className="mb-6">
          <div className="flex items-center justify-between mb-5 px-1">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                  step === index + 1 ? 'bg-blue-600 text-white' : 
                  step > index + 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {step > index + 1 ? <Check className="h-3 w-3" /> : index + 1}
                </div>
                <div className={`text-xs mt-1 ${step === index + 1 ? 'font-medium' : 'text-gray-500'}`}>
                  {title}
                </div>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-1 text-sm">Select Vacate Reason</h3>
                <p className="text-xs text-blue-700">Select or confirm the reason for vacating.</p>
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
                <Label className="text-sm font-medium mb-1.5 block">Vacate Reason *</Label>
                <Select
                  value={formData.vacateReasonValue}
                  onValueChange={(value) => handleInputChange('vacateReasonValue', value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={formData.vacateReasonValue || "Select reason"} />
                  </SelectTrigger>
                  <SelectContent>
                    {initialData.vacateReasons?.map((reason: any) => (
                      <SelectItem key={reason.id} value={reason.value} className="text-sm">{reason.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-1 text-sm">Lock-in Period Policy</h3>
                <p className="text-xs text-blue-700">Lock-in status is automatically calculated.</p>
              </div>
              
              <Card className="border">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Lock-in Period</div>
                        <div className="font-medium">
                          {bedData.lockin_period_months || 0} months
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Penalty Type</div>
                        <div className="font-medium text-sm">
                          {formatLockinPenaltyType(bedData.lockin_penalty_type) || 'No penalty'}
                        </div>
                      </div>
                      {bedData.lockin_penalty_amount > 0 && (
                        <div>
                          <div className="text-xs text-gray-500">Penalty Amount</div>
                          <div className="font-medium text-sm text-red-600">
                            {formatCurrency(bedData.lockin_penalty_amount)}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-500">Check-in Date</div>
                        <div className="font-medium text-sm">
                          {formatDate(bedData.check_in_date)}
                        </div>
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
                        <div className={`p-3 rounded border text-sm ${
                          lockinStatus.isCompleted 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">
                              {lockinStatus.isCompleted ? '✓ Lock-in Completed' : '✗ Lock-in Not Completed'}
                            </div>
                            <Badge variant={lockinStatus.isCompleted ? "default" : "destructive"} className="text-xs">
                              {lockinStatus.isCompleted ? 'No Penalty' : 'Penalty Applicable'}
                            </Badge>
                          </div>
                          <div className="text-xs">{lockinStatus.message}</div>
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                          <div className="text-xs text-gray-600">
                            Lock-in status will be calculated once vacate date is selected.
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
      <h3 className="font-medium text-blue-800 mb-1 text-sm">Notice Period Status</h3>
      <p className="text-xs text-blue-700">
        Notice period is calculated from tenant's request date ({tenantRequestDate ? formatDate(tenantRequestDate) : 'N/A'}) 
        plus {bedData.notice_period_days || 0} days, compared with today's date.
      </p>
    </div>
    
    <Card className="border">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Notice Period</div>
              <div className="font-medium">
                {bedData.notice_period_days || 0} days
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Penalty Type</div>
              <div className="font-medium text-sm">
                {bedData.notice_penalty_type 
                  ? formatLockinPenaltyType(bedData.notice_penalty_type)
                  : 'Fixed penalty'}
              </div>
            </div>
            {bedData.notice_penalty_amount > 0 && (
              <div>
                <div className="text-xs text-gray-500">Penalty Amount</div>
                <div className="font-medium text-sm text-red-600">
                  {formatCurrency(bedData.notice_penalty_amount)}
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
            
            {tenantRequestDate ? (
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="text-xs font-medium text-blue-800 mb-0.5">
                  Tenant Request Date
                </div>
                <div className="text-xs text-gray-600">
                  Request submitted: {formatDate(tenantRequestDate)}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Required notice: {bedData.notice_period_days || 0} days
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Notice should be completed by: {formatDate(new Date(new Date(tenantRequestDate).getTime() + (bedData.notice_period_days || 0) * 24 * 60 * 60 * 1000))}
                </div>
              </div>
            ) : (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                <div className="text-xs font-medium text-red-800 mb-0.5">
                  No Tenant Request Date Found
                </div>
                <div className="text-xs text-gray-600">
                  Tenant has not submitted a vacate request. You can manually set a notice date below.
                </div>
              </div>
            )}
            
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="adminNoticeOverride"
                  checked={formData.isNoticeGiven}
                  onChange={(e) => handleInputChange('isNoticeGiven', e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="adminNoticeOverride" className="text-sm">
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
                    onChange={(e) => handleInputChange('noticeGivenDate', e.target.value)}
                    max={currentDate}
                    className="h-9"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    This date will be used as the notice start date if tenant hasn't submitted a request.
                  </div>
                </div>
              )}
            </div>
            
            {/* Show notice period status */}
            {calculating ? (
              <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                  <div className="text-xs text-gray-600">Calculating notice period status...</div>
                </div>
              </div>
            ) : noticePeriodStatus ? (
              <div className={`p-3 rounded border text-sm ${
                noticePeriodStatus.isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">
                    {noticePeriodStatus.isCompleted ? '✓ Notice Period Completed' : '✗ Notice Period Not Completed'}
                  </div>
                  <Badge variant={noticePeriodStatus.isCompleted ? "default" : "destructive"} className="text-xs">
                    {noticePeriodStatus.isCompleted ? 'No Penalty' : 'Penalty Applicable'}
                  </Badge>
                </div>
                <div className="text-xs">{noticePeriodStatus.message || ''}</div>
                {!noticePeriodStatus.isCompleted && noticePeriodStatus.daysRemaining > 0 && (
                  <div className="text-xs mt-1">
                    <span className="font-medium">Days remaining:</span> {noticePeriodStatus.daysRemaining} days
                  </div>
                )}
                {noticePeriodStatus.noticeEndDate && (
                  <div className="text-xs mt-1 text-gray-600">
                    <span className="font-medium">Notice ends on:</span> {formatDate(noticePeriodStatus.noticeEndDate)}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                <div className="text-xs text-gray-600">
                  Unable to calculate notice period. Please ensure a notice date is set.
                </div>
              </div>
            )}
            
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="text-xs text-blue-700">
                <span className="font-medium">Calculation Logic:</span><br/>
                • Notice Start Date: {tenantRequestDate ? formatDate(tenantRequestDate) : 'Manual date'}<br/>
                • Notice Period: +{bedData.notice_period_days || 0} days<br/>
                • Notice End Date: Start Date + {bedData.notice_period_days || 0} days<br/>
                • Compare with: Today's date ({formatDate(new Date())})<br/>
                • Penalty applies if: Today &lt; Notice End Date
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
                <h3 className="font-medium text-blue-800 mb-1 text-sm">Select Vacate Date</h3>
                <p className="text-xs text-blue-700">Set the actual vacate date.</p>
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
                  onChange={(e) => handleInputChange('requestedVacateDate', e.target.value)}
                  min={currentDate}
                  required
                  className="h-9"
                />
                <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                  <div>• This is the actual date tenant will vacate the bed</div>
                  <div>• Should be at least today's date</div>
                  <div>• Used to calculate final penalties and refund</div>
                  {tenantVacateDate && (
                    <div className="text-blue-600">
                      • Tenant originally requested: {formatDate(tenantVacateDate)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    Penalties are automatically calculated based on selected date and notice status.
                    Click "Next" to see the calculation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && calculation && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-1 text-sm">Penalty Calculation & Summary</h3>
                <p className="text-xs text-blue-700">Review penalties and approve vacate request.</p>
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
                      <div className="font-medium text-sm">{bedData.room_number || 'N/A'}</div>
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
                    
                    {calculation.financials.lockinPenalty > 0 && (
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div>
                          <div className="text-sm text-gray-600">Lock-in Penalty</div>
                          <div className="text-xs text-gray-500">
                            {calculation.lockinPolicy?.penaltyDescription || 'Lock-in period not completed'}
                          </div>
                        </div>
                        <div className="font-medium text-sm text-red-600">
                          - {formatCurrency(calculation.financials.lockinPenalty)}
                        </div>
                      </div>
                    )}
                    
                    {calculation.financials.noticePenalty > 0 && (
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div>
                          <div className="text-sm text-gray-600">Notice Penalty</div>
                          <div className="text-xs text-gray-500">
                            {calculation.noticePolicy?.penaltyDescription || 'Notice period not completed'}
                          </div>
                        </div>
                        <div className="font-medium text-sm text-red-600">
                          - {formatCurrency(calculation.financials.noticePenalty)}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-sm font-medium">Total Penalties</div>
                      <div className="font-medium text-sm text-red-600">
                        - {formatCurrency(calculation.financials.totalPenalty)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="font-medium">Refundable Amount</div>
                      <div className={`font-bold ${
                        calculation.financials.refundableAmount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {calculation.financials.refundableAmount > 0 
                          ? formatCurrency(calculation.financials.refundableAmount)
                          : '₹0'}
                      </div>
                    </div>
                    
                    {calculation.financials.isNegativeRefund && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-red-800 text-sm mb-1">
                              ⚠️ Additional Payment Required
                            </div>
                            <div className="text-sm text-red-700 space-y-1">
                              <div>• Total penalties: {formatCurrency(calculation.financials.totalPenalty)}</div>
                              <div>• Security deposit: {formatCurrency(calculation.financials.securityDeposit)}</div>
                              <div className="font-bold">
                                • Tenant needs to pay: {formatCurrency(calculation.financials.additionalPaymentNeeded)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {calculation.financials.refundableAmount > 0 && !calculation.financials.isNegativeRefund && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-green-800 text-sm mb-1">
                              ✓ Refund available
                            </div>
                            <div className="text-sm text-green-700">
                              • Security deposit after penalties: {formatCurrency(calculation.financials.refundableAmount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {calculation.financials.refundableAmount === 0 && !calculation.financials.isNegativeRefund && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-2">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-yellow-800 text-sm mb-1">
                              No refund available
                            </div>
                            <div className="text-sm text-yellow-700">
                              • Total penalties equal security deposit amount
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
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="adminApproved"
                        checked={formData.adminApproved}
                        onChange={(e) => handleInputChange('adminApproved', e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                      />
                      <div>
                        <label htmlFor="adminApproved" className="font-medium text-sm">
                          Admin Approval
                        </label>
                        <div className="text-xs text-gray-600 space-y-0.5 mt-1">
                          <div>• I approve this vacate request with the calculated penalties</div>
                          <div>• Tenant will vacate bed {bedData.bed_number} on {formatDate(formData.requestedVacateDate)}</div>
                          <div>• Security deposit refund: {formatCurrency(formData.securityRefundAmount)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-2 rounded text-xs ${
                      tenantAgreedToTerms ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        {tenantAgreedToTerms ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                            <span className="font-medium">✓ Tenant Agreement Status:</span>
                            <span>Tenant has accepted both lock-in and notice penalties</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 text-red-600 flex-shrink-0" />
                            <span>
                              <span className="font-medium">⚠️ Tenant Agreement Status:</span>
                              <span> Tenant has NOT accepted all terms</span>
                            </span>
                          </>
                        )}
                      </div>
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
                <h3 className="font-medium text-green-800 text-lg mb-1">Vacate Request Processed Successfully!</h3>
                <p className="text-green-700">
                  The bed has been marked as vacated and penalties have been applied.
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Vacate Record ID: #{submissionResult.vacateRecordId || 'N/A'}
                </p>
              </div>
              
              <Card className="border">
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm mb-2">Processing Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Bed</div>
                      <div className="font-medium">Bed {bedData.bed_number}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Vacate Date</div>
                      <div className="font-medium">{formatDate(formData.requestedVacateDate)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Penalties Applied</div>
                      <div className="font-medium text-red-600">
                        {formatCurrency(submissionResult.financials?.totalPenalty || formData.finalPenaltyAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Refund Amount</div>
                      <div className="font-medium text-green-600">
                        {formatCurrency(submissionResult.financials?.refundableAmount || formData.securityRefundAmount)}
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

        <DialogFooter className="gap-2 pt-3 border-t">
          {step > 1 && step < 6 && (
            <Button variant="outline" onClick={handleBack} disabled={loading || calculating} size="sm">
              Back
            </Button>
          )}
          
          {step < 5 ? (
            <Button onClick={handleNext} disabled={loading || calculating} size="sm">
              {calculating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Calculating...
                </>
              ) : 'Next'}
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
              ) : 'Approve & Process Vacate'}
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

// "use client";

// import React, { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { AlertCircle, Check, Calendar, UserMinus, Loader2, Info, X, CheckCircle } from 'lucide-react';
// import { toast } from 'sonner';
// import { vacateApi } from '@/lib/vacateApi';

// export function VacateBedWizard({
//   open,
//   onOpenChange,
//   bedAssignment,
//   tenantDetails,
//   onVacateComplete,
// }) {
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [calculating, setCalculating] = useState(false);
//   const [initialData, setInitialData] = useState(null);
//   const [calculation, setCalculation] = useState(null);
//   const [submissionResult, setSubmissionResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [lockinStatus, setLockinStatus] = useState(null);
//   const [noticeCompletionStatus, setNoticeCompletionStatus] = useState(null);

//   // Form state
//   const [formData, setFormData] = useState({
//     vacateReasonValue: '',
//     lockinValue: '',
//     lockinPenaltyValue: '',
//     noticeValue: '',
//     isNoticeGiven: false,
//     noticeGivenDate: '',
//     noticeNotGivenPenaltyValue: '',
//     noticePeriodIncompletePenaltyValue: '',
//     requestedVacateDate: '',
//     tenantAgreed: false,
//   });

//   // Load initial data
//   useEffect(() => {
//     if (open && bedAssignment) {
//       loadInitialData();
//     } else {
//       resetWizard();
//     }
//   }, [open, bedAssignment]);

//   const loadInitialData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await vacateApi.getInitialData(bedAssignment.id);
      
//       let data;
//       if (response && response.data) {
//         data = response.data;
//       } else if (response && response.success && response.data) {
//         data = response.data;
//       } else {
//         data = response;
//       }
      
//       if (!data || !data.bedAssignment) {
//         throw new Error("Invalid response from server");
//       }
      
//       setInitialData(data);
      
//       // Set default vacate date to today + 30 days
//       const today = new Date();
//       const defaultVacateDate = new Date(today);
//       defaultVacateDate.setDate(today.getDate() + 30);
//       const formattedDate = defaultVacateDate.toISOString().split('T')[0];
      
//       setFormData(prev => ({
//         ...prev,
//         requestedVacateDate: formattedDate
//       }));
      
//     } catch (error) {
//       console.error('Error loading initial data:', error);
//       setError(error.message || "Failed to load vacate data");
//       toast.error(error.message || "Failed to load vacate data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
    
//     if (field === 'lockinValue') {
//       setLockinStatus(null);
//       if (value.toLowerCase().includes('no_lockin') || value.toLowerCase().includes('none')) {
//         setFormData(prev => ({ ...prev, lockinPenaltyValue: '' }));
//       }
//     }
    
//     if (field === 'noticeValue') {
//       setNoticeCompletionStatus(null);
//     }
//   };

//   const handleNext = async () => {
//     if (step === 1) {
//       if (!formData.vacateReasonValue) {
//         toast.error("Please select a vacate reason");
//         return;
//       }
//       setStep(2);
      
//     } else if (step === 2) {
//       if (!formData.lockinValue) {
//         toast.error("Please select lock-in period");
//         return;
//       }
      
//       if (formData.lockinValue.toLowerCase().includes('no_lockin') || 
//           formData.lockinValue.toLowerCase().includes('none')) {
//         setStep(3);
//         return;
//       }
      
//       await checkLockinStatus();
      
//       if (lockinStatus && !lockinStatus.isCompleted && !formData.lockinPenaltyValue) {
//         toast.error("Please select lock-in penalty");
//         return;
//       }
      
//       setStep(3);
      
//     } else if (step === 3) {
//       if (!formData.noticeValue) {
//         toast.error("Please select notice period");
//         return;
//       }
//       setStep(4);
      
//     } else if (step === 4) {
//       if (formData.isNoticeGiven && !formData.noticeGivenDate) {
//         toast.error("Please select notice given date");
//         return;
//       }
      
//       if (!formData.isNoticeGiven && !formData.noticeNotGivenPenaltyValue) {
//         toast.error("Please select penalty for not giving notice");
//         return;
//       }
      
//       setStep(5);
      
//     } else if (step === 5) {
//       if (!formData.noticeValue) {
//         toast.error("Please select notice period first");
//         setStep(3);
//         return;
//       }
      
//       await checkNoticePeriodCompletion();
      
//       if (noticeCompletionStatus && !noticeCompletionStatus.isCompleted && !formData.noticePeriodIncompletePenaltyValue) {
//         toast.error("Please select penalty for not completing notice period");
//         return;
//       }
      
//       setStep(6);
      
//     } else if (step === 6) {
//       if (!formData.requestedVacateDate) {
//         toast.error("Please select vacant date");
//         return;
//       }
      
//       await calculateAllPenalties();
//       setStep(7);
      
//     } else if (step === 7) {
//       if (!formData.tenantAgreed) {
//         toast.error("Please agree to the terms and conditions");
//         return;
//       }
//       setStep(8);
//     }
//   };

//   const handleBack = () => {
//     if (step > 1) {
//       setStep(step - 1);
//     }
//   };

//   const checkLockinStatus = async () => {
//     try {
//       if (!formData.lockinValue || 
//           formData.lockinValue.toLowerCase().includes('no_lockin') ||
//           formData.lockinValue.toLowerCase().includes('none')) {
//         return;
//       }
      
//       setCalculating(true);
      
//       const response = await vacateApi.calculatePenalties({
//         bedAssignmentId: bedAssignment.id,
//         lockinValue: formData.lockinValue,
//         requestedVacateDate: formData.requestedVacateDate,
//       });
      
//       let result;
//       if (response && response.data) {
//         result = response.data;
//       } else if (response && response.success && response.data) {
//         result = response.data;
//       } else {
//         result = response;
//       }
      
//       if (result && result.lockinPolicy) {
//         setLockinStatus(result.lockinPolicy);
        
//         if (!result.lockinPolicy.isCompleted && !formData.lockinPenaltyValue) {
//           if (initialData?.lockinPenalties?.length > 0) {
//             setFormData(prev => ({ 
//               ...prev, 
//               lockinPenaltyValue: initialData.lockinPenalties[0].value 
//             }));
//           }
//         }
//       } else {
//         const assignedDate = initialData?.bedAssignment?.assigned_date || new Date().toISOString().split('T')[0];
//         const lockinMonths = parseLockinMonths(formData.lockinValue);
        
//         const assigned = new Date(assignedDate);
//         const today = new Date();
        
//         const monthsDiff = (today.getFullYear() - assigned.getFullYear()) * 12 + 
//                           (today.getMonth() - assigned.getMonth());
        
//         const isCompleted = monthsDiff >= lockinMonths;
        
//         setLockinStatus({
//           isCompleted,
//           message: isCompleted 
//             ? `Lock-in completed (${monthsDiff}/${lockinMonths} months)`
//             : `Lock-in not completed (${monthsDiff}/${lockinMonths} months)`
//         });
        
//         if (!isCompleted && !formData.lockinPenaltyValue) {
//           if (initialData?.lockinPenalties?.length > 0) {
//             setFormData(prev => ({ 
//               ...prev, 
//               lockinPenaltyValue: initialData.lockinPenalties[0].value 
//             }));
//           }
//         }
//       }
      
//     } catch (error) {
//       console.error('Error checking lock-in status:', error);
      
//       const assignedDate = initialData?.bedAssignment?.assigned_date || new Date().toISOString().split('T')[0];
//       const lockinMonths = parseLockinMonths(formData.lockinValue);
      
//       const assigned = new Date(assignedDate);
//       const today = new Date();
      
//       const monthsDiff = (today.getFullYear() - assigned.getFullYear()) * 12 + 
//                         (today.getMonth() - assigned.getMonth());
      
//       const isCompleted = monthsDiff >= lockinMonths;
      
//       setLockinStatus({
//         isCompleted,
//         message: isCompleted 
//           ? `Lock-in completed (${monthsDiff}/${lockinMonths} months)`
//           : `Lock-in not completed (${monthsDiff}/${lockinMonths} months)`
//       });
      
//       if (!isCompleted && !formData.lockinPenaltyValue) {
//         if (initialData?.lockinPenalties?.length > 0) {
//           setFormData(prev => ({ 
//             ...prev, 
//             lockinPenaltyValue: initialData.lockinPenalties[0].value 
//           }));
//         }
//       }
//     } finally {
//       setCalculating(false);
//     }
//   };

//   const parseLockinMonths = (lockinValue) => {
//     if (!lockinValue) return 0;
    
//     const lowerValue = lockinValue.toLowerCase();
    
//     if (lowerValue.includes('no_lockin') || lowerValue.includes('none')) return 0;
//     if (lowerValue.includes('1_month') || lowerValue.includes('1_months')) return 1;
//     if (lowerValue.includes('3_month') || lowerValue.includes('3_months')) return 3;
//     if (lowerValue.includes('6_month') || lowerValue.includes('6_months')) return 6;
//     if (lowerValue.includes('12_month') || lowerValue.includes('12_months')) return 12;
    
//     const match = lockinValue.match(/\d+/);
//     return match ? parseInt(match[0]) : 0;
//   };

// const checkNoticePeriodCompletion = async () => {
//   try {
//     if (!formData.noticeValue) {
//       toast.error("Please select notice period first");
//       return;
//     }
    
//     setCalculating(true);
    
//     const today = new Date();
//     let startDate;
    
//     if (formData.isNoticeGiven && formData.noticeGivenDate) {
//       // If notice was given, start counting from notice given date
//       startDate = new Date(formData.noticeGivenDate);
//     } else {
//       // If no notice was given, start counting from assignment date
//       startDate = new Date(initialData?.bedAssignment?.assigned_date || new Date().toISOString().split('T')[0]);
//     }
    
//     const timeDiff = today.getTime() - startDate.getTime();
//     const daysSinceStart = Math.floor(timeDiff / (1000 * 3600 * 24));
    
//     const noticeDays = parseNoticeDays(formData.noticeValue);
//     const isCompleted = daysSinceStart >= noticeDays;
    
//     setNoticeCompletionStatus({
//       isCompleted,
//       message: formData.isNoticeGiven 
//         ? `Notice period ${isCompleted ? 'completed' : 'not completed'} (${daysSinceStart}/${noticeDays} days since notice given)`
//         : `Notice period ${isCompleted ? 'completed' : 'not completed'} (${daysSinceStart}/${noticeDays} days since assignment)`,
//       requiredDays: noticeDays,
//       actualDays: daysSinceStart
//     });
    
//     if (!isCompleted && !formData.noticePeriodIncompletePenaltyValue) {
//       if (initialData?.noticeIncompletePenalties?.length > 0) {
//         setFormData(prev => ({ 
//           ...prev, 
//           noticePeriodIncompletePenaltyValue: initialData.noticeIncompletePenalties[0].value 
//         }));
//       }
//     }
    
//   } catch (error) {
//     console.error('Error checking notice completion:', error);
//     toast.error("Failed to check notice completion");
//   } finally {
//     setCalculating(false);
//   }
// };

//   const parseNoticeDays = (noticeValue) => {
//     if (!noticeValue) return 0;
    
//     const lowerValue = noticeValue.toLowerCase();
    
//     if (lowerValue.includes('no_notice') || lowerValue.includes('none')) return 0;
//     if (lowerValue.includes('15_days') || lowerValue.includes('15_day')) return 15;
//     if (lowerValue.includes('30_days') || lowerValue.includes('30_day') || lowerValue.includes('1_month')) return 30;
//     if (lowerValue.includes('2_month') || lowerValue.includes('60_days')) return 60;
//     if (lowerValue.includes('3_month') || lowerValue.includes('90_days')) return 90;
    
//     return 30;
//   };

// const calculateAllPenalties = async () => {
//   try {
//     setCalculating(true);
    
//     const payload = {
//       bedAssignmentId: bedAssignment.id,
//       vacateReasonValue: formData.vacateReasonValue,
//       lockinValue: formData.lockinValue,
//       lockinPenaltyValue: formData.lockinPenaltyValue,
//       noticeValue: formData.noticeValue,
//       isNoticeGiven: formData.isNoticeGiven,
//       noticeGivenDate: formData.noticeGivenDate,
//       noticeNotGivenPenaltyValue: formData.noticeNotGivenPenaltyValue,
//       requestedVacateDate: formData.requestedVacateDate,
//       noticeIncompletePenaltyValue: formData.noticePeriodIncompletePenaltyValue,
//     };
    
//     const response = await vacateApi.calculatePenalties(payload);
    
//     let result;
//     if (response && response.data) {
//       result = response.data;
//     } else if (response && response.success && response.data) {
//       result = response.data;
//     } else {
//       result = response;
//     }
    
//     if (!result) {
//       throw new Error("Invalid response from calculation");
//     }
    
//     // Ensure notice incomplete penalty is included in the result
//     const securityDeposit = initialData?.bedAssignment?.security_deposit || 7000;
//     const rentPerBed = initialData?.bedAssignment?.rent_per_bed || 4000;
    
//     let noticeIncompletePenalty = 0;
//     if (formData.noticePeriodIncompletePenaltyValue && noticeCompletionStatus && !noticeCompletionStatus.isCompleted) {
//       noticeIncompletePenalty = calculatePenaltyAmount(formData.noticePeriodIncompletePenaltyValue, rentPerBed);
//     }
    
//     // Update result with notice incomplete penalty if missing
//     if (!result.financials?.noticeIncompletePenalty && noticeIncompletePenalty > 0) {
//       result.financials = {
//         ...result.financials,
//         noticeIncompletePenalty,
//         totalPenalty: (result.financials?.totalPenalty || 0) + noticeIncompletePenalty,
//         refundableAmount: Math.max(0, securityDeposit - ((result.financials?.totalPenalty || 0) + noticeIncompletePenalty))
//       };
//     }
    
//     setCalculation(result);
    
//   } catch (error) {
//     console.error('Error calculating penalties:', error);
    
//     const securityDeposit = initialData?.bedAssignment?.security_deposit || 7000;
//     const rentPerBed = initialData?.bedAssignment?.rent_per_bed || 4000;
    
//     let lockinPenalty = 0;
//     if (formData.lockinPenaltyValue && lockinStatus && !lockinStatus.isCompleted) {
//       lockinPenalty = calculatePenaltyAmount(formData.lockinPenaltyValue, rentPerBed);
//     }
    
//     let noticeNotGivenPenalty = 0;
//     if (!formData.isNoticeGiven && formData.noticeNotGivenPenaltyValue) {
//       noticeNotGivenPenalty = calculatePenaltyAmount(formData.noticeNotGivenPenaltyValue, rentPerBed);
//     }
    
//     let noticeIncompletePenalty = 0;
//     if (formData.noticePeriodIncompletePenaltyValue && noticeCompletionStatus && !noticeCompletionStatus.isCompleted) {
//       noticeIncompletePenalty = calculatePenaltyAmount(formData.noticePeriodIncompletePenaltyValue, rentPerBed);
//     }
    
//     const totalPenalty = lockinPenalty + noticeNotGivenPenalty + noticeIncompletePenalty;
//     const refundableAmount = Math.max(0, securityDeposit - totalPenalty);
    
//     setCalculation({
//       financials: {
//         securityDeposit,
//         lockinPenalty,
//         noticeNotGivenPenalty,
//         noticeIncompletePenalty,
//         totalPenalty,
//         refundableAmount
//       },
//       lockinPolicy: {
//         isCompleted: lockinStatus?.isCompleted || false
//       },
//       noticePolicy: {
//         isCompleted: noticeCompletionStatus?.isCompleted || false,
//         isNoticeGiven: formData.isNoticeGiven
//       }
//     });
    
//   } finally {
//     setCalculating(false);
//   }
// };

//   const calculatePenaltyAmount = (penaltyValue, rentPerBed) => {
//     if (!penaltyValue) return 0;
    
//     const lowerValue = penaltyValue.toLowerCase();
    
//     if (lowerValue.includes('one_month_rent')) return rentPerBed;
//     if (lowerValue.includes('two_month_rent')) return rentPerBed * 2;
//     if (lowerValue.includes('three_month_rent')) return rentPerBed * 3;
//     if (lowerValue.includes('half_month_rent')) return Math.round(rentPerBed / 2);
    
//     const match = penaltyValue.match(/(\d+)/);
//     if (match) return parseInt(match[1]);
    
//     return 0;
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);
      
//       const payload = {
//         bedAssignmentId: bedAssignment.id,
//         tenantId: tenantDetails?.id || bedAssignment.tenant_id,
//         vacateReasonValue: formData.vacateReasonValue,
//         lockinValue: formData.lockinValue,
//         lockinPenaltyValue: formData.lockinPenaltyValue,
//         noticeValue: formData.noticeValue,
//         isNoticeGiven: formData.isNoticeGiven,
//         noticeGivenDate: formData.noticeGivenDate,
//         noticeNotGivenPenaltyValue: formData.noticeNotGivenPenaltyValue,
//         requestedVacateDate: formData.requestedVacateDate,
//         noticeIncompletePenaltyValue: formData.noticePeriodIncompletePenaltyValue,
//         tenantAgreed: formData.tenantAgreed,
//       };
      
//       const response = await vacateApi.submitVacateRequest(payload);
      
//       let result;
//       if (response && response.data) {
//         result = response.data;
//       } else if (response && response.success && response.data) {
//         result = response.data;
//       } else {
//         result = response;
//       }
      
//       setSubmissionResult(result);
//       toast.success(result?.message || "Bed vacated successfully!");
      
//       setTimeout(() => {
//         onVacateComplete?.();
//         onOpenChange(false);
//         resetWizard();
//       }, 2000);
      
//     } catch (error) {
//       toast.error(error.message || "Failed to submit vacate request");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetWizard = () => {
//     setStep(1);
//     setInitialData(null);
//     setCalculation(null);
//     setSubmissionResult(null);
//     setError(null);
//     setLockinStatus(null);
//     setNoticeCompletionStatus(null);
//     setFormData({
//       vacateReasonValue: '',
//       lockinValue: '',
//       lockinPenaltyValue: '',
//       noticeValue: '',
//       isNoticeGiven: false,
//       noticeGivenDate: '',
//       noticeNotGivenPenaltyValue: '',
//       requestedVacateDate: '',
//       noticePeriodIncompletePenaltyValue: '',
//       tenantAgreed: false,
//     });
//   };

//   const handleClose = () => {
//     resetWizard();
//     onOpenChange(false);
//   };

//   if (loading && !initialData) {
//     return (
//       <Dialog open={open} onOpenChange={handleClose}>
//         <DialogContent className="sm:max-w-md">
//           <div className="py-12 text-center">
//             <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-500" />
//             <p className="text-gray-600">Loading...</p>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   if (error || !initialData?.bedAssignment) {
//     return (
//       <Dialog open={open} onOpenChange={handleClose}>
//         <DialogContent className="sm:max-w-md">
//           <div className="py-8 text-center">
//             <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
//             <p className="text-gray-600 mb-4">{error || "Failed to load data"}</p>
//             <Button variant="outline" onClick={handleClose}>Close</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   const bedData = initialData.bedAssignment;
//   const currentDate = initialData.currentDate || new Date().toISOString().split('T')[0];

//   const stepTitles = ["Reason", "Lock-in", "Notice", "Notice Given", "Check Notice", "Date", "Summary", "Done"];

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader className="pb-2">
//           <DialogTitle className="text-lg flex items-center gap-2">
//             <UserMinus className="h-4 w-4" />
//             Vacate Bed {bedAssignment.bed_number}
//           </DialogTitle>
//         </DialogHeader>

//         {/* Simple Step Indicator */}
//         <div className="mb-4">
//           <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
//             <span>Step {step} of 8</span>
//             <span>{stepTitles[step - 1]}</span>
//           </div>
//           <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
//             <div 
//               className="h-full bg-blue-600 transition-all duration-300"
//               style={{ width: `${(step / 8) * 100}%` }}
//             />
//           </div>
//         </div>

//         {/* Step 1: Reason */}
//         {step === 1 && (
//           <div className="space-y-3">
//             <h3 className="font-medium">Vacate Reason *</h3>
//             <Select
//               value={formData.vacateReasonValue}
//               onValueChange={(value) => handleInputChange('vacateReasonValue', value)}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select reason" />
//               </SelectTrigger>
//               <SelectContent>
//                 {initialData.vacateReasons?.map((reason) => (
//                   <SelectItem key={reason.id} value={reason.value}>{reason.value}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         )}

//         {/* Step 2: Lock-in Period */}
//         {step === 2 && (
//           <div className="space-y-3">
//             <h3 className="font-medium">Lock-in Period *</h3>
//             <Select
//               value={formData.lockinValue}
//               onValueChange={(value) => handleInputChange('lockinValue', value)}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select lock-in period" />
//               </SelectTrigger>
//               <SelectContent>
//                 {initialData.lockinPolicies?.map((policy) => (
//                   <SelectItem key={policy.id} value={policy.value}>
//                     {policy.value.replace(/_/g, ' ')}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             {formData.lockinValue && 
//              !formData.lockinValue.toLowerCase().includes('no_lockin') && 
//              !formData.lockinValue.toLowerCase().includes('none') && (
//               <div className="space-y-2">
//                 <Button 
//                   variant="outline" 
//                   size="sm"
//                   className="w-full"
//                   onClick={checkLockinStatus} 
//                   disabled={calculating}
//                 >
//                   {calculating ? (
//                     <Loader2 className="h-3 w-3 mr-2 animate-spin" />
//                   ) : null}
//                   Check Lock-in Status
//                 </Button>

//                 {lockinStatus && (
//                   <div className={`p-2 rounded text-sm ${lockinStatus.isCompleted ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
//                     <div className="flex justify-between items-center">
//                       <span>{lockinStatus.isCompleted ? '✓ Completed' : '✗ Not Completed'}</span>
//                       <Badge variant={lockinStatus.isCompleted ? "default" : "destructive"} size="sm">
//                         {lockinStatus.isCompleted ? 'No Penalty' : 'Penalty'}
//                       </Badge>
//                     </div>
                    
//                     {!lockinStatus.isCompleted && (
//                       <div className="mt-2">
//                         <Select
//                           value={formData.lockinPenaltyValue}
//                           onValueChange={(value) => handleInputChange('lockinPenaltyValue', value)}
//                         >
//                           <SelectTrigger className="h-8 text-sm">
//                             <SelectValue placeholder="Select penalty" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {initialData.lockinPenalties?.map((penalty) => (
//                               <SelectItem key={penalty.id} value={penalty.value}>
//                                 {penalty.value.replace(/_/g, ' ')}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Step 3: Notice Period */}
//         {step === 3 && (
//           <div className="space-y-3">
//             <h3 className="font-medium">Notice Period *</h3>
//             <Select
//               value={formData.noticeValue}
//               onValueChange={(value) => handleInputChange('noticeValue', value)}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select notice period" />
//               </SelectTrigger>
//               <SelectContent>
//                 {initialData.noticePeriods?.map((period) => (
//                   <SelectItem key={period.id} value={period.value}>
//                     {period.value.replace(/_/g, ' ')}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         )}

//         {/* Step 4: Notice Given */}
//         {step === 4 && (
//           <div className="space-y-3">
//             <h3 className="font-medium">Notice Given to Admin *</h3>
//             <div className="grid grid-cols-2 gap-2">
//               <Button
//                 variant={formData.isNoticeGiven ? "default" : "outline"}
//                 onClick={() => handleInputChange('isNoticeGiven', true)}
//                 className={formData.isNoticeGiven ? "bg-green-600 hover:bg-green-700" : ""}
//                 size="sm"
//               >
//                 <CheckCircle className="h-3 w-3 mr-1" /> Yes
//               </Button>
//               <Button
//                 variant={!formData.isNoticeGiven ? "default" : "outline"}
//                 onClick={() => handleInputChange('isNoticeGiven', false)}
//                 className={!formData.isNoticeGiven ? "bg-red-600 hover:bg-red-700" : ""}
//                 size="sm"
//               >
//                 <X className="h-3 w-3 mr-1" /> No
//               </Button>
//             </div>

//             {formData.isNoticeGiven ? (
//               <div className="space-y-2">
//                 <Label className="text-sm">Notice Date *</Label>
//                 <Input
//                   type="date"
//                   value={formData.noticeGivenDate}
//                   onChange={(e) => handleInputChange('noticeGivenDate', e.target.value)}
//                   max={currentDate}
//                   className="h-9"
//                 />
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 <Label className="text-sm text-red-600">Penalty for Not Giving Notice *</Label>
//                 <Select
//                   value={formData.noticeNotGivenPenaltyValue}
//                   onValueChange={(value) => handleInputChange('noticeNotGivenPenaltyValue', value)}
//                 >
//                   <SelectTrigger className="h-9">
//                     <SelectValue placeholder="Select penalty" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {initialData.noticeNotGivenPenalties?.map((penalty) => (
//                       <SelectItem key={penalty.id} value={penalty.value}>
//                         {penalty.value.replace(/_/g, ' ')}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Step 5: Check Notice Completion */}
//         {step === 5 && (
//           <div className="space-y-3">
//             <h3 className="font-medium">Check Notice Completion *</h3>
            
//             <div className="bg-gray-50 p-2 rounded text-sm">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <p className="font-medium">{formData.noticeValue?.replace(/_/g, ' ') || 'Not selected'}</p>
//                   <p className="text-gray-600 text-xs">Assigned: {new Date(bedData.assigned_date).toLocaleDateString()}</p>
//                 </div>
//                 <Button 
//                   variant="outline" 
//                   size="sm"
//                   onClick={checkNoticePeriodCompletion}
//                   disabled={calculating || !formData.noticeValue}
//                 >
//                   {calculating ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Check'}
//                 </Button>
//               </div>
//             </div>

//             {noticeCompletionStatus && (
//               <div className={`p-2 rounded text-sm ${noticeCompletionStatus.isCompleted ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
//                 <div className="flex justify-between items-center mb-1">
//                   <span>{noticeCompletionStatus.isCompleted ? '✓ Completed' : '✗ Not Completed'}</span>
//                   <Badge variant={noticeCompletionStatus.isCompleted ? "default" : "destructive"} size="sm">
//                     {noticeCompletionStatus.isCompleted ? 'No Penalty' : 'Penalty'}
//                   </Badge>
//                 </div>
                
//                 {!noticeCompletionStatus.isCompleted && (
//                   <div className="mt-2">
//                     <Select
//                       value={formData.noticePeriodIncompletePenaltyValue}
//                       onValueChange={(value) => handleInputChange('noticePeriodIncompletePenaltyValue', value)}
//                     >
//                       <SelectTrigger className="h-8 text-sm">
//                         <SelectValue placeholder="Select penalty" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {initialData.noticeIncompletePenalties?.map((penalty) => (
//                           <SelectItem key={penalty.id} value={penalty.value}>
//                             {penalty.value.replace(/_/g, ' ')}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Step 6: Vacant Date */}
//         {step === 6 && (
//           <div className="space-y-3">
//             <h3 className="font-medium">Vacant Date *</h3>
//             <Input
//               type="date"
//               value={formData.requestedVacateDate}
//               onChange={(e) => handleInputChange('requestedVacateDate', e.target.value)}
//               min={currentDate}
//               className="h-9"
//             />
//           </div>
//         )}

//         {/* Step 7: Summary - Simplified */}
// {step === 7 && calculation && (
//   <div className="space-y-3">
//     <h3 className="font-medium">Final Summary</h3>
    
//     {/* Quick Info */}
//     <div className="grid grid-cols-2 gap-2 text-sm">
//       <div>
//         <p className="text-gray-500">Tenant</p>
//         <p className="font-medium truncate">{tenantDetails?.full_name || bedData.tenant_name}</p>
//       </div>
//       <div>
//         <p className="text-gray-500">Room</p>
//         <p className="font-medium">Room {bedData.room_number}</p>
//       </div>
//       <div>
//         <p className="text-gray-500">Bed</p>
//         <p className="font-medium">Bed {bedData.bed_number}</p>
//       </div>
//       <div>
//         <p className="text-gray-500">Lock-in Completed</p>
//         <Badge variant={calculation.lockinPolicy?.isCompleted ? "default" : "destructive"} size="sm">
//           {calculation.lockinPolicy?.isCompleted ? 'Yes' : 'No'}
//         </Badge>
//       </div>
//       <div>
//         <p className="text-gray-500">Notice Given</p>
//         <Badge variant={formData.isNoticeGiven ? "default" : "destructive"} size="sm">
//           {formData.isNoticeGiven ? 'Yes' : 'No'}
//         </Badge>
//       </div>
//       <div>
//         <p className="text-gray-500">Notice Completed</p>
//         <Badge variant={calculation.noticePolicy?.isCompleted ? "default" : "destructive"} size="sm">
//           {calculation.noticePolicy?.isCompleted ? 'Yes' : 'No'}
//         </Badge>
//       </div>
//     </div>

//     {/* Penalties Summary */}
//     <div className="space-y-2">
//       <div className="flex justify-between text-sm">
//         <span>Security Deposit</span>
//         <span className="font-medium">{formatCurrency(calculation.financials.securityDeposit)}</span>
//       </div>
      
//       {calculation.financials.lockinPenalty > 0 && (
//         <div className="flex justify-between text-sm text-red-600">
//           <span>Lock-in Penalty</span>
//           <span>- {formatCurrency(calculation.financials.lockinPenalty)}</span>
//         </div>
//       )}
      
//       {calculation.financials.noticeNotGivenPenalty > 0 && (
//         <div className="flex justify-between text-sm text-red-600">
//           <span>Notice Not Given</span>
//           <span>- {formatCurrency(calculation.financials.noticeNotGivenPenalty)}</span>
//         </div>
//       )}
      
//       {/* ALWAYS show notice incomplete penalty if notice period is not completed */}
//       {!calculation.noticePolicy?.isCompleted && (
//         <div className="flex justify-between text-sm text-red-600">
//           <span>Notice Incomplete</span>
//           <span>- {formatCurrency(
//             calculation.financials.noticeIncompletePenalty || 
//             calculatePenaltyAmount(formData.noticePeriodIncompletePenaltyValue, calculation.financials.rentPerBed || 4000) || 
//             0
//           )}</span>
//         </div>
//       )}
      
//       <div className="border-t pt-2">
//         <div className="flex justify-between font-medium">
//           <span>Total Penalties</span>
//           <span className="text-red-600">- {formatCurrency(calculation.financials.totalPenalty)}</span>
//         </div>
//         <div className="flex justify-between font-bold mt-1">
//           <span>Final Refund</span>
//           <span className={calculation.financials.refundableAmount > 0 ? 'text-green-600' : 'text-red-600'}>
//             {formatCurrency(calculation.financials.refundableAmount)}
//           </span>
//         </div>
//       </div>
//     </div>

//     {/* Agreement */}
//     <div className="flex items-start gap-2 pt-2 border-t">
//       <input
//         type="checkbox"
//         id="tenantAgreed"
//         checked={formData.tenantAgreed}
//         onChange={(e) => handleInputChange('tenantAgreed', e.target.checked)}
//         className="h-4 w-4 mt-0.5"
//       />
//       <label htmlFor="tenantAgreed" className="text-sm cursor-pointer">
//         I agree to the terms and confirm all information is correct.
//       </label>
//     </div>
//   </div>
// )}

//         {/* Step 8: Result - Simplified */}
//         {step === 8 && submissionResult && (
//           <div className="space-y-4 text-center">
//             <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
//               <Check className="h-6 w-6 text-green-600" />
//             </div>
            
//             <h3 className="font-bold text-lg">Bed Vacated Successfully!</h3>
            
//             {submissionResult.financials && (
//               <div className="text-left space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Security Deposit</span>
//                   <span className="font-medium">{formatCurrency(submissionResult.financials.securityDeposit)}</span>
//                 </div>
                
//                 {submissionResult.financials.lockinPenalty > 0 && (
//                   <div className="flex justify-between text-red-600">
//                     <span>Lock-in Penalty</span>
//                     <span>- {formatCurrency(submissionResult.financials.lockinPenalty)}</span>
//                   </div>
//                 )}
                
//                 {submissionResult.financials.noticeNotGivenPenalty > 0 && (
//                   <div className="flex justify-between text-red-600">
//                     <span>Notice Not Given</span>
//                     <span>- {formatCurrency(submissionResult.financials.noticeNotGivenPenalty)}</span>
//                   </div>
//                 )}
                
//                 {submissionResult.financials.noticeIncompletePenalty > 0 && (
//                   <div className="flex justify-between text-red-600">
//                     <span>Notice Incomplete</span>
//                     <span>- {formatCurrency(submissionResult.financials.noticeIncompletePenalty)}</span>
//                   </div>
//                 )}
                
//                 <div className="border-t pt-2">
//                   <div className="flex justify-between font-medium">
//                     <span>Final Refund</span>
//                     <span className={submissionResult.financials.refundableAmount > 0 ? 'text-green-600' : 'text-red-600'}>
//                       {formatCurrency(submissionResult.financials.refundableAmount)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             <p className="text-sm text-gray-500">Refund will be processed within 7-10 business days.</p>
//           </div>
//         )}

//         {/* Footer - Simplified */}
//         <DialogFooter className="gap-2 pt-2">
//           {step > 1 && step < 8 && (
//             <Button variant="outline" onClick={handleBack} size="sm" disabled={loading || calculating}>
//               Back
//             </Button>
//           )}
          
//           {step < 7 ? (
//             <Button onClick={handleNext} size="sm" disabled={loading || calculating}>
//               {calculating ? (
//                 <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//               ) : null}
//               Next
//             </Button>
//           ) : step === 7 ? (
//             <Button onClick={handleSubmit} size="sm" disabled={loading || !formData.tenantAgreed}>
//               {loading ? (
//                 <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//               ) : 'Submit'}
//             </Button>
//           ) : (
//             <Button onClick={handleClose} size="sm">Close</Button>
//           )}
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }