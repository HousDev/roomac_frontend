"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";

interface SubcategoryEntry {
  subcategory_id: string;
  subcategory_name: string;
}

interface Props {
  initialData?: any | null;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function CategoryMappingForm({ initialData, onSubmit, onClose }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategories, setSelectedSubcategories] = useState<SubcategoryEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setSelectedCategory(initialData.category_name);
      setSelectedSubcategories(
        initialData.subcategories.map((s: any) => ({
          subcategory_id: String(s.subcategory_id),
          subcategory_name: s.subcategory_name,
        }))
      );
    }
  }, [initialData]);

  const addSubcategory = () => {
    setSelectedSubcategories(prev => [...prev, { subcategory_id: Date.now().toString(), subcategory_name: "" }]);
  };

  const removeSubcategory = (index: number) => {
    setSelectedSubcategories(prev => prev.filter((_, i) => i !== index));
  };

  const updateSubcategoryName = (index: number, name: string) => {
    setSelectedSubcategories(prev =>
      prev.map((s, i) => i === index ? { ...s, subcategory_name: name } : s)
    );
  };

  const handleSubmit = async () => {
    if (!selectedCategory.trim()) { alert("Please enter a category name"); return; }
    const valid = selectedSubcategories.filter(s => s.subcategory_name.trim());
    if (valid.length === 0) { alert("Add at least one subcategory"); return; }

    setSubmitting(true);
    try {
      await onSubmit({
category_id: initialData?.category_id || selectedCategory.trim(),        category_name: selectedCategory.trim(),
        subcategories: valid.map(s => ({
          subcategory_id: s.subcategory_id,
          subcategory_name: s.subcategory_name.trim(),
        })),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-[#1A2B6D] to-[#3B5BDB]">
          <h2 className="text-sm font-bold text-white">
            {isEdit ? "✏️ Edit Category Mapping" : "➕ Add Category Mapping"}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Category Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={isEdit}
              placeholder="e.g. Cleaning, Food, Maintenance"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {isEdit && (
              <p className="text-xs text-gray-400 mt-1">Category cannot be changed while editing</p>
            )}
          </div>

          {/* Subcategories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700">
                Sub Categories <span className="text-red-500">*</span>
              </label>
              
            </div>

            {selectedSubcategories.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400 mb-2">No subcategories added yet</p>
                <button onClick={addSubcategory} className="text-xs text-blue-600 hover:underline">
                  + Add First Subcategory
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedSubcategories.map((sub, idx) => (
                  <div key={sub.subcategory_id} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-5 text-center">{idx + 1}</span>
                    <input
                      type="text"
                      value={sub.subcategory_name}
                      onChange={(e) => updateSubcategoryName(idx, e.target.value)}
                      placeholder="e.g. Deep Clean, Regular Clean"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                    <button
                      onClick={() => removeSubcategory(idx)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

<button
                onClick={addSubcategory}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium mt-2"
              >
                <Plus size={12} /> Add Sub Category
              </button>
            {selectedSubcategories.length > 0 && (
              <div className="mt-2 text-xs text-gray-400">
                {selectedSubcategories.filter(s => s.subcategory_name.trim()).length} subcategories added
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedCategory.trim() || selectedSubcategories.filter(s => s.subcategory_name.trim()).length === 0}
            className="flex-1 px-6 py-2 bg-gradient-to-r from-[#1A2B6D] to-[#3B5BDB] text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : isEdit ? "✓ Update Mapping" : "✓ Save Mapping"}
          </button>
        </div>
      </div>
    </div>
  );
}