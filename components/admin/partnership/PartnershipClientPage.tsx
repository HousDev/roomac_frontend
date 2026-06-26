// // components/admin/partnership/PartnershipEnquiriesClientPage.tsx
// import { useState, useEffect } from 'react';
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { 
//   Eye, 
//   Loader2, 
//   RefreshCw, 
//   Building2, 
//   User, 
//   Phone, 
//   Mail, 
//   MessageSquare, 
//   MoreVertical,
//   CheckCircle,
//   XCircle,
//   Clock,
//   ArrowUpDown,
//   X,
//   Search,
//   Filter,
//   AlertCircle,
//   Edit,
//   Plus,
//   Calendar,
//   MapPin,
//   StickyNote,
//   Trash2
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { toast } from "sonner";
// import { 
//   PartnershipEnquiry, 
//   PartnershipStats,
//   PartnershipFollowup,
//   getPartnershipEnquiries,
//   updatePartnershipEnquiry,
//   deletePartnershipEnquiry,
//   bulkDeletePartnershipEnquiries,
//   createPartnershipEnquiry,
//   addPartnershipFollowup,
//   updatePartnershipStatus
// } from "@/lib/partnershipApi";
// import PartnershipForm from './PartnershipForm';
// import { useAuth } from '@/context/authContext';

// interface PartnershipEnquiriesClientPageProps {
//   initialEnquiries: PartnershipEnquiry[];
//   initialStats: PartnershipStats | null;
//   onFiltersChange: (filters: { status: string; search: string }) => void;
// }

// export default function PartnershipEnquiriesClientPage({ 
//   initialEnquiries, 
//   initialStats,
//   onFiltersChange 
// }: PartnershipEnquiriesClientPageProps) {
//   const [enquiries, setEnquiries] = useState<PartnershipEnquiry[]>(initialEnquiries);
//   const [stats, setStats] = useState<PartnershipStats | null>(initialStats);
//   const [loading, setLoading] = useState(false);
//   const [selectedEnquiry, setSelectedEnquiry] = useState<PartnershipEnquiry | null>(null);
//   const [showViewDialog, setShowViewDialog] = useState(false);
//   const [showEditDialog, setShowEditDialog] = useState(false);
//   const [showAddDialog, setShowAddDialog] = useState(false);
//   const [editFormData, setEditFormData] = useState<Partial<PartnershipEnquiry>>({});
//   const [addFormData, setAddFormData] = useState<Partial<PartnershipEnquiry>>({
//     status: 'new'
//   });
//   const [selectedEnquiries, setSelectedEnquiries] = useState<Set<number>>(new Set());
//   const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
//   const [bulkActionLoading, setBulkActionLoading] = useState(false);
//   const [filters, setFilters] = useState({ status: 'all', search: '' });
//   const [sortField, setSortField] = useState<keyof PartnershipEnquiry>('created_at');
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
//   const [addLoading, setAddLoading] = useState(false);
//   const [editLoading, setEditLoading] = useState(false);
//   const [followupText, setFollowupText] = useState("");
//   const [isAddingFollowup, setIsAddingFollowup] = useState(false);
//   const [activeTab, setActiveTab] = useState("details");
// // Add these with other state declarations (around line 30-40)
// const [showDeleteDialog, setShowDeleteDialog] = useState(false);
// const [enquiryToDelete, setEnquiryToDelete] = useState<PartnershipEnquiry | null>(null);
// const [isDeleting, setIsDeleting] = useState(false);
//   // Update local state when props change
//     const { can } = useAuth(); // ← YAHAN ADD KARO

//   useEffect(() => {
//     setEnquiries(initialEnquiries);
//   }, [initialEnquiries]);

//   useEffect(() => {
//     setStats(initialStats);
//   }, [initialStats]);

//   // Reset followup text when dialog closes
//   useEffect(() => {
//     if (!showViewDialog) {
//       setFollowupText("");
//       setActiveTab("details");
//     }
//   }, [showViewDialog]);

//   const handleFilterChange = (key: string, value: string) => {
//     const newFilters = { ...filters, [key]: value };
//     setFilters(newFilters);
//     onFiltersChange(newFilters);
//   };

//   const handleRefresh = async () => {
//     setLoading(true);
//     try {
//       const response = await getPartnershipEnquiries(filters);
//       if (response.success) {
//         setEnquiries(response.results);
//         toast.success("Data refreshed");
//       }
//     } catch (error) {
//       console.error('Error refreshing:', error);
//       toast.error("Failed to refresh data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewEnquiry = (enquiry: PartnershipEnquiry) => {
//     setSelectedEnquiry(enquiry);
//     setShowViewDialog(true);
//   };

//   const handleEditEnquiry = (enquiry: PartnershipEnquiry) => {
//     setSelectedEnquiry(enquiry);
//     setEditFormData(enquiry);
//     setShowEditDialog(true);
//   };

//   const handleAddEnquiry = async () => {
//     if (!addFormData.company_name || !addFormData.contact_person || !addFormData.email || !addFormData.phone) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       setAddLoading(true);
//       const response = await createPartnershipEnquiry(addFormData);
//       if (response.success) {
//         toast.success("Partnership enquiry added successfully");
//         setShowAddDialog(false);
//         setAddFormData({ status: 'new' });
//         handleRefresh();
//       } else {
//         toast.error(response.message || "Failed to add enquiry");
//       }
//     } catch (error: any) {
//       console.error('Error adding enquiry:', error);
//       toast.error(error.message || "Failed to add enquiry");
//     } finally {
//       setAddLoading(false);
//     }
//   };

//   const handleUpdateEnquiry = async () => {
//     if (!selectedEnquiry) return;
    
//     try {
//       setEditLoading(true);
//       const response = await updatePartnershipEnquiry(selectedEnquiry.id, editFormData);
//       if (response.success) {
//         toast.success("Enquiry updated successfully");
//         setShowEditDialog(false);
//         handleRefresh();
//       }
//     } catch (error: any) {
//       console.error('Error updating enquiry:', error);
//       toast.error(error.message || "Failed to update enquiry");
//     } finally {
//       setEditLoading(false);
//     }
//   };

//  // Replace the existing handleDeleteEnquiry function
// const handleDeleteEnquiry = (enquiry: PartnershipEnquiry) => {
//   setEnquiryToDelete(enquiry);
//   setShowDeleteDialog(true);
// };

// // Add this new function for actual deletion
// const confirmDeleteEnquiry = async () => {
//   if (!enquiryToDelete) return;
  
//   setIsDeleting(true);
//   try {
//     const response = await deletePartnershipEnquiry(enquiryToDelete.id);
//     if (response.success) {
//       toast.success("Enquiry deleted successfully");
//       setShowDeleteDialog(false);
//       setEnquiryToDelete(null);
//       handleRefresh();
      
//       // Close view dialog if it's open for this enquiry
//       if (selectedEnquiry?.id === enquiryToDelete.id) {
//         setShowViewDialog(false);
//         setSelectedEnquiry(null);
//       }
//     } else {
//       toast.error(response.message || "Failed to delete enquiry");
//     }
//   } catch (error: any) {
//     console.error('Error deleting enquiry:', error);
//     toast.error(error.message || "Failed to delete enquiry");
//   } finally {
//     setIsDeleting(false);
//   }
// };

//   // Handle status update from dropdown
//   const handleUpdateStatus = async (id: number, status: string) => {
//     try {
//       const response = await updatePartnershipEnquiry(id, { status });
//       if (response.success) {
//         toast.success(`Status updated to ${status}`);
//         handleRefresh();
        
//         // Update selected enquiry if it's the same
//         if (selectedEnquiry?.id === id) {
//           setSelectedEnquiry({ ...selectedEnquiry, status });
//         }
//       } else {
//         toast.error(response.message || "Failed to update status");
//       }
//     } catch (error: any) {
//       console.error('Error updating status:', error);
//       toast.error(error.message || "Failed to update status");
//     }
//   };

//   // Add followup from view dialog
//   const handleAddFollowup = async () => {
//     if (!followupText.trim()) {
//       toast.error("Please enter a followup note");
//       return;
//     }

//     if (!selectedEnquiry) return;

//     setIsAddingFollowup(true);
//     try {
//       const response = await addPartnershipFollowup(selectedEnquiry.id, { 
//         note: followupText,
//         created_by: "Admin"
//       });
//       if (response.success) {
//         toast.success("Followup added successfully");
//         setFollowupText("");
        
//         // Refresh the enquiry data
//         const updatedResponse = await getPartnershipEnquiries(filters);
//         if (updatedResponse.success) {
//           const updatedEnquiry = updatedResponse.results.find(e => e.id === selectedEnquiry.id);
//           if (updatedEnquiry) {
//             setSelectedEnquiry(updatedEnquiry);
//           }
//           setEnquiries(updatedResponse.results);
//         }
//       } else {
//         toast.error(response.message || "Failed to add followup");
//       }
//     } catch (error: any) {
//       console.error('Error adding followup:', error);
//       toast.error(error.message || "Failed to add followup");
//     } finally {
//       setIsAddingFollowup(false);
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectedEnquiries.size === filteredEnquiries.length) {
//       setSelectedEnquiries(new Set());
//     } else {
//       setSelectedEnquiries(new Set(filteredEnquiries.map(e => e.id)));
//     }
//   };

//   const handleSelectEnquiry = (id: number) => {
//     const newSelected = new Set(selectedEnquiries);
//     if (newSelected.has(id)) {
//       newSelected.delete(id);
//     } else {
//       newSelected.add(id);
//     }
//     setSelectedEnquiries(newSelected);
//   };

//   const handleBulkDelete = async () => {
//     if (selectedEnquiries.size === 0) return;
    
//     try {
//       setBulkActionLoading(true);
//       await bulkDeletePartnershipEnquiries(Array.from(selectedEnquiries));
//       toast.success(`Successfully deleted ${selectedEnquiries.size} enquiries`);
//       setSelectedEnquiries(new Set());
//       setShowBulkDeleteDialog(false);
//       handleRefresh();
//     } catch (error: any) {
//       console.error('Error deleting enquiries:', error);
//       toast.error(error.message || "Failed to delete enquiries");
//     } finally {
//       setBulkActionLoading(false);
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     const colors: Record<string, string> = {
//       new: "bg-red-100 text-red-800 border-red-200",
//       contacted: "bg-blue-100 text-blue-800 border-blue-200",
//       in_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
//       approved: "bg-green-100 text-green-800 border-green-200",
//       rejected: "bg-gray-100 text-gray-800 border-gray-200"
//     };

//     const badgeText = status === 'in_review' ? 'In Review' : 
//                      status.charAt(0).toUpperCase() + status.slice(1);

//     return (
//       <Badge className={`${colors[status] || "bg-gray-100"} capitalize text-xs px-2 py-0.5`}>
//         {badgeText}
//       </Badge>
//     );
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'new': return <Clock className="h-4 w-4 text-red-500" />;
//       case 'contacted': return <MessageSquare className="h-4 w-4 text-blue-500" />;
//       case 'in_review': return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
//       case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
//       case 'rejected': return <XCircle className="h-4 w-4 text-gray-500" />;
//       default: return <Clock className="h-4 w-4" />;
//     }
//   };

//   const handleSort = (field: keyof PartnershipEnquiry) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortDirection('desc');
//     }
//   };

//   const sortedEnquiries = [...enquiries].sort((a, b) => {
//     const aValue = a[sortField];
//     const bValue = b[sortField];
    
//     if (aValue === null || aValue === undefined) return 1;
//     if (bValue === null || bValue === undefined) return -1;
    
//     if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
//     if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
//     return 0;
//   });

//   const filteredEnquiries = sortedEnquiries.filter(enquiry => {
//     const matchesStatus = filters.status === 'all' || enquiry.status === filters.status;
//     const matchesSearch = !filters.search || 
//       enquiry.company_name.toLowerCase().includes(filters.search.toLowerCase()) ||
//       enquiry.contact_person.toLowerCase().includes(filters.search.toLowerCase()) ||
//       enquiry.email.toLowerCase().includes(filters.search.toLowerCase()) ||
//       enquiry.phone.includes(filters.search);
    
//     return matchesStatus && matchesSearch;
//   });

//   const formatDate = (dateString: string) => {
//     if (!dateString) return "-";
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   if (loading && enquiries.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mt-2">
  
//   <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
//     <CardContent className="p-2 md:p-3">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-[10px] md:text-xs text-slate-600">Total</p>
//           <p className="text-lg md:text-xl font-bold">{stats?.total || 0}</p>
//         </div>
//         <Building2 className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
//       </div>
//     </CardContent>
//   </Card>

//   <Card className="bg-gradient-to-br from-red-50 to-red-100">
//     <CardContent className="p-2 md:p-3">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-[10px] md:text-xs text-red-600">New</p>
//           <p className="text-lg md:text-xl font-bold text-red-700">{stats?.new_count || 0}</p>
//         </div>
//         <Clock className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
//       </div>
//     </CardContent>
//   </Card>

//   <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
//     <CardContent className="p-2 md:p-3">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-[10px] md:text-xs text-blue-600">Contacted</p>
//           <p className="text-lg md:text-xl font-bold text-blue-700">{stats?.contacted_count || 0}</p>
//         </div>
//         <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
//       </div>
//     </CardContent>
//   </Card>

//   <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
//     <CardContent className="p-2 md:p-3">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-[10px] md:text-xs text-yellow-600">In Review</p>
//           <p className="text-lg md:text-xl font-bold text-yellow-700">{stats?.in_review_count || 0}</p>
//         </div>
//         <Loader2 className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
//       </div>
//     </CardContent>
//   </Card>

//   <Card className="bg-gradient-to-br from-green-50 to-green-100">
//     <CardContent className="p-2 md:p-3">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-[10px] md:text-xs text-green-600">Approved</p>
//           <p className="text-lg md:text-xl font-bold text-green-700">{stats?.approved_count || 0}</p>
//         </div>
//         <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
//       </div>
//     </CardContent>
//   </Card>

// </div>

//       {/* Filters and Add Button */}
//       <div className="flex flex-wrap gap-3 items-center justify-between">
//         <div className="flex gap-2 flex-1 max-w-md">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <Input
//               placeholder="Search by company, contact, email, phone..."
//               value={filters.search}
//               onChange={(e) => handleFilterChange('search', e.target.value)}
//               className="pl-9"
//             />
//           </div>
//           <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
//             <SelectTrigger className="w-[140px]">
//               <Filter className="h-4 w-4 mr-2" />
//               <SelectValue placeholder="Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="new">New</SelectItem>
//               <SelectItem value="contacted">Contacted</SelectItem>
//               <SelectItem value="in_review">In Review</SelectItem>
//               <SelectItem value="approved">Approved</SelectItem>
//               <SelectItem value="rejected">Rejected</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
        
//         <div className="flex gap-2">
          
//           <Button onClick={handleRefresh} variant="outline" size="sm">
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {/* Bulk Actions Bar */}
//       {selectedEnquiries.size > 0 && (
//         <div className="bg-white rounded-lg shadow-lg border border-blue-200 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
//           <div className="flex items-center gap-3">
//             <Badge variant="secondary" className="bg-blue-100 text-blue-700">
//               {selectedEnquiries.size} {selectedEnquiries.size === 1 ? 'enquiry' : 'enquiries'} selected
//             </Badge>
//             <Button 
//               variant="ghost" 
//               size="sm" 
//               onClick={() => setSelectedEnquiries(new Set())}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <X className="h-4 w-4 mr-1" />
//               Clear
//             </Button>
//           </div>
//           <Button 
//             variant="destructive" 
//             size="sm"
//             onClick={() => setShowBulkDeleteDialog(true)}
//             className="bg-red-600 hover:bg-red-700"
//           >
//             <Trash2 className="h-4 w-4 mr-1" />
//             Delete Selected
//           </Button>
//         </div>
//       )}

//       {/* Table */}
//       <Card className=" border-0">
//         <CardContent className="p-0">
//           {filteredEnquiries.length === 0 ? (
//             <div className="text-center py-16">
//               <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No partnership enquiries found</h3>
//               <p className="text-gray-500">Click "Add Enquiry" to create a new partnership enquiry.</p>
//             </div>
//           ) : (
//             <div className="max-h-[calc(100vh-430px)] md:max-h-[calc(100vh-310px)] overflow-y-auto">
//               <Table>
//                 <TableHeader className="bg-gray-50">
//                   <TableRow>
//                     <TableHead className="w-[40px]">
//                       <Checkbox 
//                         checked={selectedEnquiries.size === filteredEnquiries.length && filteredEnquiries.length > 0}
//                         onCheckedChange={handleSelectAll}
//                       />
//                     </TableHead>
//                     <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
//                       <div className="flex items-center gap-1">
//                         ID <ArrowUpDown className="h-3 w-3" />
//                       </div>
//                     </TableHead>
//                     <TableHead className="cursor-pointer" onClick={() => handleSort('company_name')}>
//                       <div className="flex items-center gap-1">
//                         Company <ArrowUpDown className="h-3 w-3" />
//                       </div>
//                     </TableHead>
//                     <TableHead>Contact Person</TableHead>
//                     <TableHead>Contact Info</TableHead>
//                     <TableHead>Property Details</TableHead>
//                     <TableHead>Location</TableHead>
//                     <TableHead>Buildings/Rooms</TableHead>
// <TableHead>City/Locality</TableHead>
//                     <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
//                       <div className="flex items-center gap-1">
//                         Status <ArrowUpDown className="h-3 w-3" />
//                       </div>
//                     </TableHead>
//                     <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
//                       <div className="flex items-center gap-1">
//                         Date <ArrowUpDown className="h-3 w-3" />
//                       </div>
//                     </TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredEnquiries.map((enquiry) => (
//                     <TableRow key={enquiry.id} className="hover:bg-gray-50">
//                       <TableCell>
//                         <Checkbox 
//                           checked={selectedEnquiries.has(enquiry.id)}
//                           onCheckedChange={() => handleSelectEnquiry(enquiry.id)}
//                         />
//                       </TableCell>
//                       <TableCell className="font-mono text-sm">#{enquiry.id}</TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <Building2 className="h-4 w-4 text-gray-400" />
//                           <span className="font-medium">{enquiry.company_name}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <User className="h-4 w-4 text-gray-400" />
//                           <span>{enquiry.contact_person}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="space-y-1">
//                           <div className="flex items-center gap-1 text-sm">
//                             <Mail className="h-3 w-3 text-gray-400" />
//                             <span className="text-xs">{enquiry.email}</span>
//                           </div>
//                           <div className="flex items-center gap-1 text-sm">
//                             <Phone className="h-3 w-3 text-gray-400" />
//                             <span className="text-xs">{enquiry.phone}</span>
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="text-sm">
//                           <div className="capitalize">{enquiry.property_type || 'Not specified'}</div>
//                           <div className="text-xs text-gray-500">
//                             {enquiry.property_count} {enquiry.property_count === 1 ? 'property' : 'properties'}
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-sm">{enquiry.location || 'Not specified'}</TableCell>
//                       <TableCell className="text-sm">
//   <div>{enquiry.no_of_buildings ?? '-'} Buildings</div>
//   <div className="text-xs text-gray-500">{enquiry.no_of_rooms ?? '-'} Rooms</div>
// </TableCell>
// <TableCell className="text-sm">
//   <div>{enquiry.city || '-'}</div>
//   <div className="text-xs text-gray-500">{enquiry.locality || '-'}</div>
// </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-1">
//                           {getStatusIcon(enquiry.status)}
//                           {getStatusBadge(enquiry.status)}
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-sm">
//                         <div>{formatDate(enquiry.created_at)}</div>
//                         <div className="text-xs text-gray-500">
//                           {new Date(enquiry.created_at).toLocaleTimeString()}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-1">
//                           {/* View Button */}
//                               {can('view_partnership_enquiries') && (

//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             onClick={() => handleViewEnquiry(enquiry)}
//                             className="h-7 w-7 p-0"
//                             title="View Details"
//                           >
//                             <Eye className="h-3.5 w-3.5" />
//                           </Button>
//                               )}

//                           {/* Edit Button */}
//                               {can('edit_partnership_enquiries') && (

//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             onClick={() => handleEditEnquiry(enquiry)}
//                             className="h-7 w-7 p-0"
//                             title="Edit Enquiry"
//                           >
//                             <Edit className="h-3.5 w-3.5" />
//                           </Button>
//                               )}

//                           {/* Status Dropdown (like in enquiry system) */}
//                               {can('edit_partnership_enquiries') && (

//                           <Select
//                             value={enquiry.status}
//                             onValueChange={(value) => handleUpdateStatus(enquiry.id, value)}
//                           >
//                             <SelectTrigger className="h-7 w-24 text-[10px]">
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="new" className="text-xs">New</SelectItem>
//                               <SelectItem value="contacted" className="text-xs">Contacted</SelectItem>
//                               <SelectItem value="in_review" className="text-xs">In Review</SelectItem>
//                               <SelectItem value="approved" className="text-xs">Approved</SelectItem>
//                               <SelectItem value="rejected" className="text-xs">Rejected</SelectItem>
//                             </SelectContent>
//                           </Select>
//                               )}

//                           {/* Delete Button */}
     
//                          {/* Delete Button */}
//     {can('delete_partnership_enquiries') && (

// <Button
//   size="sm"
//   variant="ghost"
//   onClick={() => handleDeleteEnquiry(enquiry)}  // Change this line
//   className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
//   title="Delete Enquiry"
// >
//   <Trash2 className="h-3.5 w-3.5" />
// </Button>
//     )}
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* View Details Dialog with Followups */}
//       <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
//         <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] overflow-hidden p-0 rounded-xl border-0 shadow-2xl">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-5 py-4 flex items-start justify-between">
//             <div>
//               <h2 className="text-base font-semibold flex items-center gap-2">
//                 <Building2 className="h-4 w-4" />
//                 Partnership Enquiry Details
//               </h2>
//               <p className="text-xs text-blue-100 mt-0.5">
//                 ID: #{selectedEnquiry?.id} • {selectedEnquiry?.company_name}
//               </p>
//             </div>
//             <div className="flex items-center gap-2">
//               {selectedEnquiry && getStatusBadge(selectedEnquiry.status)}
//               <button
//                 onClick={() => setShowViewDialog(false)}
//                 className="p-1 rounded-md hover:bg-white/15 transition"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="px-5 pt-4">
//             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//               <TabsList className="grid w-full grid-cols-2 h-9">
//                 <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
//                 <TabsTrigger value="followups" className="text-xs">
//                   Followups ({selectedEnquiry?.followup_history?.length || 0})
//                 </TabsTrigger>
//               </TabsList>

//               {/* Details Tab */}
//               <TabsContent value="details" className="mt-4 space-y-4 overflow-y-auto max-h-[55vh]">
//                 {selectedEnquiry && (
//                   <>
//                     {/* Company & Contact Info */}
//                     <div className="grid grid-cols-2 gap-3">
//                       <div className="bg-gray-50 rounded-lg p-3">
//                         <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
//                           <User className="h-3 w-3" /> Contact Person
//                         </p>
//                         <p className="text-sm font-medium text-gray-800">{selectedEnquiry.contact_person}</p>
//                       </div>
//                       <div className="bg-gray-50 rounded-lg p-3">
//                         <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
//                           <Mail className="h-3 w-3" /> Email
//                         </p>
//                         <p className="text-sm text-gray-700 truncate">{selectedEnquiry.email}</p>
//                       </div>
//                       <div className="bg-gray-50 rounded-lg p-3">
//                         <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
//                           <Phone className="h-3 w-3" /> Phone
//                         </p>
//                         <p className="text-sm text-gray-700">{selectedEnquiry.phone}</p>
//                       </div>
//                       <div className="bg-gray-50 rounded-lg p-3">
//                         <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
//                           <Calendar className="h-3 w-3" /> Created
//                         </p>
//                         <p className="text-sm text-gray-700">{formatDate(selectedEnquiry.created_at)}</p>
//                       </div>
//                     </div>

//                     {/* Property Details */}
//                     <div className="bg-gray-50 rounded-lg p-3">
//                       <p className="text-[10px] text-gray-500 uppercase mb-2">Property Details</p>
//                       <div className="grid grid-cols-2 gap-3">
//                         <div>
//                           <p className="text-[10px] text-gray-400">Type</p>
//                           <p className="text-sm text-gray-800 capitalize">{selectedEnquiry.property_type || 'Not specified'}</p>
//                         </div>
//                         <div>
//                           <p className="text-[10px] text-gray-400">Count</p>
//                           <p className="text-sm text-gray-800">{selectedEnquiry.property_count || 1} properties</p>
//                         </div>
//                         <div className="col-span-2">
//                           <p className="text-[10px] text-gray-400 flex items-center gap-1">
//                             <MapPin className="h-3 w-3" /> Location
//                           </p>
//                           <p className="text-sm text-gray-800">{selectedEnquiry.location || 'Not specified'}</p>
//                         </div>
//                         <div>
//   <p className="text-[10px] text-gray-400">Buildings</p>
//   <p className="text-sm text-gray-800">{selectedEnquiry.no_of_buildings ?? 'Not specified'}</p>
// </div>
// <div>
//   <p className="text-[10px] text-gray-400">Rooms</p>
//   <p className="text-sm text-gray-800">{selectedEnquiry.no_of_rooms ?? 'Not specified'}</p>
// </div>
// <div>
//   <p className="text-[10px] text-gray-400">City</p>
//   <p className="text-sm text-gray-800">{selectedEnquiry.city || 'Not specified'}</p>
// </div>
// <div>
//   <p className="text-[10px] text-gray-400">Locality</p>
//   <p className="text-sm text-gray-800">{selectedEnquiry.locality || 'Not specified'}</p>
// </div>
//                       </div>
//                     </div>

//                     {/* Message */}
//                     {selectedEnquiry.message && (
//                       <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
//                         <p className="text-[10px] text-blue-600 uppercase font-semibold flex items-center gap-1">
//                           <MessageSquare className="h-3 w-3" /> Message
//                         </p>
//                         <p className="text-sm text-gray-700 mt-1 leading-relaxed">{selectedEnquiry.message}</p>
//                       </div>
//                     )}

//                     {/* Remark */}
//                     {selectedEnquiry.remark && (
//                       <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
//                         <p className="text-[10px] text-yellow-700 uppercase font-semibold flex items-center gap-1">
//                           <StickyNote className="h-3 w-3" /> Internal Remark
//                         </p>
//                         <p className="text-sm text-gray-700 mt-1">{selectedEnquiry.remark}</p>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </TabsContent>

//               {/* Followups Tab */}
//               <TabsContent value="followups" className="mt-4 space-y-3 overflow-y-auto max-h-[55vh]">
//                 {/* Followup List */}
//                 <div className="space-y-2 max-h-64 overflow-y-auto">
//                   {selectedEnquiry?.followup_history && selectedEnquiry.followup_history.length > 0 ? (
//                     selectedEnquiry.followup_history.map((followup, index) => (
//                       <div key={followup.id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
//                         <p className="text-xs text-gray-700 leading-relaxed">{followup.note}</p>
//                         <div className="flex justify-between items-center mt-2">
//                           <span className="text-[10px] text-gray-500">{followup.created_by}</span>
//                           <span className="text-[10px] text-gray-400">
//                             {formatDate(followup.timestamp)}
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p className="text-xs text-gray-400 text-center py-6">No followups yet</p>
//                   )}
//                 </div>

//                 {/* Add Followup Form */}
//                 <div className="border-t pt-3 mt-2">
//                   <textarea
//                     placeholder="Add a followup note..."
//                     value={followupText}
//                     onChange={e => setFollowupText(e.target.value)}
//                     rows={2}
//                     className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
//                   />
//                   <Button
//                     onClick={handleAddFollowup}
//                     disabled={!followupText.trim() || isAddingFollowup}
//                     className="w-full mt-2 h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
//                   >
//                     {isAddingFollowup ? "Adding..." : "Add Followup"}
//                   </Button>
//                 </div>
//               </TabsContent>
//             </Tabs>
//           </div>

//           {/* Footer Actions */}
//           <div className="px-5 py-3 bg-gray-50 border-t flex items-center justify-between">
//             <div className="flex items-center gap-2">
//              {/* In the view dialog footer */}
// <Button
//   variant="ghost"
//   size="sm"
//   onClick={() => selectedEnquiry && handleDeleteEnquiry(selectedEnquiry)}  // Change this line
//   className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
// >
//   <Trash2 className="h-3.5 w-3.5 mr-1" />
//   Delete
// </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   if (selectedEnquiry) {
//                     setShowViewDialog(false);
//                     handleEditEnquiry(selectedEnquiry);
//                   }
//                 }}
//                 className="text-blue-600 hover:text-blue-700 h-8 text-xs"
//               >
//                 <Edit className="h-3.5 w-3.5 mr-1" />
//                 Edit
//               </Button>
//             </div>
//             <Button
//               onClick={() => setShowViewDialog(false)}
//               size="sm"
//               className="h-8 text-xs bg-gray-600 hover:bg-gray-700"
//             >
//               Close
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Add New Partnership Enquiry Dialog */}
//       <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
//         <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
//           <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white px-4 py-3 md:px-6 md:py-4 flex items-center justify-between rounded-t-lg">
//             <div>
//               <h2 className="text-base md:text-lg font-semibold">Add New Partnership Enquiry</h2>
//               <p className="text-xs md:text-sm text-violet-100">Fill in the details below to add a new partnership enquiry</p>
//             </div>
//             <DialogClose asChild>
//               <button className="p-1.5 md:p-2 rounded-full hover:bg-white/20 transition">
//                 <X className="h-4 w-4 md:h-5 md:w-5" />
//               </button>
//             </DialogClose>
//           </div>
          
//           <div className="p-4 md:p-6 overflow-y-auto max-h-[75vh]">
//             <PartnershipForm
//               formData={addFormData}
//               setFormData={setAddFormData}
//               onSubmit={handleAddEnquiry}
//               isSubmitting={addLoading}
//               submitLabel="Add Partnership Enquiry"
//             />
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Single Delete Confirmation Dialog */}
// <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//   <DialogContent className="max-w-md">
//     <DialogHeader>
//       <DialogTitle className="flex items-center gap-2 text-red-600">
//         <AlertCircle className="h-5 w-5" />
//         Confirm Delete
//       </DialogTitle>
//       <DialogDescription>
//         Are you sure you want to delete this partnership enquiry?
//         <div className="mt-2 p-3 bg-gray-50 rounded-md">
//           <p className="text-sm font-medium text-gray-900">{enquiryToDelete?.company_name}</p>
//           <p className="text-xs text-gray-500 mt-1">
//             Contact: {enquiryToDelete?.contact_person} • {enquiryToDelete?.email}
//           </p>
//         </div>
//         <p className="mt-2 text-sm text-red-600">This action cannot be undone.</p>
//       </DialogDescription>
//     </DialogHeader>
    
