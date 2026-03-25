


"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Home,
  Shield,
  Download,
  ArrowLeft,
  FileText,
  RefreshCw,
  Plus,
  X,
  User,
  Bed,
  AlertCircle,
  Wallet,
  TrendingUp,
  Landmark
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

import { getTenantId, type TenantProfile } from "@/lib/tenantAuthApi";
import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
import * as paymentApi from '@/lib/paymentRecordApi';
import * as notificationApi from '@/lib/notificationApi';

// Types
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

// Compact Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { className: string; icon: any; label: string }> = {
    approved: { 
      className: 'bg-green-50 text-green-600 border-green-200', 
      icon: CheckCircle2,
      label: 'Paid'
    },
    pending: { 
      className: 'bg-[#fff9e6] text-[#ffc107] border-[#ffc107]/20', 
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
    blue: 'bg-[#e6f0ff] text-[#004aad]',
    gold: 'bg-[#fff9e6] text-[#ffc107]',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5 hover:shadow-sm transition-all">
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
const PaymentHistoryItem = ({ payment, formatCurrency, formatDate }: { 
  payment: Payment; 
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}) => (
  <div className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-all">
    <div className="flex items-start justify-between gap-2">
      {/* Left Section */}
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
          payment.payment_type === 'rent' ? 'bg-[#e6f0ff]' : 'bg-[#fff9e6]'
        }`}>
          {payment.payment_type === 'rent' ? (
            <Home className="h-3 w-3 text-[#004aad]" />
          ) : (
            <Shield className="h-3 w-3 text-[#ffc107]" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1 mb-0.5">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {payment.remark || (payment.payment_type === 'rent' ? 'Rent' : 'Deposit')}
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
              <span className="capitalize truncate max-w-[50px]">{payment.payment_mode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-xs font-bold text-[#004aad]">{formatCurrency(payment.amount)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={payment.status} />
          {(payment.status === 'approved' || payment.status === 'completed') && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 text-[#004aad] hover:text-[#004aad] hover:bg-[#e6f0ff] rounded"
              onClick={() => window.open(`/api/payments/receipts/${payment.id}/download`, '_blank')}
            >
              <Download className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function TenantPaymentsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Stats
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

  // Dialog states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState<any>(null);
  const [selectedPaymentMonth, setSelectedPaymentMonth] = useState('');
  const [securityDepositInfo, setSecurityDepositInfo] = useState<any>(null);
  const [newPayment, setNewPayment] = useState({
    payment_type: 'rent',
    amount: '',
    payment_mode: 'cash',
    bank_name: '',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    remark: ''
  });

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'rent' | 'deposit'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

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

  // Fetch tenant data and payments
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const tenantId = getTenantId();
      
      if (!tenantId) {
        navigate('/login');
        return;
      }

      // Fetch tenant profile
      const profileRes = await tenantDetailsApi.loadProfile();
      if (profileRes.success) {
        setTenant(profileRes.data);
      }

      // Fetch payments
      const paymentsRes = await paymentApi.getPaymentsByTenant(tenantId);
      if (paymentsRes.success) {
        const paymentData = paymentsRes.data || [];
        setPayments(paymentData);
        calculateStats(paymentData);
      }

      // Fetch payment form data
      const formDataRes = await paymentApi.getTenantPaymentFormData(tenantId);
      if (formDataRes.success) {
        setPaymentFormData(formDataRes.data);
      }

      // Fetch security deposit info
      const depositRes = await paymentApi.getSecurityDepositInfo(tenantId);
      if (depositRes.success) {
        setSecurityDepositInfo(depositRes.data);
      }

    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

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

    // Find max deposit amount
    payments.forEach(payment => {
      if (payment.payment_type === 'security_deposit') {
        const amount = Number(payment.amount) || 0;
        if (amount > depositRequiredAmount) {
          depositRequiredAmount = amount;
        }
      }
    });

    // Calculate stats
    payments.forEach(payment => {
      const amount = Number(payment.amount) || 0;

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
  };

  // Handle payment submission
  const handleSubmitPayment = useCallback(async () => {
    if (!newPayment.amount) {
      toast.error("Please enter an amount");
      return;
    }

    try {
      const paymentData: any = {
        tenant_id: tenant?.id,
        booking_id: null,
        payment_type: newPayment.payment_type,
        amount: parseFloat(newPayment.amount),
        payment_mode: newPayment.payment_mode,
        bank_name: newPayment.bank_name || null,
        transaction_id: newPayment.transaction_id || null,
        payment_date: newPayment.payment_date,
        remark: newPayment.remark || null,
      };

      if (newPayment.payment_type === 'rent' && selectedPaymentMonth) {
        if (selectedPaymentMonth !== 'current') {
          const [year, month] = selectedPaymentMonth.split('-');
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
          
          paymentData.month = monthNames[parseInt(month) - 1];
          paymentData.year = parseInt(year);
          paymentData.remark = paymentData.remark || `Payment for ${paymentData.month} ${paymentData.year}`;
        } else {
          const currentDate = new Date();
          paymentData.month = currentDate.toLocaleString('default', { month: 'long' });
          paymentData.year = currentDate.getFullYear();
        }
      }

      const response = await paymentApi.createPayment(paymentData);

      if (response.success && response.data) {
        // Create notification for admin
        try {
          const paymentTypeDisplay = newPayment.payment_type === 'rent' ? 'Rent' : 'Security Deposit';
          const monthDisplay = paymentData.month ? ` for ${paymentData.month} ${paymentData.year}` : '';
          
          await notificationApi.createNotification({
            recipient_id: 1,
            recipient_type: 'admin',
            title: '💰 New Payment Request',
            message: `${tenant?.full_name} has initiated a ${paymentTypeDisplay} payment of ₹${parseFloat(newPayment.amount).toLocaleString()}${monthDisplay}. Payment mode: ${newPayment.payment_mode}.`,
            notification_type: 'payment',
            related_entity_type: 'payment',
            related_entity_id: response.data.id,
            priority: 'medium'
          });
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }

        setShowPaymentDialog(false);
        setNewPayment({
          payment_type: 'rent',
          amount: '',
          payment_mode: 'cash',
          bank_name: '',
          transaction_id: '',
          payment_date: new Date().toISOString().split('T')[0],
          remark: ''
        });
        setSelectedPaymentMonth('');
        
        toast.success('Payment initiated successfully');
        fetchData(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
    }
  }, [tenant, newPayment, selectedPaymentMonth, fetchData]);

  const handlePaymentTypeChange = async (type: string) => {
    setNewPayment(prev => ({ ...prev, payment_type: type }));
    setSelectedPaymentMonth('');
    
    if (type === 'rent') {
      setSecurityDepositInfo(null);
      setNewPayment(prev => ({ ...prev, amount: '' }));
    } else if (type === 'security_deposit') {
      setPaymentFormData(null);
      if (tenant?.id) {
        const depositRes = await paymentApi.getSecurityDepositInfo(tenant.id);
        if (depositRes.success && depositRes.data) {
          setSecurityDepositInfo(depositRes.data);
          if (depositRes.data.pending_amount > 0) {
            setNewPayment(prev => ({
              ...prev,
              amount: depositRes.data.pending_amount.toString()
            }));
          }
        }
      }
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (filterType !== 'all' && payment.payment_type !== filterType) return false;
    if (filterStatus !== 'all' && payment.status !== filterStatus) return false;
    return true;
  });

  // Calculate progress
  const rentProgress = rentStats.monthsPaid.size > 0 || rentStats.monthsPending.size > 0
    ? (rentStats.monthsPaid.size / (rentStats.monthsPaid.size + rentStats.monthsPending.size)) * 100
    : 0;

  const depositProgress = depositStats.requiredAmount > 0
    ? (depositStats.totalPaid / depositStats.requiredAmount) * 100
    : 0;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-3">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="h-8 bg-slate-200 animate-pulse rounded w-32"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-200 animate-pulse rounded-lg"></div>)}
          </div>
          <div className="h-48 bg-slate-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-slate-50">
      {/* Compact Header */}
      <div className=" sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-end justify-end">
        
          
          {/* Make Payment Button - Top Right */}
          <Button 
            size="sm"
            className="bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#002a7a] hover:to-[#001a5a] text-white h-7 px-3 text-xs"
            onClick={() => setShowPaymentDialog(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Make a payment
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 space-y-3">
        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
            title="Rent"
            value={formatCurrency(rentStats.totalPaid)}
            icon={Home}
            color="blue"
          />
          <StatCard
            title="Deposit"
            value={formatCurrency(depositStats.totalPaid)}
            icon={Shield}
            color="purple"
          />
        </div>

        {/* Rent Summary - Compact */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-3 py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xs font-medium flex items-center gap-1">
                <Home className="h-3 w-3" />
                Rent
              </h3>
              <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
                {rentStats.monthsPaid.size} months
              </Badge>
            </div>
          </div>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-[#e6f0ff] rounded-lg p-2">
                <p className="text-[8px] text-[#004aad] uppercase">Paid</p>
                <p className="text-xs font-bold text-[#004aad]">{formatCurrency(rentStats.totalPaid)}</p>
              </div>
              <div className="bg-[#fff9e6] rounded-lg p-2">
                <p className="text-[8px] text-[#ffc107] uppercase">Pending</p>
                <p className="text-xs font-bold text-[#ffc107]">{formatCurrency(rentStats.totalPending)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-[8px] text-blue-600 uppercase">Months</p>
                <p className="text-xs font-bold text-blue-600">{rentStats.monthsPaid.size}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <p className="text-[8px] text-red-600 uppercase">Failed</p>
                <p className="text-xs font-bold text-red-600">{rentStats.rejectedCount}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="flex justify-between text-[8px] text-slate-600 mb-1">
                <span>Progress</span>
                <span className="font-bold text-[#004aad]">{Math.round(rentProgress)}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#004aad] to-[#ffc107] rounded-full transition-all"
                  style={{ width: `${rentProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Summary - Compact */}
        {depositStats.requiredAmount > 0 && (
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#ffc107] to-[#e6b002] px-3 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-xs font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Deposit
                </h3>
                <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
                  {depositStats.isFullyPaid ? 'Paid' : `${Math.round(depositProgress)}%`}
                </Badge>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-[8px] text-purple-600 uppercase">Required</p>
                  <p className="text-xs font-bold text-purple-600">{formatCurrency(depositStats.requiredAmount)}</p>
                </div>
                <div className="bg-[#e6f0ff] rounded-lg p-2">
                  <p className="text-[8px] text-[#004aad] uppercase">Paid</p>
                  <p className="text-xs font-bold text-[#004aad]">{formatCurrency(depositStats.totalPaid)}</p>
                </div>
                <div className="bg-[#fff9e6] rounded-lg p-2">
                  <p className="text-[8px] text-[#ffc107] uppercase">Pending</p>
                  <p className="text-xs font-bold text-[#ffc107]">{formatCurrency(depositStats.totalPending)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-[8px] text-slate-600 uppercase">Status</p>
                  <div className="flex items-center gap-1">
                    {depositStats.isFullyPaid ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <Clock className="h-3 w-3 text-[#ffc107]" />
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {depositStats.isFullyPaid ? 'Paid' : 'Partial'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="flex justify-between text-[8px] text-slate-600 mb-1">
                  <span>Progress</span>
                  <span className="font-bold text-[#ffc107]">{Math.round(depositProgress)}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ffc107] to-[#e6b002] rounded-full transition-all"
                    style={{ width: `${depositProgress}%` }}
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
                <CreditCard className="h-3.5 w-3.5 text-[#004aad]" />
                History
              </h3>
              <div className="flex items-center gap-1">
                <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                  <SelectTrigger className="w-[70px] h-6 text-[9px] px-2">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All</SelectItem>
                    <SelectItem value="rent" className="text-xs">Rent</SelectItem>
                    <SelectItem value="deposit" className="text-xs">Deposit</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                  <SelectTrigger className="w-[70px] h-6 text-[9px] px-2">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All</SelectItem>
                    <SelectItem value="approved" className="text-xs">Paid</SelectItem>
                    <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                    <SelectItem value="rejected" className="text-xs">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={fetchData}
                >
                  <RefreshCw className="h-3 w-3" />
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
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredPayments.map((payment) => (
                  <PaymentHistoryItem
                    key={payment.id}
                    payment={payment}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compact Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-auto max-h-[90vh]">
          <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-4 py-3 sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-sm font-semibold flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded-lg">
                  <Plus className="h-4 w-4" />
                </div>
                New Payment
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-7 w-7">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Tenant Info */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-slate-700">Tenant</Label>
                <div className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-md text-xs flex items-center">
                  <User className="h-3 w-3 text-slate-400 mr-1" />
                  <span className="truncate">{tenant?.full_name}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-slate-700">Payment Type</Label>
                <Select value={newPayment.payment_type} onValueChange={handlePaymentTypeChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent" className="text-xs">Rent</SelectItem>
                    <SelectItem value="security_deposit" className="text-xs">Security Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Accommodation Details - Simplified */}
            {tenant && (
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                <div className="grid grid-cols-4 gap-1 text-[8px] text-slate-500 mb-1">
                  <div>Property</div>
                  <div>Room</div>
                  <div>Bed</div>
                  <div>Rent</div>
                </div>
                <div className="grid grid-cols-4 gap-1 text-xs font-medium">
                  <div className="truncate">{tenant?.property_name || 'Roomac'}</div>
                  <div>{tenant?.room_number || 'N/A'}</div>
                  <div>#{tenant?.bed_number || 'N/A'}</div>
                  <div className="text-green-600">₹{Number(tenant?.tenant_rent || tenant?.monthly_rent).toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Quick Payment Form */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-slate-700">Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-slate-700">Payment Mode</Label>
                <Select
                  value={newPayment.payment_mode}
                  onValueChange={(value) => setNewPayment({ ...newPayment, payment_mode: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash" className="text-xs">💵 Cash</SelectItem>
                    <SelectItem value="online" className="text-xs">🌐 Online</SelectItem>
                    <SelectItem value="bank_transfer" className="text-xs">🏦 Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Month Selection for Rent */}
            {newPayment.payment_type === 'rent' && paymentFormData?.unpaid_months?.length > 0 && (
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-slate-700">Pay For Month</Label>
                <Select value={selectedPaymentMonth} onValueChange={setSelectedPaymentMonth}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current" className="text-xs">Current Month</SelectItem>
                    {paymentFormData.unpaid_months.slice(0, 3).map((month: any) => (
                      <SelectItem key={month.month_key} value={month.month_key} className="text-xs">
                        {month.month} {month.year} (₹{month.pending.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Security Deposit Info - Compact */}
            {newPayment.payment_type === 'security_deposit' && securityDepositInfo && (
              <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[8px] text-purple-600">Required</p>
                    <p className="text-xs font-bold text-purple-600">₹{securityDepositInfo.security_deposit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-[#004aad]">Paid</p>
                    <p className="text-xs font-bold text-[#004aad]">₹{securityDepositInfo.paid_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-[#ffc107]">Pending</p>
                    <p className="text-xs font-bold text-[#ffc107]">₹{securityDepositInfo.pending_amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Fields - Simplified */}
            {(newPayment.payment_mode === 'bank_transfer' || newPayment.payment_mode === 'online') && (
              <div className="space-y-2">
                <Input
                  placeholder="Transaction ID (optional)"
                  value={newPayment.transaction_id || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            )}

            {/* Footer */}
            <DialogFooter className="pt-2">
              <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" size="sm" onClick={() => setShowPaymentDialog(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitPayment}
                  disabled={!newPayment.amount}
                  className="bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#002a7a] hover:to-[#001a5a] text-white h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Pay Now
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}