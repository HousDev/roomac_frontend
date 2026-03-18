// app/admin/notice-period-requests/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Building, 
  User, 
  Mail, 
  Calendar, 
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  X,
  Bell,
  Plus
} from "lucide-react";
import {
  getAdminNoticePeriodRequests,
  createNoticePeriodRequest,
  deleteNoticePeriodRequest,
  getAdminUnseenCount,
  type NoticePeriodRequest
} from "@/lib/noticePeriodApi";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Tenant {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  property_name?: string;
  room_number?: string;
}

export default function NoticePeriodRequestsPage() {
  const [requests, setRequests] = useState<NoticePeriodRequest[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NoticePeriodRequest | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof NoticePeriodRequest>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    id: '',
    tenant: '',
    title: '',
    status: 'all',
    date: ''
  });

  // Bulk actions
  const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Create form state
  const [selectedTenant, setSelectedTenant] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [noticeDate, setNoticeDate] = useState("");

  useEffect(() => {
    loadRequests();
    loadTenants();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const result = await getAdminNoticePeriodRequests(1, 100);
      if (result.success) {
        setRequests(result.data);
      }
    } catch (err: any) {
      console.error('Error loading requests:', err);
      toast.error("Failed to load notice period requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      const res = await fetch("/api/tenants?is_active=true&include_deleted=false");
      const data = await res.json();
      if (data.success) {
        setTenants(data.data);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      setTenants([]);
    }
  };

  const handleViewRequest = (request: NoticePeriodRequest) => {
    setSelectedRequest(request);
    setShowViewDialog(true);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTenant || !title || !noticeDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const result = await createNoticePeriodRequest({
        tenant_id: parseInt(selectedTenant),
        title,
        description,
        notice_period_date: noticeDate
      });

      if (result.success) {
        toast.success("Notice period request sent successfully");
        setShowCreateDialog(false);
        resetForm();
        loadRequests();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to create request:", error);
      toast.error("Failed to send request");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      const result = await deleteNoticePeriodRequest(id);
      if (result.success) {
        toast.success("Request deleted successfully");
        loadRequests();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to delete request:", error);
      toast.error("Failed to delete request");
    }
  };

  const resetForm = () => {
    setSelectedTenant("");
    setTitle("");
    setDescription("");
    setNoticeDate("");
  };

  const handleSort = (field: keyof NoticePeriodRequest) => {
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
      
      // Delete only the selected requests
      const deletePromises = Array.from(selectedRequests).map(id => deleteNoticePeriodRequest(id));
      await Promise.all(deletePromises);
      
      toast.success(`Successfully deleted ${selectedRequests.size} requests`);
      setSelectedRequests(new Set());
      setShowBulkDeleteDialog(false);
      await loadRequests();
    } catch (error: any) {
      console.error('Error deleting requests:', error);
      toast.error(error.message || "Failed to delete requests");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getSeenBadge = (isSeen: number) => {
    return isSeen === 1 ? (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 px-2 py-1">
        <CheckCircle className="h-3 w-3" />
        Seen
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 px-2 py-1">
        <Bell className="h-3 w-3" />
        Unseen
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

  // Filter requests
  const filteredRequests = sortedRequests.filter(request => {
    const matchesId = request.id.toString().includes(searchFilters.id);
    const matchesTenant = (request.tenant_name || '').toLowerCase().includes(searchFilters.tenant.toLowerCase());
    const matchesTitle = (request.title || '').toLowerCase().includes(searchFilters.title.toLowerCase());
    const matchesStatus = searchFilters.status === 'all' || 
      (searchFilters.status === 'seen' && request.is_seen === 1) ||
      (searchFilters.status === 'unseen' && request.is_seen === 0);
    const matchesDate = !searchFilters.date || 
      new Date(request.created_at).toISOString().split('T')[0] === searchFilters.date;
    
    return matchesId && matchesTenant && matchesTitle && matchesStatus && matchesDate;
  });

  // Stats
  const stats = [
    {
      title: "Total Requests",
      value: requests.length,
      icon: <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-white" />,
      bgColor: "bg-slate-600",
    },
    {
      title: "Unseen",
      value: requests.filter(r => r.is_seen === 0).length,
      icon: <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-white" />,
      bgColor: "bg-yellow-600",
    },
    {
      title: "Seen",
      value: requests.filter(r => r.is_seen === 1).length,
      icon: <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />,
      bgColor: "bg-green-600",
    },
    {
      title: "Response Rate",
      value: requests.length ? Math.round((requests.filter(r => r.is_seen === 1).length / requests.length) * 100) + '%' : '0%',
      icon: <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-white" />,
      bgColor: "bg-blue-600",
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Loading notice period requests...</p>
      </div>
    );
  }

  return (
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">

      {/* Header with Title and Create Button */}
      <div className="flex justify-end items-end mb-4">
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Notice Period
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-4">
        {stats.map((stat, index) => (
          <Card key={index} className={`bg-gradient-to-br from-${stat.bgColor.split('-')[1]}-50 to-${stat.bgColor.split('-')[1]}-100 border-0 shadow-sm`}>
            <CardContent className="p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedRequests.size > 0 && (
        <div className="sticky top-20 z-10 mb-4 bg-white rounded-lg shadow-lg border border-blue-200 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
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
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 m-6 rounded-lg">
              <div className="bg-white p-8 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-sm">
                <Bell className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notice period requests found</h3>
              <p className="text-gray-500 mb-4">No notice period requests have been sent yet.</p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Request
              </Button>
            </div>
          ) : (
            <div className="relative">
              {/* Table with Sticky Header */}
              <div className="overflow-y-auto rounded-b-lg max-h-[550px]">
                <Table className="relative">
                  <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-white shadow-sm">
                    <TableRow className="hover:bg-transparent">
                      {/* Checkbox Column */}
                      <TableHead className="w-[50px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="py-2 flex justify-center">
                          <Checkbox 
                            checked={selectedRequests.size === filteredRequests.length && filteredRequests.length > 0}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                          />
                        </div>
                      </TableHead>

                      {/* ID Column with Search */}
                      <TableHead className="min-w-[100px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-2 py-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('id')}>
                            <span className="font-semibold text-gray-700">ID</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Search ID..." 
                            className="h-8 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.id}
                            onChange={(e) => handleSearchChange('id', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Tenant Column with Search */}
                      <TableHead className="min-w-[200px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-2 py-2">
                          <span className="font-semibold text-gray-700">Tenant</span>
                          <Input 
                            placeholder="Search tenant..." 
                            className="h-8 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.tenant}
                            onChange={(e) => handleSearchChange('tenant', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Title Column with Search */}
                      <TableHead className="min-w-[250px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-2 py-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('title')}>
                            <span className="font-semibold text-gray-700">Title</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Search title..." 
                            className="h-8 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.title}
                            onChange={(e) => handleSearchChange('title', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Status Column with Select Filter */}
                      <TableHead className="min-w-[140px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-2 py-2">
                          <span className="font-semibold text-gray-700">Status</span>
                          <Select 
                            value={searchFilters.status} 
                            onValueChange={(value) => handleSearchChange('status', value)}
                          >
                            <SelectTrigger className="h-8 text-xs border-gray-200">
                              <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="unseen">Unseen</SelectItem>
                              <SelectItem value="seen">Seen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableHead>
                      
                      {/* Notice Date Column */}
                      <TableHead className="min-w-[150px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-2 py-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('notice_period_date')}>
                            <span className="font-semibold text-gray-700">Notice Date</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                        </div>
                      </TableHead>
                      
                      {/* Created Date Column with Search */}
                      <TableHead className="min-w-[150px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <div className="space-y-2 py-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('created_at')}>
                            <span className="font-semibold text-gray-700">Sent On</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input 
                            placeholder="Search date..." 
                            type="date"
                            className="h-8 text-xs border-gray-200 focus:border-blue-400"
                            value={searchFilters.date}
                            onChange={(e) => handleSearchChange('date', e.target.value)}
                          />
                        </div>
                      </TableHead>
                      
                      {/* Actions Column */}
                      <TableHead className="min-w-[100px] bg-white/95 backdrop-blur-sm border-b-2 border-blue-200">
                        <span className="font-semibold text-gray-700">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody>
                    {filteredRequests.map((request, index) => (
                      <TableRow 
                        key={request.id} 
                        className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        } ${!request.is_seen ? 'border-l-4 border-l-yellow-400' : ''}`}
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

                        <TableCell className="font-mono text-sm font-medium text-blue-600">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                            #{request.id}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="font-medium flex items-center gap-1.5">
                              <div className="bg-blue-100 p-1 rounded-full">
                                <User className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="truncate max-w-[150px]">
                                {request.tenant_name || "Unknown"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 ml-6">
                              <Mail className="h-3 w-3" />
                              {request.tenant_email || "No email"}
                            </div>
                            {request.property_name && (
                              <div className="text-xs text-gray-400 ml-6">
                                <Building className="h-3 w-3 inline mr-1" />
                                {request.property_name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-2">
                            <div className="font-medium text-sm line-clamp-1 text-gray-800">
                              {request.title}
                            </div>
                            {request.description && (
                              <div className="text-xs text-gray-500 line-clamp-2 max-w-[250px]">
                                {request.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="transform transition-transform hover:scale-105">
                            {getSeenBadge(request.is_seen)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {new Date(request.notice_period_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(request.notice_period_date).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {new Date(request.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(request.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Actions Column */}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
                              >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 border-blue-100 shadow-lg">
                              <DropdownMenuLabel className="text-blue-600">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleViewRequest(request)}
                                className="cursor-pointer hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(request.id)}
                                className="cursor-pointer hover:bg-red-50 text-red-600 focus:text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* Create Request Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <Plus className="h-4 w-4" />
                Send Notice Period Request
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
                className="h-7 w-7 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-blue-50 text-xs mt-1">
              Send a notice period request to a tenant
            </DialogDescription>
          </DialogHeader>

          {/* Form */}
          <form onSubmit={handleCreateRequest} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Tenant Selection */}
            <div className="border rounded-md p-3">
              <h4 className="text-xs font-semibold flex items-center gap-1 mb-3 text-blue-600">
                <User className="h-3 w-3" />
                Select Tenant
              </h4>
              
              <Select value={selectedTenant} onValueChange={setSelectedTenant} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a tenant">
                    {selectedTenant && (
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span>{tenants.find(t => t.id.toString() === selectedTenant)?.full_name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id.toString()} className="py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{tenant.full_name}</span>
                        {/* <span className="text-xs text-gray-500">
                          {tenant.property_name || 'No Property'} {tenant.room_number ? `• Room ${tenant.room_number}` : ''}
                        </span> */}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Request Details */}
            <div className="border rounded-md p-3">
              <h4 className="text-xs font-semibold flex items-center gap-1 mb-3 text-blue-600">
                <FileText className="h-3 w-3" />
                Request Details
              </h4>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="title" className="text-xs font-medium">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 30 Days Notice Period"
                    className="mt-1 h-9 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="noticeDate" className="text-xs font-medium">
                    Notice Period Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="noticeDate"
                      type="date"
                      value={noticeDate}
                      onChange={(e) => setNoticeDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-10 h-9 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-xs font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional details about the notice period..."
                    rows={3}
                    className="mt-1 text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                Send Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
          
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-white text-sm sm:text-base font-semibold">
                <Eye className="h-4 w-4" />
                Notice Period Details - #{selectedRequest?.id}
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
              Complete information about the notice period request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="p-4 sm:p-5 space-y-3 max-h-[80vh] overflow-y-auto">

              {/* Status */}
              <div className="flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-md text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Status:</span>
                  {getSeenBadge(selectedRequest.is_seen)}
                </div>
              </div>

              {/* Tenant Info */}
              <div className="border rounded-md p-3">
                <h4 className="text-xs font-semibold flex items-center gap-1 mb-2 text-blue-600">
                  <User className="h-3 w-3" />
                  Tenant Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Name</span>
                    <p className="font-medium truncate flex items-center gap-1">
                      <User className="h-3 w-3 text-gray-400" />
                      {selectedRequest.tenant_name}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">Email</span>
                    <p className="flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 text-gray-400" />
                      {selectedRequest.tenant_email || "N/A"}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">Property</span>
                    <p className="flex items-center gap-1 truncate">
                      <Building className="h-3 w-3 text-gray-400" />
                      {selectedRequest.property_name || "Not specified"}
                    </p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-500">Title</span>
                      <p className="font-medium">{selectedRequest.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Notice Period Date</span>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {new Date(selectedRequest.notice_period_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {selectedRequest.description && (
                    <div>
                      <span className="text-gray-500">Description</span>
                      <div className="bg-gray-50 p-3 rounded mt-1 max-h-32 overflow-y-auto text-sm">
                        {selectedRequest.description}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-500">Sent On</span>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      {new Date(selectedRequest.created_at).toLocaleString('en-US', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              </div>
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
              Are you sure you want to delete {selectedRequests.size} {selectedRequests.size === 1 ? 'request' : 'requests'}? 
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