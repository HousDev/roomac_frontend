// admin/masters/page.tsx 
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   getMasterTabs,
//   getMasterTypesByTab,
//   createMasterType,
//   updateMasterType,
//   deleteMasterType,
//   toggleMasterTypeStatus,
//   updateMasterTab,
//   deleteMasterTab,
// } from "@/lib/masterApi";
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   ChevronRight,
//   CheckCircle,
//   XCircle,
//   Save,
//   X,
//   Shield,
//   Loader2,
//   Search,
//   FolderPlus,
//   Tag,
//   AlertCircle,
//   RefreshCw,
//   Building,
//   Users,
//   FileCheck,
//   DollarSign,
//   FolderOpen,
//   Layers,
//   Code,
//   Key,
//   Folder,
//   Home,
//   Briefcase,
//   CreditCard,
//   Settings,
//   Grid,
//   Package,
//   Globe,
//   FileText,
//   Clock,
//   MoreVertical,
// } from "lucide-react";

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

// export default function MasterTypesPage() {
//   const router = useRouter();
//   console.log("🔍 [DEBUG] MasterTypesPage component rendered");
  
//   // State for tabs
//   const [tabs, setTabs] = useState<Tab[]>([
//     { name: "General", type_count: 0, created_at: new Date().toISOString(), is_active: 1 }
//   ]);
//   const [activeTab, setActiveTab] = useState<string>("General");
  
//   // State for master types
//   const [types, setTypes] = useState<MasterType[]>([]);
  
//   // Loading states
//   const [loadingTabs, setLoadingTabs] = useState(true);
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

//   // Load all tabs
//   const loadTabs = async () => {
//     console.log("🔍 [DEBUG] loadTabs() called");
//     setLoadingTabs(true);
//     try {
//       console.log("🔍 [DEBUG] Calling getMasterTabs API...");
//       const res = await getMasterTabs();
//       console.log("🔍 [DEBUG] getMasterTabs response:", JSON.stringify(res, null, 2));
      
//       let tabsList: Tab[] = [
//         { name: "General", type_count: 0, created_at: new Date().toISOString(), is_active: 1 }
//       ];
      
//       // Handle API response
//       if (res.success && Array.isArray(res.data)) {
//         // Convert API response to Tab objects
//         const apiTabs: Tab[] = res.data.map((tab: any) => ({
//           id: tab.id,
//           name: tab.name || tab.tab_name || "Unknown",
//           type_count: tab.type_count || 0,
//           created_at: tab.created_at || new Date().toISOString(),
//           is_active: tab.is_active || 1
//         }));
        
//         // Add API tabs to the list (excluding General if it already exists)
//         tabsList = [...tabsList, ...apiTabs.filter(tab => tab.name !== "General")];
//       }
      
//       console.log("🔍 [DEBUG] Setting tabs:", tabsList);
//       setTabs(tabsList);
      
//       // Check if current active tab exists in new tabs
//       const tabExists = tabsList.some(tab => tab.name === activeTab);
//       if (!tabExists) {
//         const newActiveTab = tabsList[0]?.name || "General";
//         console.log(`🔍 [DEBUG] Active tab "${activeTab}" not in new tabs, switching to:`, newActiveTab);
//         setActiveTab(newActiveTab);
//       } else {
//         console.log(`🔍 [DEBUG] Active tab "${activeTab}" exists in new tabs`);
//       }
//     } catch (error) {
//       console.error("🔍 [DEBUG] Failed to load tabs:", error);
//       setTabs([{ name: "General", type_count: 0, created_at: new Date().toISOString(), is_active: 1 }]);
//     } finally {
//       console.log("🔍 [DEBUG] loadTabs completed, loadingTabs set to false");
//       setLoadingTabs(false);
//     }
//   };

//   // Load types for active tab
//   const loadTypesForTab = async (tabName: string) => {
//     console.log(`🔍 [DEBUG] loadTypesForTab("${tabName}") called`);
    
//     // Don't load if tab is empty
//     if (!tabName) {
//       console.warn("🔍 [DEBUG] Tab is empty, skipping load");
//       setTypes([]);
//       return;
//     }
    
//     setLoadingTypes(true);
//     try {
//       console.log(`🔍 [DEBUG] Calling getMasterTypesByTab API for tab: "${tabName}"`);
//       const res = await getMasterTypesByTab(tabName);
//       console.log(`🔍 [DEBUG] getMasterTypesByTab response for "${tabName}":`, JSON.stringify(res, null, 2));
      
//       if (res.success) {
//         let typesData: MasterType[] = [];
        
//         // Handle different response formats
//         if (Array.isArray(res.data)) {
//           typesData = res.data;
//         } else if (Array.isArray(res.types)) {
//           typesData = res.types;
//         }
        
//         console.log(`🔍 [DEBUG] Received ${typesData.length} types from API`);
        
//         // SPECIAL HANDLING FOR "General" TAB:
//         if (tabName === "General") {
//           // For General tab, show types with empty/null tab
//           const generalTypes = typesData.filter(type => 
//             !type.tab || type.tab.trim() === ""
//           );
//           console.log(`🔍 [DEBUG] Filtered ${generalTypes.length} types for General tab`);
//           setTypes(generalTypes);
//         } else {
//           // For specific tabs, show only types with that exact tab
//           const tabTypes = typesData.filter(type => 
//             type.tab && type.tab.trim() === tabName
//           );
//           console.log(`🔍 [DEBUG] Filtered ${tabTypes.length} types for "${tabName}" tab`);
//           setTypes(tabTypes);
//         }
//       } else {
//         console.warn(`🔍 [DEBUG] Invalid types response for tab "${tabName}":`, res);
//         setTypes([]);
//       }
//     } catch (error) {
//       console.error(`🔍 [DEBUG] Failed to load types for tab "${tabName}":`, error);
//       setTypes([]);
//     } finally {
//       console.log(`🔍 [DEBUG] loadTypesForTab for "${tabName}" completed`);
//       setLoadingTypes(false);
//     }
//   };

