// // import { useEffect, useState } from 'react';
// // import { Link } from 'react-router-dom';
// // import { Package, ShoppingCart, ClipboardCheck, AlertTriangle, TrendingUp, BarChart3, DollarSign, Activity } from 'lucide-react';
// // import { supabase } from '../../lib/supabase';

// // interface DashboardStats {
// //   totalAssets: number;
// //   allocatedAssets: number;
// //   inStockAssets: number;
// //   maintenanceAssets: number;
// //   damagedAssets: number;
// //   totalValue: number;
// //   totalPurchases: number;
// //   purchasesThisMonth: number;
// //   totalPurchaseValue: number;
// //   activeHandovers: number;
// //   pendingInspections: number;
// //   pendingSettlements: number;
// //   totalCategories: number;
// //   totalItems: number;
// // }

// // interface RecentActivity {
// //   id: string;
// //   type: 'purchase' | 'handover' | 'inspection' | 'settlement';
// //   description: string;
// //   amount?: number;
// //   date: string;
// // }

// // export function InventoryDashboard() {
// //   const [stats, setStats] = useState<DashboardStats>({
// //     totalAssets: 0,
// //     allocatedAssets: 0,
// //     inStockAssets: 0,
// //     maintenanceAssets: 0,
// //     damagedAssets: 0,
// //     totalValue: 0,
// //     totalPurchases: 0,
// //     purchasesThisMonth: 0,
// //     totalPurchaseValue: 0,
// //     activeHandovers: 0,
// //     pendingInspections: 0,
// //     pendingSettlements: 0,
// //     totalCategories: 0,
// //     totalItems: 0
// //   });
// //   const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     loadDashboardData();
// //   }, []);

// //   const loadDashboardData = async () => {
// //     try {
// //       const [assets, purchases, handovers, inspections, settlements, categories, items] = await Promise.all([
// //         supabase.from('assets').select('*'),
// //         supabase.from('material_purchases').select('*'),
// //         supabase.from('tenant_handovers').select('*').eq('status', 'Pending'),
// //         supabase.from('moveout_inspections').select('*'),
// //         supabase.from('tenant_settlements').select('*').eq('status', 'Pending'),
// //         supabase.from('inventory_categories').select('id', { count: 'exact', head: true }),
// //         supabase.from('inventory_items').select('id', { count: 'exact', head: true })
// //       ]);

// //       const assetData = assets.data || [];
// //       const purchaseData = purchases.data || [];

// //       const thisMonth = new Date();
// //       thisMonth.setDate(1);
// //       const purchasesThisMonth = purchaseData.filter(p => new Date(p.purchase_date) >= thisMonth).length;

// //       setStats({
// //         totalAssets: assetData.length,
// //         allocatedAssets: assetData.filter(a => a.status === 'Allocated').length,
// //         inStockAssets: assetData.filter(a => a.status === 'In Stock').length,
// //         maintenanceAssets: assetData.filter(a => a.status === 'Maintenance').length,
// //         damagedAssets: assetData.filter(a => a.condition === 'Damaged').length,
// //         totalValue: assetData.reduce((sum, a) => sum + (a.purchase_price || 0), 0),
// //         totalPurchases: purchaseData.length,
// //         purchasesThisMonth,
// //         totalPurchaseValue: purchaseData.reduce((sum, p) => sum + (p.total_amount || 0), 0),
// //         activeHandovers: handovers.data?.length || 0,
// //         pendingInspections: inspections.data?.filter(i => i.status === 'Pending').length || 0,
// //         pendingSettlements: settlements.data?.length || 0,
// //         totalCategories: categories.count || 0,
// //         totalItems: items.count || 0
// //       });

// //       const activities: RecentActivity[] = [];

// //       purchaseData.slice(0, 3).forEach(p => {
// //         activities.push({
// //           id: p.id,
// //           type: 'purchase',
// //           description: `Material purchase from ${p.vendor_name}`,
// //           amount: p.total_amount,
// //           date: p.created_at
// //         });
// //       });

// //       inspections.data?.slice(0, 2).forEach(i => {
// //         activities.push({
// //           id: i.id,
// //           type: 'inspection',
// //           description: `Move-out inspection completed`,
// //           amount: i.total_damage_cost,
// //           date: i.created_at
// //         });
// //       });

