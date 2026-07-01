

// // CategoryMappingTab.tsx - Full replacement with Bulk Delete & SweetAlert2 (BuyersPage style)
// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { toast } from "sonner";
// import { Plus, Edit2, Trash2, Link, ChevronDown, ChevronUp, Download, Upload, Trash } from "lucide-react";
// import * as XLSX from "xlsx";
// import Swal from "sweetalert2";
// import {
//   getAllMappings,
//   bulkSaveMappings,
//   deleteMappingsByCategory,
// } from "@/lib/categorySubcategoryMapApi";
// import CategoryMappingForm from "./CategoryMappingForm";

// interface Mapping {
//   id: number;
//   category_id: string;
//   category_name: string;
//   subcategory_id: string;
//   subcategory_name: string;
//   isactive: number;
// }

// export default function CategoryMappingTab() {
//   const [mappings, setMappings] = useState<Mapping[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editData, setEditData] = useState<any | null>(null);
//   const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
//   const [showImportModal, setShowImportModal] = useState(false);
//   const [importing, setImporting] = useState(false);
//   const [importPreview, setImportPreview] = useState<any[]>([]);
//   const [importFile, setImportFile] = useState<File | null>(null);
//   const fileRef = useRef<HTMLInputElement>(null);

//   // Bulk delete states
//   const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
//   const [bulkDeleting, setBulkDeleting] = useState(false);

//   const loadMappings = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await getAllMappings();
//       setMappings(res?.data || []);
//       setSelectedCategories(new Set()); // clear selection on refresh
//     } catch {
//       toast.error("Failed to load mappings");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { loadMappings(); }, [loadMappings]);

//   const grouped = mappings.reduce((acc: Record<string, any>, m) => {
//     if (!acc[m.category_id]) {
//       acc[m.category_id] = {
//         category_id: m.category_id,
//         category_name: m.category_name,
//         subcategories: []
//       };
//     }
//     acc[m.category_id].subcategories.push(m);
//     return acc;
//   }, {});

//   const groupedList = Object.values(grouped);

//   // ── Export current mappings to Excel
//   const handleExport = () => {
//     if (groupedList.length === 0) {
//       toast.error("No mappings to export");
//       return;
//     }

//     const rows: any[] = [];
//     groupedList.forEach((group: any) => {
//       group.subcategories.forEach((s: any) => {
//         rows.push({
//           "Category Name": group.category_name,
//           "Sub Category Name": s.subcategory_name,
//         });
//       });
//     });

//     const ws = XLSX.utils.json_to_sheet(rows);
//     ws["!cols"] = [{ wch: 25 }, { wch: 25 }];
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Category Mappings");
//     XLSX.writeFile(wb, "category_mappings_export.xlsx");
//     toast.success("Exported successfully");
//   };

//   // ── Download blank template
//   const handleDownloadTemplate = () => {
//     const templateData = [
//       { "Category Name": "Cleaning", "Sub Category Name": "Deep Clean" },
//       { "Category Name": "Cleaning", "Sub Category Name": "Regular Clean" },
//       { "Category Name": "Food", "Sub Category Name": "Groceries" },
//       { "Category Name": "Food", "Sub Category Name": "Snacks" },
//     ];

//     const ws = XLSX.utils.json_to_sheet(templateData);
//     ws["!cols"] = [{ wch: 25 }, { wch: 25 }];

//     // Add instructions sheet
//     const instructions = [
//       { "Instructions": "Fill Category Name and Sub Category Name" },
//       { "Instructions": "One row per subcategory" },
//       { "Instructions": "Same category name = same group" },
//       { "Instructions": "Do NOT change column headers" },
//     ];
//     const wsInstr = XLSX.utils.json_to_sheet(instructions);
//     wsInstr["!cols"] = [{ wch: 50 }];

//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Template");
//     XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");
//     XLSX.writeFile(wb, "category_mapping_template.xlsx");
//     toast.success("Template downloaded");
//   };

//   // ── Parse uploaded file for preview
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setImportFile(file);

//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       try {
//         const data = new Uint8Array(ev.target?.result as ArrayBuffer);
//         const wb = XLSX.read(data, { type: "array" });
//         const sheetName = wb.SheetNames.find(n => n !== "Instructions") || wb.SheetNames[0];
//         const ws = wb.Sheets[sheetName];
//         const rows: any[] = XLSX.utils.sheet_to_json(ws);

