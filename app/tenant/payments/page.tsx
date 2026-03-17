// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   CreditCard,
//   IndianRupee,
//   Calendar,
//   CheckCircle2,
//   Clock,
//   XCircle,
//   Wallet,
//   Landmark,
//   Home,
//   Shield,
//   Download,
//   ArrowLeft,
//   Bell,
//   FileText,
//   RefreshCw,
//   Plus,
//   X,
//   User,
//   Bed,
//   AlertCircle
// } from "lucide-react";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Progress } from "@/components/ui/progress";
// import { Skeleton } from "@/components/ui/skeleton";
// import { toast } from "sonner";
// import { format } from "date-fns";

// import { getTenantId, type TenantProfile } from "@/lib/tenantAuthApi";
// import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
// import * as paymentApi from '@/lib/paymentRecordApi';
// import * as notificationApi from '@/lib/notificationApi';

// // Types
// interface Payment {
//   id: number;
//   amount: number;
//   payment_date: string;
//   payment_mode: string;
//   bank_name?: string;
//   transaction_id?: string;
//   month?: string;
//   year?: number;
//   remark?: string;
//   status: string;
//   payment_type: string;
// }

// interface RentStats {
//   totalPaid: number;
//   totalPending: number;
//   approvedCount: number;
//   pendingCount: number;
//   rejectedCount: number;
//   monthsPaid: Set<string>;
//   monthsPending: Set<string>;
// }

// interface DepositStats {
//   requiredAmount: number;
//   totalPaid: number;
//   totalPending: number;
//   approvedCount: number;
//   pendingCount: number;
//   rejectedCount: number;
//   isFullyPaid: boolean;
// }

// // Status Badge Component
// const StatusBadge = ({ status }: { status: string }) => {
//   const variants: Record<string, { className: string; icon: any }> = {
//     approved: { 
//       className: 'bg-green-50 text-green-600 border-green-200', 
//       icon: CheckCircle2 
//     },
//     pending: { 
//       className: 'bg-[#fff9e6] text-[#ffc107] border-[#ffc107]/20', 
//       icon: Clock 
//     },
//     rejected: { 
//       className: 'bg-red-50 text-red-600 border-red-200', 
//       icon: XCircle 
//     }
//   };

//   const config = variants[status] || variants.pending;
//   const Icon = config.icon;

//   return (
//     <Badge variant="outline" className={`${config.className} flex items-center gap-1 text-xs px-2 py-1 rounded-full`}>
//       <Icon className="h-3 w-3" />
//       {status === 'approved' ? 'Completed' : status}
//     </Badge>
//   );
// };

// // Stat Card Component
// const StatCard = ({ 
//   title, 
//   value, 
//   subValue, 
//   icon: Icon, 
//   color = 'blue'
// }: { 
//   title: string; 
//   value: string; 
//   subValue?: string; 
//   icon: any; 
//   color?: 'blue' | 'gold' | 'green' | 'red' | 'purple';
// }) => {
//   const colorClasses = {
//     blue: 'bg-[#e6f0ff] text-[#004aad]',
//     gold: 'bg-[#fff9e6] text-[#ffc107]',
//     green: 'bg-green-50 text-green-600',
//     red: 'bg-red-50 text-red-600',
//     purple: 'bg-purple-50 text-purple-600'
//   };

//   return (
//     <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200">
//       <div className={`p-2 rounded-lg ${colorClasses[color]} w-fit mb-3`}>
//         <Icon className="h-4 w-4" />
//       </div>
//       <p className="text-xs text-slate-500 mb-1">{title}</p>
//       <p className="text-xl font-bold text-slate-800">{value}</p>
//       {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
//     </div>
//   );
// };

// // Payment History Item Component
// const PaymentHistoryItem = ({ payment, formatCurrency, formatDate }: { 
//   payment: Payment; 
//   formatCurrency: (amount: number) => string;
//   formatDate: (date: string) => string;
// }) => (
//   <div className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-[#004aad]/20">
//     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//       <div className="flex-1">
//         <div className="flex items-center gap-2 flex-wrap mb-2">
//           <div className="p-1.5 bg-[#e6f0ff] rounded-lg">
//             {payment.payment_type === 'rent' ? (
//               <Home className="h-3.5 w-3.5 text-[#004aad]" />
//             ) : (
//               <Shield className="h-3.5 w-3.5 text-[#ffc107]" />
//             )}
//           </div>
//           <p className="font-semibold text-sm text-slate-800">
//             {payment.remark || (payment.payment_type === 'rent' ? 'Rent Payment' : 'Security Deposit')}
//           </p>
//           {payment.payment_type === 'security_deposit' && (
//             <Badge className="bg-[#fff9e6] text-[#ffc107] border-[#ffc107]/20 text-[10px] rounded-full">
//               Deposit
//             </Badge>
//           )}
//           {payment.month && payment.year && (
//             <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] rounded-full">
//               {payment.month} {payment.year}
//             </Badge>
//           )}
//         </div>
        
//         <div className="flex flex-wrap items-center gap-3 text-xs">
//           <div className="flex items-center gap-1.5 text-slate-500">
//             <Calendar className="h-3 w-3" />
//             <span>{formatDate(payment.payment_date)}</span>
//           </div>
//           <div className="w-1 h-1 rounded-full bg-slate-300"></div>
//           <div className="flex items-center gap-1.5 text-slate-500">
//             <CreditCard className="h-3 w-3" />
//             <span className="capitalize">{payment.payment_mode}</span>
//           </div>
//           {payment.transaction_id && (
//             <>
//               <div className="w-1 h-1 rounded-full bg-slate-300"></div>
//               <div className="flex items-center gap-1.5 text-slate-500 font-mono">
//                 #{payment.transaction_id.substring(0, 8)}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       <div className="flex items-center gap-3 sm:pl-4 sm:border-l border-slate-200">
//         <div className="text-right">
//           <p className="text-sm text-slate-500">Amount</p>
//           <p className="text-lg font-bold text-[#004aad]">{formatCurrency(payment.amount)}</p>
//         </div>
//         <div className="flex flex-col items-end gap-2">
//           <StatusBadge status={payment.status} />
//           {(payment.status === 'approved' || payment.status === 'completed') && (
//             <Button
//               size="sm"
//               variant="ghost"
//               className="h-7 px-2 text-[#004aad] hover:text-[#004aad] hover:bg-[#e6f0ff] rounded-lg text-xs"
//               onClick={() => window.open(`/api/payments/receipts/${payment.id}/download`, '_blank')}
//             >
//               <Download className="h-3 w-3 mr-1" />
//               Receipt
//             </Button>
//           )}
//         </div>
//       </div>
//     </div>
//   </div>
// );

// export default function TenantPaymentsPage() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [tenant, setTenant] = useState<TenantProfile | null>(null);
//   const [payments, setPayments] = useState<Payment[]>([]);
  
//   // Stats
//   const [rentStats, setRentStats] = useState<RentStats>({
//     totalPaid: 0,
//     totalPending: 0,
//     approvedCount: 0,
//     pendingCount: 0,
//     rejectedCount: 0,
//     monthsPaid: new Set(),
//     monthsPending: new Set()
//   });
  
