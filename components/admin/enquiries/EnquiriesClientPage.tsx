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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Phone, Mail, Calendar, Trash2, Edit, BarChart, Search, Save } from "lucide-react";
import { toast } from "sonner";
import {
  getEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  updateEnquiryStatus,
  addFollowup,
  getEnquiryStats,
  type Enquiry,
  type CreateEnquiryPayload,
  type UpdateEnquiryPayload,
  type Followup
} from "@/lib/enquiryApi";
import { useRouter, useSearchParams } from "@/src/compat/next-navigation";
import EnquiriesTable from "./EnquiriesTable";
import EnquiriesFilters from "./EnquiriesFilters";
import EnquiriesStats from "./EnquiriesStats";
import EnquiryForm from "./EnquiryForm";
import EnquiryViewDialog from "./EnquiryViewDialog";
import { Skeleton } from "@/components/ui/skeleton";

// Types for initial props
interface EnquiriesClientPageProps {
  initialEnquiries: Enquiry[];
  initialStats: any;
  searchParams: {
    status?: string;
    search?: string;
  };
}

export default function EnquiriesClientPage({
  initialEnquiries,
  initialStats,
  searchParams: initialSearchParams,
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const initialLoadDone = useRef(false);

  // Add new enquiry form state
  const [newEnquiry, setNewEnquiry] = useState<CreateEnquiryPayload>({
    property_id: "",
    tenant_name: "",
    phone: "",
    email: "",
    preferred_move_in_date: "",
    budget_range: "",
    message: "",
    source: "website"
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
    status: "new"
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

  // Load data with filters - only when explicitly called
  const loadData = useCallback(async (isManualRefresh = false) => {
    // Skip if it's the initial render and we already have data
    if (isFirstRender && !isManualRefresh) {
      setIsFirstRender(false);
      return;
    }

    setLoading(true);
    
    try {
      const filters: any = {};
      if (statusFilter && statusFilter !== "all" && statusFilter !== "") filters.status = statusFilter;
      if (searchTerm) filters.search = searchTerm;

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
      if (isInitialLoad) setIsInitialLoad(false);
    }
  }, [statusFilter, searchTerm, isFirstRender, isInitialLoad]);

  // Load properties once on mount
  useEffect(() => {
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
    
    // Mark initial load as done after first render
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      setIsFirstRender(false);
      setIsInitialLoad(false);
    }
  }, []);

  // Handle filter changes with URL updates - FIXED: Removed infinite loop
  useEffect(() => {
    // Don't run on first render
    if (isFirstRender) {
      return;
    }

    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "all") params.set('status', statusFilter);
    if (searchTerm) params.set('search', searchTerm);
    
    const queryString = params.toString();
    const currentPath = window.location.pathname;
    const newUrl = `${currentPath}${queryString ? `?${queryString}` : ''}`;
    
    // Only update URL if it's different from current
    if (window.location.href !== window.location.origin + newUrl) {
      router.push(newUrl);
    }
    
    // Debounce search to prevent rapid API calls
    const timeoutId = setTimeout(() => {
      loadData(true);
    }, 800); // Increased debounce time

    return () => clearTimeout(timeoutId);
  }, [statusFilter, searchTerm, router, isFirstRender, loadData]);

  // Add new enquiry handler
  const handleAddEnquiry = useCallback(async () => {
    if (!newEnquiry.tenant_name || !newEnquiry.phone) {
      toast.error("Name and phone are required");
      return;
    }

    if (!newEnquiry.property_id) {
      toast.error("Please select a property");
      return;
    }

    try {
      const selectedProperty = properties.find((p) => p.id === newEnquiry.property_id);
      const formattedDate = formatDateForDatabase(newEnquiry.preferred_move_in_date || "");

      const enquiryData: CreateEnquiryPayload = {
        ...newEnquiry,
        property_name: selectedProperty?.name || "",
        preferred_move_in_date: formattedDate || ""
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
        source: "website"
      });

      // Refresh data after adding
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
      status: enquiry.status || "new"
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
      
      // Refresh data after updating
      await loadData(true);
    } catch (error: any) {
      console.error("Error updating enquiry:", error);
      toast.error(error.message || "Failed to update enquiry");
    }
  }, [selectedEnquiry, editEnquiryData, properties, formatDateForDatabase, loadData]);

  const handleUpdateStatus = useCallback(async (id: string, status: string) => {
    try {
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
  }, [selectedEnquiry]);

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

      // Refresh data after adding followup
      await loadData(true);
      
      // Update selected enquiry
      const updatedEnquiries = await getEnquiries();
      const updatedEnquiry = updatedEnquiries.results.find(e => e.id === selectedEnquiry.id);
      if (updatedEnquiry) {
        setSelectedEnquiry(updatedEnquiry);
      }
    } catch (error) {
      console.error("Error adding followup:", error);
      toast.error("Failed to add followup");
    }
  }, [followupText, selectedEnquiry, loadData]);

  const handleDeleteEnquiry = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      await deleteEnquiry(id);
      toast.success("Enquiry deleted successfully");

      setShowViewDialog(false);
      setShowEditDialog(false);
      
      // Refresh data after deletion
      await loadData(true);
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      toast.error("Failed to delete enquiry");
    }
  }, [loadData]);

  // Format date for display
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
      <Badge variant="outline" className={`${variants[status] || "bg-gray-100"} capitalize`}>
        {status}
      </Badge>
    );
  }, []);

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // Loading state
  if (loading && enquiries.length === 0 && !isInitialLoad) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">Enquiry Management</h1>
            <p className="text-gray-600 mt-1">Track and manage property enquiries</p>
          </div>

          <div className="w-full sm:w-auto flex justify-end gap-2">
            {/* Refresh Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              disabled={loading}
            >
              <svg 
                className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 16h5v5"/>
              </svg>
              Refresh
            </Button>

            {/* Statistics Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart className="h-4 w-4 mr-2" />
                  Detailed Stats
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Enquiry Statistics</DialogTitle>
                </DialogHeader>
                {stats && <EnquiriesStats stats={stats} />}
              </DialogContent>
            </Dialog>

            {/* Add Enquiry Button */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Enquiry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Enquiry</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new enquiry
                  </DialogDescription>
                </DialogHeader>
                <EnquiryForm
                  formData={newEnquiry}
                  setFormData={setNewEnquiry}
                  properties={properties}
                  onSubmit={handleAddEnquiry}
                  submitLabel="Add Enquiry"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && <EnquiriesStats stats={stats} />}

        {/* Filters */}
        <EnquiriesFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Enquiries Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Enquiries ({enquiries.length})</CardTitle>
              <div className="text-sm text-gray-500">
                Showing {enquiries.length} enquiries
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Move-in Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No enquiries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    enquiries.map((enquiry) => (
                      <TableRow key={enquiry.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{enquiry.tenant_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {enquiry.phone}
                            </div>
                            {enquiry.email && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                {enquiry.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{enquiry.property_full_name || enquiry.property_name || "-"}</TableCell>
                        <TableCell>{formatDateForDisplay(enquiry.preferred_move_in_date)}</TableCell>
                        <TableCell>{getStatusBadge(enquiry.status || "new")}</TableCell>
                        <TableCell>{formatDateForDisplay(enquiry.created_at || "")}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedEnquiry(enquiry);
                                setShowViewDialog(true);
                              }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditDialog(enquiry)}
                              title="Edit Enquiry"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Select
                              value={enquiry.status || "new"}
                              onValueChange={(value) => handleUpdateStatus(enquiry.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="interested">Interested</SelectItem>
                                <SelectItem value="not_interested">Not Interested</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEnquiry(enquiry.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete Enquiry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Enquiry Dialog */}
      <EnquiryViewDialog
        enquiry={selectedEnquiry}
        isOpen={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        followupText={followupText}
        setFollowupText={setFollowupText}
        onAddFollowup={handleAddFollowup}
        getStatusBadge={getStatusBadge}
        formatDateForDisplay={formatDateForDisplay}
        onDelete={handleDeleteEnquiry}
      />

      {/* Edit Enquiry Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Enquiry</DialogTitle>
            <DialogDescription>
              Update enquiry details for {selectedEnquiry?.tenant_name}
            </DialogDescription>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="grid gap-4 py-4">
              <EnquiryForm
                formData={editEnquiryData}
                setFormData={setEditEnquiryData}
                properties={properties}
                isEdit={true}
                currentStatus={selectedEnquiry.status}
              />
              <div className="flex justify-between pt-4">
                <div>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                    className="mr-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateEnquiry}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Update Enquiry
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}