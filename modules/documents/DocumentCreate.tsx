// // DocumentCreate.tsx
// // Multi-tenant step-by-step flow:
// //   Step 1: Choose template
// //   Step 2: Select tenant(s) — checkbox for multi, click for single
// //   Step 3: Fill details for tenant[0], then tenant[1], etc. (one at a time)
// //   Step 4: Settings & Save — creates docs for all tenants in queue
// //
// // Filters in Step 2:
// //   - Active / Inactive toggle (from tenant.is_active)
// //   - Property filter (from tenant.property_name / assigned_property_name)
// //   - Floor filter — derived from room_number first digit (e.g. room "101" = floor 1)
// //   - Text search (name, phone, email)
// //   - Exclusion: tenants who already have a doc for this template are hidden

// import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import {
//   FileText, Eye, Save, X, ChevronLeft, ChevronRight,
//   Clock, CheckCircle, AlertCircle, Search, User, Phone,
//   Mail, Building2, Loader2, UserCheck, Printer, RefreshCw,
//   LayoutTemplate, Tag, Hash, Shield, Zap, Check, IndianRupee,
//   Download, Filter, Square, CheckSquare, Users, ListChecks,
//   ArrowRight,
// } from "lucide-react";
// import { Input }  from "@/components/ui/input";
// import { Badge }  from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import { toast } from "sonner";

// import { listTemplates, getTemplate, type DocumentTemplate } from "@/lib/documentTemplateApi";
// import { listTenants }                                        from "@/lib/tenantApi";
// import { tenantDetailsApi }                                   from "@/lib/tenantDetailsApi";
// import { getProperty, listProperties }                        from "@/lib/propertyApi";
// import { listRoomsByProperty }                                from "@/lib/roomsApi";
// import { getTenantsWithDocumentForTemplate }                  from "@/lib/documentApi";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// // ── Style tokens ──────────────────────────────────────────────────────────────
// const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
// const L  = "block text-[10px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide";
// const SI = "text-[11px] py-0.5";

// const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
//   <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
//     {icon}{title}
//   </div>
// );

// const StatCard = ({ label, value, icon: Icon, accent }: any) => (
//   <Card className="border-0 shadow-sm bg-white">
//     <CardContent className="p-2.5 flex items-center gap-2">
//       <div className={`p-1.5 rounded-lg ${accent}`}><Icon className="h-3.5 w-3.5 text-white" /></div>
//       <div>
//         <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">{label}</p>
//         <p className="text-xs font-bold text-gray-800">{value}</p>
//       </div>
//     </CardContent>
//   </Card>
// );

// const StepDot = ({ n, label, cur, done }: { n: number; label: string; cur: number; done: boolean }) => (
//   <div className="flex items-center gap-1.5 flex-shrink-0">
//     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all
//       ${cur === n ? "bg-blue-600 text-white shadow-md shadow-blue-200" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
//       {done ? <Check className="h-3 w-3" /> : n}
//     </div>
//     <span className={`text-[11px] font-semibold hidden sm:inline
//       ${cur === n ? "text-blue-700" : done ? "text-green-600" : "text-gray-400"}`}>{label}</span>
//   </div>
// );

// // ── Constants ──────────────────────────────────────────────────────────────────
// const TPL_CATS = [
//   "All","Agreements","Rental Agreements","KYC Documents","Onboarding Documents",
//   "Financial Documents","Policy Documents","Exit Documents","Inspection Forms","Declarations","Other",
// ];
// const PRIORITY_OPTS = [
//   { value:"low",    label:"Low",    cls:"bg-gray-100 text-gray-600" },
//   { value:"normal", label:"Normal", cls:"bg-blue-100 text-blue-700" },
//   { value:"high",   label:"High",   cls:"bg-orange-100 text-orange-700" },
//   { value:"urgent", label:"Urgent", cls:"bg-red-100 text-red-700" },
// ];

// const HIDDEN_VARS    = ["document_number","logo_url","document_title"];
// const GROUP_SYSTEM   = ["document_type","date"];
// const GROUP_TENANT   = ["tenant_name","tenant_phone","tenant_email","aadhaar_number","pan_number","emergency_contact_name","emergency_phone"];
// const GROUP_PROPERTY = ["property_name","room_number","bed_number","move_in_date","rent_amount","security_deposit","payment_mode"];
// const GROUP_COMPANY  = ["company_name","company_address"];
// const ALL_GROUPED    = [...GROUP_SYSTEM, ...GROUP_TENANT, ...GROUP_PROPERTY, ...GROUP_COMPANY];

// const safeNum = (v: any) => { const n = parseFloat(String(v ?? "")); return isNaN(n) ? 0 : n; };
// const money   = (v: any) => `₹${safeNum(v).toLocaleString("en-IN")}`;

// const toInputDate = (d: string | undefined | null): string => {
//   if (!d) return "";
//   if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
//   try { const dt = new Date(d); return isNaN(dt.getTime()) ? "" : dt.toISOString().split("T")[0]; }
//   catch { return ""; }
// };

// const todayStr = () => new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });

// const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// const getFieldType = (k: string) => {
//   if (k.includes("date"))   return "date";
//   if (k.includes("email"))  return "email";
//   if (k.includes("phone"))  return "tel";
//   if (["amount","deposit","rent"].some(x => k.includes(x))) return "number";
//   return "text";
// };
// const getFieldLabel = (k: string) =>
//   k.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// const renderHtml = (html: string, data: Record<string, string>, logoSrc?: string) => {
//   let out = html;
//   out = logoSrc
//     ? out.replace(/\{\{logo_url\}\}/g, `<img src="${logoSrc}" style="max-height:60px;max-width:160px;object-fit:contain;" />`)
//     : out.replace(/\{\{logo_url\}\}/g, "");
//   Object.entries(data).forEach(([k, v]) => {
//     out = out.replace(new RegExp(`\\{\\{${escRe(k)}\\}\\}`, "g"), v || "");
//   });
//   return out.replace(/\{\{[\w_]+\}\}/g, "—");
// };

// // ── Derive floor from room number (first digit of numeric part) ────────────────
// // "101" → 1, "201" → 2, "G01" → "G", "3" → 3
// function getFloorFromRoom(roomNumber: string | null | undefined): string {
//   if (!roomNumber) return "";
//   const s = String(roomNumber).trim();
//   // If first char is a letter (G, B etc), use it as floor label
//   if (/^[a-zA-Z]/.test(s)) return s.charAt(0).toUpperCase();
//   // Otherwise first digit
//   const firstDigit = s.match(/\d/);
//   return firstDigit ? firstDigit[0] : "";
// }

// // ── FieldInput ────────────────────────────────────────────────────────────────
// function FieldInput({ variable, formData, setFormData, required = false }: {
//   variable: string;
//   formData: Record<string, string>;
//   setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
//   required?: boolean;
// }) {
//   const raw    = formData[variable];
//   const strVal = raw != null ? String(raw) : "";
//   const filled = !!strVal.trim();
//   return (
//     <div>
//       <label className={L}>
//         {getFieldLabel(variable)}{required && <span className="text-red-400 ml-0.5">*</span>}
//       </label>
//       <input
//         type={getFieldType(variable)}
//         value={strVal}
//         onChange={e => setFormData(p => ({ ...p, [variable]: e.target.value }))}
//         placeholder={getFieldLabel(variable)}
//         className={`w-full h-8 px-2.5 text-[11px] border rounded-md transition-all font-medium outline-none
//           ${filled
//             ? "border-green-300 bg-green-50/40 focus:border-green-400 focus:ring-1 focus:ring-green-100"
//             : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100"}`}
//       />
//     </div>
//   );
// }

// // ── Bulk progress modal ───────────────────────────────────────────────────────
// function BulkProgressModal({
//   total, done, current, errors, onClose,
// }: { total: number; done: number; current: string; errors: string[]; onClose: () => void }) {
//   const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
//   const finished = done >= total;
//   return (
//     <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
//         <div className="flex items-center gap-3 mb-4">
//           <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${finished ? "bg-green-100" : "bg-blue-100"}`}>
//             {finished
//               ? <CheckCircle className="h-5 w-5 text-green-600" />
//               : <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
//           </div>
//           <div>
//             <h2 className="text-sm font-bold text-gray-900">{finished ? "Documents Created!" : "Creating Documents…"}</h2>
//             <p className="text-[11px] text-gray-500">{finished ? `${done - errors.length} of ${total} succeeded` : current}</p>
//           </div>
//         </div>
//         <div className="mb-3">
//           <div className="flex justify-between text-[10px] text-gray-500 mb-1">
//             <span>{done} of {total}</span>
//             <span className="font-semibold text-blue-600">{pct}%</span>
//           </div>
//           <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
//             <div className={`h-full rounded-full transition-all duration-300 ${finished && errors.length === 0 ? "bg-green-500" : "bg-blue-500"}`}
//               style={{ width:`${pct}%` }} />
//           </div>
//         </div>
//         {errors.length > 0 && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 max-h-28 overflow-y-auto">
//             <p className="text-[10px] font-bold text-red-700 mb-1">{errors.length} failed:</p>
//             {errors.map((e, i) => <p key={i} className="text-[10px] text-red-600">• {e}</p>)}
//           </div>
//         )}
//         {finished && (
//           <button onClick={onClose}
//             className="w-full h-8 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold">
//             Done — Start Over
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════════════════════
// export function DocumentCreate() {

//   // ── Templates ──────────────────────────────────────────────────────────────
//   const [templates,    setTemplates]    = useState<DocumentTemplate[]>([]);
//   const [filteredTpls, setFilteredTpls] = useState<DocumentTemplate[]>([]);
//   const [selTemplate,  setSelTemplate]  = useState<DocumentTemplate | null>(null);
//   const [loadingTpls,  setLoadingTpls]  = useState(true);
//   const [tplSearch,    setTplSearch]    = useState("");
//   const [catFilter,    setCatFilter]    = useState("All");

//   // ── Tenants ─────────────────────────────────────────────────────────────────
//   const [tenantList,         setTenantList]         = useState<any[]>([]);
//   const [loadingTenants,     setLoadingTenants]     = useState(false);
//   const [excludedTenantIds,  setExcludedTenantIds]  = useState<Set<number>>(new Set());
//   const [loadingExclusions,  setLoadingExclusions]  = useState(false);

//   // ── Step 2 filters ──────────────────────────────────────────────────────────
//   const [tenantSearch,    setTenantSearch]    = useState("");
//   const [filterPropertyId, setFilterPropertyId] = useState<string>("all"); // property ID from listProperties
//   const [filterFloor,     setFilterFloor]     = useState("all");
//   const [filterStatus,    setFilterStatus]    = useState<"all"|"active"|"inactive">("active");

//   // ── Property + floor data (loaded from API) ────────────────────────────────
//   const [propertyList,    setPropertyList]    = useState<Array<{id:string;name:string}>>([]);
//   // Map: propertyId -> array of floors (strings)
//   const [propertyFloors,  setPropertyFloors]  = useState<Record<string, string[]>>({});
//   // Map: propertyId -> Set of tenant IDs assigned in that property
//   const [propTenantMap,   setPropTenantMap]   = useState<Record<string, Set<number>>>({});
//   const [loadingPropData, setLoadingPropData] = useState(false);

//   // ── Multi-select ────────────────────────────────────────────────────────────
//   // tenantQueue: ordered list of tenants to create docs for
//   const [tenantQueue,       setTenantQueue]       = useState<any[]>([]);
//   const [queueIndex,        setQueueIndex]        = useState(0);   // which tenant we're on in Step 3
//   // per-tenant formData: stored as array indexed by queue position
//   const [queueFormData,     setQueueFormData]     = useState<Array<Record<string, string>>>([]);
//   const [fetchingDetail,    setFetchingDetail]    = useState(false);

//   // For single-tenant flow (backward compat): selTenant is queue[0]
//   const selTenant = tenantQueue[0] || null;

//   // ── UI state ─────────────────────────────────────────────────────────────────
//   const [step,        setStep]        = useState(1);
//   const [previewHtml, setPreviewHtml] = useState("");
//   const [showPreview, setShowPreview] = useState(false);
//   const [saving,      setSaving]      = useState(false);
//   const [bulkProgress, setBulkProgress] = useState<{
//     total: number; done: number; current: string; errors: string[];
//   } | null>(null);

//   const [settings, setSettings] = useState({
//     signatureRequired: false, priority: "normal",
//     expiryDate: "", tags: [] as string[], notes: "",
//   });
//   const tagRef = useRef<HTMLInputElement>(null);

//   // Current form data (for the tenant currently being edited in Step 3)
//   const formData    = queueFormData[queueIndex] || {};
//   const setFormData = (fn: (p: Record<string, string>) => Record<string, string>) => {
//     setQueueFormData(prev => {
//       const next = [...prev];
//       next[queueIndex] = fn(next[queueIndex] || {});
//       return next;
//     });
//   };

//   const stats = useMemo(() => ({
//     total:  templates.length,
//     active: templates.filter(t => t.is_active).length,
//     cats:   new Set(templates.map(t => t.category)).size,
//   }), [templates]);

//   // ── Derived filter lists (from API data) ─────────────────────────────────────
//   // Property options come from listProperties API
//   const propertyOptions = propertyList; // [{id, name}]

//   // Floor options: from rooms of selected property (loaded via listRoomsByProperty)
//   const floorOptions = useMemo(() => {
//     if (filterPropertyId === "all") {
//       // Show all unique floors across all properties
//       const allFloors = new Set<string>();
//       Object.values(propertyFloors).forEach(floors => floors.forEach(f => allFloors.add(f)));
//       return Array.from(allFloors).sort();
//     }
//     return propertyFloors[filterPropertyId] || [];
//   }, [propertyFloors, filterPropertyId]);