//   const [depositStats, setDepositStats] = useState<DepositStats>({
//     requiredAmount: 0,
//     totalPaid: 0,
//     totalPending: 0,
//     approvedCount: 0,
//     pendingCount: 0,
//     rejectedCount: 0,
//     isFullyPaid: false
//   });

//   // Dialog states
//   const [showPaymentDialog, setShowPaymentDialog] = useState(false);
//   const [paymentFormData, setPaymentFormData] = useState<any>(null);
//   const [selectedPaymentMonth, setSelectedPaymentMonth] = useState('');
//   const [securityDepositInfo, setSecurityDepositInfo] = useState<any>(null);
//   const [newPayment, setNewPayment] = useState({
//     payment_type: 'rent',
//     amount: '',
//     payment_mode: 'cash',
//     bank_name: '',
//     transaction_id: '',
//     payment_date: new Date().toISOString().split('T')[0],
//     remark: ''
//   });

//   // Filters
//   const [filterType, setFilterType] = useState<'all' | 'rent' | 'deposit'>('all');
//   const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

//   const formatCurrency = (amount: number) => {
//     const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(validAmount);
//   };

//   const formatDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), 'dd MMM yyyy');
//     } catch {
//       return dateString;
//     }
//   };

//   // Fetch tenant data and payments
//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const tenantId = getTenantId();
      
//       if (!tenantId) {
//         navigate('/login');
//         return;
//       }

//       // Fetch tenant profile
//       const profileRes = await tenantDetailsApi.loadProfile();
//       if (profileRes.success) {
//         setTenant(profileRes.data);
//       }

//       // Fetch payments
//       const paymentsRes = await paymentApi.getPaymentsByTenant(tenantId);
//       if (paymentsRes.success) {
//         const paymentData = paymentsRes.data || [];
//         setPayments(paymentData);
//         calculateStats(paymentData);
//       }

//       // Fetch payment form data
//       const formDataRes = await paymentApi.getTenantPaymentFormData(tenantId);
//       if (formDataRes.success) {
//         setPaymentFormData(formDataRes.data);
//       }

//       // Fetch security deposit info
//       const depositRes = await paymentApi.getSecurityDepositInfo(tenantId);
//       if (depositRes.success) {
//         setSecurityDepositInfo(depositRes.data);
//       }

//     } catch (error) {
//       console.error('Error fetching payment data:', error);
//       toast.error('Failed to load payment data');
//     } finally {
//       setLoading(false);
//     }
//   }, [navigate]);

//   const calculateStats = (payments: Payment[]) => {
//     let rentTotalPaid = 0;
//     let rentTotalPending = 0;
//     let rentApprovedCount = 0;
//     let rentPendingCount = 0;
//     let rentRejectedCount = 0;
//     const monthsPaid = new Set<string>();
//     const monthsPending = new Set<string>();
    
//     let depositTotalPaid = 0;
//     let depositTotalPending = 0;
//     let depositApprovedCount = 0;
//     let depositPendingCount = 0;
//     let depositRejectedCount = 0;
//     let depositRequiredAmount = 0;

//     // Find max deposit amount
//     payments.forEach(payment => {
//       if (payment.payment_type === 'security_deposit') {
//         const amount = Number(payment.amount) || 0;
//         if (amount > depositRequiredAmount) {
//           depositRequiredAmount = amount;
//         }
//       }
//     });

//     // Calculate stats
//     payments.forEach(payment => {
//       const amount = Number(payment.amount) || 0;

//       if (payment.payment_type === 'rent') {
//         const monthKey = `${payment.month || ''}-${payment.year || ''}`;
        
//         if (payment.status === 'approved') {
//           rentTotalPaid += amount;
//           rentApprovedCount++;
//           if (monthKey !== '-') monthsPaid.add(monthKey);
//         } else if (payment.status === 'pending') {
//           rentTotalPending += amount;
//           rentPendingCount++;
//           if (monthKey !== '-') monthsPending.add(monthKey);
//         } else if (payment.status === 'rejected') {
//           rentRejectedCount++;
//         }
//       } else if (payment.payment_type === 'security_deposit') {
//         if (payment.status === 'approved') {
//           depositTotalPaid += amount;
//           depositApprovedCount++;
//         } else if (payment.status === 'pending') {
//           depositTotalPending += amount;
//           depositPendingCount++;
//         } else if (payment.status === 'rejected') {
//           depositRejectedCount++;
//         }
//       }
//     });

//     setRentStats({
//       totalPaid: rentTotalPaid,
//       totalPending: rentTotalPending,
//       approvedCount: rentApprovedCount,
//       pendingCount: rentPendingCount,
//       rejectedCount: rentRejectedCount,
//       monthsPaid,
//       monthsPending
//     });

//     setDepositStats({
//       requiredAmount: depositRequiredAmount,
//       totalPaid: depositTotalPaid,
//       totalPending: depositTotalPending,
//       approvedCount: depositApprovedCount,
//       pendingCount: depositPendingCount,
//       rejectedCount: depositRejectedCount,
//       isFullyPaid: depositTotalPaid >= depositRequiredAmount && depositRequiredAmount > 0
//     });
//   };

//   // Handle payment submission
//   const handleSubmitPayment = useCallback(async () => {
//     if (!newPayment.amount) {
//       toast.error("Please enter an amount");
//       return;
//     }

//     try {
//       const paymentData: any = {
//         tenant_id: tenant?.id,
//         booking_id: null,
//         payment_type: newPayment.payment_type,
//         amount: parseFloat(newPayment.amount),
//         payment_mode: newPayment.payment_mode,
//         bank_name: newPayment.bank_name || null,
//         transaction_id: newPayment.transaction_id || null,
//         payment_date: newPayment.payment_date,
//         remark: newPayment.remark || null,
//       };

//       if (newPayment.payment_type === 'rent' && selectedPaymentMonth) {
//         if (selectedPaymentMonth !== 'current') {
//           const [year, month] = selectedPaymentMonth.split('-');
//           const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
//             'July', 'August', 'September', 'October', 'November', 'December'];
          
//           paymentData.month = monthNames[parseInt(month) - 1];
//           paymentData.year = parseInt(year);
//           paymentData.remark = paymentData.remark || `Payment for ${paymentData.month} ${paymentData.year}`;
//         } else {
//           const currentDate = new Date();
//           paymentData.month = currentDate.toLocaleString('default', { month: 'long' });
//           paymentData.year = currentDate.getFullYear();
//         }
//       }

//       const response = await paymentApi.createPayment(paymentData);

//       if (response.success && response.data) {
//         // Create notification for admin
//         try {
//           const paymentTypeDisplay = newPayment.payment_type === 'rent' ? 'Rent' : 'Security Deposit';
//           const monthDisplay = paymentData.month ? ` for ${paymentData.month} ${paymentData.year}` : '';
          
