// components/admin/masters/DeleteConfirmModal.tsx
"use client";

import { AlertCircle, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  type: "item" | "value";
  itemName?: string;
  valueCount?: number;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  type,
  itemName,
  valueCount,
  onConfirm,
  onClose
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const title = type === "item" ? "Delete Master Item" : "Delete Value";
  
  const content = type === "item" 
    ? `Are you sure you want to delete "${itemName || 'this item'}"? This will also delete all ${valueCount || 0} values associated with it.`
    : "Are you sure you want to delete this value?";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h2 className="font-bold text-gray-800">{title}</h2>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-gray-700 mb-4 text-sm">
            {content}
          </p>
          
          {type === "item" && valueCount && valueCount > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                This action cannot be undone. All associated values will be permanently deleted.
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 border text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm flex items-center justify-center gap-1"
            >
              <Trash2 size={16} />
              {type === "item" ? "Delete Item" : "Delete Value"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}