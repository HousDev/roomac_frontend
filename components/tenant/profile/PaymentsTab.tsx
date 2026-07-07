// components/tenant/profile/PaymentsTab.tsx - Fixed

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Shield,
  Home,
  FileText,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import * as paymentApi from "@/lib/paymentRecordApi";

interface Payment {
  id: number;
  amount: number | string;
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
  remainingAmount: number;
  isFullyPaid: boolean;
}

const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status?.toLowerCase() || '';
  
  // Show "Approved" for approved status
  if (normalizedStatus === 'approved') {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full">
        <CheckCircle2 className="h-2.5 w-2.5" />
        <span>Approved</span>
      </Badge>
    );
  }
  
  // Show "Paid" for paid status
  if (normalizedStatus === 'paid') {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full">
        <CheckCircle2 className="h-2.5 w-2.5" />
        <span>Paid</span>
      </Badge>
    );
  }
  
  // Show "Pending" for pending status
  if (normalizedStatus === 'pending') {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200 flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full">
        <Clock className="h-2.5 w-2.5" />
        <span>Pending</span>
      </Badge>
    );
  }
  
  // Show "Rejected" for rejected status
  if (normalizedStatus === 'rejected') {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full">
        <XCircle className="h-2.5 w-2.5" />
        <span>Rejected</span>
      </Badge>
    );
  }
  
  // Fallback for any other status
  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full">
      <span className="capitalize">{status || 'Unknown'}</span>
    </Badge>
  );
};

// Compact Stat Card
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue'
}: { 
  title: string; 
  value: string; 
  icon: any; 
  color?: 'blue' | 'gold' | 'green' | 'red' | 'purple';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    gold: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-3 w-3" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-xs font-bold text-slate-800 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
};

