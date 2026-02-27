// // "use client";

// // import { useState, useEffect } from 'react';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Textarea } from '@/components/ui/textarea';
// // import { Label } from '@/components/ui/label';
// // import { Switch } from '@/components/ui/switch';
// // import { Badge } from '@/components/ui/badge';
// // import { 
// //   X, 
// //   Save, 
// //   Loader2, 
// //   Sparkles,
// //   Zap,
// //   Shield,
// //   Coffee,
// //   Bike,
// //   Monitor,
// //   Package,
// //   Utensils,
// //   Wifi,
// //   Droplets,
// //   Car,
// //   Home,
// //   Briefcase
// // } from 'lucide-react';
// // import { toast } from 'sonner';
// // import { addOnsApi, type AddOn, type CreateAddOnData } from '@/lib/addOnsApi';

// // interface AddOnFormProps {
// //   addOn?: AddOn | null;
// //   onClose: () => void;
// //   onSuccess: () => void;
// // }

// // const CATEGORIES = [
// //   { value: 'lifestyle', label: 'Lifestyle', icon: Sparkles, color: 'bg-purple-100 text-purple-800' },
// //   { value: 'meal', label: 'Meal Plans', icon: Coffee, color: 'bg-orange-100 text-orange-800' },
// //   { value: 'utility', label: 'Utilities', icon: Zap, color: 'bg-blue-100 text-blue-800' },
// //   { value: 'security', label: 'Security', icon: Shield, color: 'bg-green-100 text-green-800' },
// //   { value: 'mobility', label: 'Mobility', icon: Bike, color: 'bg-red-100 text-red-800' },
// //   { value: 'productivity', label: 'Productivity', icon: Monitor, color: 'bg-indigo-100 text-indigo-800' },
// // ];

// // const BILLING_TYPES = [
// //   { value: 'monthly', label: 'Monthly' },
// //   { value: 'quarterly', label: 'Quarterly' },
// //   { value: 'yearly', label: 'Yearly' },
// //   { value: 'one_time', label: 'One Time' },
// // ];

// // const ICONS = [
// //   { value: 'package', icon: Package, label: 'Package' },
// //   { value: 'coffee', icon: Coffee, label: 'Food' },
// //   { value: 'zap', icon: Zap, label: 'Utility' },
// //   { value: 'shield', icon: Shield, label: 'Security' },
// //   { value: 'bike', icon: Bike, label: 'Mobility' },
// //   { value: 'monitor', icon: Monitor, label: 'Productivity' },
// //   { value: 'utensils', icon: Utensils, label: 'Dining' },
// //   { value: 'wifi', icon: Wifi, label: 'Internet' },
// //   { value: 'droplets', icon: Droplets, label: 'Laundry' },
// //   { value: 'car', icon: Car, label: 'Parking' },
// //   { value: 'home', icon: Home, label: 'Cleaning' },
// // ];

// // export function AddOnForm({ addOn, onClose, onSuccess }: AddOnFormProps) {
// //   const [loading, setLoading] = useState(false);
// //   const [formData, setFormData] = useState<CreateAddOnData>({
// //     name: '',
// //     description: '',
// //     price: 0,
// //     billing_type: 'monthly',
// //     category: 'lifestyle',
// //     icon: 'package',
// //     is_popular: false,
// //     is_featured: false,
// //     is_active: true,
// //     sort_order: 0,
// //     max_per_tenant: 1,
// //   });

// //   useEffect(() => {
// //     if (addOn) {
// //       setFormData({
// //         name: addOn.name,
// //         description: addOn.description || '',
// //         price: addOn.price,
// //         billing_type: addOn.billing_type,
// //         category: addOn.category,
// //         icon: addOn.icon,
// //         is_popular: addOn.is_popular,
// //         is_featured: addOn.is_featured,
// //         is_active: addOn.is_active,
// //         sort_order: addOn.sort_order,
// //         max_per_tenant: addOn.max_per_tenant,
// //       });
// //     }
// //   }, [addOn]);

// //   const handleChange = (
// //     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
// //   ) => {
// //     const { name, value, type } = e.target;
    
