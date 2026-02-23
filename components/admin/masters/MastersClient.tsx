// // components/admin/masters/MastersClient.tsx
// "use client";

// import { useState, useEffect, useCallback, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import {
//   getMasterTypesByTab,
//   createMasterType,
//   updateMasterType,
//   deleteMasterType,
//   toggleMasterTypeStatus,
//   getMasterTabs,
// } from "@/lib/masterApi";
// import Header from "./Header";
// import StatsCards from "./StatsCards";
// import TabList from "./TabList";
// import MasterTypeList from "./MasterTypeList";
// import DeleteConfirmModal from "./DeleteConfirmModal";
// import DebugPanel from "./DebugPanel";
// import TabFormModal from "./TabFormModal";   // For tabs
// import TypeFormModal from "./TypeFormModal"; // For types (code, name, id, is_active)


// interface Tab {
//   id?: number;
//   name: string;
//   type_count: number;
//   created_at: string;
//   is_active: number;
// }

// interface MasterType {
//   id: number;
//   code: string;
//   name: string;
//   tab: string | null;
//   is_active: boolean;
//   created_at: string;
//   value_count: number;
// }

// interface MastersClientProps {
//   initialTabs: Tab[];
// }

// export default function MastersClient({ initialTabs }: MastersClientProps) {
//   const router = useRouter();
  
//   // State for tabs
//   const [tabs, setTabs] = useState<Tab[]>(initialTabs);
//   const [activeTab, setActiveTab] = useState<string>("General");
  
//   // State for master types
//   const [types, setTypes] = useState<MasterType[]>([]);
  
//   // Loading states
//   const [loadingTabs, setLoadingTabs] = useState(false);
//   const [loadingTypes, setLoadingTypes] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [togglingTypeId, setTogglingTypeId] = useState<number | null>(null);
  
//   // Search & Filter states
//   const [tabSearchTerm, setTabSearchTerm] = useState("");
//   const [typeSearchTerm, setTypeSearchTerm] = useState("");
//   const [typeStatusFilter, setTypeStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
//   // Modal states
//   const [showTypeForm, setShowTypeForm] = useState(false);
//   const [showNewTabModal, setShowNewTabModal] = useState(false);
//   const [showEditTabModal, setShowEditTabModal] = useState<Tab | null>(null);
//   const [showDeleteTypeConfirm, setShowDeleteTypeConfirm] = useState<number | null>(null);
//   const [showDeleteTabConfirm, setShowDeleteTabConfirm] = useState<Tab | null>(null);
  
//   // Form data states
//   const [typeFormData, setTypeFormData] = useState({
//     id: null as number | null,
//     code: "",
//     name: "",
//     is_active: true,
//   });

//   const [newTabName, setNewTabName] = useState("");
//   const [editTabName, setEditTabName] = useState("");
//   const [showTabMenu, setShowTabMenu] = useState<string | null>(null);

//   // Load types for active tab
//   const loadTypesForTab = useCallback(async (tabName: string) => {
//     if (!tabName) {
//       setTypes([]);
//       return;
//     }
    
//     setLoadingTypes(true);
//     try {
//       const res = await getMasterTypesByTab(tabName);
      
//       if (res.success) {
//         let typesData: MasterType[] = [];
        
//         if (Array.isArray(res.data)) {
//           typesData = res.data;
//         } else if (Array.isArray(res.types)) {
//           typesData = res.types;
//         }
        
//         if (tabName === "General") {
//           const generalTypes = typesData.filter(type => 
//             !type.tab || type.tab.trim() === ""
//           );
//           setTypes(generalTypes);
//         } else {
//           const tabTypes = typesData.filter(type => 
//             type.tab && type.tab.trim() === tabName
//           );
//           setTypes(tabTypes);
//         }
//       } else {
//         setTypes([]);
//       }
//     } catch (error) {
//       console.error(`Failed to load types for tab "${tabName}":`, error);
//       setTypes([]);
//     } finally {
//       setLoadingTypes(false);
//     }
//   }, []);

//   // Load tabs
//   const loadTabs = useCallback(async () => {
//     setLoadingTabs(true);
//     try {
//       const res = await getMasterTabs();
      
//       let tabsList: Tab[] = [
//         { name: "General", type_count: 0, created_at: new Date().toISOString(), is_active: 1 }
//       ];
      
//       if (res.success && Array.isArray(res.data)) {
//         const apiTabs: Tab[] = res.data.map((tab: any) => ({
//           id: tab.id,
//           name: tab.name || tab.tab_name || "Unknown",
//           type_count: tab.type_count || 0,
//           created_at: tab.created_at || new Date().toISOString(),
//           is_active: tab.is_active || 1
//         }));
        
