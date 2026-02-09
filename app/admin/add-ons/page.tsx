// "use client";

// import { useState, useEffect } from 'react';
// import { AdminHeader } from '@/components/admin/admin-header';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { 
//   Plus, 
//   Edit, 
//   Trash2, 
//   ToggleLeft, 
//   ToggleRight,
//   RefreshCw,
//   Filter,
//   IndianRupee,
//   Users
// } from 'lucide-react';
// import { AddOnForm } from '@/components/admin/AddOnForm';
// import { toast } from 'sonner';
// import { addOnsApi } from '@/lib/addOnsApi';

// const CATEGORY_COLORS: Record<string, string> = {
//   lifestyle: 'bg-purple-100 text-purple-800',
//   meal: 'bg-orange-100 text-orange-800',
//   utility: 'bg-blue-100 text-blue-800',
//   security: 'bg-green-100 text-green-800',
//   mobility: 'bg-red-100 text-red-800',
//   productivity: 'bg-indigo-100 text-indigo-800',
//   other: 'bg-gray-100 text-gray-800',
// };

// const CATEGORY_LABELS: Record<string, string> = {
//   lifestyle: 'Lifestyle',
//   meal: 'Meal',
//   utility: 'Utility',
//   security: 'Security',
//   mobility: 'Mobility',
//   productivity: 'Productivity',
//   other: 'Other',
// };

// export default function AddOnsPage() {
//   const [addOns, setAddOns] = useState<any[]>([]);
//   const [filteredAddOns, setFilteredAddOns] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingAddOn, setEditingAddOn] = useState<any>(null);
//   const [activeFilter, setActiveFilter] = useState<string>('all');
//   const [stats, setStats] = useState({
//     total: 0,
//     active: 0,
//     popular: 0,
//     featured: 0,
//     total_subscribers: 0,
//     monthly_revenue: 0,
//   });

//   // Load data function
//   const loadData = async () => {
//     console.log('Loading add-ons data...');
//     try {
//       setLoading(true);
      
//       // Load add-ons
//       const addOnsData = await addOnsApi.getAll();
//       console.log('API Response data:', addOnsData);
      
//       if (Array.isArray(addOnsData)) {
//         setAddOns(addOnsData);
//         console.log(`Loaded ${addOnsData.length} add-ons`);
        
//         // Calculate stats
//         const total = addOnsData.length;
//         const active = addOnsData.filter(a => a.is_active).length;
//         const popular = addOnsData.filter(a => a.is_popular).length;
//         const featured = addOnsData.filter(a => a.is_featured).length;
//         const monthlyRevenue = addOnsData
//           .filter(a => a.is_active && a.billing_type === 'monthly')
//           .reduce((sum, a) => sum + (a.price || 0), 0);
        
//         setStats({
//           total,
//           active,
//           popular,
//           featured,
//           total_subscribers: 0,
//           monthly_revenue: monthlyRevenue,
//         });
//       } else {
//         console.error('Invalid data format:', addOnsData);
//         setAddOns([]);
//       }
      
//     } catch (error: any) {
//       console.error('Failed to load data:', error);
//       toast.error('Failed to load add-ons. Check console for details.');
//       setAddOns([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     loadData();
//   }, []);

//   // Filter add-ons when addOns or filter changes
//   useEffect(() => {
//     console.log('Filtering add-ons, current count:', addOns.length);
//     filterAddOns();
//   }, [addOns, activeFilter]);

//   const filterAddOns = () => {
//     let filtered = [...addOns];
    
//     if (activeFilter === 'active') {
//       filtered = filtered.filter(a => a.is_active);
//     } else if (activeFilter === 'inactive') {
//       filtered = filtered.filter(a => !a.is_active);
//     } else if (activeFilter === 'popular') {
//       filtered = filtered.filter(a => a.is_popular);
//     } else if (activeFilter === 'featured') {
//       filtered = filtered.filter(a => a.is_featured);
//     } else if (activeFilter === 'monthly') {
//       filtered = filtered.filter(a => a.billing_type === 'monthly');
//     } else if (activeFilter === 'one_time') {
//       filtered = filtered.filter(a => a.billing_type === 'one_time');
//     } else if (activeFilter in CATEGORY_COLORS) {
//       filtered = filtered.filter(a => a.category === activeFilter);
//     }
    
//     // Sort by sort_order
//     filtered.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    
//     console.log('Filtered to:', filtered.length, 'add-ons');
//     setFilteredAddOns(filtered);
//   };

//   const handleDelete = async (id: number) => {
//     if (!confirm('Are you sure you want to delete this add-on?')) return;
    
//     try {
//       await addOnsApi.delete(id);
//       toast.success('Add-on deleted successfully');
//       // Refresh data after deletion
//       loadData();
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to delete add-on');
//     }
//   };