// //     if (type === 'checkbox') {
// //       const checked = (e.target as HTMLInputElement).checked;
// //       setFormData(prev => ({ ...prev, [name]: checked }));
// //     } else if (name === 'price' || name === 'sort_order' || name === 'max_per_tenant') {
// //       setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
// //     } else {
// //       setFormData(prev => ({ ...prev, [name]: value }));
// //     }
// //   };

// //   const handleSwitchChange = (name: keyof CreateAddOnData, checked: boolean) => {
// //     setFormData(prev => ({ ...prev, [name]: checked }));
// //   };

// //   const validateForm = () => {
// //     if (!formData.name.trim()) {
// //       toast.error('Add-on name is required');
// //       return false;
// //     }
// //     if (!formData.price || formData.price <= 0) {
// //       toast.error('Valid price is required');
// //       return false;
// //     }
// //     if (formData.price > 100000) {
// //       toast.error('Price cannot exceed ₹1,00,000');
// //       return false;
// //     }
// //     return true;
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
    
// //     if (!validateForm()) return;
    
// //     setLoading(true);
    
// //     try {
// //       if (addOn) {
// //         await addOnsApi.update(addOn.id, formData);
// //         toast.success('Add-on updated successfully');
// //       } else {
// //         await addOnsApi.create(formData);
// //         toast.success('Add-on created successfully');
// //       }
      
// //       onSuccess();
// //     } catch (error: any) {
// //       console.error('Failed to save add-on:', error);
// //       toast.error(error.message || 'Failed to save add-on');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const getIconComponent = (iconName: string) => {
// //     const icon = ICONS.find(i => i.value === iconName);
// //     return icon ? icon.icon : Package;
// //   };

// //   const IconComponent = getIconComponent(formData.icon!);

// //   return (
// //     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// //       <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
// //         <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
// //           <h2 className="text-xl font-semibold">
// //             {addOn ? 'Edit Add-on' : 'Create New Add-on'}
// //           </h2>
// //           <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
// //             <X className="h-4 w-4" />
// //           </Button>
// //         </div>

// //         <form onSubmit={handleSubmit} className="p-6 space-y-6">
// //           {/* Basic Information */}
// //           <div className="space-y-4">
// //             <h3 className="text-lg font-medium">Basic Information</h3>
            
// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="name">Name *</Label>
// //                 <Input
// //                   id="name"
// //                   name="name"
// //                   value={formData.name}
// //                   onChange={handleChange}
// //                   placeholder="e.g., Premium Meal Plan"
// //                   required
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label htmlFor="price">Price (₹) *</Label>
// //                 <div className="relative">
// //                   <span className="absolute left-3 top-3 text-gray-500">₹</span>
// //                   <Input
// //                     id="price"
// //                     name="price"
// //                     type="number"
// //                     min="0"
// //                     step="0.01"
// //                     value={formData.price}
// //                     onChange={handleChange}
// //                     placeholder="2500"
// //                     className="pl-8"
// //                     required
// //                   />
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="space-y-2">
// //               <Label htmlFor="description">Description</Label>
// //               <Textarea
// //                 id="description"
// //                 name="description"
// //                 value={formData.description}
// //                 onChange={handleChange}
// //                 placeholder="Describe what this add-on provides"
// //                 rows={2}
// //               />
// //             </div>
// //           </div>

// //           {/* Categorization */}
// //           <div className="space-y-4">
// //             <h3 className="text-lg font-medium">Categorization</h3>

// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //               <div className="space-y-2">
// //                 <Label>Category</Label>
// //                 <select
// //                   name="category"
// //                   value={formData.category}
// //                   onChange={handleChange}
// //                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                 >
// //                   {CATEGORIES.map((cat) => (
// //                     <option key={cat.value} value={cat.value}>
// //                       {cat.label}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>

// //               <div className="space-y-2">
// //                 <Label>Icon</Label>
// //                 <div className="grid grid-cols-5 gap-2">
// //                   {ICONS.slice(0, 10).map((icon) => {
// //                     const Icon = icon.icon;
// //                     return (
// //                       <button
// //                         key={icon.value}
// //                         type="button"
// //                         onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
// //                         className={`p-2 rounded border ${
// //                           formData.icon === icon.value
// //                             ? 'border-blue-500 bg-blue-50'
// //                             : 'border-gray-200 hover:border-gray-300'
// //                         }`}
// //                         title={icon.label}
// //                       >
// //                         <Icon className="h-4 w-4 mx-auto" />
// //                       </button>
// //                     );
// //                   })}
// //                 </div>
// //               </div>