// //       activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
// //       setRecentActivity(activities.slice(0, 5));

// //     } catch (error) {
// //       console.error('Error loading dashboard:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (loading) {
// //     return <div className="flex items-center justify-center h-64"><div className="text-gray-600 font-semibold">Loading dashboard...</div></div>;
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div>
// //         <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
// //           Inventory Dashboard
// //         </h1>
// //         <p className="text-gray-600 font-semibold mt-1">Complete overview of inventory and assets</p>
// //       </div>

// //       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
// //         <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
// //           <div className="flex items-center justify-between mb-3">
// //             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
// //               <Package className="w-6 h-6 text-white" />
// //             </div>
// //             <TrendingUp className="w-5 h-5 text-emerald-600" />
// //           </div>
// //           <div className="text-sm font-bold text-gray-600">Total Assets</div>
// //           <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalAssets}</div>
// //           <div className="text-xs font-semibold text-gray-500 mt-2">₹{stats.totalValue.toFixed(0)} total value</div>
// //         </Link>

// //         <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
// //           <div className="flex items-center justify-between mb-3">
// //             <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
// //               <ClipboardCheck className="w-6 h-6 text-white" />
// //             </div>
// //             <Activity className="w-5 h-5 text-blue-600" />
// //           </div>
// //           <div className="text-sm font-bold text-gray-600">Asset Status</div>
// //           <div className="grid grid-cols-2 gap-2 mt-2">
// //             <div>
// //               <div className="text-xs font-bold text-gray-500">Allocated</div>
// //               <div className="text-lg font-black text-emerald-600">{stats.allocatedAssets}</div>
// //             </div>
// //             <div>
// //               <div className="text-xs font-bold text-gray-500">In Stock</div>
// //               <div className="text-lg font-black text-blue-600">{stats.inStockAssets}</div>
// //             </div>
// //           </div>
// //         </Link>

// //         <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
// //           <div className="flex items-center justify-between mb-3">
// //             <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
// //               <AlertTriangle className="w-6 h-6 text-white" />
// //             </div>
// //           </div>
// //           <div className="text-sm font-bold text-gray-600">Needs Attention</div>
// //           <div className="grid grid-cols-2 gap-2 mt-2">
// //             <div>
// //               <div className="text-xs font-bold text-gray-500">Maintenance</div>
// //               <div className="text-lg font-black text-amber-600">{stats.maintenanceAssets}</div>
// //             </div>
// //             <div>
// //               <div className="text-xs font-bold text-gray-500">Damaged</div>
// //               <div className="text-lg font-black text-red-600">{stats.damagedAssets}</div>
// //             </div>
// //           </div>
// //         </Link>

// //         <Link to="/inventory/purchase" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
// //           <div className="flex items-center justify-between mb-3">
// //             <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
// //               <ShoppingCart className="w-6 h-6 text-white" />
// //             </div>
// //             <BarChart3 className="w-5 h-5 text-purple-600" />
// //           </div>
// //           <div className="text-sm font-bold text-gray-600">Purchases</div>
// //           <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalPurchases}</div>
// //           <div className="text-xs font-semibold text-gray-500 mt-2">{stats.purchasesThisMonth} this month</div>
// //         </Link>
// //       </div>

// //       <div className="grid md:grid-cols-3 gap-4">
// //         <Link to="/inventory/handover" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
// //           <div className="flex items-center gap-3">
// //             <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
// //               <ClipboardCheck className="w-5 h-5 text-blue-600" />
// //             </div>
// //             <div>
// //               <div className="text-sm font-bold text-gray-600">Active Handovers</div>
// //               <div className="text-2xl font-black text-gray-900">{stats.activeHandovers}</div>
// //             </div>
// //           </div>
// //         </Link>

// //         <Link to="/inventory/inspection" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
// //           <div className="flex items-center gap-3">
// //             <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
// //               <AlertTriangle className="w-5 h-5 text-amber-600" />
// //             </div>
// //             <div>
// //               <div className="text-sm font-bold text-gray-600">Pending Inspections</div>
// //               <div className="text-2xl font-black text-gray-900">{stats.pendingInspections}</div>
// //             </div>
// //           </div>
// //         </Link>