//   const toggleAddOnStatus = async (id: number) => {
//     try {
//       const updated = await addOnsApi.toggleStatus(id);
//       toast.success(`Add-on ${updated.is_active ? 'activated' : 'deactivated'}`);
//       // Refresh data after status change
//       loadData();
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to update add-on status');
//     }
//   };

//   const handleEdit = (addOn: any) => {
//     console.log('Editing add-on:', addOn);
//     setEditingAddOn(addOn);
//     setShowForm(true);
//   };

//   const handleFormSuccess = () => {
//     console.log('Form saved successfully, refreshing data...');
//     // Close form
//     setShowForm(false);
//     setEditingAddOn(null);
//     // Refresh data
//     loadData();
//     toast.success('Add-on saved! Refreshing list...');
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//     }).format(amount);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <AdminHeader title="Add-ons Management" />
      
//       {showForm && (
//         <AddOnForm
//           addOn={editingAddOn}
//           onClose={() => {
//             setShowForm(false);
//             setEditingAddOn(null);
//           }}
//           onSuccess={handleFormSuccess}
//         />
//       )}

//       <div className="p-6">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Total Add-ons</p>
//                   <h3 className="text-2xl font-bold">{stats.total}</h3>
//                 </div>
//                 <div className="p-2 bg-blue-100 rounded">
//                   <span className="text-blue-600 font-semibold">All</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Active</p>
//                   <h3 className="text-2xl font-bold">{stats.active}</h3>
//                 </div>
//                 <div className="p-2 bg-green-100 rounded">
//                   <span className="text-green-600 font-semibold">Live</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Monthly Revenue</p>
//                   <h3 className="text-2xl font-bold">{formatCurrency(stats.monthly_revenue)}</h3>
//                 </div>
//                 <IndianRupee className="h-6 w-6 text-gray-500" />
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-600">Popular</p>
//                   <h3 className="text-2xl font-bold">{stats.popular}</h3>
//                 </div>
//                 <div className="p-2 bg-orange-100 rounded">
//                   <span className="text-orange-600 font-semibold">Hot</span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Main Card */}
//         <Card className="border">
//           <CardHeader className="bg-white border-b">
//             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//               <div>
//                 <CardTitle className="text-xl">Add-ons Management</CardTitle>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Manage additional services for tenants
//                 </p>
                
//               </div>
//               <div className="flex items-center gap-2">
//                 <Button 
//                   variant="outline" 
//                   onClick={loadData}
//                   disabled={loading}
//                   size="sm"
//                 >
//                   <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
//                   {loading ? 'Loading...' : 'Refresh'}
//                 </Button>
//                 <Button 
//                   className="bg-blue-600 hover:bg-blue-700"
//                   onClick={() => setShowForm(true)}
//                   size="sm"
//                 >
//                   <Plus className="h-3 w-3 mr-2" />
//                   New Add-on
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>
          
//           {/* Filters */}
//           <div className="px-6 pt-4">
//             <div className="flex flex-wrap items-center gap-2">
//               <Filter className="h-3 w-3 text-gray-500" />
//               <span className="text-sm text-gray-600 mr-2">Filter:</span>
//               <Button
//                 variant={activeFilter === 'all' ? 'default' : 'outline'}
//                 size="sm"
//                 onClick={() => setActiveFilter('all')}
//               >
//                 All ({addOns.length})
//               </Button>
//               <Button
//                 variant={activeFilter === 'active' ? 'default' : 'outline'}
//                 size="sm"
//                 onClick={() => setActiveFilter('active')}
//               >
//                 Active ({addOns.filter(a => a.is_active).length})
//               </Button>
//               <Button
//                 variant={activeFilter === 'popular' ? 'default' : 'outline'}
//                 size="sm"
//                 onClick={() => setActiveFilter('popular')}
//               >
//                 Popular ({addOns.filter(a => a.is_popular).length})
//               </Button>
//               {Object.entries(CATEGORY_LABELS).map(([value, label]) => {
//                 const count = addOns.filter(a => a.category === value).length;
//                 return (
//                   <Button
//                     key={value}
//                     variant={activeFilter === value ? 'default' : 'outline'}
//                     size="sm"
//                     onClick={() => setActiveFilter(value)}
//                   >
//                     {label} ({count})
//                   </Button>
//                 );
//               })}
//             </div>
//           </div>

