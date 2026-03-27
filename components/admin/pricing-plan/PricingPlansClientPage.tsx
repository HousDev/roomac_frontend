// app/admin/offers/PricingPlansClientPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Search,
  Building,
  Sparkles,
  Plus,
  X,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import {
  pricingPlanApi,
  PricingPlan,
  PricingPlanFormData,
  PaginationMeta,
} from "@/lib/pricingPlanApi";
import PricingPlanForm from "./PricingPlanForm";
import PricingPlansTable from "./PricingPlansTable";
import { PropertyApiResponse } from "../offers/OffersClientPage";

const getApiUrl = () => import.meta.env.VITE_API_URL || "http://localhost:3001";

const EMPTY_PLAN_FORM: PricingPlanFormData = {
  name: "",
  duration: "",
  subtitle: "All-inclusive",
  total_price: "",
  per_day_price: "",
  is_popular: false,
  button_style: "blue",
  features: [],
  is_active: true,
  display_order: "0",
  property_id: null,
  is_short_stay: false,
  short_stay_label: "Book Short Stay",
  short_stay_rate_per_day: 500,
};

export default function PricingPlansClientPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [properties, setProperties] = useState<PropertyApiResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10,
  });

  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [planForm, setPlanForm] = useState<PricingPlanFormData>(EMPTY_PLAN_FORM);

  const [planSearch, setPlanSearch] = useState("");
  const [planFilterProp, setPlanFilterProp] = useState("all");
  const [planTypeFilter, setPlanTypeFilter] = useState<"all" | "regular" | "short_stay">("all");

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = useCallback(async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await axios.get<{ success: boolean; data: PropertyApiResponse[] }>(
        `${apiUrl}/api/properties`
      );
      if (res.data.success && res.data.data) {
        setProperties(res.data.data.filter((p) => p.is_active && p.id && p.name?.trim()));
      }
    } catch (err) {
      console.error("loadProperties:", err);
    }
  }, []);

  const loadPlans = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await pricingPlanApi.getPaginated({
        page,
        limit: 10,
        search: planSearch || undefined,
        property_id: planFilterProp !== "all" ? planFilterProp : undefined,
        type: planTypeFilter,
      });
      if (res.success) {
        setPlans(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error("Failed to load pricing plans");
    } finally {
      setLoading(false);
    }
  }, [planSearch, planFilterProp, planTypeFilter]);

  useEffect(() => {
    loadPlans(1);
  }, [loadPlans]);

  useEffect(() => {
    const t = setTimeout(() => loadPlans(1), 300);
    return () => clearTimeout(t);
  }, [planSearch, planFilterProp, planTypeFilter, loadPlans]);

  const handleAddPlan = useCallback(async () => {
    if (planForm.is_short_stay) {
      if (!planForm.short_stay_rate_per_day) {
        toast.error("Rate per day is required for short stay");
        return;
      }
    } else {
      if (!planForm.name || !planForm.total_price) {
        toast.error("Plan name and price are required");
        return;
      }
    }

    if (planForm.is_short_stay) {
      const existingShortStay = plans.find(p =>
        p.is_short_stay &&
        p.property_id === planForm.property_id
      );
      if (existingShortStay) {
        toast.error(`A short stay plan already exists for ${existingShortStay.property_id ? 'this property' : 'general'}. Please edit the existing one.`);
        return;
      }
    }

    try {
      if (planForm.is_short_stay) {
        await pricingPlanApi.upsertShortStayBanner({
          property_id: planForm.property_id,
          label: planForm.short_stay_label,
          rate_per_day: planForm.short_stay_rate_per_day,
          is_active: planForm.is_active,
        });
        toast.success("🎉 Short stay banner created!");
      } else {
        await pricingPlanApi.create({
          property_id: planForm.property_id,
          name: planForm.name,
          duration: planForm.duration,
          subtitle: planForm.subtitle,
          total_price: parseFloat(planForm.total_price),
          per_day_price: planForm.per_day_price
            ? parseFloat(planForm.per_day_price)
            : parseFloat(planForm.total_price) / 30,
          is_popular: planForm.is_popular,
          button_style: planForm.button_style,
          features: planForm.features,
          is_active: planForm.is_active,
          display_order: parseInt(planForm.display_order) || 0,
          is_short_stay: false,
        } as any);
        toast.success("🎉 Pricing plan created!");
      }
      setIsAddPlanOpen(false);
      setPlanForm(EMPTY_PLAN_FORM);
      await loadPlans(pagination.currentPage);
    } catch (err: any) {
      toast.error(err.message || "Failed to create plan");
    }
  }, [planForm, pagination.currentPage, loadPlans, plans]);

  const handleEditPlan = useCallback((plan: PricingPlan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      duration: plan.duration,
      subtitle: plan.subtitle,
      total_price: plan.total_price.toString(),
      per_day_price: plan.per_day_price.toString(),
      is_popular: plan.is_popular,
      button_style: plan.button_style,
      features: [...plan.features],
      is_active: plan.is_active,
      display_order: plan.display_order.toString(),
      property_id: plan.property_id,
      is_short_stay: plan.is_short_stay,
      short_stay_label: plan.short_stay_label,
      short_stay_rate_per_day: plan.short_stay_rate_per_day,
    });
    setIsEditPlanOpen(true);
  }, []);

  const handleUpdatePlan = useCallback(async () => {
    if (!selectedPlan) return;

    if (planForm.is_short_stay) {
      const existingShortStay = plans.find(p =>
        p.is_short_stay &&
        p.property_id === planForm.property_id &&
        p.id !== selectedPlan.id
      );
      if (existingShortStay) {
        toast.error(`A short stay plan already exists for ${existingShortStay.property_id ? 'this property' : 'general'}. Cannot create another.`);
        return;
      }
    }

    try {
      if (planForm.is_short_stay) {
        await pricingPlanApi.upsertShortStayBanner({
          property_id: planForm.property_id,
          label: planForm.short_stay_label,
          rate_per_day: planForm.short_stay_rate_per_day,
          is_active: planForm.is_active,
        });
        toast.success("✅ Short stay banner updated!");
      } else {
        await pricingPlanApi.update(selectedPlan.id, {
          property_id: planForm.property_id,
          name: planForm.name,
          duration: planForm.duration,
          subtitle: planForm.subtitle,
          total_price: parseFloat(planForm.total_price),
          per_day_price: planForm.per_day_price
            ? parseFloat(planForm.per_day_price)
            : parseFloat(planForm.total_price) / 30,
          is_popular: planForm.is_popular,
          button_style: planForm.button_style,
          features: planForm.features,
          is_active: planForm.is_active,
          display_order: parseInt(planForm.display_order) || 0,
          is_short_stay: false,
        } as any);
        toast.success("✅ Plan updated!");
      }
      setIsEditPlanOpen(false);
      setSelectedPlan(null);
      setPlanForm(EMPTY_PLAN_FORM);
      await loadPlans(pagination.currentPage);
    } catch (err: any) {
      toast.error(err.message || "Failed to update plan");
    }
  }, [selectedPlan, planForm, pagination.currentPage, loadPlans, plans]);

  const handleDeletePlan = useCallback(
    async (id: string) => {
      if (!confirm("Delete this pricing plan?")) return;
      try {
        await pricingPlanApi.remove(id);
        toast.success("🗑️ Plan deleted!");
        const page =
          plans.length === 1 && pagination.currentPage > 1
            ? pagination.currentPage - 1
            : pagination.currentPage;
        await loadPlans(page);
      } catch (err: any) {
        toast.error(err.message || "Failed to delete");
      }
    },
    [plans.length, pagination.currentPage, loadPlans]
  );

  const togglePlanActive = useCallback(
    async (id: string, current: boolean) => {
      try {
        await pricingPlanApi.toggleActive(id, !current);
        toast.success(`✨ Plan ${!current ? "activated" : "deactivated"}!`);
        await loadPlans(pagination.currentPage);
      } catch {
        toast.error("Failed to update status");
      }
    },
    [pagination.currentPage, loadPlans]
  );

  const headerGradient = "bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8]";

  // Shared Add Plan Dialog Content
  const AddPlanDialogContent = (
    <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-hidden p-0 rounded-xl flex flex-col">
      <div className={`${headerGradient} text-white px-4 py-3 flex items-center justify-between rounded-t-xl flex-shrink-0`}>
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Add Pricing Plan
          </h2>
          <p className="text-[10px] text-blue-100 mt-0.5">Create a new pricing plan for tenants</p>
        </div>
        <DialogClose asChild>
          <button className="p-1 rounded-full hover:bg-white/20 transition">
            <X className="h-3.5 w-3.5" />
          </button>
        </DialogClose>
      </div>
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <PricingPlanForm
          formData={planForm}
          setFormData={setPlanForm}
          properties={properties}
        />
      </div>
      <div className="flex justify-end gap-2 px-3 sm:px-4 py-2.5 border-t bg-gray-50 flex-shrink-0 rounded-b-xl">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setIsAddPlanOpen(false); setPlanForm(EMPTY_PLAN_FORM); }}
          className="h-7 text-xs px-3"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleAddPlan}
          className="h-7 text-xs px-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
        >
          Create Plan
        </Button>
      </div>
    </DialogContent>
  );

  return (
    <div className="bg-slate-50 -mt-3 px-0 md:px-0">
      <div className="p-0">
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className={`${headerGradient} text-white rounded-t-lg p-3 sm:p-4`}>

            {/* ── MOBILE LAYOUT (below sm) ── */}
            <div className="flex flex-col gap-2 sm:hidden">
              {/* Row 1: Icon + Search + Add button */}
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200" />
                  <Input
                    placeholder="Search plans..."
                    value={planSearch}
                    onChange={(e) => setPlanSearch(e.target.value)}
                    className="w-full pl-7 h-8 text-xs bg-white/20 text-white placeholder:text-blue-200 border-white/30 focus:border-white/50"
                  />
                </div>
                <Dialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-0 font-semibold h-8 text-xs whitespace-nowrap flex-shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  {AddPlanDialogContent}
                </Dialog>
              </div>

              {/* Row 2: Filters */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Building className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200 z-10" />
                  <Select value={planFilterProp} onValueChange={setPlanFilterProp}>
                    <SelectTrigger className="pl-7 h-8 text-xs bg-white/20 text-white border-white/30 focus:border-white/50 w-full">
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      <SelectItem value="general">General Plans</SelectItem>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-1">
                  <Gift className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200 z-10" />
                  <Select value={planTypeFilter} onValueChange={(v) => setPlanTypeFilter(v as any)}>
                    <SelectTrigger className="pl-7 h-8 text-xs bg-white/20 text-white border-white/30 focus:border-white/50 w-full">
                      <SelectValue placeholder="All Plans" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Plans</SelectItem>
                      <SelectItem value="regular">Regular Plans</SelectItem>
                      <SelectItem value="short_stay">Short Stay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(planSearch || planFilterProp !== "all" || planTypeFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setPlanSearch(""); setPlanFilterProp("all"); setPlanTypeFilter("all"); }}
                    className="h-8 text-xs text-white hover:bg-white/20 flex-shrink-0"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* ── DESKTOP LAYOUT (sm and above) — unchanged ── */}
            <div className="hidden sm:flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative max-w-xs">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200" />
                    <Input
                      placeholder="Search plans..."
                      value={planSearch}
                      onChange={(e) => setPlanSearch(e.target.value)}
                      className="w-full pl-7 h-8 text-xs bg-white/20 text-white placeholder:text-blue-200 border-white/30 focus:border-white/50"
                    />
                  </div>
                  <div className="relative min-w-[140px]">
                    <Building className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200 z-10" />
                    <Select value={planFilterProp} onValueChange={setPlanFilterProp}>
                      <SelectTrigger className="pl-7 h-8 text-xs bg-white/20 text-white border-white/30 focus:border-white/50">
                        <SelectValue placeholder="All Properties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Properties</SelectItem>
                        <SelectItem value="general">General Plans</SelectItem>
                        {properties.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative min-w-[120px]">
                    <Gift className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200 z-10" />
                    <Select value={planTypeFilter} onValueChange={(v) => setPlanTypeFilter(v as any)}>
                      <SelectTrigger className="pl-7 h-8 text-xs bg-white/20 text-white border-white/30 focus:border-white/50">
                        <SelectValue placeholder="All Plans" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="regular">Regular Plans</SelectItem>
                        <SelectItem value="short_stay">Short Stay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(planSearch || planFilterProp !== "all" || planTypeFilter !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setPlanSearch(""); setPlanFilterProp("all"); setPlanTypeFilter("all"); }}
                      className="h-8 text-xs text-white hover:bg-white/20"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <Dialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-0 font-semibold h-9 text-sm whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pricing Plan
                  </Button>
                </DialogTrigger>
                {AddPlanDialogContent}
              </Dialog>
            </div>

          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <PricingPlansTable
              plans={plans}
              loading={loading}
              properties={properties}
              pagination={pagination}
              onEdit={handleEditPlan}
              onDelete={handleDeletePlan}
              onToggleActive={togglePlanActive}
              onPageChange={loadPlans}
              onCreateNew={() => setIsAddPlanOpen(true)}
            />
          </CardContent>
        </Card>

        {/* Edit Plan Dialog */}
        <Dialog open={isEditPlanOpen} onOpenChange={setIsEditPlanOpen}>
          <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-hidden p-0 rounded-xl flex flex-col">
            <div className={`${headerGradient} text-white px-4 py-3 flex items-center justify-between rounded-t-xl flex-shrink-0`}>
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Edit Pricing Plan
                </h2>
                <p className="text-[10px] text-blue-100 mt-0.5">Update the pricing plan details</p>
              </div>
              <DialogClose asChild>
                <button className="p-1 rounded-full hover:bg-white/20 transition">
                  <X className="h-3.5 w-3.5" />
                </button>
              </DialogClose>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              <PricingPlanForm
                formData={planForm}
                setFormData={setPlanForm}
                properties={properties}
                isEditing={true}
              />
            </div>
            <div className="flex justify-end gap-2 px-3 sm:px-4 py-2.5 border-t bg-gray-50 flex-shrink-0 rounded-b-xl">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setIsEditPlanOpen(false); setSelectedPlan(null); setPlanForm(EMPTY_PLAN_FORM); }}
                className="h-7 text-xs px-3"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdatePlan}
                className="h-7 text-xs px-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
              >
                Update Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}