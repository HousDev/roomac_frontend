// 'use client';

// import { useState, useEffect } from 'react';
// import { AdminHeader } from '@/components/admin/admin-header';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { DoorOpen, Plus, Edit, Trash2, Bed, CreditCard, FileText, Download, Search, Calendar, DollarSign, AlertCircle, CheckCircle, XCircle, Bell, Send } from 'lucide-react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { useToast } from '@/hooks/use-toast';
// import { format } from 'date-fns';
// import { Textarea } from '@/components/ui/textarea';

// // <-- MISSING TABS IMPORT (fixed) -->
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// // ---------- CONFIGURE API BASE HERE ----------
// const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
// // If empty, code will call relative endpoints like /api/payment_records

// // ---------- Types ----------
// interface PaymentRecord {
//   id: string;
//   tenant_id: string;
//   booking_id: string | null;
//   payment_type: string;
//   amount: number;
//   payment_method?: string;
//   transaction_id?: string;
//   payment_date?: string;
//   due_date?: string;
//   status: string;
//   late_fee?: number;
//   notes?: string;
//   tenants: {
//     id?: string;
//     full_name: string;
//     email?: string;
//     phone?: string;
//   };
// }

// interface Receipt {
//   id: string;
//   receipt_number: string;
//   amount: number;
//   payment_method?: string;
//   payment_date?: string;
//   description?: string;
//   is_cancelled?: boolean;
//   tenants: {
//     full_name: string;
//     email?: string;
//   };
// }

// interface Tenant {
//   id: string;
//   full_name: string;
//   email?: string;
//   phone?: string;
// }

// interface Booking {
//   id: string;
//   booking_number?: string;
//   monthly_rent?: number;
// }

// interface DemandPaymentData {
//   tenant_id: string;
//   payment_type: string;
//   amount: number;
//   due_date: string;
//   description: string;
//   include_late_fee: boolean;
//   late_fee_amount?: number;
//   send_email: boolean;
//   send_sms: boolean;
// }

// export default function PaymentsPage() {
//   const { toast } = useToast();
//   const [payments, setPayments] = useState<PaymentRecord[]>([]);
//   const [receipts, setReceipts] = useState<Receipt[]>([]);
//   const [tenants, setTenants] = useState<Tenant[]>([]);
//   const [bookings, setBookings] = useState<Booking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
//   const [isDemandPaymentOpen, setIsDemandPaymentOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');

//   const [newPayment, setNewPayment] = useState({
//     tenant_id: '',
//     booking_id: '',
//     payment_type: 'rent',
//     amount: '',
//     payment_method: '',
//     transaction_id: '',
//     payment_date: new Date().toISOString().split('T')[0],
//     due_date: '',
//     status: 'paid',
//     notes: ''
//   });

//   const [demandPayment, setDemandPayment] = useState<DemandPaymentData>({
//     tenant_id: '',
//     payment_type: 'rent',
//     amount: 0,
//     due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
//     description: '',
//     include_late_fee: false,
//     late_fee_amount: 0,
//     send_email: true,
//     send_sms: false
//   });

//   useEffect(() => {
//     loadData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function safeFetch(path: string, opts: RequestInit = {}) {
//     try {
//       const resp = await fetch(`${API_BASE}${path}`, {
//         headers: { 'Content-Type': 'application/json' },
//         ...opts
//       });
//       if (!resp.ok) {
//         const text = await resp.text();
//         throw new Error(text || resp.statusText);
//       }
//       // If 204 No Content
//       if (resp.status === 204) return null;
//       return await resp.json();
//     } catch (err: any) {
//       console.error('API error', path, err);
//       throw err;
//     }
//   }

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       await Promise.all([loadPayments(), loadReceipts(), loadTenants(), loadBookings()]);
//     } catch (err) {
//       toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadPayments = async () => {
//     try {
//       const data = await safeFetch('/payment_records');
//       setPayments(data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const loadReceipts = async () => {
//     try {
//       const data = await safeFetch('/receipts?is_cancelled=false');
//       setReceipts(data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const loadTenants = async () => {
//     try {
//       const data = await safeFetch('/tenants?is_active=true');
//       setTenants(data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const loadBookings = async () => {
//     try {
//       const data = await safeFetch('/bookings?status=active,confirmed');
//       setBookings(data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleAddPayment = async () => {
//     if (!newPayment.tenant_id || !newPayment.amount) {
//       toast({
//         title: "Validation Error",
//         description: "Please fill in all required fields",
//         variant: "destructive"
//       });
//       return;
//     }

//     try {
//       const payload = { ...newPayment, amount: parseFloat(newPayment.amount) };
//       const created = await safeFetch('/payment_records', {
//         method: 'POST',
//         body: JSON.stringify(payload)
//       });

//       // If payment created and status is paid -> create receipt
//       if (created && newPayment.status === 'paid') {
//         await generateReceipt(created.id, created.tenant_id, created.amount, created.payment_method || 'cash', created.payment_date || new Date().toISOString().split('T')[0], `Payment for ${created.payment_type}`);
//       }

//       toast({ title: "Success", description: "Payment added successfully" });
//       setIsAddPaymentOpen(false);
//       setNewPayment({
//         tenant_id: '',
//         booking_id: '',
//         payment_type: 'rent',
//         amount: '',
//         payment_method: '',
//         transaction_id: '',
//         payment_date: new Date().toISOString().split('T')[0],
//         due_date: '',
//         status: 'paid',
//         notes: ''
//       });
//       await loadData();
//     } catch (err) {
//       toast({ title: "Error", description: "Failed to add payment", variant: "destructive" });
//     }
//   };

//   const handleDemandPayment = async () => {
//     if (!demandPayment.tenant_id || !demandPayment.amount || !demandPayment.due_date) {
//       toast({
//         title: "Validation Error",
//         description: "Please select tenant, enter amount, and set due date",
//         variant: "destructive"
//       });
//       return;
//     }

//     try {
//       // First, create a pending payment record
//       const paymentPayload = {
//         tenant_id: demandPayment.tenant_id,
//         payment_type: demandPayment.payment_type,
//         amount: demandPayment.amount,
//         due_date: demandPayment.due_date,
//         status: 'pending',
//         notes: demandPayment.description,
//         late_fee: demandPayment.include_late_fee ? demandPayment.late_fee_amount : 0
//       };

//       const createdPayment = await safeFetch('/payment_records', {
//         method: 'POST',
//         body: JSON.stringify(paymentPayload)
//       });