//           await notificationApi.createNotification({
//             recipient_id: 1,
//             recipient_type: 'admin',
//             title: '💰 New Payment Request',
//             message: `${tenant?.full_name} has initiated a ${paymentTypeDisplay} payment of ₹${parseFloat(newPayment.amount).toLocaleString()}${monthDisplay}. Payment mode: ${newPayment.payment_mode}.`,
//             notification_type: 'payment',
//             related_entity_type: 'payment',
//             related_entity_id: response.data.id,
//             priority: 'medium'
//           });
//         } catch (notifError) {
//           console.error('Error creating notification:', notifError);
//         }

//         setShowPaymentDialog(false);
//         setNewPayment({
//           payment_type: 'rent',
//           amount: '',
//           payment_mode: 'cash',
//           bank_name: '',
//           transaction_id: '',
//           payment_date: new Date().toISOString().split('T')[0],
//           remark: ''
//         });
//         setSelectedPaymentMonth('');
        
//         toast.success('Payment initiated successfully');
//         fetchData(); // Refresh data
//       } else {
//         toast.error(response.message || 'Failed to initiate payment');
//       }
//     } catch (error: any) {
//       console.error('Payment error:', error);
//       toast.error(error.message || 'Failed to initiate payment');
//     }
//   }, [tenant, newPayment, selectedPaymentMonth, fetchData]);

//   const handlePaymentTypeChange = async (type: string) => {
//     setNewPayment(prev => ({ ...prev, payment_type: type }));
//     setSelectedPaymentMonth('');
    
//     if (type === 'rent') {
//       setSecurityDepositInfo(null);
//       setNewPayment(prev => ({ ...prev, amount: '' }));
//     } else if (type === 'security_deposit') {
//       setPaymentFormData(null);
//       if (tenant?.id) {
//         const depositRes = await paymentApi.getSecurityDepositInfo(tenant.id);
//         if (depositRes.success && depositRes.data) {
//           setSecurityDepositInfo(depositRes.data);
//           if (depositRes.data.pending_amount > 0) {
//             setNewPayment(prev => ({
//               ...prev,
//               amount: depositRes.data.pending_amount.toString()
//             }));
//           }
//         }
//       }
//     }
//   };

//   // Filter payments
//   const filteredPayments = payments.filter(payment => {
//     if (filterType !== 'all' && payment.payment_type !== filterType) return false;
//     if (filterStatus !== 'all' && payment.status !== filterStatus) return false;
//     return true;
//   });

//   // Calculate progress
//   const rentProgress = rentStats.monthsPaid.size > 0 || rentStats.monthsPending.size > 0
//     ? (rentStats.monthsPaid.size / (rentStats.monthsPaid.size + rentStats.monthsPending.size)) * 100
//     : 0;

//   const depositProgress = depositStats.requiredAmount > 0
//     ? (depositStats.totalPaid / depositStats.requiredAmount) * 100
//     : 0;

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 p-4 md:p-6">
//         <div className="max-w-7xl mx-auto space-y-4">
//           <Skeleton className="h-10 w-48" />
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
//           </div>
//           <Skeleton className="h-64 rounded-xl" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Header */}
//       <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => navigate('/tenant/portal#dashboard')}
//             className="h-8 w-8 text-slate-600"
//           >
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-lg font-bold text-slate-800">Payments</h1>
//             <p className="text-xs text-slate-500">Manage your payments and view history</p>
//           </div>
//           <Badge className="ml-auto bg-[#e6f0ff] text-[#004aad] border-none">
//             {payments.length} Transactions
//           </Badge>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto p-4 space-y-6">
//         {/* Quick Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <StatCard
//             title="Total Paid"
//             value={formatCurrency(rentStats.totalPaid + depositStats.totalPaid)}
//             subValue={`${rentStats.approvedCount + depositStats.approvedCount} transactions`}
//             icon={CheckCircle2}
//             color="green"
//           />
//           <StatCard
//             title="Pending"
//             value={formatCurrency(rentStats.totalPending + depositStats.totalPending)}
//             subValue={`${rentStats.pendingCount + depositStats.pendingCount} pending`}
//             icon={Clock}
//             color="gold"
//           />
//           <StatCard
//             title="Rent Paid"
//             value={formatCurrency(rentStats.totalPaid)}
//             subValue={`${rentStats.monthsPaid.size} months covered`}
//             icon={Home}
//             color="blue"
//           />
//           <StatCard
//             title="Deposit"
//             value={formatCurrency(depositStats.totalPaid)}
//             subValue={depositStats.isFullyPaid ? 'Fully paid' : `${Math.round(depositProgress)}% paid`}
//             icon={Shield}
//             color="purple"
//           />
//         </div>

//         {/* Action Button */}
//         <Button 
//           className="w-full bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#002a7a] hover:to-[#001a5a] h-12"
//           onClick={() => setShowPaymentDialog(true)}
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Make a Payment
//         </Button>

