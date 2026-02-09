// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Plus, Eye, Phone, Mail, Calendar, Trash2, Edit, BarChart, Search, Save } from "lucide-react";
// import { toast } from "sonner";
// import {
//   getEnquiries,
//   createEnquiry,
//   updateEnquiry,
//   deleteEnquiry,
//   updateEnquiryStatus,
//   addFollowup,
//   getEnquiryStats,
//   type Enquiry,
//   type CreateEnquiryPayload,
//   type UpdateEnquiryPayload,
//   type Followup
// } from "@/lib/enquiryApi";
// export default function EnquiriesPage() {
//   const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
//   const [properties, setProperties] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
//   const [showAddDialog, setShowAddDialog] = useState(false);
//   const [showViewDialog, setShowViewDialog] = useState(false);
//   const [showEditDialog, setShowEditDialog] = useState(false);
//   const [followupText, setFollowupText] = useState("");
//   const [stats, setStats] = useState<any>(null);
//   const [statusFilter, setStatusFilter] = useState<string>("");
//   const [searchTerm, setSearchTerm] = useState<string>("");

//   // Add new enquiry form state
//   const [newEnquiry, setNewEnquiry] = useState<CreateEnquiryPayload>({
//     property_id: "",
//     tenant_name: "",
//     phone: "",
//     email: "",
//     preferred_move_in_date: "",
//     budget_range: "",
//     message: "",
//     source: "website"
//   });

//   // Edit enquiry form state
//   const [editEnquiryData, setEditEnquiryData] = useState<UpdateEnquiryPayload>({
//     property_id: "",
//     tenant_name: "",
//     phone: "",
//     email: "",
//     preferred_move_in_date: "",
//     budget_range: "",
//     message: "",
//     status: "new"
//   });

//   // Helper function to format date for input field (YYYY-MM-DD)
//   const formatDateForInput = (dateString: string) => {
//     if (!dateString) return "";

//     try {
//       const date = new Date(dateString);
//       // Handle invalid dates
//       if (isNaN(date.getTime())) return "";

//       // Format to YYYY-MM-DD for input[type="date"]
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');

//       return `${year}-${month}-${day}`;
//     } catch (error) {
//       console.error("Error formatting date:", error);
//       return "";
//     }
//   };

//   // Helper function to convert input date to database format
//   const formatDateForDatabase = (dateString: string) => {
//     if (!dateString) return null;

//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return null;

//       // Format to YYYY-MM-DD for MySQL DATE type
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');

//       return `${year}-${month}-${day}`;
//     } catch (error) {
//       console.error("Error converting date for database:", error);
//       return null;
//     }
//   };

//   // Load all data
//   useEffect(() => {
//     loadData();
//     loadProperties();
//   }, [statusFilter, searchTerm]);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const filters: any = {};
//       if (statusFilter && statusFilter !== "all") filters.status = statusFilter;
//       if (searchTerm) filters.search = searchTerm;

//       const [enquiriesRes, statsRes] = await Promise.all([
//         getEnquiries(filters),
//         getEnquiryStats()
//       ]);