//       // If notifications are enabled, send them
//       if (demandPayment.send_email || demandPayment.send_sms) {
//         await sendPaymentNotification(demandPayment.tenant_id, createdPayment.id);
//       }

//       toast({ 
//         title: "Success", 
//         description: "Payment demand created and notifications sent successfully" 
//       });
      
//       setIsDemandPaymentOpen(false);
//       resetDemandPaymentForm();
//       await loadData();
//     } catch (err) {
//       toast({ 
//         title: "Error", 
//         description: "Failed to create payment demand", 
//         variant: "destructive" 
//       });
//     }
//   };

//   const sendPaymentNotification = async (tenantId: string, paymentId: string) => {
//     try {
//       await safeFetch('/payment_records/send-notification', {
//         method: 'POST',
//         body: JSON.stringify({
//           tenant_id: tenantId,
//           payment_id: paymentId,
//           send_email: demandPayment.send_email,
//           send_sms: demandPayment.send_sms
//         })
//       });
//     } catch (err) {
//       console.error('Failed to send notification', err);
//       // Don't fail the whole process if notification fails
//     }
//   };

//   const resetDemandPaymentForm = () => {
//     setDemandPayment({
//       tenant_id: '',
//       payment_type: 'rent',
//       amount: 0,
//       due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//       description: '',
//       include_late_fee: false,
//       late_fee_amount: 0,
//       send_email: true,
//       send_sms: false
//     });
//   };

//   const handleTenantSelect = (tenantId: string) => {
//     setDemandPayment({ ...demandPayment, tenant_id: tenantId });
    
//     // Auto-populate rent amount if tenant has an active booking
//     const tenant = tenants.find(t => t.id === tenantId);
//     if (tenant) {
//       const tenantBooking = bookings.find(b => {
//         // Assuming bookings have a tenant_id field
//         // You might need to adjust this based on your actual data structure
//         return true; // Placeholder - adjust based on your data structure
//       });
      
//       if (tenantBooking && demandPayment.payment_type === 'rent') {
//         setDemandPayment(prev => ({
//           ...prev,
//           amount: tenantBooking.monthly_rent || 0
//         }));
//       }
//     }
//   };

//   const generateReceipt = async (
//     paymentId: string,
//     tenantId: string,
//     amount: number,
//     paymentMethod: string,
//     paymentDate: string,
//     description: string
//   ) => {
//     try {
//       // POST to /receipts - backend should generate unique receipt_number
//       await safeFetch('/receipts', {
//         method: 'POST',
//         body: JSON.stringify({
//           payment_id: paymentId,
//           tenant_id: tenantId,
//           amount,
//           payment_method: paymentMethod,
//           payment_date: paymentDate,
//           description
//         })
//       });
//       // refresh receipts
//       await loadReceipts();
//     } catch (err) {
//       console.error('Failed to generate receipt', err);
//     }
//   };

//   const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
//     try {
//       await safeFetch(`/payment_records/${paymentId}`, {
//         method: 'PATCH',
//         body: JSON.stringify({ status: newStatus })
//       });

//       // If newly paid -> generate receipt (attempt to read payment from current state)
//       if (newStatus === 'paid') {
//         const payment = payments.find(p => p.id === paymentId);
//         if (payment) {
//           await generateReceipt(payment.id, payment.tenant_id, payment.amount, payment.payment_method || 'cash', new Date().toISOString().split('T')[0], `Payment for ${payment.payment_type}`);
//         }
//       }

//       toast({ title: "Success", description: "Payment status updated" });
//       await loadData();
//     } catch (err) {
//       toast({ title: "Error", description: "Failed to update payment status", variant: "destructive" });
//     }
//   };

//   const downloadReceipt = (receipt: Receipt) => {
//     const receiptContent = `
// ROOMAC - Payment Receipt
// ========================

// Receipt Number: ${receipt.receipt_number}
// Date: ${receipt.payment_date ? new Date(receipt.payment_date).toLocaleDateString() : ''}

// Tenant: ${receipt.tenants.full_name}
// Email: ${receipt.tenants.email || ''}

// Amount Paid: ₹${receipt.amount.toLocaleString()}
// Payment Method: ${receipt.payment_method || 'N/A'}
// Description: ${receipt.description || ''}

// Thank you for your payment!
//     `.trim();

//     const blob = new Blob([receiptContent], { type: 'text/plain' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${receipt.receipt_number || 'receipt'}.txt`;
//     document.body.appendChild(a);
//     a.click();
//     window.URL.revokeObjectURL(url);
//     document.body.removeChild(a);

//     toast({ title: "Success", description: "Receipt downloaded" });
//   };

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", icon: any }> = {
//       paid: { variant: "default", icon: CheckCircle },
//       pending: { variant: "secondary", icon: AlertCircle },
//       overdue: { variant: "destructive", icon: XCircle },
//       cancelled: { variant: "outline", icon: XCircle }
//     };

//     const config = variants[status] || variants.pending;
//     const Icon = config.icon;

//     return (
//       <Badge variant={config.variant} className="flex items-center gap-1">
//         <Icon className="h-3 w-3" />
//         {status.toUpperCase()}
//       </Badge>
//     );
//   };

//   const filteredPayments = payments.filter(payment => {
//     const matchesSearch = (payment.tenants?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (payment.tenants?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (payment.transaction_id || '').toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
//     return matchesSearch && matchesStatus;
//   });

//   const stats = {
//     total: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
//     paid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
//     pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0),
//     overdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + (p.amount || 0), 0)
//   };

//   return (
//     <div className="min-h-screen bg-slate-50">
//   {/* <AdminHeader title="Payments" /> */}

//   <div className="p-2 space-y-6">
//     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//       <Card>
//         <CardContent className="pt-6 bg-blue-50 border border-blue-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-500">Total Payments</p>
//               <p className="text-2xl font-bold">₹{stats.total.toLocaleString()}</p>
//             </div>
//             <DollarSign className="h-8 w-8 text-blue-500" />
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardContent className="pt-6 bg-green-50 border border-green-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-500">Paid</p>
//               <p className="text-2xl font-bold text-green-600">₹{stats.paid.toLocaleString()}</p>
//             </div>
//             <CheckCircle className="h-8 w-8 text-green-500" />
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardContent className="pt-6 bg-yellow-50 border border-yellow-100">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-500">Pending</p>
//               <p className="text-2xl font-bold text-yellow-600">₹{stats.pending.toLocaleString()}</p>
//             </div>
//             <AlertCircle className="h-8 w-8 text-yellow-500" />
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardContent className="pt-6 bg-red-50 border border-red-100">
//           <div className="flex items-center justify-between" >
//             <div>
//               <p className="text-sm text-slate-500 ">Overdue</p>
//               <p className="text-2xl font-bold text-red-600">₹{stats.overdue.toLocaleString()}</p>
//             </div>
//             <XCircle className="h-8 w-8 text-red-500" />
//           </div>
//         </CardContent>
//       </Card>
//     </div>
    