// //               <div className="space-y-2">
// //                 <Label>Billing Type</Label>
// //                 <select
// //                   name="billing_type"
// //                   value={formData.billing_type}
// //                   onChange={handleChange}
// //                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                 >
// //                   {BILLING_TYPES.map((type) => (
// //                     <option key={type.value} value={type.value}>
// //                       {type.label}
// //                     </option>
// //                   ))}
// //                 </select>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Settings */}
// //           <div className="space-y-4">
// //             <h3 className="text-lg font-medium">Settings</h3>

// //             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //               <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <Label className="font-medium">Popular</Label>
// //                     <p className="text-sm text-gray-600">Show as popular</p>
// //                   </div>
// //                   <Switch
// //                     checked={formData.is_popular}
// //                     onCheckedChange={(checked) => handleSwitchChange('is_popular', checked)}
// //                   />
// //                 </div>

// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <Label className="font-medium">Featured</Label>
// //                     <p className="text-sm text-gray-600">Highlight as featured</p>
// //                   </div>
// //                   <Switch
// //                     checked={formData.is_featured}
// //                     onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
// //                   />
// //                 </div>

// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <Label className="font-medium">Active</Label>
// //                     <p className="text-sm text-gray-600">Available for tenants</p>
// //                   </div>
// //                   <Switch
// //                     checked={formData.is_active}
// //                     onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
// //                   />
// //                 </div>
// //               </div>

// //               <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
// //                 <div className="space-y-2">
// //                   <Label htmlFor="max_per_tenant">Max per Tenant</Label>
// //                   <Input
// //                     id="max_per_tenant"
// //                     name="max_per_tenant"
// //                     type="number"
// //                     min="1"
// //                     value={formData.max_per_tenant}
// //                     onChange={handleChange}
// //                     placeholder="1"
// //                   />
// //                   <p className="text-xs text-gray-600">Maximum subscriptions per tenant</p>
// //                 </div>

// //                 <div className="space-y-2">
// //                   <Label htmlFor="sort_order">Display Order</Label>
// //                   <Input
// //                     id="sort_order"
// //                     name="sort_order"
// //                     type="number"
// //                     value={formData.sort_order}
// //                     onChange={handleChange}
// //                     placeholder="0"
// //                   />
// //                   <p className="text-xs text-gray-600">Lower numbers appear first</p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Preview */}
// //           <div className="p-4 bg-gray-50 rounded-lg border">
// //             <div className="flex items-center justify-between mb-2">
// //               <div className="flex items-center gap-2">
// //                 <div className="p-2 bg-white rounded">
// //                   <IconComponent className="h-4 w-4" />
// //                 </div>
// //                 <div>
// //                   <h4 className="font-medium">{formData.name || "Add-on Name"}</h4>
// //                   <div className="flex gap-1 mt-1">
// //                     <Badge className="text-xs">
// //                       {CATEGORIES.find(c => c.value === formData.category)?.label}
// //                     </Badge>
// //                     {formData.is_popular && <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>}
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="text-right">
// //                 <div className="font-bold">
// //                   ₹{formData.price || "0"}
// //                   <span className="text-sm font-normal text-gray-600 ml-1">
// //                     /{formData.billing_type === 'one_time' ? 'one-time' : formData.billing_type}
// //                   </span>
// //                 </div>
// //               </div>
// //             </div>
// //             <p className="text-sm text-gray-600">{formData.description || "Description"}</p>
// //           </div>

// //           {/* Actions */}
// //           <div className="flex justify-end gap-3 pt-4 border-t">
// //             <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
// //               Cancel
// //             </Button>
// //             <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
// //               {loading ? (
// //                 <>
// //                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
// //                   Saving...
// //                 </>
// //               ) : (
// //                 <>
// //                   <Save className="h-4 w-4 mr-2" />
// //                   {addOn ? 'Update Add-on' : 'Create Add-on'}
// //                 </>
// //               )}
// //             </Button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }


