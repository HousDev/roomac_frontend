

"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
// import { 
//   getLockinPeriodOptions, 
//   getNoticePeriodOptions,
//   extractNumberFromDuration 
// } from "@/lib/masterApi";

import { getAllStaff, type StaffMember } from "@/lib/staffApi";

// Common terms templates with headers
const TERMS_TEMPLATES = [
  {
    id: "lockin",
    title: "Lock-in Period Terms",
    icon: Lock,
    header: "🔒 Minimum Lock-in Period",
    content: (property: any) => `Minimum lock-in period of ${property.lockin_period_months || 3} months required.`,
    detailedContent: (property: any) => `
1. The tenant agrees to a minimum lock-in period of ${property.lockin_period_months || 3} months.
2. Early termination before completing the lock-in period will result in a penalty.
3. Penalty for early exit: ${property.lockin_penalty_type === 'percentage' ? `${property.lockin_penalty_amount}% of security deposit` : property.lockin_penalty_type === 'rent' ? `One month's rent` : `₹${property.lockin_penalty_amount || 2000}`}.
4. The lock-in period starts from the date of agreement signing.
    `.trim(),
  },
  {
    id: "security",
    title: "Security Deposit Terms",
    icon: Shield,
    header: "💰 Security Deposit",
    content: (property: any) => `Security deposit of ₹${property.security_deposit || 3000} refundable within 30 days of checkout.`,
    detailedContent: (property: any) => `
1. A security deposit of ₹${property.security_deposit || 3000} is required.
2. The deposit is refundable upon vacating, subject to property condition.
3. Deductions may be made for damages, outstanding dues, or cleaning charges.
4. Refund will be processed within 30 days of vacating.
    `.trim(),
  },
  {
    id: "notice",
    title: "Notice Period Terms",
    icon: Bell,
    header: "📅 Notice Period",
    content: (property: any) => `Notice period of ${Math.floor((property.notice_period_days || 30)/30)} month required before vacating.`,
    detailedContent: (property: any) => `
1. A notice period of ${property.notice_period_days || 30} days is required for vacating the premises.
2. Notice must be provided in writing to the property manager.
3. Failure to provide adequate notice will result in a penalty.
4. Penalty for non-compliance: ${property.notice_penalty_type === 'percentage' ? `${property.notice_penalty_amount}% of security deposit` : property.notice_penalty_type === 'rent' ? `One month's rent` : `₹${property.notice_penalty_amount || 5000}`}.
    `.trim(),
  },
  {
    id: "electricity",
    title: "Electricity & Utilities",
    icon: Receipt,
    header: "⚡ Electricity & Utilities",
    content: () => `Electricity charges as per actuals, billed monthly.`,
    detailedContent: () => `
1. Electricity charges will be billed as per actual consumption.
2. Meter readings will be taken monthly.
3. Payment due within 7 days of billing.
4. Late payment may incur additional charges.
    `.trim(),
  },
  {
    id: "maintenance",
    title: "Maintenance Terms",
    icon: Wrench,
    header: "🔧 Maintenance",
    content: () => `Regular maintenance provided, major repairs reported to management.`,
    detailedContent: () => `
1. Regular maintenance of common areas is the responsibility of the property management.
2. Tenants are responsible for minor repairs and maintenance within their units.
3. Major repairs should be reported immediately to the property manager.
4. Emergency maintenance requests will be addressed within 24 hours.
    `.trim(),
  },
  {
    id: "rules",
    title: "Property Rules",
    icon: BookOpen,
    header: "📋 Property Rules",
    content: () => `Guests allowed with prior permission. Smoking & alcohol prohibited. Pets not allowed.`,
    detailedContent: () => `
1. Guests allowed with prior permission from management.
2. Smoking and alcohol consumption strictly prohibited in rooms.
3. Pets not allowed in the premises.
4. Quiet hours from 10 PM to 7 AM.
5. Proper waste disposal in designated areas.
    `.trim(),
  },
  {
    id: "rent_terms",
    title: "Rent & Amenities",
    icon: BadgeIndianRupee,
    header: "💵 Rent Includes",
    content: () => `Monthly rent includes 3 meals per day and all amenities.`,
    detailedContent: () => `
1. Monthly rent includes accommodation and all listed amenities.
2. Three meals per day included (breakfast, lunch, dinner).
3. All common area amenities accessible during designated hours.
4. Additional services may incur extra charges.
    `.trim(),
  },
  {
    id: "damage",
    title: "Damage & Liability",
    icon: AlertCircle,
    header: "⚠️ Damage & Liability",
    content: () => `Damage to property will be deducted from security deposit.`,
    detailedContent: () => `
1. Damage to property will be deducted from security deposit.
2. Tenants are responsible for care of provided furniture and fixtures.
3. Intentional damage may result in additional charges.
4. Normal wear and tear excluded.
    `.trim(),
  },
  {
    id: "management",
    title: "Management Rights",
    icon: Building2,
    header: "🏢 Management Rights",
    content: () => `Management reserves the right to modify rules with 15 days prior notice.`,
    detailedContent: () => `
1. Management reserves the right to modify rules with 15 days prior notice.
2. Changes will be communicated in writing.
3. Major rule changes require tenant consultation.
4. Emergency modifications may be implemented immediately.
    `.trim(),
  },
  {
    id: "taxes",
    title: "Taxes & Government Dues",
    icon: Receipt,
    header: "🧾 Taxes & Government Dues",
    content: () => `All government taxes and charges applicable as per current rates.`,
    detailedContent: () => `
1. All applicable government taxes (GST, property tax, etc.) are included.
2. Any increase in statutory charges will be borne by tenant.
3. Tax invoices provided monthly.
4. Prompt payment of all dues required.
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
  occupied_beds?: number;
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
};

// ── CHANGE 1: Added property_manager_email, property_manager_role, staff_id to type ──
type PropertyFormData = {
  name: string;
  city_id: string;
  state: string; 
  area: string;
  address: string;
  total_rooms: number;
  total_beds: number;
  occupied_beds: number;
  starting_price: number;
  security_deposit: number;
  description: string;
  property_manager_name: string;
  property_manager_phone: string;
  property_manager_email: string;   // ← ADDED
  property_manager_role: string;    // ← ADDED
  staff_id: string;                 // ← ADDED
  amenities: string[];
  services: string[];
  photo_urls: string[];
  property_rules: string;
  lockin_period_months: number;
  lockin_penalty_amount: number;
  lockin_penalty_type: string;
  notice_period_days: number;
  notice_penalty_amount: number;
  notice_penalty_type: string;
  terms_conditions: string;
  additional_terms: string;
  custom_terms?: string[];
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
  "WiFi", "AC", "Parking", "Laundry", "Power Backup", "Lift", "CCTV",
  "24/7 Security", "Gym", "Swimming Pool", "Garden", "Terrace", "TV",
  "Refrigerator", "Microwave", "Geyser", "Furnished", "Housekeeping",
];

const commonServices = [
  "Food Service", "Room Cleaning", "Laundry Service", "Maintenance",
  "Medical Assistance", "Transportation", "Package Handling", "Concierge",
];

// Penalty type options (hardcoded since we removed the API call)
const PENALTY_TYPE_OPTIONS = [
  { id: 1, value: "Fixed", code: "fixed" },
  { id: 2, value: "Percentage", code: "percentage" },
];

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

  // ── CHANGE 2: Added property_manager_email, property_manager_role, staff_id to initial state ──
  const [formData, setFormData] = useState<PropertyFormData>({
    name: "",
    city_id: "",
    state: "",
    area: "",
    address: "",
    total_rooms: 0,
    total_beds: 0,
    occupied_beds: 0,
    starting_price: 0,
    security_deposit: 0,
    description: "",
    property_manager_name: "",
    property_manager_phone: "",
    property_manager_email: "",   // ← ADDED
    property_manager_role: "",    // ← ADDED
    staff_id: "",                 // ← ADDED
    amenities: [],
    services: [],
    photo_urls: [],
    property_rules: "",
    lockin_period_months: 0,
    lockin_penalty_amount: 0,
    lockin_penalty_type: "fixed",
    notice_period_days: 0,
    notice_penalty_amount: 0,
    notice_penalty_type: "fixed",
    terms_conditions: "",
    additional_terms: "",
    custom_terms: [],
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
  
  // Master data states
  const [lockinPeriodOptions, setLockinPeriodOptions] = useState<Array<{id: number, value: string}>>([]);
  const [noticePeriodOptions, setNoticePeriodOptions] = useState<Array<{id: number, value: string}>>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Staff states
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null); 
  const [managerRole, setManagerRole] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  // Add helper function for photo URL
const getFullPhotoUrl = (photoUrl: string | null) => {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http') || photoUrl.startsWith('blob:')) return photoUrl;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const cleanUrl = photoUrl.startsWith('/') ? photoUrl.substring(1) : photoUrl;
  return `${apiUrl}/${cleanUrl}`;
};

// Add helper function to get salutation display
const getSalutationDisplay = (salutation: string) => {
  const salutations: Record<string, string> = {
    'mr': 'Mr.',
    'mrs': 'Mrs.',
    'miss': 'Miss',
    'dr': 'Dr.',
    'prof': 'Prof.'
  };
  return salutations[salutation] || '';
};


  // Initialize form when selectedProperty changes
  useEffect(() => {
    if (selectedProperty && editMode) {
      const photoUrls = Array.isArray(selectedProperty.photo_urls) ? selectedProperty.photo_urls : [];
      
      // ── CHANGE 3: Added property_manager_email, property_manager_role, staff_id in editMode init ──
      const initialFormData = {
        name: selectedProperty.name || "",
        city_id: selectedProperty.city_id || "",
        state: selectedProperty.state || "",
        area: selectedProperty.area || "",
        address: selectedProperty.address || "",
        total_rooms: selectedProperty.total_rooms || 0,
        total_beds: selectedProperty.total_beds || 0,
        occupied_beds: selectedProperty.occupied_beds || 0,
        starting_price: selectedProperty.starting_price || 0,
        security_deposit: selectedProperty.security_deposit || 0,
        description: selectedProperty.description || "",
        property_manager_name: selectedProperty.property_manager_name || "",
        property_manager_phone: selectedProperty.property_manager_phone || "",
        property_manager_email: selectedProperty.property_manager_email || "",  // ← ADDED
        property_manager_role: selectedProperty.property_manager_role || "",    // ← ADDED
        staff_id: selectedProperty.staff_id ? String(selectedProperty.staff_id) : "", // ← ADDED
        amenities: Array.isArray(selectedProperty.amenities) ? selectedProperty.amenities : [],
        services: Array.isArray(selectedProperty.services) ? selectedProperty.services : [],
        photo_urls: photoUrls,
        property_rules: selectedProperty.property_rules || "",
        lockin_period_months: selectedProperty.lockin_period_months || 0,
        lockin_penalty_amount: selectedProperty.lockin_penalty_amount || 0,
        lockin_penalty_type: selectedProperty.lockin_penalty_type || "fixed",
        notice_period_days: selectedProperty.notice_period_days || 0,
        notice_penalty_amount: selectedProperty.notice_penalty_amount || 0,
        notice_penalty_type: selectedProperty.notice_penalty_type || "fixed",
        terms_conditions: selectedProperty.terms_conditions || "",
        additional_terms: selectedProperty.additional_terms || "",
        custom_terms: [],
      };

      setFormData(initialFormData);
      setExistingPhotoUrls(photoUrls);
      setPhotoPreviews(photoUrls.map((url: string) => {
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        return `${apiUrl}/${cleanUrl}`;
      }));
      
      // Parse custom terms from existing terms_conditions
      const existingTerms = selectedProperty.terms_conditions || "";
      const customTermsList = existingTerms.split('\n').filter((term: string) => 
        term.trim() && !TERMS_TEMPLATES.some(template => 
          term.includes(template.header) || existingTerms.includes(template.detailedContent(selectedProperty))
        )
      );
      setCustomTerms(customTermsList);
      setSelectedTerms([]);
      setError(null);

      // Try to match existing manager to a staff member
     // Match by staff_id first (more reliable), fallback to name match
const matchingStaff = 
  staffList.find(s => String(s.id) === String(selectedProperty.staff_id)) ||
  staffList.find(s => s.name === selectedProperty.property_manager_name);

if (matchingStaff) {
  setSelectedStaff(matchingStaff);        // ← THIS LINE WAS MISSING
  setSelectedStaffId(String(matchingStaff.id));
  setManagerRole(matchingStaff.role || "");
  setManagerEmail(matchingStaff.email || "");
} else {
  setSelectedStaff(null);
  setSelectedStaffId(selectedProperty.staff_id ? String(selectedProperty.staff_id) : "");
  setManagerRole(selectedProperty.property_manager_role || "");
  setManagerEmail(selectedProperty.property_manager_email || "");
}
    } else {
      resetForm();
    }
  }, [selectedProperty, editMode, staffList]);

  // Load master options and staff when form opens
  useEffect(() => {
    if (open) {
      loadMasterOptions();
      loadStaffList();
    } else {
      setError(null);
    }
  }, [open]);

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

  // ── CHANGE 5: handleStaffSelect now also sets email, role, staff_id in formData ──
 // Replace the existing handleStaffSelect function with this:
const handleStaffSelect = (staffId: string) => {
  setSelectedStaffId(staffId);
  const staff = staffList.find((s) => String(s.id) === staffId);
  if (staff) {
    setSelectedStaff(staff); // Store the full staff object
    const fullName = staff.name || "";
    const salutation = getSalutationDisplay(staff.salutation || '');
    const displayName = salutation ? `${salutation} ${fullName}` : fullName;
    
    setFormData((prev) => ({
      ...prev,
      property_manager_name: fullName,
      property_manager_phone: staff.phone || "",
      property_manager_email: staff.email || "",
      property_manager_role: staff.role || "",
      staff_id: staffId,
    }));
    setManagerRole(staff.role || "");
    setManagerEmail(staff.email || "");
  }
};

  const loadMasterOptions = async () => {
    setLoadingOptions(true);
    setError(null);
    
    try {
      const lockinRes = await getLockinPeriodOptions();
      const noticeRes = await getNoticePeriodOptions();

      if (lockinRes.success) {
        setLockinPeriodOptions(lockinRes.data || []);
      } else {
        console.error("Failed to load lockin period options:", lockinRes);
        setError(`Lockin options error: ${lockinRes.error || 'Unknown error'}`);
      }

      if (noticeRes.success) {
        setNoticePeriodOptions(noticeRes.data || []);
      } else {
        console.error("Failed to load notice period options:", noticeRes);
        setError(`Notice options error: ${noticeRes.error || 'Unknown error'}`);
      }

    } catch (error: any) {
      console.error("Failed to load master options:", error);
      setError(`Network error: ${error.message || 'Failed to load options'}`);
      
      // Fallback options
      setLockinPeriodOptions([
        { id: 1, value: "3 months" },
        { id: 2, value: "6 months" },
        { id: 3, value: "12 months" },
        { id: 4, value: "18 months" }
      ]);
      
      setNoticePeriodOptions([
        { id: 1, value: "15 days" },
        { id: 2, value: "30 days" },
        { id: 3, value: "45 days" },
        { id: 4, value: "60 days" }
      ]);
      
    } finally {
      setLoadingOptions(false);
    }
  };

  // ── CHANGE 6: resetForm now also resets email, role, staff_id in formData ──
  const resetForm = () => {
    setFormData({
      name: "",
      city_id: "",
      state: "",
      area: "",
      address: "",
      total_rooms: 0,
      total_beds: 0,
      occupied_beds: 0,
      starting_price: 0,
      security_deposit: 0,
      description: "",
      property_manager_name: "",
      property_manager_phone: "",
      property_manager_email: "",   // ← ADDED
      property_manager_role: "",    // ← ADDED
      staff_id: "",                 // ← ADDED
      amenities: [],
      services: [],
      photo_urls: [],
      property_rules: "",
      lockin_period_months: 0,
      lockin_penalty_amount: 0,
      lockin_penalty_type: "fixed",
      notice_period_days: 0,
      notice_penalty_amount: 0,
      notice_penalty_type: "fixed",
      terms_conditions: "",
      additional_terms: "",
      custom_terms: [],
    });
    setAmenityInput("");
    setServiceInput("");
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setExistingPhotoUrls([]);
    setRemovedPhotoUrls([]);
    setSelectedTerms([]);
    setCustomTerms([]);
    setNewTerm("");
    setActiveTab("basic");
    setError(null);
    setSelectedStaffId("");
    setManagerRole("");
    setManagerEmail("");
  };

  const handleClose = () => {
    resetForm();
    onReset();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    // Combine selected template terms and custom terms
    const templateTerms = selectedTerms.map(termId => {
      const template = TERMS_TEMPLATES.find(t => t.id === termId);
      if (!template) return "";
      return `${template.header}\n${template.detailedContent(formData)}`;
    }).filter(Boolean);

    const allTerms = [...templateTerms, ...customTerms.map(term => `📝 Custom Term\n${term}`)].join("\n\n");
    
    const submitData = {
      ...formData,
      terms_conditions: allTerms,
      custom_terms: customTerms,
    };
    
    await onSubmit(submitData, photoFiles, removedPhotoUrls);
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
      setRemovedPhotoUrls(prev => [...prev, removedUrl]);
    } else {
      const adjustedIndex = index - existingPhotoUrls.length;
      const newPreviews = [...photoPreviews];
      newPreviews.splice(index, 1);
      setPhotoPreviews(newPreviews);

      const newFiles = [...photoFiles];
      newFiles.splice(adjustedIndex, 1);
      setPhotoFiles(newFiles);
    }
  };

  const addAmenity = (amenity?: string) => {
    const amenityToAdd = amenity || amenityInput.trim();
    if (amenityToAdd && !formData.amenities.includes(amenityToAdd)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityToAdd],
      });
      if (!amenity) setAmenityInput("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    });
  };

  const addService = (service?: string) => {
    const serviceToAdd = service || serviceInput.trim();
    if (serviceToAdd && !formData.services.includes(serviceToAdd)) {
      setFormData({
        ...formData,
        services: [...formData.services, serviceToAdd],
      });
      if (!service) setServiceInput("");
    }
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const addCustomTerm = () => {
    if (newTerm.trim()) {
      setCustomTerms(prev => [...prev, newTerm.trim()]);
      setNewTerm("");
    }
  };

  const removeCustomTerm = (index: number) => {
    setCustomTerms(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTermTemplate = (termId: string) => {
    setSelectedTerms(prev =>
      prev.includes(termId)
        ? prev.filter(id => id !== termId)
        : [...prev, termId]
    );
  };

  const generateTermsFromTemplates = () => {
    const templateTerms = selectedTerms.map(termId => {
      const template = TERMS_TEMPLATES.find(t => t.id === termId);
      if (!template) return "";
      return `${template.header}\n${template.detailedContent(formData)}`;
    }).filter(Boolean);

    const allTerms = [...templateTerms, ...customTerms.map(term => `📝 Custom Term\n${term}`)].join("\n\n");
    setFormData(prev => ({ ...prev, terms_conditions: allTerms }));
  };

  // Helper function to find selected option from master values
  const findSelectedOption = (options: Array<{id: number, value: string}>, currentValue: number) => {
    if (!currentValue || options.length === 0) return '';
    
    const option = options.find(opt => extractNumberFromDuration(opt.value) === currentValue);
    if (option) return option.value;
    
    for (const opt of options) {
      const optValue = extractNumberFromDuration(opt.value);
      if (optValue && Math.abs(optValue - currentValue) <= 5) {
        return opt.value;
      }
    }
    
    return '';
  };

  // Format value for display
  const formatOptionValue = (value: number, type: 'months' | 'days') => {
    if (!value) return '';
    return type === 'months' 
      ? `${value} month${value > 1 ? 's' : ''}`
      : `${value} day${value > 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-4xl lg:max-w-5xl max-h-[90vh] md:max-h-[90vh] overflow-hidden p-0 border-0 flex flex-col rounded-2xl">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 md:px-4 md:py-3 flex-shrink-0">
          <DialogHeader className="space-y-0.5 md:space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-sm md:text-base lg:text-lg font-bold">
                  {editMode ? "Edit Property" : "Add New Property"}
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-[10px] md:text-xs leading-tight">
                  Enter complete property details
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 md:h-7 md:w-7 text-white hover:bg-white/20 rounded-full"
                onClick={handleClose}
              >
                <X className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-3 py-2 md:px-4 md:py-2.5 overflow-y-auto flex-1 min-h-0">
          <TabsList className="sticky top-0 z-10 grid grid-cols-5 mb-2 md:mb-3 h-auto gap-0.5 md:gap-1 p-0.5 md:p-1">
            <TabsTrigger value="basic" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1 text-[9px] md:text-xs py-1 md:py-1.5 px-0.5 md:px-2">
              <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[8px] md:text-xs leading-tight">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="amenities" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1 text-[9px] md:text-xs py-1 md:py-1.5 px-0.5 md:px-2">
              <Wifi className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[8px] md:text-xs leading-tight">Amenities</span>
            </TabsTrigger>
            <TabsTrigger value="terms" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1 text-[9px] md:text-xs py-1 md:py-1.5 px-0.5 md:px-2">
              <FileText className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[8px] md:text-xs leading-tight">Terms</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1 text-[9px] md:text-xs py-1 md:py-1.5 px-0.5 md:px-2">
              <Camera className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[8px] md:text-xs leading-tight">Photos</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-1 text-[9px] md:text-xs py-1 md:py-1.5 px-0.5 md:px-2">
              <ShieldCheck className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span className="text-[8px] md:text-xs leading-tight">Rules</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-2 md:space-y-3 mt-0">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 md:p-2.5 mb-2">
                <p className="text-[10px] md:text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div className="space-y-2 md:space-y-2.5">
                <div>
                  <Label className="text-[10px] md:text-xs font-medium">Property Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Premium Apartment"
                    className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                  <div>
                    <Label className="text-[10px] md:text-xs font-medium">City *</Label>
                    <Input
                      value={formData.city_id}
                      onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                      placeholder="Pune"
                      className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] md:text-xs font-medium">State *</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs font-medium">Area *</Label>
                  <Input
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Downtown"
                    className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
                    required
                  />
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs font-medium">Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address with landmark"
                    rows={2}
                    className="text-[10px] md:text-xs min-h-12 md:min-h-14 mt-0.5"
                  />
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs font-medium">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Property description..."
                    rows={2}
                    className="text-[10px] md:text-xs min-h-12 md:min-h-14 mt-0.5"
                  />
                </div>
              </div>

              <div className="space-y-2 md:space-y-2.5">
                <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                  <div>
                    <Label className="text-[10px] md:text-xs font-medium">Rooms</Label>
                    <Input
                      type="text"
                      min="0"
                      value={formData.total_rooms || ''}
                      onChange={(e) => setFormData({ ...formData, total_rooms: parseInt(e.target.value) || 0 })}
                      className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] md:text-xs font-medium">Beds</Label>
                    <Input
                      type="text"
                      min="0"
                      value={formData.total_beds || ''}
                      onChange={(e) => setFormData({ ...formData, total_beds: parseInt(e.target.value) || 0 })}
                      className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] md:text-xs font-medium">Occupied</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formData.occupied_beds}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setFormData({
                            ...formData,
                            occupied_beds: value === "" ? 0 : Number(value),
                          });
                        }
                      }}
                      className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs font-medium">Starting Price (₹)</Label>
                  <Input
                    type="text"
                    min="0"
                    value={formData.starting_price || ''}
                    onChange={(e) => setFormData({ ...formData, starting_price: parseFloat(e.target.value) || 0 })}
                    className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
                  />
                </div>

                <div>
                  <Label className="text-[10px] md:text-xs font-medium">Security Deposit (₹)</Label>
                  <Input
                    type="text"
                    min="0"
                    value={formData.security_deposit || ''}
                    onChange={(e) => setFormData({ ...formData, security_deposit: parseFloat(e.target.value) || 0 })}
                    className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
                  />
                </div>

                {/* Property Manager Section */}
                <div className="pt-1 space-y-1.5 md:space-y-2">
                  <h3 className="text-[10px] md:text-xs font-semibold flex items-center gap-1">
                    <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    Property Manager
                  </h3>

                  {/* Staff dropdown */}
                {/* Staff dropdown with photos and salutations */}
<div>
  <Label className="text-[9px] md:text-[10px]">
    Select Staff Member
    {loadingStaff && (
      <Loader2 className="inline h-2.5 w-2.5 ml-1 animate-spin text-blue-500" />
    )}
  </Label>
  <Select
    value={selectedStaffId}
    onValueChange={handleStaffSelect}
    disabled={loadingStaff}
  >
  <SelectTrigger className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5">
  <div className="flex items-center gap-2 overflow-hidden">
    {selectedStaff ? (
      <>
        {selectedStaff.photo_url ? (
          <img
            src={getFullPhotoUrl(selectedStaff.photo_url)}
            alt={selectedStaff.name}
            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
            <User className="h-3 w-3 text-blue-600" />
          </div>
        )}
        <span className="truncate text-[10px] md:text-xs">
          {getSalutationDisplay(selectedStaff.salutation || '')} {selectedStaff.name}
        </span>
      </>
    ) : (
      <span className="text-gray-400 text-[10px] md:text-xs">
        {loadingStaff ? "Loading staff..." : "Choose from staff list..."}
      </span>
    )}
  </div>
</SelectTrigger>
    <SelectContent>
      {staffList.length === 0 && !loadingStaff ? (
        <div className="px-2 py-1.5 text-[10px] text-gray-500">
          No staff members found
        </div>
      ) : (
        staffList.map((staff) => (
          <SelectItem
            key={staff.id}
            value={String(staff.id)}
            className="text-[10px] md:text-xs"
          >
            <div className="flex items-center gap-2">
              {staff.photo_url ? (
                <img 
                  src={getFullPhotoUrl(staff.photo_url)} 
                  alt={staff.name}
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                  }}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-3 w-3 text-gray-500" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-medium">
                  {getSalutationDisplay(staff.salutation || '')} {staff.name}
                </span>
                <span className="text-gray-400 text-[8px]">{staff.role}</span>
              </div>
            </div>
          </SelectItem>
        ))
      )}
    </SelectContent>
  </Select>
</div>

                  {/* 2x2 Grid Layout for Manager Fields */}
                 {/* 2x2 Grid Layout for Manager Fields with Photo */}
<div className="grid grid-cols-2 gap-2 mt-2">
  {/* Manager Name with Photo */}
  <div className="col-span-2 flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
    {selectedStaff?.photo_url ? (
      <img 
        src={getFullPhotoUrl(selectedStaff.photo_url)} 
        alt={selectedStaff.name}
        className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/default-avatar.png';
        }}
      />
    ) : (
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
        {selectedStaff ? (
          selectedStaff.name?.charAt(0).toUpperCase() || 'M'
        ) : (
          'M'
        )}
      </div>
    )}
    <div>
      <Label className="text-[9px] md:text-[10px] text-gray-500">Manager Name</Label>
      <div className="font-medium text-sm">
        {selectedStaff ? (
          <>
            {getSalutationDisplay(selectedStaff.salutation || '')} {formData.property_manager_name}
          </>
        ) : (
          formData.property_manager_name || 'Not selected'
        )}
      </div>
    </div>
  </div>

  {/* Phone Number */}
  <div>
    <Label className="text-[9px] md:text-[10px]">Phone Number</Label>
    <Input
      type="tel"
      value={formData.property_manager_phone}
      onChange={(e) => {
        const numericValue = e.target.value.replace(/\D/g, '');
        if (numericValue.length <= 10) {
          setFormData({
            ...formData,
            property_manager_phone: numericValue,
          });
        }
      }}
      maxLength={10}
      placeholder="9876543210"
      className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5"
    />
  </div>

  {/* Role (read-only display) */}
  <div>
    <Label className="text-[9px] md:text-[10px]">Role</Label>
    <Input
      value={managerRole}
      readOnly
      placeholder="Auto-filled"
      className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5 bg-gray-50 text-gray-600 cursor-default"
    />
  </div>

  {/* Email (read-only display) */}
  <div>
    <Label className="text-[9px] md:text-[10px]">Email</Label>
    <Input
      value={managerEmail}
      readOnly
      placeholder="Auto-filled"
      className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5 bg-gray-50 text-gray-600 cursor-default"
    />
  </div>
</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Amenities Tab */}
          <TabsContent value="amenities" className="space-y-2 md:space-y-3 mt-0">
            <div className="space-y-2 md:space-y-3">
              <div>
                <h3 className="text-xs md:text-sm font-semibold mb-1.5 md:mb-2">Amenities</h3>
                <div className="flex gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                  <Input
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    placeholder="Add custom amenity..."
                    className="h-7 md:h-8 text-[10px] md:text-xs"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                  />
                  <Button type="button" size="sm" onClick={() => addAmenity()} className="h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3">Add</Button>
                </div>

                <div className="mb-2 md:mb-3">
                  <p className="text-[9px] md:text-[10px] text-gray-500 mb-1">Quick Select:</p>
                  <div className="flex flex-wrap gap-0.5 md:gap-1">
                    {commonAmenities.map((amenity) => (
                      <Badge
                        key={amenity}
                        variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-blue-50 text-[9px] md:text-[10px] px-1.5 py-0.5 md:px-2 md:py-0.5"
                        onClick={() => {
                          if (formData.amenities.includes(amenity)) {
                            removeAmenity(formData.amenities.indexOf(amenity));
                          } else {
                            addAmenity(amenity);
                          }
                        }}
                      >
                        {amenity}
                        {formData.amenities.includes(amenity) && <Check className="h-2 w-2 ml-0.5" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-2 md:p-2.5">
                  <Label className="text-[10px] md:text-xs font-medium">Selected Amenities ({formData.amenities.length})</Label>
                  {formData.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-0.5 md:gap-1 mt-1.5">
                      {formData.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-[9px] md:text-[10px] py-0.5 px-1.5">
                          {amenity}
                          <X
                            className="h-2 w-2 ml-0.5 cursor-pointer hover:text-red-600"
                            onClick={() => removeAmenity(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] md:text-[10px] text-gray-400 mt-1.5">No amenities added yet</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs md:text-sm font-semibold mb-1.5 md:mb-2">Services</h3>
                <div className="flex gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                  <Input
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    placeholder="Add custom service..."
                    className="h-7 md:h-8 text-[10px] md:text-xs"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                  />
                  <Button type="button" size="sm" onClick={() => addService()} className="h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3">Add</Button>
                </div>

                <div className="mb-2 md:mb-3">
                  <p className="text-[9px] md:text-[10px] text-gray-500 mb-1">Quick Select:</p>
                  <div className="flex flex-wrap gap-0.5 md:gap-1">
                    {commonServices.map((service) => (
                      <Badge
                        key={service}
                        variant={formData.services.includes(service) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-green-50 text-[9px] md:text-[10px] px-1.5 py-0.5 md:px-2 md:py-0.5"
                        onClick={() => {
                          if (formData.services.includes(service)) {
                            removeService(formData.services.indexOf(service));
                          } else {
                            addService(service);
                          }
                        }}
                      >
                        {service}
                        {formData.services.includes(service) && <Check className="h-2 w-2 ml-0.5" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-2 md:p-2.5">
                  <Label className="text-[10px] md:text-xs font-medium">Selected Services ({formData.services.length})</Label>
                  {formData.services.length > 0 ? (
                    <div className="flex flex-wrap gap-0.5 md:gap-1 mt-1.5">
                      {formData.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-[9px] md:text-[10px] py-0.5 px-1.5">
                          {service}
                          <X
                            className="h-2 w-2 ml-0.5 cursor-pointer hover:text-red-600"
                            onClick={() => removeService(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] md:text-[10px] text-gray-400 mt-1.5">No services added yet</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Terms Tab */}
          <TabsContent value="terms" className="space-y-2 md:space-y-3 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {/* Lock-in Period Section */}
              <div className="border border-blue-100 bg-blue-50/50 rounded p-2 md:p-2.5">
                <h3 className="text-[10px] md:text-xs font-semibold flex items-center gap-1 md:gap-1.5 mb-2">
                  <CalendarDays className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-600" />
                  Lock-in Period
                  {loadingOptions && (
                    <Loader2 className="h-2.5 w-2.5 md:h-3 md:w-3 animate-spin text-blue-500" />
                  )}
                </h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-[9px] md:text-[10px]">Duration</Label>
                    <Select
                      value={findSelectedOption(lockinPeriodOptions, formData.lockin_period_months)}
                      onValueChange={(value) => {
                        const months = extractNumberFromDuration(value);
                        setFormData({ ...formData, lockin_period_months: months });
                      }}
                      disabled={loadingOptions}
                    >
                      <SelectTrigger className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5">
                        <SelectValue placeholder="Select lock-in period">
                          {formData.lockin_period_months ? 
                            formatOptionValue(formData.lockin_period_months, 'months') : 
                            "Select lock-in period"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {lockinPeriodOptions.length > 0 ? (
                          lockinPeriodOptions.map((option) => (
                            <SelectItem 
                              key={option.id} 
                              value={option.value}
                              className="text-[10px] md:text-xs"
                            >
                              {option.value}
                            </SelectItem>
                          ))
                        ) : !loadingOptions && (
                          <div className="px-2 py-1 text-[9px] md:text-[10px] text-gray-500">
                            No options available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-[9px] md:text-[10px]">Penalty for Early Exit</Label>
                    <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={formData.lockin_penalty_amount || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          lockin_penalty_amount: parseFloat(e.target.value) || 0 
                        })}
                        placeholder={formData.lockin_penalty_type === 'percentage' ? 'Percentage' : 'Amount'}
                        className="h-6 md:h-7 text-[10px] md:text-xs"
                      />
                      <Select
                        value={formData.lockin_penalty_type}
                        onValueChange={(value) => {
                          setFormData({ 
                            ...formData, 
                            lockin_penalty_type: value 
                          });
                        }}
                      >
                        <SelectTrigger className="h-6 md:h-7 text-[10px] md:text-xs">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="text-[10px] md:text-xs">
                          {PENALTY_TYPE_OPTIONS.filter(option => option.code !== 'rent').map((option) => (
                            <SelectItem 
                              key={option.id} 
                              value={option.code}
                            >
                              {option.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice Period Section */}
              <div className="border border-amber-100 bg-amber-50/50 rounded p-2 md:p-2.5">
                <h3 className="text-[10px] md:text-xs font-semibold flex items-center gap-1 md:gap-1.5 mb-2">
                  <Clock3 className="h-3 w-3 md:h-3.5 md:w-3.5 text-amber-600" />
                  Notice Period
                  {loadingOptions && (
                    <Loader2 className="h-2.5 w-2.5 md:h-3 md:w-3 animate-spin text-amber-500" />
                  )}
                </h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-[9px] md:text-[10px]">Duration</Label>
                    <Select
                      value={findSelectedOption(noticePeriodOptions, formData.notice_period_days)}
                      onValueChange={(value) => {
                        const days = extractNumberFromDuration(value);
                        setFormData({ ...formData, notice_period_days: days });
                      }}
                      disabled={loadingOptions}
                    >
                      <SelectTrigger className="h-7 md:h-8 text-[10px] md:text-xs mt-0.5">
                        <SelectValue placeholder="Select notice period">
                          {formData.notice_period_days ? 
                            formatOptionValue(formData.notice_period_days, 'days') : 
                            "Select notice period"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {noticePeriodOptions.length > 0 ? (
                          noticePeriodOptions.map((option) => (
                            <SelectItem 
                              key={option.id} 
                              value={option.value}
                              className="text-[10px] md:text-xs"
                            >
                              {option.value}
                            </SelectItem>
                          ))
                        ) : !loadingOptions && (
                          <div className="px-2 py-1 text-[9px] md:text-[10px] text-gray-500">
                            No options available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-0.5">
                    <Label className="text-[9px] md:text-[10px]">Penalty for Non-Compliance</Label>
                    <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={formData.notice_penalty_amount || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          notice_penalty_amount: parseFloat(e.target.value) || 0 
                        })}
                        placeholder={formData.notice_penalty_type === 'percentage' ? 'Percentage' : 'Amount'}
                        className="h-6 md:h-7 text-[10px] md:text-xs"
                      />
                      <Select
                        value={formData.notice_penalty_type}
                        onValueChange={(value) => {
                          setFormData({ 
                            ...formData, 
                            notice_penalty_type: value 
                          });
                        }}
                      >
                        <SelectTrigger className="h-6 md:h-7 text-[10px] md:text-xs">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="text-[10px] md:text-xs">
                          {PENALTY_TYPE_OPTIONS.filter(option => option.code !== 'rent').map((option) => (
                            <SelectItem 
                              key={option.id} 
                              value={option.code}
                            >
                              {option.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <h3 className="text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-1.5">
                <ListChecks className="h-3 w-3 md:h-3.5 md:w-3.5" />
                Terms & Conditions Builder
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                <div className="border rounded p-2 md:p-2.5">
                  <h4 className="text-[10px] md:text-xs font-semibold mb-1.5">Template Terms</h4>
                  <p className="text-[9px] md:text-[10px] text-gray-500 mb-2">Select terms to include</p>
                  <div className="space-y-1.5 max-h-48 md:max-h-56 overflow-y-auto pr-1">
                    {TERMS_TEMPLATES.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-1.5 md:p-2 border rounded hover:bg-gray-50">
                        <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
                          <Switch
                            checked={selectedTerms.includes(template.id)}
                            onCheckedChange={() => toggleTermTemplate(template.id)}
                            className="h-3.5 w-6 md:h-4 md:w-7"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] md:text-[10px] font-medium truncate">{template.title}</p>
                            <p className="text-[8px] md:text-[9px] text-gray-500 truncate">{template.content(formData)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded p-2 md:p-2.5">
                  <h4 className="text-[10px] md:text-xs font-semibold mb-1.5">Custom Terms</h4>
                  <p className="text-[9px] md:text-[10px] text-gray-500 mb-2">Add your own terms</p>
                  <div className="space-y-2">
                    <div className="space-y-0.5">
                      <Label className="text-[9px] md:text-[10px]">Add Custom Term</Label>
                      <div className="flex gap-1.5">
                        <Input
                          value={newTerm}
                          onChange={(e) => setNewTerm(e.target.value)}
                          placeholder="Enter custom term..."
                          className="h-6 md:h-7 text-[10px] md:text-xs"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTerm())}
                        />
                        <Button size="sm" onClick={addCustomTerm} className="h-6 md:h-7 text-[9px] md:text-[10px] px-2">Add</Button>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <Label className="text-[9px] md:text-[10px]">Custom Terms ({customTerms.length})</Label>
                      {customTerms.length > 0 ? (
                        <div className="space-y-1 max-h-32 md:max-h-36 overflow-y-auto">
                          {customTerms.map((term, index) => (
                            <div key={index} className="flex items-center justify-between p-1.5 border rounded bg-gray-50 text-[9px] md:text-[10px]">
                              <p className="truncate flex-1 mr-1">{term}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeCustomTerm(index)}
                                className="h-5 w-5 p-0"
                              >
                                <Trash2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[9px] md:text-[10px] text-gray-500">No custom terms added</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label className="text-[10px] md:text-xs font-semibold">Generated Terms & Conditions</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateTermsFromTemplates}
                    disabled={selectedTerms.length === 0}
                    className="h-6 md:h-7 text-[9px] md:text-[10px] px-2"
                  >
                    Generate from Templates
                  </Button>
                </div>
                <Textarea
                  value={formData.terms_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                  placeholder="Generated terms will appear here..."
                  rows={4}
                  className="text-[10px] md:text-xs font-mono"
                />
              </div>
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-2 md:space-y-3 mt-0">
            <div className="space-y-2 md:space-y-2.5">
              <h3 className="text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-1.5">
                <Camera className="h-3 w-3 md:h-3.5 md:w-3.5" />
                Property Photos
              </h3>
              <p className="text-[9px] md:text-[10px] text-gray-500">
                Upload multiple photos for the property. Maximum 10 photos, 5MB each.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-5 text-center hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  id="property-photos"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handlePhotosUpload(files);
                    }
                    e.target.value = '';
                  }}
                />
                <label htmlFor="property-photos" className="cursor-pointer flex flex-col items-center">
                  <div className="p-2 md:p-2.5 rounded-full bg-blue-100 mb-2">
                    <Upload className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <p className="text-[10px] md:text-xs font-medium text-gray-700 mb-0.5">
                    {photoPreviews.length > 0 ? 'Add More Photos' : 'Upload Property Photos'}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-gray-500">
                    Drag & drop or click to browse
                  </p>
                </label>
              </div>

              {photoPreviews.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] md:text-xs font-medium">
                      Photo Gallery ({photoPreviews.length} photos)
                    </h4>
                    {removedPhotoUrls.length > 0 && (
                      <Badge variant="destructive" className="text-[9px] md:text-[10px] animate-pulse">
                        {removedPhotoUrls.length} marked for removal
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2 max-h-52 md:max-h-60 overflow-y-auto p-2 border rounded bg-white">
                    {photoPreviews.map((src, index) => {
                      const isExisting = index < existingPhotoUrls.length;
                      const originalUrl = isExisting ? existingPhotoUrls[index] : null;
                      const isRemoved = isExisting && originalUrl && removedPhotoUrls.includes(originalUrl);

                      return (
                        <div
                          key={index}
                          className={`relative group rounded overflow-hidden border ${isRemoved
                              ? 'border-red-300 bg-red-50/30'
                              : 'border-gray-200 hover:border-blue-300'
                            } transition-all duration-200`}
                        >
                          <img
                            src={src}
                            alt={`Property ${index + 1}`}
                            className="h-20 md:h-24 w-full object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0.5 left-0.5 right-0.5 flex justify-between items-center">
                              {isExisting ? (
                                <Badge className={`text-[8px] md:text-[9px] px-1 h-3.5 md:h-4 ${isRemoved ? 'bg-red-600' : 'bg-blue-600'}`}>
                                  {isRemoved ? 'Removing' : 'Existing'}
                                </Badge>
                              ) : (
                                <Badge className="text-[8px] md:text-[9px] px-1 h-3.5 md:h-4 bg-green-600">New</Badge>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-5 w-5 md:h-5.5 md:w-5.5 p-0"
                                onClick={() => removeUploadedPhoto(index)}
                              >
                                <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
                              </Button>
                            </div>
                          </div>

                          {isRemoved && (
                            <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                              <XSquare className="h-6 w-6 md:h-7 md:w-7 text-red-600 opacity-70" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {photoFiles.length > 0 && (
                    <div className="p-1.5 md:p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-[9px] md:text-[10px] text-green-700 font-medium">
                        ✅ {photoFiles.length} new photos will be uploaded
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-2 md:space-y-3 mt-0">
            <div className="space-y-2 md:space-y-2.5">
              <div>
                <Label className="text-[10px] md:text-xs font-medium flex items-center gap-1 md:gap-1.5">
                  <ShieldCheck className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  Property Rules
                </Label>
                <Textarea
                  value={formData.property_rules}
                  onChange={(e) => setFormData({ ...formData, property_rules: e.target.value })}
                  placeholder="Enter property rules here..."
                  rows={3}
                  className="text-[10px] md:text-xs min-h-16 md:min-h-20 mt-1"
                />
              </div>

              <div>
                <Label className="text-[10px] md:text-xs font-medium">Additional Terms (Optional)</Label>
                <Textarea
                  value={formData.additional_terms}
                  onChange={(e) => setFormData({ ...formData, additional_terms: e.target.value })}
                  placeholder="Any additional terms or special conditions..."
                  rows={2}
                  className="text-[10px] md:text-xs min-h-14 md:min-h-16 mt-1"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sticky bottom-0 bg-white border-t px-3 py-2 md:px-4 md:py-2.5 flex-shrink-0">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-0.5 md:gap-1">
              {["basic", "amenities", "terms", "photos", "rules"].map((tab) => (
                <div
                  key={tab}
                  className={`h-1 w-1 md:h-1.5 md:w-1.5 rounded-full ${activeTab === tab ? 'bg-blue-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            <div className="flex gap-1.5 md:gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                size="sm"
                className="h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-7 md:h-8 text-[10px] md:text-xs px-2 md:px-3"
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <span className="flex items-center gap-1 md:gap-1.5">
                    <div className="h-2.5 w-2.5 md:h-3 md:w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : editMode ? 'Update Property' : 'Create Property'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}