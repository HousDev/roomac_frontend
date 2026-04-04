// app/admin/payments/page.tsx
"use client";

import { useState, useEffect, Fragment } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  CreditCard,
  FileText,
  Download,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  IndianRupee,
  X,
  Bed,
  User,
  CalendarDays,
  Upload,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Building,
  MapPin,
  Wifi,
  Wind,
  Bath,
  Maximize,
  Loader2,
  Printer,
  EyeIcon,
  Banknote,
  Receipt,
  Send,
  Home,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle as XCircleIcon,
  Trash2,
  ChevronDown,
  Phone,
  Filter,
  Pencil,
  ReceiptIndianRupee,
  ReceiptIndianRupeeIcon,
  ArrowUpDown,
  MoreVertical,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
// Import APIs
import { listTenants, type Tenant } from "@/lib/tenantApi";
import * as paymentApi from "@/lib/paymentRecordApi";
import { getSettings, type SettingsData } from "@/lib/settingsApi";
import { getPaymentRejectionReasons } from "@/lib/masterApi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/context/authContext";
import React from "react";
import { getLatestRentPayment } from "@/lib/paymentRecordApi";

// Types
interface PaymentFormData {
  tenant: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  room_info: {
    room_number: string;
    bed_number: number;
    bed_type: string;
    property_name: string;
  };
  monthly_rent: number;
  previous_month: {
    month: string;
    year: number;
    pending: number;
    paid: number;
  };
  current_month: {
    month: string;
    year: number;
    paid: number;
    pending: number;
  };
  total_pending: number;
  suggested_amount: number;
}

