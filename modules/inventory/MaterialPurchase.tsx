// import { useEffect, useState, useCallback, useMemo } from 'react';
// import {
//   Package, Plus, Trash2, Search, Loader2, X, Download,
//   Building, IndianRupee, StickyNote, RefreshCw, Filter,
//   AlertTriangle, TrendingDown, Boxes, Eye, DollarSign,
//   Printer, ChevronDown, ChevronUp
// } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
// } from "@/components/ui/dialog";
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent } from "@/components/ui/card";
// import { toast } from "sonner";
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// import {
//   getPurchases,
//   createPurchase,
//   addPayment,
//   deletePurchase,
//   bulkDeletePurchases,
//   getPurchaseStats,
// MaterialPurchase as MaterialPurchaseType,  PurchaseItem,
//   CreatePurchasePayload,
//   AddPaymentPayload
// } from "@/lib/materialPurchaseApi";
// import { listProperties } from "@/lib/propertyApi";

// interface Property {
//   id: string;
//   name: string;
// }

// type PaymentStatus = 'all' | 'Pending' | 'Partial' | 'Paid';

// // Style tokens
// const F = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
// const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";
// const SI = "text-[11px] py-0.5";

// const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
//   <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
//     {icon}{title}
//   </div>
// );

// const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
//   <Card className={`${bg} border-0 shadow-sm`}>
//     <CardContent className="p-2 sm:p-3">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
//           <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
//         </div>
//         <div className={`p-1.5 rounded-lg ${color}`}>
//           <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// );

// export function MaterialPurchase() {
//   const [purchases, setPurchases] = useState<MaterialPurchase[]>([]);
//   const [properties, setProperties] = useState<Property[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [selectedPurchase, setSelectedPurchase] = useState<MaterialPurchase | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const [stats, setStats] = useState({
//     total_purchases: 0,
//     total_amount: 0,
//     total_paid: 0,
//     total_balance: 0,
//     pending_count: 0,
//     partial_count: 0,
//     paid_count: 0
//   });

//   // Filters
//   const [propertyFilter, setPropertyFilter] = useState('all');
//   const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');
//   const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

//   // Column search
//   const [colSearch, setColSearch] = useState({
//     invoice: '', vendor: '', property: '', amount: '', status: ''
//   });

//   // Form state
//   const [formData, setFormData] = useState({
//     purchase_date: new Date().toISOString().split('T')[0],
//     vendor_name: '',
//     vendor_phone: '',
//     invoice_number: '',
//     property_id: '',
//     property_name: '',
//     notes: ''
//   });

//   const [lineItems, setLineItems] = useState<PurchaseItem[]>([{
//     item_name: '',
//     category: '',
//     quantity: 0,
//     unit_price: 0,
//     total_price: 0,
//     notes: ''
//   }]);

//   const [paymentData, setPaymentData] = useState({
//     payment_date: new Date().toISOString().split('T')[0],
//     amount: 0,
//     payment_method: 'Cash',
//     payment_reference: '',
//     paid_by: '',
//     payment_notes: ''
//   });

//   // Selection
//   const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());

//   // Load properties
//   const loadProperties = useCallback(async () => {
//     try {
//       const res = await listProperties({ is_active: true });
//       const list = res?.data?.data || res?.data || (res as any)?.results || [];
//       const arr = Array.isArray(list) ? list : Object.values(list);
//       setProperties(arr.map((p: any) => ({ id: String(p.id), name: p.name })));
//     } catch (err) {
//       console.error('Could not load properties:', err);
//     }
//   }, []);

//   // Load purchases and stats
//   const loadAll = useCallback(async () => {
//     setLoading(true);
//     try {
//       const filters: any = {};
//       if (propertyFilter !== 'all') filters.property_id = propertyFilter;
//       if (statusFilter !== 'all') filters.payment_status = statusFilter;
//       if (dateFilter.from) filters.from_date = dateFilter.from;
//       if (dateFilter.to) filters.to_date = dateFilter.to;

//       const [purchasesRes, statsRes] = await Promise.all([
//         getPurchases(filters),
//         getPurchaseStats()
//       ]);

//       setPurchases(purchasesRes.data || []);
//       setStats(statsRes.data || stats);
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to load purchases');
//     } finally {
//       setLoading(false);
//     }
//   }, [propertyFilter, statusFilter, dateFilter]);

//   useEffect(() => { loadProperties(); }, []);
//   useEffect(() => { loadAll(); }, [loadAll]);

//   // Filtered items with column search
//   const filteredPurchases = useMemo(() => {
//     return purchases.filter(p => {
//       const cs = colSearch;
//       const invOk = !cs.invoice || p.invoice_number?.toLowerCase().includes(cs.invoice.toLowerCase());
//       const venOk = !cs.vendor || p.vendor_name?.toLowerCase().includes(cs.vendor.toLowerCase());
//       const propOk = !cs.property || (p.property_name || '').toLowerCase().includes(cs.property.toLowerCase());
//       const amtOk = !cs.amount || String(p.total_amount).includes(cs.amount);
//       const statOk = !cs.status || p.payment_status?.toLowerCase().includes(cs.status.toLowerCase());
//       return invOk && venOk && propOk && amtOk && statOk;
//     });
//   }, [purchases, colSearch]);

//   // Form calculations
//   const getTotalAmount = () => {
//     return lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
//   };

//   const addLineItem = () => {
//     setLineItems([...lineItems, {
//       item_name: '',
//       category: '',
//       quantity: 0,
//       unit_price: 0,
//       total_price: 0,
//       notes: ''
//     }]);
//   };

//   const removeLineItem = (index: number) => {
//     if (lineItems.length === 1) return;
//     const updated = [...lineItems];
//     updated.splice(index, 1);
//     setLineItems(updated);
//   };

//   const updateLineItem = (index: number, field: keyof PurchaseItem, value: any) => {
//     const updated = [...lineItems];
//     updated[index] = { ...updated[index], [field]: value };

//     if (field === 'quantity' || field === 'unit_price') {
//       updated[index].total_price = (updated[index].quantity || 0) * (updated[index].unit_price || 0);
//     }

//     setLineItems(updated);
//   };

//   // CRUD Operations
//   const openAdd = () => {
//     setFormData({
//       purchase_date: new Date().toISOString().split('T')[0],
//       vendor_name: '',
//       vendor_phone: '',
//       invoice_number: '',
//       property_id: '',
//       property_name: '',
//       notes: ''
//     });
//     setLineItems([{
//       item_name: '',
//       category: '',
//       quantity: 0,
//       unit_price: 0,
//       total_price: 0,
//       notes: ''
//     }]);
//     setShowForm(true);
//   };

//   const handleViewDetails = (purchase: MaterialPurchase) => {
//     setSelectedPurchase(purchase);
//     setShowDetailsModal(true);
//   };

//   const handleAddPayment = (purchase: MaterialPurchase) => {
//     setSelectedPurchase(purchase);
//     const remaining = (purchase.balance_amount || purchase.total_amount) || 0;
//     setPaymentData({
//       payment_date: new Date().toISOString().split('T')[0],
//       amount: remaining,
//       payment_method: 'Cash',
//       payment_reference: '',
//       paid_by: '',
//       payment_notes: ''
//     });
//     setShowPaymentModal(true);
//   };

//   const handleSubmitPurchase = async () => {
//     if (!formData.vendor_name || !formData.invoice_number || !formData.property_id) {
//       toast.error('Vendor name, invoice number, and property are required');
//       return;
//     }

//     if (lineItems.length === 0 || lineItems.some(item => !item.item_name || item.quantity <= 0)) {
//       toast.error('Please add at least one valid item');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const totalAmount = getTotalAmount();
//       const itemsSummary = lineItems.map(item => `${item.item_name} (${item.quantity})`).join(', ');

//       const selectedProperty = properties.find(p => p.id === formData.property_id);

//       const payload: CreatePurchasePayload = {
//         purchase_date: formData.purchase_date,
//         vendor_name: formData.vendor_name,
//         vendor_phone: formData.vendor_phone,
//         invoice_number: formData.invoice_number,
//         property_id: parseInt(formData.property_id),
//         property_name: selectedProperty?.name || formData.property_name,
//         notes: formData.notes,
//         items: lineItems,
//         items_summary: itemsSummary,
//         total_amount: totalAmount,
//         paid_amount: 0
//       };

//       await createPurchase(payload);
//       setShowForm(false);
//       await loadAll();
//       toast.success('Purchase created successfully');
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to create purchase');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleSubmitPayment = async () => {
//     if (!selectedPurchase) return;

//     const remaining = (selectedPurchase.balance_amount || selectedPurchase.total_amount) || 0;
//     if (paymentData.amount > remaining) {
//       toast.error(`Payment amount cannot exceed remaining balance: ₹${remaining.toLocaleString('en-IN')}`);
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const payload: AddPaymentPayload = {
//         payment_date: paymentData.payment_date,
//         amount: paymentData.amount,
//         payment_method: paymentData.payment_method,
//         paid_by: paymentData.paid_by,
//         payment_reference: paymentData.payment_reference,
//         payment_notes: paymentData.payment_notes
//       };

//       await addPayment(selectedPurchase.id, payload);
//       setShowPaymentModal(false);
//       await loadAll();
//       toast.success(`Payment of ₹${paymentData.amount.toLocaleString('en-IN')} added successfully`);
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to add payment');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (id: string | number) => {
//     if (!confirm('Delete this purchase?')) return;
//     try {
//       await deletePurchase(id);
//       await loadAll();
//       toast.success('Purchase deleted');
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to delete');
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedItems.size === 0) return;
//     if (!confirm(`Delete ${selectedItems.size} selected purchase(s)?`)) return;

//     try {
//       await bulkDeletePurchases(Array.from(selectedItems));
//       setSelectedItems(new Set());
//       await loadAll();
//       toast.success(`${selectedItems.size} purchase(s) deleted`);
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to delete purchases');
//     }
//   };

//   const toggleSelectAll = () => {
//     if (selectedItems.size === filteredPurchases.length) {
//       setSelectedItems(new Set());
//     } else {
//       setSelectedItems(new Set(filteredPurchases.map(p => p.id)));
//     }
//   };

//   const toggleSelectItem = (id: string | number) => {
//     const newSelected = new Set(selectedItems);
//     if (newSelected.has(id)) {
//       newSelected.delete(id);
//     } else {
//       newSelected.add(id);
//     }
//     setSelectedItems(newSelected);
//   };

//   // Export CSV
//   const handleExport = () => {
//     const headers = ['Date', 'Invoice #', 'Vendor', 'Property', 'Total Amount', 'Paid', 'Balance', 'Status'];
//     const rows = filteredPurchases.map(p => [
//       new Date(p.purchase_date).toLocaleDateString('en-IN'),
//       p.invoice_number,
//       p.vendor_name,
//       p.property_name,
//       p.total_amount,
//       p.paid_amount || 0,
//       p.balance_amount || p.total_amount,
//       p.payment_status
//     ]);

//     const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `purchases_${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//   };

//   // PDF Download
//   const handleDownloadPDF = (purchase: MaterialPurchase) => {
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.width;

//     // Header
//     doc.setFillColor(16, 185, 129);
//     doc.rect(0, 0, pageWidth, 35, 'F');

//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(24);
//     doc.setFont('helvetica', 'bold');
//     doc.text('MATERIAL PURCHASE', pageWidth / 2, 15, { align: 'center' });

//     doc.setFontSize(11);
//     doc.setFont('helvetica', 'normal');
//     doc.text('Purchase Order Details', pageWidth / 2, 25, { align: 'center' });

//     let yPos = 45;

//     // Purchase Info
//     doc.setFillColor(243, 244, 246);
//     doc.roundedRect(14, yPos, pageWidth - 28, 40, 2, 2, 'F');

//     doc.setTextColor(0, 0, 0);
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'bold');

//     doc.text('Invoice:', 18, yPos + 8);
//     doc.setFont('helvetica', 'normal');
//     doc.text(purchase.invoice_number, 45, yPos + 8);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Date:', 120, yPos + 8);
//     doc.setFont('helvetica', 'normal');
//     doc.text(new Date(purchase.purchase_date).toLocaleDateString('en-IN'), 140, yPos + 8);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Vendor:', 18, yPos + 18);
//     doc.setFont('helvetica', 'normal');
//     doc.text(purchase.vendor_name, 45, yPos + 18);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Property:', 120, yPos + 18);
//     doc.setFont('helvetica', 'normal');
//     doc.text(purchase.property_name, 160, yPos + 18);

//     yPos += 50;

//     // Items Table
//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(31, 41, 55);
//     doc.text('Purchase Items', 14, yPos);
//     yPos += 5;

//     const itemsData = purchase.purchase_items?.map(item => [
//       item.item_name,
//       item.category,
//       item.quantity.toString(),
//       `₹${item.unit_price.toLocaleString('en-IN')}`,
//       `₹${item.total_price.toLocaleString('en-IN')}`
//     ]) || [];

//     autoTable(doc, {
//       startY: yPos,
//       head: [['Item Name', 'Category', 'Qty', 'Unit Price', 'Total']],
//       body: itemsData,
//       foot: [['', '', '', 'Total Amount:', `₹${purchase.total_amount.toLocaleString('en-IN')}`]],
//       theme: 'grid',
//       headStyles: { fillColor: [59, 130, 246], fontSize: 10 },
//       footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontSize: 11, fontStyle: 'bold' }
//     });

//     // Payment Summary
//     yPos = (doc as any).lastAutoTable.finalY + 15;

//     doc.setFillColor(239, 246, 255);
//     doc.roundedRect(14, yPos, pageWidth - 28, 25, 2, 2, 'F');

//     doc.setFontSize(10);
//     doc.setTextColor(55, 65, 81);
//     doc.text('Total:', 20, yPos + 8);
//     doc.text(`₹${purchase.total_amount.toLocaleString('en-IN')}`, 60, yPos + 8);

//     doc.setTextColor(16, 185, 129);
//     doc.text('Paid:', 20, yPos + 16);
//     doc.text(`₹${(purchase.paid_amount || 0).toLocaleString('en-IN')}`, 60, yPos + 16);

//     doc.setTextColor(239, 68, 68);
//     doc.text('Balance:', 120, yPos + 12);
//     doc.setFontSize(12);
//     doc.text(`₹${(purchase.balance_amount || purchase.total_amount).toLocaleString('en-IN')}`, 160, yPos + 12);

//     doc.save(`Purchase_${purchase.invoice_number}.pdf`);
//   };

//   // Status badge
//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'Paid':
//         return <Badge className="bg-green-100 text-green-700 text-[9px] px-1.5">Paid</Badge>;
//       case 'Partial':
//         return <Badge className="bg-orange-100 text-orange-700 text-[9px] px-1.5">Partial</Badge>;
//       default:
//         return <Badge className="bg-red-100 text-red-700 text-[9px] px-1.5">Pending</Badge>;
//     }
//   };

//   const hasColSearch = Object.values(colSearch).some(v => v !== '');
//   const hasFilters = propertyFilter !== 'all' || statusFilter !== 'all' || dateFilter.from || dateFilter.to;
//   const activeFilterCount = [
//     propertyFilter !== 'all',
//     statusFilter !== 'all',
//     !!dateFilter.from,
//     !!dateFilter.to
//   ].filter(Boolean).length;

//   const clearFilters = () => {
//     setPropertyFilter('all');
//     setStatusFilter('all');
//     setDateFilter({ from: '', to: '' });
//   };

//   const clearColSearch = () => setColSearch({
//     invoice: '', vendor: '', property: '', amount: '', status: ''
//   });

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="sticky top-0 z-20">
//         <div className="px-3 sm:px-5 pt-3 pb-2 flex items-end justify-end gap-2">
//           <div className="flex items-end justify-end gap-1.5 flex-shrink-0">
//             {/* Filter Button */}
//             <button
//               onClick={() => setSidebarOpen(o => !o)}
//               className={`
//                 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
//                 ${sidebarOpen || hasFilters
//                   ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
//                   : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
//               `}
//             >
//               <Filter className="h-3.5 w-3.5 flex-shrink-0" />
//               <span className="hidden sm:inline">Filters</span>
//               {activeFilterCount > 0 && (
//                 <span className={`
//                   h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0
//                   ${sidebarOpen || hasFilters ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}
//                 `}>
//                   {activeFilterCount}
//                 </span>
//               )}
//             </button>

//             {/* Export */}
//             <button
//               onClick={handleExport}
//               className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium transition-colors"
//             >
//               <Download className="h-3.5 w-3.5 flex-shrink-0" />
//               <span className="hidden sm:inline">Export</span>
//             </button>

//             {/* Refresh */}
//             <button
//               onClick={loadAll}
//               disabled={loading}
//               className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
//             >
//               <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
//             </button>

