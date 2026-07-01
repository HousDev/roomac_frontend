// app/admin/notice-period-requests/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, ChevronDown, Trash2 } from "lucide-react";
import { 
  Eye, 
  AlertCircle, 
  Loader2, 
  Building, 
  User, 
  Mail, 
  Calendar, 
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  X,
  Bell,
  Plus,
  Search
} from "lucide-react";
import {
  getAdminNoticePeriodRequests,
  createNoticePeriodRequest,
  deleteNoticePeriodRequest,
  type NoticePeriodRequest
} from "@/lib/noticePeriodApi";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";

interface Tenant {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  property_name?: string;
  room_number?: string | number;
  bed_number?: string | number;
}

interface Property {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  active_tenants?: number;
}

export default function NoticePeriodRequestsPage() {
  const [requests, setRequests] = useState<NoticePeriodRequest[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NoticePeriodRequest | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [sortField, setSortField] = useState<keyof NoticePeriodRequest>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { can } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

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
  const [tenantSearch, setTenantSearch] = useState("");
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const tenantSearchRef = useRef<HTMLInputElement>(null);
  const tenantDropdownRef = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    loadRequests();
    fetchProperties();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tenantDropdownRef.current && !tenantDropdownRef.current.contains(event.target as Node)) {
        setIsTenantDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tenants based on search
  const getFilteredTenants = () => {
    if (!tenantSearch.trim()) return tenants;
    const query = tenantSearch.toLowerCase();
    return tenants.filter(tenant => {
      const fullName = String(tenant.full_name || '').toLowerCase();
      const email = String(tenant.email || '').toLowerCase();
      const phone = String(tenant.phone || '');
      const propertyName = String(tenant.property_name || '').toLowerCase();
      const roomNumber = String(tenant.room_number || '').toLowerCase();
      const bedNumber = String(tenant.bed_number || '');
      
      return fullName.includes(query) ||
             email.includes(query) ||
             phone.includes(query) ||
             propertyName.includes(query) ||
             roomNumber.includes(query) ||
             bedNumber.includes(query);
    });
  };

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

  // ✅ FIXED: Fetch properties using direct API call
  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      console.log("🔍 Fetching properties...");
      
      // Use the properties endpoint from your notice-period API
      const response = await fetch('/api/notice-period-requests/properties', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("📦 Properties data:", data);
      
      if (data.success && data.data) {
        setProperties(data.data);
        console.log(`✅ Loaded ${data.data.length} properties`);
      } else {
        console.error("❌ Failed to fetch properties:", data.message);
        setProperties([]);
        toast.error(data.message || "Failed to fetch properties");
      }
    } catch (error) {
      console.error("❌ Error fetching properties:", error);
      setProperties([]);
      toast.error("Failed to load properties. Please refresh the page.");
    } finally {
      setLoadingProperties(false);
    }
  };

  // ✅ FIXED: Fetch tenants by property
  const fetchTenantsByProperty = async (propertyId: string) => {
    if (!propertyId) {
      setTenants([]);
      return;
    }
    
    try {
      setLoadingTenants(true);
      console.log(`🔍 Fetching tenants for property ${propertyId}...`);
      
      const response = await fetch(`/api/notice-period-requests/properties/${propertyId}/tenants`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("📦 Tenants data:", data);
      
      if (data.success && data.data) {
        const transformedTenants = data.data.map((tenant: any) => ({
          id: tenant.id,
          full_name: tenant.full_name,
          email: tenant.email,
          phone: tenant.phone,
          room_number: tenant.room_number || 'N/A',
          property_name: tenant.property_name || 'N/A',
          bed_number: tenant.bed_number || 'N/A'
        }));
        setTenants(transformedTenants);
        console.log(`✅ Loaded ${transformedTenants.length} tenants`);
      } else {
        console.error("❌ Failed to fetch tenants:", data.message);
        setTenants([]);
        toast.error(data.message || "Failed to fetch tenants");
      }
    } catch (error) {
      console.error("❌ Error fetching tenants:", error);
      setTenants([]);
      toast.error("Failed to load tenants. Please try again.");
    } finally {
      setLoadingTenants(false);
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
        setSelectedPropertyId("");
        setSelectedTenant("");
        setTenants([]);
      } else {
        toast.error(result.message || "Failed to send request");
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
    setTenantSearch("");
    setTitle("");
    setDescription("");
    setNoticeDate("");
    setSelectedPropertyId("");
    setTenants([]);
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

  const currentPageItems = itemsPerPage === 9999
    ? filteredRequests
    : filteredRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

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
      {/* Stats Cards */}
      <div className="sticky top-36 z-10 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-4">
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

      {/* Header with Create Button */}
      <div className="sticky top-28 z-10 flex justify-end items-end mb-4">
        {can('manage_notice_period') && (
          <Button 
            onClick={() => {
              setShowCreateDialog(true);
              // Refresh properties when dialog opens
              if (properties.length === 0) {
                fetchProperties();
              }
            }}
            className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white hover:from-blue-700 hover:to-blue-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Notice Period
          </Button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {can('delete_requests') && selectedRequests.size > 0 && (
        <div className="sticky top-20 z-10 mb-2 bg-white rounded-lg shadow-lg border border-blue-200 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
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
      <Card className="shadow-sm border-0">
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 m-0 rounded-lg">
              <div className="bg-white p-8 rounded-full w-24 h-24 mx-auto mb-0 flex items-center justify-center shadow-sm">
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
              <div className={`overflow-auto rounded-b-lg transition-all duration-300 ${
                selectedRequests.size > 0
                  ? 'max-h-[210px] md:max-h-[350px]'
                  : 'max-h-[280px] md:max-h-[370px]'
              }`}>
                <table className="w-full min-w-[900px] table-fixed border-collapse">
                  <thead className="sticky top-0 z-[25]">
                    <tr className="bg-white border-b-2 border-blue-200">
                      {/* Checkbox */}
                      <th className="md:sticky md:left-0 z-[30] w-[40px] bg-white border-r border-gray-200 text-left">
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

                      {/* ID */}
                      <th className="md:sticky md:left-[40px] z-[30] w-[80px] bg-white border-r border-gray-200 text-left">
                        <div className="space-y-1.5 py-2 px-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('id')}>
                            <span className="font-semibold text-gray-700 text-xs">ID</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input
                            placeholder="Search..."
                            className="h-6 text-[11px] border-gray-200 focus:border-blue-400 px-1.5"
                            value={searchFilters.id}
                            onChange={(e) => handleSearchChange('id', e.target.value)}
                          />
                        </div>
                      </th>

                      {/* Actions */}
                      <th className="md:sticky md:left-[120px] z-[30] w-[80px] bg-white border-r border-gray-200 text-left">
                        <div className="py-2 px-2">
                          <span className="font-semibold text-gray-700 text-xs">Actions</span>
                        </div>
                      </th>

                      {/* Tenant */}
                      <th className="md:sticky md:left-[200px] z-[30] w-[180px] bg-white border-r border-gray-200 text-left">
                        <div className="space-y-1.5 py-2 px-2">
                          <span className="font-semibold text-gray-700 text-xs">Tenant</span>
                          <Input
                            placeholder="Search..."
                            className="h-6 text-[11px] border-gray-200 focus:border-blue-400 px-1.5"
                            value={searchFilters.tenant}
                            onChange={(e) => handleSearchChange('tenant', e.target.value)}
                          />
                        </div>
                      </th>

                      {/* Title */}
                      <th className="w-[200px] bg-white border-r border-gray-200 text-left">
                        <div className="space-y-1.5 py-2 px-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('title')}>
                            <span className="font-semibold text-gray-700 text-xs">Title</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <Input
                            placeholder="Search..."
                            className="h-6 text-[11px] border-gray-200 focus:border-blue-400 px-1.5"
                            value={searchFilters.title}
                            onChange={(e) => handleSearchChange('title', e.target.value)}
                          />
                        </div>
                      </th>

                      {/* Status */}
                      <th className="w-[120px] bg-white border-r border-gray-200 text-left">
                        <div className="space-y-1.5 py-2 px-2">
                          <span className="font-semibold text-gray-700 text-xs">Status</span>
                          <Select
                            value={searchFilters.status}
                            onValueChange={(value) => handleSearchChange('status', value)}
                          >
                            <SelectTrigger className="h-6 text-[11px] border-gray-200 px-1.5">
                              <SelectValue placeholder="All..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="unseen">Unseen</SelectItem>
                              <SelectItem value="seen">Seen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </th>

                      {/* Notice Date */}
                      <th className="w-[130px] bg-white border-r border-gray-200 text-left">
                        <div className="space-y-1.5 py-2 px-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('notice_period_date')}>
                            <span className="font-semibold text-gray-700 text-xs">Notice Date</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <div className="h-6 mt-1.5" />
                        </div>
                      </th>

                      {/* Sent On */}
                      <th className="w-[130px] bg-white text-left">
                        <div className="space-y-1.5 py-2 px-2">
                          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('created_at')}>
                            <span className="font-semibold text-gray-700 text-xs">Sent On</span>
                            <ArrowUpDown className="h-3 w-3 text-gray-500" />
                          </div>
                          <input
                            type="date"
                            style={{ fontSize: '10px', height: '24px', width: '100%', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '0 4px', colorScheme: 'light', cursor: 'pointer' }}
                            value={searchFilters.date}
                            onChange={(e) => handleSearchChange('date', e.target.value)}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentPageItems.map((request, index) => (
                      <tr
                        key={request.id}
                        className={`hover:bg-blue-50/40 transition-colors duration-150 border-b border-gray-100 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="md:sticky md:left-0 z-[20] w-[40px] bg-white border-r border-gray-100 py-2 px-2">
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

                        {/* ID */}
                        <td className="md:sticky md:left-[40px] z-[20] w-[80px] bg-white font-mono text-xs font-medium text-blue-600 border-r border-gray-100 py-2 px-2">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                            <span className="truncate">#{request.id}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="md:sticky md:left-[120px] z-[20] w-[80px] bg-white border-r border-gray-100 py-2 px-1">
                          <div className="flex items-center gap-0.5 flex-nowrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewRequest(request)}
                              className="h-6 w-6 p-0 hover:bg-blue-100 flex-shrink-0"
                              title="View Details"
                            >
                              <Eye className="h-3 w-3 text-blue-500" />
                            </Button>
                            {can('delete_requests') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(request.id)}
                                className="h-6 w-6 p-0 hover:bg-red-100 flex-shrink-0"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </td>

                        {/* Tenant */}
                        <td className="md:sticky md:left-[200px] z-[20] w-[180px] bg-white border-r border-gray-100 py-2 px-2">
                          <div className="flex items-center gap-1">
                            <div className="bg-blue-100 p-0.5 rounded-full flex-shrink-0">
                              <User className="h-3 w-3 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium truncate">{request.tenant_name || 'Unknown'}</div>
                              <div className="text-[10px] text-gray-500 truncate flex items-center gap-0.5">
                                <Mail className="h-2 w-2 flex-shrink-0" />
                                {request.tenant_email || 'No email'}
                              </div>
                              {request.property_name && (
                                <div className="text-[10px] text-gray-400 truncate flex items-center gap-0.5">
                                  <Building className="h-2 w-2 flex-shrink-0" />
                                  {request.property_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Title */}
                        <td className={`w-[200px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} border-r border-gray-100 py-2 px-2`}>
                          <div className="text-xs font-medium truncate text-gray-800">{request.title}</div>
                          {request.description && (
                            <div className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{request.description}</div>
                          )}
                        </td>

                        {/* Status */}
                        <td className={`w-[120px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} border-r border-gray-100 py-2 px-2`}>
                          <div className="transform transition-transform hover:scale-105">
                            {getSeenBadge(request.is_seen)}
                          </div>
                        </td>

                        {/* Notice Date */}
                        <td className={`w-[130px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} border-r border-gray-100 py-2 px-2`}>
                          <div className="text-xs font-medium whitespace-nowrap">
                            {new Date(request.notice_period_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>

                        {/* Sent On */}
                        <td className={`w-[130px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} py-2 px-2`}>
                          <div className="text-xs font-medium whitespace-nowrap">
                            {new Date(request.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-gray-500 whitespace-nowrap">
                            {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-3 py-2 rounded-b-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center justify-between sm:justify-start gap-2 text-xs">
                    <span className="text-gray-500 whitespace-nowrap">
                      {filteredRequests.length} requests
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="hidden sm:inline text-gray-600">Rows:</span>
                      <Select
                        value={String(itemsPerPage)}
                        onValueChange={(val) => {
                          setItemsPerPage(Number(val));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="h-7 w-[58px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="9999">All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
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
                      {itemsPerPage === 9999 ? '1/1' : `${currentPage}/${Math.ceil(filteredRequests.length / itemsPerPage) || 1}`}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={itemsPerPage === 9999 || currentPage >= Math.ceil(filteredRequests.length / itemsPerPage)}
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

      {/* Create Request Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) {
          resetForm();
          setTenantSearch("");
          setIsTenantDropdownOpen(false);
        } else {
          // Refresh properties when dialog opens
          if (properties.length === 0) {
            fetchProperties();
          }
          setSelectedPropertyId("");
          setSelectedTenant("");
          setTenants([]);
          setTimeout(() => {
            if (tenantSearchRef.current) {
              tenantSearchRef.current.focus();
            }
          }, 100);
        }
      }}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 rounded-xl overflow-hidden">
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
                  setTenantSearch("");
                  setIsTenantDropdownOpen(false);
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

          <form onSubmit={handleCreateRequest} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Select Property & Tenant */}
            <div className="border rounded-md p-3">
              <h4 className="text-xs font-semibold flex items-center gap-1 mb-3 text-blue-600">
                <Building2 className="h-3 w-3" />
                Select Property & Tenant
              </h4>
              
              {/* Property Selection */}
              <div className="mb-3">
                <Label className="text-xs font-medium">
                  Property <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedPropertyId}
                  onValueChange={(value) => {
                    setSelectedPropertyId(value);
                    setSelectedTenant("");
                    setTenantSearch("");
                    fetchTenantsByProperty(value);
                  }}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder={loadingProperties ? "Loading properties..." : "Select property..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingProperties ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-sm text-gray-500">Loading...</span>
                      </div>
                    ) : properties.length === 0 ? (
                      <div className="py-4 text-center text-sm text-gray-500">
                        No properties found
                      </div>
                    ) : (
                      properties.map((property) => (
                        <SelectItem key={property.id} value={property.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-gray-400" />
                            <span>{property.name}</span>
                            {property.active_tenants !== undefined && (
                              <span className="text-xs text-gray-400">
                                ({property.active_tenants} tenants)
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {!loadingProperties && properties.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No properties available. Please add a property first.
                  </p>
                )}
              </div>
              
              {/* Tenant Selection with Search */}
              <div className="relative" ref={tenantDropdownRef}>
                <div
                  className={`w-full border rounded-md px-3 py-2 cursor-pointer flex items-center justify-between bg-white hover:border-blue-400 transition-colors ${
                    !selectedPropertyId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (!selectedPropertyId) {
                      toast.info("Please select a property first");
                      return;
                    }
                    if (tenants.length === 0) {
                      toast.info("No tenants found in this property");
                      return;
                    }
                    setIsTenantDropdownOpen(!isTenantDropdownOpen);
                    setTimeout(() => {
                      if (tenantSearchRef.current && !isTenantDropdownOpen) {
                        tenantSearchRef.current.focus();
                      }
                    }, 50);
                  }}
                >
                  <div className="flex flex-col flex-1 min-w-0">
                    {selectedTenant ? (
                      <>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {tenants.find(t => t.id.toString() === selectedTenant)?.full_name}
                          </span>
                        </div>
                        {(() => {
                          const selected = tenants.find(t => t.id.toString() === selectedTenant);
                          if (selected) {
                            return (
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 flex-wrap">
                                <span className="bg-blue-50 px-1.5 py-0.5 rounded">R- {selected.room_number || 'N/A'}</span>
                                <span className="bg-green-50 px-1.5 py-0.5 rounded">B- {selected.bed_number || 'N/A'}</span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">
                        {loadingTenants ? "Loading tenants..." : 
                         !selectedPropertyId ? "Select property first" :
                         tenants.length === 0 ? "No tenants in this property" :
                         "Select a tenant..."}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${isTenantDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown with Search */}
                {isTenantDropdownOpen && selectedPropertyId && tenants.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b sticky top-0 bg-white">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          ref={tenantSearchRef}
                          type="text"
                          placeholder="Search by name, email or phone..."
                          value={tenantSearch}
                          onChange={(e) => setTenantSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    {/* Tenants List */}
                    <div className="max-h-64 overflow-y-auto">
                      {getFilteredTenants().length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No tenants match your search
                        </div>
                      ) : (
                        getFilteredTenants().map((tenant) => (
                          <div
                            key={tenant.id}
                            className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                              selectedTenant === tenant.id.toString() ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                            onClick={() => {
                              setSelectedTenant(tenant.id.toString());
                              setIsTenantDropdownOpen(false);
                              setTenantSearch("");
                            }}
                          >
                            <div className="flex flex-col">
                              <p className="font-medium text-sm text-gray-900 flex items-center gap-2">
                                <User className="h-3.5 w-3.5 text-blue-500" />
                                {tenant.full_name}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs bg-blue-50 px-2 py-0.5 rounded-full text-blue-700 border border-blue-100">
                                  R-{tenant.room_number || 'N/A'}
                                </span>
                                <span className="text-xs bg-green-50 px-2 py-0.5 rounded-full text-green-700 border border-green-100">
                                  B-{tenant.bed_number || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
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
                  setTenantSearch("");
                  setIsTenantDropdownOpen(false);
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
              <div className="flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-md text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Status:</span>
                  {getSeenBadge(selectedRequest.is_seen)}
                </div>
              </div>

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