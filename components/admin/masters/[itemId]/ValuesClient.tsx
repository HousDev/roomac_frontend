// components/admin/masters/[itemId]/ValuesClient.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  createMasterValue,
  updateMasterValue,
  deleteMasterValue,
} from "@/lib/masterApi";
import Header from "./Header";
import StatsCards from "./StatsCards";
import ValueList from "./ValueList";
import ValueFormModal from "./ValueFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface MasterItem {
  id: number;
  tab_id: number;
  name: string;
  isactive: number;
  created_at: string;
  tab_name?: string;
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
    name: "",
    isactive: 1,
  });

  // Handle value submit
  const handleValueSubmit = useCallback(async () => {
    if (!valueFormData.name.trim()) {
      alert("Please enter a value");
      return;
    }

    setSubmitting(true);
    try {
      if (valueFormData.id) {
        // Update existing value
        const res = await updateMasterValue(valueFormData.id, {
          name: valueFormData.name.trim(),
          isactive: valueFormData.isactive,
        });
        
        if (res.success) {
          // Update local state immediately
          setValues(prev => prev.map(val => 
            val.id === valueFormData.id ? { 
              ...val, 
              name: valueFormData.name.trim(),
              isactive: valueFormData.isactive,
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
          master_item_id: masterItem.id,
          name: valueFormData.name.trim(),
          isactive: valueFormData.isactive,
        });
        
        if (res.success && res.data) {
          // Add to local state immediately with API response
          const newValue = {
            id: res.data.id,
            master_item_id: masterItem.id,
            name: valueFormData.name.trim(),
            isactive: valueFormData.isactive,
            created_at: new Date().toISOString(),
          };
          
          setValues(prev => [...prev, newValue]);
          setShowValueForm(false);
          resetValueForm();
        } else if (res.success) {
          // Backend returns success but no data - create a temporary object
          const newValue = {
            id: Date.now(), // Temporary ID
            master_item_id: masterItem.id,
            name: valueFormData.name.trim(),
            isactive: valueFormData.isactive,
            created_at: new Date().toISOString(),
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
  }, [valueFormData, masterItem.id]);

  // Toggle value status
  const toggleValueStatus = useCallback(async (id: number, current: number) => {
    setTogglingValueId(id);
    try {
      const newStatus = current === 1 ? 0 : 1;
      const value = values.find(v => v.id === id);
      if (!value) return;

      const res = await updateMasterValue(id, {
        name: value.name,
        isactive: newStatus
      });
      
      if (res.success) {
        // Update local state immediately
        setValues(prev => prev.map(val => 
          val.id === id ? { 
            ...val, 
            isactive: newStatus,
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
  }, [values]);

  // Handle delete value
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

  // Filtered values based on search and filter
  const filteredValues = useMemo(() => 
    values.filter(val => {
      const matchesSearch = searchTerm === "" || 
        val.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && val.isactive === 1) ||
        (statusFilter === "inactive" && val.isactive === 0);
      
      return matchesSearch && matchesStatus;
    }), [values, searchTerm, statusFilter]
  );

  // Statistics
  const stats = useMemo(() => ({
    totalValues: values.length,
    activeValues: values.filter(v => v.isactive === 1).length,
  }), [values]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        masterItem={masterItem}
        loading={loading}
        onBack={() => router.push("/admin/masters")}
        onRefresh={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 500);
        }}
        onNewValue={() => setShowValueForm(true)}
      />

      <div className="max-w-8xl mx-auto p-4 md:p-6">
        {/* <StatsCards 
          masterItem={masterItem}
          totalValues={stats.totalValues}
          activeValues={stats.activeValues}
        /> */}

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
          masterItem={masterItem}
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