//         // Group by category
//         const groupedPreview: Record<string, string[]> = {};
//         rows.forEach((row: any) => {
//           const cat = (row["Category Name"] || "").trim();
//           const sub = (row["Sub Category Name"] || "").trim();
//           if (cat && sub) {
//             if (!groupedPreview[cat]) groupedPreview[cat] = [];
//             if (!groupedPreview[cat].includes(sub)) groupedPreview[cat].push(sub);
//           }
//         });

//         const preview = Object.entries(groupedPreview).map(([cat, subs]) => ({
//           category_name: cat,
//           subcategories: subs,
//         }));

//         setImportPreview(preview);
//       } catch {
//         toast.error("Failed to parse file");
//         setImportPreview([]);
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   // ── Save imported data
//   const handleImportSave = async () => {
//     if (importPreview.length === 0) {
//       toast.error("No valid data to import");
//       return;
//     }

//     setImporting(true);
//     let success = 0, failed = 0;

//     try {
//       for (const group of importPreview) {
//         try {
//           await bulkSaveMappings({
//             category_id: group.category_name.toLowerCase().replace(/\s+/g, "_"),
//             category_name: group.category_name,
//             subcategories: group.subcategories.map((s: string, i: number) => ({
//               subcategory_id: `${group.category_name}_${i}_${Date.now()}`,
//               subcategory_name: s,
//             })),
//           });
//           success++;
//         } catch {
//           failed++;
//         }
//       }

//       if (failed > 0) {
//         toast.success(`Imported ${success} categories, ${failed} failed`);
//       } else {
//         toast.success(`Successfully imported ${success} categories`);
//       }

//       setShowImportModal(false);
//       setImportPreview([]);
//       setImportFile(null);
//       loadMappings();
//     } finally {
//       setImporting(false);
//     }
//   };

//   const toggleExpand = (categoryId: string) => {
//     setExpandedCategories(prev => {
//       const next = new Set(prev);
//       if (next.has(categoryId)) next.delete(categoryId);
//       else next.add(categoryId);
//       return next;
//     });
//   };

//   // ── Single Delete with SweetAlert2 (BuyersPage style)
//   const handleDelete = async (category_id: string, category_name: string) => {
//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       text: `You are about to delete ALL subcategory mappings for "${category_name}". This action cannot be undone!`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'Cancel',
//       background: '#fff',
//       backdrop: 'rgba(0,0,0,0.4)',
//       width: '400px',
//       padding: '1.5rem',
//       customClass: {
//         popup: 'rounded-xl shadow-2xl',
//         title: 'text-lg font-bold text-gray-800',
//         htmlContainer: 'text-sm text-gray-600 my-2',
//         confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
//         cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
//         actions: 'flex justify-center gap-2 mt-4'
//       },
//       buttonsStyling: false,
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await deleteMappingsByCategory(category_id);
//       Swal.fire({
//         title: 'Deleted!',
//         text: `Mappings for "${category_name}" have been deleted.`,
//         icon: 'success',
//         timer: 1500,
//         showConfirmButton: false,
//         width: '350px',
//         padding: '1rem',
//         customClass: {
//           popup: 'rounded-xl shadow-2xl',
//           title: 'text-base font-bold text-green-600',
//           htmlContainer: 'text-xs text-gray-600'
//         }
//       });
//       loadMappings();
//     } catch {
//       Swal.fire({
//         title: 'Error!',
//         text: 'Failed to delete mappings. Please try again.',
//         icon: 'error',
//         confirmButtonColor: '#3085d6',
//         confirmButtonText: 'OK',
//         width: '350px',
//         padding: '1rem',
//         customClass: {
//           popup: 'rounded-xl shadow-2xl',
//           title: 'text-base font-bold text-red-600',
//           htmlContainer: 'text-xs text-gray-600',
//           confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
//         },
//         buttonsStyling: false
//       });
//     }
//   };

//   // ── Bulk Delete Logic (BuyersPage style)
//   const handleBulkDelete = async () => {
//     if (selectedCategories.size === 0) {
//       toast.info('No categories selected for deletion.');
//       return;
//     }

//     const categoriesToDelete = groupedList.filter((g: any) => selectedCategories.has(g.category_id));
//     const categoryNamesList = categoriesToDelete.map((g: any) => g.category_name).join(', ');

