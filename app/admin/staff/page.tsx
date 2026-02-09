// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Switch } from "@/components/ui/switch";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Plus, Edit, Trash2, Phone, Mail, User, Hash, IndianRupee, Calendar,
//   Search, MapPin, AlertCircle, FileText, CreditCard, Home, Building,
//   Upload, Briefcase, Droplets, MessageSquare, Eye, Download, Loader2,
//   Shield, Car, ChefHat, Brush 
// } from "lucide-react";
// import { toast } from "sonner";
// import {
//   getAllStaff,
//   addStaff,
//   updateStaff,
//   deleteStaff,
//   createStaffFormData,
//   toggleStaffActive,
//   StaffMember
// } from "@/lib/staffApi";

// // Role icon mapping
// const roleIcons: Record<string, React.ReactNode> = {
//   admin: <Shield className="h-4 w-4" />,
//   manager: <Briefcase className="h-4 w-4" />,
//   caretaker: <User className="h-4 w-4" />,
//   accountant: <FileText className="h-4 w-4" />,
//   security: <Shield className="h-4 w-4" />,
//   driver: <Car className="h-4 w-4" />,
//   cook: <ChefHat className="h-4 w-4" />,
//   housekeeping: <Brush className="h-4 w-4" />,
// };

// export default function StaffPage() {
//   const [staff, setStaff] = useState<StaffMember[]>([]);
//   const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showDialog, setShowDialog] = useState(false);
//   const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [roleFilter, setRoleFilter] = useState("all");
//   const [submitting, setSubmitting] = useState(false);

//   const [formData, setFormData] = useState({
//     // Personal Information
//     salutation: "mr",
//     name: "",
//     email: "",
//     phone: "",
//     whatsapp_number: "",
//     is_whatsapp_same: true,
//     blood_group: "not_specified",
    
//     // KYC Details
//     aadhar_number: "",
//     pan_number: "",
    
//     // Job Information
//     role: "caretaker",
//     employee_id: "",
//     salary: "",
//     department: "",
//     joining_date: new Date().toISOString().split("T")[0],
    
//     // Address Details
//     current_address: "",
//     permanent_address: "",
    
//     // Emergency Contact
//     emergency_contact_name: "",
//     emergency_contact_phone: "",
//     emergency_contact_relation: "",
    
//     // Bank Details
//     bank_account_holder_name: "",
//     bank_account_number: "",
//     bank_name: "",
//     bank_ifsc_code: "",
//     upi_id: "",
    
//     // Documents
//     aadhar_document: null as File | null,
//     pan_document: null as File | null,
//     photo: null as File | null,
//     aadhar_document_url: "",
//     pan_document_url: "",
//     photo_url: "",
    
//     // Status
//     is_active: true,
//   });

//   // Load staff data
//   const loadStaff = useCallback(async () => {
//     try {
//       setLoading(true);
//       const data = await getAllStaff();
//       setStaff(data);
//       setFilteredStaff(data);
//     } catch (error: any) {
//       console.error("Error loading staff:", error);
//       toast.error("Failed to load staff data");
//       setStaff([]);
//       setFilteredStaff([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadStaff();
//   }, [loadStaff]);

//   // Filter staff based on search and role
//   useEffect(() => {
//     let filtered = staff;

//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(member =>
//         member.name?.toLowerCase().includes(term) ||
//         member.email?.toLowerCase().includes(term) ||
//         member.phone?.includes(searchTerm) ||
//         member.employee_id?.toLowerCase().includes(term)
//       );
//     }

//     if (roleFilter !== "all") {
//       filtered = filtered.filter(member => member.role === roleFilter);
//     }

//     setFilteredStaff(filtered);
//   }, [searchTerm, roleFilter, staff]);

//   // WhatsApp toggle logic
//   useEffect(() => {
//     if (formData.is_whatsapp_same) {
//       setFormData(prev => ({
//         ...prev,
//         whatsapp_number: prev.phone,
//       }));
//     }
//   }, [formData.phone, formData.is_whatsapp_same]);

