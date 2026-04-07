


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
  Landmark,
  CheckCircle
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
  // Add these imports at the top of your file
import { createRazorpayOrder, verifyRazorpayPayment } from '@/lib/paymentApi';

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
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
    const [paymentConfirmationData, setPaymentConfirmationData] =
      useState<any>(null);

// Add this state near your other states
const [loadingPayment, setLoadingPayment] = useState(false);
  
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
   const [hasBedAssignment, setHasBedAssignment] = useState(false);
   const [tenantPayments, setTenantPayments] = useState<any[]>([]);
    const [loadingPaymentForm, setLoadingPaymentForm] = useState(false);
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
      const tenantData = profileRes.data;
      setTenant(tenantData);
      
      // ✅ Set hasBedAssignment based on tenant data
      if (tenantData.room_number && tenantData.bed_number) {
        setHasBedAssignment(true);
      } else {
        setHasBedAssignment(false);
      }
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

    const fetchTenantPayments = useCallback(async () => {
      if (!tenant?.id) return;
  
      try {
        const response = await paymentApi.getPaymentsByTenant(tenant.id);
        if (response.success) {
          setTenantPayments(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching tenant payments:", error);
      }
    }, [tenant?.id]);

      const fetchSecurityDepositInfo = useCallback(async () => {
        if (!tenant?.id) return;
    
        try {
          const response = await paymentApi.getSecurityDepositInfo(tenant.id);
          if (response.success) {
            setSecurityDepositInfo(response.data);
            // Auto-fill the amount with pending deposit amount
            if (response.data && response.data.pending_amount > 0) {
              setNewPayment((prev) => ({
                ...prev,
                amount: response.data.pending_amount.toString(),
              }));
              // toast.info(`Security deposit pending: ₹${response.data.pending_amount.toLocaleString()}`);
            }
          }
        } catch (error) {
          console.error("Error fetching security deposit info:", error);
        }
      }, [tenant?.id]);

      const fetchPaymentFormData = useCallback(async () => {
        if (!tenant?.id) return;
    
        setLoadingPaymentForm(true);
        try {
          const response = await paymentApi.getTenantPaymentFormData(tenant.id);
          if (response.success) {
            setPaymentFormData(response.data);
          }
    
          // Also fetch security deposit info
          await fetchSecurityDepositInfo();
        } catch (error) {
          console.error("Error fetching payment form data:", error);
        } finally {
          setLoadingPaymentForm(false);
        }
      }, [tenant?.id, fetchSecurityDepositInfo]);

      // Update handlePaymentTypeChange
  const handlePaymentTypeChange = async (type: string) => {
    setNewPayment((prev) => ({ ...prev, payment_type: type }));
    setSelectedPaymentMonth(""); // Reset month selection

    if (type === "rent") {
      // Reset to rent view
      setSecurityDepositInfo(null);
      await fetchPaymentFormData();
      // Clear amount if it was set from security deposit
      setNewPayment((prev) => ({ ...prev, amount: "" }));
    } else if (type === "security_deposit") {
      // Clear payment form data when switching to security deposit
      setPaymentFormData(null);
      // Fetch security deposit info
      await fetchSecurityDepositInfo();
    }
  };

  // Add this function for Razorpay payment
const handleRazorpayPayment = useCallback(
  async (amount: number, paymentData: any) => {
    try {
      setLoading(true);
      
      // First, ensure Razorpay script is loaded
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          if ((window as any).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => {
            console.error("Failed to load Razorpay script");
            resolve(false);
          };
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please refresh and try again.");
        setLoading(false);
        return false;
      }

      // Create order from backend
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        toast.error(orderResult.message || "Failed to create payment order");
        setLoading(false);
        return false;
      }

      const options = {
        key: orderResult.key,
        amount: orderResult.order.amount,
        currency: "INR",
        name: "ROOMAC",
        description: `Payment for ${paymentData.payment_type === "rent" ? "Rent" : "Security Deposit"}`,
        order_id: orderResult.order.id,
        handler: async function (response: any) {
          try {
            // Payment successful - save the payment record
            const saveResponse = await fetch("/api/payments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...paymentData,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                payment_status: "completed",
                status: "approved",
                transaction_id: response.razorpay_payment_id,
              }),
            });

            const saveResult = await saveResponse.json();

            if (saveResult.success) {
              // Create notification for admin
              try {
                const paymentTypeDisplay = paymentData.payment_type === "rent" ? "Rent" : "Security Deposit";
                const monthDisplay = paymentData.month ? ` for ${paymentData.month} ${paymentData.year}` : "";
                
                // Create notification for admin
                await fetch("/api/admin/notifications", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    recipient_id: 1, // Admin ID
                    recipient_type: "admin",
                    title: "💰 New Payment Received",
                    message: `${tenant?.full_name} has successfully paid ${paymentTypeDisplay} payment of ₹${paymentData.amount.toLocaleString()}${monthDisplay} via Razorpay. Transaction ID: ${response.razorpay_payment_id}`,
                    notification_type: "payment",
                    related_entity_type: "payment",
                    related_entity_id: saveResult.data.id,
                    priority: "medium",
                  }),
                });
              } catch (notifError) {
                console.error("❌ Error creating admin notification:", notifError);
              }
              
              // Also create notification for tenant
              try {
                await fetch("/api/admin/notifications", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    recipient_id: tenant?.id,
                    recipient_type: "tenant",
                    title: "✅ Payment Successful",
                    message: `Your ${paymentData.payment_type === "rent" ? "rent" : "security deposit"} payment of ₹${paymentData.amount.toLocaleString()} has been successfully processed.`,
                    notification_type: "payment",
                    related_entity_type: "payment",
                    related_entity_id: saveResult.data.id,
                    priority: "low",
                  }),
                });
              } catch (tenantNotifError) {
                console.error("Error creating tenant notification:", tenantNotifError);
              }
              // Show confirmation popup
              setPaymentConfirmationData({
                id: saveResult.data?.id || Date.now().toString(),
                payment_type: paymentData.payment_type,
                amount: paymentData.amount,
                month: paymentData.month,
                year: paymentData.year,
                transaction_id: response.razorpay_payment_id,
              });
              setShowPaymentConfirmation(true);
              setShowPaymentDialog(false);
              fetchTenantPayments();
              
              // Reset form
              setNewPayment({
                payment_type: "rent",
                amount: "",
                payment_mode: "online",
                bank_name: "",
                transaction_id: "",
                payment_date: new Date().toISOString().split("T")[0],
                remark: "",
              });
              setSelectedPaymentMonth("");
              setSecurityDepositInfo(null);
              setPaymentFormData(null);
              
              toast.success("Payment successful!");
            } else {
              toast.error(saveResult.message || "Payment saved but verification pending");
            }
          } catch (error) {
            console.error("Error saving payment:", error);
            toast.error("Payment successful but failed to save record");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: tenant?.full_name,
          email: tenant?.email,
          contact: tenant?.phone,
        },
        theme: { color: "#0149ab" },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      return true;
    } catch (error: any) {
      console.error("Razorpay error:", error);
      toast.error(error.message || "Payment failed");
      setLoading(false);
      return false;
    }
  },
  [tenant, fetchTenantPayments]
);
const handleSubmitPayment = useCallback(async () => {
  if (!newPayment.amount) {
    toast.error("Please enter an amount");
    return;
  }

  if (!hasBedAssignment) {
    toast.error(
      "You cannot make a payment as no bed has been assigned to you yet"
    );
    return;
  }

  try {
    // Prepare payment data
    const paymentData: any = {
      tenant_id: tenant?.id,
      booking_id: null,
      payment_type: newPayment.payment_type,
      amount: parseFloat(newPayment.amount),
      payment_mode: "online",
      bank_name: newPayment.bank_name || null,
      transaction_id: newPayment.transaction_id || null,
      payment_date: newPayment.payment_date,
      remark: newPayment.remark || null,
      status: "pending",
    };

    // For rent payments, add month/year
    if (newPayment.payment_type === "rent") {
      if (selectedPaymentMonth && selectedPaymentMonth !== "current") {
        const [year, month] = selectedPaymentMonth.split("-");
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ];
        paymentData.month = monthNames[parseInt(month) - 1];
        paymentData.year = parseInt(year);
        paymentData.remark =
          paymentData.remark ||
          `Payment for ${paymentData.month} ${paymentData.year}`;
      } else {
        const currentDate = new Date();
        paymentData.month = currentDate.toLocaleString("default", {
          month: "long",
        });
        paymentData.year = currentDate.getFullYear();
      }
    }

    // Call Razorpay payment
    await handleRazorpayPayment(parseFloat(newPayment.amount), paymentData);
    
  } catch (error: any) {
    console.error("❌ Payment error:", error);
    toast.error(error.message || "Failed to initiate payment");
  }
}, [tenant?.id, newPayment, selectedPaymentMonth, hasBedAssignment, handleRazorpayPayment]);
  // Auto-close payment confirmation after 5 seconds
