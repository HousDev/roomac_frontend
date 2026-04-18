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

// Bank Name Type
interface BankName {
  id: number;
  name: string;
}

// Compact Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<
    string,
    { className: string; icon: any; label: string }
  > = {
    approved: {
      className: "bg-green-50 text-green-600 border-green-200",
      icon: CheckCircle2,
      label: "Paid",
    },
    pending: {
      className: "bg-[#fff9e6] text-[#ffc107] border-[#ffc107]/20",
      icon: Clock,
      label: "Pending",
    },
    rejected: {
      className: "bg-red-50 text-red-600 border-red-200",
      icon: XCircle,
      label: "Failed",
    },
  };

  const config = variants[status] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full`}
    >
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
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            className={`p-1.5 rounded-lg flex-shrink-0 ${
              payment.payment_type === "rent" ? "bg-[#e6f0ff]" : "bg-[#fff9e6]"
            }`}
          >
            {payment.payment_type === "rent" ? (
              <Home className="h-3 w-3 text-[#004aad]" />
            ) : (
              <Shield className="h-3 w-3 text-[#ffc107]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1 mb-0.5">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {payment.remark ||
                  (payment.payment_type === "rent" ? "Rent" : "Deposit")}
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
                <span className="capitalize truncate max-w-[50px]">
                  {payment.payment_mode}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs font-bold text-[#004aad]">
              {formatCurrency(amount)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={payment.status} />
            {(payment.status === "approved" ||
              payment.status === "completed") && (
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 text-[#004aad] hover:text-[#004aad] hover:bg-[#e6f0ff] rounded"
                onClick={() =>
                  window.open(
                    `/api/payments/receipts/${payment.id}/download`,
                    "_blank",
                  )
                }
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

  // Bank Names State
  const [bankNames, setBankNames] = useState<BankName[]>([]);
  const [loadingBankNames, setLoadingBankNames] = useState(false);
  const [showCustomBankInput, setShowCustomBankInput] = useState(false);
  const [customBankName, setCustomBankName] = useState("");

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

  const [newPayment, setNewPayment] = useState({
    payment_type: "rent",
    amount: "",
    payment_mode: "online",
    bank_name: "",
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

  // Fetch bank names from masters - Same as admin form
  const fetchBankNames = async () => {
    setLoadingBankNames(true);
    try {
      // Fetch from Common tab for "Bank Names" master item
      const response = await consumeMasters({
        tab: "Common",
        type: "Bank Names",
      });

      if (response?.success && response.data) {
        const banks = response.data.map((item: any) => ({
          id: item.value_id,
          name: item.value_name,
        }));
        setBankNames(banks);
      }
    } catch (error) {
      console.error("Error fetching bank names:", error);
    } finally {
      setLoadingBankNames(false);
    }
  };


  // Auto-open payment form when coming from portal page
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const openPaymentForm = urlParams.get('openPaymentForm');
  
  if (openPaymentForm === 'true') {
    // Small delay to ensure component is fully loaded
    const timer = setTimeout(() => {
      if (hasBedAssignment) {
        setShowPaymentDialog(true);
        // Remove the query param from URL without reloading
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } else {
        toast.error(
          "You cannot make a payment as no bed has been assigned to you yet. Please contact the property manager."
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }
}, [hasBedAssignment]);

  // Fetch demand details from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const demandId = urlParams.get("demand_id");
    const action = urlParams.get("action");

    if (demandId && action === "pay") {
      fetchDemandDetails(parseInt(demandId));
    }
  }, []);

  // Fetch bank names when component mounts
  useEffect(() => {
    fetchBankNames();
  }, []);

  const fetchDemandDetails = async (demandId: number) => {
    try {
      const response = await fetch(`/api/payments/demands/${demandId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const demand = result.data;
        setPreSelectedPaymentType(demand.payment_type);
        setPreSelectedAmount(demand.amount);
        setShouldAutoOpenPayment(true);
        setShowPaymentDialog(true);
        setNewPayment((prev) => ({
          ...prev,
          amount: demand.amount.toString(),
          payment_type: demand.payment_type,
          remark: `Payment for demand request #${demand.id}: ${demand.description || ""}`,
        }));
      }
    } catch (error) {
      console.error("Error fetching demand details:", error);
      toast.error("Unable to load payment request details");
    }
  };

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
      if (preSelectedAmount && preSelectedPaymentType) {
        setNewPayment((prev) => ({
          ...prev,
          amount: preSelectedAmount?.toString() || "",
          payment_type: preSelectedPaymentType,
        }));
        setPreSelectedAmount(null);
        setPreSelectedPaymentType("rent");
      }
    }
  }, [showPaymentDialog]);

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

    // Group payments by month and type to avoid double-counting
    const rentPaymentsByMonth = new Map<string, number>();
    const depositPaymentsList: number[] = [];

    payments.forEach((payment) => {
      const amount = Number(payment.amount);
      if (isNaN(amount) || amount === 0) return;

      // console.log(
      //   `Processing payment: ID=${payment.id}, Type=${payment.payment_type}, Amount=${amount}, Status=${payment.status}, Month=${payment.month} ${payment.year}`,
      // );

      if (payment.payment_type === "rent") {
        const monthKey = `${payment.month || "Unknown"}-${payment.year || "Unknown"}`;

        // Sum rent payments by month (to avoid counting multiple payments for same month)
        const currentMonthTotal = rentPaymentsByMonth.get(monthKey) || 0;
        rentPaymentsByMonth.set(monthKey, currentMonthTotal + amount);

        // Count unique months
        const isPaid =
          payment.status === "approved" ||
          payment.status === "completed" ||
          payment.status === "pending";
        if (isPaid && !monthsPaid.has(monthKey)) {
          monthsPaid.add(monthKey);
        }

        if (payment.status === "pending") {
          rentPendingCount++;
        } else if (payment.status === "approved") {
          rentApprovedCount++;
        } else if (payment.status === "rejected") {
          rentRejectedCount++;
        }

        if (payment.discount_amount) {
          rentTotalDiscount += Number(payment.discount_amount);
        }
      } else if (payment.payment_type === "security_deposit") {
        depositPaymentsList.push(amount);

        // ✅ Fix: Count 'paid' status as well
        const isPaid =
          payment.status === "approved" ||
          payment.status === "completed" ||
          payment.status === "pending" ||
          payment.status === "paid"; // ← Add 'paid' status

        if (isPaid) {
          depositTotalPaid += amount;
          depositApprovedCount++;
          if (amount > depositRequiredAmount) {
            depositRequiredAmount = amount;
          }
          // console.log(`  Added deposit payment: ₹${amount}, Total deposit now: ₹${depositTotalPaid}`);
        }

        if (payment.status === "pending") {
          depositPendingCount++;
        } else if (payment.status === "rejected") {
          depositRejectedCount++;
        }
      }
    });

    // Calculate total rent paid by summing all month totals
    rentTotalPaid = Array.from(rentPaymentsByMonth.values()).reduce(
      (sum, amount) => sum + amount,
      0,
    );

    // Calculate total pending from paymentFormData (more accurate than summing payments)
    if (paymentFormData) {
      rentTotalPending = paymentFormData.total_pending || 0;
    } else {
      // Fallback: calculate from monthly records if available
      rentTotalPending = 0;
    }

    // console.log(
    //   `Rent payments by month:`,
    //   Array.from(rentPaymentsByMonth.entries()),
    // );
    // console.log(`Total Rent Paid: ${rentTotalPaid}`);
    // console.log(`Total Deposit Paid: ${depositTotalPaid}`);

    // Use securityDepositInfo from API for required amount if available
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
      isFullyPaid:
        depositTotalPaid >= depositRequiredAmount && depositRequiredAmount > 0,
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
      if (!preSelectedAmount) {
        setNewPayment((prev) => ({ ...prev, amount: "" }));
      }
    } else if (type === "security_deposit") {
      setPaymentFormData(null);
      await fetchSecurityDepositInfo();
    }
  };

  const handleRazorpayPayment = useCallback(
    async (amount: number, paymentData: any) => {
      try {
        setLoading(true);

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
          toast.error(
            "Failed to load payment gateway. Please refresh and try again.",
          );
          setLoading(false);
          return false;
        }

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
                  source: "tenant",
                }),
              });

              const saveResult = await saveResponse.json();

              if (saveResult.success) {
                try {
                  await fetch("/api/admin/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      recipient_id: 1,
                      recipient_type: "admin",
                      title: "💰 New Payment Received",
                      message: `${tenant?.full_name} has successfully paid ${paymentData.payment_type === "rent" ? "rent" : "security deposit"} payment of ₹${paymentData.amount.toLocaleString()} via Razorpay.`,
                      notification_type: "payment",
                      related_entity_type: "payment",
                      related_entity_id: saveResult.data.id,
                      priority: "medium",
                    }),
                  });
                } catch (notifError) {
                  console.error("Error creating notification:", notifError);
                }

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
                fetchData(); // Refresh all data

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
                setShowCustomBankInput(false);
                setCustomBankName("");

                toast.success("Payment successful!");
              } else {
                toast.error(
                  saveResult.message ||
                    "Payment saved but verification pending",
                );
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
            ondismiss: function () {
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
    [tenant, fetchTenantPayments, fetchData],
  );

  const handleSubmitPayment = useCallback(async () => {
    if (!newPayment.amount) {
      toast.error("Please enter an amount");
      return;
    }

    if (!hasBedAssignment) {
      toast.error(
        "You cannot make a payment as no bed has been assigned to you yet",
      );
      return;
    }

    try {
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

      if (newPayment.payment_type === "rent") {
        if (selectedPaymentMonth && selectedPaymentMonth !== "current") {
          const [year, month] = selectedPaymentMonth.split("-");
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
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

      await handleRazorpayPayment(parseFloat(newPayment.amount), paymentData);
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment");
    }
  }, [
    tenant?.id,
    newPayment,
    selectedPaymentMonth,
    hasBedAssignment,
    handleRazorpayPayment,
  ]);

  useEffect(() => {
    if (showPaymentConfirmation) {
      const timer = setTimeout(() => {
        setShowPaymentConfirmation(false);
        setPaymentConfirmationData(null);
      }, 5000);
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

  //       console.log('Deposit Stats:', {
  //   requiredAmount: depositStats.requiredAmount,
  //   totalPaid: depositStats.totalPaid,
  //   totalPending: depositStats.totalPending,
  //   isFullyPaid: depositStats.isFullyPaid
  // });

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
      <div className="sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-end justify-end">
          <Button
            size="sm"
            className="bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#002a7a] hover:to-[#001a5a] text-white h-7 px-3 text-xs"
            onClick={() => {
              if (!hasBedAssignment) {
                toast.error(
                  "You cannot make a payment as no bed has been assigned to you yet. Please contact the property manager.",
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

        {/* Rent Summary - Enhanced with all columns matching admin view */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-3 py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xs font-medium flex items-center gap-1">
                <Home className="h-3 w-3" />
                Rent Summary
              </h3>
              <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
                {paymentFormData?.month_wise_history?.length || 0} months
              </Badge>
            </div>
          </div>
          <CardContent className="p-3">
            {paymentFormData?.month_wise_history &&
            paymentFormData.month_wise_history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
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
                        Discount
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
                    {paymentFormData.month_wise_history.map(
                      (month: any, index: number) => {
                        const isCurrentMonth = (() => {
                          const now = new Date();
                          return (
                            month.month_num === now.getMonth() + 1 &&
                            month.year === now.getFullYear()
                          );
                        })();

                        return (
                          <tr
                            key={index}
                            className={`border-t border-slate-200 ${
                              isCurrentMonth ? "bg-blue-50" : ""
                            } ${month.has_discount ? "bg-green-50" : ""} ${month.is_prorated ? "bg-amber-50/30" : ""}`}
                          >
                            <td className="p-2 text-sm font-medium">
                              {month.month} {month.year}
                              {month.isCurrentMonth && (
                                <span className="ml-2 text-xs text-blue-600 font-medium">
                                  (Current)
                                </span>
                              )}
                              {month.has_discount && (
                                <span className="ml-2 text-[10px] text-green-600">
                                  (Discounted)
                                </span>
                              )}
                              {month.is_prorated && !month.has_discount && (
                                <span className="ml-2 text-[10px] text-amber-600">
                                  (Prorated - {month.prorated_days} days)
                                </span>
                              )}
                            </td>
                            <td className="p-2 text-right">
                              ₹{month.rent?.toLocaleString()}
                              {month.original_rent &&
                                month.original_rent > month.rent && (
                                  <span className="text-[10px] text-slate-400 line-through ml-1">
                                    ₹{month.original_rent?.toLocaleString()}
                                  </span>
                                )}
                            </td>
                            <td className="p-2 text-right text-green-600 font-medium">
                              ₹{month.paid?.toLocaleString()}
                            </td>
                            <td className="p-2 text-right text-red-500">
                              ₹{month.discount_applied?.toLocaleString() || 0}
                            </td>
                            <td className="p-2 text-right font-medium">
                              <span
                                className={
                                  month.pending > 0
                                    ? "text-amber-600"
                                    : "text-green-600"
                                }
                              >
                                ₹{month.pending?.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  month.status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : month.status === "partial"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {month.status}
                              </span>
                            </td>
                          </tr>
                        );
                      },
                    )}
                    {/* Summary Row */}
                    <tr className="border-t-2 border-slate-300 bg-slate-50">
                      <td className="p-2 text-sm font-bold" colSpan={2}>
                        Total
                      </td>
                      <td className="p-2 text-right font-bold text-green-600">
                        ₹
                        {paymentFormData.total_paid?.toLocaleString() ||
                          rentStats.totalPaid.toLocaleString()}
                      </td>
                      <td className="p-2 text-right font-bold text-red-500">
                        ₹
                        {paymentFormData.total_discount?.toLocaleString() ||
                          rentStats.totalDiscount.toLocaleString()}
                      </td>
                      <td className="p-2 text-right font-bold text-amber-600">
                        ₹
                        {paymentFormData.total_pending?.toLocaleString() ||
                          rentStats.totalPending.toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <Badge className="bg-purple-100 text-purple-800">
                          Due: ₹
                          {paymentFormData.total_pending?.toLocaleString() ||
                            rentStats.totalPending.toLocaleString()}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500">
                  No rent history available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Deposit Summary - Fixed to show correct values */}
        {depositStats.requiredAmount > 0 && (
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#ffc107] to-[#e6b002] px-3 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-xs font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Security Deposit
                </h3>
                <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
                  {depositStats.isFullyPaid
                    ? "Fully Paid"
                    : `${Math.round(depositProgress)}% Paid`}
                </Badge>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-[8px] text-purple-600 uppercase">
                    Required
                  </p>
                  <p className="text-xs font-bold text-purple-600">
                    {formatCurrency(depositStats.requiredAmount)}
                  </p>
                </div>
                <div className="bg-[#e6f0ff] rounded-lg p-2">
                  <p className="text-[8px] text-[#004aad] uppercase">Paid</p>
                  <p className="text-xs font-bold text-[#004aad]">
                    {formatCurrency(depositStats.totalPaid)}
                  </p>
                </div>
                <div className="bg-[#fff9e6] rounded-lg p-2">
                  <p className="text-[8px] text-[#ffc107] uppercase">Pending</p>
                  <p className="text-xs font-bold text-[#ffc107]">
                    {formatCurrency(depositStats.totalPending)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-[8px] text-slate-600 uppercase">Status</p>
                  <div className="flex items-center gap-1">
                    {depositStats.isFullyPaid ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : depositStats.totalPaid > 0 ? (
                      <Clock className="h-3 w-3 text-[#ffc107]" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {depositStats.isFullyPaid
                        ? "Paid"
                        : depositStats.totalPaid > 0
                          ? "Partial"
                          : "Not Paid"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="flex justify-between text-[8px] text-slate-600 mb-1">
                  <span>Progress</span>
                  <span className="font-bold text-[#ffc107]">
                    {Math.round(depositProgress)}%
                  </span>
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

        {/* Payment History */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-[#004aad]" />
                Payment History
              </h3>
              <div className="flex items-center gap-1">
                <Select
                  value={filterType}
                  onValueChange={(v: any) => setFilterType(v)}
                >
                  <SelectTrigger className="w-[70px] h-6 text-[9px] px-2">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All
                    </SelectItem>
                    <SelectItem value="rent" className="text-xs">
                      Rent
                    </SelectItem>
                    <SelectItem value="deposit" className="text-xs">
                      Deposit
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterStatus}
                  onValueChange={(v: any) => setFilterStatus(v)}
                >
                  <SelectTrigger className="w-[70px] h-6 text-[9px] px-2">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All
                    </SelectItem>
                    <SelectItem value="approved" className="text-xs">
                      Paid
                    </SelectItem>
                    <SelectItem value="pending" className="text-xs">
                      Pending
                    </SelectItem>
                    <SelectItem value="rejected" className="text-xs">
                      Failed
                    </SelectItem>
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
                <p className="text-xs font-medium text-slate-800">
                  No payments found
                </p>
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

      {/* Payment Dialog*/}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 rounded-2xl">
          {/* Header */}
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
          <div className="px-3 pt-3 sm:pt-6 sm:px-6 min-h-[300px] max-h-[400px] overflow-y-auto">
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

            {tenant && (
              <div className="bg-white rounded-lg border border-slate-200 mb-3 sm:mb-4 overflow-hidden">
                <div className="bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 sm:gap-2">
                    <Bed className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Your Accommodation Details
                  </h4>
                </div>
                <div className="p-2 sm:p-4 overflow-x-auto">
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
                            tenant?.tenant_rent || tenant?.monthly_rent || 0,
                          ).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>

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
                              tenant?.tenant_rent || tenant?.monthly_rent || 0,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {newPayment.payment_type === "rent" &&
              paymentFormData?.month_wise_history &&
              paymentFormData.month_wise_history.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 mb-3 sm:mb-4 overflow-hidden">
                  <div className="bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-slate-200">
                    <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 sm:gap-2">
                      <IndianRupee className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      Rent Payment History
                    </h4>
                  </div>
                  <div className="p-2 sm:p-4 max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm">
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
                            Discount
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
                        {paymentFormData.month_wise_history.map(
                          (month: any, index: number) => {
                            const isCurrentMonth = (() => {
                              const now = new Date();
                              return (
                                month.month_num === now.getMonth() + 1 &&
                                month.year === now.getFullYear()
                              );
                            })();

                            return (
                              <tr
                                key={index}
                                className={`border-t border-slate-200 ${
                                  isCurrentMonth ? "bg-blue-50" : ""
                                } ${month.has_discount ? "bg-green-50" : ""} ${month.is_prorated ? "bg-amber-50/30" : ""}`}
                              >
                                <td className="p-2 text-sm font-medium">
                                  {month.month} {month.year}
                                  {month.isCurrentMonth && (
                                    <span className="ml-2 text-xs text-blue-600 font-medium">
                                      (Current)
                                    </span>
                                  )}
                                  {month.has_discount && (
                                    <span className="ml-2 text-[10px] text-green-600">
                                      (Discounted)
                                    </span>
                                  )}
                                  {month.is_prorated && !month.has_discount && (
                                    <span className="ml-2 text-[10px] text-amber-600">
                                      (Prorated - {month.prorated_days} days)
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 text-right">
                                  ₹{month.rent?.toLocaleString()}
                                  {month.original_rent &&
                                    month.original_rent > month.rent && (
                                      <span className="text-[10px] text-slate-400 line-through ml-1">
                                        ₹{month.original_rent?.toLocaleString()}
                                      </span>
                                    )}
                                </td>
                                <td className="p-2 text-right text-green-600 font-medium">
                                  ₹{month.paid?.toLocaleString()}
                                </td>
                                <td className="p-2 text-right text-red-500">
                                  ₹
                                  {month.discount_applied?.toLocaleString() ||
                                    0}
                                </td>
                                <td className="p-2 text-right font-medium">
                                  <span
                                    className={
                                      month.pending > 0
                                        ? "text-amber-600"
                                        : "text-green-600"
                                    }
                                  >
                                    ₹{month.pending?.toLocaleString()}
                                  </span>
                                </td>
                                <td className="p-2 text-center">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      month.status === "paid"
                                        ? "bg-green-100 text-green-800"
                                        : month.status === "partial"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {month.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          },
                        )}
                        {/* Total Outstanding Row */}
                        <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                          <td
                            className="p-2 text-sm font-bold text-slate-800"
                            colSpan={2}
                          >
                            Total Outstanding
                          </td>
                          <td className="p-2 text-right font-bold text-green-600">
                            ₹
                            {paymentFormData.total_paid?.toLocaleString() ||
                              "0"}
                          </td>
                          <td className="p-2 text-right font-bold text-red-500">
                            ₹
                            {paymentFormData.total_discount?.toLocaleString() ||
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
                  </div>
                </div>
              )}

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

                    {/* {securityDepositInfo.is_fully_paid && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-700 text-center flex items-center justify-center gap-1">
                          <span>✅</span> Security deposit is fully paid!
                        </p>
                      </div>
                    )} */}
                  </div>
                </div>
              )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3 mb-3 sm:mb-4">
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
                          tenant?.tenant_rent || tenant?.monthly_rent || 0,
                        );
                        setNewPayment((prev) => ({
                          ...prev,
                          amount: monthlyRent.toString(),
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-6 sm:h-8 text-sm">
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
                </div>
              )}
              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Amount (₹) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    ₹
                  </span>
                  <Input
                    type="text"
                    placeholder="0.00"
                    value={newPayment.amount}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, amount: e.target.value })
                    }
                    className="pl-8 h-6 sm:h-8 text-sm"
                  />
                </div>
              </div>

              

              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Payment Mode *
                </Label>
                <Select value="online" disabled>
                  <SelectTrigger className="h-6 sm:h-8 text-sm bg-slate-50">
                    <SelectValue placeholder="Online" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">🌐 Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3 mb-3 sm:mb-4">
              <div className="space-y-1 sm:space-y-1.5">
                <Label className="text-[11px] font-medium text-slate-600">
                  Bank Name
                </Label>
                <Select
                  value={newPayment.bank_name}
                  onValueChange={(value) => {
                    if (value === "Other") {
                      setShowCustomBankInput(true);
                      setNewPayment({ ...newPayment, bank_name: "Other" });
                    } else {
                      setShowCustomBankInput(false);
                      setNewPayment({ ...newPayment, bank_name: value });
                    }
                  }}
                >
                  <SelectTrigger className="h-6 sm:h-8 text-xs">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankNames.map((bank) => (
                      <SelectItem
                        key={bank.id}
                        value={bank.name}
                        className="text-xs"
                      >
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {showCustomBankInput && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter bank name"
                      value={customBankName}
                      onChange={(e) => {
                        setCustomBankName(e.target.value);
                        setNewPayment({
                          ...newPayment,
                          bank_name: e.target.value,
                        });
                      }}
                      className="h-6 sm:h-8 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
                <Label className="text-xs font-medium text-slate-700">
                  Remark (Optional)
                </Label>
                <Input
                  placeholder="Add any remarks"
                  value={newPayment.remark || ""}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, remark: e.target.value })
                  }
                  className="h-6 sm:h-8 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="px-2 sm:px-3 py-6 sm:py-2 bg-slate-50 border-t border-slate-200 rounded-b-lg sticky bottom-0">
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
                    setShowCustomBankInput(false);
                    setCustomBankName("");
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
