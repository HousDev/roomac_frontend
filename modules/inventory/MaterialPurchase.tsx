import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Package,
  Plus,
  Trash2,
  Loader2,
  X,
  Download,
  Building,
  IndianRupee,
  StickyNote,
  RefreshCw,
  Filter,
  AlertTriangle,
  TrendingDown,
  Boxes,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  Phone,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  getPurchases,
  createPurchase,
  addPayment,
  deletePurchase,
  bulkDeletePurchases,
  updatePurchase, // Add this
  getPurchaseStats,
  MaterialPurchase as MaterialPurchaseType,
  PurchaseItem,
  CreatePurchasePayload,
  AddPaymentPayload,
} from "@/lib/materialPurchaseApi";
import { listProperties } from "@/lib/propertyApi";
import { getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
import Swal from "sweetalert2";
import { useAuth } from "@/context/authContext";
import { getInventoryMappingsGrouped } from "@/lib/categorySubcategoryMapApi";
import { getSettings, getSettingValue } from "@/lib/settingsApi";

interface Property {
  id: string;
  name: string;
}

interface MasterCategory {
  id: string;
  name: string;
}

type PaymentStatus = "all" | "Pending" | "Partial" | "Paid";

// Style tokens
const F =
  "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";
const SI = "text-[11px] py-0.5";

const SH = ({
  icon,
  title,
  color = "text-blue-600",
}: {
  icon: React.ReactNode;
  title: string;
  color?: string;
}) => (
  <div
    className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}
  >
    {icon}
    {title}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <Card className={`${bg} border-0 shadow-sm`}>
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

export function MaterialPurchase() {
  const [purchases, setPurchases] = useState<MaterialPurchaseType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [inventoryMappings, setInventoryMappings] = useState<
    {
      category_id: string;
      category_name: string;
      subcategories: { subcategory_id: string; subcategory_name: string }[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<MaterialPurchaseType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [propertySearchTerm, setPropertySearchTerm] = useState("");
const [vendorSearchTerm, setVendorSearchTerm] = useState("");
const [categorySearchTerm, setCategorySearchTerm] = useState("");
const [itemNameSearchTerm, setItemNameSearchTerm] = useState("");

const propertySearchRef = useRef<HTMLInputElement>(null);
const vendorSearchRef = useRef<HTMLInputElement>(null);
const categorySearchRef = useRef<HTMLInputElement>(null);
const itemNameSearchRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState({
    total_purchases: 0,
    total_amount: 0,
    total_paid: 0,
    total_balance: 0,
    pending_count: 0,
    partial_count: 0,
    paid_count: 0,
  });
const { can, user } = useAuth();
  // ── Pagination state ──
  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, "All"] as const;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "All">(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [vendorFilter, setVendorFilter] = useState("all");
const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });
const [vendors, setVendors] = useState<{ id: string; name: string; phone?: string }[]>([]);
const [propertySelectOpen, setPropertySelectOpen] = useState(false);

useEffect(() => {
  if (propertySelectOpen) {
    requestAnimationFrame(() => propertySearchRef.current?.focus());
  }
}, [propertySelectOpen]);
  // Filters
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>("all");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [showEditForm, setShowEditForm] = useState(false);
  const [editPurchaseId, setEditPurchaseId] = useState<string | number | null>(
    null,
  );
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [mappingsLoading, setMappingsLoading] = useState(true);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const [draftPropertyFilter, setDraftPropertyFilter] = useState("all");
const [draftStatusFilter, setDraftStatusFilter] = useState<PaymentStatus>("all");
const [draftVendorFilter, setDraftVendorFilter] = useState("all");
const [draftAmountFilter, setDraftAmountFilter] = useState({ min: "", max: "" });
const [draftDateFilter, setDraftDateFilter] = useState({ from: "", to: "" });

const [siteSettings, setSiteSettings] = useState({
  siteName: "ROOMAC", logo: "", phone: "", email: "", address: "",
});

useEffect(() => {
  const fetchSiteSettings = async () => {
    try {
      const settings = await getSettings();
      setSiteSettings({
        siteName: getSettingValue(settings, "site_name", "ROOMAC"),
        logo: getSettingValue(settings, "logo_header", ""),
        phone: getSettingValue(settings, "contact_phone", ""),
        email: getSettingValue(settings, "contact_email", ""),
        address: getSettingValue(settings, "contact_address", ""),
      });
    } catch (err) {
      console.error("Failed to load site settings:", err);
    }
  };
  fetchSiteSettings();
}, []);


// Column search
  const [colSearch, setColSearch] = useState({
    invoice: "",
    vendor: "",
    property: "",
    amount: "",
    status: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    purchase_date: new Date().toISOString().split("T")[0],
    vendor_name: "",
    vendor_phone: "",
    invoice_number: "",
    property_id: "",
    property_name: "",
    notes: "",
    added_by: "",
  });

  const [lineItems, setLineItems] = useState<PurchaseItem[]>([
    {
      item_name: "",
      category: "",
      quantity: 0,
      unit_price: 0,
      total_price: 0,
      notes: "",
    },
  ]);

  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    amount: 0,
    payment_method: "Cash",
    payment_reference: "",
    paid_by: "",
    payment_notes: "",
  });

  // Selection
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(
    new Set(),
  );

  useEffect(() => {
  if (sidebarOpen) {
    setDraftPropertyFilter(propertyFilter);
    setDraftStatusFilter(statusFilter);
    setDraftVendorFilter(vendorFilter);
    setDraftAmountFilter(amountFilter);
    setDraftDateFilter(dateFilter);
  }
}, [sidebarOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load categories from master
  const loadCategories = useCallback(async () => {
    try {
      const res = await getMasterItemsByTab("Properties");
      const list = Array.isArray(res.data) ? res.data : [];
      const catItem = list.find(
        (i: any) => i.name?.toLowerCase() === "category",
      );
      if (!catItem) return;
      const vRes = await getMasterValues(catItem.id);
      const values = Array.isArray(vRes.data)
        ? vRes.data
        : Array.isArray(vRes)
          ? vRes
          : [];
      setCategories(
        values
          .filter((v: any) => v.isactive === 1 || v.is_active === 1)
          .map((v: any) => ({
            id: String(v.id),
            name: v.value || v.name || "",
          })),
      );
    } catch (err) {
      console.error("Could not load categories:", err);
    }
  }, []);

  const loadVendors = useCallback(async () => {
  try {
    // Fetch the "Vendors" item from the "Common" tab
    const res = await getMasterItemsByTab("Common");
    const list = Array.isArray(res.data) ? res.data : [];
    const vendorItem = list.find(
      (i: any) => i.name?.toLowerCase() === "vendors"
    );
    if (!vendorItem) return;
    const vRes = await getMasterValues(vendorItem.id);
    const values = Array.isArray(vRes.data) ? vRes.data : Array.isArray(vRes) ? vRes : [];
    setVendors(
      values
        .filter((v: any) => v.isactive === 1 || v.is_active === 1)
        .map((v: any) => ({
          id: String(v.id),
          name: v.value || v.name || "",
          phone: v.phone || v.phone_number || "", // if phone field exists
        }))
    );
  } catch (err) {
    console.error("Could not load vendors:", err);
  }
}, []);

const loadInventoryMappings = useCallback(async () => {
  setMappingsLoading(true);
  try {
    const res = await getInventoryMappingsGrouped();
    setInventoryMappings(res?.data || []);
  } catch (err) {
    console.error('Could not load inventory mappings:', err);
  } finally {
    setMappingsLoading(false);
  }
}, [])


  // Helper to get subcategories for a category (case‑insensitive, trimmed)
  const getSubcategoriesForCategory = (categoryName: string) => {
    if (!categoryName) return [];
    const mapping = inventoryMappings.find(
      (m) =>
        m.category_name.trim().toLowerCase() ===
        categoryName.trim().toLowerCase(),
    );
    return mapping?.subcategories || [];
  };

  // Load properties
  const loadProperties = useCallback(async () => {
    try {
      const res = await listProperties({ is_active: true });
      const list = res?.data?.data || res?.data || (res as any)?.results || [];
      const arr = Array.isArray(list) ? list : Object.values(list);
      setProperties(arr.map((p: any) => ({ id: String(p.id), name: p.name })));
    } catch (err) {
      console.error("Could not load properties:", err);
    }
  }, []);

  // Load purchases and stats
  const loadAll = useCallback(
    async (page = currentPage) => {
      setLoading(true);
      try {
        const limit = pageSize === "All" ? 999999 : pageSize;
        const filters: any = {};
        if (propertyFilter !== "all") filters.property_id = propertyFilter;
        if (statusFilter !== "all") filters.payment_status = statusFilter;
        if (dateFilter.from) filters.from_date = dateFilter.from;
        if (dateFilter.to) filters.to_date = dateFilter.to;
        filters.page = page;
        filters.limit = limit;

        const [purchasesRes, statsRes] = await Promise.all([
          getPurchases(filters),
          getPurchaseStats(),
        ]);

        // Parse items (existing logic)
        const purchasesData = purchasesRes.data || [];
        purchasesData.forEach((p) => {
          if (p.items) {
            if (typeof p.items === "string") {
              try {
                p.purchase_items = JSON.parse(p.items);
              } catch {
                p.purchase_items = [];
              }
            } else if (Array.isArray(p.items)) {
              p.purchase_items = p.items;
            }
          } else {
            p.purchase_items = [];
          }
        });

        setPurchases(purchasesData);
        setStats(statsRes.data || stats);

        // Set pagination meta
        const total =
          purchasesRes.pagination?.totalItems ?? purchasesData.length;
        setTotalItems(total);
        const computedTotalPages =
          purchasesRes.pagination?.totalPages ??
          Math.ceil(total / (pageSize === "All" ? total : pageSize));
        setTotalPages(computedTotalPages);
        setCurrentPage(page);
      } catch (err: any) {
        console.error("Error loading purchases:", err);
        toast.error(err.message || "Failed to load purchases");
      } finally {
        setLoading(false);
      }
    },
    [propertyFilter, statusFilter, dateFilter, pageSize],
  );

  useEffect(() => {
    loadCategories();
    loadProperties();
    loadInventoryMappings();
    loadVendors(); 
  }, []);

  useEffect(() => {
    loadAll(1);
  }, [loadAll]);

  // Filtered items with column search
const filteredPurchases = useMemo(() => {
  return purchases.filter((p) => {
    const cs = colSearch;
    const invOk =
      !cs.invoice ||
      p.invoice_number?.toLowerCase().includes(cs.invoice.toLowerCase());
    const venOk =
      !cs.vendor ||
      p.vendor_name?.toLowerCase().includes(cs.vendor.toLowerCase());
    const propOk =
      !cs.property ||
      (p.property_name || "")
        .toLowerCase()
        .includes(cs.property.toLowerCase());
    const amtOk = !cs.amount || String(p.total_amount).includes(cs.amount);
    const statOk =
      !cs.status ||
      p.payment_status?.toLowerCase().includes(cs.status.toLowerCase());

    const vendorFilterOk = vendorFilter === "all" || p.vendor_name === vendorFilter;
    const minOk = !amountFilter.min || p.total_amount >= Number(amountFilter.min);
    const maxOk = !amountFilter.max || p.total_amount <= Number(amountFilter.max);

    return invOk && venOk && propOk && amtOk && statOk && vendorFilterOk && minOk && maxOk;
  });
}, [purchases, colSearch, vendorFilter, amountFilter]);

  //   const handleEdit = (purchase: MaterialPurchaseType) => {

  //   // Ensure purchase_items is properly set
  //   if (!purchase.purchase_items && purchase.items) {
  //     if (typeof purchase.items === 'string') {
  //       try {
  //         purchase.purchase_items = JSON.parse(purchase.items);
  //       } catch (e) {
  //         console.error('Error parsing items in handleEdit:', e);
  //         purchase.purchase_items = [];
  //       }
  //     } else if (Array.isArray(purchase.items)) {
  //       purchase.purchase_items = purchase.items;
  //     }
  //   }

  //   // Set form data with purchase details
  //   setFormData({
  //     purchase_date: purchase.purchase_date.split('T')[0] || purchase.purchase_date,
  //     vendor_name: purchase.vendor_name || '',
  //     vendor_phone: purchase.vendor_phone || '',
  //     invoice_number: purchase.invoice_number || '',
  //     property_id: String(purchase.property_id),
  //     property_name: purchase.property_name || '',
  //     notes: purchase.notes || ''
  //   });

  //   // Set line items
  //   if (purchase.purchase_items && purchase.purchase_items.length > 0) {
  //     setLineItems(purchase.purchase_items);
  //   } else {
  //     setLineItems([{
  //       item_name: '',
  //       category: '',
  //       quantity: 0,
  //       unit_price: 0,
  //       total_price: 0,
  //       notes: ''
  //     }]);
  //   }

  //   setEditPurchaseId(purchase.id);
  //   setShowEditForm(true);
  // };

  const handleEdit = (purchase: MaterialPurchaseType) => {
    // Ensure purchase_items is set
    if (!purchase.purchase_items && purchase.items) {
      if (typeof purchase.items === "string") {
        try {
          purchase.purchase_items = JSON.parse(purchase.items);
        } catch {
          purchase.purchase_items = [];
        }
      } else if (Array.isArray(purchase.items)) {
        purchase.purchase_items = purchase.items;
      }
    }

    // Map category IDs to names if needed (for editing)
    const mappedItems = (purchase.purchase_items || []).map((item: any) => {
      let categoryName = item.category;
      // If category is a numeric string, try to find the matching category name from inventoryMappings
      if (!isNaN(Number(categoryName)) && inventoryMappings.length > 0) {
        const found = inventoryMappings.find(
          (m) => String(m.category_id) === String(categoryName),
        );
        if (found) categoryName = found.category_name;
      }
      return { ...item, category: categoryName };
    });

    setFormData({
      purchase_date:
        purchase.purchase_date.split("T")[0] || purchase.purchase_date,
      vendor_name: purchase.vendor_name || "",
      vendor_phone: purchase.vendor_phone || "",
      invoice_number: purchase.invoice_number || "",
      property_id: String(purchase.property_id),
      property_name: purchase.property_name || "",
      notes: purchase.notes || "",
      added_by: purchase.added_by || user?.name || "",
    });

    setLineItems(
      mappedItems.length
        ? mappedItems
        : [
            {
              item_name: "",
              category: "",
              quantity: 0,
              unit_price: 0,
              total_price: 0,
              notes: "",
            },
          ],
    );

    setEditPurchaseId(purchase.id);
    setShowEditForm(true);
  };
  // Form calculations
  const getTotalAmount = () => {
    return lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        item_name: "",
        category: "",
        quantity: 0,
        unit_price: 0,
        total_price: 0,
        notes: "",
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    const updated = [...lineItems];
    updated.splice(index, 1);
    setLineItems(updated);
  };

 const updateLineItem = (
  index: number,
  field: keyof PurchaseItem,
  value: any,
) => {
  setLineItems(prev => {
    const updated = [...prev];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "quantity" || field === "unit_price") {
      updated[index].total_price =
        (updated[index].quantity || 0) * (updated[index].unit_price || 0);
    }
    return updated;
  });
};
  // CRUD Operations
  const openAdd = () => {
    setFormData({
      purchase_date: new Date().toISOString().split("T")[0],
      vendor_name: "",
      vendor_phone: "",
      invoice_number: "",
      property_id: "",
      property_name: "",
      notes: "",
      added_by: user?.name || "",
    });
    setLineItems([
      {
        item_name: "",
        category: "",
        quantity: 0,
        unit_price: 0,
        total_price: 0,
        notes: "",
      },
    ]);
    setShowForm(true);
  };

  const handleViewDetails = (purchase: MaterialPurchaseType) => {
    // 🔥 Ensure purchase_items is properly set
    if (!purchase.purchase_items && purchase.items) {
      if (typeof purchase.items === "string") {
        try {
          purchase.purchase_items = JSON.parse(purchase.items);
        } catch (e) {
          console.error("Error parsing items in handleViewDetails:", e);
          purchase.purchase_items = [];
        }
      } else if (Array.isArray(purchase.items)) {
        purchase.purchase_items = purchase.items;
      }
    }

    // 🔥 Agar purchase_items abhi bhi undefined hai to items se try karo
    if (!purchase.purchase_items && purchase.items) {
      purchase.purchase_items = purchase.items as any;
    }

    setSelectedPurchase(purchase);
    setShowDetailsModal(true);
  };

  const handleAddPayment = (purchase: MaterialPurchaseType) => {
    setSelectedPurchase(purchase);
    const remaining = purchase.balance_amount || purchase.total_amount || 0;
    setPaymentData({
      payment_date: new Date().toISOString().split("T")[0],
      amount: remaining,
      payment_method: "Cash",
      payment_reference: "",
      paid_by: "",
      payment_notes: "",
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPurchase = async () => {
    if (
      !formData.vendor_name ||
      !formData.invoice_number ||
      !formData.property_id
    ) {
      toast.error("Vendor name, invoice number, and property are required");
      return;
    }
// Validate phone number if provided
if (formData.vendor_phone && !/^\d{10}$/.test(formData.vendor_phone)) {
  toast.error('Vendor phone must be exactly 10 digits');
  return;
}
    if (
      lineItems.length === 0 ||
      lineItems.some((item) => !item.item_name || item.quantity <= 0)
    ) {
      toast.error("Please add at least one valid item");
      return;
    }

    setSubmitting(true);
    try {
      const totalAmount = getTotalAmount();
      const itemsSummary = lineItems
        .map((item) => `${item.item_name} (${item.quantity})`)
        .join(", ");

      const selectedProperty = properties.find(
        (p) => p.id === formData.property_id,
      );

      const payload: CreatePurchasePayload = {
        purchase_date: formData.purchase_date,
        vendor_name: formData.vendor_name,
        vendor_phone: formData.vendor_phone,
        invoice_number: formData.invoice_number,
        property_id: parseInt(formData.property_id),
        property_name: selectedProperty?.name || formData.property_name,
        notes: formData.notes,
        items: lineItems,
        items_summary: itemsSummary,
        total_amount: totalAmount,
        paid_amount: 0,
        added_by: formData.added_by || user?.name || "",
      };

      const response = await createPurchase(payload);

      setShowForm(false);
      await loadAll();
      toast.success("Purchase created successfully");
    } catch (err: any) {
      console.error("Error creating purchase:", err);
      toast.error(err.message || "Failed to create purchase");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePurchase = async () => {
    if (
      !formData.vendor_name ||
      !formData.invoice_number ||
      !formData.property_id
    ) {
      toast.error("Vendor name, invoice number, and property are required");
      return;
    }
// Validate phone number if provided
if (formData.vendor_phone && !/^\d{10}$/.test(formData.vendor_phone)) {
  toast.error('Vendor phone must be exactly 10 digits');
  return;
}
    if (
      lineItems.length === 0 ||
      lineItems.some((item) => !item.item_name || item.quantity <= 0)
    ) {
      toast.error("Please add at least one valid item");
      return;
    }

    setEditSubmitting(true);
    try {
      const totalAmount = getTotalAmount();
      const itemsSummary = lineItems
        .map((item) => `${item.item_name} (${item.quantity})`)
        .join(", ");

      const selectedProperty = properties.find(
        (p) => p.id === formData.property_id,
      );

      const payload: CreatePurchasePayload = {
        purchase_date: formData.purchase_date,
        vendor_name: formData.vendor_name,
        vendor_phone: formData.vendor_phone,
        invoice_number: formData.invoice_number,
        property_id: parseInt(formData.property_id),
        property_name: selectedProperty?.name || formData.property_name,
        notes: formData.notes,
        items: lineItems,
        items_summary: itemsSummary,
        total_amount: totalAmount,
        paid_amount: 0,
        added_by: formData.added_by || user?.name || "", 
      };

      // If you want to preserve the paid amount, you'd need to get it from the original purchase
      if (editPurchaseId) {
        const originalPurchase = purchases.find((p) => p.id === editPurchaseId);
        if (originalPurchase) {
          payload.paid_amount = originalPurchase.paid_amount || 0;
        }
      }

      await updatePurchase(editPurchaseId!, payload);

      setShowEditForm(false);
      setEditPurchaseId(null);
      await loadAll();
      toast.success("Purchase updated successfully");
    } catch (err: any) {
      console.error("Error updating purchase:", err);
      toast.error(err.message || "Failed to update purchase");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedPurchase) return;

    const remaining =
      selectedPurchase.balance_amount || selectedPurchase.total_amount || 0;
    if (paymentData.amount > remaining) {
      toast.error(
        `Payment amount cannot exceed remaining balance: ₹${remaining.toLocaleString("en-IN")}`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload: AddPaymentPayload = {
        payment_date: paymentData.payment_date,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        paid_by: paymentData.paid_by,
        payment_reference: paymentData.payment_reference,
        payment_notes: paymentData.payment_notes,
      };

      await addPayment(selectedPurchase.id, payload);
      setShowPaymentModal(false);
      await loadAll();
      toast.success(
        `Payment of ₹${paymentData.amount.toLocaleString("en-IN")} added successfully`,
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to add payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number, invoiceNumber?: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete purchase "${invoiceNumber || id}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(0,0,0,0.4)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton:
          "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton:
          "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
        actions: "flex justify-center gap-2 mt-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await deletePurchase(id);
      await loadAll();

      Swal.fire({
        title: "Deleted!",
        text: "Purchase has been deleted successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-green-600",
          htmlContainer: "text-xs text-gray-600",
        },
      });
    } catch (err: any) {
      console.error("Error deleting purchase:", err);
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to delete purchase",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-red-600",
          htmlContainer: "text-xs text-gray-600",
          confirmButton:
            "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
        },
        buttonsStyling: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      Swal.fire({
        title: "No items selected",
        text: "Please select at least one purchase to delete.",
        icon: "info",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-blue-600",
          htmlContainer: "text-xs text-gray-600",
          confirmButton:
            "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
        },
        buttonsStyling: false,
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedItems.size} selected purchase(s). This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(0,0,0,0.4)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton:
          "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton:
          "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
        actions: "flex justify-center gap-2 mt-4",
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await bulkDeletePurchases(Array.from(selectedItems));
      setSelectedItems(new Set());
      await loadAll();

      Swal.fire({
        title: "Deleted!",
        text: `${selectedItems.size} purchase(s) have been deleted successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-green-600",
          htmlContainer: "text-xs text-gray-600",
        },
      });
    } catch (err: any) {
      console.error("Error bulk deleting purchases:", err);
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to delete purchases",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        width: "350px",
        padding: "1rem",
        customClass: {
          popup: "rounded-xl shadow-2xl",
          title: "text-base font-bold text-red-600",
          htmlContainer: "text-xs text-gray-600",
          confirmButton:
            "px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors",
        },
        buttonsStyling: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredPurchases.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredPurchases.map((p) => p.id)));
    }
  };

  const toggleSelectItem = (id: string | number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleExport = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // 1. Main purchases sheet
      const purchasesData = filteredPurchases.map((p) => ({
        Date: new Date(p.purchase_date).toLocaleDateString("en-IN"),
        "Invoice #": p.invoice_number,
        "Vendor Name": p.vendor_name,
        "Vendor Phone": p.vendor_phone || "",
        Property: p.property_name,
        "Total Amount (₹)": p.total_amount,
        "Paid Amount (₹)": p.paid_amount || 0,
        "Balance (₹)": p.balance_amount || p.total_amount,
        "Payment Status": p.payment_status,
        "Payment Method": p.payment_method || "",
        "Paid By": p.paid_by || "",
        "Payment Reference": p.payment_reference || "",
        Notes: p.notes || "",
        "Purchase ID": p.id,
      }));

      const purchasesWs = XLSX.utils.json_to_sheet(purchasesData);

      // Auto-size columns
      const purchasesColWidths = [];
      const purchasesHeaders = Object.keys(purchasesData[0] || {});
      purchasesHeaders.forEach((header) => {
        const maxLength = Math.max(
          header.length,
          ...purchasesData.map((row) => String(row[header] || "").length),
        );
        purchasesColWidths.push({ wch: Math.min(maxLength + 2, 50) });
      });
      purchasesWs["!cols"] = purchasesColWidths;

      XLSX.utils.book_append_sheet(wb, purchasesWs, "Purchases");

      // 2. Items sheet - all items from all purchases
      const allItems: any[] = [];
      filteredPurchases.forEach((purchase) => {
        // Parse items properly
        let itemsToShow = purchase.purchase_items;
        if ((!itemsToShow || itemsToShow.length === 0) && purchase.items) {
          if (typeof purchase.items === "string") {
            try {
              itemsToShow = JSON.parse(purchase.items);
            } catch (e) {
              itemsToShow = [];
            }
          } else if (Array.isArray(purchase.items)) {
            itemsToShow = purchase.items;
          }
        }

        itemsToShow?.forEach((item: any) => {
          allItems.push({
            "Invoice #": purchase.invoice_number,
            "Purchase Date": new Date(
              purchase.purchase_date,
            ).toLocaleDateString("en-IN"),
            Vendor: purchase.vendor_name,
            Property: purchase.property_name,
            "Item Name": item.item_name || "",
            Category: item.category || "",
            Quantity: item.quantity || 0,
            "Unit Price (₹)": item.unit_price || 0,
            "Total Price (₹)": item.total_price || 0,
            "Item Notes": item.notes || "",
          });
        });
      });

      if (allItems.length > 0) {
        const itemsWs = XLSX.utils.json_to_sheet(allItems);
        XLSX.utils.book_append_sheet(wb, itemsWs, "Items");
      }

      // 3. Summary sheet
      const totalPurchases = filteredPurchases.length;
      const totalAmount = filteredPurchases.reduce(
        (sum, p) => sum + p.total_amount,
        0,
      );
      const totalPaid = filteredPurchases.reduce(
        (sum, p) => sum + (p.paid_amount || 0),
        0,
      );
      const totalBalance = filteredPurchases.reduce(
        (sum, p) => sum + (p.balance_amount || p.total_amount),
        0,
      );

      const pendingCount = filteredPurchases.filter(
        (p) => p.payment_status === "Pending",
      ).length;
      const partialCount = filteredPurchases.filter(
        (p) => p.payment_status === "Partial",
      ).length;
      const paidCount = filteredPurchases.filter(
        (p) => p.payment_status === "Paid",
      ).length;

      const summaryData = [
        ["Metric", "Value"],
        ["Total Purchases", totalPurchases],
        ["Total Amount (₹)", totalAmount.toLocaleString("en-IN")],
        ["Total Paid (₹)", totalPaid.toLocaleString("en-IN")],
        ["Total Balance (₹)", totalBalance.toLocaleString("en-IN")],
        [
          "Collection Rate",
          totalAmount > 0
            ? `${((totalPaid / totalAmount) * 100).toFixed(1)}%`
            : "0%",
        ],
        ["Pending Purchases", pendingCount],
        ["Partial Purchases", partialCount],
        ["Paid Purchases", paidCount],
        [
          "Unique Vendors",
          new Set(filteredPurchases.map((p) => p.vendor_name)).size,
        ],
        [
          "Unique Properties",
          new Set(filteredPurchases.map((p) => p.property_name)).size,
        ],
        ["Export Date", new Date().toLocaleString("en-IN")],
      ];

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      // 4. Vendor summary sheet
      const vendorMap = new Map();
      filteredPurchases.forEach((p) => {
        if (!vendorMap.has(p.vendor_name)) {
          vendorMap.set(p.vendor_name, {
            vendor: p.vendor_name,
            phone: p.vendor_phone || "",
            purchases: 0,
            total: 0,
            paid: 0,
            balance: 0,
          });
        }
        const vendor = vendorMap.get(p.vendor_name);
        vendor.purchases++;
        vendor.total += p.total_amount;
        vendor.paid += p.paid_amount || 0;
        vendor.balance += p.balance_amount || p.total_amount;
      });

      const vendorData = Array.from(vendorMap.values()).map((v) => ({
        Vendor: v.vendor,
        Phone: v.phone,
        "No. of Purchases": v.purchases,
        "Total Amount (₹)": v.total,
        "Paid Amount (₹)": v.paid,
        "Balance (₹)": v.balance,
        "Payment Rate":
          v.total > 0 ? `${((v.paid / v.total) * 100).toFixed(1)}%` : "0%",
      }));

      if (vendorData.length > 0) {
        const vendorWs = XLSX.utils.json_to_sheet(vendorData);
        XLSX.utils.book_append_sheet(wb, vendorWs, "Vendor Summary");
      }

      // 5. Property summary sheet
      const propertyMap = new Map();
      filteredPurchases.forEach((p) => {
        if (!propertyMap.has(p.property_name)) {
          propertyMap.set(p.property_name, {
            property: p.property_name,
            purchases: 0,
            total: 0,
            paid: 0,
            balance: 0,
          });
        }
        const prop = propertyMap.get(p.property_name);
        prop.purchases++;
        prop.total += p.total_amount;
        prop.paid += p.paid_amount || 0;
        prop.balance += p.balance_amount || p.total_amount;
      });

      const propertyData = Array.from(propertyMap.values()).map((p) => ({
        Property: p.property,
        "No. of Purchases": p.purchases,
        "Total Amount (₹)": p.total,
        "Paid Amount (₹)": p.paid,
        "Balance (₹)": p.balance,
        "Payment Rate":
          p.total > 0 ? `${((p.paid / p.total) * 100).toFixed(1)}%` : "0%",
      }));

      if (propertyData.length > 0) {
        const propertyWs = XLSX.utils.json_to_sheet(propertyData);
        XLSX.utils.book_append_sheet(wb, propertyWs, "Property Summary");
      }

      // 6. Payment status sheet
      const statusData = [
        [
          "Payment Status",
          "Count",
          "Total Amount (₹)",
          "Paid Amount (₹)",
          "Balance (₹)",
        ],
        [
          "Pending",
          pendingCount,
          filteredPurchases
            .filter((p) => p.payment_status === "Pending")
            .reduce((sum, p) => sum + p.total_amount, 0),
          filteredPurchases
            .filter((p) => p.payment_status === "Pending")
            .reduce((sum, p) => sum + (p.paid_amount || 0), 0),
          filteredPurchases
            .filter((p) => p.payment_status === "Pending")
            .reduce((sum, p) => sum + (p.balance_amount || p.total_amount), 0),
        ],
        [
          "Partial",
          partialCount,
          filteredPurchases
            .filter((p) => p.payment_status === "Partial")
            .reduce((sum, p) => sum + p.total_amount, 0),
          filteredPurchases
            .filter((p) => p.payment_status === "Partial")
            .reduce((sum, p) => sum + (p.paid_amount || 0), 0),
          filteredPurchases
            .filter((p) => p.payment_status === "Partial")
            .reduce((sum, p) => sum + (p.balance_amount || p.total_amount), 0),
        ],
        [
          "Paid",
          paidCount,
          filteredPurchases
            .filter((p) => p.payment_status === "Paid")
            .reduce((sum, p) => sum + p.total_amount, 0),
          filteredPurchases
            .filter((p) => p.payment_status === "Paid")
            .reduce((sum, p) => sum + (p.paid_amount || 0), 0),
          filteredPurchases
            .filter((p) => p.payment_status === "Paid")
            .reduce((sum, p) => sum + (p.balance_amount || p.total_amount), 0),
        ],
      ];

      const statusWs = XLSX.utils.aoa_to_sheet(statusData);
      XLSX.utils.book_append_sheet(wb, statusWs, "Payment Status");

      // 7. Monthly summary sheet
      const monthlyMap = new Map();
      filteredPurchases.forEach((p) => {
        const month = new Date(p.purchase_date).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        });
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, {
            month,
            purchases: 0,
            total: 0,
            paid: 0,
            balance: 0,
          });
        }
        const m = monthlyMap.get(month);
        m.purchases++;
        m.total += p.total_amount;
        m.paid += p.paid_amount || 0;
        m.balance += p.balance_amount || p.total_amount;
      });

      const monthlyData = Array.from(monthlyMap.values()).map((m) => ({
        Month: m.month,
        "No. of Purchases": m.purchases,
        "Total Amount (₹)": m.total,
        "Paid Amount (₹)": m.paid,
        "Balance (₹)": m.balance,
      }));

      if (monthlyData.length > 0) {
        const monthlyWs = XLSX.utils.json_to_sheet(monthlyData);
        XLSX.utils.book_append_sheet(wb, monthlyWs, "Monthly Summary");
      }

      // Generate filename
      const filename = `purchases_export_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      toast.success(
        `Exported ${filteredPurchases.length} purchases successfully`,
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export purchases");
    }
  };

 const handleDownloadPDF = (purchase: MaterialPurchaseType) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;

  // ── White header (reduced height) ──
  const headerHeight = 30;
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, headerHeight, "F");
  doc.setDrawColor(226, 232, 240);
  doc.line(0, headerHeight, pageWidth, headerHeight);

  // Baseline for the main header elements (logo, site name, invoice)
  const yBase = headerHeight / 2 + 2; // ~17

  // 1. Logo — left
  if (siteSettings?.logo) {
    try {
      const imgProps = doc.getImageProperties(siteSettings.logo);
      const maxW = 30;
      const maxH = 30;
      const ratio = Math.min(maxW / imgProps.width, maxH / imgProps.height);
      const imgW = imgProps.width * ratio;
      const imgH = imgProps.height * ratio;
      const xLogo = margin + (maxW - imgW) / 2;
      const yLogo = yBase - imgH / 2;
      doc.addImage(
        siteSettings.logo,
        imgProps.fileType || "PNG",
        xLogo,
        yLogo,
        imgW,
        imgH
      );
    } catch (e) {}
  }

  // 2. Site name — center (bold, large)
  const siteName = siteSettings?.siteName || "MATERIAL PURCHASE";
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(siteName, pageWidth / 2, yBase, { align: "center" });

// 3. Invoice number — right (combined label + value, one line)
// Invoice Label
doc.setFontSize(8);
doc.setFont("helvetica", "normal");
doc.setTextColor(148, 163, 184);
doc.text("Invoice No.", pageWidth - margin, yBase - 3, {
  align: "right",
});

// Invoice Number (next line)
doc.setFontSize(10);
doc.setFont("helvetica", "bold");
doc.setTextColor(30, 41, 59);
doc.text(purchase.invoice_number || "—", pageWidth - margin, yBase + 2, {
  align: "right",
});

  // 4. Subtitle — "Material Purchase Receipt" below the main line
  const subtitleY = yBase + 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Material Purchase Receipt", pageWidth / 2, subtitleY, { align: "center" });

  // ── Start content with minimal gap ──
  let yPos = headerHeight + 4; // was 40, now ~34

const pageHeight = doc.internal.pageSize.getHeight();

doc.saveGraphicsState();
doc.setGState(new doc.GState({ opacity: 0.09 }));
doc.setFont("helvetica", "bold");
doc.setFontSize(56);
doc.setTextColor(100, 116, 139);

doc.text(
  (siteSettings.siteName?.split(" ")[0] || "ROOMAC").toUpperCase(),
  pageWidth / 2,
  pageHeight / 2,
  {
    align: "center",
    angle: 30,
  }
);

doc.restoreGraphicsState();

  // ── Meta bar (slightly shorter) ──
  const metaHeight = 11;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPos, pageWidth - margin * 2, metaHeight, "F");
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, yPos, pageWidth - margin * 2, metaHeight, "S");

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "bold");
  doc.text("PURCHASE DATE", margin + 3, yPos + 4);
  doc.text("PROPERTY", pageWidth / 2 - 20, yPos + 4);
  doc.text("STATUS", pageWidth - margin - 30, yPos + 4);

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(new Date(purchase.purchase_date).toLocaleDateString("en-IN"), margin + 3, yPos + 8.5);
  doc.text(purchase.property_name || "—", pageWidth / 2 - 20, yPos + 8.5);

  const statusColor: [number, number, number] =
    purchase.payment_status === "Paid" ? [22, 101, 52] :
    purchase.payment_status === "Partial" ? [146, 64, 14] : [153, 27, 27];
  doc.setTextColor(...statusColor);
  doc.setFont("helvetica", "bold");
  doc.text(purchase.payment_status?.toUpperCase() || "—", pageWidth - margin - 30, yPos + 8.5);

  yPos += metaHeight + 4; // ~ +15

  // ── Vendor / Added By (compact) ──
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "bold");
  doc.text("VENDOR", margin, yPos);
  doc.text("VENDOR PHONE", margin + 65, yPos);
  doc.text("ADDED BY", margin + 130, yPos);

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.text(purchase.vendor_name || "—", margin, yPos + 5);
  doc.text(purchase.vendor_phone || "—", margin + 65, yPos + 5);
  doc.text(purchase.added_by || "—", margin + 130, yPos + 5);

  yPos += 12; // reduced from 14

  // ── Items Table ──
  let itemsToShow = purchase.purchase_items;
  if ((!itemsToShow || itemsToShow.length === 0) && purchase.items) {
    if (typeof purchase.items === "string") {
      try { itemsToShow = JSON.parse(purchase.items); } catch (e) { itemsToShow = []; }
    } else if (Array.isArray(purchase.items)) {
      itemsToShow = purchase.items;
    }
  }

  const itemsData = (itemsToShow || []).map((item: any, idx: number) => {
    const qty = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const totalPrice = Number(item.total_price) || 0;
    return [
      String(idx + 1),
      item.item_name || "-",
      item.category || "-",
      qty.toString(),
      unitPrice.toLocaleString("en-IN"),
      totalPrice.toLocaleString("en-IN"),
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Item Name", "Category", "Qty", "Price", "Amount"]],
    body: itemsData,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2, textColor: [51, 65, 85] },
    headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: "bold", fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 58 },
      2: { cellWidth: 35 },
      3: { cellWidth: 18, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 30, halign: "right" },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 6;

  // ── Payment info (only if paid amount exists) ──
  if (purchase.paid_amount && Number(purchase.paid_amount) > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 91, 219);
    doc.text("Payment Information", margin, yPos);
    yPos += 4;

    autoTable(doc, {
      startY: yPos,
      head: [["Payment Date", "Mode", "Reference", "Paid By", "Amount"]],
      body: [[
        purchase.payment_date ? new Date(purchase.payment_date).toLocaleDateString("en-IN") : "—",
        purchase.payment_method || "—",
        purchase.payment_reference || "—",
        purchase.paid_by || "—",
        `Rs. ${Number(purchase.paid_amount || 0).toLocaleString("en-IN")}`,
      ]],
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2, textColor: [51, 65, 85] },
      headStyles: { fillColor: [236, 253, 245], textColor: [22, 101, 52], fontStyle: "bold", fontSize: 7.5 },
      columnStyles: { 4: { halign: "right", fontStyle: "bold", textColor: [22, 101, 52] } },
    });

    yPos = (doc as any).lastAutoTable.finalY + 6;
  }

  // ── Totals block ──
  const totalsX = pageWidth - margin - 62;
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.text("Total Amount", totalsX, yPos);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`Rs. ${(Number(purchase.total_amount) || 0).toLocaleString("en-IN")}`, pageWidth - margin, yPos, { align: "right" });
  yPos += 5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Paid", totalsX, yPos);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text(`Rs. ${(Number(purchase.paid_amount) || 0).toLocaleString("en-IN")}`, pageWidth - margin, yPos, { align: "right" });
  yPos += 5;

  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX, yPos - 2, pageWidth - margin, yPos - 2);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.text("Balance Due", totalsX, yPos + 3);
  doc.setTextColor(217, 119, 6);
  doc.text(
    `Rs. ${(Number(purchase.balance_amount) || Number(purchase.total_amount) || 0).toLocaleString("en-IN")}`,
    pageWidth - margin, yPos + 3, { align: "right" },
  );
  yPos += 10;





  // ── Notes ──
  if (purchase.notes) {
    doc.setFillColor(254, 252, 232);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 14, 2, 2, "F");
    doc.setFontSize(7);
    doc.setTextColor(161, 98, 7);
    doc.setFont("helvetica", "bold");
    doc.text("NOTES", margin + 3, yPos + 4);
    doc.setFontSize(8);
    doc.setTextColor(113, 63, 18);
    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(purchase.notes, pageWidth - margin * 2 - 6);
    doc.text(notesLines.slice(0, 2), margin + 3, yPos + 9);
    yPos += 16;
  }

  
  // ── Footer ──
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 4;
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  const footerParts = [siteSettings.phone && `Tel: ${siteSettings.phone}`, siteSettings.email && `Email: ${siteSettings.email}`].filter(Boolean).join("  |  ");
  if (footerParts) doc.text(footerParts, pageWidth / 2, yPos, { align: "center" });
  doc.text(`Powered by ${siteSettings.siteName}`, pageWidth / 2, yPos + 4, { align: "center" });
  doc.text(
    `Generated on ${new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
    pageWidth / 2, yPos + 8, { align: "center" },
  );

  const fileName = `Purchase_${purchase.invoice_number.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(fileName);
};

  // Print function
  const handlePrint = (purchase: MaterialPurchaseType) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print");
      return;
    }

    const itemsToShow =
      purchase.purchase_items ||
      (typeof purchase.items === "string"
        ? JSON.parse(purchase.items)
        : purchase.items) ||
      [];

    const itemsRows = itemsToShow
      .map(
        (item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.item_name || "-"}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.category || "-"}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 0}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹ ${(item.unit_price || 0).toLocaleString("en-IN")}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹ ${(item.total_price || 0).toLocaleString("en-IN")}</td>
      </tr>
    `,
      )
      .join("");

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase ${purchase.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0; font-size: 12px; }
          .info-box { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .info-item .label { font-size: 11px; color: #6b7280; }
          .info-item .value { font-size: 14px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #3b82f6; color: white; padding: 10px; text-align: left; font-size: 12px; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          .total-row { font-weight: bold; background-color: #f3f4f6; }
          .summary { background-color: #eff6ff; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; }
          .summary-item { text-align: center; }
          .summary-item .label { font-size: 11px; color: #4b5563; }
          .summary-item .value { font-size: 16px; font-weight: bold; }
          .paid { color: #10b981; }
          .balance { color: #ef4444; }
          @media print {
            body { margin: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MATERIAL PURCHASE</h1>
          <p>Purchase Order Details</p>
        </div>

        <div class="info-box">
          <div class="info-item">
            <div class="label">Invoice Number</div>
            <div class="value">${purchase.invoice_number}</div>
          </div>
          <div class="info-item">
            <div class="label">Purchase Date</div>
            <div class="value">${new Date(purchase.purchase_date).toLocaleDateString("en-IN")}</div>
          </div>
          <div class="info-item">
            <div class="label">Vendor</div>
            <div class="value">${purchase.vendor_name}${purchase.vendor_phone ? `<br><small>${purchase.vendor_phone}</small>` : ""}</div>
          </div>
          <div class="info-item">
            <div class="label">Property</div>
            <div class="value">${purchase.property_name}</div>
          </div>
        </div>

        <h3 style="margin-bottom: 10px;">Purchase Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="4" style="text-align: right; padding: 8px;">Total Amount:</td>
              <td style="text-align: right; padding: 8px;">₹ ${purchase.total_amount.toLocaleString("en-IN")}</td>
            </tr>
          </tfoot>
        </table>

        <div class="summary">
          <div class="summary-item">
            <div class="label">Total</div>
            <div class="value">₹ ${purchase.total_amount.toLocaleString("en-IN")}</div>
          </div>
          <div class="summary-item">
            <div class="label">Paid</div>
            <div class="value paid">₹ ${(purchase.paid_amount || 0).toLocaleString("en-IN")}</div>
          </div>
          <div class="summary-item">
            <div class="label">Balance</div>
            <div class="value balance">₹ ${(purchase.balance_amount || purchase.total_amount).toLocaleString("en-IN")}</div>
          </div>
        </div>

        ${
          purchase.notes
            ? `
          <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 5px;">Notes</div>
            <div style="font-size: 12px;">${purchase.notes}</div>
          </div>
        `
            : ""
        }

        <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #9ca3af;">
          Generated on ${new Date().toLocaleString("en-IN")}
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button>
          <button onclick="window.close()" style="padding: 10px 20px; background-color: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-green-100 text-green-700 text-[9px] px-1.5">
            Paid
          </Badge>
        );
      case "Partial":
        return (
          <Badge className="bg-orange-100 text-orange-700 text-[9px] px-1.5">
            Partial
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-100 text-red-700 text-[9px] px-1.5">
            Pending
          </Badge>
        );
    }
  };

  const hasColSearch = Object.values(colSearch).some((v) => v !== "");
 const hasFilters =
  propertyFilter !== "all" ||
  statusFilter !== "all" ||
  vendorFilter !== "all" ||
  !!amountFilter.min ||
  !!amountFilter.max ||
  !!dateFilter.from ||
  !!dateFilter.to;
const activeFilterCount = [
  propertyFilter !== "all",
  statusFilter !== "all",
  vendorFilter !== "all",
  !!amountFilter.min,
  !!amountFilter.max,
  !!dateFilter.from,
  !!dateFilter.to,
].filter(Boolean).length;

const clearFilters = () => {
  setPropertyFilter("all");
  setStatusFilter("all");
  setVendorFilter("all");
  setAmountFilter({ min: "", max: "" });
  setDateFilter({ from: "", to: "" });
};

  const clearColSearch = () =>
    setColSearch({
      invoice: "",
      vendor: "",
      property: "",
      amount: "",
      status: "",
    });

  return (
    <div className="bg-gray-50 ">
      {/* Header */}
     <div className="sticky top-0 z-10 mb-2">
  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

    {/* LEFT - Stats */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-1">
      <StatCard
        title="Total Purchases"
        value={stats.total_purchases}
        icon={Boxes}
        color="bg-blue-600"
        bg="bg-gradient-to-br from-blue-50 to-blue-100"
      />
      <StatCard
        title="Total Amount"
        value={`₹${Number(stats.total_amount || 0).toLocaleString("en-IN")}`}
        icon={IndianRupee}
        color="bg-green-600"
        bg="bg-gradient-to-br from-green-50 to-green-100"
      />
      <StatCard
        title="Total Paid"
        value={`₹${Number(stats.total_paid || 0).toLocaleString("en-IN")}`}
        icon={TrendingDown}
        color="bg-orange-600"
        bg="bg-gradient-to-br from-orange-50 to-orange-100"
      />
      <StatCard
        title="Balance Due"
        value={`₹${Number(stats.total_balance || 0).toLocaleString("en-IN")}`}
        icon={AlertTriangle}
        color="bg-red-600"
        bg="bg-gradient-to-br from-red-50 to-red-100"
      />
    </div>

    {/* RIGHT - Action Buttons */}
    <div className="flex items-center justify-end gap-2 shrink-0 lg:mt-8">
      <button
        onClick={() => setSidebarOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white font-medium transition-colors
          ${
            sidebarOpen || hasFilters
              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
      >
        <Filter className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Filters</span>
        {activeFilterCount > 0 && (
          <span
            className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
              sidebarOpen || hasFilters
                ? "bg-white text-blue-600"
                : "bg-blue-600 text-white"
            }`}
          >
            {activeFilterCount}
          </span>
        )}
      </button>

      {can("export_material_purchase") && (
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white text-[11px] font-medium"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      )}

      {can("create_material_purchase") && (
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="">Add Purchase</span>
        </button>
      )}
    </div>

  </div>
</div>

      <div className="relative">
        <main className="p-0 sm:p-0">
          {selectedItems.size > 0 && (
            <div className="px-0 pb-2">
              <div className="flex items-center justify-between gap-3 border border-[#E2E8F4] rounded-xl px-3 py-2 min-h-[44px] bg-white">
                <span className="font-bold text-[#1A2B6D] text-sm whitespace-nowrap">
                  {selectedItems.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedItems(new Set())}
                    className="text-xs text-[#8892A4] hover:text-gray-600 px-2 py-1"
                  >
                    Clear
                  </button>
                  {can("delete_material_purchase") && (
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-xs font-bold text-[#DC2626] hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete {selectedItems.size}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <Card className="border rounded-lg shadow-sm overflow-hidden">
            {/* ── Table ── */}
<div className="flex flex-col" style={{ height: window.innerWidth < 640 ? '370px' : '520px' }}>              <div className="overflow-auto flex-1 min-h-0">
                <table
                  className="border-collapse text-[11px] font-sans"
                  style={{ tableLayout: "fixed", minWidth: "1100px", width: "100%" }}
                >
                 <colgroup>
  <col style={{ width: "34px" }} />   {/* checkbox */}
  <col style={{ width: "90px" }} />   {/* Date */}
  <col style={{ width: "110px" }} />  {/* Invoice # */}
  <col style={{ width: "120px" }} />  {/* Vendor Name */}
  <col style={{ width: "100px" }} />  {/* Vendor Phone */}
  <col style={{ width: "130px" }} />  {/* Property */}
  <col style={{ width: "90px" }} />   {/* Total */}
  <col style={{ width: "90px" }} />   {/* Paid */}
  <col style={{ width: "90px" }} />   {/* Balance */}
  <col style={{ width: "70px" }} />   {/* Status */}
  <col style={{ width: "100px" }} />  {/* Added By */}   ← NEW
  <col style={{ width: "140px" }} />  {/* Actions */}
</colgroup>

                  {/* ── STICKY THEAD ── */}
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-200 border-b border-gray-300">
                      <th className="px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
                        <input
                          type="checkbox"
                          checked={
                            selectedItems.size === filteredPurchases.length &&
                            filteredPurchases.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="w-3.5 h-3.5 cursor-pointer"
                        />
                      </th>
                      <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Date</span>
                      </th>
                      <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Invoice #</span>
                      </th>
                     <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Vendor Name</span>
</th>
<th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Vendor Phone</span>
</th>
                      <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Property</span>
                      </th>
                      <th className="px-1.5 py-1.5 text-right border-r border-gray-300 bg-gray-200">
                        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Total</span>
                      </th>
                      <th className="px-1.5 py-1.5 text-right border-r border-gray-300 bg-gray-200">
                        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Paid</span>
                      </th>
                      <th className="px-1.5 py-1.5 text-right border-r border-gray-300 bg-gray-200">
                        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Balance</span>
                      </th>
                      <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status</span>
                      </th>
                      <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Added By</span>
</th>
                      <th className="px-1.5 py-1.5 text-right bg-gray-200">
                        <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
                      </th>
                    </tr>
                    {/* Search row */}
                    <tr className="bg-white border-b border-gray-300">
                      <td className="p-1 border-r border-gray-200" />
                      <td className="p-1 border-r border-gray-200" />
                      <td className="p-1 border-r border-gray-200">
                        <input
                          placeholder="Search…"
                          value={colSearch.invoice}
                          onChange={(e) => setColSearch((prev) => ({ ...prev, invoice: e.target.value }))}
                          className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <input
                          placeholder="Search…"
                          value={colSearch.vendor}
                          onChange={(e) => setColSearch((prev) => ({ ...prev, vendor: e.target.value }))}
                          className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200" />

                      <td className="p-1 border-r border-gray-200">
                        <input
                          placeholder="Search…"
                          value={colSearch.property}
                          onChange={(e) => setColSearch((prev) => ({ ...prev, property: e.target.value }))}
                          className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200">
                        <input
                          placeholder="Amount…"
                          value={colSearch.amount}
                          onChange={(e) => setColSearch((prev) => ({ ...prev, amount: e.target.value }))}
                          className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0 text-right"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200" />
                      <td className="p-1 border-r border-gray-200" />
                      <td className="p-1 border-r border-gray-200">
                        <input
                          placeholder="Status…"
                          value={colSearch.status}
                          onChange={(e) => setColSearch((prev) => ({ ...prev, status: e.target.value }))}
                          className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                        />
                      </td>
                      <td className="p-1 border-r border-gray-200" />

                      <td className="p-1" />
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={12} className="text-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Loading purchases…</p>
                        </td>
                      </tr>
                    ) : filteredPurchases.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-12">
                          <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">No purchases found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </td>
                      </tr>
                    ) : (
                      filteredPurchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-1.5 py-1.5 text-center border-r border-slate-200">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(purchase.id)}
                              onChange={() => toggleSelectItem(purchase.id)}
                              className="w-3.5 h-3.5 cursor-pointer"
                            />
                          </td>
                          <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
                            {new Date(purchase.purchase_date).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-1.5 py-1.5 text-[11px] font-semibold text-slate-800 border-r border-slate-200">
                            {purchase.invoice_number}
                          </td>
<td className="px-1.5 py-1.5 text-[11px] font-medium text-slate-700 border-r border-slate-200 truncate">
  {purchase.vendor_name}
</td>
<td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200">
  {purchase.vendor_phone || "—"}
</td>
                          <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200 truncate max-w-[140px]">
                            {purchase.property_name}
                          </td>
                          <td className="px-1.5 py-1.5 text-[11px] font-semibold text-slate-800 text-right border-r border-slate-200">
                            ₹{purchase.total_amount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-1.5 py-1.5 text-[11px] font-semibold text-green-600 text-right border-r border-slate-200">
                            ₹{(purchase.paid_amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-1.5 py-1.5 text-[11px] font-bold text-red-600 text-right border-r border-slate-200">
                            ₹{(purchase.balance_amount || purchase.total_amount).toLocaleString("en-IN")}
                          </td>
                          <td className="px-1.5 py-1.5 border-r border-slate-200">
                            {getStatusBadge(purchase.payment_status)}
                          </td>
                          <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-200 truncate">
  {purchase.added_by || "—"}
</td>
                          <td className="px-1.5 py-1.5 text-right">
                            <div className="flex justify-end gap-0.5">
                              {can("view_material_purchase") && (
                                <button
                                  title="View"
                                  className="w-6 h-6 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center justify-center transition-colors"
                                  onClick={() => handleViewDetails(purchase)}
                                >
                                  <Eye size={12} />
                                </button>
                              )}
                              {can("edit_material_purchase") && (
                                <button
                                  title="Edit"
                                  className="w-6 h-6 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 flex items-center justify-center transition-colors"
                                  onClick={() => handleEdit(purchase)}
                                >
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                              )}
                              {can("add_payment_material") && purchase.payment_status !== "Paid" && (
                                <button
                                  title="Add Payment"
                                  className="h-6 px-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 text-[10px] font-semibold"
                                  onClick={() => handleAddPayment(purchase)}
                                >
                                  <IndianRupee size={10} /> Pay
                                </button>
                              )}
                              {can("delete_material_purchase") && (
                                <button
                                  title="Delete"
                                  className="w-6 h-6 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
                                  onClick={() => handleDelete(purchase.id)}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Footer: pagination ── */}
            {!loading && totalItems > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Show</span>
                   <Select
                    value={String(pageSize)}
                    onValueChange={(val) => {
                      const newSize = val === "All" ? "All" : Number(val);
                      setPageSize(newSize as any);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-6 w-16 text-[10px] border-gray-200 px-1">
                      <SelectValue>{pageSize}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={String(size)} value={String(size)} className="text-xs">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>entries</span>
                  <span className="ml-2">
                    Showing {(currentPage - 1) * (pageSize === "All" ? totalItems : pageSize) + 1}–
                    {Math.min(currentPage * (pageSize === "All" ? totalItems : pageSize), totalItems)} of {totalItems}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadAll(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => loadAll(pageNum)}
                        className={`h-6 w-6 p-0 text-[10px] ${
                          currentPage === pageNum ? "bg-blue-600 text-white border-blue-600" : ""
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadAll(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </main>

        {/* Filter Sidebar */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed top-0 right-0 h-full z-40 w-[85vw] sm:w-96 bg-white shadow-2xl flex flex-col">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    Filters
                  </span>
                  {hasFilters && (
                    <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">
                      {activeFilterCount} active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-[10px] text-blue-200 hover:text-white font-semibold"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-full hover:bg-white/20 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

             <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Property */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Building className="h-3 w-3 text-indigo-500" /> Property
                    </p>
                    <Select value={draftPropertyFilter} onValueChange={(val) => setDraftPropertyFilter(val)}>
                      <SelectTrigger className="w-full h-8 text-xs border-gray-200">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Properties</SelectItem>
                        {properties.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <TrendingDown className="h-3 w-3 text-orange-500" /> Payment Status
                    </p>
                    <Select value={draftStatusFilter} onValueChange={(val) => setDraftStatusFilter(val as PaymentStatus)}>
  <SelectTrigger className="w-full h-8 text-xs border-gray-200">
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    <SelectItem value="Pending">Pending</SelectItem>
    <SelectItem value="Partial">Partial</SelectItem>
    <SelectItem value="Paid">Paid</SelectItem>
  </SelectContent>
</Select>
                  </div>

                  {/* Vendor — Advanced filter */}
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Package className="h-3 w-3 text-cyan-500" /> Vendor
                    </p>
                    <Select value={draftVendorFilter} onValueChange={(val) => setDraftVendorFilter(val)}>
  <SelectTrigger className="w-full h-8 text-xs border-gray-200">
    <SelectValue placeholder="Select vendor" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Vendors</SelectItem>
    {[...new Set(purchases.map((p) => p.vendor_name).filter(Boolean))].map((v) => (
      <SelectItem key={v} value={v}>{v}</SelectItem>
    ))}
  </SelectContent>
</Select>
                  </div>

                  {/* Amount Range — Advanced filter */}
                  {/* <div className="col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <IndianRupee className="h-3 w-3 text-emerald-500" /> Amount Range
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-0.5">Min ₹</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={amountFilter.min}
                          onChange={(e) => setAmountFilter((prev) => ({ ...prev, min: e.target.value }))}
                          className="h-7 text-[10px]"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-0.5">Max ₹</label>
                        <Input
                          type="number"
                          placeholder="Any"
                          value={amountFilter.max}
                          onChange={(e) => setAmountFilter((prev) => ({ ...prev, max: e.target.value }))}
                          className="h-7 text-[10px]"
                        />
                      </div>
                    </div>
                  </div> */}

                  {/* Date Range */}
                  <div className="col-span-2 mt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      Purchase Date
                    </p>
                    <div className="grid grid-cols-2 gap-2">
  <div>
    <label className="text-[10px] text-gray-500 block mb-0.5">From Date</label>
    <Input
      type="date"
      value={draftDateFilter.from}
      onChange={(e) => setDraftDateFilter((prev) => ({ ...prev, from: e.target.value }))}
      className="h-7 text-[10px]"
    />
  </div>
  <div>
    <label className="text-[10px] text-gray-500 block mb-0.5">To Date</label>
    <Input
      type="date"
      value={draftDateFilter.to}
      onChange={(e) => setDraftDateFilter((prev) => ({ ...prev, to: e.target.value }))}
      className="h-7 text-[10px]"
    />
  </div>
</div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
  <button
    onClick={() => {
      clearFilters();
      setDraftPropertyFilter("all");
      setDraftStatusFilter("all");
      setDraftVendorFilter("all");
      setDraftAmountFilter({ min: "", max: "" });
      setDraftDateFilter({ from: "", to: "" });
    }}
    disabled={!hasFilters}
    className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
  >
    Clear All
  </button>
  <button
    onClick={() => {
      setPropertyFilter(draftPropertyFilter);
      setStatusFilter(draftStatusFilter);
      setVendorFilter(draftVendorFilter);
      setAmountFilter(draftAmountFilter);
      setDateFilter(draftDateFilter);
      setSidebarOpen(false);
    }}
    className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-indigo-700"
  >
    Apply & Close
  </button>
</div>
            </aside>
          </>
        )}
      </div>

      {/* Add Purchase Dialog */}
      <Dialog
        open={showForm}
        onOpenChange={(v) => {
          if (!v) setShowForm(false);
        }}
      >
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]  text-white px-2 py-2 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">New Material Purchase</h2>
              <p className="text-xs text-blue-100">
                Fill in the purchase details
              </p>
            </div>
            <DialogClose asChild>
              <button className="p-1.5 rounded-full hover:bg-white/20 transition">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>

          <div className="p-2 overflow-y-auto max-h-[75vh] space-y-5">
            {/* Basic Info */}
            <div>
              <SH
                icon={<Package className="h-3 w-3" />}
                title="Purchase Info"
              />
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
               <div>
  <label className={L}>
    Vendor Name <span className="text-red-400">*</span>
  </label>
<Select
    value={formData.vendor_name}
    onValueChange={(v) => {
      const selected = vendors.find((vendor) => vendor.name === v);
      setFormData({
        ...formData,
        vendor_name: v,
        vendor_phone: selected?.phone || "",
      });
      setVendorSearchTerm("");
    }}
    onOpenChange={(open) => {
      if (open) requestAnimationFrame(() => vendorSearchRef.current?.focus());
    }}
  >
    <SelectTrigger className={F}>
      <SelectValue placeholder="Select vendor" />
    </SelectTrigger>
    <SelectContent position="popper" sideOffset={4} className="max-h-[300px] w-[var(--radix-select-trigger-width)]">
      <div className="sticky top-0 bg-white p-2 border-b z-10">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            ref={vendorSearchRef}
            placeholder="Search vendor..."
            className="pl-7 h-7 text-xs"
            value={vendorSearchTerm}
            onChange={(e) => setVendorSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="py-1">
        {vendors
          .filter((vendor) => vendor.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()))
          .map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.name}>
              {vendor.name}
            </SelectItem>
          ))}
      </div>
    </SelectContent>
  </Select>
</div>
                <div>
                  <label className={L}>Vendor Phone</label>
                  <Input
                    className={F}
                    placeholder="Phone number"
                    value={formData.vendor_phone}
                    maxLength={10}
                    minLength={10}
                   onChange={(e) => {
    const val = e.target.value.replace(/\D/g, ''); // Only digits
    setFormData({ ...formData, vendor_phone: val });
  }}
                  />
                </div>

                {/* Teen columns ek row mein - Purchase Date, Invoice Number, Property */}
                <div className="col-span-2 grid grid-cols-3 gap-3">
                  <div>
                    <label className={L}>
                      Purchase Date <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="date"
                      className={F}
                      value={formData.purchase_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchase_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={L}>
                      Invoice Number <span className="text-red-400">*</span>
                    </label>
                    <Input
                      className={F}
                      placeholder="INV-001"
                      value={formData.invoice_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoice_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={L}>
                      Property <span className="text-red-400">*</span>
                    </label>
                   <Select
  open={propertySelectOpen}
  onOpenChange={setPropertySelectOpen}
  value={formData.property_id}
  onValueChange={(v) => {
    const selected = properties.find((p) => p.id === v);
    setFormData((p) => ({
      ...p,
      property_id: v,
      property_name: selected?.name || "",
    }));
    setPropertySearchTerm("");
  }}
><SelectTrigger className={F}>
                        <Building className="h-3 w-3 text-gray-400 mr-1.5" />
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        sideOffset={4}
                        align="end"
                        className="max-h-[300px] w-[var(--radix-select-trigger-width)]"
                      >
                        {/* Search input */}
                        <div className="sticky top-0 bg-white p-2 border-b z-10">
                          <div className="relative">
                            <svg
                              className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                            <Input
                              ref={propertySearchRef}
                              placeholder="Search properties..."
                              className="pl-7 h-7 text-xs"
                              value={propertySearchTerm}
                              onChange={(e) =>
                                setPropertySearchTerm(e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* Properties list */}
                        <div className="py-1">
                          {properties
                            .filter((p) =>
                              p.name
                                .toLowerCase()
                                .includes(propertySearchTerm.toLowerCase()),
                            )
                            .map((p) => (
                              <SelectItem
                                key={p.id}
                                value={p.id}
                                className={SI}
                              >
                                {p.name}
                              </SelectItem>
                            ))}

                          {/* Show message if no results */}
                          {properties.filter((p) =>
                            p.name
                              .toLowerCase()
                              .includes(propertySearchTerm.toLowerCase()),
                          ).length === 0 && (
                            <div className="px-2 py-3 text-center">
                              <p className="text-xs text-gray-400">
                                No properties found
                              </p>
                            </div>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <SH
                  icon={<Boxes className="h-3 w-3" />}
                  title="Purchase Items"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addLineItem}
                  className="h-7 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-400"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div key={index}>
                    {/* Desktop View */}
<div className="hidden md:grid grid-cols-12 gap-2 p-2 bg-gray-50 rounded-lg">
  {/* Category Select */}
  <div className="col-span-3">
  <Select
      value={item.category || ''}
      onValueChange={v => {
        updateLineItem(index, 'category', v);
        updateLineItem(index, 'item_name', '');
        setCategorySearchTerm('');
      }}
      onOpenChange={(open) => {
        if (open) requestAnimationFrame(() => categorySearchRef.current?.focus());
      }}
    >
      <SelectTrigger className="h-7 text-[10px]">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={4} className="max-h-[250px] w-[var(--radix-select-trigger-width)]">
        <div className="sticky top-0 bg-white p-1.5 border-b z-10">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              ref={categorySearchRef}
              placeholder="Search category..."
              className="pl-6 h-6 text-[10px]"
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="py-1">
          {inventoryMappings
            .filter(c => c.category_name.toLowerCase().includes(categorySearchTerm.toLowerCase()))
            .map(c => (
              <SelectItem key={c.category_id} value={c.category_name} className="text-[10px]">
                {c.category_name}
              </SelectItem>
            ))}
        </div>
      </SelectContent>
    </Select>
  </div>

  {/* Item Select / Input */}
  <div className="col-span-3">
    {(() => {
      const subcats = getSubcategoriesForCategory(item.category);
      if (subcats.length > 0) {
        return (
        <Select
            value={item.item_name || ''}
            onValueChange={v => {
              updateLineItem(index, 'item_name', v);
              setItemNameSearchTerm('');
            }}
            onOpenChange={(open) => {
              if (open) requestAnimationFrame(() => itemNameSearchRef.current?.focus());
            }}
          >
            <SelectTrigger className="h-7 text-[10px]">
              <SelectValue placeholder="Select item *" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="max-h-[250px] w-[var(--radix-select-trigger-width)]">
              <div className="sticky top-0 bg-white p-1.5 border-b z-10">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    ref={itemNameSearchRef}
                    placeholder="Search item..."
                    className="pl-6 h-6 text-[10px]"
                    value={itemNameSearchTerm}
                    onChange={(e) => setItemNameSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="py-1">
                {subcats
                  .filter(s => s.subcategory_name.toLowerCase().includes(itemNameSearchTerm.toLowerCase()))
                  .map(s => (
                    <SelectItem key={s.subcategory_id} value={s.subcategory_name} className="text-[10px]">
                      {s.subcategory_name}
                    </SelectItem>
                  ))}
              </div>
            </SelectContent>
          </Select>
        );
      } else {
        return (
          <Input
            placeholder="Item name *"
            value={item.item_name}
            onChange={e => updateLineItem(index, 'item_name', e.target.value)}
            className="h-7 text-[10px]"
          />
        );
      }
    })()}
  </div>

  {/* Qty */}
  <div className="col-span-1">
    <Input
      type="number"
      min="1"
      placeholder="Qty"
      value={item.quantity || ''}
      onChange={e => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
      onWheel={(e) => (e.target as HTMLInputElement).blur()}
      className="h-7 text-[10px]"
    />
  </div>

  {/* Price */}
  <div className="col-span-2">
    <Input
      type="number"
      min="0"
      step="0.01"
      placeholder="Price"
      value={item.unit_price || ''}
      onChange={e => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
      className="h-7 text-[10px]"
    />
  </div>

  {/* Total */}
  <div className="col-span-2">
    <div className="h-7 px-2 bg-amber-100 rounded-md flex items-center text-[10px] font-semibold text-amber-700">
      ₹{(item.total_price || 0).toLocaleString('en-IN')}
    </div>
  </div>

  {/* Delete */}
  <div className="col-span-1">
    <button
      onClick={() => removeLineItem(index)}
      disabled={lineItems.length === 1}
      className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-100 disabled:opacity-30"
    >
      <Trash2 className="h-3 w-3 text-red-600" />
    </button>
  </div>
</div>

                    {/* Mobile View */}
                    <div className="md:hidden bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Category
                          </label>
                          <Select
                            value={item.category || ""}
                            onValueChange={(v) => {
                              updateLineItem(index, "category", v);
                              updateLineItem(index, "item_name", "");
                            }}
                          >
                            <SelectTrigger className="h-9 text-[12px] bg-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryMappings.map((c) => (
                                <SelectItem
                                  key={c.category_id}
                                  value={c.category_name}
                                  className="text-[11px]"
                                >
                                  {c.category_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Item Name <span className="text-red-400">*</span>
                          </label>
                          {(() => {
                            const subcats = getSubcategoriesForCategory(
                              item.category,
                            );
                            if (subcats.length > 0) {
                              return (
                                <Select
                                  value={item.item_name || ""}
                                  onValueChange={(v) =>
                                    updateLineItem(index, "item_name", v)
                                  }
                                >
                                  <SelectTrigger className="h-9 text-[12px] bg-white">
                                    <SelectValue placeholder="Select item" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {subcats.map((s) => (
                                      <SelectItem
                                        key={s.subcategory_id}
                                        value={s.subcategory_name}
                                        className="text-[11px]"
                                      >
                                        {s.subcategory_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              );
                            } else {
                              return (
                                <Input
                                  placeholder="Item name"
                                  value={item.item_name}
                                  onChange={(e) =>
                                    updateLineItem(
                                      index,
                                      "item_name",
                                      e.target.value,
                                    )
                                  }
                                  className="h-9 text-[12px] bg-white"
                                />
                              );
                            }
                          })()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Qty
                          </label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="h-9 text-[12px] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Price (₹)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            value={item.unit_price || ""}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "unit_price",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="h-9 text-[12px] bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Total
                          </label>
                          <div className="h-9 px-3 bg-blue-100 rounded-md flex items-center text-[13px] font-bold text-blue-700">
                            ₹{(item.total_price || 0).toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="flex justify-end items-end">
                          <button
                            onClick={() => removeLineItem(index)}
                            disabled={lineItems.length === 1}
                            className="h-9 w-9 flex items-center justify-center rounded-md bg-red-50 hover:bg-red-100 disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {item.item_name && (
                        <div className="mt-3 pt-2 text-[11px] text-gray-600 border-t border-gray-200">
                          <span className="font-medium">{item.item_name}</span>
                          {item.category && <span> • {item.category}</span>}
                          <br />
                          <span className="text-[10px] text-gray-500">
                            {item.quantity || 0} × ₹{item.unit_price || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700">
                  Total Amount:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{getTotalAmount().toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <SH
                icon={<StickyNote className="h-3 w-3" />}
                title="Notes"
                color="text-amber-600"
              />
              <Textarea
                className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white min-h-[56px]"
                placeholder="Additional notes..."
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
 <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1 h-8 text-[11px] font-semibold border-gray-200 text-gray-600 hover:bg-gray-500  hover:text-gray-600 rounded-lg"
              >
                Close
              </Button>
            <Button
              disabled={submitting}
              onClick={handleSubmitPurchase}
              className="flex-[2] h-8 text-[11px] font-semibold bg-gradient-to-r from-[#0A1F5C] to-[#1E4ED8] hover:from-[#0A1F5C] hover:to-[#1E4ED8] text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Purchase"
              )}
            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* Edit Purchase Dialog */}
      <Dialog
        open={showEditForm}
        onOpenChange={(v) => {
          if (!v) {
            setShowEditForm(false);
            setEditPurchaseId(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">
                Edit Material Purchase
              </h2>
              <p className="text-xs text-amber-100">Update purchase details</p>
            </div>
            <DialogClose asChild>
              <button className="p-1.5 rounded-full hover:bg-white/20 transition">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>

          <div className="p-2 overflow-y-auto max-h-[75vh] space-y-5">
            {/* Basic Info */}
            <div>
              <SH
                icon={<Package className="h-3 w-3" />}
                title="Purchase Info"
              />
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
               <div>
  <label className={L}>
    Vendor Name <span className="text-red-400">*</span>
  </label>
<Select
    value={formData.vendor_name}
    onValueChange={(v) => {
      const selected = vendors.find((vendor) => vendor.name === v);
      setFormData({
        ...formData,
        vendor_name: v,
        vendor_phone: selected?.phone || "",
      });
      setVendorSearchTerm("");
    }}
    onOpenChange={(open) => {
      if (open) requestAnimationFrame(() => vendorSearchRef.current?.focus());
    }}
  >
    <SelectTrigger className={F}>
      <SelectValue placeholder="Select vendor" />
    </SelectTrigger>
    <SelectContent position="popper" sideOffset={4} className="max-h-[300px] w-[var(--radix-select-trigger-width)]">
      <div className="sticky top-0 bg-white p-2 border-b z-10">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            ref={vendorSearchRef}
            placeholder="Search vendor..."
            className="pl-7 h-7 text-xs"
            value={vendorSearchTerm}
            onChange={(e) => setVendorSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      <div className="py-1">
        {vendors
          .filter((vendor) => vendor.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()))
          .map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.name}>
              {vendor.name}
            </SelectItem>
          ))}
      </div>
    </SelectContent>
  </Select>
</div>
                <div>
                  <label className={L}>Vendor Phone</label>
                  <Input
                    className={F}
                    placeholder="Phone number"
                    value={formData.vendor_phone}
                    maxLength={10}
                    minLength={10}
                    onChange={(e) => {
    const val = e.target.value.replace(/\D/g, ''); // Only digits
    setFormData({ ...formData, vendor_phone: val });
  }}
                  />
                </div>

                {/* Teen columns ek row mein - Purchase Date, Invoice Number, Property */}
                <div className="col-span-2 grid grid-cols-3 gap-3">
                  <div>
                    <label className={L}>
                      Purchase Date <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="date"
                      className={F}
                      value={formData.purchase_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchase_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={L}>
                      Invoice Number <span className="text-red-400">*</span>
                    </label>
                    <Input
                      className={F}
                      placeholder="INV-001"
                      value={formData.invoice_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoice_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className={L}>
                      Property <span className="text-red-400">*</span>
                    </label>
                   <Select
  open={propertySelectOpen}
  onOpenChange={setPropertySelectOpen}
  value={formData.property_id}
  onValueChange={(v) => {
    const selected = properties.find((p) => p.id === v);
    setFormData((p) => ({
      ...p,
      property_id: v,
      property_name: selected?.name || "",
    }));
    setPropertySearchTerm("");
  }}
><SelectTrigger className={F}>
                        <Building className="h-3 w-3 text-gray-400 mr-1.5" />
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        sideOffset={4}
                        align="end"
                        className="max-h-[300px] w-[var(--radix-select-trigger-width)]"
                      >
                        {/* Search input */}
                        <div className="sticky top-0 bg-white p-2 border-b z-10">
                          <div className="relative">
                            <svg
                              className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                            <Input
                              ref={propertySearchRef}
                              placeholder="Search properties..."
                              className="pl-7 h-7 text-xs"
                              value={propertySearchTerm}
                              onChange={(e) =>
                                setPropertySearchTerm(e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        {/* Properties list */}
                        <div className="py-1">
                          {properties
                            .filter((p) =>
                              p.name
                                .toLowerCase()
                                .includes(propertySearchTerm.toLowerCase()),
                            )
                            .map((p) => (
                              <SelectItem
                                key={p.id}
                                value={p.id}
                                className={SI}
                              >
                                {p.name}
                              </SelectItem>
                            ))}

                          {/* Show message if no results */}
                          {properties.filter((p) =>
                            p.name
                              .toLowerCase()
                              .includes(propertySearchTerm.toLowerCase()),
                          ).length === 0 && (
                            <div className="px-2 py-3 text-center">
                              <p className="text-xs text-gray-400">
                                No properties found
                              </p>
                            </div>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <SH
                  icon={<Boxes className="h-3 w-3" />}
                  title="Purchase Items"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addLineItem}
                  className="h-7 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-100 hover:text-blue-400"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div key={index}>
                    {/* Desktop View */}
<div className="hidden md:grid grid-cols-12 gap-2 p-2 bg-gray-50 rounded-lg">
  {/* Category Select */}
  <div className="col-span-3">
  <Select
      value={item.category || ''}
      onValueChange={v => {
        updateLineItem(index, 'category', v);
        updateLineItem(index, 'item_name', '');
        setCategorySearchTerm('');
      }}
      onOpenChange={(open) => {
        if (open) requestAnimationFrame(() => categorySearchRef.current?.focus());
      }}
    >
      <SelectTrigger className="h-7 text-[10px]">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={4} className="max-h-[250px] w-[var(--radix-select-trigger-width)]">
        <div className="sticky top-0 bg-white p-1.5 border-b z-10">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              ref={categorySearchRef}
              placeholder="Search category..."
              className="pl-6 h-6 text-[10px]"
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="py-1">
          {inventoryMappings
            .filter(c => c.category_name.toLowerCase().includes(categorySearchTerm.toLowerCase()))
            .map(c => (
              <SelectItem key={c.category_id} value={c.category_name} className="text-[10px]">
                {c.category_name}
              </SelectItem>
            ))}
        </div>
      </SelectContent>
    </Select>
  </div>

  {/* Item Select / Input */}
  <div className="col-span-3">
    {(() => {
      const subcats = getSubcategoriesForCategory(item.category);
      if (subcats.length > 0) {
        return (
        <Select
            value={item.item_name || ''}
            onValueChange={v => {
              updateLineItem(index, 'item_name', v);
              setItemNameSearchTerm('');
            }}
            onOpenChange={(open) => {
              if (open) requestAnimationFrame(() => itemNameSearchRef.current?.focus());
            }}
          >
            <SelectTrigger className="h-7 text-[10px]">
              <SelectValue placeholder="Select item *" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4} className="max-h-[250px] w-[var(--radix-select-trigger-width)]">
              <div className="sticky top-0 bg-white p-1.5 border-b z-10">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    ref={itemNameSearchRef}
                    placeholder="Search item..."
                    className="pl-6 h-6 text-[10px]"
                    value={itemNameSearchTerm}
                    onChange={(e) => setItemNameSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="py-1">
                {subcats
                  .filter(s => s.subcategory_name.toLowerCase().includes(itemNameSearchTerm.toLowerCase()))
                  .map(s => (
                    <SelectItem key={s.subcategory_id} value={s.subcategory_name} className="text-[10px]">
                      {s.subcategory_name}
                    </SelectItem>
                  ))}
              </div>
            </SelectContent>
          </Select>
        );
      } else {
        return (
          <Input
            placeholder="Item name *"
            value={item.item_name}
            onChange={e => updateLineItem(index, 'item_name', e.target.value)}
            className="h-7 text-[10px]"
          />
        );
      }
    })()}
  </div>

  {/* Qty */}
  <div className="col-span-1">
    <Input
      type="number"
      min="1"
      placeholder="Qty"
      value={item.quantity || ''}
      onChange={e => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
      onWheel={(e) => (e.target as HTMLInputElement).blur()}
      className="h-7 text-[10px]"
    />
  </div>

  {/* Price */}
  <div className="col-span-2">
    <Input
      type="number"
      min="0"
      step="0.01"
      placeholder="Price"
      value={item.unit_price || ''}
      onChange={e => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
      className="h-7 text-[10px]"
    />
  </div>

  {/* Total */}
  <div className="col-span-2">
    <div className="h-7 px-2 bg-amber-100 rounded-md flex items-center text-[10px] font-semibold text-amber-700">
      ₹{(item.total_price || 0).toLocaleString('en-IN')}
    </div>
  </div>

  {/* Delete */}
  <div className="col-span-1">
    <button
      onClick={() => removeLineItem(index)}
      disabled={lineItems.length === 1}
      className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-100 disabled:opacity-30"
    >
      <Trash2 className="h-3 w-3 text-red-600" />
    </button>
  </div>
</div>

                    {/* Mobile View */}
                    <div className="md:hidden bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Category
                          </label>
                          <Select
                            value={item.category || ""}
                            onValueChange={(v) => {
                              updateLineItem(index, "category", v);
                              updateLineItem(index, "item_name", "");
                            }}
                          >
                            <SelectTrigger className="h-9 text-[12px] bg-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryMappings.map((c) => (
                                <SelectItem
                                  key={c.category_id}
                                  value={c.category_name}
                                  className="text-[11px]"
                                >
                                  {c.category_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Item Name <span className="text-red-400">*</span>
                          </label>
                          {(() => {
                            const subcats = getSubcategoriesForCategory(
                              item.category,
                            );
                            if (subcats.length > 0) {
                              return (
                                <Select
                                  value={item.item_name || ""}
                                  onValueChange={(v) =>
                                    updateLineItem(index, "item_name", v)
                                  }
                                >
                                  <SelectTrigger className="h-9 text-[12px] bg-white">
                                    <SelectValue placeholder="Select item" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {subcats.map((s) => (
                                      <SelectItem
                                        key={s.subcategory_id}
                                        value={s.subcategory_name}
                                        className="text-[11px]"
                                      >
                                        {s.subcategory_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              );
                            } else {
                              return (
                                <Input
                                  placeholder="Item name"
                                  value={item.item_name}
                                  onChange={(e) =>
                                    updateLineItem(
                                      index,
                                      "item_name",
                                      e.target.value,
                                    )
                                  }
                                  className="h-9 text-[12px] bg-white"
                                />
                              );
                            }
                          })()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Qty
                          </label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="h-9 text-[12px] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Price (₹)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            value={item.unit_price || ""}
                            onChange={(e) =>
                              updateLineItem(
                                index,
                                "unit_price",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="h-9 text-[12px] bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Total
                          </label>
                          <div className="h-9 px-3 bg-blue-100 rounded-md flex items-center text-[13px] font-bold text-blue-700">
                            ₹{(item.total_price || 0).toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="flex justify-end items-end">
                          <button
                            onClick={() => removeLineItem(index)}
                            disabled={lineItems.length === 1}
                            className="h-9 w-9 flex items-center justify-center rounded-md bg-red-50 hover:bg-red-100 disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {item.item_name && (
                        <div className="mt-3 pt-2 text-[11px] text-gray-600 border-t border-gray-200">
                          <span className="font-medium">{item.item_name}</span>
                          {item.category && <span> • {item.category}</span>}
                          <br />
                          <span className="text-[10px] text-gray-500">
                            {item.quantity || 0} × ₹{item.unit_price || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700">
                  Total Amount:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{getTotalAmount().toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <SH
                icon={<StickyNote className="h-3 w-3" />}
                title="Notes"
                color="text-amber-600"
              />
              <Textarea
                className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white min-h-[56px]"
                placeholder="Additional notes..."
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
 <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
onClick={() => setShowEditForm(false)}
                className="flex-1 h-8 text-[11px] font-semibold border-gray-200 text-gray-600 hover:bg-gray-500  hover:text-gray-600 rounded-lg"
              >
                Close
              </Button>
            <Button
              disabled={editSubmitting}
              onClick={handleUpdatePurchase}
              className="flex-[2] h-8 text-[11px] font-semibold bg-gradient-to-r from-[#0A1F5C] to-[#1E4ED8] hover:from-[#0A1F5C] hover:to-[#1E4ED8] text-white"
            >
              {editSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update Purchase"
              )}
            </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={showPaymentModal}
        onOpenChange={(v) => {
          if (!v) setShowPaymentModal(false);
        }}
      >
        <DialogContent className="max-w-xl w-[98vw] lg:w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-2 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
            <div>
              <h2 className="text-base font-semibold">Add Payment</h2>
              <p className="text-xs text-green-100">
                Record payment for purchase
              </p>
            </div>
            <DialogClose asChild>
              <button className="p-1.5 rounded-full hover:bg-white/20 transition">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>

          <div className="p-4 overflow-y-auto max-h-[75vh]">
            {selectedPurchase && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </p>
                  <p className="text-xs font-semibold text-gray-800 mt-1">
                    {selectedPurchase.invoice_number}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                    Vendor
                  </p>
                  <p className="text-xs font-semibold text-gray-800 mt-1">
                    {selectedPurchase.vendor_name}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-[9px] text-red-500 uppercase tracking-wider">
                    Balance Due
                  </p>
                  <p className="text-xs font-bold text-red-600 mt-1">
                    ₹
                    {(
                      selectedPurchase.balance_amount ||
                      selectedPurchase.total_amount
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            )}

            {/* 3x3 Grid for Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                  Payment Date *
                </label>
                <Input
                  type="date"
                  className="h-8 text-xs w-full"
                  value={paymentData.payment_date}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      payment_date: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                  Amount (₹) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-8 text-xs w-full"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                  Payment Method *
                </label>
                <Select
                  value={paymentData.payment_method}
                  onValueChange={(v) =>
                    setPaymentData({ ...paymentData, payment_method: v })
                  }
                >
                  <SelectTrigger className="h-8 text-xs w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                  Paid By *
                </label>
                <Input
                  className="h-8 text-xs w-full"
                  placeholder="Person name"
                  value={paymentData.paid_by}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, paid_by: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                  Reference (optional)
                </label>
                <Input
                  className="h-8 text-xs w-full"
                  placeholder="Transaction ID / Cheque no."
                  value={paymentData.payment_reference}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      payment_reference: e.target.value,
                    })
                  }
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                  Notes
                </label>
                <Textarea
                  className="text-xs min-h-[60px] w-full"
                  placeholder="Payment notes..."
                  rows={2}
                  value={paymentData.payment_notes}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      payment_notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Submit Button - Full width at bottom */}
            <div className="mt-4 sticky bottom-0 bg-white pt-2">
              <Button
                disabled={submitting}
                onClick={handleSubmitPayment}
                className="w-full h-9 text-xs font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Adding Payment…
                  </>
                ) : (
                  "Add Payment"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={showDetailsModal}
        onOpenChange={(v) => {
          if (!v) setShowDetailsModal(false);
        }}
      >
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]  text-white px-2 py-2 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">Purchase Details</h2>
              <p className="text-xs text-emerald-100">
                View complete purchase information
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Download PDF — Red */}
              <button
                onClick={() =>
                  selectedPurchase && handleDownloadPDF(selectedPurchase)
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>

              {/* Print — Blue */}
            <button
  onClick={() => setShowPrintPreview(true)}
  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-400 hover:bg-blue-600 text-white text-[11px] font-medium transition-colors"
>
  <Printer className="h-3.5 w-3.5" />
  <span className="hidden sm:inline">Print</span>
</button>

              {/* Close */}
              <DialogClose asChild>
                <button className="p-1.5 rounded-full hover:bg-white/20 transition ml-1">
                  <X className="h-4 w-4 text-white" />
                </button>
              </DialogClose>
            </div>{" "}
          </div>

          {selectedPurchase && (
            <div className="p-4 overflow-y-auto max-h-[75vh] space-y-5">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500">Invoice Number</p>
                    <p className="text-sm font-bold">
                      {selectedPurchase.invoice_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Purchase Date</p>
                    <p className="text-sm font-bold">
                      {new Date(
                        selectedPurchase.purchase_date,
                      ).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Vendor</p>
                    <p className="text-sm font-bold">
                      {selectedPurchase.vendor_name}
                      {selectedPurchase.vendor_phone && (
                        <p className="text-[10px] text-gray-600">
                          {selectedPurchase.vendor_phone}
                        </p>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Property</p>
                    <p className="text-sm font-bold">
                      {selectedPurchase.property_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 mb-2">
                  Purchase Items
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Item Name</th>
                        <th className="px-3 py-2 text-left">Category</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Unit Price</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let itemsToShow = selectedPurchase?.purchase_items;

                        if (
                          (!itemsToShow || itemsToShow.length === 0) &&
                          selectedPurchase?.items
                        ) {
                          if (typeof selectedPurchase.items === "string") {
                            try {
                              itemsToShow = JSON.parse(selectedPurchase.items);
                            } catch (e) {
                              itemsToShow = [];
                            }
                          } else if (Array.isArray(selectedPurchase.items)) {
                            itemsToShow = selectedPurchase.items;
                          }
                        }

                        return itemsToShow && itemsToShow.length > 0 ? (
                          itemsToShow.map((item, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-3 py-2 font-medium">
                                {item.item_name || "-"}
                              </td>
                              <td className="px-3 py-2">
                                {item.category || "-"}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {item.quantity || 0}
                              </td>
                              <td className="px-3 py-2 text-right">
                                ₹
                                {(item.unit_price || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="px-3 py-2 text-right font-semibold">
                                ₹
                                {(item.total_price || 0).toLocaleString(
                                  "en-IN",
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-3 py-4 text-center text-gray-500"
                            >
                              No items found
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-3 py-2 text-right font-bold"
                        >
                          Total:
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-blue-600">
                          ₹
                          {(selectedPurchase?.total_amount || 0).toLocaleString(
                            "en-IN",
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-[10px] text-gray-600">Total Amount</p>
                  <p className="text-base font-bold">
                    ₹{selectedPurchase.total_amount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-[10px] text-gray-600">Paid Amount</p>
                  <p className="text-base font-bold text-green-600">
                    ₹
                    {(selectedPurchase.paid_amount || 0).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <p className="text-[10px] text-gray-600">Balance Due</p>
                  <p className="text-base font-bold text-red-600">
                    ₹
                    {(
                      selectedPurchase.balance_amount ||
                      selectedPurchase.total_amount
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {selectedPurchase.payment_method && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 mb-1">
                    Payment Information
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Method:</span>
                      <span className="ml-2 font-semibold">
                        {selectedPurchase.payment_method}
                      </span>
                    </div>
                    {selectedPurchase.paid_by && (
                      <div>
                        <span className="text-gray-600">Paid By:</span>
                        <span className="ml-2 font-semibold">
                          {selectedPurchase.paid_by}
                        </span>
                      </div>
                    )}
                    {selectedPurchase.payment_reference && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Reference:</span>
                        <span className="ml-2 font-semibold">
                          {selectedPurchase.payment_reference}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedPurchase.notes && (
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 mb-1">Notes</p>
                  <p className="text-xs">{selectedPurchase.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Print Preview Dialog */}
<Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
  <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0 flex flex-col">
    <div className="flex flex-shrink-0 items-center justify-between bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-2.5 py-2">
      <div>
        <h2 className="flex items-center gap-1.5 text-sm font-bold leading-tight text-white">
          <Printer className="h-3.5 w-3.5" />
          Purchase Receipt
        </h2>
        <p className="text-[10px] leading-tight text-blue-100">
          {selectedPurchase?.invoice_number} • {selectedPurchase?.vendor_name}
        </p>
      </div>
      <button
        onClick={() => setShowPrintPreview(false)}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
      >
        <X className="h-3.5 w-3.5 text-white" />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto px-3 py-2">
      {selectedPurchase && (
        <div id="purchase-receipt-print-area" className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
  <span
    className="font-black leading-none whitespace-nowrap"
    style={{
      fontSize: "min(10vw, 56px)",
      letterSpacing: "0.02em",
      color: "rgba(100, 116, 139, 0.09)",
      transform: "rotate(-30deg)",
    }}
  >
    {siteSettings.siteName?.split(" ")[0]}
  </span>
</div>

          {/* Header: logo left, name center, invoice right */}
          <div className="relative z-10 mb-3 flex items-center border-b border-slate-200 pb-3">
            <div className="w-28 flex-shrink-0">
              {siteSettings.logo && (
                <img
                  src={siteSettings.logo}
                  alt={siteSettings.siteName}
                  className="h-20 w-auto object-contain"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              )}
            </div>
            <div className="flex-1 text-center">
              <h2 className="text-lg font-bold text-slate-800">{siteSettings.siteName}</h2>
              <p className="text-sm font-semibold text-slate-700">Material Purchase Receipt</p>
            </div>
            <div className="w-28 text-right text-[10px] text-slate-400">
              <span className="block font-semibold text-slate-600">Invoice No.</span>
              <span className="text-[10px]">{selectedPurchase.invoice_number}</span>
            </div>
          </div>

          {/* Meta bar */}
          <div className="relative z-10 mb-3 flex justify-between border-b border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-500">
            <div>
              <span className="text-[9px] font-semibold uppercase">Purchase Date</span>
              <span className="block font-bold text-slate-800">
                {new Date(selectedPurchase.purchase_date).toLocaleDateString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-semibold uppercase">Property</span>
              <span className="block font-bold text-slate-800">{selectedPurchase.property_name || "—"}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-semibold uppercase">Status</span>
              <span className="block">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    background:
                      selectedPurchase.payment_status === "Paid" ? "#DCFCE7" :
                      selectedPurchase.payment_status === "Partial" ? "#FEF3C7" : "#FEF2F2",
                    color:
                      selectedPurchase.payment_status === "Paid" ? "#166534" :
                      selectedPurchase.payment_status === "Partial" ? "#92400E" : "#991B1B",
                  }}
                >
                  {selectedPurchase.payment_status?.toUpperCase()}
                </span>
              </span>
            </div>
          </div>

          {/* Details grid */}
          <div className="relative z-10 mb-3 grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <div>
              <span className="text-[9px] font-semibold uppercase text-slate-400">Vendor</span>
              <div className="font-medium text-slate-800">{selectedPurchase.vendor_name || "—"}</div>
            </div>
            <div>
              <span className="text-[9px] font-semibold uppercase text-slate-400">Vendor Phone</span>
              <div className="font-medium text-slate-800">{selectedPurchase.vendor_phone || "—"}</div>
            </div>
            <div>
              <span className="text-[9px] font-semibold uppercase text-slate-400">Added By</span>
              <div className="font-medium text-slate-800">{selectedPurchase.added_by || "—"}</div>
            </div>
          </div>

          {/* Items table */}
          {(() => {
            let itemsToShow = selectedPurchase.purchase_items;
            if ((!itemsToShow || itemsToShow.length === 0) && selectedPurchase.items) {
              if (typeof selectedPurchase.items === "string") {
                try { itemsToShow = JSON.parse(selectedPurchase.items); } catch { itemsToShow = []; }
              } else if (Array.isArray(selectedPurchase.items)) {
                itemsToShow = selectedPurchase.items;
              }
            }
            return itemsToShow && itemsToShow.length > 0 ? (
              <div className="relative z-10 mb-3">
                <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Purchase Items</p>
                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">#</th>
                      <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Item Name</th>
                      <th className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-600">Category</th>
                      <th className="border border-slate-300 px-2 py-1 text-right font-semibold text-slate-600">Qty</th>
                      <th className="border border-slate-300 px-2 py-1 text-right font-semibold text-slate-600">Price</th>
                      <th className="border border-slate-300 px-2 py-1 text-right font-semibold text-slate-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsToShow.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 px-2 py-1 text-center text-slate-500">{idx + 1}</td>
                        <td className="border border-slate-300 px-2 py-1 font-medium text-slate-700">{item.item_name || "—"}</td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-600">{item.category || "—"}</td>
                        <td className="border border-slate-300 px-2 py-1 text-right text-slate-600">{item.quantity || 0}</td>
                        <td className="border border-slate-300 px-2 py-1 text-right text-slate-600">₹{Number(item.unit_price || 0).toLocaleString("en-IN")}</td>
                        <td className="border border-slate-300 px-2 py-1 text-right font-medium text-slate-700">₹{Number(item.total_price || 0).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-blue-50 font-bold">
                      <td colSpan={5} className="border border-slate-300 px-2 py-1 text-right text-blue-700">Total</td>
                      <td className="border border-slate-300 px-2 py-1 text-right text-blue-700">
                        ₹{Number(selectedPurchase.total_amount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : null;
          })()}

          {/* Totals */}
          <div className="relative z-10 mt-3 flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-1 text-sm">
                <span className="text-slate-600">Total Amount</span>
                <span className="font-bold text-slate-800">₹{Number(selectedPurchase.total_amount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <span className="text-slate-600">Paid</span>
                <span className="font-bold text-emerald-700">₹{Number(selectedPurchase.paid_amount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-1 flex justify-between border-t-2 border-slate-300 py-1 pt-1 text-sm">
                <span className="font-bold text-slate-700">Balance Due</span>
                <span className="font-bold text-amber-700">
                  ₹{Number(selectedPurchase.balance_amount || selectedPurchase.total_amount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {selectedPurchase.notes && (
            <div className="relative z-10 mt-3 rounded-lg bg-yellow-50 p-2">
              <p className="mb-0.5 text-[10px] font-medium text-yellow-700">Notes</p>
              <p className="text-sm text-yellow-800">{selectedPurchase.notes}</p>
            </div>
          )}

          {/* Signature block — same as handover, keep as-is style */}
          <div className="relative z-10 mt-8 grid grid-cols-2 gap-6 text-center text-xs">
            <div>
              <div className="mb-1 border-t border-slate-400 pt-1">Received By</div>
            </div>
            <div>
              <div className="mb-1 border-t border-slate-400 pt-1">Authorized Signature</div>
            </div>
          </div>

          <div className="receipt-footer relative z-10 mt-3 border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400">
            <p>
              {siteSettings.phone && `Tel: ${siteSettings.phone}`}
              {siteSettings.phone && siteSettings.email && "  |  "}
              {siteSettings.email && `Email: ${siteSettings.email}`}
            </p>
            <p className="mt-0.5">Powered by {siteSettings.siteName}</p>
            <p className="mt-0.5">
              Generated on {new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      )}
    </div>

    <div className="flex flex-shrink-0 gap-2 border-t border-slate-100 px-3 py-2">
      <button
        onClick={() => setShowPrintPreview(false)}
        className="h-8 flex-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
      >
        Close
      </button>
      <button
        onClick={() => {
          const content = document.getElementById("purchase-receipt-print-area");
          if (!content) return;
          const win = window.open("", "_blank", "width=800,height=900");
          if (!win) return;
          win.document.write(`
            <html>
              <head><title>Purchase Receipt</title>
                <style>
                  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #fff; }
                  #purchase-receipt-print-area { max-width: 720px; margin: 0 auto; }
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
        className="flex h-8 flex-[2] items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-[11px] font-bold text-white hover:opacity-90"
      >
        <Printer className="h-3.5 w-3.5" /> Print Receipt
      </button>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}