//         tabsList = [...tabsList, ...apiTabs.filter(tab => tab.name !== "General")];
//       }
      
//       setTabs(tabsList);
      
//       const tabExists = tabsList.some(tab => tab.name === activeTab);
//       if (!tabExists) {
//         const newActiveTab = tabsList[0]?.name || "General";
//         setActiveTab(newActiveTab);
//       }
//     } catch (error) {
//       console.error("Failed to load tabs:", error);
//       setTabs([{ name: "General", type_count: 0, created_at: new Date().toISOString(), is_active: 1 }]);
//     } finally {
//       setLoadingTabs(false);
//     }
//   }, [activeTab]);

//   // Handle manual refresh
//   const handleManualRefresh = useCallback(() => {
//     loadTabs();
//     if (activeTab) {
//       loadTypesForTab(activeTab);
//     }
//   }, [activeTab, loadTabs, loadTypesForTab]);

//   // Load types when active tab changes
//   useEffect(() => {
//     if (activeTab) {
//       loadTypesForTab(activeTab);
//     }
//   }, [activeTab, loadTypesForTab]);

//   // Handle type creation/update
//   const handleTypeSubmit = useCallback(async () => {
//     if (!typeFormData.code.trim() && !typeFormData.id) {
//       alert("Please enter a type code");
//       return;
//     }

//     if (!typeFormData.name.trim()) {
//       alert("Please enter a type name");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       if (typeFormData.id) {
//         const res = await updateMasterType(typeFormData.id, {
//           name: typeFormData.name.trim(),
//           tab: activeTab === "General" ? "" : activeTab,
//           is_active: typeFormData.is_active,
//         });
        
//         if (res.success) {
//           await loadTypesForTab(activeTab);
//           setShowTypeForm(false);
//           resetTypeForm();
//         } else {
//           alert(res.error || "Failed to update master type");
//         }
//       } else {
//         const code = typeFormData.code.trim().toUpperCase().replace(/\s+/g, '_');
//         const res = await createMasterType({
//           code: code,
//           name: typeFormData.name.trim(),
//           tab: activeTab === "General" ? "" : activeTab,
//           is_active: typeFormData.is_active,
//         });
        
//         if (res.success) {
//           await loadTypesForTab(activeTab);
//           setShowTypeForm(false);
//           resetTypeForm();
//         } else {
//           alert(res.error || "Failed to create master type");
//         }
//       }
//     } catch (error: any) {
//       console.error("Failed to save type:", error);
//       alert(`Error: ${error.message || "Failed to save master type"}`);
//     } finally {
//       setSubmitting(false);
//     }
//   }, [typeFormData, activeTab, loadTypesForTab]);

//   // Handle delete type
//   const handleDeleteType = useCallback(async (id: number) => {
//     setShowDeleteTypeConfirm(null);
//     try {
//       const res = await deleteMasterType(id);
      
//       if (res.success) {
//         await loadTypesForTab(activeTab);
//       } else {
//         alert(res.error || "Failed to delete master type");
//       }
//     } catch (error: any) {
//       console.error("Failed to delete type:", error);
//       alert(`Error: ${error.message || "Failed to delete master type"}`);
//     }
//   }, [activeTab, loadTypesForTab]);

//   // Toggle type status
//   const toggleTypeStatus = useCallback(async (id: number, current: boolean) => {
//     setTogglingTypeId(id);
//     try {
//       const newStatus = !current;
//       const res = await toggleMasterTypeStatus(id, newStatus);
      
//       if (res.success) {
//         setTypes(prev => prev.map(type => 
//           type.id === id ? { ...type, is_active: newStatus } : type
//         ));
//       } else {
//         alert(res.error || "Failed to toggle status");
//       }
//     } catch (error: any) {
//       console.error("Failed to toggle status:", error);
//       alert(`Error: ${error.message || "Failed to toggle status"}`);
//     } finally {
//       setTogglingTypeId(null);
//     }
//   }, []);

//   // Handle edit type
//   const handleEditType = useCallback((type: MasterType) => {
//     setTypeFormData({
//       id: type.id,
//       code: type.code,
//       name: type.name,
//       is_active: type.is_active,
//     });
//     setShowTypeForm(true);
//   }, []);

//   // Reset type form
//   const resetTypeForm = useCallback(() => {
//     setTypeFormData({
//       id: null,
//       code: "",
//       name: "",
//       is_active: true,
//     });
//   }, []);

//   // Create a new tab locally
//   const createTabLocally = useCallback((name: string) => {
//     const newTab: Tab = {
//       name: name,
//       type_count: 0,
//       created_at: new Date().toISOString(),
//       is_active: 1
//     };
    
