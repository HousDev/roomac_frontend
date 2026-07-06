

// "use client";

// import { useState, useEffect, useMemo } from 'react';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   ArrowUpDown,
//   Search,
//   Filter,
//   Download,
//   MoreHorizontal,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCw
// } from 'lucide-react';
// import MySwal from '@/app/utils/swal';

// export interface Column<T> {
//   key: string;
//   label: string;
//   sortable?: boolean;
//   filterable?: boolean;
//   render?: (item: T) => React.ReactNode;
//   width?: string;
// }

// export interface FilterConfig {
//   key: string;
//   label: string;
//   type: 'text' | 'select' | 'date';
//   icon?: React.ReactNode;
//   placeholder?: string;
//   options?: { value: string; label: string }[];
// }

// export interface BulkAction {
//   label: string;
//   icon?: React.ReactNode;
//   action: (selectedRows: any[]) => void;
//   variant?: 'default' | 'destructive';
//   confirmMessage?: string;
// }

// export interface ActionButton<T> {
//   label: string;
//   icon?: React.ReactNode;
//   action: (item: T) => void;
//   variant?: 'default' | 'destructive' | 'outline';
//   show?: (item: T) => boolean;
// }

// interface DataTableProps<T> {
//   data: T[];
//   columns: Column<T>[];
//   filters?: FilterConfig[];
//   bulkActions?: BulkAction[];
//   actions?: ActionButton<T>[];
//   onRefresh?: () => void;
//   loading?: boolean;
//   searchPlaceholder?: string;
//   emptyMessage?: React.ReactNode;
//   pageSize?: number;
//   showSearch?: boolean;
//   showFilters?: boolean;
//   showRefresh?: boolean;
//   showExport?: boolean;
//   onSearchChange?: (search: string) => void;
//   onFilterChange?: (key: string, value: string) => void;
//   onSelectionChange?: (selectedIds: string[]) => void; // New prop
// }

// export function DataTable<T extends { id: string | number }>({
//   data,
//   columns,
//   filters = [],
//   bulkActions = [],
//   actions = [],
//   onRefresh,
//   loading = false,
//   searchPlaceholder = 'Search...',
//   emptyMessage = 'No data available',
//   pageSize = 20,
//   showSearch = true,
//   showFilters = true,
//   showRefresh = true,
//   showExport = true,
//   onSearchChange,
//   onFilterChange,
//   onSelectionChange, // New prop
// }: DataTableProps<T>) {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortKey, setSortKey] = useState<string>('');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
//   const [selectedRows, setSelectedRows] = useState<T[]>([]);
//   const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showFiltersPanel, setShowFiltersPanel] = useState(false);

//   // Initialize filters
//   useEffect(() => {
//     const defaultFilters: Record<string, string> = {};
//     filters.forEach(filter => {
//       defaultFilters[filter.key] = '';
//     });
    
//     if (Object.keys(activeFilters).length === 0) {
//       setActiveFilters(defaultFilters);
//     }
//   }, [filters]);

//   // Notify parent of selection changes
//   useEffect(() => {
//     if (onSelectionChange) {
//       const selectedIds = selectedRows.map(row => String(row.id));
//       onSelectionChange(selectedIds);
//     }
//   }, [selectedRows, onSelectionChange]);

//   const handleSort = (key: string) => {
//     if (sortKey === key) {
//       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortKey(key);
//       setSortOrder('asc');
//     }
//     setCurrentPage(1);
//   };

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       setSelectedRows(paginatedData);
//     } else {
//       setSelectedRows([]);
//     }
//   };

//   const handleSelectRow = (row: T, checked: boolean) => {
//     if (checked) {
//       setSelectedRows([...selectedRows, row]);
//     } else {
//       setSelectedRows(selectedRows.filter(selectedRow => selectedRow.id !== row.id));
//     }
//   };

//   const handleBulkAction = async (action: BulkAction) => {
//     if (selectedRows.length === 0) return;

