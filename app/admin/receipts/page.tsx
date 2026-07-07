"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/src/compat/next-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  XCircle, FileText, ReceiptIndianRupee, IndianRupee,
  Download, Mail, Printer, CreditCard, Wallet,
  MoreVertical, X, ArrowUpDown,
  Phone, Tag,
  AlertTriangle,
  Settings,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  getAdminReceiptRequests,
  updateReceiptStatus,
  bulkDeleteReceiptRequests,
  type ReceiptRequest
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
import { useAuth } from "@/context/authContext";

export default function ReceiptsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ReceiptRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ReceiptRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedActionRequest, setSelectedActionRequest] = useState<ReceiptRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [sortField, setSortField] = useState<keyof ReceiptRequest>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);
const { can } = useAuth();

  // Search filters for all columns
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    tenant: '',
    title: '',
    property: '',
    priority: 'all',
    status: 'all',
    receiptType: 'all',
    date: ''
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAdminReceiptRequests();
      setRequests(data);
    } catch (err: any) {
      console.error('Error loading receipt requests:', err);
      toast.error("Failed to load receipt requests");
      setRequests([]);
    } finally {
      setLoading(false);
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

  const handleUpdateStatus = async (id: number, status: string, admin_notes?: string) => {
    try {
      setUpdating(true);
      await updateReceiptStatus(id, status, admin_notes);
      toast.success(`Request ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'} successfully`);
      await loadRequests();
      setShowStatusDialog(false);
      setShowRejectDialog(false);
      setSelectedActionRequest(null);
      setNewStatus("");
      setRejectionReason("");
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.message || "Failed to update status");
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

  const handleBulkDelete = async () => {
    if (selectedRequests.size === 0) return;
    
    try {
      setBulkActionLoading(true);
      await bulkDeleteReceiptRequests(Array.from(selectedRequests));
      toast.success(`Successfully deleted ${selectedRequests.size} receipt requests`);
      setSelectedRequests(new Set());
      setShowBulkDeleteDialog(false);
      await loadRequests();
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
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, label: string }> = {
      pending: { variant: 'destructive', icon: Clock, label: 'Pending' },
      approved: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
      in_progress: { variant: 'default', icon: AlertCircle, label: 'In Progress' },
      resolved: { variant: 'secondary', icon: CheckCircle, label: 'Resolved' },
      closed: { variant: 'outline', icon: XCircle, label: 'Closed' }
    };

    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 text-xs px-2 py-0.5">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getReceiptTypeBadge = (type: string) => {
    if (type === 'rent') {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
          <ReceiptIndianRupee className="h-3 w-3 mr-1" />
          Rent
        </Badge>
      );
    } else if (type === 'security_deposit') {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
          <Wallet className="h-3 w-3 mr-1" />
          Security Deposit
        </Badge>
      );
    }
    return null;
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
    const matchesReceiptType = searchFilters.receiptType === 'all' || request.receipt_type === searchFilters.receiptType;
    const matchesDate = !searchFilters.date || 
                        new Date(request.created_at).toISOString().split('T')[0] === searchFilters.date;
    
    return matchesId && matchesTenant && matchesTitle && matchesProperty && 
           matchesPriority && matchesStatus && matchesReceiptType && matchesDate;
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
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
      {/* Stats Cards - Compact Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-3 px-0 sticky top-24 z-10">
        {/* Total Requests */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Total</p>
                <p className="text-sm sm:text-base font-bold text-slate-800">{requests.length}</p>
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
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Pending</p>
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

        {/* Approved */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Approved</p>
                <p className="text-sm sm:text-base font-bold text-green-600">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-green-600">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rejected */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Rejected</p>
                <p className="text-sm sm:text-base font-bold text-red-600">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-red-600">
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rent Receipts */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium">Rent Receipts</p>
                <p className="text-sm sm:text-base font-bold text-blue-600">
                  {requests.filter(r => r.receipt_type === 'rent').length}
                </p>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-600">
                <ReceiptIndianRupee className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
{can('delete_requests') && selectedRequests.size > 0 && (
  <div className="px-1 pb-2">
    <div className="flex items-center justify-between gap-2 sm:gap-3 border border-[#E2E8F4] rounded-xl px-2 sm:px-3 py-2 min-h-[40px] sm:min-h-[44px] bg-white shadow-sm">

      <span className="font-bold text-[#1A2B6D] text-[11px] sm:text-sm whitespace-nowrap">
        {selectedRequests.size}{" "}
        {selectedRequests.size === 1 ? "request" : "requests"} selected
      </span>

      <div className="flex items-center gap-1 sm:gap-2">

        <button
          onClick={() => setSelectedRequests(new Set())}
          className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-[#8892A4] hover:text-gray-600 px-2 py-1 transition-colors whitespace-nowrap"
        >
          <X className="h-3 w-3" />
          Clear
        </button>

        <button
          onClick={() => setShowBulkDeleteDialog(true)}
          className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-[10px] sm:text-xs font-bold text-[#DC2626] hover:bg-red-100 transition-colors whitespace-nowrap"
        >
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          Delete {selectedRequests.size}
        </button>

      </div>

    </div>
  </div>
)}

      {/* Main Table Card */}
   <Card className="border rounded-lg shadow-sm overflow-hidden">
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
      <div
        className={`flex flex-col rounded-md border border-gray-200 transition-all duration-300 ${
          selectedRequests.size > 0
            ? "h-[310px] md:h-[430px]"
            : "h-[360px] md:h-[470px]"
        }`}
      >
        <div className="overflow-auto flex-1 min-h-0">
          <table
            className="border-collapse text-[11px] font-sans"
            style={{ tableLayout: 'fixed', minWidth: '1500px', width: '100%' }}
          >
            <colgroup>
              <col style={{ width: '40px' }} />   {/* checkbox – sticky left:0 */}
              <col style={{ width: '80px' }} />    {/* ID – sticky left:40px */}
              <col style={{ width: '110px' }} />   {/* Actions – sticky left:120px */}
              <col style={{ width: '160px' }} />   {/* Tenant – sticky left:230px */}
              <col style={{ width: 'auto' }} />    {/* Title */}
              <col style={{ width: '150px' }} />   {/* Receipt Type */}
              <col style={{ width: '120px' }} />   {/* Month/Year */}
              <col style={{ width: '110px' }} />   {/* Amount */}
              <col style={{ width: '150px' }} />   {/* Property */}
              <col style={{ width: '120px' }} />   {/* Priority */}
              <col style={{ width: '130px' }} />   {/* Status */}
              <col style={{ width: '130px' }} />   {/* Date */}
            </colgroup>

<thead className="sticky top-0 z-30">              {/* ── Header labels row ── */}
              <tr className="bg-gray-200 border-b border-gray-300">
                {/* Checkbox – sticky */}
                <th className="md:sticky md:left-0 z-[50] px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
                  {can('delete_requests') && (
                    <input
                      type="checkbox"
                      checked={
                        selectedRequests.size === filteredRequests.length &&
                        filteredRequests.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-3.5 h-3.5 cursor-pointer"
                    />
                  )}
                </th>

                {/* ID – sticky */}
                <th
                  className="md:sticky md:left-[40px] z-[50] px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      ID
                    </span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Actions – sticky */}
                <th className="md:sticky md:left-[120px] z-[50] px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                    Actions
                  </span>
                </th>

                {/* Tenant – sticky */}
                <th className="md:sticky md:left-[230px] z-[50] px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                    Tenant
                  </span>
                </th>

                {/* Title */}
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                    Title
                  </span>
                </th>

                {/* Receipt Type */}
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                    Receipt Type
                  </span>
                </th>

                {/* Month/Year */}
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                    Month/Year
                  </span>
                </th>

                {/* Amount */}
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                    Amount
                  </span>
                </th>

                {/* Property */}
                <th className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200">
                  <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                    Property
                  </span>
                </th>

                {/* Priority */}
                <th
                  className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      Priority
                    </span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Status */}
                <th
                  className="px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      Status
                    </span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>

                {/* Date */}
                <th
                  className="px-1.5 py-1.5 text-left bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                      Date
                    </span>
                    <ArrowUpDown className="h-3 w-3 text-gray-500" />
                  </div>
                </th>
              </tr>

              {/* ── Search / filter row ── */}
              <tr className="bg-white border-b border-gray-300">
                <td className="md:sticky md:left-0 z-[50] p-1 border-r border-gray-200 bg-white" />
                <td className="md:sticky md:left-[40px] z-[50] p-1 border-r border-gray-200 bg-white">
                  <Input
                    placeholder="Search ID…"
                    value={searchFilters.id}
                    onChange={(e) => handleSearchChange('id', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="md:sticky md:left-[120px] z-[50] p-1 border-r border-gray-200 bg-white" />
                <td className="md:sticky md:left-[230px] z-[50] p-1 border-r border-gray-200 bg-white">
                  <Input
                    placeholder="Search tenant…"
                    value={searchFilters.tenant}
                    onChange={(e) => handleSearchChange('tenant', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Input
                    placeholder="Search title…"
                    value={searchFilters.title}
                    onChange={(e) => handleSearchChange('title', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Select
                    value={searchFilters.receiptType}
                    onValueChange={(value) => handleSearchChange('receiptType', value)}
                  >
                    <SelectTrigger className="w-full h-5 text-[10px] border-gray-300 px-1.5 py-0 bg-white rounded-md">
                      <SelectValue placeholder="All…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="security_deposit">Security Deposit</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-1 border-r border-gray-200">
                  <div className="h-5" />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <div className="h-5" />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Input
                    placeholder="Search property…"
                    value={searchFilters.property}
                    onChange={(e) => handleSearchChange('property', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Select
                    value={searchFilters.priority}
                    onValueChange={(value) => handleSearchChange('priority', value)}
                  >
                    <SelectTrigger className="w-full h-5 text-[10px] border-gray-300 px-1.5 py-0 bg-white rounded-md">
                      <SelectValue placeholder="All…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-1 border-r border-gray-200">
                  <Select
                    value={searchFilters.status}
                    onValueChange={(value) => handleSearchChange('status', value)}
                  >
                    <SelectTrigger className="w-full h-5 text-[10px] border-gray-300 px-1.5 py-0 bg-white rounded-md">
                      <SelectValue placeholder="All…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-1">
                  <Input
                    type="date"
                    value={searchFilters.date}
                    onChange={(e) => handleSearchChange('date', e.target.value)}
                    className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                  />
                </td>
              </tr>
            </thead>

            <tbody>
              {filteredRequests
                .slice(
                  (currentPage - 1) *
                    (itemsPerPage === 'all'
                      ? filteredRequests.length
                      : Number(itemsPerPage)),
                  currentPage *
                    (itemsPerPage === 'all'
                      ? filteredRequests.length
                      : Number(itemsPerPage))
                )
                .map((request, index) => {
                  const rowBgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                  return (
                    <tr
                      key={request.id}
                      className={`hover:bg-blue-50/40 transition-colors duration-150 border-b border-gray-100 ${rowBgClass}`}
                    >
                      {/* Checkbox – sticky */}
                      <td
                        className={`md:sticky md:left-0 z-[10] w-[40px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        {can('delete_requests') && (
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={selectedRequests.has(request.id)}
                              onChange={() => handleSelectRequest(request.id)}
                              aria-label={`Select request ${request.id}`}
                              className="w-3.5 h-3.5 cursor-pointer"
                            />
                          </div>
                        )}
                      </td>

                      {/* ID – sticky */}
                      <td
                        className={`md:sticky md:left-[40px] z-[10] w-[80px] font-mono text-[10px] font-medium text-blue-600 ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                          <span className="truncate">#{request.id}</span>
                        </div>
                      </td>

                      {/* Actions – sticky */}
                      <td
                        className={`md:sticky md:left-[120px] z-[10] w-[110px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-blue-100 flex-shrink-0"
                            title="View Details"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDialog(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                          </Button>

                          {can('manage_receipts') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-purple-100 flex-shrink-0"
                              title="Update Status"
                              onClick={() => {
                                setSelectedActionRequest(request);
                                setNewStatus(request.status);
                                setShowStatusDialog(true);
                              }}
                            >
                              <Settings className="h-3.5 w-3.5 text-purple-500" />
                            </Button>
                          )}

                          {can('manage_receipts') && request.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-green-100 flex-shrink-0"
                              title="Approve"
                              onClick={() => handleUpdateStatus(request.id, 'approved', 'Request approved')}
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            </Button>
                          )}

                          {can('manage_receipts') && request.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-red-100 flex-shrink-0"
                              title="Reject"
                              onClick={() => {
                                setSelectedActionRequest(request);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </td>

                      {/* Tenant – sticky */}
                      <td
                        className={`md:sticky md:left-[230px] z-[10] w-[160px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        <div className="flex items-center gap-1">
                          <div className="bg-blue-100 p-0.5 rounded-full flex-shrink-0">
                            <User className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-medium truncate">
                              {request.tenant_name || 'Unknown'}
                            </div>
                            <div className="text-[9px] text-gray-500 truncate">
                              {request.tenant_email || 'No email'}
                            </div>
                            <div className="text-[9px] text-gray-400 truncate flex items-center gap-0.5">
                              <Phone className="h-2 w-2 flex-shrink-0" />
                              {request.tenant_phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Title */}
                      <td
                        className={`${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-medium text-gray-800 line-clamp-1">
                            {request.title}
                          </div>
                          <div className="text-[9px] text-gray-500 line-clamp-1 italic">
                            "{request.description?.substring(0, 60)}..."
                          </div>
                        </div>
                      </td>

                      {/* Receipt Type */}
                      <td
                        className={`w-[150px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        {getReceiptTypeBadge(request.receipt_type)}
                      </td>

                      {/* Month/Year */}
                      <td
                        className={`w-[120px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        {request.receipt_type === 'rent' && request.receipt_month ? (
                          <span className="text-[10px] font-medium whitespace-nowrap">
                            {request.receipt_month} {request.receipt_year}
                          </span>
                        ) : request.receipt_type === 'security_deposit' ? (
                          <span className="text-[10px] text-purple-600">—</span>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td
                        className={`w-[110px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        {request.receipt_amount ? (
                          <span className="text-[10px] font-medium text-green-600 whitespace-nowrap">
                            ₹{request.receipt_amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>

                      {/* Property */}
                      <td
                        className={`w-[150px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-[10px] truncate">
                            {request.property_name || 'N/A'}
                          </span>
                        </div>
                        {request.room_number && (
                          <div className="text-[9px] text-gray-500 mt-0.5 truncate flex items-center gap-0.5">
                            <Home className="h-2 w-2 flex-shrink-0" />
                            Room: {request.room_number}
                          </div>
                        )}
                      </td>

                      {/* Priority */}
                      <td
                        className={`w-[120px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        {getPriorityBadge(request.priority)}
                      </td>

                      {/* Status */}
                      <td
                        className={`w-[130px] ${rowBgClass} border-r border-gray-100 py-1.5 px-1`}
                      >
                        {getStatusBadge(request.status)}
                      </td>

                      {/* Date */}
                      <td
                        className={`w-[130px] ${rowBgClass} py-1.5 px-1`}
                      >
                        <div className="text-[10px] font-medium whitespace-nowrap">
                          {new Date(request.created_at).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </div>
                        <div className="text-[9px] text-gray-500 whitespace-nowrap">
                          {new Date(request.created_at).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {filteredRequests.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Show</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(val) => {
                  setItemsPerPage(val === 'all' ? 'all' : parseInt(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-6 w-16 text-[10px] border-gray-200 px-1">
                  <SelectValue>{itemsPerPage}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <span>entries</span>
              <span className="ml-2">
                Showing{' '}
                {(currentPage - 1) *
                  (itemsPerPage === 'all'
                    ? filteredRequests.length
                    : Number(itemsPerPage)) +
                  1}
                –
                {Math.min(
                  currentPage *
                    (itemsPerPage === 'all'
                      ? filteredRequests.length
                      : Number(itemsPerPage)),
                  filteredRequests.length
                )}{' '}
                of {filteredRequests.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>

              {Array.from(
                {
                  length: Math.min(
                    Math.ceil(
                      filteredRequests.length /
                        (itemsPerPage === 'all'
                          ? filteredRequests.length
                          : Number(itemsPerPage))
                    ),
                    5
                  ),
                },
                (_, i) => {
                  const totalPages = Math.ceil(
                    filteredRequests.length /
                      (itemsPerPage === 'all'
                        ? filteredRequests.length
                        : Number(itemsPerPage))
                  );
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2)
                      pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-6 w-6 p-0 text-[10px] ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : ''
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={
                  currentPage >=
                  Math.ceil(
                    filteredRequests.length /
                      (itemsPerPage === 'all'
                        ? filteredRequests.length
                        : Number(itemsPerPage))
                  )
                }
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )}
  </CardContent>
</Card>

      {/* View Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-2 py-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <FileText className="h-4 w-4" />
                Receipt Request Details - #{selectedRequest?.id}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowDialog(false)}
                className="h-5 w-5 text-white hover:bg-white/20"
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
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Receipt Type:</span>
                  {getReceiptTypeBadge(selectedRequest.receipt_type)}
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
                  {selectedRequest.room_number && (
                    <div>
                      <span className="text-gray-500">Room</span>
                      <p>{selectedRequest.room_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Receipt Details */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
                  <ReceiptIndianRupee className="h-3 w-3" />
                  Receipt Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Type</span>
                    <p className="font-medium capitalize">{selectedRequest.receipt_type}</p>
                  </div>
                  
                  {selectedRequest.receipt_type === 'rent' && (
                    <>
                      <div>
                        <span className="text-gray-500">Month</span>
                        <p>{selectedRequest.receipt_month} {selectedRequest.receipt_year}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount</span>
                        <p className="font-medium text-green-600">₹{selectedRequest.receipt_amount?.toLocaleString()}</p>
                      </div>
                    </>
                  )}
                  
                  {selectedRequest.receipt_type === 'security_deposit' && (
                    <div>
                      <span className="text-gray-500">Amount</span>
                      <p className="font-medium text-green-600">₹{selectedRequest.receipt_amount?.toLocaleString()}</p>
                    </div>
                  )}
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
              {/* <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold mb-2 text-blue-600">Admin Actions</h4>
                <div className="space-y-3">
                  {selectedRequest.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleUpdateStatus(selectedRequest.id, 'approved', 'Request approved')}
                        className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700"
                        disabled={updating}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => {
                          setSelectedActionRequest(selectedRequest);
                          setShowDialog(false);
                          setShowRejectDialog(true);
                        }}
                        variant="destructive"
                        className="flex-1 h-8 text-xs"
                        disabled={updating}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {selectedRequest.admin_notes && (
                    <div className="pt-2 border-t">
                      <Label className="text-xs text-gray-500">Admin Notes</Label>
                      <div className="bg-blue-50 p-2 rounded mt-1">
                        <p className="text-xs">{selectedRequest.admin_notes}</p>
                      </div>
                    </div>
                  )}
                  {selectedRequest.resolved_at && (
                    <div className="pt-2 border-t">
                      <Label className="text-xs text-gray-500">Completed At</Label>
                      <p className="text-xs">
                        {new Date(selectedRequest.resolved_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div> */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white px-2 py-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <Settings className="h-4 w-4" />
                Update Status
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowStatusDialog(false)}
                className="h-5 w-5 text-white hover:bg-white/20"
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
                      <SelectItem value="approved">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span className="text-xs">Approved</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="rejected">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3.5 w-3.5" />
                          <span className="text-xs">Rejected</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3.5 w-3.5" />
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
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mt-4">
                <Label className="text-xs">Admin Notes (Optional)</Label>
                <Textarea
                  placeholder="Add notes about this status change..."
                  className="mt-1 text-xs"
                  rows={2}
                  value={selectedActionRequest.admin_notes || ''}
                  onChange={(e) => {
                    setSelectedActionRequest({
                      ...selectedActionRequest,
                      admin_notes: e.target.value
                    });
                  }}
                />
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
                  onClick={() => handleUpdateStatus(
                    selectedActionRequest.id, 
                    newStatus, 
                    selectedActionRequest.admin_notes || undefined
                  )}
                  disabled={updating || !newStatus || newStatus === selectedActionRequest.status}
                  className="h-8 text-xs px-4 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white"
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

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Reject Receipt Request
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this receipt request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label className="text-xs font-medium">Rejection Reason *</Label>
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="mt-1"
            />
            
            {selectedActionRequest && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Request Details:</p>
                <p className="text-sm font-medium mt-1">
                  {selectedActionRequest.tenant_name} - #{selectedActionRequest.id}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedActionRequest.receipt_type === 'rent' 
                    ? `${selectedActionRequest.receipt_month} ${selectedActionRequest.receipt_year}`
                    : 'Security Deposit'} • ₹{selectedActionRequest.receipt_amount?.toLocaleString()}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedActionRequest(null);
                setRejectionReason('');
              }}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleUpdateStatus(
                selectedActionRequest!.id, 
                'rejected', 
                rejectionReason
              )}
              disabled={updating || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
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