//     <div>
      
//       <Tabs defaultValue="payments " className="space-y-4">
//         <div className="flex items-center justify-between mb-2 ">
//        <TabsList className="h-10">
//   <TabsTrigger value="payments" className="text-base px-6 py-2">Payment Management</TabsTrigger>
//   <TabsTrigger value="receipts" className="text-base px-6 py-2">Payment Receipts</TabsTrigger>
// </TabsList>
//           <div className="flex items-center gap-2">
//             <Input
//               placeholder="Search by tenant name, email, or transaction ID..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//             <Select value={filterStatus} onValueChange={setFilterStatus}>
//               <SelectTrigger className="w-40">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Status</SelectItem>
//                 <SelectItem value="paid">Paid</SelectItem>
//                 <SelectItem value="pending">Pending</SelectItem>
//                 <SelectItem value="overdue">Overdue</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Add Payment and Demand Payment Buttons */}
//         <div className="flex items-center justify-between mb-2">
//           <div className="flex items-center gap-2">
//             <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddPaymentOpen(true)}>
//               <Plus className="h-4 w-4 mr-2" />
//               Add Payment
//             </Button>
            
//             {/* Demand Payment Button */}
//             <Button 
//               variant="outline" 
//               className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-orange-50"
//               onClick={() => setIsDemandPaymentOpen(true)}
//             >
//               <Bell className="h-4 w-4 mr-2" />
//               Demand Payment
//             </Button>
//           </div>
//         </div>

//         {/* Add Payment Dialog */}
//         <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
//           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Record New Payment</DialogTitle>
//               <DialogDescription>Add a new payment record for a tenant</DialogDescription>
//             </DialogHeader>

//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Tenant *</Label>
//                   <Select value={newPayment.tenant_id} onValueChange={(value) => setNewPayment({ ...newPayment, tenant_id: value })}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select tenant" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {tenants.map(tenant => (
//                         <SelectItem key={tenant.id} value={tenant.id}>
//                           {tenant.full_name} - {tenant.phone}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Payment Type *</Label>
//                   <Select value={newPayment.payment_type} onValueChange={(value) => setNewPayment({ ...newPayment, payment_type: value })}>
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="rent">Rent</SelectItem>
//                       <SelectItem value="security_deposit">Security Deposit</SelectItem>
//                       <SelectItem value="maintenance">Maintenance</SelectItem>
//                       <SelectItem value="electricity">Electricity</SelectItem>
//                       <SelectItem value="late_fee">Late Fee</SelectItem>
//                       <SelectItem value="other">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Amount *</Label>
//                   <Input
//                     type="number"
//                     placeholder="Enter amount"
//                     value={newPayment.amount}
//                     onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Payment Method</Label>
//                   <Select value={newPayment.payment_method} onValueChange={(value) => setNewPayment({ ...newPayment, payment_method: value })}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select method" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="cash">Cash</SelectItem>
//                       <SelectItem value="upi">UPI</SelectItem>
//                       <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
//                       <SelectItem value="cheque">Cheque</SelectItem>
//                       <SelectItem value="card">Card</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Transaction ID</Label>
//                   <Input
//                     placeholder="Enter transaction ID"
//                     value={newPayment.transaction_id}
//                     onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Status</Label>
//                   <Select value={newPayment.status} onValueChange={(value) => setNewPayment({ ...newPayment, status: value })}>
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="paid">Paid</SelectItem>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="overdue">Overdue</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Payment Date</Label>
//                   <Input
//                     type="date"
//                     value={newPayment.payment_date}
//                     onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Due Date</Label>
//                   <Input
//                     type="date"
//                     value={newPayment.due_date}
//                     onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label>Notes</Label>
//                 <Input
//                   placeholder="Additional notes"
//                   value={newPayment.notes}
//                   onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
//                 />
//               </div>
//             </div>

//             <DialogFooter>
//               <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>Cancel</Button>
//               <Button onClick={handleAddPayment} className="bg-green-600 hover:bg-green-700">Add Payment</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Demand Payment Dialog */}
//         <Dialog open={isDemandPaymentOpen} onOpenChange={setIsDemandPaymentOpen}>
//           <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle className="flex items-center gap-2">
//                 <Bell className="h-5 w-5" />
//                 Demand Payment from Tenant
//               </DialogTitle>
//               <DialogDescription>
//                 Create a payment request and notify the tenant
//               </DialogDescription>
//             </DialogHeader>

//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Tenant *</Label>
//                   <Select 
//                     value={demandPayment.tenant_id} 
//                     onValueChange={handleTenantSelect}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select tenant" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {tenants.map(tenant => (
//                         <SelectItem key={tenant.id} value={tenant.id}>
//                           <div className="flex flex-col">
//                             <span className="font-medium">{tenant.full_name}</span>
//                             <span className="text-sm text-slate-500">{tenant.phone}</span>
//                           </div>
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Payment Type *</Label>
//                   <Select 
//                     value={demandPayment.payment_type} 
//                     onValueChange={(value) => setDemandPayment({ ...demandPayment, payment_type: value })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="rent">Rent</SelectItem>
//                       <SelectItem value="security_deposit">Security Deposit</SelectItem>
//                       <SelectItem value="maintenance">Maintenance</SelectItem>
//                       <SelectItem value="electricity">Electricity Bill</SelectItem>
//                       <SelectItem value="water">Water Bill</SelectItem>
//                       <SelectItem value="other">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Amount (₹) *</Label>
//                   <Input
//                     type="number"
//                     placeholder="Enter amount"
//                     value={demandPayment.amount || ''}
//                     onChange={(e) => setDemandPayment({ 
//                       ...demandPayment, 
//                       amount: parseFloat(e.target.value) || 0 
//                     })}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Due Date *</Label>
//                   <Input
//                     type="date"
//                     value={demandPayment.due_date}
//                     onChange={(e) => setDemandPayment({ ...demandPayment, due_date: e.target.value })}
//                     min={new Date().toISOString().split('T')[0]}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label>Description</Label>
//                 <Textarea
//                   placeholder="Enter payment description (e.g., 'Rent for January 2024', 'Maintenance charges for common area')"
//                   value={demandPayment.description}
//                   onChange={(e) => setDemandPayment({ ...demandPayment, description: e.target.value })}
//                   rows={3}
//                 />
//               </div>