//     if (action.confirmMessage) {
//       const result = await MySwal.fire({
//       title: "Delete Item?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#C62828",
//       cancelButtonColor: "#6b7280",
//       confirmButtonText: "Delete",
//     });

//     if (!result.isConfirmed) return;
//     }

//     action.action(selectedRows);
//     setSelectedRows([]);
//     if (onRefresh) onRefresh();
//   };

//   const handleFilterChange = (key: string, value: string) => {
//     const newFilters = {
//       ...activeFilters,
//       [key]: value
//     };
//     setActiveFilters(newFilters);
//     setCurrentPage(1);
    
//     if (onFilterChange) {
//       onFilterChange(key, value);
//     }
//   };

//   const clearFilters = () => {
//     const clearedFilters: Record<string, string> = {};
//     filters.forEach(filter => {
//       clearedFilters[filter.key] = '';
//     });
    
//     setActiveFilters(clearedFilters);
//     setSearchTerm('');
//     setCurrentPage(1);
//   };

//   const exportToCSV = () => {
//     const headers = columns.map(col => col.label).join(',');
//     const rows = filteredData.map(item =>
//       columns.map(col => {
//         const value = (item as any)[col.key];
//         return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
//       }).join(',')
//     );
//     const csv = [headers, ...rows].join('\n');
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `export-${Date.now()}.csv`;
//     a.click();
//   };

//   // Apply search
//   const searchFilteredData = useMemo(() => {
//     if (!searchTerm.trim()) return data;
    
//     const searchLower = searchTerm.toLowerCase();
    
//     return data.filter(item => {
//       return columns.some(col => {
//         const value = (item as any)[col.key];
        
//         if (value === null || value === undefined) return false;
        
//         if (typeof value === 'string') {
//           return value.toLowerCase().includes(searchLower);
//         }
//         if (typeof value === 'number' || typeof value === 'boolean') {
//           return String(value).toLowerCase().includes(searchLower);
//         }
//         if (typeof value === 'object') {
//           try {
//             return JSON.stringify(value).toLowerCase().includes(searchLower);
//           } catch {
//             return false;
//           }
//         }
//         return false;
//       });
//     });
//   }, [data, searchTerm, columns]);

//   // Apply filters
//   const filteredData = useMemo(() => {
//     let result = [...searchFilteredData];
    
//     Object.entries(activeFilters).forEach(([key, value]) => {
//       if (value && value.trim() !== '') {
//         result = result.filter(item => {
//           const itemValue = (item as any)[key];
          
//           if (itemValue === null || itemValue === undefined) {
//             return false;
//           }
          
//           if (typeof itemValue === 'boolean') {
//             const boolString = itemValue ? 'true' : 'false';
//             return boolString === value;
//           }
          
//           if (typeof itemValue === 'string') {
//             return itemValue.toLowerCase().includes(value.toLowerCase());
//           }
          
//           if (typeof itemValue === 'number') {
//             return String(itemValue) === value;
//           }
          
//           return String(itemValue).toLowerCase().includes(value.toLowerCase());
//         });
//       }
//     });

//     return result;
//   }, [searchFilteredData, activeFilters]);

//   // Apply sorting
//   const sortedData = useMemo(() => {
//     if (!sortKey) return filteredData;
    
//     return [...filteredData].sort((a, b) => {
//       const aValue = (a as any)[sortKey];
//       const bValue = (b as any)[sortKey];

//       if (aValue === null || aValue === undefined) return sortOrder === 'asc' ? -1 : 1;
//       if (bValue === null || bValue === undefined) return sortOrder === 'asc' ? 1 : -1;

//       if (typeof aValue === 'string' && typeof bValue === 'string') {
//         return sortOrder === 'asc' 
//           ? aValue.localeCompare(bValue)
//           : bValue.localeCompare(aValue);
//       }
      
