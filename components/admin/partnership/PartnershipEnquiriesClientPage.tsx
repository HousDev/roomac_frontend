// components/admin/partnership/PartnershipEnquiriesClientPage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Eye, 
  Loader2, 
  RefreshCw, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  X,
  Search,
  Filter,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  PartnershipEnquiry, 
  PartnershipStats,
  getPartnershipEnquiries,
  updatePartnershipEnquiry,
  deletePartnershipEnquiry,
  bulkDeletePartnershipEnquiries
} from "@/lib/partnershipApi";

interface PartnershipEnquiriesClientPageProps {
  initialEnquiries: PartnershipEnquiry[];
  initialStats: PartnershipStats | null;
  onFiltersChange: (filters: { status: string; search: string }) => void;
}

export default function PartnershipEnquiriesClientPage({ 
  initialEnquiries, 
  initialStats,
  onFiltersChange 
}: PartnershipEnquiriesClientPageProps) {
  const [enquiries, setEnquiries] = useState<PartnershipEnquiry[]>(initialEnquiries);
  const [stats, setStats] = useState<PartnershipStats | null>(initialStats);
  const [loading, setLoading] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<PartnershipEnquiry | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<PartnershipEnquiry>>({});
  const [selectedEnquiries, setSelectedEnquiries] = useState<Set<number>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [sortField, setSortField] = useState<keyof PartnershipEnquiry>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Update local state when props change
  useEffect(() => {
    setEnquiries(initialEnquiries);
  }, [initialEnquiries]);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await getPartnershipEnquiries(filters);
      if (response.success) {
        setEnquiries(response.results);
        toast.success("Data refreshed");
      }
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewEnquiry = (enquiry: PartnershipEnquiry) => {
    setSelectedEnquiry(enquiry);
    setShowViewDialog(true);
  };

  const handleEditEnquiry = (enquiry: PartnershipEnquiry) => {
    setSelectedEnquiry(enquiry);
    setEditFormData(enquiry);
    setShowEditDialog(true);
  };

  const handleUpdateEnquiry = async () => {
    if (!selectedEnquiry) return;
    
    try {
      const response = await updatePartnershipEnquiry(selectedEnquiry.id, editFormData);
      if (response.success) {
        toast.success("Enquiry updated successfully");
        setShowEditDialog(false);
        handleRefresh();
      }
    } catch (error: any) {
      console.error('Error updating enquiry:', error);
      toast.error(error.message || "Failed to update enquiry");
    }
  };

  const handleDeleteEnquiry = async (id: number) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    
    try {
      const response = await deletePartnershipEnquiry(id);
      if (response.success) {
        toast.success("Enquiry deleted successfully");
        handleRefresh();
      }
    } catch (error: any) {
      console.error('Error deleting enquiry:', error);
      toast.error(error.message || "Failed to delete enquiry");
    }
  };

  const handleSelectAll = () => {
    if (selectedEnquiries.size === filteredEnquiries.length) {
      setSelectedEnquiries(new Set());
    } else {
      setSelectedEnquiries(new Set(filteredEnquiries.map(e => e.id)));
    }
  };

  const handleSelectEnquiry = (id: number) => {
    const newSelected = new Set(selectedEnquiries);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEnquiries(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedEnquiries.size === 0) return;
    
    try {
      setBulkActionLoading(true);
      await bulkDeletePartnershipEnquiries(Array.from(selectedEnquiries));
      toast.success(`Successfully deleted ${selectedEnquiries.size} enquiries`);
      setSelectedEnquiries(new Set());
      setShowBulkDeleteDialog(false);
      handleRefresh();
    } catch (error: any) {
      console.error('Error deleting enquiries:', error);
      toast.error(error.message || "Failed to delete enquiries");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "destructive",
      contacted: "default",
      in_review: "secondary",
      approved: "outline",
      rejected: "outline"
    };

    const badgeText = status === 'in_review' ? 'In Review' : 
                     status.charAt(0).toUpperCase() + status.slice(1);
    
    const colors: Record<string, string> = {
      new: "bg-red-100 text-red-800 border-red-200",
      contacted: "bg-blue-100 text-blue-800 border-blue-200",
      in_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-gray-100 text-gray-800 border-gray-200"
    };

    return (
      <Badge className={colors[status] || "bg-gray-100"}>
        {badgeText}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4 mr-1" />;
      case 'contacted': return <MessageSquare className="h-4 w-4 mr-1" />;
      case 'in_review': return <Loader2 className="h-4 w-4 mr-1 animate-spin" />;
      case 'approved': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'rejected': return <XCircle className="h-4 w-4 mr-1" />;
      default: return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  const handleSort = (field: keyof PartnershipEnquiry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEnquiries = [...enquiries].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredEnquiries = sortedEnquiries.filter(enquiry => {
    const matchesStatus = filters.status === 'all' || enquiry.status === filters.status;
    const matchesSearch = !filters.search || 
      enquiry.company_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      enquiry.contact_person.toLowerCase().includes(filters.search.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      enquiry.phone.includes(filters.search);
    
    return matchesStatus && matchesSearch;
  });

  if (loading && enquiries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Total</p>
                <p className="text-xl font-bold">{stats?.total || 0}</p>
              </div>
              <Building2 className="h-6 w-6 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600">New</p>
                <p className="text-xl font-bold text-red-700">{stats?.new_count || 0}</p>
              </div>
              <Clock className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600">Contacted</p>
                <p className="text-xl font-bold text-blue-700">{stats?.contacted_count || 0}</p>
              </div>
              <MessageSquare className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600">In Review</p>
                <p className="text-xl font-bold text-yellow-700">{stats?.in_review_count || 0}</p>
              </div>
              <Loader2 className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600">Approved</p>
                <p className="text-xl font-bold text-green-700">{stats?.approved_count || 0}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by company, contact, email, phone..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Bulk Actions Bar */}
      {selectedEnquiries.size > 0 && (
        <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {selectedEnquiries.size} {selectedEnquiries.size === 1 ? 'enquiry' : 'enquiries'} selected
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedEnquiries(new Set())}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
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
      )}

      {/* Table */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          {filteredEnquiries.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No partnership enquiries found</h3>
              <p className="text-gray-500">No partnership enquiries have been submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={selectedEnquiries.size === filteredEnquiries.length && filteredEnquiries.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1">
                        ID <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('company_name')}>
                      <div className="flex items-center gap-1">
                        Company <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Property Details</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        Status <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                      <div className="flex items-center gap-1">
                        Date <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnquiries.map((enquiry) => (
                    <TableRow key={enquiry.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedEnquiries.has(enquiry.id)}
                          onCheckedChange={() => handleSelectEnquiry(enquiry.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">#{enquiry.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{enquiry.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{enquiry.contact_person}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-xs">{enquiry.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-xs">{enquiry.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{enquiry.property_type || 'Not specified'}</div>
                          <div className="text-xs text-gray-500">
                            {enquiry.property_count} {enquiry.property_count === 1 ? 'property' : 'properties'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{enquiry.location || 'Not specified'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(enquiry.status)}
                          {getStatusBadge(enquiry.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{new Date(enquiry.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(enquiry.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewEnquiry(enquiry)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEnquiry(enquiry)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEnquiry(enquiry.id)}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
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
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Partnership Enquiry Details</DialogTitle>
            <DialogDescription>
              Complete information about the partnership enquiry
            </DialogDescription>
          </DialogHeader>
          
          {selectedEnquiry && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Company Name</Label>
                  <p className="font-medium">{selectedEnquiry.company_name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Contact Person</Label>
                  <p className="font-medium">{selectedEnquiry.contact_person}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <p>{selectedEnquiry.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <p>{selectedEnquiry.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Property Type</Label>
                  <p>{selectedEnquiry.property_type || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Number of Properties</Label>
                  <p>{selectedEnquiry.property_count || 1}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Location</Label>
                  <p>{selectedEnquiry.location || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedEnquiry.status)}</div>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Message</Label>
                  <div className="bg-gray-50 p-3 rounded-md mt-1">
                    {selectedEnquiry.message || 'No message provided'}
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Remarks</Label>
                  <div className="bg-gray-50 p-3 rounded-md mt-1">
                    {selectedEnquiry.remark || 'No remarks'}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Created At</Label>
                  <p>{new Date(selectedEnquiry.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Last Updated</Label>
                  <p>{new Date(selectedEnquiry.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Update Status Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Partnership Enquiry</DialogTitle>
            <DialogDescription>
              Update status or add remarks
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select 
                value={editFormData.status} 
                onValueChange={(v) => setEditFormData({ ...editFormData, status: v as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Remarks</Label>
              <Textarea
                value={editFormData.remark || ''}
                onChange={(e) => setEditFormData({ ...editFormData, remark: e.target.value })}
                placeholder="Add remarks or notes..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateEnquiry}>Update</Button>
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
              Are you sure you want to delete {selectedEnquiries.size} {selectedEnquiries.size === 1 ? 'enquiry' : 'enquiries'}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
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
                  Delete {selectedEnquiries.size} {selectedEnquiries.size === 1 ? 'Enquiry' : 'Enquiries'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}