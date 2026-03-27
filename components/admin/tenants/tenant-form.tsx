

// components/admin/tenants/tenant-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Upload, X, Eye, EyeOff, Loader2, Key, AlertCircle, Check,
  Calendar, MapPin, Building, User, Briefcase, Lock, Shield, AlertTriangle,
  Clock3, ChevronLeft, ChevronRight, Mail, GraduationCap, BriefcaseBusiness,
  Store, Laptop, Rocket, Home, Users, Landmark, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  createTenant, updateTenant, getTenant, getAllProperties, getAvailableRooms,
  getRoomTypes, getPropertyDetails,
  type Tenant, type PreferredOptions, type OptionType, getPreferredOptions,
} from "@/lib/tenantApi";
import { consumeMasters } from "@/lib/masterApi";
import {
  occupationCategories as occupationCategoryOptions,
  getSubCategoriesForCategory, getOccupationPlaceholder,
  type OccupationSubCategory,
} from "@/lib/occupation-data";

type Property = {
  id: number; name: string; city?: string; state?: string; address?: string;
  lockin_period_months: number; lockin_penalty_amount: number; lockin_penalty_type: string;
  notice_period_days: number; notice_penalty_amount: number; notice_penalty_type: string;
};
interface MasterValue { id: number; name: string; isactive: number; }
interface TenantFormProps { tenant?: Tenant; onSuccess: () => void; onCancel: () => void; }

