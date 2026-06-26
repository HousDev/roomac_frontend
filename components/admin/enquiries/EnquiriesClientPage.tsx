// components/admin/enquiries/EnquiriesClientPage.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Phone, Mail, Calendar, Trash2, Edit, BarChart, Search, Save, RefreshCw, Filter, X, UserPlus, UserCheck, ArrowRightLeft, Repeat, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { getAllStaff, type StaffMember } from "@/lib/staffApi";

import {
  getEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  updateEnquiryStatus,
  addFollowup,
  getEnquiryStats,
  getEnquiryById,
  convertEnquiryToTenant,
  type Enquiry,
  type CreateEnquiryPayload,
  type UpdateEnquiryPayload,
  type Followup,
  bulkDeleteEnquiries
} from "@/lib/enquiryApi";
import { useRouter, useSearchParams } from "@/src/compat/next-navigation";
import EnquiriesTable from "./EnquiriesTable";
import EnquiriesFilters from "./EnquiriesFilters";
import EnquiriesStats from "./EnquiriesStats";
import EnquiryForm from "./EnquiryForm";
import EnquiryViewDialog from "./EnquiryViewDialog";
import { Skeleton } from "@/components/ui/skeleton";
import MySwal from "@/app/utils/swal";
import ScheduleVisitDialog from "./ScheduleVisitDialog";
import ConvertToTenantDialog from "./ConvertToTenantDialog";
import { useAuth } from "@/context/authContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// Types for initial props
interface EnquiriesClientPageProps {
  initialEnquiries: Enquiry[];
  initialStats: any;
  searchParams: {
    status?: string;
    search?: string;
  };
  onRegisterRefresh?: (fn: () => void) => void;
  onRegisterOpenAdd?: (fn: () => void) => void;
  onRegisterStats?: (stats: any) => void;
  onRegisterBulkDelete?: (fn: () => void) => void;
  onRegisterSelectedCount?: (count: number) => void;
  onRegisterOpenFilterSidebar?: (fn: () => void) => void;
 onRegisterExport?: (fn: () => void) => void;          
  onRegisterImport?: (fn: (file: File | null) => void) => void;
  onRegisterOpenBulkAssign?: (fn: () => void) => void; 

}

