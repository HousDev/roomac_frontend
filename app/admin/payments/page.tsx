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
  const [bulkMode, setBulkMode] = useState(false);
const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
const [bulkStep, setBulkStep] = useState(1);
const [roomsWithPending, setRoomsWithPending] = useState<any[]>([]);
const [bulkSummary, setBulkSummary] = useState({
  totalTenants: 0,
  totalPending: 0,
});

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
    amount: "",
    min_amount: "",
    max_amount: "",
    payment_mode: "all",
    transaction_id: "",
    month: "",
    status: "all",
    remark: "",
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
    payment_type: "",  // ✅ Add this
  amount: "",        // ✅ Add this for amount search
  room: "",          // ✅ Add this for room search
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

  const [paymentPagination, setPaymentPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  });

  const [receiptPagination, setReceiptPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  });

  const [demandPagination, setDemandPagination] = useState({
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
          payment_type: demandPayment.payment_type
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
  
  if (propertyId) {
    await fetchRoomsByProperty(propertyId);
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
    await fetchTenantsByRoom(roomId);
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
  // Update handleDemandPaymentTypeChange to auto-fill amount when type changes
  const handleDemandPaymentTypeChange = async (value: string) => {
    setDemandPayment((prev) => ({ ...prev, payment_type: value }));

    if (value === "security_deposit" && demandPayment.tenant_id) {
      try {
        const response = await paymentApi.getSecurityDepositInfo(
          parseInt(demandPayment.tenant_id),
        );
        if (response.success) {
          setSecurityDepositInfo(response.data);
          // ✅ Auto-fill amount with pending amount
          setDemandPayment((prev) => ({
            ...prev,
            amount: response.data.pending_amount,
          }));
        }
      } catch (error) {
        console.error("Error fetching security deposit info:", error);
      }
    } else if (value === "rent" && demandPayment.tenant_id) {
      try {
        const formResponse = await paymentApi.getTenantPaymentFormData(
          parseInt(demandPayment.tenant_id),
        );
        if (formResponse.success && formResponse.data?.total_pending) {
          setPaymentFormData(formResponse.data);
          // ✅ Auto-fill amount with total pending amount
          setDemandPayment((prev) => ({
            ...prev,
            amount: formResponse.data.total_pending,
          }));
        }
      } catch (error) {
        console.error("Error fetching rent pending amount:", error);
      }
    }
  };

// Update handleDemandTenantSelect to properly fetch and display security deposit info
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
    }

    // Fetch security deposit info - THIS IS KEY
    const depositResponse = await paymentApi.getSecurityDepositInfo(
      parseInt(tenantId),
    );
    console.log("Security deposit response:", depositResponse);
    
    if (depositResponse.success && depositResponse.data) {
      setSecurityDepositInfo(depositResponse.data);
      
      // Auto-fill amount with pending amount for security deposit
      if (
        demandPayment.payment_type === "security_deposit" &&
        depositResponse.data?.pending_amount > 0
      ) {
        setDemandPayment((prev) => ({
          ...prev,
          amount: depositResponse.data.pending_amount,
        }));
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

  const groupPaymentsByTenant = (
    payments: any[],
    page: number,
    itemsPerPage: number,
  ) => {
    const grouped: { [key: string]: any } = {};

    payments.forEach((payment) => {
      const tenantId = payment.tenant_id;
      const tenantName = getTenantName(tenantId);
      const tenantPhone = getTenantPhone(tenantId);

      // Find the complete tenant object
      const completeTenant = tenants.find((t) => t.id === tenantId);

      if (!grouped[tenantId]) {
        grouped[tenantId] = {
          tenant_id: tenantId,
          tenant_name: tenantName,
          tenant_phone: tenantPhone,
          tenant_email: completeTenant?.email || "",
          tenant_salutation:
            completeTenant?.salutation || getTenantSalutation(tenantId),
          tenant_country_code:
            completeTenant?.country_code || getTenantCountryCode(tenantId),
          total_amount: 0,
          total_paid_amount: 0, // ✅ NEW: Sum of approved payments
          total_rejected_amount: 0, // ✅ NEW: Sum of rejected payments
          payment_count: 0,
          last_payment_date: null,
          payments: [],
          approved_count: 0,
          pending_count: 0,
          rejected_count: 0,
          has_online_booking: false,
          has_manual_payment: false,
          is_vacated: !completeTenant || !completeTenant.current_assignment,
          // ✅ ADD ROOM AND BED INFO
          room_number:
            completeTenant?.room_number ||
            payment.room_number ||
            completeTenant?.current_assignment?.room_number,
          bed_number:
            completeTenant?.bed_number ||
            payment.bed_number ||
            completeTenant?.current_assignment?.bed_number,
          property_name:
            completeTenant?.property_name ||
            payment.property_name ||
            completeTenant?.current_assignment?.property_name,
          monthly_rent: completeTenant?.monthly_rent || payment.monthly_rent,
          check_in_date: completeTenant?.check_in_date,
          security_deposit: completeTenant?.security_deposit || 0,
          room_info: completeTenant?.room_info,
          email: completeTenant?.email,
          property_id:
            completeTenant?.current_assignment?.property_id ||
            completeTenant?.property_id,
          room_id:
            completeTenant?.current_assignment?.room_id ||
            completeTenant?.room_id,
        };
      }

      // Add payment to array
      grouped[tenantId].payments.push(payment);

      // SUM the amount correctly (convert to number)
      const amount = Number(payment.amount) || 0;
      grouped[tenantId].total_amount += amount;

      // ✅ NEW: Separate sums based on payment status
      if (payment.status === "approved") {
        grouped[tenantId].total_paid_amount += amount;
      } else if (payment.status === "rejected") {
        grouped[tenantId].total_rejected_amount += amount;
      }
      // Increment payment count
      grouped[tenantId].payment_count += 1;

      // Count by status
      if (payment.status === "approved") grouped[tenantId].approved_count += 1;
      else if (payment.status === "pending")
        grouped[tenantId].pending_count += 1;
      else if (payment.status === "rejected")
        grouped[tenantId].rejected_count += 1;

      // Check if payment came from online booking
      if (payment.booking_id && payment.payment_mode === "online") {
        grouped[tenantId].has_online_booking = true;
      }

      // Check if payment is manual admin payment
      if (!payment.booking_id || payment.payment_mode !== "online") {
        grouped[tenantId].has_manual_payment = true;
      }

      // Track last payment date
      const paymentDate = new Date(payment.payment_date);
      if (
        !grouped[tenantId].last_payment_date ||
        paymentDate > new Date(grouped[tenantId].last_payment_date)
      ) {
        grouped[tenantId].last_payment_date = payment.payment_date;
      }

      // Track first payment date
      if (
        !grouped[tenantId].first_payment_date ||
        paymentDate < new Date(grouped[tenantId].first_payment_date)
      ) {
        grouped[tenantId].first_payment_date = payment.payment_date;
      }
    });
    // ✅ SORT: Most recent payment first (descending order by last_payment_date)
    const groupedArray = Object.values(grouped);

    groupedArray.sort((a: any, b: any) => {
      // If one has no payment date, put it at the bottom
      if (!a.last_payment_date) return 1;
      if (!b.last_payment_date) return -1;

      // Sort by last_payment_date descending (newest first)
      const dateA = new Date(a.last_payment_date);
      const dateB = new Date(b.last_payment_date);
      return dateB.getTime() - dateA.getTime();
    });

    // ✅ ADD: Apply column filters BEFORE pagination
    const searchTerm = columnFilters?.tenant_name?.toLowerCase() || "";
    const filteredArray = searchTerm
      ? groupedArray.filter((group: any) => {
          const salutation = getTenantSalutation(group.tenant_id) || "";
          const fullName =
            `${salutation} ${group.tenant_name || ""}`.toLowerCase();
          const roomNumber = (group.room_number || "").toString().toLowerCase();
          const propertyName = (group.property_name || "").toLowerCase();
          const bedNumber = (group.bed_number || "").toString().toLowerCase();

          return (
            fullName.includes(searchTerm) ||
            roomNumber.includes(searchTerm) ||
            propertyName.includes(searchTerm) ||
            bedNumber.includes(searchTerm)
          );
        })
      : groupedArray;

    const totalItems = filteredArray.length;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredArray.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage),
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
  );

  // Add this function for demands pagination
  const paginatedDemandsData = () => {
    const startIndex =
      (demandPagination.currentPage - 1) * demandPagination.itemsPerPage;
    const endIndex = startIndex + demandPagination.itemsPerPage;
    const paginated = filteredDemands.slice(startIndex, endIndex);
    return {
      items: paginated,
      totalPages: Math.ceil(
        filteredDemands.length / demandPagination.itemsPerPage,
      ),
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
    const originalMonthlyRent = formData.monthly_rent || 0;
    const firstMonthProrated = formData.first_month_prorated;

    return (
      <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <IndianRupee className="h-3.5 w-3.5" />
              Rent History Since Joining
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
              {months.map((month: any, index: number) => {
                const isCurrentMonth = (() => {
                  const now = new Date();
                  return (
                    month.month_num === now.getMonth() + 1 &&
                    month.year === now.getFullYear()
                  );
                })();

                // For prorated month, show calculation in tooltip
                const proratedTooltip = month.is_prorated
                  ? `Prorated: ${month.prorated_days} days × ₹${month.prorated_daily_rate}/day = ₹${month.rent.toLocaleString()} (was ₹${month.original_rent?.toLocaleString()}/month)`
                  : "";

                return (
                  <tr
                    key={`${month.month_key || index}-${index}`}
                    className={`border-t border-slate-200 ${
                      isCurrentMonth ? "bg-blue-50" : ""
                    } ${month.has_discount ? "bg-green-50" : ""} ${month.is_prorated ? "bg-amber-50/30" : ""}`}
                    title={proratedTooltip}
                  >
                    <td className="p-2 text-sm font-medium">
                      {month.month} {month.year}
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
    /* In the Add Payment Dialog - Security Deposit section */
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
      !demandFilters.date ||
      format(new Date(demand.created_at), "dd/MM/yy").includes(
        demandFilters.date,
      );

    // Due date range filters
    const matchesFromDate = (() => {
      if (!demandFilters.from_date) return true;
      const formatted = format(new Date(demand.due_date), "dd/MM/yy");
      return formatted.includes(demandFilters.from_date.trim());
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

    return (
      matchesStatus &&
      matchesTenant &&
      matchesPaymentType &&
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

const handleResendReminder = async (demand: DemandPayment) => {
  try {
    if (!demand.tenant_id) {
      toast.error("Tenant ID not found for this demand");
      return;
    }

    toast.loading(`Sending reminder to ${demand.tenant_name}...`, { id: "resend-reminder" });
    
    // ✅ Pass the demand type in the request body
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/${demand.tenant_id}/resend-reminder`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demand_type: demand.payment_type  // ✅ Send the payment type
        })
      }
    );
    
    const data = await response.json();
    
    toast.dismiss("resend-reminder");
    
    if (data.success) {
      toast.success(`Reminder sent to ${demand.tenant_name} successfully!`);
    } else {
      toast.error(data.message || "Failed to send reminder");
    }
  } catch (error) {
    toast.dismiss("resend-reminder");
    console.error("Error sending reminder:", error);
    toast.error("Failed to send reminder");
  }
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

            <div className="flex justify-end gap-2">
              {can("create_payments") && (
                <Button
                  size="sm"
                  className="h-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm flex-1 sm:flex-none"
                  onClick={async () => {
                    // ✅ If properties are empty, fetch them first
                    if (properties.length === 0) {
                      await fetchProperties();
                    }
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
                  className="h-8 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white flex-1 sm:flex-none"
                  onClick={() => {
                    resetDemandPaymentForm(); // ✅ Reset before opening
                    setIsDemandPaymentOpen(true);
                  }}
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
              onEdit={handleEditPayment}
              onDelete={(payment) => {
                setSelectedPayment(payment);
                setIsDeleteDialogOpen(true);
              }}
              actionLoading={actionLoading}
              onViewReceipt={handlePreviewReceipt}
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
            />
          </TabsContent>

          {/* Demands Tab Content */}
          <TabsContent value="demands" className="mt-0">
            <Card className="border-0 shadow-sm overflow-y-auto flex flex-col max-h-[400px] sm:max-h-[490px]">
              <CardContent className="p-0 flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="overflow-x-auto flex-1 min-h-0 flex flex-col min-w-0">
                    <div className="min-w-[780px] flex flex-col flex-1 min-h-0">
                      <div className="flex-shrink-0">
                        <Table>
                          {/* COMPACT HEADER WITH SEARCH BARS */}
                         <colgroup>
  <col style={{ width: "110px" }} />  {/* Demand Date */}
  <col style={{ width: "180px" }} />  {/* Tenant */}
  <col style={{ width: "120px" }} />  {/* Type */}
  <col style={{ width: "100px" }} />  {/* Amount */}
  <col style={{ width: "100px" }} />  {/* Due Date */}
  <col style={{ width: "160px" }} />  {/* Room/Bed */}
  <col style={{ width: "180px" }} />  {/* Actions (with Progress Bar) */}
</colgroup>

<TableHeader className="bg-gray-200 border-b border-gray-300">
  <TableRow className="hover:bg-transparent">
    {/* Demand Date Column */}
    <TableHead className="w-[100px] py-2 px-2 bg-gray-200">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
          Demand Date
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

    {/* Tenant Column */}
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

    {/* Payment Type Column */}
    <TableHead className="w-[100px] py-2 px-2 bg-gray-200">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
          Type
        </span>
        <Select
          value={demandFilters.payment_type || "all"}
          onValueChange={(value) =>
            setDemandFilters({
              ...demandFilters,
              payment_type: value,
            })
          }
        >
          <SelectTrigger className="h-6 text-[10px] bg-white border-gray-300 px-2 font-normal w-full">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="security_deposit">Security Deposit</SelectItem>
          </SelectContent>
        </Select>
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
          type="text"
          placeholder="dd/mm/yy"
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

    {/* Actions Column (with Progress Bar inside) */}
    <TableHead className="w-[180px] py-2 px-2 bg-gray-200 text-center">
      <div className="flex flex-col gap-1 items-center">
        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
          Status / Actions
        </span>
        <Button
          variant="ghost"
          size="sm"
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
                          <col style={{ width: "110px" }} />  {/* Demand Date */}
  <col style={{ width: "180px" }} />  {/* Tenant */}
  <col style={{ width: "120px" }} />  {/* Type */}
  <col style={{ width: "100px" }} />  {/* Amount */}
  <col style={{ width: "100px" }} />  {/* Due Date */}
  <col style={{ width: "160px" }} />  {/* Room/Bed */}
  <col style={{ width: "180px" }} />  {/* Actions (with Progress Bar) */}
<TableBody>
  {loading ? (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-2" />
          Loading demands...
        </div>
      </TableCell>
    </TableRow>
  ) : filteredDemands.length === 0 ? (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
        <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
        No demands found
      </TableCell>
    </TableRow>
  ) : (
    paginatedDemandsData().items.map((demand) => {
      const salutation = getTenantSalutation(demand.tenant_id);
      const countryCode = getTenantCountryCode(demand.tenant_id);
      const phone = getTenantPhone(demand.tenant_id);
      const tenantName = getTenantName(demand.tenant_id);

      return (
        <TableRow key={demand.id} className="hover:bg-slate-50">
          {/* Demand Date */}
          <TableCell className="py-2 text-xs whitespace-nowrap">
            {format(new Date(demand.created_at), "dd/MM/yy")}
          </TableCell>

          {/* Tenant Column */}
          <TableCell className="py-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-medium">
                  {salutation ? `${salutation} ` : ''}
                  {tenantName}
                </p>
                {demand.is_vacated === true && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[9px] font-semibold border border-red-200">
                    <DoorOpen className="w-2.5 h-2.5" />
                    Vacated
                  </span>
                )}
              </div>
              {phone && (
                <p className="text-[10px] text-slate-500">
                  {countryCode || '+91'} {phone}
                </p>
              )}
            </div>
          </TableCell>

          {/* Payment Type Cell */}
          <TableCell className="py-2">
            <Badge className={`text-[10px] px-2 py-0.5 ${
              demand.payment_type === 'security_deposit' 
                ? 'bg-purple-100 text-purple-700 border-purple-200' 
                : 'bg-blue-100 text-blue-700 border-blue-200'
            }`}>
              {demand.payment_type === 'security_deposit' ? 'Security Deposit' : 'Rent'}
            </Badge>
          </TableCell>

          {/* Amount */}
          <TableCell className="py-2 text-xs font-medium">
            ₹{Number(demand.amount).toLocaleString("en-IN")}
          </TableCell>

          {/* Due Date */}
          <TableCell className="py-2 text-xs whitespace-nowrap">
            <span className={new Date(demand.due_date) < new Date() && demand.status === "pending" ? "text-red-600 font-medium" : ""}>
              {format(new Date(demand.due_date), "dd/MM/yy")}
            </span>
          </TableCell>

          {/* Room/Bed Column */}
          <TableCell className="py-2 text-xs">
            {demand.is_vacated === true ? (
              <div className="flex flex-col gap-0.5">
                {demand.room_number && demand.room_number !== 'N/A' && demand.room_number !== '—' && (
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      Room {demand.room_number}
                      {demand.bed_number ? ` · Bed #${demand.bed_number}` : ''}
                    </span>
                    {demand.property_name && demand.property_name !== 'N/A' && (
                      <span className="text-[10px] text-gray-400">{demand.property_name}</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {demand.room_number && demand.room_number !== 'N/A' ? (
                  <>
                    <span className="font-medium text-gray-800">
                      Room {demand.room_number}
                      {demand.bed_number ? ` · Bed #${demand.bed_number}` : ''}
                    </span>
                    {demand.property_name && demand.property_name !== 'N/A' && (
                      <span className="text-[10px] text-gray-500">{demand.property_name}</span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400">No assignment</span>
                )}
              </div>
            )}
          </TableCell>

          {/* Actions Column with Status Progress Bar */}
          <TableCell className="py-2">
            {demand.status === 'paid' ? (
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full"
                  onClick={() => handleResendReminder(demand)}
                  title="Resend Payment Reminder"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            ) : demand.status === 'partial' ? (
              <div className="flex flex-col gap-1 min-w-[140px]">
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-100 text-blue-800">Partial</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full"
                    onClick={() => handleResendReminder(demand)}
                    title="Resend Payment Reminder"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 rounded-full h-1.5" 
                    style={{ width: `${((demand.paid_amount || 0) / (demand.amount || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-slate-500 text-center">
                  ₹{(demand.paid_amount || 0).toLocaleString()} / ₹{(demand.amount || 0).toLocaleString()}
                </span>
              </div>
            ) : demand.status === 'overdue' ? (
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full"
                  onClick={() => handleResendReminder(demand)}
                  title="Resend Payment Reminder"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full"
                  onClick={() => handleResendReminder(demand)}
                  title="Resend Payment Reminder"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            )}
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

                  {/* ADD PAGINATION CONTROLS HERE - RIGHT BEFORE CLOSING CardContent */}
                  {!loading && filteredDemands.length > 0 && (
                    <div className="flex-shrink-0 border-t border-gray-200">
                      <PaginationControls
                        currentPage={demandPagination.currentPage}
                        totalPages={Math.ceil(
                          filteredDemands.length /
                            demandPagination.itemsPerPage,
                        )}
                        onPageChange={(page: number) =>
                          setDemandPagination((prev) => ({
                            ...prev,
                            currentPage: page,
                          }))
                        }
                        itemsPerPage={demandPagination.itemsPerPage}
                        onItemsPerPageChange={(size: number) =>
                          setDemandPagination((prev) => ({
                            ...prev,
                            itemsPerPage: size,
                            currentPage: 1,
                          }))
                        }
                        totalItems={filteredDemands.length}
                        currentItemsCount={paginatedDemandsData().items.length}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Demands Filter Sidebar */}
            <Sheet
              open={showDemandFilterSidebar}
              onOpenChange={setShowDemandFilterSidebar}
            >
              <SheetContent
                side="right"
                className="p-0 w-[85vw] min-w-[280px] sm:w-[360px]"
              >
                <div className="h-full flex flex-col">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-white" />
                      <span className="text-sm font-semibold text-white">
                        Filter Demands
                      </span>
                    </div>
                    <button
                      onClick={() => setShowDemandFilterSidebar(false)}
                      className="text-white/70 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-orange-700">
                        Date
                      </Label>
                      <Input
                        placeholder="dd/mm/yy"
                        value={demandFilters.date || ""}
                        onChange={(e) =>
                          setDemandFilters({
                            ...demandFilters,
                            date: e.target.value,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-orange-700">
                        Tenant
                      </Label>
                      <Input
                        placeholder="Search tenant..."
                        value={demandFilters.tenant || ""}
                        onChange={(e) =>
                          setDemandFilters({
                            ...demandFilters,
                            tenant: e.target.value,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-orange-700">
                        Amount
                      </Label>
                      <Input
                        type="number"
                        placeholder="Search amount..."
                        value={demandFilters.amount || ""}
                        onChange={(e) =>
                          setDemandFilters({
                            ...demandFilters,
                            amount: e.target.value,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-orange-700">
                        Due Date From
                      </Label>
                      <Input
                        type="date"
                        value={demandFilters.from_date || ""}
                        onChange={(e) =>
                          setDemandFilters({
                            ...demandFilters,
                            from_date: e.target.value,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-orange-700">
                        Due Date To
                      </Label>
                      <Input
                        type="date"
                        value={demandFilters.to_date || ""}
                        onChange={(e) =>
                          setDemandFilters({
                            ...demandFilters,
                            to_date: e.target.value,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-orange-700">
                        Status
                      </Label>
                      <select
                        value={demandFilters.status || "all"}
                        onChange={(e) =>
                          setDemandFilters({
                            ...demandFilters,
                            status: e.target.value,
                          })
                        }
                        className="w-full h-8 text-xs rounded-lg border border-gray-200 px-2 bg-white text-gray-700"
                      >
                        <option value="all">All Status</option>
                        {[
                          "pending",
                          "paid",
                          "partial",
                          "overdue",
                          "cancelled",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-orange-700">
                        Room/Bed
                      </Label>
                      <Input
                        placeholder="Search room..."
                        value={demandFilters.room || ""}
                        onChange={(e) =>
                          setDemandFilters({
                            ...demandFilters,
                            room: e.target.value,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="border-t p-3 flex gap-2 bg-gray-50 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() =>
                        setDemandFilters({
                          status: "",
                          tenant: "",
                          from_date: "",
                          to_date: "",
                          date: "",
                          amount: "",
                          room: "",
                        })
                      }
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Reset
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs h-8 bg-orange-600 hover:bg-orange-700"
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

{/* Demand Payment Dialog - With Bulk Mode */}
{/* Demand Payment Dialog - With Bulk Mode and Checkboxes */}
<Dialog
  open={isDemandPaymentOpen}
  onOpenChange={(open) => {
    setIsDemandPaymentOpen(open);
    if (!open) {
      resetDemandPaymentForm();
      // Reset bulk selections
      setBulkMode(false);
      setSelectedRooms([]);
      setSelectedTenants([]);
      setBulkStep(1);
      setRoomsWithPending([]);
    }
  }}
>
  <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] sm:max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 rounded-t-lg flex-shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <DialogTitle className="text-white text-sm font-semibold flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-md">
              {bulkMode ? <Users className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
            </div>
            {bulkMode ? "Bulk Demand Payment" : "Demand Payment"}
          </DialogTitle>
          <DialogDescription className="text-orange-100 text-xs mt-0.5">
            {bulkMode 
              ? `Select property, rooms, and tenants to send payment demands in bulk (${demandPayment.payment_type === "security_deposit" ? "Security Deposit" : "Rent"})` 
              : "Create a payment request and notify a single tenant"}
          </DialogDescription>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle between Single and Bulk Mode */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 h-7 px-2 text-xs"
            onClick={() => {
              setBulkMode(!bulkMode);
              // Reset selections when toggling
              if (!bulkMode) {
                setSelectedRooms([]);
                setSelectedTenants([]);
                setBulkStep(1);
                setSelectedPropertyId("");
                setSelectedRoomId("");
                setRoomsWithPending([]);
              } else {
                setDemandPayment({
                  tenant_id: "",
                  payment_type: "rent",
                  amount: 0,
                  due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                  description: "",
                  send_email: true,
                  send_sms: false,
                });
              }
            }}
          >
            {bulkMode ? "Single Tenant" : "Bulk Mode"}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-7 w-7">
              <X className="h-3.5 w-3.5" />
            </Button>
          </DialogClose>
        </div>
      </div>
    </div>

    {/* Scrollable Body */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {!bulkMode ? (
        /* ===== SINGLE TENANT MODE ===== */
        <>
          {/* Property + Room Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">
                Property <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedPropertyId} onValueChange={handleDemandPropertyChange}>
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                  <SelectValue placeholder="Select property..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="sticky top-0 bg-white p-2 border-b z-10">
                    <Input
                      placeholder="Search property..."
                      value={propertySearch}
                      onChange={(e) => handlePropertySearch(e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {filteredProperties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          <span className="text-xs">{property.name}</span>
                        </div>
                      </SelectItem>
                    ))}
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
                disabled={!selectedPropertyId || loadingRooms}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                  <SelectValue placeholder={!selectedPropertyId ? "Select property first" : "Select room..."} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="max-h-[250px] overflow-y-auto">
                    {filteredRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Home className="h-3 w-3" />
                          <span className="text-xs">Room {room.room_number}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tenant Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">
                Tenant <span className="text-red-500">*</span>
              </Label>
              <Select
                value={demandPayment.tenant_id}
                onValueChange={handleDemandTenantSelect}
                disabled={!selectedRoomId}
              >
                <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                  <SelectValue placeholder={!selectedRoomId ? "Select room first" : "Choose a tenant..."} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredTenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id.toString()}>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{tenant.full_name}</span>
                          <span className="text-[10px] text-slate-500">{tenant.phone}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">Payment Type</Label>
              <Select value={demandPayment.payment_type} onValueChange={handleDemandPaymentTypeChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="security_deposit">Security Deposit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount, Due Date, Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">Amount (₹) *</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={demandPayment.amount || ""}
                onChange={(e) => setDemandPayment({ ...demandPayment, amount: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">Due Date *</Label>
              <Input
                type="date"
                value={demandPayment.due_date}
                onChange={(e) => setDemandPayment({ ...demandPayment, due_date: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">Message</Label>
              <Input
                placeholder="Payment description"
                value={demandPayment.description}
                onChange={(e) => setDemandPayment({ ...demandPayment, description: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Bed Assignment Table */}
          {paymentFormData && <BedAssignmentTable formData={paymentFormData} />}

          {/* Rent Summary Table - Only for rent payment type */}
          {demandPayment.payment_type === "rent" && paymentFormData && (
            <RentSummaryTable formData={paymentFormData} />
          )}

          {/* Security Deposit Info - Only for security deposit payment type */}
          {demandPayment.payment_type === "security_deposit" && securityDepositInfo && (
            <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <IndianRupee className="h-3.5 w-3.5" />
                  Security Deposit Information
                </h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Property</p>
                    <p className="text-sm font-medium">
                      {securityDepositInfo.property_name || paymentFormData?.room_info?.property_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Room/Bed</p>
                    <p className="text-sm font-medium">
                      Room {securityDepositInfo.room_number || paymentFormData?.room_info?.room_number || 'N/A'}
                      {securityDepositInfo.bed_number && ` • Bed #${securityDepositInfo.bed_number}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-sm font-bold text-blue-600">
                      ₹{(securityDepositInfo.security_deposit || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pending</p>
                    <p className="text-sm font-bold text-amber-600">
                      ₹{(securityDepositInfo.pending_amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                {(securityDepositInfo.security_deposit || 0) > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Payment Progress</span>
                      <span>
                        {Math.round(
                          ((securityDepositInfo.paid_amount || 0) /
                            (securityDepositInfo.security_deposit || 1)) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                        style={{
                          width: `${((securityDepositInfo.paid_amount || 0) /
                            (securityDepositInfo.security_deposit || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200">
            <Label className="text-[11px] font-medium text-slate-600 block mb-2">Send Notifications</Label>
            <div className="flex gap-5">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={demandPayment.send_email}
                  onChange={(e) => setDemandPayment({ ...demandPayment, send_email: e.target.checked })}
                  className="w-3.5 h-3.5 accent-orange-500"
                />
                <span className="text-xs text-slate-600">Email</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={demandPayment.send_sms}
                  onChange={(e) => setDemandPayment({ ...demandPayment, send_sms: e.target.checked })}
                  className="w-3.5 h-3.5 accent-orange-500"
                />
                <span className="text-xs text-slate-600">SMS</span>
              </label>
            </div>
          </div>
        </>
      ) : (
        /* ===== BULK MODE with Checkboxes ===== */
        <>
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${bulkStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-16 h-0.5 ${bulkStep >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${bulkStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`w-16 h-0.5 ${bulkStep >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${bulkStep >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {selectedTenants.length} tenant(s) selected
            </Badge>
          </div>

          {/* Step 1: Select Property + Payment Type */}
          {bulkStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select Property *</Label>
                <Select 
                  value={selectedPropertyId} 
                  onValueChange={async (value) => {
                    setSelectedPropertyId(value);
                    setBookingLoading(true);
                    try {
                      const response = await fetch(
  `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/payments/bulk-reminders/rooms?property_id=${value}&payment_type=${demandPayment.payment_type || 'rent'}`
);
                      const data = await response.json();
                      if (data.success) {
                        setRoomsWithPending(data.data);
                      }
                    } catch (error) {
                      console.error("Error fetching rooms:", error);
                      toast.error("Failed to fetch rooms");
                    } finally {
                      setBookingLoading(false);
                    }
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Choose a property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((prop) => (
                      <SelectItem key={prop.id} value={prop.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {prop.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Payment Type *</Label>
                <Select 
                  value={demandPayment.payment_type} 
                  onValueChange={(value) => {
                    setDemandPayment(prev => ({ ...prev, payment_type: value }));
                    // Refresh rooms with pending payments for the new payment type
                    if (selectedPropertyId) {
                      fetchRoomsWithPendingPayments(parseInt(selectedPropertyId), value);
                    }
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select payment type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="security_deposit">Security Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setBulkStep(2)}
                  disabled={!selectedPropertyId}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Next: Select Rooms
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Rooms (with Checkboxes) */}
          {bulkStep === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">
                  Select Rooms (with pending {demandPayment.payment_type === "security_deposit" ? "security deposit" : "rent"})
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedRooms.length === roomsWithPending.length) {
                        setSelectedRooms([]);
                      } else {
                        setSelectedRooms(roomsWithPending.map(r => r.id));
                      }
                    }}
                    className="h-7 text-xs"
                  >
                    <Checkbox className="mr-1" checked={selectedRooms.length === roomsWithPending.length} />
                    {selectedRooms.length === roomsWithPending.length ? "Deselect All" : "Select All Rooms"}
                  </Button>
                </div>
              </div>

              {bookingLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : roomsWithPending.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No rooms with pending {demandPayment.payment_type === "security_deposit" ? "security deposit" : "rent"} payments found in this property
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto">
                  {roomsWithPending.map((room) => {
                    const isSelected = selectedRooms.includes(room.id);
                    const totalPending = room.total_pending || room.tenants?.reduce((sum: number, t: any) => sum + (t.total_pending || 0), 0) || 0;
                    
                    return (
                      <Card
                        key={room.id}
                        className={`cursor-pointer transition-all ${isSelected ? "border-orange-500 bg-orange-50" : "hover:border-gray-300"}`}
                        onClick={() => {
                          setSelectedRooms(prev =>
                            prev.includes(room.id) ? prev.filter(id => id !== room.id) : [...prev, room.id]
                          );
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4" />
                              <span className="font-semibold text-sm">Room {room.room_number}</span>
                              <Badge variant="outline" className="text-xs">{room.sharing_type || 'Standard'}</Badge>
                            </div>
                            <Checkbox checked={isSelected} />
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            {room.tenants?.length || 0} tenant(s) with pending {demandPayment.payment_type === "security_deposit" ? "deposit" : "payments"}
                          </div>
                          <div className="text-xs text-amber-600 font-medium mt-1">
                            Total Pending: ₹{totalPending.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setBulkStep(1)}>Back</Button>
                <Button
                  onClick={() => setBulkStep(3)}
                  disabled={selectedRooms.length === 0}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Next: Select Tenants
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Select Tenants (with Checkboxes) + Payment Details */}
          {bulkStep === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">
                  Select Tenants (with pending {demandPayment.payment_type === "security_deposit" ? "security deposit" : "rent"})
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allTenantIds = roomsWithPending
                      .filter(r => selectedRooms.includes(r.id))
                      .flatMap(r => r.tenants?.map((t: any) => t.id) || []);
                    if (selectedTenants.length === allTenantIds.length) {
                      setSelectedTenants([]);
                    } else {
                      setSelectedTenants(allTenantIds);
                    }
                  }}
                  className="h-7 text-xs"
                >
                  <Checkbox className="mr-1" checked={selectedTenants.length > 0} />
                  {selectedTenants.length === roomsWithPending.filter(r => selectedRooms.includes(r.id)).flatMap(r => r.tenants || []).length
                    ? "Deselect All"
                    : "Select All Tenants"}
                </Button>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-3">
                {roomsWithPending
                  .filter(room => selectedRooms.includes(room.id))
                  .map((room) => (
                    <Card key={room.id} className="overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b">
                        <div className="flex items-center gap-2">
                          <Home className="h-3.5 w-3.5" />
                          <span className="font-semibold text-sm">Room {room.room_number}</span>
                          <Badge variant="outline" className="text-xs">
                            Total Pending: ₹{(room.total_pending || 0).toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-0">
                        {room.tenants && room.tenants.length > 0 ? (
                          room.tenants.map((tenant: any) => {
                            const isSelected = selectedTenants.includes(tenant.id);
                            const pendingAmount = demandPayment.payment_type === "security_deposit" 
                              ? (tenant.security_deposit_pending || tenant.total_pending || 0)
                              : (tenant.total_pending || 0);
                            
                            return (
                              <div
                                key={tenant.id}
                                className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                                  isSelected ? "bg-orange-50" : "hover:bg-gray-50"
                                }`}
                                onClick={() => {
                                  setSelectedTenants(prev =>
                                    prev.includes(tenant.id) ? prev.filter(id => id !== tenant.id) : [...prev, tenant.id]
                                  );
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <User className="h-3.5 w-3.5" />
                                      <span className="font-medium text-sm">{tenant.full_name}</span>
                                      {tenant.bed_number && (
                                        <Badge variant="outline" className="text-xs">Bed #{tenant.bed_number}</Badge>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <span className="truncate">{tenant.email || 'No email'}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        <span>{tenant.phone || 'No phone'}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <IndianRupee className="h-3 w-3 text-amber-600" />
                                        <span className="font-medium text-amber-600">
                                          {demandPayment.payment_type === "security_deposit" ? "Deposit Pending" : "Rent Pending"}: ₹{pendingAmount.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="text-gray-500">
                                        {demandPayment.payment_type === "security_deposit" 
                                          ? `Total Deposit: ₹${(tenant.total_security_deposit || 0).toLocaleString()}`
                                          : `Monthly: ₹{(tenant.monthly_rent || 0).toLocaleString()}`}
                                      </div>
                                    </div>
                                  </div>
                                  <Checkbox checked={isSelected} />
                                </div>
                            </div>
                            );
                          })
                        ) : (
                          <div className="p-3 text-center text-gray-500 text-sm">
                            No tenants with pending {demandPayment.payment_type === "security_deposit" ? "security deposit" : "payments"}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Payment Details Form */}
              <div className="border-t pt-4 mt-2">
                <Label className="text-sm font-semibold mb-3 block">Payment Demand Details</Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-600">Payment Type</Label>
                    <Select 
                      value={demandPayment.payment_type} 
                      onValueChange={async (value) => {
                        setDemandPayment(prev => ({ ...prev, payment_type: value }));
                        // Refresh to show correct pending amounts
                        if (selectedPropertyId) {
                          fetchRoomsWithPendingPayments(parseInt(selectedPropertyId) , value);
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="security_deposit">Security Deposit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-600">Due Date *</Label>
                    <Input 
                      type="date" 
                      value={demandPayment.due_date} 
                      onChange={(e) => setDemandPayment({ ...demandPayment, due_date: e.target.value })} 
                      className="h-8 text-xs" 
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <Label className="text-[11px] font-medium text-slate-600">Description (Optional)</Label>
                  <Input 
                    placeholder="Add a note for all selected tenants" 
                    value={demandPayment.description} 
                    onChange={(e) => setDemandPayment({ ...demandPayment, description: e.target.value })} 
                    className="h-8 text-xs mt-1" 
                  />
                </div>
                
                <div className="bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 mt-3">
                  <Label className="text-[11px] font-medium text-slate-600 block mb-2">Send Notifications</Label>
                  <div className="flex gap-5">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={demandPayment.send_email} onChange={(e) => setDemandPayment({ ...demandPayment, send_email: e.target.checked })} className="w-3.5 h-3.5 accent-orange-500" />
                      <span className="text-xs text-slate-600">Email</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={demandPayment.send_sms} onChange={(e) => setDemandPayment({ ...demandPayment, send_sms: e.target.checked })} className="w-3.5 h-3.5 accent-orange-500" />
                      <span className="text-xs text-slate-600">SMS</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {selectedTenants.length > 0 && (
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">Summary:</span>
                    <span>{selectedTenants.length} tenant(s) selected</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span>Total {demandPayment.payment_type === "security_deposit" ? "Security Deposit" : "Rent"} Pending:</span>
                    <span className="font-bold text-amber-600">
                      ₹{selectedTenants.reduce((total, tenantId) => {
                        const tenant = roomsWithPending
                          .flatMap(r => r.tenants || [])
                          .find((t: any) => t.id === tenantId);
                        const pendingAmount = demandPayment.payment_type === "security_deposit"
                          ? (tenant?.security_deposit_pending || tenant?.total_pending || 0)
                          : (tenant?.total_pending || 0);
                        return total + pendingAmount;
                      }, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setBulkStep(2)}>Back</Button>
                <Button 
                  onClick={handleBulkSend} 
                  disabled={bookingLoading || selectedTenants.length === 0} 
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {bookingLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending to {selectedTenants.length} tenants...</>
                  ) : (
                    `Send ${demandPayment.payment_type === "security_deposit" ? "Security Deposit" : "Rent"} Demand to ${selectedTenants.length} Tenants`
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>

    {/* Footer - Only show for single tenant mode */}
    {!bulkMode && (
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 rounded-b-lg flex-shrink-0">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => { setIsDemandPaymentOpen(false); resetDemandPaymentForm(); }} className="text-xs h-8 px-4">Cancel</Button>
          <Button size="sm" onClick={handleDemandPayment} disabled={bookingLoading || !demandPayment.tenant_id || !demandPayment.amount || !demandPayment.due_date} className="text-xs h-8 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
            {bookingLoading ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Sending...</> : <><Send className="h-3 w-3 mr-1.5" /> Send Demand</>}
          </Button>
        </div>
      </div>
    )}
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-lg flex-shrink-0">
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
                className="text-xs h-8 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
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
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => onItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="h-7 w-[70px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((size) => (
              <SelectItem
                key={size}
                value={size.toString()}
                className="text-xs"
              >
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

  // Normalize status to lowercase for matching
  const normalizedStatus = status?.toLowerCase() || "pending";
  const config = variants[normalizedStatus] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} flex items-center gap-1 text-xs px-2 py-1`}
    >
      <Icon className="h-3 w-3" />
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
}: any) => {
  const [ignoreDateFilters, setIgnoreDateFilters] = useState(false);
  const [roomFilter, setRoomFilter] = useState("");
  // Group payments by tenant using the passed function
  const { items: paginatedGroups, totalItems, totalPages } = pagination;
  const tenantGroups = paginatedGroups.map((group: any) => ({
    ...group,
    salutation: getTenantSalutation(group.tenant_id),
    country_code: getTenantCountryCode(group.tenant_id),
  }));

  // Filter groups based on column filters
  const filteredGroups = tenantGroups.filter((group: any) => {
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

    if (columnFilters?.total_paid_amount) {
      const searchAmount = columnFilters.total_paid_amount.trim();
      if (searchAmount) {
        const amountString = group.total_paid_amount.toString();
        if (!amountString.includes(searchAmount)) {
          return false;
        }
      }
    }

    if (columnFilters?.total_rejected_amount) {
      const searchAmount = columnFilters.total_rejected_amount.trim();
      if (searchAmount) {
        const amountString = group.total_rejected_amount.toString();
        if (!amountString.includes(searchAmount)) {
          return false;
        }
      }
    }

    // Filter by status
    if (columnFilters?.status && columnFilters.status !== "all") {
      if (columnFilters.status === "approved" && group.approved_count === 0)
        return false;
      if (columnFilters.status === "paid" && group.payment_count === 0)
        return false;
      if (columnFilters.status === "partially" && group.approved_count === 0)
        return false;
      if (columnFilters.status === "pending" && group.pending_count === 0)
        return false;
      if (columnFilters.status === "rejected" && group.rejected_count === 0)
        return false;
    }

    // Filter by last payment date – timezone-safe, works on raw date string
    if (columnFilters?.payment_date && group.last_payment_date) {
      const searchTerm = columnFilters.payment_date.toLowerCase().trim();
      if (searchTerm === "") return true;

      // Convert last_payment_date to a Date object
      const lastPayDate = new Date(group.last_payment_date);
      if (isNaN(lastPayDate.getTime())) return false;

      const day = lastPayDate.getDate();
      const month = lastPayDate.getMonth() + 1;
      const year = lastPayDate.getFullYear();

      // Format variations for matching
      const formats = [
        `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`, // dd/mm/yyyy
        `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`, // dd/mm/yy
        `${day}/${month}/${year}`,
        `${day}/${month}/${year.toString().slice(-2)}`,
        month.toString().padStart(2, "0"), // mm
        month.toString(), // m
        year.toString(), // yyyy
        year.toString().slice(-2), // yy
        lastPayDate.toLocaleString("default", { month: "long" }).toLowerCase(), // full month name
        lastPayDate.toLocaleString("default", { month: "short" }).toLowerCase(), // short month name
      ];

      const matches = formats.some((format) => format.includes(searchTerm));
      if (!matches) return false;
    }

    // Property filter - ignore when "all" is selected
    // Property filter - ignore when "all" is selected
    if (filterPropertyId && filterPropertyId !== "all") {
      const groupPropertyId = (
        group.property_id ||
        tenants.find((t: any) => t.id === group.tenant_id)?.current_assignment
          ?.property_id
      )?.toString();
      if (groupPropertyId !== filterPropertyId) return false;
    }
    // Room number filter
    if (roomFilter && group.room_number) {
      if (
        !group.room_number
          .toString()
          .toLowerCase()
          .includes(roomFilter.toLowerCase())
      )
        return false;
    }

    // Date filters - only apply if not ignored
    if (!ignoreDateFilters && (filterStartDate || filterEndDate)) {
      // Start Date = First Payment Date
      if (filterStartDate) {
        if (!group.first_payment_date) return false;
        const firstDate = new Date(group.first_payment_date);
        firstDate.setHours(0, 0, 0, 0);
        const startDate = new Date(filterStartDate);
        startDate.setHours(0, 0, 0, 0);
        if (firstDate < startDate) return false;
      }
      // End Date = Last Payment Date
      if (filterEndDate) {
        if (!group.last_payment_date) return false;
        const lastDate = new Date(group.last_payment_date);
        lastDate.setHours(23, 59, 59, 999);
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        if (lastDate > endDate) return false;
      }
    }

    return true;
  });

  return (
    <Card className="border-0 overflow-y-auto flex flex-col max-h-[400px] sm:max-h-[490px] ">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Single overflow-x for both header + body */}
        <div className="overflow-x-auto flex-1 min-h-0 flex flex-col min-w-0">
          <div className="min-w-[10px] flex flex-col flex-1 min-h-0">
            <div className="flex-shrink-0">
              <Table className="table-fixed w-full">
            <colgroup>
  <col style={{ width: "36px" }} />
  <col style={{ width: "280px" }} />
  <col style={{ width: "55px" }} />
  <col style={{ width: "115px" }} />
  <col style={{ width: "105px" }} />
  <col style={{ width: "115px" }} />
  <col style={{ width: "115px" }} />
  <col style={{ width: "115px" }} />
  <col style={{ width: "95px" }} />
</colgroup>
                <TableHeader className="bg-gray-200 border-b border-gray-300">
                  <TableRow className="hover:bg-transparent">
                    {/* Expand Column */}
                    <TableHead className="py-2 px-1 bg-gray-200"></TableHead>

                    {/* Tenant Column - Updated with salutation filter */}
                    <TableHead className="py-2 px-2 bg-gray-200">
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
                          placeholder="Search name / room / property..."
                          className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                          value={columnFilters?.tenant_name || ""}
                          onChange={(e) => {
                            setColumnFilters?.({
                              ...columnFilters,
                              tenant_name: e.target.value,
                            });
                            onPageChange?.(1); // ✅ Reset to page 1 on search
                          }}
                        />
                      </div>
                    </TableHead>

                    {/* CNT Column */}
                    <TableHead className="py-2 px-2 bg-gray-200 text-center">
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
                    <TableHead className="py-2 px-2 bg-gray-200 text-right">
                      <div className="flex flex-col gap-1 items-end">
                        <div
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => handleSort?.("total_amount")}
                        >
                          <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide text-left">
                            Total Amount
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
                    {/* ✅ NEW: Paid Amount Column (Approved) */}
                    <TableHead className="py-2 px-2 bg-gray-200 text-right">
  <div className="flex flex-col gap-1 items-end">
    <span className="font-semibold text-green-700 text-[10px] uppercase tracking-wide">
      Paid (₹)
                        </span>
                      </div>
                      <Input
                        placeholder="Search amount..."
                        type="number"
                        className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 text-left font-normal w-full"
                        value={columnFilters?.total_paid_amount || ""}
                        onChange={(e) =>
                          setColumnFilters?.({
                            ...columnFilters,
                            total_paid_amount: e.target.value,
                          })
                        }
                      />
                    </TableHead>

                    {/* ✅ NEW: Rejected Amount Column */}
                    <TableHead className="py-2 px-2 bg-gray-200 text-right">
  <div className="flex flex-col gap-1 items-end">
    <span className="font-semibold text-red-700 text-[10px] uppercase tracking-wide">
      Rejected (₹)
                        </span>
                        <Input
                          placeholder="Search amount..."
                          type="number"
                          className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 text-left font-normal w-full"
                          value={columnFilters?.total_rejected_amount || ""}
                          onChange={(e) =>
                            setColumnFilters?.({
                              ...columnFilters,
                              total_rejected_amount: e.target.value,
                            })
                          }
                        />
                      </div>
                    </TableHead>

                    {/* Status Column */}
                   <TableHead className="py-2 px-2 bg-gray-200">
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1 cursor-pointer"
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
                            setColumnFilters?.({
                              ...columnFilters,
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
                    <TableHead className="py-2 px-2 bg-gray-200">
  <div className="flex flex-col gap-1">
    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
      Last Pay
                        </span>
                        <Input
                          placeholder="dd/mm/yy"
                          type="text"
                          className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 font-normal w-full"
                          value={columnFilters?.payment_date || ""}
                          onChange={(e) => {
                            setColumnFilters?.({
                              ...columnFilters,
                              payment_date: e.target.value,
                            });
                            onPageChange?.(1); // reset to page 1
                          }}
                        />
                      </div>
                    </TableHead>

                    {/* Actions Column */}
                    {/* Actions Column */}
                    <TableHead className="py-2 px-2 bg-gray-200 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                          Actions
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
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
              <Table className="table-fixed w-full">
         <colgroup>
  <col style={{ width: "36px" }} />
  <col style={{ width: "280px" }} />
  <col style={{ width: "55px" }} />
  <col style={{ width: "115px" }} />
  <col style={{ width: "105px" }} />
  <col style={{ width: "115px" }} />
  <col style={{ width: "115px" }} />
  <col style={{ width: "115px" }} />
  <col style={{ width: "95px" }} />
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
    group cursor-pointer transition-all duration-200 border-b border-slate-200
    ${isExpanded ? "bg-blue-50/50 shadow-inner" : "hover:bg-slate-50/80"}
  `}
                            onClick={() => onToggleExpand(group.tenant_id)}
                          >
                            <TableCell className="py-3 border-r border-slate-200">
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

                            <TableCell className="py-3 border-r border-slate-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                                  {group.tenant_name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  {/* Show salutation + full name */}
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-slate-800">
                                      {group.salutation
                                        ? `${group.salutation} `
                                        : ""}
                                      {(group.tenant_name || "")
                                        .toLowerCase()
                                        .replace(/\b\w/g, (char: any) =>
                                          char.toUpperCase(),
                                        )}
                                    </p>

                                    {/* ✅ ADD VACATED / ACTIVE TAG */}
                                    {group.is_vacated ? (
                                      <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1.5 py-0">
                                        <DoorOpen className="h-2.5 w-2.5 mr-0.5" />
                                        Vacated
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-1.5 py-0">
                                        <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                                        Active
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Show country code + phone number */}
                                  <p className="text-xs text-slate-500">
                                    {group.country_code || "+91"}{" "}
                                    {group.tenant_phone}
                                  </p>
                                  {/* ✅ ADD ROOM AND BED NUMBER HERE */}
                                  {(group.room_number || group.bed_number) && (
                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 mt-0.5">
                                      {group.room_number && (
                                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 whitespace-nowrap">
                                          <DoorOpen className="h-2.5 w-2.5" />
                                          Room {group.room_number}
                                        </span>
                                      )}
                                      {group.bed_number && (
                                        <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 whitespace-nowrap">
                                          <Bed className="h-2.5 w-2.5" />
                                          Bed #{group.bed_number}
                                        </span>
                                      )}
                                      {group.property_name && (
                                        <span className="text-[10px] text-slate-500 truncate max-w-[100px] sm:max-w-[120px] flex-shrink-0">
                                          • {group.property_name}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="py-3 text-center border-r border-slate-200">
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5"
                              >
                                {group.payment_count}
                              </Badge>
                            </TableCell>

                            <TableCell className="py-3 text-right border-r border-slate-200">
                              <span className="text-sm font-bold text-green-600">
                                ₹{group.total_amount.toLocaleString()}
                              </span>
                            </TableCell>

                            {/* ✅ NEW: Paid Amount Column (Approved) */}
                            <TableCell className="py-3 text-right border-r border-slate-200">
                              <span className="text-sm font-bold text-green-600">
                                ₹
                                {group.total_paid_amount?.toLocaleString() || 0}
                              </span>
                              {/* {group.approved_count > 0 && (
      <span className="text-[9px] text-green-500 block">({group.approved_count})</span>
    )} */}
                            </TableCell>

                            {/* ✅ NEW: Rejected Amount Column */}
                            <TableCell className="py-3 text-right border-r border-slate-200">
                              <span className="text-sm font-bold text-red-600">
                                ₹
                                {group.total_rejected_amount?.toLocaleString() ||
                                  0}
                              </span>
                              {/* {group.rejected_count > 0 && (
      <span className="text-[9px] text-red-500 block">({group.rejected_count})</span>
    )} */}
                            </TableCell>

                            <TableCell className="py-3 border-r border-slate-200">
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

                            <TableCell className="py-3 text-center border-r border-slate-200">
                              <span className="text-xs text-slate-600 whitespace-nowrap">
                                {group.last_payment_date
                                  ? format(
                                      new Date(group.last_payment_date),
                                      "dd/MM/yyyy",
                                    )
                                  : "No payments"}
                              </span>
                            </TableCell>

                            <TableCell
                              className="py-3 text-center border-r border-slate-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-center gap-1">
                                {/* Print/Ledger Button */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-full"
                                  onClick={() => {
                                    onLedgerReport?.(group.tenant_id, {
                                      room_number: group.room_number,
                                      bed_number: group.bed_number,
                                      property_name: group.property_name,
                                      monthly_rent: group.monthly_rent,
                                      check_in_date: group.check_in_date,
                                    });
                                  }}
                                  title="View Ledger Report"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                                  onClick={() =>
                                    onToggleExpand(group.tenant_id)
                                  }
                                  title="View Details"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                {/* Add Payment Button - Hidden if tenant has deposit refund */}

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                                  onClick={async () => {
                                    const tenant = tenants.find(
                                      (t) => t.id === group.tenant_id,
                                    );
                                    const propertyId =
                                      tenant?.current_assignment?.property_id ||
                                      group.property_id;
                                    const roomId =
                                      tenant?.current_assignment?.room_id ||
                                      group.room_id;
                                    if (tenant && propertyId && roomId) {
                                      await prefillAndOpenPaymentForm(
                                        group.tenant_id,
                                        propertyId,
                                        roomId,
                                      );
                                    } else {
                                      toast.error(
                                        "Tenant missing property or room information",
                                      );
                                      setIsAddPaymentOpen(true);
                                    }
                                  }}
                                  title="Add Payment"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded Child Row - Payment Details */}
                          {isExpanded && (
                            <TableRow className="bg-blue-50/30">
                              <TableCell colSpan={9} className="p-0 border-t-0">
                                <div className="animate-in slide-in-from-top-1 duration-200">
                                  <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                        <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                                        Payment History •{" "}
                                        {group.payments.length} transactions
                                      </h4>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                                      <div className="overflow-x-auto overflow-y-auto max-h-[250px] sm:max-h-[300px] ">
                                        <table className="w-full text-sm border-collapse ">
                                          <thead className="sticky top-0 z-10">
                                            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                              <th className="text-left py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-r border-slate-300 ">
                                                Transaction Date
                                              </th>
                                              <th className="text-left py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-r border-slate-300">
                                                Amount
                                              </th>
                                              <th className="text-left py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-r border-slate-300">
                                                Transaction ID
                                              </th>
                                              <th className="text-left py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-r border-slate-300">
                                                Mode
                                              </th>
                                              <th className="text-left py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-r border-slate-300 whitespace-nowrap">
                                                Mode Type
                                              </th>
                                              <th className="text-left py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-r border-slate-300">
                                                Payment Type
                                              </th>
                                              <th className="text-left py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-r border-slate-300">
                                                Period
                                              </th>
                                              <th className="text-left py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-r border-slate-300">
                                                Remark
                                              </th>
                                              <th className="text-left py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-r border-slate-300">
                                                Proof
                                              </th>
                                              <th className="text-left py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-r border-slate-300">
                                                Status
                                              </th>
                                              <th className="text-left py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider border-r border-slate-300">
                                                Source
                                              </th>
                                              <th className="text-center py-3.5 px-1 font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {group.payments.map(
                                              (payment: any, index: number) => {
                                                // Parse payment_mode_type JSON to get detailed payment info
                                                let modeTypeDisplay = "";
                                                let modeTypeTooltip = "";

                                                if (payment.payment_mode_type) {
                                                  try {
                                                    const modeTypeData =
                                                      typeof payment.payment_mode_type ===
                                                      "string"
                                                        ? JSON.parse(
                                                            payment.payment_mode_type,
                                                          )
                                                        : payment.payment_mode_type;

                                                    if (
                                                      payment.payment_mode ===
                                                        "card" &&
                                                      modeTypeData
                                                    ) {
                                                      modeTypeDisplay = `${modeTypeData.network || "Card"} •••• ${modeTypeData.last4 || "****"}`;
                                                      modeTypeTooltip = `${modeTypeData.type || "Card"} - ${modeTypeData.bank || "Unknown Bank"}`;
                                                    } else if (
                                                      payment.payment_mode ===
                                                        "upi" &&
                                                      modeTypeData?.vpa
                                                    ) {
                                                      modeTypeDisplay =
                                                        modeTypeData.vpa;
                                                      modeTypeTooltip =
                                                        modeTypeData.vpa;
                                                    } else if (
                                                      (payment.payment_mode ===
                                                        "netbanking" ||
                                                        payment.payment_mode ===
                                                          "bank_transfer") &&
                                                      modeTypeData?.bank
                                                    ) {
                                                      modeTypeDisplay =
                                                        modeTypeData.bank;
                                                      modeTypeTooltip =
                                                        modeTypeData.bank;
                                                    } else if (
                                                      payment.payment_mode ===
                                                        "wallet" &&
                                                      modeTypeData?.wallet
                                                    ) {
                                                      modeTypeDisplay =
                                                        modeTypeData.wallet;
                                                      modeTypeTooltip =
                                                        modeTypeData.wallet;
                                                    } else {
                                                      modeTypeDisplay = "-";
                                                    }
                                                  } catch (e) {
                                                    modeTypeDisplay = "-";
                                                  }
                                                } else {
                                                  modeTypeDisplay = "-";
                                                }

                                                const isEven = index % 2 === 0;

                                                return (
                                                  <tr
                                                    key={payment.id}
                                                    className={`${isEven ? "bg-white" : "bg-slate-50/30"} border-b border-slate-100 hover:bg-blue-50/30 transition-colors duration-200 group`}
                                                  >
                                                    {/* Transaction Date */}
                                                    <td className="py-1 px-3 border-r border-slate-200">
                                                      <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                                        </div>
                                                        <span className="text-[12px] font-medium text-slate-700 whitespace-nowrap">
                                                          {format(
                                                            new Date(
                                                              payment.payment_date,
                                                            ),
                                                            "dd MMM yyyy",
                                                          )}
                                                        </span>
                                                      </div>
                                                    </td>

                                                    {/* Amount */}
                                                    <td className="py-1 px-3 border-r border-slate-200">
                                                      <div className="flex items-center gap-1">
                                                        <span className="text-[13px] font-bold text-slate-900">
                                                          ₹
                                                          {Number(
                                                            payment.amount,
                                                          ).toLocaleString()}
                                                        </span>
                                                      </div>
                                                    </td>

                                                    {/* Transaction ID */}
                                                    <td className="py-1 px-3 border-r border-slate-200">
                                                      {payment.transaction_id ? (
                                                        <div className="flex items-center gap-1.5">
                                                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                            {payment.transaction_id.substring(
                                                              0,
                                                              8,
                                                            )}
                                                            ...
                                                          </span>
                                                          <button
                                                            onClick={() => {
                                                              navigator.clipboard.writeText(
                                                                payment.transaction_id,
                                                              );
                                                              toast.success(
                                                                "Transaction ID copied",
                                                              );
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                          >
                                                            <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        <span className="text-[11px] text-slate-400">
                                                          —
                                                        </span>
                                                      )}
                                                    </td>

                                                    {/* Payment Mode - Mode and Bank Name in SAME ROW (horizontal) */}
                                                    <td className="py-1 px-1 border-r border-slate-200">
                                                      <div className="flex items-center gap-1 flex-wrap whitespace-nowrap">
                                                        {payment.payment_mode ===
                                                          "card" && (
                                                          <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                                                        )}
                                                        {payment.payment_mode ===
                                                          "upi" && (
                                                          <Smartphone className="w-3.5 h-3.5 text-green-500" />
                                                        )}
                                                        {payment.payment_mode ===
                                                          "cash" && (
                                                          <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                                                        )}
                                                        {payment.payment_mode ===
                                                          "bank_transfer"}
                                                        <span className="text-[10px] font-medium text-slate-900 capitalize">
                                                          {payment.payment_mode ===
                                                          "bank_transfer"
                                                            ? "Bank Transfer"
                                                            : payment.payment_mode}
                                                        </span>
                                                      </div>
                                                    </td>

                                                    {/* Payment Mode Type */}
                                                    <td className="py-1 px-1 border-r border-slate-200">
                                                      {modeTypeDisplay !==
                                                        "-" ||
                                                      payment.bank_name ? (
                                                        <div className="flex flex-col gap-0.5">
                                                          {/* Mode Type */}
                                                          {modeTypeDisplay !==
                                                            "-" && (
                                                            <span
                                                              className="text-[10px] text-slate-600 cursor-help bg-slate-100 px-1.5 py-0.5 rounded w-fit whitespace-nowrap"
                                                              title={
                                                                modeTypeTooltip ||
                                                                modeTypeDisplay
                                                              }
                                                            >
                                                              {modeTypeDisplay.length >
                                                              20
                                                                ? modeTypeDisplay.substring(
                                                                    0,
                                                                    20,
                                                                  ) + "..."
                                                                : modeTypeDisplay}
                                                            </span>
                                                          )}

                                                          {/* Bank Name */}
                                                          {payment.bank_name && (
                                                            <span className="text-[10px] text-slate-600 cursor-help bg-slate-100 px-1.5 py-0.5 rounded w-fit whitespace-nowrap">
                                                              {
                                                                payment.bank_name
                                                              }
                                                            </span>
                                                          )}
                                                        </div>
                                                      ) : (
                                                        <span className="text-[11px] text-slate-400">
                                                          —
                                                        </span>
                                                      )}
                                                    </td>

                                                    {/* Payment Type */}
                                                    <td className="py-1 px-3 border-r border-slate-200">
                                                      <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                                                          payment.payment_type ===
                                                          "rent"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : payment.payment_type ===
                                                                "security_deposit"
                                                              ? "bg-purple-100 text-purple-700"
                                                              : payment.payment_type ===
                                                                  "deposit_refund"
                                                                ? "bg-green-100 text-green-700"
                                                                : payment.payment_type ===
                                                                    "penalty_payment"
                                                                  ? "bg-gray-100 text-gray-700"
                                                                  : "bg-slate-100 text-slate-700"
                                                        }`}
                                                      >
                                                        {payment.payment_type ===
                                                        "rent"
                                                          ? "Rent"
                                                          : payment.payment_type ===
                                                              "security_deposit"
                                                            ? "Security Deposit"
                                                            : payment.payment_type ||
                                                              "Other"}
                                                      </span>
                                                    </td>

                                                    {/* Month/Year */}
                                                    <td className="py-1 px-3 border-r border-slate-200">
                                                      <span className="text-[12px] text-slate-600 whitespace-nowrap">
                                                        {payment.month}{" "}
                                                        {payment.year}
                                                      </span>
                                                    </td>

                                                    {/* Remark */}
                                                    <td className="py-1 px-3 border-r border-slate-200 max-w-[150px]">
                                                      {payment.remark ? (
                                                        <div className="group relative">
                                                          <p
                                                            className="text-[11px] text-slate-500 truncate cursor-help"
                                                            title={
                                                              payment.remark
                                                            }
                                                          >
                                                            {payment.remark}
                                                          </p>
                                                        </div>
                                                      ) : (
                                                        <span className="text-[11px] text-slate-400">
                                                          —
                                                        </span>
                                                      )}
                                                    </td>

                                                    {/* Proof Column with Thumbnail */}
                                                    <td className="py-1 px-3 border-r border-slate-200">
                                                      {payment.payment_proof ? (
                                                        <button
                                                          className="flex items-center gap-1.5 group/proof"
                                                          onClick={() => {
                                                            window.open(
                                                              `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${payment.payment_proof}`,
                                                              "_blank",
                                                            );
                                                          }}
                                                        >
                                                          {payment.payment_proof.match(
                                                            /\.(jpg|jpeg|png|gif|webp)$/i,
                                                          ) ? (
                                                            <div className="relative">
                                                              <img
                                                                src={`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${payment.payment_proof}`}
                                                                alt="Proof"
                                                                className="h-8 w-8 rounded-lg object-cover border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105"
                                                              />
                                                              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-lg transition-colors" />
                                                            </div>
                                                          ) : (
                                                            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-200 hover:bg-blue-100 transition-colors">
                                                              <FileText className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                          )}
                                                        </button>
                                                      ) : (
                                                        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200">
                                                          <span className="text-[10px] text-slate-400">
                                                            —
                                                          </span>
                                                        </div>
                                                      )}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-1 px-3 border-r border-slate-200">
                                                      <PaymentStatusBadge
                                                        status={
                                                          payment.status ||
                                                          "pending"
                                                        }
                                                      />
                                                    </td>

                                                    {/* Source */}
                                                    <td className="py-1 px-3 border-r border-slate-200">
                                                      {payment.payment_type ===
                                                      "deposit_refund" ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-medium whitespace-nowrap">
                                                          <ReceiptIndianRupee className="h-2.5 w-2.5" />
                                                          Deposit Refund
                                                        </span>
                                                      ) : payment.booking_id ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-medium whitespace-nowrap">
                                                          <Globe className="h-2.5 w-2.5" />
                                                          Online Booking
                                                        </span>
                                                      ) : payment.source ===
                                                        "tenant" ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium whitespace-nowrap">
                                                          <Globe className="h-2.5 w-2.5" />
                                                          Online Payment
                                                        </span>
                                                      ) : payment.payment_mode ===
                                                        "online" ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-medium whitespace-nowrap">
                                                          <User className="h-2.5 w-2.5" />
                                                          Manual Entry
                                                        </span>
                                                      ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-medium whitespace-nowrap">
                                                          <User className="h-2.5 w-2.5" />
                                                          Manual Entry
                                                        </span>
                                                      )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-1 px-3">
                                                      <div className="flex items-center gap-1 justify-end">
                                                        {/* Approve Button */}
                                                        {(payment.status ===
                                                          "pending" ||
                                                          payment.status ===
                                                            "paid" ||
                                                          payment.status ===
                                                            "partial" ||
                                                          payment.status ===
                                                            "refund") &&
                                                          canApprove && (
                                                            <button
                                                              className="h-7 w-7 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-all duration-200"
                                                              onClick={() =>
                                                                onApprove(
                                                                  payment,
                                                                )
                                                              }
                                                              title="Approve"
                                                            >
                                                              <CheckCircle2 className="h-3.5 w-3.5" />
                                                            </button>
                                                          )}

                                                        {/* Reject Button */}
                                                        {(payment.status ===
                                                          "pending" ||
                                                          payment.status ===
                                                            "paid" ||
                                                          payment.status ===
                                                            "partial" ||
                                                          payment.status ===
                                                            "refund") &&
                                                          canReject && (
                                                            <button
                                                              className="h-7 w-7 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-all duration-200"
                                                              onClick={() =>
                                                                onReject(
                                                                  payment,
                                                                )
                                                              }
                                                              title="Reject"
                                                            >
                                                              <XCircle className="h-3.5 w-3.5" />
                                                            </button>
                                                          )}

                                                        {/* Edit Button */}
                                                        {payment.source !==
                                                          "tenant" &&
                                                          (payment.status ===
                                                            "pending" ||
                                                            payment.status ===
                                                              "paid" ||
                                                            payment.status ===
                                                              "refund") &&
                                                          canEdit && (
                                                            <button
                                                              className="h-7 w-7 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center transition-all duration-200"
                                                              onClick={() =>
                                                                onEdit(payment)
                                                              }
                                                              title="Edit"
                                                            >
                                                              <Pencil className="h-3.5 w-3.5" />
                                                            </button>
                                                          )}

                                                        {/* Delete Button */}
                                                        {canDelete && (
                                                          <button
                                                            className="h-7 w-7 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-all duration-200"
                                                            onClick={() =>
                                                              onDelete(payment)
                                                            }
                                                            title="Delete"
                                                          >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                          </button>
                                                        )}
                                                      </div>
                                                    </td>
                                                  </tr>
                                                );
                                              },
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
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
        <SheetContent
          side="right"
          className="p-0 w-[85vw] min-w-[280px] sm:w-[360px]"
        >
          <div className="h-full flex flex-col">
            <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">
                  Filter Payments
                </span>
              </div>
              <button
                onClick={() => setShowFilterSidebar?.(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-blue-700">
                  Tenant Name
                </Label>
                <Input
                  placeholder="Search tenant..."
                  value={columnFilters?.tenant_name || ""}
                  onChange={(e) =>
                    setColumnFilters?.({
                      ...columnFilters,
                      tenant_name: e.target.value,
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-blue-700">
                  Status
                </Label>
                <select
                  value={columnFilters?.status || "all"}
                  onChange={(e) =>
                    setColumnFilters?.({
                      ...columnFilters,
                      status: e.target.value,
                    })
                  }
                  className="w-full h-8 text-xs rounded-lg border border-gray-200 px-2 bg-white text-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-blue-700">
                  Amount
                </Label>
                <Input
                  type="number"
                  placeholder="Search amount..."
                  value={columnFilters?.amount || ""}
                  onChange={(e) =>
                    setColumnFilters?.({
                      ...columnFilters,
                      amount: e.target.value,
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-blue-700">
                  Property
                </Label>
                <Select
                  value={filterPropertyId}
                  onValueChange={setFilterPropertyId}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((prop: any) => (
                      <SelectItem key={prop.id} value={prop.id.toString()}>
                        {prop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-blue-700">
                  Start Date (First Payment)
                </Label>
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-blue-700">
                  End Date (Last Payment)
                </Label>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-blue-700">
                  Payment Count
                </Label>
                <Input
                  type="number"
                  placeholder="Exact count..."
                  value={columnFilters?.payment_count || ""}
                  onChange={(e) =>
                    setColumnFilters?.({
                      ...columnFilters,
                      payment_count: e.target.value,
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-blue-700">
                  Room Number
                </Label>
                <Input
                  placeholder="Search room number..."
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ignoreDateFilters}
                    onChange={(e) => setIgnoreDateFilters(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-blue-700">
                    Ignore Date Filters
                  </span>
                </label>
                <p className="text-[10px] text-gray-500 ml-5">
                  Show all data regardless of last payment date
                </p>
              </div>
            </div>
            <div className="border-t p-3 flex gap-2 bg-gray-50 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => {
                  setColumnFilters?.({
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
                    payment_count: "",
                  });
                  setFilterPropertyId("all");
                  setFilterStartDate("");
                  setFilterEndDate("");
                  setRoomFilter("");
                  setIgnoreDateFilters(false);
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

    return (
      matchesDate &&
      matchesTenant &&
      matchesAmount &&
      matchesMethod &&
      matchesRoom
    );
  });

  // Calculate paginated receipts
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const paginatedReceiptsList = filteredReceipts.slice(startIndex, endIndex);

  return (
    <Card className="border-0 overflow-y-auto flex flex-col max-h-[400px] sm:max-h-[490px]">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="overflow-x-auto flex-1 min-h-0 flex flex-col min-w-0">
          <div className="min-w-[700px] flex flex-col flex-1 min-h-0">
            <div className="flex-shrink-0">
              <Table>
                <TableHeader className="bg-gray-200 border-b border-gray-300">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[100px] py-2 px-2 bg-gray-200">
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

                    <TableHead className="w-[160px] py-2 px-2 bg-gray-200">
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

                    <TableHead className="w-[150px] py-2 px-2 bg-gray-200 text-left">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                          Amount
                        </span>
                        <Input
                          placeholder="Search..."
                          type="number"
                          className="h-6 text-[10px] bg-white border-gray-300 focus:border-blue-400 px-2 text-left font-normal w-full"
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

                    <TableHead className="w-[150px] py-2 px-2 bg-gray-200">
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

                    <TableHead className="w-[120px] py-2 px-2 bg-gray-200">
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

                    <TableHead className="w-[80px] py-2 px-2 bg-gray-200 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                          Actions
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
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
                  <col style={{ width: "100px" }} /> {/* Date */}
                  <col style={{ width: "160px" }} /> {/* Tenant */}
                  <col style={{ width: "150px" }} /> {/* Amount */}
                  <col style={{ width: "150px" }} /> {/* Method/Bank */}
                  <col style={{ width: "120px" }} /> {/* Room/Bed */}
                  <col style={{ width: "80px" }} /> {/* Actions */}
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
                    paginatedReceiptsList.map((receipt: any) => {
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
                          <TableCell className="py-2 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <p className="text-xs font-medium whitespace-nowrap">
                                {receipt.salutation
                                  ? `${receipt.salutation} `
                                  : ""}
                                {receipt.tenant_name}
                              </p>

                              {receipt.phone && (
                                <p className="text-[10px] text-slate-500 whitespace-nowrap">
                                  {receipt.country_code || "+91"}{" "}
                                  {receipt.phone}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-xs font-medium whitespace-nowrap text-center">
                            ₹{receipt.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="py-2 text-center">
                            <p className="text-xs capitalize whitespace-nowrap">
                              {receipt.payment_mode}
                            </p>
                            {receipt.bank_name && (
                              <p className="text-[10px] text-slate-500 whitespace-nowrap">
                                {receipt.bank_name}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="py-2 text-center">
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
        <SheetContent
          side="right"
          className="p-0 w-[85vw] min-w-[280px] sm:w-[360px]"
        >
          <div className="h-full flex flex-col">
            <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">
                  Filter Receipts
                </span>
              </div>
              <button
                onClick={() => setShowFilterSidebar?.(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                { key: "date", label: "Date", placeholder: "dd/mm/yy" },
                {
                  key: "tenant",
                  label: "Tenant",
                  placeholder: "Search tenant...",
                },
                {
                  key: "amount",
                  label: "Amount",
                  placeholder: "Search amount...",
                },
                {
                  key: "method",
                  label: "Method/Bank",
                  placeholder: "Search method...",
                },
                {
                  key: "room",
                  label: "Room/Bed",
                  placeholder: "Search room...",
                },
              ].map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label className="text-xs font-semibold text-blue-700">
                    {f.label}
                  </Label>
                  <Input
                    placeholder={f.placeholder}
                    value={receiptFilters[f.key] || ""}
                    onChange={(e) =>
                      setReceiptFilters((prev) => ({
                        ...prev,
                        [f.key]: e.target.value,
                      }))
                    }
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
            <div className="border-t p-3 flex gap-2 bg-gray-50 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() =>
                  setReceiptFilters({
                    date: "",
                    tenant: "",
                    amount: "",
                    method: "",
                    room: "",
                  })
                }
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

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={Math.ceil(
          filteredReceipts.length / pagination.itemsPerPage,
        )}
        onPageChange={onPageChange}
        itemsPerPage={pagination.itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        totalItems={filteredReceipts.length}
        currentItemsCount={paginatedReceiptsList.length}
      />
    </Card>
  );
};
