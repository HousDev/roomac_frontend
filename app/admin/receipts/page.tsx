// // app/admin/receipts/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "@/src/compat/next-navigation";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { 
//   Eye, AlertCircle, Loader2, RefreshCw, Building, 
//   Home, User, Calendar, Clock, CheckCircle, 
//   XCircle, FileText, Receipt, IndianRupee,
//   Download, Mail, Printer, CreditCard, Wallet
// } from "lucide-react";
// import {
//   getAdminReceiptRequests,
//   updateReceiptStatus,
//   assignReceiptStaff,
//   generateReceipt,
//   getAccountingStaff,
//   type ReceiptRequest,
//   type ReceiptDetails
// } from "@/lib/receiptApi";
// import { toast } from "sonner";

// export default function ReceiptsPage() {
//   const router = useRouter();
//   const [requests, setRequests] = useState<ReceiptRequest[]>([]);
//   const [staff, setStaff] = useState<any[]>([]);
//   const [selectedRequest, setSelectedRequest] = useState<ReceiptRequest | null>(null);
//   const [showDialog, setShowDialog] = useState(false);
//   const [showGenerateDialog, setShowGenerateDialog] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [updating, setUpdating] = useState(false);

//   // Receipt generation form
//   const [receiptDetails, setReceiptDetails] = useState<ReceiptDetails>({
//     receipt_number: `RCPT-${Date.now().toString().slice(-6)}`,
//     amount: 0,
//     payment_date: new Date().toISOString().split('T')[0],
//     payment_method: "bank_transfer",
//     payment_for: "Monthly Rent",
//     notes: ""
//   });

//   useEffect(() => {
//     loadRequests();
//   }, []);

//   const loadRequests = async () => {
//     try {
//       setLoading(true);
//       const data = await getAdminReceiptRequests();
//       setRequests(data);
      
//       await loadStaff();
//     } catch (err: any) {
//       console.error('Error loading receipt requests:', err);
//       toast.error("Failed to load receipt requests");
//       setRequests([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadStaff = async () => {
//     try {
//       const staffData = await getAccountingStaff();
//       setStaff(staffData);
//     } catch (error) {
//       console.error('Error loading staff:', error);
//       setStaff([]);
//     }
//   };

