// // components/admin/staff/StaffForm.tsx
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   User,
//   Mail,
//   Phone,
//   MessageSquare,
//   Droplets,
//   FileText,
//   Hash,
//   IndianRupee,
//   Calendar,
//   Home,
//   Building,
//   AlertCircle,
//   CreditCard,
//   Upload,
//   Eye,
//   EyeOff,
//   Lock,
// } from "lucide-react";
// import { StaffMember } from "@/lib/staffApi";
// import { useState } from "react";

// interface StaffFormProps {
//   formData: {
//     salutation: string;
//     name: string;
//     email: string;
//     password: string;
//     confirmPassword: string;
//     phone: string;
//     whatsapp_number: string;
//     is_whatsapp_same: boolean;
//     blood_group: string;
//     aadhar_number: string;
//     pan_number: string;
//     role: string;
//     employee_id: string;
//     salary: string;
//     department: string;
//     joining_date: string;
//     current_address: string;
//       phone_country_code: string;  // ADD THIS

//     permanent_address: string;
//     emergency_contact_name: string;
//     emergency_contact_phone: string;
//     emergency_contact_relation: string;
//     bank_account_holder_name: string;
//     bank_account_number: string;
//     bank_name: string;
//     bank_ifsc_code: string;
//     upi_id: string;
//     aadhar_document: File | null;
//     pan_document: File | null;
//     photo: File | null;
//     aadhar_document_url: string;
//     pan_document_url: string;
//     photo_url: string;
//     is_active: boolean;
//   };
//   setFormData: React.Dispatch<React.SetStateAction<any>>;
//   editingStaff: StaffMember | null;
//   handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, documentType: 'aadhar_document' | 'pan_document' | 'photo') => void;
//   handleRemoveDocument: (documentType: 'aadhar_document' | 'pan_document' | 'photo') => void;
//   roles?: Array<{ id: number; name: string }>;
//   departments?: Array<{ id: number; name: string }>;
//   loadingMasters?: boolean;
//   passwordErrors?: { password?: string; confirmPassword?: string };
// }

// const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// const StaffForm = ({
//   formData,
//   setFormData,
//   editingStaff,
//   handleFileUpload,
//   handleRemoveDocument,
//   roles = [],
//   departments = [],
//   loadingMasters = false,
//   passwordErrors = {},
// }: StaffFormProps) => {

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [changePassword, setChangePassword] = useState(false);

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
//       {/* Column 1 - Personal Information */}
//       <div className="space-y-3 sm:space-y-4">
//         <div className="space-y-1.5 sm:space-y-2">
//           <Label htmlFor="salutation" className="flex items-center gap-1.5 sm:gap-2">
//             <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
//             <span className="text-xs sm:text-sm">Salutation</span>
//           </Label>
//           <Select
//             value={formData.salutation}
//             onValueChange={(v) => setFormData({ ...formData, salutation: v })}
//           >
//             <SelectTrigger className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
//               <SelectValue placeholder="Select salutation" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="mr">Mr.</SelectItem>
//               <SelectItem value="mrs">Mrs.</SelectItem>
//               <SelectItem value="miss">Miss</SelectItem>
//               <SelectItem value="dr">Dr.</SelectItem>
//               <SelectItem value="prof">Prof.</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-1.5 sm:space-y-2">
//           <Label htmlFor="name" className="flex items-center gap-1.5 sm:gap-2">
//             <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
//             <span className="text-xs sm:text-sm">Full Name *</span>
//           </Label>
//           <Input
//             id="name"
//             placeholder="John Doe"
//             value={formData.name}
//             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//             className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//             required
//           />
//         </div>

//         <div className="space-y-1.5 sm:space-y-2">
//           <Label htmlFor="email" className="flex items-center gap-1.5 sm:gap-2">
//             <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
//             <span className="text-xs sm:text-sm">Email Address *</span>
//           </Label>
//           <Input
//             id="email"
//             type="email"
//             placeholder="john@example.com"
//             value={formData.email}
//             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//             className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//             required
//           />
//         </div>

//         {/* Password Fields */}
//         {!editingStaff ? (
//           <>
//             <div className="space-y-1.5 sm:space-y-2">
//               <Label htmlFor="password" className="flex items-center gap-1.5 sm:gap-2">
//                 <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
//                 <span className="text-xs sm:text-sm">Password *</span>
//               </Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter password"
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   className={`h-8 sm:h-9 md:h-10 text-xs sm:text-sm pr-8 ${
//                     passwordErrors.password ? 'border-red-500' : ''
//                   }`}
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
//                 >
//                   {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
//                 </button>
//               </div>
//               {passwordErrors.password && (
//                 <p className="text-[10px] text-red-500 mt-1">{passwordErrors.password}</p>
//               )}
//             </div>

//             <div className="space-y-1.5 sm:space-y-2">
//               <Label htmlFor="confirmPassword" className="flex items-center gap-1.5 sm:gap-2">
//                 <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
//                 <span className="text-xs sm:text-sm">Confirm Password *</span>
//               </Label>
//               <div className="relative">
//                 <Input
//                   id="confirmPassword"
//                   type={showConfirmPassword ? "text" : "password"}
//                   placeholder="Confirm password"
//                   value={formData.confirmPassword}
//                   onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                   className={`h-8 sm:h-9 md:h-10 text-xs sm:text-sm pr-8 ${
//                     passwordErrors.confirmPassword ? 'border-red-500' : ''
//                   }`}
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
//                 >
//                   {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
//                 </button>
//               </div>
//               {passwordErrors.confirmPassword && (
//                 <p className="text-[10px] text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
//               )}
//             </div>
//           </>
//         ) : (
//   <div className="space-y-3">
//     <Button
//       type="button"
//       variant="outline"
//       size="sm"
//       onClick={() => setChangePassword(true)}
//       className="w-full text-xs sm:text-sm"
//     >
//       <Lock className="h-3.5 w-3.5 mr-2" />
//       Change Password
//     </Button>