//             {/* Add Purchase */}
//             <button
//               onClick={openAdd}
//               className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm transition-colors"
//             >
//               <Plus className="h-3.5 w-3.5 flex-shrink-0" />
//               <span className="hidden xs:inline sm:inline">Add Purchase</span>
//             </button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="px-3 sm:px-5 pb-3">
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
//             <StatCard title="Total Purchases" value={stats.total_purchases}
//               icon={Boxes} color="bg-blue-600" bg="bg-gradient-to-br from-blue-50 to-blue-100" />
//             <StatCard title="Total Amount" value={`₹${Number(stats.total_amount || 0).toLocaleString('en-IN')}`}
//               icon={IndianRupee} color="bg-green-600" bg="bg-gradient-to-br from-green-50 to-green-100" />
//             <StatCard title="Total Paid" value={`₹${Number(stats.total_paid || 0).toLocaleString('en-IN')}`}
//               icon={TrendingDown} color="bg-orange-600" bg="bg-gradient-to-br from-orange-50 to-orange-100" />
//             <StatCard title="Balance Due" value={`₹${Number(stats.total_balance || 0).toLocaleString('en-IN')}`}
//               icon={AlertTriangle} color="bg-red-600" bg="bg-gradient-to-br from-red-50 to-red-100" />
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="relative">
//         <main className="p-3 sm:p-4">
//           <Card className="border rounded-lg shadow-sm">
//             <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
//               <span className="text-sm font-semibold text-gray-700">
//                 All Purchases ({filteredPurchases.length})
//               </span>
//               {hasColSearch && (
//                 <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold">
//                   Clear Search
//                 </button>
//               )}
//             </div>

//             {/* Bulk Actions */}
//             {selectedItems.size > 0 && (
//               <div className="p-3 bg-blue-50 border-b flex items-center justify-between">
//                 <span className="text-sm font-semibold text-blue-900">
//                   {selectedItems.size} item(s) selected
//                 </span>
//                 <button
//                   onClick={handleBulkDelete}
//                   className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
//                 >
//                   <Trash2 className="h-3.5 w-3.5" />
//                   Delete Selected
//                 </button>
//               </div>
//             )}

//             <div className="overflow-auto max-h-[calc(100vh-320px)]">
//               <div className="min-w-[1000px]">
//                 <Table>
//                   <TableHeader className="sticky top-0 z-10 bg-gray-50">
//                     {/* Main Headers */}
//                     <TableRow>
//                       <TableHead className="py-2 px-3 w-8">
//                         <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded">
//                           {selectedItems.size === filteredPurchases.length && filteredPurchases.length > 0 ?
//                             <span className="text-blue-600">✓</span> :
//                             <span className="text-gray-400">□</span>
//                           }
//                         </button>
//                       </TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Date</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Invoice #</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Vendor</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Property</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Total</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Paid</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Balance</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Status</TableHead>
//                       <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
//                     </TableRow>

//                     {/* Column Search */}
//                     <TableRow className="bg-gray-50/80">
//                       <TableCell className="py-1 px-2"></TableCell>
//                       {[
//                         { key: null, ph: '' },
//                         { key: 'invoice', ph: 'Search invoice…' },
//                         { key: 'vendor', ph: 'Search vendor…' },
//                         { key: 'property', ph: 'Search property…' },
//                         { key: 'amount', ph: 'Amount…' },
//                         { key: null, ph: '' },
//                         { key: null, ph: '' },
//                         { key: null, ph: '' },
//                         { key: 'status', ph: 'Status…' },
//                       ].map((col, idx) => (
//                         <TableCell key={idx} className="py-1 px-2">
//                           {col.key ? (
//                             <Input placeholder={col.ph}
//                               value={colSearch[col.key as keyof typeof colSearch]}
//                               onChange={e => setColSearch(prev => ({ ...prev, [col.key!]: e.target.value }))}
//                               className="h-6 text-[10px]"
//                             />
//                           ) : <div />}
//                         </TableCell>
//                       ))}
//                       <TableCell className="py-1 px-2" />
//                     </TableRow>
//                   </TableHeader>

//                   <TableBody>
//                     {loading ? (
//                       <TableRow>
//                         <TableCell colSpan={11} className="text-center py-12">
//                           <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
//                           <p className="text-xs text-gray-500">Loading purchases…</p>
//                         </TableCell>
//                       </TableRow>
//                     ) : filteredPurchases.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={11} className="text-center py-12">
//                           <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
//                           <p className="text-sm font-medium text-gray-500">No purchases found</p>
//                           <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
//                         </TableCell>
//                       </TableRow>
//                     ) : filteredPurchases.map(purchase => (
//                       <TableRow key={purchase.id} className="hover:bg-gray-50">
//                         <TableCell className="py-2 px-3">
//                           <button onClick={() => toggleSelectItem(purchase.id)} className="p-1 hover:bg-gray-200 rounded">
//                             {selectedItems.has(purchase.id) ?
//                               <span className="text-blue-600">✓</span> :
//                               <span className="text-gray-400">□</span>
//                             }
//                           </button>
//                         </TableCell>
//                         <TableCell className="py-2 px-3 text-xs">
//                           {new Date(purchase.purchase_date).toLocaleDateString('en-IN')}
//                         </TableCell>
//                         <TableCell className="py-2 px-3 text-xs font-medium">
//                           {purchase.invoice_number}
//                         </TableCell>
//                         <TableCell className="py-2 px-3 text-xs">
//                           {purchase.vendor_name}
//                           {purchase.vendor_phone && (
//                             <div className="text-[9px] text-gray-500">{purchase.vendor_phone}</div>
//                           )}
//                         </TableCell>
//                         <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[150px] truncate">
//                           {purchase.property_name}
//                         </TableCell>
//                         <TableCell className="py-2 px-3 text-xs font-semibold">
//                           ₹{purchase.total_amount.toLocaleString('en-IN')}
//                         </TableCell>
//                         <TableCell className="py-2 px-3 text-xs text-green-600">
//                           ₹{(purchase.paid_amount || 0).toLocaleString('en-IN')}
//                         </TableCell>
//                         <TableCell className="py-2 px-3 text-xs font-semibold text-red-600">
//                           ₹{(purchase.balance_amount || purchase.total_amount).toLocaleString('en-IN')}
//                         </TableCell>
//                         <TableCell className="py-2 px-3">
//                           {getStatusBadge(purchase.payment_status)}
//                         </TableCell>
//                         <TableCell className="py-2 px-3">
//                           <div className="flex justify-end gap-1">
//                             <Button size="sm" variant="ghost"
//                               className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
//                               onClick={() => handleViewDetails(purchase)} title="View Details">
//                               <Eye className="h-3.5 w-3.5" />
//                             </Button>
//                             {purchase.payment_status !== 'Paid' && (
//                               <Button size="sm" variant="ghost"
//                                 className="h-6 w-6 p-0 hover:bg-green-50 hover:text-green-600"
//                                 onClick={() => handleAddPayment(purchase)} title="Add Payment">
//                                 <DollarSign className="h-3.5 w-3.5" />
//                               </Button>
//                             )}
//                             <Button size="sm" variant="ghost"
//                               className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
//                               onClick={() => handleDelete(purchase.id)} title="Delete">
//                               <Trash2 className="h-3.5 w-3.5" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>
//           </Card>
//         </main>

//         {/* Filter Sidebar */}
//         {sidebarOpen && (
//           <>
//             <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
//             <aside className="fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out">
//               <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
//                 <div className="flex items-center gap-2">
//                   <Filter className="h-4 w-4 text-white" />
//                   <span className="text-sm font-semibold text-white">Filters</span>
//                   {hasFilters && (
//                     <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">
//                       {activeFilterCount} active
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-2">
//                   {hasFilters && (
//                     <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">
//                       Clear all
//                     </button>
//                   )}
//                   <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
//                     <X className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>

//               <div className="flex-1 overflow-y-auto p-4 space-y-5">
//                 {/* Property Filter */}
//                 <div>
//                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
//                     <Building className="h-3 w-3 text-indigo-500" /> Property
//                   </p>
//                   <div className="space-y-1">
//                     <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${propertyFilter === 'all' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
//                       <input type="radio" name="property" value="all"
//                         checked={propertyFilter === 'all'}
//                         onChange={() => setPropertyFilter('all')}
//                         className="sr-only"
//                       />
//                       <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === 'all' ? 'bg-blue-500' : 'bg-gray-300'}`} />
//                       <span className="text-[12px] font-medium">All Properties</span>
//                     </label>
//                     {properties.map(p => (
//                       <label key={p.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${propertyFilter === p.id ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
//                         <input type="radio" name="property" value={p.id}
//                           checked={propertyFilter === p.id}
//                           onChange={() => setPropertyFilter(p.id)}
//                           className="sr-only"
//                         />
//                         <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === p.id ? 'bg-blue-500' : 'bg-gray-300'}`} />
//                         <span className="text-[12px] font-medium truncate">{p.name}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-100" />

//                 {/* Status Filter */}
//                 <div>
//                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
//                     <TrendingDown className="h-3 w-3 text-orange-500" /> Payment Status
//                   </p>
//                   <div className="space-y-1">
//                     {[
//                       { val: 'all', label: 'All Status', dot: 'bg-gray-400' },
//                       { val: 'Pending', label: 'Pending', dot: 'bg-red-500' },
//                       { val: 'Partial', label: 'Partial', dot: 'bg-orange-500' },
//                       { val: 'Paid', label: 'Paid', dot: 'bg-green-500' },
//                     ].map(opt => (
//                       <label key={opt.val} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${statusFilter === opt.val ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
//                         <input type="radio" name="status" value={opt.val}
//                           checked={statusFilter === opt.val}
//                           onChange={() => setStatusFilter(opt.val as PaymentStatus)}
//                           className="sr-only"
//                         />
//                         <span className={`h-2 w-2 rounded-full flex-shrink-0 ${opt.dot}`} />
//                         <span className="text-[12px] font-medium">{opt.label}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-100" />

//                 {/* Date Range */}
//                 <div>
//                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Date Range</p>
//                   <div className="space-y-2">
//                     <div>
//                       <label className="text-[10px] text-gray-500 mb-1 block">From</label>
//                       <Input type="date" value={dateFilter.from}
//                         onChange={e => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
//                         className="h-7 text-[10px]" />
//                     </div>
//                     <div>
//                       <label className="text-[10px] text-gray-500 mb-1 block">To</label>
//                       <Input type="date" value={dateFilter.to}
//                         onChange={e => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
//                         className="h-7 text-[10px]" />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
//                 <button onClick={clearFilters} disabled={!hasFilters}
//                   className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40">
//                   Clear All
//                 </button>
//                 <button onClick={() => setSidebarOpen(false)}
//                   className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-indigo-700">
//                   Apply & Close
//                 </button>
//               </div>
//             </aside>
//           </>
//         )}
//       </div>

//       {/* Add Purchase Dialog */}
//       <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
//         <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
//           <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
//             <div>
//               <h2 className="text-base font-semibold">New Material Purchase</h2>
//               <p className="text-xs text-blue-100">Fill in the purchase details</p>
//             </div>
//             <DialogClose asChild>
//               <button className="p-1.5 rounded-full hover:bg-white/20 transition">
//                 <X className="h-4 w-4" />
//               </button>
//             </DialogClose>
//           </div>

//           <div className="p-4 overflow-y-auto max-h-[75vh] space-y-5">
//             {/* Basic Info */}
//             <div>
//               <SH icon={<Package className="h-3 w-3" />} title="Purchase Info" />
//               <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
//                 <div>
//                   <label className={L}>Purchase Date <span className="text-red-400">*</span></label>
//                   <Input type="date" className={F}
//                     value={formData.purchase_date}
//                     onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} />
//                 </div>
//                 <div>
//                   <label className={L}>Invoice Number <span className="text-red-400">*</span></label>
//                   <Input className={F} placeholder="INV-001"
//                     value={formData.invoice_number}
//                     onChange={e => setFormData({ ...formData, invoice_number: e.target.value })} />
//                 </div>
//                 <div>
//                   <label className={L}>Vendor Name <span className="text-red-400">*</span></label>
//                   <Input className={F} placeholder="Vendor name"
//                     value={formData.vendor_name}
//                     onChange={e => setFormData({ ...formData, vendor_name: e.target.value })} />
//                 </div>
//                 <div>
//                   <label className={L}>Vendor Phone</label>
//                   <Input className={F} placeholder="Phone number"
//                     value={formData.vendor_phone}
//                     onChange={e => setFormData({ ...formData, vendor_phone: e.target.value })} />
//                 </div>
//                 <div className="col-span-2">
//                   <label className={L}>Property <span className="text-red-400">*</span></label>
//                   <Select value={formData.property_id}
//                     onValueChange={v => {
//                       const selected = properties.find(p => p.id === v);
//                       setFormData(p => ({ ...p, property_id: v, property_name: selected?.name || '' }));
//                     }}>
//                     <SelectTrigger className={F}>
//                       <Building className="h-3 w-3 text-gray-400 mr-1.5" />
//                       <SelectValue placeholder="Select property" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {properties.map(p => (
//                         <SelectItem key={p.id} value={p.id} className={SI}>{p.name}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </div>

//             {/* Line Items */}
//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <SH icon={<Boxes className="h-3 w-3" />} title="Purchase Items" />
//                 <Button type="button" size="sm" variant="outline"
//                   onClick={addLineItem}
//                   className="h-7 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-50">
//                   <Plus className="h-3 w-3 mr-1" /> Add Item
//                 </Button>
//               </div>

//               <div className="space-y-2">
//                 {lineItems.map((item, index) => (
//                   <div key={index} className="grid grid-cols-12 gap-2 p-2 bg-gray-50 rounded-lg">
//                     <div className="col-span-3">
//                       <Input placeholder="Item name *"
//                         value={item.item_name}
//                         onChange={e => updateLineItem(index, 'item_name', e.target.value)}
//                         className="h-7 text-[10px]" />
//                     </div>
//                     <div className="col-span-2">
//                       <Input placeholder="Category *"
//                         value={item.category}
//                         onChange={e => updateLineItem(index, 'category', e.target.value)}
//                         className="h-7 text-[10px]" />
//                     </div>
//                     <div className="col-span-1">
//                       <Input type="number" min="1" placeholder="Qty"
//                         value={item.quantity || ''}
//                         onChange={e => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
//                         className="h-7 text-[10px]" />
//                     </div>
//                     <div className="col-span-2">
//                       <Input type="number" min="0" step="0.01" placeholder="Price"
//                         value={item.unit_price || ''}
//                         onChange={e => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
//                         className="h-7 text-[10px]" />
//                     </div>
//                     <div className="col-span-2">
//                       <div className="h-7 px-2 bg-blue-100 rounded-md flex items-center text-[10px] font-semibold text-blue-700">
//                         ₹{(item.total_price || 0).toLocaleString('en-IN')}
//                       </div>
//                     </div>
//                     <div className="col-span-1">
//                       <button onClick={() => removeLineItem(index)}
//                         disabled={lineItems.length === 1}
//                         className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-100 disabled:opacity-30">
//                         <Trash2 className="h-3 w-3 text-red-600" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-3 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
//                 <span className="text-xs font-semibold text-gray-700">Total Amount:</span>
//                 <span className="text-lg font-bold text-blue-600">
//                   ₹{getTotalAmount().toLocaleString('en-IN')}
//                 </span>
//               </div>
//             </div>

//             {/* Notes */}
//             <div>
//               <SH icon={<StickyNote className="h-3 w-3" />} title="Notes" color="text-amber-600" />
//               <Textarea
//                 className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white min-h-[56px]"
//                 placeholder="Additional notes..."
//                 rows={2}
//                 value={formData.notes}
//                 onChange={e => setFormData({ ...formData, notes: e.target.value })}
//               />
//             </div>

//             <Button
//               disabled={submitting}
//               onClick={handleSubmitPurchase}
//               className="w-full h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
//             >
//               {submitting ? (
//                 <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Creating…</>
//               ) : 'Create Purchase'}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Payment Dialog */}
//       <Dialog open={showPaymentModal} onOpenChange={v => { if (!v) setShowPaymentModal(false); }}>
//         <DialogContent className="max-w-md w-[95vw] p-0">
//           <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
//             <div>
//               <h2 className="text-base font-semibold">Add Payment</h2>
//               <p className="text-xs text-green-100">Record payment for purchase</p>
//             </div>
//             <DialogClose asChild>
//               <button className="p-1.5 rounded-full hover:bg-white/20 transition">
//                 <X className="h-4 w-4" />
//               </button>
//             </DialogClose>
//           </div>