//   // Handle form submission
//   const handleSubmit = async () => {
//     try {
//       // Validation
//       if (!formData.name.trim()) {
//         toast.error("Name is required");
//         return;
//       }
//       if (!formData.email.trim()) {
//         toast.error("Email is required");
//         return;
//       }
//       if (!formData.phone.trim()) {
//         toast.error("Phone number is required");
//         return;
//       }

//       setSubmitting(true);

//       // Create FormData
//       const formDataObj = createStaffFormData({
//         ...formData,
//         is_whatsapp_same: formData.is_whatsapp_same ? 1 : 0,
//         is_active: formData.is_active ? 1 : 0,
//         salary: formData.salary ? parseFloat(formData.salary.toString()) : 0,
//       });

//       if (editingStaff) {
//         await updateStaff(editingStaff.id, formDataObj);
//         toast.success("Staff updated successfully");
//       } else {
//         await addStaff(formDataObj);
//         toast.success("Staff added successfully");
//       }

//       setShowDialog(false);
//       resetForm();
//       await loadStaff();
//     } catch (err: any) {
//       console.error("Submit error:", err);
//       toast.error(err.message || "Operation failed. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Handle edit staff
//   const handleEdit = (member: StaffMember) => {
//     setEditingStaff(member);
//     setFormData({
//       salutation: member.salutation || "mr",
//       name: member.name || "",
//       email: member.email || "",
//       phone: member.phone || "",
//       whatsapp_number: member.whatsapp_number || "",
//       is_whatsapp_same: member.is_whatsapp_same || true,
//       blood_group: member.blood_group || "not_specified",
//       aadhar_number: member.aadhar_number || "",
//       pan_number: member.pan_number || "",
//       role: member.role || "caretaker",
//       employee_id: member.employee_id || "",
//       salary: member.salary?.toString() || "0",
//       department: member.department || "",
//       joining_date: member.joining_date?.slice(0, 10) || new Date().toISOString().split("T")[0],
//       current_address: member.current_address || "",
//       permanent_address: member.permanent_address || "",
//       emergency_contact_name: member.emergency_contact_name || "",
//       emergency_contact_phone: member.emergency_contact_phone || "",
//       emergency_contact_relation: member.emergency_contact_relation || "",
//       bank_account_holder_name: member.bank_account_holder_name || "",
//       bank_account_number: member.bank_account_number || "",
//       bank_name: member.bank_name || "",
//       bank_ifsc_code: member.bank_ifsc_code || "",
//       upi_id: member.upi_id || "",
//       aadhar_document: null,
//       pan_document: null,
//       photo: null,
//       aadhar_document_url: member.aadhar_document_url || "",
//       pan_document_url: member.pan_document_url || "",
//       photo_url: member.photo_url || "",
//       is_active: member.is_active || true,
//     });
//     setShowDialog(true);
//   };

//   // Handle delete staff
//   const handleDelete = async (id: number) => {
//     if (!confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) {
//       return;
//     }

//     try {
//       await deleteStaff(id);
//       toast.success("Staff deleted successfully");
//       await loadStaff();
//     } catch (err: any) {
//       toast.error(err.message || "Failed to delete staff");
//     }
//   };

//   // Handle toggle active status
//   const handleToggleActive = async (id: number, isActive: boolean) => {
//     try {
//       await toggleStaffActive(id, !isActive);
//       toast.success(`Staff ${!isActive ? "activated" : "deactivated"} successfully`);
//       await loadStaff();
//     } catch (err: any) {
//       console.error("Toggle active error:", err);
//       toast.error(err.message || "Failed to update status");
//     }
//   };

