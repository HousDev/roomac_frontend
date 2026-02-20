// components/admin/masters/[itemId]/DeleteConfirmModal.tsx
"use client";

import { AlertCircle, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onClose
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h2 className="font-bold text-gray-800">Delete Value</h2>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-gray-700 mb-4 text-sm">
            Are you sure you want to delete this value?
          </p>
          
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
              Delete Value
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}