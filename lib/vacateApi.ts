import { request } from '@/lib/api';

// Export interfaces
export interface VacateInitialData {
  bedAssignment: {
    id: number;
    room_id: number;
    bed_number: number;
    tenant_id: number;
    check_in_date: string;
    property_id: number;
    rent_per_bed: number;
    security_deposit: number;
    property_name: string;
    tenant_name: string;
    room_number: number;
    lockin_period_months: number;        // From tenant table
    lockin_penalty_amount: number;       // From tenant table
    lockin_penalty_type: string;         // From tenant table
    notice_period_days: number;          // From tenant table
    notice_penalty_amount: number;       // From tenant table
    notice_penalty_type: string;         // From tenant table
  };
  vacateReasons: Array<{
    id: number;
    value: string;
    is_active: number;
  }>;
  tenantPolicy: {
    lockinPeriodMonths: number;
    lockinPenaltyAmount: number;
    lockinPenaltyType: string;
    noticePeriodDays: number;
    noticePenaltyAmount: number;
    noticePenaltyType: string;
  };
  currentDate: string;
}

export interface PenaltyCalculation {
  bedDetails: {
    id: number;
    room_id: number;
    bed_number: number;
    tenant_id: number;
    check_in_date: string;
    property_id: number;
    rent_per_bed: number;
    security_deposit: number;
    lockin_period_months: number;
    lockin_penalty_amount: number;
    lockin_penalty_type: string;
    notice_period_days: number;
    notice_penalty_amount: number;
    notice_penalty_type: string;
  };
  vacateReasonValue: string;
  lockinPolicy: {
    periodMonths: number;
    penaltyType: string;
    penaltyAmount: number;
    isCompleted: boolean;
    calculatedPenalty: number;
    message: string;
    remainingMonths?: number;
    totalMonths?: number;
  };
  noticePolicy: {
    periodDays: number;
    penaltyType: string;
    penaltyAmount: number;
    isNoticeGiven: boolean;
    isCompleted: boolean;
    noticeGivenDate: string | null;
    calculatedPenalty: number;
    message: string;
    remainingDays?: number;
    totalDays?: number;
  };
  financials: {
    securityDeposit: number;
    rentPerBed: number;
    lockinPenalty: number;
    noticePenalty: number;
    totalPenalty: number;
    refundableAmount: number;
  };
  dates: {
    requestedVacateDate: string;
    checkInDate: string;
  };
}

export interface VacateSubmission {
  vacateRecordId: number;
  status: string;
  financials: {
    securityDeposit: number;
    lockinPenalty: number;
    noticePenalty: number;
    totalPenalty: number;
    refundableAmount: number;
  };
  message: string;
}

export interface VacateRequestData {
  bedAssignmentId: number;
  tenantId: number;
  vacateReasonValue: string;
  isNoticeGiven: boolean;
  noticeGivenDate: string | null;
  requestedVacateDate: string;
  tenantAgreed: boolean;
}

export const vacateApi = {
  // Get initial vacate data
  async getInitialData(bedAssignmentId: any) {
    const response = await request(`/api/vacate/init/${bedAssignmentId}`);
    return response;
  },

  // Calculate penalties
  async calculatePenalties(data: { bedAssignmentId: any; requestedVacateDate: string; vacateReasonValue?: string; isNoticeGiven?: boolean; noticeGivenDate?: string; }) {
    const response = await request('/api/vacate/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  // Submit vacate request
  async submitVacateRequest(data: { bedAssignmentId: any; tenantId: any; vacateReasonValue: string; isNoticeGiven: boolean; noticeGivenDate: string; requestedVacateDate: string; tenantAgreed: boolean; }) {
    const response = await request('/api/vacate/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },

  // Get vacate history
  async getVacateHistory(bedAssignmentId: any) {
    const response = await request(`/api/vacate/history/${bedAssignmentId}`);
    return response;
  },
};