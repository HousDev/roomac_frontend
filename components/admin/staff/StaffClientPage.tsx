// components/admin/staff/StaffClientPage.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  User,
  Briefcase,
  Shield,
  Car,
  ChefHat,
  Brush,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  deleteStaffDocument,
  createStaffFormData,
  toggleStaffActive,
  StaffMember,
  fetchRoles,
  fetchDepartments,
  exportStaffToExcel,
  getStaffById,
} from "@/lib/staffApi";
import { useRouter, useSearchParams } from "next/navigation";
import StaffTable from "./StaffTable";
import StaffForm from "./StaffForm";
import StaffDetailsPopup from "./StaffDetailsPopup";
import { Download } from "lucide-react";
import MySwal from "@/app/utils/swal"; 

interface StaffClientPageProps {
  initialStaff: StaffMember[];
  searchParams: {
    search?: string;
    role?: string;
  };
}

// Role icon mapping
const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  manager: <Briefcase className="h-4 w-4" />,
  caretaker: <User className="h-4 w-4" />,
  accountant: <Briefcase className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  driver: <Car className="h-4 w-4" />,
  cook: <ChefHat className="h-4 w-4" />,
  housekeeping: <Brush className="h-4 w-4" />,
};

// Helper function to normalize blood group value
const normalizeBloodGroup = (bloodGroup: string): string => {
  if (!bloodGroup || bloodGroup === "not_specified") return "not_specified";
  return bloodGroup.toLowerCase();
};

