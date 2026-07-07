// app/admin/complaints/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/src/compat/next-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Eye, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Building, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Tag, 
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  FileText,
  X,
  ArrowRight,
  Settings,
  ChevronLeft,
  ChevronRight,
  Delete,
  Trash2
} from "lucide-react";
import {
  getAdminComplaints,
  updateComplaintStatus,
  assignComplaintStaff,
  resolveComplaint,
  getActiveStaff,
  getComplaintById,
  getComplaintCategories,
  bulkDeleteComplaints,
  type Complaint,
  type StaffMember,
  type ComplaintCategory
} from "@/lib/complaintsApi";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/authContext";

export default function ComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortField, setSortField] = useState<keyof Complaint>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [adminNotes, setAdminNotes] = useState("");
  const { can } = useAuth();
  // Add these with your other state declarations
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);

  // Add these state variables for search filters
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    tenant: '',
    complaint: '',
    priority: 'all',
    status: 'all',
    date: ''
  });

  // Add these state variables for bulk actions
  const [selectedComplaints, setSelectedComplaints] = useState<Set<number>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAdminComplaints();
      setComplaints(data);
      
      // Load staff and categories
      await Promise.all([loadStaff(), loadCategories()]);
    } catch (err: any) {
      console.error('Error loading complaints:', err);
      toast.error("Failed to load complaints");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const staffData = await getActiveStaff();
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      setStaff([]);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getComplaintCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadComplaints();
      toast.success("Data refreshed");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewComplaint = async (id: number) => {
    try {
      const complaint = await getComplaintById(id);
      if (complaint) {
        setSelectedComplaint(complaint);
        setShowViewDialog(true);
      } else {
        toast.error("Failed to load complaint details");
      }
    } catch (error) {
      console.error('Error loading complaint details:', error);
      toast.error("Failed to load complaint details");
    }
  };

  const handleOpenStatusDialog = async (complaint: Complaint) => {
    try {
      // Fetch the latest complaint details including existing admin_notes
      const detailedComplaint = await getComplaintById(complaint.id);
      if (detailedComplaint) {
        setSelectedComplaint(detailedComplaint);
        setNewStatus(detailedComplaint.status);
        setAdminNotes(''); // Start with empty for new note
        setShowStatusDialog(true);
      } else {
        // Fallback to the existing complaint data if detailed fetch fails
        setSelectedComplaint(complaint);
        setNewStatus(complaint.status);
        setAdminNotes('');
        setShowStatusDialog(true);
      }
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      // Still open dialog with existing data
      setSelectedComplaint(complaint);
      setNewStatus(complaint.status);
      setAdminNotes('');
      setShowStatusDialog(true);
      toast.error('Could not load full details, using existing data');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateComplaintStatus(id, status, adminNotes);
      toast.success(`Status updated to ${status}${adminNotes ? ' with notes' : ''}`);
      await loadComplaints();
      setShowStatusDialog(false);
      setAdminNotes("");
      setNewStatus("");
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedComplaint || !selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }

    try {
      const staffId = Number(selectedStaffId);
      const staffName = staff.find(s => s.id === staffId)?.name || 'Staff';
      
      await assignComplaintStaff(selectedComplaint.id, staffId);
      toast.success(`Assigned to ${staffName}`);
      setShowAssignDialog(false);
      setSelectedStaffId("");
      await loadComplaints();
    } catch (err: any) {
      console.error('Error assigning staff:', err);
      toast.error(err.message || "Failed to assign staff");
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint || !resolutionNotes.trim()) {
      toast.error("Please provide resolution notes");
      return;
    }

    try {
      await resolveComplaint(selectedComplaint.id, resolutionNotes);
      toast.success("Complaint resolved");
      setShowViewDialog(false);
      setResolutionNotes("");
      await loadComplaints();
    } catch (err: any) {
      console.error('Error resolving complaint:', err);
      toast.error(err.message || "Failed to resolve complaint");
    }
  };

  const handleSort = (field: keyof Complaint) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

 const handleSearchChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectedComplaints.size === filteredComplaints.length) {
      setSelectedComplaints(new Set());
    } else {
      setSelectedComplaints(new Set(filteredComplaints.map(c => c.id)));
    }
  };

  const handleSelectComplaint = (id: number) => {
    const newSelected = new Set(selectedComplaints);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedComplaints(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedComplaints.size === 0) return;
    
    try {
      setBulkActionLoading(true);
      await bulkDeleteComplaints(Array.from(selectedComplaints));
      toast.success(`Successfully deleted ${selectedComplaints.size} complaints`);
      setSelectedComplaints(new Set());
      setShowBulkDeleteDialog(false);
      await loadComplaints();
    } catch (error: any) {
      console.error('Error deleting complaints:', error);
      toast.error(error.message || "Failed to delete complaints");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "destructive",
      in_progress: "default",
      resolved: "secondary",
      closed: "outline"
    };

    const badgeText = status === 'in_progress' ? 'In Progress' : 
                     status.charAt(0).toUpperCase() + status.slice(1);
    
    return (
      <Badge variant={statusMap[status] || "default"}>
        {badgeText}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 mr-1" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 mr-1 animate-spin" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'closed': return <XCircle className="h-4 w-4 mr-1" />;
      default: return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "outline",
      medium: "secondary",
      high: "default",
      urgent: "destructive"
    };

    const badgeText = priority.charAt(0).toUpperCase() + priority.slice(1);
    
    return (
      <Badge variant={priorityMap[priority] || "default"}>
        {badgeText}
      </Badge>
    );
  };

  const getCategoryColor = (categoryName?: string) => {
    switch (categoryName?.toLowerCase()) {
      case 'food': return 'bg-red-100 text-red-800 border-red-200';
      case 'room': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staff': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Sort complaints
  const sortedComplaints = [...complaints].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Filtered complaints
  const filteredComplaints = sortedComplaints.filter(complaint => {
    const matchesId = complaint.id.toString().includes(searchFilters.id);
    const matchesTenant = (complaint.tenant_name || '').toLowerCase().includes(searchFilters.tenant.toLowerCase());
    const matchesComplaint = (complaint.title || '').toLowerCase().includes(searchFilters.complaint.toLowerCase()) ||
                            (complaint.complaint_reason || '').toLowerCase().includes(searchFilters.complaint.toLowerCase());
    const matchesPriority = searchFilters.priority === 'all' || complaint.priority === searchFilters.priority;
    const matchesStatus = searchFilters.status === 'all' || complaint.status === searchFilters.status;
    const matchesDate =
  !searchFilters.date ||
  new Date(complaint.created_at).toLocaleDateString("en-CA") === searchFilters.date;
    
    return matchesId && matchesTenant && matchesComplaint && matchesPriority && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center  gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-4 -mt-5 md:-mt-2 sticky top-24 z-10">
        {/* Total Complaints */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Total Complaints
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {complaints.length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-600">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Pending
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {complaints.filter(c => c.status === 'pending').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-yellow-600">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  In Progress
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {complaints.filter(c => c.status === 'in_progress').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resolved */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Resolved
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-green-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
{can('delete_requests') && selectedComplaints.size > 0 && (
  <div className="px-1 pb-2">
    <div className="flex items-center justify-between gap-2 sm:gap-3 border border-[#E2E8F4] rounded-xl px-2 sm:px-3 py-2 min-h-[40px] sm:min-h-[44px] bg-white shadow-sm">

      {/* Selected Count */}
      <span className="font-bold text-[#1A2B6D] text-[11px] sm:text-sm whitespace-nowrap shrink-0">
        {selectedComplaints.size}{" "}
        {selectedComplaints.size === 1 ? "complaint" : "complaints"} selected
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">

        <button
          onClick={() => setSelectedComplaints(new Set())}
          className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-[#8892A4] hover:text-gray-600 px-1.5 sm:px-2 py-1 transition-colors whitespace-nowrap"
        >
          <X className="h-3 w-3" />
          <span className="hidden sm:inline">Clear</span>
        </button>

        <button
          onClick={() => setShowBulkDeleteDialog(true)}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-[10px] sm:text-xs font-bold text-[#DC2626] hover:bg-red-100 transition-colors whitespace-nowrap"
        >
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="sm:hidden">
            {selectedComplaints.size}
          </span>
          <span className="hidden sm:inline">
            Delete {selectedComplaints.size}
          </span>
        </button>

      </div>

    </div>
  </div>
)}

      <Card className="shadow-sm ">
        <CardContent className="p-0">
          {complaints.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 m-6 rounded-lg">
              <div className="bg-white p-8 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-sm">
                <AlertCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
              <p className="text-gray-500 mb-4">No tenant complaints have been submitted yet.</p>
            </div>
          ) : (
      <div className="relative">
  <div
    className={`overflow-auto rounded-md border border-gray-200 transition-all duration-300 ${
      selectedComplaints.size > 0
        ? "h-[350px] md:h-[410px]"
        : "h-[400px] md:h-[450px]"
    }`}
  >
    <table className="w-full min-w-[1100px] table-fixed border-collapse">
      <colgroup>
        <col style={{ width: "34px" }} />   {/* checkbox */}
        <col style={{ width: "70px" }} />   {/* ID */}
        <col style={{ width: "90px" }} />   {/* Actions */}
        <col style={{ width: "130px" }} />  {/* Tenant */}
        <col style={{ width: "150px" }} />  {/* Property / Room */}
        <col style={{ width: "auto" }} />   {/* Complaint Details */}
        <col style={{ width: "100px" }} />  {/* Priority */}
        <col style={{ width: "100px" }} />  {/* Status */}
        <col style={{ width: "130px" }} />  {/* Date & Time */}
      </colgroup>

      <thead className="sticky top-0 z-10">
        {/* Row 1: Column Titles */}
        <tr className="bg-gray-200 border-b border-gray-300">
          <th className="py-0.5 px-1 text-center border-r border-gray-300 bg-gray-200">
            {can('delete_requests') && (
              <input
                type="checkbox"
                checked={selectedComplaints.size === filteredComplaints.length && filteredComplaints.length > 0}
                onChange={handleSelectAll}
                className="w-3.5 h-3.5 cursor-pointer"
              />
            )}
          </th>
          <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
            <div className="flex items-center gap-0.5 cursor-pointer" onClick={() => handleSort('id')}>
              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">ID</span>
              <ArrowUpDown className="h-2.5 w-2.5 text-gray-400" />
            </div>
          </th>
          <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Actions</span>
          </th>
          <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Tenant</span>
          </th>
          <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Property / Room</span>
          </th>
          <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
            <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Complaint Details</span>
          </th>
          <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
            <div className="flex items-center gap-0.5 cursor-pointer" onClick={() => handleSort('priority')}>
              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Priority</span>
              <ArrowUpDown className="h-2.5 w-2.5 text-gray-400" />
            </div>
          </th>
          <th className="py-0.5 px-1 text-left border-r border-gray-300 bg-gray-200">
            <div className="flex items-center gap-0.5 cursor-pointer" onClick={() => handleSort('status')}>
              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Status</span>
              <ArrowUpDown className="h-2.5 w-2.5 text-gray-400" />
            </div>
          </th>
          <th className="py-0.5 px-1 text-left bg-gray-200">
            <div className="flex items-center gap-0.5 cursor-pointer" onClick={() => handleSort('created_at')}>
              <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">Date & Time</span>
              <ArrowUpDown className="h-2.5 w-2.5 text-gray-400" />
            </div>
          </th>
        </tr>

        {/* Row 2: Search Inputs - with visible borders */}
        <tr className="bg-white border-b border-gray-300">
          <td className="p-0.5 border-r border-gray-200 text-center" />
          <td className="p-0.5 border-r border-gray-200">
            <input
              type="text"
              placeholder="Search ID…"
              className="h-5 w-full text-[10px] border border-gray-300 rounded bg-white px-1 focus:border-blue-400 focus:ring-0 outline-none"
              value={searchFilters.id}
              onChange={(e) => handleSearchChange('id', e.target.value)}
            />
          </td>
          <td className="p-0.5 border-r border-gray-200" />
          <td className="p-0.5 border-r border-gray-200">
            <input
              type="text"
              placeholder="Search tenant…"
              className="h-5 w-full text-[10px] border border-gray-300 rounded bg-white px-1 focus:border-blue-400 focus:ring-0 outline-none"
              value={searchFilters.tenant}
              onChange={(e) => handleSearchChange('tenant', e.target.value)}
            />
          </td>
          <td className="p-0.5 border-r border-gray-200" />
          <td className="p-0.5 border-r border-gray-200">
            <input
              type="text"
              placeholder="Search complaints…"
              className="h-5 w-full text-[10px] border border-gray-300 rounded bg-white px-1 focus:border-blue-400 focus:ring-0 outline-none"
              value={searchFilters.complaint}
              onChange={(e) => handleSearchChange('complaint', e.target.value)}
            />
          </td>
          <td className="p-0.5 border-r border-gray-200">
            <select
              value={searchFilters.priority || 'all'}
              onChange={(e) => handleSearchChange('priority', e.target.value)}
              className="h-5 w-full text-[10px] border border-gray-300 rounded bg-white px-1 focus:border-blue-400 focus:ring-0 outline-none"
            >
              <option value="all">All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </td>
          <td className="p-0.5 border-r border-gray-200">
            <select
              value={searchFilters.status || 'all'}
              onChange={(e) => handleSearchChange('status', e.target.value)}
              className="h-5 w-full text-[10px] border border-gray-300 rounded bg-white px-1 focus:border-blue-400 focus:ring-0 outline-none"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </td>
          <td className="p-0.5">
            <input
              type="date"
              className="h-5 w-full text-[10px] border border-gray-300 rounded bg-white px-1 focus:border-blue-400 focus:ring-0 outline-none"
              value={searchFilters.date}
              onChange={(e) => handleSearchChange('date', e.target.value)}
            />
          </td>
        </tr>
      </thead>

      <tbody>
        {filteredComplaints
          .slice(
            (currentPage - 1) *
              (itemsPerPage === 'all' ? filteredComplaints.length : Number(itemsPerPage)),
            currentPage *
              (itemsPerPage === 'all' ? filteredComplaints.length : Number(itemsPerPage))
          )
          .map((complaint, index) => {
            const rowBgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40';
            return (
              <tr
                key={complaint.id}
                className={`hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 ${rowBgClass}`}
              >
                {/* Checkbox */}
                <td className={`py-0.5 px-1 text-center border-r border-gray-100 ${rowBgClass}`}>
                  {can('delete_requests') && (
                    <input
                      type="checkbox"
                      checked={selectedComplaints.has(complaint.id)}
                      onChange={() => handleSelectComplaint(complaint.id)}
                      className="w-3.5 h-3.5 cursor-pointer"
                    />
                  )}
                </td>

                {/* ID */}
                <td className={`py-0.5 px-1 border-r border-gray-100 ${rowBgClass}`}>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    <span className="text-[10px] font-mono font-medium text-blue-600 truncate">#{complaint.id}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className={`py-0.5 px-0.5 border-r border-gray-100 ${rowBgClass}`}>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleViewComplaint(complaint.id)}
                      className="h-5 w-5 rounded hover:bg-blue-100 flex items-center justify-center"
                      title="View"
                    >
                      <Eye className="h-2.5 w-2.5 text-blue-500" />
                    </button>
                    {can('manage_complaints') && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowAssignDialog(true);
                        }}
                        className="h-5 w-5 rounded hover:bg-green-100 flex items-center justify-center"
                        title="Assign Staff"
                      >
                        <UserPlus className="h-2.5 w-2.5 text-green-600" />
                      </button>
                    )}
                    {can('manage_complaints') && (
                      <button
                        onClick={() => handleOpenStatusDialog(complaint)}
                        className="h-5 w-5 rounded hover:bg-purple-100 flex items-center justify-center"
                        title="Update Status"
                      >
                        <Settings className="h-2.5 w-2.5 text-purple-500" />
                      </button>
                    )}
                  </div>
                </td>

                {/* Tenant */}
                <td className={`py-0.5 px-1 border-r border-gray-100 ${rowBgClass}`}>
                  <div className="flex items-center gap-1">
                    <div className="bg-blue-100 p-0.5 rounded-full flex-shrink-0">
                      <User className="h-2.5 w-2.5 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-medium truncate">
                      {complaint.tenant_name || "Unknown"}
                    </span>
                  </div>
                </td>

                {/* Property & Room */}
                <td className={`py-0.5 px-1 border-r border-gray-100 ${rowBgClass}`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-0.5 text-[10px] text-gray-700">
                      <Building className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{complaint.property_name || "Not specified"}</span>
                    </div>
                    {complaint.room_info && complaint.room_info !== 'Not assigned' && (
                      <div className="text-[9px] text-gray-500 flex items-center gap-0.5">
                        <span>🏠</span>
                        <span className="truncate">{complaint.room_info}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Complaint Details */}
                <td className={`py-0.5 px-1 border-r border-gray-100 ${rowBgClass}`}>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-0.5">
                      <span className="text-[10px] font-medium text-gray-800 line-clamp-1">
                        {complaint.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[8px] border-0 shadow-sm px-1 py-0 h-3 flex-shrink-0 ${getCategoryColor(
                          complaint.complaint_details?.category_name || complaint.complaint_category
                        )}`}
                      >
                        {complaint.complaint_details?.category_name || complaint.complaint_category || 'General'}
                      </Badge>
                    </div>
                    <div className="text-[9px] text-gray-500 line-clamp-1">
                      {complaint.complaint_details?.complaint_reason ||
                        complaint.complaint_reason ||
                        "No reason specified"}
                    </div>
                  </div>
                </td>

                {/* Priority */}
                <td className={`py-0.5 px-1 border-r border-gray-100 ${rowBgClass}`}>
                  {getPriorityBadge(complaint.priority)}
                </td>

                {/* Status */}
                <td className={`py-0.5 px-1 border-r border-gray-100 ${rowBgClass}`}>
                  <span
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full inline-block whitespace-nowrap
                      ${complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : ''}
                      ${complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : ''}
                      ${complaint.status === 'closed' ? 'bg-gray-100 text-gray-700' : ''}
                    `}
                  >
                    {complaint.status === 'in_progress' ? 'In Progress' :
                      complaint.status?.charAt(0).toUpperCase() + complaint.status?.slice(1) || 'Pending'}
                  </span>
                </td>

                {/* Date & Time */}
                <td className={`py-0.5 px-1 ${rowBgClass}`}>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-medium whitespace-nowrap">
                      {new Date(complaint.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-[9px] text-gray-500 whitespace-nowrap">
                      {new Date(complaint.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-3 py-1.5 rounded-b-lg">
    <div className="flex flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 whitespace-nowrap text-[10px]">
          {filteredComplaints.length} complaints
        </span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(val) => {
            setItemsPerPage(val === "all" ? "all" : parseInt(val));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-5 w-14 text-[10px] border border-gray-200 rounded px-1 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="h-5 w-5 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-100"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        <span className="text-[10px] text-gray-600 px-1 whitespace-nowrap">
          {currentPage}/
          {Math.ceil(
            filteredComplaints.length /
              (itemsPerPage === "all" ? filteredComplaints.length : Number(itemsPerPage))
          ) || 1}
        </span>
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={
            currentPage >=
            Math.ceil(
              filteredComplaints.length /
                (itemsPerPage === "all" ? filteredComplaints.length : Number(itemsPerPage))
            )
          }
          className="h-5 w-5 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-100"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>
</div>
          )}
        </CardContent>
      </Card>

      {/* View Complaint Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-2 py-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <MessageSquare className="h-4 w-4" />
                Complaint Details - #{selectedComplaint?.id}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowViewDialog(false)}
                className="h-7 w-7 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50 text-xs mt-1">
              Complete information about the complaint
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="p-4 sm:p-5 space-y-3 max-h-[80vh] overflow-y-auto">
              {/* Status + Priority */}
             <div className="flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-md text-xs">
  <div className="flex items-center gap-1">
    <span className="text-gray-500">Status:</span>
    {getStatusBadge(selectedComplaint.status)}
  </div>
  <div className="flex items-center gap-1">
    <span className="text-gray-500">Priority:</span>
    {getPriorityBadge(selectedComplaint.priority)}
  </div>
  <div className="flex items-center gap-1">
    <span className="text-gray-500">Category:</span>
    <Badge 
      variant="outline" 
      className={`text-[10px] px-2 py-0 ${getCategoryColor(
        selectedComplaint.complaint_details?.category_name || 
        selectedComplaint.complaint_category
      )}`}
    >
      {selectedComplaint.complaint_details?.category_name || 
       selectedComplaint.complaint_category || 
       'General'}
    </Badge>
  </div>
</div>

              {/* Tenant Info */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
                  <User className="h-3 w-3" />
                  Tenant Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Name</span>
                    <p className="font-medium truncate">{selectedComplaint.tenant_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Property</span>
                    <p className="flex items-center gap-1 truncate">
                      <Building className="h-3 w-3 text-gray-400" />
                      {selectedComplaint.property_name || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email</span>
                    <p className="flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {selectedComplaint.tenant_email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone</span>
                    <p className="flex items-center gap-1 truncate">
                      <Phone className="h-3 w-3 text-gray-400" />
                      {selectedComplaint.tenant_phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Complaint Details */}
             {/* Complaint Details */}
<div className="border rounded-md p-3">
  <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
    <MessageSquare className="h-3 w-3" />
    Complaint Details
  </h4>
  <div className="space-y-2 text-xs">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <span className="text-gray-500">Title</span>
        <p className="font-medium truncate">{selectedComplaint.title}</p>
      </div>
      <div>
        <span className="text-gray-500">Created</span>
        <p>{new Date(selectedComplaint.created_at).toLocaleString()}</p>
      </div>
    </div>
    <div>
      <span className="text-gray-500">Category</span>
      <div className="mt-1">
        <Badge 
          variant="outline" 
          className={`${getCategoryColor(selectedComplaint.complaint_details?.category_name || selectedComplaint.complaint_category)}`}
        >
          {selectedComplaint.complaint_details?.category_name || selectedComplaint.complaint_category || 'General'}
        </Badge>
      </div>
    </div>
    <div>
      <span className="text-gray-500">Reason</span>
      <div className="bg-gray-50 p-2 rounded mt-1">
        {selectedComplaint.complaint_details?.complaint_reason || 
         selectedComplaint.complaint_reason || 
         "No reason specified"}
      </div>
    </div>
    <div>
      <span className="text-gray-500">Description</span>
      <div className="bg-gray-50 p-2 rounded mt-1 max-h-24 overflow-y-auto">
        {selectedComplaint.description}
      </div>
    </div>
  </div>
</div>

              {/* Admin Notes History */}
              {selectedComplaint.admin_notes && (
                <div className="border rounded-md p-3">
                  <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
                    <FileText className="h-3 w-3" />
                    Admin Notes & History
                  </h4>
                  <div className="bg-gray-50 p-2 rounded max-h-40 overflow-y-auto text-xs">
                    {selectedComplaint.admin_notes.split('\n').map((line, idx) => {
                      if (line.includes('----------------------------------------')) {
                        return <hr key={idx} className="my-2 border-gray-300" />;
                      }
                      if (line.includes('[') && line.includes(']')) {
                        return <div key={idx} className="text-blue-600 font-mono mt-2">{line}</div>;
                      }
                      if (line.trim().startsWith('Note:')) {
                        return <div key={idx} className="text-gray-700 pl-2 border-l-2 border-blue-300 ml-2 mt-1">{line}</div>;
                      }
                      if (line.trim().startsWith('Status:')) {
                        return <div key={idx} className="font-medium text-blue-700 mt-1">{line}</div>;
                      }
                      if (line.trim() && !line.includes('--- Complaint History ---')) {
                        return <div key={idx} className="text-gray-500 pl-2">{line}</div>;
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Management */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold mb-2 text-blue-600">
                  Management
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Assigned To</span>
                    {selectedComplaint.staff_name ? (
                      <p className="font-medium">{selectedComplaint.staff_name}</p>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs mt-1"
                        onClick={() => {
                          setShowViewDialog(false);
                          setSelectedComplaint(selectedComplaint);
                          setShowAssignDialog(true);
                        }}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Assign Staff
                      </Button>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Status</span>
                    <div className="flex items-center gap-1 mt-1">
                      {getStatusIcon(selectedComplaint.status)}
                      {getStatusBadge(selectedComplaint.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution */}
              {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'closed' && (
                <div className="border rounded-md p-3">
                  <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
                    <CheckCircle className="h-3 w-3" />
                    Resolution
                  </h4>
                  <div className="space-y-2">
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter resolution notes..."
                      rows={2}
                      className="text-xs min-h-[70px]"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={handleResolve}
                        disabled={!resolutionNotes.trim()}
                        className="flex-1 h-8 text-xs bg-gradient-to-r from-blue-500 to-cyan-500"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleUpdateStatus(selectedComplaint.id, 'closed');
                          setShowViewDialog(false);
                        }}
                        className="h-8 text-xs"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Staff Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-2xl w-full p-0 gap-0">
          <DialogHeader className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white p-1 rounded-t-lg">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-md">
                <UserPlus className="h-3 w-3" />
                Assign Staff
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowAssignDialog(false)}
                className="h-5 w-5 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50">
              Assign staff member to handle complaint #{selectedComplaint?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Complaint Information</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Complaint ID</span>
                      <p className="font-medium text-sm">#{selectedComplaint.id}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Title</span>
                      <p className="text-sm">{selectedComplaint.title}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Tenant</span>
                      <p className="text-sm">{selectedComplaint.tenant_name}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Select Staff Member</h4>
                  <div className="space-y-3">
                    <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Choose staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.length === 0 ? (
                          <SelectItem value="" disabled>No staff available</SelectItem>
                        ) : (
                          staff.map((staffMember) => (
                            <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{staffMember.name}</span>
                                <span className="text-xs text-gray-500">
                                  {staffMember.role} • {staffMember.department}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedStaffId && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600 mb-1">Selected Staff:</p>
                        <p className="font-medium text-sm">
                          {staff.find(s => s.id.toString() === selectedStaffId)?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignStaff}
                  disabled={!selectedStaffId}
                  className="px-6 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white"
                >
                  Assign Staff
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog - Enhanced with existing notes */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-2xl w-full p-0 gap-0">
          <DialogHeader className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white p-2 rounded-t-lg">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white">
                <FileText className="h-4 w-4" />
                Update Status
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setShowStatusDialog(false);
                  setAdminNotes("");
                  setNewStatus("");
                }}
                className="h-3 w-3 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50">
              Update status for complaint #{selectedComplaint?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Status */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Current Status</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedComplaint.status)}
                      {getStatusBadge(selectedComplaint.status)}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-xs text-gray-500">Last Updated:</span>
                      <p className="font-medium">{new Date(selectedComplaint.updated_at || selectedComplaint.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* New Status Selection */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Select New Status</h4>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Choose new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Pending</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4" />
                          <span>In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="resolved">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Resolved</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="closed">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          <span>Closed</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  
                </div>
              </div>

              {/* Existing Admin Notes History */}
              {selectedComplaint.admin_notes && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Previous Notes & History
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                    {selectedComplaint.admin_notes.split('\n').map((line, idx) => {
                      const hasTimestamp = line.includes('[') && line.includes(']');
                      const isSeparator = line.includes('----------------------------------------');
                      
                      if (isSeparator) {
                        return <hr key={idx} className="my-2 border-gray-300" />;
                      }
                      
                      if (hasTimestamp) {
                        return (
                          <div key={idx} className="text-xs text-blue-600 font-mono mt-2">
                            {line}
                          </div>
                        );
                      }
                      
                      if (line.trim().startsWith('Note:')) {
                        return (
                          <div key={idx} className="text-sm text-gray-700 pl-2 border-l-2 border-blue-300 ml-2 mt-1">
                            {line}
                          </div>
                        );
                      }
                      
                      if (line.trim().startsWith('Status:')) {
                        return (
                          <div key={idx} className="text-sm font-medium text-blue-700 mt-1">
                            {line}
                          </div>
                        );
                      }
                      
                      if (line.trim() && !line.includes('--- Complaint History ---')) {
                        return (
                          <div key={idx} className="text-xs text-gray-500 pl-2">
                            {line}
                          </div>
                        );
                      }
                      
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Admin Notes Section - for new note */}
              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  Add New Note
                </h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter notes about this status update (optional but recommended)"
                  rows={3}
                  className="w-full text-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-500">
                  This note will be appended to the history and visible to the tenant.
                </p>
              </div>

              <DialogFooter className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStatusDialog(false);
                    setAdminNotes("");
                    setNewStatus("");
                  }}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedComplaint.id, newStatus)}
                  disabled={!newStatus}
                  className="px-6bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white"
                >
                  Update Status
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Bulk Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedComplaints.size} {selectedComplaints.size === 1 ? 'complaint' : 'complaints'}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 p-3 rounded-md my-2 max-h-40 overflow-y-auto">
            <p className="text-xs font-medium text-red-800 mb-2">Selected complaints:</p>
            <ul className="text-xs text-red-700 space-y-1">
              {Array.from(selectedComplaints).slice(0, 5).map(id => {
                const complaint = complaints.find(c => c.id === id);
                return (
                  <li key={id} className="flex items-center gap-2">
                    <span className="font-mono">#{id}</span>
                    <span className="truncate">- {complaint?.title || 'Unknown'}</span>
                  </li>
                );
              })}
              {selectedComplaints.size > 5 && (
                <li className="text-red-600 font-medium">
                  ...and {selectedComplaints.size - 5} more
                </li>
              )}
            </ul>
          </div>
          
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(false)}
              disabled={bulkActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkActionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Delete {selectedComplaints.size} {selectedComplaints.size === 1 ? 'Complaint' : 'Complaints'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}