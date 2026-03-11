

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