// //         <Link to="/inventory/settlements" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
// //           <div className="flex items-center gap-3">
// //             <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
// //               <DollarSign className="w-5 h-5 text-emerald-600" />
// //             </div>
// //             <div>
// //               <div className="text-sm font-bold text-gray-600">Pending Settlements</div>
// //               <div className="text-2xl font-black text-gray-900">{stats.pendingSettlements}</div>
// //             </div>
// //           </div>
// //         </Link>
// //       </div>

// //       <div className="grid lg:grid-cols-2 gap-6">
// //         <div className="glass rounded-xl p-6">
// //           <h2 className="text-xl font-black text-gray-900 mb-4">Financial Overview</h2>
// //           <div className="space-y-4">
// //             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
// //               <div>
// //                 <div className="text-sm font-bold text-gray-600">Total Asset Value</div>
// //                 <div className="text-2xl font-black text-gray-900">₹{stats.totalValue.toFixed(0)}</div>
// //               </div>
// //               <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
// //                 <Package className="w-6 h-6 text-white" />
// //               </div>
// //             </div>
// //             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
// //               <div>
// //                 <div className="text-sm font-bold text-gray-600">Total Purchase Value</div>
// //                 <div className="text-2xl font-black text-gray-900">₹{stats.totalPurchaseValue.toFixed(0)}</div>
// //               </div>
// //               <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
// //                 <ShoppingCart className="w-6 h-6 text-white" />
// //               </div>
// //             </div>
// //             <div className="grid grid-cols-2 gap-4">
// //               <div className="p-3 bg-gray-50 rounded-lg">
// //                 <div className="text-xs font-bold text-gray-600">Categories</div>
// //                 <div className="text-xl font-black text-gray-900">{stats.totalCategories}</div>
// //               </div>
// //               <div className="p-3 bg-gray-50 rounded-lg">
// //                 <div className="text-xs font-bold text-gray-600">Items</div>
// //                 <div className="text-xl font-black text-gray-900">{stats.totalItems}</div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="glass rounded-xl p-6">
// //           <h2 className="text-xl font-black text-gray-900 mb-4">Recent Activity</h2>
// //           <div className="space-y-3">
// //             {recentActivity.length > 0 ? (
// //               recentActivity.map((activity) => (
// //                 <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
// //                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
// //                     activity.type === 'purchase' ? 'bg-purple-100' :
// //                     activity.type === 'handover' ? 'bg-blue-100' :
// //                     activity.type === 'inspection' ? 'bg-amber-100' :
// //                     'bg-emerald-100'
// //                   }`}>
// //                     {activity.type === 'purchase' && <ShoppingCart className="w-5 h-5 text-purple-600" />}
// //                     {activity.type === 'handover' && <ClipboardCheck className="w-5 h-5 text-blue-600" />}
// //                     {activity.type === 'inspection' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
// //                     {activity.type === 'settlement' && <DollarSign className="w-5 h-5 text-emerald-600" />}
// //                   </div>
// //                   <div className="flex-1">
// //                     <div className="text-sm font-bold text-gray-900">{activity.description}</div>
// //                     <div className="text-xs font-semibold text-gray-600">
// //                       {new Date(activity.date).toLocaleDateString()}
// //                     </div>
// //                   </div>
// //                   {activity.amount !== undefined && (
// //                     <div className="text-sm font-black text-gray-900">₹{activity.amount}</div>
// //                   )}
// //                 </div>
// //               ))
// //             ) : (
// //               <div className="text-center py-8 text-gray-500 font-semibold">No recent activity</div>
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
// //         <Link to="/inventory/assets" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all">
// //           <div className="text-sm font-bold text-gray-700">Manage Assets</div>
// //           <div className="text-xs font-semibold text-gray-600 mt-1">Track all property assets</div>
// //         </Link>
// //         <Link to="/inventory/purchase" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
// //           <div className="text-sm font-bold text-gray-700">Material Purchase</div>
// //           <div className="text-xs font-semibold text-gray-600 mt-1">Record new purchases</div>
// //         </Link>
// //         <Link to="/inventory/handover" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all">
// //           <div className="text-sm font-bold text-gray-700">Tenant Handover</div>
// //           <div className="text-xs font-semibold text-gray-600 mt-1">Move-in documentation</div>
// //         </Link>
// //         <Link to="/masters" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all">
// //           <div className="text-sm font-bold text-gray-700">Master Data</div>
// //           <div className="text-xs font-semibold text-gray-600 mt-1">Manage categories & items</div>
// //         </Link>
// //       </div>
// //     </div>
// //   );
// // }
// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Package, ShoppingCart, ClipboardCheck, AlertTriangle, TrendingUp, BarChart3, DollarSign, Activity } from 'lucide-react';

