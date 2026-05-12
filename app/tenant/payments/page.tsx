// app/tenant/payments.tsx

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
  CheckCircle,
  ChevronDown 
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
import * as paymentApi from "@/lib/paymentRecordApi";
import * as notificationApi from "@/lib/notificationApi";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/paymentApi";
import { consumeMasters } from "@/lib/masterApi";
import { getAndClearPaymentIntent } from "@/lib/paymentRecordApi";
import { useSocketIO } from "@/hooks/useSocketIO";

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
  totalDiscount: number;
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


// Update StatusBadge component
const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status?.toLowerCase() || '';
  
  // ✅ Treat both 'paid' and 'approved' as success
  if (normalizedStatus === 'paid' || normalizedStatus === 'approved') {
    return (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-600 border-green-200 flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full"
      >
        <CheckCircle2 className="h-2.5 w-2.5" />
        <span>Paid</span>
      </Badge>
    );
  }
  
  // Rest remains the same...
  if (normalizedStatus === 'pending') {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-600 border-yellow-200 flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full"
      >
        <Clock className="h-2.5 w-2.5" />
        <span>Pending</span>
      </Badge>
    );
  }
  
  if (normalizedStatus === 'rejected') {
    return (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-600 border-red-200 flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full"
      >
        <XCircle className="h-2.5 w-2.5" />
        <span>Failed</span>
      </Badge>
    );
  }
  
  return (
    <Badge
      variant="outline"
      className="bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full"
    >
      <span>{status || 'Unknown'}</span>
    </Badge>
  );
};

