// // admin/masters/[typeId]/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   getMasterTypeById,
//   getMasterValues,
//   createMasterValue,
//   updateMasterValue,
//   deleteMasterValue,
//   toggleMasterValueStatus,
// } from "@/lib/masterApi";
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   ChevronLeft,
//   CheckCircle,
//   XCircle,
//   Save,
//   X,
//   Shield,
//   Loader2,
//   Search,
//   Tag,
//   AlertCircle,
//   RefreshCw,
//   ArrowLeft,
//   Key,
//   Grid,
//   Hash,
//   Check
// } from "lucide-react";

// interface MasterType {
//   id: number;
//   code: string;
//   name: string;
//   tab: string | null;
//   is_active: boolean;
//   created_at: string;
//   value_count: number;
// }

// interface MasterValue {
//   id: number;
//   value: string;
//   is_active: boolean;
//   created_at: string;
//   master_type_id: number;
// }

// export default function MasterValuesPage() {
//   const params = useParams();
//   const router = useRouter();
//   const typeId = params.typeId as string;
  
//   // State for master type
//   const [masterType, setMasterType] = useState<MasterType | null>(null);
//   const [values, setValues] = useState<MasterValue[]>([]);
  
//   // Loading states
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [togglingValueId, setTogglingValueId] = useState<number | null>(null);
  
//   // Search & Filter states
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
//   // Modal states
//   const [showValueForm, setShowValueForm] = useState(false);
//   const [showDeleteValueConfirm, setShowDeleteValueConfirm] = useState<number | null>(null);
  
//   // Form data states
//   const [valueFormData, setValueFormData] = useState({
//     id: null as number | null,
//     value: "",
//     is_active: true,
//   });

//   // Load master type and values
//   const loadData = async () => {
//     setLoading(true);
//     try {
//       // Load master type
//       const typeRes = await getMasterTypeById(typeId);
//       if (typeRes.success && typeRes.data) {
//         setMasterType(typeRes.data);
//       } else {
//         console.error("Failed to load master type");
//         return;
//       }
      
//       // Load values
//       const valuesRes = await getMasterValues(typeId);
//       if (valuesRes.success && Array.isArray(valuesRes.data)) {
//         setValues(valuesRes.data);
//       } else {
//         setValues([]);
//       }
//     } catch (error) {
//       console.error("Failed to load data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     if (typeId) {
//       loadData();
//     }
//   }, [typeId]);

//   // Filtered values based on search and filter
//   const filteredValues = values.filter(val => {
//     const matchesSearch = searchTerm === "" || 
//       val.value.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesStatus = statusFilter === "all" || 
//       (statusFilter === "active" && val.is_active) ||
//       (statusFilter === "inactive" && !val.is_active);
    
//     return matchesSearch && matchesStatus;
//   });

//   // Handle value creation/update
//   const handleValueSubmit = async () => {
//     if (!valueFormData.value.trim()) {
//       alert("Please enter a value");
//       return;
//     }

//     if (!masterType) {
//       alert("Master type not found");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       if (valueFormData.id) {
//         // Update existing value
//         const res = await updateMasterValue(valueFormData.id, {
//           value: valueFormData.value.trim(),
//           is_active: valueFormData.is_active,
//         });
        
//         if (res.success) {
//           await loadData();
//           setShowValueForm(false);
//           resetValueForm();
//         } else {
//           alert(res.error || "Failed to update value");
//         }
//       } else {
//         // Create new value
//         const res = await createMasterValue({
//           master_type_id: masterType.id,
//           value: valueFormData.value.trim(),
//           is_active: valueFormData.is_active,
//         });
        
