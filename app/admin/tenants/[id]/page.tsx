"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTenantById,
  type Tenant,
  viewDocument,
  getTenantAssignment,
  getTenantPayments,
  getTenantPaymentFormData,
} from "@/lib/tenantApi";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Home, User, Briefcase,
  FileText, CreditCard, Shield, Download, Camera, Award, Heart,
  Clock, AlertCircle, Loader2, Eye, Bed, IndianRupee, FileCheck,
  FileWarning, CalendarDays, RotateCcw, ChevronDown, ChevronUp,
  ReceiptIndianRupee, TrendingUp, Building, CheckCircle, Sparkles,
  IdCard, GraduationCap, Wallet, ExternalLink, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getSettings, type SettingsData } from "@/lib/settingsApi";
import * as paymentApi from "@/lib/paymentRecordApi";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptId, setReceiptId] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const tid = params.id as string;

  useEffect(() => { if (tid) { loadTenant(); loadAssignment(); } }, [tid]);
  useEffect(() => { if (activeTab === "payments" && tid) loadPayments(); }, [activeTab, tid]);

  const loadTenant = async () => {
    try {
      setLoading(true);
      const r = await getTenantById(tid);
      r?.success && r.data ? setTenant(r.data) : setError("Failed to load tenant details");
    } catch { setError("An error occurred while fetching tenant details"); }
    finally { setLoading(false); }
  };
  const loadAssignment = async () => {
    try { const r = await getTenantAssignment(tid); r.success && r.data && setAssignment(r.data); } catch { }
  };
  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const pr = await getTenantPayments(tid); if (pr.success) setPayments(pr.data || []);
      const sr = await getTenantPaymentFormData(tid); if (sr.success && sr.data) setPaymentSummary(sr.data);
    } catch { } finally { setLoadingPayments(false); }
  };

  const viewDoc = (url: string) => { if (!url) { toast.error("Document not available"); return; } viewDocument(url); };
  const toggleMonth = (k: string) => setExpandedMonths(p => p.includes(k) ? p.filter(m => m !== k) : [...p, k]);
  const openReceipt = (id: number) => { setReceiptId(id); setReceiptOpen(true); };
  const dlReceipt = (id: number) => window.open(`/api/payments/receipts/${id}/download`, "_blank");
  
  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    await navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast.success("Email copied to clipboard");
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
      toast.success("Phone number copied to clipboard");
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error || !tenant) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 max-w-md text-center shadow-xl">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <AlertCircle className="w-6 h-6 text-white" />
        </div>
        <p className="font-lexend text-lg font-semibold text-slate-900 mb-2">Tenant Not Found</p>
        <p className="text-sm text-slate-600 mb-6">
          {error || "The tenant you're looking for doesn't exist or has been removed."}
        </p>
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    </div>
  );

  const roomVal = assignment
    ? `Room ${assignment.room?.room_number || "—"} · Bed ${assignment.bed_number || "—"}`
    : tenant.assigned_room_number ? `Room ${tenant.assigned_room_number}` : "Not Assigned";
  const rentVal = assignment?.tenant_rent
    ? `₹${Number(assignment.tenant_rent).toLocaleString()}`
    : tenant.payments?.[0]?.amount ? `₹${tenant.payments[0].amount.toLocaleString()}` : "N/A";

  const stats = [
    { icon: <CalendarDays className="w-4 h-4" />, label: "Member Since", value: tenant.created_at ? new Date(tenant.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A", gradient: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-600" },
    { icon: <Building className="w-4 h-4" />, label: "Property", value: assignment?.property?.name || tenant.assigned_property_name || "Not Assigned", gradient: "from-purple-500 to-purple-600", bg: "bg-purple-50", text: "text-purple-600" },
    { icon: <Bed className="w-4 h-4" />, label: "Room / Bed", value: roomVal, gradient: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", text: "text-emerald-600" },
    { icon: <IndianRupee className="w-4 h-4" />, label: "Monthly Rent", value: rentVal, gradient: "from-orange-500 to-orange-600", bg: "bg-orange-50", text: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 font-inter">
      {/* Modern Header with Glassmorphism */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-9xl mx-auto px-0 md:px-0 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-11 h-11 ring-2 ring-white shadow-lg">
                  {tenant.photo_url
                    ? <AvatarImage src={tenant.photo_url} alt={tenant.full_name} />
                    : <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-lexend font-bold text-base">
                      {tenant.full_name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>}
                </Avatar>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${tenant.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              </div>
              <div>
                <h1 className="font-lexend font-bold text-lg text-slate-900">{tenant.full_name}</h1>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${tenant.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {tenant.is_active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {tenant.id}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs">
            <Calendar className="w-3 h-3" />
            Joined {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-9xl mx-auto px-0 md:px-0 py-6 space-y-6">
        {/* Enhanced Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="group relative overflow-hidden bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${s.gradient}`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{s.label}</p>
                  <p className="font-lexend font-bold text-sm text-slate-900">{s.value}</p>
                </div>
                <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center ${s.text}`}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Card with Modern Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Enhanced Tab Navigation */}
            <div className="border-b border-slate-200 px-4 md:px-6 overflow-x-auto scrollbar-hide">
              <TabsList className="h-auto p-0 bg-transparent flex gap-6 min-w-max md:min-w-0">
                {[
                  { v: "overview", icon: <User className="w-4 h-4" />, label: "Overview" },
                  { v: "occupation", icon: <Briefcase className="w-4 h-4" />, label: "Occupation" },
                  { v: "documents", icon: <FileText className="w-4 h-4" />, label: "Documents" },
                  { v: "payments", icon: <CreditCard className="w-4 h-4" />, label: "Payments" },
                ].map(t => (
                  <TabsTrigger
                    key={t.v}
                    value={t.v}
                    className="px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none bg-transparent hover:text-slate-700 transition gap-2 relative"
                  >
                    {t.icon}
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content with Enhanced Styling */}
            <div className="p-4 md:p-6 max-h-[70vh] md:max-h-[65vh] overflow-y-auto">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Personal Info + Account Status Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information Card */}
                  <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4" />
                      </div>
                      <h3 className="font-lexend font-semibold text-slate-900">Personal Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Salutation</p>
                        <p className="text-sm font-medium text-slate-900">{tenant.salutation || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</p>
                        <p className="text-sm font-medium text-slate-900">{tenant.full_name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Gender</p>
                        <p className="text-sm font-medium text-slate-900">{tenant.gender || "—"}</p>
                      </div>
                      <div>
  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
    Date of Birth
  </p>
  <p className="text-sm font-medium text-slate-900">
    {tenant.date_of_birth
      ? `${new Date(tenant.date_of_birth).toLocaleDateString("en-GB")} · ${calcAge(tenant.date_of_birth)} yrs`
      : "—"}
  </p>
</div>
                    </div>
                  </div>

                  {/* Account Status Card */}
                  <div className="bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                        <Shield className="w-4 h-4" />
                      </div>
                      <h3 className="font-lexend font-semibold text-slate-900">Account Status</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-600">Account Status</span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tenant.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {tenant.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-t border-slate-200">
                        <span className="text-sm text-slate-600">Portal Access</span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tenant.portal_access_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {tenant.portal_access_enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-t border-slate-200">
                        <span className="text-sm text-slate-600">Login Credentials</span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tenant.has_credentials ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {tenant.has_credentials ? "Configured" : "Not Configured"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact + Emergency Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <Phone className="w-4 h-4" />
                      </div>
                      <h3 className="font-lexend font-semibold text-slate-900">Contact Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 group">
                        <Mail className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email</p>
                          <div className="flex items-center gap-2">
                            <a href={`mailto:${tenant.email}`} className="text-sm font-medium text-blue-600 hover:underline break-all">
                              {tenant.email}
                            </a>
                            <button
                              onClick={() => copyToClipboard(tenant.email, 'email')}
                              className="p-1 rounded-md hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              {copiedEmail ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 group">
                        <Phone className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</p>
                          <div className="flex items-center gap-2">
                            <a href={`tel:${tenant.country_code}${tenant.phone}`} className="text-sm font-medium text-slate-900 hover:underline break-all">
                              {tenant.country_code} {tenant.phone}
                            </a>
                            <button
                              onClick={() => copyToClipboard(`${tenant.country_code}${tenant.phone}`, 'phone')}
                              className="p-1 rounded-md hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              {copiedPhone ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Address</p>
                          <p className="text-sm font-medium text-slate-900 break-words">
                            {tenant.address}, {tenant.city}, {tenant.state} – {tenant.pincode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-sm">
                        <Heart className="w-4 h-4" />
                      </div>
                      <h3 className="font-lexend font-semibold text-slate-900">Emergency Contact</h3>
                    </div>
                    {tenant.emergency_contact_name ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Name</p>
                          <p className="text-sm font-medium text-slate-900">{tenant.emergency_contact_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</p>
                          <p className="text-sm font-medium text-slate-900">{tenant.emergency_contact_phone || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Relation</p>
                          <p className="text-sm font-medium text-slate-900">{tenant.emergency_contact_relation || "—"}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No emergency contact provided</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Occupation Tab - Enhanced */}
              <TabsContent value="occupation" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <h3 className="font-lexend font-semibold text-slate-900">Employment Details</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Category</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          {tenant.occupation_category || "Other"}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Occupation</p>
                        <p className="text-sm font-medium text-slate-900">{tenant.exact_occupation || tenant.occupation || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Organization</p>
                        <p className="text-sm font-medium text-slate-900">{tenant.organization || "—"}</p>
                      </div>
                      {tenant.years_of_experience && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Experience</p>
                          <p className="text-sm font-medium text-slate-900">{tenant.years_of_experience} years</p>
                        </div>
                      )}
                      {tenant.monthly_income && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Monthly Income</p>
                          <p className="text-sm font-medium text-slate-900">₹{Number(tenant.monthly_income).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Award className="w-4 h-4" />
                      </div>
                      <h3 className="font-lexend font-semibold text-slate-900">Work Preferences</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Work Mode</p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {tenant.work_mode || "Not specified"}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Shift Timing</p>
                        <p className="text-sm font-medium text-slate-900">{tenant.shift_timing || "—"}</p>
                      </div>
                      {tenant.student_id && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Student ID</p>
                          <p className="text-sm font-medium text-slate-900">{tenant.student_id}</p>
                        </div>
                      )}
                      {tenant.employee_id && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Employee ID</p>
                          <p className="text-sm font-medium text-slate-900">{tenant.employee_id}</p>
                        </div>
                      )}
                      {tenant.portfolio_url && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Portfolio</p>
                          <a href={tenant.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                            View Portfolio <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Documents Tab - Enhanced Grid */}
              <TabsContent value="documents" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <DocCard 
                    title="ID Proof" 
                    icon={<IdCard className="w-4 h-4" />} 
                    url={tenant.id_proof_url} 
                    filename="ID Proof Document" 
                    onView={viewDoc} 
                    gradient="from-blue-500 to-blue-600"
                    bg="bg-blue-50"
                  />
                  <DocCard 
                    title="Address Proof" 
                    icon={<Home className="w-4 h-4" />} 
                    url={tenant.address_proof_url} 
                    filename="Address Proof Document" 
                    onView={viewDoc} 
                    gradient="from-purple-500 to-purple-600"
                    bg="bg-purple-50"
                  />
                  <DocCard 
                    title="Photograph" 
                    icon={<Camera className="w-4 h-4" />} 
                    url={tenant.photo_url} 
                    filename="Tenant Photo" 
                    onView={viewDoc} 
                    gradient="from-emerald-500 to-emerald-600"
                    bg="bg-emerald-50"
                    isImage 
                  />
                </div>

                {tenant.additional_documents && tenant.additional_documents.length > 0 && (
                  <div className="mt-6 bg-gradient-to-br from-white to-slate-50/50 rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-sm">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-lexend font-semibold text-slate-900">
                        Additional Documents ({tenant.additional_documents.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tenant.additional_documents.map((doc: any, i: number) => (
                        <DocCard 
                          key={i} 
                          title={doc.filename || `Document ${i + 1}`} 
                          icon={<FileText className="w-4 h-4" />} 
                          url={doc.url} 
                          filename={doc.filename} 
                          uploadedAt={doc.uploaded_at} 
                          onView={viewDoc} 
                          bg="bg-slate-100"
                          gradient="from-slate-500 to-slate-600"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Payments Tab - Enhanced */}
              <TabsContent value="payments" className="mt-0 space-y-6">
                {paymentSummary && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <PaymentCard 
                      label="Total Paid" 
                      value={`₹${paymentSummary.total_paid?.toLocaleString() || "0"}`}
                      gradient="from-emerald-500 to-emerald-600"
                      icon={<TrendingUp className="w-3 h-3" />}
                    />
                    <PaymentCard 
                      label="Total Pending" 
                      value={`₹${paymentSummary.total_pending?.toLocaleString() || "0"}`}
                      gradient="from-orange-500 to-orange-600"
                      icon={<Clock className="w-3 h-3" />}
                    />
                    <PaymentCard 
                      label="Monthly Rent" 
                      value={`₹${paymentSummary.monthly_rent?.toLocaleString() || "0"}`}
                      gradient="from-blue-500 to-blue-600"
                      icon={<IndianRupee className="w-3 h-3" />}
                    />
                    <PaymentCard 
                      label="Months Joined" 
                      value={String(paymentSummary.total_months_since_joining || "0")}
                      gradient="from-purple-500 to-purple-600"
                      icon={<CalendarDays className="w-3 h-3" />}
                    />
                  </div>
                )}

                {paymentSummary?.month_wise_history?.length > 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-lexend font-semibold text-slate-900">Month-wise Payment History</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Detailed breakdown of payments by month</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {paymentSummary.month_wise_history.map((m: any) => {
                        const k = `${m.month}-${m.year}`;
                        const open = expandedMonths.includes(k);
                        const statusColor = m.status === "paid" ? "emerald" : m.status === "partial" ? "blue" : m.status === "overdue" ? "red" : "slate";
                        
                        return (
                          <Collapsible key={k} open={open} onOpenChange={() => toggleMonth(k)}>
                            <div className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
                              <CollapsibleTrigger asChild>
                                <button className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition-all">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${open ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                                      {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="text-left min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-lexend font-semibold text-slate-900">
                                          {m.month} {m.year}
                                        </span>
                                        {m.isCurrentMonth && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                            Current
                                          </span>
                                        )}
                                        {m.isFirstMonth && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                            First Month
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-500 mt-0.5">Rent: ₹{m.rent?.toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                    <div className="text-right sm:text-left">
                                      <p className="text-sm font-semibold text-emerald-600">Paid ₹{(m.paid || m.paid_amount || 0).toLocaleString()}</p>
                                      <p className="text-sm font-semibold text-orange-600">Pending ₹{(m.pending || m.pending_amount || m.rent || 0).toLocaleString()}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-${statusColor}-50 text-${statusColor}-700 border border-${statusColor}-200`}>
                                      {m.status || "pending"}
                                    </span>
                                  </div>
                                </button>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent>
                                <div className="bg-slate-50/80 border-t border-slate-200 p-4">
                                  {m.payments?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                      <table className="w-full min-w-[600px] text-sm">
                                        <thead>
                                          <tr className="border-b border-slate-200">
                                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Date</th>
                                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Amount</th>
                                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Mode</th>
                                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Transaction ID</th>
                                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Bank</th>
                                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Remark</th>
                                            <th className="text-right py-2 px-2 font-semibold text-slate-500 text-xs">Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {m.payments.map((p: any) => (
                                            <tr key={p.id} className="border-b border-slate-100 hover:bg-white/50">
                                              <td className="py-2 px-2 text-slate-600">{p.date ? new Date(p.date).toLocaleDateString("en-IN") : "—"}</td>
                                              <td className="py-2 px-2 font-semibold text-emerald-600">₹{p.amount?.toLocaleString() || "0"}</td>
                                              <td className="py-2 px-2 text-slate-600 capitalize">{p.mode || p.payment_mode || "—"}</td>
                                              <td className="py-2 px-2 text-slate-600 font-mono text-xs">{p.transaction_id || "—"}</td>
                                              <td className="py-2 px-2 text-slate-600">{p.bank_name || "—"}</td>
                                              <td className="py-2 px-2 text-slate-600">{p.remark || "—"}</td>
                                              <td className="py-2 px-2 text-right">
                                                <button 
                                                  onClick={() => openReceipt(p.id)} 
                                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all duration-200"
                                                  title="View Receipt"
                                                >
                                                  <ReceiptIndianRupee className="w-3.5 h-3.5" />
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <p className="text-center py-6 text-sm text-slate-400">No individual payment records for this month</p>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400">No payment records found</p>
                    {loadingPayments && <Loader2 className="w-5 h-5 text-blue-600 mx-auto mt-3 animate-spin" />}
                  </div>
                )}

                {payments.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-lexend font-semibold text-slate-900">Recent Transactions</h3>
                        <p className="text-xs text-slate-500 mt-0.5">All payment transactions in chronological order</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Date</th>
                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Description</th>
                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Amount</th>
                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Method</th>
                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Period</th>
                            <th className="text-left py-2 px-2 font-semibold text-slate-500 text-xs">Status</th>
                            <th className="text-right py-2 px-2 font-semibold text-slate-500 text-xs">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map(p => {
                            const statusColor = p.status === "approved" ? "emerald" : p.status === "rejected" ? "red" : "amber";
                            return (
                              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="py-2 px-2 font-medium text-slate-900">{new Date(p.payment_date).toLocaleDateString("en-IN")}</td>
                                <td className="py-2 px-2 text-slate-600">{p.remark || "Rent Payment"}</td>
                                <td className="py-2 px-2 font-semibold text-slate-900">₹{p.amount?.toLocaleString() || "0"}</td>
                                <td className="py-2 px-2 text-slate-600 capitalize">{p.payment_mode || p.payment_method || "—"}</td>
                                <td className="py-2 px-2 text-slate-600">{p.month} {p.year}</td>
                                <td className="py-2 px-2">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-${statusColor}-50 text-${statusColor}-700 border border-${statusColor}-200`}>
                                    {p.status || "pending"}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-right">
                                  {p.status === "approved" && (
                                    <button 
                                      onClick={() => openReceipt(p.id)} 
                                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all duration-200"
                                      title="View Receipt"
                                    >
                                      <ReceiptIndianRupee className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <ReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} receiptId={receiptId} onDownload={dlReceipt} />
    </div>
  );
}

/* Enhanced Document Card Component */
function DocCard({ title, icon, url, filename, isImage, uploadedAt, onView, gradient, bg }: any) {
  if (!url) return (
    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center gap-3 cursor-default opacity-60 bg-slate-50/50">
      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200 flex-shrink-0">
        <FileWarning className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 truncate">{title}</p>
        <p className="text-xs text-slate-400">Not uploaded</p>
      </div>
    </div>
  );

  return (
    <div 
      className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all duration-300"
      onClick={() => onView(url)}
    >
      <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${gradient} group-hover:h-1 transition-all duration-300`} />
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200`}>
        {isImage ? (
          <img 
            src={url.startsWith("http") ? url : `http://localhost:3001${url}`} 
            alt={title} 
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=!"; }}
          />
        ) : icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">{title}</p>
        <p className="text-xs text-slate-400 truncate">{filename}</p>
        {uploadedAt && <p className="text-[10px] text-slate-300 mt-0.5">Uploaded {new Date(uploadedAt).toLocaleDateString()}</p>}
      </div>
      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110">
        <Eye className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

/* Enhanced Payment Card Component */
function PaymentCard({ label, value, gradient, icon }: any) {
  return (
    <div className="group relative overflow-hidden bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${gradient} group-hover:h-1 transition-all duration-300`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
          <p className="font-lexend font-bold text-lg text-slate-900">{value}</p>
        </div>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10 flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* Enhanced Receipt Dialog */
const ReceiptDialog = ({ open, onOpenChange, receiptId, onDownload }: any) => {
  const [receipt, setReceipt] = useState<any>(null);
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => { try { setSettings(await getSettings()); } catch { } })(); }, []);
  useEffect(() => { if (open && receiptId) fetchR(); }, [open, receiptId]);

  const fetchR = async () => {
    if (!receiptId) return; setLoading(true);
    try { const r = await paymentApi.getReceiptById(receiptId); r.success ? setReceipt(r.data) : toast.error("Failed to load receipt"); }
    catch { toast.error("Failed to load receipt"); } finally { setLoading(false); }
  };

  const logo = settings["logo_header"]?.value || "/default-logo.png";
  const fullLogo = logo.startsWith("http") ? logo : `${import.meta.env.VITE_API_URL || "http://localhost:3001"}${logo}`;
  const siteName = settings["site_name"]?.value || "ROOMAC";
  const tagline = settings["site_tagline"]?.value || "Premium Living Spaces";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-white border border-slate-200 rounded-2xl max-w-[95vw] md:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-200 flex items-center gap-3 sticky top-0 bg-white z-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
            <ReceiptIndianRupee className="w-4 h-4" />
          </div>
          <div>
            <p className="font-lexend font-semibold text-slate-900">Payment Receipt</p>
            <p className="text-xs text-slate-400">{receipt ? `Receipt #${receipt.id} · ${receipt.month} ${receipt.year}` : "Loading…"}</p>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : receipt ? (
            <>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm mb-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] p-6 text-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(96,165,250,0.2),transparent_70%)]" />
                  <div className="relative z-10">
                    <img src={fullLogo} alt={siteName} className="h-10 mx-auto mb-2 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <p className="font-lexend font-bold text-xl text-white">{siteName}</p>
                    <p className="text-xs text-white/60 mt-1">{tagline}</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs text-white font-medium">
                      Payment Receipt
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-white">
                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Receipt No.</p>
                      <p className="font-lexend font-bold text-slate-900">#{receipt.id}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Payment Date</p>
                      <p className="font-lexend font-bold text-slate-900">{new Date(receipt.payment_date).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>

                  {/* Tenant */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Tenant Details</p>
                    <p className="font-semibold text-slate-900">{receipt.tenant_name}</p>
                    {receipt.tenant_phone && <p className="text-xs text-slate-600 mt-1">{receipt.tenant_phone}</p>}
                    {receipt.tenant_email && <p className="text-xs text-slate-600">{receipt.tenant_email}</p>}
                  </div>

                  {/* Property */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Property Details</p>
                    <p className="font-semibold text-slate-900">{receipt.property_name || "N/A"}</p>
                    <p className="text-xs text-slate-600 mt-1">Room: {receipt.room_number || "N/A"}{receipt.bed_number && ` · Bed #${receipt.bed_number}`}</p>
                  </div>

                  {/* Amount */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                    <p className="text-[10px] font-bold uppercase text-blue-600 mb-3">Payment Details</p>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-200">
                      <span className="text-sm text-blue-700">Amount Paid</span>
                      <span className="font-lexend font-bold text-2xl text-blue-700">
                        ₹{receipt.amount?.toLocaleString() || "0"}
                      </span>
                    </div>
                    {[
                      ["Payment Mode", receipt.payment_mode, true],
                      receipt.bank_name && ["Bank", receipt.bank_name],
                      receipt.transaction_id && ["Transaction ID", receipt.transaction_id],
                      ["Period", `${receipt.month} ${receipt.year}`],
                    ].filter(Boolean).map((row: any, i: number) => (
                      <div key={i} className="flex justify-between mb-1.5">
                        <span className="text-xs text-blue-500">{row[0]}</span>
                        <span className={`text-sm font-medium text-slate-700 ${row[2] ? 'capitalize' : ''}`}>{row[1]}</span>
                      </div>
                    ))}
                  </div>

                  {receipt.remark && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <p className="text-[10px] font-bold uppercase text-amber-700 mb-1">Remark</p>
                      <p className="text-sm text-slate-700">{receipt.remark}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-3 border-t border-slate-200 text-center">
                    {settings["contact_address"]?.value && (
                      <p className="text-xs text-slate-400">{settings["contact_address"].value}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {settings["contact_phone"]?.value && `Tel: ${settings["contact_phone"].value}`}
                      {settings["contact_email"]?.value && ` · ${settings["contact_email"].value}`}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-2">Computer generated receipt · No signature required</p>
                    <p className="text-[10px] text-slate-300">Generated: {new Date(receipt.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition">
                  Close
                </button>
                <button onClick={() => onDownload(receipt.id)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FileWarning className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No receipt data found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* Enhanced Loading Skeleton */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="h-16 bg-white border-b border-slate-200" />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
              <div className="w-8 h-8 bg-slate-200 rounded-lg mb-2" />
              <div className="h-3 bg-slate-200 rounded w-20 mb-1" />
              <div className="h-4 bg-slate-200 rounded w-28" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl h-[400px] animate-pulse" />
      </div>
    </div>
  );
}

function calcAge(dob: string): number {
  if (!dob) return 0;

  const birth = new Date(dob);
  const today = new Date();

  if (isNaN(birth.getTime())) return 0; // invalid date safety

  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}