//     <Dialog open={changePassword} onOpenChange={(open) => {
//       setChangePassword(open);
//       if (!open) {
//         setFormData({ 
//           ...formData, 
//           password: "", 
//           confirmPassword: "" 
//         });
//         setShowPassword(false);
//         setShowConfirmPassword(false);
//       }
//     }}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Change Password</DialogTitle>
//         </DialogHeader>
        
//         <div className="space-y-4 py-4">
//           <div className="space-y-2">
//             <Label htmlFor="password" className="flex items-center gap-1.5">
//               <Lock className="h-4 w-4 text-gray-500" />
//               <span>New Password *</span>
//             </Label>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter new password"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 className={`w-full pr-8 ${passwordErrors.password ? 'border-red-500' : ''}`}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
//               >
//                 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//               </button>
//             </div>
//             {passwordErrors.password && (
//               <p className="text-xs text-red-500">{passwordErrors.password}</p>
//             )}
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="confirmPassword" className="flex items-center gap-1.5">
//               <Lock className="h-4 w-4 text-gray-500" />
//               <span>Confirm New Password *</span>
//             </Label>
//             <div className="relative">
//               <Input
//                 id="confirmPassword"
//                 type={showConfirmPassword ? "text" : "password"}
//                 placeholder="Confirm new password"
//                 value={formData.confirmPassword}
//                 onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                 className={`w-full pr-8 ${passwordErrors.confirmPassword ? 'border-red-500' : ''}`}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
//               >
//                 {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//               </button>
//             </div>
//             {passwordErrors.confirmPassword && (
//               <p className="text-xs text-red-500">{passwordErrors.confirmPassword}</p>
//             )}
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => {
//             setChangePassword(false);
//             setFormData({ 
//               ...formData, 
//               password: "", 
//               confirmPassword: "" 
//             });
//             setShowPassword(false);
//             setShowConfirmPassword(false);
//           }}>
//             Cancel
//           </Button>
//           <Button onClick={() => {
//             // Your existing validation logic will run from parent
//             setChangePassword(false);
//           }}>
//             Save Password
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   </div>
// )}

//     <div className="space-y-1.5 sm:space-y-2">
//   <Label className="flex items-center gap-1.5 sm:gap-2">
//     <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
//     <span className="text-xs sm:text-sm">Phone Number *</span>
//   </Label>
//   <div className="flex gap-1.5">
//     <Select
//       value={formData.phone_country_code}
//       onValueChange={(v) => setFormData({ ...formData, phone_country_code: v })}
//     >
//       <SelectTrigger className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm w-[110px] shrink-0">
//         <SelectValue placeholder="+91" />
//       </SelectTrigger>
//       <SelectContent className="max-h-60">
//         {[
//           { code: "+91", flag: "🇮🇳", name: "India" },
//           { code: "+1", flag: "🇺🇸", name: "USA" },
//           { code: "+44", flag: "🇬🇧", name: "UK" },
//           { code: "+971", flag: "🇦🇪", name: "UAE" },
//           { code: "+65", flag: "🇸🇬", name: "Singapore" },
//           { code: "+61", flag: "🇦🇺", name: "Australia" },
//           { code: "+49", flag: "🇩🇪", name: "Germany" },
//           { code: "+33", flag: "🇫🇷", name: "France" },
//           { code: "+81", flag: "🇯🇵", name: "Japan" },
//           { code: "+86", flag: "🇨🇳", name: "China" },
//           { code: "+7", flag: "🇷🇺", name: "Russia" },
//           { code: "+55", flag: "🇧🇷", name: "Brazil" },
//           { code: "+27", flag: "🇿🇦", name: "South Africa" },
//           { code: "+92", flag: "🇵🇰", name: "Pakistan" },
//           { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
//           { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
//           { code: "+977", flag: "🇳🇵", name: "Nepal" },
//           { code: "+60", flag: "🇲🇾", name: "Malaysia" },
//           { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
//           { code: "+974", flag: "🇶🇦", name: "Qatar" },
//         ].map(({ code, flag, name }) => (
//           <SelectItem key={code} value={code}>
//             {flag} {code} {name}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//     <Input
//       placeholder="9876543210"
//       value={formData.phone}
//       onChange={(e) => {
//         const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
//         setFormData({ ...formData, phone: onlyNumbers });
//       }}
//       className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm flex-1"
//       required
//       maxLength={15}
//       inputMode="numeric"
//     />
//   </div>
// </div>
//         <div className="space-y-1.5 sm:space-y-2">
//           <div className="flex items-center justify-between">
//             <Label className="flex items-center gap-1.5 sm:gap-2">
//               <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
//               <span className="text-xs sm:text-sm">WhatsApp Number</span>
//             </Label>
//             <div className="flex items-center gap-1.5 sm:gap-2">
//               <span className="text-[10px] sm:text-xs">Same as phone</span>
//               <Switch
//                 checked={formData.is_whatsapp_same}
//                 onCheckedChange={(checked) => {
//                   setFormData((prev: any) => ({
//                     ...prev,
//                     is_whatsapp_same: checked,
//                     whatsapp_number: checked ? prev.phone : prev.whatsapp_number,
//                   }));
//                 }}
//                 className="scale-75 sm:scale-90 origin-right"
//               />
//             </div>
//           </div>

//           {formData.is_whatsapp_same ? (
//             <div className="p-1.5 sm:p-2 bg-gray-50 rounded text-[10px] sm:text-sm text-gray-600">
//               WhatsApp will use the phone number: {formData.phone}
//             </div>
//           ) : (
//             <Input
//               placeholder="Enter WhatsApp number"
//               value={formData.whatsapp_number}
//               onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
//               disabled={formData.is_whatsapp_same}
//               className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//             />
//           )}
//         </div>

//         <div className="space-y-1.5 sm:space-y-2">
//           <Label htmlFor="blood_group" className="flex items-center gap-1.5 sm:gap-2">
//             <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
//             <span className="text-xs sm:text-sm">Blood Group</span>
//           </Label>
//           <Select
//             value={formData.blood_group}
//             onValueChange={(v) => setFormData({ ...formData, blood_group: v })}
//           >
//             <SelectTrigger className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
//               <SelectValue placeholder="Select blood group" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="not_specified">Not Specified</SelectItem>
//               {bloodGroups.map(group => (
//                 <SelectItem key={group} value={group.toLowerCase()}>
//                   {group}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* KYC Section */}
//         <div className="border-t pt-3 sm:pt-4 space-y-2 sm:space-y-3">
//           <div className="flex items-center gap-1.5 sm:gap-2">
//             <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//             <span className="text-xs sm:text-sm font-medium">KYC Details</span>
//           </div>

//           <div className="space-y-1.5 sm:space-y-2">
//             <Label htmlFor="aadhar_number" className="text-[10px] sm:text-xs">
//               Aadhar Card Number
//             </Label>
//             <Input
//               id="aadhar_number"
//               placeholder="XXXX XXXX XXXX"
//               value={formData.aadhar_number}
//               onChange={(e) => setFormData({ ...formData, aadhar_number: e.target.value })}
//               className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//             />
//           </div>

//           <div className="space-y-1.5 sm:space-y-2">
//             <Label htmlFor="pan_number" className="text-[10px] sm:text-xs">
//               PAN Card Number
//             </Label>
//             <Input
//               id="pan_number"
//               placeholder="ABCDE1234F"
//               value={formData.pan_number}
//               onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
//               className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Column 2 - Job Information & Address */}
//       <div className="space-y-3 sm:space-y-4">
//         <div className="space-y-1.5 sm:space-y-2">
//           <Label htmlFor="employee_id" className="flex items-center gap-1.5 sm:gap-2">
//             <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
//             <span className="text-xs sm:text-sm">Employee ID</span>
//           </Label>
//           <Input
//             id="employee_id"
//             placeholder="EMP-001"
//             value={formData.employee_id}
//             onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
//             className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//           />
//         </div>

//         <div className="space-y-1.5 sm:space-y-2">
//   <Label htmlFor="department" className="flex items-center gap-1.5 sm:gap-2">
//     <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
//     <span className="text-xs sm:text-sm">Department</span>
//   </Label>
//   <Select
//     value={formData.department}
//     onValueChange={(v) => {
//       const selectedDept = departments.find(d => d.id.toString() === v);
//       setFormData({ 
//         ...formData, 
//         department: v,
//         department_name: selectedDept?.name || v
//       });
//     }}
//   >
//     <SelectTrigger className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
//       <SelectValue placeholder={
//         loadingMasters 
//           ? "Loading departments..." 
//           : departments.length === 0 
//             ? "No departments available" 
//             : "Select department"
//       } />
//     </SelectTrigger>
//     <SelectContent>
//       {loadingMasters ? (
//         <SelectItem value="loading-departments" disabled>
//           Loading departments...
//         </SelectItem>
//       ) : departments.length === 0 ? (
//         <SelectItem value="no-depts-found" disabled>
//           No departments found
//         </SelectItem>
//       ) : (
//         departments.map((dept) => (
//           <SelectItem key={dept.id} value={dept.id.toString()}>
//             {dept.name}
//           </SelectItem>
//         ))
//       )}
//     </SelectContent>
//   </Select>
// </div>

//         <div className="space-y-1.5 sm:space-y-2">
//           <Label htmlFor="role" className="text-xs sm:text-sm">Role *</Label>
//           <Select
//             value={formData.role}
//             onValueChange={(v) => {
//               const selectedRole = roles.find(r => r.id.toString() === v);
//               setFormData({ 
//                 ...formData, 
//                 role: v,
//                 role_name: selectedRole?.name || v
//               });
//             }}
//           >
//             <SelectTrigger className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm">
//               <SelectValue placeholder={
//                 loadingMasters 
//                   ? "Loading roles..." 
//                   : roles.length === 0 
//                     ? "No roles available" 
//                     : "Select role"
//               } />
//             </SelectTrigger>
//             <SelectContent>
//               {loadingMasters ? (
//                 <SelectItem value="loading-roles" disabled>
//                   Loading roles...
//                 </SelectItem>
//               ) : roles.length === 0 ? (
//                 <SelectItem value="no-roles-found" disabled>
//                   No roles found in masters
//                 </SelectItem>
//               ) : (
//                 roles.map((role) => (
//                   <SelectItem key={role.id} value={role.id.toString()}>
//                     {role.name}
//                   </SelectItem>
//                 ))
//               )}
//             </SelectContent>
//           </Select>
//           {!loadingMasters && roles.length === 0 && (
//             <p className="text-[10px] text-amber-600 mt-1">
//               No roles found. Please add roles in Masters → Roles → Role
//             </p>
//           )}
//         </div>

//         <div className="space-y-1.5 sm:space-y-2">
//           <Label htmlFor="salary" className="flex items-center gap-1.5 sm:gap-2">
//             <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
//             <span className="text-xs sm:text-sm">Salary (₹)</span>
//           </Label>
//           <Input
//             id="salary"
//             type="number"
//             placeholder="25000"
//             value={formData.salary}
//             onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
//             className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//           />
//         </div>

//         <div className="space-y-1.5 sm:space-y-2">
//           <Label htmlFor="joining_date" className="flex items-center gap-1.5 sm:gap-2">
//             <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
//             <span className="text-xs sm:text-sm">Joining Date</span>
//           </Label>
//           <Input
//             id="joining_date"
//             type="date"
//             value={formData.joining_date}
//             onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
//             className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//           />
//         </div>

//         <div className="border-t pt-3 sm:pt-4 space-y-2 sm:space-y-3">
//           <div className="flex items-center gap-1.5 sm:gap-2">
//             <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
//             <span className="text-xs sm:text-sm font-medium">Address Details</span>
//           </div>

//           <div className="space-y-1.5 sm:space-y-2">
//             <Label className="text-[10px] sm:text-xs">Current Address</Label>
//             <Textarea
//               placeholder="Enter current address"
//               value={formData.current_address}
//               onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
//               rows={2}
//               className="text-xs sm:text-sm min-h-[60px] sm:min-h-[80px]"
//             />
//           </div>

//           <div className="space-y-1.5 sm:space-y-2">
//             <Label className="text-[10px] sm:text-xs">Permanent Address</Label>
//             <Textarea
//               placeholder="Enter permanent address"
//               value={formData.permanent_address}
//               onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
//               rows={2}
//               className="text-xs sm:text-sm min-h-[60px] sm:min-h-[80px]"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Column 3 - Emergency Contact, Bank Details & Documents */}
//       <div className="space-y-3 sm:space-y-4">
//         {/* Emergency Contact Section */}
//         <div className="space-y-2 sm:space-y-3">
//           <div className="flex items-center gap-1.5 sm:gap-2">
//             <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
//             <span className="text-xs sm:text-sm font-medium">Emergency Contact</span>
//           </div>

//           <div className="space-y-1.5 sm:space-y-2">
//             <Label htmlFor="emergency_contact_name" className="text-[10px] sm:text-xs">
//               Contact Name
//             </Label>
//             <Input
//               id="emergency_contact_name"
//               placeholder="Emergency contact person name"
//               value={formData.emergency_contact_name}
//               onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
//               className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-2 sm:gap-3">
//             <div className="space-y-1.5 sm:space-y-2">
//               <Label htmlFor="emergency_contact_phone" className="text-[10px] sm:text-xs">
//                 Phone
//               </Label>
//               <Input
//                 id="emergency_contact_phone"
//                 placeholder="9876543210"
//                 value={formData.emergency_contact_phone}
//                 onChange={(e) => {
//                   const cleanedValue = e.target.value.replace(/[^0-9]/g, "");
//                   setFormData({
//                     ...formData,
//                     emergency_contact_phone: cleanedValue,
//                   });
//                 }}
//                 maxLength={10}
//                 inputMode="numeric"
//                 className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//               />
//             </div>

//             <div className="space-y-1.5 sm:space-y-2">
//               <Label htmlFor="emergency_contact_relation" className="text-[10px] sm:text-xs">
//                 Relation
//               </Label>
//               <Input
//                 id="emergency_contact_relation"
//                 placeholder="Father/Mother"
//                 value={formData.emergency_contact_relation}
//                 onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
//                 className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Bank Details Section */}
//         <div className="border-t pt-3 sm:pt-4 space-y-2 sm:space-y-3">
//           <div className="flex items-center gap-1.5 sm:gap-2">
//             <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
//             <span className="text-xs sm:text-sm font-medium">Bank Details</span>
//           </div>

//           <div className="space-y-1.5 sm:space-y-2">
//             <Label htmlFor="bank_account_holder_name" className="text-[10px] sm:text-xs">
//               Account Holder Name
//             </Label>
//             <Input
//               id="bank_account_holder_name"
//               placeholder="Account holder name"
//               value={formData.bank_account_holder_name}
//               onChange={(e) => setFormData({ ...formData, bank_account_holder_name: e.target.value })}
//               className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//             />
//           </div>

//           <div className="space-y-1.5 sm:space-y-2">
//             <Label htmlFor="bank_account_number" className="text-[10px] sm:text-xs">
//               Account Number
//             </Label>
//             <Input
//               id="bank_account_number"
//               placeholder="XXXX XXXX XXXX XXXX"
//               value={formData.bank_account_number}
//               onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
//               className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-2 sm:gap-3">
//             <div className="space-y-1.5 sm:space-y-2">
//               <Label htmlFor="bank_name" className="text-[10px] sm:text-xs">
//                 Bank Name
//               </Label>
//               <Input
//                 id="bank_name"
//                 placeholder="Bank name"
//                 value={formData.bank_name}
//                 onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
//                 className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//               />
//             </div>

//             <div className="space-y-1.5 sm:space-y-2">
//               <Label htmlFor="bank_ifsc_code" className="text-[10px] sm:text-xs">
//                 IFSC Code
//               </Label>
//               <Input
//                 id="bank_ifsc_code"
//                 placeholder="ABCD0123456"
//                 value={formData.bank_ifsc_code}
//                 onChange={(e) => setFormData({ ...formData, bank_ifsc_code: e.target.value })}
//                 className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//               />
//             </div>
//           </div>

//           <div className="space-y-1.5 sm:space-y-2">
//             <Label htmlFor="upi_id" className="text-[10px] sm:text-xs">
//               UPI ID
//             </Label>
//             <Input
//               id="upi_id"
//               placeholder="username@upi"
//               value={formData.upi_id}
//               onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
//               className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm"
//             />
//           </div>
//         </div>

//         {/* Documents Upload Section */}
//         <div className="border-t pt-3 sm:pt-4 space-y-2 sm:space-y-3">
//           <div className="flex items-center gap-1.5 sm:gap-2">
//             <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
//             <span className="text-xs sm:text-sm font-medium">Upload Documents</span>
//           </div>

//           <div className="space-y-2 sm:space-y-3">
// {/* Aadhar Card */}
// <div className="space-y-1.5 sm:space-y-2">
//   <Label className="text-[10px] sm:text-xs">Aadhar Card (PDF/Image)</Label>
//   <Input
//     type="file"
//     accept=".pdf,.jpg,.jpeg,.png"
//     onChange={(e) => handleFileUpload(e, 'aadhar_document')}
//     className="cursor-pointer h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs"
//   />
  
//   {formData.aadhar_document && (
//     <div className="flex items-center justify-between text-[10px] sm:text-xs p-1.5 sm:p-2 bg-gray-50 rounded mt-1">
//       <span className="truncate max-w-[150px] sm:max-w-[200px]">
//         {formData.aadhar_document.name}
//       </span>
//       <button
//         type="button"
//         onClick={() => handleRemoveDocument('aadhar_document')}
//         className="text-red-600 hover:text-red-800 text-sm font-bold"
//         title="Remove document"
//       >
//         ×
//       </button>
//     </div>
//   )}
  
//   {/* Check for both existence and not null/undefined - using strict comparison */}
//   {!formData.aadhar_document && 
//    formData.aadhar_document_url && 
//    formData.aadhar_document_url !== null && 
//    formData.aadhar_document_url !== "" && 
//    formData.aadhar_document_url !== "null" && (
//     <div className="flex items-center justify-between text-[10px] sm:text-xs p-1.5 sm:p-2 bg-gray-50 rounded mt-1">
//       <span className="truncate max-w-[150px] sm:max-w-[200px]">
//         Aadhar document uploaded
//       </span>
//       <div className="flex gap-1.5 sm:gap-2">
//         <a
//           href={formData.aadhar_document_url}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
//           title="View document"
//         >
//           <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//           <span className="hidden sm:inline">View</span>
//         </a>
//         <button
//           type="button"
//           onClick={() => handleRemoveDocument('aadhar_document')}
//           className="text-red-600 hover:text-red-800 text-sm font-bold"
//           title="Remove document"
//         >
//           ×
//         </button>
//       </div>
//     </div>
//   )}
// </div>

//             {/* PAN Card */}
//             <div className="space-y-1.5 sm:space-y-2">
//               <Label className="text-[10px] sm:text-xs">PAN Card (PDF/Image)</Label>
//               <Input
//                 type="file"
//                 accept=".pdf,.jpg,.jpeg,.png"
//                 onChange={(e) => handleFileUpload(e, 'pan_document')}
//                 className="cursor-pointer h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs"
//               />
              
//               {formData.pan_document && (
//                 <div className="flex items-center justify-between text-[10px] sm:text-xs p-1.5 sm:p-2 bg-gray-50 rounded mt-1">
//                   <span className="truncate max-w-[150px] sm:max-w-[200px]">
//                     {formData.pan_document.name}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveDocument('pan_document')}
//                     className="text-red-600 hover:text-red-800 text-sm font-bold"
//                     title="Remove document"
//                   >
//                     ×
//                   </button>
//                 </div>
//               )}
              
//               {!formData.pan_document && formData.pan_document_url && formData.pan_document_url !== "" && (
//                 <div className="flex items-center justify-between text-[10px] sm:text-xs p-1.5 sm:p-2 bg-gray-50 rounded mt-1">
//                   <span className="truncate max-w-[150px] sm:max-w-[200px]">
//                     PAN document uploaded
//                   </span>
//                   <div className="flex gap-1.5 sm:gap-2">
//                     <a
//                       href={formData.pan_document_url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
//                       title="View document"
//                     >
//                       <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                       <span className="hidden sm:inline">View</span>
//                     </a>
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveDocument('pan_document')}
//                       className="text-red-600 hover:text-red-800 text-sm font-bold"
//                       title="Remove document"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Photo */}
//             <div className="space-y-1.5 sm:space-y-2">
//               <Label className="text-[10px] sm:text-xs">Passport Size Photo (Image)</Label>
//               <Input
//                 type="file"
//                 accept=".jpg,.jpeg,.png"
//                 onChange={(e) => handleFileUpload(e, 'photo')}
//                 className="cursor-pointer h-8 sm:h-9 md:h-10 text-[10px] sm:text-xs"
//               />
              
