// components/admin/masters/ItemFormModal.tsx
"use client";

import { Plus, Edit2, X, Save, Loader2 } from "lucide-react";

interface ItemFormData {
  id: number | null;
  name: string;
  isactive: number;
}

interface Tab {
  id: number;
  name: string;
}

interface ItemFormModalProps {
  isOpen: boolean;
  formData: ItemFormData;
  activeTab: Tab | null;
  submitting: boolean;
  onFormDataChange: (data: ItemFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function ItemFormModal({
  isOpen,
  formData,
  activeTab,
  submitting,
  onFormDataChange,
  onSubmit,
  onClose
}: ItemFormModalProps) {
  if (!isOpen) return null;

  const isEdit = !!formData?.id;
  const Icon = isEdit ? Edit2 : Plus;
  const title = isEdit ? "Edit Master Item" : "Create Master Item";
  
  // Safe access with default values
  const name = formData?.name || "";
  const isActive = formData?.isactive === 1;
  
  const isFormValid = name?.trim()?.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-gray-800">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          {activeTab && (
            <p className="text-sm text-gray-600 mt-1">
              Tab: {activeTab.name}
            </p>
          )}
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Property Types"
                value={name}
                onChange={(e) => onFormDataChange({...formData, name: e.target.value})}
                autoFocus
              />
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                  <p className="text-xs text-gray-500">Only active items are available in forms</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isActive}
                    onChange={(e) => onFormDataChange({
                      ...formData, 
                      isactive: e.target.checked ? 1 : 0
                    })}
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 border text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!isFormValid || submitting || !activeTab}
              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 ${
                !isFormValid || submitting || !activeTab
                  ? "bg-gray-300 text-gray-500"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isEdit ? (
                <>
                  <Save size={16} />
                  Update
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}