//   // Initial load - run once on mount
//   useEffect(() => {
//     console.log("🔍 [DEBUG] Initial useEffect triggered (mount)");
//     console.log("🔍 [DEBUG] Current activeTab:", activeTab);
//     console.log("🔍 [DEBUG] Current tabs:", tabs);
    
//     loadTabs();
    
//     // Add event listener for page visibility
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === 'visible') {
//         console.log("🔍 [DEBUG] Page became visible, refreshing data...");
//         loadTabs();
//         if (activeTab) {
//           loadTypesForTab(activeTab);
//         }
//       }
//     };
    
//     document.addEventListener('visibilitychange', handleVisibilityChange);
    
//     return () => {
//       console.log("🔍 [DEBUG] Component unmounting, cleaning up...");
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//     };
//   }, []); // Empty dependency array = run only on mount/unmount

//   // Load types when active tab changes OR when tabs array changes
//   useEffect(() => {
//     console.log("🔍 [DEBUG] useEffect for activeTab/tabs triggered");
//     console.log("🔍 [DEBUG] activeTab:", activeTab);
//     console.log("🔍 [DEBUG] tabs:", tabs);
//     console.log("🔍 [DEBUG] types length:", types.length);
    
//     if (activeTab) {
//       console.log(`🔍 [DEBUG] Active tab changed to "${activeTab}", loading types...`);
//       loadTypesForTab(activeTab);
//     } else if (tabs.length > 0) {
//       const firstTab = tabs[0]?.name || "General";
//       console.log(`🔍 [DEBUG] No active tab but tabs exist, setting first tab as active:`, firstTab);
//       setActiveTab(firstTab);
//     }
//   }, [activeTab, tabs]); // Run when activeTab OR tabs changes

//   // Log state changes for debugging
//   useEffect(() => {
//     console.log("🔍 [DEBUG] State updated - tabs:", tabs);
//     console.log("🔍 [DEBUG] State updated - activeTab:", activeTab);
//     console.log("🔍 [DEBUG] State updated - types:", types.length, "items");
//     if (types.length > 0) {
//       console.log("🔍 [DEBUG] First type:", types[0]);
//     }
//   }, [tabs, activeTab, types]);

//   // Filtered types based on search and filter
//   const filteredTypes = types.filter(type => {
//     const matchesSearch = typeSearchTerm === "" || 
//       type.name.toLowerCase().includes(typeSearchTerm.toLowerCase()) ||
//       type.code.toLowerCase().includes(typeSearchTerm.toLowerCase());
    
//     const matchesStatus = typeStatusFilter === "all" || 
//       (typeStatusFilter === "active" && type.is_active) ||
//       (typeStatusFilter === "inactive" && !type.is_active);
    
//     return matchesSearch && matchesStatus;
//   });

//   // Filtered tabs based on search
//   const filteredTabs = tabs.filter(tab => 
//     tab.name.toLowerCase().includes(tabSearchTerm.toLowerCase())
//   );

//   // Handle type creation/update
//   const handleTypeSubmit = async () => {
//     console.log("🔍 [DEBUG] handleTypeSubmit called");
//     console.log("🔍 [DEBUG] Form data:", typeFormData);
//     console.log("🔍 [DEBUG] Active tab:", activeTab);
    
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
//         // Update existing type
//         console.log(`🔍 [DEBUG] Updating type ${typeFormData.id}`);
//         const res = await updateMasterType(typeFormData.id, {
//           name: typeFormData.name.trim(),
//           tab: activeTab === "General" ? "" : activeTab,
//           is_active: typeFormData.is_active,
//         });
        
//         console.log("🔍 [DEBUG] Update response:", res);
        
//         if (res.success) {
//           console.log("🔍 [DEBUG] Update successful, reloading types...");
//           await loadTypesForTab(activeTab);
//           setShowTypeForm(false);
//           resetTypeForm();
//         } else {
//           alert(res.error || "Failed to update master type");
//         }
//       } else {
//         // Create new type
//         const code = typeFormData.code.trim().toUpperCase().replace(/\s+/g, '_');
//         console.log(`🔍 [DEBUG] Creating new type with code: ${code}, tab: "${activeTab}"`);
        
//         const res = await createMasterType({
//           code: code,
//           name: typeFormData.name.trim(),
//           tab: activeTab === "General" ? "" : activeTab,
//           is_active: typeFormData.is_active,
//         });
        
//         console.log("🔍 [DEBUG] Create response:", res);
        
//         if (res.success) {
//           console.log("🔍 [DEBUG] Create successful, reloading types...");
//           await loadTypesForTab(activeTab);
//           setShowTypeForm(false);
//           resetTypeForm();
//         } else {
//           alert(res.error || "Failed to create master type");
//         }
//       }
//     } catch (error: any) {
//       console.error("🔍 [DEBUG] Failed to save type:", error);
//       alert(`Error: ${error.message || "Failed to save master type"}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Handle delete type
//   const handleDeleteType = async (id: number) => {
//     console.log(`🔍 [DEBUG] handleDeleteType called for id: ${id}`);
//     setShowDeleteTypeConfirm(null);
//     try {
//       const res = await deleteMasterType(id);
//       console.log("🔍 [DEBUG] Delete response:", res);
      
//       if (res.success) {
//         console.log("🔍 [DEBUG] Delete successful, reloading types...");
//         await loadTypesForTab(activeTab);
//       } else {
//         alert(res.error || "Failed to delete master type");
//       }
//     } catch (error: any) {
//       console.error("🔍 [DEBUG] Failed to delete type:", error);
//       alert(`Error: ${error.message || "Failed to delete master type"}`);
//     }
//   };

//   // Toggle type status
//   const toggleTypeStatus = async (id: number, current: boolean) => {
//     console.log(`🔍 [DEBUG] toggleTypeStatus called for id: ${id}, current: ${current}`);
//     setTogglingTypeId(id);
//     try {
//       const newStatus = !current;
//       console.log(`🔍 [DEBUG] Toggling status to: ${newStatus}`);
      
//       const res = await toggleMasterTypeStatus(id, newStatus);
//       console.log("🔍 [DEBUG] Toggle response:", res);
      
//       if (res.success) {
//         // Update local state
//         setTypes(prev => prev.map(type => 
//           type.id === id ? { ...type, is_active: newStatus } : type
//         ));
//         console.log(`🔍 [DEBUG] Local state updated for type ${id}`);
//       } else {
//         alert(res.error || "Failed to toggle status");
//       }
//     } catch (error: any) {
//       console.error("🔍 [DEBUG] Failed to toggle status:", error);
//       alert(`Error: ${error.message || "Failed to toggle status"}`);
//     } finally {
//       setTogglingTypeId(null);
//     }
//   };

//   // Create a new tab
//   const handleCreateTab = async () => {
//     console.log("🔍 [DEBUG] handleCreateTab called");
//     console.log("🔍 [DEBUG] New tab name:", newTabName);
    
//     if (!newTabName.trim()) {
//       alert("Please enter a tab name");
//       return;
//     }

//     const trimmedName = newTabName.trim();
    
//     // Check if tab already exists
//     if (tabs.some(tab => tab.name.toLowerCase() === trimmedName.toLowerCase())) {
//       alert("Tab already exists");
//       return;
//     }

//     console.log(`🔍 [DEBUG] Creating new tab: "${trimmedName}"`);
    
//     try {
//       // Check if updateMasterTab API exists (for creating tabs)
//       // If not, we'll just update local state
//       if (typeof updateMasterTab === 'function') {
//         const res = await updateMasterTab({
//           name: trimmedName,
//           is_active: 1
//         });
        
//         if (res.success) {
//           console.log("🔍 [DEBUG] Tab created via API, reloading tabs...");
//           await loadTabs();
//         } else {
//           // Fallback to local state
//           createTabLocally(trimmedName);
//         }
//       } else {
//         // Create in local state only
//         createTabLocally(trimmedName);
//       }
//     } catch (error) {
//       console.error("🔍 [DEBUG] Failed to create tab via API:", error);
//       createTabLocally(trimmedName);
//     }
    
//     function createTabLocally(name: string) {
//       const newTab: Tab = {
//         name: name,
//         type_count: 0,
//         created_at: new Date().toISOString(),
//         is_active: 1
//       };
      
//       const newTabs = [...tabs, newTab];
//       setTabs(newTabs);
//       console.log(`🔍 [DEBUG] Tab created locally: "${name}"`);
//     }
    
//     setActiveTab(trimmedName);
//     setNewTabName("");
//     setShowNewTabModal(false);
//   };

//   // Edit existing tab
//   const handleEditTab = async () => {
//     if (!showEditTabModal) return;
    
//     const oldName = showEditTabModal.name;
//     const newName = editTabName.trim();
    
//     console.log(`🔍 [DEBUG] handleEditTab called: "${oldName}" -> "${newName}"`);
    
//     if (!newName) {
//       alert("Please enter a tab name");
//       return;
//     }

//     if (oldName === newName) {
//       setShowEditTabModal(null);
//       setEditTabName("");
//       return;
//     }

//     // Check if tab already exists (excluding the current one)
//     if (tabs.some(tab => 
//       tab.name.toLowerCase() === newName.toLowerCase() && 
//       tab.name !== oldName
//     )) {
//       alert("Tab already exists");
//       return;
//     }

//     try {
//       // Check if updateMasterTab API exists
//       if (typeof updateMasterTab === 'function' && showEditTabModal.id) {
//         const res = await updateMasterTab({
//           id: showEditTabModal.id,
//           name: newName,
//           is_active: showEditTabModal.is_active
//         });
        
//         if (res.success) {
//           console.log("🔍 [DEBUG] Tab updated via API, reloading tabs...");
//           await loadTabs();
          
//           // Update active tab if it was the edited one
//           if (activeTab === oldName) {
//             setActiveTab(newName);
//           }
//         } else {
//           // Fallback to local state
//           updateTabLocally(oldName, newName);
//         }
//       } else {
//         // Update in local state only
//         updateTabLocally(oldName, newName);
//       }
//     } catch (error) {
//       console.error("🔍 [DEBUG] Failed to update tab via API:", error);
//       updateTabLocally(oldName, newName);
//     }
    
//     function updateTabLocally(oldName: string, newName: string) {
//       setTabs(prev => prev.map(tab => 
//         tab.name === oldName ? { ...tab, name: newName } : tab
//       ));
      
//       // Update active tab if it was the edited one
//       if (activeTab === oldName) {
//         setActiveTab(newName);
//       }
      
//       console.log(`🔍 [DEBUG] Tab updated locally: "${oldName}" -> "${newName}"`);
//     }
    
//     setShowEditTabModal(null);
//     setEditTabName("");
//   };

//   // Delete tab
//   const handleDeleteTab = async () => {
//     if (!showDeleteTabConfirm) return;
    
//     const tabToDelete = showDeleteTabConfirm.name;
//     console.log(`🔍 [DEBUG] handleDeleteTab called for: "${tabToDelete}"`);
    
//     // Don't allow deleting General tab
//     if (tabToDelete === "General") {
//       alert("Cannot delete the General tab");
//       setShowDeleteTabConfirm(null);
//       return;
//     }

//     // Check if tab has types
//     if (showDeleteTabConfirm.type_count > 0) {
//       if (!confirm(`This tab has ${showDeleteTabConfirm.type_count} types. Deleting it will also delete all types in this tab. Are you sure?`)) {
//         setShowDeleteTabConfirm(null);
//         return;
//       }
//     }

//     try {
//       // Check if deleteMasterTab API exists
//       if (typeof deleteMasterTab === 'function' && showDeleteTabConfirm.id) {
//         const res = await deleteMasterTab(showDeleteTabConfirm.id);
        
//         if (res.success) {
//           console.log("🔍 [DEBUG] Tab deleted via API, reloading tabs...");
//           await loadTabs();
//         } else {
//           // Fallback to local state
//           deleteTabLocally(tabToDelete);
//         }
//       } else {
//         // Delete from local state only
//         deleteTabLocally(tabToDelete);
//       }
//     } catch (error) {
//       console.error("🔍 [DEBUG] Failed to delete tab via API:", error);
//       deleteTabLocally(tabToDelete);
//     }
    
//     function deleteTabLocally(tabName: string) {
//       // Remove tab from list
//       const newTabs = tabs.filter(tab => tab.name !== tabName);
//       setTabs(newTabs);
      
//       // If deleted tab was active, switch to first available tab
//       if (activeTab === tabName) {
//         const newActiveTab = newTabs[0]?.name || "General";
//         setActiveTab(newActiveTab);
//       }
      
//       console.log(`🔍 [DEBUG] Tab deleted locally: "${tabName}"`);
//     }
    
//     setShowDeleteTabConfirm(null);
//   };

//   // Reset type form
//   const resetTypeForm = () => {
//     console.log("🔍 [DEBUG] resetTypeForm called");
//     setTypeFormData({
//       id: null,
//       code: "",
//       name: "",
//       is_active: true,
//     });
//   };

//   // Handle edit type
//   const handleEditType = (type: MasterType) => {
//     console.log(`🔍 [DEBUG] handleEditType called for type:`, type);
//     setTypeFormData({
//       id: type.id,
//       code: type.code,
//       name: type.name,
//       is_active: type.is_active,
//     });
//     setShowTypeForm(true);
//   };

//   // Get icon for tab
//   const getTabIcon = (tabName: string) => {
//     const tabLower = tabName.toLowerCase();
//     if (tabLower.includes('property') || tabLower.includes('term')) {
//       return <Home size={16} />;
//     } else if (tabLower.includes('tenant') || tabLower.includes('user')) {
//       return <Users size={16} />;
//     } else if (tabLower.includes('agreement') || tabLower.includes('contract')) {
//       return <FileText size={16} />;
//     } else if (tabLower.includes('payment') || tabLower.includes('finance')) {
//       return <CreditCard size={16} />;
//     } else if (tabLower.includes('system') || tabLower.includes('settings')) {
//       return <Settings size={16} />;
//     } else if (tabLower.includes('general')) {
//       return <FolderOpen size={16} />;
//     } else if (tabLower.includes('business') || tabLower.includes('work')) {
//       return <Briefcase size={16} />;
//     } else if (tabLower.includes('location') || tabLower.includes('city')) {
//       return <Globe size={16} />;
//     } else if (tabLower.includes('maintenance') || tabLower.includes('repair')) {
//       return <Package size={16} />;
//     }
//     return <FolderOpen size={16} />;
//   };

//   // Get icon for type
//   const getTypeIcon = (typeName: string) => {
//     const name = typeName.toLowerCase();
//     if (name.includes('property') || name.includes('building') || name.includes('home')) {
//       return <Home size={16} />;
//     } else if (name.includes('tenant') || name.includes('user')) {
//       return <Users size={16} />;
//     } else if (name.includes('agreement') || name.includes('contract')) {
//       return <FileText size={16} />;
//     } else if (name.includes('payment') || name.includes('rent')) {
//       return <CreditCard size={16} />;
//     } else if (name.includes('code') || name.includes('key')) {
//       return <Code size={16} />;
//     } else if (name.includes('city') || name.includes('state') || name.includes('country')) {
//       return <Globe size={16} />;
//     } else if (name.includes('amenity') || name.includes('facility')) {
//       return <Package size={16} />;
//     } else if (name.includes('period') || name.includes('time')) {
//       return <Clock size={16} />;
//     }
//     return <Tag size={16} />;
//   };

//   // Format date
//   const formatDate = (dateString: string) => {
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric'
//       });
//     } catch {
//       return "Invalid date";
//     }
//   };

//   // Calculate statistics
//   const totalTypes = types.length;
//   const activeTypes = types.filter(t => t.is_active).length;

//   console.log("🔍 [DEBUG] Render stats - tabs:", tabs.length, "activeTab:", activeTab, "types:", types.length, "filteredTypes:", filteredTypes.length);
  
//   // Add manual refresh function
//   const handleManualRefresh = () => {
//     console.log("🔍 [DEBUG] ====== MANUAL REFRESH TRIGGERED ======");
//     console.log("🔍 [DEBUG] Current state before refresh:");
//     console.log("🔍 [DEBUG] - tabs:", tabs);
//     console.log("🔍 [DEBUG] - activeTab:", activeTab);
//     console.log("🔍 [DEBUG] - types:", types);
    
//     loadTabs();
//     if (activeTab) {
//       loadTypesForTab(activeTab);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* DEBUG PANEL - Add this for troubleshooting */}
//       {/* <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
//         <div className="font-bold mb-1">🔍 DEBUG INFO</div>
//         <div>Tabs: {tabs.length}</div>
//         <div>Active: "{activeTab}"</div>
//         <div>Types: {types.length}</div>
//         <div>Filtered: {filteredTypes.length}</div>
//         <button 
//           onClick={handleManualRefresh}
//           className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
//         >
//           Force Refresh
//         </button>
//       </div> */}

//       {/* Header */}
//       <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto p-4 md:p-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-50 rounded-lg">
//                 <Shield className="h-6 w-6 text-blue-600" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-800">Master Configuration</h1>
//                 <p className="text-gray-600 text-sm">Manage system configuration by categories</p>
//               </div>
//             </div>
            
//             <div className="flex gap-2">
//               <button
//                 onClick={handleManualRefresh}
//                 disabled={loadingTabs || loadingTypes}
//                 className="px-3 py-2 bg-white border rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
//               >
//                 <RefreshCw size={16} className={(loadingTabs || loadingTypes) ? 'animate-spin' : ''} />
//                 Refresh
//               </button>
              
//               <button
//                 onClick={() => setShowNewTabModal(true)}
//                 className="px-3 py-2 bg-white border rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
//               >
//                 <FolderPlus size={16} />
//                 New Tab
//               </button>
              
//               <button
//                 onClick={() => {
//                   console.log("🔍 [DEBUG] New Type button clicked, activeTab:", activeTab);
//                   setShowTypeForm(true);
//                 }}
//                 disabled={!activeTab}
//                 className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 text-sm"
//               >
//                 <Plus size={16} />
//                 New Type
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto p-4 md:p-6">
//         {/* Stats Overview - UPDATED DESIGN */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-md p-4 border border-blue-100 hover:shadow-lg transition-shadow duration-300">
//             <div className="flex items-center justify-between">
//               <div className="flex-1">
//                 <div className="flex items-center gap-2 mb-1">
//                   <div className="p-1 bg-blue-100 rounded-lg">
//                     <div className="text-blue-600 text-xs">📋</div>
//                   </div>
//                   <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Current Tab</p>
//                 </div>
//                 <div className="flex items-center gap-2 mt-1">
//                   <div className="text-gray-600">
//                     {getTabIcon(activeTab)}
//                   </div>
//                   <p className="text-lg font-bold text-gray-800">{activeTab}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-md p-4 border border-purple-100 hover:shadow-lg transition-shadow duration-300">
//             <div className="flex items-center justify-between">
//               <div className="flex-1">
//                 <div className="flex items-center gap-2 mb-1">
//                   <div className="p-1 bg-purple-100 rounded-lg">
//                     <div className="text-purple-600 text-xs">🏷️</div>
//                   </div>
//                   <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Master Types</p>
//                 </div>
//                 <p className="text-xl font-bold text-gray-800 mt-1">{totalTypes}</p>
//               </div>
//               <div className="p-2 bg-purple-100 rounded-xl">
//                 <Tag className="h-5 w-5 text-purple-600" />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-md p-4 border border-emerald-100 hover:shadow-lg transition-shadow duration-300">
//             <div className="flex items-center justify-between">
//               <div className="flex-1">
//                 <div className="flex items-center gap-2 mb-1">
//                   <div className="p-1 bg-emerald-100 rounded-lg">
//                     <div className="text-emerald-600 text-xs">✓</div>
//                   </div>
//                   <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Active Status</p>
//                 </div>
//                 <p className="text-xl font-bold text-emerald-600 mt-1">{activeTypes}</p>
//               </div>
//               <div className="p-2 bg-emerald-100 rounded-xl">
//                 <CheckCircle className="h-5 w-5 text-emerald-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Area */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Panel - Tabs List */}
//           <div className="lg:col-span-1 space-y-4">
//             {/* Tabs Header */}
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-gray-800">Categories (Tabs)</h2>
//               <span className="text-sm text-gray-500">
//                 {filteredTabs.length} of {tabs.length}
//               </span>
//             </div>

//             {/* Tabs Search */}
//             <div className="bg-white rounded-xl shadow-sm p-4 border">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <input
//                   type="text"
//                   placeholder="Search tabs..."
//                   className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                   value={tabSearchTerm}
//                   onChange={(e) => setTabSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Tabs List */}
//             <div className="bg-white rounded-xl shadow-sm border overflow-hidden max-h-[500px] overflow-y-auto">
//               {loadingTabs ? (
//                 <div className="p-8 text-center">
//                   <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
//                   <p className="mt-2 text-sm text-gray-500">Loading tabs...</p>
//                 </div>
//               ) : filteredTabs.length === 0 ? (
//                 <div className="p-8 text-center">
//                   <FolderOpen className="h-12 w-12 mx-auto text-gray-300" />
//                   <p className="mt-2 text-gray-500">No tabs found</p>
//                 </div>
//               ) : (
//                 <div className="divide-y">
//                   {filteredTabs.map((tab) => (
//                     <div
//                       key={tab.name}
//                       className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 relative ${
//                         activeTab === tab.name 
//                           ? 'bg-blue-50 border-l-4 border-l-blue-500' 
//                           : ''
//                       }`}
//                       onClick={() => {
//                         if (showTabMenu !== tab.name) {
//                           console.log(`🔍 [DEBUG] Tab clicked: "${tab.name}", current active: "${activeTab}"`);
//                           setActiveTab(tab.name);
//                           setShowTabMenu(null);
//                         }
//                       }}
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className={`p-2 rounded-lg ${
//                           activeTab === tab.name 
//                             ? 'bg-blue-100 text-blue-600' 
//                             : 'bg-gray-100 text-gray-600'
//                         }`}>
//                           {getTabIcon(tab.name)}
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex items-center justify-between">
//                             <h3 className="font-semibold text-gray-800 text-sm">
//                               {tab.name}
//                             </h3>
//                             <div className="flex items-center gap-2">
//                               <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                                 {tab.type_count || 0}
//                               </span>
//                               {tab.name !== "General" && (
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setShowTabMenu(showTabMenu === tab.name ? null : tab.name);
//                                   }}
//                                   className="p-1 hover:bg-gray-200 rounded"
//                                 >
//                                   <MoreVertical size={14} className="text-gray-500" />
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                           <p className="text-xs text-gray-500 mt-1">
//                             Created {formatDate(tab.created_at)}
//                           </p>
//                         </div>
//                       </div>
                      
//                       {/* Tab Actions Menu */}
//                       {showTabMenu === tab.name && tab.name !== "General" && (
//                         <div className="absolute right-2 top-10 z-10 bg-white border rounded-lg shadow-lg py-1 w-32">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setShowEditTabModal(tab);
//                               setEditTabName(tab.name);
//                               setShowTabMenu(null);
//                             }}
//                             className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
//                           >
//                             <Edit2 size={14} />
//                             Edit Tab
//                           </button>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setShowDeleteTabConfirm(tab);
//                               setShowTabMenu(null);
//                             }}
//                             className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
//                           >
//                             <Trash2 size={14} />
//                             Delete Tab
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right Panel - Master Types */}
//           <div className="lg:col-span-2 space-y-4">
//             {/* Types Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-800">
//                   {activeTab || "Select a Tab"}
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">Master types in this category</p>
//               </div>
              