// interface DashboardStats {
//   totalAssets: number;
//   allocatedAssets: number;
//   inStockAssets: number;
//   maintenanceAssets: number;
//   damagedAssets: number;
//   totalValue: number;
//   totalPurchases: number;
//   purchasesThisMonth: number;
//   totalPurchaseValue: number;
//   activeHandovers: number;
//   pendingInspections: number;
//   pendingSettlements: number;
//   totalCategories: number;
//   totalItems: number;
// }

// interface RecentActivity {
//   id: string;
//   type: 'purchase' | 'handover' | 'inspection' | 'settlement';
//   description: string;
//   amount?: number;
//   date: string;
// }

// // Mock data
// const mockStats: DashboardStats = {
//   totalAssets: 156,
//   allocatedAssets: 89,
//   inStockAssets: 42,
//   maintenanceAssets: 18,
//   damagedAssets: 7,
//   totalValue: 4567800,
//   totalPurchases: 234,
//   purchasesThisMonth: 18,
//   totalPurchaseValue: 892500,
//   activeHandovers: 12,
//   pendingInspections: 8,
//   pendingSettlements: 5,
//   totalCategories: 15,
//   totalItems: 342
// };

// const mockRecentActivity: RecentActivity[] = [
//   {
//     id: '1',
//     type: 'purchase',
//     description: 'Material purchase from Krishna Enterprises',
//     amount: 45000,
//     date: '2024-03-15T10:30:00Z'
//   },
//   {
//     id: '2',
//     type: 'inspection',
//     description: 'Move-out inspection completed for Unit 302',
//     amount: 2500,
//     date: '2024-03-14T14:20:00Z'
//   },
//   {
//     id: '3',
//     type: 'handover',
//     description: 'Asset handover to Tenant - Sharma Ji',
//     date: '2024-03-13T11:45:00Z'
//   },
//   {
//     id: '4',
//     type: 'settlement',
//     description: 'Pending settlement for Unit 105',
//     amount: 12500,
//     date: '2024-03-12T09:15:00Z'
//   },
//   {
//     id: '5',
//     type: 'purchase',
//     description: 'Material purchase from Sharma Hardware',
//     amount: 28000,
//     date: '2024-03-11T16:30:00Z'
//   }
// ];

// export function InventoryDashboard() {
//   const [stats, setStats] = useState<DashboardStats>(mockStats);
//   const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Simulate API call
//     const loadDashboardData = async () => {
//       try {
//         // Simulate network delay
//         await new Promise(resolve => setTimeout(resolve, 1000));

//         setStats(mockStats);
//         setRecentActivity(mockRecentActivity);
//       } catch (error) {
//         console.error('Error loading dashboard:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboardData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-gray-600 font-semibold">Loading dashboard...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//           Inventory Dashboard
//         </h1>
//         <p className="text-gray-600 font-semibold mt-1">Complete overview of inventory and assets</p>
//       </div>

//       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
//           <div className="flex items-center justify-between mb-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//               <Package className="w-6 h-6 text-white" />
//             </div>
//             <TrendingUp className="w-5 h-5 text-emerald-600" />
//           </div>
//           <div className="text-sm font-bold text-gray-600">Total Assets</div>
//           <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalAssets}</div>
//           <div className="text-xs font-semibold text-gray-500 mt-2">₹{stats.totalValue.toFixed(0)} total value</div>
//         </Link>