export default function StaffClientPage({
  initialStaff,
  searchParams: initialSearchParams,
}: StaffClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = useState(
    initialSearchParams.search || "",
  );
  const [roleFilter, setRoleFilter] = useState(
    initialSearchParams.role || "all",
  );
  const [submitting, setSubmitting] = useState(false);

  // Masters data states
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [departments, setDepartments] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    salutation: "mr",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    phone_country_code: "+91",
    whatsapp_number: "",
    is_whatsapp_same: true,
    blood_group: "not_specified",

    // KYC Details
    aadhar_number: "",
    pan_number: "",

    // Job Information
    role: "",
    role_name: "",
    employee_id: "",
    salary: "",
    department: "no-department",
    department_name: "",
    joining_date: new Date().toISOString().split("T")[0],

    // Address Details
    current_address: "",
    permanent_address: "",

    // Emergency Contact
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",

    // Bank Details
    bank_account_holder_name: "",
    bank_account_number: "",
    bank_name: "",
    bank_ifsc_code: "",
    upi_id: "",

    // Documents
    aadhar_document: null as File | null,
    pan_document: null as File | null,
    photo: null as File | null,
    aadhar_document_url: "",
    pan_document_url: "",
    photo_url: "",

    // Status
    is_active: true,
  });

  const [passwordErrors, setPasswordErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validatePassword = (password: string, confirmPassword: string) => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllStaff();
      setStaff(data);
    } catch (error: any) {
      console.error("Error loading staff:", error);
      toast.error("Failed to load staff data");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadMasters = async () => {
      setLoadingMasters(true);
      try {
        const [rolesData, deptsData] = await Promise.all([
          fetchRoles(),
          fetchDepartments(),
        ]);

        setRoles(rolesData);
        setDepartments(deptsData);

        if (rolesData.length > 0 && !formData.role) {
          setFormData((prev) => ({
            ...prev,
            role: rolesData[0].id.toString(),
          }));
        }
      } catch (error) {
        console.error("Failed to load masters:", error);
        toast.error("Failed to load roles and departments");
      } finally {
        setLoadingMasters(false);
      }
    };

    loadMasters();
  }, []);

  const filteredStaff = useMemo(() => {
    let filtered = staff;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name?.toLowerCase().includes(term) ||
          member.email?.toLowerCase().includes(term) ||
          member.phone?.includes(searchTerm) ||
          member.employee_id?.toLowerCase().includes(term),
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((member) => member.role === roleFilter);
    }

    return filtered;
  }, [staff, searchTerm, roleFilter]);

  useEffect(() => {
    if (formData.is_whatsapp_same) {
      setFormData((prev) => ({
        ...prev,
        whatsapp_number: prev.phone,
      }));
    }
  }, [formData.phone, formData.is_whatsapp_same]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (roleFilter !== "all") params.set("role", roleFilter);

    const queryString = params.toString();
    router.push(`/admin/staff${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [searchTerm, roleFilter]);

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return;
      }
      if (!formData.email.trim()) {
        toast.error("Email is required");
        return;
      }
      if (!formData.phone.trim()) {
        toast.error("Phone number is required");
        return;
      }
      if (!formData.role) {
        toast.error("Role is required");
        return;
      }

      if (!editingStaff) {
        const errors = validatePassword(
          formData.password,
          formData.confirmPassword,
        );
        if (Object.keys(errors).length > 0) {
          setPasswordErrors(errors);
          toast.error("Please fix password errors");
          return;
        }
      } else {
        if (formData.password || formData.confirmPassword) {
          const errors = validatePassword(
            formData.password,
            formData.confirmPassword,
          );
          if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            toast.error("Please fix password errors");
            return;
          }
        }
      }

      setSubmitting(true);
      setPasswordErrors({});

      const formDataObj = createStaffFormData({
        ...formData,
        is_whatsapp_same: formData.is_whatsapp_same ? 1 : 0,
        is_active: formData.is_active ? 1 : 0,
        salary: formData.salary ? parseFloat(formData.salary.toString()) : 0,
        password:
          !editingStaff || (editingStaff && formData.password)
            ? formData.password
            : undefined,
      });

      if (editingStaff) {
        const response = await updateStaff(editingStaff.id, formDataObj);
        toast.success("Staff updated successfully");

        // Update editingStaff with the new data from server
        if (response && response.data) {
          setEditingStaff(response.data);
        }
      } else {
        await addStaff(formDataObj);
        toast.success("Staff added successfully");
      }

      setShowDialog(false);
      resetForm();
      await loadStaff();
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err.message || "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

const handleEdit = useCallback(async (member: StaffMember) => {
  try {
    // Add a cache-busting parameter to ensure fresh data
    const freshData = await getStaffById(member.id);
  
    const isWhatsAppSame =
      freshData.whatsapp_number === freshData.phone ||
      !freshData.whatsapp_number;

    // CRITICAL: Ensure document URLs are properly set to null if they don't exist
    setEditingStaff(freshData);
    
    setFormData({
      salutation: freshData.salutation || "mr",
      name: freshData.name || "",
      email: freshData.email || "",
      password: "",
      confirmPassword: "",
      phone: freshData.phone || "",
      whatsapp_number: freshData.whatsapp_number || "",
      is_whatsapp_same: isWhatsAppSame,
      blood_group: normalizeBloodGroup(freshData.blood_group),
      aadhar_number: freshData.aadhar_number || "",
      pan_number: freshData.pan_number || "",
      role: freshData.role?.toString() || "",
      role_name: freshData.role_name || "",
      employee_id: freshData.employee_id || "",
      salary: freshData.salary?.toString() || "0",
      department: freshData.department?.toString() || "no-department",
      department_name: freshData.department_name || "",
      joining_date:
        freshData.joining_date?.slice(0, 10) ||
        new Date().toISOString().split("T")[0],
      current_address: freshData.current_address || "",
      permanent_address: freshData.permanent_address || "",
      emergency_contact_name: freshData.emergency_contact_name || "",
      emergency_contact_phone: freshData.emergency_contact_phone || "",
      emergency_contact_relation: freshData.emergency_contact_relation || "",
      bank_account_holder_name: freshData.bank_account_holder_name || "",
      bank_account_number: freshData.bank_account_number || "",
      bank_name: freshData.bank_name || "",
      bank_ifsc_code: freshData.bank_ifsc_code || "",
      upi_id: freshData.upi_id || "",
      aadhar_document: null,
      pan_document: null,
      photo: null,
      phone_country_code: freshData.phone_country_code || "+91",
      // CRITICAL: Use null, not empty string
      aadhar_document_url: freshData.aadhar_document_url || null,
      pan_document_url: freshData.pan_document_url || null,
      photo_url: freshData.photo_url || null,
      is_active: freshData.is_active === 1 || freshData.is_active === true,
    });
    setPasswordErrors({});
    setShowDialog(true);
  } catch (error) {
    console.error("Error fetching staff data:", error);
    toast.error("Failed to load staff data");
  }
}, []);

const handleDelete = useCallback(
  async (id: number) => {
    // Show SweetAlert confirmation
    const result = await MySwal.fire({
      title: "Delete Staff Member?",
      text: "Are you sure you want to delete this staff member? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteStaff(id);
        
        // Show success message
        MySwal.fire({
          title: "Deleted!",
          text: "Staff member has been deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        
        toast.success("Staff deleted successfully");
        await loadStaff();
      } catch (err: any) {
        // Show error message
        MySwal.fire({
          title: "Error!",
          text: err.message || "Failed to delete staff",
          icon: "error",
          confirmButtonColor: "#C62828",
        });
        toast.error(err.message || "Failed to delete staff");
      }
    }
  },
  [loadStaff],
);

  const handleToggleActive = useCallback(
    async (id: number, isActive: boolean) => {
      try {
        await toggleStaffActive(id, !isActive);
        toast.success(
          `Staff ${!isActive ? "activated" : "deactivated"} successfully`,
        );
        await loadStaff();
      } catch (err: any) {
        console.error("Toggle active error:", err);
        toast.error(err.message || "Failed to update status");
      }
    },
    [loadStaff],
  );

  const handleViewDetails = useCallback((member: StaffMember) => {
    setSelectedStaff(member);
    setShowDetailsPopup(true);
  }, []);

  const handleExport = useCallback(() => {
    try {
      exportStaffToExcel(
        filteredStaff,
        `staff-export-${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      toast.success("Staff data exported successfully");
    } catch (error) {
      toast.error("Failed to export staff data");
      console.error("Export error:", error);
    }
  }, [filteredStaff]);

  const resetForm = useCallback(() => {
    setEditingStaff(null);
    setFormData({
      salutation: "mr",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      phone_country_code: "+91",
      whatsapp_number: "",
      is_whatsapp_same: true,
      blood_group: "not_specified",
      aadhar_number: "",
      pan_number: "",
      role: roles.length > 0 ? roles[0].id.toString() : "",
      role_name: roles.length > 0 ? roles[0].name : "",
      employee_id: "",
      salary: "",
      department: "no-department",
      department_name: "",
      joining_date: new Date().toISOString().split("T")[0],
      current_address: "",
      permanent_address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relation: "",
      bank_account_holder_name: "",
      bank_account_number: "",
      bank_name: "",
      bank_ifsc_code: "",
      upi_id: "",
      aadhar_document: null,
      pan_document: null,
      photo: null,
      aadhar_document_url: "",
      pan_document_url: "",
      photo_url: "",
      is_active: true,
    });
    setPasswordErrors({});
  }, [roles]);

  const handleFileUpload = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      documentType: "aadhar_document" | "pan_document" | "photo",
    ) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File size should be less than 5MB");
          return;
        }

        const validTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "application/pdf",
        ];
        if (!validTypes.includes(file.type)) {
          toast.error("Only JPEG, PNG, and PDF files are allowed");
          return;
        }

        setFormData((prev) => ({
          ...prev,
          [documentType]: file,
          [`${documentType}_url`]: URL.createObjectURL(file),
        }));
        toast.success(
          `${documentType.replace("_", " ")} uploaded successfully`,
        );
      }
    },
    [],
  );