useEffect(() => {
  if (showPaymentConfirmation) {
    const timer = setTimeout(() => {
      setShowPaymentConfirmation(false);
      setPaymentConfirmationData(null);
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [showPaymentConfirmation]);



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

  // Payment Confirmation Modal Component
  const PaymentConfirmationModal = ({
    isOpen,
    onClose,
    paymentDetails,
  }: {
    isOpen: boolean;
    onClose: () => void;
    paymentDetails: any;
  }) => {
    const [countdown, setCountdown] = useState(5);
  
    useEffect(() => {
      if (isOpen) {
        setCountdown(5);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
  
        return () => clearInterval(timer);
      }
    }, [isOpen]);
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full shadow-2xl">
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
  
            <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 mb-2">
              Payment Successful! 🎉
            </h3>
  
            <p className="text-xs sm:text-sm text-gray-600 text-center mb-4">
              Your payment has been processed successfully.
            </p>
  
            {paymentDetails && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 mb-4 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-xs text-gray-600">Payment ID:</span>
                  <span className="text-sm sm:text-base font-bold text-gray-900">
                    #{String(paymentDetails.id || '').slice(-8) || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Payment Type:</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 capitalize">
                    {paymentDetails.payment_type === "rent"
                      ? "Rent Payment"
                      : "Security Deposit"}
                  </span>
                </div>
                {paymentDetails.month && paymentDetails.year && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">For Month:</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {paymentDetails.month} {paymentDetails.year}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Amount Paid:</span>
                  <span className="text-base sm:text-lg font-bold text-green-600">
                    ₹{paymentDetails.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Payment Mode:</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 capitalize">
                    Online (Razorpay)
                  </span>
                </div>
                {paymentDetails.transaction_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Transaction ID:</span>
                    <span className="text-xs font-mono text-gray-900">
                      {String(paymentDetails.transaction_id).slice(0, 12)}...
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-600">Status:</span>
                  <Badge className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5">
                    Completed
                  </Badge>
                </div>
              </div>
            )}
  
            <button
              onClick={onClose}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              {countdown > 0 ? `Auto-closing in ${countdown}s...` : "Done"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className=" bg-slate-50">
      {/* Compact Header */}
      <div className=" sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-end justify-end">
        
          
          {/* Make Payment Button - Top Right */}
          <Button 
            size="sm"
            className="bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#002a7a] hover:to-[#001a5a] text-white h-7 px-3 text-xs"
            onClick={() => {
    if (!hasBedAssignment) {
      toast.error(
        "You cannot make a payment as no bed has been assigned to you yet. Please contact the property manager."
      );
      return;
    }
    setShowPaymentDialog(true);
  }}
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

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-4xl max-h-[600px] p-0 gap-0 overflow-auto rounded-2xl">
          {/* Header - Mobile optimized */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white text-base sm:text-lg font-semibold flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-lg">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  Make a Payment
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  Record a new payment for your account
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-3 sm:p-6">
            {/* Tenant Information - Mobile: stacked layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Tenant
                </Label>
                <div className="h-9 sm:h-10 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-md text-xs sm:text-sm flex items-center">
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 mr-1.5 sm:mr-2" />
                  <span className="truncate">
                    {tenant?.full_name || "Loading..."}
                  </span>
                </div>
              </div>

              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Payment Type
                </Label>
                <Select
                  value={newPayment.payment_type || "rent"}
                  onValueChange={handlePaymentTypeChange}
                >
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="security_deposit">
                      Security Deposit
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bed Assignment Table - Desktop keeps table, mobile shows cards */}
            {tenant && (
              <div className="bg-white rounded-lg border border-slate-200 mb-3 sm:mb-4 overflow-hidden">
                <div className="bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 sm:gap-2">
                    <Bed className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Your Accommodation Details
                  </h4>
                </div>
                <div className="p-2 sm:p-4 overflow-x-auto">
                  {/* Desktop: Original Table view (unchanged) */}
                  <table className="w-full text-sm hidden sm:table">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-2 text-xs font-medium text-slate-600">
                          Property
                        </th>
                        <th className="text-left p-2 text-xs font-medium text-slate-600">
                          Room
                        </th>
                        <th className="text-left p-2 text-xs font-medium text-slate-600">
                          Bed #
                        </th>
                        <th className="text-left p-2 text-xs font-medium text-slate-600">
                          Bed Type
                        </th>
                        <th className="text-left p-2 text-xs font-medium text-slate-600">
                          Monthly Rent
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-slate-200">
                        <td className="p-2 text-sm">
                          {tenant?.property_name || "Roomac Heights"}
                        </td>
                        <td className="p-2 text-sm">
                          Room {tenant?.room_number || "N/A"}
                        </td>
                        <td className="p-2 text-sm font-medium">
                          #{tenant?.bed_number || "N/A"}
                        </td>
                        <td className="p-2 text-sm capitalize">
                          {tenant?.bed_type || "Standard"}
                        </td>
                        <td className="p-2 text-sm font-semibold text-green-600">
                          ₹
                          {Number(
                            tenant?.tenant_rent || tenant?.monthly_rent || 0
                          ).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Mobile: Card view (only visible on mobile) */}
                  <div className="space-y-2 sm:hidden">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-slate-500">Property</p>
                          <p className="text-sm font-medium">
                            {tenant?.property_name || "Roomac Heights"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Room</p>
                          <p className="text-sm font-medium">
                            Room {tenant?.room_number || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Bed #</p>
                          <p className="text-sm font-medium">
                            #{tenant?.bed_number || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Bed Type</p>
                          <p className="text-sm capitalize">
                            {tenant?.bed_type || "Standard"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-slate-500">Monthly Rent</p>
                          <p className="text-base font-bold text-green-600">
                            ₹
                            {Number(
                              tenant?.tenant_rent ||
                                tenant?.monthly_rent ||
                                stats.monthlyRent,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rent Summary Table - Desktop keeps table, mobile shows cards */}
            {paymentFormData &&
              paymentFormData.month_wise_history &&
              paymentFormData.month_wise_history.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 mb-3 sm:mb-4 overflow-hidden">
                  <div className="bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-slate-200">
                    <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 sm:gap-2">
                      <IndianRupee className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Your Payment History
                    </h4>
                  </div>
                  <div className="p-2 sm:p-4 max-h-[200px] overflow-y-auto">
                    {/* Desktop: Original Table view (unchanged) */}
                    <table className="w-full text-sm hidden sm:table">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="text-left p-2 text-xs font-medium text-slate-600">
                            Month
                          </th>
                          <th className="text-right p-2 text-xs font-medium text-slate-600">
                            Rent
                          </th>
                          <th className="text-right p-2 text-xs font-medium text-slate-600">
                            Paid
                          </th>
                          <th className="text-right p-2 text-xs font-medium text-slate-600">
                            Pending
                          </th>
                          <th className="text-center p-2 text-xs font-medium text-slate-600">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentFormData.month_wise_history
                          .slice(-6)
                          .map((month: any, index: number) => (
                            <tr
                              key={index}
                              className={`border-t border-slate-200 ${month.isCurrentMonth ? "bg-blue-50" : ""}`}
                            >
                              <td className="p-2 text-sm">
                                {month.month} {month.year}
                                {month.isCurrentMonth && (
                                  <span className="ml-2 text-xs text-blue-600 font-medium">
                                    (Current)
                                  </span>
                                )}
                              </td>
                              <td className="p-2 text-right">
                                ₹{month.rent?.toLocaleString() || "0"}
                              </td>
                              <td className="p-2 text-right text-green-600">
                                ₹{month.paid?.toLocaleString() || "0"}
                              </td>
                              <td className="p-2 text-right text-amber-600 font-medium">
                                ₹
                                {month.pending?.toLocaleString() ||
                                  month.rent?.toLocaleString()}
                              </td>
                              <td className="p-2 text-center">
                                <Badge
                                  className={
                                    month.status === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : month.status === "partial"
                                        ? "bg-blue-100 text-blue-800"
                                        : month.status === "overdue"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-slate-100 text-slate-800"
                                  }
                                >
                                  {month.status || "pending"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        {/* Total Row */}
                        <tr className="border-t-2 border-slate-300 bg-slate-50">
                          <td className="p-2 text-sm font-bold" colSpan={2}>
                            Total Outstanding
                          </td>
                          <td className="p-2 text-right font-bold text-green-600">
                            ₹
                            {paymentFormData.total_paid?.toLocaleString() ||
                              "0"}
                          </td>
                          <td className="p-2 text-right font-bold text-amber-600">
                            ₹
                            {paymentFormData.total_pending?.toLocaleString() ||
                              "0"}
                          </td>
                          <td className="p-2 text-center">
                            <Badge className="bg-purple-100 text-purple-800">
                              Due: ₹
                              {paymentFormData.total_pending?.toLocaleString() ||
                                "0"}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Mobile: Card view (only visible on mobile) */}
                    <div className="space-y-2 sm:hidden">
                      {paymentFormData.month_wise_history
                        .slice(-6)
                        .map((month: any, index: number) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${month.isCurrentMonth ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-sm">
                                  {month.month} {month.year}
                                  {month.isCurrentMonth && (
                                    <span className="ml-2 text-xs text-blue-600 font-medium">
                                      (Current)
                                    </span>
                                  )}
                                </p>
                              </div>
                              <Badge
                                className={
                                  month.status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : month.status === "partial"
                                      ? "bg-blue-100 text-blue-800"
                                      : month.status === "overdue"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-slate-100 text-slate-800"
                                }
                              >
                                {month.status || "pending"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-slate-500">Rent</p>
                                <p className="font-medium">
                                  ₹{month.rent?.toLocaleString() || "0"}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500">Paid</p>
                                <p className="font-medium text-green-600">
                                  ₹{month.paid?.toLocaleString() || "0"}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500">Pending</p>
                                <p className="font-medium text-amber-600">
                                  ₹
                                  {month.pending?.toLocaleString() ||
                                    month.rent?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      {/* Total Outstanding Card */}
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-sm">Total Outstanding</p>
                          <div className="text-right">
                            <p className="text-xs text-green-600">
                              Paid: ₹
                              {paymentFormData.total_paid?.toLocaleString() ||
                                "0"}
                            </p>
                            <p className="text-sm font-bold text-amber-600">
                              Due: ₹
                              {paymentFormData.total_pending?.toLocaleString() ||
                                "0"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Security Deposit Info - Mobile optimized spacing */}
            {newPayment.payment_type === "security_deposit" &&
              securityDepositInfo && (
                <div className="bg-white rounded-lg border border-slate-200 mb-3 sm:mb-4 overflow-hidden">
                  <div className="bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-slate-200">
                    <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 sm:gap-2">
                      <IndianRupee className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Security Deposit Information
                    </h4>
                  </div>
                  <div className="p-3 sm:p-4">
                    {/* Grid stays same on both but responsive spacing */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Property</p>
                        <p className="text-sm font-medium truncate">
                          {securityDepositInfo.property_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">
                          Total Security Deposit
                        </p>
                        <p className="text-sm font-bold text-blue-600">
                          ₹
                          {securityDepositInfo.security_deposit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Already Paid</p>
                        <p className="text-sm font-medium text-green-600">
                          ₹{securityDepositInfo.paid_amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Pending Amount</p>
                        <p className="text-sm font-bold text-amber-600">
                          ₹{securityDepositInfo.pending_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Payment Progress</span>
                        <span>
                          {Math.round(
                            (securityDepositInfo.paid_amount /
                              securityDepositInfo.security_deposit) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                          style={{
                            width: `${(securityDepositInfo.paid_amount / securityDepositInfo.security_deposit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>


                    {securityDepositInfo.last_payment_date && (
                      <p className="text-xs text-slate-400 mt-2">
                        Last payment:{" "}
                        {new Date(
                          securityDepositInfo.last_payment_date,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}

            {/* Payment Details Grid - Desktop: 4 columns, Mobile: stacked */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-3 mb-3 sm:mb-4">
              {/* Amount Field */}
              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Amount (₹) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    ₹
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newPayment.amount}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, amount: e.target.value })
                    }
                    className="pl-8 h-9 sm:h-10 text-sm"
                  />
                </div>
              </div>

              {/* Month Selection Field - Only show for rent */}
              {newPayment.payment_type === "rent" && (
                <div className="space-y-1 sm:space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Pay For Month
                  </Label>
                  <Select
                    value={selectedPaymentMonth}
                    onValueChange={(value) => {
                      setSelectedPaymentMonth(value);
                      if (
                        value &&
                        value !== "current" &&
                        paymentFormData?.unpaid_months
                      ) {
                        const selectedMonth =
                          paymentFormData.unpaid_months.find(
                            (m: any) => m.month_key === value,
                          );
                        if (selectedMonth) {
                          setNewPayment((prev) => ({
                            ...prev,
                            amount: selectedMonth.pending.toString(),
                          }));
                          
                        }
                      } else if (value === "current") {
                        const monthlyRent = Number(
                          tenant?.tenant_rent ||
                            tenant?.monthly_rent ||
                            stats.monthlyRent,
                        );
                        setNewPayment((prev) => ({
                          ...prev,
                          amount: monthlyRent.toString(),
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 sm:h-10 text-sm">
                      <SelectValue placeholder="Select month..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Month</SelectItem>
                      {paymentFormData?.unpaid_months?.map((month: any) => (
                        <SelectItem
                          key={month.month_key}
                          value={month.month_key}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>
                              {month.month} {month.year}
                            </span>
                            <span className="ml-4 text-xs text-amber-600 font-medium">
                              ₹{month.pending.toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {paymentFormData?.unpaid_months?.length === 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      All months paid! 🎉
                    </p>
                  )}
                </div>
              )}

              {/* Payment Mode Field */}
              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Payment Mode *
                </Label>
                <Select
                  value={newPayment.payment_mode || "cash"}
                  onValueChange={(value) =>
                    setNewPayment({
                      ...newPayment,
                      payment_mode: value,
                      bank_name: "",
                    })
                  }
                >
                  <SelectTrigger className="h-9 sm:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">🌐 Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Date Field */}
              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Transaction Date
                </Label>
                <Input
                  type="date"
                  value={
                    newPayment.payment_date ||
                    new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      payment_date: e.target.value,
                    })
                  }
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            {/* Conditional Fields Row - Desktop: 3 columns, Mobile: stacked */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3 mb-3 sm:mb-4">
              {(newPayment.payment_mode === "bank_transfer" ||
                newPayment.payment_mode === "online") && (
                <div className="space-y-1 sm:space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Bank Name
                  </Label>
                  <Input
                    placeholder="Enter bank name"
                    value={newPayment.bank_name || ""}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        bank_name: e.target.value,
                      })
                    }
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
              )}

              {(newPayment.payment_mode === "online" ||
                newPayment.payment_mode === "bank_transfer" ||
                newPayment.payment_mode === "cheque") && (
                <div className="space-y-1 sm:space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Transaction ID
                  </Label>
                  <Input
                    placeholder="Optional"
                    value={newPayment.transaction_id || ""}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        transaction_id: e.target.value,
                      })
                    }
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>
              )}

              {/* Remark Field */}
              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Remark
                </Label>
                <Input
                  placeholder="Add notes"
                  value={newPayment.remark || ""}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, remark: e.target.value })
                  }
                  className="h-9 sm:h-10 text-sm"
                />
              </div>
            </div>

            {/* Footer - Mobile: full width buttons stacked */}
            <DialogFooter className="px-3 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg sticky bottom-0 -mx-3 sm:-mx-6 -mb-3 sm:-mb-6">
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPaymentDialog(false);
                    setNewPayment({
                      amount: "",
                      payment_type: "rent",
                      payment_mode: "online",
                      bank_name: "",
                      transaction_id: "",
                      payment_date: new Date().toISOString().split("T")[0],
                      remark: "",
                    });
                    setSelectedPaymentMonth("");
                  }}
                  className="w-full sm:w-auto px-4 sm:px-6 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitPayment}
                  disabled={!newPayment.amount || !hasBedAssignment}
                  className="w-full sm:w-auto px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Modal */}
<PaymentConfirmationModal
  isOpen={showPaymentConfirmation}
  onClose={() => {
    setShowPaymentConfirmation(false);
    setPaymentConfirmationData(null);
  }}
  paymentDetails={paymentConfirmationData}
/>
    </div>
  );
}