//     <DialogFooter>
//       <Button
//         variant="outline"
//         onClick={() => {
//           setShowDeleteDialog(false);
//           setEnquiryToDelete(null);
//         }}
//         disabled={isDeleting}
//       >
//         Cancel
//       </Button>
//       <Button
//         variant="destructive"
//         onClick={confirmDeleteEnquiry}
//         disabled={isDeleting}
//         className="bg-red-600 hover:bg-red-700"
//       >
//         {isDeleting ? (
//           <>
//             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//             Deleting...
//           </>
//         ) : (
//           <>
//             <Trash2 className="h-4 w-4 mr-2" />
//             Delete Enquiry
//           </>
//         )}
//       </Button>
//     </DialogFooter>
//   </DialogContent>
// </Dialog>

//       {/* Edit Partnership Enquiry Dialog */}
//       <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
//         <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-2xl">
//           <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white px-4 py-3 md:px-6 md:py-4 flex items-center justify-between rounded-t-lg">
//             <div>
//               <h2 className="text-base md:text-lg font-semibold">Edit Partnership Enquiry</h2>
//               <p className="text-xs md:text-sm text-violet-100">Update the details below</p>
//             </div>
//             <DialogClose asChild>
//               <button className="p-1.5 md:p-2 rounded-full hover:bg-white/20 transition">
//                 <X className="h-4 w-4 md:h-5 md:w-5" />
//               </button>
//             </DialogClose>
//           </div>
          
