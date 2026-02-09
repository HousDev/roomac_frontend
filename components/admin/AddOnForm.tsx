"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Save, 
  Loader2, 
  Sparkles,
  Zap,
  Shield,
  Coffee,
  Bike,
  Monitor,
  Package,
  Utensils,
  Wifi,
  Droplets,
  Car,
  Home,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { addOnsApi, type AddOn, type CreateAddOnData } from '@/lib/addOnsApi';

interface AddOnFormProps {
  addOn?: AddOn | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: 'lifestyle', label: 'Lifestyle', icon: Sparkles, color: 'bg-purple-100 text-purple-800' },
  { value: 'meal', label: 'Meal Plans', icon: Coffee, color: 'bg-orange-100 text-orange-800' },
  { value: 'utility', label: 'Utilities', icon: Zap, color: 'bg-blue-100 text-blue-800' },
  { value: 'security', label: 'Security', icon: Shield, color: 'bg-green-100 text-green-800' },
  { value: 'mobility', label: 'Mobility', icon: Bike, color: 'bg-red-100 text-red-800' },
  { value: 'productivity', label: 'Productivity', icon: Monitor, color: 'bg-indigo-100 text-indigo-800' },
];

const BILLING_TYPES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One Time' },
];

const ICONS = [
  { value: 'package', icon: Package, label: 'Package' },
  { value: 'coffee', icon: Coffee, label: 'Food' },
  { value: 'zap', icon: Zap, label: 'Utility' },
  { value: 'shield', icon: Shield, label: 'Security' },
  { value: 'bike', icon: Bike, label: 'Mobility' },
  { value: 'monitor', icon: Monitor, label: 'Productivity' },
  { value: 'utensils', icon: Utensils, label: 'Dining' },
  { value: 'wifi', icon: Wifi, label: 'Internet' },
  { value: 'droplets', icon: Droplets, label: 'Laundry' },
  { value: 'car', icon: Car, label: 'Parking' },
  { value: 'home', icon: Home, label: 'Cleaning' },
];

export function AddOnForm({ addOn, onClose, onSuccess }: AddOnFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAddOnData>({
    name: '',
    description: '',
    price: 0,
    billing_type: 'monthly',
    category: 'lifestyle',
    icon: 'package',
    is_popular: false,
    is_featured: false,
    is_active: true,
    sort_order: 0,
    max_per_tenant: 1,
  });

  useEffect(() => {
    if (addOn) {
      setFormData({
        name: addOn.name,
        description: addOn.description || '',
        price: addOn.price,
        billing_type: addOn.billing_type,
        category: addOn.category,
        icon: addOn.icon,
        is_popular: addOn.is_popular,
        is_featured: addOn.is_featured,
        is_active: addOn.is_active,
        sort_order: addOn.sort_order,
        max_per_tenant: addOn.max_per_tenant,
      });
    }
  }, [addOn]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'sort_order' || name === 'max_per_tenant') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (name: keyof CreateAddOnData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Add-on name is required');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required');
      return false;
    }
    if (formData.price > 100000) {
      toast.error('Price cannot exceed ₹1,00,000');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (addOn) {
        await addOnsApi.update(addOn.id, formData);
        toast.success('Add-on updated successfully');
      } else {
        await addOnsApi.create(formData);
        toast.success('Add-on created successfully');
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save add-on:', error);
      toast.error(error.message || 'Failed to save add-on');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icon = ICONS.find(i => i.value === iconName);
    return icon ? icon.icon : Package;
  };

  const IconComponent = getIconComponent(formData.icon!);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {addOn ? 'Edit Add-on' : 'Create New Add-on'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Premium Meal Plan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="2500"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this add-on provides"
                rows={2}
              />
            </div>
          </div>

          {/* Categorization */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Categorization</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-5 gap-2">
                  {ICONS.slice(0, 10).map((icon) => {
                    const Icon = icon.icon;
                    return (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
                        className={`p-2 rounded border ${
                          formData.icon === icon.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={icon.label}
                      >
                        <Icon className="h-4 w-4 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Billing Type</Label>
                <select
                  name="billing_type"
                  value={formData.billing_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BILLING_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Popular</Label>
                    <p className="text-sm text-gray-600">Show as popular</p>
                  </div>
                  <Switch
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => handleSwitchChange('is_popular', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Featured</Label>
                    <p className="text-sm text-gray-600">Highlight as featured</p>
                  </div>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Active</Label>
                    <p className="text-sm text-gray-600">Available for tenants</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="max_per_tenant">Max per Tenant</Label>
                  <Input
                    id="max_per_tenant"
                    name="max_per_tenant"
                    type="number"
                    min="1"
                    value={formData.max_per_tenant}
                    onChange={handleChange}
                    placeholder="1"
                  />
                  <p className="text-xs text-gray-600">Maximum subscriptions per tenant</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Display Order</Label>
                  <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={handleChange}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-600">Lower numbers appear first</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded">
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">{formData.name || "Add-on Name"}</h4>
                  <div className="flex gap-1 mt-1">
                    <Badge className="text-xs">
                      {CATEGORIES.find(c => c.value === formData.category)?.label}
                    </Badge>
                    {formData.is_popular && <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">
                  ₹{formData.price || "0"}
                  <span className="text-sm font-normal text-gray-600 ml-1">
                    /{formData.billing_type === 'one_time' ? 'one-time' : formData.billing_type}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{formData.description || "Description"}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {addOn ? 'Update Add-on' : 'Create Add-on'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}