export default function EnquiriesClientPage({
  initialEnquiries,
  initialStats,
  searchParams: initialSearchParams,
  onRegisterRefresh,
  onRegisterOpenAdd,
  onRegisterStats,
  onRegisterBulkDelete,
  onRegisterSelectedCount,
  onRegisterOpenFilterSidebar,
   onRegisterExport,
  onRegisterImport,
  onRegisterOpenBulkAssign,   
}: EnquiriesClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [followupText, setFollowupText] = useState("");
  const [stats, setStats] = useState<any>(initialStats);
  const [statusFilter, setStatusFilter] = useState<string>(initialSearchParams.status || "");
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchParams.search || "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const initialLoadDone = useRef(false);
  const [scheduleVisitEnquiry, setScheduleVisitEnquiry] = useState<Enquiry | null>(null);
  const [convertEnquiry, setConvertEnquiry] = useState<Enquiry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState<number | "All">(10);
  // Add these state variables
    const { can } = useAuth(); 
    const [staffList, setStaffList] = useState<any[]>([]);
const [assignStaffId, setAssignStaffId] = useState("");

const [selectedRows, setSelectedRows] = useState<string[]>([]);
const [selectAll, setSelectAll] = useState(false);
const [showImportDialog, setShowImportDialog] = useState(false);
const [importFile, setImportFile] = useState<File | null>(null);
const [importPreview, setImportPreview] = useState<any[]>([]);
const [importing, setImporting] = useState(false);


const fileRef = useRef<HTMLInputElement>(null);


  // Column search states
const [columnFilters, setColumnFilters] = useState({
  name: "", phone: "", email: "",   
  contact: "",                       
  property: "", moveInDate: "",
  status: "", created: "", assignedTo: ""
});

  const [dateFilters, setDateFilters] = useState({
  moveInFrom: "",
  moveInTo: "",
  createdFrom: "",
  createdTo: "",
  ignoreDateFilters: false,
});

  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  const hasFetchedOnMount = useRef(false);

  // Add new enquiry form state
  const [newEnquiry, setNewEnquiry] = useState<CreateEnquiryPayload>({
    property_id: "",
    tenant_name: "",
    phone: "",
    email: "",
    preferred_move_in_date: "",
    budget_range: "",
    message: "",
    source: "website",
    occupation: "",
    occupation_category: "",
    remark: "",
  });

  // Edit enquiry form state
  const [editEnquiryData, setEditEnquiryData] = useState<UpdateEnquiryPayload>({
    property_id: "",
    tenant_name: "",
    phone: "",
    email: "",
    preferred_move_in_date: "",
    budget_range: "",
    message: "",
    status: "new",
    occupation: "",
    occupation_category: "",
    remark: "",
  });

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = useCallback((dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  }, []);

  // Helper function to convert input date to database format
  const formatDateForDatabase = useCallback((dateString: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error converting date for database:", error);
      return null;
    }
  }, []);

  // FIX: Keep latest filter values in refs so loadData can read them
  const statusFilterRef = useRef(statusFilter);
  const searchTermRef = useRef(searchTerm);

  useEffect(() => { statusFilterRef.current = statusFilter; }, [statusFilter]);
  useEffect(() => { searchTermRef.current = searchTerm; }, [searchTerm]);

  // Load data with filters
  const loadData = useCallback(async (isManualRefresh = false) => {
    setLoading(true);

    try {
      const filters: any = {};
      if (statusFilterRef.current && statusFilterRef.current !== "all" && statusFilterRef.current !== "") {
        filters.status = statusFilterRef.current;
      }
      if (searchTermRef.current) filters.search = searchTermRef.current;

      const [enquiriesRes, statsRes] = await Promise.all([
        getEnquiries(filters),
        getEnquiryStats()
      ]);

      setEnquiries(enquiriesRes.results);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  onRegisterOpenBulkAssign?.(() => setShowBulkAssignDialog(true));
}, [onRegisterOpenBulkAssign]);

  useEffect(() => {
  onRegisterRefresh?.(() => loadData(true));
}, [loadData]);

useEffect(() => {
  onRegisterOpenAdd?.(() => setShowAddDialog(true));
}, []);

useEffect(() => {
  onRegisterStats?.(stats);
}, [stats]);

useEffect(() => {
  onRegisterOpenFilterSidebar?.(() => setShowFilterSidebar(true));
}, []);
useEffect(() => {
  onRegisterSelectedCount?.(selectedRows.length);
}, [selectedRows.length]);


useEffect(() => { setCurrentPage(1); }, [columnFilters, statusFilter, searchTerm, dateFilters]);
  // Load properties once on mount
  useEffect(() => {
    if (hasFetchedOnMount.current) return;
    hasFetchedOnMount.current = true;

    const loadProperties = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/properties`);
        const data = await res.json();
        setProperties(data.data || []);
      } catch (error) {
        console.error("Error loading properties:", error);
      }
    };
    

    loadProperties();

    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
    }
  }, []);

  useEffect(() => {
  const loadStaff = async () => {
    try {
      const staff = await getAllStaff();
      setStaffList(staff);
    } catch (error) {
      console.error("Error loading staff:", error);
    }
  };
  loadStaff();
}, []);
  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "all") params.set('status', statusFilter);
    if (searchTerm) params.set('search', searchTerm);

    const queryString = params.toString();
    const currentPath = window.location.pathname;
    const newUrl = `${currentPath}${queryString ? `?${queryString}` : ''}`;

    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState(null, '', newUrl);
    }

    const timeoutId = setTimeout(() => {
      loadData(true);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, searchTerm, loadData]);

   const formatDateForDisplay = useCallback((dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return "-";
    }
  }, []);
  // Filter enquiries based on column filters
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(enquiry => {
      const nameMatch = enquiry.tenant_name?.toLowerCase().includes(columnFilters.name.toLowerCase()) ?? true;
      const phoneMatch = enquiry.phone?.toLowerCase().includes(columnFilters.phone.toLowerCase()) ?? true;
      const emailMatch = enquiry.email?.toLowerCase().includes(columnFilters.email.toLowerCase()) ?? true;
      const contactMatch = phoneMatch && emailMatch;
      const propertyMatch = (enquiry.property_full_name || enquiry.property_name || "")?.toLowerCase().includes(columnFilters.property.toLowerCase()) ?? true;
      const statusMatch = (enquiry.status || "")?.toLowerCase().includes(columnFilters.status.toLowerCase()) ?? true;
const moveInDateMatch = columnFilters.moveInDate
  ? formatDateForDisplay(enquiry.preferred_move_in_date || "").toLowerCase().includes(columnFilters.moveInDate.toLowerCase())
  : true;
const createdMatch = columnFilters.created
  ? formatDateForDisplay(enquiry.created_at || "").toLowerCase().includes(columnFilters.created.toLowerCase())
  : true;

  const assignedToMatch = columnFilters.assignedTo
  ? (enquiry.assigned_staff_name || "Unassigned").toLowerCase().includes(columnFilters.assignedTo.toLowerCase())
  : true;
// Date range filters
      let moveInRangeMatch = true;
      if (!dateFilters.ignoreDateFilters) {
        const moveIn = enquiry.preferred_move_in_date ? new Date(enquiry.preferred_move_in_date) : null;
        if (dateFilters.moveInFrom && moveIn) moveInRangeMatch = moveIn >= new Date(dateFilters.moveInFrom);
        if (dateFilters.moveInTo && moveIn) moveInRangeMatch = moveInRangeMatch && moveIn <= new Date(dateFilters.moveInTo);

        let createdRangeMatch = true;
        const created = enquiry.created_at ? new Date(enquiry.created_at) : null;
        if (dateFilters.createdFrom && created) createdRangeMatch = created >= new Date(dateFilters.createdFrom);
        if (dateFilters.createdTo && created) createdRangeMatch = createdRangeMatch && created <= new Date(dateFilters.createdTo);

return nameMatch && contactMatch && propertyMatch && moveInDateMatch && statusMatch && createdMatch && moveInRangeMatch && createdRangeMatch && assignedToMatch;
      }

      return nameMatch && contactMatch && propertyMatch && moveInDateMatch && statusMatch && createdMatch;    });
  }, [enquiries, columnFilters]);
  const paginatedEnquiries = useMemo(() => {
  if (itemsPerPage === "All") return filteredEnquiries;
  const start = (currentPage - 1) * (itemsPerPage as number);
  return filteredEnquiries.slice(start, start + (itemsPerPage as number));
}, [filteredEnquiries, currentPage, itemsPerPage]);

const totalPages = useMemo(() => {
  if (itemsPerPage === "All") return 1;
  return Math.ceil(filteredEnquiries.length / (itemsPerPage as number));
}, [filteredEnquiries, itemsPerPage]);

  // Function to open view dialog with fresh data
  const openViewDialog = useCallback(async (enquiry: Enquiry) => {
    try {
      const response = await getEnquiryById(enquiry.id);
      if (response.success) {
        setSelectedEnquiry(response.data);
        setShowViewDialog(true);
      } else {
        toast.error("Failed to load enquiry details");
      }
    } catch (error) {
      console.error("Error fetching enquiry details:", error);
      toast.error("Failed to load enquiry details");
    }
  }, []);

  const handleAddEnquiry = useCallback(async () => {
    if (!newEnquiry.tenant_name || !newEnquiry.phone) {
      toast.error("Name and phone are required");
      return;
    }
    if (newEnquiry.phone.length !== 10) {
  toast.error("Phone number must be exactly 10 digits");
  return;
}

    if (!newEnquiry.property_id) {
      toast.error("Please select a property");
      return;
    }

    try {
      const selectedProperty = properties.find(
        (p) => String(p.id) === String(newEnquiry.property_id)
      );

      const formattedDate = formatDateForDatabase(newEnquiry.preferred_move_in_date || "");

      const enquiryData: CreateEnquiryPayload = {
        property_id: newEnquiry.property_id,
        tenant_name: newEnquiry.tenant_name,
        phone: newEnquiry.phone,
        email: newEnquiry.email,
        property_name: selectedProperty?.name || "",
        preferred_move_in_date: formattedDate || "",
        budget_range: newEnquiry.budget_range,
        message: newEnquiry.message,
        source: newEnquiry.source,
        status: "new",
        occupation: newEnquiry.occupation,
        occupation_category: newEnquiry.occupation_category,
        remark: newEnquiry.remark,
      };

      await createEnquiry(enquiryData);
      toast.success("Enquiry added successfully");

      setShowAddDialog(false);
      setNewEnquiry({
        property_id: "",
        tenant_name: "",
        phone: "",
        email: "",
        preferred_move_in_date: "",
        budget_range: "",
        message: "",
        source: "website",
        occupation: "",
        occupation_category: "",
        remark: "",
      });

      await loadData(true);
    } catch (error: any) {
      console.error("Error adding enquiry:", error);
      toast.error(error.message || "Failed to add enquiry");
    }
  }, [newEnquiry, properties, formatDateForDatabase, loadData]);

  // Open edit dialog with enquiry data
  const handleOpenEditDialog = useCallback((enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setEditEnquiryData({
      property_id: enquiry.property_id || "",
      tenant_name: enquiry.tenant_name || "",
      phone: enquiry.phone || "",
      email: enquiry.email || "",
      preferred_move_in_date: formatDateForInput(enquiry.preferred_move_in_date || ""),
      budget_range: enquiry.budget_range || "",
      message: enquiry.message || "",
      status: enquiry.status || "new",
      occupation: enquiry.occupation || "",
      occupation_category: enquiry.occupation_category || "",
      remark: enquiry.remark || "",
    });
    setShowEditDialog(true);
  }, [formatDateForInput]);

  // Update enquiry handler
  const handleUpdateEnquiry = useCallback(async () => {
    if (!selectedEnquiry) return;

    if (!editEnquiryData.tenant_name || !editEnquiryData.phone) {
      toast.error("Name and phone are required");
      return;
    }

    if (editEnquiryData.phone.length !== 10) {
  toast.error("Phone number must be exactly 10 digits");
  return;
}

    try {
      let propertyName = selectedEnquiry.property_name;
      if (editEnquiryData.property_id && editEnquiryData.property_id !== selectedEnquiry.property_id) {
        const selectedProperty = properties.find((p) => p.id === editEnquiryData.property_id);
        propertyName = selectedProperty?.name || "";
      }

      const formattedDate = formatDateForDatabase(editEnquiryData.preferred_move_in_date || "");

      const updateData: UpdateEnquiryPayload = {
        ...editEnquiryData,
        preferred_move_in_date: formattedDate || " ",
        ...(propertyName && { property_name: propertyName })
      };

      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateEnquiryPayload] === "") {
          delete updateData[key as keyof UpdateEnquiryPayload];
        }
      });

      await updateEnquiry(selectedEnquiry.id, updateData);
      toast.success("Enquiry updated successfully");

      setShowEditDialog(false);
      await loadData(true);
    } catch (error: any) {
      console.error("Error updating enquiry:", error);
      toast.error(error.message || "Failed to update enquiry");
    }
  }, [selectedEnquiry, editEnquiryData, properties, formatDateForDatabase, loadData]);


const handleUpdateStatus = useCallback(async (id: string, status: string) => {
  try {
    // If status is 'converted', trigger the conversion dialog instead
    if (status === 'converted') {
      const enquiry = enquiries.find(e => e.id === id);
      if (enquiry) {
        setConvertEnquiry(enquiry);
      }
      return; // Don't proceed with status update
    }

    // For other statuses, just update normally
    await updateEnquiryStatus(id, status);
    toast.success("Status updated");

    setEnquiries(prev => prev.map(enquiry =>
      enquiry.id === id ? { ...enquiry, status } : enquiry
    ));

    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    toast.error("Failed to update status");
  }
}, [selectedEnquiry, enquiries]);

const [assignEnquiry, setAssignEnquiry] = useState<Enquiry | null>(null);

const handleAssignToStaff = useCallback(async (enquiryId: string, staffId: string) => {
  try {
    await updateEnquiry(enquiryId, { assigned_to: staffId } as any);
    toast.success("Enquiry assigned");
    setAssignEnquiry(null);
    await loadData(true);
  } catch (error: any) {
    console.error("Error assigning enquiry:", error);
    toast.error(error.message || "Failed to assign enquiry");
  }
}, [loadData]);

  const handleAddFollowup = useCallback(async () => {
    if (!followupText.trim()) {
      toast.error("Please enter followup note");
      return;
    }

    if (!selectedEnquiry) {
      toast.error("No enquiry selected");
      return;
    }

    try {
      await addFollowup(selectedEnquiry.id, {
        note: followupText,
        created_by: "Admin"
      });

      toast.success("Followup added");
      setFollowupText("");

      await loadData(true);

      const updatedEnquiry = await getEnquiryById(selectedEnquiry.id);
      if (updatedEnquiry.success) {
        setSelectedEnquiry(updatedEnquiry.data);
      }
    } catch (error) {
      console.error("Error adding followup:", error);
      toast.error("Failed to add followup");
    }
  }, [followupText, selectedEnquiry, loadData]);

const handleDeleteEnquiry = useCallback(async (id: string) => {
  // First find the enquiry name for better confirmation message
  const enquiryToDelete = enquiries.find(e => e.id === id);
  const enquiryName = enquiryToDelete?.tenant_name || "this enquiry";
  
  const result = await MySwal.fire({
    title: 'Delete Enquiry',
    text: `Are you sure you want to delete "${enquiryName}"? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  });

  if (result.isConfirmed) {
    try {
      await deleteEnquiry(id);
      toast.success("Enquiry deleted successfully");
      
      setShowViewDialog(false);
      setShowEditDialog(false);
      
      // Remove from selected rows if present
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
      
      await loadData(true);
      
      // Show success confirmation
      MySwal.fire({
        title: 'Deleted!',
        text: 'The enquiry has been deleted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      toast.error("Failed to delete enquiry");
    }
  }
}, [enquiries, loadData]);

  // Format date for display
 

  // Handle schedule visit
  const handleScheduleVisit = (enquiry: Enquiry) => {
    console.log("Opening schedule dialog for:", enquiry.tenant_name);
    setScheduleVisitEnquiry(enquiry);
  };

  // Handle convert to tenant
const handleConvertToTenant = (enquiry: Enquiry) => {
  setConvertEnquiry(enquiry);
};


  // Get status badge component
  const getStatusBadge = useCallback((status: string) => {
    const variants: any = {
      new: "bg-blue-100 text-blue-800 border-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      interested: "bg-green-100 text-green-800 border-green-200",
      not_interested: "bg-red-100 text-red-800 border-red-200",
      converted: "bg-purple-100 text-purple-800 border-purple-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return (
      <Badge variant="outline" className={`${variants[status] || "bg-gray-100"} capitalize text-xs px-2 py-0.5`}>
        {status}
      </Badge>
    );
  }, []);

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // Clear all column filters
  const clearColumnFilters = () => {
    setColumnFilters({
      name: "",
      contact: "",
      property: "",
      moveInDate: "",
      status: "",
      created: ""
    });
  };

  // Add these handler functions
const handleSelectRow = (id: string) => {
  setSelectedRows(prev => {
    if (prev.includes(id)) {
      return prev.filter(rowId => rowId !== id);
    } else {
      return [...prev, id];
    }
  });
};

const handleSelectAll = () => {
  if (selectAll) {
    setSelectedRows([]);
    setSelectAll(false);
  } else {
    setSelectedRows(filteredEnquiries.map(e => e.id));
    setSelectAll(true);
  }
};

const handleBulkDelete = async () => {
  if (selectedRows.length === 0) {
    toast.error("Please select at least one enquiry to delete");
    return;
  }

  const result = await MySwal.fire({
    title: 'Delete Enquiries',
    text: `Are you sure you want to delete ${selectedRows.length} selected enquiry(s)? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete them!',
    cancelButtonText: 'Cancel'
  });

  if (result.isConfirmed) {
    try {
      const response = await bulkDeleteEnquiries(selectedRows);
      toast.success(response.message || `${selectedRows.length} enquiries deleted successfully`);
      setSelectedRows([]);
      setSelectAll(false);
      await loadData(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete enquiries");
    }
  }
};

const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
const [bulkAssignStaffId, setBulkAssignStaffId] = useState("");

const handleBulkAssign = async () => {
  if (selectedRows.length === 0 || !bulkAssignStaffId) {
    toast.error("Select staff and at least one enquiry");
    return;
  }
  try {
    await Promise.all(
      selectedRows.map(id => updateEnquiry(id, { assigned_to: bulkAssignStaffId } as any))
    );
    toast.success(`Assigned ${selectedRows.length} enquiries`);
    setSelectedRows([]);
    setSelectAll(false);
    setShowBulkAssignDialog(false);
    setBulkAssignStaffId("");
    await loadData(true);
  } catch (error: any) {
    toast.error(error.message || "Failed to assign enquiries");
  }
};

const handleExportEnquiries = useCallback(() => {
  if (filteredEnquiries.length === 0) {
    toast.error("No enquiries to export");
    return;
  }
  const exportData = filteredEnquiries.map(e => ({
    Name: e.tenant_name,
    Phone: e.phone,
    Email: e.email,
    Property: e.property_full_name || e.property_name || "",
    "Move-in Date": formatDateForDisplay(e.preferred_move_in_date),
    Status: e.status,
    Created: formatDateForDisplay(e.created_at || ""),
  }));
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Enquiries");
  XLSX.writeFile(wb, `enquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
  toast.success("Export started");
}, [filteredEnquiries, formatDateForDisplay]);

// Step 1: read file & build preview, open modal
const handleImportEnquiries = useCallback(async (file: File | null) => {
  if (!file) {
    setShowImportDialog(true);  // <-- ADD THIS
    return;
  }
  try {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      toast.error("No rows found in the file");
      return;
    }

    setImportFile(file);
    setImportPreview(rows);
        console.log("[IMPORT] about to open modal, rows:", rows.length);

    setShowImportDialog(true);
  } catch (error) {
    console.error("Import error:", error);
    toast.error("Failed to read the import file");
  }
}, []);

const handleDownloadTemplate = useCallback(() => {
  const templateData = [
    { Name: "Rahul Sharma", Phone: "9876543210", Email: "rahul@example.com", Property: "Roomac Co-Living", "Move-in Date": "2026-07-01", "Budget Range": "8000-10000" },
    { Name: "Priya Patel", Phone: "9123456780", Email: "priya@example.com", Property: "Roomac Co-Living", "Move-in Date": "2026-07-15", "Budget Range": "6000-8000" },
    { Name: "Amit Kumar", Phone: "9988776655", Email: "amit@example.com", Property: "Roomac Co-Living", "Move-in Date": "2026-08-01", "Budget Range": "10000-12000" },
    { Name: "Sneha Joshi", Phone: "9765432100", Email: "sneha@example.com", Property: "Roomac Co-Living", "Move-in Date": "2026-08-10", "Budget Range": "7000-9000" },
  ]
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "enquiries_import_template.xlsx");
}, []);