//         <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
//           <div className="flex items-center justify-between mb-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//               <ClipboardCheck className="w-6 h-6 text-white" />
//             </div>
//             <Activity className="w-5 h-5 text-blue-600" />
//           </div>
//           <div className="text-sm font-bold text-gray-600">Asset Status</div>
//           <div className="grid grid-cols-2 gap-2 mt-2">
//             <div>
//               <div className="text-xs font-bold text-gray-500">Allocated</div>
//               <div className="text-lg font-black text-emerald-600">{stats.allocatedAssets}</div>
//             </div>
//             <div>
//               <div className="text-xs font-bold text-gray-500">In Stock</div>
//               <div className="text-lg font-black text-blue-600">{stats.inStockAssets}</div>
//             </div>
//           </div>
//         </Link>

//         <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
//           <div className="flex items-center justify-between mb-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//               <AlertTriangle className="w-6 h-6 text-white" />
//             </div>
//           </div>
//           <div className="text-sm font-bold text-gray-600">Needs Attention</div>
//           <div className="grid grid-cols-2 gap-2 mt-2">
//             <div>
//               <div className="text-xs font-bold text-gray-500">Maintenance</div>
//               <div className="text-lg font-black text-amber-600">{stats.maintenanceAssets}</div>
//             </div>
//             <div>
//               <div className="text-xs font-bold text-gray-500">Damaged</div>
//               <div className="text-lg font-black text-red-600">{stats.damagedAssets}</div>
//             </div>
//           </div>
//         </Link>

//         <Link to="/inventory/purchase" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
//           <div className="flex items-center justify-between mb-3">
//             <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//               <ShoppingCart className="w-6 h-6 text-white" />
//             </div>
//             <BarChart3 className="w-5 h-5 text-purple-600" />
//           </div>
//           <div className="text-sm font-bold text-gray-600">Purchases</div>
//           <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalPurchases}</div>
//           <div className="text-xs font-semibold text-gray-500 mt-2">{stats.purchasesThisMonth} this month</div>
//         </Link>
//       </div>

//       <div className="grid md:grid-cols-3 gap-4">
//         <Link to="/inventory/handover" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//               <ClipboardCheck className="w-5 h-5 text-blue-600" />
//             </div>
//             <div>
//               <div className="text-sm font-bold text-gray-600">Active Handovers</div>
//               <div className="text-2xl font-black text-gray-900">{stats.activeHandovers}</div>
//             </div>
//           </div>
//         </Link>

//         <Link to="/inventory/inspection" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
//               <AlertTriangle className="w-5 h-5 text-amber-600" />
//             </div>
//             <div>
//               <div className="text-sm font-bold text-gray-600">Pending Inspections</div>
//               <div className="text-2xl font-black text-gray-900">{stats.pendingInspections}</div>
//             </div>
//           </div>
//         </Link>