//               {activeTab && (
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => {
//                       console.log(`🔍 [DEBUG] Refresh types for tab: "${activeTab}"`);
//                       loadTypesForTab(activeTab);
//                     }}
//                     disabled={loadingTypes}
//                     className="px-3 py-2 bg-white border rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
//                   >
//                     <RefreshCw size={16} className={loadingTypes ? 'animate-spin' : ''} />
//                     Refresh
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Types Search & Filters */}
//             {activeTab && (
//               <div className="bg-white rounded-xl shadow-sm p-4 border">
//                 <div className="space-y-3">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                     <input
//                       type="text"
//                       placeholder={`Search types in ${activeTab}...`}
//                       className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                       value={typeSearchTerm}
//                       onChange={(e) => setTypeSearchTerm(e.target.value)}
//                     />
//                   </div>
                  
//                   <div className="flex items-center gap-2">
//                     <select
//                       value={typeStatusFilter}
//                       onChange={(e) => setTypeStatusFilter(e.target.value as any)}
//                       className="px-3 py-2 bg-gray-50 border rounded-lg text-sm flex-1"
//                     >
//                       <option value="all">All Status</option>
//                       <option value="active">Active Only</option>
//                       <option value="inactive">Inactive Only</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Types List */}
//             <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//               {!activeTab ? (
//                 <div className="p-8 text-center">
//                   <Folder className="h-12 w-12 mx-auto text-gray-300" />
//                   <h3 className="mt-2 text-lg font-semibold text-gray-800">Select a Tab</h3>
//                   <p className="text-gray-600 mb-4">Choose a category from the left to view or create master types</p>
//                   <button
//                     onClick={() => setShowNewTabModal(true)}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
//                   >
//                     <FolderPlus size={16} className="inline mr-1" />
//                     Create New Tab
//                   </button>
//                 </div>
//               ) : loadingTypes ? (
//                 <div className="p-8 text-center">
//                   <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
//                   <p className="mt-2 text-sm text-gray-500">Loading master types...</p>
//                 </div>
//               ) : filteredTypes.length === 0 ? (
//                 <div className="p-8 text-center">
//                   <Tag className="h-12 w-12 mx-auto text-gray-300" />
//                   <h3 className="mt-2 text-lg font-semibold text-gray-800">No Master Types</h3>
//                   <p className="text-gray-600 mb-4">
//                     {typeSearchTerm || typeStatusFilter !== "all" 
//                       ? "No matching types found" 
//                       : "No master types created in this tab yet"}
//                   </p>
//                   <button
//                     onClick={() => setShowTypeForm(true)}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm"
//                   >
//                     <Plus size={16} className="inline mr-1" />
//                     Create First Type
//                   </button>
//                 </div>
//               ) : (
//                 <div className="divide-y">
//                   {filteredTypes.map((type) => (
//                     <div
//                       key={type.id}
//                       className={`p-4 ${!type.is_active ? 'opacity-70' : ''}`}
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-start gap-3">
//                           <div className={`p-2 rounded-lg ${
//                             type.is_active 
//                               ? 'bg-purple-50 text-purple-600' 
//                               : 'bg-gray-50 text-gray-400'
//                           }`}>
//                             {getTypeIcon(type.name)}
//                           </div>
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2">
//                               <h3 className="font-semibold text-gray-800 text-sm">
//                                 {type.name}
//                               </h3>
//                               <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-mono rounded">
//                                 {type.code}
//                               </span>
//                               {!type.is_active && (
//                                 <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
//                                   Inactive
//                                 </span>
//                               )}
//                             </div>
                            
