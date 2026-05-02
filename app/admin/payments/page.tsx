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
const [bankNames, setBankNames] = useState<Array<{ id: number; name: string }>>([]);
const [loadingBankNames, setLoadingBankNames] = useState(false);
const [customBankName, setCustomBankName] = useState("");
const [showCustomBankInput, setShowCustomBankInput] = useState(false);

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

  // Fetch bank names from masters
const fetchBankNames = async () => {
  setLoadingBankNames(true);
  try {
    // Fetch from Common tab for "Bank Names" master item
    const response = await consumeMasters({ tab: "Common", type: "Bank Names" });
    
    if (response?.success && response.data) {
      const banks = response.data.map((item: any) => ({
        id: item.value_id,
        name: item.value_name
      }));
      setBankNames(banks);
    } 
  } catch (error) {
    console.error("Error fetching bank names:", error);
  } finally {
    setLoadingBankNames(false);
  }
};

// Call fetchBankNames when component mounts
useEffect(() => {
  fetchBankNames();
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

// Replace the existing handleLedgerReport with this:
const handleLedgerReport = (tenantId: number, tenantData: any) => {
  // Find the complete tenant object
  const completeTenant = tenants.find(t => t.id === tenantId);
  
  // Get original monthly rent from bed_assignments
  let monthlyRent = tenantData?.monthly_rent || completeTenant?.monthly_rent || 0;
  
  // If still 0, try to get from current_assignment
  if (monthlyRent === 0 && completeTenant?.current_assignment?.tenant_rent) {
    monthlyRent = completeTenant.current_assignment.tenant_rent;
  }
  
  setSelectedLedgerTenant({
    id: tenantId,
    name: completeTenant?.full_name || getTenantName(tenantId),
    phone: completeTenant?.phone || getTenantPhone(tenantId),
    email: completeTenant?.email || '',
    salutation: completeTenant?.salutation || getTenantSalutation(tenantId),
    country_code: completeTenant?.country_code || getTenantCountryCode(tenantId),
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
  const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/ledger/${tenantId}/download`;
  window.open(downloadUrl, '_blank');
  toast.success('PDF download started');
};


// Add this helper function
const formatCurrency = (amount: number) => {
  if (isNaN(amount) || amount === 0) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
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
      console.log(`✅ Loaded ${data.data.length} rooms for property ${propertyId}`);
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
        console.log(
          `✅ Found ${response.data.length} tenants for room ${roomId}`,
        );
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

  // Handle room change
  // Handle room change
  const handleRoomChange = async (roomId: string) => {
    setSelectedRoomId(roomId);
    setNewPayment((prev) => ({ ...prev, tenant_id: "" })); // Reset tenant selection
    setFilteredTenants([]); // Clear tenants while loading
    await fetchTenantsByRoom(roomId);
  };

  // Add this useEffect
  useEffect(() => {
    fetchProperties();
  }, []);

  const loadTenants = async () => {
  try {
    // Use listTenantsOptimized or listTenantsWithAssignments to get full tenant data
    const response = await listTenants({ is_active: true, pageSize: 500 });
    if (response.success && response.data) {
      setTenants(response.data);
      console.log("Loaded tenants:", response.data.map(t => ({ 
        id: t.id, 
        name: t.full_name,
        property_id: t.current_assignment?.property_id,
        room_id: t.current_assignment?.room_id,
        property_name: t.current_assignment?.property_name,
        room_number: t.current_assignment?.room_number
      })));
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

// Update handleDemandTenantSelect to fetch and set pending amount correctly
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
      
      // ✅ Auto-fill amount with total pending amount for rent
      if (demandPayment.payment_type === "rent" && formResponse.data?.total_pending) {
        setDemandPayment((prev) => ({
          ...prev,
          amount: formResponse.data.total_pending,
        }));
      }
    }

    // Fetch security deposit info
    const depositResponse = await paymentApi.getSecurityDepositInfo(
      parseInt(tenantId),
    );
    if (depositResponse.success) {
      setSecurityDepositInfo(depositResponse.data);
      
      // ✅ Auto-fill amount with pending amount for security deposit
      if (demandPayment.payment_type === "security_deposit" && depositResponse.data?.pending_amount) {
        setDemandPayment((prev) => ({
          ...prev,
          amount: depositResponse.data.pending_amount,
        }));
      }
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
    const formResponse = await paymentApi.getTenantPaymentFormData(payment.tenant_id);
    if (formResponse.success) {
      setPaymentFormData(formResponse.data);
    }
    
    // Fetch security deposit info
    const depositResponse = await paymentApi.getSecurityDepositInfo(payment.tenant_id);
    if (depositResponse.success) {
      setSecurityDepositInfo(depositResponse.data);
    }
    
    // ✅ FIX: Set the month correctly for the payment being edited
    if (payment.month && payment.year) {
      // Find the month number
      const monthNumber = new Date(Date.parse(payment.month + " 1, " + payment.year)).getMonth() + 1;
      const monthKey = `${payment.year}-${String(monthNumber).padStart(2, '0')}`;
      setSelectedPaymentMonth(monthKey);
    }
    
    // Set form data with existing payment values
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
    
    // Set property and room
    const tenant = tenants.find(t => t.id === payment.tenant_id);
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

const handlePreviewReceipt = async (receiptId: number) => {
  try {
    toast.loading("Loading receipt...", { id: "receipt-preview" });
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/receipts/${receiptId}/preview-pdf`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load receipt');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    // Create modal with smaller width
    const modal = document.createElement('div');
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
    
    const modalContent = document.createElement('div');
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
    
    const headerBar = document.createElement('div');
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
    
    const pdfViewer = document.createElement('iframe');
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
    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = 'Download PDF';
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
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${receiptId}.pdf`;
      link.click();
    };
    modal.appendChild(downloadBtn);
    
    const closeBtn = headerBar.querySelector('#closePreviewBtn');
    closeBtn?.addEventListener('click', () => {
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
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        paymentData.month = monthNames[parseInt(month) - 1];
        paymentData.year = parseInt(year);
      } else if (selectedPaymentMonth === "current") {
        // Current month
        const currentDate = new Date();
        paymentData.month = currentDate.toLocaleString("default", { month: "long" });
        paymentData.year = currentDate.getFullYear();
      } else {
        // Fallback to current month
        const currentDate = new Date();
        paymentData.month = currentDate.toLocaleString("default", { month: "long" });
        paymentData.year = currentDate.getFullYear();
      }
    } else {
      // For security deposit or other payment types, use current date
      const currentDate = new Date();
      paymentData.month = currentDate.toLocaleString("default", { month: "long" });
      paymentData.year = currentDate.getFullYear();
    }

      console.log("Sending payment data:", paymentData);

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
    payment_mode: "cash",
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

const prefillAndOpenPaymentForm = async (tenantId: number, propertyId: number, roomId: number) => {
  try {
    toast.loading("Loading payment form...", { id: "prefill-loading" });
    
    console.log("Prefill started with:", { tenantId, propertyId, roomId });
    console.log("Current properties length:", properties.length);
    
    // ✅ First, fetch properties if they are empty
    if (properties.length === 0) {
      console.log("Fetching properties...");
      await fetchProperties();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // ✅ Set selections
    setSelectedPropertyId(propertyId.toString());
    setSelectedRoomId(roomId.toString());
    setNewPayment(prev => ({ ...prev, tenant_id: tenantId.toString() }));
    
    // ✅ Load rooms for this property
    console.log("Fetching rooms for property:", propertyId);
    await fetchRoomsByProperty(propertyId.toString());
    
    // ✅ Load tenants for this room
    console.log("Fetching tenants for room:", roomId);
    await fetchTenantsByRoom(roomId.toString());
    
    // ✅ Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // ✅ Load tenant payment data
    console.log("Loading tenant payment data for:", tenantId);
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
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        paymentData.month = monthNames[parseInt(month) - 1];
        paymentData.year = parseInt(year);
      } else if (selectedPaymentMonth === "current") {
        // Current month
        const currentDate = new Date();
        paymentData.month = currentDate.toLocaleString("default", { month: "long" });
        paymentData.year = currentDate.getFullYear();
      }
    }
    
    const response = await paymentApi.updatePayment(selectedPayment.id, paymentData);
    
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

const groupPaymentsByTenant = (payments: any[]) => {
  const grouped: { [key: string]: any } = {};

  payments.forEach((payment) => {
    const tenantId = payment.tenant_id;
    const tenantName = getTenantName(tenantId);
    const tenantPhone = getTenantPhone(tenantId);
    
    // Find the complete tenant object
    const completeTenant = tenants.find(t => t.id === tenantId);

    if (!grouped[tenantId]) {
      grouped[tenantId] = {
        tenant_id: tenantId,
        tenant_name: tenantName,
        tenant_phone: tenantPhone,
        tenant_email: completeTenant?.email || '',
        tenant_salutation: completeTenant?.salutation || getTenantSalutation(tenantId),
        tenant_country_code: completeTenant?.country_code || getTenantCountryCode(tenantId),
        total_amount: 0,
          total_paid_amount: 0,        // ✅ NEW: Sum of approved payments
        total_rejected_amount: 0,    // ✅ NEW: Sum of rejected payments
        payment_count: 0,
        last_payment_date: null,
        payments: [],
        approved_count: 0,
        pending_count: 0,
        rejected_count: 0,
        has_online_booking: false,
        has_manual_payment: false,
        // ✅ ADD ROOM AND BED INFO
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
    else if (payment.status === "pending") grouped[tenantId].pending_count += 1;
    else if (payment.status === "rejected") grouped[tenantId].rejected_count += 1;

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

  return groupedArray;
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
            <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200">
              <Clock className="h-2.5 w-2.5 mr-1" />
              First month: {firstMonthProrated.days} days @ ₹{firstMonthProrated.daily_rate}/day
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
              <th className="text-right p-2 text-xs font-medium text-slate-600">Paid</th>
              <th className="text-right p-2 text-xs font-medium text-slate-600">Discount</th>
              <th className="text-right p-2 text-xs font-medium text-slate-600">Pending</th>
              <th className="text-center p-2 text-xs font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month: any, index: number) => {
              const isCurrentMonth = (() => {
                const now = new Date();
                return month.month_num === now.getMonth() + 1 && month.year === now.getFullYear();
              })();
              
              // For prorated month, show calculation in tooltip
              const proratedTooltip = month.is_prorated 
                ? `Prorated: ${month.prorated_days} days × ₹${month.prorated_daily_rate}/day = ₹${month.rent.toLocaleString()} (was ₹${month.original_rent?.toLocaleString()}/month)`
                : '';
              
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
                      <span className="ml-2 text-[10px] text-green-600">(Discounted)</span>
                    )}
                    {month.is_prorated && !month.has_discount && (
                      <span className="ml-2 text-[10px] text-amber-600">
                        (Prorated - {month.prorated_days} days)
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
                      month.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : month.status === "partial"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
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
{/* In the Add Payment Dialog - Security Deposit section */}
{newPayment.payment_type === "security_deposit" && securityDepositInfo && (
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
            {securityDepositInfo.bed_number && ` • Bed #${securityDepositInfo.bed_number}`}
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
)}

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
      format(new Date(demand.created_at), "dd/MM/yy").includes(
        demandFilters.date,
      );

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
                  onClick={() =>  {
    resetDemandPaymentForm();  // ✅ Reset before opening
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
            />
          </TabsContent>

          {/* Demands Tab Content */}
          {/* Demands Tab Content */}
          {/* Demands Tab Content */}
          <TabsContent value="demands" className="mt-0">
            <Card
              className="border-0 shadow-sm overflow-hidden flex flex-col"
              style={{ height: "calc(100vh - 280px)" }}
            >
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
                                      <SelectItem
                                        value="all"
                                        className="text-xs"
                                      >
                                        All
                                      </SelectItem>
                                      <SelectItem
                                        value="pending"
                                        className="text-xs"
                                      >
                                        Pending
                                      </SelectItem>
                                      <SelectItem
                                        value="paid"
                                        className="text-xs"
                                      >
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
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setShowDemandFilterSidebar(true)
                                    }
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
                            <col style={{ width: "140px" }} />
                            <col style={{ width: "300px" }} />
                            <col style={{ width: "170px" }} />
                            <col style={{ width: "130px" }} />
                            <col style={{ width: "22px" }} />
                            <col style={{ width: "100px" }} />
                            <col style={{ width: "100px" }} />
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
                                const tenantName = getTenantName(
                                  demand.tenant_id,
                                );

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
                                          new Date(demand.due_date) <
                                            new Date() &&
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
                                          <SelectItem value="paid">
                                            Paid
                                          </SelectItem>
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
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Payment Dialog - Your existing code with horizontal layout */}
      <Dialog open={isAddPaymentOpen} onOpenChange={(open) => {
  setIsAddPaymentOpen(open);
  if (!open) {
    // Reset everything when dialog closes
    resetPaymentForm();
  }
}}>
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
                    <SelectItem value="maintenance" className="text-xs">
                      Maintenance
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
    max={new Date().toISOString().split("T")[0]}   // 👈 key line
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
          <SelectItem key={bank.id} value={bank.name} className="text-xs">
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
            setNewPayment({ ...newPayment, bank_name: e.target.value });
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

      {/* Demand Payment Dialog */}
<Dialog open={isDemandPaymentOpen} onOpenChange={(open) => {
  setIsDemandPaymentOpen(open);
  if (!open) {
    // ✅ Reset form when dialog closes
    resetDemandPaymentForm();
  }
}}>
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
>
  <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
    <SelectValue placeholder="Select property..." />
  </SelectTrigger>
  <SelectContent className="max-h-[300px]" position="popper" sideOffset={5}>
    {/* Search Input */}
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
            : properties.length === 0 
              ? "No properties available" 
              : "Select a property"}
        </div>
      ) : (
        filteredProperties.map((property) => (
          <SelectItem key={property.id} value={property.id.toString()}>
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

        {/* Room Selection */}
        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-slate-600">
            Room <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedRoomId}
            onValueChange={handleRoomChange}
            disabled={!selectedPropertyId || loadingRooms}
          >
            <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
              <SelectValue placeholder={!selectedPropertyId ? "Select property first" : "Select room..."} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]" position="popper" sideOffset={5}>
              <div className="sticky top-0 bg-white p-2 border-b z-10" onPointerDown={(e) => e.stopPropagation()}>
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
              <div className="max-h-[250px] overflow-y-auto">
                {loadingRooms ? (
                  <div className="px-2 py-4 text-center text-xs text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                    Loading rooms...
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="px-2 py-4 text-center text-xs text-slate-500">
                    {roomSearch ? "No matching rooms found" : "No rooms available"}
                  </div>
                ) : (
                  filteredRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Home className="h-3 w-3 text-slate-400" />
                        <span className="text-xs">Room {room.room_number}</span>
                        <span className="text-[10px] text-slate-400">({room.sharing_type})</span>
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

      {/* Row 2: Tenant Selection + Payment Type - USE demandPayment state */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Tenant Selection */}
        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-slate-600">
            Tenant <span className="text-red-500">*</span>
          </Label>
          <Select
            value={demandPayment.tenant_id}  // ✅ USE demandPayment
            onValueChange={handleDemandTenantSelect}
            disabled={!selectedRoomId}
          >
            <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
              <SelectValue placeholder={!selectedRoomId ? "Select room first" : "Choose a tenant..."} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {filteredTenants.length === 0 && selectedRoomId ? (
                <div className="px-2 py-4 text-center text-xs text-slate-500">
                  No tenants assigned to this room
                </div>
              ) : (
                filteredTenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{tenant.full_name}</span>
                        <span className="text-[10px] text-slate-400">{tenant.phone}</span>
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
              <span className="text-[10px]">Loading tenant details...</span>
            </div>
          )}
        </div>

        {/* Payment Type - USE demandPayment */}
        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-slate-600">
            Payment Type
          </Label>
          <Select
            value={demandPayment.payment_type}  // ✅ USE demandPayment
            onValueChange={handleDemandPaymentTypeChange}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rent" className="text-xs">Rent</SelectItem>
              <SelectItem value="security_deposit" className="text-xs">Security Deposit</SelectItem>
              <SelectItem value="maintenance" className="text-xs">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bed Assignment */}
      {paymentFormData && <BedAssignmentTable formData={paymentFormData} />}

      {/* Conditional Sections */}
      {demandPayment.payment_type === "rent" ? (
        <div className="space-y-2">
          {paymentFormData && <RentSummaryTable formData={paymentFormData} />}
        </div>
      ) : demandPayment.payment_type === "security_deposit" && securityDepositInfo ? (
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
              <p className="text-xs font-medium">{securityDepositInfo.property_name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Total</p>
              <p className="text-xs font-bold text-blue-600">₹{securityDepositInfo.security_deposit?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Paid</p>
              <p className="text-xs font-medium text-green-600">₹{securityDepositInfo.paid_amount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Pending</p>
              <p className="text-xs font-bold text-amber-600">₹{securityDepositInfo.pending_amount?.toLocaleString()}</p>
            </div>
          </div>
          <div className="px-3 pb-3">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(((securityDepositInfo.paid_amount || 0) / (securityDepositInfo.security_deposit || 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-blue-600 rounded-full h-1.5 transition-all duration-500" style={{ width: `${((securityDepositInfo.paid_amount || 0) / (securityDepositInfo.security_deposit || 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      ) : null}

      {/* 3-col grid: Amount + Due Date + Description - USE demandPayment */}
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
          {demandPayment.payment_type === "rent" && paymentFormData?.total_pending > 0 && (
      <p className="text-[10px] text-blue-600 mt-1">
        Total Pending: ₹{paymentFormData.total_pending.toLocaleString()}
      </p>
    )}
          {demandPayment.payment_type === "security_deposit" && securityDepositInfo?.pending_amount > 0 && (
            <p className="text-[10px] text-blue-600">
              Pending: ₹{securityDepositInfo.pending_amount.toLocaleString()}
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

      {/* Notifications - USE demandPayment */}
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
            !demandPayment.tenant_id ||
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

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
  setIsEditDialogOpen(open);
  if (!open) {
    resetPaymentForm();
    setSelectedPayment(null);
  }
}}>
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
            value={properties.find(p => p.id === parseInt(selectedPropertyId))?.name || "Loading..."}
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
            value={rooms.find(r => r.id === parseInt(selectedRoomId))?.room_number || "Loading..."}
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
              <SelectItem value="rent" className="text-xs">Rent</SelectItem>
              <SelectItem value="security_deposit" className="text-xs">Security Deposit</SelectItem>
              <SelectItem value="maintenance" className="text-xs">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rent Payment Specific Fields */}
      {newPayment.payment_type === "rent" && (
        <div className="space-y-2">
          {/* Bed Assignment Table */}
          {paymentFormData && <BedAssignmentTable formData={paymentFormData} />}

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
                    First month rent: ₹{paymentFormData.discounted_first_month_rent?.toLocaleString()}{" "}
                    (was ₹{paymentFormData.monthly_rent?.toLocaleString()})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rent Summary Table */}
          {paymentFormData && <RentSummaryTable formData={paymentFormData} />}

          {/* Pay For Month */}
          <div className="space-y-1">
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
          </div>
        </div>
      )}

      {/* Security Deposit Specific Fields */}
      {newPayment.payment_type === "security_deposit" && securityDepositInfo && (
        <div className="space-y-2">
          {paymentFormData && <BedAssignmentTable formData={paymentFormData} />}
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
                <p className="text-xs font-medium">{securityDepositInfo.property_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Total</p>
                <p className="text-xs font-bold text-blue-600">
                  ₹{securityDepositInfo.security_deposit?.toLocaleString()}
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
                  ₹{securityDepositInfo.pending_amount?.toLocaleString()}
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
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
            <Input
              type="text"
              placeholder="0.00"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
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
              <SelectItem value="cash" className="text-xs">💵 Cash</SelectItem>
              <SelectItem value="online" className="text-xs">🌐 Online</SelectItem>
              <SelectItem value="bank_transfer" className="text-xs">🏦 Bank Transfer</SelectItem>
              <SelectItem value="cheque" className="text-xs">📝 Cheque</SelectItem>
              <SelectItem value="card" className="text-xs">💳 Card</SelectItem>
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

        {/* Bank Name - conditional */}
        {(newPayment.payment_mode === "bank_transfer" || newPayment.payment_mode === "online") && (
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-slate-600">
              Bank Name
            </Label>
            <Input
              value={newPayment.bank_name}
              onChange={(e) => setNewPayment({ ...newPayment, bank_name: e.target.value })}
              className="h-8 text-xs"
            />
          </div>
        )}

        {/* Transaction ID - conditional */}
        {(newPayment.payment_mode === "online" || newPayment.payment_mode === "bank_transfer" || newPayment.payment_mode === "cheque") && (
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-slate-600">
              Transaction ID
            </Label>
            <Input
              placeholder="Optional"
              value={newPayment.transaction_id}
              onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })}
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
            onChange={(e) => setNewPayment({ ...newPayment, remark: e.target.value })}
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
        payments={payments.filter(p => p.tenant_id === selectedLedgerTenant?.id)}
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
    <Card
      className="border-0 overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 280px)" }}
    >
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
                    <TableHead className="w-[300px] py-2 px-2 bg-gray-200">
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
    <TableHead className="w-[100px] py-2 px-2 bg-gray-200 text-right">
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
    <TableHead className="w-[100px] py-2 px-2 bg-gray-200 text-right">
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
                  <col style={{ width: "24px" }} />
                  <col style={{ width: "400px" }} />
                  <col style={{ width: "55px" }} />
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "170px" }} />
                  <col style={{ width: "150px" }} />
                  <col style={{ width: "200px" }} />
                  <col style={{ width: "80px" }} />
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
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-slate-800">
                                      {group.salutation
                                        ? `${group.salutation} `
                                        : ""}
                                      {group.tenant_name}
                                    </p>

                                    {/* ✅ Add Booking/Online Tag */}
                                    {group.has_online_booking && (
                                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0">
                                        <Globe className="h-2.5 w-2.5 mr-0.5" />
                                        Online
                                      </Badge>
                                    )}

                                    {group.has_manual_payment &&
                                      !group.has_online_booking && (
                                        <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] px-1.5 py-0">
                                          <User className="h-2.5 w-2.5 mr-0.5" />
                                          Manual
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
        <div className="flex items-center gap-2 mt-0.5">
          {group.room_number && (
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
              <DoorOpen className="h-2.5 w-2.5" />
              Room {group.room_number}
            </span>
          )}
          {group.bed_number && (
            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
              <Bed className="h-2.5 w-2.5" />
              Bed #{group.bed_number}
            </span>
          )}
          {group.property_name && (
            <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
              • {group.property_name}
            </span>
          )}
        </div>
      )}
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

                             {/* ✅ NEW: Paid Amount Column (Approved) */}
  <TableCell className="py-3 text-right">
    <span className="text-sm font-bold text-green-600">
      ₹{group.total_paid_amount?.toLocaleString() || 0}
    </span>
    {/* {group.approved_count > 0 && (
      <span className="text-[9px] text-green-500 block">({group.approved_count})</span>
    )} */}
  </TableCell>

  {/* ✅ NEW: Rejected Amount Column */}
  <TableCell className="py-3 text-right">
    <span className="text-sm font-bold text-red-600">
      ₹{group.total_rejected_amount?.toLocaleString() || 0}
    </span>
    {/* {group.rejected_count > 0 && (
      <span className="text-[9px] text-red-500 block">({group.rejected_count})</span>
    )} */}
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
<Button
  size="sm"
  variant="ghost"
  className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
  onClick={async () => {
    const tenant = tenants.find(t => t.id === group.tenant_id);
    
    const propertyId = tenant?.current_assignment?.property_id || group.property_id;
    const roomId = tenant?.current_assignment?.room_id || group.room_id;
    
    if (tenant && propertyId && roomId) {
      await prefillAndOpenPaymentForm(group.tenant_id, propertyId, roomId);
    } else {
      toast.error("Tenant missing property or room information");
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

                          {/* Expanded Child Row - Payment Details (unchanged) */}
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

                                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
  <Table>
    <TableHeader className="bg-slate-50">
      <TableRow>
        <TableHead className="text-[12px] py-2">
          Transaction Date
        </TableHead>
        <TableHead className="text-[12px] py-2">
          Amount
        </TableHead>
        <TableHead className="text-[12px] py-2">
          Transaction ID
        </TableHead>
        <TableHead className="text-[12px] py-2">
          Mode
        </TableHead>
        <TableHead className="text-[12px] py-2">
          Month/Year
        </TableHead>
        <TableHead className="text-[12px] py-2">
          Remark
        </TableHead>
        <TableHead className="text-[12px] py-2">
          Proof
        </TableHead>
        <TableHead className="text-[12px] py-2">
          Status
        </TableHead>
        <TableHead className="text-[12px] py-2">
          Source
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
            {/* Transaction Date - Full year format */}
            <TableCell className="py-2 text-[12px] whitespace-nowrap">
              {format(
                new Date(payment.payment_date),
                "dd/MM/yyyy",  // Changed from "dd/MM/yy" to "dd/MM/yyyy"
              )}
            </TableCell>
            
            <TableCell className="py-2 text-[12px] font-medium">
              ₹
              {Number(payment.amount).toLocaleString()}
            </TableCell>
            
            
            
            <TableCell className="py-2 text-[12px] font-mono">
              {payment.transaction_id
                ? payment.transaction_id.substring(0, 8) + "..."
                : "-"}
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
            
            {/* Proof Column with Thumbnail */}
            <TableCell className="py-2">
              {payment.payment_proof ? (
                <div className="flex items-center gap-1">
                  {payment.payment_proof.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${payment.payment_proof}`}
                      alt="Proof"
                      className="h-8 w-8 object-cover rounded cursor-pointer border hover:shadow-md transition-shadow"
                      onClick={() => {
                        window.open(
                          `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${payment.payment_proof}`,
                          "_blank",
                        );
                      }}
                    />
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                      onClick={() => {
                        window.open(
                          `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${payment.payment_proof}`,
                          "_blank",
                        );
                      }}
                      title="View Proof"
                    >
                      <FileText className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-slate-400">-</span>
              )}
            </TableCell>

            <TableCell className="py-2">
              <PaymentStatusBadge
                status={payment.status || "pending"}
              />
            </TableCell>
            
            {/* Source Column - Moved after Status */}
            <TableCell className="py-2">
              {payment.booking_id ? (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0">
                  <Globe className="h-2.5 w-2.5 mr-0.5 inline" />
                  Online Booking
                </Badge>
              ) : payment.source === "tenant" ? (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] px-1.5 py-0">
                  <Globe className="h-2.5 w-2.5 mr-0.5 inline" />
                  Online Payment (Tenant)
                </Badge>
              ) : payment.payment_mode === "online" ? (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] px-1.5 py-0">
                  <Globe className="h-2.5 w-2.5 mr-0.5 inline" />
                  Manual Entry
                </Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] px-1.5 py-0">
                  <User className="h-2.5 w-2.5 mr-0.5 inline" />
                  Manual Entry
                </Badge>
              )}
            </TableCell>
            
            <TableCell className="py-2">
  <div className="flex items-center gap-0.5 justify-end">
    {/* View Receipt - Show for approved or admin-paid payments */}
    {/* {(payment.status === "approved" ) && canViewReceipts && (
     <Button
  size="sm"
  variant="ghost"
  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
  onClick={() => {
    if (payment.status === "approved") {
      handlePreviewReceipt(payment.id);
    } else {
      toast.info("Receipt will be available after payment approval");
    }
  }}
  title="View Receipt"
>
  <ReceiptIndianRupee className="h-3 w-3" />
</Button>
    )} */}
    
    {/* Approve Button - Show for pending or partial status */}
    {(payment.status === "pending" || payment.status === "paid" || payment.status === "partial") && canApprove && (
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
        onClick={() => onApprove(payment)}
        title="Approve"
      >
        <CheckCircle2 className="h-3 w-3" />
      </Button>
    )}
    
    {/* Reject Button - Show for pending or partial status */}
    {(payment.status === "pending" || payment.status === "paid" || payment.status === "partial") && canReject && (
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
        onClick={() => onReject(payment)}
        title="Reject"
      >
        <XCircle className="h-3 w-3" />
      </Button>
    )}
    
    {/* Edit Button - Show ONLY for admin payments (NOT from tenant dashboard) */}
    {payment.source !== 'tenant'&& (payment.status === "pending" || payment.status === "paid") && canEdit && (
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
        onClick={() => onEdit(payment)}
        title="Edit"
      >
        <Pencil className="h-3 w-3" />
      </Button>
    )}
    
    {/* Delete Button - Show for ALL payments */}
    {canDelete && (
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
        onClick={() => onDelete(payment)}
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
                  Last Payment Date
                </Label>
                <Input
                  placeholder="dd/mm/yy"
                  value={columnFilters?.payment_date || ""}
                  onChange={(e) =>
                    setColumnFilters?.({
                      ...columnFilters,
                      payment_date: e.target.value,
                    })
                  }
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
            </div>
            <div className="border-t p-3 flex gap-2 bg-gray-50 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() =>
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
    </Card>
  );
};

// Receipts Table Component
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
    <Card
      className="border-0 overflow-hidden flex flex-col"
      style={{ height: "calc(100vh - 280px)" }}
    >
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
                  <col style={{ width: "90px" }} />
                  <col style={{ width: "200px" }} />
                  <col style={{ width: "90px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "100px" }} />
                  <col style={{ width: "60px" }} />
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
                              {receipt.salutation
                                ? `${receipt.salutation} `
                                : ""}
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
    </Card>
  );
};