//               {formData.photo && (
//                 <div className="flex items-center justify-between text-[10px] sm:text-xs p-1.5 sm:p-2 bg-gray-50 rounded mt-1">
//                   <span className="truncate max-w-[150px] sm:max-w-[200px]">
//                     {formData.photo.name}
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveDocument('photo')}
//                     className="text-red-600 hover:text-red-800 text-sm font-bold"
//                     title="Remove document"
//                   >
//                     ×
//                   </button>
//                 </div>
//               )}
              
//               {!formData.photo && formData.photo_url && formData.photo_url !== "" && (
//                 <div className="flex items-center justify-between text-[10px] sm:text-xs p-1.5 sm:p-2 bg-gray-50 rounded mt-1">
//                   <span className="truncate max-w-[150px] sm:max-w-[200px]">
//                     Photo uploaded
//                   </span>
//                   <div className="flex gap-1.5 sm:gap-2">
//                     <a
//                       href={formData.photo_url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
//                       title="View photo"
//                     >
//                       <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
//                       <span className="hidden sm:inline">View</span>
//                     </a>
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveDocument('photo')}
//                       className="text-red-600 hover:text-red-800 text-sm font-bold"
//                       title="Remove photo"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StaffForm;

// components/admin/staff/StaffForm.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Droplets,
  FileText,
  Hash,
  IndianRupee,
  Calendar,
  Home,
  Building,
  AlertCircle,
  CreditCard,
  Upload,
  Eye,
  EyeOff,
  Lock,
  ChevronRight,
} from "lucide-react";
import { StaffMember } from "@/lib/staffApi";
import { useState } from "react";

