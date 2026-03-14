// // components/admin/enquiries/components/EnquiryForm.tsx
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { CreateEnquiryPayload, UpdateEnquiryPayload } from "@/lib/enquiryApi";

// interface EnquiryFormProps {
//   formData: CreateEnquiryPayload | UpdateEnquiryPayload;
//   setFormData: React.Dispatch<React.SetStateAction<any>>;
//   properties: any[];
//   isEdit?: boolean;
//   currentStatus?: string;
//   onSubmit?: () => void;
//   submitLabel?: string;
// }

// const EnquiryForm = ({
//   formData,
//   setFormData,
//   properties,
//   isEdit = false,
//   currentStatus,
//   onSubmit,
//   submitLabel = "Submit",
// }: EnquiryFormProps) => {
//   return (
//     <div className="space-y-3 md:space-y-4">
//       {/* Name and Phone - Already 2 columns */}
//       <div className="grid grid-cols-2 gap-2 md:gap-4">
//         <div className="space-y-1 md:space-y-2">
//           <Label className="text-xs md:text-sm font-medium">Full Name *</Label>
//           <Input
//             value={formData.tenant_name}
//             onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
//             placeholder="John Doe"
//             required
//             className="h-8 md:h-10 text-xs md:text-sm"
//           />
//         </div>
//         <div className="space-y-1 md:space-y-2">
//           <Label className="text-xs md:text-sm font-medium">Phone *</Label>
//           <Input
//             value={formData.phone}
//             onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//             placeholder="9876543210"
//             maxLength={10}
//             required
//             className="h-8 md:h-10 text-xs md:text-sm"
//           />
//         </div>
//       </div>

//       {/* Email and Property - 2 columns on mobile */}
//       <div className="grid grid-cols-2 gap-2 md:gap-4">
//         <div className="space-y-1 md:space-y-2">
//           <Label className="text-xs md:text-sm font-medium">Email</Label>
//           <Input
//             type="email"
//             value={formData.email}
//             onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//             placeholder="john@example.com"
//             className="h-8 md:h-10 text-xs md:text-sm"
//           />
//         </div>
//         <div className="space-y-1 md:space-y-2">
//           <Label className="text-xs md:text-sm font-medium">Property *</Label>
//           <Select
//             value={formData.property_id}
//             onValueChange={(value) => setFormData({ ...formData, property_id: value })}
//           >
//             <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm">
//               <SelectValue placeholder="Select" />
//             </SelectTrigger>
//             <SelectContent>
//               {properties.length > 0 ? (
//                 properties.map((prop) => (
//                   <SelectItem key={prop.id} value={String(prop.id)} className="text-xs md:text-sm">
//                     {prop.name}
//                   </SelectItem>
//                 ))
//               ) : (
//                 <SelectItem value="no-property" disabled className="text-xs md:text-sm">
//                   No properties available
//                 </SelectItem>
//               )}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
      
//       {/* Status (Edit Mode Only) - Full width on mobile */}
//       {isEdit && (
//         <div className="grid grid-cols-1 gap-2 md:gap-4">
//           <div className="space-y-1 md:space-y-2">
//             <Label className="text-xs md:text-sm font-medium">Status</Label>
//             <Select
//               value={(formData as UpdateEnquiryPayload).status || currentStatus || "new"}
//               onValueChange={(value) => setFormData({ ...formData, status: value })}
//             >
//               <SelectTrigger className="h-8 md:h-10 text-xs md:text-sm">
//                 <SelectValue placeholder="Select status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="new" className="text-xs md:text-sm">New</SelectItem>
//                 <SelectItem value="contacted" className="text-xs md:text-sm">Contacted</SelectItem>
//                 <SelectItem value="interested" className="text-xs md:text-sm">Interested</SelectItem>
//                 <SelectItem value="not_interested" className="text-xs md:text-sm">Not Interested</SelectItem>
//                 <SelectItem value="converted" className="text-xs md:text-sm">Converted</SelectItem>
//                 <SelectItem value="closed" className="text-xs md:text-sm">Closed</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       )}
      
//       {/* Move-in Date and Budget - 2 columns on mobile */}
//       <div className="grid grid-cols-2 gap-2 md:gap-4">
//         <div className="space-y-1 md:space-y-2">
//           <Label className="text-xs md:text-sm font-medium">Move-in Date</Label>
//           <Input
//             type="date"
//             value={formData.preferred_move_in_date}
//             onChange={(e) => setFormData({ ...formData, preferred_move_in_date: e.target.value })}
//             className="h-8 md:h-10 text-xs md:text-sm"
//           />
//         </div>
//         <div className="space-y-1 md:space-y-2">
//           <Label className="text-xs md:text-sm font-medium">Budget Range</Label>
//           <Input
//             value={formData.budget_range}
//             onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
//             placeholder="e.g. 8000-12000"
//             className="h-8 md:h-10 text-xs md:text-sm"
//           />
//         </div>
//       </div>

