// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { 
//   Download, 
//   CreditCard, 
//   IndianRupee, 
//   Calendar, 
//   CheckCircle2, 
//   Clock, 
//   XCircle,
//   Wallet,
//   Landmark,
//   TrendingUp,
//   AlertCircle,
//   Home,
//   Building
// } from "lucide-react";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import * as paymentApi from "@/lib/paymentRecordApi";
// import { Progress } from "@/components/ui/progress";
// import { Skeleton } from "@/components/ui/skeleton";

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

// interface PaymentsTabProps {
//   tenantId: number;
//   isMobile?: boolean;
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

// export default function PaymentsTab({ tenantId, isMobile }: PaymentsTabProps) {
//   const [payments, setPayments] = useState<Payment[]>([]);
//   const [loading, setLoading] = useState(true);
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

//   const [totalTransactions, setTotalTransactions] = useState(0);
//   const [lastPaymentDate, setLastPaymentDate] = useState<string | null>(null);

//   useEffect(() => {
//     if (tenantId) {
//       fetchPayments();
//     }
//   }, [tenantId]);

//   const fetchPayments = async () => {
//     try {
//       setLoading(true);
//       const response = await paymentApi.getPaymentsByTenant(tenantId);
      
//       if (response.success) {
//         const paymentData = response.data || [];
//         setPayments(paymentData);
//         calculateStats(paymentData);
//       }
//     } catch (error) {
//       console.error('Error fetching payments:', error);
//       toast.error('Failed to load payment history');
//     } finally {
//       setLoading(false);
//     }
//   };

// const calculateStats = (payments: Payment[]) => {
//   // Rent stats - initialize all as numbers
//   let rentTotalPaid = 0;
//   let rentTotalPending = 0;
//   let rentApprovedCount = 0;
//   let rentPendingCount = 0;
//   let rentRejectedCount = 0;
//   const monthsPaid = new Set<string>();
//   const monthsPending = new Set<string>();
  
//   // Deposit stats - initialize all as numbers
//   let depositTotalPaid = 0;
//   let depositTotalPending = 0;
//   let depositApprovedCount = 0;
//   let depositPendingCount = 0;
//   let depositRejectedCount = 0;
//   let depositRequiredAmount = 0;
  
//   let lastDate: string | null = null;

//   // First pass: find the maximum deposit amount to determine required amount
//   payments.forEach(payment => {
//     if (payment.payment_type === 'security_deposit') {
//       // Ensure amount is a number
//       const amount = Number(payment.amount) || 0;
//       if (amount > depositRequiredAmount) {
//         depositRequiredAmount = amount;
//       }
//     }
//   });

//   // Second pass: calculate stats
//   payments.forEach(payment => {
//     // Ensure amount is a number
//     const amount = Number(payment.amount) || 0;
    
//     // Track last payment date
//     const paymentDate = payment.payment_date;
//     if (!lastDate || new Date(paymentDate) > new Date(lastDate)) {
//       lastDate = paymentDate;
//     }

//     if (payment.payment_type === 'rent') {
//       const monthKey = `${payment.month || ''}-${payment.year || ''}`;
      
//       if (payment.status === 'approved') {
//         rentTotalPaid += amount;
//         rentApprovedCount++;
//         if (monthKey !== '-') monthsPaid.add(monthKey);
//       } else if (payment.status === 'pending') {
//         rentTotalPending += amount;
//         rentPendingCount++;
//         if (monthKey !== '-') monthsPending.add(monthKey);
//       } else if (payment.status === 'rejected') {
//         rentRejectedCount++;
//       }
//     } else if (payment.payment_type === 'security_deposit') {
//       if (payment.status === 'approved') {
//         depositTotalPaid += amount;
//         depositApprovedCount++;
//       } else if (payment.status === 'pending') {
//         depositTotalPending += amount;
//         depositPendingCount++;
//       } else if (payment.status === 'rejected') {
//         depositRejectedCount++;
//       }
//     }
//   });

//   setRentStats({
//     totalPaid: rentTotalPaid,
//     totalPending: rentTotalPending,
//     approvedCount: rentApprovedCount,
//     pendingCount: rentPendingCount,
//     rejectedCount: rentRejectedCount,
//     monthsPaid,
//     monthsPending
//   });

//   setDepositStats({
//     requiredAmount: depositRequiredAmount,
//     totalPaid: depositTotalPaid,
//     totalPending: depositTotalPending,
//     approvedCount: depositApprovedCount,
//     pendingCount: depositPendingCount,
//     rejectedCount: depositRejectedCount,
//     isFullyPaid: depositTotalPaid >= depositRequiredAmount && depositRequiredAmount > 0
//   });