//   // ── Filtered tenant list ─────────────────────────────────────────────────────
//   const filteredTenantList = useMemo(() => {
//     let list = [...tenantList];

//     // 1. Exclude tenants who already have a doc for this template
//     if (excludedTenantIds.size > 0) {
//       list = list.filter(t => !excludedTenantIds.has(Number(t.id)));
//     }

//     // 2. Active/Inactive filter
//     if (filterStatus === "active") {
//       list = list.filter(t => t.is_active === true || t.is_active === 1);
//     } else if (filterStatus === "inactive") {
//       list = list.filter(t => t.is_active === false || t.is_active === 0);
//     }

//     // 3. Property filter — use propTenantMap built from bed_assignments
//     if (filterPropertyId !== "all") {
//       const allowed = propTenantMap[filterPropertyId];
//       if (allowed) {
//         list = list.filter(t => allowed.has(Number(t.id)));
//       }
//     }

//     // 4. Floor filter — filter by tenants whose room_number starts with that floor
//     if (filterFloor !== "all") {
//       if (filterPropertyId !== "all") {
//         // Use bed_assignments data: filter tenants in that property whose room is on that floor
//         list = list.filter(t => {
//           const floor = getFloorFromRoom(t.room_number || t.assigned_room_number);
//           return floor === filterFloor;
//         });
//       } else {
//         // Across all properties: floor from room_number
//         list = list.filter(t => {
//           const floor = getFloorFromRoom(t.room_number || t.assigned_room_number);
//           return floor === filterFloor;
//         });
//       }
//     }

//     // 5. Text search
//     if (tenantSearch.trim()) {
//       const s = tenantSearch.toLowerCase();
//       list = list.filter(t =>
//         (t.full_name || "").toLowerCase().includes(s) ||
//         (t.phone     || "").toLowerCase().includes(s) ||
//         (t.email     || "").toLowerCase().includes(s)
//       );
//     }

//     return list;
//   }, [tenantList, excludedTenantIds, filterStatus, filterPropertyId, filterFloor, tenantSearch, propTenantMap]);

//   // ── Multi-select state ───────────────────────────────────────────────────────
//   const [selectedTenantIds, setSelectedTenantIds] = useState<Set<number>>(new Set());
//   const allSelected = filteredTenantList.length > 0 && selectedTenantIds.size === filteredTenantList.length;

//   const toggleTenant = (id: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setSelectedTenantIds(prev => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   };

//   const toggleSelectAll = () => {
//     if (allSelected) setSelectedTenantIds(new Set());
//     else setSelectedTenantIds(new Set(filteredTenantList.map((t: any) => Number(t.id))));
//   };

//   // ── Load templates ──────────────────────────────────────────────────────────
//   const loadTemplates = useCallback(async () => {
//     setLoadingTpls(true);
//     try { const res = await listTemplates({ is_active:"true" }); setTemplates(res.data || []); }
//     catch { toast.error("Failed to load templates"); }
//     finally { setLoadingTpls(false); }
//   }, []);
//   useEffect(() => { loadTemplates(); }, [loadTemplates]);

//   useEffect(() => {
//     let list = [...templates];
//     if (catFilter !== "All") list = list.filter(t => t.category === catFilter);
//     if (tplSearch.trim()) {
//       const s = tplSearch.toLowerCase();
//       list = list.filter(t => t.name.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
//     }
//     setFilteredTpls(list);
//   }, [templates, tplSearch, catFilter]);

//   // ── Load tenants ─────────────────────────────────────────────────────────────
//   const doLoadTenants = useCallback(async () => {
//     setLoadingTenants(true);
//     try {
//       const res = await listTenants({ pageSize: 500 });
//       setTenantList(res.data || []);
//     } catch { toast.error("Failed to load tenants"); }
//     finally { setLoadingTenants(false); }
//   }, []);

//   // ── Load properties + their floors + tenant maps ──────────────────────────
//   const doLoadPropertyData = useCallback(async () => {
//     setLoadingPropData(true);
//     try {
//       // 1. Get all active properties using listProperties API
//       const propRes = await listProperties({ is_active: true, pageSize: 200 });
//       const props: Array<{id:string;name:string}> = [];

//       // listProperties returns: { success, data: { data: Property[], meta } }
//       const propArr = propRes?.data?.data || propRes?.data || [];
//       propArr.forEach((p: any) => {
//         if (p.id && p.name) props.push({ id: String(p.id), name: p.name });
//       });
//       setPropertyList(props);

//       // 2. For each property, fetch rooms → extract floors + tenant IDs from bed_assignments
//       const floorsMap: Record<string, string[]>    = {};
//       const tenantMap: Record<string, Set<number>> = {};

//       await Promise.all(
//         props.map(async (prop) => {
//           try {
//             const roomsRes = await listRoomsByProperty(parseInt(prop.id));
//             const rooms    = roomsRes?.data || [];

//             // Collect unique floors from room.floor field (number) OR room_number prefix
//             const floorsSet = new Set<string>();
//             const tIds      = new Set<number>();

//             rooms.forEach((room: any) => {
//               // Floor: prefer room.floor (numeric DB field), fallback to room_number prefix
//               const floorVal = room.floor != null
//                 ? String(room.floor)
//                 : getFloorFromRoom(room.room_number);
//               if (floorVal) floorsSet.add(floorVal);

//               // Tenant IDs from bed_assignments
//               (room.bed_assignments || []).forEach((b: any) => {
//                 if (b.tenant_id) tIds.add(Number(b.tenant_id));
//               });
//             });

//             floorsMap[prop.id] = Array.from(floorsSet).sort((a, b) => {
//               // Numeric sort where possible
//               const na = parseInt(a), nb = parseInt(b);
//               if (!isNaN(na) && !isNaN(nb)) return na - nb;
//               return a.localeCompare(b);
//             });
//             tenantMap[prop.id] = tIds;
//           } catch {
//             floorsMap[prop.id] = [];
//             tenantMap[prop.id] = new Set();
//           }
//         })
//       );

//       setPropertyFloors(floorsMap);
//       setPropTenantMap(tenantMap);
//     } catch (e) {
//       console.error("Failed to load property data", e);
//     } finally {
//       setLoadingPropData(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (step === 2) {
//       doLoadTenants();
//       doLoadPropertyData();
//       setSelectedTenantIds(new Set());
//       setTenantSearch(""); setFilterPropertyId("all"); setFilterFloor("all");
//       setFilterStatus("active");
//     }
//   }, [step, doLoadTenants, doLoadPropertyData]);

//   // ── Exclusion list ──────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!selTemplate) { setExcludedTenantIds(new Set()); return; }
//     setLoadingExclusions(true);
//     getTenantsWithDocumentForTemplate(selTemplate.id)
//       .then(res => { setExcludedTenantIds(new Set<number>((res?.data || []).map((r: any) => Number(r.tenant_id)))); })
//       .catch(() => setExcludedTenantIds(new Set()))
//       .finally(() => setLoadingExclusions(false));
//   }, [selTemplate]);

//   // ── Fetch full tenant data for one tenant ───────────────────────────────────
//   const fetchTenantFormData = async (t: any): Promise<Record<string, string>> => {
//     const base: Record<string, string> = {
//       date: todayStr(), document_type: selTemplate!.category,
//       tenant_name: t.full_name || "", tenant_phone: t.phone || "", tenant_email: t.email || "",
//     };
//     (selTemplate!.variables || []).forEach(v => { if (!(v in base)) base[v] = ""; });

//     try {
//       const res = await tenantDetailsApi.getProfileById(String(t.id));
//       const d   = res?.data;
//       if (!d) return base;

//       let secDeposit = 0;
//       if (d.property_id) {
//         try {
//           const propRes = await getProperty(String(d.property_id));
//           if (propRes?.success && propRes?.data) secDeposit = safeNum(propRes.data.security_deposit);
//         } catch {}
//       }

//       const mapped: Record<string, string> = {
//         date: todayStr(), document_type: selTemplate!.category,
//         tenant_name:            d.full_name               || t.full_name || "",
//         tenant_phone:           d.phone                   || t.phone     || "",
//         tenant_email:           d.email                   || t.email     || "",
//         aadhaar_number:         "",
//         pan_number:             "",
//         emergency_contact_name: d.emergency_contact_name  || "",
//         emergency_phone:        d.emergency_contact_phone || "",
//         property_name:          d.property_name           || "",
//         room_number:            d.room_number             || "",
//         bed_number:             d.bed_number != null      ? String(d.bed_number) : "",
//         move_in_date:           toInputDate(d.check_in_date) || toInputDate(d.move_in_date) || "",
//         rent_amount:            d.monthly_rent != null    ? String(safeNum(d.monthly_rent))
//                                 : d.rent_per_bed != null  ? String(safeNum(d.rent_per_bed)) : "",
//         security_deposit:       secDeposit > 0            ? String(secDeposit) : "",
//         payment_mode:           "UPI / Bank Transfer",
//         company_name:           "",
//         company_address:        "",
//       };
//       (selTemplate!.variables || []).forEach(v => { if (!(v in mapped)) mapped[v] = ""; });
//       return mapped;
//     } catch {
//       return base;
//     }
//   };

//   // ── Step 1: select template ──────────────────────────────────────────────────
//   const handleTemplateSelect = async (tpl: DocumentTemplate) => {
//     let full = tpl;
//     if (!tpl.html_content) {
//       try { const r = await getTemplate(tpl.id); full = r.data || tpl; } catch {}
//     }
//     setSelTemplate(full);
//     setStep(2);
//   };

//   // ── Step 2 → Step 3: build queue and fetch first tenant's data ──────────────
//   // Called when user clicks a tenant card (single) OR clicks "Proceed" with multi-select
//   const proceedToFillDetails = async (tenants: any[]) => {
//     if (!tenants.length) return;
//     setFetchingDetail(true);
//     try {
//       // Build queue
//       setTenantQueue(tenants);
//       setQueueIndex(0);

//       // Pre-fill first tenant's data
//       const firstData = await fetchTenantFormData(tenants[0]);
//       const initialQueue = tenants.map(() => ({} as Record<string, string>));
//       initialQueue[0] = firstData;
//       setQueueFormData(initialQueue);

//       toast.success(`✅ Auto-filled for ${tenants[0].full_name}`);
//       setStep(3);
//     } catch {
//       toast.info("Basic info filled — some fields may need manual entry");
//       const fd: Record<string, string> = {
//         date: todayStr(), document_type: selTemplate!.category,
//         tenant_name: tenants[0].full_name || "", tenant_phone: tenants[0].phone || "",
//       };
//       (selTemplate!.variables || []).forEach(v => { if (!(v in fd)) fd[v] = ""; });
//       setTenantQueue(tenants);
//       setQueueIndex(0);
//       setQueueFormData(tenants.map((_, i) => i === 0 ? fd : {}));
//       setStep(3);
//     } finally {
//       setFetchingDetail(false);
//     }
//   };

//   // Single tenant click (no multi-select needed)
//   const handleSingleTenantSelect = async (t: any) => {
//     setSelectedTenantIds(new Set());
//     await proceedToFillDetails([t]);
//   };

//   // Multi proceed
//   const handleMultiProceed = async () => {
//     const tenants = filteredTenantList.filter((t: any) => selectedTenantIds.has(Number(t.id)));
//     if (!tenants.length) return;
//     await proceedToFillDetails(tenants);
//   };

//   const skipTenant = () => {
//     setTenantQueue([]);
//     setQueueIndex(0);
//     setQueueFormData([]);
//     setSelectedTenantIds(new Set());
//     const empty: Record<string, string> = { date: todayStr(), document_type: selTemplate!.category };
//     (selTemplate!.variables || []).forEach(v => { if (!(v in empty)) empty[v] = ""; });
//     setTenantQueue([{ id: null, full_name: "" }]);
//     setQueueFormData([empty]);
//     setStep(3);
//   };

//   // ── Step 3: navigate between tenants ────────────────────────────────────────
//   // "Next" in step 3: if more tenants, fetch next one's data; else go to step 4
//   const handleStep3Next = async () => {
//     // Validate current
//     const cur = queueFormData[queueIndex] || {};
//     if (!cur.tenant_name?.trim())  { toast.error("Tenant Name required");  return; }
//     if (!cur.tenant_phone?.trim()) { toast.error("Tenant Phone required"); return; }

//     if (queueIndex < tenantQueue.length - 1) {
//       // Move to next tenant
//       const nextIdx = queueIndex + 1;
//       setQueueIndex(nextIdx);

//       // Fetch data for next tenant if not yet fetched
//       if (!queueFormData[nextIdx] || Object.keys(queueFormData[nextIdx]).length === 0) {
//         setFetchingDetail(true);
//         try {
//           const data = await fetchTenantFormData(tenantQueue[nextIdx]);
//           setQueueFormData(prev => {
//             const next = [...prev];
//             next[nextIdx] = data;
//             return next;
//           });
//           toast.success(`✅ Auto-filled for ${tenantQueue[nextIdx].full_name}`);
//         } catch {
//           const fd: Record<string, string> = { date: todayStr(), document_type: selTemplate!.category };
//           (selTemplate!.variables || []).forEach(v => { if (!(v in fd)) fd[v] = ""; });
//           setQueueFormData(prev => { const n = [...prev]; n[nextIdx] = fd; return n; });
//         } finally {
//           setFetchingDetail(false);
//         }
//       }
//     } else {
//       // All tenants done — go to settings
//       setStep(4);
//     }
//   };