// "use client";

// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
// import { Badge } from '@/components/ui/badge';
// import { 
//   X, 
//   Save, 
//   Loader2, 
//   Sparkles,
//   Zap,
//   Shield,
//   Coffee,
//   Bike,
//   Monitor,
//   Package,
//   Utensils,
//   Wifi,
//   Droplets,
//   Car,
//   Home,
//   Briefcase,
//   ChevronDown
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { addOnsApi, type AddOn, type CreateAddOnData } from '@/lib/addOnsApi';

// interface AddOnFormProps {
//   addOn?: AddOn | null;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// const CATEGORIES = [
//   { value: 'lifestyle', label: 'Lifestyle', icon: Sparkles, color: 'bg-purple-100 text-purple-800' },
//   { value: 'meal', label: 'Meal Plans', icon: Coffee, color: 'bg-orange-100 text-orange-800' },
//   { value: 'utility', label: 'Utilities', icon: Zap, color: 'bg-blue-100 text-blue-800' },
//   { value: 'security', label: 'Security', icon: Shield, color: 'bg-green-100 text-green-800' },
//   { value: 'mobility', label: 'Mobility', icon: Bike, color: 'bg-red-100 text-red-800' },
//   { value: 'productivity', label: 'Productivity', icon: Monitor, color: 'bg-indigo-100 text-indigo-800' },
// ];

// const BILLING_TYPES = [
//   { value: 'monthly', label: 'Monthly' },
//   { value: 'quarterly', label: 'Quarterly' },
//   { value: 'yearly', label: 'Yearly' },
//   { value: 'one_time', label: 'One Time' },
// ];

// const ICONS = [
//   { value: 'package', icon: Package, label: 'Package' },
//   { value: 'coffee', icon: Coffee, label: 'Food' },
//   { value: 'zap', icon: Zap, label: 'Utility' },
//   { value: 'shield', icon: Shield, label: 'Security' },
//   { value: 'bike', icon: Bike, label: 'Mobility' },
//   { value: 'monitor', icon: Monitor, label: 'Productivity' },
//   { value: 'utensils', icon: Utensils, label: 'Dining' },
//   { value: 'wifi', icon: Wifi, label: 'Internet' },
//   { value: 'droplets', icon: Droplets, label: 'Laundry' },
//   { value: 'car', icon: Car, label: 'Parking' },
//   { value: 'home', icon: Home, label: 'Cleaning' },
// ];

// export function AddOnForm({ addOn, onClose, onSuccess }: AddOnFormProps) {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState<CreateAddOnData>({
//     name: '',
//     description: '',
//     price: 0,
//     billing_type: 'monthly',
//     category: 'lifestyle',
//     icon: 'package',
//     is_popular: false,
//     is_featured: false,
//     is_active: true,
//     sort_order: 0,
//     max_per_tenant: 1,
//   });

//   useEffect(() => {
//     if (addOn) {
//       setFormData({
//         name: addOn.name,
//         description: addOn.description || '',
//         price: addOn.price,
//         billing_type: addOn.billing_type,
//         category: addOn.category,
//         icon: addOn.icon,
//         is_popular: addOn.is_popular,
//         is_featured: addOn.is_featured,
//         is_active: addOn.is_active,
//         sort_order: addOn.sort_order,
//         max_per_tenant: addOn.max_per_tenant,
//       });
//     }
//   }, [addOn]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value, type } = e.target;
    
//     if (type === 'checkbox') {
//       const checked = (e.target as HTMLInputElement).checked;
//       setFormData(prev => ({ ...prev, [name]: checked }));
//     } else if (name === 'price' || name === 'sort_order' || name === 'max_per_tenant') {
//       setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSwitchChange = (name: keyof CreateAddOnData, checked: boolean) => {
//     setFormData(prev => ({ ...prev, [name]: checked }));
//   };