//                             <div className="flex items-center gap-3 mt-2">
//                               <span className="text-xs text-gray-500">
//                                 {type.value_count} values
//                               </span>
//                               <span className="text-xs text-gray-400">
//                                 Created {formatDate(type.created_at)}
//                               </span>
//                               {type.tab && type.tab.trim() !== "" && (
//                                 <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
//                                   Tab: {type.tab}
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </div>
                        
//                         {/* Type Actions */}
//                         <div className="flex items-center gap-1">
//                           <button
//                             onClick={() => toggleTypeStatus(type.id, type.is_active)}
//                             disabled={togglingTypeId === type.id}
//                             className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
//                               type.is_active
//                                 ? "bg-green-100 text-green-700 hover:bg-green-200"
//                                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                             }`}
//                           >
//                             {togglingTypeId === type.id ? (
//                               <Loader2 size={12} className="animate-spin" />
//                             ) : type.is_active ? (
//                               <>
//                                 <CheckCircle size={12} />
//                                 Active
//                               </>
//                             ) : (
//                               <>
//                                 <XCircle size={12} />
//                                 Inactive
//                               </>
//                             )}
//                           </button>
                          
//                           <button
//                             onClick={() => handleEditType(type)}
//                             className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
//                             title="Edit"
//                           >
//                             <Edit2 size={14} />
//                           </button>
                          
