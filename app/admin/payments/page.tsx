// app/admin/payments/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// // import { AdminHeader } from '@/components/admin/admin-header';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Plus, CreditCard, FileText, Download, Search, 
//   DollarSign, AlertCircle, CheckCircle, XCircle, Bell, Send,
//   Filter, ChevronDown, Calendar,
//   IndianRupee,
//   X
// } from 'lucide-react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { useToast } from '@/hooks/use-toast';
// import { format } from 'date-fns';
// import { Textarea } from '@/components/ui/textarea';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// // Import tenant API
// import { listTenants, type Tenant } from '@/lib/tenantApi';

// // Define types locally
// type PaymentRecord = {
//   id: string | number;
//   tenant_id: string | number;
//   booking_id?: string | number | null;
//   amount: number;
//   payment_date: string;
//   payment_mode: string;
//   transaction_id?: string | null;
//   status: string;
//   month?: string | null;
//   year?: number | null;
//   due_date?: string | null;
//   notes?: string | null;
//   created_at?: string;
//   updated_at?: string;
//   tenant_name?: string;
//   tenant_email?: string;
//   tenant_phone?: string;
// };

// type Receipt = {
//   id: string | number;
//   receipt_number: string;
//   payment_id: string | number;
//   tenant_id: string | number;
//   amount: number;
//   payment_method?: string;
//   payment_date: string;
//   description?: string;
//   is_cancelled?: boolean;
//   created_at?: string;
//   tenants?: {
//     full_name: string;
//     email?: string;
//     phone?: string;
//   };
// };

// // API functions
// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
//   const token = localStorage.getItem('auth_token');
//   const response = await fetch(`${API_BASE}${path}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
//       ...options.headers,
//     },
//   });
  
//   if (!response.ok) {
//     const error = await response.text();
//     throw new Error(error || response.statusText);
//   }
  
//   return response.json();
// }

// async function listPaymentRecords(filters?: any) {
//   const params = new URLSearchParams(filters).toString();
//   return fetchApi(`/api/payments${params ? `?${params}` : ''}`);
// }

// async function createPaymentRecord(data: any) {
//   return fetchApi('/api/payments', {
//     method: 'POST',
//     body: JSON.stringify(data),
//   });
// }

// async function updatePaymentRecordStatus(id: string | number, status: string) {
//   return fetchApi(`/api/payments/${id}/status`, {
//     method: 'PATCH',
//     body: JSON.stringify({ status }),
//   });
// }

// async function listReceipts(filters?: any) {
//   const params = new URLSearchParams(filters).toString();
//   return fetchApi(`/api/receipts${params ? `?${params}` : ''}`);
// }

// async function createReceipt(data: any) {
//   return fetchApi('/api/receipts', {
//     method: 'POST',
//     body: JSON.stringify(data),
//   });
// }

// async function getPaymentStats() {
//   return fetchApi('/api/payments/stats');
// }

// // Fetch active bookings for a tenant from bookings table
// async function fetchTenantBookings(tenantId: string) {
//   return fetchApi(`/api/bookings?tenant_id=${tenantId}&status=active`);
// }

// export default function PaymentsPage() {
//   const { toast } = useToast();
//   const [payments, setPayments] = useState<PaymentRecord[]>([]);
//   const [receipts, setReceipts] = useState<Receipt[]>([]);
//   const [tenants, setTenants] = useState<Tenant[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [tenantBooking, setTenantBooking] = useState<{ id: number; booking_type: string; monthly_rent: number; room_id: number } | null>(null);
//   const [bookingLoading, setBookingLoading] = useState(false);
//   const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
//   const [isDemandPaymentOpen, setIsDemandPaymentOpen] = useState(false);
  
//   // Column filters
//   const [filters, setFilters] = useState({
//     date: '',
//     tenant: '',
//     notes: '',
//     amount: '',
//     method: '',
//     transactionId: '',
//     dueDate: '',
//     status: ''
//   });

//   const [stats, setStats] = useState({
//     total_collected: 0,
//     pending_amount: 0,
//     total_transactions: 0,
//     online_payments: 0,
//     cash_payments: 0,
//     card_payments: 0,
//     bank_transfers: 0,
//     cheque_payments: 0
//   });

//   const [newPayment, setNewPayment] = useState({
//     tenant_id: '',
//     booking_id: null as string | null,
//     payment_type: 'rent',
//     amount: '',
//     payment_mode: 'cash',
//     transaction_id: '',
//     payment_date: new Date().toISOString().split('T')[0],
//     due_date: '',
//     status: 'completed',
//     notes: ''
//   });