//   const handleStep3Back = () => {
//     if (queueIndex > 0) {
//       setQueueIndex(queueIndex - 1);
//     } else {
//       setStep(2);
//     }
//   };

//   // ── Preview ─────────────────────────────────────────────────────────────────
//   const generatePreview = () => {
//     if (!selTemplate?.html_content) return;
//     const logo = selTemplate.logo_url
//       ? (selTemplate.logo_url.startsWith("http") ? selTemplate.logo_url : `${API_BASE}${selTemplate.logo_url}`)
//       : "";
//     const now = new Date();
//     const previewNum = "DOC-" + now.getFullYear() + String(now.getMonth()+1).padStart(2,"0") + "-"
//       + String(Math.floor(Math.random()*999)+1).padStart(6,"0");
//     setPreviewHtml(renderHtml(selTemplate.html_content, { ...formData, document_number: previewNum }, logo));
//     setShowPreview(true);
//   };

//   const handlePrint = () => {
//     const w = window.open("","_blank");
//     if (w) { w.document.write(`<html><head><title>Doc</title></head><body>${previewHtml}</body></html>`); w.document.close(); w.focus(); w.print(); }
//   };

//   const handleDownload = () => {
//     if (!previewHtml) { toast.error("Open Preview first"); return; }
//     const pw = window.open("","_blank","width=900,height=700");
//     if (!pw) { toast.error("Popup blocked"); return; }
//     pw.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Doc</title>
// <style>*{box-sizing:border-box;}body{margin:0;padding:0;}@media print{@page{size:A4;margin:10mm;}}</style></head>
// <body>${previewHtml}<script>window.onload=function(){setTimeout(function(){window.print();window.onafterprint=function(){window.close();};},400);};<\/script></body></html>`);
//     pw.document.close();
//   };

//   // ── Save one document ───────────────────────────────────────────────────────
//   const saveOneDoc = async (tenant: any, data: Record<string, string>, token: string | null) => {
//     const logo = selTemplate!.logo_url
//       ? (selTemplate!.logo_url.startsWith("http") ? selTemplate!.logo_url : `${API_BASE}${selTemplate!.logo_url}`)
//       : "";
//     const payload = {
//       template_id:        selTemplate!.id,
//       document_name:      selTemplate!.name,
//       tenant_id:          tenant?.id     || null,
//       tenant_name:        data.tenant_name  || "",
//       tenant_phone:       data.tenant_phone || "",
//       tenant_email:       data.tenant_email || null,
//       property_name:      data.property_name || null,
//       room_number:        data.room_number   || null,
//       html_content:       renderHtml(selTemplate!.html_content, data, logo),
//       data_json:          data,
//       status:             "Created",
//       created_by:         "Admin",
//       signature_required: settings.signatureRequired,
//       priority:           settings.priority,
//       expiry_date:        settings.expiryDate || null,
//       tags:               settings.tags,
//       notes:              settings.notes     || null,
//     };
//     const res = await fetch(`${API_BASE}/api/documents`, {
//       method: "POST",
//       headers: { "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) },
//       body: JSON.stringify(payload),
//     });
//     const json = await res.json();
//     if (!res.ok) throw new Error(json.message || "Failed");
//     return json;
//   };

//   // ── Step 4: Save all documents ───────────────────────────────────────────────
//   const handleSaveAll = async () => {
//     // Validate all forms
//     for (let i = 0; i < queueFormData.length; i++) {
//       const d = queueFormData[i] || {};
//       if (!d.tenant_name?.trim())  { toast.error(`Tenant ${i+1}: Name required`);  return; }
//       if (!d.tenant_phone?.trim()) { toast.error(`Tenant ${i+1}: Phone required`); return; }
//     }

//     const token = localStorage.getItem("admin_token");

//     if (tenantQueue.length === 1) {
//       // Single — simple save
//       setSaving(true);
//       try {
//         const data = await saveOneDoc(tenantQueue[0], queueFormData[0] || {}, token);
//         toast.success(`✅ Document created! No: ${data.data?.document_number || "N/A"}`);
//         resetAll();
//       } catch (e: any) { toast.error(e.message || "Failed"); }
//       finally { setSaving(false); }
//     } else {
//       // Bulk — show progress modal
//       setBulkProgress({ total: tenantQueue.length, done: 0, current: "Starting…", errors: [] });
//       let done = 0;
//       const errors: string[] = [];

//       for (let i = 0; i < tenantQueue.length; i++) {
//         const t = tenantQueue[i];
//         const d = queueFormData[i] || {};
//         setBulkProgress(p => ({ ...p!, current: `Creating for ${t.full_name || `Tenant ${i+1}`}…` }));
//         try {
//           await saveOneDoc(t, d, token);
//         } catch (e: any) {
//           errors.push(`${t.full_name || `Tenant ${i+1}`}: ${e.message || "Failed"}`);
//         }
//         done++;
//         setBulkProgress({ total: tenantQueue.length, done, current: `${done}/${tenantQueue.length} done`, errors: [...errors] });
//       }
//     }
//   };

//   const resetAll = () => {
//     setStep(1); setSelTemplate(null);
//     setTenantQueue([]); setQueueIndex(0); setQueueFormData([]);
//     setSelectedTenantIds(new Set());
//     setBulkProgress(null);
//     setSettings({ signatureRequired:false, priority:"normal", expiryDate:"", tags:[], notes:"" });
//   };

//   const addTag    = (v: string) => { if (v.trim() && !settings.tags.includes(v.trim())) setSettings(p => ({ ...p, tags:[...p.tags, v.trim()] })); };
//   const removeTag = (v: string) => setSettings(p => ({ ...p, tags:p.tags.filter(t => t !== v) }));

//   const visibleVars = useMemo(() =>
//     (selTemplate?.variables || []).filter(v => !HIDDEN_VARS.includes(v)),
//     [selTemplate]);

//   const isMulti      = tenantQueue.length > 1;
//   const currentTenant = tenantQueue[queueIndex] || null;

//   // ─────────────────────────────────────────────────────────────────────────────
//   return (
//     <div className="bg-gray-50 min-h-full">

//       {/* ── STICKY HEADER ── */}
//       <div className="sticky top-16 z-10 pb-2">
//         <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
//           <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
//             {selTemplate && (
//               <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm min-w-0 text-[11px]">
//                 <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
//                 <span className="font-semibold text-blue-700 truncate max-w-[120px]">{selTemplate.name}</span>
//               </div>
//             )}
//             {isMulti && step >= 3 && (
//               <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1.5 shadow-sm text-[11px]">
//                 <Users className="h-3 w-3 text-indigo-500 flex-shrink-0" />
//                 <span className="font-semibold text-indigo-700">
//                   {queueIndex + 1} / {tenantQueue.length} tenants
//                 </span>
//               </div>
//             )}
//           </div>
//           <div className="flex items-center gap-1.5 flex-shrink-0">
//             <button onClick={loadTemplates} disabled={loadingTpls}
//               className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 shadow-sm">
//               <RefreshCw className={`h-3.5 w-3.5 ${loadingTpls ? "animate-spin":""}`} />
//             </button>
//             {step > 1 && (
//               <button onClick={resetAll}
//                 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium shadow-sm">
//                 <X className="h-3.5 w-3.5" />Start Over
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-3 gap-1.5 mb-2">
//           <StatCard label="Templates"  value={stats.total}  icon={LayoutTemplate} accent="bg-blue-600" />
//           <StatCard label="Active"     value={stats.active} icon={CheckCircle}    accent="bg-green-500" />
//           <StatCard label="Categories" value={stats.cats}   icon={Tag}            accent="bg-indigo-600" />
//         </div>

//         {/* Step indicators */}
//         <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm overflow-x-auto">
//           {["Select Template","Select Tenant(s)","Fill Details","Settings & Save"].map((label, i) => (
//             <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
//               <StepDot n={i+1} label={label} cur={step} done={step > i+1} />
//               {i < 3 && <ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ══ STEP 1: Templates ══ */}
//       {step === 1 && (
//         <Card className="border rounded-lg shadow-sm">
//           <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
//             <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//               <LayoutTemplate className="h-4 w-4 text-blue-600" />Choose Template ({filteredTpls.length})
//             </span>
//             {(tplSearch || catFilter !== "All") && (
//               <button onClick={() => { setTplSearch(""); setCatFilter("All"); }} className="text-[10px] text-blue-600 font-semibold">Clear</button>
//             )}
//           </div>
//           <div className="px-3 py-2 border-b bg-gray-50/50 flex gap-2">
//             <div className="flex-1 relative">
//               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
//               <Input placeholder="Search templates…" value={tplSearch} onChange={e => setTplSearch(e.target.value)} className="h-8 pl-8 text-[11px] bg-white border-gray-200" />
//             </div>
//             <Select value={catFilter} onValueChange={setCatFilter}>
//               <SelectTrigger className="h-8 w-[160px] text-[11px] bg-white border-gray-200"><SelectValue /></SelectTrigger>
//               <SelectContent>{TPL_CATS.map(c => <SelectItem key={c} value={c} className={SI}>{c}</SelectItem>)}</SelectContent>
//             </Select>
//           </div>
//           <div className="p-3" style={{ maxHeight:"calc(100vh - 310px)", overflowY:"auto" }}>
//             {loadingTpls ? (
//               <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
//             ) : filteredTpls.length === 0 ? (
//               <div className="text-center py-12"><LayoutTemplate className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-sm font-medium text-gray-500">No templates found</p></div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
//                 {filteredTpls.map(t => (
//                   <button key={t.id} onClick={() => handleTemplateSelect(t)}
//                     className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group relative">
//                     {t.is_active && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-green-500" />}
//                     <div className="flex items-start gap-2 mb-2">
//                       {t.logo_url ? (
//                         <img src={t.logo_url.startsWith("http") ? t.logo_url : `${API_BASE}${t.logo_url}`} alt=""
//                           className="h-7 w-10 object-contain rounded border border-gray-100 bg-gray-50 p-0.5 flex-shrink-0"
//                           onError={e => (e.currentTarget.style.display = "none")} />
//                       ) : (
//                         <div className="h-7 w-7 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
//                           <FileText className="h-3.5 w-3.5 text-blue-500" />
//                         </div>
//                       )}
//                       <p className="text-[11px] font-black text-gray-800 group-hover:text-blue-700 leading-tight line-clamp-2">{t.name}</p>
//                     </div>
//                     <div className="flex items-center gap-1.5 flex-wrap">
//                       <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] px-1.5 py-0">{t.category}</Badge>
//                       <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[9px] px-1.5 py-0">v{t.version}</Badge>
//                       <span className="text-[9px] text-gray-400 ml-auto">{t.variables?.length || 0} vars</span>
//                     </div>
//                     {t.description && <p className="text-[9px] text-gray-400 mt-1.5 line-clamp-1">{t.description}</p>}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </Card>
//       )}

//       {/* ══ STEP 2: Select Tenant(s) ══ */}
//       {step === 2 && selTemplate && (
//         <Card className="border rounded-lg shadow-sm">
//           {/* Header */}
//           <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg flex-wrap gap-1">
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                 <Users className="h-4 w-4 text-green-600" />Select Tenant(s)
//               </span>
//               {filteredTenantList.length > 0 && (
//                 <button onClick={toggleSelectAll}
//                   className={`inline-flex items-center gap-1 h-6 px-2 rounded-md border text-[10px] font-semibold transition-all
//                     ${allSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"}`}>
//                   {allSelected
//                     ? <><CheckSquare className="h-3 w-3" />All ({filteredTenantList.length})</>
//                     : <><Square className="h-3 w-3" />Select All</>
//                   }
//                 </button>
//               )}
//             </div>
//             <div className="flex items-center gap-2">
//               {(fetchingDetail || loadingExclusions) && (
//                 <div className="flex items-center gap-1 text-[11px] text-blue-600">
//                   <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                   {loadingExclusions ? "Checking docs…" : "Fetching…"}
//                 </div>
//               )}
//               <button onClick={skipTenant} className="h-7 px-2.5 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">Skip →</button>
//             </div>
//           </div>

//           {/* ── Filter row ── */}
//           <div className="px-3 py-2 border-b bg-gray-50/50 flex flex-wrap gap-2 items-center">
//             {/* Text search */}
//             <div className="flex-1 min-w-[150px] relative">
//               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
//               <Input placeholder="Name, phone, email…" value={tenantSearch} onChange={e => setTenantSearch(e.target.value)}
//                 className="h-8 pl-8 text-[11px] bg-white border-gray-200" autoFocus />
//             </div>

//             {/* Active/Inactive toggle */}
//             <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white flex-shrink-0">
//               {(["all","active","inactive"] as const).map(s => (
//                 <button key={s} onClick={() => setFilterStatus(s)}
//                   className={`h-8 px-2.5 text-[10px] font-semibold transition-colors
//                     ${filterStatus === s ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
//                   {s === "all" ? "All" : s === "active" ? "Active" : "Inactive"}
//                 </button>
//               ))}
//             </div>

