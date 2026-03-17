// DocumentCreate.tsx
// Changes vs original:
// 1. Step 2: fetches tenants-with-template to exclude tenants already having that doc
// 2. Step 2: Property filter + Floor filter — loads properties from API, then floors from rooms
// 3. Tenant list filtered by selected property+floor (via bed_assignments in rooms)
// 4. Expiry: documents past expiry_date are hidden (handled in listDocuments via hide_expired)

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FileText, Eye, Save, X, ChevronLeft, ChevronRight,
  Clock, CheckCircle, AlertCircle, Search, User, Phone,
  Mail, Building2, Loader2, UserCheck, Printer, RefreshCw,
  LayoutTemplate, Tag, Hash, Shield, Zap, Check, IndianRupee, Download,
  Filter,
} from "lucide-react";
import { Input }  from "@/components/ui/input";
import { Badge }  from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { listTemplates, getTemplate, type DocumentTemplate } from "@/lib/documentTemplateApi";
import { listTenants }                                        from "@/lib/tenantApi";
import { tenantDetailsApi }                                   from "@/lib/tenantDetailsApi";
import { getProperty, listProperties }                        from "@/lib/propertyApi";
import { listRoomsByProperty }                                from "@/lib/roomsApi";
// NEW import for tenant-with-template check
import { getTenantsWithDocumentForTemplate }                  from "@/lib/documentApi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ── Style tokens ──────────────────────────────────────────────────────────────
const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L  = "block text-[10px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide";
const SI = "text-[11px] py-0.5";

const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
    {icon}{title}
  </div>
);

const StatCard = ({ label, value, icon: Icon, accent }: any) => (
  <Card className="border-0 shadow-sm bg-white">
    <CardContent className="p-2.5 flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${accent}`}><Icon className="h-3.5 w-3.5 text-white" /></div>
      <div>
        <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xs font-bold text-gray-800">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const StepDot = ({ n, label, cur, done }: { n: number; label: string; cur: number; done: boolean }) => (
  <div className="flex items-center gap-1.5 flex-shrink-0">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all
      ${cur === n ? "bg-blue-600 text-white shadow-md shadow-blue-200" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
      {done ? <Check className="h-3 w-3" /> : n}
    </div>
    <span className={`text-[11px] font-semibold hidden sm:inline
      ${cur === n ? "text-blue-700" : done ? "text-green-600" : "text-gray-400"}`}>{label}</span>
  </div>
);

// ── Constants ─────────────────────────────────────────────────────────────────
const TPL_CATS = [
  "All","Agreements","Rental Agreements","KYC Documents","Onboarding Documents",
  "Financial Documents","Policy Documents","Exit Documents","Inspection Forms","Declarations","Other",
];
const PRIORITY_OPTS = [
  { value:"low",    label:"Low",    cls:"bg-gray-100 text-gray-600" },
  { value:"normal", label:"Normal", cls:"bg-blue-100 text-blue-700" },
  { value:"high",   label:"High",   cls:"bg-orange-100 text-orange-700" },
  { value:"urgent", label:"Urgent", cls:"bg-red-100 text-red-700" },
];

const HIDDEN_VARS    = ["document_number","logo_url","document_title"];
const GROUP_SYSTEM   = ["document_type","date"];
const GROUP_TENANT   = ["tenant_name","tenant_phone","tenant_email","aadhaar_number","pan_number","emergency_contact_name","emergency_phone"];
const GROUP_PROPERTY = ["property_name","room_number","bed_number","move_in_date","rent_amount","security_deposit","payment_mode"];
const GROUP_COMPANY  = ["company_name","company_address"];
const ALL_GROUPED    = [...GROUP_SYSTEM, ...GROUP_TENANT, ...GROUP_PROPERTY, ...GROUP_COMPANY];

const safeNum  = (v: any) => { const n = parseFloat(String(v ?? "")); return isNaN(n) ? 0 : n; };
const money    = (v: any) => `₹${safeNum(v).toLocaleString("en-IN")}`;

const toInputDate = (d: string | undefined | null): string => {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? "" : dt.toISOString().split("T")[0];
  } catch { return ""; }
};

const todayStr = () =>
  new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getFieldType = (k: string) => {
  if (k.includes("date"))   return "date";
  if (k.includes("email"))  return "email";
  if (k.includes("phone"))  return "tel";
  if (["amount","deposit","rent"].some(x => k.includes(x))) return "number";
  return "text";
};
const getFieldLabel = (k: string) =>
  k.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const renderHtml = (html: string, data: Record<string, string>, logoSrc?: string) => {
  let out = html;
  out = logoSrc
    ? out.replace(/\{\{logo_url\}\}/g, `<img src="${logoSrc}" style="max-height:60px;max-width:160px;object-fit:contain;" />`)
    : out.replace(/\{\{logo_url\}\}/g, "");
  Object.entries(data).forEach(([k, v]) => {
    out = out.replace(new RegExp(`\\{\\{${escRe(k)}\\}\\}`, "g"), v || "");
  });
  return out.replace(/\{\{[\w_]+\}\}/g, "—");
};