//         {/* Rent Summary Card */}
//         <Card className="border border-[#004aad]/20 overflow-hidden">
//           <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-4 py-3">
//             <div className="flex items-center justify-between">
//               <h3 className="text-white font-medium flex items-center gap-2">
//                 <Home className="h-4 w-4" />
//                 Rent Overview
//               </h3>
//               <Badge className="bg-white/20 text-white border-white/30 rounded-full">
//                 {rentStats.monthsPaid.size} months paid
//               </Badge>
//             </div>
//           </div>
//           <CardContent className="p-4">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//               <div className="bg-[#e6f0ff] rounded-lg p-3">
//                 <p className="text-xs text-[#004aad] mb-1">Total Paid</p>
//                 <p className="text-xl font-bold text-[#004aad]">{formatCurrency(rentStats.totalPaid)}</p>
//                 <p className="text-xs text-[#004aad]/70 mt-1">{rentStats.approvedCount} payments</p>
//               </div>
//               <div className="bg-[#fff9e6] rounded-lg p-3">
//                 <p className="text-xs text-[#ffc107] mb-1">Pending</p>
//                 <p className="text-xl font-bold text-[#ffc107]">{formatCurrency(rentStats.totalPending)}</p>
//                 <p className="text-xs text-[#ffc107]/70 mt-1">{rentStats.pendingCount} payments</p>
//               </div>
//               <div className="bg-blue-50 rounded-lg p-3">
//                 <p className="text-xs text-blue-600 mb-1">Months Covered</p>
//                 <p className="text-xl font-bold text-blue-600">{rentStats.monthsPaid.size}</p>
//                 <p className="text-xs text-blue-600/70 mt-1">months</p>
//               </div>
//               <div className="bg-red-50 rounded-lg p-3">
//                 <p className="text-xs text-red-600 mb-1">Rejected</p>
//                 <p className="text-xl font-bold text-red-600">{rentStats.rejectedCount}</p>
//               </div>
//             </div>
//             <div className="mt-2 bg-slate-50 p-3 rounded-lg">
//               <div className="flex justify-between text-xs text-slate-600 mb-2">
//                 <span>Payment Progress</span>
//                 <span className="font-bold text-[#004aad]">{Math.round(rentProgress)}% of months paid</span>
//               </div>
//               <Progress value={rentProgress} className="h-2" />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Deposit Summary Card */}
//         {depositStats.requiredAmount > 0 && (
//           <Card className="border border-[#ffc107]/20 overflow-hidden">
//             <div className="bg-gradient-to-r from-[#ffc107] to-[#e6b002] px-4 py-3">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-white font-medium flex items-center gap-2">
//                   <Shield className="h-4 w-4" />
//                   Security Deposit
//                 </h3>
//                 <Badge className="bg-white/20 text-white border-white/30 rounded-full">
//                   {depositStats.isFullyPaid ? 'Fully Paid' : `${Math.round(depositProgress)}% Paid`}
//                 </Badge>
//               </div>
//             </div>
//             <CardContent className="p-4">
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                 <div className="bg-purple-50 rounded-lg p-3">
//                   <p className="text-xs text-purple-600 mb-1">Required</p>
//                   <p className="text-xl font-bold text-purple-600">{formatCurrency(depositStats.requiredAmount)}</p>
//                 </div>
//                 <div className="bg-[#e6f0ff] rounded-lg p-3">
//                   <p className="text-xs text-[#004aad] mb-1">Paid</p>
//                   <p className="text-xl font-bold text-[#004aad]">{formatCurrency(depositStats.totalPaid)}</p>
//                   <p className="text-xs text-[#004aad]/70 mt-1">{depositStats.approvedCount} payments</p>
//                 </div>
//                 <div className="bg-[#fff9e6] rounded-lg p-3">
//                   <p className="text-xs text-[#ffc107] mb-1">Pending</p>
//                   <p className="text-xl font-bold text-[#ffc107]">{formatCurrency(depositStats.totalPending)}</p>
//                   <p className="text-xs text-[#ffc107]/70 mt-1">{depositStats.pendingCount} payments</p>
//                 </div>
//                 <div className="bg-slate-50 rounded-lg p-3">
//                   <p className="text-xs text-slate-600 mb-1">Status</p>
//                   {depositStats.isFullyPaid ? (
//                     <div className="flex items-center gap-1">
//                       <CheckCircle2 className="h-4 w-4 text-green-600" />
//                       <span className="text-sm font-bold text-green-600">Fully Paid</span>
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-1">
//                       <Clock className="h-4 w-4 text-[#ffc107]" />
//                       <span className="text-sm font-bold text-[#ffc107]">{Math.round(depositProgress)}%</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="mt-2 bg-slate-50 p-3 rounded-lg">
//                 <div className="flex justify-between text-xs text-slate-600 mb-2">
//                   <span>Deposit Progress</span>
//                   <span className="font-bold text-[#ffc107]">{Math.round(depositProgress)}% paid</span>
//                 </div>
//                 <Progress value={depositProgress} className="h-2 bg-slate-200 [&>div]:bg-gradient-to-r [&>div]:from-[#ffc107] [&>div]:to-[#e6b002]" />
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Payment History with Filters */}
//         <Card className="border border-slate-200">
//           <CardHeader className="pb-3">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//               <CardTitle className="text-base flex items-center gap-2">
//                 <CreditCard className="h-4 w-4 text-[#004aad]" />
//                 Payment History
//               </CardTitle>
//               <div className="flex flex-wrap gap-2">
//                 <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
//                   <SelectTrigger className="w-[120px] h-8 text-xs">
//                     <SelectValue placeholder="Type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Types</SelectItem>
//                     <SelectItem value="rent">Rent</SelectItem>
//                     <SelectItem value="deposit">Deposit</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
//                   <SelectTrigger className="w-[120px] h-8 text-xs">
//                     <SelectValue placeholder="Status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Status</SelectItem>
//                     <SelectItem value="approved">Completed</SelectItem>
//                     <SelectItem value="pending">Pending</SelectItem>
//                     <SelectItem value="rejected">Rejected</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="h-8 text-xs"
//                   onClick={fetchData}
//                 >
//                   <RefreshCw className="h-3 w-3 mr-1" />
//                   Refresh
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {filteredPayments.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
//                   <CreditCard className="h-8 w-8 text-slate-400" />
//                 </div>
//                 <p className="text-sm font-medium text-slate-800 mb-1">No Payments Found</p>
//                 <p className="text-xs text-slate-500 max-w-sm mx-auto">
//                   {payments.length === 0 
//                     ? "No payment history available" 
//                     : "No payments match your filters"}
//                 </p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {filteredPayments.map((payment) => (
//                   <PaymentHistoryItem
//                     key={payment.id}
//                     payment={payment}
//                     formatCurrency={formatCurrency}
//                     formatDate={formatDate}
//                   />
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Payment Dialog */}
//       <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
//         <DialogContent className="max-w-4xl max-h-[600px] p-0 gap-0 overflow-auto">
//           <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-6 py-4 rounded-t-lg sticky top-0 z-20">
//             <div className="flex items-center justify-between">
//               <div>
//                 <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
//                   <div className="p-1 bg-white/20 rounded-lg">
//                     <Plus className="h-5 w-5" />
//                   </div>
//                   Make a Payment
//                 </DialogTitle>
//                 <DialogDescription className="text-blue-100 text-sm mt-1">
//                   Record a new payment for your account
//                 </DialogDescription>
//               </div>
//               <DialogClose asChild>
//                 <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8">
//                   <X className="h-4 w-4" />
//                 </Button>
//               </DialogClose>
//             </div>
//           </div>

