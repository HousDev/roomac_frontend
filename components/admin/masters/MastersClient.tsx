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

import { useState, useEffect, useCallback, useMemo, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import {
  getMasterTypesByTab,
  createMasterType,
  updateMasterType,
  deleteMasterType,
  toggleMasterTypeStatus,
  getMasterTabs,
  createMasterTab,  // Add this import
  updateMasterTab,  // Add this import
  deleteMasterTab,  // Add this import
} from "@/lib/masterApi";
import Header from "./Header";
import StatsCards from "./StatsCards";
import TabList from "./TabList";
import MasterTypeList from "./MasterTypeList";
import DeleteConfirmModal from "./DeleteConfirmModal";
import DebugPanel from "./DebugPanel";
import TabFormModal from "./TabFormModal";
import TypeFormModal from "./TypeFormModal";

interface Tab {
  id?: number;
  name: string;
  type_count: number;
  created_at: string;
  is_active: number;
}

interface MasterType {
  id: number;
  code: string;
  name: string;
  tab: string | null;
  is_active: boolean;
  created_at: string;
  value_count: number;
}

interface MastersClientProps {
  initialTabs: Tab[];
}

export default function MastersClient({ initialTabs }: MastersClientProps) {
  const router = useRouter();
  
  // State for tabs
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState<string>("General");
  
  // State for master types
  const [types, setTypes] = useState<MasterType[]>([]);
  
  // Loading states
  const [loadingTabs, setLoadingTabs] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingTypeId, setTogglingTypeId] = useState<number | null>(null);
  
  // Search & Filter states
  const [tabSearchTerm, setTabSearchTerm] = useState("");
  const [typeSearchTerm, setTypeSearchTerm] = useState("");
  const [typeStatusFilter, setTypeStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  // Modal states
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showNewTabModal, setShowNewTabModal] = useState(false);
  const [showEditTabModal, setShowEditTabModal] = useState<Tab | null>(null);
  const [showDeleteTypeConfirm, setShowDeleteTypeConfirm] = useState<number | null>(null);
  const [showDeleteTabConfirm, setShowDeleteTabConfirm] = useState<Tab | null>(null);
  
  // Form data states
  const [typeFormData, setTypeFormData] = useState({
    id: null,
    code: "",
    name: "",
    is_active: true,
  });

  const [newTabName, setNewTabName] = useState("");
  const [editTabName, setEditTabName] = useState("");
  const [showTabMenu, setShowTabMenu] = useState<string | null>(null);

  // Load types for active tab
  const loadTypesForTab = useCallback(async (tabName: string) => {
    if (!tabName) {
      setTypes([]);
      return;
    }
    
    setLoadingTypes(true);
    try {
      const res = await getMasterTypesByTab(tabName);
      
      if (res.success) {
        let typesData = [];
        
        if (Array.isArray(res.data)) {
          typesData = res.data;
        } else if (Array.isArray(res.types)) {
          typesData = res.types;
        }
        
        if (tabName === "General") {
          const generalTypes = typesData.filter((type: { tab: string; }) => 
            !type.tab || type.tab.trim() === ""
          );
          setTypes(generalTypes);
        } else {
          const tabTypes = typesData.filter((type: { tab: string; }) => 
            type.tab && type.tab.trim() === tabName
          );
          setTypes(tabTypes);
        }
      } else {
        setTypes([]);
      }
    } catch (error) {
      console.error(`Failed to load types for tab "${tabName}":`, error);
      setTypes([]);
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  // Load tabs from API
  const loadTabs = useCallback(async () => {
    setLoadingTabs(true);
    try {
      const res = await getMasterTabs();
      
      let tabsList = [
        { name: "General", type_count: 0, created_at: new Date().toISOString(), is_active: 1 }
      ];
      
      if (res.success && Array.isArray(res.data)) {
        const apiTabs = res.data.map((tab: { id: any; name: any; tab_name: any; type_count: any; created_at: any; is_active: any; }) => ({
          id: tab.id,
          name: tab.name || tab.tab_name || "Unknown",
          type_count: tab.type_count || 0,
          created_at: tab.created_at || new Date().toISOString(),
          is_active: tab.is_active || 1
        }));
        
        tabsList = [...tabsList, ...apiTabs.filter((tab: { name: string; }) => tab.name !== "General")];
      }
      
      setTabs(tabsList);
      
      const tabExists = tabsList.some(tab => tab.name === activeTab);
      if (!tabExists) {
        const newActiveTab = tabsList[0]?.name || "General";
        setActiveTab(newActiveTab);
      }
    } catch (error) {
      console.error("Failed to load tabs:", error);
      setTabs([{ name: "General", type_count: 0, created_at: new Date().toISOString(), is_active: 1 }]);
    } finally {
      setLoadingTabs(false);
    }
  }, [activeTab]);

  // Handle manual refresh
  const handleManualRefresh = useCallback(() => {
    loadTabs();
    if (activeTab) {
      loadTypesForTab(activeTab);
    }
  }, [activeTab, loadTabs, loadTypesForTab]);

  // Load types when active tab changes
  useEffect(() => {
    if (activeTab) {
      loadTypesForTab(activeTab);
    }
  }, [activeTab, loadTypesForTab]);

  // Handle type creation/update
  const handleTypeSubmit = useCallback(async () => {
    if (!typeFormData.code.trim() && !typeFormData.id) {
      alert("Please enter a type code");
      return;
    }

    if (!typeFormData.name.trim()) {
      alert("Please enter a type name");
      return;
    }

    setSubmitting(true);
    try {
      if (typeFormData.id) {
        const res = await updateMasterType(typeFormData.id, {
          name: typeFormData.name.trim(),
          tab: activeTab === "General" ? "" : activeTab,
          is_active: typeFormData.is_active,
        });
        
        if (res.success) {
          await loadTypesForTab(activeTab);
          setShowTypeForm(false);
          resetTypeForm();
        } else {
          alert(res.error || "Failed to update master type");
        }
      } else {
        const code = typeFormData.code.trim().toUpperCase().replace(/\s+/g, '_');
        const res = await createMasterType({
          code: code,
          name: typeFormData.name.trim(),
          tab: activeTab === "General" ? "" : activeTab,
          is_active: typeFormData.is_active,
        });
        
        if (res.success) {
          await loadTypesForTab(activeTab);
          setShowTypeForm(false);
          resetTypeForm();
        } else {
          alert(res.error || "Failed to create master type");
        }
      }
    } catch (error) {
  console.error("Failed to save type:", error);
  
  let errorMessage = "Failed to save master type";
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }
  
  alert(`Error: ${errorMessage}`);
} finally {
  setSubmitting(false);
}
  }, [typeFormData, activeTab, loadTypesForTab]);

  // Handle delete type
  const handleDeleteType = useCallback(async (id: any) => {
    setShowDeleteTypeConfirm(null);
    try {
      const res = await deleteMasterType(id);
      
      if (res.success) {
        await loadTypesForTab(activeTab);
      } else {
        alert(res.error || "Failed to delete master type");
      }
    } catch (error) {

      console.error("Failed to delete type:", error);
      let errorMessage = "Failed to delete master type";
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }

      alert(`Error: ${errorMessage}`);
    }
  }, [activeTab, loadTypesForTab]);

  // Toggle type status
// Toggle type status
const toggleTypeStatus = useCallback(async (id: number, current: boolean) => {
  setTogglingTypeId(id);
  
  try {
    const newStatus = !current;
    const res = await toggleMasterTypeStatus(id, newStatus);
    
    if (res.success) {
      setTypes(prev => prev.map(type => 
        type.id === id ? { ...type, is_active: newStatus } : type
      ));
    } else {
      alert(res.error || "Failed to toggle status");
    }
  } catch (error) {
    console.error("Failed to toggle status:", error);
    
    let errorMessage = "Failed to toggle status";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    
    alert(`Error: ${errorMessage}`);
  } finally {
    setTogglingTypeId(null);
  }
}, []);

  // Handle edit type
  const handleEditType = useCallback((type: { id: any; code: any; name: any; is_active: any; }) => {
    setTypeFormData({
      id: type.id,
      code: type.code,
      name: type.name,
      is_active: type.is_active,
    });
    setShowTypeForm(true);
  }, []);

  // Reset type form
  const resetTypeForm = useCallback(() => {
    setTypeFormData({
      id: null,
      code: "",
      name: "",
      is_active: true,
    });
  }, []);

// Handle create tab - FIXED: Now calls API
const handleCreateTab = useCallback(async () => {
  if (!newTabName.trim()) {
    alert("Please enter a tab name");
    return;
  }

  const trimmedName = newTabName.trim();
  
  if (tabs.some(tab => tab.name.toLowerCase() === trimmedName.toLowerCase())) {
    alert("Tab already exists");
    return;
  }

  setSubmitting(true);
  try {
    const res = await createMasterTab({
      name: trimmedName,
      is_active: true
    });
    
    if (res.success) {
      // Reload tabs from API to get the updated list
      await loadTabs();
      setActiveTab(trimmedName);
      setNewTabName("");
      setShowNewTabModal(false);
    } else {
      alert(res.error || "Failed to create tab");
    }
  } catch (error) {
    console.error("Failed to create tab:", error);
    
    // Handle error properly
    let errorMessage = "Failed to create tab";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    
    alert(`Error: ${errorMessage}`);
  } finally {
    setSubmitting(false);
  }
}, [newTabName, tabs, loadTabs]);

  // Handle edit tab - FIXED: Now calls API
  const handleEditTab = useCallback(async () => {
    if (!showEditTabModal) return;
    
    const oldName = showEditTabModal.name;
    const newName = editTabName.trim();
    
    if (!newName) {
      alert("Please enter a tab name");
      return;
    }

    if (oldName === newName) {
      setShowEditTabModal(null);
      setEditTabName("");
      return;
    }

    if (tabs.some(tab => 
      tab.name.toLowerCase() === newName.toLowerCase() && 
      tab.name !== oldName
    )) {
      alert("Tab already exists");
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateMasterTab(oldName, {
        name: newName,
        is_active: true
      });
      
      if (res.success) {
        // Reload tabs from API
        await loadTabs();
        setShowEditTabModal(null);
        setEditTabName("");
      } else {
        alert(res.error || "Failed to update tab");
      }
    } catch (error) {
  console.error("Failed to update tab:", error);
  
  let errorMessage = "Failed to update tab";
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }
  
  alert(`Error: ${errorMessage}`);
} finally {
  setSubmitting(false);
}
  }, [showEditTabModal, editTabName, tabs, loadTabs]);

  // Handle delete tab - FIXED: Now calls API
  const handleDeleteTab = useCallback(async () => {
    if (!showDeleteTabConfirm) return;
    
    const tabToDelete = showDeleteTabConfirm.name;
    
    if (tabToDelete === "General") {
      alert("Cannot delete the General tab");
      setShowDeleteTabConfirm(null);
      return;
    }

    if (showDeleteTabConfirm.type_count > 0) {
      if (!confirm(`This tab has ${showDeleteTabConfirm.type_count} types. Deleting it will also delete all types in this tab. Are you sure?`)) {
        setShowDeleteTabConfirm(null);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await deleteMasterTab(tabToDelete);
      
      if (res.success) {
        // Reload tabs from API
        await loadTabs();
        setShowDeleteTabConfirm(null);
      } else {
        alert(res.error || "Failed to delete tab");
      }
    } catch (error) {
  console.error("Failed to delete tab:", error);
  
  let errorMessage = "Failed to delete tab";
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }
  
  alert(`Error: ${errorMessage}`);
} finally {
  setSubmitting(false);
}
  }, [showDeleteTabConfirm, loadTabs]);

  // Filtered tabs based on search
  const filteredTabs = useMemo(() => 
    tabs.filter(tab => 
      tab.name.toLowerCase().includes(tabSearchTerm.toLowerCase())
    ), [tabs, tabSearchTerm]
  );

  // Filtered types based on search and filter
  const filteredTypes = useMemo(() => 
    types.filter(type => {
      const matchesSearch = typeSearchTerm === "" || 
        type.name.toLowerCase().includes(typeSearchTerm.toLowerCase()) ||
        type.code.toLowerCase().includes(typeSearchTerm.toLowerCase());
      
      const matchesStatus = typeStatusFilter === "all" || 
        (typeStatusFilter === "active" && type.is_active) ||
        (typeStatusFilter === "inactive" && !type.is_active);
      
      return matchesSearch && matchesStatus;
    }), [types, typeSearchTerm, typeStatusFilter]
  );

  // Statistics
  const stats = useMemo(() => ({
    totalTypes: types.length,
    activeTypes: types.filter(t => t.is_active).length,
  }), [types]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DebugPanel 
        tabs={tabs}
        activeTab={activeTab}
        types={types}
        filteredTypes={filteredTypes}
        onRefresh={handleManualRefresh}
      />

      <Header
        onRefresh={handleManualRefresh}
        onNewTab={() => setShowNewTabModal(true)}
        onNewType={() => setShowTypeForm(true)}
        loadingTabs={loadingTabs}
        loadingTypes={loadingTypes}
        activeTab={activeTab}
      />

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <StatsCards 
          activeTab={activeTab}
          totalTypes={stats.totalTypes}
          activeTypes={stats.activeTypes}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TabList
            tabs={filteredTabs}
            activeTab={activeTab}
            loading={loadingTabs}
            searchTerm={tabSearchTerm}
            onSearchChange={setTabSearchTerm}
            onTabClick={(tabName) => {
              if (showTabMenu !== tabName) {
                setActiveTab(tabName);
                setShowTabMenu(null);
              }
            }}
            showTabMenu={showTabMenu}
            onTabMenuClick={setShowTabMenu}
            onEditTab={setShowEditTabModal}
            onDeleteTab={setShowDeleteTabConfirm}
          />

          <MasterTypeList
            activeTab={activeTab}
            types={filteredTypes}
            loading={loadingTypes}
            searchTerm={typeSearchTerm}
            onSearchChange={setTypeSearchTerm}
            statusFilter={typeStatusFilter}
            onStatusFilterChange={setTypeStatusFilter}
            togglingTypeId={togglingTypeId}
            onEditType={handleEditType}
            onToggleStatus={toggleTypeStatus}
            onDeleteType={setShowDeleteTypeConfirm}
            onViewValues={(id) => router.push(`/admin/masters/${id}`)}
            onNewType={() => setShowTypeForm(true)}
            onRefresh={() => loadTypesForTab(activeTab)}
          />
        </div>
      </div>

      {/* Create Tab Modal */}
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

      {/* Edit Tab Modal */}
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

      {/* Type Form Modal */}
      <TypeFormModal
        isOpen={showTypeForm}
        formData={typeFormData}
        activeTab={activeTab}
        submitting={submitting}
        onFormDataChange={setTypeFormData}
        onSubmit={handleTypeSubmit}
        onClose={() => {
          setShowTypeForm(false);
          resetTypeForm();
        }}
      />

      <DeleteConfirmModal
        isOpen={!!showDeleteTypeConfirm}
        type="type"
        onConfirm={() => handleDeleteType(showDeleteTypeConfirm)}
        onClose={() => setShowDeleteTypeConfirm(null)}
      />

      <DeleteConfirmModal
        isOpen={!!showDeleteTabConfirm}
        type="tab"
        tabName={showDeleteTabConfirm?.name}
        typeCount={showDeleteTabConfirm?.type_count}
        onConfirm={handleDeleteTab}
        onClose={() => setShowDeleteTabConfirm(null)}
      />
    </div>
  );
}