//   const validateForm = () => {
//     if (!formData.name.trim()) {
//       toast.error('Add-on name is required');
//       return false;
//     }
//     if (!formData.price || formData.price <= 0) {
//       toast.error('Valid price is required');
//       return false;
//     }
//     if (formData.price > 100000) {
//       toast.error('Price cannot exceed ₹1,00,000');
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;
    
//     setLoading(true);
    
//     try {
//       if (addOn) {
//         await addOnsApi.update(addOn.id, formData);
//         toast.success('Add-on updated successfully');
//       } else {
//         await addOnsApi.create(formData);
//         toast.success('Add-on created successfully');
//       }
      
//       onSuccess();
//     } catch (error: any) {
//       console.error('Failed to save add-on:', error);
//       toast.error(error.message || 'Failed to save add-on');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getIconComponent = (iconName: string) => {
//     const icon = ICONS.find(i => i.value === iconName);
//     return icon ? icon.icon : Package;
//   };

//   const IconComponent = getIconComponent(formData.icon!);

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
//         {/* Gradient Header with Cross Icon */}
//         <div className="sticky top-0 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] px-4 sm:px-6 py-3 flex items-center justify-between text-white shrink-0">
//           <h2 className="text-base sm:text-lg font-semibold">
//             {addOn ? 'Edit Add-on' : 'Create New Add-on'}
//           </h2>
//           <button
//             onClick={onClose}
//             disabled={loading}
//             className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
//             aria-label="Close"
//           >
//             <X className="h-4 w-4 sm:h-5 sm:w-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
//           {/* Basic Information - Compact */}
//           <div className="space-y-3">
//             <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Basic Information</h3>
            
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <div className="space-y-1.5">
//                 <Label htmlFor="name" className="text-xs font-medium">Name *</Label>
//                 <Input
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="e.g., Premium Meal Plan"
//                   required
//                   className="h-9 text-sm"
//                 />
//               </div>

//               <div className="space-y-1.5">
//                 <Label htmlFor="price" className="text-xs font-medium">Price (₹) *</Label>
//                 <div className="relative">
//                   <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
//                   <Input
//                     id="price"
//                     name="price"
//                     type="number"
//                     min="0"
//                     step="0.01"
//                     value={formData.price}
//                     onChange={handleChange}
//                     placeholder="2500"
//                     className="pl-7 h-9 text-sm"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-1.5">
//               <Label htmlFor="description" className="text-xs font-medium">Description</Label>
//               <Textarea
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 placeholder="Describe what this add-on provides"
//                 rows={2}
//                 className="text-sm resize-none"
//               />
//             </div>
//           </div>

//           {/* Categorization - Compact */}
//           <div className="space-y-3">
//             <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Categorization</h3>

//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//               <div className="space-y-1.5">
//                 <Label className="text-xs font-medium">Category</Label>
//                 <select
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   className="w-full h-9 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
//                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
//                 >
//                   {CATEGORIES.map((cat) => (
//                     <option key={cat.value} value={cat.value}>
//                       {cat.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-1.5">
//                 <Label className="text-xs font-medium">Billing Type</Label>
//                 <select
//                   name="billing_type"
//                   value={formData.billing_type}
//                   onChange={handleChange}
//                   className="w-full h-9 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
//                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
//                 >
//                   {BILLING_TYPES.map((type) => (
//                     <option key={type.value} value={type.value}>
//                       {type.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-1.5">
//                 <Label className="text-xs font-medium">Icon</Label>
//                 <div className="flex flex-wrap gap-1.5 border rounded-md p-2 bg-gray-50">
//                   {ICONS.slice(0, 8).map((icon) => {
//                     const Icon = icon.icon;
//                     return (
//                       <button
//                         key={icon.value}
//                         type="button"
//                         onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
//                         className={`p-1.5 rounded ${
//                           formData.icon === icon.value
//                             ? 'bg-blue-500 text-white'
//                             : 'bg-white border hover:border-blue-300'
//                         }`}
//                         title={icon.label}
//                       >
//                         <Icon className="h-3.5 w-3.5" />
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Settings - Compact Grid */}
//           <div className="space-y-3">
//             <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Settings</h3>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label className="text-xs font-medium">Popular</Label>
//                     <p className="text-xs text-gray-600">Show as popular</p>
//                   </div>
//                   <Switch
//                     checked={formData.is_popular}
//                     onCheckedChange={(checked) => handleSwitchChange('is_popular', checked)}
//                     className="scale-75"
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label className="text-xs font-medium">Featured</Label>
//                     <p className="text-xs text-gray-600">Highlight as featured</p>
//                   </div>
//                   <Switch
//                     checked={formData.is_featured}
//                     onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
//                     className="scale-75"
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Label className="text-xs font-medium">Active</Label>
//                     <p className="text-xs text-gray-600">Available for tenants</p>
//                   </div>
//                   <Switch
//                     checked={formData.is_active}
//                     onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
//                     className="scale-75"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
//                 <div className="space-y-1.5">
//                   <Label htmlFor="max_per_tenant" className="text-xs font-medium">Max per Tenant</Label>
//                   <Input
//                     id="max_per_tenant"
//                     name="max_per_tenant"
//                     type="number"
//                     min="1"
//                     value={formData.max_per_tenant}
//                     onChange={handleChange}
//                     placeholder="1"
//                     className="h-8 text-sm"
//                   />
//                   <p className="text-xs text-gray-500">Maximum subscriptions per tenant</p>
//                 </div>