//   const refreshData = async () => {
//     try {
//       setRefreshing(true);
//       await loadRequests();
//       toast.success("Data refreshed");
//     } catch (error) {
//       console.error('Error refreshing data:', error);
//       toast.error("Failed to refresh data");
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const handleUpdateStatus = async (id: number, status: string) => {
//     try {
//       setUpdating(true);
//       await updateReceiptStatus(id, status);
//       toast.success(`Status updated to ${status}`);
//       await loadRequests();
//     } catch (err: any) {
//       console.error('Error updating status:', err);
//       toast.error(err.message || "Failed to update status");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleAssignStaff = async (requestId: number, staffId: string) => {
//     try {
//       setUpdating(true);
//       if (staffId === "unassigned") {
//         await assignReceiptStaff(requestId, 0);
//         toast.success("Staff unassigned");
//       } else {
//         await assignReceiptStaff(requestId, Number(staffId));
//         toast.success("Staff assigned");
//       }
//       await loadRequests();
//     } catch (err: any) {
//       console.error('Error assigning staff:', err);
//       toast.error(err.message || "Failed to assign staff");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleGenerateReceipt = async () => {
//     if (!selectedRequest) {
//       toast.error("No request selected");
//       return;
//     }

//     if (!receiptDetails.amount || receiptDetails.amount <= 0) {
//       toast.error("Please enter a valid amount");
//       return;
//     }

//     try {
//       setUpdating(true);
//       const response = await generateReceipt(selectedRequest.id, receiptDetails);
      
//       if (response.success) {
//         toast.success("Receipt generated successfully");
//         setShowGenerateDialog(false);
//         await loadRequests();
        
//         // Reset form
//         setReceiptDetails({
//           receipt_number: `RCPT-${Date.now().toString().slice(-6)}`,
//           amount: 0,
//           payment_date: new Date().toISOString().split('T')[0],
//           payment_method: "bank_transfer",
//           payment_for: "Monthly Rent",
//           notes: ""
//         });
//       } else {
//         toast.error(response.message || "Failed to generate receipt");
//       }
//     } catch (err: any) {
//       console.error('Error generating receipt:', err);
//       toast.error(err.message || "Failed to generate receipt");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
//       pending: { variant: 'destructive', icon: Clock },
//       in_progress: { variant: 'default', icon: AlertCircle },
//       resolved: { variant: 'secondary', icon: CheckCircle },
//       closed: { variant: 'outline', icon: XCircle }
//     };

//     const config = statusMap[status] || statusMap.pending;
//     const Icon = config.icon;

//     return (
//       <Badge variant={config.variant} className="flex items-center gap-1">
//         <Icon className="h-3 w-3" />
//         {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
//       </Badge>
//     );
//   };

//   const getPriorityBadge = (priority: string) => {
//     const colors: Record<string, string> = {
//       low: 'bg-green-100 text-green-800 hover:bg-green-100',
//       medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
//       high: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
//       urgent: 'bg-red-100 text-red-800 hover:bg-red-100'
//     };

//     return (
//       <Badge className={`${colors[priority] || colors.medium}`}>
//         {priority.charAt(0).toUpperCase() + priority.slice(1)}
//       </Badge>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen gap-4">
//         <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
//         <p className="text-gray-600">Loading receipt requests...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
      

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium flex items-center gap-2">
//               <Receipt className="h-4 w-4" />
//               Total Requests
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{requests.length}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium">Pending</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-yellow-600">
//               {requests.filter(r => r.status === 'pending').length}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium">In Progress</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-blue-600">
//               {requests.filter(r => r.status === 'in_progress').length}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium">Completed</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">
//               {requests.filter(r => r.status === 'resolved' || r.status === 'closed').length}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Main Table */}
//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <FileText className="h-5 w-5" />
//             All Receipt Requests
//           </CardTitle>
//           <p className="text-sm text-gray-500">
//             Showing only receipt requests (request_type = 'receipt')
//           </p>
//         </CardHeader>
//         <CardContent>
//           {requests.length === 0 ? (
//             <div className="text-center py-12">
//               <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No receipt requests found</h3>
//               <p className="text-gray-500 mb-4">No receipt requests have been submitted yet.</p>
//               <Button onClick={refreshData} variant="outline">
//                 <RefreshCw className="h-4 w-4 mr-2" />
//                 Refresh
//               </Button>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Tenant</TableHead>
//                     <TableHead>Request</TableHead>
//                     <TableHead>Property</TableHead>
//                     <TableHead>Priority</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Assigned To</TableHead>
//                     <TableHead>Date</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {requests.map((request) => (
//                     <TableRow key={request.id} className="hover:bg-gray-50">
//                       <TableCell className="font-mono text-sm">
//                         #{request.id}
//                       </TableCell>
//                       <TableCell>
//                         <div className="font-medium">{request.tenant_name || "Unknown"}</div>
//                         <div className="text-xs text-gray-500 truncate max-w-[150px]">
//                           {request.tenant_email || "No email"}
//                         </div>
//                       </TableCell>
//                       <TableCell className="max-w-[200px]">
//                         <div className="font-medium truncate">{request.title}</div>
//                         <div className="text-xs text-gray-500 truncate">
//                           {request.description.substring(0, 60)}...
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex items-center gap-2">
//                           <Building className="h-4 w-4 text-gray-400" />
//                           <span className="truncate max-w-[120px]">
//                             {request.property_name || "Not specified"}
//                           </span>
//                         </div>
//                         {request.room_number && (
//                           <div className="text-xs text-gray-500 mt-1">
//                             Room: {request.room_number}
//                           </div>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         {getPriorityBadge(request.priority)}
//                       </TableCell>
//                       <TableCell>
//                         {getStatusBadge(request.status)}
//                       </TableCell>
//                       <TableCell>
//                         {request.staff_name ? (
//                           <div>
//                             <div className="font-medium truncate max-w-[120px]">
//                               {request.staff_name}
//                             </div>
//                             {request.staff_role && (
//                               <div className="text-xs text-gray-500">
//                                 {request.staff_role}
//                               </div>
//                             )}
//                           </div>
//                         ) : (
//                           <span className="text-gray-400">Unassigned</span>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         <div className="text-sm">
//                           {new Date(request.created_at).toLocaleDateString()}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-2">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => {
//                               setSelectedRequest(request);
//                               setShowDialog(true);
//                             }}
//                             disabled={updating}
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                           <Select
//                             value={request.status || "pending"}
//                             onValueChange={(value) => handleUpdateStatus(request.id, value)}
//                             disabled={updating}
//                           >
//                             <SelectTrigger className="w-[140px]">
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="pending">Pending</SelectItem>
//                               <SelectItem value="in_progress">In Progress</SelectItem>
//                               <SelectItem value="resolved">Resolved</SelectItem>
//                               <SelectItem value="closed">Closed</SelectItem>
//                             </SelectContent>
//                           </Select>
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

//       {/* View Details Dialog */}
//       <Dialog open={showDialog} onOpenChange={setShowDialog}>
//         <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <Receipt className="h-5 w-5" />
//               Receipt Request Details
//             </DialogTitle>
//             <DialogDescription>
//               ID: #{selectedRequest?.id} • Created: {selectedRequest && new Date(selectedRequest.created_at).toLocaleDateString()}
//             </DialogDescription>
//           </DialogHeader>
          
//           {selectedRequest && (
//             <div className="space-y-6">
//               {/* Basic Information */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <Card>
//                   <CardHeader className="pb-3">
//                     <CardTitle className="text-sm font-medium flex items-center gap-2">
//                       <User className="h-4 w-4" />
//                       Tenant Information
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-2">
//                       <div>
//                         <Label className="text-xs text-gray-500">Name</Label>
//                         <p className="font-medium">{selectedRequest.tenant_name}</p>
//                       </div>
//                       {selectedRequest.tenant_email && (
//                         <div>
//                           <Label className="text-xs text-gray-500">Email</Label>
//                           <p className="text-sm">{selectedRequest.tenant_email}</p>
//                         </div>
//                       )}
//                       {selectedRequest.tenant_phone && (
//                         <div>
//                           <Label className="text-xs text-gray-500">Phone</Label>
//                           <p className="text-sm">{selectedRequest.tenant_phone}</p>
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader className="pb-3">
//                     <CardTitle className="text-sm font-medium flex items-center gap-2">
//                       <Building className="h-4 w-4" />
//                       Property Information
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="space-y-2">
//                       <div>
//                         <Label className="text-xs text-gray-500">Property</Label>
//                         <p className="font-medium">{selectedRequest.property_name || "Not specified"}</p>
//                       </div>
//                       {selectedRequest.room_number && (
//                         <div>
//                           <Label className="text-xs text-gray-500">Room Number</Label>
//                           <p className="text-sm">{selectedRequest.room_number}</p>
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Request Details */}
//               <Card>
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-sm font-medium flex items-center gap-2">
//                     <FileText className="h-4 w-4" />
//                     Request Details
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     <div>
//                       <Label className="text-xs text-gray-500">Title</Label>
//                       <p className="font-medium">{selectedRequest.title}</p>
//                     </div>
//                     <div>
//                       <Label className="text-xs text-gray-500">Description</Label>
//                       <div className="bg-gray-50 p-3 rounded-md mt-1">
//                         <p className="whitespace-pre-wrap text-sm">{selectedRequest.description}</p>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <Label className="text-xs text-gray-500">Priority</Label>
//                         <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
//                       </div>
//                       <div>
//                         <Label className="text-xs text-gray-500">Status</Label>
//                         <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Admin Actions */}
//               <Card>
//                 <CardHeader className="pb-3">
//                   <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {/* Assign Staff */}
//                   <div>
//                     <Label className="text-sm">Assign to Accounting Staff</Label>
//                     <Select
//                       value={selectedRequest.assigned_to?.toString() || "unassigned"}
//                       onValueChange={(value) => handleAssignStaff(selectedRequest.id, value)}
//                       disabled={updating}
//                     >
//                       <SelectTrigger className="mt-1">
//                         <SelectValue placeholder="Select accounting staff" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="unassigned">Unassign</SelectItem>
//                         {staff.length > 0 ? (
//                           staff.map((s) => (
//                             <SelectItem key={s.id} value={s.id.toString()}>
//                               {s.name} - {s.role}
//                             </SelectItem>
//                           ))
//                         ) : (
//                           <SelectItem value="" disabled>No accounting staff available</SelectItem>
//                         )}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Generate Receipt Button - Only for pending/in_progress */}
//                   {(selectedRequest.status === 'pending' || selectedRequest.status === 'in_progress') && (
//                     <div className="pt-4 border-t">
//                       <Button 
//                         onClick={() => {
//                           setShowDialog(false);
//                           setShowGenerateDialog(true);
//                         }}
//                         className="w-full"
//                         disabled={updating}
//                       >
//                         <Receipt className="h-4 w-4 mr-2" />
//                         Generate Receipt
//                       </Button>
//                       <p className="text-xs text-gray-500 mt-2 text-center">
//                         Generate and send receipt to tenant
//                       </p>
//                     </div>
//                   )}