//           <div className="p-6">
//             {/* Tenant Info */}
//             <div className="grid grid-cols-2 gap-4 mb-4">
//               <div className="space-y-1.5">
//                 <Label className="text-xs font-medium text-slate-700">Tenant</Label>
//                 <div className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm flex items-center">
//                   <User className="h-3.5 w-3.5 text-slate-400 mr-2" />
//                   <span>{tenant?.full_name}</span>
//                 </div>
//               </div>
//               <div className="space-y-1.5">
//                 <Label className="text-xs font-medium text-slate-700">Payment Type</Label>
//                 <Select value={newPayment.payment_type} onValueChange={handlePaymentTypeChange}>
//                   <SelectTrigger className="h-10">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="rent">Rent</SelectItem>
//                     <SelectItem value="security_deposit">Security Deposit</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Accommodation Details */}
//             {tenant && (
//               <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
//                 <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
//                   <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
//                     <Bed className="h-3.5 w-3.5" />
//                     Your Accommodation Details
//                   </h4>
//                 </div>
//                 <div className="p-4">
//                   <table className="w-full text-sm">
//                     <thead className="bg-slate-50">
//                       <tr>
//                         <th className="text-left p-2 text-xs font-medium text-slate-600">Property</th>
//                         <th className="text-left p-2 text-xs font-medium text-slate-600">Room</th>
//                         <th className="text-left p-2 text-xs font-medium text-slate-600">Bed #</th>
//                         <th className="text-left p-2 text-xs font-medium text-slate-600">Monthly Rent</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr className="border-t border-slate-200">
//                         <td className="p-2 text-sm">{tenant?.property_name || 'Roomac Heights'}</td>
//                         <td className="p-2 text-sm">Room {tenant?.room_number || 'N/A'}</td>
//                         <td className="p-2 text-sm font-medium">#{tenant?.bed_number || 'N/A'}</td>
//                         <td className="p-2 text-sm font-semibold text-green-600">
//                           ₹{Number(tenant?.tenant_rent || tenant?.monthly_rent).toLocaleString()}
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* Payment History Table */}
//             {paymentFormData?.month_wise_history?.length > 0 && (
//               <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
//                 <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
//                   <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
//                     <IndianRupee className="h-3.5 w-3.5" />
//                     Payment History
//                   </h4>
//                 </div>
//                 <div className="p-4 max-h-[200px] overflow-y-auto">
//                   <table className="w-full text-sm">
//                     <thead className="bg-slate-50 sticky top-0">
//                       <tr>
//                         <th className="text-left p-2 text-xs font-medium text-slate-600">Month</th>
//                         <th className="text-right p-2 text-xs font-medium text-slate-600">Paid</th>
//                         <th className="text-right p-2 text-xs font-medium text-slate-600">Pending</th>
//                         <th className="text-center p-2 text-xs font-medium text-slate-600">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {paymentFormData.month_wise_history.slice(-6).map((month: any, index: number) => (
//                         <tr key={index} className="border-t border-slate-200">
//                           <td className="p-2 text-sm">{month.month} {month.year}</td>
//                           <td className="p-2 text-right text-green-600">₹{month.paid?.toLocaleString() || '0'}</td>
//                           <td className="p-2 text-right text-amber-600">₹{month.pending?.toLocaleString() || month.rent?.toLocaleString()}</td>
//                           <td className="p-2 text-center">
//                             <Badge className={
//                               month.status === 'paid' ? 'bg-green-100 text-green-800' :
//                               month.status === 'partial' ? 'bg-blue-100 text-blue-800' :
//                               'bg-slate-100 text-slate-800'
//                             }>
//                               {month.status || 'pending'}
//                             </Badge>
//                           </td>
//                         </tr>
//                       ))}
//                       <tr className="border-t-2 border-slate-300 bg-slate-50">
//                         <td className="p-2 text-sm font-bold">Total</td>
//                         <td className="p-2 text-right font-bold text-green-600">
//                           ₹{paymentFormData.total_paid?.toLocaleString() || '0'}
//                         </td>
//                         <td className="p-2 text-right font-bold text-amber-600">
//                           ₹{paymentFormData.total_pending?.toLocaleString() || '0'}
//                         </td>
//                         <td className="p-2 text-center"></td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* Security Deposit Info */}
//             {newPayment.payment_type === 'security_deposit' && securityDepositInfo && (
//               <div className="bg-white rounded-lg border border-slate-200 mb-4 overflow-hidden">
//                 <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
//                   <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
//                     <Shield className="h-3.5 w-3.5" />
//                     Security Deposit Information
//                   </h4>
//                 </div>
//                 <div className="p-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-xs text-slate-500">Total Required</p>
//                       <p className="text-sm font-bold text-blue-600">₹{securityDepositInfo.security_deposit.toLocaleString()}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-500">Paid</p>
//                       <p className="text-sm font-medium text-green-600">₹{securityDepositInfo.paid_amount.toLocaleString()}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-500">Pending</p>
//                       <p className="text-sm font-bold text-amber-600">₹{securityDepositInfo.pending_amount.toLocaleString()}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-500">Progress</p>
//                       <p className="text-sm font-medium">{Math.round((securityDepositInfo.paid_amount / securityDepositInfo.security_deposit) * 100)}%</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Payment Form */}
//             <div className="grid grid-cols-4 gap-3 mb-4">
//               <div className="space-y-1.5">
//                 <Label className="text-xs font-medium text-slate-700">Amount (₹) *</Label>
//                 <Input
//                   type="number"
//                   placeholder="0.00"
//                   value={newPayment.amount}
//                   onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
//                   className="h-10"
//                 />
//               </div>

//               {newPayment.payment_type === 'rent' && paymentFormData?.unpaid_months?.length > 0 && (
//                 <div className="space-y-1.5">
//                   <Label className="text-xs font-medium text-slate-700">Pay For Month</Label>
//                   <Select value={selectedPaymentMonth} onValueChange={setSelectedPaymentMonth}>
//                     <SelectTrigger className="h-10">
//                       <SelectValue placeholder="Select month" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="current">Current Month</SelectItem>
//                       {paymentFormData.unpaid_months.map((month: any) => (
//                         <SelectItem key={month.month_key} value={month.month_key}>
//                           <span>{month.month} {month.year}</span>
//                           <span className="ml-2 text-amber-600">₹{month.pending.toLocaleString()}</span>
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               )}

//               <div className="space-y-1.5">
//                 <Label className="text-xs font-medium text-slate-700">Payment Mode *</Label>
//                 <Select
//                   value={newPayment.payment_mode}
//                   onValueChange={(value) => setNewPayment({ ...newPayment, payment_mode: value })}
//                 >
//                   <SelectTrigger className="h-10">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="cash">💵 Cash</SelectItem>
//                     <SelectItem value="online">🌐 Online</SelectItem>
//                     <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
//                     <SelectItem value="cheque">📝 Cheque</SelectItem>
//                     <SelectItem value="card">💳 Card</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="space-y-1.5">
//                 <Label className="text-xs font-medium text-slate-700">Payment Date</Label>
//                 <Input
//                   type="date"
//                   value={newPayment.payment_date}
//                   onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
//                   className="h-10"
//                 />
//               </div>
//             </div>

//             {/* Additional Fields */}
//             {(newPayment.payment_mode === 'bank_transfer' || newPayment.payment_mode === 'online' || newPayment.payment_mode === 'cheque') && (
//               <div className="grid grid-cols-3 gap-3 mb-4">
//                 {newPayment.payment_mode === 'bank_transfer' && (
//                   <div className="space-y-1.5">
//                     <Label className="text-xs font-medium text-slate-700">Bank Name</Label>
//                     <Input
//                       placeholder="Enter bank name"
//                       value={newPayment.bank_name || ''}
//                       onChange={(e) => setNewPayment({ ...newPayment, bank_name: e.target.value })}
//                       className="h-10"
//                     />
//                   </div>
//                 )}
//                 <div className="space-y-1.5">
//                   <Label className="text-xs font-medium text-slate-700">Transaction ID</Label>
//                   <Input
//                     placeholder="Optional"
//                     value={newPayment.transaction_id || ''}
//                     onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })}
//                     className="h-10"
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label className="text-xs font-medium text-slate-700">Remark</Label>
//                   <Input
//                     placeholder="Add notes"
//                     value={newPayment.remark || ''}
//                     onChange={(e) => setNewPayment({ ...newPayment, remark: e.target.value })}
//                     className="h-10"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Footer */}
//             <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-lg -mx-6 -mb-6">
//               <div className="flex justify-end gap-3 w-full">
//                 <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleSubmitPayment}
//                   disabled={!newPayment.amount}
//                   className="bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#002a7a] hover:to-[#001a5a] text-white"
//                 >
//                   <Plus className="h-4 w-4 mr-2" />
//                   Make Payment
//                 </Button>
//               </div>
//             </DialogFooter>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Home,
  Shield,
  Download,
  ArrowLeft,
  FileText,
  RefreshCw,
  Plus,
  X,
  User,
  Bed,
  AlertCircle,
  Wallet,
  TrendingUp,
  Landmark
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