export function TenantForm({ tenant, onSuccess, onCancel }: TenantFormProps) {
  const [loading,               setLoading]               = useState(false);
  const [uploadProgress,        setUploadProgress]        = useState(0);
  const [properties,            setProperties]            = useState<OptionType[]>([]);
  const [availableRooms,        setAvailableRooms]        = useState<any[]>([]);
  const [activeTab,             setActiveTab]             = useState("basic");
  const [commonMasters,         setCommonMasters]         = useState<Record<string, MasterValue[]>>({});
  const [roomsMasters,          setRoomsMasters]          = useState<Record<string, MasterValue[]>>({});
  const [loadingMasters,        setLoadingMasters]        = useState(false);
  const [cities,                setCities]                = useState<MasterValue[]>([]);
  const [states,                setStates]                = useState<MasterValue[]>([]);
  const [sharingTypes,          setSharingTypes]          = useState<MasterValue[]>([]);
  const [roomTypes,             setRoomTypes]             = useState<MasterValue[]>([]);
  const [occupations,           setOccupations]           = useState<MasterValue[]>([]);
  const [options,               setOptions]               = useState<PreferredOptions>({
    sharingTypes: [], roomTypes: [], properties: [],
    genderOptions: ["Male","Female","Other"],
    countryCodes: ["+91","+1","+44","+61","+65"],
    occupations: [], cities: [], states: [],
  });
  const [idProofFile,           setIdProofFile]           = useState<File | null>(null);
  const [addressProofFile,      setAddressProofFile]      = useState<File | null>(null);
  const [photoFile,             setPhotoFile]             = useState<File | null>(null);
  const [additionalFiles,       setAdditionalFiles]       = useState<File[]>([]);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<Property | null>(null);
  const [useCustomTerms,        setUseCustomTerms]        = useState(false);
  const [showPassword,          setShowPassword]          = useState(false);
  const [showConfirmPassword,   setShowConfirmPassword]   = useState(false);
  const [availableSubCategories,setAvailableSubCategories]= useState<OccupationSubCategory[]>([]);
  const [existingFiles,         setExistingFiles]         = useState({
    id_proof_url:      tenant?.id_proof_url      || "",
    address_proof_url: tenant?.address_proof_url || "",
    photo_url:         tenant?.photo_url         || "",
  });
  const [additionalDocuments,   setAdditionalDocuments]   = useState<
    Array<{ filename: string; url: string; uploaded_at?: string }>
  >(tenant?.additional_documents || []);
  const [createCredentials,     setCreateCredentials]     = useState(false);
  const [password,              setPassword]              = useState("");
  const [confirmPassword,       setConfirmPassword]       = useState("");
  const [passwordStrength,      setPasswordStrength]      = useState(0);
  const [existingPassword,      setExistingPassword]      = useState("••••••••");
  const [showExistingPassword,  setShowExistingPassword]  = useState(false);
  const [aadharNumber, setAadharNumber] = useState(tenant?.aadhar_number || "");
const [panNumber, setPanNumber] = useState(tenant?.pan_number || "");
const [idProofType,      setIdProofType]      = useState(tenant?.id_proof_type      || "");
const [addressProofType, setAddressProofType] = useState(tenant?.address_proof_type || "");
const [idProofNumber, setIdProofNumber] = useState(tenant?.id_proof_number || "");
const [addressProofNumber, setAddressProofNumber] = useState(tenant?.address_proof_number || "");

  const [formData, setFormData] = useState<any>({
    salutation: tenant?.salutation || "",
    full_name: tenant?.full_name || "",
    email: tenant?.email || "",
    country_code: tenant?.country_code || "+91",
    phone: tenant?.phone || "",
    date_of_birth: tenant?.date_of_birth || "",
    gender: tenant?.gender || "",
    occupation_category: tenant?.occupation_category || "",
    exact_occupation: tenant?.exact_occupation || "",
    occupation: tenant?.occupation || "",
    organization: tenant?.organization || "",
    years_of_experience: tenant?.years_of_experience || "",
    monthly_income: tenant?.monthly_income || "",
    course_duration: tenant?.course_duration || "",
    student_id: tenant?.student_id || "",
    employee_id: tenant?.employee_id || "",
    portfolio_url: tenant?.portfolio_url || "",
    work_mode: tenant?.work_mode || "",
    shift_timing: tenant?.shift_timing || "",
    address: tenant?.address || "",
    city_id: tenant?.city_id || "",
    city: tenant?.city || "",
    state_id: tenant?.state_id || "",
    state: tenant?.state || "",
    pincode: tenant?.pincode || "",
    preferred_sharing: tenant?.preferred_sharing || "",
    preferred_room_type: tenant?.preferred_room_type || "",
    preferred_property_id: tenant?.preferred_property_id || "",
    check_in_date: tenant?.check_in_date || "",
    portal_access_enabled: tenant?.portal_access_enabled || false,
    is_active: tenant?.is_active ?? true,
    emergency_contact_name: tenant?.emergency_contact_name || "",
    emergency_contact_phone: tenant?.emergency_contact_phone || "",
    emergency_contact_relation: tenant?.emergency_contact_relation || "",
    lockin_period_months:  tenant?.lockin_period_months  !== undefined ? tenant.lockin_period_months  : 0,
    lockin_penalty_amount: tenant?.lockin_penalty_amount !== undefined ? tenant.lockin_penalty_amount : 0,
    lockin_penalty_type:   tenant?.lockin_penalty_type   || "fixed",
    notice_period_days:    tenant?.notice_period_days    !== undefined ? tenant.notice_period_days    : 0,
    notice_penalty_amount: tenant?.notice_penalty_amount !== undefined ? tenant.notice_penalty_amount : 0,
    notice_penalty_type:   tenant?.notice_penalty_type   || "fixed",
    property_id: tenant?.property_id || undefined,
  });

  const tabs = ["basic","occupation","address","property","terms","documents","credentials"];
  const goToNextTab = () => { const i = tabs.indexOf(activeTab); if (i < tabs.length-1) setActiveTab(tabs[i+1]); };
  const goToPrevTab = () => { const i = tabs.indexOf(activeTab); if (i > 0) setActiveTab(tabs[i-1]); };

  // ── ALL original effects preserved ────────────────────────────────────────
  useEffect(() => { fetchMasters(); fetchProperties(); }, []);
  useEffect(() => {
    loadOptions();
    if (tenant?.id) {
      loadExistingDocuments();
      if (tenant.additional_documents) setAdditionalDocuments(tenant.additional_documents);
      setCreateCredentials(tenant?.has_credentials || false);

      // Set Aadhar and PAN numbers from tenant data
    if (tenant.aadhar_number) setAadharNumber(tenant.aadhar_number);
    if (tenant.pan_number) setPanNumber(tenant.pan_number);
    }
  }, [tenant]);
  useEffect(() => { if (formData.gender && formData.preferred_property_id) loadAvailableRooms(); }, [formData.gender, formData.preferred_property_id]);
  useEffect(() => {
    if (password.length === 0) { setPasswordStrength(0); return; }
    let s = 0;
    if (password.length >= 6)          s += 25;
    if (/[A-Z]/.test(password))        s += 25;
    if (/[0-9]/.test(password))        s += 25;
    if (/[^A-Za-z0-9]/.test(password)) s += 25;
    setPasswordStrength(s);
  }, [password]);
  useEffect(() => {
    if (formData.property_id && !useCustomTerms) fetchPropertyDetails(formData.property_id);
    else setSelectedPropertyDetails(null);
  }, [formData.property_id, useCustomTerms]);
  useEffect(() => {
    if (tenant?.id) {
      const has = (tenant.lockin_period_months!==null&&tenant.lockin_period_months!==undefined)||
                  (tenant.lockin_penalty_amount!==null&&tenant.lockin_penalty_amount!==undefined)||
                  (tenant.notice_period_days!==null&&tenant.notice_period_days!==undefined)||
                  (tenant.notice_penalty_amount!==null&&tenant.notice_penalty_amount!==undefined);
      setUseCustomTerms(has);
      if (has) setFormData((p:any)=>({...p,
        lockin_period_months:tenant.lockin_period_months||0,lockin_penalty_amount:tenant.lockin_penalty_amount||0,
        lockin_penalty_type:tenant.lockin_penalty_type||"fixed",notice_period_days:tenant.notice_period_days||0,
        notice_penalty_amount:tenant.notice_penalty_amount||0,notice_penalty_type:tenant.notice_penalty_type||"fixed",
      }));
    } else setUseCustomTerms(false);
  }, [tenant]);
  useEffect(() => { if (commonMasters["Cities"]) setCities(commonMasters["Cities"]); if (commonMasters["States"]) setStates(commonMasters["States"]); }, [commonMasters]);
  useEffect(() => { if (roomsMasters["Sharing Type"]) setSharingTypes(roomsMasters["Sharing Type"]); if (roomsMasters["Room Type"]) setRoomTypes(roomsMasters["Room Type"]); if (roomsMasters["Occupation"]) setOccupations(roomsMasters["Occupation"]); }, [roomsMasters]);
  useEffect(() => {
    if (formData.occupation_category) {
      const subs = getSubCategoriesForCategory(formData.occupation_category);
      setAvailableSubCategories(subs);
      if (formData.exact_occupation && !subs.some(s=>s.value===formData.exact_occupation)) handleInputChange("exact_occupation","");
    } else setAvailableSubCategories([]);
  }, [formData.occupation_category]);
  useEffect(() => { setFormData((p:any)=>({...p,portal_access_enabled:createCredentials})); }, [createCredentials]);
  useEffect(() => {
    if (tenant?.id && cities.length>0 && states.length>0) {
      if (tenant.city && !tenant.city_id) { const m=cities.find(c=>c.name.toLowerCase()===tenant.city?.toLowerCase()); if(m) setFormData((p:any)=>({...p,city_id:String(m.id)})); }
      if (tenant.state && !tenant.state_id) { const m=states.find(s=>s.name.toLowerCase()===tenant.state?.toLowerCase()); if(m) setFormData((p:any)=>({...p,state_id:String(m.id)})); }
    }
  }, [cities,states,tenant]);

  // ── ALL original API helpers preserved ────────────────────────────────────
  const fetchMasters = async () => {
    setLoadingMasters(true);
    try {
      const [cR,rR] = await Promise.all([consumeMasters({tab:"Common"}),consumeMasters({tab:"Rooms"})]);
      if (cR?.success&&cR.data) { const g:Record<string,MasterValue[]>={}; cR.data.forEach((i:any)=>{if(!g[i.type_name])g[i.type_name]=[];g[i.type_name].push({id:i.value_id,name:i.value_name,isactive:1});}); setCommonMasters(g); }
      if (rR?.success&&rR.data) { const g:Record<string,MasterValue[]>={}; rR.data.forEach((i:any)=>{if(!g[i.type_name])g[i.type_name]=[];g[i.type_name].push({id:i.value_id,name:i.value_name,isactive:1});}); setRoomsMasters(g); }
    } catch(e){console.error("Failed to fetch masters:",e);toast.error("Failed to load master data");}
    finally{setLoadingMasters(false);}
  };
  const fetchProperties = async () => {
    try {
      const r = await getAllProperties();
      if (r.success&&r.data) setProperties(Array.isArray(r.data)?r.data.map(p=>({value:p.id,label:p.name,address:p.address||`${p.city}, ${p.state}`,lockin_period_months:p.lockin_period_months,lockin_penalty_amount:p.lockin_penalty_amount,lockin_penalty_type:p.lockin_penalty_type,notice_period_days:p.notice_period_days,notice_penalty_amount:p.notice_penalty_amount,notice_penalty_type:p.notice_penalty_type})):[]);
    } catch(e){console.error("Failed to fetch properties",e);toast.error("Failed to load properties");}
  };
  const fetchPropertyDetails = async (propertyId:number) => {
    try {
      const res:any = await getPropertyDetails(propertyId);
      if (res.success&&res.data) {
        setSelectedPropertyDetails(res.data);
        const isEditing=tenant?.id!==undefined;
        const hasCustom=tenant?.lockin_period_months!==null||tenant?.notice_period_days!==null||tenant?.lockin_penalty_amount!==null||tenant?.notice_penalty_amount!==null;
        if (!isEditing||(!hasCustom&&!useCustomTerms)) setFormData((p:any)=>({...p,lockin_period_months:res.data.lockin_period_months||p.lockin_period_months,lockin_penalty_amount:res.data.lockin_penalty_amount||p.lockin_penalty_amount,lockin_penalty_type:res.data.lockin_penalty_type||p.lockin_penalty_type,notice_period_days:res.data.notice_period_days||p.notice_period_days,notice_penalty_amount:res.data.notice_penalty_amount||p.notice_penalty_amount,notice_penalty_type:res.data.notice_penalty_type||p.notice_penalty_type}));
      }
    } catch(e){console.error("Failed to fetch property details",e);}
  };
  const handlePropertySelect = (pid:number|undefined) => { setFormData((p:any)=>({...p,property_id:pid})); if(!tenant)setUseCustomTerms(false); };
  const loadOptions = async () => {
    try { const r=await getPreferredOptions(); if(r.success&&r.data){const d=r.data;setOptions(p=>({...p,...d,genderOptions:d.genderOptions||["Male","Female","Other"],countryCodes:d.countryCodes||["+91","+1","+44","+61","+65"]}));} }
    catch(e){console.error("Failed to load options",e);toast.error("Failed to load form options");}
  };
  const loadExistingDocuments = async () => {
    if (tenant?.id) {
      try {
        const res=await getTenant(tenant.id);
        if (res?.success&&res.data) {
          setExistingFiles({id_proof_url:res.data.id_proof_url||"",address_proof_url:res.data.address_proof_url||"",photo_url:res.data.photo_url||""});
          if (res.data.additional_documents&&Array.isArray(res.data.additional_documents)) setAdditionalDocuments(res.data.additional_documents);
          setFormData((p:any)=>({...p,city_id:res.data.city_id||p.city_id,city:res.data.city||p.city,state_id:res.data.state_id||p.state_id,state:res.data.state||p.state}));
        }
      } catch(e){console.error("Failed to load documents",e);toast.error("Failed to load existing documents");}
    }
  };
  const loadAvailableRooms = async () => {
    if (!formData.gender||!formData.preferred_property_id) return;
    try { const r=await getAvailableRooms(formData.gender,formData.preferred_property_id); if(r?.success)setAvailableRooms(r.data||[]); }
    catch(e){console.error("Failed to load available rooms",e);setAvailableRooms([]);}
  };

  // ── ALL original validation preserved ─────────────────────────────────────
  const validateForm = (): boolean => {
    if (!formData.full_name.trim())            {toast.error("Full name is required");           setActiveTab("basic");       return false;}
    if (!formData.email.trim())                {toast.error("Email is required");               setActiveTab("basic");       return false;}
    if (!formData.phone.trim())                {toast.error("Phone number is required");        setActiveTab("basic");       return false;}
    if (!formData.gender)                      {toast.error("Gender is required");              setActiveTab("basic");       return false;}
    if (!formData.occupation_category)         {toast.error("Occupation category is required"); setActiveTab("occupation");  return false;}
    if (!formData.address)                     {toast.error("Address is required");             setActiveTab("address");     return false;}
    if (!formData.city_id&&!formData.city)     {toast.error("City is required");               setActiveTab("address");     return false;}
    if (!formData.state_id&&!formData.state)   {toast.error("State is required");              setActiveTab("address");     return false;}
    if (!idProofFile&&!existingFiles.id_proof_url)           {toast.error("ID Proof is required");      setActiveTab("documents");return false;}
    if (!addressProofFile&&!existingFiles.address_proof_url) {toast.error("Address Proof is required"); setActiveTab("documents");return false;}
    if (!photoFile&&!existingFiles.photo_url)                {toast.error("Photo is required");         setActiveTab("documents");return false;}
    if (!tenant?.id) {
      if (createCredentials) {
        if (password.length<6)          {toast.error("Password must be at least 6 characters");setActiveTab("credentials");return false;}
        if (password!==confirmPassword) {toast.error("Passwords do not match");               setActiveTab("credentials");return false;}
      }
    } else {
      if (password&&password.trim()!=="") {
        if (password.length<6)          {toast.error("Password must be at least 6 characters");setActiveTab("credentials");return false;}
        if (password!==confirmPassword) {toast.error("Passwords do not match");               setActiveTab("credentials");return false;}
      }
    }
    return true;
  };

  // ── ALL original submit logic preserved ───────────────────────────────────
// In tenant-form.tsx - Update handleSubmit

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setLoading(true);
  setUploadProgress(0);

  try {
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    const formDataToSend = new FormData();

    // Append tenant data (your existing code)
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData];
      if (value !== undefined && value !== null && value !== '') {
        if ((key === 'check_in_date' || key === 'date_of_birth') && value) {
          const dateValue = new Date(String(value));
          if (!isNaN(dateValue.getTime())) {
            formDataToSend.append(key, dateValue.toISOString().split('T')[0]);
          }
        } else {
          formDataToSend.append(key, String(value));
        }
      }
    });

    // Append credential info
    if (createCredentials) {
      if (tenant?.id) {
        if (password && password.trim() !== '') {
          formDataToSend.append('update_credentials', 'true');
          formDataToSend.append('password', password);
        }
      } else {
        if (createCredentials) {
          formDataToSend.append('create_credentials', 'true');
          formDataToSend.append('password', password);
        }
      }
    }

    // Append existing additional documents as JSON
    if (additionalDocuments.length > 0) {
      formDataToSend.append('additional_documents', JSON.stringify(additionalDocuments));
    }

    // Append main document files
    if (idProofFile) formDataToSend.append('id_proof_url', idProofFile);
    if (addressProofFile) formDataToSend.append('address_proof_url', addressProofFile);
    if (photoFile) formDataToSend.append('photo_url', photoFile);
    if (aadharNumber) formDataToSend.append('aadhar_number', aadharNumber);
