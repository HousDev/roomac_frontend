// components/admin/masters/[itemId]/ValuesClient.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {toast} from "sonner";
import {
  createMasterValue,
  updateMasterValue,
  deleteMasterValue,
  exportValuesToExcel,
  importValuesFromExcel,
  bulkUpdateValuesStatus,
  bulkDeleteValues,
  getMasterValues
} from "@/lib/masterApi";
import Header from "./Header";
import ValueList from "./ValueList";
import ValueFormModal from "./ValueFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import BulkActionBar from "./BulkActionBar";

interface MasterItem {
  id: number;
  name: string;
  tab_name: string;
  isactive: number;
  created_at: string;
  value_count: number;
}

interface MasterValue {
  id: number;
  master_item_id: number;
  name: string;
  isactive: number;
  created_at: string;
}

interface ValuesClientProps {
  masterItem: MasterItem;
  initialValues: MasterValue[];
}

export default function ValuesClient({ masterItem, initialValues }: ValuesClientProps) {
  const router = useRouter();
  
  // ========== STATE DECLARATIONS ==========
  
  // State for values
  const [values, setValues] = useState<MasterValue[]>(initialValues);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingValueId, setTogglingValueId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  // Bulk selection state
  const [selectedValues, setSelectedValues] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<"activate" | "deactivate" | "delete" | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  
  // Modal states
  const [showValueForm, setShowValueForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  
  // Form data state
  const [valueFormData, setValueFormData] = useState({
    id: null as number | null,
    name: "",
    isactive: 1,
  });

  // ========== MEMOIZED VALUES ==========
  
  // Filtered values based on search and filter
  const filteredValues = useMemo(() => {
    return values.filter(val => {
      const matchesSearch = searchTerm === "" || 
        val.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && val.isactive === 1) ||
        (statusFilter === "inactive" && val.isactive === 0);
      
      return matchesSearch && matchesStatus;
    });
  }, [values, searchTerm, statusFilter]);

  // ========== HELPER FUNCTIONS ==========

  // Refresh values from API
  const refreshValues = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMasterValues(masterItem.id);
      if (response?.success && Array.isArray(response.data)) {
        setValues(response.data);
        toast.success("Values refreshed successfully");
      }
    } catch (error) {
      console.error("Failed to refresh values:", error);
      toast.error("Failed to refresh values");
    } finally {
      setLoading(false);
    }
  }, [masterItem.id]);

  // ========== CALLBACK FUNCTIONS ==========

  // Handle value submit
  const handleValueSubmit = useCallback(async () => {
    if (!valueFormData.name.trim()) {
      toast.error("Please enter a value");
      return;
    }

    setSubmitting(true);
    try {
      let response;
      
      if (valueFormData.id) {
        response = await updateMasterValue(valueFormData.id, {
          name: valueFormData.name.trim(),
          isactive: valueFormData.isactive,
        });
      } else {
        response = await createMasterValue({
          master_item_id: masterItem.id,
          name: valueFormData.name.trim(),
          isactive: valueFormData.isactive,
        });
      }
      
      if (response?.success) {
        if (valueFormData.id) {
          setValues(prev => prev.map(val => 
            val.id === valueFormData.id ? { 
              ...val, 
              name: valueFormData.name.trim(),
              isactive: valueFormData.isactive,
            } : val
          ));
          toast.success("Value updated successfully");
        } else {
          if (response.data) {
            setValues(prev => [...prev, response.data]);
          }
          toast.success("Value created successfully");
        }
        
        setShowValueForm(false);
        resetValueForm();
      } else {
        toast.error(response?.error || response?.message || "Failed to save value");
      }
    } catch (error: any) {
      console.error("Failed to save value:", error);
      toast.error(`Error: ${error?.message || "Failed to save value"}`);
    } finally {
      setSubmitting(false);
    }
  }, [valueFormData, masterItem.id]);

  // Handle export to Excel
  const handleExport = useCallback(async () => {
    try {
      await exportValuesToExcel(masterItem.id, masterItem.name);
      toast.success("Values exported successfully");
    } catch (error: any) {
      console.error("Export failed:", error);
      toast.error(error.message || "Failed to export values");
    }
  }, [masterItem]);

  // Handle import from Excel
  const handleImportClick = useCallback(() => {
    if (!fileInput) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls,.csv';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setImporting(true);
          try {
            const result = await importValuesFromExcel(file, masterItem.id);
            if (result.success) {
              if (result.errors.length > 0) {
                toast.success(`Import completed: ${result.created} values created, ${result.errors.length} errors`);
                console.log('Import errors:', result.errors);
              } else {
                toast.success(`Successfully imported ${result.created} values`);
              }
              await refreshValues();
            }
          } catch (error: any) {
            console.error("Import failed:", error);
            toast.error(error.message || "Failed to import values");
          } finally {
            setImporting(false);
          }
        }
      };
      setFileInput(input);
      input.click();
    } else {
      fileInput.click();
    }
  }, [fileInput, masterItem.id, refreshValues]);

  // Toggle value status
  const toggleValueStatus = useCallback(async (id: number, current: number) => {
    setTogglingValueId(id);
    try {
      const newStatus = current === 1 ? 0 : 1;
      const value = values.find(v => v.id === id);
      if (!value) return;

      const response = await updateMasterValue(id, {
        name: value.name,
        isactive: newStatus
      });
      
      if (response?.success) {
        setValues(prev => prev.map(val => 
          val.id === id ? { ...val, isactive: newStatus } : val
        ));
        setSelectedValues(prev => prev.filter(vId => vId !== id));
        toast.success(`Value ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response?.error || "Failed to toggle status");
      }
    } catch (error: any) {
      console.error("Failed to toggle status:", error);
      toast.error(`Error: ${error?.message || "Failed to toggle status"}`);
    } finally {
      setTogglingValueId(null);
    }
  }, [values]);

  // Handle delete value
  const handleDeleteValue = useCallback(async (id: number) => {
    setShowDeleteConfirm(null);
    try {
      const response = await deleteMasterValue(id);
      if (response?.success) {
        setValues(prev => prev.filter(val => val.id !== id));
        setSelectedValues(prev => prev.filter(vId => vId !== id));
        toast.success("Value deleted successfully");
      } else {
        toast.error(response?.error || "Failed to delete value");
      }
    } catch (error: any) {
      console.error("Failed to delete value:", error);
      toast.error(`Error: ${error?.message || "Failed to delete value"}`);
    }
  }, []);

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action: "activate" | "deactivate" | "delete") => {
    if (selectedValues.length === 0) return;
    
    setBulkProcessing(true);
    setBulkAction(action);
    
    try {
      if (action === "activate" || action === "deactivate") {
        const newStatus = action === "activate" ? 1 : 0;
        const result = await bulkUpdateValuesStatus(selectedValues, newStatus);
        
        if (result.success) {
          setValues(prev => prev.map(val => 
            selectedValues.includes(val.id) ? { ...val, isactive: newStatus } : val
          ));
          
          if (result.failed > 0) {
            toast.success(`${result.succeeded} values ${action}d, ${result.failed} failed`);
          } else {
            toast.success(`${result.succeeded} values ${action}d successfully`);
          }
        }
      } else if (action === "delete") {
        const result = await bulkDeleteValues(selectedValues);
        
        if (result.success) {
          setValues(prev => prev.filter(val => !selectedValues.includes(val.id)));
          
          if (result.failed > 0) {
            toast.success(`${result.succeeded} values deleted, ${result.failed} failed`);
          } else {
            toast.success(`${result.succeeded} values deleted successfully`);
          }
        }
      }
      
      setSelectedValues([]);
    } catch (error: any) {
      console.error("Bulk action failed:", error);
      toast.error(`Bulk action failed: ${error.message}`);
    } finally {
      setBulkProcessing(false);
      setBulkAction(null);
    }
  }, [selectedValues]);

  // Reset value form
  const resetValueForm = useCallback(() => {
    setValueFormData({
      id: null,
      name: "",
      isactive: 1,
    });
  }, []);

  // Handle edit value
  const handleEditValue = useCallback((value: MasterValue) => {
    setValueFormData({
      id: value.id,
      name: value.name,
      isactive: value.isactive,
    });
    setShowValueForm(true);
  }, []);

  // Handle new value
  const handleNewValue = useCallback(() => {
    resetValueForm();
    setShowValueForm(true);
  }, [resetValueForm]);

  // Toggle selection of all values
  const toggleSelectAll = useCallback(() => {
    if (selectedValues.length === filteredValues.length) {
      setSelectedValues([]);
    } else {
      setSelectedValues(filteredValues.map(v => v.id));
    }
  }, [filteredValues, selectedValues]);

  // Toggle selection of a single value
  const toggleSelectValue = useCallback((id: number) => {
    setSelectedValues(prev => 
      prev.includes(id) 
        ? prev.filter(vId => vId !== id)
        : [...prev, id]
    );
  }, []);

  // ========== RENDER ==========
  
  return (
    <div className=" bg-gray-50">
      <Header
        masterItem={masterItem}
        loading={loading || importing}
        onBack={() => router.push("/admin/masters")}
        onRefresh={refreshValues}
        onNewValue={handleNewValue}
        onExport={handleExport}
        onImport={handleImportClick}
      />

      {/* Bulk Action Bar - Below Header */}
      {selectedValues.length > 0 && (
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <div className="max-w-8xl mx-auto px-4 py-3">
            <BulkActionBar
              selectedCount={selectedValues.length}
              onActivate={() => handleBulkAction("activate")}
              onDeactivate={() => handleBulkAction("deactivate")}
              onDelete={() => handleBulkAction("delete")}
              processing={bulkProcessing}
              currentAction={bulkAction}
              isInline={true}
            />
          </div>
        </div>
      )}

      <div className="max-w-8xl mx-auto p-4 md:p-6">
        <ValueList
          values={filteredValues}
          loading={loading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          togglingValueId={togglingValueId}
          onEditValue={handleEditValue}
          onToggleStatus={toggleValueStatus}
          onDeleteValue={setShowDeleteConfirm}
          onNewValue={handleNewValue}
          selectedValues={selectedValues}
          onToggleSelect={toggleSelectValue}
          onToggleSelectAll={toggleSelectAll}
        />

        <DeleteConfirmModal
          isOpen={!!showDeleteConfirm}
          onConfirm={() => handleDeleteValue(showDeleteConfirm!)}
          onClose={() => setShowDeleteConfirm(null)}
        />

        <ValueFormModal
          isOpen={showValueForm}
          formData={valueFormData}
          masterItem={masterItem}
          submitting={submitting}
          onFormDataChange={setValueFormData}
          onSubmit={handleValueSubmit}
          onClose={() => {
            setShowValueForm(false);
            resetValueForm();
          }}
        />
      </div>
    </div>
  );
}