// Compact Stat Card
const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "blue",
}: {
  title: string;
  value: string;
  icon: any;
  color?: "blue" | "gold" | "green" | "red" | "purple";
}) => {
  const colorClasses = {
    blue: "bg-[#e6f0ff] text-[#004aad]",
    gold: "bg-[#fff9e6] text-[#ffc107]",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5 hover:shadow-sm transition-all">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-3 w-3" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-xs font-bold text-slate-800 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Professional Payment History Component
const PaymentHistoryItem = ({
  payment,
  formatCurrency,
  formatDate,
}: {
  payment: Payment;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}) => {
  const amount = Number(payment.amount) || 0;
  
  // ✅ Show download button ONLY for 'approved' status
  const showDownloadButton = payment.status === "approved";
  
  // Get status color and icon based on actual database status
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    
    // ✅ Only 'approved' shows as "Approved"
    if (normalizedStatus === 'approved') {
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2, label: 'Approved' };
    }
    // ✅ 'paid' shows as "Paid"
    if (normalizedStatus === 'paid') {
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2, label: 'Paid' };
    }
    if (normalizedStatus === 'pending') {
      return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: 'Pending' };
    }
    if (normalizedStatus === 'rejected') {
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle, label: 'Failed' };
    }
    return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: CreditCard, label: status || 'Unknown' };
  };
  
  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        {/* Left side - Icon and Details */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Payment Type Icon */}
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            payment.payment_type === "rent" ? "bg-blue-50" : "bg-amber-50"
          }`}>
            {payment.payment_type === "rent" ? (
              <Home className="h-4 w-4 text-blue-600" />
            ) : (
              <Shield className="h-4 w-4 text-amber-600" />
            )}
          </div>

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {payment.payment_type === "rent" ? "Rent Payment" : "Security Deposit"}
              </p>
              {payment.month && payment.year && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {payment.month} {payment.year}
                </span>
              )}
              {payment.remark && (
                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  • {payment.remark}
                </span>
              )}
            </div>
            
            {/* Date and Payment Mode */}
            <div className="flex items-center flex-wrap gap-2 text-[10px] text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="font-mono">{formatDate(payment.payment_date)}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                <span className="capitalize">{payment.payment_mode}</span>
              </div>
              {payment.transaction_id && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">
                    ID: {payment.transaction_id.substring(0, 8)}...
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Amount and Status */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">
              {formatCurrency(amount)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={`${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full`}>
              <StatusIcon className="h-2.5 w-2.5" />
              {statusConfig.label}
            </Badge>
            {/* ✅ Download button only for 'approved' status */}
            {showDownloadButton && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                onClick={() =>
                  window.open(
                    `/api/payments/receipts/${payment.id}/download`,
                    "_blank",
                  )
                }
                title="Download Receipt"
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TenantPaymentsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [paymentConfirmationData, setPaymentConfirmationData] =
    useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [shouldAutoOpenPayment, setShouldAutoOpenPayment] = useState(false);
  const [preSelectedPaymentType, setPreSelectedPaymentType] =
    useState<string>("rent");
  const [preSelectedAmount, setPreSelectedAmount] = useState<number | null>(
    null,
  );
   const [paymentIntentProcessed, setPaymentIntentProcessed] = useState(false);

  // Stats
  const [rentStats, setRentStats] = useState<RentStats>({
    totalPaid: 0,
    totalPending: 0,
    totalDiscount: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    monthsPaid: new Set(),
    monthsPending: new Set(),
  });

  const [depositStats, setDepositStats] = useState<DepositStats>({
    requiredAmount: 0,
    totalPaid: 0,
    totalPending: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    isFullyPaid: false,
  });

  // Dialog states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState<any>(null);
  const [selectedPaymentMonth, setSelectedPaymentMonth] = useState("");
  const [securityDepositInfo, setSecurityDepositInfo] = useState<any>(null);
  const [hasBedAssignment, setHasBedAssignment] = useState(false);
  const [tenantPayments, setTenantPayments] = useState<any[]>([]);
  const [loadingPaymentForm, setLoadingPaymentForm] = useState(false);
   const { on, connected } = useSocketIO();
  const [socketLastUpdate, setSocketLastUpdate] = useState<Date | null>(null);

  const [newPayment, setNewPayment] = useState({
    payment_type: "rent",
    amount: "",
    payment_mode: "online",
    transaction_id: "",
    payment_date: new Date().toISOString().split("T")[0],
    remark: "",
  });

  // Filters
  const [filterType, setFilterType] = useState<"all" | "rent" | "deposit">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "approved" | "pending" | "rejected"
  >("all");


  

  const formatCurrency = (amount: number) => {
    const validAmount =
      typeof amount === "number" && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(validAmount)
      .replace("₹", "₹");
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM");
    } catch {
      return dateString;
    }
  };

//  // Fetch demand details
// const fetchDemandDetails = async (demandId: number) => {
//   try {
//     console.log("Fetching demand details for ID:", demandId);
    
//     // Use the correct API endpoint
//     const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/demands/${demandId}`, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       credentials: 'include',
//     });
    
//     const result = await response.json();
//     console.log("API Response:", result);

//     if (result.success && result.data) {
//       const demand = result.data;
//       console.log("Demand fetched:", demand);
      
//       setPreSelectedPaymentType(demand.payment_type);
//       setPreSelectedAmount(demand.amount);
//       setShouldAutoOpenPayment(true);
      
//       setNewPayment((prev) => ({
//         ...prev,
//         amount: demand.amount.toString(),
//         payment_type: demand.payment_type,
//         remark: `Payment for demand request #${demand.id}: ${demand.description || ""}`,
//       }));
      
//       // Open the dialog after a short delay to ensure state is updated
//       setTimeout(() => {
//         setShowPaymentDialog(true);
//         toast.success("Payment request loaded. Please complete your payment.");
//       }, 100);
//     } else {
//       console.error("API returned error:", result);
//       toast.error(result.message || "Unable to load payment request details");
//     }
//   } catch (error) {
//     console.error("Error fetching demand details:", error);
//     toast.error("Unable to load payment request details. Please contact support.");
//   }
// };

useEffect(() => {
  const checkForPaymentIntent = async () => {
    // Don't process if already processed or still loading
    if (paymentIntentProcessed || loading) return;
    
    // Wait for hasBedAssignment to be set
    if (hasBedAssignment === undefined) return;
    
    setTimeout(async () => {
      // Check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      let demandId = urlParams.get("demand_id");
      const action = urlParams.get("action");
      const openPaymentFormParam = urlParams.get("openPaymentForm");
      
      console.log("Checking payment intent. hasBedAssignment:", hasBedAssignment, "demandId:", demandId, "openPaymentForm:", openPaymentFormParam);
      
      // Check localStorage for pending intent from ProtectedRoute (for demand payments)
      if (!demandId) {
        const pendingIntent = getAndClearPaymentIntent();
        if (pendingIntent) {
          console.log("Found pending intent in localStorage:", pendingIntent);
          if (pendingIntent.type === "demand" && pendingIntent.demandId) {
            demandId = pendingIntent.demandId.toString();
            action = "pay";
          } else if (pendingIntent.type === "open_payment") {
            // Handle open payment form intent
            if (hasBedAssignment) {
              setPaymentIntentProcessed(true);
              // Pre-fill with total pending amount
              if (paymentFormData?.total_pending > 0) {
                setNewPayment(prev => ({ 
                  ...prev, 
                  amount: paymentFormData.total_pending.toString(),
                  payment_type: "rent"
                }));
              }
              setShowPaymentDialog(true);
              toast.info("Please complete your payment");
              window.history.replaceState({}, '', window.location.pathname);
            } else {
              toast.error("Cannot make payment: No bed assigned yet");
            }
            return;
          }
        }
      }
      
      // Process demand payment (from demand email)
      if (demandId && action === "pay") {
        setPaymentIntentProcessed(true);
        console.log("Processing demand payment for ID:", demandId);
        
        try {
          // Fetch demand details from API
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/demands/${demandId}`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          
          const result = await response.json();
          console.log("Demand API response:", result);
          
          if (result.success && result.data) {
            const demand = result.data;
            console.log("Demand fetched:", demand);
            
            // Pre-fill the amount field with the demand amount
            setNewPayment(prev => ({
              ...prev,
              amount: demand.amount.toString(),
              payment_type: demand.payment_type,
              remark: `Payment for demand request #${demand.id}: ${demand.description || ""}`,
            }));
            
            // Open the payment dialog
            setShowPaymentDialog(true);
            toast.success(`Payment request of ₹${demand.amount.toLocaleString()} loaded. Please complete your payment.`);
          } else {
            toast.error(result.message || "Unable to load payment request details");
          }
        } catch (error) {
          console.error("Error fetching demand details:", error);
          toast.error("Unable to load payment request details. Please contact support.");
        } finally {
          // Clean URL after processing
          window.history.replaceState({}, '', window.location.pathname);
        }
        return;
      }
      
      // Process open payment form from URL param (for cron reminders)
      if (openPaymentFormParam === 'true' && hasBedAssignment) {
        setPaymentIntentProcessed(true);
        // Pre-fill with total pending amount
        if (paymentFormData?.total_pending > 0) {
          setNewPayment(prev => ({ 
            ...prev, 
            amount: paymentFormData.total_pending.toString(),
            payment_type: "rent"
          }));
          console.log("Pre-filled amount with total pending:", paymentFormData.total_pending);
        }
        setShowPaymentDialog(true);
        toast.info("Please complete your payment");
        window.history.replaceState({}, '', window.location.pathname);
      } else if (openPaymentFormParam === 'true' && !hasBedAssignment) {
        toast.error("Cannot make payment: No bed assigned yet");
      }
    }, 800);
  };
  
  checkForPaymentIntent();
}, [loading, hasBedAssignment, paymentIntentProcessed, paymentFormData]); // ✅ Add paymentFormData to dependencies
// Auto-open payment form when coming from portal page
// Auto-open payment form when coming from portal page
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const openPaymentFormParam = urlParams.get('openPaymentForm');
  
  if (openPaymentFormParam === 'true' && !paymentIntentProcessed && !loading && hasBedAssignment) {
    setPaymentIntentProcessed(true);
    setTimeout(() => {
      // ✅ ADD THIS: Pre-fill total pending amount
      if (paymentFormData?.total_pending > 0) {
        setNewPayment(prev => ({ 
          ...prev, 
          amount: paymentFormData.total_pending.toString(),
          payment_type: "rent"
        }));
        console.log("Pre-filled amount with total pending:", paymentFormData.total_pending);
      }
      
      setShowPaymentDialog(true);
      window.history.replaceState({}, '', window.location.pathname);
    }, 200);
  }
}, [loading, hasBedAssignment, paymentIntentProcessed, paymentFormData]); // ✅ Add paymentFormData to dependencies