//                 <div className="space-y-1.5">
//                   <Label htmlFor="sort_order" className="text-xs font-medium">Display Order</Label>
//                   <Input
//                     id="sort_order"
//                     name="sort_order"
//                     type="number"
//                     value={formData.sort_order}
//                     onChange={handleChange}
//                     placeholder="0"
//                     className="h-8 text-sm"
//                   />
//                   <p className="text-xs text-gray-500">Lower numbers appear first</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Preview - Compact */}
//           <div className="p-3 bg-gray-50 rounded-lg border">
//             <div className="flex items-start justify-between gap-2">
//               <div className="flex items-start gap-2 min-w-0">
//                 <div className={`p-1.5 rounded shrink-0 ${
//                   formData.is_popular ? 'bg-orange-100' : 'bg-white'
//                 }`}>
//                   <IconComponent className="h-3.5 w-3.5" />
//                 </div>
//                 <div className="min-w-0">
//                   <h4 className="font-medium text-sm truncate">{formData.name || "Add-on Name"}</h4>
//                   <div className="flex flex-wrap gap-1 mt-0.5">
//                     <Badge className="text-[10px] px-1.5 py-0">
//                       {CATEGORIES.find(c => c.value === formData.category)?.label}
//                     </Badge>
//                     {formData.is_popular && (
//                       <Badge className="bg-orange-100 text-orange-800 text-[10px] px-1.5 py-0">Popular</Badge>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="text-right shrink-0">
//                 <div className="font-bold text-sm">
//                   ₹{formData.price || "0"}
//                   <span className="text-[10px] font-normal text-gray-600 ml-1">
//                     /{formData.billing_type === 'one_time' ? 'one-time' : formData.billing_type}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <p className="text-xs text-gray-600 mt-1 line-clamp-2">{formData.description || "Description"}</p>
//           </div>

//           {/* Actions - Compact */}
//           <div className="flex justify-end gap-2 pt-3 border-t sticky bottom-0 bg-white pb-1">
//             <Button 
//               type="button" 
//               variant="outline" 
//               onClick={onClose} 
//               disabled={loading}
//               size="sm"
//               className="h-8 text-xs"
//             >
//               Cancel
//             </Button>
//             <Button 
//               type="submit" 
//               disabled={loading} 
//               className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:opacity-90 text-white h-8 text-xs"
//               size="sm"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-3 w-3 mr-1" />
//                   {addOn ? 'Update' : 'Create'}
//                 </>
//               )}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  Loader2, 
  Sparkles,
  Zap,
  Shield,
  Coffee,
  Bike,
  Monitor,
  Package,
  Utensils,
  Wifi,
  Droplets,
  Car,
  Home,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { addOnsApi, type AddOn, type CreateAddOnData } from '@/lib/addOnsApi';

