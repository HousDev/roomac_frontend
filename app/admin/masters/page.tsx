// app/admin/masters/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getMasterItems,
  createMasterItem,
  updateMasterItem,
  deleteMasterItem,
  STATIC_TABS
} from "@/lib/masterApi";
import Header from "@/components/admin/masters/Header";
import HorizontalTabList from "@/components/admin/masters/HorizontalTabList";
import MasterItemCards from "@/components/admin/masters/MasterItemCards";
import DeleteConfirmModal from "@/components/admin/masters/DeleteConfirmModal";
import ItemFormModal from "@/components/admin/masters/ItemFormModal";
import Loading from "@/components/admin/masters/loading";

interface MasterItem {
  id: number;
  name: string;
  tab_name: string;
  isactive: number;
  created_at: string;
  value_count: number;
}

export default function MasterItemsPage() {
  const router = useRouter();
  
  // State
  const [items, setItems] = useState<MasterItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>(STATIC_TABS[0].name);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showItemForm, setShowItemForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MasterItem | null>(null);
  
  // Form data
  const [itemFormData, setItemFormData] = useState({
    id: null as number | null,
    name: "",
    tab_name: activeTab,
    isactive: 1,
  });

  // Load items
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMasterItems();
      
      // Check the response structure from your backend
      // Your backend returns { success: true, data: [...] }
      if (response?.success && Array.isArray(response.data)) {
        setItems(response.data);
      } else if (Array.isArray(response)) {
        // If response is directly an array
        setItems(response);
      } else {
        console.error("Unexpected response format:", response);
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to load items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Filter items by active tab and search
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesTab = item.tab_name === activeTab;
      const matchesSearch = searchQuery === "" || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [items, activeTab, searchQuery]);

  // Get item counts per tab
  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATIC_TABS.forEach(tab => {
      counts[tab.name] = items.filter(item => item.tab_name === tab.name).length;
    });
    return counts;
  }, [items]);

  // Handle create/edit item
  const handleItemSubmit = useCallback(async () => {
    
    if (!itemFormData.name.trim()) {
      alert("Please enter an item name");
      return;
    }

    setSubmitting(true);
    try {
      let response;
      
      if (itemFormData.id) {
        // Update existing item
        response = await updateMasterItem(itemFormData.id, {
          name: itemFormData.name.trim(),
          isactive: itemFormData.isactive,
          tab_name: itemFormData.tab_name
        });
      } else {
        // Create new item
        response = await createMasterItem({
          tab_name: itemFormData.tab_name,
          name: itemFormData.name.trim(),
          isactive: itemFormData.isactive,
        });
      }
      
      
      // Check response based on your API structure
      if (response?.success) {
        await loadItems();
        setShowItemForm(false);
        resetForm();
      } else {
        alert(response?.error || response?.message || "Failed to save item");
      }
    } catch (error: any) {
      console.error("Failed to save item:", error);
      alert(`Error: ${error?.message || "Failed to save"}`);
    } finally {
      setSubmitting(false);
    }
  }, [itemFormData, loadItems]);

  // Handle delete item
  const handleDeleteItem = useCallback(async () => {
    if (!showDeleteConfirm) return;

    try {
      const response = await deleteMasterItem(showDeleteConfirm);
      if (response?.success) {
        await loadItems();
        setShowDeleteConfirm(null);
        setItemToDelete(null);
      } else {
        alert(response?.error || "Failed to delete item");
      }
    } catch (error: any) {
      alert(`Error: ${error?.message || "Failed to delete"}`);
    }
  }, [showDeleteConfirm, loadItems]);

  // Reset form
  const resetForm = () => {
    setItemFormData({
      id: null,
      name: "",
      tab_name: activeTab,
      isactive: 1,
    });
  };

  // Handle edit click
  const handleEditItem = (item: MasterItem) => {
    setItemFormData({
      id: item.id,
      name: item.name,
      tab_name: item.tab_name,
      isactive: item.isactive,
    });
    setShowItemForm(true);
  };

  // Handle delete click
  const handleDeleteClick = (id: number) => {
    const item = items.find(i => i.id === id);
    setItemToDelete(item || null);
    setShowDeleteConfirm(id);
  };

  // Handle new item click
  const handleNewItem = () => {
    resetForm();
    setItemFormData(prev => ({ ...prev, tab_name: activeTab }));
    setShowItemForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onRefresh={loadItems}
        onNewItem={handleNewItem}
        loading={loading}
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="max-w-8xl mx-auto p-4 md:p-6 space-y-4">
        {/* Horizontal Tabs */}
        <HorizontalTabList
          activeTab={activeTab}
          onTabClick={setActiveTab}
          itemCounts={itemCounts}
        />

        {/* Items Grid */}
        <MasterItemCards
          items={filteredItems}
          loading={loading}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteClick}
          onViewValues={(id, name) => router.push(`/admin/masters/${id}?name=${encodeURIComponent(name)}`)}
          onNewItem={handleNewItem}
        />
      </div>

      {/* Modals */}
      <ItemFormModal
        isOpen={showItemForm}
        formData={itemFormData}
        submitting={submitting}
        onFormDataChange={setItemFormData}
        onSubmit={handleItemSubmit}
        onClose={() => {
          setShowItemForm(false);
          resetForm();
        }}
      />

      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        type="item"
        itemName={itemToDelete?.name}
        valueCount={itemToDelete?.value_count}
        onConfirm={handleDeleteItem}
        onClose={() => {
          setShowDeleteConfirm(null);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}