//       if (typeof aValue === 'number' && typeof bValue === 'number') {
//         return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
//       }
      
//       if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
//         return sortOrder === 'asc' 
//           ? (aValue === bValue ? 0 : aValue ? 1 : -1)
//           : (aValue === bValue ? 0 : aValue ? -1 : 1);
//       }

//       const aStr = String(aValue);
//       const bStr = String(bValue);
//       const comparison = aStr.localeCompare(bStr);
//       return sortOrder === 'asc' ? comparison : -comparison;
//     });
//   }, [filteredData, sortKey, sortOrder]);

//   // Calculate pagination
//   const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
//   const startIndex = (currentPage - 1) * pageSize;
//   const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

//   // Reset to first page if current page is out of bounds
//   useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(1);
//     }
//   }, [currentPage, totalPages]);

//   const allSelected = paginatedData.length > 0 && selectedRows.length === paginatedData.length;
//   const someSelected = selectedRows.length > 0 && selectedRows.length < paginatedData.length;

//   return (
//     <div className="space-y-4">
//       {/* Only show search/filter/refresh controls if enabled */}
//       {(showSearch || showFilters || showRefresh || showExport) && (
//         <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//           <div className="flex gap-2 flex-1 w-full sm:w-auto">
//             {showSearch && (
//               <div className="relative flex-1 sm:max-w-sm">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <Input
//                   placeholder={searchPlaceholder}
//                   value={searchTerm}
//                   onChange={(e) => {
//                     const newSearch = e.target.value;
//                     setSearchTerm(newSearch);
//                     setCurrentPage(1);
                    
//                     if (onSearchChange) {
//                       onSearchChange(newSearch);
//                     }
//                   }}
//                   className="pl-10"
//                 />
//               </div>
//             )}
//             {showFilters && filters.length > 0 && (
//               <Button
//                 variant="outline"
//                 onClick={() => setShowFiltersPanel(!showFiltersPanel)}
//                 className="flex items-center gap-2"
//               >
//                 <Filter className="h-4 w-4" />
//                 Filters
//                 {Object.values(activeFilters).some(v => v && v.trim() !== '') && (
//                   <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
//                 )}
//               </Button>
//             )}
//           </div>

//           <div className="flex gap-2 w-full sm:w-auto">
//             {bulkActions.length > 0 && selectedRows.length > 0 && (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline">
//                     Bulk Actions ({selectedRows.length})
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   {bulkActions.map((action, index) => (
//                     <DropdownMenuItem
//                       key={index}
//                       onClick={() => handleBulkAction(action)}
//                       className={action.variant === 'destructive' ? 'text-red-600' : ''}
//                     >
//                       {action.icon}
//                       <span className="ml-2">{action.label}</span>
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             )}

//             {showExport && (
//               <Button variant="outline" size="icon" onClick={exportToCSV}>
//                 <Download className="h-4 w-4" />
//               </Button>
//             )}
            
//             {showRefresh && onRefresh && (
//               <Button variant="outline" onClick={onRefresh}>
//                 <RefreshCw className="h-4 w-4 mr-2" />
//                 Refresh
//               </Button>
//             )}
//           </div>
//         </div>
//       )}

//       {showFiltersPanel && filters.length > 0 && (
//         <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-lg border">
//           {filters.map(filter => (
//             <div key={filter.key} className="flex-1 min-w-[200px]">
//               <label className="text-sm font-medium mb-1 block">{filter.label}</label>
//               {filter.type === 'select' && filter.options ? (
//                 <Select
//                   value={activeFilters[filter.key] || ''}
//                   onValueChange={(value) => handleFilterChange(filter.key, value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder={`All ${filter.label}`} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="">All {filter.label}</SelectItem>
//                     {filter.options.map(option => (
//                       <SelectItem key={option.value} value={option.value}>
//                         {option.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               ) : (
//                 <Input
//                   type={filter.type}
//                   placeholder={`Filter by ${filter.label}`}
//                   value={activeFilters[filter.key] || ''}
//                   onChange={(e) => handleFilterChange(filter.key, e.target.value)}
//                 />
//               )}
//             </div>
//           ))}
//           <div className="flex items-end gap-2">
//             <Button
//               variant="outline"
//               onClick={clearFilters}
//               className="whitespace-nowrap"
//             >
//               Clear All
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setShowFiltersPanel(false)}
//             >
//               Close
//             </Button>
//           </div>
//         </div>
//       )}