//   // Reset form
//   const resetForm = () => {
//     setEditingStaff(null);
//     setFormData({
//       salutation: "mr",
//       name: "",
//       email: "",
//       phone: "",
//       whatsapp_number: "",
//       is_whatsapp_same: true,
//       blood_group: "not_specified",
//       aadhar_number: "",
//       pan_number: "",
//       role: "caretaker",
//       employee_id: "",
//       salary: "",
//       department: "",
//       joining_date: new Date().toISOString().split("T")[0],
//       current_address: "",
//       permanent_address: "",
//       emergency_contact_name: "",
//       emergency_contact_phone: "",
//       emergency_contact_relation: "",
//       bank_account_holder_name: "",
//       bank_account_number: "",
//       bank_name: "",
//       bank_ifsc_code: "",
//       upi_id: "",
//       aadhar_document: null,
//       pan_document: null,
//       photo: null,
//       aadhar_document_url: "",
//       pan_document_url: "",
//       photo_url: "",
//       is_active: true,
//     });
//   };

//   // Handle file upload
//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, documentType: 'aadhar_document' | 'pan_document' | 'photo') => {
//     const file = e.target.files?.[0];
//     if (file) {
//       // Validate file size (5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("File size should be less than 5MB");
//         return;
//       }
      
//       // Validate file type
//       const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
//       if (!validTypes.includes(file.type)) {
//         toast.error("Only JPEG, PNG, and PDF files are allowed");
//         return;
//       }

//       setFormData(prev => ({
//         ...prev,
//         [documentType]: file,
//         [`${documentType}_url`]: URL.createObjectURL(file)
//       }));
//       toast.success(`${documentType.replace('_', ' ')} uploaded successfully`);
//     }
//   };

//   // Handle remove document
//   const handleRemoveDocument = (documentType: 'aadhar_document' | 'pan_document' | 'photo') => {
//     setFormData(prev => ({
//       ...prev,
//       [documentType]: null,
//       [`${documentType}_url`]: editingStaff?.[`${documentType}_url` as keyof StaffMember] as string || ""
//     }));
//     toast.success(`${documentType.replace('_', ' ')} removed`);
//   };

//   // Role badge color
//   const getRoleBadgeColor = (role: string) => {
//     switch (role) {
//       case "admin": return "bg-purple-100 text-purple-800 border-purple-200";
//       case "manager": return "bg-blue-100 text-blue-800 border-blue-200";
//       case "caretaker": return "bg-green-100 text-green-800 border-green-200";
//       case "accountant": return "bg-orange-100 text-orange-800 border-orange-200";
//       case "security": return "bg-red-100 text-red-800 border-red-200";
//       case "driver": return "bg-indigo-100 text-indigo-800 border-indigo-200";
//       case "cook": return "bg-amber-100 text-amber-800 border-amber-200";
//       case "housekeeping": return "bg-teal-100 text-teal-800 border-teal-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   // Blood groups
//   const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

//   // Format salary
//   const formatSalary = (salary: number) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(salary);
//   };

//   // Format date
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="p-6 flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
//           <p className="mt-4 text-gray-600">Loading staff data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 md:p-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold">Staff Management</h1>
//           <p className="text-gray-600 text-sm sm:text-base">
//             Manage caretakers, managers, and staff members
//           </p>
//         </div>

//         <Dialog
//           open={showDialog}
//           onOpenChange={(open) => {
//             setShowDialog(open);
//             if (!open) resetForm();
//           }}
//         >
//           <DialogTrigger asChild>
//             <Button className="w-full sm:w-auto">
//               <Plus className="mr-2 h-4 w-4" />
//               Add Staff
//             </Button>
//           </DialogTrigger>