//     setTabs(prev => [...prev, newTab]);
//   }, []);

//   // Update tab locally
//   const updateTabLocally = useCallback((oldName: string, newName: string) => {
//     setTabs(prev => prev.map(tab => 
//       tab.name === oldName ? { ...tab, name: newName } : tab
//     ));
    
//     if (activeTab === oldName) {
//       setActiveTab(newName);
//     }
//   }, [activeTab]);

//   // Delete tab locally
//   const deleteTabLocally = useCallback((tabName: string) => {
//     const newTabs = tabs.filter(tab => tab.name !== tabName);
//     setTabs(newTabs);
    
//     if (activeTab === tabName) {
//       const newActiveTab = newTabs[0]?.name || "General";
//       setActiveTab(newActiveTab);
//     }
//   }, [tabs, activeTab]);

//   // Handle create tab
//   const handleCreateTab = useCallback(async () => {
//     if (!newTabName.trim()) {
//       alert("Please enter a tab name");
//       return;
//     }

//     const trimmedName = newTabName.trim();
    
//     if (tabs.some(tab => tab.name.toLowerCase() === trimmedName.toLowerCase())) {
//       alert("Tab already exists");
//       return;
//     }

//     createTabLocally(trimmedName);
//     setActiveTab(trimmedName);
//     setNewTabName("");
//     setShowNewTabModal(false);
//   }, [newTabName, tabs, createTabLocally]);

//   // Handle edit tab
//   const handleEditTab = useCallback(async () => {
//     if (!showEditTabModal) return;
    
//     const oldName = showEditTabModal.name;
//     const newName = editTabName.trim();
    
//     if (!newName) {
//       alert("Please enter a tab name");
//       return;
//     }

//     if (oldName === newName) {
//       setShowEditTabModal(null);
//       setEditTabName("");
//       return;
//     }

//     if (tabs.some(tab => 
//       tab.name.toLowerCase() === newName.toLowerCase() && 
//       tab.name !== oldName
//     )) {
//       alert("Tab already exists");
//       return;
//     }

//     updateTabLocally(oldName, newName);
//     setShowEditTabModal(null);
//     setEditTabName("");
//   }, [showEditTabModal, editTabName, tabs, updateTabLocally]);

//   // Handle delete tab
//   const handleDeleteTab = useCallback(async () => {
//     if (!showDeleteTabConfirm) return;
    
//     const tabToDelete = showDeleteTabConfirm.name;
    
//     if (tabToDelete === "General") {
//       alert("Cannot delete the General tab");
//       setShowDeleteTabConfirm(null);
//       return;
//     }

//     if (showDeleteTabConfirm.type_count > 0) {
//       if (!confirm(`This tab has ${showDeleteTabConfirm.type_count} types. Deleting it will also delete all types in this tab. Are you sure?`)) {
//         setShowDeleteTabConfirm(null);
//         return;
//       }
//     }

//     deleteTabLocally(tabToDelete);
//     setShowDeleteTabConfirm(null);
//   }, [showDeleteTabConfirm, deleteTabLocally]);

//   // Filtered tabs based on search
//   const filteredTabs = useMemo(() => 
//     tabs.filter(tab => 
//       tab.name.toLowerCase().includes(tabSearchTerm.toLowerCase())
//     ), [tabs, tabSearchTerm]
//   );

//   // Filtered types based on search and filter
//   const filteredTypes = useMemo(() => 
//     types.filter(type => {
//       const matchesSearch = typeSearchTerm === "" || 
//         type.name.toLowerCase().includes(typeSearchTerm.toLowerCase()) ||
//         type.code.toLowerCase().includes(typeSearchTerm.toLowerCase());
      
//       const matchesStatus = typeStatusFilter === "all" || 
//         (typeStatusFilter === "active" && type.is_active) ||
//         (typeStatusFilter === "inactive" && !type.is_active);
      
//       return matchesSearch && matchesStatus;
//     }), [types, typeSearchTerm, typeStatusFilter]
//   );

//   // Statistics
//   const stats = useMemo(() => ({
//     totalTypes: types.length,
//     activeTypes: types.filter(t => t.is_active).length,
//   }), [types]);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <DebugPanel 
//         tabs={tabs}
//         activeTab={activeTab}
//         types={types}
//         filteredTypes={filteredTypes}
//         onRefresh={handleManualRefresh}
//       />

//       <Header
//         onRefresh={handleManualRefresh}
//         onNewTab={() => setShowNewTabModal(true)}
//         onNewType={() => setShowTypeForm(true)}
//         loadingTabs={loadingTabs}
//         loadingTypes={loadingTypes}
//         activeTab={activeTab}
//       />