//           <div className="p-4 md:p-6 overflow-y-auto max-h-[75vh]">
//             <PartnershipForm
//               formData={editFormData}
//               setFormData={setEditFormData}
//               onSubmit={handleUpdateEnquiry}
//               isSubmitting={editLoading}
//               submitLabel="Update Enquiry"
//               isEdit={true}
//             />
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Bulk Delete Confirmation Dialog */}
//       <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-red-600">
//               <AlertCircle className="h-5 w-5" />
//               Confirm Bulk Delete
//             </DialogTitle>
//             <DialogDescription>
//               Are you sure you want to delete {selectedEnquiries.size} {selectedEnquiries.size === 1 ? 'enquiry' : 'enquiries'}? 
//               This action cannot be undone.
//             </DialogDescription>
//           </DialogHeader>
          
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setShowBulkDeleteDialog(false)}
//               disabled={bulkActionLoading}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={handleBulkDelete}
//               disabled={bulkActionLoading}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               {bulkActionLoading ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 <>
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Delete {selectedEnquiries.size} {selectedEnquiries.size === 1 ? 'Enquiry' : 'Enquiries'}
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


// components/admin/partnership/PartnershipEnquiriesClientPage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Loader2, 
  RefreshCw, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  X,
  Search,
  Filter,
  AlertCircle,
  Edit,
  Plus,
  Calendar,
  MapPin,
  StickyNote,
  Trash2
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
  PartnershipFollowup,
  getPartnershipEnquiries,
  updatePartnershipEnquiry,
  deletePartnershipEnquiry,
  bulkDeletePartnershipEnquiries,
  createPartnershipEnquiry,
  addPartnershipFollowup,
  updatePartnershipStatus
} from "@/lib/partnershipApi";
import PartnershipForm from './PartnershipForm';
import { useAuth } from '@/context/authContext';