//           <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle className="text-xl">
//                 {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
//               </DialogTitle>
//               <p className="text-sm text-gray-500">
//                 Fill in the details below to {editingStaff ? "update" : "add"} staff information
//               </p>
//             </DialogHeader>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
//               {/* Column 1 - Personal Information */}
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="salutation" className="flex items-center gap-2">
//                     <User className="h-4 w-4 text-gray-500" />
//                     Salutation
//                   </Label>
//                   <Select
//                     value={formData.salutation}
//                     onValueChange={(v) => setFormData({ ...formData, salutation: v })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select salutation" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="mr">Mr.</SelectItem>
//                       <SelectItem value="mrs">Mrs.</SelectItem>
//                       <SelectItem value="miss">Miss</SelectItem>
//                       <SelectItem value="dr">Dr.</SelectItem>
//                       <SelectItem value="prof">Prof.</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="name" className="flex items-center gap-2">
//                     <User className="h-4 w-4 text-gray-500" />
//                     Full Name *
//                   </Label>
//                   <Input
//                     id="name"
//                     placeholder="John Doe"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email" className="flex items-center gap-2">
//                     <Mail className="h-4 w-4 text-gray-500" />
//                     Email Address *
//                   </Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="john@example.com"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="flex items-center gap-2">
//                     <Phone className="h-4 w-4 text-gray-500" />
//                     Phone Number *
//                   </Label>
//                   <Input
//                     placeholder="9876543210"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <Label className="flex items-center gap-2">
//                       <MessageSquare className="h-4 w-4 text-green-600" />
//                       WhatsApp Number
//                     </Label>
//                     <div className="flex items-center gap-2 text-xs">
//                       <span>Same as phone</span>
//                       <Switch
//                         checked={formData.is_whatsapp_same}
//                         onCheckedChange={(checked) => {
//                           setFormData(prev => ({
//                             ...prev,
//                             is_whatsapp_same: checked,
//                             whatsapp_number: checked ? prev.phone : "",
//                           }));
//                         }}
//                       />
//                     </div>
//                   </div>

//                   {!formData.is_whatsapp_same ? (
//                     <Input
//                       placeholder="Enter WhatsApp number"
//                       value={formData.whatsapp_number}
//                       onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
//                       disabled={formData.is_whatsapp_same}
//                     />
//                   ) : (
//                     <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">
//                       WhatsApp will use the phone number: {formData.phone}
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="blood_group" className="flex items-center gap-2">
//                     <Droplets className="h-4 w-4 text-gray-500" />
//                     Blood Group
//                   </Label>
//                   <Select
//                     value={formData.blood_group}
//                     onValueChange={(v) => setFormData({ ...formData, blood_group: v })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select blood group" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="not_specified">Not Specified</SelectItem>
//                       {bloodGroups.map(group => (
//                         <SelectItem key={group} value={group.toLowerCase()}>{group}</SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* KYC Section */}
//                 <div className="border-t pt-4 space-y-3">
//                   <div className="flex items-center gap-2">
//                     <FileText className="h-4 w-4 text-blue-500" />
//                     <Label className="text-sm font-medium">KYC Details</Label>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="aadhar_number" className="text-xs">
//                       Aadhar Card Number
//                     </Label>
//                     <Input
//                       id="aadhar_number"
//                       placeholder="XXXX XXXX XXXX"
//                       value={formData.aadhar_number}
//                       onChange={(e) => setFormData({ ...formData, aadhar_number: e.target.value })}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="pan_number" className="text-xs">
//                       PAN Card Number
//                     </Label>
//                     <Input
//                       id="pan_number"
//                       placeholder="ABCDE1234F"
//                       value={formData.pan_number}
//                       onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Column 2 - Job Information & Address */}
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="employee_id" className="flex items-center gap-2">
//                     <Hash className="h-4 w-4 text-gray-500" />
//                     Employee ID
//                   </Label>
//                   <Input
//                     id="employee_id"
//                     placeholder="EMP-001"
//                     value={formData.employee_id}
//                     onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="department" className="flex items-center gap-2">
//                     <Building className="h-4 w-4 text-gray-500" />
//                     Department
//                   </Label>
//                   <Input
//                     id="department"
//                     placeholder="Enter department"
//                     value={formData.department}
//                     onChange={(e) => setFormData({ ...formData, department: e.target.value })}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="role">Role *</Label>
//                   <Select
//                     value={formData.role}
//                     onValueChange={(v) => setFormData({ ...formData, role: v })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select role" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="admin">Admin</SelectItem>
//                       <SelectItem value="manager">Manager</SelectItem>
//                       <SelectItem value="caretaker">Caretaker</SelectItem>
//                       <SelectItem value="accountant">Accountant</SelectItem>
//                       <SelectItem value="security">Security</SelectItem>
//                       <SelectItem value="driver">Driver</SelectItem>
//                       <SelectItem value="cook">Cook</SelectItem>
//                       <SelectItem value="housekeeping">Housekeeping</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="salary" className="flex items-center gap-2">
//                     <IndianRupee className="h-4 w-4 text-gray-500" />
//                     Salary (₹)
//                   </Label>
//                   <Input
//                     id="salary"
//                     type="number"
//                     placeholder="25000"
//                     value={formData.salary}
//                     onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="joining_date" className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4 text-gray-500" />
//                     Joining Date
//                   </Label>
//                   <Input
//                     id="joining_date"
//                     type="date"
//                     value={formData.joining_date}
//                     onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
//                   />
//                 </div>