//               <div className="border rounded-lg p-4 space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div className="space-y-0.5">
//                     <Label className="text-base">Late Fee Settings</Label>
//                     <p className="text-sm text-slate-500">Configure late payment charges</p>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       id="include-late-fee"
//                       checked={demandPayment.include_late_fee}
//                       onChange={(e) => setDemandPayment({ 
//                         ...demandPayment, 
//                         include_late_fee: e.target.checked 
//                       })}
//                       className="h-4 w-4 rounded border-slate-300"
//                     />
//                     <Label htmlFor="include-late-fee" className="text-sm">Include Late Fee</Label>
//                   </div>
//                 </div>

//                 {demandPayment.include_late_fee && (
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label>Late Fee Amount (₹)</Label>
//                       <Input
//                         type="number"
//                         placeholder="Enter late fee amount"
//                         value={demandPayment.late_fee_amount || ''}
//                         onChange={(e) => setDemandPayment({ 
//                           ...demandPayment, 
//                           late_fee_amount: parseFloat(e.target.value) || 0 
//                         })}
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label className="text-sm text-slate-500">Applied after due date</Label>
//                       <p className="text-xs text-slate-500">This amount will be added if payment is not made by due date</p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="border rounded-lg p-4 space-y-4">
//                 <div className="space-y-0.5">
//                   <Label className="text-base">Notification Settings</Label>
//                   <p className="text-sm text-slate-500">How would you like to notify the tenant?</p>
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       id="send-email"
//                       checked={demandPayment.send_email}
//                       onChange={(e) => setDemandPayment({ 
//                         ...demandPayment, 
//                         send_email: e.target.checked 
//                       })}
//                       className="h-4 w-4 rounded border-slate-300"
//                     />
//                     <Label htmlFor="send-email" className="text-sm">Send Email Notification</Label>
//                   </div>
                  
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       id="send-sms"
//                       checked={demandPayment.send_sms}
//                       onChange={(e) => setDemandPayment({ 
//                         ...demandPayment, 
//                         send_sms: e.target.checked 
//                       })}
//                       className="h-4 w-4 rounded border-slate-300"
//                     />
//                     <Label htmlFor="send-sms" className="text-sm">Send SMS Notification</Label>
//                   </div>
//                 </div>
                
//                 <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
//                   <p className="font-medium">Notification Preview:</p>
//                   <p className="mt-1">"Dear Tenant, please pay ₹{demandPayment.amount.toLocaleString()} for {demandPayment.payment_type.replace('_', ' ')} by {new Date(demandPayment.due_date).toLocaleDateString()}. {demandPayment.description ? `Description: ${demandPayment.description}` : ''}"</p>
//                 </div>
//               </div>
//             </div>

//             <DialogFooter className="flex flex-col sm:flex-row gap-2">
//               <Button 
//                 variant="outline" 
//                 onClick={() => {
//                   setIsDemandPaymentOpen(false);
//                   resetDemandPaymentForm();
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 onClick={handleDemandPayment} 
//                 className="bg-orange-600 hover:bg-orange-700"
//               >
//                 <Send className="h-4 w-4 mr-2" />
//                 Send Payment Demand
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Payment Management Tab */}
//         <TabsContent value="payments" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle className="flex items-center gap-2 ">
//                     <CreditCard className="h-6 w-" />
//                     Payment Management
//                   </CardTitle>
//                   <CardDescription>Track and manage all payment transactions</CardDescription>
//                 </div>
//               </div>
//             </CardHeader>