//       <div className="max-w-7xl mx-auto p-4 md:p-6">
//         <StatsCards 
//           activeTab={activeTab}
//           totalTypes={stats.totalTypes}
//           activeTypes={stats.activeTypes}
//         />

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <TabList
//             tabs={filteredTabs}
//             activeTab={activeTab}
//             loading={loadingTabs}
//             searchTerm={tabSearchTerm}
//             onSearchChange={setTabSearchTerm}
//             onTabClick={(tabName) => {
//               if (showTabMenu !== tabName) {
//                 setActiveTab(tabName);
//                 setShowTabMenu(null);
//               }
//             }}
//             showTabMenu={showTabMenu}
//             onTabMenuClick={setShowTabMenu}
//             onEditTab={setShowEditTabModal}
//             onDeleteTab={setShowDeleteTabConfirm}
//           />

//           <MasterTypeList
//             activeTab={activeTab}
//             types={filteredTypes}
//             loading={loadingTypes}
//             searchTerm={typeSearchTerm}
//             onSearchChange={setTypeSearchTerm}
//             statusFilter={typeStatusFilter}
//             onStatusFilterChange={setTypeStatusFilter}
//             togglingTypeId={togglingTypeId}
//             onEditType={handleEditType}
//             onToggleStatus={toggleTypeStatus}
//             onDeleteType={setShowDeleteTypeConfirm}
//             onViewValues={(id) => router.push(`/admin/masters/${id}`)}
//             onNewType={() => setShowTypeForm(true)}
//             onRefresh={() => loadTypesForTab(activeTab)}
//           />
//         </div>
//       </div>

//        {/* For TabFormModal (create) */}
// {/* <TabFormModal
//   isOpen={showNewTabModal}
//   mode="create"
//   name={newTabName}
//   onNameChange={setNewTabName}
//   onSubmit={handleCreateTab}
//   onClose={() => {
//     setShowNewTabModal(false);
//     setNewTabName("");
//   }}
// /> */}
// <TabFormModal
//   isOpen={showNewTabModal}
//   formData={{ name: newTabName, is_active: true }}
//   submitting={false}
//   onFormDataChange={(data) => setNewTabName(data.name)}
//   onSubmit={handleCreateTab}
//   onClose={() => {
//     setShowNewTabModal(false);
//     setNewTabName("");
//   }}
// />



// {/*  For TabFormModal (edit) */}
// {/* <TabFormModal
//   isOpen={!!showEditTabModal}
//   mode="edit"
//   name={editTabName}
//   currentName={showEditTabModal?.name}
//   onNameChange={setEditTabName}
//   onSubmit={handleEditTab}
//   onClose={() => {
//     setShowEditTabModal(null);
//     setEditTabName("");
//   }}
// /> */}
// {/* For TabFormModal (edit) */}
// {/* ====== Edit Tab Modal ====== */}
// <TabFormModal
//   isOpen={!!showEditTabModal}
//   formData={{ name: editTabName, is_active: true }}
//   submitting={false}
//   onFormDataChange={(data) => setEditTabName(data.name)}
//   onSubmit={handleEditTab}
//   onClose={() => {
//     setShowEditTabModal(null);
//     setEditTabName("");
//   }}
// />



// {/*  For TypeFormModal */}
// {/* <TypeFormModal
//   isOpen={showTypeForm}
//   formData={typeFormData}
//   activeTab={activeTab}
//   submitting={submitting}
//   onFormDataChange={setTypeFormData}
//   onSubmit={handleTypeSubmit}
//   onClose={() => {
//     setShowTypeForm(false);
//     resetTypeForm();
//   }}
// /> */}
// <TypeFormModal
//   isOpen={showTypeForm}
//   formData={typeFormData}
//   activeTab={activeTab}
//   submitting={submitting}
//   onFormDataChange={setTypeFormData}
//   onSubmit={handleTypeSubmit}
//   onClose={() => {
//     setShowTypeForm(false);
//     resetTypeForm();
//   }}
// />

//       <DeleteConfirmModal
//         isOpen={!!showDeleteTypeConfirm}
//         type="type"
//         onConfirm={() => handleDeleteType(showDeleteTypeConfirm!)}
//         onClose={() => setShowDeleteTypeConfirm(null)}
//       />

//       <DeleteConfirmModal
//         isOpen={!!showDeleteTabConfirm}
//         type="tab"
//         tabName={showDeleteTabConfirm?.name}
//         typeCount={showDeleteTabConfirm?.type_count}
//         onConfirm={handleDeleteTab}
//         onClose={() => setShowDeleteTabConfirm(null)}
//       />
//     </div>
//   );
// }



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

      <div className="max-w-8xl mx-auto p-4 md:p-6 space-y-4">
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