


// components/admin/properties/PropertyForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  Plus,
  X,
  Camera,
  Home,
  Users,
  Wifi,
  Utensils,
  CalendarDays,
  Clock3,
  FileText,
  ShieldCheck,
  BadgeIndianRupee,
  Shield,
  Upload,
  Check,
  XSquare,
  ListChecks,
  Trash2,
  Loader2,
  AlertCircle,
  Receipt,
  Lock,
  Bell,
  Wrench,
  BookOpen,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { consumeMasters } from "@/lib/masterApi";
import { getAllStaff, type StaffMember } from "@/lib/staffApi";

// ─── Constants (unchanged) ───────────────────────────────────────────────────
const TERMS_TEMPLATES = [
  {
    id: "lockin",
    title: "Lock-in Period Terms",
    icon: Lock,
    header: "🔒 Minimum Lock-in Period",
    content: (property: any) =>
      `Minimum lock-in period of ${property.lockin_period_months || 3} months required.`,
    detailedContent: (property: any) =>
      `
1. The tenant agrees to a minimum lock-in period of ${property.lockin_period_months || 3} months.
2. Early termination before completing the lock-in period will result in a penalty.
3. Penalty for early exit: ${property.lockin_penalty_type === "percentage" ? `${property.lockin_penalty_amount}% of security deposit` : property.lockin_penalty_type === "rent" ? `One month's rent` : `₹${property.lockin_penalty_amount || 2000}`}.
4. The lock-in period starts from the date of agreement signing.
    `.trim(),
  },
  {
    id: "notice",
    title: "Notice Period Terms",
    icon: Bell,
    header: "📅 Notice Period",
    content: (property: any) =>
      `Notice period of ${Math.floor((property.notice_period_days || 30))} days required before vacating.`,
    detailedContent: (property: any) =>
      `
1. A notice period of ${property.notice_period_days || 30} days is required for vacating the premises.
2. Notice must be provided in writing to the property manager.
3. Failure to provide adequate notice will result in a penalty.
4. Penalty for non-compliance: ${property.notice_penalty_type === "percentage" ? `${property.notice_penalty_amount}% of security deposit` : property.notice_penalty_type === "rent" ? `One month's rent` : `₹${property.notice_penalty_amount || 5000}`}.
    `.trim(),
  },
];

type Property = {
  id: string;
  name: string;
  city_id?: string;
  state: string;
  area: string;
  address: string;
  total_rooms: number;
  total_beds: number;
  floor: number;
  starting_price: number;
  security_deposit: number;
  description?: string;
  property_manager_name: string;
  property_manager_phone: string;
  property_manager_email: string;
  property_manager_role: string;
  staff_id?: string | number;
  amenities: string[];
  services: string[];
  photo_urls: string[];
  property_rules?: string;
  is_active: boolean;
  lockin_period_months: number;
  lockin_penalty_amount: number;
  lockin_penalty_type: string;
  notice_period_days: number;
  notice_penalty_amount: number;
  notice_penalty_type: string;
  terms_conditions?: string;
  additional_terms?: string;
  tags?: string;
};

type PropertyFormData = {
  name: string;
  city_id: string;
  state: string;
  area: string;
  address: string;
  total_rooms: number;
  total_beds: number;
  floor: number | string;
  starting_price: number;
  security_deposit: number;
  description: string;
  property_manager_name: string;
  property_manager_phone: string;
  property_manager_email: string;
  property_manager_role: string;
  staff_id: string;
  amenities: string[];
  services: string[];
  photo_urls: string[];
  property_rules: string[];
  lockin_period_months: number | string;
  lockin_penalty_amount: number;
  lockin_penalty_type: string;
  notice_period_days: number | string;
  notice_penalty_amount: number;
  notice_penalty_type: string;
  terms_conditions: string;
  additional_terms: string[];
  custom_terms?: string[];
  tags: string[];
  map_embed_url?: string;
  map_direction_url?: string;
};

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode: boolean;
  selectedProperty: any;
  onSubmit: any;
  onReset: () => void;
  loading: boolean;
}

const commonAmenities = [
  "WiFi","AC","Parking","Laundry","Power Backup","Lift","CCTV","24/7 Security",
  "Gym","Swimming Pool","Garden","Terrace","TV","Refrigerator","Microwave","Geyser","Furnished",
];

const commonServices = [
  "Food Service","Room Cleaning","Laundry Service","Maintenance","Medical Assistance",
  "Transportation","Package Handling","Concierge","Housekeeping",
];

interface MasterValue {
  id: number;
  name: string;
  isactive: number;
}

const PENALTY_TYPE_OPTIONS = [
  { id: 1, value: "Fixed", code: "fixed" },
  { id: 2, value: "Percentage", code: "percentage" },
];

// ─── Shared style tokens ──────────────────────────────────────────────────────
const inputCls = "h-7 text-[11px] border-slate-200 bg-slate-50 focus:bg-white placeholder:text-slate-400 rounded-md";
const labelCls = "text-[10px] font-semibold text-slate-600 mb-0.5 block";
const sectionHeadCls = "text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-2";

// ─── MultiSelect (outside component to prevent remount) ───────────────────────
const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder,
  disabled,
}: {
  options: MasterValue[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (name: string) => {
    if (selected.includes(name)) onChange(selected.filter((v) => v !== name));
    else onChange([...selected, name]);
  };

  return (
    <div ref={ref} className="relative space-y-1.5">
      <div
        onClick={() => { if (!disabled) setOpen((p) => !p); }}
        className={`min-h-7 w-full px-2.5 py-1 border border-slate-200 rounded-md text-[11px] flex items-center cursor-pointer select-none bg-slate-50 ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400"
        }`}
      >
        <span className="text-slate-400 flex-1 text-[11px]">
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <svg className={`h-3 w-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </div>

      {open && (
        <div className="absolute z-[99999] top-full left-0 w-full mt-0.5 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {disabled ? (
            <div className="px-3 py-2 text-[10px] text-slate-500 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading...
            </div>
          ) : options.length > 0 ? (
            options.map((option) => {
              const isSelected = selected.includes(option.name);
              return (
                <div
                  key={option.id}
                  onClick={(e) => { e.stopPropagation(); toggle(option.name); }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 cursor-pointer select-none transition-colors ${
                    isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"
                  }`}>
                    {isSelected && <Check className="h-2 w-2 text-white" />}
                  </div>
                  <span className={`text-[11px] ${isSelected ? "text-blue-700 font-medium" : "text-slate-700"}`}>
                    {option.name}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-[11px] text-slate-500">No options available</div>
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 p-1.5 bg-slate-50 rounded-md border border-slate-100">
          {selected.map((value) => (
            <span key={value} className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
              {value}
              <button type="button" onClick={(e) => { e.stopPropagation(); toggle(value); }} className="ml-0.5 hover:text-red-500">
                <X className="h-2 w-2" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
const F = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-0.5">
    <label className={labelCls}>{label}{required && <span className="text-rose-400 ml-0.5">*</span>}</label>
    {children}
  </div>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SH = ({ icon: Icon, label, color = "text-black" }: { icon: any; label: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[11px] font-bold mb-2 pb-1 border-b border-slate-100 ${color}`}>
    <Icon className="h-3 w-3 flex-shrink-0" />
    <span className="uppercase tracking-wide">{label}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PropertyForm({
  open,
  onOpenChange,
  editMode,
  selectedProperty,
  onSubmit,
  onReset,
  loading,
}: PropertyFormProps) {

  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<PropertyFormData>({
    name: "", city_id: "", state: "", area: "", address: "",
    total_rooms: 0, total_beds: 0, floor: 0,
    starting_price: 0, security_deposit: 0, description: "",
    property_manager_name: "", property_manager_phone: "",
    property_manager_email: "", property_manager_role: "",
    staff_id: "", amenities: [], services: [], photo_urls: [],
    property_rules: [], lockin_period_months: "",
    lockin_penalty_amount: 0, lockin_penalty_type: "fixed",
    notice_period_days: "", notice_penalty_amount: 0,
    notice_penalty_type: "fixed", terms_conditions: "",
    additional_terms: [], custom_terms: [], tags: [],
  });

  const [amenityInput, setAmenityInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [removedPhotoUrls, setRemovedPhotoUrls] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [customTerms, setCustomTerms] = useState<string[]>([]);
  const [newTerm, setNewTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [managerRole, setManagerRole] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [commonMasters, setCommonMasters] = useState<Record<string, MasterValue[]>>({});
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [propertiesMasters, setPropertiesMasters] = useState<Record<string, MasterValue[]>>({});
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [selectedAdditionalTerms, setSelectedAdditionalTerms] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tabs = ["basic", "amenities", "terms", "photos"];

  

  const goToNextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
  };

  const goToPrevTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
  };

  // ── All data fetching logic (UNCHANGED) ──────────────────────────────────
  const fetchCommonMasters = async () => {
    setLoadingMasters(true);
    try {
      const res = await consumeMasters({ tab: "Common" });
      if (res?.success && res.data) {
        const grouped: Record<string, MasterValue[]> = {};
        res.data.forEach((item: any) => {
          const type = item.type_name;
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push({ id: item.value_id, name: item.value_name, isactive: 1 });
        });
        setCommonMasters(grouped);
      }
    } catch (error) {
      console.error("Failed to fetch common masters:", error);
    } finally {
      setLoadingMasters(false);
    }
  };

  const fetchPropertiesMasters = async () => {
    setLoadingMasters(true);
    try {
      const res = await consumeMasters({ tab: "Properties" });
      if (res?.success && res.data) {
        const grouped: Record<string, MasterValue[]> = {};
        res.data.forEach((item: any) => {
          const type = item.type_name;
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push({ id: item.value_id, name: item.value_name, isactive: 1 });
        });
        setPropertiesMasters(grouped);
      }
    } catch (error) {
      console.error("Failed to fetch properties masters:", error);
    } finally {
      setLoadingMasters(false);
    }
  };

  const getFullPhotoUrl = (photoUrl: string | null) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith("http") || photoUrl.startsWith("blob:")) return photoUrl;
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const cleanUrl = photoUrl.startsWith("/") ? photoUrl.substring(1) : photoUrl;
    return `${apiUrl}/${cleanUrl}`;
  };

  const getSalutationDisplay = (salutation: string) => {
    const salutations: Record<string, string> = {
      mr: "Mr.", mrs: "Mrs.", miss: "Miss", dr: "Dr.", prof: "Prof.",
    };
    return salutations[salutation] || "";
  };

  useEffect(() => {
    if (selectedProperty && editMode) {
      const photoUrls = Array.isArray(selectedProperty.photo_urls) ? selectedProperty.photo_urls : [];
      const uniquePhotoUrls = [...new Set(photoUrls)];

      let parsedPropertyRules = [];
      if (selectedProperty.property_rules) {
        try { parsedPropertyRules = JSON.parse(selectedProperty.property_rules); }
        catch { parsedPropertyRules = Array.isArray(selectedProperty.property_rules) ? selectedProperty.property_rules : selectedProperty.property_rules ? [selectedProperty.property_rules] : []; }
      }

      let parsedAdditionalTerms = [];
      if (selectedProperty.additional_terms) {
        try { parsedAdditionalTerms = JSON.parse(selectedProperty.additional_terms); }
        catch { parsedAdditionalTerms = Array.isArray(selectedProperty.additional_terms) ? selectedProperty.additional_terms : selectedProperty.additional_terms ? [selectedProperty.additional_terms] : []; }
      }

      let parsedTags = [];
      if (selectedProperty.tags) {
        try { parsedTags = JSON.parse(selectedProperty.tags); }
        catch { parsedTags = Array.isArray(selectedProperty.tags) ? selectedProperty.tags : selectedProperty.tags ? [selectedProperty.tags] : []; }
      }

      const initialFormData = {
        name: selectedProperty.name || "",
        city_id: selectedProperty.city_id || "",
        state: selectedProperty.state || "",
        area: selectedProperty.area || "",
        address: selectedProperty.address || "",
        map_embed_url: selectedProperty.map_embed_url || "", // ADD THIS
      map_direction_url: selectedProperty.map_direction_url || "", // ADD THIS
        total_rooms: selectedProperty.total_rooms || 0,
        total_beds: selectedProperty.total_beds || 0,
        floor: selectedProperty.floor || "",
        starting_price: selectedProperty.starting_price || 0,
        security_deposit: selectedProperty.security_deposit || 0,
        description: selectedProperty.description || "",
        property_manager_name: selectedProperty.property_manager_name || "",
        property_manager_phone: selectedProperty.property_manager_phone || "",
        property_manager_email: selectedProperty.property_manager_email || "",
        property_manager_role: selectedProperty.property_manager_role || "",
        staff_id: selectedProperty.staff_id ? String(selectedProperty.staff_id) : "",
        amenities: Array.isArray(selectedProperty.amenities) ? selectedProperty.amenities : [],
        services: Array.isArray(selectedProperty.services) ? selectedProperty.services : [],
        photo_urls: uniquePhotoUrls,
        property_rules: parsedPropertyRules,
        lockin_period_months: selectedProperty.lockin_period_months || "",
        lockin_penalty_amount: selectedProperty.lockin_penalty_amount || 0,
        lockin_penalty_type: selectedProperty.lockin_penalty_type || "fixed",
        notice_period_days: selectedProperty.notice_period_days || "",
        notice_penalty_amount: selectedProperty.notice_penalty_amount || 0,
        notice_penalty_type: selectedProperty.notice_penalty_type || "fixed",
        terms_conditions: selectedProperty.terms_conditions || "",
        additional_terms: parsedAdditionalTerms,
        custom_terms: [],
        tags: parsedTags,
      };

      setFormData(initialFormData);
      setSelectedRules(parsedPropertyRules);
      setSelectedAdditionalTerms(parsedAdditionalTerms);
      setSelectedTags(parsedTags);
      setExistingPhotoUrls(uniquePhotoUrls as string[]);
      setPhotoFiles([]);
      setRemovedPhotoUrls([]);
      setPhotoPreviews(
        (uniquePhotoUrls as string[]).map((url: string) => {
          if (url.startsWith("http") || url.startsWith("blob:")) return url;
          const apiUrl = import.meta.env.VITE_API_URL || "";
          const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
          return `${apiUrl}/${cleanUrl}`;
        }),
      );

      const existingTerms = selectedProperty.terms_conditions || "";
      const customTermsList = existingTerms.split("\n").filter(
        (term: string) => term.trim() && !TERMS_TEMPLATES.some(
          (template) => term.includes(template.header) || existingTerms.includes(template.detailedContent(selectedProperty)),
        ),
      );
      setCustomTerms(customTermsList);
      setSelectedTerms([]);
      setError(null);

      const matchingStaff =
        staffList.find((s) => String(s.id) === String(selectedProperty.staff_id)) ||
        staffList.find((s) => s.name === selectedProperty.property_manager_name);

      
      if (matchingStaff) {
        setSelectedStaff(matchingStaff);
        setSelectedStaffId(String(matchingStaff.id));
        setManagerRole(matchingStaff.role_name || "");
        setManagerEmail(matchingStaff.email || "");
      } else {
        setSelectedStaff(null);
        setSelectedStaffId(selectedProperty.staff_id ? String(selectedProperty.staff_id) : "");
        setManagerRole(selectedProperty.role_name || "");
        setManagerEmail(selectedProperty.property_manager_email || "");
      }
    } else {
      resetForm();
    }
  }, [selectedProperty, editMode, staffList]);

  useEffect(() => {
    if (editMode && selectedProperty && Object.keys(commonMasters).length > 0 && Object.keys(propertiesMasters).length > 0) {
      setFormData(prev => {
        const updates: Partial<PropertyFormData> = {};

        if (selectedProperty.state) {
          const stateId = String(selectedProperty.state);
          const matchingState = commonMasters["States"]?.find(state => String(state.id) === stateId || state.name === stateId);
          if (matchingState) updates.state = String(matchingState.id);
        }

        if (selectedProperty.floor) {
          const floorValue = String(selectedProperty.floor);
          const matchingFloor = propertiesMasters["Floors"]?.find(floor => String(floor.id) === floorValue || floor.name === floorValue);
          if (matchingFloor) updates.floor = matchingFloor.name;
        }

        if (selectedProperty.lockin_period_months) {
          const lockinPeriodNum = Number(selectedProperty.lockin_period_months);
          const matchingOption = propertiesMasters["Lock-in Period"]?.find(option => parseInt(option.name) === lockinPeriodNum);
          if (matchingOption) updates.lockin_period_months = matchingOption.name;
        }

        if (selectedProperty.notice_period_days) {
          const noticePeriodNum = Number(selectedProperty.notice_period_days);
          const matchingOption = propertiesMasters["Notice Period"]?.find(option => parseInt(option.name) === noticePeriodNum);
          if (matchingOption) updates.notice_period_days = matchingOption.name;
        }

        if (Object.keys(updates).length > 0) {
          return { ...prev, ...updates };
        }
        return prev;
      });

      if (selectedProperty.property_rules && propertiesMasters["Property Rules"]) {
        const ruleIds = Array.isArray(selectedProperty.property_rules)
          ? selectedProperty.property_rules
          : JSON.parse(selectedProperty.property_rules || '[]');
        const ruleNames = ruleIds.map((id: string | number) => {
          const matchingRule = propertiesMasters["Property Rules"].find(rule => rule.id === Number(id) || rule.name === String(id));
          return matchingRule ? matchingRule.name : String(id);
        }).filter(Boolean);
        setSelectedRules(ruleNames);
      }

      if (selectedProperty.additional_terms && propertiesMasters["Additional Terms"]) {
        const termIds = Array.isArray(selectedProperty.additional_terms)
          ? selectedProperty.additional_terms
          : JSON.parse(selectedProperty.additional_terms || '[]');
        const termNames = termIds.map((id: string | number) => {
          const matchingTerm = propertiesMasters["Additional Terms"].find(term => term.id === Number(id) || term.name === String(id));
          return matchingTerm ? matchingTerm.name : String(id);
        }).filter(Boolean);
        setSelectedAdditionalTerms(termNames);
      }
    }
  }, [commonMasters, propertiesMasters, editMode, selectedProperty]);

  useEffect(() => {
    if (open) {
      const loadData = async () => {
        setLoadingMasters(true);
        try {
          await Promise.all([fetchPropertiesMasters(), fetchCommonMasters(), loadStaffList()]);
          if (editMode && selectedProperty) initializeFormWithMasters();
        } catch (error) {
          console.error("Failed to load masters:", error);
        } finally {
          setLoadingMasters(false);
        }
      };
      loadData();
    } else {
      setError(null);
    }
  }, [open]);

  const initializeFormWithMasters = () => {
    if (!selectedProperty) return;


    const photoUrls = Array.isArray(selectedProperty.photo_urls) ? selectedProperty.photo_urls : [];
    const uniquePhotoUrls = [...new Set(photoUrls)];

    let parsedPropertyRules = [];
    if (selectedProperty.property_rules) {
      try { parsedPropertyRules = JSON.parse(selectedProperty.property_rules);  }
      catch { parsedPropertyRules = Array.isArray(selectedProperty.property_rules) ? selectedProperty.property_rules : selectedProperty.property_rules ? [selectedProperty.property_rules] : []; }
    }

    let parsedAdditionalTerms = [];
    if (selectedProperty.additional_terms) {
      try { parsedAdditionalTerms = JSON.parse(selectedProperty.additional_terms); }
      catch { parsedAdditionalTerms = Array.isArray(selectedProperty.additional_terms) ? selectedProperty.additional_terms : selectedProperty.additional_terms ? [selectedProperty.additional_terms] : []; }
    }

    let parsedTags = [];
    if (selectedProperty.tags) {
      try { parsedTags = JSON.parse(selectedProperty.tags); }
      catch { parsedTags = Array.isArray(selectedProperty.tags) ? selectedProperty.tags : selectedProperty.tags ? [selectedProperty.tags] : []; }
    }

    let stateValue = "";
    if (selectedProperty.state && commonMasters["States"]?.length > 0) {
      const stateId = String(selectedProperty.state);
      const matchingState = commonMasters["States"].find(state => String(state.id) === stateId);
      if (matchingState) { stateValue = String(matchingState.id);  }
      else {
        const stateByName = commonMasters["States"].find(state => state.name.toLowerCase() === stateId.toLowerCase());
        if (stateByName) { stateValue = String(stateByName.id);  }
        else stateValue = stateId;
      }
    } else stateValue = selectedProperty.state || "";

    let floorValue = "";
    if (selectedProperty.floor && propertiesMasters["Floors"]?.length > 0) {
      const floorStr = String(selectedProperty.floor);
      const matchingFloor = propertiesMasters["Floors"].find(floor => String(floor.id) === floorStr);
      if (matchingFloor) { floorValue = matchingFloor.name;  }
      else {
        const floorByName = propertiesMasters["Floors"].find(floor => floor.name === floorStr);
        if (floorByName) { floorValue = floorByName.name;  }
        else floorValue = floorStr;
      }
    } else floorValue = selectedProperty.floor || "";

    let lockinValue = "";
    if (selectedProperty.lockin_period_months && propertiesMasters["Lock-in Period"]?.length > 0) {
      const lockinNum = Number(selectedProperty.lockin_period_months);
      const matchingOption = propertiesMasters["Lock-in Period"].find(option => parseInt(option.name) === lockinNum);
      if (matchingOption) { lockinValue = matchingOption.name;  }
      else lockinValue = String(selectedProperty.lockin_period_months);
    } else lockinValue = selectedProperty.lockin_period_months || "";

    let noticeValue = "";
    if (selectedProperty.notice_period_days && propertiesMasters["Notice Period"]?.length > 0) {
      const noticeNum = Number(selectedProperty.notice_period_days);
      const matchingOption = propertiesMasters["Notice Period"].find(option => parseInt(option.name) === noticeNum);
      if (matchingOption) { noticeValue = matchingOption.name;  }
      else noticeValue = String(selectedProperty.notice_period_days);
    } else noticeValue = selectedProperty.notice_period_days || "";

    let ruleNames = parsedPropertyRules;
    if (parsedPropertyRules.length > 0 && propertiesMasters["Property Rules"]?.length > 0) {
      ruleNames = parsedPropertyRules.map((id: string | number) => {
        const matchingRule = propertiesMasters["Property Rules"].find(rule => rule.id === Number(id) || rule.name === String(id));
        return matchingRule ? matchingRule.name : String(id);
      }).filter(Boolean);
    }

    let termNames = parsedAdditionalTerms;
    if (parsedAdditionalTerms.length > 0 && propertiesMasters["Additional Terms"]?.length > 0) {
      termNames = parsedAdditionalTerms.map((id: string | number) => {
        const matchingTerm = propertiesMasters["Additional Terms"].find(term => term.id === Number(id) || term.name === String(id));
        return matchingTerm ? matchingTerm.name : String(id);
      }).filter(Boolean);
    }

    let tagNames = parsedTags;
    if (parsedTags.length > 0 && propertiesMasters["Tags"]?.length > 0) {
      tagNames = parsedTags.map((id: string | number) => {
        const matchingTag = propertiesMasters["Tags"].find(tag => tag.id === Number(id) || tag.name === String(id));
        return matchingTag ? matchingTag.name : String(id);
      }).filter(Boolean);
    }

    const initialFormData = {
      name: selectedProperty.name || "",
      city_id: selectedProperty.city_id || "",
      state: stateValue,
      area: selectedProperty.area || "",
      address: selectedProperty.address || "",
       map_embed_url: selectedProperty.map_embed_url || "", // ADD THIS
    map_direction_url: selectedProperty.map_direction_url || "", // ADD THIS
      total_rooms: selectedProperty.total_rooms || 0,
      total_beds: selectedProperty.total_beds || 0,
      floor: floorValue,
      starting_price: selectedProperty.starting_price || 0,
      security_deposit: selectedProperty.security_deposit || 0,
      description: selectedProperty.description || "",
      property_manager_name: selectedProperty.property_manager_name || "",
      property_manager_phone: selectedProperty.property_manager_phone || "",
      property_manager_email: selectedProperty.property_manager_email || "",
      property_manager_role: selectedProperty.property_manager_role || "",
      staff_id: selectedProperty.staff_id ? String(selectedProperty.staff_id) : "",
      amenities: Array.isArray(selectedProperty.amenities) ? selectedProperty.amenities : [],
      services: Array.isArray(selectedProperty.services) ? selectedProperty.services : [],
      photo_urls: uniquePhotoUrls as string[],
      property_rules: ruleNames,
      lockin_period_months: lockinValue,
      lockin_penalty_amount: selectedProperty.lockin_penalty_amount || 0,
      lockin_penalty_type: selectedProperty.lockin_penalty_type || "fixed",
      notice_period_days: noticeValue,
      notice_penalty_amount: selectedProperty.notice_penalty_amount || 0,
      notice_penalty_type: selectedProperty.notice_penalty_type || "fixed",
      terms_conditions: selectedProperty.terms_conditions || "",
      additional_terms: termNames,
      custom_terms: [],
      tags: tagNames,
      
    };

    setFormData(initialFormData);
    setSelectedRules(ruleNames);
    setSelectedAdditionalTerms(termNames);
    setSelectedTags(tagNames);
    setExistingPhotoUrls(uniquePhotoUrls as string[]);
    setPhotoFiles([]);
    setRemovedPhotoUrls([]);
    setPhotoPreviews(
      (uniquePhotoUrls as string[]).map((url: string) => {
        if (url.startsWith("http") || url.startsWith("blob:")) return url;
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
        return `${apiUrl}/${cleanUrl}`;
      }),
    );

    const existingTerms = selectedProperty.terms_conditions || "";
    const customTermsList = existingTerms.split("\n").filter(
      (term: string) => term.trim() && !TERMS_TEMPLATES.some(
        (template) => term.includes(template.header) || existingTerms.includes(template.detailedContent(selectedProperty)),
      ),
    );
    setCustomTerms(customTermsList);
    setSelectedTerms([]);
    setError(null);

    const matchingStaff =
      staffList.find((s) => String(s.id) === String(selectedProperty.staff_id)) ||
      staffList.find((s) => s.name === selectedProperty.property_manager_name);

    if (matchingStaff) {
      setSelectedStaff(matchingStaff);
      setSelectedStaffId(String(matchingStaff.id));
      setManagerRole(selectedProperty.role_name || "");
      setManagerEmail(matchingStaff.email || "");
    } else {
      setSelectedStaff(null);
      setSelectedStaffId(selectedProperty.staff_id ? String(selectedProperty.staff_id) : "");
      setManagerRole(selectedProperty.property_manager_role || "");
      setManagerEmail(selectedProperty.property_manager_email || "");
    }
  };

  useEffect(() => {
    if (editMode && selectedProperty) {
      if (Object.keys(commonMasters).length > 0 && Object.keys(propertiesMasters).length > 0) {
        initializeFormWithMasters();
      }
    } else {
      resetForm();
    }
  }, [selectedProperty, editMode, commonMasters, propertiesMasters, staffList]);

  const loadStaffList = async () => {
    setLoadingStaff(true);
    try {
      const staff = await getAllStaff();
      setStaffList(staff);
    } catch (err) {
      console.error("Failed to load staff list:", err);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaffId(staffId);
    const staff = staffList.find((s) => String(s.id) === staffId);
    if (staff) {
      setSelectedStaff(staff);
      const fullName = staff.name || "";
      setFormData((prev) => ({
        ...prev,
        property_manager_name: fullName,
        property_manager_phone: staff.phone || "",
        property_manager_email: staff.email || "",
        property_manager_role: staff.role || "",
        staff_id: staffId,
      }));
      setManagerRole(staff.role_name || "");
      setManagerEmail(staff.email || "");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", city_id: "", state: "", area: "", address: "",
        map_embed_url: "", // ADD THIS
    map_direction_url: "", // ADD THIS
      total_rooms: 0, total_beds: 0, floor: 0,
      starting_price: 0, security_deposit: 0, description: "",
      property_manager_name: "", property_manager_phone: "",
      property_manager_email: "", property_manager_role: "",
      staff_id: "", amenities: [], services: [], photo_urls: [],
      property_rules: [], lockin_period_months: "",
      lockin_penalty_amount: 0, lockin_penalty_type: "fixed",
      notice_period_days: "", notice_penalty_amount: 0,
      notice_penalty_type: "fixed", terms_conditions: "",
      additional_terms: [], custom_terms: [], tags: [],
    });
    setAmenityInput(""); setServiceInput("");
    setPhotoFiles([]); setPhotoPreviews([]);
    setExistingPhotoUrls([]); setRemovedPhotoUrls([]);
    setSelectedTerms([]); setCustomTerms([]); setNewTerm("");
    setActiveTab("basic"); setError(null);
    setSelectedStaffId(""); setManagerRole(""); setManagerEmail("");
    setSelectedRules([]); setSelectedAdditionalTerms([]); setSelectedTags([]);
  };

  const handleClose = () => { resetForm(); onReset(); onOpenChange(false); };

  const handleSubmit = async () => {
    const ruleIds = selectedRules.map(ruleName => {
      const matchingRule = propertiesMasters["Property Rules"]?.find(r => r.name === ruleName);
      return matchingRule ? String(matchingRule.id) : ruleName;
    });

    const termIds = selectedAdditionalTerms.map(termName => {
      const matchingTerm = propertiesMasters["Additional Terms"]?.find(t => t.name === termName);
      return matchingTerm ? String(matchingTerm.id) : termName;
    });

    const tagIds = selectedTags.map(tagName => {
      const matchingTag = propertiesMasters["Tags"]?.find(t => t.name === tagName);
      return matchingTag ? String(matchingTag.id) : tagName;
    });

    const templateTerms = selectedTerms.map((termId) => {
      const template = TERMS_TEMPLATES.find((t) => t.id === termId);
      if (!template) return "";
      return `${template.header}\n${template.detailedContent(formData)}`;
    }).filter(Boolean);

    const allTerms = [templateTerms.length === 0 ? formData.terms_conditions : templateTerms].filter(Boolean).join("\n\n");

    const submitData = {
      ...formData,
      property_rules: ruleIds,
      tags: tagIds,
      additional_terms: termIds,
      terms_conditions: allTerms,
      custom_terms: customTerms,
    };

    await onSubmit(submitData, photoFiles, removedPhotoUrls);
    photoPreviews.forEach(preview => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); });
  };

  const handlePhotosUpload = (files: File[]) => {
    const previews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((prev) => [...prev, ...previews]);
    setPhotoFiles((prev) => [...prev, ...files]);
  };

  const removeUploadedPhoto = (index: number) => {
    const isExistingImage = index < existingPhotoUrls.length;
    if (isExistingImage) {
      const removedUrl = existingPhotoUrls[index];
      if (removedPhotoUrls.includes(removedUrl)) return;
      setRemovedPhotoUrls((prev) => [...prev, removedUrl]);
    } else {
      const adjustedIndex = index - existingPhotoUrls.length;
      const newPreviews = [...photoPreviews]; newPreviews.splice(index, 1); setPhotoPreviews(newPreviews);
      const newFiles = [...photoFiles]; newFiles.splice(adjustedIndex, 1); setPhotoFiles(newFiles);
    }
  };

  const addAmenity = (amenity?: string) => {
    const amenityToAdd = amenity || amenityInput.trim();
    if (amenityToAdd && !formData.amenities.includes(amenityToAdd)) {
      setFormData({ ...formData, amenities: [...formData.amenities, amenityToAdd] });
      if (!amenity) setAmenityInput("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({ ...formData, amenities: formData.amenities.filter((_, i) => i !== index) });
  };

  const addService = (service?: string) => {
    const serviceToAdd = service || serviceInput.trim();
    if (serviceToAdd && !formData.services.includes(serviceToAdd)) {
      setFormData({ ...formData, services: [...formData.services, serviceToAdd] });
      if (!service) setServiceInput("");
    }
  };

  const removeService = (index: number) => {
    setFormData({ ...formData, services: formData.services.filter((_, i) => i !== index) });
  };

  const addCustomTerm = () => {
    if (newTerm.trim()) { setCustomTerms((prev) => [...prev, newTerm.trim()]); setNewTerm(""); }
  };

  const removeCustomTerm = (index: number) => {
    setCustomTerms((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTermTemplate = (termId: string) => {
    setSelectedTerms((prev) => prev.includes(termId) ? prev.filter((id) => id !== termId) : [...prev, termId]);
  };

  const generateTermsFromTemplates = () => {
    const templateTerms = selectedTerms.map((termId) => {
      const template = TERMS_TEMPLATES.find((t) => t.id === termId);
      if (!template) return "";
      return `${template.header}\n${template.detailedContent(formData)}`;
    }).filter(Boolean);
    const allTerms = [templateTerms].join("\n\n");
    setFormData((prev) => ({ ...prev, terms_conditions: allTerms }));
  };

  // ─── Tab label config ─────────────────────────────────────────────────────
  const tabConfig = [
    { value: "basic",     icon: Home,     label: "Basic"     },
    { value: "amenities", icon: Wifi,     label: "Amenities" },
    { value: "terms",     icon: FileText, label: "Terms"     },
    { value: "photos",    icon: Camera,   label: "Photos"    },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-3xl lg:max-w-5xl overflow-hidden p-0 border-0 flex flex-col rounded-2xl shadow-2xl">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                {editMode ? "Edit Property" : "Add New Property"}
              </h2>
              <p className="text-blue-100 text-[10px] leading-tight">Enter complete property details</p>
            </div>
            <button
              onClick={handleClose}
              className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col overflow-hidden">

          {/* ── Tab bar ── */}
          <div className="px-4 pt-2 pb-0 flex-shrink-0">
            <TabsList className="grid grid-cols-4 h-8 p-0.5 bg-slate-100 rounded-lg">
              {tabConfig.map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex items-center gap-1 text-[10px] font-semibold h-7 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                >
                  <Icon className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Fixed-height scrollable tab content ── */}
          <div className="h-[435px] overflow-y-auto px-4 py-3">

            {/* ════════════════════════════════════════
                TAB 1 — BASIC INFO
            ════════════════════════════════════════ */}
            <TabsContent value="basic" className="mt-0 space-y-0">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">
                  <p className="text-[10px] text-red-600 font-medium">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* ── Left column ── */}
                <div className="space-y-2">
                  <F label="Property Name" required>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Premium Apartment" className={inputCls} required />
                  </F>

                  <div className="grid grid-cols-2 gap-2">
                    <F label="City" required>
                      <Select value={formData.city_id ? String(formData.city_id) : ""} onValueChange={(v) => setFormData({ ...formData, city_id: v })} disabled={loadingMasters}>
                        <SelectTrigger className={inputCls}><SelectValue placeholder={loadingMasters ? "Loading…" : "Select City"} /></SelectTrigger>
                        <SelectContent>
                          {commonMasters["Cities"]?.length > 0
                            ? commonMasters["Cities"].map((city) => <SelectItem key={city.id} value={String(city.id)} className="text-[11px]">{city.name}</SelectItem>)
                            : <div className="px-2 py-1 text-[10px] text-slate-500">{loadingMasters ? "Loading…" : "No cities"}</div>}
                        </SelectContent>
                      </Select>
                    </F>
                    <F label="State" required>
                      <Select value={formData.state ? String(formData.state) : ""} onValueChange={(v) => setFormData({ ...formData, state: v })} disabled={loadingMasters}>
                        <SelectTrigger className={inputCls}><SelectValue placeholder={loadingMasters ? "Loading…" : "Select State"} /></SelectTrigger>
                        <SelectContent>
                          {commonMasters["States"]?.length > 0
                            ? commonMasters["States"].map((state) => <SelectItem key={state.id} value={String(state.id)} className="text-[11px]">{state.name}</SelectItem>)
                            : <div className="px-2 py-1 text-[10px] text-slate-500">{loadingMasters ? "Loading…" : "No states"}</div>}
                        </SelectContent>
                      </Select>
                    </F>
                  </div>

                  <F label="Area" required>
                    <Input value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="Downtown" className={inputCls} required />
                  </F>

                  <F label="Address">
                    <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Full address with landmark" rows={2}
                      className="text-[11px] border-slate-200 bg-slate-50 focus:bg-white resize-none min-h-[52px] rounded-md placeholder:text-slate-400" />
                  </F>

                  {/* Map Links */}
                  <div className="space-y-1.5 pt-0.5">
                    <F label="Google Map Embed Link">
                      <Input placeholder="https://www.google.com/maps?q=...&output=embed"
                        value={formData.map_embed_url || ""}
                        onChange={(e) => setFormData({ ...formData, map_embed_url: e.target.value })}
                        className={inputCls} />
                    </F>
                    <F label="Google Map Directions Link">
                      <Input placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
                        value={formData.map_direction_url || ""}
                        onChange={(e) => setFormData({ ...formData, map_direction_url: e.target.value })}
                        className={inputCls} />
                    </F>
                    {formData.map_embed_url && (
                      <div className="relative w-full h-[120px] rounded-lg overflow-hidden border border-slate-200">
                        <iframe src={formData.map_embed_url} className="w-full h-full border-0" loading="lazy" title="Property Location" />
                      </div>
                    )}
                    {formData.map_direction_url && (
                      <a href={formData.map_direction_url} target="_blank" rel="noopener noreferrer"
                        className="block w-full text-center bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 text-white font-semibold py-1.5 rounded-lg text-[11px]">
                        Get Directions
                      </a>
                    )}
                  </div>

                  <F label="Description">
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Property description…" rows={2}
                      className="text-[11px] border-slate-200 bg-slate-50 focus:bg-white resize-none min-h-[52px] rounded-md placeholder:text-slate-400" />
                  </F>
                </div>

                {/* ── Right column ── */}
                <div className="space-y-2">
                  {/* Rooms / Beds / Floors */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <F label="Rooms">
                      <Input type="text" min="0" value={formData.total_rooms || ""}
                        onChange={(e) => setFormData({ ...formData, total_rooms: parseInt(e.target.value) || 0 })}
                        className={inputCls} />
                    </F>
                    <F label="Beds">
                      <Input type="text" min="0" value={formData.total_beds || ""}
                        onChange={(e) => setFormData({ ...formData, total_beds: parseInt(e.target.value) || 0 })}
                        className={inputCls} />
                    </F>
                    <F label="Floors">
                      <Select value={formData.floor ? String(formData.floor) : ""} onValueChange={(v) => setFormData({ ...formData, floor: v })} disabled={loadingMasters}>
                        <SelectTrigger className={inputCls}><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {propertiesMasters["Floors"]?.length > 0
                            ? propertiesMasters["Floors"].map((floor) => <SelectItem key={floor.id} value={String(floor.name)} className="text-[11px]">{floor.name}</SelectItem>)
                            : <div className="px-2 py-1 text-[10px] text-slate-500">{loadingMasters ? "Loading…" : "No floors"}</div>}
                        </SelectContent>
                      </Select>
                    </F>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <F label="Starting Price (₹)">
                      <Input type="text" min="0" value={formData.starting_price || ""}
                        onChange={(e) => setFormData({ ...formData, starting_price: parseFloat(e.target.value) || 0 })}
                        className={inputCls} />
                    </F>
                    <F label="Security Deposit (₹)">
                      <Input type="text" min="0" value={formData.security_deposit || ""}
                        onChange={(e) => setFormData({ ...formData, security_deposit: parseFloat(e.target.value) || 0 })}
                        className={inputCls} />
                    </F>
                  </div>

                  {/* Tags — moved to right column */}
                  <div className="border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                    <label className={`${labelCls} flex items-center gap-1`}>
                      <span className="text-blue-500">🏷️</span> Property Tags
                    </label>
                    <p className="text-[10px] text-slate-400 mb-1.5">Categorize this property (Luxury, Budget, Family, Student…)</p>
                    <MultiSelect options={propertiesMasters["Tags"] || []} selected={selectedTags}
                      onChange={setSelectedTags} placeholder="Select property tags…" disabled={loadingMasters} />
                  </div>

                  {/* Property Manager */}
                  <div className="pt-1">
                    <SH icon={Users} label="Property Manager" />
                    <div className="space-y-1.5">
                      <F label={`Select Staff Member`}>
                        <Select value={selectedStaffId} onValueChange={handleStaffSelect} disabled={loadingStaff}>
                          <SelectTrigger className={inputCls}>
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              {selectedStaff ? (
                                <>
                                  {selectedStaff.photo_url ? (
                                    <img src={getFullPhotoUrl(selectedStaff.photo_url)} alt={selectedStaff.name}
                                      className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 text-[8px] font-bold text-blue-700">
                                      {selectedStaff?.name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="truncate text-[11px]">{getSalutationDisplay(selectedStaff.salutation || "")} {selectedStaff.name}</span>
                                </>
                              ) : (
                                <span className="text-slate-400 text-[11px]">{loadingStaff ? "Loading staff…" : "Choose from staff list…"}</span>
                              )}
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {staffList.length === 0 && !loadingStaff ? (
                              <div className="px-2 py-1.5 text-[10px] text-slate-500">No staff members found</div>
                            ) : (
                              staffList.map((staff) => (
                                <SelectItem key={staff.id} value={String(staff.id)} className="text-[11px]">
                                  <div className="flex items-center gap-2">
                                    {staff.photo_url ? (
                                      <img src={getFullPhotoUrl(staff.photo_url)} alt={staff.name}
                                        className="w-5 h-5 rounded-full object-cover"
                                        onError={(e) => ((e.target as HTMLImageElement).src = "/default-avatar.png")} />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-semibold text-slate-700">
                                        {staff.name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                                      </div>
                                    )}
                                    <div className="flex flex-col">
                                      <span className="font-medium text-[11px]">{getSalutationDisplay(staff.salutation || "")} {staff.name}</span>
                                      <span className="text-slate-400 text-[9px]">{staff.role_name}</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {loadingStaff && <Loader2 className="inline h-3 w-3 ml-1 animate-spin text-blue-500" />}
                      </F>

                      {/* Manager card */}
                      <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                        {selectedStaff?.photo_url ? (
                          <img src={getFullPhotoUrl(selectedStaff.photo_url)} alt={selectedStaff.name}
                            className="w-9 h-9 rounded-full object-cover border-2 border-blue-200 flex-shrink-0"
                            onError={(e) => ((e.target as HTMLImageElement).src = "/default-avatar.png")} />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {selectedStaff
                              ? selectedStaff.name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                              : "M"}
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] text-slate-400">Manager Name</p>
                          <p className="text-[11px] font-semibold text-slate-700">
                            {selectedStaff
                              ? `${getSalutationDisplay(selectedStaff.salutation || "")} ${formData.property_manager_name}`
                              : formData.property_manager_name || "Not selected"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <F label="Phone">
                          <Input type="tel" value={formData.property_manager_phone}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, "");
                              if (numericValue.length <= 10) setFormData({ ...formData, property_manager_phone: numericValue });
                            }}
                            maxLength={10} placeholder="9876543210" className={inputCls} />
                        </F>
                        <F label="Role">
                          <Input value={managerRole} readOnly placeholder="Auto-filled"
                            className={`${inputCls} bg-slate-100 text-slate-500 cursor-default`} />
                        </F>
                        <F label="Email">
                          <Input value={managerEmail} readOnly placeholder="Auto-filled"
                            className={`${inputCls} bg-slate-100 text-slate-500 cursor-default`} />
                        </F>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ════════════════════════════════════════
                TAB 2 — AMENITIES
            ════════════════════════════════════════ */}
            <TabsContent value="amenities" className="mt-0 space-y-3">
              {/* Amenities */}
              <div>
                <SH icon={Wifi} label="Amenities" />
                <div className="flex gap-1.5 mb-2">
                  <Input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)}
                    placeholder="Add custom amenity…" className={inputCls}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())} />
                  <Button type="button" size="sm" onClick={() => addAmenity()} className="h-7 text-[11px] px-3">Add</Button>
                </div>

                <p className="text-[10px] text-slate-400 mb-1.5">Quick Select:</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {commonAmenities.map((amenity) => (
                    <Badge key={amenity}
                      variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                      className="cursor-pointer text-[10px] px-1.5 py-0.5 hover:bg-blue-50"
                      onClick={() => formData.amenities.includes(amenity) ? removeAmenity(formData.amenities.indexOf(amenity)) : addAmenity(amenity)}>
                      {amenity}{formData.amenities.includes(amenity) && <Check className="h-2 w-2 ml-0.5" />}
                    </Badge>
                  ))}
                </div>

                <div className="border border-slate-100 rounded-lg p-2 bg-slate-50">
                  <p className="text-[10px] font-semibold text-slate-500 mb-1">Selected ({formData.amenities.length})</p>
                  {formData.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {formData.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-[10px] py-0.5 px-1.5">
                          {amenity}<X className="h-2 w-2 ml-0.5 cursor-pointer hover:text-red-600" onClick={() => removeAmenity(index)} />
                        </Badge>
                      ))}
                    </div>
                  ) : <p className="text-[10px] text-slate-400">No amenities added</p>}
                </div>
              </div>

              {/* Services */}
              <div>
                <SH icon={Utensils} label="Services" />
                <div className="flex gap-1.5 mb-2">
                  <Input value={serviceInput} onChange={(e) => setServiceInput(e.target.value)}
                    placeholder="Add custom service…" className={inputCls}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addService())} />
                  <Button type="button" size="sm" onClick={() => addService()} className="h-7 text-[11px] px-3">Add</Button>
                </div>

                <p className="text-[10px] text-slate-400 mb-1.5">Quick Select:</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {commonServices.map((service) => (
                    <Badge key={service}
                      variant={formData.services.includes(service) ? "default" : "outline"}
                      className="cursor-pointer text-[10px] px-1.5 py-0.5 hover:bg-green-50"
                      onClick={() => formData.services.includes(service) ? removeService(formData.services.indexOf(service)) : addService(service)}>
                      {service}{formData.services.includes(service) && <Check className="h-2 w-2 ml-0.5" />}
                    </Badge>
                  ))}
                </div>

                <div className="border border-slate-100 rounded-lg p-2 bg-slate-50">
                  <p className="text-[10px] font-semibold text-slate-500 mb-1">Selected ({formData.services.length})</p>
                  {formData.services.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {formData.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-[10px] py-0.5 px-1.5">
                          {service}<X className="h-2 w-2 ml-0.5 cursor-pointer hover:text-red-600" onClick={() => removeService(index)} />
                        </Badge>
                      ))}
                    </div>
                  ) : <p className="text-[10px] text-slate-400">No services added</p>}
                </div>
              </div>
            </TabsContent>

            {/* ════════════════════════════════════════
                TAB 3 — TERMS
            ════════════════════════════════════════ */}
            <TabsContent value="terms" className="mt-0 space-y-3">
              {/* Lock-in + Notice periods side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Lock-in Period */}
                <div className="border border-blue-100 bg-blue-50/40 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CalendarDays className="h-3 w-3 text-blue-600" />
                    <span className="text-[11px] font-bold text-blue-700">Lock-in Period</span>
                    {loadingMasters && <Loader2 className="h-2.5 w-2.5 animate-spin text-blue-400" />}
                  </div>
                  <div className="space-y-1.5">
                    <F label="Duration">
                      <Select value={formData.lockin_period_months ? String(formData.lockin_period_months) : ""}
                        onValueChange={(v) => setFormData({ ...formData, lockin_period_months: v })} disabled={loadingMasters}>
                        <SelectTrigger className={inputCls}><SelectValue placeholder="Select lock-in period" /></SelectTrigger>
                        <SelectContent>
                          {propertiesMasters["Lock-in Period"]?.length > 0
                            ? propertiesMasters["Lock-in Period"].map((option) => <SelectItem key={option.id} value={String(option.name)} className="text-[11px]">{option.name}</SelectItem>)
                            : <div className="px-2 py-1 text-[10px] text-slate-500">{loadingMasters ? "Loading…" : "No options"}</div>}
                        </SelectContent>
                      </Select>
                    </F>
                    <F label="Early Exit Penalty">
                      <div className="grid grid-cols-2 gap-1.5">
                        <Input type="number" min="0" value={formData.lockin_penalty_amount || ""}
                          onChange={(e) => setFormData({ ...formData, lockin_penalty_amount: parseFloat(e.target.value) || 0 })}
                          placeholder={formData.lockin_penalty_type === "percentage" ? "%" : "Amount"}
                          className={inputCls} />
                        <Select value={formData.lockin_penalty_type} onValueChange={(v) => setFormData({ ...formData, lockin_penalty_type: v })}>
                          <SelectTrigger className={inputCls}><SelectValue placeholder="Type" /></SelectTrigger>
                          <SelectContent className="text-[11px]">
                            {PENALTY_TYPE_OPTIONS.filter((o) => o.code !== "rent").map((o) => <SelectItem key={o.id} value={o.code}>{o.value}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </F>
                  </div>
                </div>

                {/* Notice Period */}
                <div className="border border-amber-100 bg-amber-50/40 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock3 className="h-3 w-3 text-amber-600" />
                    <span className="text-[11px] font-bold text-amber-700">Notice Period</span>
                    {loadingMasters && <Loader2 className="h-2.5 w-2.5 animate-spin text-amber-400" />}
                  </div>
                  <div className="space-y-1.5">
                    <F label="Duration">
                      <Select value={formData.notice_period_days ? String(formData.notice_period_days) : ""}
                        onValueChange={(v) => setFormData({ ...formData, notice_period_days: v })} disabled={loadingMasters}>
                        <SelectTrigger className={inputCls}><SelectValue placeholder="Select notice period" /></SelectTrigger>
                        <SelectContent>
                          {propertiesMasters["Notice Period"]?.length > 0
                            ? propertiesMasters["Notice Period"].map((option) => <SelectItem key={option.id} value={String(option.name)} className="text-[11px]">{option.name}</SelectItem>)
                            : <div className="px-2 py-1 text-[10px] text-slate-500">{loadingMasters ? "Loading…" : "No options"}</div>}
                        </SelectContent>
                      </Select>
                    </F>
                    <F label="Non-Compliance Penalty">
                      <div className="grid grid-cols-2 gap-1.5">
                        <Input type="number" min="0" value={formData.notice_penalty_amount || ""}
                          onChange={(e) => setFormData({ ...formData, notice_penalty_amount: parseFloat(e.target.value) || 0 })}
                          placeholder={formData.notice_penalty_type === "percentage" ? "%" : "Amount"}
                          className={inputCls} />
                        <Select value={formData.notice_penalty_type} onValueChange={(v) => setFormData({ ...formData, notice_penalty_type: v })}>
                          <SelectTrigger className={inputCls}><SelectValue placeholder="Type" /></SelectTrigger>
                          <SelectContent className="text-[11px]">
                            {PENALTY_TYPE_OPTIONS.filter((o) => o.code !== "rent").map((o) => <SelectItem key={o.id} value={o.code}>{o.value}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </F>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Builder */}
              <div>
                <SH icon={ListChecks} label="Terms & Conditions Builder" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Template Terms */}
                  <div className="border border-slate-100 rounded-lg p-2 bg-white">
                    <p className="text-[10px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                      <FileText className="h-3 w-3 text-blue-500" /> Template Terms
                    </p>
                    <p className="text-[10px] text-slate-400 mb-1.5">Select terms to include</p>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
                      {TERMS_TEMPLATES.map((template) => (
                        <div key={template.id} className="flex items-center gap-2 p-1.5 border border-slate-100 rounded-md hover:bg-slate-50">
                          <Switch checked={selectedTerms.includes(template.id)} onCheckedChange={() => toggleTermTemplate(template.id)}
                            className="h-4 w-7 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-slate-700 truncate">{template.title}</p>
                            <p className="text-[9px] text-slate-400 truncate">{template.content(formData)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Generated Terms */}
                  <div className="border border-slate-100 rounded-lg p-2 bg-white">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <FileText className="h-3 w-3 text-green-500" /> Generated Terms
                      </p>
                      <Button variant="outline" size="sm" onClick={generateTermsFromTemplates}
                        disabled={selectedTerms.length === 0} className="h-6 text-[10px] px-2">
                        Generate
                      </Button>
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                      {formData.terms_conditions ? (
                        <div className="space-y-1">
                          {formData.terms_conditions.split('\n').map((line, index) => {
                            const isHeader = line.includes('🔒') || line.includes('📅') || (line.trim() && line === line.toUpperCase() && line.length > 5);
                            if (isHeader) return <h5 key={index} className="text-[10px] font-bold text-slate-700 mt-1.5 first:mt-0">{line}</h5>;
                            else if (line.trim().match(/^\d+\./)) return <p key={index} className="text-[10px] text-slate-600 pl-2">{line}</p>;
                            else if (line.trim()) return <p key={index} className="text-[10px] text-slate-500">{line}</p>;
                            return null;
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-28 text-center">
                          <FileText className="h-7 w-7 text-slate-200 mb-1.5" />
                          <p className="text-[10px] text-slate-400">Select terms and click Generate</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Rules + Additional Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="border border-slate-100 rounded-lg p-2 bg-white">
                  <label className={`${labelCls} flex items-center gap-1 mb-1`}>
                    <ShieldCheck className="h-3 w-3 text-slate-500" /> Property Rules
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1.5">Select multiple rules that apply</p>
                  <MultiSelect options={propertiesMasters["Property Rules"] || []} selected={selectedRules}
                    onChange={setSelectedRules} placeholder="Select property rules…" disabled={loadingMasters} />
                </div>
                <div className="border border-slate-100 rounded-lg p-2 bg-white">
                  <label className={`${labelCls} flex items-center gap-1 mb-1`}>
                    <FileText className="h-3 w-3 text-slate-500" /> Additional Terms
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1.5">Select additional terms and conditions</p>
                  <MultiSelect options={propertiesMasters["Additional Terms"] || []} selected={selectedAdditionalTerms}
                    onChange={setSelectedAdditionalTerms} placeholder="Select additional terms…" disabled={loadingMasters} />
                </div>
              </div>
            </TabsContent>

            {/* ════════════════════════════════════════
                TAB 4 — PHOTOS
            ════════════════════════════════════════ */}
            <TabsContent value="photos" className="mt-0 space-y-3">
              <SH icon={Camera} label="Property Photos" />
              <p className="text-[10px] text-slate-400 -mt-1">Upload multiple photos. Max 10 photos, 5 MB each.</p>

              {/* Upload zone */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors bg-slate-50/50">
                <input type="file" accept="image/*" multiple id="property-photos" className="hidden"
                  onChange={(e) => { const files = Array.from(e.target.files || []); if (files.length > 0) handlePhotosUpload(files); e.target.value = ""; }} />
                <label htmlFor="property-photos" className="cursor-pointer flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <Upload className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 mb-0.5">
                    {photoPreviews.length > 0 ? "Add More Photos" : "Upload Property Photos"}
                  </p>
                  <p className="text-[10px] text-slate-400">Drag & drop or click to browse</p>
                </label>
              </div>

              {/* Photo grid */}
              {photoPreviews.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-600">Gallery ({photoPreviews.length})</p>
                    {removedPhotoUrls.length > 0 && (
                      <Badge variant="destructive" className="text-[10px] animate-pulse">
                        {removedPhotoUrls.length} marked for removal
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5 max-h-56 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-white">
                    {photoPreviews.map((src, index) => {
                      const isExisting = index < existingPhotoUrls.length;
                      const originalUrl = isExisting ? existingPhotoUrls[index] : null;
                      const isRemoved = isExisting && originalUrl && removedPhotoUrls.includes(originalUrl);

                      return (
                        <div key={index} className={`relative group rounded-lg overflow-hidden border aspect-square ${
                          isRemoved ? "border-red-300" : "border-slate-200 hover:border-blue-300"
                        } transition-all`}>
                          <img src={src} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-0.5">
                            <div />
                            <div className="flex justify-between items-end">
                              {isExisting
                                ? <Badge className={`text-[8px] px-1 h-3.5 ${isRemoved ? "bg-red-600" : "bg-blue-600"}`}>{isRemoved ? "Del" : "Exist"}</Badge>
                                : <Badge className="text-[8px] px-1 h-3.5 bg-green-600">New</Badge>}
                              <Button size="sm" variant="destructive" className="h-4 w-4 p-0" onClick={() => removeUploadedPhoto(index)}>
                                <X className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                          </div>
                          {isRemoved && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <XSquare className="h-5 w-5 text-red-600 opacity-70" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {photoFiles.length > 0 && (
                    <div className="px-2 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-[10px] text-green-700 font-medium">✅ {photoFiles.length} new photo{photoFiles.length > 1 ? "s" : ""} will be uploaded</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

          </div>{/* end scroll area */}

          {/* ── Footer ── */}
          <div className="border-t border-slate-100 bg-white px-4 py-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              {/* Prev / dots / Next */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPrevTab} disabled={activeTab === tabs[0]}
                  className="h-7 text-[11px] px-2.5">
                  <ChevronLeft className="h-3 w-3 mr-0.5" /> Prev
                </Button>
                <div className="flex items-center gap-1">
                  {tabs.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`rounded-full transition-all ${activeTab === tab ? "w-5 h-1.5 bg-blue-600" : "w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400"}`} />
                  ))}
                </div>
                {activeTab !== tabs[tabs.length - 1] ? (
                  <Button variant="outline" size="sm" onClick={goToNextTab} className="h-7 text-[11px] px-2.5">
                    Next <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Button>
                ) : <div className="w-[58px]" />}
              </div>

              {/* Cancel / Submit */}
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" onClick={handleClose} disabled={loading} className="h-7 text-[11px] px-3">
                  Cancel
                </Button>
                {activeTab === tabs[tabs.length - 1] && (
                  <Button onClick={handleSubmit} disabled={loading} size="sm"
                    className="h-7 text-[11px] px-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90">
                    {loading ? (
                      <span className="flex items-center gap-1">
                        <div className="h-2.5 w-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving…
                      </span>
                    ) : editMode ? "Update Property" : "Create Property"}
                  </Button>
                )}
              </div>
            </div>
          </div>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
}