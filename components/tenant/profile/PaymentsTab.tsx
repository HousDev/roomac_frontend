"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  CreditCard, 
  IndianRupee, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Wallet,
  Landmark,
  TrendingUp,
  AlertCircle,
  Home,
  Building
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import * as paymentApi from "@/lib/paymentRecordApi";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  payment_mode: string;
  bank_name?: string;
  transaction_id?: string;
  month?: string;
  year?: number;
  remark?: string;
  status: string;
  payment_type: string;
}

interface PaymentsTabProps {
  tenantId: number;
  isMobile?: boolean;
}

interface RentStats {
  totalPaid: number;
  totalPending: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  monthsPaid: Set<string>;
  monthsPending: Set<string>;
}

interface DepositStats {
  requiredAmount: number;
  totalPaid: number;
  totalPending: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  isFullyPaid: boolean;
}

export default function PaymentsTab({ tenantId, isMobile }: PaymentsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentStats, setRentStats] = useState<RentStats>({
    totalPaid: 0,
    totalPending: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    monthsPaid: new Set(),
    monthsPending: new Set()
  });
  
  const [depositStats, setDepositStats] = useState<DepositStats>({
    requiredAmount: 0,
    totalPaid: 0,
    totalPending: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    isFullyPaid: false
  });

  const [totalTransactions, setTotalTransactions] = useState(0);
  const [lastPaymentDate, setLastPaymentDate] = useState<string | null>(null);

  useEffect(() => {
    if (tenantId) {
      fetchPayments();
    }
  }, [tenantId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentApi.getPaymentsByTenant(tenantId);
      
      if (response.success) {
        const paymentData = response.data || [];
        setPayments(paymentData);
        calculateStats(paymentData);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

const calculateStats = (payments: Payment[]) => {
  // Rent stats - initialize all as numbers
  let rentTotalPaid = 0;
  let rentTotalPending = 0;
  let rentApprovedCount = 0;
  let rentPendingCount = 0;
  let rentRejectedCount = 0;
  const monthsPaid = new Set<string>();
  const monthsPending = new Set<string>();
  
  // Deposit stats - initialize all as numbers
  let depositTotalPaid = 0;
  let depositTotalPending = 0;
  let depositApprovedCount = 0;
  let depositPendingCount = 0;
  let depositRejectedCount = 0;
  let depositRequiredAmount = 0;
  
  let lastDate: string | null = null;

  // First pass: find the maximum deposit amount to determine required amount
  payments.forEach(payment => {
    if (payment.payment_type === 'security_deposit') {
      // Ensure amount is a number
      const amount = Number(payment.amount) || 0;
      if (amount > depositRequiredAmount) {
        depositRequiredAmount = amount;
      }
    }
  });

  // Second pass: calculate stats
  payments.forEach(payment => {
    // Ensure amount is a number
    const amount = Number(payment.amount) || 0;
    
    // Track last payment date
    const paymentDate = payment.payment_date;
    if (!lastDate || new Date(paymentDate) > new Date(lastDate)) {
      lastDate = paymentDate;
    }

    if (payment.payment_type === 'rent') {
      const monthKey = `${payment.month || ''}-${payment.year || ''}`;
      
      if (payment.status === 'approved') {
        rentTotalPaid += amount;
        rentApprovedCount++;
        if (monthKey !== '-') monthsPaid.add(monthKey);
      } else if (payment.status === 'pending') {
        rentTotalPending += amount;
        rentPendingCount++;
        if (monthKey !== '-') monthsPending.add(monthKey);
      } else if (payment.status === 'rejected') {
        rentRejectedCount++;
      }
    } else if (payment.payment_type === 'security_deposit') {
      if (payment.status === 'approved') {
        depositTotalPaid += amount;
        depositApprovedCount++;
      } else if (payment.status === 'pending') {
        depositTotalPending += amount;
        depositPendingCount++;
      } else if (payment.status === 'rejected') {
        depositRejectedCount++;
      }
    }
  });

  setRentStats({
    totalPaid: rentTotalPaid,
    totalPending: rentTotalPending,
    approvedCount: rentApprovedCount,
    pendingCount: rentPendingCount,
    rejectedCount: rentRejectedCount,
    monthsPaid,
    monthsPending
  });

  setDepositStats({
    requiredAmount: depositRequiredAmount,
    totalPaid: depositTotalPaid,
    totalPending: depositTotalPending,
    approvedCount: depositApprovedCount,
    pendingCount: depositPendingCount,
    rejectedCount: depositRejectedCount,
    isFullyPaid: depositTotalPaid >= depositRequiredAmount && depositRequiredAmount > 0
  });

  setTotalTransactions(payments.length);
  setLastPaymentDate(lastDate);
};
  const formatCurrency = (amount: number) => {
  // Ensure amount is a valid number
  const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(validAmount);
};

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: any }> = {
      approved: { className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
      pending: { className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      rejected: { className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1 text-xs px-2 py-1`}>
        <Icon className="h-3 w-3" />
        {status === 'approved' ? 'completed' : status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentages
  const rentProgress = rentStats.monthsPaid.size > 0 || rentStats.monthsPending.size > 0
    ? (rentStats.monthsPaid.size / (rentStats.monthsPaid.size + rentStats.monthsPending.size)) * 100
    : 0;

  const depositProgress = depositStats.requiredAmount > 0
    ? (depositStats.totalPaid / depositStats.requiredAmount) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Payment Summary</h2>
        <p className="text-sm text-slate-500 mt-1">
          {totalTransactions} total transactions • Last payment: {lastPaymentDate ? formatDate(lastPaymentDate) : 'Never'}
        </p>
      </div>

      {/* Rent Summary Card */}
      <Card className="border border-blue-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Home className="h-4 w-4" />
            Rent Overview
          </h3>
        </div>
        <CardContent className="p-4">
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mb-4`}>
            <div>
  <p className="text-xs text-slate-500">Total Paid</p>
  <p className="text-xl font-bold text-green-600">{formatCurrency(rentStats.totalPaid)}</p>
  <p className="text-xs text-slate-400">{rentStats.approvedCount || 0} approved payments</p>
</div>
<div>
  <p className="text-xs text-slate-500">Pending Amount</p>
  <p className="text-xl font-bold text-amber-600">{formatCurrency(rentStats.totalPending)}</p>
  <p className="text-xs text-slate-400">{rentStats.pendingCount || 0} pending payments</p>
</div>
            <div>
              <p className="text-xs text-slate-500">Months Covered</p>
              <p className="text-xl font-bold text-blue-600">{rentStats.monthsPaid.size}</p>
              <p className="text-xs text-slate-400">months</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Rejected</p>
              <p className="text-xl font-bold text-red-600">{rentStats.rejectedCount}</p>
              <p className="text-xs text-slate-400">payments</p>
            </div>
          </div>

          {/* Rent Progress Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Payment Progress</span>
              <span>{Math.round(rentProgress)}% of months paid</span>
            </div>
            <Progress value={rentProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Security Deposit Summary Card */}
      <Card className="border border-purple-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Security Deposit Overview
          </h3>
        </div>
        <CardContent className="p-4">
          {depositStats.requiredAmount === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500">No security deposit records found</p>
            </div>
          ) : (
            <>
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mb-4`}>
                <div>
  <p className="text-xs text-slate-500">Total Required</p>
  <p className="text-xl font-bold text-purple-600">{formatCurrency(depositStats.requiredAmount)}</p>
</div>
<div>
  <p className="text-xs text-slate-500">Paid</p>
  <p className="text-xl font-bold text-green-600">{formatCurrency(depositStats.totalPaid)}</p>
  <p className="text-xs text-slate-400">{depositStats.approvedCount || 0} payments</p>
</div>
<div>
  <p className="text-xs text-slate-500">Pending</p>
  <p className="text-xl font-bold text-amber-600">{formatCurrency(depositStats.totalPending)}</p>
  <p className="text-xs text-slate-400">{depositStats.pendingCount || 0} payments</p>
</div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  {depositStats.isFullyPaid ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 mt-1">
                      Fully Paid ✓
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 mt-1">
                      {Math.round(depositProgress)}% Paid
                    </Badge>
                  )}
                </div>
              </div>

              {/* Deposit Progress Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Deposit Progress</span>
                  <span>{Math.round(depositProgress)}% paid</span>
                </div>
                <Progress 
                  value={depositProgress} 
                  className="h-2 bg-purple-100" 
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No payment history</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg gap-2 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-slate-900">
                        {payment.remark || (payment.payment_type === 'rent' ? 'Rent Payment' : 'Security Deposit')}
                      </p>
                      {payment.payment_type === 'security_deposit' && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">
                          Deposit
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{formatDate(payment.payment_date)}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 capitalize">{payment.payment_mode}</span>
                      {payment.month && payment.year && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{payment.month} {payment.year}</span>
                        </>
                      )}
                      {payment.transaction_id && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-mono text-slate-500">
                            ID: {payment.transaction_id.substring(0, 8)}...
                          </span>
                        </>
                      )}
                      {payment.bank_name && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{payment.bank_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-sm text-slate-900">{formatCurrency(payment.amount)}</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(payment.status)}
                      
                      {/* Download receipt for approved payments */}
                      {payment.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                          onClick={() => window.open(`/api/payments/receipts/${payment.id}/download`, '_blank')}
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}