//       setEnquiries(enquiriesRes.results);
//       setStats(statsRes.data);
//     } catch (error) {
//       console.error("Error loading data:", error);
//       toast.error("Failed to load data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadProperties = async () => {
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties`);
//       const data = await res.json();
//       setProperties(data.data || []);
//     } catch (error) {
//       console.error("Error loading properties:", error);
//     }
//   };

//   // Add new enquiry handler
//   const handleAddEnquiry = async () => {
//     if (!newEnquiry.tenant_name || !newEnquiry.phone) {
//       toast.error("Name and phone are required");
//       return;
//     }

//     if (!newEnquiry.property_id) {
//       toast.error("Please select a property");
//       return;
//     }

//     try {
//       // Get property name
//       const selectedProperty = properties.find((p) => p.id === newEnquiry.property_id);

//       // Format date for database
//       const formattedDate = formatDateForDatabase(newEnquiry.preferred_move_in_date);

//       const enquiryData: CreateEnquiryPayload = {
//         ...newEnquiry,
//         property_name: selectedProperty?.name || "",
//         preferred_move_in_date: formattedDate || ""
//       };

//       await createEnquiry(enquiryData);
//       toast.success("Enquiry added successfully");

//       setShowAddDialog(false);
//       setNewEnquiry({
//         property_id: "",
//         tenant_name: "",
//         phone: "",
//         email: "",
//         preferred_move_in_date: "",
//         budget_range: "",
//         message: "",
//         source: "website"
//       });

//       await loadData();
//     } catch (error: any) {
//       console.error("Error adding enquiry:", error);
//       toast.error(error.message || "Failed to add enquiry");
//     }
//   };

//   // Open edit dialog with enquiry data
//   const handleOpenEditDialog = (enquiry: Enquiry) => {
//     setSelectedEnquiry(enquiry);
//     setEditEnquiryData({
//       property_id: enquiry.property_id || "",
//       tenant_name: enquiry.tenant_name || "",
//       phone: enquiry.phone || "",
//       email: enquiry.email || "",
//       preferred_move_in_date: formatDateForInput(enquiry.preferred_move_in_date || ""),
//       budget_range: enquiry.budget_range || "",
//       message: enquiry.message || "",
//       status: enquiry.status || "new"
//     });
//     setShowEditDialog(true);
//   };

//   // Update enquiry handler
//   const handleUpdateEnquiry = async () => {
//     if (!selectedEnquiry) return;

//     if (!editEnquiryData.tenant_name || !editEnquiryData.phone) {
//       toast.error("Name and phone are required");
//       return;
//     }

//     try {
//       // Get property name if property changed
//       let propertyName = selectedEnquiry.property_name;
//       if (editEnquiryData.property_id && editEnquiryData.property_id !== selectedEnquiry.property_id) {
//         const selectedProperty = properties.find((p) => p.id === editEnquiryData.property_id);
//         propertyName = selectedProperty?.name || "";
//       }

//       // Format date for database
//       const formattedDate = formatDateForDatabase(editEnquiryData.preferred_move_in_date || "");

//       const updateData: UpdateEnquiryPayload = {
//         ...editEnquiryData,
//         preferred_move_in_date: formattedDate || null,
//         ...(propertyName && { property_name: propertyName })
//       };

//       // Remove empty values to avoid overwriting with empty strings
//       Object.keys(updateData).forEach(key => {
//         if (updateData[key as keyof UpdateEnquiryPayload] === "") {
//           delete updateData[key as keyof UpdateEnquiryPayload];
//         }
//       });

//       await updateEnquiry(selectedEnquiry.id, updateData);
//       toast.success("Enquiry updated successfully");

//       setShowEditDialog(false);
//       await loadData();
//     } catch (error: any) {
//       console.error("Error updating enquiry:", error);
//       toast.error(error.message || "Failed to update enquiry");
//     }
//   };

//   const handleUpdateStatus = async (id: string, status: string) => {
//     try {
//       await updateEnquiryStatus(id, status);
//       toast.success("Status updated");

//       // Update local state
//       setEnquiries(prev => prev.map(enquiry =>
//         enquiry.id === id ? { ...enquiry, status } : enquiry
//       ));

//       if (selectedEnquiry?.id === id) {
//         setSelectedEnquiry({ ...selectedEnquiry, status });
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//       toast.error("Failed to update status");
//     }
//   };

//   const handleAddFollowup = async () => {
//     if (!followupText.trim()) {
//       toast.error("Please enter followup note");
//       return;
//     }

//     if (!selectedEnquiry) {
//       toast.error("No enquiry selected");
//       return;
//     }

//     try {
//       await addFollowup(selectedEnquiry.id, {
//         note: followupText,
//         created_by: "Admin"
//       });

//       toast.success("Followup added");
//       setFollowupText("");

//       // Refresh data
//       await loadData();

//       // Refresh selected enquiry
//       const updatedEnquiries = await getEnquiries();
//       const updatedEnquiry = updatedEnquiries.results.find(e => e.id === selectedEnquiry.id);
//       if (updatedEnquiry) {
//         setSelectedEnquiry(updatedEnquiry);
//       }
//     } catch (error) {
//       console.error("Error adding followup:", error);
//       toast.error("Failed to add followup");
//     }
//   };

//   const handleDeleteEnquiry = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this enquiry?")) return;

//     try {
//       await deleteEnquiry(id);
//       toast.success("Enquiry deleted successfully");

//       setShowViewDialog(false);
//       setShowEditDialog(false);
//       await loadData();
//     } catch (error) {
//       console.error("Error deleting enquiry:", error);
//       toast.error("Failed to delete enquiry");
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     const variants: any = {
//       new: "bg-blue-100 text-blue-800 border-blue-200",
//       contacted: "bg-yellow-100 text-yellow-800 border-yellow-200",
//       interested: "bg-green-100 text-green-800 border-green-200",
//       not_interested: "bg-red-100 text-red-800 border-red-200",
//       converted: "bg-purple-100 text-purple-800 border-purple-200",
//       closed: "bg-gray-100 text-gray-800 border-gray-200"
//     };

//     return (
//       <Badge variant="outline" className={`${variants[status] || "bg-gray-100"} capitalize`}>
//         {status}
//       </Badge>
//     );
//   };

//   const formatDateForDisplay = (dateString: string) => {
//     if (!dateString) return "-";

//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return "-";

//       return date.toLocaleDateString('en-IN', {
//         day: 'numeric',
//         month: 'short',
//         year: 'numeric'
//       });
//     } catch (error) {
//       console.error("Error formatting date for display:", error);
//       return "-";
//     }
//   };

//   if (loading && enquiries.length === 0) return <div className="p-6">Loading...</div>;

//   return (
//     <div className="w-full">
//       <div className="p-6">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//           <div className="w-full sm:w-auto">
//             <h1 className="text-2xl sm:text-3xl font-bold">Enquiry Management</h1>
//             <p className="text-gray-600 mt-1">Track and manage property enquiries</p>
//           </div>

//           <div className="w-full sm:w-auto flex justify-end gap-2">
//             {/* Statistics Button */}
//             <Dialog>
//               <DialogTrigger asChild>
//                 <Button variant="outline" size="sm">
//                   <BarChart className="h-4 w-4 mr-2" />
//                   Stats
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Enquiry Statistics</DialogTitle>
//                 </DialogHeader>
//                 {stats && (
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                       <p className="text-sm text-blue-600">Total Enquiries</p>
//                       <p className="text-2xl font-bold">{stats.total}</p>
//                     </div>
//                     <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
//                       <p className="text-sm text-yellow-600">New</p>
//                       <p className="text-2xl font-bold">{stats.new_count}</p>
//                     </div>
//                     <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//                       <p className="text-sm text-green-600">Interested</p>
//                       <p className="text-2xl font-bold">{stats.interested_count}</p>
//                     </div>
//                     <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
//                       <p className="text-sm text-purple-600">Converted</p>
//                       <p className="text-2xl font-bold">{stats.converted_count}</p>
//                     </div>
//                   </div>
//                 )}
//               </DialogContent>
//             </Dialog>

//             {/* Add Enquiry Button */}
//             <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
//               <DialogTrigger asChild>
//                 <Button className="bg-blue-600 hover:bg-blue-700">
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add Enquiry
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="max-w-2xl">
//                 <DialogHeader>
//                   <DialogTitle>Add New Enquiry</DialogTitle>
//                   <DialogDescription>
//                     Fill in the details below to add a new enquiry
//                   </DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                       <Label>Full Name *</Label>
//                       <Input
//                         value={newEnquiry.tenant_name}
//                         onChange={(e) => setNewEnquiry({ ...newEnquiry, tenant_name: e.target.value })}
//                         placeholder="John Doe"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label>Phone *</Label>
//                       <Input
//                         value={newEnquiry.phone}
//                         onChange={(e) => setNewEnquiry({ ...newEnquiry, phone: e.target.value })}
//                         placeholder="9876543210"
//                         required
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <Label>Email</Label>
//                     <Input
//                       type="email"
//                       value={newEnquiry.email}
//                       onChange={(e) => setNewEnquiry({ ...newEnquiry, email: e.target.value })}
//                       placeholder="john@example.com"
//                     />
//                   </div>
//                   <div>
//                     <Label>Property *</Label>
//                     <Select
//                       value={newEnquiry.property_id}
//                       onValueChange={(value) => setNewEnquiry({ ...newEnquiry, property_id: value })}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select property" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {properties.length > 0 ? (
//                           properties.map((prop) => (
//                             <SelectItem key={prop.id} value={String(prop.id)}>
//                               {prop.name}
//                             </SelectItem>
//                           ))
//                         ) : (
//                           <SelectItem value="no-property" disabled>
//                             No properties available
//                           </SelectItem>
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                       <Label>Move-in Date</Label>
//                       <Input
//                         type="date"
//                         value={newEnquiry.preferred_move_in_date}
//                         onChange={(e) => setNewEnquiry({ ...newEnquiry, preferred_move_in_date: e.target.value })}
//                       />
//                     </div>
//                     <div>
//                       <Label>Budget Range</Label>
//                       <Input
//                         value={newEnquiry.budget_range}
//                         onChange={(e) => setNewEnquiry({ ...newEnquiry, budget_range: e.target.value })}
//                         placeholder="e.g. 8000-12000"
//                       />
//                     </div>
//                   </div>
//                   <div>
//                     <Label>Message</Label>
//                     <Textarea
//                       value={newEnquiry.message}
//                       onChange={(e) => setNewEnquiry({ ...newEnquiry, message: e.target.value })}
//                       placeholder="Any additional details..."
//                       rows={3}
//                     />
//                   </div>
//                   <Button onClick={handleAddEnquiry}>Add Enquiry</Button>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </div>

//         {/* Stats Overview */}
//         {stats && (
//           <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
//             <Card>
//               <CardContent className="p-4">
//                 <p className="text-sm text-gray-500">Total</p>
//                 <p className="text-2xl font-bold">{stats.total}</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-4">
//                 <p className="text-sm text-gray-500">New</p>
//                 <p className="text-2xl font-bold text-blue-600">{stats.new_count}</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-4">
//                 <p className="text-sm text-gray-500">Contacted</p>
//                 <p className="text-2xl font-bold text-yellow-600">{stats.contacted_count}</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-4">
//                 <p className="text-sm text-gray-500">Interested</p>
//                 <p className="text-2xl font-bold text-green-600">{stats.interested_count}</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-4">
//                 <p className="text-sm text-gray-500">Converted</p>
//                 <p className="text-2xl font-bold text-purple-600">{stats.converted_count}</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent className="p-4">
//                 <p className="text-sm text-gray-500">Closed</p>
//                 <p className="text-2xl font-bold text-gray-600">{stats.closed_count}</p>
//               </CardContent>
//             </Card>
//           </div>
//         )}

//         {/* Filters */}
//         <div className="mb-6 flex flex-wrap gap-4">
//           <div className="w-full sm:w-auto flex-1">
//             <Label>Search</Label>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 placeholder="Search by name, phone or email..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//           </div>
//           <div className="w-full sm:w-auto">
//             <Label>Filter by Status</Label>
//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger className="w-full sm:w-[180px]">
//                 <SelectValue placeholder="All Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Status</SelectItem>
//                 <SelectItem value="new">New</SelectItem>
//                 <SelectItem value="contacted">Contacted</SelectItem>
//                 <SelectItem value="interested">Interested</SelectItem>
//                 <SelectItem value="not_interested">Not Interested</SelectItem>
//                 <SelectItem value="converted">Converted</SelectItem>
//                 <SelectItem value="closed">Closed</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Enquiries Table */}
//         <Card>
//           <CardHeader>
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//               <CardTitle>All Enquiries ({enquiries.length})</CardTitle>
//               <div className="text-sm text-gray-500">
//                 Showing {enquiries.length} enquiries
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Name</TableHead>
//                     <TableHead>Contact</TableHead>
//                     <TableHead>Property</TableHead>
//                     <TableHead>Move-in Date</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Created</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {enquiries.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={7} className="text-center py-8 text-gray-500">
//                         No enquiries found
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     enquiries.map((enquiry) => (
//                       <TableRow key={enquiry.id} className="hover:bg-gray-50">
//                         <TableCell className="font-medium">{enquiry.tenant_name}</TableCell>
//                         <TableCell>
//                           <div className="flex flex-col gap-1">
//                             <div className="flex items-center gap-1 text-sm">
//                               <Phone className="h-3 w-3" />
//                               {enquiry.phone}
//                             </div>
//                             {enquiry.email && (
//                               <div className="flex items-center gap-1 text-sm text-gray-600">
//                                 <Mail className="h-3 w-3" />
//                                 {enquiry.email}
//                               </div>
//                             )}
//                           </div>
//                         </TableCell>
//                         <TableCell>{enquiry.property_full_name || enquiry.property_name || "-"}</TableCell>
//                         <TableCell>{formatDateForDisplay(enquiry.preferred_move_in_date)}</TableCell>
//                         <TableCell>{getStatusBadge(enquiry.status || "new")}</TableCell>
//                         <TableCell>{formatDateForDisplay(enquiry.created_at)}</TableCell>
//                         <TableCell>
//                           <div className="flex flex-wrap gap-2">
//                             {/* View Button */}
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => {
//                                 setSelectedEnquiry(enquiry);
//                                 setShowViewDialog(true);
//                               }}
//                               title="View Details"
//                             >
//                               <Eye className="h-4 w-4" />
//                             </Button>

//                             {/* Edit Button */}
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleOpenEditDialog(enquiry)}
//                               title="Edit Enquiry"
//                             >
//                               <Edit className="h-4 w-4" />
//                             </Button>

//                             {/* Status Dropdown */}
//                             <Select
//                               value={enquiry.status || "new"}
//                               onValueChange={(value) => handleUpdateStatus(enquiry.id, value)}
//                             >
//                               <SelectTrigger className="w-32">
//                                 <SelectValue />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 <SelectItem value="new">New</SelectItem>
//                                 <SelectItem value="contacted">Contacted</SelectItem>
//                                 <SelectItem value="interested">Interested</SelectItem>
//                                 <SelectItem value="not_interested">Not Interested</SelectItem>
//                                 <SelectItem value="converted">Converted</SelectItem>
//                                 <SelectItem value="closed">Closed</SelectItem>
//                               </SelectContent>
//                             </Select>

//                             {/* Delete Button */}
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleDeleteEnquiry(enquiry.id)}
//                               className="text-red-600 hover:text-red-700 hover:bg-red-50"
//                               title="Delete Enquiry"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* View Enquiry Dialog */}
//       <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
//         <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Enquiry Details</DialogTitle>
//           </DialogHeader>
//           {selectedEnquiry && (
//             <div className="space-y-4">
//               {/* Contact Info */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg">Contact Information</CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <Label>Name</Label>
//                     <p className="font-medium">{selectedEnquiry.tenant_name}</p>
//                   </div>
//                   <div>
//                     <Label>Phone</Label>
//                     <p className="font-medium">{selectedEnquiry.phone}</p>
//                   </div>
//                   <div>
//                     <Label>Email</Label>
//                     <p className="font-medium">{selectedEnquiry.email || "-"}</p>
//                   </div>
//                   <div>
//                     <Label>Status</Label>
//                     <div>{getStatusBadge(selectedEnquiry.status || "new")}</div>
//                   </div>
//                   <div>
//                     <Label>Source</Label>
//                     <p className="font-medium capitalize">{selectedEnquiry.source || "website"}</p>
//                   </div>
//                   <div>
//                     <Label>Created</Label>
//                     <p className="font-medium">{formatDateForDisplay(selectedEnquiry.created_at || "")}</p>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Enquiry Details */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-lg">Enquiry Details</CardTitle>
//                 </CardHeader>
//                 <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <Label>Property</Label>
//                     <p className="font-medium">{selectedEnquiry.property_full_name || selectedEnquiry.property_name || "-"}</p>
//                   </div>
//                   <div>
//                     <Label>Budget Range</Label>
//                     <p className="font-medium">{selectedEnquiry.budget_range || "-"}</p>
//                   </div>
//                   <div>
//                     <Label>Move-in Date</Label>
//                     <p className="font-medium">{formatDateForDisplay(selectedEnquiry.preferred_move_in_date)}</p>
//                   </div>
//                   <div>
//                     <Label>Last Updated</Label>
//                     <p className="font-medium">{formatDateForDisplay(selectedEnquiry.updated_at || selectedEnquiry.created_at || "")}</p>
//                   </div>
//                   <div className="sm:col-span-2">
//                     <Label>Message</Label>
//                     <p className="text-sm whitespace-pre-line mt-2 p-3 bg-gray-50 rounded-lg border">
//                       {selectedEnquiry.message || "No message provided"}
//                     </p>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Followups */}
//               <Card>
//                 <CardHeader className="flex flex-row items-center justify-between">
//                   <CardTitle className="text-lg">Followups</CardTitle>
//                   <Badge variant="outline">{selectedEnquiry.followups?.length || 0}</Badge>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
//                     {selectedEnquiry.followups && selectedEnquiry.followups.length > 0 ? (
//                       selectedEnquiry.followups.map((followup: Followup) => (
//                         <div key={followup.id} className="border-l-2 border-blue-500 pl-3 py-2">
//                           <p className="text-sm">{followup.note}</p>
//                           <p className="text-xs text-gray-500 mt-1">
//                             {formatDateForDisplay(followup.timestamp)} - By {followup.created_by}
//                           </p>
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-sm text-gray-500 text-center py-4">No followups yet</p>
//                     )}
//                   </div>
//                   <div className="flex gap-2">
//                     <Textarea
//                       placeholder="Add followup note..."
//                       value={followupText}
//                       onChange={(e) => setFollowupText(e.target.value)}
//                       rows={2}
//                     />
//                     <Button onClick={handleAddFollowup}>Add Followup</Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Edit Enquiry Dialog */}
//       <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Edit Enquiry</DialogTitle>
//             <DialogDescription>
//               Update enquiry details for {selectedEnquiry?.tenant_name}
//             </DialogDescription>
//           </DialogHeader>
//           {selectedEnquiry && (
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <Label>Full Name *</Label>
//                   <Input
//                     value={editEnquiryData.tenant_name}
//                     onChange={(e) => setEditEnquiryData({ ...editEnquiryData, tenant_name: e.target.value })}
//                     placeholder="John Doe"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label>Phone *</Label>
//                   <Input
//                     value={editEnquiryData.phone}
//                     onChange={(e) => setEditEnquiryData({ ...editEnquiryData, phone: e.target.value })}
//                     placeholder="9876543210"
//                     required
//                   />
//                 </div>
//               </div>
//               <div>
//                 <Label>Email</Label>
//                 <Input
//                   type="email"
//                   value={editEnquiryData.email}
//                   onChange={(e) => setEditEnquiryData({ ...editEnquiryData, email: e.target.value })}
//                   placeholder="john@example.com"
//                 />
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <Label>Property</Label>
//                   <Select
//                     value={editEnquiryData.property_id || selectedEnquiry.property_id}
//                     onValueChange={(value) => setEditEnquiryData({ ...editEnquiryData, property_id: value })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select property" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {properties.length > 0 ? (
//                         properties.map((prop) => (
//                           <SelectItem key={prop.id} value={String(prop.id)}>
//                             {prop.name}
//                           </SelectItem>
//                         ))
//                       ) : (
//                         <SelectItem value="no-property" disabled>
//                           No properties available
//                         </SelectItem>
//                       )}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Status</Label>
//                   <Select
//                     value={editEnquiryData.status || "new"}
//                     onValueChange={(value) => setEditEnquiryData({ ...editEnquiryData, status: value })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="new">New</SelectItem>
//                       <SelectItem value="contacted">Contacted</SelectItem>
//                       <SelectItem value="interested">Interested</SelectItem>
//                       <SelectItem value="not_interested">Not Interested</SelectItem>
//                       <SelectItem value="converted">Converted</SelectItem>
//                       <SelectItem value="closed">Closed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <Label>Move-in Date</Label>
//                   <Input
//                     type="date"
//                     value={editEnquiryData.preferred_move_in_date}
//                     onChange={(e) => setEditEnquiryData({ ...editEnquiryData, preferred_move_in_date: e.target.value })}
//                   />
//                 </div>
//                 <div>
//                   <Label>Budget Range</Label>
//                   <Input
//                     value={editEnquiryData.budget_range}
//                     onChange={(e) => setEditEnquiryData({ ...editEnquiryData, budget_range: e.target.value })}
//                     placeholder="e.g. 8000-12000"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <Label>Message</Label>
//                 <Textarea
//                   value={editEnquiryData.message}
//                   onChange={(e) => setEditEnquiryData({ ...editEnquiryData, message: e.target.value })}
//                   placeholder="Any additional details..."
//                   rows={4}
//                 />
//               </div>
//               <div className="flex justify-between pt-4">
//                 <div>
//                   <Button
//                     variant="destructive"
//                     onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
//                     className="mr-2"
//                   >
//                     <Trash2 className="h-4 w-4 mr-2" />
//                     Delete
//                   </Button>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => setShowEditDialog(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleUpdateEnquiry}
//                     className="bg-blue-600 hover:bg-blue-700"
//                   >
//                     <Save className="h-4 w-4 mr-2" />
//                     Update Enquiry
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


// app/admin/enquiries/page.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import EnquiriesClientPage from '@/components/admin/enquiries/EnquiriesClientPage';
import { Enquiry, getEnquiries, getEnquiryStats } from '@/lib/enquiryApi';

export default function EnquiriesPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const search = searchParams.get('search') ?? '';
  const [initialEnquiries, setInitialEnquiries] = useState<Enquiry[]>([]);
  const [initialStats, setInitialStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEnquiries({ status, search }),
      getEnquiryStats()
    ])
      .then(([enquiriesRes, statsRes]) => {
        if (enquiriesRes.success) setInitialEnquiries(enquiriesRes.results);
        if (statsRes.success) setInitialStats(statsRes.data);
      })
      .catch((err) => console.error('Error fetching initial data:', err))
      .finally(() => setLoading(false));
  }, [status, search]);

  if (loading) return <div className="p-4">Loading...</div>;
  return (
    <EnquiriesClientPage 
      initialEnquiries={initialEnquiries}
      initialStats={initialStats}
      searchParams={{ status, search }}
    />
  );
}