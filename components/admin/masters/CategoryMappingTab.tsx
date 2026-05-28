// components/admin/masters/CategoryMappingTab.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Link, ChevronDown, ChevronUp } from "lucide-react";
import { getMasterItemsByTab, getMasterValues } from "@/lib/masterApi";
import {
  getAllMappings,
  bulkSaveMappings,
  deleteMappingsByCategory,
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
      console.log("CategoryMappingTab rendered"); // ← add karo

  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const loadMappings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllMappings();
      setMappings(res?.data || []);
    } catch {
      toast.error("Failed to load mappings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMappings(); }, [loadMappings]);

  // Group mappings by category
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

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const handleEdit = (group: any) => {
    setEditData(group);
    setShowForm(true);
  };

  const handleDelete = async (category_id: string, category_name: string) => {
    if (!confirm(`Delete all subcategory mappings for "${category_name}"?`)) return;
    try {
      await deleteMappingsByCategory(category_id);
      toast.success("Mappings deleted");
      loadMappings();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await bulkSaveMappings(data);
      toast.success(editData ? "Mapping updated" : "Mapping created");
      setShowForm(false);
      setEditData(null);
      loadMappings();
    } catch {
      toast.error("Failed to save mapping");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link size={16} className="text-blue-600" />
          <span className="text-sm font-semibold text-gray-700">
            Category → Subcategory Mappings ({groupedList.length})
          </span>
        </div>
        <button
          onClick={() => { setEditData(null); setShowForm(true); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
        >
          <Plus size={14} />
          Add Mapping
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-xl border p-8 text-center text-sm text-gray-400">
          Loading mappings...
        </div>
      ) : groupedList.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center">
          <Link size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 mb-3">No mappings created yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
          >
            Create First Mapping
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3 text-xs font-700 text-gray-600">#</th>
                <th className="text-left p-3 text-xs font-700 text-gray-600">Category</th>
                <th className="text-left p-3 text-xs font-700 text-gray-600">Sub Categories</th>
                <th className="text-left p-3 text-xs font-700 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedList.map((group: any, idx) => {
                const isExpanded = expandedCategories.has(group.category_id);
                return (
                  <tr key={group.category_id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-xs text-gray-500">{idx + 1}</td>
                    <td className="p-3">
                      <span className="text-sm font-semibold text-gray-800">
                        {group.category_name}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Show first 3 subcategories */}
                        {group.subcategories.slice(0, isExpanded ? undefined : 3).map((s: any) => (
                          <span key={s.id} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-xs">
                            {s.subcategory_name}
                          </span>
                        ))}
                        {/* Show more button */}
                        {group.subcategories.length > 3 && (
                          <button
                            onClick={() => toggleExpand(group.category_id)}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            {isExpanded ? (
                              <><ChevronUp size={12} /> Less</>
                            ) : (
                              <><ChevronDown size={12} /> +{group.subcategories.length - 3} more</>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {group.subcategories.length} subcategories
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(group)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(group.category_id, group.category_name)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-400">
            {groupedList.length} categories mapped
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <CategoryMappingForm
          initialData={editData}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditData(null); }}
        />
      )}
    </div>
  );
}