//       {/* Message - Full width on mobile */}
//       <div className="grid grid-cols-1 gap-2 md:gap-4">
//         <div className="space-y-1 md:space-y-2">
//           <Label className="text-xs md:text-sm font-medium">Message</Label>
//           <Textarea
//             value={formData.message}
//             onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//             placeholder="Any additional details..."
//             rows={2}
//             className="text-xs md:text-sm resize-none min-h-[60px] md:min-h-[80px]"
//           />
//         </div>
//       </div>
      
//       {/* Submit Button */}
//       {onSubmit && (
//         <Button 
//           onClick={onSubmit} 
//           className="w-full mt-2 md:mt-4 h-8 md:h-10 text-xs md:text-sm"
//         >
//           {submitLabel}
//         </Button>
//       )}
//     </div>
//   );
// };

// export default EnquiryForm;

// components/admin/enquiries/EnquiryForm.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop-in replacement for the old EnquiryForm.
// • Default export  ← fixes "does not provide an export named 'default'"
// • Same props API as before (formData / setFormData / onSubmit / submitLabel /
//   isEdit / currentStatus / properties)
// • Adds 3 new fields: occupation_category, occupation, remark
// • Compact design matching staff / tenant form theme
// ─────────────────────────────────────────────────────────────────────────────



// components/admin/enquires/EnquiryForm.tsx
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button }   from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  User, Phone, Mail, Building, Calendar, IndianRupee,
  MessageSquare, Globe, Briefcase, StickyNote,
} from "lucide-react";
import { CreateEnquiryPayload, UpdateEnquiryPayload } from "@/lib/enquiryApi";