const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] ?? null;
  if (file) {
    handleImportEnquiries(file);
  }
  e.target.value = "";
}, [handleImportEnquiries]);



// Step 2: user confirms in modal, actually create the rows
const handleImportConfirm = useCallback(async () => {
  if (importPreview.length === 0) return;
  setImporting(true);

  let successCount = 0;
  let failCount = 0;
  const failedRows: string[] = [];

  for (const row of importPreview) {
    const matchedProperty = properties.find(
      (p) => p.name?.toLowerCase().trim() === String(row.Property || row.property_name || "").toLowerCase().trim()
    );

    if (!matchedProperty) {
      failCount++;
      failedRows.push(row.Name || row.tenant_name || "Unknown");
      continue;
    }

    try {
      const result: any = await createEnquiry({
        tenant_name: row.Name || row.tenant_name || "",
        phone: String(row.Phone || row.phone || ""),
        email: row.Email || row.email || "",
        property_id: matchedProperty.id,
        property_name: matchedProperty.name,
        preferred_move_in_date: row["Move-in Date"] || "",
budget_range: row["Budget Range"] || row.budget_range || "Not Specified",
        message: row.message || "",
        source: "import",
        status: "new",
        occupation: row.occupation || "",
        occupation_category: row.occupation_category || "",
        remark: row.remark || "",
      });

      if (result?.success === false) {
        failCount++;
        failedRows.push(row.Name || row.tenant_name || "Unknown");
      } else {
        successCount++;
      }
    } catch (rowError) {
      failCount++;
      failedRows.push(row.Name || row.tenant_name || "Unknown");
    }
  }

  setImporting(false);

  if (successCount > 0) {
    toast.success(`Imported ${successCount} of ${importPreview.length} enquiries`);
  }
  if (failCount > 0) {
    toast.error(
      `Failed to import ${failCount} row(s): ${failedRows.slice(0, 3).join(", ")}${failedRows.length > 3 ? "..." : ""}`
    );
  }

  setShowImportDialog(false);
  setImportFile(null);
  setImportPreview([]);
  await loadData(true);
}, [importPreview, properties, loadData]);