interface AddOnFormProps {
  addOn?: AddOn | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: 'lifestyle', label: 'Lifestyle', icon: Sparkles, color: 'bg-purple-100 text-purple-800' },
  { value: 'meal', label: 'Meal Plans', icon: Coffee, color: 'bg-orange-100 text-orange-800' },
  { value: 'utility', label: 'Utilities', icon: Zap, color: 'bg-blue-100 text-blue-800' },
  { value: 'security', label: 'Security', icon: Shield, color: 'bg-green-100 text-green-800' },
  { value: 'mobility', label: 'Mobility', icon: Bike, color: 'bg-red-100 text-red-800' },
  { value: 'productivity', label: 'Productivity', icon: Monitor, color: 'bg-indigo-100 text-indigo-800' },
];

const BILLING_TYPES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One Time' },
];

const ICONS = [
  { value: 'package', icon: Package, label: 'Package' },
  { value: 'coffee', icon: Coffee, label: 'Food' },
  { value: 'zap', icon: Zap, label: 'Utility' },
  { value: 'shield', icon: Shield, label: 'Security' },
  { value: 'bike', icon: Bike, label: 'Mobility' },
  { value: 'monitor', icon: Monitor, label: 'Productivity' },
  { value: 'utensils', icon: Utensils, label: 'Dining' },
  { value: 'wifi', icon: Wifi, label: 'Internet' },
  { value: 'droplets', icon: Droplets, label: 'Laundry' },
  { value: 'car', icon: Car, label: 'Parking' },
  { value: 'home', icon: Home, label: 'Cleaning' },
];