//         <Link to="/inventory/settlements" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
//               <DollarSign className="w-5 h-5 text-emerald-600" />
//             </div>
//             <div>
//               <div className="text-sm font-bold text-gray-600">Pending Settlements</div>
//               <div className="text-2xl font-black text-gray-900">{stats.pendingSettlements}</div>
//             </div>
//           </div>
//         </Link>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-6">
//         <div className="glass rounded-xl p-6">
//           <h2 className="text-xl font-black text-gray-900 mb-4">Financial Overview</h2>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
//               <div>
//                 <div className="text-sm font-bold text-gray-600">Total Asset Value</div>
//                 <div className="text-2xl font-black text-gray-900">₹{stats.totalValue.toFixed(0)}</div>
//               </div>
//               <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
//                 <Package className="w-6 h-6 text-white" />
//               </div>
//             </div>
//             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
//               <div>
//                 <div className="text-sm font-bold text-gray-600">Total Purchase Value</div>
//                 <div className="text-2xl font-black text-gray-900">₹{stats.totalPurchaseValue.toFixed(0)}</div>
//               </div>
//               <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
//                 <ShoppingCart className="w-6 h-6 text-white" />
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="p-3 bg-gray-50 rounded-lg">
//                 <div className="text-xs font-bold text-gray-600">Categories</div>
//                 <div className="text-xl font-black text-gray-900">{stats.totalCategories}</div>
//               </div>
//               <div className="p-3 bg-gray-50 rounded-lg">
//                 <div className="text-xs font-bold text-gray-600">Items</div>
//                 <div className="text-xl font-black text-gray-900">{stats.totalItems}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="glass rounded-xl p-6">
//           <h2 className="text-xl font-black text-gray-900 mb-4">Recent Activity</h2>
//           <div className="space-y-3">
//             {recentActivity.length > 0 ? (
//               recentActivity.map((activity) => (
//                 <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'purchase' ? 'bg-purple-100' :
//                     activity.type === 'handover' ? 'bg-blue-100' :
//                       activity.type === 'inspection' ? 'bg-amber-100' :
//                         'bg-emerald-100'
//                     }`}>
//                     {activity.type === 'purchase' && <ShoppingCart className="w-5 h-5 text-purple-600" />}
//                     {activity.type === 'handover' && <ClipboardCheck className="w-5 h-5 text-blue-600" />}
//                     {activity.type === 'inspection' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
//                     {activity.type === 'settlement' && <DollarSign className="w-5 h-5 text-emerald-600" />}
//                   </div>
//                   <div className="flex-1">
//                     <div className="text-sm font-bold text-gray-900">{activity.description}</div>
//                     <div className="text-xs font-semibold text-gray-600">
//                       {new Date(activity.date).toLocaleDateString()}
//                     </div>
//                   </div>
//                   {activity.amount !== undefined && (
//                     <div className="text-sm font-black text-gray-900">₹{activity.amount}</div>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8 text-gray-500 font-semibold">No recent activity</div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Link to="/inventory/assets" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all">
//           <div className="text-sm font-bold text-gray-700">Manage Assets</div>
//           <div className="text-xs font-semibold text-gray-600 mt-1">Track all property assets</div>
//         </Link>
//         <Link to="/inventory/purchase" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
//           <div className="text-sm font-bold text-gray-700">Material Purchase</div>
//           <div className="text-xs font-semibold text-gray-600 mt-1">Record new purchases</div>
//         </Link>
//         <Link to="/inventory/handover" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all">
//           <div className="text-sm font-bold text-gray-700">Tenant Handover</div>
//           <div className="text-xs font-semibold text-gray-600 mt-1">Move-in documentation</div>
//         </Link>
//         <Link to="/masters" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all">
//           <div className="text-sm font-bold text-gray-700">Master Data</div>
//           <div className="text-xs font-semibold text-gray-600 mt-1">Manage categories & items</div>
//         </Link>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, ClipboardCheck, AlertTriangle, TrendingUp, BarChart3, DollarSign, Activity, Loader2 } from 'lucide-react';
import { assetsApi, materialPurchasesApi, tenantHandoversApi, moveoutInspectionsApi, settlementsApi } from '../../lib/inventory';

interface DashboardStats {
  totalAssets: number;
  allocatedAssets: number;
  inStockAssets: number;
  maintenanceAssets: number;
  damagedAssets: number;
  totalPurchases: number;
  purchasesThisMonth: number;
  totalPurchaseValue: number;
  activeHandovers: number;
  pendingInspections: number;
  pendingSettlements: number;
}

