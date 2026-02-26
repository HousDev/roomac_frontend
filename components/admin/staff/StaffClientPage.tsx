// app/admin/staff/StaffClientPage.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  User,
  Hash,
  IndianRupee,
  Calendar,
  Search,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Droplets,
  AlertCircle,
  FileText,
  CreditCard,
  Home,
  Building,
  Upload,
  Briefcase,
  Shield,
  Car,
  ChefHat,
  Brush,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  createStaffFormData,
  toggleStaffActive,
  StaffMember
} from "@/lib/staffApi";
import { useRouter, useSearchParams } from "next/navigation";
import StaffTable from "./StaffTable";
import StaffFilters from "./StaffFilters";
import StaffForm from "./StaffForm";

// Types for initial props
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
  accountant: <FileText className="h-4 w-4" />,
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
  const [searchTerm, setSearchTerm] = useState(initialSearchParams.search || "");
  const [roleFilter, setRoleFilter] = useState(initialSearchParams.role || "all");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    salutation: "mr",
    name: "",
    email: "",
    phone: "",
    whatsapp_number: "",
    is_whatsapp_same: true,
    blood_group: "not_specified",
    
    // KYC Details
    aadhar_number: "",
    pan_number: "",
    
    // Job Information
    role: "caretaker",
    employee_id: "",
    salary: "",
    department: "",
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

  // Load staff data with filters
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

  // Filter staff based on search and role
  const filteredStaff = useMemo(() => {
    let filtered = staff;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(term) ||
        member.email?.toLowerCase().includes(term) ||
        member.phone?.includes(searchTerm) ||
        member.employee_id?.toLowerCase().includes(term)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    return filtered;
  }, [staff, searchTerm, roleFilter]);

  // WhatsApp toggle logic
  useEffect(() => {
    if (formData.is_whatsapp_same) {
      setFormData(prev => ({
        ...prev,
        whatsapp_number: prev.phone,
      }));
    }
  }, [formData.phone, formData.is_whatsapp_same]);

  // Handle filter changes with URL updates
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (roleFilter !== 'all') params.set('role', roleFilter);
    
    const queryString = params.toString();
    router.push(`/admin/staff${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [searchTerm, roleFilter]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Validation
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

      setSubmitting(true);

      // Create FormData
      const formDataObj = createStaffFormData({
        ...formData,
        is_whatsapp_same: formData.is_whatsapp_same ? 1 : 0,
        is_active: formData.is_active ? 1 : 0,
        salary: formData.salary ? parseFloat(formData.salary.toString()) : 0,
      });

      if (editingStaff) {
        await updateStaff(editingStaff.id, formDataObj);
        toast.success("Staff updated successfully");
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

  // Handle edit staff - FIXED for WhatsApp toggle and blood group
  const handleEdit = useCallback((member: StaffMember) => {
    // Check if WhatsApp number is different from phone number
    const isWhatsAppSame = member.whatsapp_number === member.phone || !member.whatsapp_number;
    
    setEditingStaff(member);
    setFormData({
      salutation: member.salutation || "mr",
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      whatsapp_number: member.whatsapp_number || "",
      is_whatsapp_same: isWhatsAppSame,
      blood_group: normalizeBloodGroup(member.blood_group),
      aadhar_number: member.aadhar_number || "",
      pan_number: member.pan_number || "",
      role: member.role || "caretaker",
      employee_id: member.employee_id || "",
      salary: member.salary?.toString() || "0",
      department: member.department || "",
      joining_date: member.joining_date?.slice(0, 10) || new Date().toISOString().split("T")[0],
      current_address: member.current_address || "",
      permanent_address: member.permanent_address || "",
      emergency_contact_name: member.emergency_contact_name || "",
      emergency_contact_phone: member.emergency_contact_phone || "",
      emergency_contact_relation: member.emergency_contact_relation || "",
      bank_account_holder_name: member.bank_account_holder_name || "",
      bank_account_number: member.bank_account_number || "",
      bank_name: member.bank_name || "",
      bank_ifsc_code: member.bank_ifsc_code || "",
      upi_id: member.upi_id || "",
      aadhar_document: null,
      pan_document: null,
      photo: null,
      aadhar_document_url: member.aadhar_document_url || "",
      pan_document_url: member.pan_document_url || "",
      photo_url: member.photo_url || "",
      is_active: member.is_active || true,
    });
    setShowDialog(true);
  }, []);

  // Handle delete staff
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteStaff(id);
      toast.success("Staff deleted successfully");
      await loadStaff();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete staff");
    }
  }, [loadStaff]);

  // Handle toggle active status
  const handleToggleActive = useCallback(async (id: number, isActive: boolean) => {
    try {
      await toggleStaffActive(id, !isActive);
      toast.success(`Staff ${!isActive ? "activated" : "deactivated"} successfully`);
      await loadStaff();
    } catch (err: any) {
      console.error("Toggle active error:", err);
      toast.error(err.message || "Failed to update status");
    }
  }, [loadStaff]);

  // Reset form
  const resetForm = useCallback(() => {
    setEditingStaff(null);
    setFormData({
      salutation: "mr",
      name: "",
      email: "",
      phone: "",
      whatsapp_number: "",
      is_whatsapp_same: true,
      blood_group: "not_specified",
      aadhar_number: "",
      pan_number: "",
      role: "caretaker",
      employee_id: "",
      salary: "",
      department: "",
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
  }, []);

  // Handle file upload - FIXED to preserve URLs
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, documentType: 'aadhar_document' | 'pan_document' | 'photo') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPEG, PNG, and PDF files are allowed");
        return;
      }

      setFormData(prev => ({
        ...prev,
        [documentType]: file,
        // Preserve existing URL or create new one
        [`${documentType}_url`]: prev[`${documentType}_url`] || URL.createObjectURL(file)
      }));
      toast.success(`${documentType.replace('_', ' ').replace('document', 'document ')} uploaded successfully`);
    }
  }, []);

  // Handle remove document - FIXED to not clear URLs
  const handleRemoveDocument = useCallback((documentType: 'aadhar_document' | 'pan_document' | 'photo') => {
    setFormData(prev => ({
      ...prev,
      [documentType]: null,
      // Keep the URL for display until form is submitted
    }));
    toast.success(`${documentType.replace('_', ' ')} removed`);
  }, []);

  // Role badge color
  const getRoleBadgeColor = useCallback((role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800 border-purple-200";
      case "manager": return "bg-blue-100 text-blue-800 border-blue-200";
      case "caretaker": return "bg-green-100 text-green-800 border-green-200";
      case "accountant": return "bg-orange-100 text-orange-800 border-orange-200";
      case "security": return "bg-red-100 text-red-800 border-red-200";
      case "driver": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "cook": return "bg-amber-100 text-amber-800 border-amber-200";
      case "housekeeping": return "bg-teal-100 text-teal-800 border-teal-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  // Format salary
  const formatSalary = useCallback((salary: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  // Loading state
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
      <div className="flex flex-col sm:flex-row justify-end items-end sm:items- gap-4 mb-8 sticky top-20 z-10 ">
        {/* <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Staff Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage caretakers, managers, and staff members
          </p>
        </div> */}

      <Dialog
  open={showDialog}
  onOpenChange={(open) => {
    setShowDialog(open);
    if (!open) resetForm();
  }}
>
  <DialogTrigger asChild>
    <Button className="w-24 sm:w-28 md:w-30 h-8 sm:h-9 text-xs sm:text-sm mt-3">
      <Plus className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span className="hidden xs:inline">Add</span> Staff
    </Button>
  </DialogTrigger>

  <DialogContent className="max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-6xl w-[95vw] sm:w-full max-h-[95vh] sm:max-h-[97vh] overflow-hidden p-0 rounded-lg sm:rounded-xl">
    {/* Gradient Header - Compact on mobile */}
    <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between rounded-t-lg">
      <div>
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
          {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
        </h2>
        <p className="text-[10px] sm:text-xs md:text-sm text-blue-100">
          Fill in the details below to {editingStaff ? "update" : "add"} staff information
        </p>
      </div>

      <DialogClose asChild>
        <button className="p-1 sm:p-1.5 md:p-2 rounded-full hover:bg-white/20 transition">
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </DialogClose>
    </div>

    {/* Scrollable Body - Compact */}
    <div className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[70vh] sm:max-h-[65vh] md:max-h-[70vh]">
      <StaffForm
        formData={formData}
        setFormData={setFormData}
        editingStaff={editingStaff}
        handleFileUpload={handleFileUpload}
        handleRemoveDocument={handleRemoveDocument}
      />
    </div>

    {/* Footer - Compact */}
    <div className="flex justify-end gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 pt-2 sm:pt-3 md:pt-4 border-t bg-gray-50">
      <Button
        variant="outline"
        onClick={() => {
          setShowDialog(false);
          resetForm();
        }}
        disabled={submitting}
        className="h-8 sm:h-9 md:h-10 px-3 sm:px-4 text-xs sm:text-sm"
      >
        Cancel
      </Button>

      <Button 
        onClick={handleSubmit} 
        className="min-w-[80px] sm:min-w-[100px] md:min-w-[120px] h-8 sm:h-9 md:h-10 px-3 sm:px-4 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            <span className="hidden xs:inline">{editingStaff ? "Updating..." : "Adding..."}</span>
          </>
        ) : editingStaff ? "Update" : "Add"}
      </Button>
    </div>
  </DialogContent>
</Dialog>
      </div>

      
        {/* <CardHeader className="pb-3 -mt-9 px-0 md:px-0 sticky top-28 z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ">
           <div>
  <CardTitle className="text-lg sm:text-xl">
    All Staff Members
  </CardTitle>

  <p className="text-xs sm:text-sm text-gray-500 mt-1">
    Showing {filteredStaff.length} of {staff.length} staff member
    {staff.length !== 1 ? 's' : ''}
  </p>
</div>

            <StaffFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
            />
          </div>
        </CardHeader> */}
        
        <CardContent className="px-0 md:px-0 ">
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
          />
        </CardContent>
    
    </div>
  );
}