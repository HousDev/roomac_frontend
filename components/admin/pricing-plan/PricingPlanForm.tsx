// app/admin/offers/PricingPlanForm.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Plus,
  Trash2,
  Star,
  IndianRupee,
  Clock,
  Sparkles,
  Palette,
  Search,
  Gift,
} from "lucide-react";
import { PricingPlanFormData } from "@/lib/pricingPlanApi";
import { PropertyApiResponse } from "../offers/OffersClientPage";

interface PricingPlanFormProps {
  formData: PricingPlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<PricingPlanFormData>>;
  properties?: PropertyApiResponse[];
  isEditing?: boolean;
}

const F = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";

const SectionHeader = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
    {icon}{title}
  </div>
);

const PricingPlanForm = ({
  formData,
  setFormData,
  properties = [],
  isEditing = false,
}: PricingPlanFormProps) => {
  const [newFeature, setNewFeature] = useState("");
  const [itemSearchTerm, setItemSearchTerm] = useState("");

  const handleInput = (field: keyof PricingPlanFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    setFormData(prev => ({ ...prev, features: [...prev.features, trimmed] }));
    setNewFeature("");
  };

  const removeFeature = (idx: number) =>
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));

  const updateFeature = (idx: number, val: string) =>
    setFormData(prev => {
      const features = [...prev.features];
      features[idx] = val;
      return { ...prev, features };
    });

  const planNames = [
    { label: "1 Month Plan", value: "1 Month Plan" },
    { label: "3 Months Plan", value: "3 Months Plan" },
    { label: "6 Months Plan", value: "6 Months Plan" },
    { label: "9 Months Plan", value: "9 Months Plan" },
    { label: "12 Months Plan", value: "12 Months Plan" },
    { label: "Premium Plan", value: "Premium Plan" },
    { label: "Standard Plan", value: "Standard Plan" },
    { label: "Basic Plan", value: "Basic Plan" },
  ];

  return (
    <div className="space-y-4">
      {/* Property Selection */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
        <SectionHeader 
          icon={<Building className="h-3 w-3" />} 
          title="Property Assignment" 
          color="text-purple-700"
        />
        <Select
          value={formData.property_id?.toString() || "null"}
          onValueChange={(val) =>
            setFormData(prev => ({ ...prev, property_id: val !== "null" ? parseInt(val) : null }))
          }
        >
          <SelectTrigger className={F}>
            <SelectValue placeholder="All Properties (General)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null" className="text-xs">All Properties (General)</SelectItem>
            {properties.map(p => (
              <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[8px] text-gray-500 mt-1">
          {formData.property_id === null 
            ? "✓ This plan will be visible on ALL properties" 
            : "✓ This plan will only be visible on the selected property"}
        </p>
      </div>

      {/* Plan Type Selection */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <SectionHeader 
          icon={<Gift className="h-3 w-3" />} 
          title="Plan Type" 
          color="text-blue-700"
        />
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={!formData.is_short_stay}
              onChange={() => setFormData(prev => ({ ...prev, is_short_stay: false }))}
              className="w-3 h-3"
            />
            <span className="text-xs">Regular Plan</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={formData.is_short_stay}
              onChange={() => setFormData(prev => ({ ...prev, is_short_stay: true }))}
              className="w-3 h-3"
            />
            <span className="text-xs">Short Stay (Daily)</span>
          </label>
        </div>
      </div>

      {/* Plan Details */}
      {!formData.is_short_stay ? (
        <>
          <div>
            <SectionHeader icon={<Sparkles className="h-3 w-3" />} title="Plan Details" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={L}>Plan Name <span className="text-red-400">*</span></label>
                <Select 
                  value={formData.name}
                  onValueChange={v => {
                    setFormData(p => ({ ...p, name: v }));
                    setItemSearchTerm('');
                  }}
                >
                  <SelectTrigger className={F}>
                    <SelectValue placeholder="Select plan name" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div className="sticky top-0 bg-white p-2 border-b z-10">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                          placeholder="Search plans..."
                          className="pl-7 h-7 text-xs"
                          value={itemSearchTerm}
                          onChange={(e) => setItemSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="py-1">
                      {planNames
                        .filter(item => item.label.toLowerCase().includes(itemSearchTerm.toLowerCase()))
                        .map((item, idx) => (
                          <SelectItem key={idx} value={item.value} className="text-[11px] py-0.5">
                            {item.label}
                          </SelectItem>
                        ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={L}>Duration <span className="text-red-400">*</span></label>
                <Input
                  placeholder="3 Months"
                  value={formData.duration}
                  onChange={handleInput("duration")}
                  className={F}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={L}>Subtitle</label>
            <Input
              placeholder="All-inclusive"
              value={formData.subtitle}
              onChange={handleInput("subtitle")}
              className={F}
            />
          </div>

          {/* Pricing Section */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <SectionHeader 
              icon={<IndianRupee className="h-3 w-3" />} 
              title="Pricing" 
              color="text-blue-700"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={L}>Total Price (₹) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="8000"
                    value={formData.total_price}
                    onChange={handleInput("total_price")}
                    className={`${F} pl-6`}
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">₹</span>
                </div>
              </div>
              <div>
                <label className={L}>Per Day (₹)</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="267"
                    value={formData.per_day_price}
                    onChange={handleInput("per_day_price")}
                    className={`${F} pl-6`}
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">₹</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5">
                  Auto: ₹{formData.total_price ? (parseInt(formData.total_price) / 30).toFixed(0) : "—"}/day
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <SectionHeader icon={<Sparkles className="h-3 w-3" />} title="Features" />
            <div className="space-y-1.5 mb-2">
              {formData.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Input
                    value={feat}
                    onChange={e => updateFeature(idx, e.target.value)}
                    className={F + " flex-1"}
                    placeholder={`Feature ${idx + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <Input
                value={newFeature}
                onChange={e => setNewFeature(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                className={F + " flex-1"}
                placeholder="Add a feature..."
              />
              <Button
                type="button"
                size="sm"
                onClick={addFeature}
                disabled={!newFeature.trim()}
                className="h-8 text-[10px] px-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0.5">
                    {f}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Short Stay Form */
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <SectionHeader 
            icon={<Gift className="h-3 w-3" />} 
            title="Short Stay Settings" 
            color="text-amber-700"
          />
          <div className="space-y-3">
            <div>
              <label className={L}>Button Label</label>
              <Input
                placeholder="Book Short Stay"
                value={formData.short_stay_label}
                onChange={handleInput("short_stay_label")}
                className={F}
              />
            </div>
            <div>
              <label className={L}>Rate Per Day (₹)</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="800"
                  value={formData.short_stay_rate_per_day}
                  onChange={handleInput("short_stay_rate_per_day")}
                  className={`${F} pl-6`}
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">₹</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Display Options */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <SectionHeader 
          icon={<Palette className="h-3 w-3" />} 
          title="Display Options" 
          color="text-amber-700"
        />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className={L}>Active</label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={v => setFormData(prev => ({ ...prev, is_active: v }))}
              className="scale-90"
            />
          </div>

          {!formData.is_short_stay && (
            <div className="flex items-center gap-2">
              <label className={L + " flex items-center gap-0.5"}>
                <Star className="h-2.5 w-2.5" /> Popular
              </label>
              <Switch
                checked={formData.is_popular}
                onCheckedChange={v => setFormData(prev => ({ ...prev, is_popular: v }))}
                className="scale-90"
              />
            </div>
          )}

         {!formData.is_short_stay && (
  <div className="w-24">
    <label className={L}>Order</label>
    <Input
      type="number"
      placeholder="0"
      value={formData.display_order}
      onChange={(e) => {
        const value = e.target.value;
        setFormData(prev => ({ 
          ...prev, 
          display_order: value === "" ? "0" : value 
        }));
      }}
      className={F}
    />
    <p className="text-[8px] text-gray-400 mt-0.5">
      Lower numbers show first
    </p>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default PricingPlanForm;