//           <div className="p-4 space-y-4">
//             {selectedPurchase && (
//               <div className="p-3 bg-gray-50 rounded-lg space-y-1">
//                 <div className="text-xs flex justify-between">
//                   <span className="text-gray-600">Invoice:</span>
//                   <span className="font-semibold">{selectedPurchase.invoice_number}</span>
//                 </div>
//                 <div className="text-xs flex justify-between">
//                   <span className="text-gray-600">Vendor:</span>
//                   <span className="font-semibold">{selectedPurchase.vendor_name}</span>
//                 </div>
//                 <div className="text-xs flex justify-between">
//                   <span className="text-gray-600">Balance Due:</span>
//                   <span className="font-semibold text-red-600">
//                     ₹{(selectedPurchase.balance_amount || selectedPurchase.total_amount).toLocaleString('en-IN')}
//                   </span>
//                 </div>
//               </div>
//             )}

//             <div>
//               <label className={L}>Payment Date *</label>
//               <Input type="date" className={F}
//                 value={paymentData.payment_date}
//                 onChange={e => setPaymentData({ ...paymentData, payment_date: e.target.value })} />
//             </div>

//             <div>
//               <label className={L}>Amount (₹) *</label>
//               <Input type="number" min="0" step="0.01" className={F}
//                 value={paymentData.amount}
//                 onChange={e => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })} />
//             </div>

//             <div>
//               <label className={L}>Payment Method *</label>
//               <Select value={paymentData.payment_method}
//                 onValueChange={v => setPaymentData({ ...paymentData, payment_method: v })}>
//                 <SelectTrigger className={F}>
//                   <SelectValue placeholder="Select method" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Cash" className={SI}>Cash</SelectItem>
//                   <SelectItem value="UPI" className={SI}>UPI</SelectItem>
//                   <SelectItem value="Bank Transfer" className={SI}>Bank Transfer</SelectItem>
//                   <SelectItem value="Cheque" className={SI}>Cheque</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <label className={L}>Paid By *</label>
//               <Input className={F} placeholder="Person name"
//                 value={paymentData.paid_by}
//                 onChange={e => setPaymentData({ ...paymentData, paid_by: e.target.value })} />
//             </div>

//             <div>
//               <label className={L}>Reference (optional)</label>
//               <Input className={F} placeholder="Transaction ID / Cheque no."
//                 value={paymentData.payment_reference}
//                 onChange={e => setPaymentData({ ...paymentData, payment_reference: e.target.value })} />
//             </div>

//             <div>
//               <label className={L}>Notes</label>
//               <Textarea className="text-[11px] min-h-[56px]"
//                 placeholder="Payment notes..."
//                 rows={2}
//                 value={paymentData.payment_notes}
//                 onChange={e => setPaymentData({ ...paymentData, payment_notes: e.target.value })} />
//             </div>

//             <Button
//               disabled={submitting}
//               onClick={handleSubmitPayment}
//               className="w-full h-8 text-[11px] font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
//             >
//               {submitting ? (
//                 <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Adding Payment…</>
//               ) : 'Add Payment'}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Details Dialog */}
//       <Dialog open={showDetailsModal} onOpenChange={v => { if (!v) setShowDetailsModal(false); }}>
//         <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
//           <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
//             <div>
//               <h2 className="text-base font-semibold">Purchase Details</h2>
//               <p className="text-xs text-emerald-100">View complete purchase information</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <button onClick={() => selectedPurchase && handleDownloadPDF(selectedPurchase)}
//                 className="p-1.5 rounded-full hover:bg-white/20 transition" title="Download PDF">
//                 <Download className="h-4 w-4" />
//               </button>
//               <DialogClose asChild>
//                 <button className="p-1.5 rounded-full hover:bg-white/20 transition">
//                   <X className="h-4 w-4" />
//                 </button>
//               </DialogClose>
//             </div>
//           </div>

//           {selectedPurchase && (
//             <div className="p-4 overflow-y-auto max-h-[75vh] space-y-5">
//               {/* Purchase Info */}
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-[10px] text-gray-500">Invoice Number</p>
//                     <p className="text-sm font-bold">{selectedPurchase.invoice_number}</p>
//                   </div>
//                   <div>
//                     <p className="text-[10px] text-gray-500">Purchase Date</p>
//                     <p className="text-sm font-bold">
//                       {new Date(selectedPurchase.purchase_date).toLocaleDateString('en-IN')}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[10px] text-gray-500">Vendor</p>
//                     <p className="text-sm font-bold">{selectedPurchase.vendor_name}</p>
//                     {selectedPurchase.vendor_phone && (
//                       <p className="text-[10px] text-gray-600">{selectedPurchase.vendor_phone}</p>
//                     )}
//                   </div>
//                   <div>
//                     <p className="text-[10px] text-gray-500">Property</p>
//                     <p className="text-sm font-bold">{selectedPurchase.property_name}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Items Table */}
//               <div>
//                 <h3 className="text-xs font-bold text-gray-700 mb-2">Purchase Items</h3>
//                 <div className="border rounded-lg overflow-hidden">
//                   <table className="w-full text-xs">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-3 py-2 text-left">Item Name</th>
//                         <th className="px-3 py-2 text-left">Category</th>
//                         <th className="px-3 py-2 text-center">Qty</th>
//                         <th className="px-3 py-2 text-right">Unit Price</th>
//                         <th className="px-3 py-2 text-right">Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedPurchase.purchase_items?.map((item, idx) => (
//                         <tr key={idx} className="border-t">
//                           <td className="px-3 py-2 font-medium">{item.item_name}</td>
//                           <td className="px-3 py-2">{item.category}</td>
//                           <td className="px-3 py-2 text-center">{item.quantity}</td>
//                           <td className="px-3 py-2 text-right">₹{item.unit_price.toLocaleString('en-IN')}</td>
//                           <td className="px-3 py-2 text-right font-semibold">₹{item.total_price.toLocaleString('en-IN')}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                     <tfoot className="bg-gray-50">
//                       <tr>
//                         <td colSpan={4} className="px-3 py-2 text-right font-bold">Total:</td>
//                         <td className="px-3 py-2 text-right font-bold text-blue-600">
//                           ₹{selectedPurchase.total_amount.toLocaleString('en-IN')}
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               </div>

//               {/* Payment Summary */}
//               <div className="grid grid-cols-3 gap-3">
//                 <div className="bg-blue-50 p-3 rounded-lg text-center">
//                   <p className="text-[10px] text-gray-600">Total Amount</p>
//                   <p className="text-base font-bold">₹{selectedPurchase.total_amount.toLocaleString('en-IN')}</p>
//                 </div>
//                 <div className="bg-green-50 p-3 rounded-lg text-center">
//                   <p className="text-[10px] text-gray-600">Paid Amount</p>
//                   <p className="text-base font-bold text-green-600">
//                     ₹{(selectedPurchase.paid_amount || 0).toLocaleString('en-IN')}
//                   </p>
//                 </div>
//                 <div className="bg-red-50 p-3 rounded-lg text-center">
//                   <p className="text-[10px] text-gray-600">Balance Due</p>
//                   <p className="text-base font-bold text-red-600">
//                     ₹{(selectedPurchase.balance_amount || selectedPurchase.total_amount).toLocaleString('en-IN')}
//                   </p>
//                 </div>
//               </div>

//               {/* Payment Method Info */}
//               {selectedPurchase.payment_method && (
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-[10px] text-gray-500 mb-1">Payment Information</p>
//                   <div className="grid grid-cols-2 gap-2 text-xs">
//                     <div>
//                       <span className="text-gray-600">Method:</span>
//                       <span className="ml-2 font-semibold">{selectedPurchase.payment_method}</span>
//                     </div>
//                     {selectedPurchase.paid_by && (
//                       <div>
//                         <span className="text-gray-600">Paid By:</span>
//                         <span className="ml-2 font-semibold">{selectedPurchase.paid_by}</span>
//                       </div>
//                     )}
//                     {selectedPurchase.payment_reference && (
//                       <div className="col-span-2">
//                         <span className="text-gray-600">Reference:</span>
//                         <span className="ml-2 font-semibold">{selectedPurchase.payment_reference}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Notes */}
//               {selectedPurchase.notes && (
//                 <div className="bg-amber-50 p-3 rounded-lg">
//                   <p className="text-[10px] text-gray-500 mb-1">Notes</p>
//                   <p className="text-xs">{selectedPurchase.notes}</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// import { useEffect, useState, useCallback, useMemo } from 'react';
// import {
//   Package, Plus, Trash2, Loader2, X, Download,
//   Building, IndianRupee, StickyNote, RefreshCw, Filter,
//   AlertTriangle, TrendingDown, Boxes, Eye, DollarSign
// } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog, DialogContent, DialogClose,
// } from "@/components/ui/dialog";
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent } from "@/components/ui/card";
// import { toast } from "sonner";
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// import {
//   getPurchases,
//   createPurchase,
//   addPayment,
//   deletePurchase,
//   bulkDeletePurchases,
//   getPurchaseStats,
//   MaterialPurchase as MaterialPurchaseType,
//   PurchaseItem,
//   CreatePurchasePayload,
//   AddPaymentPayload
// } from "@/lib/materialPurchaseApi";
// import { listProperties } from "@/lib/propertyApi";
// import { getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
// import Swal from 'sweetalert2';

// interface Property {
//   id: string;
//   name: string;
// }

// interface MasterCategory {
//   id: string;
//   name: string;
// }

// type PaymentStatus = 'all' | 'Pending' | 'Partial' | 'Paid';

// // Style tokens
// const F = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
// const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";
// const SI = "text-[11px] py-0.5";

// const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
//   <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
//     {icon}{title}
//   </div>
// );

// const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
//   <Card className={`${bg} border-0 shadow-sm`}>
//     <CardContent className="p-2 sm:p-3">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
//           <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
//         </div>
//         <div className={`p-1.5 rounded-lg ${color}`}>
//           <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// );

// export function MaterialPurchase() {
//   const [purchases, setPurchases] = useState<MaterialPurchaseType[]>([]);
//   const [properties, setProperties] = useState<Property[]>([]);
//   const [categories, setCategories] = useState<MasterCategory[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [selectedPurchase, setSelectedPurchase] = useState<MaterialPurchaseType | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const [stats, setStats] = useState({
//     total_purchases: 0,
//     total_amount: 0,
//     total_paid: 0,
//     total_balance: 0,
//     pending_count: 0,
//     partial_count: 0,
//     paid_count: 0
//   });

//   // Filters
//   const [propertyFilter, setPropertyFilter] = useState('all');
//   const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');
//   const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

//   // Column search
//   const [colSearch, setColSearch] = useState({
//     invoice: '', vendor: '', property: '', amount: '', status: ''
//   });

//   // Form state
//   const [formData, setFormData] = useState({
//     purchase_date: new Date().toISOString().split('T')[0],
//     vendor_name: '',
//     vendor_phone: '',
//     invoice_number: '',
//     property_id: '',
//     property_name: '',
//     notes: ''
//   });

//   const [lineItems, setLineItems] = useState<PurchaseItem[]>([{
//     item_name: '',
//     category: '',
//     quantity: 0,
//     unit_price: 0,
//     total_price: 0,
//     notes: ''
//   }]);

//   const [paymentData, setPaymentData] = useState({
//     payment_date: new Date().toISOString().split('T')[0],
//     amount: 0,
//     payment_method: 'Cash',
//     payment_reference: '',
//     paid_by: '',
//     payment_notes: ''
//   });

//   // Selection
//   const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());

//   // Load categories from master
//   const loadCategories = useCallback(async () => {
//     try {
//       const res = await getMasterItemsByTab('Properties');
//       const list = Array.isArray(res.data) ? res.data : [];
//       const catItem = list.find((i: any) => i.name?.toLowerCase() === 'category');
//       if (!catItem) return;
//       const vRes = await getMasterValues(catItem.id);
//       const values = Array.isArray(vRes.data) ? vRes.data : Array.isArray(vRes) ? vRes : [];
//       setCategories(
//         values
//           .filter((v: any) => v.isactive === 1 || v.is_active === 1)
//           .map((v: any) => ({ id: String(v.id), name: v.value || v.name || '' }))
//       );
//     } catch (err) {
//       console.error('Could not load categories:', err);
//     }
//   }, []);

//   // Load properties
//   const loadProperties = useCallback(async () => {
//     try {
//       const res = await listProperties({ is_active: true });
//       const list = res?.data?.data || res?.data || (res as any)?.results || [];
//       const arr = Array.isArray(list) ? list : Object.values(list);
//       setProperties(arr.map((p: any) => ({ id: String(p.id), name: p.name })));
//     } catch (err) {
//       console.error('Could not load properties:', err);
//     }
//   }, []);

//   // Load purchases and stats
//   // Load purchases and stats
// // Load purchases and stats
// const loadAll = useCallback(async () => {
//   setLoading(true);
//   try {
//     const filters: any = {};
//     if (propertyFilter !== 'all') filters.property_id = propertyFilter;
//     if (statusFilter !== 'all') filters.payment_status = statusFilter;
//     if (dateFilter.from) filters.from_date = dateFilter.from;
//     if (dateFilter.to) filters.to_date = dateFilter.to;

//     const [purchasesRes, statsRes] = await Promise.all([
//       getPurchases(filters),
//       getPurchaseStats()
//     ]);

//     console.log('API Response:', purchasesRes);

//     // Ensure items are properly parsed
//     const purchasesData = purchasesRes.data || [];
//     purchasesData.forEach(p => {
//       // 🔥 Parse items if it's a string
//       if (p.items) {
//         if (typeof p.items === 'string') {
//           try {
//             p.purchase_items = JSON.parse(p.items);
//           } catch (e) {
//             console.error('Error parsing items JSON:', e);
//             p.purchase_items = [];
//           }
//         } else if (Array.isArray(p.items)) {
//           p.purchase_items = p.items;
//         }
//       } else {
//         p.purchase_items = [];
//       }
//     });

//     setPurchases(purchasesData);
//     setStats(statsRes.data || stats);
//   } catch (err: any) {
//     console.error('Error loading purchases:', err);
//     toast.error(err.message || 'Failed to load purchases');
//   } finally {
//     setLoading(false);
//   }
// }, [propertyFilter, statusFilter, dateFilter]);

//   useEffect(() => { 
//     loadCategories(); 
//     loadProperties(); 
//   }, []);
  
//   useEffect(() => { 
//     loadAll(); 
//   }, [loadAll]);

//   // Filtered items with column search
//   const filteredPurchases = useMemo(() => {
//     return purchases.filter(p => {
//       const cs = colSearch;
//       const invOk = !cs.invoice || p.invoice_number?.toLowerCase().includes(cs.invoice.toLowerCase());
//       const venOk = !cs.vendor || p.vendor_name?.toLowerCase().includes(cs.vendor.toLowerCase());
//       const propOk = !cs.property || (p.property_name || '').toLowerCase().includes(cs.property.toLowerCase());
//       const amtOk = !cs.amount || String(p.total_amount).includes(cs.amount);
//       const statOk = !cs.status || p.payment_status?.toLowerCase().includes(cs.status.toLowerCase());
//       return invOk && venOk && propOk && amtOk && statOk;
//     });
//   }, [purchases, colSearch]);

//   // Form calculations
//   const getTotalAmount = () => {
//     return lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
//   };

//   const addLineItem = () => {
//     setLineItems([...lineItems, {
//       item_name: '',
//       category: '',
//       quantity: 0,
//       unit_price: 0,
//       total_price: 0,
//       notes: ''
//     }]);
//   };

//   const removeLineItem = (index: number) => {
//     if (lineItems.length === 1) return;
//     const updated = [...lineItems];
//     updated.splice(index, 1);
//     setLineItems(updated);
//   };

//   const updateLineItem = (index: number, field: keyof PurchaseItem, value: any) => {
//     const updated = [...lineItems];
//     updated[index] = { ...updated[index], [field]: value };

//     if (field === 'quantity' || field === 'unit_price') {
//       updated[index].total_price = (updated[index].quantity || 0) * (updated[index].unit_price || 0);
//     }

//     setLineItems(updated);
//   };

//   // CRUD Operations
//   const openAdd = () => {
//     setFormData({
//       purchase_date: new Date().toISOString().split('T')[0],
//       vendor_name: '',
//       vendor_phone: '',
//       invoice_number: '',
//       property_id: '',
//       property_name: '',
//       notes: ''
//     });
//     setLineItems([{
//       item_name: '',
//       category: '',
//       quantity: 0,
//       unit_price: 0,
//       total_price: 0,
//       notes: ''
//     }]);
//     setShowForm(true);
//   };

//  const handleViewDetails = (purchase: MaterialPurchaseType) => {
//   console.log('Viewing purchase:', purchase);
  
//   // 🔥 Ensure purchase_items is properly set
//   if (!purchase.purchase_items && purchase.items) {
//     if (typeof purchase.items === 'string') {
//       try {
//         purchase.purchase_items = JSON.parse(purchase.items);
//       } catch (e) {
//         console.error('Error parsing items in handleViewDetails:', e);
//         purchase.purchase_items = [];
//       }
//     } else if (Array.isArray(purchase.items)) {
//       purchase.purchase_items = purchase.items;
//     }
//   }
  