// In StaffClientPage.tsx - update handleRemoveDocument

const handleRemoveDocument = useCallback(
  async (documentType: "aadhar_document" | "pan_document" | "photo") => {
    try {

      if (editingStaff && formData[`${documentType}_url`]) {
        const loadingToast = toast.loading(
          `Removing ${documentType.replace("_", " ")}...`,
        );

        // Call API to delete document from server
        const response = await deleteStaffDocument(
          editingStaff.id,
          documentType,
        );

        if (response && response.success) {
          // Get the updated staff data from response
          const updatedStaffData = response.data;


          // Update form data with the new document URLs from server
          setFormData((prev) => {
            const newState = {
              ...prev,
              [documentType]: null,
              [`${documentType}_url`]: null,
              // Update all document URLs from the server response
              aadhar_document_url: updatedStaffData.aadhar_document_url || null,
              pan_document_url: updatedStaffData.pan_document_url || null,
              photo_url: updatedStaffData.photo_url || null,
            };

            return newState;
          });

          // CRITICAL: Update editingStaff with the new data from server
          setEditingStaff((prev) => {
            if (!prev) return updatedStaffData;
            return {
              ...prev,
              ...updatedStaffData,
              // Ensure document URLs are explicitly set to null if they don't exist
              aadhar_document_url: updatedStaffData.aadhar_document_url || null,
              pan_document_url: updatedStaffData.pan_document_url || null,
              photo_url: updatedStaffData.photo_url || null,
            };
          });

          toast.dismiss(loadingToast);
          toast.success(
            `${documentType.replace("_", " ")} removed successfully`,
          );

          // Optionally refresh the staff list in the background
          getAllStaff().then(updatedList => {
            setStaff(updatedList);
          }).catch(err => {
            console.error("Error refreshing staff list:", err);
          });
        }
      }
    } catch (error: any) {
      console.error("Error removing document:", error);
      toast.error(
        error.message || `Failed to remove ${documentType.replace("_", " ")}`,
      );
    }
  },
  [editingStaff, formData], // Remove formData from dependencies if it causes issues
);

  const getRoleBadgeColor = useCallback((role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "caretaker":
        return "bg-green-100 text-green-800 border-green-200";
      case "accountant":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "security":
        return "bg-red-100 text-red-800 border-red-200";
      case "driver":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "cook":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "housekeeping":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  const formatSalary = useCallback((salary: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  if (loading && staff.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-2 -mt-9">
      <div className="flex flex-row justify-end items-end gap-4 mb-8 sticky top-20 z-10 md:pt-4">
  <Button
    variant="outline"
    onClick={handleExport}
    className="w-28 h-9 text-sm bg-gradient-to-r from-blue-900 to-blue-800 text-white"
    disabled={staff.length === 0}
  >
    <Download className="mr-2 h-4 w-4 text-white" />
    Export
  </Button>
  <Dialog
    open={showDialog}
    onOpenChange={(open) => {
      setShowDialog(open);
      if (!open) {
        resetForm();
      }
    }}
  >
    <DialogTrigger asChild>
      <Button className="w-28 h-9 text-sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Staff
      </Button>
    </DialogTrigger>

    <DialogContent className="max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-6xl w-[95vw] sm:w-full max-h-[95vh] sm:max-h-[97vh] overflow-hidden p-0 rounded-lg sm:rounded-xl">
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between rounded-t-lg">
        <div>
          <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
            {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
          </h2>
          <p className="text-[10px] sm:text-xs md:text-sm text-blue-100">
            Fill in the details below to {editingStaff ? "update" : "add"}{" "}
            staff information
          </p>
        </div>

        <DialogClose asChild>
          <button className="p-1 sm:p-1.5 md:p-2 rounded-full hover:bg-white/20 transition">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </DialogClose>
      </div>

      <div className="p-3 sm:p-4 md:p-1 overflow-y-auto max-h-[70vh] sm:max-h-[65vh] md:max-h-[59vh]">
        <StaffForm
          formData={formData}
          setFormData={setFormData}
          editingStaff={editingStaff}
          handleFileUpload={handleFileUpload}
          handleRemoveDocument={handleRemoveDocument}
          roles={roles}
          departments={departments}
          loadingMasters={loadingMasters}
          passwordErrors={passwordErrors}
        />
      </div>

      <div className="flex justify-end gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 pt-2 sm:pt-3 md:pt-4 border-t bg-gray-50">
        <Button
          variant="outline"
          onClick={() => {
            setShowDialog(false);
            resetForm();
          }}
          disabled={submitting}
          className="h-9 px-4 text-sm"
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          className="min-w-[100px] h-9 px-4 text-sm bg-blue-600 hover:bg-blue-700"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editingStaff ? "Updating..." : "Adding..."}
            </>
          ) : editingStaff ? (
            "Update"
          ) : (
            "Add"
          )}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</div>

      <CardContent className="px-0 md:px-0">
        <StaffTable
          staff={filteredStaff}
          loading={loading}
          roleIcons={roleIcons}
          getRoleBadgeColor={getRoleBadgeColor}
          formatSalary={formatSalary}
          formatDate={formatDate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onViewDetails={handleViewDetails}
        />
      </CardContent>

      <StaffDetailsPopup
        staff={selectedStaff}
        open={showDetailsPopup}
        onOpenChange={setShowDetailsPopup}
        onEdit={handleEdit}
        formatSalary={formatSalary}
        formatDate={formatDate}
        getRoleBadgeColor={getRoleBadgeColor}
        roleIcons={roleIcons}
      />
    </div>
  );
}