//   setTotalTransactions(payments.length);
//   setLastPaymentDate(lastDate);
// };
//   const formatCurrency = (amount: number) => {
//   // Ensure amount is a valid number
//   const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0
//   }).format(validAmount);
// };

//   const formatDate = (dateString: string) => {
//     try {
//       return format(new Date(dateString), 'dd MMM yyyy');
//     } catch {
//       return dateString;
//     }
//   };

//   const getStatusBadge = (status: string) => {
//     const variants: Record<string, { className: string; icon: any }> = {
//       approved: { className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
//       pending: { className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
//       rejected: { className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle }
//     };

//     const config = variants[status] || variants.pending;
//     const Icon = config.icon;

//     return (
//       <Badge variant="outline" className={`${config.className} flex items-center gap-1 text-xs px-2 py-1`}>
//         <Icon className="h-3 w-3" />
//         {status === 'approved' ? 'completed' : status}
//       </Badge>
//     );
//   };

//   if (loading) {
//     return (
//       <Card>
//         <CardContent className="py-8">
//           <div className="flex justify-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   // Calculate percentages
//   const rentProgress = rentStats.monthsPaid.size > 0 || rentStats.monthsPending.size > 0
//     ? (rentStats.monthsPaid.size / (rentStats.monthsPaid.size + rentStats.monthsPending.size)) * 100
//     : 0;

//   const depositProgress = depositStats.requiredAmount > 0
//     ? (depositStats.totalPaid / depositStats.requiredAmount) * 100
//     : 0;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h2 className="text-xl font-semibold text-slate-800">Payment Summary</h2>
//         <p className="text-sm text-slate-500 mt-1">
//           {totalTransactions} total transactions • Last payment: {lastPaymentDate ? formatDate(lastPaymentDate) : 'Never'}
//         </p>
//       </div>

//       {/* Rent Summary Card */}
//       <Card className="border border-blue-200 overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
//           <h3 className="text-white font-medium flex items-center gap-2">
//             <Home className="h-4 w-4" />
//             Rent Overview
//           </h3>
//         </div>
//         <CardContent className="p-4">
//           <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mb-4`}>
//             <div>
//   <p className="text-xs text-slate-500">Total Paid</p>
//   <p className="text-xl font-bold text-green-600">{formatCurrency(rentStats.totalPaid)}</p>
//   <p className="text-xs text-slate-400">{rentStats.approvedCount || 0} approved payments</p>
// </div>
// <div>
//   <p className="text-xs text-slate-500">Pending Amount</p>
//   <p className="text-xl font-bold text-amber-600">{formatCurrency(rentStats.totalPending)}</p>
//   <p className="text-xs text-slate-400">{rentStats.pendingCount || 0} pending payments</p>
// </div>
//             <div>
//               <p className="text-xs text-slate-500">Months Covered</p>
//               <p className="text-xl font-bold text-blue-600">{rentStats.monthsPaid.size}</p>
//               <p className="text-xs text-slate-400">months</p>
//             </div>
//             <div>
//               <p className="text-xs text-slate-500">Rejected</p>
//               <p className="text-xl font-bold text-red-600">{rentStats.rejectedCount}</p>
//               <p className="text-xs text-slate-400">payments</p>
//             </div>
//           </div>

//           {/* Rent Progress Bar */}
//           <div className="mt-2">
//             <div className="flex justify-between text-xs text-slate-500 mb-1">
//               <span>Payment Progress</span>
//               <span>{Math.round(rentProgress)}% of months paid</span>
//             </div>
//             <Progress value={rentProgress} className="h-2" />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Security Deposit Summary Card */}
//       <Card className="border border-purple-200 overflow-hidden">
//         <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
//           <h3 className="text-white font-medium flex items-center gap-2">
//             <Wallet className="h-4 w-4" />
//             Security Deposit Overview
//           </h3>
//         </div>
//         <CardContent className="p-4">
//           {depositStats.requiredAmount === 0 ? (
//             <div className="text-center py-4">
//               <p className="text-sm text-slate-500">No security deposit records found</p>
//             </div>
//           ) : (
//             <>
//               <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mb-4`}>
//                 <div>
//   <p className="text-xs text-slate-500">Total Required</p>
//   <p className="text-xl font-bold text-purple-600">{formatCurrency(depositStats.requiredAmount)}</p>
// </div>
// <div>
//   <p className="text-xs text-slate-500">Paid</p>
//   <p className="text-xl font-bold text-green-600">{formatCurrency(depositStats.totalPaid)}</p>
//   <p className="text-xs text-slate-400">{depositStats.approvedCount || 0} payments</p>
// </div>
// <div>
//   <p className="text-xs text-slate-500">Pending</p>
//   <p className="text-xl font-bold text-amber-600">{formatCurrency(depositStats.totalPending)}</p>
//   <p className="text-xs text-slate-400">{depositStats.pendingCount || 0} payments</p>
// </div>
//                 <div>
//                   <p className="text-xs text-slate-500">Status</p>
//                   {depositStats.isFullyPaid ? (
//                     <Badge className="bg-green-100 text-green-700 border-green-200 mt-1">
//                       Fully Paid ✓
//                     </Badge>
//                   ) : (
//                     <Badge className="bg-amber-100 text-amber-700 border-amber-200 mt-1">
//                       {Math.round(depositProgress)}% Paid
//                     </Badge>
//                   )}
//                 </div>
//               </div>

