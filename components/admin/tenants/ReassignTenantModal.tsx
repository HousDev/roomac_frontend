// components/admin/tenants/ReassignTenantModal.tsx
"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAllProperties, listTenants } from "@/lib/tenantApi";
import { Heart, Calendar, Building, Search, UserPlus, Users, Loader2 } from "lucide-react";

export function ReassignTenantModal({
  open,
  onOpenChange,
  tenant,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: any;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"main" | "partner-source" | "existing-partner" | "new-partner">("main");

  const [properties, setProperties] = useState<any[]>([]);
  const [checkInDate, setCheckInDate] = useState("");
  const [propertyId, setPropertyId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [addPartner, setAddPartner] = useState(false);

  // ── Existing tenant search ──
  const [tenantSearch, setTenantSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedExistingPartner, setSelectedExistingPartner] = useState<any>(null);

  // ── New partner fields ──
  const [partner, setPartner] = useState({
    salutation: "Mr.",
    full_name: "",
    country_code: "+91",
    phone: "",
    email: "",
    gender: "",
    relationship: "Spouse",
  });

  useEffect(() => {
    if (open) {
      getAllProperties().then((res) => {
        if (res.success) setProperties(res.data || []);
      });
      setCheckInDate(new Date().toISOString().split("T")[0]);
      setPropertyId(tenant?.property_id ? String(tenant.property_id) : "");
      setAddPartner(false);
      setStep("main");
      setSelectedExistingPartner(null);
      setTenantSearch("");
      setSearchResults([]);
      setPartner({ salutation: "Mr.", full_name: "", country_code: "+91", phone: "", email: "", gender: "", relationship: "Spouse" });
    }
  }, [open, tenant]);

  // ── Search existing tenants (debounced) ──
  useEffect(() => {
    if (step !== "existing-partner") return;
    if (!tenantSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await listTenants({ search: tenantSearch, pageSize: 20, vacate_status: "non_vacated" });
        if (res.success && Array.isArray(res.data)) {
          // exclude the tenant being reassigned themselves, and anyone already in a couple
          const filtered = res.data.filter(
            (t: any) => t.id !== tenant?.id && !t.is_couple_booking
          );
          setSearchResults(filtered);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [tenantSearch, step, tenant]);

  const handleSubmit = async () => {
    if (!checkInDate) return toast.error("Check-in date is required");
    if (!propertyId) return toast.error("Property is required");

    if (addPartner) {
      if (selectedExistingPartner) {
        // using existing tenant — nothing else to validate
      } else {
        if (!partner.full_name.trim()) return toast.error("Partner name is required");
        if (partner.phone.trim().length !== 10) return toast.error("Partner phone must be 10 digits");
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("auth_token") || localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/tenants/${tenant.id}/reassign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            check_in_date: checkInDate,
            property_id: propertyId,
            add_partner: addPartner,
            // ✅ if using existing tenant, send their id; else send new partner details
            existing_partner_id: selectedExistingPartner ? selectedExistingPartner.id : null,
            partner: addPartner && !selectedExistingPartner ? partner : null,
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
      toast.error(e.message || "Failed to reassign tenant");
    } finally {
      setLoading(false);
    }
  };

  const goToPartnerStep = () => {
    if (addPartner) setStep("partner-source");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-sm">
            {step === "main" && `Reassign ${tenant?.full_name}`}
            {step === "partner-source" && "Add Partner — Choose Source"}
            {step === "existing-partner" && "Select Existing Tenant"}
            {step === "new-partner" && "New Partner Details"}
          </DialogTitle>
        </DialogHeader>

        {/* ── STEP 1: MAIN ── */}
        {step === "main" && (
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3" /> Check-in Date *
              </Label>
              <Input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className="h-8 text-xs" />
            </div>

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
                    <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-100 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-xs font-medium text-rose-700">New partner for this stay?</span>
              </div>
              <Switch checked={addPartner} onCheckedChange={setAddPartner} />
            </div>

            {addPartner && (
              <div className="p-2.5 border rounded-lg bg-gray-50 space-y-2">
                {selectedExistingPartner ? (
                  <div className="flex items-center justify-between p-2 bg-white border border-green-200 rounded-md">
                    <div>
                      <p className="text-xs font-medium text-gray-800">{selectedExistingPartner.full_name}</p>
                      <p className="text-[10px] text-gray-500">{selectedExistingPartner.phone}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-[9px]">Existing Tenant</Badge>
                  </div>
                ) : partner.full_name ? (
                  <div className="flex items-center justify-between p-2 bg-white border border-blue-200 rounded-md">
                    <div>
                      <p className="text-xs font-medium text-gray-800">{partner.full_name}</p>
                      <p className="text-[10px] text-gray-500">{partner.phone}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 text-[9px]">New Tenant</Badge>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400">No partner selected yet</p>
                )}
                <Button variant="outline" size="sm" className="w-full h-7 text-[10px]" onClick={goToPartnerStep}>
                  {selectedExistingPartner || partner.full_name ? "Change Partner" : "Choose Partner →"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: PARTNER SOURCE ── */}
        {step === "partner-source" && (
          <div className="space-y-2 py-2">
            <p className="text-xs text-gray-500 mb-2">Is the partner an existing tenant or a new person?</p>
            <button
              type="button"
              onClick={() => setStep("existing-partner")}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
            >
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-gray-800">Select Existing Tenant</p>
                <p className="text-[10px] text-gray-500">Link an already-registered tenant as partner</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setStep("new-partner")}
              className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-rose-400 hover:bg-rose-50 transition-colors text-left"
            >
              <UserPlus className="h-4 w-4 text-rose-600" />
              <div>
                <p className="text-xs font-medium text-gray-800">Add New Partner Details</p>
                <p className="text-[10px] text-gray-500">Create a new partner tenant record</p>
              </div>
            </button>
            <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] mt-1" onClick={() => setStep("main")}>
              ← Back
            </Button>
          </div>
        )}

        {/* ── STEP 3a: EXISTING TENANT SEARCH ── */}
        {step === "existing-partner" && (
          <div className="space-y-2 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={tenantSearch}
                onChange={(e) => setTenantSearch(e.target.value)}
                className="h-8 text-xs pl-8"
                autoFocus
              />
            </div>

            <div className="max-h-[260px] overflow-y-auto space-y-1">
              {searchLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              ) : tenantSearch && searchResults.length === 0 ? (
                <p className="text-[11px] text-gray-400 text-center py-6">No matching tenants found</p>
              ) : (
                searchResults.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedExistingPartner(t);
                      setStep("main");
                    }}
                    className="w-full flex items-center justify-between p-2 border border-gray-200 rounded-md hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div>
                      <p className="text-xs font-medium text-gray-800">{t.full_name}</p>
                      <p className="text-[10px] text-gray-500">{t.phone} · {t.email}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px]">{t.gender || "—"}</Badge>
                  </button>
                ))
              )}
            </div>

            <Button variant="ghost" size="sm" className="w-full h-7 text-[10px]" onClick={() => setStep("partner-source")}>
              ← Back
            </Button>
          </div>
        )}

        {/* ── STEP 3b: NEW PARTNER FORM ── */}
        {step === "new-partner" && (
          <div className="space-y-2 py-2">
            <Input placeholder="Partner full name *" value={partner.full_name}
              onChange={(e) => setPartner((p) => ({ ...p, full_name: e.target.value }))} className="h-8 text-xs" />
            <Input placeholder="Partner phone (10 digit) *" value={partner.phone}
              onChange={(e) => setPartner((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
              className="h-8 text-xs" />
            <Input placeholder="Partner email (optional)" value={partner.email}
              onChange={(e) => setPartner((p) => ({ ...p, email: e.target.value }))} className="h-8 text-xs" />
            <Select value={partner.gender} onValueChange={(v) => setPartner((p) => ({ ...p, gender: v }))}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male" className="text-xs">Male</SelectItem>
                <SelectItem value="Female" className="text-xs">Female</SelectItem>
                <SelectItem value="Other" className="text-xs">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={partner.relationship} onValueChange={(v) => setPartner((p) => ({ ...p, relationship: v }))}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Relationship" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Spouse" className="text-xs">Spouse</SelectItem>
                <SelectItem value="Partner" className="text-xs">Partner</SelectItem>
                <SelectItem value="Fiancé" className="text-xs">Fiancé</SelectItem>
                <SelectItem value="Fiancée" className="text-xs">Fiancée</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 pt-1">
              <Button variant="ghost" size="sm" className="flex-1 h-7 text-[10px]" onClick={() => setStep("partner-source")}>
                ← Back
              </Button>
              <Button
                size="sm"
                className="flex-1 h-7 text-[10px] bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (!partner.full_name.trim()) return toast.error("Partner name is required");
                  if (partner.phone.trim().length !== 10) return toast.error("Partner phone must be 10 digits");
                  setSelectedExistingPartner(null);
                  setStep("main");
                }}
              >
                Save & Continue
              </Button>
            </div>
          </div>
        )}

        {step === "main" && (
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" className="text-xs h-8 bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={loading}>
              {loading ? "Reassigning..." : "Reassign Tenant"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}