useEffect(() => {
  onRegisterExport?.(handleExportEnquiries);
}, [onRegisterExport, handleExportEnquiries]);

useEffect(() => {
  onRegisterImport?.(handleImportEnquiries);
}, [onRegisterImport, handleImportEnquiries]);

// Register the bulk delete function with parent
useEffect(() => {
  onRegisterBulkDelete?.(handleBulkDelete);
}, [onRegisterBulkDelete, handleBulkDelete]);

  // Check if any column filter is active
  const hasActiveColumnFilters = Object.values(columnFilters).some(value => value !== "");

  return (
  <div className="w-full bg-gray-50 flex flex-col h-[calc(100vh-160px)]">
    <div className="p-0 sm:p-0 md:p-0 lg:p-0 flex flex-col flex-1 min-h-0">
        {/* Header */}
<div className="flex flex-col gap-4 mb-4 mt-2 lg:hidden">
  <div className="flex flex-col sm:flex-row justify-end items-end sm:items-end gap-4">
    <div className="flex flex-wrap items-end justify-end gap-2 w-full sm:w-auto">
      {/* Refresh Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleManualRefresh}
        disabled={loading}
        className="text-sm"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Refresh</span>
      </Button>

        <Button variant="outline" size="sm" onClick={() => handleImportEnquiries(null)} className="text-sm">
    <Upload className="h-4 w-4" />
  </Button>

  {/* Export Button - Mobile only icon */}
  <Button variant="outline" size="sm" onClick={handleExportEnquiries} className="text-sm">
    <Download className="h-4 w-4" />
  </Button>


      {/* Filter Button – NEW */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFilterSidebar(true)}
        className="text-sm"
      >
        <Filter className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Filter</span>
      </Button>

      {/* Bulk Delete Button */}
      {selectedRows.length > 0 && can('delete_enquiries') && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleBulkDelete}
          className="text-sm"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Selected ({selectedRows.length})
        </Button>
      )}
      {selectedRows.length > 0 && can('edit_enquiries') && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => setShowBulkAssignDialog(true)}
    className="text-sm"
  >
    <UserCheck className="h-4 w-4 mr-2" />
    Assign ({selectedRows.length})
  </Button>
)}

      {/* Add Enquiry Button */}
     {/* Add Enquiry Button */}
<Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
  <DialogTrigger asChild>
    {can('create_enquiries') && (
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-sm whitespace-nowrap py-0 px-2 sm:py-0 sm:px-2 h-[35px]"
      >
        <Plus className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Add Enquiry</span>
        <span className="sm:hidden sm:py-2">Add</span>
      </Button>
    )}
  </DialogTrigger>
  <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
      <div>
        <h2 className="text-base font-semibold">Add Enquiry</h2>
        <p className="text-sm text-blue-100">Fill in the details to create a new enquiry</p>
      </div>
      <DialogClose asChild>
        <button className="p-2 rounded-full hover:bg-white/20 transition">
          <X className="h-5 w-5" />
        </button>
      </DialogClose>
    </div>
    <div className="p-4 overflow-y-auto max-h-[75vh]">
      <div className="grid gap-4 py-0">
        <EnquiryForm
          formData={newEnquiry}
          setFormData={setNewEnquiry}
          properties={properties}
          isEdit={false}
        />
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setShowAddDialog(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleAddEnquiry} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Enquiry
          </Button>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>
    </div>
  </div>
</div>

        {/* Stats */}
        {stats && (
          <div className="sm:mb-6  mb-10 sm:mt-4  ">
            <div className="enquiries-stats-compact">
              <EnquiriesStats stats={stats} />
            </div>
          </div>
        )}

        {/* Desktop Filters */}
        <div className="hidden lg:block mb-4">
          <EnquiriesFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>

        {/* Enquiries Table */}
<Card className="border rounded-lg shadow-sm -mt-10 md:-mt-16">          