//             {/* Property filter — uses property ID as value, shows name */}
//             <Select value={filterPropertyId} onValueChange={v => { setFilterPropertyId(v); setFilterFloor("all"); }}>
//               <SelectTrigger className="h-8 w-[160px] text-[11px] bg-white border-gray-200">
//                 <SelectValue placeholder={loadingPropData ? "Loading…" : "All Properties"} />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all" className={SI}>All Properties</SelectItem>
//                 {propertyOptions.map(p => (
//                   <SelectItem key={p.id} value={p.id} className={SI}>{p.name}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             {/* Floor filter — only show when floors are available */}
//             <Select value={filterFloor} onValueChange={setFilterFloor}>
//               <SelectTrigger className="h-8 w-[110px] text-[11px] bg-white border-gray-200">
//                 <SelectValue placeholder="All Floors" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all" className={SI}>All Floors</SelectItem>
//                 {floorOptions.map(f => (
//                   <SelectItem key={f} value={f} className={SI}>Floor {f}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             {/* Clear filters */}
//             {(filterPropertyId !== "all" || filterFloor !== "all" || filterStatus !== "active" || tenantSearch) && (
//               <button onClick={() => { setFilterPropertyId("all"); setFilterFloor("all"); setFilterStatus("active"); setTenantSearch(""); }}
//                 className="h-8 px-2 rounded-lg border border-gray-200 bg-white text-[10px] font-medium text-gray-500 hover:bg-gray-50 flex-shrink-0">
//                 <X className="h-3 w-3 inline mr-0.5" />Clear
//               </button>
//             )}
//           </div>

//           {/* Status / exclusion bar */}
//           <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2 text-[10px]">
//             <span className="text-gray-500 flex items-center gap-1.5">
//               {loadingPropData && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
//               Showing <span className="font-semibold text-gray-700">{filteredTenantList.length}</span> of {tenantList.length} tenants
//               {excludedTenantIds.size > 0 && <span className="text-orange-500 ml-1">({excludedTenantIds.size} already have this doc — hidden)</span>}
//             </span>
//             {selectedTenantIds.size > 0 && (
//               <span className="text-indigo-600 font-semibold">{selectedTenantIds.size} selected</span>
//             )}
//           </div>

//           {/* Multi-select action bar */}
//           {selectedTenantIds.size > 0 && (
//             <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-200 flex items-center justify-between gap-2">
//               <div className="flex items-center gap-2">
//                 <ListChecks className="h-4 w-4 text-indigo-600 flex-shrink-0" />
//                 <span className="text-[11px] font-semibold text-indigo-700">
//                   {selectedTenantIds.size} selected — fill details for each one by one
//                 </span>
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <button onClick={() => setSelectedTenantIds(new Set())}
//                   className="h-7 px-2 rounded-md border border-indigo-200 bg-white text-[10px] font-medium text-indigo-600 hover:bg-indigo-50">
//                   Clear
//                 </button>
//                 <button onClick={handleMultiProceed} disabled={fetchingDetail}
//                   className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold disabled:opacity-50">
//                   {fetchingDetail ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
//                   Fill Details for {selectedTenantIds.size} →
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Tenant grid */}
//           <div className="p-3" style={{ maxHeight:"calc(100vh - 440px)", overflowY:"auto" }}>
//             {loadingTenants ? (
//               <div className="flex items-center justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>
//             ) : filteredTenantList.length === 0 ? (
//               <div className="text-center py-10">
//                 <User className="h-9 w-9 text-gray-300 mx-auto mb-2" />
//                 <p className="text-sm font-medium text-gray-500">
//                   {excludedTenantIds.size > 0 ? "All tenants already have this document" : "No tenants found"}
//                 </p>
//                 <button onClick={() => { setFilterPropertyId("all"); setFilterFloor("all"); setFilterStatus("all"); setTenantSearch(""); }}
//                   className="mt-2 text-[11px] text-blue-600 underline">Clear all filters</button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
//                 {filteredTenantList.map((t: any) => {
//                   const tid     = Number(t.id);
//                   const checked = selectedTenantIds.has(tid);
//                   const floor   = getFloorFromRoom(t.room_number || t.assigned_room_number);
//                   const isActive = t.is_active === true || t.is_active === 1;
//                   return (
//                     <div key={t.id}
//                       className={`relative rounded-lg border-2 transition-all group
//                         ${checked
//                           ? "border-indigo-500 bg-indigo-50/60 shadow-sm"
//                           : "border-gray-200 bg-white hover:border-green-400 hover:shadow-md"}`}>
//                       {/* Checkbox */}
//                       <button onClick={e => toggleTenant(tid, e)}
//                         className="absolute top-2 left-2 z-10 p-0.5"
//                         title={checked ? "Deselect" : "Add to selection"}>
//                         {checked
//                           ? <CheckSquare className="h-4 w-4 text-indigo-600" />
//                           : <Square className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
//                         }
//                       </button>
//                       {/* Inactive badge */}
//                       {!isActive && (
//                         <span className="absolute top-2 right-2 text-[8px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold">Inactive</span>
//                       )}
//                       {/* Card body — single click */}
//                       <button onClick={() => !fetchingDetail && handleSingleTenantSelect(t)}
//                         disabled={fetchingDetail}
//                         className="w-full text-left p-3 pl-8 disabled:opacity-60"
//                         title="Click to create document for this tenant only">
//                         <div className="flex items-center gap-2 mb-1.5">
//                           <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-sm
//                             ${isActive ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gray-400"}`}>
//                             {(t.full_name || "?").charAt(0).toUpperCase()}
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <p className={`text-[11px] font-black truncate ${checked ? "text-indigo-700" : "text-gray-800 group-hover:text-green-700"}`}>
//                               {t.full_name}
//                             </p>
//                             {(t.property_name || t.assigned_property_name) && (
//                               <p className="text-[9px] text-gray-400 flex items-center gap-1 truncate">
//                                 <Building2 className="h-2.5 w-2.5 flex-shrink-0" />
//                                 {t.property_name || t.assigned_property_name}
//                               </p>
//                             )}
//                           </div>
//                           {(t.room_number || t.assigned_room_number) && (
//                             <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
//                               <Badge className={`text-[9px] px-1.5 py-0 ${checked ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-green-50 text-green-700 border-green-200"}`}>
//                                 R-{t.room_number || t.assigned_room_number}
//                               </Badge>
//                               {floor && (
//                                 <span className="text-[8px] text-gray-400 font-medium">Floor {floor}</span>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                         <div className="space-y-0.5">
//                           {t.phone && <p className="text-[10px] text-gray-500 flex items-center gap-1"><Phone className="h-2.5 w-2.5 text-gray-400" />{t.phone}</p>}
//                           {t.email && <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate"><Mail className="h-2.5 w-2.5 text-gray-400" />{t.email}</p>}
//                           {(t.monthly_rent || t.rent_per_bed) && (
//                             <p className="text-[10px] text-gray-500 flex items-center gap-1">
//                               <IndianRupee className="h-2.5 w-2.5 text-gray-400" />{money(t.monthly_rent || t.rent_per_bed)}/mo
//                             </p>
//                           )}
//                         </div>
//                       </button>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
//             <button onClick={() => { setStep(1); setSelTemplate(null); }}
//               className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
//               <ChevronLeft className="h-3 w-3" />Back
//             </button>
//             <p className="text-[10px] text-gray-400 hidden sm:block">
//               Click card = single · Checkbox + button = multiple (step-by-step)
//             </p>
//           </div>
//         </Card>
//       )}

//       {/* ══ STEP 3: Fill Details (one tenant at a time) ══ */}
//       {step === 3 && selTemplate && (
//         <Card className="border rounded-lg shadow-sm">
//           <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg flex-wrap gap-1">
//             <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//               <FileText className="h-4 w-4 text-blue-600" />Document Details
//               {isMulti && (
//                 <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 border border-indigo-200 rounded-md px-1.5 py-0.5">
//                   {queueIndex + 1} / {tenantQueue.length}
//                 </span>
//               )}
//             </span>
//             {currentTenant?.id && (
//               <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-md px-2 py-1">
//                 <UserCheck className="h-3 w-3 text-green-600" />
//                 <span className="text-[10px] font-semibold text-green-700">{currentTenant.full_name}</span>
//                 {fetchingDetail && <Loader2 className="h-3 w-3 animate-spin text-blue-500 ml-1" />}
//               </div>
//             )}
//           </div>