//     const result = await Swal.fire({
//       title: 'Bulk Delete Categories',
//       html: `You are about to delete <strong>${selectedCategories.size}</strong> category group(s):<br/><span style="font-size:0.9rem;">${categoryNamesList}</span><br/><br/>All their subcategory mappings will be permanently removed.`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: `Yes, delete ${selectedCategories.size} group(s)!`,
//       cancelButtonText: 'Cancel',
//       background: '#fff',
//       backdrop: 'rgba(0,0,0,0.4)',
//       width: '500px',
//       padding: '1.5rem',
//       customClass: {
//         popup: 'rounded-xl shadow-2xl',
//         title: 'text-lg font-bold text-gray-800',
//         htmlContainer: 'text-sm text-gray-600 my-2',
//         confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
//         cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
//         actions: 'flex justify-center gap-2 mt-4'
//       },
//       buttonsStyling: false,
//     });

//     if (!result.isConfirmed) return;

//     setBulkDeleting(true);
//     let successCount = 0;
//     let failCount = 0;

//     // Delete each selected category
//     const deletePromises = Array.from(selectedCategories).map(catId =>
//       deleteMappingsByCategory(catId).then(() => true).catch(() => false)
//     );

//     const results = await Promise.allSettled(deletePromises);
//     results.forEach(res => {
//       if (res.status === 'fulfilled' && res.value === true) successCount++;
//       else failCount++;
//     });

//     setBulkDeleting(false);

//     if (failCount === 0) {
//       Swal.fire({
//         title: 'Deleted!',
//         text: `Successfully deleted ${successCount} category group(s).`,
//         icon: 'success',
//         timer: 1500,
//         showConfirmButton: false,
//         width: '350px',
//         padding: '1rem',
//         customClass: {
//           popup: 'rounded-xl shadow-2xl',
//           title: 'text-base font-bold text-green-600',
//           htmlContainer: 'text-xs text-gray-600'
//         }
//       });
//     } else {
//       Swal.fire({
//         title: 'Partial Success',
//         text: `Deleted ${successCount} groups, ${failCount} failed.`,
//         icon: 'warning',
//         confirmButtonText: 'OK',
//         width: '350px',
//         padding: '1rem',
//         customClass: {
//           popup: 'rounded-xl shadow-2xl',
//           title: 'text-base font-bold text-amber-600',
//           confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg'
//         },
//         buttonsStyling: false
//       });
//     }

//     setSelectedCategories(new Set());
//     loadMappings();
//   };

//   // ── Select / Deselect single category
//   const toggleSelectCategory = (categoryId: string) => {
//     setSelectedCategories(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(categoryId)) newSet.delete(categoryId);
//       else newSet.add(categoryId);
//       return newSet;
//     });
//   };

//   // ── Select / Deselect all
//   const toggleSelectAll = () => {
//     if (selectedCategories.size === groupedList.length) {
//       setSelectedCategories(new Set());
//     } else {
//       setSelectedCategories(new Set(groupedList.map((g: any) => g.category_id)));
//     }
//   };

//   const handleEdit = (group: any) => {
//     setEditData(group);
//     setShowForm(true);
//   };

//   const handleFormSubmit = async (data: any) => {
//     try {
//       await bulkSaveMappings(data);
//       toast.success(editData ? "Mapping updated" : "Mapping created");
//       setShowForm(false);
//       setEditData(null);
//       loadMappings();
//     } catch {
//       toast.error("Failed to save mapping");
//     }
//   };

//   const isAllSelected = groupedList.length > 0 && selectedCategories.size === groupedList.length;

//   return (
//     <div>
//       {/* Header */}
//       <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
//         <div className="flex items-center gap-2">
//           <Link size={16} className="text-blue-600" />
//           <span className="text-sm font-semibold text-gray-700">
//             Category → Subcategory Mappings ({groupedList.length})
//           </span>
//         </div>
//         <div className="flex items-center gap-2 flex-wrap">
//           {/* Bulk Delete Button */}
//           {selectedCategories.size > 0 && (
//             <button
//               onClick={handleBulkDelete}
//               disabled={bulkDeleting}
//               className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50"
//             >
//               <Trash size={13} />
//               Delete Selected ({selectedCategories.size})
//             </button>
//           )}

//           {/* Download Template */}
//           <button onClick={handleDownloadTemplate}
//             className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
//             <Download size={13} />
//             Template
//           </button>

//           {/* Export */}
//           <button onClick={handleExport}
//             className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
//             <Download size={13} />
//             Export
//           </button>