<CardContent className="p-0 flex flex-col rounded-lg">
<div className="flex flex-col h-[320px] sm:h-[455px]">
<div className="overflow-auto flex-1 min-h-0 rounded-lg">
  <table
    className="border-collapse text-[11px] font-sans "
    style={{ tableLayout: "fixed", minWidth: "1300px", width: "100%" }}
  >
    <colgroup>
      <col style={{ width: "36px" }} />   {/* Checkbox */}
            <col style={{ width: "160px" }} />  {/* Actions */}

      <col style={{ width: "130px" }} />  {/* Name */}
      <col style={{ width: "110px" }} />  {/* Phone */}
      <col style={{ width: "160px" }} />  {/* Email */}
      <col style={{ width: "150px" }} />  {/* Property */}
      <col style={{ width: "100px" }} />  {/* Move-in */}
      <col style={{ width: "90px" }} />   {/* Status */}
      <col style={{ width: "100px" }} />  {/* Created */}
      <col style={{ width: "110px" }} />  {/* Assigned To */}

    </colgroup>

    <thead className="sticky top-0 z-10">
      {/* Title Row */}
      <tr className="bg-gray-200 border-b border-gray-300">
        <th className="px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
          <input type="checkbox" checked={selectAll} onChange={handleSelectAll}
            className="w-3.5 h-3.5 cursor-pointer" />
        </th>
       {[
  "Actions","Name","Phone","Email","Property","Move-in","Status","Created","Assigned To"
].map((h, i) => (
  <th key={h} className={`px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 ${i === 8 ? "border-r-0" : ""}`}>
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">{h}</span>
          </th>
        ))}
      </tr>

      {/* Search Row */}
      <tr className="bg-white border-b border-gray-300">
                <td className="p-1" />

        <td className="p-1 border-r border-gray-200 bg-white" />
      {[
  { key: "name", placeholder: "Search..." },
  { key: "phone", placeholder: "Search..." },
  { key: "email", placeholder: "Search..." },
  { key: "property", placeholder: "Search..." },
  { key: "moveInDate", placeholder: "Search..." },
  { key: "status", placeholder: "Search..." },
  { key: "created", placeholder: "Search..." },
  { key: "assignedTo", placeholder: "Search..." },
].map((field, i) => (
  <td key={field.key} className={`p-1 border-r border-gray-200 ${i === 7 ? "border-r-0" : ""}`}>
            <input
              value={columnFilters[field.key] || ""}
              onChange={(e) => setColumnFilters(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400"
            />
          </td>
        ))}
      </tr>
    </thead>

    <tbody>
      {loading ? (
        <tr><td colSpan={10} className="py-16 text-center text-slate-500 text-xs">Loading...</td></tr>
      ) : paginatedEnquiries.length === 0 ? (
        <tr><td colSpan={10} className="py-12 text-center text-slate-500 text-xs">No enquiries found</td></tr>
      ) : (
        paginatedEnquiries.map((enquiry) => (
          <tr key={enquiry.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
            <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
              <input type="checkbox" checked={selectedRows.includes(enquiry.id)}
                onChange={() => handleSelectRow(enquiry.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-3.5 h-3.5 cursor-pointer" />
            </td>
             <td className="px-1.5 py-1.5 border-r border-slate-100">
              <div className="flex items-center gap-0.5 flex-nowrap">
                {can('schedule_visit') && (
                  <button onClick={(e) => { e.stopPropagation(); handleScheduleVisit(enquiry); }}
                    title="Schedule Visit"
                    className="w-6 h-6 rounded-lg text-purple-600 hover:bg-purple-50 flex items-center justify-center">
                    <Calendar className="h-3 w-3" />
                  </button>
                )}
                {can('view_enquiries') && (
                  <button onClick={() => openViewDialog(enquiry)} title="View"
                    className="w-6 h-6 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center">
                    <Eye className="h-3 w-3" />
                  </button>
                )}
                {can('edit_enquiries') && (
                  <button onClick={() => handleOpenEditDialog(enquiry)} title="Edit"
                    className="w-6 h-6 rounded-lg text-green-600 hover:bg-green-50 flex items-center justify-center">
                    <Edit className="h-3 w-3" />
                  </button>
                )}
                {enquiry.status !== 'converted' && can('convert_to_tenant') && (
                  <button onClick={(e) => { e.stopPropagation(); handleConvertToTenant(enquiry); }}
                    title="Convert to Tenant"
                    className="w-6 h-6 rounded-lg text-emerald-600 hover:bg-emerald-50 flex items-center justify-center">
    <Repeat className="h-3 w-3" />
                  </button>
                )}

                <button onClick={(e) => { e.stopPropagation(); setAssignEnquiry(enquiry); }}
  title="Assign to Staff"
  className="w-6 h-6 rounded-lg text-indigo-600 hover:bg-indigo-50 flex items-center justify-center">
  <UserPlus className="h-3 w-3" />
</button>
                <Select value={enquiry.status || "new"} onValueChange={(v) => handleUpdateStatus(enquiry.id, v)}>
                  <SelectTrigger className="h-6 w-20 text-[9px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["new","contacted","interested","not_interested","closed"].map(s => (
                      <SelectItem key={s} value={s} className="text-[10px]">{s.replace("_"," ")}</SelectItem>
                    ))}
                    <SelectItem value="converted" className="text-[10px] text-purple-600 font-medium">Convert To Tenant</SelectItem>
                  </SelectContent>
                </Select>
                {can('delete_enquiries') && (
                  <button onClick={() => handleDeleteEnquiry(enquiry.id)} title="Delete"
                    className="w-6 h-6 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </td>
            <td className="px-1.5 py-1.5 text-[11px] font-medium text-slate-800 border-r border-slate-100 cursor-pointer hover:text-blue-600 truncate"
              onClick={() => openViewDialog(enquiry)}>
              {enquiry.tenant_name}
            </td>
            <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100 truncate">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 flex-shrink-0 text-slate-400" />
                {enquiry.phone || "—"}
              </div>
            </td>
            <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100 truncate">
              {enquiry.email ? (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 flex-shrink-0 text-slate-400" />
                  <span className="truncate">{enquiry.email}</span>
                </div>
              ) : <span className="text-slate-400">—</span>}
            </td>
            <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100 truncate">
              {enquiry.property_full_name || enquiry.property_name || "—"}
            </td>
            <td className="px-1.5 py-1.5 text-[10px] text-slate-500 border-r border-slate-100 whitespace-nowrap">
              {formatDateForDisplay(enquiry.preferred_move_in_date)}
            </td>
            <td className="px-1.5 py-1.5 border-r border-slate-100">
              {getStatusBadge(enquiry.status || "new")}
            </td>
            <td className="px-1.5 py-1.5 text-[10px] text-slate-400 border-r border-slate-100 whitespace-nowrap">
              {formatDateForDisplay(enquiry.created_at || "")}
            </td>
           <td className="px-1.5 py-1.5 text-[11px] text-slate-600 truncate">
  {enquiry.assigned_staff_name ? (
    <span className="inline-flex items-center gap-1 text-indigo-700">
      <UserCheck className="h-3 w-3 text-indigo-400 flex-shrink-0" />
      {enquiry.assigned_staff_name}
    </span>
  ) : (
    <span className="text-slate-400">Unassigned</span>
  )}
</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
  </div>
</div>
<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-2 sm:py-3 bg-white border-t border-slate-200 rounded-b-lg">
  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[11px] sm:text-xs text-slate-500">
    <span>Show</span>
    <select
      value={itemsPerPage}
      onChange={(e) => {
        const v = e.target.value;
        setItemsPerPage(v === "All" ? "All" : Number(v));
        setCurrentPage(1);
      }}
      className="px-2 py-1 border border-gray-300 rounded text-[11px] bg-white outline-none cursor-pointer"
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
      <option value="All">All</option>
    </select>
    <span>
      entries · Showing {paginatedEnquiries.length} of {filteredEnquiries.length}
    </span>
  </div>

  {itemsPerPage !== "All" &&
    filteredEnquiries.length > 0 &&
    totalPages > 1 && (
      <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="h-7 px-2 text-[11px] border border-gray-300 rounded bg-white disabled:opacity-40"
        >
          Previous
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p = i + 1;

          if (totalPages > 5) {
            if (currentPage <= 3) p = i + 1;
            else if (currentPage >= totalPages - 2)
              p = totalPages - 4 + i;
            else p = currentPage - 2 + i;
          }

          return (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`h-7 w-7 text-[11px] border rounded ${
                currentPage === p
                  ? "bg-blue-600 border-blue-600 text-white font-bold"
                  : "bg-white border-gray-300 text-slate-700"
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() =>
            setCurrentPage((p) => Math.min(totalPages, p + 1))
          }
          disabled={currentPage === totalPages}
          className="h-7 px-2 text-[11px] border border-gray-300 rounded bg-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    )}

  <span className="hidden sm:block text-[11px] text-slate-500 text-center">
  Total: <strong>{filteredEnquiries.length}</strong> enquiries
</span>
</div>

        </CardContent>

        </Card>
      </div>

      {/* View Enquiry Dialog */}
      <EnquiryViewDialog
        enquiry={selectedEnquiry}
        isOpen={showViewDialog}
        onClose={() => {
          setShowViewDialog(false);
          setSelectedEnquiry(null);
        }}
        followupText={followupText}
        setFollowupText={setFollowupText}
        onAddFollowup={handleAddFollowup}
        getStatusBadge={getStatusBadge}
        formatDateForDisplay={formatDateForDisplay}
        onDelete={handleDeleteEnquiry}
        onEnquiryUpdate={() => {
          loadData(true);
        }}
        onConvertToTenant={() => {
          if (selectedEnquiry) {
            setConvertEnquiry(selectedEnquiry);
          }
        }}
      />

      {/* Edit Enquiry Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-2 py-2 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">Edit Enquiry</h2>
              <p className="text-sm text-blue-100">Update enquiry details for {selectedEnquiry?.tenant_name}</p>
            </div>
            <DialogClose asChild>
              <button className="p-2 rounded-full hover:bg-white/20 transition">
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          {/* Body */}
          {selectedEnquiry && (
            <div className="p-2 overflow-y-auto max-h-[75vh]">
              <div className="grid gap-4 py-0">
                <EnquiryForm
                  formData={editEnquiryData}
                  setFormData={setEditEnquiryData}
                  properties={properties}
                  isEdit={true}
                  currentStatus={selectedEnquiry.status}
                />

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                  <div>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sticky bottom-0 z-10 ">
                    <Button variant="outline" onClick={() => setShowEditDialog(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateEnquiry} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                      <Save className="h-4 w-4 mr-2" />
                      Update Enquiry
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Visit Dialog */}
      <ScheduleVisitDialog
        enquiryId={scheduleVisitEnquiry?.id || ""}
        tenantName={scheduleVisitEnquiry?.tenant_name || ""}
        isOpen={!!scheduleVisitEnquiry}
        onClose={() => setScheduleVisitEnquiry(null)}
        onVisitScheduled={() => {
          loadData(true);
          if (selectedEnquiry?.id === scheduleVisitEnquiry?.id) {
            getEnquiryById(selectedEnquiry.id).then(response => {
              if (response.success) {
                setSelectedEnquiry(response.data);
              }
            });
          }
          setScheduleVisitEnquiry(null);
        }}
      />
<ConvertToTenantDialog
  enquiryId={convertEnquiry?.id || ""}
  tenantName={convertEnquiry?.tenant_name || ""}
  isOpen={!!convertEnquiry}
  onClose={() => setConvertEnquiry(null)}
  onConverted={() => {
    // Force a fresh load of data
    loadData(true);
    // Close the view dialog if it's open
    setShowViewDialog(false);
    // Clear the selected enquiry
    setSelectedEnquiry(null);
    // Close the convert dialog
    setConvertEnquiry(null);
    // Show success message
    toast.success("Enquiry converted to tenant successfully");
  }}
/>

{/* Assign to Staff Dialog (single) */}
<Dialog open={!!assignEnquiry} onOpenChange={(open) => { if (!open) { setAssignEnquiry(null); setAssignStaffId(""); } }}>
  <DialogContent className="max-w-md p-0 overflow-hidden">
    <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white px-6 py-4">
      <h2 className="text-lg font-semibold">Assign to Staff</h2>
      <p className="text-sm text-indigo-100">
        Assign "{assignEnquiry?.tenant_name}" to a staff member
      </p>
    </div>
    <div className="p-6 space-y-4">
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-gray-600">Select Staff</Label>
        <Select value={assignStaffId} onValueChange={setAssignStaffId}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Choose a staff member" />
          </SelectTrigger>
          <SelectContent>
            {staffList.map((staff: any) => (
              <SelectItem key={staff.id} value={String(staff.id)}>
                {staff.name} {staff.role_name ? `(${staff.role_name})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => { setAssignEnquiry(null); setAssignStaffId(""); }}>
          Cancel
        </Button>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!assignStaffId}
          onClick={() => assignEnquiry && handleAssignToStaff(assignEnquiry.id, assignStaffId)}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Assign
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

{/* Bulk Assign to Staff Dialog */}
<Dialog open={showBulkAssignDialog} onOpenChange={(open) => { if (!open) { setShowBulkAssignDialog(false); setBulkAssignStaffId(""); } }}>
  <DialogContent className="max-w-md p-0 overflow-hidden">
    <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 text-white px-6 py-4">
      <h2 className="text-lg font-semibold">Bulk Assign to Staff</h2>
      <p className="text-sm text-indigo-100">
        Assign {selectedRows.length} selected enquiry(s) to a staff member
      </p>
    </div>
    <div className="p-6 space-y-4">
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-gray-600">Select Staff</Label>
        <Select value={bulkAssignStaffId} onValueChange={setBulkAssignStaffId}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Choose a staff member" />
          </SelectTrigger>
          <SelectContent>
            {staffList.map((staff: any) => (
              <SelectItem key={staff.id} value={String(staff.id)}>
                {staff.name} {staff.role_name ? `(${staff.role_name})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => { setShowBulkAssignDialog(false); setBulkAssignStaffId(""); }}>
          Cancel
        </Button>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!bulkAssignStaffId}
          onClick={handleBulkAssign}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Assign {selectedRows.length}
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>


{/* Import Enquiries Dialog */}
{showImportDialog && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-blue-700 to-blue-600">
        <h2 className="text-sm font-bold text-white">📥 Import Enquiries</h2>
        <button
          onClick={() => { setShowImportDialog(false); setImportPreview([]); setImportFile(null); }}
          className="text-white/70 hover:text-white text-lg"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Step 1: Download Template */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 mb-2">Step 1: Download Template</p>
          <p className="text-xs text-blue-600 mb-2">
            Template has columns: Name, Phone, Email, Property, Move-in Date. Property must match an existing property name exactly.
          </p>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50"
          >
            <Download size={12} /> Download Template
          </button>
        </div>

        {/* Step 2: Upload Filled Excel */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Step 2: Upload Filled Excel</p>
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              importFile ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <Upload size={20} className={`mx-auto mb-2 ${importFile ? "text-blue-500" : "text-gray-400"}`} />
            <p className="text-xs font-medium text-gray-600">
              {importFile ? importFile.name : "Click to upload Excel file"}
            </p>
            <p className="text-xs text-gray-400 mt-1">.xlsx or .xls files only</p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Step 3: Preview */}
        {importPreview.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Step 3: Preview ({importPreview.length} row{importPreview.length !== 1 ? "s" : ""} found)
            </p>
            <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold text-gray-600">Name</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Phone</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Email</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Property</th>
                    <th className="text-left p-2 font-semibold text-gray-600">Move-in</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row, i) => {
                    const matched = properties.some(
                      (p) => p.name?.toLowerCase().trim() === String(row.Property || row.property_name || "").toLowerCase().trim()
                    );
                    return (
                      <tr key={i} className={`border-b hover:bg-gray-50 ${!matched ? "bg-red-50" : ""}`}>
                        <td className="p-2 font-medium text-gray-800">{row.Name || row.tenant_name || "—"}</td>
                        <td className="p-2 text-gray-600">{row.Phone || row.phone || "—"}</td>
                        <td className="p-2 text-gray-600">{row.Email || row.email || "—"}</td>
                        <td className={`p-2 ${!matched ? "text-red-600 font-medium" : "text-gray-600"}`}>
                          {row.Property || row.property_name || "—"}{!matched ? " (not found)" : ""}
                        </td>
                        <td className="p-2 text-gray-600">{row["Move-in Date"] || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
              ⚠️ Rows with property names highlighted in red will be skipped during import.
            </p>
          </div>
        )}
      </div>

      <div className="px-5 py-4 border-t flex gap-3">
        <button
          onClick={() => { setShowImportDialog(false); setImportPreview([]); setImportFile(null); }}
          className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleImportConfirm}
          disabled={importing || importPreview.length === 0}
          className="flex-1 py-2 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {importing ? (
            <><span className="animate-spin">⟳</span> Importing...</>
          ) : (
            <>✓ Import {importPreview.length > 0 ? `(${importPreview.length} rows)` : ""}</>
          )}
        </button>
      </div>
    </div>
  </div>
)}
{/* Filter Sidebar */}
<Sheet open={showFilterSidebar} onOpenChange={setShowFilterSidebar}>
  <SheetContent
    side="right"
    className="p-0 w-[85vw] min-w-[280px] sm:w-[360px]"
  >
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Filter Enquiries</span>
          {(hasActiveColumnFilters || dateFilters.moveInFrom || dateFilters.moveInTo || dateFilters.createdFrom || dateFilters.createdTo) && (
            <Badge className="text-[9px] px-1.5 py-0 h-4 bg-orange-400 text-white border-0">
              Active
            </Badge>
          )}
        </div>
        <button onClick={() => setShowFilterSidebar(false)} className="text-white/70 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {/* Search */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
            <Search className="w-3 h-3" /> Search
          </Label>
          <Input
            placeholder="Search by name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Status Dropdown */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-blue-700">Status</Label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-8 text-xs rounded-lg border border-gray-200 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-700"
          >
            <option value="">All Status</option>
            {["new", "contacted", "interested", "not_interested", "converted", "closed"].map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Property Dropdown */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-blue-700">Property</Label>
          <select
            value={columnFilters.property}
            onChange={(e) => setColumnFilters((prev) => ({ ...prev, property: e.target.value }))}
            className="w-full h-8 text-xs rounded-lg border border-gray-200 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-700"
          >
            <option value="">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Name + Contact inline */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-gray-500">Name</Label>
            <Input
              placeholder="Filter name..."
              value={columnFilters.name}
              onChange={(e) => setColumnFilters((prev) => ({ ...prev, name: e.target.value }))}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-semibold text-gray-500">Contact</Label>
            <Input
              placeholder="Filter contact..."
              value={columnFilters.contact}
              onChange={(e) => setColumnFilters((prev) => ({ ...prev, contact: e.target.value }))}
              className="h-7 text-xs"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 pt-2">
          <Label className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 mb-2">
            <Calendar className="w-3 h-3" /> Date Range Filters
          </Label>

          {/* Ignore toggle */}
          <label className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={dateFilters.ignoreDateFilters}
              onChange={(e) => setDateFilters(prev => ({ ...prev, ignoreDateFilters: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 flex-shrink-0"
            />
            <div>
              <p className="text-xs font-medium text-gray-700">Ignore Date Filters</p>
              <p className="text-[10px] text-gray-400">Show all data regardless of date</p>
            </div>
          </label>

          {/* Move-in Date Range */}
          <div className={`space-y-1 mb-3 ${dateFilters.ignoreDateFilters ? 'opacity-40 pointer-events-none' : ''}`}>
            <Label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Move-in Date</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <Label className="text-[10px] text-gray-400">From</Label>
                <Input
                  type="date"
                  value={dateFilters.moveInFrom}
                  onChange={(e) => setDateFilters(prev => ({ ...prev, moveInFrom: e.target.value }))}
                  className="h-7 text-xs px-2 w-full"
                />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[10px] text-gray-400">To</Label>
                <Input
                  type="date"
                  value={dateFilters.moveInTo}
                  onChange={(e) => setDateFilters(prev => ({ ...prev, moveInTo: e.target.value }))}
                  className="h-7 text-xs px-2 w-full"
                />
              </div>
            </div>
          </div>

          {/* Created Date Range */}
          <div className={`space-y-1 ${dateFilters.ignoreDateFilters ? 'opacity-40 pointer-events-none' : ''}`}>
            <Label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Created Date</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <Label className="text-[10px] text-gray-400">From</Label>
                <Input
                  type="date"
                  value={dateFilters.createdFrom}
                  onChange={(e) => setDateFilters(prev => ({ ...prev, createdFrom: e.target.value }))}
                  className="h-7 text-xs px-2 w-full"
                />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[10px] text-gray-400">To</Label>
                <Input
                  type="date"
                  value={dateFilters.createdTo}
                  onChange={(e) => setDateFilters(prev => ({ ...prev, createdTo: e.target.value }))}
                  className="h-7 text-xs px-2 w-full"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t p-3 flex gap-2 bg-gray-50 flex-shrink-0">
        <Button
          variant="outline" size="sm"
          className="flex-1 text-xs h-8"
          onClick={() => {
            clearColumnFilters();
            setStatusFilter("");
            setSearchTerm("");
            setDateFilters({
              moveInFrom: "", moveInTo: "",
              createdFrom: "", createdTo: "",
              ignoreDateFilters: false,
            });
          }}
        >
          <RefreshCw className="w-3 h-3 mr-1" /> Reset All
        </Button>
        <Button
          size="sm"
          className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowFilterSidebar(false)}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  </SheetContent>
</Sheet>

      <style>{`
        /* First direct grid child = the 6 status cards grid */
        .enquiries-stats-compact > div > div:first-child {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 0.375rem !important;
        }

        @media (min-width: 640px) {
          .enquiries-stats-compact > div > div:first-child {
            grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
          }
        }

        /* Second direct grid child = the 3 metric cards (bottom row) */
        .enquiries-stats-compact > div > div:nth-child(2) {
          display: grid !important;
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
          gap: 0.375rem !important;
          margin-top: 0.375rem !important;
        }

        @media (min-width: 640px) {
          .enquiries-stats-compact > div > div:nth-child(2) {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        /* Shrink padding on all stat cards */
        .enquiries-stats-compact > div > div > div,
        .enquiries-stats-compact > div > div > div > div {
          padding: 0.375rem 0.5rem !important;
        }

        /* Shrink the big number values inside stat cards */
        .enquiries-stats-compact .text-3xl,
        .enquiries-stats-compact .text-2xl {
          font-size: 1.25rem !important;
          line-height: 1.4 !important;
        }

        /* Shrink the label/title text */
        .enquiries-stats-compact .text-sm {
          font-size: 0.7rem !important;
        }

        /* Shrink progress bars */
        .enquiries-stats-compact .h-2 {
          height: 0.375rem !important;
        }

        /* Reduce card gap from parent */
        .enquiries-stats-compact > div {
          gap: 0 !important;
        }
      `}</style>
    </div>
  );
}