//   // 🔥 Agar purchase_items abhi bhi undefined hai to items se try karo
//   if (!purchase.purchase_items && purchase.items) {
//     purchase.purchase_items = purchase.items as any;
//   }
  
//   console.log('Purchase items after parsing:', purchase.purchase_items);
  
//   setSelectedPurchase(purchase);
//   setShowDetailsModal(true);
// };

//   const handleAddPayment = (purchase: MaterialPurchaseType) => {
//     setSelectedPurchase(purchase);
//     const remaining = (purchase.balance_amount || purchase.total_amount) || 0;
//     setPaymentData({
//       payment_date: new Date().toISOString().split('T')[0],
//       amount: remaining,
//       payment_method: 'Cash',
//       payment_reference: '',
//       paid_by: '',
//       payment_notes: ''
//     });
//     setShowPaymentModal(true);
//   };

//   const handleSubmitPurchase = async () => {
//     if (!formData.vendor_name || !formData.invoice_number || !formData.property_id) {
//       toast.error('Vendor name, invoice number, and property are required');
//       return;
//     }

//     if (lineItems.length === 0 || lineItems.some(item => !item.item_name || item.quantity <= 0)) {
//       toast.error('Please add at least one valid item');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const totalAmount = getTotalAmount();
//       const itemsSummary = lineItems.map(item => `${item.item_name} (${item.quantity})`).join(', ');

//       const selectedProperty = properties.find(p => p.id === formData.property_id);

//       const payload: CreatePurchasePayload = {
//         purchase_date: formData.purchase_date,
//         vendor_name: formData.vendor_name,
//         vendor_phone: formData.vendor_phone,
//         invoice_number: formData.invoice_number,
//         property_id: parseInt(formData.property_id),
//         property_name: selectedProperty?.name || formData.property_name,
//         notes: formData.notes,
//         items: lineItems,
//         items_summary: itemsSummary,
//         total_amount: totalAmount,
//         paid_amount: 0
//       };

//       const response = await createPurchase(payload);
//       console.log('Create response:', response);
      
//       setShowForm(false);
//       await loadAll();
//       toast.success('Purchase created successfully');
//     } catch (err: any) {
//       console.error('Error creating purchase:', err);
//       toast.error(err.message || 'Failed to create purchase');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleSubmitPayment = async () => {
//     if (!selectedPurchase) return;