//               {/* Deposit Progress Bar */}
//               <div className="mt-2">
//                 <div className="flex justify-between text-xs text-slate-500 mb-1">
//                   <span>Deposit Progress</span>
//                   <span>{Math.round(depositProgress)}% paid</span>
//                 </div>
//                 <Progress 
//                   value={depositProgress} 
//                   className="h-2 bg-purple-100" 
//                 />
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>

//       {/* Payment History */}
//       <Card>
//         <CardHeader className="pb-2">
//           <CardTitle className="text-base flex items-center gap-2">
//             <CreditCard className="h-4 w-4" />
//             Payment History
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {payments.length === 0 ? (
//             <div className="text-center py-8">
//               <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-3" />
//               <p className="text-slate-500 text-sm">No payment history</p>
//             </div>
//           ) : (
//             <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
//               {payments.map((payment) => (
//                 <div
//                   key={payment.id}
//                   className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg gap-2 hover:bg-slate-100 transition-colors"
//                 >
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 flex-wrap">
//                       <p className="font-medium text-sm text-slate-900">
//                         {payment.remark || (payment.payment_type === 'rent' ? 'Rent Payment' : 'Security Deposit')}
//                       </p>
//                       {payment.payment_type === 'security_deposit' && (
//                         <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">
//                           Deposit
//                         </Badge>
//                       )}
//                     </div>
//                     <div className="flex flex-wrap items-center gap-2 mt-1">
//                       <span className="text-xs text-slate-500">{formatDate(payment.payment_date)}</span>
//                       <span className="text-xs text-slate-400">•</span>
//                       <span className="text-xs text-slate-500 capitalize">{payment.payment_mode}</span>
//                       {payment.month && payment.year && (
//                         <>
//                           <span className="text-xs text-slate-400">•</span>
//                           <span className="text-xs text-slate-500">{payment.month} {payment.year}</span>
//                         </>
//                       )}
//                       {payment.transaction_id && (
//                         <>
//                           <span className="text-xs text-slate-400">•</span>
//                           <span className="text-xs font-mono text-slate-500">
//                             ID: {payment.transaction_id.substring(0, 8)}...
//                           </span>
//                         </>
//                       )}
//                       {payment.bank_name && (
//                         <>
//                           <span className="text-xs text-slate-400">•</span>
//                           <span className="text-xs text-slate-500">{payment.bank_name}</span>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <p className="font-bold text-sm text-slate-900">{formatCurrency(payment.amount)}</p>
//                     <div className="flex items-center gap-2">
//                       {getStatusBadge(payment.status)}
                      
//                       {/* Download receipt for approved payments */}
//                       {payment.status === 'approved' && (
//                         <Button
//                           size="sm"
//                           variant="ghost"
//                           className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"
//                           onClick={() => window.open(`/api/payments/receipts/${payment.id}/download`, '_blank')}
//                           title="Download Receipt"
//                         >
//                           <Download className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Shield,
  Home,
  FileText,
  Receipt,
  TrendingUp,
  Wallet
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import * as paymentApi from "@/lib/paymentRecordApi";

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

interface PaymentsTabProps {
  tenantId: number;
  isMobile?: boolean;
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
    <div className="bg-white rounded-lg border border-slate-200 p-2.5">
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
const PaymentHistoryItem = ({ payment, formatCurrency, formatDate, isMobile }: { 
  payment: Payment; 
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  isMobile?: boolean;
}) => (
  <div className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-all">
    <div className="flex items-start justify-between gap-2">
      {/* Left Section - Icon & Basic Info */}
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
              <span className="capitalize truncate max-w-[60px]">{payment.payment_mode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Amount & Status */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-xs font-bold text-[#004aad]">{formatCurrency(payment.amount)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={payment.status} />
          {payment.status === 'approved' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 text-[#004aad] hover:text-[#004aad] hover:bg-[#e6f0ff] rounded"
            >
              <Download className="h-2.5 w-2.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default function PaymentsTab({ tenantId, isMobile = false }: PaymentsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
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

  const [totalTransactions, setTotalTransactions] = useState(0);
  const [lastPaymentDate, setLastPaymentDate] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'rent' | 'deposit'>('all');

  useEffect(() => {
    if (tenantId) {
      fetchPayments();
    }
  }, [tenantId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentApi.getPaymentsByTenant(tenantId);
      
      if (response.success) {
        const paymentData = response.data || [];
        setPayments(paymentData);
        calculateStats(paymentData);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

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
    
    let lastDate: string | null = null;

    payments.forEach(payment => {
      if (payment.payment_type === 'security_deposit') {
        const amount = Number(payment.amount) || 0;
        if (amount > depositRequiredAmount) {
          depositRequiredAmount = amount;
        }
      }
    });

    payments.forEach(payment => {
      const amount = Number(payment.amount) || 0;
      
      const paymentDate = payment.payment_date;
      if (!lastDate || new Date(paymentDate) > new Date(lastDate)) {
        lastDate = paymentDate;
      }

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

    setTotalTransactions(payments.length);
    setLastPaymentDate(lastDate);
  };

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

  const filteredPayments = payments.filter(payment => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'rent') return payment.payment_type === 'rent';
    if (activeFilter === 'deposit') return payment.payment_type === 'security_deposit';
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-3">
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2`}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
        <div className="h-48 bg-slate-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Payments</h2>
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <FileText className="h-3 w-3 text-[#004aad]" />
            {totalTransactions} transactions
            {lastPaymentDate && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                <Calendar className="h-3 w-3 text-[#ffc107]" />
                {formatDate(lastPaymentDate)}
              </>
            )}
          </p>
        </div>
        <Badge className="bg-[#e6f0ff] text-[#004aad] border-none text-[9px] px-2 py-0.5 rounded-full">
          <Shield className="h-2.5 w-2.5 mr-0.5" />
          Secure
        </Badge>
      </div>

      {/* Compact Stats Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2`}>
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
              Rent Overview
            </h3>
            <Badge className="bg-white/20 text-white border-white/30 text-[8px] px-1.5 py-0 h-4">
              {rentStats.monthsPaid.size} months
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2 mb-3`}>
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
              <span className="font-bold text-[#004aad]">
                {rentStats.monthsPaid.size + rentStats.monthsPending.size > 0
                  ? Math.round((rentStats.monthsPaid.size / (rentStats.monthsPaid.size + rentStats.monthsPending.size)) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#004aad] to-[#ffc107] rounded-full transition-all"
                style={{ 
                  width: `${rentStats.monthsPaid.size + rentStats.monthsPending.size > 0
                    ? (rentStats.monthsPaid.size / (rentStats.monthsPaid.size + rentStats.monthsPending.size)) * 100
                    : 0}%` 
                }}
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
                {depositStats.isFullyPaid ? 'Paid' : `${Math.round((depositStats.totalPaid / depositStats.requiredAmount) * 100)}%`}
              </Badge>
            </div>
          </div>
          <CardContent className="p-3">
            <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-4'} gap-2 mb-3`}>
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
              {!isMobile && (
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
              )}
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="flex justify-between text-[8px] text-slate-600 mb-1">
                <span>Deposit Progress</span>
                <span className="font-bold text-[#ffc107]">
                  {Math.round((depositStats.totalPaid / depositStats.requiredAmount) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#ffc107] to-[#e6b002] rounded-full transition-all"
                  style={{ width: `${(depositStats.totalPaid / depositStats.requiredAmount) * 100}%` }}
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
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter('all')}
                className={`h-6 px-2 text-[9px] rounded-md ${activeFilter === 'all' ? 'bg-white text-[#004aad] shadow-sm' : 'text-slate-600'}`}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter('rent')}
                className={`h-6 px-2 text-[9px] rounded-md ${activeFilter === 'rent' ? 'bg-white text-[#004aad] shadow-sm' : 'text-slate-600'}`}
              >
                Rent
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter('deposit')}
                className={`h-6 px-2 text-[9px] rounded-md ${activeFilter === 'deposit' ? 'bg-white text-[#ffc107] shadow-sm' : 'text-slate-600'}`}
              >
                Deposit
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
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {filteredPayments.map((payment) => (
                <PaymentHistoryItem
                  key={payment.id}
                  payment={payment}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}