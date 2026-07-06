// app/admin/payments/page.tsx
"use client";

import { useState, useEffect, Fragment, useRef } from "react";
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
  Globe,
  Mail,
  MessageCircle,
  DoorOpen,
  Building2,
  Copy,
  Smartphone,
  Shield,
  Wallet,
  Users,
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
import { consumeMasters, getPaymentRejectionReasons } from "@/lib/masterApi";
import * as tenantApi from "@/lib/tenantApi";
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
import { LedgerReportDialog } from "@/components/admin/payments/LedgerReportDialog";
import { useSocketIO } from "@/hooks/useSocketIO";
import { getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
import { Checkbox } from "@radix-ui/react-checkbox";
import MySwal from "@/app/utils/swal"; // adjust path if needed
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
  discounted_first_month_rent?: number;
  offer_info?: {
    code: string;
  };
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
   is_vacated?: boolean;
  vacated_date?: string;
  paid_amount?: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<paymentApi.Payment[]>([]);
  const [receipts, setReceipts] = useState<paymentApi.Receipt[]>([]);
  const [demands, setDemands] = useState<DemandPayment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isDemandPaymentOpen, setIsDemandPaymentOpen] = useState(false);
  const [selectedDemandIds, setSelectedDemandIds] = useState<number[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
const [bulkStep, setBulkStep] = useState(1);
const [roomsWithPending, setRoomsWithPending] = useState<any[]>([]);
const [bulkSummary, setBulkSummary] = useState({
  totalTenants: 0,
  totalPending: 0,
});
const [isResendPopupOpen, setIsResendPopupOpen] = useState(false);
const [resendDemand, setResendDemand] = useState<DemandPayment | null>(null);
const [resendTenantPayments, setResendTenantPayments] = useState<any[]>([]);
const [resendTenantFormData, setResendTenantFormData] = useState<any>(null);
const [resendLoading, setResendLoading] = useState(false);

const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
const [exactPendingFilter, setExactPendingFilter] = useState("");
const [ignoreDateFilters, setIgnoreDateFilters] = useState(false);
const [roomFilterGlobal, setRoomFilterGlobal] = useState("");
const [selectedReceiptIds, setSelectedReceiptIds] = useState<number[]>([]);
const [showPendingRentOnly, setShowPendingRentOnly] = useState(false);
const [showPendingRentOnlyDemands, setShowPendingRentOnlyDemands] = useState(false);
const [accuratePendingRentMap, setAccuratePendingRentMap] = useState<Map<number, number>>(new Map());
// Add state for pending rent tenant IDs
const [pendingRentTenantIds, setPendingRentTenantIds] = useState<number[]>([]);
// Add these with your other useState declarations
const [pendingRoomsSingle, setPendingRoomsSingle] = useState<any[]>([]);
const [pendingTenantsSingle, setPendingTenantsSingle] = useState<any[]>([]);
const [loadingPendingRooms, setLoadingPendingRooms] = useState(false);

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

  // Add these state variables with your other useState declarations
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Add these with your other useState declarations
  const [propertySearch, setPropertySearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);

  // Add this with your other useState declarations
  const [isLedgerReportOpen, setIsLedgerReportOpen] = useState(false);
  const [selectedLedgerTenant, setSelectedLedgerTenant] = useState<any>(null);

  const propertySearchInputRef = useRef<HTMLInputElement>(null);
  const roomSearchInputRef = useRef<HTMLInputElement>(null);

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
  const [showPaymentFilterSidebar, setShowPaymentFilterSidebar] =
    useState(false);
  const [showReceiptFilterSidebar, setShowReceiptFilterSidebar] =
    useState(false);
  const [showDemandFilterSidebar, setShowDemandFilterSidebar] = useState(false);
  // Add this with your other useState declarations
  const [bankNames, setBankNames] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [loadingBankNames, setLoadingBankNames] = useState(false);
  const [customBankName, setCustomBankName] = useState("");
  const [showCustomBankInput, setShowCustomBankInput] = useState(false);
  const [paymentModes, setPaymentModes] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [loadingPaymentModes, setLoadingPaymentModes] = useState(false);
  const { on, connected } = useSocketIO();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const [columnFilters, setColumnFilters] = useState({
    payment_date: "",
    tenant_name: "",
    property_name: "",
    room_bed: "",
    contact: "",
    amount: "",
    min_amount: "",
    max_amount: "",
    payment_mode: "all",
    transaction_id: "",
    month: "",
    status: "all",
    remark: "",
    payment_count: "",
    total_paid_amount: "",
    total_rejected_amount: "",
    total_pending_amount: "",  
  });
  const [filterPropertyId, setFilterPropertyId] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
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
    payment_type: "",  
  amount: "",         
  room: "",  
  contact: "",      
  property: "",     
  ignore_date: false,          
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
    payment_mode: "",
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

const [detailedStats, setDetailedStats] = useState({
  total_rent_collected: 0,
  total_deposit_collected: 0,
  net_deposit_collected: 0,
  total_refunded: 0,
  total_penalties_collected: 0,
  this_month_expected_rent: 0,        // ✅ Renamed
  this_month_received_rent: 0,        // ✅ Renamed from this_month_rent
  this_month_pending_rent: 0,         // ✅ New
  total_transactions: 0,
});

const [paymentPagination, setPaymentPagination] = useState<{
  currentPage: number;
  itemsPerPage: number | "All";
  totalItems: number;
}>({
  currentPage: 1,
  itemsPerPage: 10,   // 👈 set a default value
  totalItems: 0,
});

const [receiptPagination, setReceiptPagination] = useState<{
  currentPage: number;
  itemsPerPage: number | "All";
  totalItems: number;
}>({
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
});

const [demandPagination, setDemandPagination] = useState<{
  currentPage: number;
  itemsPerPage: number | "All";
  totalItems: number;
}>({
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,
});
  useEffect(() => {
    loadData();
  }, []);

  // Listen for new payment events
  useEffect(() => {
    if (!connected) return;

    // Listen for new payment notification
    const unsubscribeNewPayment = on("new_payment", (data) => {
      // Refresh all data
      loadData();
      setLastUpdateTime(new Date());
    });

    // Listen for payment status updates (approved/rejected)
    const unsubscribePaymentUpdate = on("payment_updated", (data) => {
      loadData();
      setLastUpdateTime(new Date());
    });

    // Listen for demand payment created
    const unsubscribeDemandCreated = on("demand_created", (data) => {
      loadDemands();
      setLastUpdateTime(new Date());
    });

    const unsubscribePaymentFailed = on("payment_failed", (data) => {
      loadData(); // Refresh to show failed payment
      setLastUpdateTime(new Date());
    });

    // Also add listener for payment_pending (when payment is initiated but not completed)
    const unsubscribePaymentPending = on("payment_pending", (data) => {
      loadData();
      setLastUpdateTime(new Date());
    });

    return () => {
      unsubscribeNewPayment();
      unsubscribePaymentUpdate();
      unsubscribeDemandCreated();
      unsubscribePaymentFailed();
      unsubscribePaymentPending();
    };
  }, [connected, on]);

  // Fetch bank names from masters
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

  const fetchPaymentModes = async () => {
    setLoadingPaymentModes(true);
    try {
      // Fetch from Common tab for "PaymentMethod" master item
      const tabRes = await getMasterItemsByTab("Common");
      const tabList = Array.isArray(tabRes.data) ? tabRes.data : [];
      const paymentMethodItem = tabList.find(
        (i: any) =>
          i.name?.toLowerCase().replace(/\s+/g, "") === "paymentmethod",
      );
      if (paymentMethodItem) {
        const valRes = await getMasterValues(paymentMethodItem.id);
        const vals = Array.isArray(valRes.data) ? valRes.data : [];
        const modes = vals
          .filter((v: any) => v.isactive === 1)
          .map((v: any) => ({
            id: String(v.id),
            name: v.name || v.value || "",
          }));
        setPaymentModes(modes);
      }
    } catch (error) {
      console.error("Error fetching payment modes:", error);
    } finally {
      setLoadingPaymentModes(false);
    }
  };

  // Call fetchBankNames when component mounts
  useEffect(() => {
    fetchBankNames();
    fetchPaymentModes();
  }, []);

const loadDetailedStats = async () => {
  try {
    const response = await paymentApi.getDetailedPaymentStats();
    if (response.success && response.data) {
      setDetailedStats({
        total_rent_collected: response.data.total_rent_collected || 0,
        total_deposit_collected: response.data.total_deposit_collected || 0,
        net_deposit_collected: response.data.net_deposit_collected || 0,
        total_refunded: response.data.total_refunded || 0,
        total_penalties_collected: response.data.total_penalties_collected || 0,
        this_month_expected_rent: response.data.this_month_expected_rent || 0,
        this_month_received_rent: response.data.this_month_received_rent || 0,
        this_month_pending_rent: response.data.this_month_pending_rent || 0,
        total_transactions: response.data.total_transactions || 0,
      });
    }
  } catch (error) {
    console.error("Error loading detailed stats:", error);
  }
};

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPayments(),
        loadReceipts(),
        loadDemands(),
        loadTenants(),
        loadStats(),
        loadDetailedStats(),
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
  const receipt = receipts.find((r) => r.id === receiptId);
  if (receipt) {
    setSelectedReceipt(receipt);
    setIsReceiptPreviewOpen(true);
  }
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
    const response = await paymentApi.getDemands();
    
    if (response && response.data) {
      // The API already returns is_vacated from the backend
      // We don't need to fetch bed assignments again if is_vacated is already true
      const enhancedDemands = await Promise.all(
        response.data.map(async (demand: DemandPayment) => {
          const processedDemand = {
            ...demand,
            amount: Number(demand.amount),
            late_fee: Number(demand.late_fee || 0),
            paid_amount: Number(demand.paid_amount) || 0,
            // Preserve the is_vacated value from API
            is_vacated: demand.is_vacated === true || demand.is_vacated === 1,
          };

          // If already marked as vacated, don't try to fetch bed assignment
          if (processedDemand.is_vacated) {
            return processedDemand;
          }

          // Only try to fetch bed assignment for non-vacated tenants
          try {
            const bedAssignment = await paymentApi.getTenantBedAssignment(demand.tenant_id);
            
            return {
              ...processedDemand,
              room_number: bedAssignment?.room?.room_number || demand.room_number || 'N/A',
              bed_number: bedAssignment?.bed_number || demand.bed_number,
              property_name: bedAssignment?.property?.name || demand.property_name || 'N/A',
            };
          } catch (error) {
            console.warn(`Could not fetch assignment for tenant ${demand.tenant_id}:`, error);
            return processedDemand;
          }
        }),
      );
      
      setDemands(enhancedDemands);
    } else {
      setDemands([]);
    }
  } catch (error) {
    console.error("Error loading demands:", error);
    setDemands([]);
  }
};

  // Add this function to fetch rooms with pending payments
const fetchRoomsWithPendingPayments = async (propertyId: number, paymentType?: string) => {
  setLoadingRooms(true);
  try {
    const type = paymentType || demandPayment.payment_type || 'rent';
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/bulk-reminders/rooms?property_id=${propertyId}&payment_type=${type}`
    );
    const data = await response.json();
    if (data.success) {
      setRoomsWithPending(data.data);
    }
  } catch (error) {
    console.error("Error fetching rooms:", error);
    toast.error("Failed to fetch rooms");
  } finally {
    setLoadingRooms(false);
  }
};

// Fetch pending rooms for single tenant mode
const fetchPendingRoomsSingle = async (propertyId: number, paymentType?: string) => {
  setLoadingPendingRooms(true);
  try {
    const type = paymentType || demandPayment.payment_type || 'rent';
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/bulk-reminders/rooms?property_id=${propertyId}&payment_type=${type}`
    );
    const data = await response.json();
    if (data.success) {
      setPendingRoomsSingle(data.data);
      
      // Also extract all tenants with pending from these rooms
      const allTenants: any[] = [];
      data.data.forEach((room: any) => {
        if (room.tenants && room.tenants.length) {
          room.tenants.forEach((tenant: any) => {
            allTenants.push({
              ...tenant,
              room_number: room.room_number,
              room_id: room.id
            });
          });
        }
      });
      setPendingTenantsSingle(allTenants);
    }
  } catch (error) {
    console.error("Error fetching pending rooms:", error);
    toast.error("Failed to fetch rooms with pending payments");
  } finally {
    setLoadingPendingRooms(false);
  }
};

// Add this function to calculate bulk summary
const calculateBulkSummary = () => {
  let totalTenants = 0;
  let totalPending = 0;
  
  roomsWithPending.forEach(room => {
    if (selectedRooms.includes(room.id)) {
      room.tenants.forEach((tenant: any) => {
        if (selectedTenants.length === 0 || selectedTenants.includes(tenant.id)) {
          totalTenants++;
          totalPending += tenant.total_pending;
        }
      });
    }
  });
  
  setBulkSummary({ totalTenants, totalPending });
};

// Reset bulk selection
const resetBulkSelection = () => {
  setBulkMode(false);
  setBulkStep(1);
  setSelectedRooms([]);
  setSelectedTenants([]);
  setRoomsWithPending([]);
  setBulkSummary({ totalTenants: 0, totalPending: 0 });
};

// Handle bulk send
const handleBulkSend = async () => {
  if (selectedTenants.length === 0) {
    toast.error("Please select at least one tenant");
    return;
  }

  setBookingLoading(true);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/bulk-reminders/send`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  property_id: parseInt(selectedPropertyId),
  tenant_ids: selectedTenants,
  send_email: demandPayment.send_email,
  send_sms: demandPayment.send_sms,
  reminder_type: "demand",
  payment_type: demandPayment.payment_type,
  due_date: demandPayment.due_date,
  description: demandPayment.description || ""
})
      }
    );
    
    const data = await response.json();
    if (data.success) {
      toast.success(data.message);
      setIsDemandPaymentOpen(false);
      resetBulkSelection();
      resetDemandPaymentForm();
      loadData();
    } else {
      toast.error(data.message || "Failed to send reminders");
    }
  } catch (error: any) {
    console.error("Error sending bulk reminders:", error);
    toast.error(error.message || "Failed to send reminders");
  } finally {
    setBookingLoading(false);
  }
};

  // Replace the existing handleLedgerReport with this:
  const handleLedgerReport = (tenantId: number, tenantData: any) => {
    // Find the complete tenant object
    const completeTenant = tenants.find((t) => t.id === tenantId);

    // Get original monthly rent from bed_assignments
    let monthlyRent =
      tenantData?.monthly_rent || completeTenant?.monthly_rent || 0;

    // If still 0, try to get from current_assignment
    if (monthlyRent === 0 && completeTenant?.current_assignment?.tenant_rent) {
      monthlyRent = completeTenant.current_assignment.tenant_rent;
    }

    setSelectedLedgerTenant({
      id: tenantId,
      name: completeTenant?.full_name || getTenantName(tenantId),
      phone: completeTenant?.phone || getTenantPhone(tenantId),
      email: completeTenant?.email || "",
      salutation: completeTenant?.salutation || getTenantSalutation(tenantId),
      country_code:
        completeTenant?.country_code || getTenantCountryCode(tenantId),
      room_number: tenantData?.room_number || completeTenant?.room_number,
      bed_number: tenantData?.bed_number || completeTenant?.bed_number,
      property_name: tenantData?.property_name || completeTenant?.property_name,
      monthly_rent: monthlyRent, // ✅ Original monthly rent
      check_in_date: tenantData?.check_in_date || completeTenant?.check_in_date,
      security_deposit: completeTenant?.security_deposit || 0,
    });

    setIsLedgerReportOpen(true); // ✅ Opens modal, NOT new tab
  };

  // Or for download directly:
  const handleDownloadLedger = (tenantId: number) => {
    const downloadUrl = `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/ledger/${tenantId}/download`;
    window.open(downloadUrl, "_blank");
    toast.success("PDF download started");
  };

  // Add this helper function
  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === 0) return "₹0";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Fetch all properties
  const fetchProperties = async () => {
    setLoadingProperties(true);
    try {
      
      const response = await fetch("/api/properties");
      const data = await response.json();
      if (data.success) {
        setProperties(data.data);
        setFilteredProperties(data.data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Fetch rooms by property
  const fetchRoomsByProperty = async (propertyId: string) => {
    if (!propertyId) {
      setRooms([]);
      setFilteredRooms([]);
      return;
    }

    setLoadingRooms(true);
    try {
      const response = await fetch(`/api/rooms/property/${propertyId}`);
      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
        // Filter rooms based on roomSearch state
        const filtered = data.data.filter((room: any) =>
          room.room_number
            .toString()
            .toLowerCase()
            .includes(roomSearch.toLowerCase()),
        );
        setFilteredRooms(filtered);
        
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Then use it in fetchTenantsByRoom:
  const fetchTenantsByRoom = async (roomId: string) => {
    if (!roomId) {
      setFilteredTenants([]);
      return;
    }

    try {
      const response = await tenantApi.getTenantsByRoom(roomId);
      if (response.success && response.data) {
        setFilteredTenants(response.data);
        
      } else {
        setFilteredTenants([]);
      }
    } catch (error) {
      console.error("Error fetching tenants by room:", error);
      setFilteredTenants([]);
    }
  };

  // Handle property search
  const handlePropertySearch = (search: string) => {
    setPropertySearch(search);
    const filtered = properties.filter((property) =>
      property.name.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredProperties(filtered);
  };

  // Handle room search
  const handleRoomSearch = (search: string) => {
    setRoomSearch(search);
    const filtered = rooms.filter((room) =>
      room.room_number.toString().toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredRooms(filtered);
  };

  // Handle property change
  const handlePropertyChange = async (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedRoomId(""); // Reset room selection
    setNewPayment((prev) => ({ ...prev, tenant_id: "" })); // Reset tenant selection
    setFilteredTenants([]); // Clear tenants
    setRoomSearch(""); // Reset room search
    setFilteredRooms([]); // Clear filtered rooms
    await fetchRoomsByProperty(propertyId);
  };


  // Handle property change in demand payment form
const handleDemandPropertyChange = async (propertyId: string) => {
  setSelectedPropertyId(propertyId);
  setSelectedRoomId(""); // Reset room selection
  setDemandPayment((prev) => ({ 
    ...prev, 
    tenant_id: ""  // Clear tenant selection when property changes
  }));
  setFilteredTenants([]); // Clear tenants
  setRoomSearch(""); // Reset room search
  setFilteredRooms([]); // Clear filtered rooms
  setPaymentFormData(null); // Clear bed assignment data
  setSecurityDepositInfo(null); // Clear security deposit info
  setPendingRoomsSingle([]); // Clear pending rooms
  setPendingTenantsSingle([]); // Clear pending tenants
  
  if (propertyId) {
    await fetchPendingRoomsSingle(parseInt(propertyId), demandPayment.payment_type);
  }
};
  // Handle room change
  // Handle room change
  const handleRoomChange = async (roomId: string) => {
    setSelectedRoomId(roomId);
    setNewPayment((prev) => ({ ...prev, tenant_id: "" })); // Reset tenant selection
    setFilteredTenants([]); // Clear tenants while loading
    await fetchTenantsByRoom(roomId);
  };

  // Add a separate handler for demand payment room change
const handleDemandRoomChange = async (roomId: string) => {
  setSelectedRoomId(roomId);
  setDemandPayment((prev) => ({ 
    ...prev, 
    tenant_id: ""  // Clear tenant selection when room changes
  }));
  setFilteredTenants([]); // Clear tenants while loading
  setPaymentFormData(null); // Clear bed assignment data
  setSecurityDepositInfo(null); // Clear security deposit info
  
   if (roomId) {
    // ✅ Filter tenants from pendingRoomsSingle that belong to this room
    const roomData = pendingRoomsSingle.find((room: any) => room.id === parseInt(roomId));
    if (roomData && roomData.tenants) {
      // Map tenants with their pending amounts
      const tenantsWithPending = roomData.tenants.map((tenant: any) => ({
        id: tenant.id,
        full_name: tenant.full_name,
        phone: tenant.phone,
        email: tenant.email,
        salutation: tenant.salutation,
        bed_number: tenant.bed_number,
        total_pending: tenant.total_pending || 0,
        room_number: roomData.room_number
      }));
      setFilteredTenants(tenantsWithPending);
    } else {
      setFilteredTenants([]);
    }
  } else {
    setFilteredTenants([]);
  }
};

  // Add this useEffect
  useEffect(() => {
    fetchProperties();
  }, []);

  const loadTenants = async () => {
    try {
      // Use listTenantsOptimized or listTenantsWithAssignments to get full tenant data
      const response = await listTenants({ pageSize: 500 });
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

  // In page.tsx - Update fetchSecurityDepositInfo

  const fetchSecurityDepositInfo = async (tenantId: number) => {
    try {
      const response = await paymentApi.getSecurityDepositInfo(tenantId);
      if (response.success) {
        setSecurityDepositInfo(response.data);
      } else {
        // Set default values if endpoint returns error
        setSecurityDepositInfo({
          property_name: "N/A",
          room_number: "N/A",
          bed_number: null,
          bed_type: null,
          security_deposit: 0,
          paid_amount: 0,
          pending_amount: 0,
          is_fully_paid: true,
          last_payment_date: null,
          payments: [],
        });
      }
    } catch (error) {
      console.error("Error fetching security deposit info:", error);
      // Set default values instead of failing
      setSecurityDepositInfo({
        property_name: "N/A",
        room_number: "N/A",
        bed_number: null,
        bed_type: null,
        security_deposit: 0,
        paid_amount: 0,
        pending_amount: 0,
        is_fully_paid: true,
        last_payment_date: null,
        payments: [],
      });
    }
  };

  // Update handleTenantSelect to fetch deposit info
  const handleTenantSelect = async (tenantId: string) => {
    setNewPayment((prev) => ({
      ...prev,
      tenant_id: tenantId,
      booking_id: null,
      amount: "",
      payment_mode: "",
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
  
  // Clear selections when payment type changes
  setSelectedRoomId("");
  setSelectedTenants([]);
  setFilteredTenants([]);
  setPaymentFormData(null);
  setSecurityDepositInfo(null);

  // Refetch rooms for the new payment type
  if (selectedPropertyId) {
    await fetchPendingRoomsSingle(parseInt(selectedPropertyId), value);
  }

  // ✅ AUTO-FILL AMOUNT IF TENANT IS ALREADY SELECTED
  if (demandPayment.tenant_id) {
    if (value === "security_deposit") {
      try {
        const response = await paymentApi.getSecurityDepositInfo(
          parseInt(demandPayment.tenant_id),
        );
        if (response.success) {
          setSecurityDepositInfo(response.data);
          const pendingAmount = response.data?.pending_amount || 0;
          if (pendingAmount > 0) {
            setDemandPayment((prev) => ({
              ...prev,
              amount: pendingAmount,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching security deposit info:", error);
      }
    } else if (value === "rent") {
      try {
        const formResponse = await paymentApi.getTenantPaymentFormData(
          parseInt(demandPayment.tenant_id),
        );
        if (formResponse.success) {
          setPaymentFormData(formResponse.data);
          const totalPending = formResponse.data?.total_pending || 0;
          if (totalPending > 0) {
            setDemandPayment((prev) => ({
              ...prev,
              amount: totalPending,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching rent pending amount:", error);
      }
    }
  }
};

const handleDemandTenantSelect = async (tenantId: string) => {
  // Clear previous data first
  setPaymentFormData(null);
  setSecurityDepositInfo(null);
  
  setDemandPayment((prev) => ({ ...prev, tenant_id: tenantId }));

  if (!tenantId) return;

  setBookingLoading(true);
  try {
    // Fetch rent payment data using existing function
    const formResponse = await paymentApi.getTenantPaymentFormData(
      parseInt(tenantId),
    );
    if (formResponse.success) {
      setPaymentFormData(formResponse.data);
      
      // ✅ AUTO-FILL AMOUNT FOR RENT
      if (demandPayment.payment_type === "rent") {
        const totalPending = formResponse.data?.total_pending || 0;
        if (totalPending > 0) {
          setDemandPayment((prev) => ({
            ...prev,
            amount: totalPending,
          }));
        }
      }
    }

    // Fetch security deposit info
    const depositResponse = await paymentApi.getSecurityDepositInfo(
      parseInt(tenantId),
    );
    console.log("Security deposit response:", depositResponse);
    
    if (depositResponse.success && depositResponse.data) {
      setSecurityDepositInfo(depositResponse.data);
      
      // ✅ AUTO-FILL AMOUNT FOR SECURITY DEPOSIT
      if (demandPayment.payment_type === "security_deposit") {
        const pendingAmount = depositResponse.data?.pending_amount || 0;
        if (pendingAmount > 0) {
          setDemandPayment((prev) => ({
            ...prev,
            amount: pendingAmount,
          }));
        }
      }
    } else {
      // Set default info if no deposit found
      setSecurityDepositInfo({
        property_name: formResponse.data?.room_info?.property_name || 'N/A',
        room_number: formResponse.data?.room_info?.room_number || 'N/A',
        bed_number: formResponse.data?.room_info?.bed_number || null,
        security_deposit: 0,
        paid_amount: 0,
        pending_amount: 0,
        is_fully_paid: true,
        last_payment_date: null,
        payments: []
      });
    }
  } catch (error) {
    console.error("Error loading tenant details:", error);
    toast.error("Failed to load tenant details");
  } finally {
    setBookingLoading(false);
  }
};

  const handleEditPayment = async (payment: any) => {
    setSelectedPayment(payment);

    setBookingLoading(true);
    try {
      // Fetch tenant payment form data for this tenant
      const formResponse = await paymentApi.getTenantPaymentFormData(
        payment.tenant_id,
      );
      if (formResponse.success) {
        setPaymentFormData(formResponse.data);

        // ✅ Set the month from the payment data AFTER formData is loaded
        if (payment.month && payment.year) {
          // Find matching month in formData
          const matchingMonth = formResponse.data?.month_wise_history?.find(
            (month: any) =>
              month.month === payment.month && month.year === payment.year,
          );

          if (matchingMonth) {
            setSelectedPaymentMonth(matchingMonth.month_key);
          } else {
            // Fallback: create month key
            const monthNumber =
              new Date(
                Date.parse(payment.month + " 1, " + payment.year),
              ).getMonth() + 1;
            const monthKey = `${payment.year}-${String(monthNumber).padStart(2, "0")}`;
            setSelectedPaymentMonth(monthKey);
          }
        }
      }

      // Fetch security deposit info
      const depositResponse = await paymentApi.getSecurityDepositInfo(
        payment.tenant_id,
      );
      if (depositResponse.success) {
        setSecurityDepositInfo(depositResponse.data);
      }

      // ✅ Check if bank name exists in bankNames list, if not, set as "Other" and show custom input
      const bankNameValue = payment.bank_name || "";
      const isBankInList = bankNames.some(
        (bank) => bank.name === bankNameValue,
      );

      if (bankNameValue && !isBankInList) {
        setShowCustomBankInput(true);
        setCustomBankName(bankNameValue);
      } else {
        setShowCustomBankInput(false);
        setCustomBankName("");
      }

      // Set form data with existing payment values
      setNewPayment({
        tenant_id: payment.tenant_id.toString(),
        booking_id: payment.booking_id,
        payment_type: payment.payment_type,
        amount: payment.amount.toString(),
        payment_mode: payment.payment_mode,
        bank_name: bankNameValue,
        transaction_id: payment.transaction_id || "",
        payment_date: payment.payment_date.split("T")[0],
        remark: payment.remark || "",
      });

      // Set property and room
      const tenant = tenants.find((t) => t.id === payment.tenant_id);
      if (tenant) {
        const propertyId = tenant.current_assignment?.property_id;
        const roomId = tenant.current_assignment?.room_id;
        if (propertyId) {
          setSelectedPropertyId(propertyId.toString());
          await fetchRoomsByProperty(propertyId.toString());
        }
        if (roomId) {
          setSelectedRoomId(roomId.toString());
          await fetchTenantsByRoom(roomId.toString());
        }
      }

      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error loading payment edit data:", error);
      toast.error("Failed to load payment details for editing");
    } finally {
      setBookingLoading(false);
    }
  };

  // Add this useEffect to set the month when paymentFormData is loaded during edit
  useEffect(() => {
    if (selectedPayment && paymentFormData && isEditDialogOpen) {
      // Find the month in paymentFormData that matches the payment's month/year
      const matchingMonth = paymentFormData.month_wise_history?.find(
        (month: any) =>
          month.month === selectedPayment.month &&
          month.year === selectedPayment.year,
      );

      if (matchingMonth) {
        setSelectedPaymentMonth(matchingMonth.month_key);
      } else if (selectedPayment.month && selectedPayment.year) {
        // Fallback: create month key from payment data
        const monthNumber =
          new Date(
            Date.parse(selectedPayment.month + " 1, " + selectedPayment.year),
          ).getMonth() + 1;
        const monthKey = `${selectedPayment.year}-${String(monthNumber).padStart(2, "0")}`;
        setSelectedPaymentMonth(monthKey);
      }
    }
  }, [selectedPayment, paymentFormData, isEditDialogOpen]);

  const handlePreviewReceipt = async (receiptId: number) => {
    try {
      toast.loading("Loading receipt...", { id: "receipt-preview" });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/receipts/${receiptId}/preview-pdf`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/pdf",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load receipt");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Create modal with smaller width
      const modal = document.createElement("div");
      modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    `;

      const modalContent = document.createElement("div");
      modalContent.style.cssText = `
      width: 720px;
      max-width: 90vw;
      height: 90vh;
      background: white;
      border-radius: 12px;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    `;

      const headerBar = document.createElement("div");
      headerBar.style.cssText = `
      padding: 12px 20px;
      background: #1a3c6e;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    `;
      headerBar.innerHTML = `
      <span style="font-weight: 600; font-size: 14px;">Payment Receipt</span>
      <button id="closePreviewBtn" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">&times;</button>
    `;

      const pdfViewer = document.createElement("iframe");
      pdfViewer.style.cssText = `
      width: 100%;
      flex: 1;
      border: none;
    `;
      pdfViewer.src = url;

      modalContent.appendChild(headerBar);
      modalContent.appendChild(pdfViewer);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);

      // Add download button outside
      const downloadBtn = document.createElement("button");
      downloadBtn.innerHTML = "Download PDF";
      downloadBtn.style.cssText = `
      margin-top: 16px;
      padding: 8px 20px;
      background: #1a3c6e;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    `;
      downloadBtn.onclick = () => {
        const link = document.createElement("a");
        link.href = url;
        link.download = `receipt-${receiptId}.pdf`;
        link.click();
      };
      modal.appendChild(downloadBtn);

      const closeBtn = headerBar.querySelector("#closePreviewBtn");
      closeBtn?.addEventListener("click", () => {
        URL.revokeObjectURL(url);
        modal.remove();
        toast.dismiss("receipt-preview");
      });

      modal.onclick = (e) => {
        if (e.target === modal) {
          URL.revokeObjectURL(url);
          modal.remove();
          toast.dismiss("receipt-preview");
        }
      };

      toast.dismiss("receipt-preview");
      toast.success("Receipt loaded");
    } catch (error) {
      console.error("Error previewing receipt:", error);
      toast.dismiss("receipt-preview");
      toast.error("Failed to load receipt preview");
    }
  };

  // In your PaymentsPage component - Simplified handleAddPayment

  const handleAddPayment = async () => {
    if (!newPayment.tenant_id || !newPayment.amount) {
      toast.error("Please select a tenant and enter an amount");
      return;
    }

    try {
      const amount = parseFloat(newPayment.amount);

      // Prepare payment data (let backend handle distribution)
      const paymentData: any = {
        tenant_id: parseInt(newPayment.tenant_id),
        booking_id: newPayment.booking_id,
        payment_type: newPayment.payment_type,
        amount: amount,
        payment_mode: newPayment.payment_mode,
        bank_name: newPayment.bank_name || null,
        transaction_id: newPayment.transaction_id || null,
        payment_date: newPayment.payment_date,
        remark: newPayment.remark || null,
        source: "admin",
      };

      // ✅ FIX: Use selectedPaymentMonth instead of current date for rent payments
      if (newPayment.payment_type === "rent") {
        if (selectedPaymentMonth && selectedPaymentMonth !== "current") {
          // Selected a specific month from dropdown
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
        } else if (selectedPaymentMonth === "current") {
          // Current month
          const currentDate = new Date();
          paymentData.month = currentDate.toLocaleString("default", {
            month: "long",
          });
          paymentData.year = currentDate.getFullYear();
        } else {
          // Fallback to the selected transaction date (not current date)
          const txDate = newPayment.payment_date
            ? new Date(newPayment.payment_date)
            : new Date();
          paymentData.month = txDate.toLocaleString("default", {
            month: "long",
          });
          paymentData.year = txDate.getFullYear();
        }
      } else {
        // Derive month/year from the selected transaction date
        const txDate = newPayment.payment_date
          ? new Date(newPayment.payment_date)
          : new Date();
        paymentData.month = txDate.toLocaleString("default", { month: "long" });
        paymentData.year = txDate.getFullYear();
      }

      const response = await paymentApi.createPayment(paymentData);

      if (response.success && response.data) {
        if (proofFile) {
          await paymentApi.uploadPaymentProof(response.data.id, proofFile);
        }

        toast.success(
          `Payment of ₹${amount.toLocaleString()} added successfully`,
        );

        // Show distribution details if available
        if (
          response.data.distribution &&
          response.data.distribution.length > 0
        ) {
          console.log("Payment Distribution:", response.data.distribution);
        }

        // Refresh all data
        setIsAddPaymentOpen(false);
        resetPaymentForm();
        await loadData();

        // Refresh the payment form data for the current tenant if still selected
        if (newPayment.tenant_id) {
          const formResponse = await paymentApi.getTenantPaymentFormData(
            parseInt(newPayment.tenant_id),
          );
          if (formResponse.success) {
            setPaymentFormData(formResponse.data);
          }
        }
      } else {
        toast.error(response.message || "Failed to add payment");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
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
    // Reset form data
    setPaymentFormData(null);
    setSecurityDepositInfo(null);
    setProofFile(null);
    setProofPreview(null);
    setSelectedPaymentMonth("");

    // ✅ Reset custom bank input states
    setShowCustomBankInput(false);
    setCustomBankName("");

    // ✅ RESET ALL SELECTION STATES
    setSelectedPropertyId("");
    setSelectedRoomId("");
    setFilteredTenants([]);
    setPropertySearch("");
    setRoomSearch("");

    // Reset newPayment to default
    setNewPayment({
      tenant_id: "",
      booking_id: null,
      payment_type: "rent",
      amount: "",
      payment_mode: "",
      bank_name: "",
      transaction_id: "",
      payment_date: new Date().toISOString().split("T")[0],
      remark: "",
    });
  };

  useEffect(() => {
    if (isDemandPaymentOpen && properties.length === 0) {
      fetchProperties();
    }
  }, [isDemandPaymentOpen, properties.length]);

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
    // ✅ Reset selection states
    setSelectedPropertyId("");
    setSelectedRoomId("");
    setFilteredTenants([]);
    setPropertySearch("");
    setRoomSearch("");
// ✅ Reset pending rooms states
  setPendingRoomsSingle([]);
  setPendingTenantsSingle([]);
  setLoadingPendingRooms(false);
    
    // ✅ Reset loading states
    setBookingLoading(false);
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

  const prefillAndOpenPaymentForm = async (
    tenantId: number,
    propertyId: number,
    roomId: number,
  ) => {
    try {
      toast.loading("Loading payment form...", { id: "prefill-loading" });


      // ✅ First, fetch properties if they are empty
      if (properties.length === 0) {
        await fetchProperties();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // ✅ Set selections
      setSelectedPropertyId(propertyId.toString());
      setSelectedRoomId(roomId.toString());
      setNewPayment((prev) => ({ ...prev, tenant_id: tenantId.toString() }));

      // ✅ Load rooms for this property
      await fetchRoomsByProperty(propertyId.toString());

      // ✅ Load tenants for this room
      await fetchTenantsByRoom(roomId.toString());

      // ✅ Wait for state to update
      await new Promise((resolve) => setTimeout(resolve, 300));

      // ✅ Load tenant payment data
      await handleTenantSelect(tenantId.toString());

      toast.dismiss("prefill-loading");
      setIsAddPaymentOpen(true);
    } catch (error) {
      console.error("Error pre-filling payment form:", error);
      toast.dismiss("prefill-loading");
      toast.error("Failed to load tenant data");
      setIsAddPaymentOpen(true);
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
      // Prepare payment data with month/year from selectedPaymentMonth
      const paymentData = { ...updatedData };

      // ✅ FIX: Use selectedPaymentMonth instead of current date for rent payments
      if (paymentData.payment_type === "rent") {
        if (selectedPaymentMonth && selectedPaymentMonth !== "current") {
          // Selected a specific month from dropdown
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
        } else if (selectedPaymentMonth === "current") {
          // Current month
          const currentDate = new Date();
          paymentData.month = currentDate.toLocaleString("default", {
            month: "long",
          });
          paymentData.year = currentDate.getFullYear();
        }
      }

      // ✅ ADD THIS: For security deposit, derive month/year from payment_date
      if (paymentData.payment_type === "security_deposit") {
        const txDate = paymentData.payment_date
          ? new Date(paymentData.payment_date)
          : new Date();
        paymentData.month = txDate.toLocaleString("default", { month: "long" });
        paymentData.year = txDate.getFullYear();
      }

      const response = await paymentApi.updatePayment(
        selectedPayment.id,
        paymentData,
      );

      if (response.success) {
        toast.success("Payment updated successfully");
        setIsEditDialogOpen(false);
        setSelectedPayment(null);
        resetPaymentForm();
        await loadData(); // Refresh data
      } else {
        toast.error(response.message || "Failed to update payment");
      }
    } catch (error: any) {
      console.error("Error updating payment:", error);
      toast.error(error.message || "Failed to update payment");
    } finally {
      setActionLoading(false);
    }
  };

// Replace the fetchTenantsWithPendingRent function with this:
const fetchTenantsWithPendingRent = async () => {
  try {
    // First, get all properties
    const propertiesResponse = await fetch("/api/properties");
    const propertiesData = await propertiesResponse.json();
    
    if (!propertiesData.success || !propertiesData.data.length) {
      return [];
    }
    
    const allTenantIds: number[] = [];
    
    // For each property, fetch rooms with pending rent
    for (const property of propertiesData.data) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/bulk-reminders/rooms?property_id=${property.id}&payment_type=rent`
        );
        const data = await response.json();
        
        if (data.success && data.data) {
          // Extract tenant IDs from rooms
          data.data.forEach((room: any) => {
            if (room.tenants && room.tenants.length) {
              room.tenants.forEach((tenant: any) => {
                if (tenant.id && !allTenantIds.includes(tenant.id)) {
                  allTenantIds.push(tenant.id);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching rooms for property ${property.id}:`, error);
      }
    }
    
    return allTenantIds;
  } catch (error) {
    console.error("Error fetching tenants with pending rent:", error);
    return [];
  }
};