//   // Auto-open payment form when coming from portal page
// useEffect(() => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const openPaymentForm = urlParams.get('openPaymentForm');
  
//   if (openPaymentForm === 'true') {
//     // Small delay to ensure component is fully loaded
//     const timer = setTimeout(() => {
//       if (hasBedAssignment) {
//         setShowPaymentDialog(true);
//         // Remove the query param from URL without reloading
//         const newUrl = window.location.pathname;
//         window.history.replaceState({}, '', newUrl);
//       } else {
//         toast.error(
//           "You cannot make a payment as no bed has been assigned to you yet. Please contact the property manager."
//         );
//       }
//     }, 500);
//     return () => clearTimeout(timer);
//   }
// }, [hasBedAssignment]);

//   // Fetch demand details from URL
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const demandId = urlParams.get("demand_id");
//     const action = urlParams.get("action");

//     if (demandId && action === "pay") {
//       fetchDemandDetails(parseInt(demandId));
//     }
//   }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const tenantId = getTenantId();

      if (!tenantId) {
        navigate("/login");
        return;
      }

      const profileRes = await tenantDetailsApi.loadProfile();
      if (profileRes.success) {
        const tenantData = profileRes.data;
        setTenant(tenantData);

        if (tenantData.room_number && tenantData.bed_number) {
          setHasBedAssignment(true);
        } else {
          setHasBedAssignment(false);
        }
      }

      const paymentsRes = await paymentApi.getPaymentsByTenant(tenantId);
      if (paymentsRes.success) {
        const paymentData = paymentsRes.data || [];
        const formattedPayments = paymentData.map((payment: any) => ({
          ...payment,
          amount: Number(payment.amount) || 0,
          discount_amount: Number(payment.discount_amount) || 0,
          total_amount: Number(payment.total_amount) || 0,
        }));

        // ✅ Move the console.log INSIDE this block
        const totalRentAmount = formattedPayments
          .filter((p) => p.payment_type === "rent")
          .reduce((sum: any, p: any) => sum + p.amount, 0);
        const totalDepositAmount = formattedPayments
          .filter((p) => p.payment_type === "security_deposit")
          .reduce((sum: any, p: any) => sum + p.amount, 0);

        // console.log('=== Payment Summary ===');
        // console.log(`Total Rent Payments: ₹${totalRentAmount}`);
        // console.log(`Total Deposit Payments: ₹${totalDepositAmount}`);
        // console.log(`Number of Rent Payments: ${formattedPayments.filter(p => p.payment_type === 'rent').length}`);
        // console.log('======================');

        setPayments(formattedPayments);
        calculateStats(formattedPayments);
      }

      const formDataRes = await paymentApi.getTenantPaymentFormData(tenantId);
      if (formDataRes.success) {
        setPaymentFormData(formDataRes.data);
      }

      const depositRes = await paymentApi.getSecurityDepositInfo(tenantId);
      if (depositRes.success) {
        setSecurityDepositInfo(depositRes.data);
        // Update deposit stats based on fetched data
        updateDepositStatsFromInfo(depositRes.data);

        // ✅ Also update deposit stats directly if payments didn't capture it
        if (depositRes.data.paid_amount > 0) {
          setDepositStats((prev) => ({
            ...prev,
            totalPaid: depositRes.data.paid_amount,
            totalPending: depositRes.data.pending_amount,
            requiredAmount: depositRes.data.security_deposit,
            isFullyPaid: depositRes.data.pending_amount === 0,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  

  // Update deposit stats from security deposit info
  const updateDepositStatsFromInfo = (depositInfo: any) => {
    if (depositInfo) {
      const totalPaid = depositInfo.paid_amount || 0;
      const requiredAmount = depositInfo.security_deposit || 0;
      const pendingAmount = depositInfo.pending_amount || 0;

      setDepositStats({
        requiredAmount: requiredAmount,
        totalPaid: totalPaid,
        totalPending: pendingAmount,
        approvedCount: totalPaid > 0 ? 1 : 0,
        pendingCount: pendingAmount > 0 ? 1 : 0,
        rejectedCount: 0,
        isFullyPaid: pendingAmount === 0 && requiredAmount > 0,
      });
    }
  };

useEffect(() => {
  if (showPaymentDialog) {
    // ✅ Pre-fill total pending amount when dialog opens
    if (newPayment.payment_type === "rent" && paymentFormData?.total_pending > 0) {
      setNewPayment(prev => ({
        ...prev,
        amount: paymentFormData.total_pending.toString(),
      }));
    } else if (newPayment.payment_type === "security_deposit" && securityDepositInfo?.pending_amount > 0) {
      setNewPayment(prev => ({
        ...prev,
        amount: securityDepositInfo.pending_amount.toString(),
      }));
    } else if (preSelectedAmount && preSelectedPaymentType) {
      setNewPayment((prev) => ({
        ...prev,
        amount: preSelectedAmount?.toString() || "",
        payment_type: preSelectedPaymentType,
      }));
      setPreSelectedAmount(null);
      setPreSelectedPaymentType("rent");
    }
  }
}, [showPaymentDialog, paymentFormData, securityDepositInfo, preSelectedAmount, preSelectedPaymentType]);

const calculateStats = (payments: Payment[]) => {
  let rentTotalPaid = 0;
  let rentTotalPending = 0;
  let rentTotalDiscount = 0;
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

  const rentPaymentsByMonth = new Map<string, number>();
  const rentApprovedMonths = new Set<string>();
  const rentPendingMonthsSet = new Set<string>();

  payments.forEach((payment) => {
    const amount = Number(payment.amount);
    if (isNaN(amount) || amount === 0) return;

    // ✅ Both 'approved' and 'paid' are successful payments
    const isPaymentSuccessful = payment.status === "approved" || payment.status === "paid";
    const isPaymentPending = payment.status === "pending";
    const isPaymentRejected = payment.status === "rejected";

    if (payment.payment_type === "rent") {
      const monthKey = `${payment.month || "Unknown"}-${payment.year || "Unknown"}`;
      
      const currentMonthTotal = rentPaymentsByMonth.get(monthKey) || 0;
      rentPaymentsByMonth.set(monthKey, currentMonthTotal + amount);

      if (isPaymentSuccessful) {
        rentApprovedMonths.add(monthKey);
        rentApprovedCount++;
        rentTotalPaid += amount;
      } else if (isPaymentPending) {
        rentPendingMonthsSet.add(monthKey);
        rentPendingCount++;
        rentTotalPending += amount;
      } else if (isPaymentRejected) {
        rentRejectedCount++;
      }

      if (payment.discount_amount) {
        rentTotalDiscount += Number(payment.discount_amount);
      }
    } else if (payment.payment_type === "security_deposit") {
      if (isPaymentSuccessful) {
        depositTotalPaid += amount;
        depositApprovedCount++;
        if (amount > depositRequiredAmount) {
          depositRequiredAmount = amount;
        }
      } else if (isPaymentPending) {
        depositTotalPending += amount;
        depositPendingCount++;
      } else if (isPaymentRejected) {
        depositRejectedCount++;
      }
    }
  });

  rentApprovedMonths.forEach(month => monthsPaid.add(month));
  
  rentPendingMonthsSet.forEach(month => {
    if (!monthsPaid.has(month)) {
      monthsPending.add(month);
    }
  });

  if (securityDepositInfo) {
    depositRequiredAmount = securityDepositInfo.security_deposit || 0;
    if (depositTotalPaid === 0 && securityDepositInfo.paid_amount > 0) {
      depositTotalPaid = securityDepositInfo.paid_amount || 0;
    }
    if (depositTotalPending === 0 && securityDepositInfo.pending_amount > 0) {
      depositTotalPending = securityDepositInfo.pending_amount || 0;
    }
  }

  setRentStats({
    totalPaid: rentTotalPaid,
    totalPending: rentTotalPending,
    totalDiscount: rentTotalDiscount,
    approvedCount: rentApprovedCount,
    pendingCount: rentPendingCount,
    rejectedCount: rentRejectedCount,
    monthsPaid,
    monthsPending,
  });

  setDepositStats({
    requiredAmount: depositRequiredAmount,
    totalPaid: depositTotalPaid,
    totalPending: depositTotalPending,
    approvedCount: depositApprovedCount,
    pendingCount: depositPendingCount,
    rejectedCount: depositRejectedCount,
    isFullyPaid: depositTotalPaid >= depositRequiredAmount && depositRequiredAmount > 0,
  });
};

  // Recalculate stats when paymentFormData changes (more accurate for pending amounts)
  useEffect(() => {
    if (paymentFormData && payments.length > 0) {
      // Recalculate with latest paymentFormData
      const rentPaid = paymentFormData.total_paid || 0;
      const rentPending = paymentFormData.total_pending || 0;

      setRentStats((prev) => ({
        ...prev,
        totalPaid: rentPaid,
        totalPending: rentPending,
      }));
    }
  }, [paymentFormData]);

  const fetchTenantPayments = useCallback(async () => {
    if (!tenant?.id) return;
    try {
      const response = await paymentApi.getPaymentsByTenant(tenant.id);
      if (response.success) {
        setTenantPayments(response.data || []);
        calculateStats(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching tenant payments:", error);
    }
  }, [tenant?.id]);

  useEffect(() => {
  const joinTenantRoom = async () => {
    const tenantId = getTenantId();
    if (tenantId && connected) {
      // Emit event to join tenant's room
      const socket = (window as any).socket;
      if (socket) {
        socket.emit('join_tenant_room', tenantId);
      }
    }
  };
  
  joinTenantRoom();
}, [connected, tenant?.id]);

// Socket.IO listener for real-time payment updates
useEffect(() => {
  if (!connected) return;

  // Listen for payment status updates (approved/rejected)
  const unsubscribePaymentUpdate = on('payment_updated', (data) => {
    
    // Show toast notification
    if (data.status === 'approved') {
      toast.success(`✅ Your payment of ₹${data.amount?.toLocaleString()} has been approved!`, {
        duration: 5000,
      });
    } else if (data.status === 'rejected') {
      toast.error(`❌ Your payment of ₹${data.amount?.toLocaleString()} was rejected.`, {
        duration: 5000,
      });
    }
    
    // ✅ Force immediate refresh of all data
    fetchData();
    fetchTenantPayments();
    setSocketLastUpdate(new Date());
  });

  // Listen for new payment confirmation (when payment is successful)
  const unsubscribeNewPayment = on('new_payment', (data) => {
    console.log('New payment confirmed via Socket.IO:', data);
    
    // Only show notification if this payment belongs to current tenant
    if (data.tenant_id === tenant?.id) {
      toast.success(`💰 Payment of ₹${data.amount?.toLocaleString()} successful!`, {
        duration: 5000,
      });
      
      // ✅ Force immediate refresh of all data (don't wait for timeout)
      fetchData();
      fetchTenantPayments();
      setSocketLastUpdate(new Date());
    }
  });

  // Listen for payment pending (when payment is initiated)
  const unsubscribePaymentPending = on('payment_pending', (data) => {
    console.log('Payment pending via Socket.IO:', data);
    
    if (data.tenant_id === tenant?.id) {
      toast.info(`⏳ Payment of ₹${data.amount?.toLocaleString()} initiated - processing...`, {
        duration: 3000,
      });
      
      // ✅ Immediately fetch to show pending payment
      fetchData();
      fetchTenantPayments();
    }
  });

  const unsubscribePaymentFailed = on('payment_failed', (data) => {
  console.log('Payment failed via Socket.IO:', data);
  
  if (data.tenant_id === tenant?.id) {
    toast.error(`❌ Payment of ₹${data.amount?.toLocaleString()} failed. Reason: ${data.reason || 'Payment failed'}`, {
      duration: 6000,
    });
    
    // Force refresh to show failed payment
    fetchData();
    fetchTenantPayments();
    setSocketLastUpdate(new Date());
  }
});

  return () => {
    unsubscribePaymentUpdate();
    unsubscribeNewPayment();
    unsubscribePaymentPending();
    unsubscribePaymentFailed();
  };
}, [connected, on, tenant?.id, fetchData, fetchTenantPayments]);

  const fetchSecurityDepositInfo = useCallback(async () => {
    if (!tenant?.id) return;
    try {
      const response = await paymentApi.getSecurityDepositInfo(tenant.id);
      if (response.success) {
        setSecurityDepositInfo(response.data);
        updateDepositStatsFromInfo(response.data);
        if (response.data && response.data.pending_amount > 0) {
          setNewPayment((prev) => ({
            ...prev,
            amount: response.data.pending_amount.toString(),
          }));
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
      await fetchSecurityDepositInfo();
    } catch (error) {
      console.error("Error fetching payment form data:", error);
    } finally {
      setLoadingPaymentForm(false);
    }
  }, [tenant?.id, fetchSecurityDepositInfo]);

  const handlePaymentTypeChange = async (type: string) => {
    setNewPayment((prev) => ({ ...prev, payment_type: type }));
    setSelectedPaymentMonth("");

    if (type === "rent") {
      setSecurityDepositInfo(null);
      await fetchPaymentFormData();
       // ✅ Auto-fill with TOTAL pending amount (not just first month)
    if (paymentFormData?.total_pending > 0) {
      setNewPayment((prev) => ({
        ...prev,
        amount: paymentFormData.total_pending.toString(),
      }));
    } else if (!preSelectedAmount) {
      setNewPayment((prev) => ({ ...prev, amount: "" }));
    }
    } else if (type === "security_deposit") {
      setPaymentFormData(null);
      await fetchSecurityDepositInfo();
      // ✅ Auto-fill with security deposit pending amount
    if (securityDepositInfo?.pending_amount > 0) {
      setNewPayment((prev) => ({
        ...prev,
        amount: securityDepositInfo.pending_amount.toString(),
      }));
    }
    }
  };

const handleRazorpayPayment = useCallback(
  async (amount: number, paymentData: any) => {
    try {
      setLoading(true);
      
      // ✅ Close the payment dialog first
      setShowPaymentDialog(false);
      
      // Small delay to allow dialog to close
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Show loading toast
      const loadingToastId = toast.loading("Preparing payment...", { id: "razorpay-loading" });

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
        toast.dismiss(loadingToastId);
        toast.error("Failed to load payment gateway. Please refresh and try again.");
        setLoading(false);
        return false;
      }

      console.log("📤 Sending to create-order:", {
        amount,
        tenant_id: paymentData.tenant_id,
        payment_type: paymentData.payment_type,
        month: paymentData.month,
        year: paymentData.year,
        remark: paymentData.remark
      });

      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount,
          tenant_id: paymentData.tenant_id,
          payment_type: paymentData.payment_type,
          month: paymentData.month,
          year: paymentData.year,
          remark: paymentData.remark
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        toast.dismiss(loadingToastId);
        toast.error(orderResult.message || "Failed to create payment order");
        setLoading(false);
        return false;
      }

      // Dismiss loading toast before opening Razorpay
      toast.dismiss(loadingToastId);

      const options = {
        key: orderResult.key,
        amount: orderResult.order.amount,
        currency: "INR",
        name: "ROOMAC",
        description: `Payment for ${paymentData.payment_type === "rent" ? "Rent" : "Security Deposit"}`,
        order_id: orderResult.order.id,
        handler: async function (response: any) {
          console.log("💰 Razorpay success callback triggered", response);
          
          try {
            // Show success UI immediately
            setPaymentConfirmationData({
              id: orderResult.payment_id,
              payment_type: paymentData.payment_type,
              amount: paymentData.amount,
              month: paymentData.month,
              year: paymentData.year,
              transaction_id: response.razorpay_payment_id,
            });
            setShowPaymentConfirmation(true);
            
            // Reset form
            setNewPayment({
              payment_type: "rent",
              amount: "",
              payment_mode: "online",
              transaction_id: "",
              payment_date: new Date().toISOString().split("T")[0],
              remark: "",
            });
            setSelectedPaymentMonth("");
            setSecurityDepositInfo(null);
            setPaymentFormData(null);
            
            toast.success("Payment successful! Your payment is being processed.", {
              duration: 4000,
            });
            
          } catch (error) {
            console.error("Error in payment handler:", error);
            toast.error("Payment successful but verification pending");
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
          ondismiss: function () {
            console.log("Razorpay modal closed by user");
            toast.dismiss("razorpay-loading");
            toast.dismiss("payment-processing");
            toast.info("Payment cancelled", { duration: 3000 });
            setLoading(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      return true;
    } catch (error: any) {
      console.error("Razorpay error:", error);
      toast.dismiss("razorpay-loading");
      toast.dismiss("payment-processing");
      toast.error(error.message || "Payment failed");
      setLoading(false);
      return false;
    }
  },
  [tenant, fetchTenantPayments, fetchData],
);

const handleSubmitPayment = useCallback(async () => {
  if (!newPayment.amount) {
    toast.error("Please enter an amount");
    return;
  }

  if (!hasBedAssignment) {
    toast.error("You cannot make a payment as no bed has been assigned to you yet");
    return;
  }

  try {
    const currentDate = new Date();
    const paymentData: any = {
      tenant_id: tenant?.id,
      payment_type: newPayment.payment_type,
      amount: parseFloat(newPayment.amount),
      remark: newPayment.remark || null,
      payment_date: newPayment.payment_date,
    };

    // Always send current month and year for rent payments
    if (newPayment.payment_type === "rent") {
      paymentData.month = currentDate.toLocaleString("default", { month: "long" });
      paymentData.year = currentDate.getFullYear();
      paymentData.remark = paymentData.remark || `Rent payment for ${paymentData.month} ${paymentData.year}`;
    }

    // The handleRazorpayPayment will close the dialog
    await handleRazorpayPayment(parseFloat(newPayment.amount), paymentData);
  } catch (error: any) {
    console.error("Payment error:", error);
    toast.error(error.message || "Failed to initiate payment");
  }
}, [tenant?.id, newPayment, hasBedAssignment, handleRazorpayPayment]);

  useEffect(() => {
    if (showPaymentConfirmation) {
      const timer = setTimeout(() => {
        setShowPaymentConfirmation(false);
        setPaymentConfirmationData(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPaymentConfirmation]);

  const filteredPayments = payments.filter((payment) => {
    if (filterType !== "all" && payment.payment_type !== filterType)
      return false;
    if (filterStatus !== "all" && payment.status !== filterStatus) return false;
    return true;
  });

  // Calculate progress percentage for display
  const rentProgress =
    rentStats.monthsPaid.size > 0 || rentStats.monthsPending.size > 0
      ? (rentStats.monthsPaid.size /
          (rentStats.monthsPaid.size + rentStats.monthsPending.size)) *
        100
      : 0;

  const depositProgress =
    depositStats.requiredAmount > 0
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
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 bg-slate-200 animate-pulse rounded-lg"
              ></div>
            ))}
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

  // Auto-close after countdown
  useEffect(() => {
    if (countdown === 0 && isOpen) {
      onClose();
    }
  }, [countdown, isOpen, onClose]);

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
                  #{String(paymentDetails.id || "").slice(-8) || "N/A"}
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
                  <span className="text-xs text-gray-600">
                    Transaction ID:
                  </span>
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
    <div className="bg-slate-50">
      <div className="max-w-7xl mx-auto p-3 space-y-3">
        {/* Compact Stats Grid - Now showing correct values */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatCard
            title="Total Paid"
            value={formatCurrency(rentStats.totalPaid + depositStats.totalPaid)}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Pending"
            value={formatCurrency(
              rentStats.totalPending + depositStats.totalPending,
            )}
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

{/* Combined Payment Summary - Rent + Deposit in One Table with Pay Now buttons */}
<Card className="border border-slate-200 shadow-sm overflow-hidden">
  <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-3 py-2">
    <div className="flex items-center justify-between">
      <h3 className="text-white text-xs font-medium flex items-center gap-1">
        <Wallet className="h-3 w-3" />
        Payment Summary
      </h3>
      <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
        {paymentFormData?.month_wise_history?.length || 0} months
      </Badge>
    </div>
  </div>
  <CardContent className="p-3">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-2 text-xs font-medium text-slate-600">Category</th>
            <th className="text-right p-2 text-xs font-medium text-slate-600">Total Required</th>
            <th className="text-right p-2 text-xs font-medium text-slate-600">Paid</th>
            <th className="text-right p-2 text-xs font-medium text-slate-600">Pending</th>
            <th className="text-center p-2 text-xs font-medium text-slate-600">Status</th>
            <th className="text-center p-2 text-xs font-medium text-slate-600">Action</th>
          </tr>
        </thead>
        <tbody>
          {/* Rent Row */}
          <tr className="border-t border-slate-200">
            <td className="p-2 text-sm font-medium">
              <div className="flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5 text-blue-600" />
                <span>Rent</span>
              </div>
             </td>
            <td className="p-2 text-right font-medium">
              ₹{(paymentFormData?.total_expected || rentStats.totalPaid + rentStats.totalPending).toLocaleString()}
             </td>
            <td className="p-2 text-right text-green-600 font-medium">
              ₹{(paymentFormData?.total_paid || rentStats.totalPaid).toLocaleString()}
             </td>
            <td className="p-2 text-right font-medium">
              <span className="text-amber-600">
                ₹{(paymentFormData?.total_pending || rentStats.totalPending).toLocaleString()}
              </span>
             </td>
            <td className="p-2 text-center">
              {(paymentFormData?.total_pending || rentStats.totalPending) === 0 ? (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-2 py-0.5">
                  Fully Paid
                </Badge>
              ) : (paymentFormData?.total_paid || rentStats.totalPaid) > 0 ? (
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] px-2 py-0.5">
                  Partial
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-2 py-0.5">
                  Not Paid
                </Badge>
              )}
             </td>
            <td className="p-2 text-center">
              {/* Rent Row - Pay Now button */}
{/* Rent Row - Pay Now button */}
{(paymentFormData?.total_pending || rentStats.totalPending) > 0 && (
  <Button
    size="sm"
    className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px]"
    onClick={() => {
      if (!hasBedAssignment) {
        toast.error("Cannot make payment: No bed assigned yet");
        return;
      }
      
      // ✅ Pre-fill with TOTAL pending amount instead of just oldest month
      if (paymentFormData?.total_pending > 0) {
        setNewPayment(prev => ({ 
          ...prev, 
          payment_type: "rent",
          amount: paymentFormData.total_pending.toString(),
          remark: `Payment for pending rent of ₹${paymentFormData.total_pending.toLocaleString()}`
        }));
      } else if (rentStats.totalPending > 0) {
        setNewPayment(prev => ({ 
          ...prev, 
          payment_type: "rent",
          amount: rentStats.totalPending.toString(),
          remark: `Payment for pending rent of ₹${rentStats.totalPending.toLocaleString()}`
        }));
      }
      
      setShowPaymentDialog(true);
    }}
  >
    <CreditCard className="h-3 w-3 mr-1" />
    Pay Now
  </Button>
)}
              {(paymentFormData?.total_pending || rentStats.totalPending) === 0 && (
                <Badge className="bg-green-100 text-green-700 text-[9px] px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 inline mr-1" />
                  No Due
                </Badge>
              )}
             </td>
          </tr>

          {/* Security Deposit Row - Only show if deposit exists */}
          {(depositStats.requiredAmount > 0 || depositStats.totalPaid > 0 || depositStats.totalPending > 0) && (
            <tr className="border-t border-slate-200 bg-amber-50/30">
              <td className="p-2 text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-amber-600" />
                  <span>Security Deposit</span>
                </div>
               </td>
              <td className="p-2 text-right font-medium">
                ₹{(depositStats.requiredAmount || securityDepositInfo?.security_deposit || 0).toLocaleString()}
               </td>
              <td className="p-2 text-right text-green-600 font-medium">
                ₹{(depositStats.totalPaid || securityDepositInfo?.paid_amount || 0).toLocaleString()}
               </td>
              <td className="p-2 text-right font-medium">
                <span className="text-amber-600">
                  ₹{(depositStats.totalPending || securityDepositInfo?.pending_amount || 0).toLocaleString()}
                </span>
               </td>
              <td className="p-2 text-center">
                {depositStats.isFullyPaid || securityDepositInfo?.is_fully_paid ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-2 py-0.5">
                    Fully Paid
                  </Badge>
                ) : (depositStats.totalPaid > 0 || securityDepositInfo?.paid_amount > 0) ? (
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] px-2 py-0.5">
                    Partial
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-2 py-0.5">
                    Not Paid
                  </Badge>
                )}
               </td>
              <td className="p-2 text-center">
                {(depositStats.totalPending || securityDepositInfo?.pending_amount || 0) > 0 && (
                  <Button
                    size="sm"
                    className="h-7 px-3 bg-amber-600 hover:bg-amber-700 text-white text-[10px]"
                    onClick={() => {
                      if (!hasBedAssignment) {
                        toast.error("Cannot make payment: No bed assigned yet");
                        return;
                      }
                      handlePaymentTypeChange("security_deposit");
                      setShowPaymentDialog(true);
                    }}
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    Pay Now
                  </Button>
                )}
                {(depositStats.totalPending || securityDepositInfo?.pending_amount || 0) === 0 && (depositStats.requiredAmount > 0 || securityDepositInfo?.security_deposit > 0) && (
                  <Badge className="bg-green-100 text-green-700 text-[9px] px-2 py-1">
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                    Fully Paid
                  </Badge>
                )}
                {depositStats.requiredAmount === 0 && !securityDepositInfo?.security_deposit && (
                  <Badge className="bg-gray-100 text-gray-500 text-[9px] px-2 py-1">
                    N/A
                  </Badge>
                )}
               </td>
            </tr>
          )}

          {/* Total Row */}
          <tr className="border-t-2 border-slate-300 bg-slate-100">
            <td className="p-2 text-sm font-bold">Total</td>
            <td className="p-2 text-right font-bold">
              ₹{(
                (paymentFormData?.total_expected || rentStats.totalPaid + rentStats.totalPending) +
                (depositStats.requiredAmount || securityDepositInfo?.security_deposit || 0)
              ).toLocaleString()}
              </td>
            <td className="p-2 text-right font-bold text-green-700">
              ₹{(
                (paymentFormData?.total_paid || rentStats.totalPaid) +
                (depositStats.totalPaid || securityDepositInfo?.paid_amount || 0)
              ).toLocaleString()}
              </td>
            <td className="p-2 text-right font-bold text-amber-700">
              ₹{(
                (paymentFormData?.total_pending || rentStats.totalPending) +
                (depositStats.totalPending || securityDepositInfo?.pending_amount || 0)
              ).toLocaleString()}
              </td>
            <td className="p-2 text-center">
              <Badge className={`text-[10px] px-2 py-0.5 ${
                ((paymentFormData?.total_pending || rentStats.totalPending) + 
                 (depositStats.totalPending || securityDepositInfo?.pending_amount || 0)) === 0
                  ? "bg-green-100 text-green-700 border-green-200"
                  : ((paymentFormData?.total_paid || rentStats.totalPaid) + 
                     (depositStats.totalPaid || securityDepositInfo?.paid_amount || 0)) > 0
                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                  : "bg-red-100 text-red-700 border-red-200"
              }`}>
                {((paymentFormData?.total_pending || rentStats.totalPending) + 
                  (depositStats.totalPending || securityDepositInfo?.pending_amount || 0)) === 0
                  ? "All Paid"
                  : ((paymentFormData?.total_paid || rentStats.totalPaid) + 
                     (depositStats.totalPaid || securityDepositInfo?.paid_amount || 0)) > 0
                  ? "Partial"
                  : "Not Paid"}
              </Badge>
              </td>
            <td className="p-2 text-center"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>

{/* Monthly Rent Details - Collapsible */}
{paymentFormData?.month_wise_history && paymentFormData.month_wise_history.length > 0 && (
  <details className="mt-3 px-1" open>
    <summary className="text-xs font-medium text-slate-500 cursor-pointer hover:text-blue-600 list-none flex items-center gap-2">
      <ChevronDown className="h-3 w-3 inline" />
      View monthly rent breakdown
    </summary>
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-2 text-[10px] font-medium text-slate-500">Month</th>
            <th className="text-right p-2 text-[10px] font-medium text-slate-500">Rent</th>
            <th className="text-right p-2 text-[10px] font-medium text-slate-500">Paid</th>
            <th className="text-right p-2 text-[10px] font-medium text-slate-500">Pending</th>
            <th className="text-center p-2 text-[10px] font-medium text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {paymentFormData.month_wise_history.map((month: any, idx: number) => (
            <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50/50">
              <td className="p-2 text-[11px] font-medium">{month.month} {month.year}</td>
              <td className="p-2 text-right text-[11px]">₹{month.rent?.toLocaleString()}</td>
              <td className="p-2 text-right text-[11px] text-green-600">₹{month.paid?.toLocaleString()}</td>
              <td className="p-2 text-right text-[11px] text-amber-600">₹{month.pending?.toLocaleString()}</td>
              <td className="p-2 text-center">
                <Badge className={`text-[9px] px-2 py-0 ${
                  month.status === "paid" ? "bg-green-100 text-green-700" :
                  month.status === "partial" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {month.status === "paid" ? "Paid" : month.status === "partial" ? "Partial" : "Pending"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
)}

{/* Payment History - Professional */}
<Card className="border border-slate-200 shadow-sm overflow-hidden">
  <div className="bg-gradient-to-r from-slate-100 to-white px-4 py-3 border-b border-slate-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <CreditCard className="h-3.5 w-3.5 text-blue-600" />
        </div>
        <h3 className="text-xs font-semibold text-slate-700">Payment History</h3>
        <Badge className="bg-blue-50 text-blue-700 text-[9px] px-1.5 py-0">
          {filteredPayments.length} transactions
        </Badge>
      </div>
      <div className="flex items-center gap-1.5">
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="w-[70px] h-7 text-[10px] px-2 border-slate-200">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All</SelectItem>
            <SelectItem value="rent" className="text-xs">Rent</SelectItem>
            <SelectItem value="deposit" className="text-xs">Deposit</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
  <SelectTrigger className="w-[75px] h-7 text-[10px] px-2 border-slate-200">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all" className="text-xs">All</SelectItem>
    <SelectItem value="approved" className="text-xs">Approved</SelectItem>
    <SelectItem value="paid" className="text-xs">Paid</SelectItem>
    <SelectItem value="pending" className="text-xs">Pending</SelectItem>
    <SelectItem value="rejected" className="text-xs">Failed</SelectItem>
  </SelectContent>
</Select>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600"
          onClick={fetchData}
          title="Refresh"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  </div>
  <CardContent className="p-4">
    {filteredPayments.length === 0 ? (
      <div className="text-center py-8">
        <div className="inline-flex p-3 bg-slate-100 rounded-full mb-3">
          <CreditCard className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-700">No payments found</p>
        <p className="text-xs text-slate-400 mt-1">Your payment history will appear here</p>
      </div>
    ) : (
      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
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

{/* Payment Dialog - Simplified & Compact */}
<Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
  <DialogContent className="max-w-md w-[95vw] max-h-[85vh] p-0 gap-0 rounded-xl">
    {/* Header - Compact */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-lg">
      <div className="flex items-center justify-between">
        <div>
          <DialogTitle className="text-white text-sm font-semibold flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Make a Payment
          </DialogTitle>
          <DialogDescription className="text-blue-100 text-xs mt-0.5">
            Complete your payment securely
          </DialogDescription>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-7 w-7">
            <X className="h-3.5 w-3.5" />
          </Button>
        </DialogClose>
      </div>
    </div>

    {/* Form Content - Compact */}
    <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
      
      {/* Payment Type Selector - Toggle style */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handlePaymentTypeChange("rent")}
          className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${
            newPayment.payment_type === "rent"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Home className="h-4 w-4" />
          Rent
        </button>
        <button
          type="button"
          onClick={() => handlePaymentTypeChange("security_deposit")}
          className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${
            newPayment.payment_type === "security_deposit"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Shield className="h-4 w-4" />
          Deposit
        </button>
      </div>

      {/* Accommodation Details - Only for Rent */}
      {newPayment.payment_type === "rent" && tenant && (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Bed className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">Your Stay</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-slate-500">Property</p>
              <p className="font-medium text-slate-800 truncate">{tenant?.property_name || "Roomac"}</p>
            </div>
            <div>
              <p className="text-slate-500">Room/Bed</p>
              <p className="font-medium text-slate-800">
                {tenant?.room_number || "N/A"} • Bed {tenant?.bed_number || "N/A"}
              </p>
            </div>
            <div className="col-span-1">
              <p className="text-slate-500">Monthly Rent</p>
              <p className="font-bold text-green-600">₹{Number(tenant?.tenant_rent || tenant?.monthly_rent || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

    

      {/* Pending Months Summary (Optional - shows what will be paid) */}
      {newPayment.payment_type === "rent" && paymentFormData?.unpaid_months && paymentFormData.unpaid_months.length > 0 && (
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <p className="text-xs font-semibold text-amber-800 mb-2">Pending Months:</p>
          <div className="space-y-1">
            {paymentFormData.unpaid_months
              .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month_num - b.month_num;
              })
              .slice(0, 3)
              .map((month, idx) => (
                <div key={month.month_key} className="flex justify-between items-center text-xs">
                  <span className="font-medium">
                    {idx === 0 && "👉 "}{month.month} {month.year}
                    {idx === 0 && <span className="ml-2 text-[10px] text-amber-600">(Will be paid first)</span>}
                  </span>
                  <span className="font-semibold text-amber-700">₹{month.pending.toLocaleString()}</span>
                </div>
              ))}
            {paymentFormData.unpaid_months.length > 3 && (
              <p className="text-[10px] text-amber-600 text-center pt-1">
                +{paymentFormData.unpaid_months.length - 3} more months
              </p>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-amber-200 flex justify-between text-xs font-bold">
            <span>Total Pending:</span>
            <span className="text-amber-700">₹{paymentFormData.total_pending?.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Security Deposit Info - Only for Deposit */}
      {newPayment.payment_type === "security_deposit" && securityDepositInfo && (
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700">Security Deposit</span>
            {securityDepositInfo.is_fully_paid && (
              <Badge className="bg-green-100 text-green-700 text-[9px]">Fully Paid ✓</Badge>
            )}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Required:</span>
              <span className="font-semibold">₹{securityDepositInfo.security_deposit?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Already Paid:</span>
              <span className="font-semibold text-green-600">₹{securityDepositInfo.paid_amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Pending:</span>
              <span className="font-semibold text-amber-600">₹{securityDepositInfo.pending_amount?.toLocaleString()}</span>
            </div>
            {!securityDepositInfo.is_fully_paid && (
              <div className="mt-2 pt-2 border-t border-amber-200">
                <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-600 rounded-full"
                    style={{ width: `${(securityDepositInfo.paid_amount / securityDepositInfo.security_deposit) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-700">
          Amount <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
          <Input
            type="text"
            placeholder="0"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
            className="pl-8 h-10 text-base font-medium"
          />
        </div>
        {/* {newPayment.payment_type === "rent" && paymentFormData?.total_pending > 0 && (
          <button
            type="button"
            onClick={() => setNewPayment(prev => ({ ...prev, amount: paymentFormData.total_pending.toString() }))}
            className="text-[10px] text-blue-600 hover:underline"
          >
            Pay full pending amount (₹{paymentFormData.total_pending.toLocaleString()})
          </button>
        )} */}
      </div>

      {/* Remark - Optional */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-700">Remark (Optional)</Label>
        <Input
          placeholder="Add a note (optional)"
          value={newPayment.remark || ""}
          onChange={(e) => setNewPayment({ ...newPayment, remark: e.target.value })}
          className="h-9 text-sm"
        />
      </div>
    </div>

    {/* Footer - Buttons */}
    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 rounded-b-lg">
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setShowPaymentDialog(false);
            setNewPayment({
              amount: "",
              payment_type: "rent",
              payment_mode: "online",
              transaction_id: "",
              payment_date: new Date().toISOString().split("T")[0],
              remark: "",
            });
          }}
          className="flex-1 text-sm h-10"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmitPayment}
          disabled={!newPayment.amount || parseFloat(newPayment.amount) <= 0 || !hasBedAssignment}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm h-10"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Pay ₹{newPayment.amount ? parseFloat(newPayment.amount).toLocaleString() : "0"}
        </Button>
      </div>
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