interface StaffFormProps {
  formData: {
    salutation: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    whatsapp_number: string;
    is_whatsapp_same: boolean;
    blood_group: string;
    aadhar_number: string;
    pan_number: string;
    role: string;
    employee_id: string;
    salary: string;
    department: string;
    joining_date: string;
    current_address: string;
    phone_country_code: string;
    permanent_address: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relation: string;
    bank_account_holder_name: string;
    bank_account_number: string;
    bank_name: string;
    bank_ifsc_code: string;
    upi_id: string;
    aadhar_document: File | null;
    pan_document: File | null;
    photo: File | null;
    aadhar_document_url: string;
    pan_document_url: string;
    photo_url: string;
    is_active: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  editingStaff: StaffMember | null;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: "aadhar_document" | "pan_document" | "photo"
  ) => void;
  handleRemoveDocument: (
    documentType: "aadhar_document" | "pan_document" | "photo"
  ) => void;
  roles?: Array<{ id: number; name: string }>;
  departments?: Array<{ id: number; name: string }>;
  loadingMasters?: boolean;
  passwordErrors?: { password?: string; confirmPassword?: string };
}

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
];

/* ─── Shared style tokens ─────────────────────────────── */
// placeholder:text-slate-500 gives noticeably darker placeholder text
const inputCls =
  "h-8 text-xs border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 " +
  "transition-colors rounded-md placeholder:text-slate-500 placeholder:font-normal";