//                   {/* Admin Notes (if exists) */}
//                   {selectedRequest.admin_notes && (
//                     <div className="pt-4 border-t">
//                       <Label className="text-sm text-gray-500">Admin Notes</Label>
//                       <div className="bg-blue-50 p-3 rounded-md mt-1 border border-blue-100">
//                         <p className="whitespace-pre-wrap text-sm">{selectedRequest.admin_notes}</p>
//                       </div>
//                     </div>
//                   )}

//                   {/* Resolved At (if resolved) */}
//                   {selectedRequest.resolved_at && (
//                     <div className="pt-4 border-t">
//                       <Label className="text-sm text-gray-500">Completed At</Label>
//                       <p className="text-sm">
//                         {new Date(selectedRequest.resolved_at).toLocaleString()}
//                       </p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Generate Receipt Dialog */}
//       <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <Receipt className="h-5 w-5" />
//               Generate Receipt
//             </DialogTitle>
//             <DialogDescription>
//               Create receipt for {selectedRequest?.tenant_name}
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="receipt_number">Receipt Number</Label>
//                 <Input
//                   id="receipt_number"
//                   value={receiptDetails.receipt_number}
//                   onChange={(e) => setReceiptDetails({...receiptDetails, receipt_number: e.target.value})}
//                   disabled={updating}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="amount">Amount (₹)</Label>
//                 <Input
//                   id="amount"
//                   type="number"
//                   value={receiptDetails.amount}
//                   onChange={(e) => setReceiptDetails({...receiptDetails, amount: parseFloat(e.target.value) || 0})}
//                   disabled={updating}
//                 />
//               </div>
//             </div>

