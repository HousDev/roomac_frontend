// // components/admin/masters/[itemId]/ValueList.tsx
// "use client";

// import { Search, Plus, Edit2, Trash2, Power, CheckSquare, Square } from "lucide-react";
// import { formatDate } from "@/components/admin/masters/table-config";

// interface MasterValue {
//   id: number;
//   name: string;
//   isactive: number;
//   created_at: string;
// }

// interface ValueListProps {
//   values: MasterValue[];
//   loading: boolean;
//   searchTerm: string;
//   onSearchChange: (term: string) => void;
//   statusFilter: "all" | "active" | "inactive";
//   onStatusFilterChange: (filter: "all" | "active" | "inactive") => void;
//   togglingValueId: number | null;
//   onEditValue: (value: MasterValue) => void;
//   onToggleStatus: (id: number, current: number) => void;
//   onDeleteValue: (id: number) => void;
//   onNewValue: () => void;
//   selectedValues: number[];
//   onToggleSelect: (id: number) => void;
//   onToggleSelectAll: () => void;
// }

// export default function ValueList({
//   values,
//   loading,
//   searchTerm,
//   onSearchChange,
//   statusFilter,
//   onStatusFilterChange,
//   togglingValueId,
//   onEditValue,
//   onToggleStatus,
//   onDeleteValue,
//   onNewValue,
//   selectedValues,
//   onToggleSelect,
//   onToggleSelectAll
// }: ValueListProps) {
//   return (
//     <div className="space-y-3">
//       {/* Search and Filter Bar */}
//       <div className="flex items-center gap-2 bg-white p-3 rounded-lg border">
//         <div className="flex-1 relative">
//           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search values..."
//             className="w-full pl-8 pr-3 py-1.5 bg-white border rounded-lg text-xs focus:ring-1 focus:ring-blue-500"
//             value={searchTerm}
//             onChange={(e) => onSearchChange(e.target.value)}
//           />
//         </div>
//         <select
//           value={statusFilter}
//           onChange={(e) => onStatusFilterChange(e.target.value as any)}
//           className="px-2 py-1.5 bg-white border rounded-lg text-xs"
//         >
//           <option value="all">All Status</option>
//           <option value="active">Active Only</option>
//           <option value="inactive">Inactive Only</option>
//         </select>
        
//       </div>

//       {/* Values Table */}
//       <div className="bg-white rounded-lg border overflow-hidden">
//         {loading ? (
//           <div className="p-8 text-center">
//             <div className="inline-block h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//             <p className="text-xs text-gray-500 mt-2">Loading values...</p>
//           </div>
//         ) : values.length === 0 ? (
//           <div className="p-8 text-center">
//             <div className="max-w-sm mx-auto">
//               <p className="text-sm text-gray-500 mb-3">No values found</p>
//               <button
//                 onClick={onNewValue}
//                 className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 inline-flex items-center gap-1"
//               >
//                 <Plus size={12} />
//                 Add First Value
//               </button>
//             </div>
//           </div>
//         ) : (
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50 border-b">
//               <tr>
//                 <th className="py-2 px-4 w-10">
//                   <button
//                     onClick={onToggleSelectAll}
//                     className="text-gray-500 hover:text-gray-700"
//                   >
//                     {selectedValues.length === values.length ? (
//                       <CheckSquare size={16} className="text-blue-600" />
//                     ) : (
//                       <Square size={16} />
//                     )}
//                   </button>
//                 </th>
//                 <th className="text-left py-2 px-4 font-medium text-gray-600 text-xs">Value</th>
//                 <th className="text-left py-2 px-4 font-medium text-gray-600 text-xs">Status</th>
//                 <th className="text-left py-2 px-4 font-medium text-gray-600 text-xs">Created</th>
//                 <th className="text-right py-2 px-4 font-medium text-gray-600 text-xs">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {values.map((value) => (
//                 <tr 
//                   key={value.id} 
//                   className={`hover:bg-gray-50 ${value.isactive === 0 ? 'opacity-60' : ''} ${
//                     selectedValues.includes(value.id) ? 'bg-blue-50' : ''
//                   }`}
//                 >
//                   <td className="py-2 px-4">
//                     <button
//                       onClick={() => onToggleSelect(value.id)}
//                       className="text-gray-500 hover:text-gray-700"
//                     >
//                       {selectedValues.includes(value.id) ? (
//                         <CheckSquare size={16} className="text-blue-600" />
//                       ) : (
//                         <Square size={16} />
//                       )}
//                     </button>
//                   </td>
//                   <td className="py-2 px-4 text-sm font-medium">{value.name}</td>
//                   <td className="py-2 px-4">
//                     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
//                       value.isactive === 1 
//                         ? 'bg-green-100 text-green-700' 
//                         : 'bg-gray-100 text-gray-600'
//                     }`}>
//                       <span className={`w-1.5 h-1.5 rounded-full ${
//                         value.isactive === 1 ? 'bg-green-600' : 'bg-gray-500'
//                       }`} />
//                       {value.isactive === 1 ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>
//                   <td className="py-2 px-4 text-xs text-gray-500">{formatDate(value.created_at)}</td>
//                   <td className="py-2 px-4 text-right">
//                     <div className="flex items-center justify-end gap-1">
//                       <button
//                         onClick={() => onToggleStatus(value.id, value.isactive)}
//                         disabled={togglingValueId === value.id}
//                         className={`p-1 rounded hover:bg-gray-100 ${
//                           value.isactive === 1 ? 'text-green-600' : 'text-gray-400'
//                         }`}
//                         title={value.isactive === 1 ? 'Deactivate' : 'Activate'}
//                       >
//                         {togglingValueId === value.id ? (
//                           <div className="h-3.5 w-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
//                         ) : (
//                           <Power size={14} />
//                         )}
//                       </button>
//                       <button
//                         onClick={() => onEditValue(value)}
//                         className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
//                         title="Edit"
//                       >
//                         <Edit2 size={14} />
//                       </button>
//                       <button
//                         onClick={() => onDeleteValue(value.id)}
//                         className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
//                         title="Delete"
//                       >
//                         <Trash2 size={14} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Footer with count */}
//       {values.length > 0 && (
//         <div className="flex justify-between items-center px-2">
//           <p className="text-xs text-gray-500">
//             Showing {values.length} value{values.length !== 1 ? 's' : ''}
//           </p>
//           <p className="text-xs text-gray-500">
//             Active: {values.filter(v => v.isactive === 1).length} | Inactive: {values.filter(v => v.isactive === 0).length}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }


// components/admin/masters/[itemId]/ValueList.tsx
"use client";

import { Search, Plus, Edit2, Trash2, Power, CheckSquare, Square } from "lucide-react";
import { formatDate } from "@/components/admin/masters/table-config";
import { useState, useEffect, useRef } from "react";

interface MasterValue {
  id: number;
  name: string;
  isactive: number;
  created_at: string;
}

interface ValueListProps {
  values: MasterValue[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (filter: "all" | "active" | "inactive") => void;
  togglingValueId: number | null;
  onEditValue: (value: MasterValue) => void;
  onToggleStatus: (id: number, current: number) => void;
  onDeleteValue: (id: number) => void;
  onNewValue: () => void;
  selectedValues: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
}

export default function ValueList({
  values,
  loading,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  togglingValueId,
  onEditValue,
  onToggleStatus,
  onDeleteValue,
  onNewValue,
  selectedValues,
  onToggleSelect,
  onToggleSelectAll
}: ValueListProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-3">
      {/* Search and Filter Bar */}
      <div className=" sticky top-44 z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-3 rounded-lg border">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search values..."
            className="w-full pl-8 pr-3 py-2 sm:py-1.5 bg-white border rounded-lg text-sm sm:text-xs focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as any)}
          className="px-2 py-2 sm:py-1.5 bg-white border rounded-lg text-sm sm:text-xs w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div 
        ref={tableContainerRef}
        className="bg-white rounded-lg border overflow-x-auto "
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {loading ? (
          <div className="p-8 text-center min-w-[600px] md:min-w-full">
            <div className="inline-block h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500 mt-2">Loading values...</p>
          </div>
        ) : values.length === 0 ? (
          <div className="p-8 text-center min-w-[600px] md:min-w-full">
            <div className="max-w-sm mx-auto">
              <p className="text-sm text-gray-500 mb-3">No values found</p>
              <button
                onClick={onNewValue}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 inline-flex items-center gap-1"
              >
                <Plus size={12} />
                Add First Value
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[650px] md:min-w-full ">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-2 px-4 w-10">
                  <button
                    onClick={onToggleSelectAll}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {selectedValues.length === values.length ? (
                      <CheckSquare size={16} className="text-blue-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="text-left py-2 px-4 font-medium text-gray-600 text-xs">Value</th>
                <th className="text-left py-2 px-4 font-medium text-gray-600 text-xs">Status</th>
                <th className="text-left py-2 px-4 font-medium text-gray-600 text-xs">Created</th>
                <th className="text-right py-2 px-4 font-medium text-gray-600 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {values.map((value) => (
                <tr 
                  key={value.id} 
                  className={`hover:bg-gray-50 ${value.isactive === 0 ? 'opacity-60' : ''} ${
                    selectedValues.includes(value.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="py-2 px-4">
                    <button
                      onClick={() => onToggleSelect(value.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {selectedValues.includes(value.id) ? (
                        <CheckSquare size={16} className="text-blue-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>
                  <td className="py-2 px-4 text-sm font-normal">{value.name}</td>
                  <td className="py-2 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      value.isactive === 1 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        value.isactive === 1 ? 'bg-green-600' : 'bg-gray-500'
                      }`} />
                      {value.isactive === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-xs text-gray-500">{formatDate(value.created_at)}</td>
                  <td className="py-2 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onToggleStatus(value.id, value.isactive)}
                        disabled={togglingValueId === value.id}
                        className={`p-1 rounded hover:bg-gray-100 ${
                          value.isactive === 1 ? 'text-green-600' : 'text-gray-400'
                        }`}
                        title={value.isactive === 1 ? 'Deactivate' : 'Activate'}
                      >
                        {togglingValueId === value.id ? (
                          <div className="h-3.5 w-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Power size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => onEditValue(value)}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteValue(value.id)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer with count */}
      {values.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-2 py-2">
          <p className="text-xs text-gray-500">
            Showing {values.length} value{values.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500">
            Active: {values.filter(v => v.isactive === 1).length} | Inactive: {values.filter(v => v.isactive === 0).length}
          </p>
        </div>
      )}

      
    </div>
  );
}