// ── FieldInput ────────────────────────────────────────────────────────────────
function FieldInput({ variable, formData, setFormData, required = false }: {
  variable: string;
  formData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  required?: boolean;
}) {
  const raw    = formData[variable];
  const strVal = raw != null ? String(raw) : "";
  const filled = !!strVal.trim();

  return (
    <div>
      <label className={L}>
        {getFieldLabel(variable)}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={getFieldType(variable)}
        value={strVal}
        onChange={e => setFormData(p => ({ ...p, [variable]: e.target.value }))}
        placeholder={getFieldLabel(variable)}
        className={`w-full h-8 px-2.5 text-[11px] border rounded-md transition-all font-medium outline-none
          ${filled
            ? "border-green-300 bg-green-50/40 focus:border-green-400 focus:ring-1 focus:ring-green-100"
            : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100"}`}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export function DocumentCreate() {
  // Templates
  const [templates,      setTemplates]      = useState<DocumentTemplate[]>([]);
  const [filteredTpls,   setFilteredTpls]   = useState<DocumentTemplate[]>([]);
  const [selTemplate,    setSelTemplate]    = useState<DocumentTemplate | null>(null);
  const [loadingTpls,    setLoadingTpls]    = useState(true);
  const [tplSearch,      setTplSearch]      = useState("");
  const [catFilter,      setCatFilter]      = useState("All");

  // Tenants
  const [tenantList,          setTenantList]          = useState<any[]>([]);
  const [filteredTenantList,  setFilteredTenantList]  = useState<any[]>([]);
  const [tenantSearch,        setTenantSearch]        = useState("");
  const [loadingTenants,      setLoadingTenants]      = useState(false);
  const [selTenant,           setSelTenant]           = useState<any | null>(null);
  const [fetchingDetail,      setFetchingDetail]      = useState(false);

  // ── NEW: tenants already having a doc for selected template ─────────────────
  const [excludedTenantIds,   setExcludedTenantIds]   = useState<Set<number>>(new Set());
  const [loadingExclusions,   setLoadingExclusions]   = useState(false);

  // ── NEW: property + floor filter for tenant step ────────────────────────────
  const [propertyList,        setPropertyList]        = useState<Array<{ id: number; name: string }>>([]);
  const [selPropertyId,       setSelPropertyId]       = useState<string>("all");
  const [floorList,           setFloorList]           = useState<number[]>([]);
  const [selFloor,            setSelFloor]            = useState<string>("all");
  const [loadingFloors,       setLoadingFloors]       = useState(false);
  // tenantIds in selected property+floor (from rooms/bed_assignments)
  const [propertyFloorTenantIds, setPropertyFloorTenantIds] = useState<Set<number> | null>(null);
  const [loadingPropFilter,   setLoadingPropFilter]   = useState(false);

  const [step,        setStep]        = useState(1);
  const [formData,    setFormData]    = useState<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving,      setSaving]      = useState(false);

  const [settings, setSettings] = useState({
    signatureRequired: false, priority: "normal",
    expiryDate: "", tags: [] as string[], notes: "",
  });
  const tagRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => ({
    total:  templates.length,
    active: templates.filter(t => t.is_active).length,
    cats:   new Set(templates.map(t => t.category)).size,
  }), [templates]);

  // ── Load templates ──────────────────────────────────────────────────────────
  const loadTemplates = useCallback(async () => {
    setLoadingTpls(true);
    try { const res = await listTemplates({ is_active:"true" }); setTemplates(res.data || []); }
    catch { toast.error("Failed to load templates"); }
    finally { setLoadingTpls(false); }
  }, []);
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  // Filter templates
  useEffect(() => {
    let list = [...templates];
    if (catFilter !== "All") list = list.filter(t => t.category === catFilter);
    if (tplSearch.trim()) {
      const s = tplSearch.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
    }
    setFilteredTpls(list);
  }, [templates, tplSearch, catFilter]);

  // ── Load properties for tenant filter ──────────────────────────────────────
  useEffect(() => {
    if (step !== 2) return;
    listProperties({ is_active: true }).then(res => {
      if (res?.success && res?.data?.data) {
        setPropertyList(res.data.data.map((p: any) => ({ id: parseInt(p.id), name: p.name })));
      }
    }).catch(() => {});
  }, [step]);

  // ── When property selected → load floors from rooms ─────────────────────────
  useEffect(() => {
    if (selPropertyId === "all") {
      setFloorList([]);
      setSelFloor("all");
      setPropertyFloorTenantIds(null);
      return;
    }
    setLoadingFloors(true);
    setSelFloor("all");
    setFloorList([]);
    setPropertyFloorTenantIds(null);

    listRoomsByProperty(parseInt(selPropertyId)).then(res => {
      const rooms = res?.data || [];
      // Collect unique floors
      const floors = Array.from(new Set(rooms.map((r: any) => r.floor).filter((f: any) => f != null))).sort() as number[];
      setFloorList(floors);

      // Build initial tenant set from all rooms in this property
      const ids = new Set<number>();
      rooms.forEach((r: any) => {
        (r.bed_assignments || []).forEach((b: any) => {
          if (b.tenant_id) ids.add(Number(b.tenant_id));
        });
      });
      setPropertyFloorTenantIds(ids);
    }).catch(() => {}).finally(() => setLoadingFloors(false));
  }, [selPropertyId]);

  // ── When floor selected → re-filter tenant IDs ──────────────────────────────
  useEffect(() => {
    if (selPropertyId === "all") { setPropertyFloorTenantIds(null); return; }
    if (selFloor === "all") {
      // All floors in this property — reload
      listRoomsByProperty(parseInt(selPropertyId)).then(res => {
        const rooms = res?.data || [];
        const ids = new Set<number>();
        rooms.forEach((r: any) => {
          (r.bed_assignments || []).forEach((b: any) => {
            if (b.tenant_id) ids.add(Number(b.tenant_id));
          });
        });
        setPropertyFloorTenantIds(ids);
      }).catch(() => {});
      return;
    }
    setLoadingPropFilter(true);
    listRoomsByProperty(parseInt(selPropertyId)).then(res => {
      const rooms = (res?.data || []).filter((r: any) => String(r.floor) === String(selFloor));
      const ids = new Set<number>();
      rooms.forEach((r: any) => {
        (r.bed_assignments || []).forEach((b: any) => {
          if (b.tenant_id) ids.add(Number(b.tenant_id));
        });
      });
      setPropertyFloorTenantIds(ids);
    }).catch(() => {}).finally(() => setLoadingPropFilter(false));
  }, [selFloor, selPropertyId]);

  // ── Apply all filters to tenantList ─────────────────────────────────────────
  useEffect(() => {
    let list = [...tenantList];

    // 1. Exclude tenants who already have a doc for this template
    if (excludedTenantIds.size > 0) {
      list = list.filter(t => !excludedTenantIds.has(Number(t.id)));
    }

    // 2. Filter by property+floor (only if a property is selected)
    if (propertyFloorTenantIds !== null) {
      list = list.filter(t => propertyFloorTenantIds.has(Number(t.id)));
    }

    // 3. Text search
    if (tenantSearch.trim()) {
      const s = tenantSearch.toLowerCase();
      list = list.filter(t =>
        (t.full_name  || "").toLowerCase().includes(s) ||
        (t.phone      || "").toLowerCase().includes(s) ||
        (t.email      || "").toLowerCase().includes(s)
      );
    }

    setFilteredTenantList(list);
  }, [tenantList, excludedTenantIds, propertyFloorTenantIds, tenantSearch]);

  // ── Load all active tenants when entering step 2 ────────────────────────────
  const doLoadTenants = useCallback(async () => {
    setLoadingTenants(true);
    try {
      const res = await listTenants({ pageSize: 200, is_active: "true" });
      setTenantList(res.data || []);
    } catch { toast.error("Failed to load tenants"); }
    finally { setLoadingTenants(false); }
  }, []);

  useEffect(() => {
    if (step === 2) {
      doLoadTenants();
      // Reset filters
      setSelPropertyId("all");
      setSelFloor("all");
      setTenantSearch("");
    }
  }, [step, doLoadTenants]);

  // ── When template selected → fetch exclusion list ──────────────────────────
  useEffect(() => {
    if (!selTemplate) { setExcludedTenantIds(new Set()); return; }
    setLoadingExclusions(true);
    getTenantsWithDocumentForTemplate(selTemplate.id)
      .then(res => {
        const ids = new Set<number>((res?.data || []).map((r: any) => Number(r.tenant_id)));
        setExcludedTenantIds(ids);
      })
      .catch(() => setExcludedTenantIds(new Set()))
      .finally(() => setLoadingExclusions(false));
  }, [selTemplate]);

  // ── Step 1: select template ─────────────────────────────────────────────────
  const handleTemplateSelect = async (tpl: DocumentTemplate) => {
    let full = tpl;
    if (!tpl.html_content) {
      try { const r = await getTemplate(tpl.id); full = r.data || tpl; } catch {}
    }
    setSelTemplate(full);
    setStep(2);
  };

  // ── Step 2: select tenant ────────────────────────────────────────────────────
  const handleTenantSelect = async (t: any) => {
    setSelTenant(t);
    setFetchingDetail(true);

    const base: Record<string, string> = {
      date:         todayStr(),
      document_type: selTemplate!.category,
      tenant_name:     t.full_name || "",
      tenant_phone:    t.phone     || "",
      tenant_email:    t.email     || "",
    };
    (selTemplate!.variables || []).forEach(v => { if (!(v in base)) base[v] = ""; });
    setFormData(base);

    try {
      const res = await tenantDetailsApi.getProfileById(String(t.id));
      const d   = res?.data;
      if (!d) throw new Error("No data");

      let secDeposit = 0;
      if (d.property_id) {
        try {
          const propRes = await getProperty(String(d.property_id));
          if (propRes?.success && propRes?.data) {
            secDeposit = safeNum(propRes.data.security_deposit);
          }
        } catch { /* ignore */ }
      }

      const mapped: Record<string, string> = {
        date:          todayStr(),
        document_type: selTemplate!.category,
        tenant_name:            d.full_name                  || t.full_name || "",
        tenant_phone:           d.phone                      || t.phone     || "",
        tenant_email:           d.email                      || t.email     || "",
        aadhaar_number:         "",
        pan_number:             "",
        emergency_contact_name: d.emergency_contact_name     || "",
        emergency_phone:        d.emergency_contact_phone    || "",
        property_name:          d.property_name              || "",
        room_number:            d.room_number                || "",
        bed_number:             d.bed_number != null         ? String(d.bed_number) : "",
        move_in_date:           toInputDate(d.check_in_date) || toInputDate(d.move_in_date) || "",
        rent_amount:            d.monthly_rent != null       ? String(safeNum(d.monthly_rent))
                                : d.rent_per_bed != null     ? String(safeNum(d.rent_per_bed)) : "",
        security_deposit:       secDeposit > 0               ? String(secDeposit) : "",
        payment_mode:           "UPI / Bank Transfer",
        company_name:           "",
        company_address:        "",
      };

      (selTemplate!.variables || []).forEach(v => { if (!(v in mapped)) mapped[v] = ""; });
      setFormData(mapped);
      toast.success(`✅ Auto-filled from ${d.full_name || t.full_name}`);
    } catch {
      const fallback: Record<string, string> = {
        date:          todayStr(),
        document_type: selTemplate!.category,
        tenant_name:     t.full_name || "",
        tenant_phone:    t.phone     || "",
        tenant_email:    t.email     || "",
        property_name:   t.property_name || t.assigned_property_name || "",
        room_number:     t.room_number   || t.assigned_room_number   || "",
        bed_number:      t.bed_number != null ? String(t.bed_number) : "",
        rent_amount:     t.monthly_rent ? String(safeNum(t.monthly_rent)) : "",
        security_deposit:"",
        payment_mode:    "UPI / Bank Transfer",
        company_name:    "",
        company_address: "",
        emergency_contact_name: "",
        emergency_phone: "",
        aadhaar_number:  "",
        pan_number:      "",
      };
      (selTemplate!.variables || []).forEach(v => { if (!(v in fallback)) fallback[v] = ""; });
      setFormData(fallback);
      toast.info("Basic info filled — some fields may need manual entry");
    } finally {
      setFetchingDetail(false);
      setStep(3);
    }
  };

  const skipTenant = () => {
    setSelTenant(null);
    const empty: Record<string, string> = {
      date:          todayStr(),
      document_type: selTemplate!.category,
    };
    (selTemplate!.variables || []).forEach(v => { if (!(v in empty)) empty[v] = ""; });
    setFormData(empty);
    setStep(3);
  };

  // ── Preview ─────────────────────────────────────────────────────────────────
  const generatePreview = () => {
    if (!selTemplate?.html_content) return;
    const logo = selTemplate.logo_url
      ? (selTemplate.logo_url.startsWith("http") ? selTemplate.logo_url : `${API_BASE}${selTemplate.logo_url}`)
      : "";
    const now     = new Date();
    const prefix  = "DOC-" + now.getFullYear() + String(now.getMonth()+1).padStart(2,"0") + "-";
    const previewNum = prefix + String(Math.floor(Math.random()*999)+1).padStart(6,"0");
    const previewData = { ...formData, document_number: previewNum };
    setPreviewHtml(renderHtml(selTemplate.html_content, previewData, logo));
    setShowPreview(true);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<html><head><title>Doc</title></head><body>${previewHtml}</body></html>`);
      w.document.close(); w.focus(); w.print();
    }
  };

  const handleDownload = () => {
    if (!previewHtml) { toast.error("Please open Preview first, then click Download"); return; }
    const tenantName = formData.tenant_name || "document";
    const docName    = selTemplate?.name    || "Document";
    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) { toast.error("Popup blocked — allow popups and try again"); return; }
    printWin.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><title>${docName} — ${tenantName}</title>
<style>*{box-sizing:border-box;}body{margin:0;padding:0;background:white;}
@media print{body{margin:0;}@page{size:A4;margin:10mm;}}</style></head>
<body>${previewHtml}
<script>window.onload=function(){setTimeout(function(){window.print();window.onafterprint=function(){window.close();};},400);};</script>
</body></html>`);
    printWin.document.close();
    toast.success("Print dialog opened — select 'Save as PDF' to download");
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.tenant_name?.trim())  { toast.error("Tenant Name required");  return; }
    if (!formData.tenant_phone?.trim()) { toast.error("Tenant Phone required"); return; }
    setSaving(true);
    try {
      const token    = localStorage.getItem("admin_token");
      const logo     = selTemplate!.logo_url
        ? (selTemplate!.logo_url.startsWith("http") ? selTemplate!.logo_url : `${API_BASE}${selTemplate!.logo_url}`)
        : "";
      const finalHtml = renderHtml(selTemplate!.html_content, formData, logo);

      const payload = {
        template_id:        selTemplate!.id,
        document_name:      selTemplate!.name,
        tenant_id:          selTenant?.id     || null,
        tenant_name:        formData.tenant_name,
        tenant_phone:       formData.tenant_phone,
        tenant_email:       formData.tenant_email   || null,
        property_name:      formData.property_name  || null,
        room_number:        formData.room_number     || null,
        html_content:       finalHtml,
        data_json:          formData,
        status:             "Created",
        created_by:         "Admin",
        signature_required: settings.signatureRequired,
        priority:           settings.priority,
        expiry_date:        settings.expiryDate || null,
        tags:               settings.tags,
        notes:              settings.notes      || null,
      };

      const res = await fetch(`${API_BASE}/api/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast.success(`✅ Document created! No: ${data.data?.document_number || "N/A"}`);
      setStep(1); setSelTemplate(null); setSelTenant(null); setFormData({});
      setSettings({ signatureRequired:false, priority:"normal", expiryDate:"", tags:[], notes:"" });
    } catch (e: any) {
      toast.error(e.message || "Failed to create document");
    } finally {
      setSaving(false);
    }
  };

  const addTag    = (v: string) => { if (v.trim() && !settings.tags.includes(v.trim())) setSettings(p => ({ ...p, tags:[...p.tags, v.trim()] })); };
  const removeTag = (v: string) => setSettings(p => ({ ...p, tags:p.tags.filter(t => t !== v) }));

  const visibleVars = useMemo(() =>
    (selTemplate?.variables || []).filter(v => !HIDDEN_VARS.includes(v)),
    [selTemplate]);

  // ── Tenant step status line ──────────────────────────────────────────────────
  const tenantStatusLine = useMemo(() => {
    const total     = tenantList.length;
    const excluded  = excludedTenantIds.size;
    const propFiltered = propertyFloorTenantIds !== null ? propertyFloorTenantIds.size : null;
    const showing   = filteredTenantList.length;
    if (total === 0) return "";
    let parts = [];
    if (excluded > 0)        parts.push(`${excluded} already have this doc`);
    if (propFiltered !== null) parts.push(`${propFiltered} in selected property/floor`);
    return `Showing ${showing} of ${total} tenants${parts.length ? ` (${parts.join(", ")} excluded)` : ""}`;
  }, [tenantList, excludedTenantIds, propertyFloorTenantIds, filteredTenantList]);

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50 min-h-full">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-16 z-10 pb-2">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            {selTemplate && (
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm min-w-0 text-[11px]">
                <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-blue-700 truncate max-w-[120px]">{selTemplate.name}</span>
                {selTenant && (
                  <><ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />
                  <User className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span className="font-semibold text-green-700 truncate max-w-[100px]">{selTenant.full_name}</span></>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={loadTemplates} disabled={loadingTpls}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 shadow-sm">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingTpls ? "animate-spin":""}`} />
            </button>
            {step > 1 && (
              <button onClick={() => { setStep(1); setSelTemplate(null); setSelTenant(null); }}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium shadow-sm">
                <X className="h-3.5 w-3.5" />Start Over
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <StatCard label="Templates"  value={stats.total}  icon={LayoutTemplate} accent="bg-blue-600" />
          <StatCard label="Active"     value={stats.active} icon={CheckCircle}    accent="bg-green-500" />
          <StatCard label="Categories" value={stats.cats}   icon={Tag}            accent="bg-indigo-600" />
        </div>

        {/* Steps */}
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm overflow-x-auto">
          {["Select Template","Select Tenant","Fill Details","Settings & Save"].map((label, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
              <StepDot n={i+1} label={label} cur={step} done={step > i+1} />
              {i < 3 && <ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* ══ STEP 1: Templates ══ */}
      {step === 1 && (
        <Card className="border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <LayoutTemplate className="h-4 w-4 text-blue-600" />Choose Template ({filteredTpls.length})
            </span>
            {(tplSearch || catFilter !== "All") && (
              <button onClick={() => { setTplSearch(""); setCatFilter("All"); }} className="text-[10px] text-blue-600 font-semibold">Clear</button>
            )}
          </div>
          <div className="px-3 py-2 border-b bg-gray-50/50 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input placeholder="Search templates…" value={tplSearch} onChange={e => setTplSearch(e.target.value)} className="h-8 pl-8 text-[11px] bg-white border-gray-200" />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="h-8 w-[160px] text-[11px] bg-white border-gray-200"><SelectValue /></SelectTrigger>
              <SelectContent>{TPL_CATS.map(c => <SelectItem key={c} value={c} className={SI}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="p-3" style={{ maxHeight:"calc(100vh - 310px)", overflowY:"auto" }}>
            {loadingTpls ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
            ) : filteredTpls.length === 0 ? (
              <div className="text-center py-12"><LayoutTemplate className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-sm font-medium text-gray-500">No templates found</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredTpls.map(t => (
                  <button key={t.id} onClick={() => handleTemplateSelect(t)}
                    className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group relative">
                    {t.is_active && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-green-500" />}
                    <div className="flex items-start gap-2 mb-2">
                      {t.logo_url ? (
                        <img src={t.logo_url.startsWith("http") ? t.logo_url : `${API_BASE}${t.logo_url}`} alt=""
                          className="h-7 w-10 object-contain rounded border border-gray-100 bg-gray-50 p-0.5 flex-shrink-0"
                          onError={e => (e.currentTarget.style.display = "none")} />
                      ) : (
                        <div className="h-7 w-7 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                      )}
                      <p className="text-[11px] font-black text-gray-800 group-hover:text-blue-700 leading-tight line-clamp-2">{t.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] px-1.5 py-0">{t.category}</Badge>
                      <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[9px] px-1.5 py-0">v{t.version}</Badge>
                      <span className="text-[9px] text-gray-400 ml-auto">{t.variables?.length || 0} vars</span>
                    </div>
                    {t.description && <p className="text-[9px] text-gray-400 mt-1.5 line-clamp-1">{t.description}</p>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ══ STEP 2: Select Tenant ══ */}
      {step === 2 && selTemplate && (
        <Card className="border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <User className="h-4 w-4 text-green-600" />Select Tenant — auto-fills all details
            </span>
            <div className="flex items-center gap-2">
              {(fetchingDetail || loadingExclusions || loadingPropFilter) && (
                <div className="flex items-center gap-1 text-[11px] text-blue-600">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {loadingExclusions ? "Checking docs…" : fetchingDetail ? "Fetching…" : "Filtering…"}
                </div>
              )}
              <button onClick={skipTenant} className="h-7 px-2.5 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">Skip →</button>
            </div>
          </div>

          {/* ── NEW: Property + Floor filter row ─────────────────────────────── */}
          <div className="px-3 py-2 border-b bg-gray-50/50 flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[160px] relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input placeholder="Search by name, phone, email…" value={tenantSearch} onChange={e => setTenantSearch(e.target.value)}
                className="h-8 pl-8 text-[11px] bg-white border-gray-200" autoFocus />
            </div>

            {/* Property filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <Select value={selPropertyId} onValueChange={v => { setSelPropertyId(v); setSelFloor("all"); }}>
                <SelectTrigger className="h-8 w-[160px] text-[11px] bg-white border-gray-200">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className={SI}>All Properties</SelectItem>
                  {propertyList.map(p => (
                    <SelectItem key={p.id} value={String(p.id)} className={SI}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Floor filter — only show when property selected and floors exist */}
            {selPropertyId !== "all" && (
              <div className="flex items-center gap-1.5">
                {loadingFloors
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                  : (
                    <Select value={selFloor} onValueChange={setSelFloor}>
                      <SelectTrigger className="h-8 w-[110px] text-[11px] bg-white border-gray-200">
                        <SelectValue placeholder="All Floors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className={SI}>All Floors</SelectItem>
                        {floorList.map(f => (
                          <SelectItem key={f} value={String(f)} className={SI}>Floor {f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                }
              </div>
            )}
          </div>

          {/* Status info bar */}
          {tenantStatusLine && (
            <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100 text-[10px] text-blue-600 font-medium">
              {tenantStatusLine}
            </div>
          )}

          <div className="p-3" style={{ maxHeight:"calc(100vh - 380px)", overflowY:"auto" }}>
            {loadingTenants ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>
            ) : filteredTenantList.length === 0 ? (
              <div className="text-center py-10">
                <User className="h-9 w-9 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500">
                  {excludedTenantIds.size > 0 && propertyFloorTenantIds !== null && propertyFloorTenantIds.size === 0
                    ? "No tenants in selected property/floor"
                    : excludedTenantIds.size > 0
                    ? "All tenants already have this document"
                    : "No tenants found"}
                </p>
                {(selPropertyId !== "all" || excludedTenantIds.size > 0) && (
                  <button onClick={() => { setSelPropertyId("all"); setSelFloor("all"); setTenantSearch(""); }}
                    className="mt-2 text-[11px] text-blue-600 underline">Clear filters</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredTenantList.map(t => (
                  <button key={t.id} onClick={() => handleTenantSelect(t)} disabled={fetchingDetail}
                    className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all group disabled:opacity-60">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-black text-sm">
                        {(t.full_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-gray-800 group-hover:text-green-700 truncate">{t.full_name}</p>
                        {(t.property_name || t.assigned_property_name) && (
                          <p className="text-[9px] text-gray-400 flex items-center gap-1 truncate">
                            <Building2 className="h-2.5 w-2.5 flex-shrink-0" />{t.property_name || t.assigned_property_name}
                          </p>
                        )}
                      </div>
                      {(t.room_number || t.assigned_room_number) && (
                        <Badge className="bg-green-50 text-green-700 border border-green-200 text-[9px] px-1.5 py-0 flex-shrink-0">
                          R-{t.room_number || t.assigned_room_number}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {t.phone && <p className="text-[10px] text-gray-500 flex items-center gap-1"><Phone className="h-2.5 w-2.5 text-gray-400" />{t.phone}</p>}
                      {t.email && <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate"><Mail className="h-2.5 w-2.5 text-gray-400" />{t.email}</p>}
                      {(t.monthly_rent || t.rent_per_bed) && (
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          <IndianRupee className="h-2.5 w-2.5 text-gray-400" />{money(t.monthly_rent || t.rent_per_bed)}/mo
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg">
            <button onClick={() => { setStep(1); setSelTemplate(null); }}
              className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
              <ChevronLeft className="h-3 w-3" />Back
            </button>
          </div>
        </Card>
      )}

      {/* ══ STEP 3: Fill Details ══ */}
      {step === 3 && selTemplate && (
        <Card className="border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-600" />Document Details
            </span>
            {selTenant && (
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-md px-2 py-1">
                <UserCheck className="h-3 w-3 text-green-600" />
                <span className="text-[10px] font-semibold text-green-700">{selTenant.full_name}</span>
                <button onClick={() => setStep(2)} className="text-[9px] text-green-500 hover:underline ml-1">change</button>
              </div>
            )}
          </div>
          <div className="p-3" style={{ maxHeight:"calc(100vh - 270px)", overflowY:"auto" }}>

            {GROUP_SYSTEM.some(v => visibleVars.includes(v)) && (
              <div className="mb-4">
                <SH icon={<FileText className="h-3 w-3" />} title="Document Info" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {GROUP_SYSTEM.filter(v => visibleVars.includes(v)).map(v => (
                    <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
                  ))}
                </div>
              </div>
            )}

            {GROUP_TENANT.some(v => visibleVars.includes(v)) && (
              <div className="mb-4">
                <SH icon={<User className="h-3 w-3" />} title="Tenant Information" color="text-green-600" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {GROUP_TENANT.filter(v => visibleVars.includes(v)).map(v => (
                    <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData}
                      required={["tenant_name","tenant_phone"].includes(v)} />
                  ))}
                </div>
              </div>
            )}

            {GROUP_PROPERTY.some(v => visibleVars.includes(v)) && (
              <div className="mb-4">
                <SH icon={<Building2 className="h-3 w-3" />} title="Property Details" color="text-indigo-600" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {GROUP_PROPERTY.filter(v => visibleVars.includes(v)).map(v => (
                    <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
                  ))}
                </div>
              </div>
            )}

            {GROUP_COMPANY.some(v => visibleVars.includes(v)) && (
              <div className="mb-4">
                <SH icon={<Building2 className="h-3 w-3" />} title="Company / Manager Info" color="text-orange-600" />
                <p className="text-[10px] text-orange-500 mb-2">Fill your company name and address manually</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {GROUP_COMPANY.filter(v => visibleVars.includes(v)).map(v => (
                    <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
                  ))}
                </div>
              </div>
            )}

            {(() => {
              const rest = visibleVars.filter(v => !ALL_GROUPED.includes(v));
              if (!rest.length) return null;
              return (
                <div className="mb-4">
                  <SH icon={<Hash className="h-3 w-3" />} title="Other Fields" color="text-gray-500" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {rest.map(v => <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />)}
                  </div>
                </div>
              );
            })()}

            {selTenant && (
              <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700">
                  Fields in <span className="font-bold text-green-600">green</span> are auto-filled from tenant's full profile —
                  property, room, bed, move-in date, rent, security deposit, emergency contact, company info.
                </p>
              </div>
            )}
          </div>
          <div className="px-3 py-2.5 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
            <button onClick={() => setStep(2)}
              className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
              <ChevronLeft className="h-3 w-3" />Back
            </button>
            <div className="flex gap-2">
              <button onClick={generatePreview}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md">
                <Eye className="h-3.5 w-3.5" />Preview
              </button>
              <button onClick={() => setStep(4)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:shadow-md">
                Next<ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ══ STEP 4: Settings ══ */}
      {step === 4 && selTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <Card className="border rounded-lg shadow-sm">
              <div className="px-3 py-2 border-b bg-white rounded-t-lg">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-blue-600" />Document Options
                </span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.signatureRequired ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                  onClick={() => setSettings(p => ({ ...p, signatureRequired:!p.signatureRequired }))}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${settings.signatureRequired ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                      {settings.signatureRequired && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-gray-800">Signature Required</p>
                      <p className="text-[9px] text-gray-500">Tenant must sign to complete</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={L}><AlertCircle className="h-3 w-3 inline mr-1" />Priority</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {PRIORITY_OPTS.map(o => (
                      <button key={o.value} onClick={() => setSettings(p => ({ ...p, priority:o.value }))}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold border-2 transition-all
                          ${settings.priority === o.value ? "border-blue-500 bg-blue-600 text-white shadow-sm" : `${o.cls} border-transparent hover:border-gray-300`}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={L}><Clock className="h-3 w-3 inline mr-1" />Expiry Date</label>
                  <Input type="date" value={settings.expiryDate} onChange={e => setSettings(p => ({...p, expiryDate:e.target.value}))}
                    min={new Date().toISOString().split("T")[0]} className={`${F} w-full`} />
                  {settings.expiryDate && (
                    <p className="text-[9px] text-orange-500 mt-0.5">
                      Document will not appear in lists after this date
                    </p>
                  )}
                </div>
                <div>
                  <label className={L}><Tag className="h-3 w-3 inline mr-1" />Tags</label>
                  <Input ref={tagRef} placeholder="Press Enter to add…"
                    onKeyDown={e => { if (e.key === "Enter" && tagRef.current) { addTag(tagRef.current.value); tagRef.current.value = ""; } }}
                    className={`${F} w-full`} />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {settings.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold flex items-center gap-1 border border-blue-200">
                        {tag}<button onClick={() => removeTag(tag)}><X className="h-2.5 w-2.5" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <label className={L}>Notes</label>
                <textarea value={settings.notes} onChange={e => setSettings(p => ({...p, notes:e.target.value}))} rows={2}
                  className="w-full px-2.5 py-2 text-[11px] border border-gray-200 rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-gray-50 focus:bg-white resize-none transition-all"
                  placeholder="Any additional instructions…" />
              </div>
            </Card>
          </div>

          <div className="space-y-3">
            <Card className="border rounded-lg shadow-sm">
              <div className="px-3 py-2 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" />Document Summary</span>
              </div>
              <div className="p-3 space-y-2">
                {[
                  ["Template",  selTemplate.name,                               "text-blue-700"],
                  ["Tenant",    formData.tenant_name        || "—",             "text-gray-800"],
                  ["Phone",     formData.tenant_phone       || "—",             "text-gray-600"],
                  ["Property",  formData.property_name      || "—",             "text-gray-600"],
                  ["Room",      formData.room_number        || "—",             "text-gray-600"],
                  ["Bed",       formData.bed_number         || "—",             "text-gray-600"],
                  ["Move-In",   formData.move_in_date       || "—",             "text-gray-600"],
                  ["Rent",      formData.rent_amount        ? money(formData.rent_amount)     : "—", "text-green-700"],
                  ["Deposit",   formData.security_deposit   ? money(formData.security_deposit): "—", "text-green-700"],
                  ["Emergency", formData.emergency_contact_name || "—",         "text-gray-600"],
                  ["Company",   formData.company_name       || "—",             "text-gray-600"],
                  ["Priority",  settings.priority.toUpperCase(),                "text-orange-600"],
                  ["Signature", settings.signatureRequired  ? "Required":"Not Required",
                                settings.signatureRequired  ? "text-blue-600":"text-gray-500"],
                  ["Expires",   settings.expiryDate         || "No expiry",     settings.expiryDate ? "text-orange-600" : "text-gray-400"],
                ].map(([k,v,cls]) => (
                  <div key={k} className="flex items-start justify-between gap-2">
                    <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">{k}</span>
                    <span className={`text-[10px] font-bold text-right truncate max-w-[140px] ${cls}`}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="space-y-2">
              <button onClick={generatePreview}
                className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md transition-all">
                <Eye className="h-3.5 w-3.5" />Preview Document
              </button>
              <button onClick={handleSave} disabled={saving}
                className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold hover:shadow-md transition-all disabled:opacity-50">
                {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Creating…</> : <><Save className="h-3.5 w-3.5" />Create Document</>}
              </button>
              <button onClick={() => setStep(3)}
                className="w-full inline-flex items-center justify-center gap-1 h-7 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
                <ChevronLeft className="h-3 w-3" />Back to Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PREVIEW MODAL ══ */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col" style={{ maxHeight:"92vh" }}>
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">Document Preview</span>
                <Badge className="bg-white/20 text-white border-0 text-[10px]">Live Data</Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-white/20 text-white" title="Download PDF"><Download className="h-4 w-4" /></button>
                <button onClick={handlePrint}    className="p-1.5 rounded-lg hover:bg-white/20 text-white" title="Print"><Printer className="h-4 w-4" /></button>
                <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
              <div className="bg-white rounded-lg shadow-md max-w-[210mm] mx-auto">
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
            <div className="flex-shrink-0 px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
              <button onClick={handleDownload}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:shadow-md">
                <Download className="h-3.5 w-3.5" />Download
              </button>
              <button onClick={handlePrint}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold">
                <Printer className="h-3.5 w-3.5" />Print
              </button>
              <button onClick={() => setShowPreview(false)}
                className="h-8 px-3 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}