//                           <button
//                             onClick={() => setShowDeleteTypeConfirm(type.id)}
//                             className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
//                             title="Delete"
//                           >
//                             <Trash2 size={14} />
//                           </button>
                          
//                           <button
//                             onClick={() => {
//                               console.log(`🔍 [DEBUG] Navigating to values for type ${type.id} (${type.name})`);
//                               router.push(`/admin/masters/${type.id}`);
//                             }}
//                             disabled={!type.is_active}
//                             className={`p-1.5 rounded ${
//                               type.is_active
//                                 ? "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
//                                 : "text-gray-300 cursor-not-allowed"
//                             }`}
//                             title="Manage Values"
//                           >
//                             <ChevronRight size={14} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* New Tab Modal */}
//       {showNewTabModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//             <div className="p-4 border-b">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <FolderPlus className="h-5 w-5 text-blue-600" />
//                   <h2 className="font-bold text-gray-800">Create New Tab</h2>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setShowNewTabModal(false);
//                     setNewTabName("");
//                   }}
//                   className="p-1 hover:bg-gray-100 rounded"
//                 >
//                   <X className="h-4 w-4 text-gray-400" />
//                 </button>
//               </div>
//             </div>
            
//             <div className="p-4">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Tab Name *
//                 </label>
//                 <input
//                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder="e.g., Property Management"
//                   value={newTabName}
//                   onChange={(e) => setNewTabName(e.target.value)}
//                   autoFocus
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Note: Tab names must be unique.
//                 </p>
//               </div>
              
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => {
//                     setShowNewTabModal(false);
//                     setNewTabName("");
//                   }}
//                   className="flex-1 px-3 py-2 border text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleCreateTab}
//                   disabled={!newTabName.trim()}
//                   className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm ${
//                     !newTabName.trim()
//                       ? "bg-gray-300 text-gray-500"
//                       : "bg-blue-600 hover:bg-blue-700 text-white"
//                   }`}
//                 >
//                   Create Tab
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Tab Modal */}
//       {showEditTabModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//             <div className="p-4 border-b">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <Edit2 className="h-5 w-5 text-blue-600" />
//                   <h2 className="font-bold text-gray-800">Edit Tab</h2>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setShowEditTabModal(null);
//                     setEditTabName("");
//                   }}
//                   className="p-1 hover:bg-gray-100 rounded"
//                 >
//                   <X className="h-4 w-4 text-gray-400" />
//                 </button>
//               </div>
//               <p className="text-sm text-gray-600 mt-1">
//                 Current: {showEditTabModal.name}
//               </p>
//             </div>
            