//                 {/* Address Section */}
//                 <div className="border-t pt-4 space-y-3">
//                   <div className="flex items-center gap-2">
//                     <Home className="h-4 w-4 text-green-500" />
//                     <Label className="text-sm font-medium">Address Details</Label>
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Current Address</Label>
//                     <Textarea
//                       placeholder="Enter current address"
//                       value={formData.current_address}
//                       onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
//                       rows={3}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label>Permanent Address</Label>
//                     <Textarea
//                       placeholder="Enter permanent address"
//                       value={formData.permanent_address}
//                       onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
//                       rows={3}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Column 3 - Emergency Contact, Bank Details & Documents */}
//               <div className="space-y-4">
//                 {/* Emergency Contact Section */}
//                 <div className="border-t pt-4 space-y-3">
//                   <div className="flex items-center gap-2">
//                     <AlertCircle className="h-4 w-4 text-orange-500" />
//                     <Label className="text-sm font-medium">Emergency Contact</Label>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="emergency_contact_name" className="text-xs">
//                       Contact Name
//                     </Label>
//                     <Input
//                       id="emergency_contact_name"
//                       placeholder="Emergency contact person name"
//                       value={formData.emergency_contact_name}
//                       onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="space-y-2">
//                       <Label htmlFor="emergency_contact_phone" className="text-xs">
//                         Phone Number
//                       </Label>
//                       <Input
//                         id="emergency_contact_phone"
//                         placeholder="9876543210"
//                         value={formData.emergency_contact_phone}
//                         onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="emergency_contact_relation" className="text-xs">
//                         Relationship
//                       </Label>
//                       <Input
//                         id="emergency_contact_relation"
//                         placeholder="Father/Mother/Spouse"
//                         value={formData.emergency_contact_relation}
//                         onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Bank Details Section */}
//                 <div className="border-t pt-4 space-y-3">
//                   <div className="flex items-center gap-2">
//                     <CreditCard className="h-4 w-4 text-blue-500" />
//                     <Label className="text-sm font-medium">Bank Details</Label>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="bank_account_holder_name" className="text-xs">
//                       Account Holder Name
//                     </Label>
//                     <Input
//                       id="bank_account_holder_name"
//                       placeholder="Account holder name as per bank"
//                       value={formData.bank_account_holder_name}
//                       onChange={(e) => setFormData({ ...formData, bank_account_holder_name: e.target.value })}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="bank_account_number" className="text-xs">
//                       Account Number
//                     </Label>
//                     <Input
//                       id="bank_account_number"
//                       placeholder="XXXX XXXX XXXX XXXX"
//                       value={formData.bank_account_number}
//                       onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="space-y-2">
//                       <Label htmlFor="bank_name" className="text-xs">
//                         Bank Name
//                       </Label>
//                       <Input
//                         id="bank_name"
//                         placeholder="Bank name"
//                         value={formData.bank_name}
//                         onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="bank_ifsc_code" className="text-xs">
//                         IFSC Code
//                       </Label>
//                       <Input
//                         id="bank_ifsc_code"
//                         placeholder="ABCD0123456"
//                         value={formData.bank_ifsc_code}
//                         onChange={(e) => setFormData({ ...formData, bank_ifsc_code: e.target.value })}
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="upi_id" className="text-xs">
//                       UPI ID
//                     </Label>
//                     <Input
//                       id="upi_id"
//                       placeholder="username@upi"
//                       value={formData.upi_id}
//                       onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
//                     />
//                   </div>
//                 </div>