//           {/* Multi-tenant progress dots */}
//           {isMulti && (
//             <div className="px-3 py-2 border-b bg-gray-50/70 flex items-center gap-1.5 overflow-x-auto">
//               <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">Tenants:</span>
//               {tenantQueue.map((t, i) => {
//                 const isCurrentIdx = i === queueIndex;
//                 const isDoneIdx    = i < queueIndex;
//                 const hasData      = queueFormData[i] && Object.keys(queueFormData[i]).length > 0;
//                 return (
//                   <div key={i} className="flex items-center gap-0.5 flex-shrink-0">
//                     <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-all
//                       ${isCurrentIdx ? "bg-blue-600 text-white border-blue-600 shadow-sm"
//                         : isDoneIdx  ? "bg-green-500 text-white border-green-500"
//                         : "bg-white text-gray-500 border-gray-200"}`}>
//                       {isDoneIdx ? <Check className="h-2.5 w-2.5" /> : <span className="text-[9px]">{i+1}</span>}
//                       <span className="max-w-[60px] truncate">{t.full_name?.split(" ")[0] || `T${i+1}`}</span>
//                     </div>
//                     {i < tenantQueue.length - 1 && <ArrowRight className="h-3 w-3 text-gray-300" />}
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           <div className="p-3" style={{ maxHeight:"calc(100vh - 310px)", overflowY:"auto" }}>
//             {GROUP_SYSTEM.some(v => visibleVars.includes(v)) && (
//               <div className="mb-4">
//                 <SH icon={<FileText className="h-3 w-3" />} title="Document Info" />
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                   {GROUP_SYSTEM.filter(v => visibleVars.includes(v)).map(v => (
//                     <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
//                   ))}
//                 </div>
//               </div>
//             )}
//             {GROUP_TENANT.some(v => visibleVars.includes(v)) && (
//               <div className="mb-4">
//                 <SH icon={<User className="h-3 w-3" />} title="Tenant Information" color="text-green-600" />
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                   {GROUP_TENANT.filter(v => visibleVars.includes(v)).map(v => (
//                     <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData}
//                       required={["tenant_name","tenant_phone"].includes(v)} />
//                   ))}
//                 </div>
//               </div>
//             )}
//             {GROUP_PROPERTY.some(v => visibleVars.includes(v)) && (
//               <div className="mb-4">
//                 <SH icon={<Building2 className="h-3 w-3" />} title="Property Details" color="text-indigo-600" />
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                   {GROUP_PROPERTY.filter(v => visibleVars.includes(v)).map(v => (
//                     <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
//                   ))}
//                 </div>
//               </div>
//             )}
//             {GROUP_COMPANY.some(v => visibleVars.includes(v)) && (
//               <div className="mb-4">
//                 <SH icon={<Building2 className="h-3 w-3" />} title="Company / Manager Info" color="text-orange-600" />
//                 <p className="text-[10px] text-orange-500 mb-2">Fill your company name and address manually</p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                   {GROUP_COMPANY.filter(v => visibleVars.includes(v)).map(v => (
//                     <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
//                   ))}
//                 </div>
//               </div>
//             )}
//             {(() => {
//               const rest = visibleVars.filter(v => !ALL_GROUPED.includes(v));
//               if (!rest.length) return null;
//               return (
//                 <div className="mb-4">
//                   <SH icon={<Hash className="h-3 w-3" />} title="Other Fields" color="text-gray-500" />
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                     {rest.map(v => <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />)}
//                   </div>
//                 </div>
//               );
//             })()}
//             {currentTenant?.id && (
//               <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
//                 <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-[10px] text-blue-700">
//                   Fields in <span className="font-bold text-green-600">green</span> are auto-filled from tenant's profile.
//                   {isMulti && " Each tenant's details are filled separately."}
//                 </p>
//               </div>
//             )}
//           </div>

//           <div className="px-3 py-2.5 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
//             <button onClick={handleStep3Back}
//               className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
//               <ChevronLeft className="h-3 w-3" />
//               {queueIndex > 0 ? `Back to ${tenantQueue[queueIndex-1]?.full_name?.split(" ")[0] || "Previous"}` : "Back"}
//             </button>
//             <div className="flex gap-2">
//               <button onClick={generatePreview}
//                 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md">
//                 <Eye className="h-3.5 w-3.5" />Preview
//               </button>
//               <button onClick={handleStep3Next} disabled={fetchingDetail}
//                 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:shadow-md disabled:opacity-60">
//                 {fetchingDetail
//                   ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading…</>
//                   : queueIndex < tenantQueue.length - 1
//                   ? <>Next: {tenantQueue[queueIndex+1]?.full_name?.split(" ")[0] || "Next"} <ChevronRight className="h-3.5 w-3.5" /></>
//                   : <>Settings <ChevronRight className="h-3.5 w-3.5" /></>
//                 }
//               </button>
//             </div>
//           </div>
//         </Card>
//       )}

//       {/* ══ STEP 4: Settings & Save ══ */}
//       {step === 4 && selTemplate && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
//           <div className="lg:col-span-2">
//             <Card className="border rounded-lg shadow-sm">
//               <div className="px-3 py-2 border-b bg-white rounded-t-lg flex items-center justify-between">
//                 <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
//                   <Shield className="h-3.5 w-3.5 text-blue-600" />Document Options
//                 </span>
//                 {isMulti && (
//                   <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md px-2 py-0.5">
//                     Applied to all {tenantQueue.length} documents
//                   </span>
//                 )}
//               </div>
//               <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.signatureRequired ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
//                   onClick={() => setSettings(p => ({ ...p, signatureRequired:!p.signatureRequired }))}>
//                   <div className="flex items-center gap-2">
//                     <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${settings.signatureRequired ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
//                       {settings.signatureRequired && <Check className="h-3 w-3 text-white" />}
//                     </div>
//                     <div>
//                       <p className="text-[11px] font-black text-gray-800">Signature Required</p>
//                       <p className="text-[9px] text-gray-500">Tenant must sign to complete</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <label className={L}><AlertCircle className="h-3 w-3 inline mr-1" />Priority</label>
//                   <div className="flex gap-1.5 flex-wrap">
//                     {PRIORITY_OPTS.map(o => (
//                       <button key={o.value} onClick={() => setSettings(p => ({ ...p, priority:o.value }))}
//                         className={`px-2.5 py-1 rounded-md text-[10px] font-bold border-2 transition-all
//                           ${settings.priority === o.value ? "border-blue-500 bg-blue-600 text-white shadow-sm" : `${o.cls} border-transparent hover:border-gray-300`}`}>
//                         {o.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <label className={L}><Clock className="h-3 w-3 inline mr-1" />Expiry Date</label>
//                   <Input type="date" value={settings.expiryDate} onChange={e => setSettings(p => ({...p, expiryDate:e.target.value}))}
//                     min={new Date().toISOString().split("T")[0]} className={`${F} w-full`} />
//                   {settings.expiryDate && <p className="text-[9px] text-orange-500 mt-0.5">Won't show after this date</p>}
//                 </div>
//                 <div>
//                   <label className={L}><Tag className="h-3 w-3 inline mr-1" />Tags</label>
//                   <Input ref={tagRef} placeholder="Press Enter to add…"
//                     onKeyDown={e => { if (e.key === "Enter" && tagRef.current) { addTag(tagRef.current.value); tagRef.current.value = ""; } }}
//                     className={`${F} w-full`} />
//                   <div className="flex flex-wrap gap-1 mt-1.5">
//                     {settings.tags.map(tag => (
//                       <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold flex items-center gap-1 border border-blue-200">
//                         {tag}<button onClick={() => removeTag(tag)}><X className="h-2.5 w-2.5" /></button>
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <div className="px-3 pb-3">
//                 <label className={L}>Notes</label>
//                 <textarea value={settings.notes} onChange={e => setSettings(p => ({...p, notes:e.target.value}))} rows={2}
//                   className="w-full px-2.5 py-2 text-[11px] border border-gray-200 rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-gray-50 focus:bg-white resize-none transition-all"
//                   placeholder="Any additional instructions…" />
//               </div>
//             </Card>
//           </div>

//           <div className="space-y-3">
//             <Card className="border rounded-lg shadow-sm">
//               <div className="px-3 py-2 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg">
//                 <span className="text-xs font-semibold text-white flex items-center gap-1.5">
//                   <CheckCircle className="h-3.5 w-3.5" />
//                   {isMulti ? `Bulk Summary (${tenantQueue.length} docs)` : "Document Summary"}
//                 </span>
//               </div>
//               <div className="p-3 space-y-2">
//                 <div className="flex items-start justify-between gap-2">
//                   <span className="text-[10px] text-gray-400 font-semibold">Template</span>
//                   <span className="text-[10px] font-bold text-blue-700 text-right truncate max-w-[140px]">{selTemplate.name}</span>
//                 </div>
//                 {isMulti ? (
//                   <>
//                     <div className="flex items-start justify-between gap-2">
//                       <span className="text-[10px] text-gray-400 font-semibold">Tenants</span>
//                       <span className="text-[10px] font-bold text-indigo-700">{tenantQueue.length} documents</span>
//                     </div>
//                     <div className="border-t pt-2 max-h-28 overflow-y-auto space-y-1">
//                       {tenantQueue.map((t, i) => (
//                         <div key={i} className="flex items-center gap-1.5">
//                           <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
//                           <p className="text-[10px] text-gray-700 truncate">{t.full_name}</p>
//                           <button onClick={() => { setQueueIndex(i); setStep(3); }}
//                             className="ml-auto text-[9px] text-blue-500 hover:underline flex-shrink-0">edit</button>
//                         </div>
//                       ))}
//                     </div>
//                   </>
//                 ) : (
//                   [
//                     ["Tenant",   formData.tenant_name    || "—", "text-gray-800"],
//                     ["Phone",    formData.tenant_phone   || "—", "text-gray-600"],
//                     ["Property", formData.property_name  || "—", "text-gray-600"],
//                     ["Room",     formData.room_number    || "—", "text-gray-600"],
//                     ["Move-In",  formData.move_in_date   || "—", "text-gray-600"],
//                     ["Rent",     formData.rent_amount    ? money(formData.rent_amount) : "—", "text-green-700"],
//                     ["Deposit",  formData.security_deposit ? money(formData.security_deposit) : "—", "text-green-700"],
//                   ].map(([k,v,cls]) => (
//                     <div key={k} className="flex items-start justify-between gap-2">
//                       <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">{k}</span>
//                       <span className={`text-[10px] font-bold text-right truncate max-w-[140px] ${cls}`}>{v}</span>
//                     </div>
//                   ))
//                 )}
//                 {[
//                   ["Priority",  settings.priority.toUpperCase(), "text-orange-600"],
//                   ["Signature", settings.signatureRequired ? "Required":"Not Required", settings.signatureRequired ? "text-blue-600":"text-gray-500"],
//                   ["Expires",   settings.expiryDate || "No expiry", settings.expiryDate ? "text-orange-600":"text-gray-400"],
//                 ].map(([k,v,cls]) => (
//                   <div key={k} className="flex items-start justify-between gap-2">
//                     <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">{k}</span>
//                     <span className={`text-[10px] font-bold text-right truncate max-w-[140px] ${cls}`}>{v}</span>
//                   </div>
//                 ))}
//               </div>
//             </Card>

//             <div className="space-y-2">
//               {!isMulti && (
//                 <button onClick={generatePreview}
//                   className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md transition-all">
//                   <Eye className="h-3.5 w-3.5" />Preview Document
//                 </button>
//               )}
//               <button onClick={handleSaveAll} disabled={saving}
//                 className={`w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-white text-[11px] font-semibold hover:shadow-md transition-all disabled:opacity-50
//                   ${isMulti ? "bg-gradient-to-r from-indigo-600 to-purple-600" : "bg-gradient-to-r from-green-600 to-emerald-600"}`}>
//                 {saving
//                   ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
//                   : isMulti
//                   ? <><Users className="h-3.5 w-3.5" />Create {tenantQueue.length} Documents</>
//                   : <><Save className="h-3.5 w-3.5" />Create Document</>
//                 }
//               </button>
//               <button onClick={() => { setQueueIndex(tenantQueue.length - 1); setStep(3); }}
//                 className="w-full inline-flex items-center justify-center gap-1 h-7 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
//                 <ChevronLeft className="h-3 w-3" />{isMulti ? "Back to Last Tenant" : "Back to Details"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ══ PREVIEW MODAL ══ */}
//       {showPreview && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col" style={{ maxHeight:"92vh" }}>
//             <div className="flex-shrink-0 bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 rounded-t-xl flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Eye className="h-4 w-4 text-white" />
//                 <span className="text-sm font-semibold text-white">
//                   Preview — {currentTenant?.full_name || "Document"}
//                 </span>
//                 {isMulti && <Badge className="bg-white/20 text-white border-0 text-[10px]">{queueIndex+1}/{tenantQueue.length}</Badge>}
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Download className="h-4 w-4" /></button>
//                 <button onClick={handlePrint}    className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Printer className="h-4 w-4" /></button>
//                 <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><X className="h-4 w-4" /></button>
//               </div>
//             </div>
//             <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
//               <div className="bg-white rounded-lg shadow-md max-w-[210mm] mx-auto">
//                 <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
//               </div>
//             </div>
//             <div className="flex-shrink-0 px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
//               <button onClick={handleDownload} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold">
//                 <Download className="h-3.5 w-3.5" />Download
//               </button>
//               <button onClick={handlePrint} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold">
//                 <Printer className="h-3.5 w-3.5" />Print
//               </button>
//               <button onClick={() => setShowPreview(false)} className="h-8 px-3 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100">
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ══ BULK PROGRESS MODAL ══ */}
//       {bulkProgress && (
//         <BulkProgressModal
//           total={bulkProgress.total}
//           done={bulkProgress.done}
//           current={bulkProgress.current}
//           errors={bulkProgress.errors}
//           onClose={resetAll}
//         />
//       )}
//     </div>
//   );
// }


// DocumentCreate.tsx
// Multi-tenant step-by-step flow:
//   Step 1: Choose template
//   Step 2: Select tenant(s) — checkbox for multi, click for single
//   Step 3: Fill details for tenant[0], then tenant[1], etc. (one at a time)
//   Step 4: Settings & Save — creates docs for all tenants in queue
//
// Filters in Step 2:
//   - Active / Inactive toggle (from tenant.is_active)
//   - Property filter (from tenant.property_name / assigned_property_name)
//   - Floor filter — derived from room_number first digit (e.g. room "101" = floor 1)
//   - Text search (name, phone, email)
//   - Exclusion: tenants who already have a doc for this template are hidden

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FileText, Eye, Save, X, ChevronLeft, ChevronRight,
  Clock, CheckCircle, AlertCircle, Search, User, Phone,
  Mail, Building2, Loader2, UserCheck, Printer, RefreshCw,
  LayoutTemplate, Tag, Hash, Shield, Zap, Check, IndianRupee,
  Download, Filter, Square, CheckSquare, Users, ListChecks,
  ArrowRight,
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

// ── Constants ──────────────────────────────────────────────────────────────────
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

const safeNum = (v: any) => { const n = parseFloat(String(v ?? "")); return isNaN(n) ? 0 : n; };
const money   = (v: any) => `₹${safeNum(v).toLocaleString("en-IN")}`;

const toInputDate = (d: string | undefined | null): string => {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  try { const dt = new Date(d); return isNaN(dt.getTime()) ? "" : dt.toISOString().split("T")[0]; }
  catch { return ""; }
};

const todayStr = () => new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });

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

// ── Derive floor from room number (first digit of numeric part) ────────────────
// "101" → 1, "201" → 2, "G01" → "G", "3" → 3
function getFloorFromRoom(roomNumber: string | null | undefined): string {
  if (!roomNumber) return "";
  const s = String(roomNumber).trim();
  // If first char is a letter (G, B etc), use it as floor label
  if (/^[a-zA-Z]/.test(s)) return s.charAt(0).toUpperCase();
  // Otherwise first digit
  const firstDigit = s.match(/\d/);
  return firstDigit ? firstDigit[0] : "";
}

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

// ── Bulk progress modal ───────────────────────────────────────────────────────
function BulkProgressModal({
  total, done, current, errors, onClose,
}: { total: number; done: number; current: string; errors: string[]; onClose: () => void }) {
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
  const finished = done >= total;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${finished ? "bg-green-100" : "bg-blue-100"}`}>
            {finished
              ? <CheckCircle className="h-5 w-5 text-green-600" />
              : <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{finished ? "Documents Created!" : "Creating Documents…"}</h2>
            <p className="text-[11px] text-gray-500">{finished ? `${done - errors.length} of ${total} succeeded` : current}</p>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>{done} of {total}</span>
            <span className="font-semibold text-blue-600">{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ${finished && errors.length === 0 ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width:`${pct}%` }} />
          </div>
        </div>
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 max-h-28 overflow-y-auto">
            <p className="text-[10px] font-bold text-red-700 mb-1">{errors.length} failed:</p>
            {errors.map((e, i) => <p key={i} className="text-[10px] text-red-600">• {e}</p>)}
          </div>
        )}
        {finished && (
          <button onClick={onClose}
            className="w-full h-8 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold">
            Done — Start Over
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export function DocumentCreate() {

  // ── Templates ──────────────────────────────────────────────────────────────
  const [templates,    setTemplates]    = useState<DocumentTemplate[]>([]);
  const [filteredTpls, setFilteredTpls] = useState<DocumentTemplate[]>([]);
  const [selTemplate,  setSelTemplate]  = useState<DocumentTemplate | null>(null);
  const [loadingTpls,  setLoadingTpls]  = useState(true);
  const [tplSearch,    setTplSearch]    = useState("");
  const [catFilter,    setCatFilter]    = useState("All");

  // ── Tenants ─────────────────────────────────────────────────────────────────
  const [tenantList,         setTenantList]         = useState<any[]>([]);
  const [loadingTenants,     setLoadingTenants]     = useState(false);
  const [excludedTenantIds,  setExcludedTenantIds]  = useState<Set<number>>(new Set());
  const [loadingExclusions,  setLoadingExclusions]  = useState(false);

  // ── Step 2 filters ──────────────────────────────────────────────────────────
  const [tenantSearch,    setTenantSearch]    = useState("");
  const [filterPropertyId, setFilterPropertyId] = useState<string>("all"); // property ID from listProperties
  const [filterFloor,     setFilterFloor]     = useState("all");
  const [filterStatus,    setFilterStatus]    = useState<"all"|"active"|"inactive">("active");

  // ── Property + floor data (loaded from API) ────────────────────────────────
  const [propertyList,    setPropertyList]    = useState<Array<{id:string;name:string}>>([]);
  // Map: propertyId -> array of floors (strings)
  const [propertyFloors,  setPropertyFloors]  = useState<Record<string, string[]>>({});
  // Map: propertyId -> Set of tenant IDs assigned in that property
  const [propTenantMap,   setPropTenantMap]   = useState<Record<string, Set<number>>>({});
  // Map: "propId:floor" -> Set of tenant IDs on that floor
  const [floorTenantMap,  setFloorTenantMap]  = useState<Record<string, Set<number>>>({});
  const [loadingPropData, setLoadingPropData] = useState(false);

  // ── Multi-select ────────────────────────────────────────────────────────────
  // tenantQueue: ordered list of tenants to create docs for
  const [tenantQueue,       setTenantQueue]       = useState<any[]>([]);
  const [queueIndex,        setQueueIndex]        = useState(0);   // which tenant we're on in Step 3
  // per-tenant formData: stored as array indexed by queue position
  const [queueFormData,     setQueueFormData]     = useState<Array<Record<string, string>>>([]);
  const [fetchingDetail,    setFetchingDetail]    = useState(false);

  // For single-tenant flow (backward compat): selTenant is queue[0]
  const selTenant = tenantQueue[0] || null;

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [step,        setStep]        = useState(1);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    total: number; done: number; current: string; errors: string[];
  } | null>(null);

  const [settings, setSettings] = useState({
    signatureRequired: false, priority: "normal",
    expiryDate: "", tags: [] as string[], notes: "",
  });
  const tagRef = useRef<HTMLInputElement>(null);

  // Current form data (for the tenant currently being edited in Step 3)
  const formData    = queueFormData[queueIndex] || {};
  const setFormData = (fn: (p: Record<string, string>) => Record<string, string>) => {
    setQueueFormData(prev => {
      const next = [...prev];
      next[queueIndex] = fn(next[queueIndex] || {});
      return next;
    });
  };

  const stats = useMemo(() => ({
    total:  templates.length,
    active: templates.filter(t => t.is_active).length,
    cats:   new Set(templates.map(t => t.category)).size,
  }), [templates]);

  // ── Derived filter lists (from API data) ─────────────────────────────────────
  // Property options come from listProperties API
  const propertyOptions = propertyList; // [{id, name}]

  // Floor options: from rooms of selected property (loaded via listRoomsByProperty)
  const floorOptions = useMemo(() => {
    if (filterPropertyId === "all") {
      // Show all unique floors across all properties
      const allFloors = new Set<string>();
      Object.values(propertyFloors).forEach(floors => floors.forEach(f => allFloors.add(f)));
      return Array.from(allFloors).sort();
    }
    return propertyFloors[filterPropertyId] || [];
  }, [propertyFloors, filterPropertyId]);

  // ── Filtered tenant list ─────────────────────────────────────────────────────
  const filteredTenantList = useMemo(() => {
    let list = [...tenantList];

    // 1. Exclude tenants who already have a doc for this template
    if (excludedTenantIds.size > 0) {
      list = list.filter(t => !excludedTenantIds.has(Number(t.id)));
    }

    // 2. Active/Inactive filter
    if (filterStatus === "active") {
      list = list.filter(t => t.is_active === true || t.is_active === 1);
    } else if (filterStatus === "inactive") {
      list = list.filter(t => t.is_active === false || t.is_active === 0);
    }

    // 3. Property filter — use propTenantMap built from bed_assignments
    if (filterPropertyId !== "all") {
      const allowed = propTenantMap[filterPropertyId];
      if (allowed) {
        list = list.filter(t => allowed.has(Number(t.id)));
      }
    }

    // 4. Floor filter — use floorTenantMap built from actual bed_assignments
    if (filterFloor !== "all") {
      if (filterPropertyId !== "all") {
        // Exact: property + floor combo
        const flKey = `${filterPropertyId}:${filterFloor}`;
        const allowed = floorTenantMap[flKey];
        if (allowed && allowed.size > 0) {
          list = list.filter(t => allowed.has(Number(t.id)));
        } else {
          // No bed_assignments data — fallback to room_number prefix
          list = list.filter(t => {
            const fl = getFloorFromRoom(t.room_number || t.assigned_room_number);
            return fl === filterFloor;
          });
        }
      } else {
        // No property selected — check across all properties
        // Collect all tenant IDs that are on this floor in any property
        const allowed = new Set<number>();
        Object.entries(floorTenantMap).forEach(([key, ids]) => {
          if (key.endsWith(":" + filterFloor)) {
            ids.forEach(id => allowed.add(id));
          }
        });
        if (allowed.size > 0) {
          list = list.filter(t => allowed.has(Number(t.id)));
        } else {
          // Fallback: room_number prefix
          list = list.filter(t => {
            const fl = getFloorFromRoom(t.room_number || t.assigned_room_number);
            return fl === filterFloor;
          });
        }
      }
    }

    // 5. Text search
    if (tenantSearch.trim()) {
      const s = tenantSearch.toLowerCase();
      list = list.filter(t =>
        (t.full_name || "").toLowerCase().includes(s) ||
        (t.phone     || "").toLowerCase().includes(s) ||
        (t.email     || "").toLowerCase().includes(s)
      );
    }

    return list;
  }, [tenantList, excludedTenantIds, filterStatus, filterPropertyId, filterFloor, tenantSearch, propTenantMap]);

  // ── Multi-select state ───────────────────────────────────────────────────────
  const [selectedTenantIds, setSelectedTenantIds] = useState<Set<number>>(new Set());
  const allSelected = filteredTenantList.length > 0 && selectedTenantIds.size === filteredTenantList.length;

  const toggleTenant = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTenantIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) setSelectedTenantIds(new Set());
    else setSelectedTenantIds(new Set(filteredTenantList.map((t: any) => Number(t.id))));
  };

  // ── Load templates ──────────────────────────────────────────────────────────
  const loadTemplates = useCallback(async () => {
    setLoadingTpls(true);
    try { const res = await listTemplates({ is_active:"true" }); setTemplates(res.data || []); }
    catch { toast.error("Failed to load templates"); }
    finally { setLoadingTpls(false); }
  }, []);
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  useEffect(() => {
    let list = [...templates];
    if (catFilter !== "All") list = list.filter(t => t.category === catFilter);
    if (tplSearch.trim()) {
      const s = tplSearch.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
    }
    setFilteredTpls(list);
  }, [templates, tplSearch, catFilter]);

  // ── tenantId → {propertyId, propertyName, floor, roomNumber} lookup ──────────
  // Built from floorTenantMap + propertyList after both loads complete
  const [tenantPropertyLookup, setTenantPropertyLookup] = useState<
    Record<number, { propertyId: string; propertyName: string; floor: string; roomNumber: string }>
  >({});

  // ── Load tenants ─────────────────────────────────────────────────────────────
  const doLoadTenants = useCallback(async () => {
    setLoadingTenants(true);
    try {
      const res = await listTenants({ pageSize: 500 });
      setTenantList(res.data || []);
    } catch { toast.error("Failed to load tenants"); }
    finally { setLoadingTenants(false); }
  }, []);

  // ── Load properties + their rooms/floors + tenant maps ──────────────────────
  // listProperties API: { success, data: { data: Property[], meta } }
  // listRoomsByProperty API: { success, message, data: RoomResponse[] }
  //   RoomResponse has: floor (number), room_number (string), bed_assignments[]
  //   BedAssignment has: tenant_id (any)
  const doLoadPropertyData = useCallback(async () => {
    setLoadingPropData(true);
    try {
      // ── Step 1: Fetch properties ─────────────────────────────────────────────
      const propRes = await listProperties({ is_active: true, pageSize: 200 });

      // Response shape: ApiResult<PropertyListResponse>
      // PropertyListResponse = { data: Property[], meta: {...} }
      // So propRes.data.data = Property[]
      let propArr: any[] = [];
      if (Array.isArray(propRes?.data?.data)) {
        propArr = propRes.data.data;               // standard shape
      } else if (Array.isArray(propRes?.data)) {
        propArr = propRes.data as any;             // fallback if unwrapped
      }

      const props: Array<{id:string;name:string}> = propArr
        .filter((p: any) => p.id && p.name)
        .map((p: any) => ({ id: String(p.id), name: String(p.name) }));

      setPropertyList(props);

      if (props.length === 0) return; // nothing to load

      // ── Step 2: For each property load rooms ─────────────────────────────────
      // listRoomsByProperty returns: ApiResult<RoomResponse[]>
      //   → roomsRes.data = RoomResponse[]
      //   RoomResponse.floor = number (the DB floor field — e.g. 1, 2, 3)
      //   RoomResponse.bed_assignments = BedAssignment[]
      //   BedAssignment.tenant_id = number | null
      const floorsMap: Record<string, string[]>    = {};
      const tenantMap: Record<string, Set<number>> = {};
      const floorTenantMapTemp: Record<string, Set<number>> = {};

      // ── Single pass: load rooms for all properties ────────────────────────────
      const lookup: Record<number, {propertyId:string;propertyName:string;floor:string;roomNumber:string}> = {};

      await Promise.all(
        props.map(async (prop) => {
          floorsMap[prop.id] = [];
          tenantMap[prop.id] = new Set<number>();
          try {
            const roomsRes = await listRoomsByProperty(parseInt(prop.id));
            const rooms: any[] = Array.isArray(roomsRes?.data) ? roomsRes.data : [];
            const floorsSet = new Set<number>();
            const tIds      = new Set<number>();

            rooms.forEach((room: any) => {
              const fl    = room.floor;
              const flNum = (fl !== null && fl !== undefined && fl !== "" && !isNaN(Number(fl))) ? Number(fl) : null;
              if (flNum !== null) floorsSet.add(flNum);
              const flStr   = flNum !== null ? String(flNum) : "";
              const roomNum = String(room.room_number || "");
              const flKey   = prop.id + ":" + flStr;

              const beds: any[] = Array.isArray(room.bed_assignments) ? room.bed_assignments : [];
              beds.forEach((b: any) => {
                if (b.tenant_id == null) return;
                const numTid = Number(b.tenant_id);
                tIds.add(numTid);
                if (flStr) {
                  if (!floorTenantMapTemp[flKey]) floorTenantMapTemp[flKey] = new Set<number>();
                  floorTenantMapTemp[flKey].add(numTid);
                }
                if (!lookup[numTid]) {
                  lookup[numTid] = { propertyId: prop.id, propertyName: prop.name, floor: flStr, roomNumber: roomNum };
                }
              });
            });

            floorsMap[prop.id] = Array.from(floorsSet).sort((a, b) => a - b).map(String);
            tenantMap[prop.id] = tIds;
          } catch (err) {
            console.warn("Failed to load rooms for property " + prop.id, err);
          }
        })
      );

      setPropertyFloors(floorsMap);
      setPropTenantMap(tenantMap);
      setFloorTenantMap(floorTenantMapTemp);
      setTenantPropertyLookup(lookup);
    } catch (e) {
      console.error("doLoadPropertyData failed:", e);
    } finally {
      setLoadingPropData(false);
    }
  }, []);

  useEffect(() => {
    if (step === 2) {
      doLoadTenants();
      doLoadPropertyData();
      setSelectedTenantIds(new Set());
      setTenantSearch(""); setFilterPropertyId("all"); setFilterFloor("all");
      setFilterStatus("active");
    }
  }, [step, doLoadTenants, doLoadPropertyData]);

  // ── Exclusion list ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selTemplate) { setExcludedTenantIds(new Set()); return; }
    setLoadingExclusions(true);
    getTenantsWithDocumentForTemplate(selTemplate.id)
      .then(res => { setExcludedTenantIds(new Set<number>((res?.data || []).map((r: any) => Number(r.tenant_id)))); })
      .catch(() => setExcludedTenantIds(new Set()))
      .finally(() => setLoadingExclusions(false));
  }, [selTemplate]);

  // ── Fetch full tenant data for one tenant ───────────────────────────────────
  const fetchTenantFormData = async (t: any): Promise<Record<string, string>> => {
    const base: Record<string, string> = {
      date: todayStr(), document_type: selTemplate!.category,
      tenant_name: t.full_name || "", tenant_phone: t.phone || "", tenant_email: t.email || "",
    };
    (selTemplate!.variables || []).forEach(v => { if (!(v in base)) base[v] = ""; });

    try {
      const res = await tenantDetailsApi.getProfileById(String(t.id));
      const d   = res?.data;
      if (!d) return base;

      let secDeposit = 0;
      if (d.property_id) {
        try {
          const propRes = await getProperty(String(d.property_id));
          if (propRes?.success && propRes?.data) secDeposit = safeNum(propRes.data.security_deposit);
        } catch {}
      }

      const mapped: Record<string, string> = {
        date: todayStr(), document_type: selTemplate!.category,
        tenant_name:            d.full_name               || t.full_name || "",
        tenant_phone:           d.phone                   || t.phone     || "",
        tenant_email:           d.email                   || t.email     || "",
        aadhaar_number:         "",
        pan_number:             "",
        emergency_contact_name: d.emergency_contact_name  || "",
        emergency_phone:        d.emergency_contact_phone || "",
        property_name:          d.property_name           || "",
        room_number:            d.room_number             || "",
        bed_number:             d.bed_number != null      ? String(d.bed_number) : "",
        move_in_date:           toInputDate(d.check_in_date) || toInputDate(d.move_in_date) || "",
        rent_amount:            d.monthly_rent != null    ? String(safeNum(d.monthly_rent))
                                : d.rent_per_bed != null  ? String(safeNum(d.rent_per_bed)) : "",
        security_deposit:       secDeposit > 0            ? String(secDeposit) : "",
        payment_mode:           "UPI / Bank Transfer",
        company_name:           "",
        company_address:        "",
      };
      (selTemplate!.variables || []).forEach(v => { if (!(v in mapped)) mapped[v] = ""; });
      return mapped;
    } catch {
      return base;
    }
  };

  // ── Step 1: select template ──────────────────────────────────────────────────
  const handleTemplateSelect = async (tpl: DocumentTemplate) => {
    let full = tpl;
    if (!tpl.html_content) {
      try { const r = await getTemplate(tpl.id); full = r.data || tpl; } catch {}
    }
    setSelTemplate(full);
    setStep(2);
  };

  // ── Step 2 → Step 3: build queue and fetch first tenant's data ──────────────
  // Called when user clicks a tenant card (single) OR clicks "Proceed" with multi-select
  const proceedToFillDetails = async (tenants: any[]) => {
    if (!tenants.length) return;
    setFetchingDetail(true);
    try {
      // Build queue
      setTenantQueue(tenants);
      setQueueIndex(0);

      // Pre-fill first tenant's data
      const firstData = await fetchTenantFormData(tenants[0]);
      const initialQueue = tenants.map(() => ({} as Record<string, string>));
      initialQueue[0] = firstData;
      setQueueFormData(initialQueue);

      toast.success(`✅ Auto-filled for ${tenants[0].full_name}`);
      setStep(3);
    } catch {
      toast.info("Basic info filled — some fields may need manual entry");
      const fd: Record<string, string> = {
        date: todayStr(), document_type: selTemplate!.category,
        tenant_name: tenants[0].full_name || "", tenant_phone: tenants[0].phone || "",
      };
      (selTemplate!.variables || []).forEach(v => { if (!(v in fd)) fd[v] = ""; });
      setTenantQueue(tenants);
      setQueueIndex(0);
      setQueueFormData(tenants.map((_, i) => i === 0 ? fd : {}));
      setStep(3);
    } finally {
      setFetchingDetail(false);
    }
  };

  // Single tenant click (no multi-select needed)
  const handleSingleTenantSelect = async (t: any) => {
    setSelectedTenantIds(new Set());
    await proceedToFillDetails([t]);
  };

  // Multi proceed
  const handleMultiProceed = async () => {
    const tenants = filteredTenantList.filter((t: any) => selectedTenantIds.has(Number(t.id)));
    if (!tenants.length) return;
    await proceedToFillDetails(tenants);
  };

  const skipTenant = () => {
    setTenantQueue([]);
    setQueueIndex(0);
    setQueueFormData([]);
    setSelectedTenantIds(new Set());
    const empty: Record<string, string> = { date: todayStr(), document_type: selTemplate!.category };
    (selTemplate!.variables || []).forEach(v => { if (!(v in empty)) empty[v] = ""; });
    setTenantQueue([{ id: null, full_name: "" }]);
    setQueueFormData([empty]);
    setStep(3);
  };

  // ── Step 3: navigate between tenants ────────────────────────────────────────
  // "Next" in step 3: if more tenants, fetch next one's data; else go to step 4
  const handleStep3Next = async () => {
    // Validate current
    const cur = queueFormData[queueIndex] || {};
    if (!cur.tenant_name?.trim())  { toast.error("Tenant Name required");  return; }
    if (!cur.tenant_phone?.trim()) { toast.error("Tenant Phone required"); return; }

    if (queueIndex < tenantQueue.length - 1) {
      // Move to next tenant
      const nextIdx = queueIndex + 1;
      setQueueIndex(nextIdx);

      // Fetch data for next tenant if not yet fetched
      if (!queueFormData[nextIdx] || Object.keys(queueFormData[nextIdx]).length === 0) {
        setFetchingDetail(true);
        try {
          const data = await fetchTenantFormData(tenantQueue[nextIdx]);
          setQueueFormData(prev => {
            const next = [...prev];
            next[nextIdx] = data;
            return next;
          });
          toast.success(`✅ Auto-filled for ${tenantQueue[nextIdx].full_name}`);
        } catch {
          const fd: Record<string, string> = { date: todayStr(), document_type: selTemplate!.category };
          (selTemplate!.variables || []).forEach(v => { if (!(v in fd)) fd[v] = ""; });
          setQueueFormData(prev => { const n = [...prev]; n[nextIdx] = fd; return n; });
        } finally {
          setFetchingDetail(false);
        }
      }
    } else {
      // All tenants done — go to settings
      setStep(4);
    }
  };

  const handleStep3Back = () => {
    if (queueIndex > 0) {
      setQueueIndex(queueIndex - 1);
    } else {
      setStep(2);
    }
  };

  // ── Preview ─────────────────────────────────────────────────────────────────
  const generatePreview = () => {
    if (!selTemplate?.html_content) return;
    const logo = selTemplate.logo_url
      ? (selTemplate.logo_url.startsWith("http") ? selTemplate.logo_url : `${API_BASE}${selTemplate.logo_url}`)
      : "";
    const now = new Date();
    const previewNum = "DOC-" + now.getFullYear() + String(now.getMonth()+1).padStart(2,"0") + "-"
      + String(Math.floor(Math.random()*999)+1).padStart(6,"0");
    setPreviewHtml(renderHtml(selTemplate.html_content, { ...formData, document_number: previewNum }, logo));
    setShowPreview(true);
  };

  const handlePrint = () => {
    const w = window.open("","_blank");
    if (w) { w.document.write(`<html><head><title>Doc</title></head><body>${previewHtml}</body></html>`); w.document.close(); w.focus(); w.print(); }
  };

  const handleDownload = () => {
    if (!previewHtml) { toast.error("Open Preview first"); return; }
    const pw = window.open("","_blank","width=900,height=700");
    if (!pw) { toast.error("Popup blocked"); return; }
    pw.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Doc</title>
<style>*{box-sizing:border-box;}body{margin:0;padding:0;}@media print{@page{size:A4;margin:10mm;}}</style></head>
<body>${previewHtml}<script>window.onload=function(){setTimeout(function(){window.print();window.onafterprint=function(){window.close();};},400);};<\/script></body></html>`);
    pw.document.close();
  };

  // ── Save one document ───────────────────────────────────────────────────────
  const saveOneDoc = async (tenant: any, data: Record<string, string>, token: string | null) => {
    const logo = selTemplate!.logo_url
      ? (selTemplate!.logo_url.startsWith("http") ? selTemplate!.logo_url : `${API_BASE}${selTemplate!.logo_url}`)
      : "";
    const payload = {
      template_id:        selTemplate!.id,
      document_name:      selTemplate!.name,
      tenant_id:          tenant?.id     || null,
      tenant_name:        data.tenant_name  || "",
      tenant_phone:       data.tenant_phone || "",
      tenant_email:       data.tenant_email || null,
      property_name:      data.property_name || null,
      room_number:        data.room_number   || null,
      html_content:       renderHtml(selTemplate!.html_content, data, logo),
      data_json:          data,
      status:             "Created",
      created_by:         "Admin",
      signature_required: settings.signatureRequired,
      priority:           settings.priority,
      expiry_date:        settings.expiryDate || null,
      tags:               settings.tags,
      notes:              settings.notes     || null,
    };
    const res = await fetch(`${API_BASE}/api/documents`, {
      method: "POST",
      headers: { "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed");
    return json;
  };

  // ── Step 4: Save all documents ───────────────────────────────────────────────
  const handleSaveAll = async () => {
    // Validate all forms
    for (let i = 0; i < queueFormData.length; i++) {
      const d = queueFormData[i] || {};
      if (!d.tenant_name?.trim())  { toast.error(`Tenant ${i+1}: Name required`);  return; }
      if (!d.tenant_phone?.trim()) { toast.error(`Tenant ${i+1}: Phone required`); return; }
    }

    const token = localStorage.getItem("admin_token");

    if (tenantQueue.length === 1) {
      // Single — simple save
      setSaving(true);
      try {
        const data = await saveOneDoc(tenantQueue[0], queueFormData[0] || {}, token);
        toast.success(`✅ Document created! No: ${data.data?.document_number || "N/A"}`);
        resetAll();
      } catch (e: any) { toast.error(e.message || "Failed"); }
      finally { setSaving(false); }
    } else {
      // Bulk — show progress modal
      setBulkProgress({ total: tenantQueue.length, done: 0, current: "Starting…", errors: [] });
      let done = 0;
      const errors: string[] = [];

      for (let i = 0; i < tenantQueue.length; i++) {
        const t = tenantQueue[i];
        const d = queueFormData[i] || {};
        setBulkProgress(p => ({ ...p!, current: `Creating for ${t.full_name || `Tenant ${i+1}`}…` }));
        try {
          await saveOneDoc(t, d, token);
        } catch (e: any) {
          errors.push(`${t.full_name || `Tenant ${i+1}`}: ${e.message || "Failed"}`);
        }
        done++;
        setBulkProgress({ total: tenantQueue.length, done, current: `${done}/${tenantQueue.length} done`, errors: [...errors] });
      }
    }
  };

  const resetAll = () => {
    setStep(1); setSelTemplate(null);
    setTenantQueue([]); setQueueIndex(0); setQueueFormData([]);
    setSelectedTenantIds(new Set());
    setBulkProgress(null);
    setSettings({ signatureRequired:false, priority:"normal", expiryDate:"", tags:[], notes:"" });
  };

  const addTag    = (v: string) => { if (v.trim() && !settings.tags.includes(v.trim())) setSettings(p => ({ ...p, tags:[...p.tags, v.trim()] })); };
  const removeTag = (v: string) => setSettings(p => ({ ...p, tags:p.tags.filter(t => t !== v) }));

  const visibleVars = useMemo(() =>
    (selTemplate?.variables || []).filter(v => !HIDDEN_VARS.includes(v)),
    [selTemplate]);

  const isMulti      = tenantQueue.length > 1;
  const currentTenant = tenantQueue[queueIndex] || null;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-full">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-16 z-10 pb-2">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            {selTemplate && (
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm min-w-0 text-[11px]">
                <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-blue-700 truncate max-w-[120px]">{selTemplate.name}</span>
              </div>
            )}
            {isMulti && step >= 3 && (
              <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1.5 shadow-sm text-[11px]">
                <Users className="h-3 w-3 text-indigo-500 flex-shrink-0" />
                <span className="font-semibold text-indigo-700">
                  {queueIndex + 1} / {tenantQueue.length} tenants
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={loadTemplates} disabled={loadingTpls}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 shadow-sm">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingTpls ? "animate-spin":""}`} />
            </button>
            {step > 1 && (
              <button onClick={resetAll}
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

        {/* Step indicators */}
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm overflow-x-auto">
          {["Select Template","Select Tenant(s)","Fill Details","Settings & Save"].map((label, i) => (
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

      {/* ══ STEP 2: Select Tenant(s) ══ */}
      {step === 2 && selTemplate && (
        <Card className="border rounded-lg shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg flex-wrap gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-green-600" />Select Tenant(s)
              </span>
              {filteredTenantList.length > 0 && (
                <button onClick={toggleSelectAll}
                  className={`inline-flex items-center gap-1 h-6 px-2 rounded-md border text-[10px] font-semibold transition-all
                    ${allSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"}`}>
                  {allSelected
                    ? <><CheckSquare className="h-3 w-3" />All ({filteredTenantList.length})</>
                    : <><Square className="h-3 w-3" />Select All</>
                  }
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(fetchingDetail || loadingExclusions) && (
                <div className="flex items-center gap-1 text-[11px] text-blue-600">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {loadingExclusions ? "Checking docs…" : "Fetching…"}
                </div>
              )}
              <button onClick={skipTenant} className="h-7 px-2.5 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">Skip →</button>
            </div>
          </div>

          {/* ── Filter row ── */}
       <div className="px-3 py-2 border-b bg-gray-50/50">
  
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">

    {/* 🔍 Search (50%) */}
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
      <Input
        placeholder="Search name, phone, email…"
        value={tenantSearch}
        onChange={e => setTenantSearch(e.target.value)}
        className="h-8 pl-8 text-[11px] bg-white border-gray-200 w-full"
      />
    </div>

    {/* 🎯 Filters (50%) */}
   <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-hide">

  {/* Status */}
  <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-white flex-shrink-0">
    {(["all","active","inactive"] as const).map(s => (
      <button
        key={s}
        onClick={() => setFilterStatus(s)}
        className={`h-8 px-2.5 text-[10px] font-semibold transition-colors
          ${filterStatus === s ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
      >
        {s === "all" ? "All" : s === "active" ? "Active" : "Inactive"}
      </button>
    ))}
  </div>

  {/* Property */}
  <Select
    value={filterPropertyId}
    onValueChange={v => {
      setFilterPropertyId(v);
      setFilterFloor("all");
    }}
  >
    <SelectTrigger className="h-8 w-[130px] text-[11px] bg-white border-gray-200 flex-shrink-0">
      <SelectValue placeholder="All Properties" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all" className={SI}>All Properties</SelectItem>
      {propertyOptions.map(p => (
        <SelectItem key={p.id} value={p.id} className={SI}>
          {p.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Floor */}
  <Select value={filterFloor} onValueChange={setFilterFloor}>
    <SelectTrigger className="h-8 w-[90px] text-[11px] bg-white border-gray-200 flex-shrink-0">
      <SelectValue placeholder="Floor" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all" className={SI}>All Floors</SelectItem>
      {floorOptions.map(f => (
        <SelectItem key={f} value={f} className={SI}>
          Floor {f}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>

  {/* Clear */}
  {(filterPropertyId !== "all" ||
    filterFloor !== "all" ||
    filterStatus !== "active" ||
    tenantSearch) && (
    <button
      onClick={() => {
        setFilterPropertyId("all");
        setFilterFloor("all");
        setFilterStatus("active");
        setTenantSearch("");
      }}
      className="h-8 px-2 rounded-lg border border-gray-200 bg-white text-[10px] font-medium text-gray-500 hover:bg-gray-50 flex-shrink-0"
    >
      <X className="h-3 w-3 inline mr-0.5" />
      Clear
    </button>
  )}

</div>

  </div>
</div>

          {/* Status / exclusion bar */}
          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2 text-[10px]">
            <span className="text-gray-500 flex items-center gap-1.5">
              {loadingPropData && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
              Showing <span className="font-semibold text-gray-700">{filteredTenantList.length}</span> of {tenantList.length} tenants
              {excludedTenantIds.size > 0 && <span className="text-orange-500 ml-1">({excludedTenantIds.size} already have this doc — hidden)</span>}
            </span>
            {selectedTenantIds.size > 0 && (
              <span className="text-indigo-600 font-semibold">{selectedTenantIds.size} selected</span>
            )}
          </div>

          {/* Multi-select action bar */}
          {selectedTenantIds.size > 0 && (
            <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-indigo-700">
                  {selectedTenantIds.size} selected — fill details for each one by one
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setSelectedTenantIds(new Set())}
                  className="h-7 px-2 rounded-md border border-indigo-200 bg-white text-[10px] font-medium text-indigo-600 hover:bg-indigo-50">
                  Clear
                </button>
                <button onClick={handleMultiProceed} disabled={fetchingDetail}
                  className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold disabled:opacity-50">
                  {fetchingDetail ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                  Fill Details for {selectedTenantIds.size} →
                </button>
              </div>
            </div>
          )}

          {/* Tenant grid */}
          <div className="p-3" style={{ maxHeight:"calc(100vh - 440px)", overflowY:"auto" }}>
            {loadingTenants ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>
            ) : filteredTenantList.length === 0 ? (
              <div className="text-center py-10">
                <User className="h-9 w-9 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500">
                  {excludedTenantIds.size > 0 ? "All tenants already have this document" : "No tenants found"}
                </p>
                <button onClick={() => { setFilterPropertyId("all"); setFilterFloor("all"); setFilterStatus("all"); setTenantSearch(""); }}
                  className="mt-2 text-[11px] text-blue-600 underline">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-1.5">
                {filteredTenantList.map((t: any) => {
                  const tid     = Number(t.id);
                  const checked = selectedTenantIds.has(tid);
                  const isActive = t.is_active === true || t.is_active === 1;
                  // Use lookup data (from rooms API) for accurate property/floor/room
                  const lk           = tenantPropertyLookup[tid];
                  const displayProp  = lk?.propertyName  || t.property_name || t.assigned_property_name || "";
                  const displayRoom  = lk?.roomNumber     || t.room_number   || t.assigned_room_number   || "";
                  const displayFloor = lk?.floor          || getFloorFromRoom(displayRoom);
                  return (
                    <div key={t.id}
                      className={`relative rounded-lg border-2 transition-all group
                        ${checked
                          ? "border-indigo-500 bg-indigo-50/60 shadow-sm"
                          : "border-gray-200 bg-white hover:border-green-400 hover:shadow-md"}`}>
                      {/* Checkbox */}
                      <button onClick={e => toggleTenant(tid, e)}
                        className="absolute top-1.5 left-1.5 z-10 p-0"
                        title={checked ? "Deselect" : "Add to selection"}>
                        {checked
                          ? <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
                          : <Square className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500" />
                        }
                      </button>
                      {/* Inactive badge */}
                      {!isActive && (
                        <span className="absolute top-2 right-2 text-[8px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold">Inactive</span>
                      )}
                      {/* Card body — single click */}
                      <button onClick={() => !fetchingDetail && handleSingleTenantSelect(t)}
                        disabled={fetchingDetail}
                        className="w-full text-left p-2 pl-7 disabled:opacity-60"
                        title="Click to create document for this tenant only">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-[11px]
                            ${isActive ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gray-400"}`}>
                            {(t.full_name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-[10px] font-black truncate leading-tight ${checked ? "text-indigo-700" : "text-gray-800 group-hover:text-green-700"}`}>
                              {t.full_name}
                            </p>
                            {displayProp && (
                              <p className="text-[8px] text-gray-400 flex items-center gap-0.5 truncate leading-tight">
                                <Building2 className="h-2 w-2 flex-shrink-0" />
                                {displayProp}
                              </p>
                            )}
                          </div>
                          {displayRoom && (
                            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                              <Badge className={`text-[8px] px-1 py-0 leading-tight ${checked ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                                R{displayRoom}
                              </Badge>
                              {displayFloor && (
                                <span className="text-[8px] text-gray-400">F{displayFloor}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="space-y-0.5 mt-1">
                          {t.phone && <p className="text-[9px] text-gray-500 flex items-center gap-0.5"><Phone className="h-2 w-2 text-gray-400 flex-shrink-0" />{t.phone}</p>}
                          {t.email && <p className="text-[9px] text-gray-400 flex items-center gap-0.5 truncate hidden sm:flex"><Mail className="h-2 w-2 text-gray-400 flex-shrink-0" />{t.email}</p>}
                          {(t.monthly_rent || t.rent_per_bed) && (
                            <p className="text-[9px] text-green-600 flex items-center gap-0.5 font-medium">
                              <IndianRupee className="h-2 w-2 text-green-500 flex-shrink-0" />{money(t.monthly_rent || t.rent_per_bed)}/mo
                            </p>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
            <button onClick={() => { setStep(1); setSelTemplate(null); }}
              className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
              <ChevronLeft className="h-3 w-3" />Back
            </button>
            <p className="text-[10px] text-gray-400 hidden sm:block">
              Click card = single · Checkbox + button = multiple (step-by-step)
            </p>
          </div>
        </Card>
      )}

      {/* ══ STEP 3: Fill Details (one tenant at a time) ══ */}
      {step === 3 && selTemplate && (
        <Card className="border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg flex-wrap gap-1">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-600" />Document Details
              {isMulti && (
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 border border-indigo-200 rounded-md px-1.5 py-0.5">
                  {queueIndex + 1} / {tenantQueue.length}
                </span>
              )}
            </span>
            {currentTenant?.id && (
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-md px-2 py-1">
                <UserCheck className="h-3 w-3 text-green-600" />
                <span className="text-[10px] font-semibold text-green-700">{currentTenant.full_name}</span>
                {fetchingDetail && <Loader2 className="h-3 w-3 animate-spin text-blue-500 ml-1" />}
              </div>
            )}

             {/* Multi-tenant progress dots */}
          {isMulti && (
            <div className="px-3 py-2 border-b bg-gray-50/70 flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">Tenants:</span>
              {tenantQueue.map((t, i) => {
                const isCurrentIdx = i === queueIndex;
                const isDoneIdx    = i < queueIndex;
                const hasData      = queueFormData[i] && Object.keys(queueFormData[i]).length > 0;
                return (
                  <div key={i} className="flex items-center gap-0.5 flex-shrink-0">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-all
                      ${isCurrentIdx ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : isDoneIdx  ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-500 border-gray-200"}`}>
                      {isDoneIdx ? <Check className="h-2.5 w-2.5" /> : <span className="text-[9px]">{i+1}</span>}
                      <span className="max-w-[60px] truncate">{t.full_name?.split(" ")[0] || `T${i+1}`}</span>
                    </div>
                    {i < tenantQueue.length - 1 && <ArrowRight className="h-3 w-3 text-gray-300" />}
                  </div>
                );
              })}
            </div>
          )}
          </div>

         

          <div className="p-3" style={{ maxHeight:"calc(100vh - 350px)", overflowY:"auto" }}>
            {GROUP_SYSTEM.some(v => visibleVars.includes(v)) && (
              <div className="mb-4">
                <SH icon={<FileText className="h-3 w-3" />} title="Document Info" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
                  {GROUP_SYSTEM.filter(v => visibleVars.includes(v)).map(v => (
                    <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
                  ))}
                </div>
              </div>
            )}
            {GROUP_TENANT.some(v => visibleVars.includes(v)) && (
              <div className="mb-4">
                <SH icon={<User className="h-3 w-3" />} title="Tenant Information" color="text-green-600" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
                    {rest.map(v => <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />)}
                  </div>
                </div>
              );
            })()}
            {currentTenant?.id && (
              <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700">
                  Fields in <span className="font-bold text-green-600">green</span> are auto-filled from tenant's profile.
                  {isMulti && " Each tenant's details are filled separately."}
                </p>
              </div>
            )}
          </div>

          <div className="px-3 py-2.5 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
            <button onClick={handleStep3Back}
              className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
              <ChevronLeft className="h-3 w-3" />
              {queueIndex > 0 ? `Back to ${tenantQueue[queueIndex-1]?.full_name?.split(" ")[0] || "Previous"}` : "Back"}
            </button>
            <div className="flex gap-2">
              <button onClick={generatePreview}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md">
                <Eye className="h-3.5 w-3.5" />Preview
              </button>
              <button onClick={handleStep3Next} disabled={fetchingDetail}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:shadow-md disabled:opacity-60">
                {fetchingDetail
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading…</>
                  : queueIndex < tenantQueue.length - 1
                  ? <>Next: {tenantQueue[queueIndex+1]?.full_name?.split(" ")[0] || "Next"} <ChevronRight className="h-3.5 w-3.5" /></>
                  : <>Settings <ChevronRight className="h-3.5 w-3.5" /></>
                }
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ══ STEP 4: Settings & Save ══ */}
      {step === 4 && selTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <Card className="border rounded-lg shadow-sm">
              <div className="px-3 py-2 border-b bg-white rounded-t-lg flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-blue-600" />Document Options
                </span>
                {isMulti && (
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md px-2 py-0.5">
                    Applied to all {tenantQueue.length} documents
                  </span>
                )}
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
                  {settings.expiryDate && <p className="text-[9px] text-orange-500 mt-0.5">Won't show after this date</p>}
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
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {isMulti ? `Bulk Summary (${tenantQueue.length} docs)` : "Document Summary"}
                </span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] text-gray-400 font-semibold">Template</span>
                  <span className="text-[10px] font-bold text-blue-700 text-right truncate max-w-[140px]">{selTemplate.name}</span>
                </div>
                {isMulti ? (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] text-gray-400 font-semibold">Tenants</span>
                      <span className="text-[10px] font-bold text-indigo-700">{tenantQueue.length} documents</span>
                    </div>
                    <div className="border-t pt-2 max-h-28 overflow-y-auto space-y-1">
                      {tenantQueue.map((t, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                          <p className="text-[10px] text-gray-700 truncate">{t.full_name}</p>
                          <button onClick={() => { setQueueIndex(i); setStep(3); }}
                            className="ml-auto text-[9px] text-blue-500 hover:underline flex-shrink-0">edit</button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  [
                    ["Tenant",   formData.tenant_name    || "—", "text-gray-800"],
                    ["Phone",    formData.tenant_phone   || "—", "text-gray-600"],
                    ["Property", formData.property_name  || "—", "text-gray-600"],
                    ["Room",     formData.room_number    || "—", "text-gray-600"],
                    ["Move-In",  formData.move_in_date   || "—", "text-gray-600"],
                    ["Rent",     formData.rent_amount    ? money(formData.rent_amount) : "—", "text-green-700"],
                    ["Deposit",  formData.security_deposit ? money(formData.security_deposit) : "—", "text-green-700"],
                  ].map(([k,v,cls]) => (
                    <div key={k} className="flex items-start justify-between gap-2">
                      <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">{k}</span>
                      <span className={`text-[10px] font-bold text-right truncate max-w-[140px] ${cls}`}>{v}</span>
                    </div>
                  ))
                )}
                {[
                  ["Priority",  settings.priority.toUpperCase(), "text-orange-600"],
                  ["Signature", settings.signatureRequired ? "Required":"Not Required", settings.signatureRequired ? "text-blue-600":"text-gray-500"],
                  ["Expires",   settings.expiryDate || "No expiry", settings.expiryDate ? "text-orange-600":"text-gray-400"],
                ].map(([k,v,cls]) => (
                  <div key={k} className="flex items-start justify-between gap-2">
                    <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">{k}</span>
                    <span className={`text-[10px] font-bold text-right truncate max-w-[140px] ${cls}`}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-2">
              {!isMulti && (
                <button onClick={generatePreview}
                  className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md transition-all">
                  <Eye className="h-3.5 w-3.5" />Preview Document
                </button>
              )}
              <button onClick={handleSaveAll} disabled={saving}
                className={`w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-white text-[11px] font-semibold hover:shadow-md transition-all disabled:opacity-50
                  ${isMulti ? "bg-gradient-to-r from-indigo-600 to-purple-600" : "bg-gradient-to-r from-green-600 to-emerald-600"}`}>
                {saving
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
                  : isMulti
                  ? <><Users className="h-3.5 w-3.5" />Create {tenantQueue.length} Documents</>
                  : <><Save className="h-3.5 w-3.5" />Create Document</>
                }
              </button>
              <button onClick={() => { setQueueIndex(tenantQueue.length - 1); setStep(3); }}
                className="w-full inline-flex items-center justify-center gap-1 h-7 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
                <ChevronLeft className="h-3 w-3" />{isMulti ? "Back to Last Tenant" : "Back to Details"}
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
                <span className="text-sm font-semibold text-white">
                  Preview — {currentTenant?.full_name || "Document"}
                </span>
                {isMulti && <Badge className="bg-white/20 text-white border-0 text-[10px]">{queueIndex+1}/{tenantQueue.length}</Badge>}
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Download className="h-4 w-4" /></button>
                <button onClick={handlePrint}    className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Printer className="h-4 w-4" /></button>
                <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
              <div className="bg-white rounded-lg shadow-md max-w-[210mm] mx-auto">
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
            <div className="flex-shrink-0 px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
              <button onClick={handleDownload} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold">
                <Download className="h-3.5 w-3.5" />Download
              </button>
              <button onClick={handlePrint} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold">
                <Printer className="h-3.5 w-3.5" />Print
              </button>
              <button onClick={() => setShowPreview(false)} className="h-8 px-3 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ BULK PROGRESS MODAL ══ */}
      {bulkProgress && (
        <BulkProgressModal
          total={bulkProgress.total}
          done={bulkProgress.done}
          current={bulkProgress.current}
          errors={bulkProgress.errors}
          onClose={resetAll}
        />
      )}
    </div>
  );
}