import { getTenantId, type TenantProfile } from "@/lib/tenantAuthApi";
import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
import * as paymentApi from '@/lib/paymentRecordApi';
import * as notificationApi from '@/lib/notificationApi';

// Types
interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  payment_mode: string;
  bank_name?: string;
  transaction_id?: string;
  month?: string;
  year?: number;
  remark?: string;
  status: string;
  payment_type: string;
}

interface RentStats {
  totalPaid: number;
  totalPending: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  monthsPaid: Set<string>;
  monthsPending: Set<string>;
}

interface DepositStats {
  requiredAmount: number;
  totalPaid: number;
  totalPending: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  isFullyPaid: boolean;
}

// Compact Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { className: string; icon: any; label: string }> = {
    approved: { 
      className: 'bg-green-50 text-green-600 border-green-200', 
      icon: CheckCircle2,
      label: 'Paid'
    },
    pending: { 
      className: 'bg-[#fff9e6] text-[#ffc107] border-[#ffc107]/20', 
      icon: Clock,
      label: 'Pending'
    },
    rejected: { 
      className: 'bg-red-50 text-red-600 border-red-200', 
      icon: XCircle,
      label: 'Failed'
    }
  };

  const config = variants[status] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} flex items-center gap-0.5 text-[9px] px-1.5 py-0 h-4 rounded-full`}>
      <Icon className="h-2.5 w-2.5" />
      <span>{config.label}</span>
    </Badge>
  );
};

// Compact Stat Card
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue'
}: { 
  title: string; 
  value: string; 
  icon: any; 
  color?: 'blue' | 'gold' | 'green' | 'red' | 'purple';
}) => {
  const colorClasses = {
    blue: 'bg-[#e6f0ff] text-[#004aad]',
    gold: 'bg-[#fff9e6] text-[#ffc107]',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-2.5 hover:shadow-sm transition-all">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-3 w-3" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-xs font-bold text-slate-800 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Compact Payment History Item
const PaymentHistoryItem = ({ payment, formatCurrency, formatDate }: { 
  payment: Payment; 
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}) => (
  <div className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-all">
    <div className="flex items-start justify-between gap-2">
      {/* Left Section */}
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
          payment.payment_type === 'rent' ? 'bg-[#e6f0ff]' : 'bg-[#fff9e6]'
        }`}>
          {payment.payment_type === 'rent' ? (
            <Home className="h-3 w-3 text-[#004aad]" />
          ) : (
            <Shield className="h-3 w-3 text-[#ffc107]" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1 mb-0.5">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {payment.remark || (payment.payment_type === 'rent' ? 'Rent' : 'Deposit')}
            </p>
            {payment.month && payment.year && (
              <span className="text-[8px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                {payment.month} {payment.year}
              </span>
            )}
          </div>
          
          <div className="flex items-center flex-wrap gap-1.5 text-[8px] text-slate-500">
            <div className="flex items-center gap-0.5">
              <Calendar className="h-2.5 w-2.5" />
              <span>{formatDate(payment.payment_date)}</span>
            </div>
            <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
            <div className="flex items-center gap-0.5">
              <CreditCard className="h-2.5 w-2.5" />
              <span className="capitalize truncate max-w-[50px]">{payment.payment_mode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-xs font-bold text-[#004aad]">{formatCurrency(payment.amount)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={payment.status} />
          {(payment.status === 'approved' || payment.status === 'completed') && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 text-[#004aad] hover:text-[#004aad] hover:bg-[#e6f0ff] rounded"
              onClick={() => window.open(`/api/payments/receipts/${payment.id}/download`, '_blank')}
            >
              <Download className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function TenantPaymentsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  // Stats
  const [rentStats, setRentStats] = useState<RentStats>({
    totalPaid: 0,
    totalPending: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    monthsPaid: new Set(),
    monthsPending: new Set()
  });
  
  const [depositStats, setDepositStats] = useState<DepositStats>({
    requiredAmount: 0,
    totalPaid: 0,
    totalPending: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    isFullyPaid: false
  });

  // Dialog states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState<any>(null);
  const [selectedPaymentMonth, setSelectedPaymentMonth] = useState('');
  const [securityDepositInfo, setSecurityDepositInfo] = useState<any>(null);
  const [newPayment, setNewPayment] = useState({
    payment_type: 'rent',
    amount: '',
    payment_mode: 'cash',
    bank_name: '',
    transaction_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    remark: ''
  });

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'rent' | 'deposit'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  const formatCurrency = (amount: number) => {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(validAmount).replace('₹', '₹');
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM');
    } catch {
      return dateString;
    }
  };

  // Fetch tenant data and payments
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const tenantId = getTenantId();
      
      if (!tenantId) {
        navigate('/login');
        return;
      }

      // Fetch tenant profile
      const profileRes = await tenantDetailsApi.loadProfile();
      if (profileRes.success) {
        setTenant(profileRes.data);
      }

      // Fetch payments
      const paymentsRes = await paymentApi.getPaymentsByTenant(tenantId);
      if (paymentsRes.success) {
        const paymentData = paymentsRes.data || [];
        setPayments(paymentData);
        calculateStats(paymentData);
      }

      // Fetch payment form data
      const formDataRes = await paymentApi.getTenantPaymentFormData(tenantId);
      if (formDataRes.success) {
        setPaymentFormData(formDataRes.data);
      }

      // Fetch security deposit info
      const depositRes = await paymentApi.getSecurityDepositInfo(tenantId);
      if (depositRes.success) {
        setSecurityDepositInfo(depositRes.data);
      }

    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const calculateStats = (payments: Payment[]) => {
    let rentTotalPaid = 0;
    let rentTotalPending = 0;
    let rentApprovedCount = 0;
    let rentPendingCount = 0;
    let rentRejectedCount = 0;
    const monthsPaid = new Set<string>();
    const monthsPending = new Set<string>();
    
    let depositTotalPaid = 0;
    let depositTotalPending = 0;
    let depositApprovedCount = 0;
    let depositPendingCount = 0;
    let depositRejectedCount = 0;
    let depositRequiredAmount = 0;

    // Find max deposit amount
    payments.forEach(payment => {
      if (payment.payment_type === 'security_deposit') {
        const amount = Number(payment.amount) || 0;
        if (amount > depositRequiredAmount) {
          depositRequiredAmount = amount;
        }
      }
    });

    // Calculate stats
    payments.forEach(payment => {
      const amount = Number(payment.amount) || 0;

      if (payment.payment_type === 'rent') {
        const monthKey = `${payment.month || ''}-${payment.year || ''}`;
        
        if (payment.status === 'approved') {
          rentTotalPaid += amount;
          rentApprovedCount++;
          if (monthKey !== '-') monthsPaid.add(monthKey);
        } else if (payment.status === 'pending') {
          rentTotalPending += amount;
          rentPendingCount++;
          if (monthKey !== '-') monthsPending.add(monthKey);
        } else if (payment.status === 'rejected') {
          rentRejectedCount++;
        }
      } else if (payment.payment_type === 'security_deposit') {
        if (payment.status === 'approved') {
          depositTotalPaid += amount;
          depositApprovedCount++;
        } else if (payment.status === 'pending') {
          depositTotalPending += amount;
          depositPendingCount++;
        } else if (payment.status === 'rejected') {
          depositRejectedCount++;
        }
      }
    });

    setRentStats({
      totalPaid: rentTotalPaid,
      totalPending: rentTotalPending,
      approvedCount: rentApprovedCount,
      pendingCount: rentPendingCount,
      rejectedCount: rentRejectedCount,
      monthsPaid,
      monthsPending
    });

    setDepositStats({
      requiredAmount: depositRequiredAmount,
      totalPaid: depositTotalPaid,
      totalPending: depositTotalPending,
      approvedCount: depositApprovedCount,
      pendingCount: depositPendingCount,
      rejectedCount: depositRejectedCount,
      isFullyPaid: depositTotalPaid >= depositRequiredAmount && depositRequiredAmount > 0
    });
  };

  // Handle payment submission
  const handleSubmitPayment = useCallback(async () => {
    if (!newPayment.amount) {
      toast.error("Please enter an amount");
      return;
    }

    try {
      const paymentData: any = {
        tenant_id: tenant?.id,
        booking_id: null,
        payment_type: newPayment.payment_type,
        amount: parseFloat(newPayment.amount),
        payment_mode: newPayment.payment_mode,
        bank_name: newPayment.bank_name || null,
        transaction_id: newPayment.transaction_id || null,
        payment_date: newPayment.payment_date,
        remark: newPayment.remark || null,
      };

      if (newPayment.payment_type === 'rent' && selectedPaymentMonth) {
        if (selectedPaymentMonth !== 'current') {
          const [year, month] = selectedPaymentMonth.split('-');
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
          
          paymentData.month = monthNames[parseInt(month) - 1];
          paymentData.year = parseInt(year);
          paymentData.remark = paymentData.remark || `Payment for ${paymentData.month} ${paymentData.year}`;
        } else {
          const currentDate = new Date();
          paymentData.month = currentDate.toLocaleString('default', { month: 'long' });
          paymentData.year = currentDate.getFullYear();
        }
      }

      const response = await paymentApi.createPayment(paymentData);

      if (response.success && response.data) {
        // Create notification for admin
        try {
          const paymentTypeDisplay = newPayment.payment_type === 'rent' ? 'Rent' : 'Security Deposit';
          const monthDisplay = paymentData.month ? ` for ${paymentData.month} ${paymentData.year}` : '';
          
          await notificationApi.createNotification({
            recipient_id: 1,
            recipient_type: 'admin',
            title: '💰 New Payment Request',
            message: `${tenant?.full_name} has initiated a ${paymentTypeDisplay} payment of ₹${parseFloat(newPayment.amount).toLocaleString()}${monthDisplay}. Payment mode: ${newPayment.payment_mode}.`,
            notification_type: 'payment',
            related_entity_type: 'payment',
            related_entity_id: response.data.id,
            priority: 'medium'
          });
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }

        setShowPaymentDialog(false);
        setNewPayment({
          payment_type: 'rent',
          amount: '',
          payment_mode: 'cash',
          bank_name: '',
          transaction_id: '',
          payment_date: new Date().toISOString().split('T')[0],
          remark: ''
        });
        setSelectedPaymentMonth('');
        
        toast.success('Payment initiated successfully');
        fetchData(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
    }
  }, [tenant, newPayment, selectedPaymentMonth, fetchData]);

  const handlePaymentTypeChange = async (type: string) => {
    setNewPayment(prev => ({ ...prev, payment_type: type }));
    setSelectedPaymentMonth('');
    
    if (type === 'rent') {
      setSecurityDepositInfo(null);
      setNewPayment(prev => ({ ...prev, amount: '' }));
    } else if (type === 'security_deposit') {
      setPaymentFormData(null);
      if (tenant?.id) {
        const depositRes = await paymentApi.getSecurityDepositInfo(tenant.id);
        if (depositRes.success && depositRes.data) {
          setSecurityDepositInfo(depositRes.data);
          if (depositRes.data.pending_amount > 0) {
            setNewPayment(prev => ({
              ...prev,
              amount: depositRes.data.pending_amount.toString()
            }));
          }
        }
      }
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (filterType !== 'all' && payment.payment_type !== filterType) return false;
    if (filterStatus !== 'all' && payment.status !== filterStatus) return false;
    return true;
  });

  // Calculate progress
  const rentProgress = rentStats.monthsPaid.size > 0 || rentStats.monthsPending.size > 0
    ? (rentStats.monthsPaid.size / (rentStats.monthsPaid.size + rentStats.monthsPending.size)) * 100
    : 0;

  const depositProgress = depositStats.requiredAmount > 0
    ? (depositStats.totalPaid / depositStats.requiredAmount) * 100
    : 0;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-3">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="h-8 bg-slate-200 animate-pulse rounded w-32"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-200 animate-pulse rounded-lg"></div>)}
          </div>
          <div className="h-48 bg-slate-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-slate-50">
      {/* Compact Header */}
      <div className=" sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 py-2 flex items-end justify-end">
        
          
          {/* Make Payment Button - Top Right */}
          <Button 
            size="sm"
            className="bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#002a7a] hover:to-[#001a5a] text-white h-7 px-3 text-xs"
            onClick={() => setShowPaymentDialog(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Make a payment
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 space-y-3">
        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatCard
            title="Total Paid"
            value={formatCurrency(rentStats.totalPaid + depositStats.totalPaid)}
            icon={CheckCircle2}
            color="green"
          />
          <StatCard
            title="Pending"
            value={formatCurrency(rentStats.totalPending + depositStats.totalPending)}
            icon={Clock}
            color="gold"
          />
          <StatCard
            title="Rent"
            value={formatCurrency(rentStats.totalPaid)}
            icon={Home}
            color="blue"
          />
          <StatCard
            title="Deposit"
            value={formatCurrency(depositStats.totalPaid)}
            icon={Shield}
            color="purple"
          />
        </div>

        {/* Rent Summary - Compact */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-3 py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-xs font-medium flex items-center gap-1">
                <Home className="h-3 w-3" />
                Rent
              </h3>
              <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
                {rentStats.monthsPaid.size} months
              </Badge>
            </div>
          </div>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-[#e6f0ff] rounded-lg p-2">
                <p className="text-[8px] text-[#004aad] uppercase">Paid</p>
                <p className="text-xs font-bold text-[#004aad]">{formatCurrency(rentStats.totalPaid)}</p>
              </div>
              <div className="bg-[#fff9e6] rounded-lg p-2">
                <p className="text-[8px] text-[#ffc107] uppercase">Pending</p>
                <p className="text-xs font-bold text-[#ffc107]">{formatCurrency(rentStats.totalPending)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="text-[8px] text-blue-600 uppercase">Months</p>
                <p className="text-xs font-bold text-blue-600">{rentStats.monthsPaid.size}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <p className="text-[8px] text-red-600 uppercase">Failed</p>
                <p className="text-xs font-bold text-red-600">{rentStats.rejectedCount}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="flex justify-between text-[8px] text-slate-600 mb-1">
                <span>Progress</span>
                <span className="font-bold text-[#004aad]">{Math.round(rentProgress)}%</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#004aad] to-[#ffc107] rounded-full transition-all"
                  style={{ width: `${rentProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Summary - Compact */}
        {depositStats.requiredAmount > 0 && (
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#ffc107] to-[#e6b002] px-3 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-xs font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Deposit
                </h3>
                <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
                  {depositStats.isFullyPaid ? 'Paid' : `${Math.round(depositProgress)}%`}
                </Badge>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-[8px] text-purple-600 uppercase">Required</p>
                  <p className="text-xs font-bold text-purple-600">{formatCurrency(depositStats.requiredAmount)}</p>
                </div>
                <div className="bg-[#e6f0ff] rounded-lg p-2">
                  <p className="text-[8px] text-[#004aad] uppercase">Paid</p>
                  <p className="text-xs font-bold text-[#004aad]">{formatCurrency(depositStats.totalPaid)}</p>
                </div>
                <div className="bg-[#fff9e6] rounded-lg p-2">
                  <p className="text-[8px] text-[#ffc107] uppercase">Pending</p>
                  <p className="text-xs font-bold text-[#ffc107]">{formatCurrency(depositStats.totalPending)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-[8px] text-slate-600 uppercase">Status</p>
                  <div className="flex items-center gap-1">
                    {depositStats.isFullyPaid ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <Clock className="h-3 w-3 text-[#ffc107]" />
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {depositStats.isFullyPaid ? 'Paid' : 'Partial'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="flex justify-between text-[8px] text-slate-600 mb-1">
                  <span>Progress</span>
                  <span className="font-bold text-[#ffc107]">{Math.round(depositProgress)}%</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ffc107] to-[#e6b002] rounded-full transition-all"
                    style={{ width: `${depositProgress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History with Filters */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-[#004aad]" />
                History
              </h3>
              <div className="flex items-center gap-1">
                <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                  <SelectTrigger className="w-[70px] h-6 text-[9px] px-2">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All</SelectItem>
                    <SelectItem value="rent" className="text-xs">Rent</SelectItem>
                    <SelectItem value="deposit" className="text-xs">Deposit</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                  <SelectTrigger className="w-[70px] h-6 text-[9px] px-2">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All</SelectItem>
                    <SelectItem value="approved" className="text-xs">Paid</SelectItem>
                    <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                    <SelectItem value="rejected" className="text-xs">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={fetchData}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          <CardContent className="p-3">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-6">
                <div className="inline-flex p-2 bg-slate-100 rounded-full mb-2">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-xs font-medium text-slate-800">No payments found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredPayments.map((payment) => (
                  <PaymentHistoryItem
                    key={payment.id}
                    payment={payment}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compact Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-auto max-h-[90vh]">
          <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] px-4 py-3 sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-sm font-semibold flex items-center gap-2">
                <div className="p-1 bg-white/20 rounded-lg">
                  <Plus className="h-4 w-4" />
                </div>
                New Payment
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-7 w-7">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Tenant Info */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-slate-700">Tenant</Label>
                <div className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-md text-xs flex items-center">
                  <User className="h-3 w-3 text-slate-400 mr-1" />
                  <span className="truncate">{tenant?.full_name}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-slate-700">Payment Type</Label>
                <Select value={newPayment.payment_type} onValueChange={handlePaymentTypeChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent" className="text-xs">Rent</SelectItem>
                    <SelectItem value="security_deposit" className="text-xs">Security Deposit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Accommodation Details - Simplified */}
            {tenant && (
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                <div className="grid grid-cols-4 gap-1 text-[8px] text-slate-500 mb-1">
                  <div>Property</div>
                  <div>Room</div>
                  <div>Bed</div>
                  <div>Rent</div>
                </div>
                <div className="grid grid-cols-4 gap-1 text-xs font-medium">
                  <div className="truncate">{tenant?.property_name || 'Roomac'}</div>
                  <div>{tenant?.room_number || 'N/A'}</div>
                  <div>#{tenant?.bed_number || 'N/A'}</div>
                  <div className="text-green-600">₹{Number(tenant?.tenant_rent || tenant?.monthly_rent).toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Quick Payment Form */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-slate-700">Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-slate-700">Payment Mode</Label>
                <Select
                  value={newPayment.payment_mode}
                  onValueChange={(value) => setNewPayment({ ...newPayment, payment_mode: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash" className="text-xs">💵 Cash</SelectItem>
                    <SelectItem value="online" className="text-xs">🌐 Online</SelectItem>
                    <SelectItem value="bank_transfer" className="text-xs">🏦 Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Month Selection for Rent */}
            {newPayment.payment_type === 'rent' && paymentFormData?.unpaid_months?.length > 0 && (
              <div className="space-y-1">
                <Label className="text-[10px] font-medium text-slate-700">Pay For Month</Label>
                <Select value={selectedPaymentMonth} onValueChange={setSelectedPaymentMonth}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current" className="text-xs">Current Month</SelectItem>
                    {paymentFormData.unpaid_months.slice(0, 3).map((month: any) => (
                      <SelectItem key={month.month_key} value={month.month_key} className="text-xs">
                        {month.month} {month.year} (₹{month.pending.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Security Deposit Info - Compact */}
            {newPayment.payment_type === 'security_deposit' && securityDepositInfo && (
              <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[8px] text-purple-600">Required</p>
                    <p className="text-xs font-bold text-purple-600">₹{securityDepositInfo.security_deposit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-[#004aad]">Paid</p>
                    <p className="text-xs font-bold text-[#004aad]">₹{securityDepositInfo.paid_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-[#ffc107]">Pending</p>
                    <p className="text-xs font-bold text-[#ffc107]">₹{securityDepositInfo.pending_amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Fields - Simplified */}
            {(newPayment.payment_mode === 'bank_transfer' || newPayment.payment_mode === 'online') && (
              <div className="space-y-2">
                <Input
                  placeholder="Transaction ID (optional)"
                  value={newPayment.transaction_id || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, transaction_id: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            )}

            {/* Footer */}
            <DialogFooter className="pt-2">
              <div className="flex justify-end gap-2 w-full">
                <Button variant="outline" size="sm" onClick={() => setShowPaymentDialog(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitPayment}
                  disabled={!newPayment.amount}
                  className="bg-gradient-to-r from-[#004aad] to-[#002a7a] hover:from-[#002a7a] hover:to-[#001a5a] text-white h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Pay Now
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}