interface PartnershipEnquiriesClientPageProps {
  initialEnquiries: PartnershipEnquiry[];
  initialStats: PartnershipStats | null;
  onFiltersChange: (filters: { status: string; search: string }) => void;
  onRegisterBulkDelete?: (fn: () => void) => void;
  onRegisterSelectedCount?: (count: number) => void;
}

export default function PartnershipEnquiriesClientPage({ 
  initialEnquiries, 
  initialStats,
  onFiltersChange,
  onRegisterBulkDelete,
  onRegisterSelectedCount,
}: PartnershipEnquiriesClientPageProps) {
  const [enquiries, setEnquiries] = useState<PartnershipEnquiry[]>(initialEnquiries);
  const [stats, setStats] = useState<PartnershipStats | null>(initialStats);
  const [loading, setLoading] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<PartnershipEnquiry | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<PartnershipEnquiry>>({});
  const [addFormData, setAddFormData] = useState<Partial<PartnershipEnquiry>>({
    status: 'new'
  });
  const [selectedEnquiries, setSelectedEnquiries] = useState<Set<number>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [sortField, setSortField] = useState<keyof PartnershipEnquiry>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [followupText, setFollowupText] = useState("");
  const [isAddingFollowup, setIsAddingFollowup] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  // Add these with other state declarations (around line 30-40)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<PartnershipEnquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state (added to match Enquiries table)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "All">(10);

  // Column search states (added to match Enquiries table)
  const [columnFilters, setColumnFilters] = useState({
    name: "",
    phone: "",
    email: "",
    property: "",
    location: "",
    city: "",
    status: "",
    created: "",
  });

  // Update local state when props change
  const { can } = useAuth(); // ← YAHAN ADD KARO

  useEffect(() => {
    setEnquiries(initialEnquiries);
  }, [initialEnquiries]);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  // Reset followup text when dialog closes
  useEffect(() => {
    if (!showViewDialog) {
      setFollowupText("");
      setActiveTab("details");
    }
  }, [showViewDialog]);

  useEffect(() => { setCurrentPage(1); }, [columnFilters, filters]);

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

  const handleAddEnquiry = async () => {
    if (!addFormData.company_name || !addFormData.contact_person || !addFormData.email || !addFormData.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setAddLoading(true);
      const response = await createPartnershipEnquiry(addFormData);
      if (response.success) {
        toast.success("Partnership enquiry added successfully");
        setShowAddDialog(false);
        setAddFormData({ status: 'new' });
        handleRefresh();
      } else {
        toast.error(response.message || "Failed to add enquiry");
      }
    } catch (error: any) {
      console.error('Error adding enquiry:', error);
      toast.error(error.message || "Failed to add enquiry");
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateEnquiry = async () => {
    if (!selectedEnquiry) return;
    
    try {
      setEditLoading(true);
      const response = await updatePartnershipEnquiry(selectedEnquiry.id, editFormData);
      if (response.success) {
        toast.success("Enquiry updated successfully");
        setShowEditDialog(false);
        handleRefresh();
      }
    } catch (error: any) {
      console.error('Error updating enquiry:', error);
      toast.error(error.message || "Failed to update enquiry");
    } finally {
      setEditLoading(false);
    }
  };

 // Replace the existing handleDeleteEnquiry function
const handleDeleteEnquiry = (enquiry: PartnershipEnquiry) => {
  setEnquiryToDelete(enquiry);
  setShowDeleteDialog(true);
};

// Add this new function for actual deletion
const confirmDeleteEnquiry = async () => {
  if (!enquiryToDelete) return;
  
  setIsDeleting(true);
  try {
    const response = await deletePartnershipEnquiry(enquiryToDelete.id);
    if (response.success) {
      toast.success("Enquiry deleted successfully");
      setShowDeleteDialog(false);
      setEnquiryToDelete(null);
      handleRefresh();
      
      // Close view dialog if it's open for this enquiry
      if (selectedEnquiry?.id === enquiryToDelete.id) {
        setShowViewDialog(false);
        setSelectedEnquiry(null);
      }
    } else {
      toast.error(response.message || "Failed to delete enquiry");
    }
  } catch (error: any) {
    console.error('Error deleting enquiry:', error);
    toast.error(error.message || "Failed to delete enquiry");
  } finally {
    setIsDeleting(false);
  }
};

  // Handle status update from dropdown
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const response = await updatePartnershipEnquiry(id, { status });
      if (response.success) {
        toast.success(`Status updated to ${status}`);
        handleRefresh();
        
        // Update selected enquiry if it's the same
        if (selectedEnquiry?.id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status });
        }
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || "Failed to update status");
    }
  };

  // Add followup from view dialog
  const handleAddFollowup = async () => {
    if (!followupText.trim()) {
      toast.error("Please enter a followup note");
      return;
    }

    if (!selectedEnquiry) return;

    setIsAddingFollowup(true);
    try {
      const response = await addPartnershipFollowup(selectedEnquiry.id, { 
        note: followupText,
        created_by: "Admin"
      });
      if (response.success) {
        toast.success("Followup added successfully");
        setFollowupText("");
        
        // Refresh the enquiry data
        const updatedResponse = await getPartnershipEnquiries(filters);
        if (updatedResponse.success) {
          const updatedEnquiry = updatedResponse.results.find(e => e.id === selectedEnquiry.id);
          if (updatedEnquiry) {
            setSelectedEnquiry(updatedEnquiry);
          }
          setEnquiries(updatedResponse.results);
        }
      } else {
        toast.error(response.message || "Failed to add followup");
      }
    } catch (error: any) {
      console.error('Error adding followup:', error);
      toast.error(error.message || "Failed to add followup");
    } finally {
      setIsAddingFollowup(false);
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

  // Register bulk delete (opens confirm dialog) + selected count with parent page
  useEffect(() => {
    onRegisterBulkDelete?.(() => setShowBulkDeleteDialog(true));
  }, [onRegisterBulkDelete]);

  useEffect(() => {
    onRegisterSelectedCount?.(selectedEnquiries.size);
  }, [selectedEnquiries.size, onRegisterSelectedCount]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-red-100 text-red-800 border-red-200",
      contacted: "bg-blue-100 text-blue-800 border-blue-200",
      in_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-gray-100 text-gray-800 border-gray-200"
    };

    const badgeText = status === 'in_review' ? 'In Review' : 
                     status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <Badge className={`${colors[status] || "bg-gray-100"} capitalize text-[10px] px-1.5 py-0.5`}>
        {badgeText}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-3 w-3 text-red-500" />;
      case 'contacted': return <MessageSquare className="h-3 w-3 text-blue-500" />;
      case 'in_review': return <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />;
      case 'approved': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'rejected': return <XCircle className="h-3 w-3 text-gray-500" />;
      default: return <Clock className="h-3 w-3" />;
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
 const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  const filteredEnquiries = sortedEnquiries.filter(enquiry => {
    const matchesStatus = filters.status === 'all' || enquiry.status === filters.status;
    const matchesSearch = !filters.search || 
      enquiry.company_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      enquiry.contact_person.toLowerCase().includes(filters.search.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      enquiry.phone.includes(filters.search);
    
    // Column filters (per-column search row, like Enquiries table)
    const nameMatch = !columnFilters.name || 
      enquiry.company_name?.toLowerCase().includes(columnFilters.name.toLowerCase()) ||
      enquiry.contact_person?.toLowerCase().includes(columnFilters.name.toLowerCase());
    const phoneMatch = !columnFilters.phone || enquiry.phone?.toLowerCase().includes(columnFilters.phone.toLowerCase());
    const emailMatch = !columnFilters.email || enquiry.email?.toLowerCase().includes(columnFilters.email.toLowerCase());
    const propertyMatch = !columnFilters.property || (enquiry.property_type || "").toLowerCase().includes(columnFilters.property.toLowerCase());
    const locationMatch = !columnFilters.location || (enquiry.location || "").toLowerCase().includes(columnFilters.location.toLowerCase());
    const cityMatch = !columnFilters.city || 
      (enquiry.city || "").toLowerCase().includes(columnFilters.city.toLowerCase()) ||
      (enquiry.locality || "").toLowerCase().includes(columnFilters.city.toLowerCase());
    const statusColMatch = !columnFilters.status || (enquiry.status || "").toLowerCase().includes(columnFilters.status.toLowerCase());
    const createdMatch = !columnFilters.created || formatDate(enquiry.created_at).toLowerCase().includes(columnFilters.created.toLowerCase());

    return matchesStatus && matchesSearch && nameMatch && phoneMatch && emailMatch && propertyMatch && locationMatch && cityMatch && statusColMatch && createdMatch;
  });

  const paginatedEnquiries = (() => {
    if (itemsPerPage === "All") return filteredEnquiries;
    const start = (currentPage - 1) * (itemsPerPage as number);
    return filteredEnquiries.slice(start, start + (itemsPerPage as number));
  })();

  const totalPages = itemsPerPage === "All" ? 1 : Math.ceil(filteredEnquiries.length / (itemsPerPage as number));

 

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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mt-2">
  
  <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
    <CardContent className="p-2 md:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] md:text-xs text-slate-600">Total</p>
          <p className="text-lg md:text-xl font-bold">{stats?.total || 0}</p>
        </div>
        <Building2 className="h-5 w-5 md:h-6 md:w-6 text-slate-500" />
      </div>
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-red-50 to-red-100">
    <CardContent className="p-2 md:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] md:text-xs text-red-600">New</p>
          <p className="text-lg md:text-xl font-bold text-red-700">{stats?.new_count || 0}</p>
        </div>
        <Clock className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
      </div>
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
    <CardContent className="p-2 md:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] md:text-xs text-blue-600">Contacted</p>
          <p className="text-lg md:text-xl font-bold text-blue-700">{stats?.contacted_count || 0}</p>
        </div>
        <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
      </div>
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
    <CardContent className="p-2 md:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] md:text-xs text-yellow-600">In Review</p>
          <p className="text-lg md:text-xl font-bold text-yellow-700">{stats?.in_review_count || 0}</p>
        </div>
        <Loader2 className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
      </div>
    </CardContent>
  </Card>

  <Card className="bg-gradient-to-br from-green-50 to-green-100">
    <CardContent className="p-2 md:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] md:text-xs text-green-600">Approved</p>
          <p className="text-lg md:text-xl font-bold text-green-700">{stats?.approved_count || 0}</p>
        </div>
        <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
      </div>
    </CardContent>
  </Card>

</div>

     

      {/* Compact Table - matches Enquiries table structure */}
      <Card className="border rounded-lg shadow-sm">
        <CardContent className="p-0 flex flex-col rounded-lg">
          <div className="flex flex-col h-[270px] sm:h-[440px]">
            <div className="overflow-auto flex-1 min-h-0 rounded-lg">
              <table
                className="border-collapse text-[11px] font-sans"
                style={{ tableLayout: "fixed", minWidth: "1000px", width: "100%" }}
              >
                <colgroup>
                  <col style={{ width: "32px" }} />   {/* Checkbox */}
                  <col style={{ width: "140px" }} />  {/* Actions */}
                  <col style={{ width: "180px" }} />  {/* Name (Company + Contact) */}
                  <col style={{ width: "80px" }} />  {/* Phone */}
                  <col style={{ width: "150px" }} />  {/* Email */}
                  <col style={{ width: "80px" }} />  {/* Property */}
                  <col style={{ width: "100px" }} />  {/* Location */}
                  <col style={{ width: "86px" }} />  {/* Buildings/Rooms */}
                  <col style={{ width: "90px" }} />  {/* City/Locality */}
                  <col style={{ width: "65px" }} />   {/* Status */}
                  <col style={{ width: "70px" }} />  {/* Created */}
                </colgroup>

                <thead className="sticky top-0 z-10">
                  {/* Title Row */}
                  <tr className="bg-gray-200 border-b border-gray-300">
                    <th className="px-1.5 py-1.5 text-center border-r border-gray-300 bg-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedEnquiries.size === filteredEnquiries.length && filteredEnquiries.length > 0}
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    {[
                      "Actions", "Name", "Phone", "Email", "Property", "Location", "Buildings/Rooms", "City/Locality", "Status", "Created"
                    ].map((h, i) => (
                      <th
                        key={h}
                        className={`px-1.5 py-1.5 text-left border-r border-gray-300 bg-gray-200 ${i === 9 ? "border-r-0" : ""}`}
                      >
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
                      { key: "location", placeholder: "Search..." },
                      { key: "buildings", placeholder: "" },
                      { key: "city", placeholder: "Search..." },
                      { key: "status", placeholder: "Search..." },
                      { key: "created", placeholder: "Search..." },
                    ].map((field, i) => (
                      <td key={field.key} className={`p-1 border-r border-gray-200 ${i === 8 ? "border-r-0" : ""}`}>
                        {field.key !== "buildings" && (
                          <input
                            value={(columnFilters as any)[field.key] || ""}
                            onChange={(e) => setColumnFilters(prev => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr><td colSpan={11} className="py-16 text-center text-slate-500 text-xs">Loading...</td></tr>
                  ) : paginatedEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-500 text-xs">
                        No partnership enquiries found
                      </td>
                    </tr>
                  ) : (
                    paginatedEnquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td className="px-1.5 py-1.5 text-center border-r border-slate-100">
                          <input
                            type="checkbox"
                            checked={selectedEnquiries.has(enquiry.id)}
                            onChange={() => handleSelectEnquiry(enquiry.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-3.5 h-3.5 cursor-pointer"
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-1.5 py-1.5 border-r border-slate-100">
                          <div className="flex items-center gap-0.5 flex-nowrap">
                            {can('view_partnership_enquiries') && (
                              <button
                                onClick={() => handleViewEnquiry(enquiry)}
                                title="View Details"
                                className="w-6 h-6 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            )}

                            {can('edit_partnership_enquiries') && (
                              <button
                                onClick={() => handleEditEnquiry(enquiry)}
                                title="Edit Enquiry"
                                className="w-6 h-6 rounded-lg text-green-600 hover:bg-green-50 flex items-center justify-center"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                            )}

                            {can('edit_partnership_enquiries') && (
                              <Select
                                value={enquiry.status}
                                onValueChange={(value) => handleUpdateStatus(enquiry.id, value)}
                              >
                                <SelectTrigger className="h-6 w-20 text-[9px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new" className="text-[10px]">New</SelectItem>
                                  <SelectItem value="contacted" className="text-[10px]">Contacted</SelectItem>
                                  <SelectItem value="in_review" className="text-[10px]">In Review</SelectItem>
                                  <SelectItem value="approved" className="text-[10px]">Approved</SelectItem>
                                  <SelectItem value="rejected" className="text-[10px]">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            )}

                            {can('delete_partnership_enquiries') && (
                              <button
                                onClick={() => handleDeleteEnquiry(enquiry)}
                                title="Delete Enquiry"
                                className="w-6 h-6 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Name (Company + Contact person) */}
                       <td
  className="px-1.5 py-1.5 text-[11px] border-r border-slate-100 cursor-pointer hover:text-blue-600 truncate"
  onClick={() => handleViewEnquiry(enquiry)}
>
  <div className="flex items-center gap-1 truncate">
    <span className="font-medium text-slate-800 truncate">
      {enquiry.company_name}
    </span>

    <span className="text-slate-300">•</span>

    <span className="text-[10px] text-slate-500 truncate">
      {enquiry.contact_person}
    </span>
  </div>
</td>

                        {/* Phone */}
                        <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100 truncate">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 flex-shrink-0 text-slate-400" />
                            <span className="truncate">{enquiry.phone || "—"}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100 truncate">
                          {enquiry.email ? (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 flex-shrink-0 text-slate-400" />
                              <span className="truncate">{enquiry.email}</span>
                            </div>
                          ) : <span className="text-slate-400">—</span>}
                        </td>

                        {/* Property */}
                        <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100 truncate">
                          <div className="capitalize truncate">{enquiry.property_type || 'Not specified'}</div>
                          <div className="text-[10px] text-slate-400">
                            {enquiry.property_count} {enquiry.property_count === 1 ? 'property' : 'properties'}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100 truncate">
                          {enquiry.location || 'Not specified'}
                        </td>

                        {/* Buildings/Rooms */}
                        <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100">
                          <div>{enquiry.no_of_buildings ?? '-'} Bldgs</div>
                          <div className="text-[10px] text-slate-400">{enquiry.no_of_rooms ?? '-'} Rooms</div>
                        </td>

                        {/* City/Locality */}
                        <td className="px-1.5 py-1.5 text-[11px] text-slate-600 border-r border-slate-100 truncate">
                          <div className="truncate">{enquiry.city || '-'}</div>
                          <div className="text-[10px] text-slate-400 truncate">{enquiry.locality || '-'}</div>
                        </td>

                        {/* Status */}
                        <td className="px-1.5 py-1.5 border-r border-slate-100">
                          <div className="flex items-center gap-1">
                            {/* {getStatusIcon(enquiry.status)} */}
                            {getStatusBadge(enquiry.status)}
                          </div>
                        </td>

                        {/* Created */}
                        <td className="px-1.5 py-1.5 text-[10px] text-slate-500 whitespace-nowrap">
                          <div>{formatDate(enquiry.created_at)}</div>
                          <div className="text-slate-400">
                            {new Date(enquiry.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination footer - matches Enquiries table */}
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
                      else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* View Details Dialog with Followups */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] overflow-hidden p-0 rounded-xl border-0 shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white px-5 py-4 flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Partnership Enquiry Details
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                ID: #{selectedEnquiry?.id} • {selectedEnquiry?.company_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedEnquiry && getStatusBadge(selectedEnquiry.status)}
              <button
                onClick={() => setShowViewDialog(false)}
                className="p-1 rounded-md hover:bg-white/15 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5 pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-9">
                <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                <TabsTrigger value="followups" className="text-xs">
                  Followups ({selectedEnquiry?.followup_history?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="mt-4 space-y-4 overflow-y-auto max-h-[55vh]">
                {selectedEnquiry && (
                  <>
                    {/* Company & Contact Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                          <User className="h-3 w-3" /> Contact Person
                        </p>
                        <p className="text-sm font-medium text-gray-800">{selectedEnquiry.contact_person}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Email
                        </p>
                        <p className="text-sm text-gray-700 truncate">{selectedEnquiry.email}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Phone
                        </p>
                        <p className="text-sm text-gray-700">{selectedEnquiry.phone}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Created
                        </p>
                        <p className="text-sm text-gray-700">{formatDate(selectedEnquiry.created_at)}</p>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] text-gray-500 uppercase mb-2">Property Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-gray-400">Type</p>
                          <p className="text-sm text-gray-800 capitalize">{selectedEnquiry.property_type || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">Count</p>
                          <p className="text-sm text-gray-800">{selectedEnquiry.property_count || 1} properties</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Location
                          </p>
                          <p className="text-sm text-gray-800">{selectedEnquiry.location || 'Not specified'}</p>
                        </div>
                        <div>
  <p className="text-[10px] text-gray-400">Buildings</p>
  <p className="text-sm text-gray-800">{selectedEnquiry.no_of_buildings ?? 'Not specified'}</p>
</div>
<div>
  <p className="text-[10px] text-gray-400">Rooms</p>
  <p className="text-sm text-gray-800">{selectedEnquiry.no_of_rooms ?? 'Not specified'}</p>
</div>
<div>
  <p className="text-[10px] text-gray-400">City</p>
  <p className="text-sm text-gray-800">{selectedEnquiry.city || 'Not specified'}</p>
</div>
<div>
  <p className="text-[10px] text-gray-400">Locality</p>
  <p className="text-sm text-gray-800">{selectedEnquiry.locality || 'Not specified'}</p>
</div>
                      </div>
                    </div>

                    {/* Message */}
                    {selectedEnquiry.message && (
                      <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                        <p className="text-[10px] text-blue-600 uppercase font-semibold flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Message
                        </p>
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">{selectedEnquiry.message}</p>
                      </div>
                    )}

                    {/* Remark */}
                    {selectedEnquiry.remark && (
                      <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
                        <p className="text-[10px] text-yellow-700 uppercase font-semibold flex items-center gap-1">
                          <StickyNote className="h-3 w-3" /> Internal Remark
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{selectedEnquiry.remark}</p>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Followups Tab */}
              <TabsContent value="followups" className="mt-4 space-y-3 overflow-y-auto max-h-[55vh]">
                {/* Followup List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedEnquiry?.followup_history && selectedEnquiry.followup_history.length > 0 ? (
                    selectedEnquiry.followup_history.map((followup, index) => (
                      <div key={followup.id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-700 leading-relaxed">{followup.note}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-gray-500">{followup.created_by}</span>
                          <span className="text-[10px] text-gray-400">
                            {formatDate(followup.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6">No followups yet</p>
                  )}
                </div>

                {/* Add Followup Form */}
                <div className="border-t pt-3 mt-2">
                  <textarea
                    placeholder="Add a followup note..."
                    value={followupText}
                    onChange={e => setFollowupText(e.target.value)}
                    rows={2}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <Button
                    onClick={handleAddFollowup}
                    disabled={!followupText.trim() || isAddingFollowup}
                    className="w-full mt-2 h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {isAddingFollowup ? "Adding..." : "Add Followup"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3 bg-gray-50 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
             {/* In the view dialog footer */}
<Button
  variant="ghost"
  size="sm"
  onClick={() => selectedEnquiry && handleDeleteEnquiry(selectedEnquiry)}  // Change this line
  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
>
  <Trash2 className="h-3.5 w-3.5 mr-1" />
  Delete
</Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (selectedEnquiry) {
                    setShowViewDialog(false);
                    handleEditEnquiry(selectedEnquiry);
                  }
                }}
                className="text-blue-600 hover:text-blue-700 h-8 text-xs"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </div>
            <Button
              onClick={() => setShowViewDialog(false)}
              size="sm"
              className="h-8 text-xs bg-gray-600 hover:bg-gray-700"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Partnership Enquiry Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-700  to-cyan-600 text-white px-4 py-3 md:px-6 md:py-4 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base md:text-lg font-semibold">Add New Partnership Enquiry</h2>
              <p className="text-xs md:text-sm text-violet-100">Fill in the details below to add a new partnership enquiry</p>
            </div>
            <DialogClose asChild>
              <button className="p-1.5 md:p-2 rounded-full hover:bg-white/20 transition">
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </DialogClose>
          </div>
          
          <div className="p-4 md:p-6 overflow-y-auto max-h-[75vh]">
            <PartnershipForm
              formData={addFormData}
              setFormData={setAddFormData}
              onSubmit={handleAddEnquiry}
              isSubmitting={addLoading}
              submitLabel="Add Partnership Enquiry"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Dialog */}
<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" />
        Confirm Delete
      </DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this partnership enquiry?
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-900">{enquiryToDelete?.company_name}</p>
          <p className="text-xs text-gray-500 mt-1">
            Contact: {enquiryToDelete?.contact_person} • {enquiryToDelete?.email}
          </p>
        </div>
        <p className="mt-2 text-sm text-red-600">This action cannot be undone.</p>
      </DialogDescription>
    </DialogHeader>
    
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setShowDeleteDialog(false);
          setEnquiryToDelete(null);
        }}
        disabled={isDeleting}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={confirmDeleteEnquiry}
        disabled={isDeleting}
        className="bg-red-600 hover:bg-red-700"
      >
        {isDeleting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Enquiry
          </>
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Edit Partnership Enquiry Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-2xl">
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white px-4 py-3 md:px-6 md:py-4 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base md:text-lg font-semibold">Edit Partnership Enquiry</h2>
              <p className="text-xs md:text-sm text-violet-100">Update the details below</p>
            </div>
            <DialogClose asChild>
              <button className="p-1.5 md:p-2 rounded-full hover:bg-white/20 transition">
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </DialogClose>
          </div>
          
          <div className="p-4 md:p-6 overflow-y-auto max-h-[75vh]">
            <PartnershipForm
              formData={editFormData}
              setFormData={setEditFormData}
              onSubmit={handleUpdateEnquiry}
              isSubmitting={editLoading}
              submitLabel="Update Enquiry"
              isEdit={true}
            />
          </div>
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
                  <Trash2 className="h-4 w-4 mr-2" />
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