interface DemandPayment {
  id: number;
  tenant_id: number;
  amount: number;
  due_date: string;
  payment_type: string;
  description: string;
  late_fee: number;
  status: "pending" | "paid" | "partial" | "overdue" | "cancelled";
  created_at: string;
  tenant_name?: string;
  tenant_phone?: string;
  room_number?: string;
  bed_number?: number;
  property_name?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<paymentApi.Payment[]>([]);
  const [receipts, setReceipts] = useState<paymentApi.Receipt[]>([]);
  const [demands, setDemands] = useState<DemandPayment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isDemandPaymentOpen, setIsDemandPaymentOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentFormData, setPaymentFormData] =
    useState<PaymentFormData | null>(null);
  const [activeTab, setActiveTab] = useState("payments");
  // Add this state
  const [securityDepositInfo, setSecurityDepositInfo] = useState<any>(null);
  const { can } = useAuth();

  // Proof upload states
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const [selectedPaymentMonth, setSelectedPaymentMonth] = useState("");
  // Action states
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  // Add this state near your other useState declarations
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [approvingPayment, setApprovingPayment] = useState<any>(null);
  const [highlightedReceipt, setHighlightedReceipt] = useState<number | null>(
    null,
  );
  // Add this with your other useState declarations
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  // Add these state variables with your other useState declarations
  const [settings, setSettings] = useState<SettingsData>({});
  const [loadingSettings, setLoadingSettings] = useState(false);
  // ===== ADD THIS AFTER YOUR EXISTING useState DECLARATIONS (around line 100-120) =====
  const [sortField, setSortField] = useState<keyof any>("payment_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [rejectionReasons, setRejectionReasons] = useState<any[]>([]);
  const [selectedRejectionCategory, setSelectedRejectionCategory] =
    useState<string>("");
    const [showPaymentFilterSidebar, setShowPaymentFilterSidebar] = useState(false);
  const [showReceiptFilterSidebar, setShowReceiptFilterSidebar] = useState(false);
  const [showDemandFilterSidebar, setShowDemandFilterSidebar] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    payment_date: "",
    tenant_name: "",
    amount: "",
    min_amount: "",
    max_amount: "",
    payment_mode: "all",
    transaction_id: "",
    month: "",
    status: "all",
    remark: "",
  });
  // ===== END OF ADDITION =====

  // Filters
  const [filters, setFilters] = useState({
    date: "",
    tenant: "",
    remark: "",
    amount: "",
    method: "",
    transactionId: "",
  });

  const [demandFilters, setDemandFilters] = useState({
    status: "",
    tenant: "",
    from_date: "",
    to_date: "",
  });

  const [stats, setStats] = useState({
    total_collected: 0,
    total_transactions: 0,
    online_payments: 0,
    cash_payments: 0,
    card_payments: 0,
    bank_transfers: 0,
    cheque_payments: 0,
    current_month_collected: 0,
    rent_collected: 0,
  });

  const [newPayment, setNewPayment] = useState({
    tenant_id: "",
    booking_id: null as number | null,
    payment_type: "rent",
    amount: "",
    payment_mode: "cash",
    bank_name: "",
    transaction_id: "",
    payment_date: new Date().toISOString().split("T")[0],
    remark: "",
  });

  const [demandPayment, setDemandPayment] = useState({
    tenant_id: "",
    payment_type: "rent",
    amount: 0,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    description: "",
    include_late_fee: false,
    // late_fee_amount: 0,
    send_email: true,
    send_sms: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPayments(),
        loadReceipts(),
        loadDemands(),
        loadTenants(),
        loadStats(),
      ]);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // In the main component, add useEffect to clear highlight after some time
  useEffect(() => {
    if (highlightedReceipt) {
      const timer = setTimeout(() => {
        setHighlightedReceipt(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedReceipt]);

  // Update the onViewReceipt handler
  const handleViewReceipt = (receiptId: number) => {
    setHighlightedReceipt(receiptId);
    handlePreviewReceipt(receiptId);
  };

  // Toggle row expansion
  const toggleRowExpansion = (paymentId: number) => {
    setExpandedRows((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId],
    );
  };

  const loadPayments = async () => {
    try {
      const response = await paymentApi.getPayments();
      if (response.success) {
        setPayments(response.data || []);
      }
    } catch (error) {
      console.error("Error loading payments:", error);
    }
  };

  const loadReceipts = async () => {
    try {
      const response = await paymentApi.getReceipts();
      if (response.success) {
        setReceipts(response.data || []);
      }
    } catch (error) {
      console.error("Error loading receipts:", error);
    }
  };

  const loadDemands = async () => {
    try {
      // console.log(' demands...');
      const response = await paymentApi.getDemands();
      // console.log('Demands response:', response);

      if (response && response.data) {
        // Enhance demands with tenant room/bed info and ensure numbers
        const enhancedDemands = await Promise.all(
          response.data.map(async (demand: DemandPayment) => {
            // Ensure amount and late_fee are numbers
            const processedDemand = {
              ...demand,
              amount: Number(demand.amount),
              late_fee: Number(demand.late_fee || 0),
            };

            try {
              const bedAssignment = await paymentApi.getTenantBedAssignment(
                demand.tenant_id,
              );
              return {
                ...processedDemand,
                room_number: bedAssignment?.room?.room_number,
                bed_number: bedAssignment?.bed_number,
                property_name: bedAssignment?.property?.name,
              };
            } catch (error) {
              console.warn(
                `Could not fetch bed assignment for tenant ${demand.tenant_id}:`,
                error,
              );
              return processedDemand;
            }
          }),
        );
        setDemands(enhancedDemands);
      } else {
        console.warn("No demands data received:", response);
        setDemands([]);
      }
    } catch (error) {
      console.error("Error loading demands:", error);
      setDemands([]);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await listTenants({ is_active: true });
      if (response.success && response.data) {
        setTenants(response.data);
      }
    } catch (error) {
      console.error("Error loading tenants:", error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await paymentApi.getPaymentStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Add this function to fetch security deposit info
  const fetchSecurityDepositInfo = async (tenantId: number) => {
    try {
      const response = await paymentApi.getSecurityDepositInfo(tenantId);
      if (response.success) {
        setSecurityDepositInfo(response.data);
      }
    } catch (error) {
      console.error("Error fetching security deposit info:", error);
    }
  };

  // Update handleTenantSelect to fetch deposit info
  const handleTenantSelect = async (tenantId: string) => {
    setNewPayment((prev) => ({
      ...prev,
      tenant_id: tenantId,
      booking_id: null,
      amount: "",
      payment_mode: "cash",
      bank_name: "",
      transaction_id: "",
      remark: "",
    }));
    setPaymentFormData(null);
    setSecurityDepositInfo(null); // Reset deposit info
    setSelectedPaymentMonth("");

    if (!tenantId) return;

    setBookingLoading(true);
    try {
      const formResponse = await paymentApi.getTenantPaymentFormData(
        parseInt(tenantId),
      );

      console.log("🔍 API Response:", formResponse);
      console.log("🔍 offer_info:", formResponse.data?.offer_info);

      if (formResponse.success) {
        setPaymentFormData(formResponse.data);
      }

      // Also fetch security deposit info
      await fetchSecurityDepositInfo(parseInt(tenantId));
    } catch (error) {
      console.error("Error loading tenant details:", error);
      toast.error("Failed to load tenant details");
    } finally {
      setBookingLoading(false);
    }
  };

  // Add this function to handle payment type change with proper auto-fill
  const handlePaymentTypeChange = (value: string) => {
    setNewPayment((prev) => ({ ...prev, payment_type: value }));

    // Reset month selection
    setSelectedPaymentMonth("");

    if (value === "rent") {
      // For rent: Auto-fill with total pending amount from paymentFormData
      if (paymentFormData?.total_pending) {
        setNewPayment((prev) => ({
          ...prev,
          amount: paymentFormData.total_pending.toString(),
        }));
        // toast.info(`Total rent pending: ₹${paymentFormData.total_pending.toLocaleString()}`);
      }
    } else if (value === "security_deposit") {
      // For security deposit: Auto-fill with pending amount from securityDepositInfo
      if (securityDepositInfo?.pending_amount) {
        setNewPayment((prev) => ({
          ...prev,
          amount: securityDepositInfo.pending_amount.toString(),
        }));
        // toast.info(`Security deposit pending: ₹${securityDepositInfo.pending_amount.toLocaleString()}`);
      }
    }
  };

  // Add this handler for demand payment type change
  const handleDemandPaymentTypeChange = async (value: string) => {
    setDemandPayment((prev) => ({ ...prev, payment_type: value }));

    if (value === "security_deposit" && demandPayment.tenant_id) {
      // Use the existing getSecurityDepositInfo function
      try {
        const response = await paymentApi.getSecurityDepositInfo(
          parseInt(demandPayment.tenant_id),
        );
        if (response.success) {
          setSecurityDepositInfo(response.data);
          // Auto-fill amount with pending amount
          setDemandPayment((prev) => ({
            ...prev,
            amount: response.data.pending_amount,
          }));
        }
      } catch (error) {
        console.error("Error fetching security deposit info:", error);
      }
    } else if (value === "rent" && paymentFormData?.suggested_amount) {
      // Auto-fill with suggested rent amount
      setDemandPayment((prev) => ({
        ...prev,
        amount: paymentFormData.suggested_amount,
      }));
    }
  };

  // Handle demand tenant select - using existing functions
  const handleDemandTenantSelect = async (tenantId: string) => {
    setDemandPayment((prev) => ({ ...prev, tenant_id: tenantId }));
    setPaymentFormData(null);
    setSecurityDepositInfo(null);

    if (!tenantId) return;

    setBookingLoading(true);
    try {
      // Fetch rent payment data using existing function
      const formResponse = await paymentApi.getTenantPaymentFormData(
        parseInt(tenantId),
      );
      if (formResponse.success) {
        setPaymentFormData(formResponse.data);
      }

      // Fetch security deposit info using existing function
      const depositResponse = await paymentApi.getSecurityDepositInfo(
        parseInt(tenantId),
      );
      if (depositResponse.success) {
        setSecurityDepositInfo(depositResponse.data);
      }

      // Auto-fill based on current payment type
      if (demandPayment.payment_type === "rent" && formResponse.success) {
        setDemandPayment((prev) => ({
          ...prev,
          amount: formResponse.data.suggested_amount,
        }));
      } else if (
        demandPayment.payment_type === "security_deposit" &&
        depositResponse.success
      ) {
        setDemandPayment((prev) => ({
          ...prev,
          amount: depositResponse.data.pending_amount,
        }));
      }
    } catch (error) {
      console.error("Error loading tenant details:", error);
      toast.error("Failed to load tenant details");
    } finally {
      setBookingLoading(false);
    }
  };

  // Add this function to handle receipt preview
  const handlePreviewReceipt = async (receiptId: number) => {
    //  console.log('Preview receipt clicked:', receiptId);
    try {
      const response = await paymentApi.getReceiptById(receiptId);
      // console.log('Receipt data response:', response);
      if (response.success) {
        setSelectedReceipt(response.data);
        setIsReceiptPreviewOpen(true);
        // console.log('Receipt preview opened');
      } else {
        toast.error("Failed to load receipt");
      }
    } catch (error) {
      console.error("Error loading receipt:", error);
      toast.error("Failed to load receipt");
    }
  };

  

  // Update the handleAddPayment function
  const handleAddPayment = async () => {
    if (!newPayment.tenant_id || !newPayment.amount) {
      toast.error("Please select a tenant and enter an amount");
      return;
    }

    try {
      // ✅ STEP 1: Fetch latest rent payment
      const latestPaymentRes = await getLatestRentPayment(
        parseInt(newPayment.tenant_id),
      );

      const isCurrentMonth = (() => {
  const today = new Date();

  const currentMonth = today.toLocaleString("default", { month: "long" });
  const currentYear = today.getFullYear();

  return (
    latestPaymentRes?.data.month === currentMonth &&
    Number(latestPaymentRes?.data.year) === currentYear
  );
})();
      console.log("latest payment api", latestPaymentRes);

      const latestPayment = latestPaymentRes?.data;
      // ✅ STEP 3: Calculate new balance
      const totalAmount = isCurrentMonth ? Number(latestPaymentRes.data.total_amount)  : 
        Number(latestPaymentRes.data.tenant_rent) +
          Number(latestPaymentRes.data.new_balance) || 0;
      const amount = parseFloat(newPayment.amount);
      const newBalance = isCurrentMonth ? Number(latestPayment.new_balance) - Number(amount) : Number(latestPayment.tenant_rent) + Number(latestPayment.new_balance) - Number(amount); 
      const previousBalance = Number(latestPaymentRes.data.new_balance) || 0;
      console.log("Calculated balances:", {totalAmount, previousBalance, newBalance});
      // Prepare payment data
      const paymentData: any = {
        tenant_id: parseInt(newPayment.tenant_id),
        booking_id: newPayment.booking_id,
        payment_type: newPayment.payment_type,
        amount: parseFloat(newPayment.amount),
        total_amount: totalAmount,
        previous_balance: previousBalance,
        new_balance: newBalance,
        discounted_amount: 0,
        payment_mode: newPayment.payment_mode,
        bank_name: newPayment.bank_name || null,
        transaction_id: newPayment.transaction_id || null,
        payment_date: newPayment.payment_date,
        remark: newPayment.remark || null,
      };
      console.log("Prepared payment data:", paymentData);

      // If a specific month is selected, add month information
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
          `Payment for ${paymentData.month} ${paymentData.year}` +
          (newPayment.remark ? ` - ${newPayment.remark}` : "");
      } else {
        // Default to current month
        const currentDate = new Date();
        paymentData.month = currentDate.toLocaleString("default", {
          month: "long",
        });
        paymentData.year = currentDate.getFullYear();
        paymentData.remark = newPayment.remark || null;
      }

      const response = await paymentApi.createPayment(paymentData);

      if (response.success && response.data) {
        if (proofFile) {
          await paymentApi.uploadPaymentProof(response.data.id, proofFile);
        }

        toast.success("Payment added successfully");

        // Refresh the payment form data
        if (newPayment.tenant_id) {
          const formResponse = await paymentApi.getTenantPaymentFormData(
            parseInt(newPayment.tenant_id),
          );
          if (formResponse.success) {
            setPaymentFormData(formResponse.data);
          }
        }

        setIsAddPaymentOpen(false);
        resetPaymentForm();
        await loadData();
      } else {
        toast.error(response.message || "Failed to add payment");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add payment");
    }
  };

  const handleDemandPayment = async () => {
    if (
      !demandPayment.tenant_id ||
      !demandPayment.amount ||
      !demandPayment.due_date
    ) {
      toast.error("Please select tenant, enter amount, and set due date");
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        tenant_id: parseInt(demandPayment.tenant_id),
        amount: demandPayment.amount,
        due_date: demandPayment.due_date,
        payment_type: demandPayment.payment_type,
        description: demandPayment.description,
        include_late_fee: demandPayment.include_late_fee,
        late_fee_amount: demandPayment.late_fee_amount,
        send_email: demandPayment.send_email,
        send_sms: demandPayment.send_sms,
      };

      const response = await paymentApi.createDemandPayment(payload);

      if (response.success) {
        toast.success("Payment demand sent to tenant successfully");
        setIsDemandPaymentOpen(false);
        resetDemandPaymentForm();
        await loadData();
      } else {
        toast.error(response.message || "Failed to create payment demand");
      }
    } catch (error: any) {
      console.error("Error creating demand:", error);
      toast.error(error.message || "Failed to create payment demand");
    } finally {
      setBookingLoading(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentFormData(null);
    setProofFile(null);
    setProofPreview(null);
    setSelectedPaymentMonth(""); // Reset month selection
    setNewPayment({
      tenant_id: "",
      booking_id: null,
      payment_type: "rent",
      amount: "",
      payment_mode: "cash",
      bank_name: "",
      transaction_id: "",
      payment_date: new Date().toISOString().split("T")[0],
      remark: "",
    });
  };

  // Reset demand payment form
  const resetDemandPaymentForm = () => {
    setPaymentFormData(null);
    setSecurityDepositInfo(null);
    setDemandPayment({
      tenant_id: "",
      payment_type: "rent",
      amount: 0,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      description: "",
      send_email: true,
      send_sms: false,
    });
  };
  // Payment action handlers
  // Add this handler
  const handleApproveClick = (payment: any) => {
    setApprovingPayment(payment);
    setIsApproveDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!approvingPayment) return;

    setActionLoading(true);
    try {
      const response = await paymentApi.approvePayment(approvingPayment.id, 1); // Replace 1 with actual user ID
      if (response.success) {
        toast.success("Payment approved successfully");
        setIsApproveDialogOpen(false);
        setApprovingPayment(null);
        await loadData(); // Refresh data
      } else {
        toast.error(response.message || "Failed to approve payment");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to approve payment");
    } finally {
      setActionLoading(false);
    }
  };

  // Add useEffect to fetch rejection reasons
  useEffect(() => {
    fetchRejectionReasons();
  }, []);

  // Function to fetch rejection reasons
  const fetchRejectionReasons = async () => {
    try {
      const response = await getPaymentRejectionReasons();
      if (response.success) {
        setRejectionReasons(response.data);
      }
    } catch (error) {
      console.error("Error fetching rejection reasons:", error);
    }
  };

  // Update handleRejectPayment function
  const handleRejectPayment = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      const response = await paymentApi.rejectPayment(
        selectedPayment.id,
        rejectionReason,
        selectedRejectionCategory ? parseInt(selectedRejectionCategory) : null,
        1,
      );
      if (response.success) {
        toast.success("Payment rejected successfully");
        setIsRejectDialogOpen(false);
        setSelectedPayment(null);
        setRejectionReason("");
        setSelectedRejectionCategory("");
        await loadData();
      } else {
        toast.error(response.message || "Failed to reject payment");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject payment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePayment = async () => {
    setActionLoading(true);
    try {
      const response = await paymentApi.deletePayment(selectedPayment.id);
      if (response.success) {
        toast.success("Payment deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedPayment(null);
        await loadData(); // Refresh data
      } else {
        toast.error(response.message || "Failed to delete payment");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete payment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePayment = async (updatedData: any) => {
    setActionLoading(true);
    try {
      const response = await paymentApi.updatePayment(
        selectedPayment.id,
        updatedData,
      );
      if (response.success) {
        toast.success("Payment updated successfully");
        setIsEditDialogOpen(false);
        setSelectedPayment(null);
        await loadData(); // Refresh data
      } else {
        toast.error(response.message || "Failed to update payment");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update payment");
    } finally {
      setActionLoading(false);
    }
  };

  // Add this function in your PaymentsPage component
  const groupPaymentsByTenant = (payments: any[]) => {
    const grouped: { [key: string]: any } = {};

    payments.forEach((payment) => {
      const tenantId = payment.tenant_id;
      const tenantName = getTenantName(tenantId);
      const tenantPhone = getTenantPhone(tenantId);

      if (!grouped[tenantId]) {
        grouped[tenantId] = {
          tenant_id: tenantId,
          tenant_name: tenantName,
          tenant_phone: tenantPhone,
          total_amount: 0,
          payment_count: 0,
          last_payment_date: null,
          payments: [],
          approved_count: 0,
          pending_count: 0,
          rejected_count: 0,
        };
      }

      // Add payment to array
      grouped[tenantId].payments.push(payment);

      // SUM the amount correctly (convert to number)
      grouped[tenantId].total_amount += Number(payment.amount) || 0;

      // Increment payment count
      grouped[tenantId].payment_count += 1;

      // Count by status
      if (payment.status === "approved") grouped[tenantId].approved_count += 1;
      else if (payment.status === "pending")
        grouped[tenantId].pending_count += 1;
      else if (payment.status === "rejected")
        grouped[tenantId].rejected_count += 1;

      // Track last payment date
      const paymentDate = new Date(payment.payment_date);
      if (
        !grouped[tenantId].last_payment_date ||
        paymentDate > new Date(grouped[tenantId].last_payment_date)
      ) {
        grouped[tenantId].last_payment_date = payment.payment_date;
      }
    });

    return Object.values(grouped);
  };

  // Add this function to fetch settings
  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const settingsData = await getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  // Call fetchSettings when component mounts
  useEffect(() => {
    fetchSettings();
  }, []);

  // Get settings values with defaults
  const siteName = settings["site_name"]?.value || "ROOMAC";
  const siteTagline =
    settings["site_tagline"]?.value || "Premium Living Spaces";
  const companyLogo = settings["logo_header"]?.value
    ? `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${settings["logo_header"].value}`
    : null;
  const contactAddress = settings["contact_address"]?.value || "";
  const contactPhone = settings["contact_phone"]?.value || "";
  const contactEmail = settings["contact_email"]?.value || "";

  const getTenantName = (tenantId: number) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.full_name || "Unknown Tenant";
  };

  const getTenantPhone = (tenantId: number) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.phone || "";
  };

  const getTenantSalutation = (tenantId: number) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.salutation || "";
  };

  const getTenantCountryCode = (tenantId: number) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.country_code || "+91";
  };

  // ===== ADD THIS AFTER YOUR EXISTING FUNCTIONS (around line 200) =====
  const handleSort = (field: keyof any) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter payments based on column filters
  const columnFilteredPayments = payments.filter((payment) => {
    const matchesDate =
      !columnFilters.payment_date ||
      new Date(payment.payment_date).toISOString().split("T")[0] ===
        columnFilters.payment_date;

    const matchesTenant =
      !columnFilters.tenant_name ||
      getTenantName(payment.tenant_id)
        .toLowerCase()
        .includes(columnFilters.tenant_name.toLowerCase());

    const matchesMinAmount =
      !columnFilters.min_amount ||
      payment.amount >= parseFloat(columnFilters.min_amount);

    const matchesMaxAmount =
      !columnFilters.max_amount ||
      payment.amount <= parseFloat(columnFilters.max_amount);

    const matchesMode =
      columnFilters.payment_mode === "all" ||
      payment.payment_mode === columnFilters.payment_mode;

    const matchesTransactionId =
      !columnFilters.transaction_id ||
      (payment.transaction_id &&
        payment.transaction_id
          .toLowerCase()
          .includes(columnFilters.transaction_id.toLowerCase()));

    const matchesMonth =
      !columnFilters.month ||
      `${payment.month} ${payment.year}`
        .toLowerCase()
        .includes(columnFilters.month.toLowerCase());

    const matchesStatus =
      columnFilters.status === "all" ||
      (payment.status || "pending") === columnFilters.status;

    const matchesRemark =
      !columnFilters.remark ||
      (payment.remark &&
        payment.remark
          .toLowerCase()
          .includes(columnFilters.remark.toLowerCase()));

    return (
      matchesDate &&
      matchesTenant &&
      matchesMinAmount &&
      matchesMaxAmount &&
      matchesMode &&
      matchesTransactionId &&
      matchesMonth &&
      matchesStatus &&
      matchesRemark
    );
  });

  // Sort payments
  const sortedPayments = [...columnFilteredPayments].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
  // ===== END OF ADDITION =====

  const getDemandStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: any }> = {
      pending: {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock3,
      },
      paid: {
        className: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle2,
      },
      partial: {
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: AlertCircle,
      },
      overdue: {
        className: "bg-red-100 text-red-800 border-red-200",
        icon: AlertTriangle,
      },
      cancelled: {
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: XCircleIcon,
      },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge
        variant="outline"
        className={`${config.className} flex items-center gap-1 text-xs px-2 py-1`}
      >
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  // Bed Assignment Details Component - Table Row Format
  const BedAssignmentTable = ({
    formData,
  }: {
    formData: PaymentFormData | null;
  }) => {
    console.log("bed assigment form data", formData);
    if (!formData?.room_info) return null;

    return (
      <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            <Bed className="h-3.5 w-3.5" />
            Bed Assignment Details
          </h4>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
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
                  {formData.room_info.property_name}
                </td>
                <td className="p-2 text-sm">
                  {formData.room_info.room_number}
                </td>
                <td className="p-2 text-sm font-medium">
                  #{formData.room_info.bed_number}
                </td>
                <td className="p-2 text-sm capitalize">
                  {formData.room_info.bed_type}
                </td>
                <td className="p-2 text-sm font-semibold text-green-600">
                  ₹{formData.monthly_rent.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Rent Summary Table Component
  const RentSummaryTable = ({ formData }: { formData: any }) => {
    if (!formData) return null;
    console.log("Rendering RentSummaryTable with formData:", formData);

    const months = formData.month_wise_history || [];
    const groupedPayments = formData.groupedPayments || [];
    const originalMonthlyRent = formData.monthly_rent;
    const offerInfo = formData.offer_info;
    const discountedFirstMonthRent = formData.discounted_first_month_rent;

    return (
      <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            <IndianRupee className="h-3.5 w-3.5" />
            Rent History Since Joining
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {months.length > 0
              ? `Showing from ${months[0]?.month} ${months[0]?.year} to ${months[months.length - 1]?.month} ${months[months.length - 1]?.year}`
              : "No history available"}
          </p>
        </div>

        <div className="p-4 max-h-[300px] overflow-y-auto">
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
              {groupedPayments.map((month, index) => {
                return (
                  <tr
                    key={`${index}-${index}`}
                    className={`border-t border-slate-200 ${
                      month.isCurrentMonth ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="p-2 text-sm">
                      {month.month} {month.year}
                    </td>
                    <td className="p-2 text-right">₹{month.total_amount}</td>
                    <td className="p-2 text-right text-green-600 font-medium">
                      ₹{month.amount}
                    </td>
                    <td className="p-2 text-right text-red-500">{month.discount_amount}</td>
                    <td className="p-2 text-right font-medium">₹{month.new_balance}</td>
                    <td className="p-2 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          month.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : month.status === "pending"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {month.status || "pending"}
                      </span>
                    </td>
                  </tr>
                );
                // For months with multiple payments, show each payment
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-50 border-t border-slate-200">
          <div className="bg-white p-2 rounded border border-slate-200">
            <p className="text-xs text-slate-500">Months Since Joining</p>
            <p className="text-lg font-bold text-slate-700">{months.length}</p>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200">
            <p className="text-xs text-slate-500">Monthly Rent</p>
            <p className="text-lg font-bold text-green-600">
              ₹{originalMonthlyRent?.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200">
            <p className="text-xs text-slate-500">Total Paid</p>
            <p className="text-lg font-bold text-blue-600">
              ₹{formData.total_paid?.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200">
            <p className="text-xs text-slate-500">Total Pending</p>
            <p className="text-lg font-bold text-amber-600">
              ₹{formData.total_pending?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  {
    /* Security Deposit Info - Show when payment type is security_deposit */
  }
  {
    newPayment.payment_type === "security_deposit" && securityDepositInfo && (
      <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            <IndianRupee className="h-3.5 w-3.5" />
            Security Deposit Information
          </h4>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Property</p>
              <p className="text-sm font-medium">
                {securityDepositInfo.property_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Security Deposit</p>
              <p className="text-sm font-bold text-blue-600">
                ₹{securityDepositInfo.security_deposit.toLocaleString()}
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

          {securityDepositInfo.is_fully_paid && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 text-center flex items-center justify-center gap-1">
                <span>✅</span> Security deposit is fully paid!
              </p>
            </div>
          )}

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
    );
  }

  // Filtered payments
  const filteredPayments = payments.filter((payment) => {
    const tenantName = getTenantName(payment.tenant_id).toLowerCase();

    const matchesDate =
      !filters.date ||
      format(new Date(payment.payment_date), "dd/MM/yy").includes(filters.date);

    const matchesTenant =
      !filters.tenant || tenantName.includes(filters.tenant.toLowerCase());

    const matchesRemark =
      !filters.remark ||
      (payment.remark &&
        payment.remark.toLowerCase().includes(filters.remark.toLowerCase()));

    const matchesAmount =
      !filters.amount || payment.amount.toString().includes(filters.amount);

    const matchesMethod =
      !filters.method ||
      payment.payment_mode.toLowerCase().includes(filters.method.toLowerCase());

    const matchesTransactionId =
      !filters.transactionId ||
      (payment.transaction_id &&
        payment.transaction_id
          .toLowerCase()
          .includes(filters.transactionId.toLowerCase()));

    return (
      matchesDate &&
      matchesTenant &&
      matchesRemark &&
      matchesAmount &&
      matchesMethod &&
      matchesTransactionId
    );
  });

  // Filtered demands - with null checks to prevent crashes
  const filteredDemands = demands.filter((demand) => {
    const tenantName = getTenantName(demand.tenant_id).toLowerCase();

    const matchesStatus =
      demandFilters.status === "all" ||
      !demandFilters.status ||
      demand.status === demandFilters.status;

    const matchesTenant =
      !demandFilters.tenant ||
      tenantName.includes(demandFilters.tenant.toLowerCase());

    // Date filter (created_at)
    const matchesDate =
      !demandFilters.date ||
      format(new Date(demand.created_at), "dd/MM/yy").includes(demandFilters.date);

    // Due date range filters
    const matchesFromDate =
      !demandFilters.from_date ||
      new Date(demand.due_date) >= new Date(demandFilters.from_date);
    const matchesToDate =
      !demandFilters.to_date ||
      new Date(demand.due_date) <= new Date(demandFilters.to_date);

    // Amount filter
    const matchesAmount =
      !demandFilters.amount ||
      Number(demand.amount).toString().includes(demandFilters.amount.toString());

    // Room/Bed filter
    const matchesRoom =
      !demandFilters.room ||
      (demand.room_number &&
        demand.room_number.toString().toLowerCase().includes(demandFilters.room.toLowerCase())) ||
      (demand.bed_number &&
        demand.bed_number.toString().includes(demandFilters.room));

    return (
      matchesStatus &&
      matchesTenant &&
      matchesDate &&
      matchesFromDate &&
      matchesToDate &&
      matchesAmount &&
      matchesRoom
    );
  });

  const handleUpdateDemandStatus = async (
    demandId: number,
    newStatus: string,
  ) => {
    try {
      const response = await paymentApi.updateDemandStatus(demandId, newStatus);
      if (response.success) {
        toast.success(`Demand status updated to ${newStatus}`);
        // Refresh demands list
        loadDemands();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating demand status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="bg-slate-50">
      <div className="p-0 sm:p-0 md:p-0 space-y-2 sm:space-y-3">
        {/* Compact Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 sticky top-16 z-10">
          <StatCard
            title="Collected"
            value={`₹${stats?.total_collected?.toLocaleString() || "0"}`}
            icon={IndianRupee}
            color="bg-blue-600"
            bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          />
          <StatCard
            title="This Month"
            value={`₹${stats?.current_month_collected?.toLocaleString() || "0"}`}
            icon={TrendingUp}
            color="bg-green-600"
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
          />
          <StatCard
            title="Transactions"
            value={stats?.total_transactions || 0}
            icon={CreditCard}
            color="bg-purple-600"
            bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          />
          <StatCard
            title="Rent Collected"
            value={`₹${stats?.rent_collected?.toLocaleString() || "0"}`}
            icon={Banknote}
            color="bg-amber-600"
            bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
          />
        </div>

        {/* Tabs Container */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sticky top-28 z-10 bg-slate-50 py-2">
            <TabsList className="h-8 w-full sm:w-auto inline-flex sm:grid sm:grid-cols-3 overflow-x-auto hide-scrollbar">
              <TabsTrigger
                value="payments"
                className="text-[9px] sm:text-xs px-1.5 sm:px-3 py-1 whitespace-nowrap"
              >
                Payments Management
              </TabsTrigger>
              <TabsTrigger
                value="receipts"
                className="text-[9px] sm:text-xs px-1.5 sm:px-3 py-1 whitespace-nowrap"
              >
                Payment Receipts
              </TabsTrigger>
              <TabsTrigger
                value="demands"
                className="text-[9px] sm:text-xs px-1.5 sm:px-3 py-1 whitespace-nowrap"
              >
                Demands Payment
              </TabsTrigger>
            </TabsList>

            <div className="flex justify-end gap-2">
              {can("create_payments") && (
                <Button
                  size="sm"
                  className="h-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm flex-1 sm:flex-none"
                  onClick={() => {
                    resetPaymentForm(); // Reset form first
                    setIsAddPaymentOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Add Payment</span>
                </Button>
              )}
              {can("send_demand_payment") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white flex-1 sm:flex-none"
                  onClick={() => setIsDemandPaymentOpen(true)}
                >
                  <Bell className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Demand Payment</span>
                </Button>
              )}
            </div>
          </div>

          {/* Payments Tab Content */}
          {/* Payments Tab Content */}
          <TabsContent value="payments" className="space-y-2 mt-0">
            <PaymentsTable
              payments={payments}
              loading={loading}
              filters={filters}
              setFilters={setFilters}
              getTenantName={getTenantName}
              getTenantPhone={getTenantPhone}
              getTenantSalutation={getTenantSalutation} // This requires the function to be defined
              getTenantCountryCode={getTenantCountryCode} // This requires the function to be defined
              tenants={tenants}
              onApprove={handleApproveClick}
              onReject={(payment) => {
                setSelectedPayment(payment);
                setIsRejectDialogOpen(true);
              }}
              onEdit={(payment) => {
                setSelectedPayment(payment);
                setNewPayment({
                  tenant_id: payment.tenant_id.toString(),
                  booking_id: payment.booking_id,
                  payment_type: payment.payment_type,
                  amount: payment.amount.toString(),
                  payment_mode: payment.payment_mode,
                  bank_name: payment.bank_name || "",
                  transaction_id: payment.transaction_id || "",
                  payment_date: payment.payment_date.split("T")[0],
                  remark: payment.remark || "",
                });
                setIsEditDialogOpen(true);
              }}
              onDelete={(payment) => {
                setSelectedPayment(payment);
                setIsDeleteDialogOpen(true);
              }}
              actionLoading={actionLoading}
              onViewReceipt={handlePreviewReceipt}
              setActiveTab={setActiveTab}
              expandedRows={expandedRows}
              onToggleExpand={toggleRowExpansion}
              groupPaymentsByTenant={groupPaymentsByTenant}
              setIsAddPaymentOpen={setIsAddPaymentOpen}
              // New props for column filters
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              handleSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              canApprove={can("approve_payments")}
              canReject={can("reject_payments")}
              canEdit={can("edit_payments")}
              canDelete={can("delete_payments")}
                           canViewReceipts={can("view_receipts")}
              showFilterSidebar={showPaymentFilterSidebar}
              setShowFilterSidebar={setShowPaymentFilterSidebar}
            />

          </TabsContent>

          {/* Demands Tab Content */}
          {/* Demands Tab Content */}
          {/* Demands Tab Content */}
         <TabsContent value="demands" className="mt-0">
            <Card className="border-0 shadow-sm overflow-hidden flex flex-col" style={{height:'calc(100vh - 280px)'}}>
              <CardContent className="p-0 flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                 <div className="overflow-x-auto flex-1 min-h-0 flex flex-col min-w-0">
  <div className="min-w-[780px] flex flex-col flex-1 min-h-0">
    <div className="flex-shrink-0">
    <Table>
                      {/* COMPACT HEADER WITH SEARCH BARS */}
                      <TableHeader className="bg-gray-200 border-b border-gray-300">
                        <TableRow className="hover:bg-transparent">
                          {/* Date Column */}
                          <TableHead className="w-[100px] py-2 px-2 bg-gray-200">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                                Date
                              </span>
                              <Input
                                placeholder="dd/mm/yy"
                                className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                                value={demandFilters.date || ""}
                                onChange={(e) =>
                                  setDemandFilters({
                                    ...demandFilters,
                                    date: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </TableHead>

                          {/* Tenant Column - Updated with salutation and phone */}
                          <TableHead className="w-[200px] py-2 px-2 bg-gray-200">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                                Tenant
                              </span>
                              <Input
                                placeholder="Search tenant..."
                                className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                                value={demandFilters.tenant || ""}
                                onChange={(e) =>
                                  setDemandFilters({
                                    ...demandFilters,
                                    tenant: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </TableHead>

                          {/* Amount Column */}
                          <TableHead className="w-[100px] py-2 px-2 bg-gray-200 text-right">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                                Amount
                              </span>
                              <Input
                                placeholder="Search..."
                                type="number"
                                className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 text-right font-normal w-full"
                                value={demandFilters.amount || ""}
                                onChange={(e) =>
                                  setDemandFilters({
                                    ...demandFilters,
                                    amount: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </TableHead>

                          {/* Due Date Column */}
                          <TableHead className="w-[100px] py-2 px-2 bg-gray-200">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                                Due Date
                              </span>
                              <Input
                                type="date"
                                className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                                value={demandFilters.from_date || ""}
                                onChange={(e) =>
                                  setDemandFilters({
                                    ...demandFilters,
                                    from_date: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </TableHead>

                          {/* Status Column */}
                          <TableHead className="w-[100px] py-2 px-2 bg-gray-200">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                                Status
                              </span>
                              <Select
                                value={demandFilters.status || "all"}
                                onValueChange={(value) =>
                                  setDemandFilters({
                                    ...demandFilters,
                                    status: value,
                                  })
                                }
                              >
                                <SelectTrigger className="h-6 text-[10px] bg-white border-gray-300 px-2 font-normal w-full">
                                  <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all" className="text-xs">
                                    All
                                  </SelectItem>
                                  <SelectItem
                                    value="pending"
                                    className="text-xs"
                                  >
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="paid" className="text-xs">
                                    Paid
                                  </SelectItem>
                                  <SelectItem
                                    value="partial"
                                    className="text-xs"
                                  >
                                    Partial
                                  </SelectItem>
                                  <SelectItem
                                    value="overdue"
                                    className="text-xs"
                                  >
                                    Overdue
                                  </SelectItem>
                                  <SelectItem
                                    value="cancelled"
                                    className="text-xs"
                                  >
                                    Cancelled
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableHead>

                          {/* Room/Bed Column */}
                          <TableHead className="w-[100px] py-2 px-2 bg-gray-200">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                                Room/Bed
                              </span>
                              <Input
                                placeholder="Search..."
                                className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                                value={demandFilters.room || ""}
                                onChange={(e) =>
                                  setDemandFilters({
                                    ...demandFilters,
                                    room: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </TableHead>

                          {/* Actions Column */}
                          {/* Actions Column */}
                          <TableHead className="w-[80px] py-2 px-2 bg-gray-200 text-center">
                            <div className="flex flex-col gap-1 items-center">
                              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                                Actions
                              </span>
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => setShowDemandFilterSidebar(true)}
                                className="h-5 px-1.5 text-[9px] bg-blue-600 text-white hover:bg-blue-700 rounded w-full"
                              >
                                <Filter className="w-2.5 h-2.5 mr-0.5" />
                                Filter
                              </Button>
                            </div>
                          </TableHead>
                        </TableRow>
                     </TableHeader>
                    </Table>
                    </div>
                    <div className="overflow-y-auto flex-1 min-h-0">
                    <Table>
                      <colgroup>
                        <col style={{width:'140px'}} />
                        <col style={{width:'300px'}} />
                        <col style={{width:'170px'}} />
                        <col style={{width:'130px'}} />
                        <col style={{width:'22px'}} />
                        <col style={{width:'100px'}} />
                        <col style={{width:'100px'}} />
                      </colgroup>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-xs text-slate-500"
                            >
                              <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-2" />
                                Loading demands...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredDemands.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-xs text-slate-500"
                            >
                              <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                              No demands found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDemands.map((demand) => {
                            // Get salutation and country code for this tenant
                            const salutation = getTenantSalutation(
                              demand.tenant_id,
                            );
                            const countryCode = getTenantCountryCode(
                              demand.tenant_id,
                            );
                            const phone = getTenantPhone(demand.tenant_id);
                            const tenantName = getTenantName(demand.tenant_id);

                            return (
                              <TableRow
                                key={demand.id}
                                className="hover:bg-slate-50"
                              >
                                <TableCell className="py-2 text-xs whitespace-nowrap">
                                  {format(
                                    new Date(demand.created_at),
                                    "dd/MM/yy",
                                  )}
                                </TableCell>
                                <TableCell className="py-2">
                                  {/* Show salutation + full name */}
                                  <p className="text-xs font-medium">
                                    {salutation ? `${salutation} ` : ""}
                                    {tenantName}
                                  </p>
                                  {/* Show country code + phone number */}
                                  {phone && (
                                    <p className="text-[10px] text-slate-500">
                                      {countryCode || "+91"} {phone}
                                    </p>
                                  )}
                                </TableCell>
                                <TableCell className="py-2 text-xs font-medium">
                                  ₹
                                  {Number(demand.amount).toLocaleString(
                                    "en-IN",
                                  )}
                                </TableCell>
                                <TableCell className="py-2 text-xs whitespace-nowrap">
                                  <span
                                    className={
                                      new Date(demand.due_date) < new Date() &&
                                      demand.status === "pending"
                                        ? "text-red-600 font-medium"
                                        : ""
                                    }
                                  >
                                    {format(
                                      new Date(demand.due_date),
                                      "dd/MM/yy",
                                    )}
                                  </span>
                                </TableCell>
                                <TableCell className="py-2">
                                  {getDemandStatusBadge(demand.status)}
                                </TableCell>
                                <TableCell className="py-2 text-xs">
                                  {demand.room_number || "N/A"}{" "}
                                  {demand.bed_number
                                    ? `(B-${demand.bed_number})`
                                    : ""}
                                </TableCell>
                                <TableCell className="py-2">
                                  <Select
                                    value={demand.status}
                                    onValueChange={(newStatus) =>
                                      handleUpdateDemandStatus(
                                        demand.id,
                                        newStatus,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="h-7 w-24 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">
                                        Pending
                                      </SelectItem>
                                      <SelectItem value="paid">Paid</SelectItem>
                                      <SelectItem value="partial">
                                        Partial
                                      </SelectItem>
                                      <SelectItem value="overdue">
                                        Overdue
                                      </SelectItem>
                                      <SelectItem value="cancelled">
                                        Cancelled
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                     </TableBody>
                    </Table>
                     </div>
                  </div>
                  {/* end min-w wrapper */}
                </div>
                {/* end overflow-x wrapper */}
              </div>
            </CardContent>
          </Card>
            {/* Demands Filter Sidebar */}
<Sheet open={showDemandFilterSidebar} onOpenChange={setShowDemandFilterSidebar}>
  <SheetContent side="right" className="p-0 w-[85vw] min-w-[280px] sm:w-[360px]">
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Filter Demands</span>
        </div>
        <button onClick={() => setShowDemandFilterSidebar(false)} className="text-white/70 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-orange-700">Date</Label>
          <Input placeholder="dd/mm/yy" value={demandFilters.date || ""} onChange={(e) => setDemandFilters({...demandFilters, date: e.target.value})} className="h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-orange-700">Tenant</Label>
          <Input placeholder="Search tenant..." value={demandFilters.tenant || ""} onChange={(e) => setDemandFilters({...demandFilters, tenant: e.target.value})} className="h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-orange-700">Amount</Label>
          <Input type="number" placeholder="Search amount..." value={demandFilters.amount || ""} onChange={(e) => setDemandFilters({...demandFilters, amount: e.target.value})} className="h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-orange-700">Due Date From</Label>
          <Input type="date" value={demandFilters.from_date || ""} onChange={(e) => setDemandFilters({...demandFilters, from_date: e.target.value})} className="h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-orange-700">Due Date To</Label>
          <Input type="date" value={demandFilters.to_date || ""} onChange={(e) => setDemandFilters({...demandFilters, to_date: e.target.value})} className="h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-orange-700">Status</Label>
          <select value={demandFilters.status || "all"} onChange={(e) => setDemandFilters({...demandFilters, status: e.target.value})} className="w-full h-8 text-xs rounded-lg border border-gray-200 px-2 bg-white text-gray-700">
            <option value="all">All Status</option>
            {["pending","paid","partial","overdue","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-orange-700">Room/Bed</Label>
          <Input placeholder="Search room..." value={demandFilters.room || ""} onChange={(e) => setDemandFilters({...demandFilters, room: e.target.value})} className="h-8 text-xs" />
        </div>
      </div>
      <div className="border-t p-3 flex gap-2 bg-gray-50 flex-shrink-0">
        <Button variant="outline" size="sm" className="flex-1 text-xs h-8"
          onClick={() => setDemandFilters({ status: "", tenant: "", from_date: "", to_date: "", date: "", amount: "", room: "" })}>
          <RefreshCw className="w-3 h-3 mr-1" /> Reset
        </Button>
        <Button size="sm" className="flex-1 text-xs h-8 bg-orange-600 hover:bg-orange-700"
          onClick={() => setShowDemandFilterSidebar(false)}>
          Apply
        </Button>
      </div>
    </div>
  </SheetContent>
</Sheet>
          </TabsContent>

          {/* Receipts Tab Content */}
          <TabsContent value="receipts" className="mt-0">
            <ReceiptsTable
              receipts={receipts}
              loading={loading}
              getTenantName={getTenantName}
              getTenantSalutation={getTenantSalutation} // ADD THIS
              getTenantCountryCode={getTenantCountryCode} // ADD THIS
              getTenantPhone={getTenantPhone}
              tenants={tenants}
              highlightedReceipt={highlightedReceipt}
              onPreviewReceipt={handlePreviewReceipt}
              onDownloadReceipt={paymentApi.downloadReceipt}
              showFilterSidebar={showReceiptFilterSidebar}
              setShowFilterSidebar={setShowReceiptFilterSidebar}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Payment Dialog - Your existing code with horizontal layout */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] sm:max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white text-sm font-semibold flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-md">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  Record New Payment
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-xs mt-0.5">
                  Add a new payment record for a tenant
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-7 w-7"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Row 1: Tenant + Payment Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Tenant *
                </Label>
                <Select
                  value={newPayment.tenant_id}
                  onValueChange={handleTenantSelect}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                    <SelectValue placeholder="Choose a tenant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-slate-400" />
                          <span className="text-xs">{tenant.full_name}</span>
                          <span className="text-[10px] text-slate-400">
                            ({tenant.phone})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {bookingLoading && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-[10px]">Loading...</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Payment Type
                </Label>
                <Select
                  value={newPayment.payment_type}
                  onValueChange={handlePaymentTypeChange}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent" className="text-xs">
                      Rent
                    </SelectItem>
                    <SelectItem value="security_deposit" className="text-xs">
                      Security Deposit
                    </SelectItem>
                    <SelectItem value="maintenance" className="text-xs">
                      Maintenance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newPayment.payment_type === "rent" ? (
              <div className="space-y-2">
                {paymentFormData && (
                  <BedAssignmentTable formData={paymentFormData} />
                )}

                {/* Show Offer Banner if exists */}
                {paymentFormData?.offer_info && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-green-800">
                          🎉 Offer Applied: {paymentFormData.offer_info.code}
                        </p>
                        <p className="text-[10px] text-green-700">
                          First month rent: ₹
                          {paymentFormData.discounted_first_month_rent?.toLocaleString()}{" "}
                          (was ₹{paymentFormData.monthly_rent?.toLocaleString()}
                          )
                        </p>
                        <p className="text-[10px] text-green-600">
                          Subsequent months: ₹
                          {paymentFormData.monthly_rent?.toLocaleString()}/month
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentFormData && (
                  <RentSummaryTable formData={paymentFormData} />
                )}
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Pay For Month
                  </Label>
                  <Select
                    value={selectedPaymentMonth}
                    onValueChange={(value) => setSelectedPaymentMonth(value)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select month..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentFormData?.unpaid_months?.map((month: any) => (
                        <SelectItem
                          key={month.month_key}
                          value={month.month_key}
                          className="text-xs"
                        >
                          <div className="flex items-center justify-between w-full gap-4">
                            <div>
                              <span>
                                {month.month} {month.year}
                              </span>
                              {month.has_discount && (
                                <span className="ml-2 text-[10px] text-green-600">
                                  (Discounted: ₹{month.rent.toLocaleString()})
                                </span>
                              )}
                            </div>
                            <span className="text-amber-600 font-medium">
                              ₹{month.pending.toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {paymentFormData?.unpaid_months?.length === 0 && (
                    <p className="text-[10px] text-green-600">
                      All months paid! 🎉
                    </p>
                  )}
                </div>
              </div>
            ) : newPayment.payment_type === "security_deposit" ? (
              <div className="space-y-2">
                {paymentFormData && (
                  <BedAssignmentTable formData={paymentFormData} />
                )}
                {securityDepositInfo && (
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200">
                      <h4 className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <IndianRupee className="h-3 w-3" />
                        Security Deposit Info
                      </h4>
                    </div>
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-[10px] text-slate-500">Property</p>
                        <p className="text-xs font-medium">
                          {securityDepositInfo.property_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Total</p>
                        <p className="text-xs font-bold text-blue-600">
                          ₹
                          {securityDepositInfo.security_deposit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Paid</p>
                        <p className="text-xs font-medium text-green-600">
                          ₹{securityDepositInfo.paid_amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Pending</p>
                        <p className="text-xs font-bold text-amber-600">
                          ₹{securityDepositInfo.pending_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 pb-3">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>
                          {Math.round(
                            (securityDepositInfo.paid_amount /
                              securityDepositInfo.security_deposit) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 rounded-full h-1.5 transition-all duration-500"
                          style={{
                            width: `${(securityDepositInfo.paid_amount / securityDepositInfo.security_deposit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {paymentFormData && (
                  <BedAssignmentTable formData={paymentFormData} />
                )}
              </div>
            )}

            {/* Payment Details - 3x3 Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Amount */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Amount (₹) *
                </Label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    ₹
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newPayment.amount}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, amount: e.target.value })
                    }
                    className="pl-7 h-8 text-xs"
                  />
                </div>
                {newPayment.payment_type === "rent" &&
                  paymentFormData?.total_pending > 0 && (
                    <p className="text-[10px] text-blue-600">
                      Pending: ₹{paymentFormData.total_pending.toLocaleString()}
                    </p>
                  )}
              </div>

              {/* Payment Mode */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Payment Mode *
                </Label>
                <Select
                  value={newPayment.payment_mode}
                  onValueChange={(value) =>
                    setNewPayment({
                      ...newPayment,
                      payment_mode: value,
                      bank_name: "",
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash" className="text-xs">
                      💵 Cash
                    </SelectItem>
                    <SelectItem value="online" className="text-xs">
                      🌐 Online
                    </SelectItem>
                    <SelectItem value="bank_transfer" className="text-xs">
                      🏦 Bank Transfer
                    </SelectItem>
                    <SelectItem value="cheque" className="text-xs">
                      📝 Cheque
                    </SelectItem>
                    <SelectItem value="card" className="text-xs">
                      💳 Card
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Transaction Date
                </Label>
                <Input
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      payment_date: e.target.value,
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>

              {/* Bank Name - conditional */}
              {(newPayment.payment_mode === "bank_transfer" ||
                newPayment.payment_mode === "online") && (
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Bank Name
                  </Label>
                  <Input
                    placeholder="Enter bank name"
                    value={newPayment.bank_name}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        bank_name: e.target.value,
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              )}

              {/* Transaction ID - conditional */}
              {(newPayment.payment_mode === "online" ||
                newPayment.payment_mode === "bank_transfer" ||
                newPayment.payment_mode === "cheque") && (
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Transaction ID
                  </Label>
                  <Input
                    placeholder="Optional"
                    value={newPayment.transaction_id}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        transaction_id: e.target.value,
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              )}

              {/* Proof Upload - conditional */}
              {(newPayment.payment_mode === "online" ||
                newPayment.payment_mode === "bank_transfer") && (
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Proof
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start text-xs"
                    onClick={() =>
                      document.getElementById("proof-upload")?.click()
                    }
                  >
                    <Upload className="h-3 w-3 mr-1.5" />
                    {proofFile
                      ? proofFile.name.substring(0, 12) + "..."
                      : "Upload proof"}
                  </Button>
                  <input
                    type="file"
                    id="proof-upload"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProofFile(file);
                        if (file.type.startsWith("image/")) {
                          const reader = new FileReader();
                          reader.onloadend = () =>
                            setProofPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }
                    }}
                  />
                </div>
              )}

              {/* Remark - full width */}
              <div className="space-y-1 col-span-2 sm:col-span-3">
                <Label className="text-[11px] font-medium text-slate-600">
                  Remark
                </Label>
                <Input
                  placeholder="Add notes"
                  value={newPayment.remark}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, remark: e.target.value })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Proof Preview */}
            {proofPreview && (
              <div>
                <img
                  src={proofPreview}
                  alt="Preview"
                  className="h-16 rounded border"
                />
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 rounded-b-lg flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddPaymentOpen(false);
                  resetPaymentForm();
                }}
                className="text-xs h-8 px-4"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddPayment}
                className="text-xs h-8 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Add Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Demand Payment Dialog */}
      <Dialog open={isDemandPaymentOpen} onOpenChange={setIsDemandPaymentOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] sm:max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white text-sm font-semibold flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-md">
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  Demand Payment
                </DialogTitle>
                <DialogDescription className="text-orange-100 text-xs mt-0.5">
                  Create a payment request and notify the tenant
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-7 w-7"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Row 1: Tenant + Payment Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Tenant *
                </Label>
                <Select
                  value={demandPayment.tenant_id}
                  onValueChange={handleDemandTenantSelect}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem
                        key={tenant.id}
                        value={tenant.id.toString()}
                        className="text-xs"
                      >
                        {tenant.full_name} - {tenant.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Payment Type
                </Label>
                <Select
                  value={demandPayment.payment_type}
                  onValueChange={handleDemandPaymentTypeChange}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent" className="text-xs">
                      Rent
                    </SelectItem>
                    <SelectItem value="security_deposit" className="text-xs">
                      Security Deposit
                    </SelectItem>
                    <SelectItem value="maintenance" className="text-xs">
                      Maintenance
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bed Assignment */}
            {paymentFormData && (
              <BedAssignmentTable formData={paymentFormData} />
            )}

            {/* Conditional Sections */}
            {demandPayment.payment_type === "rent" ? (
              <div className="space-y-2">
                {paymentFormData && (
                  <RentSummaryTable formData={paymentFormData} />
                )}
                {paymentFormData?.suggested_amount > 0 && (
                  <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                    <p className="text-[11px] text-blue-700">
                      <span className="font-medium">Suggested:</span> ₹
                      {paymentFormData.suggested_amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ) : demandPayment.payment_type === "security_deposit" &&
              securityDepositInfo ? (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200">
                  <h4 className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <IndianRupee className="h-3 w-3" />
                    Security Deposit Info
                  </h4>
                </div>
                <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500">Property</p>
                    <p className="text-xs font-medium">
                      {securityDepositInfo.property_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Total</p>
                    <p className="text-xs font-bold text-blue-600">
                      ₹{securityDepositInfo.security_deposit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Paid</p>
                    <p className="text-xs font-medium text-green-600">
                      ₹{securityDepositInfo.paid_amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Pending</p>
                    <p className="text-xs font-bold text-amber-600">
                      ₹{securityDepositInfo.pending_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="px-3 pb-3">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.round(
                        (securityDepositInfo.paid_amount /
                          securityDepositInfo.security_deposit) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 rounded-full h-1.5 transition-all duration-500"
                      style={{
                        width: `${(securityDepositInfo.paid_amount / securityDepositInfo.security_deposit) * 100}%`,
                      }}
                    />
                  </div>
                  {securityDepositInfo.is_fully_paid && (
                    <p className="text-[10px] text-green-600 mt-1.5 text-center">
                      ✅ Fully paid!
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {/* 3-col grid: Amount + Due Date + Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Amount (₹) *
                </Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={demandPayment.amount || ""}
                  onChange={(e) =>
                    setDemandPayment({
                      ...demandPayment,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="h-8 text-xs"
                />
                {demandPayment.payment_type === "rent" &&
                  paymentFormData?.suggested_amount > 0 && (
                    <p className="text-[10px] text-blue-600">
                      Suggested: ₹
                      {paymentFormData.suggested_amount.toLocaleString()}
                    </p>
                  )}
                {demandPayment.payment_type === "security_deposit" &&
                  securityDepositInfo?.pending_amount > 0 && (
                    <p className="text-[10px] text-blue-600">
                      Pending: ₹
                      {securityDepositInfo.pending_amount.toLocaleString()}
                    </p>
                  )}
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Due Date *
                </Label>
                <Input
                  type="date"
                  value={demandPayment.due_date}
                  onChange={(e) =>
                    setDemandPayment({
                      ...demandPayment,
                      due_date: e.target.value,
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Description
                </Label>
                <Input
                  placeholder="Payment description"
                  value={demandPayment.description}
                  onChange={(e) =>
                    setDemandPayment({
                      ...demandPayment,
                      description: e.target.value,
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200">
              <Label className="text-[11px] font-medium text-slate-600 block mb-2">
                Send Notifications
              </Label>
              <div className="flex gap-5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={demandPayment.send_email}
                    onChange={(e) =>
                      setDemandPayment({
                        ...demandPayment,
                        send_email: e.target.checked,
                      })
                    }
                    className="w-3.5 h-3.5 accent-orange-500"
                  />
                  <span className="text-xs text-slate-600">Email</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={demandPayment.send_sms}
                    onChange={(e) =>
                      setDemandPayment({
                        ...demandPayment,
                        send_sms: e.target.checked,
                      })
                    }
                    className="w-3.5 h-3.5 accent-orange-500"
                  />
                  <span className="text-xs text-slate-600">SMS</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 rounded-b-lg flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDemandPaymentOpen(false);
                  resetDemandPaymentForm();
                }}
                className="text-xs h-8 px-4"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDemandPayment}
                disabled={
                  bookingLoading ||
                  !demandPayment.amount ||
                  !demandPayment.due_date
                }
                className="text-xs h-8 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1.5" />
                    Send Demand
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Payment Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Approve Payment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this payment? A receipt will be
              generated and the you will be able to view it .
            </DialogDescription>
          </DialogHeader>

          {approvingPayment && (
            <div className="py-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">
                  {getTenantName(approvingPayment.tenant_id)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Amount: ₹{approvingPayment.amount.toLocaleString()} •{" "}
                  {approvingPayment.month} {approvingPayment.year}
                </p>
                <p className="text-xs text-green-600">
                  Mode: {approvingPayment.payment_mode}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApproveDialogOpen(false);
                setApprovingPayment(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApprove}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Payment Dialog */}
      {/* Reject Payment Dialog - Updated with category selector */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Payment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this payment? Please select a
              reason category and provide details.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Reason Category Dropdown */}
            <div>
              <Label className="text-xs font-medium text-slate-700 mb-1 block">
                Rejection Category *
              </Label>
              <Select
                value={selectedRejectionCategory}
                onValueChange={setSelectedRejectionCategory}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select rejection category..." />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map((reason) => (
                    <SelectItem key={reason.id} value={reason.id.toString()}>
                      {reason.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Detailed Reason Textarea */}
            <div>
              <Label className="text-xs font-medium text-slate-700 mb-1 block">
                Detailed Reason *
              </Label>
              <Textarea
                placeholder="Please provide detailed reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="mt-1"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                This detailed reason will be shown to the tenant
              </p>
            </div>

            {selectedPayment && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Payment Details:</p>
                <p className="text-sm font-medium mt-1">
                  {getTenantName(selectedPayment.tenant_id)} - ₹
                  {selectedPayment.amount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedPayment.month} {selectedPayment.year} •{" "}
                  {selectedPayment.payment_mode}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setSelectedPayment(null);
                setRejectionReason("");
                setSelectedRejectionCategory("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectPayment}
              disabled={
                actionLoading ||
                !rejectionReason.trim() ||
                !selectedRejectionCategory
              }
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Payment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="py-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">
                  {getTenantName(selectedPayment.tenant_id)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Amount: ₹{selectedPayment.amount.toLocaleString()} •{" "}
                  {selectedPayment.month} {selectedPayment.year}
                </p>
                <p className="text-xs text-red-600">
                  Mode: {selectedPayment.payment_mode} • Status:{" "}
                  {selectedPayment.status || "pending"}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedPayment(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeletePayment}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog - Reuse your existing Add Payment dialog but with edit mode */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[600px] p-0 gap-0 overflow-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  Edit Payment
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-sm mt-1">
                  Update payment details
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Form Content - Similar to Add Payment but with selectedPayment data */}
          <div className="p-6">
            {/* Use the same form fields as Add Payment, but values are already set */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Tenant
                </Label>
                <Input
                  value={getTenantName(parseInt(newPayment.tenant_id))}
                  disabled
                  className="h-10 bg-slate-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Payment Type
                </Label>
                <Select
                  value={newPayment.payment_type}
                  onValueChange={(value) =>
                    setNewPayment({ ...newPayment, payment_type: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="security_deposit">
                      Security Deposit
                    </SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Details Grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Amount (₹) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, amount: e.target.value })
                    }
                    className="pl-8 h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Payment Mode *
                </Label>
                <Select
                  value={newPayment.payment_mode}
                  onValueChange={(value) =>
                    setNewPayment({ ...newPayment, payment_mode: value })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="online">🌐 Online</SelectItem>
                    <SelectItem value="bank_transfer">
                      🏦 Bank Transfer
                    </SelectItem>
                    <SelectItem value="cheque">📝 Cheque</SelectItem>
                    <SelectItem value="card">💳 Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Payment Date
                </Label>
                <Input
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      payment_date: e.target.value,
                    })
                  }
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Remark
                </Label>
                <Input
                  placeholder="Add notes"
                  value={newPayment.remark}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, remark: e.target.value })
                  }
                  className="h-10"
                />
              </div>
            </div>

            {/* Bank details fields if needed */}
            {(newPayment.payment_mode === "bank_transfer" ||
              newPayment.payment_mode === "online") && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Bank Name
                  </Label>
                  <Input
                    value={newPayment.bank_name}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        bank_name: e.target.value,
                      })
                    }
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Transaction ID
                  </Label>
                  <Input
                    value={newPayment.transaction_id}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        transaction_id: e.target.value,
                      })
                    }
                    className="h-10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg sticky bottom-0">
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetPaymentForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdatePayment(newPayment)}
                disabled={actionLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Payment"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog
        open={isReceiptPreviewOpen}
        onOpenChange={setIsReceiptPreviewOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            {/* Left side */}
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Payment Receipt
              </DialogTitle>
              <DialogDescription>
                Receipt #{selectedReceipt?.id} - {selectedReceipt?.month}{" "}
                {selectedReceipt?.year}
              </DialogDescription>
            </div>

            {/* Right side close icon - FIXED */}
            <button
              onClick={() => setIsReceiptPreviewOpen(false)} // ✅ FIXED: Use setIsReceiptPreviewOpen
              className="p-1 rounded-md hover:bg-gray-100 transition"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </DialogHeader>

          {selectedReceipt && (
            <div className="py-4">
              {/* Receipt Content */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                {/* Header with Logo */}
                <div className="text-center border-b border-slate-200 pb-4 mb-4">
                  {/* Logo Image */}
                  <div className="flex justify-center mb-2">
                    <img
                      src={companyLogo || "/default-logo.png"}
                      alt={siteName}
                      className="h-16 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        // Show text fallback
                        const parent = (e.target as HTMLImageElement)
                          .parentElement;
                        if (parent) {
                          const fallback = document.createElement("div");
                          fallback.className =
                            "text-2xl font-bold text-slate-800";
                          fallback.textContent = siteName;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {siteName}
                  </h2>
                  <p className="text-sm text-slate-500">{siteTagline}</p>
                  <p className="text-xs text-slate-400 mt-1">Payment Receipt</p>
                </div>

                {/* Receipt Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Receipt No.</p>
                    <p className="text-sm font-medium">#{selectedReceipt.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="text-sm font-medium">
                      {format(
                        new Date(selectedReceipt.payment_date),
                        "dd MMM yyyy",
                      )}
                    </p>
                  </div>
                </div>

                {/* Tenant Details */}
                <div className="bg-slate-50 p-3 rounded-lg mb-4">
                  <p className="text-xs font-medium text-slate-700 mb-2">
                    Tenant Details
                  </p>
                  <p className="text-sm">{selectedReceipt.tenant_name}</p>
                  {selectedReceipt.tenant_phone && (
                    <p className="text-xs text-slate-600">
                      {selectedReceipt.tenant_phone}
                    </p>
                  )}
                  {selectedReceipt.tenant_email && (
                    <p className="text-xs text-slate-600">
                      {selectedReceipt.tenant_email}
                    </p>
                  )}
                </div>

                {/* Property Details */}
                <div className="bg-slate-50 p-3 rounded-lg mb-4">
                  <p className="text-xs font-medium text-slate-700 mb-2">
                    Property Details
                  </p>
                  <p className="text-sm">
                    {selectedReceipt.property_name || "N/A"}
                  </p>
                  <p className="text-xs text-slate-600">
                    Room: {selectedReceipt.room_number || "N/A"}
                    {selectedReceipt.bed_number &&
                      ` • Bed #${selectedReceipt.bed_number}`}
                  </p>
                </div>

                {/* Payment Details */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-xs font-medium text-blue-700 mb-3">
                    Payment Details
                  </p>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-blue-600">Amount Paid:</span>
                    <span className="text-lg font-bold text-blue-700">
                      ₹{selectedReceipt.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-blue-600">Payment Mode:</span>
                    <span className="text-sm font-medium capitalize">
                      {selectedReceipt.payment_mode}
                    </span>
                  </div>
                  {selectedReceipt.bank_name && (
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-blue-600">Bank:</span>
                      <span className="text-sm">
                        {selectedReceipt.bank_name}
                      </span>
                    </div>
                  )}
                  {selectedReceipt.transaction_id && (
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-blue-600">
                        Transaction ID:
                      </span>
                      <span className="text-xs font-mono">
                        {selectedReceipt.transaction_id}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-xs text-blue-600">Period:</span>
                    <span className="text-sm">
                      {selectedReceipt.month} {selectedReceipt.year}
                    </span>
                  </div>
                </div>

                {/* Remark if exists */}
                {selectedReceipt.remark && (
                  <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                    <p className="text-xs font-medium text-yellow-700 mb-1">
                      Remark:
                    </p>
                    <p className="text-sm text-yellow-800">
                      {selectedReceipt.remark}
                    </p>
                  </div>
                )}

                {/* Contact Information */}
                <div className="text-center text-xs text-slate-400 mt-4 pt-4 border-t border-slate-200">
                  <p>{contactAddress}</p>
                  <p className="mt-1">
                    Tel: {contactPhone} | Email: {contactEmail}
                  </p>
                  <p className="mt-1">
                    This is a computer generated receipt. No signature required.
                  </p>
                  <p className="mt-1">
                    Generated on:{" "}
                    {format(
                      new Date(selectedReceipt.created_at),
                      "dd MMM yyyy, hh:mm a",
                    )}
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => paymentApi.downloadReceipt(selectedReceipt.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReceiptPreviewOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
  <Card className={`${bgColor} border-0 shadow-sm`}>
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
            {title}
          </p>
          <p className="text-sm sm:text-base font-bold text-slate-800">
            {value}
          </p>
        </div>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Add PaymentStatusBadge HERE - outside PaymentsPage
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { className: string; icon: any }> = {
    approved: {
      className: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle2,
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    rejected: {
      className: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
    },
  };

  const config = variants[status] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} flex items-center gap-1 text-xs px-2 py-1`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};

// Payments Table Component
// ===== REPLACE THE ENTIRE PaymentsTable COMPONENT WITH THIS (around line 1400-1800) =====
// Payments Table Component - Compact like maintenance
// Payments Table Component - Maintenance style header with search bars
// Update the PaymentsTable component - modify the Tenant column section
const PaymentsTable = ({
  payments,
  loading,
  filters,
  setFilters,
  getTenantName,
  getTenantPhone,
  getTenantSalutation, // RECEIVE as prop
  getTenantCountryCode, // RECEIVE as prop
  tenants, // RECEIVE as prop
  onApprove,
  onReject,
  onEdit,
  onDelete,
  actionLoading,
  onViewReceipt,
  setActiveTab,
  expandedRows,
  onToggleExpand,
  groupPaymentsByTenant,
  setIsAddPaymentOpen,
  // New props for column filters
  columnFilters,
  setColumnFilters,
  handleSort,
  sortField,
  sortDirection,
  canApprove,
  canReject,
  canEdit,
  canDelete,
  canViewReceipts,
  showFilterSidebar,
  setShowFilterSidebar,
}: any) => {
  // Group payments by tenant using the passed function
  const tenantGroups = groupPaymentsByTenant(payments).map((group: any) => ({
    ...group,
    salutation: getTenantSalutation(group.tenant_id),
    country_code: getTenantCountryCode(group.tenant_id),
  }));

  // Filter groups based on column filters
  const filteredGroups = tenantGroups.filter((group: any) => {
    // Filter by tenant name (including salutation)
    if (columnFilters?.tenant_name) {
      const fullName = `${group.salutation} ${group.tenant_name}`.toLowerCase();
      if (!fullName.includes(columnFilters.tenant_name.toLowerCase())) {
        return false;
      }
    }

    // Filter by payment count
    if (columnFilters?.payment_count) {
      const count = parseInt(columnFilters.payment_count);
      if (!isNaN(count) && group.payment_count !== count) {
        return false;
      }
    }

    // Filter by total amount
    if (columnFilters?.amount) {
      const searchAmount = columnFilters.amount.trim();
      if (searchAmount) {
        const amountString = group.total_amount.toString();
        if (!amountString.includes(searchAmount)) {
          return false;
        }
      }
    }

    // Filter by status
    if (columnFilters?.status && columnFilters.status !== "all") {
      if (columnFilters.status === "approved" && group.approved_count === 0)
        return false;
      if( columnFilters.status === "paid" && group.payment_count === 0)
        return false;
      if (columnFilters.status === "partially" && group.approved_count === 0)
        return false;
      if (columnFilters.status === "pending" && group.pending_count === 0)
        return false;
      if (columnFilters.status === "rejected" && group.rejected_count === 0)
        return false;

    }

    // Filter by last payment date
    if (columnFilters?.payment_date && group.last_payment_date) {
      const searchDate = columnFilters.payment_date;
      const groupDate = format(new Date(group.last_payment_date), "dd/MM/yy");
      if (!groupDate.includes(searchDate)) {
        return false;
      }
    }

    return true;
  });

  return (
   <Card className="border-0 overflow-hidden flex flex-col" style={{height:'calc(100vh - 280px)'}}>
  <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
    {/* Single overflow-x for both header + body */}
    <div className="overflow-x-auto flex-1 min-h-0 flex flex-col min-w-0">
      <div className="min-w-[900px] flex flex-col flex-1 min-h-0">
        <div className="flex-shrink-0">
        <Table>
            <TableHeader className="bg-gray-200 border-b border-gray-300">
              <TableRow className="hover:bg-transparent">
                {/* Expand Column */}
                <TableHead className="w-6 py-2 px-1 bg-gray-200"></TableHead>

                {/* Tenant Column - Updated with salutation filter */}
                <TableHead className="w-[200px] py-2 px-2 bg-gray-200">
                  <div className="flex flex-col gap-1">
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => handleSort?.("tenant_name")}
                    >
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                        Tenant
                      </span>
                      <ArrowUpDown className="h-2.5 w-2.5 text-gray-500" />
                    </div>
                    <Input
                      placeholder="Search name..."
                      className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                      value={columnFilters?.tenant_name || ""}
                      onChange={(e) =>
                        setColumnFilters?.({
                          ...columnFilters,
                          tenant_name: e.target.value,
                        })
                      }
                    />
                  </div>
                </TableHead>

                {/* CNT Column */}
                <TableHead className="w-[55px] py-2 px-2 bg-gray-200 text-center">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      CNT
                    </span>
                    <Input
                      placeholder="#"
                      type="number"
                      className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1 text-center font-normal w-full"
                      value={columnFilters?.payment_count || ""}
                      onChange={(e) =>
                        setColumnFilters?.({
                          ...columnFilters,
                          payment_count: e.target.value,
                        })
                      }
                    />
                  </div>
                </TableHead>

                {/* Amount Column */}
                <TableHead className="w-[110px] py-2 px-2 bg-gray-200 text-right">
                  <div className="flex flex-col gap-1 items-end">
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => handleSort?.("total_amount")}
                    >
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                        Amount
                      </span>
                      <ArrowUpDown className="h-2.5 w-2.5 text-gray-500" />
                    </div>
                    <Input
                      placeholder="Search amount..."
                      type="number"
                      className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 text-left font-normal w-full"
                      value={columnFilters?.amount || ""}
                      onChange={(e) =>
                        setColumnFilters?.({
                          ...columnFilters,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>
                </TableHead>

                {/* Status Column */}
                <TableHead className="w-[100px] py-2 px-2 bg-gray-200">
                  <div className="flex flex-col gap-1">
                    <div
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => handleSort?.("status")}
                    >
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                        Status
                      </span>
                      <ArrowUpDown className="h-2.5 w-2.5 text-gray-500" />
                    </div>
                    <Select
                      value={columnFilters?.status || "all"}
                      onValueChange={(value) =>
                        setColumnFilters?.({ ...columnFilters, status: value })
                      }
                    >
                      <SelectTrigger className="h-6 text-[10px] bg-white border-gray-300 px-2 font-normal w-full">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">
                          All
                        </SelectItem>
                        <SelectItem value="approved" className="text-xs">
                          Approved
                        </SelectItem>
                        <SelectItem value="pending" className="text-xs">
                          Pending
                        </SelectItem>
                        <SelectItem value="rejected" className="text-xs">
                          Rejected
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableHead>

                {/* Last Pay Column */}
                <TableHead className="w-[100px] py-2 px-2 bg-gray-200">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      Last Pay
                    </span>
                    <Input
                      placeholder="dd/mm/yy"
                      type="text"
                      className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                      value={columnFilters?.payment_date || ""}
                      onChange={(e) =>
                        setColumnFilters?.({
                          ...columnFilters,
                          payment_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </TableHead>

                {/* Actions Column */}
                {/* Actions Column */}
                <TableHead className="w-[80px] py-2 px-2 bg-gray-200 text-center">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      Actions
                    </span>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setShowFilterSidebar?.(true)}
                      className="h-5 px-1.5 text-[9px] bg-blue-600 text-white hover:bg-blue-700 rounded w-full"
                    >
                      <Filter className="w-2.5 h-2.5 mr-0.5" />
                      Filter
                    </Button>
                  </div>
                </TableHead>
              </TableRow>
           </TableHeader>
          </Table>
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
          <Table>
            <colgroup>
              <col style={{width:'24px'}} />
              <col style={{width:'200px'}} />
              <col style={{width:'55px'}} />
              <col style={{width:'110px'}} />
              <col style={{width:'100px'}} />
              <col style={{width:'100px'}} />
              <col style={{width:'80px'}} />
            </colgroup>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-3" />
                      <p className="text-sm text-slate-500">
                        Loading payment data...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <CreditCard className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-700 mb-1">
                        No payments found
                      </h3>
                      <p className="text-xs text-slate-500">
                        Try adjusting your filters or add a new payment
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group: any) => {
                  const isExpanded = expandedRows.includes(group.tenant_id);

                  return (
                    <Fragment key={group.tenant_id}>
                      {/* Parent Row - Tenant Card with Salutation and Country Code */}
                      <TableRow
                        className={`
                          group cursor-pointer transition-all duration-200
                          ${isExpanded ? "bg-blue-50/50 shadow-inner" : "hover:bg-slate-50/80"}
                        `}
                        onClick={() => onToggleExpand(group.tenant_id)}
                      >
                        <TableCell className="py-3">
                          <div
                            className={`
                            w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                            ${isExpanded ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600 group-hover:bg-blue-100"}
                          `}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                              {group.tenant_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              {/* Show salutation + full name */}
                              <p className="text-sm font-medium text-slate-800">
                                {group.salutation ? `${group.salutation} ` : ""}
                                {group.tenant_name}
                              </p>
                              {/* Show country code + phone number */}
                              <p className="text-xs text-slate-500">
                                {group.country_code || "+91"}{" "}
                                {group.tenant_phone}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 text-center">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5"
                          >
                            {group.payment_count}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3 text-right">
                          <span className="text-sm font-bold text-green-600">
                            ₹{group.total_amount.toLocaleString()}
                          </span>
                        </TableCell>

                        <TableCell className="py-3">
                          <div className="flex items-center justify-center gap-1">
                            {group.approved_count > 0 && (
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-1.5 py-0.5">
                                {group.approved_count} A
                              </Badge>
                            )}
                            {group.pending_count > 0 && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs px-1.5 py-0.5">
                                {group.pending_count} P
                              </Badge>
                            )}
                            {group.rejected_count > 0 && (
                              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs px-1.5 py-0.5">
                                {group.rejected_count} R
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-3 text-center">
                          <span className="text-xs text-slate-600">
                            {group.last_payment_date
                              ? format(
                                  new Date(group.last_payment_date),
                                  "dd MMM yy",
                                )
                              : "No payments"}
                          </span>
                        </TableCell>

                        <TableCell
                          className="py-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                              onClick={() => onToggleExpand(group.tenant_id)}
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                              onClick={() => setIsAddPaymentOpen(true)}
                              title="Add Payment"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Child Row - Payment Details (unchanged) */}
                      {isExpanded && (
                        <TableRow className="bg-blue-50/30">
                          <TableCell colSpan={7} className="p-0 border-t-0">
                            <div className="animate-in slide-in-from-top-1 duration-200">
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                    <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                                    Payment History • {group.payments.length}{" "}
                                    transactions
                                  </h4>
                                </div>

                                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                  <Table>
                                    <TableHeader className="bg-slate-50">
                                      <TableRow>
                                        <TableHead className="text-[12px] py-2">
                                          Date
                                        </TableHead>
                                        <TableHead className="text-[12px] py-2">
                                          Amount
                                        </TableHead>
                                        <TableHead className="text-[12px] py-2">
                                          Mode
                                        </TableHead>
                                        <TableHead className="text-[12px] py-2">
                                          Transaction ID
                                        </TableHead>
                                        <TableHead className="text-[12px] py-2">
                                          Month/Year
                                        </TableHead>
                                        <TableHead className="text-[12px] py-2">
                                          Remark
                                        </TableHead>
                                        <TableHead className="text-[12px] py-2">
                                          Status
                                        </TableHead>
                                        <TableHead className="text-[12px] py-2 text-center">
                                          Actions
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {group.payments.map(
                                        (payment: any, index: number) => (
                                          <TableRow
                                            key={payment.id}
                                            className={
                                              index % 2 === 0
                                                ? "bg-white"
                                                : "bg-slate-50/50"
                                            }
                                          >
                                            <TableCell className="py-2 text-[12px] whitespace-nowrap">
                                              {format(
                                                new Date(payment.payment_date),
                                                "dd/MM/yy",
                                              )}
                                            </TableCell>
                                            <TableCell className="py-2 text-[12px] font-medium">
                                              ₹
                                              {Number(
                                                payment.amount,
                                              ).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="py-2">
                                              <div className="flex items-center gap-1">
                                                <span className="text-[12px] capitalize">
                                                  {payment.payment_mode}
                                                </span>
                                              </div>
                                              {payment.bank_name && (
                                                <p className="text-[10px] text-slate-500">
                                                  {payment.bank_name}
                                                </p>
                                              )}
                                            </TableCell>
                                            <TableCell className="py-2 text-[12px] font-mono">
                                              {payment.transaction_id
                                                ? payment.transaction_id.substring(
                                                    0,
                                                    8,
                                                  ) + "..."
                                                : "-"}
                                            </TableCell>
                                            <TableCell className="py-2 text-[12px]">
                                              {payment.month} {payment.year}
                                            </TableCell>
                                            <TableCell className="py-2 text-xs max-w-[120px] truncate group relative">
                                              <span
                                                className="cursor-help"
                                                title={payment.remark || "-"}
                                              >
                                                {payment.remark || "-"}
                                              </span>
                                            </TableCell>
                                            <TableCell className="py-2">
                                              <PaymentStatusBadge
                                                status={
                                                  payment.status || "pending"
                                                }
                                              />
                                            </TableCell>
                                            <TableCell className="py-2">
                                              {/* Inside the inner table actions column: */}
                                              <div className="flex items-center gap-0.5 justify-end">
                                                {payment.status ===
                                                  "approved" &&
                                                  canViewReceipts && (
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                                                      onClick={() => {
                                                        setActiveTab(
                                                          "receipts",
                                                        );
                                                        setTimeout(
                                                          () =>
                                                            onViewReceipt(
                                                              payment.id,
                                                            ),
                                                          100,
                                                        );
                                                      }}
                                                      title="View Receipt"
                                                    >
                                                      <ReceiptIndianRupee className="h-3 w-3" />
                                                    </Button>
                                                  )}
                                                {(payment.status === "pending" || payment.status === "paid" || payment.status === "partial") && 
                                                  canApprove && (
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                                                      onClick={() =>
                                                        onApprove(payment)
                                                      }
                                                      title="Approve"
                                                    >
                                                      <CheckCircle2 className="h-3 w-3" />
                                                    </Button>
                                                  )}
                                                {(payment.status === "pending" || payment.status === "paid" || payment.status === "partial") &&
                                                  canReject && (
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                                                      onClick={() =>
                                                        onReject(payment)
                                                      }
                                                      title="Reject"
                                                    >
                                                      <XCircle className="h-3 w-3" />
                                                    </Button>
                                                  )}
                                                {(payment.status ===
                                                  "pending" ||
                                                  payment.status ===
                                                    "rejected") &&
                                                  canEdit && (
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                                                      onClick={() =>
                                                        onEdit(payment)
                                                      }
                                                      title="Edit"
                                                    >
                                                      <Pencil className="h-3 w-3" />
                                                    </Button>
                                                  )}
                                                {payment.status === "pending" &&
                                                  canDelete && (
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                                                      onClick={() =>
                                                        onDelete(payment)
                                                      }
                                                      title="Delete"
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  )}
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ),
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
                       </TableBody>
          </Table>
          </div>
        </div>
      </div>
      </div>
      {/* Payments Filter Sidebar */}
<Sheet open={showFilterSidebar} onOpenChange={setShowFilterSidebar}>
  <SheetContent side="right" className="p-0 w-[85vw] min-w-[280px] sm:w-[360px]">
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Filter Payments</span>
        </div>
        <button onClick={() => setShowFilterSidebar?.(false)} className="text-white/70 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-blue-700">Tenant Name</Label>
          <Input placeholder="Search tenant..." value={columnFilters?.tenant_name || ""} onChange={(e) => setColumnFilters?.({...columnFilters, tenant_name: e.target.value})} className="h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-blue-700">Status</Label>
          <select value={columnFilters?.status || "all"} onChange={(e) => setColumnFilters?.({...columnFilters, status: e.target.value})} className="w-full h-8 text-xs rounded-lg border border-gray-200 px-2 bg-white text-gray-700">
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-blue-700">Amount</Label>
          <Input type="number" placeholder="Search amount..." value={columnFilters?.amount || ""} onChange={(e) => setColumnFilters?.({...columnFilters, amount: e.target.value})} className="h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-blue-700">Last Payment Date</Label>
          <Input placeholder="dd/mm/yy" value={columnFilters?.payment_date || ""} onChange={(e) => setColumnFilters?.({...columnFilters, payment_date: e.target.value})} className="h-8 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-blue-700">Payment Count</Label>
          <Input type="number" placeholder="Exact count..." value={columnFilters?.payment_count || ""} onChange={(e) => setColumnFilters?.({...columnFilters, payment_count: e.target.value})} className="h-8 text-xs" />
        </div>
      </div>
      <div className="border-t p-3 flex gap-2 bg-gray-50 flex-shrink-0">
        <Button variant="outline" size="sm" className="flex-1 text-xs h-8"
          onClick={() => setColumnFilters?.({ payment_date:"", tenant_name:"", amount:"", min_amount:"", max_amount:"", payment_mode:"all", transaction_id:"", month:"", status:"all", remark:"", payment_count:"" })}>
          <RefreshCw className="w-3 h-3 mr-1" /> Reset
        </Button>
        <Button size="sm" className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowFilterSidebar?.(false)}>
          Apply
        </Button>
      </div>
    </div>
  </SheetContent>
</Sheet>
    </Card>
  );
};

// ===== END OF REPLACEMENT =====

// Receipts Table Component
// Receipts Table Component - Compact like payments table with search bars
// Receipts Table Component - Updated to work with receipt data
const ReceiptsTable = ({
  receipts,
  loading,
  getTenantSalutation, // Keep this
  getTenantCountryCode, // Keep this
  getTenantPhone, // Keep this
  tenants, // ADD THIS - pass tenants array
  highlightedReceipt,
  onPreviewReceipt,
  onDownloadReceipt,
  showFilterSidebar,
  setShowFilterSidebar,
}: any) => {
  // Add state for receipts column filters
  const [receiptFilters, setReceiptFilters] = useState({
    date: "",
    tenant: "",
    amount: "",
    method: "",
    room: "",
  });

  // Enhance receipts with salutation and country code
  const enhancedReceipts = receipts.map((receipt: any) => {
    // Find the tenant by ID if available, or by name as fallback
    let tenant = null;

    // Try to find by tenant_id if it exists
    if (receipt.tenant_id) {
      tenant = tenants.find((t: any) => t.id === receipt.tenant_id);
    }

    // If not found by ID, try to find by name
    if (!tenant && receipt.tenant_name) {
      tenant = tenants.find((t: any) => t.full_name === receipt.tenant_name);
    }

    return {
      ...receipt,
      salutation: tenant?.salutation || "",
      country_code: tenant?.country_code || "+91",
      phone: tenant?.phone || receipt.tenant_phone || "",
    };
  });

  // Filter receipts based on column filters
  const filteredReceipts = enhancedReceipts.filter((receipt: any) => {
    const matchesDate =
      !receiptFilters.date ||
      format(new Date(receipt.payment_date), "dd/MM/yy").includes(
        receiptFilters.date,
      );

    const fullName =
      `${receipt.salutation} ${receipt.tenant_name}`.toLowerCase();
    const matchesTenant =
      !receiptFilters.tenant ||
      fullName.includes(receiptFilters.tenant.toLowerCase()) ||
      receipt.tenant_name
        .toLowerCase()
        .includes(receiptFilters.tenant.toLowerCase());

    const matchesAmount =
      !receiptFilters.amount ||
      (receipt.amount &&
        receipt.amount.toString().includes(receiptFilters.amount));

    const matchesMethod =
      !receiptFilters.method ||
      (receipt.payment_mode &&
        receipt.payment_mode
          .toLowerCase()
          .includes(receiptFilters.method.toLowerCase())) ||
      (receipt.bank_name &&
        receipt.bank_name
          .toLowerCase()
          .includes(receiptFilters.method.toLowerCase()));

    const matchesRoom =
      !receiptFilters.room ||
      (receipt.room_number &&
        receipt.room_number
          .toString()
          .toLowerCase()
          .includes(receiptFilters.room.toLowerCase())) ||
      (receipt.bed_number &&
        receipt.bed_number.toString().includes(receiptFilters.room));

    return (
      matchesDate &&
      matchesTenant &&
      matchesAmount &&
      matchesMethod &&
      matchesRoom
    );
  });

  return (
    <Card className="border-0 overflow-hidden flex flex-col" style={{height:'calc(100vh - 280px)'}}>
  <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
    <div className="overflow-x-auto flex-1 min-h-0 flex flex-col min-w-0">
      <div className="min-w-[700px] flex flex-col flex-1 min-h-0">
        <div className="flex-shrink-0">
          <Table>
            {/* COMPACT HEADER WITH SEARCH BARS */}
            <TableHeader className="bg-gray-200 border-b border-gray-300">
              <TableRow className="hover:bg-transparent">
                {/* Date Column */}
                <TableHead className="w-[90px] py-2 px-2 bg-gray-200">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      Date
                    </span>
                    <Input
                      placeholder="dd/mm/yy"
                      className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                      value={receiptFilters.date}
                      onChange={(e) =>
                        setReceiptFilters({
                          ...receiptFilters,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                </TableHead>

                {/* Tenant Column - Updated with salutation and phone */}
                <TableHead className="w-[200px] py-2 px-2 bg-gray-200">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      Tenant
                    </span>
                    <Input
                      placeholder="Search tenant..."
                      className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                      value={receiptFilters.tenant}
                      onChange={(e) =>
                        setReceiptFilters({
                          ...receiptFilters,
                          tenant: e.target.value,
                        })
                      }
                    />
                  </div>
                </TableHead>

                {/* Amount Column */}
                <TableHead className="w-[90px] py-2 px-2 bg-gray-200 text-right">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      Amount
                    </span>
                    <Input
                      placeholder="Search..."
                      type="number"
                      className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 text-right font-normal w-full"
                      value={receiptFilters.amount}
                      onChange={(e) =>
                        setReceiptFilters({
                          ...receiptFilters,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>
                </TableHead>

                {/* Method/Bank Column */}
                <TableHead className="w-[120px] py-2 px-2 bg-gray-200">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      Method/Bank
                    </span>
                    <Input
                      placeholder="Search..."
                      className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                      value={receiptFilters.method}
                      onChange={(e) =>
                        setReceiptFilters({
                          ...receiptFilters,
                          method: e.target.value,
                        })
                      }
                    />
                  </div>
                </TableHead>

                {/* Room/Bed Column */}
                <TableHead className="w-[100px] py-2 px-2 bg-gray-200">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      Room/Bed
                    </span>
                    <Input
                      placeholder="Search..."
                      className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                      value={receiptFilters.room}
                      onChange={(e) =>
                        setReceiptFilters({
                          ...receiptFilters,
                          room: e.target.value,
                        })
                      }
                    />
                  </div>
                </TableHead>

                {/* Actions Column */}
               {/* Actions Column */}
                <TableHead className="w-[80px] py-2 px-2 bg-gray-200 text-center">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      Actions
                    </span>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setShowFilterSidebar?.(true)}
                      className="h-5 px-1.5 text-[9px] bg-blue-600 text-white hover:bg-blue-700 rounded w-full"
                    >
                      <Filter className="w-2.5 h-2.5 mr-0.5" />
                      Filter
                    </Button>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
          <Table>
            <colgroup>
              <col style={{width:'90px'}} />
              <col style={{width:'200px'}} />
              <col style={{width:'90px'}} />
              <col style={{width:'120px'}} />
              <col style={{width:'100px'}} />
              <col style={{width:'60px'}} />
            </colgroup>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-xs text-slate-500"
                  >
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
                      Loading receipts...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredReceipts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-xs text-slate-500"
                  >
                    <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    No receipts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceipts.map((receipt: any) => {
                  return (
                    <TableRow
                      key={receipt.id}
                      className={`hover:bg-slate-50 ${
                        receipt.id === highlightedReceipt
                          ? "bg-green-50 animate-pulse"
                          : ""
                      }`}
                    >
                      <TableCell className="py-2 text-xs whitespace-nowrap">
                        {format(new Date(receipt.payment_date), "dd/MM/yy")}
                      </TableCell>
                      <TableCell className="py-2">
                        {/* Show salutation + full name */}
                        <p className="text-xs font-medium whitespace-nowrap">
                          {receipt.salutation ? `${receipt.salutation} ` : ""}
                          {receipt.tenant_name}
                        </p>
                        {/* Show country code + phone number */}
                        {receipt.phone && (
                          <p className="text-[10px] text-slate-500 whitespace-nowrap">
                            {receipt.country_code || "+91"} {receipt.phone}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-xs font-medium whitespace-nowrap">
                        ₹{receipt.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2">
                        <p className="text-xs capitalize whitespace-nowrap">
                          {receipt.payment_mode}
                        </p>
                        {receipt.bank_name && (
                          <p className="text-[10px] text-slate-500 whitespace-nowrap">
                            {receipt.bank_name}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <p className="text-xs whitespace-nowrap">
                          {receipt.room_number || "N/A"}
                        </p>
                        {receipt.bed_number && (
                          <p className="text-[10px] text-slate-500">
                            Bed #{receipt.bed_number}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => onPreviewReceipt(receipt.id)}
                            title="Preview Receipt"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => onDownloadReceipt(receipt.id)}
                            title="Download Receipt"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
           </TableBody>
          </Table>
          </div>
        </div>
      </div>
      </div>
      {/* Receipts Filter Sidebar */}
<Sheet open={showFilterSidebar} onOpenChange={setShowFilterSidebar}>
  <SheetContent side="right" className="p-0 w-[85vw] min-w-[280px] sm:w-[360px]">
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Filter Receipts</span>
        </div>
        <button onClick={() => setShowFilterSidebar?.(false)} className="text-white/70 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {[
          { key: "date",   label: "Date",       placeholder: "dd/mm/yy" },
          { key: "tenant", label: "Tenant",      placeholder: "Search tenant..." },
          { key: "amount", label: "Amount",      placeholder: "Search amount..." },
          { key: "method", label: "Method/Bank", placeholder: "Search method..." },
          { key: "room",   label: "Room/Bed",    placeholder: "Search room..." },
        ].map(f => (
          <div key={f.key} className="space-y-1">
            <Label className="text-xs font-semibold text-blue-700">{f.label}</Label>
            <Input placeholder={f.placeholder} value={receiptFilters[f.key] || ""} onChange={(e) => setReceiptFilters(prev => ({...prev, [f.key]: e.target.value}))} className="h-8 text-xs" />
          </div>
        ))}
      </div>
      <div className="border-t p-3 flex gap-2 bg-gray-50 flex-shrink-0">
        <Button variant="outline" size="sm" className="flex-1 text-xs h-8"
          onClick={() => setReceiptFilters({ date:"", tenant:"", amount:"", method:"", room:"" })}>
          <RefreshCw className="w-3 h-3 mr-1" /> Reset
        </Button>
        <Button size="sm" className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowFilterSidebar?.(false)}>
          Apply
        </Button>
      </div>
    </div>
  </SheetContent>
</Sheet>
    </Card>
  );
};