//           {/* Import */}
//           <button onClick={() => { setShowImportModal(true); setImportPreview([]); setImportFile(null); }}
//             className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 text-blue-600 bg-blue-50 rounded-lg text-xs font-medium hover:bg-blue-100">
//             <Upload size={13} />
//             Import
//           </button>

//           {/* Add Mapping */}
//           <button onClick={() => { setEditData(null); setShowForm(true); }}
//             className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white rounded-lg text-xs font-medium hover:bg-blue-700">
//             <Plus size={13} />
//             Add Mapping
//           </button>
//         </div>
//       </div>

//       {/* Table */}
//       {loading ? (
//         <div className="bg-white rounded-xl border p-8 text-center text-sm text-gray-400">Loading mappings...</div>
//       ) : groupedList.length === 0 ? (
//         <div className="bg-white rounded-xl border p-8 text-center">
//           <Link size={32} className="mx-auto mb-3 text-gray-300" />
//           <p className="text-sm text-gray-500 mb-3">No mappings created yet</p>
//           <div className="flex items-center justify-center gap-2">
//             <button onClick={handleDownloadTemplate}
//               className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 flex items-center gap-1">
//               <Download size={12} /> Download Template
//             </button>
//             <button onClick={() => setShowImportModal(true)}
//               className="px-3 py-1.5 border border-blue-200 text-blue-600 bg-blue-50 rounded-lg text-xs hover:bg-blue-100 flex items-center gap-1">
//               <Upload size={12} /> Import Excel
//             </button>
//             <button onClick={() => setShowForm(true)}
//               className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
//               + Add Manually
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl border overflow-hidden overflow-y-auto max-h-[380px] sm:max-h-[450px]">
//           <table className="w-full border-collapse">
//             <thead className="sticky top-0 z-10">
//               <tr className="bg-gray-50 border-b">
//                 <th className="text-left p-3 text-xs font-semibold text-gray-600 w-10">
//                   <input
//                     type="checkbox"
//                     checked={isAllSelected}
//                     onChange={toggleSelectAll}
//                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
//                 </th>
//                 <th className="text-left p-3 text-xs font-semibold text-gray-600">#</th>
//                 <th className="text-left p-3 text-xs font-semibold text-gray-600">Category</th>
//                 <th className="text-left p-3 text-xs font-semibold text-gray-600">Sub Categories</th>
//                 <th className="text-left p-3 text-xs font-semibold text-gray-600">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {groupedList.map((group: any, idx) => {
//                 const isExpanded = expandedCategories.has(group.category_id);
//                 const isSelected = selectedCategories.has(group.category_id);
//                 return (
//                   <tr key={group.category_id} className="border-b hover:bg-gray-50">
//                     <td className="p-3">
//                       <input
//                         type="checkbox"
//                         checked={isSelected}
//                         onChange={() => toggleSelectCategory(group.category_id)}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                     </td>
//                     <td className="p-3 text-xs text-gray-500">{idx + 1}</td>
//                     <td className="p-3">
//                       <span className="text-sm font-semibold text-gray-800">{group.category_name}</span>
//                     </td>
//                     <td className="p-3">
//                       <div className="flex items-center gap-2 flex-wrap">
//                         {group.subcategories.slice(0, isExpanded ? undefined : 3).map((s: any) => (
//                           <span key={s.id} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-xs">
//                             {s.subcategory_name}
//                           </span>
//                         ))}
//                         {group.subcategories.length > 3 && (
//                           <button onClick={() => toggleExpand(group.category_id)}
//                             className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
//                             {isExpanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> +{group.subcategories.length - 3} more</>}
//                           </button>
//                         )}
//                       </div>
//                       <div className="text-xs text-gray-400 mt-1">{group.subcategories.length} subcategories</div>
//                     </td>
//                     <td className="p-3">
//                       <div className="flex items-center gap-2">
//                         <button onClick={() => handleEdit(group)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
//                           <Edit2 size={14} />
//                         </button>
//                         <button onClick={() => handleDelete(group.category_id, group.category_name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete">
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//           <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-400 sticky bottom-0 flex justify-between items-center">
//             <span>{groupedList.length} categories mapped</span>
//             {selectedCategories.size > 0 && (
//               <span className="text-blue-600">{selectedCategories.size} selected</span>
//             )}
//           </div>
//         </div>
//       )}