//             <div className="p-4">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   New Tab Name *
//                 </label>
//                 <input
//                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter new tab name"
//                   value={editTabName}
//                   onChange={(e) => setEditTabName(e.target.value)}
//                   autoFocus
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Changing the tab name will update all types in this tab.
//                 </p>
//               </div>
              
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => {
//                     setShowEditTabModal(null);
//                     setEditTabName("");
//                   }}
//                   className="flex-1 px-3 py-2 border text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleEditTab}
//                   disabled={!editTabName.trim()}
//                   className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm ${
//                     !editTabName.trim()
//                       ? "bg-gray-300 text-gray-500"
//                       : "bg-blue-600 hover:bg-blue-700 text-white"
//                   }`}
//                 >
//                   Update Tab
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Type Form Modal */}
//       {showTypeForm && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//             <div className="p-4 border-b">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   {typeFormData.id ? <Edit2 className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
//                   <h2 className="font-bold text-gray-800">
//                     {typeFormData.id ? "Edit Master Type" : "Create Master Type"}
//                   </h2>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setShowTypeForm(false);
//                     resetTypeForm();
//                   }}
//                   className="p-1 hover:bg-gray-100 rounded"
//                 >
//                   <X className="h-4 w-4 text-gray-400" />
//                 </button>
//               </div>
//               {activeTab && (
//                 <p className="text-sm text-gray-600 mt-1">
//                   Tab: {activeTab}
//                 </p>
//               )}
//             </div>
            