// ── Types ─────────────────────────────────────────────────────────────────────
interface EnquiryFormProps {
  formData:    CreateEnquiryPayload | UpdateEnquiryPayload | any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  properties:  { id: number | string; name: string }[];
  isEdit?:        boolean;
  currentStatus?: string;
  onSubmit?:      () => void;
  submitLabel?:   string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const OCCUPATION_CATEGORIES = [
  "Student", "Working Professional", "Government Employee",
  "Business Owner", "Freelancer / Self-Employed", "Retired", "Other",
];

const displayToStoredBudget: Record<string, string> = {
  "Under ₹5,000": "below-5000",
  "₹5,000 - ₹8,000": "5000-8000",
  "₹8,000 - ₹12,000": "8000-12000",
  "₹12,000 - ₹18,000": "12000-18000",
  "₹18,000 - ₹25,000": "18000-25000",
  "Above ₹25,000": "25000+",
};

// Map stored values to display values
const storedToDisplayBudget: Record<string, string> = {
  "below-5000": "Under ₹5,000",
  "5000-8000": "₹5,000 - ₹8,000",
  "8000-12000": "₹8,000 - ₹12,000",
  "12000-18000": "₹12,000 - ₹18,000",
  "18000-25000": "₹18,000 - ₹25,000",
  "25000+": "Above ₹25,000",
};

const SOURCES = [
  "website", "walkin", "phone", "referral",
  "social_media", "app", "other",
];

const STATUSES = [
  "new", "contacted", "interested",
  "not_interested", "converted", "closed",
];

const statusDot: Record<string, string> = {
  new:            "bg-blue-400",
  contacted:      "bg-yellow-400",
  interested:     "bg-purple-400",
  converted:      "bg-green-500",
  not_interested: "bg-gray-400",
  closed:         "bg-red-400",
  pending:        "bg-amber-400",
};

// ── Shared style tokens ───────────────────────────────────────────────────────
const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L  = "block text-[11px] font-semibold text-gray-500 mb-0.5";
const SI = "text-[11px] py-0.5";

// ── Section header ─────────────────────────────────────────────────────────────
const SH = ({
  icon, title, color = "text-blue-600",
}: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
    {icon} {title}
  </div>
);

// ── Icon wrapper ───────────────────────────────────────────────────────────────
const IconInput = ({
  icon, children,
}: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="relative">
    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
      {icon}
    </span>
    <span className="[&>*]:pl-7">{children}</span>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
const EnquiryForm = ({
  formData,
  setFormData,
  properties,
  isEdit       = false,
  currentStatus,
  onSubmit,
  submitLabel  = "Submit",
}: EnquiryFormProps) => {

  // Convenience updater
  const upd = (key: string, val: string) =>
    setFormData((p: any) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-5">

      {/* ══ SECTION 1 — Basic Info ══════════════════════════════════════════ */}
      <div>
        <SH icon={<User className="h-3 w-3" />} title="Basic Info" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">

          {/* Name */}
          <div>
            <label className={L}>Full Name <span className="text-red-400">*</span></label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              <Input className={`${F} pl-7`} placeholder="John Doe"
                value={formData.tenant_name ?? ""}
                onChange={e => upd("tenant_name", e.target.value)} />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className={L}>Phone <span className="text-red-400">*</span></label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              <Input className={`${F} pl-7`} placeholder="9876543210" maxLength={10}
                value={formData.phone ?? ""}
                onChange={e => upd("phone", e.target.value.replace(/\D/g, ""))} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={L}>Email</label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              <Input type="email" className={`${F} pl-7`} placeholder="john@example.com"
                value={formData.email ?? ""}
                onChange={e => upd("email", e.target.value)} />
            </div>
          </div>

          {/* Source */}
          <div>
            <label className={L}>Source</label>
            <Select value={formData.source ?? "website"} onValueChange={v => upd("source", v)}>
              <SelectTrigger className={F}>
                <Globe className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {SOURCES.map(s => (
                  <SelectItem key={s} value={s} className={SI}>
                    {s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ══ SECTION 2 — Occupation (NEW) ════════════════════════════════════ */}
      <div>
        <SH icon={<Briefcase className="h-3 w-3" />} title="Occupation" color="text-green-600" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">

          {/* Category */}
          <div>
            <label className={L}>Occupation Category</label>
            <Select
              value={formData.occupation_category ?? ""}
              onValueChange={v => upd("occupation_category", v)}
            >
              <SelectTrigger className={F}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {OCCUPATION_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c} className={SI}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Occupation / Role */}
          <div>
            <label className={L}>Occupation / Role</label>
            <div className="relative">
              <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              <Input className={`${F} pl-7`} placeholder="e.g. Software Engineer"
                value={formData.occupation ?? ""}
                onChange={e => upd("occupation", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 3 — Property Preference ════════════════════════════════ */}
      <div>
        <SH icon={<Building className="h-3 w-3" />} title="Property Preference" color="text-indigo-600" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">

          {/* Property */}
          <div>
            <label className={L}>Property <span className="text-red-400">*</span></label>
<Select
  value={formData.property_id ? String(formData.property_id) : ""}
  onValueChange={v => {
    const selectedProp = properties.find(p => String(p.id) === v);
    setFormData((p: any) => ({ 
      ...p, 
      property_id: v,
      property_name: selectedProp?.name || ""  // ← add this
    }));
  }}
>
              <SelectTrigger className={F}>
                <Building className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.length > 0 ? (
                  properties.map(p => (
                    <SelectItem key={p.id} value={String(p.id)} className={SI}>
                      {p.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__none__" disabled className={SI}>
                    No properties available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
         <div>
  <label className={L}>Budget Range <span className="text-red-400">*</span></label>
  <Select
    value={formData.budget_range ? 
      (storedToDisplayBudget[formData.budget_range] || formData.budget_range) 
      : ""}
    onValueChange={(value) => {
      // Convert display value back to stored value
      const storedValue = displayToStoredBudget[value] || value;
      upd("budget_range", storedValue);
    }}
  >
    <SelectTrigger className={F}>
      <IndianRupee className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
      <SelectValue placeholder="Select range" />
    </SelectTrigger>
    <SelectContent>
      {Object.keys(displayToStoredBudget).map(displayValue => (
        <SelectItem key={displayValue} value={displayValue} className={SI}>
          {displayValue}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

          {/* Move-in Date */}
          <div>
            <label className={L}>Preferred Move-in Date</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
              <Input type="date" className={`${F} pl-7`}
                value={formData.preferred_move_in_date ?? ""}
                onChange={e => upd("preferred_move_in_date", e.target.value)} />
            </div>
          </div>

          {/* Status — edit mode only */}
          {isEdit && (
            <div>
              <label className={L}>Status</label>
              <Select
                value={(formData as UpdateEnquiryPayload).status ?? currentStatus ?? "new"}
                onValueChange={v => upd("status", v)}
              >
                <SelectTrigger className={F}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s} className={SI}>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[s] ?? "bg-gray-300"}`} />
                        {s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* ══ SECTION 4 — Message & Remarks ══════════════════════════════════ */}
      <div>
        <SH icon={<MessageSquare className="h-3 w-3" />} title="Message & Remarks" color="text-amber-600" />
        <div className="space-y-2.5">

          {/* Message */}
          <div>
            <label className={L}>Message / Requirements</label>
            <Textarea
              className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[56px] resize-none transition-colors"
              placeholder="Any specific requirements or preferences from the enquirer…"
              rows={2}
              value={formData.message ?? ""}
              onChange={e => upd("message", e.target.value)}
            />
          </div>

          {/* Remark (NEW) */}
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
                className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[48px] resize-none pl-7 transition-colors"
                placeholder="Internal notes for staff (not visible to enquirer)…"
                rows={2}
                value={formData.remark ?? ""}
                onChange={e => upd("remark", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit button — only when onSubmit is passed (Add mode) */}
      {onSubmit && (
        <Button
          onClick={onSubmit}
          className="w-full h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm mt-1"
        >
          {submitLabel}
        </Button>
      )}
    </div>
  );
};

export default EnquiryForm;