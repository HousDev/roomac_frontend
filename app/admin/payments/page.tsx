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





// app/admin/payments/page.tsx
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
  AlertCircle, CheckCircle, XCircle, Bell, Send,
  IndianRupee, X, Home, Bed, User, CalendarDays,
  Upload, Eye, Clock, TrendingUp, TrendingDown,
  Building, MapPin, Wifi, Wind, Bath, Maximize,
  Loader2
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
interface BedAssignment {
  id: number;
  bed_number: number;
  bed_type: string;
  tenant_rent: number;
  is_couple: boolean;
  created_at: string;
  room: {
    id: number;
    room_number: string;
    floor: string;
    sharing_type: string;
    has_ac: boolean;
    has_attached_bathroom: boolean;
    has_balcony: boolean;
  };
  property: {
    id: number;
    name: string;
    address: string;
  };
}

interface MonthRent {
  month: string;
  month_key: string;
  year: number;
  month_num: number;
  rentAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  isCurrentMonth: boolean;
  isPastMonth: boolean;
  isFirstMonth?: boolean;
  payments: {
    id: number;
    amount: number;
    status: string;
    date: string;
    mode: string;
    transaction_id?: string;
  }[];
  lastPaymentDate: string | null;
}

interface RentSummary {
  tenant_id: number;
  tenant_name: string;
  bed_assignment: BedAssignment | null;
  monthly_rent: number;
  current_month_rent: number;
  paid_this_month: number;
  pending_this_month: number;
  previous_pending: number;
  total_paid: number;
  total_pending: number;
  last_payment_date: string | null;
  next_due_date: string | null;
  months: MonthRent[];
}

