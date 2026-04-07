// app/tenant/portal/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCard,
  FileText,
  Bell,
  AlertCircle,
  Calendar,
  Building,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Wifi,
  Coffee,
  Users,
  User,
  UserX,
  Wrench,
  RefreshCw,
  Move,
  Bed,
  IndianRupee,
  X,
  Plus,
  Download,
  CheckCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import {
  getTenantToken,
  getTenantId,
  type TenantProfile,
  logoutTenant,
} from "@/lib/tenantAuthApi";
import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
import {
  getMyTenantRequests,
  createTenantRequest,
  getComplaintCategories,
  getComplaintReasons,
  // getLeaveTypesFromMasters,
  type TenantRequest,
  type ComplaintCategory,
  type ComplaintReason,
  type LeaveType,
} from "@/lib/tenantRequestsApi";
import {
  getTenantNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "@/lib/tenantNotificationsApi";
// ─── Staff API import ────────────────────────────────────────────────────────
import { getAllStaff, type StaffMember } from "@/lib/staffApi";

// ─── Types ────────────────────────────────────────────────────────────────────
// Assets
import roomacLogo from "@/app/src/assets/images/roomaclogo.webp";
import { useAuth } from "@/context/authContext";
import router from "@/src/compat/next-router";
import { getProperty } from "@/lib/propertyApi";
import * as paymentApi from "@/lib/paymentRecordApi";
import * as notificationApi from "@/lib/notificationApi";
import {
  getTenantUnseenCount,
  markNoticePeriodAsSeen,
} from "@/lib/noticePeriodApi";

interface DashboardStats {
  totalPaid: number;
  totalPending: number;
  pendingCount: number;
  openComplaints: number;
  unreadNotifications: number;
  daysUntilRentDue: number;
  monthlyRent: number;
  occupancyDays: number;
  nextDueDate: string;
  urgentComplaints: number;
  inProgressComplaints: number;
}

interface Payment {
  id: string;
  amount: number;
  description: string;
  payment_date: string;
  payment_method: string;
  status: "completed" | "pending" | "failed";
  due_date?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

// ========== ADD THE PAYMENTITEM COMPONENT RIGHT HERE ==========
// Update the payment item component with receipt download
const PaymentItem = ({ payment }: { payment: any }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg gap-2">
    <div className="flex-1">
      <p className="font-medium text-sm text-slate-900">
        {payment.remark || payment.description || "Rent Payment"}
      </p>
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-xs text-slate-500">
          {formatDate(payment.payment_date)}
        </span>
        <span className="text-xs text-slate-400">•</span>
        <span className="text-xs text-slate-500 capitalize">
          {payment.payment_method || payment.payment_mode}
        </span>
        {payment.month && payment.year && (
          <>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              {payment.month} {payment.year}
            </span>
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
      </div>
    </div>
    <div className="flex items-center gap-3">
      <p className="font-bold text-sm text-slate-900">
        {formatCurrency(payment.amount)}
      </p>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={`text-xs ${
            payment.status === "approved" || payment.status === "completed"
              ? "bg-green-50 text-green-700 border-green-200"
              : payment.status === "pending"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {payment.status === "approved" ? "completed" : payment.status}
        </Badge>

        {/* Show receipt download only for approved payments */}
        {(payment.status === "approved" || payment.status === "completed") && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
            onClick={() =>
              window.open(
                `/api/payments/receipts/${payment.id}/download`,
                "_blank",
              )
            }
            title="Download Receipt"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  </div>
);

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "1",
    amount: 12000,
    description: "Monthly Rent - February 2026",
    payment_date: "2026-02-05T10:30:00Z",
    payment_method: "Credit Card",
    status: "completed",
    due_date: "2026-02-10",
  },
  {
    id: "2",
    amount: 12000,
    description: "Monthly Rent - January 2026",
    payment_date: "2026-01-05T09:15:00Z",
    payment_method: "UPI",
    status: "completed",
    due_date: "2026-01-10",
  },
  {
    id: "3",
    amount: 5000,
    description: "Maintenance Deposit",
    payment_date: "2025-12-15T14:20:00Z",
    payment_method: "Bank Transfer",
    status: "completed",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TenantPortalPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Active tab — hash se decide hoga (#payments, #notifications)
  const getTabFromHash = () => {
    const hash = location.hash.replace("#", "");
    if (["dashboard", "payments", "notifications"].includes(hash)) return hash;
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromHash());

  // Hash change hone par tab update karo
  useEffect(() => {
    setActiveTab(getTabFromHash());
  }, [location.hash]);

  // Tab change hone par URL hash update karo
  // Tab change hone par URL hash update karo - PORTAL KE ANDAR HI RAHE
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Sirf hash change karo, page navigate mat karo
    navigate(`/tenant/portal#${tab}`, { replace: true });
  };

  // Data state
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [complaintCategories, setComplaintCategories] = useState<
    ComplaintCategory[]
  >([]);
  const [complaintReasons, setComplaintReasons] = useState<ComplaintReason[]>(
    [],
  );
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // ─── Property Manager Staff state ────────────────────────────────────────
  const [propertyManagerStaff, setPropertyManagerStaff] =
    useState<StaffMember | null>(null);

  // Dialogs
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState<any>(null);
  const [selectedPaymentMonth, setSelectedPaymentMonth] = useState("");
  const [loadingPaymentForm, setLoadingPaymentForm] = useState(false);
  const [tenantPayments, setTenantPayments] = useState<any[]>([]);
  const [securityDepositInfo, setSecurityDepositInfo] = useState<any>(null);
  const [hasBedAssignment, setHasBedAssignment] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [paymentConfirmationData, setPaymentConfirmationData] =
    useState<any>(null);
  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalPaid: 24500,
    totalPending: 12000,
    pendingCount: 1,
    openComplaints: 2,
    unreadNotifications: 0,
    daysUntilRentDue: 7,
    monthlyRent: 12000,
    occupancyDays: 245,
    nextDueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    urgentComplaints: 1,
    inProgressComplaints: 1,
  });

  // Forms
  const { logout } = useAuth();
  // Form states
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    category: "",
    reason: "",
    priority: "medium",
  });
  const [leaveRequest, setLeaveRequest] = useState({
    leave_type: "",
    leave_start_date: "",
    leave_end_date: "",
    reason: "",
    contact_address: "",
    emergency_contact: "",
  });
  const [newPayment, setNewPayment] = useState({
    payment_type: "rent",
    amount: "",
    payment_mode: "online",
    bank_name: "",
    transaction_id: "",
    payment_date: new Date().toISOString().split("T")[0],
    remark: "",
  });

  // Loading timeout
  useEffect(() => {
    const id = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
      }
    }, 15000);
    return () => clearTimeout(id);
  }, [loading]);

  const formatSalutation = (salutation: string | undefined) => {
    if (!salutation) return "";

    // Common salutations and their proper formatting
    const salutationMap: Record<string, string> = {
      mr: "Mr.",
      "mr.": "Mr.",
      mrs: "Mrs.",
      "mrs.": "Mrs.",
      ms: "Ms.",
      "ms.": "Ms.",
      dr: "Dr.",
      "dr.": "Dr.",
      prof: "Prof.",
      "prof.": "Prof.",
    };

    const lowercased = salutation.toLowerCase().trim();
    return salutationMap[lowercased] || salutation;
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoadingNotifications(true);
      const [notifs, count] = await Promise.all([
        getTenantNotifications(50),
        getUnreadNotificationCount(),
      ]);

      const formattedNotifs = notifs.map((n) => ({
        ...n,
        type: n.notification_type as
          | "payment"
          | "complaint"
          | "maintenance"
          | "leave"
          | "change bed"
          | "vacate bed"
          | "account deletion"
          | "event"
          | "document"
          | "general",
      }));
      setNotifications(formattedNotifs);
      setUnreadCount(count);
      setStats((prev) => ({ ...prev, unreadNotifications: count }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      if (showLoading) setLoadingNotifications(false);
    }
  }, []);

  // Add this effect
  // Update this effect
  useEffect(() => {
    if (showPaymentDialog && tenant?.id) {
      if (newPayment.payment_type === "rent") {
        fetchPaymentFormData();
      } else if (newPayment.payment_type === "security_deposit") {
        fetchSecurityDepositInfo();
      }
    }
  }, [showPaymentDialog, tenant?.id, newPayment.payment_type]);

  // Fetch tenant's payment history
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

  // Add this function to fetch security deposit info
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

  // ─── Fetch property manager staff by matching property_manager_name or staff_id ──
  const fetchPropertyManagerStaff = useCallback(
    async (tenantData: TenantProfile) => {
      try {
        const allStaff = await getAllStaff();

        // Try to match by staff_id first (most reliable)
        const tenantAny = tenantData as any;
        if (tenantAny.staff_id && allStaff.length > 0) {
          const matched = allStaff.find((s) => s.id === tenantAny.staff_id);
          if (matched) {
            setPropertyManagerStaff(matched);
            return;
          }
        }

        // Try to match by property_manager_name from tenant profile
        if (tenantData.property_manager_name && allStaff.length > 0) {
          const managerName = tenantData.property_manager_name
            .toLowerCase()
            .trim();

          // Find staff whose name matches property_manager_name
          const matched = allStaff.find((s) => {
            const staffFullName = `${s.salutation || ""} ${s.name}`
              .toLowerCase()
              .trim();
            return (
              staffFullName === managerName ||
              s.name.toLowerCase().trim() === managerName ||
              managerName.includes(s.name.toLowerCase())
            );
          });

          if (matched) {
            setPropertyManagerStaff(matched);
            return;
          }
        }

        // If property_manager_phone matches, use that
        if (tenantData.property_manager_phone && allStaff.length > 0) {
          const matched = allStaff.find(
            (s) =>
              s.phone === tenantData.property_manager_phone ||
              s.whatsapp_number === tenantData.property_manager_phone,
          );
          if (matched) {
            setPropertyManagerStaff(matched);
            return;
          }
        }

        // If still no match, try to find staff with matching name from property
        if (tenantData.property_name && allStaff.length > 0) {
          // Some staff might have names related to the property
          const propertyNameWords = tenantData.property_name
            .toLowerCase()
            .split(" ");
          const matched = allStaff.find((s) => {
            const staffName = s.name.toLowerCase();
            return propertyNameWords.some(
              (word) => word.length > 3 && staffName.includes(word),
            );
          });

          if (matched) {
            setPropertyManagerStaff(matched);
          }
        }
      } catch (error) {
        console.error("Error fetching staff for property manager:", error);
      }
    },
    [],
  );

  // Fetch data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setLoadingTimeout(false);
    try {
      const token = getTenantToken();
      const tenantId = getTenantId();
      if (!token || !tenantId) {
        router.push("/login");
        return;
      }

      const [profileRes, requestsRes, categoriesRes, leaveTypesRes] =
        await Promise.allSettled([
          tenantDetailsApi.loadProfile(),
          getMyTenantRequests(),
          getComplaintCategories(),
          // getLeaveTypesFromMasters(),
        ]);

      if (profileRes.status === "fulfilled" && profileRes.value?.success) {
        const d = profileRes.value.data;
        setTenant(d);

        // After setting tenant data, check if bed is assigned
        if (d.room_number && d.bed_number) {
          setHasBedAssignment(true);
        } else {
          setHasBedAssignment(false);
        }

        // Fetch tenant payments after getting tenant data
        await fetchTenantPayments();

        // If the tenant has a property_id, fetch the property details to get manager info
        if (d.property_id) {
          try {
            const propertyRes = await getProperty(d.property_id);
            if (propertyRes.success && propertyRes.data) {
              setTenant((prev) => ({
                ...prev!,
                property_manager_name: propertyRes.data.property_manager_name,
                property_manager_phone: propertyRes.data.property_manager_phone,
                property_manager_email: propertyRes.data.property_manager_email,
                // ← ADD these two lines:
                amenities:
                  prev?.amenities || propertyRes.data.amenities || null,
                services: prev?.services || propertyRes.data.services || null,
              }));
              // Fetch staff details for property manager using updated data
              fetchPropertyManagerStaff({
                ...d,
                property_manager_name: propertyRes.data.property_manager_name,
                property_manager_phone: propertyRes.data.property_manager_phone,
              });
            } else {
              fetchPropertyManagerStaff(d);
            }
          } catch (error) {
            console.error("Error fetching property details:", error);
            fetchPropertyManagerStaff(d);
          }
        } else {
          fetchPropertyManagerStaff(d);
        }

        const hasAccommodation = d?.room_number && d?.bed_number;

        let rentAmount = 0;

        if (hasAccommodation) {
          if (d?.tenant_rent) {
            rentAmount = Number(d.tenant_rent);
          } else if (d?.rent_per_bed) {
            rentAmount = Number(d.rent_per_bed);
          } else if (d?.monthly_rent) {
            rentAmount = Number(d.monthly_rent);
          }
        }

        const totalPaid =
          d.payments
            ?.filter((p: any) => p.status === "completed")
            .reduce((s: number, p: any) => s + p.amount, 0) ?? 0;

        const totalPending = hasAccommodation
          ? (d.payments
              ?.filter((p: any) => p.status === "pending")
              .reduce((s: number, p: any) => s + p.amount, 0) ?? rentAmount)
          : 0;

        const pendingCount = hasAccommodation
          ? (d.payments?.filter((p: any) => p.status === "pending").length ?? 1)
          : 0;

        let daysUntilRentDue = 7;
        let nextDueDate = new Date(Date.now() + 7 * 86400000).toISOString();

        if (hasAccommodation && d.check_in_date) {
          const dueDay = new Date(d.check_in_date).getDate();
          const today = new Date();
          let nextDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
          if (today.getDate() > dueDay)
            nextDue = new Date(
              today.getFullYear(),
              today.getMonth() + 1,
              dueDay,
            );
          daysUntilRentDue = Math.ceil(
            (nextDue.getTime() - today.getTime()) / (1000 * 3600 * 24),
          );
          nextDueDate = nextDue.toISOString();
        }

        const occupancyDays = d.check_in_date
          ? Math.ceil(
              (Date.now() - new Date(d.check_in_date).getTime()) /
                (1000 * 3600 * 24),
            )
          : 0;

        setStats((prev) => ({
          ...prev,
          totalPaid,
          totalPending: totalPending || (hasAccommodation ? rentAmount : 0),
          pendingCount: pendingCount || (hasAccommodation ? 1 : 0),
          daysUntilRentDue,
          monthlyRent: rentAmount,
          occupancyDays,
          nextDueDate,
        }));
      }

      if (requestsRes.status === "fulfilled" && requestsRes.value) {
        const data: TenantRequest[] = requestsRes.value;
        const c = data.filter(
          (r) =>
            r.request_type === "complaint" || r.request_type === "maintenance",
        );
        setStats((prev) => ({
          ...prev,
          openComplaints: c.filter(
            (x) => x.status === "pending" || x.status === "in_progress",
          ).length,
          urgentComplaints: c.filter(
            (x) => x.priority === "urgent" && x.status !== "resolved",
          ).length,
          inProgressComplaints: c.filter((x) => x.status === "in_progress")
            .length,
        }));
      }

      if (categoriesRes.status === "fulfilled" && categoriesRes.value)
        setComplaintCategories(categoriesRes.value);
      if (leaveTypesRes.status === "fulfilled" && leaveTypesRes.value)
        setLeaveTypes(leaveTypesRes.value);

      // Fetch notifications separately
      fetchNotifications(false);

      setPayments(MOCK_PAYMENTS);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setPayments(MOCK_PAYMENTS);
    } finally {
      setLoading(false);
    }
  }, [
    navigate,
    fetchNotifications,
    fetchPropertyManagerStaff,
    fetchTenantPayments,
  ]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Set up polling for real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Load notifications when tab changes to notifications
  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications(true);
    }
  }, [activeTab, fetchNotifications]);

  useEffect(() => {
    if (selectedCategory)
      getComplaintReasons(parseInt(selectedCategory))
        .then(setComplaintReasons)
        .catch(console.error);
  }, [selectedCategory]);

  const handleLogout = useCallback(async () => {
    await logoutTenant();
    localStorage.clear();
    router.push("/login");
    logout();
  }, []);

  const handleSubmitComplaint = useCallback(async () => {
    if (
      !newComplaint.title ||
      !newComplaint.description ||
      !newComplaint.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createTenantRequest({
        request_type: "complaint",
        title: newComplaint.title,
        description: newComplaint.description,
        priority: newComplaint.priority as any,
        complaint_data: {
          category_master_type_id: parseInt(newComplaint.category),
          reason_master_value_id: newComplaint.reason
            ? parseInt(newComplaint.reason)
            : undefined,
        },
      });
      toast.success("Complaint submitted successfully");
      setShowComplaintDialog(false);
      setNewComplaint({
        title: "",
        description: "",
        category: "",
        reason: "",
        priority: "medium",
      });
      fetchAllData();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit complaint");
    }
  }, [newComplaint, fetchAllData]);

  const handleSubmitLeaveRequest = useCallback(async () => {
    if (
      !leaveRequest.leave_type ||
      !leaveRequest.leave_start_date ||
      !leaveRequest.reason
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createTenantRequest({
        request_type: "leave",
        title: `Leave Request - ${leaveRequest.leave_type}`,
        description: leaveRequest.reason,
        priority: "medium",
        leave_data: {
          leave_type: leaveRequest.leave_type,
          leave_start_date: leaveRequest.leave_start_date,
          leave_end_date:
            leaveRequest.leave_end_date || leaveRequest.leave_start_date,
          total_days: leaveRequest.leave_end_date
            ? Math.ceil(
                (new Date(leaveRequest.leave_end_date).getTime() -
                  new Date(leaveRequest.leave_start_date).getTime()) /
                  (1000 * 3600 * 24),
              ) + 1
            : 1,
          contact_address_during_leave: leaveRequest.contact_address,
          emergency_contact_number: leaveRequest.emergency_contact,
        },
      });
      toast.success("Leave request submitted successfully");
      setShowLeaveDialog(false);
      setLeaveRequest({
        leave_type: "",
        leave_start_date: "",
        leave_end_date: "",
        reason: "",
        contact_address: "",
        emergency_contact: "",
      });
      fetchAllData();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit leave request");
    }
  }, [leaveRequest, fetchAllData]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      const marked = await markAllNotificationsAsRead();
      if (marked > 0) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        setStats((prev) => ({ ...prev, unreadNotifications: 0 }));
        toast.success(`${marked} notifications marked as read`);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  }, []);

  // app/tenant/portal/page.tsx - COMPLETE REPLACEMENT for handleNotificationClick

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      if (!notification.is_read) {
        try {
          await markNotificationAsRead(notification.id);
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, is_read: true } : n,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          setStats((prev) => ({
            ...prev,
            unreadNotifications: Math.max(0, prev.unreadNotifications - 1),
          }));
        } catch (error) {
          console.error("Error marking notification as read:", error);
        }
      }

      // Check if this is a notice period notification
      const type = notification.notification_type || notification.type;
      const isNoticePeriod =
        type === "notice_period" ||
        notification.related_entity_type === "notice_period" ||
        (notification.title && notification.title.includes("Notice Period"));

      // CRITICAL: For notice period notifications, mark as seen in the database
      if (isNoticePeriod && notification.related_entity_id) {
        try {
          const result = await markNoticePeriodAsSeen(
            notification.related_entity_id,
          );

          if (result.success) {
            toast.success("Notice period marked as seen");
          } else {
            toast.error(result.message || "Failed to mark as seen");
          }
        } catch (error) {
          console.error(
            "❌ Portal failed to mark notice period as seen:",
            error,
          );
          toast.error("Failed to mark notice period as seen");
        }
      }

      // Navigate based on notification type
      if (type === "complaint") {
        navigate("/tenant/requests");
      } else if (type === "maintenance") {
        navigate("/tenant/requests");
      } else if (type === "leave") {
        navigate("/tenant/requests");
      } else if (type === "change bed") {
        navigate("/tenant/requests");
      } else if (type === "vacate bed") {
        navigate("/tenant/requests");
      } else if (type === "account deletion") {
        navigate("/tenant/profile");
      } else if (type === "payment") {
        handleTabChange("payments");
      } else if (type === "document") {
        navigate("/tenant/documents");
      } else if (type === "notice_period") {
        navigate("/tenant/notifications");
      }
    },
    [navigate, handleTabChange],
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "complaint":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case "maintenance":
        return <Wrench className="h-4 w-4 text-purple-600" />;
      case "leave":
        return <Users className="h-4 w-4 text-green-600" />;
      case "change_bed":
        return <Move className="h-4 w-4 text-teal-600" />;
      case "vacate bed":
        return <MapPin className="h-4 w-4 text-red-600" />;
      case "account deletion":
        return <UserX className="h-4 w-4 text-gray-600" />;
      case "document":
        return <FileText className="h-4 w-4 text-purple-600" />;
      case "event":
        return <Calendar className="h-4 w-4 text-green-600" />;
      case "notice_period":
        return <Bell className="h-4 w-4 text-amber-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  // ─── Helper: real amenities from backend ────────────────────────────────────
  // CHANGE TO:
  const getAmenitiesDisplay = () => {
    const raw = tenant?.amenities || tenant?.services || tenant?.property_rules;

    if (!raw) return "—";

    // If already array
    if (Array.isArray(raw)) {
      return raw.map((item) => String(item).trim()).join(", ");
    }

    // If already object
    if (typeof raw === "object") {
      return Object.values(raw)
        .map((item) => String(item).trim())
        .join(", ");
    }

    // If string
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          return parsed.map((item) => String(item).trim()).join(", ");
        }

        if (typeof parsed === "object") {
          return Object.values(parsed)
            .map((item) => String(item).trim())
            .join(", ");
        }

        return String(parsed);
      } catch {
        // plain string like "wifiACParking"
        return raw
          .replace(/([A-Z])/g, " $1")
          .replace(/,/g, ", ")
          .trim();
      }
    }

    return "—";
  };
  // ─── Property manager display helpers ───────────────────────────────────────
  // Update the getManagerDisplayName function
  const getManagerDisplayName = () => {
    if (propertyManagerStaff) {
      const sal = propertyManagerStaff.salutation
        ? `${formatSalutation(propertyManagerStaff.salutation)} `
        : "";
      return `${sal}${propertyManagerStaff.name}`;
    }
    return tenant?.property_manager_name || "—";
  };

  const getManagerRole = () => {
    // First priority: role_name from staff data (this comes from masters)
    if (propertyManagerStaff?.role_name) {
      return propertyManagerStaff.role_name;
    }

    // Second priority: role field from staff data
    if (propertyManagerStaff?.role) {
      return propertyManagerStaff.role;
    }

    // Third priority: if staff has designation
    if (
      propertyManagerStaff &&
      "designation" in propertyManagerStaff &&
      propertyManagerStaff.designation
    ) {
      return propertyManagerStaff.designation;
    }

    // If we have property manager name but no role, try to infer from tenant data
    if (tenant?.property_manager_name) {
      // Check if the property manager might be a "Manager"
      return "Property Manager";
    }

    // Default fallback
    return "Property Manager";
  };

  const getManagerPhone = () => {
    if (propertyManagerStaff?.phone) return propertyManagerStaff.phone;
    return tenant?.property_manager_phone || "—";
  };

  const getManagerEmail = () => {
    if (propertyManagerStaff?.email) return propertyManagerStaff.email;
    return (tenant as any)?.property_manager_email || "—";
  };

  
  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0149ab] border-t-transparent" />
          <p className="mt-4 text-slate-600">Loading your dashboard...</p>
          {loadingTimeout && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Refresh Page
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  // Real rent value (same logic as TenantLayout accommodation card)
  // Real rent value from stats (already calculated in fetchAllData)
  const rentAmount = stats.monthlyRent;

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
    <div className="p-2 sm:p-2">
      {/* ── Stats Cards ── */}
      {/* MOBILE: very compact. DESKTOP (lg+): unchanged */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-4 lg:mb-5">
        {/* Rent Due Card — Blue */}
        {/* Rent Due Card — Blue */}
        <Card className="border border-blue-200/50 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-2 lg:p-3">
            <div className="flex items-start justify-between gap-1 min-w-0">
              <div className="flex items-center gap-1.5 lg:gap-2 min-w-0 flex-1">
                <div className="h-7 w-7 lg:h-9 lg:w-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
                  <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs font-medium text-slate-600 leading-tight">
                    Rent Due
                  </p>
                  {tenant?.room_number && tenant?.bed_number ? (
                    <div className="flex items-baseline gap-0.5">
                      <p className="text-sm lg:text-lg font-bold text-slate-900 leading-tight">
                        {stats.daysUntilRentDue}
                      </p>
                      <span className="text-[9px] lg:text-xs font-medium text-slate-500">
                        days
                      </span>
                    </div>
                  ) : (
                    <p className="text-[8px] text-amber-600 font-medium truncate max-w-[90px]">
                      No Accomondation
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 pt-3">
                <p className="text-[9px] lg:text-xs text-slate-500 mb-0.5">
                  Amount
                </p>
                {tenant?.room_number && tenant?.bed_number ? (
                  <p className="text-xs lg:text-base font-bold text-blue-700">
                    ₹{stats.monthlyRent.toLocaleString("en-IN")}
                  </p>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0 bg-amber-50 text-amber-700"
                  >
                    Pending
                  </Badge>
                )}
              </div>
            </div>

            {tenant?.room_number && tenant?.bed_number ? (
              <div className="mt-1.5 lg:mt-3">
                <div className="flex justify-between text-[9px] lg:text-xs text-slate-500 mb-0.5 lg:mb-1">
                  <span>Today</span>
                  <span className="font-medium">
                    {new Date(stats.nextDueDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1 lg:h-1.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-1 lg:h-1.5 transition-all duration-500"
                    style={{
                      width: `${Math.min((stats.daysUntilRentDue / 30) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-1.5 lg:mt-3">
                <p className="text-[9px] lg:text-xs text-slate-500 text-center">
                  Please contact admin
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Issues Card — Amber/Orange */}
        <Card className="border border-orange-200/50 bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-2 lg:p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="h-7 w-7 lg:h-9 lg:w-9 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-3 w-3 lg:h-4 lg:w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs font-medium text-slate-600 leading-tight">
                    Open Issues
                  </p>
                  <p className="text-sm lg:text-lg font-bold text-slate-900 leading-tight">
                    {stats.openComplaints}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] lg:text-xs text-slate-500 mb-0.5 lg:mb-1">
                  Urgent
                </p>
                <Badge
                  variant="destructive"
                  className="text-[9px] lg:text-xs px-1.5 py-0 h-4 lg:h-auto"
                >
                  {stats.urgentComplaints}
                </Badge>
              </div>
            </div>
            <div className="mt-1.5 lg:mt-3 flex gap-1">
              <div className="flex-1 bg-amber-100 rounded-lg p-1 lg:p-1.5 text-center">
                <p className="text-[9px] lg:text-xs font-semibold text-amber-900 leading-tight">
                  In Progress
                </p>
                <p className="text-[9px] lg:text-xs text-amber-700">
                  {stats.inProgressComplaints}
                </p>
              </div>
              <div className="flex-1 bg-orange-100 rounded-lg p-1 lg:p-1.5 text-center">
                <p className="text-[9px] lg:text-xs font-semibold text-orange-900 leading-tight">
                  Pending
                </p>
                <p className="text-[9px] lg:text-xs text-orange-700">
                  {stats.openComplaints - stats.inProgressComplaints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments Card — Emerald */}
        <Card className="border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-2 lg:p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="h-7 w-7 lg:h-9 lg:w-9 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center shrink-0">
                  <CreditCard className="h-3 w-3 lg:h-4 lg:w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs font-medium text-slate-600 leading-tight">
                    Pending
                  </p>
                  <p className="text-sm lg:text-lg font-bold text-slate-900 leading-tight">
                    {stats.pendingCount}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] lg:text-xs text-slate-500 mb-0.5 lg:mb-1">
                  Total
                </p>
                {/* ← Real pending amount from backend */}
                <p className="text-xs lg:text-base font-bold text-emerald-700">
                  ₹
                  {Number(stats.totalPending || rentAmount).toLocaleString(
                    "en-IN",
                  )}
                </p>
              </div>
            </div>
            <div className="mt-1.5 lg:mt-3">
              <Button
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-6 lg:h-7 text-[10px] lg:text-xs"
                onClick={() => {
                  handleTabChange("payments"); // ← YEH PORTAL KE ANDAR TAB CHANGE KAREGA
                  setShowPaymentDialog(true);
                }}
              >
                <CreditCard className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-1" />
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card — Purple */}
        <Card className="border border-purple-200/50 bg-gradient-to-br from-purple-50 to-white shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-2 lg:p-3">
            <div className="flex items-center justify-between mb-1.5 lg:mb-2">
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="h-7 w-7 lg:h-9 lg:w-9 rounded-lg bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center shrink-0">
                  <Bell className="h-3 w-3 lg:h-4 lg:w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs font-medium text-slate-600 leading-tight">
                    Notifications
                  </p>
                  <p className="text-sm lg:text-lg font-bold text-slate-900 leading-tight">
                    {stats.unreadNotifications}
                  </p>
                </div>
              </div>
              {stats.unreadNotifications > 0 && (
                <Badge className="bg-purple-500 hover:bg-purple-600 text-[9px] lg:text-xs px-1.5 h-4 lg:h-auto">
                  New
                </Badge>
              )}
            </div>
            <div className="mt-1.5 lg:mt-3">
              <Button
                size="sm"
                variant="outline"
                className="w-full h-6 lg:h-7 text-[10px] lg:text-xs border-purple-200 hover:bg-purple-50 hover:text-black"
                onClick={() => handleTabChange("notifications")}
              >
                View All
                <ChevronRight className="h-2.5 w-2.5 lg:h-3 lg:w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons - compact on mobile */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-4 lg:mb-5">
        <Button
          variant="outline"
          className="h-auto py-1.5 lg:py-2 px-1 flex flex-col items-center justify-center gap-0.5 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm rounded-lg"
          onClick={() => setShowComplaintDialog(true)}
        >
          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600" />
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-center leading-tight">
            Raise Complaint
          </span>
          <span className="text-[8px] lg:text-[10px] text-slate-400 text-center leading-tight hidden lg:block">
            Report any issues
          </span>
        </Button>

        {/* <Button
          variant="outline"
          className="h-auto py-1.5 lg:py-2 px-1 flex flex-col items-center justify-center gap-0.5 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm rounded-lg"
          onClick={() => setShowLeaveDialog(true)}
        >
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-green-500" />
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-center leading-tight">Request Leave</span>
          <span className="text-[8px] lg:text-[10px] text-slate-400 text-center leading-tight hidden lg:block">Vacation or early leave</span>
        </Button> */}

        <Button
          variant="outline"
          className="h-auto py-1.5 lg:py-2 px-1 flex flex-col items-center justify-center gap-0.5 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm rounded-lg"
          onClick={() => navigate("/tenant/documents")}
        >
          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-purple-500" />
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-center leading-tight">
            View Agreement
          </span>
          <span className="text-[8px] lg:text-[10px] text-slate-400 text-center leading-tight hidden lg:block">
            Rental contract
          </span>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-1.5 lg:py-2 px-1 flex flex-col items-center justify-center gap-0.5 bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-[#0149ab] shadow-sm rounded-lg"
          onClick={() => {
            handleTabChange("payments");
            setShowPaymentDialog(true);
          }}
        >
          <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-amber-500" />
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-center leading-tight">
            Download Invoice
          </span>
          <span className="text-[8px] lg:text-[10px] text-slate-400 text-center leading-tight hidden lg:block">
            Payment receipts
          </span>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="bg-white border border-slate-200 p-1 rounded-lg w-full grid grid-cols-3">
              <TabsTrigger
                value="dashboard"
                className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5"
              >
                Payments
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="rounded-md data-[state=active]:bg-[#0149ab] data-[state=active]:text-white data-[state=inactive]:text-slate-600 transition-all text-xs sm:text-sm py-2 sm:py-2.5"
              >
                <span className="flex items-center gap-1">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-1 text-[10px] px-1.5 py-0 h-4"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </span>
              </TabsTrigger>
            </TabsList>

            {/* ── Dashboard Tab ─────────────────────────────────────── */}
            <TabsContent value="dashboard" className="space-y-6 mt-4">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm sm:text-base font-semibold">
                      Recent Payments
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#0149ab] hover:bg-blue-50 text-xs sm:text-sm"
                      onClick={() => handleTabChange("payments")}
                    >
                      View All <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {tenantPayments.length > 0 ? (
                    <div className="space-y-3">
                      {tenantPayments.slice(0, 3).map((p) => (
                        <PaymentItem key={p.id} payment={p} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">
                        No payment history
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Keep the Amenities History card as is */}
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-2 px-4 sm:px-6">
                  <CardTitle className="text-sm sm:text-base font-semibold">
                    Amenities History
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      { icon: Wifi, label: "WiFi - Last used: Today" },
                      {
                        icon: Coffee,
                        label: "Laundry - Last used: 2 days ago",
                      },
                      { icon: Users, label: "Gym - Last used: 5 days ago" },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
                        <span className="text-xs sm:text-sm font-medium">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Payments Tab ──────────────────────────────────────── */}
            <TabsContent value="payments" className="space-y-6 mt-4">
              <Button
                className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-10 sm:h-12"
                onClick={() => {
                  if (!hasBedAssignment) {
                    toast.error(
                      "You cannot make a payment as no bed has been assigned to you yet. Please contact the property manager.",
                    );
                    return;
                  }
                  fetchPaymentFormData();
                  setShowPaymentDialog(true);
                }}
              >
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Make a Payment
              </Button>

              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg font-semibold">
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 md:max-h-[50vh] overflow-auto">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0149ab] border-t-transparent" />
                    </div>
                  ) : tenantPayments.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {tenantPayments.map((p) => (
                        <PaymentItem key={p.id} payment={p} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">
                        No payment history
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Make your first payment using the button above
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Notifications Tab ─────────────────────────────────── */}
            <TabsContent value="notifications" className="space-y-6 mt-4">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-lg font-semibold">
                      All Notifications
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#0149ab] hover:bg-blue-50 text-xs sm:text-sm"
                          onClick={handleMarkAllRead}
                        >
                          Mark all as read
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNotifications(true)}
                        className="text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  {loadingNotifications ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0149ab] border-t-transparent" />
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="space-y-3 max-h-[43vh] overflow-y-auto pr-1">
                      {" "}
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 sm:p-3 rounded-md border cursor-pointer transition-all hover:shadow-sm ${
                            !n.is_read
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-slate-200"
                          }`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`h-6 w-6 rounded-md flex items-center justify-center ${
                                n.is_read ? "bg-slate-100" : "bg-blue-100"
                              }`}
                            >
                              {getNotificationIcon(
                                n.notification_type || n.type || "general",
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <p className="font-medium text-xs sm:text-sm text-slate-900 leading-tight">
                                  {n.title}
                                </p>
                                {n.is_read && n.type === "notice_period" && (
                                  <div className="bg-blue-600 rounded-full px-2 py-1 text-white text-xs">
                                    seen
                                  </div>
                                )}
                                {!n.is_read && n.type === "notice_period" && (
                                  <div className="bg-blue-600 rounded-full px-2 py-1 text-white text-xs">
                                    unseen
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">
                                {n.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-slate-400">
                                  {formatDateTime(n.created_at)}
                                </p>
                                {n.related_entity_type === "complaint" && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-orange-50 text-orange-700 border-orange-200"
                                  >
                                    Complaint #{n.related_entity_id}
                                  </Badge>
                                )}
                                {n.related_entity_type === "maintenance" && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] bg-purple-50 text-purple-700 border-purple-200"
                                  >
                                    Maintenance #{n.related_entity_id}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No notifications</p>
                      <p className="text-xs text-slate-400 mt-1">
                        When you have notifications, they'll appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contract Details — real data from backend */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2 sm:space-y-3">
                {[
                  {
                    label: "Check-in",
                    // ← Real check-in from backend
                    value: tenant?.check_in_date
                      ? formatDate(tenant.check_in_date)
                      : "—",
                  },
                  {
                    label: "Lock-in",
                    // ← Real lockin_period_months from backend
                    value: tenant?.lockin_period_months
                      ? `${tenant.lockin_period_months} months`
                      : "—",
                  },
                  {
                    label: "Notice",
                    // ← Real notice_period_days from backend
                    value: tenant?.notice_period_days
                      ? `${tenant.notice_period_days} days`
                      : "—",
                  },
                  {
                    label: "Amenities",
                    // ← Real amenities from backend
                    value: getAmenitiesDisplay(),
                  },
                ].map(({ label, value }, i, arr) => (
                  <div
                    key={label}
                    className={`flex justify-between py-2 ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}
                  >
                    <span className="text-xs sm:text-sm text-slate-500">
                      {label}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-900 text-right max-w-[60%]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Manager — salutation from staff API */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
                Property Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#0149ab]/10 flex items-center justify-center shrink-0">
                    {/* Show staff photo if available */}
                    {propertyManagerStaff?.photo_url ? (
                      <img
                        src={propertyManagerStaff.photo_url}
                        alt={propertyManagerStaff.name}
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#0149ab]" />
                    )}
                  </div>
                  <div>
                    {/* ← Name with salutation from staff API */}
                    <p className="font-medium text-sm text-slate-900">
                      {getManagerDisplayName()}
                    </p>
                    {/* ← Role from staff API */}
                    <p className="text-xs text-slate-500">{getManagerRole()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-[#0149ab] shrink-0" />
                    {/* ← Phone from staff API */}
                    <span className="truncate">{getManagerPhone()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-[#0149ab] shrink-0" />
                    {/* ← Email from staff API */}
                    <span className="truncate">{getManagerEmail()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Complaint Dialog ────────────────────────────────────────────── */}
      <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
        <DialogContent className="sm:max-w-md w-[94%] p-0 overflow-hidden rounded-xl">
          {/* Header with Gradient */}
          <div className="relative px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]">
            <DialogTitle className="text-white text-base sm:text-lg font-semibold">
              Raise a Complaint
            </DialogTitle>

            {/* Close Icon */}
            <button
              onClick={() => setShowComplaintDialog(false)}
              className="absolute right-3 top-3 text-white hover:opacity-80 text-lg"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4">
            <div>
              <Label className="text-[11px] sm:text-sm font-medium">
                Title *
              </Label>
              <Input
                value={newComplaint.title}
                onChange={(e) =>
                  setNewComplaint({ ...newComplaint, title: e.target.value })
                }
                placeholder="Brief title of the issue"
                className="mt-1 h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            <div>
              <Label className="text-[11px] sm:text-sm font-medium">
                Category *
              </Label>
              <Select
                value={newComplaint.category}
                onValueChange={(v) => {
                  setNewComplaint({ ...newComplaint, category: v, reason: "" });
                  setSelectedCategory(v);
                }}
              >
                <SelectTrigger className="mt-1 h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {complaintCategories.length > 0 ? (
                    complaintCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="1">Maintenance</SelectItem>
                      <SelectItem value="2">Cleaning</SelectItem>
                      <SelectItem value="3">Noise</SelectItem>
                      <SelectItem value="4">Security</SelectItem>
                      <SelectItem value="5">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {complaintReasons.length > 0 && (
              <div>
                <Label className="text-[11px] sm:text-sm font-medium">
                  Reason
                </Label>
                <Select
                  value={newComplaint.reason}
                  onValueChange={(v) =>
                    setNewComplaint({ ...newComplaint, reason: v })
                  }
                >
                  <SelectTrigger className="mt-1 h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Select reason (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {complaintReasons.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-[11px] sm:text-sm font-medium">
                Priority
              </Label>
              <Select
                value={newComplaint.priority}
                onValueChange={(v) =>
                  setNewComplaint({ ...newComplaint, priority: v })
                }
              >
                <SelectTrigger className="mt-1 h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] sm:text-sm font-medium">
                Description *
              </Label>
              <Textarea
                value={newComplaint.description}
                onChange={(e) =>
                  setNewComplaint({
                    ...newComplaint,
                    description: e.target.value,
                  })
                }
                rows={3}
                placeholder="Describe the issue in detail"
                className="mt-1 text-xs sm:text-sm"
              />
            </div>

            <Button
              onClick={handleSubmitComplaint}
              className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-9 sm:h-11 text-xs sm:text-sm"
            >
              Submit Complaint
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Leave Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-2xl w-[96%] p-0 overflow-hidden rounded-xl">
          {/* Header */}
          <div className="relative px-4 py-2.5 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]">
            <DialogTitle className="text-white text-sm font-semibold">
              Request Leave
            </DialogTitle>
            <button
              onClick={() => setShowLeaveDialog(false)}
              className="absolute right-3 top-2.5 text-white hover:opacity-80 text-base"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-3 space-y-2.5">
            {/* {tenant?.lockin_period_months && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-[11px] font-medium text-yellow-800">Lock-in Period Information</p>
          <p className="text-[10px] text-yellow-700 mt-0.5">
            Lock-in: {tenant.lockin_period_months} months
          </p>
        </div>
      )} */}

            {/* Row 1: Leave Type + Start Date + End Date */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[11px] font-medium">Leave Type *</Label>
                <Select
                  value={leaveRequest.leave_type}
                  onValueChange={(v) =>
                    setLeaveRequest({ ...leaveRequest, leave_type: v })
                  }
                >
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.length > 0 ? (
                      leaveTypes.map((t) => (
                        <SelectItem key={t.id} value={t.value}>
                          {t.value}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] font-medium">Start Date *</Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={leaveRequest.leave_start_date}
                  onChange={(e) =>
                    setLeaveRequest({
                      ...leaveRequest,
                      leave_start_date: e.target.value,
                    })
                  }
                  className="mt-1 h-8 text-xs"
                />
              </div>

              <div>
                <Label className="text-[11px] font-medium">End Date</Label>
                <Input
                  type="date"
                  min={
                    leaveRequest.leave_start_date ||
                    new Date().toISOString().split("T")[0]
                  }
                  value={leaveRequest.leave_end_date}
                  onChange={(e) =>
                    setLeaveRequest({
                      ...leaveRequest,
                      leave_end_date: e.target.value,
                    })
                  }
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            {/* Row 2: Contact Address + Emergency Contact */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] font-medium">
                  Contact Address (During Leave)
                </Label>
                <Input
                  value={leaveRequest.contact_address}
                  onChange={(e) =>
                    setLeaveRequest({
                      ...leaveRequest,
                      contact_address: e.target.value,
                    })
                  }
                  placeholder="Where can we reach you?"
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-medium">
                  Emergency Contact
                </Label>
                <Input
                  value={leaveRequest.emergency_contact}
                  maxLength={10}
                  onChange={(e) =>
                    setLeaveRequest({
                      ...leaveRequest,
                      emergency_contact: e.target.value,
                    })
                  }
                  placeholder="Emergency contact number"
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>

            {/* Row 3: Reason — full width, compact */}
            <div>
              <Label className="text-[11px] font-medium">Reason *</Label>
              <Textarea
                value={leaveRequest.reason}
                onChange={(e) =>
                  setLeaveRequest({ ...leaveRequest, reason: e.target.value })
                }
                rows={2}
                placeholder="Please provide reason for leave"
                className="mt-1 text-xs"
              />
            </div>

            <Button
              onClick={handleSubmitLeaveRequest}
              className="w-full bg-[#0149ab] hover:bg-[#0149ab]/90 h-8 text-xs"
            >
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Payment Dialog for Tenant Portal ───────────────────────────────────────────────── */}
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
                            tenant?.tenant_rent ||
                              tenant?.monthly_rent ||
                              stats.monthlyRent,
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