//         if (res.success) {
//           await loadData();
//           setShowValueForm(false);
//           resetValueForm();
//         } else {
//           alert(res.error || "Failed to create value");
//         }
//       }
//     } catch (error: any) {
//       console.error("Failed to save value:", error);
//       alert(`Error: ${error.message || "Failed to save value"}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Handle delete value
//   const handleDeleteValue = async (id: number) => {
//     setShowDeleteValueConfirm(null);
//     try {
//       const res = await deleteMasterValue(id);
//       if (res.success) {
//         await loadData();
//       } else {
//         alert(res.error || "Failed to delete value");
//       }
//     } catch (error: any) {
//       console.error("Failed to delete value:", error);
//       alert(`Error: ${error.message || "Failed to delete value"}`);
//     }
//   };

//   // Toggle value status
//   const toggleValueStatus = async (id: number, current: boolean) => {
//     setTogglingValueId(id);
//     try {
//       const newStatus = !current;
//       const res = await toggleMasterValueStatus(id, newStatus);
      
//       if (res.success) {
//         // Update local state
//         setValues(prev => prev.map(val => 
//           val.id === id ? { ...val, is_active: newStatus } : val
//         ));
//       } else {
//         alert(res.error || "Failed to toggle status");
//       }
//     } catch (error: any) {
//       console.error("Failed to toggle status:", error);
//       alert(`Error: ${error.message || "Failed to toggle status"}`);
//     } finally {
//       setTogglingValueId(null);
//     }
//   };

//   // Reset value form
//   const resetValueForm = () => {
//     setValueFormData({
//       id: null,
//       value: "",
//       is_active: true,
//     });
//   };

//   // Handle edit value
//   const handleEditValue = (value: MasterValue) => {
//     setValueFormData({
//       id: value.id,
//       value: value.value,
//       is_active: value.is_active,
//     });
//     setShowValueForm(true);
//   };

//   // Format date
//   const formatDate = (dateString: string) => {
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric'
//       });
//     } catch {
//       return "Invalid date";
//     }
//   };

//   // Calculate statistics
//   const totalValues = values.length;
//   const activeValues = values.filter(v => v.is_active).length;

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   if (!masterType) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
//           <h3 className="mt-4 text-lg font-semibold text-gray-800">Master Type Not Found</h3>
//           <button
//             onClick={() => router.push("/admin/masters")}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
//           >
//             <ArrowLeft size={16} className="inline mr-2" />
//             Back to Masters
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto p-4 md:p-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => router.push("/admin/masters")}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <ChevronLeft className="h-5 w-5 text-gray-600" />
//               </button>
//               <div className="p-2 bg-blue-50 rounded-lg">
//                 <Tag className="h-6 w-6 text-blue-600" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-800">{masterType.name}</h1>
//                 <div className="flex items-center gap-3 mt-1">
//                   <code className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
//                     {masterType.code}
//                   </code>
//                   <span className={`px-2 py-1 text-xs rounded ${
//                     masterType.is_active 
//                       ? 'bg-green-100 text-green-700' 
//                       : 'bg-gray-100 text-gray-700'
//                   }`}>
//                     {masterType.is_active ? 'Active' : 'Inactive'}
//                   </span>
//                 </div>
//               </div>
//             </div>
            
//             <div className="flex gap-2">
//               <button
//                 onClick={loadData}
//                 disabled={loading}
//                 className="px-3 py-2 bg-white border rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
//               >
//                 <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
//                 Refresh
//               </button>
              
//               <button
//                 onClick={() => setShowValueForm(true)}
//                 className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 text-sm"
//               >
//                 <Plus size={16} />
//                 New Value
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto p-4 md:p-6">
//         {/* Stats Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
//           <div className="bg-white rounded-xl shadow-sm p-4 border">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Tab</p>
//                 <p className="text-lg font-semibold text-gray-800">
//                   {masterType.tab || 'General'}
//                 </p>
//               </div>
//               <div className="p-2 bg-gray-100 rounded-lg">
//                 <Grid className="h-5 w-5 text-gray-600" />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl shadow-sm p-4 border">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Total Values</p>
//                 <p className="text-lg font-semibold text-gray-800">{totalValues}</p>
//               </div>
//               <div className="p-2 bg-gray-100 rounded-lg">
//                 <Hash className="h-5 w-5 text-gray-600" />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-xl shadow-sm p-4 border">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">Active Values</p>
//                 <p className="text-lg font-semibold text-green-600">{activeValues}</p>
//               </div>
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <CheckCircle className="h-5 w-5 text-green-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Search & Filters */}
//         <div className="bg-white rounded-xl shadow-sm p-4 border mb-6">
//           <div className="space-y-3">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <input
//                 type="text"
//                 placeholder="Search values..."
//                 className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
            