const PaymentHistoryItem = ({ payment, formatCurrency, formatDate, onDownload }: { 
  payment: Payment; 
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  onDownload?: (id: number) => void;
}) => {
  const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
  // ✅ Show download button ONLY for approved status
  const showDownloadButton = payment.status === "approved";
  
  // Get remark text (use remark or default based on payment type)
  const getRemarkText = () => {
    if (payment.remark) return payment.remark;
    if (payment.payment_type === 'rent') return 'Rent Payment';
    if (payment.payment_type === 'security_deposit') return 'Security Deposit';
    return 'Payment';
  };
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        {/* Left side - Icon and Details */}
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Payment Type Icon */}
          <div className={`p-1.5 rounded-lg flex-shrink-0 ${
            payment.payment_type === 'rent' ? 'bg-blue-50' : 'bg-yellow-50'
          }`}>
            {payment.payment_type === 'rent' ? (
              <Home className="h-3 w-3 text-blue-600" />
            ) : (
              <Shield className="h-3 w-3 text-yellow-600" />
            )}
          </div>
          
          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            {/* Remark/Description */}
            <div className="flex items-center flex-wrap gap-1 mb-0.5">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {getRemarkText()}
              </p>
              {payment.month && payment.year && (
                <span className="text-[8px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                  {payment.month} {payment.year}
                </span>
              )}
            </div>
            
            {/* Date and Payment Mode */}
            <div className="flex items-center flex-wrap gap-1.5 text-[8px] text-slate-500">
              <div className="flex items-center gap-0.5">
                <Calendar className="h-2.5 w-2.5" />
                <span>{formatDate(payment.payment_date)}</span>
              </div>
              <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
              <div className="flex items-center gap-0.5">
                <CreditCard className="h-2.5 w-2.5" />
                <span className="capitalize truncate max-w-[60px]">{payment.payment_mode}</span>
              </div>
              {payment.transaction_id && (
                <>
                  <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                  <span className="font-mono">{payment.transaction_id.substring(0, 8)}...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Amount and Status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs font-bold text-blue-600">{formatCurrency(amount)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={payment.status} />
            {/* ✅ Download button ONLY for approved status */}
            {showDownloadButton && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDownload?.(payment.id)}
                className="h-5 w-5 p-0 text-blue-600 hover:text-blue-600 hover:bg-blue-50 rounded"
              >
                <Download className="h-2.5 w-2.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PaymentsTab({ tenantId, isMobile = false }: PaymentsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentFormData, setPaymentFormData] = useState<any>(null);
  const [securityDepositInfo, setSecurityDepositInfo] = useState<any>(null); // ✅ Add this
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    remainingAmount: 0,
    isFullyPaid: false
  });

  const [totalTransactions, setTotalTransactions] = useState(0);
  const [lastPaymentDate, setLastPaymentDate] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'rent' | 'deposit'>('all');

  useEffect(() => {
    if (tenantId) {
      fetchData();
    } else {
      console.error('No tenantId provided to PaymentsTab');
      setError('Tenant ID not available');
      setLoading(false);
    }
  }, [tenantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch payments, payment form data, AND security deposit info
      const [paymentsRes, formDataRes, depositRes] = await Promise.all([
        paymentApi.getPaymentsByTenant(tenantId),
        paymentApi.getTenantPaymentFormData(tenantId),
        paymentApi.getSecurityDepositInfo(tenantId)  // ✅ Add this
      ]);
      
      // ✅ Set security deposit info from API (this has the correct required amount)
      if (depositRes.success && depositRes.data) {
        setSecurityDepositInfo(depositRes.data);
        console.log('Security deposit info:', depositRes.data);
      }
      
      if (paymentsRes.success && paymentsRes.data) {
        const paymentData = paymentsRes.data;
        const processedPayments = paymentData.map((p: any) => ({
          ...p,
          amount: typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount
        }));
        
        setPayments(processedPayments);
        
        // Calculate rent stats from payments
        calculateRentStats(processedPayments);
        
        // Calculate deposit stats using the correct required amount from API
        if (depositRes.success && depositRes.data) {
          calculateDepositStats(processedPayments, depositRes.data);
        }
      } else {
        setPayments([]);
        calculateRentStats([]);
        if (depositRes.success && depositRes.data) {
          calculateDepositStats([], depositRes.data);
        }
      }
      
      if (formDataRes.success) {
        setPaymentFormData(formDataRes.data);
      }
      
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load payment history');
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const isPaymentPaid = (status: string): boolean => {
    const paidStatuses = ['approved', 'paid', 'completed'];
    return paidStatuses.includes(status?.toLowerCase() || '');
  };

  const calculateRentStats = (payments: Payment[]) => {
    let rentTotalPaid = 0;
    let rentTotalPending = 0;
    let rentApprovedCount = 0;
    let rentPendingCount = 0;
    let rentRejectedCount = 0;
    const monthsPaid = new Set<string>();
    const monthsPending = new Set<string>();
    let lastDate: string | null = null;

    payments.forEach(payment => {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      const isPaid = isPaymentPaid(payment.status);
      const isPending = payment.status?.toLowerCase() === 'pending';
      const isRejected = payment.status?.toLowerCase() === 'rejected';
      
      const paymentDate = payment.payment_date;
      if (!lastDate || new Date(paymentDate) > new Date(lastDate)) {
        lastDate = paymentDate;
      }

      if (payment.payment_type === 'rent') {
        const monthKey = `${payment.month || ''}-${payment.year || ''}`;
        
        if (isPaid) {
          rentTotalPaid += amount;
          rentApprovedCount++;
          if (monthKey !== '-') monthsPaid.add(monthKey);
        } else if (isPending) {
          rentTotalPending += amount;
          rentPendingCount++;
          if (monthKey !== '-') monthsPending.add(monthKey);
        } else if (isRejected) {
          rentRejectedCount++;
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

    setTotalTransactions(payments.length);
    setLastPaymentDate(lastDate);
  };

  // ✅ NEW: Calculate deposit stats using the correct required amount from API
  const calculateDepositStats = (payments: Payment[], depositInfo: any) => {
    let depositTotalPaid = 0;
    let depositTotalPending = 0;
    let depositApprovedCount = 0;
    let depositPendingCount = 0;
    let depositRejectedCount = 0;
    
    // ✅ Use the actual required amount from bed_assignments (via API)
    const depositRequiredAmount = depositInfo.security_deposit || 0;
    
    payments.forEach(payment => {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      const isPaid = isPaymentPaid(payment.status);
      const isPending = payment.status?.toLowerCase() === 'pending';
      const isRejected = payment.status?.toLowerCase() === 'rejected';
      
      if (payment.payment_type === 'security_deposit') {
        if (isPaid) {
          depositTotalPaid += amount;
          depositApprovedCount++;
        } else if (isPending) {
          depositTotalPending += amount;
          depositPendingCount++;
        } else if (isRejected) {
          depositRejectedCount++;
        }
      }
    });
    
    // Also check if depositInfo has paid_amount (more accurate)
    if (depositInfo.paid_amount > 0) {
      depositTotalPaid = depositInfo.paid_amount;
    }
    if (depositInfo.pending_amount > 0) {
      depositTotalPending = depositInfo.pending_amount;
    }
    
    const depositRemaining = Math.max(0, depositRequiredAmount - depositTotalPaid);
    const isFullyPaid = depositRemaining === 0 && depositRequiredAmount > 0;
    
    console.log('Deposit calculation:', {
      required: depositRequiredAmount,
      paid: depositTotalPaid,
      pending: depositTotalPending,
      remaining: depositRemaining,
      isFullyPaid
    });
    
    setDepositStats({
      requiredAmount: depositRequiredAmount,
      totalPaid: depositTotalPaid,
      totalPending: depositTotalPending,
      approvedCount: depositApprovedCount,
      pendingCount: depositPendingCount,
      rejectedCount: depositRejectedCount,
      remainingAmount: depositRemaining,
      isFullyPaid: isFullyPaid
    });
  };

  const handleDownloadReceipt = (paymentId: number) => {
    window.open(`/api/payments/receipts/${paymentId}/download`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(validAmount).replace('₹', '₹');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM');
    } catch {
      return dateString;
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'rent') return payment.payment_type === 'rent';
    if (activeFilter === 'deposit') return payment.payment_type === 'security_deposit';
    return true;
  });

  // Use paymentFormData for rent summary table
  const months = paymentFormData?.month_wise_history || [];
  const totalRentPaid = paymentFormData?.total_paid || rentStats.totalPaid;
  const totalRentPending = paymentFormData?.total_pending || rentStats.totalPending;

  // Calculate deposit percentage
  const depositPercentage = depositStats.requiredAmount > 0 
    ? Math.round((depositStats.totalPaid / depositStats.requiredAmount) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-600">Loading payments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex p-3 bg-red-100 rounded-full mb-3">
          <XCircle className="h-5 w-5 text-red-600" />
        </div>
        <p className="text-sm font-medium text-slate-800">Failed to load payments</p>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchData}
          className="mt-3 text-xs"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Payments</h2>
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <FileText className="h-3 w-3 text-blue-600" />
            {totalTransactions} {totalTransactions === 1 ? 'transaction' : 'transactions'}
            {lastPaymentDate && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                <Calendar className="h-3 w-3 text-yellow-600" />
                Last: {formatDate(lastPaymentDate)}
              </>
            )}
          </p>
        </div>
        <Badge className="bg-blue-50 text-blue-600 border-none text-[9px] px-2 py-0.5 rounded-full">
          <Shield className="h-2.5 w-2.5 mr-0.5" />
          Secure
        </Badge>
      </div>

      {/* Compact Stats Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2`}>
        <StatCard
          title="Total Paid"
          value={formatCurrency(rentStats.totalPaid + depositStats.totalPaid)}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Pending"
          value={formatCurrency(rentStats.totalPending + depositStats.totalPending)}
          icon={Clock}
          color="gold"
        />
        <StatCard
          title="Rent Paid"
          value={formatCurrency(rentStats.totalPaid)}
          icon={Home}
          color="blue"
        />
        <StatCard
          title="Deposit Paid"
          value={formatCurrency(depositStats.totalPaid)}
          icon={Shield}
          color="purple"
        />
      </div>

      {/* Rent Summary - Using paymentFormData for accurate rent table */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-xs font-medium flex items-center gap-1">
              <Home className="h-3 w-3" />
              Rent Overview
            </h3>
            <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
              {months.length} {months.length === 1 ? 'month' : 'months'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          {months.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-2 text-xs font-medium text-slate-600">Month</th>
                    <th className="text-right p-2 text-xs font-medium text-slate-600">Rent</th>
                    <th className="text-right p-2 text-xs font-medium text-slate-600">Paid</th>
                    <th className="text-right p-2 text-xs font-medium text-slate-600">Discount</th>
                    <th className="text-right p-2 text-xs font-medium text-slate-600">Pending</th>
                    <th className="text-center p-2 text-xs font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((month: any, index: number) => (
                    <tr key={index} className="border-t border-slate-200">
                      <td className="p-2 text-sm font-medium">
                        {month.month} {month.year}
                        {month.is_prorated && (
                          <span className="ml-2 text-[10px] text-amber-600">
                            (Prorated - {month.prorated_days} days)
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-right">₹{month.rent?.toLocaleString()}</td>
                      <td className="p-2 text-right text-green-600 font-medium">
                        ₹{month.paid?.toLocaleString()}
                      </td>
                      <td className="p-2 text-right text-red-500">
                        ₹{month.discount_applied?.toLocaleString() || 0}
                      </td>
                      <td className="p-2 text-right font-medium">
                        <span className={month.pending > 0 ? "text-amber-600" : "text-green-600"}>
                          ₹{month.pending?.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          month.status === "paid" ? "bg-green-100 text-green-800" :
                          month.status === "partial" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {month.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr className="border-t border-slate-200 font-bold">
                    <td className="p-2 text-sm">Total</td>
                    <td className="p-2 text-right">₹{paymentFormData?.total_expected?.toLocaleString() || '0'}</td>
                    <td className="p-2 text-right text-green-600">₹{totalRentPaid?.toLocaleString() || '0'}</td>
                    <td className="p-2 text-right text-red-500">₹{paymentFormData?.total_discount?.toLocaleString() || '0'}</td>
                    <td className="p-2 text-right text-amber-600">₹{totalRentPending?.toLocaleString() || '0'}</td>
                    <td className="p-2 text-center">
                      <Badge className="bg-purple-100 text-purple-800">
                        Due: ₹{totalRentPending?.toLocaleString() || '0'}
                      </Badge>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-slate-500">No rent history available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Deposit Summary - Corrected with actual required amount */}
      {depositStats.requiredAmount > 0 && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]  px-3 py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xs font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Security Deposit
              </h3>
              <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
                {depositStats.isFullyPaid ? 'Fully Paid' : `${depositPercentage}% Paid`}
              </Badge>
            </div>
          </div>
          <CardContent className="p-3">
            <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-4'} gap-2 mb-3`}>
              <div className="bg-purple-50 rounded-lg p-2">
                <p className="text-[8px] text-purple-600 uppercase">Required</p>
                <p className="text-xs font-bold text-purple-600">{formatCurrency(depositStats.requiredAmount)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-[8px] text-blue-600 uppercase">Paid</p>
                <p className="text-xs font-bold text-blue-600">{formatCurrency(depositStats.totalPaid)}</p>
                <p className="text-[7px] text-blue-400">{depositStats.approvedCount} payments</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <p className="text-[8px] text-yellow-600 uppercase">Pending</p>
                <p className="text-xs font-bold text-yellow-600">{formatCurrency(depositStats.totalPending)}</p>
                <p className="text-[7px] text-yellow-400">{depositStats.pendingCount} payments</p>
              </div>
              {!isMobile && (
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-[8px] text-red-600 uppercase">Remaining</p>
                  <p className="text-xs font-bold text-red-600">{formatCurrency(depositStats.remainingAmount)}</p>
                </div>
              )}
            </div>

            {/* Status Row */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[9px] text-slate-500">Status:</span>
              <span className={`text-xs font-bold ${depositStats.isFullyPaid ? 'text-green-600' : depositStats.totalPaid > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {depositStats.isFullyPaid ? 'Fully Paid' : depositStats.totalPaid > 0 ? 'Partial' : 'Not Paid'}
              </span>
            </div>

            {/* Deposit Progress Bar */}
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="flex justify-between text-[8px] text-slate-600 mb-1">
                <span>Deposit Progress</span>
                <span className="font-bold text-yellow-600">{depositPercentage}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all"
                  style={{ width: `${depositPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5 text-blue-600" />
              Transaction History
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter('all')}
                className={`h-6 px-2 text-[9px] rounded-md ${activeFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter('rent')}
                className={`h-6 px-2 text-[9px] rounded-md ${activeFilter === 'rent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
              >
                Rent
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter('deposit')}
                className={`h-6 px-2 text-[9px] rounded-md ${activeFilter === 'deposit' ? 'bg-white text-yellow-600 shadow-sm' : 'text-slate-600'}`}
              >
                Deposit
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-3">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-6">
              <div className="inline-flex p-2 bg-slate-100 rounded-full mb-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-xs font-medium text-slate-800">No payments found</p>
              <p className="text-[9px] text-slate-500 mt-1">
                {activeFilter === 'all' ? 'No transactions yet' : 
                 activeFilter === 'rent' ? 'No rent payments found' : 'No deposit payments found'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {filteredPayments.map((payment) => (
                <PaymentHistoryItem
                  key={payment.id}
                  payment={payment}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  onDownload={handleDownloadReceipt}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

     
    </div>
  );
}