//           <CardContent className="p-6">
//             {loading ? (
//               <div className="flex justify-center items-center h-64">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                 <span className="ml-3">Loading add-ons...</span>
//               </div>
//             ) : (
//               <>
//                 {filteredAddOns.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="text-gray-400 mb-4">
//                       {addOns.length === 0 
//                         ? 'No add-ons found. Create your first add-on!'
//                         : `No add-ons match the "${activeFilter}" filter`
//                       }
//                     </div>
//                     <Button 
//                       className="bg-blue-600 hover:bg-blue-700"
//                       onClick={() => setShowForm(true)}
//                     >
//                       <Plus className="h-4 w-4 mr-2" />
//                       Create New Add-on
//                     </Button>
//                     {activeFilter !== 'all' && addOns.length > 0 && (
//                       <Button 
//                         variant="outline" 
//                         className="ml-2"
//                         onClick={() => setActiveFilter('all')}
//                       >
//                         Show All
//                       </Button>
//                     )}
//                   </div>
//                 ) : (
//                   <>
//                     <div className="mb-4 text-sm text-gray-600">
//                       Showing {filteredAddOns.length} of {addOns.length} add-ons
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                       {filteredAddOns.map((addOn) => (
//                         <Card key={addOn.id} className="border hover:shadow-md transition-shadow">
//                           <CardContent className="p-4">
//                             <div className="flex justify-between items-start mb-3">
//                               <div className="flex flex-wrap gap-2">
//                                 <Badge className={CATEGORY_COLORS[addOn.category] || 'bg-gray-100 text-gray-800'}>
//                                   {CATEGORY_LABELS[addOn.category] || addOn.category}
//                                 </Badge>
//                                 {addOn.is_popular && (
//                                   <Badge className="bg-orange-100 text-orange-800">Popular</Badge>
//                                 )}
//                                 {addOn.is_featured && (
//                                   <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
//                                 )}
//                                 {!addOn.is_active && (
//                                   <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
//                                 )}
//                               </div>
                              
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 onClick={() => toggleAddOnStatus(addOn.id)}
//                                 className="h-6 w-6 p-0"
//                                 title={addOn.is_active ? 'Deactivate' : 'Activate'}
//                               >
//                                 {addOn.is_active ? (
//                                   <ToggleRight className="h-4 w-4 text-green-600" />
//                                 ) : (
//                                   <ToggleLeft className="h-4 w-4 text-gray-400" />
//                                 )}
//                               </Button>
//                             </div>
                            
//                             <h3 className="font-semibold text-lg mb-2">{addOn.name}</h3>
//                             <p className="text-sm text-gray-600 mb-3 line-clamp-2">
//                               {addOn.description || 'No description provided'}
//                             </p>
                            
//                             <div className="flex items-center justify-between mb-3">
//                               <div className="text-lg font-bold text-gray-900">
//                                 ₹{addOn.price || 0}
//                                 <span className="text-sm font-normal text-gray-600 ml-1">
//                                   /{addOn.billing_type === 'one_time' ? 'once' : addOn.billing_type || 'monthly'}
//                                 </span>
//                               </div>
//                               <div className="text-xs text-gray-500">
//                                 ID: {addOn.id}
//                               </div>
//                             </div>
                            
//                             <div className="flex items-center justify-between pt-3 border-t">
//                               <div className="text-xs text-gray-500">
//                                 Order: {addOn.sort_order || 0} • Max: {addOn.max_per_tenant || 1}
//                               </div>
                              
//                               <div className="flex gap-1">
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   onClick={() => handleEdit(addOn)}
//                                   className="h-7 px-2"
//                                   title="Edit"
//                                 >
//                                   <Edit className="h-3 w-3" />
//                                 </Button>
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   onClick={() => handleDelete(addOn.id)}
//                                   className="h-7 px-2 text-red-600 hover:text-red-700"
//                                   title="Delete"
//                                 >
//                                   <Trash2 className="h-3 w-3" />
//                                 </Button>
//                               </div>
//                             </div>
//                           </CardContent>
//                         </Card>
//                       ))}
//                     </div>
//                   </>
//                 )}
//               </>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AddOnsClientPage from '@/components/admin/add-ons/AddOnsClientPage';
import { addOnsApi } from '@/lib/addOnsApi';
import { AddOnsLoading } from '@/components/admin/add-ons/AddOnsLoading';

export const metadata: Metadata = {
  title: 'Add-ons Management',
  description: 'Manage additional services for tenants',
};

interface SearchParams {
  filter?: string;
}

export default function AddOnsPage() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  const [initialAddOns, setInitialAddOns] = useState<any[]>([]);
  const [initialStats, setInitialStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([addOnsApi.getAll(), addOnsApi.getStats()])
      .then(([addOnsData, statsData]) => {
        setInitialAddOns(Array.isArray(addOnsData) ? addOnsData : []);
        setInitialStats(statsData);
      })
      .catch((err) => console.error('Error fetching initial data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AddOnsLoading />;
  return (
    <AddOnsClientPage 
      initialAddOns={initialAddOns}
      initialStats={initialStats}
      initialFilter={filter}
    />
  );
}