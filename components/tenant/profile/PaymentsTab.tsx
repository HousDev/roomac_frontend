

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

// Compact Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { className: string; icon: any; label: string }> = {
    approved: { 
      className: 'bg-green-50 text-green-600 border-green-200', 
      icon: CheckCircle2,
      label: 'Paid'
    },
    pending: { 
      className: 'bg-yellow-50 text-yellow-600 border-yellow-200', 
      icon: Clock,
      label: 'Pending'
    },
    rejected: { 
      className: 'bg-red-50 text-red-600 border-red-200', 
      icon: XCircle,
      label: 'Failed'
    }
  };

  const config = variants[status] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full`}>
      <Icon className="h-2.5 w-2.5" />
      <span>{config.label}</span>
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

// Compact Payment History Item
const PaymentHistoryItem = ({ payment, formatCurrency, formatDate, isMobile, onDownload }: { 
  payment: Payment; 
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  isMobile?: boolean;
  onDownload?: (id: number) => void;
}) => {
  const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className={`p-1.5 rounded-lg flex-shrink-0 ${
            payment.payment_type === 'rent' ? 'bg-blue-50' : 'bg-yellow-50'
          }`}>
            {payment.payment_type === 'rent' ? (
              <Home className="h-3 w-3 text-blue-600" />
            ) : (
              <Shield className="h-3 w-3 text-yellow-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1 mb-0.5">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {payment.remark || (payment.payment_type === 'rent' ? 'Rent Payment' : 'Security Deposit')}
              </p>
              {payment.month && payment.year && (
                <span className="text-[8px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                  {payment.month} {payment.year}
                </span>
              )}
            </div>
            
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
                  <span className="font-mono">{payment.transaction_id.substring(0, 6)}...</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs font-bold text-blue-600">{formatCurrency(amount)}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={payment.status} />
            {payment.status === 'approved' && (
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
      fetchPayments();
    } else {
      console.error('No tenantId provided to PaymentsTab');
      setError('Tenant ID not available');
      setLoading(false);
    }
  }, [tenantId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await paymentApi.getPaymentsByTenant(tenantId);
      
      if (response.success && response.data) {
        const paymentData = response.data;
        
        const processedPayments = paymentData.map((p: any) => ({
          ...p,
          amount: typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount
        }));
        
        setPayments(processedPayments);
        calculateStats(processedPayments);
      } else {
        console.error('Failed to fetch payments:', response);
        setError(response.message || 'Failed to load payment history');
        setPayments([]);
        calculateStats([]);
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      setError(error.message || 'Failed to load payment history');
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (payments: Payment[]) => {
    let rentTotalPaid = 0;
    let rentTotalPending = 0;
    let rentApprovedCount = 0;
    let rentPendingCount = 0;
    let rentRejectedCount = 0;
    const monthsPaid = new Set<string>();
    const monthsPending = new Set<string>();
    
    let depositTotalPaid = 0;
    let depositTotalPending = 0;
    let depositApprovedCount = 0;
    let depositPendingCount = 0;
    let depositRejectedCount = 0;
    let depositRequiredAmount = 0;
    
    let lastDate: string | null = null;

    // First pass: find the actual required deposit amount from approved payments
    payments.forEach(payment => {
      if (payment.payment_type === 'security_deposit' && payment.status === 'approved') {
        const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
        if (amount > depositRequiredAmount) {
          depositRequiredAmount = amount;
        }
      }
    });

    // If no approved deposit found, look at pending ones as reference
    if (depositRequiredAmount === 0) {
      payments.forEach(payment => {
        if (payment.payment_type === 'security_deposit') {
          const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
          if (amount > depositRequiredAmount) {
            depositRequiredAmount = amount;
          }
        }
      });
    }

    // Second pass: calculate stats based on status
    payments.forEach(payment => {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      
      const paymentDate = payment.payment_date;
      if (!lastDate || new Date(paymentDate) > new Date(lastDate)) {
        lastDate = paymentDate;
      }

      if (payment.payment_type === 'rent') {
        const monthKey = `${payment.month || ''}-${payment.year || ''}`;
        
        if (payment.status === 'approved' || payment.status === 'completed') {
          rentTotalPaid += amount;
          rentApprovedCount++;
          if (monthKey !== '-') monthsPaid.add(monthKey);
        } else if (payment.status === 'pending') {
          rentTotalPending += amount;
          rentPendingCount++;
          if (monthKey !== '-') monthsPending.add(monthKey);
        } else if (payment.status === 'rejected' || payment.status === 'failed') {
          rentRejectedCount++;
        }
      } else if (payment.payment_type === 'security_deposit') {
        if (payment.status === 'approved' || payment.status === 'completed') {
          depositTotalPaid += amount;
          depositApprovedCount++;
        } else if (payment.status === 'pending') {
          depositTotalPending += amount;
          depositPendingCount++;
        } else if (payment.status === 'rejected' || payment.status === 'failed') {
          depositRejectedCount++;
        }
      }
    });

    const depositRemaining = Math.max(0, depositRequiredAmount - depositTotalPaid);

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
      remainingAmount: depositRemaining,
      isFullyPaid: depositTotalPaid >= depositRequiredAmount && depositRequiredAmount > 0
    });

    setTotalTransactions(payments.length);
    setLastPaymentDate(lastDate);
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
          onClick={fetchPayments}
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

      {/* Rent Summary - Compact */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-xs font-medium flex items-center gap-1">
              <Home className="h-3 w-3" />
              Rent Overview
            </h3>
            <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
              {rentStats.monthsPaid.size} {rentStats.monthsPaid.size === 1 ? 'month' : 'months'} paid
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 mb-3`}>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-[8px] text-blue-600 uppercase">Paid</p>
              <p className="text-xs font-bold text-blue-600">{formatCurrency(rentStats.totalPaid)}</p>
              <p className="text-[7px] text-blue-400">{rentStats.approvedCount} payments</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2">
              <p className="text-[8px] text-yellow-600 uppercase">Pending</p>
              <p className="text-xs font-bold text-yellow-600">{formatCurrency(rentStats.totalPending)}</p>
              <p className="text-[7px] text-yellow-400">{rentStats.pendingCount} payments</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <p className="text-[8px] text-purple-600 uppercase">Months</p>
              <p className="text-xs font-bold text-purple-600">{rentStats.monthsPaid.size}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-2">
              <p className="text-[8px] text-red-600 uppercase">Failed</p>
              <p className="text-xs font-bold text-red-600">{rentStats.rejectedCount}</p>
            </div>
          </div>

          {/* Rent Progress Bar - CORRECTED */}
          {rentStats.monthsPaid.size + rentStats.monthsPending.size > 0 && (
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="flex justify-between text-[8px] text-slate-600 mb-1">
                <span>Payment Progress</span>
                <span className="font-bold text-blue-600">
                  {Math.round((rentStats.monthsPaid.size / (rentStats.monthsPaid.size + rentStats.monthsPending.size)) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-yellow-500 rounded-full transition-all"
                  style={{ 
                    width: `${(rentStats.monthsPaid.size / (rentStats.monthsPaid.size + rentStats.monthsPending.size)) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deposit Summary - Compact */}
      {depositStats.requiredAmount > 0 && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-3 py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xs font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Security Deposit
              </h3>
              <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
                {depositStats.isFullyPaid ? 'Fully Paid' : `${Math.round((depositStats.totalPaid / depositStats.requiredAmount) * 100)}% Paid`}
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

            {/* Deposit Progress Bar - CORRECTED */}
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="flex justify-between text-[8px] text-slate-600 mb-1">
                <span>Deposit Progress</span>
                <span className="font-bold text-yellow-600">
                  {Math.round((depositStats.totalPaid / depositStats.requiredAmount) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all"
                  style={{ width: `${(depositStats.totalPaid / depositStats.requiredAmount) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History with Filters */}
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
                  isMobile={isMobile}
                  onDownload={handleDownloadReceipt}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchPayments}
          className="text-[9px] text-slate-500 hover:text-blue-600"
        >
          <Loader2 className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </div>
  );
}