export function AddOnForm({ addOn, onClose, onSuccess }: AddOnFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAddOnData>({
    name: '',
    description: '',
    price: 0,
    billing_type: 'monthly',
    category: 'lifestyle',
    icon: 'package',
    is_popular: false,
    is_featured: false,
    is_active: true,
    sort_order: 0,
    max_per_tenant: 1,
  });

  useEffect(() => {
    if (addOn) {
      setFormData({
        name: addOn.name,
        description: addOn.description || '',
        price: addOn.price,
        billing_type: addOn.billing_type,
        category: addOn.category,
        icon: addOn.icon,
        is_popular: addOn.is_popular,
        is_featured: addOn.is_featured,
        is_active: addOn.is_active,
        sort_order: addOn.sort_order,
        max_per_tenant: addOn.max_per_tenant,
      });
    }
  }, [addOn]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'sort_order' || name === 'max_per_tenant') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (name: keyof CreateAddOnData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Add-on name is required');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    if (formData.price > 100000) {
      toast.error('Price cannot exceed ₹1,00,000');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (addOn) {
        await addOnsApi.update(addOn.id, formData);
        toast.success('Add-on updated successfully');
      } else {
        await addOnsApi.create(formData);
        toast.success('Add-on created successfully');
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save add-on:', error);
      toast.error(error.message || 'Failed to save add-on');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icon = ICONS.find(i => i.value === iconName);
    return icon ? icon.icon : Package;
  };

  const IconComponent = getIconComponent(formData.icon!);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Gradient Header with Cross Icon - Compact */}
        <div className="sticky top-0 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-white shrink-0">
          <h2 className="text-sm sm:text-base font-semibold">
            {addOn ? 'Edit Add-on' : 'Create Add-on'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Basic Information - 2x2 grid on mobile */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label htmlFor="name" className="text-[10px] sm:text-xs font-medium">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Premium Meal Plan"
                  required
                  className="h-7 sm:h-8 text-[10px] sm:text-xs"
                />
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label htmlFor="price" className="text-[10px] sm:text-xs font-medium">Price (₹) *</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1.5 sm:left-2.5 sm:top-2 text-gray-500 text-[10px] sm:text-xs">₹</span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="2500"
                    className="pl-5 sm:pl-6 h-7 sm:h-8 text-[10px] sm:text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 col-span-2">
                <Label htmlFor="description" className="text-[10px] sm:text-xs font-medium">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what this add-on provides"
                  rows={1}
                  className="text-[10px] sm:text-xs resize-none h-16 sm:h-14"
                />
              </div>
            </div>
          </div>

          {/* Categorization - 2x2 grid on mobile */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Categorization</h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label className="text-[10px] sm:text-xs font-medium">Category</Label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-7 sm:h-8 px-2 text-[10px] sm:text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '12px' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} className="text-[10px] sm:text-xs">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label className="text-[10px] sm:text-xs font-medium">Billing Type</Label>
                <select
                  name="billing_type"
                  value={formData.billing_type}
                  onChange={handleChange}
                  className="w-full h-7 sm:h-8 px-2 text-[10px] sm:text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center', backgroundSize: '12px' }}
                >
                  {BILLING_TYPES.map((type) => (
                    <option key={type.value} value={type.value} className="text-[10px] sm:text-xs">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 col-span-2">
                <Label className="text-[10px] sm:text-xs font-medium">Icon</Label>
                <div className="flex flex-wrap gap-1 border rounded-md p-1.5 bg-gray-50">
                  {ICONS.slice(0, 8).map((icon) => {
                    const Icon = icon.icon;
                    return (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
                        className={`p-1 rounded ${
                          formData.icon === icon.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border hover:border-blue-300'
                        }`}
                        title={icon.label}
                      >
                        <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Settings - 2x2 grid on mobile */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Settings</h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5 p-2 bg-gray-50 rounded-lg col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[10px] sm:text-xs font-medium">Popular</Label>
                    <p className="text-[8px] sm:text-[10px] text-gray-600">Show as popular</p>
                  </div>
                  <Switch
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => handleSwitchChange('is_popular', checked)}
                    className="scale-75 origin-right"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[10px] sm:text-xs font-medium">Featured</Label>
                    <p className="text-[8px] sm:text-[10px] text-gray-600">Highlight as featured</p>
                  </div>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
                    className="scale-75 origin-right"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[10px] sm:text-xs font-medium">Active</Label>
                    <p className="text-[8px] sm:text-[10px] text-gray-600">Available for tenants</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                    className="scale-75 origin-right"
                  />
                </div>
              </div>

              <div className="space-y-1.5 p-2 bg-gray-50 rounded-lg col-span-2 sm:col-span-1">
                <div className="space-y-1">
                  <Label htmlFor="max_per_tenant" className="text-[10px] sm:text-xs font-medium">Max per Tenant</Label>
                  <Input
                    id="max_per_tenant"
                    name="max_per_tenant"
                    type="number"
                    min="1"
                    value={formData.max_per_tenant}
                    onChange={handleChange}
                    placeholder="1"
                    className="h-6 sm:h-7 text-[10px] sm:text-xs"
                  />
                  <p className="text-[8px] sm:text-[10px] text-gray-500">Maximum subscriptions</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sort_order" className="text-[10px] sm:text-xs font-medium">Display Order</Label>
                  <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={handleChange}
                    placeholder="0"
                    className="h-6 sm:h-7 text-[10px] sm:text-xs"
                  />
                  <p className="text-[8px] sm:text-[10px] text-gray-500">Lower numbers first</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview - Compact */}
          <div className="p-2 bg-gray-50 rounded-lg border">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <div className={`p-1 rounded shrink-0 ${
                  formData.is_popular ? 'bg-orange-100' : 'bg-white'
                }`}>
                  <IconComponent className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium text-[10px] sm:text-xs truncate">{formData.name || "Add-on Name"}</h4>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    <Badge className="text-[8px] sm:text-[9px] px-1 py-0 h-3.5">
                      {CATEGORIES.find(c => c.value === formData.category)?.label}
                    </Badge>
                    {formData.is_popular && (
                      <Badge className="bg-orange-100 text-orange-800 text-[8px] sm:text-[9px] px-1 py-0 h-3.5">Popular</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-[10px] sm:text-xs">
                  ₹{formData.price || "0"}
                  <span className="text-[8px] sm:text-[9px] font-normal text-gray-600 ml-1">
                    /{formData.billing_type === 'one_time' ? 'one-time' : formData.billing_type}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[9px] sm:text-[10px] text-gray-600 mt-1 line-clamp-2">{formData.description || "Description"}</p>
          </div>

          {/* Actions - Compact */}
          <div className="flex justify-end gap-2 pt-2 border-t sticky bottom-0 bg-white pb-1">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              size="sm"
              className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] hover:opacity-90 text-white h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                  {addOn ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}