type Receipt = {
  id: number;
  receipt_number: string;
  payment_id: number;
  tenant_id: number;
  amount: number;
  payment_method?: string;
  payment_date: string;
  description?: string;
  is_cancelled: boolean;
  created_at: string;
  tenants?: {
    full_name: string;
    email?: string;
    phone?: string;
  };
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isDemandPaymentOpen, setIsDemandPaymentOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [rentSummary, setRentSummary] = useState<RentSummary | null>(null);
  
  // Proof upload states
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // Filters
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
    cheque_payments: 0,
    overdue_amount: 0,
    overdue_count: 0
  });

  const [newPayment, setNewPayment] = useState({
    tenant_id: '',
    booking_id: null as number | null,
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
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
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
      const response = await paymentApi.listReceipts({ is_cancelled: false });
      if (response.success) {
        setReceipts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
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

  const fetchTenantBedAssignment = async (tenantId: string) => {
    try {
      const response = await fetch(`/api/rooms/tenant-bed/${tenantId}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching bed assignment:', error);
      return null;
    }
  };

const calculateRentSummary = (
  tenantId: number,
  tenantName: string,
  bedAssignment: BedAssignment | null,
  payments: any[]
): RentSummary => {
  // Ensure monthlyRent is a number
  const monthlyRent = Number(bedAssignment?.tenant_rent) || 0;
  
  if (!bedAssignment) {
    return {
      tenant_id: tenantId,
      tenant_name: tenantName,
      bed_assignment: null,
      monthly_rent: 0,
      current_month_rent: 0,
      paid_this_month: 0,
      pending_this_month: 0,
      previous_pending: 0,
      total_paid: 0,
      total_pending: 0,
      last_payment_date: null,
      next_due_date: null,
      months: []
    };
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const assignmentDate = bedAssignment.created_at ? new Date(bedAssignment.created_at) : new Date();
  const startYear = assignmentDate.getFullYear();
  const startMonth = assignmentDate.getMonth();
  
  const totalMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth) + 1;
  
  const months: MonthRent[] = [];
  let totalPaid = 0;
  let previousPending = 0;
  let paidThisMonth = 0;
  
  for (let i = 0; i < totalMonths; i++) {
    const date = new Date(startYear, startMonth + i, 1);
    const monthDisplay = date.toLocaleString('default', { month: 'long' }) + ' ' + date.getFullYear();
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Find payments for this specific month and ensure amounts are numbers
    const monthPayments = payments
      .filter(p => {
        const paymentDate = new Date(p.payment_date);
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear();
      })
      .map(p => ({
        ...p,
        amount: Number(p.amount) || 0
      }));
    
    const completedPayments = monthPayments.filter(p => p.status === 'completed');
    const paidAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const isCurrentMonth = i === totalMonths - 1;
    const isPastMonth = date < new Date(currentYear, currentMonth, 1);
    const isFirstMonth = i === 0;
    
    const pendingAmount = Math.max(0, monthlyRent - paidAmount);
    
    let status: 'paid' | 'partial' | 'pending' | 'overdue' = 'pending';
    if (paidAmount >= monthlyRent) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    } else if (isPastMonth) {
      status = 'overdue';
    }
    
    months.push({
      month: monthDisplay,
      month_key: monthKey,
      year: date.getFullYear(),
      month_num: date.getMonth() + 1,
      rentAmount: monthlyRent,
      paidAmount,
      pendingAmount,
      status,
      isCurrentMonth,
      isPastMonth,
      isFirstMonth,
      payments: monthPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        date: p.payment_date,
        mode: p.payment_mode,
        transaction_id: p.transaction_id
      })),
      lastPaymentDate: completedPayments[0]?.payment_date || null
    });
    
    totalPaid += paidAmount;
    
    if (!isCurrentMonth) {
      previousPending += pendingAmount;
    }
    
    if (isCurrentMonth) {
      paidThisMonth = paidAmount;
    }
  }

  const currentMonthPending = Math.max(0, monthlyRent - paidThisMonth);
  const totalToPayNow = monthlyRent + previousPending - paidThisMonth;

  // Ensure all values are numbers and not NaN
  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  return {
    tenant_id: safeNumber(tenantId),
    tenant_name: tenantName,
    bed_assignment: bedAssignment,
    monthly_rent: safeNumber(monthlyRent),
    current_month_rent: safeNumber(monthlyRent),
    paid_this_month: safeNumber(paidThisMonth),
    pending_this_month: safeNumber(currentMonthPending),
    previous_pending: safeNumber(previousPending),
    total_paid: safeNumber(totalPaid),
    total_pending: safeNumber(previousPending + currentMonthPending),
    last_payment_date: months[months.length - 1]?.lastPaymentDate || null,
    next_due_date: null,
    months
  };
};

const handleTenantSelect = async (tenantId: string) => {
  setNewPayment(prev => ({ ...prev, tenant_id: tenantId, booking_id: null, amount: '' }));
  setRentSummary(null);
  
  if (!tenantId) return;

  setBookingLoading(true);
  try {
    const tenant = tenants.find(t => t.id.toString() === tenantId);
    
    const bedAssignment = await fetchTenantBedAssignment(tenantId);
    
    const paymentsResponse = await paymentApi.getPaymentsByTenant(parseInt(tenantId));
    const tenantPayments = paymentsResponse.success ? paymentsResponse.data : [];
    
    const summary = calculateRentSummary(
      parseInt(tenantId),
      tenant?.full_name || 'Unknown',
      bedAssignment,
      tenantPayments
    );
    
    setRentSummary(summary);
    
    // Calculate total to pay with proper number conversion
    if (summary.monthly_rent > 0) {
      const currentMonthRent = Number(summary.current_month_rent) || 0;
      const previousPending = Number(summary.previous_pending) || 0;
      const paidThisMonth = Number(summary.paid_this_month) || 0;
      
      const totalToPay = currentMonthRent + previousPending - paidThisMonth;
      
      setNewPayment(prev => ({
        ...prev,
        amount: totalToPay.toString(),
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
    setRentSummary(null);
    
    if (!tenantId) return;

    setBookingLoading(true);
    try {
      const tenant = tenants.find(t => t.id.toString() === tenantId);
      
      const bedAssignment = await fetchTenantBedAssignment(tenantId);
      
      const paymentsResponse = await paymentApi.getPaymentsByTenant(parseInt(tenantId));
      const tenantPayments = paymentsResponse.success ? paymentsResponse.data : [];
      
      const summary = calculateRentSummary(
        parseInt(tenantId),
        tenant?.full_name || 'Unknown',
        bedAssignment,
        tenantPayments
      );
      
      setRentSummary(summary);
      
      if (summary.monthly_rent > 0) {
        setDemandPayment(prev => ({
          ...prev,
          amount: summary.monthly_rent + summary.previous_pending,
        }));
      }
      
    } catch (error) {
      console.error('Error loading tenant details:', error);
      toast.error('Failed to load tenant details');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.tenant_id || !newPayment.amount) {
      toast.error('Please select a tenant and enter an amount');
      return;
    }

    try {
      const payload = {
        tenant_id: parseInt(newPayment.tenant_id),
        booking_id: newPayment.booking_id,
        payment_type: newPayment.payment_type,
        amount: parseFloat(newPayment.amount),
        payment_mode: newPayment.payment_mode,
        transaction_id: newPayment.transaction_id || null,
        payment_date: newPayment.payment_date,
        due_date: newPayment.due_date || null,
        status: newPayment.status,
        notes: newPayment.notes || null,
      };

      const response = await paymentApi.createPayment(payload);

      if (response.success && response.data) {
        // If there's a proof file and payment mode is online, upload it
        if (proofFile && newPayment.payment_mode === 'online') {
          const formData = new FormData();
          formData.append('proof', proofFile);
          
          await fetch(`/api/payments/${response.data.id}/proof`, {
            method: 'POST',
            body: formData,
          });
        }
        
        // Create receipt for completed payment
        if (newPayment.status === 'completed') {
          await paymentApi.createReceipt({
            payment_id: response.data.id,
            tenant_id: parseInt(newPayment.tenant_id),
            amount: parseFloat(newPayment.amount),
            payment_method: newPayment.payment_mode,
            payment_date: newPayment.payment_date,
            description: `Payment for ${newPayment.payment_type}`,
          });
        }
        
        toast.success('Payment added successfully');
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

    try {
      const totalAmount = demandPayment.include_late_fee && demandPayment.late_fee_amount > 0
        ? demandPayment.amount + demandPayment.late_fee_amount
        : demandPayment.amount;

      const payload = {
        tenant_id: parseInt(demandPayment.tenant_id),
        amount: totalAmount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_mode: 'pending',
        status: 'pending',
        notes: demandPayment.description
          ? `${demandPayment.description}${demandPayment.include_late_fee ? ` (Late fee: ₹${demandPayment.late_fee_amount})` : ''}`
          : demandPayment.include_late_fee ? `Late fee included: ₹${demandPayment.late_fee_amount}` : null,
        due_date: demandPayment.due_date,
        payment_type: demandPayment.payment_type
      };

      const response = await paymentApi.createPayment(payload);

      if (response.success) {
        toast.success('Payment demand created successfully');
        setIsDemandPaymentOpen(false);
        resetDemandPaymentForm();
        await loadData();
      } else {
        toast.error(response.message || 'Failed to create payment demand');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment demand');
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

  const resetPaymentForm = () => {
    setRentSummary(null);
    setProofFile(null);
    setProofPreview(null);
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
    setRentSummary(null);
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

  const updatePaymentStatus = async (paymentId: number, newStatus: string) => {
    try {
      const response = await paymentApi.updatePaymentStatus(paymentId, newStatus);

      if (response.success) {
        toast.success('Payment status updated');
        await loadData();
      } else {
        toast.error(response.message || 'Failed to update payment status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment status');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string, icon: any }> = {
      completed: { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
      failed: { className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      refunded: { className: 'bg-purple-100 text-purple-800 border-purple-200', icon: XCircle }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1 text-[10px] px-1.5 py-0`}>
        <Icon className="h-2.5 w-2.5" />
        {status}
      </Badge>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const tenant = tenants.find(t => t.id.toString() === payment.tenant_id.toString());
    const tenantName = tenant?.full_name || payment.tenant_name || '';
    
    const matchesDate = !filters.date || 
      (payment.payment_date && format(new Date(payment.payment_date), 'dd MMM yyyy')
        .toLowerCase().includes(filters.date.toLowerCase()));
    
    const matchesTenant = !filters.tenant ||
      tenantName.toLowerCase().includes(filters.tenant.toLowerCase());
    
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

  const getTenantName = (tenantId: number) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.full_name || 'Unknown Tenant';
  };

  const getTenantPhone = (tenantId: number) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant?.phone || '';
  };

  // Bed Assignment Details Component
// Bed Assignment Details Component
const BedAssignmentDetails = ({ assignment }: { assignment: BedAssignment | null }) => {
  if (!assignment) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
        <p className="text-xs text-amber-700">No active bed assignment found for this tenant.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
        <Bed className="h-3 w-3" />
        Bed Assignment Details
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div>
          <p className="text-blue-600">Bed</p>
          <p className="font-medium">#{assignment.bed_number} ({assignment.bed_type || 'Standard'})</p>
        </div>
        <div>
          <p className="text-blue-600">Monthly Rent</p>
          <p className="font-medium text-green-600">₹{(assignment.tenant_rent || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-blue-600">Room</p>
          <p className="font-medium">{assignment.room?.room_number || 'N/A'} 
            {assignment.room?.floor && ` (Floor ${assignment.room.floor})`}
          </p>
        </div>
        <div>
          <p className="text-blue-600">Property</p>
          <p className="font-medium truncate">{assignment.property?.name || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

  // Rent History Component
// Rent History Component
const RentHistoryComponent = ({ summary }: { summary: RentSummary }) => {
  if (!summary) return null;

  // Ensure all values are numbers
  const currentMonthRent = Number(summary.current_month_rent) || 0;
  const paidThisMonth = Number(summary.paid_this_month) || 0;
  const previousPending = Number(summary.previous_pending) || 0;
  
  const totalToPayNow = currentMonthRent + previousPending - paidThisMonth;

  return (
    <div className="space-y-3 mb-4">
      <BedAssignmentDetails assignment={summary.bed_assignment} />

      {summary.bed_assignment ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <p className="text-[10px] text-blue-600">Current Month</p>
              <p className="text-sm font-bold text-blue-700">
                ₹{currentMonthRent.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-green-50 p-2 rounded border border-green-200">
              <p className="text-[10px] text-green-600">Paid This Month</p>
              <p className="text-sm font-bold text-green-700">
                ₹{paidThisMonth.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
              <p className="text-[10px] text-yellow-600">Previous Pending</p>
              <p className="text-sm font-bold text-yellow-700">
                ₹{previousPending.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-purple-50 p-2 rounded border border-purple-200">
              <p className="text-[10px] text-purple-600">Total to Pay</p>
              <p className="text-sm font-bold text-purple-700">
                ₹{isNaN(totalToPayNow) ? '0' : totalToPayNow.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Month-wise Table */}
          {summary.months && summary.months.length > 0 && (
            <div className="border rounded overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Month</th>
                    <th className="p-2 text-right">Expected</th>
                    <th className="p-2 text-right">Paid</th>
                    <th className="p-2 text-right">Pending</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.months.map((month) => {
                    const rentAmount = Number(month.rentAmount) || 0;
                    const paidAmount = Number(month.paidAmount) || 0;
                    const pendingAmount = Number(month.pendingAmount) || 0;
                    
                    return (
                      <tr key={month.month_key} className="border-t">
                        <td className="p-2">
                          {month.month}
                          {month.isCurrentMonth && (
                            <span className="ml-1 text-[8px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded">Current</span>
                          )}
                        </td>
                        <td className="p-2 text-right">₹{rentAmount.toLocaleString('en-IN')}</td>
                        <td className="p-2 text-right text-green-600">
                          {paidAmount > 0 ? `₹${paidAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="p-2 text-right text-yellow-600">
                          {pendingAmount > 0 ? `₹${pendingAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="p-2 text-center">
                          {month.status === 'paid' && <Badge className="bg-green-100 text-green-800 text-[8px]">Paid</Badge>}
                          {month.status === 'partial' && <Badge className="bg-yellow-100 text-yellow-800 text-[8px]">Partial</Badge>}
                          {month.status === 'pending' && <Badge variant="outline" className="text-[8px]">Pending</Badge>}
                          {month.status === 'overdue' && <Badge className="bg-red-100 text-red-800 text-[8px]">Overdue</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded">
          <p className="text-xs text-gray-500">No rent history available. Please assign a bed first.</p>
        </div>
      )}
    </div>
  );
};

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
            title="Pending"
            value={`₹${stats?.pending_amount?.toLocaleString() || '0'}`}
            icon={AlertCircle}
            color="bg-yellow-600"
            bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
          />
          <StatCard
            title="Overdue"
            value={`₹${stats?.overdue_amount?.toLocaleString() || '0'}`}
            icon={Clock}
            color="bg-red-600"
            bgColor="bg-gradient-to-br from-red-50 to-red-100"
          />
          <StatCard
            title="Transactions"
            value={stats?.total_transactions || 0}
            icon={CreditCard}
            color="bg-purple-600"
            bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          />
        </div>

        {/* Tabs Container */}
        <Tabs defaultValue="payments" className="w-full">
          {/* Tabs Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sticky top-28 z-10">
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

          {/* Payments Tab Content */}
          <TabsContent value="payments" className="space-y-2 mt-0">
            <Card className="border-0 shadow-sm">
              <div className="relative">
                {/* Sticky Header Table */}
                <div className="overflow-auto max-h-[calc(100vh-320px)] md:max-h-[calc(100vh-240px)]">
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
                      
                      {/* Filter Row */}
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

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-t-lg sticky top-0 z-10">
            <DialogClose asChild>
              <button className="absolute right-4 top-4 text-white/80 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
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
                {bookingLoading && <p className="text-[10px] text-slate-400">Loading tenant details...</p>}
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
                    <SelectItem value="electricity">Electricity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rent Summary */}
            {rentSummary && <RentHistoryComponent summary={rentSummary} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<div className="space-y-1">
  <Label className="text-xs font-medium">Amount (₹) *</Label>
  <Input
    type="number"
    placeholder="Enter amount"
    value={newPayment.amount}
    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
    className="h-8 text-sm"
  />
  {rentSummary && (
    <p className="text-[10px] text-purple-600 mt-1">
      Suggested amount: ₹{
        (Number(rentSummary.current_month_rent) + 
         Number(rentSummary.previous_pending) - 
         Number(rentSummary.paid_this_month))
        .toLocaleString('en-IN')
      }
    </p>
  )}
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

            {/* Proof Upload Field */}
            {newPayment.payment_mode === 'online' && (
              <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
                <Label className="text-xs font-medium">Payment Proof (Screenshot)</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => document.getElementById('proof-upload')?.click()}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    {proofFile ? 'Change File' : 'Upload Proof'}
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
                  {proofFile && (
                    <span className="text-xs text-slate-600 truncate max-w-[200px]">
                      {proofFile.name}
                    </span>
                  )}
                </div>
                {proofPreview && (
                  <div className="mt-2">
                    <img 
                      src={proofPreview} 
                      alt="Preview" 
                      className="max-h-32 rounded border border-slate-200"
                    />
                  </div>
                )}
                <p className="text-[10px] text-slate-400">
                  Upload screenshot of online payment (JPG, PNG, PDF up to 5MB)
                </p>
              </div>
            )}

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

          <DialogFooter className="p-4 bg-slate-50 rounded-b-lg grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddPaymentOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddPayment}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
            >
              Add Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demand Payment Dialog */}
      <Dialog open={isDemandPaymentOpen} onOpenChange={setIsDemandPaymentOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-lg sticky top-0 z-10">
            <DialogClose asChild>
              <button className="absolute right-4 top-4 text-white/80 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
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
                <Select value={demandPayment.tenant_id} onValueChange={handleDemandTenantSelect}>
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
                {bookingLoading && <p className="text-[10px] text-slate-400">Loading tenant details...</p>}
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
            </div>

            {/* Rent Summary for Demand */}
            {rentSummary && <RentHistoryComponent summary={rentSummary} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <DialogFooter className="p-4 bg-slate-50 rounded-b-lg grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDemandPaymentOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDemandPayment}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              Send Demand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}