const selectCls = "h-8 text-xs border-slate-200 bg-slate-50 focus:bg-white";

const textareaCls =
  "text-xs border-slate-200 bg-slate-50 focus:bg-white resize-none rounded-md " +
  "placeholder:text-slate-500 placeholder:font-normal";

/* ─── Sub-components ──────────────────────────────────── */
type Accent = "slate" | "blue" | "green" | "orange" | "purple";

const accentMap: Record<Accent, { bg: string; text: string }> = {
  slate:  { bg: "bg-slate-100",  text: "text-slate-500"  },
  blue:   { bg: "bg-blue-100",   text: "text-blue-500"   },
  green:  { bg: "bg-green-100",  text: "text-green-600"  },
  orange: { bg: "bg-orange-100", text: "text-orange-500" },
  purple: { bg: "bg-purple-100", text: "text-purple-500" },
};

const SectionHeader = ({
  icon: Icon,
  label,
  accent = "slate",
}: {
  icon: any;
  label: string;
  accent?: Accent;
}) => {
  const { bg, text } = accentMap[accent];
  return (
    <div className="flex items-center gap-2 pb-1.5 mb-2 border-b border-slate-100">
      <span className={`p-1 rounded-md ${bg}`}>
        <Icon className={`h-3 w-3 ${text}`} />
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-black">
        {label}
      </span>
    </div>
  );
};

