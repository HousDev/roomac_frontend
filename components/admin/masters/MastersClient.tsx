


// components/admin/masters/MastersClient.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {toast} from "sonner";
import {
  getMasterItemsByTab,
  createMasterItem,
  updateMasterItem,
  deleteMasterItem,
  getMasterTabs,
  createMasterTab,
  updateMasterTab,
  deleteMasterTab,
  getMasterItems,
} from "@/lib/masterApi";
import Header from "./Header";
import StatsCards from "./StatsCards";
import HorizontalTabList from "./HorizontalTabList";
import MasterItemCards from "./MasterItemCards";
import DeleteConfirmModal from "./DeleteConfirmModal";
import TabFormModal from "./TabFormModal";
import ItemFormModal from "./ItemFormModal";

interface Tab {
  id: number;
  name: string;
  item_count: number;
  created_at: string;
  is_active: number;
}

interface MasterItem {
  id: number;
  tab_id: number;
  name: string;
  isactive: number;
  created_at: string;
  tab_name?: string;
  value_count: number;
}

interface MastersClientProps {
  initialTabs: Tab[];
}

export default function MastersClient({ initialTabs }: MastersClientProps) {
  const router = useRouter();
  
  // State for tabs
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState<Tab | null>(initialTabs[0] || null);
  
  // State for master items
  const [items, setItems] = useState<MasterItem[]>([]);
  
  // Loading states
  const [loadingTabs, setLoadingTabs] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  
  // Modal states
  const [showItemForm, setShowItemForm] = useState(false);
  const [showNewTabModal, setShowNewTabModal] = useState(false);
  const [showEditTabModal, setShowEditTabModal] = useState<Tab | null>(null);
  const [showDeleteItemConfirm, setShowDeleteItemConfirm] = useState<number | null>(null);
  const [showDeleteTabConfirm, setShowDeleteTabConfirm] = useState<Tab | null>(null);
  
  // Form data states
  const [itemFormData, setItemFormData] = useState({
    id: null as number | null,
    name: "",
    isactive: 1,
  });

  const [newTabName, setNewTabName] = useState("");
  const [editTabName, setEditTabName] = useState("");


const loadItemsForTab = useCallback(async (tab: Tab | null) => {
  if (!tab || !tab.id) {
    setItems([]);
    return;
  }
  
  setLoadingItems(true);
  try {
    // Get all items with counts from the main endpoint
    const res = await getMasterItems();
    
    if (res.success && Array.isArray(res.data)) {
      // Filter items by tab_id
      const filteredItems = res.data
        .filter((item: any) => item.tab_id === tab.id)
        .map((item: any) => ({
          id: item.id,
          tab_id: item.tab_id,
          name: item.name,
          isactive: item.isactive,
          created_at: item.created_at,
          tab_name: tab.name,
          value_count: item.value_count || 0
        }));
      
      setItems(filteredItems);
    } else {
      setItems([]);
    }
  } catch (error) {
    console.error(`Failed to load items for tab "${tab.name}":`, error);
    toast.error("Failed to load items");
    setItems([]);
  } finally {
    setLoadingItems(false);
  }
}, []);

  // Load tabs from API
  const loadTabs = useCallback(async () => {
    setLoadingTabs(true);
    try {
      const res = await getMasterTabs();
      
      if (res.success && Array.isArray(res.data)) {
        const tabsList = res.data.map((tab: any) => ({
          id: tab.id,
          name: tab.tab_name,
          item_count: tab.item_count || 0,
          created_at: tab.created_at || new Date().toISOString(),
          is_active: tab.isactive || 1
        }));
        
        setTabs(tabsList);
        
        // Update active tab if needed
        if (activeTab) {
          const updatedActiveTab = tabsList.find(t => t.id === activeTab.id);
          if (updatedActiveTab) {
            setActiveTab(updatedActiveTab);
          } else if (tabsList.length > 0) {
            setActiveTab(tabsList[0]);
          } else {
            setActiveTab(null);
          }
        } else if (tabsList.length > 0) {
          setActiveTab(tabsList[0]);
        }
      } else {
        setTabs([]);
        setActiveTab(null);
      }
    } catch (error) {
      console.error("Failed to load tabs:", error);
      toast.error("Failed to load tabs");
      setTabs([]);
      setActiveTab(null);
    } finally {
      setLoadingTabs(false);
    }
  }, [activeTab]);

  // Handle manual refresh
  const handleManualRefresh = useCallback(() => {
    loadTabs();
    if (activeTab) {
      loadItemsForTab(activeTab);
    }
    toast.success("Refreshed successfully");
  }, [activeTab, loadTabs, loadItemsForTab]);

  // Load items when active tab changes
  useEffect(() => {
    if (activeTab) {
      loadItemsForTab(activeTab);
    }
  }, [activeTab, loadItemsForTab]);

  // Handle item creation/update
  const handleItemSubmit = useCallback(async () => {
    if (!itemFormData.name.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    if (!activeTab) {
      toast.error("Please select a tab");
      return;
    }

    setSubmitting(true);
    try {
      if (itemFormData.id) {
        const res = await updateMasterItem(itemFormData.id, {
          name: itemFormData.name.trim(),
          isactive: itemFormData.isactive,
        });
        
        if (res.success) {
          await loadItemsForTab(activeTab);
          setShowItemForm(false);
          setItemFormData({ id: null, name: "", isactive: 1 });
          toast.success("Item updated successfully");
        } else {
          toast.error(res.error || "Failed to update master item");
        }
      } else {
        const res = await createMasterItem({
          tab_id: activeTab.id,
          name: itemFormData.name.trim(),
          isactive: itemFormData.isactive,
        });
        
        if (res.success) {
          await loadItemsForTab(activeTab);
          setShowItemForm(false);
          setItemFormData({ id: null, name: "", isactive: 1 });
          toast.success("Item created successfully");
        } else {
          toast.error(res.error || "Failed to create master item");
        }
      }
    } catch (error) {
      console.error("Failed to save item:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to save"}`);
    } finally {
      setSubmitting(false);
    }
  }, [itemFormData, activeTab, loadItemsForTab]);

  // Handle delete item
  const handleDeleteItem = useCallback(async (id: number) => {
    setShowDeleteItemConfirm(null);
    try {
      const res = await deleteMasterItem(id);
      if (res.success && activeTab) {
        await loadItemsForTab(activeTab);
        toast.success("Item deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete master item");
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to delete"}`);
    }
  }, [activeTab, loadItemsForTab]);

  // Handle edit item
  const handleEditItem = useCallback((item: MasterItem) => {
    setItemFormData({
      id: item.id,
      name: item.name,
      isactive: item.isactive,
    });
    setShowItemForm(true);
  }, []);

  // Handle create tab
  const handleCreateTab = useCallback(async () => {
    if (!newTabName.trim()) {
      toast.error("Please enter a tab name");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createMasterTab({
        tab_name: newTabName.trim(),
        isactive: 1
      });
      
      if (res.success) {
        await loadTabs();
        setNewTabName("");
        setShowNewTabModal(false);
        toast.success("Tab created successfully");
      } else {
        toast.error(res.error || "Failed to create tab");
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to create tab"}`);
    } finally {
      setSubmitting(false);
    }
  }, [newTabName, loadTabs]);

  // Handle edit tab
  const handleEditTab = useCallback(async () => {
    if (!showEditTabModal || !editTabName.trim()) return;

    setSubmitting(true);
    try {
      const res = await updateMasterTab(showEditTabModal.id, {
        tab_name: editTabName.trim(),
        isactive: showEditTabModal.is_active
      });
      
      if (res.success) {
        await loadTabs();
        setShowEditTabModal(null);
        setEditTabName("");
        toast.success("Tab updated successfully");
      } else {
        toast.error(res.error || "Failed to update tab");
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to update tab"}`);
    } finally {
      setSubmitting(false);
    }
  }, [showEditTabModal, editTabName, loadTabs]);

  // Handle delete tab
  const handleDeleteTab = useCallback(async () => {
    if (!showDeleteTabConfirm) return;

    setSubmitting(true);
    try {
      const res = await deleteMasterTab(showDeleteTabConfirm.id);
      if (res.success) {
        await loadTabs();
        setShowDeleteTabConfirm(null);
        toast.success("Tab deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete tab");
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to delete tab"}`);
    } finally {
      setSubmitting(false);
    }
  }, [showDeleteTabConfirm, loadTabs]);

  // Filtered items based on search and status
  const filteredItems = useMemo(() => 
    items.filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = showInactive ? true : item.isactive === 1;
      
      return matchesSearch && matchesStatus;
    }), [items, searchQuery, showInactive]
  );

  // Statistics
  const stats = useMemo(() => ({
    totalItems: items.length,
    activeItems: items.filter(i => i.isactive === 1).length,
  }), [items]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onRefresh={handleManualRefresh}
        onNewTab={() => setShowNewTabModal(true)}
        onNewItem={() => setShowItemForm(true)}
        loadingTabs={loadingTabs}
        loadingItems={loadingItems}
        activeTab={activeTab?.name || ""}
      />

      <div className="max-w-8xl mx-auto p-0 md:p-0 space-y-4">
        {/* Horizontal Tabs - Clean */}
        <HorizontalTabList
          tabs={tabs}
          activeTab={activeTab}
          loading={loadingTabs}
          onTabClick={setActiveTab}
          onEditTab={(tab) => {
            setEditTabName(tab.name);
            setShowEditTabModal(tab);
          }}
          onDeleteTab={setShowDeleteTabConfirm}
        />

        {/* Compact Search Bar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search items..."
              className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Items Grid */}
        {activeTab ? (
          <MasterItemCards
            items={filteredItems}
            loading={loadingItems}
            onEditItem={handleEditItem}
            onDeleteItem={setShowDeleteItemConfirm}
            onViewValues={(id) => router.push(`/admin/masters/${id}`)}
            onNewItem={() => setShowItemForm(true)}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500">Select a tab to view items</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <TabFormModal
        isOpen={showNewTabModal}
        formData={{ name: newTabName, is_active: true }}
        submitting={submitting}
        onFormDataChange={(data) => setNewTabName(data.name)}
        onSubmit={handleCreateTab}
        onClose={() => {
          setShowNewTabModal(false);
          setNewTabName("");
        }}
      />

      <TabFormModal
        isOpen={!!showEditTabModal}
        formData={{ name: editTabName, is_active: true }}
        submitting={submitting}
        onFormDataChange={(data) => setEditTabName(data.name)}
        onSubmit={handleEditTab}
        onClose={() => {
          setShowEditTabModal(null);
          setEditTabName("");
        }}
      />

      <ItemFormModal
        isOpen={showItemForm}
        formData={itemFormData}
        activeTab={activeTab}
        submitting={submitting}
        onFormDataChange={setItemFormData}
        onSubmit={handleItemSubmit}
        onClose={() => {
          setShowItemForm(false);
          setItemFormData({ id: null, name: "", isactive: 1 });
        }}
      />

      <DeleteConfirmModal
        isOpen={!!showDeleteItemConfirm}
        type="item"
        onConfirm={() => handleDeleteItem(showDeleteItemConfirm!)}
        onClose={() => setShowDeleteItemConfirm(null)}
      />

      <DeleteConfirmModal
        isOpen={!!showDeleteTabConfirm}
        type="tab"
        tabName={showDeleteTabConfirm?.name}
        itemCount={showDeleteTabConfirm?.item_count}
        onConfirm={handleDeleteTab}
        onClose={() => setShowDeleteTabConfirm(null)}
      />
    </div>
  );
}