//     const remaining = (selectedPurchase.balance_amount || selectedPurchase.total_amount) || 0;
//     if (paymentData.amount > remaining) {
//       toast.error(`Payment amount cannot exceed remaining balance: ₹${remaining.toLocaleString('en-IN')}`);
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const payload: AddPaymentPayload = {
//         payment_date: paymentData.payment_date,
//         amount: paymentData.amount,
//         payment_method: paymentData.payment_method,
//         paid_by: paymentData.paid_by,
//         payment_reference: paymentData.payment_reference,
//         payment_notes: paymentData.payment_notes
//       };

//       await addPayment(selectedPurchase.id, payload);
//       setShowPaymentModal(false);
//       await loadAll();
//       toast.success(`Payment of ₹${paymentData.amount.toLocaleString('en-IN')} added successfully`);
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to add payment');
//     } finally {
//       setSubmitting(false);
//     }
//   };

// const handleDelete = async (id: string | number, invoiceNumber?: string) => {
//   const result = await Swal.fire({
//     title: 'Are you sure?',
//     text: `You are about to delete purchase "${invoiceNumber || id}". This action cannot be undone!`,
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#d33',
//     cancelButtonColor: '#3085d6',
//     confirmButtonText: 'Yes, delete it!',
//     cancelButtonText: 'Cancel',
//     background: '#fff',
//     backdrop: `rgba(0,0,0,0.4)`,
//     width: '400px', // Width fixed rakho
//     padding: '1.5rem',
//     customClass: {
//       popup: 'rounded-xl shadow-2xl',
//       title: 'text-lg font-bold text-gray-800',
//       htmlContainer: 'text-sm text-gray-600 my-2',
//       confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
//       cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
//       actions: 'flex justify-center gap-2 mt-4'
//     },
//     buttonsStyling: false, // Custom styling enable karne ke liye
//   });

//   if (!result.isConfirmed) return;

//   try {
//     setSubmitting(true);
//     await deletePurchase(id);
//     await loadAll();
    
//     Swal.fire({
//       title: 'Deleted!',
//       text: 'Purchase has been deleted successfully.',
//       icon: 'success',
//       timer: 1500,
//       showConfirmButton: false,
//       width: '350px',
//       padding: '1rem',
//       customClass: {
//         popup: 'rounded-xl shadow-2xl',
//         title: 'text-base font-bold text-green-600',
//         htmlContainer: 'text-xs text-gray-600'
//       }
//     });
//   } catch (err: any) {
//     console.error('Error deleting purchase:', err);
//     Swal.fire({
//       title: 'Error!',
//       text: err.message || 'Failed to delete purchase',
//       icon: 'error',
//       confirmButtonColor: '#3085d6',
//       confirmButtonText: 'OK',
//       width: '350px',
//       padding: '1rem',
//       customClass: {
//         popup: 'rounded-xl shadow-2xl',
//         title: 'text-base font-bold text-red-600',
//         htmlContainer: 'text-xs text-gray-600',
//         confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
//       },
//       buttonsStyling: false
//     });
//   } finally {
//     setSubmitting(false);
//   }
// };

//  const handleBulkDelete = async () => {
//   if (selectedItems.size === 0) {
//     Swal.fire({
//       title: 'No items selected',
//       text: 'Please select at least one purchase to delete.',
//       icon: 'info',
//       confirmButtonColor: '#3085d6',
//       confirmButtonText: 'OK',
//       width: '350px',
//       padding: '1rem',
//       customClass: {
//         popup: 'rounded-xl shadow-2xl',
//         title: 'text-base font-bold text-blue-600',
//         htmlContainer: 'text-xs text-gray-600',
//         confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
//       },
//       buttonsStyling: false
//     });
//     return;
//   }

//   const result = await Swal.fire({
//     title: 'Are you sure?',
//     text: `You are about to delete ${selectedItems.size} selected purchase(s). This action cannot be undone!`,
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#d33',
//     cancelButtonColor: '#3085d6',
//     confirmButtonText: 'Yes, delete them!',
//     cancelButtonText: 'Cancel',
//     background: '#fff',
//     backdrop: `rgba(0,0,0,0.4)`,
//     width: '400px',
//     padding: '1.5rem',
//     customClass: {
//       popup: 'rounded-xl shadow-2xl',
//       title: 'text-lg font-bold text-gray-800',
//       htmlContainer: 'text-sm text-gray-600 my-2',
//       confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
//       cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
//       actions: 'flex justify-center gap-2 mt-4'
//     },
//     buttonsStyling: false,
//   });

//   if (!result.isConfirmed) return;

//   try {
//     setSubmitting(true);
//     await bulkDeletePurchases(Array.from(selectedItems));
//     setSelectedItems(new Set());
//     await loadAll();
    
//     Swal.fire({
//       title: 'Deleted!',
//       text: `${selectedItems.size} purchase(s) have been deleted successfully.`,
//       icon: 'success',
//       timer: 1500,
//       showConfirmButton: false,
//       width: '350px',
//       padding: '1rem',
//       customClass: {
//         popup: 'rounded-xl shadow-2xl',
//         title: 'text-base font-bold text-green-600',
//         htmlContainer: 'text-xs text-gray-600'
//       }
//     });
//   } catch (err: any) {
//     console.error('Error bulk deleting purchases:', err);
//     Swal.fire({
//       title: 'Error!',
//       text: err.message || 'Failed to delete purchases',
//       icon: 'error',
//       confirmButtonColor: '#3085d6',
//       confirmButtonText: 'OK',
//       width: '350px',
//       padding: '1rem',
//       customClass: {
//         popup: 'rounded-xl shadow-2xl',
//         title: 'text-base font-bold text-red-600',
//         htmlContainer: 'text-xs text-gray-600',
//         confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
//       },
//       buttonsStyling: false
//     });
//   } finally {
//     setSubmitting(false);
//   }
// };

//   const toggleSelectAll = () => {
//     if (selectedItems.size === filteredPurchases.length) {
//       setSelectedItems(new Set());
//     } else {
//       setSelectedItems(new Set(filteredPurchases.map(p => p.id)));
//     }
//   };

//   const toggleSelectItem = (id: string | number) => {
//     const newSelected = new Set(selectedItems);
//     if (newSelected.has(id)) {
//       newSelected.delete(id);
//     } else {
//       newSelected.add(id);
//     }
//     setSelectedItems(newSelected);
//   };

//   // Export CSV
//   const handleExport = () => {
//     const headers = ['Date', 'Invoice #', 'Vendor', 'Property', 'Total Amount', 'Paid', 'Balance', 'Status'];
//     const rows = filteredPurchases.map(p => [
//       new Date(p.purchase_date).toLocaleDateString('en-IN'),
//       p.invoice_number,
//       p.vendor_name,
//       p.property_name,
//       p.total_amount,
//       p.paid_amount || 0,
//       p.balance_amount || p.total_amount,
//       p.payment_status
//     ]);

//     const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `purchases_${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//   };

//   // PDF Download
//   const handleDownloadPDF = (purchase: MaterialPurchaseType) => {
//     const doc = new jsPDF();
//     const pageWidth = doc.internal.pageSize.width;

//     doc.setFillColor(16, 185, 129);
//     doc.rect(0, 0, pageWidth, 35, 'F');

//     doc.setTextColor(255, 255, 255);
//     doc.setFontSize(24);
//     doc.setFont('helvetica', 'bold');
//     doc.text('MATERIAL PURCHASE', pageWidth / 2, 15, { align: 'center' });

//     doc.setFontSize(11);
//     doc.setFont('helvetica', 'normal');
//     doc.text('Purchase Order Details', pageWidth / 2, 25, { align: 'center' });

//     let yPos = 45;

//     doc.setFillColor(243, 244, 246);
//     doc.roundedRect(14, yPos, pageWidth - 28, 40, 2, 2, 'F');

//     doc.setTextColor(0, 0, 0);
//     doc.setFontSize(10);
//     doc.setFont('helvetica', 'bold');

//     doc.text('Invoice:', 18, yPos + 8);
//     doc.setFont('helvetica', 'normal');
//     doc.text(purchase.invoice_number, 45, yPos + 8);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Date:', 120, yPos + 8);
//     doc.setFont('helvetica', 'normal');
//     doc.text(new Date(purchase.purchase_date).toLocaleDateString('en-IN'), 140, yPos + 8);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Vendor:', 18, yPos + 18);
//     doc.setFont('helvetica', 'normal');
//     doc.text(purchase.vendor_name, 45, yPos + 18);

//     doc.setFont('helvetica', 'bold');
//     doc.text('Property:', 120, yPos + 18);
//     doc.setFont('helvetica', 'normal');
//     doc.text(purchase.property_name, 160, yPos + 18);

//     yPos += 50;

//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'bold');
//     doc.setTextColor(31, 41, 55);
//     doc.text('Purchase Items', 14, yPos);
//     yPos += 5;

//     const itemsData = purchase.purchase_items?.map(item => [
//       item.item_name,
//       item.category,
//       item.quantity.toString(),
//       `₹${item.unit_price.toLocaleString('en-IN')}`,
//       `₹${item.total_price.toLocaleString('en-IN')}`
//     ]) || [];

//     autoTable(doc, {
//       startY: yPos,
//       head: [['Item Name', 'Category', 'Qty', 'Unit Price', 'Total']],
//       body: itemsData,
//       foot: [['', '', '', 'Total Amount:', `₹${purchase.total_amount.toLocaleString('en-IN')}`]],
//       theme: 'grid',
//       headStyles: { fillColor: [59, 130, 246], fontSize: 10 },
//       footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontSize: 11, fontStyle: 'bold' }
//     });

//     yPos = (doc as any).lastAutoTable.finalY + 15;

//     doc.setFillColor(239, 246, 255);
//     doc.roundedRect(14, yPos, pageWidth - 28, 25, 2, 2, 'F');

//     doc.setFontSize(10);
//     doc.setTextColor(55, 65, 81);
//     doc.text('Total:', 20, yPos + 8);
//     doc.text(`₹${purchase.total_amount.toLocaleString('en-IN')}`, 60, yPos + 8);

//     doc.setTextColor(16, 185, 129);
//     doc.text('Paid:', 20, yPos + 16);
//     doc.text(`₹${(purchase.paid_amount || 0).toLocaleString('en-IN')}`, 60, yPos + 16);

//     doc.setTextColor(239, 68, 68);
//     doc.text('Balance:', 120, yPos + 12);
//     doc.setFontSize(12);
//     doc.text(`₹${(purchase.balance_amount || purchase.total_amount).toLocaleString('en-IN')}`, 160, yPos + 12);

//     doc.save(`Purchase_${purchase.invoice_number}.pdf`);
//   };

//   // Status badge
//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'Paid':
//         return <Badge className="bg-green-100 text-green-700 text-[9px] px-1.5">Paid</Badge>;
//       case 'Partial':
//         return <Badge className="bg-orange-100 text-orange-700 text-[9px] px-1.5">Partial</Badge>;
//       default:
//         return <Badge className="bg-red-100 text-red-700 text-[9px] px-1.5">Pending</Badge>;
//     }
//   };

//   const hasColSearch = Object.values(colSearch).some(v => v !== '');
//   const hasFilters = propertyFilter !== 'all' || statusFilter !== 'all' || dateFilter.from || dateFilter.to;
//   const activeFilterCount = [
//     propertyFilter !== 'all',
//     statusFilter !== 'all',
//     !!dateFilter.from,
//     !!dateFilter.to
//   ].filter(Boolean).length;

//   const clearFilters = () => {
//     setPropertyFilter('all');
//     setStatusFilter('all');
//     setDateFilter({ from: '', to: '' });
//   };

//   const clearColSearch = () => setColSearch({
//     invoice: '', vendor: '', property: '', amount: '', status: ''
//   });

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="sticky top-0 z-20">
//         <div className="px-3 sm:px-5 pt-3 pb-2 flex items-end justify-end gap-2">
//           <div className="flex items-end justify-end gap-1.5 flex-shrink-0">
//             <button
//               onClick={() => setSidebarOpen(o => !o)}
//               className={`
//                 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
//                 ${sidebarOpen || hasFilters
//                   ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
//                   : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
//               `}
//             >
//               <Filter className="h-3.5 w-3.5 flex-shrink-0" />
//               <span className="hidden sm:inline">Filters</span>
//               {activeFilterCount > 0 && (
//                 <span className={`
//                   h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0
//                   ${sidebarOpen || hasFilters ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}
//                 `}>
//                   {activeFilterCount}
//                 </span>
//               )}
//             </button>

//             <button onClick={handleExport} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium transition-colors">
//               <Download className="h-3.5 w-3.5 flex-shrink-0" />
//               <span className="hidden sm:inline">Export</span>
//             </button>

//             <button onClick={loadAll} disabled={loading} className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
//               <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
//             </button>

//             <button onClick={openAdd} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm transition-colors">
//               <Plus className="h-3.5 w-3.5 flex-shrink-0" />
//               <span className="hidden xs:inline sm:inline">Add Purchase</span>
//             </button>
//           </div>
//         </div>

//         <div className="px-3 sm:px-5 pb-3">
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
//             <StatCard title="Total Purchases" value={stats.total_purchases} icon={Boxes} color="bg-blue-600" bg="bg-gradient-to-br from-blue-50 to-blue-100" />
//             <StatCard title="Total Amount" value={`₹${Number(stats.total_amount || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="bg-green-600" bg="bg-gradient-to-br from-green-50 to-green-100" />
//             <StatCard title="Total Paid" value={`₹${Number(stats.total_paid || 0).toLocaleString('en-IN')}`} icon={TrendingDown} color="bg-orange-600" bg="bg-gradient-to-br from-orange-50 to-orange-100" />
//             <StatCard title="Balance Due" value={`₹${Number(stats.total_balance || 0).toLocaleString('en-IN')}`} icon={AlertTriangle} color="bg-red-600" bg="bg-gradient-to-br from-red-50 to-red-100" />
//           </div>
//         </div>
//       </div>

//       <div className="relative">
//         <main className="p-3 sm:p-4">
//           <Card className="border rounded-lg shadow-sm">
//             <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
//               <span className="text-sm font-semibold text-gray-700">All Purchases ({filteredPurchases.length})</span>
//               {hasColSearch && (
//                 <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold">Clear Search</button>
//               )}
//             </div>

//             {selectedItems.size > 0 && (
//               <div className="p-3 bg-blue-50 border-b flex items-center justify-between">
//                 <span className="text-sm font-semibold text-blue-900">{selectedItems.size} item(s) selected</span>
//                 <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">
//                   <Trash2 className="h-3.5 w-3.5" /> Delete Selected
//                 </button>
//               </div>
//             )}

//             <div className="overflow-auto max-h-[calc(100vh-320px)]">
//               <div className="min-w-[1000px]">
//                 <Table>
//                   <TableHeader className="sticky top-0 z-10 bg-gray-50">
//                     <TableRow>
//                       <TableHead className="py-2 px-3 w-8">
//                         <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded">
//                           {selectedItems.size === filteredPurchases.length && filteredPurchases.length > 0 ?
//                             <span className="text-blue-600">✓</span> : <span className="text-gray-400">□</span>}
//                         </button>
//                       </TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Date</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Invoice #</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Vendor</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Property</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Total</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Paid</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Balance</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Status</TableHead>
//                       <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
//                     </TableRow>

//                     <TableRow className="bg-gray-50/80">
//                       <TableCell className="py-1 px-2"></TableCell>
//                       {[
//                         { key: null, ph: '' },
//                         { key: 'invoice', ph: 'Search invoice…' },
//                         { key: 'vendor', ph: 'Search vendor…' },
//                         { key: 'property', ph: 'Search property…' },
//                         { key: 'amount', ph: 'Amount…' },
//                         { key: null, ph: '' },
//                         { key: null, ph: '' },
//                         { key: null, ph: '' },
//                         { key: 'status', ph: 'Status…' },
//                       ].map((col, idx) => (
//                         <TableCell key={idx} className="py-1 px-2">
//                           {col.key ? (
//                             <Input placeholder={col.ph}
//                               value={colSearch[col.key as keyof typeof colSearch]}
//                               onChange={e => setColSearch(prev => ({ ...prev, [col.key!]: e.target.value }))}
//                               className="h-6 text-[10px]"
//                             />
//                           ) : <div />}
//                         </TableCell>
//                       ))}
//                       <TableCell className="py-1 px-2" />
//                     </TableRow>
//                   </TableHeader>

//                   <TableBody>
//                     {loading ? (
//                       <TableRow>
//                         <TableCell colSpan={11} className="text-center py-12">
//                           <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
//                           <p className="text-xs text-gray-500">Loading purchases…</p>
//                         </TableCell>
//                       </TableRow>
//                     ) : filteredPurchases.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={11} className="text-center py-12">
//                           <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
//                           <p className="text-sm font-medium text-gray-500">No purchases found</p>
//                           <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
//                         </TableCell>
//                       </TableRow>
//                     ) : filteredPurchases.map(purchase => (
//                       <TableRow key={purchase.id} className="hover:bg-gray-50">
//                         <TableCell className="py-2 px-3">
//                           <button onClick={() => toggleSelectItem(purchase.id)} className="p-1 hover:bg-gray-200 rounded">
//                             {selectedItems.has(purchase.id) ? <span className="text-blue-600">✓</span> : <span className="text-gray-400">□</span>}
//                           </button>
//                         </TableCell>
//                         <TableCell className="py-2 px-3 text-xs">{new Date(purchase.purchase_date).toLocaleDateString('en-IN')}</TableCell>
//                         <TableCell className="py-2 px-3 text-xs font-medium">{purchase.invoice_number}</TableCell>
//                         <TableCell className="py-2 px-3 text-xs">{purchase.vendor_name}{purchase.vendor_phone && <div className="text-[9px] text-gray-500">{purchase.vendor_phone}</div>}</TableCell>
//                         <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[150px] truncate">{purchase.property_name}</TableCell>
//                         <TableCell className="py-2 px-3 text-xs font-semibold">₹{purchase.total_amount.toLocaleString('en-IN')}</TableCell>
//                         <TableCell className="py-2 px-3 text-xs text-green-600">₹{(purchase.paid_amount || 0).toLocaleString('en-IN')}</TableCell>
//                         <TableCell className="py-2 px-3 text-xs font-semibold text-red-600">₹{(purchase.balance_amount || purchase.total_amount).toLocaleString('en-IN')}</TableCell>
//                         <TableCell className="py-2 px-3">{getStatusBadge(purchase.payment_status)}</TableCell>
//                         <TableCell className="py-2 px-3">
//                           <div className="flex justify-end gap-1">
//                             <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600" onClick={() => handleViewDetails(purchase)}><Eye className="h-3.5 w-3.5" /></Button>
//                             {purchase.payment_status !== 'Paid' && (
// <Button
//   size="sm"
//   className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
//   onClick={() => handleAddPayment(purchase)}
// >
//   <IndianRupee className="h-3.5 w-3.5" />
//   Pay
// </Button>                            )}
//                             <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(purchase.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>
//           </Card>
//         </main>

//         {/* Filter Sidebar */}
//         {sidebarOpen && (
//           <>
//             <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
//             <aside className="fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col">
//               <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between">
//                 <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-white" /><span className="text-sm font-semibold text-white">Filters</span>{hasFilters && <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">{activeFilterCount} active</span>}</div>
//                 <div className="flex items-center gap-2">{hasFilters && <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">Clear all</button>}<button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white"><X className="h-4 w-4" /></button></div>
//               </div>

//               <div className="flex-1 overflow-y-auto p-4 space-y-5">
//                 <div>
//                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Building className="h-3 w-3 text-indigo-500" /> Property</p>
//                   <div className="space-y-1">
//                     <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer ${propertyFilter === 'all' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
//                       <input type="radio" name="property" value="all" checked={propertyFilter === 'all'} onChange={() => setPropertyFilter('all')} className="sr-only" />
//                       <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === 'all' ? 'bg-blue-500' : 'bg-gray-300'}`} /><span className="text-[12px] font-medium">All Properties</span>
//                     </label>
//                     {properties.map(p => (
//                       <label key={p.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer ${propertyFilter === p.id ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
//                         <input type="radio" name="property" value={p.id} checked={propertyFilter === p.id} onChange={() => setPropertyFilter(p.id)} className="sr-only" />
//                         <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === p.id ? 'bg-blue-500' : 'bg-gray-300'}`} /><span className="text-[12px] font-medium truncate">{p.name}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-100" />

//                 <div>
//                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><TrendingDown className="h-3 w-3 text-orange-500" /> Payment Status</p>
//                   <div className="space-y-1">
//                     {[
//                       { val: 'all', label: 'All Status', dot: 'bg-gray-400' },
//                       { val: 'Pending', label: 'Pending', dot: 'bg-red-500' },
//                       { val: 'Partial', label: 'Partial', dot: 'bg-orange-500' },
//                       { val: 'Paid', label: 'Paid', dot: 'bg-green-500' },
//                     ].map(opt => (
//                       <label key={opt.val} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer ${statusFilter === opt.val ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
//                         <input type="radio" name="status" value={opt.val} checked={statusFilter === opt.val} onChange={() => setStatusFilter(opt.val as PaymentStatus)} className="sr-only" />
//                         <span className={`h-2 w-2 rounded-full flex-shrink-0 ${opt.dot}`} /><span className="text-[12px] font-medium">{opt.label}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-100" />

//                 <div>
//                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Date Range</p>
//                   <div className="space-y-2">
//                     <div><label className="text-[10px] text-gray-500 mb-1 block">From</label><Input type="date" value={dateFilter.from} onChange={e => setDateFilter(prev => ({ ...prev, from: e.target.value }))} className="h-7 text-[10px]" /></div>
//                     <div><label className="text-[10px] text-gray-500 mb-1 block">To</label><Input type="date" value={dateFilter.to} onChange={e => setDateFilter(prev => ({ ...prev, to: e.target.value }))} className="h-7 text-[10px]" /></div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
//                 <button onClick={clearFilters} disabled={!hasFilters} className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40">Clear All</button>
//                 <button onClick={() => setSidebarOpen(false)} className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-indigo-700">Apply & Close</button>
//               </div>
//             </aside>
//           </>
//         )}
//       </div>

//       {/* Add Purchase Dialog */}
//       <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
//         <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
//           <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
//             <div>
//               <h2 className="text-base font-semibold">New Material Purchase</h2>
//               <p className="text-xs text-blue-100">Fill in the purchase details</p>
//             </div>
//             <DialogClose asChild>
//               <button className="p-1.5 rounded-full hover:bg-white/20 transition">
//                 <X className="h-4 w-4" />
//               </button>
//             </DialogClose>
//           </div>

//           <div className="p-4 overflow-y-auto max-h-[75vh] space-y-5">
//             {/* Basic Info */}
//            {/* Basic Info */}
// <div>
//   <SH icon={<Package className="h-3 w-3" />} title="Purchase Info" />
//   <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
//     <div>
//       <label className={L}>Vendor Name <span className="text-red-400">*</span></label>
//       <Input className={F} placeholder="Vendor name"
//         value={formData.vendor_name}
//         onChange={e => setFormData({ ...formData, vendor_name: e.target.value })} />
//     </div>
//     <div>
//       <label className={L}>Vendor Phone</label>
//       <Input className={F} placeholder="Phone number"
//         value={formData.vendor_phone}
//         maxLength={10}
//         onChange={e => setFormData({ ...formData, vendor_phone: e.target.value })} />
//     </div>
    
//     {/* ✅ Teen columns ek row mein - Purchase Date, Invoice Number, Property */}
//     <div className="col-span-2 grid grid-cols-3 gap-3">
//       <div>
//         <label className={L}>Purchase Date <span className="text-red-400">*</span></label>
//         <Input type="date" className={F}
//           value={formData.purchase_date}
//           onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} />
//       </div>
//       <div>
//         <label className={L}>Invoice Number <span className="text-red-400">*</span></label>
//         <Input className={F} placeholder="INV-001"
//           value={formData.invoice_number}
//           onChange={e => setFormData({ ...formData, invoice_number: e.target.value })} />
//       </div>
//       <div>
//         <label className={L}>Property <span className="text-red-400">*</span></label>
//         <Select value={formData.property_id}
//           onValueChange={v => {
//             const selected = properties.find(p => p.id === v);
//             setFormData(p => ({ ...p, property_id: v, property_name: selected?.name || '' }));
//           }}>
//           <SelectTrigger className={F}>
//             <Building className="h-3 w-3 text-gray-400 mr-1.5" />
//             <SelectValue placeholder="Select" />
//           </SelectTrigger>
//           <SelectContent>
//             {properties.map(p => (
//               <SelectItem key={p.id} value={p.id} className={SI}>{p.name}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//     </div>
//   </div>
// </div>

//             {/* Line Items */}
//          {/* Line Items */}
// <div>
//   <div className="flex items-center justify-between mb-2">
//     <SH icon={<Boxes className="h-3 w-3" />} title="Purchase Items" />
//     <Button type="button" size="sm" variant="outline"
//       onClick={addLineItem}
//       className="h-7 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-50">
//       <Plus className="h-3 w-3 mr-1" /> Add Item
//     </Button>
//   </div>

//   <div className="space-y-2">
//     {lineItems.map((item, index) => (
//       <div key={index}>
//         {/* Desktop View - Exactly as before (hidden on mobile) */}
//         <div className="hidden md:grid grid-cols-12 gap-2 p-2 bg-gray-50 rounded-lg">
//           <div className="col-span-3">
//             <Input placeholder="Item name *"
//               value={item.item_name}
//               onChange={e => updateLineItem(index, 'item_name', e.target.value)}
//               className="h-7 text-[10px]" />
//           </div>
//           <div className="col-span-2">
//             <Select value={item.category} onValueChange={v => updateLineItem(index, 'category', v)}>
//               <SelectTrigger className="h-7 text-[10px]">
//                 <SelectValue placeholder="Select category" />
//               </SelectTrigger>
//               <SelectContent>
//                 {categories.map(c => (
//                   <SelectItem key={c.id} value={c.name} className="text-[10px]">{c.name}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="col-span-1">
//             <Input
//               type="number"
//               min="1"
//               placeholder="Qty"
//               value={item.quantity || ''}
//               onChange={e => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
//               onWheel={(e) => (e.target as HTMLInputElement).blur()}
//               className="h-7 text-[10px]" />
//           </div>
//           <div className="col-span-2">
//             <Input type="number" min="0" step="0.01" placeholder="Price"
//               value={item.unit_price || ''}
//               onChange={e => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
//               className="h-7 text-[10px]" />
//           </div>
//           <div className="col-span-2">
//             <div className="h-7 px-2 bg-blue-100 rounded-md flex items-center text-[10px] font-semibold text-blue-700">
//               ₹{(item.total_price || 0).toLocaleString('en-IN')}
//             </div>
//           </div>
//           <div className="col-span-1">
//             <button onClick={() => removeLineItem(index)}
//               disabled={lineItems.length === 1}
//               className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-100 disabled:opacity-30">
//               <Trash2 className="h-3 w-3 text-red-600" />
//             </button>
//           </div>
//         </div>

//         {/* Mobile View - Grid layout with Item Name & Category in one row */}
//         <div className="md:hidden bg-gray-50 rounded-lg p-3 border border-gray-200">
//           {/* Item Name and Category in one row - 2 columns */}
//           <div className="grid grid-cols-2 gap-2 mb-3">
//             <div>
//               <label className="block text-[10px] font-semibold text-gray-600 mb-1">
//                 Item Name <span className="text-red-400">*</span>
//               </label>
//               <Input 
//                 placeholder="Item name"
//                 value={item.item_name}
//                 onChange={e => updateLineItem(index, 'item_name', e.target.value)}
//                 className="h-9 text-[12px] bg-white" 
//               />
//             </div>
//             <div>
//               <label className="block text-[10px] font-semibold text-gray-600 mb-1">
//                 Category
//               </label>
//               <Select value={item.category} onValueChange={v => updateLineItem(index, 'category', v)}>
//                 <SelectTrigger className="h-9 text-[12px] bg-white">
//                   <SelectValue placeholder="Select" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {categories.map(c => (
//                     <SelectItem key={c.id} value={c.name} className="text-[11px]">{c.name}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Qty and Price in 2 columns */}
//           <div className="grid grid-cols-2 gap-2 mb-3">
//             <div>
//               <label className="block text-[10px] font-semibold text-gray-600 mb-1">
//                 Qty
//               </label>
//               <Input
//                 type="number"
//                 min="1"
//                 placeholder="Qty"
//                 value={item.quantity || ''}
//                 onChange={e => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
//                 className="h-9 text-[12px] bg-white" 
//               />
//             </div>
//             <div>
//               <label className="block text-[10px] font-semibold text-gray-600 mb-1">
//                 Price (₹)
//               </label>
//               <Input 
//                 type="number" 
//                 min="0" 
//                 step="0.01" 
//                 placeholder="Price"
//                 value={item.unit_price || ''}
//                 onChange={e => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
//                 className="h-9 text-[12px] bg-white" 
//               />
//             </div>
//           </div>

//           {/* Total and Delete in 2 columns */}
//           <div className="grid grid-cols-2 gap-2 items-center">
//             <div>
//               <label className="block text-[10px] font-semibold text-gray-600 mb-1">
//                 Total
//               </label>
//               <div className="h-9 px-3 bg-blue-100 rounded-md flex items-center text-[13px] font-bold text-blue-700">
//                 ₹{(item.total_price || 0).toLocaleString('en-IN')}
//               </div>
//             </div>
//             <div className="flex justify-end items-end">
//               <button 
//                 onClick={() => removeLineItem(index)}
//                 disabled={lineItems.length === 1}
//                 className="h-9 w-9 flex items-center justify-center rounded-md bg-red-50 hover:bg-red-100 disabled:opacity-30"
//               >
//                 <Trash2 className="h-4 w-4 text-red-600" />
//               </button>
//             </div>
//           </div>

//           {/* Item summary line - exactly like image */}
//           {item.item_name && (
//             <div className="mt-3 pt-2 text-[11px] text-gray-600 border-t border-gray-200">
//               <span className="font-medium">{item.item_name}</span>
//               {item.category && <span> • {item.category}</span>}
//               <br />
//               <span className="text-[10px] text-gray-500">{item.quantity || 0} × ₹{item.unit_price || 0}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     ))}
//   </div>

//   <div className="mt-3 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
//     <span className="text-xs font-semibold text-gray-700">Total Amount:</span>
//     <span className="text-lg font-bold text-blue-600">
//       ₹{getTotalAmount().toLocaleString('en-IN')}
//     </span>
//   </div>
// </div>

//             {/* Notes */}
//             <div>
//               <SH icon={<StickyNote className="h-3 w-3" />} title="Notes" color="text-amber-600" />
//               <Textarea
//                 className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white min-h-[56px]"
//                 placeholder="Additional notes..."
//                 rows={2}
//                 value={formData.notes}
//                 onChange={e => setFormData({ ...formData, notes: e.target.value })}
//               />
//             </div>

//             <Button
//               disabled={submitting}
//               onClick={handleSubmitPurchase}
//               className="w-full h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
//             >
//               {submitting ? (
//                 <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Creating…</>
//               ) : 'Create Purchase'}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Payment Dialog */}
//       <Dialog open={showPaymentModal} onOpenChange={v => { if (!v) setShowPaymentModal(false); }}>
//         <DialogContent className="max-w-md w-[95vw] p-0">
//           <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
//             <div>
//               <h2 className="text-base font-semibold">Add Payment</h2>
//               <p className="text-xs text-green-100">Record payment for purchase</p>
//             </div>
//             <DialogClose asChild>
//               <button className="p-1.5 rounded-full hover:bg-white/20 transition">
//                 <X className="h-4 w-4" />
//               </button>
//             </DialogClose>
//           </div>

//           <div className="p-4 space-y-4">
//             {selectedPurchase && (
//               <div className="p-3 bg-gray-50 rounded-lg space-y-1">
//                 <div className="text-xs flex justify-between">
//                   <span className="text-gray-600">Invoice:</span>
//                   <span className="font-semibold">{selectedPurchase.invoice_number}</span>
//                 </div>
//                 <div className="text-xs flex justify-between">
//                   <span className="text-gray-600">Vendor:</span>
//                   <span className="font-semibold">{selectedPurchase.vendor_name}</span>
//                 </div>
//                 <div className="text-xs flex justify-between">
//                   <span className="text-gray-600">Balance Due:</span>
//                   <span className="font-semibold text-red-600">
//                     ₹{(selectedPurchase.balance_amount || selectedPurchase.total_amount).toLocaleString('en-IN')}
//                   </span>
//                 </div>
//               </div>
//             )}

//             <div>
//               <label className={L}>Payment Date *</label>
//               <Input type="date" className={F}
//                 value={paymentData.payment_date}
//                 onChange={e => setPaymentData({ ...paymentData, payment_date: e.target.value })} />
//             </div>

//             <div>
//               <label className={L}>Amount (₹) *</label>
//               <Input type="number" min="0" step="0.01" className={F}
//                 value={paymentData.amount}
//                 onChange={e => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })} />
//             </div>

//             <div>
//               <label className={L}>Payment Method *</label>
//               <Select value={paymentData.payment_method}
//                 onValueChange={v => setPaymentData({ ...paymentData, payment_method: v })}>
//                 <SelectTrigger className={F}>
//                   <SelectValue placeholder="Select method" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Cash" className={SI}>Cash</SelectItem>
//                   <SelectItem value="UPI" className={SI}>UPI</SelectItem>
//                   <SelectItem value="Bank Transfer" className={SI}>Bank Transfer</SelectItem>
//                   <SelectItem value="Cheque" className={SI}>Cheque</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <label className={L}>Paid By *</label>
//               <Input className={F} placeholder="Person name"
//                 value={paymentData.paid_by}
//                 onChange={e => setPaymentData({ ...paymentData, paid_by: e.target.value })} />
//             </div>

//             <div>
//               <label className={L}>Reference (optional)</label>
//               <Input className={F} placeholder="Transaction ID / Cheque no."
//                 value={paymentData.payment_reference}
//                 onChange={e => setPaymentData({ ...paymentData, payment_reference: e.target.value })} />
//             </div>

//             <div>
//               <label className={L}>Notes</label>
//               <Textarea className="text-[11px] min-h-[56px]"
//                 placeholder="Payment notes..."
//                 rows={2}
//                 value={paymentData.payment_notes}
//                 onChange={e => setPaymentData({ ...paymentData, payment_notes: e.target.value })} />
//             </div>

//             <Button
//               disabled={submitting}
//               onClick={handleSubmitPayment}
//               className="w-full h-8 text-[11px] font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
//             >
//               {submitting ? (
//                 <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Adding Payment…</>
//               ) : 'Add Payment'}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Details Dialog */}
//       <Dialog open={showDetailsModal} onOpenChange={v => { if (!v) setShowDetailsModal(false); }}>
//         <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
//           <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
//             <div>
//               <h2 className="text-base font-semibold">Purchase Details</h2>
//               <p className="text-xs text-emerald-100">View complete purchase information</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <button onClick={() => selectedPurchase && handleDownloadPDF(selectedPurchase)}
//                 className="p-1.5 rounded-full hover:bg-white/20 transition" title="Download PDF">
//                 <Download className="h-4 w-4" />
//               </button>
//               <DialogClose asChild>
//                 <button className="p-1.5 rounded-full hover:bg-white/20 transition">
//                   <X className="h-4 w-4" />
//                 </button>
//               </DialogClose>
//             </div>
//           </div>

//           {selectedPurchase && (
//             <div className="p-4 overflow-y-auto max-h-[75vh] space-y-5">
//               <div className="bg-gray-50 rounded-lg p-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div><p className="text-[10px] text-gray-500">Invoice Number</p><p className="text-sm font-bold">{selectedPurchase.invoice_number}</p></div>
//                   <div><p className="text-[10px] text-gray-500">Purchase Date</p><p className="text-sm font-bold">{new Date(selectedPurchase.purchase_date).toLocaleDateString('en-IN')}</p></div>
//                   <div><p className="text-[10px] text-gray-500">Vendor</p><p className="text-sm font-bold">{selectedPurchase.vendor_name}{selectedPurchase.vendor_phone && <p className="text-[10px] text-gray-600">{selectedPurchase.vendor_phone}</p>}</p></div>
//                   <div><p className="text-[10px] text-gray-500">Property</p><p className="text-sm font-bold">{selectedPurchase.property_name}</p></div>
//                 </div>
//               </div>

//            {/* Items Table - Modified version */}
// <div>
//   <h3 className="text-xs font-bold text-gray-700 mb-2">Purchase Items</h3>
//   <div className="border rounded-lg overflow-hidden">
//     <table className="w-full text-xs">
//       <thead className="bg-gray-100">
//         <tr>
//           <th className="px-3 py-2 text-left">Item Name</th>
//           <th className="px-3 py-2 text-left">Category</th>
//           <th className="px-3 py-2 text-center">Qty</th>
//           <th className="px-3 py-2 text-right">Unit Price</th>
//           <th className="px-3 py-2 text-right">Total</th>
//         </tr>
//       </thead>
//       <tbody>
//         {(() => {
//           // 🔥 Try to get items from either purchase_items or items
//           let itemsToShow = selectedPurchase?.purchase_items;
          
//           // If purchase_items is empty but items exists, parse it
//           if ((!itemsToShow || itemsToShow.length === 0) && selectedPurchase?.items) {
//             if (typeof selectedPurchase.items === 'string') {
//               try {
//                 itemsToShow = JSON.parse(selectedPurchase.items);
//               } catch (e) {
//                 itemsToShow = [];
//               }
//             } else if (Array.isArray(selectedPurchase.items)) {
//               itemsToShow = selectedPurchase.items;
//             }
//           }
          
//           return itemsToShow && itemsToShow.length > 0 ? (
//             itemsToShow.map((item, idx) => (
//               <tr key={idx} className="border-t">
//                 <td className="px-3 py-2 font-medium">{item.item_name || '-'}</td>
//                 <td className="px-3 py-2">{item.category || '-'}</td>
//                 <td className="px-3 py-2 text-center">{item.quantity || 0}</td>
//                 <td className="px-3 py-2 text-right">₹{(item.unit_price || 0).toLocaleString('en-IN')}</td>
//                 <td className="px-3 py-2 text-right font-semibold">₹{(item.total_price || 0).toLocaleString('en-IN')}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
//                 No items found
//               </td>
//             </tr>
//           );
//         })()}
//       </tbody>
//       <tfoot className="bg-gray-50">
//         <tr>
//           <td colSpan={4} className="px-3 py-2 text-right font-bold">Total:</td>
//           <td className="px-3 py-2 text-right font-bold text-blue-600">
//             ₹{(selectedPurchase?.total_amount || 0).toLocaleString('en-IN')}
//           </td>
//         </tr>
//       </tfoot>
//     </table>
//   </div>
// </div>
//               <div className="grid grid-cols-3 gap-3">
//                 <div className="bg-blue-50 p-3 rounded-lg text-center"><p className="text-[10px] text-gray-600">Total Amount</p><p className="text-base font-bold">₹{selectedPurchase.total_amount.toLocaleString('en-IN')}</p></div>
//                 <div className="bg-green-50 p-3 rounded-lg text-center"><p className="text-[10px] text-gray-600">Paid Amount</p><p className="text-base font-bold text-green-600">₹{(selectedPurchase.paid_amount || 0).toLocaleString('en-IN')}</p></div>
//                 <div className="bg-red-50 p-3 rounded-lg text-center"><p className="text-[10px] text-gray-600">Balance Due</p><p className="text-base font-bold text-red-600">₹{(selectedPurchase.balance_amount || selectedPurchase.total_amount).toLocaleString('en-IN')}</p></div>
//               </div>

//               {selectedPurchase.payment_method && (
//                 <div className="bg-gray-50 p-3 rounded-lg">
//                   <p className="text-[10px] text-gray-500 mb-1">Payment Information</p>
//                   <div className="grid grid-cols-2 gap-2 text-xs">
//                     <div><span className="text-gray-600">Method:</span><span className="ml-2 font-semibold">{selectedPurchase.payment_method}</span></div>
//                     {selectedPurchase.paid_by && <div><span className="text-gray-600">Paid By:</span><span className="ml-2 font-semibold">{selectedPurchase.paid_by}</span></div>}
//                     {selectedPurchase.payment_reference && <div className="col-span-2"><span className="text-gray-600">Reference:</span><span className="ml-2 font-semibold">{selectedPurchase.payment_reference}</span></div>}
//                   </div>
//                 </div>
//               )}

//               {selectedPurchase.notes && (
//                 <div className="bg-amber-50 p-3 rounded-lg"><p className="text-[10px] text-gray-500 mb-1">Notes</p><p className="text-xs">{selectedPurchase.notes}</p></div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }



import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Package, Plus, Trash2, Loader2, X, Download,
  Building, IndianRupee, StickyNote, RefreshCw, Filter,
  AlertTriangle, TrendingDown, Boxes, Eye, Printer
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogClose,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  getPurchases,
  createPurchase,
  addPayment,
  deletePurchase,
  bulkDeletePurchases,
  getPurchaseStats,
  MaterialPurchase as MaterialPurchaseType,
  PurchaseItem,
  CreatePurchasePayload,
  AddPaymentPayload
} from "@/lib/materialPurchaseApi";
import { listProperties } from "@/lib/propertyApi";
import { getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
import Swal from 'sweetalert2';

interface Property {
  id: string;
  name: string;
}

interface MasterCategory {
  id: string;
  name: string;
}

type PaymentStatus = 'all' | 'Pending' | 'Partial' | 'Paid';

// Style tokens
const F = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";
const SI = "text-[11px] py-0.5";

const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
    {icon}{title}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <Card className={`${bg} border-0 shadow-sm`}>
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

export function MaterialPurchase() {
  const [purchases, setPurchases] = useState<MaterialPurchaseType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<MaterialPurchaseType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [stats, setStats] = useState({
    total_purchases: 0,
    total_amount: 0,
    total_paid: 0,
    total_balance: 0,
    pending_count: 0,
    partial_count: 0,
    paid_count: 0
  });

  // Filters
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  // Column search
  const [colSearch, setColSearch] = useState({
    invoice: '', vendor: '', property: '', amount: '', status: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    purchase_date: new Date().toISOString().split('T')[0],
    vendor_name: '',
    vendor_phone: '',
    invoice_number: '',
    property_id: '',
    property_name: '',
    notes: ''
  });

  const [lineItems, setLineItems] = useState<PurchaseItem[]>([{
    item_name: '',
    category: '',
    quantity: 0,
    unit_price: 0,
    total_price: 0,
    notes: ''
  }]);

  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    payment_method: 'Cash',
    payment_reference: '',
    paid_by: '',
    payment_notes: ''
  });

  // Selection
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());

  // Load categories from master
  const loadCategories = useCallback(async () => {
    try {
      const res = await getMasterItemsByTab('Properties');
      const list = Array.isArray(res.data) ? res.data : [];
      const catItem = list.find((i: any) => i.name?.toLowerCase() === 'category');
      if (!catItem) return;
      const vRes = await getMasterValues(catItem.id);
      const values = Array.isArray(vRes.data) ? vRes.data : Array.isArray(vRes) ? vRes : [];
      setCategories(
        values
          .filter((v: any) => v.isactive === 1 || v.is_active === 1)
          .map((v: any) => ({ id: String(v.id), name: v.value || v.name || '' }))
      );
    } catch (err) {
      console.error('Could not load categories:', err);
    }
  }, []);

  // Load properties
  const loadProperties = useCallback(async () => {
    try {
      const res = await listProperties({ is_active: true });
      const list = res?.data?.data || res?.data || (res as any)?.results || [];
      const arr = Array.isArray(list) ? list : Object.values(list);
      setProperties(arr.map((p: any) => ({ id: String(p.id), name: p.name })));
    } catch (err) {
      console.error('Could not load properties:', err);
    }
  }, []);

  // Load purchases and stats
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (propertyFilter !== 'all') filters.property_id = propertyFilter;
      if (statusFilter !== 'all') filters.payment_status = statusFilter;
      if (dateFilter.from) filters.from_date = dateFilter.from;
      if (dateFilter.to) filters.to_date = dateFilter.to;

      const [purchasesRes, statsRes] = await Promise.all([
        getPurchases(filters),
        getPurchaseStats()
      ]);

      console.log('API Response:', purchasesRes);

      // Ensure items are properly parsed
      const purchasesData = purchasesRes.data || [];
      purchasesData.forEach(p => {
        // 🔥 Parse items if it's a string
        if (p.items) {
          if (typeof p.items === 'string') {
            try {
              p.purchase_items = JSON.parse(p.items);
            } catch (e) {
              console.error('Error parsing items JSON:', e);
              p.purchase_items = [];
            }
          } else if (Array.isArray(p.items)) {
            p.purchase_items = p.items;
          }
        } else {
          p.purchase_items = [];
        }
      });

      setPurchases(purchasesData);
      setStats(statsRes.data || stats);
    } catch (err: any) {
      console.error('Error loading purchases:', err);
      toast.error(err.message || 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  }, [propertyFilter, statusFilter, dateFilter]);

  useEffect(() => { 
    loadCategories(); 
    loadProperties(); 
  }, []);
  
  useEffect(() => { 
    loadAll(); 
  }, [loadAll]);

  // Filtered items with column search
  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const cs = colSearch;
      const invOk = !cs.invoice || p.invoice_number?.toLowerCase().includes(cs.invoice.toLowerCase());
      const venOk = !cs.vendor || p.vendor_name?.toLowerCase().includes(cs.vendor.toLowerCase());
      const propOk = !cs.property || (p.property_name || '').toLowerCase().includes(cs.property.toLowerCase());
      const amtOk = !cs.amount || String(p.total_amount).includes(cs.amount);
      const statOk = !cs.status || p.payment_status?.toLowerCase().includes(cs.status.toLowerCase());
      return invOk && venOk && propOk && amtOk && statOk;
    });
  }, [purchases, colSearch]);

  // Form calculations
  const getTotalAmount = () => {
    return lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      item_name: '',
      category: '',
      quantity: 0,
      unit_price: 0,
      total_price: 0,
      notes: ''
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    const updated = [...lineItems];
    updated.splice(index, 1);
    setLineItems(updated);
  };

  const updateLineItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total_price = (updated[index].quantity || 0) * (updated[index].unit_price || 0);
    }

    setLineItems(updated);
  };

  // CRUD Operations
  const openAdd = () => {
    setFormData({
      purchase_date: new Date().toISOString().split('T')[0],
      vendor_name: '',
      vendor_phone: '',
      invoice_number: '',
      property_id: '',
      property_name: '',
      notes: ''
    });
    setLineItems([{
      item_name: '',
      category: '',
      quantity: 0,
      unit_price: 0,
      total_price: 0,
      notes: ''
    }]);
    setShowForm(true);
  };

  const handleViewDetails = (purchase: MaterialPurchaseType) => {
    console.log('Viewing purchase:', purchase);
    
    // 🔥 Ensure purchase_items is properly set
    if (!purchase.purchase_items && purchase.items) {
      if (typeof purchase.items === 'string') {
        try {
          purchase.purchase_items = JSON.parse(purchase.items);
        } catch (e) {
          console.error('Error parsing items in handleViewDetails:', e);
          purchase.purchase_items = [];
        }
      } else if (Array.isArray(purchase.items)) {
        purchase.purchase_items = purchase.items;
      }
    }
    
    // 🔥 Agar purchase_items abhi bhi undefined hai to items se try karo
    if (!purchase.purchase_items && purchase.items) {
      purchase.purchase_items = purchase.items as any;
    }
    
    console.log('Purchase items after parsing:', purchase.purchase_items);
    
    setSelectedPurchase(purchase);
    setShowDetailsModal(true);
  };

  const handleAddPayment = (purchase: MaterialPurchaseType) => {
    setSelectedPurchase(purchase);
    const remaining = (purchase.balance_amount || purchase.total_amount) || 0;
    setPaymentData({
      payment_date: new Date().toISOString().split('T')[0],
      amount: remaining,
      payment_method: 'Cash',
      payment_reference: '',
      paid_by: '',
      payment_notes: ''
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPurchase = async () => {
    if (!formData.vendor_name || !formData.invoice_number || !formData.property_id) {
      toast.error('Vendor name, invoice number, and property are required');
      return;
    }

    if (lineItems.length === 0 || lineItems.some(item => !item.item_name || item.quantity <= 0)) {
      toast.error('Please add at least one valid item');
      return;
    }

    setSubmitting(true);
    try {
      const totalAmount = getTotalAmount();
      const itemsSummary = lineItems.map(item => `${item.item_name} (${item.quantity})`).join(', ');

      const selectedProperty = properties.find(p => p.id === formData.property_id);

      const payload: CreatePurchasePayload = {
        purchase_date: formData.purchase_date,
        vendor_name: formData.vendor_name,
        vendor_phone: formData.vendor_phone,
        invoice_number: formData.invoice_number,
        property_id: parseInt(formData.property_id),
        property_name: selectedProperty?.name || formData.property_name,
        notes: formData.notes,
        items: lineItems,
        items_summary: itemsSummary,
        total_amount: totalAmount,
        paid_amount: 0
      };

      const response = await createPurchase(payload);
      console.log('Create response:', response);
      
      setShowForm(false);
      await loadAll();
      toast.success('Purchase created successfully');
    } catch (err: any) {
      console.error('Error creating purchase:', err);
      toast.error(err.message || 'Failed to create purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedPurchase) return;

    const remaining = (selectedPurchase.balance_amount || selectedPurchase.total_amount) || 0;
    if (paymentData.amount > remaining) {
      toast.error(`Payment amount cannot exceed remaining balance: ₹${remaining.toLocaleString('en-IN')}`);
      return;
    }

    setSubmitting(true);
    try {
      const payload: AddPaymentPayload = {
        payment_date: paymentData.payment_date,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        paid_by: paymentData.paid_by,
        payment_reference: paymentData.payment_reference,
        payment_notes: paymentData.payment_notes
      };

      await addPayment(selectedPurchase.id, payload);
      setShowPaymentModal(false);
      await loadAll();
      toast.success(`Payment of ₹${paymentData.amount.toLocaleString('en-IN')} added successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number, invoiceNumber?: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete purchase "${invoiceNumber || id}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: `rgba(0,0,0,0.4)`,
      width: '400px',
      padding: '1.5rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-bold text-gray-800',
        htmlContainer: 'text-sm text-gray-600 my-2',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
        actions: 'flex justify-center gap-2 mt-4'
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await deletePurchase(id);
      await loadAll();
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Purchase has been deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-green-600',
          htmlContainer: 'text-xs text-gray-600'
        }
      });
    } catch (err: any) {
      console.error('Error deleting purchase:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to delete purchase',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-red-600',
          htmlContainer: 'text-xs text-gray-600',
          confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
        },
        buttonsStyling: false
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      Swal.fire({
        title: 'No items selected',
        text: 'Please select at least one purchase to delete.',
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-blue-600',
          htmlContainer: 'text-xs text-gray-600',
          confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
        },
        buttonsStyling: false
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedItems.size} selected purchase(s). This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: `rgba(0,0,0,0.4)`,
      width: '400px',
      padding: '1.5rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-bold text-gray-800',
        htmlContainer: 'text-sm text-gray-600 my-2',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
        actions: 'flex justify-center gap-2 mt-4'
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await bulkDeletePurchases(Array.from(selectedItems));
      setSelectedItems(new Set());
      await loadAll();
      
      Swal.fire({
        title: 'Deleted!',
        text: `${selectedItems.size} purchase(s) have been deleted successfully.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-green-600',
          htmlContainer: 'text-xs text-gray-600'
        }
      });
    } catch (err: any) {
      console.error('Error bulk deleting purchases:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to delete purchases',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-red-600',
          htmlContainer: 'text-xs text-gray-600',
          confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
        },
        buttonsStyling: false
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredPurchases.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredPurchases.map(p => p.id)));
    }
  };

  const toggleSelectItem = (id: string | number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Export CSV
  const handleExport = () => {
    const headers = ['Date', 'Invoice #', 'Vendor', 'Property', 'Total Amount', 'Paid', 'Balance', 'Status'];
    const rows = filteredPurchases.map(p => [
      new Date(p.purchase_date).toLocaleDateString('en-IN'),
      p.invoice_number,
      p.vendor_name,
      p.property_name,
      p.total_amount,
      p.paid_amount || 0,
      p.balance_amount || p.total_amount,
      p.payment_status
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchases_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // PDF Download - FIXED FORMATTING
 // PDF Download - FIXED FORMATTING
const handleDownloadPDF = (purchase: MaterialPurchaseType) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header with green background
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MATERIAL PURCHASE', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Purchase Order Details', pageWidth / 2, 25, { align: 'center' });

  let yPos = 45;

  // Purchase Info Box
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(14, yPos, pageWidth - 28, 40, 2, 2, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  doc.text('Invoice:', 18, yPos + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(purchase.invoice_number, 45, yPos + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 120, yPos + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(purchase.purchase_date).toLocaleDateString('en-IN'), 140, yPos + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Vendor:', 18, yPos + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(purchase.vendor_name, 45, yPos + 18);
  if (purchase.vendor_phone) {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(purchase.vendor_phone, 45, yPos + 26);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Property:', 120, yPos + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(purchase.property_name, 160, yPos + 18);

  yPos += 50;

  // Items Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Purchase Items', 14, yPos);
  yPos += 5;

  // Get items data - FIXED: Properly parse numbers
  let itemsToShow = purchase.purchase_items;
  if ((!itemsToShow || itemsToShow.length === 0) && purchase.items) {
    if (typeof purchase.items === 'string') {
      try {
        itemsToShow = JSON.parse(purchase.items);
      } catch (e) {
        itemsToShow = [];
      }
    } else if (Array.isArray(purchase.items)) {
      itemsToShow = purchase.items;
    }
  }
  
  // Format numbers properly - ensure they are numbers not strings
  const itemsData = (itemsToShow || []).map((item: any) => {
    // Parse to number first to ensure proper formatting
    const qty = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const totalPrice = Number(item.total_price) || 0;
    
    return [
      item.item_name || '-',
      item.category || '-',
      qty.toString(),
      `Rs. ${unitPrice.toLocaleString('en-IN')}`,
`Rs. ${totalPrice.toLocaleString('en-IN')}`
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Item Name', 'Category', 'Qty', 'Unit Price', 'Total']],
    body: itemsData,
    foot: [[
      '', 
      '', 
      '', 
      'Total Amount:', 
`Rs. ${(Number(purchase.total_amount) || 0).toLocaleString('en-IN')}`
    ]],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], fontSize: 10, textColor: [255, 255, 255] },
    footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontSize: 11, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 40 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    },
    // Add this to ensure numbers are treated as numbers
    didParseCell: function(data) {
      if (data.column.index === 3 || data.column.index === 4) {
        if (data.cell.raw && typeof data.cell.raw === 'string') {
          // Already formatted, keep as is
        }
      }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Payment Summary Box
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14, yPos, pageWidth - 28, 30, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 20, yPos + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rs. ${(Number(purchase.total_amount) || 0).toLocaleString('en-IN')}`
, 60, yPos + 8);

  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.text('Paid:', 20, yPos + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`Rs. ${(Number(purchase.paid_amount) || 0).toLocaleString('en-IN')}`
, 60, yPos + 18);

  doc.setTextColor(239, 68, 68);
  doc.setFont('helvetica', 'bold');
  doc.text('Balance:', 120, yPos + 13);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Rs.${(Number(purchase.balance_amount) || Number(purchase.total_amount) || 0).toLocaleString('en-IN')}`, 160, yPos + 13);

  // Save PDF
  const fileName = `Purchase_${purchase.invoice_number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
};

  // Print function
  const handlePrint = (purchase: MaterialPurchaseType) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print');
      return;
    }

    const itemsToShow = purchase.purchase_items || 
      (typeof purchase.items === 'string' ? JSON.parse(purchase.items) : purchase.items) || [];

    const itemsRows = itemsToShow.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.item_name || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.category || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 0}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹ ${(item.unit_price || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹ ${(item.total_price || 0).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase ${purchase.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0; font-size: 12px; }
          .info-box { background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .info-item .label { font-size: 11px; color: #6b7280; }
          .info-item .value { font-size: 14px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #3b82f6; color: white; padding: 10px; text-align: left; font-size: 12px; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          .total-row { font-weight: bold; background-color: #f3f4f6; }
          .summary { background-color: #eff6ff; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; }
          .summary-item { text-align: center; }
          .summary-item .label { font-size: 11px; color: #4b5563; }
          .summary-item .value { font-size: 16px; font-weight: bold; }
          .paid { color: #10b981; }
          .balance { color: #ef4444; }
          @media print {
            body { margin: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MATERIAL PURCHASE</h1>
          <p>Purchase Order Details</p>
        </div>

        <div class="info-box">
          <div class="info-item">
            <div class="label">Invoice Number</div>
            <div class="value">${purchase.invoice_number}</div>
          </div>
          <div class="info-item">
            <div class="label">Purchase Date</div>
            <div class="value">${new Date(purchase.purchase_date).toLocaleDateString('en-IN')}</div>
          </div>
          <div class="info-item">
            <div class="label">Vendor</div>
            <div class="value">${purchase.vendor_name}${purchase.vendor_phone ? `<br><small>${purchase.vendor_phone}</small>` : ''}</div>
          </div>
          <div class="info-item">
            <div class="label">Property</div>
            <div class="value">${purchase.property_name}</div>
          </div>
        </div>

        <h3 style="margin-bottom: 10px;">Purchase Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="4" style="text-align: right; padding: 8px;">Total Amount:</td>
              <td style="text-align: right; padding: 8px;">₹ ${purchase.total_amount.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <div class="summary">
          <div class="summary-item">
            <div class="label">Total</div>
            <div class="value">₹ ${purchase.total_amount.toLocaleString('en-IN')}</div>
          </div>
          <div class="summary-item">
            <div class="label">Paid</div>
            <div class="value paid">₹ ${(purchase.paid_amount || 0).toLocaleString('en-IN')}</div>
          </div>
          <div class="summary-item">
            <div class="label">Balance</div>
            <div class="value balance">₹ ${(purchase.balance_amount || purchase.total_amount).toLocaleString('en-IN')}</div>
          </div>
        </div>

        ${purchase.notes ? `
          <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 5px;">Notes</div>
            <div style="font-size: 12px;">${purchase.notes}</div>
          </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #9ca3af;">
          Generated on ${new Date().toLocaleString('en-IN')}
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">Print</button>
          <button onclick="window.close()" style="padding: 10px 20px; background-color: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-700 text-[9px] px-1.5">Paid</Badge>;
      case 'Partial':
        return <Badge className="bg-orange-100 text-orange-700 text-[9px] px-1.5">Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-700 text-[9px] px-1.5">Pending</Badge>;
    }
  };

  const hasColSearch = Object.values(colSearch).some(v => v !== '');
  const hasFilters = propertyFilter !== 'all' || statusFilter !== 'all' || dateFilter.from || dateFilter.to;
  const activeFilterCount = [
    propertyFilter !== 'all',
    statusFilter !== 'all',
    !!dateFilter.from,
    !!dateFilter.to
  ].filter(Boolean).length;

  const clearFilters = () => {
    setPropertyFilter('all');
    setStatusFilter('all');
    setDateFilter({ from: '', to: '' });
  };

  const clearColSearch = () => setColSearch({
    invoice: '', vendor: '', property: '', amount: '', status: ''
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20">
        <div className="px-3 sm:px-5 pt-3 pb-2 flex items-end justify-end gap-2">
          <div className="flex items-end justify-end gap-1.5 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className={`
                inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
                ${sidebarOpen || hasFilters
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
              `}
            >
              <Filter className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className={`
                  h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center flex-shrink-0
                  ${sidebarOpen || hasFilters ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}
                `}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button onClick={handleExport} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium transition-colors">
              <Download className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button onClick={loadAll} disabled={loading} className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button onClick={openAdd} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm transition-colors">
              <Plus className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">Add Purchase</span>
            </button>
          </div>
        </div>

        <div className="px-3 sm:px-5 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <StatCard title="Total Purchases" value={stats.total_purchases} icon={Boxes} color="bg-blue-600" bg="bg-gradient-to-br from-blue-50 to-blue-100" />
            <StatCard title="Total Amount" value={`₹${Number(stats.total_amount || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="bg-green-600" bg="bg-gradient-to-br from-green-50 to-green-100" />
            <StatCard title="Total Paid" value={`₹${Number(stats.total_paid || 0).toLocaleString('en-IN')}`} icon={TrendingDown} color="bg-orange-600" bg="bg-gradient-to-br from-orange-50 to-orange-100" />
            <StatCard title="Balance Due" value={`₹${Number(stats.total_balance || 0).toLocaleString('en-IN')}`} icon={AlertTriangle} color="bg-red-600" bg="bg-gradient-to-br from-red-50 to-red-100" />
          </div>
        </div>
      </div>

      <div className="relative">
        <main className="p-3 sm:p-4">
          <Card className="border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
              <span className="text-sm font-semibold text-gray-700">All Purchases ({filteredPurchases.length})</span>
              {hasColSearch && (
                <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold">Clear Search</button>
              )}
            </div>

            {selectedItems.size > 0 && (
              <div className="p-3 bg-blue-50 border-b flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900">{selectedItems.size} item(s) selected</span>
                <button onClick={handleBulkDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" /> Delete Selected
                </button>
              </div>
            )}

            <div className="overflow-auto max-h-[calc(100vh-320px)]">
              <div className="min-w-[1000px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow>
                      <TableHead className="py-2 px-3 w-8">
                        <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded">
                          {selectedItems.size === filteredPurchases.length && filteredPurchases.length > 0 ?
                            <span className="text-blue-600">✓</span> : <span className="text-gray-400">□</span>}
                        </button>
                      </TableHead>
                      <TableHead className="py-2 px-3 text-xs">Date</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Invoice #</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Vendor</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Property</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Total</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Paid</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Balance</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Status</TableHead>
                      <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
                    </TableRow>

                    <TableRow className="bg-gray-50/80">
                      <TableCell className="py-1 px-2"></TableCell>
                      {[
                        { key: null, ph: '' },
                        { key: 'invoice', ph: 'Search invoice…' },
                        { key: 'vendor', ph: 'Search vendor…' },
                        { key: 'property', ph: 'Search property…' },
                        { key: 'amount', ph: 'Amount…' },
                        { key: null, ph: '' },
                        { key: null, ph: '' },
                        { key: null, ph: '' },
                        { key: 'status', ph: 'Status…' },
                      ].map((col, idx) => (
                        <TableCell key={idx} className="py-1 px-2">
                          {col.key ? (
                            <Input placeholder={col.ph}
                              value={colSearch[col.key as keyof typeof colSearch]}
                              onChange={e => setColSearch(prev => ({ ...prev, [col.key!]: e.target.value }))}
                              className="h-6 text-[10px]"
                            />
                          ) : <div />}
                        </TableCell>
                      ))}
                      <TableCell className="py-1 px-2" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Loading purchases…</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredPurchases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-12">
                          <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">No purchases found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredPurchases.map(purchase => (
                      <TableRow key={purchase.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 px-3">
                          <button onClick={() => toggleSelectItem(purchase.id)} className="p-1 hover:bg-gray-200 rounded">
                            {selectedItems.has(purchase.id) ? <span className="text-blue-600">✓</span> : <span className="text-gray-400">□</span>}
                          </button>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs">{new Date(purchase.purchase_date).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell className="py-2 px-3 text-xs font-medium">{purchase.invoice_number}</TableCell>
                        <TableCell className="py-2 px-3 text-xs">{purchase.vendor_name}{purchase.vendor_phone && <div className="text-[9px] text-gray-500">{purchase.vendor_phone}</div>}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[150px] truncate">{purchase.property_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs font-semibold">₹{purchase.total_amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-green-600">₹{(purchase.paid_amount || 0).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="py-2 px-3 text-xs font-semibold text-red-600">₹{(purchase.balance_amount || purchase.total_amount).toLocaleString('en-IN')}</TableCell>
                        <TableCell className="py-2 px-3">{getStatusBadge(purchase.payment_status)}</TableCell>
                        <TableCell className="py-2 px-3">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600" onClick={() => handleViewDetails(purchase)}><Eye className="h-3.5 w-3.5" /></Button>
                            {purchase.payment_status !== 'Paid' && (
                              <Button
                                size="sm"
                                className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                                onClick={() => handleAddPayment(purchase)}
                              >
                                <IndianRupee className="h-3.5 w-3.5" />
                                Pay
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(purchase.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </main>

        {/* Filter Sidebar */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
            <aside className="fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-white" /><span className="text-sm font-semibold text-white">Filters</span>{hasFilters && <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">{activeFilterCount} active</span>}</div>
                <div className="flex items-center gap-2">{hasFilters && <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">Clear all</button>}<button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white"><X className="h-4 w-4" /></button></div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Building className="h-3 w-3 text-indigo-500" /> Property</p>
                  <div className="space-y-1">
                    <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer ${propertyFilter === 'all' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                      <input type="radio" name="property" value="all" checked={propertyFilter === 'all'} onChange={() => setPropertyFilter('all')} className="sr-only" />
                      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === 'all' ? 'bg-blue-500' : 'bg-gray-300'}`} /><span className="text-[12px] font-medium">All Properties</span>
                    </label>
                    {properties.map(p => (
                      <label key={p.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer ${propertyFilter === p.id ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                        <input type="radio" name="property" value={p.id} checked={propertyFilter === p.id} onChange={() => setPropertyFilter(p.id)} className="sr-only" />
                        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === p.id ? 'bg-blue-500' : 'bg-gray-300'}`} /><span className="text-[12px] font-medium truncate">{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><TrendingDown className="h-3 w-3 text-orange-500" /> Payment Status</p>
                  <div className="space-y-1">
                    {[
                      { val: 'all', label: 'All Status', dot: 'bg-gray-400' },
                      { val: 'Pending', label: 'Pending', dot: 'bg-red-500' },
                      { val: 'Partial', label: 'Partial', dot: 'bg-orange-500' },
                      { val: 'Paid', label: 'Paid', dot: 'bg-green-500' },
                    ].map(opt => (
                      <label key={opt.val} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer ${statusFilter === opt.val ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                        <input type="radio" name="status" value={opt.val} checked={statusFilter === opt.val} onChange={() => setStatusFilter(opt.val as PaymentStatus)} className="sr-only" />
                        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${opt.dot}`} /><span className="text-[12px] font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Date Range</p>
                  <div className="space-y-2">
                    <div><label className="text-[10px] text-gray-500 mb-1 block">From</label><Input type="date" value={dateFilter.from} onChange={e => setDateFilter(prev => ({ ...prev, from: e.target.value }))} className="h-7 text-[10px]" /></div>
                    <div><label className="text-[10px] text-gray-500 mb-1 block">To</label><Input type="date" value={dateFilter.to} onChange={e => setDateFilter(prev => ({ ...prev, to: e.target.value }))} className="h-7 text-[10px]" /></div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
                <button onClick={clearFilters} disabled={!hasFilters} className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40">Clear All</button>
                <button onClick={() => setSidebarOpen(false)} className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-indigo-700">Apply & Close</button>
              </div>
            </aside>
          </>
        )}
      </div>

      {/* Add Purchase Dialog */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">New Material Purchase</h2>
              <p className="text-xs text-blue-100">Fill in the purchase details</p>
            </div>
            <DialogClose asChild>
              <button className="p-1.5 rounded-full hover:bg-white/20 transition">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>

          <div className="p-4 overflow-y-auto max-h-[75vh] space-y-5">
            {/* Basic Info */}
            <div>
              <SH icon={<Package className="h-3 w-3" />} title="Purchase Info" />
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                <div>
                  <label className={L}>Vendor Name <span className="text-red-400">*</span></label>
                  <Input className={F} placeholder="Vendor name"
                    value={formData.vendor_name}
                    onChange={e => setFormData({ ...formData, vendor_name: e.target.value })} />
                </div>
                <div>
                  <label className={L}>Vendor Phone</label>
                  <Input className={F} placeholder="Phone number"
                    value={formData.vendor_phone}
                    maxLength={10}
                    onChange={e => setFormData({ ...formData, vendor_phone: e.target.value })} />
                </div>
                
                {/* Teen columns ek row mein - Purchase Date, Invoice Number, Property */}
                <div className="col-span-2 grid grid-cols-3 gap-3">
                  <div>
                    <label className={L}>Purchase Date <span className="text-red-400">*</span></label>
                    <Input type="date" className={F}
                      value={formData.purchase_date}
                      onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} />
                  </div>
                  <div>
                    <label className={L}>Invoice Number <span className="text-red-400">*</span></label>
                    <Input className={F} placeholder="INV-001"
                      value={formData.invoice_number}
                      onChange={e => setFormData({ ...formData, invoice_number: e.target.value })} />
                  </div>
                <div>
  <label className={L}>Property <span className="text-red-400">*</span></label>
  <Select 
    value={formData.property_id}
    onValueChange={v => {
      const selected = properties.find(p => p.id === v);
      setFormData(p => ({ ...p, property_id: v, property_name: selected?.name || '' }));
      setPropertySearchTerm(''); // Clear search after selection
    }}
  >
    <SelectTrigger className={F}>
      <Building className="h-3 w-3 text-gray-400 mr-1.5" />
      <SelectValue placeholder="Select property" />
    </SelectTrigger>
    <SelectContent className="max-h-[300px]">
      {/* Search input */}
      <div className="sticky top-0 bg-white p-2 border-b z-10">
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            placeholder="Search properties..."
            className="pl-7 h-7 text-xs"
            value={propertySearchTerm}
            onChange={(e) => setPropertySearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      
      {/* Properties list */}
      <div className="py-1">
        {properties
          .filter(p => p.name.toLowerCase().includes(propertySearchTerm.toLowerCase()))
          .map(p => (
            <SelectItem key={p.id} value={p.id} className={SI}>
              {p.name}
            </SelectItem>
          ))}
        
        {/* Show message if no results */}
        {properties.filter(p => 
          p.name.toLowerCase().includes(propertySearchTerm.toLowerCase())
        ).length === 0 && (
          <div className="px-2 py-3 text-center">
            <p className="text-xs text-gray-400">No properties found</p>
          </div>
        )}
      </div>
    </SelectContent>
  </Select>
</div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <SH icon={<Boxes className="h-3 w-3" />} title="Purchase Items" />
                <Button type="button" size="sm" variant="outline"
                  onClick={addLineItem}
                  className="h-7 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div key={index}>
                    {/* Desktop View */}
                    <div className="hidden md:grid grid-cols-12 gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="col-span-3">
                        <Input placeholder="Item name *"
                          value={item.item_name}
                          onChange={e => updateLineItem(index, 'item_name', e.target.value)}
                          className="h-7 text-[10px]" />
                      </div>
                      <div className="col-span-2">
                        <Select value={item.category} onValueChange={v => updateLineItem(index, 'category', v)}>
                          <SelectTrigger className="h-7 text-[10px]">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(c => (
                              <SelectItem key={c.id} value={c.name} className="text-[10px]">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity || ''}
                          onChange={e => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          className="h-7 text-[10px]" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" min="0" step="0.01" placeholder="Price"
                          value={item.unit_price || ''}
                          onChange={e => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="h-7 text-[10px]" />
                      </div>
                      <div className="col-span-2">
                        <div className="h-7 px-2 bg-blue-100 rounded-md flex items-center text-[10px] font-semibold text-blue-700">
                          ₹{(item.total_price || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <button onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-100 disabled:opacity-30">
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Item Name <span className="text-red-400">*</span>
                          </label>
                          <Input 
                            placeholder="Item name"
                            value={item.item_name}
                            onChange={e => updateLineItem(index, 'item_name', e.target.value)}
                            className="h-9 text-[12px] bg-white" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Category
                          </label>
                          <Select value={item.category} onValueChange={v => updateLineItem(index, 'category', v)}>
                            <SelectTrigger className="h-9 text-[12px] bg-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(c => (
                                <SelectItem key={c.id} value={c.name} className="text-[11px]">{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Qty
                          </label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity || ''}
                            onChange={e => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="h-9 text-[12px] bg-white" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Price (₹)
                          </label>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="Price"
                            value={item.unit_price || ''}
                            onChange={e => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="h-9 text-[12px] bg-white" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 items-center">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                            Total
                          </label>
                          <div className="h-9 px-3 bg-blue-100 rounded-md flex items-center text-[13px] font-bold text-blue-700">
                            ₹{(item.total_price || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="flex justify-end items-end">
                          <button 
                            onClick={() => removeLineItem(index)}
                            disabled={lineItems.length === 1}
                            className="h-9 w-9 flex items-center justify-center rounded-md bg-red-50 hover:bg-red-100 disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {item.item_name && (
                        <div className="mt-3 pt-2 text-[11px] text-gray-600 border-t border-gray-200">
                          <span className="font-medium">{item.item_name}</span>
                          {item.category && <span> • {item.category}</span>}
                          <br />
                          <span className="text-[10px] text-gray-500">{item.quantity || 0} × ₹{item.unit_price || 0}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{getTotalAmount().toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <SH icon={<StickyNote className="h-3 w-3" />} title="Notes" color="text-amber-600" />
              <Textarea
                className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white min-h-[56px]"
                placeholder="Additional notes..."
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <Button
              disabled={submitting}
              onClick={handleSubmitPurchase}
              className="w-full h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {submitting ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Creating…</>
              ) : 'Create Purchase'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentModal} onOpenChange={v => { if (!v) setShowPaymentModal(false); }}>
        <DialogContent className="max-w-md w-[95vw] p-0">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">Add Payment</h2>
              <p className="text-xs text-green-100">Record payment for purchase</p>
            </div>
            <DialogClose asChild>
              <button className="p-1.5 rounded-full hover:bg-white/20 transition">
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </div>

          <div className="p-4 space-y-4">
            {selectedPurchase && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <div className="text-xs flex justify-between">
                  <span className="text-gray-600">Invoice:</span>
                  <span className="font-semibold">{selectedPurchase.invoice_number}</span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="text-gray-600">Vendor:</span>
                  <span className="font-semibold">{selectedPurchase.vendor_name}</span>
                </div>
                <div className="text-xs flex justify-between">
                  <span className="text-gray-600">Balance Due:</span>
                  <span className="font-semibold text-red-600">
                    ₹{(selectedPurchase.balance_amount || selectedPurchase.total_amount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className={L}>Payment Date *</label>
              <Input type="date" className={F}
                value={paymentData.payment_date}
                onChange={e => setPaymentData({ ...paymentData, payment_date: e.target.value })} />
            </div>

            <div>
              <label className={L}>Amount (₹) *</label>
              <Input type="number" min="0" step="0.01" className={F}
                value={paymentData.amount}
                onChange={e => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })} />
            </div>

            <div>
              <label className={L}>Payment Method *</label>
              <Select value={paymentData.payment_method}
                onValueChange={v => setPaymentData({ ...paymentData, payment_method: v })}>
                <SelectTrigger className={F}>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash" className={SI}>Cash</SelectItem>
                  <SelectItem value="UPI" className={SI}>UPI</SelectItem>
                  <SelectItem value="Bank Transfer" className={SI}>Bank Transfer</SelectItem>
                  <SelectItem value="Cheque" className={SI}>Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className={L}>Paid By *</label>
              <Input className={F} placeholder="Person name"
                value={paymentData.paid_by}
                onChange={e => setPaymentData({ ...paymentData, paid_by: e.target.value })} />
            </div>

            <div>
              <label className={L}>Reference (optional)</label>
              <Input className={F} placeholder="Transaction ID / Cheque no."
                value={paymentData.payment_reference}
                onChange={e => setPaymentData({ ...paymentData, payment_reference: e.target.value })} />
            </div>

            <div>
              <label className={L}>Notes</label>
              <Textarea className="text-[11px] min-h-[56px]"
                placeholder="Payment notes..."
                rows={2}
                value={paymentData.payment_notes}
                onChange={e => setPaymentData({ ...paymentData, payment_notes: e.target.value })} />
            </div>

            <Button
              disabled={submitting}
              onClick={handleSubmitPayment}
              className="w-full h-8 text-[11px] font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              {submitting ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Adding Payment…</>
              ) : 'Add Payment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsModal} onOpenChange={v => { if (!v) setShowDetailsModal(false); }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">Purchase Details</h2>
              <p className="text-xs text-emerald-100">View complete purchase information</p>
            </div>
          <div className="flex items-center gap-2">
  <button 
    onClick={() => selectedPurchase && handleDownloadPDF(selectedPurchase)}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/20 text-white text-[11px] font-medium transition-colors"
  >
    <Download className="h-3.5 w-3.5" />
    <span className="hidden sm:inline"> Download PDF</span>
  </button>
  <button 
    onClick={() => selectedPurchase && handlePrint(selectedPurchase)}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/20 text-white text-[11px] font-medium transition-colors"
  >
    <Printer className="h-3.5 w-3.5" />
    <span className="hidden sm:inline">Print</span>
  </button>
  <DialogClose asChild>
    <button className="p-1.5 rounded-full hover:bg-white/20 transition">
      <X className="h-4 w-4" />
    </button>
  </DialogClose>
</div>
          </div>

          {selectedPurchase && (
            <div className="p-4 overflow-y-auto max-h-[75vh] space-y-5">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[10px] text-gray-500">Invoice Number</p><p className="text-sm font-bold">{selectedPurchase.invoice_number}</p></div>
                  <div><p className="text-[10px] text-gray-500">Purchase Date</p><p className="text-sm font-bold">{new Date(selectedPurchase.purchase_date).toLocaleDateString('en-IN')}</p></div>
                  <div><p className="text-[10px] text-gray-500">Vendor</p><p className="text-sm font-bold">{selectedPurchase.vendor_name}{selectedPurchase.vendor_phone && <p className="text-[10px] text-gray-600">{selectedPurchase.vendor_phone}</p>}</p></div>
                  <div><p className="text-[10px] text-gray-500">Property</p><p className="text-sm font-bold">{selectedPurchase.property_name}</p></div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 mb-2">Purchase Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Item Name</th>
                        <th className="px-3 py-2 text-left">Category</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Unit Price</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let itemsToShow = selectedPurchase?.purchase_items;
                        
                        if ((!itemsToShow || itemsToShow.length === 0) && selectedPurchase?.items) {
                          if (typeof selectedPurchase.items === 'string') {
                            try {
                              itemsToShow = JSON.parse(selectedPurchase.items);
                            } catch (e) {
                              itemsToShow = [];
                            }
                          } else if (Array.isArray(selectedPurchase.items)) {
                            itemsToShow = selectedPurchase.items;
                          }
                        }
                        
                        return itemsToShow && itemsToShow.length > 0 ? (
                          itemsToShow.map((item, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-3 py-2 font-medium">{item.item_name || '-'}</td>
                              <td className="px-3 py-2">{item.category || '-'}</td>
                              <td className="px-3 py-2 text-center">{item.quantity || 0}</td>
                              <td className="px-3 py-2 text-right">₹{(item.unit_price || 0).toLocaleString('en-IN')}</td>
                              <td className="px-3 py-2 text-right font-semibold">₹{(item.total_price || 0).toLocaleString('en-IN')}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                              No items found
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-right font-bold">Total:</td>
                        <td className="px-3 py-2 text-right font-bold text-blue-600">
                          ₹{(selectedPurchase?.total_amount || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center"><p className="text-[10px] text-gray-600">Total Amount</p><p className="text-base font-bold">₹{selectedPurchase.total_amount.toLocaleString('en-IN')}</p></div>
                <div className="bg-green-50 p-3 rounded-lg text-center"><p className="text-[10px] text-gray-600">Paid Amount</p><p className="text-base font-bold text-green-600">₹{(selectedPurchase.paid_amount || 0).toLocaleString('en-IN')}</p></div>
                <div className="bg-red-50 p-3 rounded-lg text-center"><p className="text-[10px] text-gray-600">Balance Due</p><p className="text-base font-bold text-red-600">₹{(selectedPurchase.balance_amount || selectedPurchase.total_amount).toLocaleString('en-IN')}</p></div>
              </div>

              {selectedPurchase.payment_method && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-500 mb-1">Payment Information</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-600">Method:</span><span className="ml-2 font-semibold">{selectedPurchase.payment_method}</span></div>
                    {selectedPurchase.paid_by && <div><span className="text-gray-600">Paid By:</span><span className="ml-2 font-semibold">{selectedPurchase.paid_by}</span></div>}
                    {selectedPurchase.payment_reference && <div className="col-span-2"><span className="text-gray-600">Reference:</span><span className="ml-2 font-semibold">{selectedPurchase.payment_reference}</span></div>}
                  </div>
                </div>
              )}

              {selectedPurchase.notes && (
                <div className="bg-amber-50 p-3 rounded-lg"><p className="text-[10px] text-gray-500 mb-1">Notes</p><p className="text-xs">{selectedPurchase.notes}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}