//             <div>
//               <Label htmlFor="payment_date">Payment Date</Label>
//               <Input
//                 id="payment_date"
//                 type="date"
//                 value={receiptDetails.payment_date}
//                 onChange={(e) => setReceiptDetails({...receiptDetails, payment_date: e.target.value})}
//                 disabled={updating}
//               />
//             </div>

//             <div>
//               <Label htmlFor="payment_method">Payment Method</Label>
//               <Select
//                 value={receiptDetails.payment_method}
//                 onValueChange={(value) => setReceiptDetails({...receiptDetails, payment_method: value})}
//                 disabled={updating}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select payment method" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
//                   <SelectItem value="cash">Cash</SelectItem>
//                   <SelectItem value="cheque">Cheque</SelectItem>
//                   <SelectItem value="upi">UPI</SelectItem>
//                   <SelectItem value="credit_card">Credit Card</SelectItem>
//                   <SelectItem value="debit_card">Debit Card</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label htmlFor="payment_for">Payment For</Label>
//               <Select
//                 value={receiptDetails.payment_for}
//                 onValueChange={(value) => setReceiptDetails({...receiptDetails, payment_for: value})}
//                 disabled={updating}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select payment purpose" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Monthly Rent">Monthly Rent</SelectItem>
//                   <SelectItem value="Security Deposit">Security Deposit</SelectItem>
//                   <SelectItem value="Maintenance Charges">Maintenance Charges</SelectItem>
//                   <SelectItem value="Electricity Bill">Electricity Bill</SelectItem>
//                   <SelectItem value="Water Bill">Water Bill</SelectItem>
//                   <SelectItem value="Other">Other</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label htmlFor="notes">Notes (Optional)</Label>
//               <Textarea
//                 id="notes"
//                 value={receiptDetails.notes}
//                 onChange={(e) => setReceiptDetails({...receiptDetails, notes: e.target.value})}
//                 placeholder="Additional notes about this payment..."
//                 rows={3}
//                 disabled={updating}
//               />
//             </div>

//             <div className="flex gap-2 pt-4">
//               <Button 
//                 onClick={handleGenerateReceipt}
//                 disabled={updating || !receiptDetails.amount}
//                 className="flex-1"
//               >
//                 {updating ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <Receipt className="h-4 w-4 mr-2" />
//                     Generate Receipt
//                   </>
//                 )}
//               </Button>
//               <Button 
//                 variant="outline"
//                 onClick={() => setShowGenerateDialog(false)}
//                 disabled={updating}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


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
  type ReceiptRequest,
  type ReceiptDetails
} from "@/lib/receiptApi";
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
    <div className="p-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 min-h-screen">
     

      {/* Stats Cards - Compact Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-2 px-0 sticky top-20 z-10">
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
                <Receipt className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
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

      {/* Main Table Card */}
      <Card className="shadow-lg border-0 overflow-hidden mx-0 mb-6 sticky top-48 z-10">
       
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 m-4 rounded-lg">
              <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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
              <div className="overflow-auto max-h-[470px] md:max-h-[520px] rounded-b-lg">
                <Table className="min-w-[1000px] md:min-w-full table-fixed">
                  <TableHeader className="sticky top-0 z-20 bg-gradient-to-r from-gray-50 to-white shadow-sm">
                    <TableRow className="hover:bg-transparent">
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
                                    <Receipt className="h-3.5 w-3.5 mr-2" />
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
                <Receipt className="h-4 w-4" />
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
    </div>
  );
}