//             <div className="p-4">
//               <div className="space-y-4">
//                 {!typeFormData.id && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Type Code *
//                     </label>
//                     <div className="flex items-center gap-2">
//                       <Key className="h-4 w-4 text-gray-400" />
//                       <input
//                         className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
//                         placeholder="e.g., PROPERTY_TYPE"
//                         value={typeFormData.code}
//                         onChange={(e) => setTypeFormData({...typeFormData, code: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
//                         autoFocus
//                       />
//                     </div>
//                     <p className="text-xs text-gray-500 mt-1">
//                       System identifier (cannot be changed later)
//                     </p>
//                   </div>
//                 )}
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Type Name *
//                   </label>
//                   <input
//                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     placeholder="e.g., Property Types"
//                     value={typeFormData.name}
//                     onChange={(e) => setTypeFormData({...typeFormData, name: e.target.value})}
//                     autoFocus={typeFormData.id !== null}
//                   />
//                 </div>
                
//                 <div className="p-3 bg-gray-50 rounded-lg border">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <span className="text-sm font-medium text-gray-700">Active Status</span>
//                       <p className="text-xs text-gray-500">Only active types are available in forms</p>
//                     </div>
//                     <label className="relative inline-flex items-center cursor-pointer">
//                       <input
//                         type="checkbox"
//                         className="sr-only peer"
//                         checked={typeFormData.is_active}
//                         onChange={(e) => setTypeFormData({...typeFormData, is_active: e.target.checked})}
//                       />
//                       <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
//                     </label>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="flex gap-2 mt-6">
//                 <button
//                   onClick={() => {
//                     setShowTypeForm(false);
//                     resetTypeForm();
//                   }}
//                   className="flex-1 px-3 py-2 border text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleTypeSubmit}
//                   disabled={(!typeFormData.code.trim() && !typeFormData.id) || !typeFormData.name.trim() || submitting || !activeTab}
//                   className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 ${
//                     (!typeFormData.code.trim() && !typeFormData.id) || !typeFormData.name.trim() || submitting || !activeTab
//                       ? "bg-gray-300 text-gray-500"
//                       : "bg-blue-600 hover:bg-blue-700 text-white"
//                   }`}
//                 >
//                   {submitting ? (
//                     <Loader2 size={16} className="animate-spin" />
//                   ) : typeFormData.id ? (
//                     <>
//                       <Save size={16} />
//                       Update
//                     </>
//                   ) : (
//                     <>
//                       <Plus size={16} />
//                       Create
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Type Confirmation Modal */}
//       {showDeleteTypeConfirm && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//             <div className="p-4 border-b">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="h-5 w-5 text-red-600" />
//                 <h2 className="font-bold text-gray-800">Delete Master Type</h2>
//               </div>
//             </div>
            
