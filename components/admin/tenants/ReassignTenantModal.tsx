"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAllProperties } from "@/lib/tenantApi";
import {
  Heart, Calendar, Building, Search, Users,
  UserPlus, Loader2, X, ChevronLeft,
} from "lucide-react";

type Step = "main" | "partner-choice" | "partner-select";

interface PartnerEdit {
  full_name: string; phone: string; email: string;
  gender: string; relationship: string;
  salutation: string; country_code: string;
}

export function ReassignTenantModal({
  open, onOpenChange, tenant, onSuccess, onEditTenant,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: any;
  onSuccess: () => void;
  onEditTenant: (tenant: any) => void;  // opens the tenant's own edit form
}) {
  const [step, setStep] = useState<Step>("main");
  const [properties, setProperties] = useState<any[]>([]);
  const [checkInDate, setCheckInDate] = useState("");
  const [propertyId, setPropertyId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [addPartner, setAddPartner] = useState(false);

  // existing-tenant partner state
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [partnerEdit, setPartnerEdit] = useState<PartnerEdit>({
    full_name: "", phone: "", email: "", gender: "",
    relationship: "Spouse", salutation: "Mr.", country_code: "+91",
  });

  // search state
  const [searchQuery, setSearchQuery] = useState("");
  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Reset on open ──
  useEffect(() => {
    if (!open) return;
    getAllProperties().then((res) => { if (res.success) setProperties(res.data || []); });
    setCheckInDate(new Date().toISOString().split("T")[0]);
    setPropertyId(tenant?.property_id ? String(tenant.property_id) : "");
    setStep("main");
    setAddPartner(false);
    setSelectedPartner(null);
    setPartnerEdit({ full_name: "", phone: "", email: "", gender: "", relationship: "Spouse", salutation: "Mr.", country_code: "+91" });
    setSearchQuery("");
    setAllTenants([]);
    setFilteredTenants([]);
  }, [open, tenant]);

  // ── Load tenants when entering partner-select step ──
  const loadAllTenants = useCallback(async () => {
    setSearchLoading(true);
    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("auth_token") || localStorage.getItem("token");
      const res = await fetch(`/api/tenants?page=1&pageSize=200&is_active=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        const eligible = result.data.filter((t: any) => t.id !== tenant?.id);
        setAllTenants(eligible);
        setFilteredTenants(eligible);
      }
    } catch (e) { console.error("Failed to load tenants:", e); }
    finally { setSearchLoading(false); }
  }, [tenant]);

  useEffect(() => {
    if (step === "partner-select") {
      loadAllTenants();
      setSearchQuery("");
    }
  }, [step, loadAllTenants]);

  // ── Client-side filter ──
  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredTenants(allTenants); return; }
    const q = searchQuery.toLowerCase();
    setFilteredTenants(
      allTenants.filter((t: any) =>
        t.full_name?.toLowerCase().includes(q) ||
        t.phone?.includes(q) ||
        t.email?.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, allTenants]);

  // ── Select partner handler ──
  const handleSelectPartner = (t: any) => {
    if (t.bed_assignment_id) {
      toast.warning(
        `"${t.full_name}" has an active bed assignment. Vacate their current bed first, then add as partner.`,
        { duration: 6000 }
      );
      return;
    }
    if (t.is_couple_booking && t.partner_tenant_id) {
      toast.warning(
        `"${t.full_name}" is already in a couple booking. Both partners must vacate first.`,
        { duration: 6000 }
      );
      return;
    }
    setSelectedPartner(t);
    setPartnerEdit({
      full_name: t.full_name || "",
      phone: t.phone || "",
      email: t.email || "",
      gender: t.gender || "",
      relationship: "Spouse",
      salutation: t.salutation || "Mr.",
      country_code: t.country_code || "+91",
    });
    setStep("main");
  };

  const handleSubmit = async () => {
    if (!checkInDate) return toast.error("Check-in date is required");
    if (!propertyId) return toast.error("Property is required");
    if (addPartner && !selectedPartner)
      return toast.error("Please select a partner tenant");
    if (addPartner && selectedPartner) {
      if (!partnerEdit.full_name.trim()) return toast.error("Partner name is required");
      if (!partnerEdit.phone.trim() || partnerEdit.phone.length !== 10)
        return toast.error("Partner phone must be 10 digits");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("auth_token") || localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/tenants/${tenant.id}/reassign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            check_in_date: checkInDate,
            property_id: propertyId,
            add_partner: addPartner,
            existing_partner_id: addPartner && selectedPartner ? selectedPartner.id : null,
            partner: addPartner && selectedPartner ? partnerEdit : null,
          }),
        }
      );
      const result = await res.json();
      if (result.success) {
        toast.success("Tenant reassigned successfully");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.message || "Failed to reassign tenant");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to reassign");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step !== "main" && (
              <button type="button"
                onClick={() => setStep(step === "partner-select" ? "partner-choice" : "main")}
                className="text-gray-400 hover:text-gray-600">
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <DialogTitle className="text-sm">
              {step === "main" && `Reassign — ${tenant?.full_name || ""}`}
              {step === "partner-choice" && "Add Partner — Choose Method"}
              {step === "partner-select" && "Select Existing Tenant as Partner"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* ══════════ STEP: MAIN ══════════ */}
        {step === "main" && (
          <div className="space-y-3 py-2">
            {/* Check-in date */}
            <div>
              <Label className="text-xs flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3" /> Check-in Date *
              </Label>
              <Input type="date" value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="h-8 text-xs" />
            </div>

            {/* Property */}
            <div>
              <Label className="text-xs flex items-center gap-1 mb-1">
                <Building className="h-3 w-3" /> Property *
              </Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)} className="text-xs">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Partner toggle */}
            <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-100 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-xs font-medium text-rose-700">
                  Add partner for this stay?
                </span>
              </div>
              <Switch
                checked={addPartner}
                onCheckedChange={(v) => {
                  setAddPartner(v);
                  if (v && !selectedPartner) setStep("partner-choice");
                  if (!v) { setSelectedPartner(null); }
                }}
              />
            </div>

            {/* Partner preview after selection */}
            {addPartner && selectedPartner && (
              <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                    Selected Partner
                  </p>
                  <button type="button"
                    onClick={() => { setSelectedPartner(null); setStep("partner-choice"); }}
                    className="text-gray-400 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-white border border-green-200 rounded-md">
                  <div>
                    <p className="text-xs font-medium">{selectedPartner.full_name}</p>
                    <p className="text-[10px] text-gray-500">{selectedPartner.phone}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-[9px]">
                    Existing Tenant
                  </Badge>
                </div>

                {/* Editable fields pre-filled from selected tenant */}
                <div className="space-y-1.5 pt-1 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400">Edit details for this stay (optional)</p>
                  <Input placeholder="Full name *" value={partnerEdit.full_name}
                    onChange={(e) => setPartnerEdit((p) => ({ ...p, full_name: e.target.value }))}
                    className="h-7 text-xs" />
                  <Input placeholder="Phone *" value={partnerEdit.phone}
                    onChange={(e) => setPartnerEdit((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    className="h-7 text-xs" />
                  <Input placeholder="Email (optional)" value={partnerEdit.email}
                    onChange={(e) => setPartnerEdit((p) => ({ ...p, email: e.target.value }))}
                    className="h-7 text-xs" />
                  <Select value={partnerEdit.gender}
                    onValueChange={(v) => setPartnerEdit((p) => ({ ...p, gender: v }))}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male" className="text-xs">Male</SelectItem>
                      <SelectItem value="Female" className="text-xs">Female</SelectItem>
                      <SelectItem value="Other" className="text-xs">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={partnerEdit.relationship}
                    onValueChange={(v) => setPartnerEdit((p) => ({ ...p, relationship: v }))}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Relationship" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse" className="text-xs">Spouse</SelectItem>
                      <SelectItem value="Partner" className="text-xs">Partner</SelectItem>
                      <SelectItem value="Fiancé" className="text-xs">Fiancé</SelectItem>
                      <SelectItem value="Fiancée" className="text-xs">Fiancée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* If toggled but no partner picked yet */}
            {addPartner && !selectedPartner && (
              <Button variant="outline" size="sm"
                className="w-full h-8 text-xs text-blue-600 border-blue-200"
                onClick={() => setStep("partner-choice")}>
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Choose Partner →
              </Button>
            )}

            <DialogFooter className="gap-2 pt-1">
              <Button variant="outline" size="sm" className="text-xs h-8"
                onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button size="sm" className="text-xs h-8 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Reassigning...</>
                  : "Reassign Tenant"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ══════════ STEP: PARTNER CHOICE ══════════ */}
        {step === "partner-choice" && (
          <div className="space-y-2 py-2">
            <p className="text-xs text-gray-500 mb-3">
              How do you want to add a partner for this stay?
            </p>

            {/* Option 1: Select existing tenant */}
            <button type="button"
              onClick={() => setStep("partner-select")}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left">
              <Users className="h-4 w-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-800">Select Existing Tenant</p>
                <p className="text-[10px] text-gray-500">
                  Link an already-registered tenant as partner
                </p>
              </div>
            </button>

            {/* Option 2: Open this tenant's own form to add partner section */}
            <button type="button"
              onClick={() => {
                onOpenChange(false);      // close reassign modal first
                onEditTenant(tenant);     // open tenant edit form pre-filled
              }}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-rose-400 hover:bg-rose-50 transition-colors text-left">
              <UserPlus className="h-4 w-4 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-800">
                  Add Partner Details to {tenant?.full_name}'s Profile
                </p>
                <p className="text-[10px] text-gray-500">
                  Opens {tenant?.full_name}'s form — fill in the partner section there
                </p>
              </div>
            </button>

            <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] mt-1"
              onClick={() => setStep("main")}>
              ← Back
            </Button>
          </div>
        )}

        {/* ══════════ STEP: PARTNER SELECT (search list) ══════════ */}
        {step === "partner-select" && (
          <div className="space-y-2 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <Input placeholder="Search by name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs pl-8"
                autoFocus />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-0.5">
              {searchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-xs text-gray-400 ml-2">Loading tenants...</span>
                </div>
              ) : filteredTenants.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">No tenants found</p>
                </div>
              ) : (
                filteredTenants.map((t) => {
                  const hasAssignment = !!t.bed_assignment_id;
                  const inCouple = !!(t.is_couple_booking && t.partner_tenant_id);
                  const isBlocked = hasAssignment || inCouple;

                  return (
                    <button key={t.id} type="button"
                      onClick={() => handleSelectPartner(t)}
                      className={`w-full flex items-center justify-between p-2.5 border rounded-lg text-left transition-colors
                        ${isBlocked
                          ? "opacity-50 bg-gray-50 border-gray-100"
                          : "hover:border-blue-400 hover:bg-blue-50 border-gray-200 bg-white cursor-pointer"
                        }`}>
                      <div>
                        <p className="text-xs font-medium text-gray-800">{t.full_name}</p>
                        <p className="text-[10px] text-gray-500">
                          {t.phone}{t.email ? ` · ${t.email}` : ""}
                        </p>
                        {hasAssignment && (
                          <p className="text-[9px] text-red-500 mt-0.5">
                            Active assignment — vacate first
                          </p>
                        )}
                        {!hasAssignment && inCouple && (
                          <p className="text-[9px] text-amber-600 mt-0.5">
                            In active couple booking
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {t.gender && (
                          <Badge variant="outline" className="text-[9px]">{t.gender}</Badge>
                        )}
                        {isBlocked && (
                          <Badge className="text-[9px] bg-red-50 text-red-600 border-red-200">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              {filteredTenants.length} tenant{filteredTenants.length !== 1 ? "s" : ""} shown
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}