//       {/* IMPORT MODAL (unchanged) */}
//       {showImportModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
//             <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-[#1A2B6D] to-[#3B5BDB]">
//               <h2 className="text-sm font-bold text-white">📥 Import Category Mappings</h2>
//               <button onClick={() => setShowImportModal(false)} className="text-white/70 hover:text-white text-lg">×</button>
//             </div>
//             <div className="flex-1 overflow-y-auto p-5 space-y-4">
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                 <p className="text-xs font-semibold text-blue-700 mb-2">Step 1: Download Template</p>
//                 <p className="text-xs text-blue-600 mb-2">Template has 2 columns: Category Name, Sub Category Name. One row per subcategory.</p>
//                 <button onClick={handleDownloadTemplate}
//                   className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50">
//                   <Download size={12} /> Download Template
//                 </button>
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-700 mb-2">Step 2: Upload Filled Excel</p>
//                 <div
//                   onClick={() => fileRef.current?.click()}
//                   className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
//                     importFile ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300"
//                   }`}
//                 >
//                   <Upload size={20} className={`mx-auto mb-2 ${importFile ? "text-blue-500" : "text-gray-400"}`} />
//                   <p className="text-xs font-medium text-gray-600">
//                     {importFile ? importFile.name : "Click to upload Excel file"}
//                   </p>
//                   <p className="text-xs text-gray-400 mt-1">.xlsx or .xls files only</p>
//                   <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
//                 </div>
//               </div>
//               {importPreview.length > 0 && (
//                 <div>
//                   <p className="text-xs font-semibold text-gray-700 mb-2">Step 3: Preview ({importPreview.length} categories found)</p>
//                   <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
//                     <table className="w-full text-xs border-collapse">
//                       <thead className="sticky top-0 bg-gray-50">
//                         <tr className="border-b">
//                           <th className="text-left p-2 font-semibold text-gray-600">Category</th>
//                           <th className="text-left p-2 font-semibold text-gray-600">Sub Categories</th>
//                           <th className="text-left p-2 font-semibold text-gray-600">Count</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {importPreview.map((row, i) => (
//                           <tr key={i} className="border-b hover:bg-gray-50">
//                             <td className="p-2 font-medium text-gray-800">{row.category_name}</td>
//                             <td className="p-2">
//                               <div className="flex flex-wrap gap-1">
//                                 {row.subcategories.slice(0, 4).map((s: string, j: number) => (
//                                   <span key={j} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">{s}</span>
//                                 ))}
//                                 {row.subcategories.length > 4 && (
//                                   <span className="text-gray-400 text-xs">+{row.subcategories.length - 4} more</span>
//                                 )}
//                               </div>
//                             </td>
//                             <td className="p-2 text-gray-500">{row.subcategories.length}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                   <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
//                     ⚠️ Existing mappings for these categories will be replaced.
//                   </p>
//                 </div>
//               )}
//             </div>
//             <div className="px-5 py-4 border-t flex gap-3">
//               <button onClick={() => { setShowImportModal(false); setImportPreview([]); setImportFile(null); }}
//                 className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
//                 Cancel
//               </button>
//               <button
//                 onClick={handleImportSave}
//                 disabled={importing || importPreview.length === 0}
//                 className="flex-1 py-2 bg-gradient-to-r from-[#1A2B6D] to-[#3B5BDB] text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {importing ? (
//                   <><span className="animate-spin">⟳</span> Importing...</>
//                 ) : (
//                   <>✓ Import {importPreview.length > 0 ? `(${importPreview.length} categories)` : ""}</>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add/Edit Form Modal */}
//       {showForm && (
//         <CategoryMappingForm
//           initialData={editData}
//           onSubmit={handleFormSubmit}
//           onClose={() => { setShowForm(false); setEditData(null); }}
//         />
//       )}
//     </div>
//   );
// }




// CategoryMappingTab.tsx - Full replacement with Bulk Delete & SweetAlert2 (BuyersPage style) + Expense/Inventory toggle
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Link, ChevronDown, ChevronUp, Download, Upload, Trash, Package, Receipt } from "lucide-react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  getAllMappings,
  bulkSaveMappings,
  deleteMappingsByCategory,
  MapType,
} from "@/lib/categorySubcategoryMapApi";
import CategoryMappingForm from "./CategoryMappingForm";

interface Mapping {
  id: number;
  category_id: string;
  category_name: string;
  subcategory_id: string;
  subcategory_name: string;
  isactive: number;
}