// Load pending rent tenant IDs when filter is enabled
useEffect(() => {
  if (showPendingRentOnly) {
    fetchTenantsWithPendingRent().then(ids => {
      setPendingRentTenantIds(ids);
      console.log("Found pending rent tenant IDs:", ids);
    });
  }
}, [showPendingRentOnly]);

// Fetch accurate pending rent amounts for all tenants
const fetchAccuratePendingRent = async () => {
  try {
    // Get all properties
    const propertiesResponse = await fetch("/api/properties");
    const propertiesData = await propertiesResponse.json();
    
    if (!propertiesData.success || !propertiesData.data.length) {
      return;
    }
    
    const pendingMap = new Map<number, number>();
    
    // For each property, fetch rooms with pending rent
    for (const property of propertiesData.data) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/bulk-reminders/rooms?property_id=${property.id}&payment_type=rent`
        );
        const data = await response.json();
        
        if (data.success && data.data) {
          data.data.forEach((room: any) => {
            if (room.tenants && room.tenants.length) {
              room.tenants.forEach((tenant: any) => {
                if (tenant.id && tenant.total_pending) {
                  pendingMap.set(tenant.id, tenant.total_pending);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching rooms for property ${property.id}:`, error);
      }
    }
    
    setAccuratePendingRentMap(pendingMap);
  } catch (error) {
    console.error("Error fetching accurate pending rent:", error);
  }
};

// Load accurate pending rent data when component mounts
useEffect(() => {
  fetchAccuratePendingRent();
}, []);

