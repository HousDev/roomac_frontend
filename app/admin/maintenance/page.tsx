
// app/admin/maintenance/page.tsx - UPDATED
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/src/compat/next-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Eye, AlertCircle, Loader2, RefreshCw, Building, 
  Wrench, Home, User, Calendar, Clock, CheckCircle, 
  XCircle, AlertTriangle, MessageSquare, MoreVertical,
  UserPlus, Settings, Check, X, ArrowUpDown, Tag, Phone, Mail
} from "lucide-react";
import {
  getAdminMaintenanceRequests,
  updateMaintenanceStatus,
  assignMaintenanceStaff,
    bulkDeleteMaintenanceRequests,  // Add this line
  resolveMaintenance,
  getActiveStaff,
  type MaintenanceRequest
} from "@/lib/maintenanceApi";
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

export default function MaintenancePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedActionRequest, setSelectedActionRequest] = useState<MaintenanceRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [sortField, setSortField] = useState<keyof MaintenanceRequest>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [adminNotes, setAdminNotes] = useState("");
  // Add these state variables for bulk actions
const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const { can } = useAuth();
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);

  // Search filters for all columns
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    tenant: '',
    title: '',
    property: '',
    priority: 'all',
    status: 'all',
    assignedTo: '',
    date: ''
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) {
      return;
    }
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAdminMaintenanceRequests();
      setRequests(data);
      
      // Load staff
      await loadStaff();
    } catch (err: any) {
      console.error('Error loading maintenance requests:', err);
      toast.error("Failed to load maintenance requests");
      setRequests([]);
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

  const fetchMaintenanceRequestDetails = async (id: number): Promise<MaintenanceRequest | null> => {
  try {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/maintenance/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching maintenance details:', error);
    return null;
  }
};

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadRequests();
      toast.success("Data refreshed");
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

// Update the handleUpdateStatus function
const handleUpdateStatus = async (id: number, status: string) => {
  try {
    setUpdating(true);
    await updateMaintenanceStatus(id, status, adminNotes); // Pass admin notes
    toast.success(`Status updated to ${status}${adminNotes ? ' with notes' : ''}`);
    await loadRequests();
    setShowStatusDialog(false);
    setSelectedActionRequest(null);
    setNewStatus("");
    setAdminNotes(""); // Reset admin notes
  } catch (err: any) {
    console.error('Error updating status:', err);
    toast.error(err.message || "Failed to update status");
  } finally {
    setUpdating(false);
  }
};

  const handleAssignStaff = async (requestId: number, staffId: string) => {
    if (staffId === "no_staff" || !staffId) return;

    try {
      setUpdating(true);

      if (staffId === "unassigned") {
        await assignMaintenanceStaff(requestId, 0);
        toast.success("Staff unassigned");
      } else {
        await assignMaintenanceStaff(requestId, Number(staffId));
        toast.success("Staff assigned");
      }

      await loadRequests();
      setShowAssignDialog(false);
      setSelectedActionRequest(null);
      setSelectedStaffId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to assign staff");
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedRequest || !resolutionNotes.trim()) {
      toast.error("Please provide resolution notes");
      return;
    }

    try {
      setUpdating(true);
      await resolveMaintenance(selectedRequest.id, resolutionNotes);
      toast.success("Maintenance request resolved");
      setShowDialog(false);
      setResolutionNotes("");
      await loadRequests();
    } catch (err: any) {
      console.error('Error resolving request:', err);
      toast.error(err.message || "Failed to resolve request");
    } finally {
      setUpdating(false);
    }
  };

  const handleSort = (field: keyof MaintenanceRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSearchChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
  };

  // Add handler for checkbox selection
const handleSelectAll = () => {
  if (selectedRequests.size === filteredRequests.length) {
    setSelectedRequests(new Set());
  } else {
    setSelectedRequests(new Set(filteredRequests.map(r => r.id)));
  }
};

const handleSelectRequest = (id: number) => {
  const newSelected = new Set(selectedRequests);
  if (newSelected.has(id)) {
    newSelected.delete(id);
  } else {
    newSelected.add(id);
  }
  setSelectedRequests(newSelected);
};

// Add bulk delete handler
const handleBulkDelete = async () => {
  if (selectedRequests.size === 0) return;
  
  try {
    setBulkActionLoading(true);
    // You'll need to add this function to your maintenanceApi
    await bulkDeleteMaintenanceRequests(Array.from(selectedRequests));
    toast.success(`Successfully deleted ${selectedRequests.size} maintenance requests`);
    setSelectedRequests(new Set());
    setShowBulkDeleteDialog(false);
    await loadRequests(); // Refresh the list
  } catch (error: any) {
    console.error('Error deleting maintenance requests:', error);
    toast.error(error.message || "Failed to delete maintenance requests");
  } finally {
    setBulkActionLoading(false);
  }
};
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: 'destructive', icon: Clock },
      in_progress: { variant: 'default', icon: AlertCircle },
      resolved: { variant: 'secondary', icon: CheckCircle },
      closed: { variant: 'outline', icon: XCircle }
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs px-2 py-0.5">
        <Icon className="h-3 w-3" />
        {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      low: { variant: 'outline', icon: CheckCircle },
      medium: { variant: 'secondary', icon: AlertCircle },
      high: { variant: 'default', icon: AlertTriangle },
      urgent: { variant: 'destructive', icon: AlertTriangle }
    };

    const config = priorityMap[priority] || priorityMap.medium;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs px-2 py-0.5">
        <Icon className="h-3 w-3" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'in_progress': return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'resolved': return <CheckCircle className="h-3 w-3" />;
      case 'closed': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  // Sort requests
  const sortedRequests = [...requests].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter requests with all column filters
  const filteredRequests = sortedRequests.filter(request => {
    const matchesId = request.id.toString().includes(searchFilters.id);
    const matchesTenant = (request.tenant_name || '').toLowerCase().includes(searchFilters.tenant.toLowerCase());
    const matchesTitle = (request.title || '').toLowerCase().includes(searchFilters.title.toLowerCase());
    const matchesProperty = (request.property_name || '').toLowerCase().includes(searchFilters.property.toLowerCase());
    const matchesPriority = searchFilters.priority === 'all' || request.priority === searchFilters.priority;
    const matchesStatus = searchFilters.status === 'all' || request.status === searchFilters.status;
    const matchesAssignedTo = (request.staff_name || '').toLowerCase().includes(searchFilters.assignedTo.toLowerCase());
    const matchesDate = !searchFilters.date || 
                        new Date(request.created_at).toISOString().split('T')[0] === searchFilters.date;
    
    return matchesId && matchesTenant && matchesTitle && matchesProperty && 
           matchesPriority && matchesStatus && matchesAssignedTo && matchesDate;
  });

  // Handle view details action
  const handleViewDetails = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowDialog(true);
  };

  // Handle assign staff action
  const handleOpenAssignStaff = (request: MaintenanceRequest) => {
    setSelectedActionRequest(request);
    setSelectedStaffId(request.assigned_to?.toString() || "unassigned");
    setShowAssignDialog(true);
  };

  // Handle update status action
  const handleOpenUpdateStatus = (request: MaintenanceRequest) => {
    setSelectedActionRequest(request);
    setNewStatus(request.status);
    setShowStatusDialog(true);
  };

  // Format status for display
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pending",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed"
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading maintenance requests...</p>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 ">
     

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-2 px-0 sticky top-24 z-10">
        {/* Total Requests */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Total Requests
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {requests.length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-600">
                <Wrench className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
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
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-yellow-600">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
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
                  {requests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-600">
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
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
                  {requests.filter(r => r.status === 'resolved' || r.status === 'closed').length}
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
{can('delete_requests') && selectedRequests.size > 0 && (
  <div className="sticky top-36 z-10 mb-4 bg-white rounded-lg shadow-lg border border-blue-200 p-2 sm:p-3 animate-in slide-in-from-top-2">
    <div className="flex items-center justify-between gap-2">
      
      <Badge
        variant="secondary"
        className="bg-blue-100 text-blue-700 text-xs sm:text-sm whitespace-nowrap"
      >
        {selectedRequests.size}{" "}
        {selectedRequests.size === 1 ? "request" : "requests"} selected
      </Badge>

      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedRequests(new Set())}
          className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowBulkDeleteDialog(true)}
          className="h-7 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm bg-red-600 hover:bg-red-700"
        >
          <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
          <span className="hidden sm:inline">Delete Selected</span>
          <span className="sm:hidden">Delete</span>
        </Button>
      </div>

    </div>
  </div>
)}
      {/* Main Table Card */}
      <Card className="shadow-sm border-0  sticky top-48 z-10">
       
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 m-4 rounded-lg">
              <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests found</h3>
              <p className="text-gray-500 mb-4">No maintenance requests have been submitted yet.</p>
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
         <div className="relative">
  <div className={`overflow-auto rounded-b-lg transition-all duration-300 ${
    selectedRequests.size > 0 
      ? 'max-h-[260px] md:max-h-[360px]'
      : 'max-h-[390px] md:max-h-[440px]'
  }`}>
    <table className="w-full min-w-[1200px] table-fixed border-collapse">

      <thead className="sticky top-0 z-50">
        <tr className="bg-white border-b-2 border-blue-200">

          {/* Checkbox - 40px sticky */}
          <th className="md:sticky md:left-0 z-[60] w-[40px] bg-white border-r border-gray-200 text-left">
            {can('delete_requests') && (
              <div className="py-2 flex justify-center">
                <Checkbox 
                  checked={selectedRequests.size === filteredRequests.length && filteredRequests.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </div>
            )}
          </th>

          {/* ID - 80px sticky */}
          <th className="md:sticky md:left-[40px] z-[60] w-[80px] bg-white border-r border-gray-200 text-left">
            <div className="space-y-1.5 py-2 px-2">
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('id')}>
                <span className="font-semibold text-gray-700 text-xs">ID</span>
                <ArrowUpDown className="h-3 w-3 text-gray-500" />
              </div>
              <Input 
                placeholder="Search ID..." 
                className="h-6 text-[11px] border-gray-200 focus:border-blue-400 px-1.5"
                value={searchFilters.id}
                onChange={(e) => handleSearchChange('id', e.target.value)}
              />
            </div>
          </th>

          {/* Actions - 100px sticky */}
          <th className="md:sticky md:left-[120px] z-[60] w-[100px] bg-white border-r border-gray-200 text-left">
            <div className="py-2 px-2">
              <span className="font-semibold text-gray-700 text-xs">Actions</span>
            </div>
          </th>

          {/* Tenant - 160px */}
          <th className="w-[160px] bg-white border-r border-gray-200 text-left">
            <div className="space-y-1.5 py-2 px-2">
              <span className="font-semibold text-gray-700 text-xs">Tenant</span>
              <Input 
                placeholder="Search tenant..." 
                className="h-6 text-[11px] border-gray-200 focus:border-blue-400 px-1.5"
                value={searchFilters.tenant}
                onChange={(e) => handleSearchChange('tenant', e.target.value)}
              />
            </div>
          </th>

          {/* Title - remaining */}
          <th className="bg-white border-r border-gray-200 text-left">
            <div className="space-y-1.5 py-2 px-2">
              <span className="font-semibold text-gray-700 text-xs">Title</span>
              <Input 
                placeholder="Search title..." 
                className="h-6 text-[11px] border-gray-200 focus:border-blue-400 px-1.5"
                value={searchFilters.title}
                onChange={(e) => handleSearchChange('title', e.target.value)}
              />
            </div>
          </th>

          {/* Property - 140px */}
          <th className="w-[140px] bg-white border-r border-gray-200 text-left">
            <div className="space-y-1.5 py-2 px-2">
              <span className="font-semibold text-gray-700 text-xs">Property</span>
              <Input 
                placeholder="Search property..." 
                className="h-6 text-[11px] border-gray-200 focus:border-blue-400 px-1.5"
                value={searchFilters.property}
                onChange={(e) => handleSearchChange('property', e.target.value)}
              />
            </div>
          </th>

          {/* Priority - 120px */}
          <th className="w-[120px] bg-white border-r border-gray-200 text-left">
            <div className="space-y-1.5 py-2 px-2">
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('priority')}>
                <span className="font-semibold text-gray-700 text-xs">Priority</span>
                <ArrowUpDown className="h-3 w-3 text-gray-500" />
              </div>
              <Select 
                value={searchFilters.priority} 
                onValueChange={(value) => handleSearchChange('priority', value)}
              >
                <SelectTrigger className="h-6 text-[11px] border-gray-200 px-1.5">
                  <SelectValue placeholder="All..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </th>

          {/* Status - 120px */}
          <th className="w-[120px] bg-white border-r border-gray-200 text-left">
            <div className="space-y-1.5 py-2 px-2">
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('status')}>
                <span className="font-semibold text-gray-700 text-xs">Status</span>
                <ArrowUpDown className="h-3 w-3 text-gray-500" />
              </div>
              <Select 
                value={searchFilters.status} 
                onValueChange={(value) => handleSearchChange('status', value)}
              >
                <SelectTrigger className="h-6 text-[11px] border-gray-200 px-1.5">
                  <SelectValue placeholder="All..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </th>

          {/* Assigned To - 130px */}
          <th className="w-[130px] bg-white border-r border-gray-200 text-left">
            <div className="space-y-1.5 py-2 px-2">
              <span className="font-semibold text-gray-700 text-xs">Assigned To</span>
              <Input 
                placeholder="Search assigned..." 
                className="h-6 text-[11px] border-gray-200 focus:border-blue-400 px-1.5"
                value={searchFilters.assignedTo}
                onChange={(e) => handleSearchChange('assignedTo', e.target.value)}
              />
            </div>
          </th>

          {/* Date - 120px */}
          <th className="w-[120px] bg-white text-left">
            <div className="space-y-1.5 py-2 px-2">
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('created_at')}>
                <span className="font-semibold text-gray-700 text-xs">Date</span>
                <ArrowUpDown className="h-3 w-3 text-gray-500" />
              </div>
              <Input 
                type="date"
                className="h-6 text-[11px] border-gray-200 focus:border-blue-400 px-1.5"
                value={searchFilters.date}
                onChange={(e) => handleSearchChange('date', e.target.value)}
              />
            </div>
          </th>

        </tr>
      </thead>

      <tbody>
        {filteredRequests
          .slice(
            (currentPage - 1) * (itemsPerPage === 'all' ? filteredRequests.length : Number(itemsPerPage)),
            currentPage * (itemsPerPage === 'all' ? filteredRequests.length : Number(itemsPerPage))
          )
          .map((request, index) => {
            const rowBgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40';
            return (
              <tr
                key={request.id}
                className={`hover:bg-blue-50/40 transition-colors duration-150 border-b border-gray-100 ${rowBgClass}`}
              >
                {/* Checkbox - sticky */}
                <td className={`md:sticky md:left-0 z-[10] w-[40px] ${rowBgClass} border-r border-gray-100 py-2 px-2`}>
                  {can('delete_requests') && (
                    <div className="flex justify-center">
                      <Checkbox 
                        checked={selectedRequests.has(request.id)}
                        onCheckedChange={() => handleSelectRequest(request.id)}
                        aria-label={`Select request ${request.id}`}
                      />
                    </div>
                  )}
                </td>

                {/* ID - sticky */}
                <td className={`md:sticky md:left-[40px] z-[10] w-[80px] font-mono text-xs font-medium text-blue-600 ${rowBgClass} border-r border-gray-100 py-2 px-2`}>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                    <span className="truncate">#{request.id}</span>
                  </div>
                </td>

                {/* Actions - sticky - icon buttons with labels */}
                <td className={`md:sticky md:left-[120px] z-[10] w-[100px] ${rowBgClass} border-r border-gray-100 py-2 px-2`}>
                  <div className="flex items-center gap-0.5">
                    {/* View */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-blue-100 flex-shrink-0"
                      title="View Details"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye className="h-3.5 w-3.5 text-blue-500" />
                    </Button>

                    {/* Assign Staff */}
                    {can('manage_maintenance') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-green-100 flex-shrink-0"
                        title="Assign Staff"
                        onClick={() => handleOpenAssignStaff(request)}
                      >
                        <UserPlus className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                    )}

                    {/* Update Status */}
                    {can('manage_maintenance') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-purple-100 flex-shrink-0"
                        title="Update Status"
                        onClick={() => handleOpenUpdateStatus(request)}
                      >
                        <Settings className="h-3.5 w-3.5 text-purple-500" />
                      </Button>
                    )}
                  </div>
                </td>

                {/* Tenant */}
                <td className={`w-[160px] ${rowBgClass} border-r border-gray-100 py-2 px-2`}>
                  <div className="flex items-center gap-1">
                    <div className="bg-blue-100 p-0.5 rounded-full flex-shrink-0">
                      <User className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">
                        {request.tenant_name || "Unknown"}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {request.tenant_email || "No email"}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Title */}
                <td className={`${rowBgClass} border-r border-gray-100 py-2 px-2`}>
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-gray-800 line-clamp-1">
                      {request.title}
                    </div>
                    {request.maintenance_data && (
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] px-1 py-0 border-0 shadow-sm flex-shrink-0">
                          {request.maintenance_data.issue_category}
                        </Badge>
                        {request.maintenance_data.location && (
                          <span className="text-[10px] text-gray-500 truncate">
                            • {request.maintenance_data.location}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {/* Property */}
                <td className={`w-[140px] ${rowBgClass} border-r border-gray-100 py-2 px-2`}>
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs truncate">{request.property_name || "N/A"}</span>
                  </div>
                  {request.room_number && (
                    <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                      Room: {request.room_number}
                    </div>
                  )}
                </td>

                {/* Priority */}
                <td className={`w-[120px] ${rowBgClass} border-r border-gray-100 py-2 px-2`}>
                  {getPriorityBadge(request.priority)}
                </td>

                {/* Status */}
                <td className={`w-[120px] ${rowBgClass} border-r border-gray-100 py-2 px-2`}>
                  {getStatusBadge(request.status)}
                </td>

                {/* Assigned To */}
                <td className={`w-[130px] ${rowBgClass} border-r border-gray-100 py-2 px-2`}>
                  {request.staff_name ? (
                    <div>
                      <div className="text-xs font-medium truncate">{request.staff_name}</div>
                      {request.staff_role && (
                        <div className="text-[10px] text-gray-500 truncate">{request.staff_role}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Unassigned</span>
                  )}
                </td>

                {/* Date */}
                <td className={`w-[120px] ${rowBgClass} py-2 px-2`}>
                  <div className="text-xs font-medium whitespace-nowrap">
                    {new Date(request.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-[10px] text-gray-500 whitespace-nowrap">
                    {new Date(request.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </td>

              </tr>
            );
          })}
      </tbody>
    </table>
  </div>

  {/* Pagination - complaint table jaisa */}
  <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-3 py-2 rounded-b-lg">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

      {/* Left */}
      <div className="flex items-center justify-between sm:justify-start gap-2 text-xs">
        <span className="text-gray-500 whitespace-nowrap">
          {filteredRequests.length}/{requests.length} requests
        </span>
        <div className="flex items-center gap-1">
          <span className="hidden sm:inline text-gray-600">Rows:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(val) => {
              setItemsPerPage(val === "all" ? "all" : parseInt(val));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-7 w-[58px] text-xs">
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
      </div>

      {/* Right */}
      <div className="flex items-center justify-between sm:justify-end gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="h-7 px-2 text-[11px]"
        >
          Prev
        </Button>
        <span className="text-[11px] text-gray-600 whitespace-nowrap px-1">
          {currentPage}/
          {Math.ceil(
            filteredRequests.length /
              (itemsPerPage === "all" ? filteredRequests.length : Number(itemsPerPage))
          ) || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={
            currentPage >=
            Math.ceil(
              filteredRequests.length /
                (itemsPerPage === "all" ? filteredRequests.length : Number(itemsPerPage))
            )
          }
          className="h-7 px-2 text-[11px]"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog - Compact */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <Wrench className="h-4 w-4" />
                Maintenance Request Details - #{selectedRequest?.id}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowDialog(false)}
                className="h-7 w-7 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50 text-xs">
              Created: {selectedRequest && new Date(selectedRequest.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="p-4 sm:p-5 space-y-3 max-h-[80vh] overflow-y-auto">
              
              {/* Status & Priority */}
              <div className="flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-md text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Status:</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Priority:</span>
                  {getPriorityBadge(selectedRequest.priority)}
                </div>
              </div>

              {/* Tenant Information */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
                  <User className="h-3 w-3" />
                  Tenant Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Name</span>
                    <p className="font-medium truncate">{selectedRequest.tenant_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email</span>
                    <p className="truncate">{selectedRequest.tenant_email || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone</span>
                    <p>{selectedRequest.tenant_phone || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Property</span>
                    <p className="truncate">{selectedRequest.property_name || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
                  <MessageSquare className="h-3 w-3" />
                  Request Details
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-500">Title</span>
                    <p className="font-medium">{selectedRequest.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Description</span>
                    <div className="bg-gray-50 p-2 rounded mt-1 max-h-24 overflow-y-auto">
                      {selectedRequest.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance Specific Details */}
              {selectedRequest?.maintenance_data && (
                <div className="border rounded-md p-3">
                  <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
                    <Wrench className="h-3 w-3" />
                    Maintenance Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Issue Category</span>
                      <p className="font-medium capitalize">{selectedRequest.maintenance_data.issue_category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Location</span>
                      <p className="capitalize">{selectedRequest.maintenance_data.location?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Preferred Time</span>
                      <p className="capitalize">{selectedRequest.maintenance_data.preferred_visit_time?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Access Permission</span>
                      <p>{selectedRequest.maintenance_data.access_permission ? "Granted" : "Not Granted"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignment & Resolution */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold mb-2 text-blue-600">Assignment & Resolution</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Assigned To</span>
                    {selectedRequest.staff_name ? (
                      <p className="font-medium">{selectedRequest.staff_name}</p>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs mt-1"
                        onClick={() => {
                          setShowDialog(false);
                          setSelectedActionRequest(selectedRequest);
                          setShowAssignDialog(true);
                        }}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Assign Staff
                      </Button>
                    )}
                  </div>
                  {selectedRequest.resolved_at && (
                    <div>
                      <span className="text-gray-500">Resolved At</span>
                      <p>{new Date(selectedRequest.resolved_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {selectedRequest.admin_notes && (
                  <div className="mt-2">
                    <span className="text-gray-500">Admin Notes</span>
                    <div className="bg-blue-50 p-2 rounded mt-1">
                      {selectedRequest.admin_notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Actions */}
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'in_progress') && (
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
                      className="text-xs min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={handleResolve}
                        disabled={updating || !resolutionNotes.trim()}
                        className="flex-1 h-8 text-xs bg-gradient-to-r from-blue-500 to-cyan-500"
                      >
                        {updating ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        Resolve
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleUpdateStatus(selectedRequest.id, 'closed');
                          setShowDialog(false);
                        }}
                        disabled={updating}
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
        <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <UserPlus className="h-4 w-4" />
                Assign Staff
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowAssignDialog(false)}
                className="h-7 w-7 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50 text-xs">
              Assign staff to request #{selectedActionRequest?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedActionRequest && (
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Request Info */}
                <div className="space-y-2">
                  <h4 className="font-medium text-xs text-gray-700">Request Information</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-xs">
                    <div>
                      <span className="text-gray-500">ID</span>
                      <p className="font-medium">#{selectedActionRequest.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Title</span>
                      <p className="text-xs">{selectedActionRequest.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tenant</span>
                      <p className="text-xs">{selectedActionRequest.tenant_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Status</span>
                      <div className="mt-1">{getStatusBadge(selectedActionRequest.status)}</div>
                    </div>
                  </div>
                </div>

                {/* Staff Selection */}
                <div className="space-y-2">
                  <h4 className="font-medium text-xs text-gray-700">Select Staff Member</h4>
                  <Select
                    value={selectedStaffId}
                    onValueChange={setSelectedStaffId}
                    disabled={updating}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Choose staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassign</SelectItem>
                      {staff.length > 0 ? (
                        staff.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium text-xs">{s.name}</span>
                              <span className="text-[10px] text-gray-500">{s.role}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no_staff" disabled>
                          No staff available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {selectedStaffId && selectedStaffId !== "unassigned" && (
                    <div className="bg-blue-50 p-2 rounded-lg mt-2">
                      <p className="text-[10px] text-blue-600 mb-0.5">Selected Staff:</p>
                      <p className="font-medium text-xs">
                        {staff.find(s => s.id.toString() === selectedStaffId)?.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                  className="h-8 text-xs px-4"
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAssignStaff(selectedActionRequest.id, selectedStaffId)}
                  disabled={updating || !selectedStaffId}
                  className="h-8 text-xs px-4 bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  {updating ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <UserPlus className="h-3 w-3 mr-1" />
                  )}
                  Assign
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      {/* Update Status Dialog with Admin Notes */}
<Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
  <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
    <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
      <div className="flex items-center justify-between">
        <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
          <Settings className="h-4 w-4" />
          Update Status
        </DialogTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            setShowStatusDialog(false);
            setAdminNotes(""); // Reset admin notes
          }}
          className="h-7 w-7 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <DialogDescription className="text-blue-50 text-xs">
        Update status for request #{selectedActionRequest?.id}
      </DialogDescription>
    </DialogHeader>
    
    {selectedActionRequest && (
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Status */}
          <div className="space-y-2">
            <h4 className="font-medium text-xs text-gray-700">Current Status</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedActionRequest.status)}
                {getStatusBadge(selectedActionRequest.status)}
              </div>
            </div>
          </div>

          {/* New Status */}
          <div className="space-y-2">
            <h4 className="font-medium text-xs text-gray-700">Select New Status</h4>
            <Select
              value={newStatus}
              onValueChange={setNewStatus}
              disabled={updating}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">Pending</span>
                  </div>
                </SelectItem>
                <SelectItem value="in_progress">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5" />
                    <span className="text-xs">In Progress</span>
                  </div>
                </SelectItem>
                <SelectItem value="resolved">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span className="text-xs">Resolved</span>
                  </div>
                </SelectItem>
                <SelectItem value="closed">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3.5 w-3.5" />
                    <span className="text-xs">Closed</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {newStatus && newStatus !== selectedActionRequest.status && (
              <div className="bg-blue-50 p-2 rounded-lg mt-2">
                <p className="text-[10px] text-blue-600 mb-0.5">New Status Preview:</p>
                <div className="flex items-center gap-1">
                  {newStatus === 'pending' && <Clock className="h-3 w-3" />}
                  {newStatus === 'in_progress' && <Loader2 className="h-3 w-3 animate-spin" />}
                  {newStatus === 'resolved' && <CheckCircle className="h-3 w-3" />}
                  {newStatus === 'closed' && <XCircle className="h-3 w-3" />}
                  <span className="text-xs font-medium capitalize">{newStatus.replace('_', ' ')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Notes Section - NEW */}
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-xs text-gray-700 flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
            Admin Notes
          </h4>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes about this status update (optional but recommended)"
            rows={3}
            className="w-full text-xs border-gray-200 focus:border-blue-400 focus:ring-blue-400"
          />
          <p className="text-[10px] text-gray-500">
            These notes will be visible to the tenant and help them understand the status change.
          </p>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowStatusDialog(false);
              setAdminNotes("");
              setNewStatus("");
            }}
            className="h-8 text-xs px-4"
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleUpdateStatus(selectedActionRequest.id, newStatus)}
            disabled={updating || !newStatus || newStatus === selectedActionRequest.status}
            className="h-8 text-xs px-4 bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            {updating ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Settings className="h-3 w-3 mr-1" />
            )}
            Update
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
        Are you sure you want to delete {selectedRequests.size} {selectedRequests.size === 1 ? 'maintenance request' : 'maintenance requests'}? 
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    <div className="bg-red-50 p-3 rounded-md my-2 max-h-40 overflow-y-auto">
      <p className="text-xs font-medium text-red-800 mb-2">Selected requests:</p>
      <ul className="text-xs text-red-700 space-y-1">
        {Array.from(selectedRequests).slice(0, 5).map(id => {
          const request = requests.find(r => r.id === id);
          return (
            <li key={id} className="flex items-center gap-2">
              <span className="font-mono">#{id}</span>
              <span className="truncate">- {request?.title || 'Unknown'}</span>
            </li>
          );
        })}
        {selectedRequests.size > 5 && (
          <li className="text-red-600 font-medium">
            ...and {selectedRequests.size - 5} more
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
            Delete {selectedRequests.size} {selectedRequests.size === 1 ? 'Request' : 'Requests'}
          </>
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}

