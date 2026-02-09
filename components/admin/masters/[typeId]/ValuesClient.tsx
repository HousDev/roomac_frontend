"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  createMasterValue,
  updateMasterValue,
  deleteMasterValue,
  toggleMasterValueStatus,
} from "@/lib/masterApi";
import Header from "./Header";
import StatsCards from "./StatsCards";
import ValueList from "./ValueList";
import ValueFormModal from "./ValueFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface MasterType {
  id: number;
  code: string;
  name: string;
  tab: string | null;
  is_active: boolean;
  created_at: string;
  value_count: number;
}

interface MasterValue {
  id: number;
  value: string;
  is_active: boolean;
  created_at: string;
  master_type_id: number;
}

interface ValuesClientProps {
  masterType: MasterType;
  initialValues: MasterValue[];
}

export default function ValuesClient({ masterType, initialValues }: ValuesClientProps) {
  const router = useRouter();
  
  // State for values
  const [values, setValues] = useState<MasterValue[]>(initialValues);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingValueId, setTogglingValueId] = useState<number | null>(null);
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  
  // Modal states
  const [showValueForm, setShowValueForm] = useState(false);
  const [showDeleteValueConfirm, setShowDeleteValueConfirm] = useState<number | null>(null);
  
  // Form data state
  const [valueFormData, setValueFormData] = useState({
    id: null as number | null,
    value: "",
    is_active: true,
  });

// Updated handleValueSubmit function
const handleValueSubmit = useCallback(async () => {
  if (!valueFormData.value.trim()) {
    alert("Please enter a value");
    return;
  }

  setSubmitting(true);
  try {
    if (valueFormData.id) {

        // In ValuesClient.tsx, before the API call, add:
console.log("Sending update data:", {
  id: valueFormData.id,
  data: {
    value: valueFormData.value.trim(),
    is_active: valueFormData.is_active,
    is_active_type: typeof valueFormData.is_active
  }
});
      // Update existing value
      const res = await updateMasterValue(valueFormData.id, {
        value: valueFormData.value.trim(),
        is_active: valueFormData.is_active,
      });
      
      console.log("Update response:", res);
      
      if (res.success) {
        // Update local state immediately
        setValues(prev => prev.map(val => 
          val.id === valueFormData.id ? { 
            ...val, 
            value: valueFormData.value.trim(),
            is_active: valueFormData.is_active,
            updated_at: new Date().toISOString() // Add timestamp
          } : val
        ));
        setShowValueForm(false);
        resetValueForm();
      } else {
        alert(res.error || res.message || "Failed to update value");
      }
    } else {
      // Create new value
      const res = await createMasterValue({
        master_type_id: masterType.id,
        value: valueFormData.value.trim(),
        is_active: valueFormData.is_active,
      });
      
      console.log("Create response:", res);
      
      if (res.success && res.data) {
        // Add to local state immediately with API response
        const newValue = {
          id: res.data.id || Date.now(),
          value: valueFormData.value.trim(),
          is_active: valueFormData.is_active,
          created_at: new Date().toISOString(),
          master_type_id: masterType.id,
        };
        
        setValues(prev => [...prev, newValue]);
        setShowValueForm(false);
        resetValueForm();
      } else if (res.success) {
        // Backend returns success but no data - create the object ourselves
        const newValue = {
          id: Date.now(), // Temporary ID
          value: valueFormData.value.trim(),
          is_active: valueFormData.is_active,
          created_at: new Date().toISOString(),
          master_type_id: masterType.id,
        };
        
        setValues(prev => [...prev, newValue]);
        setShowValueForm(false);
        resetValueForm();
      } else {
        alert(res.error || res.message || "Failed to create value");
      }
    }
  } catch (error: any) {
    console.error("Failed to save value:", error);
    alert(`Error: ${error.message || "Failed to save value"}`);
  } finally {
    setSubmitting(false);
  }
}, [valueFormData, masterType.id]);

// Updated toggleValueStatus function
const toggleValueStatus = useCallback(async (id: number, current: boolean) => {
  setTogglingValueId(id);
  try {
    const newStatus = !current;
    const res = await toggleMasterValueStatus(id, newStatus);
    
    console.log("Toggle status response:", res);
    
    if (res.success) {
      // Update local state immediately
      setValues(prev => prev.map(val => 
        val.id === id ? { 
          ...val, 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        } : val
      ));
    } else {
      alert(res.error || res.message || "Failed to toggle status");
    }
  } catch (error: any) {
    console.error("Failed to toggle status:", error);
    alert(`Error: ${error.message || "Failed to toggle status"}`);
  } finally {
    setTogglingValueId(null);
  }
}, []);


  // Handle delete value - FIXED: Update local state immediately
  const handleDeleteValue = useCallback(async (id: number) => {
    setShowDeleteValueConfirm(null);
    try {
      const res = await deleteMasterValue(id);
      if (res.success) {
        // Update local state immediately
        setValues(prev => prev.filter(val => val.id !== id));
      } else {
        alert(res.error || "Failed to delete value");
      }
    } catch (error: any) {
      console.error("Failed to delete value:", error);
      alert(`Error: ${error.message || "Failed to delete value"}`);
    }
  }, []);


  // Reset value form
  const resetValueForm = useCallback(() => {
    setValueFormData({
      id: null,
      value: "",
      is_active: true,
    });
  }, []);

  // Handle edit value
  const handleEditValue = useCallback((value: MasterValue) => {
    setValueFormData({
      id: value.id,
      value: value.value,
      is_active: value.is_active,
    });
    setShowValueForm(true);
  }, []);

  // Filtered values based on search and filter
  const filteredValues = useMemo(() => 
    values.filter(val => {
      const matchesSearch = searchTerm === "" || 
        val.value.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && val.is_active) ||
        (statusFilter === "inactive" && !val.is_active);
      
      return matchesSearch && matchesStatus;
    }), [values, searchTerm, statusFilter]
  );

  // Statistics
  const stats = useMemo(() => ({
    totalValues: values.length,
    activeValues: values.filter(v => v.is_active).length,
  }), [values]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        masterType={masterType}
        loading={loading}
        onBack={() => router.push("/admin/masters")}
        onRefresh={() => {
          // Optional: You can implement a refresh function if needed
          setLoading(true);
          setTimeout(() => setLoading(false), 500);
        }}
        onNewValue={() => setShowValueForm(true)}
      />

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <StatsCards 
          masterType={masterType}
          totalValues={stats.totalValues}
          activeValues={stats.activeValues}
        />

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
          onDeleteValue={setShowDeleteValueConfirm}
          onNewValue={() => setShowValueForm(true)}
        />

        <ValueFormModal
          isOpen={showValueForm}
          formData={valueFormData}
          masterType={masterType}
          submitting={submitting}
          onFormDataChange={setValueFormData}
          onSubmit={handleValueSubmit}
          onClose={() => {
            setShowValueForm(false);
            resetValueForm();
          }}
        />

        <DeleteConfirmModal
          isOpen={!!showDeleteValueConfirm}
          onConfirm={() => handleDeleteValue(showDeleteValueConfirm!)}
          onClose={() => setShowDeleteValueConfirm(null)}
        />
      </div>
    </div>
  );
}