//   const [demandPayment, setDemandPayment] = useState({
//     tenant_id: '',
//     payment_type: 'rent',
//     amount: 0,
//     due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//     description: '',
//     include_late_fee: false,
//     late_fee_amount: 0,
//     send_email: true,
//     send_sms: false
//   });

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       await Promise.all([
//         loadPayments(),
//         loadReceipts(),
//         loadTenants(),
//         loadStats()
//       ]);
//     } catch (error) {
//       toast({ 
//         title: 'Error', 
//         description: 'Failed to load data', 
//         variant: 'destructive' 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadPayments = async () => {
//     try {
//       const data = await listPaymentRecords();
//       setPayments(data.data || []);
//     } catch (error) {
//       console.error('Error loading payments:', error);
//     }
//   };

//   const loadReceipts = async () => {
//     try {
//       const data = await listReceipts({ is_cancelled: false });
//       setReceipts(data.data || []);
//     } catch (error) {
//       console.error('Error loading receipts:', error);
//     }
//   };

//   const loadTenants = async () => {
//     try {
//       const result = await listTenants({ is_active: true });
//       if (result.success && result.data) {
//         setTenants(result.data);
//       }
//     } catch (error) {
//       console.error('Error loading tenants:', error);
//     }
//   };

//   const loadStats = async () => {
//     try {
//       const data = await getPaymentStats();
//       setStats({
//         total_collected: data.data?.total_collected || 0,
//         pending_amount: data.data?.pending_amount || 0,
//         total_transactions: data.data?.total_transactions || 0,
//         online_payments: data.data?.online_payments || 0,
//         cash_payments: data.data?.cash_payments || 0,
//         card_payments: data.data?.card_payments || 0,
//         bank_transfers: data.data?.bank_transfers || 0,
//         cheque_payments: data.data?.cheque_payments || 0
//       });
//     } catch (error) {
//       console.error('Error loading stats:', error);
//     }
//   };

//   const handleTenantSelect = async (tenantId: string) => {
//     setNewPayment(prev => ({ ...prev, tenant_id: tenantId, booking_id: null, amount: '' }));
//     setTenantBooking(null);
//     if (!tenantId) return;

//     setBookingLoading(true);
//     try {
//       const result = await fetchTenantBookings(tenantId);
//       const bookings = result.data || [];
//       if (bookings.length > 0) {
//         const active = bookings[0];
//         setTenantBooking(active);
//         setNewPayment(prev => ({
//           ...prev,
//           tenant_id: tenantId,
//           booking_id: String(active.id),
//           amount: active.monthly_rent ? String(active.monthly_rent) : prev.amount,
//         }));
//       }
//     } catch (err) {
//       console.warn('Could not fetch tenant booking:', err);
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   const handleAddPayment = async () => {
//     if (!newPayment.tenant_id || !newPayment.amount) {
//       toast({
//         title: 'Validation Error',
//         description: 'Please select a tenant and enter an amount',
//         variant: 'destructive'
//       });
//       return;
//     }

//     if (!newPayment.payment_mode) {
//       toast({
//         title: 'Validation Error',
//         description: 'Please select a payment mode',
//         variant: 'destructive'
//       });
//       return;
//     }

//     try {
//       const payload = {
//         tenant_id: newPayment.tenant_id,
//         booking_id: newPayment.booking_id ? Number(newPayment.booking_id) : null,
//         payment_type: newPayment.payment_type,
//         amount: parseFloat(newPayment.amount),
//         payment_mode: newPayment.payment_mode,
//         transaction_id: newPayment.transaction_id || null,
//         payment_date: newPayment.payment_date,
//         due_date: newPayment.due_date || null,
//         status: newPayment.status,
//         notes: newPayment.notes || null,
//       };

//       const result = await createPaymentRecord(payload);

//       if (result.success) {
//         if (newPayment.status === 'completed' && result.data?.id) {
//           try {
//             await createReceipt({
//               payment_id: result.data.id,
//               tenant_id: newPayment.tenant_id,
//               amount: parseFloat(newPayment.amount),
//               payment_method: newPayment.payment_mode,
//               payment_date: newPayment.payment_date,
//               description: `Payment for ${newPayment.payment_type}`,
//             });
//           } catch (receiptError) {
//             console.warn('Receipt creation failed (non-critical):', receiptError);
//           }
//         }

//         toast({ 
//           title: 'Success', 
//           description: 'Payment added successfully' 
//         });
        
//         setIsAddPaymentOpen(false);
//         resetPaymentForm();
//         await loadData();
//       } else {
//         toast({
//           title: 'Error',
//           description: result.message || 'Failed to add payment',
//           variant: 'destructive'
//         });
//       }
//     } catch (error: any) {
//       toast({ 
//         title: 'Error', 
//         description: error.message || 'Failed to add payment', 
//         variant: 'destructive' 
//       });
//     }
//   };

//   const handleDemandPayment = async () => {
//     if (!demandPayment.tenant_id || !demandPayment.amount || !demandPayment.due_date) {
//       toast({
//         title: 'Validation Error',
//         description: 'Please select tenant, enter amount, and set due date',
//         variant: 'destructive'
//       });
//       return;
//     }

//     try {
//       const totalAmount = demandPayment.include_late_fee && demandPayment.late_fee_amount > 0
//         ? demandPayment.amount + demandPayment.late_fee_amount
//         : demandPayment.amount;

//       const paymentPayload = {
//         tenant_id: demandPayment.tenant_id,
//         booking_id: tenantBooking?.id ? Number(tenantBooking.id) : null,
//         amount: totalAmount,
//         payment_date: new Date().toISOString().split('T')[0],
//         payment_mode: 'cash',
//         status: 'pending',
//         notes: demandPayment.description
//           ? `${demandPayment.description}${demandPayment.include_late_fee ? ` (Late fee: ₹${demandPayment.late_fee_amount})` : ''}`
//           : demandPayment.include_late_fee ? `Late fee included: ₹${demandPayment.late_fee_amount}` : null,
//         due_date: demandPayment.due_date
//       };

//       const result = await createPaymentRecord(paymentPayload);

//       if (result.success) {
//         toast({ 
//           title: 'Success', 
//           description: 'Payment demand created successfully' 
//         });
        
//         setIsDemandPaymentOpen(false);
//         resetDemandPaymentForm();
//         await loadData();
//       } else {
//         toast({
//           title: 'Error',
//           description: result.message || 'Failed to create payment demand',
//           variant: 'destructive'
//         });
//       }
//     } catch (error: any) {
//       toast({ 
//         title: 'Error', 
//         description: error.message || 'Failed to create payment demand', 
//         variant: 'destructive' 
//       });
//     }
//   };

//   const resetPaymentForm = () => {
//     setTenantBooking(null);
//     setNewPayment({
//       tenant_id: '',
//       booking_id: null,
//       payment_type: 'rent',
//       amount: '',
//       payment_mode: 'cash',
//       transaction_id: '',
//       payment_date: new Date().toISOString().split('T')[0],
//       due_date: '',
//       status: 'completed',
//       notes: ''
//     });
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

//   const updatePaymentStatus = async (paymentId: string | number, newStatus: string) => {
//     try {
//       const result = await updatePaymentRecordStatus(paymentId, newStatus);

//       if (result.success) {
//         toast({ 
//           title: 'Success', 
//           description: 'Payment status updated' 
//         });
//         await loadData();
//       } else {
//         toast({
//           title: 'Error',
//           description: result.message || 'Failed to update payment status',
//           variant: 'destructive'
//         });
//       }
//     } catch (error: any) {
//       toast({ 
//         title: 'Error', 
//         description: error.message || 'Failed to update payment status', 
//         variant: 'destructive' 
//       });
//     }
//   };

//   const downloadReceipt = (receipt: Receipt) => {
//     const receiptContent = `
// ROOMAC - Payment Receipt
// ========================

// Receipt Number: ${receipt.receipt_number}
// Date: ${receipt.payment_date ? new Date(receipt.payment_date).toLocaleDateString() : ''}

// Tenant: ${receipt.tenants?.full_name || ''}
// Email: ${receipt.tenants?.email || ''}

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

//     toast({ title: 'Success', description: 'Receipt downloaded' });
//   };

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', icon: any }> = {
//       completed: { variant: 'default', icon: CheckCircle },
//       pending: { variant: 'secondary', icon: AlertCircle },
//       failed: { variant: 'destructive', icon: XCircle },
//       refunded: { variant: 'outline', icon: XCircle }
//     };

//     const config = variants[status] || variants.pending;
//     const Icon = config.icon;

//     return (
//       <Badge variant={config.variant} className="flex items-center gap-1 text-[10px] px-1.5 py-0">
//         <Icon className="h-2.5 w-2.5" />
//         {status}
//       </Badge>
//     );
//   };

//   // Filter payments based on all column filters
//   const filteredPayments = payments.filter(payment => {
//     const tenant = tenants.find(t => t.id.toString() === payment.tenant_id.toString());
//     const tenantName = tenant?.full_name || payment.tenant_name || '';
//     const tenantPhone = tenant?.phone || '';
    
//     const matchesDate = !filters.date || 
//       (payment.payment_date && format(new Date(payment.payment_date), 'dd MMM yyyy')
//         .toLowerCase().includes(filters.date.toLowerCase()));
    
//     const matchesTenant = !filters.tenant ||
//       tenantName.toLowerCase().includes(filters.tenant.toLowerCase()) ||
//       tenantPhone.toLowerCase().includes(filters.tenant.toLowerCase());
    
//     const matchesNotes = !filters.notes ||
//       (payment.notes && payment.notes.toLowerCase().includes(filters.notes.toLowerCase()));
    
//     const matchesAmount = !filters.amount ||
//       payment.amount.toString().includes(filters.amount);
    
//     const matchesMethod = !filters.method ||
//       (payment.payment_mode && payment.payment_mode.toLowerCase().includes(filters.method.toLowerCase()));
    
//     const matchesTransactionId = !filters.transactionId ||
//       (payment.transaction_id && payment.transaction_id.toLowerCase().includes(filters.transactionId.toLowerCase()));
    
//     const matchesDueDate = !filters.dueDate ||
//       (payment.due_date && format(new Date(payment.due_date), 'dd MMM yyyy')
//         .toLowerCase().includes(filters.dueDate.toLowerCase()));
    
//     const matchesStatus = !filters.status ||
//       payment.status.toLowerCase().includes(filters.status.toLowerCase());

//     return matchesDate && matchesTenant && matchesNotes && matchesAmount && 
//            matchesMethod && matchesTransactionId && matchesDueDate && matchesStatus;
//   });

//   const getTenantName = (tenantId: string | number) => {
//     const tenant = tenants.find(t => t.id.toString() === tenantId.toString());
//     return tenant?.full_name || 'Unknown Tenant';
//   };

//   const getTenantPhone = (tenantId: string | number) => {
//     const tenant = tenants.find(t => t.id.toString() === tenantId.toString());
//     return tenant?.phone || '';
//   };

//   // Compact stat cards
//   const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
//     <Card className={`${bgColor} border-0 shadow-sm`}>
//       <CardContent className="p-2 sm:p-3">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
//             <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
//           </div>
//           <div className={`p-1.5 rounded-lg ${color}`}>
//             <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );

//   return (
//     <div className=" bg-slate-50">
//       {/* <AdminHeader title="Payments" /> */}

//       <div className="p-0 sm:p-0 md:p-0 space-y-2 sm:space-y-3">
//         {/* Compact Stats Cards */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 sticky top-16 z-10">
//           <StatCard
//             title="Collected"
//             value={`₹${stats?.total_collected?.toLocaleString() || '0'}`}
//             icon={IndianRupee}
//             color="bg-blue-600"
//             bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
//           />
//           <StatCard
//             title="Completed"
//             value={`₹${stats?.total_collected?.toLocaleString() || '0'}`}
//             icon={CheckCircle}
//             color="bg-green-600"
//             bgColor="bg-gradient-to-br from-green-50 to-green-100"
//           />
//           <StatCard
//             title="Pending"
//             value={`₹${stats?.pending_amount?.toLocaleString() || '0'}`}
//             icon={AlertCircle}
//             color="bg-yellow-600"
//             bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
//           />
//           <StatCard
//             title="Transactions"
//             value={stats?.total_transactions || 0}
//             icon={CreditCard}
//             color="bg-purple-600"
//             bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
//           />
//         </div>

//         {/* Tabs Container - Now properly wrapping everything */}
//         <Tabs defaultValue="payments" className="w-full">
//           {/* Tabs Header Row */}
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sticky top-28 z-10">
//             <TabsList className="h-8 w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
//               <TabsTrigger value="payments" className="text-xs px-3 py-1">Payments</TabsTrigger>
//               <TabsTrigger value="receipts" className="text-xs px-3 py-1">Receipts</TabsTrigger>
//             </TabsList>
            
//             <div className="flex justify-end gap-2">
//               <Button 
//                 size="sm" 
//                 className="h-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm flex-1 sm:flex-none"
//                 onClick={() => setIsAddPaymentOpen(true)}
//               >
//                 <Plus className="h-3.5 w-3.5 mr-1" />
//                 <span className="text-xs">Add Payment</span>
//               </Button>
//               <Button 
//                 size="sm"
//                 variant="outline" 
//                 className="h-8 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white flex-1 sm:flex-none"
//                 onClick={() => setIsDemandPaymentOpen(true)}
//               >
//                 <Bell className="h-3.5 w-3.5 mr-1" />
//                 <span className="text-xs">Demand</span>
//               </Button>
//             </div>
//           </div>

//           {/* Add Payment Dialog with Gradient Header */}
//           <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
//             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
//              <DialogHeader className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-t-lg sticky top-0 z-10">
  
//   {/* Close Button */}
//   <DialogClose asChild>
//     <button className="absolute right-4 top-4 text-white/80 hover:text-white transition">
//       <X className="h-5 w-5" />
//     </button>
//   </DialogClose>

//   <DialogTitle className="flex items-center gap-2 text-lg">
//     <Plus className="h-5 w-5" />
//     Record New Payment
//   </DialogTitle>

//   <DialogDescription className="text-blue-50 text-sm">
//     Add a new payment record for a tenant
//   </DialogDescription>

// </DialogHeader>

//               <div className="p-4 space-y-3">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Tenant *</Label>
//                     <Select value={newPayment.tenant_id} onValueChange={handleTenantSelect}>
//                       <SelectTrigger className="h-8 text-sm">
//                         <SelectValue placeholder="Select tenant" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {tenants.map(tenant => (
//                           <SelectItem key={tenant.id} value={tenant.id.toString()}>
//                             {tenant.full_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {bookingLoading && <p className="text-[10px] text-slate-400">Fetching booking...</p>}
//                     {!bookingLoading && tenantBooking && (
//                       <p className="text-[10px] text-green-600">Booking #{tenantBooking.id} · ₹{tenantBooking.monthly_rent}/mo</p>
//                     )}
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Payment Type</Label>
//                     <Select value={newPayment.payment_type} onValueChange={(value) => setNewPayment({ ...newPayment, payment_type: value })}>
//                       <SelectTrigger className="h-8 text-sm">
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="rent">Rent</SelectItem>
//                         <SelectItem value="security_deposit">Security Deposit</SelectItem>
//                         <SelectItem value="maintenance">Maintenance</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Amount (₹) *</Label>
//                     <Input
//                       type="number"
//                       placeholder="Enter amount"
//                       value={newPayment.amount}
//                       onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
//                       className="h-8 text-sm"
//                     />
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Payment Mode *</Label>
//                     <Select value={newPayment.payment_mode} onValueChange={(value) => setNewPayment({ ...newPayment, payment_mode: value })}>
//                       <SelectTrigger className="h-8 text-sm">
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="cash">Cash</SelectItem>
//                         <SelectItem value="online">Online</SelectItem>
//                         <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
//                         <SelectItem value="cheque">Cheque</SelectItem>
//                         <SelectItem value="card">Card</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Transaction ID</Label>
//                     <Input
//                       placeholder="Optional"
//                       value={newPayment.transaction_id}
//                       onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })}
//                       className="h-8 text-sm"
//                     />
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Status</Label>
//                     <Select value={newPayment.status} onValueChange={(value) => setNewPayment({ ...newPayment, status: value })}>
//                       <SelectTrigger className="h-8 text-sm">
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="completed">Completed</SelectItem>
//                         <SelectItem value="pending">Pending</SelectItem>
//                         <SelectItem value="failed">Failed</SelectItem>
//                         <SelectItem value="refunded">Refunded</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Payment Date</Label>
//                     <Input
//                       type="date"
//                       value={newPayment.payment_date}
//                       onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
//                       className="h-8 text-sm"
//                     />
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Due Date</Label>
//                     <Input
//                       type="date"
//                       value={newPayment.due_date}
//                       onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
//                       className="h-8 text-sm"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <Label className="text-xs font-medium">Notes</Label>
//                   <Input
//                     placeholder="Additional notes"
//                     value={newPayment.notes}
//                     onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
//                     className="h-8 text-sm"
//                   />
//                 </div>
//               </div>

//              <DialogFooter className="p-4 bg-slate-50 rounded-b-lg grid grid-cols-2 gap-2 sm:flex sm:justify-end">
//   <Button
//     variant="outline"
//     size="sm"
//     onClick={() => setIsAddPaymentOpen(false)}
//     className="w-full sm:w-auto"
//   >
//     Cancel
//   </Button>

//   <Button
//     size="sm"
//     onClick={handleAddPayment}
//     className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
//   >
//     Add Payment
//   </Button>
// </DialogFooter>
//             </DialogContent>
//           </Dialog>

//           {/* Demand Payment Dialog with Gradient Header */}
//           <Dialog open={isDemandPaymentOpen} onOpenChange={setIsDemandPaymentOpen}>
//             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
//               <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-lg sticky top-0 z-10">
//                 {/* Close Button */}
//   <DialogClose asChild>
//     <button className="absolute right-4 top-4 text-white/80 hover:text-white transition">
//       <X className="h-5 w-5" />
//     </button>
//   </DialogClose>
//                 <DialogTitle className="flex items-center gap-2 text-lg">
//                   <Bell className="h-5 w-5" />
//                   Demand Payment
//                 </DialogTitle>
//                 <DialogDescription className="text-orange-50 text-sm">
//                   Create a payment request and notify the tenant
//                 </DialogDescription>
//               </DialogHeader>

//               <div className="p-4 space-y-3">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Tenant *</Label>
//                     <Select value={demandPayment.tenant_id.toString()} onValueChange={(value) => setDemandPayment({ ...demandPayment, tenant_id: value })}>
//                       <SelectTrigger className="h-8 text-sm">
//                         <SelectValue placeholder="Select tenant" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {tenants.map(tenant => (
//                           <SelectItem key={tenant.id} value={tenant.id.toString()}>
//                             {tenant.full_name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Payment Type</Label>
//                     <Select value={demandPayment.payment_type} onValueChange={(value) => setDemandPayment({ ...demandPayment, payment_type: value })}>
//                       <SelectTrigger className="h-8 text-sm">
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="rent">Rent</SelectItem>
//                         <SelectItem value="security_deposit">Security Deposit</SelectItem>
//                         <SelectItem value="maintenance">Maintenance</SelectItem>
//                         <SelectItem value="electricity">Electricity</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Amount (₹) *</Label>
//                     <Input
//                       type="number"
//                       placeholder="Enter amount"
//                       value={demandPayment.amount || ''}
//                       onChange={(e) => setDemandPayment({ ...demandPayment, amount: parseFloat(e.target.value) || 0 })}
//                       className="h-8 text-sm"
//                     />
//                   </div>

//                   <div className="space-y-1">
//                     <Label className="text-xs font-medium">Due Date *</Label>
//                     <Input
//                       type="date"
//                       value={demandPayment.due_date}
//                       onChange={(e) => setDemandPayment({ ...demandPayment, due_date: e.target.value })}
//                       className="h-8 text-sm"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <Label className="text-xs font-medium">Description</Label>
//                   <Textarea
//                     placeholder="Enter payment description"
//                     value={demandPayment.description}
//                     onChange={(e) => setDemandPayment({ ...demandPayment, description: e.target.value })}
//                     rows={2}
//                     className="text-sm"
//                   />
//                 </div>

//                 <div className="bg-slate-50 p-3 rounded-lg space-y-2">
//                   <div className="flex items-center justify-between">
//                     <Label className="text-xs font-medium">Late Fee Settings</Label>
//                     <div className="flex items-center gap-2">
//                       <input
//                         type="checkbox"
//                         id="include-late-fee"
//                         checked={demandPayment.include_late_fee}
//                         onChange={(e) => setDemandPayment({ ...demandPayment, include_late_fee: e.target.checked })}
//                         className="h-3 w-3"
//                       />
//                       <Label htmlFor="include-late-fee" className="text-xs">Include</Label>
//                     </div>
//                   </div>

//                   {demandPayment.include_late_fee && (
//                     <Input
//                       type="number"
//                       placeholder="Late fee amount"
//                       value={demandPayment.late_fee_amount || ''}
//                       onChange={(e) => setDemandPayment({ ...demandPayment, late_fee_amount: parseFloat(e.target.value) || 0 })}
//                       className="h-8 text-sm"
//                     />
//                   )}
//                 </div>

//                 <div className="bg-slate-50 p-3 rounded-lg space-y-2">
//                   <Label className="text-xs font-medium">Notifications</Label>
//                   <div className="flex gap-3">
//                     <div className="flex items-center gap-1">
//                       <input type="checkbox" id="send-email" checked={demandPayment.send_email} onChange={(e) => setDemandPayment({ ...demandPayment, send_email: e.target.checked })} className="h-3 w-3" />
//                       <Label htmlFor="send-email" className="text-xs">Email</Label>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <input type="checkbox" id="send-sms" checked={demandPayment.send_sms} onChange={(e) => setDemandPayment({ ...demandPayment, send_sms: e.target.checked })} className="h-3 w-3" />
//                       <Label htmlFor="send-sms" className="text-xs">SMS</Label>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//              <DialogFooter className="p-4 bg-slate-50 rounded-b-lg grid grid-cols-2 gap-2 sm:flex sm:justify-end">
//   <Button
//     variant="outline"
//     size="sm"
//     onClick={() => setIsDemandPaymentOpen(false)}
//     className="w-full sm:w-auto"
//   >
//     Cancel
//   </Button>

//   <Button
//     size="sm"
//     onClick={handleDemandPayment}
//     className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
//   >
//     <Send className="h-3.5 w-3.5 mr-1" />
//     Send Demand
//   </Button>
// </DialogFooter>
//             </DialogContent>
//           </Dialog>

//           {/* Payments Tab Content */}
//           <TabsContent value="payments" className="space-y-2 mt-0">
//             <Card className=" border-0 shadow-sm">
//               <div className="relative">
//                 {/* Sticky Header Table */}
//                 <div className="overflow-auto max-h-[calc(100vh-320px)] md:max-h-[calc(100vh-240px)]">
//                   <Table>
//                     <TableHeader className="sticky top-0 z-20 bg-white">
//                       {/* Column Headers */}
//                       <TableRow className="bg-slate-100">
//                         <TableHead className="text-xs font-semibold py-2">Date</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Tenant</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Notes</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Amount</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Method</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Transaction ID</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Due Date</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Status</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Actions</TableHead>
//                       </TableRow>
                      
//                       {/* Filter Row - Also Sticky */}
//                       <TableRow className="bg-slate-50 sticky top-[41px] z-20">
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.date}
//                             onChange={(e) => setFilters({ ...filters, date: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.tenant}
//                             onChange={(e) => setFilters({ ...filters, tenant: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.notes}
//                             onChange={(e) => setFilters({ ...filters, notes: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.amount}
//                             onChange={(e) => setFilters({ ...filters, amount: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.method}
//                             onChange={(e) => setFilters({ ...filters, method: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.transactionId}
//                             onChange={(e) => setFilters({ ...filters, transactionId: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.dueDate}
//                             onChange={(e) => setFilters({ ...filters, dueDate: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.status}
//                             onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1"></TableHead>
//                       </TableRow>
//                     </TableHeader>
                    
//                     <TableBody>
//                       {loading ? (
//                         <TableRow>
//                           <TableCell colSpan={9} className="text-center py-8 text-xs text-slate-500">
//                             <div className="flex justify-center items-center">
//                               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
//                               Loading payments...
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ) : filteredPayments.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={9} className="text-center py-8 text-xs text-slate-500">
//                             <CreditCard className="h-8 w-8 mx-auto mb-2 text-slate-300" />
//                             No payments found
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         filteredPayments.map((payment) => (
//                           <TableRow key={payment.id} className="hover:bg-slate-50">
//                             <TableCell className="py-2 text-xs whitespace-nowrap">
//                               {payment.payment_date ? format(new Date(payment.payment_date), 'dd/MM/yy') : '-'}
//                             </TableCell>
//                             <TableCell className="py-2">
//                               <p className="text-xs font-medium whitespace-nowrap">{getTenantName(payment.tenant_id)}</p>
//                               <p className="text-[10px] text-slate-500 whitespace-nowrap">{getTenantPhone(payment.tenant_id)}</p>
//                             </TableCell>
//                             <TableCell className="py-2 text-xs max-w-[120px] truncate">
//                               {payment.notes || '-'}
//                             </TableCell>
//                             <TableCell className="py-2 text-xs font-medium whitespace-nowrap">
//                               ₹{payment.amount.toLocaleString()}
//                             </TableCell>
//                             <TableCell className="py-2 text-xs capitalize whitespace-nowrap">
//                               {payment.payment_mode || '-'}
//                             </TableCell>
//                             <TableCell className="py-2 text-[10px] font-mono whitespace-nowrap">
//                               {payment.transaction_id ? payment.transaction_id.substring(0, 8) + '...' : '-'}
//                             </TableCell>
//                             <TableCell className="py-2 text-xs whitespace-nowrap">
//                               {payment.due_date ? format(new Date(payment.due_date), 'dd/MM/yy') : '-'}
//                             </TableCell>
//                             <TableCell className="py-2 whitespace-nowrap">
//                               {getStatusBadge(payment.status)}
//                             </TableCell>
//                             <TableCell className="py-2 whitespace-nowrap">
//                               {payment.status === 'pending' && (
//                                 <Button
//                                   size="sm"
//                                   variant="outline"
//                                   className="h-6 text-[10px] px-2"
//                                   onClick={() => updatePaymentStatus(payment.id, 'completed')}
//                                 >
//                                   Mark Paid
//                                 </Button>
//                               )}
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </div>
//             </Card>
//           </TabsContent>

//           {/* Receipts Tab Content */}
//           <TabsContent value="receipts" className="mt-0">
//             <Card className="border-0 shadow-sm">
//               <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-t-lg sticky top-0 z-10">
//                 <CardTitle className="flex items-center gap-2 text-sm">
//                   <FileText className="h-4 w-4" />
//                   Payment Receipts
//                 </CardTitle>
//                 <CardDescription className="text-blue-50 text-xs">
//                   View and download payment receipts
//                 </CardDescription>
//               </CardHeader>

//               <CardContent className="p-2">
//                 <div className="overflow-auto max-h-[calc(100vh-380px)]">
//                   <Table>
//                     <TableHeader className="sticky top-0 z-10 bg-white">
//                       <TableRow className="bg-slate-100">
//                         <TableHead className="text-xs py-2">Receipt No.</TableHead>
//                         <TableHead className="text-xs py-2">Date</TableHead>
//                         <TableHead className="text-xs py-2">Tenant</TableHead>
//                         <TableHead className="text-xs py-2">Amount</TableHead>
//                         <TableHead className="text-xs py-2">Method</TableHead>
//                         <TableHead className="text-xs py-2">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {loading ? (
//                         <TableRow>
//                           <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
//                             <div className="flex justify-center items-center">
//                               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
//                               Loading receipts...
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ) : receipts.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
//                             <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
//                             No receipts found
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         receipts.map((receipt) => {
//                           const tenant = tenants.find(t => t.id.toString() === receipt.tenant_id.toString());
//                           return (
//                             <TableRow key={receipt.id}>
//                               <TableCell className="py-2 text-xs font-mono whitespace-nowrap">
//                                 {receipt.receipt_number}
//                               </TableCell>
//                               <TableCell className="py-2 text-xs whitespace-nowrap">
//                                 {receipt.payment_date ? format(new Date(receipt.payment_date), 'dd/MM/yy') : '-'}
//                               </TableCell>
//                               <TableCell className="py-2">
//                                 <p className="text-xs whitespace-nowrap">{tenant?.full_name || 'N/A'}</p>
//                               </TableCell>
//                               <TableCell className="py-2 text-xs font-medium whitespace-nowrap">
//                                 ₹{receipt.amount.toLocaleString()}
//                               </TableCell>
//                               <TableCell className="py-2 text-xs capitalize whitespace-nowrap">
//                                 {receipt.payment_method || '-'}
//                               </TableCell>
//                               <TableCell className="py-2 whitespace-nowrap">
//                                 <Button
//                                   size="sm"
//                                   variant="outline"
//                                   className="h-6 text-[10px] px-2"
//                                   onClick={() => downloadReceipt(receipt)}
//                                 >
//                                   <Download className="h-3 w-3 mr-1" />
//                                   Download
//                                 </Button>
//                               </TableCell>
//                             </TableRow>
//                           );
//                         })
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }





// // app/admin/payments/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Plus, CreditCard, FileText, Download, Search, 
//   AlertCircle, CheckCircle, XCircle, Bell,
//   IndianRupee, X, Bed, User, CalendarDays,
//   Upload, Eye, Clock, TrendingUp, TrendingDown,
//   Building, MapPin, Wifi, Wind, Bath, Maximize,
//   Loader2, Printer, EyeIcon, Banknote, Receipt,
//   Send, AlertTriangle, CheckCircle2, Clock3, XCircle as XCircleIcon
// } from 'lucide-react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { toast } from "sonner";
// import { format } from 'date-fns';
// import { Textarea } from '@/components/ui/textarea';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// // Import APIs
// import { listTenants, type Tenant } from '@/lib/tenantApi';
// import * as paymentApi from '@/lib/paymentRecordApi';

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPES — matches backend getTenantPaymentFormData response exactly
// // ─────────────────────────────────────────────────────────────────────────────
// interface PaymentFormData {
//   tenant: {
//     id: number;
//     name: string;
//     email?: string;
//     phone?: string;
//   };
//   room_info: {
//     room_number: string;
//     bed_number: number;
//     bed_type: string;
//     property_name: string;
//   };
//   monthly_rent: number;
//   // NOTE: backend returns "previous_month" (singular) — NOT "previous_months"
//   previous_month: {
//     month: string;   // empty string '' when no pending
//     year: number;    // 0 when no pending
//     pending: number; // 0 when no pending
//     paid: number;
//   };
//   current_month: {
//     month: string;
//     year: number;
//     paid: number;
//     pending: number;
//   };
//   total_pending: number;
//   suggested_amount: number;
// }

// interface DemandPayment {
//   id: number;
//   tenant_id: number;
//   amount: number;
//   due_date: string;
//   payment_type: string;
//   description: string;
//   late_fee: number;
//   status: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
//   created_at: string;
//   tenant_name?: string;
//   tenant_phone?: string;
//   room_number?: string;
//   bed_number?: number;
//   property_name?: string;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────────────────
// function numberToWords(num: number): string {
//   const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
//     'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
//   const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

//   if (num === 0) return 'Zero';

//   const numToWordsFn = (n: number): string => {
//     if (n < 20) return ones[n];
//     if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
//     if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWordsFn(n % 100) : '');
//     if (n < 100000) return numToWordsFn(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWordsFn(n % 1000) : '');
//     if (n < 10000000) return numToWordsFn(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWordsFn(n % 100000) : '');
//     return numToWordsFn(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWordsFn(n % 10000000) : '');
//   };

//   const rupees = Math.floor(num);
//   const paise = Math.round((num - rupees) * 100);
//   let result = numToWordsFn(rupees);
//   if (paise > 0) result += ' and ' + numToWordsFn(paise) + ' Paise';
//   return result;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// export default function PaymentsPage() {
//   const [payments, setPayments] = useState<paymentApi.Payment[]>([]);
//   const [receipts, setReceipts] = useState<paymentApi.Receipt[]>([]);
//   const [demands, setDemands] = useState<DemandPayment[]>([]);
//   const [tenants, setTenants] = useState<Tenant[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
//   const [isDemandPaymentOpen, setIsDemandPaymentOpen] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);
//   const [paymentFormData, setPaymentFormData] = useState<PaymentFormData | null>(null);

//   const [proofFile, setProofFile] = useState<File | null>(null);
//   const [proofPreview, setProofPreview] = useState<string | null>(null);

//   const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
//   const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);

//   const [filters, setFilters] = useState({
//     date: '',
//     tenant: '',
//     remark: '',
//     amount: '',
//     method: '',
//     transactionId: '',
//   });

//   const [demandFilters, setDemandFilters] = useState({
//     status: '',
//     tenant: '',
//     from_date: '',
//     to_date: ''
//   });

//   const [stats, setStats] = useState({
//     total_collected: 0,
//     total_transactions: 0,
//     online_payments: 0,
//     cash_payments: 0,
//     card_payments: 0,
//     bank_transfers: 0,
//     cheque_payments: 0,
//     current_month_collected: 0,
//     rent_collected: 0,
//   });

//   const [newPayment, setNewPayment] = useState({
//     tenant_id: '',
//     booking_id: null as number | null,
//     payment_type: 'rent',
//     amount: '',
//     payment_mode: 'cash',
//     bank_name: '',
//     transaction_id: '',
//     payment_date: new Date().toISOString().split('T')[0],
//     remark: ''
//   });

//   const [demandPayment, setDemandPayment] = useState({
//     tenant_id: '',
//     payment_type: 'rent',
//     amount: 0,
//     due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//     description: '',
//     include_late_fee: false,
//     late_fee_amount: 0,
//     send_email: true,
//     send_sms: false
//   });

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       await Promise.all([
//         loadPayments(),
//         loadReceipts(),
//         loadDemands(),
//         loadTenants(),
//         loadStats()
//       ]);
//     } catch (error) {
//       toast.error('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadPayments = async () => {
//     try {
//       const response = await paymentApi.getPayments();
//       if (response.success) setPayments(response.data || []);
//     } catch (error) {
//       console.error('Error loading payments:', error);
//     }
//   };

//   const loadReceipts = async () => {
//     try {
//       const response = await paymentApi.getReceipts();
//       if (response.success) setReceipts(response.data || []);
//     } catch (error) {
//       console.error('Error loading receipts:', error);
//     }
//   };

//   const loadDemands = async () => {
//     try {
//       const response = await paymentApi.getDemands();
//       if (response && response.data) {
//         const enhancedDemands = await Promise.all(
//           response.data.map(async (demand: DemandPayment) => {
//             const processedDemand = {
//               ...demand,
//               amount: Number(demand.amount),
//               late_fee: Number(demand.late_fee || 0)
//             };
//             try {
//               const bedAssignment = await paymentApi.getTenantBedAssignment(demand.tenant_id);
//               return {
//                 ...processedDemand,
//                 room_number: bedAssignment?.room?.room_number,
//                 bed_number: bedAssignment?.bed_number,
//                 property_name: bedAssignment?.property?.name
//               };
//             } catch {
//               return processedDemand;
//             }
//           })
//         );
//         setDemands(enhancedDemands);
//       } else {
//         setDemands([]);
//       }
//     } catch (error) {
//       console.error('Error loading demands:', error);
//       setDemands([]);
//     }
//   };

//   const loadTenants = async () => {
//     try {
//       const response = await listTenants({ is_active: true });
//       if (response.success && response.data) setTenants(response.data);
//     } catch (error) {
//       console.error('Error loading tenants:', error);
//     }
//   };

//   const loadStats = async () => {
//     try {
//       const response = await paymentApi.getPaymentStats();
//       if (response.success) setStats(response.data);
//     } catch (error) {
//       console.error('Error loading stats:', error);
//     }
//   };

//   // ── Tenant select for Add Payment dialog ──────────────────────────────────
//   const handleTenantSelect = async (tenantId: string) => {
//     setNewPayment(prev => ({ ...prev, tenant_id: tenantId, booking_id: null, amount: '' }));
//     setPaymentFormData(null);
//     if (!tenantId) return;

//     setBookingLoading(true);
//     try {
//       const formResponse = await paymentApi.getTenantPaymentFormData(parseInt(tenantId));
//       if (formResponse.success) {
//         setPaymentFormData(formResponse.data);
//         setNewPayment(prev => ({
//           ...prev,
//           amount: formResponse.data.suggested_amount.toString()
//         }));
//       }
//     } catch (error) {
//       console.error('Error loading tenant details:', error);
//       toast.error('Failed to load tenant details');
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   // ── Tenant select for Demand dialog ──────────────────────────────────────
//   const handleDemandTenantSelect = async (tenantId: string) => {
//     setDemandPayment(prev => ({ ...prev, tenant_id: tenantId }));
//     setPaymentFormData(null);
//     if (!tenantId) return;

//     setBookingLoading(true);
//     try {
//       const formResponse = await paymentApi.getTenantPaymentFormData(parseInt(tenantId));
//       if (formResponse.success) {
//         setPaymentFormData(formResponse.data);
//         setDemandPayment(prev => ({
//           ...prev,
//           amount: formResponse.data.suggested_amount
//         }));
//       }
//     } catch (error) {
//       console.error('Error loading tenant details:', error);
//       toast.error('Failed to load tenant details');
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   const handlePreviewReceipt = async (receiptId: number) => {
//     try {
//       const response = await paymentApi.getReceiptById(receiptId);
//       if (response.success) {
//         setSelectedReceipt(response.data);
//         setIsReceiptPreviewOpen(true);
//       } else {
//         toast.error('Failed to load receipt');
//       }
//     } catch (error) {
//       console.error('Error loading receipt:', error);
//       toast.error('Failed to load receipt');
//     }
//   };

//   const handleUpdateDemandStatus = async (demandId: number, newStatus: string) => {
//     try {
//       const response = await paymentApi.updateDemandStatus(demandId, newStatus);
//       if (response.success) {
//         toast.success(`Demand status updated to ${newStatus}`);
//         loadDemands();
//       } else {
//         toast.error(response.message || 'Failed to update status');
//       }
//     } catch (error) {
//       console.error('Error updating demand status:', error);
//       toast.error('Failed to update status');
//     }
//   };

//   const handleAddPayment = async () => {
//     if (!newPayment.tenant_id || !newPayment.amount) {
//       toast.error('Please select a tenant and enter an amount');
//       return;
//     }
//     try {
//       const payload = {
//         tenant_id: parseInt(newPayment.tenant_id),
//         booking_id: newPayment.booking_id,
//         payment_type: newPayment.payment_type,
//         amount: parseFloat(newPayment.amount),
//         payment_mode: newPayment.payment_mode,
//         bank_name: newPayment.bank_name || null,
//         transaction_id: newPayment.transaction_id || null,
//         payment_date: newPayment.payment_date,
//         remark: newPayment.remark || null,
//       };

//       const response = await paymentApi.createPayment(payload);
//       if (response.success && response.data) {
//         if (proofFile) await paymentApi.uploadPaymentProof(response.data.id, proofFile);
//         toast.success('Payment added successfully');
//         setIsAddPaymentOpen(false);
//         resetPaymentForm();
//         await loadData();
//       } else {
//         toast.error(response.message || 'Failed to add payment');
//       }
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to add payment');
//     }
//   };

//   const handleDemandPayment = async () => {
//     if (!demandPayment.tenant_id || !demandPayment.amount || !demandPayment.due_date) {
//       toast.error('Please select tenant, enter amount, and set due date');
//       return;
//     }
//     try {
//       const totalAmount = demandPayment.include_late_fee && demandPayment.late_fee_amount > 0
//         ? demandPayment.amount + demandPayment.late_fee_amount
//         : demandPayment.amount;

//       const payload = {
//         tenant_id: parseInt(demandPayment.tenant_id),
//         amount: totalAmount,
//         payment_date: new Date().toISOString().split('T')[0],
//         payment_mode: 'pending',
//         remark: demandPayment.description
//           ? `${demandPayment.description}${demandPayment.include_late_fee ? ` (Late fee: ₹${demandPayment.late_fee_amount})` : ''}`
//           : demandPayment.include_late_fee ? `Late fee included: ₹${demandPayment.late_fee_amount}` : null,
//         payment_type: demandPayment.payment_type
//       };

//       const response = await paymentApi.createPayment(payload);
//       if (response.success) {
//         toast.success('Payment demand created successfully');
//         setIsDemandPaymentOpen(false);
//         resetDemandPaymentForm();
//         await loadData();
//       } else {
//         toast.error(response.message || 'Failed to create payment demand');
//       }
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to create payment demand');
//     }
//   };

//   const resetPaymentForm = () => {
//     setPaymentFormData(null);
//     setProofFile(null);
//     setProofPreview(null);
//     setNewPayment({
//       tenant_id: '',
//       booking_id: null,
//       payment_type: 'rent',
//       amount: '',
//       payment_mode: 'cash',
//       bank_name: '',
//       transaction_id: '',
//       payment_date: new Date().toISOString().split('T')[0],
//       remark: ''
//     });
//   };

//   const resetDemandPaymentForm = () => {
//     setPaymentFormData(null);
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

//   const getTenantName = (tenantId: number) => {
//     const tenant = tenants.find(t => t.id === tenantId);
//     return tenant?.full_name || 'Unknown Tenant';
//   };

//   const getTenantPhone = (tenantId: number) => {
//     const tenant = tenants.find(t => t.id === tenantId);
//     return tenant?.phone || '';
//   };

//   const getDemandStatusBadge = (status: string) => {
//     const variants: Record<string, { className: string; icon: any }> = {
//       pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock3 },
//       paid: { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
//       partial: { className: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle },
//       overdue: { className: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
//       cancelled: { className: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircleIcon }
//     };
//     const config = variants[status] || variants.pending;
//     const Icon = config.icon;
//     return (
//       <Badge variant="outline" className={`${config.className} flex items-center gap-1 text-xs px-2 py-1`}>
//         <Icon className="h-3 w-3" />
//         {status}
//       </Badge>
//     );
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // BedAssignmentDetails — unchanged
//   // ─────────────────────────────────────────────────────────────────────────
//   const BedAssignmentDetails = ({ formData }: { formData: PaymentFormData | null }) => {
//     if (!formData?.room_info) {
//       return (
//         <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
//           <p className="text-xs text-amber-700">No active bed assignment found for this tenant.</p>
//         </div>
//       );
//     }
//     return (
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
//         <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
//           <Bed className="h-3 w-3" />
//           Bed Assignment Details
//         </h4>
//         <div className="grid grid-cols-2 gap-2 text-xs">
//           <div>
//             <p className="text-blue-600">Bed</p>
//             <p className="font-medium">#{formData.room_info.bed_number} ({formData.room_info.bed_type})</p>
//           </div>
//           <div>
//             <p className="text-blue-600">Room</p>
//             <p className="font-medium">{formData.room_info.room_number}</p>
//           </div>
//           <div>
//             <p className="text-blue-600">Property</p>
//             <p className="font-medium truncate">{formData.room_info.property_name}</p>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // PaymentSummary — FIXED to use previous_month (singular) matching backend
//   // ─────────────────────────────────────────────────────────────────────────
//   const PaymentSummary = ({ formData }: { formData: PaymentFormData | null }) => {
//     if (!formData) return null;

//     // previous_month.month is '' when no pending (new tenant or fully paid)
//     const isNewTenant = !formData.previous_month.month && formData.current_month.paid === 0;
//     const hasPreviousPending = formData.previous_month.pending > 0;
//     const hasCurrentMonthPaid = formData.current_month.paid > 0;

//     return (
//       <div className="space-y-3 mb-4">
//         <BedAssignmentDetails formData={formData} />

//         <div className="bg-green-50 border border-green-200 rounded-lg p-3">
//           <h4 className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
//             <IndianRupee className="h-3 w-3" />
//             Payment Summary
//           </h4>

//           <div className="space-y-2">
//             {/* Monthly Rent */}
//             <div className="flex justify-between items-center text-sm">
//               <span className="text-slate-600">Monthly Rent:</span>
//               <span className="font-semibold">₹{formData.monthly_rent.toLocaleString('en-IN')}</span>
//             </div>

//             {/* Previous month pending — only shown when pending > 0 */}
//             {hasPreviousPending && (
//               <div className="flex justify-between items-center text-sm">
//                 <span className="text-amber-600">
//                   Previous Pending ({formData.previous_month.month} {formData.previous_month.year}):
//                 </span>
//                 <span className="font-semibold text-amber-600">
//                   + ₹{formData.previous_month.pending.toLocaleString('en-IN')}
//                 </span>
//               </div>
//             )}

//             {/* Show last month paid amount when there is pending (for context) */}
//             {hasPreviousPending && formData.previous_month.paid > 0 && (
//               <div className="flex justify-between items-center text-xs">
//                 <span className="text-slate-400">
//                   Paid in {formData.previous_month.month}:
//                 </span>
//                 <span className="text-slate-400">
//                   ₹{formData.previous_month.paid.toLocaleString('en-IN')}
//                 </span>
//               </div>
//             )}

//             {/* Already paid this month */}
//             {hasCurrentMonthPaid && (
//               <div className="flex justify-between items-center text-sm">
//                 <span className="text-green-600">Already Paid This Month:</span>
//                 <span className="font-semibold text-green-600">
//                   - ₹{formData.current_month.paid.toLocaleString('en-IN')}
//                 </span>
//               </div>
//             )}

//             {(hasPreviousPending || hasCurrentMonthPaid) && (
//               <div className="border-t border-green-200 my-2" />
//             )}

//             {/* Total to pay */}
//             <div className="flex justify-between items-center text-base font-bold">
//               <span className="text-purple-700">Total to Pay:</span>
//               <span className="text-purple-700">
//                 ₹{formData.suggested_amount.toLocaleString('en-IN')}
//               </span>
//             </div>

//             {/* Contextual hint */}
//             {isNewTenant ? (
//               <p className="text-[10px] text-green-600 mt-1">* First month rent for new tenant</p>
//             ) : hasPreviousPending ? (
//               <p className="text-[10px] text-amber-600 mt-1">
//                 * Includes ₹{formData.previous_month.pending.toLocaleString('en-IN')} pending from {formData.previous_month.month}
//               </p>
//             ) : hasCurrentMonthPaid ? (
//               <p className="text-[10px] text-blue-600 mt-1">* Partial payment already made this month</p>
//             ) : (
//               <p className="text-[10px] text-green-600 mt-1">* Full payment for this month</p>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Stat Card
//   const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
//     <Card className={`${bgColor} border-0 shadow-sm`}>
//       <CardContent className="p-2 sm:p-3">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
//             <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
//           </div>
//           <div className={`p-1.5 rounded-lg ${color}`}>
//             <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );

//   // Filtered payments
//   const filteredPayments = payments.filter(payment => {
//     const tenantName = getTenantName(payment.tenant_id).toLowerCase();
//     const matchesDate = !filters.date || format(new Date(payment.payment_date), 'dd/MM/yy').includes(filters.date);
//     const matchesTenant = !filters.tenant || tenantName.includes(filters.tenant.toLowerCase());
//     const matchesRemark = !filters.remark || (payment.remark && payment.remark.toLowerCase().includes(filters.remark.toLowerCase()));
//     const matchesAmount = !filters.amount || payment.amount.toString().includes(filters.amount);
//     const matchesMethod = !filters.method || payment.payment_mode.toLowerCase().includes(filters.method.toLowerCase());
//     const matchesTransactionId = !filters.transactionId || (payment.transaction_id && payment.transaction_id.toLowerCase().includes(filters.transactionId.toLowerCase()));
//     return matchesDate && matchesTenant && matchesRemark && matchesAmount && matchesMethod && matchesTransactionId;
//   });

//   // Filtered demands
//   const filteredDemands = demands.filter(demand => {
//     const tenantName = getTenantName(demand.tenant_id).toLowerCase();
//     const matchesStatus = demandFilters.status === 'all' || !demandFilters.status || demand.status === demandFilters.status;
//     const matchesTenant = !demandFilters.tenant || tenantName.includes(demandFilters.tenant.toLowerCase());
//     const matchesFromDate = !demandFilters.from_date || new Date(demand.created_at) >= new Date(demandFilters.from_date);
//     const matchesToDate = !demandFilters.to_date || new Date(demand.created_at) <= new Date(demandFilters.to_date);
//     return matchesStatus && matchesTenant && matchesFromDate && matchesToDate;
//   });

//   // ─────────────────────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <div className="bg-slate-50">
//       <div className="p-0 sm:p-0 md:p-0 space-y-2 sm:space-y-3">

//         {/* Stats */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 sticky top-16 z-10">
//           <StatCard title="Collected" value={`₹${stats?.total_collected?.toLocaleString() || '0'}`} icon={IndianRupee} color="bg-blue-600" bgColor="bg-gradient-to-br from-blue-50 to-blue-100" />
//           <StatCard title="This Month" value={`₹${stats?.current_month_collected?.toLocaleString() || '0'}`} icon={TrendingUp} color="bg-green-600" bgColor="bg-gradient-to-br from-green-50 to-green-100" />
//           <StatCard title="Transactions" value={stats?.total_transactions || 0} icon={CreditCard} color="bg-purple-600" bgColor="bg-gradient-to-br from-purple-50 to-purple-100" />
//           <StatCard title="Rent Collected" value={`₹${stats?.rent_collected?.toLocaleString() || '0'}`} icon={Banknote} color="bg-amber-600" bgColor="bg-gradient-to-br from-amber-50 to-amber-100" />
//         </div>

//         {/* Tabs */}
//         <Tabs defaultValue="payments" className="w-full">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sticky top-28 z-10">
//             <TabsList className="h-8 w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
//               <TabsTrigger value="payments" className="text-xs px-3 py-1">Payments Management</TabsTrigger>
//               <TabsTrigger value="demands" className="text-xs px-3 py-1">Demands Payments</TabsTrigger>
//               <TabsTrigger value="receipts" className="text-xs px-3 py-1">Payment Receipts</TabsTrigger>
//             </TabsList>
//             <div className="flex justify-end gap-2">
//               <Button size="sm" className="h-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm flex-1 sm:flex-none" onClick={() => setIsAddPaymentOpen(true)}>
//                 <Plus className="h-3.5 w-3.5 mr-1" />
//                 <span className="text-xs">Add Payment</span>
//               </Button>
//               <Button size="sm" variant="outline" className="h-8 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white flex-1 sm:flex-none" onClick={() => setIsDemandPaymentOpen(true)}>
//                 <Bell className="h-3.5 w-3.5 mr-1" />
//                 <span className="text-xs">Demand</span>
//               </Button>
//             </div>
//           </div>

//           {/* ── Payments Tab ── */}
//           <TabsContent value="payments" className="space-y-2 mt-0">
//             <PaymentsTable
//               payments={filteredPayments}
//               loading={loading}
//               filters={filters}
//               setFilters={setFilters}
//               getTenantName={getTenantName}
//               getTenantPhone={getTenantPhone}
//             />
//           </TabsContent>

//           {/* ── Demands Tab ── */}
//           <TabsContent value="demands" className="mt-0">
//             <Card className="border-0 shadow-sm">
//               <CardHeader className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg sticky top-0 z-10">
//                 <CardTitle className="flex items-center gap-2 text-sm">
//                   <Bell className="h-4 w-4" />
//                   Payment Demands
//                 </CardTitle>
//                 <CardDescription className="text-orange-100 text-xs">
//                   View and manage payment requests sent to tenants
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-2">
//                 <div className="grid grid-cols-4 gap-2 mb-3 p-2 bg-slate-50 rounded-lg">
//                   <Input placeholder="Filter by tenant" value={demandFilters.tenant} onChange={(e) => setDemandFilters({ ...demandFilters, tenant: e.target.value })} className="h-8 text-xs" />
//                   <Select value={demandFilters.status} onValueChange={(value) => setDemandFilters({ ...demandFilters, status: value })}>
//                     <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Status</SelectItem>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="paid">Paid</SelectItem>
//                       <SelectItem value="partial">Partial</SelectItem>
//                       <SelectItem value="overdue">Overdue</SelectItem>
//                       <SelectItem value="cancelled">Cancelled</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <Input type="date" placeholder="From" value={demandFilters.from_date} onChange={(e) => setDemandFilters({ ...demandFilters, from_date: e.target.value })} className="h-8 text-xs" />
//                   <Input type="date" placeholder="To" value={demandFilters.to_date} onChange={(e) => setDemandFilters({ ...demandFilters, to_date: e.target.value })} className="h-8 text-xs" />
//                 </div>

//                 <div className="overflow-auto max-h-[calc(100vh-420px)]">
//                   <Table>
//                     <TableHeader className="sticky top-0 z-10 bg-white">
//                       <TableRow className="bg-slate-100">
//                         <TableHead className="text-xs py-2">Date</TableHead>
//                         <TableHead className="text-xs py-2">Tenant</TableHead>
//                         <TableHead className="text-xs py-2">Amount</TableHead>
//                         <TableHead className="text-xs py-2">Late Fee</TableHead>
//                         <TableHead className="text-xs py-2">Total</TableHead>
//                         <TableHead className="text-xs py-2">Due Date</TableHead>
//                         <TableHead className="text-xs py-2">Status</TableHead>
//                         <TableHead className="text-xs py-2">Room/Bed</TableHead>
//                         <TableHead className="text-xs py-2">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {loading ? (
//                         <TableRow>
//                           <TableCell colSpan={9} className="text-center py-8 text-xs text-slate-500">
//                             <div className="flex justify-center items-center">
//                               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-2" />
//                               Loading demands...
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ) : filteredDemands.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={9} className="text-center py-8 text-xs text-slate-500">
//                             <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
//                             No demands found
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         filteredDemands.map((demand) => (
//                           <TableRow key={demand.id} className="hover:bg-slate-50">
//                             <TableCell className="py-2 text-xs whitespace-nowrap">{format(new Date(demand.created_at), 'dd/MM/yy')}</TableCell>
//                             <TableCell className="py-2">
//                               <p className="text-xs font-medium">{getTenantName(demand.tenant_id)}</p>
//                               <p className="text-[10px] text-slate-500">{getTenantPhone(demand.tenant_id)}</p>
//                             </TableCell>
//                             <TableCell className="py-2 text-xs font-medium">₹{Number(demand.amount).toLocaleString('en-IN')}</TableCell>
//                             <TableCell className="py-2 text-xs text-amber-600">{demand.late_fee > 0 ? `+₹${Number(demand.late_fee).toLocaleString('en-IN')}` : '-'}</TableCell>
//                             <TableCell className="py-2 text-xs font-bold text-purple-600">₹{(Number(demand.amount) + Number(demand.late_fee || 0)).toLocaleString('en-IN')}</TableCell>
//                             <TableCell className="py-2 text-xs whitespace-nowrap">
//                               <span className={new Date(demand.due_date) < new Date() && demand.status === 'pending' ? 'text-red-600 font-medium' : ''}>
//                                 {format(new Date(demand.due_date), 'dd/MM/yy')}
//                               </span>
//                             </TableCell>
//                             <TableCell className="py-2">{getDemandStatusBadge(demand.status)}</TableCell>
//                             <TableCell className="py-2 text-xs">{demand.room_number || 'N/A'} {demand.bed_number ? `(B-${demand.bed_number})` : ''}</TableCell>
//                             <TableCell className="py-2">
//                               <Select value={demand.status} onValueChange={(newStatus) => handleUpdateDemandStatus(demand.id, newStatus)}>
//                                 <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="pending">Pending</SelectItem>
//                                   <SelectItem value="paid">Paid</SelectItem>
//                                   <SelectItem value="partial">Partial</SelectItem>
//                                   <SelectItem value="overdue">Overdue</SelectItem>
//                                   <SelectItem value="cancelled">Cancelled</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* ── Receipts Tab ── */}
//           <TabsContent value="receipts" className="mt-0">
//             <ReceiptsTable
//               receipts={receipts}
//               loading={loading}
//               getTenantName={getTenantName}
//               onPreviewReceipt={handlePreviewReceipt}
//             />
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* ── Add Payment Dialog ─────────────────────────────────────────────── */}
//       <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
//           <DialogHeader className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-t-lg sticky top-0 z-10">
//             <DialogClose asChild>
//               <button className="absolute right-4 top-4 text-white/80 hover:text-white transition">
//                 <X className="h-5 w-5" />
//               </button>
//             </DialogClose>
//             <DialogTitle className="flex items-center gap-2 text-lg">
//               <Plus className="h-5 w-5" />
//               Record New Payment
//             </DialogTitle>
//             <DialogDescription className="text-blue-50 text-sm">
//               Add a new payment record for a tenant
//             </DialogDescription>
//           </DialogHeader>

//           <div className="p-4 space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Tenant *</Label>
//                 <Select value={newPayment.tenant_id} onValueChange={handleTenantSelect}>
//                   <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select tenant" /></SelectTrigger>
//                   <SelectContent>
//                     {tenants.map(tenant => (
//                       <SelectItem key={tenant.id} value={tenant.id.toString()}>
//                         {tenant.full_name} - {tenant.phone}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {bookingLoading && (
//                   <div className="flex items-center gap-1 mt-1">
//                     <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
//                     <p className="text-[10px] text-slate-400">Loading tenant details...</p>
//                   </div>
//                 )}
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Payment Type</Label>
//                 <Select value={newPayment.payment_type} onValueChange={(value) => setNewPayment({ ...newPayment, payment_type: value })}>
//                   <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="rent">Rent</SelectItem>
//                     <SelectItem value="security_deposit">Security Deposit</SelectItem>
//                     <SelectItem value="maintenance">Maintenance</SelectItem>
//                     <SelectItem value="electricity">Electricity</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Payment Summary — uses corrected PaymentFormData with previous_month */}
//             {paymentFormData && <PaymentSummary formData={paymentFormData} />}

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Amount (₹) *</Label>
//                 <Input
//                   type="number"
//                   placeholder="Enter amount"
//                   value={newPayment.amount}
//                   onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
//                   className="h-8 text-sm"
//                 />
//                 {paymentFormData && (
//                   <p className="text-[10px] text-purple-600 mt-1">
//                     Suggested: ₹{paymentFormData.suggested_amount.toLocaleString('en-IN')}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Payment Mode *</Label>
//                 <Select value={newPayment.payment_mode} onValueChange={(value) => setNewPayment({ ...newPayment, payment_mode: value, bank_name: '' })}>
//                   <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="cash">Cash</SelectItem>
//                     <SelectItem value="online">Online</SelectItem>
//                     <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
//                     <SelectItem value="cheque">Cheque</SelectItem>
//                     <SelectItem value="card">Card</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {(newPayment.payment_mode === 'bank_transfer' || newPayment.payment_mode === 'online') && (
//                 <div className="space-y-1">
//                   <Label className="text-xs font-medium">Bank Name</Label>
//                   <Input placeholder="Enter bank name" value={newPayment.bank_name} onChange={(e) => setNewPayment({ ...newPayment, bank_name: e.target.value })} className="h-8 text-sm" />
//                 </div>
//               )}

//               {(newPayment.payment_mode === 'online' || newPayment.payment_mode === 'bank_transfer' || newPayment.payment_mode === 'cheque') && (
//                 <div className="space-y-1">
//                   <Label className="text-xs font-medium">Transaction ID / Cheque No.</Label>
//                   <Input placeholder="Optional" value={newPayment.transaction_id} onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })} className="h-8 text-sm" />
//                 </div>
//               )}

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Payment Date</Label>
//                 <Input type="date" value={newPayment.payment_date} onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })} className="h-8 text-sm" />
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Remark</Label>
//                 <Input placeholder="Additional notes" value={newPayment.remark} onChange={(e) => setNewPayment({ ...newPayment, remark: e.target.value })} className="h-8 text-sm" />
//               </div>
//             </div>

//             {/* Proof Upload */}
//             {(newPayment.payment_mode === 'online' || newPayment.payment_mode === 'bank_transfer') && (
//               <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
//                 <Label className="text-xs font-medium">Payment Proof (Screenshot)</Label>
//                 <div className="flex items-center gap-3">
//                   <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => document.getElementById('proof-upload')?.click()}>
//                     <Upload className="h-3 w-3 mr-1" />
//                     {proofFile ? 'Change File' : 'Upload Proof'}
//                   </Button>
//                   <input type="file" id="proof-upload" accept="image/*,.pdf" className="hidden"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (file) {
//                         setProofFile(file);
//                         if (file.type.startsWith('image/')) {
//                           const reader = new FileReader();
//                           reader.onloadend = () => setProofPreview(reader.result as string);
//                           reader.readAsDataURL(file);
//                         }
//                       }
//                     }}
//                   />
//                   {proofFile && <span className="text-xs text-slate-600 truncate max-w-[200px]">{proofFile.name}</span>}
//                 </div>
//                 {proofPreview && <img src={proofPreview} alt="Preview" className="max-h-32 rounded border border-slate-200 mt-2" />}
//                 <p className="text-[10px] text-slate-400">Upload screenshot of payment (JPG, PNG, PDF up to 5MB)</p>
//               </div>
//             )}
//           </div>

//           <DialogFooter className="p-4 bg-slate-50 rounded-b-lg grid grid-cols-2 gap-2 sm:flex sm:justify-end">
//             <Button variant="outline" size="sm" onClick={() => { setIsAddPaymentOpen(false); resetPaymentForm(); }} className="w-full sm:w-auto">Cancel</Button>
//             <Button size="sm" onClick={handleAddPayment} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">Add Payment</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* ── Demand Payment Dialog ──────────────────────────────────────────── */}
//       <Dialog open={isDemandPaymentOpen} onOpenChange={setIsDemandPaymentOpen}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
//           <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-lg sticky top-0 z-10">
//             <DialogClose asChild>
//               <button className="absolute right-4 top-4 text-white/80 hover:text-white transition">
//                 <X className="h-5 w-5" />
//               </button>
//             </DialogClose>
//             <DialogTitle className="flex items-center gap-2 text-lg">
//               <Bell className="h-5 w-5" />
//               Demand Payment
//             </DialogTitle>
//             <DialogDescription className="text-orange-50 text-sm">
//               Create a payment request and notify the tenant
//             </DialogDescription>
//           </DialogHeader>

//           <div className="p-4 space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Tenant *</Label>
//                 <Select value={demandPayment.tenant_id} onValueChange={handleDemandTenantSelect}>
//                   <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select tenant" /></SelectTrigger>
//                   <SelectContent>
//                     {tenants.map(tenant => (
//                       <SelectItem key={tenant.id} value={tenant.id.toString()}>
//                         {tenant.full_name} - {tenant.phone}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {bookingLoading && (
//                   <div className="flex items-center gap-1 mt-1">
//                     <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
//                     <p className="text-[10px] text-slate-400">Loading tenant details...</p>
//                   </div>
//                 )}
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Payment Type</Label>
//                 <Select value={demandPayment.payment_type} onValueChange={(value) => setDemandPayment({ ...demandPayment, payment_type: value })}>
//                   <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="rent">Rent</SelectItem>
//                     <SelectItem value="security_deposit">Security Deposit</SelectItem>
//                     <SelectItem value="maintenance">Maintenance</SelectItem>
//                     <SelectItem value="electricity">Electricity</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Payment Summary for Demand */}
//             {paymentFormData && <PaymentSummary formData={paymentFormData} />}

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Amount (₹) *</Label>
//                 <Input
//                   type="number"
//                   placeholder="Enter amount"
//                   value={demandPayment.amount || ''}
//                   onChange={(e) => setDemandPayment({ ...demandPayment, amount: parseFloat(e.target.value) || 0 })}
//                   className="h-8 text-sm"
//                 />
//                 {paymentFormData && (
//                   <p className="text-[10px] text-purple-600 mt-1">
//                     Suggested: ₹{paymentFormData.suggested_amount.toLocaleString('en-IN')}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Due Date *</Label>
//                 <Input type="date" value={demandPayment.due_date} onChange={(e) => setDemandPayment({ ...demandPayment, due_date: e.target.value })} className="h-8 text-sm" />
//               </div>
//             </div>

//             <div className="space-y-1">
//               <Label className="text-xs font-medium">Description</Label>
//               <Textarea placeholder="Enter payment description" value={demandPayment.description} onChange={(e) => setDemandPayment({ ...demandPayment, description: e.target.value })} rows={2} className="text-sm" />
//             </div>

//             <div className="bg-slate-50 p-3 rounded-lg space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label className="text-xs font-medium">Late Fee Settings</Label>
//                 <div className="flex items-center gap-2">
//                   <input type="checkbox" id="include-late-fee" checked={demandPayment.include_late_fee} onChange={(e) => setDemandPayment({ ...demandPayment, include_late_fee: e.target.checked })} className="h-3 w-3" />
//                   <Label htmlFor="include-late-fee" className="text-xs">Include</Label>
//                 </div>
//               </div>
//               {demandPayment.include_late_fee && (
//                 <Input type="number" placeholder="Late fee amount" value={demandPayment.late_fee_amount || ''} onChange={(e) => setDemandPayment({ ...demandPayment, late_fee_amount: parseFloat(e.target.value) || 0 })} className="h-8 text-sm" />
//               )}
//             </div>

//             <div className="bg-slate-50 p-3 rounded-lg space-y-2">
//               <Label className="text-xs font-medium">Notifications</Label>
//               <div className="flex gap-3">
//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" id="send-email" checked={demandPayment.send_email} onChange={(e) => setDemandPayment({ ...demandPayment, send_email: e.target.checked })} className="h-3 w-3" />
//                   <Label htmlFor="send-email" className="text-xs">Email</Label>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" id="send-sms" checked={demandPayment.send_sms} onChange={(e) => setDemandPayment({ ...demandPayment, send_sms: e.target.checked })} className="h-3 w-3" />
//                   <Label htmlFor="send-sms" className="text-xs">SMS</Label>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <DialogFooter className="p-4 bg-slate-50 rounded-b-lg grid grid-cols-2 gap-2 sm:flex sm:justify-end">
//             <Button variant="outline" size="sm" onClick={() => { setIsDemandPaymentOpen(false); resetDemandPaymentForm(); }} className="w-full sm:w-auto">Cancel</Button>
//             <Button size="sm" onClick={handleDemandPayment} className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
//               <Send className="h-3.5 w-3.5 mr-1" />
//               Send Demand
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* ── Receipt Preview Dialog ─────────────────────────────────────────── */}
//       <Dialog open={isReceiptPreviewOpen} onOpenChange={setIsReceiptPreviewOpen}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
//           <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg sticky top-0 z-20">
//             <div className="flex items-center justify-between">
//               <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
//                 <Receipt className="h-5 w-5" />
//                 Payment Receipt
//               </DialogTitle>
//               <DialogClose asChild>
//                 <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
//                   <X className="h-4 w-4" />
//                 </Button>
//               </DialogClose>
//             </div>
//           </DialogHeader>

//           {selectedReceipt && (
//             <div className="p-6 bg-gray-50">
//               <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
//                 {/* Receipt Header */}
//                 <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-6 text-white">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h1 className="text-3xl font-bold tracking-tight">ROOMAC</h1>
//                       <p className="text-blue-100 text-sm mt-1">Premium Living Spaces</p>
//                     </div>
//                     <div className="text-right">
//                       <div className="bg-white/20 px-4 py-2 rounded-lg">
//                         <p className="text-xs text-blue-100">Receipt No.</p>
//                         <p className="text-xl font-bold">{selectedReceipt.id}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Amount */}
//                 <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
//                   <div className="text-center">
//                     <p className="text-sm text-gray-600 uppercase tracking-wider">Total Amount</p>
//                     <p className="text-5xl font-bold text-blue-900 mt-2">
//                       ₹{Number(selectedReceipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-2">
//                       {numberToWords(Number(selectedReceipt.amount))} Rupees Only
//                     </p>
//                   </div>
//                 </div>

//                 {/* Details */}
//                 <div className="p-8">
//                   <table className="w-full border-collapse">
//                     <tbody>
//                       <tr>
//                         <td colSpan={2} className="bg-gray-100 px-4 py-2 font-semibold text-gray-700 rounded-t-lg">👤 TENANT DETAILS</td>
//                       </tr>
//                       <tr className="border-b border-gray-200">
//                         <td className="px-4 py-3 text-gray-600 w-1/3">Full Name</td>
//                         <td className="px-4 py-3 font-medium">{selectedReceipt.tenant_name}</td>
//                       </tr>
//                       <tr className="border-b border-gray-200">
//                         <td className="px-4 py-3 text-gray-600">Phone Number</td>
//                         <td className="px-4 py-3 font-medium">{selectedReceipt.tenant_phone || 'N/A'}</td>
//                       </tr>
//                       <tr className="border-b border-gray-200">
//                         <td className="px-4 py-3 text-gray-600">Email Address</td>
//                         <td className="px-4 py-3 font-medium">{selectedReceipt.tenant_email || 'N/A'}</td>
//                       </tr>

//                       <tr>
//                         <td colSpan={2} className="bg-gray-100 px-4 py-2 font-semibold text-gray-700 mt-4 rounded-t-lg">🏠 PROPERTY DETAILS</td>
//                       </tr>
//                       <tr className="border-b border-gray-200">
//                         <td className="px-4 py-3 text-gray-600">Property Name</td>
//                         <td className="px-4 py-3 font-medium">{selectedReceipt.property_name || 'RoomAC Properties'}</td>
//                       </tr>
//                       <tr className="border-b border-gray-200">
//                         <td className="px-4 py-3 text-gray-600">Room Number</td>
//                         <td className="px-4 py-3 font-medium">
//                           {selectedReceipt.room_number || 'N/A'}
//                           {selectedReceipt.bed_number ? ` (Bed #${selectedReceipt.bed_number})` : ''}
//                         </td>
//                       </tr>
//                       <tr className="border-b border-gray-200">
//                         <td className="px-4 py-3 text-gray-600">Property Address</td>
//                         <td className="px-4 py-3 font-medium">{selectedReceipt.property_address || 'N/A'}</td>
//                       </tr>

//                       <tr>
//                         <td colSpan={2} className="bg-gray-100 px-4 py-2 font-semibold text-gray-700 mt-4 rounded-t-lg">💳 PAYMENT DETAILS</td>
//                       </tr>
//                       <tr className="border-b border-gray-200">
//                         <td className="px-4 py-3 text-gray-600">Payment Mode</td>
//                         <td className="px-4 py-3 font-medium capitalize">{selectedReceipt.payment_mode}</td>
//                       </tr>
//                       {selectedReceipt.bank_name && (
//                         <tr className="border-b border-gray-200">
//                           <td className="px-4 py-3 text-gray-600">Bank Name</td>
//                           <td className="px-4 py-3 font-medium">{selectedReceipt.bank_name}</td>
//                         </tr>
//                       )}
//                       {selectedReceipt.transaction_id && (
//                         <tr className="border-b border-gray-200">
//                           <td className="px-4 py-3 text-gray-600">Transaction ID</td>
//                           <td className="px-4 py-3 font-medium font-mono text-sm">{selectedReceipt.transaction_id}</td>
//                         </tr>
//                       )}
//                       <tr className="border-b border-gray-200">
//                         <td className="px-4 py-3 text-gray-600">Payment Date</td>
//                         <td className="px-4 py-3 font-medium">
//                           {new Date(selectedReceipt.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
//                         </td>
//                       </tr>
//                       <tr className="border-b border-gray-200">
//                         <td className="px-4 py-3 text-gray-600">Month/Year</td>
//                         <td className="px-4 py-3 font-medium">{selectedReceipt.month} {selectedReceipt.year}</td>
//                       </tr>

//                       <tr>
//                         <td colSpan={2} className="bg-gray-100 px-4 py-2 font-semibold text-gray-700 mt-4 rounded-t-lg">📋 RENT DETAILS</td>
//                       </tr>
//                       <tr className="border-b border-gray-200">
//                         <td className="px-4 py-3 text-gray-600">Monthly Rent</td>
//                         <td className="px-4 py-3 font-medium">
//                           ₹{selectedReceipt.monthly_rent ? Number(selectedReceipt.monthly_rent).toLocaleString('en-IN') : 'N/A'}
//                         </td>
//                       </tr>
//                       <tr className="border-b border-gray-200 bg-green-50">
//                         <td className="px-4 py-3 text-gray-600 font-semibold">Amount Paid</td>
//                         <td className="px-4 py-3 font-bold text-green-700">
//                           ₹{Number(selectedReceipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>

//                   {selectedReceipt.remark && (
//                     <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
//                       <p className="text-sm font-medium text-yellow-800">📝 Remark</p>
//                       <p className="text-sm text-yellow-700 mt-1">{selectedReceipt.remark}</p>
//                     </div>
//                   )}

//                   <div className="mt-8 pt-6 border-t border-gray-200 text-center">
//                     <p className="text-sm text-gray-500">This is a computer generated receipt. No signature required.</p>
//                     <p className="text-xs text-gray-400 mt-2">
//                       Generated on: {new Date(selectedReceipt.created_at).toLocaleString('en-IN')}
//                     </p>
//                     <div className="mt-4 flex justify-center gap-4">
//                       <Button size="sm" onClick={() => paymentApi.downloadReceipt(selectedReceipt.id)} className="bg-blue-600 hover:bg-blue-700 text-white">
//                         <Download className="h-4 w-4 mr-2" />
//                         Download PDF
//                       </Button>
//                       <Button size="sm" variant="outline" onClick={() => window.print()}>
//                         <Printer className="h-4 w-4 mr-2" />
//                         Print
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // PaymentsTable — unchanged
// // ─────────────────────────────────────────────────────────────────────────────
// const PaymentsTable = ({ payments, loading, filters, setFilters, getTenantName, getTenantPhone }: any) => (
//   <Card className="border-0 shadow-sm">
//     <div className="relative">
//       <div className="overflow-auto max-h-[calc(100vh-320px)] md:max-h-[calc(100vh-240px)]">
//         <Table>
//           <TableHeader className="sticky top-0 z-20 bg-white">
//             <TableRow className="bg-slate-100">
//               <TableHead className="text-xs font-semibold py-2">Date</TableHead>
//               <TableHead className="text-xs font-semibold py-2">Tenant</TableHead>
//               <TableHead className="text-xs font-semibold py-2">Remark</TableHead>
//               <TableHead className="text-xs font-semibold py-2">Amount</TableHead>
//               <TableHead className="text-xs font-semibold py-2">Method/Bank</TableHead>
//               <TableHead className="text-xs font-semibold py-2">Transaction ID</TableHead>
//               <TableHead className="text-xs font-semibold py-2">Month/Year</TableHead>
//             </TableRow>
//             <TableRow className="bg-slate-50 sticky top-[41px] z-20">
//               <TableHead className="p-1"><Input placeholder="Filter" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} className="h-7 text-xs" /></TableHead>
//               <TableHead className="p-1"><Input placeholder="Filter" value={filters.tenant} onChange={(e) => setFilters({ ...filters, tenant: e.target.value })} className="h-7 text-xs" /></TableHead>
//               <TableHead className="p-1"><Input placeholder="Filter" value={filters.remark} onChange={(e) => setFilters({ ...filters, remark: e.target.value })} className="h-7 text-xs" /></TableHead>
//               <TableHead className="p-1"><Input placeholder="Filter" value={filters.amount} onChange={(e) => setFilters({ ...filters, amount: e.target.value })} className="h-7 text-xs" /></TableHead>
//               <TableHead className="p-1"><Input placeholder="Filter" value={filters.method} onChange={(e) => setFilters({ ...filters, method: e.target.value })} className="h-7 text-xs" /></TableHead>
//               <TableHead className="p-1"><Input placeholder="Filter" value={filters.transactionId} onChange={(e) => setFilters({ ...filters, transactionId: e.target.value })} className="h-7 text-xs" /></TableHead>
//               <TableHead className="p-1"></TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {loading ? (
//               <TableRow>
//                 <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
//                   <div className="flex justify-center items-center">
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
//                     Loading payments...
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ) : payments.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
//                   <CreditCard className="h-8 w-8 mx-auto mb-2 text-slate-300" />
//                   No payments found
//                 </TableCell>
//               </TableRow>
//             ) : (
//               payments.map((payment: any) => (
//                 <TableRow key={payment.id} className="hover:bg-slate-50">
//                   <TableCell className="py-2 text-xs whitespace-nowrap">{format(new Date(payment.payment_date), 'dd/MM/yy')}</TableCell>
//                   <TableCell className="py-2">
//                     <p className="text-xs font-medium whitespace-nowrap">{getTenantName(payment.tenant_id)}</p>
//                     <p className="text-[10px] text-slate-500 whitespace-nowrap">{getTenantPhone(payment.tenant_id)}</p>
//                   </TableCell>
//                   <TableCell className="py-2 text-xs max-w-[120px] truncate">{payment.remark || '-'}</TableCell>
//                   <TableCell className="py-2 text-xs font-medium whitespace-nowrap">₹{payment.amount.toLocaleString()}</TableCell>
//                   <TableCell className="py-2">
//                     <p className="text-xs capitalize whitespace-nowrap">{payment.payment_mode}</p>
//                     {payment.bank_name && <p className="text-[10px] text-slate-500 whitespace-nowrap">{payment.bank_name}</p>}
//                   </TableCell>
//                   <TableCell className="py-2 text-[10px] font-mono whitespace-nowrap">
//                     {payment.transaction_id ? payment.transaction_id.substring(0, 8) + '...' : '-'}
//                   </TableCell>
//                   <TableCell className="py-2 text-xs whitespace-nowrap">{payment.month} {payment.year}</TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   </Card>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // ReceiptsTable — unchanged
// // ─────────────────────────────────────────────────────────────────────────────
// const ReceiptsTable = ({ receipts, loading, getTenantName, onPreviewReceipt }: any) => (
//   <Card className="border-0 shadow-sm">
//     <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-t-lg sticky top-0 z-10">
//       <CardTitle className="flex items-center gap-2 text-sm">
//         <Receipt className="h-4 w-4" />
//         Payment Receipts
//       </CardTitle>
//       <CardDescription className="text-blue-50 text-xs">View and download payment receipts</CardDescription>
//     </CardHeader>
//     <CardContent className="p-2">
//       <div className="overflow-auto max-h-[calc(100vh-380px)]">
//         <Table>
//           <TableHeader className="sticky top-0 z-10 bg-white">
//             <TableRow className="bg-slate-100">
//               <TableHead className="text-xs py-2">Date</TableHead>
//               <TableHead className="text-xs py-2">Tenant</TableHead>
//               <TableHead className="text-xs py-2">Amount</TableHead>
//               <TableHead className="text-xs py-2">Method/Bank</TableHead>
//               <TableHead className="text-xs py-2">Room/Bed</TableHead>
//               <TableHead className="text-xs py-2 text-center">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {loading ? (
//               <TableRow>
//                 <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
//                   <div className="flex justify-center items-center">
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
//                     Loading receipts...
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ) : receipts.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
//                   <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300" />
//                   No receipts found
//                 </TableCell>
//               </TableRow>
//             ) : (
//               receipts.map((receipt: any) => (
//                 <TableRow key={receipt.id}>
//                   <TableCell className="py-2 text-xs whitespace-nowrap">{format(new Date(receipt.payment_date), 'dd/MM/yy')}</TableCell>
//                   <TableCell className="py-2">
//                     <p className="text-xs whitespace-nowrap">{receipt.tenant_name}</p>
//                     {receipt.tenant_phone && <p className="text-[10px] text-slate-500">{receipt.tenant_phone}</p>}
//                   </TableCell>
//                   <TableCell className="py-2 text-xs font-medium whitespace-nowrap">₹{receipt.amount.toLocaleString()}</TableCell>
//                   <TableCell className="py-2">
//                     <p className="text-xs capitalize whitespace-nowrap">{receipt.payment_mode}</p>
//                     {receipt.bank_name && <p className="text-[10px] text-slate-500">{receipt.bank_name}</p>}
//                   </TableCell>
//                   <TableCell className="py-2">
//                     <p className="text-xs whitespace-nowrap">{receipt.room_number || 'N/A'}</p>
//                     {receipt.bed_number && <p className="text-[10px] text-slate-500">Bed #{receipt.bed_number}</p>}
//                   </TableCell>
//                   <TableCell className="py-2">
//                     <div className="flex items-center gap-1 justify-center">
//                       <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onPreviewReceipt(receipt.id)} title="Preview Receipt">
//                         <Eye className="h-3.5 w-3.5" />
//                       </Button>
//                       <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => paymentApi.downloadReceipt(receipt.id)} title="Download Receipt">
//                         <Download className="h-3.5 w-3.5" />
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </CardContent>
//   </Card>
// );




// // app/admin/payments/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Plus, CreditCard, FileText, Download, Search, 
//   AlertCircle, CheckCircle, XCircle, Bell,
//   IndianRupee, X, Bed, User, CalendarDays,
//   Upload, Eye, Clock, TrendingUp, TrendingDown,
//   Building, MapPin, Wifi, Wind, Bath, Maximize,
//   Loader2, Printer, EyeIcon, Banknote, Receipt,
//   Send
// } from 'lucide-react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { toast } from "sonner";
// import { format } from 'date-fns';
// import { Textarea } from '@/components/ui/textarea';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// // Import APIs
// import { listTenants, type Tenant } from '@/lib/tenantApi';
// import * as paymentApi from '@/lib/paymentRecordApi';

// // Types
// interface PaymentFormData {
//   tenant: {
//     id: number;
//     name: string;
//     email?: string;
//     phone?: string;
//   };
//   room_info: {
//     room_number: string;
//     bed_number: number;
//     bed_type: string;
//     property_name: string;
//   };
//   monthly_rent: number;
//   previous_month: {
//     month: string;
//     year: number;
//     pending: number;
//     paid: number;
//   };
//   current_month: {
//     month: string;
//     year: number;
//     paid: number;
//     pending: number;
//   };
//   total_pending: number;
//   suggested_amount: number;
// }

// export default function PaymentsPage() {
//   const [payments, setPayments] = useState<paymentApi.Payment[]>([]);
//   const [receipts, setReceipts] = useState<paymentApi.Receipt[]>([]);
//   const [tenants, setTenants] = useState<Tenant[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
//   const [isDemandPaymentOpen, setIsDemandPaymentOpen] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);
//   const [paymentFormData, setPaymentFormData] = useState<PaymentFormData | null>(null);
  
//   // Proof upload states
//   const [proofFile, setProofFile] = useState<File | null>(null);
//   const [proofPreview, setProofPreview] = useState<string | null>(null);

//   // Filters
//   const [filters, setFilters] = useState({
//     date: '',
//     tenant: '',
//     remark: '',
//     amount: '',
//     method: '',
//     transactionId: '',
//   });

//   const [stats, setStats] = useState({
//     total_collected: 0,
//     total_transactions: 0,
//     online_payments: 0,
//     cash_payments: 0,
//     card_payments: 0,
//     bank_transfers: 0,
//     cheque_payments: 0,
//     current_month_collected: 0,
//     rent_collected: 0,
//   });

//   const [newPayment, setNewPayment] = useState({
//     tenant_id: '',
//     booking_id: null as number | null,
//     payment_type: 'rent',
//     amount: '',
//     payment_mode: 'cash',
//     bank_name: '',
//     transaction_id: '',
//     payment_date: new Date().toISOString().split('T')[0],
//     remark: ''
//   });

//   const [demandPayment, setDemandPayment] = useState({
//     tenant_id: '',
//     payment_type: 'rent',
//     amount: 0,
//     due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//     description: '',
//     include_late_fee: false,
//     late_fee_amount: 0,
//     send_email: true,
//     send_sms: false
//   });

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       await Promise.all([
//         loadPayments(),
//         loadReceipts(),
//         loadTenants(),
//         loadStats()
//       ]);
//     } catch (error) {
//       toast.error('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadPayments = async () => {
//     try {
//       const response = await paymentApi.getPayments();
//       if (response.success) {
//         setPayments(response.data || []);
//       }
//     } catch (error) {
//       console.error('Error loading payments:', error);
//     }
//   };

//   const loadReceipts = async () => {
//     try {
//       const response = await paymentApi.getReceipts();
//       if (response.success) {
//         setReceipts(response.data || []);
//       }
//     } catch (error) {
//       console.error('Error loading receipts:', error);
//     }
//   };

//   const loadTenants = async () => {
//     try {
//       const response = await listTenants({ is_active: true });
//       if (response.success && response.data) {
//         setTenants(response.data);
//       }
//     } catch (error) {
//       console.error('Error loading tenants:', error);
//     }
//   };

//   const loadStats = async () => {
//     try {
//       const response = await paymentApi.getPaymentStats();
//       if (response.success) {
//         setStats(response.data);
//       }
//     } catch (error) {
//       console.error('Error loading stats:', error);
//     }
//   };

//   const handleTenantSelect = async (tenantId: string) => {
//     setNewPayment(prev => ({ ...prev, tenant_id: tenantId, booking_id: null, amount: '' }));
//     setPaymentFormData(null);
    
//     if (!tenantId) return;

//     setBookingLoading(true);
//     try {
//       const formResponse = await paymentApi.getTenantPaymentFormData(parseInt(tenantId));
//       if (formResponse.success) {
//         setPaymentFormData(formResponse.data);
//         console.log(formResponse.data)
//         // Set the amount directly from the backend calculation
//         setNewPayment(prev => ({
//           ...prev,
//           amount: formResponse.data.suggested_amount.toString()
//         }));
//       }
      
//     } catch (error) {
//       console.error('Error loading tenant details:', error);
//       toast.error('Failed to load tenant details');
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   const handleDemandTenantSelect = async (tenantId: string) => {
//     setDemandPayment(prev => ({ ...prev, tenant_id: tenantId }));
//     setPaymentFormData(null);
    
//     if (!tenantId) return;

//     setBookingLoading(true);
//     try {
//       const formResponse = await paymentApi.getTenantPaymentFormData(parseInt(tenantId));
//       if (formResponse.success) {
//         setPaymentFormData(formResponse.data);
        
//         setDemandPayment(prev => ({
//           ...prev,
//           amount: formResponse.data.suggested_amount
//         }));
//       }
      
//     } catch (error) {
//       console.error('Error loading tenant details:', error);
//       toast.error('Failed to load tenant details');
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   const handleAddPayment = async () => {
//     if (!newPayment.tenant_id || !newPayment.amount) {
//       toast.error('Please select a tenant and enter an amount');
//       return;
//     }

//     try {
//       const payload = {
//         tenant_id: parseInt(newPayment.tenant_id),
//         booking_id: newPayment.booking_id,
//         payment_type: newPayment.payment_type,
//         amount: parseFloat(newPayment.amount),
//         payment_mode: newPayment.payment_mode,
//         bank_name: newPayment.bank_name || null,
//         transaction_id: newPayment.transaction_id || null,
//         payment_date: newPayment.payment_date,
//         remark: newPayment.remark || null,
//       };

//       const response = await paymentApi.createPayment(payload);

//       if (response.success && response.data) {
//         if (proofFile) {
//           await paymentApi.uploadPaymentProof(response.data.id, proofFile);
//         }
        
//         toast.success('Payment added successfully');
//         setIsAddPaymentOpen(false);
//         resetPaymentForm();
//         await loadData();
//       } else {
//         toast.error(response.message || 'Failed to add payment');
//       }
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to add payment');
//     }
//   };

//   const handleDemandPayment = async () => {
//     if (!demandPayment.tenant_id || !demandPayment.amount || !demandPayment.due_date) {
//       toast.error('Please select tenant, enter amount, and set due date');
//       return;
//     }

//     try {
//       const totalAmount = demandPayment.include_late_fee && demandPayment.late_fee_amount > 0
//         ? demandPayment.amount + demandPayment.late_fee_amount
//         : demandPayment.amount;

//       const payload = {
//         tenant_id: parseInt(demandPayment.tenant_id),
//         amount: totalAmount,
//         payment_date: new Date().toISOString().split('T')[0],
//         payment_mode: 'pending',
//         remark: demandPayment.description
//           ? `${demandPayment.description}${demandPayment.include_late_fee ? ` (Late fee: ₹${demandPayment.late_fee_amount})` : ''}`
//           : demandPayment.include_late_fee ? `Late fee included: ₹${demandPayment.late_fee_amount}` : null,
//         payment_type: demandPayment.payment_type
//       };

//       const response = await paymentApi.createPayment(payload);

//       if (response.success) {
//         toast.success('Payment demand created successfully');
//         setIsDemandPaymentOpen(false);
//         resetDemandPaymentForm();
//         await loadData();
//       } else {
//         toast.error(response.message || 'Failed to create payment demand');
//       }
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to create payment demand');
//     }
//   };

//   const resetPaymentForm = () => {
//     setPaymentFormData(null);
//     setProofFile(null);
//     setProofPreview(null);
//     setNewPayment({
//       tenant_id: '',
//       booking_id: null,
//       payment_type: 'rent',
//       amount: '',
//       payment_mode: 'cash',
//       bank_name: '',
//       transaction_id: '',
//       payment_date: new Date().toISOString().split('T')[0],
//       remark: ''
//     });
//   };

//   const resetDemandPaymentForm = () => {
//     setPaymentFormData(null);
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

//   const getTenantName = (tenantId: number) => {
//     const tenant = tenants.find(t => t.id === tenantId);
//     return tenant?.full_name || 'Unknown Tenant';
//   };

//   const getTenantPhone = (tenantId: number) => {
//     const tenant = tenants.find(t => t.id === tenantId);
//     return tenant?.phone || '';
//   };

//   // Bed Assignment Details Component
//   const BedAssignmentDetails = ({ formData }: { formData: PaymentFormData | null }) => {
//     if (!formData?.room_info) {
//       return (
//         <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
//           <p className="text-xs text-amber-700">No active bed assignment found for this tenant.</p>
//         </div>
//       );
//     }

//     return (
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
//         <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
//           <Bed className="h-3 w-3" />
//           Bed Assignment Details
//         </h4>
//         <div className="grid grid-cols-3 gap-2 text-xs">
//           <div>
//             <p className="text-blue-600">Bed</p>
//             <p className="font-medium">#{formData.room_info.bed_number} ({formData.room_info.bed_type})</p>
//           </div>
//           <div>
//             <p className="text-blue-600">Room</p>
//             <p className="font-medium">{formData.room_info.room_number}</p>
//           </div>
//           <div>
//             <p className="text-blue-600">Property</p>
//             <p className="font-medium truncate">{formData.room_info.property_name}</p>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Payment Summary Component - FIXED based on new logic
//   const PaymentSummary = ({ formData }: { formData: PaymentFormData | null }) => {
//     if (!formData) return null;

//     // Check scenarios:
//     // 1. New tenant (no previous month data)
//     const isNewTenant = !formData.previous_month.month;
    
//     // 2. Has previous month pending
//     const hasPreviousPending = formData.previous_month.pending > 0;
    
//     // 3. Already paid this month
//     const hasCurrentMonthPaid = formData.current_month.paid > 0;

//     return (
//       <div className="space-y-3 mb-4">
//         <BedAssignmentDetails formData={formData} />

//         <div className="bg-green-50 border border-green-200 rounded-lg p-3">
//           <h4 className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
//             <IndianRupee className="h-3 w-3" />
//             Payment Summary
//           </h4>
          
//           <div className="space-y-2">
//             {/* Monthly Rent */}
//             <div className="flex justify-between items-center text-sm">
//               <span className="text-slate-600">Monthly Rent:</span>
//               <span className="font-semibold">₹{formData.monthly_rent.toLocaleString('en-IN')}</span>
//             </div>

//             {/* Previous Month Pending - Only show if exists */}
//             {hasPreviousPending && (
//               <div className="flex justify-between items-center text-sm">
//                 <span className="text-amber-600">Previous Pending ({formData.previous_month.month}):</span>
//                 <span className="font-semibold text-amber-600">+ ₹{formData.previous_month.pending.toLocaleString('en-IN')}</span>
//               </div>
//             )}

//             {/* Current Month Paid - Only show if any */}
//             {hasCurrentMonthPaid && (
//               <div className="flex justify-between items-center text-sm">
//                 <span className="text-green-600">Already Paid This Month:</span>
//                 <span className="font-semibold text-green-600">- ₹{formData.current_month.paid.toLocaleString('en-IN')}</span>
//               </div>
//             )}

//             {/* Divider */}
//             {(hasPreviousPending || hasCurrentMonthPaid) && (
//               <div className="border-t border-green-200 my-2"></div>
//             )}

//             {/* Total to Pay */}
//             <div className="flex justify-between items-center text-base font-bold">
//               <span className="text-purple-700">Total to Pay:</span>
//               <span className="text-purple-700">₹{formData.suggested_amount.toLocaleString('en-IN')}</span>
//             </div>

//             {/* Status Message */}
//             {isNewTenant ? (
//               <p className="text-[10px] text-green-600 mt-1">
//                 * First month rent for new tenant
//               </p>
//             ) : hasPreviousPending ? (
//               <p className="text-[10px] text-amber-600 mt-1">
//                 * Previous pending will be cleared first
//               </p>
//             ) : hasCurrentMonthPaid ? (
//               <p className="text-[10px] text-blue-600 mt-1">
//                 * Partial payment already made this month
//               </p>
//             ) : (
//               <p className="text-[10px] text-green-600 mt-1">
//                 * Full payment for this month
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Stat Card Component
//   const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
//     <Card className={`${bgColor} border-0 shadow-sm`}>
//       <CardContent className="p-2 sm:p-3">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
//             <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
//           </div>
//           <div className={`p-1.5 rounded-lg ${color}`}>
//             <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );

//   // Filtered payments
//   const filteredPayments = payments.filter(payment => {
//     const tenantName = getTenantName(payment.tenant_id).toLowerCase();
    
//     const matchesDate = !filters.date || 
//       format(new Date(payment.payment_date), 'dd/MM/yy').includes(filters.date);
    
//     const matchesTenant = !filters.tenant ||
//       tenantName.includes(filters.tenant.toLowerCase());
    
//     const matchesRemark = !filters.remark ||
//       (payment.remark && payment.remark.toLowerCase().includes(filters.remark.toLowerCase()));
    
//     const matchesAmount = !filters.amount ||
//       payment.amount.toString().includes(filters.amount);
    
//     const matchesMethod = !filters.method ||
//       payment.payment_mode.toLowerCase().includes(filters.method.toLowerCase());
    
//     const matchesTransactionId = !filters.transactionId ||
//       (payment.transaction_id && payment.transaction_id.toLowerCase().includes(filters.transactionId.toLowerCase()));

//     return matchesDate && matchesTenant && matchesRemark && matchesAmount && 
//            matchesMethod && matchesTransactionId;
//   });

//   return (
//     <div className="bg-slate-50">
//       <div className="p-0 sm:p-0 md:p-0 space-y-2 sm:space-y-3">
//         {/* Compact Stats Cards */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 sticky top-16 z-10">
//           <StatCard
//             title="Collected"
//             value={`₹${stats?.total_collected?.toLocaleString() || '0'}`}
//             icon={IndianRupee}
//             color="bg-blue-600"
//             bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
//           />
//           <StatCard
//             title="This Month"
//             value={`₹${stats?.current_month_collected?.toLocaleString() || '0'}`}
//             icon={TrendingUp}
//             color="bg-green-600"
//             bgColor="bg-gradient-to-br from-green-50 to-green-100"
//           />
//           <StatCard
//             title="Transactions"
//             value={stats?.total_transactions || 0}
//             icon={CreditCard}
//             color="bg-purple-600"
//             bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
//           />
//           <StatCard
//             title="Rent Collected"
//             value={`₹${stats?.rent_collected?.toLocaleString() || '0'}`}
//             icon={Banknote}
//             color="bg-amber-600"
//             bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
//           />
//         </div>

//         {/* Tabs Container */}
//         <Tabs defaultValue="payments" className="w-full">
//           {/* Tabs Header Row */}
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sticky top-28 z-10">
//             <TabsList className="h-8 w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
//               <TabsTrigger value="payments" className="text-xs px-3 py-1">Payments</TabsTrigger>
//               <TabsTrigger value="receipts" className="text-xs px-3 py-1">Receipts</TabsTrigger>
//             </TabsList>
            
//             <div className="flex justify-end gap-2">
//               <Button 
//                 size="sm" 
//                 className="h-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm flex-1 sm:flex-none"
//                 onClick={() => setIsAddPaymentOpen(true)}
//               >
//                 <Plus className="h-3.5 w-3.5 mr-1" />
//                 <span className="text-xs">Add Payment</span>
//               </Button>
//               <Button 
//                 size="sm"
//                 variant="outline" 
//                 className="h-8 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white flex-1 sm:flex-none"
//                 onClick={() => setIsDemandPaymentOpen(true)}
//               >
//                 <Bell className="h-3.5 w-3.5 mr-1" />
//                 <span className="text-xs">Demand</span>
//               </Button>
//             </div>
//           </div>

//           {/* Payments Tab Content */}
//           <TabsContent value="payments" className="space-y-2 mt-0">
//             <Card className="border-0 shadow-sm">
//               <div className="relative">
//                 <div className="overflow-auto max-h-[calc(100vh-320px)] md:max-h-[calc(100vh-240px)]">
//                   <Table>
//                     <TableHeader className="sticky top-0 z-20 bg-white">
//                       <TableRow className="bg-slate-100">
//                         <TableHead className="text-xs font-semibold py-2">Date</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Tenant</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Remark</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Amount</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Method/Bank</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Transaction ID</TableHead>
//                         <TableHead className="text-xs font-semibold py-2">Month/Year</TableHead>
//                       </TableRow>
                      
//                       {/* Filter Row */}
//                       <TableRow className="bg-slate-50 sticky top-[41px] z-20">
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.date}
//                             onChange={(e) => setFilters({ ...filters, date: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.tenant}
//                             onChange={(e) => setFilters({ ...filters, tenant: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.remark}
//                             onChange={(e) => setFilters({ ...filters, remark: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.amount}
//                             onChange={(e) => setFilters({ ...filters, amount: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.method}
//                             onChange={(e) => setFilters({ ...filters, method: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1">
//                           <Input
//                             placeholder="Filter"
//                             value={filters.transactionId}
//                             onChange={(e) => setFilters({ ...filters, transactionId: e.target.value })}
//                             className="h-7 text-xs"
//                           />
//                         </TableHead>
//                         <TableHead className="p-1"></TableHead>
//                       </TableRow>
//                     </TableHeader>
                    
//                     <TableBody>
//                       {loading ? (
//                         <TableRow>
//                           <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
//                             <div className="flex justify-center items-center">
//                               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
//                               Loading payments...
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ) : filteredPayments.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-500">
//                             <CreditCard className="h-8 w-8 mx-auto mb-2 text-slate-300" />
//                             No payments found
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         filteredPayments.map((payment) => (
//                           <TableRow key={payment.id} className="hover:bg-slate-50">
//                             <TableCell className="py-2 text-xs whitespace-nowrap">
//                               {format(new Date(payment.payment_date), 'dd/MM/yy')}
//                             </TableCell>
//                             <TableCell className="py-2">
//                               <p className="text-xs font-medium whitespace-nowrap">{getTenantName(payment.tenant_id)}</p>
//                               <p className="text-[10px] text-slate-500 whitespace-nowrap">{getTenantPhone(payment.tenant_id)}</p>
//                             </TableCell>
//                             <TableCell className="py-2 text-xs max-w-[120px] truncate">
//                               {payment.remark || '-'}
//                             </TableCell>
//                             <TableCell className="py-2 text-xs font-medium whitespace-nowrap">
//                               ₹{payment.amount.toLocaleString()}
//                             </TableCell>
//                             <TableCell className="py-2">
//                               <p className="text-xs capitalize whitespace-nowrap">{payment.payment_mode}</p>
//                               {payment.bank_name && (
//                                 <p className="text-[10px] text-slate-500 whitespace-nowrap">{payment.bank_name}</p>
//                               )}
//                             </TableCell>
//                             <TableCell className="py-2 text-[10px] font-mono whitespace-nowrap">
//                               {payment.transaction_id ? payment.transaction_id.substring(0, 8) + '...' : '-'}
//                             </TableCell>
//                             <TableCell className="py-2 text-xs whitespace-nowrap">
//                               {payment.month} {payment.year}
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </div>
//             </Card>
//           </TabsContent>

//           {/* Receipts Tab Content */}
//           <TabsContent value="receipts" className="mt-0">
//             <Card className="border-0 shadow-sm">
//               <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-t-lg sticky top-0 z-10">
//                 <CardTitle className="flex items-center gap-2 text-sm">
//                   <Receipt className="h-4 w-4" />
//                   Payment Receipts
//                 </CardTitle>
//                 <CardDescription className="text-blue-50 text-xs">
//                   View and download payment receipts
//                 </CardDescription>
//               </CardHeader>

//               <CardContent className="p-2">
//                 <div className="overflow-auto max-h-[calc(100vh-380px)]">
//                   <Table>
//                     <TableHeader className="sticky top-0 z-10 bg-white">
//                       <TableRow className="bg-slate-100">
//                         <TableHead className="text-xs py-2">Date</TableHead>
//                         <TableHead className="text-xs py-2">Tenant</TableHead>
//                         <TableHead className="text-xs py-2">Amount</TableHead>
//                         <TableHead className="text-xs py-2">Method/Bank</TableHead>
//                         <TableHead className="text-xs py-2">Room/Bed</TableHead>
//                         <TableHead className="text-xs py-2 text-center">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {loading ? (
//                         <TableRow>
//                           <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
//                             <div className="flex justify-center items-center">
//                               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
//                               Loading receipts...
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ) : receipts.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
//                             <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300" />
//                             No receipts found
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         receipts.map((receipt) => (
//                           <TableRow key={receipt.id}>
//                             <TableCell className="py-2 text-xs whitespace-nowrap">
//                               {format(new Date(receipt.payment_date), 'dd/MM/yy')}
//                             </TableCell>
//                             <TableCell className="py-2">
//                               <p className="text-xs whitespace-nowrap">{receipt.tenant_name}</p>
//                               {receipt.tenant_phone && (
//                                 <p className="text-[10px] text-slate-500">{receipt.tenant_phone}</p>
//                               )}
//                             </TableCell>
//                             <TableCell className="py-2 text-xs font-medium whitespace-nowrap">
//                               ₹{receipt.amount.toLocaleString()}
//                             </TableCell>
//                             <TableCell className="py-2">
//                               <p className="text-xs capitalize whitespace-nowrap">{receipt.payment_mode}</p>
//                               {receipt.bank_name && (
//                                 <p className="text-[10px] text-slate-500">{receipt.bank_name}</p>
//                               )}
//                             </TableCell>
//                             <TableCell className="py-2">
//                               <p className="text-xs whitespace-nowrap">{receipt.room_number || 'N/A'}</p>
//                               {receipt.bed_number && (
//                                 <p className="text-[10px] text-slate-500">Bed #{receipt.bed_number}</p>
//                               )}
//                             </TableCell>
//                             <TableCell className="py-2">
//                               <div className="flex items-center gap-1 justify-center">
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   className="h-7 w-7 p-0"
//                                   onClick={() => paymentApi.previewReceipt(receipt.id)}
//                                   title="Preview Receipt"
//                                 >
//                                   <Eye className="h-3.5 w-3.5" />
//                                 </Button>
//                                 <Button
//                                   size="sm"
//                                   variant="ghost"
//                                   className="h-7 w-7 p-0"
//                                   onClick={() => paymentApi.downloadReceipt(receipt.id)}
//                                   title="Download Receipt"
//                                 >
//                                   <Download className="h-3.5 w-3.5" />
//                                 </Button>
//                               </div>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Add Payment Dialog */}
//       <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
//           <DialogHeader className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-t-lg sticky top-0 z-10">
//             <DialogClose asChild>
//               <button className="absolute right-4 top-4 text-white/80 hover:text-white transition">
//                 <X className="h-5 w-5" />
//               </button>
//             </DialogClose>
//             <DialogTitle className="flex items-center gap-2 text-lg">
//               <Plus className="h-5 w-5" />
//               Record New Payment
//             </DialogTitle>
//             <DialogDescription className="text-blue-50 text-sm">
//               Add a new payment record for a tenant
//             </DialogDescription>
//           </DialogHeader>

//           <div className="p-4 space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Tenant *</Label>
//                 <Select value={newPayment.tenant_id} onValueChange={handleTenantSelect}>
//                   <SelectTrigger className="h-8 text-sm">
//                     <SelectValue placeholder="Select tenant" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {tenants.map(tenant => (
//                       <SelectItem key={tenant.id} value={tenant.id.toString()}>
//                         {tenant.full_name} - {tenant.phone}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {bookingLoading && (
//                   <div className="flex items-center gap-1 mt-1">
//                     <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
//                     <p className="text-[10px] text-slate-400">Loading tenant details...</p>
//                   </div>
//                 )}
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Payment Type</Label>
//                 <Select value={newPayment.payment_type} onValueChange={(value) => setNewPayment({ ...newPayment, payment_type: value })}>
//                   <SelectTrigger className="h-8 text-sm">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="rent">Rent</SelectItem>
//                     <SelectItem value="security_deposit">Security Deposit</SelectItem>
//                     <SelectItem value="maintenance">Maintenance</SelectItem>
//                     <SelectItem value="electricity">Electricity</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Payment Summary */}
//             {paymentFormData && <PaymentSummary formData={paymentFormData} />}

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Amount (₹) *</Label>
//                 <Input
//                   type="number"
//                   placeholder="Enter amount"
//                   value={newPayment.amount}
//                   onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
//                   className="h-8 text-sm"
//                 />
//                 {paymentFormData && (
//                   <p className="text-[10px] text-purple-600 mt-1">
//                     Suggested: ₹{paymentFormData.suggested_amount.toLocaleString('en-IN')}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Payment Mode *</Label>
//                 <Select 
//                   value={newPayment.payment_mode} 
//                   onValueChange={(value) => setNewPayment({ ...newPayment, payment_mode: value, bank_name: '' })}
//                 >
//                   <SelectTrigger className="h-8 text-sm">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="cash">Cash</SelectItem>
//                     <SelectItem value="online">Online</SelectItem>
//                     <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
//                     <SelectItem value="cheque">Cheque</SelectItem>
//                     <SelectItem value="card">Card</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {(newPayment.payment_mode === 'bank_transfer' || newPayment.payment_mode === 'online') && (
//                 <div className="space-y-1">
//                   <Label className="text-xs font-medium">Bank Name</Label>
//                   <Input
//                     placeholder="Enter bank name"
//                     value={newPayment.bank_name}
//                     onChange={(e) => setNewPayment({ ...newPayment, bank_name: e.target.value })}
//                     className="h-8 text-sm"
//                   />
//                 </div>
//               )}

//               {(newPayment.payment_mode === 'online' || newPayment.payment_mode === 'bank_transfer' || newPayment.payment_mode === 'cheque') && (
//                 <div className="space-y-1">
//                   <Label className="text-xs font-medium">Transaction ID / Cheque No.</Label>
//                   <Input
//                     placeholder="Optional"
//                     value={newPayment.transaction_id}
//                     onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })}
//                     className="h-8 text-sm"
//                   />
//                 </div>
//               )}

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Payment Date</Label>
//                 <Input
//                   type="date"
//                   value={newPayment.payment_date}
//                   onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
//                   className="h-8 text-sm"
//                 />
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Remark</Label>
//                 <Input
//                   placeholder="Additional notes"
//                   value={newPayment.remark}
//                   onChange={(e) => setNewPayment({ ...newPayment, remark: e.target.value })}
//                   className="h-8 text-sm"
//                 />
//               </div>
//             </div>

//             {/* Proof Upload Field */}
//             {(newPayment.payment_mode === 'online' || newPayment.payment_mode === 'bank_transfer') && (
//               <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
//                 <Label className="text-xs font-medium">Payment Proof (Screenshot)</Label>
//                 <div className="flex items-center gap-3">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     className="h-8 text-xs"
//                     onClick={() => document.getElementById('proof-upload')?.click()}
//                   >
//                     <Upload className="h-3 w-3 mr-1" />
//                     {proofFile ? 'Change File' : 'Upload Proof'}
//                   </Button>
//                   <input
//                     type="file"
//                     id="proof-upload"
//                     accept="image/*,.pdf"
//                     className="hidden"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (file) {
//                         setProofFile(file);
//                         if (file.type.startsWith('image/')) {
//                           const reader = new FileReader();
//                           reader.onloadend = () => {
//                             setProofPreview(reader.result as string);
//                           };
//                           reader.readAsDataURL(file);
//                         }
//                       }
//                     }}
//                   />
//                   {proofFile && (
//                     <span className="text-xs text-slate-600 truncate max-w-[200px]">
//                       {proofFile.name}
//                     </span>
//                   )}
//                 </div>
//                 {proofPreview && (
//                   <div className="mt-2">
//                     <img 
//                       src={proofPreview} 
//                       alt="Preview" 
//                       className="max-h-32 rounded border border-slate-200"
//                     />
//                   </div>
//                 )}
//                 <p className="text-[10px] text-slate-400">
//                   Upload screenshot of payment (JPG, PNG, PDF up to 5MB)
//                 </p>
//               </div>
//             )}
//           </div>

//           <DialogFooter className="p-4 bg-slate-50 rounded-b-lg grid grid-cols-2 gap-2 sm:flex sm:justify-end">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 setIsAddPaymentOpen(false);
//                 resetPaymentForm();
//               }}
//               className="w-full sm:w-auto"
//             >
//               Cancel
//             </Button>
//             <Button
//               size="sm"
//               onClick={handleAddPayment}
//               className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
//             >
//               Add Payment
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Demand Payment Dialog */}
//       <Dialog open={isDemandPaymentOpen} onOpenChange={setIsDemandPaymentOpen}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
//           <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-lg sticky top-0 z-10">
//             <DialogClose asChild>
//               <button className="absolute right-4 top-4 text-white/80 hover:text-white transition">
//                 <X className="h-5 w-5" />
//               </button>
//             </DialogClose>
//             <DialogTitle className="flex items-center gap-2 text-lg">
//               <Bell className="h-5 w-5" />
//               Demand Payment
//             </DialogTitle>
//             <DialogDescription className="text-orange-50 text-sm">
//               Create a payment request and notify the tenant
//             </DialogDescription>
//           </DialogHeader>

//           <div className="p-4 space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Tenant *</Label>
//                 <Select value={demandPayment.tenant_id} onValueChange={handleDemandTenantSelect}>
//                   <SelectTrigger className="h-8 text-sm">
//                     <SelectValue placeholder="Select tenant" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {tenants.map(tenant => (
//                       <SelectItem key={tenant.id} value={tenant.id.toString()}>
//                         {tenant.full_name} - {tenant.phone}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {bookingLoading && (
//                   <div className="flex items-center gap-1 mt-1">
//                     <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
//                     <p className="text-[10px] text-slate-400">Loading tenant details...</p>
//                   </div>
//                 )}
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Payment Type</Label>
//                 <Select value={demandPayment.payment_type} onValueChange={(value) => setDemandPayment({ ...demandPayment, payment_type: value })}>
//                   <SelectTrigger className="h-8 text-sm">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="rent">Rent</SelectItem>
//                     <SelectItem value="security_deposit">Security Deposit</SelectItem>
//                     <SelectItem value="maintenance">Maintenance</SelectItem>
//                     <SelectItem value="electricity">Electricity</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Payment Summary for Demand */}
//             {paymentFormData && <PaymentSummary formData={paymentFormData} />}

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Amount (₹) *</Label>
//                 <Input
//                   type="number"
//                   placeholder="Enter amount"
//                   value={demandPayment.amount || ''}
//                   onChange={(e) => setDemandPayment({ ...demandPayment, amount: parseFloat(e.target.value) || 0 })}
//                   className="h-8 text-sm"
//                 />
//                 {paymentFormData && (
//                   <p className="text-[10px] text-purple-600 mt-1">
//                     Suggested: ₹{paymentFormData.suggested_amount.toLocaleString('en-IN')}
//                   </p>
//                 )}
//               </div>

//               <div className="space-y-1">
//                 <Label className="text-xs font-medium">Due Date *</Label>
//                 <Input
//                   type="date"
//                   value={demandPayment.due_date}
//                   onChange={(e) => setDemandPayment({ ...demandPayment, due_date: e.target.value })}
//                   className="h-8 text-sm"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1">
//               <Label className="text-xs font-medium">Description</Label>
//               <Textarea
//                 placeholder="Enter payment description"
//                 value={demandPayment.description}
//                 onChange={(e) => setDemandPayment({ ...demandPayment, description: e.target.value })}
//                 rows={2}
//                 className="text-sm"
//               />
//             </div>

//             <div className="bg-slate-50 p-3 rounded-lg space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label className="text-xs font-medium">Late Fee Settings</Label>
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     id="include-late-fee"
//                     checked={demandPayment.include_late_fee}
//                     onChange={(e) => setDemandPayment({ ...demandPayment, include_late_fee: e.target.checked })}
//                     className="h-3 w-3"
//                   />
//                   <Label htmlFor="include-late-fee" className="text-xs">Include</Label>
//                 </div>
//               </div>

//               {demandPayment.include_late_fee && (
//                 <Input
//                   type="number"
//                   placeholder="Late fee amount"
//                   value={demandPayment.late_fee_amount || ''}
//                   onChange={(e) => setDemandPayment({ ...demandPayment, late_fee_amount: parseFloat(e.target.value) || 0 })}
//                   className="h-8 text-sm"
//                 />
//               )}
//             </div>

//             <div className="bg-slate-50 p-3 rounded-lg space-y-2">
//               <Label className="text-xs font-medium">Notifications</Label>
//               <div className="flex gap-3">
//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" id="send-email" checked={demandPayment.send_email} onChange={(e) => setDemandPayment({ ...demandPayment, send_email: e.target.checked })} className="h-3 w-3" />
//                   <Label htmlFor="send-email" className="text-xs">Email</Label>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" id="send-sms" checked={demandPayment.send_sms} onChange={(e) => setDemandPayment({ ...demandPayment, send_sms: e.target.checked })} className="h-3 w-3" />
//                   <Label htmlFor="send-sms" className="text-xs">SMS</Label>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <DialogFooter className="p-4 bg-slate-50 rounded-b-lg grid grid-cols-2 gap-2 sm:flex sm:justify-end">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 setIsDemandPaymentOpen(false);
//                 resetDemandPaymentForm();
//               }}
//               className="w-full sm:w-auto"
//             >
//               Cancel
//             </Button>
//             <Button
//               size="sm"
//               onClick={handleDemandPayment}
//               className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
//             >
//               <Send className="h-3.5 w-3.5 mr-1" />
//               Send Demand
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

























// app/admin/payments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Plus, CreditCard, FileText, Download, Search,
  AlertCircle, CheckCircle, XCircle, Bell,
  IndianRupee, X, Bed, User, CalendarDays,
  Upload, Eye, Clock, TrendingUp, TrendingDown,
  Building, MapPin, Wifi, Wind, Bath, Maximize,
  Loader2, Printer, EyeIcon, Banknote, Receipt,
  Send, Home, Calendar, AlertTriangle, CheckCircle2,
  Clock3, XCircle as XCircleIcon,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from "sonner";
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import APIs
import { listTenants, type Tenant } from '@/lib/tenantApi';
import * as paymentApi from '@/lib/paymentRecordApi';

// Types
interface PaymentFormData {
  tenant: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  room_info: {
    room_number: string;
    bed_number: number;
    bed_type: string;
    property_name: string;
  };
  monthly_rent: number;
  previous_month: {
    month: string;
    year: number;
    pending: number;
    paid: number;
  };
  current_month: {
    month: string;
    year: number;
    paid: number;
    pending: number;
  };
  total_pending: number;
  suggested_amount: number;
}

interface DemandPayment {
  id: number;
  tenant_id: number;
  amount: number;
  due_date: string;
  payment_type: string;
  description: string;
  late_fee: number;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  created_at: string;
  tenant_name?: string;
  tenant_phone?: string;
  room_number?: string;
  bed_number?: number;
  property_name?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<paymentApi.Payment[]>([]);
  const [receipts, setReceipts] = useState<paymentApi.Receipt[]>([]);
  const [demands, setDemands] = useState<DemandPayment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isDemandPaymentOpen, setIsDemandPaymentOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData | null>(null);
  const [activeTab, setActiveTab] = useState('payments');


  // Proof upload states
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
const [selectedPaymentMonth, setSelectedPaymentMonth] = useState('');
// Action states
const [selectedPayment, setSelectedPayment] = useState<any>(null);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
const [rejectionReason, setRejectionReason] = useState('');
const [actionLoading, setActionLoading] = useState(false);
// Add this state near your other useState declarations
const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
const [approvingPayment, setApprovingPayment] = useState<any>(null);
const [highlightedReceipt, setHighlightedReceipt] = useState<number | null>(null);
// Add this with your other useState declarations
const [expandedRows, setExpandedRows] = useState<number[]>([]);


  // Filters
  const [filters, setFilters] = useState({
    date: '',
    tenant: '',
    remark: '',
    amount: '',
    method: '',
    transactionId: '',
  });

  const [demandFilters, setDemandFilters] = useState({
    status: '',
    tenant: '',
    from_date: '',
    to_date: ''
  });

  const [stats, setStats] = useState({
    total_collected: 0,
    total_transactions: 0,
    online_payments: 0,
    cash_payments: 0,
    card_payments: 0,
    bank_transfers: 0,
    cheque_payments: 0,
    current_month_collected: 0,
    rent_collected: 0,
  });

  const [newPayment, setNewPayment] = useState({
    tenant_id: '',
    booking_id: null as number | null,
    payment_type: 'rent',
    amount: '',
    payment_mode: 'cash',
    bank_name: '',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    remark: ''
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
        loadDemands(),
        loadTenants(),
        loadStats()
      ]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // In the main component, add useEffect to clear highlight after some time
useEffect(() => {
  if (highlightedReceipt) {
    const timer = setTimeout(() => {
      setHighlightedReceipt(null);
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [highlightedReceipt]);

// Update the onViewReceipt handler
const handleViewReceipt = (receiptId: number) => {
  setHighlightedReceipt(receiptId);
  handlePreviewReceipt(receiptId);
};

// Toggle row expansion
const toggleRowExpansion = (paymentId: number) => {
  setExpandedRows(prev => 
    prev.includes(paymentId) 
      ? prev.filter(id => id !== paymentId) 
      : [...prev, paymentId]
  );
};

  const loadPayments = async () => {
    try {
      const response = await paymentApi.getPayments();
      if (response.success) {
        setPayments(response.data || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const loadReceipts = async () => {
    try {
      const response = await paymentApi.getReceipts();
      if (response.success) {
        setReceipts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

const loadDemands = async () => {
  try {
    console.log('Fetching demands...');
    const response = await paymentApi.getDemands();
    console.log('Demands response:', response);

    if (response && response.data) {
      // Enhance demands with tenant room/bed info and ensure numbers
      const enhancedDemands = await Promise.all(
        response.data.map(async (demand: DemandPayment) => {
          // Ensure amount and late_fee are numbers
          const processedDemand = {
            ...demand,
            amount: Number(demand.amount),
            late_fee: Number(demand.late_fee || 0)
          };

          try {
            const bedAssignment = await paymentApi.getTenantBedAssignment(demand.tenant_id);
            return {
              ...processedDemand,
              room_number: bedAssignment?.room?.room_number,
              bed_number: bedAssignment?.bed_number,
              property_name: bedAssignment?.property?.name
            };
          } catch (error) {
            console.warn(`Could not fetch bed assignment for tenant ${demand.tenant_id}:`, error);
            return processedDemand;
          }
        })
      );
      setDemands(enhancedDemands);
    } else {
      console.warn('No demands data received:', response);
      setDemands([]);
    }
  } catch (error) {
    console.error('Error loading demands:', error);
    setDemands([]);
  }
};

  const loadTenants = async () => {
    try {
      const response = await listTenants({ is_active: true });
      if (response.success && response.data) {
        setTenants(response.data);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await paymentApi.getPaymentStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

// In app/admin/payments/page.tsx
const handleTenantSelect = async (tenantId: string) => {
  setNewPayment(prev => ({ ...prev, tenant_id: tenantId, booking_id: null, amount: '' }));
  setPaymentFormData(null);

  if (!tenantId) return;

  setBookingLoading(true);
  try {
    const formResponse = await paymentApi.getTenantPaymentFormData(parseInt(tenantId));
    console.log('Payment Form Data from backend:', formResponse); // ADD THIS
    
    if (formResponse.success) {
      setPaymentFormData(formResponse.data);
      console.log('Form Data:', formResponse.data); // ADD THIS
      setNewPayment(prev => ({
        ...prev,
        amount: formResponse.data.suggested_amount.toString()
      }));
    }

  } catch (error) {
    console.error('Error loading tenant details:', error);
    toast.error('Failed to load tenant details');
  } finally {
    setBookingLoading(false);
  }
};

  const handleDemandTenantSelect = async (tenantId: string) => {
    setDemandPayment(prev => ({ ...prev, tenant_id: tenantId }));
    setPaymentFormData(null);

    if (!tenantId) return;

    setBookingLoading(true);
    try {
      const formResponse = await paymentApi.getTenantPaymentFormData(parseInt(tenantId));
      if (formResponse.success) {
        setPaymentFormData(formResponse.data);
        setDemandPayment(prev => ({
          ...prev,
          amount: formResponse.data.suggested_amount
        }));
      }

    } catch (error) {
      console.error('Error loading tenant details:', error);
      toast.error('Failed to load tenant details');
    } finally {
      setBookingLoading(false);
    }
  };

  // Add this function to handle receipt preview
const handlePreviewReceipt = async (receiptId: number) => {
   console.log('Preview receipt clicked:', receiptId);
  try {
    const response = await paymentApi.getReceiptById(receiptId);
    console.log('Receipt data response:', response);
    if (response.success) {
      setSelectedReceipt(response.data);
      setIsReceiptPreviewOpen(true);
      console.log('Receipt preview opened');
    } else {
      toast.error('Failed to load receipt');
    }
  } catch (error) {
    console.error('Error loading receipt:', error);
    toast.error('Failed to load receipt');
  }
};

// Update the handleAddPayment function
const handleAddPayment = async () => {
  if (!newPayment.tenant_id || !newPayment.amount) {
    toast.error('Please select a tenant and enter an amount');
    return;
  }

  try {
    // Prepare payment data
    const paymentData: any = {
      tenant_id: parseInt(newPayment.tenant_id),
      booking_id: newPayment.booking_id,
      payment_type: newPayment.payment_type,
      amount: parseFloat(newPayment.amount),
      payment_mode: newPayment.payment_mode,
      bank_name: newPayment.bank_name || null,
      transaction_id: newPayment.transaction_id || null,
      payment_date: newPayment.payment_date,
      remark: newPayment.remark || null,
    };

    // If a specific month is selected, add month information
    if (selectedPaymentMonth && selectedPaymentMonth !== 'current') {
      const [year, month] = selectedPaymentMonth.split('-');
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      
      paymentData.month = monthNames[parseInt(month) - 1];
      paymentData.year = parseInt(year);
      paymentData.remark = `Payment for ${paymentData.month} ${paymentData.year}` + 
                          (newPayment.remark ? ` - ${newPayment.remark}` : '');
    } else {
      // Default to current month
      const currentDate = new Date();
      paymentData.month = currentDate.toLocaleString('default', { month: 'long' });
      paymentData.year = currentDate.getFullYear();
      paymentData.remark = newPayment.remark || null;
    }

    const response = await paymentApi.createPayment(paymentData);

    if (response.success && response.data) {
      if (proofFile) {
        await paymentApi.uploadPaymentProof(response.data.id, proofFile);
      }

      toast.success('Payment added successfully');
      
      // Refresh the payment form data
      if (newPayment.tenant_id) {
        const formResponse = await paymentApi.getTenantPaymentFormData(parseInt(newPayment.tenant_id));
        if (formResponse.success) {
          setPaymentFormData(formResponse.data);
        }
      }
      
      setIsAddPaymentOpen(false);
      resetPaymentForm();
      await loadData();
    } else {
      toast.error(response.message || 'Failed to add payment');
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to add payment');
  }
};

  const handleDemandPayment = async () => {
    if (!demandPayment.tenant_id || !demandPayment.amount || !demandPayment.due_date) {
      toast.error('Please select tenant, enter amount, and set due date');
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        tenant_id: parseInt(demandPayment.tenant_id),
        amount: demandPayment.amount,
        due_date: demandPayment.due_date,
        payment_type: demandPayment.payment_type,
        description: demandPayment.description,
        include_late_fee: demandPayment.include_late_fee,
        late_fee_amount: demandPayment.late_fee_amount,
        send_email: demandPayment.send_email,
        send_sms: demandPayment.send_sms
      };

      const response = await paymentApi.createDemandPayment(payload);

      if (response.success) {
        toast.success('Payment demand sent to tenant successfully');
        setIsDemandPaymentOpen(false);
        resetDemandPaymentForm();
        await loadData();
      } else {
        toast.error(response.message || 'Failed to create payment demand');
      }
    } catch (error: any) {
      console.error('Error creating demand:', error);
      toast.error(error.message || 'Failed to create payment demand');
    } finally {
      setBookingLoading(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentFormData(null);
    setProofFile(null);
    setProofPreview(null);
    setSelectedPaymentMonth(''); // Reset month selection
    setNewPayment({
      tenant_id: '',
      booking_id: null,
      payment_type: 'rent',
      amount: '',
      payment_mode: 'cash',
      bank_name: '',
      transaction_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      remark: ''
    });
  };

  const resetDemandPaymentForm = () => {
    setPaymentFormData(null);
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

  // Payment action handlers
// Add this handler
const handleApproveClick = (payment: any) => {
  setApprovingPayment(payment);
  setIsApproveDialogOpen(true);
};

const handleConfirmApprove = async () => {
  if (!approvingPayment) return;
  
  setActionLoading(true);
  try {
    const response = await paymentApi.approvePayment(approvingPayment.id, 1); // Replace 1 with actual user ID
    if (response.success) {
      toast.success('Payment approved successfully');
      setIsApproveDialogOpen(false);
      setApprovingPayment(null);
      await loadData(); // Refresh data
    } else {
      toast.error(response.message || 'Failed to approve payment');
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to approve payment');
  } finally {
    setActionLoading(false);
  }
};

const handleRejectPayment = async () => {
  if (!rejectionReason.trim()) {
    toast.error('Please provide a rejection reason');
    return;
  }
  
  setActionLoading(true);
  try {
    const response = await paymentApi.rejectPayment(selectedPayment.id, rejectionReason, 1); // Replace 1 with actual user ID
    if (response.success) {
      toast.success('Payment rejected successfully');
      setIsRejectDialogOpen(false);
      setSelectedPayment(null);
      setRejectionReason('');
      await loadData(); // Refresh data
    } else {
      toast.error(response.message || 'Failed to reject payment');
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to reject payment');
  } finally {
    setActionLoading(false);
  }
};

const handleDeletePayment = async () => {
  setActionLoading(true);
  try {
    const response = await paymentApi.deletePayment(selectedPayment.id);
    if (response.success) {
      toast.success('Payment deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
      await loadData(); // Refresh data
    } else {
      toast.error(response.message || 'Failed to delete payment');
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete payment');
  } finally {
    setActionLoading(false);
  }
};

const handleUpdatePayment = async (updatedData: any) => {
  setActionLoading(true);
  try {
    const response = await paymentApi.updatePayment(selectedPayment.id, updatedData);
    if (response.success) {
      toast.success('Payment updated successfully');
      setIsEditDialogOpen(false);
      setSelectedPayment(null);
      await loadData(); // Refresh data
    } else {
      toast.error(response.message || 'Failed to update payment');
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to update payment');
  } finally {
    setActionLoading(false);
  }
};

  const getTenantName = (tenantId: number) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.full_name || 'Unknown Tenant';
  };

  const getTenantPhone = (tenantId: number) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.phone || '';
  };

  const getDemandStatusBadge = (status: string) => {
    const variants: Record<string, { className: string, icon: any }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock3 },
      paid: { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
      partial: { className: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle },
      overdue: { className: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
      cancelled: { className: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircleIcon }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1 text-xs px-2 py-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  // Bed Assignment Details Component - Table Row Format
  const BedAssignmentTable = ({ formData }: { formData: PaymentFormData | null }) => {
    if (!formData?.room_info) return null;

    return (
      <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
            <Bed className="h-3.5 w-3.5" />
            Bed Assignment Details
          </h4>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-2 text-xs font-medium text-slate-600">Property</th>
                <th className="text-left p-2 text-xs font-medium text-slate-600">Room</th>
                <th className="text-left p-2 text-xs font-medium text-slate-600">Bed #</th>
                <th className="text-left p-2 text-xs font-medium text-slate-600">Bed Type</th>
                <th className="text-left p-2 text-xs font-medium text-slate-600">Monthly Rent</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200">
                <td className="p-2 text-sm">{formData.room_info.property_name}</td>
                <td className="p-2 text-sm">{formData.room_info.room_number}</td>
                <td className="p-2 text-sm font-medium">#{formData.room_info.bed_number}</td>
                <td className="p-2 text-sm capitalize">{formData.room_info.bed_type}</td>
                <td className="p-2 text-sm font-semibold text-green-600">₹{formData.monthly_rent.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Rent Summary Table Component

// Enhanced Rent Summary Table Component - Fixed to display actual data
const RentSummaryTable = ({ formData }: { formData: PaymentFormData | null }) => {
  if (!formData) return null;

  // Use the month_wise_history from backend
  const months = formData.month_wise_history || [];
  
  // Calculate totals from the month-wise data
  const totalPaid = months.reduce((sum, month) => sum + (month.paid || 0), 0);
  const totalExpected = months.reduce((sum, month) => sum + (month.rent || formData.monthly_rent), 0);
  const totalPending = totalExpected - totalPaid;

  console.log('Rent Summary Table Data:', {
    months,
    totalPaid,
    totalExpected,
    totalPending,
    suggested: formData.suggested_amount
  });

  return (
    <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
        <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
          <IndianRupee className="h-3.5 w-3.5" />
          Rent History Since Joining
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          {months.length > 0 ? 
            `Showing from ${months[0]?.month} ${months[0]?.year} to ${months[months.length-1]?.month} ${months[months.length-1]?.year}` :
            'No history available'
          }
        </p>
      </div>
      
      <div className="p-4 max-h-[300px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              <th className="text-left p-2 text-xs font-medium text-slate-600">Month</th>
              <th className="text-right p-2 text-xs font-medium text-slate-600">Rent</th>
              <th className="text-right p-2 text-xs font-medium text-slate-600">Paid</th>
              <th className="text-right p-2 text-xs font-medium text-slate-600">Pending</th>
              <th className="text-center p-2 text-xs font-medium text-slate-600">Status</th>
            </tr>
          </thead>
<tbody>
  {months.map((month, index) => (
    <tr key={index} className={`border-t border-slate-200 ${
      month.isCurrentMonth ? 'bg-blue-50' : ''
    }`}>
      <td className="p-2 text-sm">
        {month.month} {month.year}
        {month.isCurrentMonth && (
          <span className="ml-2 text-xs text-blue-600 font-medium">(Current)</span>
        )}
      </td>
      <td className="p-2 text-right">₹{month.rent.toLocaleString()}</td>
      <td className="p-2 text-right text-green-600">₹{month.paid.toLocaleString()}</td>
      <td className="p-2 text-right text-amber-600 font-medium">
        ₹{month.pending.toLocaleString()}
      </td>
      <td className="p-2 text-center">
        {month.status === 'paid' ? (
          <Badge className="bg-green-100 text-green-800 text-xs">Paid</Badge>
        ) : month.status === 'partial' ? (
          <Badge className="bg-blue-100 text-blue-800 text-xs">Partial</Badge>
        ) : month.status === 'overdue' ? (
          <Badge className="bg-red-100 text-red-800 text-xs">Overdue</Badge>
        ) : (
          <Badge variant="outline" className="bg-slate-100 text-xs">Pending</Badge>
        )}
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50 border-t border-slate-200">
        <div className="bg-white p-2 rounded border border-slate-200">
          <p className="text-xs text-slate-500">Months Since Joining</p>
          <p className="text-lg font-bold text-slate-700">{months.length}</p>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <p className="text-xs text-slate-500">Monthly Rent</p>
          <p className="text-lg font-bold text-green-600">₹{formData.monthly_rent.toLocaleString()}</p>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <p className="text-xs text-slate-500">Suggested Payment</p>
          <p className="text-lg font-bold text-purple-600">₹{formData.suggested_amount.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

  // Filtered payments
  const filteredPayments = payments.filter(payment => {
    const tenantName = getTenantName(payment.tenant_id).toLowerCase();

    const matchesDate = !filters.date ||
      format(new Date(payment.payment_date), 'dd/MM/yy').includes(filters.date);

    const matchesTenant = !filters.tenant ||
      tenantName.includes(filters.tenant.toLowerCase());

    const matchesRemark = !filters.remark ||
      (payment.remark && payment.remark.toLowerCase().includes(filters.remark.toLowerCase()));

    const matchesAmount = !filters.amount ||
      payment.amount.toString().includes(filters.amount);

    const matchesMethod = !filters.method ||
      payment.payment_mode.toLowerCase().includes(filters.method.toLowerCase());

    const matchesTransactionId = !filters.transactionId ||
      (payment.transaction_id && payment.transaction_id.toLowerCase().includes(filters.transactionId.toLowerCase()));

    return matchesDate && matchesTenant && matchesRemark && matchesAmount &&
           matchesMethod && matchesTransactionId;
  });

  // Filtered demands - with null checks to prevent crashes
const filteredDemands = demands.filter(demand => {
  const tenantName = getTenantName(demand.tenant_id).toLowerCase();

  const matchesStatus = demandFilters.status === 'all' || !demandFilters.status || demand.status === demandFilters.status;
  const matchesTenant = !demandFilters.tenant || tenantName.includes(demandFilters.tenant.toLowerCase());
  const matchesFromDate = !demandFilters.from_date || new Date(demand.created_at) >= new Date(demandFilters.from_date);
  const matchesToDate = !demandFilters.to_date || new Date(demand.created_at) <= new Date(demandFilters.to_date);

  return matchesStatus && matchesTenant && matchesFromDate && matchesToDate;
});

const handleUpdateDemandStatus = async (demandId: number, newStatus: string) => {
  try {
    const response = await paymentApi.updateDemandStatus(demandId, newStatus);
    if (response.success) {
      toast.success(`Demand status updated to ${newStatus}`);
      // Refresh demands list
      loadDemands();
    } else {
      toast.error(response.message || 'Failed to update status');
    }
  } catch (error) {
    console.error('Error updating demand status:', error);
    toast.error('Failed to update status');
  }
};


  return (
    <div className="bg-slate-50">
      <div className="p-0 sm:p-0 md:p-0 space-y-2 sm:space-y-3">
        {/* Compact Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 sticky top-16 z-10">
          <StatCard
            title="Collected"
            value={`₹${stats?.total_collected?.toLocaleString() || '0'}`}
            icon={IndianRupee}
            color="bg-blue-600"
            bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          />
          <StatCard
            title="This Month"
            value={`₹${stats?.current_month_collected?.toLocaleString() || '0'}`}
            icon={TrendingUp}
            color="bg-green-600"
            bgColor="bg-gradient-to-br from-green-50 to-green-100"
          />
          <StatCard
            title="Transactions"
            value={stats?.total_transactions || 0}
            icon={CreditCard}
            color="bg-purple-600"
            bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          />
          <StatCard
            title="Rent Collected"
            value={`₹${stats?.rent_collected?.toLocaleString() || '0'}`}
            icon={Banknote}
            color="bg-amber-600"
            bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
          />
        </div>

        {/* Tabs Container */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sticky top-28 z-10 bg-slate-50 py-2">
            <TabsList className="h-8 w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
              <TabsTrigger value="payments" className="text-xs px-3 py-1">Payments Management</TabsTrigger>
              <TabsTrigger value="receipts" className="text-xs px-3 py-1">Payment Receipts</TabsTrigger>
              <TabsTrigger value="demands" className="text-xs px-3 py-1">Demands Payment</TabsTrigger>
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

          {/* Payments Tab Content */}
          <TabsContent value="payments" className="space-y-2 mt-0">
            <PaymentsTable
              payments={filteredPayments}
              loading={loading}
              filters={filters}
              setFilters={setFilters}
              getTenantName={getTenantName}
              getTenantPhone={getTenantPhone}
              // Add these props
   onApprove={handleApproveClick} 
  onReject={(payment) => {
    setSelectedPayment(payment);
    setIsRejectDialogOpen(true);
  }}
  onEdit={(payment) => {
    setSelectedPayment(payment);
    setNewPayment({
      tenant_id: payment.tenant_id.toString(),
      booking_id: payment.booking_id,
      payment_type: payment.payment_type,
      amount: payment.amount.toString(),
      payment_mode: payment.payment_mode,
      bank_name: payment.bank_name || '',
      transaction_id: payment.transaction_id || '',
      payment_date: payment.payment_date.split('T')[0],
      remark: payment.remark || ''
    });
    setIsEditDialogOpen(true);
  }}
  onDelete={(payment) => {
    setSelectedPayment(payment);
    setIsDeleteDialogOpen(true);
  }}
  actionLoading={actionLoading}
    onApproveClick={handleApproveClick}
  setActiveTab={setActiveTab}
  expandedRows={expandedRows}
  onToggleExpand={toggleRowExpansion}
  onViewReceipt={(receiptId) => {
    // Open receipt preview
    handlePreviewReceipt(receiptId);
  }}

            />
          </TabsContent>

          {/* Demands Tab Content */}
          <TabsContent value="demands" className="mt-0">
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg sticky top-0 z-10">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4" />
                  Payment Demands
                </CardTitle>
                <CardDescription className="text-orange-100 text-xs">
                  View and manage payment requests sent to tenants
                </CardDescription>
              </CardHeader>

              <CardContent className="p-2">
                {/* Demand Filters */}
                <div className="grid grid-cols-4 gap-2 mb-3 p-2 bg-slate-50 rounded-lg">
                  <Input
                    placeholder="Filter by tenant"
                    value={demandFilters.tenant}
                    onChange={(e) => setDemandFilters({ ...demandFilters, tenant: e.target.value })}
                    className="h-8 text-xs"
                  />
                  <Select value={demandFilters.status} onValueChange={(value) => setDemandFilters({ ...demandFilters, status: value })}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    placeholder="From"
                    value={demandFilters.from_date}
                    onChange={(e) => setDemandFilters({ ...demandFilters, from_date: e.target.value })}
                    className="h-8 text-xs"
                  />
                  <Input
                    type="date"
                    placeholder="To"
                    value={demandFilters.to_date}
                    onChange={(e) => setDemandFilters({ ...demandFilters, to_date: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="overflow-auto max-h-[calc(100vh-420px)]">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-white">
                      <TableRow className="bg-slate-100">
                        <TableHead className="text-xs py-2">Date</TableHead>
                        <TableHead className="text-xs py-2">Tenant</TableHead>
                        <TableHead className="text-xs py-2">Amount</TableHead>
                        <TableHead className="text-xs py-2">Late Fee</TableHead>
                        <TableHead className="text-xs py-2">Total</TableHead>
                        <TableHead className="text-xs py-2">Due Date</TableHead>
                        <TableHead className="text-xs py-2">Status</TableHead>
                        <TableHead className="text-xs py-2">Room/Bed</TableHead>
                        <TableHead className="text-xs py-2">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
<TableBody>
  {loading ? (
    <TableRow>
      <TableCell colSpan={8} className="text-center py-8 text-xs text-slate-500">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-2" />
          Loading demands...
        </div>
      </TableCell>
    </TableRow>
  ) : filteredDemands.length === 0 ? (
    <TableRow>
      <TableCell colSpan={8} className="text-center py-8 text-xs text-slate-500">
        <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
        No demands found
      </TableCell>
    </TableRow>
  ) : (
    filteredDemands.map((demand) => (
      <TableRow key={demand.id} className="hover:bg-slate-50">
        <TableCell className="py-2 text-xs whitespace-nowrap">
          {format(new Date(demand.created_at), 'dd/MM/yy')}
        </TableCell>
        <TableCell className="py-2">
          <p className="text-xs font-medium">{getTenantName(demand.tenant_id)}</p>
          <p className="text-[10px] text-slate-500">{getTenantPhone(demand.tenant_id)}</p>
        </TableCell>
        <TableCell className="py-2 text-xs font-medium">
          ₹{Number(demand.amount).toLocaleString('en-IN')}
        </TableCell>
        <TableCell className="py-2 text-xs text-amber-600">
          {demand.late_fee > 0 ? `+₹${Number(demand.late_fee).toLocaleString('en-IN')}` : '-'}
        </TableCell>
        <TableCell className="py-2 text-xs font-bold text-purple-600">
          ₹{(Number(demand.amount) + Number(demand.late_fee || 0)).toLocaleString('en-IN')}
        </TableCell>
        <TableCell className="py-2 text-xs whitespace-nowrap">
          <span className={new Date(demand.due_date) < new Date() && demand.status === 'pending' ? 'text-red-600 font-medium' : ''}>
            {format(new Date(demand.due_date), 'dd/MM/yy')}
          </span>
        </TableCell>
        <TableCell className="py-2">
          {getDemandStatusBadge(demand.status)}
        </TableCell>
        <TableCell className="py-2 text-xs">
          {demand.room_number || 'N/A'} {demand.bed_number ? `(B-${demand.bed_number})` : ''}
        </TableCell>
<TableCell className="py-2">
  <Select
    value={demand.status}
    onValueChange={(newStatus) => handleUpdateDemandStatus(demand.id, newStatus)}
  >
    <SelectTrigger className="h-7 w-24 text-xs">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="pending">Pending</SelectItem>
      <SelectItem value="paid">Paid</SelectItem>
      <SelectItem value="partial">Partial</SelectItem>
      <SelectItem value="overdue">Overdue</SelectItem>
      <SelectItem value="cancelled">Cancelled</SelectItem>
    </SelectContent>
  </Select>
</TableCell>
      </TableRow>
    ))
  )}
</TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receipts Tab Content */}
          <TabsContent value="receipts" className="mt-0">
            <ReceiptsTable
              receipts={receipts}
              loading={loading}
              getTenantName={getTenantName}
              highlightedReceipt={highlightedReceipt}
    onPreviewReceipt={handlePreviewReceipt}
    onDownloadReceipt={paymentApi.downloadReceipt}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Payment Dialog - Your existing code with horizontal layout */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="max-w-4xl max-h-[600px] p-0 gap-0 overflow-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-lg">
                    <Plus className="h-5 w-5" />
                  </div>
                  Record New Payment
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-sm mt-1">
                  Add a new payment record for a tenant
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Tenant Selection Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Tenant *</Label>
                <Select value={newPayment.tenant_id} onValueChange={handleTenantSelect}>
                  <SelectTrigger className="h-10 bg-white border-slate-200">
                    <SelectValue placeholder="Choose a tenant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{tenant.full_name}</span>
                          <span className="text-xs text-slate-400">({tenant.phone})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {bookingLoading && (
                  <div className="flex items-center gap-2 mt-1 text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-xs">Loading tenant details...</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Payment Type</Label>
                <Select value={newPayment.payment_type} onValueChange={(value) => setNewPayment({ ...newPayment, payment_type: value })}>
                  <SelectTrigger className="h-10">
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
            </div>

            {/* Bed Assignment Table */}
            {paymentFormData && <BedAssignmentTable formData={paymentFormData} />}

            {/* Rent Summary Table */}
            {paymentFormData && <RentSummaryTable formData={paymentFormData} />}

            {/* Payment Details Grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Amount (₹) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    className="pl-8 h-10"
                  />
                </div>
              </div>

              {/* NEW: Month Selection Field */}
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-slate-700">Pay For Month</Label>
    <Select 
      value={selectedPaymentMonth} 
      onValueChange={(value) => {
        setSelectedPaymentMonth(value);
        if (value && paymentFormData) {
          // Find the selected month from unpaid_months
          const selectedMonth = paymentFormData.unpaid_months?.find(m => m.month_key === value);
          if (selectedMonth) {
            // Optionally auto-fill the amount with pending amount
            setNewPayment(prev => ({
              ...prev,
              amount: selectedMonth.pending.toString()
            }));
          }
        }
      }}
    >
      <SelectTrigger className="h-10 bg-white border-slate-200">
        <SelectValue placeholder="Select month..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="current">Current Month (Default)</SelectItem>
        {paymentFormData?.unpaid_months?.map((month) => (
          <SelectItem key={month.month_key} value={month.month_key}>
            <div className="flex items-center justify-between w-full">
              <span>{month.month} {month.year}</span>
              <span className="ml-4 text-xs text-amber-600 font-medium">
                ₹{month.pending.toLocaleString()}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {paymentFormData?.unpaid_months?.length === 0 && (
      <p className="text-xs text-green-600 mt-1">All months paid! 🎉</p>
    )}
  </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Payment Mode *</Label>
                <Select
                  value={newPayment.payment_mode}
                  onValueChange={(value) => setNewPayment({ ...newPayment, payment_mode: value, bank_name: '' })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="online">🌐 Online</SelectItem>
                    <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                    <SelectItem value="cheque">📝 Cheque</SelectItem>
                    <SelectItem value="card">💳 Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Transaction Date</Label>
                <Input
                  type="date"
                  value={newPayment.payment_date}
                  onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                  className="h-10"
                />
              </div>

              
            </div>

            {/* Conditional Fields Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(newPayment.payment_mode === 'bank_transfer' || newPayment.payment_mode === 'online') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">Bank Name</Label>
                  <Input
                    placeholder="Enter bank name"
                    value={newPayment.bank_name}
                    onChange={(e) => setNewPayment({ ...newPayment, bank_name: e.target.value })}
                    className="h-10"
                  />
                </div>
              )}

              {(newPayment.payment_mode === 'online' || newPayment.payment_mode === 'bank_transfer' || newPayment.payment_mode === 'cheque') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">Transaction ID</Label>
                  <Input
                    placeholder="Optional"
                    value={newPayment.transaction_id}
                    onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })}
                    className="h-10"
                  />
                </div>
              )}

              {(newPayment.payment_mode === 'online' || newPayment.payment_mode === 'bank_transfer') && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">Proof</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10 w-full justify-start"
                    onClick={() => document.getElementById('proof-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {proofFile ? proofFile.name : 'Upload proof'}
                  </Button>
                  <input
                    type="file"
                    id="proof-upload"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProofFile(file);
                        if (file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProofPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>

            

            {/* Proof Preview */}
            {proofPreview && (
              <div className="mb-4">
                <img src={proofPreview} alt="Preview" className="h-20 rounded border" />
              </div>
            )}

            <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Remark</Label>
                <Input
                  placeholder="Add notes"
                  value={newPayment.remark}
                  onChange={(e) => setNewPayment({ ...newPayment, remark: e.target.value })}
                  className="h-10"
                />
              </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg sticky bottom-0">
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddPaymentOpen(false);
                  resetPaymentForm();
                }}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPayment}
                className="px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demand Payment Dialog */}
      <Dialog open={isDemandPaymentOpen} onOpenChange={setIsDemandPaymentOpen}>
        <DialogContent className="max-w-4xl max-h-[600px] p-0 gap-0 overflow-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 rounded-t-lg sticky top-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-lg">
                    <Bell className="h-5 w-5" />
                  </div>
                  Demand Payment
                </DialogTitle>
                <DialogDescription className="text-orange-100 text-sm mt-1">
                  Create a payment request and notify the tenant
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Top Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Tenant *</Label>
                <Select value={demandPayment.tenant_id} onValueChange={handleDemandTenantSelect}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id.toString()}>
                        {tenant.full_name} - {tenant.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Payment Type</Label>
                <Select value={demandPayment.payment_type} onValueChange={(value) => setDemandPayment({ ...demandPayment, payment_type: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="electricity">Electricity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bed Assignment Table for Demand */}
            {paymentFormData && <BedAssignmentTable formData={paymentFormData} />}

            {/* Rent Summary Table for Demand */}
            {paymentFormData && <RentSummaryTable formData={paymentFormData} />}

            {/* Amount and Due Date Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Amount (₹) *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={demandPayment.amount || ''}
                  onChange={(e) => setDemandPayment({ ...demandPayment, amount: parseFloat(e.target.value) || 0 })}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Due Date *</Label>
                <Input
                  type="date"
                  value={demandPayment.due_date}
                  onChange={(e) => setDemandPayment({ ...demandPayment, due_date: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <Label className="text-xs font-medium text-slate-700">Description</Label>
              <Textarea
                placeholder="Enter payment description"
                value={demandPayment.description}
                onChange={(e) => setDemandPayment({ ...demandPayment, description: e.target.value })}
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Late Fee */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-medium">Late Fee</Label>
                  <input
                    type="checkbox"
                    checked={demandPayment.include_late_fee}
                    onChange={(e) => setDemandPayment({ ...demandPayment, include_late_fee: e.target.checked })}
                    className="h-4 w-4"
                  />
                </div>
                {demandPayment.include_late_fee && (
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={demandPayment.late_fee_amount || ''}
                    onChange={(e) => setDemandPayment({ ...demandPayment, late_fee_amount: parseFloat(e.target.value) || 0 })}
                    className="h-8 text-sm"
                  />
                )}
              </div>

              {/* Notifications */}
              <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                <Label className="text-xs font-medium block mb-2">Send Notifications</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={demandPayment.send_email} onChange={(e) => setDemandPayment({ ...demandPayment, send_email: e.target.checked })} />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={demandPayment.send_sms} onChange={(e) => setDemandPayment({ ...demandPayment, send_sms: e.target.checked })} />
                    <span className="text-sm">SMS</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Amount Summary Cards */}
            {demandPayment.amount > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600">Base Amount</p>
                  <p className="text-lg font-bold text-blue-700">₹{demandPayment.amount.toLocaleString()}</p>
                </div>
                {demandPayment.include_late_fee && demandPayment.late_fee_amount > 0 && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-600">Late Fee</p>
                    <p className="text-lg font-bold text-amber-700">+ ₹{demandPayment.late_fee_amount.toLocaleString()}</p>
                  </div>
                )}
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-600">Total Amount</p>
                  <p className="text-lg font-bold text-purple-700">
                    ₹{(demandPayment.amount + (demandPayment.include_late_fee ? demandPayment.late_fee_amount : 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg sticky bottom-0">
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDemandPaymentOpen(false);
                  resetDemandPaymentForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDemandPayment}
                disabled={bookingLoading}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Demand
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

{/* Approve Payment Dialog */}
<Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        Approve Payment
      </DialogTitle>
      <DialogDescription>
        Are you sure you want to approve this payment? A receipt will be generated and the you will be able to view it .
      </DialogDescription>
    </DialogHeader>
    
    {approvingPayment && (
      <div className="py-4">
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-800">
            {getTenantName(approvingPayment.tenant_id)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Amount: ₹{approvingPayment.amount.toLocaleString()} • {approvingPayment.month} {approvingPayment.year}
          </p>
          <p className="text-xs text-green-600">
            Mode: {approvingPayment.payment_mode}
          </p>
        </div>
      </div>
    )}
    
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setIsApproveDialogOpen(false);
          setApprovingPayment(null);
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={handleConfirmApprove}
        disabled={actionLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {actionLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Approving...
          </>
        ) : (
          'Approve Payment'
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* Reject Payment Dialog */}
<Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <XCircle className="h-5 w-5 text-red-600" />
        Reject Payment
      </DialogTitle>
      <DialogDescription>
        Are you sure you want to reject this payment? Please provide a reason.
      </DialogDescription>
    </DialogHeader>
    
    <div className="py-4">
      <Label className="text-xs font-medium text-slate-700">Rejection Reason *</Label>
      <Textarea
        placeholder="Enter reason for rejection..."
        value={rejectionReason}
        onChange={(e) => setRejectionReason(e.target.value)}
        rows={3}
        className="mt-1"
      />
      
      {selectedPayment && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500">Payment Details:</p>
          <p className="text-sm font-medium mt-1">
            {getTenantName(selectedPayment.tenant_id)} - ₹{selectedPayment.amount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">
            {selectedPayment.month} {selectedPayment.year} • {selectedPayment.payment_mode}
          </p>
        </div>
      )}
    </div>
    
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setIsRejectDialogOpen(false);
          setSelectedPayment(null);
          setRejectionReason('');
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={handleRejectPayment}
        disabled={actionLoading || !rejectionReason.trim()}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        {actionLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Rejecting...
          </>
        ) : (
          'Reject Payment'
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Delete Payment Dialog */}
<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Trash2 className="h-5 w-5 text-red-600" />
        Delete Payment
      </DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this payment? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    
    {selectedPayment && (
      <div className="py-4">
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-800">
            {getTenantName(selectedPayment.tenant_id)}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Amount: ₹{selectedPayment.amount.toLocaleString()} • {selectedPayment.month} {selectedPayment.year}
          </p>
          <p className="text-xs text-red-600">
            Mode: {selectedPayment.payment_mode} • Status: {selectedPayment.status || 'pending'}
          </p>
        </div>
      </div>
    )}
    
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPayment(null);
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={handleDeletePayment}
        disabled={actionLoading}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        {actionLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Deleting...
          </>
        ) : (
          'Delete Payment'
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Edit Payment Dialog - Reuse your existing Add Payment dialog but with edit mode */}
<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="max-w-4xl max-h-[600px] p-0 gap-0 overflow-auto">
    {/* Header */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg sticky top-0 z-20">
      <div className="flex items-center justify-between">
        <div>
          <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            Edit Payment
          </DialogTitle>
          <DialogDescription className="text-blue-100 text-sm mt-1">
            Update payment details
          </DialogDescription>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
      </div>
    </div>

    {/* Form Content - Similar to Add Payment but with selectedPayment data */}
    <div className="p-6">
      {/* Use the same form fields as Add Payment, but values are already set */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">Tenant</Label>
          <Input
            value={getTenantName(parseInt(newPayment.tenant_id))}
            disabled
            className="h-10 bg-slate-50"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">Payment Type</Label>
          <Select 
            value={newPayment.payment_type} 
            onValueChange={(value) => setNewPayment({ ...newPayment, payment_type: value })}
          >
            <SelectTrigger className="h-10">
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
      </div>

      {/* Payment Details Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">Amount (₹) *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
            <Input
              type="number"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              className="pl-8 h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">Payment Mode *</Label>
          <Select
            value={newPayment.payment_mode}
            onValueChange={(value) => setNewPayment({ ...newPayment, payment_mode: value })}
          >
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">💵 Cash</SelectItem>
              <SelectItem value="online">🌐 Online</SelectItem>
              <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
              <SelectItem value="cheque">📝 Cheque</SelectItem>
              <SelectItem value="card">💳 Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">Payment Date</Label>
          <Input
            type="date"
            value={newPayment.payment_date}
            onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">Remark</Label>
          <Input
            placeholder="Add notes"
            value={newPayment.remark}
            onChange={(e) => setNewPayment({ ...newPayment, remark: e.target.value })}
            className="h-10"
          />
        </div>
      </div>

      {/* Bank details fields if needed */}
      {(newPayment.payment_mode === 'bank_transfer' || newPayment.payment_mode === 'online') && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">Bank Name</Label>
            <Input
              value={newPayment.bank_name}
              onChange={(e) => setNewPayment({ ...newPayment, bank_name: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">Transaction ID</Label>
            <Input
              value={newPayment.transaction_id}
              onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })}
              className="h-10"
            />
          </div>
        </div>
      )}
    </div>

    {/* Footer */}
    <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg sticky bottom-0">
      <div className="flex justify-end gap-3 w-full">
        <Button
          variant="outline"
          onClick={() => {
            setIsEditDialogOpen(false);
            resetPaymentForm();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => handleUpdatePayment(newPayment)}
          disabled={actionLoading}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
        >
          {actionLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Payment'
          )}
        </Button>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* Receipt Preview Dialog */}
<Dialog open={isReceiptPreviewOpen} onOpenChange={setIsReceiptPreviewOpen}>
  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Receipt className="h-5 w-5 text-blue-600" />
        Payment Receipt
      </DialogTitle>
      <DialogDescription>
        Receipt #{selectedReceipt?.id} - {selectedReceipt?.month} {selectedReceipt?.year}
      </DialogDescription>
    </DialogHeader>
    
    {selectedReceipt && (
      <div className="py-4">
        {/* Receipt Content */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-4 mb-4">
            <h2 className="text-2xl font-bold text-slate-800">ROOMAC</h2>
            <p className="text-sm text-slate-500">Premium Living Spaces</p>
            <p className="text-xs text-slate-400 mt-1">Payment Receipt</p>
          </div>

          {/* Receipt Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500">Receipt No.</p>
              <p className="text-sm font-medium">#{selectedReceipt.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Date</p>
              <p className="text-sm font-medium">
                {format(new Date(selectedReceipt.payment_date), 'dd MMM yyyy')}
              </p>
            </div>
          </div>

          {/* Tenant Details */}
          <div className="bg-slate-50 p-3 rounded-lg mb-4">
            <p className="text-xs font-medium text-slate-700 mb-2">Tenant Details</p>
            <p className="text-sm">{selectedReceipt.tenant_name}</p>
            {selectedReceipt.tenant_phone && (
              <p className="text-xs text-slate-600">{selectedReceipt.tenant_phone}</p>
            )}
            {selectedReceipt.tenant_email && (
              <p className="text-xs text-slate-600">{selectedReceipt.tenant_email}</p>
            )}
          </div>

          {/* Property Details */}
          <div className="bg-slate-50 p-3 rounded-lg mb-4">
            <p className="text-xs font-medium text-slate-700 mb-2">Property Details</p>
            <p className="text-sm">{selectedReceipt.property_name || 'N/A'}</p>
            <p className="text-xs text-slate-600">
              Room: {selectedReceipt.room_number || 'N/A'} 
              {selectedReceipt.bed_number && ` • Bed #${selectedReceipt.bed_number}`}
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-xs font-medium text-blue-700 mb-3">Payment Details</p>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-blue-600">Amount Paid:</span>
              <span className="text-lg font-bold text-blue-700">
                ₹{selectedReceipt.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-blue-600">Payment Mode:</span>
              <span className="text-sm font-medium capitalize">{selectedReceipt.payment_mode}</span>
            </div>
            {selectedReceipt.bank_name && (
              <div className="flex justify-between mb-2">
                <span className="text-xs text-blue-600">Bank:</span>
                <span className="text-sm">{selectedReceipt.bank_name}</span>
              </div>
            )}
            {selectedReceipt.transaction_id && (
              <div className="flex justify-between mb-2">
                <span className="text-xs text-blue-600">Transaction ID:</span>
                <span className="text-xs font-mono">{selectedReceipt.transaction_id}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-xs text-blue-600">Period:</span>
              <span className="text-sm">{selectedReceipt.month} {selectedReceipt.year}</span>
            </div>
          </div>

          {/* Remark if exists */}
          {selectedReceipt.remark && (
            <div className="bg-yellow-50 p-3 rounded-lg mb-4">
              <p className="text-xs font-medium text-yellow-700 mb-1">Remark:</p>
              <p className="text-sm text-yellow-800">{selectedReceipt.remark}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 mt-4 pt-4 border-t border-slate-200">
            <p>This is a computer generated receipt. No signature required.</p>
            <p className="mt-1">Generated on: {format(new Date(selectedReceipt.created_at), 'dd MMM yyyy, hh:mm a')}</p>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={() => paymentApi.downloadReceipt(selectedReceipt.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    )}
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsReceiptPreviewOpen(false)}>
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}

// Stat Card Component
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

// Add PaymentStatusBadge HERE - outside PaymentsPage
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { className: string, icon: any }> = {
    approved: { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
    pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    rejected: { className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
  };

  const config = variants[status] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} flex items-center gap-1 text-xs px-2 py-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};

// Child Table Component for Payment Transactions
const PaymentTransactionsTable = ({ payment }: { payment: any }) => {
  // Mock transaction data - replace with actual data from your backend
  const transactions = payment.transactions || [
    {
      id: 1,
      date: payment.payment_date,
      amount: payment.amount,
      mode: payment.payment_mode,
      bank: payment.bank_name || '-',
      transaction_id: payment.transaction_id || '-',
      status: 'completed',
      reference: `TXN-${payment.id}`
    }
  ];

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <h4 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <FileText className="h-3.5 w-3.5" />
        Transaction Details
      </h4>
      
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-100">
            <TableHead className="text-xs py-2">Date</TableHead>
            <TableHead className="text-xs py-2">Transaction ID</TableHead>
            <TableHead className="text-xs py-2">Amount</TableHead>
            <TableHead className="text-xs py-2">Mode</TableHead>
            <TableHead className="text-xs py-2">Bank</TableHead>
            <TableHead className="text-xs py-2">Reference</TableHead>
            <TableHead className="text-xs py-2">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn: any) => (
            <TableRow key={txn.id} className="bg-white">
              <TableCell className="py-2 text-xs">
                {format(new Date(txn.date), 'dd/MM/yy')}
              </TableCell>
              <TableCell className="py-2 text-xs font-mono">
                {txn.transaction_id}
              </TableCell>
              <TableCell className="py-2 text-xs font-medium">
                ₹{txn.amount.toLocaleString()}
              </TableCell>
              <TableCell className="py-2 text-xs capitalize">
                {txn.mode}
              </TableCell>
              <TableCell className="py-2 text-xs">
                {txn.bank}
              </TableCell>
              <TableCell className="py-2 text-xs">
                {txn.reference}
              </TableCell>
              <TableCell className="py-2">
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {txn.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Payment Summary */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="bg-white p-2 rounded border border-slate-200">
          <p className="text-xs text-slate-500">Total Amount</p>
          <p className="text-sm font-bold text-green-600">₹{payment.amount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <p className="text-xs text-slate-500">Payment Date</p>
          <p className="text-sm font-medium">{format(new Date(payment.payment_date), 'dd MMM yyyy')}</p>
        </div>
        <div className="bg-white p-2 rounded border border-slate-200">
          <p className="text-xs text-slate-500">Status</p>
          <PaymentStatusBadge status={payment.status || 'pending'} />
        </div>
      </div>
    </div>
  );
};
// Payments Table Component
// Enhanced Payments Table Component with Expandable Rows
const PaymentsTable = ({ 
  payments, 
  loading, 
  filters, 
  setFilters, 
  getTenantName, 
  getTenantPhone, 
  onApprove,
  onReject,
  onEdit,
  onDelete,
  actionLoading,
  onViewReceipt,
  setActiveTab,
  expandedRows,
  onToggleExpand
}: any) => (
  <Card className="border-0 shadow-sm">
    <div className="relative">
      <div className="overflow-auto max-h-[calc(100vh-320px)] md:max-h-[calc(100vh-240px)]">
        <Table>
          <TableHeader className="sticky top-0 z-20 bg-white">
            <TableRow className="bg-slate-100">
              <TableHead className="text-xs font-semibold py-2 w-8"></TableHead>
              <TableHead className="text-xs font-semibold py-2">Date</TableHead>
              <TableHead className="text-xs font-semibold py-2">Tenant</TableHead>
              <TableHead className="text-xs font-semibold py-2">Amount</TableHead>
              <TableHead className="text-xs font-semibold py-2">Method/Bank</TableHead>
              <TableHead className="text-xs font-semibold py-2">Transaction ID</TableHead>
              <TableHead className="text-xs font-semibold py-2">Month/Year</TableHead>
              <TableHead className="text-xs font-semibold py-2">Remark</TableHead>
              <TableHead className="text-xs font-semibold py-2">Status</TableHead>
              <TableHead className="text-xs font-semibold py-2 text-center">Actions</TableHead>
            </TableRow>

            {/* Filter Row */}
            <TableRow className="bg-slate-50 sticky top-[41px] z-20">
              <TableHead className="p-1"></TableHead>
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
              <TableHead className="p-1"></TableHead>
              <TableHead className="p-1">
                <Input
                  placeholder="Filter"
                  value={filters.remark}
                  onChange={(e) => setFilters({ ...filters, remark: e.target.value })}
                  className="h-7 text-xs"
                />
              </TableHead>
              <TableHead className="p-1"></TableHead>
              <TableHead className="p-1"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-xs text-slate-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
                    Loading payments...
                  </div>
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-xs text-slate-500">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment: any) => {
                const paymentStatus = payment.status || 'pending';
                const isExpanded = expandedRows.includes(payment.id);
                
                return (
                  <>
                    {/* Parent Row */}
                    <TableRow 
                      key={payment.id} 
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-slate-50 border-b-0' : ''
                      }`}
                      onClick={() => onToggleExpand(payment.id)}
                    >
                      <TableCell className="py-2">
                        <ChevronDown 
                          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </TableCell>
                      <TableCell className="py-2 text-xs whitespace-nowrap">
                        {format(new Date(payment.payment_date), 'dd/MM/yy')}
                      </TableCell>
                      <TableCell className="py-2">
                        <p className="text-xs font-medium whitespace-nowrap">{getTenantName(payment.tenant_id)}</p>
                        <p className="text-[10px] text-slate-500 whitespace-nowrap">{getTenantPhone(payment.tenant_id)}</p>
                      </TableCell>
                      <TableCell className="py-2 text-xs font-medium whitespace-nowrap">
                        ₹{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2">
                        <p className="text-xs capitalize whitespace-nowrap">{payment.payment_mode}</p>
                        {payment.bank_name && (
                          <p className="text-[10px] text-slate-500 whitespace-nowrap">{payment.bank_name}</p>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-[10px] font-mono whitespace-nowrap">
                        {payment.transaction_id ? payment.transaction_id.substring(0, 8) + '...' : '-'}
                      </TableCell>
                      <TableCell className="py-2 text-xs whitespace-nowrap">
                        {payment.month} {payment.year}
                      </TableCell>
                      <TableCell className="py-2 text-xs max-w-[120px] truncate">
                        {payment.remark || '-'}
                      </TableCell>
                      <TableCell className="py-2">
                        <PaymentStatusBadge status={paymentStatus} />
                      </TableCell>
                      <TableCell className="py-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 justify-end">
                          {/* View Receipt */}
                          {payment.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-blue-600"
                              onClick={() => {
                                setActiveTab('receipts');
                                setTimeout(() => onViewReceipt(payment.id), 100);
                              }}
                              title="View Receipt"
                            >
                              <Receipt className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          
                          {/* Approve Button */}
                          {paymentStatus === 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-green-600"
                              onClick={() => onApprove(payment)}
                              title="Approve Payment"
                              disabled={actionLoading}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          
                          {/* Reject Button */}
                          {paymentStatus === 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-600"
                              onClick={() => onReject(payment)}
                              title="Reject Payment"
                              disabled={actionLoading}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          
                          {/* Edit Button */}
                          {(paymentStatus === 'pending' || paymentStatus === 'rejected') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-blue-600"
                              onClick={() => onEdit(payment)}
                              title="Edit Payment"
                              disabled={actionLoading}
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          
                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-600"
                            onClick={() => onDelete(payment)}
                            title="Delete Payment"
                            disabled={actionLoading}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Child Row */}
                    {isExpanded && (
                      <TableRow className="bg-slate-50">
                        <TableCell colSpan={10} className="p-0 border-t-0">
                          <div className="animate-in slide-in-from-top-1 duration-200">
                            <PaymentTransactionsTable payment={payment} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  </Card>
);

// Receipts Table Component
const ReceiptsTable = ({ 
  receipts, 
  loading, 
  getTenantName,
  highlightedReceipt, // Add this prop
  onPreviewReceipt,
  onDownloadReceipt
}: any) => (
  <Card className="border-0 shadow-sm">
    <CardHeader className="p-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-t-lg sticky top-0 z-10">
      <CardTitle className="flex items-center gap-2 text-sm">
        <Receipt className="h-4 w-4" />
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
              <TableHead className="text-xs py-2">Date</TableHead>
              <TableHead className="text-xs py-2">Tenant</TableHead>
              <TableHead className="text-xs py-2">Amount</TableHead>
              <TableHead className="text-xs py-2">Method/Bank</TableHead>
              <TableHead className="text-xs py-2">Room/Bed</TableHead>
              <TableHead className="text-xs py-2 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                {/* Changed colSpan from 9 to 6 to match number of columns */}
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2" />
                    Loading receipts...
                  </div>
                </TableCell>
              </TableRow>
            ) : receipts.length === 0 ? (
              <TableRow>
                {/* Changed colSpan from 9 to 6 */}
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-500">
                  <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  No receipts found
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt: any) => (
                <TableRow 
                  key={receipt.id}  
                  className={`hover:bg-slate-50 ${
                    receipt.id === highlightedReceipt ? 'bg-green-50 animate-pulse' : ''
                  }`}
                >
                  <TableCell className="py-2 text-xs whitespace-nowrap">
                    {format(new Date(receipt.payment_date), 'dd/MM/yy')}
                  </TableCell>
                  <TableCell className="py-2">
                    <p className="text-xs whitespace-nowrap">{receipt.tenant_name}</p>
                    {receipt.tenant_phone && (
                      <p className="text-[10px] text-slate-500">{receipt.tenant_phone}</p>
                    )}
                  </TableCell>
                  <TableCell className="py-2 text-xs font-medium whitespace-nowrap">
                    ₹{receipt.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2">
                    <p className="text-xs capitalize whitespace-nowrap">{receipt.payment_mode}</p>
                    {receipt.bank_name && (
                      <p className="text-[10px] text-slate-500">{receipt.bank_name}</p>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <p className="text-xs whitespace-nowrap">{receipt.room_number || 'N/A'}</p>
                    {receipt.bed_number && (
                      <p className="text-[10px] text-slate-500">Bed #{receipt.bed_number}</p>
                    )}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-1 justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => onPreviewReceipt(receipt.id)}
                        title="Preview Receipt"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => onDownloadReceipt(receipt.id)}
                        title="Download Receipt"
                      >
                        <Download className="h-3.5 w-3.5" />
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
);


