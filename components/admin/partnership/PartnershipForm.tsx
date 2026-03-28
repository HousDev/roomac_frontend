// components/admin/partnership/PartnershipForm.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Building2, User, Phone, Mail, MapPin, 
  MessageSquare, StickyNote, Building
} from "lucide-react";

interface PartnershipFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

// Property type options
const PROPERTY_TYPES = [
  "hotel", "hostel", "apartment", "resort", "villa", "other"
];

// Status options
const STATUSES = [
  { value: "new", label: "New", color: "bg-red-100 text-red-800" },
  { value: "contacted", label: "Contacted", color: "bg-blue-100 text-blue-800" },
  { value: "in_review", label: "In Review", color: "bg-yellow-100 text-yellow-800" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-gray-100 text-gray-800" }
];

// ── Shared style tokens ───────────────────────────────────────────────────────
const F = "h-8 text-[11px] rounded-md border-gray-200 focus:border-violet-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";
const SI = "text-[11px] py-0.5";

// ── Section header ─────────────────────────────────────────────────────────────
const SH = ({
  icon, title, color = "text-violet-600",
}: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
    {icon} {title}
  </div>
);

const PartnershipForm = ({
  formData,
  setFormData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Submit",
  isEdit = false,
}: PartnershipFormProps) => {

  const upd = (key: string, val: string | number) =>
    setFormData((p: any) => ({ ...p, [key]: val }));

  const propertyTypeDisplay: Record<string, string> = {
    hotel: "Hotel",
    hostel: "Hostel",
    apartment: "Apartment",
    resort: "Resort",
    villa: "Villa",
    other: "Other"
  };

  return (
    <div className="space-y-5">

      {/* ══ SECTION 1 — Company Details ══════════════════════════════════════════ */}
      <div>
        <SH icon={<Building2 className="h-3 w-3" />} title="Company Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5">

          {/* Company Name */}
          <div>
            <label className={L}>Company Name <span className="text-red-400">*</span></label>
            <div className="relative">
              <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              <Input 
                className={`${F} pl-7`} 
                placeholder="Enter company name"
                value={formData.company_name ?? ""}
                onChange={e => upd("company_name", e.target.value)} 
              />
            </div>
          </div>

          {/* Contact Person */}
          <div>
            <label className={L}>Contact Person <span className="text-red-400">*</span></label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              <Input 
                className={`${F} pl-7`} 
                placeholder="Enter contact person name"
                value={formData.contact_person ?? ""}
                onChange={e => upd("contact_person", e.target.value)} 
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={L}>Email <span className="text-red-400">*</span></label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              <Input 
                type="email"
                className={`${F} pl-7`} 
                placeholder="company@example.com"
                value={formData.email ?? ""}
                onChange={e => upd("email", e.target.value)} 
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className={L}>Phone <span className="text-red-400">*</span></label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              <Input 
                className={`${F} pl-7`} 
                placeholder="9876543210"
                maxLength={10}
                value={formData.phone ?? ""}
                onChange={e => upd("phone", e.target.value.replace(/\D/g, ""))} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 2 — Property Details ══════════════════════════════════════════ */}
      <div>
        <SH icon={<Building className="h-3 w-3" />} title="Property Details" color="text-indigo-600" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2.5">

          {/* Property Type */}
          <div>
            <label className={L}>Property Type <span className="text-red-400">*</span></label>
            <Select 
              value={formData.property_type ?? ""} 
              onValueChange={v => upd("property_type", v)}
            >
              <SelectTrigger className={F}>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type} className={SI}>
                    {propertyTypeDisplay[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Properties */}
          <div>
  <label className={L}>Number of Properties</label>
  <Input 
    type="number"
    className={F} 
    min="0"
    value={formData.property_count ?? ""}
    onChange={(e) => {
      const val = e.target.value;
      upd("property_count", val === "" ? "" : parseInt(val));
    }}
  />
</div>

          {/* Location */}
          <div className="sm:col-span-2">
            <label className={L}>Primary Location <span className="text-red-400">*</span></label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              <Input 
                className={`${F} pl-7`} 
                placeholder="City, State"
                value={formData.location ?? ""}
                onChange={e => upd("location", e.target.value)} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 3 — Status (only for edit) ═══════════════════════════════════ */}
      {isEdit && (
        <div>
          <SH icon={<Building2 className="h-3 w-3" />} title="Status" color="text-amber-600" />
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className={L}>Status</label>
              <Select 
                value={formData.status ?? "new"} 
                onValueChange={v => upd("status", v)}
              >
                <SelectTrigger className={F}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value} className={SI}>
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${status.color.replace('text-', 'bg-').replace('800', '500')}`} />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* ══ SECTION 4 — Message & Remarks ════════════════════════════════════════ */}
      <div>
        <SH icon={<MessageSquare className="h-3 w-3" />} title="Message & Remarks" color="text-amber-600" />
        <div className="space-y-2.5">

          {/* Message */}
          <div>
            <label className={L}>Additional Information</label>
            <Textarea
              className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-0 min-h-[56px] resize-none transition-colors"
              placeholder="Any specific requirements or additional information..."
              rows={2}
              value={formData.message ?? ""}
              onChange={e => upd("message", e.target.value)}
            />
          </div>

          {/* Remark */}
          <div>
            <label className={L}>
              Internal Remark
              <span className="ml-1.5 text-[9px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                Staff only
              </span>
            </label>
            <div className="relative">
              <StickyNote className="absolute left-2.5 top-2.5 h-3 w-3 text-gray-400 pointer-events-none" />
              <Textarea
                className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-400 focus:ring-0 min-h-[48px] resize-none pl-7 transition-colors"
                placeholder="Internal notes for staff (not visible to enquirer)…"
                rows={2}
                value={formData.remark ?? ""}
                onChange={e => upd("remark", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit button */}
      {onSubmit && (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg shadow-sm mt-1"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : submitLabel}
        </Button>
      )}
    </div>
  );
};

export default PartnershipForm;