//             <div className="flex items-center gap-2">
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value as any)}
//                 className="px-3 py-2 bg-gray-50 border rounded-lg text-sm flex-1"
//               >
//                 <option value="all">All Status</option>
//                 <option value="active">Active Only</option>
//                 <option value="inactive">Inactive Only</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Values List */}
//         <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//           {filteredValues.length === 0 ? (
//             <div className="p-8 text-center">
//               <Tag className="h-12 w-12 mx-auto text-gray-300" />
//               <h3 className="mt-2 text-lg font-semibold text-gray-800">No Values Found</h3>
//               <p className="text-gray-600 mb-4">
//                 {searchTerm || statusFilter !== "all" 
//                   ? "No matching values found" 
//                   : "No values created yet"}
//               </p>
//               <button
//                 onClick={() => setShowValueForm(true)}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
//               >
//                 <Plus size={16} className="inline mr-1" />
//                 Create First Value
//               </button>
//             </div>
//           ) : (
//             <div className="divide-y">
//               {filteredValues.map((value) => (
//                 <div
//                   key={value.id}
//                   className={`p-4 ${!value.is_active ? 'opacity-70' : ''}`}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex items-start gap-3">
//                       <div className={`p-2 rounded-lg ${
//                         value.is_active 
//                           ? 'bg-green-50 text-green-600' 
//                           : 'bg-gray-50 text-gray-400'
//                       }`}>
//                         <Hash size={16} />
//                       </div>
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2">
//                           <h3 className="font-semibold text-gray-800 text-sm">
//                             {value.value}
//                           </h3>
//                           {!value.is_active && (
//                             <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
//                               Inactive
//                             </span>
//                           )}
//                         </div>
                        
//                         <div className="flex items-center gap-3 mt-2">
//                           <span className="text-xs text-gray-400">
//                             Created {formatDate(value.created_at)}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     {/* Value Actions */}
//                     <div className="flex items-center gap-1">
//                       <button
//                         onClick={() => toggleValueStatus(value.id, value.is_active)}
//                         disabled={togglingValueId === value.id}
//                         className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
//                           value.is_active
//                             ? "bg-green-100 text-green-700 hover:bg-green-200"
//                             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         }`}
//                       >
//                         {togglingValueId === value.id ? (
//                           <Loader2 size={12} className="animate-spin" />
//                         ) : value.is_active ? (
//                           <>
//                             <Check size={12} />
//                             Active
//                           </>
//                         ) : (
//                           <>
//                             <X size={12} />
//                             Inactive
//                           </>
//                         )}
//                       </button>
                      
//                       <button
//                         onClick={() => handleEditValue(value)}
//                         className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
//                         title="Edit"
//                       >
//                         <Edit2 size={14} />
//                       </button>
                      
//                       <button
//                         onClick={() => setShowDeleteValueConfirm(value.id)}
//                         className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
//                         title="Delete"
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Value Form Modal */}
//       {showValueForm && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//             <div className="p-4 border-b">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   {valueFormData.id ? <Edit2 className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
//                   <h2 className="font-bold text-gray-800">
//                     {valueFormData.id ? "Edit Value" : "Create New Value"}
//                   </h2>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setShowValueForm(false);
//                     resetValueForm();
//                   }}
//                   className="p-1 hover:bg-gray-100 rounded"
//                 >
//                   <X className="h-4 w-4 text-gray-400" />
//                 </button>
//               </div>
//               {masterType && (
//                 <p className="text-sm text-gray-600 mt-1">
//                   Type: {masterType.name} ({masterType.code})
//                 </p>
//               )}
//             </div>
            