//             <div className="p-4">
//               <p className="text-gray-700 mb-4 text-sm">
//                 Are you sure you want to delete this master type? This will also delete all values associated with it.
//               </p>
              
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setShowDeleteTypeConfirm(null)}
//                   className="flex-1 px-3 py-2 border text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDeleteType(showDeleteTypeConfirm)}
//                   className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm flex items-center justify-center gap-1"
//                 >
//                   <Trash2 size={16} />
//                   Delete Type
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Tab Confirmation Modal */}
//       {showDeleteTabConfirm && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
//             <div className="p-4 border-b">
//               <div className="flex items-center gap-2">
//                 <AlertCircle className="h-5 w-5 text-red-600" />
//                 <h2 className="font-bold text-gray-800">Delete Tab</h2>
//               </div>
//             </div>
            
//             <div className="p-4">
//               <p className="text-gray-700 mb-2 text-sm">
//                 Are you sure you want to delete the tab <strong>"{showDeleteTabConfirm.name}"</strong>?
//               </p>
              
//               {showDeleteTabConfirm.type_count > 0 && (
//                 <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                   <p className="text-red-700 text-sm">
//                     ⚠️ This tab contains <strong>{showDeleteTabConfirm.type_count} master types</strong>. 
//                     Deleting the tab will also delete all types in this tab.
//                   </p>
//                 </div>
//               )}
              
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setShowDeleteTabConfirm(null)}
//                   className="flex-1 px-3 py-2 border text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteTab}
//                   className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm flex items-center justify-center gap-1"
//                 >
//                   <Trash2 size={16} />
//                   Delete Tab
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// app/admin/masters/page.tsx
import { useState, useEffect } from "react";
import { getMasterTabs } from "@/lib/masterApi";
import MastersClient from "@/components/admin/masters/MastersClient";
import Loading from "@/components/admin/masters/loading";

export default function MasterItemsPage() {
  const [initialTabs, setInitialTabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMasterTabs()
      .then((tabsRes) => {
        if (tabsRes.success && Array.isArray(tabsRes.data)) {
          const apiTabs = tabsRes.data.map((tab: any) => ({
            id: tab.id,
            name: tab.tab_name,
            item_count: tab.item_count || 0,
            created_at: tab.created_at || new Date().toISOString(),
            is_active: tab.isactive || 1
          }));
          setInitialTabs(apiTabs);
        } else {
          setInitialTabs([]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  return <MastersClient initialTabs={initialTabs} />;
}