//                 {/* Documents Upload Section */}
//                 <div className="border-t pt-4 space-y-3">
//                   <div className="flex items-center gap-2">
//                     <Upload className="h-4 w-4 text-purple-500" />
//                     <Label className="text-sm font-medium">Upload Documents</Label>
//                   </div>

//                   <div className="space-y-3">
//                     {/* Aadhar Card */}
//                     <div className="space-y-2">
//                       <Label className="text-xs">Aadhar Card (PDF/Image)</Label>
//                       <Input
//                         type="file"
//                         accept=".pdf,.jpg,.jpeg,.png"
//                         onChange={(e) => handleFileUpload(e, 'aadhar_document')}
//                         className="cursor-pointer"
//                       />
//                       {(formData.aadhar_document_url || formData.aadhar_document) && (
//                         <div className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded mt-1">
//                           <span className="truncate">
//                             {formData.aadhar_document 
//                               ? formData.aadhar_document.name 
//                               : "Aadhar document uploaded"}
//                           </span>
//                           <div className="flex gap-2">
//                             {formData.aadhar_document_url && !formData.aadhar_document && (
//                               <a
//                                 href={formData.aadhar_document_url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-blue-600 hover:text-blue-800"
//                                 title="View document"
//                               >
//                                 <Eye className="h-3 w-3" />
//                               </a>
//                             )}
//                             <button
//                               type="button"
//                               onClick={() => handleRemoveDocument('aadhar_document')}
//                               className="text-red-600 hover:text-red-800"
//                               title="Remove document"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     {/* PAN Card */}
//                     <div className="space-y-2">
//                       <Label className="text-xs">PAN Card (PDF/Image)</Label>
//                       <Input
//                         type="file"
//                         accept=".pdf,.jpg,.jpeg,.png"
//                         onChange={(e) => handleFileUpload(e, 'pan_document')}
//                         className="cursor-pointer"
//                       />
//                       {(formData.pan_document_url || formData.pan_document) && (
//                         <div className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded mt-1">
//                           <span className="truncate">
//                             {formData.pan_document 
//                               ? formData.pan_document.name 
//                               : "PAN document uploaded"}
//                           </span>
//                           <div className="flex gap-2">
//                             {formData.pan_document_url && !formData.pan_document && (
//                               <a
//                                 href={formData.pan_document_url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-blue-600 hover:text-blue-800"
//                                 title="View document"
//                               >
//                                 <Eye className="h-3 w-3" />
//                               </a>
//                             )}
//                             <button
//                               type="button"
//                               onClick={() => handleRemoveDocument('pan_document')}
//                               className="text-red-600 hover:text-red-800"
//                               title="Remove document"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     {/* Photo */}
//                     <div className="space-y-2">
//                       <Label className="text-xs">Passport Size Photo (Image)</Label>
//                       <Input
//                         type="file"
//                         accept=".jpg,.jpeg,.png"
//                         onChange={(e) => handleFileUpload(e, 'photo')}
//                         className="cursor-pointer"
//                       />
//                       {(formData.photo_url || formData.photo) && (
//                         <div className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded mt-1">
//                           <span className="truncate">
//                             {formData.photo 
//                               ? formData.photo.name 
//                               : "Photo uploaded"}
//                           </span>
//                           <div className="flex gap-2">
//                             {formData.photo_url && !formData.photo && (
//                               <a
//                                 href={formData.photo_url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-blue-600 hover:text-blue-800"
//                                 title="View photo"
//                               >
//                                 <Eye className="h-3 w-3" />
//                               </a>
//                             )}
//                             <button
//                               type="button"
//                               onClick={() => handleRemoveDocument('photo')}
//                               className="text-red-600 hover:text-red-800"
//                               title="Remove photo"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 pt-4 border-t">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setShowDialog(false);
//                   resetForm();
//                 }}
//                 disabled={submitting}
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 onClick={handleSubmit} 
//                 className="min-w-[120px]"
//                 disabled={submitting}
//               >
//                 {submitting ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     {editingStaff ? "Updating..." : "Adding..."}
//                   </>
//                 ) : editingStaff ? "Update Staff" : "Add Staff"}
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Card>
//         <CardHeader className="pb-3">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <CardTitle>All Staff Members</CardTitle>
//               <p className="text-sm text-gray-500 mt-1">
//                 Showing {filteredStaff.length} of {staff.length} staff member{staff.length !== 1 ? 's' : ''}
//               </p>
//             </div>
//             <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//               <div className="relative w-full sm:w-64">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input
//                   placeholder="Search by name, email, phone..."
//                   className="pl-10"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <Select value={roleFilter} onValueChange={setRoleFilter}>
//                 <SelectTrigger className="w-full sm:w-40">
//                   <SelectValue placeholder="Filter by role" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Roles</SelectItem>
//                   <SelectItem value="admin">Admin</SelectItem>
//                   <SelectItem value="manager">Manager</SelectItem>
//                   <SelectItem value="caretaker">Caretaker</SelectItem>
//                   <SelectItem value="accountant">Accountant</SelectItem>
//                   <SelectItem value="security">Security</SelectItem>
//                   <SelectItem value="driver">Driver</SelectItem>
//                   <SelectItem value="cook">Cook</SelectItem>
//                   <SelectItem value="housekeeping">Housekeeping</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="rounded-md border overflow-hidden">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="font-semibold">Staff Member</TableHead>
//                   <TableHead className="font-semibold">Role</TableHead>
//                   <TableHead className="font-semibold">Contact</TableHead>
//                   <TableHead className="font-semibold">Salary & Department</TableHead>
//                   <TableHead className="font-semibold">Status</TableHead>
//                   <TableHead className="font-semibold text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filteredStaff.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={6} className="text-center py-12 text-gray-500">
//                       <div className="flex flex-col items-center justify-center">
//                         <User className="h-16 w-16 text-gray-300 mb-4" />
//                         <p className="text-lg font-medium">No staff members found</p>
//                         <p className="text-sm text-gray-500 mt-1">
//                           {searchTerm || roleFilter !== "all"
//                             ? "Try changing your search or filter criteria"
//                             : "Add your first staff member using the button above"}
//                         </p>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   filteredStaff.map((member) => (
//                     <TableRow key={member.id} className="hover:bg-gray-50/50">
//                       <TableCell>
//                         <div className="flex items-start gap-3">
//                           {member.photo_url ? (
//                             <img
//                               src={member.photo_url}
//                               alt={member.name}
//                               className="h-12 w-12 rounded-full object-cover border"
//                             />
//                           ) : (
//                             <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border">
//                               <User className="h-6 w-6 text-gray-400" />
//                             </div>
//                           )}
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium">
//                                 {member.salutation ? `${member.salutation}. ` : ""}{member.name}
//                               </span>
//                               {member.employee_id && (
//                                 <Badge variant="outline" className="text-xs">
//                                   <Hash className="h-3 w-3 mr-1" />
//                                   {member.employee_id}
//                                 </Badge>
//                               )}
//                             </div>
//                             <div className="flex items-center gap-2 mt-1">
//                               <Mail className="h-3 w-3 text-gray-400" />
//                               <span className="text-sm text-gray-600 truncate max-w-[200px]">
//                                 {member.email}
//                               </span>
//                             </div>
//                             {member.current_address && (
//                               <div className="flex items-start gap-1 mt-1">
//                                 <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
//                                 <span className="text-xs text-gray-500 truncate max-w-[200px]">
//                                   {member.current_address}
//                                 </span>
//                               </div>
//                             )}
//                             <div className="flex items-center gap-2 mt-1">
//                               <Calendar className="h-3 w-3 text-gray-400" />
//                               <span className="text-xs text-gray-500">
//                                 Joined: {formatDate(member.joining_date)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <Badge
//                           variant="outline"
//                           className={`${getRoleBadgeColor(member.role)} flex items-center gap-1`}
//                         >
//                           {roleIcons[member.role] || <User className="h-3 w-3" />}
//                           <span className="capitalize">{member.role}</span>
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex flex-col gap-1">
//                           <div className="flex items-center gap-2">
//                             <Phone className="h-3 w-3 text-gray-500" />
//                             <span className="text-sm">{member.phone || "No phone"}</span>
//                           </div>
//                           {member.whatsapp_number && (
//                             <div className="flex items-center gap-2">
//                               <MessageSquare className="h-3 w-3 text-green-500" />
//                               <span className="text-sm">{member.whatsapp_number}</span>
//                             </div>
//                           )}
//                           {member.blood_group && member.blood_group !== "not_specified" && (
//                             <div className="flex items-center gap-2">
//                               <Droplets className="h-3 w-3 text-red-500" />
//                               <span className="text-xs">Blood: {member.blood_group.toUpperCase()}</span>
//                             </div>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex flex-col gap-2">
//                           <div className="font-medium">{formatSalary(member.salary)}</div>
//                           {member.department && (
//                             <div className="flex items-center gap-1 text-sm text-gray-600">
//                               <Building className="h-3 w-3" />
//                               {member.department}
//                             </div>
//                           )}
//                           {/* Document indicators */}
//                           <div className="flex flex-wrap gap-1 mt-1">
//                             {member.aadhar_document_url && (
//                               <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
//                                 Aadhar ✓
//                               </Badge>
//                             )}
//                             {member.pan_document_url && (
//                               <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
//                                 PAN ✓
//                               </Badge>
//                             )}
//                             {member.photo_url && (
//                               <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
//                                 Photo ✓
//                               </Badge>
//                             )}
//                           </div>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex flex-col gap-1">
//                           <Badge
//                             className={
//                               member.is_active
//                                 ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
//                                 : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200"
//                             }
//                           >
//                             {member.is_active ? "Active" : "Inactive"}
//                           </Badge>
//                           {member.assigned_requests > 0 && (
//                             <div className="text-xs text-blue-600">
//                               {member.assigned_requests} assigned request{member.assigned_requests !== 1 ? 's' : ''}
//                             </div>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex justify-end gap-2">
//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => handleEdit(member)}
//                             className="h-8 w-8 p-0"
//                             title="Edit"
//                           >
//                             <Edit className="h-3.5 w-3.5" />
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant={member.is_active ? "outline" : "default"}
//                             onClick={() => handleToggleActive(member.id, member.is_active)}
//                             className="h-8 px-3 text-xs"
//                           >
//                             {member.is_active ? "Deactivate" : "Activate"}
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             onClick={() => handleDelete(member.id)}
//                             className="h-8 w-8 p-0"
//                             title="Delete"
//                           >
//                             <Trash2 className="h-3.5 w-3.5" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// app/admin/staff/page.tsx (Server Component)
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import StaffClientPage from '@/components/admin/staff/StaffClientPage';
import { getAllStaff, StaffMember } from '@/lib/staffApi';

export default function StaffPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const role = searchParams.get('role') ?? '';
  const [initialStaff, setInitialStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllStaff()
      .then(setInitialStaff)
      .catch((err) => console.error('Error fetching initial staff:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  return (
    <StaffClientPage 
      initialStaff={initialStaff}
      searchParams={{ search, role }}
    />
  );
}