export default function CategoryMappingTab() {
  // ── NEW: which mapping type is active (expense vs inventory)
  const [mapType, setMapType] = useState<MapType>("expense");
  const childLabel = mapType === "inventory" ? "Item" : "Sub Category";
  const childLabelPlural = mapType === "inventory" ? "Items" : "Sub Categories";

  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Bulk delete states
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadMappings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllMappings(mapType);
      setMappings(res?.data || []);
      setSelectedCategories(new Set()); // clear selection on refresh
    } catch {
      toast.error("Failed to load mappings");
    } finally {
      setLoading(false);
    }
  }, [mapType]);

  useEffect(() => { loadMappings(); }, [loadMappings]);

  const grouped = mappings.reduce((acc: Record<string, any>, m) => {
    if (!acc[m.category_id]) {
      acc[m.category_id] = {
        category_id: m.category_id,
        category_name: m.category_name,
        subcategories: []
      };
    }
    acc[m.category_id].subcategories.push(m);
    return acc;
  }, {});

  const groupedList = Object.values(grouped);

  // ── Export current mappings to Excel
  const handleExport = () => {
    if (groupedList.length === 0) {
      toast.error("No mappings to export");
      return;
    }

    const rows: any[] = [];
    groupedList.forEach((group: any) => {
      group.subcategories.forEach((s: any) => {
        rows.push({
          "Category Name": group.category_name,
          [`${childLabel} Name`]: s.subcategory_name,
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 25 }, { wch: 25 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Category Mappings");
    XLSX.writeFile(wb, `${mapType}_category_mappings_export.xlsx`);
    toast.success("Exported successfully");
  };

  // ── Download blank template
  const handleDownloadTemplate = () => {
    const templateData = mapType === "inventory" ? [
      { "Category Name": "Cleaning", "Item Name": "Mop" },
      { "Category Name": "Cleaning", "Item Name": "Bucket" },
      { "Category Name": "Electronics", "Item Name": "Bulb" },
      { "Category Name": "Electronics", "Item Name": "Switch Board" },
    ] : [
      { "Category Name": "Cleaning", "Sub Category Name": "Deep Clean" },
      { "Category Name": "Cleaning", "Sub Category Name": "Regular Clean" },
      { "Category Name": "Food", "Sub Category Name": "Groceries" },
      { "Category Name": "Food", "Sub Category Name": "Snacks" },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = [{ wch: 25 }, { wch: 25 }];

    // Add instructions sheet
    const instructions = [
      { "Instructions": `Fill Category Name and ${childLabel} Name` },
      { "Instructions": `One row per ${childLabel.toLowerCase()}` },
      { "Instructions": "Same category name = same group" },
      { "Instructions": "Do NOT change column headers" },
    ];
    const wsInstr = XLSX.utils.json_to_sheet(instructions);
    wsInstr["!cols"] = [{ wch: 50 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");
    XLSX.writeFile(wb, `${mapType}_category_mapping_template.xlsx`);
    toast.success("Template downloaded");
  };

  // ── Parse uploaded file for preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheetName = wb.SheetNames.find(n => n !== "Instructions") || wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);

        const childCol = mapType === "inventory" ? "Item Name" : "Sub Category Name";

        // Group by category
        const groupedPreview: Record<string, string[]> = {};
        rows.forEach((row: any) => {
          const cat = (row["Category Name"] || "").trim();
          const sub = (row[childCol] || row["Sub Category Name"] || row["Item Name"] || "").trim();
          if (cat && sub) {
            if (!groupedPreview[cat]) groupedPreview[cat] = [];
            if (!groupedPreview[cat].includes(sub)) groupedPreview[cat].push(sub);
          }
        });

        const preview = Object.entries(groupedPreview).map(([cat, subs]) => ({
          category_name: cat,
          subcategories: subs,
        }));

        setImportPreview(preview);
      } catch {
        toast.error("Failed to parse file");
        setImportPreview([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Save imported data
  const handleImportSave = async () => {
    if (importPreview.length === 0) {
      toast.error("No valid data to import");
      return;
    }

    setImporting(true);
    let success = 0, failed = 0;

    try {
      for (const group of importPreview) {
        try {
          await bulkSaveMappings({
            category_id: group.category_name.toLowerCase().replace(/\s+/g, "_"),
            category_name: group.category_name,
            subcategories: group.subcategories.map((s: string, i: number) => ({
              subcategory_id: `${group.category_name}_${i}_${Date.now()}`,
              subcategory_name: s,
            })),
            map_type: mapType,
          });
          success++;
        } catch {
          failed++;
        }
      }

      if (failed > 0) {
        toast.success(`Imported ${success} categories, ${failed} failed`);
      } else {
        toast.success(`Successfully imported ${success} categories`);
      }

      setShowImportModal(false);
      setImportPreview([]);
      setImportFile(null);
      loadMappings();
    } finally {
      setImporting(false);
    }
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  // ── Single Delete with SweetAlert2 (BuyersPage style)
  const handleDelete = async (category_id: string, category_name: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ALL ${childLabelPlural.toLowerCase()} mappings for "${category_name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
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
      await deleteMappingsByCategory(category_id, mapType);
      Swal.fire({
        title: 'Deleted!',
        text: `Mappings for "${category_name}" have been deleted.`,
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
      loadMappings();
    } catch {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete mappings. Please try again.',
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
    }
  };

  // ── Bulk Delete Logic (BuyersPage style)
  const handleBulkDelete = async () => {
    if (selectedCategories.size === 0) {
      toast.info('No categories selected for deletion.');
      return;
    }

    const categoriesToDelete = groupedList.filter((g: any) => selectedCategories.has(g.category_id));
    const categoryNamesList = categoriesToDelete.map((g: any) => g.category_name).join(', ');

    const result = await Swal.fire({
      title: 'Bulk Delete Categories',
      html: `You are about to delete <strong>${selectedCategories.size}</strong> category group(s):<br/><span style="font-size:0.9rem;">${categoryNamesList}</span><br/><br/>All their ${childLabelPlural.toLowerCase()} mappings will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Yes, delete ${selectedCategories.size} group(s)!`,
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
      width: '500px',
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

    setBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    // Delete each selected category
    const deletePromises = Array.from(selectedCategories).map(catId =>
      deleteMappingsByCategory(catId, mapType).then(() => true).catch(() => false)
    );

    const results = await Promise.allSettled(deletePromises);
    results.forEach(res => {
      if (res.status === 'fulfilled' && res.value === true) successCount++;
      else failCount++;
    });

    setBulkDeleting(false);

    if (failCount === 0) {
      Swal.fire({
        title: 'Deleted!',
        text: `Successfully deleted ${successCount} category group(s).`,
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
    } else {
      Swal.fire({
        title: 'Partial Success',
        text: `Deleted ${successCount} groups, ${failCount} failed.`,
        icon: 'warning',
        confirmButtonText: 'OK',
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-amber-600',
          confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg'
        },
        buttonsStyling: false
      });
    }

    setSelectedCategories(new Set());
    loadMappings();
  };

  // ── Select / Deselect single category
  const toggleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) newSet.delete(categoryId);
      else newSet.add(categoryId);
      return newSet;
    });
  };

  // ── Select / Deselect all
  const toggleSelectAll = () => {
    if (selectedCategories.size === groupedList.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(groupedList.map((g: any) => g.category_id)));
    }
  };

  const handleEdit = (group: any) => {
    setEditData(group);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await bulkSaveMappings({ ...data, map_type: mapType });
      toast.success(editData ? "Mapping updated" : "Mapping created");
      setShowForm(false);
      setEditData(null);
      loadMappings();
    } catch {
      toast.error("Failed to save mapping");
    }
  };

  const isAllSelected = groupedList.length > 0 && selectedCategories.size === groupedList.length;

  return (
    <div>
      {/* ── Expense / Inventory toggle ── */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setMapType("expense")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mapType === "expense"
              ? "bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Receipt size={14} /> Expense Mapping
        </button>
        <button
          onClick={() => setMapType("inventory")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mapType === "inventory"
              ? "bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Package size={14} /> Inventory Mapping
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Link size={16} className="text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">
            Category → {childLabelPlural} Mappings ({groupedList.length})
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bulk Delete Button */}
          {selectedCategories.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50"
            >
              <Trash size={13} />
              Delete Selected ({selectedCategories.size})
            </button>
          )}

          {/* Download Template */}
          <button onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
            <Download size={13} />
            Template
          </button>

          {/* Export */}
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
            <Download size={13} />
            Export
          </button>

          {/* Import */}
          <button onClick={() => { setShowImportModal(true); setImportPreview([]); setImportFile(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 text-blue-600 bg-blue-50 rounded-lg text-xs font-medium hover:bg-blue-100">
            <Upload size={13} />
            Import
          </button>

          {/* Add Mapping */}
          <button onClick={() => { setEditData(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white rounded-lg text-xs font-medium hover:bg-blue-700">
            <Plus size={13} />
            Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border p-8 text-center text-sm text-gray-400">Loading mappings...</div>
      ) : groupedList.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center">
          <Link size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 mb-3">No mappings created yet</p>
          <div className="flex items-center justify-center gap-2">
            <button onClick={handleDownloadTemplate}
              className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 flex items-center gap-1">
              <Download size={12} /> Download Template
            </button>
            <button onClick={() => setShowImportModal(true)}
              className="px-3 py-1.5 border border-blue-200 text-blue-600 bg-blue-50 rounded-lg text-xs hover:bg-blue-100 flex items-center gap-1">
              <Upload size={12} /> Import Excel
            </button>
            <button onClick={() => setShowForm(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
              + Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden overflow-y-auto max-h-[350px] sm:max-h-[400px]">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3 text-xs font-semibold text-gray-600 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left p-3 text-xs font-semibold text-gray-600">#</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-600">Category</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-600">{childLabelPlural}</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedList.map((group: any, idx) => {
                const isExpanded = expandedCategories.has(group.category_id);
                const isSelected = selectedCategories.has(group.category_id);
                return (
                  <tr key={group.category_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectCategory(group.category_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3 text-xs text-gray-500">{idx + 1}</td>
                    <td className="p-3">
                      <span className="text-sm font-semibold text-gray-800">{group.category_name}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {group.subcategories.slice(0, isExpanded ? undefined : 3).map((s: any) => (
                          <span key={s.id} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-xs">
                            {s.subcategory_name}
                          </span>
                        ))}
                        {group.subcategories.length > 3 && (
                          <button onClick={() => toggleExpand(group.category_id)}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                            {isExpanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> +{group.subcategories.length - 3} more</>}
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{group.subcategories.length} {childLabelPlural.toLowerCase()}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(group)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(group.category_id, group.category_name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-400 sticky bottom-0 flex justify-between items-center">
            <span>{groupedList.length} categories mapped</span>
            {selectedCategories.size > 0 && (
              <span className="text-blue-600">{selectedCategories.size} selected</span>
            )}
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-[#1A2B6D] to-[#3B5BDB]">
              <h2 className="text-sm font-bold text-white">📥 Import {childLabelPlural} Mappings</h2>
              <button onClick={() => setShowImportModal(false)} className="text-white/70 hover:text-white text-lg">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-700 mb-2">Step 1: Download Template</p>
                <p className="text-xs text-blue-600 mb-2">Template has 2 columns: Category Name, {childLabel} Name. One row per {childLabel.toLowerCase()}.</p>
                <button onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-300 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50">
                  <Download size={12} /> Download Template
                </button>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Step 2: Upload Filled Excel</p>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    importFile ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <Upload size={20} className={`mx-auto mb-2 ${importFile ? "text-blue-500" : "text-gray-400"}`} />
                  <p className="text-xs font-medium text-gray-600">
                    {importFile ? importFile.name : "Click to upload Excel file"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">.xlsx or .xls files only</p>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                </div>
              </div>
              {importPreview.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Step 3: Preview ({importPreview.length} categories found)</p>
                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr className="border-b">
                          <th className="text-left p-2 font-semibold text-gray-600">Category</th>
                          <th className="text-left p-2 font-semibold text-gray-600">{childLabelPlural}</th>
                          <th className="text-left p-2 font-semibold text-gray-600">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((row, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium text-gray-800">{row.category_name}</td>
                            <td className="p-2">
                              <div className="flex flex-wrap gap-1">
                                {row.subcategories.slice(0, 4).map((s: string, j: number) => (
                                  <span key={j} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">{s}</span>
                                ))}
                                {row.subcategories.length > 4 && (
                                  <span className="text-gray-400 text-xs">+{row.subcategories.length - 4} more</span>
                                )}
                              </div>
                            </td>
                            <td className="p-2 text-gray-500">{row.subcategories.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                    ⚠️ Existing mappings for these categories will be replaced.
                  </p>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t flex gap-3">
              <button onClick={() => { setShowImportModal(false); setImportPreview([]); setImportFile(null); }}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleImportSave}
                disabled={importing || importPreview.length === 0}
                className="flex-1 py-2 bg-gradient-to-r from-[#1A2B6D] to-[#3B5BDB] text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {importing ? (
                  <><span className="animate-spin">⟳</span> Importing...</>
                ) : (
                  <>✓ Import {importPreview.length > 0 ? `(${importPreview.length} categories)` : ""}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <CategoryMappingForm
          initialData={editData}
          childLabel={childLabel}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditData(null); }}
        />
      )}
    </div>
  );
}