if (panNumber) formDataToSend.append('pan_number', panNumber);
if (idProofType)      formDataToSend.append('id_proof_type',      idProofType);
if (addressProofType) formDataToSend.append('address_proof_type', addressProofType);
if (idProofNumber) formDataToSend.append('id_proof_number', idProofNumber);
if (addressProofNumber) formDataToSend.append('address_proof_number', addressProofNumber);
    // Append additional files
    additionalFiles.forEach((file) => {
      formDataToSend.append('additional_documents[]', file);
    });

    let result: any;
    if (tenant?.id) {
      result = await updateTenant(tenant.id, formDataToSend);
    } else {
      result = await createTenant(formDataToSend);
    }

    clearInterval(progressInterval);
    setUploadProgress(100);

    if (result.success) {
      // Check if it was a restored tenant
      if (result.restored) {
        toast.success("Existing deleted tenant restored and updated successfully");
      } else {
        const successMessage = tenant ? "Tenant updated successfully" : "Tenant created successfully";
        toast.success(successMessage);
      }

      if (result.additional_documents) {
        setAdditionalDocuments(result.additional_documents);
      }

      setIdProofFile(null);
      setAddressProofFile(null);
      setPhotoFile(null);
      setAdditionalFiles([]);

      if (typeof onSuccess === "function") {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } else {
      toast.error(result.message || "Operation failed");
    }
  } catch (err: any) {
    console.error("Failed to save tenant", err);
    toast.error(err.message || "Operation failed. Check console for details.");
  } finally {
    setLoading(false);
    setUploadProgress(0);
  }
};

  const handleInputChange  = (f:string,v:any) => setFormData((p:any)=>({...p,[f]:v}));
  const handleSelectChange = (f:string,v:string|undefined) => setFormData((p:any)=>({...p,[f]:v}));

  // ── Shared UI tokens ───────────────────────────────────────────────────────
  // h-8 inputs, 11px text — matches the blue-gradient dialog theme in the screenshot
  const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400";
  const L  = "block text-[11px] font-medium text-gray-500 mb-0.5";
  const SI = "text-[11px] py-0.5";
  const g2 = "grid grid-cols-2 gap-2";
  const g3 = "grid grid-cols-3 gap-2";

  // Section-header like in the image (small-caps label + icon)
  const SH = ({ icon, title, color="text-blue-600" }: {icon:React.ReactNode;title:string;color?:string}) => (
    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1.5 border-b border-gray-100 ${color}`}>
      {icon} {title}
    </div>
  );

  // ── DocumentPreview (logic 100% preserved) ────────────────────────────────
  const DocumentPreview = ({url,type,onRemove}:{url:string;type:string;onRemove?:()=>void}) => {
    if (!url) return null;
    const isImg  = url.match(/\.(jpeg|jpg|png|gif|webp|bmp)$/i);
    const isPdf  = url.match(/\.pdf$/i);
    const isWord = url.match(/\.(doc|docx)$/i);
    const icon   = isPdf?"📄 PDF":isWord?"📝 Word":"📋 Doc";
    const [err,setErr] = useState(false);
    return (
      <div className="mt-1 border rounded p-1.5 bg-white">
        <div className="flex gap-2 mb-1">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-[10px] flex items-center gap-0.5 hover:underline"><Eye className="h-2.5 w-2.5"/>View</a>
          {onRemove&&<button type="button" onClick={onRemove} className="text-red-400 text-[10px] flex items-center gap-0.5 hover:text-red-600"><X className="h-2.5 w-2.5"/>Remove</button>}
        </div>
        {isImg&&!err
          ? <div className="h-16 w-full rounded border overflow-hidden bg-gray-50"><img src={url} alt={type} className="h-full w-full object-contain" onError={()=>setErr(true)}/></div>
          : <div className="h-16 w-full bg-gray-100 rounded flex flex-col items-center justify-center"><FileText className="h-4 w-4 text-gray-400 mb-0.5"/><p className="text-[10px] text-gray-600">{icon}</p></div>
        }
      </div>
    );
  };

  // ── FileUploadField (logic 100% preserved) ────────────────────────────────
  const FileUploadField = ({label,file,setFile,existingUrl,fieldName,accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.doc,.docx",description="Max 10MB",required=true,onRemoveExisting}:{label:string;file:File|null;setFile:(f:File|null)=>void;existingUrl:string;fieldName:string;accept?:string;description?:string;required?:boolean;onRemoveExisting?:()=>void;}) => (
    <div className="space-y-1">
      <label className={L}><span className="flex items-center gap-1"><FileText className="h-3 w-3"/>{label}{required&&<span className="text-red-400">*</span>}</span></label>
      <Input id={fieldName} type="file" accept={accept} className={`cursor-pointer ${F}`}
        onChange={e=>{if(e.target.files?.[0]){if(e.target.files[0].size>10*1024*1024){toast.error("File exceeds 10MB");return;}setFile(e.target.files[0]);}}}/>
      {file&&(<div className="flex items-center justify-between p-1.5 bg-blue-50 border border-blue-100 rounded"><div><p className="text-[10px] font-medium text-blue-700">{file.name}</p><p className="text-[10px] text-blue-400">{(file.size/1024/1024).toFixed(2)} MB</p></div><button type="button" onClick={()=>setFile(null)} className="text-red-400"><X className="h-3 w-3"/></button></div>)}
      {!file&&existingUrl&&<DocumentPreview url={existingUrl} type={label} onRemove={()=>{setExistingFiles(p=>({...p,[fieldName]:""}));toast.info(`${label} removed on save`);}}/>}
      {!file&&!existingUrl&&(<div className="p-2 border-2 border-dashed border-gray-200 rounded text-center bg-gray-50"><Upload className="h-4 w-4 text-gray-300 mx-auto mb-0.5"/><p className="text-[10px] text-gray-400">{description}</p></div>)}
    </div>
  );

  const emergencyRelations = ["Father","Mother","Brother","Sister","Spouse","Friend","Relative","Guardian","Other"];

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    // The form fills 100% of whatever height the Dialog gives it.
    // The Dialog should set a fixed height — see the note below this file.
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">

      {/* Upload progress */}
      {loading&&uploadProgress>0&&(
        <div className="px-4 pt-1.5 flex-shrink-0 space-y-0.5">
          <div className="flex justify-between text-[10px] text-gray-400"><span>Uploading…</span><span>{uploadProgress}%</span></div>
          <Progress value={uploadProgress} className="h-1"/>
        </div>
      )}

      {/* ── Tab bar (fixed, never scrolls) ──────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-2 pb-0 border-b border-gray-100">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 h-9 w-full bg-gray-100/80 rounded-lg p-0.5 gap-0.5">
            {[
              {v:"basic",       ic:<User className="h-3 w-3"/>,      lb:"Basic" },
              {v:"occupation",  ic:<Briefcase className="h-3 w-3"/>, lb:"Work"  },
              {v:"address",     ic:<MapPin className="h-3 w-3"/>,    lb:"Addr"  },
              {v:"property",    ic:<Building className="h-3 w-3"/>,  lb:"Prop"  },
              {v:"terms",       ic:<FileText className="h-3 w-3"/>,  lb:"Terms" },
              {v:"documents",   ic:<Upload className="h-3 w-3"/>,    lb:"Docs"  },
              {v:"credentials", ic:<Key className="h-3 w-3"/>,       lb:"Login" },
            ].map(t=>(
              <TabsTrigger key={t.v} value={t.v}
                className="flex flex-col items-center justify-center gap-0.5 py-0.5 px-0 rounded-md text-gray-500
                  data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all">
                {t.ic}
                <span className="text-[8.5px] leading-none font-medium">{t.lb}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* ── Scrollable content area — fixed height comes from the Dialog ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>

          {/* ────────────────────────────────────────────────────────────────
              BASIC
          ──────────────────────────────────────────────────────────────── */}
          <TabsContent value="basic" className="mt-0 data-[state=inactive]:hidden">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">

                {/* LEFT */}
                <div className="space-y-3">
                  <SH icon={<User className="h-3 w-3"/>} title="Personal Info"/>

                  {/* Title + Name */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <div>
                      <label className={L}>Title</label>
                      <Select value={formData.salutation} onValueChange={v=>handleSelectChange("salutation",v)}>
                        <SelectTrigger className={F}><SelectValue placeholder="—"/></SelectTrigger>
                        <SelectContent>{["Mr","Mrs","Miss","Ms","Dr","Prof"].map(t=><SelectItem key={t} value={t} className={SI}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <label className={L}><span className="text-red-400">*</span> Full Name</label>
                      <Input value={formData.full_name} onChange={e=>handleInputChange("full_name",e.target.value)} placeholder="John Doe" required className={F}/>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className={L}><span className="text-red-400">*</span> Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-300"/>
                      <Input type="email" value={formData.email} onChange={e=>handleInputChange("email",e.target.value)} placeholder="john@example.com" required className={`pl-8 ${F}`}/>
                    </div>
                  </div>

                  {/* Password row — matching the image layout */}
                  {/* (credentials are in the credentials tab; this is just a visual ref)  */}

                  {/* Phone */}
                  <div>
                    <label className={L}><span className="text-red-400">*</span> Phone Number</label>
                    <div className="flex gap-1.5">
                      <Select value={formData.country_code} onValueChange={v=>handleInputChange("country_code",v)}>
                        <SelectTrigger className={`w-[84px] ${F}`}><SelectValue/></SelectTrigger>
                        <SelectContent>{options.countryCodes.map(c=><SelectItem key={c} value={c} className={SI}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="tel" value={formData.phone} onChange={e=>handleInputChange("phone",e.target.value)} placeholder="9876543210" pattern="[6-9][0-9]{9}" maxLength={10} required className={F}/>
                    </div>
                  </div>

                  {/* DOB */}
                  <div>
                    <label className={L}>Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-300"/>
                      <Input type="date" value={formData.date_of_birth}
                        onChange={e=>{
                          const sel=new Date(e.target.value);
                          const cut=new Date(new Date().getFullYear()-18,new Date().getMonth(),new Date().getDate());
                          if(sel>cut){toast.error("Must be at least 18 years old");return;}
                          handleInputChange("date_of_birth",e.target.value);
                        }}
                        max={new Date(new Date().getFullYear()-18,new Date().getMonth(),new Date().getDate()).toISOString().split("T")[0]}
                        className={`pl-8 ${F}`}/>
                    </div>
                    {formData.date_of_birth&&<p className="text-[10px] text-gray-400 mt-0.5">Age: {Math.floor((Date.now()-new Date(formData.date_of_birth).getTime())/(365.25*24*60*60*1000))} yrs</p>}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-3">
                  <SH icon={<Shield className="h-3 w-3"/>} title="Contact & Status" color="text-indigo-500"/>

                  {/* Gender */}
                  <div>
                    <label className={L}><span className="text-red-400">*</span> Gender</label>
                    <Select value={formData.gender} onValueChange={v=>handleSelectChange("gender",v)}>
                      <SelectTrigger className={F}><SelectValue placeholder="Select gender"/></SelectTrigger>
                      <SelectContent>{options.genderOptions.map(o=><SelectItem key={o} value={o} className={SI}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  {/* Emergency contact */}
                  <div>
                    <label className={L}>Emergency Contact</label>
                    <div className={`${g2} mb-1.5`}>
                      <Input placeholder="Name" value={formData.emergency_contact_name} onChange={e=>handleInputChange("emergency_contact_name",e.target.value)} className={F}/>
                      <Input placeholder="Phone" value={formData.emergency_contact_phone} onChange={e=>handleInputChange("emergency_contact_phone",e.target.value)} pattern="[6-9][0-9]{9}" maxLength={10} className={F}/>
                    </div>
                    <Select value={formData.emergency_contact_relation} onValueChange={v=>handleSelectChange("emergency_contact_relation",v)}>
                      <SelectTrigger className={F}><SelectValue placeholder="Relationship"/></SelectTrigger>
                      <SelectContent>{emergencyRelations.map(r=><SelectItem key={r} value={r} className={SI}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-[11px] font-medium text-gray-700">Active Tenant</p>
                      <p className="text-[10px] text-gray-400">Enable tenant account</p>
                    </div>
                    <Switch id="is_active" checked={formData.is_active} onCheckedChange={c=>handleInputChange("is_active",c)}/>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ────────────────────────────────────────────────────────────────
              OCCUPATION
          ──────────────────────────────────────────────────────────────── */}
          <TabsContent value="occupation" className="mt-0 data-[state=inactive]:hidden">
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
                {/* LEFT */}
                <div className="space-y-3">
                  <SH icon={<Briefcase className="h-3 w-3"/>} title="Job Details" color="text-green-600"/>

                  <div>
                    <label className={L}><span className="text-red-400">*</span> Occupation Category</label>
                    <Select value={formData.occupation_category} onValueChange={v=>handleSelectChange("occupation_category",v)}>
                      <SelectTrigger className={F}><SelectValue placeholder="Select category"/></SelectTrigger>
                      <SelectContent>{occupationCategoryOptions.map(o=><SelectItem key={o.value} value={o.value} className={SI}><span className="mr-1">{o.icon}</span>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  {formData.occupation_category&&(
                    <div>
                      <label className={L}>Sub-Category</label>
                      <Select value={formData.exact_occupation||""} onValueChange={v=>handleSelectChange("exact_occupation",v==="none"?"":v)}>
                        <SelectTrigger className={F}><SelectValue placeholder="Select sub-category (optional)"/></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" className={SI}>None (specify below)</SelectItem>
                          {availableSubCategories.map(s=><SelectItem key={s.value} value={s.value} className={SI}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.occupation_category&&(
                    <div>
                      <label className={L}>
                        {formData.occupation_category==="Student"?"College/University":
                         formData.occupation_category==="Working Professional"?"Company/Org":
                         formData.occupation_category==="Business Owner"?"Business Name":
                         formData.occupation_category==="Government Employee"?"Department/Office":"Organization (Optional)"}
                      </label>
                      <Input value={formData.organization||""} onChange={e=>handleInputChange("organization",e.target.value)} placeholder="Enter name" className={F}/>
                    </div>
                  )}

                  {(formData.occupation_category==="Working Professional"||formData.occupation_category==="Business Owner"||formData.occupation_category==="Consultant")&&(
                    <div className={g2}>
                      <div><label className={L}>Experience (yrs)</label><Input type="number" min="0" max="50" value={formData.years_of_experience||""} onChange={e=>handleInputChange("years_of_experience",e.target.value)} placeholder="5" className={F}/></div>
                      <div><label className={L}>Monthly Income (₹)</label><Input type="number" min="0" value={formData.monthly_income||""} onChange={e=>handleInputChange("monthly_income",e.target.value)} placeholder="50000" className={F}/></div>
                    </div>
                  )}

                  {formData.occupation_category==="Student"&&(
                    <div className={g2}>
                      <div>
                        <label className={L}>Course Duration</label>
                        <Select value={formData.course_duration||""} onValueChange={v=>handleSelectChange("course_duration",v)}>
                          <SelectTrigger className={F}><SelectValue placeholder="Duration"/></SelectTrigger>
                          <SelectContent>{[["1_year","1 Year"],["2_years","2 Years"],["3_years","3 Years"],["4_years","4 Years"],["5_years","5+ Years"]].map(([v,l])=><SelectItem key={v} value={v} className={SI}>{l}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div><label className={L}>Student ID</label><Input value={formData.student_id||""} onChange={e=>handleInputChange("student_id",e.target.value)} placeholder="University ID" className={F}/></div>
                    </div>
                  )}

                  {formData.occupation_category==="Government Employee"&&(
                    <div><label className={L}>Employee / Service ID</label><Input value={formData.employee_id||""} onChange={e=>handleInputChange("employee_id",e.target.value)} placeholder="Employee ID" className={F}/></div>
                  )}

                  {formData.occupation_category==="Freelancer / Self-Employed"&&(
                    <div><label className={L}>Portfolio / Website URL</label><Input type="url" value={formData.portfolio_url||""} onChange={e=>handleInputChange("portfolio_url",e.target.value)} placeholder="github.com/username" className={F}/></div>
                  )}
                </div>

                {/* RIGHT */}
                <div className="space-y-3">
                  <SH icon={<Clock3 className="h-3 w-3"/>} title="Schedule & Check-in" color="text-purple-600"/>

                  <div>
                    <label className={L}>Work Mode (Optional)</label>
                    <Select value={formData.work_mode||""} onValueChange={v=>handleSelectChange("work_mode",v)}>
                      <SelectTrigger className={F}><SelectValue placeholder="Select work mode"/></SelectTrigger>
                      <SelectContent>{[["remote","Fully Remote"],["hybrid","Hybrid"],["onsite","On-site"],["flexible","Flexible"]].map(([v,l])=><SelectItem key={v} value={v} className={SI}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className={L}>Shift Timing (Optional)</label>
                    <Select value={formData.shift_timing||""} onValueChange={v=>handleSelectChange("shift_timing",v)}>
                      <SelectTrigger className={F}><SelectValue placeholder="Select shift"/></SelectTrigger>
                      <SelectContent>{[["day","Day"],["night","Night"],["rotating","Rotating"],["flexible","Flexible"]].map(([v,l])=><SelectItem key={v} value={v} className={SI}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div>
  <label className={L}>Check-in Date</label>
  <div className="relative">
    <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-300"/>
    <Input 
      type="date" 
      value={formData.check_in_date}
      max={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]} // Last day of current month
      onChange={e=>{
        handleInputChange("check_in_date",e.target.value);
      }}
      className={`pl-8 ${F}`}
    />
  </div>
  {formData.check_in_date && <p className="text-[10px] text-gray-400 mt-0.5">Tenant move-in date</p>}
</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ────────────────────────────────────────────────────────────────
              ADDRESS
          ──────────────────────────────────────────────────────────────── */}
          <TabsContent value="address" className="mt-0 data-[state=inactive]:hidden">
            <div className="p-4 space-y-3">
              <SH icon={<MapPin className="h-3 w-3"/>} title="Address Details" color="text-purple-600"/>
              <div>
                <label className={L}><span className="text-red-400">*</span> Complete Address</label>
                <Textarea value={formData.address} onChange={e=>handleInputChange("address",e.target.value)}
                  placeholder="House no, Building, Street, Area, Landmark" rows={3} className="text-[11px] resize-none" required/>
              </div>
              <div className={g3}>
                <div>
                  <label className={L}><span className="text-red-400">*</span> City</label>
                  <Select value={formData.city_id?String(formData.city_id):""} disabled={loadingMasters}
                    onValueChange={v=>{const s=cities.find(c=>c.id===parseInt(v));handleSelectChange("city_id",v);handleSelectChange("city",s?.name||"");}}>
                    <SelectTrigger className={F}><SelectValue placeholder={loadingMasters?"Loading…":"City"}/></SelectTrigger>
                    <SelectContent>
                      {loadingMasters?<div className="px-2 py-1 text-[10px] text-gray-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/>Loading…</div>
                        :cities.length>0?cities.map(c=><SelectItem key={c.id} value={String(c.id)} className={SI}>{c.name}</SelectItem>)
                        :<div className="px-2 py-1 text-[10px] text-gray-400">No cities</div>}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={L}><span className="text-red-400">*</span> State</label>
                  <Select value={formData.state_id?String(formData.state_id):""} disabled={loadingMasters}
                    onValueChange={v=>{const s=states.find(st=>st.id===parseInt(v));handleSelectChange("state_id",v);handleSelectChange("state",s?.name||"");}}>
                    <SelectTrigger className={F}><SelectValue placeholder={loadingMasters?"Loading…":"State"}/></SelectTrigger>
                    <SelectContent>
                      {loadingMasters?<div className="px-2 py-1 text-[10px] text-gray-400 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/>Loading…</div>
                        :states.length>0?states.map(s=><SelectItem key={s.id} value={String(s.id)} className={SI}>{s.name}</SelectItem>)
                        :<div className="px-2 py-1 text-[10px] text-gray-400">No states</div>}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={L}>Pincode</label>
                  <Input value={formData.pincode} onChange={e=>handleInputChange("pincode",e.target.value)} placeholder="6-digit" maxLength={6} className={F}/>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ────────────────────────────────────────────────────────────────
              PROPERTY
          ──────────────────────────────────────────────────────────────── */}
          <TabsContent value="property" className="mt-0 data-[state=inactive]:hidden">
            <div className="p-4 space-y-3">
              <SH icon={<Building className="h-3 w-3"/>} title="Property Assignment" color="text-indigo-600"/>
              <div>
                <label className={L}>Assigned Property</label>
                <Select value={formData.property_id?.toString()||""} onValueChange={v=>handlePropertySelect(v?parseInt(v):undefined)}>
                  <SelectTrigger className={F}><SelectValue placeholder="Select property to assign"/></SelectTrigger>
                  <SelectContent>{properties.map(p=><SelectItem key={p.value} value={p.value.toString()} className={SI}><div className="flex flex-col"><span className="font-medium">{p.label}</span><span className="text-[10px] text-gray-400">{p.address}</span></div></SelectItem>)}</SelectContent>
                </Select>
                <p className="text-[10px] text-gray-400 mt-0.5">Actual property where tenant will be staying</p>
              </div>
              {selectedPropertyDetails&&(
                <div className="border border-blue-100 rounded-lg p-3 bg-blue-50/60">
                  <p className="text-[11px] font-bold text-blue-700 mb-2 flex items-center gap-1"><Building className="h-3 w-3"/> Selected Property Details</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
                    {[
                      ["Property",       selectedPropertyDetails.name],
                      ["Lock-in",        `${selectedPropertyDetails.lockin_period_months} months`],
                      ["Lock-in Penalty",`${selectedPropertyDetails.lockin_penalty_type==="percentage"?"%":"₹"}${selectedPropertyDetails.lockin_penalty_amount} (${selectedPropertyDetails.lockin_penalty_type})`],
                      ["Notice Period",  `${selectedPropertyDetails.notice_period_days} days`],
                      ["Notice Penalty", `${selectedPropertyDetails.notice_penalty_type==="percentage"?"%":"₹"}${selectedPropertyDetails.notice_penalty_amount} (${selectedPropertyDetails.notice_penalty_type})`],
                    ].map(([k,v])=>(
                      <div key={k}><p className="text-gray-500">{k}</p><p className="font-medium text-gray-700">{v}</p></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ────────────────────────────────────────────────────────────────
              TERMS
          ──────────────────────────────────────────────────────────────── */}
          <TabsContent value="terms" className="mt-0 data-[state=inactive]:hidden">
            <div className="p-4 space-y-3">
              <SH icon={<FileText className="h-3 w-3"/>} title="Rental Terms & Conditions" color="text-purple-600"/>

              {/* Toggle */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <div><p className="text-[11px] font-medium text-gray-700">Use Custom Terms</p><p className="text-[10px] text-gray-400">Override property defaults for this tenant</p></div>
                <Switch checked={useCustomTerms}
                  onCheckedChange={checked=>{
                    setUseCustomTerms(checked);
                    if (!checked&&selectedPropertyDetails) setFormData((p:any)=>({...p,lockin_period_months:selectedPropertyDetails.lockin_period_months||0,lockin_penalty_amount:selectedPropertyDetails.lockin_penalty_amount||0,lockin_penalty_type:selectedPropertyDetails.lockin_penalty_type||"fixed",notice_period_days:selectedPropertyDetails.notice_period_days||0,notice_penalty_amount:selectedPropertyDetails.notice_penalty_amount||0,notice_penalty_type:selectedPropertyDetails.notice_penalty_type||"fixed"}));
                    else if (checked&&tenant) setFormData((p:any)=>({...p,lockin_period_months:tenant.lockin_period_months||selectedPropertyDetails?.lockin_period_months||0,lockin_penalty_amount:tenant.lockin_penalty_amount||selectedPropertyDetails?.lockin_penalty_amount||0,lockin_penalty_type:tenant.lockin_penalty_type||selectedPropertyDetails?.lockin_penalty_type||"fixed",notice_period_days:tenant.notice_period_days||selectedPropertyDetails?.notice_period_days||0,notice_penalty_amount:tenant.notice_penalty_amount||selectedPropertyDetails?.notice_penalty_amount||0,notice_penalty_type:tenant.notice_penalty_type||selectedPropertyDetails?.notice_penalty_type||"fixed"}));
                  }}/>
              </div>

              {useCustomTerms||!selectedPropertyDetails?(
                <div className={g2}>
                  {/* Lock-in */}
                  <div className="space-y-2 border border-blue-100 bg-blue-50/40 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Calendar className="h-3 w-3"/> LOCK-IN PERIOD</p>
                    <div><label className={L}>Duration (months)</label><Input type="number" min="0" value={formData.lockin_period_months||""} onChange={e=>handleInputChange("lockin_period_months",parseInt(e.target.value)||0)} placeholder="12" className={F}/></div>
                    <div><label className={L}>Penalty</label>
                      <div className={g2}>
                        <Input type="number" min="0" value={formData.lockin_penalty_amount||""} onChange={e=>handleInputChange("lockin_penalty_amount",parseFloat(e.target.value)||0)} placeholder="Amount" className={F}/>
                        <Select value={formData.lockin_penalty_type} onValueChange={v=>handleSelectChange("lockin_penalty_type",v)}>
                          <SelectTrigger className={F}><SelectValue/></SelectTrigger>
                          <SelectContent><SelectItem value="fixed" className={SI}>Fixed (₹)</SelectItem><SelectItem value="percentage" className={SI}>Percent (%)</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/* Notice */}
                  <div className="space-y-2 border border-amber-100 bg-amber-50/40 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1"><Clock3 className="h-3 w-3"/> NOTICE PERIOD</p>
                    <div><label className={L}>Duration (days)</label><Input type="number" min="0" value={formData.notice_period_days||""} onChange={e=>handleInputChange("notice_period_days",parseInt(e.target.value)||0)} placeholder="30" className={F}/></div>
                    <div><label className={L}>Penalty</label>
                      <div className={g2}>
                        <Input type="number" min="0" value={formData.notice_penalty_amount||""} onChange={e=>handleInputChange("notice_penalty_amount",parseFloat(e.target.value)||0)} placeholder="Amount" className={F}/>
                        <Select value={formData.notice_penalty_type} onValueChange={v=>handleSelectChange("notice_penalty_type",v)}>
                          <SelectTrigger className={F}><SelectValue/></SelectTrigger>
                          <SelectContent><SelectItem value="fixed" className={SI}>Fixed (₹)</SelectItem><SelectItem value="percentage" className={SI}>Percent (%)</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              ):(
                <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                  <p className="text-[11px] font-bold text-green-700 flex items-center gap-1 mb-1.5"><Check className="h-3 w-3"/> Using Property's Default Terms</p>
                  <div className={g2}>
                    {[
                      ["Lock-in",`${formData.lockin_period_months} mo · ${formData.lockin_penalty_type==="percentage"?"%":"₹"}${formData.lockin_penalty_amount}`],
                      ["Notice", `${formData.notice_period_days} days · ${formData.notice_penalty_type==="percentage"?"%":"₹"}${formData.notice_penalty_amount}`],
                    ].map(([k,v])=>(
                      <div key={k} className="text-[10px]"><p className="text-gray-500">{k}</p><p className="font-semibold text-gray-700">{v}</p></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Summary</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
                  {[
                    ["Lock-in Period",  `${formData.lockin_period_months} months`],
                    ["Lock-in Penalty", `${formData.lockin_penalty_type==="percentage"?"%":"₹"}${formData.lockin_penalty_amount} (${formData.lockin_penalty_type})`],
                    ["Notice Period",   `${formData.notice_period_days} days`],
                    ["Notice Penalty",  `${formData.notice_penalty_type==="percentage"?"%":"₹"}${formData.notice_penalty_amount} (${formData.notice_penalty_type})`],
                  ].map(([k,v])=>(
                    <div key={k}><p className="text-gray-400">{k}</p><p className="font-semibold text-gray-700">{v}</p></div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

 {/* ────────────────────────────────────────────────────────────────
    DOCUMENTS
──────────────────────────────────────────────────────────────── */}
<TabsContent value="documents" className="mt-0 data-[state=inactive]:hidden">
  <div className="p-4 space-y-3">
    <SH icon={<Upload className="h-3 w-3"/>} title="Upload Documents" color="text-amber-600"/>

    <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
      <AlertCircle className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5"/>
      <p className="text-[10px] text-blue-600">Max 10MB per file · PDF, JPG, PNG, WebP, BMP</p>
    </div>

    {/* Document Upload Fields */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

      {/* ── ID Proof ── */}
<div className="space-y-1.5">
  <label className={L}>
    <span className="flex items-center gap-1"><FileText className="h-3 w-3"/> ID Proof Type <span className="text-red-400">*</span></span>
  </label>
  <Select value={idProofType} onValueChange={setIdProofType}>
    <SelectTrigger className={F}><SelectValue placeholder="Select ID type"/></SelectTrigger>
    <SelectContent>
      <SelectItem value="Aadhar Card" className={SI}>Aadhar Card</SelectItem>
      <SelectItem value="Passport" className={SI}>Passport</SelectItem>
      <SelectItem value="PAN Card" className={SI}>PAN Card</SelectItem>
      <SelectItem value="Driving Licence" className={SI}>Driving Licence</SelectItem>
      <SelectItem value="Voter ID" className={SI}>Voter ID</SelectItem>
    </SelectContent>
  </Select>

  {/* ID Proof Number Field */}
  <div>
    <label className={L}>
      {idProofType === "Aadhar Card" ? "Aadhar Number" : 
       idProofType === "Passport" ? "Passport Number" :
       idProofType === "PAN Card" ? "PAN Number" :
       idProofType === "Driving Licence" ? "Driving Licence Number" :
       idProofType === "Voter ID" ? "Voter ID Number" : "Document Number"}
      {idProofType && <span className="text-red-400">*</span>}
    </label>
    <Input
      value={idProofNumber}
      onChange={e => {
        let value = e.target.value;
        if (idProofType === "Aadhar Card") {
          // Format Aadhar with spaces
          value = value.replace(/\D/g, '').slice(0, 12);
          if (value.length > 4) {
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
          }
        } else if (idProofType === "PAN Card") {
          value = value.toUpperCase().slice(0, 10);
        } else if (idProofType === "Passport") {
          value = value.toUpperCase().slice(0, 9);
        }
        setIdProofNumber(value);
      }}
      placeholder={
        idProofType === "Aadhar Card" ? "XXXX XXXX XXXX" :
        idProofType === "PAN Card" ? "ABCDE1234F" :
        idProofType === "Passport" ? "A1234567" :
        "Enter document number"
      }
      className={F}
      maxLength={
        idProofType === "Aadhar Card" ? 14 :
        idProofType === "PAN Card" ? 10 :
        idProofType === "Passport" ? 9 : 50
      }
    />
    <p className="text-[10px] text-gray-400 mt-0.5">
      {idProofType === "Aadhar Card" ? "12-digit Aadhar number" :
       idProofType === "PAN Card" ? "10-digit PAN number" :
       idProofType === "Passport" ? "Passport number (e.g., A1234567)" :
       ""}
    </p>
  </div>

  <FileUploadField
    label="ID Proof Document"
    file={idProofFile} setFile={setIdProofFile}
    existingUrl={existingFiles.id_proof_url}
    fieldName="id_proof_url"
    description="Upload ID proof document"
    onRemoveExisting={()=>setExistingFiles(p=>({...p,id_proof_url:""}))}
  />
</div>

{/* ── Address Proof ── */}
<div className="space-y-1.5">
  <label className={L}>
    <span className="flex items-center gap-1"><FileText className="h-3 w-3"/> Address Proof Type <span className="text-red-400">*</span></span>
  </label>
  <Select value={addressProofType} onValueChange={setAddressProofType}>
    <SelectTrigger className={F}><SelectValue placeholder="Select address proof"/></SelectTrigger>
    <SelectContent>
      <SelectItem value="Aadhar Card" className={SI}>Aadhar Card</SelectItem>
      <SelectItem value="Utility Bill" className={SI}>Utility Bill</SelectItem>
      <SelectItem value="Bank Statement" className={SI}>Bank Statement</SelectItem>
      <SelectItem value="Passport" className={SI}>Passport</SelectItem>
      <SelectItem value="Rental Agreement" className={SI}>Rental Agreement</SelectItem>
      <SelectItem value="Voter ID" className={SI}>Voter ID</SelectItem>
    </SelectContent>
  </Select>

  {/* Address Proof Number Field */}
  <div>
    <label className={L}>
      {addressProofType === "Aadhar Card" ? "Aadhar Number" : 
       addressProofType === "Passport" ? "Passport Number" :
       addressProofType === "Voter ID" ? "Voter ID Number" : "Document Number"}
    </label>
    <Input
      value={addressProofNumber}
      onChange={e => {
        let value = e.target.value;
        if (addressProofType === "Aadhar Card") {
          value = value.replace(/\D/g, '').slice(0, 12);
          if (value.length > 4) {
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
          }
        } else if (addressProofType === "Passport") {
          value = value.toUpperCase().slice(0, 9);
        }
        setAddressProofNumber(value);
      }}
      placeholder={
        addressProofType === "Aadhar Card" ? "XXXX XXXX XXXX" :
        addressProofType === "Passport" ? "A1234567" :
        "Enter document number"
      }
      className={F}
    />
  </div>

  <FileUploadField
    label="Address Proof Document"
    file={addressProofFile} setFile={setAddressProofFile}
    existingUrl={existingFiles.address_proof_url}
    fieldName="address_proof_url"
    description="Upload address proof document"
    onRemoveExisting={()=>setExistingFiles(p=>({...p,address_proof_url:""}))}
  />
</div>

      {/* ── Photograph ── */}
      <FileUploadField
        label="Photograph"
        file={photoFile} setFile={setPhotoFile}
        existingUrl={existingFiles.photo_url}
        fieldName="photo_url"
        accept=".jpg,.jpeg,.png,.webp,.bmp"
        description="Passport-size photo"
        onRemoveExisting={()=>setExistingFiles(p=>({...p,photo_url:""}))}
      />
    </div>

    {/* PAN standalone — only if PAN not already captured via ID proof */}
    {/* {idProofType !== "PAN Card" && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={L}>
            <span className="flex items-center gap-1"><FileText className="h-3 w-3"/> PAN Card Number (Optional)</span>
          </label>
          <Input
            value={panNumber}
            onChange={e => setPanNumber(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            className={`${F} uppercase`}
            maxLength={10}
          />
          <p className="text-[10px] text-gray-400 mt-0.5">10-digit PAN number</p>
        </div>
      </div>
    )} */}

    <Separator/>

    {/* Additional documents */}
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-600">Additional Documents (Optional)</p>
        <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] px-2"
          onClick={()=>{
            const inp=document.createElement("input");
            inp.type="file"; inp.accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.doc,.docx"; inp.multiple=true;
            inp.onchange=(e:any)=>{
              const files=Array.from(e.target.files) as File[];
              if(files.length+additionalFiles.length>5){toast.error("Maximum 5 additional documents");return;}
              setAdditionalFiles(p=>[...p,...files]);
            };
            inp.click();
          }}>
          <Upload className="h-3 w-3 mr-1"/> Add Files
        </Button>
      </div>

      {additionalDocuments.length>0&&(
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-gray-400">Existing:</p>
          {additionalDocuments.map((doc,i)=>(
            <div key={i} className="flex items-center justify-between p-1.5 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2"><FileText className="h-3 w-3 text-gray-400"/>
                <div><p className="text-[10px] font-medium text-gray-700">{doc.filename}</p>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline">View</a>
                </div>
              </div>
              <button type="button" className="text-red-400 hover:text-red-600"
                onClick={()=>{setAdditionalDocuments(p=>p.filter((_,j)=>j!==i));toast.info("Removed on save");}}>
                <X className="h-3 w-3"/>
              </button>
            </div>
          ))}
        </div>
      )}

      {additionalFiles.length>0&&(
        <div className="space-y-1">
          <p className="text-[10px] font-medium text-gray-400">New to upload:</p>
          {additionalFiles.map((file,i)=>(
            <div key={i} className="flex items-center justify-between p-1.5 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2"><FileText className="h-3 w-3 text-blue-400"/>
                <div><p className="text-[10px] font-medium text-blue-700">{file.name}</p>
                  <p className="text-[10px] text-blue-400">{(file.size/1024/1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button type="button" className="text-red-400 hover:text-red-600"
                onClick={()=>setAdditionalFiles(p=>p.filter((_,j)=>j!==i))}>
                <X className="h-3 w-3"/>
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-gray-400">Company ID, college ID, reference letters, etc. Max 5 files.</p>
    </div>
  </div>
</TabsContent>
          {/* ────────────────────────────────────────────────────────────────
              CREDENTIALS
          ──────────────────────────────────────────────────────────────── */}
          <TabsContent value="credentials" className="mt-0 data-[state=inactive]:hidden">
            <div className="p-4 space-y-3">
              <SH icon={<Key className="h-3 w-3"/>} title="Login Credentials" color="text-emerald-600"/>

              {/* Status alerts — only when editing */}
              {tenant?.id&&(
                tenant?.has_credentials?(
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                    <Shield className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5"/>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-blue-800">Login Already Configured</p>
                      <p className="text-[10px] text-blue-600">To reset password, set a new password below.</p>
                      <p className="text-[10px]"><span className="font-medium">Email:</span> {tenant.credential_email||tenant.email}</p>
                      <p className="text-[10px]"><span className="font-medium">Status:</span>{" "}<Badge variant="outline" className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0">Active</Badge></p>
                      <div>
                        <p className="text-[10px] font-medium text-gray-600 mb-0.5">Current Password:</p>
                        <div className="relative w-40">
                          <Input type={showExistingPassword?"text":"password"} value={existingPassword} readOnly disabled className="h-7 text-[11px] bg-white pr-7"/>
                          <button type="button" onClick={()=>setShowExistingPassword(!showExistingPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                            {showExistingPassword?<EyeOff className="h-3 w-3"/>:<Eye className="h-3 w-3"/>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ):(
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                    <Key className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5"/>
                    <div><p className="text-[11px] font-semibold text-blue-800">Create Portal Access</p><p className="text-[10px] text-blue-600">Set a password to enable tenant portal access.</p></div>
                  </div>
                )
              )}

              {/* Enable toggle */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <div><p className="text-[11px] font-medium text-gray-700">Enable Portal Access</p><p className="text-[10px] text-gray-400">Allow tenant to log in with credentials</p></div>
                <Switch checked={createCredentials} onCheckedChange={setCreateCredentials}/>
              </div>

              {createCredentials&&(
                <div className="space-y-3">
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] px-2.5"
                      onClick={()=>{
                        const name=formData.full_name||tenant?.full_name||"";
                        const dob=formData.date_of_birth||tenant?.date_of_birth||"";
                        const parts=name.trim().split(" ");
                        const fi=parts[0]?.charAt(0).toUpperCase()||"X";
                        const li=parts.length>1?parts[parts.length-1].charAt(0).toUpperCase():"X";
                        let dp=""; if(dob){const d=new Date(dob);if(!isNaN(d.getTime()))dp=d.getFullYear().toString();}
                        if(!dp) dp=Math.floor(1000+Math.random()*9000).toString();
                        const gen=`${fi}${li.toLowerCase()}${dp}$`;
                        setPassword(gen);setConfirmPassword(gen);toast.success("Password generated!");
                      }}>
                      <Key className="h-3 w-3 mr-1"/> Generate Password
                    </Button>
                    {tenant?.email&&(
                      <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] px-2.5"
                        onClick={()=>{if(!password&&!tenant?.has_credentials){toast.error("Set a password first");return;}toast.success(`Credentials will be sent to ${tenant.email}`);}}>
                        <Mail className="h-3 w-3 mr-1"/> Send to Email
                      </Button>
                    )}
                  </div>

                  {/* Password + Confirm */}
                  <div className={g2}>
                    <div className="space-y-1">
                      <label className={L}>{tenant?.has_credentials?"New Password (blank = keep)":"Password *"}</label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-300"/>
                        <Input id="password" type={showPassword?"text":"password"}
                          placeholder={tenant?.has_credentials?"New password to change":"Password"}
                          value={password} onChange={e=>setPassword(e.target.value)} className={`pl-8 pr-8 ${F}`} minLength={6}/>
                        <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword?<EyeOff className="h-3.5 w-3.5"/>:<Eye className="h-3.5 w-3.5"/>}
                        </button>
                      </div>
                      {password.length>0&&(
                        <div>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="text-gray-400">Strength</span>
                            <span className={passwordStrength>=75?"text-green-600":passwordStrength>=50?"text-yellow-500":passwordStrength>=25?"text-orange-500":"text-red-500"}>
                              {passwordStrength>=75?"Strong":passwordStrength>=50?"Good":passwordStrength>=25?"Weak":"Very Weak"}
                            </span>
                          </div>
                          <Progress value={passwordStrength} className="h-1"/>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className={L}>Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-300"/>
                        <Input id="confirmPassword" type={showConfirmPassword?"text":"password"}
                          placeholder="Confirm password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className={`pl-8 pr-8 ${F}`} minLength={6}/>
                        <button type="button" onClick={()=>setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirmPassword?<EyeOff className="h-3.5 w-3.5"/>:<Eye className="h-3.5 w-3.5"/>}
                        </button>
                      </div>
                      {password&&confirmPassword&&(
                        <div className={`flex items-center gap-1 text-[10px] mt-0.5 ${password===confirmPassword?"text-green-600":"text-red-500"}`}>
                          {password===confirmPassword?<><Check className="h-3 w-3"/>Passwords match</>:<><AlertTriangle className="h-3 w-3"/>Don't match</>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="p-2.5 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Password Requirements</p>
                    <ul className="space-y-1">
                      {[
                        [password.length>=6,            "Minimum 6 characters"],
                        [/[A-Z]/.test(password),         "Uppercase letter"],
                        [/[0-9]/.test(password),         "Number"],
                        [/[^A-Za-z0-9]/.test(password),  "Special character"],
                      ].map(([ok,txt],i)=>(
                        <li key={i} className={`flex items-center gap-1.5 text-[10px] ${ok?"text-green-600":"text-gray-400"}`}>
                          <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${ok?"bg-green-500":"bg-gray-300"}`}/>
                          {txt as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>{/* end scrollable */}

      {/* ── Fixed footer ────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-2.5 flex items-center justify-between">
        {/* Left: Prev + dots + Next */}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm"
            onClick={goToPrevTab} disabled={activeTab===tabs[0]||loading}
            className="h-7 px-3 text-[11px] border-gray-200 text-gray-600 hover:text-gray-800">
            <ChevronLeft className="h-3.5 w-3.5 mr-0.5"/> Prev
          </Button>

          <div className="flex items-center gap-1">
            {tabs.map(t=>(
              <button key={t} type="button" onClick={()=>setActiveTab(t)}
                className={`rounded-full transition-all duration-200 ${activeTab===t?"w-5 h-1.5 bg-blue-600":"w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"}`}
              />
            ))}
          </div>

          {activeTab!==tabs[tabs.length-1]?(
            <Button type="button" variant="outline" size="sm" onClick={goToNextTab}
              className="h-7 px-3 text-[11px] border-gray-200 text-gray-600 hover:text-gray-800">
              Next <ChevronRight className="h-3.5 w-3.5 ml-0.5"/>
            </Button>
          ):<div className="w-16"/>}
        </div>

        {/* Right: Cancel + Submit (always visible, matches image) */}
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm"
            onClick={onCancel} disabled={loading}
            className="h-7 px-4 text-[11px] text-gray-500 hover:text-gray-700 border border-gray-200">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}
            className="h-7 px-5 text-[11px] font-semibold rounded-lg shadow-sm
              bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
            {loading
              ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin"/>{uploadProgress>0?"Uploading…":"Saving…"}</>
              : tenant?"Update Tenant":"Add Tenant"}
          </Button>
        </div>
      </div>

    </form>
  );
}