//       <div className="border rounded-lg overflow-hidden">
//         <Table>
//           <TableHeader>
//             <TableRow className="bg-slate-50">
//               {(bulkActions.length > 0 || actions.length > 0) && (
//                 <TableHead className="w-12">
//                   {bulkActions.length > 0 && (
//                     <Checkbox
//                       checked={allSelected}
//                       onCheckedChange={(checked) => {
//                         if (checked === 'indeterminate') {
//                           setSelectedRows(paginatedData);
//                         } else {
//                           handleSelectAll(checked as boolean);
//                         }
//                       }}
//                       ref={(el: any) => {
//                         if (el) {
//                           (el as any).indeterminate = someSelected;
//                         }
//                       }}
//                     />
//                   )}
//                 </TableHead>
//               )}
//               {columns.map(column => (
//                 <TableHead
//                   key={column.key}
//                   className={column.width}
//                 >
//                   <div className={`flex items-center gap-2 ${column.sortable ? 'cursor-pointer hover:text-slate-900' : ''}`}
//                        onClick={() => column.sortable && handleSort(column.key)}>
//                     {column.label}
//                     {column.sortable && (
//                       <ArrowUpDown className={`h-4 w-4 ${sortKey === column.key ? 'text-blue-600' : 'text-slate-400'}`} />
//                     )}
//                   </div>
//                 </TableHead>
//               ))}
//               {actions.length > 0 && (
//                 <TableHead className="w-20 text-right">Actions</TableHead>
//               )}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {loading ? (
//               <TableRow>
//                 <TableCell colSpan={columns.length + (bulkActions.length > 0 || actions.length > 0 ? 1 : 0)} 
//                           className="text-center py-8">
//                   <div className="flex items-center justify-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                     <span className="ml-2">Loading...</span>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ) : paginatedData.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={columns.length + (bulkActions.length > 0 || actions.length > 0 ? 1 : 0)} 
//                           className="text-center py-8 text-slate-500">
//                   {emptyMessage}
//                 </TableCell>
//               </TableRow>
//             ) : (
//               paginatedData.map((item) => (
//                 <TableRow key={item.id} className="hover:bg-slate-50">
//                   {(bulkActions.length > 0 || actions.length > 0) && (
//                     <TableCell>
//                       {bulkActions.length > 0 && (
//                         <Checkbox
//                           checked={selectedRows.some(selectedRow => selectedRow.id === item.id)}
//                           onCheckedChange={(checked) => handleSelectRow(item, checked as boolean)}
//                         />
//                       )}
//                     </TableCell>
//                   )}
//                   {columns.map(column => (
//                     <TableCell key={column.key} className="py-2">
//                       {column.render
//                         ? column.render(item)
//                         : ((item as any)[column.key]?.toString() || '-')}
//                     </TableCell>
//                   ))}
//                   {actions.length > 0 && (
//                     <TableCell className="text-right py-2">
//                       <DropdownMenu>
//                         <DropdownMenuTrigger asChild>
//                           <Button variant="ghost" size="icon" className="h-8 w-8">
//                             <MoreHorizontal className="h-4 w-4" />
//                           </Button>
//                         </DropdownMenuTrigger>
//                         <DropdownMenuContent align="end">
//                           {actions.map((action, index) => {
//                             if (action.show && !action.show(item)) return null;
//                             return (
//                               <DropdownMenuItem
//                                 key={index}
//                                 onClick={() => action.action(item)}
//                                 className={action.variant === 'destructive' ? 'text-red-600' : ''}
//                               >
//                                 {action.icon}
//                                 <span className="ml-2">{action.label}</span>
//                               </DropdownMenuItem>
//                             );
//                           })}
//                         </DropdownMenuContent>
//                       </DropdownMenu>
//                     </TableCell>
//                   )}
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {totalPages > 1 && (
//         <div className="flex items-center justify-between">
//           <div className="text-sm text-slate-600">
//             Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length} results
//           </div>
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//               disabled={currentPage === 1}
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <div className="flex items-center gap-1">
//               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                 let pageNum: number;
//                 if (totalPages <= 5) {
//                   pageNum = i + 1;
//                 } else if (currentPage <= 3) {
//                   pageNum = i + 1;
//                 } else if (currentPage >= totalPages - 2) {
//                   pageNum = totalPages - 4 + i;
//                 } else {
//                   pageNum = currentPage - 2 + i;
//                 }
//                 return (
//                   <Button
//                     key={pageNum}
//                     variant={currentPage === pageNum ? 'default' : 'outline'}
//                     size="sm"
//                     onClick={() => setCurrentPage(pageNum)}
//                     className="w-8"
//                   >
//                     {pageNum}
//                   </Button>
//                 );
//               })}
//             </div>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//               disabled={currentPage === totalPages}
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import MySwal from "@/app/utils/swal";

// ─── Types (unchanged) ────────────────────────────────────────────────────────
export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "select" | "date";
  icon?: React.ReactNode;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  action: (selectedRows: any[]) => void;
  variant?: "default" | "destructive";
  confirmMessage?: string;
}

export interface ActionButton<T> {
  label: string;
  icon?: React.ReactNode;
  action: (item: T) => void;
  variant?: "default" | "destructive" | "outline";
  show?: (item: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: FilterConfig[];
  bulkActions?: BulkAction[];
  actions?: ActionButton<T>[];
  onRefresh?: () => void;
  loading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: React.ReactNode;
  pageSize?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showRefresh?: boolean;
  showExport?: boolean;
  onSearchChange?: (search: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  filters = [],
  bulkActions = [],
  actions = [],
  onRefresh,
  loading = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No data available",
  pageSize: initialPageSize = 10,
  showSearch = true,
  showFilters = true,
  showRefresh = true,
  showExport = true,
  onSearchChange,
  onFilterChange,
  onSelectionChange,
}: DataTableProps<T>) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "All">(initialPageSize);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // ── Initialize filters ──────────────────────────────────────────────────
  useEffect(() => {
    const defaultFilters: Record<string, string> = {};
    filters.forEach((filter) => {
      defaultFilters[filter.key] = "";
    });
    if (Object.keys(activeFilters).length === 0) {
      setActiveFilters(defaultFilters);
    }
  }, [filters]);

  // ── Selection notification ─────────────────────────────────────────────
  useEffect(() => {
    if (onSelectionChange) {
      const selectedIds = selectedRows.map((row) => String(row.id));
      onSelectionChange(selectedIds);
    }
  }, [selectedRows, onSelectionChange]);

  // ── Sorting ─────────────────────────────────────────────────────────────
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // ── Selection ───────────────────────────────────────────────────────────
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedData);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, row]);
    } else {
      setSelectedRows(selectedRows.filter((selectedRow) => selectedRow.id !== row.id));
    }
  };

  // ── Bulk actions ────────────────────────────────────────────────────────
  const handleBulkAction = async (action: BulkAction) => {
    if (selectedRows.length === 0) return;
    if (action.confirmMessage) {
      const result = await MySwal.fire({
        title: "Confirm Action",
        text: action.confirmMessage,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#C62828",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Confirm",
      });
      if (!result.isConfirmed) return;
    }
    action.action(selectedRows);
    setSelectedRows([]);
    if (onRefresh) onRefresh();
  };

  // ── Filter handling ─────────────────────────────────────────────────────
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    setCurrentPage(1);
    if (onFilterChange) onFilterChange(key, value);
  };

  const clearFilters = () => {
    const clearedFilters: Record<string, string> = {};
    filters.forEach((filter) => {
      clearedFilters[filter.key] = "";
    });
    setActiveFilters(clearedFilters);
    setSearchTerm("");
    setCurrentPage(1);
  };

  // ── Export ──────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    const headers = columns.map((col) => col.label).join(",");
    const rows = filteredData.map((item) =>
      columns
        .map((col) => {
          const value = (item as any)[col.key];
          return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
  };

  // ── Data processing ────────────────────────────────────────────────────
  // Search
  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const searchLower = searchTerm.toLowerCase();
    return data.filter((item) =>
      columns.some((col) => {
        const value = (item as any)[col.key];
        if (value === null || value === undefined) return false;
        if (typeof value === "string") return value.toLowerCase().includes(searchLower);
        if (typeof value === "number" || typeof value === "boolean")
          return String(value).toLowerCase().includes(searchLower);
        if (typeof value === "object") {
          try {
            return JSON.stringify(value).toLowerCase().includes(searchLower);
          } catch {
            return false;
          }
        }
        return false;
      })
    );
  }, [data, searchTerm, columns]);

  // Filters
  const filteredData = useMemo(() => {
    let result = [...searchFilteredData];
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        result = result.filter((item) => {
          const itemValue = (item as any)[key];
          if (itemValue === null || itemValue === undefined) return false;
          if (typeof itemValue === "boolean") {
            return String(itemValue) === value;
          }
          if (typeof itemValue === "string") {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }
          if (typeof itemValue === "number") {
            return String(itemValue) === value;
          }
          return String(itemValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    });
    return result;
  }, [searchFilteredData, activeFilters]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortKey];
      const bValue = (b as any)[sortKey];
      if (aValue === null || aValue === undefined) return sortOrder === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortOrder === "asc" ? 1 : -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortOrder === "asc" ? (aValue === bValue ? 0 : aValue ? 1 : -1) : (aValue === bValue ? 0 : aValue ? -1 : 1);
      }
      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = pageSize === "All" ? 1 : Math.ceil(totalItems / (pageSize as number)) || 1;
  const startIndex = pageSize === "All" ? 0 : (currentPage - 1) * (pageSize as number);
  const paginatedData = pageSize === "All" ? sortedData : sortedData.slice(startIndex, startIndex + (pageSize as number));

  // Reset page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  // ── UI helpers ──────────────────────────────────────────────────────────
  const allSelected = paginatedData.length > 0 && selectedRows.length === paginatedData.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < paginatedData.length;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* ── Bulk actions bar ────────────────────────────────────────────── */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between gap-3 border border-[#E2E8F4] rounded-xl px-3 py-2 min-h-[44px] bg-white">
          <span className="font-bold text-[#1A2B6D] text-sm whitespace-nowrap">
            {selectedRows.length} selected
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedRows([])}
              className="text-xs text-[#8892A4] hover:text-gray-600 px-2 py-1"
            >
              Clear
            </button>
            {bulkActions.map((action, idx) => {
              const isDestructive = action.variant === "destructive";
              return (
                <button
                  key={idx}
                  onClick={() => handleBulkAction(action)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors",
                    isDestructive
                      ? "bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] hover:bg-red-100"
                      : "bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
                  )}
                >
                  {action.icon}
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Top controls ────────────────────────────────────────────────── */}
      {(showSearch || showFilters || showRefresh || showExport) && (
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1 w-full sm:w-auto">
            {showSearch && (
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                    if (onSearchChange) onSearchChange(e.target.value);
                  }}
                  className="pl-10 h-8 text-xs"
                />
              </div>
            )}
            {showFilters && filters.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center gap-2 h-8 text-xs"
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                {Object.values(activeFilters).some((v) => v && v.trim() !== "") && (
                  <span className="h-2 w-2 bg-blue-600 rounded-full" />
                )}
              </Button>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {showExport && (
              <Button variant="outline" size="sm" onClick={exportToCSV} className="h-8 text-xs gap-1">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            )}
            {showRefresh && onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} className="h-8 text-xs gap-1">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Filters panel ───────────────────────────────────────────────── */}
      {showFiltersPanel && filters.length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 bg-slate-50 rounded-lg border">
          {filters.map((filter) => (
            <div key={filter.key} className="flex-1 min-w-[160px]">
              <label className="text-[10px] font-medium text-gray-600 block mb-0.5">{filter.label}</label>
              {filter.type === "select" && filter.options ? (
                <Select
                  value={activeFilters[filter.key] || ""}
                  onValueChange={(value) => handleFilterChange(filter.key, value)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder={`All ${filter.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All {filter.label}</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={filter.type}
                  placeholder={`Filter by ${filter.label}`}
                  value={activeFilters[filter.key] || ""}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="h-7 text-xs"
                />
              )}
            </div>
          ))}
          <div className="flex items-end gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters} className="h-7 text-xs">
              Clear All
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowFiltersPanel(false)} className="h-7 text-xs">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* ─── TABLE ────────────────────────────────────────────────────────── */}
      <Card className="border rounded-lg shadow-sm overflow-hidden">
        <div className="flex flex-col" style={{ height: window.innerWidth < 640 ? "420px" : "520px" }}>
          <div className="overflow-auto flex-1 min-h-0">
            <table
              className="border-collapse text-[11px] font-sans w-full"
              style={{ tableLayout: "fixed", minWidth: "900px" }}
            >
              <colgroup>
                {/* Checkbox column */}
                {(bulkActions.length > 0 || actions.length > 0) && (
                  <col style={{ width: "34px" }} />
                )}
                {columns.map((col) => {
                  let width = col.width || "auto";
                  if (!col.width) {
                    if (col.key === "name") width = "180px";
                    else if (col.key === "capacity") width = "120px";
                    else if (col.key === "pricing") width = "110px";
                    else if (col.key === "terms") width = "130px";
                    else if (col.key === "is_active") width = "100px";
                    else if (col.key === "tags") width = "150px";
                    else width = "120px";
                  }
                  return <col key={col.key} style={{ width }} />;
                })}
                {actions.length > 0 && <col style={{ width: "100px" }} />}
              </colgroup>

              <thead className="sticky top-0 z-10">
                {/* Header row */}
                <tr className="bg-gray-200 border-b border-gray-300">
                  {(bulkActions.length > 0 || actions.length > 0) && (
                    <th className="px-1.5 py-1 text-center border-r border-gray-300 bg-gray-200">
                      {bulkActions.length > 0 && (
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-3.5 h-3.5 cursor-pointer"
                        />
                      )}
                    </th>
                  )}
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "px-1.5 py-1 text-left border-r border-gray-300 bg-gray-200",
                        col.sortable && "cursor-pointer hover:bg-gray-300"
                      )}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide flex items-center gap-1">
                        {col.label}
                        {col.sortable && (
                          <span className="text-[8px] text-gray-400">
                            {sortKey === col.key && (sortOrder === "asc" ? "↑" : "↓")}
                          </span>
                        )}
                      </span>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-1.5 py-1 text-right bg-gray-200">
                      <span className="font-semibold text-gray-700 text-[10px] uppercase tracking-wide">
                        Actions
                      </span>
                    </th>
                  )}
                </tr>

                {/* Search row - only if filters are defined and showFilters is true */}
                {showFilters && filters.length > 0 && (
                  <tr className="bg-white border-b border-gray-300">
                    {(bulkActions.length > 0 || actions.length > 0) && (
                      <td className="p-1 border-r border-gray-200" />
                    )}
                    {columns.map((col) => {
                      const filter = filters.find((f) => f.key === col.key);
                      if (!filter) {
                        return <td key={col.key} className="p-1 border-r border-gray-200" />;
                      }
                      return (
                        <td key={col.key} className="p-1 border-r border-gray-200">
                          {filter.type === "select" && filter.options ? (
                            <Select
                              value={activeFilters[filter.key] || ""}
                              onValueChange={(val) => handleFilterChange(filter.key, val)}
                            >
                              <SelectTrigger className="w-full h-5 text-[10px] border-gray-300 rounded-md bg-white">
                                <SelectValue placeholder="All" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All</SelectItem>
                                {filter.options.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder={filter.placeholder || "Search…"}
                              value={activeFilters[filter.key] || ""}
                              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                              className="w-full h-5 px-1.5 py-0.5 border border-gray-300 rounded-md text-[10px] outline-none bg-white focus:border-blue-400 focus:ring-0"
                            />
                          )}
                        </td>
                      );
                    })}
                    {actions.length > 0 && <td className="p-1" />}
                  </tr>
                )}
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={
                        columns.length +
                        ((bulkActions.length > 0 || actions.length > 0) ? 1 : 0) +
                        (actions.length > 0 ? 1 : 0)
                      }
                      className="text-center py-12"
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Loading…</p>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        columns.length +
                        ((bulkActions.length > 0 || actions.length > 0) ? 1 : 0) +
                        (actions.length > 0 ? 1 : 0)
                      }
                      className="text-center py-12"
                    >
                      <div className="text-sm font-medium text-gray-500">{emptyMessage}</div>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item) => (
                    <tr key={String(item.id)} className="border-b border-slate-200 hover:bg-slate-50">
                      {(bulkActions.length > 0 || actions.length > 0) && (
                        <td className="px-1.5 py-1 text-center border-r border-slate-200">
                          {bulkActions.length > 0 && (
                            <input
                              type="checkbox"
                              checked={selectedRows.some((row) => row.id === item.id)}
                              onChange={(e) => handleSelectRow(item, e.target.checked)}
                              className="w-3.5 h-3.5 cursor-pointer"
                            />
                          )}
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key} className="px-1.5 py-1 border-r border-slate-200 text-xs">
                          {col.render ? col.render(item) : (item as any)[col.key]?.toString() || "-"}
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td className="px-1.5 py-1 text-right">
                          <div className="flex justify-end gap-0.5 flex-wrap">
                            {actions.map((action, idx) => {
                              if (action.show && !action.show(item)) return null;
                              const isDestructive = action.variant === "destructive";
                              const isOutline = action.variant === "outline";
                              return (
                                <button
                                  key={idx}
                                  title={action.label}
                                  onClick={() => action.action(item)}
                                  className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
                                    isDestructive
                                      ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                      : isOutline
                                      ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                      : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  )}
                                >
                                  {action.icon || (
                                    <span className="text-[10px] font-medium">{action.label}</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
          {!loading && totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Show</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => {
                    const newSize = val === "All" ? "All" : Number(val);
                    setPageSize(newSize as any);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-6 w-16 text-[10px] border-gray-200 px-1">
                    <SelectValue>{pageSize}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50, 100, "All"].map((size) => (
                      <SelectItem key={String(size)} value={String(size)} className="text-xs">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>entries</span>
                <span className="ml-2">
                  Showing{" "}
                  {pageSize === "All"
                    ? 1
                    : (currentPage - 1) * (pageSize as number) + 1}
                  –
                  {pageSize === "All"
                    ? totalItems
                    : Math.min(currentPage * (pageSize as number), totalItems)}{" "}
                  of {totalItems}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "h-6 w-6 p-0 text-[10px]",
                        currentPage === pageNum &&
                          "bg-blue-600 text-white border-blue-600"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}