//             <div className="p-4">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Value *
//                   </label>
//                   <input
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter value..."
//                     value={valueFormData.value}
//                     onChange={(e) => setValueFormData({...valueFormData, value: e.target.value})}
//                     autoFocus
//                   />
//                 </div>
                
//                 <div className="p-3 bg-gray-50 rounded-lg border">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <span className="text-sm font-medium text-gray-700">Active Status</span>
//                       <p className="text-xs text-gray-500">Only active values are available in forms</p>
//                     </div>
//                     <label className="relative inline-flex items-center cursor-pointer">
//                       <input
//                         type="checkbox"
//                         className="sr-only peer"
//                         checked={valueFormData.is_active}
//                         onChange={(e) => setValueFormData({...valueFormData, is_active: e.target.checked})}
//                       />
//                       <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
//                     </label>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="flex gap-2 mt-6">
//                 <button
//                   onClick={() => {
//                     setShowValueForm(false);
//                     resetValueForm();
//                   }}
//                   className="flex-1 px-3 py-2 border text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleValueSubmit}
//                   disabled={!valueFormData.value.trim() || submitting}
//                   className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 ${
//                     !valueFormData.value.trim() || submitting
//                       ? "bg-gray-300 text-gray-500"
//                       : "bg-blue-600 hover:bg-blue-700 text-white"
//                   }`}
//                 >
//                   {submitting ? (
//                     <Loader2 size={16} className="animate-spin" />
//                   ) : valueFormData.id ? (
//                     <>
//                       <Save size={16} />
//                       Update
//                     </>
//                   ) : (
//                     <>
//                       <Plus size={16} />
//                       Create
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Value Confirmation Modal */}
//       {showDeleteValueConfirm && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//             <div className="p-4 border-b">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="h-5 w-5 text-red-600" />
//                 <h2 className="font-bold text-gray-800">Delete Value</h2>
//               </div>
//             </div>
            
//             <div className="p-4">
//               <p className="text-gray-700 mb-4 text-sm">
//                 Are you sure you want to delete this value?
//               </p>
              
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setShowDeleteValueConfirm(null)}
//                   className="flex-1 px-3 py-2 border text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDeleteValue(showDeleteValueConfirm)}
//                   className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm flex items-center justify-center gap-1"
//                 >
//                   <Trash2 size={16} />
//                   Delete Value
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMasterTypeById, getMasterValues } from "@/lib/masterApi";
import ValuesClient from "@/components/admin/masters/[typeId]/ValuesClient";
import Loading from "@/components/admin/masters/[typeId]/loading";
import ErrorComponent from "@/components/admin/masters/[typeId]/error";

export default function MasterValuesPage() {
  const { typeId } = useParams<{ typeId: string }>();
  const [masterType, setMasterType] = useState<any>(null);
  const [initialValues, setInitialValues] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!typeId) {
      setError(new Error("Type ID is required"));
      return;
    }
    Promise.all([getMasterTypeById(typeId), getMasterValues(typeId)])
      .then(([typeRes, valuesRes]) => {
        if (!typeRes.success || !typeRes.data) {
          setError(new Error("Type ID is required"));
          return;
        }
        setMasterType(typeRes.data);
        setInitialValues(valuesRes.success && Array.isArray(valuesRes.data) ? valuesRes.data : []);
      })
      .catch((err) => setError(err instanceof Error ? err : new Error(String(err))));
  }, [typeId]);

  if (error) return <ErrorComponent error={error} />;
  if (!masterType) return <Loading />;
  return <ValuesClient masterType={masterType} initialValues={initialValues} />;
}