const groupPaymentsByTenant = (
  payments: any[],
  page: number,
  itemsPerPage: number | "All",
  paymentTypeFilterValue: string = "",  // Add this
  exactPendingFilterValue: string = "",  
  ignoreDateFiltersValue: boolean = false,  // Add this parameter
  roomFilterValue: string = "",  
  showPendingRentOnlyValue: boolean = false,  
  startDateValue: string = "",      // ← ADD
  endDateValue: string = ""
) => {
  const grouped: { [key: string]: any } = {};

  payments.forEach((payment) => {
    const tenantId = payment.tenant_id;
    const firstPayment = payments.find((p: any) => p.tenant_id === tenantId);
const tenantName = firstPayment?.tenant_name || getTenantName(tenantId);
    const tenantPhone = getTenantPhone(tenantId);
    const completeTenant = tenants.find((t) => t.id === tenantId);

    if (!grouped[tenantId]) {
      grouped[tenantId] = {
        tenant_id: tenantId,
        tenant_name: firstPayment?.tenant_name || tenantName,
  tenant_phone: firstPayment?.tenant_phone || getTenantPhone(tenantId),
  tenant_email: completeTenant?.email || firstPayment?.tenant_email || "",
        tenant_salutation: completeTenant?.salutation || getTenantSalutation(tenantId),
        tenant_country_code: completeTenant?.country_code || getTenantCountryCode(tenantId),
        total_amount: 0,
        total_paid_amount: 0,
        total_rejected_amount: 0,
        total_pending_amount: 0,  // ✅ Will be set from accuratePendingRentMap + deposit pending
        rent_pending_amount: 0,   // ✅ Store rent pending separately
        deposit_pending_amount: 0, // ✅ Store deposit pending separately
        payment_count: 0,
        last_payment_date: null,
        first_payment_date: null,
        payments: [],
        paid_count: 0,
        approved_count: 0,
        pending_count: 0,
        rejected_count: 0,
        
        has_online_booking: false,
        has_manual_payment: false,
        is_vacated: Boolean(payment.is_vacated) || (!completeTenant?.current_assignment && !payment.room_number),
        room_number: completeTenant?.room_number || payment.room_number || completeTenant?.current_assignment?.room_number,
        bed_number: completeTenant?.bed_number || payment.bed_number || completeTenant?.current_assignment?.bed_number,
        property_name: completeTenant?.property_name || payment.property_name || completeTenant?.current_assignment?.property_name,
        monthly_rent: completeTenant?.monthly_rent || payment.monthly_rent,
        check_in_date: completeTenant?.check_in_date,
        security_deposit: completeTenant?.security_deposit || 0,
        room_info: completeTenant?.room_info,
        email: completeTenant?.email,
        property_id: completeTenant?.current_assignment?.property_id || completeTenant?.property_id,
        room_id: completeTenant?.current_assignment?.room_id || completeTenant?.room_id,
      };
    }

    grouped[tenantId].payments.push(payment);

    const amount = Number(payment.amount) || 0;
    grouped[tenantId].total_amount += amount;

    if (payment.status === "approved") {
      grouped[tenantId].total_paid_amount += amount;
      grouped[tenantId].approved_count += 1;
    } else if(payment.status === "paid"){
      grouped[tenantId].total_paid_amount += amount;
      grouped[tenantId].paid_count += 1;
    } else if (payment.status === "rejected") {
      grouped[tenantId].total_rejected_amount += amount;
      grouped[tenantId].rejected_count += 1;
    } else if (payment.status === "pending") {
      grouped[tenantId].pending_count += 1;
    }

    grouped[tenantId].payment_count += 1;

    if (payment.booking_id && payment.payment_mode === "online") {
      grouped[tenantId].has_online_booking = true;
    }
    if (!payment.booking_id || payment.payment_mode !== "online") {
      grouped[tenantId].has_manual_payment = true;
    }

    const paymentDate = new Date(payment.payment_date);
    if (!grouped[tenantId].last_payment_date || paymentDate > new Date(grouped[tenantId].last_payment_date)) {
      grouped[tenantId].last_payment_date = payment.payment_date;
    }
    if (!grouped[tenantId].first_payment_date || paymentDate < new Date(grouped[tenantId].first_payment_date)) {
      grouped[tenantId].first_payment_date = payment.payment_date;
    }
  });

  let groupedArray = Object.values(grouped);

  // Sort by last payment date descending
  groupedArray.sort((a: any, b: any) => {
    if (!a.last_payment_date) return 1;
    if (!b.last_payment_date) return -1;
    return new Date(b.last_payment_date).getTime() - new Date(a.last_payment_date).getTime();
  });


  // ✅ STEP 1: Calculate accurate pending amounts for each tenant
  // This combines rent pending (from accuratePendingRentMap) and deposit pending (from security deposit info)
  for (const group of groupedArray) {
    const tenantId = group.tenant_id;
    
    // Get rent pending from accuratePendingRentMap
    const rentPending = accuratePendingRentMap.get(tenantId) || 0;
    
    // Get deposit pending from security deposit info
    let depositPending = 0;
    const completeTenant = tenants.find((t) => t.id === tenantId);
    if (completeTenant) {
      // Get security deposit payments for this tenant
      const assignmentDate = completeTenant?.current_assignment?.assignment_date 
  || completeTenant?.current_assignment?.created_at;
const depositPayments = payments.filter(p => 
  p.tenant_id === tenantId && 
  p.payment_type === "security_deposit" &&
  (!assignmentDate || new Date(p.payment_date) >= new Date(assignmentDate))
);
      const totalDepositPaid = depositPayments
        .filter((p) => p.status === "approved" || p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const totalSecurityDeposit:any = completeTenant?.security_deposit || 
        completeTenant?.current_assignment?.security_deposit || 0;
      depositPending = Math.max(0, totalSecurityDeposit - totalDepositPaid);
    }
    
    // Store both values
    group.rent_pending_amount = rentPending;
    group.deposit_pending_amount = depositPending;
    
    // ✅ Total pending = rent pending + deposit pending
    group.total_pending_amount = rentPending + depositPending;
  }


  // ── ALL FILTERS RUN HERE on full dataset ──

 // 1. Tenant name search
  const searchTerm = columnFilters?.tenant_name?.toLowerCase() || "";
  if (searchTerm) {
    groupedArray = groupedArray.filter((group: any) => {
      const salutation = getTenantSalutation(group.tenant_id) || "";
      const fullName = `${salutation} ${group.tenant_name || ""}`.toLowerCase();
      return fullName.includes(searchTerm);
    });
  }

  // 1b. Property filter from column header
  const propertySearchTerm = columnFilters?.property_name?.toLowerCase() || "";
  if (propertySearchTerm) {
    groupedArray = groupedArray.filter((group: any) => {
      const propertyName = (group.property_name || "").toLowerCase();
      return propertyName.includes(propertySearchTerm);
    });
  }

  // 1c. Room/Bed filter from column header
  const roomBedSearchTerm = columnFilters?.room_bed?.toLowerCase() || "";
  if (roomBedSearchTerm) {
    groupedArray = groupedArray.filter((group: any) => {
      const roomNumber = (group.room_number || "").toString().toLowerCase();
      const bedNumber = (group.bed_number || "").toString().toLowerCase();
      return roomNumber.includes(roomBedSearchTerm) || bedNumber.includes(roomBedSearchTerm);
    });
  }

  // 1d. Contact filter from column header
  const contactSearchTerm = columnFilters?.contact?.toLowerCase() || "";
  if (contactSearchTerm) {
    groupedArray = groupedArray.filter((group: any) => {
      const phone = (group.tenant_phone || "").toLowerCase();
      const email = (group.tenant_email || "").toLowerCase();
      return phone.includes(contactSearchTerm) || email.includes(contactSearchTerm);
    });
  }
// 2. Room number filter - USE THE PARAMETER
  if (roomFilterValue && roomFilterValue.trim() !== "") {
    const searchRoom = roomFilterValue.toLowerCase().trim();
    groupedArray = groupedArray.filter((group: any) => {
      const roomNumber = (group.room_number || "").toString().toLowerCase();
      const bedNumber = (group.bed_number || "").toString().toLowerCase();
      const propertyName = (group.property_name || "").toLowerCase();
      return (
        roomNumber.includes(searchRoom) ||
        bedNumber.includes(searchRoom) ||
        propertyName.includes(searchRoom)
      );
    });
  }

  // / 3. Payment type filter - USE THE PARAMETER
  if (paymentTypeFilterValue && paymentTypeFilterValue !== "all") {
    groupedArray = groupedArray.filter((group: any) =>
      group.payments.some((p: any) => p.payment_type === paymentTypeFilterValue)
    );
  }

// 4. Exact pending amount filter - USING ACCURATE PENDING RENT FROM BACKEND
if (exactPendingFilterValue && accuratePendingRentMap.size > 0) {
  const exactPending = parseFloat(exactPendingFilterValue);
  if (!isNaN(exactPending)) {
    groupedArray = groupedArray.filter((group: any) => {
      const accuratePending = accuratePendingRentMap.get(group.tenant_id) || 0;
      return accuratePending === exactPending;
    });
  }
}


  // 5. Payment count filter
  if (columnFilters?.payment_count) {
    const count = parseInt(columnFilters.payment_count);
    if (!isNaN(count)) {
      groupedArray = groupedArray.filter((group: any) => group.payment_count === count);
    }
  }

  // 6. Amount filters
  if (columnFilters?.amount?.trim()) {
    groupedArray = groupedArray.filter((group: any) =>
      group.total_amount.toString().includes(columnFilters.amount.trim())
    );
  }
  if (columnFilters?.total_paid_amount?.trim()) {
    groupedArray = groupedArray.filter((group: any) =>
      group.total_paid_amount.toString().includes(columnFilters.total_paid_amount.trim())
    );
  }
  if (columnFilters?.total_rejected_amount?.trim()) {
    groupedArray = groupedArray.filter((group: any) =>
      group.total_rejected_amount.toString().includes(columnFilters.total_rejected_amount.trim())
    );
  }

  // 7. Status filter
  if (columnFilters?.status && columnFilters.status !== "all") {
    groupedArray = groupedArray.filter((group: any) => {
      if (columnFilters.status === "paid") return group.paid_count > 0;
      if (columnFilters.status === "approved") return group.approved_count > 0;
      if (columnFilters.status === "pending") return group.pending_count > 0;
      if (columnFilters.status === "rejected") return group.rejected_count > 0;
      return true;
    });
  }

 // 8. Last payment date column filter
  if (columnFilters?.payment_date) {
    const searchTerm2 = columnFilters.payment_date.toLowerCase().trim();
    if (searchTerm2) {
      groupedArray = groupedArray.filter((group: any) => {
        if (!group.last_payment_date) return false;
        const lastPayDate = new Date(group.last_payment_date);
        if (isNaN(lastPayDate.getTime())) return false;
        const day = lastPayDate.getDate();
        const month = lastPayDate.getMonth() + 1;
        const year = lastPayDate.getFullYear();
        const formats = [
          `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`,
          `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`,
          `${day}/${month}/${year}`,
          `${day}/${month}/${year.toString().slice(-2)}`,
          month.toString().padStart(2, "0"),
          month.toString(),
          year.toString(),
          year.toString().slice(-2),
          lastPayDate.toLocaleString("default", { month: "long" }).toLowerCase(),
          lastPayDate.toLocaleString("default", { month: "short" }).toLowerCase(),
        ];
        return formats.some((f) => f.includes(searchTerm2));
      });
    }
  }

  // 9. Property filter
  if (filterPropertyId && filterPropertyId !== "all") {
    groupedArray = groupedArray.filter((group: any) => {
      const groupPropertyId = (
        group.property_id ||
        tenants.find((t: any) => t.id === group.tenant_id)?.current_assignment?.property_id
      )?.toString();
      return groupPropertyId === filterPropertyId;
    });
  }

// 10. Date range filter — any payment in range
if (!ignoreDateFiltersValue && (startDateValue || endDateValue)) {
  groupedArray = groupedArray.filter((group: any) =>
    group.payments.some((p: any) => {
      const payDate = new Date(p.payment_date);
      payDate.setHours(0, 0, 0, 0);
      if (startDateValue) {
        const start = new Date(startDateValue);
        start.setHours(0, 0, 0, 0);
        if (payDate < start) return false;
      }
      if (endDateValue) {
        const end = new Date(endDateValue);
        end.setHours(23, 59, 59, 999);
        if (payDate > end) return false;
      }
      return true;
    })
  );
}

// 11. Pending rent only filter - USE THE PARAMETER
if (showPendingRentOnlyValue && pendingRentTenantIds.length > 0) {
  groupedArray = groupedArray.filter((group: any) => 
    pendingRentTenantIds.includes(group.tenant_id)
  );
}

  const totalItems = groupedArray.length;
const isAll = itemsPerPage === "All";
const startIndex = isAll ? 0 : (page - 1) * (itemsPerPage as number);
const paginatedItems = isAll ? groupedArray : groupedArray.slice(startIndex, startIndex + (itemsPerPage as number));
const totalPages = isAll ? 1 : Math.ceil(totalItems / (itemsPerPage as number));

return {
  items: paginatedItems,
  totalItems,
  totalPages,
};
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
    const searchTerm = columnFilters.tenant_name?.toLowerCase() || "";
    const tenantName = getTenantName(payment.tenant_id).toLowerCase();

    // Get tenant details for room/property search
    const completeTenant = tenants.find((t) => t.id === payment.tenant_id);
    const roomNumber = (
      completeTenant?.room_number ||
      completeTenant?.current_assignment?.room_number ||
      payment.room_number ||
      ""
    )
      .toString()
      .toLowerCase();
    const propertyName = (
      completeTenant?.property_name ||
      completeTenant?.current_assignment?.property_name ||
      payment.property_name ||
      ""
    ).toLowerCase();
    const bedNumber = (
      completeTenant?.bed_number ||
      completeTenant?.current_assignment?.bed_number ||
      payment.bed_number ||
      ""
    )
      .toString()
      .toLowerCase();

    const matchesDate =
      !columnFilters.payment_date ||
      new Date(payment.payment_date).toISOString().split("T")[0] ===
        columnFilters.payment_date;

    const matchesTenant =
      !searchTerm ||
      tenantName.includes(searchTerm) ||
      roomNumber.includes(searchTerm) ||
      propertyName.includes(searchTerm) ||
      bedNumber.includes(searchTerm);

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

  // Apply pagination to payments data
  const paginatedPaymentGroups = groupPaymentsByTenant(
    sortedPayments,
    paymentPagination.currentPage,
paymentPagination.itemsPerPage,
  paymentTypeFilter,  // Pass the value
exactPendingFilter,  // Pass the value
   ignoreDateFilters,
   roomFilterGlobal,  
  showPendingRentOnly, 
  filterStartDate,    // ← ADD
  filterEndDate, 
  );

  // Add this function for demands pagination
  const paginatedDemandsData = () => {
    const itemsPerPage = demandPagination.itemsPerPage;
const isAll = itemsPerPage === "All";
const startIndex = isAll ? 0 : (demandPagination.currentPage - 1) * (itemsPerPage as number);
const endIndex = isAll ? filteredDemands.length : startIndex + (itemsPerPage as number);
const paginated = filteredDemands.slice(startIndex, endIndex);
const totalPages = isAll ? 1 : Math.ceil(filteredDemands.length / (itemsPerPage as number));

return {
  items: paginated,
  totalPages,
};
  };
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
  // Bed Assignment Details Component - Table Row Format (FIXED)
  const BedAssignmentTable = ({
    formData,
  }: {
    formData: PaymentFormData | null;
  }) => {
    // Add null checks and safe navigation
    if (!formData?.room_info) {
      return (
        <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
            <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <Bed className="h-3.5 w-3.5" />
              Bed Assignment Details
            </h4>
          </div>
          <div className="p-4 text-center text-slate-500 text-sm">
            No bed assignment found for this tenant
          </div>
        </div>
      );
    }

    // Safe access with fallback values
    const propertyName = formData.room_info.property_name || "N/A";
    const roomNumber = formData.room_info.room_number || "N/A";
    const bedNumber = formData.room_info.bed_number || "N/A";
    const bedType = formData.room_info.bed_type || "N/A";
    const monthlyRent = formData.monthly_rent || 0;

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
                <td className="p-2 text-sm">{propertyName}</td>
                <td className="p-2 text-sm">{roomNumber}</td>
                <td className="p-2 text-sm font-medium">#{bedNumber}</td>
                <td className="p-2 text-sm capitalize">{bedType}</td>
                <td className="p-2 text-sm font-semibold text-green-600">
                  ₹
                  {typeof monthlyRent === "number"
                    ? monthlyRent.toLocaleString()
                    : monthlyRent}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Rent Summary Table Component

  // In RentSummaryTable component
const RentSummaryTable = ({ formData }: { formData: any }) => {
  if (!formData) return null;

  const months = formData.month_wise_history || [];
  const previousStay = formData.previous_stay || null;
  const originalMonthlyRent = formData.monthly_rent || 0;
  const firstMonthProrated = formData.first_month_prorated;

  // Calculate totals for current stay
  const totalPaid = months.reduce((sum: number, m: any) => sum + m.paid, 0);
  const totalPending = months.reduce((sum: number, m: any) => sum + m.pending, 0);
  const totalDiscount = months.reduce((sum: number, m: any) => sum + (m.discount_applied || 0), 0);

  return (
    <div className="space-y-4">
      {/* ────────────────────────────────────────────────────────────────
          PREVIOUS STAY SECTIONS — One per vacate cycle
          ──────────────────────────────────────────────────────────────── */}
      {Array.isArray(previousStay) && previousStay.length > 0 && previousStay.map((stay: any, stayIdx: number) => {
        const stayTotalRent = stay.month_wise_history?.reduce((s: number, m: any) => s + m.rent, 0) || 0;
        const stayTotalPaid = stay.month_wise_history?.reduce((s: number, m: any) => s + m.paid, 0) || 0;
        const stayTotalPending = stay.month_wise_history?.reduce((s: number, m: any) => s + m.pending, 0) || 0;
        const stayTotalDiscount = stay.month_wise_history?.reduce((s: number, m: any) => s + (m.discount_applied || 0), 0) || 0;

        return (
          <div key={stayIdx} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-amber-50 px-4 py-2 border-b border-amber-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-amber-700 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Previous Stay {stay.stay_number} — Reference Only
                  <span className="text-[10px] font-normal text-amber-600 ml-1">
                    (Vacated: {stay.vacate_date ? format(new Date(stay.vacate_date), 'dd MMM yyyy') : 'N/A'})
                  </span>
                </h4>
                <Badge variant="outline" className="text-[9px] bg-amber-100 text-amber-700 border-amber-300">
                  Historical
                </Badge>
              </div>
              <p className="text-[10px] text-amber-600 mt-0.5">
                {stay.month_wise_history?.[0]?.month} {stay.month_wise_history?.[0]?.year} — {stay.month_wise_history?.[stay.month_wise_history?.length - 1]?.month} {stay.month_wise_history?.[stay.month_wise_history?.length - 1]?.year}
                {stay.deposit && (
                  <span className="ml-2">
                    • Deposit: ₹{stay.deposit.paid?.toLocaleString()} / ₹{stay.deposit.required?.toLocaleString()} paid
                  </span>
                )}
                <span className="ml-2 text-amber-500">(For reference only)</span>
              </p>
            </div>

            {/* Table */}
            <div className="p-4 max-h-[200px] overflow-y-auto bg-amber-50/30">
              <table className="w-full text-sm">
                <thead className="bg-amber-100/50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 text-xs font-medium text-slate-600">Month</th>
                    <th className="text-right p-2 text-xs font-medium text-slate-600">Rent</th>
                    <th className="text-right p-2 text-xs font-medium text-slate-600">Discount</th>
                    <th className="text-right p-2 text-xs font-medium text-slate-600">Paid</th>
                    <th className="text-right p-2 text-xs font-medium text-slate-600">Pending</th>
                    <th className="text-center p-2 text-xs font-medium text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stay.month_wise_history?.map((month: any, index: number) => {
                    const isProrated = month.is_prorated || false;
                    const proratedDays = month.prorated_days || 0;
                    const discountAmount = month.discount_applied || 0;

                    return (
                      <tr
                        key={`prev-${stayIdx}-${index}`}
                        className={`border-t border-amber-100 ${
                          month.status === 'paid' ? 'bg-green-50/30' : 
                          month.pending > 0 ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <td className="p-2 text-sm font-medium">
                          {month.month} {month.year}
                          {isProrated && (
                            <span className="ml-1 text-[10px] text-amber-600">
                              (Prorated - {proratedDays} days)
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          ₹{month.rent?.toLocaleString()}
                          {month.original_rent && month.original_rent > month.rent && (
                            <span className="text-[10px] text-slate-400 line-through ml-1">
                              ₹{month.original_rent?.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-right">
                          {discountAmount > 0 ? (
                            <span className="text-green-600 font-medium">
                              -₹{discountAmount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-2 text-right text-green-600">
                          ₹{month.paid?.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          <span className={month.pending > 0 ? "text-amber-600 font-medium" : "text-green-600"}>
                            ₹{month.pending?.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            month.status === 'paid' ? 'bg-green-100 text-green-800' :
                            month.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {month.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-amber-100/50">
                  <tr className="border-t border-amber-200 font-medium">
                    <td className="p-2 text-sm">Total</td>
                    <td className="p-2 text-right">₹{stayTotalRent.toLocaleString()}</td>
                    <td className="p-2 text-right text-green-600">₹{stayTotalDiscount.toLocaleString()}</td>
                    <td className="p-2 text-right text-green-600">₹{stayTotalPaid.toLocaleString()}</td>
                    <td className="p-2 text-right text-amber-600">₹{stayTotalPending.toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })}

      {/* ────────────────────────────────────────────────────────────────
          BACKWARD COMPAT: Single Previous Stay (non-array)
          ──────────────────────────────────────────────────────────────── */}
      {previousStay && !Array.isArray(previousStay) && previousStay.month_wise_history?.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-amber-700 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Previous Stay — Reference Only
                <span className="text-[10px] font-normal text-amber-600 ml-1">
                  (Vacated: {previousStay.vacate_date ? format(new Date(previousStay.vacate_date), 'dd MMM yyyy') : 'N/A'})
                </span>
              </h4>
              <Badge variant="outline" className="text-[9px] bg-amber-100 text-amber-700 border-amber-300">
                Historical
              </Badge>
            </div>
            <p className="text-[10px] text-amber-600 mt-0.5">
              {previousStay.month_wise_history[0]?.month} {previousStay.month_wise_history[0]?.year} — {previousStay.month_wise_history[previousStay.month_wise_history.length - 1]?.month} {previousStay.month_wise_history[previousStay.month_wise_history.length - 1]?.year}
              {previousStay.deposit && (
                <span className="ml-2">
                  • Deposit: ₹{previousStay.deposit.paid?.toLocaleString()} / ₹{previousStay.deposit.required?.toLocaleString()} paid
                </span>
              )}
              <span className="ml-2 text-amber-500">(For reference only)</span>
            </p>
          </div>
          <div className="p-4 max-h-[200px] overflow-y-auto bg-amber-50/30">
            <table className="w-full text-sm">
              <thead className="bg-amber-100/50 sticky top-0">
                <tr>
                  <th className="text-left p-2 text-xs font-medium text-slate-600">Month</th>
                  <th className="text-right p-2 text-xs font-medium text-slate-600">Rent</th>
                  <th className="text-right p-2 text-xs font-medium text-slate-600">Discount</th>
                  <th className="text-right p-2 text-xs font-medium text-slate-600">Paid</th>
                  <th className="text-right p-2 text-xs font-medium text-slate-600">Pending</th>
                  <th className="text-center p-2 text-xs font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {previousStay.month_wise_history.map((month: any, index: number) => {
                  const isProrated = month.is_prorated || false;
                  const proratedDays = month.prorated_days || 0;
                  const discountAmount = month.discount_applied || 0;

                  return (
                    <tr
                      key={`prev-single-${index}`}
                      className={`border-t border-amber-100 ${
                        month.status === 'paid' ? 'bg-green-50/30' : 
                        month.pending > 0 ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="p-2 text-sm font-medium">
                        {month.month} {month.year}
                        {isProrated && (
                          <span className="ml-1 text-[10px] text-amber-600">
                            (Prorated - {proratedDays} days)
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-right">₹{month.rent?.toLocaleString()}</td>
                      <td className="p-2 text-right">
                        {discountAmount > 0 ? (
                          <span className="text-green-600 font-medium">
                            -₹{discountAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-2 text-right text-green-600">₹{month.paid?.toLocaleString()}</td>
                      <td className="p-2 text-right">
                        <span className={month.pending > 0 ? "text-amber-600 font-medium" : "text-green-600"}>
                          ₹{month.pending?.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          month.status === 'paid' ? 'bg-green-100 text-green-800' :
                          month.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {month.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-amber-100/50">
                <tr className="border-t border-amber-200 font-medium">
                  <td className="p-2 text-sm">Total</td>
                  <td className="p-2 text-right">₹{previousStay.month_wise_history.reduce((s: number, m: any) => s + m.rent, 0).toLocaleString()}</td>
                  <td className="p-2 text-right text-green-600">₹{previousStay.month_wise_history.reduce((s: number, m: any) => s + (m.discount_applied || 0), 0).toLocaleString()}</td>
                  <td className="p-2 text-right text-green-600">₹{previousStay.month_wise_history.reduce((s: number, m: any) => s + m.paid, 0).toLocaleString()}</td>
                  <td className="p-2 text-right text-amber-600">₹{previousStay.month_wise_history.reduce((s: number, m: any) => s + m.pending, 0).toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          CURRENT STAY SECTION
          ──────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <IndianRupee className="h-3.5 w-3.5" />
              {Array.isArray(previousStay) && previousStay.length > 0 
                ? `Current Stay — Rent History (Stay ${previousStay.length + 1})` 
                : previousStay 
                  ? 'Current Stay — Rent History' 
                  : 'Rent History Since Joining'}
              {formData.is_reassigned && (
                <span className="text-[10px] font-normal text-blue-500 ml-1">
                  (From {formData.check_in_date ? format(new Date(formData.check_in_date), 'dd MMM yyyy') : 'N/A'})
                </span>
              )}
            </h4>
            {firstMonthProrated && (
              <Badge
                variant="outline"
                className="text-[9px] bg-amber-50 text-amber-700 border-amber-200"
              >
                <Clock className="h-2.5 w-2.5 mr-1" />
                First month: {firstMonthProrated.days} days @ ₹
                {firstMonthProrated.daily_rate}/day
              </Badge>
            )}
          </div>
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
                <th className="text-left p-2 text-xs font-medium text-slate-600">Month</th>
                <th className="text-right p-2 text-xs font-medium text-slate-600">Rent</th>
                <th className="text-right p-2 text-xs font-medium text-slate-600">Discount</th>
                <th className="text-right p-2 text-xs font-medium text-slate-600">Paid</th>
                <th className="text-right p-2 text-xs font-medium text-slate-600">Pending</th>
                <th className="text-center p-2 text-xs font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month: any, index: number) => {
                const isCurrentMonth = (() => {
                  const now = new Date();
                  return (
                    month.month_num === now.getMonth() + 1 &&
                    month.year === now.getFullYear()
                  );
                })();

                const proratedTooltip = month.is_prorated
                  ? `Prorated: ${month.prorated_days} days × ₹${month.prorated_daily_rate}/day = ₹${month.rent.toLocaleString()} (was ₹${month.original_rent?.toLocaleString()}/month)`
                  : "";

                const discountAmount = month.discount_applied || 0;

                return (
                  <tr
                    key={`${month.month_key || index}-${index}`}
                    className={`border-t border-slate-200 ${
                      isCurrentMonth ? "bg-blue-50" : ""
                    } ${discountAmount > 0 ? "bg-green-50/40" : ""} ${month.is_prorated ? "bg-amber-50/30" : ""}`}
                    title={proratedTooltip}
                  >
                    <td className="p-2 text-sm font-medium">
                      {month.month} {month.year}
                      {discountAmount > 0 && (
                        <span className="ml-2 text-[10px] text-green-600">
                          (Discounted)
                        </span>
                      )}
                      {month.is_prorated && discountAmount === 0 && (
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
                    <td className="p-2 text-right">
                      {discountAmount > 0 ? (
                        <span className="text-green-600 font-medium">
                          -₹{discountAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-2 text-right text-green-600 font-medium">
                      ₹{month.paid?.toLocaleString()}
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
              ₹{totalPaid?.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200">
            <p className="text-xs text-slate-500">Total Pending</p>
            <p className="text-lg font-bold text-amber-600">
              ₹{totalPending?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


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
              <p className="text-xs text-slate-500">Room/Bed</p>
              <p className="text-sm font-medium">
                Room {securityDepositInfo.room_number || "N/A"}
                {securityDepositInfo.bed_number &&
                  ` • Bed #${securityDepositInfo.bed_number}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Security Deposit</p>
              <p className="text-sm font-bold text-blue-600">
                ₹{(securityDepositInfo.security_deposit || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Already Paid</p>
              <p className="text-sm font-medium text-green-600">
                ₹{(securityDepositInfo.paid_amount || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Pending Amount</p>
              <p className="text-sm font-bold text-amber-600">
                ₹{(securityDepositInfo.pending_amount || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {(securityDepositInfo.security_deposit || 0) > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Payment Progress</span>
                <span>
                  {Math.round(
                    ((securityDepositInfo.paid_amount || 0) /
                      (securityDepositInfo.security_deposit || 1)) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                  style={{
                    width: `${
                      ((securityDepositInfo.paid_amount || 0) /
                        (securityDepositInfo.security_deposit || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

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
  // Filtered demands - with null checks to prevent crashes
  const filteredDemands = demands.filter((demand) => {
      const phone = getTenantPhone(demand.tenant_id);  

    const tenantName = getTenantName(demand.tenant_id).toLowerCase();

    const matchesStatus =
      demandFilters.status === "all" ||
      !demandFilters.status ||
      demand.status === demandFilters.status;

    const matchesTenant =
      !demandFilters.tenant ||
      tenantName.includes(demandFilters.tenant.toLowerCase());

      // ✅ NEW: Payment type filter
  const matchesPaymentType =
    !demandFilters.payment_type ||
    demandFilters.payment_type === "all" ||
    demand.payment_type === demandFilters.payment_type;

    // Date filter (created_at)
  const matchesDate =
  demandFilters.ignore_date ||
  !demandFilters.date ||
  format(new Date(demand.created_at), "dd/MM/yy").includes(demandFilters.date);

    // Due date range filters
    const matchesFromDate = (() => {
  if (!demandFilters.from_date) return true;
  const dueDate = new Date(demand.due_date);
  dueDate.setHours(0, 0, 0, 0);
  const fromDate = new Date(demandFilters.from_date);
  fromDate.setHours(0, 0, 0, 0);
  return dueDate >= fromDate;
})();

    const matchesToDate = (() => {
      if (!demandFilters.to_date) return true;
      const dueDate = new Date(demand.due_date);
      dueDate.setHours(23, 59, 59, 999);
      const toDate = new Date(demandFilters.to_date);
      toDate.setHours(23, 59, 59, 999);
      return dueDate <= toDate;
    })();

    // Amount filter
    const matchesAmount =
      !demandFilters.amount ||
      Number(demand.amount)
        .toString()
        .includes(demandFilters.amount.toString());

    // Room/Bed filter
    const matchesRoom =
      !demandFilters.room ||
      (demand.room_number &&
        demand.room_number
          .toString()
          .toLowerCase()
          .includes(demandFilters.room.toLowerCase())) ||
      (demand.bed_number &&
        demand.bed_number.toString().includes(demandFilters.room));
       const matchesContact =
  !demandFilters.contact ||
  (getTenantPhone(demand.tenant_id) && getTenantPhone(demand.tenant_id).includes(demandFilters.contact));

const matchesProperty =
  !demandFilters.property ||
  (demand.property_name &&
    demand.property_name.toLowerCase().includes(demandFilters.property.toLowerCase()));

    return (
      matchesStatus &&
      matchesTenant &&
      matchesPaymentType &&
      matchesDate &&
      matchesFromDate &&
      matchesToDate &&
      matchesAmount &&
      matchesRoom &&
       matchesContact && 
       matchesProperty

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

const handleResendReminder = async (demand: DemandPayment, newAmount?: number, newDueDate?: string, newDescription?: string) => {
  try {
    if (!demand.tenant_id) {
      toast.error("Tenant ID not found for this demand");
      return;
    }

    toast.loading(`Creating new demand for ${demand.tenant_name}...`, { id: "resend-reminder" });
    
    // Create a NEW demand record with the updated values
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/demands`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: demand.tenant_id,
          amount: newAmount || demand.amount,
          due_date: newDueDate || demand.due_date,
          payment_type: demand.payment_type,
          description: newDescription || demand.description || `Payment reminder for ${demand.payment_type}`,
          send_email: true,
          send_sms: false
        })
      }
    );
    
    const data = await response.json();
    
    toast.dismiss("resend-reminder");
    
    if (data.success) {
      toast.success(`New demand created and sent to ${demand.tenant_name} successfully!`);
      loadDemands(); // Refresh the demands list
    } else {
      toast.error(data.message || "Failed to create demand");
    }
  } catch (error) {
    toast.dismiss("resend-reminder");
    console.error("Error creating demand:", error);
    toast.error("Failed to create demand");
  }
};

const handleResendClick = async (demand: DemandPayment) => {
  setResendDemand(demand);
  setIsResendPopupOpen(true);
  setResendLoading(true);
  try {
    // Check if this is a security deposit demand
    const isSecurityDeposit = demand.payment_type === "security_deposit";
    
    if (isSecurityDeposit) {
      // For security deposit, fetch deposit info
      const depositResponse = await paymentApi.getSecurityDepositInfo(demand.tenant_id);
      if (depositResponse.success) {
        // Set security deposit data in a format that can be displayed
        setResendTenantFormData({
          is_security_deposit: true,
          security_deposit_info: depositResponse.data,
          tenant_name: demand.tenant_name,
          tenant_id: demand.tenant_id
        });
      }
    } else {
      // For rent, fetch payment history as before
      const formResponse = await paymentApi.getTenantPaymentFormData(demand.tenant_id);
      if (formResponse.success) {
        setResendTenantFormData(formResponse.data);
      }
      
      // Fetch all payments for this tenant
      const tenantPayments = payments.filter(p => p.tenant_id === demand.tenant_id);
      setResendTenantPayments(tenantPayments);
    }
  } catch (error) {
    toast.error("Failed to load tenant payment details");
  } finally {
    setResendLoading(false);
  }
};

// Helper to show PDF inline in current tab (not new tab)
const showPdfInModal = (blob: Blob, title: string, count: number) => {
  const url = URL.createObjectURL(blob);
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;";
  
  const box = document.createElement("div");
  box.style.cssText = "width:100%;max-width:900px;height:92vh;background:white;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 25px 60px rgba(0,0,0,0.4);";
  
  const header = document.createElement("div");
  header.style.cssText = "background:linear-gradient(135deg,#1e3c72,#2a5298);color:white;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;";
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:18px;">📄</span>
      <span style="font-weight:600;font-size:14px;">${title} — ${count} document(s)</span>
    </div>
    <div style="display:flex;gap:8px;align-items:center;">
      <a href="${url}" download="${title.toLowerCase().replace(/\s+/g,'-')}-${Date.now()}.pdf"
        style="background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);padding:5px 14px;border-radius:6px;font-size:12px;text-decoration:none;cursor:pointer;display:flex;align-items:center;gap:4px;">
        ⬇ Download
      </a>
      <button id="closePdfModal" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:white;width:30px;height:30px;border-radius:6px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;">×</button>
    </div>
  `;
  
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.cssText = "flex:1;border:none;width:100%;";
  
  box.appendChild(header);
  box.appendChild(iframe);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  
  const close = () => { URL.revokeObjectURL(url); overlay.remove(); };
  header.querySelector("#closePdfModal")?.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
};

  return (
    <div className="bg-slate-50">
      <div className="p-0 sm:p-0 md:p-0 space-y-2 sm:space-y-3">

{/* Detailed Stats Cards */}
<div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2 sticky top-16 z-10">
  {/* Total Rent Collected Card */}
  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <IndianRupee className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600" />
        <p className="text-[9px] sm:text-[10px] text-blue-700 font-medium">
          Total Rent Collected
        </p>
      </div>
      <p className="text-xs sm:text-sm font-bold text-blue-800">
        ₹{detailedStats.total_rent_collected?.toLocaleString() || 0}
      </p>
      <p className="text-[8px] text-blue-600 mt-0.5">
        All time rent payments
      </p>
    </CardContent>
  </Card>

  {/* Net Deposit Card */}
  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
        <p className="text-[9px] sm:text-[10px] text-green-700 font-medium">
          Net Deposit
        </p>
      </div>
      <p className="text-xs sm:text-sm font-bold text-green-800">
        ₹{detailedStats.net_deposit_collected?.toLocaleString() || 0}
      </p>
      <p className="text-[8px] text-green-600 mt-0.5">
        Collected: ₹{detailedStats.total_deposit_collected?.toLocaleString() || 0}
      </p>
    </CardContent>
  </Card>

  {/* Total Refunded Card */}
  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-sm">
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <ReceiptIndianRupee className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-orange-600" />
        <p className="text-[9px] sm:text-[10px] text-orange-700 font-medium">
          Total Refunded
        </p>
      </div>
      <p className="text-xs sm:text-sm font-bold text-orange-800">
        ₹{detailedStats.total_refunded?.toLocaleString() || 0}
      </p>
      <p className="text-[8px] text-orange-600 mt-0.5">
        Deposit refunds
      </p>
    </CardContent>
  </Card>

  {/* Penalties Collected Card */}
  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-sm">
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-600" />
        <p className="text-[9px] sm:text-[10px] text-red-700 font-medium">
          Penalties Collected
        </p>
      </div>
      <p className="text-xs sm:text-sm font-bold text-red-800">
        ₹{detailedStats.total_penalties_collected?.toLocaleString() || 0}
      </p>
      <p className="text-[8px] text-red-600 mt-0.5">
        From vacated tenants
      </p>
    </CardContent>
  </Card>

  {/* This Month Expected Rent Card */}
  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm">
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600" />
        <p className="text-[9px] sm:text-[10px] text-purple-700 font-medium">
          This Month Expected
        </p>
      </div>
      <p className="text-xs sm:text-sm font-bold text-purple-800">
        ₹{detailedStats.this_month_expected_rent?.toLocaleString() || 0}
      </p>
      <p className="text-[8px] text-purple-600 mt-0.5">
        {new Date().toLocaleString("default", { month: "long" })} {new Date().getFullYear()} • Expected rent
      </p>
    </CardContent>
  </Card>

  {/* This Month Received Rent Card */}
  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
        <p className="text-[9px] sm:text-[10px] text-green-700 font-medium">
          This Month Received
        </p>
      </div>
      <p className="text-xs sm:text-sm font-bold text-green-800">
        ₹{detailedStats.this_month_received_rent?.toLocaleString() || 0}
      </p>
      <p className="text-[8px] text-green-600 mt-0.5">
        {new Date().toLocaleString("default", { month: "long" })} {new Date().getFullYear()} • Received rent
      </p>
    </CardContent>
  </Card>

  {/* This Month Pending Rent Card */}
  <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-0 shadow-sm">
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-600" />
        <p className="text-[9px] sm:text-[10px] text-amber-700 font-medium">
          This Month Pending
        </p>
      </div>
      <p className="text-xs sm:text-sm font-bold text-amber-800">
        ₹{detailedStats.this_month_pending_rent?.toLocaleString() || 0}
      </p>
      <p className="text-[8px] text-amber-600 mt-0.5">
        {new Date().toLocaleString("default", { month: "long" })} {new Date().getFullYear()} • Pending rent
      </p>
    </CardContent>
  </Card>

  {/* Total Transactions Card */}
  <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-0 shadow-sm">
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <CreditCard className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-cyan-600" />
        <p className="text-[9px] sm:text-[10px] text-cyan-700 font-medium">
          Transactions
        </p>
      </div>
      <p className="text-xs sm:text-sm font-bold text-cyan-800">
        {detailedStats.total_transactions?.toLocaleString() || 0}
      </p>
      <p className="text-[8px] text-cyan-600 mt-0.5">
        Total payments processed
      </p>
    </CardContent>
  </Card>
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

          <div className="flex items-center justify-between gap-2">
  {/* Left side: Filter button for current tab */}
  <div>
    {activeTab === "payments" && (
      <Button
        size="sm"
        variant="outline"
        className="h-8  bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] border-blue-600 text-white hover:bg-blue-600 hover:text-white flex items-center gap-1"
        onClick={() => setShowPaymentFilterSidebar(true)}
      >
        <Filter className="h-3.5 w-3.5" />
        <span className="text-xs">Filter</span>
      </Button>
    )}
    {activeTab === "receipts" && (
      <Button
        size="sm"
        variant="outline"
        className="h-8  bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] border-blue-600 text-white hover:bg-blue-600 hover:text-white flex items-center gap-1"
        onClick={() => setShowReceiptFilterSidebar(true)}
      >
        <Filter className="h-3.5 w-3.5" />
        <span className="text-xs">Filter</span>
      </Button>
    )}
    {activeTab === "demands" && (
      <Button
        size="sm"
        variant="outline"
        className="h-8  bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] border-blue-600 text-white hover:bg-blue-600 hover:text-white flex items-center gap-1"
        onClick={() => setShowDemandFilterSidebar(true)}
      >
        <Filter className="h-3.5 w-3.5" />
        <span className="text-xs">Filter</span>
      </Button>
    )}
  </div>

  {/* Right side: Action buttons */}
  <div className="flex gap-2">
    {can("create_payments") && (
      <Button
        size="sm"
        className="h-8 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm flex-1 sm:flex-none"
        onClick={async () => {
          if (properties.length === 0) await fetchProperties();
          resetPaymentForm();
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
        className="h-8 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm flex-1 sm:flex-none"
        onClick={() => {
          resetDemandPaymentForm();
          setIsDemandPaymentOpen(true);
        }}
      >
        <Bell className="h-3.5 w-3.5 mr-1" />
        <span className="text-xs">Demand Payment</span>
      </Button>
    )}
  </div>
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
              onEdit={handleEditPayment}
              onDelete={(payment) => {
                setSelectedPayment(payment);
                setIsDeleteDialogOpen(true);
              }}
              actionLoading={actionLoading}
onViewReceipt={handleViewReceipt}
              setActiveTab={setActiveTab}
              expandedRows={expandedRows}
              onToggleExpand={toggleRowExpansion}
              groupPaymentsByTenant={(payments: any[]) =>
                groupPaymentsByTenant(
                  payments,
                  paymentPagination.currentPage,
                  paymentPagination.itemsPerPage,
                )
              }
              setIsAddPaymentOpen={setIsAddPaymentOpen}
              // New props for column filters
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              handleSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              filterPropertyId={filterPropertyId}
              setFilterPropertyId={setFilterPropertyId}
              filterStartDate={filterStartDate}
              setFilterStartDate={setFilterStartDate}
              filterEndDate={filterEndDate}
              setFilterEndDate={setFilterEndDate}
              canApprove={can("approve_payments")}
              canReject={can("reject_payments")}
              canEdit={can("edit_payments")}
              canDelete={can("delete_payments")}
              canViewReceipts={can("view_receipts")}
              showFilterSidebar={showPaymentFilterSidebar}
              setShowFilterSidebar={setShowPaymentFilterSidebar}
              onLedgerReport={handleLedgerReport}
              fetchRoomsByProperty={fetchRoomsByProperty}
              fetchTenantsByRoom={fetchTenantsByRoom}
              handleTenantSelect={handleTenantSelect}
              setSelectedPropertyId={setSelectedPropertyId}
              setSelectedRoomId={setSelectedRoomId}
              setNewPayment={setNewPayment}
              fetchProperties={fetchProperties}
              properties={properties}
              prefillAndOpenPaymentForm={prefillAndOpenPaymentForm}
              pagination={{
                items: paginatedPaymentGroups.items,
                currentPage: paymentPagination.currentPage,
                itemsPerPage: paymentPagination.itemsPerPage,
                totalItems: paginatedPaymentGroups.totalItems,
                totalPages: paginatedPaymentGroups.totalPages,
              }}
              onPageChange={(page: number) =>
                setPaymentPagination((prev) => ({ ...prev, currentPage: page }))
              }
              onItemsPerPageChange={(size: number) =>
                setPaymentPagination((prev) => ({
                  ...prev,
                  itemsPerPage: size,
                  currentPage: 1,
                }))
              }
              paymentTypeFilter={paymentTypeFilter}
  setPaymentTypeFilter={setPaymentTypeFilter}
  exactPendingFilter={exactPendingFilter}
  setExactPendingFilter={setExactPendingFilter}
  roomFilter={roomFilterGlobal}
  setRoomFilter={setRoomFilterGlobal}
  ignoreDateFilters={ignoreDateFilters}
  setIgnoreDateFilters={setIgnoreDateFilters}
  showPendingRentOnly={showPendingRentOnly}
  setShowPendingRentOnly={setShowPendingRentOnly}
            />
          </TabsContent>


          {/* Demands Tab Content */}
         {/* Demands Tab Content */}
          <TabsContent value="demands" className="mt-0">

            {/* ── Bulk Delete Bar ── */}
            {selectedDemandIds.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg mb-2">
                <span className="text-xs font-semibold text-red-700">{selectedDemandIds.length} selected</span>
                <Button
                  size="sm"
                  className="h-7 text-[10px] bg-red-600 hover:bg-red-700 text-white px-2.5 ml-2"
                  onClick={async () => {
                    const result = await MySwal.fire({
                      title: 'Delete Demands?',
                      html: `You are about to delete <b>${selectedDemandIds.length}</b> demand${selectedDemandIds.length !== 1 ? 's' : ''}. This action cannot be undone!`,
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#dc2626',
                      cancelButtonColor: '#6b7280',
                      confirmButtonText: `Yes, delete ${selectedDemandIds.length} demand${selectedDemandIds.length !== 1 ? 's' : ''}!`,
                      cancelButtonText: 'Cancel',
                    });
                    if (!result.isConfirmed) return;
                    try {
                      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/demands/bulk-delete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: selectedDemandIds })
                      });
                      const data = await response.json();
                      if (data.success) {
                        await MySwal.fire({ title: 'Deleted!', text: data.message, icon: 'success', timer: 2000, showConfirmButton: false });
                        setSelectedDemandIds([]);
                        loadDemands();
                      } else {
                        toast.error(data.message || "Failed to delete demands");
                      }
                    } catch (error) {
                      toast.error("Failed to delete demands");
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />Delete Selected
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] text-slate-500 ml-auto"
                  onClick={() => setSelectedDemandIds([])}>
                  <X className="h-3 w-3 mr-1" />Clear
                </Button>
              </div>
            )}

            {/* ── Main Card ── */}
            <Card className="border-0 overflow-hidden flex flex-col h-[320px] sm:h-[490px]">
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="overflow-auto flex-1 min-h-0 flex flex-col">
                  <div className="min-w-[1000px] flex flex-col flex-1 min-h-0">

                    {/* ── Sticky Header ── */}
                    <table className="table-fixed w-full border-collapse sticky top-0 z-10 bg-gray-200">
                      <colgroup>
                        <col style={{ width: "36px" }} />   {/* Checkbox */}
                        <col style={{ width: "90px" }} />   {/* Demand Date */}
                        <col style={{ width: "155px" }} />  {/* Tenant */}
                        <col style={{ width: "105px" }} />  {/* Contact */}
                        <col style={{ width: "120px" }} />  {/* Property */}
                        <col style={{ width: "90px" }} />   {/* Room/Bed */}
                        <col style={{ width: "85px" }} />   {/* Type */}
                        <col style={{ width: "85px" }} />   {/* Amount */}
                        <col style={{ width: "85px" }} />   {/* Due Date */}
                        <col style={{ width: "140px" }} />  {/* Status / Actions */}
                      </colgroup>
                     <thead>
  {/* ── Row 1: Column Titles ── */}
  <tr>
    <th className="py-1.5 px-1 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-center">
      <span className="font-semibold text-gray-700 text-[10px]">✓</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Demand Date</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Tenant</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Contact</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Property</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Room/Bed</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Type</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Amount</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Due Date</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-b border-gray-300 text-center">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status / Actions</span>
    </th>
  </tr>

  {/* ── Row 2: Search Inputs ── */}
  <tr className="bg-white border-t border-gray-300">
    {/* Checkbox */}
    <td className="p-1 border-r border-gray-200 text-center">
      <input
        type="checkbox"
        checked={
          selectedDemandIds.length === paginatedDemandsData().items.length &&
          paginatedDemandsData().items.length > 0
        }
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedDemandIds(paginatedDemandsData().items.map((d: any) => d.id));
          } else {
            setSelectedDemandIds([]);
          }
        }}
        className="w-3 h-3 accent-orange-500"
      />
    </td>

    {/* Demand Date */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="dd/mm/yy"
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={demandFilters.date || ""}
        onChange={(e) => setDemandFilters({ ...demandFilters, date: e.target.value })}
      />
    </td>

    {/* Tenant */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="Search..."
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={demandFilters.tenant || ""}
        onChange={(e) => setDemandFilters({ ...demandFilters, tenant: e.target.value })}
      />
    </td>

    {/* Contact */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="Search..."
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={demandFilters.contact || ""}
        onChange={(e) => setDemandFilters({ ...demandFilters, contact: e.target.value })}
      />
    </td>

    {/* Property */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="Search..."
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={demandFilters.property || ""}
        onChange={(e) => setDemandFilters({ ...demandFilters, property: e.target.value })}
      />
    </td>

    {/* Room/Bed */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="Search..."
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={demandFilters.room || ""}
        onChange={(e) => setDemandFilters({ ...demandFilters, room: e.target.value })}
      />
    </td>

    {/* Type */}
    <td className="p-1 border-r border-gray-200">
      <select
        value={demandFilters.payment_type || "all"}
        onChange={(e) => setDemandFilters({ ...demandFilters, payment_type: e.target.value })}
        className="h-5 text-[10px] bg-white border border-gray-300 px-1 rounded w-full"
      >
        <option value="all">All</option>
        <option value="rent">Rent</option>
        <option value="security_deposit">Security Deposit</option>
      </select>
    </td>

    {/* Amount */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="₹"
        type="number"
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={demandFilters.amount || ""}
        onChange={(e) => setDemandFilters({ ...demandFilters, amount: e.target.value })}
      />
    </td>

    {/* Due Date */}
    <td className="p-1 border-r border-gray-200">
      <Input
        type="text"
        placeholder="dd/mm/yy"
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={demandFilters.from_date || ""}
        onChange={(e) => setDemandFilters({ ...demandFilters, from_date: e.target.value })}
      />
    </td>

    {/* Status / Actions – no input */}
    <td className="p-1" />
  </tr>
</thead>
                    </table>

                    {/* ── Scrollable Body ── */}
                    <div className="overflow-y-auto flex-1 min-h-0">
                      <table className="table-fixed w-full border-collapse">
                        <colgroup>
                          <col style={{ width: "36px" }} />
                          <col style={{ width: "90px" }} />
                          <col style={{ width: "155px" }} />
                          <col style={{ width: "105px" }} />
                          <col style={{ width: "120px" }} />
                          <col style={{ width: "90px" }} />
                          <col style={{ width: "85px" }} />
                          <col style={{ width: "85px" }} />
                          <col style={{ width: "85px" }} />
                          <col style={{ width: "140px" }} />
                        </colgroup>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={10} className="text-center py-8 text-xs text-slate-500">
                                <div className="flex justify-center items-center">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-2" />
                                  Loading demands...
                                </div>
                              </td>
                            </tr>
                          ) : filteredDemands.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="text-center py-8 text-xs text-slate-500">
                                <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                No demands found
                              </td>
                            </tr>
                          ) : (
                            paginatedDemandsData().items.map((demand: any, index: number) => {
                              const salutation = getTenantSalutation(demand.tenant_id);
                              const countryCode = getTenantCountryCode(demand.tenant_id);
                              const phone = getTenantPhone(demand.tenant_id);
                              const tenantName = getTenantName(demand.tenant_id);
                              const isOverdue = new Date(demand.due_date) < new Date() && demand.status === "pending";

                              return (
                                <tr
                                  key={demand.id}
                                  className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <td className="py-1.5 px-1 text-center border-r border-slate-100">
                                    <input
                                      type="checkbox"
                                      checked={selectedDemandIds.includes(demand.id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        setSelectedDemandIds(prev =>
                                          prev.includes(demand.id)
                                            ? prev.filter(id => id !== demand.id)
                                            : [...prev, demand.id]
                                        );
                                      }}
                                      className="w-3 h-3 accent-orange-500"
                                    />
                                  </td>

                                  {/* Demand Date */}
                                  <td className="py-1.5 px-2 border-r border-slate-100">
                                    <span className="text-[10px] text-slate-700 whitespace-nowrap">
                                      {format(new Date(demand.created_at), "dd/MM/yy")}
                                    </span>
                                  </td>

                                  {/* Tenant */}
                                  <td className="py-1.5 px-2 border-r border-slate-100">
                                    <div className="flex items-center gap-1">
                                      {(() => {
  const t = tenants.find((x: any) => x.id === demand.tenant_id);
  return t?.photo_url ? (
    <img src={t.photo_url} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200" />
  ) : (
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-[8px] flex-shrink-0">
      {(salutation ? `${salutation} ${tenantName}` : tenantName)?.split(" ").filter(Boolean).slice(0, 2).map((n: string) => n[0]?.toUpperCase()).join("")}
    </div>
  );
})()}
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden">
                                          <p className="text-[11px] font-medium text-slate-800 truncate">
                                            {salutation ? `${salutation} ` : ""}
                                            {tenantName}
                                          </p>
                                          {demand.is_vacated === true && (
                                            <span className="inline-flex items-center gap-0.5 px-1 py-0 rounded-full bg-red-100 text-red-700 text-[9px] font-semibold border border-red-200 flex-shrink-0">
                                              <DoorOpen className="w-2 h-2" />Vacated
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Contact */}
                                  <td className="py-1.5 px-2 border-r border-slate-100">
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap truncate block">
                                      {countryCode || "+91"} {phone || "—"}
                                    </span>
                                  </td>

                                  {/* Property */}
                                  <td className="py-1.5 px-2 border-r border-slate-100">
                                    <span className="text-[10px] text-slate-600 truncate block" title={demand.property_name}>
                                      {demand.property_name && demand.property_name !== "N/A"
                                        ? demand.property_name
                                        : <span className="text-slate-400">—</span>}
                                    </span>
                                  </td>

                                  {/* Room/Bed */}
                                  <td className="py-1.5 px-2 border-r border-slate-100">
                                    <div className="flex items-center gap-0.5 flex-wrap">
                                      {demand.room_number && demand.room_number !== "N/A" && demand.room_number !== "—" ? (
                                        <>
                                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded-full whitespace-nowrap">
                                            R{demand.room_number}
                                          </span>
                                          {demand.bed_number && (
                                            <span className="text-[10px] text-green-600 bg-green-50 px-1 py-0.5 rounded-full whitespace-nowrap">
                                              B{demand.bed_number}
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <span className="text-[10px] text-slate-400">—</span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Type */}
                                  <td className="py-1.5 px-2 border-r border-slate-100">
                                    <Badge className={`text-[9px] px-1.5 py-0 leading-tight ${
                                      demand.payment_type === "security_deposit"
                                        ? "bg-purple-100 text-purple-700 border-purple-200"
                                        : "bg-blue-100 text-blue-700 border-blue-200"
                                    }`}>
                                      {demand.payment_type === "security_deposit" ? "Security Deposit" : "Rent"}
                                    </Badge>
                                  </td>

                                  {/* Amount */}
                                  <td className="py-1.5 px-2 border-r border-slate-100">
                                    <span className="text-[11px] font-bold text-slate-800 whitespace-nowrap">
                                      ₹{Number(demand.amount).toLocaleString("en-IN")}
                                    </span>
                                    {demand.status === "partial" && (
                                      <p className="text-[9px] text-blue-500 whitespace-nowrap">
                                        Paid: ₹{(demand.paid_amount || 0).toLocaleString()}
                                      </p>
                                    )}
                                  </td>

                                  {/* Due Date */}
                                 <td className="py-1.5 px-2 border-r border-slate-100">
  <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden">
    <span
      className={`text-[10px] ${
        isOverdue ? "text-red-600 font-semibold" : "text-slate-700"
      }`}
    >
      {format(new Date(demand.due_date), "dd/MM/yy")}
    </span>

    {isOverdue && (
      <span className="text-[8px] text-red-500 flex-shrink-0">
        (Overdue)
      </span>
    )}
  </div>
</td>

                                  {/* Status + Resend */}
                                  <td className="py-1.5 px-1 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <Badge className={`text-[9px] px-1.5 py-0 leading-tight ${
                                        demand.status === "paid"    ? "bg-green-100 text-green-800" :
                                        demand.status === "partial" ? "bg-blue-100 text-blue-800" :
                                        demand.status === "overdue" ? "bg-red-100 text-red-800" :
                                        demand.status === "cancelled" ? "bg-gray-100 text-gray-700" :
                                                                      "bg-yellow-100 text-yellow-800"
                                      }`}>
                                        {demand.status === "partial"
                                          ? `Partial`
                                          : demand.status}
                                      </Badge>
                                      <button
                                        className="h-5 w-5 rounded flex items-center justify-center text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                        onClick={() => handleResendClick(demand)}
                                        title="Resend Reminder"
                                      >
                                        <RefreshCw className="h-2.5 w-2.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>
              </div>

              {/* Pagination */}
              {!loading && filteredDemands.length > 0 && (
                <PaginationControls
                  currentPage={demandPagination.currentPage}
totalPages={demandPagination.itemsPerPage === "All" ? 1 : Math.ceil(filteredDemands.length / (demandPagination.itemsPerPage as number))}
                  onPageChange={(page: number) => setDemandPagination((prev) => ({ ...prev, currentPage: page }))}
                  itemsPerPage={demandPagination.itemsPerPage}
                  onItemsPerPageChange={(size: number) => setDemandPagination((prev) => ({ ...prev, itemsPerPage: size, currentPage: 1 }))}
                  totalItems={filteredDemands.length}
                  currentItemsCount={paginatedDemandsData().items.length}
                />
              )}
            </Card>

            {/* ── Filter Sidebar ── */}
            <Sheet open={showDemandFilterSidebar} onOpenChange={setShowDemandFilterSidebar}>
              <SheetContent side="right" className="p-0 w-[85vw] min-w-[280px] sm:w-[420px]">
                <div className="h-full flex flex-col">

                  {/* Header — blue like receipts */}
                  <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">Filter Demands</span>
                    </div>
                    <button onClick={() => setShowDemandFilterSidebar(false)} className="text-white/70 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body — two-column grid like receipts */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">

                      {/* Demand Date */}
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <Label className="text-xs font-semibold text-blue-700">Demand Date</Label>
                        <Input
                          placeholder="dd/mm/yy"
                          value={demandFilters.date || ""}
                          onChange={(e) => setDemandFilters({ ...demandFilters, date: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Tenant */}
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <Label className="text-xs font-semibold text-blue-700">Tenant</Label>
                        <Input
                          placeholder="Search tenant..."
                          value={demandFilters.tenant || ""}
                          onChange={(e) => setDemandFilters({ ...demandFilters, tenant: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Contact */}
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <Label className="text-xs font-semibold text-blue-700">Contact</Label>
                        <Input
                          placeholder="Search phone..."
                          value={demandFilters.contact || ""}
                          onChange={(e) => setDemandFilters({ ...demandFilters, contact: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Property */}
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <Label className="text-xs font-semibold text-blue-700">Property</Label>
                        <Input
                          placeholder="Search property..."
                          value={demandFilters.property || ""}
                          onChange={(e) => setDemandFilters({ ...demandFilters, property: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Room/Bed */}
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <Label className="text-xs font-semibold text-blue-700">Room / Bed</Label>
                        <Input
                          placeholder="Search room..."
                          value={demandFilters.room || ""}
                          onChange={(e) => setDemandFilters({ ...demandFilters, room: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>

                      {/* Amount */}
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <Label className="text-xs font-semibold text-blue-700">Amount</Label>
                        <Input
                          type="number"
                          placeholder="Search amount..."
                          value={demandFilters.amount || ""}
                          onChange={(e) => setDemandFilters({ ...demandFilters, amount: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>

                    

                      {/* Status */}
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <Label className="text-xs font-semibold text-blue-700">Status</Label>
                        <select
                          value={demandFilters.status || "all"}
                          onChange={(e) => setDemandFilters({ ...demandFilters, status: e.target.value })}
                          className="w-full h-8 text-xs rounded-lg border border-gray-200 px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="all">All Status</option>
                          {["pending", "paid", "partial", "overdue", "cancelled"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Payment Type */}
                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <Label className="text-xs font-semibold text-blue-700">Payment Type</Label>
                        <select
                          value={demandFilters.payment_type || "all"}
                          onChange={(e) => setDemandFilters({ ...demandFilters, payment_type: e.target.value })}
                          className="w-full h-8 text-xs rounded-lg border border-gray-200 px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="all">All Types</option>
                          <option value="rent">Rent</option>
                          <option value="security_deposit">Security Deposit</option>
                        </select>
                      </div>
                      {/* Due Date Range */}
<div className="space-y-1 col-span-2 sm:col-span-1">
  <Label className="text-xs font-semibold text-blue-700">Due Date From</Label>
  <Input
    type="date"
    value={demandFilters.from_date || ""}
    onChange={(e) => setDemandFilters({ ...demandFilters, from_date: e.target.value })}
    className="h-8 text-xs"
  />
</div>
<div className="space-y-1 col-span-2 sm:col-span-1">
  <Label className="text-xs font-semibold text-blue-700">Due Date To</Label>
  <Input
    type="date"
    value={demandFilters.to_date || ""}
    onChange={(e) => setDemandFilters({ ...demandFilters, to_date: e.target.value })}
    className="h-8 text-xs"
  />
</div>

                    </div>
                    

                    {/* Ignore Date Filter — full width, like receipts */}
                    <div className="mt-4 space-y-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={demandFilters.ignore_date || false}
                          onChange={(e) => setDemandFilters({ ...demandFilters, ignore_date: e.target.checked })}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-semibold text-blue-700">Ignore Date Filter</span>
                      </label>
                      <p className="text-[10px] text-gray-500 ml-5">Show all demands regardless of demand date</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t p-3 flex gap-2 bg-gray-50 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => setDemandFilters({
                        status: "",
                        tenant: "",
                        from_date: "",
                        to_date: "",
                        date: "",
                        amount: "",
                        room: "",
                        payment_type: "",
                        contact: "",
                        property: "",
                        ignore_date: false,
                      })}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Reset
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowDemandFilterSidebar(false)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

          </TabsContent>

          {/* Receipts Tab Content */}
          <TabsContent value="receipts" className="mt-0">

{selectedReceiptIds.length > 0 && (
  <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mb-2">
    <div className="flex items-center gap-1.5 mr-1">
      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
        <span className="text-white text-[9px] font-bold">{selectedReceiptIds.length}</span>
      </div>
      <span className="text-xs font-semibold text-blue-700">selected</span>
    </div>

    {/* Preview Receipts */}
    <Button size="sm"
      className="h-7 text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-2.5 gap-1"
      onClick={async () => {
        const loadingToast = toast.loading("Merging receipts for preview...");
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/receipts/bulk-preview`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selectedReceiptIds }) }
          );
          if (!response.ok) throw new Error(await response.text());
          const blob = await response.blob();
          toast.dismiss(loadingToast);
          showPdfInModal(blob, "Bulk Receipts Preview", selectedReceiptIds.length);
        } catch (e) {
          toast.dismiss(loadingToast);
          toast.error("Failed to generate preview");
        }
      }}>
      <Eye className="h-3 w-3" /> Preview Receipts
    </Button>

    {/* Download Receipts ZIP */}
    <Button size="sm"
      className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 gap-1"
      onClick={async () => {
        const loadingToast = toast.loading("Preparing ZIP...");
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/receipts/bulk-download`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selectedReceiptIds }) }
          );
          if (!response.ok) throw new Error("Failed");
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a"); link.href = url;
          link.download = `receipts-${Date.now()}.zip`; link.click();
          URL.revokeObjectURL(url);
          toast.dismiss(loadingToast);
          toast.success(`Downloaded ${selectedReceiptIds.length} receipts`);
        } catch (e) {
          toast.dismiss(loadingToast);
          toast.error("Download failed");
        }
      }}>
      <Download className="h-3 w-3" /> Download ZIP
    </Button>

    {/* Bulk Email */}
    <Button size="sm"
  className="h-7 text-[10px] text-white px-2.5 gap-1"
  onClick={async () => {
    const result = await MySwal.fire({
  title: 'Send Receipt Emails?',
  html: `Send receipt PDFs to <b>${selectedReceiptIds.length}</b> tenant(s) via email?`,
  icon: 'question',
  showCancelButton: true,
  confirmButtonText: '✉️ Yes, Send',
  cancelButtonText: 'Cancel',
  reverseButtons: false,
});
    
    if (!result.isConfirmed) return;
    
    const loadingToast = toast.loading("Sending emails...");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/receipts/bulk-email`,
        { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ ids: selectedReceiptIds }) 
        }
      );
      const data = await response.json();
      toast.dismiss(loadingToast);
      if (data.success) {
        await MySwal.fire({ 
          title: 'Emails Sent!', 
          text: data.message, 
          icon: 'success', 
          timer: 3000, 
          showConfirmButton: false 
        });
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error("Failed to send emails");
    }
  }}>
  <Mail className="h-3 w-3" /> Email ({selectedReceiptIds.length})
</Button>

<Button size="sm"
  variant="outline"
  className="h-7 text-[10px] px-2.5 border-orange-400 text-orange-700 hover:bg-orange-500 gap-1"
  onClick={async () => {
    // Step 1: Get selected receipt objects
    const selectedReceipts = receipts.filter((r: any) => selectedReceiptIds.includes(Number(r.id)));
    
    
    // Step 2: Extract tenant IDs - try multiple approaches
    let tenantIds: number[] = [];
    
    // Approach 1: Check if receipt has tenant_id directly
    for (const receipt of selectedReceipts) {
      // Try all possible field names
      let tenantId = receipt.tenant_id || receipt.tenantId || receipt.tenant?.id || receipt.booking?.tenant_id;
      
      // If found, add to list
      if (tenantId && !tenantIds.includes(Number(tenantId))) {
        tenantIds.push(Number(tenantId));
      }
    }
    
    
    // Approach 2: If still no tenant IDs, fetch full receipt details from API
    if (tenantIds.length === 0 && selectedReceipts.length > 0) {
      toast.loading("Fetching tenant details...", { id: "fetch-tenants" });
      
      try {
        // Fetch full receipt data for each selected receipt
        const tenantPromises = selectedReceipts.map(async (receipt: any) => {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/receipts/${receipt.id}`
            );
            const data = await response.json();
           
            
            if (data.success && data.data) {
              // Try multiple field names from API response
              return data.data.tenant_id || data.data.tenantId || data.data.tenant?.id || null;
            }
            return null;
          } catch (err) {
            console.error(`Failed to fetch receipt ${receipt.id}:`, err);
            return null;
          }
        });
        
        const resolvedTenantIds = await Promise.all(tenantPromises);
        tenantIds = [...new Set(resolvedTenantIds.filter((id): id is number => id !== null && !isNaN(Number(id))))];
        
        toast.dismiss("fetch-tenants");
        console.log("Tenant IDs from API:", tenantIds);
      } catch (error) {
        toast.dismiss("fetch-tenants");
        console.error("Failed to fetch tenant details:", error);
      }
    }
    
    // Approach 3: If still no tenant IDs, try to get tenant_id from payments table via receipt ID
    if (tenantIds.length === 0 && selectedReceipts.length > 0) {
      toast.loading("Looking up tenant from payment records...", { id: "fetch-payments" });
      
      try {
        const paymentPromises = selectedReceipts.map(async (receipt: any) => {
          try {
            // Try to get payment details which should have tenant_id
            const response = await fetch(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/${receipt.id}`
            );
            const data = await response.json();
            console.log(`Payment ${receipt.id} API response:`, data);
            
            if (data.success && data.data) {
              return data.data.tenant_id || data.data.tenantId || null;
            }
            return null;
          } catch (err) {
            console.error(`Failed to fetch payment ${receipt.id}:`, err);
            return null;
          }
        });
        
        const paymentTenantIds = await Promise.all(paymentPromises);
        tenantIds = [...new Set(paymentTenantIds.filter((id): id is number => id !== null && !isNaN(Number(id))))];
        
        toast.dismiss("fetch-payments");
        console.log("Tenant IDs from payments API:", tenantIds);
      } catch (error) {
        toast.dismiss("fetch-payments");
        console.error("Failed to fetch payment details:", error);
      }
    }
    
    if (tenantIds.length === 0) {
      toast.error("No tenants found for selected receipts. Please ensure receipts are approved and have tenant data.");
      return;
    }
    
    // Filter out null/undefined values
    const validTenantIds = tenantIds.filter(id => id != null && !isNaN(Number(id)));
    console.log("Final valid tenant IDs:", validTenantIds);
    
    if (validTenantIds.length === 0) {
      toast.error("No valid tenant IDs found");
      return;
    }
    
    const loadingToast = toast.loading(`Generating ${validTenantIds.length} ledger(s)...`);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/ledger/bulk-preview`,
        { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ tenant_ids: validTenantIds }) 
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate preview");
      }
      
      const blob = await response.blob();
      toast.dismiss(loadingToast);
      
      if (blob.size === 0) {
        toast.error("Generated PDF is empty");
        return;
      }
      
      showPdfInModal(blob, "Bulk Ledger Preview", validTenantIds.length);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Preview error:", error);
      toast.error(error.message || "Failed to generate ledger preview");
    }
  }}>
  <FileText className="h-3 w-3" /> Preview Ledgers
</Button>

    {/* Download Ledgers ZIP */}
<Button size="sm"
  variant="outline"
  className="h-7 text-[10px] px-2.5 border-orange-400 text-orange-700 hover:bg-orange-500 gap-1"
  onClick={async () => {
    // Get selected receipts
    const selectedReceipts = receipts.filter((r: any) => selectedReceiptIds.includes(Number(r.id)));
    
    
    // ✅ USE EXACT SAME LOGIC AS PREVIEW BUTTON
    let tenantIds: number[] = [];
    
    // Approach 1: Check if receipt has tenant_id directly
    for (const receipt of selectedReceipts) {
      let tenantId = receipt.tenant_id || receipt.tenantId || receipt.tenant?.id || receipt.booking?.tenant_id;
      if (tenantId && !tenantIds.includes(Number(tenantId))) {
        tenantIds.push(Number(tenantId));
      }
    }
  
    
    // Approach 2: Fetch from API (SAME AS PREVIEW BUTTON)
    if (tenantIds.length === 0 && selectedReceipts.length > 0) {
      toast.loading("Fetching tenant details...", { id: "fetch-tenants-zip" });
      
      try {
        const tenantPromises = selectedReceipts.map(async (receipt: any) => {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/receipts/${receipt.id}`
            );
            const data = await response.json();
            console.log(`Receipt ${receipt.id} API response for ZIP:`, data);
            
            if (data.success && data.data) {
              return data.data.tenant_id || data.data.tenantId || data.data.tenant?.id || null;
            }
            return null;
          } catch (err) {
            console.error(`Failed to fetch receipt ${receipt.id}:`, err);
            return null;
          }
        });
        
        const resolvedTenantIds = await Promise.all(tenantPromises);
        tenantIds = [...new Set(resolvedTenantIds.filter((id): id is number => id !== null && !isNaN(Number(id))))];
        
        toast.dismiss("fetch-tenants-zip");
        console.log("Tenant IDs from API for ZIP:", tenantIds);
      } catch (error) {
        toast.dismiss("fetch-tenants-zip");
        console.error("Failed to fetch tenant details:", error);
      }
    }
    
    // Approach 3: Try payments API as fallback
    if (tenantIds.length === 0 && selectedReceipts.length > 0) {
      toast.loading("Looking up tenant from payment records...", { id: "fetch-payments-zip" });
      
      try {
        const paymentPromises = selectedReceipts.map(async (receipt: any) => {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/${receipt.id}`
            );
            const data = await response.json();
           
            
            if (data.success && data.data) {
              return data.data.tenant_id || data.data.tenantId || null;
            }
            return null;
          } catch (err) {
            console.error(`Failed to fetch payment ${receipt.id}:`, err);
            return null;
          }
        });
        
        const paymentTenantIds = await Promise.all(paymentPromises);
        tenantIds = [...new Set(paymentTenantIds.filter((id): id is number => id !== null && !isNaN(Number(id))))];
        
        toast.dismiss("fetch-payments-zip");
       
      } catch (error) {
        toast.dismiss("fetch-payments-zip");
        console.error("Failed to fetch payment details:", error);
      }
    }
    
    // Filter out null/undefined values
    const validTenantIds = tenantIds.filter(id => id != null && !isNaN(Number(id)));
   
    
    if (validTenantIds.length === 0) {
      toast.error("No tenants found for selected receipts. Please ensure receipts are approved.");
      return;
    }
    
    const loadingToast = toast.loading(`Generating ledger ZIP for ${validTenantIds.length} tenant(s)...`);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/ledger/bulk-download`,
        { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ tenant_ids: validTenantIds }) 
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(errorText || "Failed to generate ZIP");
      }
      
      const blob = await response.blob();
     
      
      toast.dismiss(loadingToast);
      
      if (blob.size === 0) {
        toast.error("Generated ZIP file is empty");
        return;
      }
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); 
      link.href = url;
      link.download = `ledgers-${Date.now()}.zip`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${validTenantIds.length} ledger(s)`);
    } catch (e: any) {
      toast.dismiss(loadingToast);
      console.error("Download error:", e);
      toast.error(e.message || "Failed to download");
    }
  }}>
  <Download className="h-3 w-3" /> Ledger ZIP
</Button>

    {/* WhatsApp */}
    <Button size="sm" variant="outline"
      className="h-7 text-[10px] px-2.5 border-green-500 text-green-700 hover:bg-green-400  gap-1"
      onClick={() => MySwal.fire({
        title: 'WhatsApp Integration',
        text: 'WhatsApp bulk send requires WhatsApp Business API. Configure in Settings → Integrations.',
        icon: 'info',
        confirmButtonColor: '#25d366',
      })}>
      <MessageCircle className="h-3 w-3" /> WhatsApp
    </Button>

    <Button variant="ghost" size="sm" className="h-7 ml-auto text-[10px] text-slate-500 gap-1"
      onClick={() => setSelectedReceiptIds([])}>
      <X className="h-3 w-3" /> Clear
    </Button>
  </div>
)}
            <ReceiptsTable
              receipts={receipts}
              loading={loading}
              getTenantName={getTenantName}
              getTenantSalutation={getTenantSalutation} // ADD THIS
              getTenantCountryCode={getTenantCountryCode} // ADD THIS
              getTenantPhone={getTenantPhone}
              tenants={tenants}
              highlightedReceipt={highlightedReceipt}
onPreviewReceipt={handleViewReceipt}
              onDownloadReceipt={paymentApi.downloadReceipt}
              showFilterSidebar={showReceiptFilterSidebar}
              setShowFilterSidebar={setShowReceiptFilterSidebar}
              pagination={{
                currentPage: receiptPagination.currentPage,
                itemsPerPage: receiptPagination.itemsPerPage,
                totalItems: receipts.length,
                totalPages: Math.ceil(
                  receipts.length / receiptPagination.itemsPerPage,
                ),
              }}
              onPageChange={(page: number) =>
                setReceiptPagination((prev) => ({ ...prev, currentPage: page }))
              }
              onItemsPerPageChange={(size: number) =>
                setReceiptPagination((prev) => ({
                  ...prev,
                  itemsPerPage: size,
                  currentPage: 1,
                }))
              }
              selectedReceiptIds={selectedReceiptIds}  
    setSelectedReceiptIds={setSelectedReceiptIds}  
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Payment Dialog - Your existing code with horizontal layout */}
      <Dialog
        open={isAddPaymentOpen}
        onOpenChange={(open) => {
          setIsAddPaymentOpen(open);
          if (!open) {
            // Reset everything when dialog closes
            resetPaymentForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] sm:max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-4 py-3 rounded-t-lg flex-shrink-0">
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
            {/* Row 1: Property + Room Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Property Selection */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Property <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedPropertyId}
                  onValueChange={handlePropertyChange}
                  onOpenChange={(open) => {
                    if (open) {
                      // Focus the property search input when dropdown opens
                      setTimeout(() => {
                        if (propertySearchInputRef.current) {
                          propertySearchInputRef.current.focus();
                        }
                      }, 50);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                    <SelectValue placeholder="Select property..." />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-[300px]"
                    position="popper"
                    sideOffset={5}
                  >
                    {/* Search Input - prevent dropdown close on click */}
                    <div
                      className="sticky top-0 bg-white p-2 border-b z-10"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Input
                        ref={propertySearchInputRef}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="Search property..."
                        value={propertySearch}
                        onChange={(e) => handlePropertySearch(e.target.value)}
                        className="h-7 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Properties List */}
                    <div className="max-h-[250px] overflow-y-auto">
                      {loadingProperties ? (
                        <div className="px-2 py-4 text-center text-xs text-slate-500">
                          <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                          Loading properties...
                        </div>
                      ) : filteredProperties.length === 0 ? (
                        <div className="px-2 py-4 text-center text-xs text-slate-500">
                          {propertySearch
                            ? "No matching properties found"
                            : "No properties available"}
                        </div>
                      ) : (
                        filteredProperties.map((property) => (
                          <SelectItem
                            key={property.id}
                            value={property.id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <Building className="h-3 w-3 text-slate-400" />
                              <span className="text-xs">{property.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {/* Room Selection with Search */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Room <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedRoomId}
                  onValueChange={handleRoomChange}
                  disabled={!selectedPropertyId || loadingRooms}
                  onOpenChange={(open) => {
                    if (open && selectedPropertyId) {
                      // Focus the room search input when dropdown opens
                      setTimeout(() => {
                        if (roomSearchInputRef.current) {
                          roomSearchInputRef.current.focus();
                        }
                      }, 50);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                    <SelectValue
                      placeholder={
                        !selectedPropertyId
                          ? "Select property first"
                          : "Select room..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-[300px]"
                    position="popper"
                    sideOffset={5}
                  >
                    {/* Search Input */}
                    <div
                      className="sticky top-0 bg-white p-2 border-b z-10"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Input
                        ref={roomSearchInputRef}
                        placeholder="Search room..."
                        onKeyDown={(e) => e.stopPropagation()}
                        value={roomSearch}
                        onChange={(e) => handleRoomSearch(e.target.value)}
                        className="h-7 text-xs"
                        disabled={!selectedPropertyId}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Rooms List */}
                    <div className="max-h-[250px] overflow-y-auto">
                      {loadingRooms ? (
                        <div className="px-2 py-4 text-center text-xs text-slate-500">
                          <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                          Loading rooms...
                        </div>
                      ) : filteredRooms.length === 0 ? (
                        <div className="px-2 py-4 text-center text-xs text-slate-500">
                          {roomSearch
                            ? "No matching rooms found"
                            : "No rooms available"}
                        </div>
                      ) : (
                        filteredRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Home className="h-3 w-3 text-slate-400" />
                              <span className="text-xs">
                                Room {room.room_number}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({room.sharing_type})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </div>
                  </SelectContent>
                </Select>
                {loadingRooms && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-[10px]">Loading rooms...</span>
                  </div>
                )}
              </div>
            </div>
            {/* Row 2: Tenant Selection + Payment Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tenant Selection */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Tenant <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newPayment.tenant_id}
                  onValueChange={handleTenantSelect}
                  disabled={!selectedRoomId}
                >
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                    <SelectValue
                      placeholder={
                        !selectedRoomId
                          ? "Select room first"
                          : "Choose a tenant..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {filteredTenants.length === 0 && selectedRoomId ? (
                      <div className="px-2 py-4 text-center text-xs text-slate-500">
                        No tenants assigned to this room
                      </div>
                    ) : (
                      filteredTenants.map((tenant) => (
                        <SelectItem
                          key={tenant.id}
                          value={tenant.id.toString()}
                        >
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-slate-400" />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium">
                                {tenant.full_name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {tenant.phone}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {bookingLoading && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-[10px]">
                      Loading tenant details...
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Type */}
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
                  </SelectContent>
                </Select>
              </div>
            </div>{" "}
            {/* Rest of your existing form fields... */}
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
                    type="text"
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
                  onValueChange={(value) => {
                    setNewPayment({
                      ...newPayment,
                      payment_mode: value,
                      bank_name: "",
                    });
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select payment mode..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingPaymentModes ? (
                      <div className="px-2 py-4 text-center text-xs text-slate-500">
                        <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                        Loading...
                      </div>
                    ) : paymentModes.length === 0 ? (
                      <div className="px-2 py-4 text-center text-xs text-slate-500">
                        No payment modes available
                      </div>
                    ) : (
                      paymentModes.map((mode) => (
                        <SelectItem
                          key={mode.id}
                          value={mode.name.toLowerCase().replace(/\s+/g, "_")}
                          className="text-xs"
                        >
                          {mode.name}
                        </SelectItem>
                      ))
                    )}
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
                  max={new Date().toISOString().split("T")[0]} // 👈 key line
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
                    <SelectTrigger className="h-8 text-xs">
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

                  {/* Custom Bank Name Input */}
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
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Transaction ID - conditional */}
              {(newPayment.payment_mode === "online" ||
                newPayment.payment_mode === "bank_transfer" ||
                newPayment.payment_mode === "cheque" ||
                newPayment.payment_mode === "online_payment_gateway" ||
                newPayment.payment_mode === "upi" ||
                newPayment.payment_mode === "wallet") && (
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
                className="text-xs h-8 px-4 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Plus className="h-3 w-3 mr-1.5" />
                Add Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

{/* DEMAND PAYMENT DIALOG */}
<Dialog
  open={isDemandPaymentOpen}
  onOpenChange={(open) => {
    setIsDemandPaymentOpen(open);
    if (!open) {
      resetDemandPaymentForm();
      setBulkMode(false);
      setSelectedRooms([]);
      setSelectedTenants([]);
      setBulkStep(1);
      setRoomsWithPending([]);
    }
  }}
>
  <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] sm:max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">

    {/* ── HEADER — same style as Add Payment ── */}
    <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] px-4 py-3 rounded-t-lg flex-shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <DialogTitle className="text-white text-sm font-semibold flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-md">
              <Bell className="h-3.5 w-3.5" />
            </div>
            Demand Payment
          </DialogTitle>
          <DialogDescription className="text-blue-100 text-xs mt-0.5">
            Send a payment request to a tenant or multiple tenants
          </DialogDescription>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-7 w-7">
            <X className="h-3.5 w-3.5" />
          </Button>
        </DialogClose>
      </div>

      {/* Mode toggle — sits inside header like a sub-nav */}
      <div className="flex gap-1 mt-3">
        {[
          { id: false, label: "Single Tenant", icon: User },
          { id: true,  label: "Bulk Mode",     icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={String(id)}
            onClick={() => {
              setBulkMode(id);
              if (!id) {
                setSelectedRooms([]);
                setSelectedTenants([]);
                setSelectedPropertyId("");
                setSelectedRoomId("");
                setRoomsWithPending([]);
                setDemandPayment({
                  tenant_id: "", payment_type: "rent", amount: 0,
                  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                  description: "", send_email: true, send_sms: false,
                });
              } else {
                setDemandPayment(prev => ({ ...prev, tenant_id: "" }));
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors
              ${bulkMode === id
                ? "bg-white text-blue-700"
                : "text-blue-100 hover:bg-white/10"}`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>
    </div>

    {/* ── SCROLLABLE BODY ── */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3">

      {/* ══════════════════════════════════
          SINGLE TENANT TAB
      ══════════════════════════════════ */}
      {!bulkMode && (
        <>
          {/* Row 1: Property + Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">
                Property <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedPropertyId}
                onValueChange={handleDemandPropertyChange}
                onOpenChange={(open) => {
                  if (open) setTimeout(() => propertySearchInputRef.current?.focus(), 50);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                  <SelectValue placeholder="Select property..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]" position="popper" sideOffset={5}>
                  <div className="sticky top-0 bg-white p-2 border-b z-10"
                    onPointerDown={(e) => e.stopPropagation()}>
                    <Input
                      ref={propertySearchInputRef}
                      placeholder="Search property..."
                      value={propertySearch}
                      onChange={(e) => handlePropertySearch(e.target.value)}
                      className="h-7 text-xs"
                      onKeyDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {loadingProperties ? (
                      <div className="px-2 py-4 text-center text-xs text-slate-500">
                        <Loader2 className="h-3 w-3 animate-spin inline mr-1" />Loading...
                      </div>
                    ) : filteredProperties.length === 0 ? (
                      <div className="px-2 py-4 text-center text-xs text-slate-500">No properties found</div>
                    ) : (
                      filteredProperties.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3 text-slate-400" />
                            <span className="text-xs">{p.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
  <Label className="text-[11px] font-medium text-slate-600">
    Room <span className="text-red-500">*</span>
  </Label>
  <Select
    value={selectedRoomId}
    onValueChange={handleDemandRoomChange}
    disabled={!selectedPropertyId || loadingPendingRooms}
  >
    <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
      <SelectValue placeholder={!selectedPropertyId ? "Select property first" : "Select room..."} />
    </SelectTrigger>
    <SelectContent className="max-h-[300px]" position="popper" sideOffset={5}>
      <div className="sticky top-0 bg-white p-2 border-b z-10"
        onPointerDown={(e) => e.stopPropagation()}>
        <Input
          placeholder="Search room..."
          value={roomSearch}
          onChange={(e) => handleRoomSearch(e.target.value)}
          className="h-7 text-xs"
          disabled={!selectedPropertyId}
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="max-h-[250px] overflow-y-auto">
        {loadingPendingRooms ? (
          <div className="px-2 py-4 text-center text-xs text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
            Loading rooms with pending...
          </div>
        ) : pendingRoomsSingle.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-slate-400">
            {selectedPropertyId 
              ? `No rooms with pending ${demandPayment.payment_type === "security_deposit" ? "deposits" : "rent"}`
              : "Select a property first"}
          </div>
        ) : (
          pendingRoomsSingle.map((room) => (
            <SelectItem key={room.id} value={room.id.toString()}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Home className="h-3 w-3 text-slate-400" />
                  <span className="text-xs">Room {room.room_number}</span>
                  <span className="text-[10px] text-slate-400">
                    ({room.tenants?.length || 0} tenant{room.tenants?.length !== 1 ? "s" : ""})
                  </span>
                </div>
                <span className="text-[10px] text-amber-600 font-medium">
                  ₹{(room.total_pending || 0).toLocaleString()} 
        {demandPayment.payment_type === "security_deposit" ? " deposit pending" : " rent pending"}
                </span>
              </div>
            </SelectItem>
          ))
        )}
      </div>
    </SelectContent>
  </Select>
  {loadingPendingRooms && (
    <div className="flex items-center gap-1 text-blue-600">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="text-[10px]">Loading rooms with pending payments...</span>
    </div>
  )}
</div>
          </div>

          {/* Row 2: Tenant + Payment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
  <Label className="text-[11px] font-medium text-slate-600">
    Tenant <span className="text-red-500">*</span>
  </Label>
  <Select
    value={demandPayment.tenant_id}
    onValueChange={handleDemandTenantSelect}
    disabled={!selectedRoomId || filteredTenants.length === 0}
  >
    <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
      <SelectValue placeholder={
        !selectedRoomId 
          ? "Select room first" 
          : filteredTenants.length === 0 
            ? "No pending tenants" 
            : "Choose tenant..."
      } />
    </SelectTrigger>
    <SelectContent className="max-h-[300px]">
      {filteredTenants.length === 0 && selectedRoomId ? (
        <div className="px-2 py-4 text-center text-xs text-slate-500">
          No tenants with pending {demandPayment.payment_type === "security_deposit" ? "deposits" : "rent"} in this room
        </div>
      ) : (
        filteredTenants.map((t) => (
          <SelectItem key={t.id} value={t.id.toString()}>
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{t.full_name}</span>
                  <span className="text-[10px] text-slate-400">{t.phone}</span>
                </div>
              </div>
              <span className="text-[10px] text-amber-600 font-medium whitespace-nowrap">
                ₹{(t.total_pending || 0).toLocaleString()}
              </span>
            </div>
          </SelectItem>
        ))
      )}
    </SelectContent>
  </Select>
  {bookingLoading && (
    <div className="flex items-center gap-1 text-blue-600">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span className="text-[10px]">Loading tenant details...</span>
    </div>
  )}
</div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">Payment Type</Label>
              <Select value={demandPayment.payment_type} onValueChange={handleDemandPaymentTypeChange}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent" className="text-xs">Rent</SelectItem>
                  <SelectItem value="security_deposit" className="text-xs">Security Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tenant summary — shown after selection, same style as BedAssignmentTable */}
{demandPayment.tenant_id && paymentFormData && (
  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
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
            <th className="text-left p-2 text-xs font-medium text-slate-600">Property</th>
            <th className="text-left p-2 text-xs font-medium text-slate-600">Room</th>
            <th className="text-left p-2 text-xs font-medium text-slate-600">Bed #</th>
            {/* Show different header based on payment type */}
            <th className="text-left p-2 text-xs font-medium text-slate-600">
              {demandPayment.payment_type === "security_deposit" ? "Security Deposit" : "Monthly Rent"}
            </th>
            <th className="text-left p-2 text-xs font-medium text-slate-600">
              {demandPayment.payment_type === "security_deposit" ? "Deposit Pending" : "Rent Pending"}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-200">
            <td className="p-2 text-sm">{paymentFormData.room_info?.property_name || "N/A"}</td>
            <td className="p-2 text-sm">{paymentFormData.room_info?.room_number || "N/A"}</td>
            <td className="p-2 text-sm font-medium">
              {paymentFormData.room_info?.bed_number ? `#${paymentFormData.room_info.bed_number}` : "—"}
            </td>
            {/* Show Security Deposit total or Monthly Rent */}
            <td className="p-2 text-sm font-semibold text-blue-600">
              {demandPayment.payment_type === "security_deposit" 
                ? `₹${(securityDepositInfo?.security_deposit || 0).toLocaleString()}`
                : `₹${(paymentFormData.monthly_rent || 0).toLocaleString()}`
              }
            </td>
            {/* Show Pending Amount */}
            <td className="p-2 text-sm font-semibold text-amber-600">
              ₹{demandPayment.payment_type === "security_deposit"
                ? (securityDepositInfo?.pending_amount || 0).toLocaleString()
                : (paymentFormData.total_pending || 0).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)}

          {/* Row 3: Amount + Due Date + Description */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">
                Amount (₹) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={demandPayment.amount || ""}
                  onChange={(e) => setDemandPayment({ ...demandPayment, amount: parseFloat(e.target.value) || 0 })}
                  className="pl-7 h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={demandPayment.due_date}
                onChange={(e) => setDemandPayment({ ...demandPayment, due_date: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <Label className="text-[11px] font-medium text-slate-600">Note (optional)</Label>
              <Input
                placeholder="Message for tenant"
                value={demandPayment.description}
                onChange={(e) => setDemandPayment({ ...demandPayment, description: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Notify row */}
          <div className="flex items-center gap-4 pt-1">
            <span className="text-[11px] font-medium text-slate-600">Notify via:</span>
            {[
              { key: "send_email", icon: Mail,       label: "Email" },
              { key: "send_sms",   icon: Smartphone, label: "SMS"   },
            ].map(({ key, icon: Icon, label }) => (
              <label key={key} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={demandPayment[key]}
                  onChange={(e) => setDemandPayment({ ...demandPayment, [key]: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                />
                <Icon className="h-3 w-3 text-slate-500" />
                <span className="text-[11px] text-slate-600">{label}</span>
              </label>
            ))}
          </div>
        </>
      )}

      {/* ══════════════════════════════════
          BULK MODE TAB
      ══════════════════════════════════ */}
      {bulkMode && (
        <>
          {/* Config row: Property + Type + Due Date + Note */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">
                Property <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedPropertyId}
                onValueChange={async (value) => {
                  setSelectedPropertyId(value);
                  setSelectedRooms([]);
                  setSelectedTenants([]);
                  setBookingLoading(true);
                  try {
                    const res = await fetch(
                      `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/bulk-reminders/rooms?property_id=${value}&payment_type=${demandPayment.payment_type || "rent"}`
                    );
                    const data = await res.json();
                    if (data.success) setRoomsWithPending(data.data);
                  } catch { toast.error("Failed to fetch rooms"); }
                  finally { setBookingLoading(false); }
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                  <SelectValue placeholder="Select property..." />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      <span className="text-xs">{p.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">Type</Label>
              <Select
                value={demandPayment.payment_type}
                onValueChange={(value) => {
                  setDemandPayment(prev => ({ ...prev, payment_type: value }));
                  setSelectedRooms([]);
                  setSelectedTenants([]);
                  if (selectedPropertyId) fetchRoomsWithPendingPayments(parseInt(selectedPropertyId), value);
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent" className="text-xs">Rent</SelectItem>
                  <SelectItem value="security_deposit" className="text-xs">Security Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={demandPayment.due_date}
                onChange={(e) => setDemandPayment({ ...demandPayment, due_date: e.target.value })}
                className="h-8 text-xs bg-white"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">Note (optional)</Label>
              <Input
                placeholder="Message for tenants..."
                value={demandPayment.description}
                onChange={(e) => setDemandPayment({ ...demandPayment, description: e.target.value })}
                className="h-8 text-xs bg-white"
              />
            </div>
          </div>

          {/* Notify row */}
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-medium text-slate-600">Notify via:</span>
            {[
              { key: "send_email", icon: Mail,       label: "Email" },
              { key: "send_sms",   icon: Smartphone, label: "SMS"   },
            ].map(({ key, icon: Icon, label }) => (
              <label key={key} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={demandPayment[key]}
                  onChange={(e) => setDemandPayment({ ...demandPayment, [key]: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                />
                <Icon className="h-3 w-3 text-slate-500" />
                <span className="text-[11px] text-slate-600">{label}</span>
              </label>
            ))}
            {selectedTenants.length > 0 && (
              <span className="ml-auto text-[11px] text-slate-500">
                {selectedTenants.length} tenant{selectedTenants.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>

          {/* Rooms + Tenants panels — only shown after property selected */}
          {selectedPropertyId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Rooms panel */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                    <Home className="h-3.5 w-3.5" />
                    Rooms with pending
                    {roomsWithPending.length > 0 && (
                      <span className="text-[10px] text-slate-500">({roomsWithPending.length})</span>
                    )}
                  </h4>
                  <button
                    onClick={() => {
                      if (selectedRooms.length === roomsWithPending.length) {
                        setSelectedRooms([]);
                        setSelectedTenants([]);
                      } else {
                        setSelectedRooms(roomsWithPending.map(r => r.id));
                        setSelectedTenants(roomsWithPending.flatMap(r => r.tenants?.map((t: any) => t.id) || []));
                      }
                    }}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedRooms.length === roomsWithPending.length ? "Deselect all" : "Select all"}
                  </button>
                </div>
                <div className="max-h-[240px] overflow-y-auto divide-y divide-slate-100">
                  {bookingLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    </div>
                  ) : roomsWithPending.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      {selectedPropertyId
                        ? `No rooms with pending ${demandPayment.payment_type === "security_deposit" ? "deposits" : "rent"}`
                        : "Select a property first"}
                    </div>
                  ) : (
                    roomsWithPending.map((room) => {
                      const isSelected = selectedRooms.includes(room.id);
                      const totalPending = room.total_pending ||
                        room.tenants?.reduce((s: number, t: any) => s + (t.total_pending || 0), 0) || 0;
                      return (
                        <div
                          key={room.id}
                          onClick={() => {
                            const nowSelected = !isSelected;
                            setSelectedRooms(nowSelected
                              ? [...selectedRooms, room.id]
                              : selectedRooms.filter(id => id !== room.id));
                            const roomTenantIds = room.tenants?.map((t: any) => t.id) || [];
                            setSelectedTenants(nowSelected
                              ? [...new Set([...selectedTenants, ...roomTenantIds])]
                              : selectedTenants.filter(id => !roomTenantIds.includes(id)));
                          }}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                            ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                            ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                            {isSelected && <span className="text-white text-[9px] font-bold">✓</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-800">Room {room.room_number}</span>
                              <span className="text-[10px] text-slate-400">{room.tenants?.length || 0} tenant(s)</span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Pending: ₹{totalPending.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Tenants panel */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Tenants
                    {selectedTenants.length > 0 && (
                      <span className="text-[10px] text-slate-500">({selectedTenants.length} selected)</span>
                    )}
                  </h4>
                  {selectedRooms.length > 0 && (
                    <button
                      onClick={() => {
                        const allIds = roomsWithPending
                          .filter(r => selectedRooms.includes(r.id))
                          .flatMap(r => r.tenants?.map((t: any) => t.id) || []);
                        const allSelected = allIds.every(id => selectedTenants.includes(id));
                        setSelectedTenants(allSelected
                          ? selectedTenants.filter(id => !allIds.includes(id))
                          : [...new Set([...selectedTenants, ...allIds])]);
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {roomsWithPending
                        .filter(r => selectedRooms.includes(r.id))
                        .flatMap(r => r.tenants || [])
                        .every((t: any) => selectedTenants.includes(t.id))
                        ? "Deselect all" : "Select all"}
                    </button>
                  )}
                </div>
                <div className="max-h-[240px] overflow-y-auto divide-y divide-slate-100">
                  {selectedRooms.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">Select rooms to see tenants</div>
                  ) : (
                    roomsWithPending
                      .filter(room => selectedRooms.includes(room.id))
                      .flatMap(room => (room.tenants || []).map((t: any) => ({ ...t, room_number: room.room_number })))
                      .map((tenant: any) => {
                        const isSelected = selectedTenants.includes(tenant.id);
                        const pending = demandPayment.payment_type === "security_deposit"
                          ? (tenant.security_deposit_pending || tenant.total_pending || 0)
                          : (tenant.total_pending || 0);
                        return (
                          <div
                            key={tenant.id}
                            onClick={() => setSelectedTenants(prev =>
                              prev.includes(tenant.id)
                                ? prev.filter(id => id !== tenant.id)
                                : [...prev, tenant.id]
                            )}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors
                              ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                              ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                              {isSelected && <span className="text-white text-[9px] font-bold">✓</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-800 truncate">{tenant.full_name}</span>
                                {tenant.bed_number && (
                                  <span className="text-[10px] text-slate-400 flex-shrink-0">Bed #{tenant.bed_number}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">Room {tenant.room_number}</span>
                                <span className="text-[10px] text-slate-500">· ₹{pending.toLocaleString()} pending</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>

    {/* ── FOOTER — same style as Add Payment ── */}
    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 rounded-b-lg flex-shrink-0">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsDemandPaymentOpen(false);
            resetDemandPaymentForm();
            setBulkMode(false);
            setSelectedRooms([]);
            setSelectedTenants([]);
            setRoomsWithPending([]);
          }}
          className="text-xs h-8 px-4"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={
            bookingLoading ||
            (bulkMode
              ? selectedTenants.length === 0
              : !demandPayment.tenant_id || !demandPayment.amount || !demandPayment.due_date)
          }
          onClick={bulkMode ? handleBulkSend : handleDemandPayment}
          className="text-xs h-8 px-4 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white hover:from-blue-700 hover:to-blue-800 text-white"
        >
          {bookingLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              Sending...
            </>
          ) : bulkMode ? (
            <>
              <Send className="h-3 w-3 mr-1.5" />
              Send to {selectedTenants.length} tenant{selectedTenants.length !== 1 ? "s" : ""}
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

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            resetPaymentForm();
            setSelectedPayment(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] sm:max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
          {/* Header - Fixed */}
          <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-4 py-3 rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white text-sm font-semibold flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-md">
                    <Pencil className="h-3.5 w-3.5" />
                  </div>
                  Edit Payment
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-xs mt-0.5">
                  Update payment details for this tenant
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-7 w-7"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    resetPaymentForm();
                    setSelectedPayment(null);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Scrollable Body - Same as Add Payment Dialog */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Property + Room Selection (Read-only for edit) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Property Selection - Disabled in edit mode */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Property
                </Label>
                <Input
                  value={
                    properties.find(
                      (p) => p.id === parseInt(selectedPropertyId),
                    )?.name || "Loading..."
                  }
                  disabled
                  className="h-8 text-xs bg-slate-50"
                />
              </div>

              {/* Room Selection - Disabled in edit mode */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Room
                </Label>
                <Input
                  value={
                    rooms.find((r) => r.id === parseInt(selectedRoomId))
                      ?.room_number || "Loading..."
                  }
                  disabled
                  className="h-8 text-xs bg-slate-50"
                />
              </div>
            </div>

            {/* Tenant Selection - Disabled in edit mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Tenant
                </Label>
                <Input
                  value={getTenantName(parseInt(newPayment.tenant_id))}
                  disabled
                  className="h-8 text-xs bg-slate-50"
                />
              </div>

              {/* Payment Type */}
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

            {/* Rent Payment Specific Fields */}
            {newPayment.payment_type === "rent" && (
              <div className="space-y-2">
                {/* Bed Assignment Table */}
                {paymentFormData && (
                  <BedAssignmentTable formData={paymentFormData} />
                )}

                {/* Offer Banner */}
                {paymentFormData?.offer_info && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
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
                      </div>
                    </div>
                  </div>
                )}

                {/* Rent Summary Table */}
                {paymentFormData && (
                  <RentSummaryTable formData={paymentFormData} />
                )}

                {/* Pay For Month */}
                {/* <div className="space-y-1">
            <Label className="text-[11px] font-medium text-slate-600">
              Pay For Month
            </Label>
            <Select
              value={selectedPaymentMonth}
              onValueChange={(value) => {
                setSelectedPaymentMonth(value);
                if (value && value !== "current" && paymentFormData?.unpaid_months) {
                  const selectedMonth = paymentFormData.unpaid_months.find(
                    (m: any) => m.month_key === value,
                  );
                  if (selectedMonth) {
                    setNewPayment((prev) => ({
                      ...prev,
                      amount: selectedMonth.pending.toString(),
                    }));
                  }
                } else if (value === "current") {
                  const monthlyRent = Number(tenant?.tenant_rent || tenant?.monthly_rent || 0);
                  setNewPayment((prev) => ({
                    ...prev,
                    amount: monthlyRent.toString(),
                  }));
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                <SelectValue placeholder="Select month..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                {paymentFormData?.unpaid_months?.map((month: any) => (
                  <SelectItem key={month.month_key} value={month.month_key} className="text-xs">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span>{month.month} {month.year}</span>
                      <span className="text-amber-600 font-medium">₹{month.pending.toLocaleString()}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
                {/* Pay For Month - in the edit dialog - UPDATED CODE */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Pay For Month
                  </Label>
                  <Select
                    value={selectedPaymentMonth}
                    onValueChange={(value) => {
                      setSelectedPaymentMonth(value);

                      // For edit mode, we don't auto-fill amount when changing month
                      // The amount should remain as the original payment amount
                      if (
                        value &&
                        value !== "current" &&
                        paymentFormData?.month_wise_history
                      ) {
                        const selectedMonthData =
                          paymentFormData.month_wise_history.find(
                            (m: any) => m.month_key === value,
                          );
                        if (selectedMonthData && selectedMonthData.rent) {
                          // Don't auto-fill amount in edit mode - keep original payment amount
                          // Just update the month selection
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select month..." />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Show ALL months from paymentFormData, not just unpaid months */}
                      {paymentFormData?.month_wise_history?.map(
                        (month: any) => {
                          const isMonthMatch =
                            selectedPaymentMonth === month.month_key;
                          const isPaidMonth = month.status === "paid";
                          const isPartialMonth = month.status === "partial";

                          return (
                            <SelectItem
                              key={month.month_key}
                              value={month.month_key}
                              className="text-xs"
                            >
                              <div className="flex items-center justify-between w-full gap-4">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {month.month} {month.year}
                                  </span>
                                  {isMonthMatch && (
                                    <span className="text-[9px] text-blue-500">
                                      (Current)
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {isPaidMonth && (
                                    <span className="text-[9px] text-green-600">
                                      ✓ Paid
                                    </span>
                                  )}
                                  {isPartialMonth && month.pending > 0 && (
                                    <span className="text-[9px] text-amber-600">
                                      Pending: ₹{month.pending.toLocaleString()}
                                    </span>
                                  )}
                                  <span
                                    className={`text-xs font-medium ${isPaidMonth ? "text-green-600" : "text-gray-600"}`}
                                  >
                                    Rent: ₹{month.rent.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        },
                      )}
                    </SelectContent>
                  </Select>

                  {/* Show a note if editing a payment for a paid month */}
                  {selectedPaymentMonth &&
                    paymentFormData?.month_wise_history &&
                    (() => {
                      const selectedMonthData =
                        paymentFormData.month_wise_history.find(
                          (m: any) => m.month_key === selectedPaymentMonth,
                        );
                      if (selectedMonthData?.status === "paid") {
                        return (
                          <p className="text-[10px] text-green-600 mt-1">
                            This month is fully paid. Editing this payment will
                            affect the paid amount.
                          </p>
                        );
                      }
                      return null;
                    })()}
                </div>
              </div>
            )}

            {/* Security Deposit Specific Fields */}
            {newPayment.payment_type === "security_deposit" &&
              securityDepositInfo && (
                <div className="space-y-2">
                  {paymentFormData && (
                    <BedAssignmentTable formData={paymentFormData} />
                  )}
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
                          {securityDepositInfo.security_deposit?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Paid</p>
                        <p className="text-xs font-medium text-green-600">
                          ₹{securityDepositInfo.paid_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Pending</p>
                        <p className="text-xs font-bold text-amber-600">
                          ₹
                          {securityDepositInfo.pending_amount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Payment Details Grid */}
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
                    type="text"
                    placeholder="0.00"
                    value={newPayment.amount}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, amount: e.target.value })
                    }
                    className="pl-7 h-8 text-xs"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-slate-600">
                  Payment Mode *
                </Label>
                <Select
  value={newPayment.payment_mode}
  onValueChange={(value) => {
    setNewPayment({
      ...newPayment,
      payment_mode: value,
      bank_name: "",
    });
  }}
>
  <SelectTrigger className="h-8 text-xs">
    <SelectValue placeholder="Select payment mode..." />
  </SelectTrigger>
  <SelectContent>
    {loadingPaymentModes ? (
      <div className="px-2 py-4 text-center text-xs text-slate-500">
        <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
        Loading...
      </div>
    ) : paymentModes.length === 0 ? (
      <div className="px-2 py-4 text-center text-xs text-slate-500">
        No payment modes available
      </div>
    ) : (
      paymentModes.map((mode) => (
        <SelectItem
          key={mode.id}
          value={mode.name.toLowerCase().replace(/\s+/g, "_")}
          className="text-xs"
        >
          {mode.name}
        </SelectItem>
      ))
    )}
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
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setNewPayment({
                      ...newPayment,
                      payment_date: e.target.value,
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>

              {(newPayment.payment_mode === "bank_transfer" ||
                newPayment.payment_mode === "online_payment_gateway") && (
                <div className="space-y-1">
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
                    <SelectTrigger className="h-8 text-xs">
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

                  {/* Custom Bank Name Input */}
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
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Transaction ID - conditional */}
              {(newPayment.payment_mode === "online" ||
                newPayment.payment_mode === "bank_transfer" ||
                newPayment.payment_mode === "cheque" ||
                newPayment.payment_mode === "online_payment_gateway" ||
              newPayment.payment_mode === "upi" ||
            newPayment.payment_mode === "wallet") && (
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
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 rounded-b-lg flex-shrink-0">
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetPaymentForm();
                  setSelectedPayment(null);
                }}
                className="text-xs h-8 px-4"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleUpdatePayment(newPayment)}
                className="text-xs h-8 px-4 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]  hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Pencil className="h-3 w-3 mr-1.5" />
                Update Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog
        open={isReceiptPreviewOpen}
        onOpenChange={setIsReceiptPreviewOpen}
      >
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">

          {/* Header — same style as Expense Receipt modal */}
          <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] px-3.5 py-2">
            <div>
              <h2 className="flex items-center gap-1.5 text-sm font-bold leading-tight text-white">
                <FileText className="h-3.5 w-3.5" />
                Payment Receipt
              </h2>
              <p className="text-[10px] leading-tight text-blue-100">
                Receipt #{selectedReceipt?.id} • {selectedReceipt?.month} {selectedReceipt?.year}
              </p>
            </div>
            <button
              onClick={() => setIsReceiptPreviewOpen(false)}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {selectedReceipt && (() => {
              const amt = Number(selectedReceipt.amount) || 0;
              const modeLabel = (selectedReceipt.payment_mode || "").replace(/_/g, " ").toUpperCase();
              const roomBed = [
                selectedReceipt.room_number ? `${selectedReceipt.room_number}` : null,
                selectedReceipt.bed_number ? `Bed ${selectedReceipt.bed_number}` : null,
              ].filter(Boolean).join(" | ");
              const paymentTypeDisplay =
                selectedReceipt.payment_type === "security_deposit" ? "Security Deposit" :
                selectedReceipt.payment_type === "deposit_refund" ? "Deposit Refund" :
                selectedReceipt.payment_type === "penalty_payment" ? "Penalty Payment" :
                "Rent Payment";
              const receiptDateObj = new Date(selectedReceipt.payment_date);
              const mm = String(receiptDateObj.getMonth() + 1).padStart(2, "0");
              const yyyy = receiptDateObj.getFullYear();
              const receiptNo = `REC-${String(selectedReceipt.id).padStart(4, "0")}-${mm}${yyyy}`;

              return (
  <div id="payment-receipt-print-area" className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">

                  {/* Watermark */}
                 <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
  <span
    className="absolute left-1/2 top-1/2 whitespace-nowrap text-[90px] font-black text-blue-100/50"
    style={{
      transform: "translate(-50%, -50%) rotate(-25deg)",
      userSelect: "none",
    }}
  >
    {(siteName || "R").split(" ")[0]}
  </span>
</div>

                  {/* Header: logo left, site name center, receipt no right */}
                  <div className="relative z-10 mb-3 flex items-center border-b border-slate-200 pb-3">
                    <div className="w-28 flex-shrink-0">
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt={siteName}
                          className="h-14 w-auto object-contain"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                        />
                      ) : (
                        <div className="text-xl font-extrabold text-blue-700">{(siteName || "R").charAt(0)}</div>
                      )}
                    </div>
                    <div className="flex-1 text-center">
                      <h2 className="text-lg font-bold text-slate-800">{siteName}</h2>
                      <p className="text-sm font-semibold text-cyan-600">Payment Receipt</p>
                    </div>
                    <div className="w-28 text-right text-[10px] text-slate-400">
                      <span className="block font-semibold uppercase tracking-wide text-slate-400">Receipt No.</span>
                      <span className="font-mono text-[10px] text-slate-700">{receiptNo}</span>
                    </div>
                  </div>

                  {/* Meta strip */}
                  <div className="relative z-10 mb-3 flex justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-500">
                    <div>
                      <span className="block text-[9px] font-semibold uppercase">Payment Date</span>
                      <span className="block font-bold text-slate-800">
                        {format(new Date(selectedReceipt.payment_date), "dd MMM yyyy")}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-semibold uppercase">Property</span>
                      <span className="block font-bold text-slate-800">{selectedReceipt.property_name || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-semibold uppercase">Billing Period</span>
                      <span className="block font-bold text-slate-800">
                        {selectedReceipt.month} {selectedReceipt.year}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] font-semibold uppercase">Status</span>
                      <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                        PAID
                      </span>
                    </div>
                  </div>

                  {/* Field grid */}
                  <div className="relative z-10 mb-3 grid grid-cols-3 gap-x-4 gap-y-1.5 border-b border-slate-200 pb-3 text-xs">
                    <div><span className="block text-[9px] font-semibold uppercase text-slate-400">Tenant Name</span><div className="font-semibold text-blue-700">{selectedReceipt.tenant_name || "—"}</div></div>
                    <div><span className="block text-[9px] font-semibold uppercase text-slate-400">Mobile Number</span><div className="font-semibold text-blue-700">{selectedReceipt.tenant_phone || "—"}</div></div>
                    <div><span className="block text-[9px] font-semibold uppercase text-slate-400">Email Address</span><div className="text-[10px] font-medium text-slate-700">{selectedReceipt.tenant_email || "—"}</div></div>

                    <div><span className="block text-[9px] font-semibold uppercase text-slate-400">Payment Mode</span><div className="font-medium text-slate-700">{modeLabel || "—"}</div></div>
                    <div><span className="block text-[9px] font-semibold uppercase text-slate-400">Bank Name</span><div className="font-medium text-slate-700">{selectedReceipt.bank_name || "—"}</div></div>
                    <div><span className="block text-[9px] font-semibold uppercase text-slate-400">Mode Type</span><div className="font-mono text-[10px] text-slate-600">—</div></div>

                    <div><span className="block text-[9px] font-semibold uppercase text-slate-400">Property Name</span><div className="font-medium text-slate-700">{selectedReceipt.property_name || "—"}</div></div>
                    <div><span className="block text-[9px] font-semibold uppercase text-slate-400">Unit / Room</span><div className="font-medium text-slate-700">{roomBed || "—"}</div></div>
                    {selectedReceipt.transaction_id ? (
                      <div><span className="block text-[9px] font-semibold uppercase text-slate-400">Transaction ID</span><div className="font-mono text-[10px] text-slate-700">{selectedReceipt.transaction_id}</div></div>
                    ) : (
                      <div><span className="block text-[9px] font-semibold uppercase text-slate-400">Payment For</span><div className="font-medium text-slate-700">{paymentTypeDisplay}</div></div>
                    )}
                  </div>

                  {/* Payment details table */}
                  {/* <p className="relative z-10 mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Payment Details</p> */}
                  {/* <table className="relative z-10 mb-3 w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="border border-blue-100 px-2 py-1 text-left text-[10px] font-semibold text-blue-500">#</th>
                        <th className="border border-blue-100 px-2 py-1 text-left text-[10px] font-semibold text-blue-500">Tenant Name</th>
                        <th className="border border-blue-100 px-2 py-1 text-left text-[10px] font-semibold text-blue-500">Payment Type</th>
                        <th className="border border-blue-100 px-2 py-1 text-left text-[10px] font-semibold text-blue-500">Unit / Room</th>
                        <th className="border border-blue-100 px-2 py-1 text-left text-[10px] font-semibold text-blue-500">Period</th>
                        <th className="border border-blue-100 px-2 py-1 text-right text-[10px] font-semibold text-blue-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-200 px-2 py-1 text-slate-600">1</td>
                        <td className="border border-slate-200 px-2 py-1 text-slate-700">{selectedReceipt.tenant_name || "—"}</td>
                        <td className="border border-slate-200 px-2 py-1 text-slate-700">{paymentTypeDisplay}</td>
                        <td className="border border-slate-200 px-2 py-1 text-slate-700">{roomBed || "—"}</td>
                        <td className="border border-slate-200 px-2 py-1 text-slate-700">{selectedReceipt.month} {selectedReceipt.year}</td>
                        <td className="border border-slate-200 px-2 py-1 text-right font-medium text-slate-800">₹{amt.toLocaleString("en-IN")}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-50">
                        <td colSpan={5} className="border border-emerald-100 px-2 py-1 text-right font-bold text-emerald-700">Total</td>
                        <td className="border border-emerald-100 px-2 py-1 text-right font-bold text-emerald-700">₹{amt.toLocaleString("en-IN")}</td>
                      </tr>
                    </tfoot>
                  </table> */}

                  {/* Payment history table */}
                  <p className="relative z-10 mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Payment History</p>
                  <table className="relative z-10 mb-3 w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="border border-blue-100 px-2 py-1 text-left text-[10px] font-semibold text-blue-500">Payment Date</th>
                        <th className="border border-blue-100 px-2 py-1 text-left text-[10px] font-semibold text-blue-500">Mode</th>
                        <th className="border border-blue-100 px-2 py-1 text-left text-[10px] font-semibold text-blue-500">Transaction ID</th>
                        <th className="border border-blue-100 px-2 py-1 text-right text-[10px] font-semibold text-blue-500">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-200 px-2 py-1 text-slate-700">{format(new Date(selectedReceipt.payment_date), "dd MMM yyyy")}</td>
                        <td className="border border-slate-200 px-2 py-1 text-slate-700">{modeLabel || "—"}</td>
                        <td className="border border-slate-200 px-2 py-1 text-slate-500">{selectedReceipt.transaction_id || selectedReceipt.bank_name || "—"}</td>
                        <td className="border border-slate-200 px-2 py-1 text-right font-medium text-emerald-700">₹{amt.toLocaleString("en-IN")}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-50">
                        <td colSpan={3} className="border border-emerald-100 px-2 py-1 text-right font-bold text-emerald-700">Total Paid</td>
                        <td className="border border-emerald-100 px-2 py-1 text-right font-bold text-emerald-700">₹{amt.toLocaleString("en-IN")}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <div className="relative z-10 mb-2 text-right text-[9px] italic text-slate-400">
                    {/* Optionally render amount in words here if you add a numberToWords helper */}
                  </div>

                  {selectedReceipt.remark && (
                    <div className="relative z-10 mb-3 rounded-md border-l-3 border-amber-400 bg-amber-50 px-2.5 py-1.5">
                      <div className="text-[8px] font-semibold uppercase tracking-wide text-amber-700">Remark</div>
                      <div className="text-[11px] text-amber-800">{selectedReceipt.remark}</div>
                    </div>
                  )}

                  {/* Thank you + signatures */}
                  <div className="relative z-10 mt-4 border-t border-dashed border-slate-300 pt-3">
                    <div className="text-xs font-medium text-slate-700">Thank you for your payment!</div>
                    {/* <div className="mb-6 text-[10px] italic text-slate-400">
                      This is a computer generated receipt. No signature required.
                    </div> */}
                    <div className="flex items-end justify-between">
                      <div className="w-40 text-center">
                        <div className="mx-auto mb-1 h-7 w-36 border-b border-slate-400" />
                        <div className="text-[9px] font-medium uppercase tracking-wide text-slate-500">Tenant Signature</div>
                      </div>
                      <div className="w-40 text-center">
                        <div className="mx-auto mb-1 h-7 w-36 border-b border-slate-400" />
                        <div className="text-[9px] font-medium uppercase tracking-wide text-slate-500">Authorised Signatory</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="relative z-10 mt-3 border-t border-slate-200 pt-2 text-center">
                    <p className="text-[9px] leading-relaxed text-slate-400">
                      {contactAddress && <>{contactAddress}<br /></>}
                      {contactPhone && `Tel: ${contactPhone}`}
                      {contactPhone && contactEmail && "  |  "}
                      {contactEmail && `Email: ${contactEmail}`}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      Powered by {siteName} • Generated on{" "}
                      {format(new Date(selectedReceipt.created_at), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Footer actions */}
       {/* Footer actions */}
          <div className="flex flex-shrink-0 gap-2 border-t border-slate-100 px-3 py-2">
            <button
              onClick={() => setIsReceiptPreviewOpen(false)}
              className="h-8 flex-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
            {/* <button
              onClick={() => {
                const content = document.getElementById("payment-receipt-print-area");
                if (!content) return;
                const win = window.open("", "_blank", "width=800,height=900");
                if (!win) return;
                win.document.write(`
                  <html>
                    <head>
                      <title>Payment Receipt</title>
                      <style>
                        body { font-family: Arial, 'Helvetica Neue', sans-serif; padding: 20px; background: #fff; }
                        #payment-receipt-print-area { max-width: 720px; margin: 0 auto; }
                        ${Array.from(document.styleSheets).reduce((acc, sheet) => {
                          try {
                            const rules = sheet.cssRules || sheet.rules;
                            if (rules) for (const rule of rules) acc += rule.cssText;
                          } catch (e) {}
                          return acc;
                        }, "")}
                      </style>
                    </head>
                    <body>${content.outerHTML}</body>
                  </html>
                `);
                win.document.close();
                win.focus();
                win.print();
              }}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button> */}
            <button
              onClick={() => {
                const content = document.getElementById("payment-receipt-print-area");
                if (!content) return;
                const win = window.open("", "_blank", "width=800,height=900");
                if (!win) return;
                win.document.write(`
                  <html>
                    <head>
                      <title>Payment Receipt</title>
                      <style>
                        body { font-family: Arial, 'Helvetica Neue', sans-serif; padding: 20px; background: #fff; }
                        #payment-receipt-print-area { max-width: 720px; margin: 0 auto; }
                        ${Array.from(document.styleSheets).reduce((acc, sheet) => {
                          try {
                            const rules = sheet.cssRules || sheet.rules;
                            if (rules) for (const rule of rules) acc += rule.cssText;
                          } catch (e) {}
                          return acc;
                        }, "")}
                      </style>
                    </head>
                    <body>${content.outerHTML}</body>
                  </html>
                `);
                win.document.close();
                win.focus();
                setTimeout(() => {
                  win.print();
                }, 300);
              }}
              className="flex h-8 flex-[2] items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-[11px] font-bold text-white hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Ledger Report Dialog */}
      <LedgerReportDialog
        open={isLedgerReportOpen}
        onOpenChange={setIsLedgerReportOpen}
        tenant={selectedLedgerTenant}
        payments={payments.filter(
          (p) => p.tenant_id === selectedLedgerTenant?.id,
        )}
        siteName={siteName}
        siteTagline={siteTagline}
        contactAddress={contactAddress}
        contactPhone={contactPhone}
        contactEmail={contactEmail}
        companyLogo={companyLogo}
        getTenantName={getTenantName}
        getTenantPhone={getTenantPhone}
        getTenantSalutation={getTenantSalutation}
        getTenantCountryCode={getTenantCountryCode}
      />

<Dialog open={isResendPopupOpen} onOpenChange={setIsResendPopupOpen}>
  <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
    <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-3 rounded-t-lg flex-shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <DialogTitle className="text-white text-sm font-semibold flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Regenerate & Resend Demand — {resendDemand?.tenant_name}
          </DialogTitle>
          <DialogDescription className="text-blue-100 text-[10px] mt-0.5">
            Review {resendDemand?.payment_type === 'security_deposit' ? 'security deposit' : 'payment'} status before resending demand
          </DialogDescription>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-7 w-7">
            <X className="h-3.5 w-3.5" />
          </Button>
        </DialogClose>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {resendLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Demand Summary */}
          {resendDemand && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="text-[10px] text-blue-600">Demand Amount</p>
                <p className="text-sm font-bold text-blue-800">₹{Number(resendDemand.amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-600">Due Date</p>
                <p className="text-sm font-bold text-blue-800">{format(new Date(resendDemand.due_date), "dd MMM yyyy")}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-600">Type</p>
                <p className="text-sm font-bold text-blue-800 capitalize">
                  {resendDemand.payment_type === 'security_deposit' ? 'Security Deposit' : 'Rent'}
                </p>
              </div>
            </div>
          )}

          {/* SHOW SECURITY DEPOSIT DETAILS for security deposit demands */}
          {resendTenantFormData?.is_security_deposit && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Shield className="h-3 w-3" />
                  Security Deposit Status
                </p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] text-slate-500">Total Security Deposit</p>
                    <p className="text-sm font-bold text-blue-600">
                      ₹{(resendTenantFormData.security_deposit_info?.security_deposit || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Already Paid</p>
                    <p className="text-sm font-medium text-green-600">
                      ₹{(resendTenantFormData.security_deposit_info?.paid_amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Pending Amount</p>
                    <p className="text-sm font-bold text-amber-600">
                      ₹{(resendTenantFormData.security_deposit_info?.pending_amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">Status</p>
                    <Badge className={`text-[10px] px-2 py-0.5 ${
                      (resendTenantFormData.security_deposit_info?.pending_amount || 0) === 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {(resendTenantFormData.security_deposit_info?.pending_amount || 0) === 0 ? 'Fully Paid' : 'Pending'}
                    </Badge>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {(resendTenantFormData.security_deposit_info?.security_deposit || 0) > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Payment Progress</span>
                      <span>
                        {Math.round(
                          ((resendTenantFormData.security_deposit_info?.paid_amount || 0) /
                            (resendTenantFormData.security_deposit_info?.security_deposit || 1)) * 100
                        )}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                        style={{
                          width: `${((resendTenantFormData.security_deposit_info?.paid_amount || 0) /
                            (resendTenantFormData.security_deposit_info?.security_deposit || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Property Info for security deposit */}
                {resendTenantFormData.security_deposit_info?.property_name && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400">Property:</span>
                        <span className="ml-1 font-medium">{resendTenantFormData.security_deposit_info.property_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Room/Bed:</span>
                        <span className="ml-1 font-medium">
                          Room {resendTenantFormData.security_deposit_info.room_number || 'N/A'}
                          {resendTenantFormData.security_deposit_info.bed_number && ` • Bed #${resendTenantFormData.security_deposit_info.bed_number}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SHOW RENT SUMMARY for rent demands */}
          {resendTenantFormData && !resendTenantFormData.is_security_deposit && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <IndianRupee className="h-3 w-3" />
                  Payment Status — Previous to Current
                </p>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 text-[10px] font-semibold text-slate-600">Month</th>
                      <th className="text-right p-2 text-[10px] font-semibold text-slate-600">Rent</th>
                      <th className="text-right p-2 text-[10px] font-semibold text-slate-600">Paid</th>
                      <th className="text-right p-2 text-[10px] font-semibold text-slate-600">Pending</th>
                      <th className="text-center p-2 text-[10px] font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(resendTenantFormData.month_wise_history || []).map((month: any, i: number) => (
                      <tr key={i} className={`border-t border-slate-100 ${month.status === 'paid' ? 'bg-green-50/30' : month.pending > 0 ? 'bg-red-50/30' : ''}`}>
                        <td className="p-2 font-medium">{month.month} {month.year}</td>
                        <td className="p-2 text-right">₹{month.rent?.toLocaleString()}</td>
                        <td className="p-2 text-right text-green-600">₹{month.paid?.toLocaleString()}</td>
                        <td className="p-2 text-right">
                          <span className={month.pending > 0 ? "text-red-600 font-semibold" : "text-green-600"}>
                            ₹{month.pending?.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                            month.status === 'paid' ? 'bg-green-100 text-green-700' :
                            month.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{month.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border-t border-slate-200">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">Total Paid</p>
                  <p className="text-sm font-bold text-green-600">₹{(resendTenantFormData.total_paid || 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">Total Pending</p>
                  <p className="text-sm font-bold text-red-600">₹{(resendTenantFormData.total_pending || 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500">Months Due</p>
                  <p className="text-sm font-bold text-amber-600">{resendTenantFormData.unpaid_months?.length || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Regenerate Options */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-slate-600">New Amount (₹)</Label>
              <Input
                type="number"
                value={resendDemand?.amount || ""}
                onChange={(e) => setResendDemand(prev => prev ? {...prev, amount: parseFloat(e.target.value)} : prev)}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-slate-600">New Due Date</Label>
              <Input
                type="date"
                value={resendDemand?.due_date?.split('T')[0] || ""}
                onChange={(e) => setResendDemand(prev => prev ? {...prev, due_date: e.target.value} : prev)}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-semibold text-slate-600">Description</Label>
              <Input
                placeholder="Optional..."
                value={resendDemand?.description || ""}
                onChange={(e) => setResendDemand(prev => prev ? {...prev, description: e.target.value} : prev)}
                className="h-7 text-xs"
              />
            </div>
          </div>
        </>
      )}
    </div>

    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 rounded-b-lg flex-shrink-0">
      <div className="flex justify-between items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setIsResendPopupOpen(false)} className="text-xs h-7 px-3">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={async () => {
            if (!resendDemand) return;
            await handleResendReminder(resendDemand);
            setIsResendPopupOpen(false);
          }}
          className="text-xs h-7 px-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white"
        >
          <Send className="h-3 w-3 mr-1" />
          Regenerate & Send
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}

// Add this pagination component at the bottom of your file (before the main component exports)
const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
  currentItemsCount,
}: any) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 rounded-b-lg">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Show</span>
<select
  value={String(itemsPerPage)}
  onChange={(e) => {
    const val = e.target.value;
    if (val === "All") {
      onItemsPerPageChange("All");
    } else {
      onItemsPerPageChange(Number(val));
    }
  }}
  style={{
    padding: "4px 8px",
    border: "1px solid #E2E8F0",
    borderRadius: 6,
    fontSize: 11,
    background: "#fff",
    outline: "none",
    cursor: "pointer",
  }}
>
  <option value={10}>10</option>
  <option value={25}>25</option>
  <option value={50}>50</option>
  <option value={100}>100</option>
  <option value="All">All</option>   {/* ✅ ADD THIS */}
</select>
        <span>entries</span>
        <span className="ml-2">
          Showing {currentItemsCount} of {totalItems} entries
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-7 px-2 text-xs"
        >
          Previous
        </Button>

        {getPageNumbers().map((pageNum) => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            className={`h-7 w-7 p-0 text-xs ${
              currentPage === pageNum
                ? "bg-blue-600 hover:bg-blue-700"
                : "hover:bg-slate-100"
            }`}
          >
            {pageNum}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-7 px-2 text-xs"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

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

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const variants: Record<
    string,
    { className: string; icon: any; label: string }
  > = {
    approved: {
      className: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle2,
      label: "Approved",
    },
    pending: {
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
      label: "Pending",
    },
    rejected: {
      className: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
      label: "Rejected",
    },
    paid: {
      className: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle2,
      label: "Paid",
    },
    partial: {
      className: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Clock,
      label: "Partial",
    },
    refund: {
      className: "bg-purple-100 text-purple-800 border-purple-200",
      icon: CheckCircle2,
      label: "Refund",
    },
  };

  const normalizedStatus = status?.toLowerCase() || "pending";
  const config = variants[normalizedStatus] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} flex items-center gap-0.5 text-[9px] px-1.5 py-0.5`}
    >
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </Badge>
  );
};

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
  filterPropertyId,
  setFilterPropertyId,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
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
  onLedgerReport,
  fetchRoomsByProperty,
  fetchTenantsByRoom,
  handleTenantSelect,
  setSelectedPropertyId,
  setSelectedRoomId,
  setNewPayment,
  fetchProperties,
  properties,
  prefillAndOpenPaymentForm,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  paymentTypeFilter,
  setPaymentTypeFilter,
  exactPendingFilter,
  setExactPendingFilter,
  setMinPendingFilter,
  roomFilter,
  setRoomFilter,
  ignoreDateFilters,
  setIgnoreDateFilters,
showPendingRentOnly,
setShowPendingRentOnly,
}: any) => {
 
  // Group payments by tenant using the passed function
  const { items: paginatedGroups, totalItems, totalPages } = pagination;

  const tenantGroups = paginatedGroups.map((group: any) => ({
    ...group,
    salutation: getTenantSalutation(group.tenant_id),
    country_code: getTenantCountryCode(group.tenant_id),
  }));

  // Filter groups based on column filters
const filteredGroups = pagination.items.map((group: any) => ({
    ...group,
    salutation: getTenantSalutation(group.tenant_id),
    country_code: getTenantCountryCode(group.tenant_id),
  }));

  return (
    <Card className="border-0 overflow-hidden flex flex-col h-[320px] sm:h-[490px]">
  <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
    <div className="overflow-auto flex-1 min-h-0 flex flex-col">
<div className="min-w-[1300px] flex flex-col flex-1 min-h-0">

        {/* ✅ Sticky Header */}
        <table className="table-fixed w-full border-collapse sticky top-0 z-10 bg-gray-200">
          <colgroup>
<col style={{ width: "32px" }} />
<col style={{ width: "70px" }} />
<col style={{ width: "175px" }} />
<col style={{ width: "115px" }} />
<col style={{ width: "90px" }} />
<col style={{ width: "105px" }} />
<col style={{ width: "47px" }} />
<col style={{ width: "90px" }} />
<col style={{ width: "80px" }} />
<col style={{ width: "90px" }} />  
<col style={{ width: "80px" }} />
<col style={{ width: "95px" }} />
<col style={{ width: "61px" }} />
          </colgroup>
         <thead>
  {/* ── Row 1: Column Titles ── */}
  <tr>
    <th className="py-1.5 px-1 bg-gray-200 border-r border-gray-300 border-b border-gray-300" />

    <th className="py-1.5 px-1 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
    </th>

    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort?.("tenant_name")}>
        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Name</span>
        <ArrowUpDown className="h-2.5 w-2.5 text-gray-500" />
      </div>
    </th>

    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Property</span>
    </th>

    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Room/Bed</span>
    </th>

    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Contact</span>
    </th>

    <th className="py-1.5 px-1 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-center">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">CNT</span>
    </th>

    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-right">
      <div className="flex items-center gap-1 cursor-pointer justify-end" onClick={() => handleSort?.("total_amount")}>
        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Total</span>
        <ArrowUpDown className="h-2.5 w-2.5 text-gray-500" />
      </div>
    </th>

    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-right">
      <span className="font-semibold text-green-700 text-[10px] uppercase tracking-wide">Paid</span>
    </th>

    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-right">
      <span className="font-semibold text-amber-700 text-[10px] uppercase tracking-wide">Pending</span>
    </th>

    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-right">
      <span className="font-semibold text-red-700 text-[10px] uppercase tracking-wide">Rejected</span>
    </th>

    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort?.("status")}>
        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status</span>
        <ArrowUpDown className="h-2.5 w-2.5 text-gray-500" />
      </div>
    </th>

    <th className="py-1.5 px-2 bg-gray-200 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Last Pay</span>
    </th>
  </tr>

  {/* ── Row 2: Search Inputs ── */}
<tr className="bg-white border-t border-gray-300">
  {/* Expand column – no border-right to match expense table's first cell */}
  <td className="p-1 border-r border-gray-100" />

  {/* Actions – no filter, but keep the cell with border */}
  <td className="p-1 border-r border-gray-100" />

  {/* Name */}
  <td className="p-1 border-r border-gray-100">
    <Input
      placeholder="Search..."
      className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
      value={columnFilters?.tenant_name || ""}
      onChange={(e) => { setColumnFilters?.({ ...columnFilters, tenant_name: e.target.value }); onPageChange?.(1); }}
    />
  </td>

  {/* Property */}
  <td className="p-1 border-r border-gray-100">
    <Input
      placeholder="Search..."
      className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
      value={columnFilters?.property_name || ""}
      onChange={(e) => setColumnFilters?.({ ...columnFilters, property_name: e.target.value })}
    />
  </td>

  {/* Room/Bed */}
  <td className="p-1 border-r border-gray-100">
    <Input
      placeholder="Search..."
      className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
      value={columnFilters?.room_bed || ""}
      onChange={(e) => setColumnFilters?.({ ...columnFilters, room_bed: e.target.value })}
    />
  </td>

  {/* Contact */}
  <td className="p-1 border-r border-gray-100">
    <Input
      placeholder="Search..."
      className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
      value={columnFilters?.contact || ""}
      onChange={(e) => setColumnFilters?.({ ...columnFilters, contact: e.target.value })}
    />
  </td>

  {/* CNT */}
  <td className="p-1 border-r border-gray-100">
    <Input
      placeholder="#"
      type="number"
      className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1 text-center font-normal w-full"
      value={columnFilters?.payment_count || ""}
      onChange={(e) => setColumnFilters?.({ ...columnFilters, payment_count: e.target.value })}
    />
  </td>

  {/* Total */}
  <td className="p-1 border-r border-gray-100">
    <Input
      placeholder="₹"
      type="number"
      className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
      value={columnFilters?.amount || ""}
      onChange={(e) => setColumnFilters?.({ ...columnFilters, amount: e.target.value })}
    />
  </td>

  {/* Paid */}
  <td className="p-1 border-r border-gray-100">
    <Input
      placeholder="₹"
      type="number"
      className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
      value={columnFilters?.total_paid_amount || ""}
      onChange={(e) => setColumnFilters?.({ ...columnFilters, total_paid_amount: e.target.value })}
    />
  </td>

  {/* Pending */}
  <td className="p-1 border-r border-gray-100">
    <Input
      placeholder="₹"
      type="number"
      className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
      value={columnFilters?.total_pending_amount || ""}
      onChange={(e) => setColumnFilters?.({ ...columnFilters, total_pending_amount: e.target.value })}
    />
  </td>

  {/* Rejected */}
  <td className="p-1 border-r border-gray-100">
    <Input
      placeholder="₹"
      type="number"
      className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
      value={columnFilters?.total_rejected_amount || ""}
      onChange={(e) => setColumnFilters?.({ ...columnFilters, total_rejected_amount: e.target.value })}
    />
  </td>

  {/* Status */}
  <td className="p-1 border-r border-gray-100">
    <Select
      value={columnFilters?.status || "all"}
      onValueChange={(value) => setColumnFilters?.({ ...columnFilters, status: value })}
    >
      <SelectTrigger className="h-5 text-[10px] bg-white border-gray-300 px-1.5 font-normal w-full">
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="text-xs">All</SelectItem>
        <SelectItem value="approved" className="text-xs">Approved</SelectItem>
        <SelectItem value="pending" className="text-xs">Pending</SelectItem>
        <SelectItem value="rejected" className="text-xs">Rejected</SelectItem>
      </SelectContent>
    </Select>
  </td>

  {/* Last Pay – no border-right (last column) */}
  <td className="p-1">
    <Input
      placeholder="dd/mm/yy"
      className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
      value={columnFilters?.payment_date || ""}
      onChange={(e) => { setColumnFilters?.({ ...columnFilters, payment_date: e.target.value }); onPageChange?.(1); }}
    />
  </td>
</tr>
</thead>
        </table>

        {/* ✅ Scrollable Body */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <table className="table-fixed w-full border-collapse">
            <colgroup>
              <col style={{ width: "36px" }} />
<col style={{ width: "81px" }} />
<col style={{ width: "202px" }} />
<col style={{ width: "132px" }} />
<col style={{ width: "105px" }} />
<col style={{ width: "122px" }} />
<col style={{ width: "54px" }} />
<col style={{ width: "104px" }} />
<col style={{ width: "92px" }} />
<col style={{ width: "106px" }} />
<col style={{ width: "91px" }} />
<col style={{ width: "108px" }} />
            </colgroup>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-3" />
                      <p className="text-sm text-slate-500">Loading payment data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                        <CreditCard className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-700 mb-1">No payments found</h3>
                      <p className="text-xs text-slate-500">Try adjusting your filters or add a new payment</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group: any) => {
                  const isExpanded = expandedRows.includes(group.tenant_id);
                  return (
                    <Fragment key={group.tenant_id}>

                      {/* ✅ Parent Row - click anywhere to expand */}
                      <tr
                        className={`cursor-pointer transition-all duration-200 border-b border-slate-200 group ${
                          isExpanded ? "bg-blue-50/60" : "hover:bg-slate-50/80"
                        }`}
                        onClick={() => onToggleExpand(group.tenant_id)}
                      >

                        {/* Expand */}
                        <td className="py-2 px-1 border-r border-slate-100">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 mx-auto ${
                            isExpanded ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600 group-hover:bg-blue-100"
                          }`}>
                            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-1 border-r border-slate-100" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-0.5 justify-center">
                            <button
                              className="h-6 w-6 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                              title="Ledger Report"
                              onClick={() => onLedgerReport?.(group.tenant_id, {
                                room_number: group.room_number,
                                bed_number: group.bed_number,
                                property_name: group.property_name,
                                monthly_rent: group.monthly_rent,
                                check_in_date: group.check_in_date,
                              })}
                            >
                              <FileText className="h-3 w-3" />
                            </button>
                            <button
                                className="h-6 w-6 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center"
                                title="View Details"
                                onClick={(e) => { e.stopPropagation(); onToggleExpand(group.tenant_id); }}
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            <button
                              className="h-6 w-6 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 flex items-center justify-center"
                              title="Add Payment"
                              onClick={async () => {
                                const tenant = tenants.find((t) => t.id === group.tenant_id);
                                const propertyId = tenant?.current_assignment?.property_id || group.property_id;
                                const roomId = tenant?.current_assignment?.room_id || group.room_id;
                                if (tenant && propertyId && roomId) {
                                  await prefillAndOpenPaymentForm(group.tenant_id, propertyId, roomId);
                                } else {
                                  toast.error("Tenant missing property or room information");
                                  setIsAddPaymentOpen(true);
                                }
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-2 px-2 border-r border-slate-100">
                          <div className="flex items-center gap-1.5">
                       {(() => {
  const t = tenants.find((x: any) => x.id === group.tenant_id);
  return t?.photo_url ? (
    <img src={t.photo_url} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200" />
  ) : (
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center text-white font-semibold text-[10px] shadow-sm flex-shrink-0">
      {group.tenant_name?.split(" ").filter(Boolean).slice(0, 2).map((name: string) => name.charAt(0).toUpperCase()).join("")}
    </div>
  );
})()}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 flex-wrap">
                                <p className="text-[11px] font-medium text-slate-800 truncate">
                                  {group.salutation ? `${group.salutation} ` : ""}
                                  {(group.tenant_name || "").toLowerCase().replace(/\b\w/g, (c: any) => c.toUpperCase())}
                                </p>
                                {group.is_vacated ? (
                                  <Badge className="bg-red-100 text-red-700 border-red-200 text-[9px] px-1 py-0 flex-shrink-0 leading-tight">
                                    Vacated
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 border-green-200 text-[9px] hover:bg-green-500 px-1 py-0 flex-shrink-0 leading-tight">
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Property */}
                        <td className="py-2 px-2 border-r border-slate-100">
                          <span className="text-[11px] text-slate-600 truncate block" title={group.property_name}>
                            {group.property_name || <span className="text-slate-400">—</span>}
                          </span>
                        </td>

                        {/* Room / Bed */}
                       <td className="py-2 px-2 border-r border-slate-100">
  <div className="flex items-center gap-1 whitespace-nowrap">
    {group.room_number && (
      <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 whitespace-nowrap">
        <DoorOpen className="h-2 w-2" />
        R{group.room_number}
      </span>
    )}

    {group.bed_number && (
      <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 whitespace-nowrap">
        <Bed className="h-2 w-2" />
        B{group.bed_number}
      </span>
    )}
  </div>
</td>

                        {/* Contact */}
                        <td className="py-2 px-2 border-r border-slate-100">
                          <span className="text-[11px] text-slate-500 whitespace-nowrap truncate block">
                            {group.country_code || "+91"} {group.tenant_phone}
                          </span>
                        </td>

                        {/* CNT */}
                        <td className="py-2 px-1 text-center border-r border-slate-100">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0">
                            {group.payment_count}
                          </Badge>
                        </td>

                        {/* Total */}
                        <td className="py-2 px-2 text-right border-r border-slate-100">
                          <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                            ₹{group.total_amount.toLocaleString()}
                          </span>
                        </td>

                        {/* Paid */}
                        <td className="py-2 px-2 text-right border-r border-slate-100">
                          <span className="text-[11px] font-bold text-green-600 whitespace-nowrap">
                            ₹{group.total_paid_amount?.toLocaleString() || 0}
                          </span>
                        </td>

                        {/* Pending */}
<td className="py-2 px-2 text-right border-r border-slate-100">
  <div className="flex flex-col items-end">
    <span className="text-[11px] font-bold text-amber-600 whitespace-nowrap">
      ₹{group.total_pending_amount?.toLocaleString() || 0}
    </span>
    {group.rent_pending_amount > 0 && group.deposit_pending_amount > 0 && (
      <span className="text-[8px] text-slate-400 whitespace-nowrap">
        R: ₹{group.rent_pending_amount.toLocaleString()} • D: ₹{group.deposit_pending_amount.toLocaleString()}
      </span>
    )}
    {group.rent_pending_amount > 0 && group.deposit_pending_amount === 0 && (
      <span className="text-[8px] text-slate-400 block leading-tight">
        R: ₹{group.rent_pending_amount.toLocaleString()}
      </span>
    )}
    {group.deposit_pending_amount > 0 && group.rent_pending_amount === 0 && (
      <span className="text-[8px] text-slate-400 block leading-tight">
        D: ₹{group.deposit_pending_amount.toLocaleString()}
      </span>
    )}
  </div>
</td>

                        {/* Rejected */}
                        <td className="py-2 px-2 text-right border-r border-slate-100">
                          <span className="text-[11px] font-bold text-red-600 whitespace-nowrap">
                            ₹{group.total_rejected_amount?.toLocaleString() || 0}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2 px-2 border-r border-slate-100">
                          <div className="flex flex-wrap items-center gap-0.5">
                            {group.approved_count > 0 && (
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-[9px] px-1 py-0 leading-tight">
                                {group.approved_count}A
                              </Badge>
                            )}
                            {group.pending_count > 0 && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[9px] px-1 py-0 leading-tight">
                                {group.pending_count}P
                              </Badge>
                            )}
                            {group.rejected_count > 0 && (
                              <Badge className="bg-red-100 text-red-700 border-red-200 text-[9px] px-1 py-0 leading-tight">
                                {group.rejected_count}R
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Last Pay */}
                        <td className="py-2 px-0 ">
                          <span className="text-[11px] text-slate-600 whitespace-nowrap">
                            {group.last_payment_date
                              ? format(new Date(group.last_payment_date), "dd/MM/yy")
                              : <span className="text-slate-400">—</span>
                            }
                          </span>
                        </td>

                      </tr>

                      {/* ✅ Expanded Child Row - 100% UNCHANGED */}
                      {/* ✅ Compact Expanded Child Row */}
{isExpanded && (
  <tr className="bg-blue-50/30">
    <td colSpan={12} className="p-0 border-t-0">
      <div className="animate-in slide-in-from-top-1 duration-200">
        <div className="p-2">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-[10px] font-semibold text-slate-700 flex items-center gap-1.5">
              <CreditCard className="h-3 w-3 text-blue-600" />
              Payment History • {group.payments.length} transactions
            </h4>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto overflow-y-auto max-h-[200px]">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="text-left py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider border-r border-slate-200">Date</th>
                    <th className="text-left py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider border-r border-slate-200">Amount</th>
                    <th className="text-left py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider border-r border-slate-200">Txn ID</th>
                    <th className="text-left py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider border-r border-slate-200">Mode</th>
                    <th className="text-left py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider border-r border-slate-200">Mode Type</th>
                    <th className="text-left py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider border-r border-slate-200">Type</th>
                    <th className="text-left py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider border-r border-slate-200">Period</th>
                    <th className="text-left py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider border-r border-slate-200">Remark</th>
                    <th className="text-left py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider border-r border-slate-200">Proof</th>
                    <th className="text-left py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider border-r border-slate-200">Status</th>
                    <th className="text-left py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider border-r border-slate-200">Source</th>
                    <th className="text-center py-2 px-1.5 font-medium text-slate-600 text-[9px] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.payments.map((payment: any, index: number) => {
                    let modeTypeDisplay = "";
                    let modeTypeTooltip = "";
                    if (payment.payment_mode_type) {
                      try {
                        const modeTypeData = typeof payment.payment_mode_type === "string"
                          ? JSON.parse(payment.payment_mode_type)
                          : payment.payment_mode_type;
                        if (payment.payment_mode === "card" && modeTypeData) {
                          modeTypeDisplay = `${modeTypeData.network || "Card"} •••• ${modeTypeData.last4 || "****"}`;
                          modeTypeTooltip = `${modeTypeData.type || "Card"} - ${modeTypeData.bank || "Unknown Bank"}`;
                        } else if (payment.payment_mode === "upi" && modeTypeData?.vpa) {
                          modeTypeDisplay = modeTypeData.vpa;
                          modeTypeTooltip = modeTypeData.vpa;
                        } else if ((payment.payment_mode === "netbanking" || payment.payment_mode === "bank_transfer") && modeTypeData?.bank) {
                          modeTypeDisplay = modeTypeData.bank;
                          modeTypeTooltip = modeTypeData.bank;
                        } else if (payment.payment_mode === "wallet" && modeTypeData?.wallet) {
                          modeTypeDisplay = modeTypeData.wallet;
                          modeTypeTooltip = modeTypeData.wallet;
                        } else { modeTypeDisplay = "-"; }
                      } catch (e) { modeTypeDisplay = "-"; }
                    } else { modeTypeDisplay = "-"; }
                    
                    const isEven = index % 2 === 0;
                    return (
                      <tr key={payment.id} className={`${isEven ? "bg-white" : "bg-slate-50/30"} border-b border-slate-100 hover:bg-blue-50/30 transition-colors duration-150 group`}>
                        {/* Transaction Date */}
                        <td className="py-0.5 px-1.5 border-r border-slate-100">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-blue-500" />
                            <span className="text-[10px] font-medium text-slate-700 whitespace-nowrap">
                              {format(new Date(payment.payment_date), "dd MMM yy")}
                            </span>
                          </div>
                        </td>
                        
                        {/* Amount */}
                        <td className="py-0.5 px-1.5 border-r border-slate-100">
                          <span className="text-[11px] font-bold text-slate-800">₹{Number(payment.amount).toLocaleString()}</span>
                        </td>
                        
                        {/* Transaction ID */}
                        <td className="py-0.5 px-1.5 border-r border-slate-100">
                          {payment.transaction_id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                                {payment.transaction_id.substring(0, 8)}...
                              </span>
                              <button onClick={() => { navigator.clipboard.writeText(payment.transaction_id); toast.success("Copied"); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Copy className="w-2.5 h-2.5 text-slate-400" />
                              </button>
                            </div>
                          ) : <span className="text-[10px] text-slate-400">—</span>}
                        </td>
                        
                        {/* Mode */}
                        <td className="py-0.5 px-1.5 border-r border-slate-100">
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            {payment.payment_mode === "card" && <CreditCard className="w-2.5 h-2.5 text-blue-500" />}
                            {payment.payment_mode === "upi" && <Smartphone className="w-2.5 h-2.5 text-green-500" />}
                            {payment.payment_mode === "cash" && <IndianRupee className="w-2.5 h-2.5 text-emerald-500" />}
                            <span className="text-[10px] font-medium text-slate-700 capitalize">
                              {payment.payment_mode === "bank_transfer" ? "Bank Trf" : payment.payment_mode}
                            </span>
                          </div>
                        </td>
                        
                        {/* Mode Type */}
                        <td className="py-0.5 px-1.5 border-r border-slate-100">
                          {modeTypeDisplay !== "-" || payment.bank_name ? (
                            <div className="flex flex-col gap-0.5">
                              {modeTypeDisplay !== "-" && (
                                <span className="text-[8px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded whitespace-nowrap" title={modeTypeTooltip || modeTypeDisplay}>
                                  {modeTypeDisplay.length > 15 ? modeTypeDisplay.substring(0, 12) + "..." : modeTypeDisplay}
                                </span>
                              )}
                            </div>
                          ) : <span className="text-[10px] text-slate-400">—</span>}
                        </td>
                        
                        {/* Payment Type */}
                        <td className="py-0.5 px-1.5 border-r border-slate-100">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                            payment.payment_type === "rent" ? "bg-blue-100 text-blue-700"
                            : payment.payment_type === "security_deposit" ? "bg-purple-100 text-purple-700"
                            : payment.payment_type === "deposit_refund" ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                          }`}>
                            {payment.payment_type === "rent" ? "Rent"
                              : payment.payment_type === "security_deposit" ? "Security Deposit"
                              : payment.payment_type === "deposit_refund" ? "Refund"
                              : payment.payment_type || "Other"}
                          </span>
                        </td>
                        
                        {/* Period */}
                       {/* Period */}
<td className="py-0.5 px-1.5 border-r border-slate-100">
  <span className="text-[10px] text-slate-600 whitespace-nowrap">
    {payment.month} {payment.year ? String(payment.year).slice(-2) : ''}
  </span>
</td>
                        
                        {/* Remark */}
                        <td className="py-0.5 px-1.5 border-r border-slate-100 max-w-[120px]">
                          {payment.remark
                            ? <p className="text-[10px] text-slate-500 truncate cursor-help" title={payment.remark}>{payment.remark}</p>
                            : <span className="text-[9px] text-slate-400">—</span>}
                        </td>
                        
                        {/* Proof */}
                        <td className="py-0.5 px-1.5 border-r border-slate-100">
                          {payment.payment_proof ? (
                            <button onClick={() => window.open(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${payment.payment_proof}`, "_blank")}>
                              {payment.payment_proof.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img src={`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${payment.payment_proof}`} alt="Proof" className="h-6 w-6 rounded object-cover border border-slate-200" />
                              ) : (
                                <div className="h-6 w-6 rounded bg-blue-50 flex items-center justify-center border border-blue-200">
                                  <FileText className="h-3 w-3 text-blue-600" />
                                </div>
                              )}
                            </button>
                          ) : (
                            <div className="h-6 w-6 rounded bg-slate-50 flex items-center justify-center border border-slate-200">
                              <span className="text-[8px] text-slate-400">—</span>
                            </div>
                          )}
                        </td>
                        
                        {/* Status */}
                        <td className="py-0.5 px-1.5 border-r border-slate-100">
                          <PaymentStatusBadge status={payment.status || "pending"} />
                        </td>
                        
                        {/* Source */}
                        <td className="py-0.5 px-1.5 border-r border-slate-100">
                          {payment.payment_type === "deposit_refund" ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-medium"><ReceiptIndianRupee className="h-2 w-2" />Refund</span>
                          ) : payment.booking_id ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-medium"><Globe className="h-2 w-2" />Online</span>
                          ) : payment.source === "tenant" ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium"><Globe className="h-2 w-2" />Online</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-medium"><User className="h-2 w-2" />Manual</span>
                          )}
                        </td>
                        
                        {/* Actions */}
                        <td className="py-0.5 px-1.5">
                          <div className="flex items-center gap-0.5 justify-end">
                            {(payment.status === "pending" || payment.status === "paid" || payment.status === "partial" || payment.status === "refund") && canApprove && (
                              <button className="h-5 w-5 rounded text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center" onClick={() => onApprove(payment)} title="Approve">
                                <CheckCircle2 className="h-3 w-3" />
                              </button>
                            )}
                            {(payment.status === "pending" || payment.status === "paid" || payment.status === "partial" || payment.status === "refund") && canReject && (
                              <button className="h-5 w-5 rounded text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center" onClick={() => onReject(payment)} title="Reject">
                                <XCircle className="h-3 w-3" />
                              </button>
                            )}
                            {payment.source !== "tenant" && (payment.status === "pending" || payment.status === "paid" || payment.status === "refund") && canEdit && (
                              <button className="h-5 w-5 rounded text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center" onClick={() => onEdit(payment)} title="Edit">
                                <Pencil className="h-3 w-3" />
                              </button>
                            )}
                            {canDelete && (
                              <button className="h-5 w-5 rounded text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center" onClick={() => onDelete(payment)} title="Delete">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </td>
  </tr>
)}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  {/* Filter Sidebar + Pagination — UNCHANGED */}
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
            <Label className="text-xs font-semibold text-blue-700">Property</Label>
            <Select value={filterPropertyId} onValueChange={setFilterPropertyId}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Properties" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((prop: any) => (
                  <SelectItem key={prop.id} value={prop.id.toString()}>{prop.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-blue-700">Room Number</Label>
            <Input placeholder="Search room or bed..." value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-blue-700">Payment Type</Label>
            <select value={paymentTypeFilter} onChange={(e) => setPaymentTypeFilter(e.target.value)} className="w-full h-8 text-xs rounded-lg border border-gray-200 px-2 bg-white text-gray-700">
              <option value="all">All Types</option>
              <option value="rent">Rent</option>
              <option value="security_deposit">Security Deposit</option>
              <option value="deposit_refund">Deposit Refund</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showPendingRentOnly} onChange={(e) => setShowPendingRentOnly(e.target.checked)} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Show Tenants with Pending Rent Only</span>
            </label>
            <p className="text-[10px] text-gray-500 ml-5">Filter tenants who have any pending rent amount</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-blue-700">Pending Amount (₹)</Label>
            <Input type="number" placeholder="Enter exact amount e.g. 5000" value={exactPendingFilter} onChange={(e) => setExactPendingFilter(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-blue-700">Status</Label>
            <select value={columnFilters?.status || "all"} onChange={(e) => setColumnFilters?.({ ...columnFilters, status: e.target.value })} className="w-full h-8 text-xs rounded-lg border border-gray-200 px-2 bg-white text-gray-700">
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-blue-700">Start Date</Label>
            <Input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-blue-700">End Date</Label>
            <Input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-blue-700">Payment Count</Label>
            <Input type="number" placeholder="Exact count..." value={columnFilters?.payment_count || ""} onChange={(e) => setColumnFilters?.({ ...columnFilters, payment_count: e.target.value })} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={ignoreDateFilters} onChange={(e) => setIgnoreDateFilters(e.target.checked)} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Ignore Date Filters</span>
            </label>
            <p className="text-[10px] text-gray-500 ml-5">Show all data regardless of payment date</p>
          </div>
        </div>
        <div className="border-t p-3 flex gap-2 bg-gray-50 flex-shrink-0">
          <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => {
            setColumnFilters?.({ payment_date: "", tenant_name: "", property_name: "", room_bed: "", contact: "", amount: "", min_amount: "", max_amount: "", payment_mode: "all", transaction_id: "", month: "", status: "all", remark: "", payment_count: "", total_paid_amount: "", total_rejected_amount: "" });            setFilterPropertyId("all"); setFilterStartDate(""); setFilterEndDate("");
            setRoomFilter(""); setIgnoreDateFilters(false); setPaymentTypeFilter("all");
            setExactPendingFilter(""); setShowPendingRentOnly(false); onPageChange?.(1);
          }}>
            <RefreshCw className="w-3 h-3 mr-1" /> Reset
          </Button>
          <Button size="sm" className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700" onClick={() => setShowFilterSidebar?.(false)}>Apply</Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>

  <PaginationControls
    currentPage={pagination.currentPage}
    totalPages={pagination.totalPages}
    onPageChange={onPageChange}
    itemsPerPage={pagination.itemsPerPage}
    onItemsPerPageChange={onItemsPerPageChange}
    totalItems={pagination.totalItems}
    currentItemsCount={pagination.items.length}
  />
</Card>
  );
};

// Receipts Table Component
const ReceiptsTable = ({
  receipts,
  loading,
  getTenantSalutation,
  getTenantCountryCode,
  getTenantPhone,
  tenants,
  highlightedReceipt,
  onPreviewReceipt,
  onDownloadReceipt,
  showFilterSidebar,
  setShowFilterSidebar,
  pagination,
  onPageChange,
  onItemsPerPageChange,
   selectedReceiptIds,  // ✅ ADD THIS
  setSelectedReceiptIds,  
}: any) => {
  // Add state for receipts column filters
  const [receiptFilters, setReceiptFilters] = useState({
    date: "",
    tenant: "",
    amount: "",
    method: "",
    room: "",
     receipt_number: "",  
  payment_type: "all", 
  contact: "", 
  });

  // Enhance receipts with salutation and country code
  const enhancedReceipts = receipts.map((receipt: any) => {
    let tenant = null;

    if (receipt.tenant_id) {
      tenant = tenants.find((t: any) => t.id === receipt.tenant_id);
    }

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
  const [ignoreReceiptDateFilter, setIgnoreReceiptDateFilter] = useState(false);
  // Filter receipts based on column filters
  const filteredReceipts = enhancedReceipts.filter((receipt: any) => {
    const matchesDate =
      ignoreReceiptDateFilter ||
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

         const matchesReceiptNumber =
    !receiptFilters.receipt_number ||
    String(receipt.id).padStart(6, '0').includes(receiptFilters.receipt_number) ||
    `RCP-${String(receipt.id).padStart(6, '0')}`.toLowerCase().includes(receiptFilters.receipt_number.toLowerCase());

  const matchesPaymentType =
    !receiptFilters.payment_type ||
    receiptFilters.payment_type === "all" ||
    receipt.payment_type === receiptFilters.payment_type;

  const matchesContact =
    !receiptFilters.contact ||
    (receipt.phone || "").includes(receiptFilters.contact);

    return (
      matchesDate &&
      matchesTenant &&
      matchesAmount &&
      matchesMethod &&
     matchesRoom &&
    matchesReceiptNumber &&  
    matchesPaymentType &&    
    matchesContact       
    );
  });

  // Calculate paginated receipts
const itemsPerPage = pagination.itemsPerPage;
const isAll = itemsPerPage === "All";
const startIndex = isAll ? 0 : (pagination.currentPage - 1) * (itemsPerPage as number);
const endIndex = isAll ? filteredReceipts.length : startIndex + (itemsPerPage as number);
const paginatedReceiptsList = filteredReceipts.slice(startIndex, endIndex);
const totalPages = isAll ? 1 : Math.ceil(filteredReceipts.length / (itemsPerPage as number));

return (
  <Card className="border-0 overflow-hidden flex flex-col h-[320px] sm:h-[490px]">
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="overflow-auto flex-1 min-h-0 flex flex-col">
        <div className="min-w-[900px] flex flex-col flex-1 min-h-0">

          {/* Sticky Header */}
          <table className="table-fixed w-full border-collapse sticky top-0 z-10 bg-gray-200">
            <colgroup>
              <col style={{ width: "36px" }} />   {/* Checkbox */}
              <col style={{ width: "90px" }} />   {/* Receipt # */}
              <col style={{ width: "80px" }} />   {/* Date */}
              <col style={{ width: "160px" }} />  {/* Tenant */}
              <col style={{ width: "110px" }} />  {/* Contact */}
              <col style={{ width: "90px" }} />   {/* Type */}
              <col style={{ width: "90px" }} />   {/* Amount */}
              <col style={{ width: "100px" }} />  {/* Method/Bank */}
              <col style={{ width: "80px" }} />   {/* Room/Bed */}
              <col style={{ width: "64px" }} />   {/* Actions */}
            </colgroup>
            <thead>
  {/* ── Row 1: Column Titles ── */}
  <tr>
    <th className="py-1.5 px-1 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-center">
      <span className="font-semibold text-gray-700 text-[10px]">✓</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Receipt #</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Date</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Tenant</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Contact</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Type</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Amount</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Method</span>
    </th>
    <th className="py-1.5 px-2 bg-gray-200 border-r border-gray-300 border-b border-gray-300 text-left">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Room</span>
    </th>
    <th className="py-1.5 px-1 bg-gray-200 border-b border-gray-300 text-center">
      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Action</span>
    </th>
  </tr>

  {/* ── Row 2: Search Inputs ── */}
  <tr className="bg-white border-t border-gray-300">
    {/* Checkbox column – no input */}
    <td className="p-1 border-r border-gray-200 text-center">
      <input
        type="checkbox"
        checked={selectedReceiptIds.length === paginatedReceiptsList.length && paginatedReceiptsList.length > 0}
        onChange={(e) => {
          if (e.target.checked) setSelectedReceiptIds(paginatedReceiptsList.map((r: any) => r.id));
          else setSelectedReceiptIds([]);
        }}
        className="w-3 h-3 accent-blue-500"
      />
    </td>

    {/* Receipt # */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="Search..."
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={receiptFilters.receipt_number || ""}
        onChange={(e) => setReceiptFilters({ ...receiptFilters, receipt_number: e.target.value })}
      />
    </td>

    {/* Date */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="dd/mm/yy"
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={receiptFilters.date}
        onChange={(e) => setReceiptFilters({ ...receiptFilters, date: e.target.value })}
      />
    </td>

    {/* Tenant */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="Search..."
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={receiptFilters.tenant}
        onChange={(e) => setReceiptFilters({ ...receiptFilters, tenant: e.target.value })}
      />
    </td>

    {/* Contact */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="Search..."
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={receiptFilters.contact || ""}
        onChange={(e) => setReceiptFilters({ ...receiptFilters, contact: e.target.value })}
      />
    </td>

    {/* Type */}
    <td className="p-1 border-r border-gray-200">
      <select
        value={receiptFilters.payment_type || "all"}
        onChange={(e) => setReceiptFilters({ ...receiptFilters, payment_type: e.target.value })}
        className="h-5 text-[10px] bg-white border border-gray-300 px-1 rounded w-full"
      >
        <option value="all">All</option>
        <option value="rent">Rent</option>
        <option value="security_deposit">Security Deposit</option>
      </select>
    </td>

    {/* Amount */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="₹"
        type="number"
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={receiptFilters.amount}
        onChange={(e) => setReceiptFilters({ ...receiptFilters, amount: e.target.value })}
      />
    </td>

    {/* Method */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="Search..."
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={receiptFilters.method}
        onChange={(e) => setReceiptFilters({ ...receiptFilters, method: e.target.value })}
      />
    </td>

    {/* Room */}
    <td className="p-1 border-r border-gray-200">
      <Input
        placeholder="Search..."
        className="h-5 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-1.5 font-normal w-full"
        value={receiptFilters.room}
        onChange={(e) => setReceiptFilters({ ...receiptFilters, room: e.target.value })}
      />
    </td>

    {/* Actions – no input */}
    <td className="p-1" />
  </tr>
</thead>
          </table>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 min-h-0">
            <table className="table-fixed w-full border-collapse">
              <colgroup>
                <col style={{ width: "36px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "80px" }} />
                <col style={{ width: "160px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "80px" }} />
                <col style={{ width: "64px" }} />
              </colgroup>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-xs text-slate-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
                        Loading receipts...
                      </div>
                    </td>
                  </tr>
                ) : filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-xs text-slate-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      No receipts found
                    </td>
                  </tr>
                ) : (
                  paginatedReceiptsList.map((receipt: any, index: number) => (
                    <tr
                      key={receipt.id}
                      className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
                        receipt.id === highlightedReceipt ? "bg-green-50 animate-pulse" : index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-1.5 px-1 text-center border-r border-slate-100">
                        <input
                          type="checkbox"
                          checked={selectedReceiptIds.includes(receipt.id)}
                          onChange={() => setSelectedReceiptIds((prev: number[]) =>
                            prev.includes(receipt.id) ? prev.filter((id: number) => id !== receipt.id) : [...prev, receipt.id]
                          )}
                          className="w-3 h-3 accent-blue-500"
                        />
                      </td>

                      {/* Receipt # */}
                    <td className="py-1.5 px-2 border-r border-slate-100">
  <span className="text-[10px] font-mono text-slate-600 whitespace-nowrap">
    RCP-{String(receipt.id).padStart(5, '0')}
  </span>
</td>

                      {/* Date */}
                      <td className="py-1.5 px-2 border-r border-slate-100">
                        <span className="text-[11px] text-slate-700 whitespace-nowrap">
                          {format(new Date(receipt.payment_date), "dd/MM/yy")}
                        </span>
                      </td>

                      {/* Tenant — name + period on one line */}
                     <td className="py-1.5 px-2 border-r border-slate-100">
  <div className="flex items-center gap-1">
  {(() => {
  const t = tenants.find((x: any) => 
    x.id === receipt.tenant_id || x.full_name === receipt.tenant_name
  );
  return t?.photo_url ? (
    <img src={t.photo_url} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200" />
  ) : (
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white font-bold text-[8px] flex-shrink-0">
      {(receipt.salutation ? `${receipt.salutation} ${receipt.tenant_name}` : receipt.tenant_name)?.split(" ").filter(Boolean).slice(0, 2).map((n: string) => n[0].toUpperCase()).join("")}
    </div>
  );
})()}

    <div className="min-w-0 flex items-center gap-1 whitespace-nowrap overflow-hidden">
      <p className="text-[11px] font-medium text-slate-800 truncate">
        {receipt.salutation ? `${receipt.salutation} ` : ""}
        {receipt.tenant_name}
      </p>

      {(receipt.month || receipt.year) && (
        <p className="text-[9px] text-slate-400 flex-shrink-0">
          ({receipt.month} {receipt.year})
        </p>
      )}
    </div>
  </div>
</td>

                      {/* Contact */}
                      <td className="py-1.5 px-2 border-r border-slate-100">
                        <span className="text-[11px] text-slate-500 whitespace-nowrap truncate block">
                          {receipt.country_code || "+91"} {receipt.phone || "—"}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-1.5 px-2 border-r border-slate-100">
                        <Badge className={`text-[9px] px-1.5 py-0 leading-tight ${
                          receipt.payment_type === "security_deposit"
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}>
                          {receipt.payment_type === "security_deposit" ? "Security Deposit" : "Rent"}
                        </Badge>
                      </td>

                      {/* Amount */}
                      <td className="py-1.5 px-2 border-r border-slate-100">
                        <span className="text-[11px] font-bold text-slate-800 whitespace-nowrap">
                          ₹{receipt.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Method / Bank */}
                     <td className="py-1.5 px-2 border-r border-slate-100">
  <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden">
    <span className="text-[11px] text-slate-600 capitalize truncate">
      {receipt.payment_mode}
    </span>

    {receipt.bank_name && (
      <span className="text-[9px] text-slate-400 flex-shrink-0">
        ({receipt.bank_name})
      </span>
    )}
  </div>
</td>

                      {/* Room / Bed */}
                      <td className="py-1.5 px-2 border-r border-slate-100">
                        <div className="flex items-center gap-0.5 flex-wrap">
                          {receipt.room_number && (
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded-full whitespace-nowrap">
                              R{receipt.room_number}
                            </span>
                          )}
                          {receipt.bed_number && (
                            <span className="text-[10px] text-green-600 bg-green-50 px-1 py-0.5 rounded-full whitespace-nowrap">
                              B{receipt.bed_number}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-1.5 px-1 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            className="h-6 w-6 rounded hover:bg-blue-50 flex items-center justify-center"
                            onClick={() => onPreviewReceipt(receipt.id)}
                            title="Preview"
                          >
                            <Eye className="h-3 w-3 text-blue-500" />
                          </button>
                          <button
                            className="h-6 w-6 rounded hover:bg-green-50 flex items-center justify-center"
                            onClick={() => onDownloadReceipt(receipt.id)}
                            title="Download"
                          >
                            <Download className="h-3 w-3 text-green-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    {/* Filter Sidebar — UNCHANGED */}
    <Sheet open={showFilterSidebar} onOpenChange={setShowFilterSidebar}>
  <SheetContent side="right" className="p-0 w-[85vw] min-w-[280px] sm:w-[420px]">
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Advanced Filters</span>
        </div>
        <button onClick={() => setShowFilterSidebar?.(false)} className="text-white/70 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Body – two‑column grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {/* Receipt Number */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-xs font-semibold text-blue-700">Receipt #</Label>
            <Input
              placeholder="Search receipt #..."
              value={receiptFilters.receipt_number || ""}
              onChange={(e) => setReceiptFilters((prev) => ({ ...prev, receipt_number: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>

          {/* Date */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-xs font-semibold text-blue-700">Date</Label>
            <Input
              placeholder="dd/mm/yy"
              value={receiptFilters.date}
              onChange={(e) => setReceiptFilters((prev) => ({ ...prev, date: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>

          {/* Tenant */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-xs font-semibold text-blue-700">Tenant</Label>
            <Input
              placeholder="Search tenant..."
              value={receiptFilters.tenant}
              onChange={(e) => setReceiptFilters((prev) => ({ ...prev, tenant: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>

          {/* Contact */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-xs font-semibold text-blue-700">Contact</Label>
            <Input
              placeholder="Search phone..."
              value={receiptFilters.contact || ""}
              onChange={(e) => setReceiptFilters((prev) => ({ ...prev, contact: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-xs font-semibold text-blue-700">Amount</Label>
            <Input
              placeholder="Search amount..."
              type="number"
              value={receiptFilters.amount}
              onChange={(e) => setReceiptFilters((prev) => ({ ...prev, amount: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>

          {/* Method/Bank */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-xs font-semibold text-blue-700">Method / Bank</Label>
            <Input
              placeholder="Search method..."
              value={receiptFilters.method}
              onChange={(e) => setReceiptFilters((prev) => ({ ...prev, method: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>

          {/* Room/Bed */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-xs font-semibold text-blue-700">Room / Bed</Label>
            <Input
              placeholder="Search room..."
              value={receiptFilters.room}
              onChange={(e) => setReceiptFilters((prev) => ({ ...prev, room: e.target.value }))}
              className="h-8 text-xs"
            />
          </div>

          {/* Payment Type */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label className="text-xs font-semibold text-blue-700">Payment Type</Label>
            <select
              value={receiptFilters.payment_type || "all"}
              onChange={(e) => setReceiptFilters((prev) => ({ ...prev, payment_type: e.target.value }))}
              className="w-full h-8 text-xs rounded-lg border border-gray-200 px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="rent">Rent</option>
              <option value="security_deposit">Security Deposit</option>
            </select>
          </div>
        </div>

        {/* Ignore Date Filter – full width */}
        <div className="mt-4 space-y-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreReceiptDateFilter}
              onChange={(e) => setIgnoreReceiptDateFilter(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-blue-700">Ignore Date Filter</span>
          </label>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="border-t p-3 flex gap-2 bg-gray-50 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8"
          onClick={() => {
            setReceiptFilters({
              date: "",
              tenant: "",
              amount: "",
              method: "",
              room: "",
              receipt_number: "",
              payment_type: "all",
              contact: "",
            });
            setIgnoreReceiptDateFilter(false);
          }}
        >
          <RefreshCw className="w-3 h-3 mr-1" /> Reset
        </Button>
        <Button
          size="sm"
          className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowFilterSidebar?.(false)}
        >
          Apply
        </Button>
      </div>
    </div>
  </SheetContent>
</Sheet>

    <PaginationControls
      currentPage={pagination.currentPage}
 totalPages={totalPages}       onPageChange={onPageChange}
      itemsPerPage={pagination.itemsPerPage}
      onItemsPerPageChange={onItemsPerPageChange}
      totalItems={filteredReceipts.length}
      currentItemsCount={paginatedReceiptsList.length}
    />
  </Card>
);
};