//             <CardContent>
//               <div className="border rounded-lg overflow-hidden ">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className=" text-slate-800 bg-blue-50">
//                       <TableHead>Date</TableHead>
//                       <TableHead>Tenant</TableHead>
//                       <TableHead>Type</TableHead>
//                       <TableHead>Amount</TableHead>
//                       <TableHead>Method</TableHead>
//                       <TableHead>Transaction ID</TableHead>
//                       <TableHead>Due Date</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {loading ? (
//                       <TableRow>
//                         <TableCell colSpan={9} className="text-center py-8 text-slate-500">
//                           Loading payments...
//                         </TableCell>
//                       </TableRow>
//                     ) : filteredPayments.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={9} className="text-center py-8 text-slate-500">
//                           No payments found
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       filteredPayments.map((payment) => (
//                         <TableRow key={payment.id}>
//                           <TableCell>
//                             {payment.payment_date ? format(new Date(payment.payment_date), 'dd MMM yyyy') : '-'}
//                           </TableCell>
//                           <TableCell>
//                             <div>
//                               <p className="font-medium">{payment.tenants.full_name}</p>
//                               <p className="text-sm text-slate-500">{payment.tenants.phone}</p>
//                             </div>
//                           </TableCell>
//                           <TableCell className="capitalize">{payment.payment_type.replace('_', ' ')}</TableCell>
//                           <TableCell className="font-semibold">₹{(payment.amount || 0).toLocaleString()}</TableCell>
//                           <TableCell className="capitalize">{payment.payment_method || '-'}</TableCell>
//                           <TableCell className="font-mono text-sm">{payment.transaction_id || '-'}</TableCell>
//                           <TableCell>
//                             {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : '-'}
//                           </TableCell>
//                           <TableCell>{getStatusBadge(payment.status)}</TableCell>
//                           <TableCell>
//                             {payment.status === 'pending' && (
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => updatePaymentStatus(payment.id, 'paid')}
//                               >
//                                 Mark Paid
//                               </Button>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Payment Receipts Tab */}
//         <TabsContent value="receipts" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <FileText className="h-6 w-6" />
//                 Payment Receipts
//               </CardTitle>
//               <CardDescription>View and download payment receipts</CardDescription>
//             </CardHeader>

//             <CardContent>
//               <div className="border rounded-lg overflow-hidden">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className=" bg-blue-50 text-slate-800">
//                       <TableHead>Receipt No.</TableHead>
//                       <TableHead>Date</TableHead>
//                       <TableHead>Tenant</TableHead>
//                       <TableHead>Amount</TableHead>
//                       <TableHead>Method</TableHead>
//                       <TableHead>Description</TableHead>
//                       <TableHead>Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {loading ? (
//                       <TableRow>
//                         <TableCell colSpan={7} className="text-center py-8 text-slate-500">
//                           Loading receipts...
//                         </TableCell>
//                       </TableRow>
//                     ) : receipts.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={7} className="text-center py-8 text-slate-500">
//                           No receipts generated yet
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       receipts.map((receipt) => (
//                         <TableRow key={receipt.id}>
//                           <TableCell className="font-mono font-semibold">{receipt.receipt_number}</TableCell>
//                           <TableCell>{receipt.payment_date ? format(new Date(receipt.payment_date), 'dd MMM yyyy') : '-'}</TableCell>
//                           <TableCell>
//                             <div>
//                               <p className="font-medium">{receipt.tenants.full_name}</p>
//                               <p className="text-sm text-slate-500">{receipt.tenants.email}</p>
//                             </div>
//                           </TableCell>
//                           <TableCell className="font-semibold">₹{receipt.amount.toLocaleString()}</TableCell>
//                           <TableCell className="capitalize">{receipt.payment_method || '-'}</TableCell>
//                           <TableCell className="text-sm text-slate-600">{receipt.description}</TableCell>
//                           <TableCell>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => downloadReceipt(receipt)}
//                             >
//                               <Download className="h-4 w-4 mr-2" />
//                               Download
//                             </Button>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   </div>
// </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, CreditCard, FileText, Download, Search, 
  DollarSign, AlertCircle, CheckCircle, XCircle, Bell, Send,
  Filter, ChevronDown, Calendar
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import tenant API
import { listTenants, type Tenant } from '@/lib/tenantApi';

// Define types locally
type PaymentRecord = {
  id: string | number;
  tenant_id: string | number;
  booking_id?: string | number | null;
  amount: number;
  payment_date: string;
  payment_mode: string;
  transaction_id?: string | null;
  status: string;
  month?: string | null;
  year?: number | null;
  due_date?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
};

type Receipt = {
  id: string | number;
  receipt_number: string;
  payment_id: string | number;
  tenant_id: string | number;
  amount: number;
  payment_method?: string;
  payment_date: string;
  description?: string;
  is_cancelled?: boolean;
  created_at?: string;
  tenants?: {
    full_name: string;
    email?: string;
    phone?: string;
  };
};

// API functions
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('admin_token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }
  
  return response.json();
}

async function listPaymentRecords(filters?: any) {
  const params = new URLSearchParams(filters).toString();
  return fetchApi(`/api/payments${params ? `?${params}` : ''}`);
}

async function createPaymentRecord(data: any) {
  return fetchApi('/api/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function updatePaymentRecordStatus(id: string | number, status: string) {
  return fetchApi(`/api/payments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

async function listReceipts(filters?: any) {
  const params = new URLSearchParams(filters).toString();
  return fetchApi(`/api/receipts${params ? `?${params}` : ''}`);
}

async function createReceipt(data: any) {
  return fetchApi('/api/receipts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function getPaymentStats() {
  return fetchApi('/api/payments/stats');
}

// Fetch active bookings for a tenant from bookings table
async function fetchTenantBookings(tenantId: string) {
  return fetchApi(`/api/bookings?tenant_id=${tenantId}&status=active`);
}

export default function PaymentsPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantBooking, setTenantBooking] = useState<{ id: number; booking_type: string; monthly_rent: number; room_id: number } | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isDemandPaymentOpen, setIsDemandPaymentOpen] = useState(false);
  
  // Column filters
  const [filters, setFilters] = useState({
    date: '',
    tenant: '',
    notes: '',
    amount: '',
    method: '',
    transactionId: '',
    dueDate: '',
    status: ''
  });

  const [stats, setStats] = useState({
    total_collected: 0,
    pending_amount: 0,
    total_transactions: 0,
    online_payments: 0,
    cash_payments: 0,
    card_payments: 0,
    bank_transfers: 0,
    cheque_payments: 0
  });

  const [newPayment, setNewPayment] = useState({
    tenant_id: '',
    booking_id: null as string | null,
    payment_type: 'rent',
    amount: '',
    payment_mode: 'cash',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'completed',
    notes: ''
  });

  const [demandPayment, setDemandPayment] = useState({
    tenant_id: '',
    payment_type: 'rent',
    amount: 0,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    include_late_fee: false,
    late_fee_amount: 0,
    send_email: true,
    send_sms: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPayments(),
        loadReceipts(),
        loadTenants(),
        loadStats()
      ]);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load data', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await listPaymentRecords();
      setPayments(data.data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const loadReceipts = async () => {
    try {
      const data = await listReceipts({ is_cancelled: false });
      setReceipts(data.data || []);
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

  const loadTenants = async () => {
    try {
      const result = await listTenants({ is_active: true });
      if (result.success && result.data) {
        setTenants(result.data);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getPaymentStats();
      setStats({
        total_collected: data.data?.total_collected || 0,
        pending_amount: data.data?.pending_amount || 0,
        total_transactions: data.data?.total_transactions || 0,
        online_payments: data.data?.online_payments || 0,
        cash_payments: data.data?.cash_payments || 0,
        card_payments: data.data?.card_payments || 0,
        bank_transfers: data.data?.bank_transfers || 0,
        cheque_payments: data.data?.cheque_payments || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleTenantSelect = async (tenantId: string) => {
    setNewPayment(prev => ({ ...prev, tenant_id: tenantId, booking_id: null, amount: '' }));
    setTenantBooking(null);
    if (!tenantId) return;

    setBookingLoading(true);
    try {
      const result = await fetchTenantBookings(tenantId);
      const bookings = result.data || [];
      if (bookings.length > 0) {
        const active = bookings[0];
        setTenantBooking(active);
        setNewPayment(prev => ({
          ...prev,
          tenant_id: tenantId,
          booking_id: String(active.id),
          amount: active.monthly_rent ? String(active.monthly_rent) : prev.amount,
        }));
      }
    } catch (err) {
      console.warn('Could not fetch tenant booking:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.tenant_id || !newPayment.amount) {
      toast({
        title: 'Validation Error',
        description: 'Please select a tenant and enter an amount',
        variant: 'destructive'
      });
      return;
    }

    if (!newPayment.payment_mode) {
      toast({
        title: 'Validation Error',
        description: 'Please select a payment mode',
        variant: 'destructive'
      });
      return;
    }

    try {
      const payload = {
        tenant_id: newPayment.tenant_id,
        booking_id: newPayment.booking_id ? Number(newPayment.booking_id) : null,
        payment_type: newPayment.payment_type,
        amount: parseFloat(newPayment.amount),
        payment_mode: newPayment.payment_mode,
        transaction_id: newPayment.transaction_id || null,
        payment_date: newPayment.payment_date,
        due_date: newPayment.due_date || null,
        status: newPayment.status,
        notes: newPayment.notes || null,
      };

      const result = await createPaymentRecord(payload);

      if (result.success) {
        if (newPayment.status === 'completed' && result.data?.id) {
          try {
            await createReceipt({
              payment_id: result.data.id,
              tenant_id: newPayment.tenant_id,
              amount: parseFloat(newPayment.amount),
              payment_method: newPayment.payment_mode,
              payment_date: newPayment.payment_date,
              description: `Payment for ${newPayment.payment_type}`,
            });
          } catch (receiptError) {
            console.warn('Receipt creation failed (non-critical):', receiptError);
          }
        }

        toast({ 
          title: 'Success', 
          description: 'Payment added successfully' 
        });
        
        setIsAddPaymentOpen(false);
        resetPaymentForm();
        await loadData();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to add payment',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to add payment', 
        variant: 'destructive' 
      });
    }
  };

  const handleDemandPayment = async () => {
    if (!demandPayment.tenant_id || !demandPayment.amount || !demandPayment.due_date) {
      toast({
        title: 'Validation Error',
        description: 'Please select tenant, enter amount, and set due date',
        variant: 'destructive'
      });
      return;
    }

    try {
      const totalAmount = demandPayment.include_late_fee && demandPayment.late_fee_amount > 0
        ? demandPayment.amount + demandPayment.late_fee_amount
        : demandPayment.amount;

      const paymentPayload = {
        tenant_id: demandPayment.tenant_id,
        booking_id: tenantBooking?.id ? Number(tenantBooking.id) : null,
        amount: totalAmount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_mode: 'cash',
        status: 'pending',
        notes: demandPayment.description
          ? `${demandPayment.description}${demandPayment.include_late_fee ? ` (Late fee: ₹${demandPayment.late_fee_amount})` : ''}`
          : demandPayment.include_late_fee ? `Late fee included: ₹${demandPayment.late_fee_amount}` : null,
        due_date: demandPayment.due_date
      };

      const result = await createPaymentRecord(paymentPayload);

      if (result.success) {
        toast({ 
          title: 'Success', 
          description: 'Payment demand created successfully' 
        });
        
        setIsDemandPaymentOpen(false);
        resetDemandPaymentForm();
        await loadData();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to create payment demand',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create payment demand', 
        variant: 'destructive' 
      });
    }
  };

  const resetPaymentForm = () => {
    setTenantBooking(null);
    setNewPayment({
      tenant_id: '',
      booking_id: null,
      payment_type: 'rent',
      amount: '',
      payment_mode: 'cash',
      transaction_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      due_date: '',
      status: 'completed',
      notes: ''
    });
  };

  const resetDemandPaymentForm = () => {
    setDemandPayment({
      tenant_id: '',
      payment_type: 'rent',
      amount: 0,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
      include_late_fee: false,
      late_fee_amount: 0,
      send_email: true,
      send_sms: false
    });
  };

  const updatePaymentStatus = async (paymentId: string | number, newStatus: string) => {
    try {
      const result = await updatePaymentRecordStatus(paymentId, newStatus);

      if (result.success) {
        toast({ 
          title: 'Success', 
          description: 'Payment status updated' 
        });
        await loadData();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update payment status',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update payment status', 
        variant: 'destructive' 
      });
    }
  };

  const downloadReceipt = (receipt: Receipt) => {
    const receiptContent = `
ROOMAC - Payment Receipt
========================

Receipt Number: ${receipt.receipt_number}
Date: ${receipt.payment_date ? new Date(receipt.payment_date).toLocaleDateString() : ''}

Tenant: ${receipt.tenants?.full_name || ''}
Email: ${receipt.tenants?.email || ''}

Amount Paid: ₹${receipt.amount.toLocaleString()}
Payment Method: ${receipt.payment_method || 'N/A'}
Description: ${receipt.description || ''}

Thank you for your payment!
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${receipt.receipt_number || 'receipt'}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({ title: 'Success', description: 'Receipt downloaded' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', icon: any }> = {
      completed: { variant: 'default', icon: CheckCircle },
      pending: { variant: 'secondary', icon: AlertCircle },
      failed: { variant: 'destructive', icon: XCircle },
      refunded: { variant: 'outline', icon: XCircle }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 text-[10px] px-1.5 py-0">
        <Icon className="h-2.5 w-2.5" />
        {status}
      </Badge>
    );
  };

  // Filter payments based on all column filters
  const filteredPayments = payments.filter(payment => {
    const tenant = tenants.find(t => t.id.toString() === payment.tenant_id.toString());
    const tenantName = tenant?.full_name || payment.tenant_name || '';
    const tenantPhone = tenant?.phone || '';
    
    const matchesDate = !filters.date || 
      (payment.payment_date && format(new Date(payment.payment_date), 'dd MMM yyyy')
        .toLowerCase().includes(filters.date.toLowerCase()));
    
    const matchesTenant = !filters.tenant ||
      tenantName.toLowerCase().includes(filters.tenant.toLowerCase()) ||
      tenantPhone.toLowerCase().includes(filters.tenant.toLowerCase());
    
    const matchesNotes = !filters.notes ||
      (payment.notes && payment.notes.toLowerCase().includes(filters.notes.toLowerCase()));
    
    const matchesAmount = !filters.amount ||
      payment.amount.toString().includes(filters.amount);
    
    const matchesMethod = !filters.method ||
      (payment.payment_mode && payment.payment_mode.toLowerCase().includes(filters.method.toLowerCase()));
    
    const matchesTransactionId = !filters.transactionId ||
      (payment.transaction_id && payment.transaction_id.toLowerCase().includes(filters.transactionId.toLowerCase()));
    
    const matchesDueDate = !filters.dueDate ||
      (payment.due_date && format(new Date(payment.due_date), 'dd MMM yyyy')
        .toLowerCase().includes(filters.dueDate.toLowerCase()));
    
    const matchesStatus = !filters.status ||
      payment.status.toLowerCase().includes(filters.status.toLowerCase());

    return matchesDate && matchesTenant && matchesNotes && matchesAmount && 
           matchesMethod && matchesTransactionId && matchesDueDate && matchesStatus;
  });

  const getTenantName = (tenantId: string | number) => {
    const tenant = tenants.find(t => t.id.toString() === tenantId.toString());
    return tenant?.full_name || 'Unknown Tenant';
  };

  const getTenantPhone = (tenantId: string | number) => {
    const tenant = tenants.find(t => t.id.toString() === tenantId.toString());
    return tenant?.phone || '';
  };

  // Compact stat cards
  const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <Card className={`${bgColor} border-0 shadow-sm`}>
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
            <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
          </div>
          <div className={`p-1.5 rounded-lg ${color}`}>
            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader title="Payments" />

      <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
        {/* Compact Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          <StatCard
            title="Collected"
            value={`₹${stats?.total_collected?.toLocaleString() || '0'}`}
            icon={DollarSign}
            color="bg-blue-600"
            bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          />
          <StatCard
            title="Completed"
            value={`₹${stats?.total_collected?.toLocaleString() || '0'}`}
            icon={CheckCircle}
            color="bg-green-600"
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
          />
          <StatCard
            title="Pending"
            value={`₹${stats?.pending_amount?.toLocaleString() || '0'}`}
            icon={AlertCircle}
            color="bg-yellow-600"
            bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
          />
          <StatCard
            title="Transactions"
            value={stats?.total_transactions || 0}
            icon={CreditCard}
            color="bg-purple-600"
            bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          />
        </div>

        {/* Tabs Container - Now properly wrapping everything */}
        <Tabs defaultValue="payments" className="w-full">
          {/* Tabs Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <TabsList className="h-8 w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
              <TabsTrigger value="payments" className="text-xs px-3 py-1">Payments</TabsTrigger>
              <TabsTrigger value="receipts" className="text-xs px-3 py-1">Receipts</TabsTrigger>
            </TabsList>
            
            <div className="flex justify-end gap-2">
              <Button 
                size="sm" 
                className="h-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm flex-1 sm:flex-none"
                onClick={() => setIsAddPaymentOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Add Payment</span>
              </Button>
              <Button 
                size="sm"
                variant="outline" 
                className="h-8 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white flex-1 sm:flex-none"
                onClick={() => setIsDemandPaymentOpen(true)}
              >
                <Bell className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Demand</span>
              </Button>
            </div>
          </div>

          {/* Add Payment Dialog with Gradient Header */}
          <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
              <DialogHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-t-lg sticky top-0 z-10">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5" />
                  Record New Payment
                </DialogTitle>
                <DialogDescription className="text-blue-50 text-sm">
                  Add a new payment record for a tenant
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Tenant *</Label>
                    <Select value={newPayment.tenant_id} onValueChange={handleTenantSelect}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map(tenant => (
                          <SelectItem key={tenant.id} value={tenant.id.toString()}>
                            {tenant.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {bookingLoading && <p className="text-[10px] text-slate-400">Fetching booking...</p>}
                    {!bookingLoading && tenantBooking && (
                      <p className="text-[10px] text-green-600">Booking #{tenantBooking.id} · ₹{tenantBooking.monthly_rent}/mo</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Payment Type</Label>
                    <Select value={newPayment.payment_type} onValueChange={(value) => setNewPayment({ ...newPayment, payment_type: value })}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="security_deposit">Security Deposit</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Amount (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Payment Mode *</Label>
                    <Select value={newPayment.payment_mode} onValueChange={(value) => setNewPayment({ ...newPayment, payment_mode: value })}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Transaction ID</Label>
                    <Input
                      placeholder="Optional"
                      value={newPayment.transaction_id}
                      onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Status</Label>
                    <Select value={newPayment.status} onValueChange={(value) => setNewPayment({ ...newPayment, status: value })}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Payment Date</Label>
                    <Input
                      type="date"
                      value={newPayment.payment_date}
                      onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Due Date</Label>
                    <Input
                      type="date"
                      value={newPayment.due_date}
                      onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Notes</Label>
                  <Input
                    placeholder="Additional notes"
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <DialogFooter className="p-4 bg-slate-50 rounded-b-lg">
                <Button variant="outline" size="sm" onClick={() => setIsAddPaymentOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleAddPayment} className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
                  Add Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Demand Payment Dialog with Gradient Header */}
          <Dialog open={isDemandPaymentOpen} onOpenChange={setIsDemandPaymentOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
              <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-lg sticky top-0 z-10">
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5" />
                  Demand Payment
                </DialogTitle>
                <DialogDescription className="text-orange-50 text-sm">
                  Create a payment request and notify the tenant
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Tenant *</Label>
                    <Select value={demandPayment.tenant_id.toString()} onValueChange={(value) => setDemandPayment({ ...demandPayment, tenant_id: value })}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map(tenant => (
                          <SelectItem key={tenant.id} value={tenant.id.toString()}>
                            {tenant.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Payment Type</Label>
                    <Select value={demandPayment.payment_type} onValueChange={(value) => setDemandPayment({ ...demandPayment, payment_type: value })}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="security_deposit">Security Deposit</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="electricity">Electricity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Amount (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={demandPayment.amount || ''}
                      onChange={(e) => setDemandPayment({ ...demandPayment, amount: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Due Date *</Label>
                    <Input
                      type="date"
                      value={demandPayment.due_date}
                      onChange={(e) => setDemandPayment({ ...demandPayment, due_date: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Description</Label>
                  <Textarea
                    placeholder="Enter payment description"
                    value={demandPayment.description}
                    onChange={(e) => setDemandPayment({ ...demandPayment, description: e.target.value })}
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Late Fee Settings</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="include-late-fee"
                        checked={demandPayment.include_late_fee}
                        onChange={(e) => setDemandPayment({ ...demandPayment, include_late_fee: e.target.checked })}
                        className="h-3 w-3"
                      />
                      <Label htmlFor="include-late-fee" className="text-xs">Include</Label>
                    </div>
                  </div>

                  {demandPayment.include_late_fee && (
                    <Input
                      type="number"
                      placeholder="Late fee amount"
                      value={demandPayment.late_fee_amount || ''}
                      onChange={(e) => setDemandPayment({ ...demandPayment, late_fee_amount: parseFloat(e.target.value) || 0 })}
                      className="h-8 text-sm"
                    />
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                  <Label className="text-xs font-medium">Notifications</Label>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1">
                      <input type="checkbox" id="send-email" checked={demandPayment.send_email} onChange={(e) => setDemandPayment({ ...demandPayment, send_email: e.target.checked })} className="h-3 w-3" />
                      <Label htmlFor="send-email" className="text-xs">Email</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="checkbox" id="send-sms" checked={demandPayment.send_sms} onChange={(e) => setDemandPayment({ ...demandPayment, send_sms: e.target.checked })} className="h-3 w-3" />
                      <Label htmlFor="send-sms" className="text-xs">SMS</Label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-4 bg-slate-50 rounded-b-lg">
                <Button variant="outline" size="sm" onClick={() => setIsDemandPaymentOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={handleDemandPayment} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                  <Send className="h-3.5 w-3.5 mr-1" />
                  Send Demand
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Payments Tab Content */}
          <TabsContent value="payments" className="space-y-2 mt-0">
            <Card className="overflow-hidden border-0 shadow-sm">
              <div className="relative">
                {/* Sticky Header Table */}
                <div className="overflow-auto max-h-[calc(100vh-280px)]">
                  <Table>
                    <TableHeader className="sticky top-0 z-20 bg-white">
                      {/* Column Headers */}
                      <TableRow className="bg-slate-100">
                        <TableHead className="text-xs font-semibold py-2">Date</TableHead>
                        <TableHead className="text-xs font-semibold py-2">Tenant</TableHead>
                        <TableHead className="text-xs font-semibold py-2">Notes</TableHead>
                        <TableHead className="text-xs font-semibold py-2">Amount</TableHead>
                        <TableHead className="text-xs font-semibold py-2">Method</TableHead>
                        <TableHead className="text-xs font-semibold py-2">Transaction ID</TableHead>
                        <TableHead className="text-xs font-semibold py-2">Due Date</TableHead>
                        <TableHead className="text-xs font-semibold py-2">Status</TableHead>
                        <TableHead className="text-xs font-semibold py-2">Actions</TableHead>
                      </TableRow>
                      
                      {/* Filter Row - Also Sticky */}
                      <TableRow className="bg-slate-50 sticky top-[41px] z-20">
                        <TableHead className="p-1">
                          <Input
                            placeholder="Filter"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </TableHead>
                        <TableHead className="p-1">
                          <Input
                            placeholder="Filter"
                            value={filters.tenant}
                            onChange={(e) => setFilters({ ...filters, tenant: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </TableHead>
                        <TableHead className="p-1">
                          <Input
                            placeholder="Filter"
                            value={filters.notes}
                            onChange={(e) => setFilters({ ...filters, notes: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </TableHead>
                        <TableHead className="p-1">
                          <Input
                            placeholder="Filter"
                            value={filters.amount}
                            onChange={(e) => setFilters({ ...filters, amount: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </TableHead>
                        <TableHead className="p-1">
                          <Input
                            placeholder="Filter"
                            value={filters.method}
                            onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </TableHead>
                        <TableHead className="p-1">
                          <Input
                            placeholder="Filter"
                            value={filters.transactionId}
                            onChange={(e) => setFilters({ ...filters, transactionId: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </TableHead>
                        <TableHead className="p-1">
                          <Input
                            placeholder="Filter"
                            value={filters.dueDate}
                            onChange={(e) => setFilters({ ...filters, dueDate: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </TableHead>
                        <TableHead className="p-1">
                          <Input
                            placeholder="Filter"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </TableHead>
                        <TableHead className="p-1"></TableHead>
                      </TableRow>
                    </TableHeader>
                    
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-xs text-slate-500">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
                              Loading payments...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-xs text-slate-500">
                            <CreditCard className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                            No payments found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPayments.map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-slate-50">
                            <TableCell className="py-2 text-xs whitespace-nowrap">
                              {payment.payment_date ? format(new Date(payment.payment_date), 'dd/MM/yy') : '-'}
                            </TableCell>
                            <TableCell className="py-2">
                              <p className="text-xs font-medium whitespace-nowrap">{getTenantName(payment.tenant_id)}</p>
                              <p className="text-[10px] text-slate-500 whitespace-nowrap">{getTenantPhone(payment.tenant_id)}</p>
                            </TableCell>
                            <TableCell className="py-2 text-xs max-w-[120px] truncate">
                              {payment.notes || '-'}
                            </TableCell>
                            <TableCell className="py-2 text-xs font-medium whitespace-nowrap">
                              ₹{payment.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="py-2 text-xs capitalize whitespace-nowrap">
                              {payment.payment_mode || '-'}
                            </TableCell>
                            <TableCell className="py-2 text-[10px] font-mono whitespace-nowrap">
                              {payment.transaction_id ? payment.transaction_id.substring(0, 8) + '...' : '-'}
                            </TableCell>
                            <TableCell className="py-2 text-xs whitespace-nowrap">
                              {payment.due_date ? format(new Date(payment.due_date), 'dd/MM/yy') : '-'}
                            </TableCell>
                            <TableCell className="py-2 whitespace-nowrap">
                              {getStatusBadge(payment.status)}
                            </TableCell>
                            <TableCell className="py-2 whitespace-nowrap">
                              {payment.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2"
                                  onClick={() => updatePaymentStatus(payment.id, 'completed')}
                                >
                                  Mark Paid
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Receipts Tab Content */}
          <TabsContent value="receipts" className="mt-0">
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-t-lg sticky top-0 z-10">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  Payment Receipts
                </CardTitle>
                <CardDescription className="text-blue-50 text-xs">
                  View and download payment receipts
                </CardDescription>
              </CardHeader>

              <CardContent className="p-2">
                <div className="overflow-auto max-h-[calc(100vh-380px)]">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white">
                      <TableRow className="bg-slate-100">
                        <TableHead className="text-xs py-2">Receipt No.</TableHead>
                        <TableHead className="text-xs py-2">Date</TableHead>
                        <TableHead className="text-xs py-2">Tenant</TableHead>
                        <TableHead className="text-xs py-2">Amount</TableHead>
                        <TableHead className="text-xs py-2">Method</TableHead>
                        <TableHead className="text-xs py-2">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
                              Loading receipts...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : receipts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                            No receipts found
                          </TableCell>
                        </TableRow>
                      ) : (
                        receipts.map((receipt) => {
                          const tenant = tenants.find(t => t.id.toString() === receipt.tenant_id.toString());
                          return (
                            <TableRow key={receipt.id}>
                              <TableCell className="py-2 text-xs font-mono whitespace-nowrap">
                                {receipt.receipt_number}
                              </TableCell>
                              <TableCell className="py-2 text-xs whitespace-nowrap">
                                {receipt.payment_date ? format(new Date(receipt.payment_date), 'dd/MM/yy') : '-'}
                              </TableCell>
                              <TableCell className="py-2">
                                <p className="text-xs whitespace-nowrap">{tenant?.full_name || 'N/A'}</p>
                              </TableCell>
                              <TableCell className="py-2 text-xs font-medium whitespace-nowrap">
                                ₹{receipt.amount.toLocaleString()}
                              </TableCell>
                              <TableCell className="py-2 text-xs capitalize whitespace-nowrap">
                                {receipt.payment_method || '-'}
                              </TableCell>
                              <TableCell className="py-2 whitespace-nowrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] px-2"
                                  onClick={() => downloadReceipt(receipt)}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}