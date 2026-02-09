// // components/admin/masters/TabFormModal.tsx
// "use client";

// interface TabFormData {
//   name: string;
//   is_active: boolean;
// }

// interface TabFormModalProps {
//   isOpen: boolean;
//   formData: TabFormData;
//   submitting: boolean;
//   onFormDataChange: (data: TabFormData) => void;
//   onSubmit: () => void;
//   onClose: () => void;
// }

// export default function TabFormModal({
//   isOpen,
//   formData,
//   submitting,
//   onFormDataChange,
//   onSubmit,
//   onClose
// }: TabFormModalProps) {
//   if (!isOpen) return null;

//   const isEdit = formData.name.trim().length > 0;

//   return (
//     <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4">
//         <h2 className="font-bold text-gray-800 mb-4">
//           {isEdit ? "Edit Tab" : "Create Tab"}
//         </h2>

//         <input
//           className="w-full px-3 py-2 border rounded-lg mb-4"
//           placeholder="Tab Name"
//           value={formData.name}
//           onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
//         />

//         <div className="flex gap-2 mb-4">
//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={formData.is_active}
//               onChange={(e) => onFormDataChange({ ...formData, is_active: e.target.checked })}
//             />
//             Active
//           </label>
//         </div>

//         <div className="flex gap-2">
//           <button
//             className="flex-1 px-3 py-2 border rounded-lg"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//           <button
//             className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg"
//             disabled={submitting || !formData.name.trim()}
//             onClick={onSubmit}
//           >
//             {isEdit ? "Update" : "Create"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// components/admin/masters/TabFormModal.tsx
"use client";

import { Loader2 } from "lucide-react";

interface TabFormData {
  name: string;
  is_active: boolean;
}

interface TabFormModalProps {
  isOpen: boolean;
  formData: TabFormData;
  submitting: boolean;
  onFormDataChange: (data: TabFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function TabFormModal({
  isOpen,
  formData,
  submitting,
  onFormDataChange,
  onSubmit,
  onClose
}: TabFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="font-bold text-gray-800 mb-4 text-lg">
          Create New Tab
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tab Name *
          </label>
          <input
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tab name"
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            disabled={submitting}
          />
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={submitting || !formData.name.trim()}
            onClick={onSubmit}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create Tab"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}