

// app/admin/receipts/page.tsx
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
import { 
  Eye, AlertCircle, Loader2, RefreshCw, Building, 
  Home, User, Calendar, Clock, CheckCircle, 
  XCircle, FileText, Receipt, IndianRupee,
  Download, Mail, Printer, CreditCard, Wallet,
  MoreVertical, UserPlus, Settings, X, ArrowUpDown,
  Phone, Tag,
  AlertTriangle
} from "lucide-react";
import {
  getAdminReceiptRequests,
  updateReceiptStatus,
  assignReceiptStaff,
  generateReceipt,
  getAccountingStaff,
  bulkDeleteReceiptRequests,  // This is the imported function
  type ReceiptRequest,
  type ReceiptDetails
} from "@/lib/receiptApi";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ReceiptsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ReceiptRequest[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ReceiptRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedActionRequest, setSelectedActionRequest] = useState<ReceiptRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [sortField, setSortField] = useState<keyof ReceiptRequest>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
// Add these state variables for bulk actions
const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
const [bulkActionLoading, setBulkActionLoading] = useState(false);
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

  // Receipt generation form
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetails>({
    receipt_number: `RCPT-${Date.now().toString().slice(-6)}`,
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "bank_transfer",
    payment_for: "Monthly Rent",
    notes: ""
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAdminReceiptRequests();
      setRequests(data);
      
      await loadStaff();
    } catch (err: any) {
      console.error('Error loading receipt requests:', err);
      toast.error("Failed to load receipt requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const staffData = await getAccountingStaff();
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      setStaff([]);
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

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      setUpdating(true);
      await updateReceiptStatus(id, status);
      toast.success(`Status updated to ${status}`);
      await loadRequests();
      setShowStatusDialog(false);
      setSelectedActionRequest(null);
      setNewStatus("");
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignStaff = async (requestId: number, staffId: string) => {
    try {
      setUpdating(true);
      if (staffId === "unassigned") {
        await assignReceiptStaff(requestId, 0);
        toast.success("Staff unassigned");
      } else {
        await assignReceiptStaff(requestId, Number(staffId));
        toast.success("Staff assigned");
      }
      await loadRequests();
      setShowAssignDialog(false);
      setSelectedActionRequest(null);
      setSelectedStaffId("");
    } catch (err: any) {
      console.error('Error assigning staff:', err);
      toast.error(err.message || "Failed to assign staff");
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateReceipt = async () => {
    if (!selectedRequest) {
      toast.error("No request selected");
      return;
    }

    if (!receiptDetails.amount || receiptDetails.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setUpdating(true);
      const response = await generateReceipt(selectedRequest.id, receiptDetails);
      
      if (response.success) {
        toast.success("Receipt generated successfully");
        setShowGenerateDialog(false);
        await loadRequests();
        
        // Reset form
        setReceiptDetails({
          receipt_number: `RCPT-${Date.now().toString().slice(-6)}`,
          amount: 0,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: "bank_transfer",
          payment_for: "Monthly Rent",
          notes: ""
        });
      } else {
        toast.error(response.message || "Failed to generate receipt");
      }
    } catch (err: any) {
      console.error('Error generating receipt:', err);
      toast.error(err.message || "Failed to generate receipt");
    } finally {
      setUpdating(false);
    }
  };

  const handleSort = (field: keyof ReceiptRequest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
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
    // You'll need to add this function to your receiptApi
    await bulkDeleteReceiptRequests(Array.from(selectedRequests));
    toast.success(`Successfully deleted ${selectedRequests.size} receipt requests`);
    setSelectedRequests(new Set());
    setShowBulkDeleteDialog(false);
    await loadRequests(); // Refresh the list
  } catch (error: any) {
    console.error('Error deleting receipt requests:', error);
    toast.error(error.message || "Failed to delete receipt requests");
  } finally {
    setBulkActionLoading(false);
  }
};

  const handleSearchChange = (field: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }));
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading receipt requests...</p>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 ">
     

      {/* Stats Cards - Compact Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3 px-0 sticky top-24 z-10">
        {/* Total Requests */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Total
                </p>
                <p className="text-sm sm:text-base font-bold text-slate-800">
                  {requests.length}
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
                <p className="text-sm sm:text-base font-bold text-yellow-600">
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
                <p className="text-sm sm:text-base font-bold text-blue-600">
                  {requests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-600">
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                  Completed
                </p>
                <p className="text-sm sm:text-base font-bold text-green-600">
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
{selectedRequests.size > 0 && (
  <div className="sticky top-36 z-10 mb-2 bg-white rounded-lg shadow-lg border border-blue-200 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
    <div className="flex items-center gap-3">
      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
        {selectedRequests.size} {selectedRequests.size === 1 ? 'request' : 'requests'} selected
      </Badge>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setSelectedRequests(new Set())}
        className="text-gray-500 hover:text-gray-700"
      >
        <X className="h-4 w-4 mr-1" />
        Clear
      </Button>
    </div>
    <div className="flex gap-2">
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setShowBulkDeleteDialog(true)}
        className="bg-red-600 hover:bg-red-700"
      >
        <XCircle className="h-4 w-4 mr-1" />
        Delete Selected
      </Button>
    </div>
  </div>
)}
      {/* Main Table Card */}
      <Card className="shadow-lg border-0 overflow-hidden mx-0 mb-2 sticky top-48 z-10">
       
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 m-4 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No receipt requests found</h3>
              <p className="text-gray-500 mb-4">No receipt requests have been submitted yet.</p>
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <div className="relative">
              {/* Scrollable Table */}
<div className={`overflow-auto rounded-b-lg transition-all duration-300 ${
  selectedRequests.size > 0 
    ? 'max-h-[440px] md:max-h-[460px]'
    : 'max-h-[510px] md:max-h-[530px]'
}`}>                <Table className="min-w-[1000px] md:min-w-full table-fixed">
                  <TableHeader className="sticky top-0 z-20 bg-gradient-to-r from-gray-50 to-white shadow-sm">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[50px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
  <div className="py-2 flex justify-center">
    <Checkbox 
      checked={selectedRequests.size === filteredRequests.length && filteredRequests.length > 0}
      onCheckedChange={handleSelectAll}
      aria-label="Select all"
    />
  </div>
</TableHead>

                      {/* ID Column */}
                      <TableHead className="w-[80px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('id')}>
                            <span className="font-semibold text-gray-700 text-xs">ID</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Search ID..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.id}
                            onChange={(e) => handleSearchChange('id', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Tenant Column */}
                      <TableHead className="w-[180px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <span className="font-semibold text-gray-700 text-xs">Tenant</span>
                          <Input 
                            placeholder="Search tenant..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.tenant}
                            onChange={(e) => handleSearchChange('tenant', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Title Column */}
                      <TableHead className="w-[200px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <span className="font-semibold text-gray-700 text-xs">Title</span>
                          <Input 
                            placeholder="Search title..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.title}
                            onChange={(e) => handleSearchChange('title', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Property Column */}
                      <TableHead className="w-[150px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <span className="font-semibold text-gray-700 text-xs">Property</span>
                          <Input 
                            placeholder="Search property..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.property}
                            onChange={(e) => handleSearchChange('property', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Priority Column */}
                      <TableHead className="w-[110px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('priority')}>
                            <span className="font-semibold text-gray-700 text-xs">Priority</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Select 
                            value={searchFilters.priority} 
                            onValueChange={(value) => handleSearchChange('priority', value)}
                          >
                            <SelectTrigger className="h-7 text-xs border-gray-200">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      
                      {/* Status Column */}
                      <TableHead className="w-[130px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('status')}>
                            <span className="font-semibold text-gray-700 text-xs">Status</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Select 
                            value={searchFilters.status} 
                            onValueChange={(value) => handleSearchChange('status', value)}
                          >
                            <SelectTrigger className="h-7 text-xs border-gray-200">
                              <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      
                      {/* Assigned To Column */}
                      <TableHead className="w-[140px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <span className="font-semibold text-gray-700 text-xs">Assigned To</span>
                          <Input 
                            placeholder="Search assigned..." 
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.assignedTo}
                            onChange={(e) => handleSearchChange('assignedTo', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Date Column */}
                      <TableHead className="w-[140px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-1 py-1">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('created_at')}>
                            <span className="font-semibold text-gray-700 text-xs">Date</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Date..." 
                            type="date"
                            className="h-7 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.date}
                            onChange={(e) => handleSearchChange('date', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Actions Column - Stay as is */}
                      <TableHead className="w-[100px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <span className="font-semibold text-gray-700 text-xs">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {filteredRequests.map((request, index) => (
                      <TableRow 
                        key={request.id} 
                        className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        {/* Checkbox Cell */}
<TableCell className="w-[50px]">
  <div className="flex justify-center">
    <Checkbox 
      checked={selectedRequests.has(request.id)}
      onCheckedChange={() => handleSelectRequest(request.id)}
      aria-label={`Select request ${request.id}`}
    />
  </div>
</TableCell>
                        <TableCell className="font-mono text-xs font-medium text-blue-600 truncate">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            #{request.id}
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-1">
                              <User className="h-3 w-3 text-blue-600 flex-shrink-0" />
                              <span className="text-xs truncate">
                                {request.tenant_name || "Unknown"}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {request.tenant_email || "No email"}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="space-y-1">
                            <div className="font-medium text-xs truncate">
                              {request.title}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {request.description.substring(0, 40)}...
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs truncate">
                              {request.property_name || "N/A"}
                            </span>
                          </div>
                          {request.room_number && (
                            <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                              Room: {request.room_number}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {getPriorityBadge(request.priority)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getStatusBadge(request.status)}
                          </div>
                        </TableCell>
                        
                        <TableCell className="truncate">
                          {request.staff_name ? (
                            <div>
                              <div className="text-xs font-medium truncate">
                                {request.staff_name}
                              </div>
                              {request.staff_role && (
                                <div className="text-[10px] text-gray-500 truncate">
                                  {request.staff_role}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Unassigned</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-xs whitespace-nowrap">
                            {new Date(request.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-[10px] text-gray-500 whitespace-nowrap">
                            {new Date(request.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDialog(true);
                              }}
                              disabled={updating}
                              className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600"
                                  disabled={updating}
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs text-blue-600">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedActionRequest(request);
                                    setSelectedStaffId(request.assigned_to?.toString() || "unassigned");
                                    setShowAssignDialog(true);
                                  }}
                                  className="cursor-pointer text-xs"
                                >
                                  <UserPlus className="h-3.5 w-3.5 mr-2" />
                                  Assign Staff
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedActionRequest(request);
                                    setNewStatus(request.status);
                                    setShowStatusDialog(true);
                                  }}
                                  className="cursor-pointer text-xs"
                                >
                                  <Settings className="h-3.5 w-3.5 mr-2" />
                                  Update Status
                                </DropdownMenuItem>
                                {(request.status === 'pending' || request.status === 'in_progress') && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setShowGenerateDialog(true);
                                    }}
                                    className="cursor-pointer text-xs"
                                  >
                                    <FileText className="h-3.5 w-3.5 mr-2" />
                                    Generate Receipt
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <FileText className="h-4 w-4" />
                Receipt Request Details - #{selectedRequest?.id}
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
                  <FileText className="h-3 w-3" />
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

              {/* Admin Actions */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold mb-2 text-blue-600">Admin Actions</h4>
                <div className="space-y-3">
                  {/* Assign Staff */}
                  <div>
                    <Label className="text-xs">Assign to Accounting Staff</Label>
                    <Select
                      value={selectedRequest.assigned_to?.toString() || "unassigned"}
                      onValueChange={(value) => handleAssignStaff(selectedRequest.id, value)}
                      disabled={updating}
                    >
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue placeholder="Select accounting staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassign</SelectItem>
                        {staff.length > 0 ? (
                          staff.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name} - {s.role}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No accounting staff available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generate Receipt Button */}
                  {(selectedRequest.status === 'pending' || selectedRequest.status === 'in_progress') && (
                    <div className="pt-2 border-t">
                      <Button 
                        onClick={() => {
                          setShowDialog(false);
                          setShowGenerateDialog(true);
                        }}
                        className="w-full h-8 text-xs bg-gradient-to-r from-blue-500 to-cyan-500"
                        disabled={updating}
                      >
                        <Receipt className="h-3 w-3 mr-1" />
                        Generate Receipt
                      </Button>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {selectedRequest.admin_notes && (
                    <div className="pt-2 border-t">
                      <Label className="text-xs text-gray-500">Admin Notes</Label>
                      <div className="bg-blue-50 p-2 rounded mt-1">
                        <p className="text-xs">{selectedRequest.admin_notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Resolved At */}
                  {selectedRequest.resolved_at && (
                    <div className="pt-2 border-t">
                      <Label className="text-xs text-gray-500">Completed At</Label>
                      <p className="text-xs">
                        {new Date(selectedRequest.resolved_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Receipt Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <Receipt className="h-4 w-4" />
                Generate Receipt
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowGenerateDialog(false)}
                className="h-7 w-7 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50 text-xs">
              Create receipt for {selectedRequest?.tenant_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Receipt Number</Label>
                <Input
                  value={receiptDetails.receipt_number}
                  onChange={(e) => setReceiptDetails({...receiptDetails, receipt_number: e.target.value})}
                  disabled={updating}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Amount (₹)</Label>
                <Input
                  type="number"
                  value={receiptDetails.amount}
                  onChange={(e) => setReceiptDetails({...receiptDetails, amount: parseFloat(e.target.value) || 0})}
                  disabled={updating}
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Payment Date</Label>
                <Input
                  type="date"
                  value={receiptDetails.payment_date}
                  onChange={(e) => setReceiptDetails({...receiptDetails, payment_date: e.target.value})}
                  disabled={updating}
                  className="h-8 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Payment Method</Label>
                <Select
                  value={receiptDetails.payment_method}
                  onValueChange={(value) => setReceiptDetails({...receiptDetails, payment_method: value})}
                  disabled={updating}
                >
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Payment For</Label>
                <Select
                  value={receiptDetails.payment_for}
                  onValueChange={(value) => setReceiptDetails({...receiptDetails, payment_for: value})}
                  disabled={updating}
                >
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly Rent">Monthly Rent</SelectItem>
                    <SelectItem value="Security Deposit">Security Deposit</SelectItem>
                    <SelectItem value="Maintenance Charges">Maintenance Charges</SelectItem>
                    <SelectItem value="Electricity Bill">Electricity Bill</SelectItem>
                    <SelectItem value="Water Bill">Water Bill</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-xs">Notes (Optional)</Label>
                <Textarea
                  value={receiptDetails.notes}
                  onChange={(e) => setReceiptDetails({...receiptDetails, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={2}
                  className="text-xs mt-1"
                  disabled={updating}
                />
              </div>
            </div>

            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowGenerateDialog(false)}
                className="h-8 text-xs px-4"
                disabled={updating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateReceipt}
                disabled={updating || !receiptDetails.amount}
                className="h-8 text-xs px-4 bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                {updating ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Receipt className="h-3 w-3 mr-1" />
                )}
                Generate
              </Button>
            </DialogFooter>
          </div>
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
              Assign accounting staff to request #{selectedActionRequest?.id}
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
                  <h4 className="font-medium text-xs text-gray-700">Select Accounting Staff</h4>
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
                onClick={() => setShowStatusDialog(false)}
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

              <DialogFooter className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowStatusDialog(false)}
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
        Are you sure you want to delete {selectedRequests.size} {selectedRequests.size === 1 ? 'receipt request' : 'receipt requests'}? 
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