export function InventoryDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    allocatedAssets: 0,
    inStockAssets: 0,
    maintenanceAssets: 0,
    damagedAssets: 0,
    totalPurchases: 0,
    purchasesThisMonth: 0,
    totalPurchaseValue: 0,
    activeHandovers: 0,
    pendingInspections: 0,
    pendingSettlements: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assets, purchases, handovers, inspections, settlements] = await Promise.all([
        assetsApi.getAll(),
        materialPurchasesApi.getAll(),
        tenantHandoversApi.getAll(),
        moveoutInspectionsApi.getAll(),
        settlementsApi.getAll()
      ]);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      setStats({
        totalAssets: assets.length,
        allocatedAssets: assets.filter(a => a.status === 'Allocated').length,
        inStockAssets: assets.filter(a => a.status === 'In Stock').length,
        maintenanceAssets: assets.filter(a => a.status === 'Maintenance').length,
        damagedAssets: assets.filter(a => a.condition === 'Damaged').length,
        totalPurchases: purchases.length,
        purchasesThisMonth: purchases.filter(p => {
          const date = new Date(p.purchase_date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length,
        totalPurchaseValue: purchases.reduce((sum, p) => sum + Number(p.total_amount || 0), 0),
        activeHandovers: handovers.filter(h => h.status === 'Active' || h.status === 'Pending').length,
        pendingInspections: inspections.filter(i => i.status === 'Pending').length,
        pendingSettlements: settlements.filter(s => s.status === 'Pending').length
      });
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error: {error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Inventory Dashboard
        </h1>
        <p className="text-gray-600 font-semibold mt-1">Complete overview of inventory and assets</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-gray-600">Total Assets</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalAssets}</div>
          <div className="text-xs font-semibold text-gray-500 mt-2">Click to manage assets</div>
        </Link>

        <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-sm font-bold text-gray-600">Asset Status</div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <div className="text-xs font-bold text-gray-500">Allocated</div>
              <div className="text-lg font-black text-emerald-600">{stats.allocatedAssets}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500">In Stock</div>
              <div className="text-lg font-black text-blue-600">{stats.inStockAssets}</div>
            </div>
          </div>
        </Link>

        <Link to="/inventory/assets" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm font-bold text-gray-600">Needs Attention</div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <div className="text-xs font-bold text-gray-500">Maintenance</div>
              <div className="text-lg font-black text-amber-600">{stats.maintenanceAssets}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500">Damaged</div>
              <div className="text-lg font-black text-red-600">{stats.damagedAssets}</div>
            </div>
          </div>
        </Link>

        <Link to="/inventory/purchase" className="glass rounded-xl p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-sm font-bold text-gray-600">Purchases</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{stats.totalPurchases}</div>
          <div className="text-xs font-semibold text-gray-500 mt-2">{stats.purchasesThisMonth} this month</div>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/inventory/handover" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-600">Active Handovers</div>
              <div className="text-2xl font-black text-gray-900">{stats.activeHandovers}</div>
            </div>
          </div>
        </Link>

        <Link to="/inventory/inspection" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-600">Pending Inspections</div>
              <div className="text-2xl font-black text-gray-900">{stats.pendingInspections}</div>
            </div>
          </div>
        </Link>

        <Link to="/inventory/settlements" className="glass rounded-xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-600">Pending Settlements</div>
              <div className="text-2xl font-black text-gray-900">{stats.pendingSettlements}</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-black text-gray-900 mb-4">Financial Overview</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div>
              <div className="text-sm font-bold text-gray-600">Total Purchase Value</div>
              <div className="text-2xl font-black text-gray-900">₹{stats.totalPurchaseValue.toLocaleString('en-IN')}</div>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xs font-bold text-gray-600">This Month</div>
              <div className="text-xl font-black text-blue-900">{stats.purchasesThisMonth}</div>
              <div className="text-xs text-gray-600">Purchases</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <div className="text-xs font-bold text-gray-600">Pending</div>
              <div className="text-xl font-black text-emerald-900">{stats.pendingSettlements}</div>
              <div className="text-xs text-gray-600">Settlements</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/inventory/assets" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all">
          <div className="text-sm font-bold text-gray-700">Manage Assets</div>
          <div className="text-xs font-semibold text-gray-600 mt-1">Track all property assets</div>
        </Link>
        <Link to="/inventory/purchase" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all">
          <div className="text-sm font-bold text-gray-700">Material Purchase</div>
          <div className="text-xs font-semibold text-gray-600 mt-1">Record new purchases</div>
        </Link>
        <Link to="/inventory/handover" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all">
          <div className="text-sm font-bold text-gray-700">Tenant Handover</div>
          <div className="text-xs font-semibold text-gray-600 mt-1">Move-in documentation</div>
        </Link>
        <Link to="/inventory/inspection" className="glass rounded-xl p-4 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all">
          <div className="text-sm font-bold text-gray-700">Move-Out Inspection</div>
          <div className="text-xs font-semibold text-gray-600 mt-1">Inspect & calculate penalties</div>
        </Link>
      </div>
    </div>
  );
}