const Field = ({
  label,
  required,
  children,
  error,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  className?: string;
}) => (
  <div className={`space-y-1 ${className}`}>
    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-0.5">
      {label}
      {required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[10px] text-rose-500 mt-0.5">{error}</p>}
  </div>
);

const PwdInput = ({
  id,
  value,
  onChange,
  placeholder,
  show,
  onToggle,
  error,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  error?: string;
}) => (
  <div className="relative">
    <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
    <Input
      id={id}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`${inputCls} pl-7 pr-8 ${error ? "border-rose-400" : ""}`}
      required
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
    >
      {show ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
    </button>
  </div>
);

/* DocRow — shows either new-file chip or existing-url chip */
const DocRow = ({
  exists,
  name,
  url,
  onRemove,
}: {
  exists: boolean;
  name?: string;
  url?: string;
  onRemove: () => void;
}) => {
  if (!exists && (!url || url === "" || url === "null")) return null;
  return (
    <div
      className={`flex items-center justify-between text-[10px] px-2.5 py-1.5 rounded-md border mt-1 ${
        exists
          ? "bg-violet-50 border-violet-100 text-violet-700"
          : "bg-sky-50 border-sky-100 text-sky-700"
      }`}
    >
      <span className="truncate max-w-[160px]">
        {exists ? name : "Uploaded"}
      </span>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        {!exists && url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 hover:opacity-70 transition-opacity"
          >
            <Eye className="h-3 w-3" />
            <span>View</span>
          </a>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="text-rose-400 hover:text-rose-600 font-bold text-sm leading-none transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────── */
const StaffForm = ({
  formData,
  setFormData,
  editingStaff,
  handleFileUpload,
  handleRemoveDocument,
  roles = [],
  departments = [],
  loadingMasters = false,
  passwordErrors = {},
}: StaffFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // Convenience updater — preserves all existing logic
  const update = (patch: Partial<typeof formData>) =>
    setFormData({ ...formData, ...patch });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full">

      {/* ══════════════════════════════════════════
          COLUMN 1 — Personal Information
      ══════════════════════════════════════════ */}
      <div className="flex flex-col gap-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <SectionHeader icon={User} label="Personal Info" accent="blue" />

        {/* Salutation + Full Name */}
        <div className="grid grid-cols-[100px_1fr] gap-2">
          <Field label="Salutation">
            <Select
              value={formData.salutation}
              onValueChange={(v) => update({ salutation: v })}
            >
              <SelectTrigger className={selectCls}>
                <SelectValue placeholder="Title" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mr">Mr.</SelectItem>
                <SelectItem value="mrs">Mrs.</SelectItem>
                <SelectItem value="miss">Miss</SelectItem>
                <SelectItem value="dr">Dr.</SelectItem>
                <SelectItem value="prof">Prof.</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Full Name" required>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => update({ name: e.target.value })}
              className={inputCls}
              required
            />
          </Field>
        </div>

        {/* Email */}
        <Field label="Email Address" required>
          <div className="relative">
            <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => update({ email: e.target.value })}
              className={`${inputCls} pl-7`}
              required
            />
          </div>
        </Field>

        {/* Password — create mode */}
        {!editingStaff ? (
          <div className="grid grid-cols-2 gap-2">
            <Field label="Password" required error={passwordErrors.password}>
              <PwdInput
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => update({ password: e.target.value })}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                error={passwordErrors.password}
              />
            </Field>
            <Field
              label="Confirm Password"
              required
              error={passwordErrors.confirmPassword}
            >
              <PwdInput
                id="confirmPassword"
                placeholder="Confirm"
                value={formData.confirmPassword}
                onChange={(e) => update({ confirmPassword: e.target.value })}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                error={passwordErrors.confirmPassword}
              />
            </Field>
          </div>
        ) : (
          /* Password — edit mode */
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setChangePassword(true)}
              className="h-8 text-xs border-dashed border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-700 w-full"
            >
              <Lock className="h-3 w-3 mr-1.5" />
              Change Password
            </Button>

            <Dialog
              open={changePassword}
              onOpenChange={(open) => {
                setChangePassword(open);
                if (!open) {
                  update({ password: "", confirmPassword: "" });
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }
              }}
            >
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="text-sm font-semibold">
                    Change Password
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-3">
                  <Field
                    label="New Password"
                    required
                    error={passwordErrors.password}
                  >
                    <PwdInput
                      id="password"
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={(e) => update({ password: e.target.value })}
                      show={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                      error={passwordErrors.password}
                    />
                  </Field>
                  <Field
                    label="Confirm New Password"
                    required
                    error={passwordErrors.confirmPassword}
                  >
                    <PwdInput
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        update({ confirmPassword: e.target.value })
                      }
                      show={showConfirmPassword}
                      onToggle={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      error={passwordErrors.confirmPassword}
                    />
                  </Field>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setChangePassword(false);
                      update({ password: "", confirmPassword: "" });
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      // Your existing validation logic will run from parent
                      setChangePassword(false);
                    }}
                  >
                    Save Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Phone Number */}
        <Field label="Phone Number" required>
          <div className="flex gap-1.5">
            <Select
              value={formData.phone_country_code}
              onValueChange={(v) => update({ phone_country_code: v })}
            >
              <SelectTrigger className={`${selectCls} w-[105px] shrink-0`}>
                <SelectValue placeholder="+91" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {COUNTRY_CODES.map(({ code, flag, name }) => (
                  <SelectItem key={code} value={code}>
                    {flag} {code} {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                update({ phone: onlyNumbers });
              }}
              className={`${inputCls} flex-1`}
              required
              maxLength={10}
              inputMode="numeric"
            />
          </div>
        </Field>

        {/* WhatsApp */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-green-500" />
              WhatsApp
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-500">Same as phone</span>
              <Switch
                checked={formData.is_whatsapp_same}
                onCheckedChange={(checked) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    is_whatsapp_same: checked,
                    whatsapp_number: checked
                      ? prev.phone
                      : prev.whatsapp_number,
                  }));
                }}
                className="scale-75 origin-right"
              />
            </div>
          </div>
          {formData.is_whatsapp_same ? (
            <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-md text-[11px] text-slate-500">
              Using: {formData.phone}
            </div>
          ) : (
            <Input
              placeholder="Enter WhatsApp number"
              value={formData.whatsapp_number}
              onChange={(e) => update({ whatsapp_number: e.target.value })}
              disabled={formData.is_whatsapp_same}
              className={inputCls}
            />
          )}
        </div>

        {/* Blood Group */}
        <Field label="Blood Group">
          <Select
            value={formData.blood_group}
            onValueChange={(v) => update({ blood_group: v })}
          >
            <SelectTrigger className={selectCls}>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_specified">Not Specified</SelectItem>
              {bloodGroups.map((group) => (
                <SelectItem key={group} value={group.toLowerCase()}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* KYC Details */}
        <div className="pt-0.5">
          <SectionHeader icon={FileText} label="KYC Details" accent="blue" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Aadhar No.">
              <Input
                id="aadhar_number"
                placeholder="XXXX XXXX XXXX"
                value={formData.aadhar_number}
                onChange={(e) => update({ aadhar_number: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="PAN No.">
              <Input
                id="pan_number"
                placeholder="ABCDE1234F"
                value={formData.pan_number}
                onChange={(e) => update({ pan_number: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          COLUMN 2 — Job Info + Address + Emergency
      ══════════════════════════════════════════ */}
      <div className="flex flex-col gap-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <SectionHeader icon={Building} label="Job Details" accent="slate" />

        {/* Employee ID + Salary */}
        <div className="grid grid-cols-2 gap-2">
          <Field label="Employee ID">
            <div className="relative">
              <Hash className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
              <Input
                id="employee_id"
                placeholder="EMP-001"
                value={formData.employee_id}
                onChange={(e) => update({ employee_id: e.target.value })}
                className={`${inputCls} pl-7`}
              />
            </div>
          </Field>
          <Field label="Salary (₹)">
            <div className="relative">
              <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
              <Input
                id="salary"
                type="number"
                placeholder="25000"
                value={formData.salary}
                onChange={(e) => update({ salary: e.target.value })}
                className={`${inputCls} pl-7`}
              />
            </div>
          </Field>
        </div>

        {/* Department + Role */}
        <div className="grid grid-cols-2 gap-2">
          <Field label="Department">
            <Select
              value={formData.department}
              onValueChange={(v) => {
                const selectedDept = departments.find(
                  (d) => d.id.toString() === v
                );
                setFormData({
                  ...formData,
                  department: v,
                  department_name: selectedDept?.name || v,
                });
              }}
            >
              <SelectTrigger className={selectCls}>
                <SelectValue
                  placeholder={
                    loadingMasters
                      ? "Loading…"
                      : departments.length === 0
                      ? "None"
                      : "Select"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {loadingMasters ? (
                  <SelectItem value="loading-departments" disabled>
                    Loading departments…
                  </SelectItem>
                ) : departments.length === 0 ? (
                  <SelectItem value="no-depts-found" disabled>
                    No departments available
                  </SelectItem>
                ) : (
                  departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Role" required>
            <Select
              value={formData.role}
              onValueChange={(v) => {
                const selectedRole = roles.find((r) => r.id.toString() === v);
                setFormData({
                  ...formData,
                  role: v,
                  role_name: selectedRole?.name || v,
                });
              }}
            >
              <SelectTrigger className={selectCls}>
                <SelectValue
                  placeholder={
                    loadingMasters
                      ? "Loading…"
                      : roles.length === 0
                      ? "None"
                      : "Select"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {loadingMasters ? (
                  <SelectItem value="loading-roles" disabled>
                    Loading roles…
                  </SelectItem>
                ) : roles.length === 0 ? (
                  <SelectItem value="no-roles-found" disabled>
                    No roles found in masters
                  </SelectItem>
                ) : (
                  roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!loadingMasters && roles.length === 0 && (
              <p className="text-[10px] text-amber-500 mt-0.5">
                No roles found. Please add roles in Masters → Roles → Role
              </p>
            )}
          </Field>
        </div>

        {/* Joining Date */}
        <Field label="Joining Date">
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            <Input
              id="joining_date"
              type="date"
              value={formData.joining_date}
              onChange={(e) => update({ joining_date: e.target.value })}
              className={`${inputCls} pl-7`}
            />
          </div>
        </Field>

        {/* Address Details */}
        <div className="pt-0.5">
          <SectionHeader icon={Home} label="Address Details" accent="green" />
          <div className="space-y-2">
            <Field label="Current Address">
              <Textarea
                placeholder="Enter current address"
                value={formData.current_address}
                onChange={(e) => update({ current_address: e.target.value })}
                rows={2}
                className={`${textareaCls} min-h-[56px]`}
              />
            </Field>
            <Field label="Permanent Address">
              <Textarea
                placeholder="Enter permanent address"
                value={formData.permanent_address}
                onChange={(e) => update({ permanent_address: e.target.value })}
                rows={2}
                className={`${textareaCls} min-h-[56px]`}
              />
            </Field>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="pt-0.5">
          <SectionHeader
            icon={AlertCircle}
            label="Emergency Contact"
            accent="orange"
          />
          <div className="space-y-2">
            <Field label="Contact Name">
              <Input
                id="emergency_contact_name"
                placeholder="Emergency contact person name"
                value={formData.emergency_contact_name}
                onChange={(e) =>
                  update({ emergency_contact_name: e.target.value })
                }
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Phone">
                <Input
                  id="emergency_contact_phone"
                  placeholder="9876543210"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => {
                    const cleanedValue = e.target.value.replace(/[^0-9]/g, "");
                    update({ emergency_contact_phone: cleanedValue });
                  }}
                  maxLength={10}
                  inputMode="numeric"
                  className={inputCls}
                />
              </Field>
              <Field label="Relation">
                <Input
                  id="emergency_contact_relation"
                  placeholder="Father/Mother"
                  value={formData.emergency_contact_relation}
                  onChange={(e) =>
                    update({ emergency_contact_relation: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          COLUMN 3 — Bank Details + Documents
          On md screens this spans both cols (full width)
          On xl it returns to its own column
      ══════════════════════════════════════════ */}
      <div className="flex flex-col gap-3 bg-white rounded-xl border border-slate-100 shadow-sm p-4 md:col-span-2 xl:col-span-1">
        <SectionHeader icon={CreditCard} label="Bank Details" accent="blue" />

        {/* On md this card is full-width, so we can use a 2-col sub-grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
          <Field label="Account Holder Name">
            <Input
              id="bank_account_holder_name"
              placeholder="Account holder name"
              value={formData.bank_account_holder_name}
              onChange={(e) =>
                update({ bank_account_holder_name: e.target.value })
              }
              className={inputCls}
            />
          </Field>

          <Field label="Account Number">
            <Input
              id="bank_account_number"
              placeholder="XXXX XXXX XXXX XXXX"
              value={formData.bank_account_number}
              onChange={(e) => update({ bank_account_number: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Bank Name">
            <Input
              id="bank_name"
              placeholder="Bank name"
              value={formData.bank_name}
              onChange={(e) => update({ bank_name: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="IFSC Code">
            <Input
              id="bank_ifsc_code"
              placeholder="ABCD0123456"
              value={formData.bank_ifsc_code}
              onChange={(e) => update({ bank_ifsc_code: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="UPI ID" className="sm:col-span-2 xl:col-span-1">
            <Input
              id="upi_id"
              placeholder="username@upi"
              value={formData.upi_id}
              onChange={(e) => update({ upi_id: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Documents Upload */}
        <div className="pt-0.5">
          <SectionHeader
            icon={Upload}
            label="Upload Documents"
            accent="purple"
          />

          {/* 3-across on sm/md (full-width card), stacked on xl (narrow col) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">

            {/* Aadhar Card */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Aadhar Card{" "}
                <span className="font-normal text-slate-400">(PDF/Image)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-slate-200 rounded-md px-3 py-2 hover:border-blue-300 hover:bg-blue-50/40 transition-colors group">
                <Upload className="h-3 w-3 text-slate-400 group-hover:text-blue-400 shrink-0" />
                <span className="text-[11px] text-slate-500 group-hover:text-blue-500 truncate">
                  Choose file…
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, "aadhar_document")}
                  className="hidden"
                />
              </label>
              <DocRow
                exists={!!formData.aadhar_document}
                name={formData.aadhar_document?.name}
                url={formData.aadhar_document_url}
                onRemove={() => handleRemoveDocument("aadhar_document")}
              />
            </div>

            {/* PAN Card */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">
                PAN Card{" "}
                <span className="font-normal text-slate-400">(PDF/Image)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-slate-200 rounded-md px-3 py-2 hover:border-blue-300 hover:bg-blue-50/40 transition-colors group">
                <Upload className="h-3 w-3 text-slate-400 group-hover:text-blue-400 shrink-0" />
                <span className="text-[11px] text-slate-500 group-hover:text-blue-500 truncate">
                  Choose file…
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, "pan_document")}
                  className="hidden"
                />
              </label>
              <DocRow
                exists={!!formData.pan_document}
                name={formData.pan_document?.name}
                url={formData.pan_document_url}
                onRemove={() => handleRemoveDocument("pan_document")}
              />
            </div>

            {/* Passport Photo */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Passport Photo{" "}
                <span className="font-normal text-slate-400">(Image)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-slate-200 rounded-md px-3 py-2 hover:border-blue-300 hover:bg-blue-50/40 transition-colors group">
                <Upload className="h-3 w-3 text-slate-400 group-hover:text-blue-400 shrink-0" />
                <span className="text-[11px] text-slate-500 group-hover:text-blue-500 truncate">
                  Choose file…
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, "photo")}
                  className="hidden"
                />
              </label>
              <DocRow
                exists={!!formData.photo}
                name={formData.photo?.name}
                url={formData.photo_url}
                onRemove={() => handleRemoveDocument("photo")}
              />
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default StaffForm;